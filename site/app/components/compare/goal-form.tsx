// The goal form's cards (design-spec 6.3, 7): the goal, the person and the assumptions, the payslip
// disclosure, the goals list and the footer. Everything typed goes straight into the saved goal.
import { useState } from "react";
import { r2, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { filledFields, type FieldSource, type Goal, type Presets } from "../../lib/goal";
import { useGoals } from "../../lib/goal";
import { IconCheck } from "../icons";
import { flushPendingFields } from "../timeline/fields";
import { RuleRef } from "../provenance";
import { Button, Callout, Card, Disclosure, LinkButton, SegmentedControl, cx } from "../ui";
import { AgeStepper, GoalNumber, GoalSlider, MonthField, NameField, PercentPair, PresetChips, SwitchRow } from "./fields";
import { IconDown, IconPlus, IconUp } from "./icons";
import { presetIds } from "../../lib/goal";
import { AcceptedFallField } from "../exposure-mode/fields";
import { r5 } from "../../copy";

export interface Range {
  min: number;
  max: number;
  step: number;
}

/** What the form reads from the site's parameters (P-05 and P-07) and the rule base. */
export interface FormData {
  horizon: Range;
  monthly: Range;
  age: { min: number; max: number };
  pct: { min: number; max: number };
  /** P-05's inflation, the value the field starts from. */
  inflationStart: number;
  /** "YYYY-MM" of the build date, the month picker's lower bound. */
  minMonth: string;
  /** PEN-36's text, when the rule base holds it. */
  payslipText: string | null;
}

/** The kept-available amount above the amount now: an error on the available field, whichever of the two was edited last. */
export const availableTooBig = (r: { amountNow: number | null; available: number | null }) => (r.amountNow !== null && r.available !== null && r.available > r.amountNow ? r2.form.errAvailable : null);

const nonNegative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
const between = (r: { min: number; max: number }, msg: readonly [string, string]) => (n: number) => (n < r.min || n > r.max ? `${msg[0]} ${fmt.number(r.min)} ${msg[1]}${fmt.number(r.max)}.` : null);

// ---------------------------------------------------------------- presets and goals list

export function PresetRow({ data, presets }: { data: FormData; presets: Presets }) {
  void data;
  const { current, setPreset } = useGoals();
  const [kept, setKept] = useState(false);
  if (!current) return null;
  const record = current.preset === "none" ? undefined : presets[current.preset];
  const fields = filledFields(record);
  const names = fields.map((f) => r2.form.filledNames[f]!);
  return (
    <div className="flex flex-col gap-2">
      <PresetChips
        ids={presetIds}
        value={current.preset}
        onChange={(p) => {
          flushPendingFields();
          const r = setPreset(p);
          setKept(r.kept);
        }}
      />
      {current.preset !== "none" && names.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {r2.form.filledBefore}
          {names.join(", ")}
          {r2.form.filledAfter} {kept && r2.form.keptEntered}
        </p>
      )}
    </div>
  );
}

export function GoalsList() {
  const { goals, current, select, move, add } = useGoals();
  if (goals.length < 2) return null;
  return (
    <section aria-labelledby="goals-h" className="flex flex-col gap-3">
      <h2 id="goals-h" className="text-lg font-semibold">
        {r2.form.goalsHeading}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {goals.map((g, i) => (
          <li key={g.id} className="inline-flex items-center rounded-full border border-border bg-card">
            <Button variant="icon" className="size-9" aria-label={r2.form.moveUp} disabled={i === 0} onClick={() => move(g.id, -1)}>
              <IconUp size={16} />
            </Button>
            <button type="button" aria-current={g.id === current?.id} onClick={() => select(g.id)} className={cx("sec-chip", g.id === current?.id && "sec-chip-on")}>
              <bdi>{goalTitle(g)}</bdi>
            </button>
            <Button variant="icon" className="size-9" aria-label={r2.form.moveDown} disabled={i === goals.length - 1} onClick={() => move(g.id, 1)}>
              <IconDown size={16} />
            </Button>
          </li>
        ))}
        <li>
          <Button variant="quiet" onClick={add}>
            <IconPlus size={16} /> {r2.form.addGoal}
          </Button>
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">{r2.form.goalsLine}</p>
    </section>
  );
}

export function goalTitle(g: Goal): string {
  return g.name.trim() || (g.preset !== "none" ? r2.presets[g.preset]! : r2.form.unnamed);
}

// ---------------------------------------------------------------- card 1: the goal

