// Screen 10: what you already hold (design-spec 13, flows 22 to 24): holdings entered from the annual statement, each
// with the fit mark against the saved goal, what its fees cost over the horizon, and, under them, whether holdings of the
// same type could be consolidated and the child-savings check. The saved goal and the holdings are on the device.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r2, r3holdings as copy, site, system } from "../copy";
import { SavedGoalStrip } from "../components/compare/strip";
import { goalTitle } from "../components/compare/goal-form";
import { AddHoldingSheet } from "../components/holdings/add-sheet";
import { HoldingCard } from "../components/holdings/card";
import { ChildSavingsCard, ConsolidationCard, DifferentTypesLine } from "../components/holdings/consolidation";
import { Breadcrumb, PageShell } from "../components/shell";
import { RuleRef, RulesLine } from "../components/provenance";
import { TransferSheet } from "../components/transfer/sheet";
import { Button, Callout, Card } from "../components/ui";
import { loadBundle } from "../lib/bundle";
import type { CompareBundle } from "../lib/compare";
import { fmt } from "../lib/format";
import { GoalsProvider, isBlank, useGoals, type Presets } from "../lib/goal";
import { buildCtx, consolidationGroups, isChild, loadHoldingsBundle, viewOf, type HoldingsBundle } from "../lib/holdings";
import { useHoldings, type Holding } from "../lib/state";

