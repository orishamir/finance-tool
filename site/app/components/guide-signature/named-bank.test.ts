// D30/D31 on the cash pages: a row or sentence that quotes one bank's own rate names that bank in the same row or sentence,
// never in a note beside it (founder, 2026-10-26: the ladder's "פיקדון לשנה" showed Leumi's 1.8% as the deposit's rate).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { GoalsProvider } from "../../lib/goal";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { ProvenanceProvider } from "../provenance";
import { BankDepositVisual } from "./bank-deposit";
import { MoneyMarketDailyVisual } from "./money-market-daily";
import { SavingsPlanVisual } from "./savings-plan";

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" };
const render = (el: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(GoalsProvider, { presets: {}, children: createElement(ProvenanceProvider, { data, children: el }) }) })));
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

describe("one bank's rate is named where it is quoted", () => {
  // 2026-10-26 (founder): the money-market page names no bank at all; its deposit row is the range across the collected banks (F-86),
  // linked to the bank-deposit page, where each bank's rate stands on the line that names it
  it("the ladder's deposit row is the range across the banks, names none and links to each bank's rate", () => {
    const sig = buildGuidePage("money-market-fund-daily")!.signature!;
    const html = render(createElement(MoneyMarketDailyVisual, { data: sig, today: "2026-10-26" }));
    const raw = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => m[0]).find((r) => text(r).includes("פיקדון לשנה"));
    expect(raw).toBeDefined();
    const row = text(raw!);
    for (const bank of ["לאומי", "הפועלים", "דיסקונט", "מזרחי"]) expect(row).not.toContain(bank);
    expect(row).toMatch(/1\.55%\s*–\s*2\.25%/);
    expect(row).toMatch(/טווח ב־\s*4\s*בנקים/);
    expect(raw).toContain('href="/guide/bank-deposit"');
    // the note under the table: how many of the collected deposits cannot be left early, naming none, and the link to each bank's rate
    const notes = [...html.matchAll(/<ul[\s\S]*?<\/ul>/g)].map((m) => text(m[0])).find((t) => t.includes("פיקדון לשנה:"))!;
    expect(notes).toMatch(/ב־\s*3\s*מתוך\s*4\s*הבנקים שנאספו אי אפשר למשוך/);
    for (const bank of ["לאומי", "הפועלים", "דיסקונט", "מזרחי"]) expect(notes).not.toContain(bank);
    expect(html).toContain('href="/guide/bank-deposit#deposit-banks"');
  });
  it("the bank-deposit page lists each bank's one-year deposit at the anchor the ladder links to", () => {
    const sig = buildGuidePage("bank-deposit")!.signature!;
    const html = render(createElement(BankDepositVisual, { data: sig, today: "2026-10-26" }));
    const list = /<section id="deposit-banks"[\s\S]*?<\/section>/.exec(html);
    expect(list).not.toBeNull();
    const t = text(list![0]);
    for (const bank of ["לאומי", "הפועלים", "דיסקונט", "מזרחי"]) expect(t).toContain(bank);
  });
  it("the savings plan's one-off deposit sentence names its bank", () => {
    const sig = buildGuidePage("savings-plan")!.signature!;
    const html = render(createElement(SavingsPlanVisual, { data: sig, today: "2026-10-26" }));
    const sentence = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]!)).find((p) => p.includes("בפיקדון חד־פעמי"));
    expect(sentence).toBeDefined();
    expect(sentence).toContain("של לאומי");
  });
});
