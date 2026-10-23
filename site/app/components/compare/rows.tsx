// The ranked list and what sits beside it (design-system 6.3, design-spec 6.3): ranked row, listed row,
// the part kept available, outcome tags, and the row animation when the order changes.
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { r2 } from "../../copy";
import { addMonths, type CoverageRow, type ListedOption, type RankedOption } from "../../lib/compare";
import { fmt } from "../../lib/format";
import { IconAlert, IconDrillIn, IconLock } from "../icons";
import { durationChart, Num, StateTag } from "../provenance";
import { Tag, cx } from "../ui";
import type { ResultCtx } from "./ctx";
import { IconBan, IconDash, IconDashed, IconEdit, IconEqual, IconOk } from "./icons";
import { ReasonLines } from "./reasons";

// ---------------------------------------------------------------- outcome tag

/** Word, icon and colour for each of the five outcomes (design-system 6.3); colour is never alone. */
export function OutcomeTag({ kind, blocked, fixableByPerson }: { kind: CoverageRow["kind"]; blocked?: boolean; fixableByPerson?: boolean }) {
  const word = r2.outcomes[kind]!;
  switch (kind) {
    case "ranked":
      return <Tag tone="positive" icon={<IconOk size={14} />}>{word}</Tag>;
    case "listed-not-ranked":
      return blocked ? <Tag tone="blocked" icon={<IconLock size={14} />}>{word}</Tag> : <Tag tone="neutral" icon={<IconDash size={14} />}>{word}</Tag>;
    case "excluded":
      return <Tag tone="entered" icon={<IconEdit size={14} />}>{word}</Tag>;
    case "not-eligible":
      return <Tag tone="neutral" icon={<IconBan size={14} />}>{word}</Tag>;
    case "not-evaluated":
      return fixableByPerson ? <Tag tone="neutral" icon={<IconDashed size={14} />}>{word}</Tag> : <Tag tone="caution" icon={<IconDashed size={14} />}>{word}</Tag>;
  }
}

// ---------------------------------------------------------------- row animation

/** Rows slide to their new places over --duration-chart when the order changes (FLIP); nothing with reduced motion. */
export function useFlip(order: string) {
  const ref = useRef<HTMLOListElement>(null);
  const prev = useRef<Map<string, DOMRect>>(new Map());
  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const ms = durationChart();
    const next = new Map<string, DOMRect>();
    list.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
      const id = el.dataset.flip!;
      const rect = el.getBoundingClientRect();
      next.set(id, rect);
      const was = prev.current.get(id);
      if (ms > 0 && was && Math.abs(was.top - rect.top) > 1) el.animate([{ transform: `translateY(${was.top - rect.top}px)` }, { transform: "none" }], { duration: ms, easing: "cubic-bezier(0.2, 0, 0, 1)" });
    });
    prev.current = next;
  }, [order]);
  return ref;
}

// ---------------------------------------------------------------- ranked row

