// F-121: a fund fee lowered for a stated period is charged at the promotion's rate in the run's months the promotion covers whole, and at the
// fee's own rate from the month the day after its last day falls in. Figures worked by hand: no return, no inflation, no trade fee.
import { describe, expect, it } from "vitest";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { dayAfter } from "../src/formulas/time.ts";
import { context } from "./golden/harness.ts";

const ctx = { ...context(), runDate: "2026-11-14" };
const input = (drag: NonNullable<SecuritiesInput["fund"]["drag"]>): SecuritiesInput => ({
  goal: { amountNow: 120_000, monthly: 0, months: 12 },
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "israeli-fund", drag },
  tariff: {},
  profile: {},
});

describe("a fund fee's promotion (F-121)", () => {
  it("the day after a date crosses months and years", () => {
    expect(dayAfter("2026-12-31")).toBe("2027-01-01");
    expect(dayAfter("2028-02-28")).toBe("2028-02-29");
  });
  it("a trustee fee of 1.2% a year lowered to 0 until 31.12.2026 is free in month 1 only, for a run dated 14.11.2026", () => {
    // month 1 (14.11 to 13.12) lies inside the promotion; month 2 (14.12 to 13.1) holds 1.1.2027, the day after it ends, so it pays 1.2%.
    // Eleven months at 0.1% a month: the fund's fee is 120,000 x (1 - 0.999^11), about 1,315.
    const r = runSecurities(input({ trustee: 0.012, promotions: [{ part: "trustee", rate: 0, from: "2026-07-01", to: "2026-12-31" }] }), ctx);
    const plain = runSecurities(input({ trustee: 0.012 }), ctx);
    expect(r.fees.fund).toBeCloseTo(120_000 * (1 - 0.999 ** 11), 2);
    expect(plain.fees.fund).toBeCloseTo(120_000 * (1 - 0.999 ** 12), 2);
    expect(r.formulas).toContain("F-121");
    expect(plain.formulas).not.toContain("F-121");
  });
  it("a promotion that starts after the run date counts from the first month that starts after its first day", () => {
    // 1.2.2027 falls in month 3 (14.1 to 13.2); month 4 (14.2 to 13.3) is the first inside it, and 1.4.2027 falls in month 5: one free month
    const r = runSecurities(input({ trustee: 0.012, promotions: [{ part: "trustee", rate: 0, from: "2027-02-01", to: "2027-03-31" }] }), ctx);
    expect(r.fees.fund).toBeCloseTo(120_000 * (1 - 0.999 ** 11), 2);
  });
  it("a promotion that ended before the run, or of a part the drag does not hold, changes nothing", () => {
    const plain = runSecurities(input({ trustee: 0.012 }), ctx).fees.fund;
    expect(runSecurities(input({ trustee: 0.012, promotions: [{ part: "trustee", rate: 0, from: "2026-01-01", to: "2026-06-30" }] }), ctx).fees.fund).toBeCloseTo(plain, 6);
    expect(runSecurities(input({ trustee: 0.012, promotions: [{ part: "variable", rate: 0, from: "2026-07-01", to: "2026-12-31" }] }), ctx).fees.fund).toBeCloseTo(plain, 6);
  });
});
