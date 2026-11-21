// F-12 with F-24 and F-25: in the makam and bond runs, an order its cash cannot pay is not placed, and its cash stays in the account as
// cash, earning nothing, joins the next order placed, pays the account's monthly fee the holdings cannot (F-17), and at the horizon is
// part of what is left. F-09: a sale's commission takes at most the proceeds, and its conversion at most what it converts (F-13), so a
// sale never leaves less than nothing. Expected figures worked by hand (comments), with no yield, return or inflation unless a test says
// otherwise, so a unit of face value costs one shekel.
import { describe, expect, it } from "vitest";
import { saleCommission, saleConversion } from "../src/formulas/fees.ts";
import { runBond, type BondInput } from "../src/ledgers/bond.ts";
import { runMakam, type MakamInput } from "../src/ledgers/makam.ts";
import { runSecurities } from "../src/ledgers/securities.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const line = { rate: 0.001, min: 10 };

const makam = (over: Partial<MakamInput> = {}): MakamInput => ({
  goal: { amountNow: 0, monthly: 8, months: 3 },
  market: { inflation: 0 },
  makam: { yield: 0 },
  tariff: { buy: line },
  ...over,
});

const bond = (over: Partial<BondInput> = {}): BondInput => ({
  goal: { amountNow: 0, monthly: 8, months: 3 },
  market: { inflation: 0 },
  bond: { coupon: 0, linkage: "unlinked", couponEveryMonths: 12 },
  tariff: { buy: line },
  profile: {},
  ...over,
});

describe("a sale's commission takes at most the proceeds (F-09)", () => {
  it("at 0.1% with a minimum of 10 NIS a sale of 6 pays 6, one of 10 pays 10, and one of 20,000 pays 20", () => {
    expect(saleCommission(line, 6, { fxRate: 1 })).toBe(6);
    expect(saleCommission(line, 10, { fxRate: 1 })).toBe(10);
    expect(saleCommission(line, 20_000, { fxRate: 1 })).toBeCloseTo(20, 9);
    expect(saleCommission(line, 0, { fxRate: 1 })).toBe(0);
    // a flat price above the proceeds takes them all
    expect(saleCommission({ rate: 0.001, min: 10, flatUpTo: { amount: 4, upTo: 1_000 } }, 3, { fxRate: 1 })).toBe(3);
  });

  it("the securities run's sale leaves nothing, not less: 15 NIS buys 5 with a 10 NIS minimum, and the sale of 5 pays 5", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 15, monthly: 0, months: 2 },
        market: { grossReturn: 0, inflation: 0 },
        fund: { kind: "israeli-fund", drag: {} },
        tariff: { buy: { rate: 0, min: 10 }, sell: { rate: 0, min: 10 } },
        profile: {},
      },
      ctx,
    );
    expect(r.fees.trade).toBeCloseTo(15, 9);
    expect(r.nominal).toBeCloseTo(0, 9);
  });
});

describe("a sale's conversion takes at most what it converts (F-09, F-13)", () => {
  it("a 10 NIS minimum takes 5 of 5 converted and 10 of 1,000; a 0.5% spread is charged beside the fee within the cap", () => {
    const fx = { rate: 0, min: 10 };
    expect(saleConversion(fx, 5, { fxRate: 4 })).toBe(5);
    expect(saleConversion(fx, 1_000, { fxRate: 4 })).toBe(10);
    expect(saleConversion(fx, 1_000, { fxRate: 4 }, 0.005)).toBeCloseTo(15, 9);
    expect(saleConversion(fx, 8, { fxRate: 4 }, 0.005)).toBe(8);
    expect(saleConversion(fx, 0, { fxRate: 4 })).toBe(0);
    expect(saleConversion(undefined, 100, { fxRate: 4 })).toBe(0);
  });

  it("the securities run's sale abroad leaves nothing, not less: 15 NIS converts for 10 and buys 5, and the sale's conversion of 5 takes 5", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 15, monthly: 0, months: 2 },
        market: { grossReturn: 0, inflation: 0 },
        fund: { kind: "foreign-fund", drag: {} },
        tariff: { buy: { rate: 0 }, fx: { rate: 0, min: 10 }, currency: { code: "USD", startRate: 4 } },
        profile: {},
      },
      ctx,
    );
    expect(r.fees.fx).toBeCloseTo(15, 9);
    expect(r.nominal).toBeCloseTo(0, 9);
  });
});

