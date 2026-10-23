// Company page components (design-spec 5 as redrawn on 2026-10-23, flows 6.11): track list with
// near-duplicate groups, paste card.
import { useId, type ReactNode } from "react";
import { Link } from "react-router";
import { company as copy } from "../../copy";
import type { Track } from "../../lib/data.server";
import { IconAlert, IconDrillIn, IconSearch } from "../icons";
import { useOpenSearch } from "../shell";
import { Card, cx, Tag } from "../ui";

export type Resolution = "distinct" | "twice" | "unresolved";

export interface TrackRowView {
  track: Track;
  href: string;
  isDefault?: boolean;
}

export interface Group {
  key: string;
  tracks: TrackRowView[];
  /** Same-name tracks: the resolution from the data. */
  dup?: Resolution;
}

/** Rows that share a name are drawn together under one banner; the resolution comes from the data. */
export function groupTracks(rows: TrackRowView[]): Group[] {
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
      out.push({ key: `dup-${r.track.name}`, tracks: list, dup: ids.size === list.length ? "distinct" : ids.size === 1 ? "twice" : "unresolved" });
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

export function TrackList({ groups }: { groups: Group[] }) {
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
      <Card className="hidden md:block p-0 md:p-0 overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col" className="w-1 !p-0">
                <span className="sr-only">{copy.pcColumns.group}</span>
              </th>
              <th scope="col">{copy.pcColumns.name}</th>
              <th scope="col">{copy.pcColumns.fund}</th>
              <th scope="col">{copy.pcColumns.classification}</th>
              <th scope="col">{copy.pcColumns.holds}</th>
              <th scope="col" className="w-10">
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
                    <td className="dup-bar" />
                    <td colSpan={5} className="!pb-1 !border-b-0">
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
                    <td className={cx("!p-0", g.dup && "dup-bar")} />
                    <td>
                      <Link to={r.href} className="font-medium hover:underline">
                        <bdi>{r.track.name}</bdi>
                      </Link>{" "}
                      {r.isDefault && <Tag tone="parameter">{copy.default}</Tag>}
                    </td>
                    <td>
                      <bdi dir="ltr" className="num-id">{r.track.fundId}</bdi>
                    </td>
                    <td>{r.track.specialization}</td>
                    <td className="text-muted-foreground">
                      <bdi>{r.track.subSpecialization}</bdi>
                    </td>
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
      </Card>
    </>
  );
}

function TrackRow({ row }: { row: TrackRowView }) {
  const { track: t } = row;
  return (
    <Link to={row.href} className="track">
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium flex flex-wrap items-center gap-2">
          <bdi>{t.name}</bdi>
          {row.isDefault && <Tag tone="parameter">{copy.default}</Tag>}
        </span>
        <TrackLine t={t} />
        <Holds t={t} />
      </span>
      <IconDrillIn className="text-muted-foreground shrink-0" />
    </Link>
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
        <input id={id} dir="auto" placeholder={copy.paste.placeholder} className="field-input !text-start" onChange={(e) => e.target.value && open(e.currentTarget, e.target.value)} onFocus={(e) => e.target.value && open(e.currentTarget, e.target.value)} />
      </div>
    </Card>
  );
}
