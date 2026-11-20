// A figure gliding to a new value (provenance.tsx `landingOf`, `glideFrame`): one that lands on a whole number glides through whole numbers,
// one written with decimals glides through them, so a computed percent never shows "0%" on its way (seen on /deal on 2026-11-21: a 35%
// discount on a 0.1% price read "0% מכל קנייה" for a moment before 0.065%).
import { describe, expect, it } from "vitest";
import { glideFrame, landingOf } from "./provenance";
import { sumDisplay } from "./fee-deal/words";
import type { SiteValue } from "../lib/value";

const computed = (value: number, unit: string) => ({ value, unit, state: "computed" }) as unknown as SiteValue;
const written = (n: number) => `${n}%`;

describe("a gliding figure", () => {
  it("a computed percent, which the money formatter has no form for, glides through its decimals", () => {
    const v = computed(0.065, "pct_of_trade");
    const landing = landingOf(0.065, 0.081, sumDisplay(v), written);
    expect(landing).toBe("0.065%");
    expect(glideFrame(0.081, landing)).toBe(0.081);
  });
  it("a sum that lands on whole shekels glides through whole shekels", () => {
    const v = computed(120, "nis");
    const landing = landingOf(120, 97.4, sumDisplay(v), written);
    expect(glideFrame(97.4, landing)).toBe(97);
  });
  it("a figure that has landed shows its value", () => {
    expect(landingOf(0.065, 0.065, undefined, written)).toBeNull();
    expect(glideFrame(0.065, null)).toBe(0.065);
  });
});
