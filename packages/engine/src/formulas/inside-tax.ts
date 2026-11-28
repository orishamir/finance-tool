// F-107 and F-133: the tax a fund bears on what it receives from its index (A-11), a net index's deduction, and a fund's gap measured from
// that net index. Pure arithmetic; `variants/inside-tax.ts` decides which applies and reads the rates from the rules.

/** One part of an index at one rate: the rate on its dividends, their yield and the part's share of the index, all fractions. */
export interface RatedPart {
  rate: number;
  yield: number;
  weight: number;
}

const weighted = (parts: readonly RatedPart[]): number => parts.reduce((a, p) => a + p.rate * p.yield * p.weight, 0);

/**
 * F-107 The tax a fund bears on what it receives from its index (A-11): `w = Σ_p ρ_p y_p s_p`, over the parts of the index the site holds,
 * each at the fund's rate on that part's dividends. A fraction of the fund a year.
 */
export function heldDividendTax(parts: readonly RatedPart[]): number {
  return weighted(parts);
}

/**
 * F-133 A net index's deduction, and a fund's gap measured from it: `D = Σ_p τ_p y_p s_p`, each part at the rate the index's provider
 * deducts from it. A fraction of the fund a year.
 */
export function netDeduction(parts: readonly RatedPart[]): number {
  return weighted(parts);
}

/**
 * F-133 (b) A-07 from a fund's years against a net index whose deduction is known: `max(0, s + D − w)`, with `s` F-92 (b)'s mean shortfall
 * beyond the fees charged, before its floor, `D` the index's deduction and `w` the fund's own counted tax. Fractions a year.
 */
export function gapFromNet(shortfall: number, deduction: number, counted: number): number {
  return Math.max(0, shortfall + deduction - counted);
}
