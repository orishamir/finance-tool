// Provident-family wrappers without a deposit-side tax effect: kupat gemel lehashkaa and the own-money
// part of a keren hishtalmut. F-08 with no trade (F-27), F-11, F-15, F-16, the section 8 ceiling and lock,
// and the exits F-44 and F-46.
import { balanceFee, depositFee, feeForMonth, type Discount } from "../formulas/fees.ts";
import { deductionValue, equalNetOutlay, spreadReliefByYear } from "../formulas/deposit-side.ts";
import { studyFundEarlyWithdrawal } from "../formulas/early-withdrawal.ts";
import { hishtalmutExitTax, kglExitTax } from "../formulas/exit-tax.ts";
import { annualToMonthly, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { BlockedError, RecordInputError, ruleBook } from "../resolver.ts";
import type { Outcome, RunContext, RunResult } from "../result.ts";
import { exitTax, reachesAgeInYear, surtaxOn, Tally, unlessBlocked, type Profile } from "./common.ts";

export interface ProvidentInput {
  wrapper: "kupat-gemel-lehashkaa" | "keren-hishtalmut";
  goal: Goal;
  market: { grossReturn: number; inflation: number };
  /** Fee rates as fractions: deposit fee (F-11), balance fee (F-15), direct expenses (A-18), discount (A-19). */
  fees: { deposit: number; balance: number; direct: number; discount?: Discount };
  /**
   * A-12 for a study fund: employment, salary, and the month the 6-year clock started (KH-11).
   * `earlyWithdrawal` is the person's opt-in to withdraw at the horizon when the fund is still locked (B3,
   * F-47). `employerRate` is the employer's rate on the payslip, a share of salary, for the employer line
   * (F-52); the run itself ignores it. `money: "employer"` runs the employer's deposits (F-52): their
   * benefited part is `TXH-01`'s share of the determining salary, and the part above it is taxed as salary
   * when paid, so the run returns the value net of that tax.
   */
  hishtalmut?: {
    employment: "employee" | "self-employed";
    monthlySalary?: number;
    clockStartMonth: number;
    earlyWithdrawal?: boolean;
    employerRate?: number;
    money?: "own" | "employer";
    /**
     * Of `goal.monthly`, the part the employer pays (an employee's own money and the employer's together, as a
     * payslip shows them, S42). The own part is benefited up to TXH-08's share of the determining salary, the
     * employer's up to TXH-01's; an employer part above that limit is salary when paid (F-52, TXH-03) and runs
     * separately inside the same run (its salary tax is subtracted from the value, its gains are taxed at exit).
     */
    employerMonthly?: number;
  };
  /**
   * A balance already in the fund (a holding under review, F-61), as `runPension` has it: it starts the ledger as
   * it is, with no deposit fee, no deposit-side relief and nothing added to `paidIn`; `goal` then holds only new
   * money. In a study fund it is benefited money once TXH-09's lock has passed at the start; inside the lock it
   * needs the split into tax layers from the detailed statement (PF-36) and the run stops with a missing input.
   * A kupat gemel lehashkaa balance runs with the balance as its opening cost basis for fees and growth; its exit
   * tax needs `embeddedGain`.
   */
  existingBalance?: number;
  /**
   * Kupat gemel lehashkaa with `existingBalance`: the gain already inside the balance at the start, from the detailed
   * annual statement (PF-36), in nominal NIS. The rest of the balance is the cost basis, at the index of month 0. Absent:
   * the exit tax is not computed (`taxAtExit` 0, flag `PF-36`) and F-61's fee costs are still produced. Ignored in a
   * study fund, where the balance is benefited and exempt.
   */
  embeddedGain?: number;
  /**
   * Deposits every `months` months from `firstMonth` instead of every month: `goal.monthly` is then the
   * amount of each deposit (a self-employed person's yearly December deposit, S26).
   */
  depositsEvery?: { months: number; firstMonth: number };
  profile: Profile;
}

interface Pot {
  balance: number;
  /** Deposits with the CPI index of their month, for the real gain. */
  deposits: { amount: number; index: number }[];
}

export type ProvidentResult = RunResult & { routed: { month: number; amount: number }[] };

/**
 * F-27 Provident family: no tax while invested (TXK-03, TXH-18). Each month the deposit, less the deposit
 * fee, is added; the balance grows at r_g; the balance fee and the direct expenses are a twelfth of their
 * annual rate on the month-end balance (F-15). A kupat gemel lehashkaa takes deposits up to its yearly
 * ceiling (KGL-02 to KGL-04) and routes the rest (F-05). A study fund keeps benefited and excess deposits
 * apart (TXH-08) and is locked for 6 years from the first payment (TXH-09); when the horizon is earlier,
 * contributions stop at the horizon and the value is shown at the first lawful exit (B3, product D16).
 * F-33 Everything else: the deposit is the net outlay, `D_m = C_m` (TXK-01, TXH-04); no deduction or credit.
 */
export function runProvident(input: ProvidentInput, ctx: RunContext): ProvidentResult {
  const book = ruleBook(ctx);
  const { goal, fees, profile } = input;
  const kgl = input.wrapper === "kupat-gemel-lehashkaa";
  const tally = new Tally();
  const formulas = ["F-08", "F-27", "F-11", "F-15", "F-16"];

  // Caps on fee rates (F-11, F-15): PF-02 for provident funds and kupat gemel lehashkaa; PF-06 for a
  // study fund, which has no deposit-fee item at all.
  const balanceCap = kgl ? book.rate("PF-02", "balance_cap") : book.rate("PF-06", "balance_cap");
  const depositCap = kgl ? book.rate("PF-02", "deposit_cap") : 0;
  if (fees.direct > 0) book.cite("PF-10");
  else tally.flag("G-14");
  const minDiscountMonths = 12 * book.amount("PF-13", "min_discount_years");
  book.cite(kgl ? "TXK-03" : "TXH-18");

  // Section 8: lawful exit. A study fund is locked until 6 years after its first payment (TXH-09).
  let exitMonth = goal.months;
  let outcome: Outcome = { code: "eligible" };
  let early = false;
  // TXH-08: an employee's benefited deposit is a share of each month's determining salary; a
  // self-employed person's is a yearly amount.
  let benefitedMonthly = Infinity;
  let benefitedYearly = Infinity;
  let employerLimit = Infinity;
  const existing = input.existingBalance ?? 0;
  if (!Number.isFinite(existing) || existing < 0) throw new RangeError(`existingBalance ${existing} must be a number of zero or more`);
  const embedded = input.embeddedGain;
  if (embedded !== undefined && (!Number.isFinite(embedded) || embedded < 0 || embedded > existing)) {
    throw new RangeError(`embeddedGain ${embedded} must be between 0 and existingBalance ${existing}`);
  }
  if (!kgl) {
    const h = input.hishtalmut!;
    let lockMonth = h.clockStartMonth + 12 * book.amount("TXH-09", "lock_years");
    // TXH-10: 3 years from the first payment instead of 6 for a person who has reached retirement age. The
    // exit is lawful once both 3 years have passed and the person is at that age. Which age of the Retirement
    // Age Law applies is an inference (KH-12: the s.3 age); the profile has no sex, so the higher age, 67
    // (PEN-26, also the mandatory age for both), is used and the exit is never earlier than the law allows.
    if (profile.ageAtStart !== undefined) {
      const reached = 12 * (book.amount("PEN-26", "retirement_age_men") - profile.ageAtStart);
      const short = Math.max(h.clockStartMonth + 12 * book.amount("TXH-10", "lock_years"), reached);
      if (short < lockMonth) {
        lockMonth = short;
        book.cite("TXH-10");
        book.label("reading", "KH-12");
      }
    }
    if (existing > 0 && lockMonth > 0) {
      throw new RecordInputError(
        "existingBalance in a study fund still inside its lock needs the split into tax layers from the detailed annual statement (PF-36): not given, so the run cannot price its exit tax",
      );
    }
    if (lockMonth > goal.months) {
      // B3: still locked at the horizon. Unless the person opts into early withdrawal (F-47), the value is
      // shown at the first lawful exit; with it, the run exits at the horizon and F-47 taxes it.
      if (h.earlyWithdrawal) early = true;
      else {
        exitMonth = lockMonth;
        outcome = { code: "listed-not-ranked", reason: "B3", untilMonth: lockMonth };
      }
    }
    if (h.employment === "employee") {
      const determining = Math.min(h.monthlySalary ?? 0, book.amount("TXH-02", "determining_salary_cap"));
      // TXH-08: own deposit benefited up to 2.5% of the determining salary; TXH-01: the employer's up to 7.5%.
      benefitedMonthly =
        h.money === "employer" ? book.rate("TXH-01", "employer_exempt_pct") * determining : book.rate("TXH-08", "own_benefited_pct") * determining;
      if (h.employerMonthly !== undefined) {
        if (h.money === "employer") throw new RecordInputError("hishtalmut.employerMonthly splits goal.monthly into own and employer money; money: \"employer\" runs the employer's alone");
        if (h.employerMonthly < 0 || h.employerMonthly > goal.monthly) throw new RangeError(`employerMonthly ${h.employerMonthly} must be between 0 and goal.monthly`);
        employerLimit = book.rate("TXH-01", "employer_exempt_pct") * determining;
        // F-52: the part of the employer's deposit above this limit is salary when paid (TXH-03) and runs
        // separately below; the part up to the limit stays benefited (TXH-01).
        if (h.employerMonthly > employerLimit) {
          book.cite("TXH-03");
          book.label("reading", "TXG-35");
        }
      }
    } else {
      benefitedYearly = book.amount("TXH-08", "self_employed_benefited");
    }
    formulas.push("F-46");
  } else {
    book.cite("KGL-02");
    book.cite("KGL-04");
    formulas.push("F-05", "F-44");
  }
  const ceiling = kgl ? book.amount("KGL-03", "ceiling") : Infinity;

  const T = exitMonth;
  const first = goal.firstMonth ?? 1;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const g = annualToMonthly(input.market.grossReturn);
  // Gemel lehashkaa: the part of the balance that is not embedded gain is cost basis, at the index of month 0.
  const benefited: Pot = { balance: existing, deposits: kgl && existing > 0 && embedded !== undefined && existing > embedded ? [{ amount: existing - embedded, index: 1 }] : [] };
  const exitTaxUnknown = kgl && existing > 0 && embedded === undefined;
  const excess: Pot = { balance: 0, deposits: [] };
  const routed: { month: number; amount: number }[] = [];
  let yearTotal = 0;
  let benefitedLeft = benefitedYearly;
  let discountExtended = false;
  tally.point(0, 1, existing);

  const hish = input.hishtalmut;
  const employerMoney = !kgl && hish?.money === "employer";
  const due = (m: number) => !input.depositsEvery || (m >= input.depositsEvery.firstMonth && (m - input.depositsEvery.firstMonth) % input.depositsEvery.months === 0);

  // F-30 for a self-employed study fund: the deduction (TXH-05, 4.5% of income up to the ceiling) is worth
  // the tax it saves at the person's brackets (TXG-02); the gross deposit is the one whose net cost is the
  // outlay. Without the person's income there is no run: "missing input" (F-83).
  let grossDeposits = [...C];
  let reliefTotal = 0;
  let deductionCap = 0;
  if (!kgl && hish?.employment === "self-employed" && !employerMoney) {
    if (profile.annualIncome === undefined) {
      throw new RecordInputError("profile.annualIncome is missing: a self-employed study fund's deduction (TXH-05, F-30) needs the person's income");
    } else {
      const brackets = book.brackets("TXG-02", "brackets");
      const income = profile.annualIncome;
      deductionCap = book.rate("TXH-05", "deduction_pct") * Math.min(income, book.amount("TXH-05", "income_ceiling"));
      const outlay = C.map((c, m) => (m === 0 || (m <= goal.months && due(m)) ? c : 0));
      grossDeposits = spreadReliefByYear(outlay, first, taxYearOf, (_y, netYear) =>
        equalNetOutlay(netYear, (d) => deductionValue(brackets, income, Math.min(d, deductionCap))),
      );
      formulas.push("F-30");
    }
  }

  // F-52: what the employer pays above the benefited limit is the employee's salary when paid (TXH-03):
  // income tax at the brackets (TXG-02) and National Insurance and health (TXG-35, labelled a reading).
  const employerExcessByYear = new Map<number, number>();
  let employerSocial = 0;
  const salary = hish?.monthlySalary ?? 0;
  const employerOverActive = !kgl && hish?.employerMonthly !== undefined && hish.employerMonthly > employerLimit;
  const social = employerMoney || employerOverActive
    ? {
        reducedUpTo: book.amount("TXG-35", "reduced_threshold"),
        maxIncome: book.amount("TXG-35", "max_income"),
        reduced: book.rate("TXG-35", "reduced_rate"),
        full: book.rate("TXG-35", "full_rate"),
      }
    : undefined;

  const deposit = (amount: number, eventMonth: number, outlay = amount) => {
    if (amount <= 0) return;
    let accepted = amount;
    if (kgl) {
      accepted = Math.min(amount, Math.max(0, ceiling - yearTotal));
      yearTotal += accepted;
      if (accepted < amount) routed.push({ month: eventMonth, amount: amount - accepted });
    }
    const share = accepted / amount;
    tally.paidIn += outlay * share;
    reliefTotal += (amount - outlay) * share;
    const fee = depositFee(fees.deposit, depositCap, accepted);
    tally.fee("deposit", fee);
    const net = accepted - fee;
    // S42: the employer part of the monthly deposit up to TXH-01's limit is all benefited; the part above the
    // limit is salary when paid (F-52, TXH-03) and goes with the excess.
    const empWithinFrac = hish?.employerMonthly !== undefined && eventMonth > 0 && goal.monthly > 0 ? Math.min(hish.employerMonthly, employerLimit) / goal.monthly : 0;
    const empOverFrac = hish?.employerMonthly !== undefined && eventMonth > 0 && goal.monthly > 0 ? Math.max(0, hish.employerMonthly - employerLimit) / goal.monthly : 0;
    const employerPart = net * empWithinFrac;
    const employerOver = net * empOverFrac;
    const inBenefit = employerPart + Math.min(net - employerPart - employerOver, benefitedMonthly, benefitedLeft);
    benefitedLeft -= inBenefit - employerPart;
    const over = employerMoney ? net - inBenefit : employerOver;
    if (social && over > 0) {
      const y = taxYearOf(eventMonth, first);
      employerExcessByYear.set(y, (employerExcessByYear.get(y) ?? 0) + over);
      const band = (lo: number, hi: number) => Math.max(0, Math.min(salary + over, hi) - Math.max(salary, lo));
      employerSocial += social.reduced * band(0, social.reducedUpTo) + social.full * band(social.reducedUpTo, social.maxIncome);
    }
    const pots: [Pot, number][] = [
      [benefited, inBenefit],
      [excess, net - inBenefit],
    ];
    for (const [pot, part] of pots) {
      if (part <= 0) continue;
      pot.balance += part;
      pot.deposits.push({ amount: part, index: I[eventMonth]! });
    }
  };

  for (let m = 1; m <= T; m++) {
    if (m > 1 && taxYearOf(m, first) !== taxYearOf(m - 1, first)) {
      yearTotal = 0;
      benefitedLeft = benefitedYearly;
    }
    if (m === 1) deposit(grossDeposits[0]!, 0, C[0]!);
    if (m <= goal.months && due(m)) deposit(grossDeposits[m]!, m, C[m]!);

    const { rate, extended } = feeForMonth(fees.balance, fees.discount, minDiscountMonths, m);
    discountExtended ||= extended;
    for (const pot of [benefited, excess]) {
      pot.balance *= 1 + g;
      const bal = balanceFee(rate, balanceCap, pot.balance);
      const direct = (fees.direct / 12) * pot.balance;
      tally.fee("balance", bal);
      tally.fee("direct", direct);
      pot.balance -= bal + direct;
    }
    tally.point(m, I[m]!, benefited.balance + excess.balance);
  }
  if (discountExtended) tally.flag("PF-13");

  const gross = benefited.balance + excess.balance;
  const realGain = (pot: Pot) => pot.balance - pot.deposits.reduce((s, d) => s + (d.amount * I[T]!) / d.index, 0);
  const nominalGain = (pot: Pot) => pot.balance - pot.deposits.reduce((s, d) => s + d.amount, 0);
  const detail: Record<string, number> = { grossBalance: gross };
  let taxAtExit: number;

  if (kgl) {
    // F-44: 25% of the real gain (TXK-07, primary since 2026-10-25), with the 15%-of-nominal line (TXK-06) beside it.
    book.cite("TXK-05");
    if (exitTaxUnknown) tally.flag("PF-36");
    const realRate = book.rate("TXK-07", "rate");
    const nominalRate = book.rate("TXK-06", "nominal_rate");
    const real = realGain(benefited);
    const t = kglExitTax(real, nominalGain(benefited), realRate, nominalRate);
    // The age-60 reduction is open for this deemed interest (TXK OQ12): not applied, and flagged.
    if (reachesAgeInYear(profile, T, book.amount("TXG-04", "age"), first)) tally.flag("TXK-OQ12");
    const s = surtaxOn(book, profile, real);
    taxAtExit = exitTaxUnknown ? 0 : t.tax + s.general + s.onCapital;
    detail.realGain = real;
    detail.altTaxAtExit = t.alternative;
    detail.altNominal = gross - t.alternative;
    detail.altReal = (gross - t.alternative) / I[T]!;
    tally.flag("G-11");
    tally.flag("G-02");
    if (exitTaxUnknown) for (const k of ["realGain", "altTaxAtExit", "altNominal", "altReal"]) delete detail[k];
  } else {
    // F-46: benefited money is exempt (TXH-09); gains on the excess are taxed at 25% of their real gain
    // (TXH-11; the real base is the Ministry of Finance Chief Economist paper's, primary).
    const excessReal = realGain(excess);
    taxAtExit = 0;
    if (early) {
      // F-47: early withdrawal at the horizon, opted into (B3). All gains, benefited or not, are taxed at
      // the s.121 rates; the benefited employer deposits are work income when received. G-27: NI and
      // health on the gains are not modelled.
      const y = profile.otherIncome ?? profile.annualIncome ?? 12 * salary;
      const sixty = reachesAgeInYear(profile, T, book.amount("TXG-04", "age"), first);
      const gains = nominalGain(benefited) + nominalGain(excess);
      const employerDeposits = employerMoney ? benefited.deposits.reduce((a, d) => a + d.amount, 0) : 0;
      const t = studyFundEarlyWithdrawal(book, {
        gains,
        employerDeposits,
        otherIncome: y,
        sixtyOrOver: sixty,
        refundClaimed: profile.refundClaimed !== false,
        workBrackets: book.brackets(sixty ? "TXG-04" : "TXG-02", "brackets"),
      });
      const withIncome = { ...profile, otherIncome: y };
      const surtax = surtaxOn(book, withIncome, gains + employerDeposits).general + surtaxOn(book, withIncome, gains).onCapital;
      taxAtExit = t.tax + surtax;
      detail.earlyGains = gains;
      detail.earlyWithheld = t.withheld;
      detail.earlyRefund = t.refund;
      detail.earlyTaxOnGains = t.taxOnGains;
      detail.earlyTaxOnEmployerDeposits = t.taxOnDeposits;
      if (surtax > 0) tally.flag("G-21");
      tally.flag("G-27");
      formulas.push("F-47");
    } else if (excess.deposits.length > 0) {
      const step = unlessBlocked(() => {
        const rate = book.rate("TXH-11", "rate");
        if (book.fact("TXH-11", "real_base") !== true) throw new BlockedError("TXH-11");
        return { flat: hishtalmutExitTax(excessReal, rate), full: exitTax(book, profile, T, excessReal, rate, false, 0, first) };
      });
      if (step.value) {
        // F-46 gives the flat 25%; F-42 and F-43 adjust it when they apply.
        taxAtExit = step.value.full.tax;
        detail.flatExcessTax = step.value.flat;
        if (step.value.full.settledByReturn) tally.flag("G-21");
      } else outcome = { code: "listed-not-ranked", reason: step.blocked };
    }
    detail.excessRealGain = excessReal;
    // With an employer split (S42) the own part is benefited up to TXH-08's share and the employer's up to TXH-01's limit.
    const split = hish?.employerMonthly;
    const benefitedPerMonth =
      split !== undefined && !employerMoney ? Math.min(benefitedMonthly, goal.monthly - split) + Math.min(split, employerLimit) : Math.min(benefitedMonthly, goal.monthly);
    detail.benefitedMonthly = benefitedPerMonth;
    detail.excessMonthly = Math.max(0, goal.monthly - benefitedPerMonth);
  }

  // F-30 (deduction) and F-52 (employer money above the limit): what the person got back, and what the
  // employer's excess cost at deposit, both at face value (the method subtracts them at the amounts paid).
  let employerDepositTax = 0;
  if (employerMoney || employerOverActive) {
    const brackets = book.brackets("TXG-02", "brackets");
    for (const x of employerExcessByYear.values()) employerDepositTax += deductionValue(brackets, 12 * salary + x, x);
    book.cite("TXH-03");
    book.label("reading", "TXG-35");
    detail.employerDepositTax = employerDepositTax;
    detail.employerSocial = employerSocial;
    formulas.push("F-52");
  }
  if (grossDeposits.some((d, m) => d !== C[m])) {
    detail.reliefTotal = reliefTotal;
    detail.deductionCap = deductionCap;
  }

  const result = tally.result(book, {
    exitMonth: T,
    nominal: gross - taxAtExit - employerDepositTax - employerSocial,
    index: I,
    taxAtExit,
    outcome,
    detail,
    formulas,
  });
  return { ...result, routed };
}
