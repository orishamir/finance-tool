// The exposure row (design-spec 21.3, design-system 9.2): the ranked row of release 2 with the inputs strip added,
// in its ranked, listed, excluded and not-evaluated forms. Every ranked or listed row carries the label of the
// return it ran at.
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { r2, r5 } from "../../copy";
import { decidingFormulaOf } from "../../lib/compare";
import type { ExposureRowView } from "../../lib/exposure-mode";
import { IconDrillIn, IconLock } from "../icons";
import { IconDash, IconDashed, IconEdit, IconEqual } from "../compare/icons";
import { durationChart, Num, StateTag } from "../provenance";
import { Tag, cx } from "../ui";
import type { ExpCtx } from "./ctx";
import { AcceptedFallChip, CashRateLine, EnteredReturnField, ExclusionTag, HoldingWrapperChips, LossNote, ReturnLabel, WorstFallField } from "./fields";
import { ExposureReason } from "./reason";
import { Tpl } from "./tpl";

/** Rows slide to their new places over --duration-chart when the order or the group changes (FLIP); nothing with reduced motion. */
export function useFlipList(order: string) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<Map<string, DOMRect>>(new Map());
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ms = durationChart();
    const next = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
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

function Mark({ row }: { row: ExposureRowView }) {
  if (row.kind === "ranked")
    return (
      <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold mt-0.5", row.rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={`${r5.exposure.rank} ${row.rank}`}>
        {row.rank}
      </span>
    );
  const Icon = row.kind === "excluded" ? IconEdit : row.kind === "not-evaluated" ? IconDashed : IconDash;
  const blocked = row.kind === "listed-not-ranked" && row.reasons.some((r) => r.code === "engine" && r.reason.code === "exit-blocked");
  return (
    <span className="size-7 shrink-0 inline-flex items-center justify-center text-muted-foreground mt-0.5" aria-hidden="true">
      {blocked ? <IconLock size={18} className="text-blocked" /> : <Icon size={18} className={row.kind === "excluded" ? "text-entered" : undefined} />}
    </span>
  );
}

export function InputsStrip({ row, ctx }: { row: ExposureRowView; ctx: ExpCtx }) {
  const id = row.id;
  return (
    <div className="bg-secondary rounded-md p-3 grid gap-4 sm:grid-cols-2 items-start">
      {row.entry.record.cash_like ? (
        <CashRateLine row={row} cashLink={ctx.bundle.cashLink} range={ctx.range} onChange={(v) => ctx.setInput(id, { return: v })} />
      ) : (
        <EnteredReturnField entry={row.entry} value={row.enteredReturn} range={ctx.range} {...(row.returnFromProduct ? { fromProduct: row.returnFromProduct } : {})} onChange={(v) => ctx.setInput(id, { return: v })} />
      )}
      <WorstFallField entry={row.entry} value={row.worstFall} onChange={(v) => ctx.setInput(id, { worstFall: v })} />
      <AcceptedFallChip row={row} onChange={(v) => ctx.setInput(id, { acceptedFall: v })} />
      <HoldingWrapperChips row={row} onChange={(w) => ctx.setInput(id, { wrapperId: w as never })} />
    </div>
  );
}

