// Recheck 3: the Tel Aviv reports print 2023, 2024 and 2025 (and the first half of 2026); most records hold 2025 only. The ranks at
// Psagot (6,000 + 400 a month, 20 years, 7%) with the years read from the reports in the library (research/library/store, text layer),
// for the records whose report is there. Records without a library copy keep their one year.
import { it } from "vitest";
import { buildWorkbenchBundle } from "../../../../site/app/lib/providers.server";
import { indexById, pairLeft, gapListFor, gapOf } from "../../../../site/app/lib/invest";
import { entered } from "../../../../site/app/lib/value";
import type { WorkbenchInputs } from "../../../../site/app/lib/providers";

const add: Record<string, [number, number, number][]> = {
  "1143700": [[2023, 3.6, 3.81], [2024, 28.05, 28.39]],
  "1143783": [[2023, 3.88, 4.27], [2024, 30.47, 30.86]],
  "1146331": [[2023, 3.92, 4.27], [2024, 30.15, 30.86]],
  "1146356": [[2023, 3.83, 4.07], [2024, 28.27, 28.61]],
  "1146570": [[2023, 3.61, 3.81], [2024, 28.05, 28.39]],
  "1148808": [[2023, 3.81, 4.07], [2024, 28.41, 28.61]],
  "5112628": [[2023, 4.09, 4.07], [2024, 28.58, 28.61]],
};
const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
};
const full = { ...bundle, funds: bundle.funds.map((f) => (add[f.id] && f.tracking_record ? { ...f, tracking_record: { ...f.tracking_record, years: [...f.tracking_record.years, ...add[f.id]!.map(([year, fund_pct, tracking_pct]) => ({ year, fund_pct, tracking_pct }))] } } : f)) };

it("ranks with every full year the reports print", () => {
  for (const id of ["index-ta125", "index-ta90", "index-ta35"]) {
    const rows = full.funds.filter((f) => f.exposure_id === id).map((f) => {
      const g = gapOf(f, gapListFor(full, f));
      const v = pairLeft({ bundle: full as never, index: indexById(full as never, id)!, plan, fundId: f.id, providerId: "psagot" });
      return { id: f.id, gap: g ? `${g.pct.toFixed(2)}% (${g.years}y)` : "-", v: v === null ? null : Math.round(v) };
    });
    console.log(`\n${id} with full years\n gaps: ${rows.map((x) => `${x.id} ${x.gap}`).join("; ")}\n order: ${[...rows].sort((a, b) => b.v! - a.v!).map((x) => `${x.id} (${x.v})`).join(", ")}`);
  }
});
