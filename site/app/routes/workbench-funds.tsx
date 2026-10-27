// Screen 14: the fund-variant page (design-spec 18, flows 30, 33). Every fund the site knows for an exposure, from the
// fund lists (none collected yet) and the collected records, ranked where its details are collected, listed where a tax
// rule is open, not evaluated where they are not, with the security number, domicile, distribution policy and fees. The
// subject is the exposure in the address (?provider, &orders); the assumptions are saved on the device per exposure.
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/workbench-funds";
import { r4workbench as c, site } from "../copy";
import { AssumptionsPanel } from "../components/compare/assumptions";
import type { FormData } from "../components/compare/goal-form";
import { SavedGoalStrip } from "../components/compare/strip";
import { useFlip } from "../components/compare/rows";
import { IconExternal } from "../components/icons";
import { NumberLegend, RulesLine } from "../components/provenance";
import { Sheet } from "../components/Sheet";
import { Breadcrumb, PageShell } from "../components/shell";
import { Button, Callout } from "../components/ui";
import { WorkbenchTabs } from "../components/workbench/workbench";
import { FundChips, VariantControls, VariantFields } from "../components/workbench/funds/controls";
import { GroupLine, ListLine, VariantCoverage, CopyForFounder } from "../components/workbench/funds/parts";
import { FundVariantRow, VariantDetail } from "../components/workbench/funds/row";
import { loadBundle } from "../lib/bundle";
import { runGoalOf, type CompareBundle } from "../lib/compare";
import { feeInputs } from "../lib/fees";
import { GoalsProvider, hasMeaning, useGoals, type Presets } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { BROKERAGE, loadWorkbenchBundle, type WorkbenchBundle, type WorkbenchInputs } from "../lib/providers";
import { buildFundVariants, withExposureReturn, matchesVariant, parseVariantQuery, sortVariants, useFundAssumptions, variantQueryString, type FundVariantRowView, type SortKey, type VariantQuery } from "../lib/variants";
import { bundleLinks } from "../lib/bundle";
import { recordsById } from "../lib/scope";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("workbench-bundle.json", "compare-bundle.json");

