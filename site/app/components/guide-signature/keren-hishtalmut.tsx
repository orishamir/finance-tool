// Study fund (D29): what does the six-year lock buy? The same index held in a study fund and in a brokerage account, the same outlay, taken
// out after a year the person drags on a 12-year line (locked to year 6, exempt after). Two bars with the difference on a bracket, never
// a third box. Employment (employee or self-employed) changes what the run does: an employee's own deposit is benefited only up to a share
// of the determining salary; a self-employed person deducts the deposit. The employer's deposit is money only a salary fund receives (B2):
// shown as its ceiling, outside the comparison.
import { scaleLinear } from "d3-scale";
import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { hishtalmutModel, type Employment } from "../../lib/guide-signature-g2";
import { p05Number, p05Value, type Bundle } from "../../lib/engine";
import { useGoals } from "../../lib/goal";
import { useInputs } from "../../lib/inputs";
import { entered as enteredValue, type SiteValue } from "../../lib/value";
import { Callout, GainBars, InputSlot, Marker, MarkerMark, NumberField, SegmentedControl, Sentence, useWidth } from "../kit";
import { Num, RulesLine, Term } from "../provenance";
import { G2Gap, HoldRow, PlanInputs, text } from "./g2-parts";
import { figure, inputSite, rulesOfBundle, useSigInputs, type VisualProps } from "./kit";

const HEIGHT = 92;
const LANE_Y = 26;
const LANE_H = 28;
const AXIS_Y = 66;
const MAX_YEARS = 12;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function KerenHishtalmutVisual(props: VisualProps) {
  const base = props.data.bundles["keren-hishtalmut"] ?? props.data.bundles["brokerage-account"];
  if (!base) return <G2Gap id="bundle" />;
  return <Inner {...props} base={base} />;
}

