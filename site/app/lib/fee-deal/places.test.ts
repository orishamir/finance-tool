// Where a toolbox card goes in the case open in place (places.ts): a part a price keeps goes on each price that can hold it and has it
// not yet; a charge only on a price that charges nothing, never on one that charges, in any form; the month a price changes from on each
// side's prices; a sale priced apart on the case. A tap on a card with one place adds it there, with several holds it, and the held card
// tapped again lets go, the page then focusing the earliest place's landing copy or the card again (`tapStep`, `letGoStep`). A card is ✓
// where every place that fits it has it, and off where none fits. A card dropped on a case goes where it has one place, on the open case only where
// that place is no single price (`dropTakes`). A part waiting for its value waits only while its place and its side's prices stay.
import { describe, expect, it } from "vitest";
import { typed, type Priced } from "./model";
import { cardPlaces, cardState, dropTakes, heldOn, holdWords, letGoStep, partAt, placeWords, samePlace, stillWaits, tapCard, tapStep, waitAt, type Held, type Place } from "./places";
import { feeDeal as copy } from "../../copy";
import { fmt } from "../format";

const free = { form: "free" } as const;
const share = (rate: number) => ({ form: "action", rate: typed(rate) }) as const;
const price = (k: number, side: "buy" | "sell" = "buy"): Place => ({ on: "price", side, k });

/** A trade price that changes in January 2027: 0.05% until then, free after. */
const timed: Priced = { stages: [{ price: share(0.05), until: "2027-01" }, { price: free }] };
/** The same, its purchase charging a share and its sale priced apart, free then charging a share. */
const apart: Priced = { stages: [{ price: share(0.25) }], sale: [{ price: free, until: "2027-01" }, { price: share(0.1) }] };

describe("a card's places", () => {
  it("for a part a price keeps, are the prices that can hold it and have it not yet", () => {
    const both: Priced = { stages: [{ price: share(0.05), until: "2027-01" }, { price: share(0.1) }] };
    expect(cardPlaces("trade", both, "discount")).toEqual({ fits: 2, places: [price(0), price(1)] });
    const one: Priced = { stages: [{ price: { ...share(0.05), discount: { rate: typed(10) } } as never, until: "2027-01" }, { price: share(0.1) }] };
    expect(cardPlaces("trade", one, "discount").places).toEqual([price(1)]);
    // a free price cannot hold a discount, so it is no place for one
    expect(cardPlaces("trade", timed, "discount")).toEqual({ fits: 1, places: [price(0)] });
  });

  it("for a charge, are the free prices only: a price that charges, in any form, is never one", () => {
    expect(cardPlaces("trade", timed, "perUnit")).toEqual({ fits: 1, places: [price(1)] });
    // the price that charges a share already fits the share's card, has it, and so is no place for it
    expect(cardPlaces("trade", timed, "share")).toEqual({ fits: 2, places: [price(1)] });
    const charging: Priced = { stages: [{ price: share(0.05), until: "2027-01" }, { price: share(0.1) }] };
    expect(cardPlaces("trade", charging, "perUnit")).toEqual({ fits: 0, places: [] });
    expect(cardState(cardPlaces("trade", charging, "perUnit"))).toBe("off");
    expect(cardState(cardPlaces("trade", charging, "share"))).toBe("used");
  });

  it("take a sale priced apart's prices as places too, by their side", () => {
    expect(cardPlaces("trade", apart, "perAction").places).toEqual([price(0, "sell")]);
    expect(cardPlaces("trade", apart, "min").places).toEqual([price(0), price(1, "sell")]);
  });

  it("for the month a price changes from, are the sides: the purchase's prices, and a sale priced apart's", () => {
    expect(cardPlaces("trade", timed, "until").places).toEqual([{ on: "side", side: "buy" }]);
    expect(cardPlaces("trade", apart, "until").places).toEqual([
      { on: "side", side: "buy" },
      { on: "side", side: "sell" },
    ]);
  });

  it("for a sale priced apart, is the case as a whole, until it has one", () => {
    expect(cardPlaces("trade", timed, "sale")).toEqual({ fits: 1, places: [{ on: "fee" }] });
    expect(cardPlaces("trade", apart, "sale")).toEqual({ fits: 1, places: [] });
  });

  it("name where a part goes, in the case named", () => {
    expect(partAt(price(1, "sell"), "c2")).toEqual({ caseId: "c2", side: "sell", k: 1 });
    expect(partAt({ on: "side", side: "sell" }, null)).toEqual({ side: "sell" });
    expect(partAt({ on: "fee" })).toEqual({});
    expect(samePlace(price(1), { on: "price", side: "buy", k: 1 })).toBe(true);
    expect(samePlace(price(1), price(1, "sell"))).toBe(false);
  });

  it("are said by their months, and their side where the sale is priced apart", () => {
    const w = copy.cases.place;
    expect(placeWords(timed, price(0), true)).toBe(`${w.price} ${w.until}${fmt.date("2026-12")}`);
    expect(placeWords(timed, price(1), true)).toBe(`${w.price} ${w.from.replace("־", "")}${fmt.date("2027-01")}`);
    expect(placeWords(apart, price(0), false)).toBe(`${w.price} ${w.sides.buy}`);
    expect(placeWords(apart, { on: "side", side: "sell" }, false)).toBe(`${w.price} ${w.sides.sell}`);
    expect(placeWords(apart, { on: "fee" }, false)).toBe(w.case);
  });
});

