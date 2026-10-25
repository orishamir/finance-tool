// Choosing one of a few options (design-spec 1.3): a segmented control, or a row of chips.
import { useRef, type KeyboardEvent } from "react";
import { IconCheck } from "../icons";
import { cx } from "./cx";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Two to four short options of equal weight, one always chosen (real or nominal, a count). role="group" with aria-pressed buttons; arrow keys move between options. */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className, labelledBy }: { label?: string; options: SegmentOption<T>[]; value: T | null; onChange: (v: T) => void; className?: string; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const i = Math.max(0, enabled.findIndex((o) => o.value === value));
    const next = e.key === "Home" ? 0 : e.key === "End" ? enabled.length - 1 : e.key === "ArrowLeft" ? (i + 1) % enabled.length : (i - 1 + enabled.length) % enabled.length;
    onChange(enabled[next]!.value);
    ref.current?.querySelectorAll("button")[options.indexOf(enabled[next]!)]?.focus();
  };
  return (
    <div ref={ref} role="group" aria-label={label} aria-labelledby={labelledBy} onKeyDown={onKey} className={cx("inline-flex w-full rounded-md bg-muted p-[3px] gap-[3px]", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cx(
            "flex-1 inline-flex items-center justify-center gap-1.5 min-h-target lg:min-h-10 px-3 rounded-[5px] text-sm transition-colors duration-[var(--duration-fast)] disabled:text-muted-foreground disabled:cursor-not-allowed",
            value === o.value ? "bg-primary font-medium text-primary-foreground shadow-sm" : "text-foreground hover:bg-accent/60", // audit 2026-10-24 (A41): a clear pressed state
          )}
        >
          {value === o.value && <IconCheck size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Four or more options, or longer labels: a row of chips, one chosen at a time; scrolls sideways on a phone and wraps from md (or wraps always with `wrap`). A chip never submits. `value` may be null (nothing chosen). */
export function ChoiceChips<T extends string>({ ids, labels, value, onChange, ariaLabel, bleed = "-mx-gutter px-gutter", wrap }: { ids: readonly T[]; labels: Record<string, string>; value: T | null; onChange: (id: T) => void; ariaLabel: string; /** Wrap into rows on a phone too, instead of scrolling sideways (the goal form's preset row, scenario fix 2026-10-24). */ wrap?: boolean; /** The phone bleed to the edge of whatever holds the row (a card pads 16px, the page pads its gutter). */ bleed?: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={wrap ? "flex flex-wrap gap-2" : cx(bleed, "md:mx-0 md:px-0 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 scrollbar-none")}>
      {ids.map((id) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={cx("sec-chip border border-border shrink-0 transition-colors duration-[var(--duration-fast)]", value === id ? "sec-chip-on" : "bg-card hover:bg-accent")}>
          {labels[id]}
        </button>
      ))}
    </div>
  );
}
