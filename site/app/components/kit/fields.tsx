// The inputs behind the graph (design-spec 4, design-system 3.3): number field, range field (slider and number), percent field, and the
// reset each field carries on its label line.
import { useEffect, useId, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { buttons, values as copy } from "../../copy";
import { fmt, formatTyped, parseNumber, unitWord } from "../../lib/format";
import { IconClose, IconReset, IconSearch } from "../icons";
import { Button } from "./button";
import { cx } from "./cx";

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
  /** The reader typed the value (it is not the start value). It changes nothing in the field's look: what the reader types looks the same as the default. */
  isEntered: boolean;
  /**
   * The value the field starts at, its default: the reset on the label line says "חזרה ל־{start}" and shows while the value differs from
   * it. `null`: there is nothing to go back to (no reset). Left out: the reset shows while `isEntered`, in general words.
   */
  start?: number | null;
  /** Returns an error message for a parsed number, or null. */
  validate: (n: number) => ReactNode | null;
  onCommit: (n: number) => void;
  onReset: () => void;
  hint?: ReactNode;
  note?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Only the box and its error, without the label row (inside a slider's label row). */
  compact?: boolean;
  /** An empty field is allowed and clears the value (optional fields such as age); without a `start` it has no reset. */
  optional?: boolean;
  inputMode?: "decimal" | "numeric";
  /** A price that may have agorot (a fee from a price list, "9.90 ₪"). Without it, a shekel field takes whole shekels only. */
  agorot?: boolean;
  /** Thousands separators while the reader types ("10,000" as the last zero goes in), not only when the field is left; whole amounts only. */
  groupAsTyped?: boolean;
  autoFocus?: boolean;
  /** An error that comes from another field's value (for example "kept available" above "amount now"); shown when the field has no error of its own. */
  externalError?: ReactNode | null;
  /** Compact only: hands the error to the row that holds the box, which shows it in a line it already keeps, instead of a line under the box that would push what follows down (nothing moves). */
  errorOut?: (error: ReactNode | null) => void;
}

/** How a field writes its start value in its reset: "10", "12,000 ₪", "4.5%", as the field shows it. */
export function startText(n: number, unit: string): string {
  if (/^nis/.test(unit)) return fmt.nis(n);
  if (/^pct/.test(unit)) return `${formatTyped(n)}%`;
  return formatTyped(n);
}

/** Whether a field has a reset at all: a start value to go back to, or (with none given) a field that is not optional. Without one, no room is kept. */
function resetKept({ start, optional }: Pick<FieldProps, "start" | "optional">): boolean {
  return start === undefined ? !optional : start !== null;
}

/** Whether a field's reset shows: the value differs from the start value, or, with no start value given, the reader typed it. */
function resetShown({ value, isEntered, start, optional, disabled }: Pick<FieldProps, "value" | "isEntered" | "start" | "optional" | "disabled">): boolean {
  if (disabled || !resetKept({ start, optional })) return false;
  if (start === undefined) return isEntered;
  return value !== null && value !== start;
}

/**
 * The reset at the far end of a field's label line: small and muted, "↺ חזרה ל־10". It holds its place while it is
 * hidden (`invisible` also takes it out of the tab order and what a screen reader reads), so nothing moves when it comes or goes; its tap
 * area reaches 44 px past its small text.
 */
function ResetToStart({ shown, start, unit, onReset, describedBy, className }: { shown: boolean; start?: number | null; unit: string; onReset: () => void; /** The label's id: the reset is spoken with the field's name. */ describedBy?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onReset}
      aria-describedby={describedBy}
      className={cx("tap-area shrink-0 inline-flex items-center gap-1 text-xs leading-5 font-normal text-muted-foreground hover:text-foreground whitespace-nowrap", !shown && "invisible", className)}
    >
      <IconReset size={14} aria-hidden="true" />
      {typeof start === "number" ? (
        <span>
          {buttons.resetTo}
          <bdi dir="ltr">{startText(start, unit)}</bdi>
        </span>
      ) : (
        <span>{buttons.resetOne}</span>
      )}
    </button>
  );
}

