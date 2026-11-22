// The plan controls of the indices page: the four plan numbers as plain sliders, inflation behind a
// button; they write the values the person entered on this device (lib/inputs.tsx, the guide pages' own), never the saved goal
// (only the goal page speaks of a goal). In a tab of the indices page, what each number changed by the same share does to the result
// (F-89, F-90).
import { useMemo } from "react";
import { changedByShare, sweep } from "@finance-tool/engine";
import type { P05Input } from "@finance-tool/engine";
import { invest as c, r2, values as valuesCopy } from "../../copy";
import type { EnteredPlan } from "../../lib/entered-plan";
import { fmt } from "../../lib/format";
import { useInputs } from "../../lib/inputs";
import { useSettled } from "../../lib/settled";
import { pairCosts, pairLeft, type InvestView, type PlanInput } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, type SiteValue } from "../../lib/value";
import { Num, ShortRow, shortRow } from "../provenance";
import { ChangeChart, KnobStrip, NumberField, PanelHead, percentCheck, type Knob } from "../kit";

type Range = { min: number; max: number; step: number };
type KnobRanges = Record<"amount_now" | "monthly_deposit" | "horizon_years" | "A-01", Range>;
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
/** The amount knob's box, which the page's empty state focuses when the plan puts in nothing. */
export const PLAN_AMOUNT_FIELD = "plan-amount";
const labelOf: Record<Id, string> = { amount: k.amount, monthly: k.monthly, years: k.years, ret: k.ret };

/** The pair the page prices, with the value left as a function of the plan (F-63's `L`): the figure with its provenance for the plan itself, the number alone for each run of a sweep. Null when the page prices no pair. */
function usePairLeft(bundle: IndicesBundle, view: InvestView | null, pick: Pair) {
  const house = pick?.house;
  const fund = pick?.fund;
  const index = view?.index;
  return useMemo(() => {
    if (!index || !house || !fund) return null;
    return {
      value: (p: WorkbenchInputs) => pairCosts({ bundle, index, plan: p, fundId: fund, providerId: house })?.left ?? null,
      number: (p: WorkbenchInputs) => pairLeft({ bundle, index, plan: p, fundId: fund, providerId: house }),
    };
  }, [bundle, index, house, fund]);
}

const KEY: Record<Id, P05Input> = { amount: "amount_now", monthly: "monthly_deposit", years: "horizon_years", ret: "A-01" };
/** Each knob's plan input, as a run's sheet names it (`planInputs`). */
const PLAN_INPUT: Record<Id, PlanInput> = { amount: "amount", monthly: "monthly", years: "years", ret: "return" };

/** Writes one knob into the entered values, or clears it back to the site's example (null). */
function useSetKnob() {
  const { setEntered } = useInputs();
  return (id: Id, n: number | null) => setEntered(KEY[id], n);
}

