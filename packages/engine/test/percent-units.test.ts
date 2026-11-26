// One list of the units whose number is a percent (`PERCENT_UNITS`), read by the engine's figure resolver and by the site's formatting and
// worked lines: it holds every percent unit of data-schema §2's list and nothing else.
import { describe, expect, it } from "vitest";
import { unit } from "@finance-tool/schema";
import { PERCENT_UNITS, ruleBook } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

describe("the percent units", () => {
  it("hold every percent unit of the schema's unit list, and only units of that list", () => {
    const percent = unit.options.filter((u) => u.startsWith("pct"));
    expect(percent.length).toBeGreaterThan(0);
    for (const u of percent) expect(PERCENT_UNITS.has(u), u).toBe(true);
    for (const u of PERCENT_UNITS) expect(percent, u).toContain(u);
  });

  it("are what the resolver reads a rate in, as a fraction", () => {
    const rules = loadRules();
    const rule = rules.find((r) => r.id === "TXS-09")!;
    const figure = rule.figures!["rate"] as Record<string, unknown>;
    const effective = rules.map((r) => (r.id === "TXS-09" ? { ...r, figures: { ...r.figures, rate: { ...figure, unit: "pct_per_year_effective" } } } : r)) as typeof rules;
    expect(ruleBook(context(effective)).rate("TXS-09", "rate")).toBe(ruleBook(context(rules)).rate("TXS-09", "rate"));
  });
});
