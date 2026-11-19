// How far a cell's knob may stretch it (reach.ts), read from the layout (layout.ts): never over a neighbour that holds a price of its own,
// over a case without that part or a place no case holds, and back where the cell covers more than one place.
import { describe, expect, it } from "vitest";
import { layoutOf, type FeeLayout, type LayoutCase, type LayoutPart } from "./layout";
import { gridColumnSlots, gridPartSlots, gridRowSlots, knobEdges, reachEdits } from "./reach";
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
