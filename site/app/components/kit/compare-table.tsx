// A table of a few options with a small graph inside its cells (2026-10-26, the daily money-market guide): labelled columns say what is
// compared, a bar in a cell lets the eye compare before reading. On a phone each row's name takes its own line and the cells sit under it.
import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";

export interface CompareRow {
  key: string;
  /** The row's name, in the first column (a link to the option's page, a tag). */
  head: ReactNode;
  /** The option the page is about: a tinted row. */
  highlight?: boolean;
  cells: ReactNode[];
}

/** `columns` holds the name column's heading first, then one per cell. Up to five rows and three or four columns. */
export function CompareTable({ columns, rows, caption }: { columns: ReactNode[]; rows: CompareRow[]; caption?: string }) {
  const n = { "--cells": columns.length - 1 } as CSSProperties;
  const phoneGrid = "max-sm:grid max-sm:grid-cols-[repeat(var(--cells),minmax(0,1fr))] max-sm:gap-x-3";
  return (
    <table className="w-full border-collapse" style={n}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className={cx(phoneGrid, "border-b border-chart-axis")}>
          <th scope="col" className="max-sm:hidden text-start align-bottom text-sm font-semibold text-muted-foreground px-2 py-1.5">{columns[0]}</th>
          {columns.slice(1).map((c, i) => (
            <th key={i} scope="col" className="text-start align-bottom text-sm font-semibold text-muted-foreground px-2 py-1.5">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className={cx(phoneGrid, "border-b border-border last:border-b-0", r.highlight && "bg-primary/10")}>
            <th scope="row" className="max-sm:col-span-full text-start align-middle font-semibold px-2 py-3 max-sm:pb-1">{r.head}</th>
            {r.cells.map((c, i) => (
              <td key={i} className="align-middle px-2 py-3 max-sm:pt-1">{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A figure with a bar under it, for a `CompareTable` cell. `frac` is the bar's length as a share of the column's scale (the same scale in
 * every row; the figure itself says the value), `lo` the solid part when the figure is a range (the rest, up to `frac`, is striped).
 * A zero is a thin mark at the start, so it reads as zero, not as a missing bar.
 */
export function ValueBar({ value, frac, lo, note }: { value: ReactNode; frac: number; lo?: number; note?: ReactNode }) {
  const w = (f: number) => `${Math.max(0, Math.min(1, f)) * 100}%`;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-lg font-bold whitespace-nowrap">{value}</span>
      <div className="relative h-3" aria-hidden="true">
        {frac <= 0 ? (
          <div className="absolute inset-y-0 start-0 w-0.5 rounded-sm bg-chart-value" />
        ) : (
          <>
            {lo !== undefined && <div className="absolute inset-y-0 start-0 rounded-sm hatch-value" style={{ width: w(frac) }} />}
            <div className="absolute inset-y-0 start-0 rounded-sm bg-chart-value" style={{ width: w(lo ?? frac) }} />
          </>
        )}
      </div>
      {note && <span className="text-sm text-muted-foreground">{note}</span>}
    </div>
  );
}
