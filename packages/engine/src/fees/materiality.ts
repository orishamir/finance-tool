// F-61 Fee materiality: what each fee costs over the horizon, found by re-running the same plan with that
// fee line removed, all other assumptions (A-01 to A-29) held fixed. Built on ranking's `withoutFees`.
import type { ValueObject } from "@finance-tool/schema";
import { RecordInputError, runPlanned, type RunPlan } from "../inputs.ts";
import type { Commission, Custody } from "../formulas/fees.ts";
import { withoutFees } from "../compare/ranking.ts";
import { MissingRuleError, ruleBook } from "../resolver.ts";
import type { FeeType, RunContext, RunResult } from "../result.ts";
import { computedValue, weakestStrength } from "./computed.ts";

/** The fee lines of a run, as the result reports them (`FeeType`). */
export type FeeLine = FeeType;

/** Every line, in the order the result lists them. */
export const feeLineOrder: readonly FeeLine[] = ["deposit", "balance", "direct", "trade", "spread", "custody", "fixed", "fund", "fx", "manager"];

const positive = (n: number | undefined) => (n ?? 0) > 0;
const configured = (c: Commission | Custody | undefined) => c !== undefined && (positive(c.rate) || positive(c.min) || ("perCurrencyUnit" in c && positive(c.perCurrencyUnit)));

/** The fee lines this plan charges: those whose input is set and not zero. Deposits (bank) have none. */
export function feeLines(plan: RunPlan): FeeLine[] {
  const has = new Set<FeeLine>();
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      const f = plan.input.fees;
      if (positive(f.deposit)) has.add("deposit");
      if (positive(f.balance)) has.add("balance");
      if (positive(f.direct)) has.add("direct");
      break;
    }
    case "runSecurities": {
      const { tariff, fund, wrapper } = plan.input;
      if (configured(tariff.buy) || configured(tariff.sell)) has.add("trade");
      if (configured(tariff.custody)) has.add("custody");
      if (typeof tariff.fx === "number" ? positive(tariff.fx) : configured(tariff.fx)) has.add("fx");
      if (positive(tariff.monthlyFee)) has.add("fixed");
      if (positive(fund.halfSpread)) has.add("spread");
      const d = fund.drag;
      if (positive(d?.management) || positive(d?.variable) || positive(d?.trustee)) has.add("fund");
      if (positive(wrapper?.managerFee)) has.add("manager");
      break;
    }
    case "runMakam":
    case "runBond": {
      const t = plan.input.tariff as { buy?: Commission; sell?: Commission; custody?: Custody };
      if (configured(t.buy) || configured(t.sell)) has.add("trade");
      if (configured(t.custody)) has.add("custody");
      break;
    }
    case "runDeposit":
      break;
  }
  return feeLineOrder.filter((l) => has.has(l));
}

function noLine(plan: RunPlan, line: FeeLine): never {
  throw new RecordInputError(`${plan.run} has no "${line}" fee line to change (F-61)`);
}

/** The same plan with one fee line zeroed (V(F \ {f})). Everything else, including non-fee drag and tax, stays. */
export function withoutFeeLine(plan: RunPlan, line: FeeLine): RunPlan {
  return changeLine(plan, line, 0);
}

/**
 * The same plan with one fee line at a new rate (V(F[f → f'])). `newRate` is a fraction a year for a balance,
 * direct, fund or manager fee; a fraction of each deposit, trade or conversion for a deposit, trade or fx fee;
 * a fraction of the half-spread for spread; a fraction a period for custody; NIS a month for fixed. A trade
 * line keeps its minimum and maximum. A fund line becomes one rate (the manager fee), with its variable and
 * trustee parts removed. A balance fee replaced this way is no longer discounted (A-19).
 */
export function withFeeRate(plan: RunPlan, line: FeeLine, newRate: number): RunPlan {
  if (!Number.isFinite(newRate) || newRate < 0) throw new RangeError(`newRate ${newRate} must be a number of zero or more`);
  return changeLine(plan, line, newRate);
}