describe("a tap on a card", () => {
  const card: Held = { fee: "fee-trade", case: null, card: "discount" };

  it("adds it at once where it has one place", () => {
    expect(tapCard(null, card, [price(1)])).toEqual({ k: "add", place: price(1) });
  });

  it("holds it where it has several, in place of another card held", () => {
    expect(tapCard(null, card, [price(0), price(1)])).toEqual({ k: "hold", held: card });
    expect(tapCard({ ...card, card: "min" }, card, [price(0), price(1)])).toEqual({ k: "hold", held: card });
  });

  it("lets the held card go when it is tapped again, and does nothing where it has no place", () => {
    expect(tapCard(card, { ...card }, [price(0), price(1)])).toEqual({ k: "letGo" });
    expect(tapCard(null, card, [])).toEqual({ k: "none" });
  });

  it("holds it for the fee and case it was tapped for alone", () => {
    expect(heldOn(card, "fee-trade", null)).toBe(card);
    expect(heldOn(card, "fee-trade", "c1")).toBeNull();
    expect(heldOn(card, "fee-fx", null)).toBeNull();
  });
});

describe("what the page does on a tap and as the hold ends", () => {
  const card: Held = { fee: "fee-trade", case: null, card: "discount" };

  it("holds a card with several places and puts the focus on the earliest place's \"+\"", () => {
    expect(tapStep(null, card, [price(0), price(1)])).toEqual({ held: card, add: null, focus: { on: "plus" } });
  });

  it("adds a card with one place there, nothing held and the focus left to the part it adds", () => {
    expect(tapStep(card, { ...card, card: "min" }, [price(1)])).toEqual({ held: null, add: price(1), focus: null });
    expect(tapStep(card, { ...card, card: "min" }, [])).toEqual({ held: null, add: null, focus: null });
  });

  it("lets the held card go when it is tapped again, the focus back on it", () => {
    expect(tapStep(card, { ...card }, [price(0), price(1)])).toEqual({ held: null, add: null, focus: { on: "card", card: "discount" } });
  });

  it("lets go with the focus back on the card, or where a click put it, and does nothing where none is held", () => {
    expect(letGoStep(card, true)).toEqual({ held: null, add: null, focus: { on: "card", card: "discount" } });
    expect(letGoStep(card, false)).toEqual({ held: null, add: null, focus: null });
    expect(letGoStep(null, true)).toBeNull();
  });

  it("says what to tap by the kind of place the card goes", () => {
    expect(holdWords("מינימום", [price(0), price(1)])).toBe(copy.cases.hold.price.replace("{card}", "מינימום"));
    expect(holdWords("תאריך", [{ on: "side", side: "buy" }, { on: "side", side: "sell" }])).toBe(copy.cases.hold.side.replace("{card}", "תאריך"));
    expect(holdWords("מינימום", [])).toBeNull();
  });
});

describe("a card dropped on a case", () => {
  it("goes on another case where it has one place there, a price among them", () => {
    expect(dropTakes([price(1)], false)).toBe(true);
    expect(dropTakes([{ on: "side", side: "buy" }], false)).toBe(true);
  });

  it("goes on the open case as a whole only where its one place is no single price: a price takes its own drop by its \"+\"", () => {
    expect(dropTakes([price(1)], true)).toBe(false);
    expect(dropTakes([{ on: "side", side: "buy" }], true)).toBe(true);
    expect(dropTakes([{ on: "fee" }], true)).toBe(true);
  });

  it("goes nowhere where it has several places, or none", () => {
    expect(dropTakes([price(0), price(1)], false)).toBe(false);
    expect(dropTakes([], false)).toBe(false);
    expect(dropTakes([{ on: "side", side: "buy" }, { on: "side", side: "sell" }], true)).toBe(false);
  });
});

describe("a part waiting at its place", () => {
  const charging: Priced = { stages: [{ price: share(0.05), until: "2027-01" }, { price: share(0.1), until: "2027-06" }, { price: share(0.2) }] };

  it("waits while its side's prices are as they were and its place takes it", () => {
    const w = waitAt(charging, "min", price(1));
    expect(stillWaits("trade", charging, w)).toBe(true);
    const otherFigure: Priced = { stages: [{ price: share(0.07), until: "2027-01" }, ...charging.stages.slice(1)] };
    expect(stillWaits("trade", otherFigure, w)).toBe(true);
  });

  it("goes when its side's prices are split, merged or moved, its side is gone, or its price takes it no more", () => {
    const w = waitAt(charging, "min", price(1));
    expect(stillWaits("trade", { stages: [charging.stages[0]!, charging.stages[2]!] }, w)).toBe(false);
    expect(stillWaits("trade", { stages: [{ ...charging.stages[0]!, until: "2026-12" }, ...charging.stages.slice(1)] }, w)).toBe(false);
    expect(stillWaits("trade", { stages: [charging.stages[0]!, { price: free, until: "2027-06" }, charging.stages[2]!] }, w)).toBe(false);
    const onSale = waitAt(apart, "min", price(1, "sell"));
    expect(stillWaits("trade", apart, onSale)).toBe(true);
    expect(stillWaits("trade", { stages: apart.stages }, onSale)).toBe(false);
  });

  it("at a side's prices as a whole, goes once those prices change", () => {
    const w = waitAt(timed, "until", { on: "side", side: "buy" });
    expect(stillWaits("trade", timed, w)).toBe(true);
    expect(stillWaits("trade", { stages: [{ price: share(0.05) }] }, w)).toBe(false);
  });
});
