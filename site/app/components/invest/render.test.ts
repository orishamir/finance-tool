// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
// Split in four files so the test workers share it (one file was most of `npm test`'s time): this one, render-pair-bars,
// render-sections and render-tiles; the data and helpers they share are in render-fixtures.ts.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, indexById, knownIndices } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { AccountColumn, allFunds, bestFor, PairResult, pickOfHeadline } from "./pair";
import { bundle, t, plan, shown, html, nisIn, writtenBars, writtenGap } from "./render-fixtures";

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

describe("every cost bar's written amounts add up to its written total, on every index (pass 6: the remainder's shekels were hidden)", () => {
  for (const index of knownIndices(bundle)) {
    it(index.id, () => {
      const view = buildInvest({ bundle, index, plan });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const out = html(createElement("div", null,
        createElement(PairResult, { view, bundle, plan, pick, chosen: false, onPick: () => undefined }),
        createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined })));
      const bars = [...out.matchAll(/data-total="(-?\d+)" data-amounts="([\d,-]*)"/g)];
      expect(bars.length, "bars rendered").toBeGreaterThan(2);
      for (const [, total, amounts] of bars) {
        const sum = amounts!.split(",").filter(Boolean).reduce((a, x) => a + Number(x), 0);
        expect(sum, `${index.id}: ${amounts} beside ${total}`).toBe(Number(total));
      }
      // the pair bars' remainder holds shekels on every index, and its amount is written under the bar, in its colour
      expect(out).toMatch(/inline-block size-2 rounded-\[2px\] bg-chart-cost-other/);
    });
  }
  // the account, fund and tax differences under the two pair bars are the bars' own figures subtracted ("החשבון: 1 ₪
  // יותר" beside account parts of 699 + 2 and 698 + 3, "הקרן: 58 ₪ פחות" beside 116 and 173). Read from what the reader sees: the
  // amounts written under each bar, each by its colour (rendered with no width, every amount is written under its bar), and the three
  // figures written under the bars, by their labels; no part's place in the bar is assumed
  const short: WorkbenchInputs = { ...plan, amountNow: 10000, monthly: 500, years: 10, values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) } };
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the differences under the pair bars are the bars' own written figures: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const out = html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: false, onPick: () => undefined }));
      const at = out.indexOf("data-gap=");
      if (at < 0) return;
      const bars = writtenBars(out).slice(0, 2);
      expect(bars.length, index.id).toBe(2);
      const written = writtenGap(out.slice(at));
      expect(written, `${index.id}: ${JSON.stringify(written)}`).toEqual({ account: bars[0]!.account - bars[1]!.account, fund: bars[0]!.fund - bars[1]!.fund, tax: bars[0]!.tax - bars[1]!.tax });
    });
  }
  // the account list's figure and the pair bar's account parts are one quantity and say one figure (1,043 against
  // 689 + 352 + 3 = 1,044 on the MSCI ACWI), on every index and two plans
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the account list's figure is the sum of the pair bar's written account parts: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const bar = writtenBars(html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: false, onPick: () => undefined })))[0]!;
      const list = html(createElement(AccountColumn, { view, bundle, years: p.years, pick, onPick: () => undefined }));
      const row = list.slice(list.indexOf(`data-pick-key="${pick.house}"`));
      const cost = /whitespace-nowrap" style="width:[^"]*">([\s\S]*?)<\/span><\/span>/.exec(row)?.[1] ?? "";
      expect(nisIn(cost), `${index.id}: the list's "${shown(cost)}" against ${bar.account} in the bar`).toBe(bar.account);
      // the remainder, the account's fees on each other, is the first amount written under the bar, away from the fund's
      expect(bar.order[0], index.id).toBe("bg-chart-cost-other");
    });
  }
});
