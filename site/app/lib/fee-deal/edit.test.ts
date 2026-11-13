import { describe, expect, it } from "vitest";
import { blankPrice, feeInOrder, feePriced, newDeal, newFee, typed, untouched, type Fee, type Num, type Price } from "./model";
import { addFee, addLater, editPrice, holdOn, laterUntouched, pickHeld, removeStage, setHeld, setKind, setLimited, setSaleApart, setStart, setUntil, withCurrency, withFigure, withForm, withMonths } from "./edit";

const src: Num["src"] = { url: "https://example.org/list.pdf", title: "list", publisher: "house", strength: "primary", checked: "2026-11-01" };

describe("the fee page's edits", () => {
  it("a typed figure is the person's, unless it is the template's own number", () => {
    const p = { form: "action" as const, rate: { v: 0.1, src } };
    expect(withFigure(p, "rate", 0.1)).toEqual(p);
    expect(withFigure(p, "rate", 0.2)).toEqual({ form: "action", rate: { v: 0.2 } });
    expect(withFigure(p, "min", 15)).toEqual({ form: "action", rate: { v: 0.1, src }, min: { v: 15 } });
    expect(withFigure({ ...p, min: { v: 15 } }, "min", null)).toEqual(p);
    expect(withFigure({ form: "free" }, "rate", 1)).toEqual({ form: "free" });
  });

  it("a price in another form keeps its rate or its sum", () => {
    expect(withForm({ form: "action", rate: { v: 0.4 } }, "held")).toEqual({ form: "held", rate: { v: 0.4 }, per: 12, every: 12 });
    expect(withForm({ form: "sum", amount: { v: 10 }, every: 1 }, "perAction")).toEqual({ form: "perAction", amount: { v: 10 } });
    expect(withForm({ form: "held", rate: { v: 0.4 }, per: 12, every: 3 }, "free")).toEqual({ form: "free" });
    expect(withMonths({ form: "held", rate: { v: 0.4 }, per: 12, every: 12 }, "every", 3)).toEqual({ form: "held", rate: { v: 0.4 }, per: 12, every: 3 });
    expect(withCurrency({ form: "action", rate: { v: 0.1 }, currency: "USD" }, "ILS")).toEqual({ form: "action", rate: { v: 0.1 } });
  });

  it("a price whose months, currency or form the person changes loses its sources; the same months or currency change nothing", () => {
    const held: Price = { form: "held", rate: { v: 0.6, src }, per: 12, every: 1, min: { v: 5, src } };
    expect(withMonths(held, "per", 12)).toBe(held);
    expect(withMonths(held, "every", 1)).toBe(held);
    expect(withMonths(held, "per", 1)).toEqual({ form: "held", rate: { v: 0.6 }, per: 1, every: 1, min: { v: 5 } });
    expect(withMonths(held, "every", 3)).toEqual({ form: "held", rate: { v: 0.6 }, per: 12, every: 3, min: { v: 5 } });
    const sum: Price = { form: "sum", amount: { v: 10, src }, every: 1 };
    expect(withMonths(sum, "every", 1)).toBe(sum);
    expect(withMonths(sum, "every", 3)).toEqual({ form: "sum", amount: { v: 10 }, every: 3 });
    const action: Price = { form: "action", rate: { v: 0.1, src }, min: { v: 15, src }, max: { v: 100, src } };
    expect(withCurrency(action, "ILS")).toBe(action);
    expect(withCurrency(action, "USD")).toEqual({ form: "action", rate: { v: 0.1 }, min: { v: 15 }, max: { v: 100 }, currency: "USD" });
    expect(withForm(action, "held")).toEqual({ form: "held", rate: { v: 0.1 }, per: 12, every: 12 });
    expect(withForm(sum, "perAction")).toEqual({ form: "perAction", amount: { v: 10 } });
    // and so a fee a template filled, changed only this way, is no longer as the template left it
    const fee: Fee = { ...newFee("balance"), stages: [{ price: held }] };
    expect(untouched(fee)).toBe(true);
    expect(untouched(editPrice(fee, "buy", 0, (x) => withMonths(x, "every", 3)))).toBe(false);
  });

  it("a later price comes after the month the one before it ends, its figure blank until typed; a free price is followed by the fee's usual form", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" } }] };
    const two = addLater(fee, "buy", "2028-03");
    expect(two.stages).toEqual([{ price: { form: "free" }, until: "2028-03" }, { price: blankPrice("held") }]);
    expect(feeInOrder(two)).toBe(true);
    expect(feePriced(two, "2026-11")).toBe(false);
    const priced = editPrice(two, "buy", 1, (p) => withFigure(p, "rate", 0.4));
    expect(feePriced(priced, "2026-11")).toBe(true);
    // a priced price is followed by one of its own form
    const three = addLater(priced, "buy", "2030-01");
    expect(three.stages[2]!.price).toEqual(blankPrice("held"));
    const back = removeStage(priced, "buy", 1);
    expect(back.stages).toEqual([{ price: { form: "free" } }]);
    expect(removeStage(back, "buy", 0)).toBe(back);
  });
  it("a chain of prices made by \"עד מתי\": free until a month, then a price asked for, then another for a limited time", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" } }] };
    // "לזמן מוגבל" on the only price, with its month: the next price follows, asking for its price, never a hidden free one
    const two = setLimited(fee, "buy", 0, "2028-03");
    expect(two.stages).toEqual([{ price: { form: "free" }, until: "2028-03" }, { price: blankPrice("held") }]);
    expect(feePriced(two, "2026-11")).toBe(false);
    const priced = editPrice(two, "buy", 1, (p) => withFigure(p, "rate", 0.4));
    expect(feePriced(priced, "2026-11")).toBe(true);
    expect(feeInOrder(priced)).toBe(true);
    // "לזמן מוגבל" on the next one continues the chain the same way
    const three = setLimited(priced, "buy", 1, "2030-01");
    expect(three.stages.map((s) => s.until)).toEqual(["2028-03", "2030-01", undefined]);
    expect(three.stages[2]!.price).toEqual(blankPrice("held"));
    // a price before others moves only its end
    const moved = setLimited(three, "buy", 0, "2028-06");
    expect(moved.stages.map((s) => s.until)).toEqual(["2028-06", "2030-01", undefined]);
    expect(moved.stages).toHaveLength(3);
  });
  it("\"כל הזמן\" on a price takes away the prices after it; they go without an undo only where they hold nothing the person gave", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" } }] };
    const two = setLimited(fee, "buy", 0, "2028-03");
    expect(laterUntouched(two, "buy", 0)).toBe(true);
    expect(holdOn(two, "buy", 0).stages).toEqual([{ price: { form: "free" } }]);
    const priced = editPrice(two, "buy", 1, (p) => withFigure(p, "rate", 0.4));
    expect(laterUntouched(priced, "buy", 0)).toBe(false);
    const bounded = editPrice(two, "buy", 1, (p) => withFigure(p, "min", 5));
    expect(laterUntouched(bounded, "buy", 0)).toBe(false);
    // a choice with no figure holds something too: another form, another period, a month of its own
    expect(laterUntouched(editPrice(two, "buy", 1, (p) => withForm(p, "sum")), "buy", 0)).toBe(false);
    expect(laterUntouched(editPrice(two, "buy", 1, (p) => withMonths(p, "every", 3)), "buy", 0)).toBe(false);
    expect(laterUntouched(setLimited(two, "buy", 1, "2030-01"), "buy", 0)).toBe(false);
    // a figure typed and emptied again holds nothing
    expect(laterUntouched(editPrice(priced, "buy", 1, (p) => withFigure(p, "rate", null)), "buy", 0)).toBe(true);
    const three = setLimited(priced, "buy", 1, "2030-01");
    expect(holdOn(three, "buy", 1).stages).toEqual([{ price: { form: "free" }, until: "2028-03" }, priced.stages[1]]);
    expect(laterUntouched(three, "buy", 1)).toBe(true);
    expect(laterUntouched(three, "buy", 0)).toBe(false);
    // the last price is already held on
    expect(holdOn(three, "buy", 2)).toEqual(three);
  });
  it("a currency chosen for a later price's bounds holds something", () => {
    const fee = setLimited({ ...newFee("trade"), stages: [{ price: { form: "free" } }] }, "buy", 0, "2028-03");
    expect(laterUntouched(fee, "buy", 0)).toBe(true);
    expect(laterUntouched(editPrice(fee, "buy", 1, (p) => withCurrency(p, "USD")), "buy", 0)).toBe(false);
  });
  it("taking a middle price away joins its neighbours: the price before it runs until its end, the next starts where it did", () => {
    const fee: Fee = {
      ...newFee("custody"),
      stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.2), per: 12, every: 12 }, until: "2030-01" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }],
    };
    const joined = removeStage(fee, "buy", 1);
    expect(joined.stages).toEqual([{ price: { form: "free" }, until: "2030-01" }, fee.stages[2]]);
    expect(feeInOrder(joined)).toBe(true);
    // the last taken away leaves the one before it held on
    expect(removeStage(fee, "buy", 2).stages).toEqual([fee.stages[0], { price: fee.stages[1]!.price }]);
    expect(setUntil(fee, "buy", 1, null).stages[1]).toEqual({ price: fee.stages[1]!.price });
  });
  it("the sale's own prices make their chain the same way", () => {
    const fee = setSaleApart({ ...newFee("trade"), stages: [{ price: { form: "free" } }] }, true);
    const two = setLimited(fee, "sell", 0, "2028-03");
    expect(two.stages).toEqual([{ price: { form: "free" } }]);
    expect(two.sale).toEqual([{ price: { form: "free" }, until: "2028-03" }, { price: blankPrice("action") }]);
    expect(holdOn(two, "sell", 0).sale).toEqual([{ price: { form: "free" } }]);
  });
  it("a rate emptied is blank again, and a blank rate stays blank through a change of terms", () => {
    const fee = editPrice(newFee("trade"), "buy", 0, (p) => withFigure(p, "rate", 0.1));
    expect(feePriced(fee, "2026-11")).toBe(true);
    const emptied = editPrice(fee, "buy", 0, (p) => withFigure(p, "rate", null));
    expect(feePriced(emptied, "2026-11")).toBe(false);
    expect(feePriced(editPrice(emptied, "buy", 0, (p) => withCurrency(p, "USD")), "2026-11")).toBe(false);
    expect(feePriced(editPrice(emptied, "buy", 0, (p) => withForm(p, "free")), "2026-11")).toBe(true);
    expect(feePriced(editPrice(emptied, "buy", 0, (p) => withFigure(p, "rate", 0)), "2026-11")).toBe(true);
  });

  it("a sale priced apart starts as a copy of the purchase, and edits only itself", () => {
    const fee = editPrice(newFee("trade"), "buy", 0, (p) => withFigure(p, "rate", 0.1));
    const apart = setSaleApart(fee, true);
    const sold = editPrice(apart, "sell", 0, (p) => withFigure(p, "rate", 0.2));
    expect(sold.stages[0]!.price).toEqual({ form: "action", rate: { v: 0.1 } });
    expect(sold.sale![0]!.price).toEqual({ form: "action", rate: { v: 0.2 } });
    expect(setSaleApart(sold, false).sale).toBeUndefined();
  });

  it("a deal's kind, what it holds and its start", () => {
    const { deal } = addFee(setHeld(newDeal("brokerage-account"), { place: "abroad", currency: "USD", payout: "accumulating" }), "trade");
    expect(deal.fees.map((f) => f.kind)).toEqual(["trade"]);
    expect(setKind(deal, "ira-provident").held).toEqual(deal.held);
    const pension = setKind(deal, "pension-comprehensive");
    expect(pension.held).toBeUndefined();
    expect(pension.fees).toEqual(deal.fees);
    expect(setStart(setStart(deal, "2026-03"), null).start).toBeUndefined();
  });
});

describe("what a fund-holding deal holds, chosen one fact at a time", () => {
  it("holds nothing until all three facts are chosen, then holds them, and each later choice changes it at once", () => {
    let r = pickHeld({}, { place: "abroad" });
    expect(r).toEqual({ draft: { place: "abroad" }, held: null });
    r = pickHeld(r.draft, { currency: "USD" });
    expect(r.held).toBeNull();
    r = pickHeld(r.draft, { payout: "accumulating" });
    expect(r.held).toEqual({ place: "abroad", currency: "USD", payout: "accumulating" });
    expect(pickHeld(r.held!, { place: "israel" }).held).toEqual({ place: "israel", currency: "USD", payout: "accumulating" });
  });
});
