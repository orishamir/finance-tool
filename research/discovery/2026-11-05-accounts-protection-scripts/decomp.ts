import { buildWorkbenchBundle } from "/home/ori/dev/finance-tool/site/app/lib/providers.server";
import { indexById } from "/home/ori/dev/finance-tool/site/app/lib/invest";
import { entered } from "/home/ori/dev/finance-tool/site/app/lib/value";
import { makeCtx, pairOf } from "./invest-probe.ts";
const bundle = buildWorkbenchBundle() as any;
const t = bundle.today;
const plan = { amountNow: 10000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) }, fromGoal: false, returnFromParameter: false } as any;
const index = indexById(bundle, "index-sp500")!;
const ctx = makeCtx(bundle, plan);
const R = (n: number) => Math.round(n);
for (const [prov, fund] of [["psagot", "5139282"], ["interactive-israel", "ie00b5bmr087"]]) {
  const p = pairOf(ctx, { index, fundId: fund, providerId: prov })!;
  const spec: any = p.fs.spec;
  console.log("==", prov, fund);
  console.log("spec keys", Object.keys(spec), "fund keys", Object.keys(spec.fund), JSON.stringify({ cur: spec.currency, drag: spec.fund.drag, halfSpread: spec.fund.halfSpread, dist: spec.fund.distribution, cls: spec.instrumentClass }).slice(0, 600));
  const row: any = p.price(spec);
  const off: any = p.price({ ...spec, fund: { ...spec.fund, halfSpread: 0, drag: {} } });
  console.log("real", R(row.real), "taxReal", R(row.taxReal), "acctBeforeTax", R(row.horizonCostBeforeTax), "| costsOff real", R(off.real), "taxReal", R(off.taxReal));
  console.log("run keys", Object.keys(row.run), "detail keys", row.run.detail ? Object.keys(row.run.detail) : "");
  (globalThis as any)["P_" + prov] = { p, spec, row };
}
for (const prov of ["psagot", "interactive-israel"]) {
  const { row } = (globalThis as any)["P_" + prov];
  const d = row.run.detail; const I_T = 1.02 ** 10;
  console.log(prov, JSON.stringify(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, typeof v === "number" ? Math.round(v) : v]))), "taxAtExit", JSON.stringify(row.run.taxAtExit)?.slice(0, 300), "outcome", JSON.stringify(row.run.outcome)?.slice(0, 400), "labels", JSON.stringify(row.run.labels)?.slice(0,300), "flags", JSON.stringify(row.run.flags)?.slice(0,300));
}
{
  const I_T = 1.02 ** 10;
  const ps = (globalThis as any).P_psagot, ii = (globalThis as any)["P_interactive-israel"];
  const dps = ps.row.run.detail, dii = ii.row.run.detail;
  const IA = dps.nominalGain - dps.realGain;
  console.log("I_T", I_T.toFixed(5), "IA_ps", IA.toFixed(1), "NG_ps", dps.nominalGain.toFixed(1), "NG_ii", dii.nominalGain.toFixed(1));
  console.log("tax gap today", (ii.row.taxReal - ps.row.taxReal).toFixed(1), "= 0.25*IA/I_T", (0.25 * IA / I_T).toFixed(1), "+ 0.25*(NGii-NGps)/I_T", (0.25 * (dii.nominalGain - dps.nominalGain) / I_T).toFixed(1));
  const offPs = ps.p.price({ ...ps.spec, fund: { ...ps.spec.fund, halfSpread: 0, drag: {} } }), offIi = ii.p.price({ ...ii.spec, fund: { ...ii.spec.fund, halfSpread: 0, drag: {} } });
  console.log("tax shield of fund costs: ps", (offPs.taxReal - ps.row.taxReal).toFixed(1), "ii", (offIi.taxReal - ii.row.taxReal).toFixed(1));
  // counterfactual: the Israeli tracking fund indexed by the dollar (as a foreign-investment fund with USD principal currency would be, TXS-14)
  const cf = null as any;
  if (cf) console.log("CF yelin dollar-indexed: real", cf.real.toFixed(0), "taxReal", cf.taxReal.toFixed(0), "acct", cf.horizonCostBeforeTax.toFixed(0), "RG", cf.run.detail.realGain.toFixed(0), "NG", cf.run.detail.nominalGain.toFixed(0));
  // counterfactual: the Irish fund with a 15% withholding on a dividend yield d (A-11), d from 1.0% to 1.5% for scale only
  for (const d of [0.001/0.15, 0.002/0.15, 0.003/0.15]) {
    const w = { ...ii.spec, fund: { ...ii.spec.fund, drag: { ...ii.spec.fund.drag, foreignWithholding: 0.15 * d } } };
    const r = ii.p.price(w);
    if (r) console.log("ii with withholding drag", (0.15 * d * 100).toFixed(3) + "%/yr", "real", r.real.toFixed(0), "diff", (r.real - ii.row.real).toFixed(0));
  }
}
