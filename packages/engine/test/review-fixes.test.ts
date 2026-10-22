// Cases from the finance review of the release 1 engine (2026-10-23): each pins a rule the golden
// scenarios do not reach.
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import {
  exitTax,
  ruleBook,
  runBond,
  runDeposit,
  runMakam,
  runProvident,
  runSecurities,
  surtax,
  type SecuritiesInput,
} from "../src/index.ts";
import { context, loadRules, runDate } from "./golden/harness.ts";

const rules = loadRules();
const ctx = context(rules);
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);
const ids = (r: { rules: { id: string }[] }) => r.rules.map((u) => u.id);

const fund = (over: Partial<SecuritiesInput> = {}): SecuritiesInput => ({
  goal: { amountNow: 100_000, monthly: 0, months: 60 },
  market: { grossReturn: 0.06, inflation: 0.025, fxChange: 0.01 },
  fund: { kind: "tase-foreign-fund", drag: { management: 0.0007 } },
  tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 } },
  profile: {},
  ...over,
});

describe("tax years are calendar years (F-01, TXG-01)", () => {
  it("resets the kupat gemel lehashkaa ceiling on 1 January, not 12 months after the start", () => {
    const r = runProvident(
      {
        wrapper: "kupat-gemel-lehashkaa",
        goal: { amountNow: 83_641, monthly: 5_000, months: 12, contributions: "nominal", firstMonth: 10 },
        market: { grossReturn: 0.05, inflation: 0.02 },
        fees: { deposit: 0, balance: 0.008, direct: 0.001 },
        profile: {},
      },
      ctx,
    );
    expect(r.routed.map((x) => x.month)).toEqual([1, 2, 3]);
  });
});

describe("IRA hishtalmut (F-51)", () => {
  const ira = (managerFee: number, months: number) =>
    runSecurities(
      fund({
        goal: { amountNow: 100_000, monthly: 0, months },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: { kind: "israeli-fund", drag: { management: 0.008 } },
        wrapper: { kind: "ira-hishtalmut", managerFee, clockStartMonth: 0 },
      }),
      ctx,
    );

  it("is valued at the end of the lock when the horizon is earlier (B3, D16)", () => {
    const r = ira(0.003, 48);
    expect(r.exitMonth).toBe(72);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3", untilMonth: 72 });
  });

  it("caps the manager's fee at PF-06", () => {
    expect(ira(0.03, 84).fees.manager).toBeCloseTo(ira(0.02, 84).fees.manager, 6);
  });
});

it("applies the self-employed benefited amount per year, not per month (TXH-08, F-46)", () => {
  const r = runProvident(
    {
      wrapper: "keren-hishtalmut",
      goal: { amountNow: 20_000, monthly: 0, months: 84 },
      market: { grossReturn: 0.06, inflation: 0.025 },
      fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
      hishtalmut: { employment: "self-employed", clockStartMonth: 0 },
      profile: {},
    },
    ctx,
  );
  expect(r.taxAtExit).toBe(0);
  expect(r.detail.excessRealGain).toBe(0);
});

it("applies the age-60 brackets to linked interest during the holding (F-42, TXI-19)", () => {
  const r = runDeposit(
    {
      goal: { amountNow: 100_000, monthly: 0, months: 12 },
      market: { inflation: 0.03 },
      deposit: { rate: 0.02, termMonths: 12, linkage: "cpi" },
      profile: { ageAtStart: 65, otherIncome: 0 },
    },
    ctx,
  );
  const realInterest = 100_000 * 1.03 * 0.02;
  expect(r.taxDuring).toBeCloseTo(0.1 * realInterest, 6);
  expect(codes(r)).toContain("G-21");
});

describe("surtax on the year's total (F-43, TXG-09, TXG-10)", () => {
  it("adds the exit-year gain to the special income already received that year", () => {
    const book = ruleBook(ctx);
    const e = exitTax(book, { otherIncome: 700_000 }, 12, 15_000, 0.25, false, 15_000);
    expect(e.surtax).toBeCloseTo(0.03 * (700_000 + 30_000 - 721_560) - 0, 6);
  });

  it("charges the 2% only on the wrapper's own capital income above the threshold", () => {
    const s = surtax(0, 10_000, 1_000_000, { rate: 0.03, threshold: 721_560 }, { rate: 0.02, threshold: 721_560 });
    expect(s.onCapital).toBeCloseTo(200, 6);
  });
});

describe("foreign funds on TASE (TXF-04)", () => {
  it("uses the exchange rate only when the fund commits to the 90% test", () => {
    const withTest = runSecurities(fund({ fund: { kind: "tase-foreign-fund", ninetyPercentTest: true } }), ctx);
    const without = runSecurities(fund({ fund: { kind: "tase-foreign-fund", ninetyPercentTest: false } }), ctx);
    expect(ids(withTest)).toContain("TXF-04");
    expect(ids(without)).not.toContain("TXF-04");
    expect(without.detail.realGain).not.toBeCloseTo(withTest.detail.realGain!, 0);
  });
});

