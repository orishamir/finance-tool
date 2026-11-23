// The bounds of the plan numbers a person enters: read from P-05 as its sliders and ranges write them, and held by the plan the indices page
// reads from the device, so a number the fields refuse never reaches a run (a thousand years held the page for over a minute).
import { describe, expect, it } from "vitest";
import type { ParameterRecord } from "@finance-tool/schema";
import { loadParameters, today } from "./data.server";
import { p05Bounds, p05Range } from "./engine";
import { enteredPlan } from "./entered-plan";
import { boundProblem, withinBounds, type PlanBounds } from "./plan-bounds";

const p05 = loadParameters().find((p) => p.method_id === "P-05") as ParameterRecord;
const bundle = { p05, today: today() };

/** Fixed bounds for the checks that do not read P-05. */
const BOUNDS: PlanBounds = {
  amount_now: { min: 0, max: null, whole: false },
  monthly_deposit: { min: 0, max: null, whole: false },
  horizon_years: { min: 1, max: 40, whole: true },
  "A-01": { min: -50, max: 50, whole: false },
  "A-02": { min: -50, max: 50, whole: false },
  age: { min: 0, max: 120, whole: true },
};

describe("the bounds as P-05 writes them", () => {
  it("the years are the horizon slider's ends, whole; the amounts start at their slider's start up to P-05's amount top; the percentages and the age their ranges", () => {
    const b = p05Bounds(p05);
    const range = (group: "sliders" | "ranges", key: string) => {
      const r = p05Range(p05, group, key);
      if (!r) throw new Error(`P-05 has no ${group} ${key}`);
      return r;
    };
    const [years, pct, age] = [range("sliders", "horizon_years"), range("ranges", "pct"), range("ranges", "age")];
    expect(b.horizon_years).toEqual({ min: years.min, max: years.max, whole: true });
    expect(b.amount_now).toEqual({ min: range("sliders", "amount_now").min, max: range("ranges", "amount").max, whole: false });
    expect(b.monthly_deposit).toEqual({ min: range("sliders", "monthly_deposit").min, max: range("ranges", "amount").max, whole: false });
    expect(b["A-01"]).toEqual({ min: pct.min, max: pct.max, whole: false });
    expect(b["A-02"]).toEqual({ min: pct.min, max: pct.max, whole: false });
    expect(b.age).toEqual({ min: age.min, max: age.max, whole: true });
  });
});

describe("a number against its bound", () => {
  it("names what is wrong: below, above, not whole; an open top takes any size", () => {
    expect(boundProblem(BOUNDS.horizon_years, 0)).toBe("below");
    expect(boundProblem(BOUNDS.horizon_years, 1000)).toBe("above");
    expect(boundProblem(BOUNDS.horizon_years, 2.5)).toBe("not-whole");
    expect(boundProblem(BOUNDS.horizon_years, 40)).toBeNull();
    expect(boundProblem(BOUNDS.amount_now, 1e12)).toBeNull();
    expect(boundProblem(BOUNDS.amount_now, -1)).toBe("below");
  });

  it("an entered number outside its bound reads as not entered; the rest stay", () => {
    expect(withinBounds({ horizon_years: 1000, amount_now: 5000, "A-01": 99 }, BOUNDS)).toEqual({ amount_now: 5000 });
  });
});

describe("the indices page's plan from what the device holds", () => {
  const start = (p05 as unknown as { inputs: { horizon_years: { value: number } } }).inputs.horizon_years.value;

  it("a thousand years saved on the device runs on the site's example years, marked not entered", () => {
    const e = enteredPlan(bundle, { entered: { horizon_years: 1000, amount_now: 5000 }, age: 400, employment: null }, p05Bounds(p05));
    expect(e.plan.years).toBe(start);
    expect(e.plan.values.years.state).not.toBe("entered");
    expect(e.plan.amountNow).toBe(5000);
    expect(e.plan.age).toBeNull();
  });

  it("years within the bound are the person's", () => {
    const e = enteredPlan(bundle, { entered: { horizon_years: 25 }, age: 40, employment: null }, p05Bounds(p05));
    expect(e.plan.years).toBe(25);
    expect(e.plan.age).toBe(40);
  });
});
