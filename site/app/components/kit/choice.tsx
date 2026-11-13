// Choosing one of a few options (design-spec 1.3): a segmented control, or a row of chips.
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { IconCheck } from "../icons";
import { CARD_PAD, type CardPad } from "./card";
import { cx } from "./cx";
import { gershayim } from "./name";
import { fmt } from "../../lib/format";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Two to four short options of equal weight, one always chosen (real or nominal, a count). role="group" with aria-pressed buttons, one stop
 * of the Tab key (the chosen option); the arrow keys move between the options and choose. A compact strip, 30 px tall with a 44 px tap area, its options never wrapping their words: the chosen one in
 * the dark action fill with light bold words and a small check; the others in the muted ink. Each option holds room for its words at the
 * chosen weight, so choosing moves nothing. A disabled option is faint and cannot be chosen. Options too long to stand side by side in
 * the room given go onto a second row, each still on one line, rather than out of the box.
 */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className, labelledBy, check = true, fit }: { label?: string; options: SegmentOption<T>[]; value: T | null; onChange: (v: T) => void; className?: string; labelledBy?: string; /** As wide as its options from 640 px, not the full width. */ fit?: boolean; /** The check on the pressed option; a company page's controls go without it, the fill alone (the designer's mocks). */ check?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const i = Math.max(0, enabled.findIndex((o) => o.value === value));
    // right to left: the left arrow (and down) goes on
    const on = e.key === "ArrowLeft" || e.key === "ArrowDown";
    const next = e.key === "Home" ? 0 : e.key === "End" ? enabled.length - 1 : on ? (i + 1) % enabled.length : (i - 1 + enabled.length) % enabled.length;
    onChange(enabled[next]!.value);
    ref.current?.querySelectorAll("button")[options.indexOf(enabled[next]!)]?.focus();
  };
  return (
    <div ref={ref} role="group" aria-label={label} aria-labelledby={labelledBy} onKeyDown={onKey} className={cx("inline-flex flex-wrap w-full max-w-full rounded-[10px] border border-input", fit && "sm:w-fit", className)}>
      {options.map((o) => {
        const on = value === o.value;
        const words = typeof o.label === "string" ? gershayim(o.label) : o.label;
        // one stop of the Tab key: the chosen option, or the first that can be chosen where none is
        const stop = value === null || !options.some((x) => x.value === value) ? o === options.find((x) => !x.disabled) : on;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            aria-label={typeof words === "string" ? words : undefined}
            tabIndex={stop ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cx(
              "flex-1 inline-flex items-center justify-center gap-1 whitespace-nowrap min-h-[30px] tap-area px-3 text-sm rounded-[9px] transition-colors duration-[var(--duration-fast)] disabled:opacity-40 disabled:cursor-not-allowed",
              on ? "bg-primary-subtle text-foreground" : "text-muted-foreground enabled:hover:bg-accent/60 enabled:hover:text-foreground",
            )}
          >
            {check && on && <IconCheck size={14} className="shrink-0 text-primary" />}
            {/* the words laid out twice in one cell, once at the chosen weight and unseen: an option is as wide chosen or not */}
            <span className="inline-grid *:[grid-area:1/1]">
              <span aria-hidden="true" className="invisible font-semibold">
                {words}
              </span>
              <span className={on ? "font-semibold" : undefined}>{words}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A row of chips, one chosen at a time: one of many values narrowing a list (with `counts`), or preset answers to a question (without,
 * and `other` for the reader's own value); docs/design-system.md 11, "Which choice control". Scrolls sideways on a phone and wraps from md
 * (or wraps always with `wrap`, or stays one line at every width with `line`). A chip never submits. `value` may be null (nothing chosen).
 * A chip keeps one width whether it is chosen or not (its label holds room for the chosen chip's weight), so choosing moves nothing.
 * `counts` puts a number in a fixed slot after each label (how many rows a choice would show); a chip that would show none dims in place.
 * The row is one radio group and one stop of the Tab key (the chosen chip, else the first): the arrow keys move between the chips, and
 * Space or Enter chooses the one with the focus.
 */
export function ChoiceChips<T extends string>({ ids, labels, value, onChange, ariaLabel, bleed = "-mx-gutter px-gutter", wrap, line, counts, other }: { ids: readonly T[]; /** Words, or a node where a label needs its own direction (an amount isolated left to right). */ labels: Record<string, ReactNode>; value: T | null; onChange: (id: T) => void; ariaLabel: string; /** Wrap into rows on a phone too, instead of scrolling sideways. */ wrap?: boolean; /** One line at every width: a row that does not fit scrolls sideways, never wraps or grows. */ line?: boolean; /** A number after each label, in a fixed slot. */ counts?: Partial<Record<T, number>>; /** The phone bleed to the edge of whatever holds the row (a card pads 16px, the page pads its gutter). */ bleed?: string; /** "אחר": the last pill, the kit's `OtherChip`; the page opens its own field under the row while `open`, and no preset is chosen then. */ other?: { label: string; open: boolean; onToggle: () => void } }) {
  const layout = wrap ? "flex flex-wrap gap-2" : line ? cx(bleed, "md:mx-0 md:px-0 flex gap-2 overflow-x-auto pb-1 scrollbar-none") : cx(bleed, "md:mx-0 md:px-0 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 scrollbar-none");
  const stop = value !== null && ids.includes(value) ? value : ids[0];
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    const chips = [...e.currentTarget.querySelectorAll<HTMLElement>("[role=radio]")];
    const i = chips.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    // right to left: the left arrow (and down) goes on
    const on = e.key === "ArrowLeft" || e.key === "ArrowDown";
    const next = e.key === "Home" ? 0 : e.key === "End" ? chips.length - 1 : on ? (i + 1) % chips.length : (i - 1 + chips.length) % chips.length;
    chips[next]!.focus();
  };
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={layout} onKeyDown={onKey}>
      {ids.map((id) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} aria-label={typeof labels[id] === "string" ? gershayim(labels[id] as string) : undefined} tabIndex={id === stop ? 0 : -1} onClick={() => onChange(id)} className={cx("sec-chip border border-border shrink-0 transition-[background-color,color,opacity] duration-[var(--duration-fast)]", counts && "gap-2", value === id ? "sec-chip-on" : "bg-card hover:bg-accent", counts?.[id] === 0 && value !== id && "opacity-45")}>
          {/* the label laid out twice in one cell, once at the chosen weight and unseen: the chip is as wide chosen or not */}
          <span className="inline-grid *:[grid-area:1/1]">
            <span aria-hidden="true" className="invisible font-medium">
              {labels[id]}
            </span>
            <span>{labels[id]}</span>
          </span>
          {counts && (
            <bdi dir="ltr" className="inline-block min-w-[3ch] text-end tabular-nums font-normal opacity-70">
              {counts[id] !== undefined ? fmt.number(counts[id]) : ""}
            </bdi>
          )}
        </button>
      ))}
      {other && <OtherChip label={other.label} expanded={other.open} onClick={other.onToggle} />}
    </div>
  );
}

/**
 * A tray of one line and one height under a row of choices, always there: while nothing above opens it, a muted hint of what will appear
 * here; then its label and its own row of choices, which scrolls sideways rather than wrap (the companies page's products under the kind of
 * product). Its height never changes, so what stands below it never moves.
 */
export function ChoiceTray({ label, hint, children, labelId }: { label: string; /** Shown while the tray holds no choices. */ hint: ReactNode; children?: ReactNode; /** The label's element id (the row inside names itself by it). */ labelId?: string }) {
  return (
    <div className="h-16 md:h-12 flex items-center gap-3 min-w-0 overflow-hidden">
      {children ? (
        <>
          <span id={labelId} className="shrink-0 text-sm font-medium">
            {label}
          </span>
          <div className="flex-1 min-w-0">{children}</div>
        </>
      ) : (
        <p className="min-w-0 line-clamp-2 md:line-clamp-none md:truncate text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * Two levels of one choice (the companies page's kind of product, then a product; the tracks page's product, then the kind of track): the
 * first as a row of chips with counts, the second in a `ChoiceTray` under it, one line of one height that scrolls sideways, so choosing at
 * either level moves nothing below. While the first level opens nothing, the tray holds `child.hint`. `start` stands before the first row
 * on its line from md (a search field); `under` is a line under it (a link about the choice).
 */
export function ChoicePair<P extends string, C extends string>({ parent, child, start, under }: { parent: { label: string; ids: readonly P[]; labels: Record<string, string>; value: P; counts?: Partial<Record<P, number>>; onChange: (id: P) => void }; child: { label: string; ids: readonly C[]; labels: Record<string, string>; value: C | null; counts?: Partial<Record<C, number>>; onChange: (id: C) => void; /** Shown while there is nothing to choose at this level. */ hint: ReactNode }; start?: ReactNode; under?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        {start}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-sm font-medium">{parent.label}</span>
          <ChoiceChips ids={parent.ids} labels={parent.labels} value={parent.value} counts={parent.counts} onChange={parent.onChange} ariaLabel={parent.label} />
        </div>
      </div>
      {under}
      <ChoiceTray label={child.label} hint={child.hint}>
        {child.ids.length > 0 && <ChoiceChips ids={child.ids} labels={child.labels} value={child.value} counts={child.counts} onChange={child.onChange} ariaLabel={child.label} line bleed="" />}
      </ChoiceTray>
    </div>
  );
}

/** The pill that opens the person's own value: "אחר" after a row of choices, or the add pill closing a `ChipList`. Dashed, no fill, a plus; tinted while what it opens is open (one look for "אחר" on every page). */
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
 * Two to five answers to one question, each a tile that shows what the answer brings (the own fund's panel: each answer shows the
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
      <div ref={ref} role="radiogroup" aria-label={label} aria-labelledby={labelledBy} onKeyDown={onKey} className={cx("grid gap-2 grid-cols-[minmax(0,1fr)]", columns === 3 ? "@md:grid-cols-2 @xl:grid-cols-3" : "@md:grid-cols-2", className)}>
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

// Links, buttons, fields and source taps inside a PickCard lie above the card's own button, so they keep working; a field's whole box
// (`data-lift`, FigureField's) lies above it too, so a press anywhere in the box goes to the field and not to the card.
const LIFT_INNER = "[&_:is(a,button,[role=button],input,select,[data-lift]):not([data-pick-card])]:relative [&_:is(a,button,[role=button],input,select,[data-lift]):not([data-pick-card])]:z-10";

/**
 * An option shown as a card, the whole card one button: a tap anywhere on it chooses it (guidelines/design.md, "Choose by
 * tapping the option itself"), never a "choose this" link inside it. Unlike TileChoice, what is inside may hold controls of its own (a
 * figure that opens its source, a fund number that opens its page, a figure typed in place): they lie above the card's button. The button
 * is stretched over the card and comes first inside it, so the keyboard meets the card before what is in it; `label` names it for a
 * screen reader. `chosen`: the option chosen, marked by the action colour's edge (a word inside says so too, never colour alone); it keeps
 * its button, so choosing moves no focus and the card's shape stays. A chosen card's button says it is pressed and does not light up.
 * `pad` takes Card's paddings (`snug` for an option in a list of options); `none`, the default, leaves it to what is inside. `marked`:
 * another part of the page points at this option (the fee page's glance under the pointer), drawn as the hover is.
 */
export function PickCard({ label, onPick, pad = "none", chosen, marked, className, buttonProps, children }: {
  label: string;
  onPick: (by: "pointer" | "keyboard") => void;
  pad?: CardPad;
  chosen?: boolean;
  marked?: boolean;
  className?: string;
  /** Data attributes for the card's button (a page that gives it the focus finds it by them). */
  buttonProps?: Record<`data-${string}`, string>;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "relative rounded-lg border transition-colors duration-[var(--duration-fast)]",
        chosen ? "border-primary outline-1 outline-primary" : cx("border-border cursor-pointer hover:bg-accent/60", marked && "bg-accent/60"),
        CARD_PAD[pad],
        LIFT_INNER,
        className,
      )}
    >
      <button
        type="button"
        data-pick-card
        aria-label={label}
        aria-pressed={chosen ?? undefined}
        onClick={(e) => onPick(e.detail === 0 ? "keyboard" : "pointer")}
        className={cx("absolute inset-0 w-full rounded-lg focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2", chosen && "cursor-default")}
        {...buttonProps}
      />
      {children}
    </div>
  );
}
