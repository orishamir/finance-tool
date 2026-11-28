// "השקעה במדד" (D28, spec 8dd1f013:research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses, the options for
// owning it, the cheapest broker for each option and the cheapest complete way (broker + fund) for the plan. Pure: the
// numbers come from the engine's provider workbench (F-63) and from the fund runs of F-65, over the indices bundle. No fee, rate or rule figure is written here: tariffs are snapshots, fund fees are fund records,
// exchange rates are the ECB's (D26). Nothing is chosen for the person (D27): an index is always an argument.
import { rankByValue } from "./rank";
import { gershayim } from "./format";
import { BlockedError, listingChangesRun, openReadings, type AccountKind, type DealRun, withRunMemo, STANDING_CONVERSION_BAND, STANDING_ORDER_BAND, beforeTax, calendarMonthOf, waitingReal, paidInAsEntered, dividendsOf, gapFromNet, insideTaxCaseOf, insideTaxEnds, netDeduction, shortfallBeyondFees, type InsideTax, type RateOf, buildTariff, comparedYears, gapListOf, type GapList, costByWho, countsCurrentAccount, gapToIndex, sumFees, trackingBeyondFees, variableForwardYears, providerWorkbench, isTie, securitiesBlockedBy, securitiesStopOf, tieThreshold, type ComparedProvider, type FeeLine, type Label, type LayeredRun, type NotComparableProvider, type ProviderRow, type SecuritiesStop, type TariffBuild } from "@finance-tool/engine";
import { assertNever, exchangeOfTicker, fundExchange, isShekel, type ExposureRecord, type FeesSnapshot, type FundExchange, type FundRecord } from "@finance-tool/schema";
import { invest as copy } from "../copy";
import { addedIndexCurrency, customFundGaps, isCustomFund, kindNotKnown, type AddedIndexCurrency, type FundKind } from "./custom-entries";
import { dealProviderOf, houseSnap, isDealProviderId } from "./deal-account/bundle";
import { feeIdsOf, missingOf } from "./deal-account/plan";
import { feeNameOf } from "./fee-deal/part-words";
import { aliasRows } from "./search-aliases";
import type { IndexFacts } from "./index-region";
import { fxRunInput, nisPer } from "./fx";
import { agreedClasses, houseSnapshots, instrumentClassOf, isFxToFx, fundRun, ruleContext, shortName, subjectOf, type FundAssumptions, type NotComparable, type IndicesBundle, type BundleSnapshot, type WorkbenchInputs } from "./providers";
import { computed, ownBy, ruleFigure, sumOf, type ExchangeLabel, type FlagIn, type SiteLabel, type SiteValue, type Strength } from "./value";
import { ACCOUNT_LINES, DISTRIBUTION_TAX, FUND_LINES, rulesOfRun, type FeeLines, type RunParts } from "./run-rules";
import { paidInWorking } from "./working";

// ---------------------------------------------------------------- the options

export type OptionId = "il-tracking" | "il-etf" | "tase-foreign" | "abroad";
export const OPTION_IDS: readonly OptionId[] = ["il-tracking", "il-etf", "tase-foreign", "abroad"];

/** The tariff class each option is priced in (spec §2); a fund is priced in its own class (`instrumentClassOf`). */
export const OPTION_CLASS: Record<OptionId, string> = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "tase_foreign_fund_units", abroad: "foreign_securities" };
/** The classes a snapshot's `availability` entry may name for the option. */
const AVAILABILITY_CLASSES: Record<OptionId, string[]> = { "il-tracking": ["mutual_fund_units"], "il-etf": ["etf_units"], "tase-foreign": ["etf_units", "tase_foreign_fund_units"], abroad: ["foreign_securities"] };
/**
 * The classes whose availability entries speak for this kind of fund at a house. A record with an entry of its own for the foreign funds
 * traded in Tel Aviv speaks for them through it alone, not through its entry for Israeli ETFs (One Zero sells no Israeli ETF and leaves the
 * foreign funds open, on a list it does not publish); other records answer for both through their ETF entry.
 */
function classesAt(s: FeesSnapshot | undefined, option: OptionId): string[] {
  if (option === "tase-foreign" && (s?.availability ?? []).some((a) => a.applies_to.includes("tase_foreign_fund_units"))) return ["tase_foreign_fund_units"];
  return AVAILABILITY_CLASSES[option];
}

/** The options an index has: an Israeli index only the Israeli funds (ETF-51, ETF-31). */
export const optionsOf = (israeli: boolean): OptionId[] => (israeli ? ["il-tracking", "il-etf"] : [...OPTION_IDS]);

/** The option a fund record belongs to (spec §2). */
export function optionOfFund(rec: FundRecord, exposure: ExposureRecord | undefined): OptionId {
  if (rec.domicile === "IL") return instrumentClassOf(rec, exposure) === "etf_units" ? "il-etf" : "il-tracking";
  return rec.trading_currency_on_tase ? "tase-foreign" : "abroad";
}

/**
 * The kind a fund's row names: its option's, except a typed fund in Tel Aviv whose country is not known, which is listed among the foreign
 * funds there (`optionOfFund`) but is not known to be one (F-04).
 */
const kindOfFund = (rec: FundRecord, option: OptionId): FundKind => (kindNotKnown(rec) ? "tase-unknown" : option);

export type Venue = FundExchange;
const EXCHANGES = fundExchange.options;
/** F-109 (D94): where a fund is bought, TASE or the exchange abroad it trades on. */
type Listing = NonNullable<DealRun["listing"]>;
const US_RE = /ארה["״]ב|ארצות הברית/;
const EU_RE = /אירופה|לונדון|London|LSE/;
const OUTSIDE_US_RE = /מחוץ לארה|למעט ארה/;
export const venueOfBand = (band: string | null | undefined): Venue | null => (!band ? null : OUTSIDE_US_RE.test(band) ? "europe" : US_RE.test(band) ? "us" : EU_RE.test(band) ? "europe" : null);

/**
 * The exchange a fund bought abroad trades on (F-65): the one a typed fund's record states; else the one its tickers name
 * (`exchangeOfTicker`, Europe before the United States); else the United States for a fund registered there, a typed fund whose exchange
 * was not said (ETF-93: a US ETF is listed on at least one US exchange; ETF OQ42: no source says only there). Null where none says: an Israeli
 * fund; a typed fund whose record says its exchange is not known (`exchange: "unknown"`), which every account reads on each exchange
 * (`Place` "unknown-exchange"); and a collected record with no exchange ticker registered outside the United States, which the data check
 * refuses (validate.ts `checkFundTickerExchange`), since no rule says where such a fund lists (ETF-95, ETF OQ42), so no page guesses it.
 */
export function venueOfFund(rec: FundRecord): Venue | null {
  if (rec.exchange !== undefined) return rec.exchange === "unknown" ? null : rec.exchange;
  const named = Object.keys(rec.identifiers.ticker ?? {}).map(exchangeOfTicker);
  if (named.includes("europe")) return "europe";
  if (named.includes("us")) return "us";
  return rec.domicile === "US" ? "us" : null;
}

// ---------------------------------------------------------------- the index

/** An index the person added (state.ts keeps it on the device), with what they said of it in a fund's panel (`IndexFacts`: its region and dividend yield, F-107). */
export interface CustomIndex extends IndexFacts {
  id: string;
  name: string;
  /** "לידיעתכם בלבד": shown in the header, never used (spec §1, 10.8). */
  currency?: string;
  added: string;
}

export interface IndexRef {
  id: string;
  name: string;
  israeli: boolean;
  exposure: ExposureRecord | null;
  custom: CustomIndex | null;
  oneLine: string | null;
  /**
   * An index the person added as one fund sees it (`indexSeenBy`): the foreign currency they said the fund is bought in, which its run
   * moves with, since the site does not know the index's own; absent where they said none.
   */
  boughtIn?: string;
}

/** Every exposure record that is an equity index, in file order. */
export function knownIndices(bundle: Pick<IndicesBundle, "exposures">): IndexRef[] {
  return bundle.exposures.filter((e) => e.kind === "equity_index").map(refOfExposure);
}

// the record keeps the name as its source spells it ("נאסד\"ק"); the page writes the gershayim (guidelines/wording.md)
export const refOfExposure = (e: ExposureRecord): IndexRef => ({ id: e.id, name: gershayim(e.names.he[0] ?? e.names.en[0] ?? e.id), israeli: e.constituents_israeli === true, exposure: e, custom: null, oneLine: e.one_line_he ?? null });

/** An index the person added asks nothing of its currency: every kind of fund is offered on it, and each fund says. */
export const refOfCustom = (c: CustomIndex): IndexRef => ({ id: c.id, name: c.name, israeli: false, exposure: null, custom: c, oneLine: null });

/**
 * The index as one fund sees it: on an index the person added, a fund they said is on a shekel index reads it as Israeli (no currency, no
 * hedge, no currency tax), and one they said is bought in a foreign currency reads it in that currency (`IndexRef.boughtIn`).
 */
export function indexSeenBy(index: IndexRef, rec: Pick<FundRecord, "id">, bundle: Pick<IndicesBundle, "entered">): IndexRef {
  const entered = bundle.entered;
  if (!index.custom || !entered) return index;
  return addedIndexAs(index, addedIndexCurrency({ shekelIndex: entered.shekelFunds.includes(rec.id), boughtIn: entered.boughtIn[rec.id] ?? null }));
}

/** An index the person added as a fund that moves with `seen` reads it (`addedIndexCurrency`); the page's rows and the panel's preview alike. */
export function addedIndexAs(index: IndexRef, seen: AddedIndexCurrency): IndexRef {
  switch (seen.kind) {
    case "shekel":
      return { ...index, israeli: true };
    case "bought-in":
      return { ...index, boughtIn: seen.currency };
    case "stand-in":
      return index;
    default:
      return assertNever(seen);
  }
}

export function indexById(bundle: Pick<IndicesBundle, "exposures">, id: string, customs: readonly CustomIndex[] = []): IndexRef | null {
  const known = knownIndices(bundle).find((i) => i.id === id);
  if (known) return known;
  const c = customs.find((x) => x.id === id);
  return c ? refOfCustom(c) : null;
}

const norm = (s: string) => s.replace(/[״”“"'׳`]/g, "").replace(/[-‐־–]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

/** A typed name that stands for a known index (its names, or the search aliases that lead to them): that index selects. */
export function matchKnownIndex(bundle: Pick<IndicesBundle, "exposures">, typed: string): IndexRef | null {
  const t = norm(typed);
  if (!t) return null;
  const known = knownIndices(bundle);
  for (const k of known) if ([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])].some((n) => norm(n) === t)) return k;
  for (const row of aliasRows) {
    if (!row.from.some((f) => norm(f) === t)) continue;
    for (const to of row.to) for (const k of known) if ([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])].some((n) => norm(n) === norm(to))) return k;
  }
  return null;
}

/** Suggestions for the custom-index field: the names of the known indices (and what they are called in the search table). */
export function indexSuggestions(bundle: Pick<IndicesBundle, "exposures">): { name: string; id: string }[] {
  const out: { name: string; id: string }[] = [];
  for (const k of knownIndices(bundle)) {
    const names = new Set([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])]);
    for (const row of aliasRows) if (row.to.some((to) => [...names].some((n) => norm(n) === norm(to)))) row.from.forEach((f) => names.add(f));
    names.forEach((n) => out.push({ name: n, id: k.id }));
  }
  return out;
}

/** A stable id for a custom index from its name (kept on the device). */
export const customIdOf = (name: string): string => `custom-${norm(name).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "index"}`;

// ---------------------------------------------------------------- reasons and cells

export type Reason =
  | NotComparable
  | { code: "fund-type" }
  | { code: "need-yield" }
  | { code: "need-rate"; currency: string }
  | { code: "no-fund-rate" }
  | { code: "no-hedge-record" }
  | { code: "no-hedge-entered" }
  | { code: "payout-unknown" }
  | { code: "fee-unknown" }
  | { code: "domicile-unknown" }
  /** A distributing fund registered in a country whose tax on its distribution to an Israeli resident is not in the rule base (G-44: Luxembourg). */
  | { code: "distribution-tax-unknown" }
  /** A fund the person buys in Tel Aviv whose country they did not say: an Israeli ETF or a foreign fund, which are worked out apart. */
  | { code: "tase-country-unknown" }
  /** The house sells this kind of fund fund by fund (its distribution agreements, BRK-38), and the run names no fund a report can name: the generic fund of the kind, or a fund the person typed. */
  | { code: "sold-fund-by-fund" }
  /** The house sells this kind fund by fund, and no report of an agreement found names this fund: whether it sells it stays open (`FundDoubt`). */
  | { code: "no-agreement-found" };

export interface Availability {
  source: { url: string; title: string; checked: string };
  note: string | null;
  /** The record's own sentence on why this kind of fund is not sold there, where it has one; shown instead of the page's general words. */
  reason_he?: string | null;
  /** The rules that hold the fact (the record's `rule_ids`): the row's words open their cards. */
  rule_ids?: readonly string[];
  /** The open questions that leave it open, where the entry says one does (`BRK-OQ24`): opened beside the rules. */
  open_questions?: readonly string[];
}

/** The rules and open questions an entry names, in that order: what the row's words open. */
export const entryRules = (a: Availability): string[] => [...(a.rule_ids ?? []), ...(a.open_questions ?? [])];

/** A fund's entry at a house that does not price it, as `FundWay.byHouse` holds it. */
export interface FundNotPriced {
  providerId: string;
  reason: Reason;
  /** Where the fund is bought on the reading whose reason this is (`Priced.listing`), which a deal's run is read for (`dealRunOf`). */
  listing?: DealRun["listing"];
  /** A sourced fact says the house does not sell this kind of fund ("not possible there"). */
  availability?: Availability;
  /**
   * Whether the house sells this fund is open, for this fund and not for its whole kind: a house that sells the kind fund by fund, whose
   * agreements no report found names the fund (`no-agreement-found`). Shown grey with its own words and source, as a doubt the house's record
   * words for a whole kind is (`doubtOf`), never as "not sold".
   */
  doubt?: Availability;
}

export interface BrokerCell {
  providerId: string;
  /** `cost`: priced. `unavailable`: a sourced fact says the broker does not sell it. `no-line`: the tariff has no line for the class. `not-comparable`: the engine could not price it (reason). */
  kind: "cost" | "unavailable" | "no-line" | "not-comparable";
  /**
   * The broker's cost over the horizon before the tax it saves, in today's shekels (F-91 on F-63; generic fund: no fund fees). It is the
   * cell's only figure: no tax index enters it (method F-04, G-40), so nothing after tax of the generic fund is kept to rank on.
   */
  cost?: SiteValue;
  costN?: number;
  /** Abroad: the exchange the price rests on; null when the tariff has one line for all. */
  venue?: Venue | null;
  /** The monthly purchases ran on the house's printed standing-order line (F-12, D41). */
  standing?: boolean;
  /** The house's standing-order lines for this purchase that the ranked price leaves out (`not_ranked`, D41, D56): shown beside the row. */
  aside?: string[];
  /** The option the cell prices (a custom index's account list names the kind of fund each house's cost is for). */
  option?: OptionId;
  reason?: Reason;
  availability?: Availability;
}

/** What the account list of an index with no fund to price shows of a house's cheapest priced cell (`HouseRow.split`). */
export interface CostSplit {
  /** The cell's `cost` in whole shekels; the place that shows it adds its `about` (an account's header). */
  whole: SiteValue;
  /** The cost split by fee line, before tax (F-91 on F-61), and the remainder no single line explains: a run per line. */
  lines: { line: FeeLine; cost: number }[];
  interaction: number;
}

export interface WayPrice {
  providerId: string;
  /** Real value left at the horizon, today's shekels (the figure the ranking sorts on). */
  value: SiteValue;
  valueN: number;
  venue: Venue | null;
  /** Where the fund is bought on the reading priced (`Priced.listing`), which a deal's run is read for (`dealRunOf`). */
  listing?: DealRun["listing"];
  /**
   * What the account's fees take over the horizon, before the tax they save (F-91 on F-63), real shekels: the receipt's fees. In whole units
   * the account's part also holds what the cash waiting for a unit did (F-109), which is not a fee and is left out here, as the receipt
   * writes it apart.
   */
  accountCost: number;
  /** `accountCost` as a figure (F-91 on F-63), with its inputs, rules and the run's notes about the cost (BANK-35); the place that shows it adds its `about`. */
  cost: SiteValue;
  /** The monthly purchases ran on the house's printed standing-order line (F-12, D41). */
  standing: boolean;
  /** The house's standing-order lines for this purchase that the ranked price leaves out (`not_ranked`, D41, D56): shown beside the row. */
  aside: string[];
  /**
   * F-109 (D94): the house buys the fund in whole units: the monthly purchases of the plan and how many of them bought no unit (their cash
   * waited for a later month). Null where it buys by amount.
   */
  units: { monthly: number; skipped: number } | null;
  /** The person's age and income where the run's tax rested on them (`RunResult.profileUsed`): the plan's "?" by them says so. */
  profileUsed: ComparedProvider["run"]["profileUsed"];
}

