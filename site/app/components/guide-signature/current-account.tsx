// Current account (D29): what money costs while it sits there. Two lines in today's money, the account on the bank's published
// rate up to its ceiling (only for a customer who meets the conditions) and a daily money-market fund on the site's assumption,
// the gap between them filled and named. Figures come from engine runs of the two bundles (guide-signature.ts `currentAccountModel`).
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { currentAccountModel, fact } from "../../lib/guide-signature";
import { AxisLabels, niceYearTicks } from "../chart/TimelineChart";
import { NumberField, SliderField } from "../timeline/fields";
import { Num, RulesLine } from "../provenance";
import { SegmentedControl, cx } from "../ui";
import { FigureRow, SourceLine, figure, inputSite, rulesOfBundle, useSigInputs, useWidth, yearsRange, type VisualProps } from "./kit";

const HEIGHT = 250;
const TOP = 20;
const BOTTOM = 26;

export function CurrentAccountVisual({ data, today }: VisualProps) {
  const account = data.bundles["current-account"]!;
  const fundBundle = data.bundles["money-market-fund-daily"]!;
  const inputs = useSigInputs(account);
  const [met, setMet] = useState<"met" | "notMet">("met");
  const rate = fact(data, "rate");
  const ceiling = fact(data, "ceiling");
  const card = fact(data, "cardMonthly");
  const cash = fact(data, "cashRate")!;
  const years = Math.max(1, Math.round(inputs.years));
  const model = useMemo(() => currentAccountModel(data, { balance: inputs.amount, years, conditionsMet: met === "met" }), [data, inputs.amount, years, met]);
  const [box, width] = useWidth();
  const yr = yearsRange(account);

  const plotW = width - 8;
  const pts = model?.points ?? [];
  const maxV = Math.max(1, ...pts.map((p) => Math.max(p.account, p.fund)), inputs.amount);
  const x = scaleLinear().domain([0, years]).range([0, plotW]);
  const y = scaleLinear().domain([0, maxV]).nice(4).range([HEIGHT - BOTTOM, TOP]);
  const ticks = y.ticks(4);
  const acct = line<{ year: number; account: number }>().x((d) => x(d.year)).y((d) => y(d.account));
  const fnd = line<{ year: number; fund: number }>().x((d) => x(d.year)).y((d) => y(d.fund));
  const gap = area<{ year: number; account: number; fund: number }>().x((d) => x(d.year)).y0((d) => y(d.account)).y1((d) => y(d.fund));
  const last = pts[pts.length - 1];

  const base = (key: "amount_now" | "horizon_years", n: number, src: "amount" | "years") => inputSite(account, key, n, inputs.source[src], today, key === "amount_now" ? copy.common.inputNames.balance : copy.common.inputNames.years);
  const inputValues = { [copy.common.inputNames.balance]: base("amount_now", inputs.amount, "amount"), [copy.common.inputNames.years]: base("horizon_years", years, "years") };
  const runInputs = {
    ...inputValues,
    ...(met === "met" && rate ? { [copy.common.inputNames.rate]: rate } : {}),
    ...(met === "met" && ceiling ? { [copy.common.inputNames.ceiling]: ceiling } : {}),
  };
  const fundInputs = { ...inputValues, [copy.common.inputNames.assumption]: cash };
  const values = model
    ? {
        account: figure(model.end.account, "nis", "F-67", runInputs, today, copy.account.about.account, rulesOfBundle(account)),
        fund: figure(model.end.fund, "nis", "F-67", fundInputs, today, copy.account.about.fund, rulesOfBundle(fundBundle)),
      }
    : null;
  const cost = values && model ? figure(model.end.cost, "nis", "F-67", { [copy.account.figures.fund]: values.fund, [copy.account.figures.account]: values.account }, today, copy.account.about.cost) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.account.balance}
          unit="nis"
          value={inputs.amount}
          isEntered={inputs.source.amount === "guide"}
          validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
          onCommit={inputs.setAmount}
          onReset={() => inputs.setAmount(null)}
          disabled={!inputs.ready}
        />
        <SliderField
          label={copy.common.years}
          unit="years"
          value={years}
          isEntered={inputs.source.years === "guide"}
          validate={(n) => (n < yr.min || n > yr.max || !Number.isInteger(n) ? `${valuesCopy.errors.years[0]} ${fmt.number(yr.min)} ${valuesCopy.errors.years[1]}${fmt.number(yr.max)}.` : null)}
          onCommit={inputs.setYears}
          onReset={() => inputs.setYears(null)}
          min={yr.min}
          max={yr.max}
          step={yr.step ?? 1}
          inputMode="numeric"
          disabled={!inputs.ready}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="field-label" id="sig-account-cond">
          {copy.account.conditionsLabel}
        </span>
        <SegmentedControl<"met" | "notMet"> labelledBy="sig-account-cond" options={[{ value: "met", label: copy.account.conditions.met }, { value: "notMet", label: copy.account.conditions.notMet }]} value={met} onChange={setMet} className="sm:max-w-md" />
      </div>
      <SourceLine sources={[inputs.source.amount, inputs.source.years]} />

      {model ? (
        <>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="מקרא">
            <li className="flex items-center gap-1.5"><span className="w-3.5 h-[3px] rounded-sm bg-chart-net" /> {copy.account.chart.account}</li>
            <li className="flex items-center gap-1.5"><span className="w-3.5 h-[3px] rounded-sm bg-chart-alt" /> {copy.account.chart.fund}</li>
            <li className="flex items-center gap-1.5"><span className="w-3.5 border-t-2 border-dashed border-chart-baseline" /> {copy.account.chart.baseline}</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-alt/25" /> {copy.account.chart.cost}</li>
          </ul>
          <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
            <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.account.chart.aria} className="block select-none">
              {ticks.map((t) => (
                <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth="1" />
              ))}
              <AxisLabels ticks={ticks} y={y} />
              <path d={gap(pts) ?? ""} className="fill-chart-alt" fillOpacity="0.22" />
              <line x1={0} x2={plotW} y1={y(model.start)} y2={y(model.start)} className="stroke-chart-baseline" strokeWidth="1.5" strokeDasharray="5 4" />
              <path d={fnd(pts) ?? ""} fill="none" className="stroke-chart-alt" strokeWidth="2.5" strokeLinejoin="round" />
              <path d={acct(pts) ?? ""} fill="none" className="stroke-chart-net" strokeWidth="2.5" strokeLinejoin="round" />
              {niceYearTicks(years).map((t) => (
                <text key={t} x={x(t)} y={HEIGHT - 8} textAnchor={t === 0 ? "start" : t === years ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                  {t === 0 ? copy.account.today : t}
                </text>
              ))}
            </svg>
            {last && (
              <>
                <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: Math.max(0, y(last.fund) - 22) }}>
                  {copy.account.chart.fund}
                </span>
                <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: y(last.account) + 6 }}>
                  {copy.account.chart.account}
                </span>
                {cost && (
                  <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ right: 12, top: Math.min(HEIGHT - BOTTOM - 24, Math.max(TOP, (y(last.fund) + y(last.account)) / 2 - 10)) }}>
                    {copy.account.chart.cost} <Num value={cost} />
                  </span>
                )}
              </>
            )}
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <FigureRow label={`${copy.account.figures.account} ${copy.account.after} ${fmt.years(years)}`} tone="value">
              {values && <Num value={values.account} size="inline" />}
            </FigureRow>
            <FigureRow label={copy.account.figures.fund} tone="alt">
              {values && <Num value={values.fund} />}
            </FigureRow>
            <FigureRow label={copy.account.figures.cost}>{cost && <Num value={cost} />}</FigureRow>
          </dl>
          <p className="text-xs text-muted-foreground">{copy.common.todayMoney}</p>
        </>
      ) : null}

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        {rate && ceiling && (
          <p>
            {copy.account.rateLine.before} <Num value={rate} /> {copy.account.rateLine.middle} <Num value={ceiling} />
            {copy.account.rateLine.after}
          </p>
        )}
        <p className={cx(met === "met" ? "text-muted-foreground" : "text-foreground")}>
          {met === "met" ? (
            <>
              {copy.account.terms.lead} {copy.account.terms.mortgage}; {card ? <>{copy.account.terms.card.before} <Num value={card} /> {copy.account.terms.card.after}</> : copy.account.terms.cardPlain}; {copy.account.terms.securities}. {copy.account.terms.notPepper}
            </>
          ) : (
            copy.account.noInterest
          )}
        </p>
        <p className="text-muted-foreground">{copy.common.onlyLeumi}</p>
        <p className="text-muted-foreground">
          {copy.common.fundAssumption.before} <Num value={cash} /> {copy.common.fundAssumption.after}
        </p>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
