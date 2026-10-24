// The exposure result page's body (design-spec 22, flows 34 and 35): the mode tabs, the revisit banner, the qualified
// headline, the exposure rows in their four groups, the chart, the coverage line over every exposure, the checklist,
// the save button. Every figure on it is the person's entry, a published bank rate, or the run's computed value.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { decompose, relativeGap } from "@finance-tool/engine";
import type { RuleRecord } from "@finance-tool/schema";
import { r2, r5, system } from "../../copy";
import { AssumptionChips, AssumptionsPanel } from "../compare/assumptions";
import type { FormData } from "../compare/goal-form";
import { goalTitle } from "../compare/goal-form";
import { DimensionChecklist, type ChecklistRowView } from "../guide/sections";
import { Num, RulesLine } from "../provenance";
import { Sheet } from "../Sheet";
import { Callout, Card, Disclosure, SegmentedControl, Tag } from "../ui";
import { ChooseButton, RevisitBanner, SaveComparisonButton, UnreadableSavedForm, WhatChangedSheet } from "../revisit/revisit";
import { forgetRevisit, useRevisit } from "../revisit/use-revisit";
import { computed } from "../../lib/value";
import { makeValues, runGoalOf, type CompareBundle } from "../../lib/compare";
import { computeExposureMode, type ExposureResultView, type ExposureRowView } from "../../lib/exposure-mode";
import { fmt } from "../../lib/format";
import { useGoals, type FieldKey } from "../../lib/goal";
import { snapshotExposure } from "../../lib/revisit";
import { deleteSavedComparison, isoToday, saveComparisonRecord, type CompareMode } from "../../lib/state";
import { ExposureChartCard } from "./chart";
import type { ExpCtx, Mode } from "./ctx";
import { ExposureRow, useFlipList } from "./row";
import { ExposureReason } from "./reason";
import { Tpl } from "./tpl";
import { IconDash, IconDashed, IconEdit, IconOk } from "../compare/icons";
import { IconChevronDown } from "../icons";

// ---------------------------------------------------------------- the mode tabs

/** The two tabs under the strip: the same saved goal, the same money (design-system 9.1). Sticky under the header on a phone. */
export function ModeTabs({ mode, exposureId }: { mode: CompareMode; exposureId?: string | null }) {
  const navigate = useNavigate();
  void exposureId;
  return (
    <div className="flex flex-col gap-2 sticky top-14 lg:static z-[var(--z-sticky)] -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 bg-background/90 backdrop-blur lg:bg-transparent lg:backdrop-blur-none">
      <SegmentedControl<CompareMode> label={r5.mode.aria} options={[{ value: "wrapper", label: r5.mode.names.wrapper }, { value: "exposure", label: r5.mode.names.exposure }]} value={mode} onChange={(m) => navigate(m === "exposure" ? "/goal/compare?mode=exposure" : "/goal/compare", { replace: true })} />
      <p className="text-sm text-muted-foreground">{r5.mode.lede[mode]}</p>
    </div>
  );
}

// ---------------------------------------------------------------- headline

const joinNames = (items: ReactNode[]): ReactNode => items.map((n, i) => <span key={i}>{i > 0 && (i === items.length - 1 ? " ו" : ", ")}{n}</span>);

function NameLink({ row }: { row: ExposureRowView }) {
  return (
    <Link to={row.entry.guideHref} className="text-link font-medium hover:underline">
      <bdi>{row.entry.name}</bdi>
    </Link>
  );
}

