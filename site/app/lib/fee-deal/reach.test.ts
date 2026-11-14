// How far a cell's knob may stretch it (reach.ts), read from the layout (layout.ts): never over a neighbour that holds a price of its own,
// over a case without that part or a place no case holds, and back where the cell covers more than one place.
import { describe, expect, it } from "vitest";
import { layoutOf, type FeeLayout, type LayoutCase, type LayoutPart } from "./layout";
import { gridColumnSlots, gridPartSlots, gridRowSlots, knobEdges, reachEdits, tableSlots } from "./reach";
import type { When } from "./model";

const ROWS = ["price", "min", "max", "notes"];
const p = (row: string, key: string): LayoutPart => ({ row, key });
const c = (id: string, when: When[], ...parts: LayoutPart[]): LayoutCase => ({ id, when, parts });
type Of<S extends FeeLayout["shape"]> = Extract<FeeLayout, { shape: S }>;
const as = <S extends FeeLayout["shape"]>(l: FeeLayout, shape: S): Of<S> => {
  expect(l.shape).toBe(shape);
  return l as Of<S>;
};
const none = { before: false, after: false };

describe("a table's knobs", () => {
  const l = as(layoutOf({ things: [{ range: false }], rows: ROWS, cases: [c("a", [["x"]], p("price", "1%"), p("min", "20")), c("b", [["y"]], p("price", "2%")), c("d", [["w"]], p("price", "3%"), p("min", "30"))] }), "table");
  const row = (r: string) => l.rows.find((x) => x.row === r)!;

  it("offers none toward a neighbour with a price of its own", () => {
    const price = tableSlots(l, row("price").cells);
    expect(knobEdges(price, 0, 1)).toEqual(none);
    expect(knobEdges(price, 1, 1)).toEqual(none);
  });

  it("offers one toward a case that holds nothing in that row, which then takes the part", () => {
    const min = tableSlots(l, row("min").cells);
    expect(knobEdges(min, 0, 1)).toEqual({ before: false, after: true });
    expect(knobEdges(min, 2, 1)).toEqual({ before: true, after: false });
    expect(reachEdits(min, 0, 0, 0, 1)).toEqual({ over: ["b"], places: [], off: [] });
  });

  it("offers both on a cell over more than one column, to go back", () => {
    const merged = as(layoutOf({ things: [{ range: false }], rows: ROWS, cases: [c("a", [["x"]], p("price", "1%")), c("b", [["y"]], p("price", "1%"))] }), "table");
    const slots = tableSlots(merged, merged.rows[0]!.cells);
    expect(knobEdges(slots, 0, 2)).toEqual({ before: true, after: true });
    expect(reachEdits(slots, 0, 1, 0, 0)).toEqual({ over: [], places: [], off: ["b"] });
  });

  it("offers none on a ladder whose steps are all priced", () => {
    const ladder = as(layoutOf({ things: [{ range: true }], rows: ROWS, cases: [c("s0", [0], p("price", "0.2")), c("s1", [1], p("price", "0.1")), c("s2", [2], p("price", "0.05"))] }), "table");
    const slots = tableSlots(ladder, ladder.rows[0]!.cells);
    expect([0, 1, 2].map((k) => knobEdges(slots, k, 1))).toEqual([none, none, none]);
  });
});

describe("a grid's knobs", () => {
  /** What is bought down, the channel across; the branch has no case for the second value. */
  const cases = [
    c("ta-d", [["tase"], ["direct"]], p("price", "0.5%"), p("max", "30%")),
    c("ta-b", [["tase"], ["branch"]], p("price", "0.55%"), p("max", "30%")),
    c("uk-d", [["uk"], ["direct"]], p("price", "0.5%")),
    c("mk-d", [["makam"], ["direct"]], p("price", "0.09%")),
    c("mk-b", [["makam"], ["branch"]], p("price", "0.1%")),
  ];
  const g = as(layoutOf({ things: [{ range: false }, { range: false }], rows: ROWS, cases }), "grid");

  it("offers none across toward a neighbour with a price, and one toward a place no case holds, which the stretch fills", () => {
    const ta = gridRowSlots(g, g.rows[0]!);
    expect(knobEdges(ta, 0, 1)).toEqual(none);
    const uk = gridRowSlots(g, g.rows[1]!);
    expect(knobEdges(uk, 0, 1)).toEqual({ before: false, after: true });
    expect(reachEdits(uk, 0, 0, 0, 1)).toEqual({ over: [], places: [["branch"]], off: [] });
  });

  it("offers none down toward a cell with a price, and one toward a place no case holds", () => {
    const direct = gridColumnSlots(g, 0);
    expect(knobEdges(direct, 0, 1)).toEqual(none);
    const branch = gridColumnSlots(g, 1);
    expect(knobEdges(branch, 0, 1)).toEqual({ before: false, after: true });
    expect(knobEdges(branch, 2, 1)).toEqual({ before: true, after: false });
    expect(reachEdits(branch, 2, 2, 1, 2).places).toEqual([["uk"]]);
  });

  it("offers a part cell no knob toward a case that holds that part, and one toward a case without it", () => {
    const row = g.rows[0]!;
    expect(row.parts.map((x) => x.row)).toEqual(["max"]);
    const holds = (id: string) => cases.find((x) => x.id === id)!.parts.some((q) => q.row === "max");
    // the part cell over both cases goes back only
    expect(knobEdges(gridPartSlots(g, row, holds), 0, 2)).toEqual({ before: true, after: true });
    // a case without the part beside one with it: the knob reaches it
    const lone = as(layoutOf({ things: [{ range: false }, { range: false }], rows: ROWS, cases: [cases[0]!, c("ta-b", [["tase"], ["branch"]], p("price", "0.55%")), cases[3]!, cases[4]!] }), "grid");
    const has = (id: string) => id === "ta-d";
    expect(knobEdges(gridPartSlots(lone, lone.rows[0]!, has), 0, 1)).toEqual({ before: false, after: true });
    expect(knobEdges(gridPartSlots(lone, lone.rows[0]!, (id) => id === "ta-d" || id === "ta-b"), 0, 1)).toEqual(none);
  });
});
