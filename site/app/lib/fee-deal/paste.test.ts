// Copy and paste (paste.ts): a part row pasted on a place's cases replaces what they held and says so, and a whole case's price pasted on
// another case.
import { describe, expect, it } from "vitest";
import { pasteOn, type PastePlace } from "./paste";
import { WHOLE } from "./layout";
import { typed, type CasesFee, type FeeDeal } from "./model";

const grid = (): CasesFee => ({
  id: "fee-t",
  kind: "trade",
  by: [{ kind: "what" }, { kind: "channel" }],
  cases: [
    { id: "t1", when: [["tase"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.5), min: typed(20) } }] },
    { id: "t2", when: [["tase"], ["branch"]], stages: [{ price: { form: "action", rate: typed(0.55), min: typed(30) } }] },
    { id: "t3", when: [["makam"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.09) } }] },
  ],
});
const deal = (): FeeDeal => ({ id: "deal-p", name: "", kind: "brokerage-account", fees: [grid()] });
const place = (cases: string[], along = 1): PastePlace => ({ k: "cases", fee: "fee-t", cases, along, names: Object.fromEntries(cases.map((id) => [id, id])) });
const fee = (d: FeeDeal) => d.fees[0] as CasesFee;
const price = (d: FeeDeal, id: string) => fee(d).cases.find((c) => c.id === id)!.stages[0]!.price as { rate: { v: number }; min?: { v: number } };

describe("a cell pasted", () => {
  it("puts its part row in the place's cases, replacing what they held, and its undo line says what was replaced where", () => {
    const r = pasteOn(deal(), { k: "cell", fee: "fee-t", cases: ["t1"], row: "min", along: 1 }, place(["t2", "t3"]))!;
    expect(price(r.deal, "t2").min?.v).toBe(20);
    expect(price(r.deal, "t3").min?.v).toBe(20);
    // the rates stay: only the minimum's row was pasted
    expect(price(r.deal, "t2").rate.v).toBe(0.55);
    expect(r.kept?.words).toContain("t2");
    expect(r.kept?.words).not.toContain("t3");
    // the copied cell keeps what it held
    expect(price(r.deal, "t1").min?.v).toBe(20);
  });

  it("a grid's whole case gives each case of the place its whole price", () => {
    const r = pasteOn(deal(), { k: "cell", fee: "fee-t", cases: ["t3"], row: WHOLE, along: 1 }, place(["t1"]))!;
    expect(price(r.deal, "t1")).toEqual({ form: "action", rate: { v: 0.09 } });
    expect(fee(r.deal).cases.find((c) => c.id === "t1")!.when).toEqual([["tase"], ["direct"]]);
    expect(r.kept?.words).toBe("t1: המחיר הוחלף.");
  });

  it("changes nothing on its own cell", () => {
    expect(pasteOn(deal(), { k: "cell", fee: "fee-t", cases: ["t3"], row: WHOLE, along: 1 }, place(["t3"]))).toBeNull();
  });
});
