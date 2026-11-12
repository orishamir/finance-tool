// The index page's receipt in whole shekels (F-91, F-106): what was paid in, what the index added before any cost, what the tax, the
// account and the fund took, and what is left, written so that the lines add up as a reader adds them: paid in + added − tax − account −
// fund = left. Each figure is its own rounding where it can be; the rounding that makes them agree goes to the cost lines only, the
// account's to its own lines (its total is the account list's figure, `accountWhole`).
import { fmt } from "./format";
import { wholeParts } from "./whole-parts";
import { accountWhole, type PairCosts } from "./invest";

export interface ReceiptAmounts {
  paidIn: number;
  /** F-91's X less what was paid in: what the index added before any cost. */
  added: number;
  tax: number;
  /** The account's whole cost (the account list's figure), and its lines in `pc.account` order with the remainder last. */
  account: number;
  accountLines: number[];
  remainder: number;
  fund: number;
  left: number;
  /** What is left less what was paid in. */
  gain: number;
  /** Tax, account and fund together: X less what is left. */
  lost: number;
}

export function receiptAmounts(pc: PairCosts): ReceiptAmounts {
  const paidIn = Math.round(pc.paidIn.value as number);
  const base = Math.round(pc.base);
  const left = Math.round(pc.left.value as number);
  const account = accountWhole(pc);
  const lines = wholeParts([...pc.account.map((l) => (typeof l.cost.value === "number" ? l.cost.value : 0)), pc.interaction], account);
  const lost = base - left;
  const [fund, tax] = wholeParts([typeof pc.fund.value === "number" ? pc.fund.value : 0, typeof pc.tax.value === "number" ? pc.tax.value : 0], lost - account);
  return { paidIn, added: base - paidIn, tax: tax!, account, accountLines: lines.slice(0, -1), remainder: lines.at(-1)!, fund: fund!, left, gain: left - paidIn, lost };
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
 * (the remainder of the account's fees together, or a part the whole-shekel rounding took under zero) with a plus, as the money it gave
 * back ("+3 ₪"), so it never reads as one more cost.
 */
export const takenWords = (n: number): string => fmt.signedNisWhole(-n);
