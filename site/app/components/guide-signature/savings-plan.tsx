// Savings plan (D29): when can I take my money out? Each monthly deposit is a bar from the month it goes in to the plan's end, where all of
// them are paid out together (F-22, as the example's own terms read: the plan's term from its start, a deposit each month up to the month
// before the end), a draggable date, and what is free and what is still locked on that date. Each deposit's value at the end is an engine
// run of the plan's record from its month to the end.
import { scaleLinear } from "d3-scale";
import { useId, useMemo, useState, type ReactNode } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact, factNumber, planModel } from "../../lib/guide-signature";

import { Callout, ChartLegend, InputSlot, LongestCase, Marker, MarkerMark, Stat, StatRow, Swatch, useWidth } from "../kit";
import { Num, Ruled, Term } from "../provenance";
import { figure, inputSite, SigAmountField, useSigInputs, typed, type VisualProps } from "./kit";
import { rulesOfRun } from "../../lib/run-rules";

const TOP = 22;
const AXIS = 24;
/** The bars' height in px: 5 px a row at a plan of 36 deposits. */
const LADDER = 180;

/** A deposit's state at the marked month: paid out, still locked in the plan, or not yet put in. */
type LadderState = "free" | "locked" | "notYet";

/** The legend's items, one per state, in the bars' order. */
const legendItems = [
  { id: "free", swatch: <Swatch shape="box" className="bg-chart-value" />, label: copy.plan.legend.free },
  { id: "locked", swatch: <Swatch shape="box" className="bg-muted border border-chart-marker" />, label: copy.plan.legend.locked },
  { id: "notYet", swatch: <Swatch shape="box" className="border border-chart-axis" />, label: copy.plan.legend.notYet },
] satisfies { id: LadderState; swatch: ReactNode; label: string }[];

