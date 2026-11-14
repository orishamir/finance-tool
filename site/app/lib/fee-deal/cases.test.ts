// A fee whose price changes by things (method §10.6, F-114 to F-117): its cases as the device and a link keep them, the case the reading's
// picks give each fee, a size read across sizes, a price's new parts, the views the page renders, and the edits that make cases.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { actionCost, dealMarks } from "@finance-tool/engine";
import { feesData } from "../fees.server";
import { nisPerNumber } from "../fx";
import { builder, byQuestion, copiesWords, panel, slotEdit, thingMenu, toolbox } from "./builder";
import { picksOf, readFee, readFees } from "./cases";
import { addBy, addCase, canAddBy, copyCase, editPrice, removeBy, removeCase, removeTop, setMine, setPart, setStep, setTop, setWhen, withFigure } from "./edit";
import { glance } from "./glance";
import { decodeDeal, encodeDeal } from "./link";
import { newDeal, newFee, readDeal, typed, type CasesFee, type Fee, type FeeDeal, type Price, type SlimFee, type When } from "./model";
import { readDealFor, sumsLargest } from "./parts";
import { readingOf } from "./reading";
import { fillDeal } from "./templates";
import { removeByKept, removeCaseKept, undo, undoWords } from "./undo";
import { feeDeal as copy } from "../../copy";

const data = feesData();
const TODAY = "2026-11-12";
const read = (d: FeeDeal) => readDealFor(d, data.kinds, TODAY);
const src = { url: "https://www.example.org/list.pdf", title: "list", publisher: "house", strength: "institution" as const, checked: "2026-11-01" };

const usd = (p: Omit<Extract<Price, { form: "action" }>, "form" | "currency">): Price => ({ form: "action", ...p, currency: "USD" });

/** The trade fee of the picture: by what is bought and by track, the person's track marked, a third party's fee with no figure abroad. */
const trade = (): CasesFee => ({
  id: "fee-trade",
  kind: "trade",
  by: [{ kind: "what" }, { kind: "track" }],
  cases: [
    { id: "c1", when: [["tase"], "any"], stages: [{ price: { form: "action", rate: { v: 0.4, src }, min: { v: 10, src } } }] },
    { id: "c2", when: [["mutualFunds"], "any"], stages: [{ price: { form: "perAction", amount: typed(16) } }] },
    { id: "c3", when: [["us"], ["מסלול 1"]], mine: true, stages: [{ price: { form: "perUnit", amount: typed(0.03), min: typed(8), cap: typed(2), currency: "USD", notes: ["unfilled"] } }] },
    { id: "c4", when: [["us"], ["מסלול 2"]], stages: [{ price: usd({ rate: typed(0), min: typed(11), max: typed(11) }) }] },
    { id: "c5", when: [["europe", "world"], "any"], stages: [{ price: { ...usd({ rate: typed(0.4), min: typed(35) }), third: { who: "הברוקר" } } as Price }] },
  ],
});

/** Discount's conversion as the founder drew it: up to 10 $ free, up to 100 $ half price with the minimum, above it by channel. */
const fx = (): CasesFee => ({
  id: "fee-fx",
  kind: "fx",
  by: [{ kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }, { kind: "channel" }],
  cases: [
    { id: "x1", when: [0, "any"], stages: [{ price: { form: "free" } }] },
    { id: "x2", when: [1, "any"], stages: [{ price: { ...usd({ rate: typed(0.19), min: typed(6.8), max: typed(1075) }), discount: { pct: typed(50), alsoMin: true } } as Price }] },
    { id: "x3", when: [2, ["branch"]], stages: [{ price: usd({ rate: typed(0.19), min: typed(6.8), max: typed(1075) }) }] },
    { id: "x4", when: [2, ["direct"]], stages: [{ price: usd({ rate: typed(0.17), min: typed(6), max: typed(1055) }) }] },
  ],
});

const deal = (readFor?: FeeDeal["readFor"]): FeeDeal => ({
  id: "deal-c",
  name: "",
  kind: "brokerage-account",
  ...(readFor ? { readFor } : {}),
  fees: [
    trade(),
    fx(),
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.6), per: 3, every: 3, min: typed(120) } }] },
    { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(15), every: 1, offset: { kind: "trade" } } }] },
  ],
});

