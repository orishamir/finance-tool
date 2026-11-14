// The one control that takes something away (design-system 11, "Cases and parts"): a bin, the icon alone in a 36 px round face in the
// muted ink, the danger colour under the pointer or the focus, its tap area 44 px tall, and 44 px square on a phone. Its words are spoken
// (`label`, also its tooltip). A bin that first asks "are you sure" (`expanded`: whether its question is open) says so to a screen reader.
// A ✕ only closes something (a panel, a sheet, a menu); taking something away is always this bin.
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { cx } from "./cx";

/** The bin's icon, for a picture of the control that is not itself a button (a pill drawn under the pointer while it is dragged). */
export const BinIcon = () => <Trash2 size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />;

export function RemoveButton({ label, onRemove, expanded, className }: {
  label: string;
  onRemove: () => void;
  /** The bin opens a question before it takes anything away: whether that question is open. */
  expanded?: boolean;
  className?: string;
}) {
  return (
    <Button variant="ghost" aria-label={label} title={label} aria-expanded={expanded} onClick={onRemove} className={cx("shrink-0", className)}>
      <BinIcon />
    </Button>
  );
}
