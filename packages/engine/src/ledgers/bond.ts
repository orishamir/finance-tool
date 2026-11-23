// Government bonds held directly in a securities account (a security, not a wrapper: D6): F-25 with F-12 commissions, F-14
// custody, the account's F-17 monthly fee and the F-40 exit.
import { custodyFee, fixedFee, saleCommission, type Commission, type Custody } from "../formulas/fees.ts";
import { bondCoupon } from "../formulas/holding-tax.ts";
import { closesTaxYear, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { BlockedError, ruleBook } from "../resolver.ts";
import { acrossReadings } from "../open-readings.ts";
import { RUN_RESULT_FIELDS, type RunContext, type RunResult } from "../result.ts";
import { exitTax, maxRateTax, OrderCash, Tally, unlessBlocked, yearlySurtax, type Profile } from "./common.ts";
import { indexedCost, removeFifo, type Lot } from "./lots.ts";

export interface BondInput {
  goal: Goal;
  market: { inflation: number };
  bond: {
    /** A-23 annual coupon on face value; for a CPI-linked series, the real coupon. */
    coupon: number;
    linkage: "unlinked" | "cpi";
    /** Months between coupons, from the series data (GOV-11 yearly for CPI-linked; GOV-13 for fixed-rate). */
    couponEveryMonths: number;
  };
  /** The account's lines for bonds: F-12 commissions, F-14 custody, and its F-17 monthly fee in NIS (an account fee, on whatever it holds). */
  tariff: { buy?: Commission; sell?: Commission; custody?: Custody; monthlyFee?: number };
  profile: Profile;
}

/**
 * F-25 Government bond. The coupon is taxed when paid: 15% of an unlinked coupon (TXI-15); 25% of the whole
 * indexed coupon of a CPI-linked series, even when the index fell (TXI-14, TXI-25). Net coupons are
 * reinvested in the same bond as a new lot; the coupon on the exit day is paid out. At the horizon the
 * bond is sold at par (indexed for a linked series): A-27 is 0. A purchase its cash cannot pay opens no lot: the cash waits in the account,
 * earning nothing, for the next purchase, pays the account's monthly fee the units cannot (F-17), and at the horizon is part of what is
 * left (F-12, F-25).
 */
export function runBond(input: BondInput, ctx: RunContext): RunResult {
  return acrossReadings(ctx, (c) => runBondUnder(input, c), RUN_RESULT_FIELDS);
}

/** `runBond` under the readings `ctx` holds (method §13). */
function runBondUnder(input: BondInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx, { inflation: input.market.inflation });
  const { goal, bond, tariff, profile } = input;
  const T = goal.months;
  const first = goal.firstMonth ?? 1;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const linked = bond.linkage === "cpi";
  // G-41: a coupon below zero is interest below zero, whose tax the rule base holds no rule for (TXI OQ20): the run stops on the coupon's rule
  // rather than tax it at a negative amount
  if (bond.coupon < 0) throw new BlockedError(linked ? "TXI-14" : "TXI-15", undefined, "G-41");
  const couponRate = linked ? book.rate("TXI-14", "rate") : book.rate("TXI-15", "rate");
  if (linked) {
    book.cite("TXI-05");
    book.cite("TXI-25");
  } else book.cite("TXI-03");
  book.cite("TXS-06");
  const tally = new Tally();
  // Buying between coupon dates pays accrued interest, which the method does not model (G-10).
  if (goal.monthly > 0) tally.flag("G-10");

  // Units are 100-NIS face amounts at the issue index; price per unit is 100 × I_m for a linked series.
  const price = (m: number) => (linked ? I[m]! : 1);
  let lots: Lot[] = [];
  const orders = new OrderCash(tariff.buy, { fxRate: 1 });
  const buy = (cash: number, m: number, eventIndex: number) => {
    const { trade, commission } = orders.buy(cash);
    // an order its cash cannot pay is not placed: the cash waits for the next one (F-12, F-25)
    if (!(trade > 0)) return;
    tally.fee("trade", commission);
    lots.push({ units: trade / price(m), basis: trade, index: eventIndex });
  };

  const detail: Record<string, number> = {};
  let couponCount = 0;
  let exitYearFees = 0;
  let couponsThisYear = 0;
  let withheldThisYear = 0;
  let exitYearCoupons = 0;
  let couponCashAtExit = 0;
  tally.point(0, 1, 0);

  for (let m = 1; m <= T; m++) {
    if (m === 1 && C[0]! > 0) buy(C[0]!, 0, I[0]!);
    if (C[m]! > 0) buy(C[m]!, m, I[m]!);
    tally.paidIn += (m === 1 ? C[0]! : 0) + C[m]!;

    if (m % bond.couponEveryMonths === 0) {
      const face = lots.reduce((s, l) => s + l.units, 0);
      const coupon = bondCoupon((bond.coupon * bond.couponEveryMonths) / 12, face, price(m));
      const tax = couponRate * coupon;
      detail[`coupon${++couponCount}`] = coupon;
      couponsThisYear += coupon;
      withheldThisYear += tax;
      tally.taxDuring += tax;
      if (m < T) buy(coupon - tax, m, I[m]!);
      else couponCashAtExit = coupon - tax;
    }

    // F-14 and F-17: custody on the bond held and the account's monthly fee, paid by removing units oldest first. The account's fee is owed
    // whether or not a unit is held: where the units cannot pay it, the cash waiting for the next order pays the rest, and what neither can
    // pay is not charged (F-17, as the securities run does).
    const value = lots.reduce((s, l) => s + l.units, 0) * price(m);
    const fee = custodyFee(tariff.custody, m, value);
    const fixed = fixedFee(tariff.monthlyFee, value - fee + orders.waiting);
    // the units pay first; the waiting cash pays only what they cannot
    const fromLots = fee + fixed - orders.pay(fixed - Math.max(0, value - fee));
    if (fee + fixed > 0) {
      if (fromLots > 0) lots = removeFifo(lots, fromLots / price(m));
      tally.fee("custody", fee);
      tally.fee("fixed", fixed);
      if (taxYearOf(m, first) === taxYearOf(T, first)) exitYearFees += fee + fixed;
    }
    if (closesTaxYear(m, T, first)) {
      // A linked coupon is a "maximum rate" item: at 60 or over the brackets apply, settled through the
      // return (F-42, TXI-19); an unlinked coupon keeps its fixed 15% (TXG-08 case (c)).
      if (linked) {
        const owed = maxRateTax(book, profile, m, couponsThisYear, couponRate, first);
        if (owed.atBrackets) {
          tally.flag("G-21");
          const refund = profile.refundClaimed === false ? 0 : withheldThisYear - owed.tax;
          tally.taxDuring -= refund;
          if (m < T) buy(refund, m, I[m]!);
          else couponCashAtExit += refund;
        }
      }
      tally.taxDuring += yearlySurtax(book, profile, couponsThisYear, taxYearOf(m, first));
      if (m === T) exitYearCoupons = couponsThisYear;
      couponsThisYear = withheldThisYear = 0;
    }
    tally.point(m, I[m]!, lots.reduce((s, l) => s + l.units, 0) * price(m) + orders.waiting);
  }

  // F-09 exit: consideration is the gross sale value; the exit-year custody fees are deducted once (TXS-06).
  const units = lots.reduce((s, l) => s + l.units, 0);
  const gross = units * price(T);
  const commission = saleCommission(tariff.sell, gross, { fxRate: 1 });
  tally.fee("trade", commission);
  // A CPI-linked bond is a real-basis security: each lot indexed by I_T / I_lot, and when the CPI fell its
  // inflationary amount is zero and the part of a nominal loss equal to the fall is not allowable (TXS-02; F-09). The exit
  // year's fees come off after that cap (TXS-06); whether they sit inside the nominal loss the cap limits is an open reading (G-07).
  const adjusted = linked ? indexedCost(lots, I[T]!, price(T)) : undefined;
  const gain = adjusted
    ? gross - adjusted.indexed - exitYearFees + adjusted.fallDisallowed
    : gross - lots.reduce((s, l) => s + l.basis, 0) - exitYearFees;
  if (adjusted) book.cite("TXS-02");
  // a run in which every order waited holds no bond at T: nothing is sold, so no gain, no loss and no exit tax
  const sells = lots.length > 0;
  if (sells && gain < 0) tally.flag("G-07");
  if (sells) tally.flag("G-20");
  const exit = !sells ? undefined : unlessBlocked(() =>
    linked
      ? exitTax(book, profile, T, gain, book.rate("TXI-14", "rate"), false, exitYearCoupons, first)
      : exitTax(book, profile, T, gain, book.rate("TXI-12", "rate"), true, exitYearCoupons, first),
  );
  if (!linked) book.cite("TXS-03");
  if (exit?.value?.settledByReturn) tally.flag("G-21");
  const taxAtExit = exit?.value?.tax ?? 0;

  return tally.result(book, {
    exitMonth: T,
    // the cash of orders not placed is part of what is left, and no gain (F-25)
    nominal: gross - commission - taxAtExit + couponCashAtExit + orders.waiting,
    index: I,
    taxAtExit,
    outcome: exit?.outcome,
    detail: { ...detail, gain, exitYearFees },
    formulas: ["F-25", "F-12", "F-14", ...(tariff.monthlyFee ? ["F-17"] : []), "F-09", "F-40"],
  });
}
