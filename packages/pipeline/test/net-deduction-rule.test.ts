// data-schema §3.4 `net_deduction_rule` (method F-133): the rule an exposure names for its net index's deduction exists and holds a
// numeric figure for each company country its dividend parts name.
import { describe, expect, it } from "vitest";
import { checkNetDeductionRule } from "../src/index.ts";

const vo = (value: number, unit: string) => ({ value, unit, source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary" }, checked: "2026-11-28", state: "sourced" });
const withUs = { id: "index-x", us_dividends: { yield: vo(1.13, "pct_per_year"), weight: vo(72.77, "pct") } } as never;
const rules = new Map([["TXF-59", { figures: { us: { value: 30 } } }], ["TXF-00", { figures: { uk: { value: 0 } } }], ["TXF-01", { figures: { us: { value: null } } }]]);

describe("checkNetDeductionRule", () => {
  it("passes an index whose rule holds a rate for each country of its parts, and one that names no rule", () => {
    expect(checkNetDeductionRule({ ...(withUs as object), net_deduction_rule: "TXF-59" } as never, rules)).toEqual([]);
    expect(checkNetDeductionRule(withUs, rules)).toEqual([]);
  });
  it("fails a rule with no record, and one with no numeric figure for a country the parts name", () => {
    expect(checkNetDeductionRule({ ...(withUs as object), net_deduction_rule: "TXF-99" } as never, rules)[0]).toMatch(/no rule record/);
    expect(checkNetDeductionRule({ ...(withUs as object), net_deduction_rule: "TXF-00" } as never, rules)[0]).toMatch(/no numeric figure "us"/);
    expect(checkNetDeductionRule({ ...(withUs as object), net_deduction_rule: "TXF-01" } as never, rules)[0]).toMatch(/no numeric figure "us"/);
  });
});
