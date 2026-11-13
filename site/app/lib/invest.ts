// "השקעה במדד" (D28, spec 8dd1f013:research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses, the options for
// owning it, the cheapest broker for each option and the cheapest complete way (broker + fund) for the plan. Pure: the
// numbers come from the engine's provider workbench (F-63) and from the fund runs of F-65, over the indices bundle. No fee, rate or rule figure is written here: tariffs are snapshots, fund fees are fund records,
// exchange rates are the ECB's (D26). Nothing is chosen for the person (D27): an index is always an argument.
import { gershayim } from "./format";
import { STANDING_CONVERSION_BAND, STANDING_ORDER_BAND, beforeTax, irishFundUsWithholding, paidInAsEntered, buildTariff, comparedYears, gapListOf, type GapList, costByWho, countsCurrentAccount, gapToIndex, sumFees, trackingBeyondFees, variableForwardYears, providerWorkbench, relativeGap, isTie, securitiesBlockedBy, tieThreshold, type ComparedProvider, type FeeLine, type LayeredRun, type NotComparableProvider, type ProviderRow, type TariffBuild } from "@finance-tool/engine";
import type { ExposureRecord, FeesSnapshot, FundRecord } from "@finance-tool/schema";
import { invest as copy } from "../copy";
import { customFundGap, isCustomBrokerId, isCustomFund } from "./custom-entries";
import { aliasRows } from "./search-aliases";
import { fxRunInput, isShekel, nisPer } from "./fx";
import { houseSnapshots, instrumentClassOf, fundRun, ruleContext, shortName, subjectOf, type FundAssumptions, type NotComparable, type IndicesBundle, type WorkbenchInputs } from "./providers";
import { computed, differenceOf, ownBy, ruleFigure, sumOf, type SiteValue, type Strength } from "./value";

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

