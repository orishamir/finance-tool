// Every number in mockups.html, from the site's own functions over data/. Writes numbers.json beside this file.
// Run from the repository root: npx tsx research/specs/2026-10-31-hedged/compute.ts
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gapToIndex, stretchRange, sumFees, trackingBeyondFeesRange, yearlyChanges } from "@finance-tool/engine";
import { buildWorkbenchBundle } from "../../../site/app/lib/providers.server";
import { buildCompareBundle } from "../../../site/app/lib/compare.server";
import { feeInputs } from "../../../site/app/lib/fees";
import { buildInvest, indexById, kindOf, kindScenarios, pairCosts, pairValue } from "../../../site/app/lib/invest";
import { allFunds, bestOfKind, kindPairs, pickOfHeadline } from "../../../site/app/components/invest/pair";
import type { WorkbenchInputs } from "../../../site/app/lib/providers";

const here = dirname(fileURLToPath(import.meta.url));
const bundle = buildWorkbenchBundle();
const compare = buildCompareBundle();
const fi = feeInputs(compare, null, { entered: {}, age: null, employment: null } as never);
const plan: WorkbenchInputs = {
  amountNow: fi.g.amountNow,
  monthly: fi.g.monthly,
  years: fi.g.horizonYears,
  grossReturn: (fi.g.returnPct ?? 0) / 100,
  inflation: (fi.values.inflation.value as number) / 100,
  age: fi.g.age,
  income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
  values: fi.values,
  fromGoal: fi.fromGoal,
  returnFromParameter: fi.returnFromParameter,
};
const index = indexById(bundle, "index-sp500")!;
const view = buildInvest({ bundle, index, plan });
const pick = pickOfHeadline(view)!;
const pairs = kindPairs(view, pick)!;
const funds = allFunds(view);
const nameOf = (id: string) => funds.find((f) => f.rec.id === id)?.name ?? id;
const range = bundle.dollarRange!;
const A = { bundle, index, plan };

const sc = kindScenarios({ ...A, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house }, lo: range.lo, hi: range.hi })!;

// ------------------------------------------------ the dollar's past (F-93)
const pts = bundle.fxHistory!.points;
const years = yearlyChanges(pts);
const stretch = stretchRange(pts, Math.round(plan.years));
const stretch5 = stretchRange(pts, 5);

// ------------------------------------------------ the hedge's own cost in the fund's fixed plan
const hedgedRec = bundle.funds.find((f) => f.id === pairs.hedged.fund)!;
const hedgedFees = sumFees(hedgedRec);
const hedgedBand = trackingBeyondFeesRange(hedgedRec.tracking_record!.years, hedgedFees);
const hedgedGap = gapToIndex(hedgedRec.tracking_record!.years);
const usedA07 = hedgedGap === null ? null : Math.max(0, -hedgedGap / 100 - hedgedFees);

// value left at a dollar change and a hedge cost beyond fees (A-07, as a fraction) on each pair
const u = (fx: number, p: WorkbenchInputs = plan) => pairValue({ ...A, plan: p, fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house, fxChange: fx })!;
const h = (tracking?: number, p: WorkbenchInputs = plan) => pairValue({ ...A, plan: p, fundId: pairs.hedged.fund, providerId: pairs.hedged.house, fxChange: 0, ...(tracking !== undefined ? { tracking } : {}) })!;

// the grid: the gap (unhedged − hedged) at every dollar change and every yearly cost of the hedge
const costs = [0, 0.01, usedA07!, 0.03, 0.04];
const fxs = [-4, -3, -2, -1, 0, 1, 2, 3];
const grid = costs.map((c) => ({ cost: c, gaps: fxs.map((f) => Math.round(u(f) - h(c))) }));

// ------------------------------------------------ candidates
// (1) is the crossing a property of the plan, or just the hedge's yearly cost?
const crossAt = (p: WorkbenchInputs) => kindScenarios({ ...A, plan: p, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house }, lo: range.lo, hi: range.hi, points: "ends" })!.crossing;
const crossings = [
  { years: 5, ret: 7 },
  { years: 10, ret: 7 },
  { years: 20, ret: 7 },
  { years: 30, ret: 7 },
  { years: 10, ret: 4 },
  { years: 10, ret: 10 },
].map(({ years: y, ret }) => ({ years: y, ret, crossing: crossAt({ ...plan, years: y, grossReturn: ret / 100 }) }));

// (2) what the market assumption does to both kinds, beside what the dollar does to one
const market = [5, 7, 9].map((ret) => {
  const p = { ...plan, grossReturn: ret / 100 };
  return { ret, unhedged: Math.round(u(0, p)), hedged: Math.round(h(undefined, p)) };
});

