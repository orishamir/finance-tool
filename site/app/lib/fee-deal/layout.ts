// A fee's cases laid out by the fee's shape (method §10.6, F-114): what the workbench draws for a fee whose price changes by one to three
// things. One thing: the cases as columns and the parts as rows, only the rows some case has, a range's cases ascending as a ladder, and
// with more cases than fit, the same table read as rows. Two things: a grid, the first thing down the side and the second across the top,
// a case on any value of the second spanning its row. Three: the third a switch above the grid. A grid whose cases do not fall one to a
// place (two on one place, or a case on any value beside others in its row) is read as rows. What is the same is said once: a part
// identical in every case moves to one line above the cases (in one currency's cases, where the others have it in another), and in a
// grid a part identical across a row or a column moves to that row's or column's line. Equal neighbours in a table's row share one cell.
// The places where a case or a step is added are part of the layout. Pure, and blind to what the fee, its things and its parts are: it
// reads only each case's values, whether a thing is a range, and each part's row, content and currency.
import type { When } from "./model";

/** One part of a case as the layout reads it: its row, a key equal for equal content, and the currency its figure is in (null: none). */
export interface LayoutPart {
  row: string;
  key: string;
  currency: string | null;
}

/** One case: its id, its value for each thing (in the fee's order), and its parts. */
export interface LayoutCase {
  id: string;
  when: readonly When[];
  parts: readonly LayoutPart[];
}

export interface LayoutInput {
  /** Each thing the price changes by, in the fee's order: whether its values are a range's steps. */
  things: readonly { range: boolean }[];
  cases: readonly LayoutCase[];
  /** The part rows in the order they stand. */
  rows: readonly string[];
  /** With three things, the third's value the grid shows (`valueKey`); the first where it names none the cases have. */
  switchTo?: string | null;
}

/** More cases than this in one thing's table are read as rows. */
export const MAX_COLUMNS = 5;

/** A part said once for many cases: its row and content, and the currency it holds in where it holds only in that currency's cases. */
export interface Shared {
  row: string;
  key: string;
  currency: string | null;
  /** The cases it is said for, whose cells leave it out. */
  cases: string[];
}

/** A thing an add slot adds a value of: its place among the fee's things, and whether it is a range (the slot then adds a step). */
export interface AddAxis {
  thing: number;
  range: boolean;
}

/** A cell of a table's part row: the columns it spans, the cases it covers, and its content's key (null: nothing to show there). */
export interface TableCell {
  from: number;
  span: number;
  cases: string[];
  key: string | null;
}

/** A value of a thing as a grid's row, column or switch names it: its key, its value, and the cases on it. */
export interface Head {
  key: string;
  when: When;
  cases: string[];
}

/** A grid's cell: the columns it spans, its case (null: a place no case holds), and whether its case holds any value across. */
export interface GridCell {
  from: number;
  span: number;
  case: string | null;
  whole: boolean;
}

export type FeeLayout =
  | {
      shape: "table";
      thing: number;
      /** The thing is a range: the columns ascend, and read as a ladder. */
      ladder: boolean;
      /** Whether the table fits as columns, or is read as rows (more cases than `MAX_COLUMNS`). */
      fit: "columns" | "rows";
      columns: { case: string; when: When }[];
      /** The part rows some case still shows, each with its cells, equal neighbours merged. */
      rows: { row: string; cells: TableCell[] }[];
      shared: Shared[];
      /** The part rows each case still shows, in order: what a row of the table read as rows holds. */
      shows: Record<string, string[]>;
      add: AddAxis;
    }
  | {
      shape: "grid";
      down: AddAxis;
      across: AddAxis;
      /** The third thing, as a switch above the grid: its values, and the one shown. */
      switch: { thing: number; values: Head[]; chosen: string } | null;
      rows: (Head & { cells: GridCell[]; shared: Shared[] })[];
      columns: (Head & { shared: Shared[] })[];
      shared: Shared[];
      shows: Record<string, string[]>;
    }
  | {
      shape: "rows";
      cases: string[];
      shared: Shared[];
      shows: Record<string, string[]>;
      /** Where a case is added: after the last row, for a fee that changes by one thing; none for more. */
      add: AddAxis | null;
    };

