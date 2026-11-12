// Bank deposits, savings plans and the current account: F-21, F-22, F-26, F-41.
import { depositInterest, lowIncomeDeduction } from "../formulas/holding-tax.ts";
import { closesTaxYear, contributions, cpiPath, type Goal } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";
import { maxRateTax, Tally, yearlySurtax, type Profile } from "./common.ts";

export interface DepositInput {
  goal: Goal;
  market: { inflation: number };
  deposit: {
    /** F-21 deposit (default), F-22 savings plan, or F-26 current-account credit balance. */
    kind?: "deposit" | "savings-plan" | "current-account";
    /** Effective annual rate (A-21, A-25 or A-26); for a CPI-linked deposit, the real rate. */
    rate: number;
    /** A-15 term in months; 1 for a current account. */
    termMonths: number;
    /** A-16: unlinked, CPI-linked, or prime-linked (taxed as unlinked, TXI-04). */
    linkage: "unlinked" | "cpi" | "prime";
    /**
     * F-26: the largest balance of a current account that earns the rate (the record's `amount_range.max`,
     * BANK-09); interest is on min(balance, ceiling). Read for a current account only; a deposit's amount range is a
     * condition of the offer, not a cap on what the ladder holds.
     */
    balanceCeiling?: number;
    /**
     * F-41: a piece's age in months at its first exit point (the record's `exit_points.first_after_months`, BANK-14, BANK-27).
     * Absent when the deposit has no exit points or the record does not say when the first one falls: the run then knows no
     * exit point, whatever the interval. Read only on the last month, to choose between the flags G-16 and G-34; it changes
     * no amount. Anything but a positive whole number is taken as absent.
     */
    exitFirstMonth?: number;
    /**
     * F-41: the interval between exit points in months, after the first (the record's `exit_points.every_months`). Without
     * it the first exit point is the only one the run knows. Read only with `exitFirstMonth`; anything but a positive whole
     * number is taken as absent.
     */
    exitEveryMonths?: number;
  };
  profile: Profile;
}

interface OpenDeposit {
  principal: number;
  /** Index the linkage is measured from. */
  baseIndex: number;
  /** First month the deposit earns. */
  startMonth: number;
}

/** A count of months the run can use: a positive whole number, or nothing. */
const wholeMonths = (x: number | undefined): number | undefined => (x !== undefined && Number.isInteger(x) && x > 0 ? x : undefined);

/**
 * F-41: whether an age in months falls on an exit point: the first one, or one a whole number of intervals after it. With no
 * first there is none; with no interval the first is the only one.
 */
function onExitPoint(age: number, first: number | undefined, every: number | undefined): boolean {
  if (first === undefined || age < first) return false;
  return age === first || (every !== undefined && (age - first) % every === 0);
}

/**
 * F-41: whether a piece that began on `startMonth` is at one of its exit points on month `m`. Its own age is `m − startMonth + 1`,
 * the months it has earned with its first month included. A deposit's exit points count from the deposit's own start. A savings
 * plan's may count from the plan's start (one bank's plans are read so, BPN-10) or from each instalment's, and the record does not
 * say which, so a plan's piece is at an exit point only when both counts agree: its own age, and its age counted from the start of
 * the plan it was paid into. The run opens a plan on its first month and a new one every `termMonths` months, so that plan began
 * on month `startMonth − ((startMonth − 1) mod termMonths)`, and it stays the piece's plan however long the piece runs on: an
 * instalment paid in month 8 of a twelve-month plan is counted on month 17 as in that plan's seventeenth month, not as in the
 * fifth month of the plan opened on month 13.
 */
export function pieceAtExitPoint(m: number, startMonth: number, deposit: Pick<DepositInput["deposit"], "kind" | "termMonths" | "exitFirstMonth" | "exitEveryMonths">): boolean {
  const first = wholeMonths(deposit.exitFirstMonth);
  const every = wholeMonths(deposit.exitEveryMonths);
  const age = m - startMonth + 1;
  if (!onExitPoint(age, first, every)) return false;
  return deposit.kind !== "savings-plan" || onExitPoint(age + ((startMonth - 1) % deposit.termMonths), first, every);
}

/**
 * F-21 Bank deposit, laddered (F-22 savings plan, F-26 current account, F-41 exit). Each contribution
 * opens its own deposit of term n; at maturity the interest is taxed and principal plus net interest rolls
 * into a new deposit. At T the open deposits are treated as matured on the exit day.
 * F-22 Savings plan: the same ladder with the plan's own rate and term (TXI-07, BANK-28).
 * F-41 Deposits at exit: tax was charged at each maturity; the last open deposit matures on the exit day. A run that holds
 * a piece still inside its term that day raises G-16 (the break is not priced), or G-34 in its place when the piece is at one
 * of its exit points (what an exit point pays is not in the records). Neither flag changes an amount.
 */