const valueOf = (entered: EnteredPlan, id: Id) => {
  const v = entered.plan.values[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"];
  return { value: v.value as number, entered: v.state === "entered" };
};

export function PlanKnobs({ entered, ranges, pct, stacked }: { entered: EnteredPlan; ranges: KnobRanges; pct: { min: number; max: number }; /** One under the other (the index page's side card). */ stacked?: boolean }) {
  const setKnob = useSetKnob();
  const span = (r: Range) => ({ min: r.min, max: r.max, step: r.step });
  const field = (id: Id) => {
    const v = valueOf(entered, id);
    return { id, label: labelOf[id], value: v.value, start: entered.starts[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"], isEntered: v.entered, onCommit: (n: number) => setKnob(id, n), onReset: () => setKnob(id, null) };
  };
  const negative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const knobs: Knob[] = [
    { ...field("amount"), unit: "nis", ...span(ranges.amount_now), validate: negative, inputId: PLAN_AMOUNT_FIELD },
    { ...field("monthly"), unit: "nis_per_month", ...span(ranges.monthly_deposit), validate: negative },
    { ...field("years"), unit: "years", ...span(ranges.horizon_years), inputMode: "numeric", validate: (n) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : null) },
    { ...field("ret"), unit: "pct_per_year", ...span(ranges["A-01"]), validate: percentCheck(pct) },
  ];
  return <KnobStrip knobs={knobs} stacked={stacked} />;
}

type Share = { min: number; max: number; step: number; start: number };

/** F-89 and F-90: every plan number changed by the same share, 4 lines of 21 runs, the page's heaviest work: it waits until the plan has
 * rested. Null where the page prices no pair. Its tab's answer reads it whether or not its panel is open. */
export function usePlanChanges({ plan: resting, share, bundle, view, pick }: { plan: WorkbenchInputs; share: Share; bundle: IndicesBundle; view: InvestView | null; pick: Pair }) {
  const plan = useSettled(resting, 400);
  const left = usePairLeft(bundle, view, pick);
  const shares = useMemo(() => Array.from({ length: Math.round((share.max - share.min) / share.step) + 1 }, (_, i) => share.min + i * share.step), [share]);
  return useMemo(() => {
    if (!left) return null;
    const base = left.value(plan);
    if (!base) return null;
    const lines = KNOBS.map(({ id, key, scale }) => {
      const tos = shares.map((sh) => changedByShare(plan[key] * scale, sh / 100, id === "years"));
      return { id, key, scale, tos, ys: sweep(left.number, plan, key, tos, scale) };
    });
    return { plan, shares, base, lines };
  }, [left, plan, shares]);
}
export type PlanChangesRun = NonNullable<ReturnType<typeof usePlanChanges>>;

const unitOf: Record<Id, "nis" | "nis_per_month" | "years" | "pct_per_year"> = { amount: "nis", monthly: "nis_per_month", years: "years", ret: "pct_per_year" };
const planValueOf = (plan: WorkbenchInputs): Record<Id, SiteValue> => ({ amount: plan.values.amount, monthly: plan.values.monthly, years: plan.values.years, ret: plan.values.returnV });

/** Each number at one share: what it becomes, what is left after it and the difference from the plan, ranked by how much it changes what is left. */
export function changesAt(run: PlanChangesRun, at: number, share: Share, today: string) {
  const ch = k.changes;
  const idx = Math.round((at - share.min) / share.step);
  const planValue = planValueOf(run.plan);
  // what the plan's run reads (the value left on the plan carries it), the changed number in its place: a run after the change reads the same
  const baseInputs = (run.base.computed_from?.inputs ?? {}) as Record<string, SiteValue>;
  return run.lines
    .map((l, n) => {
      const after = l.ys[idx] ?? null;
      const to = computed(l.tos[idx]!, unitOf[l.id], "F-89", { [labelOf[l.id]]: planValue[l.id] }, { today, about: ch.aboutTo });
      const planName = c.planInputs[PLAN_INPUT[l.id]];
      const afterInputs = Object.fromEntries(Object.entries(baseInputs).map(([name, v]) => [name, name === planName ? to : v]));
      const afterValue = after === null ? null : computed(Math.round(after), "nis", "F-90", afterInputs, { today, about: ch.aboutLeft });
      return {
        l,
        n,
        to,
        after: afterValue,
        // the value left after the change less the value left on the plan; taken before the rounding, as the row always was
        diff: after === null || !afterValue ? null : computed(Math.round(after - (run.base.value as number)), "nis", "F-89", { [ch.aboutLeft]: afterValue, [k.changes.planHead]: run.base }, { today, about: ch.aboutDiff }),
      };
    })
    .sort((a, b) => Math.abs((b.diff?.value as number) ?? 0) - Math.abs((a.diff?.value as number) ?? 0));
}

/** "20% יותר", "10% פחות": a share in words. */
export const shareWord = (sh: number) => `${Math.abs(sh)}% ${sh > 0 ? k.changes.more : k.changes.less}`;

/** The panel: the headline at the share shown, the chart of the four lines and the numbers ranked beside it. */
export function PlanChanges({ run, at, onAt, share, today }: { run: PlanChangesRun; at: number; onAt: (at: number) => void; share: Share; today: string }) {
  const ch = k.changes;
  const planValue = planValueOf(run.plan);
  const show = (id: Id, n: number) => (id === "years" ? fmt.years(n) : id === "ret" ? fmt.pct(n) : fmt.nisWhole(n));
  const rows = changesAt(run, at, share, today);
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
    <div className="flex flex-col gap-3">
      <PanelHead kicker={ch.title}>{headline}</PanelHead>
      <p className="text-sm text-muted-foreground max-w-measure">{ch.lead}</p>
      <ChangeChart
        lines={run.lines.map((l, n) => ({ id: l.id, label: labelOf[l.id], stroke: LINE[n]!.stroke, fill: LINE[n]!.fill, ys: l.ys }))}
        shares={run.shares}
        at={at}
        onAt={onAt}
        choices={CHOICES.filter((c) => c >= share.min && c <= share.max)}
        shareWord={shareWord}
        planWord={ch.planWord}
        xTitle={ch.xTitle}
        yTitle={ch.yTitle}
        yFormat={(v) => fmt.number(Math.round(v))}
        choicesLabel={ch.choices}
        head={{ number: `${ch.cols[0]} · ${ch.cols[1]} ← ${ch.cols[2]}`, diff: ch.cols[4], left: ch.cols[3] }}
        rowsLabel={ch.title}
        rows={rows.map(({ l, n, to, after, diff }) => {
          // a row with a figure of a billion or more writes its other shekel figures in the same short form
          const short = shortRow(...(l.id === "amount" || l.id === "monthly" ? [planValue[l.id].value as number, to.value as number] : []), diff?.value as number);
          return {
            id: l.id,
            swatch: LINE[n]!.bg,
            name: labelOf[l.id],
            from: <ShortRow when={short}><Num value={planValue[l.id]} display={show(l.id, planValue[l.id].value as number)} /></ShortRow>,
            to: <ShortRow when={short}><Num value={to} display={show(l.id, to.value as number)} /></ShortRow>,
            diff: diff ? <ShortRow when={short}>{diffText(diff)}</ShortRow> : null,
            size: diff ? Math.abs(diff.value as number) : 0,
            left: after ? <ShortRow when={short}><Num value={after} /></ShortRow> : null,
          };
        })}
      />
      <p className="text-sm text-muted-foreground">{ch.foot}</p>
    </div>
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

/** What the button beside the sliders opens: inflation, written to the same entered values. */
export function OtherAssumptions({ inflation, inflationStart, pct }: { inflation: SiteValue; /** The inflation field's start value (P-05): its reset says "חזרה ל־2.5%". */ inflationStart?: number; pct: { min: number; max: number } }) {
  const { state, ready, setEntered } = useInputs();
  return (
    <div className="flex flex-col gap-4 lg:gap-[18px]">
      {/* the hint is the field's own, under its box */}
      <NumberField label={valuesCopy.fields["A-02"]} unit="pct_per_year" value={inflation.value as number} start={inflationStart} isEntered={state.entered["A-02"] !== undefined} validate={percentCheck(pct)} onCommit={(n) => setEntered("A-02", n)} onReset={() => setEntered("A-02", null)} hint={valuesCopy.hints.inflation} disabled={!ready} />
    </div>
  );
}
