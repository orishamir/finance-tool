// The numbers a page runs on when it takes them from the saved goal (the fees page, the index page): `feeInputs`, with one addition.
// A goal the person has only begun (an amount typed, no years yet) has nothing the comparison can run on, and `feeInputs` then
// drops it for the site's example, so a typed amount would vanish. Here the goal's empty amount, monthly and years take the site's
// example (P-05) and stay marked as site values, while what was typed stays the person's (2026-10-25, the index page).
import { runGoalOf, type CompareBundle } from "./compare";
import { feeInputs, type FeeInputs } from "./fees";
import { hasMeaning, type Goal, type ResolvedGoal } from "./goal";
import type { InputsState } from "./inputs";

export function planInputs(bundle: CompareBundle, current: Goal | null | undefined, resolved: ResolvedGoal | null | undefined, released: InputsState): FeeInputs {
  const scenario = feeInputs(bundle, null, released);
  if (!current || !resolved) return scenario;
  const touched = current.horizonYears.entered || current.amountNow.entered || current.monthly.entered || current.preset !== "none";
  const gaps = { years: resolved.horizonYears === null, amount: resolved.amountNow === null, monthly: resolved.monthly === null };
  const patched: ResolvedGoal = touched && (gaps.years || gaps.amount || gaps.monthly) ? { ...resolved, horizonYears: gaps.years ? scenario.g.horizonYears : resolved.horizonYears, amountNow: gaps.amount ? scenario.g.amountNow : resolved.amountNow, monthly: gaps.monthly ? scenario.g.monthly : resolved.monthly } : resolved;
  const goalG = hasMeaning(patched) ? runGoalOf(current, patched) : null;
  const fi = feeInputs(bundle, goalG, released);
  if (!fi.fromGoal || !touched) return fi;
  const v = fi.values;
  return { ...fi, values: { ...v, years: gaps.years ? scenario.values.years : v.years, amount: gaps.amount ? scenario.values.amount : v.amount, monthly: gaps.monthly ? scenario.values.monthly : v.monthly } };
}
