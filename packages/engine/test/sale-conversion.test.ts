// F-13 (D56): a conversion line that converts only on a purchase (`conversion_side`, data-schema §3.6a item 7) leaves the sale's proceeds to
// the line that converts a sale. Interactive Brokers' automatic conversion converts a purchase at no commission (its client agreement, form
// 3203 s.30C); a sale converts by a spot order, 0.002% of the value with a minimum of USD 2 (its Spot Currencies page).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { providerWorkbench, type ComparedProvider, type ProviderRow, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const ib = JSON.parse(readFileSync(new URL("../../../data/fees/interactive-brokers@2026-11-12.json", import.meta.url), "utf8"));
const london = "IBKR Pro - Tiered: בורסת לונדון";
const autoFx = "המרה אוטומטית";

function input(over: Partial<WorkbenchInput> = {}): WorkbenchInput {
  return {
    goal: { amountNow: 0, monthly: 400, months: 24 },
    market: { grossReturn: 0.07, inflation: 0.025, returnIn: "instrument" },
    fund: { kind: "foreign-fund", drag: { management: 0.0007 }, domicile: "ireland", sharePrice: 500 },
    profile: {},
    instrumentClass: "foreign_securities",
    currency: { code: "USD", startRate: 3.7 },
    fx: { USD: 3.7 },
    theta: 0.005,
    providers: [{ snapshot: ib, level: "list", band: [london, autoFx] }],
    ...over,
  };
}
const compared = (r: ProviderRow | undefined): ComparedProvider => {
  if (r?.kind !== "compared") throw new Error(`not compared: ${JSON.stringify(r)}`);
  return r;
};
/** The exit's proceeds converted, in shekels, and the dollar's rate at the exit (the run's exit detail). */
const exitOf = (r: ComparedProvider): { converted: number; rate: number } => {
  const { exitConverted, exitFxRate } = r.run.detail as Record<string, number | undefined>;
  if (exitConverted === undefined || exitFxRate === undefined) throw new Error("the run has no exit detail");
  return { converted: exitConverted, rate: exitFxRate };
};

describe("F-13: the sale converts on the line that converts a sale", () => {
  it("Interactive Brokers' monthly buys convert at nothing, and the exit pays the spot order: max(0.002% of the proceeds, USD 2 at the exit's rate)", () => {
    for (const goal of [{ amountNow: 0, monthly: 400, months: 24 }, { amountNow: 50_000, monthly: 1_000, months: 240 }]) {
      const r = compared(providerWorkbench(input({ goal }), ctx).rows[0]);
      expect(r.tariff.fx).toBe(0);
      expect(r.tariff.fxSale).toEqual({ fx: { rate: 0.00002, min: 2, in: "instrument" } });
      expect(r.linesUsed).toEqual(expect.arrayContaining(["interactive-brokers-fx-auto-conversion", "interactive-brokers-fx-spot"]));
      const exit = exitOf(r);
      expect(exit.converted).toBeGreaterThan(0);
      // the whole of the run's conversion cost is the exit's: the buys paid nothing
      expect(r.run.fees.fx).toBeCloseTo(Math.max(0.00002 * exit.converted, 2 * exit.rate), 9);
    }
  });

  it("a large sale pays the rate above the minimum", () => {
    // 2,000,000 NIS now: the proceeds are far above USD 100,000, where 0.002% passes USD 2
    const r = compared(providerWorkbench(input({ goal: { amountNow: 2_000_000, monthly: 0, months: 120 } }), ctx).rows[0]);
    const exit = exitOf(r);
    expect(0.00002 * exit.converted).toBeGreaterThan(2 * exit.rate);
    expect(r.run.fees.fx).toBeCloseTo(0.00002 * exit.converted, 9);
  });

  it("the spot way converts the purchases and the sale on the one line, with no price of its own for the sale", () => {
    const r = compared(providerWorkbench(input({ providers: [{ snapshot: ib, level: "list", band: [london] }] }), ctx).rows[0]);
    expect(r.tariff.fx).toEqual({ rate: 0.00002, min: 2, in: "instrument" });
    expect(r.tariff.fxSale).toBeUndefined();
  });

  it("a conversion price the person sets governs the sale too", () => {
    const r = compared(providerWorkbench(input({ providers: [{ snapshot: ib, level: "entered", band: [london, autoFx], entered: { fx: 0.001 } }] }), ctx).rows[0]);
    expect(r.tariff.fxSale).toBeUndefined();
    expect(r.run.fees.fx).toBeGreaterThan(0.001 * exitOf(r).converted);
  });

  it("a record whose purchase-only line leaves no line for a sale is not compared, never priced at a free sale", () => {
    const alone = { ...ib, lines: ib.lines.filter((l: { id: string }) => l.id !== "interactive-brokers-fx-spot") };
    const [r] = providerWorkbench(input({ providers: [{ snapshot: alone, level: "list", band: [london, autoFx] }] }), ctx).rows;
    expect(r?.kind).toBe("not-comparable");
    expect(JSON.stringify(r)).toMatch(/converts only on a purchase/);
  });
});
