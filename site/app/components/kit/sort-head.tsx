// A table's column head that sorts the table when pressed (the track browser: "instead of the sort buttons make the
// table clickable"). The active head is bold with ▲ (small to large) or ▼ (large to small); every other sortable head shows a faint ⇅.
// The arrow has a fixed slot and the bold width is held by an unseen copy of the label, so pressing a head moves nothing. Put the sort's
// state on the column too (`ProductColumn.sort`), which sets `aria-sort` on the head's cell. The label starts where a plain head's words
// start, and the arrow stands on its first line, so a row of heads, sorting or not, reads along one top line. `note` is a short muted
// second line under the label, inside the head's 44 px (the year of a column's average, "ממוצע 2025"); `SortNote` draws the same line
// under a head that does not sort. `raised` is for a head with a "?" beside it: the mark's 44 px press area reaches over the head's end, and
// the raised button keeps every press on its label and arrow.
import type { ReactNode } from "react";
import { cx } from "./cx";

export type SortState = "none" | "ascending" | "descending";

export function SortHead({ label, state, onPress, className, alsoHolds, note, raised }: { label: string; state: SortState; onPress: () => void; className?: string; /** The other words this head can carry (the name column says "המסלול" or "החברה"): it holds the longest, so a change of word moves nothing. */ alsoHolds?: string[]; /** A short muted line under the label. */ note?: string; /** A "?" stands beside the head: the button is on the tap areas' layer 1, so the mark's 44 px area takes no press on the arrow. */ raised?: boolean }) {
  const on = state !== "none";
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx("inline-flex items-start gap-1 min-h-11 -my-1 pt-1 text-start rounded-sm hover:text-foreground transition-colors duration-[var(--duration-fast)]", on ? "text-foreground" : "text-muted-foreground", raised && "relative z-[1]", className)}
    >
      <span className="inline-flex flex-col">
        <span className="inline-grid *:[grid-area:1/1]">
          <span className={on ? "font-bold" : undefined}>{label}</span>
          {[...new Set([label, ...(alsoHolds ?? [])])].map((w) => (
            <span key={w} aria-hidden="true" className="invisible font-bold">
              {w}
            </span>
          ))}
        </span>
        {note && <SortNoteLine note={note} />}
      </span>
      <span aria-hidden="true" className="inline-flex h-[1lh] shrink-0 items-center">
        <span className={cx("inline-block w-[1.1em] text-center text-[0.8em]", on ? "text-primary" : "opacity-45")}>{state === "ascending" ? "▲" : state === "descending" ? "▼" : "⇅"}</span>
      </span>
    </button>
  );
}

const SortNoteLine = ({ note }: { note: string }) => <span className="text-xs leading-4 font-normal whitespace-nowrap text-muted-foreground">{note}</span>;

/** A plain head that does not sort, with the muted second line `SortHead` takes as `note`, in the same 44 px. `mark` is a "?" beside the
 *  label on its first line, the note under both: for a note wider than its label, where a mark after the whole head would stand past it.
 *  `beside` sets the note after the label on its one line, the mark after both: for a head over several columns, whose second line is
 *  their own heads (`ProductColumn.over`, the past yield over its years). */
export function SortNote({ label, note, mark, beside }: { label: string; note: string; /** A `HelpMark` beside the label. */ mark?: ReactNode; /** The note on the label's line, after it. */ beside?: boolean }) {
  if (beside) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {label}
        <span className="ms-1">
          <SortNoteLine note={note} />
        </span>
        {mark && <span className="relative inline-flex">{mark}</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col min-h-11 -my-1 pt-1">
      {mark ? (
        <span className="inline-flex items-center gap-1">
          {label}
          {/* positioned, so the mark lies over the note drawn after it and keeps its 44 px */}
          <span className="relative inline-flex">{mark}</span>
        </span>
      ) : (
        <span>{label}</span>
      )}
      <SortNoteLine note={note} />
    </span>
  );
}
