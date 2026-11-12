// Makam (D29): what happens if I sell before redemption? The price climbing to 100 at the assumed yield (P-05, labelled the site's
// assumption), a draggable "sell after N months" marker, and at the marker the price, the gain so far, the tax on it and what is left,
// all from an engine run of the makam ledger (F-24 with the tariff's commissions and the sale tax of TXI-12, or TXI-11 at redemption).
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useMemo, useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact, makamModel } from "../../lib/guide-signature";
import type { SiteValue } from "../../lib/value";

import { Callout, InputSlot, LongestCase, Marker, MarkerMark, Sentence, Stat, StatRow, fill, useWidth } from "../kit";
import { Num, RuleRef, RulesLine, Term } from "../provenance";
import { figure, inputSite, rulesOfBundle, SigAmountField, termInputs, termOf, useSigInputs, typed, type VisualProps } from "./kit";

const HEIGHT = 230;
const TOP = 24;
const BOTTOM = 28;

export function MakamVisual({ data, today }: VisualProps) {
  const bundle = data.bundles["makam"]!;
  const inputs = useSigInputs(bundle);
  const cash = fact(data, "cashRate")!;
  const discountRate = fact(data, "discountRate");
  const gainRate = fact(data, "gainRate");
  const depositLo = fact(data, "depositLo");
  const depositHi = fact(data, "depositHi");
  const depositCount = fact(data, "depositCount");
  const noExit = fact(data, "depositNoExitCount");
  // the tariff the run reads is the site's pick (F-80), named beside the commission (D31)
  const house = bundle.feeValues.tradeRate?.own;
  // a house that may charge custody on makam (not a bank, BRK-52) and whose tariff does: the fees line says how much of it is custody and
  // why the banks' ban does not reach it (read the fees as trading only and the ban as broken)
  const custodyHouse = bundle.terms.memberKind === "non-bank" && !!bundle.terms.tariff?.custody;
  // custody falls at the end of each charging period (F-14), so the line says how often: 6.07 at six months and 9.14 at twelve read as unexplained
  const custodyEvery = bundle.terms.tariff?.custody?.everyMonths ?? 1;
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
  const sale = typed(m, "months", today, copy.makam.marker);
  // the series' term sets the price curve (F-24, GOV-22): the prices list it beside the yield
  const priceIn: Record<string, SiteValue> = { [copy.common.inputNames.assumption]: cash, ...termOf(bundle) };
  // the run's own inputs: the amount, the yield, the sale month and every line of the tariff it ran on (termInputs); the tax rate only on the tax and what is left
  const runInputs: Record<string, SiteValue> = { [copy.common.inputNames.amount]: amountIn, [copy.common.inputNames.assumption]: cash, [copy.makam.marker]: sale, ...termInputs(bundle) };
  const taxRate = model?.atRedemption ? (discountRate ? { [copy.makam.taxRedeem]: discountRate } : {}) : gainRate ? { [`${copy.makam.taxSale.before} ${copy.makam.taxSale.term}`]: gainRate } : {};
  const taxInputs: Record<string, SiteValue> = { ...runInputs, ...taxRate };
  const rules = rulesOfBundle(bundle);
  const v = model
    ? {
        buy: figure(prices[0]!, "index_points", "F-24", priceIn, today, copy.makam.about.buy),
        price: figure(model.price, "index_points", "F-24", { ...priceIn, [copy.makam.marker]: sale }, today, copy.makam.about.price),
        gain: figure(model.gain, "nis", "F-24", runInputs, today, copy.makam.about.gain, rules),
        tax: figure(model.tax, "nis", model.atRedemption ? "F-24" : "F-40", taxInputs, today, copy.makam.about.tax, rules),
        // the commissions, custody and the account's fixed fee of the run, with the redemption's commission (F-24)
        fees: figure(model.fees, "nis", "F-24", runInputs, today, copy.makam.about.fees, rules),
        net: figure(model.net, "nis", "F-24", taxInputs, today, copy.makam.about.net, rules),
        base: figure(model.taxedBase, "nis", model.atRedemption ? "F-24" : "F-40", runInputs, today, copy.makam.taxBase.about.base, rules),
        taxedFees: figure(model.taxedFees, "nis", "F-09", runInputs, today, copy.makam.taxBase.about.fees, rules),
        custody: figure(model.custody, "nis", "F-14", runInputs, today, copy.makam.about.custody, rules),
      }
    : null;
  // the tax's base under the figures, one height in all four cases (a sale or a redemption, with the year's fees deducted or without): the
  // base and the fees add up to the gain figure as printed, so all three keep their agorot
  const tb = copy.makam.taxBase;
  const taxLine = (t: string, rate: NonNullable<typeof gainRate>) => v && <Sentence size="sm" tone="muted" t={t} vars={{ rate: <Num value={rate} />, base: <Num value={v.base} />, fees: <Num value={v.taxedFees} />, kind: bundle.terms.tariff?.monthlyFee ? tb.kind.withAccount : tb.kind.custody, year: <Term prefix="ב" id="שנת המס">{copy.makam.taxBase.year}</Term> }} />;
  const taxText = model?.atRedemption ? (model.taxedFees > 0 ? tb.redeemFees : tb.redeem) : model && model.taxedFees > 0 ? tb.fees : tb.sale;
  const feesLine = (withCustody: boolean) =>
    v &&
    model && (
      <Sentence size="sm" tone="muted">
        {copy.makam.figures.fees}: <Num value={v.fees} />
        {withCustody && (
          <>
            , {copy.makam.feesCustody.before} <Num value={v.custody} /> {copy.makam.feesCustody.after}
            {custodyEvery > 1 && <>, {fill(copy.makam.feesCustody.every, { n: custodyEvery })}</>}
          </>
        )}
        {house && bundle.pick && (
          <>
            , {copy.makam.feesWhose.before} <bdi>{house}</bdi>
            {bundle.pick.tied ? (
              <>
                . {copy.makam.feesWhose.tied} <bdi>{bundle.pick.tied.names.filter((n) => n !== house).join(" · ")}</bdi>: {copy.makam.feesWhose.tiedGap}{bundle.pick.tied.theta && <>, <Num value={bundle.pick.tied.theta} /></>}.
              </>
            ) : (
              <>
                {copy.makam.feesWhose.middle} <Num value={bundle.pick.count} /> {copy.makam.feesWhose.after}
              </>
            )}
          </>
        )}
      </Sentence>
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SigAmountField inputs={inputs} field="amount" label={copy.makam.amount} />
      </div>

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
          {/* one height with or without the slot: the blocks under it keep their place when the marker reaches redemption */}
          <p className="text-sm font-medium min-h-6">
            {m >= term ? copy.makam.atRedemption : <>{copy.makam.atSale} <InputSlot>{fmt.months(m)}</InputSlot></>}:
          </p>
          <StatRow cols={4}>
            <Stat label={copy.makam.figures.price}>
              <Num value={v.price} />
            </Stat>
            <Stat label={copy.makam.figures.gain} tone="net">
              <Num value={v.gain} />
            </Stat>
            <Stat
              label={
                <>
                  {model.atRedemption ? (
                    copy.makam.taxRedeem
                  ) : (
                    <>
                      {copy.makam.taxSale.before} <Term id="רווח הון">{copy.makam.taxSale.term}</Term>
                    </>
                  )}
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
            </Stat>
            <Stat label={copy.makam.figures.net}>
              <Num value={v.net} />
            </Stat>
          </StatRow>
          {gainRate && discountRate && (
            <LongestCase cases={[taxLine(tb.fees, gainRate), taxLine(tb.sale, gainRate), taxLine(tb.redeemFees, discountRate), taxLine(tb.redeem, discountRate)]}>
              {!model.blocked && taxLine(taxText, model.atRedemption ? discountRate : gainRate)}
            </LongestCase>
          )}
          {/* the custody clause comes with the quarter's charge (none in the first two months): one height with it or without. The line
              shows for every amount, 0 included, so nothing under it moves when the amount is typed */}
          <LongestCase cases={custodyHouse ? [feesLine(true), feesLine(false)] : [feesLine(false)]}>{feesLine(custodyHouse && model.custody > 0)}</LongestCase>
          {/* its own line, outside the block that reflows with the custody clause: it holds for every month and every amount, since it
              rests on the house charging custody, not on what this amount pays */}
          {custodyHouse && (
            <Sentence size="sm" tone="muted">
              {copy.makam.custodyBan.before} <Term id="בית השקעות">{copy.makam.custodyBan.term}</Term>
              {copy.makam.custodyBan.after}
            </Sentence>
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
        {depositLo && depositHi && depositCount && noExit && (
          <p>
            {copy.makam.altDeposit.before}{" "}
            <span className="inline-block">
              <Num value={depositLo} /> {copy.common.rangeTo} <Num value={depositHi} />
            </span>{" "}
            {Number(noExit.value) === Number(depositCount.value) ? (
              copy.makam.altDeposit.all
            ) : (
              <>
                {copy.makam.altDeposit.middle}
                <Num value={noExit} /> {copy.makam.altDeposit.of} <Num value={depositCount} /> {copy.makam.altDeposit.after}
              </>
            )}
          </p>
        )}
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
