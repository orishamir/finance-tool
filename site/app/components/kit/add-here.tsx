// A small round "+" at the end of a place a card can go (design-system 11, `AddHere`): while a card from the toolbox is held, each place
// that can take it shows one, and a tap on it adds the card there; while a card is carried by the pointer, each place that takes it shows
// the same "+", drawn only, filled while the card is over its place. 32 px across, a thin border and a "+" in the action colour; filled in
// the action colour under a computer's pointer, on the keyboard's focus and while a carried card is over its place (`over`). Its tap area
// reaches 44 px both ways (`tap-wide`), so nothing a finger hits may stand within 6 px of it.
import { Plus } from "lucide-react";
import { cx } from "./cx";

const FACE = "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--duration-fast)]";
const FILLED = "border-primary bg-primary text-primary-foreground";
const PLAIN = "border-input bg-card text-primary";

/**
 * With `onAdd`, a button named by `label` (which place it adds to: "להוסיף ״הנחה % מהמחיר״ למחיר מינואר 2027"); without, the mark a
 * carried card shows on a place that takes it, hidden from a screen reader (the place itself takes the drop). `data-add-here` marks it,
 * so a page that lets a held card go on a tap elsewhere knows the tap was on a place.
 */
export function AddHere({ label, onAdd, over, className }: { label?: string; onAdd?: () => void; over?: boolean; className?: string }) {
  const plus = <Plus size={18} strokeWidth={1.75} aria-hidden />;
  if (!onAdd)
    return (
      <span aria-hidden data-add-here="" className={cx(FACE, over ? FILLED : PLAIN, className)}>
        {plus}
      </span>
    );
  return (
    <button
      type="button"
      data-add-here=""
      aria-label={label}
      title={label}
      onClick={onAdd}
      className={cx(FACE, "tap-wide", over ? FILLED : cx(PLAIN, "hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"), className)}
    >
      {plus}
    </button>
  );
}
