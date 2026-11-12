// The plan the indices page runs on: the numbers the person entered on this device (lib/inputs.tsx, the guide pages' own), each one
// not entered taking the site's example (P-05). Never the saved goal: only the goal page speaks of a goal. No figure is written here:
// each comes from P-05 or from the person.
import type { ValueObject } from "@finance-tool/schema";
import { computedInputs as ci } from "../copy";
import { asParameter, parameterOf, type CompareBundle } from "./compare";
import type { InputsState } from "./inputs";
import type { WorkbenchInputs } from "./providers";
import { asField, entered as enteredValue } from "./value";

export interface EnteredPlan {
  /** The plan as the page's runs take it, without the current accounts it counts (the page's own choice). */
  plan: Omit<WorkbenchInputs, "currentAccounts">;
  /** The values the plan's fields start at (P-05's scenario): what each field's reset goes back to, "חזרה ל־10". */
  starts: { amount: number; monthly: number; years: number; inflation: number; returnV: number };
}

/** The plan from what the person entered, each number not entered taking P-05's; every value is a field's own (`asField`). */
export function enteredPlan(bundle: CompareBundle, released: InputsState): EnteredPlan {
  const p05 = parameterOf(bundle, "P-05");
  const inp = (p05 as unknown as { inputs: Record<string, ValueObject> }).inputs;
  const num = (key: string) => inp[key]!.value as number;
  const e = released.entered;
  // each is a field's value on the page, its default or what the reader typed: a plain number wherever it shows
  const val = (key: "amount_now" | "monthly_deposit" | "horizon_years" | "A-01" | "A-02", unit: ValueObject["unit"], about: string) =>
    asField(e[key] !== undefined ? enteredValue(e[key]!, unit, bundle.runDate, about) : asParameter(p05, inp[key]!));
  const amount = val("amount_now", "nis", ci.amountNow);
  const monthly = val("monthly_deposit", "nis_per_month", ci.monthly);
  const years = val("horizon_years", "years", ci.years);
  const returnV = val("A-01", "pct_per_year", ci.grossReturn);
  const inflation = val("A-02", "pct_per_year", ci.inflation);
  const income = e.annual_income ?? num("annual_income");
  return {
    plan: {
      amountNow: amount.value as number,
      monthly: monthly.value as number,
      years: years.value as number,
      grossReturn: (returnV.value as number) / 100,
      inflation: (inflation.value as number) / 100,
      age: released.age,
      income: income > 0 ? income : null,
      values: { amount, monthly, years, returnV, inflation },
      returnFromParameter: e["A-01"] === undefined,
    },
    starts: { amount: num("amount_now"), monthly: num("monthly_deposit"), years: num("horizon_years"), inflation: num("A-02"), returnV: num("A-01") },
  };
}
