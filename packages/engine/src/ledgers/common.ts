// Pieces every ledger shares: the taxpayer profile, the exit-year tax on "maximum rate" income (F-40 with
// F-42 and F-43), the cash between orders of a run that buys by amount (F-12), and assembling the result.
import { bracketTaxOnTopSlice, surtax } from "../formulas/exit-tax.ts";
import { buyWithCash, type Commission, type TradeTerms } from "../formulas/fees.ts";
import { lastMonthOfTaxYear, taxYearOf } from "../formulas/time.ts";
import { BlockedError, type RuleBook } from "../resolver.ts";
import { emptyFees, type FeeType, type Flag, type FundStatement, type MonthPoint, type Outcome, type RunResult } from "../result.ts";

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

/** Records on the run's book that the person's income changed a figure (`RunResult.profileUsed`), where the profile holds one. */
function incomeUsed(book: RuleBook, p: Profile): void {
  if (otherIncomeOf(p) > 0) book.profile("income");
}

/**
 * Records that the age-60 brackets (F-42) lowered a tax below the flat rate: the run rests on the age, which brought them in, and on the
 * income, above which the slice starts, and the rules that bring them in (`took`, on the book given) changed the number. Brackets that give
 * the flat rate (an income above the 20% band, a gain of nothing, A-14 off) change nothing, and are not recorded.
 */
export function sixtyLowered(book: RuleBook, profile: Profile, tax: number, flat: number, rules: readonly string[]): void {
  if (tax >= flat - 1e-9) return;
  book.profile("age");
  incomeUsed(book, profile);
  for (const id of rules) book.took(id);
}

/**
 * Whether the person reaches the age-60 rules' age (TXG-04) in the tax year containing month m. The age is looked at (`peek`) whether or not
 * the profile holds an age: the caller takes TXG-04 where its brackets change a tax.
 */
export function reachesSixty(book: RuleBook, profile: Profile, month: number, firstMonth = 1): boolean {
  return reachesAgeInYear(profile, month, book.peek.amount("TXG-04", "age"), firstMonth);
}

/** Whether the person reaches the age in the tax year containing month m (TXG-04: "reached 60 in the tax year"). */
function reachesAgeInYear(profile: Profile, month: number, age: number, firstMonth = 1): boolean {
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
  if (!reachesSixty(book, profile, month, firstMonth)) return { tax: withheld, withheld, atBrackets: false };
  book.peek.cite("TXS-23");
  book.peek.cite("TXG-07");
  // F-119: the brackets of the tax year the income falls in
  const brackets = bracketTaxOnTopSlice(otherIncomeOf(profile), Math.max(0, income), book.inYear(taxYearOf(month, firstMonth)).peek.brackets("TXG-04", "brackets"), rate);
  const tax = profile.refundClaimed === false ? withheld : brackets;
  sixtyLowered(book, profile, tax, withheld, ["TXG-04", "TXS-23", "TXG-07"]);
  return { tax, withheld, atBrackets: true };
}

/**
 * F-43 Surtax owed because of `income` in tax year `year` of the run's grid (`taxYearOf`), in which `alreadyThisYear` of special-rate
 * income from the same run has been received: the surtax on the total less the surtax on what came before, at that year's threshold (F-119).
 * TXG-09 and TXG-10 are looked at (`peek`) and taken on the book given only where the part the caller uses (`use`) is above 0: TXG-09 for
 * the general surtax, TXG-10 for the one on capital income.
 */
