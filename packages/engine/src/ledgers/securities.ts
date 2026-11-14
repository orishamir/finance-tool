// Funds and ETFs held as securities: the F-08 month step and the F-09 exit, with F-10 drag, F-12 to F-14
// and F-17 costs, F-20 distributions, F-23 money-market funds and F-40 to F-43 exit tax. Also the
// brokerage account inside an IRA hishtalmut (F-51).
import { buyWithCash, convertFor, corporateEventFee, currentAccountFee, custodyFee, fixedFee, fxFee, navBought, tradeCommission, type Commission, type Custody } from "../formulas/fees.ts";
import { irishFundUsWithholding } from "../formulas/fund-withholding.ts";
import { distributionTax } from "../formulas/holding-tax.ts";
import { annualToMonthly, closesTaxYear, contributions, cpiPath, fxPath, monthOfDate, taxYearOf, type Goal } from "../formulas/time.ts";
import { BlockedError, RecordInputError, ruleBook, type RuleBook } from "../resolver.ts";
import { acrossReadings } from "../open-readings.ts";
import { RUN_RESULT_FIELDS, type Outcome, type RunContext, type RunResult } from "../result.ts";
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
  drag?: {
    management?: number;
    variable?: number;
    trustee?: number;
    tracking?: number;
    foreignWithholding?: number;
    /**
     * A-11 by F-107, for an Irish fund that holds the index's US shares: their dividend yield and their share of the index, as fractions.
     * The run reads TXF-16's rate and adds the product to the drag; `foreignWithholding`, where the record holds one, replaces it.
     */
    usDividends?: { yield: number; weight: number };
  };
  /** A-08 half-spread on exchange trades. */
  halfSpread?: number;
  /** A-10 distribution yield and payments a year; none for an accumulating fund. */
  distribution?: { yield: number; perYear: number };
  /** Domicile of a foreign-domiciled fund: decides the foreign withholding on distributions (F-20). */
  domicile?: "us" | "ireland";
  /** W-8BEN on file with the US payer (TXF-13). */
  w8ben?: boolean;
  /** Share price at the start, for per-share fees and the share count: in the instrument's currency, or in `sharePriceCurrency` where given. */
  sharePrice?: number;
  /** F-109: the currency `sharePrice` is printed in (ISO code), where it is not the instrument's: a Tel Aviv line of a foreign fund takes its issuer's NAV in dollars. */
  sharePriceCurrency?: string;
  /** The instrument's currency per one unit of `sharePriceCurrency` at the start (the run's rate), where the two differ: the price is taken
   *  to the instrument's currency with it. Absent where it is needed, the run has no share price (a per-share fee then cannot be priced). */
  sharePriceRate?: number;
  /** TASE foreign fund: the prospectus commits to the 90% main-currency test (TXF-04); while TXF-04 is open the run stops whatever its value (F-04). */
  ninetyPercentTest?: boolean;
  /** Renewable money-market fund: months between fixed dates (MF-35). */
  fixedDatesEveryMonths?: number;
  /**
   * An accumulating foreign fund whose own Israeli prospectus annex reports a Tax Authority ruling naming a sale and a distribution as the
   * only taxed events (TXF-11): taxed at sale on that ruling, not on the reading by implication, and ranked rather than listed (G-18).
   */
  saleOnlyRuling?: boolean;
}

/** The lines of a securities account's price list that the run charges (F-12 to F-14, F-17). */
export type SecuritiesTariff = {
  buy?: Commission;
  /** F-12: the price of a monthly purchase by standing order, where the tariff prints one; `buy` otherwise. */
  buyStanding?: Commission;
  sell?: Commission;
  /** F-24: the tariff's own line for a redemption, where it names one. Only the makam run reads it. */
  redeem?: Commission;
  custody?: Custody;
  /** F-17 monthly account fee in NIS. */
  monthlyFee?: number;
  /** F-102 (D64): the monthly minimum of the current account at a bank, NIS a month. Each month reads its own stretch's (F-101: a group exempt for a time). */
  currentAccount?: number;
  /**
   * F-103 (D67): a charge for each dividend of a fund bought abroad, in the instrument's currency (`currency` must be set). Read from the run's
   * first tariff, whatever its periods.
   */
  perDividend?: number;
  /**
   * F-13 FX conversion on each order and at exit: a bare number is the percentage with no bounds (kept for
   * callers that pass one); the `Commission` shape adds the tariff's minimum and maximum, in the instrument's
   * currency (`in: "instrument"`), converted at the rate of the trade.
   */
  fx?: number | Commission;
  /** F-13: the conversion of a monthly purchase on a recurring plan, where the tariff prints a price for one; `fx` otherwise, and always on a lump sum and at exit. */
  fxStanding?: number | Commission;
  /**
   * F-13 (D65): the conversion spread the price list limits, at its ceiling, a fraction of each conversion's amount. Its own field, so
   * that no conversion price replaces it unseen: it is charged on every conversion beside whichever conversion fee applies (a lump sum, a monthly
   * purchase on a standing order or a recurring plan, the sale), and a conversion price the person or a group sets leaves it in place.
   */
  fxSpread?: number;
  /** The instrument's currency, for tariff lines set in it: code and NIS per unit at the start. */
  currency?: { code: string; startRate: number };
  /**
   * F-12 (own account): the group or the person set the regular trade price over the house's standing-order price. A monthly purchase
   * may then be placed the regular way, and the order pays the cheaper whole order (see `buy` in the securities ledger). Unset, `buyStanding`
   * replaces `buy` for a monthly purchase as always.
   */
  cheaperOfStandingTrade?: boolean;
  /** F-13 (own account): the same for the conversion; set only where the group or the person set the regular conversion price. */
  cheaperOfStandingFx?: boolean;
};

