// The guide's exit step mark (2026-11-07, second check): a rate that is the site's reading is tagged ReadingTag, never "מקור משני",
// whatever strength reaches the step; guard 16's regex sees only a literal strength="secondary", so the decision is tested here.
import { describe, expect, it } from "vitest";
import { exitRateLines, exitStepMark } from "./exit-step";

const rate = (strength: "primary" | "secondary" | "institution", reading?: true) => ({ ...(reading ? { reading } : {}), value: { source: { strength } } });

describe("the guide's exit step mark", () => {
  it("the child-savings bank route's TXK-29 rates are the site's reading", () => {
    const lines = exitRateLines("F-50").flat();
    expect(lines.filter((c) => c.rule === "TXK-29").every((c) => c.reading)).toBe(true);
    expect(lines.find((c) => c.rule === "TXK-23")?.reading).toBeUndefined();
  });
  it("a reading rate marks the step a reading", () => {
    expect(exitStepMark(null, [rate("primary"), rate("primary", true)])).toBe("reading");
  });
  it("a reading rate is never marked secondary, even when its source is a secondary one", () => {
    expect(exitStepMark(null, [rate("secondary", true)])).toBe("reading");
  });
  it("a rate that is not a reading and rests on a secondary source marks the step secondary", () => {
    expect(exitStepMark(null, [rate("secondary"), rate("primary", true)])).toBe("secondary");
  });
  it("a cited rule's own weak strength comes first", () => {
    expect(exitStepMark("institution", [rate("primary", true)])).toBe("institution");
  });
  it("no weak rule and no reading: no mark", () => {
    expect(exitStepMark(null, [rate("primary")])).toBeNull();
    expect(exitStepMark(null, [])).toBeNull();
  });
});
