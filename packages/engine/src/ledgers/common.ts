// Pieces every ledger shares: the taxpayer profile, the exit-year tax on "maximum rate" income (F-40 with
// F-42 and F-43), and assembling the result.
import { bracketTaxOnTopSlice, surtax } from "../formulas/exit-tax.ts";
import { lastMonthOfTaxYear } from "../formulas/time.ts";
import { BlockedError, type RuleBook } from "../resolver.ts";
import { emptyFees, type FeeType, type Flag, type MonthPoint, type Outcome, type RunResult } from "../result.ts";

/** The taxpayer inputs (A-12 to A-14). */
export interface Profile {
  /** A-12: age at the start, in whole years. Needed only for the age-60 rules (F-42). */
  ageAtStart?: number;
  /** A-12: gross yearly income of the person (and spouse, for TXI-20). Unknown means TXI-20 is not applied. */
  annualIncome?: number;
  /** A-13: other taxable income in the exit year, Y. Defaults to `annualIncome`, else 0. */
  otherIncome?: number;
  /** Other capital-source income in the exit year (F-43). Default 0. */
  otherCapitalIncome?: number;
  /** A-14: refund of over-withheld tax is claimed. Default true. */
  refundClaimed?: boolean;
}

export const otherIncomeOf = (p: Profile) => p.otherIncome ?? p.annualIncome ?? 0;

/** Whether the person reaches the age in the tax year containing month m (TXG-04: "reached 60 in the tax year"). */
export function reachesAgeInYear(profile: Profile, month: number, age: number, firstMonth = 1): boolean {
  if (profile.ageAtStart === undefined) return false;
  // Whole years at the start, birthday unknown: the age at the end of that tax year is at least this.
  return profile.ageAtStart + Math.floor(lastMonthOfTaxYear(month, firstMonth) / 12) >= age;
}

/**
 * F-42 for "maximum rate" income in one tax year: the tax at the person's brackets on the slice above Y,
 * each part capped at ρ (TXG-04, TXG-07), when the person is 60 or over that year; else ρ × income.
 * With A-14 off the flat withholding is final. `atBrackets` says whether the brackets were used.
 */
export function maxRateTax(book: RuleBook, profile: Profile, month: number, income: number, rate: number, firstMonth = 1) {
  const withheld = rate * Math.max(0, income);
  if (!reachesAgeInYear(profile, month, book.amount("TXG-04", "age"), firstMonth)) return { tax: withheld, withheld, atBrackets: false };
  book.cite("TXS-23");
  book.cite("TXG-07");
  const brackets = bracketTaxOnTopSlice(otherIncomeOf(profile), Math.max(0, income), book.brackets("TXG-04", "brackets"), rate);
  return { tax: profile.refundClaimed === false ? withheld : brackets, withheld, atBrackets: true };
}

/**
 * F-43 Surtax owed because of `income` in a tax year in which `alreadyThisYear` of special-rate income
 * from the same run has been received: the surtax on the total less the surtax on what came before.
 */
export function surtaxOn(book: RuleBook, profile: Profile, income: number, alreadyThisYear = 0) {
  const at = (x: number) =>
    surtax(
      otherIncomeOf(profile),
      x,
      profile.otherCapitalIncome ?? 0,
      { rate: book.rate("TXG-09", "rate"), threshold: book.amount("TXG-09", "threshold") },
      { rate: book.rate("TXG-10", "rate"), threshold: book.amount("TXG-10", "threshold") },
    );
  const before = at(Math.max(0, alreadyThisYear));
  const after = at(Math.max(0, alreadyThisYear) + Math.max(0, income));
  return { general: after.general - before.general, onCapital: after.onCapital - before.onCapital };
}

/**
 * Exit tax on a capital gain at rate ρ (F-40), with the age-60 brackets for "maximum rate" items (F-42) and
 * the surtax on the exit year's total (F-43). `fixedRate` items (unlinked interest and bonds) keep their
 * rate at 60 (TXG-08 case (c); for sale gains TXG OQ10 is open, so no reduction is applied).
 * `settledByReturn` is true when part of the tax is settled through the annual return (G-21).
 */
export function exitTax(
  book: RuleBook,
  profile: Profile,
  exitMonth: number,
  taxableGain: number,
  rate: number,
  fixedRate = false,
  specialIncomeThisYear = 0,
  firstMonth = 1,
) {
  const flat = rate * Math.max(0, taxableGain);
  const m = fixedRate ? { tax: flat, withheld: flat, atBrackets: false } : maxRateTax(book, profile, exitMonth, taxableGain, rate, firstMonth);
  const s = surtaxOn(book, profile, taxableGain, specialIncomeThisYear);
  return {
    tax: m.tax + s.general + s.onCapital,
    withheld: m.withheld,
    refund: m.withheld - m.tax,
    capitalGainsTax: m.tax,
    surtax: s.general,
    capitalSurtax: s.onCapital,
    settledByReturn: m.atBrackets || s.general + s.onCapital > 0,
  };
}

/** Surtax on special-rate income that falls during the holding period (F-43), one tax year at a time. */
export function yearlySurtax(book: RuleBook, profile: Profile, incomeInYear: number): number {
  const s = surtaxOn(book, profile, incomeInYear);
  return s.general + s.onCapital;
}

/**
 * Runs the exit-tax step; if a rule it needs is open, the wrapper is listed with its pre-tax value and
 * the rule as the reason, not ranked (B3).
 */
export function unlessBlocked<T>(step: () => T): { value: T; blocked?: undefined } | { value?: undefined; blocked: string } {
  try {
    return { value: step() };
  } catch (e) {
    if (e instanceof BlockedError) return { blocked: e.ruleId };
    throw e;
  }
}

/** Running totals a ledger keeps while it steps through the months. */
export class Tally {
  fees = emptyFees();
  taxDuring = 0;
  paidIn = 0;
  flags: Flag[] = [];
  series: MonthPoint[] = [];

  fee(type: FeeType, amount: number) {
    this.fees[type] += amount;
  }

  flag(code: string, month?: number) {
    if (!this.flags.some((f) => f.code === code)) this.flags.push(month === undefined ? { code } : { code, month });
  }

  point(month: number, index: number, balance: number) {
    const fees = Object.values(this.fees).reduce((a, b) => a + b, 0);
    this.series.push({ month, index, paidIn: this.paidIn, balance, fees, taxDuring: this.taxDuring });
  }

  result(
    book: RuleBook,
    r: {
      exitMonth: number;
      nominal: number;
      index: readonly number[];
      taxAtExit: number;
      detail?: Record<string, number>;
      outcome?: Outcome;
      formulas: string[];
    },
  ): RunResult {
    return {
      exitMonth: r.exitMonth,
      nominal: r.nominal,
      real: r.nominal / r.index[r.exitMonth]!,
      paidIn: this.paidIn,
      fees: this.fees,
      taxDuring: this.taxDuring,
      taxAtExit: r.taxAtExit,
      series: this.series,
      detail: r.detail ?? {},
      flags: this.flags,
      labels: book.labels(),
      outcome: r.outcome ?? { code: "eligible" },
      formulas: r.formulas,
      rules: book.used(),
    };
  }
}