export function ExposureRow({ row, ctx, above, onDetail, choose }: { row: ExposureRowView; ctx: ExpCtx; above?: ExposureRowView; onDetail?: (el: HTMLElement) => void; choose?: ReactNode }) {
  const { mk, mode, names } = ctx;
  const ranked = row.kind === "ranked";
  const hasValue = row.real !== undefined;
  const value = hasValue ? mk.nis(mode === "real" ? row.real! : row.nominal!, mode === "real" ? "F-06" : "F-09", mode === "real" ? r2.realLabel : r2.nominalLabel, row.run ? { usedRules: row.run.rules, flags: row.run.flags } : undefined) : null;
  const tied = row.tiedWith.length > 0;
  const f = row.deciding;
  return (
    <div data-flip={row.id} className={cx("bg-card border border-border rounded-lg p-4 md:p-6 flex flex-col gap-3", tied && "border-s-[3px] border-s-chart-marker", !ranked && "bg-card/70")}>
      <div className="flex items-start gap-3">
        <Mark row={row} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className={cx("font-semibold", ranked ? "text-lg" : "text-base")}>
            <Link to={row.entry.guideHref} className="text-link hover:underline">
              <bdi>{row.entry.name}</bdi>
            </Link>
          </h3>
          {row.entry.oneLine && <p className="text-sm text-muted-foreground">{row.entry.oneLine}</p>}
        </div>
        {onDetail && hasValue && (
          <button type="button" aria-label={r5.exposure.detail} onClick={(e) => onDetail(e.currentTarget)} className="size-target -me-2 -mt-1.5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
            <IconDrillIn />
          </button>
        )}
      </div>

      {row.kind === "excluded" && row.exclusion && (
        <div className="flex flex-col gap-1">
          <span>
            <ExclusionTag worst={row.exclusion.worst} accepted={row.exclusion.accepted} />
          </span>
          <p className="text-sm text-muted-foreground">{r5.exposure.notes.excludedLine}</p>
        </div>
      )}

      <InputsStrip row={row} ctx={ctx} />

      {hasValue && value && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="figure">
              <Num value={value} size="figure" animate />
            </span>
            <StateTag state="computed" />
          </div>
          <span className="text-sm text-muted-foreground">{mode === "real" ? r5.exposure.valueLabel : r5.exposure.valueLabelNominal}</span>
        </div>
      )}

      {(ranked || row.kind === "listed-not-ranked") && (
        <div className="flex flex-wrap items-center gap-2">
          <ReturnLabel row={row} />
          {tied && (
            <Tag tone="parameter" icon={<IconEqual size={14} className="shrink-0" />} className="!whitespace-normal max-w-full min-w-0 items-start [overflow-wrap:anywhere] [&>svg]:mt-0.5">
              {row.tiedWith.length === 1 ? `${r2.tieOne}${names[row.tiedWith[0]!] ?? row.tiedWith[0]}` : `${r2.tieMany} ${row.tiedWith.map((x) => names[x] ?? x).join(", ")}`}
            </Tag>
          )}
        </div>
      )}

      {row.lossNote && <LossNote missing={row.lossNote} href={row.lossNote === "largest-fall-accepted" ? "/goal" : undefined} />}

      {ranked && f && above && !tied && (
        <p className="text-sm text-muted-foreground">
          {r2.result.decidingLine} {r2.deciding[f.formula]}, <Num value={mk.nis(f.mine, decidingFormulaOf(f.formula), r2.deciding[f.formula]!, row.run ? { usedRules: row.run.rules } : undefined)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(f.above, decidingFormulaOf(f.formula), r2.deciding[f.formula]!, above.run ? { usedRules: above.run.rules } : undefined)} />
        </p>
      )}

      {row.kind !== "ranked" && row.kind !== "excluded" && row.reasons.length > 0 && (
        <p className="text-sm">
          <ExposureReason row={row} ctx={ctx} />
        </p>
      )}

      {row.passed && ranked && (
        <p className="text-xs text-muted-foreground">
          <Tpl t={row.passed.worst === row.passed.accepted ? r5.exposure.notes.passedEqual : r5.exposure.notes.passed} vars={{ worst: <bdi dir="ltr" className="text-entered">{row.passed.worst}%</bdi>, accepted: <bdi dir="ltr" className="text-entered">{row.passed.accepted}%</bdi> }} />
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {row.grossReturn ? (
          <Link to={`/goal/compare?mode=wrapper&exposure=${row.id}`} className="text-sm text-link hover:underline min-h-target inline-flex items-center">
            {r5.exposure.links.holdIt}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground min-h-target inline-flex items-center">{r5.exposure.links.holdItNoReturn}</span>
        )}
        {row.entry.variantsHref && (
          <Link to={row.entry.variantsHref} className="text-sm text-link hover:underline min-h-target inline-flex items-center">
            {r5.exposure.links.buyFund}
          </Link>
        )}
        {ranked && choose}
      </div>
    </div>
  );
}
