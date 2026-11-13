// The fee page's one undo, on the site's own price lists: a fee taken away, a fee filled from a price list, a stage taken away.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { addFee, editPrice, setLimited, setName, setSaleApart, setStart, setUntil, updateFee, withFigure } from "./edit";
import { newDeal, typed, type FeeDeal } from "./model";
import { barredFees, feePriceLists, pickTrack } from "./templates";
import { deleteDealKept, fillFeeKept, holdOnKept, removeFeeKept, removeStageKept, setKindKept, standing, undo, undoDelete, undoWords } from "./undo";
import { kindById } from "./kinds";
import { feeDeal as copy } from "../../copy";

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
    expect(undo(r.deal, r.undo!, null)!.deal).toEqual(d);
    // a chain built again since has the prices' place: the undo no longer stands
    const again = updateFee(r.deal, "fee-custody", (f) => setLimited(f, "buy", 0, "2029-01"));
    expect(standing(r.undo, again)).toBe(false);
    expect(holdOnKept(d, "fee-custody", "buy", 1, null)).toBeNull();
    // prices after it as "לזמן מוגבל" left them go silently, with no undo
    const fresh = updateFee(d, "fee-fx", (f) => setLimited(f, "buy", 0, "2028-01"));
    const silent = holdOnKept(fresh, "fee-fx", "buy", 0, null)!;
    expect(silent.undo).toBeNull();
    expect(silent.deal.fees[2]).toEqual(d.fees[2]);
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

