// A list to choose one row from (founder, 2026-10-27, the index page's two linked lists): every row is a radio, the chosen one is
// tinted with a bar at its start; the rows' cells are the caller's, on a grid the caller names, and a head row can name the columns.
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export interface PickRow {
  key: string;
  selected: boolean;
  onSelect: () => void;
  /** The row's cells, laid out on the list's `columns`. */
  cells: ReactNode;
  /** A row that cannot be chosen as it is is still a row, muted (it is never left out). */
  muted?: boolean;
}

/**
 * `columns`: the grid template after the radio (for example `"minmax(0,1fr) auto"`); `phoneColumns` the template below `md`, where
 * a cell may move to a second line (`max-md:row-start-2`). `head`: the column names, on the same grid. `phoneLimit`: on a phone, the
 * rows after the first N fold behind a button (`more` words it), the chosen row always shown; nothing is filtered out.
 */
export function PickList({ label, columns, phoneColumns, head, rows, phoneLimit, more }: { label: string; columns: string; phoneColumns?: string; head?: ReactNode; rows: PickRow[]; phoneLimit?: number; more?: (hidden: number) => string }) {
  const [open, setOpen] = useState(false);
  // a pick re-prices what is above the list (founder, 2026-10-27: "the whole page jumps up and down"): keep the tapped row where it
  // was on the screen, wherever the list now puts it
  const root = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ key: string; top: number } | null>(null);
  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a || !root.current) return;
    anchor.current = null;
    const list = root.current;
    const hold = () => {
      const el = [...list.querySelectorAll<HTMLElement>("[data-pick-key]")].find((x) => x.dataset.pickKey === a.key);
      const moved = el ? el.getBoundingClientRect().top - a.top : 0;
      if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
    };
    hold();
    // once more after the browser's own layout pass (its scroll anchoring can move the page again)
    requestAnimationFrame(hold);
  });
  const choose = (r: PickRow, el: HTMLElement) => {
    anchor.current = { key: r.key, top: el.getBoundingClientRect().top };
    r.onSelect();
  };
  const grid = { "--pick-cols": columns, "--pick-cols-phone": phoneColumns ?? columns } as CSSProperties;
  const gridClass = "grid-cols-[1.25rem_var(--pick-cols-phone)] md:grid-cols-[1.25rem_var(--pick-cols)]";
  const folds = !open && phoneLimit !== undefined && rows.length > phoneLimit + 1;
  const folded = (i: number, r: PickRow) => folds && i >= phoneLimit! && !r.selected;
  const hidden = rows.filter((r, i) => folded(i, r)).length;
  return (
    <div ref={root} role="radiogroup" aria-label={label} className="flex flex-col [overflow-anchor:none]">
      {head && (
        <div className={cx("grid gap-x-3 items-end px-4 pb-1.5 text-xs text-muted-foreground border-b border-border", gridClass)} style={grid}>
          <span />
          {head}
        </div>
      )}
      {rows.map((r, i) => (
        // a div, not a button: a row holds links of its own (a fund's number to Maya, a house's page)
        <div
          key={r.key}
          role="radio"
          aria-checked={r.selected}
          data-pick-key={r.key}
          tabIndex={r.selected ? 0 : -1}
          onClick={(e) => choose(r, e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              choose(r, e.currentTarget);
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const next = (e.key === "ArrowDown" ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling) as HTMLElement | null;
              if (next?.getAttribute("role") === "radio") next.focus();
            }
          }}
          className={cx(
            "grid gap-x-3 gap-y-1 items-center text-start px-4 py-2.5 border-b border-border last:border-b-0 min-h-target cursor-pointer hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
            gridClass,
            folded(i, r) && "max-md:hidden",
            r.selected && "bg-primary/10 shadow-[inset_-3px_0_0_var(--primary)] hover:bg-primary/10",
            r.muted && !r.selected && "text-muted-foreground",
          )}
          style={grid}
        >
          <span aria-hidden="true" className={cx("size-4 rounded-full border-[1.5px] self-start mt-1", r.selected ? "border-[5px] border-primary" : "border-input")} />
          {r.cells}
        </div>
      ))}
      {hidden > 0 && more && (
        <button type="button" onClick={() => setOpen(true)} className="md:hidden text-link text-sm font-medium min-h-target px-4 text-start hover:underline">
          {more(hidden)}
        </button>
      )}
    </div>
  );
}
