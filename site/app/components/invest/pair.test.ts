// The gap sentence under the cost bars: its rounded parts add up to the rounded gap (F-91).
import { describe, expect, it } from "vitest";
import { wholeParts } from "./pair";

describe("wholeParts", () => {
  it("rounds each part so they add up to the rounded sum", () => {
    // the cheapest pair against the next on the S&P 500 example: account, fund, tax
    const xs = [0.75, -57.71, 14.21];
    const out = wholeParts(xs);
    expect(out.reduce((a, x) => a + x, 0)).toBe(Math.round(xs.reduce((a, x) => a + x, 0)));
    expect(out).toEqual([1, -58, 14]);
  });

  it("keeps whole numbers as they are", () => {
    expect(wholeParts([3, -2, 0])).toEqual([3, -2, 0]);
  });

  it("each part stays within one shekel of its own value", () => {
    const xs = [0.5, 0.5, 0.5, -0.4];
    const out = wholeParts(xs);
    expect(out.reduce((a, x) => a + x, 0)).toBe(Math.round(1.1));
    out.forEach((x, i) => expect(Math.abs(x - xs[i]!)).toBeLessThan(1));
  });
});

describe("wholeParts with a set total", () => {
  it("meets a total one shekel off the rounded sum, either way", () => {
    const xs = [0.75, -57.71, 14.21]; // sums to -42.75
    expect(wholeParts(xs, -42).reduce((a, x) => a + x, 0)).toBe(-42);
    expect(wholeParts(xs, -44).reduce((a, x) => a + x, 0)).toBe(-44);
    wholeParts(xs, -44).forEach((x, i) => expect(Math.abs(x - xs[i]!)).toBeLessThan(2));
  });
});
