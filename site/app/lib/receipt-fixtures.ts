// For the receipt's tests: every priced pair of an index on a plan, the collected data's own (lib/receipt.test.ts).
import { buildInvest, indexById, pairCosts, type PairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { assumedReturn, entered } from "./value";

/** A plan's shape: 10,000 ₪ now unless `amountNow` says otherwise, at 7% a year unless `returnPct` does; `assumed`: the return is one
 *  assumed for the years ahead, as the page's own return is (`SiteValue.onAssumedReturn`), so what rests on it shows hundreds of shekels. */
export type PlanShape = { years: number; monthly: number; amountNow?: number; returnPct?: number; assumed?: boolean };

export function planOf(t: string, p: PlanShape): WorkbenchInputs {
  const amountNow = p.amountNow ?? 10000;
  const ret = p.returnPct ?? 7;
  return {
    amountNow, monthly: p.monthly, years: p.years, grossReturn: ret / 100, inflation: 0.02, age: null, income: null,
    values: { amount: entered(amountNow, "nis", t), monthly: entered(p.monthly, "nis_per_month", t), years: entered(p.years, "years", t), returnV: p.assumed ? assumedReturn(entered(ret, "pct_per_year", t)) : entered(ret, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
    returnFromParameter: false, currentAccounts: { own: null },
  };
}

export function allPricedPairs(bundle: IndicesBundle, indexId: string, p: PlanShape): PairCosts[] {
  const plan = planOf(bundle.today, p);
  const index = indexById(bundle, indexId)!;
  const view = buildInvest({ bundle, index, plan });
  return view.options.filter((o) => o.exists).flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [pairCosts({ bundle, index, plan, fundId: f.rec.id, providerId: house })].filter((x): x is PairCosts => !!x) : [])));
}
