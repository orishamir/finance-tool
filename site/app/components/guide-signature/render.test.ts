// Smoke: each G1 visual renders on the server with its page data, inside the providers the guide page gives.
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { ProvenanceProvider } from "../provenance";
import { WorthKnowing, worthRows } from "../guide/worth-knowing";
import { accountWorthRow } from "./current-account";
import { SignatureFrame, signatureRegistry } from "./index";

const inProviders = (p: NonNullable<ReturnType<typeof buildGuidePage>>, child: ReactNode) =>
  createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today }, children: child }) }));

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

  it("leads with the loss: idle money is worth less in today's money, and the most common rate is nothing", () => {
    expect(text).toContain("בעו״ש שווים");
    expect(text).toContain("8,203");
    expect(text).toContain("1,797");
    // 4 of the 8 banks print 0%: half, so "most" is not said (F-85 is the most common rate)
    expect(text).toContain("הריבית הנפוצה ביותר על עו״ש היא אפס");
    expect(text).toContain("הריבית הנפוצה ביותר בעו״ש היא");
    expect(text).not.toContain("רוב הבנקים");
  });

  it("no longer names Leumi or the conditions switch", () => {
    expect(text).not.toContain("לפי הפרסום של לאומי");
    expect(text).not.toContain("בנקים אחרים עוד לא נאספו");
    expect(html).not.toContain("sig-account-cond");
  });

  it("holds the folded table: closed by default, a row for each paying bank and one for those that pay nothing, and no bank picker (removed, founder 2026-11-08)", () => {
    expect(html).toMatch(/<details[^>]*id="current-account-banks"/);
    expect(html).not.toMatch(/<details[^>]*id="current-account-banks"[^>]*\sopen/);
    for (const name of ["דיסקונט", "הבינלאומי", "לאומי", "יהב"]) expect(text).toContain(name);
    expect(text).toContain("לא משלמים ריבית");
    expect(text).toContain("הפועלים, מזרחי טפחות ומסד");
    expect(text).toContain("״לא מוצעת ריבית על יתרת זכות״");
    expect(text).toMatch(/מרכנתיל\s+כתב בפרסום ריבית/);
    expect(html).not.toMatch(/class="sec-chip/);
  });

  it("tints First International's and Mercantile's own rates: the doubt is the figure's, said in its sheet, with no chip or note on the page (founder, 2026-11-08)", () => {
    expect(html.match(/class="[^"]*\bnum-doubt\b/g)).toHaveLength(2);
    expect(html.match(/aria-label="[^"]*יש ספק/g)).toHaveLength(2);
    expect(text).not.toContain("יש ספק");
    expect(text).not.toContain("לא בטוח שהבנק לא משלם");
    expect(text).toContain("עד 31.12.2026");
  });

  it("says how many banks pay nothing inside the banks' table, not under the headline (founder, 2026-11-08)", () => {
    const fold = html.slice(html.search(/<details[^>]*id="current-account-banks"/));
    expect(fold.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ")).toMatch(/הריבית הנפוצה ביותר בעו״ש היא/);
    expect(html.slice(0, html.search(/<details[^>]*id="current-account-banks"/)).replace(/<[^>]+>/g, " ")).not.toMatch(/הריבית הנפוצה ביותר בעו״ש היא/);
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
    expect(text).toContain("כולם בתנאים ועל יתרה של עד");
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

describe("the pension visuals", () => {
  const textOf = (id: string) => {
    const p = buildGuidePage(id)!;
    const html = renderToString(inProviders(p, createElement(SignatureFrame, { id, data: p.signature!, today: p.today, timeline: null })));
    return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");
  };
  it("says on the general fund's page that none of the minimum deposit reaches it, with the comprehensive fund's ceiling, and shows no balance", () => {
    const text = textOf("pension-general");
    expect(text).toContain("לקרן הכללית לא מגיע מההפקדה הזו כלום");
    expect(text).toContain("5,645.29");
    expect(text).not.toContain("מה שנצבר בקרן אחרי");
    expect(text).not.toContain("דמי הביטוח בקרן הפנסיה");
  });
  it("says what the balance assumes: deposits flat in shekels, and no insurance until it is entered", () => {
    const text = textOf("provident-for-annuity");
    expect(text).toContain("ההפקדות באותו סכום בשקלים בכל השנים");
    expect(text).not.toContain("בשתי הדרכים");
    // a provident fund for annuity has no insurance, so the line does not say it is left out
    expect(text).not.toContain("בלי דמי ביטוח");
  });
  it("says payroll gives the credit only on a direction or a notice (reg. 9(א)), that a general notice is open (TXP OQ6), and that the year's tax otherwise is a reading", () => {
    for (const id of ["pension-comprehensive", "pension-general", "provident-for-annuity"]) {
      const text = textOf(id);
      expect(text, id).toContain("רק אם רשות המסים הורתה כך למעסיק לבקשתכם");
      expect(text, id).toContain("אם יש הודעה כזו, עוד לא ידוע");
      expect(text, id).toContain("בלי אחת מהשתיים, הוא מגיע כשמחושב המס של השנה");
      expect(text, id).toContain("קריאה של האתר");
      expect(text, id).not.toContain("שמחושב בדוח השנתי");
    }
  });
});
