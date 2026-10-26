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
import { MoneyMarketDailyVisual } from "./money-market-daily";
import { SavingsPlanVisual } from "./savings-plan";

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" };
const render = (el: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(GoalsProvider, { presets: {}, children: createElement(ProvenanceProvider, { data, children: el }) }) })));
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

describe("one bank's rate is named where it is quoted", () => {
  it("the ladder's deposit row names its bank", () => {
    const sig = buildGuidePage("money-market-fund-daily")!.signature!;
    const html = render(createElement(MoneyMarketDailyVisual, { data: sig, today: "2026-10-26" }));
    const rows = [...html.matchAll(/<li[\s\S]*?<\/li>/g)].map((m) => text(m[0]));
    const deposit = rows.find((r) => r.includes("פיקדון לשנה"));
    expect(deposit).toBeDefined();
    expect(deposit).toContain("של לאומי");
  });
  it("the savings plan's one-off deposit sentence names its bank", () => {
    const sig = buildGuidePage("savings-plan")!.signature!;
    const html = render(createElement(SavingsPlanVisual, { data: sig, today: "2026-10-26" }));
    const sentence = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]!)).find((p) => p.includes("בפיקדון חד־פעמי"));
    expect(sentence).toBeDefined();
    expect(sentence).toContain("של לאומי");
  });
});
