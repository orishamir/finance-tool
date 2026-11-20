// A fee left out of the reading for a price not given: where it misses it and which figure, its card's words, and the reading's tab for an
// action whose every fee is so, in its usual place, with the fee's line on it.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { feeDeal as copy } from "../../copy";
import { builder } from "./rows";
import { readDealFor } from "./deal-read";
import { readingOf } from "./reading";
import { leftByPanel, leftOut } from "./left-out";
import { typed, type CasesFee, type FeeDeal, type SlimFee } from "./model";
import { missingOf } from "./unpriced";

const data = feesData();
const TODAY = "2026-11-12";
const read = (d: FeeDeal) => readDealFor(d, data.kinds, TODAY);
const blank = { v: 0, blank: true } as const;

/** A trade fee by what is bought and the channel whose price per unit on the Tel Aviv exchange online has no sum yet. */
const trade = (): CasesFee => ({
  id: "fee-trade",
  kind: "trade",
  by: [{ kind: "what", values: ["tase", "makam"] }, { kind: "channel", values: ["direct", "branch"] }],
  cases: [
    { id: "c1", when: [["tase"], ["direct"]], stages: [{ price: { form: "perUnit", amount: blank, min: typed(39), max: typed(6900) } }] },
    { id: "c2", when: [["tase"], ["branch"]], stages: [{ price: { form: "action", rate: typed(0.64), min: typed(40) } }] },
    { id: "c3", when: [["makam"], "any"], stages: [{ price: { form: "action", rate: typed(0.1), min: typed(15) } }] },
  ],
});
const fx: SlimFee = { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] };
const out: SlimFee = { id: "fee-out", kind: "transfer_out", stages: [{ price: { form: "perAction", amount: typed(30) } }] };

const deal = (fees: FeeDeal["fees"]): FeeDeal => ({ id: "deal-u", name: "", kind: "brokerage-account", readFor: [{ by: "what", is: "tase" }, { by: "channel", is: "direct" }], fees });

describe("a fee left out for a price not given", () => {
  it("names the cases the reading reads it in that miss a price, and the figure missing there", () => {
    const r = read(deal([trade(), fx, out]));
    expect(r.unpriced).toEqual(["fee-trade"]);
    expect(r.unpricedAt).toEqual({ "fee-trade": { cases: ["c1"], missing: "unit" } });
    expect(missingOf({ form: "action", rate: blank })).toBe("rate");
    expect(missingOf({ form: "sum", amount: blank, every: 1 })).toBe("sum");
    expect(missingOf({ form: "action", rate: typed(0.1), discount: { pct: blank } })).toBe("price");
  });
  it("gives its card the case in the reader's words, inside a sentence", () => {
    const row = builder(read(deal([trade(), fx, out]))).rows.find((x) => x.fee === "fee-trade")!;
    expect(row.unpriced).toEqual({ cases: ["c1"], missing: "unit", where: "בניירות ערך בתל אביב, באינטרנט ובאפליקציה" });
    expect(copy.unpriced.noPrice(row.unpriced!.where)).toBe("חסר מחיר בניירות ערך בתל אביב, באינטרנט ובאפליקציה.");
    expect(builder(read(deal([trade(), fx, out]))).rows.find((x) => x.fee === "fee-fx")!.unpriced).toBeUndefined();
  });
  it("names no case for a fee whose price changes by nothing", () => {
    const slim: SlimFee = { id: "fee-s", kind: "trade", stages: [{ price: { form: "perUnit", amount: blank } }] };
    expect(builder(read(deal([slim, fx]))).rows[0]!.unpriced).toEqual({ cases: [], missing: "unit", where: null });
  });
  it("keeps its action's tab, first as the actions' order puts it, with the fee's line on it and on no other panel", () => {
    const r = read(deal([trade(), fx, out]));
    const panels = readingOf(r, data.fx).panels;
    expect(panels.actions.map((t) => t.key)).toEqual(["trade:all", "conversion:all", "transfer_out:all"]);
    expect(panels.actions[0]!.views).toEqual([{ unpriced: { periods: ["2026-11"], fees: [{ fee: { fee: "fee-trade", kind: "trade" }, unpriced: { cases: ["c1"], missing: "unit", where: "בניירות ערך בתל אביב, באינטרנט ובאפליקציה" } }] } }]);
    const placed = leftByPanel(leftOut(r), r.engine, panels);
    expect(placed.byPanel["trade:all"]!.unpriced.map((f) => f.fee)).toEqual(["fee-trade"]);
    expect(Object.entries(placed.byPanel).filter(([k]) => k !== "trade:all").flatMap(([, l]) => l.unpriced)).toEqual([]);
  });
  it("stands in its place among the tabs where the actions before it have none", () => {
    const panels = readingOf(read(deal([out, trade()])), data.fx).panels;
    expect(panels.actions.map((t) => t.key)).toEqual(["trade:all", "transfer_out:all"]);
  });
  it("leaves the chart where another fee on the action is read, the fee among what it leaves out", () => {
    const other: SlimFee = { id: "fee-t2", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) } }] };
    const r = read(deal([trade(), other, fx]));
    const panels = readingOf(r, data.fx).panels;
    expect(panels.actions.map((t) => t.key)).toEqual(["trade:all", "conversion:all"]);
    expect(panels.actions[0]!.views.every((v) => !("unpriced" in v))).toBe(true);
    expect(leftByPanel(leftOut(r), r.engine, panels).byPanel["trade:all"]!.unpriced.map((f) => f.fee)).toEqual(["fee-trade"]);
  });
});
