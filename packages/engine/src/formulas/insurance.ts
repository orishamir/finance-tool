// docs/method.md §9: the insurance cost inside a pension fund.

/**
 * F-53 Pension insurance cost. Premiums for death and disability cover are deducted from the account
 * (PEN-15) at A-17, a share of each deposit. The actuarial tables are not collected (G-12), so the rate is
 * entered by the person. A provident fund for annuity has no pooled cover and charges none (PEN-35).
 */
export function insuranceCost(rate: number, deposit: number): number {
  return Math.max(0, rate) * Math.max(0, deposit);
}
