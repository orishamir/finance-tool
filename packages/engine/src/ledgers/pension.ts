// Pension fund (comprehensive and general) and provident fund for annuity: the deposit-side relief (F-30 to
// F-32), the provident-family ledger (F-27, F-11, F-15, F-16), the insurance cost (F-53) and the exit, which
// is blocked (F-49, G-03; F-48 is not built yet). The employer's deposits run through the same ledger as a separate
// line (F-52, B2).
import { deductionValue, grossForYear, spreadReliefByYear, type PensionRelief } from "../formulas/deposit-side.ts";
import { blockedWrapperExit, type BlockedExit } from "../formulas/blocked-exit.ts";
import { balanceFee, depositFee, feeForMonth, type Discount } from "../formulas/fees.ts";
import { insuranceCost } from "../formulas/insurance.ts";
import { annualToMonthly, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { MissingRuleError, ruleBook, type RuleBook } from "../resolver.ts";
import type { Outcome, RunContext, RunResult } from "../result.ts";
import { Tally, type Profile } from "./common.ts";

export type PensionWrapper = "pension-comprehensive" | "pension-general" | "provident-for-annuity";

/** A-12 for a pension: who the person is and what is already deposited through work (annual figures are 12 × monthly). */
export interface PensionProfile {
  employment: "employee" | "self-employed";
  /** Employee: gross monthly salary. */
  monthlySalary?: number;
  /** Self-employed: taxable business income for the year. */
  annualIncome?: number;
  /** Employee deposits already made through work, a share of salary. They use the credit cap first (TXP-02). */
  existingEmployeeRate?: number;
  /** The employer's rates on the payslip, shares of salary: pension (tagmulim) and severance (A-12). */
  employer?: { pensionRate: number; severanceRate: number };
}

export interface PensionInput {
  wrapper: PensionWrapper;
  /** `goal.monthly` and `goal.amountNow` are the person's net outlay (B1, F-30). */
  goal: Goal;
  market: { grossReturn: number; inflation: number };
  /** Fee rates as fractions: deposit fee (F-11), balance fee (F-15), direct expenses (A-18), discount (A-19). */
  fees: { deposit: number; balance: number; direct: number; discount?: Discount };
  /** A-17: the insurance cost as a share of each deposit, entered by the person (G-12). Zero for a provident fund for annuity (PEN-35). */
  insurance: { rate: number };
  pension: PensionProfile;
  /** The person opts into early withdrawal (F-48). Its rule is known (TXP-18), but the formula is not built yet, so it stays blocked. */
  earlyWithdrawal?: boolean;
  /**
   * A balance already in the fund (a holding under review, F-61): it starts the ledger as it is, with no deposit
   * fee, no deposit-side relief (F-30 to F-32) and nothing added to `paidIn`. `goal` then holds only new money.
   */
  existingBalance?: number;
  profile: Profile;
}

/** The relief of one tax year, as F-30 to F-32 gave it. */
export interface YearRelief {
  year: number;
  net: number;
  gross: number;
  formula: "F-31" | "F-32";
  beneficiary: boolean;
  credited: number;
  credit: number;
  tier1: number;
  tier2: number;
  deduction: number;
  deductionValue: number;
  relief: number;
}

/** `deposits` are the gross deposits by month (index 0 is the amount now): the net outlay plus the year's relief (F-30). */
export type PensionResult = RunResult & { exit: BlockedExit; years: YearRelief[]; deposits: number[] };

/** The employer line (F-52): shown beside the ranking, never inside it (B2). */
export type PensionEmployerLine = RunResult & { line: "only-available-here"; ranked: false; exit: BlockedExit };

const feeCaps: Record<PensionWrapper, { rule: string }> = {
  "pension-comprehensive": { rule: "PF-04" },
  "pension-general": { rule: "PF-05" },
  "provident-for-annuity": { rule: "PEN-22" },
};

/** Cites a rule that describes a blocked exit if its record exists; the IDs are returned in `exit` either way. */
function citeIfPresent(book: RuleBook, ids: readonly string[]) {
  for (const id of ids) {
    try {
      book.cite(id);
    } catch (e) {
      if (!(e instanceof MissingRuleError)) throw e;
    }
  }
}

const employerMonthly = (p: PensionProfile) =>
  p.employer ? (p.employer.pensionRate + p.employer.severanceRate) * (p.monthlySalary ?? 0) : 0;

/** Checks the person's A-12 inputs once, with the field named. */
function check(i: PensionInput) {
  const p = i.pension;
  if (p.employment === "self-employed" && p.employer) throw new RangeError("a self-employed person has no employer deposits (pension.employer)");
  if (i.wrapper === "provident-for-annuity" && i.insurance.rate > 0) throw new RangeError("a provident fund for annuity has no pooled insurance (PEN-35): insurance.rate must be 0");
  // Without new money there is nothing to relieve, so no income is needed (a holding's existing balance only).
  if (i.goal.amountNow === 0 && i.goal.monthly === 0) return;
  if (p.employment === "employee" && !(p.monthlySalary !== undefined && p.monthlySalary > 0)) throw new RangeError("pension.monthlySalary is required for an employee (A-12)");
  if (p.employment === "self-employed" && !(p.annualIncome !== undefined && p.annualIncome > 0)) throw new RangeError("pension.annualIncome is required for a self-employed person (A-12)");
}

interface LedgerOut {
  balance: number;
  insurance: number;
  series: number[];
}

/**
 * The month loop of the provident family for these wrappers (F-08 without a trade, F-27): the gross deposit,
 * less the deposit fee (F-11) and the insurance cost (F-53), is added; the balance grows at r_g; the balance
 * fee and the direct expenses are a twelfth of their annual rate on the month-end balance (F-15, F-16).
 * `gross[m]` is the deposit of month m and `outlay[m]` what the person paid for it (index 0 is the amount
 * now, which goes in with month 1).
 */
function ledger(book: RuleBook, tally: Tally, input: PensionInput, gross: readonly number[], outlay: readonly number[], months: number, I: readonly number[]): LedgerOut {
  const { fees } = input;
  const caps = feeCaps[input.wrapper].rule;
  const balanceCap = book.rate(caps, "balance_cap");
  const depositCap = book.rate(caps, "deposit_cap");
  const minDiscountMonths = 12 * book.amount("PF-13", "min_discount_years");
  const g = annualToMonthly(input.market.grossReturn);
  let balance = input.existingBalance ?? 0;
  let insurance = 0;
  const series: number[] = [];
  let discountExtended = false;
  tally.point(0, 1, balance);
  const deposit = (amount: number, paid: number) => {
    if (amount <= 0) return;
    tally.paidIn += paid;
    const fee = depositFee(fees.deposit, depositCap, amount);
    const ins = insuranceCost(input.insurance.rate, amount);
    tally.fee("deposit", fee);
    insurance += ins;
    balance += amount - fee - ins;
  };
  for (let m = 1; m <= months; m++) {
    if (m === 1) deposit(gross[0]!, outlay[0] ?? 0);
    if (m <= input.goal.months) deposit(gross[m] ?? 0, outlay[m] ?? 0);
    const { rate, extended } = feeForMonth(fees.balance, fees.discount, minDiscountMonths, m);
    discountExtended ||= extended;
    balance *= 1 + g;
    const bal = balanceFee(rate, balanceCap, balance);
    const direct = (fees.direct / 12) * balance;
    tally.fee("balance", bal);
    tally.fee("direct", direct);
    balance -= bal + direct;
    series[m] = balance;
    tally.point(m, I[m]!, balance);
  }
  if (discountExtended) tally.flag("PF-13");
  return { balance, insurance, series };
}

/** Flags every run of these wrappers carries. */
function commonFlags(book: RuleBook, tally: Tally, input: PensionInput) {
  if (input.fees.direct > 0) book.cite("PF-10");
  else tally.flag("G-14");
  if (input.wrapper === "provident-for-annuity") citeIfPresent(book, ["PEN-35"]);
  else {
    // A-17 is entered by the person; the tables are not collected (G-12).
    citeIfPresent(book, ["PEN-15"]);
    tally.flag("G-12");
  }
  book.cite("TXP-13");
}

/**
 * The pension and provident-for-annuity run, own money. F-30 turns the person's net outlay into the gross
 * deposit year by year, with the relief of F-31 (employee credit) or F-32 (beneficiary member, self-employed);
 * the ledger of F-27 with F-11, F-15, F-16 and F-53 gives the balance. The exit is an annuity whose value
 * needs conversion factors, so it is blocked (F-49, G-03), or, if the person opts into early withdrawal,
 * blocked as well (F-48, G-06): the run returns the gross balance at the horizon, the flag and the rule IDs,
 * and the wrapper is listed, not ranked (B3). `paidIn` is the person's net outlay; the gross deposits and the
 * relief are in `detail`. The monthly deposit ceiling of a comprehensive fund (PEN-08) is flagged when
 * crossed; routing the excess to the general fund (PEN-10) is not modelled.
 */
export function runPension(input: PensionInput, ctx: RunContext): PensionResult {
  check(input);
  const book = ruleBook(ctx);
  const { goal, pension: p } = input;
  const tally = new Tally();
  const first = goal.firstMonth ?? 1;
  const T = goal.months;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const formulas = ["F-08", "F-27", "F-11", "F-15", "F-16", "F-30", "F-53"];

  const brackets = book.brackets("TXG-02", "brackets");
  const employee = p.employment === "employee";
  const income = employee ? 12 * (p.monthlySalary ?? 0) : (p.annualIncome ?? 0);
  const employerMonth = employerMonthly(p);
  const insured = employee && employerMonth > 0 ? income : 0;
  const existingOwn = employee ? (p.existingEmployeeRate ?? 0) * income : 0;
  const monthsInYear = new Map<number, number>();
  for (let m = 1; m <= T; m++) monthsInYear.set(taxYearOf(m, first), (monthsInYear.get(taxYearOf(m, first)) ?? 0) + 1);

  const years: YearRelief[] = [];
  const gross = spreadReliefByYear(C, first, taxYearOf, (year, netYear) => {
    const facts: PensionRelief = { taxableIncome: income, insuredIncome: insured, existingOwn, employer: employerMonth * (monthsInYear.get(year) ?? 0), businessIncome: !employee };
    const r = grossForYear(book, facts, netYear, brackets);
    if (r.gap) tally.flag("TXP-03");
    years.push({ year, net: netYear, gross: r.gross, formula: r.relief.formula, beneficiary: r.relief.beneficiary, credited: r.relief.credited, credit: r.relief.credit, tier1: r.relief.tier1, tier2: r.relief.tier2, deduction: r.relief.deduction, deductionValue: r.relief.deductionValue, relief: r.relief.relief });
    return r.gross;
  });
  if (years.some((y) => y.formula === "F-32")) formulas.push("F-32");
  if (years.some((y) => y.formula === "F-31")) formulas.push("F-31");
  // G-13: the extra 0.5% credit (TXP-07) and the enlarged deduction from age 50 (TXP-08) are not modelled.
  if (!employee || (input.profile.ageAtStart ?? 0) >= 50) tally.flag("G-13");

  commonFlags(book, tally, input);
  const out = ledger(book, tally, input, gross, C, T, I);

  if (input.wrapper === "pension-comprehensive") {
    const ceiling = book.amount("PEN-08", "monthly_deposit_ceiling");
    for (let m = 1; m <= T; m++) if ((gross[m] ?? 0) + employerMonth > ceiling) { tally.flag("PEN-08", m); break; }
  }

  const exit = blockedWrapperExit(input.earlyWithdrawal ? "F-48" : "F-49", out.balance);
  formulas.push(exit.formula);
  if (exit.gap) tally.flag(exit.gap);
  for (const q of exit.openQuestions) tally.flag(q);
  citeIfPresent(book, exit.ruleIds);

  // PEN-26: the lawful exit is an old-age annuity from 60. The wrapper is blocked either way; when 60 is after the horizon it is also locked.
  let outcome: Outcome = { code: "listed-not-ranked", reason: exit.reason };
  if (input.profile.ageAtStart !== undefined) {
    const lawful = 12 * (book.amount("PEN-26", "early_retirement_age") - input.profile.ageAtStart);
    if (lawful > T) outcome = { code: "listed-not-ranked", reason: exit.reason, untilMonth: lawful };
  }

  const sum = (f: (y: YearRelief) => number) => years.reduce((a, y) => a + f(y), 0);
  const result = tally.result(book, {
    exitMonth: T,
    nominal: out.balance,
    index: I,
    taxAtExit: 0,
    outcome,
    formulas,
    detail: {
      grossBalance: out.balance,
      grossDeposits: gross.reduce((a, b) => a + b, 0),
      netOutlay: tally.paidIn,
      reliefTotal: sum((y) => y.relief),
      creditTotal: sum((y) => y.credit),
      deductionTotal: sum((y) => y.deduction),
      deductionValueTotal: sum((y) => y.deductionValue),
      insurance: out.insurance,
    },
  });
  return { ...result, exit, years, deposits: gross };
}

/**
 * F-52 Employer line for a pension: the employer's pension and severance deposits, `(pension rate + severance
 * rate) × salary` a month as on the payslip (A-12), run through the same ledger with the wrapper's fees and
 * insurance (F-27, F-53; the independent check charges the insurance on this money too, Q18), reported as the
 * "value at the horizon of money only available here" and never ranked (B2). The employer component above
 * `min(7.5%, rate) × min(salary, 34,423)` is the employee's work income when paid (TXP-10) and is taxed at the
 * person's brackets (TXG-02), subtracted at face value; National Insurance on it is not modelled. The exit is
 * blocked as for the own money (F-49, G-03).
 *
 * The method says the employer rates apply to wages up to the average wage (PEN-04); the independent check
 * and this function apply the payslip rates to the salary as entered, since the payslip is what the
 * employer deposits (S28's 1,875 a month is 12.5% of a 15,000 salary, above the average wage).
 */
export function employerLinePension(input: PensionInput, ctx: RunContext): PensionEmployerLine {
  check(input);
  const p = input.pension;
  if (!p.employer || p.employment !== "employee") throw new RangeError("pension.employer is required for the employer line (A-12)");
  const book = ruleBook(ctx);
  const { goal } = input;
  const first = goal.firstMonth ?? 1;
  const T = goal.months;
  const I = cpiPath(input.market.inflation, T);
  const tally = new Tally();
  const salary = p.monthlySalary ?? 0;
  const month = employerMonthly(p);
  const gross = Array.from({ length: T + 1 }, (_, m) => (m === 0 ? 0 : month));
  commonFlags(book, tally, input);
  const out = ledger(book, tally, input, gross, gross.map(() => 0), T, I);

  // TXP-10: employer component above the exempt limit. TXP-11: the severance ceiling, applied monthly as 1/12 of the yearly
  // amount (Income Tax circular 4/2019 s.2.1.1; TXP OQ5 closed 2026-10-26); a severance deposit above it is work income at
  // deposit, which this run does not tax yet, so it is flagged under the rule.
  const ceiling = book.amount("TXP-10", "employer_ceiling");
  const exemptPct = book.rate("TXP-10", "employer_exempt_pct");
  const pensionPart = p.employer.pensionRate * salary;
  const excessMonthly = Math.max(0, pensionPart - Math.min(exemptPct, p.employer.pensionRate) * Math.min(salary, ceiling));
  if (p.employer.severanceRate * salary > book.amount("TXP-11", "severance_ceiling") / 12) tally.flag("TXP-11");
  const brackets = book.brackets("TXG-02", "brackets");
  const perYear = new Map<number, number>();
  for (let m = 1; m <= T; m++) perYear.set(taxYearOf(m, first), (perYear.get(taxYearOf(m, first)) ?? 0) + excessMonthly);
  let depositTax = 0;
  for (const x of perYear.values()) depositTax += deductionValue(brackets, 12 * salary + x, x);

  const exit = blockedWrapperExit("F-49", out.balance);
  if (exit.gap) tally.flag(exit.gap);
  for (const q of exit.openQuestions) tally.flag(q);
  citeIfPresent(book, exit.ruleIds);
  const result = tally.result(book, {
    exitMonth: T,
    nominal: out.balance - depositTax,
    index: I,
    taxAtExit: 0,
    outcome: { code: "listed-not-ranked", reason: "B2" },
    formulas: ["F-08", "F-27", "F-11", "F-15", "F-16", "F-52", "F-53", "F-49"],
    detail: { grossBalance: out.balance, employerDeposits: month * T, depositTax, insurance: out.insurance },
  });
  return { ...result, line: "only-available-here", ranked: false, exit };
}
