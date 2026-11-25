// A fund the person types on the index page (D44), and the securities accounts typed there before a deal took their place. Kept in the
// saved state, every figure an entered value object. In memory a fund becomes what the page already prices, a `FundRecord` of its kind
// (F-65), so no second calculation exists; `withCustomEntries` adds the funds to one copy of the bundle, which only the index page uses. A
// typed account is read back only to move it into a deal (the move, method §10.4; lib/deal-account/move.ts).
//
// No runtime import of invest.ts or the engine: state.ts reads this file on every page.
import { groupPrice, isShekel, valueObject, type ExposureRecord, type FundRecord, type ValueObject } from "@finance-tool/schema";
import type { ProviderInput } from "@finance-tool/engine";
import { invest as copy } from "../copy";
import type { CustomIndex, OptionId } from "./invest";
import type { BrokerBase, GroupCopy } from "./own-account";
import type { IndicesBundle } from "./providers";
import { entered, numberOf, type SiteValue } from "./value";
import { newId } from "./ids";

const c = copy.customEntries;

// ---------------------------------------------------------------- what the state holds

/**
 * A securities account typed on the index page, as the saved state and an older export file hold it until it moves into a deal (the move, method §10.4).
 * Null: left empty, a price not known (D56, silence is not zero) in an account typed from scratch; in an account built on a house (`base`,
 * F-101) it means "as the base": the house's price list, with the group's prices over it where the account started from a group.
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
   * the house this account is built on and, when it started from one, the group or offer whose prices were copied in. Absent in an
   * entry typed from scratch, which is read exactly as before.
   */
  base?: BrokerBase;
  /** With a `base` that has a group: how many years the group's prices hold, then the house's price list follows; null or absent: the whole plan. */
  untilYears?: number | null;
}

/** Null: left empty, a fee not known, so the fund is listed without a price (`customFundGap`). A foreign fund has one yearly charge, held in `fixed`. */
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
  /** On an index the person added: they said the index is in shekels, so the fund moves with no foreign currency (the
   *  question moved from the index to the fund). Never with a hedge. */
  shekelIndex?: true;
  /** What it does with dividends and interest, as the person said; null: not said, and the fund is listed without a price. */
  payout: FundPayout | null;
  /** A distributing fund's yield, percent a year, and the payments a year; null: not typed. */
  yield: ValueObject | null;
  perYear: PerYear | null;
  /** Where a foreign fund is registered; null: another country or not known (an Israeli fund is Israeli). */
  domicile: FundDomicile | null;
  /** How it follows its index; null: not said. A label only: no calculation reads it. */
  tracking: FundTracking | null;
  added: string;
}

export type FundPayout = "accumulating" | "distributing";
export type FundDomicile = "IE" | "US";
export type FundTracking = "physical" | "swap" | "futures" | "mixed";
export type PerYear = 1 | 2 | 4 | 12;
export const PAYOUTS: readonly FundPayout[] = ["accumulating", "distributing"];
export const DOMICILES: readonly FundDomicile[] = ["IE", "US"];
export const TRACKINGS: readonly FundTracking[] = ["physical", "swap", "futures", "mixed"];
export const PER_YEAR: readonly PerYear[] = [1, 2, 4, 12];

const BROKER_ID = /^custom-broker-[a-z0-9-]+$/;
const FUND_ID = /^custom-fund-[a-z0-9-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: readonly OptionId[] = ["il-tracking", "il-etf", "tase-foreign", "abroad"];

export const NAME_MAX = 60;
export const isCustomFund = (rec: Pick<FundRecord, "id">) => rec.id.startsWith("custom-fund-");
/** A foreign fund has one yearly charge; an Israeli one its fixed and variable fees and the trustee's. */
export const isForeignKind = (k: OptionId) => k === "tase-foreign" || k === "abroad";

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
    // the group's own current-account price (F-102): a whole number of months, or none
    const ca = isObj(g.currentAccount) && Number.isInteger(g.currentAccount.exemptMonths) && (g.currentAccount.exemptMonths as number) > 0 ? { exemptMonths: g.currentAccount.exemptMonths as number, ...caSource(g.currentAccount.source) } : null;
    group = { name: g.name, kind: g.kind as GroupCopy["kind"], snapshot: g.snapshot, prices: kept, ...(adopted.length ? { adopted } : {}), ...(ca ? { currentAccount: ca } : {}) };
  }
  return { houseId: raw.houseId, houseName: raw.houseName, group };
}

