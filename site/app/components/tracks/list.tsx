// The track browser's list (D54, 2026-11-03): one table on a computer, one row per track on a phone, built on the kit's ProductTable.
// Under a company's heading the row says the short name and, when the name leaves it out, the kind; under a kind's heading it says
// the company first. The column heads sort. Every figure goes through the provenance component.
import { useMemo } from "react";
import { Link } from "react-router";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { assetsText, missingYield, showsKindChip, showsShortName, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState as Sort, type TbGroup, type TbTrack, ascending } from "../../lib/track-browser";
import type { SiteValue } from "../../lib/value";
import { IconDrillIn } from "../icons";
import { Num } from "../provenance";
import { ExposureCell, FeeKey, ProductFigures, ProductPhoneRow, ProductTable, SortHead, Tag, TrackFeeLines, TrackLabels, cx, type ProductColumn, type ProductGroup } from "../kit";

const mutedWord = "text-sm text-muted-foreground";

/** A figure of the regulator's that may be empty: its number, or its words ("לא דווח", "פחות מ־3 שנים") on the same button, so the sheet says why. */
function YieldFigure({ value, track, years, size }: { value: SiteValue | null; track: TbTrack; years: 3 | 5; size: "inline" | "cell" }) {
  if (!value) return <span className={mutedWord}>{missingYield(track, years)}</span>;
  if (value.value === null) return <Num value={value} size={size} display={missingYield(track, years)} />;
  return <Num value={value} size={size} />;
}

/** The two yields, each followed by its window; an empty one is its words alone. */
function Yields({ x, size, inline }: { x: TbTrack; size: "inline" | "cell"; inline?: boolean }) {
  const items = ([3, 5] as const).map((years) => {
    const v = years === 3 ? x.y3 : x.y5;
    const empty = !v || v.value === null;
    return { id: `y${years}`, figure: <YieldFigure value={v} track={x} years={years} size={size} />, word: empty ? null : years === 3 ? t.yield.years3 : t.yield.years5 };
  });
  return <ProductFigures items={items} inline={inline} />;
}

/** Assets at the period's end: "19.1 מיליארד ₪" for a thousand million and more. */
function AssetsFigure({ value, size = "cell" }: { value: SiteValue | null; size?: "inline" | "cell" }) {
  if (!value) return <span className={mutedWord}>{t.assets.missing}</span>;
  return <Num value={value} size={size} display={typeof value.value === "number" ? assetsText(value.value) : t.assets.missing} />;
}

function FeeRange({ fees }: { fees: TbGroup["fees"] }) {
  if (!fees) return <span>{t.group.noFee}</span>;
  return (
    <span>
      {t.group.feeLead} <Num value={fees.low} size="inline" prefix={t.group.feeFrom} /> {t.group.feeTo} <Num value={fees.high} size="inline" />
    </span>
  );
}

/** A group's line under its title: by company "16 מסלולים · נכסים 19.1 מיליארד ₪ · דמי ניהול…"; by kind the regulator's kind, the count and the fee range. */
function GroupLine({ g }: { g: TbGroup }) {
  const filtered = g.tracks.length < g.total;
  const count = `${tracksPhrase(g.tracks.length)}${filtered ? ` ${t.count.outOf} ${fmt.number(g.total)}` : ""}`;
  return (
    <>
      {g.by === "kind" && g.regulatorKind && <span>{g.regulatorKind} · </span>}
      <span>{count}</span>
      {g.by === "company" && g.assets && (
        <>
          {" · "}
          {t.group.assets} <AssetsFigure value={g.assets} size="inline" />
        </>
      )}
      {" · "}
      <FeeRange fees={g.fees} />
    </>
  );
}

function NameCell({ x, by, view }: { x: TbTrack; by: GroupBy; view: ProductView }) {
  if (by === "company") {
    return (
      <span className="flex flex-col items-start gap-1.5">
        <Link to={x.href} className="font-medium hover:underline">
          <bdi>{x.short}</bdi>
        </Link>
        <span className="flex flex-wrap gap-1.5 empty:hidden">
          <TrackLabels track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
          {showsKindChip(x) && <Tag>{x.sub}</Tag>}
        </span>
      </span>
    );
  }
  const company = view.companies.find((c) => c.index === x.company);
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <Link to={`/companies/${company?.id ?? ""}`} className="font-semibold hover:underline">
          <bdi>{x.companyName}</bdi>
        </Link>
        {company && (
          <span className={mutedWord}>
            {tracksPhrase(company.tracks.length)} · <AssetsFigure value={company.assets} size="inline" /> {t.group.inProduct}
            {view.name}
          </span>
        )}
      </span>
      {showsShortName(x) && (
        <Link to={x.href} className="hover:underline">
          <bdi>{x.short}</bdi>
        </Link>
      )}
      <span className="flex flex-wrap gap-1.5 empty:hidden">
        <TrackLabels track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
      </span>
    </span>
  );
}

