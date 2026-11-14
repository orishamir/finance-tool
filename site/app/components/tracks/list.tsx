// The track browser's list (D54): one table on a computer, one row per track on a phone, built on the kit's ProductTable.
// Under a company's heading the row says the short name and, when the name leaves it out, the kind; in the one list of a chosen kind
// (no heading) it says the company first. The column heads sort. Every figure goes through the provenance component. On a company's page
// the groups are its products (`fixed`: one product, no heading over it), and a track a new member joins by default says so.
import { useMemo, type ReactNode } from "react";
import { companyPath } from "../../lib/site-paths";
import { Link } from "react-router";
import { company as companyCopy, track as trackCopy, trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, assetsText, feeMarkTerms, missingYield, showsKindChip, showsShortName, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState as Sort, type TbGroup, type TbTrack, ascending } from "../../lib/track-browser";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, useProvenanceData } from "../provenance";
import { ExposureCell, FeeNum, gershayim, GoLink, HelpMark, MixedName, ProductFigures, ProductPhoneFold, ProductPhoneRow, ProductTable, RowArrow, ShareNum, SortHead, SortNote, Tag, TrackFeeLines, TextLink, TrackFundId, TrackLabels, cx, type ProductColumn, type ProductGroup } from "../kit";

/** A product's legal fee caps on a company's page (its record's `fee_caps`), and the age from which they bind its member where they bind
 *  only from one (lib/company-page.ts `CAPS_FROM_AGE`). */
export interface ProductCaps {
  balance: SiteValue | null;
  deposit: SiteValue | null;
  from?: SiteValue | null;
}

/** The words before a cap's figure: "התקרה בתקנות:", or with the age it binds from ("התקרה בתקנות אחרי גיל 21:"). */
export function CapLead({ from }: { from?: SiteValue | null }) {
  if (!from) return <>{companyCopy.fees.cap}</>;
  return (
    <>
      {companyCopy.fees.capAfterAge} <Num value={from} display={String(from.value)} />:
    </>
  );
}

/** The product whose fee figure is what members over 21 paid, averaged over the whole track (CS OQ9). */
export const CHILD_SAVINGS = "child-savings-provident";

/** Over a child-savings list or track: the fee figure is what members past `age` (CS-18's `nii_pays_until_age`, until which National
 *  Insurance pays the fee) paid, averaged over all the track's assets, not the fund's price; the rule base reads it so and keeps the
 *  question open (CS OQ9). Nothing without the age. */
export function ChildFeeNote({ age }: { age: SiteValue | null | undefined }) {
  if (!age) return null;
  return (
    <p className="text-sm text-muted-foreground max-w-measure">
      {t.childFee.before} <Num value={age} display={String(age.value)} /> {t.childFee.after} <IdRef id="CS OQ9" end="." />
    </p>
  );
}

const mutedWord = "text-sm text-muted-foreground";
/** An empty figure's sheet says in a sentence what is missing, where the data's note is only the bare word; a note with a reason stays. */
const sayEmpty = (value: SiteValue, sentence: string): SiteValue => (!value.notes || value.notes.trim() === `${t.yield.missing}.` ? { ...value, notes: sentence } : value);

/** A figure of the regulator's that may be empty: its number, or its words on the same button, so the sheet says why. Not reported reads
 *  "עוד לא דווח" in the cell, as an empty fee does (`FeeNum`); a track younger than the window reads "אין". */
function YieldFigure({ value, track, years, size }: { value: SiteValue | null; track: TbTrack; years: 3 | 5; size: "inline" | "cell" }) {
  const young = years === 3 ? track.young3 : track.young5;
  if (!value) return <span className={mutedWord}>{young ? missingYield(track, years) : trackCopy.feeNotReported}</span>;
  if (value.value === null) return young ? <Num value={value} size={size} display={missingYield(track, years)} /> : <Num value={sayEmpty(value, `${t.yield.emptyNote.before}${years}${t.yield.emptyNote.after}`)} size={size} display={trackCopy.feeNotReported} />;
  return <Num value={value} size={size} />;
}

