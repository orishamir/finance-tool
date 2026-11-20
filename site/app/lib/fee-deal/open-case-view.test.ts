// The case open in place as the view model hands it to the components (method §10.6): the currency chooser beside a price's first sum,
// a pending part's words, label and sign at the place it was added, and the places a toolbox card goes (places.ts): the prices that can
// hold it, for a charge the free ones, and for the month a price changes from the side, at whose foot it asks. A part waiting for its
// value stays on the price it was added on, and is dropped, never moved, when that price or its side's prices change.
import { describe, expect, it } from "vitest";
import { feeDeal as copy } from "../../copy";
import { feesData } from "../fees.server";
import { pricedOf, typed, type Fee, type FeeDeal, type Price, type Stage } from "./model";
import { readDealFor } from "./deal-read";
import { panel } from "./panel";
import { waitAt, type Place, type Waiting } from "./places";
import { editPrice, moveChange, removeChange, setSaleApart } from "./edits/stage";
import { cardOf, toolbox } from "./toolbox";
import { changeFormKept } from "./undo";
import { setPart, type PendingPart } from "./offers/parts";

const data = feesData();
const TODAY = "2026-11-12";
const read = (deal: FeeDeal) => readDealFor(deal, data.kinds, TODAY);
/** Part `part` waiting at place `place` of fee `feeId` in `deal`, as the page sets it. */
const waiting = (deal: FeeDeal, feeId: string, part: PendingPart, place: Place) => waitAt(pricedOf(deal.fees.find((f) => f.id === feeId)!), part, place);

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

describe("the places a card goes", () => {
  it("are the prices that can hold it: a free year then a held share offers what the held share can hold, on that price alone", () => {
    const t = toolbox(read(account()), "fee-custody")!;
    expect(t.groups.find((g) => g.group === "bound")?.parts.map((p) => p.id)).toContain("maxPerSecurity");
    expect(cardOf(t, "maxPerSecurity")!.places).toEqual([{ on: "price", side: "buy", k: 1 }]);
  });

  it("ask a pending part at its place, with its words, its box's spoken name and its sign", () => {
    const pending = panel(read(account()), "fee-custody", undefined, waiting(account(), "fee-custody", "maxPerSecurity", { on: "price", side: "buy", k: 1 }))!.open.pending!;
    expect(pending).toMatchObject({ part: "maxPerSecurity", ask: "sum", place: { on: "price", side: "buy", k: 1 }, figure: "perSecurity", field: copy.panel.parts.perSecurity, sign: "₪" });
    expect(pending.words).toEqual({ lead: copy.cases.parts.max, tail: `${copy.cases.parts.perSecurity.each}${copy.cases.parts.perSecurity.charge}` });
  });

  it("ask a minimum in the currency the price keeps its sums in", () => {
    const pending = panel(read(account()), "fee-unit", undefined, waiting(account(), "fee-unit", "max", { on: "price", side: "buy", k: 0 }))!.open.pending!;
    expect(pending).toMatchObject({ place: { on: "price", side: "buy", k: 0 }, sign: "$", field: copy.panel.max });
  });

  it("ask the month a price changes from at the foot of its side's prices", () => {
    const pending = panel(read(account()), "fee-custody", undefined, waiting(account(), "fee-custody", "until", { on: "side", side: "buy" }))!.open.pending!;
    expect(pending).toMatchObject({ part: "until", ask: "month", place: { on: "side", side: "buy" } });
  });

  it("take a tapped part where it goes", () => {
    const fee = account().fees[2]!;
    const next = setPart(fee, "maxPerSecurity", true, { k: 1, value: 7500 });
    expect(next.stages![0]!.price).toEqual({ form: "free" });
    expect(next.stages![1]!.price).toMatchObject({ form: "held", perSecurity: { v: 7500 } });
  });

  it("for a charge, are the free prices: the free year takes a held share, the price that charges one already is no place for it", () => {
    const t = toolbox(read(account()), "fee-custody")!;
    expect(cardOf(t, "held")).toMatchObject({ used: false, places: [{ on: "price", side: "buy", k: 0 }] });
    const r = changeFormKept(account(), "fee-custody", "held", null, undefined, 0)!;
    const fee = r.deal.fees.find((f) => f.id === "fee-custody")!;
    expect(fee.stages![0]!.price).toMatchObject({ form: "held", rate: { blank: true } });
    expect(fee.stages![1]!.price).toMatchObject({ form: "held", rate: { v: 0.4 } });
    expect(r.undo).toBeNull();
    // every price charging it now, the card has its ✓
    expect(cardOf(toolbox(read(r.deal), "fee-custody")!, "held")).toMatchObject({ used: true, places: [] });
  });
});

