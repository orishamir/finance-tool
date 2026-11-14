// What a house actually charged on average for a kind of fee, beside its list price (method F-122, data-schema §3.9): for reference only, so
// no calculation reads anything here. A price-list line shows the column of the TASE calculator's sheet that matches its kind, as the lowest
// and the highest average over the portfolio bands, with the reporting period and the calculator's page. Pure; the record is read on the
// server (house-averages.server.ts), and only what a page shows leaves it.
import { averageRange } from "@finance-tool/engine";
import type { AveragesRecord, FeeLine } from "@finance-tool/schema";
import type { SiteValue } from "./value";

/** A column of the sheet: a trade in Israeli shares and bonds, in makam or abroad, or custody in Israel or abroad. */
export type AverageColumn = { fee: "trade"; securities: "il_shares_bonds" | "il_makam" | "foreign" } | { fee: "custody"; securities: "il" | "foreign" };

/** One column's averages: the lowest and the highest over the bands that print one, each a figure with its source. */
export interface ColumnAverage {
  column: AverageColumn;
  lo: SiteValue;
  hi: SiteValue;
}

/** A house's averages as a page shows them: the reporting period, the calculator's page, and each column that prints a figure. */
export interface HouseAverages {
  from: string;
  to: string;
  page: { url: string; title: string };
  columns: ColumnAverage[];
}

const TASE_CLASSES = ["tase_shares_bonds", "tase_bonds"];

/**
 * The column of the sheet a price-list line is of, by its base and what it applies to: a trade or custody line on Israeli shares and bonds
 * (custody on any Tel Aviv holding), makam alone, or foreign securities. A standard line only (no plan, `band: null`); a line that names
 * kinds of two columns, or none, has none: the sheet does not say which would be its average.
 */
export function columnOf(line: Pick<FeeLine, "base" | "applies_to" | "band" | "level">): AverageColumn | null {
  if (line.level !== "list" || line.band !== null) return null;
  const has = (c: string) => line.applies_to.includes(c);
  if (line.base === "trade") {
    const cols = [TASE_CLASSES.some(has) && "il_shares_bonds", has("makam") && "il_makam", has("foreign_securities") && "foreign"].filter((x): x is "il_shares_bonds" | "il_makam" | "foreign" => !!x);
    return cols.length === 1 ? { fee: "trade", securities: cols[0]! } : null;
  }
  if (line.base === "custody") {
    const israel = [...TASE_CLASSES, "etf_units", "mutual_fund_units", "tase_foreign_fund_units"].some(has);
    const abroad = has("foreign_securities");
    return israel !== abroad ? { fee: "custody", securities: israel ? "il" : "foreign" } : null;
  }
  return null;
}

const sameColumn = (a: AverageColumn, b: AverageColumn) => a.fee === b.fee && a.securities === b.securities;

/** The column's average among a house's, where its sheet prints one. */
export const averageOf = (h: HouseAverages | null | undefined, column: AverageColumn | null): ColumnAverage | null => (h && column ? (h.columns.find((c) => sameColumn(c.column, column)) ?? null) : null);

/**
 * A house's averages from its record, for the columns `wanted` (every column where not given): the lowest and the highest cell of each
 * column that prints a figure, each with the sheet's own words for what it is and the calculator's page as the place a reader opens. A
 * column whose every cell is empty is left out.
 */
export function houseAverages(rec: AveragesRecord, wanted?: readonly AverageColumn[]): HouseAverages {
  const columns: ColumnAverage[] = [];
  const seen: AverageColumn[] = [];
  for (const row of rec.averages.rows) {
    const column = { fee: row.fee, securities: row.securities } as AverageColumn;
    if (seen.some((c) => sameColumn(c, column)) || (wanted && !wanted.some((c) => sameColumn(c, column)))) continue;
    seen.push(column);
    const cells = rec.averages.rows.filter((r) => r.fee === row.fee && r.securities === row.securities);
    // F-122: the column's lowest and highest average over the bands that print one
    const range = averageRange(cells.map((r) => (typeof r.rate.value === "number" ? r.rate.value : null)));
    if (!range) continue;
    // each figure keeps its own cell's words (the band in its title), and opens the calculator's page
    const figure = (v: number): SiteValue => {
      const cell = cells.find((r) => r.rate.value === v)!;
      return { ...cell.rate, source: { ...cell.rate.source, url: rec.page.url } };
    };
    columns.push({ column, lo: figure(range.lo), hi: figure(range.hi) });
  }
  return { from: rec.averages.period.from, to: rec.averages.period.to, page: { url: rec.page.url, title: rec.page.title }, columns };
}
