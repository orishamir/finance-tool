// The numbers behind the 2026-11-05 review of the indices page's visualizations.
// Every figure comes from the site's own functions over data/ (buildInvest, gridOf, ceilingOf, pairCosts); none is typed by hand.
// Run from the repository root: npx tsx research/specs/2026-11-05-indices-visuals/compute.ts
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWorkbenchBundle } from "../../../site/app/lib/providers.server";
import { buildInvest, indexById, pairCosts } from "../../../site/app/lib/invest";
import { ceilingOf, gridOf, middleStart } from "../../../site/app/lib/stairs";
import { entered } from "../../../site/app/lib/value";

const here = dirname(fileURLToPath(import.meta.url));
const bundle = buildWorkbenchBundle();
const t = bundle.today;

function planOf(amount: number, monthly: number, years: number, ret = 7, infl = 2) {
  return {
    amountNow: amount, monthly, years, grossReturn: ret / 100, inflation: infl / 100, age: null, income: null,
    values: { amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: entered(infl, "pct_per_year", t) },
    fromGoal: false, returnFromParameter: false,
  } as never;
}

function run(indexId: string, plan: ReturnType<typeof planOf>) {
  const index = indexById(bundle, indexId)!;
  const view = buildInvest({ bundle, index, plan });
  const grid = gridOf(view, bundle.snapshots);
  return { index, view, grid };
}

const fundName = (id: string) => { const r = bundle.funds.find((f) => f.id === id); return r ? (r.names.he[0] ?? r.names.en[0] ?? id) : id; };

function full(indexId: string) {
  const plan = planOf(10000, 500, 10);
  const { index, view, grid } = run(indexId, plan);
  const accounts = view.providers.filter((p) => grid.accounts.includes(p.id)).map((p) => ({ id: p.id, name: p.short, foreign: p.foreign }));
  const funds = grid.funds.map((f) => ({ ...f, name: fundName(f.id) }));
  const cells: Record<string, { v: number; open: boolean } | null> = {};
  for (const a of grid.accounts) for (const f of grid.funds) { const c = grid.cell(a, f.id); cells[`${a}|${f.id}`] = c ? { v: Math.round(c.v), open: c.open } : null; }
  const top = ceilingOf(grid);
  const start = middleStart(grid);
  // costs of a few pairs: the top, the middle start, and the best fund at every account
  const costs: Record<string, unknown> = {};
  const costOf = (a: string, f: string) => {
    const c = pairCosts({ bundle, index, plan, fundId: f, providerId: a });
    if (!c) return null;
    const acc = c.account.reduce((s, x) => s + (x.cost.value as number ?? 0), 0) + c.interaction;
    return { left: Math.round(c.left.value as number ?? 0), base: Math.round(c.base), account: Math.round(acc), fund: Math.round(c.fund.value as number ?? 0), tax: Math.round(c.tax.value as number ?? 0), paidIn: Math.round(c.paidIn.value as number ?? 0), lines: c.account.map((x) => ({ name: x.line.names?.tariff?.[0] ?? x.line.id, base: x.line.base, cost: Math.round(x.cost.value as number ?? 0) })) };
  };
  if (top) costs.top = { pos: top.pos, ...costOf(top.pos.a, top.pos.f) };
  if (start) costs.start = { pos: start, ...costOf(start.a, start.f) };
  const perPair: { a: string; f: string; left: number; account: number; fund: number; tax: number }[] = [];
  for (const a of grid.accounts) for (const f of grid.funds) {
    const c = grid.cell(a, f.id);
    if (!c || c.open || f.hedged) continue;
    const k = costOf(a, f.id);
    if (k) perPair.push({ a, f: f.id, left: k.left, account: k.account, fund: k.fund, tax: k.tax });
  }
  return { index: index.name, plan: "10,000 ₪ now, 500 ₪ a month, 10 years, 7% a year, inflation 2%", accounts, funds, cells, top, start, costs, perPair };
}

function robustness(indexId: string) {
  const best = (amount: number, monthly: number, years: number) => {
    const { grid, view } = run(indexId, planOf(amount, monthly, years));
    const top = ceilingOf(grid);
    if (!top) return null;
    // the runner-up at another house, on its own best fund
    let second: { a: string; f: string; v: number } | null = null;
    for (const a of grid.accounts) { if (a === top.pos.a) continue; for (const f of grid.funds) { const c = grid.cell(a, f.id); if (!c || c.open || f.hedged) continue; if (!second || c.v > second.v) second = { a, f: f.id, v: c.v }; } }
    const name = (id: string) => view.providers.find((p) => p.id === id)?.short ?? id;
    return { amount, monthly, years, top: { a: name(top.pos.a), f: fundName(top.pos.f), v: Math.round(top.v) }, second: second ? { a: name(second.a), f: fundName(second.f), v: Math.round(second.v), gap: Math.round(top.v - second.v), gapPct: +(((top.v - second.v) / top.v) * 100).toFixed(2) } : null };
  };
  const amounts = [0, 1000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 750000, 1000000].map((x) => best(x, 500, 10));
  const monthlies = [0, 100, 250, 500, 1000, 2000, 3000, 5000, 10000].map((x) => best(10000, x, 10));
  const years = [1, 2, 3, 5, 7, 10, 15, 20, 30, 40].map((x) => best(10000, 500, x));
  return { amounts, monthlies, years };
}

const out = { sp500: full("index-sp500"), ta125: full("index-ta125"), robustSp500: robustness("index-sp500"), robustTa125: robustness("index-ta125") };
writeFileSync(join(here, "numbers.json"), JSON.stringify(out, null, 1));
console.log("written", join(here, "numbers.json"));
