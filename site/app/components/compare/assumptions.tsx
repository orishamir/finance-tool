// The comparison's assumptions (design-system 6.2, flow 16): the chips under the chart and the panel of fields
// (a sheet on a phone, a panel beside the chart on PC). A sensitivity row opens it with a suggestion the person must adopt.
import { buttons, r2, r5, values as valuesCopy } from "../../copy";
import { AcceptedFallField } from "../exposure-mode/fields";
import { fmt } from "../../lib/format";
import { useGoals, type FieldKey } from "../../lib/goal";
import type { RunGoal } from "../../lib/compare";
import { Button, ParameterLine, PlanChips, type PlanChipItem } from "../kit";
import { availableTooBig, InsuranceField, type FormData } from "./goal-form";
import { GoalNumber, GoalSlider, SwitchRow } from "./fields";

export interface Suggestion {
  field: FieldKey;
  value: number;
}

const between = (r: { min: number; max: number }, msg: readonly [string, string]) => (n: number) => (n < r.min || n > r.max ? `${msg[0]} ${fmt.number(r.min)} ${msg[1]}${fmt.number(r.max)}.` : null);

/** The chips under the chart: years, amounts, return, inflation; entered ones in blue, an empty return says so. */
export function AssumptionChips({ g, sources, onOpen, exposure }: { g: RunGoal; sources: { horizon: boolean; amountNow: boolean; monthly: boolean; available: boolean; inflation: boolean }; onOpen: (f: FieldKey | "all") => void; exposure?: { acceptedFall: number | null } }) {
  // a horizon the preset gave ("לא יודעים" on the home page, D7) wears the site-parameter tag
  const chips: PlanChipItem[] = [
    { field: "horizonYears", label: r2.result.chips.years, text: fmt.years(g.horizonYears), entered: sources.horizon, parameter: g.fromPreset.horizon && !sources.horizon },
    { field: "amountNow", label: r2.result.chips.amountNow, text: fmt.nisWhole(g.amountNow), entered: sources.amountNow },
    { field: "monthly", label: r2.result.chips.monthly, text: fmt.nisWhole(g.monthly), entered: sources.monthly },
    { field: "available", label: r2.result.chips.available, text: fmt.nisWhole(g.available), entered: sources.available },
    // exposure mode (release 5): each exposure has its own return, so the goal's single return gives way to the accepted fall
    exposure
      ? { field: "acceptedFall", label: r5.exposure.chips.acceptedFall, text: exposure.acceptedFall === null ? r2.result.chipEmpty : fmt.pct(exposure.acceptedFall), entered: exposure.acceptedFall !== null }
      : { field: "return", label: r2.result.chips.return, text: g.returnPct === null ? r2.result.chipEmpty : fmt.pct(g.returnPct), entered: g.returnPct !== null },
    { field: "inflation", label: r2.result.chips.inflation, text: g.inflationPct === null ? "" : fmt.pct(g.inflationPct), entered: g.inflationPct !== null },
  ];
  return <PlanChips items={chips} allLabel={r2.result.chips.all} onOpen={onOpen} />;
}

function Suggest({ s, field, onAdopt, children }: { s: Suggestion | null; field: FieldKey; onAdopt: (v: number) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {children}
      {s && s.field === field && (
        <p className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
          <span>{r2.result.suggestion}:</span>
          <bdi dir="ltr" className="font-medium">
            {field === "horizonYears" ? fmt.years(s.value) : fmt.pct(s.value)}
          </bdi>
          <Button variant="secondary" className="!h-9 px-3 text-sm" onClick={() => onAdopt(s.value)}>
            {r2.result.adopt}
          </Button>
        </p>
      )}
    </div>
  );
}

/** The fields of flow 16: horizon, amount now, monthly, what must stay available, return, inflation, withdrawable at any time. */
/**
 * `leaveOut`: fields a page's runs never read, so they would change nothing there (the indices page: every option can be sold any
 * trading day, and no pension run takes the insurance share; founder, 2026-10-28).
 */
