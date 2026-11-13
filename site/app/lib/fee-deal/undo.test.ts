// The fee page's one undo, on the site's own price lists: a fee taken away, a fee filled from a price list, a stage taken away.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { editPrice, setLimited, setName, setSaleApart, setStart, updateFee, withFigure } from "./edit";
import { typed, type FeeDeal } from "./model";
import { feePriceLists } from "./templates";
import { deleteDealKept, fillFeeKept, holdOnKept, removeFeeKept, removeStageKept, standing, undo, undoDelete } from "./undo";

const data = feesData();

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  held: { place: "abroad", currency: "USD", payout: "accumulating" },
  fees: [
    { id: "fee-trade", kind: "trade", sale: [{ price: { form: "action", rate: typed(0.3) } }], stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
    { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
  ],
});

describe("one undo for a change that loses something", () => {
  it("puts back a removed fee as it was, with its id, in its place", () => {
    const d = account();
    const r = removeFeeKept(d, "fee-custody", "fee-trade")!;
    expect(r.deal.fees.map((f) => f.id)).toEqual(["fee-trade", "fee-fx"]);
    expect(r.chosen).toBe("fee-trade");
    const back = undo(r.deal, r.undo, r.chosen)!;
    expect(back.deal).toEqual(d);
    expect(back.chosen).toBe("fee-trade");
  });
  it("hands the choice of a removed chosen fee to the next card, else the one before, and gives it back on undo", () => {
    const d = account();
    expect(removeFeeKept(d, "fee-trade", "fee-trade")!.chosen).toBe("fee-custody");
    expect(removeFeeKept(d, "fee-fx", "fee-fx")!.chosen).toBe("fee-custody");
    const only: FeeDeal = { ...d, fees: [d.fees[0]!] };
    expect(removeFeeKept(only, "fee-trade", "fee-trade")!.chosen).toBeNull();
    const r = removeFeeKept(d, "fee-trade", "fee-trade")!;
    expect(undo(r.deal, r.undo, r.chosen)!.chosen).toBe("fee-trade");
  });
  it("keeps a fee chosen after the removal chosen when the removal is undone", () => {
    const d = account();
    const r = removeFeeKept(d, "fee-trade", "fee-trade")!;
    expect(undo(r.deal, r.undo, "fee-fx")!.chosen).toBe("fee-fx");
  });
  it("puts back a fee's own prices, its sale's price among them, after it was filled from a price list", () => {
    const d = account();
    const house = feePriceLists(d, "trade", data)[0]!.id;
    const r = fillFeeKept(d, "fee-trade", house, data, "fee-trade")!;
    expect(r.deal.fees[0]!.sale).toBeUndefined();
    expect(undo(r.deal, r.undo, r.chosen)!.deal).toEqual(d);
  });
  it("puts back a stage taken away", () => {
    const d = account();
    const r = removeStageKept(d, "fee-custody", "buy", 0, null)!;
    expect(r.deal.fees[1]!.stages).toHaveLength(1);
    expect(undo(r.deal, r.undo, null)!.deal).toEqual(d);
    expect(removeStageKept(d, "fee-fx", "buy", 0, null)).toBeNull();
  });
  it("lives through other edits, and puts back only what its change took into the deal as it is now", () => {
    const d = account();
    const r = removeFeeKept(d, "fee-custody", null)!;
    const edited = setName(setStart(r.deal, "2027-01"), "x");
    expect(standing(r.undo, edited)).toBe(true);
    const back = undo(edited, r.undo, null)!.deal;
    expect(back.fees.map((f) => f.id)).toEqual(["fee-trade", "fee-custody", "fee-fx"]);
    expect(back.name).toBe("x");
    expect(back.start).toBe("2027-01");
  });
  it("puts a fee's prices back over a fill, keeping the other fees' later edits", () => {
    const d = account();
    const house = feePriceLists(d, "trade", data)[0]!.id;
    const r = fillFeeKept(d, "fee-trade", house, data, null)!;
    const edited = updateFee(r.deal, "fee-fx", (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.5)));
    const back = undo(edited, r.undo, null)!.deal;
    expect(back.fees[0]).toEqual(d.fees[0]);
    expect(back.fees[2]!.stages[0]!.price).toMatchObject({ rate: { v: 0.5 } });
  });
  it("puts a last stage back with the end of the price before it, into the fee as it is now", () => {
    const d = account();
    const r = removeStageKept(d, "fee-custody", "buy", 1, null)!;
    expect(r.deal.fees[1]!.stages).toEqual([{ price: { form: "free" } }]);
    const edited = updateFee(r.deal, "fee-trade", (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.1)));
    const back = undo(edited, r.undo, null)!.deal;
    expect(back.fees[1]).toEqual(d.fees[1]);
    expect(back.fees[0]!.stages[0]!.price).toMatchObject({ rate: { v: 0.1 } });
  });
  it("puts a middle price back with the end the price before it had", () => {
    const d = account();
    const three = updateFee(d, "fee-custody", (f) => setLimited(f, "buy", 1, "2030-01"));
    const r = removeStageKept(three, "fee-custody", "buy", 1, null)!;
    expect(r.deal.fees[1]!.stages.map((s) => s.until)).toEqual(["2030-01", undefined]);
    expect(undo(r.deal, r.undo, null)!.deal).toEqual(three);
  });
  it("puts back the prices \"כל הזמן\" took away after a price, with its end, while it is still the last", () => {
    const d = account();
    const r = holdOnKept(d, "fee-custody", "buy", 0, null)!;
    expect(r.deal.fees[1]!.stages).toEqual([{ price: { form: "free" } }]);
    expect(undo(r.deal, r.undo, null)!.deal).toEqual(d);
    // a chain built again since has the prices' place: the undo no longer stands
    const again = updateFee(r.deal, "fee-custody", (f) => setLimited(f, "buy", 0, "2029-01"));
    expect(standing(r.undo, again)).toBe(false);
    expect(holdOnKept(d, "fee-custody", "buy", 1, null)).toBeNull();
  });
  it("stands only while what it would put back has a place to go", () => {
    const d = account();
    const removed = removeFeeKept(d, "fee-fx", null)!;
    expect(standing(removed.undo, { ...removed.deal, id: "deal-b" })).toBe(false);
    expect(standing(removed.undo, d)).toBe(false);
    const stage = removeStageKept(d, "fee-custody", "buy", 0, null)!;
    expect(standing(stage.undo, removeFeeKept(stage.deal, "fee-custody", null)!.deal)).toBe(false);
    const sale = removeStageKept({ ...d, fees: [{ ...d.fees[0]!, sale: [{ price: { form: "free" }, until: "2027-01" }, { price: { form: "action", rate: typed(0.3) } }] }] }, "fee-trade", "sell", 0, null)!;
    expect(standing(sale.undo, updateFee(sale.deal, "fee-trade", (f) => setSaleApart(f, false)))).toBe(false);
  });
});

