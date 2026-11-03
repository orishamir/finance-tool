// Company page components (design-spec 5 as redrawn on 2026-10-23, flows 6.11): track list with
// near-duplicate groups, paste card. A track's name is its short name (2026-11-03, as on the tracks page): the page and the group's
// heading already say the company and the product; the full name is on the track's own page. Its kind is a tag under the name, only
// where the name does not say it already.
import { useId, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { company as copy, trackBrowser as tb } from "../../copy";
import { HELP_TERMS } from "../../lib/track-browser";
import { kindLabel, kindWordSet, nameSaysKind, shortTrackNames } from "../../lib/track-names";
import { Term } from "../provenance";
import type { Track } from "../../lib/data.server";
import type { SiteValue } from "../../lib/value";
import type { ExposureShares } from "../../lib/track-exposure";
import { IconDrillIn, IconSearch } from "../icons";
import { useOpenSearch } from "../shell";
import { Card, cx, ExposureCell, FeeKey, HelpMark, ProductPhoneRow, ProductTable, Tag, TrackFeeLines, TrackFundId, TrackLabels, type ProductColumn } from "../kit";

export type Resolution = "distinct" | "twice" | "unresolved";

export interface TrackRowView {
  track: Track;
  href: string;
  isDefault?: boolean;
  /** The regulator's balance-fee average of the track (not a ranking: the list keeps its order). */
  fee?: SiteValue;
  /** The regulator's deposit-fee average of the track, the fee cell's second line (D34). */
  deposit?: SiteValue;
  /** F-87 and F-88: the shares of the track's assets exposed to stocks and to foreign currency; null or absent when its data file has no amounts. */
  exposure?: ExposureShares | null;
}

export interface Group {
  key: string;
  tracks: TrackRowView[];
  /** Same-name tracks: the resolution from the data. */
  dup?: Resolution;
}

/** Rows that share a name are drawn together under one banner; the resolution comes from the data. */
export function groupTracks(rows: TrackRowView[], known: { name: string; trackIds: number[]; resolution: Resolution }[] = []): Group[] {
  const byName = new Map<string, TrackRowView[]>();
  for (const r of rows) {
    const list = byName.get(r.track.name) ?? [];
    list.push(r);
    byName.set(r.track.name, list);
  }
  const out: Group[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.track.name)) continue;
    seen.add(r.track.name);
    const list = byName.get(r.track.name)!;
    if (list.length === 1) out.push({ key: `${r.track.fundId}`, tracks: list });
    else {
      const ids = new Set(list.map((x) => x.track.fundId));
      // the catalogue's own resolution (near_duplicates) wins when it names this name and one of these tracks
      const given = known.find((k) => k.name === r.track.name && (k.trackIds.length === 0 || k.trackIds.some((id) => ids.has(id))));
      out.push({ key: `dup-${r.track.name}`, tracks: list, dup: given?.resolution ?? (ids.size === list.length ? "distinct" : ids.size === 1 ? "twice" : "unresolved") });
    }
  }
  return out;
}

/** The regulator's kind of the track ("אג"ח סחיר") as a tag, when its short name does not say it already. */
function KindTag({ t, short }: { t: Track; short: string }) {
  const kind = t.subSpecialization ? kindLabel(t.subSpecialization) : "";
  return kind && !nameSaysKind(short, kind) ? <Tag>{kind}</Tag> : null;
}

