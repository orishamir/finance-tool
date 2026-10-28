// Screen 13: the provider workbench (design-spec 17, flows 28, 29, 33). Every bank and broker that offers the wrapper,
// ranked by what its tariff would cost the person over the horizon for one fund and their own behaviour, at the list
// price, a published average or their own offer; the deciding fee type, ties, minimums and protection; the providers the
// site could not compare, with the reason. The subject is in the address (?fund, &orders, &channel, &level, &vs); the
// engine runs here, on the bundles fetched once. For a provident wrapper the page is a sourced listing, not a ranking.
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/workbench-providers";
import { r4workbench as c, site } from "../copy";
import { AssumptionsPanel } from "../components/compare/assumptions";
import type { FormData } from "../components/compare/goal-form";
import { SavedGoalStrip } from "../components/compare/strip";
import { useFlip } from "../components/compare/rows";
import { NumberLegend, RulesLine } from "../components/provenance";
import { Sheet } from "../components/Sheet";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card } from "../components/ui";
import { WorkbenchTabs } from "../components/workbench/workbench";
import { AmountChips, BehaviourCard, FeeLevelSwitch, SubjectStrip } from "../components/workbench/providers/controls";
import { ChartLegend, ChartReadout, ChartTable, CumulativeCostChart } from "../components/workbench/providers/chart";
import { ProviderCoverage } from "../components/workbench/providers/coverage";
import { EnteredOfferCard } from "../components/workbench/providers/offer-card";
import { BarLegend, NotComparableRow, ProviderRow, RowDetail, type RowCtx } from "../components/workbench/providers/row";
import { ProvidentListing } from "../components/workbench/providers/provident";
import { loadBundle } from "../lib/bundle";
import { runGoalOf, type CompareBundle } from "../lib/compare";
import { feeInputs } from "../lib/fees";
import { GoalsProvider, hasMeaning, useGoals, type Presets } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { useOffers } from "../lib/offers";
import { useOwnTerms } from "../lib/own-rate";
import {
  BROKERAGE,
  PROVIDENT_WRAPPERS,
  buildProviderWorkbench,
  buildProvidentListing,
  loadWorkbenchBundle,
  parseProviderQuery,
  providerQueryString,
  shortName,
  subjectOf,
  type Channel,
  type ProviderQuery,
  type ProviderWorkbenchView,
  type UiLevel,
  type WorkbenchBundle,
  type WorkbenchInputs,
} from "../lib/providers";
import { useFundAssumptions } from "../lib/variants";
import { bundleLinks } from "../lib/bundle";
import { recordsById } from "../lib/scope";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("workbench-bundle.json", "compare-bundle.json");

export async function loader({ params }: Route.LoaderArgs) {
  const { providerWrapperIds } = await import("../lib/providers.server");
  const { goalFormData } = await import("../lib/compare.server");
  const { loadWrappers } = await import("../lib/data.server");
  if (!providerWrapperIds().includes(params.wrapper)) throw new Response("Not found", { status: 404 });
  const wrapper = loadWrappers().find((w) => w.id === params.wrapper);
  return { ...goalFormData(), wrapperId: params.wrapper, wrapperName: wrapper?.names.he[0] ?? params.wrapper };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const t = data && (PROVIDENT_WRAPPERS as readonly string[]).includes(data.wrapperId) ? c.providers.provident.title : c.providers.title;
  return [{ title: `${t.before}${data?.wrapperName ?? ""}${t.after} · ${site.name}` }];
}

export default function WorkbenchProviders() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  const [wb, setWb] = useState<WorkbenchBundle | null>(null);
  const [compare, setCompare] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([loadBundle(), loadWorkbenchBundle()])
      .then(([b, w]) => {
        setCompare(b);
        setWb(w);
      })
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...(compare?.rules ?? []), ...(wb?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, pointed: recordsById(compare?.pointed, wb?.pointed), terms: {}, dimensions: Object.fromEntries((compare?.checklist ?? []).map((x) => [x.id, x.name])), today: data.today };
  }, [compare, wb, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance}>
        <Page wb={wb} compare={compare} failed={failed} data={data} presets={presets} rules={provenance.rules} />
      </PageShell>
    </GoalsProvider>
  );
}

function Header({ wrapperId, wrapperName, children }: { wrapperId: string; wrapperName: string; children?: React.ReactNode }) {
  // a provident wrapper is chosen by company, not by bank or broker (A35)
  const title = (PROVIDENT_WRAPPERS as readonly string[]).includes(wrapperId) ? c.providers.provident.title : c.providers.title;
  return (
    <header className="flex flex-col gap-3">
      <Breadcrumb parent={{ href: `/guide/${wrapperId}`, label: c.providers.back }} current={`${title.before}${wrapperName}${title.after}`} />
      <h1 className="text-2xl lg:text-3xl font-semibold">
        {title.before}
        <bdi>{wrapperName}</bdi>
        {title.after}
      </h1>
      {children}
    </header>
  );
}