describe("a fee filled from a house of another kind of provider", () => {
  const here = (): FeeDeal => ({ ...account(), held: { place: "israel", currency: "ILS", payout: "accumulating" } });
  const bank = data.houses.find((h) => h.provider === "bank" && feePriceLists(here(), "trade", { houses: [h] }).length > 0)!;
  const other = data.houses.find((h) => h.provider === "non-bank" && feePriceLists(here(), "trade", { houses: [h] }).length > 0)!;
  const id = (h: { id: string }) => `house:${h.id}`;

  it("takes the deal's provider away, which the undo puts back", () => {
    const d: FeeDeal = { ...here(), provider: "bank" };
    const r = fillFeeKept(d, "fee-trade", id(other), data, null)!;
    expect(r.deal.provider).toBeUndefined();
    expect(undo(r.deal, r.undo, null)!.deal.provider).toBe("bank");
  });
  it("keeps it where the house is of the deal's own kind", () => {
    const d: FeeDeal = { ...here(), provider: "bank" };
    expect(fillFeeKept(d, "fee-trade", id(bank), data, null)!.deal.provider).toBe("bank");
  });
});

describe("a saved deal deleted", () => {
  it("is put back at its place among the saved deals, once", () => {
    const a = account(), b = { ...account(), id: "deal-b" }, c = { ...account(), id: "deal-c" };
    const r = deleteDealKept([a, b, c], "deal-b", "deal-a")!;
    expect(r.deals.map((d) => d.id)).toEqual(["deal-a", "deal-c"]);
    expect(r.undo.shown).toBe(false);
    const back = undoDelete(r.deals, r.undo)!;
    expect(back.map((d) => d.id)).toEqual(["deal-a", "deal-b", "deal-c"]);
    expect(undoDelete(back, r.undo)).toBeNull();
    expect(deleteDealKept([a], "deal-x", "deal-a")).toBeNull();
  });
});
