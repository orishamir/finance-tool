// What a grip lifts, where it drops and what the bin takes (lifted.ts), on a deal of two fees: a conversion's grid by the channel and the
// size, and a custody fee of one price. Each drop is one pure edit, and those that take something the person gave say so for the undo.
import { describe, expect, it } from "vitest";
import { binTakes, liftDrop, liftedOf, liftId, liftRemove, liftTakes, liftWhy, type Lifted } from "./lifted";
import { WHOLE } from "./layout";
import { byRank, typed, type CasesFee, type FeeDeal, type Price, type SlimFee } from "./model";
import { feeDeal as copy } from "../../copy";

const action = (rate: number, min?: number): Price => ({ form: "action", rate: typed(rate), ...(min !== undefined ? { min: typed(min) } : {}) });
const fx = (): CasesFee => ({
  id: "fee-fx",
  kind: "fx",
  by: [{ kind: "channel" }, { kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }],
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

  it("merges a cell dropped on its neighbour, kept for the undo where the neighbour held another price", () => {
    const l: Lifted = { k: "cell", fee: "fee-fx", cases: ["d1"], row: WHOLE, along: 1 };
    const r = liftDrop(deal(), l, { k: "cell", fee: "fee-fx", cases: ["d2"], row: WHOLE, along: 1 })!;
    expect(fxOf(r.deal).cases.find((c) => c.id === "d2")!.stages).toEqual(fx().cases[1]!.stages);
    expect(r.kept?.words).toBe(copy.cases.lifted.merged);
  });

  it("moves a grid's row among its rows, and swaps two things", () => {
    expect(byRank(fxOf(liftDrop(deal(), { k: "value", fee: "fee-fx", t: 0, key: '["branch"]', name: "בסניף" }, { k: "value", fee: "fee-fx", t: 0, key: '["direct"]' })!.deal).cases)[0]!.id).toBe("b0");
    expect(fxOf(liftDrop(deal(), { k: "thing", fee: "fee-fx", t: 0 }, { k: "thing", fee: "fee-fx", t: 1 })!.deal).by[0]!.kind).toBe("actionSize");
    // a row dropped on a column of another thing: nothing
    expect(liftTakes(deal(), { k: "value", fee: "fee-fx", t: 0, key: '["branch"]', name: "" }, { k: "value", fee: "fee-fx", t: 1, key: "0" })).toBe(false);
  });

  it("moves a part onto another fee that takes it, and says why where one does not", () => {
    const min: Lifted = { k: "part", fee: "fee-fx", case: "d1", row: "min" };
    const r = liftDrop(deal(), min, { k: "case", fee: "fee-c", case: null })!;
    expect((r.deal.fees[1] as SlimFee).stages[0]!.price).toMatchObject({ min: { v: 5 } });
    expect(fxOf(r.deal).cases[1]!.stages[0]!.price).toEqual(action(0.0875));
    const price: Lifted = { k: "part", fee: "fee-fx", case: "d1", row: "price" };
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
