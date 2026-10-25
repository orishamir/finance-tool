// The ranked list and what sits beside it (design-system 6.3, design-spec 6.3): ranked row, listed row,
// the part kept available, outcome tags, and the row animation when the order changes.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ownTermsCopy, r2, r3fees, scnCompare, values as valuesCopy } from "../../copy";
import { addMonths, decidingFormulaOf, depositRangeFlag, feeShieldPair, providerOutcomes, workbenchHref, type CoverageRow, type ListedOption, type ProviderOutcome, type RankedOption } from "../../lib/compare";
import { fmt } from "../../lib/format";
import { playbookWrappers } from "../../lib/playbook";
import { NumberField } from "../timeline/fields";
import { Tpl } from "../exposure-mode/tpl";
import { IconAlert, IconDrillIn, IconLock } from "../icons";
import { durationChart, Num, StateTag } from "../provenance";
import { Button, Tag, cx } from "../ui";
import type { ResultCtx } from "./ctx";
import { IconBan, IconDash, IconDashed, IconEdit, IconEqual, IconOk } from "./icons";
import { ReasonLines } from "./reasons";
import { Representative } from "./representative";
import { FeeShieldNote } from "./why";

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

export function RankedRow({ o, above, ctx, onDetail, extra, choose, chosen }: { o: RankedOption; above?: RankedOption; ctx: ResultCtx; onDetail: (el: HTMLElement) => void; /** A tag after the row's own (release 5: "לא מחזיק {חשיפה}"). */ extra?: ReactNode; /** The "בחרתי בזה" button (release 5). */ choose?: ReactNode; /** This is the option the person chose: the next steps open under it (A14). */ chosen?: boolean }) {
  const { mk, view, mode } = ctx;
  const value = mode === "real" ? o.real : o.nominal;
  const figure = mk.nis(value, mode === "real" ? "F-06" : "F-09", mode === "real" ? r2.realLabel : r2.nominalLabel, o, o.enteredFee ? { [ownTermsCopy.feeAbout]: o.enteredFee } : undefined);
  const names = view.names;
  const tied = o.tiedWith.length > 0;
  const stale = o.staleRules[0];
  const deciding = o.deciding && above ? o.deciding : null;
  const wrapperEntry = ctx.bundle.wrappers.find((x) => x.id === o.id);
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
          {r2.result.decidingLine} {r2.deciding[deciding.formula]}, <Num value={mk.nis(deciding.mine, decidingFormulaOf(deciding.formula), r2.deciding[deciding.formula]!, o)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(deciding.above, decidingFormulaOf(deciding.formula), r2.deciding[deciding.formula]!, above!)} />
          {deciding.formula === "tax-at-exit" && (() => {
            const shield = feeShieldPair(ctx.bundle, o, above!);
            return shield ? <>.<FeeShieldNote shield={shield} /></> : null;
          })()}
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
      {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
      <AssumptionRow o={o} ctx={ctx} />
      {wrapperEntry && <Representative w={wrapperEntry} g={ctx.g} today={ctx.bundle.runDate} {...(ctx.setOwnFee ? { onFee: ctx.setOwnFee } : {})} {...(ctx.setOwnRate ? { onRate: ctx.setOwnRate } : {})} {...(ctx.setOwnProvider ? { onProvider: ctx.setOwnProvider, outcomes: () => providerOutcomes(ctx.bundle, ctx.g, o.id), figureOf: (p: ProviderOutcome) => mk.nis(Math.round(mode === "real" ? p.real : p.nominal), mode === "real" ? "F-06" : "F-09", mode === "real" ? r2.realLabel : r2.nominalLabel, p.run) } : {})} {...(ctx.index && o.id === ctx.index.wrapperId ? { index: ctx.index.card } : {})} />}
      <DepositRange o={o} ctx={ctx} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link to={`/fees?wrapper=${o.id}&from=compare`} className="text-sm text-link hover:underline self-start min-h-target inline-flex items-center">
          {r3fees.links.fromResult}
        </Link>
        {choose}
      </div>
      {chosen && <ChosenNext id={o.id} />}
    </li>
  );
}

