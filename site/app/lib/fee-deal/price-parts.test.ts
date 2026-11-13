// The deal's price parts beyond a rate and its bounds (method F-12, F-13, F-103, F-112): a percent maximum, a flat price for a small
// action, a sum per unit and a sum per action in another currency, as the device keeps them, as the screen edits them, as the templates
// fill them from the site's price lists, and as the reading states them on 11.2026.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { nisPerNumber } from "../fx";
import type { SiteValue } from "../value";
import { withCurrency, withFigure, withFlat, withForm, figureOf, figureBack } from "./edit";
import { glance } from "./glance";
import { inCapUnit, standingOf } from "./kinds";
import { decodeDeal, encodeDeal } from "./link";
import { enginePrice, feePriced, newDeal, readDeal, typed, type Fee, type FeeDeal, type Num, type Price } from "./model";
import { readDealFor, type PartMark } from "./parts";
import { readingOf, UNIT_PRICE_KEY } from "./reading";
import { curveHead } from "./reading-heads";
import { FEE_SHAPES } from "./shapes";
import { fillDeal, templateOf, templateOptions } from "./templates";

const data = feesData();
const TODAY = "2026-11-12";
const read = (deal: FeeDeal) => readDealFor(deal, data.kinds, TODAY);
const v = (x: SiteValue | null | undefined) => x?.value as number;
const src: Num["src"] = { url: "https://example.org/list.pdf", title: "list", publisher: "house", strength: "institution", checked: "2026-11-12" };

const account = (fees: Fee[], currency = "USD"): FeeDeal => ({ ...newDeal("brokerage-account"), held: { place: "abroad", currency, payout: "accumulating" }, fees });
const trade = (price: Price): Fee => ({ id: "fee-trade", kind: "trade", stages: [{ price }] });
const fx = (price: Price): Fee => ({ id: "fee-fx", kind: "fx", stages: [{ price }] });

/** Mizrahi-Tefahot's direct line abroad: 0.3%, at least 25 $, at most 6,750 $, at most 25% of the action. */
const mizrahi: Price = { form: "action", rate: typed(0.3), min: typed(25), max: typed(6750), cap: typed(25), currency: "USD" };
/** Its conversion in the internet service: 0.133%, at least 5.4 $, at most 2,250 $, and 2.85 $ for a conversion up to 50 $. */
const mizrahiFx: Price = { form: "action", rate: typed(0.133), min: typed(5.4), max: typed(2250), flat: { amount: typed(2.85), upTo: typed(50) }, currency: "USD" };
/** Interactive Brokers, IBKR Pro Fixed, US: 0.005 $ a unit, at least 1 $, at most 1% of the action. */
const ibFixed: Price = { form: "perUnit", amount: typed(0.005), min: typed(1), cap: typed(1), currency: "USD" };

