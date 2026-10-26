// Funds and ETFs held as securities: the F-08 month step and the F-09 exit, with F-10 drag, F-12 to F-14
// and F-17 costs, F-20 distributions, F-23 money-market funds and F-40 to F-43 exit tax. Also the
// brokerage account inside an IRA hishtalmut (F-51).
import { buyWithCash, custodyFee, fixedFee, fxFee, navBought, tradeCommission, type Commission, type Custody } from "../formulas/fees.ts";
import { distributionTax } from "../formulas/holding-tax.ts";
import { annualToMonthly, closesTaxYear, contributions, cpiPath, fxPath, taxYearOf, type Goal } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import type { Outcome, RunContext, RunResult } from "../result.ts";
import { exitTax, Tally, unlessBlocked, yearlySurtax, type Profile } from "./common.ts";
import { indexedCost, removeFifo, totalUnits, type Lot } from "./lots.ts";

export interface Fund {
  /**
   * Israeli exempt fund (tracking fund, ETF), the two money-market fund types (F-23), a taxable shekel
   * money-market fund (F-20, TXS-12(b)), a foreign fund registered on TASE, or a foreign-domiciled fund.
   */
  kind:
    | "israeli-fund"
    | "money-market-daily"
    | "money-market-renewable"
    | "money-market-taxable"
    | "tase-foreign-fund"
    | "foreign-fund";
  /** F-10 drag, annual fractions: A-06 fixed fee, A-09 variable fee, trustee, A-07 tracking, A-11 withholding. */
  drag?: { management?: number; variable?: number; trustee?: number; tracking?: number; foreignWithholding?: number };
  /** A-08 half-spread on exchange trades. */
  halfSpread?: number;
  /** A-10 distribution yield and payments a year; none for an accumulating fund. */
  distribution?: { yield: number; perYear: number };
  /** Domicile of a foreign-domiciled fund: decides the foreign withholding on distributions (F-20). */
  domicile?: "us" | "ireland";
  /** W-8BEN on file with the US payer (TXF-13). */
  w8ben?: boolean;
  /** Share price in the instrument's currency at the start, for per-share fees and the share count. */
  sharePrice?: number;
  /** TASE foreign fund: the prospectus commits to the 90% main-currency test (TXF-04). */
  ninetyPercentTest?: boolean;
  /** Renewable money-market fund: months between fixed dates (MF-35). */
  fixedDatesEveryMonths?: number;
}

export interface SecuritiesInput {
  goal: Goal;
  market: {
    /** A-01 gross return of the exposure, effective annual; A-20 for a daily money-market fund, A-24 for a renewable one. */
    grossReturn: number;
    /** Whether A-01 is in shekels (default) or in the instrument's currency, to which A-03 is then added. */
    returnIn?: "nis" | "instrument";
    inflation: number;
    /** A-03 exchange-rate change of the instrument currency against the shekel. */
    fxChange?: number;
  };
  fund: Fund;
  tariff: {
    buy?: Commission;
    sell?: Commission;
    custody?: Custody;
    /** F-17 monthly account fee in NIS. */
    monthlyFee?: number;
    /**
     * F-13 FX conversion on each order and at exit: a bare number is the percentage with no bounds (kept for
     * callers that pass one); the `Commission` shape adds the tariff's minimum and maximum, in the instrument's
     * currency (`in: "instrument"`), converted at the rate of the trade.
     */
    fx?: number | Commission;
    /** The instrument's currency, for tariff lines set in it: code and NIS per unit at the start. */
    currency?: { code: string; startRate: number };
  };
  /** Where the account is: an Israeli bank or member withholds; a foreign broker does not (TXF-21, TXF-22). */
  broker?: "israeli" | "foreign";
  /**
   * F-14 (2026-10-26): whether an Israeli account is at a bank or at a TASE member that is not a bank. A bank may not charge
   * custody on money-market fund units (BRK-17, BANK-18); no rule limits a non-bank member's custody fee on them, so there the
   * tariff's line applies (BRK OQ11 closed: the distribution-fee regulations leave out an investment marketer, MF-26). Default
   * `bank`, the case every money-market guide and comparison assumes.
   */
  memberKind?: "bank" | "non-bank";
  /** F-51: the account is held inside an IRA hishtalmut, with the manager's balance fee. */
  wrapper?: { kind: "ira-hishtalmut"; managerFee: number; clockStartMonth: number };
  /**
   * A-28 behaviour: orders a month. Each month's contribution is split into this many equal orders, each charged
   * its own commission, so a minimum bites per order (F-12, F-63). Default 1, as A-28 sets. The amount now is one order.
   */
  ordersPerMonth?: number;
  /**
   * Months of the calendar grid that passed before this run's month 0 (F-66: the second leg of a switch starts
   * at month s of the first). Only the periodic fee phase (F-14) and the tax-year calendar read it; the CPI and
   * exchange-rate paths still start at 1, so the caller converts the real value (F-06) with the absolute index.
   */
  gridOffset?: number;
  /**
   * F-66: a real capital loss realised earlier in the same account (the sale at the switch), in nominal NIS. At exit
   * it offsets this run's real gain before tax, never more than the gain: in the same tax year under TXS-17 (the
   * institution nets inside itself, TXS-19), in a later year as a carried loss under TXS-18, which needs a return
   * filed for the year of the loss (flagged). The unused part is reported in `detail.lossUnused`.
   */
  carriedLoss?: { amount: number; ruleIds: readonly string[]; carriedForward: boolean };
  profile: Profile;
}

