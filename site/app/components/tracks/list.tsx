// The track browser's list (D54): one table on a computer, one row per track on a phone, built on the kit's ProductTable.
// Under a company's heading the row says the short name and, when the name leaves it out, the kind; in the one list of a chosen kind
// (no heading) it says the company first. The column heads sort. Every figure goes through the provenance component. On a company's page
// the groups are its products (`fixed`: one product, no heading over it), and a track a new member joins by default says so.
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { track as trackCopy, trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, assetsText, missingYield, showsKindChip, showsShortName, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState as Sort, type TbGroup, type TbTrack, ascending } from "../../lib/track-browser";
import type { SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { ExposureCell, gershayim, HelpMark, ProductFigures, ProductPhoneRow, ProductTable, RowArrow, SortHead, Tag, TrackFeeLines, TrackFundId, TrackLabels, cx, type ProductColumn, type ProductGroup } from "../kit";

const mutedWord = "text-sm text-muted-foreground";
/** An empty figure's sheet says in a sentence what is missing, where the data's note is only the bare word; a note with a reason stays. */
const sayEmpty = (value: SiteValue, sentence: string): SiteValue => (!value.notes || value.notes.trim() === `${t.yield.missing}.` ? { ...value, notes: sentence } : value);

/** A figure of the regulator's that may be empty: its number, or its words ("לא דווח", "אין") on the same button, so the sheet says why. */
function YieldFigure({ value, track, years, size }: { value: SiteValue | null; track: TbTrack; years: 3 | 5; size: "inline" | "cell" }) {
  if (!value) return <span className={mutedWord}>{missingYield(track, years)}</span>;
  // not reported: a short mark, the sheet heads with the words; a young track's "אין" is short already
  if (value.value === null) return (years === 3 ? track.young3 : track.young5) ? <Num value={value} size={size} display={missingYield(track, years)} /> : <Num value={sayEmpty(value, `${t.yield.emptyNote.before}${years}${t.yield.emptyNote.after}`)} size={size} display={trackCopy.emptyMark} fullWord={missingYield(track, years)} />;
  return <Num value={value} size={size} />;
}

/** The two yields, each followed by its window; a track younger than the window reads "אין 3 שנים", one not reported its words alone. */
function Yields({ x, size, inline }: { x: TbTrack; size: "inline" | "cell"; inline?: boolean }) {
  if (x.selfManaged) return <span className={cx(mutedWord, "block whitespace-normal")}>{t.yield.selfManaged}</span>;
  const items = ([3, 5] as const).map((years) => {
    const v = years === 3 ? x.y3 : x.y5;
    const young = years === 3 ? x.young3 : x.young5;
    const empty = (!v || v.value === null) && !young;
    return { id: `y${years}`, figure: <YieldFigure value={v} track={x} years={years} size={size} />, word: empty ? null : years === 3 ? t.yield.years3 : t.yield.years5 };
  });
  return <ProductFigures items={items} inline={inline} />;
}

/** Assets at the period's end: "19.1 מיליארד ₪" for a thousand million and more. */
function AssetsFigure({ value, size = "cell" }: { value: SiteValue | null; size?: "inline" | "cell" }) {
  if (!value) return <span className={mutedWord}>{t.assets.missing}</span>;
  return typeof value.value === "number" ? <Num value={value} size={size} display={assetsText(value.value)} /> : <Num value={sayEmpty(value, t.assets.emptyNote)} size={size} display={trackCopy.emptyMark} fullWord={t.assets.missing} />;
}

/** "16 מסלולים · כסף מנוהל 19.1 מיליארד ₪": the company's size in the product, each part unbroken. `stacked`: one part under the other, in a
 *  table cell too narrow to hold both on every row (so no row has one line where its neighbour has two). */
function CompanySize({ count, assets, stacked }: { count: string; assets: SiteValue | null; stacked?: boolean }) {
  const money = assets && (
    <span className="whitespace-nowrap">
      {t.group.assets} <AssetsFigure value={assets} size="inline" />
    </span>
  );
  if (stacked) {
    return (
      <span className="flex flex-col">
        <span className="whitespace-nowrap">{count}</span>
        {money}
      </span>
    );
  }
  return (
    <>
      <span className="whitespace-nowrap">{count}</span>
      {money && (
        <>
          {" · "}
          {money}
        </>
      )}
    </>
  );
}

/** A company's line under its name: "16 מסלולים · כסף מנוהל 19.1 מיליארד ₪ · דמי ניהול…"; a narrow screen breaks it at the dots. */
function GroupLine({ g }: { g: TbGroup }) {
  const filtered = g.tracks.length < g.total;
  const count = `${tracksPhrase(g.tracks.length)}${filtered ? ` ${t.count.outOf} ${fmt.number(g.total)}` : ""}`;
  return (
    <>
      {/* no fee range: the rows show each track's fees */}
      <CompanySize count={count} assets={g.assets} />
    </>
  );
}

/** How a row under a company's heading reads on a company's page: `isDefault`, the track a new member joins. */
interface RowNotes {
  isDefault?: boolean;
}

function NameCell({ x, by, view, notes }: { x: TbTrack; by: GroupBy; view: ProductView; notes: RowNotes }) {
  if (by === "company") {
    return (
      <span className="flex flex-col items-start gap-1.5">
        <Link to={x.href} className="font-medium hover:underline">
          <bdi>{x.short}</bdi>
        </Link>
        <span className="flex flex-wrap gap-1.5 empty:hidden">
          <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
          {showsKindChip(x) && <Tag>{x.sub}</Tag>}
        </span>
      </span>
    );
  }
  const company = view.companies.find((c) => c.index === x.company);
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="flex flex-col items-start gap-0.5">
        <Link to={`/companies/${company?.id ?? ""}`} className="font-semibold hover:underline">
          <bdi>{gershayim(x.companyName)}</bdi>
        </Link>
        {company && (
          <span className={mutedWord}>
            <CompanySize count={tracksPhrase(company.tracks.length)} assets={company.assets} stacked />
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

function PhoneRow({ x, by, view, notes }: { x: TbTrack; by: GroupBy; view: ProductView; notes: RowNotes }) {
  const company = view.companies.find((c) => c.index === x.company);
  return (
    <ProductPhoneRow stacked>
      <Link to={x.href} className="flex items-center justify-between gap-3 min-w-0 min-h-11">
        <span className="flex flex-col gap-1 min-w-0 items-start">
          {by === "company" ? (
            <span className="font-medium">
              <bdi>{x.short}</bdi>
            </span>
          ) : (
            <>
              <span className="font-semibold">
                <bdi>{gershayim(x.companyName)}</bdi>
              </span>
              {showsShortName(x) && (
                <span>
                  <bdi>{x.short}</bdi>
                </span>
              )}
            </>
          )}
          <span className="flex flex-wrap gap-1.5 empty:hidden">
            <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
            {by === "company" && showsKindChip(x) && <Tag>{x.sub}</Tag>}
          </span>
        </span>
        <RowArrow />
      </Link>
      {by === "kind" && company && (
        <span className={mutedWord}>
          <CompanySize count={tracksPhrase(company.tracks.length)} assets={company.assets} />
        </span>
      )}
      <TrackFeeLines fee={x.fee} deposit={x.deposit} inline />
      {/* the exposure and the two yields are two short lines each: side by side, as their columns stand on a computer */}
      <span className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        {x.exposure ? <ExposureCell value={x.exposure} /> : <span className={mutedWord}>{t.assets.missing}</span>}
        <span className="flex flex-col gap-0.5 min-w-0">
          {!x.selfManaged && <span className={mutedWord}>{t.yield.phone}</span>}
          <Yields x={x} size="inline" />
        </span>
      </span>
      {/* the fund's number closes every row at the same place, whatever the lines above it hold */}
      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5">
          <span className={mutedWord}>{t.assets.phone}</span>
          <AssetsFigure value={x.assets} size="inline" />
        </span>
        <span className={mutedWord}>
          {t.columns.fund} <TrackFundId fundId={x.id} dataset={x.dataset} />
        </span>
      </span>
    </ProductPhoneRow>
  );
}

/** `limit`: how many rows are drawn, from the top; the headings, the counts and the key under the list always speak of every row of the group.
 *  On a company's page: `fixed`, its one product, with no heading; `defaults`, its tracks a new member joins; `foot`, lines under the key. */
export function TrackList({ view, groups, by, sort, sortable, onSort, feeYear, period, limit = Infinity, fixed, defaults, foot }: { view: ProductView; groups: TbGroup[]; by: GroupBy; sort: Sort; /** The columns whose head sorts here (lib/track-browser sortableIn); the others are plain words. */ sortable: ReadonlySet<SortId>; onSort: (id: SortId) => void; feeYear: string | null; period: string; limit?: number; fixed?: boolean; defaults?: readonly number[]; foot?: ReactNode }) {
  const state = (...ids: SortId[]) => (ids.includes(sort.id) ? (ascending(sort) ? ("ascending" as const) : ("descending" as const)) : ("none" as const));
  const head = (id: SortId, label: string, alsoHolds?: string[]) =>
    sortable.has(id) ? <SortHead label={label} state={state(id)} onPress={() => onSort(id)} alsoHolds={alsoHolds} /> : <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>;
  const periodText = fmt.period(period);
  const columns: ProductColumn[] = [
    { id: "name", head: head("name", by === "company" ? t.columns.track : t.columns.company, [t.columns.track, t.columns.company]), sort: state("name") },
    { id: "fund", head: t.columns.fund, width: 5.5 },
    {
      id: "fee",
      head: (
        <span className="flex flex-col">
          <span className="inline-flex items-center gap-1">
            {feeYear ? t.columns.fee.replace("{year}", feeYear) : t.columns.feeNoYear}
            <HelpMark term={HELP_TERMS.fee} about={t.help.fee} />
          </span>
          <span className="flex flex-wrap gap-x-3">
            {head("fee", t.columns.feeSavings)}
            {head("dep", t.columns.feeDeposits)}
          </span>
        </span>
      ),
      width: 14,
      sort: state("fee", "dep"),
    },
    {
      id: "exposure",
      head: (
        <span className="inline-flex items-start gap-1">
          {head("stock", t.columns.exposure.replace("{period}", periodText))}
          <HelpMark term={HELP_TERMS.exposure} about={t.help.exposure} />
        </span>
      ),
      width: 13.5,
      sort: state("stock"),
    },
    { id: "yield", head: t.columns.yield, width: 11 },
    {
      id: "assets",
      head: (
        <span className="inline-flex items-start gap-1">
          {head("assets", t.columns.assets.replace("{period}", periodText))}
          <HelpMark term={HELP_TERMS.assets} about={t.help.assets} />
        </span>
      ),
      width: 10,
      sort: state("assets"),
    },
    { id: "open", head: <span className="sr-only">{t.columns.open}</span>, width: 4.5 },
  ];
  // A row's cells do not depend on the order or the filter, so they are built once per product and grouping: a sort or a search then
  // moves finished rows, and React draws none of them again (what keeps a click under 100 ms with 180 rows).
  const parts = useMemo(
    () =>
      new Map(
        view.tracks.map((x): [number, { phone: ReactNode; cells: ReactNode[] }] => {
          const notes: RowNotes = { isDefault: defaults?.includes(x.id) };
          return [
          x.id,
          {
            phone: <PhoneRow x={x} by={by} view={view} notes={notes} />,
            cells: [
              <NameCell x={x} by={by} view={view} notes={notes} />,
              <TrackFundId fundId={x.id} dataset={x.dataset} />,
              <TrackFeeLines fee={x.fee} deposit={x.deposit} size="cell" />,
              x.exposure ? <ExposureCell value={x.exposure} size="cell" /> : <span className={mutedWord}>{t.assets.missing}</span>,
              <span className="flex flex-col gap-1">
                <Yields x={x} size="cell" />
              </span>,
              <AssetsFigure value={x.assets} />,
              <Link to={x.href} aria-label={x.fullName} className="inline-flex size-target items-center justify-center -my-2">
                <RowArrow />
              </Link>,
            ],
          },
          ];
        }),
      ),
    [view, by, defaults],
  );
  let left = limit;
  const tableGroups: ProductGroup[] = [];
  for (const g of groups) {
    if (left <= 0) break;
    const drawn = g.tracks.slice(0, left);
    left -= drawn.length;
    tableGroups.push({
      key: g.key,
      // a chosen kind is one list with no heading: the chip names it, and the count line holds its count and its fees
      heading: g.by === "kind" || fixed ? undefined : {
        title: g.companyId ? (
          <Link to={`/companies/${g.companyId}`} className="hover:underline inline-flex items-center min-h-target min-w-11 md:min-h-0 md:min-w-0 md:tap-area">
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
      foldable
      columns={columns}
      groups={tableGroups}
      foot={(place) => (
        <>
          {foot && <div className={cx("py-3 border-t border-border", place === "phone" ? "px-4" : "px-3")}>{foot}</div>}
        </>
      )}
    />
  );
}
