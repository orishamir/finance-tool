// A fund the person types abroad (D44): the exchange it trades on and its unit price, as they say them (F-65, F-109, F-128). Said, the fund
// is read on that exchange everywhere, as a collected fund whose tickers name it; not said, every account is read on each exchange and
// priced on the one that leaves the most, a deal filled from a house's list among them. No figure here is written by hand: each side of a
// comparison is the page's own pricing of another fund or another answer.
import { describe, expect, it } from "vitest";
import type { FundRecord } from "@finance-tool/schema";
import { fundDraftOf, fundFromDraft, recordOfFund, validCustomFunds, withCustomEntries, type CustomFund, type FundExchange } from "./custom-entries";
import { buildInvest, dealOnPlan, dealRunOf, fundWayAt, indexById, type DealOnPlan, type FundWay, type WayPrice } from "./invest";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { entered } from "./value";
import { feesData } from "./fees.server";
import { fillDeal } from "./fee-deal/templates";
import { newDeal } from "./fee-deal/model";
import { dealProviderId, planContextOf, withDeals } from "./deal-account/bundle";
import { feesOnPlan } from "./deal-account/plan";
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

/** An Irish accumulating fund on the S&P 500, unhedged, its exchange as said (null: not sure), with or without a unit price in dollars. */
const typed = (exchange: FundExchange | null, unitPrice: number | null = null): CustomFund =>
  fundFromDraft({ ...fundDraftOf(null, "abroad"), name: `שלי ${exchange ?? "לא ידוע"}`, fixed: 0.07, payout: "accumulating", hedged: false, domicile: "IE", exchange, unitPrice }, `custom-fund-${exchange ?? "unsure"}${unitPrice ? "-priced" : ""}`, SP, t, "USD");

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

describe("a fund typed abroad whose exchange is not known (F-65)", () => {
  const funds = [typed("us"), typed("europe"), typed(null)];
  const b = withCustomEntries(bundle, funds);
  const [us, europe, unsure] = funds.map((f) => wayOf(b, f.id)) as [FundWay, FundWay, FundWay];

  it("each house leaves the more of what it leaves on the two exchanges, and is priced where either prices it", () => {
    let both = 0;
    for (const h of houses) {
      const a = left(us, h);
      const e = left(europe, h);
      const want = a === null && e === null ? null : Math.max(a ?? -Infinity, e ?? -Infinity);
      expect([h, left(unsure, h)]).toEqual([h, want]);
      if (a !== null && e !== null && a !== e) both++;
    }
    // the comparison means something: some house prices the two exchanges differently
    expect(both).toBeGreaterThan(0);
  });

  it("a fund saved before the question was asked loads unchanged and reads as not sure", () => {
    const { exchange: _, ...saved } = typed(null);
    const back = must(validCustomFunds([JSON.parse(JSON.stringify(saved))])[0], "the saved fund read back");
    expect(back).toEqual(saved);
    expect(recordOfFund(back, "USD").exchange).toBeNull();
    const b2 = withCustomEntries(bundle, [back]);
    const old = wayOf(b2, back.id);
    for (const h of houses) expect([h, left(old, h)]).toEqual([h, left(unsure, h)]);
  });

  it("the exchange and the unit price are kept through a save and a reload", () => {
    const f = typed("europe", 87.5);
    const back = must(validCustomFunds([JSON.parse(JSON.stringify(f))])[0], "the fund read back");
    expect(back).toEqual(f);
    expect(recordOfFund(back, "USD").share_price).toMatchObject({ value: 87.5, unit: "usd", state: "entered" });
  });
});

describe("an account made from Interactive Israel's price list prices a typed fund on every answer (F-128)", () => {
  const data = feesData();
  const deal = must(fillDeal({ ...newDeal("brokerage-account", "interactive-israel"), id: "deal-interactive-israel" }, "house:interactive-israel", data, t), "Interactive Israel's deal");
  const pid = dealProviderId(deal.id);
  // its US line is a price per share (BRK-40), so the fund's unit price is typed
  const unsureFund = typed(null, 100);
  const funds = [typed("us", 100), typed("europe", 100), unsureFund];
  const bare = typed("us");
  const b = withDeals(withCustomEntries(bundle, [...funds, bare]), [deal], data.kinds);
  const ix = indexOf(b);
  const [us, europe, unsure] = funds.map((f) => dealOnPlan({ bundle: b, index: ix, plan, fundId: f.id, providerId: pid }));
  const valueOf = (d: DealOnPlan | null | undefined) => (d?.kind === "ok" ? d.valueN : null);

  it("has a sum on each exchange and when the exchange is not known, the more of the two", () => {
    expect(valueOf(us)).not.toBeNull();
    expect(valueOf(europe)).not.toBeNull();
    expect(valueOf(unsure)).toBe(Math.max(must(valueOf(us), "US"), must(valueOf(europe), "Europe")));
  });

  it("with no unit price, has none on the US exchange for the reason its house's row has none", () => {
    const d = dealOnPlan({ bundle: b, index: ix, plan, fundId: bare.id, providerId: pid });
    const house = wayOf(b, bare.id).byHouse["interactive-israel"];
    expect(d?.kind === "fail" ? d.reason.code : null).toBe("needs-share-price");
    expect(house && "reason" in house ? house.reason.code : null).toBe("needs-share-price");
  });

  it("its fees read for the fund not known are read on the exchange its sum is on, so none lacks a case", () => {
    const run = must(dealRunOf({ bundle: b, index: ix, plan, fundId: unsureFund.id, providerId: pid }), "the deal's run");
    expect(run.listing).toBe(must(valueOf(us), "US") >= must(valueOf(europe), "Europe") ? "us" : "europe");
    const on = feesOnPlan(deal, run, planContextOf(b, deal, data.kinds, false));
    expect(on.filter((x) => x.on === "missing")).toEqual([]);
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
