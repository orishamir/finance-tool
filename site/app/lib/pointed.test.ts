// Every chip on a rule card opens its record (reviews, 2026-10-26): on /guide/brokerage-account BRK-35's "לדוגמה" chip opened an
// empty card, because BRK-51 was not in the page's data; then a probe found 24 figure chips (TXG-04's figures cite TXG-02 and TXG-03)
// that did the same. A card's chips are its record's `derived_from` and `examples`, and every `rule_ids` inside its figures (each
// figure opens a value sheet that shows them); each page that shows cards passes the records they point at as `pointed`
// (`pointedRecords`). This walks the pages' data: for every record a page holds (its own rules and the pointed ones), every chip its
// card or its figures can show opens a record the page holds. The chips are read from the record here, not through `pointedIds`.
import { describe, expect, it } from "vitest";
import { wrapperId, type RuleRecord } from "@finance-tool/schema";
import { loadCma, loadRules } from "./data.server";
import { buildExposurePage, buildGuidePage } from "./guide.server";
import { buildInstitution, institutionIds } from "./institutions.server";
import { loadExposures } from "./instruments.server";
import { playbookPage } from "./playbook.server";
import { playbookWrappers } from "./playbook";
import { compareBundle, goalFormData } from "./compare.server";
import { workbenchBundle } from "./providers.server";
import { buildHoldingsBundle } from "./holdings.server";
import { buildFeesData } from "./fees.server";
import { loader as guideLoader } from "../routes/guide";
import { loader as questionsLoader } from "../routes/questions";
import { loader as companiesLoader } from "../routes/companies";
import { loader as companyLoader } from "../routes/company";
import { loader as notCoveredLoader } from "../routes/not-covered";
import { loader as idleLoader } from "../routes/idle-cash";
import { shelfBundle } from "./rule-uses.server";
import { shelfIds } from "./rule-shelves";

const all = loadRules();
type Map_ = Record<string, RuleRecord>;
const asMap = (x: Map_ | readonly RuleRecord[] | undefined): Map_ => (Array.isArray(x) ? Object.fromEntries(x.map((r) => [r.id, r])) : ((x as Map_ | undefined) ?? {}));

/** Every `rule_ids` anywhere inside a node (a figure, a bracket, a tax year's value). */
function ruleIdsIn(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(ruleIdsIn);
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([k, v]) => (k === "rule_ids" && Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : ruleIdsIn(v)));
}

/** The chips a record's card can show: its derivations and examples, and the rules its figures' sheets name. */
const chipsOf = (r: RuleRecord): string[] => [...new Set([...(r.derived_from ?? []), ...(r.examples ?? []), ...ruleIdsIn(r.figures)])].filter((id) => id !== r.id);

/** The chips of the page's cards whose record the page does not hold: "BRK-35 → BRK-51". */
function unopened(rules: Map_ | readonly RuleRecord[] | undefined, pointed: Map_ | readonly RuleRecord[] | undefined): string[] {
  const have = { ...asMap(rules), ...asMap(pointed) };
  return Object.values(have).flatMap((r) => chipsOf(r).filter((id) => all[id] && !have[id]).map((id) => `${r.id} → ${id}`));
}

describe("every chip on a page's rule cards opens its record", () => {
  it("the chips are read from the figures too: TXG-04's figures name TXG-02 and TXG-03", () => {
    expect(chipsOf(all["TXG-04"]!)).toEqual(expect.arrayContaining(["TXG-02", "TXG-03"]));
  });

  it("the brokerage guide holds BRK-51, the example BRK-35's card names", async () => {
    const d = (await guideLoader({ params: { id: "brokerage-account" } } as never)) as { rules: Map_; pointed: Map_ };
    expect(d.rules["BRK-35"]?.examples).toContain("BRK-51");
    expect(d.pointed["BRK-51"] ?? d.rules["BRK-51"]).toBeDefined();
  }, 60000);

  it("guide pages", async () => {
    const bad: string[] = [];
    for (const id of wrapperId.options) {
      if (!buildGuidePage(id)) continue;
      const d = (await guideLoader({ params: { id } } as never)) as { rules: Map_; pointed: Map_ };
      bad.push(...unopened(d.rules, d.pointed).map((x) => `${id}: ${x}`));
    }
    expect(bad).toEqual([]);
  }, 300000);

  it("exposure pages", () => {
    const bad = loadExposures().flatMap((e) => {
      const d = buildExposurePage(e.id);
      return d ? unopened(d.rules, d.pointed).map((x) => `${e.id}: ${x}`) : [];
    });
    expect(bad).toEqual([]);
  }, 120000);

  it("company pages and /companies", async () => {
    const bad: string[] = [];
    for (const id of institutionIds()) {
      const d = buildInstitution(id);
      if (d) bad.push(...unopened(d.rules, d.pointed).map((x) => `${id}: ${x}`));
    }
    for (const c of loadCma().companies) {
      const d = (await companyLoader({ params: { id: c.id } } as never)) as { kind: string; companyTerms?: { rules: Map_; pointed: Map_ } };
      if (d.kind === "company" && d.companyTerms) bad.push(...unopened(d.companyTerms.rules, d.companyTerms.pointed).map((x) => `${c.id}: ${x}`));
    }
    const d = (await companiesLoader()) as { rules: Map_; pointed: Map_ };
    bad.push(...unopened(d.rules, d.pointed).map((x) => `/companies: ${x}`));
    expect(bad).toEqual([]);
  }, 300000);

  it("the questions page, the rules shelves, the not-covered page, idle cash and the goal form", async () => {
    const q = (await questionsLoader()) as { rules: Map_; pointed: Map_ };
    const n = (await notCoveredLoader()) as { rules: Map_; pointed: Map_ };
    const i = (await idleLoader()) as { rules: Map_; pointed: Map_ };
    const g = goalFormData();
    const shelves = shelfIds.flatMap((s) => unopened(shelfBundle(s).rules, {}).map((x) => `${s}: ${x}`));
    expect([...unopened(q.rules, q.pointed), ...unopened(n.rules, n.pointed), ...unopened(i.rules, i.pointed), ...unopened(g.rules as Map_, g.pointed as Map_), ...shelves]).toEqual([]);
  }, 120000);

  it("the playbooks", () => {
    const bad = playbookWrappers.flatMap((w) => {
      const d = playbookPage(w);
      return d ? unopened(d.rules, d.pointed).map((x) => `${w}: ${x}`) : [];
    });
    expect(bad).toEqual([]);
  }, 120000);

  it("the bundles the comparison, the workbenches, holdings and fees read", () => {
    const c = compareBundle();
    const w = workbenchBundle();
    const h = buildHoldingsBundle();
    const f = buildFeesData();
    expect([...unopened(c.rules, c.pointed), ...unopened(w.rules, w.pointed), ...unopened(h.rules, h.pointed), ...unopened(f.rules, f.pointed)]).toEqual([]);
  }, 300000);
});