export function ExposureHeadline({ ctx, onWhy }: { ctx: ExpCtx; onWhy: (el: HTMLElement) => void }) {
  const { view, mk, g } = ctx;
  const h = view.headline;
  const top = h.winner;
  const second = view.ranked[1];
  const theta = mk.pct(view.theta * 100, "F-80", r2.result.tieMid);
  const hl = r5.exposure.headline;
  let body: ReactNode = null;
  let showWhy = true;
  switch (h.kind) {
    case "no-return":
    case "all-excluded":
    case "none":
      return null;
    case "single":
      body = <Tpl t={hl.single} vars={{ exposure: <NameLink row={top!} /> }} />;
      showWhy = false;
      break;
    case "all-tied":
      body = hl.allTied;
      break;
    case "tie": {
      const tied = view.ranked.filter((r) => h.topTie.includes(r.id));
      const gap = relativeGap(tied[0]!.real!, tied[tied.length - 1]!.real!) * 100;
      const gapNum = <Num value={mk.pct(gap, "F-80", r2.result.tieMid)} />;
      body =
        tied.length === 2 ? (
          <Tpl t={hl.tie} vars={{ a: <NameLink row={tied[0]!} />, b: <NameLink row={tied[1]!} />, gap: gapNum, theta: <Num value={theta} /> }} />
        ) : (
          <Tpl t={hl.tieMany} vars={{ names: joinNames(tied.map((r) => <NameLink key={r.id} row={r} />)), gap: gapNum, theta: <Num value={theta} /> }} />
        );
      break;
    }
    case "winner": {
      const d = view.comparison.ranking.topTwo?.deciding;
      const f = d?.formula ?? null;
      let reason: ReactNode = null;
      if (d && f && d.gaps[f] > 0 && second) {
        if (f === "fee-drag") reason = <>{r2.result.reasonFee} <Num value={mk.nis(d.top.feeDrag, "F-61", r2.deciding["fee-drag"]!, top!.run && { usedRules: top!.run.rules })} /> {r2.result.reasonFeeVs} <Num value={mk.nis(d.second.feeDrag, "F-61", r2.deciding["fee-drag"]!, second.run && { usedRules: second.run.rules })} /> {r2.result.reasonFeeIn}<Num value={mk.goal.horizon} display={fmt.years(g.horizonYears)} /></>;
        else if (f === "tax-at-exit") reason = <>{r2.result.reasonTax} <Num value={mk.nis(d.top.taxAtExit, "F-40", r2.deciding["tax-at-exit"]!, top!.run && { usedRules: top!.run.rules })} /> {r2.result.reasonFeeVs} <Num value={mk.nis(d.second.taxAtExit, "F-40", r2.deciding["tax-at-exit"]!, second.run && { usedRules: second.run.rules })} /></>;
        else if (f === "deposit-side-relief") reason = <>{r2.result.reasonRelief} <Num value={mk.nis(-d.top.depositSideRelief, "F-30", r2.deciding["deposit-side-relief"]!, top!.run && { usedRules: top!.run.rules })} /> {r2.result.reasonFeeVs} <Num value={mk.nis(-d.second.depositSideRelief, "F-30", r2.deciding["deposit-side-relief"]!, second.run && { usedRules: second.run.rules })} /></>;
      }
      body = reason ? <Tpl t={h.sourcedWinner ? hl.sourcedCash : hl.reason} vars={{ exposure: <NameLink row={top!} />, reason }} /> : <Tpl t={h.sourcedWinner ? hl.bareSourced : hl.bare} vars={{ exposure: <NameLink row={top!} /> }} />;
      break;
    }
  }
  return (
    <div className="flex flex-col gap-2 max-w-measure">
      <p className="text-lg">{body}</p>
      {showWhy && view.ranked.length > 1 && (
        <button type="button" onClick={(e) => onWhy(e.currentTarget)} className="text-link min-h-target self-start px-2 -ms-2 rounded-md hover:underline">
          {r2.result.why}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- sheets

const breakdownLabels = r2.result.whyRows;

function breakdownOf(ctx: ExpCtx, row: ExposureRowView) {
  const c = row.candidate;
  const d = decompose(c.plan!, c.run!, view_ctx(ctx));
  const run = c.run!;
  const idx = run.real === 0 ? 1 : run.nominal / run.real;
  return { relief: -d.depositSideRelief, fees: d.feeDrag, taxDuring: run.taxDuring / idx, taxExit: run.taxAtExit / idx, lockUp: d.lockUp, result: run.real };
}
const view_ctx = (ctx: ExpCtx) => ctx.view.ctx;

function BreakdownTable({ ctx, rows }: { ctx: ExpCtx; rows: ExposureRowView[] }) {
  const b = rows.map((r) => breakdownOf(ctx, r));
  const keys = ["relief", "fees", "taxDuring", "taxExit", "lockUp", "result"] as const;
  return (
    <table className="tbl text-sm">
      <thead>
        <tr>
          <th scope="col" />
          {rows.map((r) => (
            <th key={r.id} scope="col">
              <bdi>{r.entry.name}</bdi>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {keys.map((k) => (
          <tr key={k}>
            <th scope="row">{breakdownLabels[k]}</th>
            {rows.map((r, i) => (
              <td key={r.id}>
                <Num size="cell" value={ctx.mk.nis(b[i]![k], "F-06", breakdownLabels[k], r.run && { usedRules: r.run.rules })} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailBody({ ctx, row, headId }: { ctx: ExpCtx; row: ExposureRowView; headId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        <bdi>{row.entry.name}</bdi>
      </h2>
      {row.run && row.candidate.plan && <BreakdownTable ctx={ctx} rows={[row]} />}
      {row.passed && (
        <p className="text-sm">
          <Tpl t={row.passed.worst === row.passed.accepted ? r5.exposure.notes.passedEqual : r5.exposure.notes.passed} vars={{ worst: <bdi dir="ltr" className="text-entered">{row.passed.worst}%</bdi>, accepted: <bdi dir="ltr" className="text-entered">{row.passed.accepted}%</bdi> }} />
        </p>
      )}
      {row.reasons.length > 0 && row.kind !== "ranked" && (
        <p className="text-sm">
          <ExposureReason row={row} ctx={ctx} />
        </p>
      )}
      {row.run && <RulesLine ids={row.run.rules.map((u) => u.id)} />}
    </div>
  );
}

function WhyBody({ ctx, headId }: { ctx: ExpCtx; headId: string }) {
  const [a, b] = ctx.view.ranked;
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        {r2.result.whyTitle}
      </h2>
      {a && b && a.candidate.plan && b.candidate.plan && <BreakdownTable ctx={ctx} rows={[a, b]} />}
    </div>
  );
}

// ---------------------------------------------------------------- coverage

const kinds = ["not-eligible", "excluded", "not-evaluated", "listed-not-ranked", "ranked"] as const;

function ExposureCoverage({ ctx, open }: { ctx: ExpCtx; open: boolean }) {
  const { view, mk } = ctx;
  const cov = view.comparison.coverage;
  const c = r5.exposure.coverage;
  const count = (k: (typeof kinds)[number]) => <Num value={mk.count(cov.counts[k], c.groups[k]!)} animate />;
  const notEligible = cov.counts["not-eligible"];
  return (
    <details className="group bg-card border border-border rounded-lg p-4 md:p-6" open={open} key={String(open)}>
      <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-1">
          <span>
            <Tpl
              t={c.sentence}
              vars={{ n: <Num value={mk.count(cov.considered, c.sentence)} animate />, ranked: count("ranked"), listed: count("listed-not-ranked"), excluded: count("excluded"), notEvaluated: count("not-evaluated") }}
            />
            {notEligible > 0 && <Tpl t={c.notEligible} vars={{ n: count("not-eligible") }} />}
          </span>
          <span className="text-sm text-link flex items-center gap-1 min-h-9">
            <span className="group-open:hidden">{r2.result.coverageOpen}</span>
            <span className="hidden group-open:inline">{r2.result.coverageClose}</span>
            <IconChevronDown size={16} className="transition-transform duration-[var(--duration-fast)] group-open:rotate-180" />
          </span>
        </span>
      </summary>
      <div className="mt-4 border-t border-border pt-4 flex flex-col gap-5">
        {kinds.map((k) => {
          const list = view.rows.filter((r) => r.kind === k);
          if (list.length === 0) return null;
          return (
            <section key={k} className="flex flex-col gap-1">
              <h4 className="font-medium">
                {c.groups[k]} <span className="text-muted-foreground font-normal">({list.length})</span>
              </h4>
              <ul className="flex flex-col">
                {list.map((r) => (
                  <li key={r.id} className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0">
                    <span className="flex items-center gap-2 flex-wrap">
                      <Link to={r.entry.guideHref} className="font-medium text-link hover:underline">
                        <bdi>{r.entry.name}</bdi>
                      </Link>
                      {k === "ranked" ? <Tag tone="positive" icon={<IconOk size={14} />}>{r2.outcomes.ranked}</Tag> : k === "excluded" ? <Tag tone="entered" icon={<IconEdit size={14} />}>{r5.exposure.headings.excluded}</Tag> : k === "not-evaluated" ? <Tag tone="neutral" icon={<IconDashed size={14} />}>{r2.outcomes["not-evaluated"]}</Tag> : <Tag tone="neutral" icon={<IconDash size={14} />}>{r2.outcomes[k]}</Tag>}
                    </span>
                    {k !== "ranked" && (
                      <span className="text-sm text-muted-foreground">
                        <ExposureReason row={r} ctx={ctx} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="text-sm text-muted-foreground">{c.last}</p>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------- the checklist marks

function marksOf(bundle: CompareBundle, view: ExposureResultView): ChecklistRowView[] {
  const byWrapper = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const dimRules = new Map<string, Set<string>>();
  const dimOptions = new Map<string, Set<string>>();
  for (const r of view.ranked) {
    for (const u of r.run?.rules ?? []) for (const d of u.dimensions) {
      (dimRules.get(d) ?? dimRules.set(d, new Set()).get(d)!).add(u.id);
      (dimOptions.get(d) ?? dimOptions.set(d, new Set()).get(d)!).add(r.id);
    }
  }
  const blocked = new Map<string, { code: string; options: Set<string> }>();
  for (const r of [...view.ranked, ...view.listed]) {
    const w = r.holding.wrapperId ? byWrapper.get(r.holding.wrapperId) : undefined;
    for (const [d, m] of Object.entries(w?.record.dimensions ?? {})) {
      if (!m.startsWith("blocked:")) continue;
      const b = blocked.get(d) ?? { code: m.slice("blocked:".length), options: new Set<string>() };
      b.options.add(r.id);
      blocked.set(d, b);
    }
  }
  const names = Object.fromEntries(view.rows.map((r) => [r.id, r.entry.name]));
  return bundle.checklist.map((row): ChecklistRowView => {
    const rules = [...(dimRules.get(row.id) ?? [])];
    const b = blocked.get(row.id);
    const mark: ChecklistRowView["mark"] = rules.length > 0 ? "covered" : b ? "blocked" : "na";
    const options = rules.length > 0 ? [...(dimOptions.get(row.id) ?? [])] : b ? [...b.options] : [];
    return {
      id: row.id,
      name: row.name,
      explanation: row.explanation,
      mark,
      ...(b && mark === "blocked" ? { code: b.code } : {}),
      rules,
      applies: options.length > 0 ? <span className="text-xs text-muted-foreground">{mark === "blocked" ? r2.result.checklistBlocks : r2.result.checklistAffected} {options.map((id) => names[id] ?? id).join(", ")}</span> : undefined,
    };
  });
}

// ---------------------------------------------------------------- the body

export function ExposureBody({ bundle, data, frame }: { bundle: CompareBundle; data: FormData; frame: (b: ReactNode) => ReactNode }) {
  const { current, resolved, setExposureInput } = useGoals();
  const g = runGoalOf(current!, resolved!)!;
  const goal = current!;
  const key = JSON.stringify([g, goal.exposures ?? {}, goal.assumptions.acceptedFall ?? null]);
  const outcome = useMemo(() => {
    try {
      return { view: computeExposureMode({ bundle, g, goal }) } as const;
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) } as const;
    }
  }, [bundle, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState<Mode>("real");
  const [popup, setPopup] = useState<{ kind: "why" } | { kind: "detail"; id: string } | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [changes, setChanges] = useState<HTMLElement | null | false>(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const headId = useId();
  const { saved, view: revisit } = useRevisit("exposure");
  const mk = useMemo(() => makeValues(bundle, g), [bundle, g]);

  // the ranked rows keep a stable order key for the FLIP animation
  const rankedOrder = outcome.view ? outcome.view.rows.map((r) => `${r.id}:${r.kind}`).join(",") : "";
  const listRef = useFlipList(rankedOrder);

  useEffect(() => {
    if (!saveFailed) return;
    const t = window.setTimeout(() => setSaveFailed(false), 8000);
    return () => window.clearTimeout(t);
  }, [saveFailed]);

  if ("error" in outcome) return frame(<Callout tone="caution">{r5.exposure.failed}</Callout>);
  const view = outcome.view;
  const names = Object.fromEntries(view.rows.map((r) => [r.id, r.entry.name]));
  const ctx: ExpCtx = { bundle, view, g, mk, mode, names, setInput: setExposureInput, ...(saved?.choice && saved.savedOn ? { chosen: { id: saved.choice.id, on: saved.savedOn } } : {}) };
  const readableSaved = saved && revisit && revisit.status !== "unreadable" ? saved : undefined;

  const doSave = (choice?: { id: string; name: string }) => {
    const rec = snapshotExposure({ bundle, g, goal, site: bundle.site ?? { version: "r5", data: bundle.runDate }, today: isoToday(), view, ...(choice ? { choice } : {}) });
    const ok = saveComparisonRecord(rec);
    forgetRevisit();
    setSaveFailed(!ok);
  };
  const unchoose = () => {
    if (!saved || !readableSaved) return;
    const { choice: _drop, ...rest } = saved;
    setSaveFailed(!saveComparisonRecord(rest));
    forgetRevisit();
  };
  const sources = {
    horizon: resolved!.source.horizonYears === "entered",
    amountNow: resolved!.source.amountNow === "entered",
    monthly: resolved!.source.monthly === "entered",
    available: resolved!.source.available === "entered",
    inflation: g.inflationPct !== null,
  };
  const openField = (f: FieldKey | "all") => {
    void f;
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches) panelRef.current?.scrollIntoView({ block: "center" });
    else setPanelOpen(true);
  };
  const h = view.headline;
  const detailRow = popup?.kind === "detail" ? view.rows.find((r) => r.id === popup.id) : undefined;
  const above = (r: ExposureRowView) => view.ranked[view.ranked.indexOf(r) - 1];
  const title = goalTitle(current!);
  const rowOf = (r: ExposureRowView, withChoose = false) => (
    <ExposureRow
      key={r.id}
      row={r}
      ctx={ctx}
      {...(above(r) ? { above: above(r) } : {})}
      onDetail={r.run ? (el) => (setAnchor(el), setPopup({ kind: "detail", id: r.id })) : undefined}
      choose={withChoose ? <ChooseButton {...(ctx.chosen?.id === r.id ? { chosenOn: ctx.chosen.on } : {})} onChoose={() => doSave({ id: r.id, name: r.entry.name })} onUnchoose={unchoose} /> : undefined}
    />
  );
  const group = (rows: ExposureRowView[], heading: string, withChoose = false, open = true) =>
    rows.length === 0 ? null : (
      <section className="flex flex-col gap-3" aria-label={heading}>
        {open ? (
          <h2 className="text-xl lg:text-2xl font-semibold">{heading}</h2>
        ) : null}
        <div className="flex flex-col gap-3">{rows.map((r) => rowOf(r, withChoose))}</div>
      </section>
    );
  const noReturn = !view.rows.some((r) => r.grossReturn?.state === "entered");
  return frame(
    <>
      <ModeTabs mode="exposure" />
      {saved && revisit?.status === "unreadable" ? (
        <UnreadableSavedForm view={revisit} onRedo={() => doSave()} onDelete={() => deleteSavedComparison(saved.goalId, "exposure")} />
      ) : (
        readableSaved && revisit && <RevisitBanner view={revisit} onOpen={() => setChanges(document.activeElement as HTMLElement | null)} onSaveAgain={() => doSave()} />
      )}
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl lg:text-3xl font-semibold">
          <Tpl t={r5.exposure.title} vars={{ goal: <bdi>{title}</bdi> }} />
        </h1>
        {h.kind === "all-excluded" ? (
          <Callout tone="blocked">
            <Tpl t={r5.exposure.headline.allExcluded} vars={{ accepted: <span className="text-entered"><bdi dir="ltr">{goal.assumptions.acceptedFall !== null && goal.assumptions.acceptedFall !== undefined ? fmt.pct(goal.assumptions.acceptedFall) : ""}</bdi></span> }} />{" "}
            <Link to="/goal" className="text-link hover:underline">
              {r5.exposure.headline.allExcludedLink}
            </Link>
          </Callout>
        ) : h.kind === "none" ? (
          <Callout tone="info" title={r2.result.nothingRanked}>
            {r2.result.nothingRankedLine}
          </Callout>
        ) : (
          <ExposureHeadline ctx={ctx} onWhy={(el) => (setAnchor(el), setPopup({ kind: "why" }))} />
        )}
        {noReturn && <Callout tone="info">{r5.exposure.headline.noReturn}</Callout>}
      </header>

      <div className="flex flex-col gap-section lg:grid lg:grid-cols-[3fr_2fr] lg:gap-x-12 lg:items-start">
        <div ref={listRef} className="flex flex-col gap-6 min-w-0">
          {group(view.ranked, r5.exposure.headings.ranked, true)}
          {group(view.listed, r5.exposure.headings.listed)}
          {group(view.excluded, r5.exposure.headings.excluded)}
          {group(view.notEvaluated, r5.exposure.headings.notEvaluated)}
          {group(view.notEligible, r2.result.coverageGroups["not-eligible"]!)}
        </div>
        <div className="flex flex-col gap-6 min-w-0 mt-section lg:mt-0">
          <section aria-labelledby={`${headId}-chart`} className="flex flex-col gap-3">
            <h2 id={`${headId}-chart`} className="text-xl lg:text-2xl font-semibold">
              {r5.exposure.chart.title}
            </h2>
            <Card className="flex flex-col gap-4">
              <ExposureChartCard ctx={ctx} view={view} mode={mode} onMode={setMode} />
              <AssumptionChips g={g} sources={sources} onOpen={openField} exposure={{ acceptedFall: goal.assumptions.acceptedFall ?? null }} />
            </Card>
          </section>
          <aside ref={panelRef} className="hidden lg:block bg-card border border-border rounded-lg p-5" aria-label={r5.exposure.assumptions.title}>
            <h3 className="text-lg font-semibold mb-4">{r5.exposure.assumptions.title}</h3>
            <AssumptionsPanel data={data} suggestion={null} onAdopted={() => {}} exposure />
          </aside>
        </div>
      </div>

      <ExposureCoverage ctx={ctx} open={h.kind === "none" || h.kind === "all-excluded" || h.kind === "no-return"} />

      <section className="flex flex-col gap-3" aria-labelledby={`${headId}-check`}>
        <h2 id={`${headId}-check`} className="text-xl lg:text-2xl font-semibold">
          {r5.exposure.checklist}
        </h2>
        <DimensionChecklist rows={marksOf(bundle, view)} />
      </section>

      <SaveComparisonButton {...(readableSaved ? { savedOn: readableSaved.savedOn } : {})} onSave={() => doSave(readableSaved?.choice)} failed={saveFailed} />
      <RulesLine ids={[...new Set(view.ranked.flatMap((r) => (r.run?.rules ?? []).map((u) => u.id)))]} />

      <Sheet open={popup !== null} onClose={() => setPopup(null)} anchor={anchor} pc="popover" height={78} labelledBy={headId}>
        {popup?.kind === "why" && view.ranked.length > 1 && <WhyBody ctx={ctx} headId={headId} />}
        {popup?.kind === "detail" && detailRow && <DetailBody ctx={ctx} row={detailRow} headId={headId} />}
      </Sheet>
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`} className="lg:hidden">
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {r5.exposure.assumptions.title}
        </h2>
        {panelOpen && <AssumptionsPanel data={data} suggestion={null} onAdopted={() => {}} exposure />}
      </Sheet>
      {readableSaved && revisit && revisit.status !== "unreadable" && (
        <WhatChangedSheet view={revisit} open={changes !== false} onClose={() => setChanges(false)} anchor={changes || null} changesHref="/changes" today={bundle.runDate} nis={(v, about) => <Num value={computed(v, "nis", "F-06", {}, { today: isoToday(), about })} />} />
      )}
    </>,
  );
}

export type { RuleRecord };
export { Disclosure, system };
