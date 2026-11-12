// F-61 Fee materiality: what each fee costs over the horizon, found by re-running the same plan with that
// fee line removed, all other assumptions (A-01 to A-29) held fixed. Built on ranking's `withoutFees`.
import type { ValueObject } from "@finance-tool/schema";
import { RecordInputError, runPlanned, type RunPlan } from "../inputs.ts";
import { discountEnd, feeCharged, revertRate, withFee, withHeldRate, type Commission, type Custody, type Discount } from "../formulas/fees.ts";
import { withoutFees } from "../compare/ranking.ts";
import { MissingRuleError, ruleBook } from "../resolver.ts";
import type { FeeType, RunContext, RunResult } from "../result.ts";
import { computedValue, weakestStrength } from "./computed.ts";

/** The fee lines of a run, as the result reports them (`FeeType`). */
export type FeeLine = FeeType;

/** Every line, in the order the result lists them. */
export const feeLineOrder: readonly FeeLine[] = ["deposit", "balance", "direct", "trade", "spread", "custody", "fixed", "account", "fund", "fx", "manager"];

const positive = (n: number | undefined) => (n ?? 0) > 0;
const configured = (c: Commission | Custody | undefined) => c !== undefined && (positive(c.rate) || positive(c.min) || ("perCurrencyUnit" in c && positive(c.perCurrencyUnit)) || ("flatUpTo" in c && positive(c.flatUpTo?.amount)));

