// A fee's cases laid out by the fee's shape (design-system 11, "Cases and parts"; the layout is lib/fee-deal/layout.ts): under the
// condition's head, a table for a fee that changes by one thing (its cases as columns, its parts as rows, a range's steps ascending as a
// ladder), a grid for two (the first thing down the side, the second across the top, a third as a switch above it, and under a row's
// cells a cell for each part its cells hold alike), and beside the heads a small plus knob that adds a case, a step, a row or a column:
// always at the end of the column heads and under the row heads, and on the line between two heads while the pointer rests there, adding
// exactly there. Each head, row and cell may carry a grip (⋮⋮, lift.tsx) and stand in a drop zone, each cell a knob on its edges that
// stretches it over its neighbours and, where it can be taken away, a small bin in its top end corner; a cell covering its whole row says
// so under its parts. A
// part every case holds alike is one cell over every column, not a line of its own. Under a row a slim strip drawn while the pointer is
// there adds a part to every case of it. A column or a row carried stands as its gap with its cells, and each cell keeps its id, so a move
// slides it. Narrower than a computer's block, the page reads the same cases as rows (`ConditionBand`, `CaseRow`, `CaseGroup`); a table
// wider than its block scrolls inside itself, never widening the page. The cells are dark cells on the fee's card, outside the cases' blue; the case open stands under the
// table, its column or cell outlined in the action colour. A cell with a `copyKey` is one the page copies and pastes on.
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, Plus } from "lucide-react";
import { LIFT_INNER, onSurface } from "./choice";
import { useCarried } from "./drag-drop";
import { cx } from "./cx";
import { KnobButton } from "./knob-button";
import { RemoveButton } from "./remove-button";

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true, className: "shrink-0" } as const;
/** The open case's column head and cells: the action colour's outline, as the open case's own. */
const OPEN = "outline-2 -outline-offset-2 outline-primary";
// a cell's lines stand together from its top, however tall its row makes it, so its first line stands level with its row's head and the
// cells beside it (`ROW_HEAD`)
const CELL = "flex min-h-target min-w-0 flex-wrap content-start items-center gap-x-1.5 gap-y-0.5 rounded-md border border-border bg-background px-2.5 py-[calc(0.75rem-1px)] text-sm leading-5";
/** A row's head: its words from the top, on the line a cell's first line stands on (the cell's border and padding over a 20 px line). */
const ROW_HEAD = "pt-3 leading-5";

/** A click on a cell opens its case, its padding too, unless it fell on something with a tap of its own (a figure, a field, a grip, a knob). */
const opener = (onOpen?: () => void) => (onOpen ? (e: MouseEvent) => onSurface(e) && onOpen() : undefined);

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
 * What adds a new case, row or column where it stands in the table's own room (a grid's place no case holds, the cases read as rows, a
 * price's "+ המחיר משתנה מתאריך"): a dashed frame as wide as what it is under, a plus and its words in the action colour. Beside the heads
 * the add is a plus knob (`HeadAdd`, `BetweenAdd`).
 */
