// The words of the account map's card and headline (F-131), in every case, against the sentences they must make: a switch is where another
// account becomes clearly cheaper (by the tie threshold or more), and within it two accounts are about the same.
import { describe, expect, it } from "vitest";
import type { AccountMap, MapSwitch } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { mapWords } from "./account-map";

const names: Record<string, string> = { psagot: "פסגות", ibi: "אי.בי.אי", "one-zero": "וואן זירו" };
const grid = { cols: 0, rows: 0, first: [], second: [], ahead: [] };
const base: AccountMap = { max: { amount: 200_000, monthly: 4000 }, bottom: 40, plan: { amount: 10_000, monthly: 500, lead: { kind: "clear", first: "psagot" } }, accounts: ["psagot", "ibi", "one-zero"], asked: ["psagot", "ibi", "one-zero"], field: grid, edge: grid, switches: { amount: null, monthly: null }, stretches: { amount: null, monthly: null }, changes: { amount: { band: null, even: null }, monthly: { band: null, even: null } }, equal: { amount: null, monthly: null } };
const up = (at: number, to = "ibi"): MapSwitch => ({ at, dir: "up", to });
/** The card's answer and line and the headline, as plain words (the isolates a figure keeps its order with, and the joiner that keeps "כ־" on its figure's line, set aside). */
function said(map: AccountMap, house = "psagot") {
  const w = mapWords(map, house, (id) => names[id] ?? id, (s) => fmt.nisRough(s.at), "0.5%");
  const plain = (xs: string[]) => xs.join("").replace(/[⁦-⁩⁠]/g, "").replace(/ /g, " ");
  return { answer: plain(w.answer), note: plain(w.note), head: plain(w.head) };
}

