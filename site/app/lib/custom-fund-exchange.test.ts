// A fund the person types abroad (D44): the exchange it trades on and its unit price, as they say them (F-65, F-109, F-128). Said, the fund
// is read on that exchange everywhere, as a collected fund whose tickers name it; not said, a fund registered in the United States is read
// there (ETF-93), as a collected fund with no exchange ticker; any other is of no known exchange (ETF-95), and every account is read on each
// exchange and priced on the one that leaves the least, a deal filled from a house's list among them. No figure here is written by hand: each side of a comparison is the page's own
// pricing of another fund or another answer.
import { describe, expect, it } from "vitest";
import type { FundExchange, FundRecord } from "@finance-tool/schema";
import { draftWithPlace, fundDraftOf, fundFromDraft, fundsAsRead, recordOfFund, validCustomFunds, withCustomEntries, type BuyAt, type CustomFund, type FundCountry, type FundDomicile } from "./custom-entries";
import { buildInvest, dealOnPlan, pairCosts, dealRunOf, fundWayAt, indexById, venueOfFund, type DealOnPlan, type FundWay, type WayPrice } from "./invest";
import { invest as copy } from "../copy";
import { leftOf } from "../components/invest/receipt";
import type { SiteValue } from "./value";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { entered } from "./value";
import { feesData } from "./fees.server";
import { fillDeal } from "./fee-deal/templates";
import { newDeal } from "./fee-deal/model";
import { dealProviderId, planContextOf, withDeals } from "./deal-account/bundle";
import { feesOnPlan, whatOfRun } from "./deal-account/plan";
import { dealTiles } from "./deal-account/tiles";

const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 20_000, monthly: 1_000, years: 15, grossReturn: 0.06, inflation: 0.02, age: null, income: null,
  values: { amount: entered(20_000, "nis", t), monthly: entered(1_000, "nis_per_month", t), years: entered(15, "years", t), returnV: entered(6, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
};
const SP = "index-sp500";
/** A value the test needs, or a failure that names it. */
function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}
const indexOf = (b: typeof bundle) => must(indexById(b, SP), "the S&P 500 index");

/** A new draft with the panel's first two answers. */
const draftAt = (buyAt: BuyAt, country: FundCountry | null) => ({ ...fundDraftOf(null, { buyAt, country }), buyAt });
/** The panel's answer for a fund bought abroad on an exchange in dollars, or abroad not sure where. */
const AT_EXCHANGE: Record<FundExchange | "none", BuyAt> = { us: "us-usd", europe: "europe-usd", none: "abroad" };

/**
 * An accumulating fund on the S&P 500, unhedged, its exchange as said (null: not sure), with or without a unit price in dollars, registered
 * in Ireland unless another country (null: other or not known) is given.
 */
const typed = (exchange: FundExchange | null, unitPrice: number | null = null, domicile: FundDomicile | null = "IE"): CustomFund =>
  fundFromDraft(
    { ...draftAt(AT_EXCHANGE[exchange ?? "none"], domicile), name: `שלי ${exchange ?? "לא ידוע"} ${domicile ?? "-"}`, fixed: 0.07, payout: "accumulating", hedged: false, unitPrice: unitPrice === null ? null : { value: unitPrice, unit: "usd" } },
    `custom-fund-${exchange ?? "unsure"}-${(domicile ?? "none").toLowerCase()}${unitPrice ? "-priced" : ""}`,
    SP,
    t,
    "USD",
  );

/** A collected fund with the typed fund's terms, its exchange named by a ticker as a collected record names it. */
function twinOf(f: CustomFund, exchange: FundExchange): FundRecord {
  const { exchange: _, ...rec } = recordOfFund(f, "USD");
  return { ...rec, id: `twin-${exchange}`, identifiers: { ...rec.identifiers, ticker: exchange === "us" ? { "NYSE Arca": "TWIN" } : { LSE: "TWIN" } } };
}

const wayOf = (b: typeof bundle, fundId: string): FundWay => {
  const w = fundWayAt({ bundle: b, index: indexOf(b), plan, fundId });
  if (!w) throw new Error(`fund ${fundId} is on the index`);
  return w;
};
const left = (w: FundWay, house: string): number | null => {
  const at = w.byHouse[house];
  return at && "valueN" in at ? (at as WayPrice).valueN : null;
};
const reasonAt = (w: FundWay, house: string): string | null => {
  const at = w.byHouse[house];
  return at && "reason" in at ? at.reason.code : null;
};
const houses = bundle.snapshots.map((s) => s.id);

