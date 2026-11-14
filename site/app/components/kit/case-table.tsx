// A fee's cases laid out by the fee's shape (design-system 11, "Cases and parts"; the layout is lib/fee-deal/layout.ts): under the
// condition's head, a table for a fee that changes by one thing (its cases as columns, its parts as rows, a range's steps ascending as a
// ladder), a grid for two (the first thing down the side, the second across the top, a third as a switch above it, and under a row's
// cells a cell for each part its cells hold alike), and beside the heads a small dashed pill that adds a case, a step, a row or a column:
// at the end of the column heads, and under the row heads. Each head, row and cell may carry a grip (⋮⋮, lift.tsx) and stand in a drop
// zone, and each cell a knob on its edges that stretches it over its neighbours; a cell covering its whole row says so under its parts. A
// part every case holds alike is one cell over every column, not a line of its own. Narrower than a
// table needs, the page reads the same cases as rows (`ConditionBand`, `CaseRow`, `CaseGroup`); a table squeezed anyway scrolls inside
// itself, never widening the page. The cells are dark cells on the fee's card, outside the cases' blue; the case open stands under the
// table, its column or cell outlined in the action colour.
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, Plus } from "lucide-react";
import { LIFT_INNER } from "./choice";
import { cx } from "./cx";

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true, className: "shrink-0" } as const;
/** The open case's column head and cells: the action colour's outline, as the open case's own. */
const OPEN = "outline-2 -outline-offset-2 outline-primary";
const CELL = "flex min-h-target min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

/** A click on a cell opens its case, unless it fell on a control of its own (a figure's source, a field). */
const opener = (onOpen?: () => void) => (onOpen ? (e: MouseEvent) => !(e.target as Element).closest("button, a, input, [data-lift]") && onOpen() : undefined);

/**
 * The keys of a table's or a grid's cells, as a spreadsheet's: the arrows move between cells (right to left: the left arrow goes on to
 * the next column in reading order), Home and End to the row's ends, Tab and Shift+Tab to the next and the previous cell (past the last,
 * the focus leaves the table); Enter edits the cell's one figure, or opens its case where it holds more; Delete takes it away where it
 * can be; Shift with an arrow stretches it over its neighbour or back; Esc, in a figure's field, goes back to the cell. One cell is in the
 * Tab order at a time (the last one focused), so the table is one stop. Each cell is named by its row's head and its column's.
 */
