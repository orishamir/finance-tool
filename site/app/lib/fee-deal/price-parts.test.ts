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
import { feePriced, newDeal, readDeal, typed, type Fee, type FeeDeal, type Num, type Price } from "./model";
import { enginePrice } from "./to-engine";
import { readDealFor, type PartMark } from "./parts";
import { readingOf, UNIT_PRICE_KEY } from "./reading";
import { curveHead } from "./reading-heads";
import { FEE_SHAPES } from "./shapes";
import { fillDeal, houseName, templateOf, templateOptions } from "./templates";
import { feeDeal as copy } from "../../copy";

const data = feesData();
const TODAY = "2026-11-12";
const read = (deal: FeeDeal) => readDealFor(deal, data.kinds, TODAY);
const v = (x: SiteValue | null | undefined) => x?.value as number;
const src: Num["src"] = { url: "https://example.org/list.pdf", title: "list", publisher: "house", strength: "institution", checked: "2026-11-12" };

const account = (fees: Fee[], what = "us"): FeeDeal => ({ ...newDeal("brokerage-account"), readFor: [{ by: "what", is: what }], fees });
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
    expect(kept.fees[0]!.stages![0]!.price).toEqual(asked);
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
  it("judges the price charged, after its discount, and without a third party's fee (F-113, F-116, F-117)", () => {
    const half = { pct: typed(50) };
    // a rate of 0.4% with half off is 0.2%, below a cap of 0.3%
    expect(inCapUnit({ form: "action", rate: typed(0.4), discount: half }, "pct_of_trade", 0.3)).toEqual({ x: 0.2, converted: false });
    expect(inCapUnit({ form: "perAction", amount: typed(10), discount: { pct: typed(100) } }, "nis_per_trade", 0)).toEqual({ x: 0, converted: false });
    // against a cap of 0: the rate and the minimum the discount leaves, and a third party's fee charges nothing of the provider's
    expect(inCapUnit({ form: "action", rate: typed(0.2), discount: half }, "pct_of_deposit", 0)).toEqual({ x: 0.1, converted: false });
    expect(inCapUnit({ form: "action", rate: typed(0), min: typed(10), discount: { pct: typed(50), alsoMin: true } }, "pct_of_deposit", 0)).toEqual({ x: 5, converted: false });
    expect(inCapUnit({ form: "action", rate: typed(0), third: { price: { form: "action", rate: typed(0.1), min: typed(3) } } }, "pct_of_deposit", 0)).toEqual({ x: 0, converted: false });
    expect(inCapUnit({ form: "perAction", amount: typed(0), third: { price: { form: "perAction", amount: typed(3) } } }, "nis_per_trade", 0)).toEqual({ x: 0, converted: false });
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
  /** The deal a house's whole list fills, read for some picks: each fee's price in the case they give it. */
  const filledFor = (id: string, picks: { by: string; is: string }[]) => {
    const deal = { ...fillDeal(newDeal("brokerage-account"), `house:${id}`, data, TODAY)!, readFor: picks };
    const r = read(deal);
    return (kind: string) => r.fees.find((f) => f.kind === kind)?.stages[0]!.price;
  };
  it("fill a bank's whole list, the trade by what is bought and by channel, with its percent maximum and its flat price for a small conversion, sourced", () => {
    const price = filledFor("mizrahi-tefahot", [{ by: "what", is: "us" }, { by: "channel", is: "direct" }]);
    const t = price("trade")!;
    expect(t).toMatchObject({ form: "action", rate: { v: 0.3 }, min: { v: 25 }, max: { v: 6750 }, cap: { v: 25 }, currency: "USD" });
    if (t.form === "action") expect(t.cap!.src).toBeDefined();
    expect(price("fx")).toMatchObject({ form: "action", flat: { amount: { v: 2.85 }, upTo: { v: 50 } }, currency: "USD" });
    expect(filledFor("mizrahi-tefahot", [{ by: "what", is: "tase" }, { by: "channel", is: "branch" }])("trade")).toMatchObject({ rate: { v: 0.64 }, min: { v: 50 } });
    // what stays out is a plan's own line (a redemption) and the fees a template does not fill
    expect(new Set(house("mizrahi-tefahot").left.map((l) => l.why))).toEqual(new Set(["plan", "other-base"]));
  });
  it("fill One Zero's 50 $ for each corporate event as a sum per action in dollars, on what is bought abroad alone", () => {
    const event = house("one-zero").fees.find((f) => f.kind === "corporate_event")!;
    expect(event.by).toEqual([{ kind: "what" }]);
    expect(event.cases!.map((c) => c.when)).toEqual([[["us", "europe", "world"]]]);
    expect(event.cases![0]!.stages[0]!.price).toMatchObject({ form: "perAction", amount: { v: 50 }, currency: "USD" });
    expect(filledFor("one-zero", [{ by: "what", is: "us" }])("corporate_event")).toMatchObject({ amount: { v: 50 } });
    // a reading on the Tel Aviv exchange reads no price for it: the line prices foreign securities alone
    const tase = read({ ...fillDeal(newDeal("brokerage-account"), "house:one-zero", data, TODAY)!, readFor: [{ by: "what", is: "tase" }] });
    expect(tase.fees.some((f) => f.kind === "corporate_event")).toBe(false);
    expect(tase.unmatched).toEqual([tase.deal.fees.find((f) => f.kind === "corporate_event")!.id]);
  });
  it("fill a base read from one line as a fee whose price changes by nothing only where the line prices every value", () => {
    // Excellence's custody line names the account: every value
    expect(house("excellence").fees.find((f) => f.kind === "custody")!.cases).toBeUndefined();
    // Interactive Israel's custody line names foreign securities alone: the fee keeps what is held, with one case for them
    const custody = house("interactive-israel").fees.find((f) => f.kind === "custody")!;
    expect(custody.by).toEqual([{ kind: "held" }]);
    expect(custody.cases!.map((c) => c.when)).toEqual([[["us", "europe", "world"]]]);
  });
  it("read a mutual fund in F-63's line, the standard one over a banded one, and the band for traditional funds as a value of its own", () => {
    // Excellence: a mutual fund reads its exchange line, 0.4% with at least 10 ₪; the 16 ₪ line is "קרנות נאמנות מסורתיות"
    expect(filledFor("excellence", [{ by: "what", is: "mutualFunds" }])("trade")).toMatchObject({ form: "action", rate: { v: 0.4 }, min: { v: 10 } });
    const trade = house("excellence").fees.find((f) => f.kind === "trade")!;
    expect(trade.by![0]).toEqual({ kind: "what", own: [{ name: "קרנות נאמנות מסורתיות", place: "israel", currency: "ILS" }] });
    expect(filledFor("excellence", [{ by: "what", is: "קרנות נאמנות מסורתיות" }])("trade")).toMatchObject({ form: "perAction", amount: { v: 16 } });
    // IBI: a mutual fund, tracking or not, reads the mutual-fund line's 5 ₪ minimum, not the exchange's 2.35 ₪
    expect(filledFor("ibi", [{ by: "what", is: "mutualFunds" }])("trade")).toMatchObject({ rate: { v: 0.08 }, min: { v: 5 } });
    expect(copy.cases.values.what.mutualFunds).toBe("קרנות נאמנות");
  });
  it("read IBI's line outside the United States, Canada and Israel for Europe and a value of its own, never for the rest of the world", () => {
    const band = "מסחר בשווקים נוספים, מחוץ לארה״ב, לקנדה ולישראל";
    const trade = house("ibi").fees.find((f) => f.kind === "trade")!;
    expect(trade.by![0]).toEqual({ kind: "what", own: [{ name: band, place: "abroad", currency: null }] });
    expect(filledFor("ibi", [{ by: "what", is: "europe" }])("trade")).toMatchObject({ rate: { v: 0.3 }, min: { v: 30 } });
    expect(filledFor("ibi", [{ by: "what", is: band }])("trade")).toMatchObject({ rate: { v: 0.3 }, min: { v: 30 } });
    // the rest of the world holds Canada, which the line leaves out
    expect(filledFor("ibi", [{ by: "what", is: "world" }])("trade")).toBeUndefined();
    // a value of its own abroad, in a currency it does not name, puts a conversion on a purchase (F-111)
    expect(read({ ...fillDeal(newDeal("brokerage-account"), "house:ibi", data, TODAY)!, readFor: [{ by: "what", is: band }] }).engine.foreign).toBe(true);
  });
  it("name a house by the id of one of its ways to buy, which a deal saved before cases may hold", () => {
    expect(houseName("house:interactive-brokers/interactive-brokers-buy-sell-us-fixed", data)).toBe("Interactive Brokers");
    expect(houseName("house:interactive-brokers", data)).toBe("Interactive Brokers");
    expect(houseName("house:nobody/line", data)).toBeNull();
  });
  it("list the house alone in the picker, its plans tracks inside its trade fee, and convert as F-63 does", () => {
    const ib = templateOptions("brokerage-account", data, TODAY).find((o) => o.id === "house:interactive-brokers")!;
    expect(ib).toEqual({ id: "house:interactive-brokers", name: "Interactive Brokers", source: "house" });
    const trade = house("interactive-brokers").fees.find((f) => f.kind === "trade")!;
    expect(trade.by?.map((b) => b.kind)).toEqual(["what", "track"]);
    expect(new Set(trade.cases!.map((c) => (c.when[1] as string[])[0]))).toEqual(new Set(["IBKR Pro - Fixed", "IBKR Pro - Tiered"]));
    const fixed = filledFor("interactive-brokers", [{ by: "what", is: "us" }, { by: "track", is: "IBKR Pro - Fixed" }]);
    expect(fixed("trade")).toMatchObject({ form: "perUnit", amount: { v: 0.005 }, cap: { v: 1 } });
    expect(filledFor("interactive-brokers", [{ by: "what", is: "europe" }, { by: "track", is: "IBKR Pro - Tiered" }])("trade")).toMatchObject({ form: "action", rate: { v: 0.05 }, min: { v: 1.7 }, max: { v: 39 } });
    // the automatic conversion's markup is not counted (D65), and the spot conversion stays out, since F-63 converts by the automatic one
    expect(templateOf(newDeal("brokerage-account"), "house:interactive-brokers", data, TODAY)!.left).toEqual([
      { line: "interactive-brokers-fx-spot", why: "another-line" },
      { line: "interactive-brokers-fx-auto-conversion", why: "spread-unpriced" },
    ]);
    expect(templateOf(newDeal("brokerage-account"), "house:interactive-brokers/no-such-line", data, TODAY)).toBeNull();
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
    const fee = data.houses.find((h) => h.id === "mizrahi-tefahot")!.fees.find((f) => f.kind === "fx")!;
    const fx = fee.cases![0]!.stages![0]!.price;
    const page = fx.form === "action" ? fx.rate.src?.page : undefined;
    expect(page).toBeGreaterThan(0);
    const d = account([{ id: "fee-fx", kind: "fx", stages: [{ price: fx }] }]);
    expect(readDeal(JSON.parse(JSON.stringify(d)))!.fees[0]!.stages![0]!.price).toEqual(fx);
    expect(decodeDeal(encodeDeal(d))!.fees[0]!.stages![0]!.price).toEqual(fx);
    const shown = readingOf(read(d), data.fx).periods[0]!.rows[0]!.price.figures.rate!;
    expect((shown.source as { page?: number }).page).toBe(page);
  });
});
