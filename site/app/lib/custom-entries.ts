// A fund the person types on the index page (D44), and the securities accounts typed there before a deal took their place. Kept in the
// saved state, every figure an entered value object. In memory a fund becomes what the page already prices, a `FundRecord` of its kind
// (F-65), so no second calculation exists; `withCustomEntries` adds the funds to one copy of the bundle, which only the index page uses. A
// typed account is read back only to move it into a deal (the move, method §10.4; lib/deal-account/move.ts).
//
// No runtime import of invest.ts or the engine: state.ts reads this file on every page.
import { fundExchange, groupPrice, isShekel, isUnitPriceUnit, unitPriceUnits, valueObject, type ExposureRecord, type FundExchange, type FundRecord, type UnitPriceUnit, type ValueObject } from "@finance-tool/schema";
import type { ProviderInput } from "@finance-tool/engine";
import { invest as copy } from "../copy";
import type { CustomIndex, OptionId } from "./invest";
import { usDividendsOfTyped } from "./index-region";
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

/** Null: left empty, a fee not known, so the fund is listed without a price (`customFundGaps`). A foreign fund has one yearly charge, held in `fixed`. */
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
  /** A fund bought abroad: the exchange it trades on, as the person said; absent: not sure, and the exchange is the United States for a fund registered there and otherwise not known (F-65). */
  exchange?: FundExchange;
  /**
   * The currency the fund is bought in, from where the person said they buy it (`BUY_AT`): the shekel from its manager and in Tel Aviv, the
   * exchange's currency abroad; null: bought abroad on an exchange not said, so its currency is not known either (`fundCurrencyOf`).
   */
  tradesIn: TradingCurrency | null;
  /** A fund bought on an exchange: the price of one unit in its kind's unit (`unitPriceUnit`), dated the day it was typed; absent: not typed (F-109). */
  unitPrice?: ValueObject & { unit: UnitPriceUnit };
  added: string;
}

export type FundPayout = "accumulating" | "distributing";
/** Where a foreign fund is registered, among the answers the form offers; another country, or not sure, is null. */
export type FundDomicile = "IE" | "US";
/** The country question's answers that name a country (an Israeli fund is one of the Israeli kinds); null is "another country, or not sure". */
export type FundCountry = "IL" | FundDomicile;
export const COUNTRIES: readonly FundCountry[] = ["IL", "IE", "US"];
/** The currency a fund is bought in. */
type TradingCurrency = "ILS" | "USD" | "EUR";
export type FundTracking = "physical" | "swap" | "futures" | "mixed";
export type PerYear = 1 | 2 | 4 | 12;
export const PAYOUTS: readonly FundPayout[] = ["accumulating", "distributing"];
const DOMICILES: readonly FundDomicile[] = ["IE", "US"];
const TRACKINGS: readonly FundTracking[] = ["physical", "swap", "futures", "mixed"];
export const PER_YEAR: readonly PerYear[] = [1, 2, 4, 12];

/** Where the person buys the fund, the panel's first question: from its manager, on the Tel Aviv exchange, or abroad on an exchange in a currency. */
export type BuyAt = "manager" | "tase" | "us-usd" | "europe-eur" | "europe-usd" | "abroad";
export const BUY_IN_ISRAEL: readonly BuyAt[] = ["manager", "tase"];
export const BUY_ABROAD: readonly BuyAt[] = ["us-usd", "europe-eur", "europe-usd", "abroad"];
const BUY_AT_IDS: readonly BuyAt[] = [...BUY_IN_ISRAEL, ...BUY_ABROAD];

/**
 * What each answer says (F-65): the kinds of fund it can be (in Tel Aviv an Israeli ETF or a foreign fund, by the country it is registered
 * in), the exchange abroad and the currency it is bought in. "abroad" is "abroad, not sure where": no exchange, no currency.
 */
const BUY_AT: Record<BuyAt, { kinds: { israeli: OptionId | null; foreign: OptionId | null }; exchange: FundExchange | null; tradesIn: TradingCurrency | null }> = {
  manager: { kinds: { israeli: "il-tracking", foreign: null }, exchange: null, tradesIn: "ILS" },
  tase: { kinds: { israeli: "il-etf", foreign: "tase-foreign" }, exchange: null, tradesIn: "ILS" },
  "us-usd": { kinds: { israeli: null, foreign: "abroad" }, exchange: "us", tradesIn: "USD" },
  "europe-eur": { kinds: { israeli: null, foreign: "abroad" }, exchange: "europe", tradesIn: "EUR" },
  "europe-usd": { kinds: { israeli: null, foreign: "abroad" }, exchange: "europe", tradesIn: "USD" },
  abroad: { kinds: { israeli: null, foreign: "abroad" }, exchange: null, tradesIn: null },
};

