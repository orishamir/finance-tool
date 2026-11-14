// A fee's cases laid out by the fee's shape (design-system 11, "Cases and parts"; the layout is lib/fee-deal/layout.ts): under the
// condition's head, a table for a fee that changes by one thing (its cases as columns, its parts as rows, a range's steps ascending as a
// ladder), a grid for two (the first thing down the side, the second across the top, a third as a switch above it), the parts said once
// for every case on a line above them, and the place a new case, step, row or column will stand as a dashed slot that adds it. Narrower
// than a table needs, the page reads the same cases as rows (`ConditionBand`, `CaseRow`, `CaseGroup`); a table squeezed anyway scrolls inside itself, never widening the page. The cells are dark cells on the fee's
// card, outside the cases' blue; the case open stands under the table, its column or cell outlined in the action colour.
import type { MouseEvent, ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, Plus } from "lucide-react";
import { LIFT_INNER } from "./choice";
import { cx } from "./cx";

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true, className: "shrink-0" } as const;
/** The open case's column head and cells: the action colour's outline, as the open case's own. */
const OPEN = "outline-2 -outline-offset-2 outline-primary";
const CELL = "flex min-h-target min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

/** A click on a cell opens its case, unless it fell on a control of its own (a figure's source, a field). */
const opener = (onOpen?: () => void) => (onOpen ? (e: MouseEvent) => !(e.target as Element).closest("button, a, input, [data-lift]") && onOpen() : undefined);

/** A part said once for many cases: its lead ("בכל המקרים:", "בכל המקרים בשקלים:") and the parts, in a quiet line above the cases. */
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
 * The place a new case, step, row or column will stand: a dashed frame with a plus and its words in the action colour, which adds it. A
 * `column` stands as tall as the table beside its last column; a `row` as wide as the cells under the last row.
 */
