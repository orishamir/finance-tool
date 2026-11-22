// P-05's slider ranges (data-schema §3.2): a linear slider has a step, a money slider has segments instead, which grow from its min to its
// max, each a whole number of its steps, the last running to max with no end of its own; a linear slider's step likewise divides its range.
import { describe, expect, it } from "vitest";
import { sliderRange } from "../src/index.ts";

const vo = (value: number) => ({
  value,
  unit: "nis",
  source: { url: "docs/parameters-rationale.md#illustrative-scenario", title: "The site's choice", publisher: "founder", strength: "primary" },
  checked: "2026-11-22",
  effective_from: "2026-11-22",
  effective_to: null,
  update_rule: "founder",
  state: "sourced",
});
const money = (segments: { to?: number; step: number }[], max = 500_000) => ({
  min: vo(0),
  max: vo(max),
  segments: segments.map((s) => ({ ...(s.to !== undefined ? { to: vo(s.to) } : {}), step: vo(s.step) })),
});

describe("a slider's range", () => {
  it("accepts a linear slider with a step, and a money slider whose segments run from min to max", () => {
    expect(sliderRange.safeParse({ min: vo(1), max: vo(40), step: vo(1) }).success).toBe(true);
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 100_000, step: 5_000 }, { step: 25_000 }])).success).toBe(true);
  });
  it("refuses both a step and segments, or neither", () => {
    expect(sliderRange.safeParse({ ...money([{ step: 25_000 }]), step: vo(1_000) }).success).toBe(false);
    expect(sliderRange.safeParse({ min: vo(0), max: vo(10) }).success).toBe(false);
  });
  // each case below breaks one rule and keeps every other, so each refusal is held by its own check
  it("refuses a last segment with its own `to`, even one at max", () => {
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 100_000, step: 5_000 }, { to: 500_000, step: 25_000 }])).success).toBe(false);
  });
  it("refuses a segment before the last without its `to`", () => {
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { step: 5_000 }, { step: 25_000 }])).success).toBe(false);
  });
  it("refuses a segment that does not grow", () => {
    // 20,000 down to 10,000 is a whole number of steps of 1,000, and 10,000 to 500,000 is 49 steps of 10,000
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 10_000, step: 1_000 }, { step: 10_000 }])).success).toBe(false);
  });
  it("refuses a segment whose step is not above zero", () => {
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 0 }, { to: 100_000, step: 5_000 }, { step: 25_000 }])).success).toBe(false);
  });
  it("refuses a segment that is not a whole number of its steps", () => {
    // 20,000 to 100,000 is 11 and a bit steps of 7,000
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 100_000, step: 7_000 }, { step: 25_000 }])).success).toBe(false);
  });
  it("refuses a linear slider whose step is not above zero, whose max is not above its min, or that is not a whole number of its steps", () => {
    expect(sliderRange.safeParse({ min: vo(1), max: vo(40), step: vo(0) }).success).toBe(false);
    expect(sliderRange.safeParse({ min: vo(1), max: vo(40), step: vo(-1) }).success).toBe(false);
    expect(sliderRange.safeParse({ min: vo(40), max: vo(1), step: vo(1) }).success).toBe(false);
    expect(sliderRange.safeParse({ min: vo(0), max: vo(12), step: vo(5) }).success).toBe(false);
  });
});