/** The countries an answer leaves open: only Israel from the manager, every one but Israel abroad, and all of them in Tel Aviv. */
export const countriesAt = (at: BuyAt): readonly FundCountry[] => (BUY_AT[at].kinds.foreign === null ? ["IL"] : BUY_AT[at].kinds.israeli === null ? ["IE", "US"] : COUNTRIES);

/** The kind of fund the two answers make; an answer that leaves Israel as the only country is Israeli whatever the second says. */
function kindOf(at: BuyAt, country: FundCountry | null): OptionId {
  const { israeli, foreign } = BUY_AT[at].kinds;
  if (israeli && (country === "IL" || !foreign)) return israeli;
  if (foreign) return foreign;
  throw new Error(`BUY_AT.${at} names no kind of fund`);
}

/** The first question's answer a saved fund gave, read back from its kind, exchange and currency (`placeOf`). */
function buyAtOf(f: Pick<CustomFund, "kind" | "exchange" | "tradesIn">): BuyAt {
  const at = placeOf(f.kind, f.exchange ?? null, f.tradesIn);
  if (!at) throw new Error(`fund of kind ${f.kind} names no answer of BUY_AT: validCustomFunds keeps only funds one answer makes`);
  return at;
}

/** The country question's answer a saved fund gave: Israel for an Israeli kind, else the country it is registered in, or null. */
const countryOf = (f: Pick<CustomFund, "kind" | "domicile">): FundCountry | null => (isForeignKind(f.kind) ? f.domicile : "IL");
/**
 * How a typed fund's unit price is typed, by its kind (F-109): abroad in the fund's own currency (a unit price unit of scale one in that
 * currency, `unitPriceUnits`); on TASE in agorot, as TASE quotes a unit (ETF-92); none for a tracking fund, bought from its manager by
 * amount.
 */
const UNIT_PRICE_BY_KIND = { abroad: "fund-currency", "il-etf": "agorot", "tase-foreign": "agorot", "il-tracking": null } as const satisfies Record<OptionId, "fund-currency" | UnitPriceUnit | null>;

/** The unit price unit that is a whole amount of a currency (`unitPriceUnits`, scale one); null where none is. */
function unitOfCurrency(code: string): UnitPriceUnit | null {
  for (const [u, read] of Object.entries(unitPriceUnits)) if (read.code === code && read.scale === 1 && isUnitPriceUnit(u)) return u;
  return null;
}

