import { it } from "vitest";
import { buildInvest, indexById, type InvestView } from "./invest";
import { buildWorkbenchBundle } from "./providers.server";
import { entered } from "./value";
const bundle = buildWorkbenchBundle();
const plan = { amountNow: 10000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null, values: { amount: entered(10000, "nis", "2026-11-05"), monthly: entered(500, "nis_per_month", "2026-11-05"), years: entered(10, "years", "2026-11-05"), returnV: entered(7, "pct_per_year", "2026-11-05"), inflation: entered(2, "pct_per_year", "2026-11-05") }, fromGoal: false, returnFromParameter: true } as never;
it("reasons", () => {
  const out: string[] = [];
  for (const id of ["index-sp500", "index-msci-world", "index-msci-acwi", "index-nasdaq100", "index-ta125"]) {
    const view: InvestView = buildInvest({ bundle, index: indexById(bundle, id)!, plan, yourBroker: null });
    for (const f of view.options.filter((o) => o.exists).flatMap((o) => o.funds)) {
      for (const p of view.providers) { const at = f.byHouse[p.id]; const h = p.id; if (!at || !("valueN" in at)) out.push(`${id} | ${f.option} | ${f.rec.id} | ${h} | ${JSON.stringify(at ?? "none").slice(0, 220)}`); }
    }
  }
  require("fs").writeFileSync("/tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/reasons.txt", out.join("\n"));
});
