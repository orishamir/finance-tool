// The inputs behind the graph (design-spec 4, design-system 3.3): number field, slider field, field state.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttons, values as copy } from "../../copy";
import { formatTyped, parseNumber, unitWord } from "../../lib/format";
import { IconReset } from "../icons";
import { StateTag } from "../provenance";
import { Button, cx } from "../ui";

/** Commits typed values that are still waiting out the 150 ms typing pause (F13). */
const pendingCommits = new Set<() => void>();
export function flushPendingFields(): void {
  for (const run of [...pendingCommits]) run();
}

export interface FieldProps {
  label: ReactNode;
  unit: string;
  /** The value the engine currently uses (P-05 or entered). */
  value: number | null;
  isEntered: boolean;
  /** Returns an error message for a parsed number, or null. */
  validate: (n: number) => ReactNode | null;
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
  /** An error that comes from another field's value (for example "kept available" above "amount now"); shown when the field has no error of its own. */
  externalError?: ReactNode | null;
}

export function NumberField(props: FieldProps) {
  const { label, unit, value, isEntered, validate, onCommit, onReset, hint, note, placeholder, disabled, compact, optional, inputMode = "decimal", autoFocus, externalError = null } = props;

  const ids = useId();
  const [text, setText] = useState(value === null ? "" : formatTyped(value));
  const [error, setError] = useState<ReactNode | null>(null);
  const [focused, setFocused] = useState(false);
  const timer = useRef<number | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const drop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) pendingCommits.delete(pending.current);
    pending.current = null;
  };
  /** Runs `fn` after the typing pause, or at once when something flushes first (blur, a preset, navigation, unmount). */
  const later = (fn: () => void) => {
    drop();
    const run = () => {
      drop();
      fn();
    };
    pending.current = run;
    pendingCommits.add(run);
    timer.current = window.setTimeout(run, 150);
  };
  const flush = () => pending.current?.();
  const flushRef = useRef(flush);
  flushRef.current = flush;
  useEffect(() => () => flushRef.current(), []);
  // audit A19: text typed before the script arrived sits in the pre-rendered input; take it in at the first commit instead of
  // letting the first re-render with the field's own (empty) state wipe it
  const inputRef = useRef<HTMLInputElement>(null);
  const adopted = useRef(false);
  useEffect(() => {
    if (adopted.current) return;
    adopted.current = true;
    const typed = inputRef.current?.value ?? "";
    if (typed !== "" && text === "" && value === null) change(typed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const lastValue = useRef(value);
  useEffect(() => {
    const changed = lastValue.current !== value;
    lastValue.current = value;
    if (focused) return;
    // a typed value that failed its check stays on screen with its message after the field loses focus (F7); a new value from outside replaces it
    if (changed || !error) {
      setText(value === null ? "" : formatTyped(value));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused]);
  const shownError = error ?? externalError;
  const change = (t: string) => {
    setText(t);
    drop();
    if (t.trim() === "" && optional) {
      setError(null);
      later(() => onReset());
      return;
    }
    const n = parseNumber(t);
    const err = Number.isNaN(n) ? copy.errors.nan : validate(n);
    setError(err);
    if (!err) later(() => onCommit(n));
  };
  const box = (
    <div className={cx("field-box", compact && "field-box-compact", isEntered && "field-box-entered", shownError ? "field-box-error" : false, disabled && "opacity-60")}>
      <input
        ref={inputRef}
        id={ids}
        type="text"
        inputMode={inputMode}
        dir="ltr"
        value={text}
        placeholder={disabled ? copy.loading : placeholder}
        disabled={disabled}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={[hint ? `${ids}-hint` : null, shownError ? `${ids}-err` : null].filter(Boolean).join(" ") || undefined}
        onChange={(e) => change(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          flush();
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
        {shownError && (
          <span id={`${ids}-err`} className="text-xs text-destructive">
            {shownError}
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
      {shownError ? (
        <span id={`${ids}-err`} className="text-xs text-destructive">
          {shownError}
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
  if (!entered) return null;
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

/** The one line above a panel of fields: what an untouched field is (UX fix 17). */
export function ParameterLine({ className }: { className?: string }) {
  return <p className={cx("text-xs text-muted-foreground", className)}>{copy.stateStart}</p>;
}
