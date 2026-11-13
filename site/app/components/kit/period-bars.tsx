// A choice of one period drawn as a bar chart (the deposits page's terms): each column is one button that picks its period, with the
// figure as text, a bar, a pill with the period's name and a short note under it (who pays it). All bars share one scale from zero; there
// are no gridlines and no value axis, since every bar carries its figure (charts.md). The chosen column is framed and tinted, its pill
// filled and its bar at full strength; the others stand on a faint band and light up on hover. A column with no figure says so and has no
// bar, and can still be chosen. Bars ease to new heights, except for a reader who asks for less motion.
import type { ReactNode } from "react";
import { cx } from "./cx";

export interface PeriodBar {
  id: string;
  /** The pill's words from md. */
  label: string;
  /** The pill's words where the chart is narrower than 42rem (a phone: eight across its width); `tiny` under 23rem. */
  short?: string;
  tiny?: string;
  /** The bar's height on the shared scale; null: no bar, and `empty` in place of the figure. */
  value: number | null;
  /** The figure written over the bar ("3.25%"); `unit` after it, dropped where the chart is under 23rem and eight figures barely fit. */
  figure?: string;
  unit?: string;
  /** Under the pill where the chart is 42rem or wider (the bank that pays it); a phone leaves it out. */
  note?: ReactNode;
  /** The column's spoken name in full ("שנה: 3.25% בבנק ירושלים"). */
  spoken: string;
}

export function PeriodBars({ bars, value, onChange, empty, label, chosenWord, className }: { bars: PeriodBar[]; value: string; onChange: (id: string) => void; /** Written where a column has no figure ("אין"). */ empty: string; /** The group's spoken name. */ label: string; /** Said after the chosen column's name ("נבחרה"). */ chosenWord: string; className?: string }) {
  const top = Math.max(0, ...bars.map((b) => b.value ?? 0));
  return (
    <div role="group" aria-label={label} data-chart className={cx("@container grid grid-flow-col auto-cols-fr gap-0.5 md:gap-2", className)}>
      {bars.map((b, i) => {
        const on = b.id === value;
        const share = b.value !== null && top > 0 ? b.value / top : 0;
        return (
          <button
            key={b.id}
            type="button"
            aria-pressed={on}
            aria-label={on ? `${b.spoken}, ${chosenWord}` : b.spoken}
            onClick={() => onChange(b.id)}
            className={cx(
              "group/bar min-w-0 flex flex-col items-center gap-2 rounded-lg border pt-3 pb-2 md:pb-3 px-0.5 md:px-2 cursor-pointer transition-colors duration-[var(--duration-base)]",
              on ? "border-primary bg-primary-subtle" : "border-transparent bg-muted/40 hover:bg-muted hover:border-border",
            )}
          >
            {/* the plot: a fixed height in every column, so the bars stand on one line; the figure sits on its bar */}
            <span className="relative w-full h-36 md:h-44 flex flex-col items-center justify-end gap-1">
              <span aria-hidden="true" className={cx("text-[13px] md:text-sm font-semibold tabular-nums leading-tight whitespace-nowrap", b.value === null && "text-muted-foreground font-normal")}>
                {b.value === null ? (
                  empty
                ) : (
                  <>
                    {b.figure}
                    {b.unit && <span className="@max-[23rem]:hidden">{b.unit}</span>}
                  </>
                )}
              </span>
              {b.value !== null && (
                <span
                  aria-hidden="true"
                  data-mark="bar"
                  className={cx("block w-[62%] md:w-[56%] max-w-24 rounded-t-[4px] transition-[height] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", on ? "bg-primary" : "bg-chart-value/55 group-hover/bar:bg-chart-value/70")}
                  // the figure's line takes about 1.5rem of the plot; the bar takes up to the rest
                  style={{ height: `calc((100% - 1.5rem) * ${share})`, minHeight: 2 }}
                />
              )}
              {/* the bars' zero line, for the chart check: unseen, as the chart draws none */}
              {i === 0 && <span aria-hidden="true" data-zero className="absolute inset-x-0 bottom-0 h-px opacity-0" />}
            </span>
            <span aria-hidden="true" className={cx("w-full inline-flex items-center justify-center min-h-8 md:min-h-9 rounded-full border text-[13px] md:text-sm font-semibold whitespace-nowrap px-0.5 md:px-3", on ? "bg-foreground text-background border-foreground" : "border-input text-foreground")}>
              <span className="hidden @2xl:inline">{b.label}</span>
              <span className="@2xl:hidden @max-[23rem]:hidden">{b.short ?? b.label}</span>
              <span className="hidden @max-[23rem]:inline">{b.tiny ?? b.short ?? b.label}</span>
            </span>
            {b.note !== undefined && (
              <span aria-hidden="true" className="hidden @2xl:block text-sm text-muted-foreground leading-tight min-h-5 truncate max-w-full">
                {b.note}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A thin bar under a figure in a table row, its length the figure's share of the list's highest: the chosen or top row's in the accent,
 * the others in the value colour, and a hollow one for a row that stands apart (an offer with a condition). `computed` is the site's own
 * reckoning of the share, in the computed ink. `stocks` and `currency` draw a track's exposure, a share from 0 to 100% in the measure's
 * chart colour, empty at 0 (kit ExposureCell). Grows from the row's start.
 */
export function MeterBar({ share, tone = "value", hollow, className }: { share: number; tone?: "accent" | "value" | "muted" | "computed" | "stocks" | "currency"; hollow?: boolean; className?: string }) {
  const exposure = tone === "stocks" || tone === "currency";
  const w = `${Math.max(exposure ? 0 : 0.02, Math.min(1, share)) * 100}%`;
  const fill = { accent: "bg-primary", value: "bg-chart-value", muted: "bg-muted-foreground", computed: "bg-computed", stocks: "bg-chart-stocks", currency: "bg-chart-currency" }[tone];
  const edge = { accent: "border-primary", value: "border-chart-value", muted: "border-muted-foreground", computed: "border-computed", stocks: "border-chart-stocks", currency: "border-chart-currency" }[tone];
  return (
    <span aria-hidden="true" className={cx("relative block h-1.5 w-full rounded-full bg-muted", className)}>
      <span className={cx("absolute inset-y-0 start-0 rounded-full transition-[width] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", hollow ? cx("border bg-card", edge) : fill)} style={{ width: w }} />
    </span>
  );
}
