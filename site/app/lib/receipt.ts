// The index page's receipt in whole shekels (F-91, F-106, F-109, F-129, F-130): what was paid in, what the index added before any cost,
// what the account's fees and the fund took, what the cash waiting for a whole unit did, all in the shekels of the horizon down to the value
// the account and the fund leave there; then what the inflation takes from that on the way to today's money, the state (F-91) in today's
// money, and what is left, written so that the lines add up as a reader adds them: paid in + added − account − fund − waiting − inflation − tax = left. Each figure is
// its own rounding where it can be; the rounding that makes them agree goes to the cost lines only, the account's to its own lines (its total
// is the account's fees, `accountFees`).
import { fmt } from "./format";
import { wholeParts } from "./whole-parts";
import type { PairCosts } from "./invest";
import type { SiteValue } from "./value";

export interface ReceiptAmounts {
  paidIn: number;
  /** F-91's X less what was paid in: what the index added before any cost. */
  added: number;
  tax: number;
  /** The account's fees, and its lines in `pc.dealLines` order, else `pc.account`'s, with the remainder last. */
  account: number;
  accountLines: number[];
  remainder: number;
  fund: number;
  /** F-109: what the cash waiting for a whole unit did against the fund, a cost above zero and a gain below; 0 by amount. Not a fee. */
  waiting: number;
  left: number;
  /** What is left less what was paid in. */
  gain: number;
}

/** Every line in today's money (F-91's receipt): paid in at today's prices (F-106) + added − tax − account − fund − waiting = left. */
export function receiptAmounts(pc: PairCosts): ReceiptAmounts {
  return amountsAt(pc, 1, pc.paidIn.value as number);
}

/** The receipt as it is written (F-129, F-130), top to bottom. */
export interface ReceiptChain {
  /** The lines in the shekels of the horizon: each F-91 figure times `I_T` (`pc.index`), what was paid in as the run paid it (F-05). */
  nominal: ReceiptAmounts;
  /** paid in + added − account − fund − waiting, in the shekels of the horizon: what the account and the fund leave there (F-129's `B^nom`). */
  beforeTax: number;
  /** The same in today's money: what is left and the state's part, both in today's money (F-130's `B^real`). */
  beforeTaxToday: number;
  /** What bringing it to today's money takes: `beforeTax − beforeTaxToday`. */
  inflation: number;
  /** The tax (F-91's state) in today's money, as `receiptAmounts` writes it. */
  tax: number;
  /** What is left in today's money: `beforeTaxToday − tax`. */
  left: number;
}

export function receiptChain(pc: PairCosts): ReceiptChain {
  const nominal = amountsAt(pc, pc.index.value as number, pc.paidInNominal.value as number);
  const real = receiptAmounts(pc);
  const beforeTax = nominal.paidIn + nominal.added - nominal.account - nominal.fund - nominal.waiting;
  const beforeTaxToday = real.left + real.tax;
  return { nominal, beforeTax, beforeTaxToday, inflation: beforeTax - beforeTaxToday, tax: real.tax, left: real.left };
}

/** The receipt's whole shekels with every figure at the horizon times `scale` (1: today's money) and what was paid in as given. */
function amountsAt(pc: PairCosts, scale: number, paidInGiven: number): ReceiptAmounts {
  const of = (v: SiteValue) => (typeof v.value === "number" ? v.value * scale : 0);
  const paidIn = Math.round(paidInGiven);
  const base = Math.round(pc.base * scale);
  const left = Math.round((pc.left.value as number) * scale);
  const account = Math.round(pc.accountFees * scale);
  const waiting = Math.round(pc.waitingN * scale);
  // the account's own lines: a deal's own fees where it is priced by a deal (F-128), else the tariff's lines
  const own = pc.dealLines ?? pc.account;
  const lines = wholeParts([...own.map((l) => of(l.cost)), pc.interaction * scale], account);
  // a tax under half a shekel (zero, or the engine's float dust around it) takes no rounding: the shekel the whole figures leave goes to the
  // fund, so a zero tax never reads "+1 ₪"
  const [fund, tax] = wholeParts([of(pc.fund), of(pc.tax)], base - left - waiting - account, [true, Math.abs(of(pc.tax)) >= 0.5]);
  return { paidIn, added: base - paidIn, tax: tax!, account, accountLines: lines.slice(0, -1), remainder: lines.at(-1)!, fund: fund!, waiting, left, gain: left - paidIn };
}

/**
 * One of the account's lines as the receipt writes them, with its whole shekels from `ReceiptAmounts`: a deal's own fee (F-128), a price
 * list's line, or the remainder no single line explains, whether the account is a house's price list or the person's deal.
 */
export type AccountLine =
  | { kind: "deal"; key: string; fee: string; name: string; cost: SiteValue; amount: number }
  | { kind: "list"; key: string; line: PairCosts["account"][number]["line"]; cost: SiteValue; amount: number }
  | { kind: "remainder"; key: "remainder"; cost: SiteValue; amount: number };

/** The account's lines in the receipt's order, each with its share of `r.account` (the remainder only where it is not zero). */
export function accountLinesOf(pc: PairCosts, r: ReceiptAmounts): AccountLine[] {
  // `r.accountLines` holds one whole figure for each of the lines, in their order (`amountsAt`)
  const amount = (i: number): number => {
    const n = r.accountLines[i];
    if (n === undefined) throw new Error(`accountLinesOf: the receipt has no whole figure for the account's line ${i}`);
    return n;
  };
  const own: AccountLine[] = pc.dealLines
    ? pc.dealLines.map((l, i) => ({ kind: "deal", key: l.fee, fee: l.fee, name: l.name, cost: l.cost, amount: amount(i) }))
    : pc.account.map((l, i) => ({ kind: "list", key: l.line, line: l.line, cost: l.cost, amount: amount(i) }));
  return r.remainder !== 0 ? [...own, { kind: "remainder", key: "remainder", cost: pc.remainder, amount: r.remainder }] : own;
}

/**
 * A cost line's amount as the receipt writes it, isolated in Hebrew: what was taken with a true minus ("−1,057 ₪"), and a line below zero
 * (the remainder of the account's fees together, the cash waiting for a unit while the fund fell, or a part the whole-shekel rounding took
 * under zero) with a plus, as the money it gave back ("+3 ₪"), so it never reads as one more cost.
 */
export const takenWords = (n: number): string => fmt.signedNisWhole(-n);