export function GoalFields({ data }: { data: FormData }) {
  const { current, resolved, update } = useGoals();
  if (!current || !resolved) return null;
  const set = (k: "horizonYears" | "amountNow" | "monthly" | "available") => (n: number | null) => update((g) => ({ ...g, [k]: n === null ? { value: null, entered: false } : { value: n, entered: true } }));
  const src = resolved.source;
  const horizonCheck = (n: number) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : n > data.horizon.max ? `${valuesCopy.errors.years[0]} ${fmt.number(data.horizon.min)} ${valuesCopy.errors.years[1]}${fmt.number(data.horizon.max)}.` : null);
  const availableCheck = (n: number) => (n < 0 ? valuesCopy.errors.negative : resolved.amountNow !== null && n > resolved.amountNow ? r2.form.errAvailable : null);
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold">{r2.form.card1}</h2>
      <NameField label={r2.form.name} value={current.name} onChange={(v) => update((g) => ({ ...g, name: v.slice(0, 80) }))} />
      <GoalSlider label={r2.form.years} unit="years" value={resolved.horizonYears} source={src.horizonYears} presetValue={resolved.preset.horizon} onChange={set("horizonYears")} validate={horizonCheck} min={data.horizon.min} max={data.horizon.max} step={data.horizon.step} inputMode="numeric" />
      <GoalNumber label={r2.form.amountNow} unit="nis" value={resolved.amountNow} source={src.amountNow} onChange={set("amountNow")} validate={nonNegative} />
      <GoalSlider label={r2.form.monthly} unit="nis_per_month" value={resolved.monthly} source={src.monthly} presetValue={resolved.preset.monthly} onChange={set("monthly")} validate={nonNegative} min={data.monthly.min} max={data.monthly.max} step={data.monthly.step} />
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_11rem] md:gap-3 md:items-start">
        <GoalNumber label={r2.form.available} unit="nis" value={resolved.available} source={src.available} presetValue={resolved.available} onChange={set("available")} validate={availableCheck} externalError={availableTooBig(resolved)} hint={r2.form.availableHint} />
        <div>
          <MonthField label={r2.form.availableFrom} value={current.availableFrom} min={data.minMonth} onChange={(v) => update((g) => ({ ...g, availableFrom: v }))} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="field-label">{r2.form.constraints}</h3>
        <SwitchRow
          label={r2.form.anytime}
          checked={resolved.anytime}
          source={src.anytime}
          onChange={(v) => update((g) => ({ ...g, anytime: { value: v, entered: true } }))}
          onReset={() => update((g) => ({ ...g, anytime: { value: false, entered: false } }))}
        />
        <Callout tone="blocked">
          <span className="flex flex-wrap items-center gap-x-1.5">
            {r2.form.noReturnBefore} <bdi dir="ltr">{r2.form.noReturnCode}</bdi>
          </span>
        </Callout>
        <AcceptedFallField />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- card 2: the person

/** The payslip disclosure: the law's required content (PEN-36) from the rule base, its chip, and the G-19 line. */
export function PayslipDisclosure({ text }: { text: string | null }) {
  return (
    <Disclosure label={<span className="text-sm text-link">{r2.form.payslip}</span>} summaryClassName="min-h-9 justify-start gap-1 [&>svg]:size-4">
      <div className="flex flex-col gap-2 pb-2 text-sm max-w-measure">
        <p>{text ?? r2.form.payslipNoRule}</p>
        <p>
          <RuleRef id="PEN-36" />
        </p>
        <p className="text-muted-foreground">{r2.form.payslipLast}</p>
      </div>
    </Disclosure>
  );
}

export function ProfileFields({ data }: { data: FormData }) {
  const { current, update, setAge, setEmployment } = useGoals();
  if (!current) return null;
  const p = current.profile;
  const setProfile = (patch: Partial<Goal["profile"]>) => update((g) => ({ ...g, profile: { ...g.profile, ...patch } }));
  const pctCheck = (n: number) => (n < 0 ? valuesCopy.errors.negative : n > 100 ? `${r2.form.errPercentBefore}${fmt.number(100)}.` : null);
  const yesNo = (v: boolean | null) => (v === null ? null : v ? "yes" : "no");
  const self = p.employment === "self-employed";
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{r2.form.card2}</h2>
        <p className="text-sm text-muted-foreground">{r2.form.card2Why}</p>
      </div>
      <AgeStepper label={r2.form.age} value={p.age} onChange={setAge} validate={between(data.age, valuesCopy.errors.age)} />
      <div className="field">
        <span className="field-label" id="emp-l">
          {r2.form.employment}
        </span>
        <SegmentedControl<"employee" | "self-employed"> labelledBy="emp-l" options={[{ value: "employee", label: valuesCopy.employment.employee }, { value: "self-employed", label: valuesCopy.employment["self-employed"] }]} value={p.employment} onChange={(v) => setEmployment(p.employment === v ? null : v)} />
      </div>
      <div className="flex flex-col gap-1">
        <GoalNumber label={r2.form.salary} unit="nis" value={p.salary} source={p.salary === null ? "empty" : "entered"} onChange={(n) => setProfile({ salary: n })} validate={(n) => (n < 0 ? r2.form.errSalary : null)} bare />
        <PayslipDisclosure text={data.payslipText} />
      </div>
      <div className="flex flex-col gap-1">
        <PercentPair label={r2.form.pension} employer={p.pension.employer} employee={p.pension.employee} onEmployer={(n) => setProfile({ pension: { ...p.pension, employer: n } })} onEmployee={(n) => setProfile({ pension: { ...p.pension, employee: n } })} validate={pctCheck} />
        <PayslipDisclosure text={data.payslipText} />
      </div>
      <div className="flex flex-col gap-1">
        {self ? (
          <GoalNumber label={r2.form.hishtalmutYearly} unit="nis" value={p.hishtalmut.yearly} source={p.hishtalmut.yearly === null ? "empty" : "entered"} onChange={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, yearly: n } })} validate={nonNegative} bare />
        ) : (
          <PercentPair label={r2.form.hishtalmut} employer={p.hishtalmut.employer} employee={p.hishtalmut.employee} onEmployer={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, employer: n } })} onEmployee={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, employee: n } })} validate={pctCheck} />
        )}
        <PayslipDisclosure text={data.payslipText} />
      </div>
      <div className="field">
        <span className="field-label" id="hp-l">
          {r2.form.hasPension}
        </span>
        <SegmentedControl<"yes" | "no"> labelledBy="hp-l" options={[{ value: "yes", label: r2.form.yes }, { value: "no", label: r2.form.no }]} value={yesNo(p.hasPension)} onChange={(v) => setProfile({ hasPension: p.hasPension === (v === "yes") ? null : v === "yes" })} />
      </div>
      <div className="field">
        <span className="field-label" id="hh-l">
          {r2.form.hasHishtalmut}
        </span>
        <SegmentedControl<"yes" | "no"> labelledBy="hh-l" options={[{ value: "yes", label: r2.form.yes }, { value: "no", label: r2.form.no }]} value={yesNo(p.hasHishtalmut)} onChange={(v) => setProfile({ hasHishtalmut: p.hasHishtalmut === (v === "yes") ? null : v === "yes" })} />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- card 3: the assumptions

