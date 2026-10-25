// Makam (D29): what happens if I sell before redemption? The price climbing to 100 at the assumed yield (P-05, labelled the site's
// assumption), a draggable "sell after N months" marker, and at the marker the price, the gain so far, the tax on it and what is left,
// all from an engine run of the makam ledger (F-24 with the tariff's commissions and the sale tax of TXI-12, or TXI-11 at redemption).
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact, makamModel } from "../../lib/guide-signature";
import { entered as enteredValue } from "../../lib/value";
import { NumberField } from "../timeline/fields";
import { Num, RuleRef, RulesLine } from "../provenance";
import { Callout } from "../ui";
import { FigureRow, Marker, MarkerMark, SourceLine, figure, inputSite, rulesOfBundle, useSigInputs, useWidth, type VisualProps } from "./kit";

const HEIGHT = 230;
const TOP = 24;
const BOTTOM = 28;

export function MakamVisual({ data, today }: VisualProps) {
  const bundle = data.bundles["makam"]!;
  const inputs = useSigInputs(bundle);
  const cash = fact(data, "cashRate")!;
  const discountRate = fact(data, "discountRate");
  const gainRate = fact(data, "gainRate");
  const depositRate = fact(data, "depositRate");
  const brk = fact(data, "deposit:break");
  const depositTerm = fact(data, "deposit:term");
  const [month, setMonth] = useState<number | null>(null);
  const [box, width] = useWidth();
  const model0 = useMemo(() => makamModel(data, { amount: inputs.amount, month: 6 }), [data, inputs.amount]);
  const term = model0?.term ?? 12;
  const m = Math.min(term, Math.max(1, month ?? Math.round(term / 2)));
  const model = useMemo(() => makamModel(data, { amount: inputs.amount, month: m }), [data, inputs.amount, m]);
  const plotW = width - 8;
  const prices = model?.prices ?? [];
  const lo = prices.length ? Math.floor(prices[0]! * 2) / 2 : 96;
  const x = scaleLinear().domain([0, term]).range([0, plotW]);
  const y = scaleLinear().domain([lo, 100]).range([HEIGHT - BOTTOM, TOP]);
  const pts = prices.map((p, i) => ({ i, p }));
  const curve = line<{ i: number; p: number }>().x((d) => x(d.i)).y((d) => y(d.p));
  const gain = area<{ i: number; p: number }>().x((d) => x(d.i)).y0(() => y(prices[0] ?? lo)).y1((d) => y(d.p));
  const ticks = Array.from({ length: Math.floor(term / 3) + 1 }, (_, i) => i * 3);

  const amountIn = inputSite(bundle, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const sale = enteredValue(m, "months", today, copy.makam.marker);
  const runInputs = { [copy.common.inputNames.amount]: amountIn, [copy.common.inputNames.assumption]: cash, [copy.makam.marker]: sale, ...(model?.atRedemption ? (discountRate ? { [copy.makam.taxRedeem]: discountRate } : {}) : gainRate ? { [copy.makam.taxSale]: gainRate } : {}) };
  const rules = rulesOfBundle(bundle);
  const v = model
    ? {
        buy: figure(prices[0]!, "index_points", "F-24", { [copy.common.inputNames.assumption]: cash }, today, copy.makam.about.buy),
        price: figure(model.price, "index_points", "F-24", { [copy.common.inputNames.assumption]: cash, [copy.makam.marker]: sale }, today, copy.makam.about.price),
        gain: figure(model.gain, "nis", "F-24", runInputs, today, copy.makam.about.gain, rules),
        tax: figure(model.tax, "nis", model.atRedemption ? "F-24" : "F-40", runInputs, today, copy.makam.about.tax, rules),
        fees: figure(model.fees, "nis", "F-12", runInputs, today, copy.makam.about.fees, rules),
        net: figure(model.net, "nis", "F-24", runInputs, today, copy.makam.about.net, rules),
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.makam.amount}
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

      {model && v && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{copy.makam.sell}</span>
          <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT + 18 }}>
            <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.makam.chart.aria} className="block select-none">
              <line x1={0} x2={plotW} y1={y(100)} y2={y(100)} className="stroke-chart-grid" strokeWidth="1" />
              <line x1={0} x2={plotW} y1={y(prices[0]!)} y2={y(prices[0]!)} className="stroke-chart-baseline" strokeWidth="1.5" strokeDasharray="5 4" />
              <path d={gain(pts.slice(0, m + 1)) ?? ""} className="fill-chart-net" fillOpacity="0.25" />
              <path d={curve(pts) ?? ""} fill="none" className="stroke-chart-net" strokeWidth="2.5" strokeLinejoin="round" />
              <line x1={0} x2={plotW} y1={HEIGHT - BOTTOM} y2={HEIGHT - BOTTOM} className="stroke-chart-axis" strokeWidth="1" />
              {ticks.map((t) => (
                <text key={t} x={x(t)} y={HEIGHT - 8} textAnchor={t === 0 ? "start" : t === term ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                  {t}
                </text>
              ))}
              <circle cx={x(m)} cy={y(prices[m]!)} r="4.5" className="fill-chart-net stroke-card" strokeWidth="2" />
              <MarkerMark x={x(m)} y1={TOP - 6} y2={HEIGHT - BOTTOM + 2} />
            </svg>
            <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 0, top: y(100) - 17 }}>
              {copy.makam.chart.par}
            </span>
            <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 0, top: y(prices[0]!) - 19 }}>
              {copy.makam.chart.buy} <Num value={v.buy} />
            </span>
            <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 0, top: HEIGHT }}>
              {copy.makam.unit}
            </span>
            <Marker min={1} max={term} step={1} value={m} onChange={setMonth} label={copy.makam.sell} valueText={`${m} ${copy.makam.unit}`} left={0} top={TOP - 8} width={plotW} height={HEIGHT - BOTTOM - TOP + 12} />
          </div>
          <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
        </div>
      )}

      {model && v && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            {m >= term ? copy.makam.atRedemption : `${copy.makam.atSale} ${fmt.months(m)}`}:
          </p>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FigureRow label={copy.makam.figures.price}>
              <Num value={v.price} />
            </FigureRow>
            <FigureRow label={copy.makam.figures.gain} tone="value">
              <Num value={v.gain} />
            </FigureRow>
            <FigureRow
              label={
                <>
                  {model.atRedemption ? copy.makam.taxRedeem : copy.makam.taxSale}
                  {(model.atRedemption ? discountRate : gainRate) && (
                    <>
                      {" "}
                      <span className="whitespace-nowrap">
                        (<Num value={(model.atRedemption ? discountRate : gainRate)!} />)
                      </span>
                    </>
                  )}
                </>
              }
            >
              <Num value={v.tax} />
            </FigureRow>
            <FigureRow label={copy.makam.figures.net}>
              <Num value={v.net} />
            </FigureRow>
          </dl>
          {model.fees > 0 && (
            <p className="text-sm text-muted-foreground">
              {copy.makam.figures.fees}: <Num value={v.fees} />, {copy.makam.feesWhose}
            </p>
          )}
          {model.blocked && (
            <Callout tone="blocked">
              {copy.makam.blocked} <RuleRef id={model.blocked} />
            </Callout>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p>
          {copy.makam.yieldLine.before} <Num value={cash} /> {copy.makam.yieldLine.after}
        </p>
        <p className="text-muted-foreground">{copy.makam.redeem}</p>
        {depositRate && (
          <p>
            {copy.makam.altNoBreak} <Num value={depositRate} />
            {depositTerm ? (
              <>
                {" "}
                <Num value={depositTerm} display={fmt.months(Number(depositTerm.value))} prefix={copy.makam.altTermPrefix} />
              </>
            ) : null}
            {brk ? (
              <>
                : <Num value={brk} display={copy.makam.noBreak} />
              </>
            ) : null}
            . {copy.common.onlyLeumi}
          </p>
        )}
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