/** A value's key: equal for equal values, whatever order a list was named in. */
export const valueKey = (w: When): string => (Array.isArray(w) ? JSON.stringify([...w].sort()) : JSON.stringify(w));

/** The order a thing's values stand in: a range's steps ascending and any value last; a list's in the order the cases first name them. */
function ordered(heads: Head[], range: boolean): Head[] {
  if (!range) return heads;
  const rank = (w: When) => (typeof w === "number" ? w : Infinity);
  return [...heads].sort((a, b) => rank(a.when) - rank(b.when));
}

/** The distinct values of thing `t` among `cases`, in order (`ordered`), each with its cases; any value left out where `skipAny`. */
function headsOf(cases: readonly LayoutCase[], t: number, range: boolean, skipAny = false): Head[] {
  const heads: Head[] = [];
  for (const c of cases) {
    const w = c.when[t]!;
    if (skipAny && w === "any") continue;
    const key = valueKey(w);
    const h = heads.find((x) => x.key === key);
    if (h) h.cases.push(c.id);
    else heads.push({ key, when: w, cases: [c.id] });
  }
  return ordered(heads, range);
}

const partIn = (c: LayoutCase, row: string): LayoutPart | undefined => c.parts.find((p) => p.row === row);

/**
 * The parts said once for every case (rule 1): a row every case has with one content, else, in each currency at least two cases hold it
 * in, one content there. Nothing is said once where every case would then show nothing: equal cases are read by their merged cells.
 */
function sharedOf(cases: readonly LayoutCase[], rows: readonly string[]): Shared[] {
  if (cases.length < 2) return [];
  const out: Shared[] = [];
  for (const row of rows) {
    const parts = cases.map((c) => partIn(c, row));
    if (parts.some((p) => !p)) continue;
    const all = parts as LayoutPart[];
    if (new Set(all.map((p) => p.key)).size === 1) {
      out.push({ row, key: all[0]!.key, currency: null, cases: cases.map((c) => c.id) });
      continue;
    }
    const currencies = [...new Set(all.map((p) => p.currency))];
    if (currencies.length < 2) continue;
    for (const cur of currencies) {
      if (cur === null) continue;
      const inCur = cases.filter((_, k) => all[k]!.currency === cur);
      const keys = new Set(inCur.map((c) => partIn(c, row)!.key));
      if (inCur.length >= 2 && keys.size === 1) out.push({ row, key: [...keys][0]!, currency: cur, cases: inCur.map((c) => c.id) });
    }
  }
  const left = (c: LayoutCase) => c.parts.filter((p) => !out.some((s) => s.row === p.row && s.cases.includes(c.id)));
  return cases.every((c) => left(c).length === 0) ? [] : out;
}

/** The part rows each case shows once `said` is said elsewhere, in the rows' order. */
function showsOf(cases: readonly LayoutCase[], rows: readonly string[], said: readonly Shared[]): Record<string, string[]> {
  return Object.fromEntries(cases.map((c) => [c.id, rows.filter((r) => partIn(c, r) && !said.some((s) => s.row === r && s.cases.includes(c.id)))]));
}

/**
 * The parts common to a set of cells (a grid's row or column), each case showing `shows`: those every case shows with one content. None
 * where fewer than two cases, or where every case would then show nothing.
 */
function commonOf(ids: readonly string[], byId: ReadonlyMap<string, LayoutCase>, shows: Record<string, string[]>): Shared[] {
  if (ids.length < 2) return [];
  const first = byId.get(ids[0]!)!;
  const out: Shared[] = [];
  for (const row of shows[first.id]!) {
    const key = partIn(first, row)!.key;
    if (ids.every((id) => shows[id]!.includes(row) && partIn(byId.get(id)!, row)!.key === key)) out.push({ row, key, currency: null, cases: [...ids] });
  }
  return ids.every((id) => shows[id]!.length === out.length) ? [] : out;
}

const without = (shows: Record<string, string[]>, said: readonly Shared[]) => {
  for (const s of said) for (const id of s.cases) shows[id] = shows[id]!.filter((r) => r !== s.row);
};