describe("a fund typed abroad on a named exchange is read there, as a collected fund on that exchange (F-65, F-109)", () => {
  it.each(["us", "europe"] as const)("on %s, with a unit price: every house leaves what it leaves on the collected twin, in whole units", (exchange) => {
    const f = typed(exchange, 100);
    const b0 = withCustomEntries(bundle, [f]);
    const b = { ...b0, funds: [...b0.funds, twinOf(f, exchange)] };
    const mine = wayOf(b, f.id);
    const twin = wayOf(b, `twin-${exchange}`);
    const priced = houses.filter((h) => left(twin, h) !== null);
    expect(priced.length).toBeGreaterThan(3);
    for (const h of houses) expect([h, left(mine, h)]).toEqual([h, left(twin, h)]);
    // the unit price is read: some house buys whole units, and the row no longer says the price was not collected
    expect(priced.some((h) => (mine.byHouse[h] as WayPrice).units !== null)).toBe(true);
    expect(mine.noUnitPrice).toBe(false);
  });
});

describe("a fund typed abroad whose exchange is not given goes by its country only where it is registered in the United States (F-65)", () => {
  it("registered in the United States, every house reads it as on the US exchange (ETF-93)", () => {
    const unsure = typed(null, 100, "US");
    const known = typed("us", 100, "US");
    const b = withCustomEntries(bundle, [unsure, known]);
    expect(venueOfFund(recordOfFund(unsure, "USD"))).toBe("us");
    const a = wayOf(b, unsure.id);
    const k = wayOf(b, known.id);
    expect(houses.filter((h) => left(k, h) !== null).length).toBeGreaterThan(3);
    for (const h of houses) expect([h, left(a, h), reasonAt(a, h)]).toEqual([h, left(k, h), reasonAt(k, h)]);
  });

  it("registered in Ireland, every house reads it as a fund of no known exchange: the less of the two, none where either has none (ETF-95)", () => {
    const funds = [typed("us", 100, "IE"), typed("europe", 100, "IE"), typed(null, 100, "IE")];
    const b = withCustomEntries(bundle, funds);
    expect(venueOfFund(recordOfFund(typed(null, 100, "IE"), "USD"))).toBeNull();
    const [us, europe, unsure] = funds.map((f) => wayOf(b, f.id)) as [FundWay, FundWay, FundWay];
    expect(houses.filter((h) => left(unsure, h) !== null).length).toBeGreaterThan(3);
    for (const h of houses) {
      const a = left(us, h);
      const e = left(europe, h);
      expect([h, left(unsure, h)]).toEqual([h, a === null || e === null ? null : Math.min(a, e)]);
    }
  });

  it("registered in Ireland, One Zero, whose lines abroad name the United States alone, does not sell it, as it does not sell the collected iShares Core S&P 500, saying no exchange of the fund's", () => {
    const f = typed(null, null, "IE");
    const b = withCustomEntries(bundle, [f]);
    expect(reasonAt(wayOf(b, "ie00b5bmr087"), "one-zero")).toBe("other-venue");
    expect(reasonAt(wayOf(b, f.id), "one-zero")).toBe("other-venue");
    const at = wayOf(b, f.id).byHouse["one-zero"];
    expect(at && "reason" in at ? at.reason : null).toEqual({ code: "other-venue", venue: "us", fundVenue: null });
  });
});

