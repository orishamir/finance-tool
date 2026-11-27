// A rule's text may carry {ID:figure} slots, so a figure in it is the record's and never typed: the card draws each slot as the figure,
// and every place that reads the text as a string (a search text, a row's first sentence, a title, a citation) writes the figure as the
// card shows it. A slot whose record or figure the card's data lacks would print "—" inside a sentence: every slot in every record's
// text resolves with the records its card travels with (the record and those whose figures its slots read, `pointedShipment`), and with a company's view
// of the record on that company's page.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { loadRules, pointedShipment } from "./data.server";
import { companyLinks } from "./institutions.server";
import { pageView, scopeCompanies } from "./scope";
import { parseAnswer } from "./answer-slots";
import { fillSlot, missingSlot, slotsAsText } from "./figure-slots";
import { citationText, pickSources, type SourcedRule } from "./sources";
import { ruleTitle } from "./rule-title";
import { formatValue } from "./format";
import { provenance } from "../copy";
import { ProvenanceProvider, type ProvenanceData } from "../components/provenance";
import { RuleCard, RuleDetail } from "../components/provenance-sheets";

const today = "2026-11-26";

describe("every slot in a rule's text", () => {
  const all = loadRules();
  /** The slots of a record's text that the given view of the record, with the records it points at, leaves without a figure. */
  const unfilled = (r: RuleRecord, view: RuleRecord, where: string) => {
    const held = { ...pointedShipment([r], all).pointed, [r.id]: view };
    return parseAnswer(r.text_he ?? "").flatMap((p) => (p.kind === "slot" && fillSlot(p, { rules: held, today }).kind === "missing" ? [`${r.id}${where}: {${p.id}:${p.figure}}`] : []));
  };

  it("names a figure the records its card is given hold", () => {
    expect(Object.values(all).flatMap((r) => unfilled(r, r, ""))).toEqual([]);
  });

  // on a company's page the card shows only that company's part of the record (D30, `pageView`), and its text reads that part
  it("names a figure a company's page keeps, on the page of each company the record names", () => {
    const links = companyLinks();
    const bad = Object.values(all).flatMap((r) => scopeCompanies(r).flatMap((c) => unfilled(r, pageView(r, [c.id], links), ` on ${c.id}`)));
    expect(bad).toEqual([]);
  });
});

// A fixture: TXA-30 with a text that reads its own minimum age, in years, and the capital-gains rate of TXS-01, a record it does not
// point at by itself.
const root = new URL("../../../", import.meta.url);
const record = (id: string): RuleRecord => JSON.parse(readFileSync(new URL(`data/rules/${id.toLowerCase()}.json`, root), "utf8")) as RuleRecord;
const txa30 = record("TXA-30");
const txs01 = record("TXS-01");
const own = txa30.figures?.minimum_age as { value: number; unit: string } | undefined;
if (!own || own.unit !== "years") throw new Error("TXA-30's minimum age is a figure in years");
const slottedText = "הגיל הוא {TXA-30:minimum_age} לפי המסמך, והמס {TXS-01:rate}. משפט שני.";
const slotted: RuleRecord = { ...txa30, title_he: undefined, text_he: slottedText };

describe("a rule text with slots", () => {
  // a number in years carries the unit's word after it, as on the card's figures
  const ownShown = `${formatValue(own.value, own.unit, "sourced")} ${provenance.unit.years}`;
  const source = { rules: { [slotted.id]: slotted, "TXS-01": txs01 }, today };

  it("travels with the records its slots read", () => {
    expect(Object.keys(pointedShipment([slotted], { "TXA-30": slotted, "TXS-01": txs01 }).pointed)).toContain("TXS-01");
  });

  it("is drawn on the card and on the rules page with each slot as its figure", () => {
    const data = { ...source, terms: {}, dimensions: {} } as unknown as ProvenanceData;
    for (const el of [createElement(RuleCard, { id: slotted.id, data, inline: true }), createElement(RuleDetail, { id: slotted.id, data, products: [] })]) {
      const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, el))).replace(/<!-- -->/g, "");
      const text = html.replace(/<[^>]+>/g, "");
      // the sentence reads as the plain text writes it: each figure in its place, no slot and no "—" left
      expect(text).toContain(`הגיל הוא ${ownShown} לפי המסמך, והמס `);
      expect(text).toContain(slotsAsText(slottedText, source));
      expect(text).not.toMatch(/\{[A-Z0-9]+-[A-Z0-9]+:/);
      // a slot is a figure the reader opens, as anywhere else on the site: a button whose words are the figure
      const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => (m[1] ?? "").replace(/<[^>]+>/g, ""));
      expect(buttons).toContain(formatValue(own.value, own.unit, "sourced"));
    }
  });

  it("is written as plain text with the same figures, wherever it is read as a string", () => {
    const plain = slotsAsText(slottedText, source);
    expect(plain.startsWith(`הגיל הוא ${ownShown} לפי המסמך`)).toBe(true);
    expect(plain).not.toContain("{");
    expect(plain).not.toContain(missingSlot);
    // the title read from the text, and the citation that opens with it
    expect(ruleTitle(slotted, source).text).toBe(plain.split(". ")[0]);
    const first = pickSources(slotted as unknown as SourcedRule)[0];
    if (!first) throw new Error("TXA-30 has a source");
    expect(citationText(slotted as unknown as SourcedRule, first, first.checked, source).startsWith(`הגיל הוא ${ownShown}`)).toBe(true);
  });

  it("says where its data lacks a slot's record, so the test above can catch it", () => {
    expect(slotsAsText("{NOPE-1:x}", { rules: {}, today })).toBe(missingSlot);
  });
});