describe("cases as the device and a link keep them", () => {
  it("reads a deal with cases, parts and picks back as written, and a link carries it", () => {
    const d = deal([{ by: "what", is: "us" }, { by: "channel", is: "direct" }]);
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
    const back = decodeDeal(encodeDeal(d))!;
    const strip = (x: FeeDeal) => ({ ...x, id: "", fees: x.fees.map((f) => ({ ...f, id: "" })) });
    expect(strip(back)).toEqual(strip(d));
    expect(JSON.parse(Buffer.from(encodeDeal(d), "base64url").toString("utf8"))[0]).toBe(2);
  });
  it.each([
    ["a thing the fee cannot change by", (d: any) => (d.fees[2] = { id: "fee-custody", kind: "custody", by: [{ kind: "actionSize", unit: "ILS", tops: [{ v: 5 }] }], cases: [{ id: "a", when: [0], stages: [{ price: { form: "free" } }] }] })],
    ["a case with a value per thing missing", (d: any) => (d.fees[0].cases[0].when = [["tase"]])],
    ["a step past the range's last", (d: any) => (d.fees[1].cases[0].when = [3, "any"])],
    ["a value of what is bought the site does not know and the thing does not name", (d: any) => (d.fees[0].cases[0].when[0] = ["בורסת קנדה"])],
    ["the person's track on a fee with no track", (d: any) => (d.fees[1].cases[0].mine = true)],
    ["tops out of order", (d: any) => (d.fees[1].by[0].tops = [{ v: 100 }, { v: 10 }])],
    ["a blank top", (d: any) => (d.fees[1].by[0].tops[0] = { v: 0, blank: true })],
    ["prices beside cases", (d: any) => (d.fees[0].stages = [{ price: { form: "free" } }])],
    ["a fourth thing", (d: any) => d.fees[0].by.push({ kind: "channel" }, { kind: "count", unit: "actions", tops: [{ v: 3 }] })],
    ["what is bought and what is held on one fee", (d: any) => (d.fees[2] = { id: "fee-custody", kind: "custody", by: [{ kind: "held" }, { kind: "held" }], cases: [{ id: "a", when: ["any", "any"], stages: [{ price: { form: "free" } }] }] })],
    ["two cases with one id", (d: any) => (d.fees[0].cases[1].id = "c1")],
    ["a discount above a hundred percent", (d: any) => (d.fees[1].cases[1].stages[0].price.discount.pct.v = 120)],
    ["a third party's figure of no form", (d: any) => (d.fees[0].cases[4].stages[0].price.third.price = { form: "held", rate: { v: 1 } })],
    ["an offset against a fee no kind has", (d: any) => (d.fees[3].stages[0].price.offset = { kind: "bribe" })],
    ["a pick of no thing", (d: any) => (d.readFor = [{ by: "colour", is: "red" }])],
    ["a thing picked twice", (d: any) => (d.readFor = [{ by: "what", is: "us" }, { by: "what", is: "tase" }])],
  ])("refuses %s", (_, spoil) => {
    const d = JSON.parse(JSON.stringify(deal()));
    spoil(d);
    expect(readDeal(d)).toBeNull();
  });
  it("drops a part a price's form has no place for, as it drops any key it does not know", () => {
    const d = JSON.parse(JSON.stringify(deal()));
    d.fees[2].stages[0].price.notes = ["unfilled"];
    expect(readDeal(d)!.fees[2]!.stages![0]!.price).not.toHaveProperty("notes");
  });
  it("opens a deal saved before cases with every price as it was and what it held as the pick of what is bought", () => {
    const old = { id: "deal-o", name: "", kind: "brokerage-account", held: { place: "abroad", currency: "EUR", payout: "distributing" }, fees: [{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: { v: 0.1 } } }] }] };
    const d = readDeal(old)!;
    expect(d).toEqual({ id: "deal-o", name: "", kind: "brokerage-account", readFor: [{ by: "what", is: "europe", place: "abroad", currency: "EUR" }], fees: old.fees });
    expect(read(d).engine.foreign).toBe(true);
    // a link of the first version, which carried what was held, opens the same way
    const v1 = Buffer.from(JSON.stringify([1, { n: "", k: "brokerage-account", h: { l: "israel", c: "ILS", o: "accumulating" }, f: [{ k: "trade", s: [{ P: { F: "action", r: 0.25 } }] }] }, []])).toString("base64url");
    const opened = decodeDeal(v1)!;
    expect(opened.readFor).toEqual([{ by: "what", is: "tase", place: "israel", currency: "ILS" }]);
    expect(read(opened).engine.foreign).toBe(false);
  });
});

describe("F-114 the case each fee is read in", () => {
  it("starts on the person's own track and each thing's first case, and keeps the deal's own picks", () => {
    expect(picksOf(deal())).toEqual([
      { by: "what", is: "tase" },
      { by: "track", is: "מסלול 1" },
      { by: "channel", is: "branch" },
    ]);
    expect(picksOf(deal([{ by: "track", is: "מסלול 2" }]))[0]).toEqual({ by: "track", is: "מסלול 2" });
  });
  it("reads the most named case that holds the picks, and none where the list prints no price for them", () => {
    const picks = (what: string, track = "מסלול 1") => [{ by: "what", is: what }, { by: "track", is: track }];
    expect(readFee(trade(), picks("us"))![0]!.read).toEqual({ of: "fee-trade", case: "c3" });
    expect(readFee(trade(), picks("us", "מסלול 2"))![0]!.read?.case).toBe("c4");
    expect(readFee(trade(), picks("world"))![0]!.read?.case).toBe("c5");
    expect(readFee(trade(), picks("makam"))).toBeNull();
    const r = read(deal([{ by: "what", is: "makam" }]));
    expect(r.unmatched).toEqual(["fee-trade"]);
    expect(glance(r).unmatched.map((f) => f.fee)).toEqual(["fee-trade"]);
    expect(readingOf(r, data.fx).unmatched.map((f) => f.fee)).toEqual(["fee-trade"]);
    expect(builder(r).rows[0]).toMatchObject({ fee: "fee-trade", priced: false, unmatched: true });
  });
  it("puts a conversion on a purchase where what is bought is foreign, by the pick (F-111)", () => {
    expect(read(deal([{ by: "what", is: "us" }])).engine.foreign).toBe(true);
    expect(read(deal([{ by: "what", is: "tase" }])).engine.foreign).toBe(false);
  });
});

describe("F-115 a size read across sizes", () => {
  const r = read(deal([{ by: "what", is: "us" }, { by: "channel", is: "branch" }]));
  const steps = r.fees.filter((f) => f.read?.of === "fee-fx");
  it("reads each stretch of steps in one case as a fee of its own, charged on its stretch", () => {
    expect(steps.map((f) => [f.id, f.read?.case, f.read?.step?.from?.v ?? null, f.read?.step?.to?.v ?? null])).toEqual([
      ["fee-fx-s0", "x1", null, 10],
      ["fee-fx-s1", "x2", 10, 100],
      ["fee-fx-s2", "x3", 100, null],
    ]);
    // a step where every case is the same is the fee itself
    const flat = readFee({ ...fx(), cases: [{ id: "only", when: ["any", "any"] as When[], stages: [{ price: { form: "free" as const } }] }] }, [])!;
    expect(flat.map((f) => [f.id, f.read?.step])).toEqual([["fee-fx", undefined]]);
  });
  it("prices an action by the step that holds it, the discount off the rate and the minimum (F-116)", () => {
    const rates = { USD: 3.5 };
    const p = r.reading.periods[0]!;
    // what is bought abroad puts the conversion on the purchase (F-111); the trade's sum per unit needs a unit's price, 100 ₪ here
    const fxCost = (a: number) => actionCost(r.engine, p, "trade", a, "buy", rates, 100).parts.filter((x) => r.fees[x.fee]!.read?.of === "fee-fx").reduce((s, x) => s + x.cost, 0);
    expect(fxCost(35)).toBe(0);
    expect(fxCost(175)).toBeCloseTo(3.4 * 3.5, 9);
    expect(fxCost(3500)).toBeCloseTo(6.8 * 3.5, 9);
    const marks = dealMarks(r.engine, p).filter((m) => m.kind === "edge");
    expect(marks.map((m) => m.amount)).toEqual([10, 100]);
  });
  it("states each step's top as a mark with the range's own figure, and the curve reads it and just above it", () => {
    const reading = readingOf(r, data.fx, 50);
    const edges = reading.statements.flatMap((s) => (s.kind === "mark" && s.mark.kind === "edge" ? [s.mark] : []));
    expect(edges.map((m) => [m.amount.value, m.amount.state, m.fee.step?.to?.value])).toEqual([
      [10, "entered", 10],
      [100, "entered", 100],
    ]);
    const curve = reading.curves.find((c) => c.marks.some((m) => m.kind === "edge"));
    expect(curve).toBeDefined();
    const at = curve!.at[curve!.marks.findIndex((m) => m.kind === "edge" && m.amount.value === 100)]!;
    const k = curve!.amounts.indexOf(at);
    expect(curve!.amounts[k + 1]! / at).toBeCloseTo(1, 6);
    expect(curve!.total[k + 1]!).toBeGreaterThan(curve!.total[k]!);
  });
});

