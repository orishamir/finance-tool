// Whole-shekel parts that add up to their rounded sum (wholeParts, F-91), and how a pick of a house moves the fund (repick).
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices } from "../../lib/invest";
import type { WorkbenchInputs } from "../../lib/providers";
import { buildIndicesBundle } from "../../lib/providers.server";
import { entered } from "../../lib/value";
import { allFunds, pickOfHeadline, repick } from "./pair";
import { wholeParts } from "../kit";

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
  it("never hands the rounding to a part whose amount is not written (pass 6: the hidden remainder took the missing shekels)", () => {
    const xs = [693.4, 354.3, 2.9, 719.3, 5553.4]; // 7,323.3; the remainder's .9 would take a shekel first
    const all = wholeParts(xs, 7323);
    expect(all[2]).toBe(3);
    const out = wholeParts(xs, 7323, [true, true, false, true, true]);
    expect(out[2]).toBe(3); // only rounded
    expect(out.reduce((a, x) => a + x, 0)).toBe(7323);
    expect(out.filter((_, i) => i !== 2).reduce((a, x) => a + x, 0)).toBe(7320);
  });
});

describe("wholeParts refuses a target a part away (independent check of pass 6: a dropped part's shekels went to the others)", () => {
  it("accepts a target within a shekel a part, and a shekel and a half for its own rounding, of the parts' sum, and refuses one further off", () => {
    const xs = [693.4, 354.3, 2.9, 719.3, 5553.4]; // 7,323.3
    expect(() => wholeParts(xs, 7325)).not.toThrow();
    expect(() => wholeParts(xs, 7329.7)).not.toThrow(); // 6.4 off: a shekel a part and the target's own rounding
    expect(() => wholeParts(xs, 7331)).toThrow(/more than a shekel a part/);
    // the pair bar with its remainder dropped: four parts, 2,000 ₪ short of the total written beside it
    expect(() => wholeParts([693.4, 354.3, 719.3, 5553.4].map((x) => x - 500), 7323)).toThrow();
    // only the parts that take the rounding give room: one written part of three
    expect(() => wholeParts([10.2, 3, 4], 18, [true, false, false])).not.toThrow();
    // the MSCI ACWI hedged pair: 1.46 off with one written part, the target made of three rounded figures
    expect(() => wholeParts([10.2, 3, 4], 18.66, [true, false, false])).not.toThrow();
    expect(() => wholeParts([10.2, 3, 4], 20, [true, false, false])).toThrow();
    // a figure near 10^18 is held to the double's precision, not to a shekel (512 ₪ off at 2.66e18)
    expect(() => wholeParts([2.66e18, 3e15], 2.66e18 + 3e15 + 512)).not.toThrow();
    expect(() => wholeParts([2.66e18, 3e15], 2.66e18 + 3e15 + 1e8)).toThrow();
  });
});

describe("a click on a house moves to a way it has (founder, 2026-10-31)", () => {
  const bundle = buildIndicesBundle();
  const t = bundle.today;
  const plan: WorkbenchInputs = { amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null, returnFromParameter: false,
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

  it("Interactive Brokers on the S&P 500 moves from the Israeli fund the page opens on to the fund that leaves most there", () => {
    const view = buildInvest({ bundle, index: knownIndices(bundle).find((i) => i.id === "index-sp500")!, plan });
    // bought in whole units (F-109), Vanguard's distributing line (a unit of USD 143) leaves more there than CSPX (USD 815), whose
    // monthly deposit waits for a unit
    expect(repick(view, pickOfHeadline(view)!, { house: "interactive-brokers" }).fund).toBe("ie00b3xxrp09");
  });
});