/** Where the group's current-account price is printed (F-102), kept for the row's sources; a copy without it, or with a malformed one, has none. */
function caSource(raw: unknown): { source?: { url: string; title: string; page?: number } } {
  if (!isObj(raw) || typeof raw.url !== "string" || !raw.url || typeof raw.title !== "string" || !raw.title) return {};
  const page = Number.isInteger(raw.page) && (raw.page as number) > 0 ? { page: raw.page as number } : {};
  return { source: { url: raw.url, title: raw.title, ...page } };
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
    // a fund saved before these were asked has none of them: each reads as not said
    const payout = PAYOUTS.includes(f.payout as FundPayout) ? (f.payout as FundPayout) : null;
    const yieldPct = payout === "distributing" ? figure(f.yield, "pct_per_year", 100) : null;
    if (yieldPct === undefined) continue;
    const perYear = payout === "distributing" && PER_YEAR.includes(f.perYear as PerYear) ? (f.perYear as PerYear) : null;
    const domicile = foreign && DOMICILES.includes(f.domicile as FundDomicile) ? (f.domicile as FundDomicile) : null;
    const tracking = TRACKINGS.includes(f.tracking as FundTracking) ? (f.tracking as FundTracking) : null;
    out.push({ id: f.id, name: f.name, number: typeof f.number === "string" && f.number ? f.number : null, indexId: f.indexId, kind, fixed, variable: foreign ? null : variable, trustee: foreign ? null : trustee, hedged: f.hedged, ...(f.shekelIndex === true && !f.hedged ? { shekelIndex: true as const } : {}), payout, yield: yieldPct, perYear, domicile, tracking, added: f.added });
  }
  return out;
}

// ---------------------------------------------------------------- what a person typed

export interface FundDraft {
  name: string;
  number: string;
  kind: OptionId;
  fixed: number | null;
  variable: number | null;
  trustee: number | null;
  /** Null: not chosen yet, on a foreign index; saving asks for it. On an Israeli index it is false and never asked. */
  hedged: boolean | null;
  /** On an index the person added: the third answer to the currency question, "המדד בשקלים" (hedged is then false). */
  shekelIndex: boolean;
  payout: FundPayout | null;
  yield: number | null;
  perYear: PerYear | null;
  domicile: FundDomicile | null;
  tracking: FundTracking | null;
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

/** `israeliIndex`: a fund on an Israeli index has no currency to neutralise, so it starts and stays unhedged. */
export const fundDraftOf = (f: CustomFund | null, kind: OptionId, israeliIndex = false): FundDraft =>
  f
    ? { name: f.name, number: f.number ?? "", kind: f.kind, fixed: numberOf(f.fixed), variable: numberOf(f.variable), trustee: numberOf(f.trustee), hedged: f.hedged, shekelIndex: f.shekelIndex === true, payout: f.payout, yield: numberOf(f.yield), perYear: f.perYear, domicile: f.domicile, tracking: f.tracking }
    : { name: "", number: "", kind, fixed: null, variable: null, trustee: null, hedged: israeliIndex ? false : null, shekelIndex: false, payout: null, yield: null, perYear: null, domicile: null, tracking: null };

export type EntryError = "name-empty" | "name-taken" | "hedged-none";

/** A name is required and not taken by another fund of the index; a currency answer is required. A typed number is checked by its own field. */
export function fundErrors(d: FundDraft, others: readonly { id: string; name: string }[], id: string | null): EntryError[] {
  const out: EntryError[] = [];
  const name = norm(d.name);
  if (!name) out.push("name-empty");
  else if (others.some((x) => x.id !== id && norm(x.name) === name)) out.push("name-taken");
  if (d.hedged === null) out.push("hedged-none");
  return out;
}

const vo = (v: number | null, unit: ValueObject["unit"], today: string, about: string): ValueObject | null => (v === null ? null : entered(v, unit, today, about));

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
    hedged: d.hedged === true,
    ...(d.shekelIndex && d.hedged !== true ? { shekelIndex: true as const } : {}),
    payout: d.payout,
    yield: d.payout === "distributing" ? vo(d.yield, "pct_per_year", today, w.yield) : null,
    perYear: d.payout === "distributing" ? d.perYear : null,
    domicile: foreign ? d.domicile : null,
    tracking: d.tracking,
    added: today,
  };
}

