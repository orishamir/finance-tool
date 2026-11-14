// A fee's cases laid out by its shape (layout.ts), on every shape: one thing as a table (and as rows past five cases), a range as a ladder,
// two things as a grid, three with a switch, and a grid whose cases do not fall one to a place, read as rows. The cases are bare: rows,
// keys and currencies, with no fee, thing or product behind them.
import { readFileSync } from "node:fs";
import { productIds } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { FEE_KIND_IDS } from "./shapes";
import { CONDITIONS } from "./offers/conditions";
import { PART_IDS } from "./offers/parts";
import { layoutOf, MAX_COLUMNS, spanOf, valueKey, WHOLE, type FeeLayout, type LayoutCase, type LayoutPart } from "./layout";
import type { When } from "./model";

const ROWS = ["price", "min", "max", "notes"];
const p = (row: string, key: string): LayoutPart => ({ row, key });
const c = (id: string, when: When[], ...parts: LayoutPart[]): LayoutCase => ({ id, when, parts });
const one = [{ range: false }];

type Of<S extends FeeLayout["shape"]> = Extract<FeeLayout, { shape: S }>;
const as = <S extends FeeLayout["shape"]>(l: FeeLayout, shape: S): Of<S> => {
  expect(l.shape).toBe(shape);
  return l as Of<S>;
};

describe("one thing: a table", () => {
  it("lays the cases out as columns and only the part rows some case has", () => {
    const l = as(layoutOf({ things: one, rows: ROWS, cases: [c("a", [["x"]], p("price", "1%"), p("max", "10")), c("b", [["y"]], p("price", "2%"))] }), "table");
    expect(l.columns.map((x) => x.case)).toEqual(["a", "b"]);
    expect(l.rows.map((r) => r.row)).toEqual(["price", "max"]);
    expect(l.rows[1]!.cells).toEqual([{ from: 0, span: 1, cases: ["a"], key: "10" }, { from: 1, span: 1, cases: ["b"], key: null }]);
    expect(l.fit).toBe("columns");
    expect(l.add).toEqual({ thing: 0, range: false });
  });

  it("keeps a part every case has alike in its own row, one cell over every column; read as rows, it is said once", () => {
    const l = as(layoutOf({ things: one, rows: ROWS, cases: [c("a", [["x"]], p("price", "1%"), p("min", "20")), c("b", [["y"]], p("price", "2%"), p("min", "20"))] }), "table");
    expect(l.rows.map((r) => r.row)).toEqual(["price", "min"]);
    expect(l.rows[1]!.cells).toEqual([{ from: 0, span: 2, cases: ["a", "b"], key: "20" }]);
    expect(l.once).toEqual([{ row: "min", key: "20", cases: ["a", "b"] }]);
    expect(l.shows).toEqual({ a: ["price"], b: ["price"] });
  });

  it("merges the cases alike in a row only where they stand side by side, whatever the others hold", () => {
    const cases = [c("a", [["x"]], p("price", "1%"), p("min", "20₪")), c("b", [["y"]], p("price", "2%"), p("min", "20₪")), c("z", [["w"]], p("price", "3%"), p("min", "50$"))];
    const l = as(layoutOf({ things: one, rows: ROWS, cases }), "table");
    expect(l.rows.find((r) => r.row === "min")!.cells).toEqual([{ from: 0, span: 2, cases: ["a", "b"], key: "20₪" }, { from: 2, span: 1, cases: ["z"], key: "50$" }]);
    // only a cell over every column is said once read as rows
    expect(l.once).toEqual([]);
  });

  it("says nothing once where every case would then show nothing", () => {
    const l = as(layoutOf({ things: one, rows: ROWS, cases: [c("a", [["x"]], p("price", "0.15%"), p("max", "10000")), c("b", [["y"]], p("price", "0.15%"), p("max", "10000"))] }), "table");
    expect(l.once).toEqual([]);
    expect(l.rows.map((r) => r.cells)).toEqual([[{ from: 0, span: 2, cases: ["a", "b"], key: "0.15%" }], [{ from: 0, span: 2, cases: ["a", "b"], key: "10000" }]]);
  });

  it("merges only neighbours", () => {
    const l = as(layoutOf({ things: one, rows: ROWS, cases: [c("a", [["x"]], p("price", "1")), c("b", [["y"]], p("price", "2")), c("d", [["w"]], p("price", "1"))] }), "table");
    expect(l.rows[0]!.cells.map((x) => x.span)).toEqual([1, 1, 1]);
  });

  it("reads more cases than fit as rows", () => {
    const cases = Array.from({ length: MAX_COLUMNS + 1 }, (_, k) => c(`k${k}`, [[`v${k}`]], p("price", String(k))));
    expect(as(layoutOf({ things: one, rows: ROWS, cases }), "table").fit).toBe("rows");
    expect(as(layoutOf({ things: one, rows: ROWS, cases: cases.slice(0, MAX_COLUMNS) }), "table").fit).toBe("columns");
  });
});

