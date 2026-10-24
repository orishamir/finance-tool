// F-63 chart series (method F-63, 2026-10-24): the provider's own fees paid up to month t, from the run the row already holds.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cumulativeProviderFees, providerWorkbench, type ComparedProvider } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const leumi = JSON.parse(readFileSync(new URL("../../../data/fees/leumi@2026-10-23.json", import.meta.url), "utf8"));

function compared(orders: number): ComparedProvider {
  const wb = providerWorkbench(
    {
      goal: { amountNow: 10_000, monthly: 500, months: 36 },
      market: { grossReturn: 0.05, inflation: 0.02 },
      fund: { kind: "israeli-fund", drag: { management: 0.008 } },
      profile: {},
      behaviour: { ordersPerMonth: orders },
      instrumentClass: "etf_units",
      channel: "direct",
      theta: 0.005,
      providers: [{ snapshot: leumi, level: "list" }],
    },
    ctx,
  );
  const row = wb.rows[0]!;
  if (row.kind !== "compared") throw new Error("not compared");
  return row;
}

describe("cumulativeProviderFees", () => {
  it("starts at zero, never falls, and ends at the run's trade, custody, FX and fixed-fee totals (the exit commission included)", () => {
    const row = compared(1);
    const s = cumulativeProviderFees(row);
    expect(s).toHaveLength(37);
    expect(s[0]).toEqual({ month: 0, nominal: 0, real: 0 });
    for (let i = 1; i < s.length; i++) expect(s[i]!.nominal).toBeGreaterThanOrEqual(s[i - 1]!.nominal - 1e-9);
    const f = row.run.fees;
    expect(s[36]!.nominal).toBeCloseTo(f.trade + f.custody + f.fx + f.fixed, 9);
    // the fund's own drag and the spread are not provider fees
    expect(s[36]!.nominal).toBeLessThan(f.trade + f.custody + f.fx + f.fixed + f.fund);
  });

  it("is in shekels of today: the real figure is the nominal over the CPI index of its month", () => {
    const row = compared(1);
    const s = cumulativeProviderFees(row);
    for (const p of s) expect(p.real).toBeCloseTo(p.nominal / row.run.series[p.month]!.index, 9);
    expect(s[36]!.real).toBeLessThan(s[36]!.nominal);
  });

  it("grows with the trades a month: ten orders pay ten commissions a month, so the series ends higher", () => {
    expect(cumulativeProviderFees(compared(10)).at(-1)!.nominal).toBeGreaterThan(cumulativeProviderFees(compared(1)).at(-1)!.nominal);
  });

  it("steps: custody is charged per period, so between charges only the commissions of that month are added", () => {
    const s = cumulativeProviderFees(compared(1));
    const steps = s.slice(1).map((p, i) => p.nominal - s[i]!.nominal);
    expect(steps.filter((d) => d > 20).length).toBeGreaterThan(0);
    expect(new Set(steps.map((d) => d.toFixed(2))).size).toBeGreaterThan(1);
  });
});
