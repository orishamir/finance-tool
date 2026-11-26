// On one rule card, each fact is shown once: the day a source was read stands on its source line, and the record's own date only
// on a card with no source.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { rule as ruleCopy } from "../copy";
import { fmt } from "../lib/format";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { RuleCard, RuleDetail } from "./provenance-sheets";

const root = new URL("../../../", import.meta.url);
const record = (id: string): RuleRecord => JSON.parse(readFileSync(new URL(`data/rules/${id.toLowerCase()}.json`, root), "utf8")) as RuleRecord;
const dataOf = (rules: Record<string, RuleRecord>, more: Partial<ProvenanceData> = {}): ProvenanceData => ({ rules, terms: {}, dimensions: {}, today: "2026-11-26", ...more }) as ProvenanceData;
/** The card's words, tags gone. */
const words = (el: ReturnType<typeof createElement>, data: ProvenanceData) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el }))).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const count = (text: string, part: string) => text.split(part).length - 1;

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
      expect(text).toContain(`${ruleCopy.checked} ${fmt.date(r.sources![0]!.checked)}`);
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
