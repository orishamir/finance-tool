// Recheck 3: recompute ed0c55e8's ranks at Psagot on 6,000 + 400 a month, 20 years, 7%, with the gross records compared (branch) and as unstated (before).
import { it } from "vitest";
import { buildWorkbenchBundle } from "../../../../site/app/lib/providers.server";
import { indexById, pairLeft, gapListFor, gapOf } from "../../../../site/app/lib/invest";
import { entered } from "../../../../site/app/lib/value";
import type { WorkbenchInputs } from "../../../../site/app/lib/providers";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan = (r: number): WorkbenchInputs => ({
  amountNow: 6000, monthly: 400, years: 20, grossReturn: r, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(r * 100, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
});
const before = { ...bundle, funds: bundle.funds.map((f) => (f.tracking_record?.benchmark.dividends === "gross" ? { ...f, tracking_record: { ...f.tracking_record, benchmark: { ...f.tracking_record.benchmark, dividends: "unstated" as const } } } : f)) };

it("ranks", () => {
  for (const id of ["index-ta125", "index-ta90", "index-ta35"]) {
    for (const r of [0.07, 0.05]) {
      const rows = bundle.funds.filter((f) => f.exposure_id === id).map((f) => {
        const g = gapOf(f, gapListFor(bundle, f));
        const after = pairLeft({ bundle, index: indexById(bundle, id)!, plan: plan(r), fundId: f.id, providerId: "psagot" });
        const prev = pairLeft({ bundle: before as never, index: indexById(before as never, id)!, plan: plan(r), fundId: f.id, providerId: "psagot" });
        return { id: f.id, gap: g ? `${g.pct.toFixed(2)}% (${g.years}y)` : "-", before: prev === null ? null : Math.round(prev), after: after === null ? null : Math.round(after) };
      });
      const order = (k: "before" | "after") => [...rows].filter((x) => x[k] !== null).sort((a, b) => b[k]! - a[k]!).map((x) => `${x.id} (${x[k]})`).join(", ");
      console.log(`\n${id} at ${r * 100}%\n gaps: ${rows.map((x) => `${x.id} ${x.gap}`).join("; ")}\n before: ${order("before")}\n after:  ${order("after")}`);
    }
  }
});