/**
 * F-101 A sequence of tariffs. The tariff applies to the run's months 1 to `until.months`, `until.then` to the months after
 * them, and `then` may carry a period of its own (its `months` counted from the start of the run, not from the end of the one before).
 */
export type TariffSequence = SecuritiesTariff & { until?: { months: number; then: TariffSequence } };

/**
 * F-101: a period must end where a custody charge falls. A custody line charged every `n` months charges the quarter (or year) that ends in
 * the month, at that month's tariff, so a period ending between two charges would put the whole straddling period on the second tariff; the
 * engine refuses it rather than prorate (docs/method.md section 12). `gridOffset` shifts the charging phase only.
 */
export function checkTariffPeriods(tariff: TariffSequence, gridOffset = 0): void {
  let t = tariff;
  while (t.until) {
    const u = t.until.months;
    if (!Number.isInteger(u) || u < 0) throw new RecordInputError(`F-101: a period of ${u} months must be a whole number of months, 0 or more`);
    const next = t.until.then;
    for (const side of [t, next]) {
      const every = side.custody?.everyMonths;
      if (every && every > 1 && (u + gridOffset) % every !== 0) throw new RecordInputError(`F-101: a period of ${u} months ends between two custody charges (charged every ${every} months); a period must end where a charge falls`);
    }
    t = next;
  }
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
  /** F-101: the tariff, or a sequence of tariffs, each with the months it holds (see `TariffSequence`). `currency` is read from this first one only. */
  tariff: TariffSequence;
  /** Where the account is: an Israeli bank or member withholds; a foreign broker does not (TXF-21, TXF-22). */
  broker?: "israeli" | "foreign";
  /**
   * F-14: whether an Israeli account is at a bank or at a TASE member that is not a bank. A bank may not charge
   * custody on money-market fund units (BRK-17, BANK-18); no rule limits a non-bank member's custody fee on them, so there the
   * tariff's line applies (BRK-52: the distribution-fee regulations leave out an investment marketer, MF-26). Default
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
  /**
   * F-109 (D94): the fund is bought in whole units. `price` is one unit's price in shekels at the run's start (the fund record's
   * `share_price` at the run's exchange rate), moved with the fund's value as `sharePrice` is. Each order buys the most whole units its cash
   * pays for, fees included, at the ask; what is left waits in the account, earning nothing, and joins the next order. An order whose cash
   * buys no unit is not placed and pays nothing. `monthlyByAmount`: the monthly purchases are bought by amount (a house's recurring plan that
   * buys fractions), every other order in whole units. Absent: every order is bought by amount, as F-08 says.
   */
  wholeUnits?: { price: number; monthlyByAmount?: boolean };
  profile: Profile;
}

/** The run cannot be done for this input; the comparison shows "not evaluated" with the gap. */
export class NotEvaluatedError extends Error {
  constructor(readonly gap: string) {
    super(`not evaluated (${gap})`);
  }
}

/**
 * F-14: a provider class as `memberKind`. Only a bank is a bank: a broker (a TASE member that is not a bank)
 * and a foreign broker are not bound by the banks' custody ban on money-market units (BRK-17, BANK-18; BRK-52), so their
 * tariff's custody line applies. Every caller that prices a run on a provider's snapshot passes this.
 */
export const memberKindOf = (providerClass: string): NonNullable<SecuritiesInput["memberKind"]> => (providerClass === "bank" ? "bank" : "non-bank");

