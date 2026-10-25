// Golden scenarios S23 to S30 for the release 2 formulas: the employer line (F-52), early withdrawal from a
// study fund (F-47), the deposit-side relief (F-30 to F-32), the insurance cost (F-53) and the blocked exits
// (F-45, F-48, F-49). Inputs are the scenario's own; expected values are the approved independent check
// (tests/golden/scenarios.md, workings.md), tolerance P-06. Where the independent check made a modelling
// choice the method does not decide, the test follows it and says so.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  beneficiaryRelief,
  blockedWrapperExit,
  employeeCredit,
  employerLine,
  equalNetOutlay,
  insuranceCost,
  RecordInputError,
  ruleBook,
  runInputs,
  runPension,
  runPlanned,
  runProvident,
  studyFundEarlyWithdrawal,
  type PensionInput,
  type ProvidentInput,
  type RunResult,
} from "../../src/index.ts";
import { context, golden } from "./harness.ts";

const ctx = context();
const flagCodes = (r: RunResult) => r.flags.map((f) => f.code);
const labelOf = (r: RunResult, ruleId: string) => r.labels.find((l) => l.ruleId === ruleId)?.code;

// S23: keren hishtalmut, employee, salary 12,000; employer 7.5% (KH-04, entered as on the payslip).
const s23: ProvidentInput = {
  wrapper: "keren-hishtalmut",
  goal: { amountNow: 0, monthly: 300, months: 84, contributions: "nominal" },
  market: { grossReturn: 0.06, inflation: 0.025 },
  fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
  hishtalmut: { employment: "employee", monthlySalary: 12_000, clockStartMonth: 0, employerRate: 0.075 },
  profile: {},
};

