// Formula registry: method.md F-ID → implementation (docs/architecture.md 3.4).
// Wrapper records name their formulas; the engine dispatches through this map, and a test checks
// every key against docs/method.md.
import { annualToMonthly, monthlyInflation } from "./formulas/time.ts";

export const formulas = {
  "F-02": monthlyInflation,
  "F-07": annualToMonthly,
} as const;

export type FormulaId = keyof typeof formulas;