/** A box for one typed number, with its unit, hint and error, and the reset on its label line. The default for any number the reader may change. */
export function NumberField(props: FieldProps) {
  const { label, unit, value, validate, onCommit, onReset, hint, note, placeholder, disabled, compact, optional, inputMode: mode = "decimal", autoFocus, externalError = null, errorOut, agorot, start, groupAsTyped } = props;
  // an amount of money is typed in whole shekels; a rate (interest, inflation, a return) and a price-list fee keep decimals
  const whole = /^nis/.test(unit) && !agorot;
  const inputMode = whole ? "numeric" : mode;

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
  // text typed before the script arrived sits in the pre-rendered input; take it in at the first commit instead of
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
  const errorOutRef = useRef(errorOut);
  errorOutRef.current = errorOut;
  useEffect(() => {
    errorOutRef.current?.(shownError);
  }, [shownError]);
  // with `groupAsTyped`, the caret stays after the same digit once the separators move
  const caret = useRef<number | null>(null);
  useIsoLayoutEffect(() => {
    const el = inputRef.current;
    if (caret.current === null || !el) return;
    const want = caret.current;
    caret.current = null;
    let seen = 0;
    let at = 0;
    while (at < text.length && seen < want) if (/\d/.test(text[at++]!)) seen++;
    el.setSelectionRange(at, at);
  }, [text]);
  const change = (raw: string, at?: number | null) => {
    let t = raw;
    if (groupAsTyped && whole && /^[\d,\s]*$/.test(raw)) {
      const digits = raw.replace(/\D/g, "");
      t = digits === "" ? "" : formatTyped(Number(digits));
      if (at !== undefined && at !== null) caret.current = raw.slice(0, at).replace(/\D/g, "").length;
    }
    setText(t);
    drop();
    if (t.trim() === "" && optional) {
      setError(null);
      later(() => onReset());
      return;
    }
    const n = parseNumber(t);
    const err = Number.isNaN(n) ? copy.errors.nan : whole && !Number.isInteger(n) ? copy.errors.whole : validate(n);
    setError(err);
    if (!err) later(() => onCommit(n));
  };
  const box = (
    <div className={cx("field-box", compact && "field-box-compact", shownError ? "field-box-error" : false, disabled && "opacity-60")}>
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
        onChange={(e) => change(e.target.value, e.target.selectionStart)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          flush();
          setFocused(false);
          if (!error && value !== null && text.trim() !== "") setText(formatTyped(value));
        }}
        autoFocus={autoFocus}
        className="field-input"
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
        {shownError && !errorOut && (
          <span id={`${ids}-err`} className="text-xs text-destructive">
            {shownError}
          </span>
        )}
      </div>
    );
  }
  // the label line (the label, and its reset at the far end), then one body with the box and what follows it: a field in a `.field-row` is a
  // two-row subgrid (app.css). The reset keeps its place while hidden, so the label never rewraps when it comes
  return (
    <div className="field">
      <div className="field-label flex flex-wrap items-end justify-between gap-x-3">
        <label htmlFor={ids} id={`${ids}-l`} className="min-w-0">
          {label}
        </label>
        {resetKept(props) && <ResetToStart shown={resetShown(props)} start={start} unit={unit} onReset={onReset} describedBy={`${ids}-l`} className="ms-auto" />}
      </div>
      <div className="field-body">
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
      </div>
    </div>
  );
}

/**
 * A reset for a group of typed values on a line of its own, under them (a table cell of several small boxes with no label line, such as an
 * own account's prices): a quiet "חזרה לערך ההתחלתי" while something is typed, "loading" while the fields wait. No "you entered" tag
 * . The line keeps its height either way, so nothing under it moves. A field with a label line
 * carries its own reset there instead (`NumberField`, `RangeField`).
 */
