// F-63 Provider workbench: one fund held, the same goal and behaviour, each provider's tariff at the chosen fee
// level (D4). Built on F-08 (`runSecurities`), F-61's building blocks (`withoutFeeLine`, `feeLines`) and F-80's
// tie test. No I/O: the fee snapshots (`data/fees/`) arrive as data.
import { feesSnapshot, type FeesSnapshot, type ValueObject } from "@finance-tool/schema";
import { coverageLine } from "../compare/coverage.ts";
import { isTie, relativeGap } from "../compare/ranking.ts";
import type { CoverageLine, Reason } from "../compare/types.ts";
import { computedValue, weakestStrength } from "../fees/computed.ts";
import { feeLines, withoutFeeLine, type FeeLine } from "../fees/materiality.ts";
import type { Commission, Custody } from "../formulas/fees.ts";
import type { Goal } from "../formulas/time.ts";
import type { Profile } from "../ledgers/common.ts";
import { runSecurities, type Fund, type SecuritiesInput } from "../ledgers/securities.ts";
import { RecordInputError } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";

/** D4: the three fee levels. The two averages are the two sources the snapshots hold (regulator, TASE's per-member). */
export type FeeLevel = "list" | "regulator_average" | "tase_average" | "entered";

/** The tariff lines of a securities run the person may type in (state "entered"); a line left out stays at the list price. */
export interface EnteredTariff {
  buy?: Commission;
  sell?: Commission;
  custody?: Custody;
  /** A bare number is the percentage with no bounds; the `Commission` shape adds min and max in the instrument's currency (`in: "instrument"`). */
  fx?: number | Commission;
  monthlyFee?: number;
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
   * F-63 (2026-10-24): the plan the person is on, as the snapshot's `band` text names it (for example "מסלול ONE"); a plan line is read only when asked for here.
   * 2026-10-25: several texts may be given, one per base the snapshot splits by band (a trade band and an FX band); a line is asked for when its band contains any of them.
   */
  band?: string | readonly string[];
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
   * F-63 (2026-10-25, index page): shekels per one unit of a currency, by ISO code ("USD", "GBP"), for the tariff lines set in
   * dollars or pounds (per share, minimum, maximum). The site fills it from the ECB series with `crossRate` (F-84). A provider
   * whose line needs a currency this does not hold is "not comparable" (`needs-fx-rate`).
   */
  fx?: Record<string, number>;
  /** P-01 as a fraction (`tieThreshold`). */
  theta: number;
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
}

export type NotComparableReason =
  | { code: "data-missing"; detail: string | null }
  | { code: "no-applicable-line"; detail: string }
  | { code: "no-average"; detail: string }
  | { code: "line-without-value"; detail: string }
  /** 2026-10-25: a per-share line and the fund record has no `share_price`. */
  | { code: "needs-share-price"; detail: string }
  /** 2026-10-25: a line in dollars or pounds and `fx` holds no rate for the currency. */
  | { code: "needs-fx-rate"; detail: string }
  /** 2026-10-25: the snapshot is ambiguous or a unit is not one the tariff reads; `detail` is the engine's message. */
  | { code: "record-error"; detail: string };

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
  /** Level and source of the rate each line used (additive, 2026-10-24). */
  lineSources: TariffBuild["lineSources"];
  noLine: ("trade" | "custody")[];
  notModelled: NotModelled[];
  flags: string[];
  /** `V_T^real(∅) − V_T^real(F_p)`: real NIS over the horizon. */
  horizonCost: ValueObject;
  /** `V_12(∅) − V_12(F_p)`: nominal NIS, liquidation value at month 12. */
  yearOneCost: ValueObject;
  /** Nominal fees paid in a 12-month run, exit commission included (trade, custody, fx, fixed). */
  yearOneFeesPaid: number;
  /** F-61 by fee type: `V(F \ {f}) − V(F)`, real NIS, for each provider line the tariff charges, largest first. */
  byType: { line: FeeLine; cost: number }[];
  /** `total − Σ cost_f`. */
  interaction: number;
  /** Real value at the horizon with this provider's fees. */
  real: number;
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
  rows: ProviderRow[];
  ranking: ProviderRanking;
  /** F-83: every provider once, "ranked" or "not-evaluated". */
  coverage: CoverageLine<"ranked" | "not-evaluated">;
}