function changeLine(plan: RunPlan, line: FeeLine, rate: number): RunPlan {
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      if (line !== "deposit" && line !== "balance" && line !== "direct") return noLine(plan, line);
      const fees = { ...plan.input.fees, [line]: rate };
      if (line === "balance") delete fees.discount;
      return plan.run === "runProvident"
        ? { run: "runProvident", input: { ...plan.input, fees } }
        : { run: "runPension", input: { ...plan.input, fees } };
    }
    case "runSecurities": {
      const input = plan.input;
      const tariff = { ...input.tariff };
      const set = (key: "buy" | "sell") => {
        const old = tariff[key];
        if (rate === 0) delete tariff[key];
        else {
          // a person's own rate replaces the line, its flat price too (F-12)
          const { flatUpTo: _, ...rest } = old ?? ({} as NonNullable<typeof old>);
          tariff[key] = { ...rest, rate };
        }
      };
      switch (line) {
        case "trade":
          if (!input.tariff.buy && !input.tariff.sell) return noLine(plan, line);
          if (input.tariff.buy) set("buy");
          if (input.tariff.sell) set("sell");
          // F-12: a standing-order price moves with the trade rate, in proportion, so it stays the same share of the regular price
          if (input.tariff.buyStanding) {
            if (rate === 0 || !input.tariff.buy?.rate) delete tariff.buyStanding;
            else tariff.buyStanding = { ...input.tariff.buyStanding, rate: (input.tariff.buyStanding.rate * rate) / input.tariff.buy.rate };
          }
          return { run: "runSecurities", input: { ...input, tariff } };
        case "custody":
          if (!tariff.custody) return noLine(plan, line);
          if (rate === 0) delete tariff.custody;
          else tariff.custody = { ...tariff.custody, rate };
          return { run: "runSecurities", input: { ...input, tariff } };
        case "fx":
          if (tariff.fx === undefined) return noLine(plan, line);
          if (rate === 0) delete tariff.fx;
          else if (typeof tariff.fx === "number") tariff.fx = rate;
          else {
            // a person's own rate replaces the line, a price per unit of currency too (F-13)
            const { perCurrencyUnit: _, ...rest } = tariff.fx;
            tariff.fx = { ...rest, rate };
          }
          // F-13: a recurring plan's conversion moves with the regular rate, in proportion, as a standing-order price does; a plan that charges nothing stays at nothing
          if (input.tariff.fxStanding !== undefined) {
            const old = typeof input.tariff.fx === "number" ? input.tariff.fx : input.tariff.fx!.rate;
            if (rate === 0 || !old) delete tariff.fxStanding;
            else if (typeof input.tariff.fxStanding === "number") tariff.fxStanding = (input.tariff.fxStanding * rate) / old;
            else tariff.fxStanding = { ...input.tariff.fxStanding, rate: (input.tariff.fxStanding.rate * rate) / old };
          }
          return { run: "runSecurities", input: { ...input, tariff } };
        case "fixed":
          if (tariff.monthlyFee === undefined) return noLine(plan, line);
          if (rate === 0) delete tariff.monthlyFee;
          else tariff.monthlyFee = rate;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "spread": {
          if (input.fund.halfSpread === undefined) return noLine(plan, line);
          const fund = { ...input.fund };
          if (rate === 0) delete fund.halfSpread;
          else fund.halfSpread = rate;
          return { run: "runSecurities", input: { ...input, fund } };
        }
        case "fund": {
          const d = input.fund.drag;
          if (!d || (d.management === undefined && d.variable === undefined && d.trustee === undefined)) return noLine(plan, line);
          const drag = { ...d };
          delete drag.management;
          delete drag.variable;
          delete drag.trustee;
          if (rate > 0) drag.management = rate;
          return { run: "runSecurities", input: { ...input, fund: { ...input.fund, drag } } };
        }
        case "manager":
          if (!input.wrapper) return noLine(plan, line);
          return { run: "runSecurities", input: { ...input, wrapper: { ...input.wrapper, managerFee: rate } } };
        default:
          return noLine(plan, line);
      }
    }
    case "runMakam":
    case "runBond": {
      if (line !== "trade" && line !== "custody") return noLine(plan, line);
      const tariff = { ...(plan.input.tariff as { buy?: Commission; sell?: Commission; custody?: Custody }) };
      if (line === "trade") {
        if (!tariff.buy && !tariff.sell) return noLine(plan, line);
        for (const key of ["buy", "sell"] as const) {
          if (!tariff[key]) continue;
          if (rate === 0) delete tariff[key];
          else tariff[key] = { ...tariff[key]!, rate };
        }
      } else {
        if (!tariff.custody) return noLine(plan, line);
        if (rate === 0) delete tariff.custody;
        else tariff.custody = { ...tariff.custody, rate };
      }
      return plan.run === "runMakam"
        ? { run: "runMakam", input: { ...plan.input, tariff } }
        : { run: "runBond", input: { ...plan.input, tariff } };
    }
    case "runDeposit":
      return noLine(plan, line);
  }
}

/**
 * Where a fee line's regulated maximum sits in the rule base: the figure's rule, and every rule the method names for
 * the wrapper's cap (F-61, "caps are shown beside the fee"): study fund KH-22 with PF-06; kupat gemel lehashkaa PF-03
 * and PF-02; pensions PEN-21 with PF-04 or PF-05; provident for annuity PEN-22.
 */