/** A14: what to do after "בחרתי בזה": pick the company and track, how to join or switch, what the fees cost. */
function ChosenNext({ id }: { id: string }) {
  const c = r2.result.chosenNext;
  const pick = workbenchHref(id);
  const join = playbookWrappers.includes(id) ? `/switch/${id}` : null;
  const links: { href: string; label: string }[] = [];
  if (pick) links.push({ href: pick, label: c.pick });
  if (join) links.push({ href: join, label: c.join });
  links.push({ href: `/fees?wrapper=${id}&from=compare`, label: c.fees });
  return (
    <div className="rounded-md bg-secondary p-3 flex flex-col gap-1" data-chosen-next>
      <span className="text-sm font-medium">{c.heading}</span>
      <ol className="flex flex-col gap-0.5 text-sm list-decimal ps-5">
        {links.map((l) => (
          <li key={l.href}>
            <Link to={l.href} className="text-link hover:underline min-h-9 inline-flex items-center">
              {l.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A8: a deposit's published rate was read for another amount; the person may enter the rate the bank offers them. */
function DepositRange({ o, ctx }: { o: RankedOption; ctx: ResultCtx }) {
  const w = ctx.bundle.wrappers.find((x) => x.id === o.id);
  const own = ctx.g.ownRates?.[o.id];
  const flag = w ? depositRangeFlag(w, ctx.g) : null;
  const [open, setOpen] = useState(false);
  const t = r2.result.depositRange;
  if (!w || (!flag && own === undefined)) return null;
  const showField = open || own !== undefined;
  return (
    <div className="flex flex-col gap-2 text-sm" data-deposit-range>
      {flag && (
        <p className="text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-1" />
          <span>
            {flag.max ? <Tpl t={t.between} vars={{ min: <Num value={flag.min} />, max: <Num value={flag.max} /> }} /> : <Tpl t={t.from} vars={{ min: <Num value={flag.min} /> }} />} {flag.side === "below" ? t.below : t.above}
          </span>
        </p>
      )}
      {showField ? (
        <div className="flex flex-col gap-1.5 max-w-xs">
          <NumberField
            label={t.ownLabel}
            unit="pct_per_year"
            value={own ?? null}
            isEntered={own !== undefined}
            validate={(n) => (n < 0 || n > 50 ? `${valuesCopy.errors.pct[0]} 0 ${valuesCopy.errors.pct[1]}50.` : null)}
            onCommit={(n) => ctx.setOwnRate?.(o.id, n)}
            onReset={() => ctx.setOwnRate?.(o.id, undefined)}
            optional
          />
          {own !== undefined && (
            <Button variant="quiet" className="self-start -ms-2 text-sm min-h-9" onClick={() => (ctx.setOwnRate?.(o.id, undefined), setOpen(false))}>
              {t.reset}
            </Button>
          )}
        </div>
      ) : (
        <Button variant="quiet" className="self-start -ms-2 text-sm min-h-9" onClick={() => setOpen(true)}>
          {t.own}
        </Button>
      )}
    </div>
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
  // a listed option shows no headline figure beside the ranked ones (scenario fix 2026-10-24): "לא מדורג" and its reason; the run stays in its detail
  const blocked = o.blockedBy.length > 0;
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
      <p>
        <Tag tone="neutral" icon={<IconDash size={14} />}>
          {scnCompare.notRanked}
        </Tag>
      </p>
      <p className="text-sm">
        <ReasonLines row={o} ctx={ctx} />
      </p>
      {o.value && (
        <Link to={`/fees?wrapper=${o.id}&from=compare`} className="text-sm text-link hover:underline self-start min-h-target inline-flex items-center">
          {r3fees.links.fromResult}
        </Link>
      )}
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
