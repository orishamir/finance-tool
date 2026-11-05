// The skeptic's recomputation of a third of the relevance audit's figures (2026-11-05).
// Every figure comes from the site's own functions over data/ (buildInvest, gridOf, ceilingOf, pairCosts); none is typed by hand.
// Run from the repository root: npx tsx research/audit/2026-11-05-indices-relevance/skeptic-check.ts
import { buildWorkbenchBundle } from "../../../site/app/lib/providers.server";
import { buildInvest, indexById, pairCosts } from "../../../site/app/lib/invest";
import { ceilingOf, gridOf } from "../../../site/app/lib/stairs";
import { entered } from "../../../site/app/lib/value";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
function planOf(amount: number, monthly: number, years: number, ret = 7, infl = 2) {
  return {
    amountNow: amount, monthly, years, grossReturn: ret / 100, inflation: infl / 100, age: null, income: null,
    values: { amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: entered(infl, "pct_per_year", t) },
    fromGoal: false, returnFromParameter: false,
  } as never;
}
const fundName = (id: string) => { const r = bundle.funds.find((f) => f.id === id); return r ? (r.names.he[0] ?? r.names.en[0] ?? id) : id; };
function run(indexId: string, plan = planOf(10000, 500, 10)) {
  const index = indexById(bundle, indexId)!;
  const view = buildInvest({ bundle, index, plan });
  const grid = gridOf(view, bundle.snapshots);
  const name = (id: string) => view.providers.find((p) => p.id === id)?.short ?? id;
  return { index, view, grid, name, plan };
}
const R = Math.round;
const sp = run("index-sp500");
const { grid, name } = sp;

// best priced, unhedged, settled pair per house
const bestAt = (g = grid, kinds?: string[]) => g.accounts.map((a) => {
  let b: { f: string; v: number } | null = null;
  for (const f of g.funds) { if (f.hedged) continue; if (kinds && !kinds.includes(f.kind)) continue; const c = g.cell(a, f.id); if (!c || c.open) continue; if (!b || c.v > b.v) b = { f: f.id, v: c.v }; }
  return { a, b };
});
const houses = bestAt().filter((x) => x.b).sort((x, y) => y.b!.v - x.b!.v);
console.log("== houses by best way (S&P 500, default plan)");
houses.forEach((h, i) => console.log(i + 1, name(h.a), fundName(h.b!.f), R(h.b!.v)));
console.log("kinds", grid.kinds, "funds by kind", Object.fromEntries(grid.kinds.map((k) => [k, grid.funds.filter((f) => f.kind === k).length])));

const top = ceilingOf(grid)!;
console.log("top", name(top.pos.a), fundName(top.pos.f), R(top.v));

// fund list at the top house
console.log("== funds at", name(top.pos.a));
const atTop = grid.funds.map((f) => ({ f, c: grid.cell(top.pos.a, f.id) })).filter((x) => x.c).sort((x, y) => y.c!.v - x.c!.v);
for (const x of atTop) console.log(x.f.kind, x.f.hedged ? "hedged" : "", x.c!.open ? "open" : "", fundName(x.f.id), R(x.c!.v), R(x.c!.v - top.v), (((top.v - x.c!.v) / top.v) * 100).toFixed(3) + "%");

// abroad through each house: best abroad fund against the house's best Israeli fund
console.log("== abroad vs own best Israeli fund, per house");
const abroadKinds = grid.kinds.filter((k) => /abroad|foreign_dom|dom/i.test(k));
console.log("abroad kinds guess", abroadKinds);
for (const a of grid.accounts) {
  const isr = bestAt(grid).find((x) => x.a === a);
  let ab: { f: string; v: number } | null = null; let isrB: { f: string; v: number } | null = null;
  for (const f of grid.funds) { if (f.hedged) continue; const c = grid.cell(a, f.id); if (!c || c.open) continue;
    if (abroadKinds.includes(f.kind)) { if (!ab || c.v > ab.v) ab = { f: f.id, v: c.v }; } else { if (!isrB || c.v > isrB.v) isrB = { f: f.id, v: c.v }; } }
  if (ab) console.log(name(a), "abroad", R(ab.v), fundName(ab.f), "| israeli", isrB ? R(isrB.v) : "-", isrB ? "diff " + R(isrB.v - ab.v) : "");
  void isr;
}

// costs at the top pair and Leumi's pair
for (const a of [top.pos.a, houses[2]?.a, houses[1]?.a]) {
  if (!a) continue;
  const f = houses.find((h) => h.a === a)!.b!.f;
  const c = pairCosts({ bundle, index: sp.index, plan: sp.plan, fundId: f, providerId: a });
  if (!c) { console.log("no costs", name(a)); continue; }
  const acc = c.account.reduce((s, x) => s + ((x.cost.value as number) ?? 0), 0) + c.interaction;
  console.log("costs", name(a), fundName(f), "left", R(c.left.value as number), "account", R(acc), "fund", R(c.fund.value as number), "tax", R(c.tax.value as number), "lines", c.account.map((x) => `${x.line.id}:${R((x.cost.value as number) ?? 0)}`).join(" "), "interaction", R(c.interaction));
}

// hedged best
let hb: { a: string; f: string; v: number } | null = null;
for (const f of grid.funds) if (f.hedged) { const c = grid.cell(top.pos.a, f.id); if (c && (!hb || c.v > hb.v)) hb = { a: top.pos.a, f: f.id, v: c.v }; }
if (hb) console.log("hedged at top house", fundName(hb.f), R(hb.v), "gap", R(top.v - hb.v));

// the seven indices
console.log("== best pair per index");
for (const ix of bundle.indices ?? []) {
  try { const r = run((ix as { id: string }).id); const c = ceilingOf(r.grid); if (c) console.log((ix as { id: string }).id, r.name(c.pos.a), fundName(c.pos.f), R(c.v)); } catch (e) { console.log("err", (ix as { id: string }).id, String(e).slice(0, 80)); }
}

// robustness of the first house
console.log("== robustness");
const firstOf = (p: ReturnType<typeof planOf>) => { const r = run("index-sp500", p); const hs = bestAt(r.grid).filter((x) => x.b).sort((x, y) => y.b!.v - x.b!.v); return `${r.name(hs[0].a)} ${R(hs[0].b!.v)} | 2nd ${r.name(hs[1].a)} ${R(hs[1].b!.v)} gap ${R(hs[0].b!.v - hs[1].b!.v)}`; };
for (const [lbl, p] of [["monthly 0", planOf(10000, 0, 10)], ["monthly 100", planOf(10000, 100, 10)], ["monthly 5000", planOf(10000, 5000, 10)], ["monthly 10000", planOf(10000, 10000, 10)], ["amount 300k", planOf(300000, 500, 10)], ["amount 400k", planOf(400000, 500, 10)], ["amount 0", planOf(0, 500, 10)], ["years 1", planOf(10000, 500, 1)], ["years 40", planOf(10000, 500, 40)], ["return 0", planOf(10000, 500, 10, 0)], ["return 10", planOf(10000, 500, 10, 10)], ["return 10.5", planOf(10000, 500, 10, 10.5)], ["infl 0", planOf(10000, 500, 10, 7, 0)], ["infl 4", planOf(10000, 500, 10, 7, 4)], ["years 12", planOf(10000, 500, 12)]] as const)
  console.log(lbl, firstOf(p));
const y12 = ceilingOf(run("index-sp500", planOf(10000, 500, 12)).grid)!; console.log("years +20% top", R(y12.v), "diff", R(y12.v - top.v));