export function FieldState({ entered, onReset, disabled, canReset = true }: { entered: boolean; onReset: () => void; disabled?: boolean; canReset?: boolean }) {
  return (
    <span className="flex items-center gap-2 min-h-target">
      {disabled ? (
        <span className="text-xs text-muted-foreground">{copy.loading}</span>
      ) : entered && canReset ? (
        <Button variant="quiet" className="text-sm leading-tight -ms-2 min-h-target" onClick={onReset}>
          <IconReset size={16} /> {buttons.resetOne}
        </Button>
      ) : null}
    </span>
  );
}

export interface RangeFieldProps extends FieldProps {
  min: number;
  max: number;
  step: number;
  /** A line under the slider (the goals board's own words). `false` or left out: none. */
  footer?: ReactNode | false;
}

/**
 * A number and a slider for it, together: the label, its reset and the box on one row, the slider under them. For a quantity with a
 * natural range (years, a monthly deposit). The reset sits at the far end of the label, beside the box, and keeps its place while hidden;
 * where the row is too narrow for both it takes a second line in the same row, so nothing moves when it comes. The
 * box's error takes the reset's place while it lasts, so no line opens under the box.
 */
export function RangeField(props: RangeFieldProps) {
  const { label, unit, min, max, step, value, onCommit, disabled, onReset, footer, start } = props;
  const id = useId();
  const [error, setError] = useState<ReactNode | null>(null);
  const current = value ?? min;
  const clamped = Math.max(min, Math.min(max, current));
  const fill = ((clamped - min) / (max - min)) * 100;
  return (
    <div className="field range-field">
      <div className="flex items-center justify-between gap-3 min-h-target">
        <span className="flex flex-wrap items-center gap-x-2 min-w-0 flex-1">
          <span className="field-label min-w-0" id={`${id}-l`}>
            {label}
          </span>
          {error ? (
            <span role="alert" className="ms-auto text-xs leading-5 text-destructive">
              {error}
            </span>
          ) : (
            resetKept(props) && <ResetToStart shown={resetShown(props)} start={start} unit={unit} onReset={onReset} describedBy={`${id}-l`} className="ms-auto" />
          )}
        </span>
        <NumberField {...props} compact errorOut={setError} />
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
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(e) => onCommit(Number(e.target.value))}
      />
      {footer || null}
    </div>
  );
}

/** The check for an amount that cannot be below zero: the standard sentence "הסכום לא יכול להיות שלילי.". */
export const nonNegativeCheck = (n: number): string | null => (n < 0 ? copy.errors.negative : null);

/** The check for an amount that must be above zero (a salary, an income): the standard sentence "הזינו סכום גדול מאפס.". */
export const aboveZeroCheck = (n: number): string | null => (n <= 0 ? copy.errors.positive : null);

/** A whole number in the range, else the sentence's two halves around the range ("… 1 ל־40."). */
const wholeInRange = (range: { min: number; max: number }, words: readonly [string, string]) => (n: number): string | null =>
  n < range.min || n > range.max || !Number.isInteger(n) ? `${words[0]} ${fmt.number(range.min)} ${words[1]}${fmt.number(range.max)}.` : null;

/** The check for a number of years: a whole number in the range, else the standard sentence "הזינו מספר שנים בין … ל־…". */
export const yearsCheck = (range: { min: number; max: number }) => wholeInRange(range, copy.errors.years);

/** The check for an age: the same test as `yearsCheck`, in the age's words, "הזינו גיל בין … ל־…". */
export const ageCheck = (range: { min: number; max: number }) => wholeInRange(range, copy.errors.age);

/** The check for a percent field: the number must lie in the range, else the standard sentence "הזינו אחוז בין … ל־…". */
export function percentCheck(range: { min: number; max: number } = { min: 0, max: 100 }): (n: number) => string | null {
  return (n) => (n < range.min || n > range.max ? `${copy.errors.pct[0]} ${fmt.number(range.min)} ${copy.errors.pct[1]}${fmt.number(range.max)}.` : null);
}

/** A number field for a percent: the unit is a yearly rate unless `unit` says otherwise, and the range check is the standard one (0 to 100 unless `range` says otherwise). */
export function PercentField({ unit = "pct_per_year", range, validate, ...rest }: Omit<FieldProps, "unit" | "validate"> & { unit?: string; range?: { min: number; max: number }; validate?: FieldProps["validate"] }) {
  return <NumberField unit={unit} validate={validate ?? percentCheck(range)} {...rest} />;
}

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "className" | "id" | "dir" | "type" | "children">;