export function runDeposit(input: DepositInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx);
  const { goal, deposit, profile } = input;
  const T = goal.months;
  const first = goal.firstMonth ?? 1;
  const n = deposit.termMonths;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const linked = deposit.linkage === "cpi";
  const isCurrentAccount = deposit.kind === "current-account";
  const tally = new Tally();

  // The bank withholds at maturity (TXI-07, TXI-08): 25% of the real interest on a fully linked deposit with
  // linkage exempt (TXI-02, TXI-05), 15% on everything else (TXI-03).
  let rate: number;
  if (linked) {
    rate = book.rate("TXI-02", "rate");
    book.cite("TXI-05");
    book.cite("TXI-25");
    book.cite("BANK-26");
  } else {
    rate = book.rate("TXI-03", "rate");
    // a prime-linked deposit is unlinked: the statutory index is the CPI or an exchange rate (TXI-04, a statement, not a reading)
    if (deposit.linkage === "prime") book.cite("TXI-04");
  }

  // TXI-20 applies to deposit and savings-plan interest when the income is known; whether it reaches
  // current-account interest is open (TXI OQ11), so it is not applied there. The bank withholds in full
  // and the deduction, like the age-60 brackets on linked interest (F-42, TXI-19), is settled once a year
  // through the return (TXI-20, A-14); the income tested includes the interest itself.
  const applyTxi20 = !isCurrentAccount && profile.annualIncome !== undefined;
  const refundClaimed = profile.refundClaimed !== false;
  let deductionUsed = 0;
  let totalInterest = 0;
  let yearTaxable = 0;
  let yearIncome = 0;
  let yearWithheld = 0;

  let open: OpenDeposit[] = [];
  let finalValue = 0;
  tally.point(0, 1, 0);

  for (let m = 1; m <= T; m++) {
    if (m === 1 && C[0]! > 0) open.push({ principal: C[0]!, baseIndex: I[0]!, startMonth: 1 });
    if (C[m]! > 0) open.push({ principal: C[m]!, baseIndex: I[m]!, startMonth: m });
    tally.paidIn += (m === 1 ? C[0]! : 0) + C[m]!;

    const due = open.filter((d) => d.startMonth + n - 1 === m || m === T);
    open = open.filter((d) => !due.includes(d));
    let rolled = 0;
    // F-26: the current account pays on the first `balanceCeiling` of the whole balance; the open pieces share that
    // part in proportion to their size (all of them are one month old, termMonths 1)
    let earning = 1;
    if (isCurrentAccount && deposit.balanceCeiling !== undefined) {
      const balance = due.reduce((s, d) => s + d.principal, 0);
      if (balance > deposit.balanceCeiling) earning = deposit.balanceCeiling / balance;
    }
    for (const d of due) {
      // The piece's age on month m: the months it has earned, its start month included. It matures when its age is n
      // (startMonth + n - 1 === m).
      const months = m - d.startMonth + 1;
      // G-16: a piece still inside its term on the exit day is priced as if it matured that day. The records hold whether a break
      // is allowed, not what it pays, so the break is not priced; the run says so on the number.
      // G-34: where that day is one of the piece's exit points (`pieceAtExitPoint`), the money can be withdrawn without a break
      // (BANK-27), and the run says that in place of G-16. The amount is the same interest to date either way: the records do not
      // hold what an exit point pays, and products differ (BANK OQ20), so the note says the sum received may differ. Which of the
      // two notes a piece raises decides nothing else: how money inside a term on the last day should be treated is the
      // founder's open question (F-41).
      if (months < n) tally.flag(pieceAtExitPoint(m, d.startMonth, deposit) ? "G-34" : "G-16");
      const indexed = d.principal * (linked ? I[m]! / d.baseIndex : 1);
      const interest = depositInterest(indexed * earning, deposit.rate, months);
      const tax = rate * interest;
      totalInterest += interest;
      yearTaxable += interest;
      yearIncome += indexed - d.principal + interest;
      yearWithheld += tax;
      tally.taxDuring += tax;
      rolled += indexed + interest - tax;
    }
    if (closesTaxYear(m, T, first)) {
      const deduction = applyTxi20
        ? Math.min(
            yearTaxable,
            lowIncomeDeduction(profile.annualIncome! + yearIncome, book.amount("TXI-20", "favoured_ceiling"), book.amount("TXI-20", "deduction")),
          )
        : 0;
      deductionUsed += deduction;
      const owed = linked ? maxRateTax(book, profile, m, yearTaxable - deduction, rate, first) : { tax: rate * (yearTaxable - deduction), atBrackets: false };
      if (owed.atBrackets) tally.flag("G-21");
      const refund = refundClaimed ? yearWithheld - owed.tax : 0;
      tally.taxDuring += yearlySurtax(book, profile, yearTaxable - deduction) - refund;
      rolled += refund;
      yearTaxable = yearIncome = yearWithheld = 0;
    }
    if (m < T) {
      if (rolled !== 0) open.push({ principal: rolled, baseIndex: I[m]!, startMonth: m + 1 });
    } else {
      finalValue = rolled;
    }
    const accrued = open.reduce(
      (s, d) => s + d.principal * (linked ? I[m]! / d.baseIndex : 1) * Math.pow(1 + deposit.rate, (m - d.startMonth + 1) / 12),
      0,
    );
    tally.point(m, I[m]!, m < T ? accrued : finalValue);
  }

  return tally.result(book, {
    exitMonth: T,
    nominal: finalValue,
    index: I,
    taxAtExit: 0,
    detail: { interest: totalInterest, txi20Deduction: deductionUsed },
    formulas: isCurrentAccount ? ["F-26", "F-41"] : ["F-21", deposit.kind === "savings-plan" ? "F-22" : "F-41"],
  });
}
