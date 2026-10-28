import { describe, expect, it } from "vitest";
import { stepEffect, sweep } from "../src/formulas/step-effect.ts";

describe("F-89 step effect", () => {
  const left = (p: { years: number; r: number }) => 1000 * p.years * (1 + p.r);
  it("is the value left one step higher less the value left now", () => {
    expect(stepEffect(left, { years: 10, r: 0.07 }, "years", 1, 40)).toBeCloseTo(1070);
  });
  it("reads a fraction in the slider's unit and cuts the step at the top", () => {
    expect(stepEffect(left, { years: 10, r: 0.07 }, "r", 1, 12, 100)).toBeCloseTo(100);
    expect(stepEffect(left, { years: 40, r: 0.07 }, "years", 1, 40)).toBe(0);
  });
  it("is null when a run gives no value", () => {
    expect(stepEffect(() => null, { years: 10, r: 0 }, "years", 1, 40)).toBeNull();
  });
});

describe("F-90 sweep", () => {
  it("prices the plan at each value of one knob, read in the slider's unit", () => {
    const left = (p: { years: number; r: number }) => 1000 * p.years * (1 + p.r);
    expect(sweep(left, { years: 10, r: 0 }, "years", [1, 2, 3])).toEqual([1000, 2000, 3000]);
    expect(sweep(left, { years: 1, r: 0 }, "r", [0, 50], 100)).toEqual([1000, 1500]);
  });
});