// ---------------------------------------------------------------- what the row says

/** A term of a fund for its row: the figures typed, and the words of what was left empty and so is not known. */
export interface EntryTerm {
  id: string;
  word: string;
  /** The figures of the term that were typed, with the word before each. */
  figures: { before: string | null; value: SiteValue }[];
}

const asSite = (v: ValueObject) => v as SiteValue;

/** A fund's terms: the fees typed, and the words of those left empty, which are not known (D56). */
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
  // a yield left empty is not zero: the fund then has no price, and its row says why
  if (f.payout === "distributing" && f.yield) shown.push({ id: "yield", word: w.yield, figures: [{ before: null, value: asSite(f.yield) }] });
  return { shown, empty };
}

// ---------------------------------------------------------------- to what the page prices

/** A typed Israeli fund's status as a foreign-investment fund (data-schema §3.5): not known, since the site read none of its documents. */
const notKnownStatus = (added: string): ValueObject => ({
  value: null,
  unit: "text",
  source: { url: "local", title: "הזנתם", publisher: "אתם", strength: "entered" },
  checked: added,
  effective_from: null,
  effective_to: null,
  update_rule: "provider-set",
  rule_ids: ["TXS-14"],
  state: "entered",
  notes: "a fund the person typed: the site read none of its documents, so whether it is a foreign-investment fund is not known (F-04)",
});

/** No domicile is typed: a foreign fund's own country is not known, so no rule that reads one applies to it. */
const UNKNOWN_DOMICILE = "unknown";

/**
 * A fund as the record of its kind, with what the person said of it and nothing more (it used to be taken as accumulating): a
 * payout not said is null, and the page lists the fund without a price. A foreign fund is in its index's currency, in dollars where the index
 * is in shekels or is a custom one (as the page's generic fund abroad). An empty fee stays empty: a fee not known, so the fund has no price
 * (`customFundGap`; #190, it was taken as zero and a fund with no fees typed went to the top).
 */
export function recordOfFund(f: CustomFund, currencyOfIndex: string | null): FundRecord {
  const foreign = isForeignKind(f.kind);
  return {
    id: f.id,
    names: { en: [], he: [f.name], tase: [] },
    identifiers: { isin: null, tase_number: f.number, cusip: null, ticker: {} },
    manager: "",
    domicile: foreign ? (f.domicile ?? UNKNOWN_DOMICILE) : "IL",
    // instrumentClassOf reads the two Israeli kinds from these words
    legal_form: foreign ? c.kinds[f.kind]! : copy.typeTags[f.kind]!,
    exposure_id: f.indexId,
    currency: foreign ? (currencyOfIndex && !isShekel(currencyOfIndex) ? currencyOfIndex : "USD") : "NIS",
    trading_currency_on_tase: f.kind === "abroad" ? null : "NIS",
    distribution_policy: f.payout,
    // TXS-14, F-04: whether a typed Israeli fund is a foreign-investment fund is not known (no document of it was read), so its status is
    // null and, on an index in a foreign currency, it is run under both readings of TXS OQ26, as a collected fund whose status is not known
    tax_status: { il_fund_tax_track: foreign ? null : "exempt", tase_foreign_fund_90pct_test: null, ...(foreign ? {} : { foreign_investment_fund: notKnownStatus(f.added) }) },
    fees: { fixed_management: f.fixed, variable_management: foreign ? null : f.variable, trustee: foreign ? null : f.trustee, tracking_difference_12m: null, median_spread: null, fund_level_withholding_drag: null },
    dimensions: {},
    prospectus: { url: "local", date: null },
    ...(f.hedged ? { hedged: true } : {}),
    ...(f.payout === "distributing" && f.yield && f.perYear ? { distribution: { yield: f.yield, per_year: f.perYear } } : {}),
    ...(f.tracking ? { replication: { method: f.tracking, source: { url: "local", checked: f.added } } } : {}),
    snapshot: f.added,
  };
}

