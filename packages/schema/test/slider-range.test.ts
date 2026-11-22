// P-05's slider ranges (data-schema §3.2): a linear slider has a step, a money slider has segments instead, which grow from its min to its
// max, each a whole number of its steps, the last running to max with no end of its own.
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
  it("refuses a segment that is not a whole number of its steps, one that does not grow, and a last segment with its own end", () => {
    expect(sliderRange.safeParse(money([{ to: 1_500, step: 1_000 }, { step: 25_000 }])).success).toBe(false);
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 10_000, step: 1_000 }, { step: 25_000 }])).success).toBe(false);
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { to: 500_000, step: 25_000 }])).success).toBe(false);
    expect(sliderRange.safeParse(money([{ to: 20_000, step: 1_000 }, { step: 70_000 }])).success).toBe(false);
  });
});
