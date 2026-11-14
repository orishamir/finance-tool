// The edits of a fee's table or grid cells (edits/cells.ts) and of how its cases stand (edits/arrange.ts, `splitCase`): a cell stretched
// over its neighbours and back, a cell's content moved or taken away, within a fee and between fees; a column, a row or a value moved,
// taken away or duplicated; a ladder's step taken away; two things swapped; the deal's fees put in order; one case split by a thing. Each is
// read back through the layout where the layout is what the person sees.
import { describe, expect, it } from "vitest";
import { stretch, shrink, clearCells, moveCell, moveCellTo, cellMovesTo, figuresBack, figureToAll } from "./edits/cells";
import { duplicateValue, moveCase, moveValue, orderFees, removeStep, removeValue, swapThings } from "./edits/arrange";
import { removeBy, splitCase } from "./edits/case";
import { editPrice } from "./edits/stage";
import { withFigure } from "./edits/price";
import { readDealFor } from "./deal-read";
import { keepPicks, picksOf } from "./cases";
import { feesData } from "../fees.server";
import { layoutOf, valueKey, WHOLE, type FeeLayout } from "./layout";
import { byRank, feePriced, NAME_MAX, readDeal, typed, untouched, type Case, type CasesFee, type Fee, type FeeDeal, type Price } from "./model";

const data = feesData();
/** A fee whose case `c`'s minimum is typed again as `v` (what the box in a cell does to its first case). */
const withFigureIn = (f: CasesFee, c: string, v: number) => editPrice(f, "buy", 0, (p) => withFigure(p, "min", v), c);
import { decodeDeal, encodeDeal } from "./link";

const action = (rate: number, min?: number): Price => ({ form: "action", rate: typed(rate), ...(min !== undefined ? { min: typed(min) } : {}) });
const held = (rate: number): Price => ({ form: "held", rate: typed(rate), per: 12, every: 12 });
const rateOf = (c: Case) => (c.stages[0]!.price as { rate?: { v: number } }).rate?.v ?? c.stages[0]!.price.form;

/** A conversion by the channel down and the size across, free up to 10 $, a price above 10 $ and another above 100 $. */
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

/** The layout the page draws for a fee, its cases in the page's order and its parts keyed by their content (as band-layout does). */
const laid = (f: CasesFee): FeeLayout =>
  layoutOf({
    things: f.by.map((b) => ({ range: "tops" in b })),
    rows: ["price", "min", "max", "notes"],
    cases: byRank(f.cases).map((c) => {
      const p = c.stages[0]!.price as Record<string, unknown>;
      const parts = [{ row: "price", key: JSON.stringify([p.form, p.rate ?? null]), currency: null }, ...(p.min ? [{ row: "min", key: JSON.stringify(p.min), currency: null }] : [])];
      return { id: c.id, when: c.when, parts, ...(c.spans ? { spans: c.spans } : {}) };
    }),
  });
const gridCells = (f: CasesFee) => {
  const l = laid(f);
  return l.shape === "grid" ? l.rows.map((r) => r.cells.map((x) => x.cases)) : null;
};