/**
 * F-04 The tax index of a fund held in a securities account: the exchange rate for a foreign-currency fund held directly (TXF-03),
 * the CPI for the rest. A TASE foreign fund takes the index TXF-04 states, and TXF-04 is open, so neither is known for it, with or
 * without its 90% test: the book stops on it (BlockedError) and the run computes nothing after tax (D10); F-118 reads its value before
 * the exit tax. Were TXF-04 settled as the letter's copy states it (the golden harness), a fund on the 90% test would take the exchange
 * rate and any other the CPI.
 */
export function taxIndexOf(fund: Pick<Fund, "kind" | "ninetyPercentTest">, book: RuleBook): "fx" | "cpi" {
  if (fund.kind === "foreign-fund") {
    book.cite("TXF-03");
    return "fx";
  }
  if (fund.kind !== "tase-foreign-fund") return "cpi";
  book.cite("TXF-04");
  if (fund.ninetyPercentTest !== true) return "cpi";
  book.rate("TXF-04", "threshold_pct");
  return "fx";
}

/**
 * The open rule a securities run of this fund stops on (F-04), or null: what a page reads to list the fund with its reason before
 * running it, so nothing is ranked on a guessed index.
 */
export function securitiesBlockedBy(fund: Pick<Fund, "kind" | "ninetyPercentTest">, ctx: RunContext): string | null {
  try {
    taxIndexOf(fund, ruleBook(ctx));
    return null;
  } catch (e) {
    if (e instanceof BlockedError) return e.ruleId;
    throw e;
  }
}

/**
 * F-118: the open rule a fund's after-tax run stops on (F-04), where the value before the exit tax can be read instead, or null. Only a
 * fund that pays nothing out: a distribution's tax would be paid inside the run, and its 25% is settled for a fund organised as a company
 * (TXF-05, TXF-30) but open for one organised as an arrangement (TXF open question 19). No record says which form a fund has, so a
 * distributing one stops on that question (`runSecuritiesBeforeTax` throws "TXF-OQ19").
 */
export function beforeTaxPathOf(fund: Pick<Fund, "kind" | "ninetyPercentTest" | "distribution">, ctx: RunContext): string | null {
  if (fund.distribution) return null;
  return securitiesBlockedBy(fund, ctx);
}

/**
 * F-118: a securities run whose exit tax an open rule blocks, read up to the sale and stopped before the tax. It has no after-tax value:
 * no `nominal`, `real` or `taxAtExit`, and its outcome is "listed, not ranked" with the open rule as the reason (B3, D84).
 */
export interface BeforeTaxRun extends Omit<RunResult, "nominal" | "real" | "taxAtExit" | "outcome"> {
  /** `V_T^pre`, nominal: what the sale leaves after its costs (F-09's `R_T`, with the cash still waiting for a unit, F-109), before the exit tax. */
  beforeTaxNominal: number;
  /** `V_T^pre / I_T` (F-06), in today's shekels: the CPI as the deflator, not as a tax index. */
  beforeTaxReal: number;
  outcome: { code: "listed-not-ranked"; reason: string };
}

/**
 * F-118 The value before the exit tax of a run an open rule blocks (D84, B3). The same ledger as `runSecurities`, month by month with every
 * fee, cost and the exchange-rate path, and the sale's costs at the exit; the tax index is never read (a lot's index serves the exit tax
 * alone), so the open rule enters no figure (method section 13). That nothing is taxed before the sale is TXF-11's, cited or labelled a
 * reading as the after-tax run does. Only for a fund the open rule blocks (`beforeTaxPathOf`); any other run is
 * `runSecurities`'s, unchanged.
 */
export function runSecuritiesBeforeTax(input: SecuritiesInput, ctx: RunContext): BeforeTaxRun {
  const rule = beforeTaxPathOf(input.fund, ctx);
  if (rule === null) {
    if (input.fund.distribution && securitiesBlockedBy(input.fund, ctx) !== null) throw new NotEvaluatedError("TXF-OQ19");
    throw new Error("F-118: the run's exit tax is not blocked by an open rule; its value is runSecurities's");
  }
  if (input.wrapper || input.carriedLoss) throw new Error("F-118 reads a securities account alone, with no wrapper and no carried loss");
  const r = acrossReadings(ctx, (c) => securitiesLedger(input, c, rule), RUN_RESULT_FIELDS);
  return {
    exitMonth: r.exitMonth,
    paidIn: r.paidIn,
    fees: r.fees,
    taxDuring: r.taxDuring,
    series: r.series,
    detail: r.detail,
    flags: r.flags,
    labels: r.labels,
    formulas: r.formulas,
    rules: r.rules,
    ...(r.feesCarried ? { feesCarried: r.feesCarried } : {}),
    ...(r.waitingCarried !== undefined ? { waitingCarried: r.waitingCarried } : {}),
    beforeTaxNominal: r.nominal,
    beforeTaxReal: r.real,
    outcome: { code: "listed-not-ranked", reason: rule },
  };
}

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
  return acrossReadings(ctx, (c) => securitiesLedger(input, c, null), RUN_RESULT_FIELDS);
}

