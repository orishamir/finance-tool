// The height a PickList holds (#190, third pass): the tallest state the list can reach, every state measured the same way, the one on
// the screen included. The second pass counted the state on the screen at its real rows and every other state at a case that carried
// every tag at once, so the held height depended on the state the page opened in (122 px on a phone after a link to a fund abroad).

/** A row's measured cases: by state key, then by the marks the case carries ("" for none, else the marks sorted and joined by "+"). */
export interface RowCases {
  key: string;
  /** The row's height on the screen now: used for a state the row has no case for (a row without cases). */
  real: number;
  cases: Map<string, Map<string, number>>;
}

/** The key of a case that carries `marks` (one-per-list tags: the cheapest's star, the way back after a tap). */
export const marksKey = (marks: readonly string[] = []) => [...marks].sort().join("+");

/**
 * The tallest a state can stand: each row at its plain case for that state (every tag it can carry on many rows at once is in it), then
 * each mark on the one row where it adds the most, since a mark stands on one row at a time (the star on the cheapest row, the way back
 * on the row tapped), and on a row only where the row has a case that carries it. Two marks on one row count only when that row has a
 * case with both: their words wrap differently together than apart.
 */
export function stateHeight(rows: RowCases[], state: Record<string, string>, marks: readonly string[]): number {
  // by row, the height of each set of marks (a bit per mark), undefined where the row has no such case
  const full = 1 << marks.length;
  const keys = Array.from({ length: full }, (_, set) => marksKey(marks.filter((_, m) => set & (1 << m))));
  const base: number[] = [];
  const byRow: (number | undefined)[][] = [];
  for (const r of rows) {
    const want = state[r.key];
    const v = want === undefined ? undefined : r.cases.get(want);
    const plain = v?.get("") ?? r.real;
    base.push(plain);
    byRow.push(keys.map((k, set) => (set === 0 ? plain : v?.get(k))));
  }
  const plain = base.reduce((a, x) => a + x, 0);
  // each mark on one row or on none: the most the marks add, over every way to place them
  let most = 0;
  const on = rows.map(() => 0);
  const place = (m: number) => {
    if (m === marks.length) {
      let extra = 0;
      for (let i = 0; i < rows.length; i++) {
        if (!on[i]) continue;
        const h = byRow[i]![on[i]!];
        if (h === undefined) return;
        extra += h - base[i]!;
      }
      most = Math.max(most, extra);
      return;
    }
    place(m + 1);
    for (let i = 0; i < rows.length; i++) {
      if (byRow[i]![1 << m] === undefined) continue;
      on[i] = on[i]! | (1 << m);
      place(m + 1);
      on[i] = on[i]! & ~(1 << m);
    }
  };
  place(0);
  return plain + most;
}

/** The height the rows hold: the tallest of the states, and never less than the rows shown now. */
export function heldRowsHeight(rows: RowCases[], states: Record<string, string>[], now: number): number {
  const marks = [...new Set(rows.flatMap((r) => [...r.cases.values()].flatMap((v) => [...v.keys()].flatMap((k) => (k ? k.split("+") : [])))))].sort();
  // many states are the same (every fund of one kind): each counted once
  const distinct = new Map(states.map((st) => [JSON.stringify(rows.map((r) => st[r.key] ?? null)), st]));
  return Math.max(now, ...[...distinct.values()].map((st) => stateHeight(rows, st, marks)));
}

/** A row as the phone's fold sees it. */
export interface FoldRow {
  heading?: boolean;
  keep?: boolean;
  selected?: boolean;
}

/**
 * The rows a phone's fold shows, by index (#190, fourth pass): every row that opens a group, the person's own rows and the chosen row,
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
 * chosen in it (#190, fourth pass: the fold held the rows of the order the page opened in, and the first pick after a link moved 233 px).
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