/** The two yields, each followed by its window: "אין 3 שנים" for a track younger than the window, "עוד לא דווח 3 שנים" for one not reported. */
function Yields({ x, size, inline }: { x: TbTrack; size: "inline" | "cell"; inline?: boolean }) {
  if (x.selfManaged) return <span className={cx(mutedWord, "block whitespace-normal")}>{t.yield.selfManaged}</span>;
  const items = ([3, 5] as const).map((years) => {
    const v = years === 3 ? x.y3 : x.y5;
    return { id: `y${years}`, figure: <YieldFigure value={v} track={x} years={years} size={size} />, word: years === 3 ? t.yield.years3 : t.yield.years5 };
  });
  return <ProductFigures items={items} inline={inline} />;
}

/** Assets at the period's end: "19.1 מיליארד ₪" for a thousand million and more. */
function AssetsFigure({ value, size = "cell" }: { value: SiteValue | null; size?: "inline" | "cell" }) {
  // not reported reads "עוד לא דווח" in the cell, as an empty fee does, and its sheet says why
  if (!value) return <span className={mutedWord}>{trackCopy.feeNotReported}</span>;
  return typeof value.value === "number" ? <Num value={value} size={size} display={assetsText(value.value)} /> : <Num value={sayEmpty(value, t.assets.emptyNote)} size={size} display={trackCopy.feeNotReported} />;
}

/** "16 מסלולים · כסף מנוהל 19.1 מיליארד ₪": the company's size in the product, each part unbroken. `stacked`: one part under the other, in a
 *  table cell too narrow to hold both on every row (so no row has one line where its neighbour has two). */
export function CompanySize({ count, assets, stacked }: { count: string; assets: SiteValue | null; stacked?: boolean }) {
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
        <TextLink tone="plain" to={x.href} className="font-medium">
          <MixedName>{x.short}</MixedName>
        </TextLink>
        <span className="flex flex-wrap gap-1.5 empty:hidden">
          <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
          {showsKindChip(x) && <Tag>{gershayim(x.sub)}</Tag>}
        </span>
      </span>
    );
  }
  const company = view.companies.find((c) => c.index === x.company);
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="flex flex-col items-start gap-0.5">
        <TextLink tone="plain" to={companyPath(company?.id ?? "")} className="font-semibold">
          <bdi>{gershayim(x.companyName)}</bdi>
        </TextLink>
        {company && (
          <span className={mutedWord}>
            <CompanySize count={tracksPhrase(company.tracks.length)} assets={company.assets} stacked />
          </span>
        )}
      </span>
      {showsShortName(x) && (
        <TextLink tone="plain" to={x.href}>
          <MixedName>{x.short}</MixedName>
        </TextLink>
      )}
      <span className="flex flex-wrap gap-1.5 empty:hidden">
        <TrackLabels track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
      </span>
    </span>
  );
}

/** A company page's shorter table: the track's short name (the link to it), its labels, and its kind as a quiet line under it; a
 *  self-managed track says so there, its yields being "—". */
function CompactName({ x, notes }: { x: TbTrack; notes: RowNotes }) {
  const sub = [showsKindChip(x) ? gershayim(x.sub) : null, x.selfManaged ? t.yield.selfManagedShort : null].filter(Boolean).join(" · ");
  return (
    <span className="flex flex-col items-start gap-0.5 whitespace-normal leading-snug">
      <TextLink tone="plain" to={x.href} className="font-medium">
        <MixedName>{x.short}</MixedName>
      </TextLink>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      <span className="flex flex-wrap gap-1.5 empty:hidden pt-0.5">
        <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
      </span>
    </span>
  );
}

/** The exposure and the two yields, then the assets and the fund's number: the lines a phone's row shows under its name and fees. */
function PhoneFigures({ x }: { x: TbTrack }) {
  return (
    <>
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
    </>
  );
}

/** A track under its company on a phone, in a long list: one line, its name and its fee from savings; a tap opens the rest of the row in
 *  place (its labels, the fee from deposits, the exposure, the yields, the assets, the fund's number and the link to its page). */