function useCellKeys() {
  const id = useId();
  const [active, setActive] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const cells = () => [...(root.current?.querySelectorAll<HTMLElement>("[role=gridcell]") ?? [])];
  const pos = (el: HTMLElement) => ({ row: Number(el.dataset.row), rows: Number(el.dataset.rows ?? 1), from: Number(el.dataset.from), span: Number(el.dataset.span) });
  const go = (el: HTMLElement | undefined) => {
    if (!el) return false;
    el.focus();
    return true;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLElement>("[role=gridcell]");
    if (!cell || !root.current?.contains(cell)) return;
    // in a figure's field: Esc goes back to the cell once the field has put its figure back
    if (target !== cell) {
      if (e.key === "Escape") requestAnimationFrame(() => cell.isConnected && cell.focus());
      return;
    }
    const all = cells();
    const here = pos(cell);
    // a cell down over several rows stands in each of them
    const inRow = (row: number) => all.filter((c) => pos(c).row <= row && row < pos(c).row + pos(c).rows).sort((a, b) => pos(a).from - pos(b).from);
    const at = (row: number, col: number) => inRow(row).find((c) => pos(c).from <= col && col < pos(c).from + pos(c).span);
    const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
    const vstep = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    let moved = false;
    if ((step || vstep) && e.shiftKey) {
      cell.dispatchEvent(new CustomEvent("cell-stretch", { detail: step ? { axis: "x", by: step } : { axis: "y", by: vstep } }));
      moved = true;
    } else if (step) moved = go(at(here.row, step > 0 ? here.from + here.span : here.from - 1));
    else if (vstep) moved = go(at(vstep > 0 ? here.row + here.rows : here.row - 1, here.from));
    else if (e.key === "Home") moved = go(inRow(here.row)[0]);
    else if (e.key === "End") moved = go(inRow(here.row).at(-1));
    else if (e.key === "Tab") {
      const order = [...all].sort((a, b) => pos(a).row - pos(b).row || pos(a).from - pos(b).from);
      moved = go(order[order.indexOf(cell) + (e.shiftKey ? -1 : 1)]);
    } else if (e.key === "Enter" || e.key === "F2") {
      const figures = cell.querySelectorAll<HTMLElement>("[data-edit-in-place='']");
      if (figures.length === 1) figures[0]!.click();
      else cell.dispatchEvent(new CustomEvent("cell-open"));
      moved = true;
    } else if (e.key === "Delete") {
      cell.dispatchEvent(new CustomEvent("cell-remove"));
      moved = true;
    }
    if (moved) e.preventDefault();
  };
  /**
   * What a cell spreads: its role and place (`row`, the line it stands on, and the lines it spans), its names (its row's head, `head` where
   * the row has more lines than one, its column's, its own words), and the Tab order's one stop.
   */
  const cellProps = (row: number, from: number, span: number, first: boolean, rows = 1, head = row) => {
    const key = `${row}:${from}`;
    return {
      role: "gridcell",
      "data-row": row,
      "data-rows": rows,
      "data-from": from,
      "data-span": span,
      tabIndex: (active === null ? first : active === key) ? 0 : -1,
      "aria-labelledby": `${id}-r${head} ${id}-c${from} ${id}-x${key}`,
      onFocus: (e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && setActive(key),
    };
  };
  return { root, onKeyDown, cellProps, headId: (k: number) => `${id}-c${k}`, rowId: (j: number) => `${id}-r${j}`, wordsId: (row: number, from: number) => `${id}-x${row}:${from}` };
}

/** The focus ring of a cell, and the events its keys send it (`useCellKeys`): open, take away, stretch. */
const CELL_FOCUS = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
function cellEvents(el: HTMLElement | null, hands: { onOpen?: () => void; onRemove?: () => void; onStretch?: (by: 1 | -1) => void; onStretchDown?: (by: 1 | -1) => void }) {
  if (!el) return;
  const open = () => hands.onOpen?.();
  const remove = () => hands.onRemove?.();
  const stretch = (e: Event) => {
    const d = (e as CustomEvent<{ axis: "x" | "y"; by: 1 | -1 }>).detail;
    (d.axis === "x" ? hands.onStretch : hands.onStretchDown)?.(d.by);
  };
  el.addEventListener("cell-open", open);
  el.addEventListener("cell-remove", remove);
  el.addEventListener("cell-stretch", stretch);
  return () => {
    el.removeEventListener("cell-open", open);
    el.removeEventListener("cell-remove", remove);
    el.removeEventListener("cell-stretch", stretch);
  };
}

/** Read as rows, the parts one cell holds for every case, said once: its lead (the thing's any-words, "בכל מסלול:") and the parts, in a quiet line above the rows. */
export function SharedLine({ lead, children }: { lead: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
      <span className="text-muted-foreground">{lead}</span>
      {children}
    </div>
  );
}

/** What an add slot says and does: its words after the plus, and its tap (at the slot, for a question that hangs from it); `expanded` while its question is open. */
export interface AddSpec {
  label: string;
  /** Its spoken name, where its words alone do not say where it adds ("להוסיף מקרה כאן: מק״מ · בסניף"). */
  spoken?: string;
  onAdd: (at: HTMLElement) => void;
  expanded?: boolean;
}

/**
 * What adds a new case, step, row or column: a dashed frame with a plus and its words in the action colour. A `row` stands as wide as
 * what it is under (the cases read as rows, a grid's place no case holds); a `pill` is small, beside the heads (at the end of the column
 * heads, under the row heads), 32 px tall with a 44 px press.
 */
export function AddSlot({ add, shape, className }: { add: AddSpec; shape: "row" | "pill"; className?: string }) {
  return (
    <button
      type="button"
      data-add-slot={shape}
      aria-expanded={add.expanded}
      aria-label={add.spoken}
      onClick={(e) => add.onAdd(e.currentTarget)}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 border border-dashed border-primary text-sm text-primary transition-colors duration-[var(--duration-fast)] hover:bg-accent",
        shape === "row" ? "min-h-target w-full rounded-md px-3" : "tap-area h-8 w-max shrink-0 whitespace-nowrap rounded-full px-3",
        add.expanded && "bg-accent",
        className,
      )}
    >
      <Plus {...icon} />
      {add.label}
    </button>
  );
}

