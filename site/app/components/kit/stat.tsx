// Figures with names: a stat, a row of stats, a label/value row, a list of key/value cards, the headline figure.
import type { ReactNode } from "react";
import { cx } from "./cx";
import { Card } from "./card";

// `value` is the teal of the bars and lanes (GainBars, the savings plan's open deposits); `net` the pale teal of a net line (the makam's
// price, the current account's balance), so a swatch matches the marks it names.
const SWATCH = { alt: "bg-chart-alt", value: "bg-chart-value", net: "bg-chart-net", cost: "bg-muted-foreground" } as const;

/** One figure with its name above it (and a note under it): a result of a visual or a card. Sits in a `<dl>`; `tone` adds the swatch of the bar or line it names. */
export function Stat({ label, children, note, tone }: { label: ReactNode; children: ReactNode; note?: ReactNode; tone?: keyof typeof SWATCH }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="text-sm text-muted-foreground flex items-center gap-1.5">
        {tone && <span aria-hidden="true" className={cx("size-2.5 rounded-sm shrink-0", SWATCH[tone])} />}
        {label}
      </dt>
      <dd className="text-lg font-semibold">{children}</dd>
      {note && <dd className="text-xs text-muted-foreground">{note}</dd>}
    </div>
  );
}

/** One large figure in a frame of its own (32 px with `size="figure"`), with its name above it and a sentence under it: a row of them states a block's main points. Sits in a `<dl>` (`StatRow`). */
export function StatTile({ label, children, note, size }: { label: ReactNode; children: ReactNode; note: ReactNode; /** `figure`: the 32 px headline figure, for the one or two numbers a block answers with (charts.md "One number"). */ size?: "figure" }) {
  return (
    <Card pad="tight" className="flex flex-col gap-0.5 min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cx(size === "figure" ? "text-figure" : "text-2xl", "font-bold leading-snug")}>{children}</dd>
      <dd className="text-xs text-muted-foreground flex flex-col gap-1">{note}</dd>
    </Card>
  );
}

const COLS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", tiles: "lg:grid-cols-3" } as const;

/** Two to four `Stat`s side by side from `sm` up; one column on a phone, except four, which go two by two. */
export function StatRow({ children, cols = 3 }: { children: ReactNode; cols?: keyof typeof COLS }) {
  return <dl className={cx("grid gap-4", COLS[cols])}>{children}</dl>;
}

/** One label and its value on a line, the label at the start and the value at the end. Rows of a `<dl>` (a fee line, a term). */
export function KeyValue({ label, children, size = "sm" }: { label: ReactNode; children: ReactNode; /** The value's size: `sm` (14 px) or `base` (16 px). */ size?: "sm" | "base" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={size === "base" ? "text-base" : undefined}>{children}</dd>
    </div>
  );
}

export interface KeyValueItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  tag?: ReactNode;
  /** A line under the value. */
  line?: ReactNode;
  /** A quiet lead line under that. */
  lead?: ReactNode;
  /** Whatever closes the item (the rule chips). */
  footer?: ReactNode;
}

/** Facts as cards: one card with dividers on a phone, a two-by-two grid with the value at 20 px from `lg` (design-spec 2). */
export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return (
    <>
      {/* the card pads itself and each item pads again: the earlier `p-0 md:p-0` never took effect (the stylesheet puts p-4 after p-0), so the look is kept and the dead classes dropped */}
      <Card className="lg:hidden flex flex-col divide-y divide-border">
        {items.map((it) => (
          <div key={it.id} className="flex flex-col gap-1 p-4">
            <span className="text-sm text-muted-foreground">{it.label}</span>
            <span className="flex flex-wrap items-center gap-2">
              <span>{it.value}</span>
              {it.tag}
            </span>
            {it.line && <span className="text-sm">{it.line}</span>}
            {it.lead && <span className="text-xs text-muted-foreground">{it.lead}</span>}
            {it.footer}
          </div>
        ))}
      </Card>
      <div className="hidden lg:grid grid-cols-2 gap-4">
        {items.map((it) => (
          <Card key={it.id} className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">{it.label}</span>
            <span className="text-xl font-semibold flex flex-wrap items-center gap-2">
              <span>{it.value}</span>
              {it.tag}
            </span>
            {it.line && <span className="text-sm">{it.line}</span>}
            {it.lead && <span className="text-xs text-muted-foreground">{it.lead}</span>}
            {it.footer}
          </Card>
        ))}
      </div>
    </>
  );
}

/**
 * Small figures one under the other, each on one line with a muted label at its start (a deposit's rate at each amount, on a phone row): a
 * short list that keeps the row low. A line set aside by a choice elsewhere (`dim`) dims in place.
 */
export function FigureLines({ items, className }: { items: { id: string; label: ReactNode; figure: ReactNode; dim?: boolean }[]; className?: string }) {
  return (
    <dl className={cx("flex flex-col", className)}>
      {items.map((it) => (
        <div key={it.id} className={cx("flex items-baseline justify-between gap-3 py-1 border-t border-border first:border-t-0 transition-opacity duration-[var(--duration-base)]", it.dim && "opacity-45")}>
          <dt className="min-w-0 text-sm text-muted-foreground">{it.label}</dt>
          <dd className="shrink-0 text-end">{it.figure}</dd>
        </div>
      ))}
    </dl>
  );
}
