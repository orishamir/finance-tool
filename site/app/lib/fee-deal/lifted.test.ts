// What a grip lifts, where it drops and what the bin takes (lifted.ts), on a deal of two fees: a conversion's grid by the channel and the
// size, and a custody fee of one price. Each drop is one pure edit, and those that take something the person gave say so for the undo.
import { describe, expect, it } from "vitest";
import { binTakes, liftDrop, liftedOf, liftId, liftRemove, liftTakes, liftWhy, type Lifted, type LiftTarget } from "./lifted";
import { WHOLE } from "./layout";
import { FIRST } from "./edits/cells";
import { byRank, typed, type CasesFee, type FeeDeal, type Price, type SlimFee } from "./model";
import { feeDeal as copy } from "../../copy";
import { fmt } from "../format";
import { liftKept, undo } from "./undo";

const action = (rate: number, min?: number): Price => ({ form: "action", rate: typed(rate), ...(min !== undefined ? { min: typed(min) } : {}) });
const fx = (): CasesFee => ({
  id: "fee-fx",
  kind: "fx",
  by: [{ kind: "channel", values: [] }, { kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }],
  cases: [
    { id: "d0", when: [["direct"], 0], stages: [{ price: { form: "free" } }] },
    { id: "d1", when: [["direct"], 1], stages: [{ price: action(0.0875, 5) }] },
    { id: "d2", when: [["direct"], 2], stages: [{ price: action(0.1, 5) }] },
    { id: "b0", when: [["branch"], 0], stages: [{ price: { form: "free" } }] },
    { id: "b1", when: [["branch"], 1], stages: [{ price: action(0.175, 6.25) }] },
    { id: "b2", when: [["branch"], 2], stages: [{ price: action(0.2, 6.25) }] },
  ],
});
const custody = (): SlimFee => ({ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] });
const deal = (): FeeDeal => ({ id: "deal-l", name: "", kind: "brokerage-account", fees: [fx(), custody()] });
const fxOf = (d: FeeDeal) => d.fees[0] as CasesFee;

