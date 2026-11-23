// The plan controls of the indices page: the four plan numbers and inflation as tiles, each opening its slider; they write the values the person entered on this device (lib/inputs.tsx, the guide pages' own), never the saved goal
// (only the goal page speaks of a goal). In a tab of the indices page, what each number changed by the same share does to the result
// (F-89, F-90).
import { useMemo } from "react";
import type { P05Input } from "@finance-tool/engine";
import { invest as c, values as valuesCopy } from "../../copy";
import { enteredPlan, type EnteredPlan } from "../../lib/entered-plan";
import { fmt } from "../../lib/format";
import { useInputs } from "../../lib/inputs";
import { type InvestView, type PlanInput } from "../../lib/invest";
import type { PlanChanges as PlanChangesRun } from "../../lib/invest-work";
import { usePlanChangesRun } from "../../lib/invest-run";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, differenceOf, type SiteValue } from "../../lib/value";
import { Num, ShortRow, shortRow } from "../provenance";
import { ChangeChart, KnobStrip, PanelHead, percentCheck, rangeScale, yearsCheck, type Knob } from "../kit";
import type { PlanBounds } from "../../lib/plan-bounds";

/** A slider's range as P-05 writes it: linear in `step`, or in `segments` for money (`rangeScale`). */
type Range = { min: number; max: number; step?: number; segments?: { to: number; step: number }[] };
type KnobRanges = Record<"amount_now" | "monthly_deposit" | "horizon_years" | "A-01" | "A-02", Range>;
type Id = "amount" | "monthly" | "years" | "ret";
type Pair = { house: string; fund: string } | null;
const k = c.plan.knobs;
/** The amount knob's box, and its tile, which the page's empty state opens when the plan puts in nothing. */
const PLAN_AMOUNT_FIELD = "plan-amount";
export const PLAN_AMOUNT_TILE = "plan-amount-tile";
/** Each number as its tile, and the change chart's lines and rows, name it. */
const labelOf: Record<Id, string> = { amount: k.amount, monthly: k.monthly, years: k.years, ret: k.ret };

const KEY: Record<Id, P05Input> = { amount: "amount_now", monthly: "monthly_deposit", years: "horizon_years", ret: "A-01" };
/** Each knob's plan input, as a run's sheet names it (`planInputs`). */
const PLAN_INPUT: Record<Id, PlanInput> = { amount: "amount", monthly: "monthly", years: "years", ret: "return" };

/** Writes one knob into the entered values, or clears it back to the site's example (null). */
function useSetKnob() {
  const { setEntered } = useInputs();
  return (id: Id, n: number | null) => setEntered(KEY[id], n);
}

/** The plan from the values entered as they are now: the knobs read it themselves, so a key or a slider's move shows in its own field in the
 * render that answers it, while the page's plan work follows in a deferred render (routes/invest.tsx). */
function useEnteredNow(bundle: Pick<IndicesBundle, "p05" | "today">, bounds: PlanBounds): EnteredPlan {
  const { state } = useInputs();
  return useMemo(() => enteredPlan(bundle, state, bounds), [bundle, state, bounds]);
}

const valueOf = (entered: EnteredPlan, id: Id) => {
  const v = entered.plan.values[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"];
  return { value: v.value as number, entered: v.state === "entered" };
};

/** The plan's tiles; each field refuses a number outside its bound (`bounds`, P-05's), the years past the horizon slider's end among them. */
export function PlanKnobs({ bundle, ranges, bounds }: { bundle: Pick<IndicesBundle, "p05" | "today">; ranges: KnobRanges; bounds: PlanBounds }) {
  const entered = useEnteredNow(bundle, bounds);
  const setKnob = useSetKnob();
  const { setEntered } = useInputs();
  const field = (id: Id) => {
    const v = valueOf(entered, id);
    return { id, label: labelOf[id], value: v.value, start: entered.starts[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"], isEntered: v.entered, onCommit: (n: number) => setKnob(id, n), onReset: () => setKnob(id, null) };
  };
  const negative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const knobs: Knob[] = [
    { ...field("amount"), unit: "nis", scale: rangeScale(ranges.amount_now), validate: negative, inputId: PLAN_AMOUNT_FIELD, tileId: PLAN_AMOUNT_TILE },
    { ...field("monthly"), unit: "nis_per_month", scale: rangeScale(ranges.monthly_deposit), validate: negative },
    { ...field("years"), unit: "years", unitInLabel: true, scale: rangeScale(ranges.horizon_years), inputMode: "numeric", validate: yearsCheck(bounds.horizon_years) },
    { ...field("ret"), unit: "pct_per_year", scale: rangeScale(ranges["A-01"]), validate: percentCheck(bounds["A-01"]) },
    // inflation moves the plan's figures in today's money (A-02, F-06), every line of the change chart among them, but is not one of the
    // four numbers that chart changes (F-89)
    { id: "inflation", label: k.inflation, value: entered.plan.values.inflation.value as number, start: entered.starts.inflation, isEntered: entered.plan.values.inflation.state === "entered", unit: "pct_per_year", scale: rangeScale(ranges["A-02"]), validate: percentCheck(bounds["A-02"]), onCommit: (n: number) => setEntered("A-02", n), onReset: () => setEntered("A-02", null) },
  ];
  return <KnobStrip knobs={knobs} layout="tiles" />;
}

type Share = { min: number; max: number; step: number; start: number };

/** F-89 and F-90 on the pair the page prices, every plan number changed by the same share, 4 lines of 21 runs: worked out in the page's worker
 * (lib/invest-run.ts) on the plan the page's view was, the last result shown until the next comes (`usePlanChangesRun`). Null where the
 * page prices no pair. Its tab's answer reads it whether or not its panel is open. */
export function usePlanChanges({ plan, share, bundle, view, pick }: { plan: WorkbenchInputs; share: Share; /** The page's data, as the worker holds it. */ bundle: IndicesBundle; view: InvestView | null; pick: Pair }) {
  const shares = useMemo(() => Array.from({ length: Math.round((share.max - share.min) / share.step) + 1 }, (_, i) => share.min + i * share.step), [share]);
  const index = view?.index;
  const house = pick?.house;
  const fund = pick?.fund;
  const asked = useMemo(() => (index && house && fund ? { bundle, ask: { index, plan, house, fund, shares } } : null), [bundle, index, plan, house, fund, shares]);
  return usePlanChangesRun(asked);
}

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
        // the value left after the change less the value left on the plan, as the two are written (`differenceOf`)
        diff: after === null || !afterValue ? null : differenceOf([ch.aboutLeft, afterValue], [k.changes.planHead, run.base], "F-89", { today, about: ch.aboutDiff }),
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
