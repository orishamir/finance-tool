// Provident fund for investing (D29): what are my ways out? There is no lock: the money comes out at any time as a lump sum, taxed at up
// to 25% of the real gain (TXK-05 to TXK-07). From the early retirement age (60) a second way opens: moving the balance to a provident fund
// for annuity, whose pension is exempt (TXK-09, TXK-10). The size of that pension needs conversion factors the site does not hold, so it is
// "not computed yet", never a number. The fund is set against a brokerage account holding the same index (two bars and a bracket).
import { scaleLinear } from "d3-scale";
import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { providentModel } from "../../lib/guide-signature-g2";
import { useInputs } from "../../lib/inputs";
import { entered as enteredValue, type SiteValue } from "../../lib/value";
import type { Bundle } from "../../lib/engine";
import { Callout, GainBars, InputSlot, LaneLabel, Marker, MarkerMark, NumberField, Sentence, useWidth } from "../kit";
import { Num, RuleRef, RulesLine, Term } from "../provenance";
import { G2Gap, HoldRow, PlanInputs, text } from "./g2-parts";
import { figure, inputSite, notFeeFlag, rulesOfBundle, runFigure, useSigInputs, yearsRange, type VisualProps } from "./kit";

const HEIGHT = 92;
const LANE_Y = 26;
const LANE_H = 28;
const AXIS_Y = 66;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function KupatGemelLehashkaaVisual(props: VisualProps) {
  const base = props.data.bundles["kupat-gemel-lehashkaa"] ?? props.data.bundles["brokerage-account"];
  if (!base) return <G2Gap id="bundle" />;
  return <Inner {...props} base={base} />;
}