describe("a fund typed abroad with neither its exchange nor its country (F-65)", () => {
  // with a unit price the exchange changes a house's whole units (F-109); without one only the lines read differ
  describe.each([100, null])("unit price %s", (price) => {
    const funds = [typed("us", price, null), typed("europe", price, null), typed(null, price, null)];
    const b = withCustomEntries(bundle, funds);
    const [us, europe, unsure] = funds.map((f) => wayOf(b, f.id)) as [FundWay, FundWay, FundWay];

    it("each house leaves the less of what it leaves on the two exchanges, and has no price where either has none", () => {
      let both = 0;
      for (const h of houses) {
        const a = left(us, h);
        const e = left(europe, h);
        const want = a === null || e === null ? null : Math.min(a, e);
        expect([h, left(unsure, h)]).toEqual([h, want]);
        if (a !== null && e !== null && a !== e) both++;
      }
      // the comparison means something: some house prices the two exchanges differently
      expect(both).toBeGreaterThan(0);
    });

    it("a house whose lines abroad name one exchange does not sell it, as on the other exchange", () => {
      expect(reasonAt(unsure, "one-zero")).toBe("other-venue");
    });

    it("its reason does not say which exchange the fund trades on, which nobody gave", () => {
      const at = unsure.byHouse["one-zero"];
      expect(at && "reason" in at ? at.reason : null).toEqual({ code: "other-venue", venue: "us", fundVenue: null });
    });

    it("each row names the exchange its price is on (F-63)", () => {
      const priced = houses.flatMap((h) => { const at = unsure.byHouse[h]; return at && "valueN" in at ? [[h, at.venue] as const] : []; });
      expect(priced.length).toBeGreaterThan(3);
      for (const [h, venue] of priced) expect([h, venue === "us" || venue === "europe"]).toEqual([h, true]);
    });
  });

  it("with a unit price, some house buys it in whole units on the exchange it is priced on (F-109)", () => {
    const f = typed(null, 100, null);
    const w = wayOf(withCustomEntries(bundle, [f]), f.id);
    const priced = houses.flatMap((h) => { const at = w.byHouse[h]; return at && "valueN" in at ? [at] : []; });
    expect(priced.length).toBeGreaterThan(3);
    expect(priced.some((at) => at.units !== null)).toBe(true);
    expect(w.noUnitPrice).toBe(false);
  });
});

describe("a typed fund as saved and read back (F-65, F-109)", () => {
  // a fund abroad as the site saved it before the exchange and the unit price were asked: no field for either
  const PRE_BRANCH = {
    id: "custom-fund-saved-before",
    name: "קרן ששמרתי",
    number: null,
    indexId: SP,
    kind: "abroad",
    fixed: { value: 0.07, unit: "pct_per_year", source: { url: "local", title: "הזנתם", publisher: "אתם", strength: "entered" }, checked: "2026-11-01", effective_from: "2026-11-01", effective_to: null, update_rule: "founder", state: "entered", about: "דמי ניהול שנתיים" },
    variable: null,
    trustee: null,
    hedged: false,
    payout: "accumulating",
    yield: null,
    perYear: null,
    domicile: "IE",
    tracking: null,
    added: "2026-11-01",
  };

  it("a fund saved before the questions loads unchanged, as the same answers saved now with both left empty, and, registered in Ireland, reads as of no known exchange", () => {
    const back = must(validCustomFunds([PRE_BRANCH])[0], "the saved fund read back");
    // the currency it is bought in, asked later, reads as not known for a fund bought abroad on no named exchange
    expect(back).toEqual({ ...PRE_BRANCH, tradesIn: null });
    const now = fundFromDraft({ ...draftAt("abroad", "IE"), name: PRE_BRANCH.name, fixed: 0.07, payout: "accumulating", hedged: false, unitPrice: null }, PRE_BRANCH.id, SP, PRE_BRANCH.added, "USD");
    expect(now).toEqual(back);
    const b = withCustomEntries(bundle, [back, typed("us"), typed("europe")]);
    const old = wayOf(b, back.id);
    const [us, europe] = [typed("us"), typed("europe")].map((f) => wayOf(b, f.id)) as [FundWay, FundWay];
    for (const h of houses) {
      const a = left(us, h);
      const e = left(europe, h);
      expect([h, left(old, h)]).toEqual([h, a === null || e === null ? null : Math.min(a, e)]);
    }
  });

  it("the exchange and the unit price are kept through a save and a reload", () => {
    const f = typed("europe", 87.5);
    const back = must(validCustomFunds([JSON.parse(JSON.stringify(f))])[0], "the fund read back");
    expect(back).toEqual(f);
    expect(recordOfFund(back, "USD").share_price).toMatchObject({ value: 87.5, unit: "usd", state: "entered" });
  });

  it("a unit price keeps the day it was typed when saved again unchanged, and takes the day it is changed", () => {
    const first = typed("us", 100);
    const draft = { ...fundDraftOf(first), buyAt: "us-usd" as const };
    const same = fundFromDraft(draft, first.id, SP, "2099-01-01", "USD", first);
    expect(same.unitPrice).toEqual(first.unitPrice);
    const changed = fundFromDraft({ ...draft, unitPrice: { value: 101, unit: "usd" } }, first.id, SP, "2099-01-01", "USD", first);
    expect(changed.unitPrice?.checked).toBe("2099-01-01");
  });

  it("a unit price in a unit its kind is not typed in is not read back: a fund in Tel Aviv in agorot, a fund abroad in its currency", () => {
    const etf = fundFromDraft({ ...draftAt("tase", "IL"), name: "סל", fixed: 0.1, variable: 0, trustee: 0, payout: "accumulating", hedged: false, unitPrice: { value: 12_345, unit: "agorot" } }, "custom-fund-etf", SP, t, "USD");
    expect(etf.unitPrice?.unit).toBe("agorot");
    const etfPrice = must(etf.unitPrice, "the ETF's unit price");
    const inShekels = { ...etf, id: "custom-fund-etf-nis", unitPrice: { ...etfPrice, unit: "nis" } };
    const abroadInAgorot = { ...typed("us", 100), unitPrice: { ...must(typed("us", 100).unitPrice, "the fund's unit price"), unit: "agorot" } };
    const [a, b, c] = validCustomFunds(JSON.parse(JSON.stringify([etf, inShekels, abroadInAgorot])));
    expect(a?.unitPrice).toEqual(etf.unitPrice);
    expect(b?.id).toBe(inShekels.id);
    expect(b?.unitPrice).toBeUndefined();
    expect(c?.unitPrice).toBeUndefined();
  });
});