it("does not tax the holder on a taxable fund's distributions (TXS-11)", () => {
  const r = runSecurities(
    fund({
      market: { grossReturn: 0.04, inflation: 0.02 },
      fund: { kind: "money-market-taxable", distribution: { yield: 0.03, perYear: 12 } },
      tariff: {},
    }),
    ctx,
  );
  expect(r.taxDuring).toBe(0);
});

describe("an open rule at exit lists the wrapper with its pre-tax value (B3)", () => {
  it("securities", () => {
    const open = rules.map((r) => (r.id === "TXS-09" ? ({ ...r, strength: "open", figures: undefined } as RuleRecord) : r));
    const r = runSecurities(fund({ fund: { kind: "israeli-fund" }, market: { grossReturn: 0.06, inflation: 0.02 } }), context(open));
    expect(r.outcome).toEqual({ code: "listed-not-ranked", reason: "TXS-09" });
    expect(r.taxAtExit).toBe(0);
  });

  it("study fund with an excess, when the real base is not stated", () => {
    const noBase = rules.map((r) =>
      r.id === "TXH-11"
        ? ({ ...r, figures: { ...r.figures, real_base: { ...(r.figures!["real_base"] as object), value: false } } } as unknown as RuleRecord)
        : r,
    );
    const r = runProvident(
      {
        wrapper: "keren-hishtalmut",
        goal: { amountNow: 0, monthly: 500, months: 84, contributions: "nominal" },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
        hishtalmut: { employment: "employee", monthlySalary: 20_000, clockStartMonth: 0 },
        profile: {},
      },
      context(noBase),
    );
    expect(r.outcome).toEqual({ code: "listed-not-ranked", reason: "TXH-11" });
    expect(r.nominal).toBe(r.detail.grossBalance);
  });
});

it("tests TXI-20 against income including the interest itself", () => {
  const r = runDeposit(
    {
      goal: { amountNow: 200_000, monthly: 0, months: 12 },
      market: { inflation: 0 },
      deposit: { rate: 0.05, termMonths: 12, linkage: "unlinked" },
      profile: { annualIncome: 65_000 },
    },
    ctx,
  );
  expect(r.detail.txi20Deduction).toBeCloseTo(10_920 - (65_000 + 10_000 - 69_840), 6);
  expect(r.taxDuring).toBeCloseTo(0.15 * (10_000 - r.detail.txi20Deduction!), 6);
});

it("does not apply the age-60 rules to a kupat gemel lehashkaa exit, and flags it (F-44, TXK OQ12)", () => {
  const r = runProvident(
    {
      wrapper: "kupat-gemel-lehashkaa",
      goal: { amountNow: 50_000, monthly: 0, months: 60 },
      market: { grossReturn: 0.06, inflation: 0.025 },
      fees: { deposit: 0, balance: 0.008, direct: 0.001 },
      profile: { ageAtStart: 62, otherIncome: 0 },
    },
    ctx,
  );
  expect(ids(r)).not.toContain("TXS-23");
  expect(codes(r)).toContain("TXK-OQ12");
});

it("raises the US estate-tax flag only when the dollar value is known (TXF-27)", () => {
  const r = runSecurities(
    fund({
      goal: { amountNow: 150_000, monthly: 0, months: 12 },
      fund: { kind: "foreign-fund", domicile: "us", w8ben: true, distribution: { yield: 0.013, perYear: 4 } },
    }),
    ctx,
  );
  expect(codes(r)).not.toContain("TXF-27");
});

describe("flags the method asks for", () => {
  it("G-20 on every exit that leaves commissions out of the basis", () => {
    expect(codes(runSecurities(fund(), ctx))).toContain("G-20");
    const bond = runBond(
      {
        goal: { amountNow: 10_000, monthly: 500, months: 24 },
        market: { inflation: 0.02 },
        bond: { coupon: 0.0375, linkage: "unlinked", couponEveryMonths: 12 },
        tariff: { buy: { rate: 0.002, min: 30 } },
        profile: {},
      },
      ctx,
    );
    expect(codes(bond)).toEqual(expect.arrayContaining(["G-20", "G-10"]));
    const makam = runMakam(
      { goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { inflation: 0.02 }, makam: { yield: 0.04 }, tariff: { buy: { rate: 0.001, min: 20 } } },
      ctx,
    );
    expect(codes(makam)).toContain("G-20");
  });

  it("G-14 when a provident track has no direct expenses figure", () => {
    const r = runProvident(
      {
        wrapper: "kupat-gemel-lehashkaa",
        goal: { amountNow: 10_000, monthly: 0, months: 12 },
        market: { grossReturn: 0.05, inflation: 0.02 },
        fees: { deposit: 0, balance: 0.008, direct: 0 },
        profile: {},
      },
      ctx,
    );
    expect(codes(r)).toContain("G-14");
  });
});

it("charges no custody on money-market fund units (BRK-17, BANK-18)", () => {
  const r = runSecurities(
    fund({
      market: { grossReturn: 0.03, inflation: 0.02 },
      fund: { kind: "money-market-daily", drag: { management: 0.0018 } },
      tariff: { custody: { rate: 0.0015, min: 15, everyMonths: 3 } },
    }),
    ctx,
  );
  expect(r.fees.custody).toBe(0);
});

it("keeps the run date's tax year", () => {
  expect(ruleBook({ rules, runDate }).taxYear).toBe(2026);
});
