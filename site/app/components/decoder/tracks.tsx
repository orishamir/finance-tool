// Company page components (design-spec 5 as redrawn on 2026-10-23, flows 6.11): track list with
// near-duplicate groups, paste card.
import { useId, type ReactNode } from "react";
import { Link } from "react-router";
import { company as copy, r3workbench } from "../../copy";
import type { Track } from "../../lib/data.server";
import type { SiteValue } from "../../lib/value";
import { FeeNum } from "./fees";
import { Num } from "../provenance";
import { stockShareText } from "../../lib/track-exposure";
import { IconAlert, IconDrillIn, IconSearch } from "../icons";
import { useOpenSearch } from "../shell";
import { Card, cx, Tag } from "../kit";

export type Resolution = "distinct" | "twice" | "unresolved";

export interface TrackRowView {
  track: Track;
  href: string;
  isDefault?: boolean;
  /** The regulator's balance-fee average of the track (not a ranking: the list keeps its order). */
  fee?: SiteValue;
  /** F-87: the share of the track's assets exposed to shares; null or absent when the track's data file has no amounts. */
  stock?: SiteValue | null;
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

/** F-87, the stock share (D34), through the provenance component; one that could not be computed says why in its words and sheet. */
export function StockNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  return <Num value={value} size={size} display={stockShareText(value)} />;
}

export function TrackList({ groups, feeHead, stockHead }: { groups: Group[]; feeHead?: string; stockHead?: string }) {
  const cols = 4 + (feeHead ? 1 : 0) + (stockHead ? 1 : 0);
  const bannerId = useId();
  return (
    <>
      <Card className="md:hidden p-0 md:p-0 overflow-hidden flex flex-col">
        {groups.map((g) =>
          g.dup ? (
            <div key={g.key} role="group" aria-labelledby={`${bannerId}-${g.key}`} className="dup">
              <div id={`${bannerId}-${g.key}`} className="dup-banner">
                <IconAlert size={16} className="text-caution shrink-0" />
                {copy.sameName[g.dup]}
              </div>
              {g.tracks.map((r) => (
                <TrackRow key={r.track.fundId + r.track.name} row={r} />
              ))}
            </div>
          ) : (
            <TrackRow key={g.key} row={g.tracks[0]!} />
          ),
        )}
      </Card>
      <Card className="hidden md:block p-0 md:p-0 overflow-x-auto overflow-y-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">{copy.pcColumns.name}</th>
              <th scope="col">{copy.pcColumns.fund}</th>
              <th scope="col">{copy.pcColumns.holds}</th>
              {feeHead && <th scope="col">{feeHead}</th>}
              {stockHead && <th scope="col">{stockHead}</th>}
              <th scope="col" className="w-10 md:w-auto">
                <span className="sr-only">{copy.pcColumns.open}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.flatMap((g) => {
              const rows: ReactNode[] = [];
              if (g.dup)
                rows.push(
                  <tr key={`${g.key}-banner`} className="dup-row">
                    <td colSpan={cols} className="!pb-1 !border-b-0 border-s-[3px] border-s-caution">
                      <span className="dup-banner !p-0">
                        <IconAlert size={16} className="text-caution shrink-0" />
                        {copy.sameName[g.dup]}
                      </span>
                    </td>
                  </tr>,
                );
              for (const r of g.tracks)
                rows.push(
                  <tr key={r.track.fundId + r.track.name} className={cx(g.dup && "dup-row")}>
                    <td className={cx(g.dup && "border-s-[3px] border-s-caution")}>
                      <Link to={r.href} className="font-medium hover:underline">
                        <bdi>{r.track.name}</bdi>
                      </Link>{" "}
                      {r.isDefault && <Tag tone="parameter">{copy.default}</Tag>}
                    </td>
                    <td>
                      <bdi dir="ltr" className="num-id">{r.track.fundId}</bdi>
                    </td>
                    <td>
                      <span className="flex flex-col gap-0.5">
                        <span>{r.track.specialization}</span>
                        {r.track.subSpecialization && (
                          <span className="text-sm text-muted-foreground">
                            <bdi>{r.track.subSpecialization}</bdi>
                          </span>
                        )}
                      </span>
                    </td>
                    {feeHead && <td className="whitespace-nowrap">{r.fee && <FeeNum value={r.fee} size="cell" />}</td>}
                    {stockHead && (
                      <td className="whitespace-nowrap">
                        {r.stock && <StockNum value={r.stock} size="cell" />}
                      </td>
                    )}
                    <td>
                      <Link to={r.href} aria-label={r.track.name} className="inline-flex size-target items-center justify-center -my-2">
                        <IconDrillIn className="text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>,
                );
              return rows;
            })}
          </tbody>
        </table>
        {groups.some((g) => g.tracks.some((r) => r.fee && r.fee.value === null)) && <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border">{r3workbench.missingKey}</p>}
      </Card>
    </>
  );
}

function TrackRow({ row }: { row: TrackRowView }) {
  const { track: t } = row;
  // The fee and the stock share are provenance buttons, which cannot sit inside the link: each gets its own line under it.
  const lines = !!row.fee || !!row.stock;
  return (
    <div className={cx("track", lines && "!flex-col !items-stretch !gap-1")}>
      <Link to={row.href} className="flex items-center justify-between gap-3 min-w-0">
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium flex flex-wrap items-center gap-2">
            <bdi>{t.name}</bdi>
            {row.isDefault && <Tag tone="parameter">{copy.default}</Tag>}
          </span>
          <TrackLine t={t} />
          <Holds t={t} />
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <IconDrillIn className="text-muted-foreground" />
        </span>
      </Link>
      {row.fee && (
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          {copy.feeRow}
          {t.dataset === "pensia-net" && <> {copy.feeRowWhole}</>}:
          <FeeNum value={row.fee} />
        </span>
      )}
      {row.stock && (
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          {copy.stock.row}:
          <StockNum value={row.stock} />
        </span>
      )}
    </div>
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
