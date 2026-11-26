// Every chip on a rule card opens its record: on /guide/brokerage-account BRK-35's "לדוגמה" chip opened an
// empty card, because BRK-51 was not in the page's data; then a probe found 24 figure chips (TXG-04's figures cite TXG-02 and TXG-03)
// that did the same. A card's chips are its record's `derived_from` and `examples`, and every `rule_ids` inside its figures (each
// figure opens a value sheet that shows them), with the rules whose figures fill its text's `{ID:figure}` slots; each page that shows cards passes the records they point at as `pointed`
// (`pointedRecords`). This walks the pages' data: for every record a page holds (its own rules and the pointed ones), every chip its
// card or its figures can show opens a record the page holds. The chips are read from the record here, not through `pointedIds`.
import { describe, expect, it } from "vitest";
import { wrapperId, type RuleRecord } from "@finance-tool/schema";
import { loadCma, loadRules, loadTerms } from "./data.server";
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
import { loader as trackLoader } from "../routes/track";
import { loader as bondGuideLoader } from "../routes/guide-limited-bond-fund";
import { loader as fundsGuideLoader } from "../routes/guide-mutual-funds";
import { shelfBundle } from "./rule-uses.server";
import { valueRuleIds } from "./page-rules.server";
import { shelfIds } from "./rule-shelves";
import { flags } from "../copy";
import { parseAnswer } from "./answer-slots";
import { buildInvest, indexById, pairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { entered } from "./value";

const all = loadRules();
type Map_ = Record<string, RuleRecord>;
const asMap = (x: Map_ | readonly RuleRecord[] | undefined): Map_ => (Array.isArray(x) ? Object.fromEntries(x.map((r) => [r.id, r])) : ((x as Map_ | undefined) ?? {}));

/** The chips a record's card can show: its derivations and examples, the rules its figures' sheets name, and the rules whose figures fill its text's slots. */
const chipsOf = (r: RuleRecord): string[] => [...new Set([...(r.derived_from ?? []), ...(r.examples ?? []), ...valueRuleIds(r.figures), ...slotIds(r.text_he ?? "")])].filter((id) => id !== r.id);

/** The chips of the page's cards whose record the page does not hold: "BRK-35 → BRK-51". */
function unopened(rules: Map_ | readonly RuleRecord[] | undefined, pointed: Map_ | readonly RuleRecord[] | undefined): string[] {
  const have = { ...asMap(rules), ...asMap(pointed) };
  return Object.values(have).flatMap((r) => chipsOf(r).filter((id) => all[id] && !have[id]).map((id) => `${r.id} → ${id}`));
}

/** Every guide page's loader data, by wrapper id: read once for the tests that walk it. */
let guides: Promise<[string, Record<string, unknown> & { rules: Map_; pointed: Map_ }][]> | null = null;
const guidePages = () =>
  (guides ??= (async () => {
    const out: [string, Record<string, unknown> & { rules: Map_; pointed: Map_ }][] = [];
    for (const id of wrapperId.options) {
      if (!buildGuidePage(id)) continue;
      out.push([id, (await guideLoader({ params: { id } } as never)) as Record<string, unknown> & { rules: Map_; pointed: Map_ }]);
    }
    return out;
  })());

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
    for (const [id, d] of await guidePages()) bad.push(...unopened(d.rules, d.pointed).map((x) => `${id}: ${x}`));
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
    return new Set([...page.feeRules, ...w.rules, ...(w.pointed ?? [])].map((r) => r.id));
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
    const flagged = Object.entries(flags).find(([, t]) => slotIds(t).length > 0);
    if (!flagged) throw new Error("no flag's words carry a {ID:figure} slot");
    const cited = citedIn({ inputs: [{ rulesUsed: [{ id: "A" }], labels: [{ code: "reading", ruleId: "B" }], flags: [flagged[0]], source: { rule_ids: ["C"] } }] });
    expect(cited).toEqual(expect.arrayContaining(["A", "B", "C", ...slotIds(flagged[1])]));
  });

  it("on /indices/sp500 and /indices/ta125", async () => {
    const w = indicesBundle();
    const have = await held(w);
    const bad = ["index-sp500", "index-ta125"].flatMap((id) => {
      const cited = new Set(citedIn(figures(w, id)));
      expect(cited.size).toBeGreaterThan(0);
      // a US fund's distribution cites the treaty's reading of its fund as a US corporation (TXF-41), which the S&P 500's VOO names
      if (id === "index-sp500") expect(cited.has("TXF-41")).toBe(true);
      return [...cited].filter((r) => !have.has(r)).map((r) => `${id}: ${r}`);
    });
    expect(bad).toEqual([]);
  }, 300000);
});

