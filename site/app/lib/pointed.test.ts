// Every chip on a rule card opens its record: on /guide/brokerage-account BRK-35's "לדוגמה" chip opened an
// empty card, because BRK-51 was not in the page's data; then a probe found 24 figure chips (TXG-04's figures cite TXG-02 and TXG-03)
// that did the same. A card's chips are its record's `derived_from` and `examples`, and every `rule_ids` inside its figures (each
// figure opens a value sheet that shows them), with the rules whose figures fill its text's `{ID:figure}` slots. A page ships in full its
// own rules and the records whose figures fill its cards' slots (`pointed`), and of every other rule its cards point at a head, whose
// card is fetched from the rule's own file when its chip is tapped (`pointedShipment`, routes/rule-card.ts); a page that does not take
// heads ships them all in full (`pointedRecords`). This walks the pages' data: for every record a page holds in full, every chip its card
// or its figures can show opens a record the page holds, or has a head and a file the build pre-renders; every slot reads a record the
// page holds. The chips are read from the record here, not through `pointedIds`.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
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
import { ruleCardData } from "./rule-uses.server";
import { prerenderPaths } from "./paths.server";
import { ruleCardPath } from "./rule-card-file";
import { ruleHeadOf } from "./rule-head";
import { shelfIds } from "./rule-shelves";
import { flags } from "../copy";
import { parseAnswer } from "./answer-slots";
import { buildInvest, indexById, pairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { entered } from "./value";
import { rule as ruleCopy, system } from "../copy";
import { ProvenanceProvider, ruleOf, type ProvenanceData } from "../components/provenance";
import { RuleCard, loadCardFile, withFetched, type CardFetch } from "../components/provenance-sheets";

const all = loadRules();
/** A value the test needs, or a failure that names it. */
function must<T>(v: T | undefined | null, what: string): T {
  if (v === undefined || v === null) throw new Error(`missing: ${what}`);
  return v;
}
type Map_ = Record<string, RuleRecord>;
const asMap = (x: Map_ | readonly RuleRecord[] | undefined): Map_ => (Array.isArray(x) ? Object.fromEntries(x.map((r) => [r.id, r])) : ((x as Map_ | undefined) ?? {}));

/** The chips a record's card can show: its derivations and examples, the rules its figures' sheets name, and the rules whose figures fill its text's slots. */
const chipsOf = (r: RuleRecord): string[] => [...new Set([...(r.derived_from ?? []), ...(r.examples ?? []), ...valueRuleIds(r.figures), ...slotIds(r.text_he ?? "")])].filter((id) => id !== r.id);

/** What the build pre-renders, the rule card files among it (routes/rule-card.ts). */
const served = new Set(prerenderPaths());
const hasFile = (id: string) => served.has(ruleCardPath(id));

/**
 * The chips of the page's cards that open no card: "BRK-35 → BRK-51". A chip opens when the page holds its record, or holds its head
 * and the build pre-renders its file; a slot of a card's text draws its figure, so it needs the record itself ("TXG-04 → TXG-02 (slot)").
 */
function unopened(rules: Map_ | readonly RuleRecord[] | undefined, pointed: Map_ | readonly RuleRecord[] | undefined, heads: Record<string, unknown> = {}): string[] {
  const have = { ...asMap(rules), ...asMap(pointed) };
  return Object.values(have).flatMap((r) => [
    ...chipsOf(r).filter((id) => all[id] && !have[id] && !(heads[id] && hasFile(id))).map((id) => `${r.id} → ${id}`),
    ...slotIds(r.text_he ?? "").filter((id) => all[id] && !have[id]).map((id) => `${r.id} → ${id} (slot)`),
  ]);
}

/** Every guide page's loader data, by wrapper id: read once for the tests that walk it. */
type Shipped = { rules: Map_; pointed: Map_; heads?: Record<string, unknown> };
let guides: Promise<[string, Record<string, unknown> & Shipped][]> | null = null;
const guidePages = () =>
  (guides ??= (async () => {
    const out: [string, Record<string, unknown> & Shipped][] = [];
    for (const id of wrapperId.options) {
      if (!buildGuidePage(id)) continue;
      out.push([id, (await guideLoader({ params: { id } } as never)) as Record<string, unknown> & Shipped]);
    }
    return out;
  })());

describe("every chip on a page's rule cards opens its record", () => {
  it("the chips are read from the figures too: TXG-04's figures name TXG-02 and TXG-03", () => {
    expect(chipsOf(all["TXG-04"]!)).toEqual(expect.arrayContaining(["TXG-02", "TXG-03"]));
  });

  it("the brokerage guide opens BRK-51, the example BRK-35's card names: its record, or its head and its file", async () => {
    const d = (await guideLoader({ params: { id: "brokerage-account" } } as never)) as Shipped;
    expect(d.rules["BRK-35"]?.examples).toContain("BRK-51");
    expect(d.pointed["BRK-51"] ?? d.rules["BRK-51"] ?? (hasFile("BRK-51") ? d.heads?.["BRK-51"] : undefined)).toBeDefined();
  }, 60000);

  it("a chip whose rule the page holds no record of, nor a head with a file, is caught", () => {
    const r = must(all["BRK-35"], "BRK-35");
    const heads = Object.fromEntries(chipsOf(r).map((id) => [id, {}]));
    expect(unopened({ [r.id]: r }, {}, heads)).toEqual([]);
    const without = Object.fromEntries(Object.entries(heads).filter(([id]) => id !== "BRK-51"));
    expect(unopened({ [r.id]: r }, {}, without)).toEqual(["BRK-35 → BRK-51"]);
    const slotted = Object.values(all).find((x) => slotIds(x.text_he ?? "").some((id) => all[id] && id !== x.id));
    if (!slotted) throw new Error("no record's text has a slot of another record");
    const target = must(slotIds(slotted.text_he ?? "").find((id) => all[id] && id !== slotted.id), "a slot of another record");
    expect(unopened({ [slotted.id]: slotted }, {}, { [target]: {} })).toContain(`${slotted.id} → ${target} (slot)`);
  });

  it("every rule has a card file the build pre-renders, and each file opens every chip of the cards it holds", () => {
    const bad: string[] = [];
    for (const id of Object.keys(all)) {
      if (!hasFile(id)) bad.push(`${id}: no file`);
      const f = ruleCardData(id);
      if (!f) {
        bad.push(`${id}: no card data`);
        continue;
      }
      bad.push(...unopened({ [id]: f.record }, f.pointed, f.heads).map((x) => `${id}'s file: ${x}`));
    }
    expect(bad).toEqual([]);
  }, 120000);

  it("guide pages", async () => {
    const bad: string[] = [];
    for (const [id, d] of await guidePages()) bad.push(...unopened(d.rules, d.pointed, d.heads).map((x) => `${id}: ${x}`));
    expect(bad).toEqual([]);
  }, 300000);

  it("exposure pages", () => {
    const bad = loadExposures().flatMap((e) => {
      const d = buildExposurePage(e.id);
      return d ? unopened(d.rules, d.pointed, d.heads).map((x) => `${e.id}: ${x}`) : [];
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
      const d = (await companyLoader({ params: { id: c.id } } as never)) as { kind: string; companyTerms?: Shipped };
      if (d.kind === "company" && d.companyTerms) bad.push(...unopened(d.companyTerms.rules, d.companyTerms.pointed, d.companyTerms.heads).map((x) => `${c.id}: ${x}`));
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

describe("a card whose rule the page does not ship is fetched when opened", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const page = (more: Partial<ProvenanceData> = {}): ProvenanceData => ({ rules: { "BRK-35": must(all["BRK-35"], "BRK-35") }, terms: {}, dimensions: {}, today: "2026-11-26", ...more });
  const drawn = (data: ProvenanceData, id: string) =>
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, createElement(RuleCard, { id, data }))))
      .replace(/<!-- -->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
  const file = must(ruleCardData("BRK-51"), "BRK-51's card data");
  const answer = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }));

  it("while its file is on its way, the card heads with the title its chip shows and says it is loading", () => {
    const head = { id: "BRK-51", title: { text: "כותרת לבדיקה", english: false }, strength: file.record.strength, scope: file.record.scope, ...(file.record.scope_institutions ? { scope_institutions: file.record.scope_institutions } : {}) };
    const text = drawn(page({ heads: { "BRK-51": head } }), "BRK-51");
    expect(text).toContain("BRK-51 · כותרת לבדיקה");
    expect(text).toContain(system.loading);
    // a rule the page has no head of says its text is not written, as before
    expect(drawn(page(), "BRK-51")).toContain(ruleCopy.noText);
  });

  it("while its file is on its way, the card's heading takes the focus a new view in the sheet gives, since its body holds nothing to act on", () => {
    const head = { id: "BRK-51", title: { text: "כותרת לבדיקה", english: false }, strength: file.record.strength, scope: file.record.scope };
    const card = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RuleCard, { id: "BRK-51", data: page({ heads: { "BRK-51": head } }) })));
    // Sheet.tsx gives a new view's focus to its `data-autofocus`, else to the first control in the body, which a loading card has none of
    expect(card).not.toMatch(/<(button|a|input)[\s>]/);
    const heading = must(/<h2[^>]*>/.exec(card), "the card's heading")[0];
    expect(heading).toContain('tabindex="-1"');
    expect(heading).toContain("data-autofocus");
  });

  it("on a company's page, the heading names while the card loads the companies the card names once it is in", () => {
    const record = must(
      Object.values(all).find((r) => r.scope !== "general" && (r.scope_institutions?.length ?? 0) >= 3 && !r.text_he?.includes("{")),
      "a record about three companies or more",
    );
    // a brand's page stands for its companies (`pageCompanies`), with no one company the chip would name alone
    const company = must(record.scope_institutions?.[1], "its second company").id;
    const base = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-26", pageCompanies: [company] };
    const scopeLine = (data: ProvenanceData) => must(/<\/h2>(.*?)<\/header>/.exec(renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RuleCard, { id: record.id, data })))), "the heading's scope line")[1];
    const loaded = scopeLine({ ...base, pointed: { [record.id]: record } });
    expect(scopeLine({ ...base, heads: { [record.id]: ruleHeadOf(record, { rules: all, today: base.today }) } })).toBe(loaded);
  });

  it("reads the file, says a missing one or a failed one did not load, and throws on a file that does not match its schema", async () => {
    vi.stubGlobal("fetch", answer(file));
    const loaded = await loadCardFile("BRK-51");
    expect(loaded.kind === "loaded" && loaded.file.record.id).toBe("BRK-51");
    // the page has the head, so the build gave the rule a file: none is a page older than the site's files, not a rule with no text
    vi.stubGlobal("fetch", answer("Not found", 404));
    expect(await loadCardFile("BRK-51")).toEqual({ kind: "failed" });
    vi.stubGlobal("fetch", answer("", 500));
    expect(await loadCardFile("BRK-51")).toEqual({ kind: "failed" });
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    expect(await loadCardFile("BRK-51")).toEqual({ kind: "failed" });
    vi.stubGlobal("fetch", answer({ record: { id: "BRK-51" } }));
    await expect(loadCardFile("BRK-51")).rejects.toThrow(/does not match its schema/);
  });

  it("a fetched file joins the sheet's data: its record draws the card, its heads name its chips, its uses join only a page that shows uses", () => {
    const fetched = new Map<string, CardFetch>([["BRK-51", { kind: "loaded", file }]]);
    const data = withFetched(page(), fetched);
    expect(ruleOf(data, "BRK-51")?.id).toBe("BRK-51");
    for (const id of Object.keys(file.heads)) expect(data.heads?.[id]).toEqual(file.heads[id]);
    expect(data.ruleUses).toBeUndefined();
    expect(withFetched(page({ ruleUses: {} }), fetched).ruleUses?.["BRK-51"]).toEqual(file.uses["BRK-51"]);
    const text = drawn(data, "BRK-51");
    expect(text).not.toContain(system.loading);
    expect(text).not.toContain(ruleCopy.noText);
    // nothing fetched: the page's data as it is
    expect(withFetched(page(), new Map())).toEqual(page());
  });
});
