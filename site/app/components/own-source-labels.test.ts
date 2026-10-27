// D31 on a rule card's source lines (review, 2026-10-26): a company's own document on its own term drops "לפי החברה", and only that.
// A press article or a forum post keeps "מקור משני", a copy of an official text keeps "עותק" (D7), even on a company's term.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { scopeWords, sourceBlock } from "../copy";
import { ProvenanceProvider, RuleCard, SourceBlock } from "./provenance";

const src = (strength: "primary" | "primary-mirror" | "institution" | "secondary", url: string) => ({ url, title: `מסמך ${strength}`, publisher: "x", strength, checked: "2026-10-25", ...(strength === "primary-mirror" ? { mirror_host: "other" as const } : {}) });
const sources = [src("institution", "https://example.org/own.pdf"), src("secondary", "https://example.org/press"), src("primary-mirror", "https://example.org/copy.pdf")];
const render = (el: ReturnType<typeof createElement>, data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" }) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el })));
const weak = sourceBlock.weak;

describe("the source lines of a company's own term", () => {
  it("own drops the company label only", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true, own: true }));
    expect(html).not.toContain(weak.institution);
    expect(html).toContain(weak.secondary);
    expect(html).toContain(weak["primary-mirror"]);
  });
  it("without own, every weak label shows", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true }));
    for (const s of ["institution", "secondary", "primary-mirror"]) expect(html).toContain(weak[s]);
  });
  it("IRA-28's card (a regulator's announcement and press articles about two companies) keeps 'מקור משני' and names no company document", () => {
    const root = new URL("../../../", import.meta.url);
    const ira28 = JSON.parse(readFileSync(new URL("data/rules/ira-28.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "IRA-28": ira28 }, terms: {}, dimensions: {}, today: "2026-10-26", ownDocs: {} };
    const html = render(createElement(RuleCard, { id: "IRA-28", data, inline: true }), data);
    expect(html).toContain(weak.secondary);
    expect(html).not.toContain("נמצא במסמכים של");
    expect(html).toContain("המקורות כאן אינם מסמכים של סלייס וגלובלנט");
  });
  // review round 3, 2026-10-26: the card's own data (the root loader's company links and own documents), as every page has them
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
  // founder, 2026-10-27: PEN-44 under "מה כתוב במסמכים של אלטשולר שחם" showed Mor's and Analyst's documents and figures
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
