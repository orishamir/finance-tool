// F-128 on the indices page: a securities-account deal read for the page's plan, and priced beside the houses. A deal filled from a house's
// whole price list leaves what the house's own row leaves on the same fund, so the popup's difference starts at nothing.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { buildInvest, indexById } from "../invest";
import type { WorkbenchInputs } from "../providers";
import { fillDeal, templateOptions } from "../fee-deal/templates";
import { newDeal, type FeeDeal } from "../fee-deal/model";
import { addBy } from "../fee-deal/edits/case";
import { dealProviderId, lineValueOf, withDeals } from "./bundle";
import { feesOnPlan, missingKey, missingOf, planDeal, planWhat, whatOfRun } from "./plan";

const data = feesData();
const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 10_000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  returnFromParameter: false, currentAccounts: { own: null },
};
const fromHouse = (id: string): FeeDeal => fillDeal({ ...newDeal("brokerage-account", id), id: `deal-${id}` }, `house:${id}`, data, t)!;
const run = { instrumentClass: "etf_units", listing: "tase" as const, currency: null, distributes: false, fx: {} };
const ctx = { kinds: data.kinds, today: t, currentAccounts: { own: null } };

describe("F-128 the plan sets what is bought and the channel", () => {
  it("reads what is bought from the fund, and the internet as the channel, over the deal's own picks", () => {
    const d = planDeal({ ...fromHouse("psagot"), readFor: [{ by: "what", is: "us" }, { by: "channel", is: "branch" }] }, run);
    expect(d.readFor).toEqual([{ by: "what", is: "tase" }, { by: "channel", is: "direct" }]);
    expect(whatOfRun({ instrumentClass: "mutual_fund_units", listing: undefined })).toBe("mutualFunds");
    expect(whatOfRun({ instrumentClass: "foreign_securities", listing: "europe" })).toBe("europe");
  });

  it("names why each fee it never charges is not charged", () => {
    const deal = fromHouse("leumi");
    const on = feesOnPlan(deal, run, ctx);
    const kindOf = (id: string) => deal.fees.find((f) => f.id === id)!.kind;
    const off = Object.fromEntries(on.flatMap((x) => (x.on === "off" ? [[kindOf(x.fee), x.why]] : [])));
    expect(off).toMatchObject({ fx: "shekel-fund", transfer_out: "transfer-out" });
    expect(on.filter((x) => x.on === "charged").map((x) => kindOf(x.fee)).sort()).toEqual(["custody", "trade"]);
  });

  it("says what a fee lacks where the deal has no case for what the plan buys", () => {
    const deal = fromHouse("leumi");
    const on = feesOnPlan(deal, { ...run, instrumentClass: "mutual_fund_units", listing: undefined as never }, ctx);
    const miss = on.find((x) => x.on === "missing");
    expect(miss && miss.on === "missing" && miss.missing).toMatchObject({ why: "case", kind: "trade" });
    expect(missingOf(missingKey({ why: "case", fee: deal.fees[0]!.id, kind: "trade" }))).toEqual({ why: "case", fee: deal.fees[0]!.id, kind: "trade" });
  });
});

describe("F-128 a deal filled from a house prices as the house does", () => {
  const houses = templateOptions("brokerage-account", data, t).filter((o) => o.source === "house").map((o) => o.id.slice("house:".length));
  const b = withDeals(bundle, houses.map(fromHouse), data.kinds);
  const indices = bundle.exposures.flatMap((e) => (indexById(b, e.id) ? [e.id] : []));
  const views = new Map(indices.map((ix) => [ix, buildInvest({ bundle: b, index: indexById(b, ix)!, plan })]));
  const view = views.get("index-ta125")!;
  /**
   * The known exception: a house whose row buys each month's purchase of a fund bought abroad on its recurring plan (F-12, F-13's standing
   * lines), which a deal cannot say a purchase is placed by, so the deal prices that purchase at the regular price.
   */
  const RECURRING_ABROAD = new Set(["interactive-israel", "interactive-brokers"]);

  it("fills a deal from every house's template", () => expect(houses.length).toBeGreaterThanOrEqual(17));

  it.each(houses)("%s: the same value left on every fund the house's row prices, to the shekel, on every index", (id) => {
    let compared = 0;
    for (const ix of indices) {
      const v = views.get(ix)!;
      const house = v.houses.find((r) => r.provider.id === id);
      const deal = v.houses.find((r) => r.provider.id === dealProviderId(`deal-${id}`))!;
      if (!house) continue;
      expect(deal.provider.custom).toBe(true);
      for (const e of house.entries) {
        const d = deal.entries.find((x) => x.fund.rec.id === e.fund.rec.id);
        compared++;
        if (RECURRING_ABROAD.has(id) && e.fund.option === "abroad" && (e.price || d?.price)) {
          // the known exception: both price the fund, and the deal's regular price leaves no more than the row's recurring plan
          expect(e.price && d?.price && d.price.valueN <= e.price.valueN + 0.5).toBeTruthy();
          continue;
        }
        expect([ix, e.fund.rec.id, d?.price ? Math.round(d.price.valueN) : null]).toEqual([ix, e.fund.rec.id, e.price ? Math.round(e.price.valueN) : null]);
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  it("a bank's open mutual fund is bought on its line for securities on the Tel Aviv exchange, as its row buys it (BRK-16)", () => {
    const deal = view.houses.find((r) => r.provider.id === dealProviderId("deal-leumi"))!;
    const mutual = deal.entries.find((e) => e.fund.option === "il-tracking");
    expect(mutual?.price).not.toBeNull();
    expect(planWhat({ instrumentClass: "mutual_fund_units", listing: undefined }, lineValueOf(bundle.snapshots.find((s) => s.id === "leumi")!)).what).toBe("tase");
  });

  it("prices a fee that changes by what the plan's months set, read across their steps (a month's orders, its trading, the balance)", () => {
    const deal = fromHouse("psagot");
    const trade = deal.fees.find((f) => f.kind === "trade")!;
    for (const n of [{ kind: "count", unit: "actions", top: 1 }, { kind: "volume", unit: "ILS", top: 1_000 }, { kind: "portfolioSize", unit: "ILS", top: 50_000 }] as const) {
      const d = { ...deal, id: `deal-steps-${n.kind}`, fees: deal.fees.map((f) => (f === trade ? addBy(f, n) : f)) };
      expect(feesOnPlan(d, run, ctx).find((x) => x.fee === trade.id)?.on).toBe("charged");
      const bs = withDeals(bundle, [d], data.kinds);
      const v = buildInvest({ bundle: bs, index: indexById(bs, "index-ta125")!, plan });
      const at = (pid: string) => v.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.fund.option === "il-etf")!.price!.valueN;
      // each step copies the same prices, so the deal leaves what the house's row leaves
      expect(Math.round(at(dealProviderId(d.id)))).toBe(Math.round(at("psagot")));
    }
  });

  it("the bank's current account is not counted on the bank the person marks as theirs", () => {
    const own = buildInvest({ bundle: b, index: indexById(b, "index-ta125")!, plan: { ...plan, currentAccounts: { own: "leumi" } } });
    const at = (v: typeof view, pid: string) => v.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.fund.option === "il-etf")!.price!.valueN;
    expect(at(own, dealProviderId("deal-leumi"))).toBeGreaterThan(at(view, dealProviderId("deal-leumi")));
    expect(Math.round(at(own, dealProviderId("deal-leumi")))).toBe(Math.round(at(own, "leumi")));
  });
});