describe("a price's parts", () => {
  it("adds a third party's share to the group's rate, and a discounted share with its own formula", () => {
    const share = (price: Price) => glance(read({ ...deal(), fees: [{ id: "fee-t", kind: "trade", stages: [{ price }] }] })).throughout[0]!.rates[0]!.rate;
    expect(share({ form: "action", rate: typed(0.1), third: { price: { form: "action", rate: typed(0.05) } } })).toMatchObject({ value: 0.15, computed_from: { formula: "F-117" } });
    expect(share({ form: "action", rate: typed(0.2), discount: { pct: typed(25) } })).toMatchObject({ computed_from: { formula: "F-116" } });
    expect(share({ form: "action", rate: typed(0.2), discount: { pct: typed(25) } }).value).toBeCloseTo(0.15, 12);
  });
  it("states what it does not compute (§10.6's stated parts): a third party's fee with no figure, an offset, a note on an order", () => {
    const stated = (picks: FeeDeal["readFor"]) => readingOf(read(deal(picks)), data.fx).stated.map((s) => [s.fee.fee, s.part]);
    expect(stated([{ by: "what", is: "us" }])).toEqual([
      ["fee-trade", "unfilled"],
      ["fee-fixed", "offset"],
    ]);
    expect(stated([{ by: "what", is: "world" }])).toContainEqual(["fee-trade", "third"]);
    const offset = readingOf(read(deal()), data.fx).stated.find((s) => s.part === "offset")!;
    expect(offset.words.lead).toContain(copy.cases.stated.offset.lead);
  });
  it("leaves a fee with a part not given yet out of the reading until it is", () => {
    const blank = setPart(trade(), "discount", true, { caseId: "c1" });
    const r = read({ ...deal([{ by: "what", is: "tase" }]), fees: [blank] });
    expect(r.unpriced).toEqual(["fee-trade"]);
    const typedIn = editPrice(blank, "buy", 0, (p) => withFigure(p, "discount", 10), "c1");
    expect(read({ ...deal([{ by: "what", is: "tase" }]), fees: [typedIn] }).fees).toHaveLength(1);
  });
});

describe("the reading's first line", () => {
  it("has a pill per thing the reading picks, none for the size of the action, its values in order, the pick chosen", () => {
    const line = readingOf(read(deal([{ by: "what", is: "us" }])), data.fx).picks!;
    expect(line.title).toBe(copy.cases.readFor);
    expect(line.things.map((t) => [t.by, t.chosen])).toEqual([
      ["what", "us"],
      ["track", "מסלול 1"],
      ["channel", "branch"],
    ]);
    expect(line.things[0]!.options.map((o) => o.is)).toEqual(["tase", "mutualFunds", "us", "europe", "world"]);
    expect(line.things[0]!.options[2]!.words.text).toBe(copy.cases.values.what.us);
    expect(readingOf(read({ ...deal(), fees: [newFee("trade")] }), data.fx).picks).toBeNull();
  });
});

