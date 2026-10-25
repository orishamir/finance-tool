// Screen 6: the comparison result (design-spec 8, flows 13 to 16 and 19). The goal lives on the device, so the
// page is a shell until it is read; then the engine runs here, on the bundle fetched once. No saved goal opens the form.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLoaderData, useNavigate, useSearchParams } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { formulaNames, r2, scnCompare, site, system } from "../copy";
import { useValueMode } from "../lib/mode-store";
import { splitOwnTerms, useOwnTerms } from "../lib/own-rate";
import { applyIndex, planOfGoal } from "../lib/compare-index";
import { knownIndices } from "../lib/invest";
import { useInputs } from "../lib/inputs";
import { BROKERAGE, loadWorkbenchBundle, type WorkbenchBundle } from "../lib/providers";
import { AssumptionChips, AssumptionsPanel, type Suggestion } from "../components/compare/assumptions";
import { ChartLegend, ChartReadout, ChartTable, ComparisonChart } from "../components/compare/chart";
import type { ResultCtx } from "../components/compare/ctx";
import { CoverageLine } from "../components/compare/coverage";
import { type FormData } from "../components/compare/goal-form";
import { AvailableCard, ListedRow, RankedRow, useFlip } from "../components/compare/rows";
import { ReasonLines } from "../components/compare/reasons";
import { SensitivityPanel } from "../components/compare/sensitivity";
import { SavedGoalStrip } from "../components/compare/strip";
import { DetailSheetBody, HorizonDefaultedNote, HorizonHonestLine, PastRecordLine, WhyHeadline, WhySheetBody, horizonFigures } from "../components/compare/why";
import type { FitTableData } from "../lib/fit";
import { DimensionChecklist, type ChecklistRowView } from "../components/guide/sections";
import { IconExternal } from "../components/icons";
import { IdRef, Num, NumberLegend, RulesLine } from "../components/provenance";
import { Sheet } from "../components/Sheet";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card, Disclosure, SegmentedControl, Sentence, Tag } from "../components/kit";
import { applyProviders, buildView, computeSensitivity, makeValues, runGoalOf, nothingToCompare, cashRateOf, type CompareBundle, type CompareView, type FeeKind, type RankedOption, type SensitivityView } from "../lib/compare";
import { loadBundle } from "../lib/bundle";
import { fmt } from "../lib/format";
import { GoalsProvider, hasMeaning, isBlank, useGoals, type FieldKey, type Presets } from "../lib/goal";
import { goalTitle } from "../components/compare/goal-form";
import { ExposureBody, ModeTabs } from "../components/exposure-mode/result";
import { ChooseButton, RevisitBanner, SaveComparisonButton, UnreadableSavedForm, WhatChangedSheet } from "../components/revisit/revisit";
import { forgetRevisit, useRevisit } from "../components/revisit/use-revisit";
import { Tpl } from "../components/exposure-mode/tpl";
import { snapshotWrapper } from "../lib/revisit";
import { deleteSavedComparison, isoToday, saveComparisonRecord, type CompareMode } from "../lib/state";
import { computed, entered } from "../lib/value";
import { r5 } from "../copy";
import { bundleLinks } from "../lib/bundle";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("compare-bundle.json", "workbench-bundle.json");

export async function loader() {
  const { loadFormulaMap } = await import("../lib/data.server");
  const { goalFormData, fitTable } = await import("../lib/compare.server");
  // P-04's table: the line under the headline quotes the equity row when the horizon is short (home question card 2026-10-24)
  return { ...goalFormData(), fit: fitTable(), formulas: loadFormulaMap(formulaNames) };
}

export function meta() {
  return [{ title: `${r2.result.title} · ${site.name}` }];
}

export default function GoalComparePage() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  const [bundle, setBundle] = useState<CompareBundle | null>(null);
  // the invest page's data (2026-10-25, D28): the securities account's way over the indices. If it does not load, the comparison still runs and the account names no index.
  const [wb, setWb] = useState<WorkbenchBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([loadBundle(), loadWorkbenchBundle().catch(() => null)])
      .then(([b, w]) => {
        setWb(w);
        setBundle(b);
      })
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries((bundle?.rules ?? Object.values(data.rules)).map((r) => [r.id, r as RuleRecord]));
    return { rules, terms: {}, dimensions: Object.fromEntries((bundle?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today, formulas: data.formulas };
  }, [bundle, data.rules, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="goal" data={provenance}>
        <Result bundle={bundle} wb={wb} failed={failed} data={data.form as FormData} fit={data.fit as FitTableData} presets={presets} meta={data.meta} today={data.today} />
      </PageShell>
    </GoalsProvider>
  );
}

