// F-119: an amount s.120ב moves, in a later tax year (TXG-09, TXG-06). Frozen through 2027 at the 2026 figure, then grown by the CPI rise of
// each year before, the 2027 rise first; a year's rise is the run's inflation (A-02). Figures worked by hand in the comments.
import { describe, expect, it } from "vitest";
import { cpiLinkedAmount, freezeEnd, indexedAmount, yearlyMoveOf } from "../src/formulas/indexation.ts";
import { BlockedError, ruleBook } from "../src/resolver.ts";
import { fallReadings, OpenReadingError, openReadingOf, sameResult, stoppedOnQuestion } from "../src/open-readings.ts";
import { runProvident } from "../src/ledgers/provident.ts";
import { runPension } from "../src/ledgers/pension.ts";
import { runSecurities } from "../src/ledgers/securities.ts";
import { context } from "./golden/harness.ts";

const ctx = context(); // run date 2026-10-23: grid year 1 is 2026

describe("F-119 the formula", () => {
  it("reads the freeze's last year from the figure's update rule", () => {
    expect(freezeEnd("frozen 2025-2027")).toBe(2027);
    expect(freezeEnd("fixed in law")).toBeNull();
    expect(freezeEnd(undefined)).toBeNull();
    expect(yearlyMoveOf("frozen 2025-2027")).toEqual({ kind: "frozen", frozenTo: 2027 });
    expect(yearlyMoveOf("cpi-linked 1 jan")).toEqual({ kind: "cpi-linked" });
    expect(yearlyMoveOf("average-wage-linked")).toBeNull();
    expect(yearlyMoveOf("fixed in law")).toBeNull();
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
    // s.9(16ב)'s self-employed benefited deposit is one of the s.120א reliefs: 20,566 through 2027, then × 1.02 a year
    expect(book.inYear(2).amount("TXH-08", "self_employed_benefited")).toBe(20_566);
    expect(book.inYear(4).amount("TXH-08", "self_employed_benefited")).toBeCloseTo(20_566 * 1.02 ** 2, 6);
    // linked to the average wage: held at its 2026 figure (G-36)
    expect(book.inYear(9).amount("TXP-03", "threshold")).toBe(book.amount("TXP-03", "threshold"));
    expect(book.indexedYears()).toEqual([2028, 2029, 2030]);
  });
  it("refuses an indexed figure when the run gave no inflation, and reads every figure as before in the run's own year", () => {
    const bare = ruleBook(ctx);
    expect(bare.inYear(2).amount("TXG-09", "threshold")).toBe(721_560);
    expect(() => bare.inYear(3).amount("TXG-09", "threshold")).toThrow(/F-119/);
  });
});

