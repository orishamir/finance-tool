import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { annualToMonthly, contributions, cpiPath, monthlyInflation, paidInAsEntered, realValue } from "../src/index.ts";

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

describe("F-106", () => {
  it("is F-05's deposits rising with the index, each at its own month's index (F-06)", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1e6, noNaN: true }), fc.double({ min: 0, max: 1e5, noNaN: true }), fc.integer({ min: 0, max: 40 }), fc.double({ min: -0.05, max: 0.2, noNaN: true }), (amountNow, monthly, years, inflation) => {
        const months = 12 * years;
        const index = cpiPath(inflation, months);
        const deposits = contributions({ amountNow, monthly, months, contributions: "real" } as Parameters<typeof contributions>[0], index);
        const today = deposits.reduce((a, c, m) => a + realValue(c, index, m), 0);
        expect(paidInAsEntered(amountNow, monthly, years)).toBeCloseTo(today, 4);
      }),
    );
  });
});
