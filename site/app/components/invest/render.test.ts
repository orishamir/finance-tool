// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
// Split in four files so the test workers share it (one file was most of `npm test`'s time): this one, render-pair-bars,
// render-sections and render-tiles; the data and helpers they share are in render-fixtures.ts.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices, pairCostsKept } from "../../lib/invest";
import { receiptAmounts, receiptChain } from "../../lib/receipt";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, bestFor, pickOfHeadline } from "./pair";
import { invest } from "../../copy";
import { providerName } from "./sections";
import { bundle, t, plan, shown, html, nisIn, writtenFees, ReceiptAndFees } from "./render-fixtures";
import { PairReceipt } from "./receipt";
import { dealProviderId, withDeals } from "../../lib/deal-account/bundle";
import { data as dealData, fromHouse } from "../../lib/deal-account/plan-fixtures";

describe("the pair set beside the person's (2026-10-28)", () => {
  it("an unhedged pick is set beside the headline; a hedged pick beside the best hedged pair, never one that leaves less", () => {
    // on every index with a hedged fund ranked at the headline's house (one listed before tax, F-118, has no pair)
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

describe("the fees panel's and the receipt's written amounts add up, on every index (pass 6: the remainder's shekels were hidden)", () => {
  // the fees panel's items are the receipt's whole shekels, so they add up to the total written under them, on every index and two
  // plans; and the account's items are the account list's figure and the receipt's account line (1,043 against 689 + 352 + 3 = 1,044
  // on the MSCI ACWI was the mismatch this guards), read from what the reader sees: each amount past its bar, whose by the line under its name
  const short: WorkbenchInputs = { ...plan, amountNow: 10000, monthly: 500, years: 10, values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) } };
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the fees panel's items add up to its total, and the account's to the account list's figure and the receipt's: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const out = html(createElement(ReceiptAndFees, { view, bundle, plan: p, pick, chosen: false }));
      const items = writtenFees(out);
      expect(items.length, index.id).toBeGreaterThan(1);
      expect(items.filter((x) => x.who === "fund").length, index.id).toBe(1);
      const text = shown(out.slice(out.indexOf('data-chart="option-bars"')));
      const total = nisIn(text.slice(text.indexOf(invest.before.fees.total) + invest.before.fees.total.length));
      expect(items.reduce((a, x) => a + x.amount, 0), `${index.id}: ${JSON.stringify(items)} against ${total}`).toBe(total);
      // the largest first
      expect(items.map((x) => x.amount), index.id).toEqual([...items.map((x) => x.amount)].sort((a, b) => b - a));
      const account = items.filter((x) => x.who === "account").reduce((a, x) => a + x.amount, 0);
      // the panel writes today's money, as the account list does; the receipt writes the same account's fees in the horizon's shekels
      const pc = pairCostsKept({ bundle, index: view.index, plan: p, fundId: pick.fund, providerId: pick.house });
      if (!pc) throw new Error(`${index.id}: the page's own pair is priced`);
      expect(account, `${index.id}: the panel's account items against the receipt's amounts in today's money`).toBe(receiptAmounts(pc).account);
      const inHorizon = receiptChain(pc).nominal.account;
      // the wide screen's ticket: the account's part, its label then the amount taken
      const ticket = shown(html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: false, layout: "ticket" }))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const tAt = ticket.indexOf(invest.receipt.accountCharges);
      expect(tAt, `${index.id}: the ticket's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(ticket.slice(tAt + invest.receipt.accountCharges.length, tAt + invest.receipt.accountCharges.length + 40)), `${index.id}: the ticket's account line against ${inHorizon}`).toBe(inHorizon);
      // and the receipt's account line, its label then the amount taken
      const receipt = shown(out.slice(0, out.indexOf('data-chart="option-bars"'))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const label = `${invest.pair.who.account} ${providerName(view, pick.house)?.short ?? pick.house}`;
      const at = receipt.indexOf(label);
      expect(at, `${index.id}: the receipt's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(receipt.slice(at + label.length, at + label.length + 40)), `${index.id}: the receipt's account line against ${inHorizon}`).toBe(inHorizon);
    });
  }
});

describe("the fees panel with the person's own deal as the account (F-128)", () => {
  it("its bars are the receipt's account lines, the deal's own fees among them, and they add up to its total as a house's do", () => {
    const b = withDeals(bundle, [fromHouse("psagot")], dealData.kinds);
    const index = knownIndices(b).find((ix) => ix.id === "index-sp500")!;
    const view = buildInvest({ bundle: b, index, plan });
    const house = dealProviderId("deal-psagot");
    const fund = view.houses.find((r) => r.provider.id === house)!.entries.find((e) => e.price)!.fund.rec.id;
    const pick = { house, fund };
    const pc = pairCostsKept({ bundle: b, index: view.index, plan, fundId: fund, providerId: house })!;
    expect(pc.dealLines!.length).toBeGreaterThan(0);
    const out = html(createElement(ReceiptAndFees, { view, bundle: b, plan, pick, chosen: true }));
    const items = writtenFees(out);
    const r = receiptAmounts(pc);
    // every fee of the deal that took a shekel is a bar, and the remainder where there is one, beside the fund's one bar
    expect(items.filter((x) => x.who === "account").length).toBe(pc.dealLines!.length + (r.remainder !== 0 ? 1 : 0));
    const bars = shown(out.slice(out.indexOf('data-chart="option-bars"')).split("</ul>")[0]!);
    for (const l of pc.dealLines!) expect(bars).toContain(l.name);
    const text = shown(out.slice(out.indexOf('data-chart="option-bars"')));
    const total = nisIn(text.slice(text.indexOf(invest.before.fees.total) + invest.before.fees.total.length));
    expect(items.reduce((a, x) => a + x.amount, 0)).toBe(total);
    expect(items.filter((x) => x.who === "account").reduce((a, x) => a + x.amount, 0)).toBe(r.account);
  });
});
