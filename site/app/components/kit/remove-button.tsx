// The one control that takes something away (design-system 11, "Cases and parts"): a bin, the icon alone in a 36 px round face in the
// muted ink, the danger colour under the pointer or the focus, its tap area 44 px tall, and 44 px square on a phone. Its words are spoken
// (`label`, also its tooltip). A bin that first asks "are you sure" (`expanded`: whether its question is open) says so to a screen reader.
// A ✕ only closes something (a panel, a sheet, a menu); taking something away is always this bin. `knob`: a table's or a grid's cell's own
// bin, drawn like the cell's stretch knob (a 20 px bordered square, a 12 px icon, muted and the foreground under the pointer), its tap area
// 44 px tall in the controls' layer, out of the Tab order (Delete on the cell does the same); app.css draws it only while its cell is
// under a fine pointer or has the keyboard's focus.
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { cx } from "./cx";

/** The bin's icon, for a picture of the control that is not itself a button (a pill drawn under the pointer while it is dragged). */
export const BinIcon = () => <Trash2 size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />;

export function RemoveButton({ label, onRemove, expanded, knob, className }: {
  label: string;
  onRemove: () => void;
  /** The bin opens a question before it takes anything away: whether that question is open. */
  expanded?: boolean;
  /** A cell's own bin, in its corner, drawn like its knob. */
  knob?: boolean;
  className?: string;
}) {
  if (knob)
    return (
      <button
        type="button"
        tabIndex={-1}
        data-cell-bin=""
        aria-label={label}
        title={label}
        // the press is the bin's alone: the cell under it opens its case on a press
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cx("tap-area relative z-[1] flex size-5 items-center justify-center rounded-sm border border-border bg-popover text-muted-foreground hover:text-foreground", className)}
      >
        <Trash2 size={12} strokeWidth={2} aria-hidden />
      </button>
    );
  return (
    <Button variant="ghost" aria-label={label} title={label} aria-expanded={expanded} onClick={onRemove} className={cx("shrink-0", className)}>
      <BinIcon />
    </Button>
  );
}
