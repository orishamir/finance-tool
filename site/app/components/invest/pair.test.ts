// The gap sentence under the cost bars: its rounded parts add up to the rounded gap (F-91).
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices } from "../../lib/invest";
import type { WorkbenchInputs } from "../../lib/providers";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { entered } from "../../lib/value";
import { allFunds, pickOfHeadline, repick, wholeParts } from "./pair";

describe("wholeParts", () => {
  it("rounds each part so they add up to the rounded sum", () => {
    // the cheapest pair against the next on the S&P 500 example: account, fund, tax
    const xs = [0.75, -57.71, 14.21];
    const out = wholeParts(xs);
    expect(out.reduce((a, x) => a + x, 0)).toBe(Math.round(xs.reduce((a, x) => a + x, 0)));
    expect(out).toEqual([1, -58, 14]);
  });

  it("keeps whole numbers as they are", () => {
    expect(wholeParts([3, -2, 0])).toEqual([3, -2, 0]);
  });

  it("each part stays within one shekel of its own value", () => {
    const xs = [0.5, 0.5, 0.5, -0.4];
    const out = wholeParts(xs);
    expect(out.reduce((a, x) => a + x, 0)).toBe(Math.round(1.1));
    out.forEach((x, i) => expect(Math.abs(x - xs[i]!)).toBeLessThan(1));
  });
});

describe("wholeParts with a set total", () => {
  it("meets a total one shekel off the rounded sum, either way", () => {
    const xs = [0.75, -57.71, 14.21]; // sums to -42.75
    expect(wholeParts(xs, -42).reduce((a, x) => a + x, 0)).toBe(-42);
    expect(wholeParts(xs, -44).reduce((a, x) => a + x, 0)).toBe(-44);
    wholeParts(xs, -44).forEach((x, i) => expect(Math.abs(x - xs[i]!)).toBeLessThan(2));
  });
});

describe("a click on a house moves to a way it has (founder, 2026-10-31)", () => {
  const bundle = buildWorkbenchBundle();
  const t = bundle.today;
  const plan: WorkbenchInputs = { amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null, fromGoal: false, returnFromParameter: false,
    values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) } };
  const pricedAt = (f: ReturnType<typeof allFunds>[number] | undefined, house: string) => { const at = f?.byHouse[house]; return !!at && "valueN" in at; };

  it("on every index, from every fund, a house with any priced fund lands on a priced one", () => {
    for (const index of knownIndices(bundle)) {
      const view = buildInvest({ bundle, index, plan });
      const funds = allFunds(view);
      for (const from of funds) for (const p of view.providers) {
        if (!funds.some((f) => pricedAt(f, p.id))) continue;
        const to = repick(view, { house: view.providers[0]!.id, fund: from.rec.id }, { house: p.id });
        expect(pricedAt(funds.find((f) => f.rec.id === to.fund), p.id), `${index.id}, ${p.id}, from ${from.rec.id}`).toBe(true);
      }
    }
  });

  it("Interactive Brokers on the S&P 500 moves from the Israeli fund the page opens on to iShares", () => {
    const view = buildInvest({ bundle, index: knownIndices(bundle).find((i) => i.id === "index-sp500")!, plan });
    expect(repick(view, pickOfHeadline(view)!, { house: "interactive-brokers" }).fund).toBe("ie00b5bmr087");
  });
});
