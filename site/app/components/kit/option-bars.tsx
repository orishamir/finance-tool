// Bars comparing options (charts.md, "Bars (comparing options)"): one row an option, its name and one line under it at the start, then its
// bar growing from one zero line, 16 px thick, rounded at the far end and square at the line, with the amount written just past the bar's
// end. The amounts on the marks stand in for a value axis, so there is none. Label text is in the text colours; the bar carries the
// colour. The caller sorts the rows (largest first, unless the order means something else). The chart check finds it by `data-chart` and
// reads the zero line (`data-zero`) and the bars (`data-mark`).
import type { ReactNode } from "react";
import { cx } from "./cx";

export interface OptionBar {
  id: string;
  name: ReactNode;
  /** One line under the name (who charges it, at what rate). */
  sub?: ReactNode;
  /** The bar's length on the shared scale; at or under 0 no bar is drawn. */
  value: number;
  /** The amount as written past the bar's end (a figure that opens its sheet). */
  amount: ReactNode;
  /** The bar's colour role, a `bg-` class. */
  className: string;
}

/** The room past the longest bar for its amount ("123,456 ₪" at 14 px). */
const AMOUNT_ROOM = "6.5rem";

export function OptionBars({ bars, label, className }: { bars: OptionBar[]; /** The chart's spoken name. */ label: string; className?: string }) {
  const top = Math.max(0, ...bars.map((b) => b.value));
  return (
    <ul aria-label={label} data-chart="option-bars" className={cx("flex flex-col", className)}>
      {bars.map((b, i) => {
        const share = top > 0 ? Math.max(0, b.value) / top : 0;
        return (
          <li key={b.id} className="grid gap-x-4 gap-y-1 border-b border-border py-2 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-stretch">
            <span className="flex min-w-0 flex-col justify-center">
              <span className="text-sm font-medium">{b.name}</span>
              {b.sub !== undefined && <span className="text-xs text-muted-foreground">{b.sub}</span>}
            </span>
            {/* the zero line runs down the rows at the bars' start; the first row's carries the mark the chart check reads */}
            <span className="relative flex min-h-8 items-center border-s border-chart-axis">
              {i === 0 && <span aria-hidden="true" data-zero className="absolute inset-y-0 start-0 w-px" />}
              {share > 0 && <span aria-hidden="true" data-mark="bar" className={cx("block h-4 rounded-e-[4px] transition-[width] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", b.className)} style={{ width: `calc((100% - ${AMOUNT_ROOM}) * ${share})` }} />}
              <span className="ms-2 whitespace-nowrap text-sm font-semibold tabular-nums">{b.amount}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
