import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { annualToMonthly, monthlyInflation } from "../src/index.ts";

describe("F-02, F-07", () => {
  it("compounds back to the annual rate over twelve months", () => {
    fc.assert(
      fc.property(fc.double({ min: -0.5, max: 1, noNaN: true }), (r) => {
        expect(Math.pow(1 + annualToMonthly(r), 12)).toBeCloseTo(1 + r, 12);
        expect(Math.pow(1 + monthlyInflation(r), 12)).toBeCloseTo(1 + r, 12);
      }),
    );
  });

  it("is zero at a zero rate", () => {
    expect(annualToMonthly(0)).toBe(0);
  });
});