describe("open readings at a falling CPI (method §13, TXG OQ17, KGL OQ15)", () => {
  it("lowers, holds or carries an amount over the years' rises", () => {
    const [lower, hold, carry] = fallReadings;
    // a 2% fall then a 3% rise, from 100: lower 100 × 0.98 × 1.03 = 100.94; hold 100 × 1 × 1.03 = 103; carry max(1, 0.98, 1.0094) = 100.94
    expect(lower!.amount(100, [-0.02, 0.03])).toBeCloseTo(100.94, 9);
    expect(hold!.amount(100, [-0.02, 0.03])).toBeCloseTo(103, 9);
    expect(carry!.amount(100, [-0.02, 0.03])).toBeCloseTo(100.94, 9);
    // a 2% fall then a 1% rise: carry stays at 100 (0.98 × 1.01 = 0.9898 is under the level the amount was read at)
    expect(carry!.amount(100, [-0.02, 0.01])).toBe(100);
    expect(fallReadings.map((r) => r.amount(100, [-0.01, -0.01]))).toEqual([100 * 0.99 * 0.99, 100, 100]);
  });

  it("covers every amount s.120ב freezes, and KGL-03's ceiling alone of the amounts linked every 1 January", () => {
    expect(openReadingOf({ kind: "frozen", frozenTo: 2027 }, "TXH-08")).toMatchObject({ ruleId: "TXG-09", question: "TXG OQ17" });
    expect(openReadingOf({ kind: "cpi-linked" }, "KGL-03")).toMatchObject({ ruleId: "KGL-03", question: "KGL OQ15" });
    expect(openReadingOf({ kind: "cpi-linked" }, "CS-04")).toBeNull();
  });

  it("reads an s.120ב amount after the freeze under the run's reading, and stops a run that has chosen none", () => {
    const book = (readings?: Record<string, "lower" | "hold" | "carry" | null>) => ruleBook({ ...ctx, ...(readings ? { readings } : {}) }, { inflation: -0.01 });
    // the frozen years read as before; 2028 is one move: 721,560 × 0.99 lowered, 721,560 held or carried
    expect(book().inYear(2).amount("TXG-09", "threshold")).toBe(721_560);
    expect(() => book().inYear(3).amount("TXG-09", "threshold")).toThrow(OpenReadingError);
    expect(book({ "TXG OQ17": "lower" }).inYear(3).amount("TXG-09", "threshold")).toBeCloseTo(721_560 * 0.99, 6);
    expect(book({ "TXG OQ17": "hold" }).inYear(4).amount("TXG-09", "threshold")).toBe(721_560);
    expect(book({ "TXG OQ17": "carry" }).inYear(4).amount("TXG-09", "threshold")).toBe(721_560);
    // null: the readings disagreed, and the run stops on the rule with the question kept
    try {
      book({ "TXG OQ17": null }).inYear(3).brackets("TXG-02", "brackets");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(BlockedError);
      expect(e).toMatchObject({ ruleId: "TXG-09", question: "TXG OQ17" });
    }
  });

  it("shows a run that every reading gives alike, flagged with the question", () => {
    // 100,000 in a bond for 4 years at −1%: the surtax threshold of 2029 is never reached, under any reading
    const r = runSecurities(
      { goal: { amountNow: 100_000, monthly: 0, months: 48 }, market: { grossReturn: 0.05, inflation: -0.01 }, fund: { kind: "israeli-fund", drag: {} }, tariff: {}, profile: {} },
      ctx,
    );
    expect(r.outcome).toEqual({ code: "eligible" });
    expect(r.flags.map((f) => f.code)).toContain("TXG-OQ17");
    expect(r.taxAtExit).toBeGreaterThan(0);
  });

  it("lists a run the readings split at its exit, with the rule and the question as the reason", () => {
    // 5,000,000 for 4 years at 8% and −1%, other income 700,000: the 2029 exit crosses the surtax threshold, which a fall lowers under one
    // reading and leaves under the others, so the surtax differs and the run is listed with its value before the exit tax
    const r = runSecurities(
      { goal: { amountNow: 5_000_000, monthly: 0, months: 48 }, market: { grossReturn: 0.08, inflation: -0.01 }, fund: { kind: "israeli-fund", drag: {} }, tariff: {}, profile: { otherIncome: 700_000 } },
      ctx,
    );
    expect(r.outcome).toEqual({ code: "listed-not-ranked", reason: "TXG-09", question: "TXG OQ17" });
    expect(r.taxAtExit).toBe(0);
    expect(stoppedOnQuestion(r)).toEqual({ ruleId: "TXG-09", question: "TXG OQ17" });
  });

  it("stops a kupat gemel lehashkaa whose deposits meet a ceiling the readings set apart (KGL OQ15)", () => {
    // 83,641 every January from 2026 at −1%: 2027's ceiling is 82,804.59 lowered and 83,641 held, so what is routed differs
    const kgl = (monthly: number) =>
      runProvident(
        { wrapper: "kupat-gemel-lehashkaa", goal: { amountNow: 0, monthly, months: 24, contributions: "nominal" }, market: { grossReturn: 0.05, inflation: -0.01 }, fees: { deposit: 0, balance: 0, direct: 0 }, profile: {}, depositsEvery: { months: 12, firstMonth: 1 } },
        ctx,
      );
    expect(() => kgl(83_641)).toThrow(expect.objectContaining({ ruleId: "KGL-03", question: "KGL OQ15" }));
    // 20,000 a year meets neither: the same run under every reading, flagged
    expect(kgl(20_000).flags.map((f) => f.code)).toContain("KGL-OQ15");
  });

  it("compares the readings on a run's outputs, not its working: a pension whose capping tax differs by reading but whose relief does not", () => {
    // salary 8,000, 6% of it (480 a month) for 10 years at −1%: from 2028 the brackets differ by reading, so the year's tax the credit is
    // capped at differs, but the credit stays under it in every reading, so the balances, the relief and the tax paid are the same
    const r = runPension(
      {
        wrapper: "provident-for-annuity",
        goal: { amountNow: 0, monthly: 480, months: 120, contributions: "nominal", firstMonth: 1 },
        market: { grossReturn: 0.05, inflation: -0.01 },
        fees: { deposit: 0, balance: 0, direct: 0.001 },
        insurance: { rate: 0 },
        pension: { employment: "employee", monthlySalary: 8_000, existingEmployeeRate: 0 },
        profile: {},
      },
      ctx,
    );
    expect(stoppedOnQuestion(r)).toBeNull();
    expect(r.flags.map((f) => f.code)).toContain("TXG-OQ17");
    expect(r.years.every((y) => !y.working.creditCap.binds)).toBe(true);
    expect(r.nominal).toBeGreaterThan(0);
  });

  it("keeps two runs that agree number for number, and tells apart two that do not", () => {
    expect(sameResult({ a: 1, b: [2, 3], flags: [{ code: "x" }] }, { a: 1, b: [2, 3], flags: [] })).toBe(true);
    expect(sameResult({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3.01] })).toBe(false);
    expect(sameResult({ outcome: { code: "eligible" } }, { outcome: { code: "listed-not-ranked" } })).toBe(false);
  });
});

