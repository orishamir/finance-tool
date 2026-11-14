// F-121: a fund fee lowered for a stated period is charged at the promotion's rate in the run's months the promotion covers whole, and at the
// fee's own rate from the month the day after its last day falls in. Figures worked by hand: no return, no inflation, no trade fee.
import { describe, expect, it } from "vitest";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { dayAfter } from "../src/formulas/time.ts";
import { promotedDrag } from "../src/formulas/fund-promotion.ts";
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
  it("charges the promotion in the months it covers whole, by month, not only how many", () => {
    // run of 14.11.2026; months start on the 14th. A promotion of 1.2.2027 to 31.3.2027 falls in month 3 (14.1 to 13.2); month 4 is the
    // first inside it; the day after its end, 1.4.2027, falls in month 5
    const d = promotedDrag(0.012, [{ cut: 0.012, from: "2027-02-01", to: "2027-03-31" }], "2026-11-14");
    expect([1, 2, 3, 4, 5, 6].map(d.at)).toEqual([0.012, 0.012, 0.012, 0, 0.012, 0.012]);
    // one that started by the run date is charged from month 1; month 2 holds 1.1.2027, the day after it ends
    const now = promotedDrag(0.012, [{ cut: 0.012, from: "2026-07-01", to: "2026-12-31" }], "2026-11-14");
    expect([1, 2, 3].map(now.at)).toEqual([0, 0.012, 0.012]);
  });
  it("a promotion that starts on a month's first day covers that month whole, as one that ends on a month's last day covers its last month", () => {
    // 14.1.2027 is month 3's first day: month 3 pays the promotion's rate; 13.4.2027 is month 5's last day, so month 5 does too and month 6 not
    const d = promotedDrag(0.012, [{ cut: 0.012, from: "2027-01-14", to: "2027-04-13" }], "2026-11-14");
    expect([2, 3, 4, 5, 6].map(d.at)).toEqual([0.012, 0, 0, 0, 0.012]);
    // a day later, 15.1.2027, month 3 is covered in part and pays the fee's own rate
    const later = promotedDrag(0.012, [{ cut: 0.012, from: "2027-01-15", to: "2027-04-13" }], "2026-11-14");
    expect([3, 4].map(later.at)).toEqual([0.012, 0]);
  });
  it("where the month matters (a return), a shifted window gives another figure", () => {
    const grow = (promotions: NonNullable<SecuritiesInput["fund"]["drag"]>["promotions"]) =>
      runSecurities({ ...input({ trustee: 0.012, ...(promotions ? { promotions } : {}) }), market: { grossReturn: 0.2, inflation: 0 } }, ctx).fees.fund;
    // one free month each: month 1, or month 9 (1.7.2027 falls in month 8, 1.9.2027 in month 10); the balance has grown by month 9, so its
    // free month saves more
    const plain = grow(undefined);
    const early = grow([{ part: "trustee", rate: 0, from: "2026-07-01", to: "2026-12-31" }]);
    const late = grow([{ part: "trustee", rate: 0, from: "2027-07-01", to: "2027-08-31" }]);
    expect(early).toBeLessThan(plain);
    expect(late).toBeLessThan(early);
  });
  it("a part already below the promotion's rate (a variable fee priced at what it charged) stays as it is: a promotion never raises the drag", () => {
    const plain = runSecurities(input({ variable: 0.001 }), ctx).fees.fund;
    const promoted = runSecurities(input({ variable: 0.001, promotions: [{ part: "variable", rate: 0.004, from: "2026-07-01", to: "2027-12-31" }] }), ctx).fees.fund;
    expect(promoted).toBeCloseTo(plain, 6);
  });
  it("a promotion that ended before the run, or of a part the drag does not hold, changes nothing", () => {
    const plain = runSecurities(input({ trustee: 0.012 }), ctx).fees.fund;
    expect(runSecurities(input({ trustee: 0.012, promotions: [{ part: "trustee", rate: 0, from: "2026-01-01", to: "2026-06-30" }] }), ctx).fees.fund).toBeCloseTo(plain, 6);
    expect(runSecurities(input({ trustee: 0.012, promotions: [{ part: "variable", rate: 0, from: "2026-07-01", to: "2026-12-31" }] }), ctx).fees.fund).toBeCloseTo(plain, 6);
  });
});
