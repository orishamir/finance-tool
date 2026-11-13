// A company page's overview (components/company/template.tsx), its "סקירה": "מה יש ב…", then the products, the designer's way (mocks of
// 2026-11-10). A bank's few products are rows between hairlines (kit OpenRow): the name, how many, one headline fact under its label, its
// date and an arrow. A manager's are one table in a card (`OverviewTable`): the product, how many, its managed money, its fee range and an
// arrow, under the list's groups; what the fee range is and the date of the money stand in the heads (a muted line under each), and in a
// note under the table on a phone, which has no heads. What the site has not collected follows as quiet lines, then whatever the page adds after it (the documents about
// none of its products, the names not yet matched).
import type { ReactNode } from "react";
import { Link } from "react-router";
import { companyPage as w } from "../../copy";
import { OpenRow, ProductPhoneRow, ProductTable, RowArrow, RowList, Section, SortNote, TextLink, type ProductColumn, type ProductGroup } from "../kit";

export interface OverviewRow {
  id: string;
  title: string;
  end?: ReactNode;
  fact?: { label: ReactNode; value: ReactNode; words?: boolean };
  date?: ReactNode;
  to: string;
  /** The row's spoken name. */
  label: string;
}

export function Overview({ heading, rows, table, quiet, children }: { heading: string; rows?: OverviewRow[]; /** In place of rows: the manager's table. */ table?: ReactNode; /** A line each for what the site has not collected. */ quiet?: ReactNode[]; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-section">
      <Section title={heading}>
        {rows && rows.length > 0 && (
          <RowList plain>
            {rows.map((r) => (
              <OpenRow key={r.id} title={r.title} end={r.end} fact={r.fact} date={r.date} to={r.to} label={r.label} />
            ))}
          </RowList>
        )}
        {table}
        {quiet?.map((q, i) => (
          <p key={i} className="text-sm text-muted-foreground max-w-measure">
            {q}
          </p>
        ))}
      </Section>
      {children}
    </div>
  );
}

export interface OverviewTableRow {
  id: string;
  title: string;
  /** How many ("17 מסלולים", "7 קרנות"). */
  count?: ReactNode;
  /** Managed money; null shows "—". */
  assets?: ReactNode | null;
  /** The fees: a range of figures, or words ("לפי הדוח של כל קרן"). */
  fees: ReactNode;
  to: string;
}

const cols = w.overviewTable.cols;
/** The money column: as wide as its longest figure ("151.85 מיליארד ₪") and its head with the date under it. */
const ASSETS_REM = 10;

function Assets({ a }: { a: OverviewTableRow["assets"] }) {
  if (!a) return <span className="text-muted-foreground">—</span>;
  return <span className="whitespace-nowrap">{a}</span>;
}

/** What the tracks' figures in the table are, said in its heads: the fee range's words under the fee head, the money's date under its head. */
export interface OverviewHeads {
  fees: string;
  assets: string;
}

/** A manager's products as one table: under the list's groups when it has them, each row's name and arrow opening the product. */
export function OverviewTable({ groups, heads, note }: { groups: { key: string; label?: string; rows: OverviewTableRow[] }[]; /** Where the table holds tracks: what their figures are, in the heads. */ heads?: OverviewHeads; /** Under the table on a phone, whose rows have no heads: what the heads say. */ note?: ReactNode }) {
  const columns: ProductColumn[] = [
    { id: "name", head: cols.product },
    { id: "count", head: cols.count, width: 7.5 },
    {
      id: "assets",
      head: heads ? <SortNote label={cols.assets} note={heads.assets} /> : cols.assets,
      width: ASSETS_REM,
    },
    // as wide as the weak line under its head ("במסלולים: מהחיסכון, מהזול ליקר"), which never wraps; a price list's words wrap under it
    { id: "fees", head: heads ? <SortNote label={cols.fees} note={heads.fees} /> : cols.fees, width: 12.75, wrap: true },
    { id: "go", head: <span className="sr-only">{cols.go}</span>, width: 3, tight: true },
  ];
  const name = (r: OverviewTableRow) => (
    <TextLink tone="plain" to={r.to} preventScrollReset className="font-semibold">
      {r.title}
    </TextLink>
  );
  const tableGroups: ProductGroup[] = groups.map((g) => ({
    key: g.key,
    ...(g.label ? { heading: { title: g.label } } : {}),
    rows: g.rows.map((r) => ({
      key: r.id,
      cells: [
        name(r),
        r.count ?? null,
        <Assets a={r.assets} />,
        <span className="text-sm">{r.fees}</span>,
        <Link to={r.to} preventScrollReset tabIndex={-1} aria-hidden="true" className="inline-flex items-center justify-center min-h-target min-w-target">
          <RowArrow />
        </Link>,
      ],
      phone: (
        <ProductPhoneRow stacked>
          <span className="flex items-baseline justify-between gap-3">
            {name(r)}
            {r.count && <span className="text-sm text-muted-foreground">{r.count}</span>}
          </span>
          <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
            {r.assets && <span className="min-w-36">{<Assets a={r.assets} />}</span>}
            <span>{r.fees}</span>
          </span>
        </ProductPhoneRow>
      ),
    })),
  }));
  return (
    <div className="flex flex-col gap-2">
      <ProductTable columns={columns} groups={tableGroups} />
      {note && <p className="md:hidden text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
