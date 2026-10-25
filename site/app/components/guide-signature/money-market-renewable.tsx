// Renewable money-market fund (D29): when can I leave? A year-long timeline with the fund's fixed redemption date (the series date the
// fund record's name carries), a draggable "when you need it" marker and the wait to the date. After that date the series renews; the
// next date is not collected, only its latest possible place (MF-08: the gap between two dates is at most 12 months). The rest is "עוד לא חושב".
import { scaleLinear } from "d3-scale";
import { useId, useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { addDays, daysBetween, fact, fixedDateModel } from "../../lib/guide-signature";
import { computed, entered as enteredValue, type SiteValue } from "../../lib/value";
import { Num, RulesLine } from "../provenance";
import { Gap, Marker, MarkerMark, useWidth, type VisualProps } from "./kit";

const HEIGHT = 130;
const LANE_Y = 40;
const LANE_H = 30;
const AXIS_Y = 100;
const WINDOW = 365;

const dateValue = (iso: string, formula: string, inputs: Record<string, SiteValue>, today: string, about: string): SiteValue => ({ ...computed(0, "text", formula, inputs, { today, about }), value: iso });

export function MoneyMarketRenewableVisual({ data, today }: VisualProps) {
  const series = fact(data, "seriesDate");
  const maxInterval = fact(data, "maxInterval");
  const absMax = fact(data, "absoluteMax");
  const [offset, setOffset] = useState<number | null>(null);
  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const probe = fixedDateModel(data, { today, needOn: today });
  const knownDay = probe.known ? daysBetween(today, probe.known) : null;
  const o = Math.min(WINDOW, Math.max(0, offset ?? Math.min(WINDOW, Math.round((knownDay ?? 30) * 2))));
  const needOn = addDays(today, o);
  const model = fixedDateModel(data, { today, needOn });
  const plotW = width - 8;
  const x = scaleLinear().domain([0, WINDOW]).range([0, plotW]);
  const ticks = [0, 3, 6, 9, 12];
  const needIn = enteredValue(o, "days", today, copy.renewable.marker);
  const waitValue = series && model.waitDays !== null ? computed(model.waitDays, "days", "F-23", { [copy.renewable.known]: series, [copy.renewable.marker]: needIn }, { today, about: copy.renewable.about.wait }) : null;
  const latest = model.latestAfter && series && maxInterval ? dateValue(model.latestAfter, "F-23", { [copy.renewable.known]: series, [copy.common.inputNames.maxInterval]: maxInterval }, today, copy.renewable.about.latest) : null;
  const after = model.known !== null && model.waitDays === null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{copy.renewable.marker}</span>
        <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
          <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.renewable.chart.aria} className="block select-none">
            <defs>
              <pattern id={`${pid}-lock`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" className="fill-muted" />
                <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-marker" strokeWidth="2" />
              </pattern>
            </defs>
            {/* before the fixed date: the money cannot be taken out */}
            <rect x={0} y={LANE_Y} width={knownDay === null ? plotW : x(knownDay)} height={LANE_H} rx={3} fill={`url(#${pid}-lock)`} />
            {knownDay !== null && (
              <>
                {/* after it: the series renews; the dates are not collected */}
                <rect x={x(knownDay)} y={LANE_Y} width={Math.max(0, plotW - x(knownDay))} height={LANE_H} rx={3} className="fill-card stroke-chart-axis" strokeDasharray="4 4" strokeWidth="1.5" />
                <rect x={x(knownDay) - 5} y={LANE_Y - 4} width={10} height={LANE_H + 8} rx={2} className="fill-chart-value" />
              </>
            )}
            <line x1={0} x2={plotW} y1={AXIS_Y - 8} y2={AXIS_Y - 8} className="stroke-chart-axis" strokeWidth="1" />
            {ticks.map((t) => (
              <text key={t} x={x((t * WINDOW) / 12)} y={AXIS_Y + 8} textAnchor={t === 0 ? "start" : t === 12 ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                {t === 0 ? copy.renewable.today : t}
              </text>
            ))}
            <MarkerMark x={x(o)} y1={LANE_Y - 18} y2={LANE_Y + LANE_H + 12} />
          </svg>
          {knownDay !== null && series && (
            <span className="absolute text-xs whitespace-nowrap bg-card/85 rounded-sm px-1.5 py-0.5" dir="rtl" style={{ left: Math.min(Math.max(0, x(knownDay) - 40), plotW - 140), top: 2 }}>
              {copy.renewable.known}: <Num value={series} />
            </span>
          )}
          {knownDay !== null && (
            <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: width - plotW + 10, top: LANE_Y + 6 }}>
              {copy.renewable.unknown}
            </span>
          )}
          <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 0, top: AXIS_Y + 16 }}>
            {copy.renewable.unit}
          </span>
          <Marker min={0} max={WINDOW} step={1} value={o} onChange={setOffset} label={copy.renewable.marker} valueText={`${fmt.date(needOn)}`} left={0} top={LANE_Y - 20} width={plotW} height={LANE_H + 36} />
        </div>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
      </div>

      {knownDay === null || !series ? (
        <>
          <p className="max-w-measure">{copy.renewable.gapped}</p>
          <Gap id="seriesDate" />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="font-medium">
            {copy.renewable.need}<bdi dir="ltr">{fmt.date(needOn)}</bdi>:
          </p>
          {waitValue ? (
            <p>
              {copy.renewable.nextDate} <Num value={series} />. {copy.renewable.wait} <Num value={waitValue} display={`${fmt.number(model.waitDays ?? 0)} ${copy.renewable.days}`} />.
            </p>
          ) : (
            after &&
            latest &&
            maxInterval && (
              <p>
                {copy.renewable.after.before} <Num value={series} /> {copy.renewable.after.middle} <Num value={latest} prefix={copy.renewable.after.notLater} />, {copy.renewable.after.end} <Num value={maxInterval} display={fmt.months(Number(maxInterval.value))} />
                {absMax ? (
                  <>
                    {" "}
                    (<Num value={absMax} display={fmt.months(Number(absMax.value))} /> {copy.renewable.after.abs})
                  </>
                ) : null}
                .
              </p>
            )
          )}
        </div>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">{copy.renewable.cannot}</p>
      <Gap id="renewableDates" />
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
