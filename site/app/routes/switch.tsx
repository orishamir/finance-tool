// Screen 15: the switching playbook (design-spec 19, flows 31, 33). The steps of a wrapper in the order the rule base indexes
// them, each rendered from its rule records with the strength of its source; the record-your-offer card, the switching-cost
// line (F-66) for a known pair and the post-switch checklist. Pre-rendered per wrapper without a pair; the pair, the cost line
// and the ticks fill in after hydration. `/switch/{wrapper}?from&to&fundFrom&fundTo` (from and to are a company or a holding).
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/switch";
import { r4playbook as c, site } from "../copy";
import { PostSwitchChecklist } from "../components/playbook/checklist";
import { SwitchingCostLine } from "../components/playbook/cost";
import { RecordOfferCard } from "../components/playbook/offer-card";
import { PlaybookStep } from "../components/playbook/step";
import { PlaybookSubjectStrip } from "../components/playbook/strip";
import { sameCompany, useCostView } from "../components/playbook/use-cost";
import { RuleRef, RulesLine } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, SegmentedControl } from "../components/ui";
import { GoalsProvider, type Presets } from "../lib/goal";
import { checklistFor, parsePlaybookQuery, playbookQueryString, SWITCH_RULES_HREF, type PlaybookQuery, type PlaybookStep as StepData, type SummaryItem, type Side, type Strength } from "../lib/playbook";
import { BROKERAGE } from "../lib/providers";
import { useHoldings } from "../lib/state";
import { useInputs } from "../lib/inputs";
import { recordsById } from "../lib/scope";

