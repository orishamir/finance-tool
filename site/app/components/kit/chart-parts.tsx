// The three parts that sit around every chart: the legend, the readout of the hovered year, and the table view.
import type { CSSProperties, ReactNode } from "react";
import { buttons, kit as kitCopy } from "../../copy";
import { cx } from "./cx";
import { Disclosure } from "./disclosure";

/** A sideways-scrolling table wrapper's cue without script: a card-colour fade at each end that is still hidden content, and a soft edge shadow. */
export const scrollCueStyle: CSSProperties = {
  background:
    "linear-gradient(to right, var(--card) 30%, transparent) left center / 32px 100% no-repeat local, linear-gradient(to left, var(--card) 30%, transparent) right center / 32px 100% no-repeat local, radial-gradient(farthest-side at 0 50%, rgb(255 255 255 / 0.22), transparent) left center / 14px 100% no-repeat scroll, radial-gradient(farthest-side at 100% 50%, rgb(255 255 255 / 0.22), transparent) right center / 14px 100% no-repeat scroll",
};

export type SwatchShape = "line" | "box" | "entered-line" | "rule";

/** The little mark of a series: `line` (14 by 3 px) for a line, `box` (10 px) for a band, `entered-line` (dashed, a stroke class) for a series that rests on an entered return, `rule` (dashed border) for a reference. `className` carries the colour role. */
export function Swatch({ shape = "line", className }: { shape?: SwatchShape; className?: string }) {
  if (shape === "box") return <span className={cx("size-2.5 rounded-sm", className)} />;
  if (shape === "rule") return <span className={cx("w-3.5 border-t-2 border-dashed", className)} />;
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
}

/** What each colour or line on a chart means: one item per series, under the chart's title. Colour never works alone, so every item has its name. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label={kitCopy.legend}>
      {items.map((it) => (
        <li key={it.id} className={it.swatch ? "flex items-center gap-1.5" : undefined}>
          {it.swatch}
          {it.label}
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
 * The same numbers as the chart, as a table behind a fold ("הצגה כטבלה"). `scroll="cue"` fades the edges where the table can scroll;
 * `scroll="bleed"` lets it run to the card's edge on a phone. `compact` tightens the cells (a table of five columns).
 */
export function ChartTable({ rowHead, columns, rows, scroll = "cue", compact, regionLabel }: { rowHead: ReactNode; columns: TableColumn[]; rows: TableRowData[]; scroll?: "cue" | "bleed"; compact?: boolean; regionLabel?: string }) {
  return (
    <Disclosure label={buttons.showTable} openLabel={buttons.hideTable} summaryClassName="text-sm">
      <div className={cx("overflow-x-auto overflow-y-hidden mt-2", scroll === "bleed" && "-mx-4 px-4 md:mx-0 md:px-0")} style={scroll === "cue" ? scrollCueStyle : undefined} {...(regionLabel ? { tabIndex: 0, role: "region", "aria-label": regionLabel } : {})}>
        <table className={cx("tbl text-sm", compact && "[&_td]:px-2 [&_th]:px-2 [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap")}>
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
  );
}
