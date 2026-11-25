// data-schema §3.5 (A-10): a yield the site works out by F-132 holds exactly what F-132 gives on the payments and NAV the record keeps.
import { describe, expect, it } from "vitest";
import { trailingDistributionYield } from "@finance-tool/engine";
import type { FundRecord } from "@finance-tool/schema";
import { checkFundDistribution } from "../src/validate.ts";

const source = { url: "https://www.ishares.com/us/products/239726/", title: "distributions", publisher: "BlackRock (iShares)", strength: "institution" } as const;
const payment = (ex_date: string, pay_date: string, per_share: number) => ({ kind: "income" as const, ex_date, pay_date, per_share, source, checked: "2026-11-25" });
// IVV as of 31 Oct 2026 (iShares' data download, library 641c3f671428fd14), whose 12-month trailing yield iShares prints unrounded as 1.106187%
const trailing = {
  nav: { date: "2026-10-30", value: 758.946319, source, checked: "2026-11-25" },
  payments: [payment("2025-12-16", "2025-12-19", 2.413592), payment("2026-03-17", "2026-03-20", 1.783517), payment("2026-06-15", "2026-06-18", 1.995653), payment("2026-09-15", "2026-09-18", 2.202607)],
};

type Distribution = NonNullable<FundRecord["distribution"]>;

function record(value: number, over: Partial<Distribution> = {}, yieldOver: Partial<Distribution["yield"]> = {}): Pick<FundRecord, "distribution_policy" | "distribution"> {
  return {
    distribution_policy: "distributing",
    distribution: {
      yield: {
        value,
        unit: "pct_per_year",
        source,
        checked: "2026-11-25",
        effective_from: "2026-10-31",
        effective_to: null,
        update_rule: "provider-set",
        state: "computed",
        computed_from: { formula: "F-132", inputs: {} },
        ...yieldOver,
      },
      per_year: 4,
      trailing,
      ...over,
    },
  };
}

describe("a yield computed by F-132", () => {
  // the record stores exactly what the function returns
  const stored = trailingDistributionYield(trailing.payments, trailing.nav.value, "2026-10-31");

  it("passes when it is what F-132 gives on its inputs, iShares' 1.106187%", () => {
    expect(stored).toBeCloseTo(1.106187, 6);
    expect(checkFundDistribution(record(stored))).toEqual([]);
  });
  it("fails when the stored figure differs from its inputs, even by rounding", () => {
    expect(checkFundDistribution(record(1.11))[0]).toMatch(/not what F-132 gives/);
    expect(checkFundDistribution(record(1.106187))[0]).toMatch(/not what F-132 gives/);
  });
  it("fails a computed yield with no inputs, and inputs under a yield not computed by F-132", () => {
    expect(checkFundDistribution(record(stored, { trailing: undefined }))).toEqual(["distribution.yield: a computed yield needs its inputs in distribution.trailing (F-132)"]);
    expect(checkFundDistribution(record(stored, {}, { state: "sourced", computed_from: undefined }))[0]).toMatch(/computed_from.formula "F-132"/);
  });
  it("fails a NAV after the yield's day", () => {
    expect(checkFundDistribution(record(stored, { trailing: { ...trailing, nav: { ...trailing.nav, date: "2026-11-02" } } })).some((m) => /after the yield's day/.test(m))).toBe(true);
  });
  it("fails a payment paid before its ex-dividend date", () => {
    const early = { ...trailing, payments: [...trailing.payments.slice(0, 3), payment("2026-09-15", "2026-09-14", 2.202607)] };
    expect(checkFundDistribution(record(stored, { trailing: early }))).toEqual(["distribution.trailing.payments: paid 2026-09-14 before its ex-dividend date 2026-09-15"]);
  });
  it("fails two payments that share an ex-dividend date", () => {
    const twice = { ...trailing, payments: [...trailing.payments.slice(0, 3), payment("2026-06-15", "2026-06-18", 2.202607)] };
    expect(checkFundDistribution(record(trailingDistributionYield(twice.payments, twice.nav.value, "2026-10-31"), { trailing: twice }))).toEqual([
      "distribution.trailing.payments: two payments share the ex-dividend date 2026-06-15; a record lists each payment once",
    ]);
  });
  it("fails when the income payments in the 12 months are not as many as the fund pays a year", () => {
    const three = { ...trailing, payments: trailing.payments.slice(1) };
    expect(checkFundDistribution(record(trailingDistributionYield(three.payments, three.nav.value, "2026-10-31"), { trailing: three }))).toEqual([
      "distribution.trailing.payments: 3 income payments in the 12 months to 2026-10-31, where the fund pays 4 a year (per_year)",
    ]);
    // a payment outside the 12 months does not count toward them
    const older = { ...trailing, payments: [payment("2025-09-16", "2025-09-19", 2.0), ...trailing.payments] };
    expect(checkFundDistribution(record(stored, { trailing: older }))).toEqual([]);
  });
  it("gives the same figure whatever order the payments are listed in", () => {
    const reversed = { ...trailing, payments: [...trailing.payments].reverse() };
    expect(trailingDistributionYield(reversed.payments, reversed.nav.value, "2026-10-31")).toBe(stored);
    expect(checkFundDistribution(record(stored, { trailing: reversed }))).toEqual([]);
  });
});
