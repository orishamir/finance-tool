// The grid a sum's lines are rounded on (sumGrid, onGrid, gridParts; method.md F-91, F-96).
import { describe, expect, it } from "vitest";
import { gridParts, onGrid, sumGrid } from "./whole-parts";

describe("the lines of a sum on its grid", () => {
  it("hundreds where the total rests on an assumed return, whole shekels otherwise", () => {
    expect(sumGrid({ onAssumedReturn: true })).toBe(100);
    expect(sumGrid({})).toBe(1);
  });
  it("rounds to the nearest whole shekel, or to the nearest hundred with a half away from zero, with no smaller grid for a small figure", () => {
    expect(onGrid(66_149.69, 100)).toBe(66_100);
    expect(onGrid(66_150, 100)).toBe(66_200);
    expect(onGrid(-250, 100)).toBe(-300);
    expect(onGrid(115.54, 100)).toBe(100);
    expect(onGrid(40, 100)).toBe(0);
    expect(Object.is(onGrid(-40, 100), 0)).toBe(true);
    expect(onGrid(115.54, 1)).toBe(116);
  });
  it("gives parts on the grid that add up to the total, the rounding to the largest remainders", () => {
    // the fund's 115.54 ₪ and the tax's 3,313.08 ₪ against 3,500 ₪ left for them: 200 and 3,300
    expect(gridParts([115.54, 3313.08], 3500, 100)).toEqual([200, 3300]);
    expect(gridParts([115.54, 3313.08], 3429, 1)).toEqual([116, 3313]);
    const lines = gridParts([11_196.6, 10_175.4, 2_385.7, 31.8], 23_800, 100);
    expect(lines.reduce((a, x) => a + x, 0)).toBe(23_800);
    for (const x of lines) expect(x % 100).toBe(0);
  });
});
