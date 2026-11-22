// A chart's range typed as two amounts: "{lead} מ־ [ ] עד [ ] ₪", each box taking its amount when it is left or on Enter (never while
// the reader types, so a half-typed figure never redraws the chart), the figures in the entered colour once the range is the reader's own;
// a reset back to the range the chart opened at while it is moved, and a hint beside them (on a computer: a drag on the chart does the same).
import { useId, useState, type KeyboardEvent } from "react";
import { fmt } from "../../lib/format";
import { parseInBox } from "./figure-field";
import { Button } from "./button";
import { cx } from "./cx";

/** The words around the boxes: the lead, the two leads of the boxes, the unit, the reset, the hint, and each box's spoken name. */
export interface RangeWords {
  lead: string;
  from: string;
  to: string;
  unit: string;
  reset: string;
  hint?: string;
  fromName: string;
  toName: string;
}

function AmountBox({ value, name, moved, onCommit }: { value: number; name: string; moved: boolean; onCommit: (n: number) => void }) {
  const shown = fmt.number(Math.round(value));
  // what is typed while the box has the focus; out of it, the amount the page holds
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? shown;
  const settle = () => {
    const n = parseInBox(text, undefined, "amount");
    setDraft(null);
    if (Number.isFinite(n) && n > 0) onCommit(n);
  };
  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // the box lets go, so it shows the amount the page settled (a floor, a wider range), not the one typed
      e.currentTarget.blur();
    } else if (e.key === "Escape") setDraft(shown);
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      enterKeyHint="done"
      dir="ltr"
      aria-label={name}
      value={text}
      onChange={(e) => setDraft(e.target.value)}
      // the amount as it stands is the person's from here: a range from outside does not change it under their fingers
      onFocus={() => setDraft(shown)}
      onBlur={settle}
      onKeyDown={key}
      className={cx("min-h-target w-28 rounded-md border bg-card px-2.5 text-end tabular-nums outline-none focus:border-ring focus:outline-1 focus:outline-ring", moved ? "border-entered/50 text-entered" : "border-input text-foreground")}
    />
  );
}

/**
 * `lo`, `hi`: the range now; `moved`: it is the reader's, not the one the chart opened at. `onRange` takes a typed pair (the page holds it
 * inside its bounds); `onReset` goes back to the opening range.
 */
export function RangeFields({ lo, hi, moved, onRange, onReset, words, className }: { lo: number; hi: number; moved: boolean; onRange: (lo: number, hi: number) => void; onReset: () => void; words: RangeWords; className?: string }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className={cx("flex flex-wrap items-center gap-x-2 gap-y-2 text-sm", className)}>
      <span id={id}>{words.lead}</span>
      <span>{words.from}</span>
      <AmountBox value={lo} name={words.fromName} moved={moved} onCommit={(n) => onRange(n, hi)} />
      <span>{words.to}</span>
      <AmountBox value={hi} name={words.toName} moved={moved} onCommit={(n) => onRange(lo, n)} />
      <span>{words.unit}</span>
      {moved && (
        <Button variant="secondary" size="compact" onClick={onReset}>
          {words.reset}
        </Button>
      )}
      {words.hint && <span className="hidden text-muted-foreground md:inline">{words.hint}</span>}
    </div>
  );
}
