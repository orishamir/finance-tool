// The range field as the reader meets it: a slider that runs left to right with no values at its ends, a reset that says "איפוס" and
// names its value only in its spoken name, a box without a unit the caller says the label names, and a typed amount off the steps that stands at
// its own place on the track and in the box as typed.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RangeField, type RangeFieldProps } from "./fields";
import { linearScale, steppedScale } from "./slider-scale";

const amountScale = steppedScale(0, [
  { to: 20_000, step: 1_000 },
  { to: 100_000, step: 5_000 },
  { to: 500_000, step: 25_000 },
]);
const base = { validate: () => null, onCommit: () => undefined, onReset: () => undefined };
const render = (props: RangeFieldProps) => renderToStaticMarkup(createElement(RangeField, props));
const amount = (value: number) => render({ ...base, label: "סכום היום", unit: "nis", value, start: 10_000, isEntered: value !== 10_000, scale: amountScale });
const years = (label: string, unitInLabel = false) => render({ ...base, label, unit: "years", unitInLabel, value: 10, start: 10, isEntered: false, scale: linearScale({ min: 1, max: 40, step: 1 }) });
const rangeInput = (html: string) => html.match(/<input type="range"[^>]*>/)?.[0] ?? "";
const resetButton = (html: string) => html.match(/<button[^>]*>(?:(?!<\/button>).)*<\/button>/)?.[0] ?? "";

describe("the range field", () => {
  it("runs its slider left to right inside the right-to-left page", () => {
    expect(rangeInput(amount(10_000))).toMatch(/\bdir="ltr"/);
  });
  it("writes no value at the slider's ends", () => {
    expect(amount(10_000)).not.toContain("500,000");
    expect(years("שנים")).not.toContain("40");
  });
  it("says ↺ איפוס with no figure, and names the value it returns to only in its spoken name, isolated", () => {
    const reset = resetButton(amount(25_000));
    expect(reset).toContain(">איפוס<");
    expect(reset).not.toContain("חזרה ל־");
    expect(reset.replace(/aria-label="[^"]*"/, "")).not.toContain("10,000");
    expect(reset).toMatch(/aria-label="איפוס ל־⁨10,000\s₪⁩"/);
  });
  it("leaves the unit out of the box where the caller says the label names it, and keeps it otherwise", () => {
    const count = (s: string, word: string) => s.split(word).length - 1;
    // the label is written twice (shown, and on the box for a screen reader); the box adds the unit once unless `unitInLabel` is set
    expect(count(years("שנים", true), "שנים")).toBe(2);
    expect(count(years("תקופה"), "שנים")).toBe(1);
    // the label's words are not searched: a label that holds the unit's word keeps the unit in the box without `unitInLabel`
    expect(count(years("שנים"), "שנים")).toBe(3);
    expect(amount(10_000)).toContain("₪");
  });
  it("puts a typed 750 at 750's own place on the track, not at a step's, and shows 750 in the box", () => {
    const out = amount(750);
    const place = Number(rangeInput(out).match(/\bvalue="([^"]*)"/)?.[1]);
    // 750 is 0.75 of the first 1,000 step, in a first third that runs 0 to 20,000
    expect(place).toBeCloseTo(750 / 20_000 / 3, 12);
    expect(out).toMatch(/<input[^>]*type="text"[^>]*value="750"/);
    expect(rangeInput(out)).toMatch(/aria-valuetext="750\s₪"/);
  });
});
