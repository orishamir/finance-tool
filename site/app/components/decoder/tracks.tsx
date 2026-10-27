// Company page components (design-spec 5 as redrawn on 2026-10-23, flows 6.11): track list with
// near-duplicate groups, paste card.
import { useId, type ReactNode } from "react";
import { Link } from "react-router";
import { company as copy } from "../../copy";
import type { Track } from "../../lib/data.server";
import type { SiteValue } from "../../lib/value";
import { FeeKey, FeeNum } from "./fees";
import { Num } from "../provenance";
import { ringFraction, shareText, type ExposureShares } from "../../lib/track-exposure";
import { trackLabels } from "../../lib/track-labels";
import { IconDrillIn, IconSearch } from "../icons";
import { useOpenSearch } from "../shell";
import { Card, cx, ProductPhoneRow, ProductTable, ShareRings, Swatch, Tag, type ProductColumn } from "../kit";

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

function TrackLine({ t }: { t: Track }) {
  return (
    <span className="text-sm text-muted-foreground">
      {copy.trackLine.fund} <bdi dir="ltr" className="num-id">{t.fundId}</bdi>
      {t.specialization && <> · {copy.trackLine.classification} {t.specialization}</>}
    </span>
  );
}

function Holds({ t }: { t: Track }) {
  if (!t.subSpecialization) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {copy.subSpecialization} <bdi>{t.subSpecialization}</bdi>
    </span>
  );
}

/** F-87 or F-88 (D34) through the provenance component; a share that could not be computed says why in its words and sheet. */
export function ShareNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  return <Num value={value} size={size} display={shareText(value)} />;
}

/** A track's exposure (D34): two rings, stocks outside and foreign currency inside, and beside them each share with its own dot and name. */
export function ExposureCell({ value, size = "inline" }: { value: ExposureShares; size?: "inline" | "cell" }) {
  const lines = [
    { id: "stocks", v: value.stock, word: copy.stock.stocks, swatch: "bg-chart-stocks", ring: "stroke-chart-stocks" },
    { id: "currency", v: value.currency, word: copy.stock.currency, swatch: "bg-chart-currency", ring: "stroke-chart-currency" },
  ].filter((l): l is typeof l & { v: SiteValue } => !!l.v);
  return (
    <span className="inline-flex items-center gap-2.5">
      <ShareRings rings={lines.map((l) => ({ id: l.id, fraction: ringFraction(l.v), className: l.ring }))} />
      <span className="grid grid-cols-[auto_auto] items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
        {lines.map((l) => (
          <span key={l.id} className="contents">
            <span className="inline-flex items-center gap-1.5">
              <Swatch shape="box" className={l.swatch} />
              {l.word}
            </span>
            <ShareNum value={l.v} size={size} />
          </span>
        ))}
      </span>
    </span>
  );
}

/** The default track's tag, then the facts about this track (lib/track-labels.ts). */
function Labels({ row }: { row: TrackRowView }) {
  const labels = trackLabels(row.track);
  if (!row.isDefault && labels.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {row.isDefault && <Tag tone="parameter">{copy.default}</Tag>}
      {labels.map((l) => (
        <Tag key={l}>{copy.labels[l]}</Tag>
      ))}
    </span>
  );
}

/** Both fee averages, each with its word: the balance fee, then the deposit fee (D34). */
function FeeLines({ row, size = "inline", inline }: { row: TrackRowView; size?: "inline" | "cell"; inline?: boolean }) {
  const lines = [
    { id: "savings", v: row.fee, word: copy.fees.savings },
    { id: "deposits", v: row.deposit, word: copy.fees.deposits },
  ].filter((l): l is typeof l & { v: SiteValue } => !!l.v);
  return (
    <span className={cx("flex", inline ? "flex-wrap items-center gap-x-3 gap-y-1" : "flex-col gap-1")}>
      {lines.map((l) => (
        <span key={l.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <FeeNum value={l.v} size={size} />
          <span className="text-sm text-muted-foreground">{l.word}</span>
        </span>
      ))}
    </span>
  );
}

export function TrackList({ groups, feeHead, exposureHead, foot }: { groups: Group[]; feeHead?: string; exposureHead?: string; foot?: ReactNode }) {
  const columns: ProductColumn[] = [
    { id: "name", head: copy.pcColumns.name },
    { id: "fund", head: copy.pcColumns.fund },
    { id: "holds", head: copy.pcColumns.holds },
    ...(feeHead ? [{ id: "fee", head: feeHead }] : []),
    ...(exposureHead ? [{ id: "exposure", head: exposureHead, cellClassName: "whitespace-nowrap" }] : []),
    { id: "open", head: <span className="sr-only">{copy.pcColumns.open}</span>, headClassName: "w-10 md:w-auto" },
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
          phone: <TrackRow row={r} />,
          cells: [
            <span className="flex flex-col items-start gap-1.5">
              <Link to={r.href} className="font-medium hover:underline">
                <bdi>{r.track.name}</bdi>
              </Link>
              <Labels row={r} />
            </span>,
            <bdi dir="ltr" className="num-id">{r.track.fundId}</bdi>,
            <span className="flex flex-col gap-0.5">
              <span>{r.track.specialization}</span>
              {r.track.subSpecialization && (
                <span className="text-sm text-muted-foreground">
                  <bdi>{r.track.subSpecialization}</bdi>
                </span>
              )}
            </span>,
            ...(feeHead ? [r.fee && <FeeLines row={r} size="cell" />] : []),
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
          {foot && <div className={cx("py-3 border-t border-border", place === "phone" ? "px-4" : "px-3")}>{foot}</div>}
        </>
      )}
    />
  );
}

function TrackRow({ row }: { row: TrackRowView }) {
  const { track: t } = row;
  // The fee and the stock share are provenance buttons, which cannot sit inside the link: each gets its own line under it.
  const lines = !!row.fee || !!row.exposure;
  return (
    <ProductPhoneRow stacked={lines}>
      <Link to={row.href} className="flex items-center justify-between gap-3 min-w-0">
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium flex flex-wrap items-center gap-2">
            <bdi>{t.name}</bdi>
            <Labels row={row} />
          </span>
          <TrackLine t={t} />
          <Holds t={t} />
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <IconDrillIn className="text-muted-foreground" />
        </span>
      </Link>
      {row.fee && (
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {copy.feeRow}
          {t.dataset === "pensia-net" && <> {copy.feeRowWhole}</>}:
          <FeeLines row={row} inline />
        </span>
      )}
      {row.exposure && <ExposureCell value={row.exposure} />}
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
