// For the receipt's tests: every priced pair of an index on a plan, the collected data's own (lib/receipt.test.ts).
import { buildInvest, indexById, pairCosts, type PairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { entered } from "./value";

export function planOf(t: string, p: { years: number; monthly: number; amountNow?: number }): WorkbenchInputs {
  const amountNow = p.amountNow ?? 10000;
  return {
    amountNow, monthly: p.monthly, years: p.years, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
    values: { amount: entered(amountNow, "nis", t), monthly: entered(p.monthly, "nis_per_month", t), years: entered(p.years, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
    fromGoal: true, returnFromParameter: false, currentAccounts: { own: null },
  };
}

export function allPricedPairs(bundle: IndicesBundle, indexId: string, p: { years: number; monthly: number }): PairCosts[] {
  const plan = planOf(bundle.today, p);
  const index = indexById(bundle, indexId)!;
  const view = buildInvest({ bundle, index, plan });
  return view.options.filter((o) => o.exists).flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [pairCosts({ bundle, index, plan, fundId: f.rec.id, providerId: house })].filter((x): x is PairCosts => !!x) : [])));
}
