// Savings plan (D29): when can I take my money out? A ladder: each monthly deposit is a bar from the month it goes in to the month its
// lock ends (the plan's term from the deposit record; F-22 reading, an open question the page says), a draggable date, and what is
// free and what is still locked on that date. The value of one finished deposit is an engine run of the plan's record.
import { scaleLinear } from "d3-scale";
import { useId, useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact, factNumber, planModel } from "../../lib/guide-signature";
import { entered as enteredValue } from "../../lib/value";
import { Callout, ChartLegend, Marker, MarkerMark, NumberField, SegmentedControl, Stat, StatRow, Swatch, useWidth } from "../kit";
import { IdText, Num, RulesLine } from "../provenance";
import { SourceLine, figure, inputSite, rulesOfBundle, useSigInputs, type VisualProps } from "./kit";

const TOP = 22;
const AXIS = 24;

type Count = "6" | "12" | "24" | "36";

export function SavingsPlanVisual({ data, today }: VisualProps) {
  const bundle = data.bundles["savings-plan"]!;
  const inputs = useSigInputs(bundle);
  const [count, setCount] = useState<Count>("12");
  const n = Number(count);
  const monthly = Math.max(0, inputs.monthly);
  const model = useMemo(() => planModel(data, { monthly, deposits: n }), [data, monthly, n]);
  const rate = fact(data, "rate")!;
  const termFact = fact(data, "term")!;
  const term = factNumber(data, "term") ?? 36;
  const lumpTerm = fact(data, "lumpTerm");
  const lumpRate = fact(data, "lumpRate");
  const min = fact(data, "amountMin");
  const max = fact(data, "amountMax");
  const [month, setMonth] = useState<number | null>(null);
  const last = n - 1 + term;
  const m = Math.min(last, Math.max(0, month ?? term + Math.floor(n / 2)));
  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const rowH = n <= 12 ? 11 : n <= 24 ? 7 : 5;
  const height = TOP + n * rowH + AXIS + 6;
  const plotW = width - 8;
  const x = scaleLinear().domain([0, last]).range([0, plotW]);
  const ticks = Array.from({ length: Math.floor(last / 12) + 1 }, (_, i) => i * 12);
  const at = model?.at(m);
  const outOfRange = (min && typeof min.value === "number" && monthly < min.value) || (max && typeof max.value === "number" && monthly > max.value);

  const monthlyIn = inputSite(bundle, "monthly_deposit", monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const runInputs = { [copy.common.inputNames.monthly]: monthlyIn, [copy.common.inputNames.rate]: rate, [copy.common.inputNames.term]: termFact };
  const dateIn = enteredValue(m, "months", today, copy.plan.marker);
  const free = model && at ? figure(at.freeValue, "nis", "F-22", { ...runInputs, [copy.plan.marker]: dateIn }, today, copy.plan.about.free, rulesOfBundle(bundle)) : null;
  const locked = model && at ? figure(at.lockedPrincipal, "nis", "F-22", { ...runInputs, [copy.plan.marker]: dateIn }, today, copy.plan.about.locked) : null;
  const lastUnlock = model ? figure(model.lastUnlock, "months", "F-22", { [copy.common.inputNames.term]: termFact, [copy.plan.count]: enteredValue(n, "count", today) }, today, copy.plan.about.last) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.plan.monthly}
          unit="nis"
          value={monthly}
          isEntered={inputs.source.monthly === "guide"}
          validate={(v) => (v < 0 ? valuesCopy.errors.negative : null)}
          onCommit={inputs.setMonthly}
          onReset={() => inputs.setMonthly(null)}
          disabled={!inputs.ready}
        />
        <div className="flex flex-col gap-1.5">
          <span className="field-label" id="sig-plan-count">
            {copy.plan.count}
          </span>
          <SegmentedControl<Count> labelledBy="sig-plan-count" options={copy.plan.countOptions.map((c) => ({ value: c as Count, label: c }))} value={count} onChange={(c) => { setCount(c); setMonth(null); }} />
        </div>
      </div>
      <SourceLine sources={[inputs.source.monthly]} />
      {outOfRange && min && max && (
        <Callout tone="caution">
          {copy.common.outOfRange.before} <Num value={min} /> {copy.common.outOfRange.middle} <Num value={max} />
          {copy.common.outOfRange.after} {copy.plan.rangeLine}
        </Callout>
      )}

      <ChartLegend
        items={[
          { id: "free", swatch: <Swatch shape="box" className="bg-chart-value" />, label: copy.plan.legend.free },
          { id: "locked", swatch: <Swatch shape="box" className="bg-muted border border-chart-marker" />, label: copy.plan.legend.locked },
          { id: "notYet", swatch: <Swatch shape="box" className="border border-chart-axis" />, label: copy.plan.legend.notYet },
        ]}
      />

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
              const state = r.unlock <= m ? "free" : r.from <= m ? "locked" : "notYet";
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
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ right: 0, top: height - 16 }}>
            {copy.plan.unit}
          </span>
          <Marker min={0} max={last} step={1} value={m} onChange={setMonth} label={copy.plan.marker} valueText={`${m} ${copy.plan.unit}`} left={0} top={TOP - 12} width={plotW} height={height - AXIS - TOP + 14} />
        </div>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          {copy.plan.at.before} <bdi dir="ltr">{m}</bdi> {copy.plan.at.after}:
        </p>
        <StatRow cols={3}>
          <Stat label={copy.plan.figures.free} tone="value">{free && <Num value={free} />}</Stat>
          <Stat label={copy.plan.figures.locked}>{locked && <Num value={locked} />}</Stat>
          <Stat label={copy.plan.figures.last}>{lastUnlock && <Num value={lastUnlock} />}</Stat>
        </StatRow>
      </div>

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p>
          {copy.plan.lockLine.before} <Num value={termFact} display={fmt.months(term)} /> {copy.plan.lockLine.middle} <Num value={rate} /> {copy.plan.lockLine.after}
        </p>
        {lumpTerm && lumpRate && lastUnlock && (
          <p>
            {copy.plan.alt.before} <Num value={lumpTerm} display={fmt.months(Number(lumpTerm.value))} /> ({copy.plan.alt.rate} <Num value={lumpRate} />) {copy.plan.alt.middle} <Num value={lastUnlock} />.
          </p>
        )}
        <p className="text-muted-foreground">{copy.common.onlyLeumi}</p>
      </div>
      <Callout tone="caution"><IdText text={copy.common.gaps.planLockPerDeposit ?? ""} /></Callout>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
