// The words of the account map's card and headline (F-131), in every case, against the sentences they must make: a switch is where another
// account becomes clearly cheaper (by the tie threshold or more), and within it two accounts are about the same.
import { describe, expect, it } from "vitest";
import type { AccountMap, MapSwitch } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { mapWords } from "./account-map";

const names: Record<string, string> = { psagot: "פסגות", ibi: "אי.בי.אי", "one-zero": "וואן זירו" };
const grid = { cols: 0, rows: 0, first: [], second: [], ahead: [] };
const base: AccountMap = { max: { amount: 200_000, monthly: 4000 }, bottom: 40, plan: { amount: 10_000, monthly: 500, lead: { kind: "clear", first: "psagot" } }, accounts: ["psagot", "ibi", "one-zero"], field: grid, edge: grid, switches: { amount: null, monthly: null }, changes: { amount: { band: null, even: null }, monthly: { band: null, even: null } } };
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
      answer: "פסגות נשאר הכי זול",
      note: "אף חשבון לא זול יותר בבירור בסכום אחר",
      head: "בתוכנית שלכם פסגות הכי זול. אף חשבון אחר לא נעשה זול יותר בבירור, גם בסכום אחר היום או בהפקדה חודשית אחרת.",
    });
  });

  it("one account cheapest everywhere on the map", () => {
    expect(said({ ...base, accounts: ["psagot"] })).toEqual({
      answer: "אף חשבון",
      note: "פסגות הכי זול בכל המפה",
      head: "בתוכנית שלכם פסגות הכי זול. הוא הכי זול בכל צירוף במפה.",
    });
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
      note: "גם בסכומים אחרים",
      head: "בתוכנית שלכם פסגות ואי.בי.אי בערך אותו דבר. אף אחד מהם לא נעשה זול יותר בבירור, גם בסכום אחר היום או בהפקדה חודשית אחרת.",
    });
  });

  it("a plan with nothing in it", () => {
    expect(said({ ...base, plan: { amount: 0, monthly: 0, lead: { kind: "empty" } } })).toEqual({
      answer: "אין כסף בתוכנית",
      note: "בלי כסף אין עמלות",
      head: "בתוכנית שלכם אין כסף, ולכן אין עמלות. המפה מראה איזה חשבון זול יותר בכל צירוף אחר.",
    });
  });
});
