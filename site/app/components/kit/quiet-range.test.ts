// The quiet range field as the reader meets it: a slider that runs left to right with no values at its ends, a reset that says "איפוס" and
// names its value only in its spoken name, a box without a unit the label already names, and a typed amount off the steps that stands at
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
const amount = (value: number) => render({ ...base, label: "סכום היום", unit: "nis", value, start: 10_000, isEntered: value !== 10_000, variant: "quiet", scale: amountScale });
const rangeInput = (html: string) => html.match(/<input type="range"[^>]*>/)?.[0] ?? "";
const resetButton = (html: string) => html.match(/<button[^>]*>(?:(?!<\/button>).)*<\/button>/)?.[0] ?? "";

describe("the quiet range field", () => {
  it("runs its slider left to right inside the right-to-left page", () => {
    expect(rangeInput(amount(10_000))).toMatch(/\bdir="ltr"/);
  });
  it("writes no value at the slider's ends", () => {
    const out = amount(10_000);
    expect(out).not.toContain("500,000");
    expect(render({ ...base, label: "שנים", unit: "years", value: 10, start: 10, isEntered: false, min: 1, max: 40, step: 1 })).toContain("40");
    expect(render({ ...base, label: "שנים", unit: "years", value: 10, start: 10, isEntered: false, variant: "quiet", scale: linearScale({ min: 1, max: 40, step: 1 }) })).not.toContain("40");
  });
  it("says ↺ איפוס with no figure, and names the value it returns to only in its spoken name, isolated", () => {
    const reset = resetButton(amount(25_000));
    expect(reset).toContain(">איפוס<");
    expect(reset).not.toContain("חזרה ל־");
    expect(reset.replace(/aria-label="[^"]*"/, "")).not.toContain("10,000");
    expect(reset).toMatch(/aria-label="איפוס ל־⁨10,000\s₪⁩"/);
  });
  it("leaves the unit out of the box where the label names it, and keeps it where the label does not", () => {
    const count = (s: string, word: string) => s.split(word).length - 1;
    const years = (variant: "ends" | "quiet") =>
      variant === "quiet"
        ? render({ ...base, label: "שנים", unit: "years", value: 10, start: 10, isEntered: false, variant, scale: linearScale({ min: 1, max: 40, step: 1 }) })
        : render({ ...base, label: "שנים", unit: "years", value: 10, start: 10, isEntered: false, variant, min: 1, max: 40, step: 1 });
    // the label is written twice in both (shown, and on the box for a screen reader); the ends field adds the unit in its box
    expect(count(years("ends"), "שנים")).toBe(3);
    expect(count(years("quiet"), "שנים")).toBe(2);
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