describe("one range: a ladder", () => {
  it("orders the steps ascending, any value last, and adds a step", () => {
    const l = as(layoutOf({ things: [{ range: true }], rows: ROWS, cases: [c("hi", [2], p("price", "0.1")), c("lo", [0], p("price", "0.2")), c("all", ["any"], p("price", "0")), c("mid", [1], p("price", "0.15"))] }), "table");
    expect(l.ladder).toBe(true);
    expect(l.columns.map((x) => x.case)).toEqual(["lo", "mid", "hi", "all"]);
    expect(l.add).toEqual({ thing: 0, range: true });
  });
});

/** The trade fee of a bank's price list: what is bought down, the channel across, abroad in any channel and in dollars. */
const trade = (): LayoutCase[] => [
  c("ta-d", [["tase"], ["direct"]], p("price", "0.5%"), p("min", "20₪"), p("max", "20000₪")),
  c("ta-b", [["tase"], ["branch"]], p("price", "0.55%"), p("min", "20₪"), p("max", "20000₪"), p("notes", "clerk")),
  c("mk-d", [["makam"], ["direct"]], p("price", "0.09%"), p("min", "20₪"), p("max", "7500₪")),
  c("mk-b", [["makam"], ["branch"]], p("price", "0.1%"), p("min", "20₪"), p("max", "7500₪"), p("notes", "clerk")),
  c("ab", [["us", "europe"], "any"], p("price", "0.6%"), p("min", "50$"), p("max", "10000$")),
];
const two = [{ range: false }, { range: false }];

describe("two things: a grid", () => {
  it("puts the first thing down the side and the second across, a case on any value of the second spanning its row", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases: trade() }), "grid");
    expect(l.rows.map((r) => r.key)).toEqual([valueKey(["tase"]), valueKey(["makam"]), valueKey(["us", "europe"])]);
    expect(l.columns.map((x) => x.key)).toEqual([valueKey(["direct"]), valueKey(["branch"])]);
    expect(l.rows[2]!.cells).toEqual([{ from: 0, span: 2, case: "ab", cases: ["ab"], whole: true }]);
    expect(l.down).toEqual({ thing: 0, range: false });
    expect(l.across).toEqual({ thing: 1, range: false });
  });

  it("puts a row's parts alike under its cells, one part cell over them each, and keeps the rest in the cells", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases: trade() }), "grid");
    expect(l.rows[0]!.parts).toEqual([
      { row: "min", cells: [{ from: 0, span: 2, cases: ["ta-d", "ta-b"], key: "20₪" }] },
      { row: "max", cells: [{ from: 0, span: 2, cases: ["ta-d", "ta-b"], key: "20000₪" }] },
    ]);
    // a part every case holds alike stands in each row's part cell: the rows stay apart
    expect(l.rows[1]!.parts.map((x) => [x.row, x.cells[0]!.key])).toEqual([["min", "20₪"], ["max", "7500₪"]]);
    expect(l.rows[2]!.parts).toEqual([]);
    expect(l.cellShows).toMatchObject({ "ta-d": ["price"], "ta-b": ["price", "notes"], ab: ["price", "min", "max"] });
    // read as rows, a row's part cells said once under its value
    expect(l.rows[0]!.once.map((x) => x.row)).toEqual(["min", "max"]);
    expect(l.shows).toMatchObject({ "ta-d": ["price"], "ta-b": ["price", "notes"] });
  });

  it("keeps a part common to a whole column in each cell of it", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases: trade().slice(0, 4) }), "grid");
    expect(l.cellShows["ta-b"]).toEqual(["price", "notes"]);
    expect(l.cellShows["mk-b"]).toEqual(["price", "notes"]);
  });

  it("keeps a case stretched off a part cell (a span of its own in that part row) apart, the part in its own cell", () => {
    const cases = trade().map((x) => (x.id === "ta-b" ? { ...x, spans: [{ row: "max", along: 1, span: "s1" }] } : x));
    const l = as(layoutOf({ things: two, rows: ROWS, cases }), "grid");
    expect(l.rows[0]!.parts.map((x) => x.row)).toEqual(["min"]);
    expect(l.cellShows["ta-b"]).toEqual(["price", "max", "notes"]);
  });

  it("makes a part cell only over cells side by side: none over a row with one case and a place no case holds", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases: trade().filter((x) => x.id !== "mk-b") }), "grid");
    expect(l.rows[1]!.parts).toEqual([]);
    expect(l.cellShows["mk-d"]).toEqual(["price", "min", "max"]);
  });

  it("leaves a place no case holds empty, for a case to be added there", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases: trade().filter((x) => x.id !== "mk-b") }), "grid");
    expect(l.rows[1]!.cells).toEqual([{ from: 0, span: 1, case: "mk-d", cases: ["mk-d"], whole: false }, { from: 1, span: 1, case: null, cases: [], whole: false }]);
  });

  it("orders a range's rows ascending", () => {
    const l = as(layoutOf({ things: [{ range: true }, { range: false }], rows: ROWS, cases: [c("b", [1, ["x"]], p("price", "1")), c("a", [0, ["x"]], p("price", "2"))] }), "grid");
    expect(l.rows.map((r) => r.when)).toEqual([0, 1]);
    expect(l.down.range).toBe(true);
  });

  it("is read as rows where two cases fall on one place, or a case on any value stands beside others in its row", () => {
    const twice = [...trade(), c("again", [["tase"], ["direct"]], p("price", "9%"))];
    const rows = as(layoutOf({ things: two, rows: ROWS, cases: twice }), "rows");
    expect(rows.cases).toHaveLength(6);
    expect(rows.add).toBeNull();
    expect(rows.shows.again).toEqual(["price"]);
    const beside = [...trade(), c("ab-b", [["us", "europe"], ["branch"]], p("price", "1%"))];
    expect(layoutOf({ things: two, rows: ROWS, cases: beside }).shape).toBe("rows");
    // every case on any value of the second thing: there is nothing across
    expect(layoutOf({ things: two, rows: ROWS, cases: [c("a", [["x"], "any"], p("price", "1")), c("b", [["y"], "any"], p("price", "2"))] }).shape).toBe("rows");
  });
});

