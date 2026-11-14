// F-63 Provider workbench: one fund held, the same goal and behaviour, each provider's tariff at the chosen fee
// level (D4). Built on F-08 (`runSecurities`), F-61's building blocks (`withoutFeeLine`, `feeLines`) and F-80's
// tie test; F-118's workbench reads a fund whose exit tax an open rule blocks before that tax, with no ranking. No I/O: the fee
// snapshots (`data/fees/`) arrive as data.
import { feesSnapshot, type FeesSnapshot, type ValueObject } from "@finance-tool/schema";
import { coverageLine } from "../compare/coverage.ts";
import { isTie, relativeGap } from "../compare/ranking.ts";
import type { CoverageLine, Reason } from "../compare/types.ts";
import { computedValue, weakestStrength } from "../fees/computed.ts";
import { feeLines, withoutFeeLine, type FeeLine } from "../fees/materiality.ts";
import type { Commission, Custody } from "../formulas/fees.ts";
import type { Goal } from "../formulas/time.ts";
import type { Profile } from "../ledgers/common.ts";
import { beforeTaxPathOf, checkTariffPeriods, memberKindOf, runSecurities, runSecuritiesBeforeTax, type BeforeTaxRun, type Fund, type SecuritiesInput } from "../ledgers/securities.ts";
import { stoppedOnQuestion } from "../open-readings.ts";
import { RecordInputError } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";

/** D4: the three fee levels. The two averages are the two sources the snapshots hold (regulator, TASE's per-member). */
export type FeeLevel = "list" | "regulator_average" | "tase_average" | "entered";

/** The tariff lines of a securities run the person may type in (state "entered"); a line left out stays at the list price. */
export interface EnteredTariff {
  buy?: Commission;
  /** F-12: the price of a monthly purchase by standing order. Set only where the tariff has one; a line left out is the provider's own list line, if any (an entered `buy` or `sell` leaves the list's standing line out). */
  buyStanding?: Commission;
  sell?: Commission;
  /** F-24: a redemption. Read by the makam run only. */
  redeem?: Commission;
  custody?: Custody;
  /** A bare number is the percentage with no bounds; the `Commission` shape adds min and max in the instrument's currency (`in: "instrument"`). */
  fx?: number | Commission;
  /** F-13: the conversion of a monthly purchase on a recurring plan. */
  fxStanding?: number | Commission;
  /** F-13 (D65): the spread the provider's list limits, at its ceiling, kept beside a conversion price the person or a group sets. Absent with `fx`: the list's spread, if any. */
  fxSpread?: number;
  monthlyFee?: number;
  /** F-102 with F-101: the current account's monthly price in this stretch where a group's annex prints its own (0 for an exempt group);
   *  read only where the caller counts the bank's current account. Absent: the bank's ordinary minimum. */
  currentAccount?: number;
  /** F-102: where the group's own current-account price is printed (`groups.entries[].current_account.source`), for the row's `lineSources`. */
  currentAccountSource?: { url: string; title: string; page?: number };
  /** F-12, F-13: a monthly purchase may be placed the regular way, one flag for each side (see `SecuritiesTariff.cheaperOfStandingTrade`). */
  cheaperOfStandingTrade?: boolean;
  cheaperOfStandingFx?: boolean;
  /**
   * F-101: a price for a time, as a sequence. These lines apply to the run's months 1 to `months`; `then` is the tariff after
   * them (the provider's own list lines under whatever `then` names), and may carry a period of its own, counted from the start of the run.
   */
  until?: { months: number; then: EnteredTariff };
}

/** What the run holds that a layered account may need (F-101): the shekels per unit of a currency, the fund's class and currency, its share price. */
export interface LayeredRun {
  fx: Record<string, number> | undefined;
  instrumentClass: string;
  currency: { code: string; startRate: number } | undefined;
  sharePrice: number | undefined;
}
/** A layer that needs what the run lacks: the provider's row is "not comparable" with this reason, as a list line that needs it would be. */
export interface LayeredUnusable {
  unusable: "needs-fx-rate" | "needs-share-price";
  detail: string;
}

export interface ProviderInput {
  /** The provider's fee snapshot as `data/fees/<id>@<date>.json` holds it (checked here against the schema). */
  snapshot: unknown;
  level: FeeLevel;
  /** Required for `entered`: the person's own tariff. */
  entered?: EnteredTariff;
  /** When a line has averages for several bands, the band to use (the snapshot's own text). */
  averageBand?: string;
  /**
   * F-63: the plan the person is on, as the snapshot's `band` text names it (for example "מסלול ONE"); a plan line is read only when asked for here.
   * several texts may be given, one per base the snapshot splits by band (a trade band and an FX band); a line is asked for when its band contains any of them.
   */
  band?: string | readonly string[];
  /**
   * F-101: an account the person builds on this provider. With level `entered`, the provider's own list tariff for this fund
   * and channel is built first (the same `buildTariff` at level `list`, so no second reading of a price list exists) and handed to this
   * function, whose result is the entered tariff. A list tariff that cannot be built makes this provider's row "not comparable" as its own
   * list row would be.
   */
  layered?: (list: SecuritiesInput["tariff"], run: LayeredRun) => EnteredTariff | LayeredUnusable;
  /**
   * F-102 (D64): count the current account the snapshot records (a bank's monthly minimum). The caller decides where it applies
   * (`countsCurrentAccount`); left out, no current account is counted, as on every page but the indices page.
   */
  currentAccount?: boolean;
}

/** The id a current account's source takes among a tariff's `lineSources` (F-102): it is the snapshot's, not one of its lines. */
export const CURRENT_ACCOUNT_LINE = "current-account";

/**
 * F-102 (D64): whether a provider's row counts its current account: a bank whose record names one, unless it is the bank the person marks
 * as their own (`own`, a snapshot id), which they pay anyway. A house that needs no current account with it has none to count.
 */
export function countsCurrentAccount(snapshot: Pick<FeesSnapshot, "id" | "current_account">, own: string | null): boolean {
  return snapshot.current_account !== undefined && snapshot.id !== own;
}

export interface WorkbenchInput {
  goal: Goal;
  /** A-01 and A-02; A-03 when the fund is quoted in a foreign currency. */
  market: SecuritiesInput["market"];
  /** The fund held (its record and drag, A-06 to A-11). */
  fund: Fund;
  profile: Profile;
  broker?: SecuritiesInput["broker"];
  /** A-28: trades a month, as the person says they trade. FX is a percentage of each conversion, so the number of conversions does not change its cost; custody follows the tariff's own period. */
  behaviour?: { ordersPerMonth?: number };
  /** The snapshot's instrument class the fund is (`applies_to` of a line), for example `etf_units`. */
  instrumentClass: string;
  /** The wrapper whose lines apply, default `brokerage-account`. */
  wrapper?: string;
  /** The channel the person trades through (a line's `channel`); lines with no channel apply to every channel. */
  channel?: string;
  /** Set when the fund is quoted in a foreign currency: the FX line then applies (F-13). */
  currency?: { code: string; startRate: number };
  /**
   * F-63 (index page): shekels per one unit of a currency, by ISO code ("USD", "EUR", "GBP"), for the tariff lines set in
   * dollars, euros or pounds (per share, minimum, maximum). The site fills it from the ECB series with `crossRate` (F-84). A provider
   * whose line needs a currency this does not hold is "not comparable" (`needs-fx-rate`).
   */
  fx?: Record<string, number>;
  /** P-01 as a fraction (`tieThreshold`). */
  theta: number;
  /**
   * F-109 (D94): where the fund is bought, on TASE or abroad on a US or a European exchange. Where the fund has a unit price (`fund.sharePrice`),
   * each house buys it in whole units unless its record says it sells that listing by amount (`by_amount`); a tracking fund
   * (`mutual_fund_units`) is bought from its manager by amount. Left out, every order is bought by amount.
   */
  listing?: "tase" | "us" | "europe";
  /** The provider list for the wrapper (F-83); the workbench accounts for each exactly once. */
  providers: readonly ProviderInput[];
}

/** A snapshot line the tariff does not model, listed so the page can say so (never dropped silently). */
export interface NotModelled {
  lineId: string;
  base: string;
  reason: string;
}

