// F-04, TXS-14: an Israeli fund its report names a foreign-investment fund takes its principal currency's exchange rate as the tax index,
// on the site's reading of TXS OQ26, which the run flags; any other Israeli fund's shekel units take the CPI.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fundOf, runSecurities, securitiesBlockedBy, type SecuritiesInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);
const ids = (r: { rules: { id: string }[] }) => r.rules.map((u) => u.id);

// one sum, no fees, no spread, five years: the gain is the return alone, so the exit tax is 25% of the gain above the index (TXS-09)
const amount = 100_000;
const years = 5;
const run = (fund: SecuritiesInput["fund"], market: Partial<SecuritiesInput["market"]> = {}) =>
  runSecurities({ goal: { amountNow: amount, monthly: 0, months: 12 * years }, market: { grossReturn: 0.06, inflation: 0.025, ...market }, fund, tariff: {}, profile: {} }, ctx);
const gross = amount * 1.06 ** years;

describe("the tax index of an Israeli foreign-investment fund (F-04, TXS-14)", () => {
  const fif = { kind: "israeli-fund", drag: {}, principalCurrency: "USD" } as const;

  it("at a steady dollar taxes the whole nominal gain, the part inflation made included, and flags TXS OQ26", () => {
    const r = run(fif, { principalFxChange: 0 });
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross - amount), 2);
    expect(codes(r)).toContain("TXS-OQ26");
    expect(ids(r)).toContain("TXS-14");
  });

  it("measures the real gain against the dollar's path when the dollar moves", () => {
    const r = run(fif, { principalFxChange: 0.03 });
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross - amount * 1.03 ** years), 2);
  });

  it("is never blocked: the reading stands behind the figure, flagged, and the run ranks", () => {
    expect(securitiesBlockedBy(fif, ctx)).toBeNull();
    expect(run(fif, { principalFxChange: 0 }).outcome.code).toBe("eligible");
  });

  it("stops on a run that gives no path for the principal currency", () => {
    expect(() => run(fif)).toThrow(/principalFxChange/);
  });

  it("leaves an Israeli fund that is not one on the CPI, with no flag", () => {
    const r = run({ kind: "israeli-fund", drag: {} }, { principalFxChange: 0 });
    expect(r.taxAtExit).toBeCloseTo(0.25 * (gross - amount * 1.025 ** years), 2);
    expect(codes(r)).not.toContain("TXS-OQ26");
  });
});

describe("the fund a record gives (fundOf)", () => {
  const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/funds/${p}`, import.meta.url), "utf8"));
  it("carries the principal currency the fund's report names, and none where it names the fund no foreign-investment fund", () => {
    expect(fundOf(read("5129275@2026-10-25.json"), "israeli-fund", undefined, undefined).fund.principalCurrency).toBe("USD");
    expect(fundOf(read("5139100@2026-10-25.json"), "israeli-fund", undefined, undefined).fund.principalCurrency).toBeUndefined();
  });
});
