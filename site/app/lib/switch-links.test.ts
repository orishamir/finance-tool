// Two internal links that led nowhere (research/audit/2026-10-25-link-check.md, section 7), checked against what the site really has.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadRules } from "./data.server";
import { SWITCH_RULES_HREF } from "./playbook";
import { shelfOf } from "./rule-shelves";
import { lightHaystack, matchRules, norm, parseFilters, type LightRule } from "./rules-filter";

describe("the switch page's link to the rules about switching", () => {
  const url = new URL(SWITCH_RULES_HREF, "https://site.test");

  it("opens a page the site has, and names no anchor (group anchors are <shelf>-<file>, the old one is gone)", () => {
    const routes = readFileSync(new URL("../routes.ts", import.meta.url), "utf8");
    expect(routes).toContain(`route("rules", "routes/rules.tsx")`);
    expect(url.pathname).toBe("/rules");
    expect(url.hash).toBe("");
    expect(SWITCH_RULES_HREF).not.toContain("switching-and-transfers");
  });

  it("lands on the rules of the switching file, all of them and nothing else", () => {
    const all = Object.values(loadRules());
    const light: LightRule[] = all.map((r) => ({ id: r.id, title: r.id, shelf: shelfOf(r), file: r.il_finance_file, strength: r.strength, score: 0, prefix: r.id.split("-")[0]!, products: [] }));
    const hay = { light: new Map(light.map((r) => [r.id, lightHaystack(r)])), full: new Map<string, string>() };
    const filters = parseFilters(url.search);
    expect(filters.prefix).toBeTruthy();
    const hits = matchRules(light, filters, hay);
    const switching = all.filter((r) => r.il_finance_file === "switching-and-transfers.md").map((r) => r.id).sort();
    expect(switching.length).toBeGreaterThan(30);
    expect(hits.map((r) => r.id).sort()).toEqual(switching);
    expect(norm(filters.q)).toBe("");
  });

  it("every rule the switch pages cite from the switching file is among the matches", () => {
    const all = Object.values(loadRules());
    const prefixed = new Set(all.filter((r) => r.id.startsWith(`${parseFilters(url.search).prefix}-`)).map((r) => r.id));
    for (const id of ["SW-02", "SW-03", "SW-05", "SW-07", "SW-09", "SW-18"]) expect(prefixed.has(id), id).toBe(true);
  });
});