export interface FundWay {
  rec: FundRecord;
  name: string;
  number: string;
  option: OptionId;
  /** The kind its row names (`kindOfFund`): its option's, or, for a typed fund in Tel Aviv whose country is not known, that it is not known. */
  kind: FundKind;
  /** The broker the figure is at: the option's cheapest for this fund. */
  best?: WayPrice;
  /** The fund's run at every house of the option (a price, or why it has none); `best` is the highest of the ranked ones. */
  /** `availability`: a sourced fact says the house does not sell this kind of fund ("not possible there"); any other reason is "no data". */
  byHouse: Record<string, WayPrice | FundNotPriced>;
  reason?: Reason;
  currencyMismatch: boolean;
  /** F-109: the fund is bought in whole units and its record holds no unit price, so it is priced by amount and its row says so. */
  noUnitPrice: boolean;
}

export interface OptionView {
  id: OptionId;
  /** The option exists for this index (an Israeli index has two). */
  exists: boolean;
  /** Why it cannot run at all ("עוד לא חושב"). */
  notRunnable: "no-rate" | null;
  cells: BrokerCell[];
  funds: FundWay[];
  /** The best complete way inside the option (the fund with the highest value at its broker). */
  bestWay: Way | null;
}

export interface Way {
  option: OptionId;
  fund: FundWay;
  providerId: string;
  value: SiteValue;
  valueN: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  short: string;
  providerClass: FeesSnapshot["provider"]["class"];
  foreign: boolean;
  /** A foreign broker whose own terms offer a service that withholds Israeli tax (BRK-36). */
  taxService: boolean;
  /** Whether a company page exists (banks and brokers only). */
  hasPage: boolean;
  /** The person typed it (D44): marked as entered wherever it is named, and left out of every count over the collected houses. */
  custom: boolean;
}

/** The options a house sells on this page: Israeli houses the three Israeli types, foreign brokers the funds abroad. */
export const GROUP_OPTIONS = { il: ["il-etf", "il-tracking", "tase-foreign"], foreign: ["abroad"] } as const satisfies Record<string, readonly OptionId[]>;
export type HouseGroup = keyof typeof GROUP_OPTIONS;

export interface HouseEntry {
  fund: FundWay;
  /** The run at this house; null when it has none (see `reason`). */
  price: WayPrice | null;
  reason: Reason | null;
}

export interface HouseRow {
  provider: ProviderInfo;
  group: HouseGroup;
  /** Every fund of the group on the index at this house: priced ones by value left, then the ones with no price. */
  entries: HouseEntry[];
  /** The house's cheapest way: the best priced entry. */
  best: HouseEntry | null;
  /** Why the house has no way: not sold there (sourced), or the reason it cannot be priced. */
  unavailable: Availability | null;
  reason: Reason | null;
  /** An index with no fund record: the house's cheapest broker cost over the group's options. */
  generic: BrokerCell | null;
  /**
   * What the account list shows of `generic`: worked out only on a view with no pair to show (`pairless`), the one view whose account list
   * shows it, since its split takes a run per fee line; null on every other view.
   */
  split: CostSplit | null;
  /** The house prints a standing-order line for a kind of fund here: by house, so the row keeps its label when the best fund changes. */
  standing: boolean;
  /** The standing-order lines the ranked price leaves out at this house for any kind of fund here (`not_ranked`, D41): by house, as `standing`. */
  aside: string[];
}

export interface InvestView {
  index: IndexRef;
  options: OptionView[];
  providers: ProviderInfo[];
  headline: Way | null;
  yourBroker: string | null;
  /** Every house with the funds of its group priced at it, the cheapest way first (the index page's section 1). */
  houses: HouseRow[];
  returnPct: number;
  fundCount: number;
}

// ---------------------------------------------------------------- the providers and their lines


const scopedCache = new WeakMap<BundleSnapshot, FeesSnapshot>();
/**
 * The record the engine reads (it checks it against the schema): the lines this page ranks, every line but a foreign-currency to
 * foreign-currency conversion, and none of what the page alone reads of the house (`fundByFund`).
 */
export function scoped(s: BundleSnapshot): FeesSnapshot {
  let out = scopedCache.get(s);
  if (!out) {
    const { fundByFund: _f, ...record } = s;
    out = { ...record, lines: s.lines.filter((l) => !isFxToFx(l)) };
    scopedCache.set(s, out);
  }
  return out;
}

const investProviders = new WeakMap<readonly FeesSnapshot[], readonly FeesSnapshot[]>();
/** Sorted once per list of snapshots: a page's pricing asks for it on every run, and comparing Hebrew names is slow. */
export function providersOfInvest(bundle: Pick<IndicesBundle, "snapshots">): readonly FeesSnapshot[] {
  let out = investProviders.get(bundle.snapshots);
  if (!out) {
    out = houseSnapshots(bundle.snapshots);
    investProviders.set(bundle.snapshots, out);
  }
  return out;
}