describe("equal neighbours share one cell, within one span", () => {
  /** A conversion by the channel down and the size across: free up to 10, then one price above 10 and above 100. */
  const fx = (spans?: LayoutCase["spans"]): LayoutCase[] => [
    c("d0", [["direct"], 0], p("price", "free")),
    c("d1", [["direct"], 1], p("price", "0.0875%"), p("min", "5$")),
    { ...c("d2", [["direct"], 2], p("price", "0.0875%"), p("min", "5$")), ...(spans ? { spans } : {}) },
    c("b0", [["branch"], 0], p("price", "free")),
    c("b1", [["branch"], 1], p("price", "0.175%"), p("min", "6.25$")),
    c("b2", [["branch"], 2], p("price", "0.175%"), p("min", "6.25$")),
  ];
  const ranged = [{ range: false }, { range: true }];

  it("merges a grid's equal neighbours in a row into one cell covering both cases", () => {
    const l = as(layoutOf({ things: ranged, rows: ROWS, cases: fx() }), "grid");
    expect(l.rows.map((r) => r.cells.map((x) => [x.from, x.span, x.cases]))).toEqual([
      [[0, 1, ["d0"]], [1, 2, ["d1", "d2"]]],
      [[0, 1, ["b0"]], [1, 2, ["b1", "b2"]]],
    ]);
    // a part only the merged cell holds is no part cell
    expect(l.rows[0]!.parts).toEqual([]);
  });

  it("keeps apart equal neighbours whose cells stand in different spans", () => {
    const l = as(layoutOf({ things: ranged, rows: ROWS, cases: fx([{ row: WHOLE, along: 1, span: "s1" }]) }), "grid");
    expect(l.rows[0]!.cells.map((x) => x.cases)).toEqual([["d0"], ["d1"], ["d2"]]);
    expect(l.rows[1]!.cells.map((x) => x.cases)).toEqual([["b0"], ["b1", "b2"]]);
  });

  it("merges equal cells down a grid's column into one cell over both rows, only within one named span along the first thing", () => {
    const down = [{ row: WHOLE, along: 0, span: "s1" }];
    const same = [
      { ...c("d0", [["direct"], 0], p("price", "free")), spans: down },
      c("d1", [["direct"], 1], p("price", "1%")),
      { ...c("b0", [["branch"], 0], p("price", "free")), spans: down },
      c("b1", [["branch"], 1], p("price", "2%")),
    ];
    const l = as(layoutOf({ things: ranged, rows: ROWS, cases: same }), "grid");
    expect(l.rows[0]!.cells[0]).toEqual({ from: 0, span: 1, case: "d0", cases: ["d0", "b0"], whole: false, down: 2 });
    // equal rows that nobody joined stay apart: the default span merges across a row, never down a column
    expect(as(layoutOf({ things: ranged, rows: ROWS, cases: same.map(({ spans: _s, ...x }) => x) }), "grid").rows[0]!.cells[0]!.down).toBeUndefined();
    expect(l.rows[1]!.cells[0]).toMatchObject({ case: "b0", covered: true });
    const apart = as(layoutOf({ things: ranged, rows: ROWS, cases: same.map((x) => (x.id === "b0" ? { ...x, spans: [{ row: WHOLE, along: 0, span: "s2" }] } : x)) }), "grid");
    expect(apart.rows[0]!.cells[0]!.down).toBeUndefined();
  });

  it("keeps apart a table's equal neighbours in another span of that row, and merges the other rows", () => {
    const cases = [c("a", [["x"]], p("price", "1%"), p("min", "5")), { ...c("b", [["y"]], p("price", "1%"), p("min", "5")), spans: [{ row: "price", along: 0, span: "s1" }] }];
    const l = as(layoutOf({ things: one, rows: ROWS, cases }), "table");
    expect(l.rows.map((r) => r.cells.map((x) => x.cases))).toEqual([[["a"], ["b"]], [["a", "b"]]]);
    expect(spanOf(cases[1]!, "price", 0)).toBe("s1");
    expect(spanOf(cases[0]!, "price", 0)).toBe("");
  });
});

