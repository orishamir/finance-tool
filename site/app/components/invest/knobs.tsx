// The indices page's plan controls (founder, 2026-10-28): the four plan numbers as plain sliders that write the current goal, as the
// assumptions panel does; and, at the bottom of the page, the result across each number's range (F-90).
import { useMemo } from "react";
import { sweep } from "@finance-tool/engine";
import { invest as c, r2, values as valuesCopy } from "../../copy";
import type { FeeInputs } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { useGoals } from "../../lib/goal";
import { pairCosts, type InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { computed } from "../../lib/value";
import { Num } from "../provenance";
import { KnobStrip, percentCheck, ResultCurves, type Curve, type Knob } from "../kit";

type Range = { min: number; max: number; step: number; nudge: number };
export type KnobRanges = Record<"amount_now" | "monthly_deposit" | "horizon_years" | "A-01", Range>;
type Id = "amount" | "monthly" | "years" | "ret";
type Pair = { house: string; fund: string } | null;
/** Each knob: its plan field, its range, and how its slider reads the plan (a return is a fraction in the plan, percent on the slider). */
const KNOBS: { id: Id; key: "amountNow" | "monthly" | "years" | "grossReturn"; range: keyof KnobRanges; scale: number }[] = [
  { id: "amount", key: "amountNow", range: "amount_now", scale: 1 },
  { id: "monthly", key: "monthly", range: "monthly_deposit", scale: 1 },
  { id: "years", key: "years", range: "horizon_years", scale: 1 },
  { id: "ret", key: "grossReturn", range: "A-01", scale: 100 },
];
const k = c.plan.knobs;
const labelOf: Record<Id, string> = { amount: k.amount, monthly: k.monthly, years: k.years, ret: k.ret };

/** The value left for the pair the page prices, as a function of the plan (F-63's `L`); null when the page prices no pair. */
function usePairLeft(bundle: WorkbenchBundle, view: InvestView | null, pick: Pair) {
  const house = pick?.house;
  const fund = pick?.fund;
  return useMemo(() => {
    if (!view || !house || !fund) return null;
    return (p: WorkbenchInputs) => pairCosts({ bundle, index: view.index, plan: p, fundId: fund, providerId: house })?.left ?? null;
  }, [bundle, view, house, fund]);
}

/** Writes one knob into the current goal, or clears it back to the start value (null). */
function useSetKnob() {
  const { update, setEnteredReturn } = useGoals();
  return (id: Id, n: number | null) => {
    if (id === "ret") return setEnteredReturn(n);
    const field = id === "amount" ? "amountNow" : id === "monthly" ? "monthly" : "horizonYears";
    update((g) => ({ ...g, [field]: n === null ? { value: null, entered: false } : { value: n, entered: true } }));
  };
}

const valueOf = (fi: FeeInputs, id: Id) => {
  const v = fi.values[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"];
  return { value: v.value as number, entered: v.state === "entered" };
};

export function PlanKnobs({ fi, ranges, pct }: { fi: FeeInputs; ranges: KnobRanges; pct: { min: number; max: number } }) {
  const setKnob = useSetKnob();
  const span = (r: Range) => ({ min: r.min, max: r.max, step: r.step });
  const field = (id: Id) => {
    const v = valueOf(fi, id);
    return { id, label: labelOf[id], value: v.value, isEntered: v.entered, onCommit: (n: number) => setKnob(id, n), onReset: () => setKnob(id, null) };
  };
  const negative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const knobs: Knob[] = [
    { ...field("amount"), unit: "nis", ...span(ranges.amount_now), validate: negative },
    { ...field("monthly"), unit: "nis_per_month", ...span(ranges.monthly_deposit), validate: negative },
    { ...field("years"), unit: "years", ...span(ranges.horizon_years), inputMode: "numeric", validate: (n) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : null) },
    { ...field("ret"), unit: "pct_per_year", ...span(ranges["A-01"]), validate: percentCheck(pct) },
  ];
  return <KnobStrip knobs={knobs} />;
}

/** F-90: the result across each number's range, at the bottom of the page; 64 runs, so it takes the plan once a slider rests. */
export function PlanCurves({ plan, ranges, bundle, view, pick }: { plan: WorkbenchInputs; ranges: KnobRanges; bundle: WorkbenchBundle; view: InvestView | null; pick: Pair }) {
  const left = usePairLeft(bundle, view, pick);
  const curves = useMemo(() => {
    if (!left) return null;
    const base = left(plan);
    if (!base) return null;
    const L = (p: WorkbenchInputs) => (left(p)?.value as number | undefined) ?? null;
    return KNOBS.map(({ id, key, range, scale }): Curve => {
      const r = ranges[range];
      // 16 values from the low end to the high end, each on the slider's step (a run takes whole years)
      const xs = Array.from({ length: 16 }, (_, i) => Math.round((r.min + ((r.max - r.min) * i) / 15) / r.step) * r.step);
      const ys = sweep(L, plan, key, xs, scale);
      const hi = ys[ys.length - 1] ?? null;
      const show = (n: number) => (id === "years" ? fmt.years(n) : id === "ret" ? fmt.pct(n) : fmt.nisWhole(n));
      return {
        id,
        label: labelOf[id],
        now: <bdi>{show(plan[key] * scale)}</bdi>,
        ends: [<bdi key="lo">{show(r.min)}</bdi>, <bdi key="hi">{show(r.max)}</bdi>],
        ys,
        at: { frac: Math.max(0, Math.min(1, (plan[key] * scale - r.min) / (r.max - r.min))), y: base.value as number },
        top: hi === null ? null : <Num value={computed(Math.round(hi), "nis", "F-90", { [k.about]: base }, { today: bundle.today, about: k.curveAbout })} />,
      };
    });
  }, [left, plan, ranges, bundle.today]);
  if (!curves) return null;
  return (
    <section className="flex flex-col gap-3" aria-label={k.curvesTitle}>
      <h2 className="text-lg font-semibold">{k.curvesTitle}</h2>
      <ResultCurves curves={curves} lead={k.curvesLead} topWord={k.curveTop} />
    </section>
  );
}