// (3) tax on the currency's move: the tax figure at each dollar change, and how much of a shekel's move stays after tax
const costsAt = (fx: number, id: string, house: string) => pairCosts({ ...A, assumptions: { fxChange: fx }, fundId: id, providerId: house });
const taxU = [-3, 0, 3].map((fx) => {
  const pc = costsAt(fx, pairs.unhedged.fund, pairs.unhedged.house);
  return { fx, value: Math.round(u(fx)), tax: Math.round(Number(pc?.tax?.value ?? NaN)) };
});
const pcH = costsAt(0, pairs.hedged.fund, pairs.hedged.house);
const taxH = { value: Math.round(h()), tax: Math.round(Number(pcH?.tax?.value ?? NaN)) };

// (4) is the gap between the kinds only the hedge? the same house for both, and the unhedged fund with the same house's cheapest
const sameHouseHedged = pairValue({ ...A, fundId: pairs.hedged.fund, providerId: pairs.unhedged.house, fxChange: 0 });
const sameHouseUnhedged = pairValue({ ...A, fundId: pairs.unhedged.fund, providerId: pairs.hedged.house, fxChange: 0 });

// (5) a constant yearly change against the path the dollar really took, on a plan with monthly deposits
// Plain arithmetic beside the engine, before fees and tax: the deposits' value at 7% in dollars, moved by the real month-end rates.
function pathCheck(H: number) {
  const n = H * 12;
  const g = Math.pow(1 + plan.grossReturn, 1 / 12);
  const out: number[] = [];
  const series = rateSeries();
  for (let s = 0; s + n < series.length; s++) {
    const r0 = series[s]!, rN = series[s + n]!;
    const f = Math.pow(rN / r0, 1 / n);
    let real = plan.amountNow, flat = plan.amountNow;
    for (let m = 1; m <= n; m++) {
      real = real * g * (series[s + m]! / series[s + m - 1]!) + plan.monthly;
      flat = flat * g * f + plan.monthly;
    }
    out.push(real / flat - 1);
  }
  return { count: out.length, low: Math.min(...out), high: Math.max(...out) };
}
function rateSeries(): number[] {
  return pts.map((p) => p.rate);
}

// (6) how much the path matters in shekels, and where the stretches lie against the crossing
const series = rateSeries();
const n10 = 10 * 12;
const stretches10: number[] = [];
for (let s = 0; s + n10 < series.length; s++) stretches10.push((Math.pow(series[s + n10]! / series[s]!, 1 / 10) - 1) * 100);
const below = sc.crossing === null ? null : stretches10.filter((x) => x < sc.crossing!).length;

// ------------------------------------------------ what happened: every fund's report, by year
const spFunds = bundle.funds.filter((f) => f.exposure_id === "index-sp500");
type Y = { year: number; fund_pct: number; tracking_pct: number };
const byYear = (kind: "hedged" | "unhedged", y: number) =>
  spFunds
    .filter((f) => kindOf(f) === kind)
    .flatMap((f) => ((f.tracking_record?.years ?? []) as Y[]).filter((r) => r.year === y).map((r) => ({ id: f.id, fund: r.fund_pct, target: r.tracking_pct })));
const reported = [2022, 2023, 2024, 2025].map((y) => {
  const un = byYear("unhedged", y), he = byYear("hedged", y);
  const d = years.find((x) => x.year === y)!.pct;
  return {
    year: y,
    dollar: d,
    unhedgedTarget: un[0]!.target,
    hedgedTarget: he[0]!.target,
    targetsImplyDollar: ((1 + un[0]!.target / 100) / (1 + he[0]!.target / 100) - 1) * 100,
    unhedgedLow: Math.min(...un.map((x) => x.fund)),
    unhedgedHigh: Math.max(...un.map((x) => x.fund)),
    unhedgedCount: un.length,
    hedged: he[0]!.fund,
    hedgedShortfall: he[0]!.fund - he[0]!.target,
  };
});
// the funds with all four years, so one figure compounds the same fund over the same years
const fourYears = spFunds.filter((f) => kindOf(f) === "unhedged" && (f.tracking_record?.years ?? []).length === 4);
const grow = (ys: Y[]) => ys.reduce((a, r) => a * (1 + r.fund_pct / 100), 100);
const hundreds = {
  unhedged: fourYears.map((f) => ({ id: f.id, name: nameOf(f.id), v: grow(f.tracking_record!.years as Y[]) })),
  hedged: grow(hedgedRec.tracking_record!.years as Y[]),
  dollar: [2022, 2023, 2024, 2025].reduce((a, y) => a * (1 + years.find((x) => x.year === y)!.pct / 100), 100),
};

// every hedged fund collected, on every index: what it fell short of its index by each year, before and beyond fees
const allHedged = bundle.funds
  .filter((f) => f.hedged === true)
  .map((f) => {
    const ys = (f.tracking_record?.years ?? []) as Y[];
    const fees = sumFees(f);
    return { id: f.id, exposure: f.exposure_id, name: bundle.funds.find((x) => x.id === f.id)?.id, fees: fees * 100, years: ys.map((r) => ({ year: r.year, short: r.fund_pct - r.tracking_pct })) };
  });
