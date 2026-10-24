// Engine invariants that need no expected value (docs/architecture.md 3.8).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import {
  BlockedError,
  FigureNotUpdatedError,
  MissingRuleError,
  runDeposit,
  runProvident,
  runSecurities,
  ruleBook,
  type SecuritiesInput,
} from "../src/index.ts";
import { context, loadRules, runDate } from "./golden/harness.ts";

const rules = loadRules();
const ctx = context(rules);

const etf = (over: Partial<SecuritiesInput> = {}): SecuritiesInput => ({
  goal: { amountNow: 20_000, monthly: 2_000, months: 60 },
  market: { grossReturn: 0.06, inflation: 0.025 },
  fund: { kind: "israeli-fund", drag: { management: 0.008 }, halfSpread: 0.0005 },
  tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } },
  profile: {},
  ...over,
});

describe("properties of the ledgers", () => {
  it("with no fees and no tax, a fund follows the gross path", () => {
    fc.assert(
      fc.property(fc.double({ min: -0.05, max: 0.15, noNaN: true }), fc.integer({ min: 1, max: 120 }), (r, months) => {
        const run = runSecurities(
          {
            goal: { amountNow: 10_000, monthly: 0, months },
            market: { grossReturn: r, inflation: 0 },
            fund: { kind: "money-market-taxable" },
            tariff: {},
            profile: {},
          },
          context(rules.map((x) => (x.id === "TXS-12" ? withFigure(x, "taxable_fund_rate", 0) : x))),
        );
        expect(run.nominal).toBeCloseTo(10_000 * Math.pow(1 + r, months / 12), 6);
      }),
      { numRuns: 50 },
    );
  });

  it("a higher fee never raises the value", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 0.02, noNaN: true }), fc.double({ min: 0, max: 0.01, noNaN: true }), (fee, extra) => {
        const low = runSecurities(etf({ fund: { kind: "israeli-fund", drag: { management: fee } } }), ctx);
        const high = runSecurities(etf({ fund: { kind: "israeli-fund", drag: { management: fee + extra } } }), ctx);
        expect(high.real).toBeLessThanOrEqual(low.real + 1e-6);
        const kgl = (balance: number) =>
          runProvident(
            {
              wrapper: "kupat-gemel-lehashkaa",
              goal: { amountNow: 20_000, monthly: 1_000, months: 60 },
              market: { grossReturn: 0.05, inflation: 0.02 },
              fees: { deposit: 0, balance, direct: 0 },
              profile: {},
            },
            ctx,
          ).real;
        expect(kgl(Math.min(fee + extra, 0.0105))).toBeLessThanOrEqual(kgl(Math.min(fee, 0.0105)) + 1e-6);
      }),
      { numRuns: 30 },
    );
  });

  it("real equals nominal when inflation is zero", () => {
    const run = runDeposit(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 36 },
        market: { inflation: 0 },
        deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" },
        profile: {},
      },
      ctx,
    );
    expect(run.real).toBe(run.nominal);
  });

  it("taxes nothing when the real gain is negative, and says so (G-07)", () => {
    const run = runSecurities(etf({ market: { grossReturn: 0, inflation: 0.05 } }), ctx);
    expect(run.taxAtExit).toBe(0);
    expect(run.flags.map((f) => f.code)).toContain("G-07");
  });
});

describe("figure resolver (D10, method §13)", () => {
  it("refuses an open rule a run needs while holding: the run is blocked", () => {
    const open = rules.map((r) => (r.id === "TXI-03" ? { ...r, strength: "open" as const, figures: undefined } : r));
    const deposit = {
      goal: { amountNow: 10_000, monthly: 0, months: 12 },
      market: { inflation: 0.02 },
      deposit: { rate: 0.03, termMonths: 1, linkage: "unlinked" as const },
      profile: {},
    };
    expect(() => runDeposit(deposit, context(open))).toThrow(BlockedError);
  });

  it("refuses a figure past its effective_to: figure not updated", () => {
    const expired = rules.map((r) => (r.id === "TXS-09" ? withFigure(r, "rate", 25, { effective_to: "2026-01-01" }) : r));
    expect(() => runSecurities(etf(), context(expired))).toThrow(FigureNotUpdatedError);
  });

  it("refuses a tax-year figure in another tax year", () => {
    expect(() => runSecurities(etf(), { rules, runDate: "2027-02-01" })).toThrow(FigureNotUpdatedError);
  });

  it("stops when a rule is missing rather than guess", () => {
    expect(() => runSecurities(etf(), context(rules.filter((r) => r.id !== "TXS-09")))).toThrow(MissingRuleError);
  });

  it("records every rule it served, and labels secondary and institution figures", () => {
    const book = ruleBook({ rules, runDate });
    book.rate("TXK-07", "rate");
    book.rate("TXK-23", "provident_rate");
    book.rate("TXS-09", "rate");
    expect(book.used().map((u) => u.id)).toEqual(["TXK-07", "TXK-23", "TXS-09"]);
    // TXS-09 is read on the Wikisource copy of the ordinance: its record became primary-mirror when the sources were extracted
    // from the rule base (2026-10-24), so its figure carries the mirror label like any other copy
    expect(book.labels()).toEqual([
      { code: "institution-source", ruleId: "TXK-07" },
      { code: "secondary-source", ruleId: "TXK-23" },
      { code: "mirror-source", ruleId: "TXS-09" },
    ]);
  });

  it("reads percentages as fractions and money as stored", () => {
    const book = ruleBook({ rules, runDate });
    expect(book.rate("TXS-09", "rate")).toBe(0.25);
    expect(book.amount("KGL-03", "ceiling")).toBe(83_641);
    expect(() => book.amount("TXF-27", "estate_threshold")).toThrow(MissingRuleError);
    expect(book.amount("TXF-27", "estate_threshold", "USD")).toBe(60_000);
  });
});

function withFigure(rule: RuleRecord, name: string, value: number, extra: Record<string, unknown> = {}): RuleRecord {
  const figures = rule.figures as Record<string, Record<string, unknown>>;
  return { ...rule, figures: { ...rule.figures, [name]: { ...figures[name], value, ...extra } } } as RuleRecord;
}
