// One ranking rule shared by the headline's pair and the account map, kept apart from invest.ts so a piece that needs only the order
// (the account map's engine, and through it the kit gallery) does not carry the whole index page's code.

/**
 * Items most first by `value`, a tie (equal values) to the one earlier in `items`: the headline's pair is the first of a fund's prices in the
 * houses' order (`providersOfInvest`, by full name), and the account map (F-131) ranks the accounts at each point the same way.
 */
export function rankByValue<T>(items: readonly T[], value: (t: T) => number): T[] {
  return items.map((t, k) => ({ t, k, v: value(t) })).sort((a, b) => b.v - a.v || a.k - b.k).map((x) => x.t);
}
