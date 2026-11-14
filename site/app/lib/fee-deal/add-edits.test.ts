// The edits the workbench's add slots make (method §10.6, F-114): a ladder's step added by its boundary alone, a boundary moved, a case put
// in a grid's empty place, and a grid's new row or column of values.
import { describe, expect, it } from "vitest";
import { addCaseAt, addStep, addValues, setTop } from "./edits/case";
import { readDeal, typed, type CasesFee, type Price } from "./model";

const held = (rate: number): Price => ({ form: "held", rate: typed(rate), per: 12, every: 12 });

/** A custody fee by the size of the portfolio: up to 100,000 ₪, 100,000 to 500,000 ₪, above 500,000 ₪. */
const ladder = (): CasesFee => ({
  id: "fee-l",
  kind: "custody",
  by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100_000), typed(500_000)] }],
  cases: [
    { id: "s0", when: [0], stages: [{ price: held(0.2) }] },
    { id: "s1", when: [1], stages: [{ price: held(0.15) }] },
    { id: "s2", when: [2], stages: [{ price: held(0.1) }] },
  ],
});

const rates = (f: CasesFee) => f.cases.map((c) => [c.when[0], (c.stages[0]!.price as { rate: { v: number } }).rate.v]);
const tops = (f: CasesFee) => (f.by[0] as { tops: { v: number }[] }).tops.map((n) => n.v);

describe("a ladder's step added by its boundary", () => {
  it("splits the step the boundary falls in, both halves keeping its price, and moves the steps above it up", () => {
    const f = addStep(ladder(), 0, 250_000) as CasesFee;
    expect(tops(f)).toEqual([100_000, 250_000, 500_000]);
    expect(rates(f)).toEqual([[0, 0.2], [1, 0.15], [2, 0.15], [3, 0.1]]);
    // the case keeps its id on the lower half; the upper half is a new case
    expect(f.cases[1]!.id).toBe("s1");
    expect(new Set(f.cases.map((c) => c.id)).size).toBe(4);
  });

  it("splits the first step below the first boundary, and the last above the last", () => {
    expect(tops(addStep(ladder(), 0, 50_000) as CasesFee)).toEqual([50_000, 100_000, 500_000]);
    const above = addStep(ladder(), 0, 1_000_000) as CasesFee;
    expect(tops(above)).toEqual([100_000, 500_000, 1_000_000]);
    expect(rates(above).filter(([w]) => (w as number) >= 2)).toEqual([[2, 0.1], [3, 0.1]]);
  });

  it("leaves the fee as it is for a boundary it has already, or none above zero", () => {
    expect(addStep(ladder(), 0, 100_000)).toEqual(ladder());
    expect(addStep(ladder(), 0, 0)).toEqual(ladder());
    expect(addStep(ladder(), 0, -5)).toEqual(ladder());
  });

  it("splits every case on the step in a fee that changes by more than the range", () => {
    const two: CasesFee = {
      id: "fee-g",
      kind: "fx",
      by: [{ kind: "actionSize", unit: "USD", tops: [typed(100)] }, { kind: "channel" }],
      cases: [
        { id: "a", when: [0, ["branch"]], stages: [{ price: { form: "action", rate: typed(0.2) } }] },
        { id: "b", when: [0, ["direct"]], stages: [{ price: { form: "action", rate: typed(0.1) } }] },
        { id: "c", when: [1, "any"], stages: [{ price: { form: "action", rate: typed(0.05) } }] },
      ],
    };
    const f = addStep(two, 0, 50) as CasesFee;
    expect(f.cases.map((c) => c.when)).toEqual([[0, ["branch"]], [1, ["branch"]], [0, ["direct"]], [1, ["direct"]], [2, "any"]]);
  });

  it("is a deal the device reads back", () => {
    const f = addStep(ladder(), 0, 250_000);
    const deal = { id: "deal-l", name: "", kind: "brokerage-account" as const, fees: [f] };
    expect(readDeal(JSON.parse(JSON.stringify(deal)))).toEqual(deal);
  });
});

describe("a ladder's boundary moved in place", () => {
  it("moves the step above it with it: the two steps meet at the new boundary, with no gap and no overlap", () => {
    const f = setTop(ladder(), 0, 0, 150_000) as CasesFee;
    expect(tops(f)).toEqual([150_000, 500_000]);
    // the second step now starts where the first ends: both read the one top
    expect(f.cases.map((c) => c.when[0])).toEqual([0, 1, 2]);
  });

  it("refuses a boundary that would cross its neighbour's", () => {
    expect(setTop(ladder(), 0, 0, 600_000)).toEqual(ladder());
    expect(setTop(ladder(), 0, 1, 100_000)).toEqual(ladder());
  });
});

/** A trade fee by what is bought and the channel, with no case for money market funds in a branch. */
const grid = (): CasesFee => ({
  id: "fee-t",
  kind: "trade",
  by: [{ kind: "what" }, { kind: "channel" }],
  cases: [
    { id: "t1", when: [["tase"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.5) } }] },
    { id: "t2", when: [["tase"], ["branch"]], stages: [{ price: { form: "action", rate: typed(0.55) } }] },
    { id: "t3", when: [["makam"], ["direct"]], stages: [{ price: { form: "action", rate: typed(0.09) } }] },
  ],
});

describe("a case put in a grid's empty place", () => {
  it("copies the case named with its prices, its value of the thing set to the place's", () => {
    const f = addCaseAt(grid(), "t3", 1, ["branch"]) as CasesFee;
    expect(f.cases).toHaveLength(4);
    expect(f.cases[3]).toMatchObject({ when: [["makam"], ["branch"]], stages: grid().cases[2]!.stages });
    expect(f.cases[3]!.id).not.toBe("t3");
  });

  it("leaves the fee as it is for a value the thing does not know, or a case it does not have", () => {
    expect(addCaseAt(grid(), "t3", 0, ["nowhere"])).toEqual(grid());
    expect(addCaseAt(grid(), "none", 1, ["branch"])).toEqual(grid());
  });
});

describe("a grid's new row or column", () => {
  it("copies the last value's cases to each new value, with their prices", () => {
    const f = addValues(grid(), 0, ["us", "europe"]) as CasesFee;
    expect(f.cases.slice(3).map((c) => c.when)).toEqual([[["us"], ["direct"]], [["europe"], ["direct"]]]);
    const col = addValues(grid(), 1, ["phone"]) as CasesFee;
    // the last channel the cases name for the first time is the branch
    expect(col.cases.slice(3).map((c) => c.when)).toEqual([[["tase"], ["phone"]]]);
  });

  it("leaves out a value the cases name already, and one the thing does not know", () => {
    expect(addValues(grid(), 0, ["tase", "nowhere"])).toEqual(grid());
  });

  it("names a value of the person's own with where it is bought and its currency", () => {
    const f = addValues(grid(), 0, ["אג״ח בלונדון"], [{ name: "אג״ח בלונדון", place: "abroad", currency: "GBP" }]) as CasesFee;
    expect(f.by[0]).toEqual({ kind: "what", own: [{ name: "אג״ח בלונדון", place: "abroad", currency: "GBP" }] });
    expect(f.cases.at(-1)!.when[0]).toEqual(["אג״ח בלונדון"]);
  });
});
