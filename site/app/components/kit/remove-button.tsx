// The one control that takes something away (design-system 11, "Cases and parts"): a bin, the icon alone in a 36 px round face in the
// muted ink, the danger colour under the pointer or the focus, its tap area 44 px tall, and 44 px square on a phone. Its words are spoken
// (`label`, also its tooltip). A bin that first asks "are you sure" (`expanded`: whether its question is open) says so to a screen reader.
// `knob`: the same bin drawn as a `KnobButton` (a 20 px bordered square, a 12 px icon, muted and the foreground under the pointer), for a
// bin that stands in a corner of what it takes away and takes no room: a table's or a grid's cell's own bin (`data-cell-bin`, which app.css
// draws only while its cell is under a fine pointer or has the keyboard's focus), a closed fee card's corner. Its tap area is 44 px tall in
// the controls' layer, out of the Tab order (the keyboard has Delete, or the grip's menu), and its press is its own alone. A ✕ closes
// something (a panel, a sheet, a menu), or takes one part line out of a table's cell, standing at that line's end; anything else is taken
// away by this bin.
import type { MouseEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { cx } from "./cx";
import { KnobButton } from "./knob-button";

/** The bin's icon, for a picture of the control that is not itself a button (a pill drawn under the pointer while it is dragged). */
export const BinIcon = () => <Trash2 size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />;

export function RemoveButton({ label, onRemove, expanded, knob, cell, keepsFocus, tabIndex = -1, className }: {
  label: string;
  onRemove: () => void;
  /** The bin opens a question before it takes anything away: whether that question is open. */
  expanded?: boolean;
  /** Drawn as a knob in a corner (`KnobButton`). */
  knob?: boolean;
  /** A knob that is a cell's own bin (`data-cell-bin`). */
  cell?: boolean;
  /**
   * A press leaves the focus where it is: the bin of a part still asking its amount, whose box gives the amount when it is left, so the
   * press that drops the part does not first give it.
   */
  keepsFocus?: boolean;
  /** A knob's place in the Tab order: none, by default. */
  tabIndex?: number;
  className?: string;
}) {
  if (knob)
    return (
      <KnobButton
        icon={Trash2}
        label={label}
        expanded={expanded}
        tabIndex={tabIndex}
        {...(cell ? { "data-cell-bin": "" } : {})}
        className={cx("z-[1]", className)}
        // the press is the bin's alone: the cell or the card under it opens on a press
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    );
  return (
    <Button variant="ghost" aria-label={label} title={label} aria-expanded={expanded} onClick={onRemove} {...(keepsFocus ? { onMouseDown: (e: MouseEvent) => e.preventDefault() } : {})} className={cx("shrink-0", className)}>
      <BinIcon />
    </Button>
  );
}
