// "Hedged or not, across the dollar" (F-94, F-93; founder 2026-10-29, option A of research/specs/2026-10-29-hedging): the pair of each
// kind across the dollar's yearly change against the shekel within P-02's range, the hedged one's band and where the two meet, the
// stretches of the plan's length since 2000 shaded; beside it, the dollar's change in each calendar year. What happened, never a forecast.
import { useMemo } from "react";
import { stretchRange, yearlyChanges } from "@finance-tool/engine";
import { invest as c } from "../../copy";
import { kindScenarios, type InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { Num } from "../provenance";
import type { SiteValue } from "../../lib/value";
import { Card, ChartLegend, ScenarioChart, SourceLine, Swatch, YearBars } from "../kit";
import { allFunds, isoPct, kindPairs, signedPct, type Pick } from "./pair";

export function DollarSection({ view, bundle, plan, pick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; pick: Pick }) {
  const range = bundle.dollarRange!;
  const pairs = kindPairs(view, pick);
  const sc = useMemo(
    () => (pairs ? kindScenarios({ bundle, index: view.index, plan, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house }, lo: range.lo, hi: range.hi }) : null),
    [bundle, view.index, plan, pairs?.unhedged.fund, pairs?.unhedged.house, pairs?.hedged.fund, pairs?.hedged.house, range.lo, range.hi],
  );
  const history = bundle.fxHistory;
  const years = yearlyChanges(history?.points ?? []);
  const h = Math.round(plan.years);
  const stretch = history ? stretchRange(history.points, h) : null;
  if (!pairs || !sc) return null;
  const funds = allFunds(view);
  const name = (p: Pick) => funds.find((f) => f.rec.id === p.fund)?.name ?? p.fund;
  const from = history ? Number(history.points[0]!.date.slice(0, 4)) : 0;
  const nisK = (v: number) => Math.round(v).toLocaleString("he-IL");
  const pct1 = (x: number) => isoPct(x, 1);
  const lo = Math.min(...years.map((y) => y.pct)), hi = Math.max(...years.map((y) => y.pct));
  const xTicks = sc.unhedged.map((p) => p.fx);
  const bound = (k: "lo" | "hi") => (range.p02 as unknown as { bounds: Record<string, Record<"lo" | "hi", SiteValue>> }).bounds["A-03"]![k];
  return (
    <Card pad="roomy" className="flex flex-col gap-4" id="invest-dollar">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{c.dollar.title}</h2>
        <p className="text-muted-foreground">{c.dollar.lead(plan.years)}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <div className="flex flex-col gap-2 min-w-0">
          <ChartLegend
            items={[
              { id: "u", swatch: <Swatch shape="box" className="bg-chart-kind-unhedged" />, label: <bdi>{c.dollar.legendUnhedged(name(pairs.unhedged))}</bdi> },
              { id: "h", swatch: <Swatch shape="box" className="bg-chart-kind-hedged" />, label: <bdi>{c.dollar.legendHedged(name(pairs.hedged))}</bdi> },
            ]}
          />
          <ScenarioChart
            label={c.dollar.chartLabel}
            xMin={sc.lo}
            xMax={sc.hi}
            xTicks={xTicks}
            xFormat={(x) => signedPct(x)}
            yFormat={nisK}
            shade={stretch ? { from: stretch.low, to: stretch.high, label: c.dollar.shade(h, from, pct1(stretch.low), pct1(stretch.high)) } : { from: 0, to: 0, label: c.dollar.noStretch(h) }}
            crossing={sc.crossing !== null ? { x: sc.crossing, label: signedPct(sc.crossing, 2) } : null}
            lines={[{ id: "u", label: `${c.dollar.endUnhedged} ${nisK(sc.unhedged[sc.unhedged.length - 1]!.value)}`, stroke: "stroke-chart-kind-unhedged", fill: "fill-chart-kind-unhedged", points: sc.unhedged.map((p) => ({ x: p.fx, y: p.value })) }]}
            bands={[
              {
                id: "h",
                label: `${c.dollar.endHedged} ${nisK(sc.hedged.value)}`,
                fill: "fill-chart-kind-hedged",
                text: "fill-chart-kind-hedged",
                low: sc.hedged.band?.low ?? sc.hedged.value,
                high: sc.hedged.band?.high ?? sc.hedged.value,
              },
            ]}
          />
          <p className="text-xs text-muted-foreground text-center">{c.dollar.xTitle(plan.years)}</p>
          {/* the range is P-02's, shown as the site's parameter it is */}
          <p className="text-sm text-muted-foreground">
            {c.dollar.rangeNote.lead}
            <Num value={bound("lo")} /> {c.dollar.rangeNote.to} <Num value={bound("hi")} /> {c.dollar.rangeNote.tail}
          </p>
        </div>
        {history && years.length > 0 && (
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="font-semibold">{c.dollar.yearsTitle}</h3>
            <YearBars label={c.dollar.yearsLabel} tickStep={10} format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`} items={years.map((y) => ({ year: y.year, value: y.pct }))} />
            {/* one height for every plan: sized for the longest note (nothing moves when a number changes) */}
            <p className="text-sm text-muted-foreground min-h-[5lh] max-md:min-h-[8lh]">
              {c.dollar.yearsNote(pct1(lo), pct1(hi), years.filter((y) => y.pct < 0).length, years.length)}{" "}
              {stretch ? c.dollar.stretchNote(h, pct1(stretch.low), pct1(stretch.high), stretch.count) : c.dollar.noStretch(h)} {c.dollar.past(from)}
            </p>
            <SourceLine
              lead={
                <a href={history.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                  {history.attribution} ↗
                </a>
              }
              items={[]}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
