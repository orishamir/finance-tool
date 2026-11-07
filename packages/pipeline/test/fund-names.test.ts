// A fund's name as its report prints it: brackets that close in order, and no Hebrew letter glued to a bracket (2026-11-05).
import { describe, expect, it } from "vitest";
import { checkFundNames, checkTitleBrackets } from "../src/index.ts";

const of = (...he: string[]) => checkFundNames({ names: { he, en: [], tase: [] } } as never);

describe("checkFundNames", () => {
  it("passes a name as the report prints it", () => {
    expect(of("MTF סל (4D) S&P 500", 'קסם (4A) ETF ת"א 90', "מחקה (שקלית)")).toEqual([]);
  });
  it("fails a bracket that does not close, or closes before it opens", () => {
    expect(of("MTF סל (S&P 500 (4D")).toHaveLength(1);
    expect(of('קסם 4A) ETF) ת"א 90')).toHaveLength(1);
  });
  it("fails a Hebrew letter glued to the outside of a bracket", () => {
    expect(of("מור סל (4D)י S&P 500")).toHaveLength(1);
    expect(of("קסם KTF י(4D) MSCI World")).toHaveLength(1);
  });
});

describe("checkTitleBrackets (lens review S3)", () => {
  it("refuses a title that quotes a fund's name broken by the right-to-left copy", () => {
    expect(checkTitleBrackets('MTF, דוח שנתי "MTF מחקה (Nasdaq 100 (4D" (5134531), 31.12.2025')[0]).toMatch(/does not close/);
    expect(checkTitleBrackets('מור, דוח שנתי "מור מחקה (4D)י NASDAQ 100" (5117585), 31.12.2025')[0]).toMatch(/glued/);
  });
  it("passes the names as the reports print them, and a law's section marks", () => {
    expect(checkTitleBrackets('MTF, דוח שנתי "MTF מחקה (4D) Nasdaq 100" (5134531), 31.12.2025')).toEqual([]);
    expect(checkTitleBrackets('קסם, דוח שנתי "קסם (4A) KTF ת"א 35" (5124490), 30.6.2026')).toEqual([]);
    expect(checkTitleBrackets("פקודת מס הכנסה [נוסח חדש], p.204, s.125ג(ג)(1)")).toEqual([]);
  });
});
