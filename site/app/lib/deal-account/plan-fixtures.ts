// For the deal tests (plan.test.ts on a few indices, plan.deals.deep.test.ts on every index): every house's deal, filled from its whole
// price list and left as filled, priced beside the house's own row. The two leave the same on every fund, except where F-128 states they do
// not, each exception proven by its cause: with the cause taken out of the house's record, the two leave the same (exceptions-fixtures.ts).
// No Hebrew.
import { feesData } from "../fees.server";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { buildInvest, indexById, type FundWay, type InvestView } from "../invest";
import type { WorkbenchInputs } from "../providers";
import { fillDeal, templateOptions } from "../fee-deal/templates";
import { newDeal, type FeeDeal } from "../fee-deal/model";
import { dealProviderId, withDeals } from "./bundle";
import { leftOn, onDealsTerms } from "./exceptions-fixtures";

export const data = feesData();
export const bundle = buildIndicesBundle();
export const t = bundle.today;
export const plan: WorkbenchInputs = {
  amountNow: 10_000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  currentAccounts: true,
};
export const fromHouse = (id: string): FeeDeal => fillDeal({ ...newDeal("brokerage-account", id), id: `deal-${id}` }, `house:${id}`, data, t)!;

export const planAt = (amount: number, monthly: number, years: number, ret: number): WorkbenchInputs => ({
  ...plan, amountNow: amount, monthly, years, grossReturn: ret / 100,
  values: { amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: plan.values.inflation },
});

/**
 * Plans beside the page's own, and A-03 at both of P-02's bounds (±3% a year), so the order of the first sum and the track can't hide. The
 * large ones hold enough that every custody maximum binds (F-14: Leumi's 3,700 on each security beside 11,500 on the deposit, First
 * International's 4,000 beside 10,000, Discount's 7,500 on each security alone), from the start and as monthly deposits build it.
 * Each is [what it is, the plan, A-03 in percent a year]. The first six, the large ones, run in plan-large.deals.deep.test.ts, the rest in
 * plan-small.deals.deep.test.ts.
 */
export const PLANS: [string, WorkbenchInputs, number][] = [
  ["1,000,000 now, 20 years at 5%", planAt(1_000_000, 0, 20, 5), 0],
  ["1,000,000 now, 20 years at 5%, the dollar up 3% a year", planAt(1_000_000, 0, 20, 5), 3],
  ["1,000,000 now, 20 years at 5%, the dollar down 3% a year", planAt(1_000_000, 0, 20, 5), -3],
  ["40,000 a month, 10 years at 7%", planAt(0, 40_000, 10, 7), 0],
  ["40,000 a month, 10 years at 7%, the dollar up 3% a year", planAt(0, 40_000, 10, 7), 3],
  ["40,000 a month, 10 years at 7%, the dollar down 3% a year", planAt(0, 40_000, 10, 7), -3],
  ["50,000 now, 20 years at 5%", planAt(50_000, 0, 20, 5), 0],
  ["2,000 a month, 5 years at 3%", planAt(0, 2_000, 5, 3), 0],
  ["100,000 now and 1,000 a month, 30 years at −2%", planAt(100_000, 1_000, 30, -2), 0],
  ["the page's plan, the dollar up 3% a year", plan, 3],
  ["1,000 now and 300 a month, 10 years at 7%, the dollar up 3% a year", planAt(1_000, 300, 10, 7), 3],
  ["the page's plan, the dollar down 3% a year", plan, -3],
];

/** A fund on which a deal leaves another amount than its house's row: null where one of the two has no price. */
export type Differing = { id: string; ix: string; fund: string; row: number | null; deal: number | null };

/**
 * Every fund of `funds` on which the deal from house `id` leaves another amount than the house's row, after tax,
 * compared to `unit` shekels. A fund neither prices is not compared.
 */
export const differing = (id: string, ix: string, funds: FundWay[], unit: number): Differing[] =>
  funds.flatMap((f) => {
    const r = { row: leftOn(f, id), deal: leftOn(f, dealProviderId(`deal-${id}`)) };
    if (r.row === null && r.deal === null) return [];
    const same = r.row !== null && r.deal !== null && Math.round(r.row / unit) === Math.round(r.deal / unit);
    return same ? [] : [{ id, ix, fund: f.rec.id, ...r }];
  });

/**
 * Every house's deal beside its house, on the indices of `only` (every index the bundle prices when absent): the bundle with the deals
 * (`b`), the same with the houses read on their deals' terms (`bTerms`, F-128's stated exceptions taken out), and the page's plan's view
 * of each index on both.
 */