function PhoneRow({ x, by, view }: { x: TbTrack; by: GroupBy; view: ProductView }) {
  const company = view.companies.find((c) => c.index === x.company);
  return (
    <ProductPhoneRow stacked>
      <Link to={x.href} className="flex items-center justify-between gap-3 min-w-0">
        <span className="flex flex-col gap-1 min-w-0 items-start">
          {by === "company" ? (
            <span className="font-medium">
              <bdi>{x.short}</bdi>
            </span>
          ) : (
            <>
              <span className="font-semibold">
                <bdi>{x.companyName}</bdi>
              </span>
              {showsShortName(x) && (
                <span>
                  <bdi>{x.short}</bdi>
                </span>
              )}
            </>
          )}
          <span className="flex flex-wrap gap-1.5 empty:hidden">
            <TrackLabels track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
            {by === "company" && showsKindChip(x) && <Tag>{x.sub}</Tag>}
          </span>
        </span>
        <IconDrillIn className="text-muted-foreground shrink-0" />
      </Link>
      {by === "kind" && company && (
        <span className={mutedWord}>
          {tracksPhrase(company.tracks.length)} · <AssetsFigure value={company.assets} size="inline" /> {t.group.inProduct}
          {view.name}
        </span>
      )}
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <TrackFeeLines fee={x.fee} deposit={x.deposit} inline />
        <span className={mutedWord}>
          {t.columns.fund} <bdi dir="ltr" className="num-id">{x.id}</bdi>
        </span>
      </span>
      {x.exposure ? <ExposureCell value={x.exposure} /> : <span className={mutedWord}>{t.assets.missing}</span>}
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Yields x={x} size="inline" inline />
      </span>
      <span className="flex items-center gap-1.5">
        <span className={mutedWord}>{t.assets.phone}</span>
        <AssetsFigure value={x.assets} size="inline" />
      </span>
    </ProductPhoneRow>
  );
}

/** `limit`: how many rows are drawn, from the top; the headings, the counts and the key under the list always speak of every row of the group. */
export function TrackList({ view, groups, by, sort, onSort, feeYear, period, limit = Infinity }: { view: ProductView; groups: TbGroup[]; by: GroupBy; sort: Sort; onSort: (id: SortId) => void; feeYear: string | null; period: string; limit?: number }) {
  const state = (...ids: SortId[]) => (ids.includes(sort.id) ? (ascending(sort) ? ("ascending" as const) : ("descending" as const)) : ("none" as const));
  const head = (id: SortId, label: string) => <SortHead label={label} state={state(id)} onPress={() => onSort(id)} />;
  const periodText = fmt.period(period);
  const columns: ProductColumn[] = [
    { id: "name", head: head("name", by === "company" ? t.columns.track : t.columns.company), sort: state("name") },
    { id: "fund", head: t.columns.fund, width: 5.5 },
    {
      id: "fee",
      head: (
        <span className="flex flex-col">
          <span>{feeYear ? t.columns.fee.replace("{year}", feeYear) : t.columns.feeNoYear}</span>
          <span className="flex flex-wrap gap-x-3">
            {head("fee", t.columns.feeSavings)}
            {head("dep", t.columns.feeDeposits)}
          </span>
        </span>
      ),
      width: 14,
      sort: state("fee", "dep"),
    },
    { id: "exposure", head: head("stock", t.columns.exposure.replace("{period}", periodText)), width: 13.5, sort: state("stock") },
    { id: "yield", head: t.columns.yield, width: 11 },
    { id: "assets", head: head("assets", t.columns.assets.replace("{period}", periodText)), width: 10, sort: state("assets") },
    { id: "open", head: <span className="sr-only">{t.columns.open}</span>, width: 4.5 },
  ];
  // A row's cells do not depend on the order or the filter, so they are built once per product and grouping: a sort or a search then
  // moves finished rows, and React draws none of them again (what keeps a click under 100 ms with 180 rows).
  const parts = useMemo(
    () =>
      new Map(
        view.tracks.map((x) => [
          x.id,
          {
            phone: <PhoneRow x={x} by={by} view={view} />,
            cells: [
              <NameCell x={x} by={by} view={view} />,
              <bdi dir="ltr" className="num-id">{x.id}</bdi>,
              <TrackFeeLines fee={x.fee} deposit={x.deposit} size="cell" />,
              x.exposure ? <ExposureCell value={x.exposure} size="cell" /> : <span className={mutedWord}>{t.assets.missing}</span>,
              <span className="flex flex-col gap-1">
                <Yields x={x} size="cell" />
              </span>,
              <AssetsFigure value={x.assets} />,
              <Link to={x.href} aria-label={x.fullName} className="inline-flex size-target items-center justify-center -my-2">
                <IconDrillIn className="text-muted-foreground" />
              </Link>,
            ],
          },
        ]),
      ),
    [view, by],
  );
  const fees = groups.flatMap((g) => g.tracks.flatMap((x) => [x.fee, x.deposit]));
  let left = limit;
  const tableGroups: ProductGroup[] = [];
  for (const g of groups) {
    if (left <= 0) break;
    const drawn = g.tracks.slice(0, left);
    left -= drawn.length;
    tableGroups.push({
      key: g.key,
      heading: {
        title: g.by === "company" && g.companyId ? (
          <Link to={`/companies/${g.companyId}`} className="hover:underline">
            <bdi>{g.title}</bdi>
          </Link>
        ) : (
          <bdi>{g.title}</bdi>
        ),
        line: <GroupLine g={g} />,
      },
      rows: drawn.map((x) => ({ key: String(x.id), ...parts.get(x.id)! })),
    });
  }
  return (
    <ProductTable
      stickyHead
      columns={columns}
      groups={tableGroups}
      foot={(place) => <FeeKey values={fees} className={cx("flex flex-col gap-1 py-2 text-xs text-muted-foreground border-t border-border", place === "phone" ? "px-4" : "px-3")} />}
    />
  );
}
