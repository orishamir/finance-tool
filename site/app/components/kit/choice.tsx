// Choosing one of a few options (design-spec 1.3): a segmented control, or a row of chips.
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
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
export function ChoiceChips<T extends string>({ ids, labels, value, onChange, ariaLabel, bleed = "-mx-gutter px-gutter", wrap, other }: { ids: readonly T[]; labels: Record<string, string>; value: T | null; onChange: (id: T) => void; ariaLabel: string; /** Wrap into rows on a phone too, instead of scrolling sideways (the goal form's preset row, scenario fix 2026-10-24). */ wrap?: boolean; /** The phone bleed to the edge of whatever holds the row (a card pads 16px, the page pads its gutter). */ bleed?: string; /** "אחר": the last pill, the kit's `OtherChip`; the page opens its own field under the row while `open`, and no preset is chosen then (2026-10-26). */ other?: { label: string; open: boolean; onToggle: () => void } }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={wrap ? "flex flex-wrap gap-2" : cx(bleed, "md:mx-0 md:px-0 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 scrollbar-none")}>
      {ids.map((id) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={cx("sec-chip border border-border shrink-0 transition-colors duration-[var(--duration-fast)]", value === id ? "sec-chip-on" : "bg-card hover:bg-accent")}>
          {labels[id]}
        </button>
      ))}
      {other && <OtherChip label={other.label} expanded={other.open} onClick={other.onToggle} />}
    </div>
  );
}

/** The pill that opens the person's own value: "אחר" after a row of choices, or the add pill closing a `ChipList`. Dashed, no fill, a plus; tinted while what it opens is open (2026-10-26: one look for "אחר" on every page). */
export function OtherChip({ label, expanded, onClick }: { label: string; expanded?: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-expanded={expanded} onClick={onClick} className="sec-chip-add gap-1.5 shrink-0">
      <Plus size={16} strokeWidth={1.75} aria-hidden /> {label}
    </button>
  );
}

export interface Tile<T extends string> {
  value: T;
  /** The choice in words; left out when the body already names it (a label that is the answer itself). */
  title?: ReactNode;
  /** What the choice brings: the labels it adds, or a short muted line. */
  body: ReactNode;
}

/**
 * Two to five answers to one question, each a tile that shows what the answer brings (2026-11-05, the own fund's panel: each answer shows the
 * labels it adds to the fund's row). A radio group: arrow keys move between tiles; `value` may be null (nothing chosen yet). The tiles of a
 * row share one height, so a longer body never moves the row below. What is inside a tile is never a control of its own.
 */
export function TileChoice<T extends string>({ label, labelledBy, tiles, value, onChange, columns = 2, className }: { label?: string; labelledBy?: string; tiles: Tile<T>[]; value: T | null; onChange: (v: T) => void; /** Tiles a row where the space holding them is wide (a container query: a narrow panel on a computer is one a row, as a phone). */ columns?: 2 | 3; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = Math.max(0, tiles.findIndex((t) => t.value === value));
    // right to left: the left arrow goes on, as in SegmentedControl
    const next = e.key === "Home" ? 0 : e.key === "End" ? tiles.length - 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? (i + 1) % tiles.length : (i - 1 + tiles.length) % tiles.length;
    onChange(tiles[next]!.value);
    ref.current?.querySelectorAll<HTMLElement>("[role=radio]")[next]?.focus();
  };
  const chosen = tiles.some((t) => t.value === value);
  return (
    <div className="@container">
      <div ref={ref} role="radiogroup" aria-label={label} aria-labelledby={labelledBy} onKeyDown={onKey} className={cx("grid gap-2 grid-cols-[minmax(0,1fr)]", columns === 3 ? "@md:grid-cols-2 @3xl:grid-cols-3" : "@md:grid-cols-2", className)}>
        {tiles.map((t, i) => {
          const on = value === t.value;
          return (
            <div
              key={t.value}
              role="radio"
              aria-checked={on}
              tabIndex={on || (!chosen && i === 0) ? 0 : -1}
              onClick={() => onChange(t.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onChange(t.value);
                }
              }}
              className={cx(
                "flex items-start gap-2.5 min-h-target rounded-md border px-3 py-2.5 cursor-pointer text-start transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring",
                on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent/60",
              )}
            >
              <span aria-hidden="true" className={cx("size-4 shrink-0 rounded-full mt-0.5 transition-[border-width] duration-[var(--duration-fast)]", on ? "border-[5px] border-primary" : "border-[1.5px] border-input")} />
              <span className="flex flex-col gap-1.5 min-w-0">
                {t.title && <span className={cx("text-sm", on && "font-medium")}>{t.title}</span>}
                {t.body}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