function Result({ bundle, wb, failed, data, fit, presets, meta, today }: { bundle: CompareBundle | null; wb: WorkbenchBundle | null; failed: boolean; data: FormData; fit: FitTableData; presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { status, current, resolved } = useGoals();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode: CompareMode = params.get("mode") === "exposure" ? "exposure" : "wrapper";
  const ready = status !== "loading";
  // No saved goal: the form (design-spec 8: a shared link or a first visit lands here).
  useEffect(() => {
    if (ready && status !== "old-version" && current && isBlank(current)) navigate("/goal", { replace: true });
  }, [ready, status, current, navigate]);

  // A71: the body registers its save here, so the goal card's menu can save the comparison
  const [saveAction, setSaveAction] = useState<{ run: () => void; again: boolean } | null>(null);
  const strip = <SavedGoalStrip presets={presets} meta={meta} today={today} showResultLink={false} note={r2.strip.recomputed} revisitMode={mode} saveAction={saveAction} />;
  const frame = (body: React.ReactNode) => (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={{ href: "/goal", label: r2.form.title }} current={r2.result.title} />
      {strip}
      {body}
    </div>
  );
  if (!ready || (!bundle && !failed)) return frame(<p className="text-muted-foreground">{r2.loadingGoal}</p>);
  if (status === "old-version") return null;
  if (failed) return frame(<Callout tone="caution">{r2.result.failed}</Callout>);
  if (!current || !resolved || isBlank(current)) return frame(<p className="text-muted-foreground">{r2.loadingGoal}</p>);
  const g = hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  if (!g || !bundle) return <Navigate to="/goal?need=1" replace />;
  if (nothingToCompare(g)) {
    return frame(
      <Callout tone="info">
        {g.available > 0 ? r2.result.allKept : r2.result.needMore}{" "}
        <Link to="/goal" className="text-link hover:underline">
          {r2.result.toForm}
        </Link>
      </Callout>,
    );
  }
  if (mode === "exposure") return <ExposureBody bundle={bundle} data={data} frame={frame} registerSave={setSaveAction} />;
  return <Body bundle={bundle} wb={wb} data={data} fit={fit} frame={frame} exposureId={params.get("exposure")} registerSave={setSaveAction} />;
}

function Body({ bundle: bundle0, wb, data, fit, frame, exposureId, registerSave }: { bundle: CompareBundle; wb: WorkbenchBundle | null; data: FormData; fit: FitTableData; frame: (b: React.ReactNode) => React.ReactNode; exposureId: string | null; registerSave: (a: { run: () => void; again: boolean } | null) => void }) {
  const { current, resolved } = useGoals();
  const [terms, setTerm] = useOwnTerms(current!.id);
  const { ownRates, ownFees, ownProviders, ownIndices } = splitOwnTerms(terms);
  const setOwnIndex = (id: string | undefined) => setTerm(BROKERAGE, "index", id);
  const released = useInputs();
  const setOwnProvider = (w: string, id: string | undefined) => setTerm(w, "provider", id);
  const setOwnRate = (w: string, p: number | undefined) => setTerm(w, "rate", p);
  const setOwnFee = (w: string, p: number | undefined) => setTerm(w, "fee", p);
  const base0 = runGoalOf(current!, resolved!)!;
  const base = { ...base0, ...(Object.keys(ownRates).length > 0 ? { ownRates } : {}), ...(Object.keys(ownFees).length > 0 ? { ownFees } : {}), ...(Object.keys(ownProviders).length > 0 ? { ownProviders } : {}), ...(Object.keys(ownIndices).length > 0 ? { ownIndices } : {}) };
  // opened from an exposure row ("באיזה מוצר להחזיק את זה"): A-01 is that exposure's entered return for this view, not saved into the goal
  const subject = exposureId ? bundle0.exposures?.find((e) => e.record.id === exposureId) : undefined;
  const subjectReturn = subject ? current!.exposures?.[subject.record.id]?.return : undefined;
  const g = subjectReturn && typeof subjectReturn.value === "number" ? { ...base, returnPct: subjectReturn.value } : base;
  const key = JSON.stringify(g);
  // the broker the person chose for the brokerage account, else the collected tariff that leaves this goal the most (F-80, 2026-10-24, Doron's case): its tariff is the account's everywhere below
  // The securities account names no index until the person chooses one (D27, D28): the lowest of the ways over the known indices before, the chosen index's cheapest way after; its broker is that way's.
  const index = useMemo(() => (wb ? applyIndex(bundle0, wb, planOfGoal(bundle0, g, released.state), g) : null), [bundle0, wb, key, released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const bundle = useMemo(() => applyProviders(index?.bundle ?? bundle0, g), [bundle0, index, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const outcome = useMemo(() => buildView(bundle, g), [bundle, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useValueMode();
  const [hover, setHover] = useState<number | null>(null);
  const [sens, setSens] = useState<SensitivityView | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { saved, view: revisit } = useRevisit("wrapper");
  const [changes, setChanges] = useState<HTMLElement | null | false>(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [popup, setPopup] = useState<{ kind: "why" } | { kind: "detail"; id: string } | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const headId = useId();
  const saveNow = useRef<() => void>(() => {});
  const hasSaved = !!saved;
  useEffect(() => {
    registerSave({ run: () => saveNow.current(), again: hasSaved });
    return () => registerSave(null);
  }, [hasSaved]); // eslint-disable-line react-hooks/exhaustive-deps

  // F-81 runs after the result is on screen, so typing stays light.
  useEffect(() => {
    setSens(null);
    if (outcome.kind !== "ok") return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const labels = { return: r2.result.sensNames["A-01"]!, inflation: r2.result.sensNames["A-02"]!, horizon: r2.result.sensNames.horizon! };
        const s = computeSensitivity(bundle, g, outcome.evaluated, (kind: FeeKind, name: string) => `${r2.result.sensFee[kind]} · ${name}`, labels);
        if (!cancelled) setSens(s);
      } catch {
        if (!cancelled) setSens(null);
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  const openField = (field: FieldKey, suggested?: number) => {
    setSuggestion(suggested === undefined ? null : { field, value: suggested });
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches) panelRef.current?.scrollIntoView({ block: "center" });
    else setPanelOpen(true);
  };

  if (outcome.kind === "error") return frame(<Callout tone="caution">{r2.result.failed}</Callout>);
  if (outcome.kind !== "ok") return frame(<Callout tone="caution">{r2.result.failed}</Callout>);
  const view: CompareView = outcome;
  const mk = makeValues(bundle, g);
  const readableSaved = saved && revisit && revisit.status !== "unreadable" ? saved : undefined;
  const doSave = (choice?: { id: string; name: string }) => {
    const rec = snapshotWrapper({ bundle, g, goal: current!, site: bundle.site ?? { version: "r5", data: bundle.runDate }, today: isoToday(), ev: view.evaluated, ...(choice ? { choice } : {}) });
    setSaveFailed(!saveComparisonRecord(rec));
    forgetRevisit();
  };
  const unchoose = () => {
    if (!saved || !readableSaved) return;
    const { choice: _drop, ...rest } = saved;
    setSaveFailed(!saveComparisonRecord(rest));
    forgetRevisit();
  };
  saveNow.current = () => doSave(readableSaved?.choice);
  const holdsExposure = (id: string) => !subject || (subject.record.wrapper_ids ?? []).includes(id as never);
  const ctx: ResultCtx = { bundle, view, g, mk, mode, openField, fall: current!.assumptions.acceptedFall ?? null, setOwnRate, setOwnFee, setOwnProvider, targetCost: current!.targetCost ?? null, subjectCurrency: subject && subject.record.currency !== "ILS" ? subject.record.currency : null, index: { wrapperId: BROKERAGE, card: { reading: index?.reading ?? null, ranked: index?.ranked ?? null, known: wb ? knownIndices(wb).map((i) => ({ id: i.id, name: i.name })) : [], chosenId: index?.reading?.kind === "chosen" ? index.reading.index.id : undefined, onChoose: setOwnIndex } } };
  const hideAll = view.headline === "excludes-all" || view.headline === "nothing-ranked";
  const title = goalTitle(current!);
  const sources = {
    horizon: resolved!.source.horizonYears === "entered",
    amountNow: resolved!.source.amountNow === "entered",
    monthly: resolved!.source.monthly === "entered",
    available: resolved!.source.available === "entered",
    inflation: g.inflationPct !== null,
  };
  const detailOption = popup?.kind === "detail" ? view.ranked.find((o) => o.id === popup.id) ?? view.listed.find((o) => o.id === popup.id) : null;
  const above = (o: RankedOption) => view.ranked[view.ranked.indexOf(o) - 1];
  const showCoverageOpen = hideAll || view.headline === "only-baseline";
  const needsReturnShown = g.returnPct === null && view.coverageRows.some((r) => r.reasons.some((x) => x.field === "return"));
  const checklistRows: ChecklistRowView[] = view.marks.map((m) => ({
    id: m.id,
    name: m.name,
    // a blocked row is followed by "עד שהשאלה תיסגר…": the explanation ends with a full stop first (hebrew-editor request)
    explanation: m.mark === "blocked" ? m.explanation.replace(/[.\s]*$/, ".") : m.explanation,
    mark: m.mark,
    code: m.code,
    rules: m.rules,
    applies: (
      <>
        {m.options.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {m.mark === "blocked" ? r2.result.checklistBlocks : r2.result.checklistAffected} {m.options.map((id) => view.names[id] ?? id).join(", ")}
          </span>
        )}
        {/* a covered row still shows the options blocked on it in their own record (scenario fix 2026-10-24: coverage is pooled across options) */}
        {m.blockedOptions && (
          <span className="text-xs text-blocked-foreground">
            {scnCompare.blockedFor} {m.blockedOptions.options.map((id) => view.names[id] ?? id).join(", ")} (<IdRef id={m.blockedOptions.code} />)
          </span>
        )}
      </>
    ),
  }));

  return frame(
    <>
      <div className="contents md:block md:max-w-sm"><ModeTabs mode="wrapper" /></div>
      {saved && revisit?.status === "unreadable" ? (
        <UnreadableSavedForm view={revisit} onRedo={() => doSave()} onDelete={() => deleteSavedComparison(saved.goalId, "wrapper")} />
      ) : (
        readableSaved && revisit && <RevisitBanner view={revisit} onOpen={() => setChanges(document.activeElement as HTMLElement | null)} onSaveAgain={() => doSave()} />
      )}
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl lg:text-3xl font-semibold">
          <bdi>{title}</bdi>: {r2.result.title}
        </h1>
        <NumberLegend />
        {subject && subjectReturn && (
          <p className="text-sm flex flex-wrap items-center gap-2">
            <Tpl t={r5.exposure.wrapperSubject} vars={{ exposure: <bdi className="font-medium">{subject.name}</bdi>, rate: <Num value={subjectReturn as never} /> }} />
          </p>
        )}
        {view.headline === "excludes-all" ? (
          <Callout tone="blocked">
            {r2.result.excludesAll} <span className="text-entered">{r2.result.constraintAnytime}</span>.{" "}
            <Link to="/goal" className="text-link hover:underline">
              {r2.result.excludesAllLink}
            </Link>
          </Callout>
        ) : view.headline === "nothing-ranked" ? (
          <Callout tone="info" title={r2.result.nothingRanked}>
            <span className="block">{r2.result.nothingRankedLine}</span>
            {view.coverageRows
              .filter((r) => r.tier === 1 && r.kind !== "ranked")
              .slice(0, 3)
              .map((r) => (
                <span key={r.id} className="block">
                  <bdi className="font-medium">{r.name}</bdi>: <ReasonLines row={r} ctx={ctx} />
                </span>
              ))}
          </Callout>
        ) : (
          <WhyHeadline
            ctx={ctx}
            sens={sens}
            onField={(f) => openField(f)}
            onWhy={(el) => {
              setAnchor(el);
              setPopup({ kind: "why" });
            }}
          />
        )}
        {g.employmentInferred && (
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2" data-employment-inferred>
            <span>{r2.result.employmentInferred}</span>
            <Link to="/goal" className="text-link min-h-9 inline-flex items-center hover:underline">
              {r2.result.employmentInferredChange}
            </Link>
          </p>
        )}
        <HorizonDefaultedNote bundle={bundle} g={g} presetName={r2.presets[current!.preset] ?? ""} onChange={() => openField("horizonYears")} figures={hideAll ? null : horizonFigures(ctx)} />
        {!hideAll && <HorizonHonestLine ctx={ctx} fit={fit} />}
        {!hideAll && <PastRecordLine ctx={ctx} fit={fit} />}
        {view.stale && (
          <Callout tone="caution">
            {system.staleBanner.before} <bdi dir="ltr">{fmt.date(view.stale.since)}</bdi>. {system.staleBanner.after}
          </Callout>
        )}
        {needsReturnShown && hideAll && (
          <Callout tone="info">
            {r2.form.returnEmpty}{" "}
            <button type="button" className="text-link hover:underline" onClick={() => openField("return")}>
              {r2.result.reasons.enterReturn}
            </button>
          </Callout>
        )}
      </header>

      <div className="flex flex-col gap-section lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-12 lg:items-start">
        <div className="flex flex-col gap-6 min-w-0">
          {view.ranked.length > 0 && (
            <section className="flex flex-col gap-4" aria-labelledby={`${headId}-list`}>
              <h2 id={`${headId}-list`} className="text-xl lg:text-2xl font-semibold">
                {r2.result.listHeading}
              </h2>
              <RankedList
                ctx={ctx}
                above={above}
                onDetail={(id, el) => (setAnchor(el), setPopup({ kind: "detail", id }))}
                extra={(id) => (holdsExposure(id) ? undefined : <Tag tone="neutral">{r5.exposure.cannotHoldTag.replace("{exposure}", subject!.name)}</Tag>)}
                chosen={(o) => saved?.choice?.id === o.id && !!readableSaved}
                choose={(o) => <ChooseButton {...(saved?.choice?.id === o.id && readableSaved ? { chosenOn: saved.savedOn } : {})} onChoose={() => doSave({ id: o.id, name: o.name })} onUnchoose={unchoose} />}
              />
            </section>
          )}
          <AvailableCard ctx={ctx} />
          {view.listed.length > 0 && (
            <section aria-labelledby={`${headId}-listed`} className="flex flex-col gap-3">
              <Disclosure label={<h2 id={`${headId}-listed`} className="text-xl lg:text-2xl font-semibold">{r2.result.listedHeading}</h2>} defaultOpen={view.listed.length <= 3 || hideAll}>
                <ul className="flex flex-col gap-3 pt-2">
                  {view.listed.map((o) => (
                    <ListedRow key={o.id} o={o} ctx={ctx} onDetail={(el) => (setAnchor(el), setPopup({ kind: "detail", id: o.id }))} />
                  ))}
                </ul>
              </Disclosure>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6 min-w-0 mt-section lg:mt-0">
          <section aria-labelledby={`${headId}-chart`} className="flex flex-col gap-3">
            <h2 id={`${headId}-chart`} className="text-xl lg:text-2xl font-semibold">
              {r2.result.chartTitle}
            </h2>
            <Card className="flex flex-col gap-4">
              {view.series.length === 0 ? (
                <p className="text-muted-foreground">{r2.result.chartEmpty}</p>
              ) : (
                <>
                  <SegmentedControl label={r2.result.realNominal} options={[{ value: "real", label: r2.result.modes.real }, { value: "nominal", label: r2.result.modes.nominal }]} value={mode} onChange={setMode} />
                  <ChartLegend lines={view.series} />
                  <ComparisonChart lines={view.series} mode={mode} horizon={g.horizonYears} ctx={ctx} hover={hover} onHover={setHover} />
                  {view.series.some((l) => l.enteredReturn) && <p className="text-xs text-entered">{r2.result.chartEnteredCaption}</p>}
                  <FallEcho ctx={ctx} />
                  <ChartReadout lines={view.series} mode={mode} year={hover ?? g.horizonYears} ctx={ctx} />
                  <ChartTable lines={view.series} mode={mode} ctx={ctx} />
                </>
              )}
              <AssumptionChips
                g={g}
                sources={sources}
                onOpen={(f) => {
                  if (f === "all") openField("horizonYears");
                  else openField(f);
                }}
              />
            </Card>
          </section>
          <Card as="aside" pad="aside" ref={panelRef} className="hidden lg:block" aria-label={r2.result.assumptionsTitle}>
            <h3 className="text-lg font-semibold mb-4">{r2.result.assumptionsTitle}</h3>
            <AssumptionsPanel data={data} suggestion={suggestion} onAdopted={() => setSuggestion(null)} />
          </Card>
        </div>
      </div>

      {view.cashRate && (
        <Sentence size="sm" tone="muted" measure>
          {r2.result.cashBefore} <Num value={view.cashRate} />
          {r2.result.cashAfter}
          {bundle.cashLink && (
            <>
              {" "}
              <a href={bundle.cashLink.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline">
                {r2.result.cashLink}
                <IconExternal size={16} />
              </a>
            </>
          )}
        </Sentence>
      )}

      <CoverageLine ctx={ctx} open={showCoverageOpen} />

      {!hideAll && (
        <div className="flex flex-col gap-section lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          <section className="flex flex-col gap-3" aria-labelledby={`${headId}-sens`}>
            <h2 id={`${headId}-sens`} className="text-xl lg:text-2xl font-semibold">
              {r2.result.sensTitle}
            </h2>
            <SensitivityPanel
              view={sens}
              ctx={ctx}
              onOpen={(field, suggested) => openField(field, suggested)}
            />
          </section>
          <section className="flex flex-col gap-3" aria-labelledby={`${headId}-check`}>
            <h2 id={`${headId}-check`} className="text-xl lg:text-2xl font-semibold">
              {r2.result.checklistTitle}
            </h2>
            <DimensionChecklist rows={checklistRows} />
          </section>
        </div>
      )}
      {hideAll && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl lg:text-2xl font-semibold">{r2.result.checklistTitle}</h2>
          <DimensionChecklist rows={checklistRows} />
        </section>
      )}
      <SaveComparisonButton {...(readableSaved ? { savedOn: readableSaved.savedOn } : {})} onSave={() => doSave(readableSaved?.choice)} failed={saveFailed} />
      <RulesLine ids={view.rulesUsed} />
      {readableSaved && revisit && revisit.status !== "unreadable" && (
        <WhatChangedSheet view={revisit} open={changes !== false} onClose={() => setChanges(false)} anchor={changes || null} today={bundle.runDate} nis={(v, about) => <Num value={computed(v, "nis", "F-06", {}, { today: isoToday(), about })} />} />
      )}

      <Sheet open={popup !== null} onClose={() => setPopup(null)} anchor={anchor} pc="popover" height={78} labelledBy={headId}>
        {popup?.kind === "why" && view.ranked.length > 1 && <WhySheetBody ctx={ctx} headId={headId} />}
        {popup?.kind === "detail" && detailOption && <DetailSheetBody ctx={ctx} option={detailOption} headId={headId} />}
      </Sheet>
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`} className="lg:hidden">
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {r2.result.assumptionsTitle}
        </h2>
        {panelOpen && <AssumptionsPanel data={data} suggestion={suggestion} onAdopted={() => setSuggestion(null)} />}
      </Sheet>
    </>,
  );
}

function RankedList({ ctx, above, onDetail, extra, choose, chosen }: { ctx: ResultCtx; above: (o: RankedOption) => RankedOption | undefined; onDetail: (id: string, el: HTMLElement) => void; extra?: (id: string) => React.ReactNode; choose?: (o: RankedOption) => React.ReactNode; chosen?: (o: RankedOption) => boolean }) {
  const order = ctx.view.ranked.map((o) => o.id).join(",");
  const ref = useFlip(order);
  return (
    <ol ref={ref} className="flex flex-col gap-3">
      {ctx.view.ranked.map((o) => (
        <RankedRow key={o.id} o={o} above={above(o)} ctx={ctx} onDetail={(el) => onDetail(o.id, el)} extra={extra?.(o.id)} choose={choose?.(o)} chosen={chosen?.(o) ?? false} />
      ))}
    </ol>
  );
}

/** A12: the accepted fall in shekels, from the amount compared today: "20% מ־40,000 ₪, כלומר 8,000 ₪ היום". */
function FallEcho({ ctx }: { ctx: ResultCtx }) {
  const { fall, g, mk } = ctx;
  const start = g.amountNow - g.available;
  if (!fall || fall <= 0 || start <= 0) return null;
  const drop = (start * Math.min(fall, 100)) / 100;
  return (
    <p className="text-xs text-muted-foreground" data-fall-echo>
      <Tpl
        t={r2.result.fallEcho}
        vars={{
          pct: <Num value={entered(fall, "pct", isoToday(), r2.result.fallBand)} />,
          amount: <Num value={mk.nis(start, "F-71", r2.result.fallBand)} />,
          drop: <Num value={mk.nis(drop, "F-71", r2.result.fallBand)} />,
        }}
      />
    </p>
  );
}

export { cashRateOf };