describe("F-120 an amount linked to the CPI every 1 January", () => {
  it("grows from the year after the one read, by one year's rise each year", () => {
    expect(cpiLinkedAmount(83_641, 2026, 2026, 0.025)).toBe(83_641);
    // 2027: 83,641 × 1.025 = 85,732.025; 2029: × 1.025³ = 90,072.21
    expect(cpiLinkedAmount(83_641, 2026, 2027, 0.025)).toBeCloseTo(85_732.025, 6);
    expect(cpiLinkedAmount(83_641, 2026, 2029, 0.025)).toBeCloseTo(90_072.21, 1);
  });
  it("serves KGL-03's ceiling in a later year, and flags no G-36; at a falling CPI it is an open reading (KGL OQ15)", () => {
    const book = ruleBook(ctx, { inflation: 0.025 });
    expect(book.inYear(2).amount("KGL-03", "ceiling")).toBeCloseTo(83_641 * 1.025, 6);
    expect(book.indexedYears()).toEqual([]);
    expect(() => ruleBook(ctx, { inflation: -0.01 }).inYear(3).amount("KGL-03", "ceiling")).toThrow(OpenReadingError);
    expect(ruleBook({ ...ctx, readings: { "KGL OQ15": "lower" } }, { inflation: -0.01 }).inYear(3).amount("KGL-03", "ceiling")).toBeCloseTo(83_641 * 0.99 ** 2, 6);
    expect(ruleBook({ ...ctx, readings: { "KGL OQ15": "hold" } }, { inflation: -0.01 }).inYear(3).amount("KGL-03", "ceiling")).toBe(83_641);
  });
  it("stops a figure linked to the CPI every 1 January of a rule no open reading covers, at a falling CPI, on its rule with the method gap (G-38)", () => {
    // CS-04's monthly addition is linked every 1 January; no open question names a fall for it, and the method has no reading
    expect(ruleBook(ctx, { inflation: 0.02 }).inYear(2).amount("CS-04", "monthly_addition")).toBeCloseTo(58 * 1.02, 9);
    try {
      ruleBook(ctx, { inflation: -0.01 }).inYear(2).amount("CS-04", "monthly_addition");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(BlockedError);
      expect(e).toMatchObject({ ruleId: "CS-04", gap: "G-38" });
      expect((e as Error).message).toContain("G-38");
    }
  });
  it("lets a kupat gemel lehashkaa take the year's ceiling: a deposit of the 2027 ceiling in 2027 is all accepted", () => {
    // 85,000 a year in January of each year (2026 grid, run date 2026-10-23, month 1 = January): 2026's ceiling is 83,641, so 1,359 is
    // routed; 2027's is 85,732.03 at 2.5%, so nothing is
    const r = runProvident(
      {
        wrapper: "kupat-gemel-lehashkaa",
        goal: { amountNow: 0, monthly: 85_000, months: 24, contributions: "nominal" },
        market: { grossReturn: 0.05, inflation: 0.025 },
        fees: { deposit: 0, balance: 0, direct: 0 },
        profile: {},
        depositsEvery: { months: 12, firstMonth: 1 },
      },
      ctx,
    );
    expect(r.routed).toEqual([{ month: 1, amount: 85_000 - 83_641 }]);
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
