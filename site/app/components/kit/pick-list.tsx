// A list to choose one row from (founder, 2026-10-27, the index page's two linked lists): every row is a radio, the chosen one is
// tinted with a bar at its start; the rows' cells are the caller's, on a grid the caller names, and a head row can name the columns.
import type { ReactNode } from "react";
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

/** `columns`: the grid template after the radio (for example `"minmax(0,1fr) auto"`). `head`: the column names, on the same grid. */
export function PickList({ label, columns, head, rows }: { label: string; columns: string; head?: ReactNode; rows: PickRow[] }) {
  const grid = { gridTemplateColumns: `1.25rem ${columns}` };
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col">
      {head && (
        <div className="grid gap-x-3 items-end px-4 pb-1.5 text-xs text-muted-foreground border-b border-border" style={grid}>
          <span />
          {head}
        </div>
      )}
      {rows.map((r) => (
        // a div, not a button: a row holds links of its own (a fund's number to Maya, a house's page)
        <div
          key={r.key}
          role="radio"
          aria-checked={r.selected}
          tabIndex={r.selected ? 0 : -1}
          onClick={r.onSelect}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              r.onSelect();
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const next = (e.key === "ArrowDown" ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling) as HTMLElement | null;
              if (next?.getAttribute("role") === "radio") next.focus();
            }
          }}
          className={cx(
            "grid gap-x-3 gap-y-1 items-center text-start px-4 py-2.5 border-b border-border last:border-b-0 min-h-target cursor-pointer hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
            r.selected && "bg-primary/10 shadow-[inset_-3px_0_0_var(--primary)] hover:bg-primary/10",
            r.muted && !r.selected && "text-muted-foreground",
          )}
          style={grid}
        >
          <span aria-hidden="true" className={cx("size-4 rounded-full border-[1.5px] self-start mt-1", r.selected ? "border-[5px] border-primary" : "border-input")} />
          {r.cells}
        </div>
      ))}
    </div>
  );
}