const providerInfo = (s: FeesSnapshot): ProviderInfo => {
  // an account the person saved as a deal: no company page of its own
  const custom = isDealProviderId(s.id);
  return { id: s.id, name: gershayim(s.provider.name_he), short: custom ? s.provider.name_he : shortName(s.id, s.provider.name_he), providerClass: s.provider.class, foreign: s.provider.class === "foreign_broker", taxService: s.provider.israeli_tax_service === true, // every bank and broker on this page has a company page, a foreign one too
    hasPage: !custom && (s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker"), custom };
};

interface Cand {
  venue: Venue | null;
  band?: string[];
  /** F-109, F-128: the exchange the reading buys the fund on, where the spec reads each exchange (`readsEachExchange`). */
  listing?: Venue;
}

/**
 * The ways to read a snapshot for an option, the cheapest that computes winning (F-63). For a fund bought abroad: one per exchange its tariff
 * names and per pricing plan on that exchange (Interactive Brokers prints Fixed and Tiered for each), each with the standard conversion and
 * with every other way the house converts (a banded conversion line with no currency of its own and no recurring plan: Interactive Brokers'
 * automatic conversion, F-13); then the plain reading. Where the spec reads each exchange (`readsEachExchange`), each reading buys the fund
 * on an exchange (F-65, F-128): one an exchange's line names on that exchange, and the plain reading once on each where the listing changes
 * the account's run (`listingChangesRun`), else once.
 */
function candidates(ctx: Ctx, s: FeesSnapshot, option: OptionId, spec: Pick<Spec, "place" | "fund" | "cls">): Cand[] {
  if (option !== "abroad") return [{ venue: null }];
  const unknown = readsEachExchange(spec.place);
  const plainEach = unknown && listingChangesRun({ instrumentClass: spec.cls, fund: spec.fund }, accountKindOf(ctx, s));
  const plain: Cand[] = plainEach ? EXCHANGES.map((v) => ({ venue: null, listing: v })) : [{ venue: null }];
  const trade = s.lines.filter((l) => l.base === "trade" && l.level === "list" && l.applies_to.includes("foreign_securities") && l.band);
  const ways = [...new Set(s.lines.filter((l) => l.base === "fx" && l.level === "list" && l.band && l.band !== STANDING_CONVERSION_BAND && !l.conversion_currency && l.applies_to.some((a) => a === "foreign_securities" || a === "all")).map((l) => l.band!))];
  const out: Cand[] = [];
  for (const v of EXCHANGES) {
    const plans = [...new Set(trade.filter((l) => venueOfBand(l.band) === v).map((l) => l.band!))];
    for (const plan of plans) for (const way of [null, ...ways]) out.push({ venue: v, band: way ? [plan, way] : [plan], ...(unknown ? { listing: v } : {}) });
  }
  return [...out, ...plain];
}

/**
 * The one exchange abroad a house trades on where every trade line of its list for funds bought abroad names it (One Zero's and Altshuler
 * Trade's name the United States alone); null where a line names no exchange or the lines name more than one.
 */
function onlyVenueAbroad(s: FeesSnapshot): Venue | null {
  const venues = new Set(s.lines.filter((l) => l.base === "trade" && l.level === "list" && l.applies_to.includes("foreign_securities")).map((l) => venueOfBand(l.band)));
  const [only, ...more] = [...venues];
  return more.length === 0 && only ? only : null;
}

// ---------------------------------------------------------------- the run

/**
 * Where a spec's fund is bought (F-109, F-65):
 * - `listed`: on TASE or on the exchange abroad it trades on, so each house buys it in whole units or by amount there (D94);
 * - `any-exchange`: the generic fund abroad, which stands for every fund of the kind, so an account buys it on whichever exchange its best
 *   reading is on (a house's cheapest, F-63);
 * - `unknown-exchange`: one fund bought abroad whose record says its exchange is not known, priced on the exchange whose best reading
 *   leaves the least (F-65, as D56 prices a house at the most its documents let it charge);
 * - `none`: no listing, so every order is by amount: a tracking fund (bought from its manager) and a generic fund of a TASE kind. A fund
 *   abroad always has an exchange, given or not known (`placeOf`).
 */
type Place = { at: "listed"; listing: Listing } | { at: "any-exchange" } | { at: "unknown-exchange" } | { at: "none" };

/** The fund's listing where the place names one. */
const listingOfPlace = (place: Place): Listing | undefined => (place.at === "listed" ? place.listing : undefined);
/** A place on an exchange abroad not given: each reading buys the fund on an exchange (`Cand.listing`). */
const readsEachExchange = (place: Place): boolean => place.at === "any-exchange" || place.at === "unknown-exchange";

interface Spec {
  fund: Parameters<typeof providerWorkbench>[0]["fund"];
  market: { grossReturn: number; returnIn?: "instrument" | "nis"; fxChange?: number; principalFxChange?: number };
  currency?: { code: string; startRate: number };
  cls: string;
  place: Place;
}

interface Ctx {
  bundle: IndicesBundle;
  plan: WorkbenchInputs;
  fx: Record<string, number>;
  theta: number;
  snaps: readonly BundleSnapshot[];
  assumptions: FundAssumptions;
}

const runRates = new WeakMap<NonNullable<IndicesBundle["fx"]>, Record<string, number>>();
function ratesOf(fx: NonNullable<IndicesBundle["fx"]>): Record<string, number> {
  let out = runRates.get(fx);
  if (!out) {
    out = fxRunInput(fx);
    runRates.set(fx, out);
  }
  return out;
}

function makeCtx(bundle: IndicesBundle, plan: WorkbenchInputs, assumptions: FundAssumptions = {}): Ctx {
  const theta = ((bundle.p01 as unknown as { value: { value: number } }).value.value as number) / 100;
  return { bundle, plan, fx: bundle.fx ? ratesOf(bundle.fx) : {}, theta, snaps: providersOfInvest(bundle), assumptions };
}

/**
 * The generic fund of an option, with no fees of its own: what a house's account costs on the kind (F-91 on F-63). An Israeli kind's fund
 * names no principal currency, so its run takes the CPI; only its after-tax value would read that index, and the page reads none of it, only
 * the account's cost before tax, which no tax index enters (method F-04, G-40).
 */
function genericSpec(ctx: Ctx, option: OptionId): Spec | null {
  const market = { grossReturn: ctx.plan.grossReturn };
  if (option === "il-tracking" || option === "il-etf") return { fund: { kind: "israeli-fund", drag: {} }, market, cls: OPTION_CLASS[option], place: { at: "none" } };
  if (option === "tase-foreign") return { fund: { kind: "tase-foreign-fund", drag: {} }, market, cls: OPTION_CLASS[option], place: { at: "none" } };
  const usd = ctx.fx.USD;
  if (!usd) return null;
  return { fund: { kind: "foreign-fund", drag: {} }, market: { ...market, returnIn: "instrument", fxChange: 0 }, currency: { code: "USD", startRate: usd }, cls: OPTION_CLASS.abroad, place: { at: "any-exchange" } };
}

/** The open rule a run of the spec's fund would rest on (F-04), with the question that stops it where one does, or null. A question whose
 *  readings split a run (TXG OQ17 at a falling CPI) is the run's own to say: its row is not comparable, "rule-open" (method §13). */
const blockedBy = (ctx: Ctx, spec: Spec): SecuritiesStop | null => securitiesBlockedBy(spec.fund, ruleContext(ctx.bundle));

/**
 * The house whose price list a snapshot reads: its own, or, for an account built on a house (F-101), that house's. No page builds such an
 * account: it stays as the move tests' oracle, the figure a typed account left before it became a deal (deal-account/move-fixtures.ts).
 */
const houseOfSnap = (ctx: Ctx, s: FeesSnapshot): string => ctx.bundle.entered?.bases?.[s.id] ?? s.id;

/** What prices a snapshot's account: a deal the person keeps (F-128), else a house's price list. */
const accountKindOf = (ctx: Ctx, s: FeesSnapshot): AccountKind => (ctx.bundle.deals?.byId[s.id] ? "deal" : "price-list");

/**
 * The row counts a current account (F-102, D64): only on the indices page, at a bank whose record prices one. An account built on a bank (F-101) is an account at that bank, so it reads the bank's record.
 */
function currentAccountOf(ctx: Ctx, s: FeesSnapshot): FeesSnapshot["current_account"] | null {
  if (!ctx.plan.currentAccounts) return null;
  const house = houseOfSnap(ctx, s);
  const record = house === s.id ? s : ctx.bundle.snapshots.find((x) => x.id === house);
  return record && countsCurrentAccount({ current_account: record.current_account }) ? record.current_account! : null;
}


/** The person's age and income as a run's tax reads them: the surtax on the income with the gain (F-43), and from 60 the brackets the gain falls into (F-42). */
function profileOf(ctx: Ctx): { ageAtStart?: number; annualIncome?: number } {
  const profile: { ageAtStart?: number; annualIncome?: number } = {};
  if (ctx.plan.age !== null) profile.ageAtStart = ctx.plan.age;
  if (ctx.plan.income !== null && ctx.plan.income > 0) profile.annualIncome = ctx.plan.income;
  return profile;
}

const goalOf = (ctx: Ctx) => ({ amountNow: ctx.plan.amountNow, monthly: ctx.plan.monthly, months: 12 * ctx.plan.years, firstMonth: calendarMonthOf(ctx.bundle.today) });

function runSlot(ctx: Ctx, spec: Spec, items: { s: FeesSnapshot; cand: Cand }[]): ProviderRow[] {
  const profile = profileOf(ctx);
  const input = (list: typeof items, listing: Listing | undefined) => ({
    goal: goalOf(ctx),
    market: { ...spec.market, inflation: ctx.plan.inflation },
    fund: spec.fund,
    profile,
    behaviour: { ordersPerMonth: 1 },
    instrumentClass: spec.cls,
    channel: "direct",
    ...(spec.currency ? { currency: spec.currency } : {}),
    ...(listing ? { listing } : {}),
    fx: ctx.fx,
    theta: ctx.theta,
    // a deal the person saved is priced by the deal itself (F-128), beside the price lists
    deals: list.flatMap((x) => { const d = dealProviderOf(ctx.bundle, x.s as BundleSnapshot, { currentAccounts: ctx.plan.currentAccounts ?? false }); return d ? [d] : []; }),
    providers: list.filter((x) => accountKindOf(ctx, x.s) === "price-list").map((x) => {
      // an account built on a house (F-101): the house's own list tariff for this fund and reading, with the group's and the person's prices over
      // it. No page puts one in the bundle: the branch stays as the move tests' oracle, what a typed account left before its move into a deal
      // (deal-account/move-fixtures.ts), which no other code can price without a second copy of this run
      const layered = ctx.bundle.entered?.layered?.[x.s.id];
      const current = currentAccountOf(ctx, x.s);
      const account = current ? { currentAccount: true } : {};
      if (layered) {
        // an account built on a bank keeps the bank's current account (its own record copies only the price lines)
        const snap = scoped(x.s);
        return { snapshot: current ? { ...snap, current_account: current } : snap, level: "entered" as const, layered, ...account, ...(x.cand.band ? { band: x.cand.band } : {}) };
      }
      return { snapshot: scoped(x.s), level: "list" as const, ...account, ...(x.cand.band ? { band: x.cand.band } : {}) };
    }),
  });
  // the rows in the items' order, a deal's among the houses' (the workbench lists the price lists first)
  const inOrder = (list: typeof items, rows: ProviderRow[]): ProviderRow[] => list.map((x) => rows.find((r) => r.id === x.s.id)!);
  // the fund's listing, else the exchange each reading buys it on (`Cand.listing`): one run for each
  const run = (list: typeof items): ProviderRow[] => {
    const byListing = new Map<Listing | undefined, typeof items>();
    for (const x of list) {
      const listing = listingOfPlace(spec.place) ?? x.cand.listing;
      byListing.set(listing, [...(byListing.get(listing) ?? []), x]);
    }
    return inOrder(list, [...byListing].flatMap(([listing, group]) => providerWorkbench(input(group, listing), ruleContext(ctx.bundle)).rows));
  };
  try {
    return run(items);
  } catch {
    // one provider the engine cannot run must not fail the page (spec 4.5): run them one by one, the failing one becomes a record-error row
    return items.map((x) => {
      try {
        return run([x])[0]!;
      } catch (e) {
        const base = { id: x.s.id, name: x.s.provider.name_he, providerClass: x.s.provider.class, level: "list" as const, snapshot: x.s.snapshot, tariffSource: x.s.tariff, protectionRuleIds: x.s.provider.protection_rule_ids, minimums: x.s.minimums };
        // a run stopped on an open rule before its exit (an open question whose readings split a yearly tax) is that rule's, not the record's
        if (e instanceof BlockedError) return { ...base, kind: "not-comparable" as const, reason: blockedReason(e) };
        return { ...base, kind: "not-comparable" as const, reason: { code: "record-error" as const, detail: e instanceof Error ? e.message : String(e) } };
      }
    });
  }
}

/**
 * A house's own list tariff for a kind of holding, read as the comparison reads it for a generic fund of the option (of the readings of its
 * tariff that build, the one the comparison prices the house on, else the first): what an account built on the house starts from (F-101),
 * with the run facts the layers need. Null when the option cannot run (no exchange rate for a fund abroad) or no reading of the house's
 * tariff builds.
 */
export function listReading(bundle: IndicesBundle, s: FeesSnapshot, option: OptionId, plan: WorkbenchInputs): { built: TariffBuild; run: LayeredRun; line: (id: string) => FeesSnapshot["lines"][number] | undefined } | null {
  const ctx = makeCtx(bundle, plan);
  const spec = genericSpec(ctx, option);
  if (!spec) return null;
  const scopedSnap = scoped(s);
  const builds = candidates(ctx, scopedSnap, option, spec).flatMap((cand) => {
    try {
      const built = buildTariff(
        { goal: { amountNow: plan.amountNow, monthly: plan.monthly, months: 12 * plan.years, firstMonth: calendarMonthOf(ctx.bundle.today) }, market: { ...spec.market, inflation: plan.inflation }, profile: {}, instrumentClass: spec.cls, channel: "direct", ...(spec.currency ? { currency: spec.currency } : {}), fx: ctx.fx, theta: ctx.theta, providers: [] },
        { snapshot: scopedSnap, level: "list", ...(cand.band ? { band: cand.band } : {}) },
        scopedSnap,
      );
      return [{ cand, built }];
    } catch {
      return [];
    }
  });
  if (!builds.length) return null;
  // several readings build (Interactive Brokers' plans and ways to convert): the one the comparison prices the house on
  const won = builds.length > 1 ? priceMany(ctx, spec, option, [s], null).get(s.id) : undefined;
  const { built } = (won?.kind === "ok" && builds.find((b) => sameCand(b.cand, won.cand))) || builds[0]!;
  return { built, run: { fx: ctx.fx, instrumentClass: spec.cls, currency: spec.currency, sharePrice: undefined }, line: (id) => scopedSnap.lines.find((l) => l.id === id) };
}

/**
 * The reason of a provider row whose run stopped on its rule (`BlockedError`): the rule, with the open question whose readings split the
 * run where there is one, and the method gap where no reading of the case exists (G-38); never the rule's id in place of a question.
 */
export function blockedReason(e: BlockedError): { code: "rule-open"; ruleId: string; question?: string; gap?: string } {
  return { code: "rule-open", ruleId: e.ruleId, ...(e.question ? { question: e.question } : {}), ...(e.gap ? { gap: e.gap } : {}) };
}

function ambiguity(message: string, s: FeesSnapshot): NotComparable | null {
  const m = /lines? apply \(([^)]*)\); the snapshot is ambiguous/.exec(message);
  if (!m) return null;
  return { code: "ambiguous", detail: message, lines: m[1]!.split(",").map((x) => x.trim()).map((id) => { const l = s.lines.find((y) => y.id === id); return { id, name: l?.names.tariff[0] ?? id, band: l?.band ?? null }; }) };
}

function reasonOf(row: NotComparableProvider, s: FeesSnapshot): NotComparable {
  const r = row.reason;
  if (r.code === "data-missing") return { code: "data-missing", recorded: r.detail };
  if (r.code === "line-without-value") return { code: "line-without-value", detail: r.detail, lineName: s.lines.find((l) => l.id === r.detail.split(" ")[0])?.names.tariff[0] ?? null };
  if (r.code === "not-printed-for-currency") return { code: "not-printed-for-currency", detail: r.detail, lineName: s.lines.find((l) => l.id === r.line)?.names.tariff[0] ?? null, currency: r.currency, printed: r.printed };
  if (r.code === "record-error") return ambiguity(r.detail, s) ?? { code: "record-error", detail: r.detail };
  if (r.code === "rule-open") return { code: "rule-open", ruleId: r.ruleId, ...(r.question ? { question: r.question } : {}), ...(r.gap ? { gap: r.gap } : {}) };
  // a deal with no price on the plan: what it lacks, read back from its reading (lib/deal-account)
  if (r.code === "deal-unpriced") return { code: r.code, detail: r.detail, missing: missingOf(r.detail) };
  return { code: r.code, detail: r.detail };
}

/**
 * `cand`: the reading of the tariff the price is on (an account built on a house: the house's). `listing`: where the fund is bought on that
 * reading, the fund's own, else the exchange the reading buys it on (`Cand.listing`); on a failure, that of the reading whose reason it gives.
 */
type Priced = { kind: "ok"; row: ComparedProvider; venue: Venue | null; standing: boolean; aside: string[]; cand: Cand; listing: Listing | undefined } | { kind: "fail"; reason: NotComparable; listing: Listing | undefined };
/** What a row leaves at the horizon after tax, the figure a house's readings are chosen on (F-63); null when not priced. */
const leftOf = (row: ProviderRow): number | null => (row.kind === "compared" ? row.real : null);

/** The venue the trade line a row used names (its band); null where it used none or its band names none. */
function lineVenue(row: ComparedProvider, s: FeesSnapshot): Venue | null {
  for (const id of row.linesUsed) {
    const l = s.lines.find((x) => x.id === id);
    if (l && l.base === "trade") return venueOfBand(l.band);
  }
  return null;
}

/** The venue a row names (F-63): its trade line's, else the reading's, else the exchange the reading buys the fund on. */
const rowVenue = (row: ComparedProvider, s: FeesSnapshot, cand: Cand): Venue | null => lineVenue(row, s) ?? cand.venue ?? cand.listing ?? null;

type Reading = { row: ComparedProvider; venue: Venue | null; cand: Cand };
const leftOfReading = (r: Reading): number => leftOf(r.row)!;

/** The reading that leaves the most (F-63), one that names its exchange on a tie. */
function mostOf(list: readonly Reading[]): Reading | null {
  let best: Reading | null = null;
  for (const r of list) if (!best || leftOfReading(r) > leftOfReading(best) || (leftOfReading(r) === leftOfReading(best) && r.venue !== null && best.venue === null)) best = r;
  return best;
}

/**
 * A fund of no known exchange read on each (F-65): on each exchange the reading that leaves the most there (a reading that buys on no
 * exchange of its own counts on both), and of those the one that leaves the least, with the exchange it is on. An exchange on which no
 * reading computes has no price, so neither has the account (D56: what its documents do not price is not the least it charges): `lacking`
 * names those exchanges.
 */
function leastOf(list: readonly Reading[]): { reading: Reading; listing: Venue } | { lacking: Venue[] } {
  const on = EXCHANGES.map((v) => ({ listing: v, reading: mostOf(list.filter((r) => (r.cand.listing ?? r.venue ?? v) === v)) }));
  const lacking = on.filter((x) => !x.reading).map((x) => x.listing);
  if (lacking.length > 0) return { lacking };
  let out: { reading: Reading; listing: Venue } | null = null;
  for (const x of on) if (x.reading && (!out || leftOfReading(x.reading) < leftOfReading(out.reading))) out = { reading: x.reading, listing: x.listing };
  return out!;
}

/**
 * Prices each snapshot for a fund spec: every reading of its tariff (an exchange each, for a fund bought abroad), and the
 * cheapest one that computes wins. `fundVenue` limits the readings to the exchange the fund trades on.
 */
const sameCand = (a: Cand, b: Cand) => a.venue === b.venue && a.listing === b.listing && JSON.stringify(a.band ?? null) === JSON.stringify(b.band ?? null);

function priceMany(ctx: Ctx, spec: Spec, option: OptionId, snaps: FeesSnapshot[], fundVenue: Venue | null): Map<string, Priced> {
  // a fund whose tax index rests on an open rule is priced nowhere after tax (F-04: the kind with no fund record, TXF-04), so no house is
  // ranked on a guess
  const open = blockedBy(ctx, spec);
  if (open) return new Map(snaps.map((s): [string, Priced] => [s.id, { kind: "fail", reason: { code: "rule-open", ...open }, listing: listingOfPlace(spec.place) }]));
  return priceRows(ctx, spec, option, snaps, fundVenue);
}

function priceRows(ctx: Ctx, spec: Spec, option: OptionId, snaps: FeesSnapshot[], fundVenue: Venue | null): Map<string, Priced> {
  type Got = Priced;
  const baseOf = (s: FeesSnapshot) => (houseOfSnap(ctx, s) === s.id ? null : houseOfSnap(ctx, s));
  // a deal filled from a house's whole price list is an account at that house (F-128): it takes the house's availability as the house's own
  // row reads it (`houseSells`), so it is priced only where the house sells the fund
  const dealHouseOf = (s: FeesSnapshot): string | null => {
    const deal = ctx.bundle.deals?.byId[s.id];
    return deal ? (houseSnap(ctx.bundle, deal)?.id ?? null) : null;
  };
  // an account built on a house is priced where the house is, on the house's own reading of its price list, and nowhere else (F-101,
  // #190: the layered run has no line of its own to say which exchange it trades on, and was priced where the house's list has no line)
  const bases = [...new Set(snaps.flatMap((s) => { const b = baseOf(s) ?? dealHouseOf(s); return b && !snaps.some((x) => x.id === b) ? [b] : []; }))].flatMap((b) => ctx.bundle.snapshots.filter((x) => x.id === b));
  const all = [...snaps, ...bases];
  const listing = listingOfPlace(spec.place);
  const per = all.map((s) => ({ s, cands: candidates(ctx, scoped(s), option, spec).filter((c) => fundVenue === null || c.venue === null || c.venue === fundVenue) }));
  const results = new Map<string, { row: ProviderRow; cand: Cand }[]>();
  const slots = Math.max(0, ...per.map((p) => p.cands.length));
  for (let k = 0; k < slots; k++) {
    const items = per.filter((p) => p.cands[k]).map((p) => ({ s: p.s, cand: p.cands[k]! }));
    const rows = runSlot(ctx, spec, items);
    items.forEach((x, i) => results.set(x.s.id, [...(results.get(x.s.id) ?? []), { row: rows[i]!, cand: x.cand }]));
  }
  const out = new Map<string, Got>();
  // the houses first, so an account built on one, or a deal filled from one, can follow it
  const follows = (s: FeesSnapshot) => !!baseOf(s) || !!dealHouseOf(s);
  const order = [...per].sort((a, b) => Number(follows(a.s)) - Number(follows(b.s)));
  for (const { s } of order) {
    const dealHouse = dealHouseOf(s);
    const notSold = dealHouse ? houseSells(out.get(dealHouse)) : null;
    if (notSold) {
      out.set(s.id, notSold);
      continue;
    }
    const base = baseOf(s);
    if (base) {
      const at = out.get(base);
      const cand = at?.kind === "ok" ? at.cand : undefined;
      const mine = cand ? (results.get(s.id) ?? []).find((g) => sameCand(g.cand, cand)) : undefined;
      if (!at || at.kind === "fail") out.set(s.id, at ?? { kind: "fail", reason: { code: "data-missing", recorded: null }, listing });
      else if (mine && mine.row.kind !== "not-comparable") out.set(s.id, { kind: "ok", row: mine.row, venue: at.venue, standing: at.standing, aside: [], cand: at.cand, listing: at.listing });
      else out.set(s.id, { kind: "fail", reason: mine?.row.kind === "not-comparable" ? reasonOf(mine.row, scoped(s)) : { code: "data-missing", recorded: null }, listing: at.listing });
      continue;
    }
    const got = results.get(s.id) ?? [];
    const priced: Reading[] = [];
    // a reading set aside because the fund trades on another exchange than the one its line names: the house's lines abroad name only that one
    let otherVenue: { venue: Venue; listing: Listing | undefined } | null = null;
    for (const g of got) {
      if (g.row.kind === "not-comparable") continue;
      // no trade line for the class: the run would charge nothing, which the tariff does not say; derived availability (spec 6, S3)
      if (g.row.noLine.includes("trade")) continue;
      const venue = rowVenue(g.row, scoped(s), g.cand);
      // the exchange the fund is bought on: its own, else the reading's
      const on = fundVenue ?? g.cand.listing ?? null;
      if (on !== null && venue !== null && venue !== on) {
        otherVenue = { venue, listing: listing ?? g.cand.listing };
        continue;
      }
      priced.push({ row: g.row, venue, cand: g.cand });
    }
    const least = spec.place.at === "unknown-exchange" ? leastOf(priced) : null;
    const best = least ? ("reading" in least ? least.reading : null) : mostOf(priced);
    if (best) {
      const on = least && "reading" in least ? least.listing : undefined;
      out.set(s.id, { kind: "ok", row: best.row, venue: best.venue ?? on ?? null, standing: best.row.linesUsed.some((id) => { const band = s.lines.find((l) => l.id === id)?.band; return band === STANDING_ORDER_BAND || band === STANDING_CONVERSION_BAND; }), aside: best.row.standingAside, cand: best.cand, listing: listing ?? on ?? best.cand.listing });
      continue;
    }
    // where a fund of no known exchange is priced on one exchange and not the other, the reasons are those of the exchange with no price
    const lacking = least && "lacking" in least ? least.lacking : null;
    const fails = got.flatMap((g) => {
      const on = listing ?? g.cand.listing;
      if (lacking && g.cand.listing && !lacking.includes(g.cand.listing)) return [];
      return g.row.kind === "not-comparable" ? [{ reason: reasonOf(g.row, scoped(s)), listing: on }] : g.row.noLine.includes("trade") ? [{ reason: { code: "no-applicable-line" as const, detail: `no trade line of the ${s.snapshot} snapshot applies to ${spec.cls}` }, listing: on }] : [];
    });
    // a house that trades abroad only on another exchange does not sell the fund, whatever its other readings stop on: the readings on its
    // exchange were never run for this fund, and the plain reading's failure (Altshuler Trade's three US plans read as "ambiguous") is not why;
    // for a fund of no known exchange, the exchange its lines do not name may be the fund's
    const elsewhere = option === "abroad" && (fundVenue !== null || lacking) ? onlyVenueAbroad(scoped(s)) : null;
    if (elsewhere !== null && elsewhere !== fundVenue && !lacking?.includes(elsewhere)) {
      out.set(s.id, { kind: "fail", reason: { code: "other-venue", venue: elsewhere, fundVenue }, listing: listing ?? lacking?.find((v) => v !== elsewhere) });
      continue;
    }
    // the most telling reason: any but "no line" and "ambiguous", then ambiguous, then no line; with it, the exchange of its reading
    const pick: { reason: NotComparable; listing: Listing | undefined } =
      fails.find((f) => f.reason.code !== "no-applicable-line" && f.reason.code !== "ambiguous") ??
      (otherVenue ? { reason: { code: "other-venue", venue: otherVenue.venue, fundVenue }, listing: otherVenue.listing } : null) ??
      fails.find((f) => f.reason.code === "ambiguous") ??
      fails[0] ?? { reason: { code: "data-missing" as const, recorded: null }, listing };
    out.set(s.id, { kind: "fail", ...pick });
  }
  return out;
}

/**
 * F-128 on a deal filled from a house: whether the house sells the fund, as its own row reads its list (F-63), null where it does; else the
 * row's failure, which the deal takes. A house does not sell a fund where its row reads no trade line for the fund's class (the classes its
 * record does not show a person can hold have no line, `onlyWhatCanBeDone`) or sets its lines aside for another exchange abroad (One Zero's
 * lines abroad name the United States alone, BRK-38). A row that fails for any other reason (a price not collected, a rate missing) says
 * nothing of what the house sells, and the deal is read on its own prices. What a record says a house does not sell, and what it sells
 * fund by fund, the deal's record carries itself (`snapshotOfDeal`).
 */
function houseSells(house: Priced | undefined): Extract<Priced, { kind: "fail" }> | null {
  return house?.kind === "fail" && (house.reason.code === "no-applicable-line" || house.reason.code === "other-venue") ? house : null;
}

type AvailabilityEntry = NonNullable<FeesSnapshot["availability"]>[number];
const AVAILABLE_NOTE = (a: AvailabilityEntry): Availability => ({ source: a.source, note: a.note ?? null, reason_he: a.reason_he ?? null, ...(a.rule_ids?.length ? { rule_ids: a.rule_ids } : {}) });

/** Why a house does not sell this kind of fund: an entry saying the kind cannot be bought there; null where it sells it, or where it is open. */
function unavailable(s: FeesSnapshot, option: OptionId): Availability | null {
  for (const a of s.availability ?? []) if (a.available === false && a.applies_to.some((c) => classesAt(s, option).includes(c))) return AVAILABLE_NOTE(a);
  return null;
}

/** Whether a house sells this kind of fund fund by fund, under its distribution agreements (BRK-38): with no fund named, its price is not known there. */
const byFund = (s: BundleSnapshot, option: OptionId): boolean => classesAt(s, option).some((c) => agreedClasses(s).includes(c));

/**
 * What a house that sells this kind fund by fund (`byFund`) says of this fund: `sells` where a report of an agreement in force names its
 * number; `typed` for a fund the person typed, which no report can name; else open, with the record's words for a fund no report names
 * (`FundByFund.unnamed`) and the search as its source, a lead and not the house's list. Null where the house does not sell the kind fund by fund.
 */
function agreementAt(s: BundleSnapshot, option: OptionId, rec: FundRecord): { at: "sells" } | { at: "typed" } | { at: "open"; doubt: Availability } | null {
  const ff = s.fundByFund;
  if (!ff || !byFund(s, option)) return null;
  if (isCustomFund(rec)) return { at: "typed" };
  if (ff.named.includes(rec.identifiers.tase_number ?? rec.id)) return { at: "sells" };
  return { at: "open", doubt: { source: ff.search, note: null, reason_he: ff.unnamed.reason_he, rule_ids: ff.unnamed.rule_ids, open_questions: ff.unnamed.open_questions } };
}

/** Whether a house sells this fund: it sells the kind, and where it sells the kind fund by fund, a report names the fund (`agreementAt`). */
const sellsFund = (s: BundleSnapshot, option: OptionId, rec: FundRecord): boolean => !unavailable(s, option) && (agreementAt(s, option, rec)?.at ?? "sells") === "sells";

/**
 * The house's words that this kind of fund is bought there only by phone (an availability entry's `phone_only`), for the exchange
 * the price rests on; an entry that names exchanges says nothing of a price whose line names none. A sourced fact beside the house: no price
 * and no order reads it.
 */
export function phoneOnlyOf(s: FeesSnapshot | undefined, option: OptionId, venue: Venue | null | undefined): NonNullable<AvailabilityEntry["phone_only"]> | null {
  for (const a of s?.availability ?? []) {
    const p = a.phone_only;
    if (!p || a.available !== true || !a.applies_to.some((c) => classesAt(s, option).includes(c))) continue;
    if (!p.venues || (venue && p.venues.includes(venue))) return p;
  }
  return null;
}

/** The same as the value its tag opens: the word, the house's quoted words and their source, the house's own (D31). */
export function phoneOnlyValue(s: FeesSnapshot | undefined, option: OptionId, venue: Venue | null | undefined, house: string): SiteValue | null {
  const p = phoneOnlyOf(s, option, venue);
  if (!s || !p) return null;
  const v = {
    value: copy.pair.phoneTag,
    unit: "text",
    source: { url: p.source.url, title: p.source.title, publisher: s.provider.name_he, strength: "institution" },
    checked: p.source.checked,
    effective_from: null,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
    about: copy.pair.phoneAbout(house),
    lead: copy.pair.phoneLead(p.source.quote),
    notes: "",
  } as SiteValue;
  return ownBy(v, s.provider.name_he);
}

/** A standing-order line the ranked price leaves out (D41, D56): its printed price and why, from the house's record. */
export type AsideLine = FeesSnapshot["lines"][number] & { not_ranked: NonNullable<FeesSnapshot["lines"][number]["not_ranked"]> };

/** The lines of `ids` in the house's record that the ranked price leaves out, as the record prints them. */
export function asideLines(s: FeesSnapshot | undefined, ids: readonly string[]): AsideLine[] {
  return (s?.lines ?? []).filter((l): l is AsideLine => ids.includes(l.id) && l.not_ranked !== undefined);
}

/** The record's entry that leaves this kind of holding open at the house (`doubtOf`'s words), with its source and rules. */
export function doubtAt(s: FeesSnapshot | undefined, option: OptionId): Availability | null {
  for (const a of s?.availability ?? []) if (a.available === "unknown" && a.applies_to.some((c) => classesAt(s, option).includes(c))) return AVAILABLE_NOTE(a);
  return null;
}

/** Why the documents leave this kind of holding open at the house: said on its grey row. */
export function doubtOf(s: FeesSnapshot | undefined, option: OptionId): string | null {
  for (const a of s?.availability ?? []) if (a.available === "unknown" && a.applies_to.some((c) => classesAt(s, option).includes(c))) return a.reason_he ?? null;
  return null;
}

// ---------------------------------------------------------------- values

/** One of the plan's five inputs. */
export type PlanInput = keyof typeof copy.planInputs;
/** What a run of the whole plan rests on: every input (a balance at the horizon moves with each). */
const WHOLE_PLAN: readonly PlanInput[] = ["amount", "monthly", "years", "return", "inflation"];
/**
 * The plan's inputs a figure rests on, each named by the caller, so a figure lists only what its formula uses: what was paid in rests on
 * the amount, the deposit and the years, not on the return.
 */
function planInputs(plan: WorkbenchInputs, which: readonly PlanInput[]): Record<string, SiteValue> {
  const v = plan.values;
  const of: Record<PlanInput, SiteValue> = { amount: v.amount, monthly: v.monthly, years: v.years, return: v.returnV, inflation: v.inflation };
  return Object.fromEntries(which.map((k) => [copy.planInputs[k], of[k]]));
}
/**
 * The rules a figure of the run lists (`rulesOfRun`): those whose read changed the parts its number is made of. An account's cost takes the
 * account's fee lines (`ACCOUNT_LINES`), and the tax during the run where the fund pays out, since the fees then change the tax on what it
 * pays; the fund's part its own lines (`FUND_LINES`), and the same tax where the fund pays out; a money carried to the horizon its lines and
 * the payout's tax (`carriedParts`); the state's part the tax; what is left the whole run.
 */
const rulesOf = (row: ComparedProvider, parts: RunParts) => rulesOfRun(row.run.rules, parts);
/** The parts an account's cost before tax is made of (`rulesOf`): the account's lines, and the tax during the run on a fund that pays out. */
const accountParts = (payout: boolean): RunParts => [{ part: "fees", lines: ACCOUNT_LINES }, ...(payout ? (["taxDuring"] as const) : [])];
/**
 * The parts a money carried to the horizon is made of (F-91: a line in whole units, a deal's fee, the cash waiting for a unit): its fee lines,
 * and on a fund that pays out the tax a shekel held pays on the distribution, which the carry's growth is less (`DISTRIBUTION_TAX`).
 */
const carriedParts = (lines: FeeLines, payout: boolean): RunParts => [...(lines.length ? [{ part: "fees" as const, lines }] : []), ...(payout ? [DISTRIBUTION_TAX] : [])];
/** The fund pays out (A-10): the tax on what it pays is the run's tax during it, which the account's fees change. */
const paysOut = (spec: Spec): boolean => !!(spec.fund as { distribution?: unknown }).distribution;
/**
 * What a figure after the run's tax rests on besides its rules: the fund's own statements the run read (the tax index its annex states, D84;
 * the document naming it a foreign-investment fund, behind the principal currency the site's reading runs it on, D119).
 */
const statementsOf = (row: ComparedProvider) => row.run.statements ?? [];
/** F-65: the site's cautious reading of where a fund whose exchange is not known is bought, on ETF-95: no rule fixes where it lists. */
const EXCHANGE_READING: ExchangeLabel = { code: "unknown-exchange", ruleId: "ETF-95" };
/**
 * The run's labels, which a figure that rests on its tax carries: a cautious reading among them makes the figure's doubt (`readingDoubtOf`),
 * the site's own reading of an open tax index its sheet's tag (D119). For a fund whose exchange is not known, the site's cautious reading of
 * its exchange too (`ExchangeLabel`, F-65): the run is the one on the exchange that leaves the least, so what it leaves and its tax rest on it.
 */
const labelsOf = (row: ComparedProvider, spec: Spec): SiteLabel[] => (spec.place.at === "unknown-exchange" ? [...row.run.labels, EXCHANGE_READING] : row.run.labels);
/**
 * Whether a figure before the exit tax carries a run's label: every one but those on the rule of an open tax index (TXS OQ26 and TXF OQ10,
 * F-04), the site's reading or its cautious one, which only the exit tax reads, so a cost before tax wears no doubt or tag of theirs.
 */
const beforeExitTax = (l: Label): boolean => !TAX_INDEX_RULES.has(l.ruleId);
const TAX_INDEX_RULES = new Set(openReadings.filter((o) => o.kind === "tax-index").map((o) => o.ruleId));

/** What one engine run reads, for the sheet of a figure that comes out of it (`inputsOfRun`). */
interface RunReads {
  /** The account the run prices at: its house's current account (F-102), its lines in a foreign currency, what the person typed for it. Left out for a run with no account (F-91's fund part). */
  house?: string;
  /** The fund record the run holds; none for an option's generic fund. */
  fund?: string;
  /** The run's spec: a run priced in a foreign currency reads that currency's rate (F-84). */
  spec?: Spec;
  /** The row the run gave: the lines of the house's price list it read, for a line set in a foreign currency (F-84). */
  row?: Pick<ComparedProvider, "linesUsed">;
  /** F-91's X: the fund with none of its own costs and no distribution, measured with no account: the fund's figures are not read. */
  costsOff?: boolean;
  /**
   * What of the run's tax the figure reads: `tax`, a figure after it (what is left, the tax itself), reads the income the tax tests the
   * surtax on (F-43) and, with an age, the brackets from 60 (F-42); `before`, a difference of two `B = V_T^real + tax_real` (F-91: the
   * account's whole part, its lines bought by amount, the remainder, the fund's part), reads the income only on a fund that pays out, whose
   * yearly surtax on each payout counts in `tax_real` (`taxDuring`) though it never leaves the holdings. None: a figure that reads no tax (a
   * line carried in whole units or of a deal, the waiting cash).
   */
  tax?: "after" | "before";
  /** The age and income the run's tax rested on (`RunResult.profileUsed`): the sheet lists each only where it changed the result. */
  profileUsed?: ComparedProvider["run"]["profileUsed"];
}

/** A price-list line's unit in a foreign currency (a minimum in dollars, a charge per share or per event in dollars): the run converts it at F-84. */
const FOREIGN_UNIT = /^(usd|eur|gbp)(?:_|$)/;

/**
 * The exchange rates a run reads (F-84, D26), each as the site's computed rate: the currency the run is priced in (a fund bought abroad, the
 * abroad option's generic fund), and any currency a line of the house's price list that the row read is set in.
 */
function ratesOfRun(ctx: Ctx, r: RunReads): Record<string, SiteValue> {
  const fx = ctx.bundle.fx;
  if (!fx) return {};
  const codes = new Set<string>();
  if (r.spec?.currency) codes.add(r.spec.currency.code);
  const snap = r.house ? ctx.bundle.snapshots.find((s) => s.id === r.house) : undefined;
  if (r.row && snap) {
    // an account built on a house (F-101) reads the house's lines
    const house = ctx.bundle.snapshots.find((s) => s.id === houseOfSnap(ctx, snap));
    for (const id of r.row.linesUsed) {
      const l = snap.lines.find((x) => x.id === id) ?? house?.lines.find((x) => x.id === id);
      for (const v of [l?.rate, l?.min, l?.max]) {
        const m = v && typeof v.value === "number" ? FOREIGN_UNIT.exec(v.unit) : null;
        if (m) codes.add(m[1]!.toUpperCase());
      }
    }
  }
  const out: Record<string, SiteValue> = {};
  for (const code of codes) {
    const v = nisPer(fx, code, ctx.bundle.today);
    if (v) out[copy.pair.rateInput(code)] = v;
  }
  return out;
}

/**
 * What a run reads, as the sheet of every figure that comes out of it lists it (D7, D44): the plan's inputs, the exchange rates it is
 * priced at (F-84), the fund's own costs and payout yield (`fundInputs`), and, on a run of something the person typed, what they typed. A
 * bank's row that counts a current account lists the bank's monthly minimum too, its current-account price list the source, so the figure
 * that cost adds is one the sheet opens (F-102; the minimum was counted and shown nowhere). The one place that says what a
 * run reads, so no figure's sheet lists by hand.
 */
const inputsOfRun = (ctx: Ctx, r: RunReads): Record<string, SiteValue> => {
  const snap = r.house ? ctx.bundle.snapshots.find((s) => s.id === r.house) : undefined;
  const current = snap ? currentAccountOf(ctx, snap) : null;
  // D31: the bank's own figure, on the bank's own row (or an account built on it), weakens nothing
  const bank = snap && current ? (ctx.bundle.snapshots.find((x) => x.id === houseOfSnap(ctx, snap)) ?? snap) : null;
  const minimum = current && bank ? { [copy.pair.accountMinimum]: ownBy(current.monthly_minimum as SiteValue, bank.provider.name_he) } : {};
  const fundId = r.costsOff ? undefined : r.fund;
  const fund = fundId ? ctx.bundle.funds.find((f) => f.id === fundId) : undefined;
  const typed = [r.house, fundId].flatMap((id) => (id ? [ctx.bundle.entered?.inputs[id] ?? {}] : []));
  // a typed fund's costs are what was typed (below); its inside tax comes from what was said of it and of the index (F-107)
  const own = fund ? { ...(isCustomFund(fund) ? {} : fundInputsOf(ctx.bundle, fund)), ...insideTaxInput(ctx, r, fund) } : {};
  // the income and the age the run's tax reads (`profile.annualIncome` and `ageAtStart` in `runSlot`), on the figures that read that tax
  // (`RunReads.tax`), each only where it changed the result (`RunReads.profileUsed`): an age that never reaches 60 by the sale, an income
  // whose surtax test the gain never passes, changes nothing
  const distributes = !r.costsOff && !!(r.spec?.fund as { distribution?: unknown } | undefined)?.distribution;
  const used = r.profileUsed ?? [];
  const income = (r.tax === "after" || (r.tax === "before" && distributes)) && used.includes("income") && ctx.plan.values.income ? { [copy.pair.incomeInput]: ctx.plan.values.income } : {};
  const age = r.tax === "after" && used.includes("age") && ctx.plan.values.age ? { [copy.pair.ageInput]: ctx.plan.values.age } : {};
  return Object.assign({}, planInputs(ctx.plan, WHOLE_PLAN), income, age, ratesOfRun(ctx, r), minimum, own, ...typed);
};

const keptFundInputs = new WeakMap<FundRecord, { funds: readonly FundRecord[]; exposures: readonly ExposureRecord[]; today: string; inputs: Record<string, SiteValue> }>();
/**
 * `fundInputs` of a fund in the data, worked out once per fund and data: every run of the fund, at every house, reads the same figures, so
 * their sheets share one set of objects, and a copy of the S&P 500 page's view is about a fifth of what it is with a set per run.
 */
function fundInputsOf(bundle: IndicesBundle, rec: FundRecord): Record<string, SiteValue> {
  const kept = keptFundInputs.get(rec);
  if (kept && kept.funds === bundle.funds && kept.exposures === bundle.exposures && kept.today === bundle.today) return kept.inputs;
  const inputs = fundInputs(bundle, rec, gapListFor(bundle, rec));
  keptFundInputs.set(rec, { funds: bundle.funds, exposures: bundle.exposures, today: bundle.today, inputs });
  return inputs;
}

/**
 * The rule figures a case reads (F-107, F-133), each as the bundle holds it, keyed by its Hebrew name for a figure's sheet: a `RateOf` that
 * records what it read, so the sheet lists exactly the rates the run multiplied.
 */
function ruleRates(bundle: Pick<IndicesBundle, "rules" | "today">): { rate: RateOf; read: Record<string, SiteValue>; rules: { id: string; strength: Strength }[] } {
  const read: Record<string, SiteValue> = {};
  const rules = new Map<string, Strength>();
  const rate: RateOf = (id, figure) => {
    const rule = bundle.rules.find((x) => x.id === id);
    const v = rule ? ruleFigure(rule, figure, bundle.today) : null;
    if (!rule || !v || typeof v.value !== "number") throw new Error(`F-107: rule ${id} has no figure ${figure}`);
    read[copy.pair.fundInputs.rate(rule.figure_names_he?.[figure] ?? figure)] = v;
    rules.set(rule.id, rule.strength as Strength);
    return v.value / 100;
  };
  return { rate, read, get rules() { return [...rules].map(([id, strength]) => ({ id, strength })); } };
}

/** The yield and share a case's parts rest on, as sourced or entered values: a collected index's US part, or the yield typed for an added index. */
function partInputs(exposure: ReturnType<typeof exposureOf>, t: InsideTax): Record<string, SiteValue> {
  const w = copy.pair.fundInputs;
  if (exposure && "dividendYield" in exposure && exposure.dividendYield) return { [w.indexYield]: exposure.dividendYield as SiteValue };
  const us = exposure && "us_dividends" in exposure ? exposure.us_dividends : undefined;
  if (!us || t.parts.length === 0) return {};
  return { [w.usYield]: us.yield as SiteValue, ...(us.weight ? { [w.usWeight]: us.weight as SiteValue } : {}) };
}

/**
 * A-11 where the fund's run counts it by F-107 or F-133 (`fundOf` puts the case in the drag), with the rates and the index's yield and share
 * it multiplies. At two ends it is the cautious end, with a doubt that says both and why (method F-107, "One reading, or two ends"); a case
 * with nothing of the fund's own (its years carry it, F-133 (b)) has no line here.
 */
function insideTaxInput(ctx: Ctx, r: RunReads, rec: FundRecord): Record<string, SiteValue> {
  const d = r.spec?.fund.drag;
  const t = d?.insideTax;
  if (!t || d.foreignWithholding !== undefined || t.basis.kind === "none") return {};
  const reads = ruleRates(ctx.bundle);
  const ends = insideTaxEnds(t, reads.rate);
  if (ends.high === 0) return {};
  const w = copy.pair.fundInputs;
  const two = ends.low !== ends.high;
  const parts = partInputs(exposureOf(ctx, rec), t);
  const formula = ends.formulas.includes("F-107") ? "F-107" : "F-133";
  // one rate on one part: `w = ρ × y × s` (or `D = τ × y × s`), each input its symbol; an index of US companies alone has no share among the
  // inputs (its 1 is the method's)
  const [rateName, ...moreRates] = Object.keys(reads.read);
  const single = !two && rateName !== undefined && moreRates.length === 0 && t.parts.length === 1;
  const sym = formula === "F-107" ? String.raw`\rho_p` : String.raw`\tau_p`;
  const working = single ? ({ kind: "formula", entry: formula, line: 0, symbols: { [rateName]: sym, ...Object.fromEntries(Object.keys(parts).map((k) => [k, k === w.usWeight ? "s_p" : "y_p"])) } } as const) : undefined;
  const doubt = { labels: two && ends.open ? [{ code: "cautious" as const, ruleId: ends.open.rule, notKnown: "documents" as const, ends: { low: ends.low, high: ends.high, why: ends.open.why } }] : [] };
  const value = (two ? ends.high : ends.low) * 100;
  return {
    [w.insideTax]: computed(Math.round(value * 1000) / 1000, "pct_per_year", formula, { ...reads.read, ...parts }, { today: ctx.bundle.today, rules: reads.rules, flags: ends.flags, labels: doubt.labels, about: w.insideTaxAbout, ...(working ? { working } : {}) }),
  };
}

/**
 * F-133 (b): A-07 from a collected fund's years against a net index whose deduction is known, raised by that deduction less the fund's own
 * counted tax, with the two as figures of their own; null where the fund's case has no such years. The run charges the same (`fundOf`).
 */
function raisedGap(bundle: IndicesBundle, rec: FundRecord, list: GapList, years: readonly NonNullable<FundRecord["tracking_record"]>["years"][number][]): { value: number; inputs: Record<string, SiteValue>; rules: { id: string; strength: Strength }[] } | null {
  const exposure = bundle.exposures.find((e) => e.id === rec.exposure_id);
  const c = insideTaxCaseOf(rec, { dividends: dividendsOf(exposure), list, typed: false, withholding: typeof rec.fees.fund_level_withholding_drag?.value === "number", published: false });
  if (c.kind !== "counted" || !c.tax.years) return null;
  const w = copy.pair.fundInputs;
  const netRule = c.tax.netRule;
  const s = shortfallBeyondFees(years, sumFees(rec));
  if (s === null || !netRule) return null;
  // D on the index's parts at its provider's rates, and the fund's own counted tax on them, each read apart so each sheet lists its own
  const net = ruleRates(bundle);
  const deduction = netDeduction(c.tax.parts.flatMap((p) => p.countries.map((country) => ({ rate: net.rate(netRule, country), yield: p.yield, weight: p.weight }))));
  const own = ruleRates(bundle);
  const counted = insideTaxEnds({ basis: c.tax.basis, parts: c.tax.parts }, own.rate).low;
  const parts = partInputs(exposure, c.tax);
  const inputs: Record<string, SiteValue> = {
    [w.netDeduction]: computed(Math.round(deduction * 100 * 1e6) / 1e6, "pct_per_year", "F-133", { ...net.read, ...parts }, { today: bundle.today, rules: net.rules, about: w.netDeductionAbout }),
  };
  if (counted > 0) inputs[w.insideTax] = computed(Math.round(counted * 100 * 1e6) / 1e6, "pct_per_year", "F-107", { ...own.read, ...parts }, { today: bundle.today, rules: own.rules, about: w.insideTaxAbout });
  return { value: gapFromNet(s, deduction, counted), inputs, rules: [...net.rules, ...own.rules] };
}

/** A figure of a fund's annual report (a year's return, its index's, a fee it charged), from the report at its page: the fund's own document (D31). */
export function reportFigure(rec: FundRecord, value: number, page: number | null | undefined): SiteValue {
  const t = rec.tracking_record!;
  return ownBy({ ...(rec.fees.fixed_management as SiteValue), value, unit: "pct", source: { ...t.source, ...(page ? { page, locator_he: copy.kinds.gapPage(page) } : {}) }, checked: t.checked, notes: undefined, state: "sourced" } as SiteValue, rec.manager);
}

/**
 * The fund's yearly costs as the engine prices them (F-10, F-92 (b)): its listed fixed management and trustee fees, the variable fee priced
 * (the mean charged in the years at today's rate where the reports give A-07, else the listed rate) and A-07 from the reports with the
 * years it rests on; and, for a fund that pays out, its payout yield (A-10). Among the inputs of a figure that runs the fund, so two funds'
 * sheets show why one costs less.
 */
function fundInputs(bundle: IndicesBundle, rec: FundRecord, list: GapList): Record<string, SiteValue> {
  const today = bundle.today;
  const w = copy.pair.fundInputs;
  const out: Record<string, SiteValue> = {};
  const own = (v: unknown) => (v && typeof (v as SiteValue).value === "number" ? ownBy(v as SiteValue, rec.manager) : null);
  const fixed = own(rec.fees.fixed_management), trustee = own(rec.fees.trustee);
  const variable = pricedVariable(rec, list, today)?.value ?? own(rec.fees.variable_management);
  if (fixed) out[w.fixed] = fixed;
  if (variable) out[w.variable] = variable;
  if (trustee) out[w.trustee] = trustee;
  // A-10: the yield the run pays out at, as the record holds it from the fund's own documents (`recordDistribution`)
  const payout = rec.distribution_policy === "distributing" ? own(rec.distribution?.yield) : null;
  if (payout) out[w.payout] = payout;
  const a07 = a07FromReports(rec, list);
  const years = comparedYears(rec.tracking_record, list);
  const t = rec.tracking_record;
  if (a07 !== null && years && t) {
    // the years' own figures, each from the report at its page: the fund's return, its index's, and the fees it charged that year
    const inputs: Record<string, SiteValue> = {};
    for (const y of years) {
      inputs[copy.kinds.gapInputFund(y.year)] = reportFigure(rec, y.fund_pct, t.page);
      inputs[copy.kinds.gapInputBenchmark(t.benchmark.name, y.year)] = reportFigure(rec, y.tracking_pct, t.page);
      const c = y.fees_charged;
      if (c) {
        inputs[w.chargedFixed(y.year)] = reportFigure(rec, c.fixed, t.fees_page);
        inputs[w.chargedVariable(y.year)] = reportFigure(rec, c.variable, t.fees_page);
        inputs[w.chargedTrustee(y.year)] = reportFigure(rec, c.trustee, t.fees_page);
      }
    }
    // F-92 (b): a year whose report prints no fees charged (a foreign fund's factsheet) is measured against today's listed fees (`feesInYear`)
    if (years.some((y) => !y.fees_charged)) {
      const listed: [string, unknown][] = [[w.listedFixed, rec.fees.fixed_management], [w.listedVariable, rec.fees.variable_management], [w.listedTrustee, rec.fees.trustee]];
      for (const [name, v] of listed) {
        const fee = own(v);
        if (fee) inputs[name] = fee;
      }
    }
    const ys = years.map((y) => y.year);
    const raised = raisedGap(bundle, rec, list, years);
    out[w.beyond(ys)] = raised
      ? computed(Math.round(raised.value * 100 * 1000) / 1000, ys.length === 1 ? "pct" : "pct_per_year", "F-133", { ...inputs, ...raised.inputs }, { today, rules: raised.rules, about: w.beyondNetAbout(ys) })
      : computed(Math.round(a07 * 100 * 1000) / 1000, ys.length === 1 ? "pct" : "pct_per_year", "F-92", inputs, { today, about: w.beyondAbout(ys) });
  }
  return out;
}

/**
 * The run's flags that are about the account's cost, not about what is left: BANK-35 says the current account counted in the cost may be too high
 * from the cap's start (F-102), so it sits on the cost, where a cost too high is a cost too high, and not on the value left, which it would lower.
 */
const COST_FLAGS: readonly string[] = ["BANK-35"];

/**
 * `v` without the run's flags about the account's cost (`COST_FLAGS`): for a figure of what is left that a cost figure goes into (the
 * receipt's value before tax, F-129, and the inflation on it, F-130), since a computed figure carries its inputs' flags and a cost too high
 * would make that figure too low, not too high (F-102).
 */
export function withoutCostFlags(v: SiteValue): SiteValue {
  if (!v.flags?.some((f) => COST_FLAGS.includes(f))) return v;
  const { flags, flagMonths, ...rest } = v;
  const kept = flags.filter((f) => !COST_FLAGS.includes(f));
  const months = Object.entries(flagMonths ?? {}).filter(([code]) => !COST_FLAGS.includes(code));
  return { ...rest, ...(kept.length ? { flags: kept } : {}), ...(months.length ? { flagMonths: Object.fromEntries(months) } : {}) };
}

/** The open questions the house's price list leaves the run resting on (a line's `open_questions`, data-schema §3.6): said on what is left. */
const tariffQuestions = (row: ComparedProvider): string[] => row.flags.filter((f) => /^[A-Z0-9]+-OQ\d+$/.test(f));

/** Whether a deal's fee is the bank's current account (F-102), whose figure carries the run's flag about that cost (BANK-35). */
const feeIsAccount = (deal: { fees: readonly { id: string; kind: string }[] } | undefined, fee: string): boolean => deal?.fees.find((f) => f.id === fee)?.kind === "current_account";

/** The run's flags about the account's cost (`COST_FLAGS`), each with the month the run found it from. */
const costFlags = (row: ComparedProvider) => row.run.flags.filter((f) => COST_FLAGS.includes(f.code));
/** The run's flags about what is left (every flag but the cost's), each with its month, and the price list's open questions. */
const leftFlags = (row: ComparedProvider) => [...row.run.flags.filter((f) => !COST_FLAGS.includes(f.code)), ...tariffQuestions(row)];

/** An option's generic fund at a house (F-91 on F-63): the account's cost before tax, `whole` in whole shekels. */
function costValue(ctx: Ctx, row: ComparedProvider, spec: Spec, about: string | undefined, whole = false): SiteValue {
  return computed(whole ? Math.round(row.horizonCostBeforeTax) : row.horizonCostBeforeTax, "nis", "F-91", inputsOfRun(ctx, { house: row.id, spec, row, tax: "before", profileUsed: row.run.profileUsed }), { today: ctx.bundle.today, rules: rulesOf(row, accountParts(paysOut(spec))), flags: [...row.flags, ...costFlags(row)], about });
}

/** What is left with one account and one fund (F-65's real value), as every list and the stairs show it, with what its run reads. */
function valueFigure(ctx: Ctx, row: ComparedProvider, reads: RunReads & { spec: Spec }, about: string, extra: Record<string, SiteValue> = {}): SiteValue {
  return computed(row.real, "nis", "F-65", { ...inputsOfRun(ctx, { ...reads, tax: "after", profileUsed: row.run.profileUsed }), ...extra }, { today: ctx.bundle.today, rules: rulesOf(row, "all"), statements: statementsOf(row), flags: leftFlags(row), labels: labelsOf(row, reads.spec), about });
}

function wayPrice(ctx: Ctx, p: Extract<Priced, { kind: "ok" }>, providerId: string, about: string, fundId: string, spec: Spec): WayPrice {
  const row = p.row;
  const reads: RunReads & { spec: Spec } = { house: providerId, fund: fundId, spec, row, profileUsed: row.run.profileUsed };
  const value = valueFigure(ctx, row, reads, about);
  // F-91, F-109: the account's part less what the cash waiting for a whole unit did, so the figure is its fees, as on the receipt
  const fees = row.horizonCostBeforeTax - (unitsOf(row.run) ? (waitingReal(row.run) ?? 0) : 0);
  return {
    providerId,
    value,
    valueN: row.real,
    venue: p.venue,
    ...(p.listing ? { listing: p.listing } : {}),
    accountCost: fees,
    cost: computed(fees, "nis", "F-91", inputsOfRun(ctx, { ...reads, tax: "before" }), { today: ctx.bundle.today, rules: rulesOf(row, accountParts(paysOut(spec))), flags: costFlags(row), labels: row.run.labels.filter(beforeExitTax) }),
    standing: p.standing,
    aside: p.aside,
    units: unitsOf(row.run),
    profileUsed: row.run.profileUsed,
  };
}

/** The record's lines a run priced at the list's own level, and the current account it counted (`PairCosts.priced`). */
function pricedLines(ctx: Ctx, s: FeesSnapshot, row: ComparedProvider): PairCosts["priced"] {
  const entered = row.feeState === "entered";
  const listed = new Set(row.lineSources.filter((x) => x.level === "list").map((x) => x.lineId));
  const lines = entered ? [] : row.linesUsed.flatMap((id) => { const l = scoped(s).lines.find((x) => x.id === id); return l && listed.has(id) ? [l] : []; });
  const counted = row.byType.some((x) => x.line === "account");
  return { lines, currentAccount: !entered && counted ? (currentAccountOf(ctx, s) ?? null) : null, house: s.provider.name_he, entered };
}

// ---------------------------------------------------------------- funds


/**
 * The index a fund is on, as its run reads it: a collected one, or the one the person added, whose currency is not known: in shekels where
 * they said the fund's index is, else in the foreign currency the fund is bought in, so a fund in euros on it moves with the euro (F-65),
 * else the stand-in of `customExposures`.
 */
function exposureOf(ctx: Ctx, rec: FundRecord) {
  const typed = ctx.bundle.entered;
  const entered = typed?.exposures[rec.exposure_id];
  const collected = ctx.bundle.exposures.find((e) => e.id === rec.exposure_id);
  if (collected || !typed || !entered) return collected ?? entered;
  const seen = addedIndexCurrency({ shekelIndex: typed.shekelFunds.includes(rec.id), boughtIn: typed.boughtIn[rec.id] ?? null });
  switch (seen.kind) {
    case "shekel":
      return { ...entered, currency: "ILS" };
    case "bought-in":
      return { ...entered, currency: seen.currency };
    case "stand-in":
      return entered;
    default:
      return assertNever(seen);
  }
}

function fundSpec(ctx: Ctx, rec: FundRecord): { spec: Spec; mismatch: boolean } | { reason: Reason } {
  const exposure = exposureOf(ctx, rec);
  const subject = subjectOf(ctx.bundle, rec.id);
  if (!subject) return { reason: { code: "fund-type" } };
  // a fund the person typed: what they left unsaid is named, never filled in
  const gap = isCustomFund(rec) ? (customFundGaps(rec)[0] ?? null) : null;
  if (gap) return { reason: { code: gap } };
  // a hedged fund's cost is mostly beyond its fees (F-92 (c)): with no compared year in its report (none, or none F-92 (d) compares) and
  // no published figure it is not priced, never priced at A-07 = 0
  const list = gapListFor(ctx.bundle, rec);
  if (rec.hedged === true && !comparedYears(rec.tracking_record, list) && typeof rec.fees.tracking_difference_12m?.value !== "number") return { reason: { code: isCustomFund(rec) ? "no-hedge-entered" : "no-hedge-record" } };
  const run = fundRun(subject, exposure, ctx.plan.grossReturn, ctx.assumptions, ctx.bundle.fx, list);
  if ("kind" in run) return { reason: run.kind === "need-rate" ? { code: "need-rate", currency: run.currency } : run.kind === "need-yield" ? { code: "need-yield" } : { code: "fund-type" } };
  const spec: Spec = { fund: run.fund, market: run.market, ...(run.currency ? { currency: run.currency } : {}), cls: subject.instrumentClass, place: placeOf(rec, subject.instrumentClass) };
  // a fund whose tax rests on an open rule is listed with the reason and no rank (F-04); a fund whose tax index is an open reading (TXS OQ26,
  // TXF OQ10) computes, on the site's reading where the site read its documents (D119), else on the reading that leaves less where they
  // split, and a foreign fund's distribution on the site's reading that it is a dividend (F-20, D85)
  const own = { goal: goalOf(ctx), market: { ...spec.market, inflation: ctx.plan.inflation }, fund: spec.fund, tariff: spec.currency ? { currency: spec.currency } : {}, profile: profileOf(ctx) };
  const stop = securitiesStopOf(own, ruleContext(ctx.bundle));
  if (stop) {
    return { reason: { code: "rule-open", ruleId: stop.ruleId, ...(stop.question ? { question: stop.question } : {}) } };
  }
  // as the engine flags it (E4): a fund in a foreign currency other than its index's; a shekel fund on a dollar index is the usual case, not a mismatch
  const mismatch = !!exposure && !isShekel(rec.currency) && rec.currency !== exposure.currency;
  return { spec, mismatch };
}

/**
 * F-109 (D94), F-65: where a fund is bought: an Israeli ETF and a foreign fund's Tel Aviv line on TASE, a fund abroad on the exchange it
 * trades on, or on each where its record says that is not known. A tracking fund is bought from its manager by amount and has none. A fund
 * abroad whose exchange nothing names is a collected record the data check refuses (`venueOfFund`): a broken invariant, never priced by
 * amount or on a guessed exchange.
 */
function placeOf(rec: FundRecord, cls: string): Place {
  if (cls === "etf_units" || cls === "tase_foreign_fund_units") return { at: "listed", listing: "tase" };
  if (cls !== "foreign_securities") return { at: "none" };
  if (rec.exchange === "unknown") return { at: "unknown-exchange" };
  const venue = venueOfFund(rec);
  if (!venue) throw new Error(`fund ${rec.id} is bought abroad and names no exchange: a collected record needs an exchange ticker (validate.ts checkFundTickerExchange)`);
  return { at: "listed", listing: venue };
}

/** F-109: a fund bought in whole units whose record holds no unit price: priced by amount, and its row says the price was not collected, or, on a fund the person typed, not entered. */
export const unitPriceMissing = (rec: FundRecord, option: OptionId): boolean => option !== "il-tracking" && typeof rec.share_price?.value !== "number";

/** F-109: what whole units did to a way's monthly purchases, from its run; null where the house buys by amount. */
export function unitsOf(run: { detail: Record<string, number> }): WayPrice["units"] {
  const d = run.detail;
  if (!d.wholeUnits) return null;
  return { monthly: d.monthlyBuys ?? 0, skipped: d.monthlySkipped ?? 0 };
}

const nameOf = (rec: FundRecord) => rec.names.he[0] ?? rec.names.en[0] ?? rec.id;
/** A fund the person typed with no number has none to show: its id is the site's own. */
// a fund with neither number is known by its ticker (a US fund: "VOO"), never by the site's own record id ("us-voo")
const tickerOf = (rec: FundRecord) => Object.values(rec.identifiers.ticker ?? {})[0] ?? null;
const numberOf = (rec: FundRecord) => rec.identifiers.tase_number ?? rec.identifiers.isin ?? tickerOf(rec) ?? (isCustomFund(rec) ? "" : rec.id);

// ---------------------------------------------------------------- the option

/** One fund of an option at every house (F-63, F-65): its price at each house that sells it, or why it has none, and its cheapest ranked house. */
function fundWayOf(ctx: Ctx, rec: FundRecord, option: OptionId): FundWay {
  const base = { rec, name: nameOf(rec), number: numberOf(rec), option, kind: kindOfFund(rec, option), currencyMismatch: false, noUnitPrice: unitPriceMissing(rec, option), byHouse: {} as FundWay["byHouse"] };
  const fs = fundSpec(ctx, rec);
  const venue = option === "abroad" ? venueOfFund(rec) : null;
  // the houses that sell this fund: the kind, and where a house sells it fund by fund, the fund itself (BRK-38)
  const sells = ctx.snaps.filter((s) => sellsFund(s, option, rec));
  if ("reason" in fs) return { ...base, reason: fs.reason };
  // the fund at every house that sells it, the exchange it trades on for a fund abroad
  const got = sells.length ? priceMany(ctx, fs.spec, option, sells, venue) : new Map<string, Priced>();
  const ways: WayPrice[] = [];
  let failure: Reason | undefined;
  for (const s of ctx.snaps) {
    const na = unavailable(s, option);
    if (na) {
      base.byHouse[s.id] = { providerId: s.id, reason: { code: "no-applicable-line", detail: "unavailable" }, availability: na };
      continue;
    }
    // sold fund by fund: a fund the person typed is not named by any report; a fund no report names is open, with its own words
    const agreed = agreementAt(s, option, rec);
    if (agreed?.at === "typed") {
      base.byHouse[s.id] = { providerId: s.id, reason: { code: "sold-fund-by-fund" } };
      continue;
    }
    if (agreed?.at === "open") {
      base.byHouse[s.id] = { providerId: s.id, reason: { code: "no-agreement-found" }, doubt: agreed.doubt };
      continue;
    }
    const p = got.get(s.id)!;
    if (p.kind === "ok") {
      const w = wayPrice(ctx, p, s.id, nameOf(rec), rec.id, fs.spec);
      base.byHouse[s.id] = w;
      ways.push(w);
    } else {
      base.byHouse[s.id] = { providerId: s.id, reason: p.reason, ...(p.listing ? { listing: p.listing } : {}) };
      failure ??= p.reason;
    }
  }
  const best = rankByValue(ways, (w) => w.valueN)[0];
  return { ...base, currencyMismatch: fs.mismatch, ...(best ? { best } : failure ? { reason: failure } : { reason: { code: "no-applicable-line", detail: "no broker" } }) };
}

function computeOption(ctx: Ctx, index: IndexRef, option: OptionId): OptionView {
  const exists = optionsOf(index.israeli).includes(option);
  const empty: OptionView = { id: option, exists, notRunnable: null, cells: [], funds: [], bestWay: null };
  if (!exists) return empty;
  const spec = genericSpec(ctx, option);
  if (!spec) return { ...empty, notRunnable: "no-rate" };

  // (b) the broker cost of the option: a generic fund with no fees of its own
  const priceable = ctx.snaps.filter((s) => !unavailable(s, option));
  // a house that sells the kind fund by fund has no price for a fund it does not name: its open entry says why (`doubtOf`)
  const priced = priceMany(ctx, spec, option, priceable.filter((s) => !byFund(s, option)), null);
  const cells: BrokerCell[] = ctx.snaps.map((s) => {
    const na = unavailable(s, option);
    if (na) return { providerId: s.id, kind: "unavailable", availability: na };
    if (byFund(s, option)) return { providerId: s.id, kind: "not-comparable", reason: { code: "sold-fund-by-fund" } };
    const p = priced.get(s.id)!;
    if (p.kind === "ok") {
      const row = p.row;
      const cell: BrokerCell = {
        providerId: s.id,
        kind: "cost",
        option,
        cost: costValue(ctx, row, spec, copy.houses.costAbout(s.provider.name_he)),
        costN: row.horizonCostBeforeTax,
        venue: p.venue,
        standing: p.standing,
        aside: p.aside,
      };
      cellRuns.set(cell, { row, spec });
      return cell;
    }
    return { providerId: s.id, kind: p.reason.code === "no-applicable-line" ? "no-line" : "not-comparable", reason: p.reason };
  });

  // (a) the funds of the option, each at its cheapest broker
  // a custom index has no exposure record: a fund the person added on it names the index itself (D44)
  const recs = ctx.bundle.funds.filter((f) => f.exposure_id === (index.exposure?.id ?? index.id) && optionOfFund(f, index.exposure ?? undefined) === option);
  const funds: FundWay[] = recs.map((rec) => fundWayOf(ctx, rec, option));
  funds.sort((a, b) => (b.best?.valueN ?? -Infinity) - (a.best?.valueN ?? -Infinity));
  const top = funds.find((f) => f.best);
  const bestWay: Way | null = top?.best ? { option, fund: top, providerId: top.best.providerId, value: top.best.value, valueN: top.best.valueN } : null;
  return { ...empty, cells, funds, bestWay };
}

// ---------------------------------------------------------------- the view

function core(ctx: Ctx, index: IndexRef): OptionView[] {
  return OPTION_IDS.map((o) => computeOption(ctx, index, o));
}

/**
 * A fund the page may open on: not a currency-hedged one. The engine gives a hedged fund the same return as one
 * that keeps the index's currency and no field holds what the hedge costs, so its lower fee alone would win between two different
 * holdings. Hedged funds stay in the lists with their label, priced, and the person can pick one; hedging is a label, not a filter (D28).
 */
export const opensOn = (rec: FundRecord): boolean => rec.hedged !== true;

/** The headline: the best way over the options, among funds the page may open on when there are any. */
function headlineOf(options: OptionView[]): Way | null {
  const ways = options.flatMap((o) => o.funds.flatMap((f): Way[] => (f.best ? [{ option: o.id, fund: f, providerId: f.best.providerId, value: f.best.value, valueN: f.best.valueN }] : [])));
  const from = ways.some((w) => opensOn(w.fund.rec)) ? ways.filter((w) => opensOn(w.fund.rec)) : ways;
  return from.sort((a, b) => b.valueN - a.valueN)[0] ?? null;
}


/** Fund first by value left, then the ones with no price. */
const entryOrder = (a: HouseEntry, b: HouseEntry) => Number(!a.price) - Number(!b.price) || (b.price?.valueN ?? 0) - (a.price?.valueN ?? 0);

/** The run behind each priced cell, for the house rows that show its split (`splitOf`): a cell holds only what it shows. */
const cellRuns = new WeakMap<BrokerCell, { row: ComparedProvider; spec: Spec }>();

/** A house's cheapest cell's cost in whole shekels and its split by fee line, which takes a run per line. */
function splitOf(ctx: Ctx, cell: BrokerCell): CostSplit {
  const run = cellRuns.get(cell);
  if (!run) throw new Error(`splitOf: the priced cell of ${cell.providerId} has no run`);
  const lines = run.row.byType.map((x) => ({ line: x.line, cost: x.costBeforeTax }));
  return { whole: costValue(ctx, run.row, run.spec, undefined, true), lines, interaction: run.row.horizonCostBeforeTax - lines.reduce((t, l) => t + l.cost, 0) };
}

/** A view with no pair to show: no option has a way that leaves something (`bestWay`), so the page shows the account list of an index with no fund to price. */
const pairlessOf = (options: OptionView[]): boolean => !options.some((o) => o.bestWay);

function housesOf(ctx: Ctx, options: OptionView[], providers: ProviderInfo[]): HouseRow[] {
  const pairless = pairlessOf(options);
  const rows = providers.map((provider): HouseRow => {
    // a broker the person typed is in the group of what it sells; selling both, all of it counts (D44)
    const entered = ctx.snaps.find((s) => s.id === provider.id);
    const group: HouseGroup = provider.foreign || (provider.custom && !!entered && !!unavailable(entered, "il-etf")) ? "foreign" : "il";
    const opts = options.filter((o) => o.exists && (provider.custom || (GROUP_OPTIONS[group] as readonly OptionId[]).includes(o.id)));
    const entries = opts.flatMap((o) => o.funds).map((fund): HouseEntry => {
      const at = fund.byHouse[provider.id];
      return at && "value" in at ? { fund, price: at, reason: null } : { fund, price: null, reason: at?.reason ?? fund.reason ?? { code: "data-missing", recorded: null } };
    }).sort(entryOrder);
    const best = entries.find((e) => e.price) ?? null;
    // no fund record at all: the broker cost of the group's options, the cheapest
    const cells = opts.flatMap((o) => o.cells.filter((c) => c.providerId === provider.id));
    const generic = cells.filter((c) => c.kind === "cost").sort((a, b) => a.costN! - b.costN!)[0] ?? null;
    const split = generic && pairless ? splitOf(ctx, generic) : null;
    const na = cells.find((c) => c.kind === "unavailable");
    const reason = best || generic ? null : (entries.find((e) => e.reason)?.reason ?? cells.find((c) => c.reason)?.reason ?? null);
    const standing = cells.some((c) => c.standing) || entries.some((e) => e.price?.standing);
    const aside = [...new Set([...cells.flatMap((c) => c.aside ?? []), ...entries.flatMap((e) => e.price?.aside ?? [])])];
    return { provider, group, entries, best, unavailable: !best && !generic ? (na?.availability ?? null) : null, reason, generic, split, standing, aside };
  });
  const priced = (r: HouseRow) => r.best ?? r.generic;
  const cost = (r: HouseRow) => (r.best ? -r.best.price!.valueN : r.generic ? r.generic.costN! : Infinity);
  return rows.sort((a, b) => Number(!priced(a)) - Number(!priced(b)) || a.group.localeCompare(b.group) * -1 || cost(a) - cost(b) || a.provider.name.localeCompare(b.provider.name, "he"));
}

export interface InvestArgs {
  bundle: IndicesBundle;
  index: IndexRef;
  plan: WorkbenchInputs;
  yourBroker?: string | null;
  assumptions?: FundAssumptions;
}

/** The index page's view of one plan. Its runs are worked out once each while it builds (`withRunMemo`): about a quarter repeat. */
export function buildInvest(a: InvestArgs): InvestView {
  return withRunMemo(() => build(a));
}

function build(a: InvestArgs): InvestView {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const yourBroker = a.yourBroker && ctx.snaps.some((s) => s.id === a.yourBroker) ? a.yourBroker : null;
  const options = core(ctx, a.index);
  const headline = headlineOf(options);
  const providers = ctx.snaps.map(providerInfo);
  return {
    index: a.index,
    options,
    providers,
    headline,
    yourBroker,
    houses: housesOf(ctx, options, providers),
    returnPct: a.plan.grossReturn * 100,
    fundCount: a.bundle.funds.filter((f) => f.exposure_id === (a.index.exposure?.id ?? a.index.id)).length,
  };
}

// ---------------------------------------------------------------- one account and one fund, broken down (the index page's result)

export interface PairCosts {
  providerId: string;
  fundId: string;
  /** What the person puts in: the amount now and every monthly deposit (F-05), in today's shekels (F-06). */
  paidIn: SiteValue;
  /** The same deposits in the shekels each is paid in, the monthly deposit rising with prices (F-05, A-04): the run's own sum. */
  paidInNominal: SiteValue;
  /**
   * `I_T`, the run's price index at the horizon (F-03, the plan's inflation over its years): every F-91 figure is a value at the horizon
   * divided by it, so times it, it is the same figure in the shekels of the horizon (F-06 read back, the receipt's chain in nominal shekels).
   */
  index: SiteValue;
  /** The same deposits grown at the plan's return with no fee and no tax (F-91): `left` plus every cost. */
  base: number;
  /** `base` as a figure (F-91's X), with what its run reads: the plan and the exchange rate, none of the fund's or the account's prices. */
  baseValue: SiteValue;
  /** Real value left at the horizon (F-65). */
  left: SiteValue;
  /** The account's own lines over the horizon before the tax they save (F-91), real shekels; `interaction` is what no single line explains. */
  account: { line: FeeLine; cost: SiteValue }[];
  /**
   * F-128: an account priced by a deal, its lines as the deal's own fees, by the deal's fee id (a bank's current account among them, the
   * deal's own fee of that kind) with the fee's name, each what was paid on it carried as its line is (F-91). They stand in
   * place of `account`, which is then empty, and `interaction` is what they leave of the account's fees.
   */
  dealLines?: { fee: string; name: string; cost: SiteValue }[];
  interaction: number;
  /** `interaction` as a figure (F-91), so the account's fees add up figures that each open (`accountSum`). */
  remainder: SiteValue;
  /** The account's whole part before the tax it saves (F-91): its fees (`accountFees`) and, in whole units, the waiting cash (`waitingN`). */
  accountCost: number;
  /** What the account's fees took before the tax they save (F-91): its lines and `interaction` together, without the waiting cash. */
  accountFees: number;
  /**
   * F-109, F-91: in whole units, what the cash waiting for a unit did against the fund, before tax, in today's shekels: above zero where it
   * missed a rise, below zero where it missed a fall (a gain). Not a fee: the receipt writes it on its own line. 0 and null by amount.
   */
  waitingN: number;
  waiting: SiteValue | null;
  /** The fund pays out (A-10): the state's part holds the tax on what it pays as well as the capital gains tax at the sale. */
  distributes: boolean;
  /** The fund's own costs (management, variable, trustee, tracking, spread, withholding inside it) before the tax they save, with no account (F-91): the same at every account. */
  fund: SiteValue;
  /** The state's part (F-91): what remains, the tax paid during and at exit with the growth a tax paid along the way would have earned, at the horizon in today's shekels. */
  tax: SiteValue;
  /** F-109: the house buys the fund in whole units (`WayPrice.units`); what the waiting cash did is then `waiting`. */
  units: WayPrice["units"];
  /**
   * The price list as the run read it, so a fee's rate can be said as the list prints it (`lib/rate-words`): the record's lines the run
   * priced at the list's own level, the bank's current account where the run counts one, and the house's name for their source. `entered`:
   * the prices are the person's (an account they typed or built on a house), so no line is the list's.
   */
  priced: { lines: FeesSnapshot["lines"]; currentAccount: FeesSnapshot["current_account"] | null; house: string; entered: boolean };
}

/** One account and one fund on a plan, ready to price; null when the account does not sell the fund or the fund cannot be run. */
function pairOf(ctx: Ctx, a: { index: IndexRef; fundId: string; providerId: string }) {
  const rec = ctx.bundle.funds.find((f) => f.id === a.fundId);
  const s = ctx.snaps.find((x) => x.id === a.providerId);
  if (!rec || !s) return null;
  const option = optionOfFund(rec, a.index.exposure ?? undefined);
  if (!sellsFund(s, option, rec)) return null;
  const fs = fundSpec(ctx, rec);
  if ("reason" in fs) return null;
  const venue = option === "abroad" ? venueOfFund(rec) : null;
  const price = (spec: Spec) => {
    const p = priceMany(ctx, spec, option, [s], venue).get(s.id);
    return p && p.kind === "ok" ? p.row : null;
  };
  return { rec, s, fs, price };
}

/** `pairCosts`, kept per data and plan object: the receipt and the lists' fund parts price the same pair on the same plan, once. */
const keptCosts = new WeakMap<object, WeakMap<object, Map<string, PairCosts | null>>>();
export function pairCostsKept(a: InvestArgs & { fundId: string; providerId: string }): PairCosts | null {
  if (a.assumptions) return pairCosts(a);
  let byPlan = keptCosts.get(a.bundle);
  if (!byPlan) keptCosts.set(a.bundle, (byPlan = new WeakMap()));
  let kept = byPlan.get(a.plan);
  if (!kept) byPlan.set(a.plan, (kept = new Map()));
  const key = `${a.index.id}|${a.fundId}|${a.providerId}`;
  if (!kept.has(key)) kept.set(key, pairCosts(a));
  return kept.get(key)!;
}

/**
 * The cost of one complete way, split by who takes it (F-91): the account (its tariff lines) and the fund
 * (all its own costs) before the tax they save, the fund measured with no account so it is the same at every account, and the
 * state what remains (the tax paid, with the growth a tax paid along the way would have earned). The parts add up to
 * `base − left`, base being the deposits grown at the plan's return with no cost and no tax, the same for every way on the
 * plan: so the gap in what is left between two ways is the gap in their costs. Null when the account cannot price the fund.
 */
export function pairCosts(a: InvestArgs & { fundId: string; providerId: string }): PairCosts | null {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const pair = pairOf(ctx, a);
  if (!pair) return null;
  const { rec, s, fs, price } = pair;
  const row = price(fs.spec);
  if (!row) return null;
  const fund0 = fs.spec.fund as { drag?: Record<string, number>; halfSpread?: number; distribution?: unknown };
  // the fund with none of its own costs (fees, tracking, spread, withholding inside it: all the fund's, TXF-16), and the plan's
  // return alone: the same with no distribution either, so no tax is paid along the way
  const { distribution, ...noDist } = fund0;
  const costsOff = { ...fs.spec, fund: { ...fund0, halfSpread: 0, drag: {} } } as Spec;
  const r0 = price(costsOff);
  const rX = distribution ? price({ ...fs.spec, fund: { ...noDist, halfSpread: 0, drag: {} } } as Spec) : r0;
  if (!r0 || !rX) return null;
  const noAccount = (r: ComparedProvider) => r.horizonCostBeforeTax + beforeTax(r.run);
  const base = noAccount(rX);
  // F-109: in whole units, the waiting cash's part of the account's, its own line (F-91)
  const waitingN = unitsOf(row.run) ? (waitingReal(row.run) ?? 0) : 0;
  const parts = costByWho({ base, left: row.real, account: row.horizonCostBeforeTax, fund: noAccount(r0) - noAccount(row), waiting: waitingN });
  // the whole run (the account and the fund); the fund's part is measured with no account, so it reads none of the account's prices
  const run = { house: s.id, fund: rec.id, spec: fs.spec, row, profileUsed: row.run.profileUsed };
  // what each figure reads of the run's tax (`RunReads.tax`): what is left and the tax read it all, a difference of `B` reads it on a fund
  // that pays out, and a line carried in whole units or of a deal, and the waiting cash, read no profile (F-91's t takes no surtax)
  const inputs = inputsOfRun(ctx, run);
  const taxedInputs = inputsOfRun(ctx, { ...run, tax: "after" });
  const bInputs = inputsOfRun(ctx, { ...run, tax: "before" });
  // each figure lists the rules of the parts its number is made of (`rulesOf`). On a fund that pays out every one of them rests on the
  // payout's tax: a difference of `B` counts the tax paid at face and not the growth it forgoes, so it takes the whole tax during the run;
  // a money carried to the horizon grows at the fund's return less the tax a shekel held pays on the payout, so it takes that tax alone
  // (`carriedParts`)
  const payout = !!distribution;
  const at = (n: number, formula: string, about: string, from: Record<string, SiteValue>, parts: RunParts, flags: readonly FlagIn[] = []) => computed(n, "nis", formula, from, { today: ctx.bundle.today, rules: rulesOf(row, parts), about, ...(flags.length ? { flags } : {}) });
  const paidInReal = paidInAsEntered(ctx.plan.amountNow, ctx.plan.monthly, ctx.plan.years);
  const depositsRise = ctx.plan.monthly > 0 ? { caveat: copy.pair.paidInCaveat } : {};
  // the run's own price index at the horizon (F-03): the last month of its path, which is the horizon's
  const end = row.run.series.at(-1);
  if (!end || end.month !== row.run.exitMonth) throw new Error(`pairCosts: the run's index path ends at month ${String(end?.month)}, not at its exit, ${row.run.exitMonth}`);
  // F-128: an account priced by a deal writes its lines as the deal's own fees, each what was paid on it carried as its line is (F-91)
  const deal = ctx.bundle.deals?.byId[s.id];
  const ids = row.account ? feeIdsOf(row.account.deal) : undefined;
  const byDealFee = new Map<string, number>();
  for (const x of row.byFee ?? []) {
    const id = ids?.[x.fee];
    if (id !== undefined) byDealFee.set(id, (byDealFee.get(id) ?? 0) + x.costBeforeTax);
  }
  // every fee the run charges is one of the deal's own (`feeIdsOf`): one that is not is a broken invariant
  const feeWords = (id: string) => {
    const f = deal?.fees.find((x) => x.id === id);
    if (!f) throw new Error(`pairCosts: the run charged fee ${id}, which deal ${s.id} does not hold`);
    return feeNameOf(f.kind, f.name);
  };
  // a deal's fee is no one line of the Tally's, so it takes the account's lines, carried as the deal's popup carries it (`dealOnFunds`)
  const dealLines = deal && ids ? [...byDealFee].map(([fee, n]) => ({ fee, name: feeWords(fee), cost: at(n, "F-91", copy.pair.lineAbout(feeWords(fee)), inputs, carriedParts(ACCOUNT_LINES, payout), feeIsAccount(deal, fee) ? costFlags(row) : []) })) : undefined;
  // each line takes its own fee line, and on a fund that pays out the tax during the run where it is a difference of `B`, the payout's tax
  // where it is carried in whole units; the bank's current account carries the run's flag about its cost (BANK-35, F-102)
  const lines = dealLines
    ? []
    : row.byType.map((x) => {
        const before = !unitsOf(row.run);
        const parts: RunParts = before ? [{ part: "fees", lines: [x.line] }, ...(payout ? (["taxDuring"] as const) : [])] : carriedParts([x.line], payout);
        return { line: x.line, cost: at(x.costBeforeTax, "F-91", copy.pair.lineAbout(copy.pair.lines[x.line] ?? copy.pair.lines.other!), before ? bInputs : inputs, parts, x.line === "account" ? costFlags(row) : []) };
      });
  // what no single line explains, without the waiting cash: the account's fees less its lines, the deal's own where it is priced by a deal
  const interaction = parts.fees - (dealLines ? [...byDealFee.values()].reduce((t, n) => t + n, 0) : row.byType.reduce((t, x) => t + x.costBeforeTax, 0));
  return {
    providerId: s.id,
    fundId: rec.id,
    ...(dealLines ? { dealLines } : {}),
    // what was paid in, in today's money (F-106): the amount, the deposit and the years, and nothing else
    // the monthly deposit rises with prices each month (A-04 "constant real", F-05), so in today's money it is the same each month: a caveat
    // of the figure, since A-04 is the method's setting and no value to list, and only where there is a monthly deposit for it to raise
    paidIn: computed(paidInReal, "nis", "F-106", planInputs(ctx.plan, ["amount", "monthly", "years"]), { today: ctx.bundle.today, about: copy.pair.paidInAbout, ...depositsRise, working: paidInWorking(copy.planInputs.amount, copy.planInputs.monthly, copy.planInputs.years) }),
    paidInNominal: computed(row.run.paidIn, "nis", "F-05", planInputs(ctx.plan, ["amount", "monthly", "years", "inflation"]), { today: ctx.bundle.today, about: copy.pair.paidInNominalAbout, ...depositsRise }),
    index: computed(end.index, "index_points", "F-03", planInputs(ctx.plan, ["inflation", "years"]), { today: ctx.bundle.today, about: copy.pair.indexAbout }),
    left: computed(row.real, "nis", "F-65", taxedInputs, { today: ctx.bundle.today, rules: rulesOf(row, "all"), statements: statementsOf(row), flags: leftFlags(row), labels: labelsOf(row, fs.spec), about: nameOf(rec) }),
    account: lines,
    interaction,
    remainder: at(interaction, "F-91", copy.pair.lineAbout(copy.pair.remainder), bInputs, accountParts(payout)),
    accountCost: row.horizonCostBeforeTax,
    accountFees: parts.fees,
    waitingN,
    waiting: unitsOf(row.run) ? at(waitingN, "F-109", copy.pair.waitingAbout, inputs, carriedParts([], payout)) : null,
    distributes: !!distribution,
    // the fund's part is measured with no account, the tax added back (`noAccount`): a difference of `B` whose two runs both pay out where
    // the fund does, so there it rests on the tax during the run as the account's part does
    fund: at(parts.fund, "F-91", copy.pair.fundAbout, inputsOfRun(ctx, { fund: rec.id, spec: fs.spec, tax: "before", profileUsed: row.run.profileUsed }), [{ part: "fees", lines: FUND_LINES }, ...(payout ? (["taxDuring"] as const) : [])]),
    // the state's part holds the tax during the run and at its exit; the tax inside the fund's price cancels out of it (`costByWho`)
    tax: computed(parts.state, "nis", "F-91", taxedInputs, { today: ctx.bundle.today, rules: rulesOf(row, ["taxDuring", "taxAtExit"]), statements: statementsOf(row), labels: labelsOf(row, fs.spec), about: distribution ? copy.pair.taxAboutPayouts : copy.pair.taxAbout }),
    base,
    // X reads the plan and the rate alone: no fund cost, no distribution, no account (its run's rules are a tax's, which X is before)
    baseValue: computed(base, "nis", "F-91", inputsOfRun(ctx, { spec: fs.spec, costsOff: true }), { today: ctx.bundle.today, about: copy.pair.baseAbout }),
    units: unitsOf(row.run),
    priced: pricedLines(ctx, s, row),
  };
}

/**
 * One fund on a plan at every house, priced as the lists price it (`fundWayOf`, F-63, F-65): each house's `WayPrice` (what is left, `valueN`,
 * the figure the account list ranks by) or why it has none. `houses` limits the pricing to those houses (the others are absent from
 * `byHouse`), for a caller that prices the same fund at many plans and has already ruled the rest out. Null where the fund is not on the
 * bundle or not on the index.
 */
export function fundWayAt(a: InvestArgs & { fundId: string; houses?: readonly string[] }): FundWay | null {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const rec = ctx.bundle.funds.find((f) => f.id === a.fundId);
  if (!rec) return null;
  const option = optionOfFund(rec, a.index.exposure ?? undefined);
  if (!optionsOf(a.index.israeli).includes(option)) return null;
  const only = a.houses;
  return fundWayOf(only ? { ...ctx, snaps: ctx.snaps.filter((s) => only.includes(s.id)) } : ctx, rec, option);
}

/**
 * The run a deal account is read for on one fund of the plan (F-128, `DealRun`): what is bought and where, its currency and its payouts;
 * null where the fund does not run. A fund bought abroad whose exchange is not known is bought where the deal's price on it was read,
 * `listing` (`DealOnPlan.listing`, or the fund's `byHouse` entry at the deal): where it is priced, or the reading whose reason its row gives.
 */
export function dealRunOf(a: InvestArgs & { fundId: string; listing?: DealRun["listing"] }): DealRun | null {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const rec = ctx.bundle.funds.find((f) => f.id === a.fundId);
  if (!rec) return null;
  const fs = fundSpec(ctx, rec);
  if ("reason" in fs) return null;
  const { spec } = fs;
  return { instrumentClass: spec.cls, listing: listingOfPlace(spec.place) ?? a.listing, currency: spec.currency?.code ?? null, distributes: !!(spec.fund as { distribution?: unknown }).distribution, fx: ctx.fx };
}

/**
 * A deal account on one fund of the plan (F-128): what it leaves, what each of its fees took before the tax it saves (F-91), by the deal's
 * fee id, and, for each of the run's fees with a step, the run months a charge fell in all its steps (`dealReach`, by the run's fee index).
 */
export type DealOnPlan =
  | {
      kind: "ok";
      valueN: number;
      byFee: Record<string, number>;
      accountCost: number;
      reach: number[][];
      /**
       * A fee's figure of this run as the popup shows it (F-128): `n` shekels, computed from the run's inputs and the account's rules, `about`
       * saying which; `fee`, the deal's fee it is, so the bank's current account carries the run's flag about that cost (BANK-35).
       */
      figure: (n: number, about: string, fee?: string) => SiteValue;
      /** What is left after the run's tax as a figure, which reads the income and age the tax does (`RunReads.tax`). */
      left: (n: number, about: string) => SiteValue;
      /** Where the fund is bought on the reading priced (`Priced.listing`), which the deal's run is read for (`dealRunOf`). */
      listing?: DealRun["listing"];
    }
  | { kind: "fail"; reason: NotComparable | Reason; /** Where the fund is bought on the reading whose reason this is; absent where the fund does not run. */ listing?: DealRun["listing"] };

/**
 * One deal account priced on one fund of the plan, alone (F-128): the popup that edits the deal reads it as the person types, where the
 * whole page waits until the deal is saved and the popup closes. Null where the account is not on the bundle or the fund not on the index.
 */
export function dealOnPlan(a: InvestArgs & { fundId: string; providerId: string }): DealOnPlan | null {
  return dealOnFunds({ ...a, fundIds: [a.fundId] }).get(a.fundId) ?? null;
}

/** `dealOnPlan` on each of several funds, read with one context: the deal's own cheapest way among them is the popup's place (F-63). */
export function dealOnFunds(a: InvestArgs & { fundIds: readonly string[]; providerId: string }): Map<string, DealOnPlan> {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const out = new Map<string, DealOnPlan>();
  const s = ctx.snaps.find((x) => x.id === a.providerId);
  if (!s) return out;
  for (const fundId of a.fundIds) {
    const rec = ctx.bundle.funds.find((f) => f.id === fundId);
    if (!rec) continue;
    const option = optionOfFund(rec, a.index.exposure ?? undefined);
    const fs = fundSpec(ctx, rec);
    if ("reason" in fs) {
      out.set(fundId, { kind: "fail", reason: fs.reason });
      continue;
    }
    const got = priceMany(ctx, fs.spec, option, [s], option === "abroad" ? venueOfFund(rec) : null).get(s.id);
    if (!got) continue;
    if (got.kind === "fail") {
      out.set(fundId, { kind: "fail", reason: got.reason, listing: got.listing });
      continue;
    }
    const ids = got.row.account ? feeIdsOf(got.row.account.deal) : undefined;
    const byFee: Record<string, number> = {};
    for (const x of got.row.byFee ?? []) {
      const id = ids?.[x.fee];
      if (id !== undefined) byFee[id] = (byFee[id] ?? 0) + x.costBeforeTax;
    }
    const row = got.row;
    const reads: RunReads = { house: s.id, fund: fundId, spec: fs.spec, row, profileUsed: row.run.profileUsed };
    // a fee of the deal is what was paid on it carried to the horizon (F-91, `carriedParts`), as the pair's receipt lists it; what is left is
    // the whole run
    const deal = ctx.bundle.deals?.byId[s.id];
    const of = (tax: RunReads["tax"]) => (n: number, about: string, fee?: string) =>
      computed(n, "nis", "F-128", inputsOfRun(ctx, { ...reads, tax }), {
        today: ctx.bundle.today,
        ...(tax === "after"
          ? { rules: rulesOf(row, "all"), statements: statementsOf(row), flags: leftFlags(row), labels: labelsOf(row, fs.spec) }
          : { rules: rulesOf(row, carriedParts(ACCOUNT_LINES, paysOut(fs.spec))), labels: row.run.labels.filter(beforeExitTax), ...(fee !== undefined && feeIsAccount(deal, fee) ? { flags: costFlags(row) } : {}) }),
        about,
      });
    out.set(fundId, { kind: "ok", valueN: row.real, byFee, accountCost: row.horizonCostBeforeTax, reach: row.run.dealReach ?? [], figure: of(undefined), left: of("after"), listing: got.listing });
  }
  return out;
}

/**
 * The account's fees before the tax they save, as a figure (F-91): its lines and the remainder no single line explains, added up, each
 * part opening its own sheet; the cash waiting for a whole unit is not among them (F-109, `waiting`). `round` shapes it (a whole shekel).
 */
export function accountSum(pc: PairCosts, about: string, today: string, round?: (n: number) => number): SiteValue {
  const parts: Record<string, SiteValue> = {};
  // one part per line id, under the line's name; two lines of one name (both "other") told apart by their order, so neither hides the other
  for (const [i, l] of pc.account.entries()) {
    const name = copy.pair.lines[l.line] ?? copy.pair.lines.other!;
    parts[name in parts ? `${name} (${i + 1})` : name] = l.cost;
  }
  // F-128: a deal's own fees, each under its name (two fees of one name told apart by their order)
  for (const [i, l] of (pc.dealLines ?? []).entries()) parts[l.name in parts ? `${l.name} (${i + 1})` : l.name] = l.cost;
  parts[copy.pair.remainder] = pc.remainder;
  return sumOf(parts, "F-91", { today, about, ...(round ? { round } : {}) });
}

// ---------------------------------------------------------------- hedged or not, across the dollar (F-94)

/** The two kinds a foreign index's funds come in: keeping the index's currency, or neutralising it (`hedged: true`). */
export type Kind = "unhedged" | "hedged";
export const kindOf = (rec: FundRecord): Kind => (rec.hedged === true ? "hedged" : "unhedged");

/**
 * F-92 (d): the list a fund is compared on, the funds on its index: whether its Israeli income is exempt on an index the method compares
 * gross (an exempt Israeli fund on TA-35, TA-90 or TA-125, by name) and the other funds' benchmarks. A typed fund has no years and compares against nothing.
 */
export function gapListFor(bundle: Pick<IndicesBundle, "funds" | "exposures">, rec: FundRecord): GapList {
  const index = bundle.exposures.find((e) => e.id === rec.exposure_id);
  return gapListOf(rec, index, bundle.funds.filter((f) => f.exposure_id === rec.exposure_id));
}

/** F-92 (a): a fund's gap to its index in percent a year, with how many full years it rests on; null with none, and with years F-92 (d) does not compare. */
export function gapOf(rec: FundRecord, list: GapList): { pct: number; years: number } | null {
  const years = comparedYears(rec.tracking_record, list) ?? [];
  const pct = gapToIndex(years);
  return pct === null ? null : { pct, years: years.length };
}

/** F-92 (d): the record has years, but they are not compared (an index of unstated kind, or a gross one the fund is not measured fairly against). */
export const gapUnstated = (rec: FundRecord, list: GapList): boolean => !!rec.tracking_record && comparedYears(rec.tracking_record, list) === null;

/**
 * F-95: the funds whose yearly figures are returns in shekels, which the dollar section compares: the Israeli funds, whose annual reports
 * state their returns in shekels. A foreign fund's figures are its own currency's (its factsheet's), and a dollar return beside a shekel one
 * would count the dollar's move as the fund's.
 */
export const reportsInShekels = (rec: FundRecord): boolean => rec.domicile === "IL" && !!rec.tracking_record && rec.tracking_record.years.length > 0;

/** Whether the page shows the two kinds: an index on a foreign currency with a priced fund of each kind. */
export function hasKinds(view: InvestView): boolean {
  const cur = view.index.exposure?.currency;
  if (!cur || isShekel(cur)) return false;
  const funds = view.options.filter((o) => o.exists).flatMap((o) => o.funds);
  return (["unhedged", "hedged"] as const).every((k) => funds.some((f) => kindOf(f.rec) === k && Object.values(f.byHouse).some((x) => "valueN" in x)));
}

type PairValueArgs = InvestArgs & { fundId: string; providerId: string; fxChange: number; tracking?: number };

/** One pair's run at a dollar change `fxChange` (percent a year, A-03), A-07 replaced by `tracking` when given. */
function pairRun(a: PairValueArgs) {
  const ctx = makeCtx(a.bundle, a.plan, { ...a.assumptions, fxChange: a.fxChange });
  const pair = pairOf(ctx, a);
  if (!pair) return null;
  let spec = pair.fs.spec;
  if (a.tracking !== undefined) {
    // A-07 replaced whole: F-133 (b)'s years, which would set it, are dropped with it
    const fund = spec.fund as { drag?: { insideTax?: InsideTax } & Record<string, unknown> };
    const inside = fund.drag?.insideTax;
    const kept = inside ? { insideTax: { basis: inside.basis, parts: inside.parts, ...(inside.netRule ? { netRule: inside.netRule } : {}) } } : {};
    spec = { ...spec, fund: { ...fund, drag: { ...fund.drag, ...kept, tracking: a.tracking } } } as Spec;
  }
  const row = pair.price(spec);
  return row ? { ctx, rec: pair.rec, spec, row } : null;
}

/** One pair's run as the page prices it at a dollar change `fxChange` (F-91's `B(u, p)`): its result and the price list it ran on. */
export function pairRow(a: PairValueArgs): ComparedProvider | null {
  return pairRun(a)?.row ?? null;
}

/** One pair's real value left (F-65) at a dollar change `fxChange` (percent a year, A-03), A-07 replaced by `tracking` when given. */
export function pairValue(a: PairValueArgs): number | null {
  return pairRun(a)?.row.real ?? null;
}

/** The fund's value moves with the dollar's change (A-03, F-04): a fund in a foreign currency, or a shekel fund on a foreign index that does not neutralise it. */
function movesWithDollar(ctx: Ctx, rec: FundRecord): boolean {
  const exposure = exposureOf(ctx, rec);
  return !isShekel(rec.currency) || (rec.hedged !== true && !!exposure && !isShekel(exposure.currency));
}

/**
 * The same as a figure, with what its run reads (F-65): `dollarChange` is the A-03 figure the run is at (P-02's bound), listed where the
 * fund moves with the dollar (a hedged fund's run does not read it, F-04).
 */
export function pairValueFigure(a: PairValueArgs & { about: string; dollarChange?: SiteValue | null }): SiteValue | null {
  const r = pairRun(a);
  if (!r) return null;
  const extra: Record<string, SiteValue> = a.dollarChange && movesWithDollar(r.ctx, r.rec) ? { [copy.kinds.dollarChangeInput]: a.dollarChange } : {};
  return valueFigure(r.ctx, r.row, { house: a.providerId, fund: a.fundId, spec: r.spec, row: r.row }, a.about, extra);
}

/** P-02's bound of the dollar's yearly change against the shekel (A-03) as a figure, with its card; null where the page runs no dollar range,
 *  or where the bundle holds no such bound. */
export function dollarBound(bundle: Pick<IndicesBundle, "dollarRange" | "p02">, end: "lo" | "hi"): SiteValue | null {
  if (!bundle.dollarRange) return null;
  // a bundle from before P-02 joined it (a page still holding an older file) has none: no bound, rather than a broken page
  const p = bundle.p02 as unknown as { bounds?: Record<string, { lo: SiteValue; hi: SiteValue }>; rationale: string; rationale_he?: string | null } | undefined;
  const v = p?.bounds?.["A-03"]?.[end];
  return p && v ? { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null } } : null;
}