describe("a lifted thing", () => {
  it("travels as the carried item's id, and nothing else reads as one", () => {
    const l: Lifted = { k: "col", fee: "fee-fx", case: "d1" };
    expect(liftedOf(liftId(l))).toEqual(l);
    expect(liftedOf("by:channel")).toBeNull();
  });

  it("takes a step away in the bin, its line naming it, and never a thing of the head", () => {
    const r = liftRemove(deal(), { k: "step", fee: "fee-fx", t: 1, step: 1, name: "10 עד 100 $" })!;
    expect((fxOf(r.deal).by[1] as { tops: { v: number }[] }).tops.map((n) => n.v)).toEqual([100]);
    expect(r.kept).toEqual({ feeId: "fee-fx", words: copy.cases.lifted.step.replace("{name}", "10 עד 100 $") });
    expect(binTakes(deal(), { k: "thing", fee: "fee-fx", t: 0 })).toBe(false);
  });

  it("swaps a grid's case with the case whose cell it drops on, beside it or above it, and keeps an undo", () => {
    const l: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1"], row: WHOLE, along: 1 };
    const whenOf = (x: FeeDeal, id: string) => fxOf(x).cases.find((c) => c.id === id)!.when;
    const priceOf = (x: FeeDeal, id: string) => fxOf(x).cases.find((c) => c.id === id)!.stages[0]!.price;
    // onto the next column of its row (to its left on the page): the two sizes swap, each case keeping its price
    const left = liftDrop(deal(), l, { k: "cell", fee: "fee-fx", cases: ["d2"], row: WHOLE, along: 1 })!;
    expect([whenOf(left.deal, "d1"), whenOf(left.deal, "d2")]).toEqual([[["direct"], 2], [["direct"], 1]]);
    expect([priceOf(left.deal, "d1"), priceOf(left.deal, "d2")]).toEqual([priceOf(deal(), "d1"), priceOf(deal(), "d2")]);
    expect(left.kept?.words).toBe(copy.cases.lifted.swappedCases);
    const kept = liftKept(deal(), left, null);
    expect(undo(kept.deal, kept.undo!, null)!.deal).toEqual(deal());
    // onto the row above it: the two channels swap
    const up = liftDrop(deal(), { ...l, cases: ["b1"] }, { k: "cell", fee: "fee-fx", cases: ["d1"], row: WHOLE, along: 1 })!;
    expect([whenOf(up.deal, "b1"), whenOf(up.deal, "d1")]).toEqual([[["direct"], 1], [["branch"], 1]]);
    // onto its own cell, nothing
    expect(liftTakes(deal(), l, { k: "cell", fee: "fee-fx", cases: ["d1"], row: WHOLE, along: 1 })).toBe(false);
  });

  it("takes no part cell dropped on another cell: a neighbour takes a price only by a stretch", () => {
    const min: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1"], row: "min", along: 1 };
    expect(liftTakes(deal(), min, { k: "cell", fee: "fee-fx", cases: ["d2"], row: "min", along: 1 })).toBe(false);
    expect(liftTakes(deal(), min, { k: "cell", fee: "fee-fx", cases: ["d2"], row: WHOLE, along: 1 })).toBe(false);
  });

  it("moves the row of a case alone in its row onto the row head it drops on, and no row whose other cases would go with it", () => {
    const what: CasesFee = {
      id: "fee-t",
      kind: "trade",
      by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }],
      cases: [
        { id: "ta-d", when: [["tase"], ["direct"]], stages: [{ price: action(0.1) }] },
        { id: "ta-b", when: [["tase"], ["branch"]], stages: [{ price: action(0.2) }] },
        { id: "mk-d", when: [["makam"], ["direct"]], stages: [{ price: action(0.05) }] },
        { id: "mk-b", when: [["makam"], ["branch"]], stages: [{ price: action(0.06) }] },
        { id: "us", when: [["us"], "any"], stages: [{ price: action(0.3) }] },
      ],
    };
    const d: FeeDeal = { id: "deal-r", name: "", kind: "brokerage-account", fees: [what] };
    const rows = (x: FeeDeal) => [...new Set(byRank((x.fees[0] as CasesFee).cases).map((c) => JSON.stringify(c.when[0])))];
    const cell = (id: string): Lifted => ({ k: "cell", fee: "fee-t", cases: [id], row: WHOLE, along: 1 });
    const head = (w: string) => ({ k: "value" as const, fee: "fee-t", t: 0, key: JSON.stringify([w]) });
    // the foreign row's one cell, over every channel, onto the row above: it stands above it
    expect(rows(liftDrop(d, cell("us"), head("makam"))!.deal)).toEqual(['["tase"]', '["us"]', '["makam"]']);
    // a cell beside another of its row moves no row
    expect(liftTakes(d, cell("mk-d"), head("tase"))).toBe(false);
    // and a case on any channel moves no column
    expect(liftTakes(d, cell("us"), { k: "value", fee: "fee-t", t: 1, key: JSON.stringify(["direct"]) })).toBe(false);
  });

  it("takes a part cell over several cases away from each of them in the bin, and the undo puts every one back", () => {
    const l: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1", "d2"], row: "min", along: 1 };
    const r = liftRemove(deal(), l)!;
    expect(fxOf(r.deal).cases.filter((c) => ["d1", "d2"].includes(c.id)).map((c) => c.stages[0]!.price)).toEqual([action(0.0875), action(0.1)]);
    expect(r.kept?.words).toBe(copy.cases.lifted.part.min);
    const kept = liftKept(deal(), r, null);
    expect(undo(kept.deal, kept.undo!, null)!.deal).toEqual(deal());
  });

  it("moves a part cell over several cases out of every one of them onto the case it drops on, and leaves them where copied", () => {
    const l: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1", "d2"], row: "min", along: 1 };
    const on = { k: "case", fee: "fee-fx", case: "b1" } as const;
    const priceOf = (d: FeeDeal, id: string) => fxOf(d).cases.find((c) => c.id === id)!.stages[0]!.price;
    const r = liftDrop(deal(), l, on)!;
    expect(priceOf(r.deal, "b1")).toEqual(action(0.175, 5));
    expect([priceOf(r.deal, "d1"), priceOf(r.deal, "d2")]).toEqual([action(0.0875), action(0.1)]);
    // onto the second case it covered: it stays there alone, and nothing of the person's is replaced
    const onSecond = liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "d2" })!;
    expect([priceOf(onSecond.deal, "d1"), priceOf(onSecond.deal, "d2")]).toEqual([action(0.0875), action(0.1, 5)]);
    expect(onSecond.kept?.words).toBeUndefined();
    const c = liftDrop(deal(), l, on, { copy: true })!;
    expect([priceOf(c.deal, "d1"), priceOf(c.deal, "d2")]).toEqual([action(0.0875, 5), action(0.1, 5)]);
    // onto one of its own cases, the first or another, it stays there alone; copied there, nothing changes
    const first = liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "d1" })!;
    expect([priceOf(first.deal, "d1"), priceOf(first.deal, "d2")]).toEqual([action(0.0875, 5), action(0.1)]);
    const second = liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "d2" })!;
    expect([priceOf(second.deal, "d1"), priceOf(second.deal, "d2")]).toEqual([action(0.0875), action(0.1, 5)]);
    expect(liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "d1" }, { copy: true })).toBeNull();
    // a part of one case onto its own case: nothing
    expect(liftTakes(deal(), { ...l, cases: ["d1"] }, { k: "case", fee: "fee-fx", case: "d1" })).toBe(false);
  });

  it("moves a grid's row among its rows, and swaps two things", () => {
    expect(byRank(fxOf(liftDrop(deal(), { k: "value", fee: "fee-fx", t: 0, key: '["branch"]', name: "בסניף" }, { k: "value", fee: "fee-fx", t: 0, key: '["direct"]' })!.deal).cases)[0]!.id).toBe("b0");
    expect(fxOf(liftDrop(deal(), { k: "thing", fee: "fee-fx", t: 0 }, { k: "thing", fee: "fee-fx", t: 1 })!.deal).by[0]!.kind).toBe("actionSize");
    // a row dropped on a column of another thing: nothing
    expect(liftTakes(deal(), { k: "value", fee: "fee-fx", t: 0, key: '["branch"]', name: "" }, { k: "value", fee: "fee-fx", t: 1, key: "0" })).toBe(false);
  });

  it("moves a row to where the row it drops on stands now, after an earlier move too", () => {
    const three: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }], cases: ["tase", "us", "uk", "makam"].map((w) => ({ id: w, when: [[w], ["direct"]], stages: [{ price: action(0.1) }] })) };
    const d: FeeDeal = { id: "deal-m", name: "", kind: "brokerage-account", fees: [three] };
    const rows = (x: FeeDeal) => byRank((x.fees[0] as CasesFee).cases).map((c) => c.id);
    const row = (w: string): Lifted => ({ k: "value", fee: "fee-t", t: 0, key: JSON.stringify([w]), name: w });
    const on = (w: string) => ({ k: "value" as const, fee: "fee-t", t: 0, key: JSON.stringify([w]) });
    // the first row moved to the end, then dropped on the row now just above it: it moves up one
    const down = liftDrop(d, row("tase"), on("makam"))!.deal;
    expect(rows(down)).toEqual(["us", "uk", "makam", "tase"]);
    expect(rows(liftDrop(down, row("tase"), on("makam"))!.deal)).toEqual(["us", "uk", "tase", "makam"]);
    // dropped on the first row, it stands first
    expect(rows(liftDrop(down, row("tase"), on("us"))!.deal)).toEqual(["tase", "us", "uk", "makam"]);
  });

  it("moves a table's column to where the column it drops on stands now, after an earlier move too", () => {
    const table: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "channel", values: [] }], cases: ["a", "b", "c", "e"].map((id) => ({ id, when: [[id]], stages: [{ price: action(0.1) }] })) };
    const d: FeeDeal = { id: "deal-m", name: "", kind: "brokerage-account", fees: [table] };
    const cols = (x: FeeDeal) => byRank((x.fees[0] as CasesFee).cases).map((c) => c.id);
    const col = (id: string): Lifted => ({ k: "col", fee: "fee-t", case: id });
    const on = (id: string) => ({ k: "col" as const, fee: "fee-t", case: id });
    const end = liftDrop(d, col("a"), on("e"))!.deal;
    expect(cols(end)).toEqual(["b", "c", "e", "a"]);
    expect(cols(liftDrop(end, col("a"), on("e"))!.deal)).toEqual(["b", "c", "a", "e"]);
    expect(cols(liftDrop(end, col("a"), on("b"))!.deal)).toEqual(["a", "b", "c", "e"]);
  });

  it("moves a part onto another fee that takes it, and says why where one does not", () => {
    const min: Lifted = { k: "part", fee: "fee-fx", case: "d1", price: FIRST, row: "min" };
    const r = liftDrop(deal(), min, { k: "case", fee: "fee-c", case: null })!;
    expect((r.deal.fees[1] as SlimFee).stages[0]!.price).toMatchObject({ min: { v: 5 } });
    expect(fxOf(r.deal).cases[1]!.stages[0]!.price).toEqual(action(0.0875));
    const price: Lifted = { k: "part", fee: "fee-fx", case: "d1", price: FIRST, row: "price" };
    expect(liftTakes(deal(), price, { k: "case", fee: "fee-c", case: null })).toBe(false);
    expect(liftWhy(deal(), price, { k: "case", fee: "fee-c", case: null })).toBe(copy.cases.lifted.notHere);
  });

  it("moves a fee's card within its group only, kept as the fees' ranks, the deal's own order kept", () => {
    const l: Lifted = { k: "fee", fee: "fee-c", group: "g" };
    const r = liftDrop(deal(), l, { k: "fee", fee: "fee-fx", group: "g" }, { shown: ["fee-fx", "fee-c"] })!;
    expect(r.deal.fees.map((f) => f.id)).toEqual(["fee-fx", "fee-c"]);
    expect(byRank(r.deal.fees).map((f) => f.id)).toEqual(["fee-c", "fee-fx"]);
    expect(liftDrop(deal(), l, { k: "fee", fee: "fee-fx", group: "other" }, { shown: ["fee-fx", "fee-c"] })).toBeNull();
  });
});

