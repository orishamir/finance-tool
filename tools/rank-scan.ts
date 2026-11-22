// The indices page computed over a grid of plans, to find rankings that look wrong on their face (tools/rank-flags.mjs reads the
// output): for every index, every kind of fund, every fund and every house, the value left, the account's cost split by fee line,
// and the fund's own part and the tax (per fund, from pairCosts at its best house). The plan is the page's: the return the site
// illustrates with (A-01, 7%), inflation 2%, and every bank's current account counted (no bank marked as the person's, D64).
// Run from the repository root (about three minutes, a 50 MB file):
//   npx tsx tools/rank-scan.ts <out.jsonl> [index ids...]
//   node tools/rank-flags.mjs <out.jsonl>
import { writeFileSync, appendFileSync } from "node:fs";
import { buildIndicesBundle } from "../site/app/lib/providers.server";
import * as inv from "../site/app/lib/invest";
import { entered } from "../site/app/lib/value";

const out = process.argv[2]!;
const only = process.argv.slice(3);
const bundle = buildIndicesBundle();
const t = bundle.today;
const plan = (a: number, m: number, y: number) => ({
  amountNow: a, monthly: m, years: y, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(a, "nis", t), monthly: entered(m, "nis_per_month", t), years: entered(y, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: false, returnFromParameter: false, currentAccounts: { own: null },
});
const AMOUNTS = [0, 1000, 6000, 50000, 300000, 2000000];
const MONTHLY = [0, 200, 1000, 5000];
const YEARS = [1, 5, 10, 20, 30];
const indices = inv.knownIndices(bundle).filter((i: any) => !only.length || only.includes(i.id));
writeFileSync(out, "");
const r2 = (n: number) => Math.round(n * 100) / 100;
const linesOf = (ls: { line: string; cost: number }[]) => Object.fromEntries(ls.map((l) => [l.line, r2(l.cost)]));
for (const index of indices) {
  const t0 = Date.now();
  for (const a of AMOUNTS) for (const m of MONTHLY) for (const y of YEARS) {
    if (a === 0 && m === 0) continue;
    const p = plan(a, m, y);
    const view = inv.buildInvest({ bundle, index, plan: p });
    const rows: any[] = [];
    const sc = { idx: index.id, a, m, y };
    for (const o of view.options) {
      if (!o.exists) continue;
      for (const c of o.cells) {
        const r: any = { ...sc, opt: o.id, fund: "_generic", house: c.providerId, kind: c.kind };
        if (c.kind === "cost") Object.assign(r, { value: r2(c.leftN), acct: r2(c.costN), lines: linesOf(c.lines), inter: r2(c.interaction), venue: c.venue, standing: c.standing, aside: c.aside });
        else r.reason = c.reason?.code ?? (c.availability ? "unavailable" : null), r.reasonDetail = (c.reason as any)?.detail ?? null;
        rows.push(r);
      }
      for (const f of o.funds) {
        // the fund's own part and the base, measured once at the fund's best house (the same at every account, F-91)
        let fundPart: number | null = null, base: number | null = null;
        if (f.best) {
          const pc = inv.pairCosts({ bundle, index, plan: p, fundId: f.rec.id, providerId: f.best.providerId });
          if (pc) { fundPart = r2(pc.fund.value as number); base = r2(pc.base); }
        }
        for (const [house, w] of Object.entries(f.byHouse) as [string, any][]) {
          const r: any = { ...sc, opt: o.id, fund: f.rec.id, house, hedged: f.rec.hedged === true, dist: f.rec.distribution_policy ?? null };
          if ("valueN" in w) Object.assign(r, { kind: "cost", value: r2(w.valueN), acct: r2(w.accountCost), lines: linesOf(w.lines), inter: r2(w.interaction), open: w.open, venue: w.venue, standing: w.standing, aside: w.aside, units: w.units, fundPart, base, tax: base !== null && fundPart !== null ? r2(base - w.valueN - w.accountCost - fundPart) : null });
          else Object.assign(r, { kind: w.availability ? "unavailable" : "fail", reason: w.reason?.code ?? null, reasonDetail: w.reason?.detail ?? w.reason?.recorded ?? null });
          rows.push(r);
        }
        if (!Object.keys(f.byHouse).length) rows.push({ ...sc, opt: o.id, fund: f.rec.id, house: "_none", kind: "fund-fail", reason: f.reason?.code ?? null });
      }
    }
    appendFileSync(out, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  }
  console.log(index.id, "s", ((Date.now() - t0) / 1000).toFixed(0));
}