/** The fee lines this plan charges: those whose input is set and not zero. Deposits (bank) have none. */
export function feeLines(plan: RunPlan): FeeLine[] {
  const has = new Set<FeeLine>();
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      const f = plan.input.fees;
      // A-19: a line at 0% whose discount reverts to a positive rate is charged after the discount
      if (feeCharged(f, "deposit")) has.add("deposit");
      if (feeCharged(f, "balance")) has.add("balance");
      if (positive(f.direct)) has.add("direct");
      break;
    }
    case "runSecurities": {
      const { tariff, fund, wrapper } = plan.input;
      // F-101: a price for a time is a sequence of tariffs; a line any of them charges counts
      const chain = [];
      for (let t: typeof tariff | undefined = tariff; t; t = t.until?.then) chain.push(t);
      for (const t of chain) {
        if (configured(t.buy) || configured(t.sell)) has.add("trade");
        if (configured(t.custody)) has.add("custody");
        if ((typeof t.fx === "number" ? positive(t.fx) : configured(t.fx)) || positive(t.fxSpread)) has.add("fx");
        if (positive(t.monthlyFee)) has.add("fixed");
      }
      // F-102 is read from each stretch (F-101: a group exempt for a time); F-103 from the first tariff only, and the custodian's charge per
      // dividend counts with custody where a dividend is paid
      if (chain.some((t) => positive(t.currentAccount))) has.add("account");
      if (positive(tariff.perDividend) && fund.distribution) has.add("custody");
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

/**
 * The same plan with one fee line zeroed (V(F \ {f})). Everything else, including non-fee drag and tax, stays. A discounted line (A-19)
 * is one line over both of its periods: removing it removes the rate it reverts to as well.
 */
export function withoutFeeLine(plan: RunPlan, line: FeeLine): RunPlan {
  return changeLine(plan, line, 0, false);
}

/**
 * The same plan with one fee line at a new rate (V(F[f → f'])). `newRate` is a fraction a year for a balance,
 * direct, fund or manager fee; a fraction of each deposit, trade or conversion for a deposit, trade or fx fee;
 * a fraction of the half-spread for spread; a fraction a period for custody; NIS a month for fixed. A trade
 * line keeps its minimum and maximum. A fund line becomes one rate (the manager fee), with its variable and
 * trustee parts removed. A provident or pension balance or deposit fee at a new rate below what the run charges is a
 * discount too (A-19, D83, D86): a lower rate a company agrees to holds for PF-13's period and is no longer promised. On a
 * discounted line the new rate replaces the discounted rate and the line keeps its period and the rate it reverts to; on a
 * line with no discount it holds for PF-13's period and then returns to the line's own rate (`heldRevertRate`). So a stated
 * reduction is worth only what it changes. Without `ctx`, a move to another fund at that fund's own rate (F-72), the line takes the
 * new rate for the whole run and drops its own discount: the old fund's discount does not follow the money (D86).
 */
export function withFeeRate(plan: RunPlan, line: FeeLine, newRate: number, ctx?: RunContext): RunPlan {
  if (!Number.isFinite(newRate) || newRate < 0) throw new RangeError(`newRate ${newRate} must be a number of zero or more`);
  return changeLine(plan, line, newRate, ctx ? { ctx } : true);
}

/** PF-13's minimum discount period in months, from the rule book (A-19). */
export function minDiscountMonthsOf(ctx: RunContext): number {
  return 12 * ruleBook(ctx).amount("PF-13", "min_discount_years");
}

/** PF-14 case 1's months after deposits stop, from the rule book: the last month a discount holds on a plan with no deposit after month 0 (PF OQ18, D87). */
function oneDepositDiscountMonthsOf(ctx: RunContext): number {
  return ruleBook(ctx).amount("PF-14", "months_after_deposits_stop");
}

/**
 * D86: the rate a held line reverts to after PF-13's period, as a fraction: what the run charges on that line once the period is over. On a
 * discounted line that is the rate its discount reverts to (the record's `reverts_to`, else the regulations' cap); on a line with no discount,
 * its own rate: on a provident list the data check asks a line below the cap for its `reverts_to`, so the line is at the cap; a pension list
 * may print a line below the cap with none (Meitav's comprehensive fund, 0.22% and 1%), and a rate from a statement or a regulator's
 * average is one the run already holds for every year, so returning to the cap there would make a lower fee cost more. So a reduction changes one thing: the rate
 * during the period. Undefined where the run reads no discount on the line (direct expenses, and every line outside the provident family).
 */
export function heldRevertRate(plan: RunPlan, line: FeeLine): number | undefined {
  if (plan.run !== "runProvident" && plan.run !== "runPension") return undefined;
  if (line !== "balance" && line !== "deposit") return undefined;
  return revertRate(plan.input.fees, line) ?? plan.input.fees[line];
}

/**
 * F-62 with A-19 (D88): the rate the verdict judges a provident or pension line by, when it is not the rate charged now. A
 * discounted line whose discount ends within the run (at its period, never before PF-13's minimum, or after PF-14's six months on a plan with no
 * deposit after the first, PF OQ18's cautious reading, D87) is judged by the rate after it: the
 * rate charged during the discount (0% on a deposit fee) says nothing about what the fee costs. Null when the line has no discount or it
 * lasts the whole run; the verdict then judges the rate charged now. Never above the line's regulated cap, which is the most the run charges. The page names when the discount ends beside the verdict, since a
 * reduction agreed now holds only through the discount (D86) and is worth only that (D90).
 */
export function rateAfterDiscount(plan: RunPlan, line: FeeLine, exitMonth: number, ctx: RunContext): number | null {
  if (plan.run !== "runProvident" && plan.run !== "runPension") return null;
  if (line !== "balance" && line !== "deposit") return null;
  const f = plan.input.fees;
  const d: Discount | undefined = line === "balance" ? f.discount : f.depositDiscount;
  if (!d) return null;
  const stopMonths = depositsOnce(plan, exitMonth) ? oneDepositDiscountMonthsOf(ctx) : undefined;
  const endsBy = stopMonths !== undefined && exitMonth > stopMonths ? stopMonths : undefined;
  if (discountEnd(d, minDiscountMonthsOf(ctx), endsBy) >= exitMonth) return null;
  // the run charges no more than the regulated cap (F-11, F-15): a rate after the discount scaled past it (F-81's sensitivity) is judged at the cap;
  // a study fund has no deposit fee at all (PF-06 has no deposit item), and its ledger charges none
  const cap = plan.run === "runProvident" && plan.input.wrapper === "keren-hishtalmut" && line === "deposit" ? 0 : feeCap(plan, line, ctx)?.rate;
  return cap === undefined ? d.listRate : Math.min(d.listRate, cap);
}

/** PF OQ18 (D87): no deposit after month 0 up to `exitMonth`, as the provident and pension runs count deposits (months 1 to the goal's, when due). */
function depositsOnce(plan: Extract<RunPlan, { run: "runProvident" | "runPension" }>, exitMonth: number): boolean {
  const { goal } = plan.input;
  if (!(goal.monthly > 0)) return true;
  const every = plan.run === "runProvident" ? plan.input.depositsEvery : undefined;
  for (let m = 1; m <= Math.min(exitMonth, goal.months); m++) {
    if (!every || (m >= every.firstMonth && (m - every.firstMonth) % every.months === 0)) return false;
  }
  return true;
}

function changeLine(plan: RunPlan, line: FeeLine, rate: number, keepDiscount: boolean | { ctx: RunContext }): RunPlan {
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      if (line !== "deposit" && line !== "balance" && line !== "direct") return noLine(plan, line);
      // A-19: removed, the line's own discount goes with it, so "without this fee" charges nothing in any month; a move to another fund
      // at that fund's own rate is one rate for the whole run, so the old fund's discount does not follow it (D86); a stated reduction
      // replaces only the discounted rate, and on a line with no discount holds for PF-13's period, then returns to the line's own rate (D86)
      const f = plan.input.fees;
      const own: Discount | undefined = line === "balance" ? f.discount : line === "deposit" ? f.depositDiscount : undefined;
      const fees =
        keepDiscount === false || keepDiscount === true
          ? withFee(f, line, rate)
          : own || line === "direct"
            ? { ...f, [line]: rate }
            : withHeldRate(f, line, rate, minDiscountMonthsOf(keepDiscount.ctx), heldRevertRate(plan, line));
      return plan.run === "runProvident"
        ? { run: "runProvident", input: { ...plan.input, fees } }
        : { run: "runPension", input: { ...plan.input, fees } };
    }
    case "runSecurities": {
      // F-101: a tariff line is changed in every tariff of a price for a time; a tariff without the line stays as it is
      const { until, ...head } = plan.input.tariff;
      if (until && (line === "trade" || line === "custody" || line === "fx" || line === "fixed" || line === "account")) {
        const part = (tariff: typeof head): typeof head | null => {
          try {
            const changed = changeLine({ run: "runSecurities", input: { ...plan.input, tariff } }, line, rate, keepDiscount);
            return changed.run === "runSecurities" ? changed.input.tariff : null;
          } catch (e) {
            if (e instanceof RecordInputError) return null;
            throw e;
          }
        };
        const first = part(head);
        const second = part({ ...until.then, ...(head.currency ? { currency: head.currency } : {}) });
        if (!first && !second) return noLine(plan, line);
        const { currency: _, ...then } = second ?? until.then;
        return { run: "runSecurities", input: { ...plan.input, tariff: { ...(first ?? head), until: { months: until.months, then } } } };
      }
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
          if (!tariff.custody && !tariff.perDividend) return noLine(plan, line);
          // F-103: the custodian's charge per dividend is part of custody; removing custody removes it too, and a custody line at another rate
          // moves it in proportion, as a standing-order price moves with its line (F-12); a custody line at nothing gives no proportion, and the
          // charge stays as printed
          if (rate === 0) {
            delete tariff.custody;
            delete tariff.perDividend;
          } else if (tariff.custody) {
            if (tariff.perDividend && tariff.custody.rate > 0) tariff.perDividend = (tariff.perDividend * rate) / tariff.custody.rate;
            tariff.custody = { ...tariff.custody, rate };
          }
          return { run: "runSecurities", input: { ...input, tariff } };
        case "fx":
          if (tariff.fx === undefined) return noLine(plan, line);
          // F-13 (D65): the spread is part of the conversion line; a rate set here is the whole conversion's, so the spread goes with the old price
          delete tariff.fxSpread;
          if (rate === 0) delete tariff.fx;
          else if (typeof tariff.fx === "number") tariff.fx = rate;
          else {
            // a person's own rate replaces the line's rate and a price per unit of currency; a flat price for a small conversion stays, the rate
            // pricing the conversions above its sum, so a lower rate never makes a small conversion dearer (F-13)
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
        case "account":
          // a sequence (F-101) is changed stretch by stretch above; a stretch that charges nothing (a group exempt for a time) stays at nothing,
          // as a recurring plan's free conversion does (F-13)
          if (tariff.currentAccount === undefined) return noLine(plan, line);
          if (rate === 0) delete tariff.currentAccount;
          else if (tariff.currentAccount > 0) tariff.currentAccount = rate;
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
      const tariff = { ...(plan.input.tariff as { buy?: Commission; sell?: Commission; redeem?: Commission; custody?: Custody }) };
      if (line === "trade") {
        if (!tariff.buy && !tariff.sell) return noLine(plan, line);
        for (const key of ["buy", "sell", "redeem"] as const) {
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
  /** Every rule the method names for this cap, the figure's own among them (additive). */
  ruleIds?: string[];
}

/**
 * The regulated maximum of a deposit or balance fee, from the rule base; absent when the plan has none or the rule bundle lacks it.
 * Also PF-06's 2% a year on the manager's fee of an IRA hishtalmut (the `manager` line of a securities run).
 */
export function feeCap(plan: RunPlan, line: FeeLine, ctx: RunContext): FeeCap | undefined {
  if (plan.run === "runProvident" || plan.run === "runPension") return wrapperFeeCap(plan.input.wrapper, line, ctx);
  if (plan.run === "runSecurities" && plan.input.wrapper && line === "manager") return capOf({ rule: "PF-06", also: [] }, "balance_cap", ctx);
  return undefined;
}

/** The regulated maximum of a provident or pension wrapper's deposit or balance fee (the same as `feeCap` on its plan), without a plan. */
export function wrapperFeeCap(wrapper: string, line: FeeLine, ctx: RunContext): FeeCap | undefined {
  const where = capFigure[wrapper];
  const figure = line === "balance" ? where?.balance : line === "deposit" ? where?.deposit : undefined;
  return where && figure ? capOf(where, figure, ctx) : undefined;
}

function capOf(where: { rule: string; also: readonly string[] }, figure: string, ctx: RunContext): FeeCap | undefined {
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
  /** The changed run's flags: a held rate can give a plan a discount it did not have, and with it the open reading of PF OQ18 (D87). */
  flags: RunResult["flags"];
  /** The changed run's labels (a reading the figure rests on), beside its flags. */
  labels: RunResult["labels"];
}

/**
 * F-61 Value of a stated reduction `f → f'`: the run with the fee line at the new rate, less the run as it is, real NIS at the horizon. A
 * reduction a company agrees to holds for PF-13's period (D86); `held: false` is for a move to another fund at that fund's own rate, which
 * is not an offer on this line and runs for the whole horizon.
 */
export function valueOfReduction(plan: RunPlan, line: FeeLine, newRate: number, ctx: RunContext, opts: { held?: boolean } = {}): ReductionValue {
  const run = runPlanned(plan, ctx);
  const changed = runPlanned(withFeeRate(plan, line, newRate, opts.held === false ? undefined : ctx), ctx);
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
    flags: changed.flags,
    labels: changed.labels,
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
   * What the exit takes out of the last point (B6): the last point is before exit costs and exit tax, F-61's
   * figure is after them, and the two runs pay different tax (the run without fees has the larger gain). For the total and
   * for each line, `last point − exitEffect = F-61's figure`, to the rounding of floating point.
   */
  exitEffect: { total: number; cost: Partial<Record<FeeLine, number>> };
}

/**
 * F-61 at every month (method note): the same re-runs as `feeMateriality`, read month by month from
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