export async function loader({ params }: Route.LoaderArgs) {
  const { exposureHref, loadExposures } = await import("../lib/instruments.server");
  const { goalFormData } = await import("../lib/compare.server");
  const exposure = loadExposures().find((e) => e.id === params.exposure);
  if (!exposure) throw new Response("Not found", { status: 404 });
  return { ...goalFormData(), exposureId: exposure.id, exposureName: exposure.names.he[0] ?? exposure.id, exposureHref: exposureHref(exposure.id) };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${c.funds.title.before}${data?.exposureName ?? ""}${c.funds.title.after} · ${site.name}` }];
}

type Data = Awaited<ReturnType<typeof loader>>;

export default function WorkbenchFunds() {
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
        <Page wb={wb} compare={compare} failed={failed} data={data} presets={presets} />
      </PageShell>
    </GoalsProvider>
  );
}

function Head({ data }: { data: Data }) {
  return (
    <header className="flex flex-col gap-3">
      <Breadcrumb parent={{ href: data.exposureHref, label: c.funds.back }} current={`${c.funds.title.before}${data.exposureName}${c.funds.title.after}`} />
      <h1 className="text-2xl lg:text-3xl font-semibold">
        {c.funds.title.before}
        <bdi>{data.exposureName}</bdi>
        {c.funds.title.after}
      </h1>
    </header>
  );
}

function Page({ wb, compare, failed, data, presets }: { wb: WorkbenchBundle | null; compare: CompareBundle | null; failed: boolean; data: Data; presets: Presets }) {
  const { status, current } = useGoals();
  const { search } = useLocation();
  // The pre-rendered page has no address to read: the first client render matches it, then the subject is read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const frame = (body: React.ReactNode) => (
    <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
      <Head data={data} />
      {body}
    </div>
  );
  if (!mounted || (!failed && (!wb || !compare || status === "loading" || !current))) return frame(<p className="text-muted-foreground">{c.funds.loading}</p>);
  if (failed || !wb || !compare) return frame(<Callout tone="caution">{c.funds.failed}</Callout>);
  if (status === "old-version") return null;
  return <Body wb={wb} compare={compare} data={data} presets={presets} search={search} />;
}

const PAGE = 50;

function Body({ wb, compare, data, presets, search }: { wb: WorkbenchBundle; compare: CompareBundle; data: Data; presets: Presets; search: string }) {
  const navigate = useNavigate();
  const { current, resolved } = useGoals();
  const released = useInputs();
  const query = useMemo(() => parseVariantQuery(search), [search]);
  const setQuery = (patch: Partial<VariantQuery>) => navigate({ search: variantQueryString({ ...query, ...patch }) }, { replace: true, preventScrollReset: true });
  const goalG = current && resolved && hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  const fi = useMemo(() => feeInputs(compare, goalG, released.state), [compare, JSON.stringify(goalG), released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const ownReturn = current?.exposures?.[data.exposureId]?.return;
  const inputs: WorkbenchInputs = useMemo(
    () => withExposureReturn({
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
    }, ownReturn),
    [fi, ownReturn],
  );
  const assumptions = useFundAssumptions(data.exposureId);
  const result = useMemo(() => buildFundVariants({ bundle: wb, exposureId: data.exposureId, query, inputs, assumptions: assumptions.value, exposureHref: data.exposureHref }), [wb, data.exposureId, data.exposureHref, query, inputs, assumptions.value]);

  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");
  const [shown, setShown] = useState<Record<string, number>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [detail, setDetail] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const headId = useId();
  const view = result.kind === "ok" ? result.view : null;
  const effectiveSort: SortKey = view?.waitsForReturn && sort === "rank" ? "name" : sort;
  const rows = view?.rows ?? [];
  const filtered = filter.trim() ? rows.filter((r) => matchesVariant(r, filter)) : rows;
  const groups = (["ranked", "listed", "not-evaluated"] as const).map((k) => ({ key: k, rows: sortVariants(filtered.filter((r) => r.kind === k), effectiveSort) })).filter((g) => g.rows.length > 0);
  const flipRef = useFlip(groups.map((g) => g.rows.map((r) => r.id).join(",")).join("|"));
  const providers = wb.snapshots.filter((s) => (s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker") && !s.missing).sort((a, b) => a.provider.name_he.localeCompare(b.provider.name_he, "he")).map((s) => ({ id: s.id, name: s.provider.name_he }));
  const form = data.form as FormData;
  const onField = (f: "yield" | "rate" | "return") => (f === "return" ? navigate("/goal") : setPanelOpen(true));

  const head = <Head data={data} />;
  const firstFund = view?.rows.find((r) => r.recordId)?.recordId;
  const providerHref = `/workbench/providers/${BROKERAGE}${firstFund ? `?fund=${encodeURIComponent(firstFund)}` : ""}`;
  const tabs = <WorkbenchTabs current="fund" wrapperId={BROKERAGE} providerHref={providerHref} fundHref={`/workbench/funds/${data.exposureId}`} />;

  if (result.kind === "error") {
    return (
      <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
        {head}
        <Callout tone="caution">{result.code === "no-exposure" ? c.funds.noExposure : result.detail ?? c.funds.failed}</Callout>
      </div>
    );
  }
  const v = result.view;
  const noFundsAtAll = v.rows.length === 0 && !v.lists.israeli && !v.lists.tase;
  const detailRow: FundVariantRowView | undefined = detail ? v.rows.find((r) => r.id === detail.id) : undefined;
  const ruleIds = v.ruleIds;

  const fields = (
    <VariantFields
      view={v}
      assumptions={assumptions.value}
      providers={providers}
      onProvider={(id) => setQuery({ provider: id })}
      onOrders={(n) => setQuery({ orders: n })}
      patch={assumptions.patch}
      reset={() => assumptions.reset()}
    />
  );

  return (
    <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
      {head}
      <ListLine lists={v.lists} links={wb.links} />
      <SavedGoalStrip variant="compact" presets={presets} meta={data.meta} today={data.today} emptyLine />
      {tabs}
      <FundChips view={v} inputs={inputs} assumptions={assumptions.value} onOpen={() => setPanelOpen(true)} />
      {v.waitsForReturn && (
        <Callout tone="info">
          {c.funds.needsReturn}{" "}
          <Link to="/goal" className="text-link hover:underline">
            {c.funds.needsReturnLink}
          </Link>
        </Callout>
      )}
      {v.cashLike && (
        <Callout tone="info">
          {c.funds.cashLike}{" "}
          <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">
            {c.funds.cashLink}
          </Link>
        </Callout>
      )}
      <div className="flex flex-col gap-section lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-10 lg:items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <VariantControls filter={filter} sort={effectiveSort} onFilter={setFilter} onSort={setSort} enteredReturn={!v.waitsForReturn} />
          <h2 className="text-xl lg:text-2xl font-semibold">{c.funds.listHeading}</h2>
          <NumberLegend />
          {noFundsAtAll ? (
            <Callout tone="info">
              <span className="flex flex-col gap-1">
                <span>{c.funds.noFunds(data.exposureName)}</span>
                <span className="flex flex-wrap items-center gap-x-4">
                  {wb.links.maya && (
                    <a href={wb.links.maya.href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-9">
                      {c.funds.listLine.links.maya} <IconExternal size={14} />
                    </a>
                  )}
                  <CopyForFounder text={data.exposureName} />
                </span>
              </span>
            </Callout>
          ) : groups.length === 0 ? (
            <p className="text-muted-foreground">{c.funds.noMatch}</p>
          ) : (
            <div ref={flipRef as unknown as React.Ref<HTMLDivElement>} className="flex flex-col gap-6">
              {groups.map((g) => {
                const limit = shown[g.key] ?? PAGE;
                const visible = g.rows.slice(0, limit);
                return (
                  <section key={g.key} className="flex flex-col gap-3" aria-labelledby={`${headId}-${g.key}`}>
                    <h3 id={`${headId}-${g.key}`} className="text-lg font-semibold">
                      {(g.rows.length === 1 ? c.funds.groupsOne : c.funds.groups)[g.key === "ranked" && v.waitsForReturn ? "waits" : g.key]} <span className="text-muted-foreground font-normal">(<bdi dir="ltr">{g.rows.length}</bdi>)</span>
                    </h3>
                    <ol className="flex flex-col gap-3">
                      {visible.map((r) => (
                        <FundVariantRow key={r.id} row={r} onDetail={(id, el) => setDetail({ id, anchor: el })} onField={onField} />
                      ))}
                    </ol>
                    {g.rows.length > limit && (
                      <Button variant="secondary" className="self-start" onClick={() => setShown((s) => ({ ...s, [g.key]: limit + PAGE }))}>
                        {c.funds.more(g.rows.length - limit)}
                      </Button>
                    )}
                  </section>
                );
              })}
            </div>
          )}
          <GroupLine held={v.held} />
          <VariantCoverage view={v} today={data.today} />
        </div>
        <aside className="hidden lg:flex flex-col gap-4 bg-card border border-border rounded-lg p-5" aria-label={c.funds.sheet.title}>
          <h3 className="text-lg font-semibold">{c.funds.sheet.title}</h3>
          {fields}
        </aside>
      </div>
      <RulesLine ids={ruleIds} />

      <Sheet open={detail !== null} onClose={() => setDetail(null)} anchor={detail?.anchor ?? null} pc="popover" height={78} labelledBy={`${headId}-detail`}>
        {detailRow && <VariantDetail row={detailRow} />}
      </Sheet>
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={80} labelledBy={`${headId}-as`}>
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {c.funds.sheet.title}
        </h2>
        {panelOpen && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{c.funds.sheet.goalLead}</p>
              <AssumptionsPanel data={form} suggestion={null} onAdopted={() => undefined} />
            </div>
            {fields}
          </div>
        )}
      </Sheet>
    </div>
  );
}