describe("the builder's blocks", () => {
  const r = read(deal([{ by: "what", is: "us" }]));
  const b = builder(r, [], { fee: "fee-trade", case: "c3" });
  it("shows a fee with cases as its band, the other tracks folded, the open case marked", () => {
    const block = b.rows[0]!.block;
    if (block.kind !== "band") throw new Error("a band");
    expect(block.things.map((t) => [t.kind, t.words, t.picked])).toEqual([
      ["what", copy.cases.things.what, true],
      ["track", copy.cases.things.track, true],
    ]);
    expect(block.rows.map((x) => [x.case, x.mine, x.open])).toEqual([
      ["c1", false, false],
      ["c2", false, false],
      ["c3", true, true],
      ["c5", false, false],
    ]);
    expect(block.rows[0]!.when).toEqual([
      { thing: 0, any: false, text: copy.cases.values.what.tase },
      { thing: 1, any: true, text: copy.cases.any.track },
    ]);
    expect(block.folded).toMatchObject({ tracks: 1, words: copy.cases.folded.one });
    expect(block.folded!.rows.map((x) => x.case)).toEqual(["c4"]);
    // parts by kind, with their words
    expect(block.rows[2]!.parts.map((p) => [p.id, p.kind])).toEqual([
      ["perUnit", "price"],
      ["min", "bound"],
      ["cap", "bound"],
      ["unfilled", "note"],
    ]);
    expect(block.rows[3]!.parts.find((p) => p.id === "third")!.words).toEqual({ lead: `${copy.cases.parts.thirdOf}הברוקר`, quiet: ` ${copy.cases.parts.thirdNone}` });
    // a fee read across sizes names its range's steps in its rows
    const fxBlock = b.rows[1]!.block;
    expect(fxBlock.kind === "band" && fxBlock.rows.map((x) => [x.when[0]!.lead, x.when[0]!.figure?.value])).toEqual([
      [copy.cases.upTo, 10],
      [copy.cases.upTo, 100],
      [copy.cases.over, 100],
      [copy.cases.over, 100],
    ]);
    expect(b.rows[2]!.block).toMatchObject({ kind: "slim", open: false });
    expect(b.rows[3]!.block.kind === "slim" && b.rows[3]!.block.parts.map((p) => p.id)).toEqual(["sum", "offset"]);
  });
  it("shows a card's one price, and edits it, in the first case where none is named", () => {
    expect(b.rows[0]!.stages[0]!.price).toMatchObject({ form: "action", figures: { rate: { value: 0.4 } } });
    expect(b.rows[0]!.priced).toBe(true);
    expect(panel(r, "fee-trade")!.open!.case).toBe("c1");
    expect(toolbox(r, "fee-trade")!.addTo.when![0]!.text).toBe(copy.cases.values.what.tase);
    const edited = editPrice(trade(), "buy", 0, (p) => withFigure(p, "rate", 0.5));
    expect(edited.cases[0]!.stages[0]!.price).toMatchObject({ rate: { v: 0.5 } });
  });
  it("opens the chosen case in the panel, its slots and its parts with the figures each edits", () => {
    const p = panel(r, "fee-trade", "c3")!;
    expect(p.open!.case).toBe("c3");
    expect(p.open!.slots.map((s) => [s.kind, s.words.text, s.mine])).toEqual([
      ["what", copy.cases.values.what.us, undefined],
      ["track", "מסלול 1", true],
    ]);
    expect(p.open!.buy[0]!.parts.map((x) => [x.id, x.fields.map((f) => f.figure), x.removable])).toEqual([
      ["perUnit", ["amount"], false],
      ["min", ["min"], true],
      ["cap", ["cap"], true],
      ["unfilled", [], true],
    ]);
    expect(p.open).toMatchObject({ canCopy: true, canRemove: true });
  });
  it("gives the toolbox's groups in order for the open case, with the parts it has marked", () => {
    const t = toolbox(r, "fee-trade", "c3")!;
    expect(t.groups.map((g) => g.group)).toEqual(["price", "bound", "by", "link", "more"]);
    const used = t.groups.flatMap((g) => g.parts.filter((x) => x.used).map((x) => x.id));
    expect(used).toEqual(["perUnit", "min", "cap", "by:what", "by:track", "unfilled"]);
    expect(t.addTo.when!.map((w) => w.text)).toEqual([copy.cases.values.what.us, "מסלול 1"]);
    // a conversion's words follow it
    const conv = toolbox(r, "fee-fx", "x2")!;
    expect(conv.groups[0]!.parts[0]!.words.tail).toBe(` ${copy.price.perAction.fx}`);
    expect(conv.groups.find((g) => g.group === "by")!.parts[0]!.id).toBe("by:currency");
    // a fee with three things takes no fourth, and says why
    const three = addBy(trade(), { kind: "channel", values: ["branch"] });
    const full = toolbox(read({ ...deal(), fees: [three] }), "fee-trade")!;
    expect(full.groups.find((g) => g.group === "by")!.parts.find((x) => x.id === "by:volume")).toMatchObject({ used: false, off: copy.cases.full });
  });
  it("asks once for a thing's values, and says what the copies come to", () => {
    expect(byQuestion(trade(), "channel")).toMatchObject({ ask: copy.cases.ask.channel, values: [{ id: "branch" }, { id: "phone" }, { id: "direct" }] });
    expect(byQuestion(trade(), "actionSize").units!.map((u) => u.unit)).toEqual(["ILS", "USD", "EUR", "GBP"]);
    expect(copiesWords(trade(), "channel", 2)).toMatchObject({ from: 5, to: 10, count: copy.cases.copies.count });
    expect(copiesWords(newFee("custody"), "held", 2)).toMatchObject({ from: 1, to: 2, count: null });
  });
  it("opens a case's slot with its choices", () => {
    expect(slotEdit(r, "fee-trade", "c5", 0)).toMatchObject({ kind: "list", options: expect.arrayContaining([{ id: "world", words: copy.cases.values.what.world, ticked: true }]) });
    expect(slotEdit(r, "fee-trade", "c3", 1)).toMatchObject({ kind: "track", name: "מסלול 1", mine: true });
    expect(slotEdit(r, "fee-fx", "x3", 0)).toMatchObject({ kind: "range", upTo: null, unit: "USD", before: { lead: copy.cases.upTo, figure: { value: 100 } } });
  });
});