/** Why a fund the person typed has no price, from what they said of it; null: nothing they left out stops it. The page and the panel's preview both read it. */
export type CustomFundGap = "fee-unknown" | "payout-unknown" | "need-yield" | "domicile-unknown" | "no-hedge-entered";
export function customFundGap(rec: FundRecord): CustomFundGap | null {
  // a fee left empty is not known (D56): a foreign fund has its one yearly charge, an Israeli one its three fees
  const fees = rec.domicile === "IL" ? [rec.fees.fixed_management, rec.fees.variable_management, rec.fees.trustee] : [rec.fees.fixed_management];
  if (fees.some((v) => !v)) return "fee-unknown";
  if (rec.distribution_policy === null) return "payout-unknown";
  if (rec.hedged === true) return "no-hedge-entered";
  if (rec.distribution_policy === "distributing") {
    // the foreign tax withheld on a distribution is known for a fund registered in Ireland or the United States only (F-20)
    if (rec.domicile !== "IL" && rec.domicile !== "IE" && rec.domicile !== "US") return "domicile-unknown";
    if (!rec.distribution) return "need-yield";
  }
  return null;
}

/** The figures a run on an entry rests on, for its provenance sheet: only what was typed. */
function inputsOf(terms: { shown: EntryTerm[] }, owner: string): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  for (const t of terms.shown) for (const x of t.figures) out[`${owner}: ${x.value.about ?? t.word}`] = x.value;
  return out;
}

export interface EnteredInBundle {
  /**
   * By account id: an account built on a house, priced on that house's list with its own prices over it (F-101), its tariff built per run.
   * No page fills it: the move tests price a typed account through it, their oracle for what it left before its move into a deal
   * (deal-account/move-fixtures.ts). `bases` likewise.
   */
  layered: Record<string, NonNullable<ProviderInput["layered"]>>;
  /** By account id: the house such an account stands on. It is priced where that house is, on that house's own reading of its price list, and nowhere else. */
  bases?: Record<string, string>;
  /** By account or fund id: what its run's provenance sheet lists. */
  inputs: Record<string, Record<string, SiteValue>>;
  /** What a fund on a custom index needs of its index: no exposure record exists for one (F-65). */
  exposures: Record<string, Pick<ExposureRecord, "cash_like" | "currency">>;
  /** The person's funds whose index they said is in shekels: each runs on a shekel index and carries no currency label. */
  shekelFunds: string[];
}

/** The bundle with the person's funds in it. Nothing entered: the same object, so the page prices nothing again. */
export function withCustomEntries(bundle: IndicesBundle, funds: readonly CustomFund[], indices: readonly CustomIndex[] = []): IndicesBundle {
  if (funds.length === 0) return bundle;
  // an index the person added says nothing of its currency: a foreign one in dollars, as the page's generic fund abroad; a fund
  // whose index they said is in shekels runs on a shekel index of its own (shekelFunds, read by fundSpec)
  const exposures: EnteredInBundle["exposures"] = Object.fromEntries(indices.map((i) => [i.id, { cash_like: false, currency: "USD" }]));
  const currencyOf = (f: CustomFund) => bundle.exposures.find((e) => e.id === f.indexId)?.currency ?? exposures[f.indexId]?.currency ?? null;
  const held = bundle.entered;
  return {
    ...bundle,
    funds: [...bundle.funds, ...funds.map((f) => recordOfFund(f, currencyOf(f)))],
    entered: {
      layered: held?.layered ?? {},
      ...(held?.bases ? { bases: held.bases } : {}),
      inputs: { ...(held?.inputs ?? {}), ...Object.fromEntries(funds.map((f) => [f.id, inputsOf(fundTerms(f), f.name)] as const)) },
      exposures: { ...(held?.exposures ?? {}), ...exposures },
      shekelFunds: [...(held?.shekelFunds ?? []), ...funds.filter((f) => f.shekelIndex).map((f) => f.id)],
    },
  };
}
