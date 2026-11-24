// The account map (F-131) on the collected data: what must hold whatever the data says, so a routine refresh never breaks it.
import { describe, expect, it } from "vitest";
import { bundle, plan as fixturePlan } from "../components/invest/render-fixtures";
import { allFunds, pickOfHeadline } from "../components/invest/pair";
import { buildInvest, indexById } from "./invest";
import { leftWith, work } from "./invest-work";
import { rankedAt } from "./stretch";
import { entered } from "./value";
import type { WorkbenchInputs } from "./providers";

/** A value the test's setup must have, else the test stops naming what was missing. */
function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing: ${what}`);
  return x;
}
const t = bundle.today;
const planAt = (amount: number, monthly: number, years: number): WorkbenchInputs => ({ ...fixturePlan, amountNow: amount, monthly, years, values: { ...fixturePlan.values, amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t) } });

for (const [slug, plan] of [["index-sp500", planAt(10_000, 500, 10)], ["index-sp500", planAt(150_000, 3000, 20)], ["index-ta125", planAt(10_000, 500, 10)]] as const) {
  describe(`${slug} at ${plan.amountNow} ₪ and ${plan.monthly} ₪ a month for ${plan.years} years`, () => {
    const index = need(indexById(bundle, slug), slug);
    const view = buildInvest({ bundle, index, plan });
    const pick = need(pickOfHeadline(view), "the page's pair");
    const map = need(work.map(bundle, { index, plan, fund: pick.fund }), "the map");
    const leftAt = leftWith(bundle, index, plan, pick.fund);

    it("names, at the plan, the account the account list ranks first for the fund", () => {
      const fund = need(allFunds(view).find((f) => f.rec.id === pick.fund), "the pair's fund");
      const left = (id: string) => {
        const at = fund.byHouse[id];
        return rankedAt(at) ? at.valueN : -Infinity;
      };
      const ranked = view.providers.filter((p) => rankedAt(fund.byHouse[p.id])).sort((a, b) => left(b.id) - left(a.id) || a.short.localeCompare(b.short, "he"));
      expect(map.plan.winner).toBe(ranked[0]?.id);
    });

    it("draws every border where the two accounts leave the same", () => {
      const pts = map.borders.flatMap((b) => b.points.map((p) => ({ a: b.a, b: b.b, p })));
      // every few points, to keep the run short
      for (const { a, b, p } of pts.filter((_, k) => k % 5 === 0)) {
        const left = leftAt(p[0], p[1], [a, b]);
        expect(Math.abs(need(left.get(a), a) - need(left.get(b), b))).toBeLessThan(0.5);
      }
    });

    it("starts the line for no monthly deposit at 0, and changes its account exactly where the cheapest one there changes", () => {
      const at = (amount: number) => {
        const left = leftAt(amount, 0, null);
        return [...left].sort((x, y) => y[1] - x[1])[0]?.[0];
      };
      const first = need(map.edge[0], "the edge's first stretch");
      expect(first.from).toBe(0);
      expect(map.edge.at(-1)?.to).toBe(map.max.amount);
      // the account just above 0 is the first stretch's (at 0 itself every account leaves 0): at a thousandth of the map's width, about a
      // pixel; nearer 0 the accounts' figures differ by agorot on a few shekels, which no drawing can show
      expect(first.id).toBe(at(map.max.amount / 1000));
      map.edge.slice(1).forEach((e, k) => {
        const before = need(map.edge[k], "the stretch before");
        expect(before.to).toBe(e.from);
        expect(at(e.from * 0.995)).toBe(before.id);
        expect(at(e.from * 1.005)).toBe(e.id);
      });
    });
  });
}
