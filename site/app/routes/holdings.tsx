// Screen 10: what you already hold (design-spec 13, flows 22 to 24): holdings entered from the annual statement, each
// with what its fees cost over the years the page asks, and, under them, whether holdings of the same type could be
// consolidated and the child-savings check. The holdings and the years are on the device; the saved goal is not read
// (founder, 2026-10-28: only the goal page speaks of a goal).
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r2, r3holdings as copy, r3transfer, site, system } from "../copy";
import type { FormData } from "../components/compare/goal-form";
import { PlanKnobs, type KnobRanges } from "../components/invest/knobs";
import { AddHoldingSheet } from "../components/holdings/add-sheet";
import { HoldingCard } from "../components/holdings/card";
import { ChildSavingsCard, ConsolidationCard, DifferentTypesLine } from "../components/holdings/consolidation";
import { Breadcrumb, PageShell } from "../components/shell";
import { RuleRef, RulesLine } from "../components/provenance";
import { TransferSheet } from "../components/transfer/sheet";
import { Button, Callout, Card, cx } from "../components/kit";
import { loadBundle } from "../lib/bundle";
import type { CompareBundle } from "../lib/compare";
import { fmt } from "../lib/format";
import { feeInputs, type FeeInputs } from "../lib/fees";
import { useInputs } from "../lib/inputs";
import { buildCtx, consolidationGroups, isChild, loadHoldingsBundle, viewOf, type HoldingsBundle } from "../lib/holdings";
import { useHoldings, type Holding } from "../lib/state";
import { bundleLinks } from "../lib/bundle";
import { recordsById } from "../lib/scope";

type HoldingsForm = FormData & { knobs: KnobRanges };

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("holdings-bundle.json", "compare-bundle.json");

export async function loader() {
  const { goalFormData } = await import("../lib/compare.server");
  const { form, today } = goalFormData();
  return { form, today };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function HoldingsPage() {
  const data = useLoaderData<typeof loader>();
  const [hb, setHb] = useState<HoldingsBundle | null>(null);
  const [cb, setCb] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadHoldingsBundle().then(setHb).catch(() => setFailed(true));
    loadBundle().then(setCb).catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...(cb?.rules ?? []), ...(hb?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, pointed: recordsById(cb?.pointed, hb?.pointed), terms: {}, dimensions: Object.fromEntries((cb?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [cb, hb, data.today]);
  return (
    <PageShell current="other" data={provenance}>
      <Screen hb={hb} cb={cb} failed={failed} form={data.form as HoldingsForm} />
    </PageShell>
  );
}

/** How many years the money stays: the one number the fee line runs on that the statement does not give (founder, 2026-10-28). */
function YearsField({ fi, form }: { fi: FeeInputs; form: HoldingsForm }) {
  return <PlanKnobs fi={fi} ranges={form.knobs} pct={form.pct} only={["years"]} />;
}

function Screen({ hb, cb, failed, form }: { hb: HoldingsBundle | null; cb: CompareBundle | null; failed: boolean; form: HoldingsForm }) {
  const { ready, saved, holdings, save, remove, move } = useHoldings();
  const released = useInputs();
  const [sheet, setSheet] = useState<{ editing: Holding | null } | null>(null);
  const [transfer, setTransfer] = useState(false);
  const fi = useMemo(() => (cb ? feeInputs(cb, null, released.state) : null), [cb, released.state]);
  const ctx = useMemo(() => (hb ? buildCtx(hb, cb, fi?.g ?? null) : null), [hb, cb, fi]);
  const views = useMemo(() => (ctx ? holdings.map((h) => viewOf(h, ctx)) : []), [ctx, holdings]);
  const groups = useMemo(() => (ctx && cb ? consolidationGroups(views, ctx) : []), [ctx, cb, views]);
  const loaded = ready && released.ready && !!hb && !!ctx && !!fi;
  const childViews = views.filter((v) => isChild(v.holding.wrapperId));
  const types = new Set(views.filter((v) => !isChild(v.holding.wrapperId)).map((v) => v.holding.wrapperId));
  const nonChild = views.filter((v) => !isChild(v.holding.wrapperId));
  const rules = ctx?.rules ?? {};

  return (
    <div className={cx("flex flex-col gap-6 pt-2 lg:pt-8", holdings.length <= 1 && "mx-auto w-full max-w-3xl")}>
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
        <div className={cx("flex flex-col gap-8", holdings.length > 1 && "lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-10 lg:items-start")}>
          <div className="flex flex-col gap-6 min-w-0">
            {holdings.length > 0 && <YearsField fi={fi!} form={form} />}
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
              {/* audit A59: a deposit already held has no record here yet; the rate comparison is on the idle-cash page */}
              <span>
                {copy.depositsHere.before}
                <Link to="/idle-cash" className="text-link hover:underline">
                  {copy.depositsHere.link}
                </Link>
                {copy.depositsHere.after}
              </span>
            </p>
          </div>

          <aside className={cx("flex flex-col gap-6 min-w-0", holdings.length > 1 && "lg:sticky lg:top-24")}>
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
        {/* audit A70: the device holds one person's data, and a private window or a cleared site loses it */}
        <p className="text-xs text-muted-foreground max-w-measure">
          {r3transfer.onePerDevice} {r3transfer.erasedNote}
        </p>
        <RulesLine ids={["PF-17", "PF-18", "PF-33", "PF-34", "PF-35"].filter((id) => !!rules[id])} />
      </div>

      {hb && <AddHoldingSheet open={sheet !== null} onClose={() => setSheet(null)} hb={hb} rules={rules} value={sheet?.editing ?? null} onSave={(h) => { save(h); setSheet(null); }} />}
      <TransferSheet open={transfer} onClose={() => setTransfer(false)} site={hb?.site} />
    </div>
  );
}

void r2;
