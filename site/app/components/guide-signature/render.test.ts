// Smoke: each G1 visual renders on the server with its page data, inside the providers the guide page gives.
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { guideSignature as sigCopy } from "../../copy";
import { sheetRules, type SiteValue } from "../../lib/value";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { ProvenanceProvider } from "../provenance";
import { WorthKnowing, worthRows } from "../guide/worth-knowing";
import { accountWorthRow } from "./current-account";
import { typedShareLimits } from "./keren-hishtalmut";
import { SignatureFrame, signatureRegistry } from "./index";
import { fact } from "../../lib/guide-signature";
import { studyYears, waitFigures } from "../../lib/guide-signature-g2";
import { p05Number } from "../../lib/engine";
import { fmt } from "../../lib/format";

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
  it("says what the balance assumes: the net outlay flat in shekels, so the gross deposit can grow from 2028, and no insurance until it is entered", () => {
    const text = textOf("provident-for-annuity");
    expect(text).toContain("מה שיוצא מהכיס שלכם, אחרי הזיכוי, באותו סכום בשקלים בכל השנים");
    expect(text).toContain("ולכן ההפקדה עצמה יכולה לגדול");
    expect(text).not.toContain("בשתי הדרכים");
    // a provident fund for annuity has no insurance, so the line does not say it is left out
    expect(text).not.toContain("בלי דמי ביטוח");
  });
  it("names the two payroll routes (TXP-34), says whether the Director's notice exists today is open (TXP OQ6), and says the credit is otherwise computed in the annual return (TXP-02)", () => {
    for (const id of ["pension-comprehensive", "pension-general", "provident-for-annuity"]) {
      const text = textOf(id);
      expect(text, id).toContain("רק בשתי דרכים");
      expect(text, id).toContain("רשות המסים הורתה לו לבקשתכם");
      expect(text, id).toContain("מנהל רשות המסים הודיע למעסיקים");
      expect(text, id).toContain("אם יש היום הודעה כזו על הפקדות לפנסיה, האתר לא מצא בכללים שקרא");
      expect(text, id).toContain("בלי אחת מהשתיים, הזיכוי מחושב בדוח השנתי, לפי הטופס השנתי מהמעסיק");
      expect(text, id).not.toContain("אם הוא מגיע כבר עם המשכורת");
    }
  });
});

describe("study fund page", () => {
  const p = buildGuidePage("keren-hishtalmut")!;
  const d = p.signature!;
  const html = renderToString(inProviders(p, createElement(SignatureFrame, { id: "keren-hishtalmut", data: d, today: p.today, timeline: null })));
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");

  it("a share the reader typed keeps the limit it is measured against within the figure's reach (TXH-01, TXH-08); a default share is that limit", () => {
    const employerPct = fact(d, "employerPct");
    const ownPct = fact(d, "ownPct");
    // a limit's figure opens the rule it is from (`ruleFigure`)
    const reached = (inputs: Record<string, SiteValue>) => Object.values(inputs).flatMap((v) => v.rule_ids ?? []);
    const typedBoth = typedShareLimits({ employee: true, employerTyped: true, ownTyped: true, employerPct, ownPct });
    expect(reached(typedBoth.employer)).toContain("TXH-01");
    expect(reached(typedBoth.own)).toContain("TXH-08");
    // at its default the share's own input is the limit's figure, so it is not listed twice; a self-employed person types no share
    expect(typedShareLimits({ employee: true, employerTyped: false, ownTyped: false, employerPct, ownPct })).toEqual({ employer: {}, own: {} });
    expect(typedShareLimits({ employee: false, employerTyped: true, ownTyped: true, employerPct, ownPct })).toEqual({ employer: {}, own: {} });
  });

  it("counts what waiting adds above the deposits of the years between, which are paid either way (F-96)", () => {
    const income = p05Number(d.bundles["keren-hishtalmut"]!.p05, "annual_income") / 12;
    const plan = { employment: "employee" as const, income, ownMonthly: (income * Number(fact(d, "ownPct")!.value)) / 100, employerMonthly: (income * Number(fact(d, "employerPct")!.value)) / 100, returnPct: p05Number(d.bundles["keren-hishtalmut"]!.p05, "A-01"), feePct: null };
    const years = studyYears(d, plan, 12);
    const lock = Number(fact(d, "lockYears")!.value);
    const at = (y: number) => years[y - 1]!.slice!;
    const more = Math.round(waitFigures(at(lock - 1), at(lock)).more);
    expect(more).toBeLessThan(Math.round(at(lock).net - at(lock - 1).net));
    expect(text).toContain(`${fmt.nisWhole(more)} מעבר להפקדות שבינתיים`);
    // the tax saved is its own figure, not a part of what waiting adds, which can be smaller than it or below zero
    expect(text).not.toContain("מתוכם");
    expect(text).toContain("מס הכנסה במשיכה שלא משלמים:");
    // the multiple is of everything deposited, the employer's money too, not of the person's own deposits alone
    expect(text).toContain("ממה שהופקד, מכם ומהמעסיק");
  });
});