describe("the account map's words", () => {
  it("a switch both ways to the same account", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: up(2300) } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "או מעל כ־2,300 ₪ בחודש. זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור מעל כ־108 אלף ₪ היום, או מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch each way to another account: each named", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: up(2300, "one-zero") } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "וואן זירו מעל כ־2,300 ₪ בחודש. זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור מעל כ־108 אלף ₪ היום. וואן זירו זול יותר בבירור מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch only one way: today's amount, or the monthly deposit", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: null } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור מעל כ־108 אלף ₪ היום.",
    });
    expect(said({ ...base, switches: { amount: null, monthly: up(2300) } })).toEqual({
      answer: "אי.בי.אי, מעל כ־2,300 ₪ בחודש",
      note: "זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch at a lower amount", () => {
    expect(said({ ...base, switches: { amount: { at: 76_000, dir: "down", to: "ibi" }, monthly: null } })).toEqual({
      answer: "אי.בי.אי, מתחת לכ־76 אלף ₪",
      note: "זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור מתחת לכ־76 אלף ₪ היום.",
    });
  });

  it("no account clearly cheaper along either of the plan's lines", () => {
    expect(said(base)).toEqual({
      answer: "אף חשבון לא זול בבירור מפסגות",
      note: "גם בסכום אחר היום או בהפקדה אחרת, בטווח שהאתר בודק",
      head: "בתוכנית שלכם פסגות הכי זול. אף חשבון אחר לא נעשה זול יותר בבירור, גם בסכום אחר היום או בהפקדה חודשית אחרת, בטווח שהאתר בודק.",
    });
  });

  it("another account clearly cheaper only in a stretch of a line: its two ends", () => {
    const stretch = { lo: 30_000, hi: 70_000, dir: "up" as const, to: "ibi" };
    expect(said({ ...base, stretches: { amount: stretch, monthly: null } })).toEqual({
      answer: "אי.בי.אי, בין כ־30 אלף ₪ לכ־70 אלף ₪",
      note: "זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור בין כ־30 אלף ₪ לכ־70 אלף ₪ היום.",
    });
    // a switch on one line, a stretch on the other
    expect(said({ ...base, switches: { amount: up(108_000), monthly: null }, stretches: { amount: null, monthly: { lo: 800, hi: 1500, dir: "up", to: "ibi" } } }).note).toBe(
      "או בין כ־800 ₪ לכ־1,500 ₪ בחודש. זול יותר בבירור: בהפרש של 0.5% לפחות",
    );
  });

  it("no change along the plan's lines, but another account clearly first elsewhere on the map: never that nothing changes", () => {
    // אי.בי.אי (index 1) clearly first at one node of the field
    const field = { cols: 2, rows: 1, first: [0, 1], second: [-1, -1], ahead: [1, 1.4] };
    expect(said({ ...base, field })).toEqual({
      answer: "אי.בי.אי, בצירופים אחרים במפה",
      note: "זול יותר בבירור: בהפרש של 0.5% לפחות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר בבירור בצירופים אחרים במפה.",
    });
    // on a plan in the band, psagot about the same as ibi at the first node, and ibi clear at the other
    const nearField = { cols: 2, rows: 1, first: [0, 1], second: [1, -1], ahead: [0.5, 1.4] };
    const near: AccountMap = { ...base, field: nearField, plan: { ...base.plan, lead: { kind: "near", tied: ["psagot", "ibi"] } } };
    expect(said(near).head).toBe("בתוכנית שלכם פסגות ואי.בי.אי בערך אותו דבר. אי.בי.אי זול יותר בבירור בצירופים אחרים במפה.");
  });

  it("names an account clear elsewhere only over a share of the map: a hundredth of its areas, or a tenth of the bottom edge", () => {
    // one clear node of 200 in the areas, and one of 20 on the bottom edge (no deposit, near 300 ₪): a lone node, not named
    const lone = (n: number, at: number) => ({ cols: n, rows: 1, first: Array.from({ length: n }, (_, i) => (i === at ? 1 : 0)), second: Array.from({ length: n }, () => -1), ahead: Array.from({ length: n }, () => 1) });
    expect(said({ ...base, field: lone(200, 7) }).answer).toBe("אף חשבון לא זול בבירור מפסגות");
    expect(said({ ...base, field: lone(200, 7), edge: lone(20, 3) }).answer).toBe("אף חשבון לא זול בבירור מפסגות");
    // two of 200 in the areas, or two neighbours of 20 on the edge: named
    const two = (n: number) => ({ ...lone(n, 7), first: Array.from({ length: n }, (_, i) => (i === 7 || i === 8 ? 1 : 0)) });
    expect(said({ ...base, field: two(200) }).answer).toBe("אי.בי.אי, בצירופים אחרים במפה");
    expect(said({ ...base, field: lone(200, 7), edge: two(20) }).answer).toBe("אי.בי.אי, בצירופים אחרים במפה");
  });

  it("one account cheapest everywhere on the map", () => {
    expect(said({ ...base, accounts: ["psagot"] })).toEqual({
      answer: "אף חשבון",
      note: "פסגות הכי זול בכל המפה",
      head: "בתוכנית שלכם פסגות הכי זול. הוא הכי זול בכל צירוף במפה.",
    });
  });

  it("calls no account beaten where it has no ranked price (F-80): such nodes count neither for one account everywhere nor for another elsewhere", () => {
    // psagot alone on the map, but אי.בי.אי (bit 1 of `asked`) has no ranked price at one node: psagot is not the cheapest in every combination
    const gap = { cols: 3, rows: 1, first: [0, 0, 0], second: [-1, -1, -1], ahead: [1, 1, 1], missing: [0, 2, 0] };
    expect(said({ ...base, accounts: ["psagot"], field: gap }).head).toBe("בתוכנית שלכם פסגות הכי זול. אף חשבון אחר לא נעשה זול יותר בבירור, גם בסכום אחר היום או בהפקדה חודשית אחרת, בטווח שהאתר בודק.");
    // אי.בי.אי clear on two nodes of 200, where psagot (bit 0), the plan's account, has no ranked price: not named elsewhere
    const n = 200;
    const field = { cols: n, rows: 1, first: Array.from({ length: n }, (_, i) => (i === 7 || i === 8 ? 1 : 0)), second: Array.from({ length: n }, () => -1), ahead: Array.from({ length: n }, () => 1), missing: Array.from({ length: n }, (_, i) => (i === 7 || i === 8 ? 1 : 0)) };
    expect(said({ ...base, field }).answer).toBe("אף חשבון לא זול בבירור מפסגות");
    // the same on the bottom edge's run
    const edge = { ...field, cols: 20, first: field.first.slice(0, 20), second: field.second.slice(0, 20), ahead: field.ahead.slice(0, 20), missing: field.missing.slice(0, 20) };
    expect(said({ ...base, edge }).answer).toBe("אף חשבון לא זול בבירור מפסגות");
    // with psagot priced there, both are named
    expect(said({ ...base, field: { ...field, missing: undefined } }).answer).toBe("אי.בי.אי, בצירופים אחרים במפה");
  });

  it("the receipt's account is not the cheapest at the plan", () => {
    const ibiFirst: AccountMap = { ...base, plan: { ...base.plan, lead: { kind: "clear", first: "ibi" } } };
    expect(said({ ...ibiFirst, switches: { amount: { at: 76_000, dir: "down", to: "psagot" }, monthly: null } })).toEqual({
      answer: "אי.בי.אי, כבר בתוכנית שלכם",
      note: "במקום פסגות",
      head: "בתוכנית שלכם אי.בי.אי זול יותר מפסגות. פסגות זול יותר בבירור מתחת לכ־76 אלף ₪ היום.",
    });
    expect(said({ ...ibiFirst, accounts: ["ibi"] }).head).toBe("בתוכנית שלכם אי.בי.אי זול יותר מפסגות. הוא הכי זול בכל צירוף במפה.");
  });

  it("the plan inside the band: the accounts about the same, and where one becomes clearly cheaper", () => {
    const near: AccountMap = { ...base, plan: { ...base.plan, lead: { kind: "near", tied: ["psagot", "ibi"] } } };
    expect(said({ ...near, switches: { amount: up(108_000), monthly: { at: 300, dir: "down", to: "psagot" } } })).toEqual({
      answer: "פסגות ואי.בי.אי בערך אותו דבר",
      note: "אי.בי.אי זול יותר בבירור מעל כ־108 אלף ₪",
      head: "בתוכנית שלכם פסגות ואי.בי.אי בערך אותו דבר. אי.בי.אי זול יותר בבירור מעל כ־108 אלף ₪ היום. פסגות זול יותר בבירור מתחת לכ־300 ₪ בחודש.",
    });
    expect(said(near)).toEqual({
      answer: "פסגות ואי.בי.אי בערך אותו דבר",
      note: "אף חשבון לא זול בבירור משניהם, בטווח שהאתר בודק",
      head: "בתוכנית שלכם פסגות ואי.בי.אי בערך אותו דבר. אף חשבון לא נעשה זול יותר בבירור משניהם, גם בסכום אחר היום או בהפקדה חודשית אחרת, בטווח שהאתר בודק.",
    });
    // three about the same: than all of them
    const three: AccountMap = { ...near, plan: { ...near.plan, lead: { kind: "near", tied: ["psagot", "ibi", "one-zero"] } } };
    expect(said(three).note).toBe("אף חשבון לא זול בבירור מכולם, בטווח שהאתר בודק");
  });

  it("a plan with nothing in it", () => {
    expect(said({ ...base, plan: { amount: 0, monthly: 0, lead: { kind: "empty" } } })).toEqual({
      answer: "אין כסף בתוכנית",
      note: "אין כסף בחשבון, אז כל החשבונות משאירים 0 ₪",
      head: "בתוכנית שלכם אין כסף, אז כל החשבונות משאירים 0 ₪. המפה מראה איזה חשבון זול יותר בכל צירוף אחר.",
    });
  });
});