describe("a cell stretched over its neighbours, and back", () => {
  it("gives the covered cases its price, and they share one cell", () => {
    const f = stretch(fx(), "d1", ["d2"], WHOLE, 1) as CasesFee;
    expect(rateOf(f.cases.find((c) => c.id === "d2")!)).toBe(0.0875);
    expect(gridCells(f)).toEqual([[["d0"], ["d1", "d2"]], [["b0"], ["b1"], ["b2"]]]);
  });

  it("stretched back, leaves the case its price as a copy, standing apart", () => {
    const f = shrink(stretch(fx(), "d1", ["d2"], WHOLE, 1), ["d2"], WHOLE, 1) as CasesFee;
    expect(rateOf(f.cases.find((c) => c.id === "d2")!)).toBe(0.0875);
    expect(gridCells(f)![0]).toEqual([["d0"], ["d1"], ["d2"]]);
    // stretched again, it joins the cell's span once more
    expect(gridCells(stretch(f, "d1", ["d2"], WHOLE, 1) as CasesFee)![0]).toEqual([["d0"], ["d1", "d2"]]);
  });

  it("stretched down a grid's column, names its span and shares one cell over both rows; stretched back, the rows stand apart", () => {
    const down = stretch(fx(), "d1", ["b1"], WHOLE, 0, true) as CasesFee;
    expect(rateOf(down.cases.find((c) => c.id === "b1")!)).toBe(0.0875);
    const l = laid(down);
    expect(l.shape === "grid" && l.rows[0]!.cells.find((x) => x.case === "d1")).toMatchObject({ down: 2, cases: ["d1", "b1"] });
    const back = laid(shrink(down, ["b1"], WHOLE, 0) as CasesFee);
    expect(back.shape === "grid" && back.rows[0]!.cells.some((x) => x.down)).toBe(false);
  });

  it("in a table, gives a neighbour one part row and leaves its other parts", () => {
    const table: CasesFee = { id: "f", kind: "trade", by: [{ kind: "channel" }], cases: [
      { id: "a", when: [["direct"]], stages: [{ price: action(0.1, 15) }] },
      { id: "b", when: [["branch"]], stages: [{ price: action(0.3, 40) }] },
    ] };
    const min = stretch(table, "a", ["b"], "min", 0) as CasesFee;
    expect(min.cases[1]!.stages[0]!.price).toEqual(action(0.3, 15));
    const price = stretch(table, "a", ["b"], "price", 0) as CasesFee;
    expect(price.cases[1]!.stages[0]!.price).toEqual(action(0.1, 40));
    // a free price stretched over a charged one makes it free; its bounds have no place in a free price
    const free = stretch({ ...table, cases: [{ ...table.cases[0]!, stages: [{ price: { form: "free" as const } }] }, table.cases[1]!] }, "a", ["b"], "price", 0) as CasesFee;
    expect(free.cases[1]!.stages[0]!.price).toEqual({ form: "free" });
  });

  it("copies the later prices of the month row, and a sale priced apart with the notes", () => {
    const table: CasesFee = { id: "f", kind: "trade", by: [{ kind: "channel" }], cases: [
      { id: "a", when: [["direct"]], stages: [{ price: { form: "free" }, until: "2027-01" }, { price: action(0.1) }], sale: [{ price: action(0.2) }] },
      { id: "b", when: [["branch"]], stages: [{ price: action(0.3) }] },
    ] };
    const later = stretch(table, "a", ["b"], "until", 0) as CasesFee;
    expect(later.cases[1]!.stages).toEqual([{ price: action(0.3), until: "2027-01" }, { price: action(0.1) }]);
    expect(later.cases[1]!.sale).toBeUndefined();
    expect((stretch(table, "a", ["b"], "notes", 0) as CasesFee).cases[1]!.sale).toEqual([{ price: action(0.2) }]);
  });
});

