// D31 on a rule card's source lines: a company's own document on its own term drops "לפי החברה", and only that.
// A secondary source keeps "מקור משני" (D7), even on a company's term.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { updateRule, type RuleRecord } from "@finance-tool/schema";
import { rulesDetail, scopeWords, sourceBlock, updateRules } from "../copy";
import type { SiteValue } from "../lib/value";
import { ProvenanceProvider } from "./provenance";
import { RuleCard, SourceBlock, ValueSheet } from "./provenance-sheets";

const src = (strength: "primary" | "institution" | "secondary", url: string) => ({ url, title: `מסמך ${strength}`, publisher: "x", strength, checked: "2026-10-25" });
const sources = [src("institution", "https://example.org/own.pdf"), src("secondary", "https://example.org/press")];
const render = (el: ReturnType<typeof createElement>, data: object = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" }) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el } as never)));
const weak = sourceBlock.weak;

describe("the source lines of a company's own term", () => {
  it("own drops the company label only", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true, own: true }));
    expect(html).not.toContain(weak.institution);
    expect(html).toContain(weak.secondary);
  });
  it("without own, every weak label shows", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true }));
    for (const s of ["institution", "secondary"]) expect(html).toContain(weak[s]);
  });
  it("IRA-28's card (a regulator's announcement about a company) names no company document", () => {
    const root = new URL("../../../", import.meta.url);
    const ira28 = JSON.parse(readFileSync(new URL("data/rules/ira-28.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "IRA-28": ira28 }, terms: {}, dimensions: {}, today: "2026-10-26", ownDocs: {} };
    const html = render(createElement(RuleCard, { id: "IRA-28", data, inline: true }), data);
    expect(html).not.toContain(weak.secondary);
    expect(html).not.toContain("נמצא במסמכים של");
    expect(html).toContain("המקורות כאן הם לא מסמכים של סלייס");
  });
  // the card's own data (the root loader's company links and own documents), as every page has them
  const real = async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    return { rules, terms: {}, dimensions: {}, today: "2026-10-26", ownDocs: ownDocuments(rules), companies: companyLinks() };
  };
  it("BRK-43 (Interactive Brokers) keeps 'לפי החברה' on IB Ireland's page, which is not its own site, and drops it on its own", async () => {
    const data = await real();
    const html = render(createElement(RuleCard, { id: "BRK-43", data, inline: true }), data);
    expect(html.split(weak.institution!).length - 1).toBe(1);
  });
  it("SW-53, a not-rule read from two brokers' tariffs: its tag, line and foot agree", async () => {
    const data = await real();
    const html = render(createElement(RuleCard, { id: "SW-53", data }), data);
    expect(html).toContain(scopeWords.notRule.tag);
    expect(html).toContain(scopeWords.notRule.lineOwn.replace("{names}", "אי.בי.אי ואלטשולר שחם טרייד"));
    expect(html).toContain(scopeWords.allNoCompany);
    expect(html).not.toContain("בחברות אחרות זה יכול להיות אחרת");
  });
  // PEN-44 under "מה כתוב במסמכים של אלטשולר שחם" showed Mor's and Analyst's documents and figures
  it("on a company's page a record shows only that company's documents, figures and name, with the law and the regulator", async () => {
    const data = { ...(await real()), company: "altshuler-shaham", pageCompanies: ["altshuler-shaham"] };
    const html = render(createElement(RuleCard, { id: "PEN-44", data, inline: true }), data);
    expect(html).toContain("as-invest.co.il");
    expect(html).toContain("gov.il");
    for (const other of ["moreinvest.co.il", "analyst.co.il", "(במור)", "(באנליסט)", "ועוד"]) expect(html).not.toContain(other);
    expect(html).toContain(scopeWords.line.unsettledSeen.replace("{names}", "אלטשולר שחם"));
  });
  it("CS-30's figures are Harel's: on Harel's page, not on Altshuler Shaham's", async () => {
    const base = await real();
    const harel = render(createElement(RuleCard, { id: "CS-30", data: { ...base, company: "harel", pageCompanies: ["harel"] }, inline: true }), base);
    expect(harel).toContain("0.23");
    expect(harel).not.toContain("as-invest.co.il");
    const altshuler = render(createElement(RuleCard, { id: "CS-30", data: { ...base, company: "altshuler-shaham", pageCompanies: ["altshuler-shaham"] }, inline: true }), base);
    expect(altshuler).not.toContain("harel-group");
    expect(altshuler).not.toContain("דמי ניהול מהפקדה אחרי גיל המענק האחרון");
  });
  it("outside a company's page (the rules, a chip) the record shows whole", async () => {
    const data = await real();
    const html = render(createElement(RuleCard, { id: "PEN-44", data, inline: true }), data);
    for (const host of ["as-invest.co.il", "moreinvest.co.il", "analyst.co.il"]) expect(html).toContain(host);
  });
});