describe("a unit price typed in agorot for a fund bought in Tel Aviv (F-109, ETF-32)", () => {
  it("is read as a hundredth of a shekel: every house leaves what it leaves on the same fund priced in shekels", () => {
    const draft = { ...draftAt("tase", "IL"), fixed: 0.1, variable: 0, trustee: 0, payout: "accumulating" as const, hedged: false, unitPrice: { value: 12_345, unit: "agorot" as const } };
    const etf = fundFromDraft({ ...draft, name: "סל באגורות" }, "custom-fund-etf-agorot", SP, t, "USD");
    expect(etf.unitPrice?.unit).toBe("agorot");
    // the same fund, its price in shekels as a collected record's NAV would be: a record, since the page reads no typed price in shekels
    const shekels = fundFromDraft({ ...draft, name: "סל בשקלים" }, "custom-fund-etf-shekels", SP, t, "USD");
    const inShekels: CustomFund = { ...shekels, unitPrice: { ...must(shekels.unitPrice, "the fund's unit price"), value: 123.45, unit: "nis" } };
    const b0 = withCustomEntries(bundle, [etf]);
    const b = { ...b0, funds: [...b0.funds, recordOfFund(inShekels, "USD")] };
    const a = wayOf(b, etf.id);
    const s = wayOf(b, inShekels.id);
    const priced = houses.filter((h) => left(s, h) !== null);
    expect(priced.length).toBeGreaterThan(3);
    expect(priced.some((h) => (s.byHouse[h] as WayPrice).units !== null)).toBe(true);
    for (const h of houses) expect([h, left(a, h)]).toEqual([h, left(s, h)]);
  });
});

