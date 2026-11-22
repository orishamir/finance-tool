// For the index page's tests: every priced pair of an index on a plan, the collected data's own (lib/receipt.test.ts), and the collected
// data with no fund measured by a principal currency, for the tests that pin a page's ties and picks.
import { buildInvest, indexById, pairCosts, type PairCosts } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import { entered } from "./value";

/**
 * The collected data with every Israeli fund's status as a foreign-investment fund set to `false`, so each is measured by the CPI (F-04).
 * For the tests that pin the ties, picks and figures of a page on the collected data and are not about the tax index: an Israeli fund on a
 * foreign index whose status is a principal currency or not known is ranked only where both readings of TXS OQ26 agree, which would move
 * what they pin with every status collected. The readings are held by packages/engine/test/foreign-investment-fund.test.ts, lib/labels.test.ts,
 * lib/providers.test.ts and the index page's test in lib/invest.test.ts.
 */
export function asIfNoForeignInvestmentFund<B extends Pick<IndicesBundle, "funds">>(bundle: B): B {
  return {
    ...bundle,
    funds: bundle.funds.map((f) => {
      const status = f.tax_status.foreign_investment_fund;
      return status ? { ...f, tax_status: { ...f.tax_status, foreign_investment_fund: { ...status, value: false } } } : f;
    }),
  };
}

/** A plan at 7% a year unless `returnPct` says otherwise. */
export function planOf(t: string, p: { years: number; monthly: number; amountNow?: number; returnPct?: number }): WorkbenchInputs {
  const amountNow = p.amountNow ?? 10000;
  const ret = p.returnPct ?? 7;
  return {
    amountNow, monthly: p.monthly, years: p.years, grossReturn: ret / 100, inflation: 0.02, age: null, income: null,
    values: { amount: entered(amountNow, "nis", t), monthly: entered(p.monthly, "nis_per_month", t), years: entered(p.years, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
    currentAccounts: { own: null },
  };
}

export function allPricedPairs(bundle: IndicesBundle, indexId: string, p: { years: number; monthly: number; returnPct?: number }): PairCosts[] {
  const plan = planOf(bundle.today, p);
  const index = indexById(bundle, indexId)!;
  const view = buildInvest({ bundle, index, plan });
  return view.options.filter((o) => o.exists).flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [pairCosts({ bundle, index, plan, fundId: f.rec.id, providerId: house })].filter((x): x is PairCosts => !!x) : [])));
}