/**
 * The ledger behind `runSecurities` and `runSecuritiesBeforeTax`. `beforeTaxOf` is null for the run to the exit tax; for F-118 it is the
 * open rule that blocks the exit tax, and the run then reads no tax index and stops after the sale's costs.
 */
function securitiesLedger(input: SecuritiesInput, ctx: RunContext, beforeTaxOf: string | null): RunResult {
  // F-119: a later leg's grid starts that many tax years after the run date's
  const book = ruleBook(ctx, { inflation: input.market.inflation, startsAfter: Math.floor(((input.goal.firstMonth ?? 1) - 1 + (input.gridOffset ?? 0)) / 12) });
  const { goal, market, fund, tariff, profile } = input;
  // F-04 first: a fund whose tax index rests on an open rule computes nothing after tax; F-118 never reads the index
  const taxIndex = beforeTaxOf === null ? taxIndexOf(fund, book) : null;
  const tally = new Tally();
  const formulas = ["F-08", "F-09", "F-10", "F-12", "F-13", "F-14", beforeTaxOf === null ? "F-40" : "F-118"];
  if (tariff.until) {
    formulas.push("F-101");
    checkTariffPeriods(tariff, input.gridOffset ?? 0);
  }

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
  const fxIndexed = taxIndex === "fx";
  // F-118: no tax index; a lot's index is read only by the exit tax, which that run does not compute
  const J = taxIndex === null ? null : fxIndexed ? X : I;

  const annual = market.returnIn === "instrument" ? (1 + market.grossReturn) * (1 + (market.fxChange ?? 0)) - 1 : market.grossReturn;
  const g = annualToMonthly(annual);
  const d = fund.drag ?? {};
  // A-11: the record's figure, else F-107 for an Irish fund that holds US shares (TXF-16's rate on their dividends)
  let withheld = d.foreignWithholding ?? 0;
  if (d.foreignWithholding === undefined && d.usDividends) {
    withheld = irishFundUsWithholding(book.rate("TXF-16", "irish_fund_us_dividend_treaty_rate"), d.usDividends.yield, d.usDividends.weight);
    formulas.push("F-107");
    // whether the fund obtains the treaty rate (its limitation-on-benefits article) is TXF open question 7 (method G-33)
    tally.flag("TXF-OQ7");
  }
  const delta = (d.management ?? 0) + (d.variable ?? 0) + (d.trustee ?? 0) + (d.tracking ?? 0) + withheld;
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
  if (tariff.perDividend && !tariff.currency) throw new RecordInputError("F-103: a charge per dividend is in the instrument's currency, and the tariff names none");
  // F-101: the tariff in force in month m. Without `until`, the one tariff, as always.
  const tariffAt = (m: number): SecuritiesTariff => {
    let at: TariffSequence = tariff;
    while (at.until && m > at.until.months) at = at.until.then;
    return at;
  };
  let nav = 1;
  // the share price in the instrument's currency: a price printed in another currency (a Tel Aviv line at its issuer's dollar NAV) at the run's rate
  const priceRate = fund.sharePriceCurrency && fund.sharePriceCurrency !== (tariff.currency?.code ?? "ILS") ? fund.sharePriceRate : 1;
  const sharePrice = (m: number) => (fund.sharePrice && priceRate ? (fund.sharePrice * priceRate * nav) / X[m]! : undefined);
  let lots: Lot[] = [];
  // F-109: whole units. The unit's price in shekels moves with the fund's value per unit (`nav`, 1 at the start). Cash an order leaves waits in
  // two pockets: shekels not yet converted (`waitingNis`), and the fund's currency a distribution left (`waitingHeld`, in that currency), which
  // the next order spends without converting it again.
  const unitBuy = input.wholeUnits;
  if (unitBuy && !(unitBuy.price > 0)) throw new RangeError(`F-109: a unit's price of ${unitBuy.price} must be above 0`);
  if (unitBuy) formulas.push("F-109");
  let waitingNis = 0;
  let waitingHeld = 0;
  const wait = { monthly: 0, placed: 0, skipped: 0 };

  /**
   * One order: FX fee on a contribution, then trade value and commission, bought at the ask. A monthly purchase (`standing`) is placed the
   * standing-order way: the standing commission with the standing conversion, where the tariff prints them. Where the group or the person set the
   * regular price of a side (`cheaperOfStandingTrade`, `cheaperOfStandingFx`), the person can place the order the regular way instead: the regular
   * commission (a side with no flag keeps its standing commission, F-12) with the regular conversion. The order pays the cheaper whole order
   * (F-101); a commission of one way never combines with the conversion of the other.
   */
  const buy = (cash: number, month: number, eventMonth: number, convert: boolean, standing = false) => {
    const at = tariffAt(month);
    const terms = { fxRate: fxRate(eventMonth) };
    const tradeTerms = { ...terms, sharePrice: sharePrice(month) };
    // F-109: the cash of this order and what earlier orders left. Shekels are converted (a fund in a foreign currency); a distribution's cash
    // and what one left are in the fund's currency already. Without a currency nothing is converted and the two pockets are alike.
    const fresh = (convert ? cash : 0) + waitingNis;
    const held = (convert ? 0 : cash) + waitingHeld * fxRate(eventMonth);
    const whole = unitBuy !== undefined && !(standing && unitBuy.monthlyByAmount);
    const order = (line: Commission | undefined, conversion: SecuritiesTariff["fx"]) => {
      const fxOn = (amount: number) => (tariff.currency && amount > 0 ? fxFee(conversion, amount, terms) + (at.fxSpread ?? 0) * amount : 0);
      const fx = fxOn(fresh);
      const sized = buyWithCash(fresh - fx + held, line, tradeTerms);
      if (!whole) return { fx, trade: sized.trade, commission: sized.commission, cost: fx + sized.commission, leftNis: 0, leftHeld: 0 };
      // F-109: the most whole units the cash pays for at the ask, with their commission and the conversion of the shekels they need; the
      // conversion is charged on the shekels converted, the cash that pays for it (as F-08 charges it on a contribution)
      const ask = unitBuy!.price * nav * (1 + spread);
      // the count starts from the most the cash could buy: a flat price for a small trade or conversion (F-12, F-13) can make a smaller order
      // cheaper than the whole cash's, so the start takes the lower of the two prices on each side, and the loop below checks each count exactly
      const flatOf = (l: SecuritiesTariff["fx"]) => (typeof l === "object" && l.flatUpTo ? l.flatUpTo.amount * (l.in === "instrument" ? terms.fxRate : 1) : Infinity);
      const fxLow = tariff.currency && fresh > 0 ? Math.min(fx, flatOf(conversion) + (at.fxSpread ?? 0) * fresh) : fx;
      const most = Math.max(sized.trade, fresh - fxLow + held - Math.min(sized.commission, flatOf(line)));
      for (let n = Math.floor(most / ask + 1e-9); n > 0; n--) {
        const trade = n * ask;
        const commission = tradeCommission(line, trade, tradeTerms);
        const fromHeld = Math.min(held, trade + commission);
        const owed = trade + commission - fromHeld;
        // the shekels whose conversion leaves `owed`: c = owed + fx(c), found as F-12 finds the trade a cash pays for, a flat price for a
        // small conversion settled before the iteration (F-13, `convertFor`)
        const c = tariff.currency ? convertFor(owed, conversion, terms, at.fxSpread ?? 0) : owed;
        if (c <= fresh + 1e-9) {
          const fxPaid = owed > 0 ? c - owed : 0;
          return { fx: fxPaid, trade, commission, cost: fxPaid + commission, leftNis: Math.max(0, fresh - c), leftHeld: held - fromHeld };
        }
      }
      return { fx: 0, trade: 0, commission: 0, cost: 0, leftNis: fresh, leftHeld: held };
    };
    const standingLine = standing ? (at.buyStanding ?? at.buy) : at.buy;
    let chosen = order(standingLine, standing ? (at.fxStanding ?? at.fx) : at.fx);
    if (standing && (at.cheaperOfStandingTrade || at.cheaperOfStandingFx)) {
      // the way that buys the most, and of two that buy the same, the cheaper (by amount the two buy alike only when they cost the same)
      const regular = order(at.cheaperOfStandingTrade && at.buy ? at.buy : standingLine, at.fx);
      if (regular.trade > chosen.trade + 1e-9 || (Math.abs(regular.trade - chosen.trade) <= 1e-9 && regular.cost < chosen.cost)) chosen = regular;
    }
    waitingNis = chosen.leftNis;
    waitingHeld = chosen.leftHeld / fxRate(eventMonth);
    if (standing) {
      wait.monthly++;
      if (chosen.trade > 0) wait.placed++;
      else wait.skipped++;
    }
    if (chosen.trade <= 0) return;
    tally.fee("fx", chosen.fx);
    tally.fee("trade", chosen.commission);
    const value = navBought(chosen.trade, spread);
    tally.fee("spread", chosen.trade - value);
    lots.push({ units: value / nav, basis: chosen.trade, index: J ? J[eventMonth]! : Number.NaN });
  };
  /** F-109: the cash waiting in the account in month m, in shekels at the month's rate. */
  const waiting = (m: number) => waitingNis + waitingHeld * fxRate(m);

  // F-20 distributions: Israeli rate, and the foreign withholding credited against it (TXF-17, TXF-18).
  let israeliDistRate = 0;
  let foreignWithholding = 0;
  if (fund.distribution) {
    if (beforeTaxOf !== null) throw new NotEvaluatedError("TXF-OQ19");
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
        // system, or a non-resident declaration (TXF-28; G-05 closed), so the foreign withholding stays 0.
        book.cite("TXF-28");
      } else {
        // F-20 knows the foreign withholding of a US and an Irish fund only; the callers stop a distributing fund of any other
        // domicile before the run (instruments.server.ts, fund-variants.ts), so reaching here is a caller's error.
        throw new Error("F-20: a distributing foreign fund needs its domicile (us or ireland) for the foreign withholding");
      }
      // A distribution at a foreign broker is not withheld in Israel: its advance is due by 30 April of the next year (TXF-21).
      if (atForeignBroker) tally.flag("TXF-21");
    } else {
      israeliDistRate = book.rate("TXS-10", "rate");
    }
  } else if (isForeign) {
    // An accumulating foreign fund is taxed only at sale under TXF-11, which the law supports by implication (no deemed-distribution
    // rule reaches a non-controlling holder; no sentence says it): computed, labelled a reading, and listed, not ranked (F-65, G-18);
    // unless its own annex reports a ruling that says so. No secondary source is cited.
    if (fund.saleOnlyRuling) book.cite("TXF-11");
    else book.label("reading", "TXF-11");
  }
  // The dollar value is known only when the tariff gives the currency's rate.
  const estateThreshold = fund.domicile === "us" && tariff.currency ? book.amount("TXF-27", "estate_threshold", "USD") : undefined;

  const wrapperFee = input.wrapper ? Math.min(input.wrapper.managerFee, book.rate("PF-06", "balance_cap")) : 0;
  if (input.wrapper) formulas.push("F-51", "F-15", "F-46");
  // No custody fee on money-market fund units at a bank (BRK-17, BANK-18); at a non-bank member the tariff's custody line
  // applies as published (F-14; BRK-17 binds banks only, and MF-26 does not bind an investment marketer).
  const mmfFree = isMmf && input.memberKind !== "non-bank";
  if (mmfFree) book.cite("BANK-18");
  // F-102 with BANK-35: from the order's start the Governor caps managing a payment account (a current account included) by the month's
  // actions, lower for 0 to 2 actions than the minimum a bank's row counts. How the amended rules count an action is not in the rule base,
  // so the run keeps the price list's minimum for the whole plan and flags the first month, from the cap's start on, whose stretch charges a
  // minimum above the lower cap (an exempt stretch charges nothing): the account's cost may be too high from then on (method F-102).
  // The cap is looked at without citing it, and cited only where it flags: a row it changes nothing on does not list it among its rules.
  // A record without the figure is cited at once, so the run fails as any missing rule does.
  if (tariff.currentAccount !== undefined) {
    const cap = ctx.rules.find((r) => r.id === "BANK-35")?.figures?.account_fee_up_to_2_actions as { value?: unknown; effective_from?: string | null } | undefined;
    if (typeof cap?.value !== "number") book.amount("BANK-35", "account_fee_up_to_2_actions");
    else {
      const capMonth = cap.effective_from ? monthOfDate(ctx.runDate, cap.effective_from) : 1;
      for (let m = Math.max(1, capMonth); m <= T; m++) {
        if ((tariffAt(m).currentAccount ?? 0) > cap.value) {
          book.amount("BANK-35", "account_fee_up_to_2_actions");
          tally.flag("BANK-35", m);
          break;
        }
      }
    }
  }
  const custodyLineAt = (m: number) => (mmfFree ? undefined : tariffAt(m).custody);

  let exitYearFees = 0;
  let accountCharged = false;
  let eventCharged = false;
  let eventInExitYear = false;
  let foreignTax = 0;
  let israeliDistTax = 0;
  let fundLevelTax = 0;
  let distThisYear = 0;
  let exitYearDist = 0;
  tally.point(0, 1, 0);

  for (let m = 1; m <= T; m++) {
    // 1-2. Contributions at the start of the month, each its own order (A-28).
    if (m === 1 && C[0]! > 0) buy(C[0]!, m, 0, true);
    if (m <= goal.months && C[m]! > 0) for (let k = 0; k < orders; k++) buy(C[m]! / orders, m, m, true, true);
    tally.paidIn += (m === 1 ? C[0]! : 0) + (m <= goal.months ? C[m]! : 0);

    // F-109, F-91: the cash waiting for a unit this month, which the month's growth and its share of the holdings do not reach (`waitingCarried`)
    const waitingNow = unitBuy ? waiting(m) : 0;
    if (unitBuy) tally.waitFrom(waitingNow);
    // 3. Growth less drag (F-10). The sum over the lots is kept while the lots stand: at 40 years it is 480 lots, several times a month, in every run.
    let units = totalUnits(lots);
    const before = units * nav;
    tally.fee("fund", (before * delta) / 12);
    fundLevelTax += before * fundLevelRate * g;
    nav *= 1 + g - delta / 12 - fundLevelRate * g;
    tally.grow(1 + g - delta / 12 - fundLevelRate * g);

    // 4. Distributions (F-20): paid out of the fund's value; the net is reinvested as a new lot.
    if (fund.distribution && m % (12 / fund.distribution.perYear) === 0) {
      const share = fund.distribution.yield / fund.distribution.perYear;
      const dist = units * nav * share;
      nav *= 1 - share;
      const t = distributionTax(dist, israeliDistRate, foreignWithholding);
      foreignTax += t.foreign;
      israeliDistTax += t.israeli;
      tally.taxDuring += t.foreign + t.israeli;
      distThisYear += dist;
      buy(t.net, m, m, false);
      units = totalUnits(lots);
      // F-103: the custodian's charge for the dividend, paid by removing units oldest first; it is not a fee the sale gain is reduced by
      const event = corporateEventFee(tariff.perDividend, fxRate(m), units * nav);
      if (event > 0) {
        lots = removeFifo(lots, event / nav);
        units = totalUnits(lots);
        tally.fee("custody", event);
        eventCharged = true;
        // G-32: in the exit tax year it may be a custody fee the sale gain is reduced by (TXS-06), which the rule base does not settle
        if (taxYearOf(m, first) === taxYearOf(T, first) && !eventInExitYear) {
          eventInExitYear = true;
          tally.flag("G-32", m);
        }
      }
    }

    // 5. Holding costs, paid by removing units oldest first (F-14, F-17, F-15 for the IRA manager). A share of the holdings (custody, the
    // IRA manager's fee) is charged on the units alone. A fee a month for the account (F-17's fixed fee, F-102's current account) is owed
    // whether or not a unit is held: where the units cannot pay it, the cash waiting for a whole unit (F-109) pays the rest, shekels first;
    // what neither can pay is not charged (method F-17, a decision of 2026-11-12 for the reviewer).
    const manager = (wrapperFee / 12) * units * nav;
    const custody = custodyFee(custodyLineAt(m), m + offset, units * nav - manager);
    const heldLeft = units * nav - manager - custody;
    const cashLeft = waiting(m);
    const fixed = fixedFee(tariffAt(m).monthlyFee, heldLeft + cashLeft);
    // F-102: the current account at a bank, after the account's own fees, at the price of the month's stretch (F-101: a group exempt for a
    // time); it stays out of the exit year's fees (TXS-06)
    const account = currentAccountFee(tariffAt(m).currentAccount, heldLeft + cashLeft - fixed);
    // the units pay first, as they always did; the waiting cash pays only what they cannot
    const fromCash = Math.min(cashLeft, Math.max(0, fixed + account - Math.max(0, heldLeft)));
    if (fromCash > 0) {
      const nis = Math.min(waitingNis, fromCash);
      waitingNis -= nis;
      // the fund's currency a distribution left, at the month's rate; converting a few shekels' worth is left out, as F-13 leaves out a sale's spot conversion
      waitingHeld = Math.max(0, waitingHeld - (fromCash - nis) / fxRate(m));
    }
    // F-91: a shekel the fees did not take would have paid the share of the holdings this month charges at the margin (custody where its
    // minimum and maximum do not bind, the IRA manager's fee), so the fees are carried to the exit net of it; a fixed sum takes no share
    const custodyLine = custodyLineAt(m);
    const held = units * nav;
    const custodyAtRate = custodyLine !== undefined && custody > 0 && Math.abs(custody - custodyLine.rate * (held - manager)) <= 1e-9 * Math.max(1, custody);
    tally.grow(1 - (custodyAtRate ? custodyLine.rate * (1 - wrapperFee / 12) : 0) - wrapperFee / 12);
    if (unitBuy) tally.waitTo(waitingNow);
    const fromUnits = custody + manager + fixed + account - fromCash;
    if (fromUnits > 0) {
      lots = removeFifo(lots, fromUnits / nav);
      units = totalUnits(lots);
    }
    tally.fee("custody", custody);
    tally.fee("fixed", fixed);
    tally.fee("account", account);
    if (account > 0) accountCharged = true;
    tally.fee("manager", manager);
    if (taxYearOf(m, first) === taxYearOf(T, first)) exitYearFees += custody + fixed;

    if (closesTaxYear(m, T, first)) {
      if (distThisYear > 0) tally.taxDuring += yearlySurtax(book, profile, distThisYear, taxYearOf(m, first));
      if (m === T) exitYearDist = distThisYear;
      distThisYear = 0;
    }
    if (estateThreshold !== undefined && (units * nav) / fxRate(m) > estateThreshold) tally.flag("TXF-27", m);
    tally.point(m, I[m]!, units * nav + waiting(m));
  }

  if (accountCharged) formulas.push("F-102");
  if (eventCharged) formulas.push("F-103");

  // F-09 exit: sold at the bid; commission and FX fee paid out of the proceeds; consideration is the gross
  // sale value (G-20); the exit year's custody and account fees are deducted from the gain once (TXS-06).
  const value = totalUnits(lots) * nav;
  const gross = value * (1 - spread);
  tally.fee("spread", value - gross);
  const atExit = tariffAt(T);
  const commission = tradeCommission(atExit.sell, gross, { fxRate: fxRate(T), sharePrice: sharePrice(T) });
  tally.fee("trade", commission);
  // F-109: the cash still waiting is part of what is left, and no gain: the fund's currency is converted with the sale's proceeds
  const heldAtExit = waitingHeld * fxRate(T);
  const converted = gross - commission + heldAtExit;
  const fx = tariff.currency && converted > 0 ? fxFee(atExit.fx, converted, { fxRate: fxRate(T) }) + (atExit.fxSpread ?? 0) * converted : 0;
  tally.fee("fx", fx);
  const proceeds = converted - fx + waitingNis;
  // F-109: what whole units did to the monthly purchases, for the page's line on the row
  const unitDetail: Record<string, number> = unitBuy ? { wholeUnits: 1, unitPrice: unitBuy.price, monthlyBuys: wait.monthly, monthlyOrders: wait.placed, monthlySkipped: wait.skipped, cashLeft: waitingNis + heldAtExit } : {};
  // F-118: stopped before the exit tax; listed with the open rule, never ranked (B3, D84)
  if (beforeTaxOf !== null) return tally.result(book, { exitMonth: T, nominal: proceeds, index: I, taxAtExit: 0, outcome: { code: "listed-not-ranked", reason: beforeTaxOf }, detail: unitDetail, formulas });

  const cost = lots.reduce((s, l) => s + l.basis, 0);
  // Each lot indexed by J_T / J_lot; when the index (CPI or exchange rate) fell, its inflationary amount is zero and
  // the part of a nominal loss equal to the fall is not allowable (TXS-02; method F-09). With the exchange
  // rate as the index, the rule that makes it the index is cited beside it: TXF-03 for a foreign-currency security held
  // directly, TXF-04 for a TASE foreign fund (TXF-03 says its own test does not answer for such a fund; TXF-04 is open). The exit
  // year's fees are deducted after the fall's cap (TXS-06); whether they sit inside the nominal loss the cap limits is an open reading (G-07).
  const adjusted = indexedCost(lots, J![T]!, nav * (1 - spread));
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
    } else outcome = step.outcome;
    if (realGain < 0) tally.flag("G-07");
    tally.flag("G-20");
    if (isForeign && !fund.distribution && !fund.saleOnlyRuling && outcome.code === "eligible") outcome = { code: "listed-not-ranked", reason: "G-18" };
    // A sale at a foreign broker is not withheld in Israel: the gain is reported, and its advance paid, by 31 July and 31 January (TXF-22).
    if (atForeignBroker) tally.flag("TXF-22");
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
      ...unitDetail,
    },
    formulas,
  });
}
