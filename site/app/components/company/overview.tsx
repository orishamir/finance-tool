// A company page's overview (components/company/template.tsx), its "סקירה": "מה יש ב…", then the products, the designer's way (mocks of
// 2026-11-10). A bank's few products are rows between hairlines (kit OpenRow): the name, how many, one headline fact under its label, its
// date and an arrow. A manager's are one table in a card (`OverviewTable`): the product, how many, its managed money with a thin bar under
// it against the company's largest product, its fee range and an arrow, under the list's groups, with a note under the table. What the site
// has not collected follows as quiet lines, then whatever the page adds after it (the documents about none of its products, the names not
// yet matched).
import type { ReactNode } from "react";
import { Link } from "react-router";
import { companyPage as w } from "../../copy";
import { MeterBar, OpenRow, ProductPhoneRow, ProductTable, RowArrow, RowList, Section, TextLink, type ProductColumn, type ProductGroup } from "../kit";

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
  /** Managed money, and its size against the company's largest product (0 to 1), for the bar under it; null shows "—". */
  assets?: { figure: ReactNode; frac: number | null } | null;
  /** The fees: a range of figures, or words ("לפי הדוח של כל קרן"). */
  fees: ReactNode;
  to: string;
}

const cols = w.overviewTable.cols;

function Assets({ a }: { a: OverviewTableRow["assets"] }) {
  if (!a) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex flex-col items-start w-full">
      <span className="whitespace-nowrap">{a.figure}</span>
      {/* the site's own reckoning against the largest product, in the computed ink */}
      {a.frac !== null && <MeterBar share={a.frac} tone="computed" className="mt-1.5 max-w-48" />}
    </span>
  );
}

/** A manager's products as one table: under the list's groups when it has them, each row's name and arrow opening the product. */
export function OverviewTable({ groups, note }: { groups: { key: string; label?: string; rows: OverviewTableRow[] }[]; /** Under the table: what the fees and the bar are. */ note?: ReactNode }) {
  const columns: ProductColumn[] = [
    { id: "name", head: cols.product },
    { id: "count", head: cols.count, width: 7.5 },
    { id: "assets", head: cols.assets, width: 12 },
    { id: "fees", head: cols.fees, width: 12, wrap: true },
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
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
