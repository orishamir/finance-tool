import { describe, expect, it } from "vitest";
import { stockExposureShare } from "../src/formulas/track-exposure.ts";

describe("F-87 stock exposure share", () => {
  it("divides the exposure by the assets, as a percent (CMA 2026-09, track 103)", () => {
    expect(stockExposureShare(12378.07, 25706.14)).toBeCloseTo(48.152, 3);
  });

  it("keeps a share above 100% as reported", () => {
    expect(stockExposureShare(108.7, 100)).toBeCloseTo(108.7, 9);
  });

  it("is null without assets", () => {
    expect(stockExposureShare(5, 0)).toBeNull();
    expect(stockExposureShare(0, -1)).toBeNull();
  });

  it("zero exposure is 0%", () => {
    expect(stockExposureShare(0, 960.64)).toBe(0);
  });
});