describe("the edits that make cases", () => {
  it("adds a thing: each case copied to each value with its prices, a range to its two steps, a fee with none gaining cases", () => {
    const custody = newFee("custody");
    const held = addBy(editPrice(custody, "buy", 0, (p) => withFigure(p, "rate", 0.2)), { kind: "held", values: ["tase", "us"] }) as CasesFee;
    expect(held.by).toEqual([{ kind: "held" }]);
    expect(held.cases.map((c) => [c.when, c.stages[0]!.price])).toEqual([
      [[["tase"]], { form: "held", rate: { v: 0.2 }, per: 12, every: 12 }],
      [[["us"]], { form: "held", rate: { v: 0.2 }, per: 12, every: 12 }],
    ]);
    const doubled = addBy(trade(), { kind: "channel", values: ["branch", "direct"] }) as CasesFee;
    expect(doubled.cases).toHaveLength(10);
    expect(doubled.cases.filter((c) => c.mine).map((c) => c.when)).toEqual([
      [["us"], ["מסלול 1"], ["branch"]],
      [["us"], ["מסלול 1"], ["direct"]],
    ]);
    expect(new Set(doubled.cases.map((c) => c.id)).size).toBe(10);
    const sized = addBy(trade(), { kind: "actionSize", unit: "USD", top: 500 }) as CasesFee;
    expect(sized.cases.map((c) => c.when[2])).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    expect(canAddBy(trade(), "what")).toBe(false);
    expect(canAddBy(doubled, "volume")).toBe(false);
    expect(addBy(trade(), { kind: "channel", values: [] })).toEqual(trade());
    expect(readDeal(JSON.parse(JSON.stringify({ ...deal(), fees: [doubled, { ...sized, id: "fee-sized" }] })))).not.toBeNull();
  });
  it("takes a thing away, the cases that differ only in it one; the last thing leaves a fee priced as its first case", () => {
    const noTrack = removeBy(trade(), 1) as CasesFee;
    expect(noTrack.cases.map((c) => [c.id, c.when])).toEqual([
      ["c1", [["tase"]]],
      ["c2", [["mutualFunds"]]],
      ["c3", [["us"]]],
      ["c5", [["europe", "world"]]],
    ]);
    expect(noTrack.cases.some((c) => c.mine)).toBe(false);
    const slim = removeBy(noTrack, 0) as SlimFee;
    expect(slim).toEqual({ id: "fee-trade", kind: "trade", stages: trade().cases[0]!.stages });
  });
  it("adds, copies, moves and removes cases, never the last", () => {
    const added = addCase(trade()) as CasesFee;
    expect(added.cases.at(-1)).toMatchObject({ when: [["europe", "world"], "any"], stages: trade().cases[4]!.stages });
    expect(added.cases.at(-1)!.id).not.toBe("c5");
    const copied = copyCase(trade(), "c3") as CasesFee;
    expect(copied.cases[3]).toMatchObject({ when: [["us"], ["מסלול 1"]] });
    expect(copied.cases[3]!.mine).toBeUndefined();
    expect((removeCase(trade(), "c2") as CasesFee).cases.map((c) => c.id)).toEqual(["c1", "c3", "c4", "c5"]);
    const one: Fee = { ...trade(), cases: [trade().cases[0]!] };
    expect(removeCase(one, "c1")).toBe(one);
  });
  it("sets a case's value, several at once, and refuses one the thing does not know", () => {
    expect((setWhen(trade(), "c1", 0, ["tase", "makam"]) as CasesFee).cases[0]!.when[0]).toEqual(["tase", "makam"]);
    expect((setWhen(trade(), "c1", 0, "any") as CasesFee).cases[0]!.when[0]).toBe("any");
    expect(setWhen(trade(), "c1", 0, ["בורסת קנדה"])).toEqual(trade());
    expect(setWhen(fx(), "x1", 0, 5)).toEqual(fx());
  });
  it("marks one track as the person's, on every case of it", () => {
    const two = setMine(copyCase(trade(), "c4"), "c4", true) as CasesFee;
    expect(two.cases.filter((c) => c.mine).map((c) => (c.when[1] as string[])[0])).toEqual(["מסלול 2", "מסלול 2"]);
    expect((setMine(trade(), "c3", false) as CasesFee).cases.some((c) => c.mine)).toBe(false);
  });
  it("splits a step at a new top, every case on it copied to both halves, so no size is left without a case", () => {
    const split = setStep(fx(), "x2", 0, 50) as CasesFee;
    expect((split.by[0] as { tops: { v: number }[] }).tops.map((n) => n.v)).toEqual([10, 50, 100]);
    expect(split.cases.map((c) => [c.id.startsWith("x") ? c.id : "copy", c.when[0]])).toEqual([
      ["x1", 0],
      ["x2", 1],
      ["copy", 2],
      ["x3", 3],
      ["x4", 3],
    ]);
    // the upper half's copy is a case of its own: the reading reads it as a stretch of its own
    expect(readFee(split, [{ by: "channel", is: "branch" }])!.map((f) => f.read?.step?.to?.v ?? null)).toEqual([10, 50, 100, null]);
    expect((setStep(fx(), "x4", 0, null) as CasesFee).cases[3]!.when[0]).toBe(2);
    expect((setTop(fx(), 0, 1, 200) as CasesFee).by[0]).toMatchObject({ tops: [{ v: 10 }, { v: 200 }] });
    expect(setTop(fx(), 0, 1, 5)).toEqual(fx());
    const merged = removeTop(fx(), 0, 0) as CasesFee;
    expect(merged.cases.map((c) => [c.id, c.when[0]])).toEqual([
      ["x1", 0],
      ["x3", 1],
      ["x4", 1],
    ]);
  });
  it("adds and takes away a case's parts, as the toolbox does, in that case alone", () => {
    const withMin = setPart(trade(), "min", true, { caseId: "c2" });
    expect(withMin).toEqual(trade());
    const disc = setPart(trade(), "discount", true, { caseId: "c1" }) as CasesFee;
    expect(disc.cases[0]!.stages[0]!.price).toMatchObject({ discount: { pct: { v: 0, blank: true } } });
    expect(disc.cases[1]).toEqual(trade().cases[1]);
    expect(setPart(disc, "discount", false, { caseId: "c1" })).toEqual(trade());
    expect((setPart(trade(), "cap", true, { caseId: "c1", value: 30 }) as CasesFee).cases[0]!.stages[0]!.price).toMatchObject({ cap: { v: 30 } });
    expect(setPart(trade(), "offset", true, { caseId: "c1" })).toEqual(trade());
    expect((setPart(trade(), "sale", true, { caseId: "c3" }) as CasesFee).cases[2]!.sale).toEqual(trade().cases[2]!.stages);
    expect((setPart(trade(), "until", true, { caseId: "c1", month: "2027-06" }) as CasesFee).cases[0]!.stages.map((s) => s.until)).toEqual(["2027-06", undefined]);
    expect((setPart(trade(), "share", true, { caseId: "c2" }) as CasesFee).cases[1]!.stages[0]!.price).toEqual({ form: "action", rate: { v: 0, blank: true } });
  });
  it("keeps a case or a thing taken away for the undo", () => {
    const d = deal();
    const gone = removeCaseKept(d, "fee-trade", "c2", null)!;
    expect((gone.deal.fees[0] as CasesFee).cases).toHaveLength(4);
    expect(undo(gone.deal, gone.undo, null)!.deal).toEqual(d);
    const merged = removeByKept(d, "fee-trade", 1, null)!;
    expect(merged.undo.what).toEqual({ kind: "by", feeId: "fee-trade", t: 1 });
    expect(undo(merged.deal, merged.undo, null)!.deal).toEqual(d);
  });
});

describe("every house's whole price list", () => {
  it("fills a deal that reads for every pick of what is bought, and every case's figure keeps its source", () => {
    for (const h of data.houses) {
      for (const f of h.fees) for (const c of f.cases ?? []) for (const s of c.stages) if (s.price.form === "action") expect(s.price.rate.src, h.id).toBeDefined();
      for (const is of ["tase", "mutualFunds", "makam", "us", "europe", "world"]) {
        const d = { ...deal(), fees: [], readFor: [{ by: "what", is }] } as FeeDeal;
        const filled = { ...d, fees: h.fees.map((f, k) => ({ ...structuredClone(f), id: `fee-${k}` }) as Fee) };
        const r = readFees(filled);
        expect(r.fees.length + r.unmatched.length, `${h.id} ${is}`).toBeGreaterThanOrEqual(h.fees.length);
      }
    }
  });
});