function FoldedPhoneRow({ x, notes }: { x: TbTrack; notes: RowNotes }) {
  return (
    <ProductPhoneFold name={<MixedName>{x.short}</MixedName>} figure={<TrackFeeLines fee={x.fee} inline />} label={gershayim(x.fullName)}>
      <span className="flex flex-wrap gap-1.5 empty:hidden">
        <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
        {showsKindChip(x) && <Tag>{gershayim(x.sub)}</Tag>}
      </span>
      <TrackFeeLines deposit={x.deposit} inline />
      <PhoneFigures x={x} />
      <GoLink to={x.href} className="self-start">
        {t.openTrack}
      </GoLink>
    </ProductPhoneFold>
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
              <MixedName>{x.short}</MixedName>
            </span>
          ) : (
            <>
              <span className="font-semibold">
                <bdi>{gershayim(x.companyName)}</bdi>
              </span>
              {showsShortName(x) && (
                <span>
                  <MixedName>{x.short}</MixedName>
                </span>
              )}
            </>
          )}
          <span className="flex flex-wrap gap-1.5 empty:hidden">
            <TrackLabels isDefault={notes.isDefault} track={{ inception: x.inception, reportPeriod: x.reportPeriod }} />
            {by === "company" && showsKindChip(x) && <Tag>{gershayim(x.sub)}</Tag>}
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
      <PhoneFigures x={x} />
    </ProductPhoneRow>
  );
}

/** `limit`: how many rows of the open groups are drawn, from the top; the headings, the counts and the key under the list always speak of every
 *  row of the group. `fold`: the page holds which groups are open (the track browser's companies, folded but the first); without it every
 *  group starts open. `foldRows`: on a phone a row is one line that opens in place (a long list under the companies).
 *  On a company's page: `fixed`, its one product, with no heading; `defaults`, its tracks a new member joins; `foot`, lines under the key. */