export function RankedRow({ o, above, ctx, onDetail }: { o: RankedOption; above?: RankedOption; ctx: ResultCtx; onDetail: (el: HTMLElement) => void }) {
  const { mk, view, mode } = ctx;
  const value = mode === "real" ? o.real : o.nominal;
  const figure = mk.nis(value, mode === "real" ? "F-06" : "F-09", mode === "real" ? r2.realLabel : r2.nominalLabel, o);
  const names = view.names;
  const tied = o.tiedWith.length > 0;
  const stale = o.staleRules[0];
  const deciding = o.deciding && above ? o.deciding : null;
  return (
    <li data-flip={o.id} data-tied={tied ? "" : undefined} className={cx("bg-card border border-border rounded-lg p-4 md:p-6 flex flex-col gap-3", tied && "border-s-[3px] border-s-chart-marker")}>
      <div className="flex items-start gap-3">
        <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold mt-0.5", o.rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={`${r2.result.rank} ${o.rank}`}>
          {o.rank}
        </span>
        <h3 className="text-lg font-semibold flex-1 min-w-0">
          <Link to={`/guide/${o.id}`} className="text-link hover:underline">
            {o.name}
          </Link>
        </h3>
        <button type="button" aria-label={r2.result.detail} onClick={(e) => onDetail(e.currentTarget)} className="size-target -me-2 -mt-1.5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
          <IconDrillIn />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="figure">
            <Num value={figure} size="figure" animate />
          </span>
          <StateTag state="computed" />
        </div>
        <span className="text-sm text-muted-foreground">{mode === "real" ? r2.realLabel : r2.nominalLabel}</span>
      </div>
      {(tied || o.secondaryRules.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {tied && (
            <Tag tone="parameter" icon={<IconEqual size={14} className="shrink-0" />} className="!whitespace-normal max-w-full min-w-0 items-start [overflow-wrap:anywhere] [&>svg]:mt-0.5">
              {o.tiedWith.length === 1 ? `${r2.tieOne}${names[o.tiedWith[0]!] ?? o.tiedWith[0]}` : `${r2.tieMany} ${o.tiedWith.map((id) => names[id] ?? id).join(", ")}`}
            </Tag>
          )}
          {o.secondaryRules.length > 0 && (
            <Tag tone="caution" icon={<IconAlert size={14} />}>
              {r2.result.secondaryTag}
            </Tag>
          )}
        </div>
      )}
      {deciding && (
        <p className="text-sm text-muted-foreground">
          {r2.result.decidingLine} {r2.deciding[deciding.formula]}, <Num value={mk.nis(deciding.mine, "F-61", r2.deciding[deciding.formula]!, o)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(deciding.above, "F-61", r2.deciding[deciding.formula]!, above!)} />
        </p>
      )}
      {stale && (
        <p className="text-sm text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-1" />
          <span>
            {r2.result.staleRow} <bdi dir="ltr">{fmt.date(stale.since)}</bdi>.
          </span>
        </p>
      )}
      <AssumptionRow o={o} ctx={ctx} />
    </li>
  );
}

/** The assumptions a row rests on, read-only chips; a tap on one of the goal's opens it for editing. */
function AssumptionRow({ o, ctx }: { o: RankedOption; ctx: ResultCtx }) {
  return (
    <ul aria-label={r2.result.assumptionsOf} className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {o.chips.map((c) => (
        <li key={c.key} className="inline-flex items-center gap-1.5">
          {c.field ? (
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => ctx.openField(c.field!)}>
              {c.label}
            </button>
          ) : (
            <span className="text-muted-foreground">{c.label}</span>
          )}
          <Num value={c.value} size="cell" display={c.display} />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- listed row

export function ListedRow({ o, ctx, onDetail }: { o: ListedOption; ctx: ResultCtx; onDetail: (el: HTMLElement) => void }) {
  const { mk } = ctx;
  const blocked = o.blockedBy.length > 0;
  let value: ReactNode = null;
  if (o.value) {
    const label = o.value.kind === "pre-tax" ? r2.result.listedValuePreTax : o.value.kind === "unlock" ? r2.result.listedValueUnlock : r2.realLabel;
    const v = mk.nis(o.value.real, "F-06", label, { usedRules: o.usedRules });
    value = (
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-semibold">
          <Num value={v} />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }
  return (
    <li className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="size-7 shrink-0 inline-flex items-center justify-center text-muted-foreground mt-0.5" aria-hidden="true">
          {blocked ? <IconLock size={18} className="text-blocked" /> : <IconDash size={18} />}
        </span>
        <h3 className="text-base font-medium flex-1 min-w-0">
          <Link to={`/guide/${o.id}`} className="hover:underline">
            {o.name}
          </Link>
        </h3>
        {o.value && (
          <button type="button" aria-label={r2.result.detail} onClick={(e) => onDetail(e.currentTarget)} className="size-target -me-2 -mt-1.5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
            <IconDrillIn />
          </button>
        )}
      </div>
      <p className="text-sm">
        <ReasonLines row={o} ctx={ctx} />
      </p>
      {value}
    </li>
  );
}

// ---------------------------------------------------------------- the part kept available

export function AvailableCard({ ctx }: { ctx: ResultCtx }) {
  const k = ctx.view.kept;
  if (!k || k.amount <= 0) return null;
  const { mk } = ctx;
  const kept = mk.goal.available;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <Num value={kept} /> {r2.result.availableMid} {r2.result.availableIn[k.where]}{" "}
      {k.real !== null ? (
        <>
          {r2.result.availableWorth} <Num value={mk.nis(k.real, "F-06", r2.result.availableIn[k.where]!, k.run ? { usedRules: k.run.rules, flags: k.run.flags } : undefined)} /> {r2.result.availableAt}
        </>
      ) : (
        r2.result.availableNoRun
      )}
    </div>
  );
}

export { addMonths };