describe("a part waiting for its value", () => {
  /** A deal of one trade fee with prices `stages`, and a sale priced apart `sale` where given. */
  const trade = (stages: Stage[], sale?: Stage[]): FeeDeal => ({ id: "deal-w", name: "", kind: "brokerage-account", fees: [{ id: "fee-trade", kind: "trade", stages, ...(sale ? { sale } : {}) }] });
  const share = (rate: number) => ({ form: "action", rate: typed(rate) }) as const;
  /** The deal with its fee changed by `fn`. */
  const edited = (deal: FeeDeal, fn: (f: Fee) => Fee): FeeDeal => ({ ...deal, fees: deal.fees.map((f) => fn(f)) });
  const asked = (deal: FeeDeal, w: Waiting) => panel(read(deal), "fee-trade", undefined, w)!.open.pending;

  it("is dropped, never moved to the purchase, when the sale priced apart it waits on is taken away", () => {
    // hold "מינימום", tap the sale's "+": the minimum waits on the sale's later price
    const deal = trade([{ price: share(0.25) }], [{ price: { form: "free" }, until: "2027-01" }, { price: share(0.1) }]);
    const sellPlace: Place = { on: "price", side: "sell", k: 1 };
    expect(cardOf(toolbox(read(deal), "fee-trade")!, "min")!.places).toEqual([{ on: "price", side: "buy", k: 0 }, sellPlace]);
    const w = waiting(deal, "fee-trade", "min", sellPlace);
    expect(asked(deal, w)).toMatchObject({ part: "min", place: sellPlace });
    // the sale priced apart binned: the purchase has a price 1 of its own no more, nor any sale, and the minimum asks nowhere
    expect(asked(edited(deal, (f) => setSaleApart(f, false)), w)).toBeNull();
    // the purchase given a second price since: still nowhere, its index 1 now a purchase's price it was never added on
    const split = edited(deal, (f) => setPart(setSaleApart(f, false), "until", true, { side: "buy", month: "2027-01" }));
    expect(asked(split, w)).toBeNull();
  });

  it("is dropped when a change between prices is taken away, so it never lands on the price that moves into its index", () => {
    const deal = trade([
      { price: share(0.1), until: "2027-01" },
      { price: share(0.2), until: "2027-06" },
      { price: share(0.3) },
    ]);
    const place: Place = { on: "price", side: "buy", k: 1 };
    const w = waiting(deal, "fee-trade", "min", place);
    expect(asked(deal, w)).toMatchObject({ part: "min", place });
    // the divider between prices 0 and 1 binned: price 1 is the one that was price 2
    expect(asked(edited(deal, (f) => removeChange(f, "buy", 0)), w)).toBeNull();
    // a divider moved changes the side's prices too
    expect(asked(edited(deal, (f) => moveChange(f, "buy", 0, "2026-12")), w)).toBeNull();
  });

  it("waits on through a change that leaves its price where it was, and is dropped where its price can hold it no more", () => {
    const deal = trade([
      { price: share(0.1), until: "2027-01" },
      { price: share(0.2), until: "2027-06" },
      { price: share(0.3) },
    ]);
    const place: Place = { on: "price", side: "buy", k: 1 };
    const w = waiting(deal, "fee-trade", "min", place);
    // another price's figure, and another price's charge binned (the page's `onCharge`), leave it asking
    expect(asked(edited(deal, (f) => editPrice(f, "buy", 0, (p) => ({ ...p, rate: typed(0.15) }) as Price)), w)).toMatchObject({ place });
    const otherFree = changeFormKept(deal, "fee-trade", "free", null, undefined, 2)!.deal;
    expect(asked(otherFree, w)).toMatchObject({ place });
    // its own price's charge binned: a free price takes no minimum, so it asks nowhere
    const ownFree = changeFormKept(deal, "fee-trade", "free", null, undefined, 1)!.deal;
    expect(asked(ownFree, w)).toBeNull();
    // a minimum given there meanwhile: it is had, and the place takes it no more
    expect(asked(edited(deal, (f) => setPart(f, "min", true, { k: 1, value: 5 })), w)).toBeNull();
  });
});