describe("the price parts as the device keeps them", () => {
  it("gives the trade fee a sum per unit, a percent maximum and a flat price, and the conversion a flat price but no percent maximum", () => {
    expect(FEE_SHAPES.trade.forms).toContain("perUnit");
    expect(FEE_SHAPES.trade.fields.action).toEqual(expect.arrayContaining(["cap", "flat"]));
    expect(FEE_SHAPES.trade.fields.perUnit).toEqual(["amount", "min", "max", "cap", "flat", "currency"]);
    expect(FEE_SHAPES.fx.fields.action).toContain("flat");
    expect(FEE_SHAPES.fx.fields.action).not.toContain("cap");
    expect(FEE_SHAPES.corporate_event.fields.perAction).toContain("currency");
  });
  it("reads them back as written, through the device and a link, and refuses a part the fee has no field for", () => {
    const d = account([trade(ibFixed), fx(mizrahiFx), { id: "fee-event", kind: "corporate_event", stages: [{ price: { form: "perAction", amount: { v: 50, src }, currency: "USD" } }] }]);
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
    const linked = decodeDeal(encodeDeal(d))!;
    expect(linked.fees.map(({ id: _id, ...f }) => f)).toEqual(d.fees.map(({ id: _id, ...f }) => f));
    // a cap on a conversion, and a sum per event in dollars on a transfer out, are no fields of theirs
    expect(readDeal({ ...d, fees: [fx({ ...mizrahiFx, cap: typed(25) } as Price)] })).toBeNull();
    expect(readDeal({ ...d, fees: [{ id: "fee-out", kind: "transfer_out", stages: [{ price: { form: "perAction", amount: typed(5), currency: "USD" } }] }] })).toBeNull();
    // a flat price's figures may be blank, and the price then states no price yet
    const asked: Price = { ...mizrahiFx, flat: { amount: { v: 0, blank: true }, upTo: typed(50) } } as Price;
    const kept = readDeal({ ...d, fees: [fx(asked)] })!;
    expect(kept.fees[0]!.stages[0]!.price).toEqual(asked);
    expect(feePriced(kept.fees[0]!, "2026-11")).toBe(false);
    expect(read(kept).unpriced).toEqual(["fee-fx"]);
  });
  it("turns a percent maximum into a fraction, and carries the currency of a flat price, a sum per unit and a sum per action", () => {
    expect(enginePrice(mizrahi)).toEqual({ kind: "action", rate: 0.003, min: 25, max: 6750, cap: 0.25, currency: "USD" });
    expect(enginePrice(mizrahiFx)).toEqual({ kind: "action", rate: 0.00133, min: 5.4, max: 2250, flat: { amount: 2.85, upTo: 50 }, currency: "USD" });
    expect(enginePrice({ form: "action", rate: typed(0), flat: { amount: typed(4), upTo: typed(30000) } })).toEqual({ kind: "action", rate: 0, flat: { amount: 4, upTo: 30000 } });
    expect(enginePrice(ibFixed)).toEqual({ kind: "perUnit", amount: 0.005, min: 1, cap: 0.01, currency: "USD" });
    expect(enginePrice({ form: "perAction", amount: typed(50), currency: "USD" })).toEqual({ kind: "perAction", amount: 50, currency: "USD" });
  });
  it("judges no sum per unit and no sum per action in dollars against a cap in shekels or in percent", () => {
    const kind = data.kinds.find((k) => k.id === "brokerage-account")!;
    expect(standingOf(kind, "trade", ibFixed, "bank")).toMatchObject({ judged: false });
    expect(inCapUnit({ form: "perAction", amount: typed(5) }, "nis_per_transfer", 20)).toEqual({ x: 5, converted: false });
    expect(inCapUnit({ form: "perAction", amount: typed(5), currency: "USD" }, "nis_per_transfer", 20)).toBeUndefined();
    expect(inCapUnit(ibFixed, "pct_of_trade", 1)).toBeUndefined();
  });
});

describe("the price parts as the screen edits them", () => {
  it("types, empties and puts back a percent maximum and a flat price's figures", () => {
    const p: Price = { form: "action", rate: { v: 0.3, src }, cap: { v: 25, src } };
    expect(withFigure(p, "cap", 25)).toEqual(p);
    expect(withFigure(p, "cap", 20)).toEqual({ ...p, cap: { v: 20 } });
    expect(withFigure(p, "cap", null)).toEqual({ form: "action", rate: { v: 0.3, src } });
    const on = withFlat(p, true);
    expect(on).toEqual({ ...p, flat: { amount: { v: 0, blank: true }, upTo: { v: 0, blank: true } } });
    const typedIn = withFigure(withFigure(on, "flat", 2.85), "upTo", 50);
    expect(typedIn).toEqual({ ...p, flat: { amount: { v: 2.85 }, upTo: { v: 50 } } });
    expect(withFigure(typedIn, "upTo", null)).toEqual({ ...p, flat: { amount: { v: 2.85 }, upTo: { v: 0, blank: true } } });
    expect(figureOf(typedIn, "flat")).toEqual({ v: 2.85 });
    expect(figureBack(typedIn, "cap", undefined)).toEqual({ form: "action", rate: { v: 0.3, src }, flat: { amount: { v: 2.85 }, upTo: { v: 50 } } });
    expect(withFlat(typedIn, false)).toEqual(p);
    // a flat price's figure on a price with none, and a cap on a sum per period, change nothing
    expect(withFigure(p, "flat", 3)).toEqual(p);
    expect(withFigure({ form: "sum", amount: typed(10), every: 1 }, "cap", 3)).toEqual({ form: "sum", amount: typed(10), every: 1 });
  });
  it("keeps the bounds, the percent maximum, the flat price and their currency between a share of an action and a sum per unit, as the person's", () => {
    const filled: Price = { form: "action", rate: { v: 0.3, src }, min: { v: 1, src }, cap: { v: 1, src }, currency: "USD" };
    expect(withForm(filled, "perUnit")).toEqual({ form: "perUnit", amount: { v: 0, blank: true }, min: { v: 1 }, cap: { v: 1 }, currency: "USD" });
    expect(withForm(ibFixed, "action")).toEqual({ form: "action", rate: { v: 0, blank: true }, min: { v: 1 }, cap: { v: 1 }, currency: "USD" });
    expect(withForm(ibFixed, "perAction")).toEqual({ form: "perAction", amount: { v: 0, blank: true } });
  });
  it("puts a sum per unit and a sum per action in another currency", () => {
    expect(withCurrency({ form: "perUnit", amount: { v: 0.005, src } }, "USD")).toEqual({ form: "perUnit", amount: { v: 0.005 }, currency: "USD" });
    expect(withCurrency({ form: "perAction", amount: typed(50), currency: "USD" }, "ILS")).toEqual({ form: "perAction", amount: typed(50) });
  });
});