/** One thing: the cases as columns (a range's ascending), the parts as rows, equal neighbours merged in each row. */
function tableOf(input: LayoutInput, shared: Shared[], shows: Record<string, string[]>): FeeLayout {
  const range = input.things[0]!.range;
  const rank = (c: LayoutCase) => (typeof c.when[0] === "number" ? c.when[0] : Infinity);
  const cases = range ? [...input.cases].sort((a, b) => rank(a) - rank(b)) : [...input.cases];
  const columns = cases.map((c) => ({ case: c.id, when: c.when[0]! }));
  const rows = input.rows.flatMap((row) => {
    const keys = cases.map((c) => (shows[c.id]!.includes(row) ? partIn(c, row)!.key : null));
    if (keys.every((k) => k === null)) return [];
    const cells: TableCell[] = [];
    keys.forEach((key, k) => {
      const last = cells.at(-1);
      if (last && last.key === key) {
        last.span++;
        last.cases.push(cases[k]!.id);
      } else cells.push({ from: k, span: 1, cases: [cases[k]!.id], key });
    });
    return [{ row, cells }];
  });
  return { shape: "table", thing: 0, ladder: range, fit: cases.length > MAX_COLUMNS ? "rows" : "columns", columns, rows, shared, shows, add: { thing: 0, range } };
}

/**
 * Two or three things: the grid of the first thing down and the second across, over the cases on the switch's value where there is a
 * third; null where the cases do not fall one to a place.
 */
function gridOf(input: LayoutInput, shared: Shared[], shows: Record<string, string[]>): FeeLayout | null {
  const { things } = input;
  let visible = input.cases;
  let sw: { thing: number; values: Head[]; chosen: string } | null = null;
  if (things.length === 3) {
    const values = headsOf(input.cases, 2, things[2]!.range, true);
    if (values.length > 0) {
      const chosen = values.find((v) => v.key === input.switchTo)?.key ?? values[0]!.key;
      sw = { thing: 2, values, chosen };
      visible = input.cases.filter((c) => c.when[2] === "any" || valueKey(c.when[2]!) === chosen);
    }
  }
  const down = headsOf(visible, 0, things[0]!.range);
  const across = headsOf(visible, 1, things[1]!.range, true);
  if (across.length === 0) return null;
  const byId = new Map(input.cases.map((c) => [c.id, c]));
  const rows: (Head & { cells: GridCell[]; shared: Shared[] })[] = [];
  for (const r of down) {
    const inRow = r.cases.map((id) => byId.get(id)!);
    const whole = inRow.filter((c) => c.when[1] === "any");
    if (whole.length > 0) {
      if (inRow.length > 1) return null;
      rows.push({ ...r, cells: [{ from: 0, span: across.length, case: whole[0]!.id, whole: true }], shared: [] });
      continue;
    }
    const cells: GridCell[] = [];
    for (const [k, col] of across.entries()) {
      const here = inRow.filter((c) => valueKey(c.when[1]!) === col.key);
      if (here.length > 1) return null;
      cells.push({ from: k, span: 1, case: here[0]?.id ?? null, whole: false });
    }
    rows.push({ ...r, cells, shared: [] });
  }
  // a row's line, then a column's, each over what the cells still show
  for (const row of rows) {
    row.shared = commonOf(row.cells.flatMap((c) => (c.case && !c.whole ? [c.case] : [])), byId, shows);
    without(shows, row.shared);
  }
  const columns = across.map((col, k) => {
    const cells = rows.map((r) => r.cells.find((c) => c.from <= k && k < c.from + c.span)!);
    const own = cells.every((c) => c.case !== null && c.span === 1) ? cells.map((c) => c.case!) : [];
    const said = commonOf(own, byId, shows);
    without(shows, said);
    return { ...col, shared: said };
  });
  return { shape: "grid", down: { thing: 0, range: things[0]!.range }, across: { thing: 1, range: things[1]!.range }, switch: sw, rows, columns, shared, shows };
}

/** A fee's cases laid out by its shape (see the head of this file). */
export function layoutOf(input: LayoutInput): FeeLayout {
  const shared = sharedOf(input.cases, input.rows);
  const shows = showsOf(input.cases, input.rows, shared);
  if (input.things.length === 1) return tableOf(input, shared, shows);
  const grid = gridOf(input, shared, { ...shows });
  if (grid) return grid;
  return { shape: "rows", cases: input.cases.map((c) => c.id), shared, shows, add: null };
}