/** The run cannot be done for this input; the comparison shows "not evaluated" with the gap. */
export class NotEvaluatedError extends Error {
  constructor(readonly gap: string) {
    super(`not evaluated (${gap})`);
  }
}

/**
 * F-14 (2026-10-26): a provider class as `memberKind`. Only a bank is a bank: a broker (a TASE member that is not a bank)
 * and a foreign broker are not bound by the banks' custody ban on money-market units (BRK-17, BANK-18; BRK-52), so their
 * tariff's custody line applies. Every caller that prices a run on a provider's snapshot passes this.
 */
export const memberKindOf = (providerClass: string): NonNullable<SecuritiesInput["memberKind"]> => (providerClass === "bank" ? "bank" : "non-bank");

/**
 * F-08 Month step for fund units. Each contribution is one order: FX fee, then trade value plus commission;
 * bought at the ask, so the lot's cost is the price paid. Distributions are taxed and the net reinvested as
 * a new lot; custody and account fees are paid by removing units oldest first.
 * F-09 Exit at T. Sold at the bid; the real gain over the lots is taxed, less the exit year's custody and
 * account fees (TXS-06); commissions and FX fees are not in the basis (G-20).
 * F-10 Gross growth less drag: units grow at `g − δ/12`, δ the fund's own annual costs.
 * F-23 Money-market fund: daily (g = A-20, labelled proxy, MF-34) or renewable (g = A-24 net of fees,
 * exit on the last fixed date, MF-35, MF-37).
 * F-51 IRA: an IRA hishtalmut holding securities pays the manager's balance fee and follows F-46 at exit.
 */
