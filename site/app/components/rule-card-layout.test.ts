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
import { ruleTitle } from "../lib/rule-title";
import { isNotRule, joinNames, ownDocCompanies } from "../lib/scope";
import { ProvenanceProvider, RuleRef, RuleTitleRow, catchesOf, type ProvenanceData } from "./provenance";
import { RuleCard, RuleDetail, TermCard, ValueSheet } from "./provenance-sheets";
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

describe("a company's term on a brand's page", () => {
  it("is named by the brand's company it shows, not by the brand's first registry id", async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    const ownDocs = ownDocuments(rules);
    // a term two or more companies' own documents say: a brand of the first company's id and the second's names only the second
    const r = must(
      Object.values(rules).find((x) => x.scope === "institution" && ownDocCompanies(x, ownDocs).length >= 2),
      "a company's term two companies' documents say",
    );
    const [, second] = ownDocCompanies(r, ownDocs);
    const brand = ["000000000", must(second, "its second company").id];
    const data = dataOf(rules, { ownDocs, companies: companyLinks(), company: brand[0], pageCompanies: brand });
    // the chip, and the row of a list of rules with the companies under its title
    for (const el of [createElement(RuleRef, { id: r.id }), createElement(RuleTitleRow, { id: r.id })]) {
      const text = words(el, data);
      expect(text).toContain(must(second, "its second company").name_he);
      expect(text).not.toContain("ועוד");
    }
  });
});

describe("a general record that is not a rule", () => {
  it("is listed with what is not a rule, and its card's foot leads there, not to the rules", async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, noPageCompanyTerms, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    const ownDocs = ownDocuments(rules);
    const r = must(Object.values(rules).find((x) => x.scope === "general" && isNotRule(x.id)), "a general not-rule");
    expect(noPageCompanyTerms(rules, ownDocs).none).toContain(r.id);
    const data = dataOf(rules, { ownDocs, companies: companyLinks() });
    const text = words(createElement(RuleCard, { id: r.id, data }), data);
    expect(text).toContain(scopeWords.allNoCompany);
    expect(text).not.toContain(ruleCopy.all);
  });
});

describe("a company's term whose title names its company", () => {
  it("carries no tag that says the company again", async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    const ownDocs = ownDocuments(rules);
    const data = dataOf(rules, { ownDocs, companies: companyLinks() });
    const r = must(
      Object.values(rules).find((x) => {
        const named = ownDocCompanies(x, ownDocs);
        return x.scope === "institution" && named.length === 1 && ruleTitle(x, data).text.startsWith(must(named[0], "its company").name_he);
      }),
      "a company's term whose title opens with its company",
    );
    const name = must(ownDocCompanies(r, ownDocs)[0], "its company").name_he;
    const tag = scopeWords.tag.institution.replace("{names}", name);
    // the card's heading: its title, then the tags under it
    for (const el of [createElement(RuleCard, { id: r.id, data, inline: true }), createElement(RuleDetail, { id: r.id, data, products: [] })]) {
      const head = must(/<h2[\s\S]*?<\/header>/.exec(renderToStaticMarkup(createElement(MemoryRouter, null, el))), "the card's heading")[0].replace(/<[^>]+>/g, " ");
      expect(head).not.toContain(tag);
    }
  });
});

describe("the open questions a record points to", () => {
  it("stand as chips after \"ראו גם\", beside the rules it points to", async () => {
    const { loadRules } = await import("../lib/data.server");
    const rules = loadRules();
    const r = must(Object.values(rules).find((x) => (x.see_also ?? []).some((y) => y.kind === "question")), "a record that points to an open question");
    const q = must((r.see_also ?? []).find((y) => y.kind === "question"), "its question").id;
    const data = dataOf({ [r.id]: r }, { openQuestions: { [q]: { status: "open", title_he: "שאלה שהכלל מפנה אליה" } } });
    const text = words(createElement(RuleCard, { id: r.id, data, inline: true }), data);
    expect(text).toContain(ruleCardMore.seeAlso);
    expect(text).toContain("שאלה שהכלל מפנה אליה");
  });
});

describe("a rule card opened from one of its figures", () => {
  it("marks that figure's rows, and only them", () => {
    const r = record("TXA-30");
    const keys = Object.keys(r.figures ?? {});
    const key = must(keys[0], "TXA-30's first figure");
    const data = dataOf({ [r.id]: r });
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, createElement(RuleCard, { id: r.id, data, inline: true, figure: key }))));
    expect(html).toContain("data-marked");
    const plain = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, createElement(RuleCard, { id: r.id, data, inline: true }))));
    expect(plain).not.toContain("data-marked");
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

/** The card's markup on a page at `path`, inside the router. */
const html = (el: ReturnType<typeof createElement>, data: ProvenanceData, path = "/") =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(ProvenanceProvider, { data } as never, el))).replace(/<!-- -->/g, "");

describe("a record that is not a rule", () => {
  it("says so on its card and its detail, general or not (CS-22, a general not-rule)", () => {
    const r = record("CS-22");
    expect(r.scope).toBe("general");
    const data = dataOf({ [r.id]: r });
    for (const el of [createElement(RuleCard, { id: r.id, data, inline: true }), createElement(RuleDetail, { id: r.id, data, products: [] })]) expect(words(el, data)).toContain(scopeWords.notRule.tag);
  });
});

