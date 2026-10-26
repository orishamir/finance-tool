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
