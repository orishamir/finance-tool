// Screen 9: the fee materiality page (design-spec 12, flows 20, 21, 27). What each fee costs over the horizon, which
// is worth negotiating, avoiding or ignoring, with the reference and the words to say. The subject is in the address
// (?wrapper=, ?track=, ?holding=, &from=compare); the numbers come from the saved goal, or from the scenario P-05
// holds. Not pre-rendered beyond the shell: the engine runs here, on the bundles fetched once.
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { SiteValue } from "../lib/value";
import { r3fees, r3holdings, site } from "../copy";
import { AssumptionsPanel, type Suggestion } from "../components/compare/assumptions";
import type { FormData } from "../components/compare/goal-form";
import { goalTitle } from "../components/compare/goal-form";
import { EmploymentInferredNote, employmentMatters } from "../components/compare/inferred";
import { SavedGoalStrip } from "../components/compare/strip";
import { FeeChips } from "../components/fees/chips";
import { ChartLegend, ChartReadout, ChartTable, FeeDragChart } from "../components/fees/FeeDragChart";
import { FeeRow, NotReportedRow } from "../components/fees/FeeRow";
import { FeeHeadline, ReasonWithCode, RemainderLine, SubjectStrip, ThresholdsLine } from "../components/fees/parts";
import { FeeSensitivityPanel } from "../components/fees/sensitivity";
import { IconLock } from "../components/icons";
import { Num, NumberLegend, RuleRef, RulesLine } from "../components/provenance";
import { Sheet } from "../components/Sheet";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card } from "../components/ui";
import { loadBundle } from "../lib/bundle";
import { runGoalOf, type CompareBundle } from "../lib/compare";
import { buildFees, buildHoldingFees, feeInputs, type FeeInputs, feeSensitivity, headlineGap, loadFeesData, parseSubject, rankedFor, ruleMap, softensAvoid, type FeeSensitivity, type FeesData, type FeesResult, type PlanError, type SubjectSpec } from "../lib/fees";
import { GoalsProvider, hasMeaning, useGoals, type FieldKey, type Presets } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { holdingName, useHolding } from "../lib/holdings";
import { bundleLinks } from "../lib/bundle";
import { playbookWrappers } from "../lib/playbook";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("fees-data.json", "compare-bundle.json");

export async function loader() {
  const { goalFormData } = await import("../lib/compare.server");
  const { latestSnapshots } = await import("../lib/institutions.server");
  // The English publisher a fee line records, to the provider's Hebrew name, so the subject strip names it in Hebrew.
  const publisherNames: Record<string, string> = {};
  const walk = (node: unknown, he: string) => {
    if (Array.isArray(node)) node.forEach((n) => walk(n, he));
    else if (node && typeof node === "object") {
      const o = node as Record<string, unknown>;
      if (typeof o.publisher === "string" && !/[\u0590-\u05ff]/.test(o.publisher)) publisherNames[o.publisher] ??= he;
      for (const v of Object.values(o)) walk(v, he);
    }
  };
  for (const snap of latestSnapshots()) walk(snap, snap.provider.name_he);
  return { ...goalFormData(), publisherNames };
}

export function meta() {
  return [{ title: `${r3fees.title} · ${site.name}` }];
}

export default function FeesPage() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  const [bundle, setBundle] = useState<CompareBundle | null>(null);
  const [fees, setFees] = useState<FeesData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([loadBundle(), loadFeesData()])
      .then(([b, f]) => {
        setBundle(b);
        setFees(f);
      })
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...(bundle?.rules ?? Object.values(data.rules)), ...(fees?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, terms: {}, dimensions: Object.fromEntries((bundle?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [bundle, fees, data.rules, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance}>
        <Page bundle={bundle} fees={fees} failed={failed} form={data.form as FormData} presets={presets} meta={data.meta} today={data.today} publisherNames={data.publisherNames} />
      </PageShell>
    </GoalsProvider>
  );
}

function Page({ bundle, fees, failed, form, presets, meta, today, publisherNames }: { bundle: CompareBundle | null; fees: FeesData | null; failed: boolean; form: FormData; presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string; publisherNames: Record<string, string> }) {
  const { status, current } = useGoals();
  const { search } = useLocation();
  const subject = useMemo(() => parseSubject(search), [search]);
  // The pre-rendered page has no address to read: the first client render matches it, then the subject is read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const frame = (body: React.ReactNode, back?: { href: string; label: string }) => (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={back ?? { href: "/guide", label: site.menuItems[0].label }} current={r3fees.title} />
      <SavedGoalStrip presets={presets} meta={meta} today={today} showResultLink note="" />
      {body}
    </div>
  );
  if (!mounted) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  if (!subject)
    return frame(
      <Callout tone="info">
        {r3fees.notFound}{" "}
        <Link to="/guide" className="text-link hover:underline">
          {r3fees.notFoundLinks.guide}
        </Link>
        {" · "}
        <Link to="/holdings" className="text-link hover:underline">
          {r3fees.notFoundLinks.holdings}
        </Link>
      </Callout>,
    );
  if (failed) return frame(<Callout tone="caution">{r3fees.failed}</Callout>);
  if (!bundle || !fees || status === "loading" || !current) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  if (status === "old-version") return null;
  return <Body bundle={bundle} fees={fees} form={form} publisherNames={publisherNames} subject={subject} frame={frame} />;
}

