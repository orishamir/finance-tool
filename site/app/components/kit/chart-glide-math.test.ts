import { describe, expect, it } from "vitest";
import { alignLine, cssMs, follow, mergeTicks, sameSeries, valueOn } from "./chart-glide-math";

const pts = (...v: number[]) => v.map((n, year) => ({ year, v: n }));

describe("valueOn", () => {
  it("reads between points and holds past the ends", () => {
    expect(valueOn(pts(0, 10), 0.5)).toBe(5);
    expect(valueOn(pts(0, 10), 9)).toBe(10);
    expect(valueOn([{ year: 2, v: 7 }], 1)).toBe(7);
  });
});

describe("sameSeries", () => {
  it("sees the same numbers in new arrays as the same", () => {
    expect(sameSeries({ a: pts(1, 2) }, { a: pts(1, 2) })).toBe(true);
    expect(sameSeries({ a: pts(1, 2) }, { a: pts(1, 3) })).toBe(false);
    expect(sameSeries({ a: pts(1) }, { b: pts(1) })).toBe(false);
  });
  it("sees a line with no price as the same, so it starts no endless glide", () => {
    expect(sameSeries({ a: pts(NaN) }, { a: pts(NaN) })).toBe(true);
  });
});

describe("alignLine", () => {
  it("moves only the years both have, when a horizon grows", () => {
    const a = alignLine(pts(0, 10), pts(0, 20, 30));
    expect(a.years).toEqual([0, 1, 2]);
    expect(a.now).toEqual([0, 10, 30]);
    expect(a.goal).toEqual([0, 20, 30]);
  });
  it("leaves the years past a shorter horizon where they were, for the axis to take out of view", () => {
    const a = alignLine(pts(0, 10, 20), pts(0, 10));
    expect(a.now).toEqual([0, 10, 20]);
    expect(a.goal).toEqual([0, 10, 20]);
  });
  it("draws a new line at once", () => {
    const a = alignLine(undefined, pts(1, 2));
    expect(a.now).toEqual(a.goal);
  });
  it("carries on from a line caught halfway, whose years are the two ranges together", () => {
    const a = alignLine([{ year: 0, v: 5 }, { year: 0.5, v: 6 }, { year: 1, v: 7 }], pts(0, 10));
    expect(a.years).toEqual([0, 0.5, 1]);
    expect(a.now).toEqual([5, 6, 7]);
    expect(a.goal).toEqual([0, 5, 10]);
  });
});

describe("follow", () => {
  it("goes part of the way", () => expect(follow(0, 10, 0.5)).toBe(5));
  it("takes a value with no price at once, in and out", () => {
    expect(follow(NaN, 10, 0.1)).toBe(10);
    expect(follow(10, NaN, 0.1)).toBeNaN();
  });
});

describe("mergeTicks", () => {
  const still = (value: number) => ({ value, phase: "still" as const });
  it("keeps, adds and lets go", () => {
    expect(mergeTicks([still(1), still(2)], [2, 3])).toEqual([{ value: 1, phase: "out" }, still(2), { value: 3, phase: "in" }]);
  });
  it("brings a tick on its way out back", () => {
    expect(mergeTicks([{ value: 1, phase: "out" }], [1])).toEqual([{ value: 1, phase: "in" }]);
  });
});

describe("cssMs", () => {
  it("reads both ways of writing a duration", () => {
    expect(cssMs("400ms")).toBe(400);
    expect(cssMs(".4s")).toBeCloseTo(400);
    expect(cssMs(" 0.4s ")).toBeCloseTo(400);
  });
  it("is zero for none or nothing", () => {
    expect(cssMs("0ms")).toBe(0);
    expect(cssMs("0s")).toBe(0);
    expect(cssMs("")).toBe(0);
  });
});

describe("valueOn beside a year with no price", () => {
  it("reads a point exactly, whatever stands before it", () => {
    expect(valueOn([{ year: 0, v: NaN }, { year: 1, v: 5 }], 1)).toBe(5);
  });
});
