// F-132: the 12-month trailing yield from a fund's own payments and NAV, checked on iShares' published figure for IVV.
import { describe, expect, it } from "vitest";
import { trailingDistributionYield } from "../src/index.ts";

const income = (ex_date: string, per_share: number) => ({ kind: "income" as const, ex_date, per_share });
const capitalGain = (ex_date: string, per_share: number) => ({ kind: "capital_gain" as const, ex_date, per_share });

describe("F-132 the 12-month trailing yield", () => {
  it("gives iShares' own unrounded figure for IVV as of 31 Oct 2026", () => {
    // iShares' data download (library 641c3f671428fd14): four income distributions, no capital gains, NAV 758.946319 on 30 Oct 2026;
    // iShares' 12-month trailing yield for the same day, unrounded, is 1.106187%.
    const ivv = [income("2025-12-16", 2.413592), income("2026-03-17", 1.783517), income("2026-06-15", 1.995653), income("2026-09-15", 2.202607)];
    expect(trailingDistributionYield(ivv, 758.946319, "2026-10-31")).toBeCloseTo(1.106187, 6);
  });

  it("adds the capital gains paid in the 12 months to the NAV it divides by, and counts none of them as income", () => {
    // 3 of income over a NAV of 95 plus 5 of capital gains: 3 / 100 = 3%
    expect(trailingDistributionYield([income("2026-03-01", 1), income("2026-09-01", 2), capitalGain("2026-06-01", 5)], 95, "2026-10-31")).toBeCloseTo(3, 12);
  });

  it("counts a payment whose ex-dividend date is in the 12 months that end on the day, and no other", () => {
    const payments = [
      income("2025-09-29", 10), // before the 12 months
      income("2025-10-31", 10), // the same day a year before: the 12 months start the day after
      capitalGain("2025-10-31", 50), // nor a capital gain before them
      income("2025-11-01", 1), // the first day of the 12 months
      income("2026-10-31", 1), // the last
      income("2026-11-02", 10), // after
    ];
    expect(trailingDistributionYield(payments, 100, "2026-10-31")).toBeCloseTo(2, 12);
  });
});
