// The workbench group and its rows (design-spec 11.3, design-system 7.7): phone cards, PC table, near-duplicate
// banners as on the company page, pages of fifty.
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { company as companyCopy, fit as fitCopy, r3workbench as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { expandFee, feeLabel, feeYear, type SiteValue } from "../../lib/value";
import { referenceValues, sortRows, type SortDir, type SortKey, type WbData, type WorkbenchRow } from "../../lib/workbench";
import { FeeNum } from "../decoder/fees";
import { IconAlert, IconChevronDown, IconClock, IconDrillIn } from "../icons";
import { IconDash, IconHelp, IconOk } from "../compare/icons";
import { Num } from "../provenance";
import { Card, cx, Sentence, Tag } from "../kit";

const PAGE = 50;

/** The fit mark of a row: icon and word, never red (an answer, not a warning). Nothing when the row has no mark. */
function Mark({ w, stale }: { w: WorkbenchRow; stale: boolean }) {
  if (w.outcome === "ineligible") return null;
  if (w.fit === "no-goal") return null;
  const Icon = w.fit === "fits" ? IconOk : w.fit === "no-fit" ? IconDash : IconHelp;
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${fitCopy.rowAria} ${fitCopy.marks[w.fit]}`}>
      <span className={cx("inline-flex items-center gap-1", w.fit === "fits" ? "text-positive" : "text-muted-foreground")}>
        <Icon size={16} />
        <span className="text-xs" aria-hidden="true">
          {fitCopy.marks[w.fit]}
        </span>
      </span>
      {stale && <IconClock size={14} className="text-caution" />}
    </span>
  );
}

function Reason({ w }: { w: WorkbenchRow }) {
  if (w.outcome !== "ineligible" || !w.reason) return null;
  return (
    <span className="text-xs text-muted-foreground">
      <bdi>{w.reason.text}</bdi>
    </span>
  );
}

function fees(data: WbData, w: WorkbenchRow) {
  return { b: expandFee(w.row.b, data.feeTemplate.balance), d: expandFee(w.row.d, data.feeTemplate.deposit) };
}

function PhoneRow({ w, data, showFit }: { w: WorkbenchRow; data: WbData; showFit: boolean }) {
  const f = fees(data, w);
  const whole = data.dataset === "pensia-net";
  const quiet = w.outcome === "ineligible";
  return (
    <div className={cx("track !flex-col !items-stretch !gap-1.5", quiet && "text-muted-foreground")}>
      <Link to={w.company.href} className="text-sm font-medium text-link hover:underline self-start">
        <bdi>{w.company.name}</bdi>
      </Link>
      <Link to={w.track.href} className="flex items-center justify-between gap-3 min-w-0">
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className={cx("font-medium flex flex-wrap items-center gap-2", !quiet && "text-foreground")}>
            <bdi>{w.row.n}</bdi>
            {w.row.def && <Tag tone="parameter">{companyCopy.default}</Tag>}
          </span>
          <span className="text-sm text-muted-foreground">
            {companyCopy.trackLine.fund} <bdi dir="ltr" className="num-id">{w.row.f}</bdi>
            {w.row.sub && (
              <>
                {" · "}
                <bdi>{w.row.sub}</bdi>
              </>
            )}
          </span>
        </span>
        <IconDrillIn className="text-muted-foreground shrink-0" />
      </Link>
      <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {copy.phoneFee.balance} <FeeNum value={f.b} /> · {copy.phoneFee.deposit} <FeeNum value={f.d} />
        {whole && <span className="text-xs">({copy.wholeFund})</span>}
      </span>
      <Reason w={w} />
      {showFit && <Mark w={w} stale={!!data.stale} />}
      <Link to={w.feesHref} className="text-sm text-link hover:underline min-h-target inline-flex items-center self-start">
        {copy.links.fees}
      </Link>
    </div>
  );
}

function FeeCell({ value, whole }: { value: SiteValue; whole: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <FeeNum value={value} size="cell" />
      {whole && <span className="text-xs text-muted-foreground">{copy.wholeFund}</span>}
    </div>
  );
}

function Banner({ resolution }: { resolution: keyof typeof companyCopy.sameName }) {
  return (
    <span className="dup-banner !p-0">
      <IconAlert size={16} className="text-caution shrink-0" />
      {companyCopy.sameName[resolution]}
    </span>
  );
}

interface Unit {
  key: string;
  dup?: number;
  rows: WorkbenchRow[];
}

function unitsOf(rows: WorkbenchRow[]): Unit[] {
  const out: Unit[] = [];
  for (const w of rows) {
    const last = out.at(-1);
    if (w.row.dup !== undefined && last && last.dup === w.row.dup && last.rows[0]!.row.c === w.row.c) last.rows.push(w);
    else out.push({ key: `${w.row.c}:${w.row.f}`, dup: w.row.dup, rows: [w] });
  }
  return out;
}

export function ReferenceLines({ data, groupKey, label }: { data: WbData; groupKey: string; label: string }) {
  const ref = useMemo(() => referenceValues(data, groupKey), [data, groupKey]);
  if (!ref) return null;
  const year = data.feeYear ? feeYear(data.feeYear) : null;
  const line = (r: NonNullable<typeof ref>["management"], lead?: string) =>
    r.mean.value === null ? null : (
      <Sentence size="sm" tone="muted">
        {lead ?? copy.reference.before}
        {!lead && <bdi>{label}</bdi>}
        {!lead && ": "}
        {lead && " "}
        <Num value={r.mean} /> {copy.reference.mid.trimStart()}
        <Num value={r.median} />
        {year ? (
          <>
            {copy.reference.year}
            <bdi dir="ltr">{year}</bdi>
          </>
        ) : (
          ")"
        )}
        {r.count.value === 1 ? (
          copy.reference.fromOne
        ) : (
          <>
            {copy.reference.from}
            <Num value={r.count} />
            {copy.reference.tracks}
          </>
        )}
      </Sentence>
    );
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-border">
      {line(ref.management)}
      {line(ref.deposit, copy.reference.deposit)}
    </div>
  );
}

export function WorkbenchGroup({
  data,
  group,
  label,
  open,
  onToggle,
  rows,
  matching,
  sort,
  dir,
  showFit,
}: {
  data: WbData;
  group: { key: string; count: number };
  label: string;
  open: boolean;
  onToggle: () => void;
  rows: WorkbenchRow[];
  /** With a filter typed: how many of this group's rows match. */
  matching: number | null;
  sort: SortKey;
  dir: SortDir;
  showFit: boolean;
}) {
  const [pages, setPages] = useState(1);
  const sorted = useMemo(() => (open ? sortRows(rows, sort, dir) : []), [open, rows, sort, dir]);
  const shown = sorted.slice(0, pages * PAGE);
  const units = useMemo(() => unitsOf(shown), [shown]);
  const rest = sorted.length - shown.length;
  const year = data.feeYear ? feeYear(data.feeYear) : null;
  const whole = data.dataset === "pensia-net";
  const headId = `wb-g-${group.key || "none"}`;
  const body: ReactNode = (
    <>
      <ReferenceLines data={data} groupKey={group.key} label={label} />
      {sorted.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">0 {copy.group.matching}</p>
      ) : (
        <>
          <div className="lg:hidden flex flex-col">
            {units.map((u) =>
              u.dup !== undefined ? (
                <div key={u.key} role="group" className="dup">
                  <div className="dup-banner">
                    <IconAlert size={16} className="text-caution shrink-0" />
                    {companyCopy.sameName[data.dups[u.dup]!.resolution]}
                  </div>
                  {u.rows.map((w) => (
                    <PhoneRow key={w.row.f} w={w} data={data} showFit={showFit} />
                  ))}
                </div>
              ) : (
                <PhoneRow key={u.key} w={u.rows[0]!} data={data} showFit={showFit} />
              ),
            )}
          </div>
          <div className="hidden lg:block">
            <table className="tbl">
              <thead className="sticky top-16 [@media(max-height:500px)]:static bg-card z-[var(--z-sticky)] shadow-[0_1px_0_var(--border)]">
                <tr>
                  <th scope="col">{copy.columns.company}</th>
                  <th scope="col">{copy.columns.track}</th>
                  <th scope="col">{copy.columns.fund}</th>
                  <th scope="col">{copy.columns.holds}</th>
                  <th scope="col">
                    {feeLabel(copy.columns.balance, year)}
                  </th>
                  <th scope="col">
                    {copy.columns.deposit}
                  </th>
                  {showFit && <th scope="col">{copy.columns.fit}</th>}
                  <th scope="col">{copy.columns.open}</th>
                </tr>
              </thead>
              <tbody>
                {units.flatMap((u) => {
                  const out: ReactNode[] = [];
                  if (u.dup !== undefined)
                    out.push(
                      <tr key={`${u.key}-b`} className="dup-row">
                        <td colSpan={showFit ? 8 : 7} className="!pb-1 !border-b-0 border-s-[3px] border-s-caution">
                          <Banner resolution={data.dups[u.dup]!.resolution} />
                        </td>
                      </tr>,
                    );
                  for (const w of u.rows) {
                    const f = fees(data, w);
                    const quiet = w.outcome === "ineligible";
                    out.push(
                      <tr key={w.row.f} className={cx(u.dup !== undefined && "dup-row", quiet && "text-muted-foreground")}>
                        <td className={cx(u.dup !== undefined && "border-s-[3px] border-s-caution")}>
                          <Link to={w.company.href} className="text-link hover:underline">
                            <bdi>{w.company.name}</bdi>
                          </Link>
                        </td>
                        <td>
                          <Link to={w.track.href} className={cx("font-medium hover:underline", !quiet && "text-foreground")}>
                            <bdi>{w.row.n}</bdi>
                          </Link>{" "}
                          {w.row.def && <Tag tone="parameter">{companyCopy.default}</Tag>}
                          <Reason w={w} />
                        </td>
                        <td>
                          <bdi dir="ltr" className="num-id">{w.row.f}</bdi>
                        </td>
                        <td className="text-muted-foreground">
                          <bdi>{[w.row.sp, w.row.sub && w.row.sub !== w.row.sp ? w.row.sub : ""].filter(Boolean).join(" · ") || "—"}</bdi>
                        </td>
                        <td>
                          <FeeCell value={f.b} whole={whole} />
                        </td>
                        <td>
                          <FeeCell value={f.d} whole={whole} />
                        </td>
                        {showFit && (
                          <td>
                            <Mark w={w} stale={!!data.stale} />
                          </td>
                        )}
                        <td>
                          <span className="inline-flex items-center gap-3 whitespace-nowrap">
                            <Link to={w.feesHref} className="text-sm text-link hover:underline">
                              {copy.links.fees}
                            </Link>
                            <Link to={w.track.href} aria-label={w.row.n} className="inline-flex size-target items-center justify-center -my-2">
                              <IconDrillIn className="text-muted-foreground" />
                            </Link>
                          </span>
                        </td>
                      </tr>,
                    );
                  }
                  return out;
                })}
              </tbody>
            </table>
          </div>
          {sorted.some((w) => w.row.b.value === null || w.row.d.value === null) && <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border">{copy.missingKey}</p>}
          {rest > 0 && (
            <button type="button" onClick={() => setPages((p) => p + 1)} className="w-full min-h-target border-t border-border text-link hover:bg-accent/40">
              {copy.showMore} <bdi dir="ltr">{fmt.number(Math.min(PAGE, rest))}</bdi>
            </button>
          )}
        </>
      )}
    </>
  );
  return (
    <section aria-labelledby={headId} className="flex flex-col">
      <h2 id={headId} className="text-lg lg:text-xl font-semibold">
        <button type="button" aria-expanded={open} onClick={onToggle} className="w-full min-h-12 flex items-center justify-between gap-3 text-start rounded-md">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <bdi>{label}</bdi>
            <span aria-hidden="true">·</span>
            <span>
              {group.count === 1 ? (
                copy.group.one
              ) : group.count === 2 ? (
                copy.group.two
              ) : (
                <>
                  <bdi dir="ltr" className="tabular-nums">{group.count}</bdi> {copy.group.suffix}
                </>
              )}
            </span>
            {matching !== null && (
              <span className="text-sm font-normal text-muted-foreground">
                · {matching === 1 ? (
                  copy.group.matchingOne
                ) : (
                  <>
                    <bdi dir="ltr" className="tabular-nums">{matching}</bdi> {copy.group.matching}
                  </>
                )}
              </span>
            )}
          </span>
          <IconChevronDown className={cx("text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fast)]", open && "rotate-180")} />
        </button>
      </h2>
      {open && <Card className="p-0 md:p-0 overflow-hidden lg:overflow-visible">{body}</Card>}
    </section>
  );
}