describe("two things, one value of the first split by the second: a table", () => {
  const cases = [
    c("ta", [["tase"], "any"], p("price", "0.1%")),
    c("us", [["abroad"], ["USD"]], p("price", "0.2%")),
    c("eu", [["abroad"], ["EUR"]], p("price", "0.2%")),
    c("mk", [["makam"], "any"], p("price", "0.05%")),
  ];

  it("stands the split value's cases side by side under it, each with its sub-head, and the rest as they were", () => {
    const l = as(layoutOf({ things: two, rows: ROWS, cases }), "table");
    expect(l.split).toBe(1);
    expect(l.columns).toEqual([{ case: "ta", when: ["tase"] }, { case: "us", when: ["abroad"], sub: ["USD"] }, { case: "eu", when: ["abroad"], sub: ["EUR"] }, { case: "mk", when: ["makam"] }]);
    expect(l.rows[0]!.cells.map((x) => x.cases)).toEqual([["ta"], ["us", "eu"], ["mk"]]);
  });

  it("is a grid once a second value is split, and rows where a value has a case for any value beside others", () => {
    expect(layoutOf({ things: two, rows: ROWS, cases: [...cases.slice(0, 3), c("mk1", [["makam"], ["USD"]], p("price", "1")), c("mk2", [["makam"], ["EUR"]], p("price", "2"))] }).shape).toBe("grid");
    expect(as(layoutOf({ things: one, rows: ROWS, cases: [c("a", [["x"]], p("price", "1"))] }), "table").split).toBeNull();
  });
});

describe("three things: a switch above the grid", () => {
  const three = [{ range: false }, { range: false }, { range: false }];
  const cases = [
    c("a1", [["x"], ["p"], ["t1"]], p("price", "1")),
    c("a2", [["x"], ["q"], ["t1"]], p("price", "2")),
    c("b1", [["x"], ["p"], ["t2"]], p("price", "3")),
    c("b2", [["x"], ["q"], ["t2"]], p("price", "4")),
    c("any", [["y"], "any", "any"], p("price", "5")),
  ];

  it("shows the grid of the switch's first value, with the cases on any value of it in every grid", () => {
    const l = as(layoutOf({ things: three, rows: ROWS, cases }), "grid");
    expect(l.switch).toMatchObject({ thing: 2, chosen: valueKey(["t1"]) });
    expect(l.switch!.values.map((v) => v.key)).toEqual([valueKey(["t1"]), valueKey(["t2"])]);
    expect(l.rows.flatMap((r) => r.cells.map((x) => x.case))).toEqual(["a1", "a2", "any"]);
  });

  it("shows the value the switch is set to", () => {
    const l = as(layoutOf({ things: three, rows: ROWS, cases, switchTo: valueKey(["t2"]) }), "grid");
    expect(l.rows.flatMap((r) => r.cells.map((x) => x.case))).toEqual(["b1", "b2", "any"]);
    // a value the cases do not have falls back to the first
    expect(as(layoutOf({ things: three, rows: ROWS, cases, switchTo: "nothing" }), "grid").switch!.chosen).toBe(valueKey(["t1"]));
  });
});

describe("the layout is blind to what the fee is", () => {
  it("names no fee, thing, part or product, and reads nothing but a case's values", () => {
    const code = readFileSync(new URL("./layout.ts", import.meta.url), "utf8").replace(/^\s*(\/\/|\*|\/\*\*).*$/gm, "");
    const imports = [...code.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
    expect(imports).toEqual(["./model"]);
    for (const id of [...FEE_KIND_IDS, ...Object.keys(CONDITIONS), ...PART_IDS, ...productIds]) expect(code, id).not.toContain(`"${id}"`);
  });
});
