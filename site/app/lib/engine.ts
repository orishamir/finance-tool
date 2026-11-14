// Runs the illustrative timeline (method F-67) in the browser and at build, from the bundle the guide
// loader ships: the wrapper record, P-05, the provider's list fees and the rule records the run may read.
// Every value the person entered replaces its P-05 counterpart (F-67); each year's point is a full run
// with the horizon set to that year, so "what is left" at year n is what a withdrawal at year n would give.
import {
  BlockedError,
  calendarMonthOf,
  stoppedOnQuestion,
  FigureNotUpdatedError,
  MissingRuleError,
  NotEvaluatedError,
  RecordInputError,
  runInputs,
  runPlanned,
  type InstrumentTerms,
  type P05Input,
  type UsedRule,
} from "@finance-tool/engine";
import type { ParameterRecord, RuleRecord, ValueObject, ProductRecord } from "@finance-tool/schema";
import { blockedHe, failureHe, figureNotUpdatedHe } from "./failure-he";
import { entered as enteredValue, p05Units, type SiteValue } from "./value";

export interface Bundle {
  record: ProductRecord;
  p05: ParameterRecord;
  terms: InstrumentTerms;
  /** The list-fee lines the terms came from, so the page can show where each rate is from. */
  feeValues: Record<string, SiteValue>;
  rules: RuleRecord[];
  runDate: string;
  /**
   * The run rests on a choice over the collected records, which the terms block says with how many were compared: an account on the tariff
   * that leaves the plan the most (F-80), a deposit on the middle of those that cannot be broken (F-86).
   * `tied` (F-80, P-01): the houses within the tie threshold of the top, the run's own first; the page says they tie and crowns none.
   */
  pick?: { kind: "account" | "deposit" | "manager"; id: string; count: SiteValue; tied?: { names: string[]; theta?: SiteValue } };
}

export interface YearPoint {
  year: number;
  nominal: number;
  real: number;
  paidIn: number;
  /** What was paid in, in today's money: each deposit at the price level of the month it was made (F-06), not the sum at the end's. */
  paidInReal: number;
  fees: number;
  /** The fees and the tax, in today's money, each month's at its own price level (`totalToday`). */
  feesReal: number;
  taxReal: number;
  taxDuring: number;
  taxAtExit: number;
  index: number;
  grossBalance: number;
  /** Named intermediate figures of that year's run (the real gain, the tax at the full rate). */
  detail: Record<string, number>;
}

export interface TimelineResult {
  kind: "ok";
  horizon: number;
  years: YearPoint[];
  rules: UsedRule[];
  flags: string[];
  enteredReturn: boolean;
}

export type TimelineError =
  /** `question`: the open question that stopped it (its readings gave the run different results, method §13), which the band opens. */
  | { kind: "blocked"; ruleId: string; question?: string; messageHe: string }
  | { kind: "figure-not-updated"; ruleId: string; figure: string; messageHe: string }
  | { kind: "failed"; message: string; messageHe: string };

export type Timeline = TimelineResult | TimelineError;

export interface TimelineInputs {
  entered: Partial<Record<P05Input, number>>;
  age: number | null;
}

/**
 * F-06 applied to the money paid in: what was paid in, in today's money, is each deposit divided by the index of the
 * month it was paid, `C_0 / I_0 + Σ C_m / I_m` (F-03: an event in month m uses `I_m`, the amount now `I_0 = 1`). The ledgers add the
 * amount now inside month 1, so it is taken back out of that month and counted at `I_0`. Dividing the whole sum by the last month's
 * index would shrink every deposit by all the inflation of the horizon and draw idle cash as a gain (finding 6 of
 * 8dd1f013:research/discovery/2026-10-25-guide-pages-sweep.md).
 */
/**
 * A run's running total (its fees, or the tax it paid along the way) in today's money: each month's part at that month's price level
 * (F-06), and what the run adds at the exit at the horizon's; never the total divided by the end's index, the shortcut F-06 forbids for
 * what was paid in.
 */
export function totalToday<P extends { index: number }>(series: readonly P[], at: (point: P) => number, total: number): number {
  let sum = 0;
  let prev = 0;
  let index = 1;
  for (const point of series) {
    sum += (at(point) - prev) / point.index;
    prev = at(point);
    index = point.index;
  }
  return sum + (total - prev) / index;
}

export function paidInToday(run: { paidIn: number; series: readonly { month: number; paidIn: number; index: number }[] }, amountNow: number): number {
  if (run.series.length === 0) return run.paidIn;
  let total = 0;
  let prevPaid = 0;
  for (const point of run.series) {
    let deposit = point.paidIn - prevPaid;
    if (point.month === 1) {
      const now = Math.min(amountNow, deposit);
      total += now;
      deposit -= now;
    }
    total += deposit / point.index;
    prevPaid = point.paidIn;
  }
  return total;
}

