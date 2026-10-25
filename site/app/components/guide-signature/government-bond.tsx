// Government bond (D29): what happens to the price if rates move? One control, "rates change by X percentage points" (minus 3 to
// plus 3), shows what a sale today would bring against holding to redemption and getting what was promised (F-25, `bondPrice`), and
// the same move on a makam, the short instrument it is set against. The series' terms are the rule P-05 names (GOV-11); the coupon is
// the site's assumption (P-05 `cash_rate`, D20) and the shift is the person's own.
import { useId, useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { bondModel, fact } from "../../lib/guide-signature";
import { entered as enteredValue } from "../../lib/value";
import { GainBars, NumberField, Sentence, Stat, StatRow } from "../kit";
import { Num, RulesLine } from "../provenance";
import { SourceLine, figure, inputSite, useSigInputs, type VisualProps } from "./kit";

const SHIFT_MIN = -3;
const SHIFT_MAX = 3;
const YEARS_MIN = 1;
const YEARS_MAX = 30;

function Range({ id, label, valueText, min, max, step, value, onChange }: { id: string; label: string; valueText: React.ReactNode; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="flex items-center justify-between gap-3">
        <span className="field-label" id={`${id}-l`}>
          {label}
        </span>
        <span className="font-semibold">{valueText}</span>
      </div>
      <input type="range" className="slider" aria-labelledby={`${id}-l`} min={min} max={max} step={step} value={value} style={{ "--fill": `${fill}%` } as React.CSSProperties} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function GovernmentBondVisual({ data, today }: VisualProps) {
  const bundle = data.bundles["government-bond"]!;
  const inputs = useSigInputs(bundle);
  const id = useId().replace(/:/g, "");
  const cash = fact(data, "cashRate")!;
  const every = fact(data, "couponEvery");
  const linkage = fact(data, "linkage");
  const [shift, setShift] = useState(1);
  const [yearsOverride, setYears] = useState<number | null>(null);
  const years = Math.min(YEARS_MAX, Math.max(YEARS_MIN, yearsOverride ?? Math.round(inputs.years)));
  const model = useMemo(() => bondModel(data, { amount: inputs.amount, years, shiftPct: shift }), [data, inputs.amount, years, shift]);
  const amountIn = inputSite(bundle, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const shiftIn = enteredValue(shift, "pct", today, copy.bond.shift);
  const yearsIn = enteredValue(years, "years", today, copy.bond.years);
  const base = { [copy.common.inputNames.amount]: amountIn, [copy.bond.shift]: shiftIn, [copy.bond.years]: yearsIn, [copy.common.inputNames.coupon]: cash, ...(every ? { [copy.common.inputNames.couponEvery]: every } : {}) };
  const v = model
    ? {
        price: figure(model.price, "index_points", "F-25", base, today, copy.bond.about.price),
        change: figure(model.changePct, "pct", "F-25", base, today, copy.bond.about.change),
        sale: figure(model.saleValue, "nis", "F-25", base, today, copy.bond.about.sale),
        redeem: figure(model.redemption, "nis", "F-25", { [copy.common.inputNames.amount]: amountIn }, today, copy.bond.about.redeem),
        coupons: figure(model.coupons, "nis", "F-25", base, today, copy.bond.about.coupons),
        makam: figure(model.makamChangePct, "pct", "F-24", { [copy.bond.shift]: shiftIn, [copy.common.inputNames.assumption]: cash }, today, copy.bond.about.makam),
        diff: figure(Math.abs(model.saleValue - model.redemption), "nis", "F-25", base, today, copy.bond.about.diff),
      }
    : null;
  const signed = (n: number) => `${n > 0 ? "+" : ""}${fmt.number(n)}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.bond.amount}
          unit="nis"
          value={inputs.amount}
          isEntered={inputs.source.amount === "guide"}
          validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
          onCommit={inputs.setAmount}
          onReset={() => inputs.setAmount(null)}
          disabled={!inputs.ready}
        />
        <Range id={`${id}-y`} label={copy.bond.years} valueText={<Num value={yearsIn} display={fmt.years(years)} />} min={YEARS_MIN} max={YEARS_MAX} step={1} value={years} onChange={setYears} />
      </div>
      <Range
        id={`${id}-s`}
        label={copy.bond.shift}
        valueText={
          <>
            <Num value={shiftIn} display={signed(shift)} /> {copy.bond.shiftUnit}
          </>
        }
        min={SHIFT_MIN}
        max={SHIFT_MAX}
        step={0.5}
        value={shift}
        onChange={setShift}
      />
      <SourceLine sources={[inputs.source.amount]} />

      {model && v && (
        <>
          <StatRow cols={3}>
            <Stat label={copy.bond.figures.price} tone="value">
              <Num value={v.price} />
            </Stat>
            <Stat label={copy.bond.figures.change}>
              <Num value={v.change} display={signed(Math.round(model.changePct * 10) / 10) + "%"} />
            </Stat>
            <Stat label={copy.bond.figures.makam} tone="alt">
              <Num value={v.makam} display={signed(Math.round(model.makamChangePct * 10) / 10) + "%"} />
            </Stat>
          </StatRow>
          <GainBars
            bars={[
              { key: "sale", label: copy.bond.bars.sell, value: v.sale, tone: "value" },
              { key: "hold", label: copy.bond.bars.hold, value: v.redeem, tone: "alt" },
            ]}
            diff={v.diff}
            diffLabel={model.saleValue < model.redemption ? copy.bond.diffLoss : copy.bond.diffGain}
          />
          <Sentence size="sm" measure>
            {copy.bond.holdLine.before} <Num value={v.redeem} /> {copy.bond.holdLine.middle} <Num value={v.coupons} /> {copy.bond.holdLine.after}
          </Sentence>
        </>
      )}

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p className="text-muted-foreground">{copy.bond.note}</p>
        {every && linkage && (
          <p>
            {copy.bond.termsLine.before} <Num value={linkage} display={copy.bond.linkage[String(linkage.value)] ?? String(linkage.value)} />
            {copy.bond.termsLine.middle} <Num value={every} display={fmt.months(Number(every.value))} />.
          </p>
        )}
        <p>
          {copy.bond.couponLine.before} <Num value={cash} /> {copy.bond.couponLine.after}
        </p>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