describe("an account made from Interactive Israel's price list prices a typed fund on every answer (F-128)", () => {
  const data = feesData();
  const deal = must(fillDeal({ ...newDeal("brokerage-account", "interactive-israel"), id: "deal-interactive-israel" }, "house:interactive-israel", data, t), "Interactive Israel's deal");
  const pid = dealProviderId(deal.id);
  // its US line is a price per share (BRK-40), so the fund's unit price is typed
  const unsureFund = typed(null, 100, null);
  const funds = [typed("us", 100, null), typed("europe", 100, null), unsureFund];
  const bare = typed("us");
  const b = withDeals(withCustomEntries(bundle, [...funds, bare]), [deal], data.kinds);
  const ix = indexOf(b);
  const [us, europe, unsure] = funds.map((f) => dealOnPlan({ bundle: b, index: ix, plan, fundId: f.id, providerId: pid }));
  const valueOf = (d: DealOnPlan | null | undefined) => (d?.kind === "ok" ? d.valueN : null);

  it("has a sum on each exchange and, with neither the exchange nor the country, the less of the two", () => {
    expect(valueOf(us)).not.toBeNull();
    expect(valueOf(europe)).not.toBeNull();
    expect(valueOf(unsure)).toBe(Math.min(must(valueOf(us), "US"), must(valueOf(europe), "Europe")));
  });

  it("with no unit price, has none on the US exchange for the reason its house's row has none", () => {
    const d = dealOnPlan({ bundle: b, index: ix, plan, fundId: bare.id, providerId: pid });
    const house = wayOf(b, bare.id).byHouse["interactive-israel"];
    expect(d?.kind === "fail" ? d.reason.code : null).toBe("needs-share-price");
    expect(house && "reason" in house ? house.reason.code : null).toBe("needs-share-price");
  });

  it("its fees read for the fund not known are read on the exchange its sum is on, so none lacks a case", () => {
    const listing = unsure?.listing;
    expect(listing).toBe(must(valueOf(us), "US") <= must(valueOf(europe), "Europe") ? "us" : "europe");
    // the page's own entry for the fund at the deal carries the same exchange
    expect(wayOf(b, unsureFund.id).byHouse[pid]?.listing).toBe(listing);
    const run = must(dealRunOf({ bundle: b, index: ix, plan, fundId: unsureFund.id, listing }), "the deal's run");
    expect(run.listing).toBe(listing);
    const on = feesOnPlan(deal, run, planContextOf(b, deal, data.kinds, false));
    expect(on.filter((x) => x.on === "missing")).toEqual([]);
  });

  it("with no case for Europe in its trade fee, has no sum, and its failure is read on Europe, where the case lacks", () => {
    const trade = must(deal.fees.find((f) => f.kind === "trade"), "the deal's trade fee");
    if (!("cases" in trade) || !trade.cases) throw new Error("the trade fee has cases");
    const europeCase = must(trade.cases.find((c) => JSON.stringify(c).includes("europe")), "the trade fee's case for Europe");
    const usOnly = { ...deal, id: "deal-ii-us-only", fees: deal.fees.map((f) => (f === trade ? { ...trade, cases: trade.cases.filter((c) => c !== europeCase) } : f)) };
    const pidUs = dealProviderId(usOnly.id);
    const b2 = withDeals(withCustomEntries(bundle, funds), [usOnly], data.kinds);
    // on the US exchange alone it prices the fund; on Europe it lacks the case
    const [onUs, onEurope] = funds;
    expect(valueOf(dealOnPlan({ bundle: b2, index: ix, plan, fundId: must(onUs, "the US fund").id, providerId: pidUs }))).not.toBeNull();
    const eu = dealOnPlan({ bundle: b2, index: ix, plan, fundId: must(onEurope, "the Europe fund").id, providerId: pidUs });
    expect(eu?.kind === "fail" ? eu.reason.code : null).toBe("deal-unpriced");
    const got = dealOnPlan({ bundle: b2, index: ix, plan, fundId: unsureFund.id, providerId: pidUs });
    expect(got?.kind).toBe("fail");
    expect(got?.kind === "fail" ? got.reason.code : null).toBe("deal-unpriced");
    expect(got?.listing).toBe("europe");
    expect(wayOf(b2, unsureFund.id).byHouse[pidUs]?.listing).toBe("europe");
    // the run the case is offered for is Europe's, and on it the trade fee lacks its case
    const run = must(dealRunOf({ bundle: b2, index: ix, plan, fundId: unsureFund.id, listing: got?.listing }), "the deal's run");
    expect(whatOfRun(run)).toBe("europe");
    expect(feesOnPlan(usOnly, run, planContextOf(b2, usOnly, data.kinds, false)).filter((x) => x.on === "missing").map((x) => x.fee)).toEqual([trade.id]);
  });
});