describe("a case moved to a grid's empty place, and parts and notes moved", () => {
  /** The conversion grid with no case at branch, above 100 $. */
  const gapDeal = (): FeeDeal => ({ ...deal(), fees: [{ ...fx(), cases: fx().cases.filter((c) => c.id !== "b2") }, custody()] });

  it("takes both the place's row and its column, stands there alone, and keeps an undo", () => {
    const l: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1"], row: WHOLE, along: 1 };
    const r = liftDrop(gapDeal(), l, { k: "place", fee: "fee-fx", row: "b0", t: 1, when: 2 })!;
    expect(fxOf(r.deal).cases.find((c) => c.id === "d1")!.when).toEqual([["branch"], 2]);
    expect(r.kept?.words).toBe(copy.cases.lifted.movedCase);
    const kept = liftKept(gapDeal(), r, null);
    expect(undo(kept.deal, kept.undo!, null)!.deal).toEqual(gapDeal());
  });

  it("keeps an undo for a part dropped on a case that had that part, saying what was replaced", () => {
    const l: Lifted = { k: "part", fee: "fee-fx", case: "d1", price: FIRST, row: "min" };
    const r = liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "b1" })!;
    expect(fxOf(r.deal).cases.find((c) => c.id === "b1")!.stages[0]!.price).toEqual(action(0.175, 5));
    expect(r.kept?.words).toBe(copy.cases.lifted.replaced.replace("{what}", copy.cases.rowHeads.min!));
    // onto a case without that part, nothing is replaced: no undo
    expect(liftDrop(deal(), l, { k: "case", fee: "fee-fx", case: "d0" })?.kept).toBeUndefined();
  });

  it("moves one note alone, added to the target's notes, and takes one note alone away", () => {
    const noted = (notes: string[]): Price => ({ ...action(0.1, 5), notes } as Price);
    const d: FeeDeal = { ...deal(), fees: [{ ...fx(), cases: fx().cases.map((c) => (c.id === "d1" ? { ...c, stages: [{ price: noted(["unfilled", "partial"]) }] } : c.id === "d2" ? { ...c, stages: [{ price: noted(["capRead"]) }] } : c)) }, custody()] };
    const l: Lifted = { k: "part", fee: "fee-fx", case: "d1", price: FIRST, row: "notes", note: "partial" };
    const r = liftDrop(d, l, { k: "case", fee: "fee-fx", case: "d2" })!;
    const notesOf = (x: FeeDeal, id: string) => (fxOf(x).cases.find((c) => c.id === id)!.stages[0]!.price as { notes?: string[] }).notes;
    expect(notesOf(r.deal, "d1")).toEqual(["unfilled"]);
    expect(notesOf(r.deal, "d2")).toEqual(["capRead", "partial"]);
    const gone = liftRemove(d, l)!;
    expect(notesOf(gone.deal, "d1")).toEqual(["unfilled"]);
    expect(gone.kept?.words).toBe(copy.cases.lifted.noteRemoved);
  });
});

