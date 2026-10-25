// The goal form's inputs (design-spec 6.3): number and slider fields that know whether their value is the
// person's or a preset's, month field, switch row, percent pair, age stepper and the preset chips. They reuse
// the release 1 field anatomy (the kit's NumberField and RangeField) and add the "ערך התחלתי" / "הוזן על ידך" state line.
import { useId, useState, type ReactNode } from "react";
import { buttons, r2, values as valuesCopy } from "../../copy";
import type { FieldSource, PresetId } from "../../lib/goal";
import { IconReset } from "../icons";
import { StateTag } from "../provenance";
import { Button, ChoiceChips, cx, NumberField, RangeField } from "../kit";
import { IconDash, IconPlus } from "./icons";

/** The state line under a field: "הוזן על ידך" with a reset, or the site parameter a preset filled in. */
export function StateLine({ source, canReset, onReset }: { source: FieldSource; canReset: boolean; onReset: () => void }) {
  if (source === "entered")
    return (
      <span className="flex items-center gap-2 flex-wrap">
        <StateTag state="entered" />
        {canReset && (
          <Button variant="quiet" className="text-sm -ms-2 min-h-target" onClick={onReset}>
            <IconReset size={16} /> {buttons.resetOne}
          </Button>
        )}
      </span>
    );
  return null;
}

export interface GoalNumberProps {
  label: ReactNode;
  unit: string;
  value: number | null;
  source: FieldSource;
  /** The number a preset holds for this field, when it has one (the reset goes back to it). */
  presetValue?: number | null;
  /** `null` clears the field back to the preset (or to empty). */
  onChange: (n: number | null) => void;
  validate?: (n: number) => string | null;
  hint?: ReactNode;
  note?: ReactNode;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
  compact?: boolean;
  /** No state line (sub-fields of a pair). */
  bare?: boolean;
  /** An error that comes from another field (see NumberField). */
  externalError?: string | null;
}

export function GoalNumber({ label, unit, value, source, presetValue, onChange, validate, hint, note, placeholder, inputMode, compact, bare, externalError }: GoalNumberProps) {
  return (
    <NumberField
      label={label}
      unit={unit}
      value={value}
      isEntered={source === "entered"}
      validate={validate ?? (() => null)}
      onCommit={(n) => onChange(n)}
      onReset={() => onChange(null)}
      hint={hint}
      note={
        <>
          {note}
          {!bare && !compact && <StateLine source={source} canReset={presetValue !== undefined && presetValue !== null} onReset={() => onChange(null)} />}
        </>
      }
      placeholder={placeholder}
      inputMode={inputMode}
      compact={compact}
      externalError={externalError}
      optional
    />
  );
}

export function GoalSlider({
  label,
  unit,
  value,
  source,
  presetValue,
  onChange,
  validate,
  min,
  max,
  step,
  inputMode,
}: {
  label: ReactNode;
  unit: string;
  value: number | null;
  source: FieldSource;
  presetValue?: number | null;
  onChange: (n: number | null) => void;
  validate?: (n: number) => string | null;
  min: number;
  max: number;
  step: number;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <RangeField
      label={label}
      unit={unit}
      value={value}
      isEntered={source === "entered"}
      validate={validate ?? (() => null)}
      onCommit={(n) => onChange(n)}
      onReset={() => onChange(null)}
      min={min}
      max={max}
      step={step}
      inputMode={inputMode}
      optional
      footer={<StateLine source={source} canReset={presetValue !== undefined && presetValue !== null} onReset={() => onChange(null)} />}
    />
  );
}

/** A text field for the goal's name: free text, direction by its content. */
export function NameField({ label, value, onChange }: { label: ReactNode; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-body">
        <div className="field-box">
          <input id={id} type="text" dir="rtl" value={value} onChange={(e) => onChange(e.target.value)} className="field-input !text-start text-mixed" autoComplete="off" />
        </div>
      </div>
    </div>
  );
}

/** `2026-10` as `10.2026`: the same text form on every device, beside the native picker (UX fix 18). */
export const monthText = (v: string): string => (/^\d{4}-\d{2}$/.test(v) ? `${v.slice(5)}.${v.slice(0, 4)}` : "");