const BROKER_ID = /^custom-broker-[a-z0-9-]+$/;
const FUND_ID = /^custom-fund-[a-z0-9-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: readonly OptionId[] = ["il-tracking", "il-etf", "tase-foreign", "abroad"];

export const NAME_MAX = 60;
export const isCustomFund = (rec: Pick<FundRecord, "id">) => rec.id.startsWith("custom-fund-");
/** A foreign fund has one yearly charge; an Israeli one its fixed and variable fees and the trustee's. */
export const isForeignKind = (k: OptionId) => k === "tase-foreign" || k === "abroad";

export const newFundId = () => newId("custom-fund-");

/**
 * The currency of a typed fund's record (F-65): an Israeli one the shekel; one bought abroad the currency the person said it is bought in
 * (`tradesIn`). Where they said none, which is the case of a foreign fund in Tel Aviv (bought in shekels; its own currency is not asked) and
 * of one bought abroad on an exchange not said, the fund's own currency is not known, and the run stands it in by its index's currency,
 * the dollar where the index is in shekels or is one the person added (as the page's generic fund abroad): a stand-in until the panel asks
 * it.
 */
function fundCurrencyOf(kind: OptionId, tradesIn: TradingCurrency | null, currencyOfIndex: string | null): string {
  if (!isForeignKind(kind)) return "NIS";
  if (kind === "abroad" && tradesIn && tradesIn !== "ILS") return tradesIn;
  return currencyOfIndex && !isShekel(currencyOfIndex) ? currencyOfIndex : "USD";
}

/**
 * The unit a typed fund's unit price is typed in (`UNIT_PRICE_BY_KIND`): abroad the fund's currency (`fundCurrencyOf`), on TASE agorot;
 * null where it is bought by amount, or is in a currency no unit price unit is an amount of.
 */
function unitPriceUnit(kind: OptionId, fundCurrency: string): UnitPriceUnit | null {
  const how = UNIT_PRICE_BY_KIND[kind];
  return how === "fund-currency" ? unitOfCurrency(fundCurrency) : how;
}

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
    // every answer is the shape the panel saves, or the entry is left out: a payout, a country, a way of following the index, null where
    // not said
    const payout = f.payout === null ? null : PAYOUTS.includes(f.payout as FundPayout) ? (f.payout as FundPayout) : undefined;
    const yieldPct = payout === "distributing" ? figure(f.yield, "pct_per_year", 100) : null;
    const perYear = payout === "distributing" && f.perYear !== null ? (PER_YEAR.includes(f.perYear as PerYear) ? (f.perYear as PerYear) : undefined) : null;
    const domicile = f.domicile === null ? null : foreign && DOMICILES.includes(f.domicile as FundDomicile) ? (f.domicile as FundDomicile) : undefined;
    const tracking = f.tracking === null ? null : TRACKINGS.includes(f.tracking as FundTracking) ? (f.tracking as FundTracking) : undefined;
    if (payout === undefined || yieldPct === undefined || perYear === undefined || domicile === undefined || tracking === undefined) continue;
    // where it is bought: the kind, the exchange and the currency are one of the panel's answers (`BUY_AT`)
    const exchange = f.exchange === undefined ? null : fundExchange.safeParse(f.exchange).data;
    const at = exchange === undefined ? null : placeOf(kind, exchange, f.tradesIn);
    if (!at) continue;
    // a unit price in a unit its kind is not typed in, or not a price, is not read, and the fund is kept, bought by amount
    const unitPrice = unitPriceFrom(kind, f.unitPrice);
    out.push({ id: f.id, name: f.name, number: typeof f.number === "string" && f.number ? f.number : null, indexId: f.indexId, kind, fixed, variable: foreign ? null : variable, trustee: foreign ? null : trustee, hedged: f.hedged, ...(f.shekelIndex === true && !f.hedged ? { shekelIndex: true as const } : {}), payout, yield: yieldPct, perYear, domicile, tracking, ...(BUY_AT[at].exchange ? { exchange: BUY_AT[at].exchange } : {}), tradesIn: BUY_AT[at].tradesIn, ...(unitPrice ? { unitPrice } : {}), added: f.added });
  }
  return out;
}

/** The answer to where a fund is bought that its kind, exchange and currency make (`BUY_AT`); null where no answer makes them. */
function placeOf(kind: OptionId, exchange: FundExchange | null, tradesIn: unknown): BuyAt | null {
  return BUY_AT_IDS.find((a) => (BUY_AT[a].kinds.israeli === kind || BUY_AT[a].kinds.foreign === kind) && BUY_AT[a].exchange === exchange && BUY_AT[a].tradesIn === tradesIn) ?? null;
}

/** A saved unit price, where it is a price above zero in a unit the fund's kind is typed in for some currency (`unitPriceUnit`); else null. */
function unitPriceFrom(kind: OptionId, raw: unknown): CustomFund["unitPrice"] | null {
  const unit = isObj(raw) ? raw.unit : undefined;
  if (!isUnitPriceUnit(unit) || unitPriceUnit(kind, unitPriceUnits[unit].code) !== unit) return null;
  const read = figure(raw, unit, ANY_SUM);
  return read && read.value !== 0 ? { ...read, unit } : null;
}

// ---------------------------------------------------------------- what a person typed

export interface FundDraft {
  name: string;
  number: string;
  /** Null: not answered yet; saving asks for it. */
  buyAt: BuyAt | null;
  /** Null: another country, or not sure. Where the answer to `buyAt` leaves one country (`countriesAt`), that one. */
  country: FundCountry | null;
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
  tracking: FundTracking | null;
  /** As typed, with the unit it was typed in (`unitPriceUnit` of the kind it was typed for); null: not typed. */
  unitPrice: DraftUnitPrice | null;
}

