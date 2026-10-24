// B4 (QA 2026-10-24): a study fund held with an employer deposit runs F-61 with that deposit, as golden S42 does.
import { feeMateriality } from "@finance-tool/engine";
import { beforeAll, describe, expect, it } from "vitest";
import { buildCompareBundle } from "./compare.server";
import type { CompareBundle, RunGoal } from "./compare";
import { holdingPlan, mergedRules } from "./holdings";
import type { Holding } from "./state";
import { entered } from "./value";

let bundle: CompareBundle;
beforeAll(() => {
  bundle = buildCompareBundle();
}, 120_000);

const day = "2026-10-24";
const runGoal: RunGoal = {
  horizonYears: 10,
  amountNow: 0,
  monthly: 0,
  available: 0,
  anytime: false,
  returnPct: 6,
  inflationPct: 2.5,
  age: 30,
  employment: "employee",
  salary: 12_000,
  pensionEmployee: null,
  pensionEmployer: null,
  insurancePct: null,
  preset: "other" as RunGoal["preset"],
  fromPreset: { horizon: false, monthly: false, available: false },
};

const holding = (over: Partial<Holding> = {}): Holding => ({
  id: "h1",
  wrapperId: "keren-hishtalmut",
  company: { name: "חברה" },
  balance: entered(120_000, "nis", day),
  feeBalance: entered(0.74, "pct_per_year", day),
  directExpenses: entered(0.11, "pct_per_year", day),
  monthlyOwn: entered(300, "nis_per_month", day),
  monthlyEmployer: entered(900, "nis_per_month", day),
  firstDeposit: { ...entered(0, "text", day), value: "2015-01-01" },
  statementDate: { ...entered(0, "text", day), value: day },
  order: 0,
  ...over,
});

describe("holdingPlan reads the employer deposit (B4)", () => {
  it("S42 from a holding: balance fee 17,901.59, total drag 20,664.79", () => {
    const rules = mergedRules({ rules: [] } as never, bundle);
    const hp = holdingPlan(holding(), bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp).toMatchObject({ ok: true });
    if (!hp.ok) return;
    if (hp.plan.run !== "runProvident") throw new Error("plan");
    // the statement's deposits are flat nominal NIS, as golden S42 has them (workings Q20)
    expect(hp.plan.input.goal.contributions).toBe("nominal");
    const m = feeMateriality(hp.plan, hp.ctx);
    const balance = m.lines.find((l) => l.line === "balance")!.cost.value as number;
    expect(Math.abs(balance - 17_901.59)).toBeLessThan(0.02);
    expect(Math.abs((m.total.value as number) - 20_664.79)).toBeLessThan(0.02);
  });

  it("without the employer deposit the run differs", () => {
    const rules = mergedRules({ rules: [] } as never, bundle);
    const hp = holdingPlan(holding({ monthlyEmployer: undefined }), bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp.ok).toBe(true);
    if (!hp.ok) return;
    expect(Math.abs((feeMateriality(hp.plan, hp.ctx).total.value as number) - 20_664.79)).toBeGreaterThan(100);
  });
});
