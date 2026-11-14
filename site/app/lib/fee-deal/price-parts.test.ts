// The deal's price parts beyond a rate and its bounds (method F-12, F-13, F-103, F-112): a percent maximum, a flat price for a small
// action, a sum per unit and a sum per action in another currency, as the device keeps them, as the screen edits them, as the templates
// fill them from the site's price lists, and as the reading states them on 11.2026.
import { describe, expect, it } from "vitest";
import { actionCost, dealMarks, dealPeriods } from "@finance-tool/engine";
import { feesData } from "../fees.server";
import { nisPerNumber } from "../fx";
import type { SiteValue } from "../value";
import { withCurrency, withFigure, withFlat, figureOf, setFigure } from "./edits/price";
import { setPart, withForm } from "./offers/parts";
import { glance } from "./glance";
import { inCapUnit, standingOf } from "./kinds";
import { decodeDeal, encodeDeal } from "./link";
import { feePriced, newDeal, readDeal, typed, untouched, type Fee, type FeeDeal, type Num, type Price } from "./model";
import { engineDeal, enginePrice } from "./to-engine";
import { readDealFor, type FeeMark } from "./deal-read";
import { readingOf, UNIT_PRICE_KEY } from "./reading";
import { curveHead } from "./reading-heads";
import { CAPACITY } from "./offers/capacity";
import { builder } from "./rows";
import { panel } from "./panel";
import { chargesUnfilled, fillDeal, houseName, templateOf, templateOptions } from "./templates";
import { latestSnapshots } from "../providers.server";
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
    expect(CAPACITY.trade.forms).toContain("perUnit");
    expect(CAPACITY.trade.fields.action).toEqual(expect.arrayContaining(["cap", "flat"]));
    expect(CAPACITY.trade.fields.perUnit).toEqual(expect.arrayContaining(["amount", "min", "max", "cap", "flat", "currency"]));
    expect(CAPACITY.fx.fields.action).toContain("flat");
    expect(CAPACITY.fx.fields.action).not.toContain("cap");
    expect(CAPACITY.corporate_event.fields.perAction).toContain("currency");
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
  it("reads a part only where the fee's form lists its field, and the bounds and currency it read before capacity was its limit", () => {
    const d = account([]);
    const one = (kind: Fee["kind"], price: Price) => readDeal({ ...d, fees: [{ id: "fee-x", kind, stages: [{ price }] }] });
    const spread: Price = { form: "action", rate: typed(0.1) };
    // a spread's share lists its rate alone: no percent maximum, no flat price, no sums in the trade's currency
    expect(one("spread", { ...spread, cap: typed(1) } as Price)).toBeNull();
    expect(one("spread", { ...spread, inTrade: true } as Price)).toBeNull();
    expect(one("balance", { form: "held", rate: typed(0.5), per: 12, every: 1, perSecurity: typed(10) } as Price)).toBeNull();
    // bounds and a currency on a share of an action, and bounds on a held share, still read where a deal was saved with them
    expect(one("spread", { ...spread, min: typed(5), currency: "USD" } as Price)).not.toBeNull();
    expect(one("insurance_premium", { form: "held", rate: typed(0.5), per: 12, every: 1, min: typed(5) } as Price)).not.toBeNull();
    // a shekel is the absent currency, on any form
    expect(one("deposit", { ...spread, currency: "ILS" } as Price)!.fees[0]!.stages![0]!.price).toEqual(spread);
  });
  it("puts a part on a price only where the fee's form lists its field", () => {
    const deposit: Fee = { id: "fee-d", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] };
    expect(setPart(deposit, "min", true, { value: 5 })).toEqual(deposit);
    expect(setPart({ ...deposit, kind: "trade" }, "min", true, { value: 5 }).stages![0]!.price).toMatchObject({ min: typed(5) });
    expect(setPart(deposit, "inTrade", true)).toEqual(deposit);
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

describe("sums in the trade's currency", () => {
  /** IBI's line abroad outside the United States: 0.3%, at least 30 in the trade's currency (BRK-48), typed here. */
  const inTrade: Price = { form: "action", rate: typed(0.3), min: typed(30), currency: "USD", inTrade: true };
  const priceFor = (what: string) => read(account([trade(inTrade)], what));
  it("reads the minimum in the currency of what is bought, where the deal knows it", () => {
    expect(priceFor("europe").fees[0]!.stages[0]!.price).toMatchObject({ min: { v: 30 }, currency: "EUR" });
    expect(priceFor("us").fees[0]!.stages[0]!.price).toMatchObject({ currency: "USD" });
    const home = priceFor("tase").fees[0]!.stages[0]!.price;
    expect(home).not.toHaveProperty("currency");
    expect(home).not.toHaveProperty("inTrade");
  });
  it("does not read the fee where the currency of what is bought is not known, and says so", () => {
    const r = priceFor("world");
    expect(r.fees).toHaveLength(0);
    expect(r.unmatched).toEqual(["fee-trade"]);
    expect(r.noCurrency).toEqual(["fee-trade"]);
    expect(glance(r).unmatched[0]).toMatchObject({ fee: "fee-trade", noCurrency: true });
    expect(builder(r, null, null).rows.find((x) => x.fee === "fee-trade")).toMatchObject({ priced: false, noCurrency: true });
  });
  it("keeps it through the device and a link, and only on a trade price whose form keeps a currency", () => {
    const deal = account([trade(inTrade)]);
    expect(readDeal(JSON.parse(JSON.stringify(deal)))!.fees[0]).toEqual(deal.fees[0]);
    expect(decodeDeal(encodeDeal(deal))!.fees[0]!.stages![0]!.price).toEqual(inTrade);
    expect(setPart(fx({ form: "action", rate: typed(0.1) }), "inTrade", true).stages![0]!.price).not.toHaveProperty("inTrade");
    expect(setPart(trade({ form: "action", rate: typed(0.1) }), "inTrade", true).stages![0]!.price).toMatchObject({ inTrade: true });
  });
});

describe("sums in the trade's currency printed for some currencies only (trade_currencies, F-114, §10.6)", () => {
  /** Excellence's line outside the US: 0.4%, at least 35 in the trade's currency, printed for shekels, dollars and euros (BRK-48). */
  const printed: Price = { form: "action", rate: typed(0.4), min: typed(35), inTrade: ["ILS", "USD", "EUR"] };
  const own = (currency: string): FeeDeal => ({ ...newDeal("brokerage-account"), readFor: [{ by: "what", is: "mine", place: "abroad", currency }], fees: [trade(printed)] } as FeeDeal);
  it("reads the minimum in a currency the list prints it for", () => {
    expect(read(own("EUR")).fees[0]!.stages[0]!.price).toMatchObject({ min: { v: 35 }, currency: "EUR" });
  });
  it("does not read the fee for a trade in another currency, and says why: the list prints no bound for it (F-114)", () => {
    const r = read(own("GBP"));
    expect(r.fees).toHaveLength(0);
    expect(r.unmatched).toEqual(["fee-trade"]);
    expect(r.notPrinted).toEqual(["fee-trade"]);
    expect(r.noCurrency).toEqual([]);
    expect(glance(r).unmatched[0]).toMatchObject({ fee: "fee-trade", notPrinted: true });
    expect(builder(r, null, null).rows.find((x) => x.fee === "fee-trade")).toMatchObject({ priced: false, notPrinted: true });
  });
  it("is filled from each house whose line names the currencies, and keeps them through a link", () => {
    const tradeOf = (id: string) => JSON.stringify(data.houses.find((h) => h.id === id)!.fees.find((f) => f.kind === "trade"));
    expect(tradeOf("excellence")).toContain('"inTrade":["ILS","USD","EUR"]');
    // Interactive Israel's European minimum: 2.5 for euros, pounds and Swiss francs; the deal's currencies hold the first two
    expect(tradeOf("interactive-israel")).toContain('"inTrade":["EUR","GBP"]');
    const deal = account([trade(printed)]);
    expect(decodeDeal(encodeDeal(deal))!.fees[0]!.stages![0]!.price).toEqual(printed);
    expect(readDeal(JSON.parse(JSON.stringify(deal)))!.fees[0]).toEqual(deal.fees[0]);
  });
});

describe("a bound the list leaves open between currencies (bound_readings, D56)", () => {
  it("a template fills it in the dearer currency it is given, and leaves the line out where it is given none", async () => {
    const { houseTemplate } = await import("./templates");
    const snap = latestSnapshots().find((x) => x.id === "interactive-israel")!;
    const open = { ...snap, lines: snap.lines.map((l) => (l.id === "interactive-israel-buy-sell-europe" ? { ...l, trade_currencies: undefined, min: { ...l.min!, unit: "dearer_ccy_per_trade" as const }, bound_readings: { currencies: ["USD", "GBP"], open_questions: ["BRK-OQ24"] } } : l)) };
    const trade = JSON.stringify(houseTemplate(open, () => "GBP").fees.find((f) => f.kind === "trade"));
    expect(trade).toMatch(/"min":\{"v":2\.5[^}]*\}[^]*"currency":"GBP"|"currency":"GBP"[^]*"min":\{"v":2\.5/);
    expect(houseTemplate(open).left).toContainEqual(expect.objectContaining({ lineId: "interactive-israel-buy-sell-europe", why: "bound-currency" }));
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
    expect(setFigure(typedIn, "cap", undefined)).toEqual({ form: "action", rate: { v: 0.3, src }, flat: { amount: { v: 2.85 }, upTo: { v: 50 } } });
    expect(withFlat(typedIn, false)).toEqual(p);
    // a flat price's figure on a price with none, and a cap on a sum per period, change nothing
    expect(withFigure(p, "flat", 3)).toEqual(p);
    expect(withFigure({ form: "sum", amount: typed(10), every: 1 }, "cap", 3)).toEqual({ form: "sum", amount: typed(10), every: 1 });
  });
  it("keeps the bounds, the percent maximum, the flat price and their currency between a share of an action and a sum per unit, each with its source", () => {
    // a figure carried over is still the list's (a list's 2% maximum stays the list's); only a rate or a sum carried into another form,
    // a price the list does not give, becomes the person's
    const filled: Price = { form: "action", rate: { v: 0.3, src }, min: { v: 1, src }, cap: { v: 1, src }, currency: "USD" };
    expect(withForm(filled, "perUnit")).toEqual({ form: "perUnit", amount: { v: 0, blank: true }, min: { v: 1, src }, cap: { v: 1, src }, currency: "USD" });
    expect(withForm({ form: "perUnit", amount: { v: 0.03, src }, min: { v: 8, src }, cap: { v: 2, src }, currency: "USD" }, "perAction")).toEqual({ form: "perAction", amount: { v: 0, blank: true }, cap: { v: 2, src }, currency: "USD" });
    expect(withForm({ form: "action", rate: { v: 0.4, src } }, "held")).toMatchObject({ form: "held", rate: { v: 0.4 } });
    expect(withForm({ form: "action", rate: { v: 0.4, src } }, "held")).not.toHaveProperty("rate.src");
    expect(withForm(ibFixed, "action")).toEqual({ form: "action", rate: { v: 0, blank: true }, min: { v: 1 }, cap: { v: 1 }, currency: "USD" });
    // a sum per action keeps the currency and the percent maximum, a trade's as a sum per unit's does; a fee whose sum per action is in
    // shekels with no percent maximum by its shape (a payout's handling) loses them
    expect(withForm(ibFixed, "perAction")).toEqual({ form: "perAction", amount: { v: 0, blank: true }, cap: { v: 1 }, currency: "USD" });
    expect(setPart(trade(ibFixed), "perAction", true).stages![0]!.price).toEqual({ form: "perAction", amount: { v: 0, blank: true }, cap: { v: 1 }, currency: "USD" });
    // a currency that priced nothing (a share with no bound or flat price) is not carried; one a bound priced is
    expect(setPart(trade({ form: "action", rate: typed(0.3), currency: "USD" }), "perAction", true).stages![0]!.price).toEqual({ form: "perAction", amount: { v: 0, blank: true } });
    expect(setPart(trade({ form: "action", rate: typed(0.3), currency: "USD" }), "perUnit", true).stages![0]!.price).toEqual({ form: "perUnit", amount: { v: 0, blank: true } });
    expect(setPart(trade({ form: "action", rate: typed(0.3), min: typed(8), currency: "USD" }), "perAction", true).stages![0]!.price).toMatchObject({ form: "perAction", currency: "USD" });
    const payout: Fee = { id: "fee-payout", kind: "distribution_handling", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(5), currency: "USD" } }] };
    expect(setPart(payout, "perAction", true).stages![0]!.price).toEqual({ form: "perAction", amount: { v: 0, blank: true } });
    const event: Fee = { id: "fee-event", kind: "corporate_event", stages: [{ price: { form: "perAction", amount: typed(50), currency: "USD" } }] };
    expect(setPart(event, "perAction", true)).toEqual(event);
    expect(setPart(trade(ibFixed), "share", true).stages![0]!.price).toMatchObject({ form: "action", min: { v: 1 }, cap: { v: 1 }, currency: "USD" });
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
    // what stays out is makam's redemption, mutual funds on the exchange's line, the spread its conversion does not limit, and the yearly
    // distribution fees
    expect(new Set(house("mizrahi-tefahot").left.map((l) => l.why))).toEqual(new Set(["redemption", "bank-funds", "spread-on-top", "distribution-yearly"]));
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
  it("name a case of every value abroad but another case's as outside that value, and a lead its values share once", () => {
    const texts = (id: string) => {
      const deal = fillDeal(newDeal("brokerage-account"), `house:${id}`, data, TODAY)!;
      const row = builder(read(deal)).rows.find((r) => deal.fees.find((f) => f.id === r.fee)!.kind === "trade")!;
      return row.block.kind === "band" ? [...row.block.rows, ...(row.block.folded?.rows ?? [])].map((r) => r.when[0]!.text ?? "") : [];
    };
    // Excellence: the US's two tracks, and Europe with the rest of the world: "בחו״ל, מחוץ לארה״ב", as drawn
    expect(texts("excellence")).toContain("בחו״ל, מחוץ לארה״ב");
    expect(texts("excellence")).not.toContain("בחו״ל, באירופה, בחו״ל, בשאר העולם");
    // Hapoalim: one case for every value abroad, its lead said once
    expect(texts("hapoalim")).toContain("בחו״ל, בארה״ב, באירופה, בשאר העולם");
  });
  it("note an order through a bank's clerk not carried out as BRK-16 says, on a branch line on the exchange alone, whatever the heading", () => {
    const notesOf = (id: string) =>
      data.houses.find((h) => h.id === id)!.fees.find((f) => f.kind === "trade")!.cases!.map((c) => ({ when: JSON.stringify(c.when), notes: (c.stages[0]!.price as { notes?: string[] }).notes ?? [] }));
    for (const bank of ["discount", "hapoalim"]) {
      const cases = notesOf(bank);
      // never the plain note, whatever the bank's heading says
      expect(cases.some((c) => c.notes.includes("unfilled"))).toBe(false);
      // the branch's case on the exchange carries BRK-16's note; a direct one none
      expect(cases.some((c) => c.when.includes("branch") && c.when.includes("tase") && c.notes.includes("unfilledClerk"))).toBe(true);
      expect(cases.filter((c) => c.when.includes("direct") && !c.when.includes("branch")).every((c) => c.notes.length === 0)).toBe(true);
    }
    // a foreign line at a bank is outside part 4(א)(1): not its note, but the foreign item's own, on the branch's case alone (part 4(א)(4), note 1)
    const abroad = notesOf("discount").filter((c) => c.when.includes("us") && !c.when.includes("tase"));
    expect(abroad.every((c) => !c.notes.includes("unfilledClerk"))).toBe(true);
    expect(abroad.some((c) => c.when.includes("branch") && c.notes.includes("unfilledClerkAbroad"))).toBe(true);
    expect(abroad.filter((c) => !c.when.includes("branch")).every((c) => c.notes.length === 0)).toBe(true);
    const foreign = { ...fillDeal(newDeal("brokerage-account"), "house:discount", data, TODAY)!, readFor: [{ by: "what", is: "us" }, { by: "channel", is: "branch" }] };
    const said = readingOf(read(foreign), data.fx).stated.find((x) => x.part === "unfilledClerkAbroad")!;
    expect(said.words.lead).toBe(copy.cases.stated.unfilledClerkAbroad);
    expect(said.rules).toEqual(["BRK-16"]);
    // the reading states it in the rule's terms and cites BRK-16, which the page's data carries
    const d = { ...fillDeal(newDeal("brokerage-account"), "house:discount", data, TODAY)!, readFor: [{ by: "what", is: "tase" }, { by: "channel", is: "branch" }] };
    const stated = readingOf(read(d), data.fx).stated.find((s) => s.part === "unfilledClerk")!;
    expect(stated.words.lead).toBe(copy.cases.stated.unfilledClerk);
    expect(stated.rules).toEqual(["BRK-16"]);
    expect(data.rules.some((r) => r.id === "BRK-16")).toBe(true);
    const direct = { ...d, readFor: [{ by: "what", is: "tase" }, { by: "channel", is: "direct" }] };
    expect(readingOf(read(direct), data.fx).stated.some((s) => s.part === "unfilledClerk" || s.part === "unfilled")).toBe(false);
  });
  it("say that a percent maximum winning over a minimum is the site's reading where the list does not say which wins (F-12)", () => {
    const notesOf = (id: string) => house(id).fees.find((f) => f.kind === "trade")!.cases!.map((c) => c.stages[0]!.price).filter((p) => "cap" in p && p.cap).map((p) => ("notes" in p ? (p.notes ?? []) : []));
    for (const id of ["excellence", "interactive-israel"]) {
      expect(notesOf(id).length, id).toBeGreaterThan(0);
      expect(notesOf(id).every((n) => n.includes("capRead")), id).toBe(true);
    }
    // Mizrahi-Tefahot's words put its ceiling on the minimum (BRK-67): its list says it, so no reading is noted
    expect(notesOf("mizrahi-tefahot").some((n) => n.includes("capRead"))).toBe(false);
    const d = { ...fillDeal(newDeal("brokerage-account"), "house:excellence", data, TODAY)!, readFor: [{ by: "what", is: "us" }] };
    expect(readingOf(read(d), data.fx).stated.find((x) => x.part === "capRead")?.words.lead).toBe(copy.cases.stated.capRead);
  });
  it("say a spread the list does not limit on top of a priced conversion, makam's redemption as a redemption, and a custody of nothing as free", () => {
    expect(house("excellence").left).toContainEqual(expect.objectContaining({ lineId: "excellence-fx-conversion", why: "spread-on-top" }));
    expect(house("excellence").left).toContainEqual(expect.objectContaining({ lineId: "excellence-redemption-makam", why: "redemption" }));
    expect(house("excellence").left.some((l) => l.why === "plan")).toBe(false);
    // IBI's "דמי משמרת: פטור" prints no period: free, not 0% a month
    // with its record's source, so it counts as the template's, not as the person's own entry, and survives the device and a link
    const free = filledFor("ibi", [{ by: "held", is: "tase" }])("custody")!;
    expect(free).toMatchObject({ form: "free", src: { strength: "institution" } });
    const ibi = fillDeal(newDeal("brokerage-account"), "house:ibi", data, TODAY)!;
    const custody = ibi.fees.find((f) => f.kind === "custody")!;
    expect(untouched(custody)).toBe(true);
    expect(readDeal(JSON.parse(JSON.stringify(ibi)))).toEqual(ibi);
    expect(decodeDeal(encodeDeal(ibi))!.fees.find((f) => f.kind === "custody")!.stages?.[0]?.price ?? decodeDeal(encodeDeal(ibi))!.fees.find((f) => f.kind === "custody")!.cases![0]!.stages[0]!.price).toMatchObject({ form: "free", src: { strength: "institution" } });
  });
  it("show IBI's free custody with its record's source wherever the page shows a sourced price's source, and a free price of the person's own as the word alone", () => {
    const ibi = { ...fillDeal(newDeal("brokerage-account"), "house:ibi", data, TODAY)!, readFor: [{ by: "held", is: "tase" }] };
    const r = read(ibi);
    const custody = ibi.fees.find((f) => f.kind === "custody")!;
    // the builder's line and the open case: the free part is its sourced value
    const row = builder(r).rows.find((x) => x.fee === custody.id)!;
    const parts = row.block.kind === "slim" ? row.block.parts : row.block.rows.flatMap((x) => x.parts);
    const said = parts.find((p) => p.id === "free")!.words;
    expect(said.lead).toBeUndefined();
    expect(said.figure).toMatchObject({ value: "free", unit: "text", state: "sourced", source: { strength: "institution" } });
    const open = panel(r, custody.id)!.open.buy[0]!.parts.find((p) => p.id === "free")!;
    expect(open.words.figure?.state).toBe("sourced");
    // the reading's price, which the glance, the period cards and the law card say
    const read0 = readingOf(r, data.fx).periods[0]!.rows.find((x) => x.fee === custody.id);
    expect(read0?.price.free?.state).toBe("sourced");
    // the person's own free price has no source: the word alone
    const own = builder(read({ id: "d", name: "", kind: "brokerage-account", fees: [{ id: "fee-c", kind: "custody", stages: [{ price: { form: "free" } }] }] })).rows[0]!;
    expect(own.block.kind === "slim" && own.block.parts[0]!.words).toEqual({ lead: copy.price.free });
  });
  it("fill a custody maximum on each security as one, stated and never read as the holding's maximum (§10.6's stated parts)", () => {
    const custodyOf = (id: string, held: string) => filledFor(id, [{ by: "held", is: held }])("custody");
    // Discount: 0.2% a quarter, at most 7,500 ₪ on each security a quarter, and no maximum on the whole deposit
    expect(custodyOf("discount", "tase")).toMatchObject({ form: "held", rate: { v: 0.2 }, perSecurity: { v: 7500 } });
    expect(custodyOf("discount", "tase")).not.toHaveProperty("max");
    // Leumi: 3,700 ₪ on each security, stated, and 11,500 ₪ on the whole deposit, the holding's maximum (data-schema §3.6a item 2)
    expect(custodyOf("leumi", "tase")).toMatchObject({ perSecurity: { v: 3700 }, max: { v: 11500 } });
    // Hapoalim's maximum is the same on each security and on the deposit: the holding's maximum, which it then is
    expect(custodyOf("hapoalim", "tase")).toMatchObject({ max: { v: 10600 } });
    // the reading states it, and marks no maximum on the holding
    const d = { ...fillDeal(newDeal("brokerage-account"), "house:discount", data, TODAY)!, readFor: [{ by: "what", is: "tase" }, { by: "held", is: "tase" }] };
    const reading = readingOf(read(d), data.fx);
    const stated = reading.stated.find((x) => x.part === "maxPerSecurity")!;
    expect(stated.words.figure?.value).toBe(7500);
    expect(stated.words.tail).toBe(copy.cases.stated.maxPerSecurity.tail);
    expect(reading.statements.some((x) => x.kind === "mark" && x.mark.kind === "max" && x.mark.on === "held")).toBe(false);
    // each line whose maximum is on each security says so in its record (max_per), and its maximum on the deposit quotes the list
    const lines = latestSnapshots().flatMap((x) => x.lines);
    for (const l of lines.filter((x) => x.max_per === "security")) expect(`${l.max?.notes} ${l.max_deposit?.source.quote ?? ""}`, l.id).toMatch(/לני"ע|לנייר/);
    // Jerusalem's maximum is on the deposit, by the bank's own sheet (max_per_source): the holding's maximum
    expect(custodyOf("jerusalem", "tase")).toMatchObject({ max: { v: 10000 } });
    expect(custodyOf("mizrahi-tefahot", "tase")).toMatchObject({ max: { v: 10750 } });
  });
  it("leave out a custody maximum the list prints with no scope, with its own reason: the cautious reading (data-schema §3.6a item 2)", async () => {
    const { houseTemplate } = await import("./templates");
    const snap = latestSnapshots().find((x) => x.id === "jerusalem")!;
    const unstated = { ...snap, lines: snap.lines.map((l) => (l.base === "custody" ? { ...l, max_per: "unstated" as const, max_per_source: undefined } : l)) };
    const t = houseTemplate(unstated);
    expect(JSON.stringify(t.fees.find((f) => f.kind === "custody"))).not.toContain('"v":10000');
    expect(t.left).toContainEqual(expect.objectContaining({ lineId: "jerusalem-custody-israel", why: "max-scope-unstated" }));
    expect(copy.filled.why["max-scope-unstated"]).toBeTruthy();
  });
  it("fill Leumi's custody abroad as its own case: 0.2% a quarter, a maximum of 7,400 ₪ on each security and 23,000 ₪ on the deposit", () => {
    const abroad = filledFor("leumi", [{ by: "what", is: "us" }, { by: "held", is: "us" }])("custody");
    expect(abroad).toEqual({ form: "held", rate: expect.objectContaining({ v: 0.2 }), per: 3, every: 3, perSecurity: expect.objectContaining({ v: 7400 }), max: expect.objectContaining({ v: 23000 }) });
    const home = filledFor("leumi", [{ by: "what", is: "tase" }, { by: "held", is: "tase" }])("custody");
    expect(home).toMatchObject({ rate: { v: 0.15 }, perSecurity: { v: 3700 } });
  });
  it("fill IBI's account fee with the offset its annex prints against the month's trade fees (data-schema §3.6a item 4), and no other house's", () => {
    expect(filledFor("ibi", [])("fixed_period")).toMatchObject({ form: "sum", amount: { v: 15 }, offset: { kind: "trade" } });
    const others = data.houses.filter((h) => h.id !== "ibi").flatMap((h) => h.fees.filter((f) => f.kind === "fixed_period"));
    for (const f of others) expect(JSON.stringify(f)).not.toContain("offset");
  });
  it("note a trade charged on an order not carried out too where the line's own name says so, and no other", () => {
    const snap = (id: string) => data.houses.find((h) => h.id === id)!;
    const trade = snap("excellence").fees.find((f) => f.kind === "trade")!;
    // every Excellence trade line is named "(כולל קניה או מכירה שלא בוצעה)" but the one for traditional mutual funds
    const notes = trade.cases!.map((c) => (c.stages[0]!.price as { notes?: string[] }).notes ?? []);
    expect(notes.filter((n) => n.includes("unfilled")).length).toBe(trade.cases!.length - 1);
    const funds = trade.cases!.find((c) => Array.isArray(c.when[0]) && (c.when[0] as string[]).includes("קרנות נאמנות מסורתיות"))!;
    expect((funds.stages[0]!.price as { notes?: string[] }).notes).toBeUndefined();
    const line = (names: string[]) => ({ names: { tariff: names } }) as unknown as Parameters<typeof chargesUnfilled>[0];
    expect(chargesUnfilled(line(["קניה, מכירה ופדיון (כולל קנייה או מכירה שלא בוצעה) - מניות"]))).toBe(true);
    expect(chargesUnfilled(line(["קניה, מכירה ופדיון של קרנות נאמנות"]))).toBe(false);
  });
  it("fill a fixed sum on each trade in its currency, as the line prints it, under the line's percent maximum where it has one", () => {
    const tracks = (id: string) => data.houses.find((h) => h.id === id)!.fees.find((f) => f.kind === "trade")!.cases!.map((c) => c.stages[0]!.price);
    // Altshuler's "עמלה קבועה 11$ לעסקה" and IBI's "פיקס 12$ לעסקה": a share of nothing with a minimum and a maximum of one sum
    expect(tracks("altshuler-trade")).toContainEqual(expect.objectContaining({ form: "perAction", amount: expect.objectContaining({ v: 11 }), currency: "USD" }));
    expect(tracks("ibi")).toContainEqual(expect.objectContaining({ form: "perAction", amount: expect.objectContaining({ v: 12 }), currency: "USD" }));
    expect(tracks("altshuler-trade").find((p) => p.form === "perAction" && p.currency === "USD")).not.toHaveProperty("cap");
    // Excellence's "11$ פיקס לעסקה" under the line's "עמלת מקסימום 2% משווי העסקה": the sum with its ceiling, each figure sourced
    const ex = tracks("excellence").find((p) => p.form === "perAction" && p.currency === "USD")!;
    expect(ex).toMatchObject({ form: "perAction", amount: { v: 11 }, cap: { v: 2 }, currency: "USD", notes: ["unfilled", "capRead"] });
    expect(ex.form === "perAction" && ex.amount.src && ex.cap?.src).toBeTruthy();
    expect(tracks("excellence").some((p) => p.form === "action" && p.rate.v === 0)).toBe(false);
  });
  it("hold a dollar sum per action to its percent maximum, as a share's minimum is held (F-12, F-112), and keep it through a link", () => {
    const capped: Price = { form: "perAction", amount: { v: 11, src }, cap: { v: 2, src }, currency: "USD" };
    const deal = account([trade(capped)]);
    const engine = engineDeal(deal);
    expect(engine.fees[0]!.stages[0]!.price).toEqual({ kind: "perAction", amount: 11, cap: 0.02, currency: "USD" });
    const period = dealPeriods(engine, { y: 2026, m: 11 }).periods[0]!;
    // at 3.20 ₪ a dollar: a 100 $ trade (320 ₪) costs 2% of it, 2 $ = 6.40 ₪; a 1,000 $ trade (3,200 ₪) costs the 11 $ = 35.20 ₪
    expect(actionCost(engine, period, "trade", 320, "buy", { USD: 3.2 }).total).toBeCloseTo(6.4, 9);
    expect(actionCost(engine, period, "trade", 3_200, "buy", { USD: 3.2 }).total).toBeCloseTo(35.2, 9);
    const back = decodeDeal(encodeDeal(deal))!;
    expect(back.fees[0]!.stages![0]!.price).toEqual(capped);
    // the cap decides up to where it meets the sum, 11 $ / 2% = 550 $, a mark in the sum's own currency; the price changes there
    expect(dealMarks(engine, period)).toEqual([expect.objectContaining({ kind: "cap", on: "action", amount: 550, currency: "USD" })]);
    const mark = readingOf(read(deal), data.fx).statements.flatMap((x) => (x.kind === "mark" ? [x.mark] : []));
    expect(mark).toHaveLength(1);
    expect(mark[0]).toMatchObject({ kind: "cap", sum: true, amount: { value: 550, unit: "usd", state: "computed" } });
    // a discount off the sum moves the turn as F-116 lowers the sum: (1 − 50%) × 11 / 2% = 275 $, the sum it meets 5.50 $
    const offDeal = account([trade({ ...capped, discount: { pct: typed(50) } } as Price)]);
    const offMark = readingOf(read(offDeal), data.fx).statements.flatMap((x) => (x.kind === "mark" ? [x.mark] : []))[0]!;
    expect(offMark).toMatchObject({ kind: "cap", sum: true, amount: { value: 275 }, meets: { value: 5.5, state: "computed" } });
    // a sum per action with no cap marks nothing
    const plain = engineDeal(account([trade({ form: "perAction", amount: { v: 11, src }, currency: "USD" })]));
    expect(dealMarks(plain, dealPeriods(plain, { y: 2026, m: 11 }).periods[0]!)).toEqual([]);
    // the case's parts: the sum, and the percent maximum as a bound
    const row = builder(read(deal)).rows[0]!;
    const parts = row.block.kind === "slim" ? row.block.parts.map((x) => x.id) : [];
    expect(parts).toEqual(expect.arrayContaining(["perAction", "cap"]));
  });
  it("charge a trade's sum per action in dollars at the rate it is given, as a sum per unit's is (F-112, F-84), and keep it through a link", () => {
    const deal = account([trade({ form: "perAction", amount: { v: 11, src }, currency: "USD" })]);
    const engine = engineDeal(deal);
    expect(engine.fees[0]!.stages[0]!.price).toEqual({ kind: "perAction", amount: 11, currency: "USD" });
    const period = dealPeriods(engine, { y: 2026, m: 11 }).periods[0]!;
    // 11 $ at 3.20 ₪ a dollar is 35.20 ₪ on any trade, small or large
    expect(actionCost(engine, period, "trade", 1_000, "buy", { USD: 3.2 }).total).toBeCloseTo(35.2, 9);
    expect(actionCost(engine, period, "trade", 100_000, "buy", { USD: 3.2 }).total).toBeCloseTo(35.2, 9);
    expect(() => actionCost(engine, period, "trade", 1_000, "buy", {})).toThrow(RangeError);
    const back = decodeDeal(encodeDeal(deal))!;
    expect(back.fees[0]!.stages![0]!.price).toEqual({ form: "perAction", amount: { v: 11, src }, currency: "USD" });
  });
  it("fill a custody minimum in the period the list prints it, which the engine reads per charge (F-14)", () => {
    const custody = data.houses.find((h) => h.id === "excellence")!.fees.find((f) => f.kind === "custody")!;
    const price = custody.stages![0]!.price;
    // "0.6% לרבעון עם מינימום 40 ₪ לחודש": 40 a month, charged each quarter, so 120 a charge
    expect(price).toMatchObject({ form: "held", rate: { v: 0.6 }, per: 3, every: 3, min: { v: 40 }, boundsEvery: 1 });
    expect(price.form === "held" && price.min!.src).toBeTruthy();
    expect(enginePrice(price)).toMatchObject({ kind: "held", min: 120, everyMonths: 3 });
    const deal = fillDeal(newDeal("brokerage-account"), "house:excellence", data, TODAY)!;
    const row = builder(read(deal)).rows.find((r) => r.fee === deal.fees.find((f) => f.kind === "custody")!.id)!;
    const min = row.block.kind === "slim" ? row.block.parts.find((x) => x.id === "min")! : null;
    expect(min?.words.figure?.value).toBe(40);
    expect(min?.words.tail?.trim()).toBe(copy.price.per[1]);
    // the engine's minimum is a charge's: the deal's engine form says 120, and a link carries the period back
    expect(engineDeal(deal).fees.find((f) => f.stages[0]!.price.kind === "held")!.stages[0]!.price).toMatchObject({ min: 120 });
    const back = decodeDeal(encodeDeal(deal))!;
    expect(back.fees.find((f) => f.kind === "custody")!.stages![0]!.price).toMatchObject({ min: { v: 40 }, boundsEvery: 1 });
    // F-14 names a bound printed per month alone: a deal saying another period is refused, as a link the site did not write
    const held = (boundsEvery: unknown) => ({ ...newDeal("brokerage-account"), fees: [{ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.6), per: 3, every: 3, min: typed(40), boundsEvery } }] }] });
    expect(readDeal(JSON.parse(JSON.stringify(held(1))))).not.toBeNull();
    expect(readDeal(JSON.parse(JSON.stringify(held(3))))).toBeNull();
    expect(readDeal(JSON.parse(JSON.stringify(held(12))))).toBeNull();
    // the holding curve's inputs show the charge's minimum, 120 ₪, worked out from the 40 ₪ a month (F-14)
    const curveMin = readingOf(read(deal), data.fx).curves.flatMap((c) => Object.values(c.inputs)).find((x) => x.value === 120 && x.state === "computed");
    expect(curveMin).toMatchObject({ unit: "nis", state: "computed" });
    expect(JSON.stringify(curveMin)).toContain("F-14");
    // its mark says a charge's minimum, worked out from the month's (F-14), and where it binds: below 120 / 0.6% = 20,000 ₪
    const mark = readingOf(read(deal), data.fx).statements.flatMap((x) => (x.kind === "mark" && x.mark.kind === "min" && x.mark.on === "held" ? [x.mark] : []))[0]!;
    expect(mark.kind === "min" && mark.bound).toMatchObject({ value: 120, state: "computed" });
    expect(v(mark.amount)).toBeCloseTo(20_000, 6);
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
  it("price no mutual fund on a bank's line for the Tel Aviv exchange, which takes back only tracking and listed funds (BRK-16, MF-27), and say why", () => {
    for (const id of ["discount", "leumi", "mizrahi-tefahot", "one-zero"]) {
      const trade = house(id).fees.find((f) => f.kind === "trade")!;
      const named = (trade.cases ?? []).flatMap((c) => (Array.isArray(c.when[0]) ? c.when[0] : []));
      expect(named, id).toContain("tase");
      expect(named, id).not.toContain("mutualFunds");
      expect(filledFor(id, [{ by: "what", is: "mutualFunds" }])("trade"), id).toBeUndefined();
    }
    expect(house("discount").left.filter((l) => l.why === "bank-funds").map((l) => l.lineId).sort()).toEqual(["discount-buy-sell-tase-branch", "discount-buy-sell-tase-direct"]);
    // a bank's yearly distribution fee on fund units is left out with a reason that names it
    expect(house("discount").left).toContainEqual(expect.objectContaining({ lineId: "discount-distribution-fee-type-1", why: "distribution-yearly" }));
    expect(copy.filled.why["distribution-yearly"]).toContain("עמלת הפצה");
  });
  it("read IBI's line outside the United States, Canada and Israel for Europe and a value of its own, never for the rest of the world", () => {
    const band = "מסחר בשווקים נוספים, מחוץ לארה״ב, לקנדה ולישראל";
    const trade = house("ibi").fees.find((f) => f.kind === "trade")!;
    expect(trade.by![0]).toEqual({ kind: "what", own: [{ name: band, place: "abroad", currency: null }] });
    // its minimum is in the trade's currency (BRK-48): 30 euros in Europe; on a value of its own whose currency is not named, not read
    expect(filledFor("ibi", [{ by: "what", is: "europe" }])("trade")).toMatchObject({ rate: { v: 0.3 }, min: { v: 30 }, currency: "EUR" });
    expect(filledFor("ibi", [{ by: "what", is: band }])("trade")).toBeUndefined();
    expect(read({ ...fillDeal(newDeal("brokerage-account"), "house:ibi", data, TODAY)!, readFor: [{ by: "what", is: band }] }).noCurrency).toHaveLength(1);
    // the rest of the world holds Canada, which the line leaves out
    expect(filledFor("ibi", [{ by: "what", is: "world" }])("trade")).toBeUndefined();
    // a value of its own abroad, in a currency it does not name, puts a conversion on a purchase (F-111)
    expect(read({ ...fillDeal(newDeal("brokerage-account"), "house:ibi", data, TODAY)!, readFor: [{ by: "what", is: band }] }).engine.foreign).toBe(true);
  });
  it("fill a minimum printed in the trade's own currency as one, never as dollars (BRK-48)", () => {
    // Excellence outside the US: 35 euros in Europe, and not read where the currency is not known ("בשאר העולם")
    const europe = filledFor("excellence", [{ by: "what", is: "europe" }])("trade");
    expect(europe).toMatchObject({ rate: { v: 0.4 }, min: { v: 35 }, currency: "EUR" });
    const world = { ...fillDeal(newDeal("brokerage-account"), "house:excellence", data, TODAY)!, readFor: [{ by: "what", is: "world" }] };
    expect(read(world).noCurrency.length).toBeGreaterThan(0);
    // the lines so filled are those whose record prints a bound in the trade's currency (data-schema §3.6a item 1)
    const lines = latestSnapshots().flatMap((x) => x.lines).filter((l) => l.min?.unit === "trade_ccy_per_trade");
    expect(lines.map((l) => l.id).sort()).toEqual(["excellence-buy-sell-foreign-non-us", "ibi-buy-sell-foreign-other-markets", "interactive-israel-buy-sell-europe", "meitav-trade-buy-sell-foreign-world"]);
  });
  it("say a minimum in the trade's currency in the builder in that currency where the reading reads its case, else with no currency sign (BRK-48)", () => {
    const minOf = (is: string) => {
      const r = read({ ...fillDeal(newDeal("brokerage-account"), "house:excellence", data, TODAY)!, readFor: [{ by: "what", is }] });
      const band = builder(r).rows.find((x) => x.kind === "trade")!.block;
      if (band.kind !== "band") throw new Error("a band");
      const mins = band.rows.flatMap((x) => x.parts.filter((p) => p.id === "min").map((p) => p.words.figure!));
      return mins.find((v) => v.value === 35)!;
    };
    expect(minOf("europe")).toMatchObject({ value: 35, unit: "eur" });
    // the rest of the world: the currency is not known, and the fee is not read; on a pick in the US, the case is not the one read
    expect(minOf("world")).toMatchObject({ value: 35, unit: "count" });
    expect(minOf("us")).toMatchObject({ value: 35, unit: "count" });
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
      expect.objectContaining({ line: "interactive-brokers-fx-spot", why: "another-line" }),
      expect.objectContaining({ line: "interactive-brokers-fx-auto-conversion", why: "spread-unpriced" }),
    ]);
    expect(templateOf(newDeal("brokerage-account"), "house:interactive-brokers/no-such-line", data, TODAY)).toBeNull();
  });
});

describe("the reading", () => {
  const marksOf = (d: FeeDeal) => readingOf(read(d), data.fx).statements.flatMap((s) => (s.kind === "mark" && s.mark.kind !== "meet" ? [s.mark as FeeMark] : []));
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

describe("a flat price in the open case", () => {
  it("stands where a typed one goes, after the bounds and before the links and notes, while its figures are blank", () => {
    const blank: Price = { form: "action", rate: typed(0.1), min: typed(5), flat: { amount: { v: 0, blank: true }, upTo: { v: 0, blank: true } }, refund: typed(1), notes: ["unfilled"] };
    const ids = (p: Price) => panel(read(account([trade(p)])), "fee-trade")!.open.buy[0]!.parts.map((x) => x.id);
    expect(ids(blank)).toEqual(["share", "min", "flat", "refund", "unfilled"]);
    expect(ids({ ...blank, flat: { amount: typed(3), upTo: typed(50) } } as Price)).toEqual(ids(blank));
  });
});
