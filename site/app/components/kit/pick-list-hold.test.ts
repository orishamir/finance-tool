import { describe, expect, it } from "vitest";
import { heldRowsHeight, marksKey, stateHeight, type RowCases } from "./pick-list-hold";

// A row's cases: by state, by marks ("" plain, "back", "crown", "back+crown").
const row = (key: string, real: number, cases: Record<string, Record<string, number>>): RowCases => ({
  key,
  real,
  cases: new Map(Object.entries(cases).map(([k, v]) => [k, new Map(Object.entries(v))])),
});

// The indices page in small: two Israeli houses priced on the Israeli fund and grey on the fund abroad, one house abroad the other way.
// A priced row is 100 plain, 120 with the star, 144 with the way back, 160 with both; a grey row is 80.
const priced = { "": 100, crown: 120, back: 144, "back+crown": 160 };
const rows = (realA: number, realB: number, realC: number) => [
  row("a", realA, { priced, grey: { "": 80 } }),
  row("b", realB, { priced, grey: { "": 80 } }),
  row("c", realC, { priced, grey: { "": 80 } }),
];
const israeli = { a: "priced", b: "priced", c: "grey" };
const abroad = { a: "grey", b: "grey", c: "priced" };

describe("PickList's held height", () => {
  it("names a case by its marks in one order", () => {
    expect(marksKey()).toBe("");
    expect(marksKey(["crown", "back"])).toBe("back+crown");
  });

  it("puts each mark on one row only: the plain rows, then the most one row can add", () => {
    // the star on one row and the way back on another (+20 +44) beat both on one row (+60)
    expect(stateHeight(rows(0, 0, 0), israeli, ["back", "crown"])).toBe(100 + 100 + 80 + 64);
    // the second pass's sum, every tag on every row of another state, held 368 here
    expect(stateHeight(rows(0, 0, 0), israeli, ["back", "crown"])).toBeLessThan(160 + 160 + 80);
  });

  it("gives two marks to one row only where that row has a case with both", () => {
    const noBoth = [row("a", 0, { priced: { "": 100, crown: 120, back: 144 } }), row("b", 0, { priced: { "": 100, crown: 130 } })];
    expect(stateHeight(noBoth, { a: "priced", b: "priced" }, ["back", "crown"])).toBe(200 + 44 + 30);
  });

  it("holds the same height whichever state is on the screen and whatever its rows show now", () => {
    // opened on the Israeli fund (its rows plain), and opened on the fund abroad after a tap (its row with the way back)
    const fromIsraeli = heldRowsHeight(rows(100, 100, 80), [israeli, abroad], 280);
    const fromAbroad = heldRowsHeight(rows(80, 80, 144), [israeli, abroad], 304);
    expect(fromIsraeli).toBe(fromAbroad);
    expect(fromIsraeli).toBe(344);
  });

  it("never holds less than the rows shown now, and a row with no case for a state counts at its real height", () => {
    expect(heldRowsHeight([row("a", 500, {}), row("b", 0, { priced })], [{ b: "priced" }], 500)).toBe(500 + 160);
    expect(heldRowsHeight([row("a", 50, { priced: { "": 40 } })], [{ a: "priced" }], 50)).toBe(50);
  });
});