describe("a bracket table's figures on a rule card", () => {
  it("says the edges are frozen for their years and the rates fixed in law, each under its own figure (TXG-02)", () => {
    const root = new URL("../../../", import.meta.url);
    const txg02 = JSON.parse(readFileSync(new URL("data/rules/txg-02.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "TXG-02": txg02 }, terms: {}, dimensions: {}, today: "2026-11-14" };
    const html = render(createElement(RuleCard, { id: "TXG-02", data, inline: true }), data).replace(/<!-- -->/g, "");
    const frozen = updateRules.frozen.split("{years}")[0]!;
    expect(html).toContain(frozen);
    expect(html).toMatch(/2025–2027/);
    expect(html).toContain(updateRules["fixed in law"]);
    // the edge's note comes before the rate's, in the first row
    expect(html.indexOf(frozen)).toBeLessThan(html.indexOf(updateRules["fixed in law"]));
  });
});

describe("the words of an update rule", () => {
  it("has a word for every update rule the schema allows", () => {
    const named = updateRule.options[0].options;
    for (const r of named) expect((updateRules as Record<string, string>)[r], r).toBeTruthy();
  });
  it("says a figure a ruling fixes is as its source document has it, on its rule card (TXA-30)", () => {
    const root = new URL("../../../", import.meta.url);
    const txa30 = JSON.parse(readFileSync(new URL("data/rules/txa-30.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "TXA-30": txa30 }, terms: {}, dimensions: {}, today: "2026-11-14" };
    const html = render(createElement(RuleCard, { id: "TXA-30", data, inline: true }), data);
    expect(html).toContain(updateRules["fixed in document"]);
    expect(html).not.toContain(updateRules["fixed in regulation"]);
  });
});

describe("a span of years on a rule card", () => {
  it("says one year as a year, never \"1 שנים\" (ETF-38's wait after removal)", () => {
    const root = new URL("../../../", import.meta.url);
    const etf38 = JSON.parse(readFileSync(new URL("data/rules/etf-38.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "ETF-38": etf38 }, terms: {}, dimensions: {}, today: "2026-11-14" };
    const html = render(createElement(RuleCard, { id: "ETF-38", data, inline: true }), data).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(html).not.toMatch(/\b1 שנים/);
    expect(html).toMatch(/שנה/);
  });
});

describe("one drawing for every source (sourceView)", () => {
  const today = "2026-11-28";
  const words = (html: string) => (html.split("<dialog")[0] ?? "").replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const law = { url: "https://example.org/law.pdf", title: "The law", title_he: "חוק לבדיקה", publisher: "x", kind: "law", strength: "primary" as const, checked: today };
  it("names a document once for all its places, each place on its own line, and gives a quoted page with no locator its own link", () => {
    const html = render(createElement(SourceBlock, { source: [{ ...law, page: 3, locator_he: "סעיף 1" }, { ...law, page: 7, quote: "המילים שבעמוד" }], today, inline: true }));
    expect(words(html).split("חוק לבדיקה").length - 1).toBe(1);
    expect(html).toContain(">סעיף 1<");
    expect(html).toContain(sourceBlock.page.replace("{n}", "7"));
    expect(html).toContain('href="https://example.org/law.pdf#page=7"');
  });
  it("writes a place's own title with the gershayim, as a document's title is written", () => {
    const html = render(createElement(SourceBlock, { source: [law, { ...law, page: 9, title_he: 'תקנות לבדיקה, התשע"ב-2012' }], today, inline: true }));
    expect(words(html)).toContain("התשע״ב-2012");
    expect(words(html)).not.toContain('התשע"ב');
  });
  it("prints the word of a source that is not the binding text in force", () => {
    // a record's source carries its standing (the schema's `standing`), which the sources layer's own shape does not name
    const html = render(createElement(SourceBlock, { source: [{ ...law, standing: "draft" } as typeof law], today, inline: true }));
    expect(html).toContain(sourceBlock.standing.draft);
    expect(render(createElement(SourceBlock, { source: [law], today, inline: true }))).not.toContain(sourceBlock.standing.draft);
  });
  it("never names a shared portal's keeper as the publisher of a document on it", () => {
    const notice = { url: "https://www.gov.il/he/pages/notice", title: "Notice", title_he: "הודעה לבדיקה", publisher: "gov.il", strength: "primary" as const, checked: today };
    const data = { rules: {}, terms: {}, dimensions: {}, today, publishersHe: { "gov.il": "אתר הממשלה" } };
    const html = render(createElement(SourceBlock, { source: [notice], today, inline: true }), data);
    expect(html).toContain("הודעה לבדיקה");
    expect(html).not.toContain("אתר הממשלה");
  });
  it("a rule card heads its sources", () => {
    const root = new URL("../../../", import.meta.url);
    const txa30 = JSON.parse(readFileSync(new URL("data/rules/txa-30.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "TXA-30": txa30 }, terms: {}, dimensions: {}, today };
    expect(words(render(createElement(RuleCard, { id: "TXA-30", data, inline: true }), data))).toContain(rulesDetail.sourcesHead);
  });
  it("a rule card's citation writes a title's abbreviation with the gershayim", () => {
    const root = new URL("../../../", import.meta.url);
    const txa30 = JSON.parse(readFileSync(new URL("data/rules/txa-30.json", root), "utf8")) as RuleRecord;
    const quoted = { ...txa30, sources: [{ ...law, title_he: 'תקנות לבדיקה, התשע"ב-2012' }] } as unknown as RuleRecord;
    const data = { rules: { "TXA-30": quoted }, terms: {}, dimensions: {}, today };
    const shown = words(render(createElement(RuleCard, { id: "TXA-30", data, inline: true }), data)).replace(/&quot;/g, '"');
    expect(shown).toContain("התשע״ב-2012");
    expect(shown).not.toContain('התשע"ב');
  });
});

describe("a sourced figure's source", () => {
  const today = "2026-11-28";
  const rule = {
    id: "TXA-30",
    title: "x",
    title_he: "כלל לבדיקה",
    scope: "general",
    strength: "primary",
    dimensions: [],
    checked: today,
    sources: [{ url: "https://example.org/law.pdf", title: "The law", title_he: "חוק לבדיקה", publisher: "x", kind: "law", strength: "primary", page: 5, locator_he: "סעיף 9", checked: today }],
  } as unknown as RuleRecord;
  const data = { rules: { "TXA-30": rule }, terms: {}, dimensions: {}, today };
  const value = (page?: number, extra: Partial<SiteValue> = {}, hash = ""): SiteValue => ({
    value: 3,
    unit: "pct",
    source: { url: `https://example.org/law.pdf${hash}`, title: "law.pdf", publisher: "x", strength: "primary", ...(page ? { page } : {}) } as SiteValue["source"],
    checked: today,
    effective_from: null,
    effective_to: null,
    update_rule: "fixed in law",
    state: "sourced",
    rule_ids: ["TXA-30"],
    ...extra,
  });
  const sheet = (v: SiteValue) => render(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }), data);
  it("a figure on the page of its rule's one place takes the place; on another page it takes the names and never the place", () => {
    const same = sheet(value(5));
    expect(same).toContain("חוק לבדיקה");
    expect(same).toContain("סעיף 9");
    const other = sheet(value(8));
    expect(other).toContain("חוק לבדיקה");
    expect(other).not.toContain("סעיף 9");
  });
  it("the page its address opens at is its page", () => {
    expect(sheet(value(undefined, {}, "#page=5"))).toContain("סעיף 9");
    const other = sheet(value(undefined, {}, "#page=8"));
    expect(other).toContain("חוק לבדיקה");
    expect(other).not.toContain("סעיף 9");
  });
  it("a place is borrowed from the figure's own rule alone, never from the places of several rules", () => {
    const elsewhere = { ...rule, id: "TXA-31", sources: [{ ...(rule.sources ?? [])[0], url: "https://example.org/other.pdf", locator_he: "סעיף 77" }] } as unknown as RuleRecord;
    const both = { ...data, rules: { ...data.rules, "TXA-31": elsewhere } };
    const own = render(createElement(ValueSheet, { value: value(), exact: false, data: both, headId: "h", descId: "d" }), both);
    expect(own).toContain("סעיף 9");
    const pooled = render(createElement(ValueSheet, { value: value(undefined, { rule_ids: ["TXA-30", "TXA-31"] }), exact: false, data: both, headId: "h", descId: "d" }), both);
    expect(pooled).toContain("חוק לבדיקה");
    expect(pooled).not.toContain("סעיף 9");
  });
  it("a figure that names no place takes the rule's place when the rule cites its document at one place, and only its names at several", () => {
    const one = sheet(value());
    expect(one).toContain("חוק לבדיקה");
    expect(one).toContain("סעיף 9");
    const second = { url: "https://example.org/law.pdf", title: "The law", title_he: "חוק לבדיקה", publisher: "x", kind: "law", strength: "primary", page: 6, locator_he: "סעיף 10", checked: today };
    const two = { ...data, rules: { "TXA-30": { ...rule, sources: [...(rule.sources ?? []), second] } as unknown as RuleRecord } };
    const several = render(createElement(ValueSheet, { value: value(), exact: false, data: two, headId: "h", descId: "d" }), two);
    expect(several).toContain("חוק לבדיקה");
    expect(several).not.toContain("סעיף 9");
    expect(several).not.toContain("סעיף 10");
  });
});