describe("an undo stands while the part it puts back into is as its change left it", () => {
  it("a fee taken away: not once a fee of its kind is in the deal again, added or set by a track; a fee of the person's own by its id", () => {
    const d = account();
    const r = removeFeeKept(d, "fee-custody", null)!;
    const readded = addFee(r.deal, "custody").deal;
    expect(standing(r.undo, readded)).toBe(false);
    expect(undo(readded, r.undo, null)).toBeNull();
    expect(standing(r.undo, addFee(r.deal, "own").deal)).toBe(true);
    // a track picked since fills a fee of that kind again
    const t = data.tracks.find((x) => x.wrapperId === "kupat-gemel-lehashkaa")!;
    const filled = pickTrack(newDeal("kupat-gemel-lehashkaa"), `track:${t.id}`, data, "2026-11-12")!;
    const first = filled.fees[0]!;
    const typedOver = updateFee(filled, first.id, (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.1)));
    const gone = removeFeeKept(typedOver, first.id, null)!;
    const picked = pickTrack(gone.deal, `track:${t.id}`, data, "2026-11-12")!;
    expect(picked.fees.some((f) => f.kind === first.kind)).toBe(true);
    expect(standing(gone.undo, picked)).toBe(false);
    const own: FeeDeal = { ...d, fees: [...d.fees, { id: "fee-own", kind: "own", name: "x", stages: [{ price: { form: "free" } }] }] };
    const ownGone = removeFeeKept(own, "fee-own", null)!;
    expect(standing(ownGone.undo, addFee(ownGone.deal, "own").deal)).toBe(true);
  });
  it("a price taken away: not once its fee has changed since, its chain or a month among them", () => {
    const d = account();
    const three = updateFee(d, "fee-custody", (f) => setLimited(f, "buy", 1, "2030-01"));
    const last = removeStageKept(three, "fee-custody", "buy", 2, null)!;
    const rebuilt = updateFee(last.deal, "fee-custody", (f) => setLimited(f, "buy", 1, "2031-01"));
    expect(standing(last.undo, rebuilt)).toBe(false);
    const middle = removeStageKept(three, "fee-custody", "buy", 1, null)!;
    const moved = updateFee(middle.deal, "fee-custody", (f) => setUntil(f, "buy", 0, "2029-06"));
    expect(standing(middle.undo, moved)).toBe(false);
    expect(undo(moved, middle.undo, null)).toBeNull();
  });
  it("a fill: not once the fee filled has been edited since", () => {
    const d = account();
    const house = feePriceLists(d, "trade", data)[0]!.id;
    const r = fillFeeKept(d, "fee-trade", house, data, null)!;
    const edited = updateFee(r.deal, "fee-trade", (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.11)));
    expect(standing(r.undo, edited)).toBe(false);
    expect(undo(edited, r.undo, null)).toBeNull();
  });
  it("edits elsewhere in the deal keep each of them standing", () => {
    const d = account();
    const elsewhere = (x: FeeDeal) => setName(updateFee(x, "fee-fx", (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.9))), "y");
    const house = feePriceLists(d, "trade", data)[0]!.id;
    const fill = fillFeeKept(d, "fee-trade", house, data, null)!;
    expect(standing(fill.undo, elsewhere(fill.deal))).toBe(true);
    const stage = removeStageKept(d, "fee-custody", "buy", 0, null)!;
    expect(standing(stage.undo, elsewhere(stage.deal))).toBe(true);
    const removed = removeFeeKept(d, "fee-custody", null)!;
    expect(standing(removed.undo, elsewhere(removed.deal))).toBe(true);
  });
  it("says what its change did", () => {
    const d = account();
    const name = () => "שם";
    expect(undoWords(removeFeeKept(d, "fee-fx", null)!.undo, name, data)).toBe(`${copy.builder.removed}שם.`);
    expect(undoWords(removeStageKept(d, "fee-custody", "buy", 0, null)!.undo, name, data)).toBe(copy.panel.stageRemoved);
    expect(undoWords(holdOnKept(d, "fee-custody", "buy", 0, null)!.undo!, name, data)).toBe(copy.panel.laterRemoved);
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

describe("another kind of product for the deal", () => {
  const kind = (id: string) => kindById(data.kinds, id as FeeDeal["kind"])!;
  const provident = (): FeeDeal => ({
    id: "deal-p",
    name: "",
    kind: "kupat-gemel-lehashkaa",
    template: { id: "track:1", name: "מסלול" },
    fees: [
      { id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.7), per: 12, every: 12 } }] },
      { id: "fee-own", kind: "own", name: "דמי טיפול", stages: [{ price: { form: "action", rate: typed(0.1) } }] },
      { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
    ],
  });
  it("takes away the two management fees a securities account does not have, keeps a fee of the person's own, and drops the track", () => {
    const d = provident();
    const r = setKindKept(d, kind("brokerage-account"), barredFees("brokerage-account", data, "2026-11-13"), "fee-balance");
    expect(r.deal.kind).toBe("brokerage-account");
    expect(r.deal.fees.map((f) => f.id)).toEqual(["fee-own"]);
    expect(r.deal.template).toBeUndefined();
    expect(r.chosen).toBe("fee-own");
    expect(r.undo).not.toBeNull();
    expect(undoWords(r.undo!, (f) => f.kind, data)).toBe(`${copy.builder.removedMany}balance, deposit.`);
  });
  it("puts the kind, the fees, the track and the choice back together, as the deal was", () => {
    const d = provident();
    const r = setKindKept(d, kind("brokerage-account"), [], "fee-balance");
    const back = undo(r.deal, r.undo!, r.chosen)!;
    expect(back.deal).toEqual(d);
    expect(back.chosen).toBe("fee-balance");
  });
  it("keeps a fee typed since when undone, and stands no more once the deal has a fee of a kind it took away or another kind", () => {
    const d = provident();
    const r = setKindKept(d, kind("brokerage-account"), [], null);
    const { deal: more } = addFee(r.deal, "trade");
    expect(standing(r.undo, more)).toBe(true);
    expect(undo(more, r.undo!, null)!.deal.fees.map((f) => f.kind)).toEqual(["balance", "own", "deposit", "trade"]);
    const own = { ...r.deal, fees: [...r.deal.fees, { id: "fee-x", kind: "balance" as const, stages: [{ price: { form: "free" as const } }] }] };
    expect(standing(r.undo, own)).toBe(false);
    expect(standing(r.undo, { ...r.deal, kind: "ira-provident" })).toBe(false);
  });
  it("keeps a fee both kinds have as typed", () => {
    const d = provident();
    const r = setKindKept(d, kind("keren-hishtalmut"), [], null);
    expect(r.deal.fees).toEqual(d.fees);
    expect(r.undo).toBeNull();
    expect(setKindKept(account(), kind("ira-provident"), [], null).deal.fees.map((f) => f.id)).toEqual(["fee-trade", "fee-custody", "fee-fx"]);
  });
  it("takes away a fee the new kind may not charge by rule", () => {
    const d = provident();
    expect(setKindKept(d, kind("keren-hishtalmut"), ["deposit"], null).deal.fees.map((f) => f.id)).toEqual(["fee-balance", "fee-own"]);
  });
  it("takes away fees with nothing typed in them silently", () => {
    let d: FeeDeal = { ...newDeal("kupat-gemel-lehashkaa"), id: "deal-q" };
    d = addFee(addFee(d, "balance").deal, "deposit").deal;
    const r = setKindKept(d, kind("brokerage-account"), [], null);
    expect(r.deal.fees).toEqual([]);
    expect(r.undo).toBeNull();
  });
  it("drops the provider kind a house's price list gave, and gives it back", () => {
    const d: FeeDeal = { ...account(), template: { id: "house:x", name: "בית" }, provider: "bank" };
    const r = setKindKept(d, kind("pension-general"), [], null);
    expect(r.deal.provider).toBeUndefined();
    expect(r.deal.held).toBeUndefined();
    expect(undo(r.deal, r.undo!, null)!.deal).toEqual(d);
  });
  it("leaves a deal of the same kind as it is", () => {
    const d = provident();
    const r = setKindKept(d, kind("kupat-gemel-lehashkaa"), [], null);
    expect(r.deal).toBe(d);
    expect(r.undo).toBeNull();
  });
});
