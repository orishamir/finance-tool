// A deal priced on the indices page's plan as the popup prices it (withDeals, then dealOnFunds), with a fee switched off (fee-deal/off.ts):
// priced on the deal as it is counted, it charges nothing for that fee and leaves more than with the fee on. Over the live data, so it
// checks only what holds whatever the prices are: the fee picked charges something with it on. No Hebrew.
import { afterEach, describe, expect, it } from "vitest";
import { dealOnFunds, dealRunOf, indexById, type DealOnPlan, type IndexRef } from "../invest";
import type { IndicesBundle } from "../providers";
import { countedDeal, feesOff } from "../fee-deal/off";
import type { FeeDeal } from "../fee-deal/model";
import { dealProviderId, withDeals } from "./bundle";
import { bundle, data, fromHouse, plan } from "./plan-fixtures";

afterEach(() => feesOff.reset());

const INDEX = "index-ta125";

/** The index in bundle `b`, which prices it. */
function indexOf(b: IndicesBundle): IndexRef {
  const ix = indexById(b, INDEX);
  if (!ix) throw new Error(`the bundle prices ${INDEX}`);
  return ix;
}

/** The deal priced alone on a fund of the index the deal's run buys as a fund traded in Tel Aviv, as the popup prices it. */
function priced(deal: FeeDeal, fundId: string): Extract<DealOnPlan, { kind: "ok" }> {
  const b = withDeals(bundle, [deal], data.kinds);
  const got = dealOnFunds({ bundle: b, index: indexOf(b), plan, fundIds: [fundId], providerId: dealProviderId(deal.id) }).get(fundId);
  if (got?.kind !== "ok") throw new Error(`the deal prices fund ${fundId}`);
  return got;
}

describe("a deal priced with a fee switched off", () => {
  it("charges nothing for the fee and leaves more than with it on", () => {
    const deal = fromHouse("psagot");
    const b = withDeals(bundle, [deal], data.kinds);
    const fundId = bundle.funds.find((f) => dealRunOf({ bundle: b, index: indexOf(b), plan, fundId: f.id })?.instrumentClass === "etf_units")?.id;
    if (!fundId) throw new Error("the index has a fund traded in Tel Aviv");
    const on = priced(deal, fundId);
    // the fee that charges the most on the plan with every fee on
    const most = Object.entries(on.byFee).sort((x, y) => y[1] - x[1])[0];
    if (!most) throw new Error("the deal's fees charge on the plan");
    const [feeId, cost] = most;
    expect(cost).toBeGreaterThan(0);
    feesOff.set(deal, feeId, true);
    const off = priced(countedDeal(deal, feesOff.get()), fundId);
    expect(off.byFee[feeId]).toBeUndefined();
    expect(off.accountCost).toBeLessThan(on.accountCost);
    expect(off.valueN).toBeGreaterThan(on.valueN);
    // every other fee still charges (a share of what is held a little more, as more is held without the fee)
    expect(Object.keys(off.byFee).sort()).toEqual(Object.keys(on.byFee).filter((id) => id !== feeId).sort());
  });
});

describe("a deal priced on a fund whose figure rests on the site's reading of an open tax index (D119, method §13)", () => {
  it("tags what is left, which rests on the exit tax, and none of the fee costs before it", () => {
    const deal = fromHouse("psagot");
    const b = withDeals(bundle, [deal], data.kinds);
    const sp = indexById(b, "index-sp500");
    if (!sp) throw new Error("the bundle prices the S&P 500");
    // a Tel Aviv line of a foreign fund whose annex states no index, its documents read: the site's reading of TXF-04
    const fundIds = bundle.funds.filter((f) => f.exposure_id === "index-sp500" && f.domicile !== "IL" && f.trading_currency_on_tase !== null && !f.tax_ruling?.index).map((f) => f.id);
    const got = [...dealOnFunds({ bundle: b, index: sp, plan, fundIds, providerId: dealProviderId(deal.id) }).values()].filter((x): x is Extract<DealOnPlan, { kind: "ok" }> => x.kind === "ok");
    expect(got.length).toBeGreaterThan(0);
    for (const at of got) {
      const left = at.left(1_000, "left");
      expect(left.labels).toContainEqual({ code: "reading", ruleId: "TXF-04" });
      expect(left.doubt).toBeUndefined();
      expect(at.figure(10, "fee").labels?.some((l) => l.ruleId === "TXF-04") ?? false).toBe(false);
    }
  });
});
