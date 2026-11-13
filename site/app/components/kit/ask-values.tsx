// The toolbox's one question when a thing to change by is added to a fee (design-system 11, "Cases and parts"): which values of it the price
// list has ("לפי הערוץ: אילו ערוצים יש בתעריפון שלכם?"), each a toggle, a value of the person's own, a sentence on what adding does to the
// cases, and "להוסיף" or "ביטול". Asked once; the cases are made from the answer.
import { useId, type ReactNode } from "react";
import { Check, Split } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Button } from "./button";
import { OtherChip } from "./choice";
import { cx } from "./cx";

/**
 * A value that is ticked or not, beside others that are not exclusive: a ✓ and the action colour's outline when ticked, never colour alone.
 * The ✓ keeps its room when not ticked, so ticking moves nothing.
 */
function TickChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cx("inline-flex min-h-target items-center gap-1.5 rounded-md border bg-card ps-2.5 pe-3.5 text-sm transition-colors duration-[var(--duration-fast)]", on ? "border-primary outline-1 outline-primary" : "border-input hover:bg-accent")}>
      <Check size={16} strokeWidth={2} aria-hidden className={cx("shrink-0 text-primary", !on && "invisible")} />
      {children}
    </button>
  );
}

/**
 * `question` heads it; `options` are the thing's values, `chosen` the ids ticked, `onToggle` ticks or unticks one; `other` adds a value of
 * the person's own (the kit's `OtherChip`, "+ ערוץ אחר"); `note` says what adding does ("כל מקרה יועתק לכל ערוץ שסימנתם…"). "להוסיף" waits
 * for a value ticked.
 */
export function AskValues({ question, options, chosen, onToggle, other, note, onAdd, onCancel }: {
  question: ReactNode;
  options: { id: string; label: ReactNode }[];
  chosen: string[];
  onToggle: (id: string) => void;
  other?: { label: string; onClick: () => void; open?: boolean };
  note?: ReactNode;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3 rounded-lg border border-when-edge bg-when-fill px-3.5 py-3">
      <p id={id} className="flex items-start gap-2 font-medium text-when-ink">
        <Split size={16} strokeWidth={2} aria-hidden className="mt-1.5 shrink-0" />
        <span>{question}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <TickChip key={o.id} on={chosen.includes(o.id)} onClick={() => onToggle(o.id)}>
            {o.label}
          </TickChip>
        ))}
        {other && <OtherChip label={other.label} expanded={other.open} onClick={other.onClick} />}
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={onAdd} disabled={chosen.length === 0} className="disabled:cursor-not-allowed disabled:opacity-45">
          {copy.ask.add}
        </Button>
        <Button variant="quiet" wide onClick={onCancel}>
          {copy.ask.cancel}
        </Button>
      </div>
    </div>
  );
}
