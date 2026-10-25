// The goal form's cards (design-spec 6.3, 7): the goal, the person and the assumptions, the payslip
// disclosure and the footer (the goals list is in goals-board.tsx). Everything typed goes straight into the saved goal.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { r2, r3holdings, r3transfer, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { checkGoal, childAgeFrom, filledFields, pctBoundsFor, presetNumbers, reconcileEmployment, type CheckBounds, type CheckMessages, type FieldSource, type Goal, type Presets } from "../../lib/goal";
import { useGoals } from "../../lib/goal";
import { IconCheck } from "../icons";
import { Button, Callout, Card, cx, Disclosure, flushPendingFields, SegmentedControl } from "../kit";
import { RuleRef } from "../provenance";
import { AgeStepper, GoalNumber, GoalSlider, MonthField, NameField, PercentPair, PresetChips, SwitchRow } from "./fields";
import { presetIds } from "../../lib/goal";
import { AcceptedFallField } from "../exposure-mode/fields";
import { r5 } from "../../copy";
import { entered as enteredValue } from "../../lib/value";
import { isoToday } from "../../lib/state";

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
  /** P-04's equity row minimum, in years (the route adds it): below it the worst-fall field gets its hint. scenario fix 2026-10-24 */
  equityMinYears?: number | null;
}

/** The kept-available amount above the amount now: an error on the available field, whichever of the two was edited last. */
export const availableTooBig = (r: { amountNow: number | null; available: number | null }) => (r.amountNow !== null && r.available !== null && r.available > r.amountNow ? r2.form.errAvailable : null);

const nonNegative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
/** A bound with its unit, numbers isolated so a minus sign stays with its number: "הזינו מספר בין -50 ל־50 אחוז". */
const iso = (n: number) => `\u2066${fmt.number(n)}\u2069`;
export const pctBoundMessage = (r: { min: number; max: number }) => `${r2.form.errPctBetween[0]} ${iso(r.min)} ${r2.form.errPctBetween[1]}${iso(r.max)} ${r2.form.errPctBetween[2]}.`;
const pctBetween = (r: { min: number; max: number }) => (n: number) => (n < r.min || n > r.max ? pctBoundMessage(r) : null);
const between = (r: { min: number; max: number }, msg: readonly [string, string]) => (n: number) => (n < r.min || n > r.max ? `${msg[0]} ${iso(r.min)} ${msg[1]}${iso(r.max)}.` : null);

export const checkBoundsOf = (data: FormData): CheckBounds => ({ horizon: data.horizon, pct: data.pct, age: data.age });
export const checkMessages = (data: FormData): CheckMessages => ({
  years: r2.form.errYears,
  yearsWhole: r2.form.errYearsWhole,
  yearsRange: `${valuesCopy.errors.years[0]} ${iso(data.horizon.min)} ${valuesCopy.errors.years[1]}${iso(data.horizon.max)}.`,
  negative: valuesCopy.errors.negative,
  available: r2.form.errAvailable,
  age: `${valuesCopy.errors.age[0]} ${iso(data.age.min)} ${valuesCopy.errors.age[1]}${iso(data.age.max)}.`,
  pct: pctBoundMessage,
});

// ---------------------------------------------------------------- presets and goals list

