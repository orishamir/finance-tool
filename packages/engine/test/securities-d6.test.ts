// D6 as amended 2026-10-26: makam is a security held in a securities account, not a wrapper, so the account's member decides its custody (F-14).
// A bank may not charge custody on makam (BRK-17, BANK-18); a non-bank member's tariff line applies as published (BRK-52).
import { describe, expect, it } from "vitest";
import { runMakam, type MakamInput } from "../src/ledgers/makam.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const base: MakamInput = {
  goal: { amountNow: 100_000, monthly: 0, months: 24 },
  market: { inflation: 0.03 },
  makam: { yield: 0.039 },
  // S06's buy line plus a quarterly custody line of 0.1% (the shape of a broker's tariff)
  tariff: { buy: { rate: 0.001, min: 20 }, custody: { rate: 0.001, everyMonths: 3 } },
};

describe("makam custody follows the account's member (F-14)", () => {
  it("at a bank no custody is charged, and the run equals S06", () => {
    const bank = runMakam({ ...base, memberKind: "bank" }, ctx);
    const s06 = runMakam({ ...base, tariff: { buy: base.tariff.buy! } }, ctx);
    expect(bank.fees.custody).toBe(0);
    expect(bank.real).toBeCloseTo(s06.real, 6);
    expect(bank.rules.map((r) => r.id)).toContain("BRK-17");
  });

  it("the default is a bank, the case P-05's tariff is", () => {
    expect(runMakam(base, ctx).fees.custody).toBe(0);
  });

  it("at a non-bank member the tariff's custody line is charged on the series held", () => {
    const broker = runMakam({ ...base, memberKind: "non-bank" }, ctx);
    const bank = runMakam({ ...base, memberKind: "bank" }, ctx);
    // seven quarter-ends with paper held (the series redeemed at month 24 is paid out), each about 0.1% of a balance near 100,000
    expect(broker.fees.custody).toBeGreaterThan(690);
    expect(broker.fees.custody).toBeLessThan(760);
    expect(broker.real).toBeLessThan(bank.real);
    expect(broker.formulas).toContain("F-14");
  });

  it("a sale before redemption deducts the exit year's custody from the gain once (TXS-06)", () => {
    const sold = { ...base, goal: { ...base.goal, months: 18 }, tariff: { ...base.tariff, sell: { rate: 0.001, min: 20 } } };
    const broker = runMakam({ ...sold, memberKind: "non-bank" }, ctx);
    const bank = runMakam({ ...sold, memberKind: "bank" }, ctx);
    expect(broker.taxAtExit).toBeLessThan(bank.taxAtExit);
  });
});

describe("the account's monthly fee follows a security into the account (F-17)", () => {
  it("a broker's monthly account fee is charged on makam held there", () => {
    const fee = runMakam({ ...base, memberKind: "non-bank", tariff: { buy: base.tariff.buy!, monthlyFee: 50 } }, ctx);
    const none = runMakam({ ...base, memberKind: "non-bank", tariff: { buy: base.tariff.buy! } }, ctx);
    // 23 months with paper held (month 24 pays the last series out)
    expect(fee.fees.fixed).toBeCloseTo(50 * 23, 6);
    expect(fee.real).toBeLessThan(none.real);
    expect(fee.formulas).toContain("F-17");
  });
});