/** A-17, entered by the person (G-12): the insurance cost inside a pension fund. Empty, the pension funds read "not evaluated". */
export function InsuranceField({ data }: { data: FormData }) {
  const { current, update } = useGoals();
  if (!current) return null;
  const v = current.assumptions.insurance ?? null;
  return (
    <GoalNumber
      label={r2.form.insurance}
      unit="pct"
      value={v}
      source={v === null ? "empty" : "entered"}
      onChange={(n) => update((g) => ({ ...g, assumptions: { ...g.assumptions, insurance: n } }))}
      validate={between(data.pct, valuesCopy.errors.pct)}
      hint={r2.form.insuranceHint}
      note={v === null ? <span className="text-xs text-muted-foreground">{r2.form.insuranceEmpty}</span> : undefined}
      bare={v === null}
    />
  );
}

export function AssumptionFields({ data, bare }: { data: FormData; bare?: boolean }) {
  const { current, setEnteredReturn, setInflation } = useGoals();
  if (!current) return null;
  const a = current.assumptions;
  const check = between(data.pct, valuesCopy.errors.pct);
  const inflationSource: FieldSource = a.inflation === null ? "preset" : "entered";
  const body = (
    <>
      <GoalNumber
        label={r2.form.return}
        unit="pct_per_year"
        value={a.return}
        source={a.return === null ? "empty" : "entered"}
        onChange={setEnteredReturn}
        validate={check}
        hint={a.return === null ? r2.form.returnHint : undefined}
        note={a.return === null ? <span className="text-xs text-muted-foreground">{r2.form.returnEmpty}</span> : <span className="text-xs text-entered">{r2.form.returnFilled}</span>}
        bare
      />
      <GoalNumber
        label={r2.form.inflation}
        unit="pct_per_year"
        value={a.inflation ?? data.inflationStart}
        source={inflationSource}
        presetValue={data.inflationStart}
        onChange={setInflation}
        validate={check}
        note={inflationSource === "preset" ? <span className="text-xs text-muted-foreground">{r2.form.inflationStart}</span> : undefined}
        bare={inflationSource === "preset"}
      />
      <InsuranceField data={data} />
    </>
  );
  if (bare) return <div className="flex flex-col gap-4">{body}</div>;
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold">{r2.form.card3}</h2>
      {body}
    </Card>
  );
}

// ---------------------------------------------------------------- footer

export function FormFooter({ to }: { to: string }) {
  const { status, saved } = useGoals();
  const failed = status === "unavailable" || !saved;
  return (
    <div className="sticky bottom-0 z-[var(--z-sticky)] -mx-gutter px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background/90 backdrop-blur border-t border-border md:static md:mx-0 md:px-0 md:border-0 md:bg-transparent md:backdrop-blur-none md:pt-0">
      <div className="flex flex-col gap-2 md:items-start">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
          <LinkButton to={to} variant="primary" className="w-full md:w-auto md:min-w-48" onClick={flushPendingFields}>
            {r2.compare}
          </LinkButton>
          {/* the quiet second door (release 5): the same goal, by exposure */}
          <LinkButton to={`${to}?mode=exposure`} variant="secondary" className="w-full md:w-auto" onClick={flushPendingFields}>
            {r5.form.secondDoor}
          </LinkButton>
        </div>
        <p className={cx("text-xs flex items-center gap-1.5", failed ? "text-caution-foreground" : "text-muted-foreground")}>
          {!failed && <IconCheck size={14} className="text-positive" />}
          {failed ? r2.couldNotSave : r2.savedAuto}
        </p>
      </div>
    </div>
  );
}