describe("a cell's content moved or taken away", () => {
  const table = (): CasesFee => ({ id: "f", kind: "trade", by: [{ kind: "channel" }], cases: [
    { id: "a", when: [["direct"]], stages: [{ price: action(0.1, 15) }] },
    { id: "b", when: [["branch"]], stages: [{ price: action(0.3) }] },
  ] });

  it("moves a part row to another case, or copies it with the modifier", () => {
    const moved = moveCell(table(), "a", "b", "min") as CasesFee;
    expect(moved.cases.map((c) => c.stages[0]!.price)).toEqual([action(0.1), action(0.3, 15)]);
    const copied = moveCell(table(), "a", "b", "min", true) as CasesFee;
    expect(copied.cases.map((c) => c.stages[0]!.price)).toEqual([action(0.1, 15), action(0.3, 15)]);
  });

  it("takes a part row away from the cases named, the price row leaving the price not given (read nowhere until given)", () => {
    expect((clearCells(table(), ["a", "b"], "min") as CasesFee).cases[0]!.stages[0]!.price).toEqual(action(0.1));
    const gone = clearCells(table(), ["a"], "price") as CasesFee;
    expect(gone.cases[0]!.stages[0]!.price).toEqual({ form: "action", rate: { v: 0, blank: true }, min: typed(15) });
    expect(feePriced(gone, "2026-11")).toBe(false);
    // nothing to take: the fee as it was
    const t = table();
    expect(clearCells(t, ["b"], "min")).toBe(t);
  });

  it("moves a part between fees only where the other fee's kind takes it", () => {
    const custody: Fee = { id: "c", kind: "custody", stages: [{ price: held(0.1) }] };
    const trade = table();
    expect(cellMovesTo(trade, "a", custody, null, "min")).toBe(true);
    const r = moveCellTo(trade, "a", custody, null, "min")!;
    expect((r.to as { stages: { price: Price }[] }).stages[0]!.price).toEqual({ ...held(0.1), min: typed(15) });
    expect((r.from as CasesFee).cases[0]!.stages[0]!.price).toEqual(action(0.1));
    // a share of each action has no place on what is held's fee as its price
    expect(cellMovesTo(trade, "a", custody, null, "price")).toBe(false);
    expect(cellMovesTo(trade, "a", trade, "b", "min")).toBe(false);
  });
});

describe("how a fee's cases stand", () => {
  it("moves a table's column on the page by rank, the order the reading reads kept", () => {
    const f: CasesFee = { id: "f", kind: "trade", by: [{ kind: "channel" }], cases: ["a", "b", "c"].map((id) => ({ id, when: [[id]], stages: [{ price: action(1) }] })) };
    const moved = moveCase(f, "c", 0) as CasesFee;
    expect(moved.cases.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(byRank(moved.cases).map((c) => c.id)).toEqual(["c", "a", "b"]);
    const l = laid(moved);
    expect(l.shape === "table" && l.columns.map((c) => c.case)).toEqual(["c", "a", "b"]);
  });

  it("moves a grid's row or column, every other value keeping its order", () => {
    const f = moveValue(fx(), 0, valueKey(["branch"]), 0) as CasesFee;
    expect(byRank(f.cases).map((c) => c.id)).toEqual(["b0", "b1", "b2", "d0", "d1", "d2"]);
    expect(f.cases.map((c) => c.id)).toEqual(fx().cases.map((c) => c.id));
    // a range's steps ascend: they never move
    expect(moveValue(fx(), 1, "0", 2)).toEqual(fx());
  });

  it("takes a grid's row or column away with its cases, never the last", () => {
    expect((removeValue(fx(), 0, valueKey(["branch"])) as CasesFee).cases.map((c) => c.id)).toEqual(["d0", "d1", "d2"]);
    const one = removeValue(fx(), 0, valueKey(["branch"]));
    expect(removeValue(one, 0, valueKey(["direct"]))).toBe(one);
  });

  it("takes a ladder's step into the step before it, the first into the one after, two steps into none", () => {
    const ladder: CasesFee = { id: "l", kind: "custody", by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100), typed(500)] }], cases: [0, 1, 2].map((w) => ({ id: `s${w}`, when: [w], stages: [{ price: held(w) }] })) };
    const mid = removeStep(ladder, 0, 1) as CasesFee;
    expect((mid.by[0] as { tops: { v: number }[] }).tops.map((n) => n.v)).toEqual([500]);
    expect(mid.cases.map((c) => [c.id, c.when[0]])).toEqual([["s0", 0], ["s2", 1]]);
    const first = removeStep(ladder, 0, 0) as CasesFee;
    expect((first.by[0] as { tops: { v: number }[] }).tops.map((n) => n.v)).toEqual([500]);
    expect(first.cases.map((c) => [c.id, c.when[0]])).toEqual([["s1", 0], ["s2", 1]]);
    const last = removeStep(ladder, 0, 2) as CasesFee;
    expect((last.by[0] as { tops: { v: number }[] }).tops.map((n) => n.v)).toEqual([100]);
    const none = removeStep(mid, 0, 0);
    expect(none.by).toBeUndefined();
    expect(none.stages).toEqual([{ price: held(2) }]);
  });

  it("duplicates a row right after it, named in the person's words", () => {
    const f = duplicateValue(fx(), 0, valueKey(["direct"]), "באינטרנט (עותק)") as CasesFee;
    expect(f.cases.map((c) => c.when[0])).toEqual([["direct"], ["באינטרנט (עותק)"], ["direct"], ["באינטרנט (עותק)"], ["direct"], ["באינטרנט (עותק)"], ["branch"], ["branch"], ["branch"]]);
    const l = laid(f);
    expect(l.shape === "grid" && l.rows.map((r) => r.key)).toEqual([valueKey(["direct"]), valueKey(["באינטרנט (עותק)"]), valueKey(["branch"])]);
  });

  it("swaps a grid's two things, its rows becoming its columns", () => {
    const f = swapThings(stretch(fx(), "d1", ["d2"], WHOLE, 1), 0, 1) as CasesFee;
    expect(f.by.map((b) => b.kind)).toEqual(["actionSize", "channel"]);
    expect(f.cases[0]!.when).toEqual([0, ["direct"]]);
    const l = laid(f);
    expect(l.shape === "grid" && l.rows.length).toBe(3);
  });

  it("splits one case by a thing, every other case holding for any value of it", () => {
    const f: CasesFee = { id: "f", kind: "trade", by: [{ kind: "what" }], cases: [
      { id: "ta", when: [["tase"]], stages: [{ price: action(0.1) }] },
      { id: "ab", when: [["us", "europe"]], stages: [{ price: action(0.2) }] },
    ] };
    const split = splitCase(f, "ab", { kind: "channel", values: ["direct", "branch"] }) as CasesFee;
    expect(split.cases.map((c) => c.when)).toEqual([[["tase"], "any"], [["us", "europe"], ["direct"]], [["us", "europe"], ["branch"]]]);
    expect(split.cases.map(rateOf)).toEqual([0.1, 0.2, 0.2]);
    const l = laid(split);
    expect(l.shape).toBe("table");
    expect(l.shape === "table" && l.columns.map((c) => c.sub ?? null)).toEqual([null, ["direct"], ["branch"]]);
    // read back from a link, the same
    const deal: FeeDeal = { id: "deal-x", name: "", kind: "brokerage-account", fees: [split] };
    const back = decodeDeal(encodeDeal(deal))!;
    expect((back.fees[0] as CasesFee).cases.map((c) => c.when)).toEqual(split.cases.map((c) => c.when));
  });
});

