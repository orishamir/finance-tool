// The dates of a set of figures shown together: a date beside them is theirs, the oldest and the newest of the records they come from, so
// a list read over several days never reads as all read on its newest day.

/** The oldest and the newest of a set's items by their date; the same item twice where the set has one date. */
export interface DateSpan<T> {
  from: T;
  to: T;
}

/** The span of `items` by `date` (an ISO day); null for no items. */
export function dateSpan<T>(items: readonly T[], date: (x: T) => string): DateSpan<T> | null {
  if (items.length === 0) return null;
  return { from: items.reduce((a, x) => (date(x) < date(a) ? x : a)), to: items.reduce((a, x) => (date(x) > date(a) ? x : a)) };
}

/** Whether a span is one day: its figures are all of one date, said once. */
export const oneDay = <T>(span: DateSpan<T>, date: (x: T) => string): boolean => date(span.from) === date(span.to);
