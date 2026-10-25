// Bank deposit (D29): what do I give up by locking the money? A marker on the deposit's term ("when do you need the money"), two
// lanes (the deposit, locked with no break; a daily money-market fund, open every trading day), what each lets you take at the marker
// and, at the end of the term, what each earned with the difference as a bracket. Rate, term and break terms are the deposit record's.
import { scaleLinear } from "d3-scale";
import { useId, useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { breakKindOf, depositModel, fact, factNumber } from "../../lib/guide-signature";
import { fmt } from "../../lib/format";
import { entered as enteredValue, type SiteValue } from "../../lib/value";
import { Callout, GainBars, Marker, MarkerMark, NumberField, Sentence, Stat, StatRow, useWidth } from "../kit";
import { Num, RulesLine } from "../provenance";
import { Gap, SourceLine, figure, inputSite, rulesOfBundle, useSigInputs, type VisualProps } from "./kit";

const HEIGHT = 150;
const LANE_H = 28;
const DEPOSIT_Y = 34;
const FUND_Y = 86;
const AXIS_Y = 128;

export function BankDepositVisual({ data, today }: VisualProps) {
  const depositBundle = data.bundles["bank-deposit"]!;
  const fundBundle = data.bundles["money-market-fund-daily"]!;
  const inputs = useSigInputs(depositBundle);
  const rate = fact(data, "rate")!;
  const termFact = fact(data, "term")!;
  const brk = fact(data, "break");
  const cash = fact(data, "cashRate")!;
  const kind = breakKindOf(brk);
  const model = useMemo(() => depositModel(data, { amount: inputs.amount }), [data, inputs.amount]);
  const term = model?.term ?? factNumber(data, "term") ?? 12;
  const [month, setMonth] = useState<number | null>(null);
  const m = Math.min(term, Math.max(0, month ?? Math.round(term / 2)));
  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const plotW = width - 8;
  const x = scaleLinear().domain([0, term]).range([0, plotW]);
  const ticks = Array.from({ length: Math.floor(term / 3) + 1 }, (_, i) => i * 3).filter((t) => t <= term);

  const min = fact(data, "amountMin");
  const max = fact(data, "amountMax");
  const outOfRange = (min && typeof min.value === "number" && inputs.amount < min.value) || (max && typeof max.value === "number" && inputs.amount > max.value);

  const amountIn = inputSite(depositBundle, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const depInputs = { [copy.common.inputNames.amount]: amountIn, [copy.common.inputNames.rate]: rate, [copy.common.inputNames.term]: termFact };
  const fundInputs = { [copy.common.inputNames.amount]: amountIn, [copy.common.inputNames.assumption]: cash };
  const fundNow = model ? model.fundAt(m) : null;
  const v = model
    ? {
        depositEnd: figure(model.atTerm, "nis", "F-67", depInputs, today, copy.deposit.about.depositEnd, rulesOfBundle(depositBundle)),
        depositGain: figure(model.atTerm - inputs.amount, "nis", "F-67", depInputs, today, copy.deposit.about.depositGain, rulesOfBundle(depositBundle)),
        fundGain: figure(model.fundAtTerm - inputs.amount, "nis", "F-67", fundInputs, today, copy.deposit.about.fundGain, rulesOfBundle(fundBundle)),
        fundNow: fundNow === null ? null : figure(fundNow, "nis", "F-67", { ...fundInputs, [copy.deposit.marker]: figureMonths(m, today) }, today, copy.deposit.about.fundNow, rulesOfBundle(fundBundle)),
      }
    : null;
  const diff = v && model ? figure(Math.abs(model.gap), "nis", "F-67", { [copy.deposit.lanes.deposit]: v.depositGain, [copy.deposit.lanes.fund]: v.fundGain }, today, copy.deposit.about.gap) : null;
  const locked = kind === "not-allowed" && m < term;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.deposit.amount}
          unit="nis"
          value={inputs.amount}
          isEntered={inputs.source.amount === "guide"}
          validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
          onCommit={inputs.setAmount}
          onReset={() => inputs.setAmount(null)}
          disabled={!inputs.ready}
        />
      </div>
      <SourceLine sources={[inputs.source.amount]} />
      {outOfRange && min && (
        <Callout tone="caution">
          {copy.common.outOfRange.before} <Num value={min} />
          {max ? (
            <>
              {" "}
              {copy.common.outOfRange.middle} <Num value={max} />
            </>
          ) : null}
          {copy.common.outOfRange.after}
        </Callout>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{copy.deposit.marker}</span>
        <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
          <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.deposit.chart.aria} className="block select-none">
            <defs>
              <pattern id={`${pid}-lock`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" className="fill-muted" />
                <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-marker" strokeWidth="2" />
              </pattern>
            </defs>
            {/* the deposit: closed until the end of its term, a short open end where the bank hands it back */}
            {kind === "not-allowed" ? (
              <>
                <rect x={0} y={DEPOSIT_Y} width={Math.max(0, plotW - 10)} height={LANE_H} rx={3} fill={`url(#${pid}-lock)`} />
                <rect x={Math.max(0, plotW - 10)} y={DEPOSIT_Y} width={10} height={LANE_H} rx={3} className="fill-chart-value" />
              </>
            ) : (
              <rect x={0} y={DEPOSIT_Y} width={plotW} height={LANE_H} rx={3} fill={`url(#${pid}-lock)`} />
            )}
            <rect x={0} y={FUND_Y} width={plotW} height={LANE_H} rx={3} className="fill-chart-alt" fillOpacity="0.55" />
            <line x1={0} x2={plotW} y1={AXIS_Y - 6} y2={AXIS_Y - 6} className="stroke-chart-axis" strokeWidth="1" />
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={AXIS_Y + 12} textAnchor={t === 0 ? "start" : t === term ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                {t}
              </text>
            ))}
            <MarkerMark x={x(m)} y1={DEPOSIT_Y - 12} y2={FUND_Y + LANE_H + 8} />
          </svg>
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ left: 0, top: DEPOSIT_Y - 17 }}>
            {copy.deposit.lanes.deposit}
          </span>
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ left: 0, top: FUND_Y - 17 }}>
            {copy.deposit.lanes.fund}
          </span>
          {kind === "not-allowed" && (
            <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ left: Math.max(4, plotW / 2 - 70), top: DEPOSIT_Y + 4 }}>
              {copy.deposit.locked}: {copy.deposit.noBreak}
            </span>
          )}
          <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ left: Math.max(4, plotW / 2 - 50), top: FUND_Y + 4 }}>
            {copy.deposit.open}
          </span>
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ right: 0, top: AXIS_Y + 14 - 2 }}>
            {copy.deposit.unit}
          </span>
          <Marker min={0} max={term} step={1} value={m} onChange={setMonth} label={copy.deposit.marker} valueText={`${m} ${copy.deposit.atMarker.month}`} left={0} top={DEPOSIT_Y - 14} width={plotW} height={FUND_Y + LANE_H + 10 - (DEPOSIT_Y - 14)} />
        </div>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          {copy.deposit.atMarker.lead} <bdi dir="ltr">{m}</bdi> {copy.deposit.atMarker.month}:
        </p>
        <StatRow cols={2}>
          <Stat label={copy.deposit.atMarker.deposit} tone="value">
            {kind !== "not-allowed" ? (
              <span className="text-base font-normal text-muted-foreground">{copy.deposit.breakOther}</span>
            ) : locked ? (
              <span className="text-base font-normal">{copy.deposit.atMarker.none}</span>
            ) : v ? (
              <Num value={v.depositEnd} />
            ) : null}
          </Stat>
          <Stat label={copy.deposit.atMarker.fund} tone="alt">
            {v?.fundNow ? <Num value={v.fundNow} /> : null}
          </Stat>
        </StatRow>
        {kind !== "not-allowed" && <Gap id="depositBreak" />}
        {brk && (
          <Sentence size="sm" tone="muted" measure>
            {copy.deposit.bankWords} {kind === "not-allowed" ? <Num value={brk} display={copy.deposit.noBreak} /> : <bdi dir="ltr">{brk.notes}</bdi>}
          </Sentence>
        )}
      </div>

      {v && diff && model && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {copy.deposit.atEnd.lead} {fmt.months(term)} {copy.deposit.atEnd.earned}
          </p>
          <GainBars
            bars={[
              { key: "deposit", label: copy.deposit.lanes.deposit, value: v.depositGain, tone: "value" },
              { key: "fund", label: copy.deposit.lanes.fund, value: v.fundGain, tone: "alt" },
            ]}
            diff={diff}
            diffLabel={model.gap >= 0 ? copy.deposit.atEnd.gapMore : copy.deposit.atEnd.gapLess}
          />
          <p className="text-xs text-muted-foreground">{copy.deposit.afterTax}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p>
          {copy.deposit.rateLine.before} <Num value={rate} /> {copy.deposit.rateLine.middle} <Num value={termFact} display={fmt.months(term)} />.
        </p>
        <p className="text-muted-foreground">{copy.common.onlyLeumi}</p>
        <Sentence tone="muted">
          {copy.common.fundAssumption.before} <Num value={cash} /> {copy.common.fundAssumption.after}
        </Sentence>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}

/** The marker's month as an entered value, so the sheet of the fund's figure names it. */
function figureMonths(m: number, today: string): SiteValue {
  return enteredValue(m, "months", today);
}
