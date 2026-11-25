// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
// Split in four files so the test workers share it (one file was most of `npm test`'s time): this one, render-pair-bars,
// render-sections and render-tiles; the data and helpers they share are in render-fixtures.ts.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices, pairCostsKept } from "../../lib/invest";
import { receiptChain } from "../../lib/receipt";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, bestFor, pickOfHeadline } from "./pair";
import { invest } from "../../copy";
import { providerName } from "./sections";
import { bundle, t, plan, shown, html, nisIn } from "./render-fixtures";
import { PairReceipt } from "./receipt";
import { dealProviderId, withDeals } from "../../lib/deal-account/bundle";
import { data as dealData, fromHouse } from "../../lib/deal-account/plan-fixtures";

describe("the pair set beside the person's (2026-10-28)", () => {
  it("an unhedged pick is set beside the headline; a hedged pick beside the best hedged pair, never one that leaves less", () => {
    // on every index with a hedged fund priced at the headline's house
    let seen = 0;
    for (const index of knownIndices(bundle)) {
      const view = buildInvest({ bundle, index, plan });
      const valueOf = (p: { house: string; fund: string }) => {
        const at = allFunds(view).find((f) => f.rec.id === p.fund)!.byHouse[p.house]!;
        return "valueN" in at ? at.valueN : NaN;
      };
      const head = pickOfHeadline(view);
      const hedged = head && allFunds(view).find((f) => f.rec.hedged === true && "valueN" in (f.byHouse[head.house] ?? {}));
      if (!head || !hedged) continue;
      seen++;
      expect(bestFor(view, head), index.id).toEqual(head);
      const pick = { house: head.house, fund: hedged.rec.id };
      const best = bestFor(view, pick)!;
      expect(allFunds(view).find((f) => f.rec.id === best.fund)!.rec.hedged, index.id).toBe(true);
      expect(valueOf(best), index.id).toBeGreaterThanOrEqual(valueOf(pick));
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe("the receipt's account line is the account's fees on every index (pass 6: the remainder's shekels were hidden)", () => {
  // the receipt and the wide screen's ticket write the account's fees in the horizon's shekels, the account's whole shekels in today's
  // money carried there (1,043 against 689 + 352 + 3 = 1,044 on the MSCI ACWI was the mismatch this guards), read from what the reader sees
  const short: WorkbenchInputs = { ...plan, amountNow: 10000, monthly: 500, years: 10, values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) } };
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the receipt's and the ticket's account line: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const pc = pairCostsKept({ bundle, index: view.index, plan: p, fundId: pick.fund, providerId: pick.house });
      if (!pc) throw new Error(`${index.id}: the page's own pair is priced`);
      const inHorizon = receiptChain(pc).nominal.account;
      // the wide screen's ticket: the account's part, its label then the amount taken
      const ticket = shown(html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: false, layout: "ticket" }))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const tAt = ticket.indexOf(invest.receipt.accountCharges);
      expect(tAt, `${index.id}: the ticket's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(ticket.slice(tAt + invest.receipt.accountCharges.length, tAt + invest.receipt.accountCharges.length + 40)), `${index.id}: the ticket's account line against ${inHorizon}`).toBe(inHorizon);
      // and the receipt's account line, its label then the amount taken
      const receipt = shown(html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: false }))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const label = `${invest.pair.who.account} ${providerName(view, pick.house)?.short ?? pick.house}`;
      const at = receipt.indexOf(label);
      expect(at, `${index.id}: the receipt's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(receipt.slice(at + label.length, at + label.length + 40)), `${index.id}: the receipt's account line against ${inHorizon}`).toBe(inHorizon);
    });
  }
});

/** A value the test's setup must have found, else the test stops with what was missing. */
function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing: ${what}`);
  return x;
}

describe("the receipt with the person's own deal as the account (F-128)", () => {
  it("the ticket names each of the deal's own fees, and its account line is the deal's fees in the horizon's shekels", () => {
    const b = withDeals(bundle, [fromHouse("psagot")], dealData.kinds);
    const index = need(knownIndices(b).find((ix) => ix.id === "index-sp500"), "the S&P 500");
    const view = buildInvest({ bundle: b, index, plan });
    const house = dealProviderId("deal-psagot");
    const fund = need(view.houses.find((r) => r.provider.id === house)?.entries.find((e) => e.price), "a fund the deal prices").fund.rec.id;
    const pick = { house, fund };
    const pc = need(pairCostsKept({ bundle: b, index: view.index, plan, fundId: fund, providerId: house }), "the deal's pair");
    const dealLines = need(pc.dealLines, "the deal's lines");
    expect(dealLines.length).toBeGreaterThan(0);
    const ticket = shown(html(createElement(PairReceipt, { view, bundle: b, plan, pick, chosen: true, layout: "ticket" }))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
    for (const l of dealLines) expect(ticket, l.name).toContain(l.name);
    const at = ticket.indexOf(invest.receipt.accountCharges);
    expect(at).toBeGreaterThanOrEqual(0);
    expect(-nisIn(ticket.slice(at + invest.receipt.accountCharges.length, at + invest.receipt.accountCharges.length + 40))).toBe(receiptChain(pc).nominal.account);
  });
});
