// A broker and a fund the person types on the index page (D44, founder 2026-10-31: "a deal by arguing with some broker"). Kept in the saved
// state, every figure an entered value object. In memory they become what the page already prices: a broker a fee snapshot with no lines
// and an entered tariff (F-63, level "entered"), a fund a `FundRecord` of its kind (F-65), so no second calculation exists.
// `withCustomEntries` adds them to one copy of the bundle, which only the index page uses.
//
// No runtime import of invest.ts or the engine: state.ts reads this file on every page.
import { groupPrice, valueObject, type ExposureRecord, type FeesSnapshot, type FundRecord, type ValueObject } from "@finance-tool/schema";
import type { EnteredTariff, ProviderInput } from "@finance-tool/engine";
import { invest as copy } from "../copy";
import type { CustomIndex, OptionId } from "./invest";
import { groupInputs, layeredOf, type BrokerBase, type GroupCopy } from "./own-account";
import type { WorkbenchBundle } from "./providers";
import { entered, type SiteValue } from "./value";

const c = copy.customEntries;

// ---------------------------------------------------------------- what the state holds

/**
 * Null: left empty, which counts as zero (the row says so). In an account built on a house (`base`, F-101) it means "as the base": the house's
 * price list, with the group's prices over it where the account started from a group; only what the person typed is theirs.
 */
export interface CustomBroker {
  id: string;
  name: string;
  added: string;
  /** Percent of each trade, buy and sell alike. */
  tradePct: ValueObject | null;
  /** Shekels per trade. */
  tradeMin: ValueObject | null;
  /** Percent of the balance a year. */
  custodyPct: ValueObject | null;
  /** Shekels a month. */
  custodyMin: ValueObject | null;
  /** Percent of each conversion. */
  fxPct: ValueObject | null;
  /** Shekels a month. */
  monthlyFee: ValueObject | null;
  sells: { israeli: boolean; abroad: boolean };
  /**
   * 2026-11-04: the house this account is built on and, when it started from one, the group or offer whose prices were copied in. Absent in an
   * entry typed from scratch, which is read exactly as before.
   */
  base?: BrokerBase;
  /** With a `base` that has a group: how many years the group's prices hold, then the house's price list follows; null or absent: the whole plan. */
  untilYears?: number | null;
}

/** Null: left empty, which counts as zero. A foreign fund has one yearly charge, held in `fixed`. */
export interface CustomFund {
  id: string;
  name: string;
  /** As typed: shown, never linked (the site cannot say it exists). */
  number: string | null;
  /** The index it was added on: an exposure id, or a custom index's id. */
  indexId: string;
  kind: OptionId;
  fixed: ValueObject | null;
  variable: ValueObject | null;
  trustee: ValueObject | null;
  hedged: boolean;
  added: string;
}

