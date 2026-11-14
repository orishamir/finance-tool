// The one control that takes something away (design-system 11, "Cases and parts"): a bin, the icon alone in a 36 px round face in the
// muted ink, the danger colour under the pointer or the focus, its tap area 44 px tall, and 44 px square on a phone. Its words are spoken
// (`label`, also its tooltip). A ✕ only closes something (a panel, a sheet, a menu); taking something away is always this bin.
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { cx } from "./cx";

export function RemoveButton({ label, onRemove, className }: { label: string; onRemove: () => void; className?: string }) {
  return (
    <Button variant="ghost" size="sm" aria-label={label} title={label} onClick={onRemove} className={cx("shrink-0 max-md:size-target", className)}>
      <Trash2 size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
    </Button>
  );
}