/** A native month picker in the same box as a field; the default is this month. A month outside `min`..`max` is not saved and says so (audit 2026-10-24, A61). */
export function MonthField({ label, value, min, max, onChange }: { label: ReactNode; value: string | null; min: string; max?: string; onChange: (v: string | null) => void }) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const shown = value ?? min;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-body">
        <div className={cx("field-box", error && "field-box-error")}>
          <input
            id={id}
            type="month"
            dir="ltr"
            min={min}
            max={max}
            value={shown}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const v = e.target.value;
              if (v && (v < min || (max && v > max))) {
                setError(`${r2.form.errMonth[0]}\u2066${monthText(min)}\u2069${r2.form.errMonth[1]}\u2066${monthText(max ?? min)}\u2069.`);
                return;
              }
              setError(null);
              onChange(v || null);
            }}
            className="field-input !text-end"
          />
          <bdi dir="ltr" className="field-unit">
            {monthText(shown)}
          </bdi>
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

/** A switch row: the label at the start, the switch at the end, 44px tall. */
export function SwitchRow({ label, checked, onChange, source, onReset }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; source: FieldSource; onReset: () => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4 min-h-target">
        <span id={id} className="text-base">
          {label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
          onClick={() => onChange(!checked)}
          className={cx("relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-[var(--duration-fast)]", checked ? "bg-primary border-primary" : "bg-muted border-input")}
        >
          <span className={cx("absolute top-0.5 size-5 rounded-full transition-all duration-[var(--duration-fast)]", checked ? "bg-background start-6" : "bg-muted-foreground start-0.5")} />
        </button>
      </div>
      <StateLine source={source} canReset={false} onReset={onReset} />
    </div>
  );
}

/** Two percent fields side by side under one label, "מעסיק" and "עובד"; for the self-employed only the person's own share (audit 2026-10-24, A39). */
export function PercentPair({ label, employer, employee, onEmployer, onEmployee, validate, self }: { label: ReactNode; employer: number | null; employee: number | null; onEmployer: (n: number | null) => void; onEmployee: (n: number | null) => void; validate: (n: number) => string | null; self?: boolean }) {
  return (
    <fieldset className="field border-0 p-0 m-0 min-w-0">
      <legend className="field-label mb-1.5">{label}</legend>
      <div className={cx("field-row grid gap-3", !self && "grid-cols-2")}>
        {!self && <GoalNumber label={<span className="text-xs text-muted-foreground font-normal">{r2.form.employer}</span>} unit="pct" value={employer} source={employer === null ? "empty" : "entered"} onChange={onEmployer} validate={validate} bare />}
        <GoalNumber label={<span className="text-xs text-muted-foreground font-normal">{self ? r2.form.employeeSelf : r2.form.employee}</span>} unit="pct" value={employee} source={employee === null ? "empty" : "entered"} onChange={onEmployee} validate={validate} bare />
      </div>
    </fieldset>
  );
}

/** Age with a stepper at each side of the box. */
export function AgeStepper({ label, value, onChange, validate, hint }: { label: ReactNode; value: number | null; onChange: (n: number | null) => void; validate: (n: number) => string | null; hint?: ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 min-w-0">
        <GoalNumber label={label} unit="years" value={value} source={value === null ? "empty" : "entered"} onChange={onChange} validate={validate} hint={hint} bare inputMode="numeric" placeholder={valuesCopy.agePlaceholder} />
      </div>
      <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={r2.form.ageDown} disabled={value === null || value <= 0} onClick={() => value !== null && onChange(value - 1)}>
        <IconDash size={18} />
      </Button>
      <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={r2.form.ageUp} disabled={value === null} onClick={() => value !== null && onChange(value + 1)}>
        <IconPlus size={18} />
      </Button>
    </div>
  );
}

/** The goal form's preset chips: the general chips with the preset names (the home page's question card uses the same row for its purposes). */
export function PresetChips({ value, onChange, ids }: { value: PresetId; onChange: (p: PresetId) => void; ids: PresetId[] }) {
  return <ChoiceChips ids={ids} labels={r2.presets} value={value} onChange={onChange} ariaLabel={r2.form.presetLabel} wrap />;
}