describe("what a deal keeps of these", () => {
  it("keeps a case's spans and the fees' ranks through a link and a read, the deal's own order kept", () => {
    const f = shrink(fx(), ["d2"], WHOLE, 1) as CasesFee;
    const deal: FeeDeal = { id: "deal-x", name: "", kind: "brokerage-account", fees: [f, { id: "fee-c", kind: "custody", stages: [{ price: held(0.1) }] }] };
    const ordered = orderFees(deal, ["fee-c", "fee-fx"]);
    expect(ordered.fees.map((x) => x.kind)).toEqual(["fx", "custody"]);
    expect(byRank(ordered.fees).map((x) => x.kind)).toEqual(["custody", "fx"]);
    const back = decodeDeal(encodeDeal(ordered))!;
    expect(back.fees.map((x) => [x.kind, x.rank])).toEqual([["fx", 1], ["custody", 0]]);
    expect((back.fees[0] as CasesFee).cases.find((c) => c.when[1] === 2 && (c.when[0] as string[])[0] === "direct")!.spans).toEqual([{ row: WHOLE, along: 1, span: expect.any(String) }]);
    expect(orderFees(deal, ["fee-c"])).toBe(deal);
  });

  it("leaves out a span it cannot read, and a span of a cell no table has, keeping the case", () => {
    const f = fx();
    const read = readDeal({ id: "deal-x", name: "", kind: "brokerage-account", fees: [{ ...f, cases: f.cases.map((c) => ({ ...c, spans: [{ row: "price", along: 7, span: "s1" }, { row: "nonsense", along: 0, span: "s2" }, { row: "*", along: 0, span: "s3" }] })) }] })!;
    expect((read.fees[0] as CasesFee).cases[0]!.spans).toEqual([{ row: "*", along: 0, span: "s3" }]);
  });

  it("keeps a deal whose grid was shrunk once a thing is taken away: the spans along it go, the later move down", () => {
    const shrunk = shrink(shrink(fx(), ["d2"], WHOLE, 1), ["b1"], WHOLE, 0) as CasesFee;
    const gone = removeBy(shrunk, 0) as CasesFee;
    expect(gone.cases.flatMap((c) => c.spans ?? []).every((x) => x.along === 0)).toBe(true);
    const deal: FeeDeal = { id: "deal-x", name: "", kind: "brokerage-account", fees: [gone] };
    expect(readDeal(JSON.parse(JSON.stringify(deal)))).toEqual(deal);
    expect((decodeDeal(encodeDeal(deal))!.fees[0] as CasesFee).cases.map((c) => c.spans)).toEqual(gone.cases.map((c) => c.spans));
    expect(removeStep(shrunk, 1, 1)).toBeTruthy();
  });

  it("reads the same case after a column is moved: the page's order is not the reading's", () => {
    const f: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "channel" }], cases: [
      { id: "a", when: ["any"], stages: [{ price: action(0.1) }] },
      { id: "b", when: [["branch"]], stages: [{ price: action(0.3) }] },
    ] };
    const deal: FeeDeal = { id: "deal-x", name: "", kind: "brokerage-account", fees: [f] };
    const moved: FeeDeal = { ...deal, fees: [moveCase(f, "a", 1)] };
    const caseRead = (d: FeeDeal) => readDealFor(d, data.kinds, "2026-11-14").fees.map((x) => x.read?.case);
    expect(caseRead(moved)).toEqual(caseRead(deal));
    expect(picksOf(moved)).toEqual(picksOf(deal));
  });
});