/**
 * A column's head that opens its case: one button over the whole head (`label`, its spoken name), the words drawn on it; a control inside
 * (a step's top typed in place, marked `data-lift`) keeps its own tap.
 */
function OpenHead({ label, onOpen, open, range, grip, children }: { label: string; onOpen: () => void; open?: boolean; range?: boolean; grip?: ReactNode; children: ReactNode }) {
  return (
    <div data-case-head="" data-liftable="" className={cx("group relative flex h-full min-h-target min-w-0 items-end gap-1.5 rounded-md border-b border-border px-1.5 pt-1 pb-1.5 text-sm font-medium cursor-pointer", LIFT_INNER, open && OPEN)}>
      <button type="button" data-pick-card aria-label={label} onClick={onOpen} className="absolute inset-0 w-full rounded-md group-hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />
      {grip}
      {range && <ChartNoAxesColumnIncreasing {...icon} className="relative mb-0.5 shrink-0 text-when-ink pointer-events-none" />}
      <div className="relative flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 pointer-events-none [&_[data-lift]]:pointer-events-auto">{children}</div>
    </div>
  );
}

/**
 * What a cell may carry beside its content: a grip that lifts it (`grip`), knobs on its edges that stretch it (`knobs`), the words that it
 * covers its whole row (`whole`), and whether a knob's stretch reaches it now (`lit`).
 */
export interface CellExtras {
  grip?: ReactNode;
  knobs?: ReactNode;
  whole?: ReactNode;
  lit?: boolean;
  /** Delete on the cell: what its grip's bin does. */
  onRemove?: () => void;
  /** Shift with an arrow on the cell: its knob's stretch by one column (1: on in reading order, -1: back). */
  onStretch?: (by: 1 | -1) => void;
  /** Shift with the down or up arrow on a grid's cell: its stretch by one row (1: down, -1: back up). */
  onStretchDown?: (by: 1 | -1) => void;
  /** Wraps the cell (a `DropZone` for its case). */
  zone?: (cell: ReactNode) => ReactNode;
}

/** A knob's stretch reaching a cell: the action colour's dashed outline. */
const LIT = "outline-2 outline-dashed -outline-offset-2 outline-primary";

/** A table's column: its case's id, its head's words, the head's spoken name and tap, whether its case is open, and its grip. */
export interface CaseColumn {
  id: string;
  head: ReactNode;
  label: string;
  onOpen: () => void;
  open?: boolean;
  grip?: ReactNode;
  /** Wraps the head (a `DropZone` for its case). */
  zone?: (head: ReactNode) => ReactNode;
}

/**
 * A part row of a table: its head ("שיעור", "מינימום") with its grip, and its cells, each spanning `span` columns from `from`, the case its
 * tap opens; a cell whose `content` is null (no such part) is an empty place, which still takes a drop (`zone`).
 */
export interface CaseTableRow {
  id: string;
  head: ReactNode;
  grip?: ReactNode;
  cells: ({ from: number; span: number; open?: boolean; onOpen?: () => void; content: ReactNode; label?: string } & CellExtras)[];
}

/** A cell's place in a table or a grid: its columns, after the heads' column, in its row. */
const placeOf = (from: number, span: number, row: number) => ({ gridColumn: `${from + 2} / span ${span}`, gridRow: row });

/**
 * A fee that changes by one thing, as a table: the cases as columns (`columns`, heads that open their case), the parts as rows (`rows`),
 * a merged cell where neighbours are equal, and at the end of the heads the pill that adds a case or a step (`add`). `ladder`: the thing is
 * a range, its steps ascending, each head with the range's icon. `foot`: what stands under the table (the bin while something is lifted).
 */
