import { describe, expect, it } from "vitest";
import { ruleRecord, valueObject } from "../src/index.ts";

const sourced = {
  value: 1.05,
  unit: "pct_per_year",
  source: { url: "https://example.org/reg", title: "reg. 2(a)", publisher: "Knesset", strength: "primary-mirror" },
  checked: "2026-10-22",
  effective_from: "2014-01-01",
  effective_to: null,
  update_rule: "fixed in regulation",
  rule_ids: ["PF-02"],
  state: "sourced",
};

describe("value object (data-schema §1)", () => {
  it("accepts a sourced value", () => {
    expect(valueObject.safeParse(sourced).success).toBe(true);
  });

  it("rejects a value without a source", () => {
    const { source: _, ...bare } = sourced;
    expect(valueObject.safeParse(bare).success).toBe(false);
  });

  it("requires notes when the value is unknown", () => {
    expect(valueObject.safeParse({ ...sourced, value: null }).success).toBe(false);
    expect(valueObject.safeParse({ ...sourced, value: null, notes: "not published" }).success).toBe(true);
  });

  it("requires computed_from on a computed value", () => {
    expect(valueObject.safeParse({ ...sourced, state: "computed" }).success).toBe(false);
  });

  it("accepts frozen update rules only with their years", () => {
    expect(valueObject.safeParse({ ...sourced, update_rule: "frozen 2025-2027" }).success).toBe(true);
    expect(valueObject.safeParse({ ...sourced, update_rule: "frozen" }).success).toBe(false);
  });
});

describe("rule record (data-schema §3.1)", () => {
  const rule = {
    id: "PF-02",
    title: "Fee caps",
    strength: "primary",
    dimensions: ["fee-management-balance"],
    likely_to_change: "no",
    figures: { balance_cap: sourced },
    il_finance_file: "provident-family-common.md",
    checked: "2026-10-22",
    scope: "general",
  };

  it("accepts a rule with figures", () => {
    expect(ruleRecord.safeParse(rule).success).toBe(true);
  });

  it("rejects figures on an open rule", () => {
    expect(ruleRecord.safeParse({ ...rule, strength: "open" }).success).toBe(false);
  });

  it("requires a recheck date when the rule is likely to change", () => {
    expect(ruleRecord.safeParse({ ...rule, likely_to_change: "yes" }).success).toBe(false);
  });

  // D30 (spec 2026-10-25-rules-scope §3): every rule says who it applies to
  it("requires a scope, and the fields each scope needs", () => {
    const { scope: _drop, ...noScope } = rule;
    expect(ruleRecord.safeParse(noScope).success).toBe(false);
    const harel = [{ id: "harel", name_he: "הראל" }];
    expect(ruleRecord.safeParse({ ...rule, scope: "institution" }).success).toBe(false);
    expect(ruleRecord.safeParse({ ...rule, scope: "institution", scope_institutions: harel }).success).toBe(true);
    expect(ruleRecord.safeParse({ ...rule, scope: "unsettled" }).success).toBe(false);
    expect(ruleRecord.safeParse({ ...rule, scope: "unsettled", scope_settle: "a CMA circular" }).success).toBe(true);
    expect(ruleRecord.safeParse({ ...rule, scope: "unsettled", scope_settle: "a CMA circular", scope_institutions: harel }).success).toBe(true);
    expect(ruleRecord.safeParse({ ...rule, scope_institutions: harel }).success).toBe(false);
    expect(ruleRecord.safeParse({ ...rule, scope_settle: "x" }).success).toBe(false);
  });
});
