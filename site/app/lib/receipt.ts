// The index page's receipt (F-91, F-106, F-109): what was paid in, what the index added before any cost, what the tax, the account's fees
// and the fund took, what the cash waiting for a whole unit did, and what is left, written so that the lines add up as a reader adds them:
// paid in + added − tax − account − fund − waiting = left. The lines are rounded once, on the receipt's grid (`sumGrid`): hundreds of
// shekels where what is left rests on an assumed return, whole shekels otherwise. What was paid in rests on no return and stays exact; what
// the index added takes up the difference. Each other figure is its own rounding where it can be; the rounding that makes them agree goes
// to the cost lines only, the account's to its own lines (its total is the account's fees, `accountFees`). A line shows its number as it is
// (`reconciled`), never rounded again.
import { nisOf } from "./format";
import type { SiteValue } from "./value";
import { gridParts, onGrid, sumGrid, wholeParts, type Grid } from "./whole-parts";
import type { PairCosts } from "./invest";

export interface ReceiptAmounts {
  /** The grid every line but what was paid in, what was added and the gain is rounded on (`sumGrid`). */
  grid: Grid;
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
  /** What the tax, the account and the fund took together: X less what is left, less the waiting cash. */
  lost: number;
}

export function receiptAmounts(pc: PairCosts): ReceiptAmounts {
  const g = sumGrid(pc.left);
  const paidIn = Math.round(pc.paidIn.value as number);
  const base = onGrid(pc.base, g);
  const left = onGrid(pc.left.value as number, g);
  const account = onGrid(pc.accountFees, g);
  const waiting = onGrid(pc.waitingN, g);
  // the account's own lines: a deal's own fees where it is priced by a deal (F-128), else the tariff's lines
  const own = pc.dealLines ?? pc.account;
  const lines = gridParts([...own.map((l) => (typeof l.cost.value === "number" ? l.cost.value : 0)), pc.interaction], account, g);
  const lost = base - left - waiting;
  const [fund, tax] = gridParts([typeof pc.fund.value === "number" ? pc.fund.value : 0, typeof pc.tax.value === "number" ? pc.tax.value : 0], lost - account, g);
  return { grid: g, paidIn, added: base - paidIn, tax: tax!, account, accountLines: lines.slice(0, -1), remainder: lines.at(-1)!, fund: fund!, waiting, left, gain: left - paidIn, lost };
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
 * (the remainder of the account's fees together, the cash waiting for a unit while the fund fell, or a part the whole-shekel rounding took
 * under zero) with a plus, as the money it gave back ("+3 ₪"), so it never reads as one more cost.
 */
export const takenWords = (n: number, of: Pick<SiteValue, "onAssumedReturn" | "reconciled"> = {}): string => nisOf(of, -n, { signed: true });