describe("the popup's place tile (F-128)", () => {
  const data = feesData();
  const deal = must(fillDeal({ ...newDeal("brokerage-account", "interactive-israel"), id: "deal-ii-tiles" }, "house:interactive-israel", data, t), "Interactive Israel's deal");
  const pid = dealProviderId(deal.id);
  const b = withDeals(bundle, [deal], data.kinds);
  const view = buildInvest({ bundle: b, index: indexOf(b), plan });
  const funds = view.options.flatMap((o) => o.funds);
  const named = must(funds[0], "a fund").rec.id;
  const other = must(funds[1], "a second fund").rec.id;
  const ok = (valueN: number): DealOnPlan => ({ kind: "ok", valueN, byFee: {}, accountCost: 0, reach: [], figure: () => { throw new Error("not read"); }, left: () => { throw new Error("not read"); } });

  it("ranks the deal where it has an amount on the named fund", () => {
    const got = new Map([[named, ok(100_000)], [other, ok(90_000)]]);
    expect(dealTiles(view, got, pid, deal.name, "interactive-israel", named, funds).place).not.toBeNull();
  });

  it("has no place where the named fund has no amount, though another fund has one", () => {
    const got = new Map<string, DealOnPlan>([[named, { kind: "fail", reason: { code: "data-missing", recorded: null } }], [other, ok(90_000)]]);
    const tiles = dealTiles(view, got, pid, deal.name, "interactive-israel", named, funds);
    expect(tiles.left).toBeNull();
    expect(tiles.place).toBeNull();
  });
});

describe("what the record says of the exchange (F-65)", () => {
  it("says it is not known where the exchange was not given and the country is not the United States; registered there it follows it, as a collected record's", () => {
    expect(recordOfFund(typed(null, null, null), "USD").exchange).toBe("unknown");
    expect(recordOfFund(typed(null, null, "IE"), "USD").exchange).toBe("unknown");
    expect(recordOfFund(typed(null, null, "US"), "USD").exchange).toBeUndefined();
    expect(recordOfFund(typed("us", null, null), "USD").exchange).toBe("us");
  });

  it("a collected record with no exchange ticker, registered outside the United States, names no exchange and is never priced: the data check refuses it", () => {
    const { exchange: _, ...rec } = recordOfFund(typed(null, 100, null), "USD");
    const collected: FundRecord = { ...rec, id: "collected-lu", domicile: "LU" };
    expect(venueOfFund(collected)).toBeNull();
    const b = { ...bundle, funds: [...bundle.funds, collected] };
    expect(() => wayOf(b, collected.id)).toThrow(/names no exchange/);
  });
  it("a collected record's tickers name its exchange, the keys of SIX and Deutsche Boerse among them", () => {
    const { exchange: _, ...rec } = recordOfFund(typed(null, 100, null), "USD");
    for (const key of ["SIX", "Deutsche Boerse", "Xetra", "LSE_GBP", "Euronext Amsterdam"]) expect([key, venueOfFund({ ...rec, domicile: "IE", identifiers: { ...rec.identifiers, ticker: { [key]: "X" } } })]).toEqual([key, "europe"]);
    for (const key of ["NYSE Arca", "NASDAQ"]) expect([key, venueOfFund({ ...rec, domicile: "IE", identifiers: { ...rec.identifiers, ticker: { [key]: "X" } } })]).toEqual([key, "us"]);
  });
});

describe("the caution of a fund whose exchange is not known is on its figure (F-65)", () => {
  const unsure = typed(null, 100, null);
  const known = typed("us", 100, null);
  const b = withCustomEntries(bundle, [unsure, known]);
  const pricedAt = (w: FundWay) => houses.flatMap((h) => { const at = w.byHouse[h]; return at && "valueN" in at ? [at as WayPrice] : []; });

  it("what it leaves at every account carries the doubt that says so, and that an account priced on one exchange only has none", () => {
    const priced = pricedAt(wayOf(b, unsure.id));
    expect(priced.length).toBeGreaterThan(3);
    for (const at of priced) expect([at.providerId, at.value.doubt]).toEqual([at.providerId, copy.customEntries.exchangeUnknownDoubt]);
  });

  it("a fund whose exchange was given carries none", () => {
    for (const at of pricedAt(wayOf(b, known.id))) expect([at.providerId, at.value.doubt]).toEqual([at.providerId, undefined]);
  });

  it("the pair's own figure, which its headline and receipt show, carries the same doubt as its row", () => {
    const index = must(indexById(b, SP), SP);
    const at = must(pricedAt(wayOf(b, unsure.id))[0], "a priced account");
    const pc = must(pairCosts({ bundle: b, index, plan, fundId: unsure.id, providerId: at.providerId }), "the pair");
    expect(pc.left.doubt).toBe(copy.customEntries.exchangeUnknownDoubt);
    const pk = must(pairCosts({ bundle: b, index, plan, fundId: known.id, providerId: at.providerId }), "the known pair");
    expect(pk.left.doubt).toBeUndefined();
  });

  it("the receipt's total and its gain, worked out from the pair's figure, carry the same doubt and open ETF-95's card", () => {
    const index = must(indexById(b, SP), SP);
    const at = must(pricedAt(wayOf(b, unsure.id))[0], "a priced account");
    const pc = must(pairCosts({ bundle: b, index, plan, fundId: unsure.id, providerId: at.providerId }), "the pair");
    const total = leftOf(pc, bundle.today);
    // the sum's inputs are the figures it adds up (`sumOf`)
    const gainOf = (v: SiteValue) => v.computed_from?.inputs[copy.receipt.gain] as SiteValue | undefined;
    const gain = must(gainOf(total), "the gain");
    for (const v of [pc.left, total, gain]) {
      expect(v.doubt).toBe(copy.customEntries.exchangeUnknownDoubt);
      expect(v.doubtRules).toEqual(["ETF-95"]);
    }
    const pk = must(pairCosts({ bundle: b, index, plan, fundId: known.id, providerId: at.providerId }), "the known pair");
    const knownTotal = leftOf(pk, bundle.today);
    expect(knownTotal.doubt).toBeUndefined();
    expect(must(gainOf(knownTotal), "the known gain").doubt).toBeUndefined();
  });
});