/** A value the snapshot holds as null: the provider's data is incomplete, so its row is "not comparable". */
class Unusable extends Error {
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

/** Shekels per unit of a currency from the run's `fx` input; a provider that needs a rate the run lacks is "not comparable" (2026-10-25). */
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
export function buildTariff(input: WorkbenchInput, p: ProviderInput, snapshot: FeesSnapshot): TariffBuild {
  const wrapper = input.wrapper ?? "brokerage-account";
  // A bond (`tase_bonds`) is also a `tase_shares_bonds` security; a line that names the class itself is the more specific and wins below.
  const classes = input.instrumentClass === "tase_bonds" ? ["tase_bonds", "tase_shares_bonds"] : [input.instrumentClass];
  const applicable = (l: SnapLine) =>
    l.applies_to.some((a) => a === "all" || classes.includes(a) || a === wrapper) && !(l.excludes ?? []).some((x) => classes.includes(x));
  const out: TariffBuild = { tariff: {}, linesUsed: [], lineSources: [], noLine: [], notModelled: [], averagesApplied: 0, strengths: [], flags: [] };
  /** A line the tariff reads: its id, and the strength and source of the rate actually used (an average row's, not the list line's). */
  const used = (l: SnapLine, rate: ValueObject, ...vos: (ValueObject | null | undefined)[]) => {
    out.linesUsed.push(l.id);
    out.lineSources.push({ lineId: l.id, level: rate === l.rate ? l.level : (averageLevel ?? l.level), url: rate.source.url, publisher: rate.source.publisher, strength: rate.source.strength });
    for (const vo of [rate, ...vos]) if (vo) out.strengths.push(vo.source.strength);
  };

  const level = p.level;
  const averageLevel = level === "regulator_average" || level === "tase_average" ? level : undefined;
  if (level === "entered" && !p.entered) throw new RecordInputError(`provider ${snapshot.id}: level "entered" needs the person's entered tariff`);

  /** The line of a base at a level for the channel: none, one, or an error when two apply (the snapshot is ambiguous). */
  const pick = (base: SnapLine["base"], at: SnapLine["level"]): SnapLine | undefined => {
    const all = snapshot.lines.filter((l) => l.base === base && l.level === at && applicable(l));
    const channels = new Set(all.map((l) => l.channel).filter((c): c is string => c !== null));
    if (input.channel === undefined && channels.size > 0)
      throw new RecordInputError(`provider ${snapshot.id}: ${base} lines exist for channels ${[...channels].join(", ")}; the input must name the channel`);
    let found = all.filter((l) => l.channel === null || l.channel === input.channel);
    const exact = found.filter((l) => l.applies_to.includes(input.instrumentClass));
    if (exact.length > 0 && exact.length < found.length && classes.length > 1) found = exact;
    const ambiguous = (ls: SnapLine[]) =>
      new RecordInputError(`provider ${snapshot.id}: ${ls.length} ${base} lines apply (${ls.map((l) => l.id).join(", ")}); the snapshot is ambiguous`);
    // F-63 (2026-10-24): a plan line (a `band` the person names in `p.band`) wins when asked for; otherwise the standard line (`band: null`)
    // wins over every banded line. A fixed fee that only a plan has is the plan's price, not the standard tariff's.
    if (p.band !== undefined) {
      const wanted = typeof p.band === "string" ? [p.band] : p.band;
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
  };

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
  } else {
    const r = resolve("trade");
    if (r) {
      // E1 (2026-10-25): a dollar rate per share is charged on the share count, which needs the fund's price.
      const c: Commission = { rate: 0 };
      if (r.rate.unit === "usd_per_share") {
        if (typeof r.rate.value !== "number") throw new Unusable("line-without-value", `${r.line.id} rate has no value`);
        if (!input.fund.sharePrice) throw new Unusable("needs-share-price", `${r.line.id} is a fee per share and the fund record has no share_price`);
        c.perShare = r.rate.value * rateOf(input.fx, "USD", `${r.line.id} rate`);
      } else c.rate = pct(r.rate, "pct_of_trade", `${r.line.id} rate`);
      // E2: minimums and maximums in dollars or pounds are converted at the run's rate.
      const bound = (vo: ValueObject, what: string): number => {
        if (NIS_UNITS.has(vo.unit)) return nis(vo, what);
        const code = USD_UNITS.has(vo.unit) ? "USD" : vo.unit === "gbp_per_trade" ? "GBP" : null;
        if (!code) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected shekels, dollars or pounds`);
        if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
        return vo.value * rateOf(input.fx, code, what);
      };
      if (hasBound(r.min)) c.min = bound(r.min, `${r.line.id} min`);
      if (hasBound(r.max)) c.max = bound(r.max, `${r.line.id} max`);
      // E3: the cap is a share of the trade value and wins over the minimum.
      if (hasBound(r.cap)) c.cap = pct(r.cap, "pct_of_trade", `${r.line.id} cap`);
      out.tariff.buy = c;
      out.tariff.sell = { ...c };
      used(r.line, r.rate, r.min, r.max, r.cap);
    } else out.noLine.push("trade");
  }

  // Custody: a rate of the balance per period, with min and max.
  if (entered?.custody) out.tariff.custody = entered.custody;
  else {
    const r = resolve("custody");
    if (r) {
      // A zero rate prints no period (One Zero's "0 אחוז"): it charges nothing whatever the period is.
      const period = r.line.period ?? (r.rate.value === 0 ? "month" : null);
      if (period === null) throw new Unusable("line-without-value", `${r.line.id} has no period`);
      const c: Custody = { rate: pct(r.rate, "pct_of_balance_per_period", `${r.line.id} rate`), everyMonths: periodMonths[period] };
      if (hasBound(r.min)) c.min = nis(r.min, `${r.line.id} min`);
      if (hasBound(r.max)) c.max = nis(r.max, `${r.line.id} max`);
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

  // FX: only a fund quoted in a foreign currency is converted (F-13).
  if (input.currency) {
    out.tariff.currency = input.currency;
    if (entered?.fx !== undefined) out.tariff.fx = entered.fx;
    else {
      const r = resolve("fx");
      if (r) {
        const c: Commission = { rate: pct(r.rate, "pct_of_trade", `${r.line.id} rate`) };
        if (hasBound(r.min) || hasBound(r.max)) {
          // The FX bounds are in USD where the bank sets them so: they stay in the trade currency (F-13, 2026-10-24).
          const bounds = [r.min, r.max].filter(hasBound);
          const units = new Set(bounds.map((b) => b.unit));
          if (units.size > 1) throw new RecordInputError(`${r.line.id}: min and max are in different units (${[...units].join(", ")})`);
          const unit = bounds[0]!.unit;
          if (USD_UNITS.has(unit)) {
            if (input.currency!.code !== "USD") throw new RecordInputError(`${r.line.id}: bounds are in USD but the instrument currency is ${input.currency!.code}`);
            c.in = "instrument";
          }
          const bound = (vo: ValueObject, what: string) => {
            if (typeof vo.value !== "number") throw new Unusable("line-without-value", `${what} has no value`);
            if (!USD_UNITS.has(vo.unit) && !NIS_UNITS.has(vo.unit)) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected shekels or dollars`);
            return vo.value;
          };
          if (hasBound(r.min)) c.min = bound(r.min, `${r.line.id} min`);
          if (hasBound(r.max)) c.max = bound(r.max, `${r.line.id} max`);
        }
        out.tariff.fx = hasBound(r.min) || hasBound(r.max) ? c : c.rate;
        used(r.line, r.rate, r.min, r.max);
      }
    }
  }

  // Lines that apply to the fund but that no formula here charges (F-18 is pending; the rest are not part of a holding's running cost).
  const modelled = new Set<SnapLine["base"]>(["trade", "custody", "fixed_period", "fx"]);
  for (const l of snapshot.lines.filter(applicable)) {
    if (l.base === "distribution_handling") {
      if (input.fund.distribution) {
        out.notModelled.push({ lineId: l.id, base: l.base, reason: "F-18 is not computed yet" });
        if (!out.flags.includes("F-18")) out.flags.push("F-18");
      }
    } else if (!modelled.has(l.base) && l.base !== "balance" && l.base !== "deposit") {
      out.notModelled.push({ lineId: l.id, base: l.base, reason: "no formula charges this line in a holding's running cost" });
    }
  }
  return out;
}

