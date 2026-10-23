// Runs the illustrative timeline (method F-67) in the browser and at build, from the bundle the guide
// loader ships: the wrapper record, P-05, the provider's list fees and the rule records the run may read.
// Every value the person entered replaces its P-05 counterpart (F-67); each year's point is a full run
// with the horizon set to that year, so "what is left" at year n is what a withdrawal at year n would give.
import {
  BlockedError,
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
import type { ParameterRecord, RuleRecord, ValueObject, WrapperRecord } from "@finance-tool/schema";
import { entered as enteredValue, type SiteValue } from "./value";

export const p05Units: Record<P05Input, ValueObject["unit"]> = {
  amount_now: "nis",
  monthly_deposit: "nis_per_month",
  horizon_years: "years",
  "A-01": "pct_per_year",
  "A-02": "pct_per_year",
  cash_rate: "pct_per_year",
  annual_income: "nis",
};

export interface Bundle {
  record: WrapperRecord;
  p05: ParameterRecord;
  terms: InstrumentTerms;
  /** The list-fee lines the terms came from, so the page can show where each rate is from. */
  feeValues: Record<string, SiteValue>;
  rules: RuleRecord[];
  runDate: string;
}

export interface YearPoint {
  year: number;
  nominal: number;
  real: number;
  paidIn: number;
  fees: number;
  taxDuring: number;
  taxAtExit: number;
  index: number;
  grossBalance: number;
  /** Named intermediate figures of that year's run (real gain, alternative tax). */
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
  | { kind: "blocked"; ruleId: string }
  | { kind: "figure-not-updated"; ruleId: string; figure: string }
  | { kind: "failed"; message: string };

export type Timeline = TimelineResult | TimelineError;

export interface TimelineInputs {
  entered: Partial<Record<P05Input, number>>;
  age: number | null;
}

export function runTimeline(bundle: Bundle, inputs: TimelineInputs): Timeline {
  try {
    const entered: Partial<Record<P05Input, ValueObject>> = {};
    for (const [key, value] of Object.entries(inputs.entered) as [P05Input, number][]) {
      if (value !== undefined && Number.isFinite(value)) entered[key] = enteredValue(value, p05Units[key], bundle.runDate);
    }
    const profile = inputs.age === null ? {} : { ageAtStart: inputs.age };
    const plan = runInputs(bundle.record, [bundle.p05], bundle.terms, { entered, profile, scenarioIncome: true });
    const ctx = { rules: bundle.rules, runDate: bundle.runDate };
    const horizon = plan.input.goal.months / 12;
    const years: YearPoint[] = [];
    const flags = new Set<string>();
    const rules = new Map<string, UsedRule>();
    for (let n = 1; n <= horizon; n++) {
      const yearPlan = { ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months: 12 * n } } } as typeof plan;
      const run = runPlanned(yearPlan, ctx);
      const last = run.series[run.series.length - 1]!;
      years.push({
        year: n,
        nominal: run.nominal,
        real: run.real,
        paidIn: run.paidIn,
        fees: Object.values(run.fees).reduce((a, b) => a + b, 0),
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
    if (e instanceof BlockedError) return { kind: "blocked", ruleId: e.ruleId };
    if (e instanceof FigureNotUpdatedError) return { kind: "figure-not-updated", ruleId: e.ruleId, figure: e.figure };
    if (e instanceof NotEvaluatedError || e instanceof RecordInputError || e instanceof MissingRuleError) return { kind: "failed", message: (e as Error).message };
    return { kind: "failed", message: e instanceof Error ? e.message : String(e) };
  }
}

/** P-05's own value of an input, as the parameter file holds it (with its rationale for the sheet). */
export function p05Value(p05: ParameterRecord, key: P05Input): SiteValue {
  const inputs = (p05 as unknown as { inputs: Record<P05Input, ValueObject> }).inputs;
  return {
    ...inputs[key],
    parameter: { rationale: p05.rationale, rationaleHe: p05.rationale_he ?? null, signedOffOn: p05.signed_off_on, provisional: false },
  };
}

export function p05Number(p05: ParameterRecord, key: P05Input): number {
  return (p05 as unknown as { inputs: Record<P05Input, ValueObject> }).inputs[key].value as number;
}

/** P-05's page controls: slider ranges (design-system Q6) and the provisional input ranges. */
export function p05Range(p05: ParameterRecord, group: "sliders" | "ranges", key: string): { min: number; max: number; step?: number; values: Record<string, SiteValue> } | null {
  const g = (p05 as unknown as Record<string, Record<string, Record<string, ValueObject>>>)[group]?.[key];
  if (!g) return null;
  const values: Record<string, SiteValue> = {};
  for (const [k, v] of Object.entries(g)) values[k] = { ...v, parameter: { rationale: p05.rationale, rationaleHe: p05.rationale_he ?? null, signedOffOn: p05.signed_off_on, provisional: (v.notes ?? "").startsWith("provisional") } };
  return { min: g.min!.value as number, max: g.max!.value as number, step: g.step ? (g.step.value as number) : undefined, values };
}
