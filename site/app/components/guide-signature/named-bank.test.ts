// D30/D31 on the cash pages: a row or sentence that quotes one bank's own rate names that bank in the same row or sentence,
// never in a note beside it (the ladder's "פיקדון לשנה" showed Leumi's 1.8% as the deposit's rate).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { ProvenanceProvider } from "../provenance";
import { MakamVisual } from "./makam";
import { MoneyMarketDailyVisual } from "./money-market-daily";
import { SavingsPlanVisual } from "./savings-plan";

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" };
const render = (el: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(ProvenanceProvider, { data, children: el }) })));
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

describe("one bank's rate is named where it is quoted", () => {
  // the money-market page names no bank at all; its deposit row is the range across the collected banks (F-86), linked to the
  // bank-deposit page
  it("the ladder's deposit row is the range across the banks, names none and links to the bank-deposit page", () => {
    const sig = buildGuidePage("money-market-fund-daily")!.signature!;
    const html = render(createElement(MoneyMarketDailyVisual, { data: sig, today: "2026-10-26" }));
    const raw = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => m[0]).find((r) => text(r).includes("פיקדון לשנה"));
    expect(raw).toBeDefined();
    const row = text(raw!);
    for (const bank of ["לאומי", "הפועלים", "דיסקונט", "מזרחי"]) expect(row).not.toContain(bank);
    expect(row).toMatch(/1\.05%\s*עד\s*3\.25%/);
    expect(row).toMatch(/טווח ב־\s*9\s*פיקדונות רגילים שנאספו/);
    expect(raw).toContain('href="/guide/bank-deposit"');
    // the note under the table: how many of the collected deposits cannot be left early, naming none
    const notes = [...html.matchAll(/<ul[\s\S]*?<\/ul>/g)].map((m) => text(m[0])).find((t) => t.includes("פיקדון לשנה:"))!;
    expect(notes).toMatch(/ב־\s*7\s*מתוך\s*9\s*הפיקדונות הרגילים שנאספו אי אפשר למשוך/);
    for (const bank of ["לאומי", "הפועלים", "דיסקונט", "מזרחי"]) expect(notes).not.toContain(bank);
  });
  it("the makam page names the house of its commission, names no tie, and sets the deposit as a range", () => {
    const sig = buildGuidePage("makam")!.signature!;
    const t = text(render(createElement(MakamVisual, { data: sig, today: "2026-10-26" })));
    expect(t).not.toContain("לאומי");
    expect(t).not.toContain("עוד לא נאספו");
    expect(t).toMatch(/1\.05%\s*עד\s*3\.25%/);
    expect(t).toMatch(/לפי התעריפון של\s*(<[^>]*>)?\s*פסגות/);
    // PEPPER Invest is part of Leumi Trade, so it is no house of its own
    expect(t).not.toContain("הוא שקול לתעריפון של");
    expect(t).not.toContain("פפר");
    // with no tie the page crowns its pick (F-80), as the other guide pages do
    expect(t).toMatch(/הבחירה של האתר:\s*מבין\s*14\s*הבנקים ובתי ההשקעות שנאספו/);
  });
  it("the savings plan's one-off deposit sentence names its bank", () => {
    const sig = buildGuidePage("savings-plan")!.signature!;
    const html = render(createElement(SavingsPlanVisual, { data: sig, today: "2026-10-26" }));
    const sentence = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]!)).find((p) => p.includes("בפיקדון חד־פעמי"));
    expect(sentence).toBeDefined();
    expect(sentence).toContain("של לאומי");
  });
});
