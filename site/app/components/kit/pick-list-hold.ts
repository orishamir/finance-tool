// The height a PickList's phone fold holds: the rows it shows whichever row is chosen, and the tallest set of them over every order the
// list can take.

/** A row as the phone's fold sees it. */
export interface FoldRow {
  heading?: boolean;
  keep?: boolean;
  selected?: boolean;
}

/**
 * The rows a phone's fold shows, by index (fourth pass): every row that opens a group, the person's own rows and the chosen row,
 * always; then the first other rows in order while places last. A row that opens a group takes a place like any row, and is shown even
 * past the places, so the fold shows the same rows whichever row is chosen: a chosen heading row took one more place than it does unchosen,
 * and hid the row above it (170 px on a phone).
 */
export function foldShown(rows: readonly FoldRow[], limit: number): Set<number> {
  const must = rows.map((r) => !!(r.keep || r.heading || r.selected));
  let left = limit - rows.filter((r, i) => must[i] && !r.keep).length;
  const out = new Set<number>();
  rows.forEach((r, i) => {
    if (must[i]) out.add(i);
    else if (left > 0) {
      out.add(i);
      left--;
    }
  });
  return out;
}

/** One order a folded list can take (one per state of the page: the funds sorted at one account), with the rows that can be chosen in it. */
export interface FoldOrder {
  keys: readonly string[];
  headings: ReadonlySet<string>;
  /** The rows a pick can leave chosen in this order (the funds priced at that account); the person's own rows are kept anyway. */
  choosable: ReadonlySet<string>;
  keep?: ReadonlySet<string>;
}

/**
 * The height a folded list holds: the tallest set of rows the fold can show, over every order the list can take and every row that can be
 * chosen in it (fourth pass: the fold held the rows of the order the page opened in, and the first pick after a link moved 233 px).
 * `height`: a row's height by key (its tallest case).
 */
export function heldFoldHeight(orders: readonly FoldOrder[], limit: number, height: (key: string) => number): number {
  let most = 0;
  for (const o of orders) {
    const rows = o.keys.map((k) => ({ heading: o.headings.has(k), keep: o.keep?.has(k) ?? false, selected: false }));
    const sum = (set: Set<number>) => [...set].reduce((a, i) => a + height(o.keys[i]!), 0);
    // a chosen row inside the places changes nothing; one past them takes the last free place
    most = Math.max(most, sum(foldShown(rows, limit)));
    o.keys.forEach((k, i) => {
      if (!o.choosable.has(k) || rows[i]!.heading || rows[i]!.keep) return;
      rows[i]!.selected = true;
      most = Math.max(most, sum(foldShown(rows, limit)));
      rows[i]!.selected = false;
    });
  }
  return most;
}
