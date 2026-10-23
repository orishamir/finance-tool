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
