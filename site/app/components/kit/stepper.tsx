// The two buttons beside a whole-number field that take it one down and one up (2026-10-26): the goal's age had a minus and a plus,
// the provider page's orders an arrow down and an arrow up; one look for both.
import { Minus, Plus } from "lucide-react";
import { Button } from "./button";

/** One step down and one step up, as two 44 px icon buttons the height of a field; put them in the field's row, after the box. Each takes its own spoken name. */
export function StepButtons({ onDown, onUp, downLabel, upLabel, downDisabled, upDisabled }: { onDown: () => void; onUp: () => void; downLabel: string; upLabel: string; downDisabled?: boolean; upDisabled?: boolean }) {
  return (
    <>
      <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={downLabel} disabled={downDisabled} onClick={onDown}>
        <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
      </Button>
      <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={upLabel} disabled={upDisabled} onClick={onUp}>
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
      </Button>
    </>
  );
}
