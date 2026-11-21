import { describe, expect, it } from "vitest";
import { changedByShare, sweep } from "../src/formulas/step-effect.ts";

const left = (p: { years: number; r: number }) => 1000 * p.years * (1 + p.r);

describe("F-89 a plan number changed by a share", () => {
  it("moves the value by the share; years stay whole and at least 1, nothing goes below 0", () => {
    expect(changedByShare(500, 0.2)).toBeCloseTo(600);
    expect(changedByShare(10, -0.25, true)).toBe(8);
    expect(changedByShare(1, -0.5, true)).toBe(1);
    expect(changedByShare(100, -2)).toBe(0);
  });
});

describe("F-90 sweep", () => {
  it("prices the plan at each value of one number", () => {
    expect(sweep(left, { years: 10, r: 0 }, "years", [1, 2, 3])).toEqual([1000, 2000, 3000]);
    expect(sweep(left, { years: 1, r: 0 }, "r", [0, 50], 100)).toEqual([1000, 1500]);
  });
});
