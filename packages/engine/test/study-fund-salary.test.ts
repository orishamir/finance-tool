// F-96: a salary that rises with prices moves the benefited limit, and the ceiling of the determining salary is held at today's amount (TXH-02).
import { describe, expect, it } from "vitest";
import { moneyStory, RecordInputError, runProvident, type ProvidentInput } from "../src/index.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const plan = (salary: number, monthly: number, follows: boolean, money?: "employer"): ProvidentInput => ({
  wrapper: "keren-hishtalmut",
  goal: { amountNow: 0, monthly, months: 84 },
  market: { grossReturn: 0.06, inflation: 0.02 },
  fees: { deposit: 0, balance: 0.006, direct: 0 },
  hishtalmut: { employment: "employee", monthlySalary: salary, clockStartMonth: 0, ...(follows ? { salaryFollowsPrices: true } : {}), ...(money ? { money } : {}) },
  profile: {},
});

describe("salaryFollowsPrices (F-96)", () => {
  it("keeps a deposit at the limit exempt while the salary is under the ceiling", () => {
    expect(runProvident(plan(12_000, 300, false), ctx).taxAtExit).toBeGreaterThan(0);
    expect(runProvident(plan(12_000, 300, true), ctx).taxAtExit).toBeCloseTo(0, 6);
    const employer = runProvident(plan(12_000, 900, true, "employer"), ctx);
    expect(employer.taxAtExit).toBeCloseTo(0, 6);
    expect(employer.detail.employerDepositTax).toBeCloseTo(0, 6);
  });
  it("keeps the ceiling where it is: a salary at it crosses it as prices rise", () => {
    const atCap = runProvident(plan(15_712, 392.8, true), ctx);
    expect(atCap.taxAtExit).toBeGreaterThan(0);
    expect(atCap.taxAtExit).toBe(runProvident(plan(15_712, 392.8, false), ctx).taxAtExit);
  });
  it("still taxes a deposit above the limit, less than a limit that stands at today's salary", () => {
    const over = runProvident(plan(12_000, 840, true), ctx).taxAtExit;
    expect(over).toBeGreaterThan(0);
    expect(over).toBeLessThan(runProvident(plan(12_000, 840, false), ctx).taxAtExit);
  });
  it("changes nothing without the option, and passes through a self-employed run", () => {
    const self = (follows: boolean): ProvidentInput => ({ ...plan(0, 500, follows), hishtalmut: { employment: "self-employed", clockStartMonth: 0, ...(follows ? { salaryFollowsPrices: true } : {}) }, profile: { annualIncome: 144_000 } });
    const on = runProvident(self(true), ctx);
    expect(on.real).toBe(runProvident(self(false), ctx).real);
    expect(on.detail.reliefToday).toBeGreaterThan(0);
    expect(on.detail.reliefToday).toBeLessThan(on.detail.reliefTotal!);
  });
  it("refuses what it cannot limit: a split of the deposit, and flat deposits", () => {
    const p = plan(12_000, 1_200, true);
    expect(() => runProvident({ ...p, hishtalmut: { ...p.hishtalmut!, employerMonthly: 900 } }, ctx)).toThrow(RecordInputError);
    expect(() => runProvident({ ...p, goal: { ...p.goal, contributions: "nominal" } }, ctx)).toThrow(RecordInputError);
  });
});

describe("moneyStory (F-96)", () => {
  const over = runProvident(plan(20_000, 1_500, true, "employer"), ctx);
  const paid = over.detail.employerDepositTax! + over.detail.employerSocial!;
  const lastIndex = over.series[over.series.length - 1]!.index;
  it("counts what the employer's excess cost at the index of its own months", () => {
    expect(paid).toBeGreaterThan(0);
    expect(over.detail.employerPaidToday).toBeGreaterThan(paid / lastIndex);
    expect(over.detail.employerPaidToday).toBeLessThan(paid);
    const s = moneyStory(70_000, 0, [over]);
    expect(s.tax).toBeCloseTo(over.detail.employerPaidToday! + over.taxAtExit / lastIndex, 6); // the gains on the excess are taxed at exit (TXH-11)
    expect(s.net).toBeLessThan(over.real);
  });
  it("adds up, and its gain is the balance over the last index less what went in", () => {
    const s = moneyStory(70_000, 5_000, [over]);
    expect(s.own + s.extra + s.gain - s.tax).toBeCloseTo(s.net, 6);
    expect(s.gain).toBeCloseTo(over.detail.grossBalance! / lastIndex - 75_000, 6);
  });
  it("leaves a run under the limits as the engine has it", () => {
    const r = runProvident(plan(12_000, 300, true), ctx);
    const s = moneyStory(25_000, 0, [r]);
    expect(s.net).toBeCloseTo(r.real, 6);
    expect(s.tax).toBeCloseTo(0, 6);
  });
});
