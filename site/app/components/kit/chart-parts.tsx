// The three parts that sit around every chart: the legend, the readout of the hovered year, and the table view; and the two axis parts
// the SVG charts share: the value axis's labels and the year ticks.
import { CountingFigures } from "./counting";
import type { CSSProperties, ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { buttons, kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import type { ChartPick } from "./chart-interact";
import { tickFade } from "./chart-glide";
import type { GlideTick } from "./chart-glide-math";
import { cx } from "./cx";
import { Disclosure } from "./disclosure";
import { PHONE_GONE, TableCols } from "./table-cols";

/** A sideways-scrolling table wrapper's cue without script: a card-colour fade at each end that is still hidden content, and a soft edge shadow. */
export const scrollCueStyle: CSSProperties = {
  background:
    "linear-gradient(to right, var(--card) 30%, transparent) left center / 32px 100% no-repeat local, linear-gradient(to left, var(--card) 30%, transparent) right center / 32px 100% no-repeat local, radial-gradient(farthest-side at 0 50%, rgb(255 255 255 / 0.22), transparent) left center / 14px 100% no-repeat scroll, radial-gradient(farthest-side at 100% 50%, rgb(255 255 255 / 0.22), transparent) right center / 14px 100% no-repeat scroll",
};

/**
 * Year ticks on a whole-year grid: steps of 1, 2, 5 or 10 years (d3's nice steps for about four intervals), always
 * including 0 ("today"). Any horizon from 1 to 40 gives 3 to 8 ticks, never a 2.5-year step.
 */
export function niceYearTicks(horizon: number): number[] {
  const h = Math.max(1, Math.round(horizon));
  const t = scaleLinear().domain([0, h]).ticks(4).filter((v) => Number.isInteger(v));
  return t.length ? t : [0, h];
}

/** Year ticks for a zoomed view: the same whole-year steps between its two ends. */
export function yearTicksIn(from: number, to: number): number[] {
  if (from <= 0) return niceYearTicks(to);
  const t = scaleLinear().domain([from, to]).ticks(4).filter((v) => Number.isInteger(v));
  return t.length >= 2 ? t : [Math.ceil(from), Math.floor(to)];
}

/**
 * The value axis of an SVG chart (design-system section 12, "Axes and labels"): each tick's amount in shekels, in the compact form, at the
 * plot's start edge just above its gridline, with a card-colour halo. Drawn after the lines, so no line runs through a label; the zero
 * line has no label.
 */
export function AxisLabels({ ticks, y }: { ticks: GlideTick[]; y: (v: number) => number }) {
  return (
    <>
      {ticks.map(
        (t) =>
          t.value > 0 && (
            <text key={t.value} x={2} y={y(t.value) - 4} textAnchor="start" direction="ltr" className={cx("text-xs fill-chart-text stroke-card [paint-order:stroke]", tickFade(t))} strokeWidth="3" data-scale>
              {fmt.compactNisAxis(t.value)}
            </text>
          ),
      )}
    </>
  );
}

export type SwatchShape = "line" | "box" | "entered-line" | "rule" | "dotted-line";

/** The little mark of a series: `line` (14 by 3 px) for a line, `box` (10 px) for a band, `entered-line` (dashed, a stroke class) for a series that rests on an entered return, `rule` (dashed border) for a reference, `dotted-line` (round dots, a stroke class) for the comparison chart's baseline, which runs beside dashed entered-return lines. `className` carries the colour role. */
export function Swatch({ shape = "line", className }: { shape?: SwatchShape; className?: string }) {
  if (shape === "box") return <span className={cx("size-2.5 rounded-sm", className)} />;
  if (shape === "rule") return <span className={cx("w-3.5 border-t-2 border-dashed", className)} />;
  if (shape === "dotted-line")
    return (
      <svg width="14" height="4" aria-hidden="true">
        <line x1="1.5" y1="2" x2="13" y2="2" strokeDasharray="0.1 4" strokeLinecap="round" strokeWidth="3" className={className} />
      </svg>
    );
  if (shape === "entered-line")
    return (
      <svg width="14" height="3" aria-hidden="true">
        <line x1="0" y1="1.5" x2="14" y2="1.5" strokeDasharray="4 2" strokeWidth="3" className={className} />
      </svg>
    );
  return <span className={cx("w-3.5 h-[3px] rounded-sm", className)} />;
}

export interface LegendItem {
  id: string;
  /** The mark; an item without one is a plain line of text (a remainder note). */
  swatch?: ReactNode;
  label: ReactNode;
  /** What stands after the item, outside its pick: what the series rests on that its name leaves out, in a few weak words with a "?"
   *  (`HelpMark`) for the rest (the return the site assumes for a fund's line). */
  after?: ReactNode;
}

/**
 * What each colour or line on a chart means: one item per series, under the chart's title. Colour never works alone, so every item has its
 * name. With `pick`, an item that has a mark sets its series apart on the chart: a mouse previews, a click or a tap keeps. An item's `after`
 * stands after it, never inside its button. Where the legend wraps, its lines of controls stand 44 px apart, so no press area covers another.
 */
export function ChartLegend({ items, pick }: { items: LegendItem[]; pick?: ChartPick<string> }) {
  // a group's name ("הקרן:") goes on one line with its first item: in a narrow legend, left at a line's end apart from its items, it would
  // read as the last item of the group before it
  const rows: { head?: LegendItem; it: LegendItem }[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i]!;
    const next = items[i + 1];
    if (!it.swatch && next?.swatch) {
      rows.push({ head: it, it: next });
      i++;
    } else rows.push({ it });
  }
  // a legend that holds controls (a pick's buttons, a "?" after an item) puts a wrapped line 44 px under the one above from md, where each
  // control's press area is 44 px around a 16 px line: closer, the lower line's areas cover the upper's (a phone's buttons are 44 px tall)
  const controls = !!pick || items.some((it) => !!it.after);
  return (
    <ul className={cx("flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", controls && "md:gap-y-7")} aria-label={kitCopy.legend}>
      {rows.map(({ head, it }) => (
        <li key={it.id} className={it.swatch ? "flex items-center gap-1.5" : undefined}>
          {head && <span className="me-2.5">{head.label}</span>}
          {pick && it.swatch ? (
            <button type="button" aria-pressed={pick.pinned === it.id} {...pick.bind(it.id)} className={cx("inline-flex items-center gap-1.5 max-md:min-h-target md:tap-area cursor-pointer transition-opacity duration-[var(--duration-fast)] hover:text-foreground", pick.active === it.id && "text-foreground", pick.active && pick.active !== it.id && "opacity-50")}>
              {it.swatch}
              {it.label}
            </button>
          ) : (
            <>
              {it.swatch}
              {it.label}
            </>
          )}
          {it.after}
        </li>
      ))}
    </ul>
  );
}

export interface ReadoutRow {
  id: string;
  swatch?: ReactNode;
  label: ReactNode;
  /** Usually a `Num`. */
  value: ReactNode;
}

/** The values of every series at the hovered year (or at the horizon): a head line with the year, then one row per series. */
export function ChartReadout({ title, rows }: { title: ReactNode; rows: ReadoutRow[] }) {
  return (
    <CountingFigures on={false}>
    <dl className="readout" aria-live="polite">
      <div className="readout-row readout-head">
        <dt>{title}</dt>
        <dd />
      </div>
      {rows.map((r) => (
        <div key={r.id} className="readout-row">
          <dt className={r.swatch ? "flex items-center gap-2" : undefined}>
            {r.swatch}
            {r.label}
          </dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
    </CountingFigures>
  );
}

export interface TableColumn {
  id: string;
  head: ReactNode;
}
export interface TableRowData {
  key: string | number;
  /** The row's name, usually the year; shown as an isolated left-to-right run. */
  head: ReactNode;
  cells: ReactNode[];
}

/**
 * A table always in view with a fixed width per column, so nothing moves when a number changes: a header on every column, row heads at
 * the start, `strong` for a closing row, and `hideOnPhone` for a column the phone can do without. `measure` caps it at the prose width
 * (38 rem), for a table of words inside guide prose: on a PC it no longer runs wider than the text around it. Without it the table is
 * marked `data-wide`, so a guide section, which holds its blocks to the prose width, leaves it the page's.
 */
export function FixedTable({ rowHead, columns, rows, measure }: { rowHead: ReactNode; columns: { id: string; head: ReactNode; hideOnPhone?: boolean }[]; rows: { key: string; head: ReactNode; cells: ReactNode[]; strong?: boolean }[]; measure?: boolean }) {
  return (
    <table data-wide={measure ? undefined : ""} className={cx("tbl text-sm max-md:text-[13px] [&_thead_th]:align-bottom [&_td]:align-top [&_th]:align-top max-md:[&_td]:px-1 max-md:[&_th]:px-1", measure && "max-w-measure")}>
      <TableCols widths={["auto", ...columns.map((c) => ({ pc: "auto", phone: c.hideOnPhone ? "0" : "auto" }))]} />
      <thead>
        <tr>
          <th scope="col">{rowHead}</th>
          {columns.map((c) => (
            <th key={c.id} scope="col" className={c.hideOnPhone ? PHONE_GONE : undefined}>
              {c.head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className={r.strong ? "border-t-2 border-border font-semibold" : undefined}>
            <th scope="row">{r.head}</th>
            {r.cells.map((cell, i) => (
              <td key={columns[i]?.id ?? i} className={columns[i]?.hideOnPhone ? PHONE_GONE : undefined}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const CHART_YEAR_REM = 3.5;
const CHART_FIGURE_REM = 8;

/**
 * The same numbers as the chart, as a table behind a fold ("הצגה כטבלה"). `scroll="cue"` fades the edges where the table can scroll;
 * `scroll="bleed"` lets it run to the card's edge on a phone. `compact` tightens the cells (a table of five columns). The year's column
 * and every figure's column have a fixed width, wide enough for "1,047,017.40 ₪"; the table scrolls inside its region when they do not fit.
 */
export function ChartTable({ rowHead, columns, rows, scroll = "cue", compact, regionLabel }: { rowHead: ReactNode; columns: TableColumn[]; rows: TableRowData[]; scroll?: "cue" | "bleed"; compact?: boolean; regionLabel?: string }) {
  return (
    <CountingFigures on={false}>
    <Disclosure label={buttons.showTable} openLabel={buttons.hideTable} summaryClassName="text-sm">
      <div className={cx("overflow-x-auto overflow-y-hidden mt-2", scroll === "bleed" && "-mx-4 px-4 md:mx-0 md:px-0")} style={scroll === "cue" ? scrollCueStyle : undefined} {...(regionLabel ? { tabIndex: 0, role: "region", "aria-label": regionLabel } : {})}>
        <table className={cx("tbl text-sm [&_td]:whitespace-nowrap", compact && "[&_td]:px-2 [&_th]:px-2")} style={{ minWidth: `${CHART_YEAR_REM + columns.length * CHART_FIGURE_REM}rem` }}>
          <TableCols widths={[`${CHART_YEAR_REM}rem`, ...columns.map(() => "auto")]} />
          <thead>
            <tr>
              <th scope="col">{rowHead}</th>
              {columns.map((c) => (
                <th key={c.id} scope="col">
                  {c.head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">
                  <bdi dir="ltr">{r.head}</bdi>
                </th>
                {r.cells.map((cell, i) => (
                  <td key={columns[i]?.id ?? i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Disclosure>
    </CountingFigures>
  );
}