export function TrackList({ groups, company, feeHead, exposureHead, foot }: { groups: Group[]; /** The company's name: a lone track loses only it from its name. */ company: string; feeHead?: string; exposureHead?: string; foot?: ReactNode }) {
  const shorts = useMemo(() => {
    const tracks = groups.flatMap((g) => g.tracks.map((r) => r.track));
    return shortTrackNames(company, tracks.map((t) => ({ key: `${t.fundId}|${t.name}`, name: t.name })), kindWordSet(tracks.map((t) => t.subSpecialization).filter(Boolean)));
  }, [groups, company]);
  const shortOf = (t: Track) => shorts.get(`${t.fundId}|${t.name}`) ?? t.name;
  const columns: ProductColumn[] = [
    { id: "name", head: copy.pcColumns.name },
    { id: "fund", head: copy.pcColumns.fund, width: 5.5 },
    ...(feeHead ? [{ id: "fee", head: <span className="inline-flex items-start gap-1">{feeHead}<HelpMark term={HELP_TERMS.fee} about={tb.help.fee} className="mt-0.5" /></span>, width: 13 }] : []),
    ...(exposureHead ? [{ id: "exposure", head: <span className="inline-flex items-start gap-1">{exposureHead}<HelpMark term={HELP_TERMS.exposure} about={tb.help.exposure} className="mt-0.5" /></span>, width: 11.5 }] : []),
    { id: "open", head: <span className="sr-only">{copy.pcColumns.open}</span>, width: 4.5 },
  ];
  const fees = groups.flatMap((g) => g.tracks.flatMap((r) => [r.fee, r.deposit]));
  return (
    <ProductTable
      columns={columns}
      groups={groups.map((g) => ({
        key: g.key,
        ...(g.dup ? { banner: copy.sameName[g.dup] } : {}),
        rows: g.tracks.map((r) => ({
          key: r.track.fundId + r.track.name,
          phone: <TrackRow row={r} short={shortOf(r.track)} />,
          cells: [
            <span className="flex flex-col items-start gap-1.5">
              <Link to={r.href} className="font-medium hover:underline">
                <bdi>{shortOf(r.track)}</bdi>
              </Link>
              <span className="flex flex-wrap gap-1.5 empty:hidden">
                <TrackLabels isDefault={r.isDefault} track={{ inception: r.track.inception, reportPeriod: r.track.reportPeriod }} />
                <KindTag t={r.track} short={shortOf(r.track)} />
              </span>
            </span>,
            <TrackFundId fundId={r.track.fundId} dataset={r.track.dataset} />,
            ...(feeHead ? [r.fee && <TrackFeeLines fee={r.fee} deposit={r.deposit} size="cell" />] : []),
            ...(exposureHead ? [r.exposure && <ExposureCell value={r.exposure} size="cell" />] : []),
            <Link to={r.href} aria-label={r.track.name} className="inline-flex size-target items-center justify-center -my-2">
              <IconDrillIn className="text-muted-foreground" />
            </Link>,
          ],
        })),
      }))}
      foot={(place) => (
        <>
          {/* the key of the empty-cell words, on the phone too (2026-10-27: it was on the PC table only) */}
          <FeeKey values={fees} className={cx("flex flex-col gap-1 py-2 text-xs text-muted-foreground border-t border-border", place === "phone" ? "px-4" : "px-3")} />
          {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
          {place === "phone" && (feeHead || exposureHead) && (
            <p className="px-4 py-2 text-sm text-muted-foreground border-t border-border">
              {tb.help.phoneLead} {feeHead && <Term id={HELP_TERMS.fee}>{tb.help.fee}</Term>}
              {feeHead && exposureHead && " · "}
              {exposureHead && <Term id={HELP_TERMS.exposure}>{tb.help.exposure}</Term>}
            </p>
          )}
          {foot && <div className={cx("py-3 border-t border-border", place === "phone" ? "px-4" : "px-3")}>{foot}</div>}
        </>
      )}
    />
  );
}

function TrackRow({ row, short }: { row: TrackRowView; short: string }) {
  const { track: t } = row;
  // The fee, the stock share and the fund's link out are buttons or links, which cannot sit inside the row's link: each gets its own line under it.
  return (
    <ProductPhoneRow stacked>
      <Link to={row.href} className="flex items-center justify-between gap-3 min-w-0 min-h-11">
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium">
            <bdi>{short}</bdi>
          </span>
          <span className="flex flex-wrap gap-1.5 empty:hidden">
            <TrackLabels isDefault={row.isDefault} track={{ inception: t.inception, reportPeriod: t.reportPeriod }} />
            <KindTag t={t} short={short} />
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <IconDrillIn className="text-muted-foreground" />
        </span>
      </Link>
      {row.fee && (
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {copy.feeRow}
          {t.dataset === "pensia-net" && <> {copy.feeRowWhole}</>}:
          <TrackFeeLines fee={row.fee} deposit={row.deposit} inline />
        </span>
      )}
      {/* the fund's number closes every row at the same place, as on the tracks page */}
      <span className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        {row.exposure ? <ExposureCell value={row.exposure} /> : <span />}
        <span className="text-sm text-muted-foreground">
          {copy.trackLine.fund} <TrackFundId fundId={t.fundId} dataset={t.dataset} />
        </span>
      </span>
    </ProductPhoneRow>
  );
}

export function PasteCard({ className }: { className?: string }) {
  const id = useId();
  const open = useOpenSearch();
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className={cx("flex flex-col gap-2.5 lg:p-5", className)}>
      <h2 id={`${id}-h`} className="text-lg font-semibold">
        {copy.paste.title}
      </h2>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {copy.paste.label}
      </label>
      <div className="field-box text-muted-foreground">
        <IconSearch size={18} />
        <input id={id} dir="rtl" placeholder={copy.paste.placeholder} className="field-input !text-start text-mixed" onChange={(e) => e.target.value && open(e.currentTarget, e.target.value)} onFocus={(e) => e.target.value && open(e.currentTarget, e.target.value)} />
      </div>
    </Card>
  );
}