export interface DraftUnitPrice {
  value: number;
  unit: UnitPriceUnit;
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

/**
 * A saved fund's draft, or a new one: `start` the first question's two answers it opens with (the panel's "save and add another" keeps
 * them); `israeliIndex`: a fund on an Israeli index has no currency to neutralise, so it starts and stays unhedged.
 */
export const fundDraftOf = (f: CustomFund | null, start: { buyAt: BuyAt | null; country: FundCountry | null } = { buyAt: null, country: null }, israeliIndex = false): FundDraft =>
  f
    ? { name: f.name, number: f.number ?? "", buyAt: buyAtOf(f), country: countryOf(f), fixed: numberOf(f.fixed), variable: numberOf(f.variable), trustee: numberOf(f.trustee), hedged: f.hedged, shekelIndex: f.shekelIndex === true, payout: f.payout, yield: numberOf(f.yield), perYear: f.perYear, tracking: f.tracking, unitPrice: draftPriceOf(f.unitPrice) }
    : { name: "", number: "", ...start, fixed: null, variable: null, trustee: null, hedged: israeliIndex ? false : null, shekelIndex: false, payout: null, yield: null, perYear: null, tracking: null, unitPrice: null };

/** The kind a draft makes, or null before the first question is answered. */
export const draftKind = (d: Pick<FundDraft, "buyAt" | "country">): OptionId | null => (d.buyAt ? kindOf(d.buyAt, d.country) : null);

/** The unit a draft's unit price is typed in (`unitPriceUnit`); null before its kind is known, or where it is bought by amount. */
export function draftPriceUnit(d: Pick<FundDraft, "buyAt" | "country">, currencyOfIndex: string | null): UnitPriceUnit | null {
  const kind = draftKind(d);
  return d.buyAt && kind ? unitPriceUnit(kind, fundCurrencyOf(kind, BUY_AT[d.buyAt].tradesIn, currencyOfIndex)) : null;
}

function draftPriceOf(v: CustomFund["unitPrice"]): DraftUnitPrice | null {
  const value = v ? numberOf(v) : null;
  return v && value !== null ? { value, unit: v.unit } : null;
}

/**
 * The draft with another answer to where it is bought or where it is registered: a country the new answer closes gives way to the one it
 * leaves (Israel from the manager), or to "not sure"; a unit price typed in another unit than the new one's is not a price in it, and is
 * cleared (F-109).
 */
export function draftWithPlace(d: FundDraft, place: { buyAt: BuyAt; country: FundCountry | null }, currencyOfIndex: string | null): FundDraft {
  const open = countriesAt(place.buyAt);
  const [first] = open;
  const country = open.length === 1 && first ? first : place.country && open.includes(place.country) ? place.country : null;
  const next = { ...d, buyAt: place.buyAt, country };
  return { ...next, unitPrice: d.unitPrice?.unit === draftPriceUnit(next, currencyOfIndex) ? d.unitPrice : null };
}

export type EntryError = "name-empty" | "name-taken" | "hedged-none" | "place-none";

/** A name is required and not taken by another fund of the index; where it is bought and a currency answer are required. A typed number is checked by its own field. */
export function fundErrors(d: FundDraft, others: readonly { id: string; name: string }[], id: string | null): EntryError[] {
  const out: EntryError[] = [];
  const name = norm(d.name);
  if (!name) out.push("name-empty");
  else if (others.some((x) => x.id !== id && norm(x.name) === name)) out.push("name-taken");
  if (d.hedged === null) out.push("hedged-none");
  if (d.buyAt === null) out.push("place-none");
  return out;
}

const vo = (v: number | null, unit: ValueObject["unit"], today: string, about: string): ValueObject | null => (v === null ? null : entered(v, unit, today, about));

/**
 * A draft whose first question is answered (`fundErrors` holds a save until it is), as the fund it saves. `currencyOfIndex`: the currency
 * of the index the fund is on, which stands in for a foreign fund's own currency where the person said none (`fundCurrencyOf`), and so sets
 * the unit its unit price is typed in (`unitPriceUnit`). A unit price typed in another unit is not a price in this one, and is not saved.
 * `before`: the fund as saved, whose unit price keeps its date where its value is the same (F-65: dated the day it was typed).
 */
export function fundFromDraft(d: FundDraft & { buyAt: BuyAt }, id: string, indexId: string, today: string, currencyOfIndex: string | null = null, before: CustomFund | null = null): CustomFund {
  const w = c.fields;
  const kind = kindOf(d.buyAt, d.country);
  const at = BUY_AT[d.buyAt];
  const foreign = isForeignKind(kind);
  const priceUnit = draftPriceUnit(d, currencyOfIndex);
  const typed = priceUnit && d.unitPrice && d.unitPrice.unit === priceUnit && d.unitPrice.value !== 0 ? { value: d.unitPrice.value, unit: priceUnit } : null;
  const kept = typed && before?.unitPrice && before.unitPrice.unit === typed.unit && before.unitPrice.value === typed.value ? before.unitPrice : null;
  return {
    id,
    name: norm(d.name).slice(0, NAME_MAX),
    number: norm(d.number) || null,
    indexId,
    kind,
    fixed: vo(d.fixed, "pct_per_year", today, foreign ? w.yearly : w.fixed),
    variable: foreign ? null : vo(d.variable, "pct_per_year", today, w.variable),
    trustee: foreign ? null : vo(d.trustee, "pct_per_year", today, w.trustee),
    hedged: d.hedged === true,
    ...(d.shekelIndex && d.hedged !== true ? { shekelIndex: true as const } : {}),
    payout: d.payout,
    yield: d.payout === "distributing" ? vo(d.yield, "pct_per_year", today, w.yield) : null,
    perYear: d.payout === "distributing" ? d.perYear : null,
    domicile: foreign && d.country !== "IL" ? d.country : null,
    tracking: d.tracking,
    ...(at.exchange ? { exchange: at.exchange } : {}),
    tradesIn: at.tradesIn,
    ...(typed ? { unitPrice: kept ?? { ...entered(typed.value, typed.unit, today, w.unitPrice), unit: typed.unit } } : {}),
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
  // a unit price left empty stops no price: the fund is bought by amount (F-109), so it is not among what is not known
  if (f.unitPrice) shown.push({ id: "unitPrice", word: w.unitPrice, figures: [{ before: null, value: asSite(f.unitPrice) }] });
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
 * A fund as the record of its kind, with what the person said of it and nothing more: a payout not said is null, and the page lists the
 * fund without a price. Its currency is `fundCurrencyOf`'s: the one it is bought in abroad, as the person said it. An empty fee stays empty:
 * a fee not known, so the fund has no price (`customFundGaps`).
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
    currency: fundCurrencyOf(f.kind, f.tradesIn, currencyOfIndex),
    trading_currency_on_tase: f.kind === "abroad" ? null : "NIS",
    distribution_policy: f.payout,
    // TXS-14, F-04: whether a typed Israeli fund is a foreign-investment fund is not known (no document of it was read), so its status is
    // null and, on an index in a foreign currency, it is run under both readings of TXS OQ26, as a collected fund whose status is not known
    tax_status: { il_fund_tax_track: foreign ? null : "exempt", ...(foreign ? {} : { foreign_investment_fund: notKnownStatus(f.added) }) },
    fees: { fixed_management: f.fixed, variable_management: foreign ? null : f.variable, trustee: foreign ? null : f.trustee, tracking_difference_12m: null, median_spread: null, fund_level_withholding_drag: null },
    dimensions: {},
    prospectus: { url: "local", date: null },
    ...(f.hedged ? { hedged: true } : {}),
    ...(f.payout === "distributing" && f.yield && f.perYear ? { distribution: { yield: f.yield, per_year: f.perYear } } : {}),
    ...(f.tracking ? { replication: { method: f.tracking, source: { url: "local", checked: f.added } } } : {}),
    // F-65, F-109, F-128: the exchange abroad as the person said it; not said, a fund registered in the United States is listed there
    // (ETF-93); any other is not known, its issuer not known either (ETF-95: Irish law does not fix the market). The unit price as they
    // typed it
    ...(f.kind === "abroad" && (f.exchange || f.domicile !== "US") ? { exchange: f.exchange ?? ("unknown" as const) } : {}),
    ...(f.unitPrice ? { share_price: f.unitPrice } : {}),
    snapshot: f.added,
  };
}

/**
 * The currency a typed fund is bought in where the person said it: a fund bought abroad on an exchange they named, in that exchange's
 * currency; null where the record's currency stands in for one not known (`fundCurrencyOf`) or is the shekel.
 */
export const saidCurrencyOf = (rec: Pick<FundRecord, "trading_currency_on_tase" | "exchange" | "currency">): string | null =>
  rec.trading_currency_on_tase === null && (rec.exchange === "us" || rec.exchange === "europe") && !isShekel(rec.currency) ? rec.currency : null;

/**
 * Why a fund the person typed has no price, every reason, from what they said of it, in the order the page names the first (its row says
 * one); none: nothing they left out stops it. The page and the panel's checklist both read it.
 */
export type CustomFundGap = "fee-unknown" | "tase-country-unknown" | "payout-unknown" | "need-yield" | "domicile-unknown" | "no-hedge-entered";
export function customFundGaps(rec: FundRecord): CustomFundGap[] {
  const out: CustomFundGap[] = [];
  const known = rec.domicile === "IL" || rec.domicile === "IE" || rec.domicile === "US";
  // a fee left empty is not known (D56): a foreign fund has its one yearly charge, an Israeli one its three fees
  const fees = rec.domicile === "IL" ? [rec.fees.fixed_management, rec.fees.variable_management, rec.fees.trustee] : [rec.fees.fixed_management];
  if (fees.some((v) => !v)) out.push("fee-unknown");
  // in Tel Aviv the country decides whether the fund is an Israeli ETF or a foreign fund, which are taxed apart (F-04): not known, no price
  if (rec.trading_currency_on_tase !== null && !known) out.push("tase-country-unknown");
  if (rec.distribution_policy === null) out.push("payout-unknown");
  if (rec.hedged === true) out.push("no-hedge-entered");
  if (rec.distribution_policy === "distributing") {
    // the foreign tax withheld on a distribution is known for a fund registered in Ireland or the United States only (F-20)
    if (!known && rec.trading_currency_on_tase === null) out.push("domicile-unknown");
    if (!rec.distribution) out.push("need-yield");
  }
  return out;
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
  /**
   * What a fund on a custom index needs of its index: no exposure record exists for one (F-65). Its currency is not known: a foreign one
   * stands in, which a fund bought in a foreign currency replaces with its own (invest.ts `exposureOf`). F-107's inputs where the person
   * said the index is of US companies and typed its yield (`usDividendsOfTyped`).
   */
  exposures: Record<string, Pick<ExposureRecord, "id" | "cash_like" | "currency"> & Partial<Pick<ExposureRecord, "us_dividends">>>;
  /** The person's funds whose index they said is in shekels: each runs on a shekel index and carries no currency label. */
  shekelFunds: string[];
}

// an index the person added says nothing of its currency: a foreign one in dollars, as the page's generic fund abroad; a fund whose index
// they said is in shekels runs on a shekel index of its own (shekelFunds, read by fundSpec)
const customExposures = (indices: readonly CustomIndex[]): EnteredInBundle["exposures"] =>
  Object.fromEntries(
    indices.map((i) => {
      const us = usDividendsOfTyped(i);
      return [i.id, { id: i.id, cash_like: false, currency: "USD", ...(us ? { us_dividends: us } : {}) }];
    }),
  );

/** The currency of the index a typed fund is on: a collected index's, else a custom one's (`customExposures`); null where neither holds it. */
const indexCurrencyOf = (bundle: Pick<IndicesBundle, "exposures">, exposures: EnteredInBundle["exposures"], f: CustomFund): string | null =>
  bundle.exposures.find((e) => e.id === f.indexId)?.currency ?? exposures[f.indexId]?.currency ?? null;

/**
 * The person's funds as the page reads them: a unit price in another unit than the one the fund is typed in at its currency
 * (`unitPriceUnit`, `fundCurrencyOf`; a price in dollars on a fund that stands in its euro index's currency) is not read, and the fund is
 * bought by amount, as on a reload (`validCustomFunds`). The same array where every price fits.
 */
export function fundsAsRead(bundle: Pick<IndicesBundle, "exposures">, funds: readonly CustomFund[], indices: readonly CustomIndex[] = []): readonly CustomFund[] {
  const exposures = customExposures(indices);
  const fits = (f: CustomFund) => !f.unitPrice || f.unitPrice.unit === unitPriceUnit(f.kind, fundCurrencyOf(f.kind, f.tradesIn, indexCurrencyOf(bundle, exposures, f)));
  if (funds.every(fits)) return funds;
  return funds.map((f) => {
    if (fits(f)) return f;
    const read = { ...f };
    delete read.unitPrice;
    return read;
  });
}

/** The bundle with the person's funds in it, as read (`fundsAsRead`). Nothing entered: the same object, so the page prices nothing again. */
export function withCustomEntries(bundle: IndicesBundle, typedFunds: readonly CustomFund[], indices: readonly CustomIndex[] = []): IndicesBundle {
  if (typedFunds.length === 0) return bundle;
  const funds = fundsAsRead(bundle, typedFunds, indices);
  const exposures = customExposures(indices);
  const currencyOf = (f: CustomFund) => indexCurrencyOf(bundle, exposures, f);
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
