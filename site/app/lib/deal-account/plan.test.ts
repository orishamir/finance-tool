// F-128 on the indices page: a securities-account deal read for the page's plan, and priced beside the houses. A deal filled from a house's
// whole price list leaves what the house's own row leaves on the same fund, so the popup's difference starts at nothing.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { buildInvest, indexById } from "../invest";
import type { WorkbenchInputs } from "../providers";
import { fillDeal } from "../fee-deal/templates";
import { newDeal, type FeeDeal } from "../fee-deal/model";
import { dealProviderId, withDeals } from "./bundle";
import { feesOnPlan, missingKey, missingOf, planDeal, whatOfRun } from "./plan";

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
  const houses = ["psagot", "ibi", "meitav-trade", "leumi", "discount"];
  const b = withDeals(bundle, houses.map(fromHouse), data.kinds);
  const view = buildInvest({ bundle: b, index: indexById(b, "index-ta125")!, plan });

  it.each(houses)("%s: the same value left on every fund both price, to the shekel", (id) => {
    const house = view.houses.find((r) => r.provider.id === id)!;
    const deal = view.houses.find((r) => r.provider.id === dealProviderId(`deal-${id}`))!;
    expect(deal.provider.custom).toBe(true);
    const both = house.entries.flatMap((e) => { const d = deal.entries.find((x) => x.fund.rec.id === e.fund.rec.id); return e.price && d?.price ? [[e.price.valueN, d.price.valueN]] : []; });
    expect(both.length).toBeGreaterThan(0);
    for (const [h, d] of both) expect(Math.round(d!)).toBe(Math.round(h!));
  });

  it("leaves a bank's mutual funds without a price where its deal has no case for them, with what is missing", () => {
    const deal = view.houses.find((r) => r.provider.id === dealProviderId("deal-leumi"))!;
    const mutual = deal.entries.find((e) => e.fund.option === "il-tracking");
    expect(mutual?.price).toBeNull();
    expect(JSON.stringify(mutual?.reason)).toContain("deal-unpriced");
  });

  it("the bank's current account is not counted on the bank the person marks as theirs", () => {
    const own = buildInvest({ bundle: b, index: indexById(b, "index-ta125")!, plan: { ...plan, currentAccounts: { own: "leumi" } } });
    const at = (v: typeof view, pid: string) => v.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.fund.option === "il-etf")!.price!.valueN;
    expect(at(own, dealProviderId("deal-leumi"))).toBeGreaterThan(at(view, dealProviderId("deal-leumi")));
    expect(Math.round(at(own, dealProviderId("deal-leumi")))).toBe(Math.round(at(own, "leumi")));
  });
});