export function AssumptionsPanel({ data, suggestion, onAdopted, exposure, leaveOut = [] }: { data: FormData; suggestion: Suggestion | null; onAdopted: () => void; exposure?: boolean; leaveOut?: ("anytime" | "insurance")[] }) {
  const { current, resolved, update, setEnteredReturn, setInflation } = useGoals();
  if (!current || !resolved) return null;
  const set = (k: "horizonYears" | "amountNow" | "monthly" | "available") => (n: number | null) => update((g) => ({ ...g, [k]: n === null ? { value: null, entered: false } : { value: n, entered: true } }));
  const src = resolved.source;
  const pct = between(data.pct, valuesCopy.errors.pct);
  const adopt = (field: FieldKey) => (v: number) => {
    if (field === "return") setEnteredReturn(v);
    else if (field === "inflation") setInflation(v);
    else if (field === "horizonYears") set("horizonYears")(v);
    onAdopted();
  };
  return (
    <div className="flex flex-col gap-4 lg:gap-[18px]">
      <ParameterLine />
      <Suggest s={suggestion} field="horizonYears" onAdopt={adopt("horizonYears")}>
        <GoalSlider label={r2.form.years} unit="years" value={resolved.horizonYears} source={src.horizonYears} presetValue={resolved.preset.horizon} onChange={set("horizonYears")} validate={(n) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : null)} min={data.horizon.min} max={data.horizon.max} step={data.horizon.step} inputMode="numeric" />
      </Suggest>
      <GoalNumber label={r2.form.amountNow} unit="nis" value={resolved.amountNow} source={src.amountNow} onChange={set("amountNow")} validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)} />
      <GoalSlider label={r2.form.monthly} unit="nis_per_month" value={resolved.monthly} source={src.monthly} presetValue={resolved.preset.monthly} onChange={set("monthly")} validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)} min={data.monthly.min} max={data.monthly.max} step={data.monthly.step} />
      <GoalNumber label={r2.form.available} unit="nis" value={resolved.available} source={src.available} presetValue={resolved.available} onChange={set("available")} externalError={availableTooBig(resolved)} validate={(n) => (n < 0 ? valuesCopy.errors.negative : resolved.amountNow !== null && n > resolved.amountNow ? r2.form.errAvailable : null)} />
      <div className="grid grid-cols-2 gap-3">
        {exposure ? (
          <div className="col-span-2">
            <AcceptedFallField />
          </div>
        ) : (
          <Suggest s={suggestion} field="return" onAdopt={adopt("return")}>
            <GoalNumber label={r2.result.chips.return} unit="pct_per_year" value={current.assumptions.return} source={current.assumptions.return === null ? "empty" : "entered"} onChange={setEnteredReturn} validate={pct} bare />
          </Suggest>
        )}
        <Suggest s={suggestion} field="inflation" onAdopt={adopt("inflation")}>
          <GoalNumber label={r2.result.chips.inflation} unit="pct_per_year" value={current.assumptions.inflation ?? data.inflationStart} source={current.assumptions.inflation === null ? "preset" : "entered"} presetValue={data.inflationStart} onChange={setInflation} validate={pct} bare={current.assumptions.inflation === null} />
        </Suggest>
      </div>
      {!leaveOut.includes("insurance") && <InsuranceField data={data} />}
      {!exposure && <p className="text-xs text-muted-foreground -mt-2">{current.assumptions.return === null ? `${r2.form.returnEmpty} ${r2.form.returnHint}` : r2.form.returnFilled}</p>}
      {!leaveOut.includes("anytime") && <SwitchRow label={r2.form.anytime} checked={resolved.anytime} source={src.anytime} onChange={(v) => update((g) => ({ ...g, anytime: { value: v, entered: true } }))} onReset={() => update((g) => ({ ...g, anytime: { value: false, entered: false } }))} />}
    </div>
  );
}

export { buttons };
