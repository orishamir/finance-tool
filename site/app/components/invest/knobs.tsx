// The plan controls of the indices and fee pages: the four plan numbers as plain sliders, the rest behind a
// button; they write the values the person entered on this device (lib/inputs.tsx, the guide pages' own), never the saved goal
// (only the goal page speaks of a goal). At the bottom of the indices page, what each number changed by the
// same share does to the result (F-89, F-90).
import { useMemo, useState } from "react";
import { changedByShare, sweep } from "@finance-tool/engine";
import type { P05Input } from "@finance-tool/engine";
import { invest as c, r2, values as valuesCopy } from "../../copy";
import type { FeeInputs, FieldNeed } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { pctBoundsFor } from "../../lib/goal";
import { useInputs, type Employment } from "../../lib/inputs";
import { useSettled } from "../../lib/settled";
import { pairCosts, pairLeft, type InvestView, type PlanInput } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, type SiteValue } from "../../lib/value";
import { Num, ShortRow, shortRow } from "../provenance";
import { ChangeChart, KnobStrip, NumberField, SegmentedControl, percentCheck, type Knob } from "../kit";

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

const valueOf = (fi: FeeInputs, id: Id) => {
  const v = fi.values[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"];
  return { value: v.value as number, entered: v.state === "entered" };
};

export function PlanKnobs({ fi, ranges, pct }: { fi: FeeInputs; ranges: KnobRanges; pct: { min: number; max: number } }) {
  const setKnob = useSetKnob();
  const span = (r: Range) => ({ min: r.min, max: r.max, step: r.step });
  const field = (id: Id) => {
    const v = valueOf(fi, id);
    return { id, label: labelOf[id], value: v.value, start: fi.starts?.[id === "amount" ? "amount" : id === "monthly" ? "monthly" : id === "years" ? "years" : "returnV"], isEntered: v.entered, onCommit: (n: number) => setKnob(id, n), onReset: () => setKnob(id, null) };
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
 * 4 lines of 21 runs, the page's heaviest work, so it waits for the charts above to finish moving. */
export function PlanChanges({ plan: resting, share, bundle, view, pick }: { plan: WorkbenchInputs; share: { min: number; max: number; step: number; start: number }; bundle: IndicesBundle; view: InvestView | null; pick: Pair }) {
  const plan = useSettled(resting, 400);
  const left = usePairLeft(bundle, view, pick);
  const [at, setAt] = useState(share.start);
  const ch = k.changes;
  const shares = useMemo(() => Array.from({ length: Math.round((share.max - share.min) / share.step) + 1 }, (_, i) => share.min + i * share.step), [share]);
  const run = useMemo(() => {
    if (!left) return null;
    const base = left.value(plan);
    if (!base) return null;
    const lines = KNOBS.map(({ id, key, scale }) => {
      const tos = shares.map((sh) => changedByShare(plan[key] * scale, sh / 100, id === "years"));
      return { id, key, scale, tos, ys: sweep(left.number, plan, key, tos, scale) };
    });
    return { base, lines };
  }, [left, plan, shares]);
  if (!run) return null;

  const idx = Math.round((at - share.min) / share.step);
  const unitOf: Record<Id, "nis" | "nis_per_month" | "years" | "pct_per_year"> = { amount: "nis", monthly: "nis_per_month", years: "years", ret: "pct_per_year" };
  const planValue: Record<Id, SiteValue> = { amount: plan.values.amount, monthly: plan.values.monthly, years: plan.values.years, ret: plan.values.returnV };
  const show = (id: Id, n: number) => (id === "years" ? fmt.years(n) : id === "ret" ? fmt.pct(n) : fmt.nisWhole(n));
  const word = (sh: number) => `${Math.abs(sh)}% ${sh > 0 ? ch.more : ch.less}`;
  // what the plan's run reads (the value left on the plan carries it), the changed number in its place: a run after the change reads the same
  const baseInputs = (run.base.computed_from?.inputs ?? {}) as Record<string, SiteValue>;
  const rows = run.lines
    .map((l, n) => {
      const after = l.ys[idx] ?? null;
      const to = computed(l.tos[idx]!, unitOf[l.id], "F-89", { [labelOf[l.id]]: planValue[l.id] }, { today: bundle.today, about: ch.aboutTo });
      const planName = c.planInputs[PLAN_INPUT[l.id]];
      const afterInputs = Object.fromEntries(Object.entries(baseInputs).map(([name, v]) => [name, name === planName ? to : v]));
      const afterValue = after === null ? null : computed(Math.round(after), "nis", "F-90", afterInputs, { today: bundle.today, about: ch.aboutLeft });
      return {
        l,
        n,
        to,
        after: afterValue,
        // the value left after the change less the value left on the plan; taken before the rounding, as the row always was
        diff: after === null || !afterValue ? null : computed(Math.round(after - (run.base.value as number)), "nis", "F-89", { [ch.aboutLeft]: afterValue, [k.changes.planHead]: run.base }, { today: bundle.today, about: ch.aboutDiff }),
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
        // on a phone the plan's number and the changed one share a column, one under the other: four figures side by side left each 63 px,
        // and a typed plan's "50,000,000 ₪" ran over its neighbours
        widths={[
          { pc: "24%", phone: "27%" },
          { pc: "18%", phone: "37%" },
          { pc: "18%", phone: "0" },
          { pc: "20%", phone: "0" },
          { pc: "20%", phone: "36%" },
        ]}
        stackOnPhone={[1, 2]}
        rows={rows.map(({ l, n, to, after, diff }) => {
          // a row with a figure of a billion or more writes its other shekel figures in the same short form; only the figures a phone shows
          // count (what is left is not in a phone's table), or a typed "50,000,000 ₪" read "0.05 מיליארד ₪" beside it
          const short = shortRow(...(l.id === "amount" || l.id === "monthly" ? [planValue[l.id].value as number, to.value as number] : []), diff?.value as number);
          const cells = [labelOf[l.id], <Num key="p" value={planValue[l.id]} display={show(l.id, planValue[l.id].value as number)} />, <Num key="t" value={to} display={show(l.id, to.value as number)} />, after ? <Num key="a" value={after} /> : null, diff ? (
              // on a phone the word goes under the figure, on every row, so the column holds a nine-digit figure at the sliders' far ends with the
              // largest share ("7,369,509 ₪ יותר" was cut at 390 px)
              <span key="d" className="font-semibold">
                <Num value={diff} display={fmt.nisWhole(Math.abs(diff.value as number))} /> <span className="whitespace-nowrap max-md:block">{(diff.value as number) >= 0 ? ch.more : ch.less}</span>
              </span>
            ) : null];
          return { id: l.id, swatch: LINE[n]!.bg, cells: cells.map((cell, i) => <ShortRow key={i} when={short}>{cell}</ShortRow>) };
        })}
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

/**
 * What the button beside the sliders opens: inflation, and where the page's product needs them, employment and age; written to the
 * same entered values. The page leaves out what it never reads (every control earns its place).
 */
export function OtherAssumptions({ inflation, inflationStart, pct, employment, age, need, insurance }: { inflation: SiteValue; /** The inflation field's start value (P-05): its reset says "חזרה ל־2.5%". */ inflationStart?: number; pct: { min: number; max: number }; employment?: boolean; age?: { min: number; max: number }; need?: { age?: FieldNeed; employment?: FieldNeed }; insurance?: FieldNeed }) {
  const { state, ready, setEntered, setAge, setEmployment, setInsurance } = useInputs();
  const ageCheck = (r: { min: number; max: number }) => (n: number) => (!Number.isInteger(n) ? valuesCopy.errors.nan : n < r.min || n > r.max ? `${valuesCopy.errors.age[0]} ${fmt.number(r.min)} ${valuesCopy.errors.age[1]}${fmt.number(r.max)}.` : null);
  // a field the run cannot go without says "required" and why; the others stay "not required"
  // on a page whose run reads them (the fee page), an optional field says it changes the result, not what it marks on a graph
  const mark = (required: boolean | undefined) => <span className="text-muted-foreground font-normal">{required ? valuesCopy.required : valuesCopy.optional}</span>;
  const h = valuesCopy.hints;
  return (
    <div className="flex flex-col gap-4 lg:gap-[18px]">
      {/* the hint is the field's own, under its box */}
      <NumberField label={valuesCopy.fields["A-02"]} unit="pct_per_year" value={inflation.value as number} start={inflationStart} isEntered={state.entered["A-02"] !== undefined} validate={percentCheck(pct)} onCommit={(n) => setEntered("A-02", n)} onReset={() => setEntered("A-02", null)} hint={valuesCopy.hints.inflation} disabled={!ready} />
      {employment && (
        <div className="field">
          <span className="field-label" id="plan-emp-label">
            {valuesCopy.fields.employment} {mark(need?.employment === "required")}
          </span>
          <SegmentedControl<Employment> labelledBy="plan-emp-label" options={[{ value: "employee", label: valuesCopy.employment.employee }, { value: "self-employed", label: valuesCopy.employment["self-employed"] }]} value={state.employment} onChange={(v) => setEmployment(state.employment === v ? null : v)} />
          <span className="text-xs text-muted-foreground">{need?.employment === "required" ? h.employmentNeeded : need?.employment === "optional" ? h.employmentChanges : h.employment}</span>
        </div>
      )}
      {age && <NumberField label={<>{valuesCopy.fields.age} {mark(need?.age === "required")}</>} unit="years" value={state.age} isEntered={state.age !== null} validate={ageCheck(age)} onCommit={(n) => setAge(n)} onReset={() => setAge(null)} hint={need?.age === "required" ? h.ageNeeded : need?.age === "optional" ? h.ageChanges : h.age} placeholder={valuesCopy.agePlaceholder} inputMode="numeric" optional disabled={!ready} />}
      {/* A-17 has no default (G-12): the field starts empty, and an empty field is "not entered" */}
      {insurance && <NumberField label={<>{r2.form.insurance} {mark(insurance === "required")}</>} unit="pct" value={state.insurance ?? null} isEntered={typeof state.insurance === "number"} validate={percentCheck(pctBoundsFor("insurance", pct))} onCommit={(n) => setInsurance(n)} onReset={() => setInsurance(null)} hint={insurance === "required" ? h.insurance : h.insuranceOptional} optional disabled={!ready} />}
    </div>
  );
}
