// The fee page's one undo, on the site's own price lists: a fee taken away, a fee filled from a price list, a stage taken away.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { setName, setStart } from "./edit";
import { typed, type FeeDeal } from "./model";
import { feePriceLists } from "./templates";
import { fillFeeKept, removeFeeKept, removeStageKept, standing, undo } from "./undo";

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
  it("ends with any other change to the deal", () => {
    const d = account();
    const r = removeFeeKept(d, "fee-fx", null)!;
    expect(standing(r.undo, r.deal)).toBe(true);
    for (const changed of [setStart(r.deal, "2027-01"), setName(r.deal, "x"), { ...r.deal }]) {
      expect(standing(r.undo, changed)).toBe(false);
      expect(undo(changed, r.undo, null)).toBeNull();
    }
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