/** One pair's real value left (F-65) on the plan: the figure `pairCosts` gives as `left`, without the runs that split the cost by who takes it. */
export function pairLeft(a: InvestArgs & { fundId: string; providerId: string }): number | null {
  const pair = pairOf(makeCtx(a.bundle, a.plan, a.assumptions), a);
  return pair ? (pair.price(pair.fs.spec)?.real ?? null) : null;
}

/**
 * F-92 (b): A-07 comes from the fund's reports (no published 12-month figure, and years F-92 (d) compares), measured against the fees the
 * fund charged each year: the engine then counts the variable fee forward as the mean charged in the years at today's rate.
 */
function a07FromReports(rec: FundRecord, list: GapList): number | null {
  if (typeof rec.fees.tracking_difference_12m?.value === "number") return null;
  const years = comparedYears(rec.tracking_record, list);
  return years ? trackingBeyondFees(years, sumFees(rec)) : null;
}

/**
 * F-92 (b) The variable management fee the site prices, where it is not the listed rate: the mean charged over the years at today's rate,
 * percent a year, with those years (newest first, as the record holds them) and each year's figure from the report's table of fees
 * charged, at its page. Null where the listed rate is what is priced (the card showed 0.3% on Kesem 5139696, priced at −0.215%).
 */
export function pricedVariable(rec: FundRecord, list: GapList, today: string): { value: SiteValue; years: number[] } | null {
  const t = rec.tracking_record;
  const listed = rec.fees.variable_management;
  // the engine prices the mean charged even where no listed rate was collected (fundOf), so the sheet does too
  const like = (typeof listed?.value === "number" ? listed : rec.fees.fixed_management) as SiteValue | undefined;
  if (!t || !like || a07FromReports(rec, list) === null) return null;
  const at = variableForwardYears(t.years, t.variable_rate_since);
  if (!at) return null;
  const mean = at.reduce((a, y) => a + y.fees_charged!.variable, 0) / at.length;
  if (typeof listed?.value === "number" && Math.abs(mean - listed.value) < 1e-9) return null;
  const source = { ...t.source, ...(t.fees_page ? { page: t.fees_page, locator_he: copy.kinds.gapPage(t.fees_page) } : {}) };
  const inputs: Record<string, SiteValue> = {};
  // each year's figure as the fund part's sheet writes it (fundInputs): a percent of that year, read from the report
  for (const y of at) inputs[copy.pair.fundInputs.chargedVariable(y.year)] = ownBy({ ...like, value: y.fees_charged!.variable, unit: "pct", source, checked: t.checked, notes: undefined, state: "sourced" } as SiteValue, rec.manager);
  const years = at.map((y) => y.year);
  return { value: computed(Math.round(mean * 1000) / 1000, "pct_per_year", "F-92", inputs, { today, about: copy.kinds.variablePricedAbout(years) }), years };
}