export async function loader({ params }: Route.LoaderArgs) {
  const { playbookPage } = await import("../lib/playbook.server");
  const { goalContext } = await import("../lib/compare.server");
  const page = playbookPage(params.wrapper);
  if (!page) throw new Response("Not found", { status: 404 });
  return { ...page, presets: goalContext().presets };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${c.title.before}${data?.wrapperName ?? ""}${c.title.after} · ${site.name}` }];
}

/** Every rule the page rendered or cited, in the order met. */
function renderedRules(steps: StepData[], wrapperId: string, extra: string[]): string[] {
  const out = new Set<string>();
  for (const st of steps) {
    st.ruleIds.forEach((r) => out.add(r));
    st.noRule?.known.forEach((k) => out.add(k.ruleId));
    st.figures.forEach((f) => f.value && out.add(f.ruleId));
    st.experience.forEach((e) => out.add(e.id));
  }
  checklistFor(wrapperId).forEach((i) => i.ruleIds.forEach((r) => out.add(r)));
  extra.forEach((r) => out.add(r));
  return [...out];
}

export default function Switch() {
  const data = useLoaderData<typeof loader>();
  return (
    <GoalsProvider presets={data.presets as Presets}>
      <Body />
    </GoalsProvider>
  );
}

function Body() {
  const data = useLoaderData<typeof loader>();
  const { search } = useLocation();
  const navigate = useNavigate();
  // The pre-rendered page has no address to read: the first client render matches it, then the pair is read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const query = useMemo<PlaybookQuery>(() => (mounted ? parsePlaybookQuery(search) : { from: null, to: null, fundFrom: null, fundTo: null, share: null }), [mounted, search]);
  const setQuery = (patch: Partial<PlaybookQuery>) => navigate({ search: playbookQueryString({ ...query, ...patch }) }, { replace: true, preventScrollReset: true });

  const { holdings, ready: holdingsReady } = useHoldings();
  const resolve = (id: string | null): Side | null => {
    if (!id) return null;
    const co = data.companies.find((x) => x.id === id);
    if (co) return { kind: "company", id, name: co.name };
    const h = holdings.find((x) => x.id === id);
    return h ? { kind: "holding", id, name: h.company.name, wrapperId: h.wrapperId } : null;
  };
  // a holding id the device does not know falls back to no pair (design-spec 19 edge cases)
  const from = resolve(query.from);
  const to = resolve(query.to);
  const same = sameCompany(from, to);
  const ready = mounted && holdingsReady;
  const rules = data.rules as unknown as Record<string, RuleRecord>;
  const { view, wb } = useCostView({ wrapperId: data.wrapperId, rules, today: data.today, query, from, to, ready });
  const steps = data.steps as unknown as StepData[];
  const strengths = useMemo(() => Object.fromEntries(Object.entries(rules).map(([id, r]) => [id, r.strength as Strength])), [rules]);
  const brokerage = data.wrapperId === BROKERAGE;
  const provenanceRules = useMemo(() => (wb ? { ...Object.fromEntries(wb.rules.map((r) => [r.id, r as RuleRecord])), ...rules } : rules), [wb, rules]);
  const costRules = view?.kind === "engine" && "ruleIds" in view.cost ? view.cost.ruleIds : [];
  const ids = renderedRules(steps, data.wrapperId, costRules);
  const checklist = checklistFor(data.wrapperId);
  const oneStep = c.oneStep[data.wrapperId];
  const hasOffer = steps.some((s) => s.offerBefore);
  const anyOpen = steps.some((s) => s.open);
  const hishtalmut = data.wrapperId === "keren-hishtalmut";
  const summary = data.summary as unknown as SummaryItem[];
  // the saved profile says self-employed: there is no employer to notify (A56); nothing is shown while the field is empty
  const selfEmployed = useInputs().state.employment === "self-employed";
  const [fundOptions, setFundOptions] = useState<{ id: string; name: string }[] | null>(null);
  const fundsNeeded = brokerage && mounted;
  useEffect(() => {
    if (!fundsNeeded) return;
    import("../lib/providers").then((m) => m.loadWorkbenchBundle()).then((w) => setFundOptions(w.funds.map((f) => ({ id: f.id, name: `${f.names.he[0] ?? f.names.en[0] ?? f.id} · ${f.identifiers.tase_number ?? f.identifiers.isin ?? f.id}` })))).catch(() => setFundOptions([]));
  }, [fundsNeeded]);

  const costCard = view ? (
    <SwitchingCostLine view={view}>
      {hishtalmut && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-sm text-muted-foreground">{c.cost.shareLabel}</span>
          <SegmentedControl
            label={c.cost.shareLabel}
            options={[
              { value: "all", label: c.cost.shareAll },
              { value: "part", label: c.cost.sharePart },
            ]}
            value={query.share === null ? "all" : "part"}
            onChange={(v) => setQuery({ share: v === "all" ? null : 50 })}
          />
        </div>
      )}
    </SwitchingCostLine>
  ) : null;
  const checklistBlock =
    checklist.length > 0 ? (
      <section className="flex flex-col gap-3" aria-labelledby="checklist-h">
        <h2 id="checklist-h" className="text-xl font-semibold">
          {c.checklist.heading}
        </h2>
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <PostSwitchChecklist wrapperId={data.wrapperId} strengths={strengths} />
        </div>
      </section>
    ) : null;

  return (
    <PageShell current="other" data={{ rules: provenanceRules, pointed: { ...(data.pointed as unknown as Record<string, RuleRecord>), ...recordsById(wb?.pointed) }, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
        <header className="flex flex-col gap-3 max-w-page">
          <Breadcrumb parent={{ href: "/holdings", label: c.back }} current={`${c.title.before}${data.wrapperName}${c.title.after}`} />
          <h1 className="text-2xl lg:text-3xl font-semibold">
            {c.title.before}
            <bdi>{data.wrapperName}</bdi>
            {c.title.after}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground max-w-measure">{c.lede}</p>
          {brokerage && <p className="text-sm text-muted-foreground max-w-measure">{c.brokerageNote}</p>}
          <PlaybookSubjectStrip
            from={from}
            to={to}
            same={same}
            companies={data.companies}
            funds={brokerage ? (fundOptions ?? []) : undefined}
            fundFrom={query.fundFrom}
            fundTo={query.fundTo}
            onPair={(p) => setQuery(p)}
            onFunds={(p) => setQuery(p)}
          />
        </header>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] lg:gap-10 lg:items-start max-w-page">
          <div className="flex flex-col gap-5 lg:gap-6 min-w-0">
            {costCard && <div className="lg:hidden">{costCard}</div>}
            {oneStep && <Callout tone="info">{oneStep}</Callout>}
            {summary.length > 0 && (
              <section className="flex flex-col gap-3 rounded-lg bg-card border border-border p-4 md:p-6" aria-labelledby="summary-h">
                <h2 id="summary-h" className="text-xl font-semibold">
                  {c.summary.heading}
                </h2>
                <p className="text-sm text-muted-foreground">{c.summary.lede}</p>
                <ul className="flex flex-col gap-2.5 max-w-measure">
                  {summary.map((it) => (
                    <li key={`${it.topic}-${it.ruleId}`} className="text-sm">
                      <span className="font-medium">{c.summary.topics[it.topic] ?? it.topic}: </span>
                      {it.text} <RuleRef id={it.ruleId} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="flex flex-col gap-4" aria-labelledby="steps-h">
              <h2 id="steps-h" className="text-xl lg:text-2xl font-semibold">
                {c.stepsHeading}
              </h2>
              <ol className="flex flex-col gap-4">
                {steps.map((st) => (
                  <PlaybookStep
                    key={st.n}
                    step={st}
                    skip={selfEmployed && st.ruleIds[0] === "SW-10" ? c.skipEmployer : undefined}
                    offer={
                      st.offerBefore ? (
                        <li className="lg:hidden list-none">
                          <RecordOfferCard brokerage={brokerage} wrapperId={data.wrapperId} rules={rules} />
                        </li>
                      ) : undefined
                    }
                  />
                ))}
              </ol>
            </section>
            {checklistBlock && <div className="lg:hidden">{checklistBlock}</div>}
            <nav className="flex flex-wrap gap-x-6 text-sm" aria-label="קישורים">
              <Link to="/holdings" className="text-link hover:underline min-h-target inline-flex items-center">
                {c.links.holdings}
              </Link>
              {data.hasProviders && (
                <Link to={`/workbench/providers/${data.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
                  {c.links.providers}
                </Link>
              )}
              <Link to={`/guide/${data.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
                {c.links.guide}
              </Link>
              <Link to={SWITCH_RULES_HREF} className="text-link hover:underline min-h-target inline-flex items-center">
                {c.links.rules}
              </Link>
            </nav>
            {anyOpen && <p className="text-xs text-muted-foreground">{c.incomplete}</p>}
            <RulesLine ids={ids} />
          </div>

          <aside className="hidden lg:flex flex-col gap-5 sticky top-24 self-start max-h-[calc(100dvh-7rem)] overflow-y-auto">
            {costCard}
            {hasOffer && <RecordOfferCard brokerage={brokerage} wrapperId={data.wrapperId} rules={rules} />}
            {checklistBlock}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