describe("the conversion's currency is what is bought's (F-114)", () => {
  const psagot = (picks: FeeDeal["readFor"]) => read({ ...fillDeal(newDeal("brokerage-account"), "house:psagot", data, TODAY)!, readFor: picks });
  const fxOf = (r: ReturnType<typeof read>) => r.fees.find((f) => f.kind === "fx");
  const fxId = (r: ReturnType<typeof read>) => r.deal.fees.find((f) => f.kind === "fx")!.id;
  it("reads a holding in euros in the euro's case, and one in dollars in none where the list prices dollars per dollar", () => {
    const eur = psagot([{ by: "what", is: "europe" }]);
    expect(eur.picks).toContainEqual({ by: "currency", is: "EUR" });
    expect(fxOf(eur)!.stages[0]!.price).toMatchObject({ form: "action", rate: { v: 0.5 } });
    // never the price of another currency: the dollar's line is per dollar, which fills nothing
    const usd = psagot([{ by: "what", is: "us" }]);
    expect(usd.picks).toContainEqual({ by: "currency", is: "USD" });
    expect(fxOf(usd)).toBeUndefined();
    expect(usd.unmatched).toContain(fxId(usd));
  });
  it("picks no currency for a holding in shekels, nor the deal's own pick of one", () => {
    const tase = psagot([{ by: "what", is: "tase" }, { by: "currency", is: "other" }]);
    expect(tase.picks.some((p) => p.by === "currency")).toBe(false);
    expect(tase.unmatched).toContain(fxId(tase));
    expect(psagot([{ by: "what", is: "us" }, { by: "currency", is: "other" }]).picks.filter((p) => p.by === "currency")).toEqual([{ by: "currency", is: "USD" }]);
    expect(readingOf(tase, data.fx).picks!.things.map((t) => t.by)).not.toContain("currency");
  });
  it("reads a value of the person's own in a currency the site does not name as another currency", () => {
    const conversion: CasesFee = {
      id: "fee-fx",
      kind: "fx",
      by: [{ kind: "currency" }],
      cases: [
        { id: "u", when: [["USD"]], stages: [{ price: { form: "action", rate: typed(0.1) } }] },
        { id: "o", when: [["other"]], stages: [{ price: { form: "action", rate: typed(0.3) } }] },
      ],
    };
    const tokyo: CasesFee = { id: "fee-t", kind: "trade", by: [{ kind: "what", own: [{ name: "טוקיו", place: "abroad", currency: "JPY" }] }], cases: [{ id: "t", when: [["טוקיו"]], stages: [{ price: { form: "action", rate: typed(0.2) } }] }] };
    const r = read({ ...deal(), fees: [tokyo, conversion] });
    expect(r.picks).toEqual([{ by: "what", is: "טוקיו" }, { by: "currency", is: "other" }]);
    expect(r.fees.find((f) => f.kind === "fx")!.read?.case).toBe("o");
  });
});

describe("a deal saved before cases", () => {
  const old = (place: string, currency: string) => readDeal({ id: "deal-o", name: "", kind: "brokerage-account", held: { place, currency, payout: "accumulating" }, fees: [{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: { v: 0.1 } } }] }] })!;
  it("keeps the place and the currency it held, so a conversion goes on a purchase as before (F-111)", () => {
    expect(read(old("israel", "USD")).engine.foreign).toBe(true);
    expect(read(old("abroad", "ILS")).engine.foreign).toBe(false);
    expect(read(old("abroad", "USD")).engine.foreign).toBe(true);
    expect(read(old("israel", "ILS")).engine.foreign).toBe(false);
  });
  it("carries them in a link, and refuses them on a pick of anything but what is bought", () => {
    const d = old("israel", "USD");
    expect(decodeDeal(encodeDeal(d))!.readFor).toEqual([{ by: "what", is: "tase", place: "israel", currency: "USD" }]);
    expect(readDeal({ ...JSON.parse(JSON.stringify(d)), readFor: [{ by: "channel", is: "direct", place: "israel", currency: "USD" }] })).toBeNull();
    expect(readDeal({ ...JSON.parse(JSON.stringify(d)), readFor: [{ by: "what", is: "tase", place: "israel" }] })).toBeNull();
  });
});

describe("a third party's fee on the curve (F-117)", () => {
  const withThird = (third: Extract<Price, { form: "action" }>["third"]) => read({ ...deal([{ by: "what", is: "tase" }]), fees: [{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(10), third } }] }] });
  it("asks for the unit's price for a sum per unit, and draws the curve with it at the rate of its currency", () => {
    const r = withThird({ price: { form: "perUnit", amount: typed(0.01), currency: "USD" } });
    const without = readingOf(r, data.fx);
    expect(without.unitPrice).toMatchObject({ currency: "ILS", value: null });
    expect(without.undrawn).toContainEqual(expect.objectContaining({ action: "trade", why: "unit-price" }));
    const drawn = readingOf(r, data.fx, 100).curves.find((c) => c.action === "trade")!;
    expect(drawn.rates.map((x) => x.currency)).toEqual(["USD"]);
    // 1,000 ₪ of units at 100 ₪ is 10 units: 1 ₪ of the fee's own minimum and 10 × 0.01 $
    const usd = nisPerNumber(data.fx!, "USD")!;
    expect(actionCost(r.engine, r.reading.periods[0]!, "trade", 1000, "buy", { USD: usd }, 100).total).toBeCloseTo(10 + 0.1 * usd, 9);
  });
  it("converts a bound in another currency at its rate", () => {
    const drawn = readingOf(withThird({ price: { form: "action", rate: typed(0.05), min: typed(2), currency: "EUR" } }), data.fx).curves.find((c) => c.action === "trade")!;
    expect(drawn.rates.map((x) => x.currency)).toEqual(["EUR"]);
  });
});

describe("the largest cost of holding with a step of the value held in another currency (F-112, F-115)", () => {
  it("prices the step at the curve's rate", () => {
    const manager: CasesFee = {
      id: "fee-m",
      kind: "fund_management",
      by: [{ kind: "portfolioSize", unit: "USD", tops: [typed(10_000)] }],
      cases: [
        { id: "a", when: [0], stages: [{ price: { form: "held", rate: typed(0.2), per: 12, every: 12 } }] },
        { id: "b", when: [1], stages: [{ price: { form: "held", rate: typed(0.01), per: 12, every: 12 } }] },
      ],
    };
    const r = read({
      ...deal(),
      fees: [
        { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(15), every: 1 } }] },
        { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] },
        manager,
      ],
    });
    const p = r.reading.periods[0]!;
    const meet = dealMarks(r.engine, p).find((m) => m.kind === "meet")!;
    expect(meet.amount).toBeCloseTo(180_000, 6);
    expect(() => sumsLargest(r.engine, p, meet)).toThrow(RangeError);
    // at 180,000 ₪ the manager's fee is on the upper step, 0.01%: 18 ₪, under the 180 ₪ of sums
    expect(sumsLargest(r.engine, p, meet, { USD: 3.5 })).toBe(true);
    const stated = readingOf(r, data.fx).statements.find((s) => s.kind === "mark" && s.mark.kind === "meet");
    expect(stated?.kind === "mark" && stated.mark.kind === "meet" && stated.mark.largest).toBe(true);
  });
});