/**
 * F-92 (b) The fund's cost of a report that prints only the positive variable fees may be lower than the site's where A-07 is floored at 0.
 * Above the floor, with the variable fee averaged over the same years as A-07, the fee charged cancels out of the forward cost (A-07 is
 * measured after it), so a fee paid back and not printed changes nothing (the sentence stood on 1165844 too, whose A-07 is 2.62).
 * Over other years (a rate changed, a year without its fees) it does not cancel, and the sentence stays.
 */
export function paybackMayLower(rec: FundRecord, list: GapList): boolean {
  const a07 = a07FromReports(rec, list);
  if (a07 === null) return false;
  if (a07 === 0) return true;
  const t = rec.tracking_record;
  const priced = t ? variableForwardYears(t.years, t.variable_rate_since) : null;
  return priced?.length !== comparedYears(t, list)?.length;
}


export interface KindMoney {
  /** Value left on a steady dollar with the shortfall the reports give. */
  unhedged: number;
  hedged: number;
  /** The same two as figures (F-65), with what their runs read: the figures F-95's sentence is worked out from. */
  figures: { unhedged: SiteValue; hedged: SiteValue };
  /** What a point a year is worth in value left: of the dollar, either way from 0, and of the hedged fund's shortfall, either way from the reports (F-95). */
  worth: { low: number; high: number };
  /** The share of a difference between the two that goes to tax (F-95), in percent, with the four figures it is worked out from; null where
   *  the two cannot be priced for it or nothing is taxed. */
  taxShare: SiteValue | null;
}

