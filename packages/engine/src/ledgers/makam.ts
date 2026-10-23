// Makam bought at issue and rolled: F-24, with F-12 commissions and the F-40 exit for a sale before redemption.
import { buyWithCash, tradeCommission, type Commission } from "../formulas/fees.ts";
import { makamPrice } from "../formulas/holding-tax.ts";
import { closesTaxYear, contributions, cpiPath, type Goal } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";
import { exitTax, Tally, unlessBlocked, yearlySurtax, type Profile } from "./common.ts";

export interface MakamInput {
  goal: Goal;
  market: { inflation: number };
  /** A-22 yield to redemption; series term in months (12 for the yearly series, GOV-22, GOV-23). */
  makam: { yield: number; termMonths?: number };
  /** Buy and sell lines for makam (F-12). No sale order at redemption; no custody (BRK-17). */
  tariff: { buy?: Commission; sell?: Commission };
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
 * capital gain on an unlinked asset (TXI-12).
 */
export function runMakam(input: MakamInput, ctx: RunContext): RunResult {
  const book = ruleBook(ctx);
  const { goal, makam, tariff } = input;
  const profile = input.profile ?? {};
  const term = makam.termMonths ?? 12;
  const T = goal.months;
  const first = goal.firstMonth ?? 1;
  const I = cpiPath(input.market.inflation, T);
  const C = contributions(goal, I);
  const discountRate = book.rate("TXI-11", "rate");
  book.cite("BRK-17");
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
  let blocked: string | undefined;
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
      tally.taxDuring += tax;
      proceeds += s.face - tax;
    }
    if (closesTaxYear(m, T, first)) {
      tally.taxDuring += yearlySurtax(book, profile, interestThisYear);
      if (m === T) exitYearInterest = interestThisYear;
      interestThisYear = 0;
    }
    if (m < T) {
      if (proceeds > 0) held.push(buy(proceeds, m + term));
    } else {
      cashAtExit += proceeds;
      for (const s of held) {
        const gross = (s.face * price(s.maturity - T)) / 100;
        const commission = tradeCommission(tariff.sell, gross, { fxRate: 1 });
        tally.fee("trade", commission);
        saleGain += gross - s.cost;
        cashAtExit += gross - commission;
      }
      if (held.length > 0) {
        const exit = unlessBlocked(() => exitTax(book, profile, T, saleGain, book.rate("TXI-12", "rate"), true, exitYearInterest, first));
        taxAtExit = exit.value?.tax ?? 0;
        blocked = exit.blocked;
      }
    }
    const value = held.reduce((v, s) => v + (s.face * price(Math.max(0, s.maturity - m))) / 100, 0);
    tally.point(m, I[m]!, m < T ? value : cashAtExit);
  }

  return tally.result(book, {
    exitMonth: T,
    nominal: cashAtExit - taxAtExit,
    index: I,
    taxAtExit,
    outcome: blocked ? { code: "listed-not-ranked", reason: blocked } : undefined,
    detail: { saleGain },
    formulas: ["F-24", "F-12", "F-40"],
  });
}