describe("a part of a later price or of a sale, lifted from its own surface", () => {
  /** A value that must be there, or the test fails saying so. */
  const got = <T,>(x: T | null | undefined): T => {
    if (x === null || x === undefined) throw new Error("a value the test needs is missing");
    return x;
  };
  const sum = (v: number): Price => ({ form: "sum", amount: typed(v), every: 1 });
  const later = (until: string, v: number) => [{ price: { form: "free" } as Price, until }, { price: sum(v) }];
  /** A fixed fee by the channel: two cases whose price changes in August 2027, and one whose price changes in January 2028. */
  const fixed = (): CasesFee => ({
    id: "fee-f",
    kind: "fixed_period",
    by: [{ kind: "channel", values: [] }],
    cases: [
      { id: "a", when: [["direct"]], stages: later("2027-08", 80) },
      { id: "b", when: [["branch"]], stages: later("2027-08", 50) },
      { id: "c", when: [["phone"]], stages: later("2028-01", 30) },
    ],
  });
  /** A fixed fee of one price over time, its price changing in August 2027. */
  const slim = (): SlimFee => ({ id: "fee-s", kind: "fixed_period", stages: later("2027-08", 20) });
  const d = (): FeeDeal => ({ id: "deal-p", name: "", kind: "brokerage-account", fees: [fixed(), slim()] });
  const fOf = (x: FeeDeal) => x.fees[0] as CasesFee;
  const stagesOf = (x: FeeDeal, id: string) => got(fOf(x).cases.find((c) => c.id === id)).stages;
  const aug: Lifted = { k: "part", fee: "fee-f", case: "a", price: { side: "buy", from: "2027-08" }, row: "price" };

  it("lands on the price of another case of its fee that starts the same month, the earlier prices left as they were", () => {
    const r = got(liftDrop(d(), aug, { k: "case", fee: "fee-f", case: "b" }));
    expect(stagesOf(r.deal, "b")).toEqual([{ price: { form: "free" }, until: "2027-08" }, { price: sum(80) }]);
    // the price it left is not given, as the first price's is when its price is carried away
    expect(stagesOf(r.deal, "a")).toEqual([{ price: { form: "free" }, until: "2027-08" }, { price: { form: "sum", amount: { v: 0, blank: true }, every: 1 } }]);
    expect(r.kept?.words).toBe(copy.cases.lifted.replaced.replace("{what}", got(copy.cases.rowHeads.price)));
    // copied, it stays where it was too
    expect(stagesOf(got(liftDrop(d(), aug, { k: "case", fee: "fee-f", case: "b" }, { copy: true })).deal, "a")).toEqual(got(fixed().cases[0]).stages);
  });

  it("lands nowhere on a case with no price starting that month, nor on a head", () => {
    expect(liftTakes(d(), aug, { k: "case", fee: "fee-f", case: "c" })).toBe(false);
    expect(liftTakes(d(), aug, { k: "cases", fee: "fee-f", cases: ["a", "b", "c"], along: 0, names: {} })).toBe(false);
    expect(liftWhy(d(), aug, { k: "cases", fee: "fee-f", cases: ["a", "b", "c"], along: 0, names: {} })).toBeNull();
  });

  it("lands on another fee's price starting the same month", () => {
    const r = got(liftDrop(d(), aug, { k: "case", fee: "fee-s", case: null }));
    expect((r.deal.fees[1] as SlimFee).stages).toEqual([{ price: { form: "free" }, until: "2027-08" }, { price: sum(80) }]);
  });

  it("goes in the bin from its own price alone, its line naming it", () => {
    const r = got(liftRemove(d(), aug));
    expect(got(stagesOf(r.deal, "a")[1]).price).toEqual({ form: "sum", amount: { v: 0, blank: true }, every: 1 });
    expect(stagesOf(r.deal, "a")[0]).toEqual({ price: { form: "free" }, until: "2027-08" });
    expect(r.kept?.words).toBe(copy.cases.lifted.part.price);
    // a slim fee's later price the same way
    const s = got(liftRemove(d(), { ...aug, fee: "fee-s", case: null }));
    expect(got((s.deal.fees[1] as SlimFee).stages[1]).price).toEqual({ form: "sum", amount: { v: 0, blank: true }, every: 1 });
  });

  it("of a sale priced apart, lands on another fee's sale and never on its purchase", () => {
    const trade = (id: string, sale: boolean): SlimFee => ({ id, kind: "trade", stages: [{ price: action(0.1) }], ...(sale ? { sale: [{ price: action(0.2) }] } : {}) });
    const withMin = { ...trade("fee-t", true), sale: [{ price: action(0.2, 7) }] };
    const x: FeeDeal = { id: "deal-t", name: "", kind: "brokerage-account", fees: [withMin, trade("fee-u", true), trade("fee-v", false)] };
    const min: Lifted = { k: "part", fee: "fee-t", case: null, price: { side: "sell", from: null }, row: "min" };
    const r = got(liftDrop(x, min, { k: "case", fee: "fee-u", case: null }));
    const u = r.deal.fees[1] as SlimFee;
    expect(u.sale).toEqual([{ price: action(0.2, 7) }]);
    expect(u.stages).toEqual([{ price: action(0.1) }]);
    expect((r.deal.fees[0] as SlimFee).sale).toEqual([{ price: action(0.2) }]);
    expect((r.deal.fees[0] as SlimFee).stages).toEqual([{ price: action(0.1) }]);
    // a fee whose sale is priced as its purchase has no sale's price to take it
    expect(liftTakes(x, min, { k: "case", fee: "fee-v", case: null })).toBe(false);
  });

  it("travels as the carried item's id, its price's key with it", () => {
    expect(liftedOf(liftId(aug))).toEqual(aug);
  });

  it("takes nothing from a free price in the bin: its part has nothing to take away", () => {
    // a slim fee priced 5 ₪ a month until August 2027, then free
    const ends: SlimFee = { id: "fee-e", kind: "fixed_period", stages: [{ price: sum(5), until: "2027-08" }, { price: { form: "free" } }] };
    const x: FeeDeal = { ...d(), fees: [fixed(), ends] };
    const free: Lifted = { k: "part", fee: "fee-e", case: null, price: { side: "buy", from: "2027-08" }, row: "price" };
    expect(binTakes(x, free)).toBe(false);
    expect(liftRemove(x, free)).toBeNull();
    // a case's free first price the same way, while its later price, which charges, goes
    const first: Lifted = { k: "part", fee: "fee-f", case: "a", price: FIRST, row: "price" };
    expect(binTakes(d(), first)).toBe(false);
    expect(binTakes(d(), aug)).toBe(true);
  });

  it("leaves a free price free when its \"חינם\" moves away, and the cell's and the row's bins take nothing from it", () => {
    const free: Lifted = { k: "part", fee: "fee-f", case: "a", price: FIRST, row: "price" };
    const r = liftDrop(d(), free, { k: "case", fee: "fee-f", case: "b" });
    if (r) expect(got(stagesOf(r.deal, "a")[0]).price).toEqual({ form: "free" });
    // onto another fee, whose first price charges
    const x: FeeDeal = { ...d(), fees: [fixed(), { id: "fee-m", kind: "fixed_period", stages: [{ price: sum(9) }] }] };
    const m = got(liftDrop(x, free, { k: "case", fee: "fee-m", case: null }));
    expect(got(stagesOf(m.deal, "a")[0]).price).toEqual({ form: "free" });
    expect((m.deal.fees[1] as SlimFee).stages).toEqual([{ price: { form: "free" } }]);
    // a cell of free prices, and a row whose every case is free there, in the bin
    expect(binTakes(d(), { k: "cell", fee: "fee-f", cases: ["a", "b"], row: "price", along: 0 })).toBe(false);
    expect(binTakes(d(), { k: "row", fee: "fee-f", row: "price" })).toBe(false);
  });

  it("says why another fee with no price starting that month does not take it, and why one with no sale priced apart does not take a sale's", () => {
    const x: FeeDeal = { ...d(), fees: [fixed(), { id: "fee-j", kind: "fixed_period", stages: later("2028-01", 20) }] };
    expect(liftTakes(x, aug, { k: "case", fee: "fee-j", case: null })).toBe(false);
    expect(liftWhy(x, aug, { k: "case", fee: "fee-j", case: null })).toBe(copy.cases.lifted.noPriceFrom.replace("{month}", fmt.period("2027-08")));
    const trade = (id: string, sale: boolean): SlimFee => ({ id, kind: "trade", stages: [{ price: action(0.1) }], ...(sale ? { sale: [{ price: action(0.2, 7) }] } : {}) });
    const t: FeeDeal = { id: "deal-t", name: "", kind: "brokerage-account", fees: [trade("fee-t", true), trade("fee-v", false)] };
    const min: Lifted = { k: "part", fee: "fee-t", case: null, price: { side: "sell", from: null }, row: "min" };
    expect(liftWhy(t, min, { k: "case", fee: "fee-v", case: null })).toBe(copy.cases.lifted.noSale);
    // a fee that has the price, but whose kind does not take the part, says so
    const c: FeeDeal = { ...d(), fees: [fixed(), { id: "fee-k", kind: "fx", stages: [{ price: { form: "free" }, until: "2027-08" }, { price: action(0.2) }] }] };
    expect(liftWhy(c, aug, { k: "case", fee: "fee-k", case: null })).toBe(copy.cases.lifted.notHere);
  });

  it("moves a later price's note alone onto another fee's price starting the same month, the first prices left as they were", () => {
    const noted = (p: Price, notes: string[]): Price => ({ ...p, notes } as Price);
    const trade = (id: string, notes: string[]): SlimFee => ({ id, kind: "trade", stages: [{ price: action(0.1), until: "2027-08" }, { price: noted(action(0.2), notes) }] });
    const x: FeeDeal = { id: "deal-n", name: "", kind: "brokerage-account", fees: [trade("fee-t", ["unfilled", "partial"]), trade("fee-u", ["unfilled"])] };
    const note: Lifted = { k: "part", fee: "fee-t", case: null, price: { side: "buy", from: "2027-08" }, row: "notes", note: "partial" };
    const r = got(liftDrop(x, note, { k: "case", fee: "fee-u", case: null }));
    const [t, u] = r.deal.fees as [SlimFee, SlimFee];
    expect(t.stages).toEqual([{ price: action(0.1), until: "2027-08" }, { price: noted(action(0.2), ["unfilled"]) }]);
    expect(u.stages).toEqual([{ price: action(0.1), until: "2027-08" }, { price: noted(action(0.2), ["unfilled", "partial"]) }]);
    // copied, it stays where it was too
    expect((got(liftDrop(x, note, { k: "case", fee: "fee-u", case: null }, { copy: true })).deal.fees[0] as SlimFee).stages).toEqual(trade("fee-t", ["unfilled", "partial"]).stages);
  });

  it("of a sale's first price, lands on no head: a head's cases take the purchase's first price's parts alone", () => {
    const grid = fx();
    const x: FeeDeal = { ...deal(), fees: [{ ...grid, cases: grid.cases.map((c) => (c.id === "d1" ? { ...c, sale: [{ price: action(0.3, 9) }] } : c)) }, custody()] };
    const min: Lifted = { k: "part", fee: "fee-fx", case: "d1", price: { side: "sell", from: null }, row: "min" };
    const column: LiftTarget = { k: "cases", fee: "fee-fx", cases: ["d1", "b1"], along: 0, names: {} };
    expect(liftDrop(x, min, column)).toBeNull();
    expect(liftTakes(x, min, column)).toBe(false);
    expect(liftWhy(x, min, column)).toBeNull();
    // the purchase's first price's minimum, the same case and head, lands there
    expect(liftTakes(x, { ...min, price: FIRST }, column)).toBe(true);
  });
});