export type Venue = "us" | "europe";
const US_RE = /ארה["״]ב|ארצות הברית/;
const EU_RE = /אירופה|לונדון|London|LSE/;
const OUTSIDE_US_RE = /מחוץ לארה/;
export const venueOfBand = (band: string | null | undefined): Venue | null => (!band ? null : OUTSIDE_US_RE.test(band) ? "europe" : US_RE.test(band) ? "us" : EU_RE.test(band) ? "europe" : null);

/** The exchange a fund bought abroad trades on, from its tickers and domicile; null when the record does not say. */
export function venueOfFund(rec: FundRecord): Venue | null {
  // a fund the person typed names no exchange: each house is read as for the page's generic fund abroad
  if (isCustomFund(rec)) return null;
  const keys = Object.keys(rec.identifiers.ticker ?? {});
  if (keys.some((k) => /^(LSE|Euronext|Xetra|London)/i.test(k))) return "europe";
  if (keys.some((k) => /^(NYSE|NASDAQ|Cboe|BATS|Arca)/i.test(k))) return "us";
  if (rec.domicile === "US") return "us";
  return rec.domicile === "IL" ? null : "europe";
}

// ---------------------------------------------------------------- the index

/** An index the person added (state.ts keeps it on the device). One question decides the options: are the companies Israeli? */
export interface CustomIndex {
  id: string;
  name: string;
  /** Asked before 2026-11-05 ("החברות במדד ישראליות?") and read only to carry the answer to the index's funds (state.ts, shekelFromIndex). */
  israeli?: boolean;
  /** "לידיעתכם בלבד": shown in the header, never used (spec §1, 10.8). */
  currency?: string;
  region?: string;
  added: string;
}

export interface IndexRef {
  id: string;
  name: string;
  israeli: boolean;
  exposure: ExposureRecord | null;
  custom: CustomIndex | null;
  oneLine: string | null;
}

/** Every exposure record that is an equity index, in file order. */
export function knownIndices(bundle: Pick<IndicesBundle, "exposures">): IndexRef[] {
  return bundle.exposures.filter((e) => e.kind === "equity_index").map(refOfExposure);
}

// the record keeps the name as its source spells it ("נאסד\"ק"); the page writes the gershayim (guidelines/wording.md)
export const refOfExposure = (e: ExposureRecord): IndexRef => ({ id: e.id, name: gershayim(e.names.he[0] ?? e.names.en[0] ?? e.id), israeli: e.constituents_israeli === true, exposure: e, custom: null, oneLine: e.one_line_he ?? null });

/** An index the person added asks nothing of its currency: every kind of fund is offered on it, and each fund says. */
export const refOfCustom = (c: CustomIndex): IndexRef => ({ id: c.id, name: c.name, israeli: false, exposure: null, custom: c, oneLine: null });

/** The index as one fund sees it: a fund the person said is on a shekel index reads it as Israeli (no currency, no hedge, no currency tax). */
export const indexSeenBy = (index: IndexRef, rec: Pick<FundRecord, "id">, bundle: Pick<IndicesBundle, "entered">): IndexRef =>
  index.custom && bundle.entered?.shekelFunds.includes(rec.id) ? { ...index, israeli: true } : index;

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

export type Reason = NotComparable | { code: "fund-type" } | { code: "need-yield" } | { code: "us-fund-open" } | { code: "need-rate"; currency: string } | { code: "no-fund-rate" } | { code: "no-hedge-record" } | { code: "no-hedge-entered" } | { code: "payout-unknown" } | { code: "fee-unknown" } | { code: "domicile-unknown" };

export interface Availability {
  source: { url: string; title: string; checked: string };
  note: string | null;
  /** The record's own sentence on why this kind of fund is not sold there, where it has one; shown instead of the page's general words. */
  reason_he?: string | null;
  /** The rules that hold the fact (the record's `rule_ids`): the row's words open their cards. */
  rule_ids?: readonly string[];
}

export interface BrokerCell {
  providerId: string;
  /** `cost`: priced. `unavailable`: a sourced fact says the broker does not sell it. `no-line`: the tariff has no line for the class. `not-comparable`: the engine could not price it (reason). */
  kind: "cost" | "unavailable" | "no-line" | "not-comparable";
  /** The broker's cost over the horizon before the tax it saves, in today's shekels (F-91 on F-63; generic fund: no fund fees). */
  cost?: SiteValue;
  /** The same figure in whole shekels, with `about` for the place that shows it (an account's header). */
  costAs?: (about: string) => SiteValue;
  costN?: number;
  /** What is left with this broker (F-63's real value): the cells are ordered on it, as F-80 ranks. */
  leftN?: number;
  /** Abroad: the exchange the price rests on; null when the tariff has one line for all. */
  venue?: Venue | null;
  /** The monthly purchases ran on the house's printed standing-order line (F-12, D41). */
  standing?: boolean;
  /** The house's standing-order lines for this purchase that the ranked price leaves out (`not_ranked`, D41, D56): shown beside the row. */
  aside?: string[];
  /** The option the cell prices (a custom index's account list names the kind of fund each house's cost is for). */
  option?: OptionId;
  /** The cost split by fee line, before tax (F-91 on F-61), and the remainder no single line explains: read when shown, a run per line. */
  lines?: { line: FeeLine; cost: number }[];
  interaction?: number;
  reason?: Reason;
  availability?: Availability;
}

export interface WayPrice {
  providerId: string;
  /** Real value left at the horizon, today's shekels (the figure the ranking sorts on). */
  value: SiteValue;
  valueN: number;
  venue: Venue | null;
  /** The run rests on an open rule (an accumulating foreign fund, G-18): shown, not ranked. */
  open: boolean;
  /** What the account itself charges over the horizon, before the tax it saves (F-91 on F-63), real shekels: the same figure as the account's part of the cost bar. */
  accountCost: number;
  /** The account's cost as a figure (F-91 on F-63), with its inputs, rules and the run's notes about the cost (BANK-35); `about` says which figure it is, `whole` rounds it to the shekel. */
  cost: (about: string, whole?: boolean) => SiteValue;
  /** The same, by the tariff's own lines (trade, custody, FX, fixed), largest first, and the remainder no single line explains. */
  lines: { line: FeeLine; cost: number }[];
  interaction: number;
  /** The monthly purchases ran on the house's printed standing-order line (F-12, D41). */
  standing: boolean;
  /** The house's standing-order lines for this purchase that the ranked price leaves out (`not_ranked`, D41, D56): shown beside the row. */
  aside: string[];
  /**
   * F-109 (D94): the house buys the fund in whole units: the monthly purchases of the plan and how many of them bought no unit (their cash
   * waited for a later month). Null where it buys by amount.
   */
  units: { monthly: number; skipped: number } | null;
}

export interface FundWay {
  rec: FundRecord;
  name: string;
  number: string;
  option: OptionId;
  /** The broker the figure is at: the option's cheapest for this fund. */
  best?: WayPrice;
  /** At the person's broker, when known. */
  atYours?: WayPrice | { reason: Reason; providerId: string };
  /** The fund's run at every house of the option (a price, or why it has none); `best` is the highest of the ranked ones. */
  /** `availability`: a sourced fact says the house does not sell this kind of fund ("not possible there"); any other reason is "no data". */
  byHouse: Record<string, WayPrice | { reason: Reason; providerId: string; availability?: Availability }>;
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
  /** The cheapest priced cell. */
  bestCell: BrokerCell | null;
  funds: FundWay[];
  /** The best complete way inside the option (the fund with the highest value at its broker). */
  bestWay: Way | null;
  /** The option's funds rest on an open rule. */
  open: boolean;
}

export interface Way {
  option: OptionId;
  fund: FundWay;
  providerId: string;
  value: SiteValue;
  valueN: number;
  open: boolean;
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
  /** Every fund of the group on the index at this house: ranked ones by value left, then ones on an open rule, then the ones with no price. */
  entries: HouseEntry[];
  /** The house's cheapest way: the best ranked entry. */
  best: HouseEntry | null;
  /** The headline's value less this house's: a computed gap, null for the headline's own house and for houses with no ranked way. */
  gap: SiteValue | null;
  /** Why the house has no way: not sold there (sourced), or the reason it cannot be priced. */
  unavailable: Availability | null;
  reason: Reason | null;
  /** An index with no fund record: the house's cheapest broker cost over the group's options. */
  generic: BrokerCell | null;
  /** The house prints a standing-order line for a kind of fund here: by house, so the row keeps its label when the best fund changes. */
  standing: boolean;
  /** The standing-order lines the ranked price leaves out at this house for any kind of fund here (`not_ranked`, D41): by house, as `standing`. */
  aside: string[];
}

export interface WorthLines {
  /** Same fund, other houses: the headline's value less the lowest value among the other houses of its group; null when the fund prices at no other house. */
  house: SiteValue | null;
  houseCount: number;
  /** Same house, other funds. */
  fund: SiteValue | null;
  fundCount: number;
}

export type BarId = "broker" | "fund" | "etf-tracking" | "abroad";
export interface Bar {
  id: BarId;
  /** Not computed: the reason code ("pending" = in progress for this plan, "no-records"). */
  pending: "no-records" | "not-priced" | null;
  low: number | null;
  high: number | null;
  /** high − low: what the choice is worth. */
  spread: SiteValue | null;
  /** The choice lies in an option that rests on an open rule. */
  open: boolean;
  /** Which two things are compared (option ids, or the option of the broker/fund bar). */
  option?: OptionId;
  between?: [OptionId, OptionId];
}

export type Flip = { kind: "options" } | { kind: "brokers"; option: OptionId } | { kind: "funds"; option: OptionId };
export interface OrderCheck {
  /** The order of options, of brokers in each option and of funds in each option is the same at 0% and at 10%. */
  holds: boolean;
  flips: { at: 0 | 10; what: Flip }[];
}

export interface InvestView {
  index: IndexRef;
  options: OptionView[];
  providers: ProviderInfo[];
  headline: Way | null;
  /** No fund records: the cheapest broker for an Israeli fund on this index (custom index). */
  genericHeadline: { option: OptionId; cell: BrokerCell } | null;
  yourBroker: string | null;
  /** The person's broker priced for the headline's fund. */
  atYours: { providerId: string; price: WayPrice | null; reason: Reason | null; less: SiteValue | null } | null;
  bars: Bar[];
  /** Every house with the funds of its group priced at it, the cheapest way first (the index page's section 1). */
  houses: HouseRow[];
  /** The two slices through the headline's cell (F-63, "The worth lines"). */
  worth: WorthLines | null;
  /** Only when the return is the site's illustration. */
  order: OrderCheck | null;
  returnPct: number;
  returnIllustrative: boolean;
  fundCount: number;
}

// ---------------------------------------------------------------- the providers and their lines

/** A conversion between two foreign currencies is not the conversion a shekel investor pays: the shekel-to-currency line is read. */
const FX_TO_FX = /מט["״]ח ל?מט["״]ח|בין שני מטבעות זרים/;
/** The line is a conversion between two foreign currencies, by the price list's own words: the ranking leaves it out, a house's page names it. */
export const isFxToFx = (l: Pick<FeesSnapshot["lines"][number], "base" | "names">) => l.base === "fx" && FX_TO_FX.test(l.names.tariff.join(" "));

const scopedCache = new WeakMap<FeesSnapshot, FeesSnapshot>();
/** The lines this page ranks: every line but a foreign-currency to foreign-currency conversion. */
export function scoped(s: FeesSnapshot): FeesSnapshot {
  let out = scopedCache.get(s);
  if (!out) {
    out = { ...s, lines: s.lines.filter((l) => !isFxToFx(l)) };
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

export const providerInfo = (s: FeesSnapshot): ProviderInfo => {
  const custom = isCustomBrokerId(s.id);
  return { id: s.id, name: gershayim(s.provider.name_he), short: custom ? s.provider.name_he : shortName(s.id, s.provider.name_he), providerClass: s.provider.class, foreign: s.provider.class === "foreign_broker", taxService: s.provider.israeli_tax_service === true, // every bank and broker on this page has a company page, a foreign one too
    hasPage: !custom && (s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker"), custom };
};

interface Cand {
  venue: Venue | null;
  band?: string[];
}

/**
 * The ways to read a snapshot for an option, the cheapest that computes winning (F-63). For a fund bought abroad: one per exchange its tariff
 * names and per pricing plan on that exchange (Interactive Brokers prints Fixed and Tiered for each), each with the standard conversion and
 * with every other way the house converts (a banded conversion line with no currency of its own and no recurring plan: Interactive Brokers'
 * automatic conversion, F-13); then the plain reading.
 */
function candidates(s: FeesSnapshot, option: OptionId): Cand[] {
  const plain: Cand = { venue: null };
  if (option !== "abroad") return [plain];
  const trade = s.lines.filter((l) => l.base === "trade" && l.level === "list" && l.applies_to.includes("foreign_securities") && l.band);
  const ways = [...new Set(s.lines.filter((l) => l.base === "fx" && l.level === "list" && l.band && l.band !== STANDING_CONVERSION_BAND && !l.conversion_currency && l.applies_to.some((a) => a === "foreign_securities" || a === "all")).map((l) => l.band!))];
  const out: Cand[] = [];
  for (const v of ["us", "europe"] as Venue[]) {
    const plans = [...new Set(trade.filter((l) => venueOfBand(l.band) === v).map((l) => l.band!))];
    for (const plan of plans) for (const way of [null, ...ways]) out.push({ venue: v, band: way ? [plan, way] : [plan] });
  }
  return [...out, plain];
}

// ---------------------------------------------------------------- the run

interface Spec {
  fund: Parameters<typeof providerWorkbench>[0]["fund"];
  market: { grossReturn: number; returnIn?: "instrument" | "nis"; fxChange?: number };
  currency?: { code: string; startRate: number };
  cls: string;
  /** F-109 (D94): where the fund is bought (TASE, or the exchange abroad it trades on), so each house buys it in whole units or by amount. */
  listing?: "tase" | "us" | "europe";
}

interface Ctx {
  bundle: IndicesBundle;
  plan: WorkbenchInputs;
  fx: Record<string, number>;
  theta: number;
  snaps: readonly FeesSnapshot[];
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

function genericSpec(ctx: Ctx, option: OptionId): Spec | null {
  const market = { grossReturn: ctx.plan.grossReturn };
  if (option === "il-tracking" || option === "il-etf") return { fund: { kind: "israeli-fund", drag: {} }, market, cls: OPTION_CLASS[option] };
  if (option === "tase-foreign") return { fund: { kind: "tase-foreign-fund", drag: {} }, market, cls: OPTION_CLASS[option] };
  const usd = ctx.fx.USD;
  if (!usd) return null;
  return { fund: { kind: "foreign-fund", drag: {} }, market: { ...market, returnIn: "instrument", fxChange: 0 }, currency: { code: "USD", startRate: usd }, cls: OPTION_CLASS.abroad };
}

/** The open rule a run of the spec's fund would rest on (F-04), or null. */
const blockedBy = (ctx: Ctx, spec: Spec): string | null => securitiesBlockedBy(spec.fund, ruleContext(ctx.bundle));

/** The open rule every fund of a kind would rest on (F-04: a foreign fund in Tel Aviv, TXF-04), or null: what a fund the person types of that kind is told. */
export function optionOpenRule(bundle: IndicesBundle, option: OptionId): string | null {
  const kind = option === "tase-foreign" ? "tase-foreign-fund" : option === "abroad" ? "foreign-fund" : "israeli-fund";
  return securitiesBlockedBy({ kind }, ruleContext(bundle));
}

/** The house whose price list a snapshot reads: its own, or, for an account built on a house (F-101), that house's. */
const houseOfSnap = (ctx: Ctx, s: FeesSnapshot): string => ctx.bundle.entered?.bases?.[s.id] ?? s.id;

/**
 * A bank whose current account costs something a month (F-102, D64): the banks the person can mark as theirs. A bank whose price list
 * prints its current account free (One Zero) is left out, since marking it would change no figure.
 */
export const chargesCurrentAccount = (s: Pick<FeesSnapshot, "current_account">): boolean => {
  const v = s.current_account?.monthly_minimum.value;
  return typeof v === "number" && v > 0;
};

/**
 * The row counts a current account (F-102, D64): only on the indices page, at a bank whose record prices one, unless it is the bank the
 * person marked as theirs. An account built on a bank (F-101) is an account at that bank, so it reads the bank's record and mark.
 */
function currentAccountOf(ctx: Ctx, s: FeesSnapshot): FeesSnapshot["current_account"] | null {
  const marks = ctx.plan.currentAccounts;
  if (!marks) return null;
  const house = houseOfSnap(ctx, s);
  const record = house === s.id ? s : ctx.bundle.snapshots.find((x) => x.id === house);
  return record && countsCurrentAccount({ id: house, current_account: record.current_account }, marks.own) ? record.current_account! : null;
}

function runSlot(ctx: Ctx, spec: Spec, items: { s: FeesSnapshot; cand: Cand }[]): ProviderRow[] {
  const profile: { ageAtStart?: number; annualIncome?: number } = {};
  if (ctx.plan.age !== null) profile.ageAtStart = ctx.plan.age;
  if (ctx.plan.income !== null && ctx.plan.income > 0) profile.annualIncome = ctx.plan.income;
  const input = (list: typeof items) => ({
    goal: { amountNow: ctx.plan.amountNow, monthly: ctx.plan.monthly, months: 12 * ctx.plan.years },
    market: { ...spec.market, inflation: ctx.plan.inflation },
    fund: spec.fund,
    profile,
    behaviour: { ordersPerMonth: 1 },
    instrumentClass: spec.cls,
    channel: "direct",
    ...(spec.currency ? { currency: spec.currency } : {}),
    ...(spec.listing ? { listing: spec.listing } : {}),
    fx: ctx.fx,
    theta: ctx.theta,
    providers: list.map((x) => {
      // the person's own broker has no lines of its own: its whole price is what was typed (F-63, D44)
      const entered = ctx.bundle.entered?.tariffs[x.s.id];
      // an account built on a house (F-101): the house's own list tariff for this fund and reading, with the group's and the person's prices over it
      const layered = ctx.bundle.entered?.layered?.[x.s.id];
      const current = currentAccountOf(ctx, x.s);
      const account = current ? { currentAccount: true } : {};
      if (layered) {
        // an account built on a bank keeps the bank's current account (its own record copies only the price lines)
        const snap = scoped(x.s);
        return { snapshot: current ? { ...snap, current_account: current } : snap, level: "entered" as const, layered, ...account, ...(x.cand.band ? { band: x.cand.band } : {}) };
      }
      return entered ? { snapshot: scoped(x.s), level: "entered" as const, entered } : { snapshot: scoped(x.s), level: "list" as const, ...account, ...(x.cand.band ? { band: x.cand.band } : {}) };
    }),
  });
  try {
    return providerWorkbench(input(items), ruleContext(ctx.bundle)).rows;
  } catch {
    // one provider the engine cannot run must not fail the page (spec 4.5): run them one by one, the failing one becomes a record-error row
    return items.map((x) => {
      try {
        return providerWorkbench(input([x]), ruleContext(ctx.bundle)).rows[0]!;
      } catch (e) {
        const base = { id: x.s.id, name: x.s.provider.name_he, providerClass: x.s.provider.class, level: "list" as const, snapshot: x.s.snapshot, tariffSource: x.s.tariff, protectionRuleIds: x.s.provider.protection_rule_ids, minimums: x.s.minimums };
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
  const builds = candidates(scopedSnap, option).flatMap((cand) => {
    try {
      const built = buildTariff(
        { goal: { amountNow: plan.amountNow, monthly: plan.monthly, months: 12 * plan.years }, market: { ...spec.market, inflation: plan.inflation }, profile: {}, instrumentClass: spec.cls, channel: "direct", ...(spec.currency ? { currency: spec.currency } : {}), fx: ctx.fx, theta: ctx.theta, providers: [] },
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

function ambiguity(message: string, s: FeesSnapshot): NotComparable | null {
  const m = /lines? apply \(([^)]*)\); the snapshot is ambiguous/.exec(message);
  if (!m) return null;
  return { code: "ambiguous", detail: message, lines: m[1]!.split(",").map((x) => x.trim()).map((id) => { const l = s.lines.find((y) => y.id === id); return { id, name: l?.names.tariff[0] ?? id, band: l?.band ?? null }; }) };
}

function reasonOf(row: NotComparableProvider, s: FeesSnapshot): NotComparable {
  const r = row.reason;
  if (r.code === "data-missing") return { code: "data-missing", recorded: r.detail };
  if (r.code === "line-without-value") return { code: "line-without-value", detail: r.detail, lineName: s.lines.find((l) => l.id === r.detail.split(" ")[0])?.names.tariff[0] ?? null };
  if (r.code === "record-error") return ambiguity(r.detail, s) ?? { code: "record-error", detail: r.detail };
  return { code: r.code, detail: r.detail };
}

/** `cand`: the reading of the tariff the price is on (an account built on a house: the house's). */
type Priced = { kind: "ok"; row: ComparedProvider; venue: Venue | null; standing: boolean; aside: string[]; cand: Cand } | { kind: "fail"; reason: NotComparable };

/** The venue the tariff line a row used names (a trade line's band), else the reading's venue. */
function rowVenue(row: ComparedProvider, s: FeesSnapshot, cand: Cand): Venue | null {
  for (const id of row.linesUsed) {
    const l = s.lines.find((x) => x.id === id);
    if (l && l.base === "trade") return venueOfBand(l.band) ?? cand.venue;
  }
  return cand.venue;
}

/**
 * Prices each snapshot for a fund spec: every reading of its tariff (an exchange each, for a fund bought abroad), and the
 * cheapest one that computes wins. `fundVenue` limits the readings to the exchange the fund trades on.
 */
const sameCand = (a: Cand, b: Cand) => a.venue === b.venue && JSON.stringify(a.band ?? null) === JSON.stringify(b.band ?? null);

function priceMany(ctx: Ctx, spec: Spec, option: OptionId, snaps: FeesSnapshot[], fundVenue: Venue | null): Map<string, Priced> {
  // a fund whose tax rests on an open rule is priced nowhere (F-04: a TASE foreign fund, TXF-04), so no house is ranked on a guess
  const open = blockedBy(ctx, spec);
  if (open) return new Map(snaps.map((s): [string, Priced] => [s.id, { kind: "fail", reason: { code: "rule-open", ruleId: open } }]));
  // an account the person typed with a price left empty for this kind of fund (its conversion, for a fund bought abroad) has no price for
  // it: never run, so the empty field is never charged as zero (D56)
  // (an account built on a house reads an empty field as the house's price: it follows the house, below)
  const baseOf = (s: FeesSnapshot) => (houseOfSnap(ctx, s) === s.id ? null : houseOfSnap(ctx, s));
  const typedOpen = (s: FeesSnapshot) => isCustomBrokerId(s.id) && !baseOf(s) && doubtOf(s, option) !== null;
  // an account built on a house is priced where the house is, on the house's own reading of its price list, and nowhere else (F-101,
  // #190: the layered run has no line of its own to say which exchange it trades on, and was priced where the house's list has no line)
  const bases = [...new Set(snaps.flatMap((s) => { const b = baseOf(s); return b && !snaps.some((x) => x.id === b) ? [b] : []; }))].flatMap((b) => ctx.bundle.snapshots.filter((x) => x.id === b));
  const all = [...snaps, ...bases];
  const per = all.map((s) => ({ s, cands: typedOpen(s) ? [] : candidates(scoped(s), option).filter((c) => fundVenue === null || c.venue === null || c.venue === fundVenue) }));
  const results = new Map<string, { row: ProviderRow; cand: Cand }[]>();
  const slots = Math.max(0, ...per.map((p) => p.cands.length));
  for (let k = 0; k < slots; k++) {
    const items = per.filter((p) => p.cands[k]).map((p) => ({ s: p.s, cand: p.cands[k]! }));
    const rows = runSlot(ctx, spec, items);
    items.forEach((x, i) => results.set(x.s.id, [...(results.get(x.s.id) ?? []), { row: rows[i]!, cand: x.cand }]));
  }
  const out = new Map<string, Priced>();
  // the houses first, so an account built on one can follow it
  const order = [...per].sort((a, b) => Number(!!baseOf(a.s)) - Number(!!baseOf(b.s)));
  for (const { s } of order) {
    const base = baseOf(s);
    if (base) {
      const at = out.get(base);
      const cand = at?.kind === "ok" ? at.cand : undefined;
      const mine = cand ? (results.get(s.id) ?? []).find((g) => sameCand(g.cand, cand)) : undefined;
      if (!at || at.kind === "fail") out.set(s.id, at ?? { kind: "fail", reason: { code: "data-missing", recorded: null } });
      else if (mine?.row.kind === "compared") out.set(s.id, { kind: "ok", row: mine.row, venue: at.venue, standing: at.standing, aside: [], cand: at.cand });
      else out.set(s.id, { kind: "fail", reason: mine?.row.kind === "not-comparable" ? reasonOf(mine.row, scoped(s)) : { code: "data-missing", recorded: null } });
      continue;
    }
    if (typedOpen(s)) {
      out.set(s.id, { kind: "fail", reason: { code: "data-missing", recorded: "entered-incomplete" } });
      continue;
    }
    const got = results.get(s.id) ?? [];
    let best: { row: ComparedProvider; venue: Venue | null; cand: Cand } | null = null;
    // the exchange of a reading set aside because the fund trades on another: the house's lines abroad name only that one
    let otherVenue: Venue | null = null;
    for (const g of got) {
      if (g.row.kind !== "compared") continue;
      // no trade line for the class: the run would charge nothing, which the tariff does not say; derived availability (spec 6, S3)
      if (g.row.noLine.includes("trade")) continue;
      const venue = rowVenue(g.row, scoped(s), g.cand);
      if (fundVenue !== null && venue !== null && venue !== fundVenue) {
        otherVenue = venue;
        continue;
      }
      if (!best || g.row.real > best.row.real || (g.row.real === best.row.real && venue !== null && best.venue === null)) best = { row: g.row, venue, cand: g.cand };
    }
    if (best) {
      out.set(s.id, { kind: "ok", row: best.row, venue: best.venue, standing: best.row.linesUsed.some((id) => { const band = s.lines.find((l) => l.id === id)?.band; return band === STANDING_ORDER_BAND || band === STANDING_CONVERSION_BAND; }), aside: best.row.standingAside, cand: best.cand });
      continue;
    }
    const fails = got.flatMap((g) => (g.row.kind === "not-comparable" ? [reasonOf(g.row, scoped(s))] : g.row.noLine.includes("trade") ? [{ code: "no-applicable-line" as const, detail: `no trade line of the ${s.snapshot} snapshot applies to ${spec.cls}` }] : []));
    // the most telling reason: any but "no line" and "ambiguous", then ambiguous, then no line
    const pick: NotComparable = fails.find((f) => f.code !== "no-applicable-line" && f.code !== "ambiguous") ?? (otherVenue ? { code: "other-venue", venue: otherVenue } : null) ?? fails.find((f) => f.code === "ambiguous") ?? fails[0] ?? { code: "data-missing" as const, recorded: null };
    out.set(s.id, { kind: "fail", reason: pick });
  }
  return out;
}

type AvailabilityEntry = NonNullable<FeesSnapshot["availability"]>[number];
const AVAILABLE_NOTE = (a: AvailabilityEntry): Availability => ({ source: a.source, note: a.note ?? null, reason_he: a.reason_he ?? null, ...(a.rule_ids?.length ? { rule_ids: a.rule_ids } : {}) });

function unavailable(s: FeesSnapshot, option: OptionId): Availability | null {
  for (const a of s.availability ?? []) if (a.available === false && a.applies_to.some((c) => classesAt(s, option).includes(c))) return AVAILABLE_NOTE(a);
  return null;
}

/**
 * A price the person left empty in an account they typed (its conversion): carried as an open entry, so that kind of fund has no price
 * there, but it is a price not known, never a doubt about whether the account sells it (fourth pass: the stairs listed it under
 * "יש ספק אם נמכרת שם" while its own row said the conversion was not typed). Such an entry is the person's, with no document behind it.
 */
export function leftEmpty(s: FeesSnapshot | undefined, option: OptionId): boolean {
  return (s?.availability ?? []).some((a) => a.available === "unknown" && a.source.url === "local" && a.applies_to.some((c) => classesAt(s, option).includes(c)));
}

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

/** The record's entry that leaves this kind of holding open at the house (`doubtOf`'s words), with its source and rules; null where the person typed the entry. */
export function doubtAt(s: FeesSnapshot | undefined, option: OptionId): Availability | null {
  for (const a of s?.availability ?? []) if (a.available === "unknown" && a.applies_to.some((c) => classesAt(s, option).includes(c))) return a.source.url === "local" ? null : AVAILABLE_NOTE(a);
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
export const WHOLE_PLAN: readonly PlanInput[] = ["amount", "monthly", "years", "return", "inflation"];
/**
 * The plan's inputs a figure rests on, each named by the caller, so a figure lists only what its formula uses: what was paid in rests on
 * the amount, the deposit and the years, not on the return.
 */
export function planInputs(plan: WorkbenchInputs, which: readonly PlanInput[]): Record<string, SiteValue> {
  const v = plan.values;
  const of: Record<PlanInput, SiteValue> = { amount: v.amount, monthly: v.monthly, years: v.years, return: v.returnV, inflation: v.inflation };
  return Object.fromEntries(which.map((k) => [copy.planInputs[k], of[k]]));
}
const rulesOf = (row: ComparedProvider) => row.run.rules.map((u) => ({ id: u.id, strength: u.strength as Strength }));

/** What one engine run reads, for the sheet of a figure that comes out of it (`inputsOfRun`). */
interface RunReads {
  /** The account the run prices at: its house's current account (F-102), its lines in a foreign currency, what the person typed for it. Left out for a run with no account (F-91's fund part). */
  house?: string;
  /** The fund record the run holds; none for an option's generic fund. */
  fund?: string;
  /** The run's spec: a run priced in a foreign currency reads that currency's rate (F-84). */
  spec?: Spec;
  /** The row the run gave: the lines of the house's price list it read, for a line set in a foreign currency (F-84). */
  row?: ComparedProvider;
  /** F-91's X: the fund with none of its own costs and no distribution, measured with no account: the fund's figures are not read. */
  costsOff?: boolean;
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
  // a typed fund's costs are what was typed (below); F-107 comes from what was said of it (Ireland, holds the shares) and the index
  const own = fund ? { ...(isCustomFund(fund) ? {} : fundInputs(fund, gapListFor(ctx.bundle, fund), ctx.bundle.today)), ...usWithholdingInput(ctx, r, fund) } : {};
  return Object.assign({}, planInputs(ctx.plan, WHOLE_PLAN), ratesOfRun(ctx, r), minimum, own, ...typed);
};

/**
 * A-11 by F-107 where the fund's run takes it (`fundOf` puts the inputs in the drag: an Irish fund that holds the index's US shares): TXF-16's
 * rate on the dividends of those shares, with the index provider's yield and weight it multiplies, so the sheet shows the cost in the fund.
 */
function usWithholdingInput(ctx: Ctx, r: RunReads, rec: FundRecord): Record<string, SiteValue> {
  const u = r.spec?.fund.drag?.usDividends;
  const us = u ? ctx.bundle.exposures.find((e) => e.id === rec.exposure_id)?.us_dividends : undefined;
  const rule = us ? ctx.bundle.rules.find((x) => x.id === "TXF-16") : undefined;
  const rate = rule ? ruleFigure(rule, "irish_fund_us_dividend_treaty_rate", ctx.bundle.today) : null;
  if (!u || !us || !rule || !rate || typeof rate.value !== "number") return {};
  const w = copy.pair.fundInputs;
  const inputs: Record<string, SiteValue> = { [w.usRate]: rate, [w.usYield]: us.yield as SiteValue };
  if (us.weight) inputs[w.usWeight] = us.weight as SiteValue;
  const value = irishFundUsWithholding(rate.value / 100, u.yield, u.weight) * 100;
  return { [w.usWithholding]: computed(Math.round(value * 1000) / 1000, "pct_per_year", "F-107", inputs, { today: ctx.bundle.today, rules: [{ id: rule.id, strength: rule.strength as Strength }], flags: ["TXF-OQ7"], about: w.usWithholdingAbout }) };
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
function fundInputs(rec: FundRecord, list: GapList, today: string): Record<string, SiteValue> {
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
    out[w.beyond(ys)] = computed(Math.round(a07 * 100 * 1000) / 1000, ys.length === 1 ? "pct" : "pct_per_year", "F-92", inputs, { today, about: w.beyondAbout(ys) });
  }
  return out;
}

/**
 * The run's flags that are about the account's cost, not about what is left: BANK-35 says the current account counted in the cost may be too high
 * from the cap's start (F-102), so it sits on the cost, where a cost too high is a cost too high, and not on the value left, which it would lower.
 */
const COST_FLAGS: readonly string[] = ["BANK-35"];

/** An option's generic fund at a house (F-91 on F-63): the account's cost before tax, `whole` in whole shekels. */
function costValue(ctx: Ctx, row: ComparedProvider, spec: Spec, about: string, whole = false): SiteValue {
  const flags = [...row.flags, ...row.run.flags.map((f) => f.code).filter((c) => COST_FLAGS.includes(c) && !row.flags.includes(c))];
  return computed(whole ? Math.round(row.horizonCostBeforeTax) : row.horizonCostBeforeTax, "nis", "F-91", inputsOfRun(ctx, { house: row.id, spec, row }), { today: ctx.bundle.today, rules: rulesOf(row), flags, about });
}

/** What is left with one account and one fund (F-65's real value), as every list and the stairs show it, with what its run reads. */
function valueFigure(ctx: Ctx, row: ComparedProvider, reads: RunReads, about: string, extra: Record<string, SiteValue> = {}): SiteValue {
  return computed(row.real, "nis", "F-65", { ...inputsOfRun(ctx, reads), ...extra }, { today: ctx.bundle.today, rules: rulesOf(row), flags: row.run.flags.map((f) => f.code).filter((c) => !COST_FLAGS.includes(c)), labels: row.run.labels.map((l) => ({ code: l.code, ruleId: l.ruleId })), about });
}

function wayPrice(ctx: Ctx, p: Extract<Priced, { kind: "ok" }>, providerId: string, about: string, fundId: string, spec: Spec): WayPrice {
  const row = p.row;
  const open = row.run.outcome.code === "listed-not-ranked";
  const reads: RunReads = { house: providerId, fund: fundId, spec, row };
  const value = valueFigure(ctx, row, reads, about);
  let split: Pick<WayPrice, "lines" | "interaction"> | undefined;
  // the lines of a way take a run each and the page shows the picked fund's only: read when shown
  const splitOf = () => {
    if (split) return split;
    const lines = row.byType.map((x) => ({ line: x.line, cost: x.costBeforeTax }));
    return (split = { lines, interaction: row.horizonCostBeforeTax - lines.reduce((t, l) => t + l.cost, 0) });
  };
  return {
    providerId,
    value,
    valueN: row.real,
    venue: p.venue,
    open,
    accountCost: row.horizonCostBeforeTax,
    // the cost before tax carries the run's labels on its sources; every reading the engine gives is a tax rule's (READING_RULE_IDS), which a cost before tax does not rest on
    cost: (about: string, whole = true) =>
      computed(whole ? accountWhole({ accountCost: row.horizonCostBeforeTax }) : row.horizonCostBeforeTax, "nis", "F-91", inputsOfRun(ctx, reads), { today: ctx.bundle.today, rules: rulesOf(row), flags: row.run.flags.map((f) => f.code).filter((c) => COST_FLAGS.includes(c)), labels: row.run.labels.filter((l) => l.code !== "reading").map((l) => ({ code: l.code, ruleId: l.ruleId })), about }),
    get lines() {
      return splitOf().lines;
    },
    get interaction() {
      return splitOf().interaction;
    },
    standing: p.standing,
    aside: p.aside,
    units: unitsOf(row.run),
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


/** The index a fund is on, as its run reads it: a collected one, or the one the person typed (in shekels where they said the fund is). */
function exposureOf(ctx: Ctx, rec: FundRecord) {
  const entered = ctx.bundle.entered?.exposures[rec.exposure_id];
  return ctx.bundle.exposures.find((e) => e.id === rec.exposure_id) ?? (entered && ctx.bundle.entered!.shekelFunds.includes(rec.id) ? { ...entered, currency: "ILS" } : entered);
}

function fundSpec(ctx: Ctx, rec: FundRecord): { spec: Spec; mismatch: boolean } | { reason: Reason } {
  const exposure = exposureOf(ctx, rec);
  const subject = subjectOf(ctx.bundle, rec.id);
  if (!subject) return { reason: { code: "fund-type" } };
  // a fund the person typed: what they left unsaid is named, never filled in
  const gap = isCustomFund(rec) ? customFundGap(rec) : null;
  if (gap) return { reason: { code: gap } };
  // a hedged fund's cost is mostly beyond its fees (F-92 (c)): with no compared year in its report (none, or none F-92 (d) compares) and
  // no published figure it is not priced, never priced at A-07 = 0
  const list = gapListFor(ctx.bundle, rec);
  if (rec.hedged === true && !comparedYears(rec.tracking_record, list) && typeof rec.fees.tracking_difference_12m?.value !== "number") return { reason: { code: isCustomFund(rec) ? "no-hedge-entered" : "no-hedge-record" } };
  const run = fundRun(subject, exposure, ctx.plan.grossReturn, ctx.assumptions, ctx.bundle.fx, list);
  if ("kind" in run) return { reason: run.kind === "need-rate" ? { code: "need-rate", currency: run.currency } : run.kind === "need-yield" ? { code: rec.domicile === "US" && !isCustomFund(rec) ? "us-fund-open" : "need-yield" } : { code: "fund-type" } };
  // a fund whose tax rests on an open rule is listed with the reason, with no figure and no rank (F-04, G-35; D84)
  const open = securitiesBlockedBy(run.fund, ruleContext(ctx.bundle));
  if (open) return { reason: { code: "rule-open", ruleId: open } };
  // as the engine flags it (E4): a fund in a foreign currency other than its index's; a shekel fund on a dollar index is the usual case, not a mismatch
  const mismatch = !!exposure && !["NIS", "ILS"].includes(rec.currency) && rec.currency !== exposure.currency;
  const listing = listingOf(rec, subject.instrumentClass);
  return { spec: { fund: run.fund, market: run.market, ...(run.currency ? { currency: run.currency } : {}), cls: subject.instrumentClass, ...(listing ? { listing } : {}) }, mismatch };
}

/**
 * F-109 (D94): where a fund is bought: an Israeli ETF and a foreign fund's Tel Aviv line on TASE, a fund abroad on the exchange it trades on.
 * A tracking fund is bought from its manager by amount and has none.
 */
function listingOf(rec: FundRecord, cls: string): Spec["listing"] {
  if (cls === "etf_units" || cls === "tase_foreign_fund_units") return "tase";
  if (cls === "foreign_securities") return venueOfFund(rec) ?? undefined;
  return undefined;
}

/** F-109: a fund bought in whole units whose record holds no unit price (a fund the person typed has none): priced by amount, and its row says the price was not collected. */
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

function computeOption(ctx: Ctx, index: IndexRef, option: OptionId, yourBroker: string | null): OptionView {
  const exists = optionsOf(index.israeli).includes(option);
  const empty: OptionView = { id: option, exists, notRunnable: null, cells: [], bestCell: null, funds: [], bestWay: null, open: false };
  if (!exists) return empty;
  const spec = genericSpec(ctx, option);
  if (!spec) return { ...empty, notRunnable: "no-rate" };

  // (b) the broker cost of the option: a generic fund with no fees of its own
  const priceable = ctx.snaps.filter((s) => !unavailable(s, option));
  const priced = priceMany(ctx, spec, option, priceable, null);
  const cells: BrokerCell[] = ctx.snaps.map((s) => {
    const na = unavailable(s, option);
    if (na) return { providerId: s.id, kind: "unavailable", availability: na };
    const p = priced.get(s.id)!;
    if (p.kind === "ok") {
      const row = p.row;
      // the split takes a run per fee line: read only for the house rows a custom index's list shows
      let split: { lines: { line: FeeLine; cost: number }[]; interaction: number } | undefined;
      const splitOf = () => {
        if (split) return split;
        const lines = row.byType.map((x) => ({ line: x.line, cost: x.costBeforeTax }));
        return (split = { lines, interaction: row.horizonCostBeforeTax - lines.reduce((t, l) => t + l.cost, 0) });
      };
      return {
        providerId: s.id,
        kind: "cost",
        option,
        cost: costValue(ctx, row, spec, copy.houses.costAbout(s.provider.name_he)),
        costAs: (about: string) => costValue(ctx, row, spec, about, true),
        costN: row.horizonCostBeforeTax,
        leftN: row.real,
        venue: p.venue,
        standing: p.standing,
        aside: p.aside,
        get lines() {
          return splitOf().lines;
        },
        get interaction() {
          return splitOf().interaction;
        },
      };
    }
    return { providerId: s.id, kind: p.reason.code === "no-applicable-line" ? "no-line" : "not-comparable", reason: p.reason };
  });
  // ordered as the ranking orders (F-80 on what is left), not by the cost shown, which is before tax (F-91)
  const costs = cells.filter((c) => c.kind === "cost").sort((a, b) => b.leftN! - a.leftN!);
  const bestCell = costs[0] ?? null;

  // (a) the funds of the option, each at its cheapest broker
  // a custom index has no exposure record: a fund the person added on it names the index itself (D44)
  const recs = ctx.bundle.funds.filter((f) => f.exposure_id === (index.exposure?.id ?? index.id) && optionOfFund(f, index.exposure ?? undefined) === option);
  const yours = yourBroker ? ctx.snaps.find((s) => s.id === yourBroker) : undefined;
  const funds: FundWay[] = recs.map((rec) => {
    const base = { rec, name: nameOf(rec), number: numberOf(rec), option, currencyMismatch: false, noUnitPrice: unitPriceMissing(rec, option), byHouse: {} as FundWay["byHouse"] };
    const fs = fundSpec(ctx, rec);
    if ("reason" in fs) return { ...base, reason: fs.reason };
    const venue = option === "abroad" ? venueOfFund(rec) : null;
    // the fund at every house that sells the option, the exchange it trades on for a fund abroad
    const got = priceable.length ? priceMany(ctx, fs.spec, option, priceable, venue) : new Map<string, Priced>();
    let best: WayPrice | undefined;
    let failure: Reason | undefined;
    for (const s of ctx.snaps) {
      const na = unavailable(s, option);
      if (na) {
        base.byHouse[s.id] = { providerId: s.id, reason: { code: "no-applicable-line", detail: "unavailable" }, availability: na };
        continue;
      }
      const p = got.get(s.id)!;
      if (p.kind === "ok") {
        const w = wayPrice(ctx, p, s.id, nameOf(rec), rec.id, fs.spec);
        base.byHouse[s.id] = w;
        if (!best || w.valueN > best.valueN) best = w;
      } else {
        base.byHouse[s.id] = { providerId: s.id, reason: p.reason };
        failure ??= p.reason;
      }
    }
    const atYours = yours ? base.byHouse[yours.id] : undefined;
    return { ...base, currencyMismatch: fs.mismatch, ...(best ? { best } : failure ? { reason: failure } : { reason: { code: "no-applicable-line", detail: "no broker" } }), ...(atYours ? { atYours } : {}) };
  });
  funds.sort((a, b) => (b.best?.valueN ?? -Infinity) - (a.best?.valueN ?? -Infinity));
  const top = funds.find((f) => f.best);
  const bestWay: Way | null = top?.best ? { option, fund: top, providerId: top.best.providerId, value: top.best.value, valueN: top.best.valueN, open: top.best.open } : null;
  return { ...empty, cells, bestCell, funds, bestWay, open: funds.some((f) => f.best?.open) };
}

// ---------------------------------------------------------------- the view

function core(ctx: Ctx, index: IndexRef, yourBroker: string | null): OptionView[] {
  return OPTION_IDS.map((o) => computeOption(ctx, index, o, yourBroker));
}

/**
 * A fund the page may open on: not a currency-hedged one. The engine gives a hedged fund the same return as one
 * that keeps the index's currency and no field holds what the hedge costs, so its lower fee alone would win between two different
 * holdings. Hedged funds stay in the lists with their label, priced, and the person can pick one; hedging is a label, not a filter (D28).
 */
export const opensOn = (rec: FundRecord): boolean => rec.hedged !== true;

/** The headline: the best ranked way over the options (an open way is shown, not ranked, G-18), among funds the page may open on when there are any. */
function headlineOf(options: OptionView[]): Way | null {
  const ways = options.flatMap((o) => o.funds.flatMap((f): Way[] => (f.best && !f.best.open ? [{ option: o.id, fund: f, providerId: f.best.providerId, value: f.best.value, valueN: f.best.valueN, open: false }] : [])));
  const from = ways.some((w) => opensOn(w.fund.rec)) ? ways.filter((w) => opensOn(w.fund.rec)) : ways;
  return from.sort((a, b) => b.valueN - a.valueN)[0] ?? null;
}

/** Items in value order with the ones within θ of the group's first merged into one place: the order that matters (F-80). */
function signature(items: { id: string; v: number }[], higherBetter: boolean, theta: number): string {
  const sorted = [...items].sort((a, b) => (higherBetter ? b.v - a.v : a.v - b.v));
  const groups: { id: string; v: number }[][] = [];
  for (const x of sorted) {
    const g = groups[groups.length - 1];
    if (g && relativeGap(g[0]!.v, x.v) < theta) g.push(x);
    else groups.push([x]);
  }
  return groups.map((g) => g.map((x) => x.id).sort().join("+")).join(">");
}

function signatures(options: OptionView[], theta: number): Record<string, string> {
  const out: Record<string, string> = {};
  out.options = signature(options.flatMap((o) => (o.bestWay ? [{ id: o.id, v: o.bestWay.valueN }] : [])), true, theta);
  for (const o of options) {
    out[`brokers:${o.id}`] = signature(o.cells.flatMap((c) => (c.kind === "cost" ? [{ id: c.providerId, v: c.costN! }] : [])), false, theta);
    out[`funds:${o.id}`] = signature(o.funds.flatMap((f) => (f.best ? [{ id: f.rec.id, v: f.best.valueN }] : [])), true, theta);
  }
  return out;
}

function orderCheck(ctx: Ctx, index: IndexRef, yourBroker: string | null, atPlan: OptionView[]): OrderCheck {
  const base = signatures(atPlan, ctx.theta);
  const flips: OrderCheck["flips"] = [];
  for (const at of [0, 10] as const) {
    const other = makeCtx(ctx.bundle, { ...ctx.plan, grossReturn: at / 100 }, ctx.assumptions);
    const sig = signatures(core(other, index, yourBroker), ctx.theta);
    for (const k of Object.keys(base)) {
      if (sig[k] === base[k]) continue;
      const [kind, option] = k.split(":") as [string, OptionId | undefined];
      flips.push({ at, what: kind === "options" ? { kind: "options" } : { kind: kind as "brokers" | "funds", option: option! } });
    }
  }
  return { holds: flips.length === 0, flips };
}

/** One end of a gap between two ways: its number, its figure (what is left, or what an account costs) and the name its sheet gives it. */
interface GapEnd {
  n: number;
  v: SiteValue;
  name: string;
}
/** The gap between two ways' figures, `a − b`, each opening its own sheet (what a choice is worth, a house's distance from the cheapest way). */
const gapOf2 = (ctx: Ctx, a: GapEnd, b: GapEnd, formula: string, about: string): SiteValue => differenceOf([a.name, a.v], [b.name, b.v], formula, { today: ctx.bundle.today, about });
/** A way's figure of what is left, named by whose it is. */
const leftEnd = (name: string, n: number, v: SiteValue): GapEnd => ({ n, v, name: copy.pair.input(name, copy.pair.colLeft) });
/** The cheapest way's figure, the one every gap to it starts from. */
const headlineEnd = (w: Way): GapEnd => leftEnd(copy.pair.cheapest, w.valueN, w.value);
const lowest = (xs: GapEnd[]) => xs.reduce<GapEnd | null>((a, x) => (!a || x.n < a.n ? x : a), null);
const highest = (xs: GapEnd[]) => xs.reduce<GapEnd | null>((a, x) => (!a || x.n > a.n ? x : a), null);
const shortOf = (ctx: Ctx, id: string) => {
  const s = ctx.snaps.find((x) => x.id === id);
  return s ? providerInfo(s).short : id;
};

function barsOf(ctx: Ctx, options: OptionView[], headline: Way | null): Bar[] {
  // the spread is the high end's figure less the low end's: a cost range is the accounts' costs before tax (F-91), a value range what is left (F-65)
  const bar = (id: BarId, low: GapEnd | null, high: GapEnd | null, formula: string, pending: Bar["pending"], open: boolean, extra: Partial<Bar> = {}): Bar => ({ id, pending: low === null || high === null ? (pending ?? "not-priced") : null, low: low?.n ?? null, high: high?.n ?? null, spread: low && high ? gapOf2(ctx, high, low, formula, id) : null, open, ...extra });
  const at = headline ? options.find((o) => o.id === headline.option)! : options.find((o) => o.bestCell) ?? null;
  const out: Bar[] = [];
  // the broker: the cost range of the option's brokers
  const costs = at ? at.cells.flatMap((c): GapEnd[] => (c.kind === "cost" ? [{ n: c.costN!, v: c.cost!, name: copy.pair.input(shortOf(ctx, c.providerId), copy.pair.colChargesShort) }] : [])) : [];
  out.push(bar("broker", lowest(costs), highest(costs), "F-91", null, !!at?.open, at ? { option: at.id } : {}));
  // the fund: values among the option's funds at its broker
  const vals = at ? at.funds.flatMap((f) => (f.best ? [leftEnd(f.name, f.best.valueN, f.best.value)] : [])) : [];
  out.push(bar("fund", lowest(vals), highest(vals), "F-65", vals.length === 0 ? "no-records" : null, !!at?.open, at ? { option: at.id } : {}));
  // ETF against tracking fund
  const wayEnd = (w: Way) => leftEnd(w.fund.name, w.valueN, w.value);
  const t = options.find((o) => o.id === "il-tracking")?.bestWay;
  const e = options.find((o) => o.id === "il-etf")?.bestWay;
  const te = t && e ? [wayEnd(t), wayEnd(e)] : [];
  out.push(bar("etf-tracking", lowest(te), highest(te), "F-65", "no-records", false, { between: ["il-tracking", "il-etf"] }));
  // in Israel or abroad: the best of the Israeli-rail options against the best abroad option
  const il = highest(options.filter((o) => o.id !== "abroad" && o.bestWay).map((o) => wayEnd(o.bestWay!)));
  const ab = options.find((o) => o.id === "abroad")?.bestWay;
  const both = il && ab ? [il, wayEnd(ab)] : [];
  out.push(bar("abroad", lowest(both), highest(both), "F-65", "no-records", !!ab?.open, { between: ["il-etf", "abroad"] }));
  return out;
}

/** Fund first by value left: ranked ones, then ones on an open rule, then the ones with no price. */
const entryOrder = (a: HouseEntry, b: HouseEntry) => {
  const rank = (e: HouseEntry) => (e.price && !e.price.open ? 0 : e.price ? 1 : 2);
  return rank(a) - rank(b) || (b.price?.valueN ?? 0) - (a.price?.valueN ?? 0);
};

function housesOf(ctx: Ctx, options: OptionView[], headline: Way | null, providers: ProviderInfo[]): HouseRow[] {
  const rows = providers.map((provider): HouseRow => {
    // a broker the person typed is in the group of what it sells; selling both, all of it counts (D44)
    const entered = ctx.snaps.find((s) => s.id === provider.id);
    const group: HouseGroup = provider.foreign || (provider.custom && !!entered && !!unavailable(entered, "il-etf")) ? "foreign" : "il";
    const opts = options.filter((o) => o.exists && (provider.custom || (GROUP_OPTIONS[group] as readonly OptionId[]).includes(o.id)));
    const entries = opts.flatMap((o) => o.funds).map((fund): HouseEntry => {
      const at = fund.byHouse[provider.id];
      return at && "value" in at ? { fund, price: at, reason: null } : { fund, price: null, reason: at?.reason ?? fund.reason ?? { code: "data-missing", recorded: null } };
    }).sort(entryOrder);
    const best = entries.find((e) => e.price && !e.price.open) ?? null;
    // no fund record at all: the broker cost of the group's options, the cheapest
    const cells = opts.flatMap((o) => o.cells.filter((c) => c.providerId === provider.id));
    const generic = cells.filter((c) => c.kind === "cost").sort((a, b) => a.costN! - b.costN!)[0] ?? null;
    const na = cells.find((c) => c.kind === "unavailable");
    const gap = best && headline && headline.providerId !== provider.id && headline.valueN - best.price!.valueN > 0 ? gapOf2(ctx, headlineEnd(headline), leftEnd(provider.short, best.price!.valueN, best.price!.value), "F-65", copy.houses.gapAbout(provider.name)) : null;
    const reason = best || generic ? null : (entries.find((e) => e.reason)?.reason ?? cells.find((c) => c.reason)?.reason ?? null);
    const standing = cells.some((c) => c.standing) || entries.some((e) => e.price?.standing);
    const aside = [...new Set([...cells.flatMap((c) => c.aside ?? []), ...entries.flatMap((e) => e.price?.aside ?? [])])];
    return { provider, group, entries, best, gap, unavailable: !best && !generic ? (na?.availability ?? null) : null, reason, generic, standing, aside };
  });
  const priced = (r: HouseRow) => r.best ?? r.generic;
  const cost = (r: HouseRow) => (r.best ? -r.best.price!.valueN : r.generic ? r.generic.costN! : Infinity);
  return rows.sort((a, b) => Number(!priced(a)) - Number(!priced(b)) || a.group.localeCompare(b.group) * -1 || cost(a) - cost(b) || a.provider.name.localeCompare(b.provider.name, "he"));
}

function worthOf(ctx: Ctx, options: OptionView[], headline: Way | null, providers: ProviderInfo[]): WorthLines | null {
  if (!headline) return null;
  const foreign = providers.find((p) => p.id === headline.providerId)?.foreign ?? false;
  const group = foreign ? GROUP_OPTIONS.foreign : GROUP_OPTIONS.il;
  const fStar = headline.fund;
  const others: GapEnd[] = [];
  for (const p of providers) {
    if (p.foreign !== foreign || p.id === headline.providerId) continue;
    const at = fStar.byHouse[p.id];
    if (at && "value" in at && !at.open) others.push(leftEnd(p.short, at.valueN, at.value));
  }
  const sameHouse: GapEnd[] = [];
  for (const o of options) {
    if (!o.exists || !(group as readonly OptionId[]).includes(o.id)) continue;
    for (const f of o.funds) {
      if (f.rec.id === fStar.rec.id) continue;
      const at = f.byHouse[headline.providerId];
      if (at && "value" in at && !at.open) sameHouse.push(leftEnd(f.name, at.valueN, at.value));
    }
  }
  const gap = (xs: GapEnd[], about: string) => {
    const low = lowest(xs);
    return low ? gapOf2(ctx, headlineEnd(headline), low, "F-65", about) : null;
  };
  return { house: gap(others, copy.worth.lines.house), houseCount: others.length, fund: gap(sameHouse, copy.worth.lines.fund), fundCount: sameHouse.length };
}

export interface InvestArgs {
  bundle: IndicesBundle;
  index: IndexRef;
  plan: WorkbenchInputs;
  yourBroker?: string | null;
  assumptions?: FundAssumptions;
}

export function buildInvest(a: InvestArgs): InvestView {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const yourBroker = a.yourBroker && ctx.snaps.some((s) => s.id === a.yourBroker) ? a.yourBroker : null;
  const options = core(ctx, a.index, yourBroker);
  const headline = headlineOf(options);
  const costed = options.filter((o) => o.bestCell).sort((a2, b2) => a2.bestCell!.costN! - b2.bestCell!.costN!);
  const genericHeadline = !headline && costed[0] && a.index.exposure === null ? { option: costed[0].id, cell: costed[0].bestCell! } : null;
  let atYours: InvestView["atYours"] = null;
  if (yourBroker && headline) {
    const y = headline.fund.atYours;
    const price = y && "value" in y ? y : null;
    atYours = { providerId: yourBroker, price, reason: y && "reason" in y ? y.reason : null, less: price ? gapOf2(ctx, headlineEnd(headline), leftEnd(shortOf(ctx, yourBroker), price.valueN, price.value), "F-65", "less") : null };
  }
  const illustrative = a.plan.returnFromParameter;
  const providers = ctx.snaps.map(providerInfo);
  return {
    index: a.index,
    options,
    providers,
    headline,
    genericHeadline,
    yourBroker,
    atYours,
    bars: barsOf(ctx, options, headline),
    houses: housesOf(ctx, options, headline, providers),
    worth: worthOf(ctx, options, headline, providers),
    order: illustrative && a.plan.grossReturn !== 0 && a.plan.grossReturn !== 0.1 ? orderCheck(ctx, a.index, yourBroker, options) : null,
    returnPct: a.plan.grossReturn * 100,
    returnIllustrative: illustrative,
    fundCount: a.bundle.funds.filter((f) => f.exposure_id === (a.index.exposure?.id ?? a.index.id)).length,
  };
}

// ---------------------------------------------------------------- one account and one fund, broken down (the index page's result)

export interface PairCosts {
  providerId: string;
  fundId: string;
  /** What the person puts in: the amount now and every monthly deposit (F-05), in today's shekels (F-06). */
  paidIn: SiteValue;
  /** The same deposits grown at the plan's return with no fee and no tax (F-91): `left` plus every cost. */
  base: number;
  /** `base` as a figure (F-91's X), with what its run reads: the plan and the exchange rate, none of the fund's or the account's prices. */
  baseValue: SiteValue;
  /** Real value left at the horizon (F-65). */
  left: SiteValue;
  /** The account's own lines over the horizon before the tax they save (F-91), real shekels; `interaction` is what no single line explains. */
  account: { line: FeeLine; cost: SiteValue }[];
  interaction: number;
  /** `interaction` as a figure (F-91), so the account's whole cost adds up figures that each open (`accountSum`). */
  remainder: SiteValue;
  /** The account's whole cost before the tax it saves (F-91): its lines and `interaction` together, the figure the account list shows. */
  accountCost: number;
  /** The fund pays out (A-10): the state's part holds the tax on what it pays as well as the capital gains tax at the sale. */
  distributes: boolean;
  /** The fund's own costs (management, variable, trustee, tracking, spread, withholding inside it) before the tax they save, with no account (F-91): the same at every account. */
  fund: SiteValue;
  /** The state's part (F-91): what remains, the tax paid during and at exit with the growth a tax paid along the way would have earned, at the horizon in today's shekels. */
  tax: SiteValue;
  /** F-109: the house buys the fund in whole units (`WayPrice.units`); the remainder then holds what the waiting cash did not earn. */
  units: WayPrice["units"];
  /**
   * The price list as the run read it, so a fee's rate can be said as the list prints it (`lib/rate-words`): the record's lines the run
   * priced at the list's own level, the bank's current account where the run counts one, and the house's name for their source. `entered`:
   * the prices are the person's (an account they typed or built on a house, or a group's picked prices), so no line is the list's.
   */
  priced: { lines: FeesSnapshot["lines"]; currentAccount: FeesSnapshot["current_account"] | null; house: string; entered: boolean };
}

/** One account and one fund on a plan, ready to price; null when the account does not sell the fund or the fund cannot be run. */
function pairOf(ctx: Ctx, a: { index: IndexRef; fundId: string; providerId: string }) {
  const rec = ctx.bundle.funds.find((f) => f.id === a.fundId);
  const s = ctx.snaps.find((x) => x.id === a.providerId);
  if (!rec || !s) return null;
  const option = optionOfFund(rec, a.index.exposure ?? undefined);
  if (unavailable(s, option)) return null;
  const fs = fundSpec(ctx, rec);
  if ("reason" in fs) return null;
  const venue = option === "abroad" ? venueOfFund(rec) : null;
  const price = (spec: Spec) => {
    const p = priceMany(ctx, spec, option, [s], venue).get(s.id);
    return p && p.kind === "ok" ? p.row : null;
  };
  return { rec, s, fs, price };
}

/** `pairCosts`, kept per data and plan object: the receipt, the fees panel and the lists' fund parts price the same pair on the same plan, once. */
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
  const parts = costByWho({ base, left: row.real, account: row.horizonCostBeforeTax, fund: noAccount(r0) - noAccount(row) });
  // the whole run (the account and the fund); the fund's part is measured with no account, so it reads none of the account's prices
  const inputs = inputsOfRun(ctx, { house: s.id, fund: rec.id, spec: fs.spec, row });
  const at = (n: number, formula: string, about: string, from = inputs) => computed(n, "nis", formula, from, { today: ctx.bundle.today, rules: rulesOf(row), about });
  const lines = row.byType.map((x) => ({ line: x.line, cost: at(x.costBeforeTax, "F-91", copy.pair.lineAbout(copy.pair.lines[x.line] ?? copy.pair.lines.other!)) }));
  const interaction = row.horizonCostBeforeTax - row.byType.reduce((t, x) => t + x.costBeforeTax, 0);
  const paidInReal = paidInAsEntered(ctx.plan.amountNow, ctx.plan.monthly, ctx.plan.years);
  return {
    providerId: s.id,
    fundId: rec.id,
    // what was paid in, in today's money (F-106): the amount, the deposit and the years, and nothing else
    paidIn: computed(paidInReal, "nis", "F-106", planInputs(ctx.plan, ["amount", "monthly", "years"]), { today: ctx.bundle.today, about: copy.pair.paidInAbout }),
    left: computed(row.real, "nis", "F-65", inputs, { today: ctx.bundle.today, rules: rulesOf(row), about: nameOf(rec) }),
    account: lines,
    interaction,
    remainder: at(interaction, "F-91", copy.pair.lineAbout(unitsOf(row.run) ? copy.pair.remainderUnits : copy.pair.remainder)),
    accountCost: row.horizonCostBeforeTax,
    distributes: !!distribution,
    fund: at(parts.fund, "F-91", copy.pair.fundAbout, inputsOfRun(ctx, { fund: rec.id, spec: fs.spec })),
    tax: at(parts.state, "F-91", distribution ? copy.pair.taxAboutPayouts : copy.pair.taxAbout),
    base,
    // X reads the plan and the rate alone: no fund cost, no distribution, no account (its run's rules are a tax's, which X is before)
    baseValue: computed(base, "nis", "F-91", inputsOfRun(ctx, { spec: fs.spec, costsOff: true }), { today: ctx.bundle.today, about: copy.pair.baseAbout }),
    units: unitsOf(row.run),
    priced: pricedLines(ctx, s, row),
  };
}

/**
 * The account's whole cost before the tax it saves, as a figure (F-91): its lines and the remainder no single line explains, added up, each
 * part opening its own sheet. `round` shapes it (a whole shekel).
 */
export function accountSum(pc: PairCosts, about: string, today: string, round?: (n: number) => number): SiteValue {
  const parts: Record<string, SiteValue> = {};
  for (const l of pc.account) parts[copy.pair.lines[l.line] ?? copy.pair.lines.other!] = l.cost;
  parts[copy.pair.remainder] = pc.remainder;
  return sumOf(parts, "F-91", { today, about, ...(round ? { round } : {}) });
}

// ---------------------------------------------------------------- broker costs by option (B1 API, requests.md)

/** The broker costs for each option (the grid's columns) for an index and the plan; a custom index works too (no funds needed). */
export function brokerCostsByOption(bundle: IndicesBundle, index: IndexRef, plan: WorkbenchInputs): Record<OptionId, BrokerCell[]> {
  const ctx = makeCtx(bundle, plan);
  const out = {} as Record<OptionId, BrokerCell[]>;
  for (const o of core(ctx, index, null)) out[o.id] = o.cells;
  return out;
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
  return (["unhedged", "hedged"] as const).every((k) => funds.some((f) => kindOf(f.rec) === k && Object.values(f.byHouse).some((x) => "valueN" in x && !x.open)));
}

type PairValueArgs = InvestArgs & { fundId: string; providerId: string; fxChange: number; tracking?: number };

/** One pair's run at a dollar change `fxChange` (percent a year, A-03), A-07 replaced by `tracking` when given. */
function pairRun(a: PairValueArgs) {
  const ctx = makeCtx(a.bundle, a.plan, { ...a.assumptions, fxChange: a.fxChange });
  const pair = pairOf(ctx, a);
  if (!pair) return null;
  let spec = pair.fs.spec;
  if (a.tracking !== undefined) {
    const fund = spec.fund as { drag?: Record<string, number> };
    spec = { ...spec, fund: { ...fund, drag: { ...fund.drag, tracking: a.tracking } } } as Spec;
  }
  const row = pair.price(spec);
  return row ? { ctx, rec: pair.rec, spec, row } : null;
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

/** P-02's bound of the dollar's yearly change against the shekel (A-03) as a figure, with its card; null without the record. */
export function dollarBound(bundle: Pick<IndicesBundle, "dollarRange">, end: "lo" | "hi"): SiteValue | null {
  const p = bundle.dollarRange?.p02 as unknown as { bounds?: Record<string, { lo: SiteValue; hi: SiteValue }>; rationale: string; rationale_he?: string | null } | undefined;
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

/**
 * The account's cost in whole shekels, as every block that shows it writes it: the account list's figure and the pair bar's account parts
 * (1,043 in the list against 689 + 352 + 3 = 1,044 in the bar on the MSCI ACWI).
 */
export const accountWhole = (x: Pick<WayPrice, "accountCost"> | Pick<PairCosts, "accountCost">): number => Math.round(x.accountCost);

/** A fund's listed fees together, percent a year. */
export const sumFeesPct = (rec: FundRecord) => sumFees(rec) * 100;

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
  const used = rec && reported && typeof rec.fees.tracking_difference_12m?.value !== "number" ? trackingBeyondFees(reported, sumFees(rec)) : null;
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
/** P-01 as a figure the page writes, with its card (the threshold that makes funds "שקולות" was nowhere on the page). */
export const tieThresholdValue = (bundle: Pick<IndicesBundle, "p01">): SiteValue => {
  const p = bundle.p01;
  const v = p.value!;
  return { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null } };
};

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