export function runSecurities(input: SecuritiesInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx);
  const { goal, market, fund, tariff, profile } = input;
  const tally = new Tally();
  const formulas = ["F-08", "F-09", "F-10", "F-12", "F-13", "F-14", "F-40"];

  const isMmf = fund.kind.startsWith("money-market");
  const isForeign = fund.kind === "foreign-fund" || fund.kind === "tase-foreign-fund";
  const atForeignBroker = input.broker === "foreign";

  // F-23: a renewable fund can be left only on its fixed dates; the exit is the last one at or before T.
  // F-51: inside an IRA hishtalmut a horizon before the lock moves the exit to the lock (B3, D16).
  let exitMonth = goal.months;
  let lockMonth: number | undefined;
  if (input.wrapper) {
    lockMonth = input.wrapper.clockStartMonth + 12 * book.amount("TXH-09", "lock_years");
    exitMonth = Math.max(exitMonth, lockMonth);
  }
  if (fund.kind === "money-market-renewable") {
    if (goal.monthly > 0) throw new NotEvaluatedError("G-30");
    const every = fund.fixedDatesEveryMonths ?? 1;
    exitMonth = Math.floor(goal.months / every) * every;
    book.cite("MF-35");
    book.cite("MF-37");
  }
  if (fund.kind === "money-market-daily") book.label("proxy", "MF-34");
  if (isMmf) {
    formulas.push("F-23");
    book.cite("MF-26");
    book.cite("BRK-17");
  }

  const T = exitMonth;
  const offset = input.gridOffset ?? 0;
  const first = ((goal.firstMonth ?? 1) - 1 + offset) % 12 + 1;
  const orders = input.ordersPerMonth ?? 1;
  if (!Number.isInteger(orders) || orders < 1) throw new RangeError(`ordersPerMonth ${orders} must be a whole number of 1 or more (A-28)`);
  if (!Number.isInteger(offset) || offset < 0) throw new RangeError(`gridOffset ${offset} must be a whole number of months, 0 or more`);
  const I = cpiPath(market.inflation, T);
  const X = fxPath(market.fxChange ?? 0, T);
  const C = contributions(goal, I);
  // The tax index: the exchange rate for a foreign-currency security (TXF-03; on TASE when the 90% test
  // holds, TXF-04), the CPI otherwise.
  const fxIndexed = fund.kind === "foreign-fund" || (fund.kind === "tase-foreign-fund" && fund.ninetyPercentTest === true);
  const J = fxIndexed ? X : I;
  if (fund.kind === "foreign-fund") book.cite("TXF-03");
  if (fxIndexed && fund.kind === "tase-foreign-fund") book.rate("TXF-04", "threshold_pct");

  const annual = market.returnIn === "instrument" ? (1 + market.grossReturn) * (1 + (market.fxChange ?? 0)) - 1 : market.grossReturn;
  const g = annualToMonthly(annual);
  const d = fund.drag ?? {};
  const delta = (d.management ?? 0) + (d.variable ?? 0) + (d.trustee ?? 0) + (d.tracking ?? 0) + (d.foreignWithholding ?? 0);
  const spread = fund.halfSpread ?? 0;
  if (spread > 0) book.cite("ETF-06");

  // F-20, taxable fund: the fund pays 15% of its nominal interest (TXS-12(b), derived); the holder pays nothing.
  let fundLevelRate = 0;
  if (fund.kind === "money-market-taxable") {
    fundLevelRate = book.rate("TXS-12", "taxable_fund_rate");
    book.label("derived", "TXS-12");
    book.cite("TXS-11");
    formulas.push("F-20");
  }

  const fxRate = (m: number) => (tariff.currency ? tariff.currency.startRate * X[m]! : 1);
  let nav = 1;
  const sharePrice = (m: number) => (fund.sharePrice ? (fund.sharePrice * nav) / X[m]! : undefined);
  let lots: Lot[] = [];

  /** One order: FX fee on a contribution, then trade value and commission, bought at the ask. */
  const buy = (cash: number, month: number, eventMonth: number, convert: boolean) => {
    const fx = convert && tariff.currency ? fxFee(tariff.fx, cash, { fxRate: fxRate(eventMonth) }) : 0;
    tally.fee("fx", fx);
    const { trade, commission } = buyWithCash(cash - fx, tariff.buy, { fxRate: fxRate(eventMonth), sharePrice: sharePrice(month) });
    tally.fee("trade", commission);
    const value = navBought(trade, spread);
    tally.fee("spread", trade - value);
    lots.push({ units: value / nav, basis: trade, index: J[eventMonth]! });
  };

  // F-20 distributions: Israeli rate, and the foreign withholding credited against it (TXF-17, TXF-18).
  let israeliDistRate = 0;
  let foreignWithholding = 0;
  if (fund.distribution) {
    formulas.push("F-20");
    if (fund.kind === "money-market-taxable") {
      // The holder of a taxable fund pays nothing on its distributions; the fund has paid (TXS-11).
    } else if (isForeign) {
      israeliDistRate = book.rate("TXF-08", "rate");
      book.cite("TXF-17");
      book.cite("TXF-18");
      if (fund.domicile === "us") {
        foreignWithholding = fund.w8ben ? book.rate("TXF-12", "us_withholding") : book.rate("TXF-13", "us_withholding_without_form");
      } else if (fund.domicile === "ireland") {
        // An Irish ETF's distribution reaches an Israeli resident without Irish tax: units in a recognised clearing
        // system, or a non-resident declaration (TXF-28; G-05 closed 2026-10-26), so the foreign withholding stays 0.
        book.cite("TXF-28");
      } else {
        // F-20 knows the foreign withholding of a US and an Irish fund only; the callers stop a distributing fund of any other
        // domicile before the run (instruments.server.ts, fund-variants.ts), so reaching here is a caller's error.
        throw new Error("F-20: a distributing foreign fund needs its domicile (us or ireland) for the foreign withholding");
      }
      if (atForeignBroker) tally.flag("TXF-21");
    } else {
      israeliDistRate = book.rate("TXS-10", "rate");
    }
  } else if (isForeign) {
    // An accumulating foreign fund is taxed only at sale under the TXF-11 reading (secondary): computed,
    // labelled, and listed, not ranked (F-65, G-18).
    book.label("secondary-source", "TXF-11");
  }
  // The dollar value is known only when the tariff gives the currency's rate.
  const estateThreshold = fund.domicile === "us" && tariff.currency ? book.amount("TXF-27", "estate_threshold", "USD") : undefined;

  const wrapperFee = input.wrapper ? Math.min(input.wrapper.managerFee, book.rate("PF-06", "balance_cap")) : 0;
  if (input.wrapper) formulas.push("F-51", "F-15", "F-46");
  // No custody fee on money-market fund units at a bank (BRK-17, BANK-18); at a non-bank member the tariff's custody line
  // applies as published (F-14; BRK-17 binds banks only, and MF-26 does not bind an investment marketer).
  const mmfFree = isMmf && input.memberKind !== "non-bank";
  if (mmfFree) book.cite("BANK-18");
  const custodyLine = mmfFree ? undefined : tariff.custody;

  let exitYearFees = 0;
  let foreignTax = 0;
  let israeliDistTax = 0;
  let fundLevelTax = 0;
  let distThisYear = 0;
  let exitYearDist = 0;
  tally.point(0, 1, 0);

  for (let m = 1; m <= T; m++) {
    // 1-2. Contributions at the start of the month, each its own order (A-28).
    if (m === 1 && C[0]! > 0) buy(C[0]!, m, 0, true);
    if (m <= goal.months && C[m]! > 0) for (let k = 0; k < orders; k++) buy(C[m]! / orders, m, m, true);
    tally.paidIn += (m === 1 ? C[0]! : 0) + (m <= goal.months ? C[m]! : 0);

    // 3. Growth less drag (F-10).
    const before = totalUnits(lots) * nav;
    tally.fee("fund", (before * delta) / 12);
    fundLevelTax += before * fundLevelRate * g;
    nav *= 1 + g - delta / 12 - fundLevelRate * g;

    // 4. Distributions (F-20): paid out of the fund's value; the net is reinvested as a new lot.
    if (fund.distribution && m % (12 / fund.distribution.perYear) === 0) {
      const share = fund.distribution.yield / fund.distribution.perYear;
      const dist = totalUnits(lots) * nav * share;
      nav *= 1 - share;
      const t = distributionTax(dist, israeliDistRate, foreignWithholding);
      foreignTax += t.foreign;
      israeliDistTax += t.israeli;
      tally.taxDuring += t.foreign + t.israeli;
      distThisYear += dist;
      buy(t.net, m, m, false);
    }

    // 5. Holding costs, paid by removing units oldest first (F-14, F-17, F-15 for the IRA manager).
    const manager = (wrapperFee / 12) * totalUnits(lots) * nav;
    const custody = custodyFee(custodyLine, m + offset, totalUnits(lots) * nav - manager);
    const fixed = fixedFee(tariff.monthlyFee, totalUnits(lots) * nav - manager - custody);
    if (custody + fixed + manager > 0) lots = removeFifo(lots, (custody + fixed + manager) / nav);
    tally.fee("custody", custody);
    tally.fee("fixed", fixed);
    tally.fee("manager", manager);
    if (taxYearOf(m, first) === taxYearOf(T, first)) exitYearFees += custody + fixed;

    if (closesTaxYear(m, T, first)) {
      if (distThisYear > 0) tally.taxDuring += yearlySurtax(book, profile, distThisYear);
      if (m === T) exitYearDist = distThisYear;
      distThisYear = 0;
    }
    if (estateThreshold !== undefined && (totalUnits(lots) * nav) / fxRate(m) > estateThreshold) tally.flag("TXF-27", m);
    tally.point(m, I[m]!, totalUnits(lots) * nav);
  }

  // F-09 exit: sold at the bid; commission and FX fee paid out of the proceeds; consideration is the gross
  // sale value (G-20); the exit year's custody and account fees are deducted from the gain once (TXS-06).
  const value = totalUnits(lots) * nav;
  const gross = value * (1 - spread);
  tally.fee("spread", value - gross);
  const commission = tradeCommission(tariff.sell, gross, { fxRate: fxRate(T), sharePrice: sharePrice(T) });
  tally.fee("trade", commission);
  const fx = tariff.currency ? fxFee(tariff.fx, gross - commission, { fxRate: fxRate(T) }) : 0;
  tally.fee("fx", fx);
  const proceeds = gross - commission - fx;

  const cost = lots.reduce((s, l) => s + l.basis, 0);
  // Each lot indexed by J_T / J_lot; when the index (CPI or exchange rate) fell, its inflationary amount is zero and
  // the part of a nominal loss equal to the fall is not allowable (TXS-02; method F-09, 2026-10-26). With the exchange
  // rate as the index, the rule that makes it the index is cited beside it: TXF-03 for a foreign-currency security held
  // directly, TXF-04 for a TASE foreign fund (TXF-03 itself says such a fund follows TXF-04). The exit year's fees are
  // deducted after the fall's cap (TXS-06); whether they sit inside the nominal loss the cap limits is an open reading (G-07).
  const adjusted = indexedCost(lots, J[T]!, nav * (1 - spread));
  const realGain = gross - adjusted.indexed - exitYearFees + adjusted.fallDisallowed;
  const nominalGain = gross - cost;
  book.cite("TXS-06");
  book.cite("TXS-02");
  if (adjusted.fell && fxIndexed) book.cite(fund.kind === "foreign-fund" ? "TXF-03" : "TXF-04");

  let outcome: Outcome = { code: "eligible" };
  let lossOffset = 0;
  let lossUnused = 0;
  let exit = { tax: 0, withheld: 0, refund: 0, capitalGainsTax: 0, surtax: 0, capitalSurtax: 0 };
  if (input.wrapper) {
    // F-51: an IRA hishtalmut follows the study fund's exit (TXK-17); after the lock everything from
    // benefited deposits is exempt (TXH-09). The account is taken as all benefited money; an excess above
    // TXH-08 would be taxed under TXH-11 and is not split out here.
    book.cite("TXK-17");
    if (lockMonth! > goal.months) outcome = { code: "listed-not-ranked", reason: "B3", untilMonth: lockMonth! };
  } else if (fund.kind === "money-market-taxable") {
    // The holder pays nothing at sale (TXS-11); the fund's tax is inside the price.
  } else {
    // F-66: a loss carried from an earlier leg offsets the real gain first (TXS-17, TXS-18); a loss is not a negative tax.
    const carried = input.carriedLoss;
    const offset = carried ? Math.min(Math.max(0, carried.amount), Math.max(0, realGain)) : 0;
    if (carried && carried.amount > 0) {
      carried.ruleIds.forEach((id) => book.cite(id));
      if (carried.carriedForward) tally.flag("TXS-18");
    }
    lossOffset = offset;
    lossUnused = carried ? Math.max(0, carried.amount) - offset : 0;
    const step = unlessBlocked(() => {
      const rate = isForeign ? book.rate("TXF-02", "rate") : isMmf ? book.rate("TXS-12", "rate") : book.rate("TXS-09", "rate");
      return exitTax(book, profile, T, realGain - offset, rate, false, exitYearDist, first);
    });
    if (step.value) {
      exit = step.value;
      if (step.value.settledByReturn) tally.flag("G-21");
    } else outcome = { code: "listed-not-ranked", reason: step.blocked };
    if (realGain < 0) tally.flag("G-07");
    tally.flag("G-20");
    if (isForeign && !fund.distribution && outcome.code === "eligible") outcome = { code: "listed-not-ranked", reason: "G-18" };
    if (atForeignBroker) tally.flag("TXF-21");
  }

  return tally.result(book, {
    exitMonth: T,
    nominal: proceeds - exit.tax,
    index: I,
    taxAtExit: exit.tax,
    outcome,
    detail: {
      realGain,
      nominalGain,
      fallDisallowed: adjusted.fallDisallowed,
      lossOffset,
      lossUnused,
      exitYearFees,
      withheld: exit.withheld,
      refund: exit.refund,
      capitalGainsTax: exit.capitalGainsTax,
      surtax: exit.surtax,
      capitalSurtax: exit.capitalSurtax,
      foreignTax,
      israeliTaxOnDistributions: israeliDistTax,
      fundLevelTax,
    },
    formulas,
  });
}
