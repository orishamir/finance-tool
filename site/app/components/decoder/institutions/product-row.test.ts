// Every bank product row says what each of its values is: a figure, a word, "unknown", or an open question with its lock, never the
// record's own "null" (Hapoalim's WIN WIN printed "null" as its tax, a best-of deposit no tax rule covers yet).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildInstitution } from "../../../lib/institutions.server";
import { loadDepositTerms } from "../../../lib/instruments.server";
import { numbers, r4catalogue, strength } from "../../../copy";
import { depositKindRules, depositLabels, exitWords, printedQuotes } from "../../../lib/deposit-kind";
import { loadRules } from "../../../lib/data.server";
import { ProvenanceProvider, openQuestionOf } from "../../provenance";
import { ValueSheet } from "../../provenance-sheets";
import { BankProductRow } from "./product-row";

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-06" };
const allRules = loadRules();
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("bank product rows", () => {
  const banks = [...new Set(loadDepositTerms().map((d) => d.bank))];
  // each row with the rules its own page loads, as the page renders it (an empty set hid a missing BANK-21)
  const rows = banks.flatMap((id) => {
    const page = buildInstitution(id);
    const known = new Set(Object.keys(page?.rules ?? {}));
    return page?.groups.flatMap((g) => g.products.map((p) => ({ p, wrapperName: g.wrapperName, known }))) ?? [];
  });
  const render = (r: (typeof rows)[number]) =>
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BankProductRow, { p: r.p, known: r.known, wrapperName: r.wrapperName }) })));

  it("never print a record's null or undefined", () => {
    expect(rows.length).toBeGreaterThan(20);
    const bad = rows.filter((r) => /\b(null|undefined|NaN)\b/.test(text(render(r)))).map((r) => r.p.id);
    expect(bad).toEqual([]);
  });

  it("show a tax no rule covers as an open question", () => {
    const winWin = rows.find((r) => r.p.id === "hapoalim-win-win-leshana")!;
    expect(text(render(winWin))).toContain(strength.open.label);
    // the value names its question, and neither its sheet nor its label calls it sourced
    expect(openQuestionOf(winWin.p.taxBucket)).toBe("TXI OQ19");
    expect(render(winWin)).not.toMatch(new RegExp(`aria-label="${strength.open.label}, ${numbers.legend.sourced}`));
    const sheet = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ValueSheet, { value: winWin.p.taxBucket, exact: false, data, headId: "h", descId: "d" }) })));
    expect(text(sheet)).not.toContain(numbers.legend.sourced);
    expect(text(sheet)).toContain(strength.open.line);
  });

  // Mizrahi-Tefahot 287 can be left any day after its first week, and its card said "אין"
  it("say a deposit's exit points as its record has them", () => {
    const daily = rows.find((r) => r.p.id === "mizrahi-tefahot-rimonim-yomi-prime-shana-287")!;
    expect(daily.p.exitPoints).toEqual({ exists: true, everyMonths: null });
    const exits = (r: (typeof rows)[number]) => /תחנות יציאה\s*<\/dt>\s*<dd[^>]*>\s*<span[^>]*>([^<]*)</.exec(render(r))?.[1]?.trim();
    expect(exits(daily)).toBe(r4catalogue.exits.someCard);
    const said = (r: (typeof rows)[number]) => (r.p.exitPoints.exists && !r.p.exitPoints.everyMonths && r.p.conditions ? r4catalogue.exits.someCard : exitWords(r.p.exitPoints.exists, r.p.exitPoints.everyMonths));
    for (const r of rows) expect(exits(r), r.p.id).toBe(said(r));
    // a deposit that cannot be broken but has exits says where the money comes out
    const breakWord = (r: (typeof rows)[number]) => /שבירה\s*<\/dt>\s*<dd[^>]*>\s*<span[^>]*>([^<]*)</.exec(render(r))?.[1]?.trim();
    expect(breakWord(daily)).toBe(r4catalogue.breakAtExits);
    expect(exitWords(true, 1)).toBe("כל חודש");
    expect(exitWords(true, 3)).toBe("כל 3 חודשים");
  });

  // the cards did not say what sets a deposit apart
  it("label a deposit's kind and print the bank's conditions and doubt, never its English notes", () => {
    for (const r of rows) {
      const html = render(r);
      for (const v of r.p.variant) expect(html, `${r.p.id} ${v}`).toContain(`data-label="deposit-${v.replace(/_/g, "-")}"`);
      if (r.p.conditions && !r.p.currentAccount) expect(text(html), r.p.id).toContain(r4catalogue.conditionsLead);
      if (r.p.doubt) expect(text(html), r.p.id).toContain(r.p.doubt.slice(0, 12));
      // the records' working notes are English: no Latin sentence reaches a card, folded or not
      expect(text(html), r.p.id).not.toMatch(/\b(Printed|Read|Conditions|DOUBT|Nominal)\b/);
      for (const q of [...r.p.breakTerms.quotes, r.p.conditions ?? "", r.p.doubt ?? ""]) expect(q, r.p.id).not.toMatch(/[A-Za-z]{3,}\s+[A-Za-z]{3,}/);
    }
    const closed = rows.find((r) => r.p.id === "discount-shana-kvua-kol-habankim-0513")!;
    expect(text(render(closed))).toContain("רק למי שאין לו חשבון עו״ש בדיסקונט");
    // the label's sheet gives its rule: the page loads the rules its labels cite (BANK-21 was missing)
    expect(depositLabels(closed.p.variant, closed.known, closed.p.table).find((l) => l.id === "deposit-closed-system")?.rules).toEqual(["BANK-21"]);
    for (const r of rows) for (const id of depositKindRules(r.p.variant).filter((id) => allRules[id])) expect(r.known.has(id), `${r.p.id} ${id}`).toBe(true);
    expect(rows.find((r) => r.p.id === "discount-kvua-leshana-mivtza-0183")!.p.variant).toContain("campaign");
    const litchi = rows.find((r) => r.p.id === "mizrahi-tefahot-litchi-kvua-shana-189")!;
    expect(litchi.p.rate.notes).toBe(litchi.p.doubt);
  });

  it("quote only the bank's own words about a break", () => {
    expect(printedQuotes("Current account: money is available at any time; no break mechanism is printed.")).toEqual([]);
    const d = rows.find((r) => r.p.id === "discount-shana-kvua-kol-habankim-0513")!;
    expect(d.p.breakTerms.quotes[0]).toBe("אפשרות לשבירת פיקדון: קיימת עם קנס שבירה");
    expect(d.p.breakTerms.quotes.some((q) => q.includes("תיתכן פגיעה בקרן הפיקדון"))).toBe(true);
    for (const r of rows.filter((r) => r.p.currentAccount)) expect(r.p.breakTerms.quotes, r.p.id).toEqual([]);
  });
});