export function runTimeline(bundle: Bundle, inputs: TimelineInputs): Timeline {
  try {
    const entered: Partial<Record<P05Input, ValueObject>> = {};
    for (const [key, value] of Object.entries(inputs.entered) as [P05Input, number][]) {
      if (value !== undefined && Number.isFinite(value)) entered[key] = enteredValue(value, p05Units[key], bundle.runDate);
    }
    const profile = inputs.age === null ? {} : { ageAtStart: inputs.age };
    const plan = runInputs(bundle.record, [bundle.p05], bundle.terms, { entered, profile, scenarioIncome: true, firstMonth: calendarMonthOf(bundle.runDate) });
    const ctx = { rules: bundle.rules, runDate: bundle.runDate };
    const horizon = plan.input.goal.months / 12;
    const years: YearPoint[] = [];
    const flags = new Set<string>();
    const rules = new Map<string, UsedRule>();
    for (let n = 1; n <= horizon; n++) {
      const yearPlan = { ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months: 12 * n } } } as typeof plan;
      const run = runPlanned(yearPlan, ctx);
      // a year whose open question's readings give different results (TXG OQ17 at a falling CPI, method §13) stops the drawing: no year is
      // drawn, as for any open rule, rather than some years at their value before the exit tax
      const stopped = stoppedOnQuestion(run);
      if (stopped) return { kind: "blocked", ruleId: stopped.ruleId, question: stopped.question, messageHe: blockedHe };
      const last = run.series[run.series.length - 1]!;
      years.push({
        year: n,
        nominal: run.nominal,
        real: run.real,
        paidIn: run.paidIn,
        paidInReal: paidInToday(run, plan.input.goal.amountNow),
        fees: Object.values(run.fees).reduce((a, b) => a + b, 0),
        feesReal: totalToday(run.series, (x) => x.fees, Object.values(run.fees).reduce((a, b) => a + b, 0)),
        taxReal: totalToday(run.series, (x) => x.taxDuring, run.taxDuring + run.taxAtExit),
        taxDuring: run.taxDuring,
        taxAtExit: run.taxAtExit,
        index: last.index,
        grossBalance: last.balance,
        detail: run.detail,
      });
      run.flags.forEach((f) => flags.add(f.code));
      run.rules.forEach((r) => rules.set(r.id, r));
    }
    return { kind: "ok", horizon, years, rules: [...rules.values()], flags: [...flags], enteredReturn: "A-01" in entered };
  } catch (e) {
    if (e instanceof BlockedError) return { kind: "blocked", ruleId: e.ruleId, ...(e.question ? { question: e.question } : {}), messageHe: blockedHe };
    if (e instanceof FigureNotUpdatedError) return { kind: "figure-not-updated", ruleId: e.ruleId, figure: e.figure, messageHe: figureNotUpdatedHe };
    if (e instanceof NotEvaluatedError || e instanceof RecordInputError || e instanceof MissingRuleError) return { kind: "failed", message: (e as Error).message, messageHe: failureHe((e as Error).message) };
    { const message = e instanceof Error ? e.message : String(e); return { kind: "failed", message, messageHe: failureHe(message) }; }
  }
}

/** P-05's own value of an input, as the parameter file holds it (with its rationale for the sheet). */
export function p05Value(p05: ParameterRecord, key: P05Input): SiteValue {
  const inputs = (p05 as unknown as { inputs: Record<P05Input, ValueObject> }).inputs;
  // an input a guide page replaced with a record's own value (a bank's published rate) is that record's number, not a site parameter
  if (inputs[key].update_rule !== "founder") return { ...inputs[key] };
  return {
    ...inputs[key],
    parameter: { rationale: p05.rationale, rationaleHe: p05.rationale_he ?? null },
  };
}

export function p05Number(p05: ParameterRecord, key: P05Input): number {
  return (p05 as unknown as { inputs: Record<P05Input, ValueObject> }).inputs[key].value as number;
}

/** P-05's page controls: slider ranges (design-system Q6) and the input ranges. */
export function p05Range(p05: ParameterRecord, group: "sliders" | "ranges", key: string): { min: number; max: number; step?: number; values: Record<string, SiteValue> } | null {
  const g = (p05 as unknown as Record<string, Record<string, Record<string, ValueObject>>>)[group]?.[key];
  if (!g) return null;
  const values: Record<string, SiteValue> = {};
  for (const [k, v] of Object.entries(g)) values[k] = { ...v, parameter: { rationale: p05.rationale, rationaleHe: p05.rationale_he ?? null } };
  return { min: g.min!.value as number, max: g.max!.value as number, step: g.step ? (g.step.value as number) : undefined, values };
}
