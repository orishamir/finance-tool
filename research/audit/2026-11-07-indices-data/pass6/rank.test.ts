// Pass 6 (item 2): every priced pair's real value left on every index, before and after F-92 (b) counts forward the mean variable fee
// charged in the record's years (bounded by today's listed rate) in place of the listed rate. This file dumps one side to JSON; run it on
// the engine before the change and after, then rank-diff.mjs writes rank.txt. Run (copied into site/app/lib):
//   RANK_JSON=<out.json> npx vitest run site/app/lib/__rank6.test.ts
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { buildWorkbenchBundle } from "./providers.server"; // paths as in site/app/lib
import { buildInvest, knownIndices, pairLeft } from "./invest";
import { entered } from "./value";
import type { WorkbenchInputs } from "./providers";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan = (now: number, monthly: number, years: number, r: number): WorkbenchInputs => ({
  amountNow: now, monthly, years, grossReturn: r, inflation: 0.02, age: null, income: null,
  values: { amount: entered(now, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t), returnV: entered(r * 100, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
});
const plans = { "6000+400x20y@7%": plan(6000, 400, 20, 0.07), "6000+400x20y@5%": plan(6000, 400, 20, 0.05), "10000+500x10y@7% (page default)": plan(10000, 500, 10, 0.07) };

it("dumps", () => {
  const out: Record<string, Record<string, { headline: string | null; funds: { id: string; best: number | null; bestHouse: string | null; psagot: number | null; byHouse: Record<string, number> }[] }>> = {};
  for (const [name, p] of Object.entries(plans)) {
    out[name] = {};
    for (const index of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index, plan: p });
      const funds = v.options.flatMap((o) => o.funds).map((f) => {
        const byHouse: Record<string, number> = {};
        for (const [h, at] of Object.entries(f.byHouse)) if (at && "valueN" in at && typeof at.valueN === "number" && !(at as { open?: unknown }).open) byHouse[h] = Math.round(at.valueN);
        const ps = pairLeft({ bundle, index, plan: p, fundId: f.rec.id, providerId: "psagot" });
        return { id: f.rec.id, best: f.best ? Math.round(f.best.valueN) : null, bestHouse: f.best ? (f.best as { providerId?: string }).providerId ?? null : null, psagot: ps === null ? null : Math.round(ps), byHouse };
      });
      out[name][index.id] = { headline: v.headline ? `${v.headline.providerId} ${v.headline.fund.rec.id} ${Math.round(v.headline.valueN)}` : null, funds };
    }
  }
  writeFileSync(process.env.RANK_JSON ?? "rank.json", JSON.stringify(out, null, 1));
});
