import { describe, expect, it } from "vitest";
import { loadRuleUses, ruleScores, ruleUseOf, scoreOf } from "./rule-uses.server";

describe("rule uses", () => {
  // TXG-02 was the example until 2026-10-26; its only page, /holdings, is held for review (lib/review.ts)
  it("TXI-03 is read by the engine and shown on at least one page", () => {
    const u = ruleUseOf("TXI-03");
    expect(u.engine).toBe(true);
    expect(u.pages.length).toBeGreaterThan(0);
    expect(u.pages.every((p) => p.href.startsWith("/") && p.label.length > 0)).toBe(true);
  });
  it("a page held for review is not a use", () => {
    expect(ruleUseOf("TXG-02").pages.some((p) => p.href === "/holdings")).toBe(false);
  });
  it("an unknown id has no uses", () => {
    expect(ruleUseOf("ZZZ-99")).toMatchObject({ pages: [], engine: false, collections: {}, score: 0 });
    expect(loadRuleUses(["ZZZ-99"])).toEqual({});
  });
  it("every rule has a score", () => {
    const s = ruleScores();
    expect(Object.keys(s).length).toBeGreaterThan(400);
    expect(s["TXG-02"]!).toBeGreaterThan(s["SW-X01"] ?? 0);
  });
  it("scores as the spec says", () => {
    expect(scoreOf({ figures: { a: { value: 1 } as never }, il_finance_file: "tax-general.md", strength: "primary", likely_to_change: "yes" }, 2, 3, 4)).toBe(6 + 3 + 4 + 2 + 1 + 1 + 1);
    expect(scoreOf({ il_finance_file: "corporate-bonds.md", strength: "secondary", likely_to_change: "no" }, 0, 0, 0)).toBe(0);
  });
});
