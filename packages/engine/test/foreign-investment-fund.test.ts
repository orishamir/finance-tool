// F-04, TXS-14, method §13, D119: an Israeli fund whose documents name it a foreign-investment fund is run on its principal currency's
// exchange rate, the site's reading of TXS OQ26, labelled `reading` on TXS-14. One the site does not know (its record says the status is not
// known and its index is in a foreign currency, or the person typed it) is run under both readings: the principal currency's exchange rate,
// and the CPI. Where they give the same result it stands, flagged; where not, the reading that leaves the holder less after the exit tax
// stands, labelled the site's cautious reading of TXS-14 with what the site does not know, and is ranked (guidelines/research.md step 6).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fundOf, runSecurities, securitiesBlockedBy, securitiesStopOf, type SecuritiesInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const under = (reading: "principal" | "cpi") => ({ ...ctx, readings: { "TXS OQ26": reading } });
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);
const ids = (r: { rules: { id: string }[] }) => r.rules.map((u) => u.id);

// one sum, no fees, no spread, five years: the gain is the return alone, so the exit tax is 25% of the gain above the index (TXS-09)
const amount = 100_000;
const years = 5;
const fif = { kind: "israeli-fund", drag: {}, principalCurrency: "USD" } as const;
/** The same fund where the site does not know its status (`notKnown`), which meets both readings. */
const unknown = { ...fif, notKnown: "status" } as const;
const input = (market: Partial<SecuritiesInput["market"]> = {}, fund: SecuritiesInput["fund"] = unknown): SecuritiesInput => ({
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

  it("where they give different results, the reading that leaves less after the exit tax stands, whole, labelled the site's cautious reading of TXS-14", () => {
    for (const principalFxChange of [0, 0.05, -0.02]) {
      const split = input({ principalFxChange });
      const [onPrincipal, onCpi] = [runSecurities(split, under("principal")), runSecurities(split, under("cpi"))];
      const byReading = [onPrincipal, onCpi];
      expect(onPrincipal.taxAtExit).not.toBeCloseTo(onCpi.taxAtExit, 0);
      const low = byReading.reduce((a, b) => (b.real < a.real ? b : a));
      const r = runSecurities(split, ctx);
      const { labels, ...rest } = r;
      const { labels: lowLabels, ...lowRest } = low;
      expect(rest).toEqual(lowRest);
      expect(labels).toEqual([...lowLabels, { code: "cautious", ruleId: "TXS-14", notKnown: "status" }]);
      expect(r.outcome.code).toBe("eligible");
      expect(codes(r)).not.toContain("TXS-OQ26");
      expect(securitiesStopOf(split, ctx)).toBeNull();
    }
  });

  it("carries on its cautious label what the site does not know of the fund: its status, or its documents for a fund the person typed", () => {
    const split = (notKnown: "status" | "documents") => runSecurities(input({ principalFxChange: 0.05 }, { ...fif, notKnown }), ctx);
    expect(split("status").labels).toContainEqual({ code: "cautious", ruleId: "TXS-14", notKnown: "status" });
    expect(split("documents").labels).toContainEqual({ code: "cautious", ruleId: "TXS-14", notKnown: "documents" });
  });

  it("agree where A-03 and A-02 differ but both indices fall and every lot is a nominal gain: neither reading has an inflationary amount (F-09)", () => {
    const falling = input({ inflation: -0.01, principalFxChange: -0.03 });
    const principal = runSecurities(falling, under("principal"));
    const cpi = runSecurities(falling, under("cpi"));
    expect(principal.detail.realGain).toBeCloseTo(principal.detail.nominalGain ?? Number.NaN, 6);
    expect(cpi.detail.realGain).toBeCloseTo(cpi.detail.nominalGain ?? Number.NaN, 6);
    const r = runSecurities(falling, ctx);
    expect(r.outcome.code).toBe("eligible");
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount), 2);
    expect(codes(r)).toContain("TXS-OQ26");
    expect(securitiesStopOf(falling, ctx)).toBeNull();
  });

  it("is never blocked before a run: whether the readings split is the run's to say", () => {
    expect(securitiesBlockedBy(unknown, ctx)).toBeNull();
    expect(securitiesBlockedBy(fif, ctx)).toBeNull();
  });

  it("stops on a run that gives no path for the principal currency", () => {
    expect(() => runSecurities(input(), under("principal"))).toThrow(/principalFxChange/);
  });

  it("leaves an Israeli fund that is not one on the CPI, with no flag, citing TXS-14 for its index", () => {
    const r = runSecurities(input({ principalFxChange: 0 }, { kind: "israeli-fund", drag: {} }), ctx);
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross(0.06) - amount * 1.025 ** years), 2);
    expect(codes(r)).not.toContain("TXS-OQ26");
    expect(ids(r)).toContain("TXS-14");
  });

  it("a book whose readings hold the question unanswered stops on TXS-14 and says the question", () => {
    expect(securitiesStopOf(input({ principalFxChange: 0 }), { ...ctx, readings: { "TXS OQ26": null } })).toEqual({ ruleId: "TXS-14", question: "TXS OQ26" });
  });

  it("the value before tax, B = V_T real + the tax paid over I_T (F-91), is the same under both readings where they split: an account's cost before tax reads no tax index", () => {
    // monthly purchases at a house with a commission, a minimum and custody: the after-tax values differ by reading, B does not
    const account: SecuritiesInput = {
      ...input({ principalFxChange: 0 }),
      goal: { amountNow: 10_000, monthly: 500, months: 120 },
      tariff: { buy: { rate: 0.004, min: 26 }, sell: { rate: 0.004, min: 26 }, custody: { rate: 0.0015, everyMonths: 3, min: 15 } },
    };
    const B = (r: ReturnType<typeof runSecurities>) => r.real + (r.taxDuring + r.taxAtExit) / (r.series.at(-1)?.index ?? Number.NaN);
    const principal = runSecurities(account, under("principal"));
    const cpi = runSecurities(account, under("cpi"));
    expect(principal.taxAtExit).not.toBeCloseTo(cpi.taxAtExit, 0);
    expect(B(principal)).toBeCloseTo(B(cpi), 6);
  });
});

