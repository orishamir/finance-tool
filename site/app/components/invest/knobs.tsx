// The indices page's plan controls (founder, 2026-10-28): the four plan numbers as plain sliders that write the current goal, as the
// assumptions panel does; and, at the bottom of the page, what each number changed by the same share does to the result (F-89, F-90).
import { useMemo, useState } from "react";
import { changedByShare, sweep } from "@finance-tool/engine";
import { invest as c, r2, values as valuesCopy } from "../../copy";
import type { FeeInputs } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { useGoals } from "../../lib/goal";
import { pairCosts, type InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { ChangeChart, KnobStrip, percentCheck, type Knob } from "../kit";

type Range = { min: number; max: number; step: number };
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

/** F-89 and F-90: every plan number changed by the same share, on one chart with a marker and a table, at the bottom of the page.
 * 4 lines of 21 runs, so it takes the plan once a slider rests. */
export function PlanChanges({ plan, share, bundle, view, pick }: { plan: WorkbenchInputs; share: { min: number; max: number; step: number; start: number }; bundle: WorkbenchBundle; view: InvestView | null; pick: Pair }) {
  const left = usePairLeft(bundle, view, pick);
  const [at, setAt] = useState(share.start);
  const ch = k.changes;
  const shares = useMemo(() => Array.from({ length: Math.round((share.max - share.min) / share.step) + 1 }, (_, i) => share.min + i * share.step), [share]);
  const run = useMemo(() => {
    if (!left) return null;
    const base = left(plan);
    if (!base) return null;
    const L = (p: WorkbenchInputs) => (left(p)?.value as number | undefined) ?? null;
    const lines = KNOBS.map(({ id, key, scale }) => {
      const tos = shares.map((sh) => changedByShare(plan[key] * scale, sh / 100, id === "years"));
      return { id, key, scale, tos, ys: sweep(L, plan, key, tos, scale) };
    });
    return { base, lines };
  }, [left, plan, shares]);
  if (!run) return null;

  const idx = Math.round((at - share.min) / share.step);
  const unitOf: Record<Id, "nis" | "nis_per_month" | "years" | "pct_per_year"> = { amount: "nis", monthly: "nis_per_month", years: "years", ret: "pct_per_year" };
  const planValue: Record<Id, SiteValue> = { amount: plan.values.amount, monthly: plan.values.monthly, years: plan.values.years, ret: plan.values.returnV };
  const show = (id: Id, n: number) => (id === "years" ? fmt.years(n) : id === "ret" ? fmt.pct(n) : fmt.nisWhole(n));
  const word = (sh: number) => `${Math.abs(sh)}% ${sh > 0 ? ch.more : ch.less}`;
  const rows = run.lines
    .map((l, n) => {
      const after = l.ys[idx] ?? null;
      const to = l.tos[idx]!;
      const inputs = { [labelOf[l.id]]: planValue[l.id] };
      return {
        l,
        n,
        to: computed(to, unitOf[l.id], "F-89", inputs, { today: bundle.today, about: ch.aboutTo }),
        after: after === null ? null : computed(Math.round(after), "nis", "F-90", inputs, { today: bundle.today, about: ch.aboutLeft }),
        diff: after === null ? null : computed(Math.round(after - (run.base.value as number)), "nis", "F-89", { ...inputs, [k.changes.planHead]: run.base }, { today: bundle.today, about: ch.aboutDiff }),
      };
    })
    .sort((a, b) => Math.abs((b.diff?.value as number) ?? 0) - Math.abs((a.diff?.value as number) ?? 0));
  const diffText = (d: SiteValue) => (
    <>
      <Num value={d} display={fmt.nisWhole(Math.abs(d.value as number))} /> {(d.value as number) >= 0 ? ch.more : ch.less}
    </>
  );
  const first = rows[0]!;
  const headline =
    at === 0 || !first.diff ? (
      <>
        {ch.planHead} <Num value={run.base} />
      </>
    ) : (
      <>
        {at > 0 ? ch.ifUp : ch.ifDown}
        <bdi>{Math.abs(at)}%</bdi>, {ch.most} {ch.nouns[first.l.id]}: {diffText(first.diff)} {ch.atEnd}
      </>
    );
  return (
    <section className="flex flex-col gap-3" aria-label={ch.title}>
      <h2 className="text-lg font-semibold">{ch.title}</h2>
      <p className="text-base font-medium">{headline}</p>
      <p className="text-sm text-muted-foreground max-w-measure">{ch.lead}</p>
      <ChangeChart
        lines={run.lines.map((l, n) => ({ id: l.id, label: labelOf[l.id], stroke: LINE[n]!.stroke, fill: LINE[n]!.fill, ys: l.ys }))}
        shares={shares}
        at={at}
        onAt={setAt}
        choices={CHOICES.filter((c) => c >= share.min && c <= share.max)}
        shareWord={word}
        planWord={ch.planWord}
        xTitle={ch.xTitle}
        yTitle={ch.yTitle}
        yFormat={(v) => fmt.number(Math.round(v))}
        choicesLabel={ch.choices}
        head={[...ch.cols]}
        phoneHide={[3]}
        rows={rows.map(({ l, n, to, after, diff }) => ({
          id: l.id,
          swatch: LINE[n]!.bg,
          cells: [labelOf[l.id], <Num key="p" value={planValue[l.id]} display={show(l.id, planValue[l.id].value as number)} />, <Num key="t" value={to} display={show(l.id, to.value as number)} />, after ? <Num key="a" value={after} /> : null, diff ? <span key="d" className="font-semibold md:whitespace-nowrap">{diffText(diff)}</span> : null],
        }))}
      />
      <p className="text-sm text-muted-foreground">{ch.foot}</p>
    </section>
  );
}

/** The four lines' colour roles, in the knobs' order (the fee-kind hues, validated as a set). */
const LINE = [
  { stroke: "stroke-chart-lever-3", fill: "fill-chart-lever-3", bg: "bg-chart-lever-3" },
  { stroke: "stroke-chart-lever-1", fill: "fill-chart-lever-1", bg: "bg-chart-lever-1" },
  { stroke: "stroke-chart-lever-2", fill: "fill-chart-lever-2", bg: "bg-chart-lever-2" },
  { stroke: "stroke-chart-lever-4", fill: "fill-chart-lever-4", bg: "bg-chart-lever-4" },
];
/** The shares a tap sets, in percent: inputs the person picks, not figures. */
const CHOICES = [-20, -10, 10, 20, 50];
