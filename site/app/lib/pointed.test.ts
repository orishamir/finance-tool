// Every chip on a rule card opens its record: on /guide/brokerage-account BRK-35's "לדוגמה" chip opened an
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
import { indicesBundle } from "./providers.server";
import { buildFeesData } from "./fees.server";
import { loader as guideLoader } from "../routes/guide";
import { loader as companiesLoader } from "../routes/companies";
import { loader as companyLoader } from "../routes/company";
import { loader as notCoveredLoader } from "../routes/not-covered";
import { loader as indicesLoader } from "../routes/invest";
import { shelfBundle } from "./rule-uses.server";
import { shelfIds } from "./rule-shelves";
import { flags } from "../copy";
import { parseAnswer } from "./answer-slots";
import { buildInvest, indexById, pairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { entered } from "./value";

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

  it("the rules shelves and the not-covered page", async () => {
    const n = (await notCoveredLoader()) as { rules: Map_; pointed: Map_ };
    const shelves = shelfIds.flatMap((s) => unopened(shelfBundle(s).rules, {}).map((x) => `${s}: ${x}`));
    expect([...unopened(n.rules, n.pointed), ...shelves]).toEqual([]);
  }, 120000);

  it("the bundles the indices page and fees read, and the indices page's own rules beside its bundle's", async () => {
    const w = indicesBundle();
    const f = buildFeesData();
    // the indices page's rules are its loader's (the glossary cards' rules) and its bundle's, the records they point at its bundle's
    const page = await indicesLoader({ params: {} } as never);
    const own = Object.fromEntries([...page.feeRules, ...w.rules].map((r) => [r.id, r as RuleRecord]));
    expect([...unopened(w.rules, w.pointed), ...unopened(f.rules, f.pointed), ...unopened(own, w.pointed)]).toEqual([]);
  }, 300000);
});

/**
 * Every rule a figure's sheet names: its `rule_ids` (the source block, a blocked figure's rules), its `rulesUsed`, its labels' rules and
 * the {ID:figure} slots of its flags' words, anywhere inside a node (a computed figure's inputs are figures too).
 */
function citedIn(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(citedIn);
  if (node === null || typeof node !== "object") return [];
  const o = node as Record<string, unknown>;
  const own = [
    ...(Array.isArray(o.rulesUsed) ? (o.rulesUsed as { id?: unknown }[]).map((r) => r.id) : []),
    ...(Array.isArray(o.labels) ? (o.labels as { ruleId?: unknown }[]).map((l) => l.ruleId) : []),
    ...(Array.isArray(o.flags) ? o.flags.flatMap((code) => (typeof code === "string" ? slotIds(flags[code as keyof typeof flags] ?? "") : [])) : []),
  ].filter((x): x is string => typeof x === "string");
  return [...own, ...Object.entries(o).flatMap(([k, v]) => (k === "rule_ids" && Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : citedIn(v)))];
}
const slotIds = (text: string): string[] => parseAnswer(text).flatMap((p) => (p.kind === "slot" ? [p.id] : []));

describe("every rule a figure on the indices page names is a record the page holds", () => {
  // the page holds its loader's rules (the glossary cards') and its bundle's, and the records they point at (routes/invest.tsx)
  const held = async (w: IndicesBundle) => {
    const page = await indicesLoader({ params: {} } as never);
    return new Set([...page.feeRules, ...w.rules, ...w.pointed].map((r) => r.id));
  };
  /** The page's figures for one index: the view of the plan, and the costs of each house's cheapest way (the receipt's and the stairs'). */
  const figures = (w: IndicesBundle, id: string): unknown[] => {
    const t = w.today;
    const plan: WorkbenchInputs = {
      amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
      values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
    };
    const index = indexById(w, id);
    if (!index) throw new Error(`the bundle holds no ${id}`);
    const view = buildInvest({ bundle: w, index, plan, yourBroker: null });
    const pairs = view.houses.flatMap((h) => (h.best ? [pairCosts({ bundle: w, index, plan, fundId: h.best.fund.rec.id, providerId: h.provider.id })] : []));
    return [view, ...pairs];
  };

  it("finds a figure's cited rules: rulesUsed, labels, flag slots and rule_ids", () => {
    const flagged = Object.entries(flags).find(([, t]) => slotIds(t).length > 0)!;
    const cited = citedIn({ inputs: [{ rulesUsed: [{ id: "A" }], labels: [{ code: "reading", ruleId: "B" }], flags: [flagged[0]], source: { rule_ids: ["C"] } }] });
    expect(cited).toEqual(expect.arrayContaining(["A", "B", "C", ...slotIds(flagged[1])]));
  });

  it("on /indices/sp500 and /indices/ta125", async () => {
    const w = indicesBundle();
    const have = await held(w);
    const bad = ["index-sp500", "index-ta125"].flatMap((id) => {
      const cited = new Set(citedIn(figures(w, id)));
      expect(cited.size).toBeGreaterThan(0);
      return [...cited].filter((r) => !have.has(r)).map((r) => `${id}: ${r}`);
    });
    expect(bad).toEqual([]);
  }, 300000);
});