export interface TariffBuild {
  tariff: SecuritiesInput["tariff"];
  /** The snapshot lines (or averages) the tariff reads. */
  linesUsed: string[];
  /** For each line read: the level and source of the rate used (an average row's source at an average level, F-63). */
  lineSources: { lineId: string; level: FeeLevel | "list"; url: string; publisher: string; strength: ValueObject["source"]["strength"] }[];
  /** Fee bases the snapshot has no applicable line for (trade, custody): the run charges nothing there, and the page says so. */
  noLine: ("trade" | "custody")[];
  notModelled: NotModelled[];
  /** Average rows applied (at an average level). */
  averagesApplied: number;
  /** Strengths of every line read, for the weakest-source label. */
  strengths: ValueObject["source"]["strength"][];
  flags: string[];
  /**
   * F-12, F-13 (D41, D56): standing-order and recurring-plan lines that apply to this purchase but that the ranked price leaves out
   * (`not_ranked`): the monthly purchases ran on the regular line, and the page shows these beside the row with their reason.
   */
  standingAside: string[];
}

export type NotComparableReason =
  | { code: "data-missing"; detail: string | null }
  | { code: "no-applicable-line"; detail: string }
  | { code: "no-average"; detail: string }
  | { code: "line-without-value"; detail: string }
  /** a per-share line and the fund record has no `share_price`. */
  | { code: "needs-share-price"; detail: string }
  /** a line in a foreign currency and `fx` holds no rate for it. */
  | { code: "needs-fx-rate"; detail: string }
  /** the snapshot is ambiguous or a unit is not one the tariff reads; `detail` is the engine's message. */
  | { code: "record-error"; detail: string }
  /** a run of the row stopped on an open question whose readings gave it different results (`acrossReadings`): nothing is ranked on one. */
  | { code: "rule-open"; ruleId: string; question: string };

export interface ProviderBase {
  id: string;
  name: string;
  providerClass: FeesSnapshot["provider"]["class"];
  level: FeeLevel;
  snapshot: string;
  tariffSource: FeesSnapshot["tariff"];
  /** Passed through from the snapshot (data-schema 3.6). */
  protectionRuleIds: string[];
  minimums: FeesSnapshot["minimums"];
}

export interface ComparedProvider extends ProviderBase {
  kind: "compared";
  /** D7: list and average are sourced; entered is the person's. */
  feeState: "sourced" | "entered";
  tariff: SecuritiesInput["tariff"];
  linesUsed: string[];
  /** Level and source of the rate each line used (additive). */
  lineSources: TariffBuild["lineSources"];
  noLine: ("trade" | "custody")[];
  notModelled: NotModelled[];
  flags: string[];
  /** Standing-order lines the ranked price left out (`TariffBuild.standingAside`). */
  standingAside: string[];
  /** `V_T^real(∅) − V_T^real(F_p)`: real NIS over the horizon. */
  horizonCost: ValueObject;
  /** `V_12(∅) − V_12(F_p)`: nominal NIS, liquidation value at month 12. */
  yearOneCost: ValueObject;
  /** Nominal fees paid in a 12-month run, exit commission included (trade, custody, fx, fixed). */
  yearOneFeesPaid: number;
  /** F-61 by fee type: `V(F \ {f}) − V(F)`, real NIS, for each provider line the tariff charges, largest first; `costBeforeTax` is the same difference before tax (F-91).
   *  In whole units (F-109) a line is what was paid on it, carried to the horizon before tax: `costBeforeTax` only, and `cost` is null, since no after-tax figure is worked for it. */
  byType: { line: FeeLine; cost: number | null; costBeforeTax: number }[];
  /** `total − Σ cost_f`; null in whole units, where the lines have no after-tax cost (the before-tax remainder is `horizonCostBeforeTax − Σ costBeforeTax_f`). */
  interaction: number | null;
  /** Real value at the horizon with this provider's fees. */
  real: number;
  /** `B(∅) − B(F_p)`, the horizon cost before the tax it saves, real NIS (F-91's account part; additive). */
  horizonCostBeforeTax: number;
  /** The tax of this run (during and at exit) divided by `I_T` (F-91 helper). */
  taxReal: number;
  run: RunResult;
  rank: number;
}

export interface NotComparableProvider extends ProviderBase {
  kind: "not-comparable";
  reason: NotComparableReason;
}

export type ProviderRow = ComparedProvider | NotComparableProvider;

export interface DecidingFeeType {
  /** The fee type with the largest absolute gap between the top two; null when every gap is zero. */
  line: FeeLine | null;
  /** Second minus top, per type: positive means the type costs the runner-up more. */
  gaps: Partial<Record<FeeLine, number>>;
}

export interface ProviderRanking {
  theta: number;
  /** Provider ids, cheapest first. */
  order: string[];
  /** The cheapest and every provider within θ of it (F-80, pairwise with the top). */
  tieSet: string[];
  entries: { id: string; rank: number; real: number; gapToNext?: number }[];
  topTwo?: { top: string; second: string; gap: number; tie: boolean; deciding: DecidingFeeType };
}

export interface ProviderWorkbench {
  formula: "F-63";
  /** Real value with no provider fees (fund costs and spread stay), the base of every cost. */
  realWithoutProviderFees: number;
  /** The same run before tax (F-91), the base of every cost before tax. */
  beforeTaxWithoutProviderFees: number;
  rows: ProviderRow[];
  ranking: ProviderRanking;
  /** F-83: every provider once, "ranked" or "not-evaluated". */
  coverage: CoverageLine<"ranked" | "not-evaluated">;
}

/** A value the snapshot holds as null: the provider's data is incomplete, so its row is "not comparable". */
export class Unusable extends Error {
  constructor(readonly code: "line-without-value" | "needs-share-price" | "needs-fx-rate", message: string) {
    super(message);
  }
}

const NIS_UNITS = new Set(["nis", "nis_per_trade", "nis_per_month"]);
const periodMonths = { month: 1, quarter: 3, year: 12 } as const;

function pct(vo: ValueObject, unit: ValueObject["unit"], what: string): number {
  if (vo.unit !== unit) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected ${unit}`);
  if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
  return vo.value / 100;
}

function nis(vo: ValueObject, what: string): number {
  if (!NIS_UNITS.has(vo.unit)) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected shekels`);
  if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
  return vo.value;
}

const USD_UNITS = new Set(["usd", "usd_per_trade"]);
/** The currency a fixed amount of a tariff line is printed in, by its unit (F-12): one table, so a bound in any of them is converted the same way (F-84). */
const CURRENCY_OF_UNIT: Partial<Record<ValueObject["unit"], string>> = { usd: "USD", usd_per_trade: "USD", eur: "EUR", gbp_per_trade: "GBP" };

/** Shekels per unit of a currency from the run's `fx` input; a provider that needs a rate the run lacks is "not comparable". */
function rateOf(fx: WorkbenchInput["fx"], code: string, what: string): number {
  const r = fx?.[code];
  if (typeof r !== "number" || !(r > 0)) throw new Unusable("needs-fx-rate", `${what}: no ${code} exchange rate in the run`);
  return r;
}

/** A minimum or maximum the line prints. A value object with a null value is a bound the tariff does not have (its notes say so), not missing data. */
const hasBound = (vo: ValueObject | null | undefined): vo is ValueObject => vo != null && vo.value !== null;

type SnapLine = FeesSnapshot["lines"][number];

/**
 * The securities tariff a snapshot gives at a fee level, for one fund and channel. A line applies when its
 * `applies_to` names the instrument class, the wrapper or `all`, and its `excludes` does not name the class.
 * `list` reads the list lines. An average level replaces a list line by an average line of the same base, or
 * its rate by an `averages` row (a percentage with no minimum or maximum, Q16); lines with no average stay at the list price.
 * `entered` takes the person's lines over the list lines. Quarterly or yearly fixed fees are spread evenly over their months.
 */
/** The band of a trade line that prices a purchase by standing order (F-12). Never the line of a sale, a lump sum or a reinvested distribution. */
export const STANDING_ORDER_BAND = "הוראת קבע";
/** The band of a conversion line that prices the conversion of a monthly purchase on a recurring plan (F-13). Never a lump sum's or a sale's: Interactive Israel's tariff, p.6, charges those by the table. */
export const STANDING_CONVERSION_BAND = "השקעה קבועה אוטומטית";
/** The band of a trade line that prices a redemption of makam (F-24): the tariff's line that names redemption, never the reduced price of an order placed online. */
export const REDEMPTION_BAND = "פדיון";

