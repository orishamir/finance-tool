// What a house charged on average for a kind of fee, beside its list price (method F-122): one quiet line of the kit's `DotLine`, its figures
// sourced numbers that open the calculator's sheet, the reporting period, and a link to the calculator's page. For reference only: no
// calculation reads it, and its sheet says so.
import { houseAverage as copy } from "../../copy";
import type { ColumnAverage } from "../../lib/house-averages";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { DocLink } from "./doc-link";
import { DotLine } from "./notes";

/** A column's figures: the lowest and, where it differs, "עד" the highest, a custody average with "בשנה". */
export function AverageFigures({ average, house }: { average: ColumnAverage; house: string }) {
  const said = (v: SiteValue): SiteValue => ({ ...v, about: copy.about(house), lead: copy.sheetLead });
  const same = average.lo.value === average.hi.value;
  return (
    <>
      <Num value={said(average.lo)} />
      {!same && (
        <>
          {` ${copy.to} `}
          <Num value={said(average.hi)} />
        </>
      )}
      {average.column.fee === "custody" && ` ${copy.perYear}`}
    </>
  );
}

/** The line: what the house charged on average (one column, or several each by its short name), by portfolio size, the period, the link. */
export function HouseAverageLine({ averages, house, from, to, page, className }: { averages: readonly ColumnAverage[]; house: string; from: string; to: string; page: { url: string; title: string }; className?: string }) {
  if (averages.length === 0) return null;
  const one = averages.length === 1;
  return (
    <DotLine
      className={className}
      items={[
        <span key="figures">
          {copy.lead}{" "}
          {averages.map((a, i) => (
            <span key={`${a.column.fee}-${a.column.securities}`}>
              {i > 0 && ", "}
              {!one && `${copy.columns[`${a.column.fee}_${a.column.securities}`]} `}
              <AverageFigures average={a} house={house} />
            </span>
          ))}
          {averages.some((a) => a.lo.value !== a.hi.value) && `, ${copy.byPortfolio}`}
        </span>,
        copy.period(fmt.date(from), fmt.date(to)),
        <DocLink key="link" look="inline" source={{ url: page.url }}>
          {copy.link}
        </DocLink>,
      ]}
    />
  );
}
