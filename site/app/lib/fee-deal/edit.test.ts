import { describe, expect, it } from "vitest";
import { feeInOrder, newDeal, newFee, type Fee, type Num } from "./model";
import { addFee, addStage, editPrice, removeStage, setHeld, setKind, setSaleApart, setStart, setUntil, withCurrency, withFigure, withForm, withMonths } from "./edit";

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

  it("a stage added waits for the month the one before it ends; given it, the fee is read again", () => {
    const fee: Fee = { ...newFee("custody"), stages: [{ price: { form: "free" } }] };
    const two = addStage(fee, "buy");
    expect(two.stages).toHaveLength(2);
    expect(feeInOrder(two)).toBe(false);
    const dated = setUntil(two, "buy", 0, "2028-03");
    expect(feeInOrder(dated)).toBe(true);
    const back = removeStage(dated, "buy", 1);
    expect(back.stages).toEqual([{ price: { form: "free" } }]);
    expect(removeStage(back, "buy", 0)).toBe(back);
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