/**
 * The inside of a search box, shared by `AskField` and `SearchField`: the search icon, the input (right to left, a Latin name inside it
 * keeping its own order) and, while it holds words and has `clearLabel`, × that empties it and gives the focus back.
 */
function SearchBox({ id, value, onChange, clearLabel, inputRef, big, compact, ...input }: SearchInputProps & { id: string; value?: string; onChange: (value: string, input: HTMLInputElement) => void; clearLabel?: string; inputRef?: Ref<HTMLInputElement>; /** The page's lead field: taller, larger words, the action colour's edge. */ big?: boolean; compact?: boolean }) {
  const own = useRef<HTMLInputElement | null>(null);
  const setRef = (el: HTMLInputElement | null) => {
    own.current = el;
    if (typeof inputRef === "function") inputRef(el);
    else if (inputRef) inputRef.current = el;
  };
  return (
    <div className={cx("field-box text-muted-foreground", big && "!h-14 border-primary bg-card text-base lg:text-lg", big && !compact && "lg:!h-16")}>
      <IconSearch size={big ? 20 : 18} aria-hidden="true" />
      <input ref={setRef} id={id} type="text" dir="rtl" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value, e.currentTarget)} className="field-input !text-start text-mixed text-foreground" {...input} />
      {clearLabel && value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            if (own.current) onChange("", own.current);
            own.current?.focus();
          }}
          className="min-w-target min-h-target inline-flex items-center justify-center"
        >
          <IconClose size={18} />
        </button>
      )}
    </div>
  );
}

/** The one large field a page leads with (the rules page's claim): a whole sentence fits, and × empties it. Its words are the caller's. */
export function AskField({ value, onChange, onFocus, label, placeholder, clearLabel, compact }: { value: string; onChange: (value: string) => void; onFocus?: () => void; label: string; placeholder: string; clearLabel: string; /** Keeps the phone's height on a computer too (a page whose list must start high). */ compact?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchBox id={id} big compact={compact} value={value} onChange={(v) => onChange(v)} onFocus={onFocus} placeholder={placeholder} clearLabel={clearLabel} />
    </div>
  );
}

/**
 * A box to search or filter by words: a list's filter (the companies page), a field that opens the site's search (a company's paste card).
 * Its label stands above it, or is for a screen reader only (`labelHidden`) where the words around it already say what it searches. With
 * `value` the caller holds the words and `clearLabel` adds × that empties them; without it the field keeps its own. Any other attribute of
 * the input (`onFocus`, `role`, `aria-*`) passes through.
 */
export function SearchField({ label, labelHidden, value, onChange, clearLabel, inputRef, className, ...input }: SearchInputProps & {
  label: ReactNode;
  labelHidden?: boolean;
  value?: string;
  /** The words as typed, and the input (a caller that opens a sheet anchors it there). */
  onChange: (value: string, input: HTMLInputElement) => void;
  clearLabel?: string;
  inputRef?: Ref<HTMLInputElement>;
  /** Places the field (`md:w-72`, `shrink-0`), never restyles it. */
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx("flex flex-col gap-2 min-w-0", className)}>
      <label htmlFor={id} className={labelHidden ? "sr-only" : "text-sm font-medium"}>
        {label}
      </label>
      <SearchBox id={id} value={value} onChange={onChange} clearLabel={clearLabel} inputRef={inputRef} {...input} />
    </div>
  );
}

/**
 * One line of text the person types (a name): a label above, an optional help line and error under. For a number, `NumberField`.
 * `inline`: the label beside the box in muted small words and the words in the box bold, for a name typed in place in a line of other
 * facts (the fee page's bar: "העסקה [חשבון המסחר שלי]").
 */