describe("the templates", () => {
  const house = (id: string) => data.houses.find((h) => h.id === id)!;
  it("fill a bank's percent maximum and its flat price for a small conversion, with their sources, and leave out neither", () => {
    const h = house("mizrahi-tefahot").holdings.abroad!;
    const t = h.fees.find((f) => f.kind === "trade")!.stages[0]!.price;
    expect(t).toMatchObject({ form: "action", rate: { v: 0.3 }, min: { v: 25 }, max: { v: 6750 }, cap: { v: 25 }, currency: "USD" });
    if (t.form === "action") expect(t.cap!.src).toBeDefined();
    expect(h.fees.find((f) => f.kind === "fx")!.stages[0]!.price).toMatchObject({ form: "action", flat: { amount: { v: 2.85 }, upTo: { v: 50 } }, currency: "USD" });
    expect(h.left).toEqual([]);
  });
  it("fill One Zero's 50 $ for each corporate event as a sum per action in dollars", () => {
    expect(house("one-zero").holdings.abroad!.fees.find((f) => f.kind === "corporate_event")!.stages[0]!.price).toMatchObject({ form: "perAction", amount: { v: 50 }, currency: "USD" });
  });
  it("list Interactive Brokers' plans, each with its trade price, and fill a deal with the one picked", () => {
    const ib = templateOptions("brokerage-account", data, TODAY, { place: "abroad", currency: "USD", payout: "accumulating" }).find((o) => o.id === "house:interactive-brokers")!;
    expect(ib.source === "house" && ib.plans?.map((p) => p.id)).toEqual([
      "house:interactive-brokers/interactive-brokers-buy-sell-us-fixed",
      "house:interactive-brokers/interactive-brokers-buy-sell-us-tiered",
      "house:interactive-brokers/interactive-brokers-buy-sell-lse-usd-fixed",
      "house:interactive-brokers/interactive-brokers-buy-sell-lse-usd-tiered",
    ]);
    const fixed = ib.source === "house" ? ib.plans![0]! : null;
    expect(fixed!.name).toContain("IBKR Pro - Fixed");
    expect(fixed!.price).toMatchObject({ form: "perUnit", currency: "USD", figures: { amount: { value: 0.005, unit: "usd_per_share", state: "sourced" }, min: { value: 1 }, cap: { value: 1 } } });
    const deal = account([]);
    const filled = fillDeal(deal, fixed!.id, data, TODAY)!;
    expect(filled.fees.find((f) => f.kind === "trade")!.stages[0]!.price).toMatchObject({ form: "perUnit", amount: { v: 0.005 }, cap: { v: 1 } });
    expect(filled.template).toEqual({ id: fixed!.id, name: expect.stringContaining("IBKR Pro - Fixed") });
    // the plan's template leaves out neither the trade nor the other plans: it says the automatic conversion's markup is not counted
    // (D65), and leaves out the spot conversion, since F-63 converts by the automatic one, which charges nothing
    expect(templateOf(deal, fixed!.id, data, TODAY)!.left).toEqual([
      { line: "interactive-brokers-fx-auto-conversion", why: "spread-unpriced" },
      { line: "interactive-brokers-fx-spot", why: "another-line" },
    ]);
    // the house alone fills no trade fee: its list does not say which plan
    expect(templateOf(deal, "house:interactive-brokers", data, TODAY)!.left).toContainEqual({ line: "trade", why: "ambiguous" });
    expect(templateOf(deal, "house:interactive-brokers/no-such-line", data, TODAY)).toBeNull();
  });
  it("list no plans at a house with one way to buy what the deal holds", () => {
    const leumi = templateOptions("brokerage-account", data, TODAY).find((o) => o.id === "house:leumi")!;
    expect(leumi.source === "house" && leumi.plans).toBeUndefined();
  });
});