const providerLines: readonly FeeLine[] = ["trade", "custody", "fx", "fixed"];

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
  const plan = (tariff: SecuritiesInput["tariff"], months: number): SecuritiesInput => {
    const p: SecuritiesInput = { goal: { ...input.goal, months }, market: input.market, fund: input.fund, tariff, profile: input.profile };
    if (input.broker) p.broker = input.broker;
    if (input.behaviour?.ordersPerMonth !== undefined) p.ordersPerMonth = input.behaviour.ordersPerMonth;
    return p;
  };
  const bare: SecuritiesInput["tariff"] = input.currency ? { currency: input.currency } : {};
  const horizon = input.goal.months;
  const noneT = runSecurities(plan(bare, horizon), ctx);
  const none12 = runSecurities(plan(bare, 12), ctx);

  const rows: ProviderRow[] = [];
  for (const p of input.providers) {
    const parsed = feesSnapshot.safeParse(p.snapshot);
    if (!parsed.success) {
      throw new RecordInputError(`fee snapshot: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
    }
    const s = parsed.data;
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
    const notComparable = (reason: NotComparableReason) => rows.push({ ...base, kind: "not-comparable", reason });

    // A snapshot marked missing has no tariff to read. An entered tariff is the person's own and needs none.
    if (s.missing && p.level !== "entered") {
      notComparable({ code: "data-missing", detail: s.missing_reason });
      continue;
    }
    let built: TariffBuild;
    try {
      built = buildTariff(input, p, s.missing ? { ...s, lines: [], averages: [] } : s);
    } catch (e) {
      if (e instanceof Unusable) {
        notComparable({ code: e.code, detail: e.message });
        continue;
      }
      // E5 (2026-10-25): one provider's unreadable record is that provider's row, not a failure of the whole run.
      if (e instanceof RecordInputError) {
        notComparable({ code: "record-error", detail: e.message });
        continue;
      }
      throw e;
    }
    const charged = built.linesUsed.length > 0 || p.level === "entered";
    if (!charged) {
      notComparable({ code: "no-applicable-line", detail: `no line of the ${s.snapshot} snapshot applies to ${input.instrumentClass}${input.channel ? ` through ${input.channel}` : ""}` });
      continue;
    }
    if ((p.level === "regulator_average" || p.level === "tase_average") && built.averagesApplied === 0) {
      notComparable({ code: "no-average", detail: `the snapshot holds no ${p.level} for any line that applies to ${input.instrumentClass}` });
      continue;
    }

    const planF = { run: "runSecurities", input: plan(built.tariff, horizon) } as const;
    const run = runSecurities(planF.input, ctx);
    const run12 = runSecurities(plan(built.tariff, 12), ctx);
    const total = noneT.real - run.real;
    const byType = feeLines(planF)
      .filter((l) => providerLines.includes(l))
      .map((line) => {
        const w = withoutFeeLine(planF, line);
        if (w.run !== "runSecurities") throw new Error("unreachable: a securities plan stays a securities plan");
        return { line, cost: runSecurities(w.input, ctx).real - run.real };
      })
      .sort((a, b) => b.cost - a.cost);
    const sum = byType.reduce((acc, t) => acc + t.cost, 0);

    const strength = weakestStrength([...run.rules.map((r) => r.strength), ...(p.level === "entered" ? (["entered"] as const) : built.strengths)]);
    const ruleIds = run.rules.map((r) => r.id);
    const common = { checked: ctx.runDate, strength, ruleIds, notes: `provider ${s.id}, fee level ${p.level}, snapshot ${s.snapshot}` };
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
      yearOneFeesPaid: run12.fees.trade + run12.fees.custody + run12.fees.fixed + run12.fees.fx,
      byType,
      interaction: total - sum,
      real: run.real,
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
  if (top && second) {
    const gaps: Partial<Record<FeeLine, number>> = {};
    let line: FeeLine | null = null;
    let best = 0;
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
    const gap = relativeGap(top.real, second.real);
    ranking.topTwo = { top: top.id, second: second.id, gap, tie: gap < input.theta, deciding: { line, gaps } };
  }

  const reasonOf = (r: NotComparableProvider): Reason => ({
    code: r.reason.code === "data-missing" || r.reason.code === "record-error" ? "missing-record" : "missing-input",
    ruleIds: [],
    gapIds: [],
    detail: r.reason.detail ?? r.reason.code,
  });
  const coverage = coverageLine(
    rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind === "compared" ? ("ranked" as const) : ("not-evaluated" as const), reasons: r.kind === "compared" ? [] : [reasonOf(r)] })),
    ["ranked", "not-evaluated"] as const,
    ["ranked"],
  );
  return { formula: "F-63", realWithoutProviderFees: noneT.real, rows, ranking, coverage };
}

/** One month of the cumulative-fees series (F-63, chart note 2026-10-24). */
export interface CumulativeFeePoint {
  month: number;
  /** Provider fees paid up to the end of the month: trade commissions, custody, FX and the fixed fee, nominal NIS. */
  nominal: number;
  /** `nominal / I_m` (F-06): shekels of today. */
  real: number;
}

/**
 * The cumulative provider fees per month for the chart (method F-63, 2026-10-24): `fees paid up to month t`, the
 * provider's own four lines only (not the fund's drag or the spread), in nominal and real shekels. The run's series
 * ends before the sale, so the last point adds the exit commission and FX fee and equals the run's four fee totals.
 * Read from the run the row already holds; nothing is recomputed.
 */
export function cumulativeProviderFees(row: ComparedProvider): CumulativeFeePoint[] {
  const run = row.run;
  const total = run.fees.trade + run.fees.custody + run.fees.fx + run.fees.fixed;
  return run.series.map((p) => {
    const nominal = p.month === run.exitMonth ? total : (p.providerFees ?? 0);
    return { month: p.month, nominal, real: nominal / p.index };
  });
}