export function housesBeside(only?: readonly string[]) {
  const houses = templateOptions("brokerage-account", data, t).filter((o) => o.source === "house").map((o) => o.id.slice("house:".length));
  const deals = houses.map(fromHouse);
  const b = withDeals(bundle, deals, data.kinds);
  const terms = onDealsTerms(bundle, houses.map((house, i) => ({ house, deal: deals[i]! })), data.kinds);
  const bTerms = withDeals(terms.bundle, deals, data.kinds);
  const indices = bundle.exposures.flatMap((e) => (indexById(b, e.id) && (!only || only.includes(e.id)) ? [e.id] : []));
  if (only && indices.length !== only.length) throw new Error(`not every index of ${only.join(", ")} is priced`);
  const viewsOf = (on: typeof b) => new Map<string, InvestView>(indices.map((ix) => [ix, buildInvest({ bundle: on, index: indexById(on, ix)!, plan })]));
  const views = viewsOf(b);
  let termsViews: Map<string, InvestView> | undefined;
  return { houses, deals, b, terms, bTerms, indices, views, termsViews: () => (termsViews ??= viewsOf(bTerms)) };
}
export type Beside = ReturnType<typeof housesBeside>;

/** A difference the stated exceptions cannot be: at a house whose record they leave as it is, or a deal that leaves more than the row, or a price only one of them has. */
export const unstated = (s: Beside) => (d: Differing) => !s.terms.changed.has(d.id) || d.row === null || d.deal === null || d.deal > d.row + 0.5;

/**
 * The deal from house `id` on the page's plan, over `s`'s indices: the funds its house's row prices (`compared`), the differences the stated
 * exceptions can't explain (`unexplained`), any difference on the deal's terms (`onTerms`), and the indices where the house has a row and
 * the deal's row is not marked as the person's own (`notCustom`), each to the shekel.
 */
export function onHouse(s: Beside, id: string) {
  let compared = 0;
  const notCustom: string[] = [];
  const unexplained = s.indices.flatMap((ix) => {
    const v = s.views.get(ix)!;
    const funds = v.options.flatMap((o) => o.funds);
    if (v.houses.some((r) => r.provider.id === id) && v.houses.find((r) => r.provider.id === dealProviderId(`deal-${id}`))?.provider.custom !== true) notCustom.push(ix);
    compared += funds.filter((f) => leftOn(f, id) !== null).length;
    return differing(id, ix, funds, 1).filter(unstated(s));
  });
  const onTerms = s.indices.flatMap((ix) => differing(id, ix, s.termsViews().get(ix)!.options.flatMap((o) => o.funds), 1));
  return { compared, unexplained, onTerms, notCustom };
}

/**
 * Every house's deal on plan `p` at A-03 `fxChange`, over `s`'s indices, to the agora, so a difference of a fraction of a shekel (the rate
 * the amount now is converted at) shows: as `onHouse`, and the funds where the deal has a price where its
 * house's row has none or the other way round (`pricedApart`).
 */
export function onPlan(s: Beside, p: WorkbenchInputs, fxChange: number) {
  let compared = 0;
  const unexplained: Differing[] = [];
  const onTerms: Differing[] = [];
  const pricedApart: { id: string; ix: string; fund: string }[] = [];
  const priced = (f: FundWay, at: string) => `${!!f.byHouse[at] && "valueN" in f.byHouse[at]!}`;
  for (const ix of s.indices) {
    const funds = buildInvest({ bundle: s.b, index: indexById(s.b, ix)!, plan: p, assumptions: { fxChange } }).options.flatMap((o) => o.funds);
    const fundsT = buildInvest({ bundle: s.bTerms, index: indexById(s.bTerms, ix)!, plan: p, assumptions: { fxChange } }).options.flatMap((o) => o.funds);
    for (const id of s.houses) {
      const dealId = dealProviderId(`deal-${id}`);
      for (const f of funds) if (priced(f, dealId) !== priced(f, id)) pricedApart.push({ id, ix, fund: f.rec.id });
      compared += funds.filter((f) => leftOn(f, id) !== null).length;
      unexplained.push(...differing(id, ix, funds, 0.01).filter(unstated(s)));
      onTerms.push(...differing(id, ix, fundsT, 0.01));
    }
  }
  return { compared, unexplained, onTerms, pricedApart };
}

/** The open questions of the prices account `at` reads on its value figure on fund `f` (F-12), null where it has no value figure. */
export const flagsOf = (f: FundWay, at: string) => {
  const x = f.byHouse[at];
  return x && "value" in x ? (x.value.flags ?? []).filter((q) => q.includes("-OQ")) : null;
};
