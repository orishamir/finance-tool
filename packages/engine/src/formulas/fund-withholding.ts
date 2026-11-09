// F-107: the US tax withheld from the dividends of the US shares an Irish fund holds, as a yearly cost inside the fund (A-11).

/**
 * F-107 The US tax inside an Irish fund that holds US shares (A-11). `rate` is TXF-16's US treaty rate on dividends paid to an Irish
 * resident, `usYield` the dividend yield of the index's US shares and `usWeight` their share of the index (1 for an index of US
 * companies), all fractions. The result is a fraction of the fund a year.
 */
export function irishFundUsWithholding(rate: number, usYield: number, usWeight: number): number {
  return rate * usYield * usWeight;
}
