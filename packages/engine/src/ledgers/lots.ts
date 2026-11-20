// Tax lots (method §4): each purchase is a lot with its units, its cost and the tax index at purchase.

export interface Lot {
  units: number;
  /** Nominal cost, the price paid including the half-spread (TXG-12); commissions excluded (G-20). */
  basis: number;
  /** Tax index J at purchase: CPI or the exchange rate (F-03, F-04). */
  index: number;
}

/**
 * Removes units oldest lot first (TXS-06), each lot's cost leaving with its units. Used for fees paid by
 * selling units (F-08 step 5): earlier years' fees then do not reduce the taxable gain.
 */
export function removeFifo(lots: readonly Lot[], units: number): Lot[] {
  const out: Lot[] = [];
  let left = units;
  for (const lot of lots) {
    if (left <= 0) {
      out.push(lot);
    } else if (lot.units <= left) {
      left -= lot.units;
    } else {
      const share = (lot.units - left) / lot.units;
      out.push({ units: lot.units - left, basis: lot.basis * share, index: lot.index });
      left = 0;
    }
  }
  return out;
}

export const totalUnits = (lots: readonly Lot[]) => lots.reduce((s, l) => s + l.units, 0);

/**
 * The lots of one run, oldest first, kept in place: `removeFifo` and `totalUnits` over a list that only grows at its end and is taken from
 * its start. A fee paid by selling units each month copied every lot left, which over 40 years of monthly purchases made a run's lot work
 * grow with the square of its months; here a lot sold whole moves the start past it, and the lot sold in part is changed where it stands.
 * The figures sit in three arrays of numbers rather than an object per lot, so the sum each month reads them in a row and a month makes no
 * object to throw away, and a sum carries on from the last one while only purchases were added. Each sum and each lot's figures are worked out as the two functions above work them, in the same order, so a run's
 * numbers are the same to the bit (a Float64Array holds any number exactly, -0 and NaN included).
 */
export class LotQueue {
  private units: Float64Array;
  private basis: Float64Array;
  private index: Float64Array;
  private head = 0;
  private end = 0;
  /** `totalUnits` as last worked out, over the lots from `head` to `summedTo`; NaN once a sale changed them. */
  private sum = Number.NaN;
  private summedTo = 0;

  /** `capacity`: the lots the run can buy, so the arrays never grow (they do, past it). */
  constructor(capacity = 64) {
    // at most 4096 up front (about 100 KB): a plan of many orders a month grows the arrays as it buys rather than taking megabytes at once
    const n = Math.max(64, Math.min(capacity, 4096) | 0);
    this.units = new Float64Array(n);
    this.basis = new Float64Array(n);
    this.index = new Float64Array(n);
  }

  push(units: number, basis: number, index: number): void {
    if (this.end === this.units.length) {
      const grow = (a: Float64Array) => {
        const b = new Float64Array(a.length * 2);
        b.set(a);
        return b;
      };
      this.units = grow(this.units);
      this.basis = grow(this.basis);
      this.index = grow(this.index);
    }
    this.units[this.end] = units;
    this.basis[this.end] = basis;
    this.index[this.end] = index;
    this.end++;
  }

  /** `removeFifo` in place. */
  removeFifo(units: number): void {
    const u = this.units;
    let left = units;
    let i = this.head;
    // `!(left <= 0)` as removeFifo's test, so a NaN amount gives the same lot as it does there
    while (i < this.end && !(left <= 0)) {
      const lotUnits = u[i]!;
      if (lotUnits <= left) {
        left -= lotUnits;
        i++;
      } else {
        const share = (lotUnits - left) / lotUnits;
        u[i] = lotUnits - left;
        this.basis[i] = this.basis[i]! * share;
        left = 0;
      }
    }
    if (i !== this.head || units > 0 || units !== units) this.sum = Number.NaN;
    this.head = i;
  }

  /**
   * `totalUnits` of the lots left. The sum goes from the oldest lot to the newest, so where only lots bought since the last sum were added,
   * it carries on from that sum, the very additions a sum from the start would make; after a sale it starts again from the oldest.
   */
  totalUnits(): number {
    const u = this.units;
    let s = 0;
    let i = this.head;
    if (this.sum === this.sum) {
      s = this.sum;
      i = this.summedTo;
    }
    for (; i < this.end; i++) s += u[i]!;
    this.sum = s;
    this.summedTo = this.end;
    return s;
  }

  /** The lots left, oldest first. */
  lots(): Lot[] {
    const out: Lot[] = [];
    for (let i = this.head; i < this.end; i++) out.push({ units: this.units[i]!, basis: this.basis[i]!, index: this.index[i]! });
    return out;
  }
}

/**
 * F-09 with F-40: the cost of the lots at a sale in month T, indexed per lot by `J_T / J_i`, and the part of a
 * nominal loss that the fall of the index makes not allowable. Each lot is its own purchase:
 * - the index rose (`J_T ≥ J_i`): the adjusted cost is `basis × J_T / J_i` (TXG-12) and the inflationary amount above
 *   the basis is exempt (TXS-02);
 * - the index fell: the inflationary amount is zero, not negative, so the adjusted cost is the basis and the whole
 *   nominal gain is real (TXS-02, circular 10/2025 appendix, example 3; TXF-03 for an exchange rate); on a nominal loss
 *   the part equal to the fall, `basis × (1 − J_T / J_i)`, is not allowable and only the rest can be offset (example 4;
 *   the Supreme Court in ע"א 3555/15 מוזס, para 26).
 * The real gain over the lots is then `consideration − indexed + fallDisallowed` (less the exit year's fees, TXS-06), so a
 * falling index never makes it larger than the nominal gain. `unitValue` is one unit's consideration at the sale.
 */
export function indexedCost(lots: readonly Lot[], indexAtSale: number, unitValue: number): { indexed: number; fallDisallowed: number; fell: boolean } {
  let indexed = 0;
  let fallDisallowed = 0;
  let fell = false;
  for (const lot of lots) {
    if (indexAtSale >= lot.index) {
      indexed += (lot.basis * indexAtSale) / lot.index;
      continue;
    }
    fell = true;
    indexed += lot.basis;
    const consideration = lot.units * unitValue;
    if (consideration < lot.basis) fallDisallowed += Math.min(lot.basis - consideration, lot.basis - (lot.basis * indexAtSale) / lot.index);
  }
  return { indexed, fallDisallowed, fell };
}
