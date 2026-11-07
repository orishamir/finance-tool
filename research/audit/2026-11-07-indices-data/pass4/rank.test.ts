// Pass 4: the gap ("מול המדד") and the order at Psagot (6,000 ₪ plus 400 ₪ a month, 20 years, 7% and 5%) on every index whose funds carry a
// tracking record, written to RANK_OUT as JSON. Run once on the data before the full years are filled and once after; rank-diff.mjs
// prints old -> new.
import { writeFileSync } from "node:fs";
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

it("ranks", () => {
  const out: Record<string, unknown> = {};
  const ids = [...new Set(bundle.funds.filter((f) => f.tracking_record).map((f) => f.exposure_id))].sort();
  for (const id of ids) {
    const index = indexById(bundle, id);
    if (!index) continue;
    for (const r of [0.07, 0.05]) {
      const rows = bundle.funds.filter((f) => f.exposure_id === id).map((f) => {
        const g = gapOf(f, gapListFor(bundle, f));
        const v = pairLeft({ bundle, index, plan: plan(r), fundId: f.id, providerId: "psagot" });
        return { id: f.id, gap: g ? Number(g.pct.toFixed(2)) : null, years: g ? g.years : 0, value: v === null ? null : Math.round(v) };
      });
      const ranked = rows.filter((x) => x.value !== null).sort((a, b) => b.value! - a.value! || a.id.localeCompare(b.id));
      out[`${id}@${Math.round(r * 100)}`] = ranked.map((x, i) => ({ ...x, rank: i + 1 }));
    }
  }
  writeFileSync(process.env.RANK_OUT!, JSON.stringify(out, null, 1));
});