describe("F-52 employer line, keren hishtalmut (S23, S25)", () => {
  it("S23 employer line: 900 a month, exempt at exit, never ranked", () => {
    const line = employerLine({ kind: "hishtalmut", input: s23 }, ctx);
    const g = golden("S23");
    g.value("employer line real", line.real, 76_643.32);
    g.value("employer line nominal", line.nominal, 91_104.83);
    g.value("tax at exit", line.taxAtExit, 0);
    g.done();
    expect(line.ranked).toBe(false);
    expect(line.line).toBe("only-available-here");
    expect(line.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B2" });
    expect(line.formulas).toContain("F-52");
  });

  it("S25 employer line: the part above the limit is taxed as salary when paid", () => {
    // Method F-52 gives the deposit as 7.5% x min(salary, 15,712); the independent check deposits 7.5% of the
    // whole salary (1,500) and taxes what is above the benefited 1,178.40, as this function does.
    const line = employerLine(
      { kind: "hishtalmut", input: { ...s23, hishtalmut: { ...s23.hishtalmut!, monthlySalary: 20_000 } } },
      ctx,
    );
    const g = golden("S25");
    g.value("gross balance", line.detail.grossBalance, 151_841.38);
    g.value("income tax on the excess at deposit", line.detail.employerDepositTax, 8_374.46);
    g.value("NI and health on the excess", line.detail.employerSocial, 3_287.65);
    g.value("tax on the excess gains at exit", line.taxAtExit, 773.87);
    g.value("employer line nominal", line.nominal, 139_405.39);
    g.done();
    expect(labelOf(line, "TXG-35")).toBe("reading");
    // 2026-10-25 scope pass: TXH-11's real base now rests on the Chief Economist paper (primary), so no institution label.
    expect(labelOf(line, "TXH-11")).toBeUndefined();
    expect(line.ranked).toBe(false);
  });

  it("refuses a self-employed person: no employer deposits", () => {
    const input = { ...s23, hishtalmut: { ...s23.hishtalmut!, employment: "self-employed" as const } };
    expect(() => employerLine({ kind: "hishtalmut", input }, ctx)).toThrow(/employee/);
  });
});

describe("F-47 early withdrawal from a study fund, opt-in (S24b)", () => {
  const early = { ...s23, goal: { ...s23.goal, months: 48 }, hishtalmut: { ...s23.hishtalmut!, earlyWithdrawal: true } };

  it("S24(b) own money: gains at 31%, 47% withheld, the difference refunded", () => {
    const r = runProvident(early, ctx);
    const g = golden("S24");
    g.value("balance at month 48", r.series[48]!.balance, 16_013.59);
    g.value("gains", r.detail.earlyGains, 1_613.59);
    g.value("tax at 31%", r.taxAtExit, 500.21);
    g.value("value", r.nominal, 15_513.38);
    g.value("real value", r.real, 14_054.35);
    g.value("withheld at 47%", r.detail.earlyWithheld, 758.39);
    g.done();
    expect(r.exitMonth).toBe(48);
    expect(r.outcome.code).toBe("eligible"); // the opt-in puts it in the ranking (B3)
    expect(flagCodes(r)).toContain("G-27");
    expect(r.detail.earlyRefund).toBeCloseTo(r.detail.earlyWithheld! - r.taxAtExit, 6);
  });

  it("S24(b) employer line: benefited deposits are work income, gains at 31%", () => {
    const line = employerLine({ kind: "hishtalmut", input: early }, ctx);
    const g = golden("S24");
    g.value("balance", line.detail.grossBalance, 48_040.77);
    g.value("tax on deposits", line.detail.earlyTaxOnEmployerDeposits, 8_640);
    g.value("tax on gains", line.detail.earlyTaxOnGains, 1_500.64);
    g.done();
    expect(line.ranked).toBe(false);
  });

  it("without the opt-in the run is still listed with its value at the first lawful exit (S24a)", () => {
    const r = runProvident({ ...early, hishtalmut: { ...early.hishtalmut, earlyWithdrawal: false } }, ctx);
    expect(r.exitMonth).toBe(72);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3" });
  });

  it("when the refund is not claimed (A-14 off) the withholding is the final tax", () => {
    const r = runProvident({ ...early, profile: { refundClaimed: false } }, ctx);
    expect(r.taxAtExit).toBeCloseTo(r.detail.earlyWithheld!, 6);
    expect(r.detail.earlyRefund).toBeCloseTo(0, 6);
  });

  it("the formula alone: 60 or over uses the personal-effort brackets (TXG-04), not TXG-03's 31%", () => {
    const book = ruleBook(ctx);
    const workBrackets = book.brackets("TXG-02", "brackets");
    const base = { gains: 10_000, employerDeposits: 0, otherIncome: 50_000, refundClaimed: true, workBrackets };
    const under = studyFundEarlyWithdrawal(book, { ...base, sixtyOrOver: false });
    const over = studyFundEarlyWithdrawal(book, { ...base, sixtyOrOver: true });
    expect(under.taxOnGains).toBeCloseTo(0.31 * 10_000, 6);
    expect(over.taxOnGains).toBeCloseTo(0.1 * 10_000, 6); // 50,000 to 60,000 is inside the 10% band
  });
});

describe("F-30 self-employed study fund with a deduction (S26)", () => {
  it("S26 deposit 20,566 a year in December costs 18,766; locked until month 84", () => {
    const r = runProvident(
      {
        wrapper: "keren-hishtalmut",
        goal: { amountNow: 0, monthly: 18_766, months: 72, contributions: "nominal" },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
        hishtalmut: { employment: "self-employed", clockStartMonth: 12 },
        depositsEvery: { months: 12, firstMonth: 12 },
        profile: { annualIncome: 200_000 },
      },
      ctx,
    );
    const g = golden("S26");
    g.value("deduction a year", r.detail.deductionCap, 9_000);
    g.value("net outlay a year", r.paidIn / 6, 18_766);
    g.value("balance at the horizon", r.series[72]!.balance, 141_371.97);
    g.value("real at the horizon", r.series[72]!.balance / r.series[72]!.index, 121_904.61);
    g.value("value at month 84", r.nominal, 148_793.78);
    g.value("real at month 84", r.real, 125_175.03);
    g.done();
    expect(r.detail.reliefTotal).toBeCloseTo(6 * 1_800, 6); // 1,800 saved on each of 6 deposits
    expect(r.exitMonth).toBe(84);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3", untilMonth: 84 });
    expect(r.formulas).toContain("F-30");
  });

  it("a self-employed run without the person's income is a missing input, not a rule flag (R2, review 2026-10-23)", () => {
    const run = () =>
      runProvident(
        {
          wrapper: "keren-hishtalmut",
          goal: { amountNow: 0, monthly: 18_766, months: 72, contributions: "nominal" },
          market: { grossReturn: 0.06, inflation: 0.025 },
          fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
          hishtalmut: { employment: "self-employed", clockStartMonth: 12 },
          depositsEvery: { months: 12, firstMonth: 12 },
          profile: {},
        },
        ctx,
      );
    expect(run).toThrow(RecordInputError);
    expect(run).toThrow(/profile\.annualIncome is missing/);
  });
});

describe("F-30 equal net outlay", () => {
  it("finds the gross deposit whose net cost is the outlay, across a kink", () => {
    const benefit = (d: number) => 0.35 * Math.min(d, 948) + 0.1 * Math.max(0, Math.min(d, 5_000) - 948);
    for (const net of [100, 616.2, 1_000, 3_000, 9_999]) {
      const d = equalNetOutlay(net, benefit);
      expect(d - benefit(d)).toBeCloseTo(net, 6);
    }
    expect(equalNetOutlay(0, benefit)).toBe(0);
  });
});

// S27: pension deposit by an employee; salary 10,000, existing employee 6%, employer 6.5% + 6% severance, all in
// the selected fund at 0.22% of balance and 1% of deposits (PEN-23); insurance 1.5% of deposits (A-17, entered).
const s27: PensionInput = {
  wrapper: "pension-comprehensive",
  goal: { amountNow: 0, monthly: 300, months: 360 },
  market: { grossReturn: 0.05, inflation: 0.02 },
  fees: { deposit: 0.01, balance: 0.0022, direct: 0 },
  insurance: { rate: 0.015 },
  pension: { employment: "employee", monthlySalary: 10_000, existingEmployeeRate: 0.06, employer: { pensionRate: 0.065, severanceRate: 0.06 } },
  profile: { ageAtStart: 30 },
};

describe("F-31, F-32, F-53, F-49 pension (S27, S28, S29)", () => {
  it("S27 gross deposit 300 x I_m + 27.65; gross balance at 60; exit blocked (G-03)", () => {
    const r = runPension(s27, ctx);
    const g = golden("S27");
    g.value("credit a year", r.years[0]!.credit, 331.8);
    g.value("month-1 gross deposit", r.deposits[1], 328.15);
    g.value("gross balance nominal", r.nominal, 314_795.14);
    g.value("gross balance real", r.real, 173_789.23);
    g.value("deposit fees", r.fees.deposit, 1_575.76);
    g.value("insurance", r.detail.insurance, 2_363.65);
    g.value("balance fees", r.fees.balance, 7_626.14);
    g.done();
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-03" });
    expect(r.exit).toMatchObject({ formula: "F-49", blocked: true, gap: "G-03" });
    expect(r.exit.grossBalance).toBeCloseTo(r.nominal, 6);
    expect(r.exit.ruleIds).toEqual(expect.arrayContaining(["TXP-14", "TXP-15", "PEN-27"]));
    expect(r.taxAtExit).toBe(0);
    expect(flagCodes(r)).toEqual(expect.arrayContaining(["G-03", "G-12"]));
    // 2026-10-25 scope pass: PEN-15 now rests on the CMA standard pension bylaw and the Codex, not on one fund's bylaws, so no institution label.
    expect(labelOf(r, "PEN-15")).toBeUndefined();
    // Year 1 is an employee below the 16% test (F-31); year 5 crosses it (F-32) with no effect on the relief,
    // as the independent check finds: all salary is insured income, so the s.45A(e) cap is the same.
    expect(r.years[0]!.formula).toBe("F-31");
    expect(r.years.findIndex((y) => y.formula === "F-32")).toBe(4);
    expect(r.years[4]!.relief).toBeCloseTo(r.years[0]!.credit, 6);
  });

  it("S27 employer line: 1,250 a month, the same fees and insurance (Q18), never ranked", () => {
    const line = employerLine({ kind: "pension", input: s27 }, ctx);
    const g = golden("S27");
    g.value("employer line nominal", line.nominal, 957_985.61);
    g.value("employer line real", line.real, 528_875.97);
    g.done();
    expect(line.ranked).toBe(false);
    expect(line.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B2" });
    expect(flagCodes(line)).toContain("G-03");
  });

  const s28: PensionInput = {
    ...s27,
    goal: { amountNow: 0, monthly: 1_000, months: 120 },
    pension: { employment: "employee", monthlySalary: 15_000, existingEmployeeRate: 0.06, employer: { pensionRate: 0.065, severanceRate: 0.06 } },
  };

  it("S28 existing deposits already use the credit cap: no credit on the extra money", () => {
    const r = runPension(s28, ctx);
    const g = golden("S28");
    g.value("gross balance nominal", r.nominal, 164_004.04);
    g.value("gross balance real", r.real, 134_540.44);
    g.value("deposit fees", r.fees.deposit, 1_328.16);
    g.value("insurance", r.detail.insurance, 1_992.24);
    g.value("balance fees", r.fees.balance, 1_632.98);
    g.done();
    expect(r.detail.reliefTotal).toBeCloseTo(0, 8);
    expect(r.deposits[5]).toBeCloseTo(r.paidIn / 120 / 1, -3); // gross is net: 1,000 x I_m
    // Listed, locked until 60 (month 360), blocked.
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-03", untilMonth: 360 });
    const line = employerLine({ kind: "pension", input: s28 }, ctx);
    const gl = golden("S28");
    gl.value("employer line nominal", line.nominal, 279_975.19);
    gl.value("employer line real", line.real, 229_677.17);
    gl.done();
  });

  it("S29 beneficiary member, self-employed: deduction in two tiers worth 5,510.40, credit 4,074", () => {
    const net = 30_415.6 / 12; // 40,000 deposited costs 30,415.60 net
    const r = runPension(
      {
        ...s27,
        goal: { amountNow: 0, monthly: net, months: 240, contributions: "nominal" },
        pension: { employment: "self-employed", annualIncome: 240_000 },
        profile: {},
      },
      ctx,
    );
    const y = r.years[0]!;
    const g = golden("S29");
    g.value("gross deposit a year", y.gross, 40_000);
    g.value("net outlay a year", y.net, 30_415.6);
    g.value("first tier", y.tier1, 12_804);
    g.value("second tier", y.tier2, 8_148);
    g.value("deduction", y.deduction, 20_952);
    g.value("deduction value", y.deductionValue, 5_510.4);
    g.value("credited", y.credited, 11_640);
    g.value("credit", y.credit, 4_074);
    g.value("total relief", y.relief, 9_584.4);
    g.value("gross balance nominal", r.nominal, 1_290_845.92);
    g.value("gross balance real", r.real, 868_702.3);
    g.done();
    expect(y.beneficiary).toBe(true);
    expect(y.formula).toBe("F-32");
    expect(flagCodes(r)).toContain("G-13"); // the 0.5% credit and the age-50 enlargement are not modelled
  });

  it("S29 the formula alone: relief for a given gross deposit, then the outlay that buys it", () => {
    const book = ruleBook(ctx);
    const brackets = book.brackets("TXG-02", "brackets");
    const facts = { taxableIncome: 240_000, insuredIncome: 0, existingOwn: 0, employer: 0 };
    const rel = beneficiaryRelief(book, facts, 40_000, brackets);
    expect(rel.relief).toBeCloseTo(9_584.4, 6);
    expect(equalNetOutlay(30_415.6, (d) => beneficiaryRelief(book, facts, d, brackets, true).relief)).toBeCloseTo(40_000, 6);
  });

  it("not a beneficiary member, self-employed (TXP-05), worked by hand from the rule text", () => {
    // Income 100,000, deposit 10,000, below the 26,436 test: deduction 5% x 100,000 = 5,000 saves
    // 5,000 x 14% = 700 (the 14% band is 84,120 to 120,720); the other 5,000 is under the credit cap of
    // 7% x 100,000 = 7,000, so the credit is 35% x 5,000 = 1,750.
    const book = ruleBook(ctx);
    const brackets = book.brackets("TXG-02", "brackets");
    const rel = beneficiaryRelief(book, { taxableIncome: 100_000, insuredIncome: 0, existingOwn: 0, employer: 0 }, 10_000, brackets);
    expect(rel.beneficiary).toBe(false);
    expect(rel.deduction).toBeCloseTo(5_000, 8);
    expect(rel.deductionValue).toBeCloseTo(700, 8);
    expect(rel.credit).toBeCloseTo(1_750, 8);
  });

  it("F-31 credit floor: money paid below the floor is credited only as paid", () => {
    const book = ruleBook(ctx);
    const facts = { taxableIncome: 20_000, insuredIncome: 20_000, existingOwn: 0, employer: 0 };
    // cap 7% x 20,000 = 1,400, floor 2,268: a deposit of 1,000 is credited 1,000, not the floor.
    expect(employeeCredit(book, facts, 1_000).credited).toBeCloseTo(1_000, 8);
    expect(employeeCredit(book, facts, 5_000).credited).toBeCloseTo(2_268, 8);
  });

  it("F-53: insurance is a share of each deposit; a provident fund for annuity charges none (PEN-35)", () => {
    expect(insuranceCost(0.015, 328.15)).toBeCloseTo(4.92225, 8);
    expect(() => runPension({ ...s27, wrapper: "provident-for-annuity" }, ctx)).toThrow(/PEN-35/);
  });

  it("the pension needs the person's salary or income (A-12)", () => {
    expect(() => runPension({ ...s27, pension: { employment: "employee" } }, ctx)).toThrow(/monthlySalary/);
    expect(() => runPension({ ...s27, pension: { employment: "self-employed" } }, ctx)).toThrow(/annualIncome/);
  });
});

describe("S30 provident fund for annuity, same money as S27", () => {
  const s30: PensionInput = {
    ...s27,
    wrapper: "provident-for-annuity",
    fees: { deposit: 0, balance: 0.005, direct: 0 },
    insurance: { rate: 0 },
  };

  it("same gross deposit, 0.5% balance fee, no deposit fee, no insurance, exit blocked (G-03)", () => {
    const r = runPension(s30, ctx);
    const g = golden("S30");
    g.value("gross balance nominal", r.nominal, 307_835.2);
    g.value("gross balance real", r.real, 169_946.85);
    g.value("balance fees", r.fees.balance, 17_195.57);
    g.value("deposit fees", r.fees.deposit, 0);
    g.value("insurance", r.detail.insurance, 0);
    g.done();
    expect(r.deposits[1]).toBeCloseTo(328.15, 2); // the same gross deposit as S27
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-03" });
    expect(flagCodes(r)).not.toContain("G-12");
    const line = employerLine({ kind: "pension", input: s30 }, ctx);
    const gl = golden("S30");
    gl.value("employer line nominal", line.nominal, 933_375.45);
    gl.value("employer line real", line.real, 515_289.41);
    gl.done();
  });
});

describe("F-45, F-48, F-49 blocked exits (G-03, G-06)", () => {
  it("return the gross balance, the gap and the rules, never a value after tax", () => {
    expect(blockedWrapperExit("F-45", 1_000)).toMatchObject({ blocked: true, gap: "G-03", grossBalance: 1_000 });
    expect(blockedWrapperExit("F-48", 1_000)).toMatchObject({ blocked: true, gap: "G-06", openQuestions: ["TXP-OQ3"] });
    expect(blockedWrapperExit("F-49", 1_000).ruleIds).toContain("TXP-14");
  });

  it("an opt-in to early withdrawal from a pension stays blocked (F-48, G-06)", () => {
    const r = runPension({ ...s27, goal: { ...s27.goal, months: 120 }, earlyWithdrawal: true }, ctx);
    expect(r.exit).toMatchObject({ formula: "F-48", gap: "G-06" });
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-06" });
    expect(flagCodes(r)).toContain("G-06");
  });
});

describe("a pension wrapper record and P-05 make a run (method 2.4)", () => {
  const read = (dir: string) =>
    readdirSync(new URL(dir, import.meta.url))
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(new URL(`${dir}${f}`, import.meta.url), "utf8")) as Record<string, unknown>);
  const parameters = read("../../../../data/parameters/");
  const wrappers = read("../../../../data/instruments/wrappers/");
  const record = (id: string) => wrappers.find((w) => w.id === id)!;
  const terms = { fees: s27.fees, pension: s27.pension, insurance: s27.insurance };

  it("pension-comprehensive runs the pension ledger with the person's net outlay", () => {
    const plan = runInputs(record("pension-comprehensive"), parameters, terms, { profile: { ageAtStart: 30 } });
    expect(plan.run).toBe("runPension");
    const r = runPlanned(plan, ctx);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-03" });
    expect(r.fees.deposit).toBeGreaterThan(0);
  });

  it("a provident fund for annuity takes no insurance; a pension fund needs it", () => {
    expect(() => runInputs(record("provident-for-annuity"), parameters, terms)).toThrow(RecordInputError);
    expect(() => runInputs(record("pension-general"), parameters, { fees: terms.fees, pension: terms.pension })).toThrow(/insurance/);
    const plan = runInputs(record("provident-for-annuity"), parameters, { fees: { ...s27.fees, deposit: 0 }, pension: terms.pension });
    expect(runPlanned(plan, ctx).fees.deposit).toBe(0);
  });
});