/**
 * The ids the glossary rows cite that have no record in data/rules: live rules of the rule base that were never extracted into a record
 * (TXH-16, under the term "הפקדה שאינה מוטבת", among them). A term card's list leaves them out (`TermCard`), and each waits for its
 * record. A ratchet: an id leaves the list when it gains a record or when no glossary row cites it any more, and none joins it.
 */
const noRecord = new Set(["BRK-03", "BRK-30", "CAT-01", "CAT-02", "CAT-25", "CAT-26", "CAT-29", "CAT-30", "CORP-10", "FXD-06", "FXD-12", "FXD-15", "FXD-16", "INS-23", "KH-24", "MF-42", "MF-57", "MGD-20", "PEN-24", "REG-28", "RG-16", "RG-17", "RG-18", "RG-19", "RG-23", "TXH-16", "TXP-25"]);

/** The rows of the page's term cards whose rule has no record: rows `TermCard` leaves out. Held at what they are, as a ratchet. */
const PLACEHOLDER_ROWS = 60;

type PageData = { rules?: Map_ | readonly RuleRecord[]; pointed?: Map_ | readonly RuleRecord[]; terms: Record<string, { ruleIds: readonly string[] }> };

const isRecord = (r: unknown): r is RuleRecord => typeof r === "object" && r !== null && "id" in r;

/** The records one key of a node holds, as a list of records or a map by id; nothing where it holds something else (a list of ids). */
function recordsAt(v: unknown): Map_ {
  if (v === null || typeof v !== "object") return {};
  const list: unknown[] = Array.isArray(v) ? v : Object.values(v);
  return list.length > 0 && list.every(isRecord) ? asMap(list) : {};
}

/**
 * The records a part of the page's data carries for itself: under its own `rules` and `pointed`, or under its `data`'s, as a house's terms
 * keep them beside the deal they draw (`HouseTermsData`). The part's figures open their chips from these and the page's.
 */
function ownRecords(o: Record<string, unknown>): Map_ {
  const data = o.data !== null && typeof o.data === "object" && !Array.isArray(o.data) ? (o.data as Record<string, unknown>) : {};
  return { ...recordsAt(o.rules), ...recordsAt(o.pointed), ...recordsAt(data.rules), ...recordsAt(data.pointed) };
}

/**
 * Every `rule_ids` inside the page's data that has a record the figure's provider does not hold: `have` is what the page holds, and a part
 * with records of its own adds them for its own figures only. The records themselves are not walked (the tests above walk their chips).
 */
function unheldValueIds(node: unknown, have: Map_, skip: ReadonlySet<string>): string[] {
  if (Array.isArray(node)) return node.flatMap((x) => unheldValueIds(x, have, skip));
  if (node === null || typeof node !== "object") return [];
  const o = node as Record<string, unknown>;
  const own = ownRecords(o);
  const scope = Object.keys(own).length > 0 ? { ...have, ...own } : have;
  return Object.entries(o).flatMap(([k, v]) => {
    if (k === "rules" || k === "pointed" || skip.has(k)) return [];
    // a run's product record (a bundle's, beside its `feeValues`) is the engine's input: what the run's figures' sheets name is its fees
    // and the rules it read, which the bundle carries
    if (k === "record" && "feeValues" in o) return [];
    if (k === "rule_ids" && Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && !!all[x] && !scope[x]);
    return unheldValueIds(v, scope, skip);
  });
}

/**
 * What a page points at that it does not ship: a term card's rule that has a record (`unshipped`), a figure's rule that has a record
 * (`values`), and a term card's rule with no record at all (`missing`, one per row). `d` is what the page's provider holds, `data` all the
 * loader returns; `skip` names the keys whose ids are not figures' (the glossary rows, read through `d.terms`).
 */