const shorts = allHedged.flatMap((f) => f.years.map((y) => y.short));

// the same shortfall on the unhedged S&P 500 funds: every fund-year in the reports
const unhedgedYears = spFunds.filter((f) => kindOf(f) === "unhedged").flatMap((f) => ((f.tracking_record?.years ?? []) as Y[]).map((r) => r.fund_pct - r.tracking_pct));
const unhedgedGaps = { low: Math.min(...unhedgedYears), high: Math.max(...unhedgedYears), count: unhedgedYears.length, fundYears: unhedgedYears };

// a foreign fund bought abroad: its tax index is the exchange rate (TXF-03), so a dollar's rise is not taxed the way it is on a shekel fund
const abroadRec = spFunds.find((f) => f.id === "ie00b5bmr087");
const abroadAt = funds.find((f) => f.rec.id === abroadRec?.id);
const abroadHouse = abroadAt ? Object.entries(abroadAt.byHouse).find(([, x]) => "valueN" in x)?.[0] : undefined;
const foreignFund = abroadHouse
  ? [-3, 0, 3].map((fx) => {
      const pc = pairCosts({ ...A, assumptions: { fxChange: fx }, fundId: abroadRec!.id, providerId: abroadHouse });
      return { fx, house: abroadHouse, value: Math.round(pairValue({ ...A, fundId: abroadRec!.id, providerId: abroadHouse, fxChange: fx }) ?? NaN), tax: Math.round(Number(pc?.tax?.value ?? NaN)) };
    })
  : null;

const out = {
  today: bundle.today,
  plan: { amountNow: plan.amountNow, monthly: plan.monthly, years: plan.years, grossReturn: plan.grossReturn, inflation: plan.inflation },
  pairs: {
    unhedged: { ...pairs.unhedged, name: nameOf(pairs.unhedged.fund), house: view.providers.find((p) => p.id === pairs.unhedged.house)?.short },
    hedged: { ...pairs.hedged, name: nameOf(pairs.hedged.fund), house: view.providers.find((p) => p.id === pairs.hedged.house)?.short },
  },
  bestOfKind: { unhedged: bestOfKind(view, "unhedged"), hedged: bestOfKind(view, "hedged") },
  scenarios: sc,
  hedgedCost: { fees: hedgedFees * 100, gap: hedgedGap, usedA07: usedA07! * 100, band: hedgedBand && { low: hedgedBand.low * 100, high: hedgedBand.high * 100 } },
  grid: { fxs, costs: costs.map((c) => c * 100), rows: grid },
  crossings,
  market,
  tax: { unhedged: taxU, hedged: taxH },
  sameHouse: { hedgedAtUnhedgedHouse: sameHouseHedged && Math.round(sameHouseHedged), unhedgedAtHedgedHouse: sameHouseUnhedged && Math.round(sameHouseUnhedged) },
  path: { h5: pathCheck(5), h10: pathCheck(10) },
  dollar: { years, stretch10: stretch, stretch5, stretchesBelowCrossing: below, stretchesTotal: stretches10.length, firstPoint: pts[0]!.date, lastPoint: pts[pts.length - 1]!.date, sample: pts[0] },
  reported,
  hundreds,
  allHedged,
  shortfallRange: { low: Math.min(...shorts), high: Math.max(...shorts), count: shorts.length, negative: shorts.filter((s) => s > 0).length },
  countFundsOnSp: { unhedged: funds.filter((f) => kindOf(f.rec) === "unhedged").length, hedged: funds.filter((f) => kindOf(f.rec) === "hedged").length },
  unhedgedRecord: { fees: sumFees(bundle.funds.find((f) => f.id === pairs.unhedged.fund)!) * 100, ...unhedgedGaps },
  foreignFund,
  hedgedWhatIf: costs.map((c) => ({ cost: c * 100, value: Math.round(h(c)) })),
  pointWorth: {
    dollar: { fromMinus1To0: Math.round(u(0) - u(-1)), from0To1: Math.round(u(1) - u(0)) },
    hedge: { from1To2: Math.round(h(0.01) - h(0.02)), from2To3: Math.round(h(0.02) - h(0.03)) },
  },
  fallsOfYears: { falls: years.filter((y) => y.pct < 0).length, count: years.length },
  wholeSeries: { first: series[0], last: series[series.length - 1], yearlyPct: (Math.pow(series[series.length - 1]! / series[0]!, 12 / (series.length - 1)) - 1) * 100 },
  marketYears: reported.map((r) => ({ year: r.year, usd: r.hedgedTarget })),
};
writeFileSync(join(here, "numbers.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 0).slice(0, 200));
