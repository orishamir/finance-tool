// The words of the account map's card and headline (F-131), in every case, against the sentences they must make: the headline says only
// which account leaves the most at the plan and asks about plans like it; the card names the accounts first somewhere on the map.
import { describe, expect, it } from "vitest";
import type { AccountMap, MapField, MapSwitch } from "../../lib/account-map";
import { mapWords } from "./account-map";

const names: Record<string, string> = { psagot: "פסגות", ibi: "אי.בי.אי", "one-zero": "וואן זירו", meitav: "מיטב" };
/** A grid of four nodes, the k-th account first at each listed node (-1 where none is). */
const gridOf = (first: number[], missing?: number[]): MapField => ({ cols: 2, rows: 2, first, second: first.map(() => -1), ahead: first.map(() => 1), ...(missing ? { missing } : {}) });
const empty: MapField = { cols: 0, rows: 0, first: [], second: [], ahead: [] };
const base: AccountMap = { max: { amount: 200_000, monthly: 4000 }, bottom: 40, plan: { amount: 10_000, monthly: 500, lead: { kind: "clear", first: "psagot" } }, accounts: ["psagot", "ibi", "one-zero"], floor: { amount: 5000, monthly: 100 }, asked: ["psagot", "ibi", "one-zero"], field: gridOf([0, 0, 1, 1]), edge: empty, switches: { amount: null, monthly: null }, stretches: { amount: null, monthly: null }, changes: { amount: { band: null, even: null }, monthly: { band: null, even: null } }, equal: { amount: null, monthly: null } };
const up = (at: number, to = "ibi"): MapSwitch => ({ at, dir: "up", to });
const said = (map: AccountMap, house = "psagot") => mapWords(map, house, (id) => names[id] ?? id);

describe("the account map's words", () => {
  it("the plan's account cheapest: the headline names it and asks about plans like it; the card names the accounts first on the map", () => {
    expect(said(base)).toEqual({ answer: "פסגות או אי.בי.אי", note: "בתוכנית שלכם: פסגות הכי זול", head: "בתוכנית שלכם פסגות הכי זול. ומה לגבי תוכניות דומות?" });
  });

  it("says nothing of where another account becomes cheaper: that is on the plan's guides, along its own lines", () => {
    const w = said({ ...base, switches: { amount: up(108_000), monthly: up(2300) }, stretches: { amount: null, monthly: { lo: 800, hi: 1500, dir: "up", to: "one-zero" } } });
    expect(w.head).toBe("בתוכנית שלכם פסגות הכי זול. ומה לגבי תוכניות דומות?");
    expect(`${w.answer} ${w.note} ${w.head}`).not.toMatch(/בבירור|מעל|מתחת|בין/);
  });

  it("the receipt's account is not the cheapest at the plan", () => {
    expect(said(base, "ibi").head).toBe("בתוכנית שלכם פסגות זול יותר מאי.בי.אי. ומה לגבי תוכניות דומות?");
  });

  it("the plan inside the band: the accounts about the same", () => {
    const w = said({ ...base, plan: { ...base.plan, lead: { kind: "near", tied: ["psagot", "ibi"] } } });
    expect(w).toEqual({ answer: "פסגות או אי.בי.אי", note: "בתוכנית שלכם: פסגות ואי.בי.אי בערך אותו דבר", head: "בתוכנית שלכם פסגות ואי.בי.אי בערך אותו דבר. ומה לגבי תוכניות דומות?" });
  });

  it("the card names only the accounts first somewhere, the bottom edge's included, in the map's order", () => {
    expect(said({ ...base, field: gridOf([0, 0, 0, 0]), edge: gridOf([2, 2, 0, 0]) }).answer).toBe("פסגות או וואן זירו");
    expect(said({ ...base, accounts: ["psagot", "ibi", "one-zero", "meitav"], field: gridOf([0, 1, 2, 3]) }).answer).toBe("פסגות, אי.בי.אי, וואן זירו ועוד 1");
  });

  it("one account first all over the map: cheapest on the whole map only where every account it prices has a price at every node (F-80)", () => {
    const one = { ...base, accounts: ["psagot"], field: gridOf([0, 0, 0, 0]) };
    expect(said(one).answer).toBe("פסגות, בכל המפה");
    expect(said({ ...one, field: gridOf([0, 0, 0, 0], [0, 2, 0, 0]) }).answer).toBe("פסגות");
  });

  it("a plan with nothing in it", () => {
    expect(said({ ...base, plan: { ...base.plan, amount: 0, monthly: 0, lead: { kind: "empty" } } })).toEqual({ answer: "אין כסף בתוכנית", note: "אין כסף בחשבון, אז כל החשבונות משאירים 0 ₪", head: "בתוכנית שלכם אין כסף, אז כל החשבונות משאירים 0 ₪. המפה מראה איזה חשבון זול יותר בכל צירוף אחר." });
  });
});