describe("a house with lines on both exchanges that prices one of them and not the other (F-65)", () => {
  // Interactive Israel's list prices each exchange on its own line: its line for Europe is left with no value, so it has no price there
  const europeLine = "interactive-israel-buy-sell-europe";
  const snapshots = bundle.snapshots.map((s) => (s.id === "interactive-israel" ? { ...s, lines: s.lines.map((l) => (l.id === europeLine ? { ...l, rate: { ...l.rate, value: null } } : l)) } : s));
  const unsure = typed(null, 100, null);
  const onEurope = typed("europe", 100, null);
  const onUs = typed("us", 100, null);
  const b = withCustomEntries({ ...bundle, snapshots }, [unsure, onEurope, onUs]);
  const at = (f: CustomFund) => wayOf(b, f.id).byHouse["interactive-israel"];

  it("has no price for a fund with neither the exchange nor the country, with the reason it has none on the failing exchange", () => {
    expect(left(wayOf(b, onUs.id), "interactive-israel")).not.toBeNull();
    const failing = at(onEurope);
    expect(failing && "reason" in failing ? failing.reason.code : null).not.toBeNull();
    const got = at(unsure);
    expect(got && "valueN" in got).toBe(false);
    expect(got && "reason" in got ? got.reason : null).toEqual(failing && "reason" in failing ? failing.reason : "a reason on Europe");
    expect(got?.listing).toBe("europe");
  });
});

describe("the generic fund abroad at a deal priced on both exchanges (F-63)", () => {
  const data = feesData();
  // Psagot's deal, its trade in the United States priced as its trade in Europe is, a share of the trade with a minimum, in dollars: the
  // generic fund has no unit price, which its own price per unit there would need, so the deal is priced on both exchanges
  const filled = must(fillDeal({ ...newDeal("brokerage-account", "psagot"), id: "deal-psagot" }, "house:psagot", data, t), "Psagot's deal");
  const filledTrade = must(filled.fees.find((f) => f.kind === "trade"), "the deal's trade fee");
  if (!("cases" in filledTrade) || !filledTrade.cases) throw new Error("the trade fee has cases");
  const caseOn = (exchange: FundExchange) => must(filledTrade.cases?.find((c) => JSON.stringify(c.when).includes(`"${exchange}"`)), `the trade fee's case for ${exchange}`);
  const usCase = caseOn("us");
  const europeStages = caseOn("europe").stages.map((st) => ({ ...st, price: { ...st.price, currency: "USD" } }));
  const trade = { ...filledTrade, cases: filledTrade.cases.map((c) => (c === usCase ? ({ ...usCase, stages: europeStages } as typeof c) : c)) };
  const deal = { ...filled, fees: filled.fees.map((f) => (f === filledTrade ? trade : f)) };
  const cases = trade.cases;
  // the deal without its trade fee's case for the other exchange, so it is priced on this one alone
  const onlyOn = (exchange: FundExchange) => {
    const other = exchange === "us" ? "europe" : "us";
    return { ...deal, id: `deal-psagot-only-${exchange}`, fees: deal.fees.map((f) => (f === trade ? { ...trade, cases: cases.filter((c) => !JSON.stringify(c).includes(`"${other}"`)) } : f)) };
  };
  const deals = [deal, onlyOn("us"), onlyOn("europe")];
  const b = withDeals(bundle, deals, data.kinds);
  const view = buildInvest({ bundle: b, index: indexOf(b), plan });
  const cells = must(view.options.find((o) => o.id === "abroad"), "the option abroad").cells;
  const cellOf = (id: string) => must(cells.find((c) => c.providerId === dealProviderId(id)), `the cell of ${id}`);

  it("is priced on the exchange whose reading leaves the more, its account costing what it costs on that exchange alone", () => {
    const us = cellOf("deal-psagot-only-us");
    const europe = cellOf("deal-psagot-only-europe");
    expect(us.kind).toBe("cost");
    expect(europe.kind).toBe("cost");
    const both = cellOf(deal.id);
    const cheaper = must(us.costN, "the US cost") <= must(europe.costN, "the Europe cost") ? us : europe;
    expect(us.costN).not.toBe(europe.costN);
    expect([both.costN, both.venue]).toEqual([cheaper.costN, cheaper.venue]);
  });
});