export function PresetRow({ data, presets }: { data: FormData; presets: Presets }) {
  void data;
  const { current, setPreset } = useGoals();
  const [kept, setKept] = useState(false);
  if (!current) return null;
  const record = current.preset === "none" ? undefined : presets[current.preset];
  const fields = filledFields(record);
  // audit 2026-10-24 (A74): name only what the preset really set and the person has not typed over: a withdrawal switch that stays off is not named
  const pn = presetNumbers(record);
  const names = fields
    .filter((f) => !(f === "anytime" && pn.anytime !== true))
    .filter((f) => !(f === "anytime" ? current.anytime.entered : current[f].entered))
    .map((f) => r2.form.filledNames[f]!);
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

export function goalTitle(g: Goal): string {
  return g.name.trim() || (g.preset !== "none" ? r2.presets[g.preset]! : r2.form.unnamed);
}

// ---------------------------------------------------------------- card 1: the goal

export function GoalFields({ data }: { data: FormData }) {
  const { current, resolved, update } = useGoals();
  if (!current || !resolved) return null;
  const set = (k: "horizonYears" | "amountNow" | "monthly" | "available") => (n: number | null) => update((g) => ({ ...g, [k]: n === null ? { value: null, entered: false } : { value: n, entered: true } }));
  const src = resolved.source;
  const thisYear = Number(data.minMonth.slice(0, 4));
  const horizonCheck = (n: number) => (n < 1 ? r2.form.errYears : !Number.isInteger(n) ? r2.form.errYearsWhole : n > data.horizon.max ? `${valuesCopy.errors.years[0]} ${fmt.number(data.horizon.min)} ${valuesCopy.errors.years[1]}${fmt.number(data.horizon.max)}.` : null);
  const availableCheck = (n: number) => (n < 0 ? valuesCopy.errors.negative : resolved.amountNow !== null && n > resolved.amountNow ? r2.form.errAvailable : null);
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold">{r2.form.card1}</h2>
      <NameField label={r2.form.name} value={current.name} onChange={(v) => update((g) => ({ ...g, name: v.slice(0, 80) }))} />
      {current.preset === "child" && (
        <div data-goal-field="childAge">
          <GoalNumber
            label={r2.form.childAge}
            unit="years"
            value={current.childAge ?? null}
            source={current.childAge == null ? "empty" : "entered"}
            onChange={(n) => update((g) => ({ ...g, childAge: n === null ? null : childAgeFrom(n, thisYear) }))}
            validate={(n) => (childAgeFrom(n, thisYear) === null ? r2.form.errChildAge : null)}
            hint={r2.form.childAgeHint}
            note={current.childAge == null ? <span className="text-xs text-muted-foreground">{r2.form.childAgeEmpty}</span> : undefined}
            inputMode="numeric"
            bare={current.childAge == null}
          />
        </div>
      )}
      <div data-goal-field="years">
      <GoalSlider label={r2.form.years} unit="years" value={resolved.horizonYears} source={src.horizonYears} presetValue={resolved.preset.horizon} onChange={set("horizonYears")} validate={horizonCheck} min={data.horizon.min} max={data.horizon.max} step={data.horizon.step} inputMode="numeric" />
      </div>
      <div data-goal-field="amount">
        <GoalNumber label={r2.form.amountNow} unit="nis" value={resolved.amountNow} source={src.amountNow} onChange={set("amountNow")} validate={nonNegative} />
      </div>
      <GoalSlider label={r2.form.monthly} unit="nis_per_month" value={resolved.monthly} source={src.monthly} presetValue={resolved.preset.monthly} onChange={set("monthly")} validate={nonNegative} min={data.monthly.min} max={data.monthly.max} step={data.monthly.step} />
      {current.preset === "known-date" && (
        <GoalNumber
          label={r2.form.targetCost}
          unit="nis"
          value={typeof current.targetCost?.value === "number" ? current.targetCost.value : null}
          source={current.targetCost ? "entered" : "empty"}
          onChange={(n) => update((g) => ({ ...g, targetCost: n === null ? null : enteredValue(Math.round(n), "nis", isoToday()) }))}
          validate={nonNegative}
          hint={r2.form.targetCostHint}
        />
      )}
      <p className="text-sm text-muted-foreground max-w-measure">{r2.form.couple}</p>
      <div className="field-row flex flex-col gap-4 md:grid md:grid-cols-[1fr_11rem] md:gap-3 md:items-start">
        <GoalNumber label={r2.form.available} unit="nis" value={resolved.available} source={src.available} presetValue={resolved.available} onChange={set("available")} validate={availableCheck} externalError={availableTooBig(resolved)} hint={r2.form.availableHint} />
        <MonthField label={r2.form.availableFrom} value={current.availableFrom} min={data.minMonth} max={`${Number(data.minMonth.slice(0, 4)) + data.horizon.max}-12`} onChange={(v) => update((g) => ({ ...g, availableFrom: v }))} />
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
        {data.equityMinYears != null && resolved.horizonYears !== null && resolved.horizonYears < data.equityMinYears && (
          <p className="text-sm text-muted-foreground max-w-measure" data-worst-fall-short>
            {r2.form.worstFallShort.before} <bdi>{fmt.number(resolved.horizonYears)}</bdi> {r2.form.worstFallShort.after}
          </p>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- card 2: the person

/** The payslip hint: one plain sentence, and the law's required content (PEN-36) from the rule base behind "הנוסח המלא". */
export function PayslipDisclosure({ text }: { text: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">{r2.form.payslipOne}</p>
      <Disclosure label={<span className="text-sm text-link">{r2.form.payslipFull}</span>} summaryClassName="min-h-9 justify-start gap-1 [&>svg]:size-4">
        <div className="flex flex-col gap-2 pb-2 text-sm max-w-measure">
          <p>{text ?? r2.form.payslipNoRule}</p>
          <p>
            <RuleRef id="PEN-36" />
          </p>
          <p className="text-muted-foreground">{r2.form.payslipLast}</p>
        </div>
      </Disclosure>
    </div>
  );
}

const Why = ({ children }: { children: ReactNode }) => <p className="text-xs text-muted-foreground">{children}</p>;

export function ProfileFields({ data }: { data: FormData }) {
  const { current, update, setAge, setEmployment } = useGoals();
  if (!current) return null;
  const p = current.profile;
  const setProfile = (patch: Partial<Goal["profile"]>) => update((g) => ({ ...g, profile: { ...g.profile, ...patch } }));
  // a yes through work fills the employment type in when none was chosen (A3); the person's own choice is never overwritten
  const setHas = (k: "hasPension" | "hasHishtalmut", v: boolean | null) => update((g) => ({ ...g, profile: reconcileEmployment({ ...g.profile, [k]: v }) }));
  const pctCheck = (n: number) => (n < 0 ? valuesCopy.errors.negative : n > 100 ? `${r2.form.errPercentBefore}${fmt.number(100)}.` : null);
  const yesNo = (v: boolean | null) => (v === null ? null : v ? "yes" : "no");
  const self = p.employment === "self-employed";
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{r2.form.card2}</h2>
        <p className="text-sm text-muted-foreground">{r2.form.card2Why}</p>
      </div>
      <div data-goal-field="age">
        <AgeStepper label={r2.form.age} value={p.age} onChange={setAge} validate={between(data.age, valuesCopy.errors.age)} />
      </div>
      <div className="field">
        <span className="field-label" id="emp-l">
          {r2.form.employment}
        </span>
        <SegmentedControl<"employee" | "self-employed"> labelledBy="emp-l" options={[{ value: "employee", label: valuesCopy.employment.employee }, { value: "self-employed", label: valuesCopy.employment["self-employed"] }]} value={p.employment} onChange={(v) => (p.employmentDefault && p.employment === v ? setEmployment(v) : setEmployment(p.employment === v ? null : v))} />
        {p.employmentDefault && p.employment === "employee" && (
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
            {r2.form.employmentDefault}
            <Button variant="quiet" className="text-sm min-h-9 px-0" onClick={() => setEmployment("self-employed")}>
              {r2.form.employmentFlip}
            </Button>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <GoalNumber label={self ? r2.form.salarySelf : r2.form.salary} unit="nis" value={p.salary} source={p.salary === null ? "empty" : "entered"} onChange={(n) => setProfile({ salary: n })} validate={(n) => (n < 0 ? r2.form.errSalary : null)} hint={self ? r2.form.salarySelfHint : undefined} bare />
        <Why>{r2.form.salaryWhy}</Why>
      </div>
      <div className="flex flex-col gap-1">
        <PercentPair self={self} label={self ? r2.form.pensionSelf : r2.form.pension} employer={p.pension.employer} employee={p.pension.employee} onEmployer={(n) => setProfile({ pension: { ...p.pension, employer: n } })} onEmployee={(n) => setProfile({ pension: { ...p.pension, employee: n } })} validate={pctCheck} />
        <Why>{r2.form.pensionWhy}</Why>
      </div>
      <div className="flex flex-col gap-1">
        {self ? (
          <GoalNumber label={r2.form.hishtalmutYearly} unit="nis" value={p.hishtalmut.yearly} source={p.hishtalmut.yearly === null ? "empty" : "entered"} onChange={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, yearly: n } })} validate={nonNegative} bare />
        ) : (
          <PercentPair label={r2.form.hishtalmut} employer={p.hishtalmut.employer} employee={p.hishtalmut.employee} onEmployer={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, employer: n } })} onEmployee={(n) => setProfile({ hishtalmut: { ...p.hishtalmut, employee: n } })} validate={pctCheck} />
        )}
        <Why>{r2.form.hishtalmutWhy}</Why>
      </div>
      {!self && <PayslipDisclosure text={data.payslipText} />}
      <div className="field">
        <span className="field-label" id="hp-l">
          {self ? r2.form.hasPensionSelf : r2.form.hasPension}
        </span>
        <SegmentedControl<"yes" | "no"> labelledBy="hp-l" options={[{ value: "yes", label: r2.form.yes }, { value: "no", label: r2.form.no }]} value={yesNo(p.hasPension)} onChange={(v) => setHas("hasPension", p.hasPension === (v === "yes") ? null : v === "yes")} />
      </div>
      <div className="field">
        <span className="field-label" id="hh-l">
          {self ? r2.form.hasHishtalmutSelf : r2.form.hasHishtalmut}
        </span>
        <SegmentedControl<"yes" | "no"> labelledBy="hh-l" options={[{ value: "yes", label: r2.form.yes }, { value: "no", label: r2.form.no }]} value={yesNo(p.hasHishtalmut)} onChange={(v) => setHas("hasHishtalmut", p.hasHishtalmut === (v === "yes") ? null : v === "yes")} />
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
      validate={pctBetween(pctBoundsFor("insurance", data.pct))}
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
  const checkReturn = pctBetween(pctBoundsFor("return", data.pct));
  const checkInflation = pctBetween(pctBoundsFor("inflation", data.pct));
  const inflationSource: FieldSource = a.inflation === null ? "preset" : "entered";
  const body = (
    <>
      <GoalNumber
        label={r2.form.return}
        unit="pct_per_year"
        value={a.return}
        source={a.return === null ? "empty" : "entered"}
        onChange={setEnteredReturn}
        validate={checkReturn}
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
        validate={checkInflation}
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
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:items-start">{body}</div>
    </Card>
  );
}

