// What a house charged on average for a kind of fee, beside its list price (method F-122): one quiet line of the kit's `DotLine`, its figures
// sourced numbers that open the calculator's sheet, the reporting period, and a link to the calculator's page. For reference only: no
// calculation reads it, and its sheet says so.
import { houseAverage as copy } from "../../copy";
import type { ColumnAverage } from "../../lib/house-averages";
import { fmt } from "../../lib/format";
import { sourceHref } from "../../lib/sources";
import type { SiteValue } from "../../lib/value";
import { Num, Term, type SheetPart } from "../provenance";
import { DotLine } from "./notes";

/** A column's figures: the lowest and, where it differs, "עד" the highest, a custody average with "בשנה"; a figure above zero never reads 0%. */
function AverageFigures({ average, house }: { average: ColumnAverage; house: string }) {
  const said = (v: SiteValue): SiteValue => ({ ...v, about: copy.about(house), lead: copy.sheetLead });
  const same = average.lo.value === average.hi.value;
  return (
    <>
      <Num value={said(average.lo)} display={fmt.pctNonZero} />
      {!same && (
        <>
          {` ${copy.to} `}
          <Num value={said(average.hi)} display={fmt.pctNonZero} />
        </>
      )}
      {average.column.fee === "custody" && ` ${copy.perYear}`}
    </>
  );
}

/**
 * The line: what the house charged on average (one column, or several each by its short name), by portfolio size. The period and the calculator's page are in the figures' sheet.
 * `customers`: it starts with the house's customers ("לקוחות פסגות שילמו בממוצע"), where the line stands under a fee of a deal, away from
 * the house's own name.
 */
export function HouseAverageLine({ averages, house, customers, className }: { averages: readonly ColumnAverage[]; house: string; customers?: boolean; className?: string }) {
  if (averages.length === 0) return null;
  const one = averages.length === 1;
  return (
    <DotLine
      className={className}
      items={[
        <span key="figures">
          {customers ? copy.paidBy(house) : copy.lead}{" "}
          {averages.map((a, i) => (
            <span key={`${a.column.fee}-${a.column.securities}`}>
              {i > 0 && ", "}
              {!one && `${copy.columns[`${a.column.fee}_${a.column.securities}`]} `}
              <AverageFigures average={a} house={house} />
            </span>
          ))}
          {averages.some((a) => a.lo.value !== a.hi.value) && `, ${copy.byPortfolio}`}
        </span>,
      ]}
    />
  );
}

/**
 * The words that open a house's averages in a sheet ("מה נגבה בפועל בממוצע", on /deal's line of what the price leaves out): each column by
 * its short name with its lowest and highest figure, then the period and the calculator's page. For reference only, as the sheet's lead says.
 */
export function HouseAverageTerm({ averages, house, from, to, page }: { averages: readonly ColumnAverage[]; house: string; from: string; to: string; page: { url: string } }) {
  if (averages.length === 0) return null;
  const figures = (a: ColumnAverage) =>
    [fmt.pctNonZero(a.lo.value as number), ...(a.lo.value === a.hi.value ? [] : [copy.to, fmt.pctNonZero(a.hi.value as number)]), ...(a.column.fee === "custody" ? [copy.perYear] : [])].join(" ");
  const parts: SheetPart[] = [
    ...averages.map((a) => ({ head: copy.columns[`${a.column.fee}_${a.column.securities}`]!, text: figures(a) })),
    { text: copy.periodLine(fmt.date(from), fmt.date(to)), doc: { href: sourceHref({ url: page.url }), title: copy.linkTitle } },
  ];
  return (
    <Term id={[]} name={copy.about(house)} lead={copy.sheetLead} parts={parts}>
      {copy.tap}
    </Term>
  );
}
