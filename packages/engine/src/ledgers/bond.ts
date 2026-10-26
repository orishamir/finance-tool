// Government bonds held in a brokerage account: F-25 with F-12 commissions, F-14 custody and the F-40 exit.
import { buyWithCash, custodyFee, tradeCommission, type Commission, type Custody } from "../formulas/fees.ts";
import { bondCoupon } from "../formulas/holding-tax.ts";
import { closesTaxYear, contributions, cpiPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";
import { exitTax, maxRateTax, Tally, unlessBlocked, yearlySurtax, type Profile } from "./common.ts";
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
    /** A-27 price change at exit, as a fraction of par; default 0. */
    exitPriceChange?: number;
  };
  tariff: { buy?: Commission; sell?: Commission; custody?: Custody };
  profile: Profile;
}

/**
 * F-25 Government bond. The coupon is taxed when paid: 15% of an unlinked coupon (TXI-15); 25% of the whole
 * indexed coupon of a CPI-linked series, even when the index fell (TXI-14, TXI-25). Net coupons are
 * reinvested in the same bond as a new lot; the coupon on the exit day is paid out. At the horizon the
 * bond is sold at par (indexed for a linked series) plus A-27.
 */
export function runBond(input: BondInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx);
  const { goal, bond, tariff, profile } = input;
  const T = goal.months;
  const first = goal.firstMonth ?? 1;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const linked = bond.linkage === "cpi";
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
  const buy = (cash: number, m: number, eventIndex: number) => {
    const { trade, commission } = buyWithCash(cash, tariff.buy, { fxRate: 1 });
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

    const value = lots.reduce((s, l) => s + l.units, 0) * price(m);
    const fee = custodyFee(tariff.custody, m, value);
    if (fee > 0) {
      lots = removeFifo(lots, fee / price(m));
      tally.fee("custody", fee);
      if (taxYearOf(m, first) === taxYearOf(T, first)) exitYearFees += fee;
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
      tally.taxDuring += yearlySurtax(book, profile, couponsThisYear);
      if (m === T) exitYearCoupons = couponsThisYear;
      couponsThisYear = withheldThisYear = 0;
    }
    tally.point(m, I[m]!, lots.reduce((s, l) => s + l.units, 0) * price(m));
  }

  // F-09 exit: consideration is the gross sale value; the exit-year custody fees are deducted once (TXS-06).
  const units = lots.reduce((s, l) => s + l.units, 0);
  const gross = units * price(T) * (1 + (bond.exitPriceChange ?? 0));
  const commission = tradeCommission(tariff.sell, gross, { fxRate: 1 });
  tally.fee("trade", commission);
  // A CPI-linked bond is a real-basis security: each lot indexed by I_T / I_lot, and when the CPI fell its
  // inflationary amount is zero and the part of a nominal loss equal to the fall is not allowable (TXS-02; F-09). The exit
  // year's fees come off after that cap (TXS-06); whether they sit inside the nominal loss the cap limits is an open reading (G-07).
  const adjusted = linked ? indexedCost(lots, I[T]!, price(T) * (1 + (bond.exitPriceChange ?? 0))) : undefined;
  const gain = adjusted
    ? gross - adjusted.indexed - exitYearFees + adjusted.fallDisallowed
    : gross - lots.reduce((s, l) => s + l.basis, 0) - exitYearFees;
  if (adjusted) book.cite("TXS-02");
  if (gain < 0) tally.flag("G-07");
  tally.flag("G-20");
  const exit = unlessBlocked(() =>
    linked
      ? exitTax(book, profile, T, gain, book.rate("TXI-14", "rate"), false, exitYearCoupons, first)
      : exitTax(book, profile, T, gain, book.rate("TXI-12", "rate"), true, exitYearCoupons, first),
  );
  if (!linked) book.cite("TXS-03");
  if (exit.value?.settledByReturn) tally.flag("G-21");
  const taxAtExit = exit.value?.tax ?? 0;

  return tally.result(book, {
    exitMonth: T,
    nominal: gross - commission - taxAtExit + couponCashAtExit,
    index: I,
    taxAtExit,
    outcome: exit.blocked ? { code: "listed-not-ranked", reason: exit.blocked } : undefined,
    detail: { ...detail, gain, exitYearFees },
    formulas: ["F-25", "F-12", "F-14", "F-09", "F-40"],
  });
}