describe("sources on copies", () => {
  const src = { url: "https://example.org/list.pdf", title: "list", publisher: "p", strength: "institution" as const, checked: "2026-11-04" };
  const listed = (v: number) => ({ v, src });
  const sourced = (): CasesFee => ({ id: "fee-t", kind: "trade", by: [{ kind: "channel" }], cases: [
    { id: "a", when: [["direct"]], stages: [{ price: { form: "action", rate: listed(0.1), min: listed(15) } }] },
    { id: "b", when: [["branch"]], stages: [{ price: { form: "action", rate: listed(0.3), min: listed(15) } }] },
  ] });

  it("keeps a figure's source after a stretch only where the target held it so, else makes it the person's", () => {
    const f = stretch(sourced(), "a", ["b"], "price", 0) as CasesFee;
    expect(f.cases[1]!.stages[0]!.price).toEqual({ form: "action", rate: { v: 0.1 }, min: listed(15) });
    expect(untouched(f)).toBe(false);
  });

  it("makes a moved part the person's where the target did not hold it", () => {
    const t = sourced();
    const noMin: CasesFee = { ...t, cases: [t.cases[0]!, { ...t.cases[1]!, stages: [{ price: { form: "action", rate: listed(0.3) } }] }] };
    expect((moveCell(noMin, "a", "b", "min") as CasesFee).cases[1]!.stages[0]!.price).toEqual({ form: "action", rate: listed(0.3), min: { v: 15 } });
  });

  it("puts each duplicated case right after its original on the page", () => {
    const f = duplicateValue(fx(), 0, valueKey(["direct"]), "שלי") as CasesFee;
    const shown = byRank(f.cases).map((c) => (c.when[0] as string[])[0]);
    expect(shown).toEqual(["direct", "שלי", "direct", "שלי", "direct", "שלי", "branch", "branch", "branch"]);
  });

  it("puts back each case's own figure, its source with it, when an edit across them is undone by Esc", () => {
    const was = sourced();
    const edited = figureToAll(withFigureIn(was, "a", 20), "a", ["b"], 0, "min") as CasesFee;
    expect(figuresBack(edited, was, ["a", "b"], 0, "min")).toEqual(was);
  });

  it("makes a duplicated row's figures the person's", () => {
    const f = duplicateValue(sourced(), 0, valueKey(["direct"]), "שלי") as CasesFee;
    expect(f.cases[1]!.stages[0]!.price).toEqual({ form: "action", rate: { v: 0.1 }, min: { v: 15 } });
    expect(f.cases[0]!.stages[0]!.price).toEqual(sourced().cases[0]!.stages[0]!.price);
  });

  it("makes the joined step's figures the person's where the removed step priced them otherwise", () => {
    const ladder: CasesFee = { id: "l", kind: "custody", by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100), typed(500)] }], cases: [0, 1, 2].map((w) => ({ id: `s${w}`, when: [w], stages: [{ price: { form: "held", rate: listed(w === 2 ? 0.1 : 0.2), per: 12, every: 12 } }] })) };
    const kept = removeStep(ladder, 0, 1) as CasesFee;
    // the step before the removed one held the same listed rate: its source stays
    expect(kept.cases[0]!.stages[0]!.price).toMatchObject({ rate: listed(0.2) });
    const joined = removeStep(ladder, 0, 2) as CasesFee;
    expect(joined.cases.find((c) => c.id === "s1")!.stages[0]!.price).toMatchObject({ rate: { v: 0.2 } });
    expect((joined.cases.find((c) => c.id === "s1")!.stages[0]!.price as { rate: { src?: unknown } }).rate.src).toBeUndefined();
  });

  it("edits a figure said once for several cases in each case's own price, keeping their other parts", () => {
    const f = figureToAll(withFigureIn(sourced(), "a", 20), "a", ["b"], 0, "min") as CasesFee;
    expect(f.cases.map((c) => c.stages[0]!.price)).toEqual([
      { form: "action", rate: listed(0.1), min: { v: 20 } },
      { form: "action", rate: listed(0.3), min: { v: 20 } },
    ]);
  });
});