function Page({ wb, compare, failed, data, presets, rules }: { wb: WorkbenchBundle | null; compare: CompareBundle | null; failed: boolean; data: Awaited<ReturnType<typeof loader>>; presets: Presets; rules: Record<string, RuleRecord> }) {
  const { status, current } = useGoals();
  const { search } = useLocation();
  // The pre-rendered page has no address to read: the first client render matches it, then the subject is read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const head = <Header wrapperId={data.wrapperId} wrapperName={data.wrapperName} />;
  const frame = (body: React.ReactNode) => <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">{body}</div>;
  if (!mounted || (!failed && (!wb || !compare || status === "loading" || !current))) return frame(<>{head}<p className="text-muted-foreground">{c.providers.loading}</p></>);
  if (failed || !wb || !compare) return frame(<>{head}<Callout tone="caution">{c.providers.failed}</Callout></>);
  if (status === "old-version") return null;
  if ((PROVIDENT_WRAPPERS as readonly string[]).includes(data.wrapperId)) return frame(<>{head}<ProvidentPage wb={wb} data={data} /></>);
  return <Body wb={wb} compare={compare} data={data} presets={presets} rules={rules} search={search} />;
}

function ProvidentPage({ wb, data }: { wb: WorkbenchBundle; data: Awaited<ReturnType<typeof loader>> }) {
  const listing = useMemo(() => buildProvidentListing(wb, data.wrapperId), [wb, data.wrapperId]);
  return (
    <>
      <WorkbenchTabs current="provider" wrapperId={data.wrapperId} />
      <ProvidentListing listing={listing} wrapperId={data.wrapperId} />
      <nav className="flex flex-wrap gap-x-6 text-sm" aria-label="קישורים">
        <Link to={`/guide/${data.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
          {c.providers.links.guide}
        </Link>
      </nav>
    </>
  );
}

function Body({ wb, compare, data, presets, rules, search }: { wb: WorkbenchBundle; compare: CompareBundle; data: Awaited<ReturnType<typeof loader>>; presets: Presets; rules: Record<string, RuleRecord>; search: string }) {
  const navigate = useNavigate();
  const { current, resolved } = useGoals();
  const released = useInputs();
  const offersApi = useOffers();
  const query = useMemo(() => parseProviderQuery(search), [search]);
  const setQuery = (patch: Partial<ProviderQuery>) => navigate({ search: providerQueryString({ ...query, ...patch }) }, { replace: true, preventScrollReset: true });

  const goalG = current && resolved && hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  const [ownTerms, setOwnTerm] = useOwnTerms(current?.id ?? "");
  const goalCtx = { id: current?.id ?? null, terms: ownTerms, set: setOwnTerm };
  const fi = useMemo(() => feeInputs(compare, goalG, released.state), [compare, JSON.stringify(goalG), released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const inputs: WorkbenchInputs = useMemo(
    () => ({
      amountNow: Math.max(0, fi.g.amountNow - fi.g.available),
      monthly: fi.g.monthly,
      years: fi.g.horizonYears,
      grossReturn: (fi.g.returnPct ?? 0) / 100,
      inflation: (fi.values.inflation.value as number) / 100,
      age: fi.g.age,
      income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
      values: fi.values,
      fromGoal: fi.fromGoal,
      returnFromParameter: fi.returnFromParameter,
    }),
    [fi],
  );
  const subject = useMemo(() => subjectOf(wb, query.fund), [wb, query.fund]);
  const assumptions = useFundAssumptions(subject?.exposureId ?? null);
  const result = useMemo(() => buildProviderWorkbench({ bundle: wb, wrapperId: data.wrapperId, query, inputs, offers: offersApi.offers, assumptions: assumptions.value }), [wb, data.wrapperId, query, inputs, offersApi.offers, assumptions.value]);

  const [hover, setHover] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [detail, setDetail] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [offerFor, setOfferFor] = useState<{ id: string; anchor: HTMLElement | null } | null>(null);
  const headId = useId();
  const view = result.kind === "ok" ? result.view : null;
  const flipRef = useFlip(view ? view.rows.filter((r) => r.kind === "ranked").map((r) => r.id).join("|") : "");
  const exposure = subject ? wb.exposures.find((e) => e.id === subject.exposureId) : undefined;
  const exposureName = exposure?.names.he[0] ?? "";
  const firstExposureWithFunds = wb.exposures.find((e) => wb.funds.some((f) => f.exposure_id === e.id));

  const head = <Header wrapperId={data.wrapperId} wrapperName={data.wrapperName} />;
  const providerParam = query.vs ? `?provider=${encodeURIComponent(query.vs)}` : "";
  const goalStrip = (
    <>
      <SavedGoalStrip variant="compact" presets={presets} meta={data.meta} today={data.today} emptyLine />
      {!inputs.fromGoal && <p className="text-sm text-muted-foreground">{c.providers.noGoal}</p>}
    </>
  );
  const fundHref = subject ? `/workbench/funds/${subject.exposureId}${providerParam}` : firstExposureWithFunds ? `/workbench/funds/${firstExposureWithFunds.id}` : null;
  const tabs = <WorkbenchTabs current="provider" wrapperId={data.wrapperId} fundHref={fundHref} />;

  if (result.kind === "error") {
    const e = result.code;
    const fundLink = result.subject ? `/workbench/funds/${result.subject.exposureId}` : firstExposureWithFunds ? `/workbench/funds/${firstExposureWithFunds.id}` : "/guide";
    return (
      <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8 max-w-page">
        {head}
        {result.subject && <SubjectStrip subject={result.subject} exposureName={exposureName} />}
        {goalStrip}
        {tabs}
        <Callout tone={e === "engine" ? "caution" : "info"}>
          {e === "no-fund" && c.providers.noFund}
          {e === "fund-type" && c.providers.cannotRun.fundType}
          {e === "need-rate" && c.providers.cannotRun.needRate(result.currency ?? "")}
          {e === "need-yield" && c.providers.cannotRun.needYield}
          {e === "other-currency" && c.funds.reasons.otherCurrency(...((result.detail ?? "|").split("|") as [string, string]))}
          {e === "engine" && (
            <>
              {c.providers.cannotRun.engine} <bdi dir="ltr">{result.detail}</bdi>
            </>
          )}{" "}
          <Link to={fundLink} className="text-link hover:underline">
            {c.providers.changeFund}
          </Link>
        </Callout>
      </div>
    );
  }

  const v = result.view;
  const ranked = v.rows.filter((r) => r.kind === "ranked");
  const notComparable = v.rows.filter((r) => r.kind === "not-comparable");
  const names = Object.fromEntries(v.rows.map((r) => [r.id, shortName(r.id, r.name)]));
  const ctx: RowCtx = {
    years: v.years,
    level: v.level,
    names,
    theta: v.theta,
    rules,
    onOffer: (id, el) => setOfferFor({ id, anchor: el }),
    onDetail: (id, el) => setDetail({ id, anchor: el }),
    onVs: (id) => setQuery({ vs: id }),
    ...(data.wrapperId === BROKERAGE && goalCtx.id !== null
      ? {
          compareUse: {
            has: (id: string) => !!compare.wrappers.find((w) => w.id === BROKERAGE)?.providers?.[id],
            active: goalCtx.terms[BROKERAGE]?.provider ?? null,
            noGoal: goalG === null,
            onUse: (id: string) => {
              goalCtx.set(BROKERAGE, "provider", id);
              navigate("/goal/compare");
            },
            onClear: () => goalCtx.set(BROKERAGE, "provider", undefined),
          },
        }
      : {}),
  };
  const allMissing = ranked.length === 0;
  const detailRow = detail ? v.rows.find((r) => r.id === detail.id) : null;
  const offerRow = offerFor ? v.rows.find((r) => r.id === offerFor.id) : null;
  const channelWord = c.providers.behaviour.channelOptions[v.behaviour.channelId];
  const chartHasEntered = v.chart.some((l) => l.role !== null && l.entered);
  const ruleIds = [...new Set([...v.ruleIds, "BRK-26", "BRK-33", "BRK-37"])].filter((id) => !!rules[id]);
  const openOffer = (id?: string) => {
    const target = id ?? ranked[0]?.id ?? notComparable[0]?.id;
    if (target) setOfferFor({ id: target, anchor: null });
  };

  const table = (
    <section className="flex flex-col gap-3 min-w-0" aria-labelledby={`${headId}-list`}>
      <h2 id={`${headId}-list`} className="text-xl lg:text-2xl font-semibold">
        {c.providers.tableHeading}
      </h2>
      {allMissing ? (
        <Callout tone="caution">{c.providers.allMissing}</Callout>
      ) : (
        <>
          <NumberLegend />
          <BarLegend />
          <ol ref={flipRef} className="flex flex-col gap-3">
            {ranked.map((r) => (
              <ProviderRow key={r.id} view={r} ctx={ctx} />
            ))}
          </ol>
        </>
      )}
      {v.level === "entered" && <p className="text-sm text-muted-foreground">{c.providers.offer.belowTable}</p>}
      {notComparable.length > 0 && (
        <section className="flex flex-col gap-3 mt-2" aria-labelledby={`${headId}-nc`}>
          <h3 id={`${headId}-nc`} className="text-lg font-semibold">
            {c.notComparable.heading}
          </h3>
          <ol className="flex flex-col gap-3">
            {notComparable.map((r) => (
              <NotComparableRow key={r.id} view={r} ctx={ctx} instrumentClass={v.subject.instrumentClass} channelWord={channelWord} />
            ))}
          </ol>
        </section>
      )}
      <ProviderCoverage coverage={v.coverage} today={data.today} instrumentClass={v.subject.instrumentClass} channelWord={channelWord} />
    </section>
  );

  const chartCard = !allMissing && (
    <section className="flex flex-col gap-3 min-w-0" aria-labelledby={`${headId}-chart`}>
      <h2 id={`${headId}-chart`} className="text-xl lg:text-2xl font-semibold">
        {c.providers.chart.title}
      </h2>
      <Card className="flex flex-col gap-4">
        <ChartLegend lines={v.chart} />
        <CumulativeCostChart lines={v.chart} years={v.years} today={data.today} hover={hover} onHover={setHover} />
        <p className="text-xs text-muted-foreground">
          {c.providers.chart.realNote}
          {chartHasEntered && ` ${c.providers.chart.dashed}`}
        </p>
        <ChartReadout lines={v.chart} year={hover ?? v.years} today={data.today} />
        <ChartTable lines={v.chart} today={data.today} />
        <AmountChips inputs={inputs} onOpen={() => setPanelOpen(true)} />
      </Card>
    </section>
  );

  return (
    <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
      {head}
      <SubjectStrip subject={v.subject} exposureName={exposureName} />
      {goalStrip}
      {tabs}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        <BehaviourCard
          view={v}
          inputs={inputs}
          onOrders={(n) => setQuery({ orders: n })}
          onChannel={(ch: Channel | null) => setQuery({ channel: ch })}
          onOpenAssumptions={() => setPanelOpen(true)}
        />
        <FeeLevelSwitch
          level={v.level}
          averagesAvailable={v.averagesAvailable}
          averageSource={v.averageSource}
          offerCount={v.offerCount}
          hasOffers={v.offerCount > 0}
          links={wb.links}
          onChange={(l: UiLevel) => setQuery({ level: l })}
          onEnter={() => openOffer()}
        />
      </div>
      {v.pending.length > 0 && <Callout tone="caution">{c.providers.incompleteRules}</Callout>}
      <div className="flex flex-col gap-section lg:grid lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] lg:gap-x-12 lg:items-start">
        {table}
        <div className="lg:sticky lg:top-24 flex flex-col gap-6 min-w-0">{chartCard}</div>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm" aria-label="קישורים">
        {exposure && (
          <Link to={`/workbench/funds/${exposure.id}`} className="text-link hover:underline min-h-target inline-flex items-center">
            {c.providers.links.funds(exposureName)}
          </Link>
        )}
        <Link to={`/guide/${data.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
          {c.providers.links.guide}
        </Link>
      </nav>
      <RulesLine ids={ruleIds} lead={v.pending.length > 0 ? <span className="text-caution-foreground">{c.providers.pendingLine(v.pending.join(", "))}</span> : undefined} />

      <Sheet open={detail !== null} onClose={() => setDetail(null)} anchor={detail?.anchor ?? null} pc="popover" height={80} labelledBy={`${headId}-detail`}>
        {detailRow && <RowDetail view={detailRow} ctx={ctx} />}
      </Sheet>
      <Sheet open={offerFor !== null} onClose={() => setOfferFor(null)} anchor={offerFor?.anchor ?? null} pc="popover" height={80} labelledBy={`${headId}-offer`}>
        {offerRow && offerFor && (
          <EnteredOfferCard
            key={offerRow.id}
            view={{ ...offerRow, name: names[offerRow.id] ?? offerRow.name }}
            offer={offersApi.offers[offerRow.id]}
            today={data.today}
            writable={offersApi.writable}
            showFx={v.behaviour.fxCurrency !== null}
            headId={`${headId}-offer`}
            onSave={(o) => {
              offersApi.save(o);
              if (v.level !== "entered") setQuery({ level: "entered" });
            }}
            onClear={() => offersApi.clear(offerRow.id)}
            onClose={() => setOfferFor(null)}
          />
        )}
      </Sheet>
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`}>
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {c.providers.behaviour.title}
        </h2>
        {panelOpen && <AssumptionsPanel data={data.form as FormData} suggestion={null} onAdopted={() => undefined} leaveOut={["anytime", "insurance"]} />}
      </Sheet>
    </div>
  );
}

export type { ProviderWorkbenchView };
