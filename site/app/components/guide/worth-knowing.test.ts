import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { isCapName, worthRows } from "./worth-knowing";

const rule = (id: string, extra: object = {}) => ({ id, title_he: `כלל ${id}`, strength: "primary", ...extra }) as unknown as RuleRecord;

describe("worthRows", () => {
  it("skips missing rules and rules without a Hebrew title, caps at three", () => {
    const rules = { A: rule("A"), B: rule("B", { title_he: undefined }), C: rule("C"), D: rule("D"), E: rule("E") };
    expect(worthRows(["A", "X", "B", "C", "D", "E"], rules, "2026-10-24").map((r) => r.id)).toEqual(["A", "C", "D"]);
    expect(worthRows(undefined, rules, "2026-10-24")).toEqual([]);
  });
  it("marks a cap figure, by its name, to be shown with \"עד\" (2026-10-26, CS-18 after 21)", () => {
    const fig = (value: number) => ({ value, unit: "pct_per_year", source: { url: "https://x", title: "t", publisher: "p", strength: "primary" }, checked: "2026-10-24", effective_from: null, effective_to: null, tax_year: null, update_rule: "fixed", rule_ids: ["A"], state: "sourced" });
    const rows = worthRows(["A", "B", "C"], { A: rule("A", { figures: { balance_cap_after_21: fig(1.05) } }), B: rule("B", { figures: { rate: fig(25) } }), C: rule("C", { figures: { capital_multiplier: fig(180) } }) }, "2026-10-24");
    expect(rows.map((r) => r.upTo)).toEqual([true, false, false]);
  });
  it("does not read a minimum or a market capitalisation as a cap (review 2026-10-26)", () => {
    expect(isCapName("balance_cap_after_21")).toBe(true);
    expect(isCapName("cap")).toBe(true);
    expect(isCapName("min_market_cap_usd")).toBe(false);
    expect(isCapName("market_cap_coverage")).toBe(false);
    expect(isCapName("rimon_market_cap_rank")).toBe(false);
    expect(isCapName("min_order_cap")).toBe(false);
    expect(isCapName("capital_multiplier")).toBe(false);
  });
  it("marks weak strength", () => {
    expect(worthRows(["A"], { A: rule("A", { strength: "secondary" }) }, "2026-10-24")[0]!.weak).toBe("secondary");
  });
});
