// Provident-family wrappers without a deposit-side tax effect: kupat gemel lehashkaa and the own-money
// part of a keren hishtalmut. F-08 with no trade (F-27), F-11, F-15, F-16, the section 8 ceiling and lock,
// and the exits F-44 and F-46.
import { balanceFee, depositFee, feeForMonth, type Discount } from "../formulas/fees.ts";
import { hishtalmutExitTax, kglExitTax } from "../formulas/exit-tax.ts";
import { annualToMonthly, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { BlockedError, ruleBook } from "../resolver.ts";
import type { Outcome, RunContext, RunResult } from "../result.ts";
import { exitTax, reachesAgeInYear, surtaxOn, Tally, unlessBlocked, type Profile } from "./common.ts";

export interface ProvidentInput {
  wrapper: "kupat-gemel-lehashkaa" | "keren-hishtalmut";
  goal: Goal;
  market: { grossReturn: number; inflation: number };
  /** Fee rates as fractions: deposit fee (F-11), balance fee (F-15), direct expenses (A-18), discount (A-19). */
  fees: { deposit: number; balance: number; direct: number; discount?: Discount };
  /** A-12 for a study fund: employment, salary, and the month the 6-year clock started (KH-11). */
  hishtalmut?: { employment: "employee" | "self-employed"; monthlySalary?: number; clockStartMonth: number };
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
  // TXH-08: an employee's benefited deposit is a share of each month's determining salary; a
  // self-employed person's is a yearly amount.
  let benefitedMonthly = Infinity;
  let benefitedYearly = Infinity;
  if (!kgl) {
    const h = input.hishtalmut!;
    const lockMonth = h.clockStartMonth + 12 * book.amount("TXH-09", "lock_years");
    if (lockMonth > goal.months) {
      exitMonth = lockMonth;
      outcome = { code: "listed-not-ranked", reason: "B3", untilMonth: lockMonth };
    }
    if (h.employment === "employee") {
      const determining = Math.min(h.monthlySalary ?? 0, book.amount("TXH-02", "determining_salary_cap"));
      benefitedMonthly = book.rate("TXH-08", "own_benefited_pct") * determining;
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
  const benefited: Pot = { balance: 0, deposits: [] };
  const excess: Pot = { balance: 0, deposits: [] };
  const routed: { month: number; amount: number }[] = [];
  let yearTotal = 0;
  let benefitedLeft = benefitedYearly;
  let discountExtended = false;
  tally.point(0, 1, 0);

  const deposit = (amount: number, eventMonth: number) => {
    if (amount <= 0) return;
    let accepted = amount;
    if (kgl) {
      accepted = Math.min(amount, Math.max(0, ceiling - yearTotal));
      yearTotal += accepted;
      if (accepted < amount) routed.push({ month: eventMonth, amount: amount - accepted });
    }
    tally.paidIn += accepted;
    const fee = depositFee(fees.deposit, depositCap, accepted);
    tally.fee("deposit", fee);
    const net = accepted - fee;
    const inBenefit = Math.min(net, benefitedMonthly, benefitedLeft);
    benefitedLeft -= inBenefit;
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
    if (m === 1) deposit(C[0]!, 0);
    if (m <= goal.months) deposit(C[m]!, m);

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
    // F-44: 25% of the real gain (TXK-07, institution), with the 15%-of-nominal line (TXK-06) beside it.
    book.cite("TXK-05");
    const realRate = book.rate("TXK-07", "rate");
    const nominalRate = book.rate("TXK-06", "nominal_rate");
    const real = realGain(benefited);
    const t = kglExitTax(real, nominalGain(benefited), realRate, nominalRate);
    // The age-60 reduction is open for this deemed interest (TXK OQ12): not applied, and flagged.
    if (reachesAgeInYear(profile, T, book.amount("TXG-04", "age"), first)) tally.flag("TXK-OQ12");
    const s = surtaxOn(book, profile, real);
    taxAtExit = t.tax + s.general + s.onCapital;
    detail.realGain = real;
    detail.altTaxAtExit = t.alternative;
    detail.altNominal = gross - t.alternative;
    detail.altReal = (gross - t.alternative) / I[T]!;
    tally.flag("G-11");
    tally.flag("G-02");
  } else {
    // F-46: benefited money is exempt (TXH-09); gains on the excess are taxed at 25% of their real gain
    // (TXH-11; the real base rests on two managers' statements, institution).
    const excessReal = realGain(excess);
    taxAtExit = 0;
    if (excess.deposits.length > 0) {
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
    detail.benefitedMonthly = Math.min(benefitedMonthly, goal.monthly);
    detail.excessMonthly = Math.max(0, goal.monthly - benefitedMonthly);
  }

  const result = tally.result(book, {
    exitMonth: T,
    nominal: gross - taxAtExit,
    index: I,
    taxAtExit,
    outcome,
    detail,
    formulas,
  });
  return { ...result, routed };
}
