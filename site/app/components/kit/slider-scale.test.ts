// A slider's scale both ways: a value to its place on the track and a place back to the nearest step, a value off the steps standing at its
// own exact place, and the keys' next step. The expected places are worked by hand from the segments: each segment is an equal part of the
// track, and a value's place inside its segment is its share of that segment's length.
import { describe, expect, it } from "vitest";
import { keyValue, linearScale, placeOf, rangeScale, stepFrom, steppedScale, valueAt } from "./slider-scale";

// the amount today: three thirds, 0 to 20,000 by 1,000, to 100,000 by 5,000, to 500,000 by 25,000
const amount = steppedScale(0, [
  { to: 20_000, step: 1_000 },
  { to: 100_000, step: 5_000 },
  { to: 500_000, step: 25_000 },
]);
// the monthly deposit: the same shape over 0 to 10,000
const monthly = steppedScale(0, [
  { to: 1_000, step: 50 },
  { to: 3_000, step: 100 },
  { to: 10_000, step: 500 },
]);
const years = linearScale({ min: 1, max: 40, step: 1 });
const ret = linearScale({ min: 0, max: 12, step: 0.5 });

describe("a value's place on the track", () => {
  it("puts each segment on its own third", () => {
    expect(placeOf(amount, 0)).toBe(0);
    expect(placeOf(amount, 20_000)).toBeCloseTo(1 / 3, 12);
    expect(placeOf(amount, 100_000)).toBeCloseTo(2 / 3, 12);
    expect(placeOf(amount, 500_000)).toBe(1);
  });
  it("puts 10,000 a sixth of the way along, halfway through the first third", () => {
    expect(placeOf(amount, 10_000)).toBeCloseTo(1 / 6, 12);
    expect(placeOf(monthly, 500)).toBeCloseTo(1 / 6, 12);
  });
  it("is linear inside a segment: 300,000 is halfway through the last third", () => {
    expect(placeOf(amount, 300_000)).toBeCloseTo(2.5 / 3, 12);
    expect(placeOf(monthly, 2_000)).toBeCloseTo(1.5 / 3, 12);
  });
  it("gives a typed value off the steps its own exact place: 750 is 0.75 of a 1,000 step into a 20,000 third", () => {
    expect(placeOf(amount, 750)).toBeCloseTo(750 / 20_000 / 3, 12);
    expect(placeOf(amount, 750)).not.toBeCloseTo(placeOf(amount, 1_000), 6);
    expect(placeOf(amount, 750)).not.toBeCloseTo(placeOf(amount, 0), 6);
  });
  it("stands a value past either end at that end", () => {
    expect(placeOf(amount, 2_000_000)).toBe(1);
    expect(placeOf(amount, -5)).toBe(0);
    expect(placeOf(years, 0)).toBe(0);
  });
  it("is the plain share of the range on a linear scale", () => {
    expect(placeOf(years, 10)).toBeCloseTo(9 / 39, 12);
    expect(placeOf(ret, 7)).toBeCloseTo(7 / 12, 12);
    expect(placeOf(ret, 7.25)).toBeCloseTo(7.25 / 12, 12);
  });
});

describe("a place on the track back to a value", () => {
  it("gives back every step at its own place", () => {
    for (const scale of [amount, monthly, years, ret]) {
      for (const s of scale.segments) {
        for (let v = s.from; v <= s.to; v += s.step) expect(valueAt(scale, placeOf(scale, v))).toBe(v);
      }
    }
  });
  it("gives the nearest step of the segment the place falls in", () => {
    expect(valueAt(amount, 1 / 6)).toBe(10_000);
    expect(valueAt(amount, 1 / 6 + 0.2 / 60)).toBe(10_000);
    expect(valueAt(amount, 1 / 6 + 0.6 / 60)).toBe(11_000);
    expect(valueAt(amount, 1 / 3 + 0.05 / 3)).toBe(25_000);
    expect(valueAt(amount, 1 / 3 + 0.2 / 3)).toBe(35_000);
    expect(valueAt(ret, 7.2 / 12)).toBe(7);
    expect(valueAt(ret, 7.3 / 12)).toBe(7.5);
  });
  it("moves a value off the steps to the nearest step once the hand drags it: 750 to 1,000", () => {
    expect(valueAt(amount, placeOf(amount, 750))).toBe(1_000);
  });
  it("gives the ends past the track", () => {
    expect(valueAt(amount, -0.1)).toBe(0);
    expect(valueAt(amount, 1.2)).toBe(500_000);
  });
});

