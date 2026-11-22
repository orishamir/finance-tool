// The index page's receipt (F-91, F-106, F-109): what was paid in, what the index added before any cost, what the tax, the account's fees
// and the fund took, what the cash waiting for a whole unit did, and what is left, written so that the lines add up as a reader adds them:
// paid in + added − tax − account − fund − waiting = left. Every line keeps the number it shows on its own (`nisAsShown`): hundreds of
// shekels from 1,000 ₪ where it rests on an assumed return, whole shekels below, agorot under 10 ₪; so a cost never reads 0 ₪, changes
// sign or doubles to make the sum work. What the rounding leaves goes to the lines that carry the growth and are no cost: what the index
// added takes it in the receipt, the remainder in the account's lines, and the gain is what is left less what was paid in, both as shown.
// A line shows its number as it is (`reconciled`), never rounded again.
import { nisAsShown, nisOf, toAgorot } from "./format";
import type { SiteValue } from "./value";
import { wholeParts } from "./whole-parts";
import type { PairCosts } from "./invest";

export interface ReceiptAmounts {
  paidIn: number;
  /** F-91's X less what was paid in: what the index added before any cost, taking what the rounding of the other lines leaves. */
  added: number;
  tax: number;
  /** The account's fees, and its lines in `pc.dealLines` order, else `pc.account`'s; the remainder takes what the lines' rounding leaves. */
  account: number;
  accountLines: number[];
  remainder: number;
  fund: number;
  /** F-109: what the cash waiting for a whole unit did against the fund, a cost above zero and a gain below; 0 by amount. Not a fee. */
  waiting: number;
  left: number;
  /** What is left less what was paid in. */
  gain: number;
  /** What the tax, the account and the fund took together: their three lines added. */
  lost: number;
}

const numOf = (v: SiteValue): number => (typeof v.value === "number" ? v.value : 0);

export function receiptAmounts(pc: PairCosts): ReceiptAmounts {
  // each line as its own figure shows it; the account's fees and the waiting cash rest on the plan's return as what is left does
  const own = (v: SiteValue) => nisAsShown(v, numOf(v));
  const onReturn = (n: number) => nisAsShown(pc.left, n);
  const paidIn = own(pc.paidIn);
  const left = own(pc.left);
  const account = onReturn(pc.accountFees);
  const waiting = pc.waiting ? own(pc.waiting) : onReturn(pc.waitingN);
  // the account's own lines: a deal's own fees where it is priced by a deal (F-128), else the tariff's lines
  const accountLines = (pc.dealLines ?? pc.account).map((l) => own(l.cost));
  const remainder = toAgorot(account - accountLines.reduce((a, x) => a + x, 0));
  const tax = own(pc.tax);
  const fund = own(pc.fund);
  const lost = toAgorot(tax + account + fund);
  return { paidIn, added: toAgorot(left + lost + waiting - paidIn), tax, account, accountLines, remainder, fund, waiting, left, gain: toAgorot(left - paidIn), lost };
}

/** Each part's whole share of `total` in percent, adding up to 100 (largest remainder); parts at or under zero take none. */
export function sharesOf(values: readonly number[]): number[] {
  const pos = values.map((v) => Math.max(0, v));
  const sum = pos.reduce((a, v) => a + v, 0);
  if (sum <= 0) return values.map(() => 0);
  return wholeParts(pos.map((v) => (100 * v) / sum), 100);
}

/**
 * A cost line's amount as the receipt writes it, isolated in Hebrew: what was taken with a true minus ("−1,057 ₪"), and a line below zero
 * (the remainder of the account's fees together, which also holds what the rounding of the lines leaves, or the cash waiting for a unit
 * while the fund fell) with a plus, as the money it gave back ("+3 ₪"), so it never reads as one more cost.
 */
export const takenWords = (n: number, of: Pick<SiteValue, "onAssumedReturn" | "reconciled"> = {}): string => nisOf(of, -n, { signed: true });