function Inner({ data, today, base }: VisualProps & { base: Bundle }) {
  const kgl = data.bundles["kupat-gemel-lehashkaa"];
  const broker = data.bundles["brokerage-account"];
  const inputs = useSigInputs(base);
  const { state, setAge } = useInputs();
  const age = state.age;
  const ageEntered = state.age !== null;
  const yr = yearsRange(base);
  const [yearsPick, setYearsPick] = useState<number | null>(null);
  const years = clamp(yearsPick ?? Math.round(inputs.years), yr.min, yr.max);
  const model = useMemo(() => providentModel(data, { amount: inputs.amount, monthly: inputs.monthly, years, age }), [data, inputs.amount, inputs.monthly, years, age]);

  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const plotW = width - 8;
  const x = scaleLinear().domain([0, yr.max]).range([0, plotW]);
  const tickStep = yr.max > 20 ? 10 : 5;
  const ticks = Array.from({ length: Math.floor(yr.max / tickStep) + 1 }, (_, i) => i * tickStep);

  const earlyAge = fact(data, "earlyAge");
  const exemptAge = fact(data, "exemptAge");
  const taxRate = fact(data, "taxRate");
  const nominalRate = fact(data, "nominalRate");
  const ceiling = fact(data, "ceiling");
  const returnPct = fact(data, "returnPct");
  const inflationPct = fact(data, "inflationPct");
  const trackFee = fact(data, "trackFee");
  const trustee = fact(data, "fundTrustee");
  const management = fact(data, "fundManagement");
  const rangeMin = fact(data, "rangeMin");
  const rangeMax = fact(data, "rangeMax");
  const rangeCount = fact(data, "rangeCount");
  const brokerCount = fact(data, "brokerCount");
  const trackName = text(data, "trackName");
  const trackNumber = text(data, "trackNumber");
  const fundName = text(data, "fundName");
  const fundNumber = text(data, "fundNumber");
  const indexName = text(data, "indexName");
  const brokerName = text(data, "brokerName");
  const earlyYears = age !== null && earlyAge && typeof earlyAge.value === "number" ? earlyAge.value - age : null;

  // ---- value objects
  const amountIn = inputSite(base, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const monthlyIn = inputSite(base, "monthly_deposit", inputs.monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const yearsIn = enteredValue(years, "years", today, copy.provident.marker);
  const common: Record<string, SiteValue> = {
    [copy.common.inputNames.amount]: amountIn,
    [copy.common.inputNames.monthly]: monthlyIn,
    [copy.provident.marker]: yearsIn,
    ...(returnPct ? { [copy.hishtalmut.inputNames.ret]: returnPct } : {}),
    ...(inflationPct ? { [copy.hishtalmut.inputNames.inflation]: inflationPct } : {}),
    ...(trackFee ? { [copy.hishtalmut.inputNames.trackFee]: trackFee } : {}),
  };
  // 2026-10-26 (F-44 with F-42): once the exit year is at 60 or over, the reduced brackets apply first, so the tax and what is left
  // depend on the age and on the other income in that year (the site's scenario income, P-05); the sheets name both. The brokerage
  // side runs with the same profile, so its gain, the difference and the ranges move with the age too and name it as well.
  // Whether the exit year is at 60 is the engine's own answer (the run used F-42), not a second test here.
  const incomeP05 = fact(data, "incomeP05");
  const atSixty = model.lump !== null && model.lump.run.formulas.includes("F-42");
  const ageInputs: Record<string, SiteValue> =
    atSixty && age !== null ? { [copy.provident.ageLabel]: enteredValue(age, "years", today, copy.provident.ageLabel), ...(incomeP05 ? { [copy.provident.incomeName]: incomeP05 } : {}) } : {};
  const kglRules = kgl ? rulesOfBundle(kgl) : [];
  // The tax and what is left are the lump sum run's own numbers: they carry the rules that run read (TXG-04, TXG-07 and TXK-26 from 60),
  // its flags and its labels (review 2026-10-26). From 60 the tax is F-42 over the real gain F-44 sets: the slice above the income.
  const realGainFig = model.lump && model.realGain !== null ? runFigure(model.realGain, "nis", "F-44", common, today, copy.provident.about.realGain, model.lump.run, (c) => !notFeeFlag(c)) : null;
  const taxFig = !model.lump
    ? null
    : atSixty && realGainFig
      ? runFigure(model.lump.tax, "nis", "F-42", { [copy.provident.realGainName]: realGainFig, ...ageInputs, ...(taxRate ? { [copy.provident.taxRate]: taxRate } : {}) }, today, copy.provident.about.tax, model.lump.run, notFeeFlag)
      : runFigure(model.lump.tax, "nis", "F-44", { ...common, ...(taxRate ? { [copy.provident.taxRate]: taxRate } : {}) }, today, copy.provident.about.tax, model.lump.run, notFeeFlag);
  const v = {
    net: model.lump ? runFigure(model.lump.net, "nis", "F-44", { ...common, ...ageInputs, ...(atSixty && taxFig ? { [copy.provident.taxLine]: taxFig } : {}) }, today, copy.provident.about.net, model.lump.run) : null,
    tax: taxFig,
    alt: model.alt ? figure(model.alt.tax, "nis", "F-44", { ...common, ...(nominalRate ? { [copy.provident.nominalRate]: nominalRate } : {}) }, today, copy.provident.about.alt, kglRules) : null,
    transfer: model.transfer !== null ? figure(model.transfer, "nis", "F-45", common, today, copy.provident.about.transfer, kglRules) : null,
    gain: model.lump ? runFigure(model.lump.gain, "nis", "F-67", { ...common, ...ageInputs }, today, copy.provident.about.gain, model.lump.run) : null,
    brokerGain: model.broker && broker ? runFigure(model.broker.gain, "nis", "F-67", { ...common, ...ageInputs }, today, copy.provident.about.brokerGain, model.broker.run) : null,
  };
  const diff = v.gain && v.brokerGain && model.diff !== null ? figure(Math.abs(model.diff), "nis", "F-67", { [copy.provident.lump]: v.gain, [copy.hishtalmut.broker]: v.brokerGain, ...ageInputs }, today, copy.provident.about.diff) : null;
  const rangeFig = (r: { low: number; high: number } | null, about: string) => (r ? { low: figure(r.low, "nis", "F-67", { ...common, ...ageInputs }, today, about), high: figure(r.high, "nis", "F-67", { ...common, ...ageInputs }, today, about) } : null);
  const brokerRange = rangeFig(model.range.broker, copy.provident.about.rangeBroker);
  const managerRange = rangeFig(model.range.manager, copy.provident.about.rangeManager);

  return (
    <div className="flex flex-col gap-5">
      {earlyAge && (
        <Sentence measure>
          {copy.provident.lead.before} <Num value={earlyAge} display={String(earlyAge.value)} /> {copy.provident.lead.after}
        </Sentence>
      )}
      {indexName && trackName && fundName ? (
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">
            {copy.hishtalmut.heldLead} <span className="text-foreground">{indexName}</span>
          </p>
          <ul className="flex flex-col gap-1.5">
            <HoldRow tone="value" name={copy.provident.container}>
              {copy.hishtalmut.track} ״<bdi>{trackName}</bdi>״ (<bdi dir="ltr">{trackNumber}</bdi>). {copy.hishtalmut.trackFee} {trackFee && <Num value={trackFee} />} {copy.hishtalmut.perYearAvg}
            </HoldRow>
            <HoldRow tone="alt" name={copy.hishtalmut.broker}>
              {copy.hishtalmut.fund} ״<bdi>{fundName}</bdi>״ (<bdi dir="ltr">{fundNumber}</bdi>). {copy.hishtalmut.trusteeLead} {trustee && <Num value={trustee} />}
              {management ? (
                <>
                  {" "}
                  {copy.hishtalmut.andMgmt} <Num value={management} />
                </>
              ) : null}{" "}
              {brokerName ? `${copy.hishtalmut.perYearTariff} ${brokerName}.` : copy.hishtalmut.perYear}
            </HoldRow>
          </ul>
        </div>
      ) : (
        <G2Gap id="indexTrack" />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.provident.ageLabel}
          unit="years"
          value={age}
          isEntered={ageEntered}
          validate={(n) => (!Number.isInteger(n) || n < 0 || n > 120 ? copy.provident.ageError : null)}
          onCommit={(n) => setAge(n)}
          onReset={() => setAge(null)}
          disabled={!inputs.ready}
          optional
          inputMode="numeric"
          hint={copy.provident.ageHint}
        />
      </div>
      <PlanInputs bundle={base} inputs={inputs} today={today} />
      {model.overCeiling && ceiling && (
        <Callout tone="caution">
          {copy.provident.overCeiling.before} <Num value={ceiling} /> {copy.provident.overCeiling.after}
        </Callout>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{copy.provident.marker}</span>
        <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
          <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.provident.chart.aria} className="block select-none">
            <defs>
              <pattern id={`${pid}-one`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" className="fill-muted" />
                <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-marker" strokeWidth="2" />
              </pattern>
            </defs>
            {earlyYears === null ? (
              <rect x={0} y={LANE_Y} width={plotW} height={LANE_H} rx={3} className="fill-chart-marker" fillOpacity="0.35" />
            ) : (
              <>
                <rect x={0} y={LANE_Y} width={clamp(x(earlyYears), 0, plotW)} height={LANE_H} rx={3} className="fill-chart-marker" fillOpacity="0.35" />
                <rect x={clamp(x(earlyYears), 0, plotW)} y={LANE_Y} width={plotW - clamp(x(earlyYears), 0, plotW)} height={LANE_H} rx={3} className="fill-chart-value" />
              </>
            )}
            <line x1={0} x2={plotW} y1={AXIS_Y} y2={AXIS_Y} className="stroke-chart-axis" strokeWidth="1" />
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={AXIS_Y + 16} textAnchor={t === 0 ? "start" : t >= yr.max - 1 ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                {t}
              </text>
            ))}
            {/* the line starts at the lane, so the row above it holds the bands' names clear of the marker (2026-10-26) */}
            <MarkerMark x={x(years)} y1={LANE_Y - 2} y2={AXIS_Y + 2} />
          </svg>
          {earlyYears === null ? null : (
            <>
              {earlyYears > 0 && x(earlyYears) > 110 && (
                <LaneLabel from={0} to={clamp(x(earlyYears), 0, plotW)} top={LANE_Y - 24}>
                  {copy.provident.chart.one}
                </LaneLabel>
              )}
              {x(earlyYears) < plotW - 130 && (
                <LaneLabel from={clamp(x(earlyYears), 0, plotW)} to={plotW} top={LANE_Y - 24} prefer="end">
                  {copy.provident.chart.two}
                </LaneLabel>
              )}
            </>
          )}
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ right: 0, top: AXIS_Y + 18 }}>
            {copy.provident.unit}
          </span>
          <Marker min={yr.min} max={yr.max} step={1} value={years} onChange={setYearsPick} label={copy.provident.marker} valueText={fmt.years(years)} left={0} top={LANE_Y - 12} width={plotW} height={AXIS_Y - LANE_Y + 16} />
        </div>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
        {earlyYears === null && <p className="text-xs text-muted-foreground">{copy.provident.chart.noAge}</p>}
        {earlyYears !== null && earlyAge && (
          <Sentence size="xs" tone="muted">
            {copy.provident.chart.legend.before} <Num value={earlyAge} display={String(earlyAge.value)} /> {copy.provident.chart.legend.after}
          </Sentence>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          {copy.provident.at.before} <InputSlot chars={7}><bdi>{fmt.years(years)}</bdi></InputSlot>
          {model.ageAtExit !== null ? (
            <>
              {" "}
              ({copy.provident.at.age} <bdi dir="ltr">{model.ageAtExit}</bdi>)
            </>
          ) : null}
          {copy.provident.at.after}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-md border border-border p-3.5 flex flex-col gap-2" aria-label={copy.provident.lump}>
            <h4 className="font-medium">{copy.provident.lump}</h4>
            {model.lump && v.net && v.tax ? (
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{copy.provident.left}</dt>
                  <dd className="text-lg font-semibold">
                    <Num value={v.net} />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{copy.provident.taxLine}</dt>
                  <dd className="font-semibold">
                    <Num value={v.tax} />
                  </dd>
                </div>
              </dl>
            ) : (
              <G2Gap id="lump" />
            )}
            {taxRate && (
              <Sentence size="xs" tone="muted">
                {copy.provident.taxNote.before} <Num value={taxRate} /> <Term prefix="מ" id="הרווח הריאלי">{copy.provident.taxNote.term}</Term>
                {copy.provident.taxNote.after}
                {v.alt && nominalRate ? (
                  <>
                    {" "}
                    {copy.provident.altNote.before} <Num value={nominalRate} /> {copy.provident.altNote.middle} <Num value={v.alt} />.
                  </>
                ) : null}
              </Sentence>
            )}
          </section>
          <section className="rounded-md border border-dashed border-border p-3.5 flex flex-col gap-2" aria-label={copy.provident.annuity}>
            <h4 className="font-medium">{copy.provident.annuity}</h4>
            {model.annuityOpen === true && v.transfer ? (
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{copy.provident.moves}</dt>
                  <dd className="text-lg font-semibold">
                    <Num value={v.transfer} />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{copy.provident.pensionTax}</dt>
                  <dd className="font-semibold">
                    {copy.provident.exempt} <RuleRef id="TXK-09" />
                  </dd>
                </div>
              </dl>
            ) : model.annuityOpen === false && earlyAge ? (
              <Sentence size="sm">
                {copy.provident.closed.before} <Num value={earlyAge} display={String(earlyAge.value)} />.
              </Sentence>
            ) : (
              <p className="text-sm">{copy.provident.needAge}</p>
            )}
            {model.annuityOpen === true && <G2Gap id="annuityFactors" />}
            {exemptAge && (
              <Sentence size="xs" tone="muted">
                {copy.provident.annuityNote.before} <Term id="קצבה מוכרת">{copy.provident.annuityNote.term}</Term> {copy.provident.annuityNote.middle} <Num value={exemptAge} display={String(exemptAge.value)} /> {copy.provident.annuityNote.after}
              </Sentence>
            )}
          </section>
        </div>
        <p className="text-sm text-muted-foreground max-w-measure">{copy.provident.third}</p>
      </div>

      {v.gain && v.brokerGain && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{copy.provident.versus}</p>
          <GainBars
            bars={[
              { key: "kgl", label: copy.provident.lumpBar, value: v.gain, tone: "value" },
              { key: "broker", label: copy.hishtalmut.broker, value: v.brokerGain, tone: "alt" },
            ]}
            diff={diff}
            diffLabel={(model.diff ?? 0) >= 0 ? copy.provident.diffMore : copy.provident.diffLess}
          />
          <p className="text-xs text-muted-foreground">{copy.hishtalmut.barsNote}</p>
        </div>
      )}

      {(brokerRange || managerRange) && (
        <div className="flex flex-col gap-2 text-sm max-w-measure">
          <p className="font-medium">{copy.hishtalmut.rangeLead}</p>
          <ul className="flex flex-col gap-1.5 list-disc ps-5">
            {brokerRange && (
              <li>
                {copy.provident.rangeBroker.before} <Num value={brokerRange.low} /> {copy.hishtalmut.rangeBroker.to} <Num value={brokerRange.high} />
                {brokerCount ? (
                  <>
                    {" "}
                    ({copy.hishtalmut.rangeBroker.of} <Num value={brokerCount} /> {copy.hishtalmut.rangeBroker.collected}
                    {brokerName ? `; ${copy.hishtalmut.rangeBroker.here} ${brokerName}` : ""})
                  </>
                ) : null}
                .{" "}
                <Link to="/indices" className="text-link hover:underline">
                  {copy.hishtalmut.rangeBroker.more}
                </Link>
              </li>
            )}
            {managerRange && rangeMin && rangeMax && (
              <li>
                {copy.provident.rangeManager.before} <Num value={managerRange.low} /> {copy.hishtalmut.rangeManager.to} <Num value={managerRange.high} /> ({copy.hishtalmut.rangeManager.fees} <Num value={rangeMin} /> {copy.hishtalmut.rangeManager.toFee} <Num value={rangeMax} />
                {rangeCount ? (
                  <>
                    {copy.hishtalmut.rangeManager.across} <Num value={rangeCount} /> {copy.hishtalmut.rangeManager.tracks}
                  </>
                ) : null}
                ).
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground max-w-measure">
        <p>
          {copy.hishtalmut.assumption.before} {returnPct && <Num value={returnPct} />} {copy.hishtalmut.assumption.middle} {inflationPct && <Num value={inflationPct} />} {copy.hishtalmut.assumption.after}
        </p>
        <p>{copy.common.todayMoney}</p>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
