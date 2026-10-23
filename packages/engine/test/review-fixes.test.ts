// Cases from the finance review of the release 1 engine (2026-10-23): each pins a rule the golden
// scenarios do not reach.
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import {
  beneficiaryRelief,
  deductionValue,
  exitTax,
  rankCandidates,
  runPension,
  runPlanned,
  withoutFees,
  type Candidate,
  type PensionInput,
  type PensionRelief,
  type ProvidentInput,
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
      goal: { amountNow: 15_000, monthly: 0, months: 84 },
      market: { grossReturn: 0.06, inflation: 0.025 },
      fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
      hishtalmut: { employment: "self-employed", clockStartMonth: 0 },
      profile: { annualIncome: 200_000 },
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

// ---------------------------------------------------------------------------------------------------------
// Independent finance review, 2026-10-23, second batch.

describe("M1: a self-employed person below the beneficiary threshold gets TXP-05 limb (1), not limb (2)", () => {
  // Brackets: a flat 30% so the deduction's value is easy to check by hand. Business income of 100,000, no
  // employer deposits, deposits under the TXP-03 threshold (26,436). Eligible income E = min(100,000, 164,400)
  // = 100,000 (TXP-05, eligible_income_cap_non_work); 7% x E = 7,000; 12% x E = 12,000; the credit cap is 5% x E
  // = 5,000 (TXP-02 no-work-income limb), floor 2,268.
  const book = ruleBook(ctx);
  const flat = [{ upTo: null, rate: 0.3 }];
  const business: PensionRelief = { taxableIncome: 100_000, insuredIncome: 0, existingOwn: 0, employer: 0, businessIncome: true };
  const relief = (p: PensionRelief, gross: number) => beneficiaryRelief(book, p, gross, flat, false);

  it("under the 12% line: 7% of the income is deducted, the rest earns the 35% credit", () => {
    // Deposit 10,000: deduction min(10,000, 7,000) + min(4,000, max(0, 10,000 - 12,000)) = 7,000 (value 30% = 2,100).
    // Left 3,000: credited min(3,000, max(2,268, 5,000)) = 3,000; credit 35% = 1,050. Relief 3,150.
    const r = relief(business, 10_000);
    expect(r.beneficiary).toBe(false);
    expect(r.tier1).toBeCloseTo(7_000, 9);
    expect(r.deductionValue).toBeCloseTo(2_100, 9);
    expect(r.credited).toBeCloseTo(3_000, 9);
    expect(r.credit).toBeCloseTo(1_050, 9);
    expect(r.relief).toBeCloseTo(3_150, 9);
  });

  it("over the 12% line: 4% more is deducted on the part above it, and the credit stops at 5%", () => {
    // Deposit 14,000: deduction 7,000 + min(4,000, 14,000 - 12,000 = 2,000) = 9,000 (value 2,700).
    // Left 5,000: credited min(5,000, 5,000) = 5,000; credit 1,750. Relief 4,450.
    const r = relief(business, 14_000);
    expect(r.deduction).toBeCloseTo(9_000, 9);
    expect(r.deductionValue).toBeCloseTo(2_700, 9);
    expect(r.credited).toBeCloseTo(5_000, 9);
    expect(r.relief).toBeCloseTo(4_450, 9);
    // Deposit 20,000: deduction 7,000 + min(4,000, 8,000) = 11,000; left 9,000, credited at the 5,000 cap.
    const big = relief(business, 20_000);
    expect(big.deduction).toBeCloseTo(11_000, 9);
    expect(big.credited).toBeCloseTo(5_000, 9);
    expect(big.relief).toBeCloseTo(0.3 * 11_000 + 0.35 * 5_000, 9);
  });

  it("caps the eligible income at 164,400 (TXP-05)", () => {
    // Income 300,000: E = 164,400; 7% x E = 11,508; deposit 11,508 is deducted whole.
    const r = relief({ ...business, taxableIncome: 300_000 }, 11_508);
    expect(r.deduction).toBeCloseTo(11_508, 9);
    expect(r.relief).toBeCloseTo(0.3 * 11_508, 9);
  });

  it("leaves the work-income path unchanged: limb (2) 5% of non-insured work income, credit 7%", () => {
    // Deposit 10,000: deduction 5% x 100,000 = 5,000 (value 1,500); left 5,000, cap 7% x 100,000 = 7,000, credit
    // 35% x 5,000 = 1,750; relief 3,250 (the business path above gives 3,150).
    const work = relief({ ...business, businessIncome: false }, 10_000);
    expect(work.tier1).toBeCloseTo(5_000, 9);
    expect(work.relief).toBeCloseTo(3_250, 9);
  });

  it("the pension run marks a self-employed person's income as business income", () => {
    // One tax year of 12 deposits; the deposit of 10,000 earns the relief of the first case at the real brackets.
    const brackets = book.brackets("TXG-02", "brackets");
    const reliefOf10k = deductionValue(brackets, 100_000, 7_000) + 0.35 * 3_000;
    const input: PensionInput = {
      wrapper: "pension-comprehensive",
      goal: { amountNow: 0, monthly: (10_000 - reliefOf10k) / 12, months: 12, contributions: "nominal" },
      market: { grossReturn: 0.05, inflation: 0.02 },
      fees: { deposit: 0, balance: 0, direct: 0 },
      insurance: { rate: 0 },
      pension: { employment: "self-employed", annualIncome: 100_000 },
      profile: { ageAtStart: 30 },
    };
    const r = runPension(input, ctx);
    expect(r.years[0]!.gross).toBeCloseTo(10_000, 4);
    expect(r.years[0]!.beneficiary).toBe(false);
    expect(r.years[0]!.deduction).toBeCloseTo(7_000, 4);
    expect(r.detail.reliefTotal).toBeCloseTo(reliefOf10k, 4);
  });
});

describe("M2, R1: the deciding formula reads the run's relief; fee drag keeps the pension insurance", () => {
  const studyFund = (annualIncome: number): ProvidentInput => ({
    wrapper: "keren-hishtalmut",
    goal: { amountNow: 0, monthly: 1_000, months: 60 },
    market: { grossReturn: 0.05, inflation: 0.025 },
    fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
    hishtalmut: { employment: "self-employed", clockStartMonth: -72 },
    profile: { annualIncome },
  });
  const candidate = (id: string, input: ProvidentInput): Candidate => {
    const plan = { run: "runProvident" as const, input };
    return { id, tier: 1, kind: "ranked", reasons: [], plan, run: runPlanned(plan, ctx) };
  };

  it("names deposit-side relief when a self-employed study fund's deduction decides", () => {
    // Same fund, same fees, same net outlay; one person has income 200,000 (TXH-05 deduction, F-30), the other
    // income 0 (no deduction). The relief is the first candidate's reliefTotal, which is several thousand NIS;
    // the fee drag differs by a few hundred, and tax at exit is 0 for both (benefited money, TXH-09).
    const withRelief = candidate("with deduction", studyFund(200_000));
    const without = candidate("no deduction", studyFund(0));
    expect(withRelief.run!.detail.reliefTotal).toBeGreaterThan(5_000);
    expect(without.run!.detail.reliefTotal ?? 0).toBe(0);
    const ranking = rankCandidates([without, withRelief], { theta: 0.005, ctx });
    expect(ranking.top).toBe("with deduction");
    const d = ranking.topTwo!.deciding;
    const index = withRelief.run!.nominal / withRelief.run!.real;
    expect(d.top.depositSideRelief).toBeCloseTo(-withRelief.run!.detail.reliefTotal! / index, 6);
    expect(d.gaps["deposit-side-relief"]).toBeCloseTo(withRelief.run!.detail.reliefTotal! / index, 6);
    expect(d.formula).toBe("deposit-side-relief");
  });

  it("does not zero the pension insurance rate (A-17 is not a fee, F-61) when computing fee drag", () => {
    const input: PensionInput = {
      wrapper: "pension-comprehensive",
      goal: { amountNow: 0, monthly: 500, months: 120 },
      market: { grossReturn: 0.05, inflation: 0.02 },
      fees: { deposit: 0.01, balance: 0.0022, direct: 0.001 },
      insurance: { rate: 0.015 },
      pension: { employment: "employee", monthlySalary: 10_000 },
      profile: { ageAtStart: 30 },
    };
    const bare = withoutFees({ run: "runPension", input });
    expect(bare.run === "runPension" && bare.input.insurance).toEqual({ rate: 0.015 });
    expect(bare.run === "runPension" && bare.input.fees).toEqual({ deposit: 0, balance: 0, direct: 0 });
  });
});

describe("M3: a study fund's lock is 3 years from the first payment at retirement age (TXH-10, KH-12)", () => {
  const fundAt = (ageAtStart: number, months: number) =>
    runProvident(
      {
        wrapper: "keren-hishtalmut",
        goal: { amountNow: 10_000, monthly: 0, months },
        market: { grossReturn: 0.05, inflation: 0.025 },
        fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
        hishtalmut: { employment: "employee", monthlySalary: 12_000, clockStartMonth: 0 },
        profile: { ageAtStart },
      },
      ctx,
    );

  it("from age 62 the first lawful exit is month 60, when the person reaches 67 (PEN-26), not month 72", () => {
    // The profile has no sex, so the higher retirement age, 67 (PEN-26; also the mandatory age), is used: the
    // person reaches it at 12 x (67 - 62) = 60 months, after the 36 months of TXH-10. Exit = max(36, 60) = 60 < 72.
    const r = fundAt(62, 48);
    expect(r.exitMonth).toBe(60);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3", untilMonth: 60 });
    expect(ids(r)).toEqual(expect.arrayContaining(["TXH-10", "PEN-26"]));
    expect(r.labels).toContainEqual(expect.objectContaining({ code: "reading", ruleId: "KH-12" }));
  });

  it("from age 65 the exit is 3 years from the first payment: max(36, 12 x (67 - 65) = 24) = 36", () => {
    const r = fundAt(65, 24);
    expect(r.exitMonth).toBe(36);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3", untilMonth: 36 });
    // A horizon past month 36 is lawful at the horizon and ranks.
    expect(fundAt(65, 40).outcome).toEqual({ code: "eligible" });
  });

  it("a person who is young keeps the 6-year lock and no KH-12 reading label", () => {
    const r = fundAt(22, 48);
    expect(r.exitMonth).toBe(72);
    expect(r.labels.some((l) => l.ruleId === "KH-12")).toBe(false);
    expect(fundAt(62, 72).outcome).toEqual({ code: "eligible" });
  });
});