export function TextField({ label, value, onChange, hint, error, placeholder, maxLength, dir = "rtl", inline, className }: { label: ReactNode; value: string; onChange: (v: string) => void; hint?: ReactNode; error?: ReactNode | null; placeholder?: string; maxLength?: number; /** `ltr` for an identifier. */ dir?: "rtl" | "ltr"; inline?: boolean; className?: string }) {
  const id = useId();
  return (
    <div className={cx(inline ? "flex flex-wrap items-center gap-2" : "field", className)}>
      <label htmlFor={id} className={inline ? "text-sm text-muted-foreground" : "field-label"}>
        {label}
      </label>
      <div className="field-body">
        <div className={cx("field-box", inline && "field-box-compact w-56 max-w-full", error ? "field-box-error" : false)}>
          <input id={id} type="text" dir={dir} value={value} placeholder={placeholder} maxLength={maxLength} autoComplete="off" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} onChange={(e) => onChange(e.target.value)} className={cx("field-input !text-start text-mixed", inline && "font-semibold")} />
        </div>
        {error ? (
          <span id={`${id}-err`} className="text-xs text-destructive">
            {error}
          </span>
        ) : hint ? (
          <span id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** One yes or no the person can tick on its own, beside others that are not exclusive: the whole row is the target. For one choice of a few, `SegmentedControl`. */
export function CheckField({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 min-h-target cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-[var(--primary)]" />
      <span>{label}</span>
    </label>
  );
}

/** Fields that belong together under one heading, with a line between groups. */
export function FieldGroup({ title, children, note, className }: { title: ReactNode; children: ReactNode; note?: ReactNode; /** For a group set beside another, where the line above it would stand alone (the own fund's panel on a computer). */ className?: string }) {
  return (
    <fieldset className={cx("flex flex-col gap-3 min-w-0 border-t border-border pt-3 first:border-t-0 first:pt-0", className)}>
      <legend className="font-medium mb-1">{title}</legend>
      {children}
      {note}
    </fieldset>
  );
}

/**
 * A choice that sits in a line of other controls (a tab line's filters): "מוצר: הכול", the label and the chosen name in one native
 * select, no field box. `all` is the first option, chosen when `value` is null; without it one of the options is always chosen.
 * `labelHidden` keeps the label for a screen reader only, where the words around the select already say what it chooses (a price's
 * period beside its rate: "0.6% לשנה").
 */
export function InlineSelect({ label, all, options, value, onChange, labelHidden }: { label: string; all?: string; options: { id: string; name: string }[]; value: string | null; onChange: (id: string | null) => void; labelHidden?: boolean }) {
  const id = useId();
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <label htmlFor={id} className={labelHidden ? "sr-only" : "text-muted-foreground"}>
        {label}
        {labelHidden ? "" : ":"}
      </label>
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="min-h-target max-w-48 truncate bg-transparent font-medium text-foreground rounded-md px-1 hover:bg-accent/50 cursor-pointer">
        {all !== undefined && <option value="">{all}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </span>
  );
}

/** A choice from a list of names in a native select: a label above, an optional "none" first option, an optional help line under. The default for picking one item out of many (an account, a provider). */
export function SelectField({ label, options, value, onChange, none, help, mark, wide, className }: { label: ReactNode; options: { id: string; name: string }[]; value: string | null; onChange: (id: string | null) => void; /** The first option, chosen when `value` is null ("not chosen"); without it the list has no empty choice. */ none?: string; help?: ReactNode; /** A `HelpMark` after the label, outside it, so the field's spoken name stays the label alone: what the choice does, said once in its "?". */ mark?: ReactNode; /** The list fills the width, as a text field beside it does (a phone's controls over a list). */ wide?: boolean; className?: string }) {
  const id = useId();
  return (
    <div className={cx("flex flex-col gap-1", wide ? null : "max-w-measure", className)}>
      <span className="text-sm font-medium">
        <label htmlFor={id}>{label}</label>
        {mark && <> {mark}</>}
      </span>
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={cx("h-field rounded-md bg-card border border-input px-3", wide ? "w-full" : "max-w-72")}>
        {none !== undefined && <option value="">{none}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {help && <span className="text-sm text-muted-foreground">{help}</span>}
    </div>
  );
}