function gaps(page: string, d: PageData, data: unknown, skip: readonly string[]): { unshipped: string[]; values: string[]; missing: string[] } {
  const have = { ...asMap(d.rules), ...asMap(d.pointed) };
  const termIds = Object.values(d.terms).flatMap((t) => t.ruleIds);
  return {
    unshipped: termIds.filter((id) => all[id] && !have[id]).map((id) => `${page}: ${id}`),
    values: [...new Set(unheldValueIds(data, have, new Set(skip)))].map((id) => `${page}: ${id}`),
    missing: termIds.filter((id) => !all[id]),
  };
}

describe("every rule a page's term cards and figures name is a record the page ships", () => {
  it("a part's own records open its own figures' chips and no other part's", () => {
    const rec = (id: string) => ({ id }) as RuleRecord;
    const [a, b] = Object.keys(all);
    if (!a || !b) throw new Error("data/rules holds fewer than two records");
    const page = { rules: { [a]: rec(a) }, account: { terms: { data: { rules: [rec(b)] }, deal: { fee: { rule_ids: [b] } } } }, tariff: { line: { rule_ids: [a, b] } } };
    expect(unheldValueIds(page, { [a]: rec(a) }, new Set())).toEqual([b]);
  });

  const found = { unshipped: [] as string[], values: [] as string[], missing: [] as string[] };
  const add = (g: ReturnType<typeof gaps>) => {
    found.unshipped.push(...g.unshipped);
    found.values.push(...g.values);
    found.missing.push(...g.missing);
  };

  it("guide and exposure pages, the prose guides, the company and track pages", async () => {
    for (const [id, d] of await guidePages()) add(gaps(id, { ...d, terms: d.termsById as PageData["terms"] }, d, ["termsById"]));
    for (const e of loadExposures()) {
      const d = buildExposurePage(e.id);
      if (d) add(gaps(e.id, { ...d, terms: d.termsById }, d, ["termsById"]));
    }
    for (const [name, load] of [["limited-bond-fund", bondGuideLoader], ["mutual-funds", fundsGuideLoader]] as const) {
      const d = await load();
      add(gaps(name, d, d, ["terms"]));
    }
    for (const id of institutionIds()) {
      const d = (await companyLoader({ params: { id } } as never)) as { kind: string; institution?: PageData & { helpTerms: PageData["terms"] } };
      if (d.kind === "institution" && d.institution) add(gaps(id, { ...d.institution, terms: d.institution.helpTerms }, d, ["helpTerms", "terms"]));
    }
    const cma = loadCma();
    for (const c of cma.companies) {
      const d = (await companyLoader({ params: { id: c.id } } as never)) as { kind: string; companyTerms?: PageData & { helpTerms: PageData["terms"] } };
      if (d.kind === "company" && d.companyTerms) add(gaps(c.id, { ...d.companyTerms, terms: d.companyTerms.helpTerms }, d, ["helpTerms"]));
    }
    // one track of each product: their loaders differ by the product's record and the track's own figures
    const seen = new Set<string>();
    for (const t of cma.tracks) {
      const product = t.selfDirected ?? t.wrapperId ?? t.classification;
      if (seen.has(product)) continue;
      seen.add(product);
      const d = await trackLoader({ params: { id: t.companyId, fund: String(t.fundId) } } as never);
      add(gaps(`${t.companyId}/${t.fundId}`, d, d, ["terms"]));
    }
    expect(found.unshipped).toEqual([]);
    expect(found.values).toEqual([]);
    expect([...new Set(found.missing)].filter((id) => !noRecord.has(id))).toEqual([]);
    // the list is exactly the glossary's ids with no record: one leaves it when it gains a record or no row cites it any more
    expect([...new Set(loadTerms().flatMap((t) => t.ruleIds))].filter((id) => !all[id]).sort()).toEqual([...noRecord].sort());
    expect(found.missing.length).toBeLessThanOrEqual(PLACEHOLDER_ROWS);
  }, 600000);
});