describe("the unit price as the panel types it (F-109)", () => {
  // abroad, not sure where: the fund's currency stands in by its index's (`fundCurrencyOf`)
  const abroad = { ...draftAt("abroad", "IE"), name: "קרן", fixed: 0.07, payout: "accumulating" as const, hedged: false, unitPrice: { value: 100, unit: "usd" as const } };

  it("is cleared on a kind whose price is typed in another unit, and kept on one typed in the same unit", () => {
    expect(draftWithPlace(abroad, { buyAt: "tase", country: "IL" }, "USD").unitPrice).toBeNull();
    expect(draftWithPlace(abroad, { buyAt: "manager", country: "IL" }, "USD").unitPrice).toBeNull();
    expect(draftWithPlace(abroad, { buyAt: "europe-eur", country: "IE" }, "USD").unitPrice).toBeNull();
    expect(draftWithPlace(abroad, { buyAt: "europe-usd", country: "IE" }, "USD").unitPrice).toEqual(abroad.unitPrice);
    const etf = { ...abroad, ...draftAt("tase", "IL"), unitPrice: { value: 12_345, unit: "agorot" as const } };
    expect(draftWithPlace(etf, { buyAt: "tase", country: "IE" }, "USD").unitPrice).toEqual(etf.unitPrice);
  });

  it("is not saved in a unit other than the kind's at the fund's currency", () => {
    expect(fundFromDraft({ ...abroad, ...draftAt("tase", "IL") }, "custom-fund-a", SP, t, "USD").unitPrice).toBeUndefined();
    expect(fundFromDraft(abroad, "custom-fund-b", SP, t, "EUR").unitPrice).toBeUndefined();
    expect(fundFromDraft(abroad, "custom-fund-c", SP, t, "USD").unitPrice).toMatchObject({ value: 100, unit: "usd" });
  });

  it("is not read back where it is not a price, and the fund is kept", () => {
    const f = typed("us", 100);
    const price = must(f.unitPrice, "the fund's unit price");
    const back = validCustomFunds(JSON.parse(JSON.stringify([{ ...f, id: "custom-fund-neg", unitPrice: { ...price, value: -5 } }, { ...f, id: "custom-fund-text", unitPrice: { ...price, value: "abc" } }])));
    expect(back.map((x) => [x.id, x.unitPrice])).toEqual([["custom-fund-neg", undefined], ["custom-fund-text", undefined]]);
  });

  it("is not read on a fund whose currency stands in by its index's, where the index is in another currency than the price, and the fund is bought by amount", () => {
    const f = typed(null, 100);
    const exposures = bundle.exposures.map((e) => (e.id === SP ? { ...e, currency: "EUR" } : e));
    const [read] = fundsAsRead({ exposures }, [f]);
    expect(read?.id).toBe(f.id);
    expect(read?.unitPrice).toBeUndefined();
    expect(fundsAsRead(bundle, [f])[0]).toBe(f);
  });
});