// ---------------------------------------------------------------- the form body and its submit (audit 2026-10-24, A38, A82)

/**
 * The cards, the submit and the save line. "להשוואה" is a real submit button: with years or an amount missing, or a field
 * marked wrong, it stays on the form and says why in one line (it never opens the comparison with a missing goal). Enter in
 * a field submits the same way. Two columns from lg: the goal and the person side by side, the assumptions across below.
 */
export function GoalFormBody({ data, to }: { data: FormData; to: string }) {
  const { current, resolved, status, saved } = useGoals();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const target = useRef<"product" | "exposure">("product");
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const check = current && resolved ? checkGoal(current, resolved, checkBoundsOf(data), checkMessages(data)) : null;
  const needText = !check ? null : check.missing.length === 2 ? r2.form.needBoth : check.missing[0] === "years" ? r2.form.needYears : check.missing[0] === "amount" ? r2.form.needAmount : null;
  const focusField = (name: string) => formRef.current?.querySelector<HTMLElement>(`[data-goal-field="${name}"] input`)?.focus();

  useEffect(() => {
    if (!attempt || !check) return;
    const bad = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (bad) {
      setMessage(r2.form.fixFields);
      bad.focus();
    } else if (check.problems.length > 0) {
      setMessage(`${r2.form.fixFields} ${check.problems[0]!.message}`);
      focusField(check.problems[0]!.field);
    } else if (check.missing.length > 0) {
      setMessage(needText);
      focusField(check.missing[0] === "years" ? "years" : "amount");
    } else {
      setMessage(null);
      navigate(target.current === "exposure" ? `${to}?mode=exposure` : to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);
  useEffect(() => {
    if (check?.ready && message === needText) setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check?.ready]);

  const submit = (which: "product" | "exposure") => {
    target.current = which;
    flushPendingFields();
    setAttempt((n) => n + 1);
  };
  const failed = status === "unavailable" || !saved;
  const line = message ?? (check && !check.ready ? (check.missing.length > 0 ? needText : r2.form.fixFields) : null);
  const bounced = search.get("need") === "1" && !message && check && !check.ready;
  return (
    <form
      ref={formRef}
      noValidate
      className="flex flex-col gap-6"
      onInput={() => setMessage(null)}
      onSubmit={(e) => {
        e.preventDefault();
        submit("product");
      }}
    >
      {bounced && <Callout tone="caution">{r2.form.bounced}</Callout>}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:items-start">
        <GoalFields data={data} />
        <ProfileFields data={data} />
        <div className="lg:col-span-2">
          <AssumptionFields data={data} />
        </div>
      </div>
      <div className="sticky bottom-0 z-[var(--z-sticky)] -mx-gutter px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background/90 backdrop-blur border-t border-border md:static md:mx-0 md:px-0 md:border-0 md:bg-transparent md:backdrop-blur-none md:pt-0">
        <div className="flex flex-col gap-2 md:items-start">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
            <Button type="submit" variant="primary" aria-disabled={!check?.ready} aria-describedby="goal-submit-line" className={cx("w-full md:w-auto md:min-w-48", !check?.ready && "opacity-60")}>
              {r5.form.firstDoor}
            </Button>
            {/* the quiet second door (release 5): the same goal, by exposure */}
            <Button variant="secondary" aria-disabled={!check?.ready} className={cx("w-full md:w-auto", !check?.ready && "opacity-60")} onClick={() => { submit("exposure"); }}>
              {r5.form.secondDoor}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground max-w-measure">{r5.form.doorsLine}</p>
          <p id="goal-submit-line" role="status" className={cx("text-sm", message ? "text-destructive" : "text-muted-foreground", !line && "sr-only")}>
            {line}
          </p>
          <p className={cx("text-xs flex flex-wrap items-center gap-x-1.5 gap-y-0.5", failed ? "text-caution-foreground" : "text-muted-foreground")}>
            {!failed && <IconCheck size={14} className="text-positive" />}
            {failed ? r2.couldNotSave : r2.savedAuto}
          </p>
          <p className="text-xs text-muted-foreground max-w-measure">
            {r3transfer.onePerDevice} {r3transfer.erasedNote}{" "}
            <Link to="/transfer" className="text-link hover:underline">
              {r3holdings.transferLink}
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
