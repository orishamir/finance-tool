// A deal's periods as stops on one line, the columns under it as wide as the periods' words need (the fee page's row of what changes and
// when). Not a control: nothing in it is pressed.
import { cx } from "./cx";

/** How much wider a period's column is drawn where it holds a change (its card of what changed) than one holding only its words. */
export const PERIOD_WIDE = 2.2;

/** The columns of a deal's periods, as wide as their weights (1, or `PERIOD_WIDE` for a period with a change): for the track and the columns under it alike. */
export const periodColumns = (weights: readonly number[]): string => weights.map((k) => `minmax(0, ${k}fr)`).join(" ");

/**
 * A deal's periods as stops on one line, a stop a period at the start of its column (`weights` the columns' widths, in reading order, as
 * `periodColumns` sets them): the stop of the period today is in (`current`) filled, and the line through that period lit; the last
 * period's line runs on to the end, as it has none. Not a control. The columns under it hold the periods' words, as many as its stops.
 */
export function PeriodTrack({ weights, current }: { weights: readonly number[]; current: number }) {
  return (
    <div aria-hidden="true" className="grid items-center" style={{ gridTemplateColumns: periodColumns(weights) }}>
      {weights.map((_, k) => (
        <span key={k} className="relative flex h-4 items-center">
          <span className={cx("absolute inset-x-0 h-0.5 rounded-full", k === current ? "bg-primary" : "bg-border")} />
          <span className={cx("relative size-3 rounded-full border-2", k === current ? "border-primary bg-primary" : "border-muted-foreground bg-card")} />
        </span>
      ))}
    </div>
  );
}