export function surtaxOn(book: RuleBook, profile: Profile, income: number, alreadyThisYear: number, year: number, markIncome = true, use: "both" | "general" | "onCapital" = "both") {
  const ofYear = book.inYear(year).peek;
  const at = (x: number) =>
    surtax(
      otherIncomeOf(profile),
      x,
      profile.otherCapitalIncome ?? 0,
      { rate: ofYear.rate("TXG-09", "rate"), threshold: ofYear.amount("TXG-09", "threshold") },
      { rate: ofYear.rate("TXG-10", "rate"), threshold: ofYear.amount("TXG-10", "threshold") },
    );
  const before = at(Math.max(0, alreadyThisYear));
  const after = at(Math.max(0, alreadyThisYear) + Math.max(0, income));
  const general = after.general - before.general;
  const onCapital = after.onCapital - before.onCapital;
  // a caller whose `profile` holds an income it made up (F-47's 12 × salary) says so with `markIncome` and records the person's own itself
  if (markIncome && general + onCapital > 0) incomeUsed(book, profile);
  if (use !== "onCapital" && general > 0) book.took("TXG-09");
  if (use !== "general" && onCapital > 0) book.took("TXG-10");
  return { general, onCapital };
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
  const s = surtaxOn(book, profile, taxableGain, specialIncomeThisYear, taxYearOf(exitMonth, firstMonth));
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

/** Surtax on special-rate income that falls during the holding period (F-43), one tax year at a time: `year` on the run's grid. */
export function yearlySurtax(book: RuleBook, profile: Profile, incomeInYear: number, year: number): number {
  const s = surtaxOn(book, profile, incomeInYear, 0, year);
  return s.general + s.onCapital;
}

/**
 * Runs the exit-tax step. If a rule it needs is open (a rule of strength open, an open question whose readings split, a method gap), the
 * tax is not charged and `outcome` lists the run, not ranked, on that rule, with the question or the gap where one stopped it. The run
 * then returns its value before the exit tax, and its notes on what came before the sale (G-07, G-20) stand. No ranking reads that value:
 * the provider workbench does not compare such a run (F-118 is not built), the timeline stops on one an open question or a gap stopped
 * (F-119), and the makam guide shows it beside a line saying the tax on a sale before redemption is not computed.
 */
export function unlessBlocked<T>(step: () => T): { value: T; blocked?: undefined; outcome?: undefined } | { value?: undefined; blocked: string; outcome: Outcome } {
  try {
    return { value: step() };
  } catch (e) {
    if (e instanceof BlockedError) return { blocked: e.ruleId, outcome: { code: "listed-not-ranked", reason: e.ruleId, ...(e.question ? { question: e.question } : {}), ...(e.gap ? { gap: e.gap } : {}) } };
    throw e;
  }
}

/**
 * F-12 with F-24 and F-25: the account's cash between the orders of a run that buys by amount (makam, a government bond). An order's cash
 * is what it brings and what waits from earlier orders. An order its cash cannot pay is not placed (`buyWithCash`): its cash stays in the
 * account, earning nothing, joins the next order placed, pays the part of the account's monthly fee the holdings cannot (F-17, `pay`), and
 * at the horizon is part of what is left (`waiting`).
 */
export class OrderCash {
  private readonly line: Commission | undefined;
  private readonly terms: TradeTerms;
  private held = 0;

  constructor(line: Commission | undefined, terms: TradeTerms) {
    this.line = line;
    this.terms = terms;
  }

  /** One order with `cash` and what waits; a call with no cash places no order and leaves the waiting cash as it is. */
  buy(cash: number): { trade: number; commission: number } {
    if (!(cash > 0)) return { trade: 0, commission: 0 };
    const total = cash + this.held;
    const order = buyWithCash(total, this.line, this.terms);
    this.held = order.trade > 0 ? 0 : total;
    return order;
  }

  /** Pays up to `amount` out of the waiting cash and returns what it paid: never more than waits. */
  pay(amount: number): number {
    const paid = Math.min(this.held, Math.max(0, amount));
    this.held -= paid;
    return paid;
  }

  /** The cash of the orders not placed, waiting for the next one. */
  get waiting(): number {
    return this.held;
  }
}

/** Running totals a ledger keeps while it steps through the months. */
export class Tally {
  fees = emptyFees();
  taxDuring = 0;
  paidIn = 0;
  flags: Flag[] = [];
  series: MonthPoint[] = [];
  statements: FundStatement[] = [];

  /** F-91 on a run in whole units: each fee in units of the fund's total-return index at the time it was paid (`grow`), so `feesCarried` is what it would be worth at the exit. */
  private carried = emptyFees();
  private growth = 1;
  private grows = false;
  /** F-109 on a run in whole units: the waiting cash in units of the same index, entered at a month's start and left at its end (`waitFrom`, `waitTo`). */
  private waited = 0;
  private waits = false;
  /** F-128 on a run of a deal account: each of the deal's fees in units of the same index (`feeBy`), by its index in the deal. */
  private carriedBy: number[] = [];
  /** F-91: the tax on distributions the money each pot carries would have paid, nominal, as `tax_real` counts tax (`distributionTaxed`). */
  private carriedTax = emptyFees();
  private waitedTax = 0;
  private carriedByTax: number[] = [];

  fee(type: FeeType, amount: number) {
    // nothing to add: a total that starts at 0 never becomes -0, so adding 0 leaves it as it is, and 0 over a growth that is a number other
    // than 0 is 0 (over 0 or NaN it is NaN, which is added as before). Most months charge several kinds of fee nothing.
    if (amount === 0 && this.growth !== 0 && this.growth === this.growth) return;
    this.fees[type] += amount;
    this.carried[type] += amount / this.growth;
  }

  /** F-128: a deal fee's part of a charge already added by its line (`fee`), carried as `fee` carries the line. */
  feeBy(i: number, amount: number) {
    if (amount === 0) return;
    this.carriedBy[i] = (this.carriedBy[i] ?? 0) + amount / this.growth;
  }

  /** The fund's total return in a month (its growth less its own costs, a distribution kept in): a ledger that calls it reports `feesCarried`. */
  grow(factor: number) {
    this.growth *= factor;
    this.grows = true;
  }

  /**
   * F-91: a month's distribution, taxed at `s` of what is held (its share of the holding × the tax on a shekel of it). The money each pot
   * carries, fees and the waiting cash, would have paid that tax, which a value before tax counts at face (`tax_real`), and kept the rest:
   * the tax is added to the pot as paid, and the return the pots grow at shrinks by it, so a pot is what the holder keeps of it plus the tax
   * it paid, as `B` counts it.
   */
  distributionTaxed(s: number) {
    if (s === 0) return;
    for (const k of Object.keys(this.carried) as FeeType[]) this.carriedTax[k] += this.carried[k] * this.growth * s;
    this.carriedBy.forEach((v, i) => {
      this.carriedByTax[i] = (this.carriedByTax[i] ?? 0) + v * this.growth * s;
    });
    this.waitedTax += this.waited * this.growth * s;
    this.grow(1 - s);
  }

  /** F-109: the cash waiting for a whole unit at a month's start, before the month's growth: what it would have become in the fund. */
  waitFrom(cash: number) {
    this.waited += cash / this.growth;
    this.waits = true;
  }

  /** F-109: the same cash at the month's end, after every share of the month (`grow`), as it joins the next order. */
  waitTo(cash: number) {
    this.waited -= cash / this.growth;
  }

  /** D84: a fund statement the run reads in place of a rule, carried on its result (`RunResult.statements`). */
  state(statement: FundStatement) {
    if (!this.statements.includes(statement)) this.statements.push(statement);
  }

  flag(code: string, month?: number) {
    if (!this.flags.some((f) => f.code === code)) this.flags.push(month === undefined ? { code } : { code, month });
  }

  point(month: number, index: number, balance: number) {
    // every kind, added in the order `emptyFees` lists them (as a loop over the keys added them)
    const f = this.fees;
    const fees = 0 + f.deposit + f.balance + f.direct + f.trade + f.spread + f.custody + f.fixed + f.account + f.fund + f.fx + f.manager;
    const providerFees = f.trade + f.custody + f.fx + f.fixed + f.account;
    this.series.push({ month, index, paidIn: this.paidIn, balance, fees, providerFees, taxDuring: this.taxDuring });
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
    // G-23: credit points come off the whole computed tax, special-rate income included (TXG-05), but the
    // engine has no input for the person's credit points (who gets how many is out of the rule base's scope). So a run that
    // charges Israeli tax says that no credit was applied, rather than assume silently that none is left over.
    if (this.taxDuring + r.taxAtExit - (r.detail?.foreignTax ?? 0) > 0) this.flag("G-23");
    // G-36: an amount s.120ב moves was read for a year after its freeze (F-119), which TXG open question 16 keeps from being exact
    if (book.indexedYears().length > 0) this.flag("G-36");
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
      profileUsed: book.profileUsed(),
      ...(this.statements.length ? { statements: this.statements } : {}),
      ...(this.grows ? { feesCarried: Object.fromEntries(Object.entries(this.carried).map(([k, v]) => [k, v * this.growth + this.carriedTax[k as FeeType]])) as Record<FeeType, number> } : {}),
      ...(this.grows && this.waits ? { waitingCarried: this.waited * this.growth + this.waitedTax } : {}),
      ...(this.carriedBy.length ? { feesCarriedBy: Array.from(this.carriedBy, (v, i) => (v ?? 0) * this.growth + (this.carriedByTax[i] ?? 0)) } : {}),
    };
  }
}