const capFigure: Partial<Record<string, { rule: string; also: readonly string[]; balance: string; deposit?: string }>> = {
  "kupat-gemel-lehashkaa": { rule: "PF-02", also: ["PF-03"], balance: "balance_cap", deposit: "deposit_cap" },
  "keren-hishtalmut": { rule: "PF-06", also: ["KH-22"], balance: "balance_cap" },
  "pension-comprehensive": { rule: "PF-04", also: ["PEN-21"], balance: "balance_cap", deposit: "deposit_cap" },
  "pension-general": { rule: "PF-05", also: ["PEN-21"], balance: "balance_cap", deposit: "deposit_cap" },
  "provident-for-annuity": { rule: "PEN-22", also: [], balance: "balance_cap", deposit: "deposit_cap" },
};

export interface FeeCap {
  /** The rule whose figure the cap is read from. */
  ruleId: string;
  figure: string;
  /** The cap as a fraction. */
  rate: number;
  /** Every rule the method names for this cap, the figure's own among them (additive, 2026-10-24). */
  ruleIds?: string[];
}

/**
 * The regulated maximum of a deposit or balance fee, from the rule base; absent when the plan has none or the rule bundle lacks it.
 * Also PF-06's 2% a year on the manager's fee of an IRA hishtalmut (the `manager` line of a securities run).
 */
export function feeCap(plan: RunPlan, line: FeeLine, ctx: RunContext): FeeCap | undefined {
  let where: { rule: string; also: readonly string[]; balance: string; deposit?: string } | undefined;
  let figure: string | undefined;
  if (plan.run === "runProvident" || plan.run === "runPension") {
    where = capFigure[plan.input.wrapper];
    figure = line === "balance" ? where?.balance : line === "deposit" ? where?.deposit : undefined;
  } else if (plan.run === "runSecurities" && plan.input.wrapper && line === "manager") {
    where = { rule: "PF-06", also: [], balance: "balance_cap" };
    figure = where.balance;
  }
  if (!where || !figure) return undefined;
  try {
    const book = ruleBook(ctx);
    const ruleIds = [...new Set([...where.also, where.rule])];
    for (const id of ruleIds) book.cite(id);
    return { ruleId: where.rule, figure, rate: book.rate(where.rule, figure), ruleIds };
  } catch (e) {
    if (e instanceof MissingRuleError) return undefined;
    throw e;
  }
}

export interface FeeLineCost {
  line: FeeLine;
  /** Nominal NIS the run paid on this line over the horizon (the ledger's own tally). */
  paidNominal: number;
  /** `V_T^real(F \ {f}) − V_T^real(F)`, real NIS. */
  cost: ValueObject;
  cap?: FeeCap;
}

export interface FeeMateriality {
  formula: "F-61";
  /** The run with every fee, and what it read. */
  run: RunResult;
  realWithFees: number;
  realWithoutFees: number;
  /** `V_T^real(∅) − V_T^real(F)`. */
  total: ValueObject;
  /** One entry per fee line the plan charges, largest cost first. */
  lines: FeeLineCost[];
  /** `total − Σ cost_f`: what the fees cost together beyond their separate costs. */
  interaction: ValueObject;
}

const NIS = "nis" as const;

function sourcesOf(run: RunResult) {
  return { strength: weakestStrength(run.rules.map((r) => r.strength)), ruleIds: run.rules.map((r) => r.id) };
}

/**
 * F-61 Fee materiality. For a plan of any family: the total drag `V(∅) − V(F)`, the cost of each fee line `f`
 * as `V(F \ {f}) − V(F)` by re-running the plan with that line zeroed, and the interaction remainder
 * `total − Σ cost_f` as a line of its own. Real NIS at the horizon; all runs hold A-01 to A-29 fixed. Each
 * figure is a computed value object naming the formula and its inputs. A bank deposit has no fee line: its
 * total is zero.
 */
export function feeMateriality(plan: RunPlan, ctx: RunContext): FeeMateriality {
  const run = runPlanned(plan, ctx);
  const none = runPlanned(withoutFees(plan), ctx);
  const src = sourcesOf(run);
  const checked = ctx.runDate;
  const total = none.real - run.real;
  const lines: FeeLineCost[] = feeLines(plan).map((line) => {
    const without = runPlanned(withoutFeeLine(plan, line), ctx);
    const cost = without.real - run.real;
    const entry: FeeLineCost = {
      line,
      paidNominal: run.fees[line],
      cost: computedValue(cost, NIS, "F-61", { real_value_without_fee: without.real, real_value_with_fees: run.real, fee_line: line }, { checked, ...src, notes: `real NIS over ${run.exitMonth} months, fee line "${line}" removed` }),
    };
    const cap = feeCap(plan, line, ctx);
    if (cap) entry.cap = cap;
    return entry;
  });
  lines.sort((a, b) => (b.cost.value as number) - (a.cost.value as number));
  const sum = lines.reduce((s, l) => s + (l.cost.value as number), 0);
  return {
    formula: "F-61",
    run,
    realWithFees: run.real,
    realWithoutFees: none.real,
    total: computedValue(total, NIS, "F-61", { real_value_without_fees: none.real, real_value_with_fees: run.real }, { checked, ...src, notes: `total fee drag, real NIS over ${run.exitMonth} months` }),
    lines,
    interaction: computedValue(total - sum, NIS, "F-61", { total_drag: total, sum_of_line_costs: sum }, { checked, ...src, notes: "interaction remainder: total drag less the sum of the separate costs" }),
  };
}

