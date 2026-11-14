// Makam held directly in a securities account (a security, not a wrapper: D6), bought at issue and rolled: F-24, with F-12
// commissions, F-14 custody where the account's member may charge it, and the F-40 exit for a sale before redemption.
import { buyWithCash, custodyFee, fixedFee, tradeCommission, type Commission, type Custody } from "../formulas/fees.ts";
import { makamPrice } from "../formulas/holding-tax.ts";
import { closesTaxYear, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import { acrossReadings } from "../open-readings.ts";
import type { Outcome, RunContext, RunResult } from "../result.ts";
import { exitTax, Tally, unlessBlocked, yearlySurtax, type Profile } from "./common.ts";

export interface MakamInput {
  goal: Goal;
  market: { inflation: number };
  /** A-22 yield to redemption; series term in months (12 for the yearly series, GOV-22, GOV-23). */
  makam: { yield: number; termMonths?: number };
  /**
   * Buy and sell lines for makam (F-12). `redeem` is the tariff's own line for a redemption where it names one (F-24); with
   * none, a redemption costs nothing. The custody line, if the tariff has one for makam (F-14), and the account's F-17 monthly fee in NIS,
   * which the account charges whatever it holds.
   */
  tariff: { buy?: Commission; sell?: Commission; redeem?: Commission; custody?: Custody; monthlyFee?: number };
  /**
   * F-14: a bank may not charge custody on makam (BRK-17, BANK-18); no rule limits a non-bank member's custody fee on
   * it (BRK-52), so there the tariff's custody line applies. Default `bank`, the case P-05's tariff (a bank's) is.
   */
  memberKind?: "bank" | "non-bank";
  profile?: Profile;
}

interface Series {
  face: number;
  cost: number;
  maturity: number;
}

const DAYS = 365;

/**
 * F-24 Makam, rolled yearly. Each amount buys a new series at issue at `p = 100 / (1 + y)^(N/365)`; at
 * redemption the discount is interest taxed at TXI-11's rate and the net proceeds buy the next series. A
 * series still open at the horizon is sold at the price implied by the unchanged yield, its gain taxed as a
 * capital gain on an unlinked asset (TXI-12). A redemption pays the tariff's redemption line, once a month on the face value redeemed that
 * month: amounts with one maturity are one series, so one redemption. It comes out of the proceeds and does not reduce the taxed discount (G-20).
 * Custody and the account's monthly fee are paid by selling a slice of each series held: each slice is a sale before redemption, so its
 * own gain is a capital gain of its tax year (TXI-12), and that year's custody and account fees come off that year's capital gains (TXS-06).
 */
export function runMakam(input: MakamInput, ctx: RunContext): RunResult {
  return acrossReadings(ctx, (c) => runMakamUnder(input, c));
}

/** `runMakam` under the readings `ctx` holds (method §13). */
function runMakamUnder(input: MakamInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx, { inflation: input.market.inflation });
  const { goal, makam, tariff } = input;
  const profile = input.profile ?? {};
  const term = makam.termMonths ?? 12;
  const T = goal.months;
  const first = goal.firstMonth ?? 1;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const discountRate = book.rate("TXI-11", "rate");
  const custodyFree = input.memberKind !== "non-bank";
  if (custodyFree) book.cite("BRK-17");
  else if (tariff.custody) book.cite("BRK-52");
  const custodyLine = custodyFree ? undefined : tariff.custody;
  const tally = new Tally();
  tally.flag("G-09");

  const price = (monthsLeft: number) => makamPrice(makam.yield, (DAYS * monthsLeft) / 12);
  const buy = (cash: number, maturity: number): Series => {
    const { trade, commission } = buyWithCash(cash, tariff.buy, { fxRate: 1 });
    tally.fee("trade", commission);
    // The purchase commission does not reduce the taxed discount or gain (G-20).
    if (commission > 0) tally.flag("G-20");
    return { face: (trade / price(term)) * 100, cost: trade, maturity };
  };

  let held: Series[] = [];
  let cashAtExit = 0;
  let taxAtExit = 0;
  let saleGain = 0;
  let interestThisYear = 0;
  let exitYearInterest = 0;
  let exitYearFees = 0;
  let taxedGain = 0;
  let taxedDiscount = 0;
  // capital gains realised on the slices sold to pay custody and the account's fee, and those fees, by tax year (TXI-12, TXS-06)
  const sliceGainByYear = new Map<number, number>();
  const feesByYear = new Map<number, number>();
  const add = (m: Map<number, number>, year: number, v: number) => m.set(year, (m.get(year) ?? 0) + v);
  let blocked: Outcome | undefined;
  tally.point(0, 1, 0);

  for (let m = 1; m <= T; m++) {
    const cash = (m === 1 ? C[0]! : 0) + C[m]!;
    tally.paidIn += cash;
    if (cash > 0) held.push(buy(cash, m + term - 1));

    const redeemed = held.filter((s) => s.maturity === m);
    held = held.filter((s) => s.maturity !== m);
    let proceeds = 0;
    for (const s of redeemed) {
      const tax = discountRate * (s.face - s.cost);
      interestThisYear += s.face - s.cost;
      taxedDiscount += s.face - s.cost;
      tally.taxDuring += tax;
      proceeds += s.face - tax;
    }
    if (redeemed.length > 0) {
      const face = redeemed.reduce((sum, s) => sum + s.face, 0);
      const commission = Math.min(proceeds, tradeCommission(tariff.redeem, face, { fxRate: 1 }));
      tally.fee("trade", commission);
      if (commission > 0) tally.flag("G-20");
      proceeds -= commission;
    }
    // before the horizon the net proceeds buy the next series at once, so a redemption month holds paper when custody is counted
    if (m < T && proceeds > 0) {
      held.push(buy(proceeds, m + term));
      proceeds = 0;
    }
    // F-14 and F-17: a custody fee and the account's monthly fee on the series held at the month's price, paid by selling a slice of each.
    // A slice is a sale before redemption: its own gain is a capital gain of the month's tax year (TXI-12), and the year's custody and
    // account fees come off that year's capital gains (TXS-06), the exit year's off the sale gain with it, once.
    const heldValue = held.reduce((v, s) => v + (s.face * price(Math.max(0, s.maturity - m))) / 100, 0);
    const fee = custodyFee(custodyLine, m, heldValue);
    const fixed = fixedFee(tariff.monthlyFee, heldValue - fee);
    if (fee + fixed > 0 && heldValue > 0) {
      const sold = (fee + fixed) / heldValue;
      const heldCost = held.reduce((c, s) => c + s.cost, 0);
      held = held.map((s) => ({ ...s, face: s.face * (1 - sold), cost: s.cost * (1 - sold) }));
      tally.fee("custody", fee);
      tally.fee("fixed", fixed);
      const year = taxYearOf(m, first);
      add(sliceGainByYear, year, sold * (heldValue - heldCost));
      add(feesByYear, year, fee + fixed);
      if (year === taxYearOf(T, first)) exitYearFees += fee + fixed;
    }
    if (closesTaxYear(m, T, first)) {
      tally.taxDuring += yearlySurtax(book, profile, interestThisYear, taxYearOf(m, first));
      if (m === T) exitYearInterest = interestThisYear;
      interestThisYear = 0;
    }
    if (m === T) {
      cashAtExit += proceeds;
      for (const s of held) {
        const gross = (s.face * price(s.maturity - T)) / 100;
        const commission = tradeCommission(tariff.sell, gross, { fxRate: 1 });
        tally.fee("trade", commission);
        saleGain += gross - s.cost;
        cashAtExit += gross - commission;
      }
      if (held.length > 0) {
        if (exitYearFees > 0) book.cite("TXS-06");
        taxedGain = saleGain + (sliceGainByYear.get(taxYearOf(T, first)) ?? 0) - exitYearFees;
        const exit = unlessBlocked(() => exitTax(book, profile, T, taxedGain, book.rate("TXI-12", "rate"), true, exitYearInterest, first));
        taxAtExit = exit.value?.tax ?? 0;
        blocked = exit.outcome;
      }
    }
    const value = held.reduce((v, s) => v + (s.face * price(Math.max(0, s.maturity - m))) / 100, 0);
    tally.point(m, I[m]!, m < T ? value : cashAtExit);
  }

  // A year with no sale owes nothing on its slices: a slice's gain is less than its value, which is the fee it pays, so the year's fees
  // always cover its slices' gains. `deductedFees` is what the fees took off capital gains, year by year, at most each year's gains: with
  // the taxed base it adds up to every capital gain of the run (the sale's and the slices').
  const exitYear = taxYearOf(T, first);
  let deductedFees = 0;
  let sliceGain = 0;
  for (const [year, g] of sliceGainByYear) {
    sliceGain += g;
    const gains = g + (year === exitYear && held.length > 0 ? saleGain : 0);
    deductedFees += Math.min(feesByYear.get(year) ?? 0, Math.max(0, gains));
  }
  // the figures rest on these rules whenever a slice was sold, a sale or not
  if (sliceGain > 0) book.cite("TXI-12");
  if (deductedFees > 0) book.cite("TXS-06");

  return tally.result(book, {
    exitMonth: T,
    nominal: cashAtExit - taxAtExit,
    index: I,
    taxAtExit,
    outcome: blocked,
    // what a reader needs to redo the tax: the sale's gain and the exit year's slice gains less that year's custody and account fees (TXS-06),
    // and every discount taxed at a redemption (TXI-11); commissions reduce neither (G-20)
    detail: { saleGain, sliceGain, exitYearSliceGain: sliceGainByYear.get(exitYear) ?? 0, exitYearFees: held.length > 0 ? exitYearFees : 0, deductedFees, taxedGain, taxedDiscount },
    formulas: ["F-24", "F-12", ...(custodyLine ? ["F-14"] : []), ...(tariff.monthlyFee ? ["F-17"] : []), "F-40"],
  });
}
