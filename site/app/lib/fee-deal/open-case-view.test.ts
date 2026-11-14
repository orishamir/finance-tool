// The case open in place as the view model hands it to the components (method §10.6): the currency chooser beside a price's first sum,
// a pending part's words, label and sign on the price it goes on, and the one price the toolbox acts on (`toolPrice`): the purchase's
// last, whose parts it offers, where a tapped part goes, where a pending part asks and whose form it changes.
import { describe, expect, it } from "vitest";
import { feeDeal as copy } from "../../copy";
import { feesData } from "../fees.server";
import { typed, type FeeDeal } from "./model";
import { readDealFor } from "./deal-read";
import { panel } from "./panel";
import { toolbox } from "./toolbox";
import { changeFormKept } from "./undo";
import { setPart } from "./offers/parts";

const data = feesData();
const TODAY = "2026-11-12";
const read = (deal: FeeDeal) => readDealFor(deal, data.kinds, TODAY);

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  fees: [
    { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-unit", kind: "trade", stages: [{ price: { form: "perUnit", amount: typed(0.01), min: typed(5), currency: "USD" } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
  ],
});

describe("the currency chooser", () => {
  it("stands beside a share's minimum, whose box draws no sign of its own", () => {
    const stage = panel(read(account()), "fee-trade")!.open.buy[0]!;
    expect(stage.chooser).toEqual({ currency: "ILS", plain: false });
    expect(stage.parts.filter((p) => p.chooser).map((p) => p.id)).toEqual(["min"]);
    expect(stage.parts.find((p) => p.id === "min")!.fields[0]!.bare).toBe(true);
    expect(stage.parts.find((p) => p.id === "share")!.fields[0]!.bare).toBeUndefined();
  });

  it("stands beside a sum per unit, before its minimum", () => {
    const stage = panel(read(account()), "fee-unit")!.open.buy[0]!;
    expect(stage.chooser?.currency).toBe("USD");
    expect(stage.parts.filter((p) => p.chooser).map((p) => p.id)).toEqual(["perUnit"]);
    expect(stage.parts.find((p) => p.id === "min")!.fields[0]!.bare).toBeUndefined();
  });

  it("is none on a share with no bounds, and on a price that keeps no currency", () => {
    const bare = account();
    bare.fees[0] = { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25) } }] };
    expect(panel(read(bare), "fee-trade")!.open.buy[0]!.chooser).toBeNull();
    expect(panel(read(account()), "fee-custody")!.open.buy.map((s) => s.chooser)).toEqual([null, null]);
  });
});

describe("the price the toolbox acts on", () => {
  it("is the purchase's last: a free year then a held share offers what the held share can hold", () => {
    const t = toolbox(read(account()), "fee-custody")!;
    expect(t.k).toBe(1);
    expect(t.groups.find((g) => g.group === "bound")?.parts.map((p) => p.id)).toContain("maxPerSecurity");
  });

  it("asks for a pending part there, with its words, its box's spoken name and its sign", () => {
    const pending = panel(read(account()), "fee-custody", undefined, "maxPerSecurity")!.open.pending!;
    expect(pending).toMatchObject({ part: "maxPerSecurity", ask: "sum", k: 1, figure: "perSecurity", field: copy.panel.parts.perSecurity, sign: "₪" });
    expect(pending.words).toEqual({ lead: copy.cases.parts.max, tail: `${copy.cases.parts.perSecurity.each}${copy.cases.parts.perSecurity.charge}` });
  });

  it("asks a minimum in the currency the price keeps its sums in", () => {
    const pending = panel(read(account()), "fee-unit", undefined, "max")!.open.pending!;
    expect(pending).toMatchObject({ k: 0, sign: "$", field: copy.panel.max });
  });

  it("is where a tapped part goes", () => {
    const fee = account().fees[2]!;
    const t = toolbox(read(account()), "fee-custody")!;
    const next = setPart(fee, "maxPerSecurity", true, { k: t.k, value: 7500 });
    expect(next.stages![0]!.price).toEqual({ form: "free" });
    expect(next.stages![1]!.price).toMatchObject({ form: "held", perSecurity: { v: 7500 } });
  });

  it("is the price a form of the price changes, kept for the undo", () => {
    const r = changeFormKept(account(), "fee-custody", "sum", null)!;
    const fee = r.deal.fees.find((f) => f.id === "fee-custody")!;
    expect(fee.stages![0]!.price).toEqual({ form: "free" });
    expect(fee.stages![1]!.price.form).toBe("sum");
    expect(r.undo?.what).toEqual({ kind: "form", feeId: "fee-custody", k: 1 });
  });
});
