// Pass 5 (M1): ranks at Psagot on 6,000 ₪ plus 400 ₪ a month, 20 years, 7% (and 5%), before and after F-92 (b) sets each year against the
// fees charged that year. "Before" is the same bundle with every year's `fees_charged` removed, which gives the old convention exactly:
// with today's fees in every year, max(0, mean_y(−gap_y − fees)) = max(0, −mean gap − fees). Run: npx vitest run <this file>
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { buildWorkbenchBundle } from "../../../../site/app/lib/providers.server";
import { indexById, pairLeft, gapListFor, gapOf } from "../../../../site/app/lib/invest";
import { entered } from "../../../../site/app/lib/value";
import type { WorkbenchInputs } from "../../../../site/app/lib/providers";
import { comparedYears, sumFees, trackingBeyondFees } from "@finance-tool/engine";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan = (r: number): WorkbenchInputs => ({
  amountNow: 6000, monthly: 400, years: 20, grossReturn: r, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(r * 100, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
});
const strip = (f: (typeof bundle.funds)[number]) => (f.tracking_record ? { ...f, tracking_record: { ...f.tracking_record, years: f.tracking_record.years.map(({ fees_charged: _, ...y }) => y) } } : f);
const before = { ...bundle, funds: bundle.funds.map(strip) } as typeof bundle;

const out: string[] = [];
const log = (s: string) => out.push(s);

it("ranks", () => {
  const ids = [...new Set(bundle.funds.filter((f) => f.tracking_record).map((f) => f.exposure_id))].sort();
  for (const id of ids) {
    for (const r of [0.07, 0.05]) {
      const rows = bundle.funds.filter((f) => f.exposure_id === id).map((f) => {
        const g = gapOf(f, gapListFor(bundle, f));
        const yb = comparedYears(strip(f).tracking_record, gapListFor(before, strip(f)));
        const ya = comparedYears(f.tracking_record, gapListFor(bundle, f));
        const a07 = (y: typeof ya) => (y && typeof f.fees.tracking_difference_12m?.value !== "number" ? trackingBeyondFees(y, sumFees(f)) : null);
        const after = pairLeft({ bundle, index: indexById(bundle, id)!, plan: plan(r), fundId: f.id, providerId: "psagot" });
        const prev = pairLeft({ bundle: before, index: indexById(before, id)!, plan: plan(r), fundId: f.id, providerId: "psagot" });
        return { id: f.id, gap: g ? `${g.pct.toFixed(2)}% (${g.years}y)` : "-", a07b: a07(yb), a07a: a07(ya), before: prev === null ? null : Math.round(prev), after: after === null ? null : Math.round(after) };
      });
      const rankOf = (k: "before" | "after") => {
        const s = [...rows].filter((x) => x[k] !== null).sort((a, b) => b[k]! - a[k]!);
        return new Map(s.map((x, i) => [x.id, i + 1]));
      };
      const rb = rankOf("before"), ra = rankOf("after");
      const pct = (x: number | null) => (x === null ? "-" : `${(x * 100).toFixed(4)}%`);
      log(`\n${id} at ${Math.round(r * 100)}%`);
      for (const x of [...rows].sort((a, b) => (ra.get(a.id) ?? 99) - (ra.get(b.id) ?? 99))) {
        const moved = rb.get(x.id) !== ra.get(x.id) || x.before !== x.after ? "  <- moved" : "";
        log(`  ${x.id.padEnd(13)} gap ${x.gap.padEnd(12)} A-07 ${pct(x.a07b)} -> ${pct(x.a07a)}  rank ${rb.get(x.id) ?? "-"} -> ${ra.get(x.id) ?? "-"}  left ${x.before} -> ${x.after} ₪${moved}`);
      }
    }
  }
  writeFileSync(process.env.RANK_OUT ?? "rank.txt", out.join("\n") + "\n");
});