export function CaseTable({ columns, rows, add, ladder, foot, label }: { columns: CaseColumn[]; rows: CaseTableRow[]; add?: AddSpec; ladder?: boolean; foot?: ReactNode; /** The table's spoken name: its fee's. */ label?: string }) {
  const n = columns.length;
  const keys = useCellKeys();
  // a ladder's head holds a step's two bounds and its top's box, on one line where they fit, else wrapped inside the column
  const template = `minmax(5.5rem, max-content) repeat(${n}, minmax(${ladder ? "11rem" : "7.5rem"}, 1fr))${add ? " max-content" : ""}`;
  return (
    <div className="flex flex-col gap-2">
      <div ref={keys.root} role="grid" aria-label={label} onKeyDown={keys.onKeyDown} data-case-table="" data-span-table="" className="grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto px-0.5 pt-0.5 pb-2" style={{ gridTemplateColumns: template }}>
        <div role="row" className="contents">
          <span aria-hidden />
          {columns.map((c, k) => {
            const head = (
              <OpenHead key={c.id} label={c.label} onOpen={c.onOpen} open={c.open} range={ladder} grip={c.grip}>
                {c.head}
              </OpenHead>
            );
            return (
              // every head fills the row's height, its words at its foot: the heads stand on one line, a head that wraps growing the row
              <div key={c.id} role="columnheader" id={keys.headId(k)} data-col={k} className="flex min-w-0 *:w-full" style={{ gridColumn: k + 2, gridRow: 1 }}>
                {c.zone ? c.zone(head) : head}
              </div>
            );
          })}
          {add && (
            <div className="flex items-center" style={{ gridColumn: n + 2, gridRow: 1 }}>
              <AddSlot add={add} shape="pill" />
            </div>
          )}
        </div>
        {rows.map((r, j) => (
          <div key={r.id} role="row" className="contents">
            <div role="rowheader" id={keys.rowId(j)} data-liftable="" className="flex items-center gap-1 text-sm text-muted-foreground" style={{ gridColumn: 1, gridRow: j + 2 }}>
              {r.grip}
              {r.head}
            </div>
            {r.cells.map((cell, i) => {
              const place = placeOf(cell.from, cell.span, j + 2);
              const cp = keys.cellProps(j, cell.from, cell.span, j === 0 && i === 0);
              const hands = { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch };
              if (cell.content === null) {
                // a case with no such part: an empty place, no cell drawn; it still takes a part dropped on it
                const empty = <span {...cp} ref={(el) => cellEvents(el, hands)} className={cx("block h-full min-h-target rounded-md", CELL_FOCUS)}><span id={keys.wordsId(j, cell.from)} /></span>;
                return (
                  <div key={cell.from} style={place} className="*:h-full">
                    {cell.zone ? cell.zone(empty) : empty}
                  </div>
                );
              }
              const el = (
                <div {...cp} ref={(el) => cellEvents(el, hands)} data-liftable="" onClick={opener(cell.onOpen)} className={cx(CELL, CELL_FOCUS, "group/cell relative h-full", cell.onOpen && "cursor-pointer hover:bg-accent", cell.open && "border-primary", cell.lit && LIT)}>
                  {cell.grip}
                  <span id={keys.wordsId(j, cell.from)} className="contents">
                    {cell.content}
                    {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                  </span>
                  {cell.knobs}
                </div>
              );
              return (
                <div key={cell.from} style={place} className="min-w-0 *:h-full">
                  {cell.zone ? cell.zone(el) : el}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {foot}
    </div>
  );
}

/** A grid's row or column head: its value's words, its grip and its drop zone. */
export interface GridHead {
  id: string;
  head: ReactNode;
  grip?: ReactNode;
  zone?: (head: ReactNode) => ReactNode;
}

/** A cell of one part row under a grid's row: the columns it spans, the parts its cases hold alike there, and its tap. */
export interface PartCellView extends CellExtras {
  from: number;
  span: number;
  content: ReactNode;
  label?: string;
  onOpen?: () => void;
  open?: boolean;
}

/**
 * A grid's cell: the columns it spans; its case's parts (`content`), its spoken name and tap, whether it is open, and the words of a case
 * on any value across ("בכל ערוץ") after its parts; or, for a place no case holds, `empty`, the dashed slot that adds a case there.
 */
export interface GridCellView extends CellExtras {
  from: number;
  span: number;
  /** The rows it spans down, where more than its own; the cells it covers in the rows under it are not given. */
  down?: number;
  content?: ReactNode;
  label?: string;
  onOpen?: () => void;
  open?: boolean;
  across?: ReactNode;
  empty?: AddSpec;
}

/**
 * A grid's head, its grip and its words, filling its place so the whole head is what is lifted and dropped on: a row's as tall as its row
 * and its lines, a column's as wide as its column, at the foot of its row over a hairline so the heads stand on one line; the words in its
 * middle.
 */
function HeadWords({ head, end, grip }: { head: ReactNode; end?: boolean; grip?: ReactNode }) {
  return (
    <div data-case-head="" data-liftable="" className={cx("flex h-full min-w-0 flex-col items-center gap-0.5 rounded-md text-center text-sm", end ? "justify-end border-b border-border pb-1.5" : "justify-center")}>
      <div className="flex items-center justify-center gap-1 font-medium">
        {grip}
        <span className="min-w-0">{head}</span>
      </div>
    </div>
  );
}

/**
 * A fee that changes by two things, as a grid: the first thing's values down the side (`rows`), the second's across the top (`columns`);
 * one cell per case (equal neighbours one cell), a button over the whole cell that opens it, a case on any value across spanning its row;
 * under a row's cells, its `lines`, one per part row, each a cell of the parts two or more of its cells hold alike over them; at the end of
 * the column heads the pill that adds a value across (`addColumn`), and under the row heads the pill that adds a value down (`addRow`).
 * A row's head is as tall as its cells and its lines. `above`: the switch of a third thing. `steps`: the values across are a ladder's
 * steps, whose heads hold a box each, and take the room for it. `foot`: what stands under the grid.
 */
export function CaseGrid({ columns, rows, addRow, addColumn, above, steps, foot, label }: { columns: GridHead[]; rows: (GridHead & { cells: GridCellView[]; lines?: { id: string; cells: PartCellView[] }[] })[]; addRow?: AddSpec; addColumn?: AddSpec; above?: ReactNode; steps?: boolean; foot?: ReactNode; /** The grid's spoken name: its fee's. */ label?: string }) {
  const n = columns.length;
  const keys = useCellKeys();
  // a row's head wraps past 9 rem, so the values across keep their room
  const template = `minmax(6rem, 9rem) repeat(${n}, minmax(${steps ? "11rem" : "8rem"}, 1fr))${addColumn ? " max-content" : ""}`;
  // each row stands on its cells' line and its part lines under them: the line it starts on, after the heads' line
  const height = rows.map((r) => 1 + (r.lines?.length ?? 0));
  const start = height.reduce<number[]>((acc, _, j) => [...acc, j === 0 ? 0 : acc[j - 1]! + height[j - 1]!], []);
  const lines = start.at(-1)! + height.at(-1)!;
  return (
    <div className="flex flex-col gap-2">
      {above}
      <div ref={keys.root} role="grid" aria-label={label} onKeyDown={keys.onKeyDown} data-case-grid="" data-span-table="" className="grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto px-0.5 pt-2.5 pb-2" style={{ gridTemplateColumns: template }}>
        <div role="row" className="contents">
          <span aria-hidden />
          {columns.map((c, k) => {
            const head = <HeadWords head={c.head} end grip={c.grip} />;
            return (
              <div key={c.id} role="columnheader" id={keys.headId(k)} data-col={k} style={{ gridColumn: k + 2, gridRow: 1 }} className="flex *:w-full">
                {c.zone ? c.zone(head) : head}
              </div>
            );
          })}
          {addColumn && (
            <div className="flex items-center" style={{ gridColumn: n + 2, gridRow: 1 }}>
              <AddSlot add={addColumn} shape="pill" />
            </div>
          )}
        </div>
        {rows.map((r, j) => {
          const head = <HeadWords head={r.head} grip={r.grip} />;
          const line = start[j]!;
          return (
            <div key={r.id} role="row" className="contents">
              <div role="rowheader" id={keys.rowId(j)} data-rowpos={j} style={{ gridColumn: 1, gridRow: `${line + 2} / span ${height[j]}` }} className="flex *:w-full">
                {r.zone ? r.zone(head) : head}
              </div>
              {r.cells.map((cell, i) => {
                // a cell down over several rows spans their lines too
                const last = j + (cell.down ?? 1) - 1;
                const spanned = start[last]! + height[last]! - line;
                const place = { ...placeOf(cell.from, cell.span, line + 2), ...(cell.down ? { gridRow: `${line + 2} / span ${spanned}` } : {}) };
                const cp = keys.cellProps(line, cell.from, cell.span, j === 0 && i === 0, cell.down ? spanned : 1, j);
                if (cell.empty) {
                  const add = cell.empty;
                  const el = (
                    <div {...cp} ref={(x) => cellEvents(x, { onOpen: () => x?.querySelector<HTMLElement>("[data-add-slot]")?.click() })} className={cx("h-full rounded-md", CELL_FOCUS, cell.lit && LIT)}>
                      <span id={keys.wordsId(line, cell.from)} className="contents">
                        <AddSlot add={add} shape="row" className="h-full" />
                      </span>
                    </div>
                  );
                  return (
                    <div key={cell.from} style={place} className="*:h-full">
                      {cell.zone ? cell.zone(el) : el}
                    </div>
                  );
                }
                const el = (
                  <div {...cp} ref={(x) => cellEvents(x, { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch, onStretchDown: cell.onStretchDown })} data-liftable="" className={cx("group group/cell relative h-full cursor-pointer rounded-md", CELL_FOCUS, LIFT_INNER)}>
                    {cell.onOpen && <button type="button" tabIndex={-1} data-pick-card aria-label={cell.label} onClick={cell.onOpen} className="absolute inset-0 w-full rounded-md" />}
                    <div className={cx(CELL, "h-full group-hover:bg-accent", cell.open && OPEN, cell.lit && LIT)}>
                      {cell.grip}
                      <span id={keys.wordsId(line, cell.from)} className="contents">
                        {cell.content}
                        {cell.across && <span className="text-muted-foreground">{cell.across}</span>}
                        {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                      </span>
                    </div>
                    {cell.knobs}
                  </div>
                );
                return (
                  <div key={cell.from} style={place} className="min-w-0 *:h-full">
                    {cell.zone ? cell.zone(el) : el}
                  </div>
                );
              })}
              {r.lines?.map((pl, L) =>
                pl.cells.map((cell) => {
                  const at = line + 1 + L;
                  const cp = keys.cellProps(at, cell.from, cell.span, false, 1, j);
                  const el = (
                    <div {...cp} ref={(x) => cellEvents(x, { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch })} data-liftable="" data-part-cell={pl.id} onClick={opener(cell.onOpen)} className={cx(CELL, CELL_FOCUS, "group/cell relative h-full", cell.onOpen && "cursor-pointer hover:bg-accent", cell.open && "border-primary", cell.lit && LIT)}>
                      {cell.grip}
                      <span id={keys.wordsId(at, cell.from)} className="contents">
                        {cell.content}
                        {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                      </span>
                      {cell.knobs}
                    </div>
                  );
                  return (
                    <div key={`${pl.id}:${cell.from}`} style={placeOf(cell.from, cell.span, at + 2)} className="min-w-0 *:h-full">
                      {cell.zone ? cell.zone(el) : el}
                    </div>
                  );
                }),
              )}
            </div>
          );
        })}
        {addRow && (
          <div className="flex" style={{ gridColumn: 1, gridRow: lines + 2 }}>
            <AddSlot add={addRow} shape="pill" />
          </div>
        )}
      </div>
      {foot}
    </div>
  );
}