describe("the cap's mark beside a discount off the minimum (F-112, F-116)", () => {
  it("meets the minimum the discount leaves", () => {
    // 0.3%, at least 25 $ and at most 6,750 $, at most 25% of the action, half off with the minimum: the cap meets 12.5 $ at 50 $
    const price: Price = { form: "action", rate: typed(0.3), min: typed(25), max: typed(6750), cap: typed(25), currency: "USD", discount: { pct: typed(50), alsoMin: true } };
    const r = read({ ...deal([{ by: "what", is: "us" }]), fees: [{ id: "fee-t", kind: "trade", stages: [{ price }] }] });
    const cap = readingOf(r, data.fx).statements.flatMap((s) => (s.kind === "mark" && s.mark.kind === "cap" ? [s.mark] : []))[0]!;
    expect(cap.amount.value).toBeCloseTo(50, 9);
    expect(cap.meets.value).toBe(25);
    expect(Object.values(cap.amount.computed_from!.inputs).map((x) => (x as { value: unknown }).value)).toEqual(expect.arrayContaining([25, 25, 50]));
  });
});

describe("what a size is read across by, by the price's form (F-115)", () => {
  const byPortfolio = (kind: "own" | "trade", price: Price): CasesFee => ({
    id: "fee-p",
    kind,
    ...(kind === "own" ? { name: "דמי ניהול תיק" } : {}),
    by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100_000)] }],
    cases: [
      { id: "a", when: [0], stages: [{ price }] },
      { id: "b", when: [1], stages: [{ price: { form: "free" } }] },
    ],
  });
  it("reads a fee of the person's own priced as a share of what is held across the portfolio's sizes, on what is held", () => {
    const held = byPortfolio("own", { form: "held", rate: typed(0.5), per: 12, every: 12 });
    expect(picksOf({ fees: [held] })).toEqual([]);
    expect(readFee(held, [])!.map((f) => f.read?.step?.on)).toEqual(["held", "held"]);
  });
  it("picks the portfolio's size for a fee priced on an action", () => {
    const onAction = byPortfolio("own", { form: "action", rate: typed(0.1) });
    expect(picksOf({ fees: [onAction] })).toEqual([{ by: "portfolioSize", is: "<=100000" }]);
    expect(picksOf({ fees: [byPortfolio("trade", { form: "action", rate: typed(0.1) })] })).toEqual([{ by: "portfolioSize", is: "<=100000" }]);
  });
});

describe("the formulas the fee page's code cites", () => {
  it("are each numbered in the method", () => {
    const method = readFileSync(resolve(__dirname, "../../../../docs/method.md"), "utf8");
    const dir = resolve(__dirname);
    const sources = [...readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).map((f) => resolve(dir, f)), resolve(__dirname, "../../copy.ts")];
    const cited = new Set(sources.flatMap((f) => readFileSync(f, "utf8").match(/F-\d{2,3}/g) ?? []));
    expect([...cited].filter((id) => !method.includes(`**${id} `))).toEqual([]);
  });
});

describe("a case's standing against the cap, beside it in the builder (F-113)", () => {
  // a provident fund's deposit fee by channel: the branch's case read, the internet's not, each judged at its own price
  const byChannel = (): FeeDeal => ({
    id: "deal-p",
    name: "",
    kind: "kupat-gemel-lehashkaa",
    readFor: [{ by: "channel", is: "branch" }],
    fees: [
      {
        id: "fee-deposit",
        kind: "deposit",
        by: [{ kind: "channel" }],
        cases: [
          { id: "d1", when: [["branch"]], stages: [{ price: { form: "action", rate: typed(1) } }] },
          { id: "d2", when: [["direct"]], stages: [{ price: { form: "action", rate: typed(2), discount: { pct: typed(50) } } }] },
          { id: "d3", when: ["any"], stages: [{ price: { form: "action", rate: typed(9) } }] },
        ],
      },
    ],
  });
  const rows = () => {
    const block = builder(read(byChannel())).rows[0]!.block;
    if (block.kind !== "band") throw new Error("a band");
    return block.rows;
  };
  it("judges each case at its own price, the one the reading reads and the ones it does not", () => {
    const [d1, , d3] = rows();
    expect(d1!.standing.standing).toMatchObject({ judged: true, standing: "below" });
    expect(d1!.standing.share?.value).toBeCloseTo(25, 10);
    expect(d3!.standing.standing).toMatchObject({ judged: true, standing: "above" });
  });
  it("judges the price charged, after its discount", () => {
    const d2 = rows()[1]!;
    expect(d2.standing.standing).toMatchObject({ judged: true, standing: "below" });
    expect(d2.standing.share?.value).toBeCloseTo(25, 10);
  });
  it("judges a price without a third party's fee", () => {
    const d = byChannel();
    const f = d.fees[0] as CasesFee;
    f.cases[0]!.stages[0]!.price = { form: "action", rate: typed(1), third: { who: "הברוקר", price: { form: "action", rate: typed(5) } } } as Price;
    const block = builder(read(d)).rows[0]!.block;
    if (block.kind !== "band") throw new Error("a band");
    expect(block.rows[0]!.standing.share?.value).toBeCloseTo(25, 10);
  });
});

