// Several cells of one table or grid chosen at once (design-system 11, `CaseTable`'s `select`): Shift+click adds a cell or takes it out,
// and a drag that starts on a cell's own surface (not a figure, a grip, a knob, a bin or a field) chooses every cell of the rectangle
// from the cell it started on to the cell under the pointer. The drag waits 6 px before it starts, then clears any words the browser
// began to select and selects none while it lasts (`data-selecting`, app.css), and the click it ends with opens no case. A cell is named
// by its select key (`data-select-key`) and placed by its grid place (`data-row`, `data-rows`, `data-from`, `data-span`). What the
// choice is for (the bar, its actions, clearing it) is the page's.
import { useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from "react";

/** The cells chosen, by their select keys, and the choice as it changes. */
export interface CellSelect {
  keys: ReadonlySet<string>;
  onChange: (keys: string[]) => void;
}

/** A cell's place in its grid: its first line and how many it spans, its first column and how many it spans. */
export interface CellPlace {
  key: string;
  row: number;
  rows: number;
  from: number;
  span: number;
}

/** The cells of the rectangle that holds cells `a` and `b`: every cell it reaches, in the order given. */
export function rectKeys(cells: readonly CellPlace[], a: CellPlace, b: CellPlace): string[] {
  const top = Math.min(a.row, b.row), bottom = Math.max(a.row + a.rows, b.row + b.rows) - 1;
  const first = Math.min(a.from, b.from), last = Math.max(a.from + a.span, b.from + b.span) - 1;
  return cells.filter((c) => c.row <= bottom && c.row + c.rows - 1 >= top && c.from <= last && c.from + c.span - 1 >= first).map((c) => c.key);
}

/** One key added to the choice, or taken out where it is in it. */
export const toggled = (keys: ReadonlySet<string>, key: string): string[] => (keys.has(key) ? [...keys].filter((k) => k !== key) : [...keys, key]);

/** What a press on a cell may never start a choice from: something with a tap or a drag of its own. */
const OWN = "a, button, input, select, textarea, label, [role=button], [role=slider], [data-lift], [data-grip-box], [data-knob-strip], [data-edit-in-place], .num, [data-cell-bin-box], [data-part-off]";
/** How far, in px, the pointer moves before a press on a cell becomes a drag that chooses. */
const SLOP = 6;

const placeOf = (el: HTMLElement): CellPlace => ({ key: el.dataset.selectKey!, row: Number(el.dataset.row), rows: Number(el.dataset.rows ?? 1), from: Number(el.dataset.from), span: Number(el.dataset.span) });

/** A table's or a grid's choosing: the handlers its root takes, and what each cell spreads (`cellAttrs`, by its select key). */
export function useCellSelect(root: RefObject<HTMLElement | null>, select: CellSelect | undefined) {
  const press = useRef<{ start: HTMLElement; x: number; y: number; id: number; dragging: boolean } | null>(null);
  const swallow = useRef(false);
  const [selecting, setSelecting] = useState(false);
  const cellAt = (t: EventTarget | null) => {
    const el = (t as Element | null)?.closest?.<HTMLElement>("[data-select-key]");
    return el && root.current?.contains(el) ? el : null;
  };
  const all = () => [...(root.current?.querySelectorAll<HTMLElement>("[data-select-key]") ?? [])].map(placeOf);
  const rootProps = select
    ? {
        "data-selecting": selecting ? "" : undefined,
        onPointerDown: (e: PointerEvent<HTMLElement>) => {
          if (e.button !== 0 || e.pointerType !== "mouse" || e.shiftKey) return;
          const cell = cellAt(e.target);
          if (!cell || (e.target as Element).closest(OWN)) return;
          press.current = { start: cell, x: e.clientX, y: e.clientY, id: e.pointerId, dragging: false };
        },
        onPointerMove: (e: PointerEvent<HTMLElement>) => {
          const p = press.current;
          if (!p || p.id !== e.pointerId) return;
          if (!p.dragging) {
            if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < SLOP) return;
            p.dragging = true;
            setSelecting(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          window.getSelection()?.removeAllRanges();
          const over = cellAt(document.elementFromPoint(e.clientX, e.clientY));
          if (over) select.onChange(rectKeys(all(), placeOf(p.start), placeOf(over)));
        },
        onPointerUp: (e: PointerEvent<HTMLElement>) => {
          const p = press.current;
          press.current = null;
          if (!p?.dragging) return;
          setSelecting(false);
          swallow.current = true;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        },
        onPointerCancel: () => {
          press.current = null;
          setSelecting(false);
        },
        // Shift with a press extends no words: the press is the choosing's
        onMouseDownCapture: (e: MouseEvent<HTMLElement>) => {
          if (e.shiftKey && cellAt(e.target)) e.preventDefault();
        },
        onClickCapture: (e: MouseEvent<HTMLElement>) => {
          const cell = cellAt(e.target);
          if (swallow.current) {
            swallow.current = false;
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          if (e.shiftKey && cell) {
            e.stopPropagation();
            e.preventDefault();
            select.onChange(toggled(select.keys, cell.dataset.selectKey!));
          }
        },
      }
    : {};
  /** What a cell spreads: its select key, and whether it is chosen. */
  const cellAttrs = (key: string | undefined) => (select && key !== undefined ? { "data-select-key": key, "data-selected": select.keys.has(key) ? "" : undefined } : {});
  return { rootProps, cellAttrs };
}
