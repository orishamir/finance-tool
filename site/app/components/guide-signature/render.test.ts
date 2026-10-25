// Smoke: each G1 visual renders on the server with its page data, inside the providers the guide page gives.
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { GoalsProvider } from "../../lib/goal";
import { ProvenanceProvider } from "../provenance";
import { WorthKnowing, worthRows } from "../guide/worth-knowing";
import { accountWorthRow } from "./current-account";
import { SignatureFrame, signatureRegistry } from "./index";

const inProviders = (p: NonNullable<ReturnType<typeof buildGuidePage>>, child: ReactNode) =>
  createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(GoalsProvider, { presets: {}, children: createElement(ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today }, children: child }) }) }));

describe("signature visuals render", () => {
  for (const id of Object.keys(signatureRegistry)) {
    it(id, () => {
      const p = buildGuidePage(id)!;
      const html = renderToString(inProviders(p, createElement(SignatureFrame, { id, data: p.signature!, today: p.today, timeline: null })));
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain("num");
    });
  }
});

describe("current account page", () => {
  const p = buildGuidePage("current-account")!;
  const html = renderToString(inProviders(p, createElement(SignatureFrame, { id: "current-account", data: p.signature!, today: p.today, timeline: null })));
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");

  it("leads with the loss: idle money is worth less in today's money, and most banks pay nothing", () => {
    expect(text).toContain("בעו״ש שווים");
    expect(text).toContain("8,203");
    expect(text).toContain("1,797");
    expect(text).toContain("רוב הבנקים לא משלמים ריבית על עו״ש");
    expect(text).toContain("הריבית שרוב הבנקים משלמים");
  });

  it("no longer names Leumi or the conditions switch", () => {
    expect(text).not.toContain("לפי הפרסום של לאומי");
    expect(text).not.toContain("בנקים אחרים עוד לא נאספו");
    expect(html).not.toContain("sig-account-cond");
  });

  it("holds the folded table: closed by default, a row for each paying bank and one for those that pay nothing, a picker over the eight", () => {
    expect(html).toMatch(/<details[^>]*id="current-account-banks"/);
    expect(html).not.toMatch(/<details[^>]*id="current-account-banks"[^>]*\sopen/);
    for (const name of ["דיסקונט", "הבינלאומי", "לאומי", "יהב"]) expect(text).toContain(name);
    expect(text).toContain("לא משלמים ריבית");
    expect(text).toContain("הפועלים, מזרחי טפחות ומסד");
    expect(text).toContain("״לא מוצעת ריבית על יתרת זכות״");
    expect(text).toMatch(/מרכנתיל\s+יש ספק\s+כתב בפרסום ריבית/);
    expect(html.match(/aria-pressed/g)).toHaveLength(8);
  });

  it("flags First International and Mercantile with the caution mark and their own doubt", () => {
    expect(text).toContain("ההטבה בתוקף עד 31.03.2026");
    expect(text).toContain("לא בטוח שהבנק לא משלם");
    expect(text.match(/יש ספק/g)).toHaveLength(2); // one tag on First International's row, one on Mercantile's line in the row of the banks that pay nothing
    expect(text).toContain("עד 31.12.2026");
  });
});

describe("the worth-knowing row of the current account", () => {
  const p = buildGuidePage("current-account")!;
  const row = accountWorthRow(p.signature!)!;
  it("is a computed fact beside the rule rows, not a rule", () => {
    expect(row.kind).toBe("fact");
    const html = renderToString(inProviders(p, createElement(WorthKnowing, { rows: worthRows([], p.rules, p.today), facts: [row] })));
    const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");
    expect(text).toContain("שווה לדעת");
    expect(text).toContain("מתוך");
    expect(text).toContain("הבנקים שנאספו משלמים ריבית על יתרה בעו״ש");
    expect(text).toContain("כולם בתנאים ועל עד");
    expect(text).toContain("הכי הרבה:");
    expect(text).toContain("אצל דיסקונט");
    expect(html).toContain('href="#current-account-banks"');
    // every figure goes through the provenance component
    expect(html.match(/class="num /g)!.length).toBeGreaterThanOrEqual(4);
  });
  it("is absent for a page with no bank records", () => {
    expect(accountWorthRow({ ...p.signature!, banks: [] })).toBeNull();
  });
});
