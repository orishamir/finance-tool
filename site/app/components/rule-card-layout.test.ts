// On one rule card or figure sheet, each fact is shown once: the day a source was read stands on its source line, and the record's own date only
// on a card with no source. What a card says is true of the record: the rules its Source line points to are pointers.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { ruleCardMore, rule as ruleCopy, scopeWords, sourceBlock, strength } from "../copy";
import { fmt } from "../lib/format";
import { joinNames, ownDocCompanies } from "../lib/scope";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { RuleCard, RuleDetail, ValueSheet } from "./provenance-sheets";
import type { SiteValue } from "../lib/value";

const root = new URL("../../../", import.meta.url);
const record = (id: string): RuleRecord => JSON.parse(readFileSync(new URL(`data/rules/${id.toLowerCase()}.json`, root), "utf8")) as RuleRecord;
const dataOf = (rules: Record<string, RuleRecord>, more: Partial<ProvenanceData> = {}): ProvenanceData => ({ rules, terms: {}, dimensions: {}, today: "2026-11-26", ...more }) as ProvenanceData;
/** The card's words, tags gone. */
const words = (el: ReturnType<typeof createElement>, data: ProvenanceData) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, el))).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const count = (text: string, part: string) => text.split(part).length - 1;
/** A value the test needs, or a failure that names it. */
function must<T>(v: T | undefined | null, what: string): T {
  if (v === undefined || v === null) throw new Error(`missing: ${what}`);
  return v;
}

/** TXA-30 with its record's date apart from every source's, so each date on the card says which it is. */
function dated(sources: boolean): RuleRecord {
  const r = structuredClone(record("TXA-30"));
  r.checked = "2020-01-02";
  // with no source of its own a card takes its figures' sources: neither is left
  if (!sources) {
    r.sources = [];
    delete r.figures;
  }
  return r;
}

describe("the day a rule was read", () => {
  it("a card with sources dates each source, and not the record", () => {
    const r = dated(true);
    const data = dataOf({ [r.id]: r });
    for (const el of [createElement(RuleCard, { id: r.id, data, inline: true }), createElement(RuleDetail, { id: r.id, data, products: [] })]) {
      const text = words(el, data);
      expect(text).not.toContain(fmt.date(r.checked));
      expect(text).toContain(`${ruleCopy.checked} ${fmt.date(must(r.sources?.[0], "TXA-30's first source").checked)}`);
      // the day it is read again stays
      expect(text).toContain(ruleCopy.recheck);
    }
  });
  it("a card with no source dates the record", () => {
    const r = dated(false);
    const data = dataOf({ [r.id]: r });
    for (const el of [createElement(RuleCard, { id: r.id, data, inline: true }), createElement(RuleDetail, { id: r.id, data, products: [] })]) {
      const text = words(el, data);
      expect(count(text, fmt.date(r.checked))).toBe(1);
      expect(text).toContain(ruleCopy.sourceMissing);
    }
  });
});

describe("the rules a record's Source line points to", () => {
  // BANK-37 reads Bank Leumi's pages directly and points to the general rule on exit points (BANK-27): no conclusion is drawn
  it("are pointers beside the record's sources, with no word of derivation (BANK-37)", () => {
    const r = record("BANK-37");
    expect(r.derived_from?.length).toBeGreaterThan(0);
    expect(r.sources?.length).toBeGreaterThan(0);
    const data = dataOf({ [r.id]: r });
    const text = words(createElement(RuleCard, { id: r.id, data, inline: true }), data);
    expect(text).toContain(ruleCardMore.seeAlso);
    expect(text).not.toMatch(/נגזר|מסקנה/);
  });
});

describe("the companies of a company's term", () => {
  // the card's own data (the root loader's company links and own documents), as every page has them
  const real = async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    return dataOf(rules, { ownDocs: ownDocuments(rules), companies: companyLinks() });
  };
  const named = (data: ProvenanceData, id: string) => scopeWords.line.institution.replace("{names}", joinNames(ownDocCompanies(must(data.rules[id], id), data.ownDocs).map((c) => c.name_he)));

  it("are named once, in the tag, when the tag names them all", async () => {
    const data = await real();
    const id = "BANK-30";
    expect(ownDocCompanies(must(data.rules[id], id), data.ownDocs)).toHaveLength(1);
    for (const el of [createElement(RuleCard, { id, data, inline: true }), createElement(RuleDetail, { id, data, products: [] })]) {
      const text = words(el, data);
      expect(text).toContain(scopeWords.line.institutionTagged);
      expect(text).not.toContain(named(data, id));
    }
  });
  it("are named in the line too when the card's tag names only the first (BANK-33's two banks)", async () => {
    const data = await real();
    const id = "BANK-33";
    expect(ownDocCompanies(must(data.rules[id], id), data.ownDocs).length).toBeGreaterThan(1);
    expect(words(createElement(RuleCard, { id, data, inline: true }), data)).toContain(named(data, id));
    // the rules page's tag names them all
    const detail = words(createElement(RuleDetail, { id, data, products: [] }), data);
    expect(detail).toContain(scopeWords.line.institutionTagged);
    expect(detail).not.toContain(named(data, id));
  });
});

describe("a sourced figure's sheet", () => {
  /** A bank's fee from its own price list, read on 25.10.2026, shown away from the bank's own product. */
  const figure = (sourceStrength: "institution" | "secondary"): SiteValue => ({
    value: 10,
    unit: "nis",
    source: { url: "https://example.org/tariff.pdf", title: "תעריפון", publisher: "Bank", strength: sourceStrength },
    checked: "2026-10-25",
    effective_from: null,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
  });
  const sheet = (v: SiteValue) => {
    const data = dataOf({});
    return words(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }), data);
  };
  it("names a weak source's strength once, in its callout, beside its explanation", () => {
    for (const st of ["institution", "secondary"] as const) {
      const text = sheet(figure(st));
      expect(count(text, strength[st].label)).toBe(1);
      expect(text).toContain(strength[st].line);
      expect(count(text, must(sourceBlock.weak[st], st))).toBe(sourceBlock.weak[st] === strength[st].label ? 1 : 0);
    }
  });
  it("goes from its tag straight to its source, with no sentence that only points at it", () => {
    const text = sheet({ ...figure("institution"), own: "bank" });
    expect(text).not.toMatch(/מהמקור שלמטה/);
    expect(text).not.toContain(strength.institution.label);
    expect(text).toContain(`${sourceBlock.checked} ${fmt.date("2026-10-25")}`);
  });
});
