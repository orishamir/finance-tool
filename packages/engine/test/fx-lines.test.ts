// F-12, F-13 and F-84: tariff amounts set in a foreign currency, and the conversion lines of a monthly purchase.
// Expected figures: tests/golden/expected_fx_lines.py, from the formulas alone, with no return, fund cost or inflation.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { crossRate, feeLines, fxFee, providerWorkbench, runSecurities, withFeeRate, withoutFeeLine, type NotComparableProvider, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
import { buildTariff } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/fees/${p}.json`, import.meta.url), "utf8"));
const psagot = read("psagot@2026-10-23");

// F-84 on the example day of method.md: 3.4939 shekels and 1.1193 dollars per one euro.
const perEur = { ILS: 3.4939, USD: 1.1193 };
const fx = { USD: crossRate(perEur, "USD")!, EUR: crossRate(perEur, "EUR")! };
const EUROPE = "מניות ו-ETF הנסחרות בבורסות אירופה";

const plain = (tariff: SecuritiesInput["tariff"], goal: Partial<SecuritiesInput["goal"]> = {}): SecuritiesInput => ({
  goal: { amountNow: 0, monthly: 400, months: 12, ...goal },
  market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 },
  fund: { kind: "foreign-fund", drag: {} },
  tariff: { currency: { code: "USD", startRate: fx.USD }, ...tariff },
  profile: {},
});
const workbench = (over: Partial<WorkbenchInput> & Pick<WorkbenchInput, "providers">): WorkbenchInput => ({
  goal: { amountNow: 0, monthly: 400, months: 12 },
  market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 },
  fund: { kind: "foreign-fund", drag: {} },
  profile: {},
  instrumentClass: "foreign_securities",
  currency: { code: "USD", startRate: fx.USD },
  fx,
  theta: 0.005,
  ...over,
});
/** The tariff with no conversion line read: a run in shekels. */
const tradeTariffOf = (snapshot: unknown, band: string) => {
  const { currency: _, ...input } = workbench({ providers: [] });
  return buildTariff(input, { snapshot, level: "list", band }, snapshot as Parameters<typeof buildTariff>[2]);
};

describe("a minimum in euros (F-12, F-84)", () => {
  it("is converted at the run's euro rate, as dollars and pounds are", () => {
    const { tariff } = tradeTariffOf(psagot, EUROPE);
    expect(tariff.buy).toMatchObject({ rate: 0.0015 });
    expect(tariff.buy!.min).toBeCloseTo(52.4085, 6);
    expect(tariff.sell!.min).toBeCloseTo(52.4085, 6);
  });

  it("twelve orders of 400 NIS and the sale pay the minimum", () => {
    const { tariff } = tradeTariffOf(psagot, EUROPE);
    const r = runSecurities(plain({ buy: tariff.buy!, sell: tariff.sell! }), ctx);
    expect(r.fees.trade).toBeCloseTo(681.3105, 4);
  });

  it("with no euro rate in the run the house is not comparable, and says so", () => {
    const out = providerWorkbench(workbench({ fx: { USD: fx.USD }, providers: [{ snapshot: psagot, level: "list", band: EUROPE }] }), ctx);
    const row = out.rows[0] as NotComparableProvider;
    expect(row.kind).toBe("not-comparable");
    expect(row.reason.code).toBe("needs-fx-rate");
  });
});

describe("a conversion priced per dollar, on the line for the fund's currency (F-13)", () => {
  const tariffFor = (code: string) => {
    const input = workbench({ currency: { code, startRate: fx.USD }, providers: [] });
    return buildTariff(input, { snapshot: psagot, level: "list", band: EUROPE }, psagot);
  };

  it("a dollar fund reads the line printed for the dollar, as shekels a dollar", () => {
    const t = tariffFor("USD");
    expect(t.tariff.fx).toEqual({ rate: 0, perCurrencyUnit: 0.015 });
    expect(t.linesUsed).toContain("psagot-fx-conversion-usd");
    expect(t.linesUsed).not.toContain("psagot-fx-conversion-other");
    expect(fxFee(t.tariff.fx, 400, { fxRate: fx.USD })).toBeCloseTo(1.92215, 5);
  });

  it("a fund in another currency reads the line with no currency, a percentage", () => {
    const t = tariffFor("EUR");
    expect(t.tariff.fx).toBe(0.005);
    expect(t.linesUsed).toContain("psagot-fx-conversion-other");
  });

  it("twelve orders of 400 NIS and the sale, conversion and commission together", () => {
    const { tariff } = tariffFor("USD");
    const r = runSecurities(plain({ buy: tariff.buy!, sell: tariff.sell!, fx: tariff.fx! }), ctx);
    expect(r.fees.fx).toBeCloseTo(42.746808, 5);
    expect(r.fees.trade).toBeCloseTo(681.3105, 4);
    expect(r.nominal).toBeCloseTo(4075.942692, 4);
  });

  it("is a fee line of its own, and removing it takes the whole price away (F-61)", () => {
    const { tariff } = tariffFor("USD");
    const plan = { run: "runSecurities", input: plain({ buy: tariff.buy!, sell: tariff.sell!, fx: tariff.fx! }) } as const;
    expect(feeLines(plan)).toContain("fx");
    const without = withoutFeeLine(plan, "fx");
    expect(without.run === "runSecurities" && without.input.tariff.fx).toBeUndefined();
    const own = withFeeRate(plan, "fx", 0.001);
    expect(own.run === "runSecurities" && own.input.tariff.fx).toEqual({ rate: 0.001 });
  });

  it("a per-dollar price on a fund in another currency is the record's error, not a silent figure", () => {
    const snapshot = { ...psagot, lines: psagot.lines.map((l: { id: string; conversion_currency?: string }) => { if (l.id !== "psagot-fx-conversion-usd") return l; const { conversion_currency: _, ...rest } = l; return rest; }).filter((l: { id: string }) => l.id !== "psagot-fx-conversion-other") };
    expect(() => buildTariff(workbench({ currency: { code: "EUR", startRate: fx.EUR }, providers: [] }), { snapshot, level: "list", band: EUROPE }, snapshot)).toThrow(/per dollar/);
  });
});