describe("one case split, every other reading kept", () => {
  it("places the copies after a case they would tie with, so another value still reads its own case", () => {
    const f: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "channel" }], cases: [
      { id: "A", when: ["any"], stages: [{ price: action(0.1) }] },
      { id: "B", when: [["branch"]], stages: [{ price: action(0.3) }] },
    ] };
    const split = splitCase(f, "A", { kind: "what", values: ["tase", "us"] }) as CasesFee;
    expect(split.cases.map((c) => c.id)[0]).toBe("B");
    const read = (fee: CasesFee, picks: { by: string; is: string }[]) => readDealFor({ id: "d", name: "", kind: "brokerage-account", fees: [fee], readFor: picks }, data.kinds, "2026-11-14").fees[0]?.read?.case;
    expect(read(split, [{ by: "channel", is: "branch" }, { by: "what", is: "tase" }])).toBe("B");
    expect(read(f, [{ by: "channel", is: "branch" }])).toBe("B");
  });

  it("keeps the split case's place on the page, and the deal read for the same start picks", () => {
    const f: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "what" }, { kind: "channel" }], cases: [
      { id: "A", when: [["tase"], "any"], stages: [{ price: action(0.1) }] },
      { id: "B", when: [["us"], ["branch"]], stages: [{ price: action(0.3) }] },
    ] };
    const split = splitCase(f, "A", { kind: "channel", values: ["direct", "branch"] }) as CasesFee;
    expect(byRank(split.cases).map((c) => c.id).at(-1)).toBe("B");
    const before: FeeDeal = { id: "d", name: "", kind: "brokerage-account", fees: [f] };
    expect(picksOf(before).find((p) => p.by === "channel")?.is).toBe("branch");
    const after = keepPicks(before, { ...before, fees: [split] });
    expect(after.readFor).toEqual([{ by: "channel", is: "branch" }]);
    const sorted = (d: FeeDeal) => picksOf(d).sort((a, b) => a.by.localeCompare(b.by));
    expect(sorted(after)).toEqual(sorted(before));
  });

  it("does not split by a range the fee changes by already: a step is added by its boundary", () => {
    const f: CasesFee = { id: "fee-l", kind: "custody", by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100)] }], cases: [{ id: "a", when: ["any"], stages: [{ price: held(0.1) }] }] };
    expect(splitCase(f, "a", { kind: "portfolioSize", unit: "ILS", top: 500 })).toBe(f);
  });
});