describe("the keys' next step", () => {
  it("moves one step of the segment the value is in, and across a segment's end into the next one's steps", () => {
    expect(stepFrom(amount, 10_000, 1)).toBe(11_000);
    expect(stepFrom(amount, 10_000, -1)).toBe(9_000);
    expect(stepFrom(amount, 20_000, 1)).toBe(25_000);
    expect(stepFrom(amount, 20_000, -1)).toBe(19_000);
    expect(stepFrom(amount, 100_000, 1)).toBe(125_000);
    expect(stepFrom(amount, 100_000, -1)).toBe(95_000);
  });
  it("moves a value off the steps to the step beside it", () => {
    expect(stepFrom(amount, 750, 1)).toBe(1_000);
    expect(stepFrom(amount, 750, -1)).toBe(0);
    expect(stepFrom(ret, 7.25, 1)).toBe(7.5);
    expect(stepFrom(ret, 7.25, -1)).toBe(7);
  });
  it("stops at the ends, and brings a value past an end back to it", () => {
    expect(stepFrom(amount, 500_000, 1)).toBe(500_000);
    expect(stepFrom(amount, 0, -1)).toBe(0);
    expect(stepFrom(amount, 2_000_000, -1)).toBe(500_000);
    expect(stepFrom(years, 0, 1)).toBe(1);
  });
  it("leaves a value typed past an end alone on a step further out", () => {
    expect(stepFrom(amount, 2_000_000, 1)).toBe(2_000_000);
    expect(stepFrom(amount, -5, -1)).toBe(-5);
  });
});

describe("a key on the slider", () => {
  it("moves one step on an arrow, and to the end on Home and End", () => {
    expect(keyValue(amount, 10_000, "ArrowRight")).toBe(11_000);
    expect(keyValue(amount, 10_000, "ArrowUp")).toBe(11_000);
    expect(keyValue(amount, 10_000, "ArrowLeft")).toBe(9_000);
    expect(keyValue(amount, 10_000, "ArrowDown")).toBe(9_000);
    expect(keyValue(amount, 10_000, "Home")).toBe(0);
    expect(keyValue(amount, 10_000, "End")).toBe(500_000);
  });
  it("carries a tenth of the track on Page Up and Page Down, to the nearest step there", () => {
    // 475,000 is 15 of the last third's 16 steps of 25,000: 2/3 + 15/16/3 along; a tenth lower is 10.2 steps into that third, so 350,000
    expect(keyValue(amount, 475_000, "PageDown")).toBe(350_000);
    // 350,000 is 10 steps in: a tenth higher is 14.8 steps in, so 475,000
    expect(keyValue(amount, 350_000, "PageUp")).toBe(475_000);
  });
  it("moves at least one step on Page Up and Page Down where a tenth of the track is less than half a step", () => {
    // 0 to 10 by 5: from 5, at the track's middle, a tenth either way is a fifth of a step, which the nearest step would undo
    const coarse = linearScale({ min: 0, max: 10, step: 5 });
    expect(keyValue(coarse, 5, "PageUp")).toBe(10);
    expect(keyValue(coarse, 5, "PageDown")).toBe(0);
    expect(keyValue(coarse, 0, "PageUp")).toBe(5);
    expect(keyValue(coarse, 10, "PageDown")).toBe(5);
    expect(keyValue(coarse, 5, "ArrowRight")).toBe(10);
    expect(keyValue(coarse, 5, "ArrowLeft")).toBe(0);
  });
  it("stays at an end on a key further out", () => {
    for (const key of ["ArrowRight", "ArrowUp", "PageUp", "End"]) expect(keyValue(amount, 500_000, key)).toBe(500_000);
    for (const key of ["ArrowLeft", "ArrowDown", "PageDown", "Home"]) expect(keyValue(amount, 0, key)).toBe(0);
  });
  it("leaves a value typed past an end alone on a key further out, and brings it back inside on a key the other way", () => {
    for (const key of ["ArrowRight", "ArrowUp", "PageUp", "End"]) expect(keyValue(amount, 2_000_000, key)).toBe(2_000_000);
    for (const key of ["ArrowLeft", "ArrowDown", "PageDown", "Home"]) expect(keyValue(amount, -5, key)).toBe(-5);
    expect(keyValue(amount, 2_000_000, "ArrowLeft")).toBe(500_000);
    expect(keyValue(amount, 2_000_000, "Home")).toBe(0);
    expect(keyValue(years, 0, "ArrowRight")).toBe(1);
    expect(keyValue(years, 0, "End")).toBe(40);
  });
  it("takes no other key", () => {
    expect(keyValue(amount, 10_000, "Enter")).toBeNull();
  });
});

describe("a hand-written scale", () => {
  it("refuses a segment that is not a whole number of its steps, or does not grow", () => {
    expect(() => steppedScale(0, [{ to: 1_500, step: 1_000 }])).toThrow();
    expect(() => steppedScale(0, [{ to: 1_000, step: 100 }, { to: 900, step: 100 }])).toThrow();
    expect(() => steppedScale(0, [])).toThrow();
  });
});

describe("a scale from a range as the data writes it", () => {
  it("steps in its segments where it has them, else linearly in its step", () => {
    expect(rangeScale({ min: 0, max: 500_000, segments: [{ to: 20_000, step: 1_000 }, { to: 100_000, step: 5_000 }, { to: 500_000, step: 25_000 }] })).toEqual(amount);
    expect(rangeScale({ min: 1, max: 40, step: 1 })).toEqual(years);
  });
  it("refuses segments that end elsewhere than its max, and a range with neither a step nor segments", () => {
    expect(() => rangeScale({ min: 0, max: 400_000, segments: [{ to: 20_000, step: 1_000 }, { to: 500_000, step: 25_000 }] })).toThrow();
    expect(() => rangeScale({ min: 0, max: 10 })).toThrow();
  });
});