export function TrackList({ view, groups, by, sort, sortable, onSort, feeYear, period, limit = Infinity, fixed, defaults, foot, compact, caps, fold, foldRows }: { view: ProductView; groups: TbGroup[]; by: GroupBy; sort: Sort; /** The columns whose head sorts here (lib/track-browser sortableIn); the others are plain words. */ sortable: ReadonlySet<SortId>; onSort: (id: SortId) => void; feeYear: string | null; period: string; limit?: number; fixed?: boolean; defaults?: readonly number[]; foot?: ReactNode; /** A company page's shorter table: one figure a cell, no rings, a "?" only on the fee heads, no row arrow, the name the link; a deposit fee column only where the tracks differ in it. */ compact?: "with-deposit" | "no-deposit"; /** A company page's shorter table: the product's legal caps (its record's `fee_caps`), each the caption over the fee head it limits. */ caps?: ProductCaps | null; fold?: { isOpen: (key: string) => boolean; toggle: (key: string) => void }; foldRows?: boolean }) {
  const state = (...ids: SortId[]) => (ids.includes(sort.id) ? (ascending(sort) ? ("ascending" as const) : ("descending" as const)) : ("none" as const));
  const head = (id: SortId, label: string, alsoHolds?: string[], note?: string, raised?: boolean) =>
    sortable.has(id) ? (
      <SortHead label={label} state={state(id)} onPress={() => onSort(id)} alsoHolds={alsoHolds} note={note} raised={raised} />
    ) : note ? (
      <SortNote label={label} note={note} />
    ) : (
      <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>
    );
  // a company page's fee heads: the fee, the year whose average the column shows under it, and a "?" beside the head (never inside its
  // button) that opens what the figure is and, where its card names this product, the fee's own card; the savings fee's also opens, first,
  // what the column leaves out (the direct expenses, with their card and its rules)
  const provenance = useProvenanceData();
  const wrappers = (term: string) => provenance?.terms[term]?.wrapperIds;
  // a pension track's fees are its fund's, the same on every track of the fund (CAT-39): the note under the fee head says so
  const average = (feeYear ? t.columns.average.replace("{year}", feeYear) : t.columns.averageNoYear) + (view.dataset === "pensia-net" ? `, ${trackCopy.feeWhole}` : view.id === CHILD_SAVINGS ? `, ${trackCopy.feeOver21}` : "");
  const feeHead = (id: SortId, label: string, side: "savings" | "deposit") => {
    const terms = side === "savings" ? [...feeMarkTerms(side, view.id, wrappers), HELP_TERMS.direct] : feeMarkTerms(side, view.id, wrappers);
    return (
      <span className="inline-flex items-start gap-1">
        {head(id, label, undefined, average, true)}
        <HelpMark term={terms.length === 1 ? terms[0] : terms} about={side === "savings" ? t.help.fee : t.help.deposit} lead={side === "savings" ? companyCopy.fees.direct : undefined} />
      </span>
    );
  };
  const periodText = fmt.period(period);
  const periodNote = t.columns.endOf.replace("{period}", periodText);
  // the full table's past yield: what it is in the head, before fees and tax in the muted line under it, and the whole caution in its "?"
  const pastMark = <HelpMark about={t.help.past} text={t.pastNote} />;
  const pastHead = (label: string, note: string) => <SortNote label={label} note={note} mark={pastMark} />;
  const short = t.columns.short;
  // a cap over the fee head it limits, its figure opening its source (the regulations)
  const capHead = (cap: SiteValue) => (
    <span className="whitespace-nowrap">
      <CapLead from={caps?.from} /> <Num value={cap} />
    </span>
  );
  // one date over the five columns whose figures share it (the exposure, the yields, the assets)
  const asOf = t.columns.asOf.replace("{period}", periodText);
  const dated = { band: asOf };
  // a company page's head over its two yields is the words and the "?" alone: that the figures are before fees and tax is in the "?"
  // (t.pastNote), which says it first ("make 'לפני דמי ניהול ומס' go into the ?")
  const pastOver = {
    key: "past",
    head: (
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {short.past}
        {/* positioned, so the mark lies over the years' heads under it and keeps its 44 px */}
        <span className="relative inline-flex">{pastMark}</span>
      </span>
    ),
    spoken: short.past,
  };
  // A dense table (8 px between columns, 12 at its outer edges), each fixed column as wide as its longest real content over every company's
  // tracks, measured with that padding: the fund's number with its link mark (5.35), the fee head with its arrow and "?" in two lines in every
  // sort state (10.3; its cap caption fits under that), the deposit fee's cap caption ("התקרה בתקנות: 4%", 7.9), the sorted share head ("מניות
  // ▼", 3.85) and "מט״ח" over the figures (3.3), where the words a share takes without a figure ("אין נכסים", "לא דווח") take two lines, a
  // yield's figure ("33.05%", 4.9 each, the head over both with its "?" fitting over that), the money ("110.79 מיליארד ₪", 9.6, at the table's end). The
  // name keeps the least width where the longest name of the companies with the most tracks still takes two lines ("אשראי ואג״ח עם מניות (עד
  // 25% מניות)", 10.95); a longer name elsewhere may take three.
  const compactColumns: ProductColumn[] = [
    { id: "name", head: head("name", t.columns.track), sort: state("name"), least: 10.95 },
    { id: "fund", head: t.columns.fund, width: 5.35 },
    { id: "fee", head: feeHead("fee", short.fee, "savings"), width: 10.3, sort: state("fee"), ...(caps?.balance ? { band: "cap-savings", bandHead: capHead(caps.balance) } : {}) },
    ...(compact === "with-deposit" ? [{ id: "dep", head: feeHead("dep", short.deposit, "deposit"), width: 7.9, sort: state("dep"), ...(caps?.deposit ? { band: "cap-deposit", bandHead: capHead(caps.deposit) } : {}) }] : []),
    { id: "stocks", head: head("stock", short.stocks), width: 3.85, wrap: true, sort: state("stock"), ...dated },
    { id: "currency", head: short.currency, width: 3.3, wrap: true, ...dated },
    // one head over the two past yields, what it is with its "?", and each column's years under it
    { id: "y3", head: t.yield.years3, over: pastOver, width: 4.9, ...dated },
    { id: "y5", head: t.yield.years5, over: pastOver, width: 4.9, ...dated },
    { id: "assets", head: head("assets", short.assets), width: 9.6, sort: state("assets"), ...dated },
  ];
  // the full table's one fee head over both figures: its "?" opens the two averages, then each fee's card that names the product
  const [savingsAverage, ...savingsCard] = feeMarkTerms("savings", view.id, wrappers);
  const [depositAverage, ...depositCard] = feeMarkTerms("deposit", view.id, wrappers);
  const fullFeeTerms = [savingsAverage!, depositAverage!, ...savingsCard, ...depositCard];
  const columns: ProductColumn[] = compact ? compactColumns : [
    { id: "name", head: head("name", by === "company" ? t.columns.track : t.columns.company, [t.columns.track, t.columns.company]), sort: state("name") },
    { id: "fund", head: t.columns.fund, width: 5.5 },
    {
      id: "fee",
      head: (
        <span className="flex flex-col">
          {/* the year of the average in muted words beside the head, the two heads that sort under them and the "?" after them: on the
              heads' line it covers no arrow and keeps its 44 px, and the raised heads keep every press on their own words and arrows */}
          <span className="inline-flex items-center gap-1">
            {t.columns.fee}
            <span className="font-normal">{average}</span>
          </span>
          <span className="flex flex-wrap gap-x-3">
            {head("fee", t.columns.feeSavings, undefined, undefined, true)}
            <span className="inline-flex items-start gap-1">
              {head("dep", t.columns.feeDeposits, undefined, undefined, true)}
              <HelpMark term={fullFeeTerms} about={t.help.fee} />
            </span>
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
          {head("stock", t.columns.exposure, undefined, periodNote, true)}
          <HelpMark term={HELP_TERMS.exposure} about={t.help.exposure} />
        </span>
      ),
      // a line for each share: its word, a 4 rem bar and its figure, at most "מניות ▬ 101%"
      width: 12.75,
      sort: state("stock"),
    },
    { id: "yield", head: pastHead(t.columns.yield, `${t.columns.beforeFees} · ${periodNote}`), width: 15.25 },
    {
      id: "assets",
      head: (
        <span className="inline-flex items-start gap-1">
          {head("assets", t.columns.assets, undefined, periodNote, true)}
          <HelpMark term={HELP_TERMS.assets} about={t.help.assets} />
        </span>
      ),
      // the date under the head is wider than the label, so the "?" stands far along the head: 10.75 rem keeps its 44 px inside the column,
      // clear of the arrow column's sticky head
      width: 10.75,
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
            phone: foldRows && by === "company" ? <FoldedPhoneRow x={x} notes={notes} /> : <PhoneRow x={x} by={by} view={view} notes={notes} />,
            cells: compact ? [
              <CompactName x={x} notes={notes} />,
              <TrackFundId fundId={x.id} dataset={x.dataset} />,
              <span className="font-semibold"><FeeNum value={x.fee} size="cell" /></span>,
              ...(compact === "with-deposit" ? [<FeeNum value={x.deposit} size="cell" />] : []),
              x.exposure?.stock ? <ShareNum value={x.exposure.stock} size="cell" wrap /> : <span className={mutedWord}>—</span>,
              x.exposure?.currency ? <ShareNum value={x.exposure.currency} size="cell" wrap /> : <span className={mutedWord}>—</span>,
              x.selfManaged ? <span className={mutedWord}>—</span> : <YieldFigure value={x.y3} track={x} years={3} size="cell" />,
              x.selfManaged ? <span className={mutedWord}>—</span> : <YieldFigure value={x.y5} track={x} years={5} size="cell" />,
              <AssetsFigure value={x.assets} />,
            ] : [
              <NameCell x={x} by={by} view={view} notes={notes} />,
              <TrackFundId fundId={x.id} dataset={x.dataset} />,
              <TrackFeeLines fee={x.fee} deposit={x.deposit} size="cell" />,
              x.exposure ? <ExposureCell value={x.exposure} size="cell" /> : <span className={mutedWord}>{t.assets.missing}</span>,
              <span className="flex flex-col gap-1">
                <Yields x={x} size="cell" />
              </span>,
              <AssetsFigure value={x.assets} />,
              <Link to={x.href} aria-label={gershayim(x.fullName)} className="inline-flex size-target items-center justify-center -my-2">
                <RowArrow />
              </Link>,
            ],
          },
          ];
        }),
      ),
    [view, by, defaults, compact, foldRows],
  );
  let left = limit;
  const tableGroups: ProductGroup[] = [];
  for (const g of groups) {
    // a folded group is its heading alone; an open one past the rows drawn so far waits for the rest
    const shut = !!fold && !fold.isOpen(g.key);
    if (!shut && left <= 0) continue;
    const drawn = shut ? [] : g.tracks.slice(0, left);
    left -= drawn.length;
    tableGroups.push({
      key: g.key,
      fold: fold && { open: !shut, onToggle: () => fold.toggle(g.key) },
      // a chosen kind is one list with no heading: the chip names it, and the count line holds its count and its fees
      heading: g.by === "kind" || fixed ? undefined : {
        title: g.companyId ? (
          <TextLink tone="plain" to={companyPath(g.companyId)} className="inline-flex items-center min-h-target min-w-11 md:min-h-0 md:min-w-0 md:tap-area">
            <bdi>{g.title}</bdi>
          </TextLink>
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
      dense={!!compact}
      columns={columns}
      groups={tableGroups}
      foot={(place) => (
        <>
          {foot && !compact && <div className={cx("py-3 border-t border-border", place === "phone" ? "px-4" : "px-3")}>{foot}</div>}
        </>
      )}
    />
  );
}