describe("each figure of a visual lists only the rules that changed it (method §13)", () => {
  // every figure a visual hands to `Num`, kept by a `Num` that records its value: the visuals are loaded afresh with it in place (the fast
  // tests share their modules, so a mock declared for the file alone would not reach a module another file already loaded)
  let all: { id: string; figures: { about: string; ids: string[] }[] }[] = [];
  beforeAll(async () => {
    const shown: SiteValue[] = [];
    vi.resetModules();
    vi.doMock("../provenance", async (importOriginal) => {
      const real = await importOriginal<typeof import("../provenance")>();
      const Num: typeof real.Num = (props) => {
        shown.push(props.value);
        return real.Num(props);
      };
      return { ...real, Num };
    });
    const prov = await import("../provenance");
    const frame = await import("./index");
    const { InputsProvider: Inputs } = await import("../../lib/inputs");
    const { buildGuidePage: build } = await import("../../lib/guide.server");
    // the visuals as the page first draws them: no age entered, and the example income, far below the surtax's threshold
    all = Object.keys(frame.signatureRegistry).map((id) => {
      shown.length = 0;
      const p = build(id)!;
      const page = createElement(frame.SignatureFrame, { id, data: p.signature!, today: p.today, timeline: null });
      renderToString(createElement(MemoryRouter, null, createElement(Inputs, { children: createElement(prov.ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today }, children: page }) })));
      return { id, figures: shown.filter((v) => v.state === "computed").map((v) => ({ about: v.about ?? "", ids: sheetRules(v).map((r) => r.id) })) };
    });
    vi.doUnmock("../provenance");
    vi.resetModules();
  });

  it("no figure names the rules from 60 with no age, nor the surtax where it is 0", () => {
    for (const { id, figures: fs } of all) {
      expect(fs.length, id).toBeGreaterThan(0);
      for (const f of fs) {
        expect(f.ids.filter((r) => ["TXG-04", "TXG-07", "TXS-23"].includes(r)), `${id}: ${f.about}`).toEqual([]);
        expect(f.ids.filter((r) => ["TXG-09", "TXG-10"].includes(r)), `${id}: ${f.about}`).toEqual([]);
      }
    }
  });
  it("a makam fee names no tax rule", () => {
    const fees = all.find((x) => x.id === "makam")!.figures.filter((f) => f.about === sigCopy.makam.about.fees || f.about === sigCopy.makam.about.custody);
    expect(fees.length).toBeGreaterThan(0);
    for (const f of fees) expect(f.ids.filter((r) => r.startsWith("TX")), f.about).toEqual([]);
  });
  it("a pension deposit names only the minimum rates and the average wage", () => {
    const deposits: string[] = [sigCopy.pension.about.you, sigCopy.pension.about.employer, sigCopy.pension.about.severance, sigCopy.pension.about.total];
    for (const id of ["pension-comprehensive", "pension-general", "provident-for-annuity"]) {
      const fs = all.find((x) => x.id === id)?.figures.filter((f) => deposits.includes(f.about)) ?? [];
      expect(fs.length, id).toBeGreaterThan(0);
      for (const f of fs) expect(f.ids.filter((r) => r !== "PEN-03" && r !== "PEN-04"), `${id}: ${f.about}`).toEqual([]);
    }
  });
  it("the current account's headline at 0% names no tax rule: no interest, no tax", () => {
    const head = all.find((x) => x.id === "current-account")!.figures.filter((f) => f.about === sigCopy.account.about.account);
    expect(head.length).toBeGreaterThan(0);
    for (const f of head) expect(f.ids.filter((r) => r.startsWith("TX")), f.about).toEqual([]);
  });
});