const standingLines = (snapshot: FeesSnapshot, base: "trade" | "fx") => snapshot.lines.filter((l) => l.base === base && l.level === "list" && l.band === (base === "trade" ? STANDING_ORDER_BAND : STANDING_CONVERSION_BAND));
/** D41, D56: a line the price list prints but the house's documents do not show the ordinary customer can use: never the ranked price. */
const ranked = (l: SnapLine) => l.not_ranked === undefined;

/**
 * The classes a tariff line may name for a security of this class. A bond (`tase_bonds`) is also a `tase_shares_bonds` security, and a line
 * that names the class itself is the more specific and wins. A foreign fund listed on TASE trades on the exchange-traded lines, and a line
 * can leave it out (`excludes`), as the standing-order lines do: they name a tracking fund as the law defines it (MF-58).
 */
export const lineClasses = (cls: string): string[] => (cls === "tase_bonds" ? ["tase_bonds", "tase_shares_bonds"] : cls === "tase_foreign_fund_units" ? ["tase_foreign_fund_units", "etf_units"] : [cls]);

/** What chooses a snapshot's line for a holding: its class, the wrapper, the channel and, for a conversion, the holding's currency. */
export type LineChoice = Pick<WorkbenchInput, "instrumentClass" | "wrapper" | "channel"> & { currency?: Pick<NonNullable<WorkbenchInput["currency"]>, "code"> };

/** Whether a snapshot line applies to a holding of this class in this wrapper: it names the class, the wrapper or `all`, and does not exclude the class. */
function appliesTo(l: SnapLine, input: Pick<LineChoice, "instrumentClass" | "wrapper">): boolean {
  const classes = lineClasses(input.instrumentClass);
  const wrapper = input.wrapper ?? "brokerage-account";
  return l.applies_to.some((a) => a === "all" || classes.includes(a) || a === wrapper) && !(l.excludes ?? []).some((x) => classes.includes(x));
}

/**
 * The line of a base at a level a run reads for a holding (F-63): none, one, or an error where two apply (the snapshot is ambiguous) or
 * the lines name channels and the choice names none. A line applies by `appliesTo`; a line set aside (`not_ranked`, D41) and a
 * standing-order, recurring-plan or redemption line are never the regular line. A conversion line printed for the holding's currency
 * wins over one with none (F-13), and a line that names the class itself wins over one that names a wider class. A plan line (`band`)
 * is read only when asked for; otherwise the standard line (`band: null`) wins, and a fixed fee that only a plan has is not the
 * standard tariff's.
 */
export function tariffLine(snapshot: FeesSnapshot, input: LineChoice, base: SnapLine["base"], at: SnapLine["level"], band?: ProviderInput["band"]): SnapLine | undefined {
  const all = snapshot.lines.filter((l) => l.base === base && l.level === at && appliesTo(l, input) && ranked(l) && l.band !== STANDING_ORDER_BAND && l.band !== STANDING_CONVERSION_BAND && l.band !== REDEMPTION_BAND);
  const channels = new Set(all.map((l) => l.channel).filter((c): c is string => c !== null));
  if (input.channel === undefined && channels.size > 0)
    throw new RecordInputError(`provider ${snapshot.id}: ${base} lines exist for channels ${[...channels].join(", ")}; the input must name the channel`);
  let found = all.filter((l) => l.channel === null || l.channel === input.channel);
  // F-13: a conversion line printed for one currency prices a fund in it, and the line with no currency prices the others.
  if (base === "fx" && input.currency) {
    const own = found.filter((l) => l.conversion_currency === input.currency!.code);
    found = own.length > 0 ? own : found.filter((l) => !l.conversion_currency);
  }
  const exact = found.filter((l) => l.applies_to.includes(input.instrumentClass));
  if (exact.length > 0 && exact.length < found.length && lineClasses(input.instrumentClass).length > 1) found = exact;
  const ambiguous = (ls: SnapLine[]) =>
    new RecordInputError(`provider ${snapshot.id}: ${ls.length} ${base} lines apply (${ls.map((l) => l.id).join(", ")}); the snapshot is ambiguous`);
  // F-63: a plan line (a `band` the person names in `p.band`) wins when asked for; otherwise the standard line (`band: null`)
  // wins over every banded line. A fixed fee that only a plan has is the plan's price, not the standard tariff's.
  if (band !== undefined) {
    const wanted = typeof band === "string" ? [band] : band;
    const asked = found.filter((l) => l.band !== null && wanted.some((w) => l.band === w || l.band!.includes(w)));
    if (asked.length > 1) throw ambiguous(asked);
    if (asked.length === 1) return asked[0];
  }
  const standard = found.filter((l) => l.band === null);
  if (standard.length > 1) throw ambiguous(standard);
  if (standard.length === 1) return standard[0];
  if (found.length > 1) throw ambiguous(found);
  if (found[0] && base === "fixed_period") return undefined;
  return found[0];
}

