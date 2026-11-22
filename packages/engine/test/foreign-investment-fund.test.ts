// F-04, TXS-14, method §13: an Israeli fund that may be measured by a principal currency (its documents name it a foreign-investment fund,
// or its record says the status is not known and its index is in a foreign currency) is run under both readings of TXS OQ26: the principal
// currency's exchange rate, and the CPI. Where they give the same result it stands, flagged; where not, the run stops on TXS-14 with the
// question and the fund is read before tax (F-118).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BlockedError, fundOf, runSecurities, runSecuritiesBeforeTax, securitiesBlockedBy, securitiesStopOf, type SecuritiesInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const under = (reading: "principal" | "cpi") => ({ ...ctx, readings: { "TXS OQ26": reading } });
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);
const ids = (r: { rules: { id: string }[] }) => r.rules.map((u) => u.id);

// one sum, no fees, no spread, five years: the gain is the return alone, so the exit tax is 25% of the gain above the index (TXS-09)
const amount = 100_000;
const years = 5;
const fif = { kind: "israeli-fund", drag: {}, principalCurrency: "USD" } as const;
const input = (market: Partial<SecuritiesInput["market"]> = {}, fund: SecuritiesInput["fund"] = fif): SecuritiesInput => ({
  goal: { amountNow: amount, monthly: 0, months: 12 * years },
  market: { grossReturn: 0.06, inflation: 0.025, ...market },
  fund,
  tariff: {},
  profile: {},
});
const gross = (r: number) => amount * (1 + r) ** years;

describe("the principal-currency reading of a foreign-investment fund's tax index (F-04, TXS-14)", () => {
  it("measures the real gain against the dollar's path when the dollar rises", () => {
    const r = runSecurities(input({ principalFxChange: 0.03 }), under("principal"));
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount * 1.03 ** years), 2);
    expect(ids(r)).toContain("TXS-14");
  });

  it("at a falling dollar the inflationary amount is zero, not negative: the whole nominal gain is real (TXS-02, example 3)", () => {
    const r = runSecurities(input({ principalFxChange: -0.03 }), under("principal"));
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount), 2);
    expect(r.detail.realGain).toBeCloseTo(r.detail.nominalGain ?? Number.NaN, 6);
  });

  it("on a nominal loss while the dollar fell, the part of the loss equal to the fall is not allowable (TXS-02, example 4)", () => {
    const r = runSecurities(input({ grossReturn: -0.05, principalFxChange: -0.02 }), under("principal"));
    const loss = amount - gross(-0.05);
    const fall = amount * (1 - 0.98 ** years);
    expect(r.detail.fallDisallowed).toBeCloseTo(fall, 4);
    expect(r.detail.realGain).toBeCloseTo(-(loss - fall), 4);
    expect(r.taxAtExit).toBe(0);
  });

  it("where the dollar rose more than the fund, the whole nominal gain is the exempt inflationary amount: no tax (TXS-02, example 2)", () => {
    const r = runSecurities(input({ grossReturn: 0.02, principalFxChange: 0.05 }), under("principal"));
    expect(gross(0.02)).toBeGreaterThan(amount);
    expect(r.taxAtExit).toBe(0);
    expect(r.nominal).toBeCloseTo(gross(0.02), 4);
  });

  it("indexes each monthly purchase from its own month: a lot bought in month m by X_T / X_m (F-03, F-08)", () => {
    // nothing now, 1,000 a month in nominal shekels for two years, each bought at the start of its month and held to the end of month 24
    const T = 24;
    const r0 = 0.06;
    const f = 0.03;
    const g = (1 + r0) ** (1 / 12) - 1;
    const run: SecuritiesInput = { ...input({ grossReturn: r0, principalFxChange: f }), goal: { amountNow: 0, monthly: 1000, months: T, contributions: "nominal" } };
    let real = 0;
    for (let m = 1; m <= T; m++) real += 1000 * (1 + g) ** (T - m + 1) - 1000 * (1 + f) ** ((T - m) / 12);
    expect(runSecurities(run, under("principal")).taxAtExit).toBeCloseTo(0.25 * real, 2);
  });
});

describe("both readings of TXS OQ26 (method §13)", () => {
  it("where the dollar moves as prices do, both readings give the same result: the run stands, ranks and flags the question", () => {
    const r = runSecurities(input({ principalFxChange: 0.025 }), ctx);
    expect(r.outcome.code).toBe("eligible");
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount * 1.025 ** years), 2);
    expect(codes(r)).toContain("TXS-OQ26");
    expect(securitiesStopOf(input({ principalFxChange: 0.025 }), ctx)).toBeNull();
  });

  it("where they give different results, the run stops on TXS-14 with the question, and the fund is read before tax instead", () => {
    const split = input({ principalFxChange: 0 });
    expect(runSecurities(split, under("principal")).taxAtExit).not.toBeCloseTo(runSecurities(split, under("cpi")).taxAtExit, 0);
    let stopped: unknown;
    try {
      runSecurities(split, ctx);
    } catch (e) {
      stopped = e;
    }
    expect(stopped).toBeInstanceOf(BlockedError);
    expect(stopped).toMatchObject({ ruleId: "TXS-14", question: "TXS OQ26" });
    expect(securitiesStopOf(split, ctx)).toEqual({ ruleId: "TXS-14", question: "TXS OQ26" });
    const before = runSecuritiesBeforeTax(split, ctx);
    expect(before.outcome).toEqual({ code: "listed-not-ranked", reason: "TXS-14", question: "TXS OQ26" });
    expect(before.beforeTaxNominal).toBeCloseTo(gross(0.06), 4);
  });

  it("is never blocked before a run: whether the readings split is the run's to say", () => {
    expect(securitiesBlockedBy(fif, ctx)).toBeNull();
  });

  it("stops on a run that gives no path for the principal currency", () => {
    expect(() => runSecurities(input(), under("principal"))).toThrow(/principalFxChange/);
  });

  it("leaves an Israeli fund that is not one on the CPI, with no flag", () => {
    const r = runSecurities(input({ principalFxChange: 0 }, { kind: "israeli-fund", drag: {} }), ctx);
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount * 1.025 ** years), 2);
    expect(codes(r)).not.toContain("TXS-OQ26");
  });
});

describe("the fund a record gives (fundOf)", () => {
  const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/funds/${p}`, import.meta.url), "utf8"));
  const withStatus = (value: string | false | null) => {
    const rec = read("5129275@2026-10-25.json");
    return { ...rec, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...rec.tax_status.foreign_investment_fund, value, notes: "as the test sets it" } } };
  };
  it("carries the principal currency the fund's documents name, and none where they say it is not one", () => {
    expect(fundOf(withStatus("USD"), "israeli-fund", undefined, undefined, undefined, undefined, "USD").fund.principalCurrency).toBe("USD");
    expect(fundOf(withStatus(false), "israeli-fund", undefined, undefined, undefined, undefined, "USD").fund.principalCurrency).toBeUndefined();
  });
  it("takes the index's foreign currency as the candidate where the status is not known, so the run meets both readings, and none on a shekel index", () => {
    expect(fundOf(withStatus(null), "israeli-fund", undefined, undefined, undefined, undefined, "USD").fund.principalCurrency).toBe("USD");
    expect(fundOf(withStatus(null), "israeli-fund", undefined, undefined, undefined, undefined, undefined).fund.principalCurrency).toBeUndefined();
  });
});