describe("an open record", () => {
  const r = record("TXF-04");
  const text = (r.text_he ?? "").replace(/\{[^}]+\}/g, "");
  const card = (uses: ProvenanceData["ruleUses"]) => {
    const data = dataOf({ [r.id]: r }, uses ? { ruleUses: uses } : {});
    return [createElement(RuleCard, { id: r.id, data, inline: true }), createElement(RuleDetail, { id: r.id, data, products: [] })].map((el) => words(el, data));
  };
  it("shows its text in the callout", () => {
    expect(r.strength).toBe("open");
    const first = must(text.split(/[.,:]/)[0], "TXF-04's first words").trim();
    expect(first.length).toBeGreaterThan(10);
    for (const t of card(undefined)) expect(t).toContain(first);
  });
  it("says the site does not compute it only where the calculation does not read it", () => {
    for (const t of card({ [r.id]: { pages: [], engine: false } })) expect(t).toContain(ruleCopy.open.last);
    for (const t of card({ [r.id]: { pages: [], engine: true } })) expect(t).not.toContain(ruleCopy.open.last);
    for (const t of card(undefined)) expect(t).not.toContain(ruleCopy.open.last);
  });
  it("carries no strength tag under a heading that already says it is open", () => {
    // the words "שאלה פתוחה" stand in the heading only (and wherever the record's own title or text says them)
    const own = count(`${r.title_he ?? ""} ${text}`, strength.open.label);
    for (const t of card(undefined)) expect(count(t, strength.open.label)).toBe(1 + own);
  });
});

describe("a rule card's order", () => {
  it("draws its sources right after its text, before who it applies to and the rules it points to (BANK-37)", async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    const r = must(rules["BANK-37"], "BANK-37");
    const data = dataOf(rules, { ownDocs: ownDocuments(rules), companies: companyLinks() });
    const t = words(createElement(RuleCard, { id: r.id, data, inline: true }), data);
    const source = t.indexOf(sourceBlock.checked);
    expect(source).toBeGreaterThan(-1);
    expect(source).toBeLessThan(t.indexOf(ruleCardMore.seeAlso));
    expect(source).toBeLessThan(t.indexOf(scopeWords.line.institutionTagged));
  });
});

describe("a rule card's foot", () => {
  const real = async () => {
    const { loadRules } = await import("../lib/data.server");
    const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
    const rules = loadRules();
    return dataOf(rules, { ownDocs: ownDocuments(rules), companies: companyLinks() });
  };
  it("leads to the company's page, except on that page (BANK-30)", async () => {
    const data = await real();
    const id = "BANK-30";
    const company = must(ownDocCompanies(must(data.rules[id], id), data.ownDocs)[0], "BANK-30's company");
    const page = must(data.companies?.[company.id], "its link");
    expect(page.hasPage).toBe(true);
    const href = `href="${page.href}#${id}"`;
    expect(html(createElement(RuleCard, { id, data }), data, "/guide/bank-deposit")).toContain(href);
    expect(html(createElement(RuleCard, { id, data }), data, page.href)).not.toContain(href);
  });
  it("names one place once where two of the record's companies share a page", async () => {
    const data = await real();
    const id = "BANK-33";
    const companies = ownDocCompanies(must(data.rules[id], id), data.ownDocs);
    expect(companies.length).toBeGreaterThan(1);
    // both companies' links lead to the first one's page
    const first = must(data.companies?.[must(companies[0], "a company").id], "its link");
    const shared = { ...data, companies: { ...data.companies, ...Object.fromEntries(companies.map((c) => [c.id, first])) } };
    const out = html(createElement(RuleCard, { id, data: shared }), shared, "/guide/bank-deposit");
    expect(count(out, `href="${first.href}#${id}"`)).toBe(1);
  });
});

describe("a term card", () => {
  it("lists only the rules the page holds, and no strength row for a primary source", () => {
    const r = record("TXA-30");
    const term = { he: "מונח", explanation: "הסבר", variants: [], ruleIds: [r.id, "ZZZ-99"], source: { url: "https://example.org", title: "מקור", publisher: "p", strength: "primary" as const, checked: "2026-10-01" }, where: [], wrapperIds: [], exposureIds: [] };
    const data = dataOf({ [r.id]: r }, { terms: { [term.he]: term } as never });
    const out = html(createElement(TermCard, { id: term.he, data }), data);
    expect(out).toContain(`data-opens="${r.id}"`);
    expect(out).not.toContain("ZZZ-99");
    expect(out).not.toContain(strength.primary.label);
    expect(out).not.toMatch(/<dt><\/dt>/);
  });
});

describe("a calculated figure's catches", () => {
  const fee = (st: "institution" | "primary"): SiteValue => ({ value: 0.5, unit: "pct_per_year", source: { url: "https://example.org/fees.pdf", title: "תעריפון", publisher: "Bank", strength: st }, checked: "2026-10-25", effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced" });
  it("a difference carries none for an input from a company's document, even at figure size; the input's own sheet says it", async () => {
    const { differenceOf } = await import("../lib/value");
    const diff = differenceOf(["החברה", fee("institution")], ["החוק", fee("primary")], "F-92", { today: "2026-11-26" });
    for (const figure of [false, true]) expect(catchesOf(diff, { today: "2026-11-26", figure, staleSaid: false, aheadSaid: false, onPage: (v) => v })).toEqual([]);
    const data = dataOf({});
    expect(words(createElement(ValueSheet, { value: fee("institution"), exact: false, data, headId: "h", descId: "d" }), data)).toContain(strength.institution.line);
  });
});
