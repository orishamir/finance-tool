// The inputs behind the graph (design-spec 4, design-system 3.3): number field, slider field, field state.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttons, values as copy } from "../../copy";
import { formatTyped, parseTyped, unitWord } from "../../lib/format";
import { IconReset } from "../icons";
import { StateTag } from "../provenance";
import { Button, cx } from "../ui";

export interface FieldProps {
  label: ReactNode;
  unit: string;
  /** The value the engine currently uses (P-05 or entered). */
  value: number | null;
  isEntered: boolean;
  /** Returns an error message for a parsed number, or null. */
  validate: (n: number) => string | null;
  onCommit: (n: number) => void;
  onReset: () => void;
  hint?: ReactNode;
  note?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Only the box and its error, without the label row and state (inside a slider's label row). */
  compact?: boolean;
  /** No start-value state line (optional fields such as age). */
  optional?: boolean;
  inputMode?: "decimal" | "numeric";
  autoFocus?: boolean;
}

export function NumberField(props: FieldProps) {
  const { label, unit, value, isEntered, validate, onCommit, onReset, hint, note, placeholder, disabled, compact, optional, inputMode = "decimal", autoFocus } = props;
  const ids = useId();
  const [text, setText] = useState(value === null ? "" : formatTyped(value));
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!focused) {
      setText(value === null ? "" : formatTyped(value));
      setError(null);
    }
  }, [value, focused]);
  const change = (t: string) => {
    setText(t);
    if (timer.current) window.clearTimeout(timer.current);
    if (t.trim() === "" && optional) {
      setError(null);
      timer.current = window.setTimeout(() => onReset(), 150);
      return;
    }
    const n = parseTyped(t);
    const err = Number.isNaN(n) ? copy.errors.nan : validate(n);
    setError(err);
    if (!err) timer.current = window.setTimeout(() => onCommit(n), 150);
  };
  const box = (
    <div className={cx("field-box", compact && "field-box-compact", isEntered && "field-box-entered", error && "field-box-error", disabled && "opacity-60")}>
      <input
        id={ids}
        type="text"
        inputMode={inputMode}
        dir="ltr"
        value={text}
        placeholder={disabled ? copy.loading : placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${ids}-hint` : null, error ? `${ids}-err` : null].filter(Boolean).join(" ") || undefined}
        onChange={(e) => change(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (!error && value !== null && text.trim() !== "") setText(formatTyped(value));
        }}
        autoFocus={autoFocus}
        className={cx("field-input", isEntered && "text-entered")}
      />
      <span className="field-unit">{unitWord(unit)}</span>
    </div>
  );
  if (compact) {
    return (
      <div className="flex flex-col gap-1 items-end">
        <label htmlFor={ids} className="sr-only">
          {label}
        </label>
        {box}
        {error && (
          <span id={`${ids}-err`} className="text-xs text-destructive">
            {error}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="field">
      <label htmlFor={ids} className="field-label">
        {label}
      </label>
      {box}
      {error ? (
        <span id={`${ids}-err`} className="text-xs text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span id={`${ids}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
      {note}
      {!optional && <FieldState entered={isEntered} onReset={onReset} disabled={disabled} />}
    </div>
  );
}

export function FieldState({ entered, onReset, disabled }: { entered: boolean; onReset: () => void; disabled?: boolean }) {
  if (disabled) return <span className="text-xs text-muted-foreground">{copy.loading}</span>;
  if (!entered) return <span className="text-xs text-muted-foreground">{copy.stateStart}</span>;
  return (
    <span className="flex items-center gap-2 flex-wrap">
      <StateTag state="entered" />
      <Button variant="quiet" className="text-sm -ms-2 min-h-target" onClick={onReset}>
        <IconReset size={16} /> {buttons.resetOne}
      </Button>
    </span>
  );
}

export interface SliderFieldProps extends FieldProps {
  min: number;
  max: number;
  step: number;
}

export function SliderField(props: SliderFieldProps) {
  const { label, min, max, step, value, onCommit, disabled, isEntered, onReset } = props;
  const id = useId();
  const current = value ?? min;
  const clamped = Math.max(min, Math.min(max, current));
  const fill = ((clamped - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="flex items-center justify-between gap-3">
        <span className="field-label" id={`${id}-l`}>
          {label}
        </span>
        <NumberField {...props} compact />
      </div>
      <input
        type="range"
        className="slider"
        aria-labelledby={`${id}-l`}
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        onChange={(e) => onCommit(Number(e.target.value))}
      />
      <FieldState entered={isEntered} onReset={onReset} disabled={disabled} />
    </div>
  );
}
