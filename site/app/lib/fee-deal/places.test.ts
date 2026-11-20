// Where a toolbox card goes in the case open in place (places.ts): a part a price keeps goes on each price that can hold it and has it
// not yet; a charge only on a price that charges nothing, never on one that charges, in any form; the month a price changes from on each
// side's prices; a sale priced apart on the case. A tap on a card with one place adds it there, with several holds it, and the held card
// tapped again lets go. A card is ✓ where every place that fits it has it, and off where none fits.
import { describe, expect, it } from "vitest";
import { typed, type Priced } from "./model";
import { cardPlaces, cardState, heldOn, partAt, placeWords, samePlace, tapCard, type Held, type Place } from "./places";
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
