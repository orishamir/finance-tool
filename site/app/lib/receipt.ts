// The index page's receipt in whole shekels (F-91, F-106, F-109): what was paid in, what the index added before any cost, what the tax, the
// account's fees and the fund took, what the cash waiting for a whole unit did, and what is left, written so that the lines add up as a reader
// adds them: paid in + added − tax − account − fund − waiting = left. Each figure is its own rounding where it can be; the rounding that makes
// them agree goes to the cost lines only, the account's to its own lines (its total is the account's fees, `accountFees`).
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
  /** What the tax, the account and the fund took together: X less what is left, less the waiting cash. */
  lost: number;
}

export function receiptAmounts(pc: PairCosts): ReceiptAmounts {
  return amountsAt(pc, 1, pc.paidIn.value as number);
}

/**
 * The same lines in the shekels of the horizon (F-06 read back: each F-91 figure times `I_T`, `pc.index`), what was paid in as the run paid
 * it (`pc.paidInNominal`, F-05), and what bringing them to today's money takes: `inflation`, the nominal end less the real one, both whole,
 * so paid in + added − tax − account − fund − waiting = left, and left − inflation = the receipt's real `left` (`receiptAmounts`).
 */
export function receiptNominal(pc: PairCosts): ReceiptAmounts & { inflation: number } {
  const n = amountsAt(pc, pc.index.value as number, pc.paidInNominal.value as number);
  return { ...n, inflation: n.left - Math.round(pc.left.value as number) };
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
  const lost = base - left - waiting;
  const [fund, tax] = wholeParts([of(pc.fund), of(pc.tax)], lost - account);
  return { paidIn, added: base - paidIn, tax: tax!, account, accountLines: lines.slice(0, -1), remainder: lines.at(-1)!, fund: fund!, waiting, left, gain: left - paidIn, lost };
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
export const takenWords = (n: number): string => fmt.signedNisWhole(-n);
