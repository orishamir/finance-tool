// The log amount axis of the deal's charts (log-axis.ts) and the reading of a sampled curve at an amount (share-chart.tsx).
import { describe, expect, it } from "vitest";
import { amountAt, amountTick, logAt, logTicks, shareTicks } from "./log-axis";
import { shareAt } from "./share-chart";

describe("the log axis", () => {
  it("places an amount by its power of ten, and back", () => {
    const r = { lo: 1000, hi: 100_000 };
    expect(logAt(r, 10_000)).toBeCloseTo(0.5, 12);
    expect(amountAt(r, 0.5)).toBeCloseTo(10_000, 6);
  });
  it("writes each power of ten, and the 2 and the 5 too where it spans fewer than three", () => {
    expect(logTicks({ lo: 1000, hi: 50_000_000 })).toEqual([1000, 10_000, 100_000, 1_000_000, 10_000_000]);
    expect(logTicks({ lo: 10_000, hi: 2_000_000 })).toEqual([10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000]);
  });
  it("writes a million and more by the word, in visual order for an SVG text", () => {
    expect(amountTick(20_000)).toBe("20,000");
    expect(amountTick(2_000_000)).toBe("⁦מיליון 2⁩");
  });
  it("steps a share axis by 1, 2, 2.5 or 5 times a power of ten, to at least its top", () => {
    expect(shareTicks(4.6)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(shareTicks(3.3)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]);
    expect(shareTicks(0)).toEqual([0]);
  });
});

describe("a sampled curve", () => {
  it("is read straight between two samples on the log axis, and after a jump at its amount", () => {
    const pts = [
      { at: 1000, share: 2 },
      { at: 10_000, share: 1 },
      { at: 10_000, share: 0.5 },
      { at: 100_000, share: 0.5 },
    ];
    expect(shareAt(pts, Math.sqrt(1000 * 10_000))).toBeCloseTo(1.5, 12);
    expect(shareAt(pts, 50_000)).toBeCloseTo(0.5, 12);
    expect(shareAt(pts, 10)).toBe(2);
  });
});