/** F-95's sentence on the plan, over two pairs, one of each kind. */
export function kindMoney(a: InvestArgs & { unhedged: { fundId: string; providerId: string }; hedged: { fundId: string; providerId: string } }): KindMoney | null {
  const u = (fx: number) => pairValue({ ...a, ...a.unhedged, fxChange: fx });
  const figure = (p: { fundId: string; providerId: string }) => {
    const rec = a.bundle.funds.find((f) => f.id === p.fundId);
    return pairValueFigure({ ...a, ...p, fxChange: 0, about: rec ? nameOf(rec) : p.fundId });
  };
  const uFig = figure(a.unhedged), hFig = figure(a.hedged);
  const u0 = (uFig?.value as number | undefined) ?? null, uDown = u(-1), uUp = u(1);
  const h0 = (hFig?.value as number | undefined) ?? null;
  if (u0 === null || uDown === null || uUp === null || h0 === null || !uFig || !hFig) return null;
  const steps = [u0 - uDown, uUp - u0];
  const rec = a.bundle.funds.find((f) => f.id === a.hedged.fundId);
  const reported = rec ? comparedYears(rec.tracking_record, gapListFor(a.bundle, rec)) : null;
  // the A-07 the hedged pair's run charged (F-92 (b), or F-133 (b) against a net index whose deduction is known)
  const used = rec && reported && typeof rec.fees.tracking_difference_12m?.value !== "number" ? (pairRow({ ...a, ...a.hedged, fxChange: 0 })?.run.detail.trackingGap ?? null) : null;
  if (used !== null) {
    const more = pairValue({ ...a, ...a.hedged, fxChange: 0, tracking: used + 0.01 });
    const less = used >= 0.01 ? pairValue({ ...a, ...a.hedged, fxChange: 0, tracking: used - 0.01 }) : null;
    if (more !== null) steps.push(h0 - more);
    if (less !== null) steps.push(less - h0);
  }
  // tax on a difference: the unhedged pair with the dollar a point up and a point down
  const at = (fx: number) => pairCosts({ ...a, ...a.unhedged, fundId: a.unhedged.fundId, providerId: a.unhedged.providerId, assumptions: { ...a.assumptions, fxChange: fx } });
  const cDown = at(-1), cUp = at(1);
  const leftGap = cDown && cUp ? (cUp.left.value as number) - (cDown.left.value as number) : 0;
  const taxGap = cDown && cUp ? (cUp.tax.value as number) - (cDown.tax.value as number) : 0;
  const w = copy.dollar.taxInputs;
  const taxShare =
    cDown && cUp && leftGap + taxGap > 0 && taxGap > 0
      ? computed(Math.round((taxGap / (leftGap + taxGap)) * 100), "pct", "F-95", { [w.leftDown]: cDown.left, [w.leftUp]: cUp.left, [w.taxDown]: cDown.tax, [w.taxUp]: cUp.tax }, { today: a.bundle.today, about: copy.dollar.taxAbout })
      : null;
  return { unhedged: u0, hedged: h0, figures: { unhedged: uFig, hedged: hFig }, worth: { low: Math.min(...steps), high: Math.max(...steps) }, taxShare };
}

/** P-01 as the page reads it: the share of the larger value below which two pairs are a tie (F-80). */
export const tieShareOf = (bundle: Pick<IndicesBundle, "p01">): number => tieThreshold([bundle.p01]);

/**
 * The place of each value in a ranked list, best first (F-80, P-01): every value within the tie threshold of the first
 * shares the first place, and equal figures (in whole shekels) share a place; any other value has its own place by its order. With a
 * threshold of zero only equal figures share. A first place shared by two or more is a tie, and no row is crowned.
 */
export function placesOf(values: readonly number[], theta: number): number[] {
  const top = values[0];
  return values.map((v, i) => {
    if (top === undefined || i === 0 || isTie(top, v, theta)) return 1;
    const first = values.findIndex((x) => Math.round(x) === Math.round(v));
    return first + 1;
  });
}
/** How many share the first place. */
export const firstCount = (places: readonly number[]) => places.filter((p) => p === 1).length;
