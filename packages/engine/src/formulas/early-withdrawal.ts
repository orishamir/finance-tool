// docs/method.md §7, F-47: a study fund withdrawn before its lock-up ends, only if the person opts in (B3).
import type { Bracket, RuleBook } from "../resolver.ts";
import { deductionValue } from "./deposit-side.ts";
import { bracketTaxOnTopSlice } from "./exit-tax.ts";

export interface EarlyWithdrawalInput {
  /** Nominal gains: balance less every deposit. Taxed at the s.121 rates for income not from personal effort. */
  gains: number;
  /** Benefited employer deposits being withdrawn: work income when received (TXH-13, TXH-01). 0 for own money. */
  employerDeposits: number;
  /** A-13: the person's other taxable income in the year, `Y`. */
  otherIncome: number;
  /** The person is 60 or over in the exit year: the personal-effort brackets apply to everything (TXG-04). */
  sixtyOrOver: boolean;
  /** A-14: the over-withheld tax is claimed back. With it off the withholding is the final tax. */
  refundClaimed: boolean;
  /** Personal-effort schedule (TXG-02) and, for 60 or over, TXG-04's. */
  workBrackets: readonly Bracket[];
}

export interface EarlyWithdrawalTax {
  /** Tax on the gains (TXG-03 schedule, or TXG-04 at 60 or over), stacked on `Y` plus the employer deposits. */
  taxOnGains: number;
  /** Tax on the employer deposits as work income, stacked on `Y` (TXG-02). */
  taxOnDeposits: number;
  /** What the fund withholds at the highest rate (TXH-15), on the gains and the employer deposits. */
  withheld: number;
  /** The tax that stands: the computed tax, or the withholding when the refund is not claimed (A-14). */
  tax: number;
  refund: number;
}

/**
 * F-47 Keren hishtalmut, early withdrawal. Employer benefited deposits are taxed as work income at the
 * person's brackets when received (TXH-13, TXH-01); the gains at the s.121 rates for income not from
 * personal effort, which start at 31% under 60 (TXH-13, s.125C(d)(5), TXG-03); the fund withholds 47%
 * (TXH-15) and the difference is recovered through a return (A-14). Own deposits came from net salary and
 * are not taxed again (TXH-04); employer deposits above the limit were taxed when paid (TXH-03).
 *
 * Modelling choice the rule base does not settle: the gains are stacked on `Y` plus the employer deposits
 * withdrawn with them. National Insurance and health on the gains are not modelled (G-27).
 */
export function studyFundEarlyWithdrawal(book: RuleBook, i: EarlyWithdrawalInput): EarlyWithdrawalTax {
  const gains = Math.max(0, i.gains);
  const deposits = Math.max(0, i.employerDeposits);
  book.cite("TXH-13");
  const gainBrackets = i.sixtyOrOver ? book.brackets("TXG-04", "brackets") : book.brackets("TXG-03", "brackets");
  const taxOnGains = bracketTaxOnTopSlice(i.otherIncome + deposits, gains, gainBrackets, Infinity);
  const taxOnDeposits = deductionValue(i.workBrackets, i.otherIncome + deposits, deposits);
  const withheld = book.rate("TXH-15", "withholding_early") * (gains + deposits);
  const computed = taxOnGains + taxOnDeposits;
  const tax = i.refundClaimed ? computed : withheld;
  return { taxOnGains, taxOnDeposits, withheld, tax, refund: withheld - tax };
}
