// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
// Split in four files so the test workers share it (one file was most of `npm test`'s time): this one, render-pair-bars,
// render-sections and render-tiles; the data and helpers they share are in render-fixtures.ts.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, indexById, knownIndices } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, bestFor, pickOfHeadline } from "./pair";
import { invest } from "../../copy";
import { providerName } from "./sections";
import { bundle, t, plan, shown, html, nisIn, writtenFees, ReceiptAndFees } from "./render-fixtures";
import { PairReceipt } from "./receipt";

describe("the pair set beside the person's (2026-10-28)", () => {
  const world = buildInvest({ bundle, index: indexById(bundle, "index-msci-world")!, plan });
  const valueOf = (p: { house: string; fund: string }) => {
    const at = allFunds(world).find((f) => f.rec.id === p.fund)!.byHouse[p.house]!;
    return "valueN" in at ? at.valueN : NaN;
  };
  it("an unhedged pick is set beside the headline; a hedged pick beside the best hedged pair, never one that leaves less", () => {
    const head = pickOfHeadline(world)!;
    expect(bestFor(world, head)).toEqual(head);
    const hedged = allFunds(world).find((f) => f.rec.hedged === true && f.best)!;
    const pick = { house: head.house, fund: hedged.rec.id };
    const best = bestFor(world, pick)!;
    expect(allFunds(world).find((f) => f.rec.id === best.fund)!.rec.hedged).toBe(true);
    expect(valueOf(best)).toBeGreaterThanOrEqual(valueOf(pick));
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
      const out = html(createElement(ReceiptAndFees, { view, bundle, plan: p, pick, chosen: false, onPick: () => undefined }));
      const items = writtenFees(out);
      expect(items.length, index.id).toBeGreaterThan(1);
      expect(items.filter((x) => x.who === "fund").length, index.id).toBe(1);
      const text = shown(out.slice(out.indexOf('data-chart="option-bars"')));
      const total = nisIn(text.slice(text.indexOf(invest.before.fees.total) + invest.before.fees.total.length));
      expect(items.reduce((a, x) => a + x.amount, 0), `${index.id}: ${JSON.stringify(items)} against ${total}`).toBe(total);
      // the largest first
      expect(items.map((x) => x.amount), index.id).toEqual([...items.map((x) => x.amount)].sort((a, b) => b - a));
      const account = items.filter((x) => x.who === "account").reduce((a, x) => a + x.amount, 0);
      // the wide screen's ticket: the account's part, its label then the amount taken
      const ticket = shown(html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: false, layout: "ticket" }))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const tAt = ticket.indexOf(invest.receipt.accountCharges);
      expect(tAt, `${index.id}: the ticket's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(ticket.slice(tAt + invest.receipt.accountCharges.length, tAt + invest.receipt.accountCharges.length + 40)), `${index.id}: the ticket's account line against ${account} in the panel`).toBe(account);
      // and the receipt's account line, its label then the amount taken
      const receipt = shown(out.slice(0, out.indexOf('data-chart="option-bars"'))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
      const label = `${invest.pair.who.account} ${providerName(view, pick.house)?.short ?? pick.house}`;
      const at = receipt.indexOf(label);
      expect(at, `${index.id}: the receipt's account line`).toBeGreaterThanOrEqual(0);
      expect(-nisIn(receipt.slice(at + label.length, at + label.length + 40)), `${index.id}: the receipt's account line against ${account} in the panel`).toBe(account);
    });
  }
});
