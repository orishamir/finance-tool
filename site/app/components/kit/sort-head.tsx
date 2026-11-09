// A table's column head that sorts the table when pressed (the track browser: "instead of the sort buttons make the
// table clickable"). The active head is bold with ▲ (small to large) or ▼ (large to small); every other sortable head shows a faint ⇅.
// The arrow has a fixed slot and the bold width is held by an unseen copy of the label, so pressing a head moves nothing. Put the sort's
// state on the column too (`ProductColumn.sort`), which sets `aria-sort` on the head's cell. The label starts where a plain head's words
// start, and the arrow stands on its first line, so a row of heads, sorting or not, reads along one top line.
import { cx } from "./cx";

export type SortState = "none" | "ascending" | "descending";

export function SortHead({ label, state, onPress, className, alsoHolds }: { label: string; state: SortState; onPress: () => void; className?: string; /** The other words this head can carry (the name column says "המסלול" or "החברה"): it holds the longest, so a change of word moves nothing. */ alsoHolds?: string[] }) {
  const on = state !== "none";
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx("inline-flex items-start gap-1 min-h-11 -my-1 pt-1 text-start rounded-sm hover:text-foreground transition-colors duration-[var(--duration-fast)]", on ? "text-foreground" : "text-muted-foreground", className)}
    >
      <span className="inline-grid *:[grid-area:1/1]">
        <span className={on ? "font-bold" : undefined}>{label}</span>
        {[...new Set([label, ...(alsoHolds ?? [])])].map((w) => (
          <span key={w} aria-hidden="true" className="invisible font-bold">
            {w}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="inline-flex h-[1lh] shrink-0 items-center">
        <span className={cx("inline-block w-[1.1em] text-center text-[0.8em]", on ? "text-primary" : "opacity-45")}>{state === "ascending" ? "▲" : state === "descending" ? "▼" : "⇅"}</span>
      </span>
    </button>
  );
}