const BROKER_ID = /^custom-broker-[a-z0-9-]+$/;
const FUND_ID = /^custom-fund-[a-z0-9-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: readonly OptionId[] = ["il-tracking", "il-etf", "tase-foreign", "abroad"];

export const NAME_MAX = 60;
export const isCustomBrokerId = (id: string) => id.startsWith("custom-broker-");
export const isCustomFund = (rec: Pick<FundRecord, "id">) => rec.id.startsWith("custom-fund-");
/** A foreign fund has one yearly charge; an Israeli one its fixed and variable fees and the trustee's. */
export const isForeignKind = (k: OptionId) => k === "tase-foreign" || k === "abroad";

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`;
export const newBrokerId = () => newId("custom-broker-");
export const newFundId = () => newId("custom-fund-");

// ---------------------------------------------------------------- reading it back

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** `undefined`: the field is not a figure of this shape, so the entry is left out. */
function figure(raw: unknown, unit: ValueObject["unit"], max: number): ValueObject | null | undefined {
  if (raw === null || raw === undefined) return null;
  const r = valueObject.safeParse(raw);
  if (!r.success || r.data.state !== "entered" || r.data.unit !== unit) return undefined;
  const v = r.data.value;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max) return undefined;
  // the schema knows no `about`: kept, so the sheet of a figure still says what it is after a reload
  const about = isObj(raw) && typeof raw.about === "string" ? raw.about : undefined;
  return about ? ({ ...r.data, about } as ValueObject) : r.data;
}

const ANY_SUM = Number.MAX_SAFE_INTEGER;

const HOUSE_ID = /^[a-z0-9-]+$/;
const GROUP_KINDS = ["young", "soldier", "released", "student", "salary", "other"] as const;

/** `null`: no base (an entry from scratch); `undefined`: a base that is not the shape of one, so the entry is left out. */
function baseFrom(raw: unknown): BrokerBase | null | undefined {
  if (raw === undefined || raw === null) return null;
  if (!isObj(raw) || typeof raw.houseId !== "string" || !HOUSE_ID.test(raw.houseId) || typeof raw.houseName !== "string" || !raw.houseName.trim()) return undefined;
  let group: GroupCopy | null = null;
  if (raw.group !== null && raw.group !== undefined) {
    const g = raw.group;
    if (!isObj(g) || typeof g.name !== "string" || !g.name.trim() || !GROUP_KINDS.includes(g.kind as never) || typeof g.snapshot !== "string" || !DATE.test(g.snapshot) || !Array.isArray(g.prices) || g.prices.length === 0) return undefined;
    const prices = g.prices.map((p) => groupPrice.safeParse(p));
    if (prices.some((p) => !p.success)) return undefined;
    const kept = prices.map((p) => (p as { data: GroupCopy["prices"][number] }).data);
    // the fees whose price the person chose to use (own-account.ts, `GroupCopy.adopted`): only fees of the group's own prices count; an older entry has none
    const wanted = Array.isArray(g.adopted) ? (g.adopted as unknown[]) : [];
    const adopted = kept.map((p) => p.fee).filter((f, i, all) => wanted.includes(f) && all.indexOf(f) === i);
    group = { name: g.name, kind: g.kind as GroupCopy["kind"], snapshot: g.snapshot, prices: kept, ...(adopted.length ? { adopted } : {}) };
  }
  return { houseId: raw.houseId, houseName: raw.houseName, group };
}

/** `null`: the whole plan; `undefined`: not a number of years, so the entry is left out. */
function untilFrom(raw: unknown): number | null | undefined {
  if (raw === undefined || raw === null) return null;
  return typeof raw === "number" && Number.isFinite(raw) && raw > 0 && raw <= 100 ? raw : undefined;
}

/** The custom brokers of a document that pass the check; a bad entry is left out, never a reason to refuse the file. */
export function validCustomBrokers(list: unknown[]): CustomBroker[] {
  const out: CustomBroker[] = [];
  for (const b of list) {
    if (!isObj(b) || typeof b.id !== "string" || !BROKER_ID.test(b.id) || typeof b.name !== "string" || !b.name.trim() || typeof b.added !== "string" || !DATE.test(b.added) || out.some((x) => x.id === b.id)) continue;
    const tradePct = figure(b.tradePct, "pct_of_trade", 100);
    const tradeMin = figure(b.tradeMin, "nis_per_trade", ANY_SUM);
    const custodyPct = figure(b.custodyPct, "pct_per_year", 100);
    const custodyMin = figure(b.custodyMin, "nis_per_month", ANY_SUM);
    const fxPct = figure(b.fxPct, "pct_of_trade", 100);
    const monthlyFee = figure(b.monthlyFee, "nis_per_month", ANY_SUM);
    if (tradePct === undefined || tradeMin === undefined || custodyPct === undefined || custodyMin === undefined || fxPct === undefined || monthlyFee === undefined) continue;
    const s = b.sells;
    if (!isObj(s) || typeof s.israeli !== "boolean" || typeof s.abroad !== "boolean" || (!s.israeli && !s.abroad)) continue;
    const base = baseFrom(b.base);
    const untilYears = untilFrom(b.untilYears);
    if (base === undefined || untilYears === undefined) continue;
    out.push({ id: b.id, name: b.name, added: b.added, tradePct, tradeMin, custodyPct, custodyMin, fxPct, monthlyFee, sells: { israeli: s.israeli, abroad: s.abroad }, ...(base ? { base } : {}), ...(base && untilYears !== null ? { untilYears } : {}) });
  }
  return out;
}

/** The custom funds of a document that pass the check; a bad entry is left out, never a reason to refuse the file. */
export function validCustomFunds(list: unknown[]): CustomFund[] {
  const out: CustomFund[] = [];
  for (const f of list) {
    if (!isObj(f) || typeof f.id !== "string" || !FUND_ID.test(f.id) || typeof f.name !== "string" || !f.name.trim() || typeof f.indexId !== "string" || !f.indexId || typeof f.added !== "string" || !DATE.test(f.added) || out.some((x) => x.id === f.id)) continue;
    if (!KINDS.includes(f.kind as OptionId) || typeof f.hedged !== "boolean" || (f.number !== null && f.number !== undefined && typeof f.number !== "string")) continue;
    const kind = f.kind as OptionId;
    const fixed = figure(f.fixed, "pct_per_year", 100);
    const variable = figure(f.variable, "pct_per_year", 100);
    const trustee = figure(f.trustee, "pct_per_year", 100);
    if (fixed === undefined || variable === undefined || trustee === undefined) continue;
    const foreign = isForeignKind(kind);
    out.push({ id: f.id, name: f.name, number: typeof f.number === "string" && f.number ? f.number : null, indexId: f.indexId, kind, fixed, variable: foreign ? null : variable, trustee: foreign ? null : trustee, hedged: f.hedged, added: f.added });
  }
  return out;
}

// ---------------------------------------------------------------- what a person typed

export interface BrokerDraft {
  name: string;
  tradePct: number | null;
  tradeMin: number | null;
  custodyPct: number | null;
  custodyMin: number | null;
  fxPct: number | null;
  monthlyFee: number | null;
  sellsIsraeli: boolean;
  sellsAbroad: boolean;
  /** An account built on a house (F-101): the house and, when started from one, the group; left out for one from scratch. */
  base?: BrokerBase | null;
  /** With a group: the years it holds, then the house's price list; null: the whole plan. */
  untilYears?: number | null;
}

export interface FundDraft {
  name: string;
  number: string;
  kind: OptionId;
  fixed: number | null;
  variable: number | null;
  trustee: number | null;
  hedged: boolean;
}

const num = (v: ValueObject | null | undefined): number | null => (v && typeof v.value === "number" ? v.value : null);
const norm = (s: string) => s.trim().replace(/\s+/g, " ");

export const brokerDraftOf = (b: CustomBroker | null): BrokerDraft =>
  b
    ? { name: b.name, tradePct: num(b.tradePct), tradeMin: num(b.tradeMin), custodyPct: num(b.custodyPct), custodyMin: num(b.custodyMin), fxPct: num(b.fxPct), monthlyFee: num(b.monthlyFee), sellsIsraeli: b.sells.israeli, sellsAbroad: b.sells.abroad, ...(b.base ? { base: b.base, untilYears: b.untilYears ?? null } : {}) }
    : { name: "", tradePct: null, tradeMin: null, custodyPct: null, custodyMin: null, fxPct: null, monthlyFee: null, sellsIsraeli: true, sellsAbroad: true };

export const fundDraftOf = (f: CustomFund | null, kind: OptionId): FundDraft =>
  f ? { name: f.name, number: f.number ?? "", kind: f.kind, fixed: num(f.fixed), variable: num(f.variable), trustee: num(f.trustee), hedged: f.hedged } : { name: "", number: "", kind, fixed: null, variable: null, trustee: null, hedged: false };

export type EntryError = "name-empty" | "name-taken" | "sells-none";

/** A name is required and not taken by another entry of the same list; a broker sells something. A typed number is checked by its own field. */
export function brokerErrors(d: BrokerDraft, others: readonly { id: string; name: string }[], id: string | null): EntryError[] {
  const out: EntryError[] = [];
  const name = norm(d.name);
  if (!name) out.push("name-empty");
  else if (others.some((x) => x.id !== id && norm(x.name) === name)) out.push("name-taken");
  if (!d.sellsIsraeli && !d.sellsAbroad) out.push("sells-none");
  return out;
}

export function fundErrors(d: FundDraft, others: readonly { id: string; name: string }[], id: string | null): EntryError[] {
  const name = norm(d.name);
  if (!name) return ["name-empty"];
  return others.some((x) => x.id !== id && norm(x.name) === name) ? ["name-taken"] : [];
}

const vo = (v: number | null, unit: ValueObject["unit"], today: string, about: string): ValueObject | null => (v === null ? null : entered(v, unit, today, about));

export function brokerFromDraft(d: BrokerDraft, id: string, today: string): CustomBroker {
  const w = c.fields;
  return {
    id,
    name: norm(d.name).slice(0, NAME_MAX),
    added: today,
    tradePct: vo(d.tradePct, "pct_of_trade", today, w.trade),
    tradeMin: vo(d.tradeMin, "nis_per_trade", today, w.tradeMin),
    custodyPct: vo(d.custodyPct, "pct_per_year", today, w.custody),
    custodyMin: vo(d.custodyMin, "nis_per_month", today, w.custodyMin),
    fxPct: vo(d.fxPct, "pct_of_trade", today, w.fx),
    monthlyFee: vo(d.monthlyFee, "nis_per_month", today, w.monthly),
    sells: { israeli: d.sellsIsraeli, abroad: d.sellsAbroad },
    ...(d.base ? { base: d.base, ...(d.untilYears != null && d.untilYears > 0 && d.base.group ? { untilYears: d.untilYears } : {}) } : {}),
  };
}

export function fundFromDraft(d: FundDraft, id: string, indexId: string, today: string): CustomFund {
  const w = c.fields;
  const foreign = isForeignKind(d.kind);
  return {
    id,
    name: norm(d.name).slice(0, NAME_MAX),
    number: norm(d.number) || null,
    indexId,
    kind: d.kind,
    fixed: vo(d.fixed, "pct_per_year", today, foreign ? w.yearly : w.fixed),
    variable: foreign ? null : vo(d.variable, "pct_per_year", today, w.variable),
    trustee: foreign ? null : vo(d.trustee, "pct_per_year", today, w.trustee),
    hedged: d.hedged,
    added: today,
  };
}

// ---------------------------------------------------------------- what the row says

/** A term of an entry for its row: the figures typed, and the words of what was left empty and so counts as zero. */
export interface EntryTerm {
  id: string;
  word: string;
  /** The figures of the term that were typed, with the word before each. */
  figures: { before: string | null; value: SiteValue }[];
}

const asSite = (v: ValueObject) => v as SiteValue;

export function brokerTerms(b: CustomBroker): { shown: EntryTerm[]; empty: string[] } {
  const w = c.fields;
  const parts: [string, string, ValueObject | null, ValueObject | null][] = [
    ["trade", w.trade, b.tradePct, b.tradeMin],
    ["custody", w.custody, b.custodyPct, b.custodyMin],
    ["fx", w.fx, b.fxPct, null],
    ["fixed", w.monthly, b.monthlyFee, null],
  ];
  const shown: EntryTerm[] = [];
  const empty: string[] = [];
  for (const [id, word, first, min] of parts) {
    if (first === null && min === null) empty.push(word);
    else shown.push({ id, word, figures: [...(first ? [{ before: null, value: asSite(first) }] : []), ...(min ? [{ before: first ? c.minWord : c.minWordAlone, value: asSite(min) }] : [])] });
  }
  return { shown, empty };
}

export function fundTerms(f: CustomFund): { shown: EntryTerm[]; empty: string[] } {
  const w = c.fields;
  const foreign = isForeignKind(f.kind);
  const parts: [string, string, ValueObject | null][] = foreign ? [["fixed", w.yearly, f.fixed]] : [["fixed", w.fixed, f.fixed], ["variable", w.variable, f.variable], ["trustee", w.trustee, f.trustee]];
  const shown: EntryTerm[] = [];
  const empty: string[] = [];
  for (const [id, word, v] of parts) {
    if (v === null) empty.push(word);
    else shown.push({ id, word, figures: [{ before: null, value: asSite(v) }] });
  }
  return { shown, empty };
}

// ---------------------------------------------------------------- to what the page prices

const IL_CLASSES = ["mutual_fund_units", "etf_units", "tase_foreign_fund_units"] as const;
const ABROAD_CLASSES = ["foreign_securities"] as const;

/**
 * A broker as a fee snapshot with no lines: the entered tariff is its whole price (F-63). `class: broker`: no tax or custody rule of this page reads more of it.
 * With `house`, an account built on it (F-101): the house's own record under the person's name, so its lines, availability and kind of house are the house's,
 * and what the person's row leaves to the house is read from them; its group prices, price-list notes and what is said against its binding documents stay on the house.
 */
export function snapshotOfBroker(b: CustomBroker, house?: FeesSnapshot): FeesSnapshot {
  const closed = (applies: readonly (typeof IL_CLASSES[number] | typeof ABROAD_CLASSES[number])[]) => ({ applies_to: [...applies], available: false, source: { url: "local", title: c.notSoldSource, checked: b.added } });
  const shut = [...(b.sells.israeli ? [] : [closed(IL_CLASSES)]), ...(b.sells.abroad ? [] : [closed(ABROAD_CLASSES)])];
  if (house) {
    const { provider, tariff, snapshot, missing, missing_reason, missing_reason_he, lines, averages, minimums, notice_rule_ids } = house;
    return { id: b.id, provider: { ...provider, name_he: b.name, part_of: undefined }, tariff, snapshot, missing, missing_reason, ...(missing_reason_he ? { missing_reason_he } : {}), lines, averages, minimums, notice_rule_ids, availability: [...(house.availability ?? []), ...shut] };
  }
  return {
    id: b.id,
    provider: { name_he: b.name, class: "broker", regulator: "ISA", tase_member: false, protection_rule_ids: [] },
    tariff: { url: "local", title: c.tariffTitle, published: null, format: "html" },
    snapshot: b.added,
    missing: false,
    missing_reason: null,
    lines: [],
    averages: [],
    minimums: { account_opening: null },
    notice_rule_ids: [],
    availability: shut,
  };
}

/**
 * The tariff the engine runs (F-63, level "entered"; docs/method.md, D44). An empty fee is zero. Custody is typed as a percent a year with a
 * minimum a month, so it is charged monthly at a twelfth of the year's percent, with the minimum as typed (F-14).
 */
export function tariffOfBroker(b: CustomBroker): EnteredTariff {
  const trade = { rate: (num(b.tradePct) ?? 0) / 100, ...(num(b.tradeMin) ? { min: num(b.tradeMin)! } : {}) };
  return {
    buy: trade,
    sell: { ...trade },
    custody: { rate: (num(b.custodyPct) ?? 0) / 100 / 12, everyMonths: 1, ...(num(b.custodyMin) ? { min: num(b.custodyMin)! } : {}) },
    fx: (num(b.fxPct) ?? 0) / 100,
    monthlyFee: num(b.monthlyFee) ?? 0,
  };
}

const isIls = (code: string) => code === "ILS" || code === "NIS";
/** No domicile is typed: a foreign fund's own country is not known, so no rule that reads one applies to it. */
const UNKNOWN_DOMICILE = "unknown";

/**
 * A fund as the record of its kind. It accumulates: the page prices a distributing fund only with a yield, and no yield is typed. A foreign
 * fund is in its index's currency, in dollars where the index is in shekels or is a custom one (as the page's generic fund abroad). An empty
 * fee is zero, as a figure in the entered state.
 */
export function recordOfFund(f: CustomFund, currencyOfIndex: string | null): FundRecord {
  const foreign = isForeignKind(f.kind);
  const zero = (v: ValueObject | null, about: string) => v ?? entered(0, "pct_per_year", f.added, about);
  const w = c.fields;
  return {
    id: f.id,
    names: { en: [], he: [f.name], tase: [] },
    identifiers: { isin: null, tase_number: f.number, cusip: null, ticker: {} },
    manager: "",
    domicile: foreign ? UNKNOWN_DOMICILE : "IL",
    // instrumentClassOf reads the two Israeli kinds from these words
    legal_form: foreign ? c.kinds[f.kind]! : copy.typeTags[f.kind]!,
    exposure_id: f.indexId,
    currency: foreign ? (currencyOfIndex && !isIls(currencyOfIndex) ? currencyOfIndex : "USD") : "NIS",
    trading_currency_on_tase: f.kind === "abroad" ? null : "NIS",
    distribution_policy: "accumulating",
    tax_status: { il_fund_tax_track: foreign ? null : "exempt", tase_foreign_fund_90pct_test: null },
    fees: { fixed_management: zero(f.fixed, foreign ? w.yearly : w.fixed), variable_management: foreign ? null : zero(f.variable, w.variable), trustee: foreign ? null : zero(f.trustee, w.trustee), tracking_difference_12m: null, median_spread: null, fund_level_withholding_drag: null },
    dimensions: {},
    prospectus: { url: "local", date: null },
    ...(f.hedged ? { hedged: true } : {}),
    snapshot: f.added,
  };
}

/** The figures a run on an entry rests on, for its provenance sheet: only what was typed. */
function inputsOf(terms: { shown: EntryTerm[] }, owner: string): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  for (const t of terms.shown) for (const x of t.figures) out[`${owner}: ${x.value.about ?? t.word}`] = x.value;
  return out;
}

export interface EnteredInBundle {
  tariffs: Record<string, EnteredTariff>;
  /** By broker id: an account built on a house (F-101) is priced on the house's own list tariff for each fund, so its tariff is built per run. */
  layered: Record<string, NonNullable<ProviderInput["layered"]>>;
  /** By broker or fund id: what its run's provenance sheet lists. */
  inputs: Record<string, Record<string, SiteValue>>;
  /** What a fund on a custom index needs of its index: no exposure record exists for one (F-65). */
  exposures: Record<string, Pick<ExposureRecord, "cash_like" | "currency">>;
}

/** The bundle with the person's entries in it. Nothing entered: the same object, so the page prices nothing again. */
export function withCustomEntries(bundle: WorkbenchBundle, brokers: readonly CustomBroker[], funds: readonly CustomFund[], indices: readonly CustomIndex[] = []): WorkbenchBundle {
  if (brokers.length === 0 && funds.length === 0) return bundle;
  const exposures: EnteredInBundle["exposures"] = Object.fromEntries(indices.map((i) => [i.id, { cash_like: false, currency: i.israeli ? "ILS" : "USD" }]));
  const currencyOf = (f: CustomFund) => bundle.exposures.find((e) => e.id === f.indexId)?.currency ?? exposures[f.indexId]?.currency ?? null;
  // an account built on a house that is still on the site is priced on that house's record; one whose house is gone keeps only what the person typed
  const houseOf = (b: CustomBroker) => (b.base ? bundle.snapshots.find((x) => x.id === b.base!.houseId && !isCustomBrokerId(x.id)) : undefined);
  const onHouse = brokers.filter((b) => houseOf(b));
  return {
    ...bundle,
    snapshots: [...bundle.snapshots, ...brokers.map((b) => snapshotOfBroker(b, houseOf(b)))],
    funds: [...bundle.funds, ...funds.map((f) => recordOfFund(f, currencyOf(f)))],
    entered: {
      tariffs: Object.fromEntries(brokers.filter((b) => !houseOf(b)).map((b) => [b.id, tariffOfBroker(b)])),
      layered: Object.fromEntries(onHouse.map((b) => [b.id, layeredOf(b)])),
      inputs: Object.fromEntries([...brokers.map((b) => [b.id, { ...(houseOf(b) ? groupInputs(b) : {}), ...inputsOf(brokerTerms(b), b.name) }] as const), ...funds.map((f) => [f.id, inputsOf(fundTerms(f), f.name)] as const)]),
      exposures,
    },
  };
}
