// Index page engine changes E1 to E5 (method F-12, F-63, F-65, 2026-10-25): per-share lines, dollar and pound
// bounds, the cap, a fund in another currency than its exposure, and a provider's bad record as its own row.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fundVariants, providerWorkbench, tradeCommission, type NotComparableProvider, type ProviderRow, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
const interactiveIsrael = read("fees/interactive-israel@2026-10-25.json");
const interactiveBrokers = read("fees/interactive-brokers@2026-10-25.json");
const altshuler = read("fees/altshuler-trade@2026-10-23.json");

const fx = { USD: 3.7, GBP: 4.6 };
// Both foreign brokers split their trade lines by market, so the run names the one the fund trades on (F-63 band).
const usIsrael = 'מניות ותעודות סל הנסחרות בארה"ב';
const autoFx = "המרה אוטומטית";

function input(over: Partial<WorkbenchInput> & Pick<WorkbenchInput, "providers">): WorkbenchInput {
  return {
    goal: { amountNow: 0, monthly: 400, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.025, returnIn: "instrument" },
    fund: { kind: "foreign-fund", drag: { management: 0.0007 }, domicile: "us", w8ben: true, sharePrice: 500 },
    profile: {},
    instrumentClass: "foreign_securities",
    currency: { code: "USD", startRate: 3.7 },
    fx,
    theta: 0.005,
    ...over,
  };
}
const row = (rows: ProviderRow[], id: string) => rows.find((r) => r.id === id)!;
const notComparable = (r: ProviderRow): NotComparableProvider => {
  if (r.kind !== "not-comparable") throw new Error(`${r.id} was compared`);
  return r;
};

describe("F-12 per-share line and cap (E1, E3)", () => {
  const line = { rate: 0, perShare: 0.01 * 3.7, min: 2.5 * 3.7, cap: 0.02 };
  const terms = { fxRate: 3.7, sharePrice: 500 };

  it("the minimum bites on a small order, and the cap wins over the minimum when it is lower", () => {
    // 400 NIS: 0.216 shares, 0.002 USD a share fee, so the 9.25 NIS minimum; the 2% cap is 8 NIS.
    expect(tradeCommission(line, 400, terms)).toBeCloseTo(8, 12);
    // 2,000 NIS: the minimum 9.25 is below the cap of 40.
    expect(tradeCommission(line, 2_000, terms)).toBeCloseTo(9.25, 12);
  });

  it("charges the per-share fee on the share count when it exceeds the minimum", () => {
    // 3,700,000 NIS = 1,000,000 USD = 2,000 shares at 500 USD: 20 USD = 74 NIS... above the 9.25 NIS minimum, under the 2% cap.
    expect(tradeCommission(line, 3_700_000, terms)).toBeCloseTo(2_000 * 0.01 * 3.7, 9);
  });

  it("a per-share line without a share price is an error, never a silent zero", () => {
    expect(() => tradeCommission(line, 400, { fxRate: 3.7 })).toThrow(RangeError);
  });
});

