// docs/method.md §5: tax during the holding period. Rates come from the rule bundle; these functions only
// apply them.

/**
 * F-20 Distributions from a fund or share. Israel taxes the distribution at `ρ`; foreign tax withheld on it
 * is credited up to the Israeli tax (TXF-17, TXF-18): `credit = min(w × dist, ρ × dist)`,
 * `τ_IL = max(0, ρ × dist − credit)`. Foreign tax above the credit is lost.
 */
export function distributionTax(dist: number, israeliRate: number, foreignWithholding: number) {
  const foreign = foreignWithholding * dist;
  const credit = Math.min(foreign, israeliRate * dist);
  const israeli = Math.max(0, israeliRate * dist - credit);
  return { foreign, israeli, lost: foreign - credit, net: dist - foreign - israeli };
}

/**
 * F-21 Bank deposit, laddered. At maturity `interest = principal × ((1 + r)^(n/12) − 1)`, n months at the
 * effective annual rate r. Unlinked or partly linked: `rate × max(0, interest − deduction)`, the deduction
 * being what is left of TXI-20 for the year. Fully CPI-linked: linkage exempt (TXI-05), the tax is
 * `rate × real interest`, where the real interest is the quoted real rate on the indexed principal.
 */
export function depositInterest(principal: number, annualRate: number, months: number): number {
  return principal * (Math.pow(1 + annualRate, months / 12) - 1);
}

/**
 * F-21 low-income deduction (TXI-20): what is left of the yearly deduction once income above the
 * favoured ceiling has reduced it.
 */
export function lowIncomeDeduction(income: number, ceiling: number, deduction: number): number {
  return Math.max(0, deduction - Math.max(0, income - ceiling));
}

/**
 * F-24 Makam price per 100 face value, `p = 100 / (1 + y)^(N/365)`, N days to redemption (GOV-06).
 */
export function makamPrice(yieldToRedemption: number, days: number): number {
  return 100 / Math.pow(1 + yieldToRedemption, days / 365);
}

/**
 * F-25 Government bond coupon on face value `F`: `c × F`, scaled by `I_m / I_buy` for a CPI-linked series
 * (GOV-11, GOV-12, no floor). The whole indexed coupon is taxed, even when the index fell (TXI-25).
 */
export function bondCoupon(couponRate: number, face: number, indexRatio: number): number {
  return couponRate * face * indexRatio;
}

/**
 * F-25 Price of a government bond after a change in rates (2026-10-25, the guide page's "if rates move" drawing). Per 100 of
 * face value, a bond that pays `couponRate` a year in `perYear` equal coupons and redeems at 100 after `years` years is worth
 * the present value of what is left at the new yield `yieldRate`: `P = Σ (100 c / f) / (1 + i)^k + 100 / (1 + i)^n`, with
 * `f = perYear`, `i = (1 + y)^(1/f) − 1`, `n = years × f` and `k = 1 … n`. At `y = c` the price is 100 (a bond sold at par).
 * Real terms for a CPI-linked series: the index multiplies price and face alike, so the percentage change is the same.
 */
export function bondPrice(couponRate: number, yieldRate: number, years: number, perYear = 1): number {
  const n = Math.round(years * perYear);
  const i = Math.pow(1 + yieldRate, 1 / perYear) - 1;
  const c = (100 * couponRate) / perYear;
  let pv = 0;
  for (let k = 1; k <= n; k++) pv += c / Math.pow(1 + i, k);
  return pv + 100 / Math.pow(1 + i, n);
}

/**
 * F-26 Current-account credit balance. Monthly interest `B × g` at A-25, taxed at the unlinked-interest
 * rate at crediting (TXI-08, TXI-03).
 */
export function currentAccountInterest(balance: number, monthlyRate: number): number {
  return balance * monthlyRate;
}

/**
 * F-28 National Insurance and health contributions: zero on everything the engine models (TXG-27, TXG-28,
 * TXG-34, and the kupat gemel lehashkaa lump sum's gains, TXK-27); kept as a formula so the zero is explicit and the
 * G-27 flag has a home. G-11 was answered for the lump sum on 2026-10-26; it stays open only for a recognized annuity,
 * which the engine does not model.
 */
export function socialContributions(): number {
  return 0;
}
