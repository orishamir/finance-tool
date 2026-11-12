import { describe, expect, it } from "vitest";
import { loadRuleUses, ruleProducts, ruleScores, ruleUseOf, scoreOf } from "./rule-uses.server";
import { feeDeal } from "../copy";
import { loadProducts } from "./data.server";

describe("rule uses", () => {
  it("TXI-03 is read by the engine and shown on at least one page", () => {
    const u = ruleUseOf("TXI-03");
    expect(u.engine).toBe(true);
    expect(u.pages.length).toBeGreaterThan(0);
    expect(u.pages.every((p) => p.href.startsWith("/") && p.label.length > 0)).toBe(true);
  });
  it("the fee page is a use of the rules its products' caps cite: a cap of one product opens a new deal of it, any other the page as it is", () => {
    const fees = Object.entries(loadRuleUses()).flatMap(([id, u]) => u.pages.filter((p) => p.label === feeDeal.title).map((p) => ({ id, href: p.href })));
    const capRules = new Set(loadProducts().flatMap((w) => (w.fee_bases_allowed.length > 0 ? Object.values(w.fee_caps ?? {}).flatMap((c) => c?.rule_ids ?? []) : [])));
    expect(fees.length).toBeGreaterThan(0);
    expect(fees.filter((f) => !capRules.has(f.id))).toEqual([]);
    expect(fees.some((f) => /^\/deal\?wrapper=[a-z-]+$/.test(f.href))).toBe(true);
    for (const f of fees) if (f.href !== "/deal") expect(ruleProducts()[f.id]).toContain(f.href.split("=")[1]);
  });
  it("an unknown id has no uses", () => {
    expect(ruleUseOf("ZZZ-99")).toMatchObject({ pages: [], engine: false, collections: {}, score: 0 });
    expect(loadRuleUses(["ZZZ-99"])).toEqual({});
  });
  it("every rule has a score", () => {
    const s = ruleScores();
    expect(Object.keys(s).length).toBeGreaterThan(400);
    expect(s["TXG-02"]!).toBeGreaterThan(0);
  });
  it("scores as the spec says", () => {
    expect(scoreOf({ figures: { a: { value: 1 } as never }, il_finance_file: "tax-general.md", strength: "primary", likely_to_change: "yes" }, 2, 3, 4)).toBe(6 + 3 + 4 + 2 + 1 + 1 + 1);
    expect(scoreOf({ il_finance_file: "corporate-bonds.md", strength: "secondary", likely_to_change: "no" }, 0, 0, 0)).toBe(0);
  });
});