export function SavingsPlanVisual({ data, today }: VisualProps) {
  const bundle = data.bundles["savings-plan"]!;
  const inputs = useSigInputs(bundle);
  const monthly = Math.max(0, inputs.monthly);
  const model = useMemo(() => planModel(data, monthly), [data, monthly]);
  const rate = fact(data, "rate")!;
  const termFact = fact(data, "term")!;
  const term = factNumber(data, "term") ?? 36;
  const lumpTerm = fact(data, "lumpTerm");
  const lumpRate = fact(data, "lumpRate");
  const min = fact(data, "amountMin");
  const max = fact(data, "amountMax");
  const [month, setMonth] = useState<number | null>(null);
  // the axis runs to the plan's end, where every deposit is paid out; the date starts there
  const last = term;
  const m = Math.min(last, Math.max(0, month ?? term));
  const stateAt = (r: { unlock: number; from: number }): LadderState => (r.unlock <= m ? "free" : r.from <= m ? "locked" : "notYet");
  const drawnStates = new Set<string>(model?.rows.map(stateAt) ?? []);
  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const rowH = LADDER / Math.max(1, model?.rows.length ?? term);
  const height = TOP + LADDER + AXIS + 6;
  const plotW = width - 8;
  const x = scaleLinear().domain([0, last]).range([0, plotW]);
  const ticks = Array.from({ length: Math.floor(last / 12) + 1 }, (_, i) => i * 12);
  const at = model?.at(m);
  const outOfRange = (min && typeof min.value === "number" && monthly < min.value) || (max && typeof max.value === "number" && monthly > max.value);

  const monthlyIn = inputSite(bundle, "monthly_deposit", monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const runInputs = { [copy.common.inputNames.monthly]: monthlyIn, [copy.common.inputNames.rate]: rate, [copy.common.inputNames.term]: termFact };
  const dateIn = typed(m, "months", today, copy.plan.marker);
  // free: nothing before the plan's end, then every deposit with its interest, after tax
  const free = model && at ? figure(at.freeValue, "nis", "F-22", { ...runInputs, [copy.plan.marker]: dateIn }, today, copy.plan.about.free, at.freeValue > 0 ? rulesOfRun(model.rules, "all") : []) : null;
  // what is still locked is the deposits made by then, at their face: no interest in it
  const locked = model && at ? figure(at.lockedPrincipal, "nis", "F-22", { [copy.common.inputNames.monthly]: monthlyIn, [copy.common.inputNames.term]: termFact, [copy.plan.marker]: dateIn }, today, copy.plan.about.locked) : null;
  const end = model ? figure(model.term, "months", "F-22", { [copy.common.inputNames.term]: termFact }, today, copy.plan.about.last) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SigAmountField inputs={inputs} field="monthly" label={copy.plan.monthly} />
      </div>
      {outOfRange && min && max && (
        <Callout tone="caution">
          {copy.common.outOfRange.before} <Num value={min} /> {copy.common.outOfRange.middle} <Num value={max} />
          {copy.common.outOfRange.after} {copy.plan.rangeLine}
        </Callout>
      )}

      {/* the legend names only the states drawn at the marked month, holding the room of all three so the chart stays put as the marker moves */}
      <LongestCase cases={[<ChartLegend key="all" items={legendItems} />]}>
        <ChartLegend items={legendItems.filter((it) => drawnStates.has(it.id))} />
      </LongestCase>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{copy.plan.marker}</span>
        <div ref={box} className="relative w-full" dir="ltr" style={{ height }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={copy.plan.chart.aria} className="block select-none">
            <defs>
              <pattern id={`${pid}-lock`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="6" height="6" className="fill-muted" />
                <line x1="0" y1="0" x2="0" y2="6" className="stroke-chart-marker" strokeWidth="1.5" />
              </pattern>
            </defs>
            {model?.rows.map((r, i) => {
              const y = TOP + i * rowH;
              const state = stateAt(r);
              return (
                <rect
                  key={r.from}
                  x={x(r.from)}
                  y={y + 1}
                  width={Math.max(2, x(r.unlock) - x(r.from))}
                  height={rowH - 2}
                  rx={1.5}
                  fill={state === "free" ? undefined : state === "locked" ? `url(#${pid}-lock)` : "none"}
                  className={state === "free" ? "fill-chart-value" : state === "locked" ? "stroke-chart-marker" : "stroke-chart-axis"}
                  strokeWidth={state === "free" ? 0 : 1}
                />
              );
            })}
            <line x1={0} x2={plotW} y1={height - AXIS} y2={height - AXIS} className="stroke-chart-axis" strokeWidth="1" />
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={height - 8} textAnchor={t === 0 ? "start" : t >= last - 3 ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                {t}
              </text>
            ))}
            <MarkerMark x={x(m)} y1={TOP - 10} y2={height - AXIS + 2} />
          </svg>
          <Marker min={0} max={last} step={1} value={m} onChange={setMonth} label={copy.plan.marker} valueText={`${m} ${copy.plan.unit}`} left={0} top={TOP - 12} width={plotW} height={height - AXIS - TOP + 14} />
        </div>
        {/* under the month numbers, not on their line: on a phone it covered "24" and "36" */}
        <span className="block text-xs text-chart-text -mt-1.5">{copy.plan.unit}</span>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          {copy.plan.at.before} <InputSlot><bdi dir="ltr">{m}</bdi></InputSlot> {copy.plan.at.after}:
        </p>
        <StatRow cols={3}>
          <Stat label={copy.plan.figures.free} tone="value">{free && <Num value={free} />}</Stat>
          <Stat label={copy.plan.figures.locked}>{locked && <Num value={locked} />}</Stat>
          <Stat label={copy.plan.figures.last}>{end && <Num value={end} />}</Stat>
        </StatRow>
      </div>

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p>
          {copy.plan.lockLine.before} <Num value={termFact} display={fmt.months(term)} /> {copy.plan.lockLine.middle} <Num value={rate} /> {copy.plan.lockLine.after}
        </p>
        <p>
          {copy.plan.endLine.before} <Term prefix={copy.plan.endLine.prefix} id="חשבון עובר ושב">{copy.plan.endLine.term}</Term> {copy.plan.endLine.after}
        </p>
        {lumpTerm && lumpRate && (
          <p>
            {copy.plan.alt.before}{lumpRate.own && <> {copy.plan.alt.ofBank} <bdi>{lumpRate.own}</bdi></>} {copy.plan.alt.forTerm} <Num value={lumpTerm} display={fmt.months(Number(lumpTerm.value))} /> ({copy.plan.alt.rate} <Num value={lumpRate} />) {copy.plan.alt.middle}
          </p>
        )}
        <p className="text-muted-foreground">
          {copy.plan.onlyCollected.before} <Ruled prefix={copy.plan.onlyCollected.prefix} id="BANK-28">{copy.plan.onlyCollected.stated}</Ruled>
          {copy.plan.onlyCollected.after}
        </p>
      </div>
    </div>
  );
}
