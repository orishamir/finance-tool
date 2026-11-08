// The index page's pair bars rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, PairResult, pickOfHeadline } from "./pair";
import { bundle, t, plan, html } from "./render-fixtures";

describe("every pair bar renders at the sliders' ends and between, with any fund picked (pass 7: the page fell over on MSCI ACWI)", () => {
  // the movement script leaves each slider a quarter of the way along (125,000 ₪, 2,500 ₪ a month, 11 years, 3%), and a hedged fund picked
  // there made the bar's total 1.46 ₪ off its one written part: the rounding guard threw and the page showed its error screen
  const at = (a: number, m: number, y: number, r: number): WorkbenchInputs => ({ ...plan, amountNow: a, monthly: m, years: y, grossReturn: r, values: { ...plan.values, amount: entered(a, "nis", t), monthly: entered(m, "nis_per_month", t), years: entered(y, "years", t), returnV: entered(r * 100, "pct_per_year", t) } });
  const plans = [at(125000, 2500, 11, 0.03), at(500000, 10000, 40, 0.12), at(0, 100, 1, 0), at(1000, 0, 1, 0.07), at(250000, 5000, 21, 0.06)];
  for (const index of knownIndices(bundle)) {
    it(`${index.id}: every fund, five plans`, () => {
      for (const p of plans) {
        const view = buildInvest({ bundle, index, plan: p });
        const head = pickOfHeadline(view);
        if (!head) continue;
        for (const f of allFunds(view)) {
          const pick = { house: head.house, fund: f.rec.id };
          expect(() => html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: true, onPick: () => undefined })), `${index.id} ${f.rec.id} ${p.amountNow}/${p.monthly}/${p.years}/${p.grossReturn}`).not.toThrow();
        }
      }
    });
  }
});
