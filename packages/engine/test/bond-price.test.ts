import { describe, expect, it } from "vitest";
import { bondPrice } from "../src/index.ts";

describe("bondPrice (F-25, 2026-10-25)", () => {
  it("is 100 at par and moves against the yield", () => {
    expect(bondPrice(0.035, 0.035, 10)).toBeCloseTo(100, 9);
    expect(bondPrice(0.035, 0.045, 10)).toBeLessThan(100);
    expect(bondPrice(0.035, 0.025, 10)).toBeGreaterThan(100);
  });
  it("is 100 for f coupons a year where the yield is the coupon's effective annual yield, (1 + c/f)^f − 1", () => {
    // 4% in two coupons of 2%: par at (1.02)^2 − 1 = 4.04%, and above par at 4%
    expect(bondPrice(0.04, Math.pow(1.02, 2) - 1, 10, 2)).toBeCloseTo(100, 9);
    expect(bondPrice(0.04, 0.04, 10, 2)).toBeGreaterThan(100);
    expect(bondPrice(0.04, Math.pow(1 + 0.04 / 12, 12) - 1, 7, 12)).toBeCloseTo(100, 9);
  });
  it("matches the sum of discounted payments", () => {
    let pv = 0;
    for (let k = 1; k <= 5; k++) pv += 4 / Math.pow(1.06, k);
    expect(bondPrice(0.04, 0.06, 5)).toBeCloseTo(pv + 100 / Math.pow(1.06, 5), 9);
  });
  it("a zero-coupon bond is the discounted face", () => {
    expect(bondPrice(0, 0.05, 3)).toBeCloseTo(100 / Math.pow(1.05, 3), 9);
  });
});
