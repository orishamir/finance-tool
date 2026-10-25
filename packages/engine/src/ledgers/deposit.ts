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
    /** A-16: unlinked, CPI-linked, or prime-linked (taxed as unlinked by the rule base's reading, TXI-04). */
    linkage: "unlinked" | "cpi" | "prime";
    /**
     * F-26 (2026-10-25): the largest balance of a current account that earns the rate (the record's `amount_range.max`,
     * BANK-09); interest is on min(balance, ceiling). Read for a current account only; a deposit's amount range is a
     * condition of the offer, not a cap on what the ladder holds.
     */
    balanceCeiling?: number;
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

/**
 * F-21 Bank deposit, laddered (F-22 savings plan, F-26 current account, F-41 exit). Each contribution
 * opens its own deposit of term n; at maturity the interest is taxed and principal plus net interest rolls
 * into a new deposit. At T the open deposits are treated as matured on the exit day.
 * F-22 Savings plan: the same ladder with the plan's own rate and term (TXI-07, BANK-28).
 * F-41 Deposits at exit: tax was charged at each maturity; the last open deposit matures on the exit day.
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
    if (deposit.linkage === "prime") book.label("reading", "TXI-04");
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
      const months = m - d.startMonth + 1;
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
