import { describe, expect, it } from "vitest";
import { MIN_SPAN, canZoomYears, domainOf, pickYear, viewFromDrag, viewFromWheel } from "./chart-zoom";

describe("domainOf", () => {
  it("is the whole range with no view", () => {
    expect(domainOf(null, 0, 30, false)).toEqual([0, 30]);
  });
  it("draws half a year around each bar", () => {
    expect(domainOf({ lo: 2015, hi: 2020 }, 2000, 2025, true)).toEqual([2014.5, 2020.5]);
  });
  it("keeps an exit month between whole years at the end of a view that reaches it", () => {
    expect(domainOf({ lo: 5, hi: 10 }, 0, 10.5, false)).toEqual([5, 10.5]);
  });
});

describe("pickYear", () => {
  it("reads the nearest whole year", () => {
    expect(pickYear(50, 100, [0, 10], 0, 10)).toBe(5);
    expect(pickYear(54, 100, [0, 10], 0, 10)).toBe(5);
    expect(pickYear(56, 100, [0, 10], 0, 10)).toBe(6);
  });
  it("stays inside a zoomed view and inside the range", () => {
    expect(pickYear(-20, 100, [4, 8], 0, 10)).toBe(4);
    expect(pickYear(500, 100, [4, 8], 0, 10)).toBe(8);
  });
  it("never reads a year past an exit month", () => {
    expect(pickYear(100, 100, [0, 10.5], 0, 10.5)).toBe(10);
  });
});

describe("viewFromDrag", () => {
  it("takes the years between the two ends, whichever way the drag ran", () => {
    expect(viewFromDrag(20, 60, 100, [0, 10], 0, 10)).toEqual({ lo: 2, hi: 6 });
    expect(viewFromDrag(60, 20, 100, [0, 10], 0, 10)).toEqual({ lo: 2, hi: 6 });
  });
  it("reads a drag inside a zoomed view on that view's scale", () => {
    expect(viewFromDrag(0, 50, 100, [10, 20], 0, 30)).toEqual({ lo: 10, hi: 15 });
  });
  it("widens a short drag to the narrowest view and slides it inside the range", () => {
    expect(viewFromDrag(40, 42, 100, [0, 10], 0, 10)).toEqual({ lo: 4, hi: 4 + MIN_SPAN });
    expect(viewFromDrag(99, 100, 100, [0, 10], 0, 10)).toEqual({ lo: 10 - MIN_SPAN, hi: 10 });
  });
  it("does nothing on a range too short to zoom", () => {
    expect(canZoomYears(0, 2)).toBe(false);
    expect(viewFromDrag(0, 50, 100, [0, 2], 0, 2)).toBeNull();
  });
});

describe("viewFromWheel", () => {
  it("narrows around the year under the pointer", () => {
    const v = viewFromWheel(null, 20, true, 0, 40)!;
    expect(v.hi - v.lo).toBe(32);
    expect(v.lo).toBe(4);
  });
  it("always moves, also on a short view", () => {
    expect(viewFromWheel({ lo: 2, hi: 5 }, 3, true, 0, 10)).toEqual({ lo: 2, hi: 4 });
    expect(viewFromWheel({ lo: 2, hi: 4 }, 3, false, 0, 10)).not.toEqual({ lo: 2, hi: 4 });
  });
  it("stops at the narrowest view", () => {
    const v = viewFromWheel({ lo: 2, hi: 2 + MIN_SPAN }, 3, true, 0, 10)!;
    expect(v.hi - v.lo).toBe(MIN_SPAN);
  });
  it("returns to the whole range when widened past it", () => {
    expect(viewFromWheel({ lo: 1, hi: 9 }, 5, false, 0, 10)).toBeNull();
  });
});