function errorText(e: PlanError, wrapperId: string): React.ReactNode {
  switch (e.kind) {
    case "no-wrapper":
      return (
        <>
          {r3fees.notFound}{" "}
          <Link to="/guide" className="text-link hover:underline">
            {r3fees.notFoundLinks.guide}
          </Link>
          {" · "}
          <Link to="/holdings" className="text-link hover:underline">
            {r3fees.notFoundLinks.holdings}
          </Link>
        </>
      );
    case "no-terms":
      return (
        <>
          {r3fees.review.noTerms}{" "}
          <Link to="/holdings" className="text-link hover:underline">
            {r3fees.notFoundLinks.holdings}
          </Link>
        </>
      );
    case "need-input":
      return (
        <>
          {r3fees.review.needInput}
          {/insurance/.test(e.detail) ? "עלות הביטוח בקרן הפנסיה (A-17)" : /salary/i.test(e.detail) ? "שכר חודשי" : /employment|hishtalmut/i.test(e.detail) ? "סוג ההעסקה" : /age/i.test(e.detail) ? "גיל" : r3fees.review.needGeneric}.{" "}
          <Link to="/goal" className="text-link hover:underline">
            {r3fees.review.toForm}
          </Link>
        </>
      );
    case "no-fee":
      return r3fees.review.notReportedRow;
    case "needs-pf36":
      return (
        <span className="inline-flex flex-wrap items-center gap-x-1.5">
          <IconLock size={16} className="text-blocked shrink-0" />
          <span>{r3holdings.feeNeedsPf36}</span>
          <RuleRef id="PF-36" />
        </span>
      );
    case "needs-first-deposit":
      return r3holdings.feeNeedsFirstDeposit;
    default:
      // an engine message never reaches the page: the plain Hebrew reason first, the rule or gap id after it in a chip (A2)
      return <ReasonWithCode message={("messageHe" in e && e.messageHe) || r3fees.review.genericFail} code={e.code} />;
  }
}