describe("the makam run keeps the cash of an order not placed (F-24)", () => {
  it("8 NIS a month at a 10 NIS minimum: month 1 waits, month 2 buys 6 with 16, month 3 waits, and 14 is left", () => {
    // month 1: 8 cannot pay 10, waits; month 2: 16 buys 6 of paper and pays 10; month 3: 8 waits; at the horizon the series of 6 is sold
    // at par (no sell line) and the 8 waiting joins it: 14 of the 24 paid in, 10 in commission
    const r = runMakam(makam(), ctx);
    expect(r.paidIn).toBeCloseTo(24, 9);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(14, 9);
    expect(r.taxAtExit).toBe(0);
    // the waiting cash is in the month's balance: 8 after month 1, 6 of paper after month 2
    expect(r.series[1]!.balance).toBeCloseTo(8, 9);
    expect(r.series[2]!.balance).toBeCloseTo(6, 9);
  });

  it("a run none of whose orders is placed leaves all it was paid, untaxed", () => {
    const r = runMakam(makam({ goal: { amountNow: 0, monthly: 5, months: 2 } }), ctx);
    expect(r.fees.trade).toBe(0);
    expect(r.nominal).toBeCloseTo(10, 9);
    expect(r.taxAtExit).toBe(0);
  });

  it("a redemption's commission takes at most its proceeds: 5 of paper redeemed at a 10 NIS minimum leaves nothing, never less", () => {
    // 5 now buys 5 of paper with no buy line; at month 12 the series is redeemed at par, no discount to tax, and the redemption line's
    // minimum of 10 takes the 5
    const r = runMakam(makam({ goal: { amountNow: 5, monthly: 0, months: 13 }, tariff: { redeem: line } }), ctx);
    expect(r.fees.trade).toBeCloseTo(5, 9);
    expect(r.nominal).toBeCloseTo(0, 9);
  });

  it("the sale of a series at the horizon pays at most its proceeds: the series of 6 pays 6 at a 10 NIS minimum, and the 8 waiting is left", () => {
    const r = runMakam(makam({ tariff: { buy: line, sell: line } }), ctx);
    expect(r.fees.trade).toBeCloseTo(16, 9);
    expect(r.nominal).toBeCloseTo(8, 9);
  });
});

describe("the makam and bond runs charge the account's monthly fee out of the waiting cash the holdings cannot pay it from (F-17)", () => {
  it("makam, 8 NIS a month, a 10 NIS minimum and 1 NIS a month: month 1's fee comes out of the 8 waiting, and 11 is left", () => {
    // month 1: 8 waits and pays the fee, 7 waits; month 2: 15 buys 5 for 10, and a slice of 1 pays the fee; month 3: 8 waits, and a slice
    // of 1 pays the fee. At the horizon the 3 of paper and the 8 waiting: 24 paid in, 10 in commission, 3 in fees
    const r = runMakam(makam({ tariff: { buy: line, monthlyFee: 1 } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(3, 9);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(11, 9);
    expect(r.series[1]!.balance).toBeCloseTo(7, 9);
    // the fee the cash paid is among the exit year's fees, as the securities run counts it (TXS-06)
    expect(r.detail.exitYearFees).toBeCloseTo(3, 9);
  });

  it("makam with no order placed: the waiting cash pays every month's fee", () => {
    // month 1: 5 pays 1, 4 waits; month 2: 9 waits and pays 1: 8 left of 10
    const r = runMakam(makam({ goal: { amountNow: 0, monthly: 5, months: 2 }, tariff: { buy: line, monthlyFee: 1 } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(2, 9);
    expect(r.nominal).toBeCloseTo(8, 9);
    expect(r.taxAtExit).toBe(0);
  });

  it("makam: a fee above what the account holds takes all of it and no more", () => {
    const r = runMakam(makam({ goal: { amountNow: 0, monthly: 5, months: 2 }, tariff: { buy: line, monthlyFee: 6 } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(0, 9);
  });

  it("bond, 8 NIS a month, a 10 NIS minimum and 1 NIS a month: month 1's fee comes out of the 8 waiting, and 11 is left", () => {
    // as the makam: 3 of face and 8 waiting at the horizon; the bond's gain, 3 less a cost of 3 less the year's 3 in fees, is a loss
    const r = runBond(bond({ tariff: { buy: line, monthlyFee: 1 } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(3, 9);
    expect(r.nominal).toBeCloseTo(11, 9);
    expect(r.series[1]!.balance).toBeCloseTo(7, 9);
    expect(r.detail.exitYearFees).toBeCloseTo(3, 9);
    expect(r.taxAtExit).toBe(0);
  });
});

describe("the bond run keeps the cash of an order not placed (F-25)", () => {
  it("8 NIS a month at a 10 NIS minimum: month 1 waits, month 2 buys 6 with 16, month 3 waits, and 14 is left", () => {
    const r = runBond(bond(), ctx);
    expect(r.paidIn).toBeCloseTo(24, 9);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(14, 9);
    expect(r.taxAtExit).toBe(0);
    expect(r.series[1]!.balance).toBeCloseTo(8, 9);
  });

  it("a net coupon too small to buy waits and is part of what is left", () => {
    // 1,000 now buys 990 of face and pays 10; the 0.6% coupon at month 12 is 5.94, 5.049 after 15%, which cannot pay 10 and waits;
    // at month 13 the 990 are sold at par and the 5.049 joins them
    const r = runBond(bond({ goal: { amountNow: 1_000, monthly: 0, months: 13 }, bond: { coupon: 0.006, linkage: "unlinked", couponEveryMonths: 12 } }), ctx);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.taxDuring).toBeCloseTo(0.15 * 5.94, 9);
    expect(r.nominal).toBeCloseTo(990 + 5.049, 9);
  });

  it("the sale at the horizon pays at most its proceeds: the 6 of face pays 6 at a 10 NIS minimum, and the 8 waiting is left", () => {
    const r = runBond(bond({ tariff: { buy: line, sell: line } }), ctx);
    expect(r.fees.trade).toBeCloseTo(16, 9);
    expect(r.nominal).toBeCloseTo(8, 9);
  });
});