describe("the site's reading of TXS OQ26 for a fund whose documents name it a foreign-investment fund (D119)", () => {
  it("is the run made under the principal-currency reading, labelled the site's reading of TXS-14, with no cautious label and no flag of the question", () => {
    // markets where the readings agree and where they split either way: the run is the principal reading's whatever the CPI does
    for (const market of [{ principalFxChange: 0.025 }, { principalFxChange: 0 }, { principalFxChange: 0.05 }, { principalFxChange: -0.02, inflation: -0.01 }]) {
      const known = runSecurities(input(market, fif), ctx);
      const forced = runSecurities(input(market, unknown), under("principal"));
      const { labels, ...rest } = known;
      const { labels: forcedLabels, ...forcedRest } = forced;
      expect(rest).toEqual(forcedRest);
      expect(labels).toEqual([...(forcedLabels ?? []), { code: "reading", ruleId: "TXS-14" }]);
      expect(labels?.some((l) => l.code === "cautious")).toBe(false);
      expect(codes(known)).not.toContain("TXS-OQ26");
      expect(ids(known)).toContain("TXS-14");
      expect(known.outcome.code).toBe("eligible");
      expect(securitiesStopOf(input(market, fif), ctx)).toBeNull();
    }
  });
});

describe("the fund a record gives (fundOf)", () => {
  const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/funds/${p}`, import.meta.url), "utf8"));
  const withStatus = (value: string | false | null) => {
    const rec = read("5129275@2026-10-25.json");
    return { ...rec, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...rec.tax_status.foreign_investment_fund, value, notes: "as the test sets it" } } };
  };
  it("carries the principal currency the fund's documents name, and none where they say it is not one", () => {
    expect(fundOf(withStatus("USD"), "israeli-fund", { foreignCurrency: "USD" }).fund.principalCurrency).toBe("USD");
    expect(fundOf(withStatus(false), "israeli-fund", { foreignCurrency: "USD" }).fund.principalCurrency).toBeUndefined();
  });
  it("takes the index's foreign currency as the candidate where the status is not known, so the run meets both readings, and none on a shekel index", () => {
    expect(fundOf(withStatus(null), "israeli-fund", { foreignCurrency: "USD" }).fund.principalCurrency).toBe("USD");
    expect(fundOf(withStatus(null), "israeli-fund").fund.principalCurrency).toBeUndefined();
  });
  it("says what the site does not know of the fund: its status where the documents read leave it open, its documents where the person typed it", () => {
    expect(fundOf(withStatus("USD"), "israeli-fund", { foreignCurrency: "USD" }).fund.notKnown).toBeUndefined();
    expect(fundOf(withStatus(null), "israeli-fund", { foreignCurrency: "USD" }).fund.notKnown).toBe("status");
    expect(fundOf(withStatus(null), "israeli-fund", { foreignCurrency: "USD", typed: true }).fund.notKnown).toBe("documents");
  });
});
