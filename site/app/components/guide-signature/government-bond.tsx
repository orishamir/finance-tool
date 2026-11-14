// Government bond (D29): what happens to the price if rates move? One control, "rates change by X percentage points" (minus 3 to
// plus 3), shows what a sale today would bring against holding to redemption (F-25, `bondPrice`), and
// the same move on a makam, the short instrument it is set against. The series' terms are the rule P-05 names (GOV-11); the coupon is
// the site's assumption (P-05 `cash_rate`, D20) and the shift is the person's own.
import { useId, useMemo, useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { bondModel, fact } from "../../lib/guide-signature";

import { GainBars, RangeField, Sentence, Stat, StatRow, yearsCheck } from "../kit";
import { Num, RulesLine, Term } from "../provenance";
import { figure, inputSite, SigAmountField, termOf, useSigInputs, typed, type VisualProps } from "./kit";
import { differenceOf } from "../../lib/value";

const SHIFT_MIN = -3;
const SHIFT_MAX = 3;
const YEARS_MIN = 1;
const YEARS_MAX = 30;
const YEARS = { min: YEARS_MIN, max: YEARS_MAX };

/**
 * The rate shift's slider, with the shift written beside its label ("+1 נקודת אחוז", the unit opening its term): the kit's `RangeField`
 * writes no sign in its box, has no unit word for percentage points, and its checks have none for a range of percentage points.
 */
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
  // a CPI-linked series (GOV-11): its principal and coupons move with the index, so the hold figures are before the linkage
  const linked = linkage?.value === "cpi";
  const [shift, setShift] = useState(1);
  const [yearsOverride, setYears] = useState<number | null>(null);
  // the bond's own years to redemption, starting from the guide's years held to the series' range
  const yearsStart = Math.min(YEARS_MAX, Math.max(YEARS_MIN, Math.round(inputs.years)));
  const years = Math.min(YEARS_MAX, Math.max(YEARS_MIN, yearsOverride ?? yearsStart));
  const model = useMemo(() => bondModel(data, { amount: inputs.amount, years, shiftPct: shift }), [data, inputs.amount, years, shift]);
  const amountIn = inputSite(bundle, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const shiftIn = typed(shift, "pct", today, copy.bond.shift);
  const yearsIn = typed(years, "years", today, copy.bond.years);
  // the price moves with the rate, the years and the coupon (F-25, bondPrice), not with the amount; a sale's value is the price on the amount
  const priceIn = { [copy.bond.shift]: shiftIn, [copy.bond.years]: yearsIn, [copy.common.inputNames.coupon]: cash, ...(every ? { [copy.common.inputNames.couponEvery]: every } : {}) };
  const base = { [copy.common.inputNames.amount]: amountIn, ...priceIn };
  const v = model
    ? {
        price: figure(model.price, "index_points", "F-25", priceIn, today, copy.bond.about.price),
        change: figure(model.changePct, "pct", "F-25", priceIn, today, copy.bond.about.change),
        sale: figure(model.saleValue, "nis", "F-25", base, today, copy.bond.about.sale),
        redeem: figure(model.redemption, "nis", "F-25", { [copy.common.inputNames.amount]: amountIn }, today, copy.bond.about.redeem),
        // the coupons held to redemption: the amount, times the coupon, times the years
        coupons: figure(model.coupons, "nis", "F-25", { [copy.common.inputNames.amount]: amountIn, [copy.common.inputNames.coupon]: cash, [copy.bond.years]: yearsIn }, today, copy.bond.about.coupons),
        // the same move on a makam of its series' term (F-24)
        makam: figure(model.makamChangePct, "pct", "F-24", { [copy.bond.shift]: shiftIn, [copy.common.inputNames.assumption]: cash, ...termOf(data.bundles["makam"]) }, today, copy.bond.about.makam),
      }
    : null;
  // what a sale today brings against holding to redemption: the gap between the two figures above
  const diff = v ? differenceOf([copy.bond.bars.sell, v.sale], [linked ? copy.bond.bars.holdLinked : copy.bond.bars.hold, v.redeem], "F-25", { today, about: copy.bond.about.diff, round: Math.abs }) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SigAmountField inputs={inputs} field="amount" label={copy.bond.amount} />
        <RangeField label={copy.bond.years} unit="years" value={years} start={yearsStart} isEntered={yearsOverride !== null} validate={yearsCheck(YEARS)} onCommit={setYears} onReset={() => setYears(null)} min={YEARS_MIN} max={YEARS_MAX} step={1} inputMode="numeric" disabled={!inputs.ready} />
      </div>
      <Range
        id={`${id}-s`}
        label={copy.bond.shift}
        valueText={
          <>
            <Num value={shiftIn} display={fmt.signedNumber(shift)} /> <Term id="נקודת אחוז">{Math.abs(shift) === 1 ? copy.bond.shiftUnitOne : copy.bond.shiftUnit}</Term>
          </>
        }
        min={SHIFT_MIN}
        max={SHIFT_MAX}
        step={0.5}
        value={shift}
        onChange={setShift}
      />

      {model && v && diff && (
        <>
          <StatRow cols={3}>
            <Stat label={copy.bond.figures.price} tone="value">
              <Num value={v.price} />
            </Stat>
            <Stat label={copy.bond.figures.change}>
              <Num value={v.change} display={(n) => fmt.signedPct(Math.round(n * 10) / 10)} />
            </Stat>
            <Stat label={copy.bond.figures.makam} tone="alt">
              <Num value={v.makam} display={(n) => fmt.signedPct(Math.round(n * 10) / 10)} />
            </Stat>
          </StatRow>
          <GainBars
            bars={[
              { key: "sale", label: copy.bond.bars.sell, value: v.sale, tone: "value" },
              { key: "hold", label: linked ? copy.bond.bars.holdLinked : copy.bond.bars.hold, value: v.redeem, tone: "alt" },
            ]}
            diff={diff}
            diffLabel={model.saleValue < model.redemption ? copy.bond.diffLoss : copy.bond.diffGain}
          />
          <Sentence size="sm" measure>
            {copy.bond.holdLine.before} <Num value={v.redeem} /> {copy.bond.holdLine.middle} <Num value={v.coupons} /> {copy.bond.holdLine.after[linked ? "cpi" : "unlinked"]}
          </Sentence>
        </>
      )}

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        <p className="text-muted-foreground">
          {copy.bond.note.before} <Term id="עמלה">{copy.bond.note.term}</Term> {copy.bond.note.after}
        </p>
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