export function AddSlot({ add, shape, className }: { add: AddSpec; shape: "column" | "row"; className?: string }) {
  return (
    <button
      type="button"
      data-add-slot={shape}
      aria-expanded={add.expanded}
      aria-label={add.spoken}
      onClick={(e) => add.onAdd(e.currentTarget)}
      className={cx(
        "inline-flex min-h-target items-center justify-center gap-1.5 rounded-md border border-dashed border-primary px-3 text-sm text-primary transition-colors duration-[var(--duration-fast)] hover:bg-accent",
        shape === "column" ? "h-full w-full" : "w-full",
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
function OpenHead({ label, onOpen, open, range, children }: { label: string; onOpen: () => void; open?: boolean; range?: boolean; children: ReactNode }) {
  return (
    <div className={cx("group relative flex min-h-target items-end gap-1.5 rounded-md border-b border-border px-1.5 pt-1 pb-1.5 text-sm font-medium cursor-pointer", LIFT_INNER, open && OPEN)}>
      <button type="button" data-pick-card aria-label={label} onClick={onOpen} className="absolute inset-0 w-full rounded-md group-hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />
      {range && <ChartNoAxesColumnIncreasing {...icon} className="relative mb-0.5 shrink-0 text-when-ink pointer-events-none" />}
      <div className="relative flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 pointer-events-none [&_[data-lift]]:pointer-events-auto">{children}</div>
    </div>
  );
}

/** A table's column: its case's id, its head's words, the head's spoken name and tap, and whether its case is open. */
export interface CaseColumn {
  id: string;
  head: ReactNode;
  label: string;
  onOpen: () => void;
  open?: boolean;
  /** Wraps the head (a `DropZone` for its case). */
  zone?: (head: ReactNode) => ReactNode;
}

/** A part row of a table: its head ("שיעור", "מינימום") and its cells, each spanning `span` columns from `from`, the case its tap opens; a cell whose `content` is null (no such part) is left empty. */
export interface CaseTableRow {
  id: string;
  head: ReactNode;
  cells: { from: number; span: number; open?: boolean; onOpen?: () => void; content: ReactNode }[];
}

/**
 * A fee that changes by one thing, as a table: the cases as columns (`columns`, heads that open their case), the parts as rows (`rows`),
 * a merged cell where neighbours are equal, and at the end the dashed column that adds a case or a step (`add`). `ladder`: the thing is a
 * range, its steps ascending, each head with the range's icon.
 */
export function CaseTable({ columns, rows, add, ladder }: { columns: CaseColumn[]; rows: CaseTableRow[]; add?: AddSpec; ladder?: boolean }) {
  const n = columns.length;
  // a ladder's head holds a step's two bounds and its top's box on one line
  const template = `minmax(5.5rem, max-content) repeat(${n}, minmax(${ladder ? "11rem" : "7.5rem"}, 1fr))${add ? " 7rem" : ""}`;
  return (
    <div data-case-table="" className="grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto p-0.5" style={{ gridTemplateColumns: template }}>
      <span aria-hidden />
      {columns.map((c, k) => {
        const head = (
          <OpenHead key={c.id} label={c.label} onOpen={c.onOpen} open={c.open} range={ladder}>
            {c.head}
          </OpenHead>
        );
        return (
          // every head fills the row's height, its words at its foot: the heads stand on one line, a head that wraps growing the row
          <div key={c.id} className="flex min-w-0 *:w-full" style={{ gridColumn: k + 2, gridRow: 1 }}>
            {c.zone ? c.zone(head) : head}
          </div>
        );
      })}
      {add && (
        <div style={{ gridColumn: n + 2, gridRow: `1 / span ${rows.length + 1}` }}>
          <AddSlot add={add} shape="column" />
        </div>
      )}
      {rows.map((r, j) => (
        <div key={r.id} className="contents">
          <div className="flex items-center text-sm text-muted-foreground" style={{ gridColumn: 1, gridRow: j + 2 }}>
            {r.head}
          </div>
          {r.cells.map((cell) =>
            cell.content === null ? (
              // a case with no such part: an empty place, no cell drawn
              <span key={cell.from} aria-hidden style={{ gridColumn: `${cell.from + 2} / span ${cell.span}`, gridRow: j + 2 }} />
            ) : (
            <div key={cell.from} onClick={opener(cell.onOpen)} className={cx(CELL, cell.onOpen && "cursor-pointer hover:bg-accent", cell.open && "border-primary")} style={{ gridColumn: `${cell.from + 2} / span ${cell.span}`, gridRow: j + 2 }}>
              {cell.content}
            </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** A grid's row or column head: its value's words, and the parts said once for its cases (`shared`), under them. */
export interface GridHead {
  id: string;
  head: ReactNode;
  shared?: ReactNode;
}

/**
 * A grid's cell: the columns it spans; its case's parts (`content`), its spoken name and tap, whether it is open, and the words of a case
 * on any value across ("בכל ערוץ") after its parts; or, for a place no case holds, `empty`, the dashed slot that adds a case there.
 */
export interface GridCellView {
  from: number;
  span: number;
  content?: ReactNode;
  label?: string;
  onOpen?: () => void;
  open?: boolean;
  across?: ReactNode;
  empty?: AddSpec;
  /** Wraps the cell (a `DropZone` for its case). */
  zone?: (cell: ReactNode) => ReactNode;
}

/** A grid's head: its words and its shared parts; a column's (`end`) at the foot of its row, over a hairline, so the heads stand on one line. */
function HeadWords({ head, shared, end }: { head: ReactNode; shared?: ReactNode; end?: boolean }) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-0.5 text-sm", end ? "justify-end border-b border-border pb-1.5" : "justify-center")}>
      <div className="font-medium">{head}</div>
      {shared && <div className="text-muted-foreground">{shared}</div>}
    </div>
  );
}

/**
 * A fee that changes by two things, as a grid: the first thing's values down the side (`rows`), the second's across the top (`columns`),
 * each head with the parts said once for its row or column under it; one cell per case, a button over the whole cell that opens it, a case
 * on any value across spanning its row; at the side the dashed column that adds a value across (`addColumn`) and under the rows the dashed
 * row that adds a value down (`addRow`). `above`: the switch of a third thing. `steps`: the values across are a ladder's steps, whose heads
 * hold a box each, and take the room for it.
 */
export function CaseGrid({ columns, rows, addRow, addColumn, above, steps }: { columns: GridHead[]; rows: (GridHead & { cells: GridCellView[] })[]; addRow?: AddSpec; addColumn?: AddSpec; above?: ReactNode; steps?: boolean }) {
  const n = columns.length;
  // a row's head wraps past 9 rem, so the values across keep their room
  const template = `minmax(6rem, 9rem) repeat(${n}, minmax(${steps ? "11rem" : "8rem"}, 1fr))${addColumn ? " 6rem" : ""}`;
  return (
    <div className="flex flex-col gap-2">
      {above}
      <div data-case-grid="" className="grid items-stretch gap-x-2 gap-y-1.5 overflow-x-auto p-0.5" style={{ gridTemplateColumns: template }}>
        <span aria-hidden />
        {columns.map((c, k) => (
          <div key={c.id} style={{ gridColumn: k + 2, gridRow: 1 }} className="flex *:w-full">
            <HeadWords head={c.head} shared={c.shared} end />
          </div>
        ))}
        {addColumn && (
          <div style={{ gridColumn: n + 2, gridRow: `1 / span ${rows.length + 1}` }}>
            <AddSlot add={addColumn} shape="column" />
          </div>
        )}
        {rows.map((r, j) => (
          <div key={r.id} className="contents">
            <div style={{ gridColumn: 1, gridRow: j + 2 }} className="flex">
              <HeadWords head={r.head} shared={r.shared} />
            </div>
            {r.cells.map((cell) => {
              const place = { gridColumn: `${cell.from + 2} / span ${cell.span}`, gridRow: j + 2 };
              if (cell.empty)
                return (
                  <div key={cell.from} style={place}>
                    <AddSlot add={cell.empty} shape="row" className="h-full" />
                  </div>
                );
              const el = (
                <div className={cx("group relative h-full cursor-pointer", LIFT_INNER)}>
                  {cell.onOpen && <button type="button" data-pick-card aria-label={cell.label} onClick={cell.onOpen} className="absolute inset-0 w-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />}
                  <div className={cx(CELL, "h-full group-hover:bg-accent", cell.open && OPEN)}>
                    {cell.content}
                    {cell.across && <span className="text-muted-foreground">{cell.across}</span>}
                  </div>
                </div>
              );
              return (
                <div key={cell.from} style={place} className="min-w-0">
                  {cell.zone ? cell.zone(el) : el}
                </div>
              );
            })}
          </div>
        ))}
        {addRow && (
          <div style={{ gridColumn: `2 / span ${n}`, gridRow: rows.length + 2 }}>
            <AddSlot add={addRow} shape="row" />
          </div>
        )}
      </div>
    </div>
  );
}
