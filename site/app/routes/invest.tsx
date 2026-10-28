// "השקעה במדד" (D28, spec research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses (or adds), the options
// for owning it, the cheapest broker for each, and the cheapest complete way for the plan. `/indices` chooses nothing (D27);
// `/indices/<x>` opens the known index `index-<x>` (pre-rendered); a custom index lives on the device and opens at `/indices?custom=<id>`.
import { useEffect, useId, useMemo, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/invest";
import { invest as c, site } from "../copy";
import { AssumptionsPanel } from "../components/compare/assumptions";
import type { FormData } from "../components/compare/goal-form";
import { feePlanItems, ScenarioDefaults } from "../components/fees/chips";
import { IndexChips, PlanBlock } from "../components/invest/chips";
import { HousesSection } from "../components/invest/houses";
import { FundsSection } from "../components/invest/funds";
import { AccountColumn, FundColumn, PairResult, pickOfHeadline, allFunds, type Pick } from "../components/invest/pair";
import { LabelSheetHost } from "../components/kit";
import { Headline, IndexHeader } from "../components/invest/sections";
import { Foot, Steps } from "../components/invest/steps";
import { Callout, Disclosure } from "../components/kit";
import { Sheet } from "../components/Sheet";
import { PageShell } from "../components/shell";
import { RulesLine } from "../components/provenance";
import { loadBundle, bundleLinks } from "../lib/bundle";
import { type CompareBundle } from "../lib/compare";
import { planInputs } from "../lib/plan-inputs";
import { GoalsProvider, useGoals, type Presets } from "../lib/goal";
import { useInputs } from "../lib/inputs";
import { buildInvest, exposureIdOfSlug, indexById, INDICES_PATH, knownIndices, refOfCustom, type CustomIndex, type IndexRef } from "../lib/invest";
import { loadWorkbenchBundle, type WorkbenchBundle, type WorkbenchInputs } from "../lib/providers";
import { useInvestState } from "../lib/state";
import { recordsById } from "../lib/scope";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("workbench-bundle.json", "compare-bundle.json");

/** Every index is one route (`indices/:slug?`) whose data is the same for each: moving between indices, or to a custom one,
 * keeps the loaded data and fetches nothing, so a click on a phone does not wait for the network. The index comes from the address. */
export function shouldRevalidate() {
  // asked only when this route stays on screen; its data is fixed at build
  return false;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { loadExposures } = await import("../lib/instruments.server");
  const { goalFormData } = await import("../lib/compare.server");
  const indices = loadExposures()
    .filter((e) => e.kind === "equity_index")
    .map((e) => ({ id: e.id, name: e.names.he[0] ?? e.id, israeli: e.constituents_israeli === true }));
  const id = params.slug ? exposureIdOfSlug(params.slug) : null;
  if (id && !indices.some((i) => i.id === id)) throw new Response("Not found", { status: 404 });
  return { ...goalFormData(), indices };
}

/** The known index the address names (`/indices/<x>` is `index-<x>`), or null. */
const exposureIdOf = (slug: string | undefined, indices: readonly { id: string }[]): string | null => {
  const id = slug ? exposureIdOfSlug(slug) : null;
  return id && indices.some((i) => i.id === id) ? id : null;
};

export function meta({ loaderData: data, params }: Route.MetaArgs) {
  const id = data ? exposureIdOf(params.slug, data.indices) : null;
  const name = id ? data?.indices.find((i) => i.id === id)?.name : null;
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
    return { rules, pointed: recordsById(compare?.pointed, wb?.pointed), terms: {}, dimensions: Object.fromEntries((compare?.checklist ?? []).map((x) => [x.id, x.name])), today: data.today };
  }, [compare, wb, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance} wide>
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
  const exposureId = exposureIdOf(useParams().slug, data.indices);
  const { current, resolved } = useGoals();
  const released = useInputs();
  const invest = useInvestState();
  // The person may type only one number here (this page may be all they use): the goal's empty numbers take the site's example.
  const fi = useMemo(() => planInputs(compare, current, resolved, released.state), [compare, current, resolved, released.state]);
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
  const index: IndexRef | null = useMemo(() => (exposureId ? indexById(wb, exposureId) : customId ? (customs.find((x) => x.id === customId) ? refOfCustom(customs.find((x) => x.id === customId)!) : null) : null), [wb, exposureId, customId, customs]);
  const known: IndexRef[] = data.indices.map((i) => ({ id: i.id, name: i.name, israeli: i.israeli, exposure: null, custom: null, oneLine: null }));

  // the person compares their own account by picking it in the account list (founder, 2026-10-27: the separate "החשבון שלכם" field was redundant)
  const yourBroker: string | null = null;
  const view = useMemo(() => (index ? buildInvest({ bundle: wb, index, plan, yourBroker }) : null), [wb, index, plan, yourBroker]);

  const [panelOpen, setPanelOpen] = useState(false);
  const headId = useId();
  // A chip opens the same fields the fees page opens, on the same current goal: a value typed here is the value there.
  const planItems = feePlanItems(fi, { return: plan.returnFromParameter ? c.plan.retExample : c.plan.retEntered });

  // the account and the fund the two lists are priced on: the person's picks on this index, else the cheapest way (2026-10-27)
  const [picked, setPicked] = useState<{ index: string; pick: Pick } | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const validPick = (p: Pick) => !!view && allFunds(view).some((f) => f.rec.id === p.fund) && view.providers.some((x) => x.id === p.house);
  const pick: Pick | null = view && index && picked && picked.index === index.id && validPick(picked.pick) ? picked.pick : view ? pickOfHeadline(view) : null;
  const onPick = (p: Pick) => index && setPicked({ index: index.id, pick: p });
  // an index with no fund records (a custom one): the houses and their broker costs, and the request for funds
  const [genericHouse, setGenericHouse] = useState<string | null>(null);
  const house = genericHouse ?? view?.genericHeadline?.cell.providerId ?? view?.houses.find((h) => h.generic)?.provider.id ?? null;

  const rules = ["ETF-31", "ETF-24", "ETF-51", "TXS-09", "TXF-22"].filter((id) => wb.rules.some((r) => r.id === id));

  const chips = (
    <IndexChips
      known={known}
      customs={customs}
      selectedId={index?.id ?? null}
      bundle={wb}
      onRemove={(id) => {
        invest.remove(id);
        if (index?.id === id) navigate(INDICES_PATH);
      }}
      onRename={invest.rename}
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
          <PlanBlock items={planItems} onOpen={() => setPanelOpen(true)} fx={wb.fx} today={data.today} hasGoal={plan.fromGoal} />
        </div>
        {customId && !exposureId && !index && <Callout tone="caution">{c.custom.missing}</Callout>}
        {!index || !view ? (
          <p className="text-muted-foreground">{c.chips.none}</p>
        ) : (
          <>
            <IndexHeader view={view} others={knownIndices(wb)} onChangeAnswer={index.custom ? () => invest.add({ ...index.custom!, israeli: !index.custom!.israeli }) : null} />
            {pick ? (
              <>
                <PairResult view={view} bundle={wb} plan={plan} pick={pick} onPick={onPick} />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,32.5rem)] xl:grid-cols-[minmax(0,5fr)_2.5rem_minmax(0,7fr)] items-start">
                  <AccountColumn view={view} bundle={wb} years={plan.years} pick={pick} onPick={onPick} />
                  <span aria-hidden="true" className="hidden lg:grid place-items-center size-9 mt-10 rounded-full border border-input bg-popover text-xl text-muted-foreground justify-self-center">
                    +
                  </span>
                  <FundColumn view={view} today={data.today} pick={pick} onPick={onPick} filter={labelFilter} onFilter={setLabelFilter} />
                </div>
              </>
            ) : (
              <>
                <Headline view={view} />
                <HousesSection view={view} chosen={house} onPick={(id) => setGenericHouse(id)} />
                <FundsSection view={view} houseId={house} onHouse={(id) => setGenericHouse(id)} mayaHref={wb.links.maya?.href ?? null} />
              </>
            )}
            <div className="flex flex-col divide-y divide-border border-y border-border">
              <Disclosure label={c.folds.steps} spread>
                <Steps view={view} monthly={plan.values.monthly} pick={pick} />
              </Disclosure>
            </div>
            <Foot view={view} />
            <RulesLine ids={rules} />
          </>
        )}
      </div>
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`}>
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {c.plan.panelTitle}
        </h2>
        {panelOpen && !fi.fromGoal && <ScenarioDefaults inputs={fi} />}
        {panelOpen && <AssumptionsPanel data={data.form as FormData} suggestion={null} onAdopted={() => {}} noAnytime />}
      </Sheet>
    </LabelSheetHost>
  );
}
