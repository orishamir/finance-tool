// The words of the account map's card and headline (F-131), in every case, against the sentences they must make: the first is the one
// the approved sketch wrote for the page's example pair; the rest follow it.
import { describe, expect, it } from "vitest";
import type { AccountMap, MapSwitch } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { mapWords } from "./account-map";

const names: Record<string, string> = { psagot: "פסגות", ibi: "אי.בי.אי", "one-zero": "וואן זירו" };
const base: AccountMap = { max: { amount: 200_000, monthly: 4000 }, plan: { amount: 10_000, monthly: 500, winner: "psagot" }, winners: ["psagot", "ibi", "one-zero"], tiles: [], borders: [], edge: [], switches: { amount: null, monthly: null } };
const up = (at: number, to = "ibi"): MapSwitch => ({ at, dir: "up", to });
/** The card's answer and line and the headline, as plain words (the isolates a figure keeps its order with, and the joiner that keeps "כ־" on its figure's line, set aside). */
function said(map: AccountMap, house = "psagot") {
  const w = mapWords(map, house, (id) => names[id] ?? id, (s) => fmt.nisRough(s.at));
  const plain = (xs: string[]) => xs.join("").replace(/[⁦-⁩⁠]/g, "").replace(/ /g, " ");
  return { answer: plain(w.answer), note: plain(w.note), head: plain(w.head) };
}

describe("the account map's words", () => {
  it("a switch both ways to the same account: the sketch's sentences", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: up(2300) } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "או מעל כ־2,300 ₪ בחודש. עד שם פסגות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר מעל כ־108 אלף ₪ היום, או מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch each way to another account: each named", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: up(2300, "one-zero") } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "וואן זירו מעל כ־2,300 ₪ בחודש. עד שם פסגות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר מעל כ־108 אלף ₪ היום. וואן זירו זול יותר מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch only one way: today's amount, or the monthly deposit", () => {
    expect(said({ ...base, switches: { amount: up(108_000), monthly: null } })).toEqual({
      answer: "אי.בי.אי, מעל כ־108 אלף ₪",
      note: "עד שם פסגות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר מעל כ־108 אלף ₪ היום.",
    });
    expect(said({ ...base, switches: { amount: null, monthly: up(2300) } })).toEqual({
      answer: "אי.בי.אי, מעל כ־2,300 ₪ בחודש",
      note: "עד שם פסגות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר מעל כ־2,300 ₪ בחודש.",
    });
  });

  it("a switch at a lower amount: the plan is past a border", () => {
    expect(said({ ...base, switches: { amount: { at: 76_000, dir: "down", to: "ibi" }, monthly: null } })).toEqual({
      answer: "אי.בי.אי, מתחת לכ־76 אלף ₪",
      note: "בתוכנית שלכם: פסגות",
      head: "בתוכנית שלכם פסגות הכי זול. אי.בי.אי זול יותר מתחת לכ־76 אלף ₪ היום.",
    });
  });

  it("the plan in an area its account holds far past the map: no switch either way", () => {
    expect(said(base)).toEqual({
      answer: "פסגות נשאר הכי זול",
      note: "גם בסכום אחר היום, או בהפקדה חודשית אחרת",
      head: "בתוכנית שלכם פסגות הכי זול. הוא נשאר הכי זול גם בסכום אחר היום, או בהפקדה חודשית אחרת.",
    });
  });

  it("one account cheapest everywhere on the map", () => {
    expect(said({ ...base, winners: ["psagot"] })).toEqual({
      answer: "אף חשבון",
      note: "פסגות הכי זול בכל המפה",
      head: "בתוכנית שלכם פסגות הכי זול. הוא הכי זול בכל צירוף במפה.",
    });
  });

  it("the receipt's account is not the cheapest at the plan", () => {
    const ibiFirst = { ...base, plan: { ...base.plan, winner: "ibi" } };
    expect(said({ ...ibiFirst, switches: { amount: { at: 76_000, dir: "down", to: "psagot" }, monthly: null } })).toEqual({
      answer: "אי.בי.אי, כבר בתוכנית שלכם",
      note: "במקום פסגות",
      head: "בתוכנית שלכם אי.בי.אי זול יותר מפסגות. פסגות זול יותר מתחת לכ־76 אלף ₪ היום.",
    });
    expect(said({ ...ibiFirst, winners: ["ibi"] }).head).toBe("בתוכנית שלכם אי.בי.אי זול יותר מפסגות. הוא הכי זול בכל צירוף במפה.");
  });
});
