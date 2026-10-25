// "השקעה במדד" (D28, spec research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses (or adds), the options
// for owning it, the cheapest broker for each, and the cheapest complete way for the plan. `/invest` chooses nothing (D27);
// `/invest/:exposureId` opens one known index (pre-rendered); a custom index lives on the device and opens at `/invest?custom=<id>`.
import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/invest";
import { invest as c, site } from "../copy";
import { IndexChips, PlanChips } from "../components/invest/chips";
import { BrokerGrid } from "../components/invest/grid";
import { FundsSection } from "../components/invest/funds";
import { LabelSheetHost } from "../components/invest/parts";
import { Headline, IndexHeader, Options, Worth } from "../components/invest/sections";
import { Foot, Steps } from "../components/invest/steps";
import { Callout } from "../components/kit";
import { PageShell } from "../components/shell";
import { RulesLine } from "../components/provenance";
import { loadBundle, bundleLinks } from "../lib/bundle";
import { runGoalOf, type CompareBundle } from "../lib/compare";
import { feeInputs } from "../lib/fees";
import { GoalsProvider, hasMeaning, useGoals, type Presets } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { buildInvest, indexById, providersOfInvest, refOfCustom, type CustomIndex, type IndexRef, type OptionId } from "../lib/invest";
import { loadWorkbenchBundle, type WorkbenchBundle, type WorkbenchInputs } from "../lib/providers";
import { useInvestState } from "../lib/state";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("workbench-bundle.json", "compare-bundle.json");

export async function loader({ params }: Route.LoaderArgs) {
  const { loadExposures } = await import("../lib/instruments.server");
  const { goalFormData } = await import("../lib/compare.server");
  const indices = loadExposures()
    .filter((e) => e.kind === "equity_index")
    .map((e) => ({ id: e.id, name: e.names.he[0] ?? e.id, israeli: e.constituents_israeli === true }));
  const id = params.exposureId ?? null;
  if (id && !indices.some((i) => i.id === id)) throw new Response("Not found", { status: 404 });
  return { ...goalFormData(), exposureId: id, indices };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const name = data?.exposureId ? data.indices.find((i) => i.id === data.exposureId)?.name : null;
  return [{ title: `${c.metaTitle}${name ? ` · ${name}` : ""} · ${site.name}` }];
}

type Data = Awaited<ReturnType<typeof loader>>;

export default function Invest() {
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
    return { rules, terms: {}, dimensions: Object.fromEntries((compare?.checklist ?? []).map((x) => [x.id, x.name])), today: data.today };
  }, [compare, wb, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance}>
        <Page wb={wb} compare={compare} failed={failed} data={data} />
      </PageShell>
    </GoalsProvider>
  );
}

function Head() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl lg:text-3xl font-semibold max-w-measure">{c.h1}</h1>
      <p className="text-muted-foreground">{c.sub}</p>
    </header>
  );
}

function Page({ wb, compare, failed, data }: { wb: WorkbenchBundle | null; compare: CompareBundle | null; failed: boolean; data: Data }) {
  const { status, current } = useGoals();
  const { search } = useLocation();
  // The pre-rendered page has no address to read and no saved state: the first client render matches it, then they are read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const frame = (body: React.ReactNode) => (
    <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
      <Head />
      {body}
    </div>
  );
  if (!mounted || (!failed && (!wb || !compare || status === "loading" || !current))) return frame(<p className="text-muted-foreground">{c.loading}</p>);
  if (failed || !wb || !compare) return frame(<Callout tone="caution">{c.failed}</Callout>);
  if (status === "old-version") return null;
  return <Body wb={wb} compare={compare} data={data} search={search} />;
}

function Body({ wb, compare, data, search }: { wb: WorkbenchBundle; compare: CompareBundle; data: Data; search: string }) {
  const navigate = useNavigate();
  const { current, resolved } = useGoals();
  const released = useInputs();
  const invest = useInvestState();
  const goalG = current && resolved && hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  const fi = useMemo(() => feeInputs(compare, goalG, released.state), [compare, JSON.stringify(goalG), released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan: WorkbenchInputs = useMemo(
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

  const customs: CustomIndex[] = invest.customIndices;
  const customId = new URLSearchParams(search).get("custom");
  const index: IndexRef | null = useMemo(() => (data.exposureId ? indexById(wb, data.exposureId) : customId ? (customs.find((x) => x.id === customId) ? refOfCustom(customs.find((x) => x.id === customId)!) : null) : null), [wb, data.exposureId, customId, customs]);
  const known: IndexRef[] = data.indices.map((i) => ({ id: i.id, name: i.name, israeli: i.israeli, exposure: null, custom: null, oneLine: null }));

  const brokers = useMemo(() => providersOfInvest(wb).filter((s) => !s.missing).map((s) => ({ id: s.id, name: s.provider.name_he })), [wb]);
  const yourBroker = invest.broker && brokers.some((b) => b.id === invest.broker) ? invest.broker : null;
  const view = useMemo(() => (index ? buildInvest({ bundle: wb, index, plan, yourBroker }) : null), [wb, index, plan, yourBroker]);

  const [picked, setPicked] = useState<{ index: string; option: OptionId } | null>(null);
  const selected = picked && index && picked.index === index.id ? picked.option : view?.headline?.option ?? view?.options.find((o) => o.exists && o.bestWay)?.id ?? view?.options.find((o) => o.exists)?.id ?? null;

  const rules = ["ETF-31", "ETF-24", "ETF-51", "TXS-09", "TXF-22"].filter((id) => wb.rules.some((r) => r.id === id));

  const chips = (
    <IndexChips
      known={known}
      customs={customs}
      selectedId={index?.id ?? null}
      bundle={wb}
      onRemove={(id) => {
        invest.remove(id);
        if (index?.id === id) navigate("/invest");
      }}
      onSave={(x) => invest.add(x)}
      onGo={(p) => navigate(p)}
    />
  );

  return (
    <LabelSheetHost>
      <div className="flex flex-col gap-section pt-2 lg:pt-8">
        <div className="flex flex-col gap-5">
          <Head />
          {chips}
          <PlanChips plan={plan} fx={wb.fx} today={data.today} brokers={brokers} yourBroker={yourBroker} onBroker={(id) => invest.setBroker(id)} hasGoal={plan.fromGoal} />
        </div>
        {customId && !data.exposureId && !index && <Callout tone="caution">{c.custom.missing}</Callout>}
        {!index || !view ? (
          <p className="text-muted-foreground">{c.chips.none}</p>
        ) : (
          <>
            <IndexHeader view={view} onChangeAnswer={index.custom ? () => invest.add({ ...index.custom!, israeli: !index.custom!.israeli }) : null} />
            <Headline view={view} />
            <Worth view={view} />
            <Options view={view} selected={selected} onSelect={(id) => setPicked({ index: index.id, option: id })} />
            <BrokerGrid view={view} />
            <FundsSection view={view} optionId={selected} mayaHref={wb.links.maya?.href ?? null} />
            <Steps view={view} monthly={plan.values.monthly} />
            <Foot view={view} />
            <RulesLine ids={rules} />
          </>
        )}
      </div>
    </LabelSheetHost>
  );
}
