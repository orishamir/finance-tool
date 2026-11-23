// How far a cell's knob may stretch it (reach.ts), read from the layout (layout.ts): over every case of its line, which then holds the cell's
// content in place of its own, and over a place no case holds; back where the cell covers more than one place; never over a case on any
// value, nor a cell down over rows. The whole stretch is one undo, which brings back what it wrote over.
import { describe, expect, it } from "vitest";
import { layoutOf, type FeeLayout, type LayoutCase, type LayoutPart } from "./layout";
import { gridColumnSlots, gridPartSlots, gridRowSlots, knobEdges, reachEdits } from "./reach";
import { stretch } from "./edits/cells";
import { updateFee } from "./edits/deal";
import { liftKept, undo } from "./undo";
import { feeDeal } from "../../copy";
import { typed, type CasesFee, type FeeDeal, type Price, type When } from "./model";

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

  it("reaches across over a neighbour with a price of its own, which it writes over, and over a place no case holds, which the stretch fills", () => {
    const ta = gridRowSlots(g, g.rows[0]!);
    expect(knobEdges(ta, 0, 1)).toEqual({ before: false, after: true });
    expect(reachEdits(ta, 0, 0, 0, 1)).toEqual({ over: ["ta-b"], replaced: ["ta-b"], places: [], off: [] });
    const uk = gridRowSlots(g, g.rows[1]!);
    expect(knobEdges(uk, 0, 1)).toEqual({ before: false, after: true });
    expect(reachEdits(uk, 0, 0, 0, 1)).toEqual({ over: [], replaced: [], places: [["branch"]], off: [] });
  });

  it("reaches down over a cell with a price of its own and over a place no case holds", () => {
    const direct = gridColumnSlots(g, 0);
    expect(knobEdges(direct, 0, 1)).toEqual({ before: false, after: true });
    expect(reachEdits(direct, 0, 0, 0, 2)).toMatchObject({ over: ["uk-d", "mk-d"], replaced: ["uk-d", "mk-d"] });
    const branch = gridColumnSlots(g, 1);
    expect(knobEdges(branch, 0, 1)).toEqual({ before: false, after: true });
    expect(knobEdges(branch, 2, 1)).toEqual({ before: true, after: false });
    expect(reachEdits(branch, 2, 2, 1, 2).places).toEqual([["uk"]]);
  });

  it("reaches a part cell over a case that holds that part, writing over it, and over one without it", () => {
    const row = g.rows[0]!;
    expect(row.parts.map((x) => x.row)).toEqual(["max"]);
    const holds = (id: string) => cases.find((x) => x.id === id)!.parts.some((q) => q.row === "max");
    // the part cell over both cases goes back only
    expect(knobEdges(gridPartSlots(g, row, holds), 0, 2)).toEqual({ before: true, after: true });
    const lone = as(layoutOf({ things: [{ range: false }, { range: false }], rows: ROWS, cases: [cases[0]!, c("ta-b", [["tase"], ["branch"]], p("price", "0.55%")), cases[3]!, cases[4]!] }), "grid");
    expect(reachEdits(gridPartSlots(lone, lone.rows[0]!, (id) => id === "ta-d"), 0, 0, 0, 1)).toEqual({ over: ["ta-b"], replaced: [], places: [], off: [] });
    expect(reachEdits(gridPartSlots(lone, lone.rows[0]!, () => true), 0, 0, 0, 1)).toEqual({ over: ["ta-b"], replaced: ["ta-b"], places: [], off: [] });
  });

  it("stops where nothing may be stretched over: a case on any value across, a cell down over rows", () => {
    const slots = [{ own: "a" }, null, { own: "c" }];
    expect(knobEdges(slots, 0, 1)).toEqual(none);
    expect(knobEdges(slots, 2, 1)).toEqual(none);
  });
});

describe("a row of three cases, each with its own minimum, stretched from the first", () => {
  const action = (min: number): Price => ({ form: "action", rate: typed(0.1), min: typed(min) });
  const fee = (): CasesFee => ({
    id: "fee-t",
    kind: "trade",
    by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }],
    cases: [
      { id: "a", when: [["tase"], ["direct"]], stages: [{ price: action(5) }] },
      { id: "b", when: [["tase"], ["branch"]], stages: [{ price: action(6) }] },
      { id: "c", when: [["tase"], ["phone"]], stages: [{ price: action(7) }] },
      { id: "m", when: [["makam"], ["direct"]], stages: [{ price: action(8) }] },
    ],
  });
  const deal = (): FeeDeal => ({ id: "deal-r", name: "", kind: "brokerage-account", fees: [fee()] });
  const minOf = (d: FeeDeal) => (d.fees[0] as CasesFee).cases.map((x) => (x.stages[0]?.price as { min?: { v: number } } | undefined)?.min?.v);
  /** A value that must be there, or the test fails saying so. */
  const got = <T,>(x: T | null | undefined): T => {
    if (x === null || x === undefined) throw new Error("a value the test needs is missing");
    return x;
  };

  it("holds the first's minimum in all three, and one undo brings the three back", () => {
    const layout = as(layoutOf({ things: [{ range: false }, { range: false }], rows: ROWS, cases: [c("a", [["tase"], ["direct"]], p("price", "x"), p("min", "5")), c("b", [["tase"], ["branch"]], p("price", "x"), p("min", "6")), c("c", [["tase"], ["phone"]], p("price", "x"), p("min", "7")), c("m", [["makam"], ["direct"]], p("price", "x"), p("min", "8"))] }), "grid");
    const row = got(layout.rows.find((r) => r.cases.includes("a")));
    const slots = gridPartSlots(layout, row, () => true);
    expect(slots).toEqual([{ own: "a" }, { own: "b" }, { own: "c" }]);
    expect(knobEdges(slots, 0, 1)).toEqual({ before: false, after: true });
    const { over, replaced } = reachEdits(slots, 0, 0, 0, 2);
    expect(over).toEqual(["b", "c"]);
    expect(replaced).toEqual(["b", "c"]);
    // what the knob's release does on the page (fee-cases.tsx `knobsOf`, the editor's `onStretch`)
    const next = stretch(fee(), "a", over, "min", 1);
    const kept = liftKept(deal(), { deal: updateFee(deal(), next.id, () => next), kept: { feeId: next.id, words: feeDeal.cases.lifted.stretchedOver } }, null);
    expect(minOf(kept.deal)).toEqual([5, 5, 5, 8]);
    expect(got(undo(kept.deal, got(kept.undo), null)).deal).toEqual(deal());
  });
});
