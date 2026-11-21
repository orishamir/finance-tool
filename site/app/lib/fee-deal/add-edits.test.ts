// The edits the workbench's add slots make (method §10.6, F-114): a ladder's step added by its boundary alone, a boundary moved, a case put
// in a grid's empty place, and a grid's new row or column of values.
import { describe, expect, it } from "vitest";
import { addCaseAt, addStep, addValues, addValuesAt, nameTaken, setTop } from "./edits/case";
import { thingValues } from "./model";
import { bandLayout } from "./band-layout";
import type { CaseRow } from "./rows";
import { valueKey } from "./layout";
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
      by: [{ kind: "actionSize", unit: "USD", tops: [typed(100)] }, { kind: "channel", values: [] }],
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
  by: [{ kind: "what", values: ["tase", "makam"] }, { kind: "channel", values: ["direct", "branch"] }],
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
  it("keeps each new value with no case, after the thing's values, so every place of it is one no case holds", () => {
    const f = addValues(grid(), 0, ["us", "europe"]) as CasesFee;
    expect(f.cases).toEqual(grid().cases);
    expect(f.by[0]).toEqual({ kind: "what", values: ["tase", "makam", "us", "europe"] });
    const col = addValues(grid(), 1, ["phone"]) as CasesFee;
    expect(col.cases).toEqual(grid().cases);
    expect(col.by[1]).toEqual({ kind: "channel", values: ["direct", "branch", "phone"] });
    // the grid draws the new row with a place no case holds under each column
    const g = bandLayout(f, f.cases.map((c) => ({ case: c.id, parts: [] }) as unknown as CaseRow));
    expect(g.shape).toBe("grid");
    if (g.shape !== "grid") return;
    expect(g.rows.map((r) => r.key)).toEqual([valueKey(["tase"]), valueKey(["makam"]), valueKey(["us"]), valueKey(["europe"])]);
    expect(g.rows[2]!.cells.map((c) => c.case)).toEqual([null, null]);
  });

  it("leaves out a value the cases name already, and one the thing does not know", () => {
    expect(addValues(grid(), 0, ["tase", "nowhere"])).toEqual(grid());
  });

  it("names a value of the person's own with where it is bought and its currency", () => {
    const f = addValues(grid(), 0, ["אג״ח בלונדון"], [{ name: "אג״ח בלונדון", place: "abroad", currency: "GBP" }]) as CasesFee;
    expect(f.by[0]).toEqual({ kind: "what", values: ["tase", "makam", "אג״ח בלונדון"], own: [{ name: "אג״ח בלונדון", place: "abroad", currency: "GBP" }] });
    expect(f.cases).toHaveLength(3);
  });
});

describe("a row or a column added between two", () => {
  it("stands its new values right before the value it was added before, in the order given, the other thing's order kept", () => {
    const f = addValuesAt(grid(), 0, ["us", "europe"], [], valueKey(["makam"])) as CasesFee;
    expect(thingValues(f, 0)).toEqual(["tase", "us", "europe", "makam"]);
    expect(thingValues(f, 1)).toEqual(thingValues(grid(), 1));
    // what is added is what addValues adds: values, no case
    expect(f.cases).toEqual(grid().cases);
  });
  it("is addValues without a place, or where nothing was added", () => {
    const whens = (f: unknown) => (f as CasesFee).cases.map((c) => c.when);
    expect(whens(addValuesAt(grid(), 1, ["phone"]))).toEqual(whens(addValues(grid(), 1, ["phone"])));
    expect(addValuesAt(grid(), 0, ["tase"], [], valueKey(["tase"]))).toEqual(grid());
  });
});

describe("a value the list has already is not added twice", () => {
  /** A trade fee by the channel, on the internet and at the branch. */
  const channels = (): CasesFee => ({
    id: "fee-c",
    kind: "trade",
    by: [{ kind: "channel", values: [] }],
    cases: [
      { id: "net", when: [["internet"]], stages: [{ price: { form: "action", rate: typed(0.1) } }] },
      { id: "branch", when: [["branch"]], stages: [{ price: { form: "action", rate: typed(0.5) } }] },
    ],
  });
  it("adds none of the values the cases name, its spaces trimmed", () => {
    const f = channels();
    expect(addValues(f, 0, ["branch", " internet "])).toBe(f);
    expect(thingValues(addValues(f, 0, ["branch", "phone"]) as CasesFee, 0)).toEqual(["internet", "branch", "phone"]);
  });
  it("refuses a name of the person's own that the list has by its id or its words, its spaces trimmed", () => {
    const known = ["branch", "בסניף", "internet", "באינטרנט"];
    expect(nameTaken(known, "בסניף")).toBe(true);
    expect(nameTaken(known, "  בסניף ")).toBe(true);
    expect(nameTaken(known, "branch")).toBe(true);
    expect(nameTaken(known, "בטלפון")).toBe(false);
    expect(nameTaken(known, "   ")).toBe(false);
  });
});