export interface ReductionValue {
  formula: "F-61";
  line: FeeLine;
  newRate: number;
  /** `V_T^real(F[f → f']) − V_T^real(F)`, real NIS: positive when the stated rate is better. */
  value: ValueObject;
}

/** F-61 Value of a stated reduction `f → f'`: the run with the fee line at the new rate, less the run as it is, real NIS at the horizon. */
export function valueOfReduction(plan: RunPlan, line: FeeLine, newRate: number, ctx: RunContext): ReductionValue {
  const run = runPlanned(plan, ctx);
  const changed = runPlanned(withFeeRate(plan, line, newRate), ctx);
  return {
    formula: "F-61",
    line,
    newRate,
    value: computedValue(
      changed.real - run.real,
      NIS,
      "F-61",
      { real_value_at_new_rate: changed.real, real_value_with_fees: run.real, fee_line: line, new_rate: newRate },
      { checked: ctx.runDate, ...sourcesOf(run), notes: `real NIS over ${run.exitMonth} months, "${line}" at the stated rate` },
    ),
  };
}

export interface FeeSeriesPoint {
  month: number;
  /** `V_t^real(∅) − V_t^real(F)` at the end of month `t`. */
  total: number;
  /** `V_t^real(F \ {f}) − V_t^real(F)` per fee line. */
  cost: Partial<Record<FeeLine, number>>;
}

export interface FeeMaterialitySeries {
  formula: "F-61";
  /** The fee lines the plan charges, in the order of `feeLineOrder`. */
  lines: FeeLine[];
  exitMonth: number;
  points: FeeSeriesPoint[];
  /**
   * What the exit takes out of the last point (B6, 2026-10-24): the last point is before exit costs and exit tax, F-61's
   * figure is after them, and the two runs pay different tax (the run without fees has the larger gain). For the total and
   * for each line, `last point − exitEffect = F-61's figure`, to the rounding of floating point.
   */
  exitEffect: { total: number; cost: Partial<Record<FeeLine, number>> };
}

/**
 * F-61 at every month (method note, 2026-10-24): the same re-runs as `feeMateriality`, read month by month from
 * each run's series. `V_t^real` is the balance at the end of month `t` divided by the CPI index `I_t`, before exit
 * costs and exit tax; so the last point equals F-61's figure at the horizon only when a run has neither. The gap is
 * the exit effect: the run without the fee line pays more exit tax on its larger gain (a kupat gemel lehashkaa takes a
 * quarter of the real gain, so the last point is about a third above the headline there). `exitEffect` returns it, so
 * `last − exitEffect` is F-61's figure. Pure numbers: the page wraps them as computed values.
 */
export function feeMaterialitySeries(plan: RunPlan, ctx: RunContext): FeeMaterialitySeries {
  const run = runPlanned(plan, ctx);
  const none = runPlanned(withoutFees(plan), ctx);
  const lines = feeLines(plan);
  const without = lines.map((line) => ({ line, run: runPlanned(withoutFeeLine(plan, line), ctx) }));
  const real = (r: RunResult, t: number) => {
    const p = r.series[t];
    return p ? p.balance / p.index : 0;
  };
  const points: FeeSeriesPoint[] = run.series.map((p, t) => {
    const base = real(run, t);
    const cost: Partial<Record<FeeLine, number>> = {};
    for (const w of without) cost[w.line] = real(w.run, t) - base;
    return { month: p.month, total: real(none, t) - base, cost };
  });
  // The exit effect at T: the distance between a run's last series point and its after-exit value, for the run without fees
  // (or without one line) less the same for the run as it is.
  const exitGap = (r: RunResult) => real(r, r.exitMonth) - r.real;
  const exitEffect = { total: exitGap(none) - exitGap(run), cost: {} as Partial<Record<FeeLine, number>> };
  for (const w of without) exitEffect.cost[w.line] = exitGap(w.run) - exitGap(run);
  return { formula: "F-61", lines, exitMonth: run.exitMonth, points, exitEffect };
}
