// A table's column head that sorts the table when pressed (founder, 2026-11-03, the track browser: "instead of the sort buttons make the
// table clickable"). The active head is bold with ▲ (small to large) or ▼ (large to small); every other sortable head shows a faint ⇅.
// The arrow has a fixed slot and the bold width is held by an unseen copy of the label, so pressing a head moves nothing. Put the sort's
// state on the column too (`ProductColumn.sort`), which sets `aria-sort` on the head's cell.
import { cx } from "./cx";

export type SortState = "none" | "ascending" | "descending";

export function SortHead({ label, state, onPress, className }: { label: string; state: SortState; onPress: () => void; className?: string }) {
  const on = state !== "none";
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx("inline-flex items-center gap-1 min-h-11 -my-1 text-start rounded-sm hover:text-foreground transition-colors duration-[var(--duration-fast)]", on ? "text-foreground" : "text-muted-foreground", className)}
    >
      <span className="inline-grid *:[grid-area:1/1]">
        <span className={on ? "font-bold" : undefined}>{label}</span>
        <span aria-hidden="true" className="invisible font-bold">
          {label}
        </span>
      </span>
      <span aria-hidden="true" className={cx("inline-block w-[1.1em] shrink-0 text-center text-[0.8em]", on ? "text-primary" : "opacity-45")}>
        {state === "ascending" ? "▲" : state === "descending" ? "▼" : "⇅"}
      </span>
    </button>
  );
}
