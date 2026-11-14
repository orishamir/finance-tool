import { describe, expect, it } from "vitest";
import type { FeeBase, ProductId } from "@finance-tool/schema";
import type { DealKind } from "./kinds";
import { feeInOrder, feePriced, newDeal, newFee, typed, untouched, type Fee, type Num, type Price } from "./model";
import { addFee, setKind, setPick } from "./edits/deal";
import { changeUntouched, editPrice, moveChange, removeChange, setSaleApart, setUntil, splitAt } from "./edits/stage";
import { setFigure, figureOf, withCurrency, withFigure, withMonths } from "./edits/price";
import { withForm } from "./offers/parts";

/** A kind with the bases its record lists, for the edits that read them. */
const BASES: Partial<Record<ProductId, FeeBase[]>> = { "ira-provident": ["balance", "trade", "custody", "fx", "direct_expenses"], "pension-comprehensive": ["deposit", "balance", "direct_expenses", "insurance_premium"] };
const kindOf = (id: ProductId): DealKind => ({ id, name: id, bases: BASES[id] ?? [], caps: {}, regulator: "" });

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

  it("a change of price added by its month splits the price in force then, both halves its price, the later a copy", () => {
    const free: Fee = { ...newFee("fixed_period"), stages: [{ price: { form: "free" } }] };
    const two = splitAt(free, "buy", "2027-01");
    expect(two.stages).toEqual([{ price: { form: "free" }, until: "2027-01" }, { price: { form: "free" } }]);
    expect(feeInOrder(two)).toBe(true);
    // free, then a sum: the later price changed in place, as any price
    const sum = editPrice(two, "buy", 1, (p) => withForm(p, "sum"));
    expect(sum.stages[1]!.price.form).toBe("sum");
    // a month inside a period splits that period, the earlier keeping its end, the later the old end
    const three = splitAt(sum, "buy", "2026-06");
    expect(three.stages.map((x) => [x.price.form, x.until])).toEqual([["free", "2026-06"], ["free", "2027-01"], ["sum", undefined]]);
    const four = splitAt(three, "buy", "2028-01");
    expect(four.stages.map((x) => [x.price.form, x.until])).toEqual([["free", "2026-06"], ["free", "2027-01"], ["sum", "2028-01"], ["sum", undefined]]);
    // a month the prices change in already, or no month, changes nothing
    expect(splitAt(three, "buy", "2027-01")).toBe(three);
    expect(splitAt(three, "buy", "2027-13")).toBe(three);
    // a sum then free reads the same way
    const paid: Fee = { ...newFee("fixed_period"), stages: [{ price: { form: "sum", amount: typed(20), every: 1 } }] };
    const ends = editPrice(splitAt(paid, "buy", "2028-01"), "buy", 1, () => ({ form: "free" }));
    expect(ends.stages).toEqual([{ price: { form: "sum", amount: typed(20), every: 1 }, until: "2028-01" }, { price: { form: "free" } }]);
  });
  it("a change's month moves only between its neighbours, so the prices stay in order", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.2), per: 12, every: 12 }, until: "2030-01" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] };
    expect(moveChange(fee, "buy", 0, "2029-01").stages.map((x) => x.until)).toEqual(["2029-01", "2030-01", undefined]);
    expect(moveChange(fee, "buy", 1, "2028-04").stages.map((x) => x.until)).toEqual(["2028-03", "2028-04", undefined]);
    // a month that would pass a neighbour, or meet it, is refused
    expect(moveChange(fee, "buy", 0, "2030-01")).toBe(fee);
    expect(moveChange(fee, "buy", 0, "2031-01")).toBe(fee);
    expect(moveChange(fee, "buy", 1, "2028-03")).toBe(fee);
    expect(moveChange(fee, "buy", 1, "2027-01")).toBe(fee);
    // the last price has no change after it
    expect(moveChange(fee, "buy", 2, "2032-01")).toBe(fee);
  });
  it("a change taken away merges the later price back into the earlier, which holds on to where the later ended", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.2), per: 12, every: 12 }, until: "2030-01" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] };
    expect(removeChange(fee, "buy", 0).stages).toEqual([{ price: { form: "free" }, until: "2030-01" }, fee.stages![2]]);
    expect(removeChange(fee, "buy", 1).stages).toEqual([fee.stages![0], { price: fee.stages![1]!.price }]);
    expect(removeChange(fee, "buy", 2)).toBe(fee);
    // a later price still the earlier's copy changes nothing, and goes without an undo; one changed does not
    const copied = splitAt(fee, "buy", "2031-01");
    expect(changeUntouched(copied, "buy", 2)).toBe(true);
    expect(changeUntouched(editPrice(copied, "buy", 3, (p) => withFigure(p, "rate", 0.5)), "buy", 2)).toBe(false);
  });
  it("a price's end taken away leaves it with no end", () => {
    const fee: Fee = {
      ...newFee("custody"),
      stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.2), per: 12, every: 12 }, until: "2030-01" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }],
    };
    expect(setUntil(fee, "buy", 1, null).stages[1]).toEqual({ price: fee.stages![1]!.price });
  });
  it("the sale's own prices change with time the same way", () => {
    const fee = setSaleApart({ ...newFee("trade"), stages: [{ price: { form: "free" } }] }, true);
    const two = splitAt(fee, "sell", "2028-03");
    expect(two.stages).toEqual([{ price: { form: "free" } }]);
    expect(two.sale).toEqual([{ price: { form: "free" }, until: "2028-03" }, { price: { form: "free" } }]);
    expect(removeChange(two, "sell", 0).sale).toEqual([{ price: { form: "free" } }]);
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

  it("a figure put back as it stood keeps its source, and none takes a bound away or leaves a rate blank", () => {
    const src = { url: "https://www.example.org/t.pdf", title: "t", publisher: "p", strength: "institution" as const, checked: "2026-10-01" };
    const p: Price = { form: "action", rate: { v: 0.25, src }, min: typed(15) };
    const typedOver = withFigure(p, "rate", 0.3);
    expect(setFigure(typedOver, "rate", figureOf(p, "rate"))).toEqual(p);
    expect(setFigure(p, "min", undefined)).toEqual({ form: "action", rate: { v: 0.25, src } });
    expect(setFigure(p, "rate", undefined)).toEqual({ ...p, rate: { v: 0, blank: true } });
    expect(figureOf({ form: "free" }, "rate")).toBeUndefined();
  });
  it("a sale priced apart starts as a copy of the purchase, and edits only itself", () => {
    const fee = editPrice(newFee("trade"), "buy", 0, (p) => withFigure(p, "rate", 0.1));
    const apart = setSaleApart(fee, true);
    const sold = editPrice(apart, "sell", 0, (p) => withFigure(p, "rate", 0.2));
    expect(sold.stages[0]!.price).toEqual({ form: "action", rate: { v: 0.1 } });
    expect(sold.sale![0]!.price).toEqual({ form: "action", rate: { v: 0.2 } });
    expect(setSaleApart(sold, false).sale).toBeUndefined();
  });

  it("a deal's kind and the reading's picks", () => {
    const { deal } = addFee(setPick(newDeal("brokerage-account"), "what", "us"), "trade");
    expect(deal.fees.map((f) => f.kind)).toEqual(["trade"]);
    expect(setKind(deal, kindOf("ira-provident")).readFor).toEqual([{ by: "what", is: "us" }]);
    const pension = setKind(deal, kindOf("pension-comprehensive"));
    expect(pension.fees).toEqual([]);
    expect(setPick(setPick(deal, "what", "europe"), "track", "Tiered").readFor).toEqual([{ by: "what", is: "europe" }, { by: "track", is: "Tiered" }]);
    expect(setPick(deal, "what", null).readFor).toBeUndefined();
  });
});