export async function loader() {
  const { goalContext } = await import("../lib/compare.server");
  return goalContext();
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function HoldingsPage() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  const [hb, setHb] = useState<HoldingsBundle | null>(null);
  const [cb, setCb] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadHoldingsBundle().then(setHb).catch(() => setFailed(true));
    loadBundle().then(setCb).catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...(cb?.rules ?? []), ...(hb?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, terms: {}, dimensions: Object.fromEntries((cb?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [cb, hb, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance}>
        <Screen hb={hb} cb={cb} failed={failed} presets={presets} meta={data.meta} today={data.today} />
      </PageShell>
    </GoalsProvider>
  );
}

function GoalStrip({ presets, meta, today }: { presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { status, current } = useGoals();
  if (status === "loading") return null;
  if (!current || isBlank(current)) {
    return (
      <p className="text-sm flex flex-wrap items-center gap-x-2">
        <span className="text-muted-foreground">{copy.fitNoGoal}</span>
        <Link to="/goal" className="text-link min-h-target inline-flex items-center hover:underline">
          {copy.fitNoGoalLink}
        </Link>
      </p>
    );
  }
  return <SavedGoalStrip variant="compact" presets={presets} meta={meta} today={today} label={copy.stripLine} />;
}

function Screen({ hb, cb, failed, presets, meta, today }: { hb: HoldingsBundle | null; cb: CompareBundle | null; failed: boolean; presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { ready, saved, holdings, save, remove, move } = useHoldings();
  const goals = useGoals();
  const [sheet, setSheet] = useState<{ editing: Holding | null } | null>(null);
  const [transfer, setTransfer] = useState(false);
  const hasGoal = goals.status !== "loading" && goals.current && !isBlank(goals.current) && goals.resolved;
  const ctx = useMemo(
    () => (hb ? buildCtx(hb, cb, hasGoal ? { current: goals.current!, resolved: goals.resolved! } : null, goals.current ? goalTitle(goals.current) : "") : null),
    [hb, cb, hasGoal, goals.current, goals.resolved],
  );
  const views = useMemo(() => (ctx ? holdings.map((h) => viewOf(h, ctx)) : []), [ctx, holdings]);
  const groups = useMemo(() => (ctx && cb ? consolidationGroups(views, ctx) : []), [ctx, cb, views]);
  const loaded = ready && !!hb && !!ctx;
  const childViews = views.filter((v) => isChild(v.holding.wrapperId));
  const types = new Set(views.filter((v) => !isChild(v.holding.wrapperId)).map((v) => v.holding.wrapperId));
  const nonChild = views.filter((v) => !isChild(v.holding.wrapperId));
  const rules = ctx?.rules ?? {};

  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
      </header>
      {hb?.period.stale && (
        <Callout tone="caution">
          {system.staleBanner.before} <bdi dir="ltr">{fmt.date(`${hb.period.stale.since}-01`.slice(0, 10))}</bdi>. {system.staleBanner.after}
        </Callout>
      )}
      {failed && !hb && <Callout tone="caution">{copy.loadFailed}</Callout>}
      {!failed && !loaded && <p className="text-muted-foreground">{copy.loading}</p>}

      {loaded && (
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-10 lg:items-start">
          <div className="flex flex-col gap-6 min-w-0">
            <div className="lg:hidden">
              <GoalStrip presets={presets} meta={meta} today={today} />
            </div>
            {holdings.length === 0 ? (
              <Card className="flex flex-col gap-4">
                <p className="text-lg max-w-measure">{copy.empty}</p>
                <p className="text-sm flex flex-wrap items-center gap-x-2">
                  <RuleRef id="PF-33" />
                  <RuleRef id="PF-22" />
                </p>
                <Button variant="primary" className="self-start" onClick={() => setSheet({ editing: null })}>
                  {copy.add}
                </Button>
              </Card>
            ) : (
              <section className="flex flex-col gap-4" aria-labelledby="h-list">
                <h2 id="h-list" className="text-xl font-semibold">
                  {copy.listHeading}
                </h2>
                <ul className="flex flex-col gap-4">
                  {views.map((v, i) => (
                    <li key={v.holding.id}>
                      <HoldingCard view={v} ctx={ctx!} index={i} count={views.length} onEdit={() => setSheet({ editing: v.holding })} onDelete={() => remove(v.holding.id)} onMove={(d) => move(v.holding.id, d)} />
                    </li>
                  ))}
                </ul>
                <div>
                  <Button variant="secondary" onClick={() => setSheet({ editing: null })}>
                    {copy.add}
                  </Button>
                </div>
              </section>
            )}
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5">
              <span>{copy.wrappersLater}</span>
              <RuleRef id="BANK-32" />
            </p>
          </div>

          <aside className="flex flex-col gap-6 min-w-0 lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <GoalStrip presets={presets} meta={meta} today={today} />
            </div>
            {nonChild.length > 0 && (
              <section className="flex flex-col gap-3" aria-labelledby="h-cons">
                <h2 id="h-cons" className="text-xl font-semibold">
                  {copy.consolidation.heading}
                </h2>
                {groups.length > 0 ? (
                  groups.map((g) => <ConsolidationCard key={g.wrapperId} group={g} views={views.filter((v) => g.holdingIds.includes(v.holding.id))} rules={rules} />)
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.consolidation.oneHolding}</p>
                )}
                {types.size > 1 && <DifferentTypesLine workbenchHref={`/workbench/tracks/${[...types][0]}`} />}
              </section>
            )}
            {childViews.length > 0 && (
              <section className="flex flex-col gap-3" aria-labelledby="h-child">
                <h2 id="h-child" className="text-xl font-semibold">
                  {copy.child.heading}
                </h2>
                <ChildSavingsCard rules={rules} bankHoldings={childViews.filter((v) => v.holding.child?.route === "bank").length} />
                {childViews.length > 1 && <p className="text-sm text-muted-foreground">{copy.child.twoPlans}</p>}
              </section>
            )}
          </aside>
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{saved ? copy.saveLine : copy.unsaved}</span>
          <Button variant="quiet" onClick={() => setTransfer(true)}>
            {copy.transferLink}
          </Button>
        </p>
        <RulesLine ids={["PF-17", "PF-18", "PF-33", "PF-34", "PF-35"].filter((id) => !!rules[id])} />
      </div>

      {hb && <AddHoldingSheet open={sheet !== null} onClose={() => setSheet(null)} hb={hb} rules={rules} value={sheet?.editing ?? null} onSave={(h) => { save(h); setSheet(null); }} />}
      <TransferSheet open={transfer} onClose={() => setTransfer(false)} site={hb?.site} />
    </div>
  );
}

void r2;
