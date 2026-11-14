// F-119: an amount s.120ב moves, in a later tax year (TXG-09, TXG-06). Frozen through 2027 at the 2026 figure, then grown by the CPI rise of
// each year before, the 2027 rise first; a year's rise is the run's inflation (A-02). Figures worked by hand in the comments.
import { describe, expect, it } from "vitest";
import { freezeEnd, indexedAmount } from "../src/formulas/indexation.ts";
import { ruleBook } from "../src/resolver.ts";
import { runSecurities } from "../src/ledgers/securities.ts";
import { context } from "./golden/harness.ts";

const ctx = context(); // run date 2026-10-23: grid year 1 is 2026

describe("F-119 the formula", () => {
  it("reads the freeze's last year from the figure's update rule", () => {
    expect(freezeEnd("frozen 2025-2027")).toBe(2027);
    expect(freezeEnd("fixed in law")).toBeNull();
    expect(freezeEnd(undefined)).toBeNull();
  });
  it("keeps the amount through the freeze, then grows it by one year's rise for each year after 2027", () => {
    expect(indexedAmount(721_560, 2026, 2027, 2026, 0.02)).toBe(721_560);
    expect(indexedAmount(721_560, 2026, 2027, 2027, 0.02)).toBe(721_560);
    // 2028: the 2027 rise alone, 721,560 × 1.02 = 735,991.20; 2030: × 1.02³ = 765,725.24
    expect(indexedAmount(721_560, 2026, 2027, 2028, 0.02)).toBeCloseTo(735_991.2, 6);
    expect(indexedAmount(721_560, 2026, 2027, 2030, 0.02)).toBeCloseTo(765_725.244, 2);
    // a figure read after the freeze grows from its own year
    expect(indexedAmount(800_000, 2029, 2027, 2031, 0.03)).toBeCloseTo(800_000 * 1.03 ** 2, 6);
  });
});

describe("F-119 in the rule book", () => {
  it("serves the surtax threshold, a band's bound and a relief cap in a later tax year; rates and figures that are not frozen do not move", () => {
    const book = ruleBook(ctx, { inflation: 0.02 });
    expect(book.inYear(1).amount("TXG-09", "threshold")).toBe(721_560);
    expect(book.inYear(2).amount("TXG-09", "threshold")).toBe(721_560);
    expect(book.inYear(3).amount("TXG-09", "threshold")).toBeCloseTo(735_991.2, 6);
    expect(book.inYear(3).amount("TXG-10", "threshold")).toBeCloseTo(735_991.2, 6);
    expect(book.inYear(5).amount("TXP-02", "eligible_income_cap")).toBeCloseTo(116_400 * 1.02 ** 3, 6);
    expect(book.inYear(5).brackets("TXG-04", "brackets")[0]!.upTo).toBeCloseTo(84_120 * 1.02 ** 3, 6);
    expect(book.inYear(5).brackets("TXG-04", "brackets").at(-1)!.upTo).toBeNull();
    expect(book.inYear(5).brackets("TXG-04", "brackets")[0]!.rate).toBe(book.brackets("TXG-04", "brackets")[0]!.rate);
    expect(book.inYear(9).rate("TXG-09", "rate")).toBe(0.03);
    expect(book.inYear(9).amount("TXG-04", "age")).toBe(60);
    // not frozen by s.120ב in its record ("fixed in law"): as read
    expect(book.inYear(9).amount("TXH-08", "self_employed_benefited")).toBe(book.amount("TXH-08", "self_employed_benefited"));
    expect(book.indexedYears()).toEqual([2028, 2030]);
  });
  it("refuses an indexed figure when the run gave no inflation, and reads every figure as before in the run's own year", () => {
    const bare = ruleBook(ctx);
    expect(bare.inYear(2).amount("TXG-09", "threshold")).toBe(721_560);
    expect(() => bare.inYear(3).amount("TXG-09", "threshold")).toThrow(/F-119/);
  });
});

describe("F-119 in a run", () => {
  // S36's run: 2,000,000 now, 8% a year, 2% inflation, 36 months: exit in grid year 3, 2028
  const s36 = (months: number) =>
    runSecurities(
      {
        goal: { amountNow: 2_000_000, monthly: 0, months },
        market: { grossReturn: 0.08, inflation: 0.02 },
        fund: { kind: "israeli-fund", drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 },
        tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } },
        profile: { otherIncome: 600_000 },
      },
      ctx,
    );
  it("taxes the exit year's surtax above that year's threshold, and flags G-36 when a year after the freeze is read", () => {
    const r = s36(36);
    // workings S36: 3% of 600,000 + 292,128.70 − 735,991.20 = 156,137.50, 4,684.12
    expect(r.detail.surtax).toBeCloseTo(0.03 * (600_000 + (r.detail.realGain as number) - 735_991.2), 6);
    expect(r.flags.map((f) => f.code)).toContain("G-36");
    // an exit in 2027 reads the frozen figure: no flag
    expect(s36(24).flags.map((f) => f.code)).not.toContain("G-36");
  });
});
