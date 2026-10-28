// The indices page's knob strip (founder, 2026-10-28): the plan's four numbers as sliders that write the current goal, as the
// assumptions panel does, each with what one more step does to the value left for the priced pair (F-89).
import { useMemo, type ReactNode } from "react";
import { stepEffect } from "@finance-tool/engine";
import { invest as c, r2, values as valuesCopy } from "../../copy";
import type { FeeInputs } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { useGoals } from "../../lib/goal";
import { pairCosts, type InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { KnobStrip, percentCheck, type Knob, type KnobEffect } from "../kit";

type Range = { min: number; max: number; step: number; nudge: number };
export type KnobRanges = Record<"amount_now" | "monthly_deposit" | "horizon_years" | "A-01", Range>;
type Key = "amountNow" | "monthly" | "years" | "grossReturn";

export function PlanKnobs({ fi, plan, ranges, bundle, view, pick, pct }: { fi: FeeInputs; plan: WorkbenchInputs; ranges: KnobRanges; bundle: WorkbenchBundle; view: InvestView | null; pick: { house: string; fund: string } | null; pct: { min: number; max: number } }) {
  const { update, setEnteredReturn } = useGoals();
  const v = fi.values;
  const set = (k: "amountNow" | "monthly" | "horizonYears") => (n: number | null) => update((g) => ({ ...g, [k]: n === null ? { value: null, entered: false } : { value: n, entered: true } }));

  // F-89: the value left with one knob a step higher, against the value left now, for the pair the page prices
  // the page hands a new pick object on every render: the runs are keyed on the pair's ids
  const pair = useMemo(() => (pick ? { house: pick.house, fund: pick.fund } : null), [pick?.house, pick?.fund]); // eslint-disable-line react-hooks/exhaustive-deps
  const effects = useMemo(() => {
    if (!view || !pair) return null;
    const run = (p: WorkbenchInputs) => pairCosts({ bundle, index: view.index, plan: p, fundId: pair.fund, providerId: pair.house })?.left ?? null;
    const base = run(plan);
    if (!base) return null;
    // the plan as it is was priced just above: each step prices only the changed plan
    const left = (p: WorkbenchInputs) => (p === plan ? (base.value as number) : ((run(p)?.value as number | undefined) ?? null));
    const one = (key: Key, r: Range, scale = 1): SiteValue | null => {
      const d = stepEffect(left, plan, key, r.nudge, r.max, scale);
      return d === null ? null : computed(Math.round(d), "nis", "F-89", { [c.plan.knobs.about]: base }, { today: bundle.today, about: c.plan.knobs.about });
    };
    return {
      amount: one("amountNow", ranges.amount_now),
      monthly: one("monthly", ranges.monthly_deposit),
      years: one("years", ranges.horizon_years),
      ret: one("grossReturn", ranges["A-01"], 100),
    };
  }, [bundle, view, pair, plan, ranges]);

  const k = c.plan.knobs;
  const effect = (d: SiteValue | null | undefined, step: ReactNode): KnobEffect | null =>
    d
      ? {
          step,
          delta: (
            <>
              <Num value={d} display={`${(d.value as number) >= 0 ? "+" : ""}${fmt.nisWhole(d.value as number)}`} /> {k.atEnd}
            </>
          ),
          size: d.value as number,
        }
      : null;
  const nis = (n: number) => <bdi>{fmt.nisWhole(n)}</bdi>;
  const span = (r: Range) => ({ min: r.min, max: r.max, step: r.step });

  const knobs: Knob[] = [
    {
      id: "amount",
      label: k.amount,
      unit: "nis",
      value: v.amount.value as number,
      isEntered: v.amount.state === "entered",
      ...span(ranges.amount_now),
      validate: (n) => (n < 0 ? valuesCopy.errors.negative : null),
      onCommit: set("amountNow"),
      onReset: () => set("amountNow")(null),
      effect: effect(effects?.amount, <>{k.more} {nis(ranges.amount_now.nudge)} {k.today}:</>),
    },
    {
      id: "monthly",
      label: k.monthly,
      unit: "nis_per_month",
      value: v.monthly.value as number,
      isEntered: v.monthly.state === "entered",
      ...span(ranges.monthly_deposit),
      validate: (n) => (n < 0 ? valuesCopy.errors.negative : null),
      onCommit: set("monthly"),
      onReset: () => set("monthly")(null),
      effect: effect(effects?.monthly, <>{k.more} {nis(ranges.monthly_deposit.nudge)} {k.perMonth}:</>),
    },
    {
      id: "years",
      label: k.years,
      unit: "years",
      value: v.years.value as number,
      isEntered: v.years.state === "entered",
      ...span(ranges.horizon_years),
      inputMode: "numeric",
      validate: (n) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : null),
      onCommit: set("horizonYears"),
      onReset: () => set("horizonYears")(null),
      effect: effect(effects?.years, k.oneYear),
    },
    {
      id: "ret",
      label: k.ret,
      unit: "pct_per_year",
      value: v.returnV.value as number,
      isEntered: v.returnV.state === "entered",
      ...span(ranges["A-01"]),
      validate: percentCheck(pct),
      onCommit: setEnteredReturn,
      onReset: () => setEnteredReturn(null),
      effect: effect(effects?.ret, <>{k.more} <bdi>{fmt.pct(ranges["A-01"].nudge)}</bdi> {k.retStep}</>),
    },
  ];
  return <KnobStrip knobs={knobs} lead={k.lead} most={k.most} />;
}