export function AddSlot({ add, className }: { add: AddSpec; className?: string }) {
  return (
    <button
      type="button"
      data-add-slot="row"
      aria-expanded={add.expanded}
      aria-label={add.spoken}
      onClick={(e) => add.onAdd(e.currentTarget)}
      className={cx(
        "inline-flex min-h-target w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-primary px-3 text-sm text-primary transition-colors duration-[var(--duration-fast)] hover:bg-accent",
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
 * The plus at the end of the column heads, or under the row heads, that adds a case, a step, a row or a column (`add`, its words spoken and
 * in its title): a knob always drawn, standing alone, so its press reaches 44 px both ways. At the heads' end its column is that press's
 * width: a press reaching past the table's edge would make the table scroll sideways by it.
 */
function HeadAdd({ add, style, className }: { add: AddSpec; style: CSSProperties; className: string }) {
  return (
    <div style={style} className={className}>
      <KnobButton icon={Plus} label={add.spoken ?? add.label} wide expanded={add.expanded} data-head-add="" onClick={(e) => add.onAdd(e.currentTarget)} />
    </div>
  );
}

/**
 * The plus on the line between two heads that adds a new column (`axis` x, the line at the inline end of the head it stands with) or a
 * new row (`axis` y, the line under it) exactly there (`add`). It takes no room: a zero-wide place at that edge holds a strip 16 px across
 * straddling the gap between the heads, and the knob is drawn only while a fine pointer rests on that strip (app.css,
 * `data-between-add`); the keyboard and touch reach the same through the head's menu ("הוספה לפני", "הוספה אחרי"). Under a figure's own
 * box: a figure in a head beside it keeps its press.
 */
function BetweenAdd({ add, axis, style }: { add: AddSpec; axis: "x" | "y"; style: CSSProperties }) {
  return (
    <div style={style} className={cx("pointer-events-none relative", axis === "x" ? "w-0 justify-self-end" : "h-0 self-end")}>
      <div data-between-add={axis} className={cx("absolute flex items-center justify-center", axis === "x" ? "inset-y-0 -end-3 w-4" : "inset-x-0 -bottom-[11px] h-4")}>
        <KnobButton icon={Plus} label={add.spoken ?? add.label} tabIndex={-1} expanded={add.expanded} onClick={(e) => add.onAdd(e.currentTarget)} />
      </div>
    </div>
  );
}

/**
 * A head's room for its grip: the grip stands over the head's start edge, centred down it (app.css, `data-grip-box`, 2 px in and 20 px
 * wide), and the head's words start 28 px in, so at any length the grip covers none of them.
 */
const GRIP_ROOM = "ps-7";

/**
 * A column's head that opens its case: one button over the whole head (`label`, its spoken name), the words drawn on it; a control inside
 * (a step's top typed in place, marked `data-lift`) keeps its own tap.
 */
function OpenHead({ label, onOpen, open, range, grip, children }: { label: string; onOpen: () => void; open?: boolean; range?: boolean; grip?: ReactNode; children: ReactNode }) {
  return (
    <div data-case-head="" data-liftable="" className={cx("group relative flex h-full min-h-target min-w-0 items-end gap-1.5 rounded-md border-b border-border pe-1.5 pt-1 pb-1.5 text-sm font-medium cursor-pointer", grip ? GRIP_ROOM : "ps-1.5", LIFT_INNER, open && OPEN)}>
      <button type="button" data-pick-card aria-label={label} onClick={onOpen} className="absolute inset-0 w-full rounded-md group-hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />
      {grip}
      {range && <ChartNoAxesColumnIncreasing {...icon} className="relative mb-0.5 shrink-0 text-when-ink pointer-events-none" />}
      <div data-head-words="" className="relative flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 pointer-events-none [&_[data-lift]]:pointer-events-auto">{children}</div>
    </div>
  );
}

/** A column's head that opens nothing (a value no case names): its words at its foot, as an `OpenHead`'s, and its grip. */
function StillHead({ grip, children }: { grip?: ReactNode; children: ReactNode }) {
  return (
    <div data-case-head="" data-liftable="" className={cx("relative flex h-full min-h-target min-w-0 items-end gap-1.5 rounded-md border-b border-border pe-1.5 pt-1 pb-1.5 text-sm font-medium", grip ? GRIP_ROOM : "ps-1.5")}>
      {grip}
      <div data-head-words="" className="relative flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">{children}</div>
    </div>
  );
}

/**
 * What a cell may carry beside its content: a grip that lifts it (`grip`), knobs on its edges that stretch it (`knobs`), the words that it
 * covers its whole row (`whole`), and whether a knob's stretch reaches it now (`lit`), with what it would then show (`fill`).
 */
export interface CellExtras {
  grip?: ReactNode;
  knobs?: ReactNode;
  whole?: ReactNode;
  lit?: boolean;
  /** While a knob's stretch reaches the cell: the price it would take, shown in it as it would stand. */
  fill?: ReactNode;
  /** Delete on the cell: what its grip's bin does. */
  onRemove?: () => void;
  /** With `onRemove`, the spoken name of the small bin in the cell's top end corner (`CellBin`, "למחוק: מקסימום · מק״מ"). */
  removeLabel?: string;
  /** Shift with an arrow on the cell: its knob's stretch by one column (1: on in reading order, -1: back). */
  onStretch?: (by: 1 | -1) => void;
  /** Shift with the down or up arrow on a grid's cell: its stretch by one row (1: down, -1: back up). */
  onStretchDown?: (by: 1 | -1) => void;
  /** Wraps the cell (a `DropZone` for its case). */
  zone?: (cell: ReactNode) => ReactNode;
  /** Its key for the page's copy and paste (`data-copy-key`): Ctrl+C copies it where it has the focus, Ctrl+V pastes on it. */
  copyKey?: string;
}

/**
 * A cell's own bin (`removeLabel`, `onRemove`; `RemoveButton knob`): inside the cell's top end corner, 6 px from both edges, clear of the knob's
 * strip along the end edge; the cell's lines keep that corner free (`BIN_ROOM`), so it covers none of them. Its tap area reaches 44 px tall in the controls'
 * layer, under every figure's own box, so a figure it reaches keeps its press. Drawn only on a fine pointer, while the cell is under it or
 * has the keyboard's focus, and never while something is carried (app.css); touch takes a cell away by its grip's menu or a long press.
 */
function CellBin({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span data-cell-bin-box="" className="absolute top-1.5 end-1.5 h-5 w-5">
      <RemoveButton knob cell label={label} onRemove={onRemove} />
    </span>
  );
}

/** The bin a cell carries, where it can be taken away. */
const binOf = (cell: CellExtras) => (cell.onRemove && cell.removeLabel ? <CellBin label={cell.removeLabel} onRemove={cell.onRemove} /> : null);
/** A cell with a bin keeps its top end corner free for it: its lines end 30 px from its end edge, clear of the bin (6 px in, 20 px wide). */
const BIN_ROOM = "pe-[1.875rem]";
const binRoom = (cell: CellExtras) => (cell.onRemove && cell.removeLabel ? BIN_ROOM : undefined);

/** What a cell the page copies and pastes on spreads: its key. */
const copyAttr = (key: string | undefined) => (key !== undefined ? { "data-copy-key": key } : {});

/** A knob's stretch reaching a cell: the action colour's outline, the cell taking the price it would cover. */
const LIT = "outline-2 -outline-offset-2 outline-primary bg-accent";

/** What a cell shows: its own content, or, while a knob's stretch reaches it, the price it would take, faint until it is let go. */
function CellBody({ content, fill, lit }: { content: ReactNode; fill?: ReactNode; lit?: boolean }) {
  return lit && fill !== undefined ? <span className="contents [&>*]:opacity-80" data-reach-fill="">{fill}</span> : <>{content}</>;
}

/**
 * A table's column: its case's id, its head's words, the head's spoken name and tap, whether its case is open, and its grip. A column of a
 * value no case names (`empty`) has a head that opens nothing and, under it, over every row, the dashed slot that adds its case.
 */
export interface CaseColumn {
  id: string;
  head: ReactNode;
  label: string;
  onOpen: () => void;
  empty?: AddSpec;
  open?: boolean;
  grip?: ReactNode;
  /** The item its grip lifts: while it is carried, the column's own cells stand as its gap too. */
  liftItem?: string;
  /** Wraps the head (a `DropZone` for its case). */
  zone?: (head: ReactNode) => ReactNode;
}

/**
 * A part row of a table: its head ("שיעור", "מינימום") with its grip, and its cells, each spanning `span` columns from `from`, the case its
 * tap opens; a cell whose `content` is null (no such part) is an empty place, which still takes a drop (`zone`). A cell's `id` keeps it the
 * same cell when its column moves, so it slides there.
 */
export interface CaseTableRow {
  id: string;
  head: ReactNode;
  grip?: ReactNode;
  cells: ({ id?: string; from: number; span: number; open?: boolean; onOpen?: () => void; content: ReactNode } & CellExtras)[];
}

/** A cell's place in a table or a grid: its columns, after the heads' column, in its row. */
const placeOf = (from: number, span: number, row: number) => ({ gridColumn: `${from + 2} / span ${span}`, gridRow: row });

/** The column whose grip lifted the thing carried now, by its place; -1 where none. */
const carriedAt = (heads: readonly { liftItem?: string }[], carried: string | null) => (carried === null ? -1 : heads.findIndex((h) => h.liftItem === carried));

/** The places between `n` heads that take an insert: each `k` from 1 to `n - 1` (between head `k - 1` and head `k`) whose add is given. */
const betweenOf = (n: number, insert: (k: number) => AddSpec | null) => Array.from({ length: Math.max(0, n - 1) }, (_, i) => ({ k: i + 1, add: insert(i + 1) })).filter((x): x is { k: number; add: AddSpec } => x.add !== null);

/**
 * The plus under a row (or a table's last row) that adds a part to every case of it (`add`): a small knob like a cell's stretch knob, in the
 * middle of the row's foot, its words only spoken and in its title; drawn only while the pointer is over the row or the focus is in it
 * (`data-row-add`, app.css), straddling the room under it, so it takes none and moves nothing. The keyboard and touch reach the same
 * through the row head's menu.
 */
function RowAdd({ add, style }: { add: AddSpec; style: CSSProperties }) {
  // in the controls' layer (app.css, "The tap area"): over the cells and the figures' areas, under every figure's own box, so where it
  // reaches the next row's first line, a press on a figure there is still the figure's
  return (
    <div style={style} className="relative h-0 self-end">
      <KnobButton icon={Plus} label={add.spoken ?? add.label} tabIndex={-1} expanded={add.expanded} data-row-add="" onClick={(e) => add.onAdd(e.currentTarget)} className="absolute top-0 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

/**
 * A fee that changes by one thing, as a table: the cases as columns (`columns`, heads that open their case), the parts as rows (`rows`),
 * a merged cell where neighbours are equal, and at the end of the heads the plus knob that adds a case or a step (`add`); `insert`, the
 * plus on the line between column `k - 1` and column `k` that adds one there (none where it gives nothing). `ladder`: the thing is
 * a range, its steps ascending, each head with the range's icon. `addPart`: the strip under its last row that adds a part row across every
 * column. `foot`: what stands under the table (the bin while something is lifted, laid over what follows: the table is the element it is
 * placed by). Wider than its block, it scrolls inside itself, sideways only: what reaches past its foot for a moment (a cell sliding into
 * place, the plus's press under its last row) never gives it a scrollbar down.
 */
export function CaseTable({ columns, rows, add, insert, addPart, ladder, foot, label }: { columns: CaseColumn[]; rows: CaseTableRow[]; add?: AddSpec; insert?: (k: number) => AddSpec | null; addPart?: AddSpec; ladder?: boolean; foot?: ReactNode; /** The table's spoken name: its fee's. */ label?: string }) {
  const n = columns.length;
  const keys = useCellKeys();
  const gapCol = carriedAt(columns, useCarried());
  // a ladder's head holds a step's two bounds and its top's box, on one line where they fit, else wrapped inside the column
  const template = `minmax(5.5rem, max-content) repeat(${n}, minmax(${ladder ? "11rem" : "7.5rem"}, 1fr))${add ? " max-content" : ""}`;
  return (
    <div className="relative flex flex-col gap-2">
      <div ref={keys.root} role="grid" aria-label={label} onKeyDown={keys.onKeyDown} data-case-table="" data-span-table="" className="group/table grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto overflow-y-hidden px-0.5 pt-0.5 pb-2" style={{ gridTemplateColumns: template }}>
        <div role="row" className="contents">
          <span aria-hidden />
          {columns.map((c, k) => {
            const head = c.empty ? (
              <StillHead key={c.id} grip={c.grip}>
                {c.head}
              </StillHead>
            ) : (
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
          {add && <HeadAdd add={add} style={{ gridColumn: n + 2, gridRow: 1 }} className="flex min-w-target items-center justify-center" />}
          {insert && betweenOf(n, insert).map(({ k, add: a }) => <BetweenAdd key={`between:${k}`} add={a} axis="x" style={{ gridColumn: k + 1, gridRow: 1 }} />)}
        </div>
        {rows.map((r, j) => (
          <div key={r.id} role="row" className="contents">
            <div role="rowheader" id={keys.rowId(j)} data-liftable="" className={cx("flex items-start gap-1 text-sm text-muted-foreground", ROW_HEAD)} style={{ gridColumn: 1, gridRow: j + 2 }}>
              {r.grip}
              {r.head}
            </div>
            {r.cells.map((cell, i) => {
              const place = placeOf(cell.from, cell.span, j + 2);
              const cp = keys.cellProps(j, cell.from, cell.span, j === 0 && i === 0);
              const hands = { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch };
              const gap = gapCol >= 0 && cell.from === gapCol && cell.span === 1;
              if (cell.content === null) {
                // a case with no such part: an empty place, no cell drawn; it still takes a part dropped on it, and shows the price a
                // knob's stretch would give it
                const empty = (
                  <span {...cp} {...copyAttr(cell.copyKey)} ref={(el) => cellEvents(el, hands)} data-flip="" className={cx("flex h-full min-h-target rounded-md", CELL_FOCUS, cell.lit && cx(CELL, LIT))}>
                    <span id={keys.wordsId(j, cell.from)} className="contents">
                      {cell.lit && cell.fill !== undefined && <CellBody content={null} fill={cell.fill} lit />}
                    </span>
                  </span>
                );
                return (
                  <div key={cell.id ?? `@${cell.from}`} style={place} className="*:h-full">
                    {cell.zone ? cell.zone(empty) : empty}
                  </div>
                );
              }
              const el = (
                <div {...cp} {...copyAttr(cell.copyKey)} ref={(el) => cellEvents(el, hands)} data-liftable="" data-lifted={gap ? "" : undefined} onClick={opener(cell.onOpen)} className={cx(CELL, CELL_FOCUS, "group/cell relative h-full", binRoom(cell), cell.onOpen && "cursor-pointer hover:bg-accent", cell.open && "border-primary", cell.lit && LIT)}>
                  {cell.grip}
                  <span id={keys.wordsId(j, cell.from)} className="contents">
                    <CellBody content={cell.content} fill={cell.fill} lit={cell.lit} />
                    {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                  </span>
                  {cell.knobs}
                  {binOf(cell)}
                </div>
              );
              return (
                <div key={cell.id ?? `@${cell.from}`} style={place} className="min-w-0 *:h-full">
                  {cell.zone ? cell.zone(el) : el}
                </div>
              );
            })}
          </div>
        ))}
        {columns.map((c, k) =>
          c.empty ? (
            // a value no case names: one slot over every row of its column, which adds its case
            <div key={`empty:${c.id}`} style={{ gridColumn: k + 2, gridRow: `2 / span ${Math.max(rows.length, 1)}` }} data-flip="" className="*:h-full">
              <AddSlot add={c.empty} />
            </div>
          ) : null,
        )}
        {addPart && rows.length > 0 && <RowAdd add={addPart} style={{ gridColumn: `2 / span ${n}`, gridRow: rows.length + 1 }} />}
      </div>
      {foot}
    </div>
  );
}

/** A grid's row or column head: its value's words, its grip and its drop zone; `liftItem`, the item its grip lifts (its cells then stand as its gap too). */
export interface GridHead {
  id: string;
  head: ReactNode;
  grip?: ReactNode;
  liftItem?: string;
  zone?: (head: ReactNode) => ReactNode;
}

/** A cell of one part row under a grid's row: the columns it spans, the parts its cases hold alike there, and its tap. */
export interface PartCellView extends CellExtras {
  from: number;
  span: number;
  content: ReactNode;
  onOpen?: () => void;
  open?: boolean;
}

/**
 * A grid's cell: the columns it spans; its case's parts (`content`), its tap, whether it is open, and the words of a case
 * on any value across ("בכל ערוץ") after its parts; or, for a place no case holds, `empty`, the dashed slot that adds a case there. Its `id`
 * keeps it the same cell when its row or column moves, so it slides there.
 */
export interface GridCellView extends CellExtras {
  id?: string;
  from: number;
  span: number;
  /** The rows it spans down, where more than its own; the cells it covers in the rows under it are not given. */
  down?: number;
  content?: ReactNode;
  onOpen?: () => void;
  open?: boolean;
  across?: ReactNode;
  empty?: AddSpec;
}

/**
 * A grid's head, its grip and its words, filling its place so the whole head is what is lifted and dropped on: a row's as tall as its row
 * and its lines, its words from the top on its cells' first line; a column's as wide as its column, at the foot of its row over a hairline
 * so the heads stand on one line. Its grip stands at its start edge, centred down it, and its words in the middle of the width left
 * beside the grip's room (`GRIP_ROOM`), so the grip covers none of them.
 */
function HeadWords({ head, end, grip }: { head: ReactNode; end?: boolean; grip?: ReactNode }) {
  return (
    <div data-case-head="" data-liftable="" className={cx("flex h-full min-w-0 flex-col items-center gap-0.5 rounded-md pe-1 text-center text-sm", grip ? GRIP_ROOM : "ps-1", end ? "justify-end border-b border-border pb-1.5" : cx("justify-start", ROW_HEAD))}>
      {grip}
      <div data-head-words="" className="min-w-0 max-w-full font-medium">
        {head}
      </div>
    </div>
  );
}

/**
 * A fee that changes by two things, as a grid: the first thing's values down the side (`rows`), the second's across the top (`columns`);
 * one cell per case (equal neighbours one cell), a press anywhere on it opening it, a case on any value across spanning its row;
 * under a row's cells, its `lines`, one per part row, each a cell of the parts two or more of its cells hold alike over them; at the end of
 * the column heads the plus knob that adds a value across (`addColumn`), and under the row heads the one that adds a value down (`addRow`);
 * between two heads, the plus that adds one exactly there (`insertColumn`, `insertRow`).
 * A row's head is as tall as its cells and its lines; a row's `addPart`, the strip under it that adds a part to every case of the row.
 * `above`: the switch of a third thing. `steps`: the values across are a ladder's steps, whose heads hold a box each, and take the room for
 * it. `foot`: what stands under the grid (the bin while something is lifted, laid over what follows). Wider than its block, it scrolls
 * inside itself, sideways only, as a table does.
 */
export function CaseGrid({ columns, rows, addRow, addColumn, insertRow, insertColumn, above, steps, foot, label }: { columns: GridHead[]; rows: (GridHead & { cells: GridCellView[]; lines?: { id: string; cells: PartCellView[] }[]; addPart?: AddSpec })[]; addRow?: AddSpec; addColumn?: AddSpec; /** The plus between row `k - 1` and row `k`. */ insertRow?: (k: number) => AddSpec | null; /** The plus between column `k - 1` and column `k`. */ insertColumn?: (k: number) => AddSpec | null; above?: ReactNode; steps?: boolean; foot?: ReactNode; /** The grid's spoken name: its fee's. */ label?: string }) {
  const n = columns.length;
  const keys = useCellKeys();
  const carried = useCarried();
  const gapCol = carriedAt(columns, carried);
  const gapRow = carriedAt(rows, carried);
  // a row's head wraps past 9 rem, so the values across keep their room
  const template = `minmax(6rem, 9rem) repeat(${n}, minmax(${steps ? "11rem" : "8rem"}, 1fr))${addColumn ? " max-content" : ""}`;
  // each row stands on its cells' line and its part lines under them: the line it starts on, after the heads' line
  const height = rows.map((r) => 1 + (r.lines?.length ?? 0));
  const start = height.reduce<number[]>((acc, _, j) => [...acc, j === 0 ? 0 : acc[j - 1]! + height[j - 1]!], []);
  const lines = start.at(-1)! + height.at(-1)!;
  const gapOf = (j: number, from: number, span: number) => j === gapRow || (gapCol >= 0 && from === gapCol && span === 1);
  return (
    <div className="relative flex flex-col gap-2">
      {above}
      <div ref={keys.root} role="grid" aria-label={label} onKeyDown={keys.onKeyDown} data-case-grid="" data-span-table="" className="grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto overflow-y-hidden px-0.5 pt-2.5 pb-2" style={{ gridTemplateColumns: template }}>
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
          {addColumn && <HeadAdd add={addColumn} style={{ gridColumn: n + 2, gridRow: 1 }} className="flex min-w-target items-center justify-center" />}
          {insertColumn && betweenOf(n, insertColumn).map(({ k, add: a }) => <BetweenAdd key={`between:${k}`} add={a} axis="x" style={{ gridColumn: k + 1, gridRow: 1 }} />)}
        </div>
        {rows.map((r, j) => {
          const head = <HeadWords head={r.head} grip={r.grip} />;
          const line = start[j]!;
          const filled = r.cells.filter((c) => !c.empty);
          return (
            <div key={r.id} role="row" data-grid-row="" className="contents">
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
                    <div {...cp} ref={(x) => cellEvents(x, { onOpen: () => x?.querySelector<HTMLElement>("[data-add-slot]")?.click() })} data-flip="" className={cx("h-full rounded-md", CELL_FOCUS)}>
                      <span id={keys.wordsId(line, cell.from)} className="contents">
                        {cell.lit && cell.fill !== undefined ? (
                          <div className={cx(CELL, LIT, "h-full")}>
                            <CellBody content={null} fill={cell.fill} lit />
                          </div>
                        ) : (
                          <AddSlot add={add} className={cx("h-full", cell.lit && LIT)} />
                        )}
                      </span>
                    </div>
                  );
                  return (
                    <div key={`@${cell.from}`} style={place} className="*:h-full">
                      {cell.zone ? cell.zone(el) : el}
                    </div>
                  );
                }
                const el = (
                  <div {...cp} {...copyAttr(cell.copyKey)} ref={(x) => cellEvents(x, { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch, onStretchDown: cell.onStretchDown })} data-liftable="" data-lifted={gapOf(j, cell.from, cell.span) ? "" : undefined} onClick={opener(cell.onOpen)} className={cx("group group/cell relative h-full rounded-md", CELL_FOCUS, cell.onOpen && "cursor-pointer")}>
                    <div className={cx(CELL, "h-full group-hover:bg-accent", binRoom(cell), cell.open && OPEN, cell.lit && LIT)}>
                      {cell.grip}
                      <span id={keys.wordsId(line, cell.from)} className="contents">
                        <CellBody content={cell.content} fill={cell.fill} lit={cell.lit} />
                        {cell.across && <span className="text-muted-foreground">{cell.across}</span>}
                        {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                      </span>
                    </div>
                    {cell.knobs}
                    {binOf(cell)}
                  </div>
                );
                return (
                  <div key={cell.id ?? `@${cell.from}`} style={place} className="min-w-0 *:h-full">
                    {cell.zone ? cell.zone(el) : el}
                  </div>
                );
              })}
              {r.lines?.map((pl, L) =>
                pl.cells.map((cell) => {
                  const at = line + 1 + L;
                  const cp = keys.cellProps(at, cell.from, cell.span, false, 1, j);
                  const el = (
                    <div {...cp} {...copyAttr(cell.copyKey)} ref={(x) => cellEvents(x, { onOpen: cell.onOpen, onRemove: cell.onRemove, onStretch: cell.onStretch })} data-liftable="" data-lifted={j === gapRow ? "" : undefined} data-part-cell={pl.id} onClick={opener(cell.onOpen)} className={cx(CELL, CELL_FOCUS, "group/cell relative h-full", binRoom(cell), cell.onOpen && "cursor-pointer hover:bg-accent", cell.open && "border-primary", cell.lit && LIT)}>
                      {cell.grip}
                      <span id={keys.wordsId(at, cell.from)} className="contents">
                        <CellBody content={cell.content} fill={cell.fill} lit={cell.lit} />
                        {cell.whole && <span className="basis-full text-muted-foreground">{cell.whole}</span>}
                      </span>
                      {cell.knobs}
                      {binOf(cell)}
                    </div>
                  );
                  return (
                    <div key={`${pl.id}:${cell.from}`} style={placeOf(cell.from, cell.span, at + 2)} className="min-w-0 *:h-full">
                      {cell.zone ? cell.zone(el) : el}
                    </div>
                  );
                }),
              )}
              {r.addPart && filled.length > 0 && (
                <RowAdd add={r.addPart} style={{ gridColumn: `${Math.min(...filled.map((c) => c.from)) + 2} / ${Math.max(...filled.map((c) => c.from + c.span)) + 2}`, gridRow: line + 1 + height[j]! }} />
              )}
            </div>
          );
        })}
        {addRow && <HeadAdd add={addRow} style={{ gridColumn: 1, gridRow: lines + 2 }} className="flex justify-center py-1" />}
        {insertRow &&
          betweenOf(rows.length, insertRow).map(({ k, add: a }) => {
            // the line under row k - 1: the foot of its last part line
            const last = start[k - 1]! + height[k - 1]!;
            return <BetweenAdd key={`between:${k}`} add={a} axis="y" style={{ gridColumn: 1, gridRow: last + 1 }} />;
          })}
      </div>
      {foot}
    </div>
  );
}