describe("a thing of the band's head, opened", () => {
  it("lists the thing's values in the cases, each once, and says the cases that merge", () => {
    const r = read(deal([{ by: "what", is: "us" }]));
    const track = thingMenu(r, "fee-trade", 1)!;
    expect(track.stop).toBe(copy.cases.thingMenu.stop.replace("{thing}", copy.cases.things.track!));
    expect(track.values.map((w) => (w.any ? "any" : w.text))).toEqual(["any", "מסלול 1", "מסלול 2"]);
    // five cases, two of them on what is bought in the US: they merge into one
    expect(track.after).toBe(copy.cases.thingMenu.merge.replace("{from}", "5").replace("{to}", "4"));
    const what = thingMenu(r, "fee-trade", 0)!;
    // the case of Europe and the rest of the world names every value abroad but the US case's: "outside the US", the lead said once
    expect(what.values.map((w) => w.text)).toEqual([copy.cases.values.what.tase, copy.cases.values.what.mutualFunds, copy.cases.values.what.us, "בחו״ל, מחוץ לארה״ב"]);
    expect(what.after).toBe(copy.cases.thingMenu.merge.replace("{from}", "5").replace("{to}", "3"));
    const size = thingMenu(r, "fee-fx", 0)!;
    expect(size.values.map((w) => [w.lead, w.figure?.value])).toEqual([
      [copy.cases.upTo, 10],
      [copy.cases.upTo, 100],
      [copy.cases.over, 100],
    ]);
    expect(thingMenu(r, "fee-custody", 0)).toBeNull();
  });
  it("says a fee left with one price where it was the only thing, and cases kept where none merge", () => {
    const one: FeeDeal = { ...deal(), fees: [removeBy(trade(), 1)] };
    expect(thingMenu(read(one), "fee-trade", 0)!.after).toBe(copy.cases.thingMenu.slim);
    const apart: CasesFee = { ...trade(), cases: trade().cases.filter((c) => c.id !== "c4") };
    expect(thingMenu(read({ ...deal(), fees: [apart] }), "fee-trade", 1)!.after).toBe(copy.cases.thingMenu.kept);
  });
  it("leaves an undo line that names the thing and says what the change did, with the count of cases as its menu did", () => {
    const words = (d: FeeDeal, t: number) => {
      const r = removeByKept(d, "fee-trade", t, null)!;
      return undoWords(r.undo, () => "", data);
    };
    // the two US tracks merge: 5 cases are 4
    expect(words(deal(), 1)).toBe("המחיר כבר לא משתנה לפי המסלול שבחרתם: 5 מקרים הם עכשיו 4.");
    expect(thingMenu(read(deal()), "fee-trade", 1)!.after).toContain("5 מקרים יהיו 4");
    expect(words({ ...deal(), fees: [{ ...trade(), cases: trade().cases.filter((c) => c.id !== "c4") }] }, 1)).toBe("המחיר כבר לא משתנה לפי המסלול שבחרתם. המקרים נשארו כמו שהם, כי הם שונים גם בדבר אחר.");
    expect(words({ ...deal(), fees: [removeBy(trade(), 1)] }, 0)).toBe("המחיר כבר לא משתנה לפי מה קונים. נשאר המחיר של המקרה הראשון.");
  });
});


describe("the words of a size follow the fee's own action", () => {
  const conversion = (): FeeDeal => {
    const fx: Fee = { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.1) } }] };
    return { ...newDeal("brokerage-account"), fees: [addBy(fx, { kind: "actionSize", unit: "ILS", top: 100 })] };
  };
  it("asks, opens and names a conversion's size as the conversion's, a purchase's as the action's", () => {
    const d = conversion();
    const fx = d.fees[0]! as CasesFee;
    const r = readDealFor(d, data.kinds, TODAY);
    expect(byQuestion(fx, "actionSize").ask).toBe("גודל ההמרה: עד כמה חל המחיר הראשון?");
    expect(slotEdit(r, fx.id, fx.cases[1]!.id, 0)!.title).toBe("גודל ההמרה במקרה הזה");
    expect(thingMenu(r, fx.id, 0)!.stop).toBe("להפסיק להבחין לפי גודל ההמרה");
    expect(builder(r, [], null).rows[0]!.block).toMatchObject({ kind: "band", things: [{ words: "גודל ההמרה" }] });
    expect(byQuestion(newFee("trade"), "actionSize").ask).toBe("גודל הפעולה: עד כמה חל המחיר הראשון?");
  });
});

describe("a provident-family product's management fees", () => {
  const ids = (deal: FeeDeal, feeId: string) => toolbox(read(deal), feeId)!.groups.map((g) => [g.group, g.parts.map((x) => x.id)]);
  const of = (kind: FeeDeal["kind"], fees: Fee[]): FeeDeal => ({ ...newDeal(kind), fees });
  it("offer only the share, a price for a period and a condition of the person's own (PF-01, KGL-14, PF-13)", () => {
    const deal = of("kupat-gemel-lehashkaa", [
      { id: "fee-dep", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
      { id: "fee-bal", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.6), per: 12, every: 1 } }] },
    ]);
    expect(ids(deal, "fee-dep")).toEqual([["price", ["share", "until"]], ["by", ["by:own"]]]);
    expect(ids(deal, "fee-bal")).toEqual([["price", ["held", "until"]], ["by", ["by:own"]]]);
    // every kind the records give the Capital Market Authority is of the family; a pension fund's deposit fee too
    expect(data.kinds.filter((k) => k.provident).map((k) => k.id).sort()).toEqual(["child-savings-provident", "ira-hishtalmut", "ira-provident", "keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "provident-for-annuity"]);
    expect(ids(of("pension-comprehensive", [{ id: "fee-dep", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] }]), "fee-dep")).toEqual([["price", ["share", "until"]], ["by", ["by:own"]]]);
  });
  it("leave an IRA's brokerage fees their parts, and narrow only its management fee", () => {
    const deal = of("ira-provident", [
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) } }] },
      { id: "fee-bal", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.5), per: 12, every: 1 } }] },
    ]);
    const trade = ids(deal, "fee-trade").map(([g]) => g);
    expect(trade).toEqual(["price", "bound", "by", "link", "more"]);
    expect(ids(deal, "fee-bal")).toEqual([["price", ["held", "until"]], ["by", ["by:own"]]]);
    // a brokerage account's custody keeps its bounds and its conditions
    const custody = of("brokerage-account", [{ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.2), per: 12, every: 12 } }] }]);
    expect(ids(custody, "fee-c").map(([g]) => g)).toContain("bound");
  });
  it("still open and read a deal that holds parts the toolbox no longer offers", () => {
    const deal = of("kupat-gemel-lehashkaa", [{ id: "fee-dep", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1), discount: { pct: typed(50) } } }] }]);
    const back = readDeal(JSON.parse(JSON.stringify(deal)));
    expect(back).toEqual(deal);
    expect(panel(read(deal), "fee-dep")!.open.buy[0]!.parts.map((x) => x.id)).toContain("discount");
  });
});