function Inner({ data, today, base }: VisualProps & { base: Bundle }) {
  const study = data.bundles["keren-hishtalmut"];
  const broker = data.bundles["brokerage-account"];
  const inputs = useSigInputs(base);
  const { state, setEmployment } = useInputs();
  const { current } = useGoals();
  const employment: Employment = state.employment ?? current?.profile.employment ?? "employee";
  const [incomePick, setIncomePick] = useState<number | null>(null);
  const goalSalary = current?.profile.salary && current.profile.salary > 0 ? current.profile.salary : null;
  const p05Income = p05Number(base.p05, "annual_income") / 12;
  const income = incomePick ?? goalSalary ?? p05Income;
  const incomeSource = incomePick !== null ? "guide" : goalSalary !== null ? "goal" : "p05";
  const [yearsPick, setYearsPick] = useState<number | null>(null);
  const years = clamp(yearsPick ?? Math.round(inputs.years), 1, MAX_YEARS);

  const model = useMemo(() => hishtalmutModel(data, { amount: inputs.amount, monthly: inputs.monthly, years, employment, income }), [data, inputs.amount, inputs.monthly, years, employment, income]);
  const lock = model.lockYears ?? 0;
  const [box, width] = useWidth();
  const pid = useId().replace(/:/g, "");
  const plotW = width - 8;
  const x = scaleLinear().domain([0, MAX_YEARS]).range([0, plotW]);
  const ticks = Array.from({ length: MAX_YEARS / 2 + 1 }, (_, i) => i * 2);

  // ---- value objects
  const amountIn = inputSite(base, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const monthlyIn = inputSite(base, "monthly_deposit", inputs.monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const incomeLabel = copy.hishtalmut.income[employment]!;
  const incomeLabelEmployee = copy.hishtalmut.income.employee!;
  const yearsIn = enteredValue(years, "years", today, copy.hishtalmut.marker);
  const returnPct = fact(data, "returnPct");
  const inflationPct = fact(data, "inflationPct");
  const trackFee = fact(data, "trackFee");
  const incomeIn: SiteValue = incomeSource === "p05" ? figure(income, "nis", "F-67", { [copy.hishtalmut.incomeAnnual]: p05Value(base.p05, "annual_income") }, today, copy.hishtalmut.incomeAbout) : enteredValue(income, "nis", today, copy.hishtalmut.incomeAbout);
  const common: Record<string, SiteValue> = {
    [copy.common.inputNames.amount]: amountIn,
    [copy.common.inputNames.monthly]: monthlyIn,
    [copy.hishtalmut.marker]: yearsIn,
    ...(returnPct ? { [copy.hishtalmut.inputNames.ret]: returnPct } : {}),
    ...(inflationPct ? { [copy.hishtalmut.inputNames.inflation]: inflationPct } : {}),
    [incomeLabel]: incomeIn,
  };
  const studyRules = study ? rulesOfBundle(study) : [];
  const v = {
    study: model.study ? figure(model.study.gain, "nis", "F-67", { ...common, ...(trackFee ? { [copy.hishtalmut.inputNames.trackFee]: trackFee } : {}) }, today, copy.hishtalmut.about.study, studyRules) : null,
    broker: model.broker && broker ? figure(model.broker.gain, "nis", "F-67", common, today, copy.hishtalmut.about.broker, rulesOfBundle(broker)) : null,
  };
  const diff = v.study && v.broker && model.diff !== null ? figure(Math.abs(model.diff), "nis", "F-67", { [copy.hishtalmut.study]: v.study, [copy.hishtalmut.broker]: v.broker }, today, copy.hishtalmut.about.diff) : null;
  const detail = (s: typeof model.study, kind: "fees" | "tax", about: string) => (s ? figure(s[kind], "nis", "F-67", common, today, about) : null);
  const costs = { study: detail(model.study, "fees", copy.hishtalmut.about.fees), broker: detail(model.broker, "fees", copy.hishtalmut.about.fees) };
  const taxes = { study: detail(model.study, "tax", copy.hishtalmut.about.tax), broker: detail(model.broker, "tax", copy.hishtalmut.about.tax) };

  // the sensitivities (rule 3)
  const rangeFig = (r: { low: number; high: number } | null, about: string) => (r ? { low: figure(r.low, "nis", "F-67", common, today, about), high: figure(r.high, "nis", "F-67", common, today, about) } : null);
  const brokerRange = rangeFig(model.range.broker, copy.hishtalmut.about.rangeBroker);
  const managerRange = rangeFig(model.range.manager, copy.hishtalmut.about.rangeManager);

  // the employer's ceiling (employee) and the deduction (self-employed), from the rule figures
  const employerPct = fact(data, "employerPct");
  const cap = fact(data, "determiningCap");
  const ownPct = fact(data, "ownPct");
  const employerMax = employerPct && cap ? figure((Number(employerPct.value) / 100) * Math.min(income, Number(cap.value)), "nis", "F-67", { [copy.hishtalmut.inputNames.employerPct]: employerPct, [copy.hishtalmut.inputNames.cap]: cap, [incomeLabelEmployee]: incomeIn }, today, copy.hishtalmut.about.employerMax) : null;
  const benefited = model.benefitedMonthly !== null ? figure(model.benefitedMonthly, "nis", "F-27", { ...common, ...(ownPct ? { [copy.hishtalmut.inputNames.ownPct]: ownPct } : {}), ...(cap ? { [copy.hishtalmut.inputNames.cap]: cap } : {}) }, today, copy.hishtalmut.about.benefited) : null;
  const excess = model.excessMonthly !== null ? figure(model.excessMonthly, "nis", "F-27", common, today, copy.hishtalmut.about.excess) : null;
  const relief = model.reliefTotal !== null ? figure(model.reliefTotal, "nis", "F-30", common, today, copy.hishtalmut.about.relief) : null;

  const trackName = text(data, "trackName");
  const trackNumber = text(data, "trackNumber");
  const fundName = text(data, "fundName");
  const fundNumber = text(data, "fundNumber");
  const indexName = text(data, "indexName");
  const brokerName = text(data, "brokerName");
  const rangeMin = fact(data, "rangeMin");
  const rangeMax = fact(data, "rangeMax");
  const rangeCount = fact(data, "rangeCount");
  const brokerCount = fact(data, "brokerCount");
  const trustee = fact(data, "fundTrustee");
  const management = fact(data, "fundManagement");
  const taxRate = fact(data, "taxRate");
  const firstBracket = fact(data, "firstBracket");
  const lockYears = fact(data, "lockYears");
  const lockShort = fact(data, "lockYearsShort");

  const gapText = model.studyGap === "self-employed-early" ? copy.hishtalmut.gaps.selfEmployedEarly : model.studyGap === "no-run" ? copy.common.gapFallback : model.studyGap === "blocked" ? copy.hishtalmut.gaps.blocked : null;

  return (
    <div className="flex flex-col gap-5">
      {lockYears && (
        <Sentence measure>
          {copy.hishtalmut.lead.before} <Num value={lockYears} display={fmt.years(Number(lockYears.value))} /> {copy.hishtalmut.lead.after}
        </Sentence>
      )}
      {indexName && trackName && fundName ? (
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">
            {copy.hishtalmut.heldLead} <span className="text-foreground">{indexName}</span>
          </p>
          <ul className="flex flex-col gap-1.5">
            <HoldRow tone="value" name={copy.hishtalmut.study}>
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
        <div className="flex flex-col gap-1.5">
          <span className="field-label" id="sig-hish-emp">
            {copy.hishtalmut.employmentLabel}
          </span>
          <SegmentedControl<Employment>
            labelledBy="sig-hish-emp"
            options={[
              { value: "employee", label: copy.hishtalmut.employment.employee! },
              { value: "self-employed", label: copy.hishtalmut.employment["self-employed"]! },
            ]}
            value={employment}
            onChange={(e) => setEmployment(e)}
          />
        </div>
        <NumberField
          label={incomeLabel}
          unit="nis"
          value={income}
          isEntered={incomePick !== null}
          validate={(n) => (n <= 0 ? valuesCopy.errors.negative : null)}
          onCommit={(n) => setIncomePick(n)}
          onReset={() => setIncomePick(null)}
          disabled={!inputs.ready}
          optional
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-3">
        {copy.hishtalmut.incomeSource} {copy.common.source[incomeSource]}.
      </p>
      <PlanInputs bundle={base} inputs={inputs} today={today} />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{copy.hishtalmut.marker}</span>
        <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
          <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.hishtalmut.chart.aria} className="block select-none">
            <defs>
              <pattern id={`${pid}-lock`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" className="fill-muted" />
                <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-marker" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x={0} y={LANE_Y} width={Math.max(0, x(lock))} height={LANE_H} rx={3} fill={`url(#${pid}-lock)`} />
            <rect x={x(lock)} y={LANE_Y} width={Math.max(0, plotW - x(lock))} height={LANE_H} rx={3} className="fill-chart-value" />
            <line x1={0} x2={plotW} y1={AXIS_Y} y2={AXIS_Y} className="stroke-chart-axis" strokeWidth="1" />
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={AXIS_Y + 16} textAnchor={t === 0 ? "start" : t === MAX_YEARS ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                {t}
              </text>
            ))}
            <MarkerMark x={x(years)} y1={LANE_Y - 10} y2={AXIS_Y + 2} />
          </svg>
          <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ left: 4, top: LANE_Y + 4 }}>
            {copy.hishtalmut.chart.locked}
          </span>
          <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ right: 4, top: LANE_Y + 4 }}>
            {copy.hishtalmut.chart.open}
          </span>
          <span className="absolute text-xs text-chart-text" dir="rtl" style={{ right: 0, top: AXIS_Y + 18 }}>
            {copy.hishtalmut.unit}
          </span>
          <Marker min={1} max={MAX_YEARS} step={1} value={years} onChange={setYearsPick} label={copy.hishtalmut.marker} valueText={fmt.years(years)} left={0} top={LANE_Y - 12} width={plotW} height={AXIS_Y - LANE_Y + 16} />
        </div>
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          {copy.hishtalmut.at.before} <InputSlot chars={10}><bdi>{fmt.years(years)}</bdi></InputSlot>
          {copy.hishtalmut.at.after}
        </p>
        {gapText && (
          <Callout tone="caution">{gapText}</Callout>
        )}
        {v.study && v.broker ? (
          <>
            <GainBars
              bars={[
                { key: "study", label: copy.hishtalmut.study, value: v.study, tone: "value" },
                { key: "broker", label: copy.hishtalmut.broker, value: v.broker, tone: "alt" },
              ]}
              diff={diff}
              diffLabel={(model.diff ?? 0) >= 0 ? copy.hishtalmut.diffMore : copy.hishtalmut.diffLess}
            />
            <p className="text-xs text-muted-foreground">{copy.hishtalmut.barsNote}</p>
            <table className="text-sm w-full max-w-md">
              <thead>
                <tr className="text-muted-foreground text-start">
                  <th scope="col" className="font-normal text-start pb-1" />
                  <th scope="col" className="font-normal text-start pb-1">
                    {copy.hishtalmut.study}
                  </th>
                  <th scope="col" className="font-normal text-start pb-1">
                    {copy.hishtalmut.broker}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="font-normal text-start text-muted-foreground pe-3 py-0.5">
                    {copy.hishtalmut.costsRow}
                  </th>
                  <td>{costs.study && <Num value={costs.study} size="cell" />}</td>
                  <td>{costs.broker && <Num value={costs.broker} size="cell" />}</td>
                </tr>
                <tr>
                  <th scope="row" className="font-normal text-start text-muted-foreground pe-3 py-0.5">
                    {copy.hishtalmut.taxRow}
                  </th>
                  <td>{taxes.study && <Num value={taxes.study} size="cell" />}</td>
                  <td>{taxes.broker && <Num value={taxes.broker} size="cell" />}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
        {model.early && !gapText && firstBracket && (
          <Sentence size="sm" measure>
            {copy.hishtalmut.earlyLine.before} <Num value={firstBracket} /> {copy.hishtalmut.earlyLine.after}
          </Sentence>
        )}
      </div>

      {employment === "employee" ? (
        <div className="flex flex-col gap-2 text-sm max-w-measure">
          {benefited && ownPct && (
            <p>
              {copy.hishtalmut.employee.own.before} <Num value={benefited} /> {copy.hishtalmut.employee.own.middle} <Term id="הפקדה מוטבת">{copy.hishtalmut.employee.own.term}</Term>
              {copy.hishtalmut.employee.own.after} <Num value={ownPct} /> {copy.hishtalmut.employee.own.end}
            </p>
          )}
          {excess && taxRate && Number(excess.value) > 0 && (
            <p>
              {copy.hishtalmut.employee.excess.before} <Num value={excess} /> {copy.hishtalmut.employee.excess.middle} <Num value={taxRate} /> {copy.hishtalmut.employee.excess.after}
            </p>
          )}
          {employerMax && employerPct && cap && (
            <p>
              {copy.hishtalmut.employee.employer.before} <Num value={employerPct} /> {copy.hishtalmut.employee.employer.middle} <Num value={cap} /> {copy.hishtalmut.employee.employer.max} <Num value={employerMax} />.{" "}
              {copy.hishtalmut.employee.employer.after}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm max-w-measure">
          {relief && (
            <p>
              {copy.hishtalmut.self.before} <Num value={fact(data, "deductionPct")!} /> {copy.hishtalmut.self.middle} <Num value={fact(data, "deductionCeiling")!} />
              {copy.hishtalmut.self.saves} <Num value={relief} /> {copy.hishtalmut.self.after}
            </p>
          )}
        </div>
      )}

      {(brokerRange || managerRange) && (
        <div className="flex flex-col gap-2 text-sm max-w-measure">
          <p className="font-medium">{copy.hishtalmut.rangeLead}</p>
          <ul className="flex flex-col gap-1.5 list-disc ps-5">
            {brokerRange && (
              <li>
                {copy.hishtalmut.rangeBroker.before} <Num value={brokerRange.low} /> {copy.hishtalmut.rangeBroker.to} <Num value={brokerRange.high} />
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
                {copy.hishtalmut.rangeManager.before} <Num value={managerRange.low} /> {copy.hishtalmut.rangeManager.to} <Num value={managerRange.high} /> ({copy.hishtalmut.rangeManager.fees} <Num value={rangeMin} /> {copy.hishtalmut.rangeManager.toFee}{" "}
                <Num value={rangeMax} />
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
        {lockYears && lockShort && (
          <p>
            {copy.hishtalmut.lockLine.before} <Num value={lockYears} display={fmt.years(Number(lockYears.value))} /> {copy.hishtalmut.lockLine.middle} <Num value={lockShort} display={fmt.years(Number(lockShort.value))} />.
          </p>
        )}
        <p>
          {copy.hishtalmut.assumption.before} {returnPct && <Num value={returnPct} />} {copy.hishtalmut.assumption.middle} {inflationPct && <Num value={inflationPct} />} {copy.hishtalmut.assumption.after}
        </p>
        <p>{copy.common.todayMoney}</p>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