/** With no saved goal the page runs on P-05's scenario: its numbers are shown on the sheet, each opening its source (B3). */
function ScenarioDefaults({ inputs }: { inputs: FeeInputs }) {
  const c = r3fees.chips;
  const v = inputs.values;
  const items: [string, SiteValue][] = [
    [c.years, v.years],
    [c.amount, v.amount],
    [c.monthly, v.monthly],
    [c.return, v.returnV],
    [c.inflation, v.inflation],
  ];
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-4">
      <p>
        {r3fees.review.defaultsLead}
        {items.map(([label, value], i) => (
          <span key={label}>
            {label} <Num value={value} />
            {i < items.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
      <p>{r3fees.review.defaultsNote}</p>
    </div>
  );
}

function Body({ bundle, fees, form, publisherNames, subject, frame }: { bundle: CompareBundle; fees: FeesData; form: FormData; publisherNames: Record<string, string>; subject: SubjectSpec; frame: (b: React.ReactNode, back?: { href: string; label: string }) => React.ReactNode }) {
  const { current, resolved } = useGoals();
  const released = useInputs();
  const holding = useHolding(subject.kind === "holding" ? subject.holdingId : null);
  const goalG = current && resolved && hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  const goalName = current ? goalTitle(current) : "";
  const inputs = useMemo(() => feeInputs(bundle, goalG, released.state), [bundle, JSON.stringify(goalG), released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const result: FeesResult | null = useMemo(() => {
    try {
      if (subject.kind === "holding") return holding.holding ? buildHoldingFees(bundle, fees, holding.holding, inputs, goalName) : null;
      return buildFees(bundle, fees, subject, inputs, goalName);
    } catch {
      return { kind: "error", error: { kind: "no-run", code: "failed" } } as FeesResult;
    }
  }, [bundle, fees, subject, inputs, goalName, holding.holding]);
  const [hover, setHover] = useState<number | null>(null);
  const [sens, setSens] = useState<FeeSensitivity | null>(null);
  const [reductions, setReductions] = useState<Record<string, number | null>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const headId = useId();
  const key = JSON.stringify(subject);
  useEffect(() => setReductions({}), [key]);

  useEffect(() => {
    setSens(null);
    if (!result || result.kind !== "ok") return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const s = feeSensitivity(result.args, result.analysis, result.args.runBundle);
        if (!cancelled) setSens(s);
      } catch {
        if (!cancelled) setSens(null);
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [result]);

  const openField = (field: FieldKey | "all", suggested?: number) => {
    const f: FieldKey = field === "all" ? "horizonYears" : field;
    setSuggestion(suggested === undefined || field === "all" ? null : { field: f, value: suggested });
    setPanelOpen(true);
  };

  if (subject.kind === "holding" && !holding.ready) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  if (subject.kind === "holding" && !holding.holding) return frame(<Callout tone="info">{errorText({ kind: "no-wrapper" }, "")}</Callout>, { href: "/holdings", label: r3fees.notFoundLinks.holdings });
  if (!result) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  if (result.kind === "blocked")
    return frame(
      <Callout tone="blocked">
        <ReasonWithCode message={result.messageHe} code={result.ruleId} />
      </Callout>,
    );
  if (result.kind === "error") {
    // the page keeps its shell: the heading, the reason in plain words and the way back (B2)
    const own = subject.kind === "holding";
    return frame(
      <>
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold">{r3fees.title}</h1>
          <NumberLegend />
          {own && holding.holding && (
            <p className="text-lg">
              {r3fees.strip.holding}
              <bdi className="font-medium">{holdingName(holding.holding)}</bdi>
            </p>
          )}
        </header>
        <Callout tone={result.error.kind === "needs-pf36" ? "blocked" : "caution"}>{errorText(result.error, subject.kind === "wrapper" ? subject.wrapperId : "")}</Callout>
        {own && (
          <Link to="/holdings" className="text-link hover:underline min-h-target inline-flex items-center self-start">
            {r3fees.strip.backHolding}
          </Link>
        )}
      </>,
      own ? { href: "/holdings", label: r3fees.notFoundLinks.holdings } : undefined,
    );
  }

  const { analysis: an, subject: sv, preTax, omitted } = result;
  const years = inputs.g.horizonYears;
  const rules = ruleMap(bundle, fees);
  const staleLine = an.lines.find((l) => l.reference.stale)?.reference.stale;
  const back = { href: sv.fromHref, label: sv.from === "compare" ? r3fees.strip.backCompare : sv.from === "track" ? r3fees.strip.backTrack : sv.from === "holding" ? r3fees.strip.backHolding : r3fees.strip.backGuide };
  const hasChart = an.series !== null && an.lines.length > 0;
  const workbench = fees.wrapperTrack[sv.wrapperId] !== undefined || ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"].includes(sv.wrapperId);
  const grossNote = hasChart && Math.abs((an.series!.points.at(-1)?.total ?? 0) - (an.fm.total.value as number)) > 1;
  void staleLine;
  // A9, A18: the plain sentence above the chart, the subject's place in the saved goal's comparison, the softened badge
  const gap = headlineGap(an);
  const place = rankedFor(result.comparison, sv.wrapperId);
  const compareHref = "/goal/compare";
  const switchable = playbookWrappers.includes(sv.wrapperId);
  const providersLink = sv.wrapperId === "brokerage-account";
  const otherRecords = workbench ? { href: `/workbench/tracks/${sv.wrapperId}`, label: r3fees.linksWorkbench } : providersLink ? { href: `/workbench/providers/${sv.wrapperId}`, label: r3fees.linkProviders } : null;

  const rows = an.lines.map((l) => (
    <FeeRow key={l.line} line={l} an={an} subject={sv} years={years} thresholds={an.thresholds} reduction={reductions[l.line] ?? null} onReduce={(n) => setReductions((r) => ({ ...r, [l.line]: n }))} rules={rules} soften={softensAvoid(l.verdict, place)} compareHref={compareHref} />
  ));
  const chartCard = hasChart && (
    <section className="flex flex-col gap-3" aria-labelledby={`${headId}-chart`}>
      <h2 id={`${headId}-chart`} className="text-xl lg:text-2xl font-semibold">
        {r3fees.chart.title}
      </h2>
      <Card className="flex flex-col gap-4">
        <ChartLegend an={an} />
        <FeeDragChart an={an} horizonYears={years} hover={hover} onHover={setHover} hasGoal={inputs.fromGoal} />
        {grossNote && an.exitGap && (
          <p className="text-xs text-muted-foreground">
            {r3fees.review.chartGross.before}
            <Num value={an.exitGap} />
            {r3fees.review.chartGross.after}
          </p>
        )}
        <ChartReadout an={an} year={hover ?? Math.round(an.series!.exitMonth / 12)} />
        <ChartTable an={an} />
        <FeeChips inputs={result.inputs} onOpen={(f) => openField(f)} />
      </Card>
    </section>
  );

  return frame(
    <>
      <SubjectStrip subject={sv} goalName={goalName} publisherNames={publisherNames} otherRecords={otherRecords} />
      <FeeHeadline product={sv.productName} total={an.total} withFees={an.withFees} withoutFees={an.withoutFees} years={years} preTax={preTax} omitted={omitted} gap={gap} place={place} compareHref={compareHref} />
      <EmploymentInferredNote show={!!goalG?.employmentInferred && employmentMatters(sv.wrapperId)} />
      {inputs.returnFromParameter && <Callout tone="info">{r3fees.review.parameterReturn}</Callout>}
      {!inputs.fromGoal && (
        <Callout tone="info">
          {current ? r3fees.review.goalIncomplete : r3fees.review.noGoal}{" "}
          <Link to="/goal" className="text-link hover:underline">
            {r3fees.setGoal}
          </Link>
        </Callout>
      )}
      {an.lines.length === 0 ? (
        <p className="text-muted-foreground">{r3fees.noFees}</p>
      ) : (
        <div className="flex flex-col gap-section lg:grid lg:grid-cols-[3fr_2fr] lg:gap-x-12 lg:items-start">
          <section className="flex flex-col gap-4 min-w-0" aria-labelledby={`${headId}-list`}>
            <h2 id={`${headId}-list`} className="text-xl lg:text-2xl font-semibold">
              {r3fees.listHeading}
            </h2>
            <ol className="flex flex-col gap-3">
              {rows}
              {omitted.includes("deposit") && <NotReportedRow name={r3fees.names.deposit!} />}
            </ol>
            <RemainderLine value={an.remainder} />
            <ThresholdsLine negotiate={an.thresholds.negotiate} avoid={an.thresholds.avoid} />
          </section>
          <div className="flex flex-col gap-6 min-w-0">
            {chartCard}
            <aside className="hidden lg:block bg-card border border-border rounded-lg p-5" aria-label={r3fees.assumptionsTitle}>
              <h3 className="text-lg font-semibold mb-4">{r3fees.assumptionsTitle}</h3>
              {!inputs.fromGoal && <ScenarioDefaults inputs={inputs} />}
              <AssumptionsPanel data={form} suggestion={suggestion} onAdopted={() => setSuggestion(null)} />
            </aside>
          </div>
        </div>
      )}
      {an.lines.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby={`${headId}-sens`}>
          <h2 id={`${headId}-sens`} className="text-xl lg:text-2xl font-semibold">
            {r3fees.sens.title}
          </h2>
          <FeeSensitivityPanel view={sens} an={an} bundle={bundle} onOpen={(f, v) => openField(f, v)} />
        </section>
      )}
      <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm" aria-label="קישורים">
        {workbench && (
          <Link to={`/workbench/tracks/${sv.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
            {r3fees.linksWorkbench}
          </Link>
        )}
        <Link to={sv.kind === "track" ? `/guide/${sv.wrapperId}` : `/guide/${sv.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
          {r3fees.linkGuide}
        </Link>
        {switchable && (
          <Link to={`/switch/${sv.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
            {r3fees.linkSwitch}
          </Link>
        )}
        {sv.kind === "holding" && (
          <Link to="/holdings" className="text-link hover:underline min-h-target inline-flex items-center">
            {r3fees.strip.backHolding}
          </Link>
        )}
        {sv.from === "compare" && (
          <Link to="/goal/compare" className="text-link hover:underline min-h-target inline-flex items-center">
            {r3fees.strip.backCompare}
          </Link>
        )}
      </nav>
      <RulesLine ids={[...new Set([...an.rulesUsed, "PF-13", "PF-39"].filter((id) => rules.has(id)))]} />
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`}>
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {r3fees.assumptionsTitle}
        </h2>
        {panelOpen && !inputs.fromGoal && <ScenarioDefaults inputs={inputs} />}
        {panelOpen && <AssumptionsPanel data={form} suggestion={suggestion} onAdopted={() => setSuggestion(null)} />}
      </Sheet>
    </>,
    back,
  );
}

export { Num };