describe("a step taken away in a grid with places no case holds", () => {
  it("leaves no size without a case: the removed step's case moves onto the step it joins where that step has none", () => {
    const f: CasesFee = { id: "fee-g", kind: "fx", by: [{ kind: "channel" }, { kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }], cases: [
      { id: "d0", when: [["direct"], 0], stages: [{ price: { form: "free" } }] },
      { id: "d1", when: [["direct"], 1], stages: [{ price: action(0.1) }] },
      { id: "b1", when: [["branch"], 1], stages: [{ price: action(0.2) }] },
      { id: "b2", when: [["branch"], 2], stages: [{ price: action(0.3) }] },
    ] };
    const g = removeStep(f, 1, 1) as CasesFee;
    // direct: its first step reads its joined sizes; branch had no first step, so its removed step's case is its first step now
    expect(g.cases.map((c) => [c.id, c.when[1]])).toEqual([["d0", 0], ["b1", 0], ["b2", 1]]);
    const two: CasesFee = { ...f, by: [{ kind: "channel" }, { kind: "actionSize", unit: "USD", tops: [typed(10)] }], cases: [
      { id: "d0", when: [["direct"], 0], stages: [{ price: { form: "free" } }] },
      { id: "dA", when: [["direct"], "any"], stages: [{ price: action(0.5) }] },
      { id: "b1", when: [["branch"], 1], stages: [{ price: action(0.2) }] },
    ] };
    // two steps become none: each channel keeps its case on the other step, else its case on any size, else the removed step's
    expect((removeStep(two, 1, 1) as CasesFee).cases.map((c) => c.id)).toEqual(["d0", "b1"]);
    expect((removeStep(two, 1, 0) as CasesFee).cases.map((c) => c.id)).toEqual(["dA", "b1"]);
    // a case on any size reads the step a removed one joins, as where two steps become none: the removed step's case goes
    const anySize: CasesFee = { ...f, cases: [
      { id: "dA", when: [["direct"], "any"], stages: [{ price: action(0.5) }] },
      { id: "d1", when: [["direct"], 1], stages: [{ price: action(0.1) }] },
      { id: "d2", when: [["direct"], 2], stages: [{ price: action(0.2) }] },
    ] };
    expect((removeStep(anySize, 1, 1) as CasesFee).cases.map((c) => [c.id, c.when[1]])).toEqual([["dA", "any"], ["d2", 1]]);
  });
});

describe("a duplicated value's name", () => {
  it("is cut to what a name may be, and the deal reads back", () => {
    const long = "א".repeat(NAME_MAX + 20);
    const f = duplicateValue(fx(), 0, valueKey(["direct"]), long) as CasesFee;
    const named = f.cases.find((c) => (c.when[0] as string[])[0] !== "direct" && (c.when[0] as string[])[0] !== "branch")!;
    expect((named.when[0] as string[])[0]!.length).toBe(NAME_MAX);
    const deal: FeeDeal = { id: "deal-x", name: "", kind: "brokerage-account", fees: [f] };
    expect(readDeal(JSON.parse(JSON.stringify(deal)))).not.toBeNull();
    const held2: CasesFee = { id: "fee-h", kind: "custody", by: [{ kind: "held" }], cases: [{ id: "h", when: [["tase"]], stages: [{ price: held(0.1) }] }] };
    const own = duplicateValue(held2, 0, valueKey(["tase"]), long) as CasesFee;
    expect(readDeal(JSON.parse(JSON.stringify({ ...deal, fees: [own] })))).not.toBeNull();
  });
});
