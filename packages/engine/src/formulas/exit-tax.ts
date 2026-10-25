// docs/method.md §7: tax at exit (liquidation at T). Rates and schedules come from the rule bundle.
import type { Bracket } from "../resolver.ts";

/**
 * F-40 Securities and fund units. Real-basis instruments: `τ = ρ × max(0, real)`; nominal-basis
 * instruments (unlinked bonds, makam sold early): `τ = rate × max(0, gain)`. A loss is not carried (G-07).
 */
export function capitalGainsTax(rate: number, taxableGain: number): number {
  return rate * Math.max(0, taxableGain);
}

/**
 * F-42 Age 60 and over at exit. For "maximum rate" items the person's brackets apply first: the sum, over
 * the slice from `Y` to `Y + real`, of `min(bracket rate, ρ)` for each part of the slice (TXG-04, TXG-07).
 */
export function bracketTaxOnTopSlice(otherIncome: number, slice: number, brackets: readonly Bracket[], cap: number): number {
  if (slice <= 0) return 0;
  let tax = 0;
  let lower = 0;
  const top = otherIncome + slice;
  for (const b of brackets) {
    const upper = b.upTo ?? Infinity;
    const from = Math.max(lower, otherIncome);
    const to = Math.min(upper, top);
    if (to > from) tax += (to - from) * Math.min(b.rate, cap);
    lower = upper;
    if (lower >= top) break;
  }
  return tax;
}

/**
 * F-43 Surtax. `Z = Y + real` (inflationary amounts excluded, TXG-09):
 * `3% × max(0, Z − t) − 3% × max(0, Y − t)`, plus on capital-source income
 * `2% × max(0, real + other capital income − t₂)` (TXG-10), less what the other capital income alone
 * already pays, so the wrapper carries only its own part (the method's formula omits that subtraction).
 */
export function surtax(
  otherIncome: number,
  real: number,
  otherCapitalIncome: number,
  base: { rate: number; threshold: number },
  capital: { rate: number; threshold: number },
) {
  const r = Math.max(0, real);
  const general =
    base.rate * (Math.max(0, otherIncome + r - base.threshold) - Math.max(0, otherIncome - base.threshold));
  const onCapital =
    capital.rate * (Math.max(0, r + otherCapitalIncome - capital.threshold) - Math.max(0, otherCapitalIncome - capital.threshold));
  return { general, onCapital };
}

/**
 * F-44 Kupat gemel lehashkaa, lump sum at any age. `τ = 0.25 × max(0, real)` on the real gain (TXK-07; in law since the
 * 2026-10-25 tax-bases research), with the 15%-of-nominal line (TXK-06 second limb) as the sensitivity the page shows (G-02).
 */
export function kglExitTax(real: number, nominalGain: number, realRate: number, nominalRate: number) {
  return { tax: realRate * Math.max(0, real), alternative: nominalRate * Math.max(0, nominalGain) };
}

/**
 * F-46 Keren hishtalmut, lawful exit. The benefited part is exempt (TXH-09); gains on deposits above the
 * benefited amount are taxed at 25% of their real gain (TXH-11; the real base is the Chief Economist paper's).
 */
export function hishtalmutExitTax(excessRealGain: number, rate: number): number {
  return rate * Math.max(0, excessRealGain);
}

/**
 * F-50 Child savings. Gains are taxed on withdrawal (TXK-20) at the secondary-source rates (TXK-23):
 * provident route and CPI-linked bank deposit 25% of the real gain; unlinked bank deposit 15% of the
 * nominal gain.
 */
export function childSavingsExitTax(gain: number, rate: number): number {
  return rate * Math.max(0, gain);
}
