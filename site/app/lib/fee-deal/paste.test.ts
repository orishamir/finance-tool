// Copy and paste (paste.ts): a part row pasted on a place's cases replaces what they held and says so, a whole case's price pasted on
// another case, and the copy a snapshot: what the cell held when copied, after it is edited or taken away.
import { describe, expect, it } from "vitest";
import { clipOf, pasteOn, type PastePlace } from "./paste";
import { removeCase } from "./edits/case";
import { updateFee } from "./edits/deal";
import { WHOLE } from "./layout";
import { typed, type CasesFee, type FeeDeal } from "./model";

const grid = (): CasesFee => ({
  id: "fee-t",
  kind: "trade",
  by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }],
  cases: [
    { id: "t1", when: [["tase"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.5), min: typed(20) } }] },
    { id: "t2", when: [["tase"], ["branch"]], stages: [{ price: { form: "action", rate: typed(0.55), min: typed(30) } }] },
    { id: "t3", when: [["makam"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.09) } }] },
  ],
});
const deal = (): FeeDeal => ({ id: "deal-p", name: "", kind: "brokerage-account", fees: [grid()] });
const place = (cases: string[], along = 1): PastePlace => ({ k: "cases", fee: "fee-t", cases, along, names: Object.fromEntries(cases.map((id) => [id, id])) });
const fee = (d: FeeDeal) => d.fees[0] as CasesFee;
/** The snapshot Ctrl+C takes of a cell of the deal's fee: case `id`, its part row `row` (or the whole case). */
const copied = (d: FeeDeal, id: string, row: Parameters<typeof clipOf>[1]["row"]) => clipOf(fee(d), { k: "cell", fee: "fee-t", cases: [id], row, along: 1 })!;
const price = (d: FeeDeal, id: string) => fee(d).cases.find((c) => c.id === id)!.stages[0]!.price as { rate: { v: number }; min?: { v: number } };

describe("a cell pasted", () => {
  it("puts its part row in the place's cases, replacing what they held, and its undo line says what was replaced where", () => {
    const r = pasteOn(deal(), copied(deal(), "t1", "min"), place(["t2", "t3"]))!;
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
    const r = pasteOn(deal(), copied(deal(), "t3", WHOLE), place(["t1"]))!;
    expect(price(r.deal, "t1")).toEqual({ form: "action", rate: { v: 0.09 } });
    expect(fee(r.deal).cases.find((c) => c.id === "t1")!.when).toEqual([["tase"], ["direct"]]);
    expect(r.kept?.words).toBe("t1: המחיר הוחלף.");
  });

  it("changes nothing on its own cell", () => {
    expect(pasteOn(deal(), copied(deal(), "t3", WHOLE), place(["t3"]))).toBeNull();
  });

  it("pastes what the cell held when it was copied, after the cell is edited", () => {
    const clip = copied(deal(), "t1", "min");
    const edited = updateFee(deal(), "fee-t", (f) => ({ ...f, cases: (f as CasesFee).cases.map((c) => (c.id === "t1" ? { ...c, stages: [{ price: { form: "action" as const, rate: typed(0.5), min: typed(99) } }] } : c)) }) as CasesFee);
    expect(price(pasteOn(edited, clip, place(["t3"]))!.deal, "t3").min?.v).toBe(20);
    const whole = copied(deal(), "t1", WHOLE);
    expect(price(pasteOn(edited, whole, place(["t3"]))!.deal, "t3").min?.v).toBe(20);
  });

  it("still pastes after the cell copied is taken away, and leaves no trace of the copy in the deal", () => {
    const clip = copied(deal(), "t2", "min");
    const gone = updateFee(deal(), "fee-t", (f) => removeCase(f, "t2"));
    const r = pasteOn(gone, clip, place(["t3"]))!;
    expect(price(r.deal, "t3").min?.v).toBe(30);
    expect(r.deal.fees.map((f) => f.id)).toEqual(["fee-t"]);
    expect(fee(r.deal).cases.map((c) => c.id)).toEqual(["t1", "t3"]);
  });
});