describe("the reading", () => {
  const marksOf = (d: FeeDeal) => readingOf(read(d), data.fx).statements.flatMap((s) => (s.kind === "mark" && s.mark.kind !== "meet" ? [s.mark as PartMark] : []));
  it("states where the percent maximum decides, and the minimum from where it stops", () => {
    const [cap, min, max] = marksOf(account([trade(mizrahi)]));
    expect(cap).toMatchObject({ kind: "cap", currency: "USD", bound: { value: 25, unit: "pct_of_trade" }, meets: { value: 25, unit: "usd_per_trade" } });
    expect(v(cap!.amount)).toBeCloseTo(100, 10);
    expect(cap!.amount).toMatchObject({ unit: "usd", state: "computed", computed_from: { formula: "F-112" } });
    expect(min).toMatchObject({ kind: "min", from: { value: 100 } });
    expect(v(min!.amount)).toBeCloseTo(8333.33, 2);
    expect(max).toMatchObject({ kind: "max" });
  });
  it("states the flat price's stretch with the figure as filled, and the minimum from there", () => {
    const [flat, min] = marksOf(account([fx(mizrahiFx)]));
    expect(flat).toMatchObject({ kind: "flat", bound: { value: 2.85, unit: "usd_per_trade" }, amount: { value: 50, unit: "usd", state: "entered" } });
    expect(min).toMatchObject({ kind: "min", from: { value: 50, unit: "usd" } });
  });
  it("states a sum per unit's minimum in units, and draws its curve only with the unit's price", () => {
    const d = account([trade(ibFixed)]);
    const [, min] = marksOf(d);
    expect(min).toMatchObject({ kind: "min", units: true, amount: { value: 200, unit: "count" }, rate: { value: 0.005, unit: "usd_per_share" } });
    const without = readingOf(read(d), data.fx);
    expect(without.unitPrice).toEqual({ currency: "USD", value: null });
    expect(without.curves).toEqual([]);
    expect(without.undrawn).toEqual([{ on: "action", action: "trade", side: "all", periods: ["2026-11"], why: "unit-price", currency: "USD" }]);
    const usd = nisPerNumber(data.fx!, "USD")!;
    const r = readingOf(read(d), data.fx, 50);
    expect(r.unitPrice).toMatchObject({ currency: "USD", value: { value: 50, unit: "usd", state: "entered" } });
    expect(r.undrawn).toEqual([]);
    const curve = r.curves[0]!;
    expect(curve.inputs[UNIT_PRICE_KEY]).toMatchObject({ value: 50 });
    // the cap's stretch ends at 100 $, the minimum's at 200 units of 50 $: 10,000 $
    expect(curve.at[0]).toBeCloseTo(100 * usd, 6);
    expect(curve.at[1]).toBeCloseTo(10000 * usd, 6);
    // at 10,000 $ the units' 1 $ is the minimum
    expect(curve.total[curve.amounts.indexOf(curve.at[1]!)]).toBeCloseTo(usd, 6);
    expect(curveHead(curve)).toEqual({ kind: "marks", n: 2 });
  });
  it("gives the summary the rates' sum", () => {
    const g = glance(read(account([trade(mizrahi), fx(mizrahiFx)])));
    expect(v(g.throughout[0]!.rates[0]!.rate)).toBeCloseTo(0.433, 10);
  });
});

describe("a filled figure's source", () => {
  it("carries the page of the price list it stands on, through the device and a link", () => {
    const fx = data.houses.find((h) => h.id === "mizrahi-tefahot")!.holdings.abroad!.fees.find((f) => f.kind === "fx")!.stages[0]!.price;
    const page = fx.form === "action" ? fx.rate.src?.page : undefined;
    expect(page).toBeGreaterThan(0);
    const d = account([{ id: "fee-fx", kind: "fx", stages: [{ price: fx }] }]);
    expect(readDeal(JSON.parse(JSON.stringify(d)))!.fees[0]!.stages[0]!.price).toEqual(fx);
    expect(decodeDeal(encodeDeal(d))!.fees[0]!.stages[0]!.price).toEqual(fx);
    const shown = readingOf(read(d), data.fx).periods[0]!.rows[0]!.price.figures.rate!;
    expect((shown.source as { page?: number }).page).toBe(page);
  });
});