describe("F-63 on the foreign brokers' tariffs (E1, E2, E3)", () => {
  it("Interactive Israel: the US line is read per share, the dollar minimum in shekels, the cap beside it", () => {
    const wb = providerWorkbench(input({ providers: [{ snapshot: interactiveIsrael, level: "list", band: usIsrael }] }), ctx);
    const r = row(wb.rows, "interactive-israel");
    expect(r.kind).toBe("compared");
    if (r.kind !== "compared") return;
    expect(r.tariff.buy).toEqual({ rate: 0, perShare: 0.01 * 3.7, min: 2.5 * 3.7, cap: 0.02 });
    // 400 NIS an order: the 2% cap (8 NIS) is below the 9.25 NIS minimum, so every order pays 8.
    expect(r.run.fees.trade).toBeGreaterThan(0);
  });

  it("without a share price the provider is not comparable with needs-share-price, the others still run", () => {
    const fund = { kind: "foreign-fund" as const, drag: { management: 0.0007 }, domicile: "us" as const, w8ben: true };
    const wb = providerWorkbench(input({ fund, providers: [{ snapshot: interactiveIsrael, level: "list", band: usIsrael }, { snapshot: altshuler, level: "list" }] }), ctx);
    expect(notComparable(row(wb.rows, "interactive-israel")).reason.code).toBe("needs-share-price");
    expect(row(wb.rows, "altshuler-trade").kind).toBe("compared");
  });

  it("without a dollar rate the provider is not comparable with needs-fx-rate", () => {
    const wb = providerWorkbench(input({ fx: {}, providers: [{ snapshot: interactiveIsrael, level: "list", band: usIsrael }, { snapshot: altshuler, level: "list" }] }), ctx);
    expect(notComparable(row(wb.rows, "interactive-israel")).reason.code).toBe("needs-fx-rate");
    // Altshuler's minimum is 9 USD: it needs the rate too, and no longer fails the whole run with "expected shekels".
    expect(notComparable(row(wb.rows, "altshuler-trade")).reason.code).toBe("needs-fx-rate");
    const none = providerWorkbench(input({ fx: undefined as never, providers: [{ snapshot: altshuler, level: "list" }] }), ctx);
    expect(notComparable(none.rows[0]!).reason.code).toBe("needs-fx-rate");
  });

  it("Altshuler's dollar minimum is converted at the run's rate", () => {
    const wb = providerWorkbench(input({ providers: [{ snapshot: altshuler, level: "list" }] }), ctx);
    const r = row(wb.rows, "altshuler-trade");
    if (r.kind !== "compared") throw new Error("not compared");
    expect(r.tariff.buy?.min).toBeCloseTo(9 * 3.7, 12);
  });

  it("Interactive Brokers: the plan band picks the line; the dollar maximum and the pound-free minimum are shekels", () => {
    const lse = providerWorkbench(
      input({ fund: { kind: "foreign-fund", drag: { management: 0.0007 }, domicile: "ireland" }, providers: [{ snapshot: interactiveBrokers, level: "list", band: ["IBKR Pro - Tiered: בורסת לונדון", autoFx] }] }),
      ctx,
    );
    const r = row(lse.rows, "interactive-brokers");
    if (r.kind !== "compared") throw new Error(`not compared: ${JSON.stringify((r as NotComparableProvider).reason)}`);
    expect(r.tariff.buy).toMatchObject({ rate: 0.0005, min: 1.7 * 3.7, max: 39 * 3.7 });
    const us = providerWorkbench(input({ providers: [{ snapshot: interactiveBrokers, level: "list", band: ["IBKR Pro - Fixed: מניות ותעודות סל בארה", autoFx] }] }), ctx);
    const u = row(us.rows, "interactive-brokers");
    if (u.kind !== "compared") throw new Error("not compared");
    expect(u.tariff.buy).toEqual({ rate: 0, perShare: 0.005 * 3.7, min: 1 * 3.7, cap: 0.01 });
  });

  it("E5: a snapshot the engine cannot read for one fund is that provider's row, not a throw for the whole run", () => {
    // Without a plan band, IBKR's US and London lines both apply to foreign securities: ambiguous.
    const wb = providerWorkbench(input({ providers: [{ snapshot: interactiveBrokers, level: "list" }, { snapshot: interactiveIsrael, level: "list", band: usIsrael }] }), ctx);
    const bad = notComparable(row(wb.rows, "interactive-brokers"));
    expect(bad.reason).toMatchObject({ code: "record-error", detail: expect.stringContaining("ambiguous") });
    expect(row(wb.rows, "interactive-israel").kind).toBe("compared");
    expect(wb.coverage.invariant.ok).toBe(true);
    expect(wb.coverage.counts["not-evaluated"]).toBe(1);
  });
});

describe("F-65 a fund in another currency than its exposure (E4)", () => {
  const exposureRecord = { ...read("instruments/exposures/index-sp500.json"), currency: "EUR" };
  const record = read("funds/ie00b5bmr087@2026-10-24.json"); // USD fund of the S&P 500
  const exposure = {
    record: exposureRecord,
    theta: 0.005,
    run: {
      goal: { amountNow: 20_000, monthly: 0, months: 120 },
      grossReturn: 0.06,
      inflation: 0.025,
      tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, fx: 0.0025 },
      profile: {},
      fxStartRates: { USD: 3.7 },
    },
  };

  it("runs: the return stays the exposure's, the FX line and the tax index are the fund's currency", () => {
    const r = fundVariants(exposure as never, [], [record], ctx).rows[0]!;
    expect(r.kind === "ranked" || r.kind === "listed-not-ranked").toBe(true);
    expect(r.currencyMismatch).toEqual({ fund: "USD", exposure: "EUR" });
    expect(r.run!.fees.fx).toBeGreaterThan(0);
    expect(r.run!.rules.map((x) => x.id)).toContain("TXF-03");
    const same = fundVariants({ ...exposure, record: { ...exposureRecord, currency: "USD" } } as never, [], [record], ctx).rows[0]!;
    expect(same.currencyMismatch).toBeUndefined();
    expect(same.run!.real).toBeCloseTo(r.run!.real, 6);
  });

  it("with a USD rate missing it is still not evaluated, naming the input", () => {
    const r = fundVariants({ ...exposure, run: { ...exposure.run, fxStartRates: {} } } as never, [], [record], ctx).rows[0]!;
    expect(r.reasons[0]).toMatchObject({ code: "missing-input", detail: "fxStartRates.USD" });
  });
});