/** A tariff can be read without a fund (the goal comparison's list of brokers): only a fee per share and a distribution line need one. */
export function buildTariff(input: Omit<WorkbenchInput, "fund"> & { fund?: WorkbenchInput["fund"] }, p: ProviderInput, snapshot: FeesSnapshot): TariffBuild {
  const applicable = (l: SnapLine) => appliesTo(l, input);
  const out: TariffBuild = { tariff: {}, linesUsed: [], lineSources: [], noLine: [], notModelled: [], averagesApplied: 0, strengths: [], flags: [], standingAside: [] };
  /** A line the tariff reads: its id, and the strength and source of the rate actually used (an average row's, not the list line's). */
  const used = (l: SnapLine, rate: ValueObject, ...vos: (ValueObject | null | undefined)[]) => {
    out.linesUsed.push(l.id);
    out.lineSources.push({ lineId: l.id, level: rate === l.rate ? l.level : (averageLevel ?? l.level), url: rate.source.url, publisher: rate.source.publisher, strength: rate.source.strength });
    for (const vo of [rate, ...vos]) if (vo) out.strengths.push(vo.source.strength);
  };

  const level = p.level;
  const averageLevel = level === "regulator_average" || level === "tase_average" ? level : undefined;
  if (level === "entered" && !p.entered) throw new RecordInputError(`provider ${snapshot.id}: level "entered" needs the person's entered tariff`);

  /** The line of a base at a level for the channel (`tariffLine`). */
  const pick = (base: SnapLine["base"], at: SnapLine["level"]): SnapLine | undefined => tariffLine(snapshot, input, base, at, p.band);

  const averageFor = (l: SnapLine): ValueObject | undefined => {
    if (!averageLevel) return undefined;
    let rows = snapshot.averages.filter((a) => a.line_id === l.id && a.level === averageLevel);
    if (rows.length > 1 && p.averageBand !== undefined) rows = rows.filter((a) => a.band === p.averageBand);
    if (rows.length > 1) throw new RecordInputError(`provider ${snapshot.id}: line ${l.id} has ${rows.length} averages at ${averageLevel}; name the band`);
    return rows[0]?.rate;
  };

  /** The line a base uses at the chosen level, with whether an average replaced it. */
  const resolve = (base: SnapLine["base"]) => {
    const own = averageLevel ? pick(base, averageLevel) : undefined;
    if (own) {
      // F-63: an average is a percentage with no bounds, also when the snapshot gives it as a line of its own level.
      out.averagesApplied++;
      return { line: own, rate: own.rate, min: null, max: null, cap: null };
    }
    const list = pick(base, "list");
    if (!list) return undefined;
    const avg = averageFor(list);
    if (avg) {
      out.averagesApplied++;
      return { line: list, rate: avg, min: null, max: null, cap: null, average: true };
    }
    return { line: list, rate: list.rate, min: list.min, max: list.max, cap: list.cap };
  };

  const entered = level === "entered" ? p.entered! : undefined;

  // Trade: one line serves buy and sell (the snapshot's lines are "buy, sell").
  if (entered?.buy || entered?.sell) {
    if (entered.buy) out.tariff.buy = entered.buy;
    if (entered.sell) out.tariff.sell = entered.sell;
    if (entered.buyStanding) out.tariff.buyStanding = entered.buyStanding;
    if (entered.redeem) out.tariff.redeem = entered.redeem;
    if (entered.cheaperOfStandingTrade) out.tariff.cheaperOfStandingTrade = true;
  } else {
    const r = resolve("trade");
    if (r) {
      // E1: a dollar rate per share is charged on the share count, which needs the fund's price.
      const commission = (l: { line: SnapLine; rate: ValueObject; min: ValueObject | null | undefined; max: ValueObject | null | undefined; cap: ValueObject | null | undefined }): Commission => {
        const c: Commission = { rate: 0 };
        if (l.rate.unit === "usd_per_share") {
          if (typeof l.rate.value !== "number") throw new Unusable("line-without-value", `${l.line.id} rate has no value`);
          if (!input.fund?.sharePrice) throw new Unusable("needs-share-price", `${l.line.id} is a fee per share and the fund record has no share_price`);
          const priced = input.fund.sharePriceCurrency;
          if (priced && priced !== "ILS" && priced !== (input.currency?.code ?? "ILS")) rateOf(input.fx, priced, `${l.line.id}: the fund's unit price`);
          c.perShare = l.rate.value * rateOf(input.fx, "USD", `${l.line.id} rate`);
        } else c.rate = pct(l.rate, "pct_of_trade", `${l.line.id} rate`);
        // E2: minimums and maximums in a foreign currency are converted at the run's rate.
        const bound = (vo: ValueObject, what: string): number => {
          if (NIS_UNITS.has(vo.unit)) return nis(vo, what);
          // F-12: a bound printed in the trade's currency is in the currency the run trades the fund in; where the line names the
          // currencies it is printed for and that one is not among them, the list gives no bound for the trade
          if (vo.unit === "trade_ccy_per_trade") {
            const trade = input.currency?.code ?? "ILS";
            if (l.line.trade_currencies && !l.line.trade_currencies.includes(trade)) throw new Unusable("line-without-value", `${what} is printed for ${l.line.trade_currencies.join(", ")}, and the trade is in ${trade}`);
            if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
            return trade === "ILS" ? vo.value : vo.value * rateOf(input.fx, trade, what);
          }
          const code = CURRENCY_OF_UNIT[vo.unit];
          if (!code) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected shekels, dollars, euros or pounds`);
          if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
          return vo.value * rateOf(input.fx, code, what);
        };
        if (hasBound(l.min)) c.min = bound(l.min, `${l.line.id} min`);
        if (hasBound(l.max)) c.max = bound(l.max, `${l.line.id} max`);
        // E3: the cap is a share of the trade value and wins over the minimum.
        if (hasBound(l.cap)) c.cap = pct(l.cap, "pct_of_trade", `${l.line.id} cap`);
        // F-12: a flat price for an order up to a sum (BRK-54).
        if (l.line.flat_up_to) c.flatUpTo = { amount: bound(l.line.flat_up_to.amount, `${l.line.id} flat amount`), upTo: bound(l.line.flat_up_to.up_to, `${l.line.id} flat up to`) };
        return c;
      };
      const c = commission(r);
      out.tariff.buy = c;
      out.tariff.sell = { ...c };
      used(r.line, r.rate, r.min, r.max, r.cap);
      // F-12: a monthly purchase by standing order, where the tariff prints a price for one; a list price only, never over an average.
      // A line the house's documents do not show the customer can use (D41, D56) is set aside: the regular line prices the purchase.
      if (r.rate === r.line.rate && r.line.level === "list") {
        const all = standingLines(snapshot, "trade").filter((l) => applicable(l) && (l.channel === null || l.channel === input.channel));
        out.standingAside.push(...all.filter((l) => !ranked(l)).map((l) => l.id));
        const standing = all.filter(ranked);
        if (standing.length > 1) throw new RecordInputError(`provider ${snapshot.id}: ${standing.length} standing-order lines apply (${standing.map((l) => l.id).join(", ")}); the snapshot is ambiguous`);
        const l = standing[0];
        if (l) {
          out.tariff.buyStanding = commission({ line: l, rate: l.rate, min: l.min, max: l.max, cap: l.cap });
          used(l, l.rate, l.min, l.max, l.cap);
        }
        // F-24: a redemption, where the tariff names it; it follows no channel, because no order is placed
        const redemption = snapshot.lines.filter((l) => l.base === "trade" && l.level === "list" && l.band === REDEMPTION_BAND && applicable(l));
        if (redemption.length > 1) throw new RecordInputError(`provider ${snapshot.id}: ${redemption.length} redemption lines apply (${redemption.map((l) => l.id).join(", ")}); the snapshot is ambiguous`);
        const paid = redemption[0];
        if (paid) {
          out.tariff.redeem = commission({ line: paid, rate: paid.rate, min: paid.min, max: paid.max, cap: paid.cap });
          used(paid, paid.rate, paid.min, paid.max, paid.cap);
        }
      }
    } else out.noLine.push("trade");
  }

  // Custody: a rate of the balance per period, with min and max.
  let custodyAverage = false;
  if (entered?.custody) out.tariff.custody = entered.custody;
  else {
    const r = resolve("custody");
    if (r) {
      custodyAverage = r.rate !== r.line.rate;
      // A zero rate prints no period (One Zero's "0 אחוז"): it charges nothing whatever the period is.
      const period = r.line.period ?? (r.rate.value === 0 ? "month" : null);
      if (period === null) throw new Unusable("line-without-value", `${r.line.id} has no period`);
      const c: Custody = { rate: pct(r.rate, "pct_of_balance_per_period", `${r.line.id} rate`), everyMonths: periodMonths[period] };
      // F-14: a bound printed per month is per charging period here, so a yearly line with a monthly minimum charges twelve of them.
      const boundOf = (b: ValueObject, what: string) => nis(b, what) * (b.unit === "nis_per_month" ? c.everyMonths : 1);
      if (hasBound(r.min)) c.min = boundOf(r.min, `${r.line.id} min`);
      if (hasBound(r.max)) c.max = boundOf(r.max, `${r.line.id} max`);
      out.tariff.custody = c;
      used(r.line, r.rate, r.min, r.max);
    } else out.noLine.push("custody");
  }

  // Fixed fee: shekels a period, charged monthly.
  if (entered?.monthlyFee !== undefined) out.tariff.monthlyFee = entered.monthlyFee;
  else {
    const r = resolve("fixed_period");
    if (r) {
      if (typeof r.rate.value !== "number") throw new Unusable("line-without-value", `${r.line.id} has no value`);
      const months = r.line.period ? periodMonths[r.line.period] : 1;
      if (r.rate.unit !== "nis_per_month" && r.rate.unit !== "nis") throw new RecordInputError(`${r.line.id}: unit is ${r.rate.unit}, expected shekels a period`);
      out.tariff.monthlyFee = r.rate.value / months;
      used(r.line, r.rate);
      if (months > 1) out.flags.push(`fixed-fee-spread:${r.line.id}`);
    }
  }

  /**
   * F-13: a conversion line as the run charges it. A bare percentage stays a number; a price per dollar, a minimum or maximum, or a flat price
   * for a conversion up to a sum (`flat_up_to`) makes a `Commission`. Bounds and the flat price set in dollars stay in the trade currency
   * (`in: "instrument"`), converted at the rate of each conversion; all of a line's sums are in one currency, since a `Commission` holds one.
   */
  const conversionOf = (l: { line: SnapLine; rate: ValueObject; min?: ValueObject | null; max?: ValueObject | null; flat?: SnapLine["flat_up_to"] }): number | Commission => {
    const c: Commission = { rate: 0 };
    // F-13: a conversion priced in shekels a dollar, not as a share of the amount.
    if (l.rate.unit === "nis_per_usd") {
      if (input.currency!.code !== "USD") throw new RecordInputError(`${l.line.id}: the price is per dollar but the instrument currency is ${input.currency!.code}`);
      if (typeof l.rate.value !== "number") throw new Unusable("line-without-value", `${l.line.id} rate has no value`);
      c.perCurrencyUnit = l.rate.value;
    } else c.rate = pct(l.rate, "pct_of_trade", `${l.line.id} rate`);
    const sums = [l.min, l.max, l.flat?.amount, l.flat?.up_to].filter(hasBound);
    if (!sums.length) return c.perCurrencyUnit !== undefined ? c : c.rate;
    // The FX bounds are in USD where the bank sets them so: they stay in the trade currency (F-13).
    const units = new Set(sums.map((b) => (USD_UNITS.has(b.unit) ? "usd" : NIS_UNITS.has(b.unit) ? "nis" : b.unit)));
    if (units.size > 1) throw new RecordInputError(`${l.line.id}: the conversion's sums are in different units (${[...new Set(sums.map((b) => b.unit))].join(", ")})`);
    if (units.has("usd")) {
      if (input.currency!.code !== "USD") throw new RecordInputError(`${l.line.id}: the sums are in USD but the instrument currency is ${input.currency!.code}`);
      c.in = "instrument";
    }
    const bound = (vo: ValueObject, what: string) => {
      if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
      if (!USD_UNITS.has(vo.unit) && !NIS_UNITS.has(vo.unit)) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected shekels or dollars`);
      return vo.value;
    };
    if (hasBound(l.min)) c.min = bound(l.min, `${l.line.id} min`);
    if (hasBound(l.max)) c.max = bound(l.max, `${l.line.id} max`);
    if (l.flat) c.flatUpTo = { amount: bound(l.flat.amount, `${l.line.id} flat amount`), upTo: bound(l.flat.up_to, `${l.line.id} flat up to`) };
    return c;
  };

  // FX: only a fund quoted in a foreign currency is converted (F-13).
  if (input.currency) {
    out.tariff.currency = input.currency;
    if (entered?.fx !== undefined) {
      out.tariff.fx = entered.fx;
      if (entered.fxStanding !== undefined) out.tariff.fxStanding = entered.fxStanding;
      if (entered.cheaperOfStandingFx) out.tariff.cheaperOfStandingFx = true;
      // F-13 (D65): a conversion price set over a house's list (F-101) keeps the list's spread, carried in the layers
      if (entered.fxSpread) out.tariff.fxSpread = entered.fxSpread;
    } else {
      const r = resolve("fx");
      if (r) {
        // F-13: a flat price for a conversion up to a sum, read at the list price only: an average is a percentage with no bounds (F-63)
        const atList = r.rate === r.line.rate;
        const c = conversionOf({ ...r, flat: atList ? r.line.flat_up_to : undefined });
        // F-13 (D56, D65): a spread the price list limits ("עד 0.7%") is priced at its ceiling, beside the conversion fee and in a field of its
        // own (`fxSpread`), charged on every conversion; a spread with no ceiling (value null) is not priced. Only the list line carries it: an
        // average row is what customers paid, spread and all.
        const spread = atList ? r.line.spread : null;
        if (spread && typeof spread.value === "number") {
          if (typeof c !== "number") throw new RecordInputError(`${r.line.id}: a priced spread beside a fee with bounds, a flat price or a price per dollar is not modelled`);
          const s = pct(spread, "pct_of_trade", `${r.line.id} spread`);
          if (s > 0) out.tariff.fxSpread = s;
        }
        out.tariff.fx = c;
        used(r.line, r.rate, r.min, r.max, spread && typeof spread.value === "number" ? spread : null, ...(typeof c === "object" && c.flatUpTo ? [r.line.flat_up_to!.amount, r.line.flat_up_to!.up_to] : []));
        // F-13: the conversion of a monthly purchase on a recurring plan, where the tariff prints a price for one; a list price only, never over an average.
        if (r.rate === r.line.rate && r.line.level === "list") {
          const every = standingLines(snapshot, "fx").filter((l) => applicable(l) && (l.channel === null || l.channel === input.channel));
          out.standingAside.push(...every.filter((l) => !ranked(l)).map((l) => l.id));
          const plan = every.filter(ranked);
          if (plan.length > 1) throw new RecordInputError(`provider ${snapshot.id}: ${plan.length} recurring-plan conversion lines apply (${plan.map((l) => l.id).join(", ")}); the snapshot is ambiguous`);
          const l = plan[0];
          if (l) {
            out.tariff.fxStanding = conversionOf({ line: l, rate: l.rate, min: l.min, max: l.max, flat: l.flat_up_to });
            used(l, l.rate, l.min, l.max, l.flat_up_to?.amount, l.flat_up_to?.up_to);
          }
        }
      }
    }
  }

  // F-103 (D67): a charge for each corporate event of a security held abroad, read as one on each dividend of a fund bought abroad that pays
  // dividends; an accumulating fund has no dividend, and a fund in Tel Aviv is never in the line's class. It is part of the custody line (F-61)
  // and follows it: at the list price where custody is at the list or the person's, left out where an average replaces custody, since an
  // average is what customers paid, a custodian's charge passed on included (as the spread follows the conversion line, F-13).
  if (input.currency && input.fund?.distribution && !custodyAverage) {
    const l = pick("corporate_event", "list");
    if (l) {
      if (l.rate.unit !== "usd_per_event") throw new RecordInputError(`${l.id}: unit is ${l.rate.unit}, expected usd_per_event`);
      if (typeof l.rate.value !== "number") throw new Unusable("line-without-value", `${l.id} has no value`);
      // in the instrument's currency, as the run charges it: dollars as they are, another currency through the shekel
      const usd = input.fx?.USD;
      if (input.currency.code !== "USD" && !usd) throw new Unusable("needs-fx-rate", `${l.id}: the charge is in USD and the run holds no USD rate`);
      out.tariff.perDividend = input.currency.code === "USD" ? l.rate.value : (l.rate.value * usd!) / input.currency.startRate;
      used(l, l.rate);
    }
  }

  // F-102 (D64): the current account at a bank, where the caller counts it (the indices page: every bank but the one the person marks)
  if (p.currentAccount && snapshot.current_account) {
    const m = snapshot.current_account.monthly_minimum;
    if (m.unit !== "nis_per_month" || typeof m.value !== "number") throw new RecordInputError(`provider ${snapshot.id}: current_account.monthly_minimum must be a number in nis_per_month`);
    // a stretch of an account built on a bank (F-101) whose group's annex prints its own price keeps it; every other stretch, the ordinary minimum
    const own = level === "entered" ? entered?.currentAccount : undefined;
    out.tariff.currentAccount = own ?? m.value;
    // a stretch that charges the price list's minimum rests on the price list, whether the minimum came from the record or was copied into
    // the stretch (the site's account built on a bank copies it into every stretch, own-account `enteredOf`)
    if (own === undefined || own === m.value) {
      out.lineSources.push({ lineId: CURRENT_ACCOUNT_LINE, level: "list", url: m.source.url, publisher: m.source.publisher, strength: m.source.strength });
      out.strengths.push(m.source.strength);
    } else if (entered?.currentAccountSource) {
      // the group's own price is the bank's annex, as the ordinary minimum is the bank's price list
      out.lineSources.push({ lineId: CURRENT_ACCOUNT_LINE, level: "entered", url: entered.currentAccountSource.url, publisher: m.source.publisher, strength: m.source.strength });
    }
  }

  // F-101: a price for a time. The tariff after it is built the same way from its own lines, over the provider's list lines.
  if (entered?.until) {
    const after = buildTariff(input, { ...p, level: "entered", entered: entered.until.then, layered: undefined }, snapshot);
    const { currency: _, ...then } = after.tariff;
    out.tariff.until = { months: entered.until.months, then };
    // every stretch's sources are the row's: the ordinary current account after a group's exemption among them (F-102)
    for (const x of after.lineSources) if (!out.lineSources.some((y) => y.lineId === x.lineId && y.url === x.url && y.level === x.level)) out.lineSources.push(x);
    for (const x of after.strengths) if (!out.strengths.includes(x)) out.strengths.push(x);
    // a period that ends between two custody charges is refused here, so that the provider's row says so (the run refuses it too)
    checkTariffPeriods(out.tariff);
  }

  // Lines that apply to the fund but that no formula here charges (F-18 is pending; the rest are not part of a holding's running cost).
  const modelled = new Set<SnapLine["base"]>(["trade", "custody", "fixed_period", "fx", "corporate_event"]);
  for (const l of snapshot.lines.filter(applicable)) {
    if (l.base === "distribution_handling") {
      if (input.fund?.distribution) {
        out.notModelled.push({ lineId: l.id, base: l.base, reason: "F-18 is not computed yet" });
        if (!out.flags.includes("F-18")) out.flags.push("F-18");
      }
    } else if (!modelled.has(l.base) && l.base !== "balance" && l.base !== "deposit") {
      out.notModelled.push({ lineId: l.id, base: l.base, reason: "no formula charges this line in a holding's running cost" });
    }
  }
  return out;
}

const providerLines: readonly FeeLine[] = ["trade", "custody", "fx", "fixed", "account"];

/**
 * F-109 (D94): how a house buys the fund. In whole units at the fund's unit price, in shekels at the run's start (the record's `share_price`
 * at the run's rate of its currency), unless the house's own record says it sells the fund's listing by amount: an entry for every order buys
 * every order by amount; an entry for its recurring plan buys by amount the monthly purchases the plan's conversion line prices (F-13), and
 * the rest in whole units. An entry limited to a list of securities the house does not publish (`list_only`) names none of the site's funds
 * (D42) and changes nothing. Undefined (by amount): no listing, a tracking fund (bought from its manager by amount), or no unit price.
 */
export function wholeUnitsAt(input: Pick<WorkbenchInput, "listing" | "instrumentClass" | "fund" | "currency" | "fx">, snapshot: Pick<FeesSnapshot, "by_amount">, tariff: SecuritiesInput["tariff"]): SecuritiesInput["wholeUnits"] {
  const price = unitPriceAt(input);
  if (price === undefined) return undefined;
  const entry = (snapshot.by_amount ?? []).find((e) => e.venue === input.listing && !e.list_only && !e.shares_only);
  if (entry?.orders === "all") return undefined;
  const plan = entry?.orders === "recurring_plan" && tariff.fxStanding !== undefined;
  return { price, ...(plan ? { monthlyByAmount: true } : {}) };
}

/** F-109: the unit's price in shekels at the run's start, where the fund is bought on an exchange and has one; undefined otherwise. */
function unitPriceAt(input: Pick<WorkbenchInput, "listing" | "instrumentClass" | "fund" | "currency" | "fx">): number | undefined {
  const price = input.fund.sharePrice;
  if (!input.listing || input.instrumentClass === "mutual_fund_units" || !price) return undefined;
  const code = input.fund.sharePriceCurrency ?? input.currency?.code ?? "ILS";
  const rate = code === "ILS" ? 1 : code === input.currency?.code ? input.currency.startRate : rateOf(input.fx, code, "the fund's unit price");
  return price * rate;
}

/**
 * F-109 (D94): the ways a house can buy the fund, the first its own (`wholeUnitsAt`). A house that sells the listing by amount, for every
 * order or on its recurring plan, can also buy whole units: both are run and the house is priced on the one that leaves more, as a monthly
 * purchase takes the standing line or the regular one. A house that sells only whole units, and a fund with no unit price, have one way.
 */
export function unitWaysAt(input: Pick<WorkbenchInput, "listing" | "instrumentClass" | "fund" | "currency" | "fx">, snapshot: Pick<FeesSnapshot, "by_amount">, tariff: SecuritiesInput["tariff"]): SecuritiesInput["wholeUnits"][] {
  const own = wholeUnitsAt(input, snapshot, tariff);
  const price = unitPriceAt(input);
  if (price === undefined || (own && !own.monthlyByAmount)) return [own];
  return [own, { price }];
}

/** The fund as the run takes it: a share price printed in another currency than the instrument's carries the run's rate between them. */
function fundForRun(input: Pick<WorkbenchInput, "fund" | "currency" | "fx">): Fund {
  const f = input.fund;
  const code = f.sharePriceCurrency;
  const unit = input.currency?.code ?? "ILS";
  if (!f.sharePrice || !code || code === unit) return f;
  const r = code === "ILS" ? 1 : input.fx?.[code];
  const u = unit === "ILS" ? 1 : input.currency!.startRate;
  return typeof r === "number" && r > 0 ? { ...f, sharePriceRate: r / u } : f;
}

/** The function's result, computed at the first call. */
function once<T>(work: () => T): () => T {
  let done: { value: T } | null = null;
  return () => (done ??= { value: work() }).value;
}

/** A snapshot is read the same way every time it is run: checked once per object, since a page runs each one hundreds of times. */
const checked = new WeakMap<object, FeesSnapshot>();
function checkedSnapshot(snapshot: unknown): FeesSnapshot {
  const known = typeof snapshot === "object" && snapshot !== null ? checked.get(snapshot) : undefined;
  if (known) return known;
  const parsed = feesSnapshot.safeParse(snapshot);
  if (!parsed.success) {
    throw new RecordInputError(`fee snapshot: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
  }
  if (typeof snapshot === "object" && snapshot !== null) checked.set(snapshot, parsed.data);
  return parsed.data;
}

/** The CPI index at the run's exit, `I_T` (F-03): from the run's own series, else from `V_T / V_T^real`. */
function indexAtExit(r: RunResult): number {
  const p = r.series.find((x) => x.month === r.exitMonth) ?? r.series[r.series.length - 1];
  if (p && p.index > 0) return p.index;
  return r.real !== 0 ? r.nominal / r.real : 1;
}

/** F-91 helper: a run's tax (during and at exit) divided by `I_T`, the value `B` adds back. */
export function taxReal(r: RunResult): number {
  return (r.taxDuring + r.taxAtExit) / indexAtExit(r);
}

/** F-91 helper: the real value before tax, `B = V_T^real + tax_real`; a difference of two is a cost before the tax it saves. */
export function beforeTax(r: RunResult): number {
  return r.real + taxReal(r);
}

/**
 * F-91, F-109 helper: what the cash waiting for a whole unit did against the fund, at the horizon in today's shekels (`waitingCarried / I_T`):
 * above zero where it missed a rise, below zero where it missed a fall; null for a run that is not in whole units.
 */
export function waitingReal(r: Pick<RunResult, "waitingCarried" | "series" | "exitMonth" | "nominal" | "real">): number | null {
  return r.waitingCarried === undefined ? null : r.waitingCarried / indexAtExit(r as RunResult);
}

/** F-91's inputs, every one a real value at the horizon in today's shekels. */
export interface CostByWhoInput {
  /** `X`: B of the same deposits in the same fund with no fund cost, no distribution and no account: the plan's return alone. */
  base: number;
  /** `V_T^real` of the way. */
  left: number;
  /** `B(u, no account fees) − B(u, p)`: the account's cost before tax (`horizonCostBeforeTax`). */
  account: number;
  /** `B(u with no fund cost, no account) − B(u, no account)`. */
  fund: number;
  /** F-109: the part of `account` that is the cash waiting for a whole unit (`waitingReal`); none for a run by amount. */
  waiting?: number;
}

/**
 * F-91 A way's cost by who takes it. The account and the fund before the tax they save, the fund measured with no account;
 * the state is what remains, `X − left − account − fund`: the tax paid, with the growth a tax paid during the holding would
 * have earned. The three add up to `X − left` by construction, so the gap in what is left between two ways on the same plan
 * is the gap in their costs. In whole units (F-109) the account's part splits in two: the cash waiting for a unit (`waiting`,
 * a gain where the fund fell) and what the account's fees took, `fees = account − waiting`; by amount `fees` is the whole part.
 */
export function costByWho(a: CostByWhoInput): { account: number; fees: number; waiting: number; fund: number; state: number } {
  const waiting = a.waiting ?? 0;
  return { account: a.account, fees: a.account - waiting, waiting, fund: a.fund, state: a.base - a.left - a.account - a.fund };
}

/** One provider read for a run (F-63): its row's base, its tariff at its level, its member kind and the ways it buys the fund (F-109). */
interface ReadyProvider {
  kind: "ready";
  base: ProviderBase;
  p: ProviderInput;
  built: TariffBuild;
  memberKind: NonNullable<SecuritiesInput["memberKind"]>;
  ways: SecuritiesInput["wholeUnits"][];
}

/**
 * A provider's tariff for the run, or its row "not comparable" with the reason (F-63): a snapshot marked missing, a line with no value, an
 * unreadable record (E5), no line that applies, no average at an average level. The one reading both workbenches share (F-63, F-118).
 */
function prepareProvider(input: WorkbenchInput, given: ProviderInput): ReadyProvider | NotComparableProvider {
  let p = given;
  const s = checkedSnapshot(p.snapshot);
  const base: ProviderBase = {
    id: s.id,
    name: s.provider.name_he,
    providerClass: s.provider.class,
    level: p.level,
    snapshot: s.snapshot,
    tariffSource: s.tariff,
    protectionRuleIds: s.provider.protection_rule_ids,
    minimums: s.minimums,
  };
  const notComparable = (reason: NotComparableReason): NotComparableProvider => ({ ...base, kind: "not-comparable", reason });

  // A snapshot marked missing has no tariff to read. An entered tariff is the person's own and needs none.
  if (s.missing && p.level !== "entered") return notComparable({ code: "data-missing", detail: s.missing_reason });
  let built: TariffBuild;
  try {
    const forBuild = s.missing ? { ...s, lines: [], averages: [] } : s;
    if (p.level === "entered" && p.layered) {
      // F-101: the provider's own list tariff first, then the layers on it
      const list = buildTariff(input, { ...p, level: "list", entered: undefined, layered: undefined }, forBuild);
      const layers = p.layered(list.tariff, { fx: input.fx, instrumentClass: input.instrumentClass, currency: input.currency, sharePrice: input.fund?.sharePrice });
      if ("unusable" in layers) throw new Unusable(layers.unusable, layers.detail);
      p = { ...p, entered: layers, layered: undefined };
    }
    built = buildTariff(input, p, forBuild);
  } catch (e) {
    if (e instanceof Unusable) return notComparable({ code: e.code, detail: e.message });
    // E5: one provider's unreadable record is that provider's row, not a failure of the whole run.
    if (e instanceof RecordInputError) return notComparable({ code: "record-error", detail: e.message });
    throw e;
  }
  const charged = built.linesUsed.length > 0 || p.level === "entered";
  if (!charged) return notComparable({ code: "no-applicable-line", detail: `no line of the ${s.snapshot} snapshot applies to ${input.instrumentClass}${input.channel ? ` through ${input.channel}` : ""}` });
  if ((p.level === "regulator_average" || p.level === "tase_average") && built.averagesApplied === 0) {
    return notComparable({ code: "no-average", detail: `the snapshot holds no ${p.level} for any line that applies to ${input.instrumentClass}` });
  }

  // F-14: a money-market unit pays custody at a non-bank member's or a foreign broker's tariff, never at a bank's (BRK-17, BANK-18).
  const memberKind = memberKindOf(s.provider.class);
  // F-109: whole units; a house that sells the fund's listing by amount is priced on the way that leaves more
  try {
    return { kind: "ready", base, p, built, memberKind, ways: unitWaysAt(input, s, built.tariff) };
  } catch (e) {
    if (e instanceof Unusable) return notComparable({ code: e.code, detail: e.message });
    throw e;
  }
}

/** F-63's input for one run of the fund: the goal over `months`, at a tariff, a member kind and a way of buying (F-109). */
function planOf(input: WorkbenchInput, runFund: Fund) {
  return (tariff: SecuritiesInput["tariff"], months: number, memberKind?: SecuritiesInput["memberKind"], wholeUnits?: SecuritiesInput["wholeUnits"]): SecuritiesInput => {
    const p: SecuritiesInput = { goal: { ...input.goal, months }, market: input.market, fund: runFund, tariff, profile: input.profile };
    if (input.broker) p.broker = input.broker;
    if (memberKind) p.memberKind = memberKind;
    if (input.behaviour?.ordersPerMonth !== undefined) p.ordersPerMonth = input.behaviour.ordersPerMonth;
    if (wholeUnits) p.wholeUnits = wholeUnits;
    return p;
  };
}

/** F-118: a provider's run of a fund whose exit tax an open rule blocks, read before that tax. Not a compared row: it is never ranked. */
export interface BeforeTaxProvider extends ProviderBase {
  kind: "before-tax";
  /** D7: list and average are sourced; entered is the person's. */
  feeState: "sourced" | "entered";
  tariff: SecuritiesInput["tariff"];
  linesUsed: string[];
  lineSources: TariffBuild["lineSources"];
  noLine: ("trade" | "custody")[];
  notModelled: NotModelled[];
  flags: string[];
  standingAside: string[];
  /** `V_T^pre / I_T`: the real value at the horizon before the exit tax, today's shekels (F-118). */
  beforeTax: number;
  /** `B(∅) − B(F_p)`, F-91's account part, with `B = V_T^pre / I_T` for these runs (no tax inside them), real NIS. */
  horizonCostBeforeTax: number;
  run: BeforeTaxRun;
}

/** F-118's workbench: every provider once, read before the exit tax, with no ranking. */
export interface BeforeTaxWorkbench {
  formula: "F-118";
  /** The open rule the exit tax rests on: every row is listed with it, never ranked (B3, D84). */
  blockedBy: string;
  /** The same run with no provider fees, before the exit tax: the base of every account's cost. */
  beforeTaxWithoutProviderFees: number;
  rows: (BeforeTaxProvider | NotComparableProvider)[];
}

/**
 * F-118 on F-63: each provider's run of a fund whose exit tax an open rule blocks (`beforeTaxPathOf`), read before that tax, with the
 * account's cost from the same runs (F-91's account part). Nothing is ranked and no after-tax figure is computed. Of a house's ways of buying
 * (F-109), the one that leaves more before tax is the row's, as F-63 takes the one that leaves more after tax.
 */
export function providerWorkbenchBeforeTax(input: WorkbenchInput, ctx: RunContext): BeforeTaxWorkbench {
  const runFund = fundForRun(input);
  const blockedBy = beforeTaxPathOf(runFund, ctx);
  if (blockedBy === null) throw new Error("F-118: the fund's exit tax is not blocked by an open rule; its workbench is providerWorkbench's");
  const plan = planOf(input, runFund);
  const bare: SecuritiesInput["tariff"] = input.currency ? { currency: input.currency } : {};
  const horizon = input.goal.months;
  const noneT = runSecuritiesBeforeTax(plan(bare, horizon), ctx);
  const rows: BeforeTaxWorkbench["rows"] = [];
  for (const given of input.providers) {
    const ready = prepareProvider(input, given);
    if (ready.kind === "not-comparable") {
      rows.push(ready);
      continue;
    }
    const { base, p, built, memberKind, ways } = ready;
    let run = runSecuritiesBeforeTax(plan(built.tariff, horizon, memberKind, ways[0]), ctx);
    for (const w of ways.slice(1)) {
      const other = runSecuritiesBeforeTax(plan(built.tariff, horizon, memberKind, w), ctx);
      if (other.beforeTaxReal > run.beforeTaxReal) run = other;
    }
    rows.push({
      ...base,
      kind: "before-tax",
      feeState: p.level === "entered" ? "entered" : "sourced",
      tariff: built.tariff,
      linesUsed: built.linesUsed,
      lineSources: built.lineSources,
      noLine: built.noLine,
      notModelled: built.notModelled,
      flags: built.flags,
      standingAside: built.standingAside,
      beforeTax: run.beforeTaxReal,
      horizonCostBeforeTax: noneT.beforeTaxReal - run.beforeTaxReal,
      run,
    });
  }
  return { formula: "F-118", blockedBy, beforeTaxWithoutProviderFees: noneT.beforeTaxReal, rows };
}

/**
 * F-63 Provider workbench. For each provider `p` with tariff `F_p` at its chosen level (list, regulator or TASE
 * average, entered; D4): `cost_p(horizon) = V_T^real(∅) − V_T^real(F_p)` and `cost_p(year 1) = V_12(∅) − V_12(F_p)`
 * nominal, where `∅` is the same run with no provider fees (the fund's own costs and the spread stay, Q16). The
 * cost is broken into fee types by F-61 (each line removed in turn, and the interaction remainder). A-28 drives
 * the trades a month; the custody count follows the tariff's period. Providers are ranked by cost, ties by F-80
 * on the real values (θ, P-01), and the fee type that decides between the top two is named. A provider whose
 * snapshot is `missing`, or has no line that applies, or has a null value, or has no average at an average level,
 * is "not comparable, data missing" with the snapshot's reason. Minimums and protection pass through.
 */
export function providerWorkbench(input: WorkbenchInput, ctx: RunContext): ProviderWorkbench {
  const runFund = fundForRun(input);
  const plan = planOf(input, runFund);
  const bare: SecuritiesInput["tariff"] = input.currency ? { currency: input.currency } : {};
  const horizon = input.goal.months;
  const noneT = runSecurities(plan(bare, horizon), ctx);
  const none12 = runSecurities(plan(bare, 12), ctx);

  const rows: ProviderRow[] = [];
  for (const given of input.providers) {
    const ready = prepareProvider(input, given);
    if (ready.kind === "not-comparable") {
      rows.push(ready);
      continue;
    }
    const { base, p, built, memberKind, ways } = ready;
    let units = ways[0];
    let run = runSecurities(plan(built.tariff, horizon, memberKind, units), ctx);
    for (const w of ways.slice(1)) {
      const other = runSecurities(plan(built.tariff, horizon, memberKind, w), ctx);
      if (other.real > run.real) [units, run] = [w, other];
    }
    // a run the readings of an open question split (TXG OQ17 at a falling CPI) has no value after tax to compare, with or without the fees
    const stopped = stoppedOnQuestion(noneT) ?? stoppedOnQuestion(run);
    if (stopped) {
      rows.push({ ...base, kind: "not-comparable", reason: { code: "rule-open", ...stopped } });
      continue;
    }
    const planF = { run: "runSecurities", input: plan(built.tariff, horizon, memberKind, units) } as const;
    const run12 = runSecurities(plan(built.tariff, 12, memberKind, units), ctx);
    const total = noneT.real - run.real;
    // F-61's split takes a whole run per fee line, and a page that ranks every fund at every house reads it for few: run when first read.
    const split = once(() => {
      const lines = feeLines(planF).filter((l) => providerLines.includes(l));
      // F-63, F-91 in whole units (F-109): a run without one line places its orders in other months (the cash a fee no longer takes buys a unit
      // sooner, and each order pays its own minimum), so removing a line can leave less and the line would read below zero. A line is instead
      // what was paid on it, each payment carried to the horizon at the fund's total return from the month it was paid, in today's shekels;
      // the same figure before and after tax, the tax and what whole units do left to the remainder, so the whole is unchanged.
      const carried = units ? run.feesCarried : undefined;
      if (carried) {
        const index = run.series.find((pt) => pt.month === run.exitMonth)?.index ?? 1;
        // before tax only: an after-tax line taken from a pre-tax carry would mix the two
        const byType = lines.map((line) => ({ line, cost: null, costBeforeTax: carried[line] / index })).sort((a, b) => b.costBeforeTax - a.costBeforeTax);
        return { byType, interaction: null };
      }
      const byType = lines
        .map((line) => {
          const w = withoutFeeLine(planF, line);
          if (w.run !== "runSecurities") throw new Error("unreachable: a securities plan stays a securities plan");
          const without = runSecurities(w.input, ctx);
          return { line, cost: without.real - run.real, costBeforeTax: beforeTax(without) - beforeTax(run) };
        })
        .sort((a, b) => b.cost - a.cost);
      return { byType, interaction: total - byType.reduce((acc, t) => acc + t.cost, 0) };
    });

    const strength = weakestStrength([...run.rules.map((r) => r.strength), ...(p.level === "entered" ? (["entered"] as const) : built.strengths)]);
    const ruleIds = run.rules.map((r) => r.id);
    const common = { checked: ctx.runDate, strength, ruleIds, notes: `provider ${base.id}, fee level ${p.level}, snapshot ${base.snapshot}` };
    const yearOneNominal = none12.nominal - run12.nominal;
    rows.push({
      ...base,
      kind: "compared",
      feeState: p.level === "entered" ? "entered" : "sourced",
      tariff: built.tariff,
      linesUsed: built.linesUsed,
      lineSources: built.lineSources,
      noLine: built.noLine,
      notModelled: built.notModelled,
      flags: built.flags,
      standingAside: built.standingAside,
      horizonCost: computedValue(
        total,
        "nis",
        "F-63",
        { real_value_without_provider_fees: noneT.real, real_value_with_provider_fees: run.real, horizon_months: horizon, level: p.level, lines: built.linesUsed },
        common,
      ),
      yearOneCost: computedValue(
        yearOneNominal,
        "nis",
        "F-63",
        { nominal_value_without_provider_fees: none12.nominal, nominal_value_with_provider_fees: run12.nominal, month: 12, level: p.level, lines: built.linesUsed },
        common,
      ),
      yearOneFeesPaid: run12.fees.trade + run12.fees.custody + run12.fees.fixed + run12.fees.fx + run12.fees.account,
      get byType() {
        return split().byType;
      },
      get interaction() {
        return split().interaction;
      },
      real: run.real,
      horizonCostBeforeTax: beforeTax(noneT) - beforeTax(run),
      taxReal: taxReal(run),
      run,
      rank: 0,
    });
  }

  // F-80 on the real values: cheapest cost = highest real value (the base is the same run for every provider).
  const compared = rows.filter((r): r is ComparedProvider => r.kind === "compared");
  const sorted = compared.map((r, i) => ({ r, i })).sort((a, b) => b.r.real - a.r.real || a.i - b.i).map((x) => x.r);
  sorted.forEach((r, k) => (r.rank = k + 1));
  const entries = sorted.map((r, k) => {
    const e: ProviderRanking["entries"][number] = { id: r.id, rank: k + 1, real: r.real };
    const next = sorted[k + 1];
    if (next) e.gapToNext = relativeGap(r.real, next.real);
    return e;
  });
  const ranking: ProviderRanking = { theta: input.theta, order: sorted.map((r) => r.id), tieSet: [], entries };
  const top = sorted[0];
  if (top) ranking.tieSet = sorted.filter((r) => r === top || isTie(top.real, r.real, input.theta)).map((r) => r.id);
  const second = sorted[1];
  // read from the rows' split, so it runs only when first read too
  const decide = once(() => {
    if (!top || !second) throw new Error("unreachable: read only with two ranked providers");
    const gaps: Partial<Record<FeeLine, number>> = {};
    let line: FeeLine | null = null;
    let best = 0;
    const gap = relativeGap(top.real, second.real);
    // a whole-units row (F-109) has no after-tax cost per line, so no line decides between it and another
    if (top.byType.some((t) => t.cost === null) || second.byType.some((t) => t.cost === null)) return { top: top.id, second: second.id, gap, tie: gap < input.theta, deciding: { line, gaps } };
    for (const l of providerLines) {
      const a = top.byType.find((t) => t.line === l)?.cost ?? 0;
      const b = second.byType.find((t) => t.line === l)?.cost ?? 0;
      if (a === 0 && b === 0 && !top.byType.some((t) => t.line === l) && !second.byType.some((t) => t.line === l)) continue;
      gaps[l] = b - a;
      if (Math.abs(b - a) > best) {
        best = Math.abs(b - a);
        line = l;
      }
    }
    return { top: top.id, second: second.id, gap, tie: gap < input.theta, deciding: { line, gaps } };
  });
  if (top && second) Object.defineProperty(ranking, "topTwo", { enumerable: true, get: decide });

  const reasonOf = (r: NotComparableProvider): Reason =>
    r.reason.code === "rule-open"
      ? { code: "rule-open", ruleIds: [r.reason.ruleId], gapIds: [], detail: r.reason.question }
      : {
          code: r.reason.code === "data-missing" || r.reason.code === "record-error" ? "missing-record" : "missing-input",
          ruleIds: [],
          gapIds: [],
          detail: r.reason.detail ?? r.reason.code,
        };
  const coverage = coverageLine(
    rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind === "compared" ? ("ranked" as const) : ("not-evaluated" as const), reasons: r.kind === "compared" ? [] : [reasonOf(r)] })),
    ["ranked", "not-evaluated"] as const,
    ["ranked"],
  );
  return { formula: "F-63", realWithoutProviderFees: noneT.real, beforeTaxWithoutProviderFees: beforeTax(noneT), rows, ranking, coverage };
}

/** One month of the cumulative-fees series (F-63, chart note). */
export interface CumulativeFeePoint {
  month: number;
  /** Provider fees paid up to the end of the month: trade commissions, custody, FX and the fixed fee, nominal NIS. */
  nominal: number;
  /** `nominal / I_m` (F-06): shekels of today. */
  real: number;
}

/**
 * The cumulative provider fees per month for the chart (method F-63): `fees paid up to month t`, the
 * provider's own four lines only (not the fund's drag or the spread), in nominal and real shekels. The run's series
 * ends before the sale, so the last point adds the exit commission and FX fee and equals the run's four fee totals.
 * Read from the run the row already holds; nothing is recomputed.
 */
export function cumulativeProviderFees(row: ComparedProvider): CumulativeFeePoint[] {
  const run = row.run;
  const total = run.fees.trade + run.fees.custody + run.fees.fx + run.fees.fixed + run.fees.account;
  return run.series.map((p) => {
    const nominal = p.month === run.exitMonth ? total : (p.providerFees ?? 0);
    return { month: p.month, nominal, real: nominal / p.index };
  });
}
