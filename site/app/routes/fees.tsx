// Screen 9: the fee materiality page (design-spec 12, flows 20, 21, 27). What each fee costs over the horizon, which
// is worth negotiating, avoiding or ignoring, with the reference and the words to say. The subject is in the address
// (?wrapper=, ?track=, ?holding=, &from=compare); the numbers come from the saved goal, or from the scenario P-05
// holds. Not pre-rendered beyond the shell: the engine runs here, on the bundles fetched once.
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r2, r3fees, r3holdings, site } from "../copy";
import type { FormData } from "../components/compare/goal-form";
import type { KnobRanges } from "../components/invest/knobs";

/** The goal form's ranges this page reads, with the plan sliders' (P-05). */
type FeeForm = FormData & { knobs: KnobRanges };
import { employmentMatters } from "../components/compare/inferred";
import { OtherAssumptions, PlanKnobs } from "../components/invest/knobs";
import { ChartLegend, ChartReadout, ChartTable, FeeDragChart } from "../components/fees/FeeDragChart";
import { FeeRow, NotReportedRow } from "../components/fees/FeeRow";
import { FeeHeadline, ReasonWithCode, RemainderLine, SubjectStrip, ThresholdsLine } from "../components/fees/parts";
import { FeeSensitivityPanel } from "../components/fees/sensitivity";
import { IconLock } from "../components/icons";
import { Num, NumberLegend, RuleRef, RulesLine } from "../components/provenance";
import { anyWeak } from "../lib/value";
import { Sheet } from "../components/Sheet";
import { Breadcrumb, PageShell } from "../components/shell";
import { Button, Callout, Card, Sentence } from "../components/kit";
import { loadBundle } from "../lib/bundle";
import { type CompareBundle } from "../lib/compare";
import { buildFees, buildHoldingFees, feeInputs, type FeeInputs, feeSensitivity, headlineGap, loadFeesData, parseSubject, rankedFor, ruleMap, softensAvoid, type FeeSensitivity, type FeesData, type FeesResult, type PlanError, type SubjectSpec } from "../lib/fees";
import type { FieldKey } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { useSettled } from "../lib/settled";
import { fmt } from "../lib/format";
import { holdingName, useHolding } from "../lib/holdings";
import { bundleLinks } from "../lib/bundle";
import { playbookWrappers } from "../lib/playbook";
import { recordsById } from "../lib/scope";
import { shown } from "../lib/review";

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
    return { rules, pointed: recordsById(bundle?.pointed, fees?.pointed), terms: {}, dimensions: Object.fromEntries((bundle?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [bundle, fees, data.rules, data.today]);
  return (
    <PageShell current="other" data={provenance}>
      <Page bundle={bundle} fees={fees} failed={failed} form={data.form as FeeForm} publisherNames={data.publisherNames} />
    </PageShell>
  );
}

function Page({ bundle, fees, failed, form, publisherNames }: { bundle: CompareBundle | null; fees: FeesData | null; failed: boolean; form: FeeForm; publisherNames: Record<string, string> }) {
  const { ready } = useInputs();
  const { search } = useLocation();
  const subject = useMemo(() => parseSubject(search), [search]);
  // The pre-rendered page has no address to read: the first client render matches it, then the subject is read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // a body without its own heading (loading, nothing chosen, a failure) gets the page's: `/fees` with no subject showed a callout and
  // no heading at all (2026-10-26)
  const frame = (body: React.ReactNode, back?: { href: string; label: string }, ownHeading?: boolean) => (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={back ?? { href: "/guide", label: site.menuItems[0].label }} current={r3fees.title} />
      {!ownHeading && <h1 className="text-2xl lg:text-3xl font-semibold">{r3fees.title}</h1>}
      {body}
    </div>
  );
  if (!mounted) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  if (!subject)
    return frame(
      <Callout tone="info">
        {r3fees.notFound}
        <NotFoundLinks />
      </Callout>,
    );
  if (failed) return frame(<Callout tone="caution">{r3fees.failed}</Callout>);
  if (!bundle || !fees || !ready) return frame(<p className="text-muted-foreground">{r3fees.loading}</p>);
  return <Body bundle={bundle} fees={fees} form={form} publisherNames={publisherNames} subject={subject} frame={frame} />;
}

/** Where to go from a page with nothing to show: the two links on their own line under the message, not run into its last line. */
function NotFoundLinks() {
  return (
    <span className="flex flex-wrap gap-x-4 mt-1">
      <Link to="/guide" className="text-link hover:underline min-h-target inline-flex items-center">
        {r3fees.notFoundLinks.guide}
      </Link>
      {shown("/holdings") && (
        <Link to="/holdings" className="text-link hover:underline min-h-target inline-flex items-center">
          {r3fees.notFoundLinks.holdings}
        </Link>
      )}
    </span>
  );
}

function errorText(e: PlanError, wrapperId: string): React.ReactNode {
  switch (e.kind) {
    case "no-wrapper":
      return (
        <>
          {r3fees.notFound}
          <NotFoundLinks />
        </>
      );
    case "no-terms":
      return (
        <>
          {r3fees.review.noTerms}
          {shown("/holdings") && (
            <>
              {" "}
              <Link to="/holdings" className="text-link hover:underline">
                {r3fees.notFoundLinks.holdings}
              </Link>
            </>
          )}
        </>
      );
    case "need-input":
      return (
        <>
          {r3fees.review.needInput}
          {(() => {
            const n = r3fees.review.needNames;
            return /insurance/.test(e.detail) ? n.insurance : /salary/i.test(e.detail) ? n.salary : /employment|hishtalmut/i.test(e.detail) ? n.employment : /age/i.test(e.detail) ? n.age : r3fees.review.needGeneric;
          })()}.
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

function Body({ bundle, fees, form, publisherNames, subject, frame }: { bundle: CompareBundle; fees: FeesData; form: FeeForm; publisherNames: Record<string, string>; subject: SubjectSpec; frame: (b: React.ReactNode, back?: { href: string; label: string }, ownHeading?: boolean) => React.ReactNode }) {
  const released = useInputs();
  const holding = useHolding(subject.kind === "holding" ? subject.holdingId : null);
  // The page's own numbers: what the person entered on this device, the site's example (P-05) for the rest; never the saved goal
  // (founder, 2026-10-28). The sliders follow the hand; the run, with the comparison behind "avoid", waits until it rests.
  const live = useMemo(() => feeInputs(bundle, null, released.state), [bundle, released.state]);
  const inputs = useSettled(live, 250);
  const result: FeesResult | null = useMemo(() => {
    try {
      if (subject.kind === "holding") return holding.holding ? buildHoldingFees(bundle, fees, holding.holding, inputs) : null;
      return buildFees(bundle, fees, subject, inputs);
    } catch {
      return { kind: "error", error: { kind: "no-run", code: "failed" } } as FeesResult;
    }
  }, [bundle, fees, subject, inputs, holding.holding]);
  const [hover, setHover] = useState<number | null>(null);
  const [sens, setSens] = useState<FeeSensitivity | null>(null);
  const [reductions, setReductions] = useState<Record<string, number | null>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<{ field: FieldKey; value: number } | null>(null);
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

  const openField = (field: FieldKey, suggested: number) => {
    setSuggestion({ field, value: suggested });
    setPanelOpen(true);
  };
  const wrapperId = subject.kind === "wrapper" ? subject.wrapperId : subject.kind === "holding" ? (holding.holding?.wrapperId ?? null) : result?.kind === "ok" ? result.subject.wrapperId : null;
  // a holding's amount and monthly deposit are its own (the statement's), so only the years and the return move it
  const plan = (
    <FeePlan fi={live} form={form} holding={subject.kind === "holding"} onOpen={() => {
      setSuggestion(null);
      setPanelOpen(true);
    }} />
  );
  const sheet = (
    <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`}>
      <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
        {r3fees.assumptionsTitle}
      </h2>
      {panelOpen && suggestion && <SuggestionLine s={suggestion} onDone={() => setSuggestion(null)} />}
      {panelOpen && <OtherAssumptions inflation={live.values.inflation} pct={form.pct} employment={employmentMatters(wrapperId)} age={ageMatters(wrapperId, released.state.age) ? form.age : undefined} />}
    </Sheet>
  );

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
          <NumberLegend institution={bundle ? anyWeak(bundle.wrappers.flatMap((w) => [w.cashRate, ...Object.values(w.feeValues)])) : false} />
          {own && holding.holding && (
            <p className="text-lg">
              {r3fees.strip.holding}
              <bdi className="font-medium">{holdingName(holding.holding)}</bdi>
            </p>
          )}
        </header>
        <Callout tone={result.error.kind === "needs-pf36" ? "blocked" : "caution"}>{errorText(result.error, subject.kind === "wrapper" ? subject.wrapperId : "")}</Callout>
        {/* a missing number (age, employment) is entered here, on the page's own fields */}
        {result.error.kind === "need-input" && (
          <>
            {plan}
            {sheet}
          </>
        )}
        {own && (
          <Link to="/holdings" className="text-link hover:underline min-h-target inline-flex items-center self-start">
            {r3fees.strip.backHolding}
          </Link>
        )}
      </>,
      own ? { href: "/holdings", label: r3fees.notFoundLinks.holdings } : undefined,
      true,
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
  // A9, A18: the plain sentence above the chart, the subject's place among every option on the page's numbers, the softened badge
  const gap = headlineGap(an);
  const place = rankedFor(result.comparison, sv.wrapperId);
  const switchable = playbookWrappers.includes(sv.wrapperId);
  const providersLink = sv.wrapperId === "brokerage-account";
  const otherRecords = workbench ? { href: `/workbench/tracks/${sv.wrapperId}`, label: r3fees.linksWorkbench } : providersLink ? { href: `/workbench/providers/${sv.wrapperId}`, label: r3fees.linkProviders } : null;

  const rows = an.lines.map((l) => (
    <FeeRow key={l.line} line={l} an={an} subject={sv} years={years} thresholds={an.thresholds} reduction={reductions[l.line] ?? null} onReduce={(n) => setReductions((r) => ({ ...r, [l.line]: n }))} rules={rules} soften={softensAvoid(l.verdict, place)} />
  ));
  const chartCard = hasChart && (
    <section className="flex flex-col gap-3" aria-labelledby={`${headId}-chart`}>
      <h2 id={`${headId}-chart`} className="text-xl lg:text-2xl font-semibold">
        {r3fees.chart.title}
      </h2>
      <Card className="flex flex-col gap-4">
        <ChartLegend an={an} />
        <FeeDragChart an={an} horizonYears={years} hover={hover} onHover={setHover} />
        {grossNote && an.exitGap && (
          <Sentence size="xs" tone="muted">
            {r3fees.review.chartGross.before}
            <Num value={an.exitGap} />
            {r3fees.review.chartGross.after}
          </Sentence>
        )}
        <ChartReadout an={an} year={hover ?? Math.round(an.series!.exitMonth / 12)} />
        <ChartTable an={an} />
      </Card>
    </section>
  );

  return frame(
    <>
      <SubjectStrip subject={sv} publisherNames={publisherNames} otherRecords={otherRecords} />
      <FeeHeadline product={sv.productName} total={an.total} withFees={an.withFees} withoutFees={an.withoutFees} years={years} preTax={preTax} omitted={omitted} gap={gap} place={place} />
      {plan}
      {an.lines.length === 0 ? (
        <p className="text-muted-foreground">{r3fees.noFees}</p>
      ) : (
        <div className="flex flex-col gap-section lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-12 lg:items-start">
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
      {sheet}
    </>,
    back,
    true,
  );
}

/** Wrappers whose run reads the age (an exit or annuity rule by age), as the guide page asks it; or an age already entered. */
const AGE_WRAPPERS = new Set(["pension-comprehensive", "pension-general", "provident-for-annuity", "kupat-gemel-lehashkaa", "ira-provident"]);
const ageMatters = (wrapperId: string | null, age: number | null) => age !== null || (!!wrapperId && AGE_WRAPPERS.has(wrapperId));

/** The page's numbers (founder, 2026-10-28): the plan sliders, as on the indices page, and the rest behind a button. */
function FeePlan({ fi, form, holding, onOpen }: { fi: FeeInputs; form: FeeForm; holding: boolean; onOpen: () => void }) {
  const entered = fi.values;
  const example = [entered.amount, entered.monthly, entered.years, entered.returnV].every((v) => v.state !== "entered");
  return (
    <section className="flex flex-col gap-3" aria-label={r3fees.assumptionsTitle}>
      <PlanKnobs fi={fi} ranges={form.knobs} pct={form.pct} only={holding ? ["years", "ret"] : undefined} />
      <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
        <Button variant="secondary" className="!h-9 px-3 text-sm" onClick={onOpen}>
          {r3fees.othersButton}
        </Button>
        {example && <span>{r3fees.siteExample}</span>}
      </p>
    </section>
  );
}

/** A sensitivity row's value, offered to adopt: it becomes an entered value, as a slider would make it. */
function SuggestionLine({ s, onDone }: { s: { field: FieldKey; value: number }; onDone: () => void }) {
  const { setEntered } = useInputs();
  const key = s.field === "horizonYears" ? "horizon_years" : s.field === "return" ? "A-01" : s.field === "inflation" ? "A-02" : null;
  if (!key) return null;
  return (
    <p className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-4">
      <span>{r2.result.suggestion}:</span>
      <bdi dir="ltr" className="font-medium">
        {s.field === "horizonYears" ? fmt.years(s.value) : fmt.pct(s.value)}
      </bdi>
      <Button variant="secondary" className="!h-9 px-3 text-sm" onClick={() => {
        setEntered(key, s.value);
        onDone();
      }}>
        {r2.result.adopt}
      </Button>
    </p>
  );
}

export { Num };
