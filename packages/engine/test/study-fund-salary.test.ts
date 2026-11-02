// F-96: a salary that rises with prices moves the benefited limit, and the ceiling of the determining salary is held at today's amount (TXH-02).
import { describe, expect, it } from "vitest";
import { earlySettlement, limitStanding, moneyStory, RecordInputError, runProvident, type ProvidentInput } from "../src/index.ts";
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
    expect(s.taxFromSalary).toBeCloseTo(over.detail.employerPaidToday!, 6);
    expect(s.tax - s.taxFromSalary).toBeCloseTo(over.taxAtExit / lastIndex, 6);
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
    expect(s.taxFromSalary).toBe(0);
  });
});

describe("limitStanding (F-97)", () => {
  const months = (salary: number, monthly: number, money?: "employer", n = 144) => ({ ...plan(salary, monthly, true, money), goal: { amountNow: 0, monthly, months: n } });
  it("gives today's amounts above the limit, by the rule's share of the ceiling", () => {
    const s = limitStanding([runProvident(months(18_000, 450), ctx), runProvident(months(18_000, 1_350, "employer"), ctx)]);
    expect(s.per).toBe("month");
    expect(s.over[0]).toBeCloseTo(450 - 0.025 * 15_712, 6);
    expect(s.over[1]).toBeCloseTo(1_350 - 0.075 * 15_712, 6);
    expect(s.room).toEqual([0, 0]);
    expect(s.firstOverYear).toBe(1);
  });
  it("finds the year the deposits pass a ceiling that does not move: 14,000 at 2% in the sixth year", () => {
    const s = limitStanding([runProvident(months(14_000, 350), ctx), runProvident(months(14_000, 1_050, "employer"), ctx)]);
    expect(s.over).toEqual([0, 0]);
    // 14,000 × 1.02^(m/12) passes 15,712 at month 70
    expect(s.firstOverYear).toBe(6);
  });
  it("gives the room left when the deposits are under the share, and no year inside the runs when none passes", () => {
    const s = limitStanding([runProvident(months(12_000, 300), ctx), runProvident(months(12_000, 600, "employer"), ctx)]);
    expect(s.room[0]).toBeCloseTo(0, 6);
    expect(s.room[1]).toBeCloseTo(300, 6); // the employer's room: the own deposit at its share has none
    expect(s.firstOverYear).toBeNull();
  });
  it("measures a self-employed person's first year against the yearly amount", () => {
    const self = (monthly: number): ProvidentInput => ({ ...plan(0, monthly, false), goal: { amountNow: 0, monthly, months: 144 }, hishtalmut: { employment: "self-employed", clockStartMonth: 0 }, profile: { annualIncome: 300_000 } });
    const under = limitStanding([runProvident(self(500), ctx)]);
    expect(under.per).toBe("year");
    expect(under.over[0]).toBe(0);
    expect(under.room[0]).toBeGreaterThan(0);
    const over = limitStanding([runProvident(self(3_000), ctx)]);
    expect(over.over[0]).toBeGreaterThan(0);
    expect(over.room).toEqual([0]);
    expect(over.firstOverYear).toBe(1);
  });
});

describe("earlySettlement (F-98)", () => {
  const early = (monthly: number, money?: "employer") => {
    const p = plan(12_000, monthly, true, money);
    return { ...p, goal: { amountNow: 0, monthly, months: 60 }, hishtalmut: { ...p.hishtalmut!, earlyWithdrawal: true } };
  };
  it("withholds the rule's rate on the gains and the employer's benefited deposits, and leaves the own deposits out", () => {
    const own = runProvident(early(300), ctx);
    const emp = runProvident(early(900, "employer"), ctx);
    const index = own.series[own.series.length - 1]!.index;
    const s = earlySettlement([own, emp])!;
    expect(s.withheld).toBeCloseTo((0.47 * (own.detail.earlyGains! + emp.detail.earlyGains! + emp.detail.earlyEmployerDeposits!)) / index, 6);
    expect(own.detail.earlyEmployerDeposits).toBe(0);
  });
  it("gives back what the withheld exceeds the tax by, so the tax is the withheld less the back", () => {
    const runs = [runProvident(early(300), ctx), runProvident(early(900, "employer"), ctx)];
    const s = earlySettlement(runs)!;
    const index = runs[0]!.series[runs[0]!.series.length - 1]!.index;
    expect(s.back).toBeGreaterThan(0);
    expect(s.withheld - s.back).toBeCloseTo(runs.reduce((a, r) => a + r.taxAtExit / index, 0), 6);
  });
  it("has nothing to say after the lock", () => {
    expect(earlySettlement([runProvident({ ...plan(12_000, 300, true), goal: { amountNow: 0, monthly: 300, months: 84 } }, ctx)])).toBeNull();
  });
});
