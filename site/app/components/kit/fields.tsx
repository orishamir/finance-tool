// The inputs behind the graph (design-spec 4, design-system 3.3): number field, range field (slider and number), percent field, and the
// reset each field carries on its label line.
import { useEffect, useId, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { buttons, values as copy } from "../../copy";
import { fmt, formatTyped, parseNumber, unitWord } from "../../lib/format";
import { IconChevronDown, IconClose, IconReset, IconSearch } from "../icons";
import { cx } from "./cx";
import { useErrorRest } from "./error-rest";
import { NameStack, useListSelect, type ListOption } from "./list-select";
import { placeOf, stepFrom, valueAt, type SliderScale } from "./slider-scale";

export interface FieldProps {
  label: ReactNode;
  unit: string;
  /** The value the engine currently uses (P-05 or entered). */
  value: number | null;
  /** The reader typed the value (it is not the start value). It changes nothing in the field's look: what the reader types looks the same as the default. */
  isEntered: boolean;
  /**
   * The value the field starts at, its default: the reset on the label line goes back to it ("חזרה ל־{start}" on a number field, "איפוס" on
   * a slider) and shows while the value differs from it. `null`: there is nothing to go back to (no reset). Left out: the reset shows while
   * `isEntered`, in general words.
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
  /** Compact only: the box as wide as its figure rather than the slider's 152 px, for a short price that stands beside a sentence. */
  fit?: boolean;
  /** An empty field is allowed and clears the value (optional fields such as age); without a `start` it has no reset. */
  optional?: boolean;
  inputMode?: "decimal" | "numeric";
  /** A price that may have agorot (a fee from a price list, "9.90 ₪"). Without it, a shekel field takes whole shekels only. */
  agorot?: boolean;
  /** Thousands separators while the reader types ("10,000" as the last zero goes in), not only when the field is left; whole amounts only. */
  groupAsTyped?: boolean;
  autoFocus?: boolean;
  /** The box's own id, for a control elsewhere that moves the focus to it (an `EmptyState`'s action); a generated one without it. */
  inputId?: string;
  /** An error that comes from another field's value (for example "kept available" above "amount now"); shown when the field has no error of its own. */
  externalError?: ReactNode | null;
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
 * The reset at the far end of a field's label line: small and muted. A number field's says the value it returns to, "↺ חזרה ל־10"
 * (`figure`); a slider's says "↺ איפוס" alone, its value shown once in the box, and names the value only in its spoken name, "איפוס ל־10,000 ₪"
 * (`word`). It holds its place while it is hidden (`invisible` also takes it out of the tab order and what a screen reader reads), so nothing
 * moves when it comes or goes; its tap area reaches 44 px past its small text.
 */
function ResetToStart({ shown, start, unit, onReset, describedBy, words = "figure", className }: { shown: boolean; start?: number | null; unit: string; onReset: () => void; /** The label's id: the reset is spoken with the field's name. */ describedBy?: string; words?: "figure" | "word"; className?: string }) {
  const word = words === "word";
  return (
    <button
      type="button"
      onClick={onReset}
      aria-describedby={describedBy}
      // a figure in an attribute can't hold <bdi>: the isolates keep "10,000 ₪" whole inside the Hebrew
      aria-label={word && typeof start === "number" ? `${buttons.resetWordTo}\u2068${startText(start, unit)}\u2069` : undefined}
      className={cx("tap-area shrink-0 inline-flex items-center gap-1 text-xs leading-5 font-normal text-muted-foreground hover:text-foreground whitespace-nowrap", !shown && "invisible", className)}
    >
      <IconReset size={14} aria-hidden="true" />
      {word ? (
        <span>{buttons.resetWord}</span>
      ) : typeof start === "number" ? (
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

/** A unit that is a sign (₪, $, €, £, %): it stands on the number's right in the box, as the page writes a figure ("100,000 ₪"); a unit in words follows the number in reading order. */
const SIGN = /^[₪$€£%]$/;

/**
 * What a number field holds while the person types in it, and its box. Every keystroke is read: a right value is committed at once, so the
 * page answers as the person types; a wrong one is not, so the page keeps the last right result. The text is what was typed while the box
 * has the focus, and stays after it is left while it is wrong, with its error, until the value changes from outside; otherwise it is the
 * value as the field writes it. The error shows once the hand rests (`useErrorRest`) and clears on the keystroke that puts it right.
 * `unitShown: false` leaves the unit out of the box, where the label beside it already names it ("שנים").
 */
function useNumberEntry(props: FieldProps, { unitShown = true }: { unitShown?: boolean } = {}) {
  const { unit, value, validate, onCommit, onReset, placeholder, disabled, compact, fit, optional, inputMode: mode = "decimal", autoFocus, inputId, externalError = null, agorot, groupAsTyped, hint } = props;
  // an amount of money is typed in whole shekels; a rate (interest, inflation, a return) and a price-list fee keep decimals
  const whole = /^nis/.test(unit) && !agorot;
  const inputMode = whole ? "numeric" : mode;

  const generated = useId();
  const ids = inputId ?? generated;
  // what was typed, and the value it was left at (`base`, set when the box is left): a wrong text left in the box stays until the value moves
  const [draft, setDraft] = useState<{ text: string; base?: number | null } | null>(null);
  const [focused, setFocused] = useState(false);
  const errorRest = useErrorRest();
  const written = value === null ? "" : formatTyped(value);
  const own = draft !== null && (focused || draft.base === value);
  const text = own ? draft.text : written;
  const check = (t: string): ReactNode | null => {
    if (t.trim() === "" && optional) return null;
    const n = parseNumber(t);
    return Number.isNaN(n) ? copy.errors.nan : whole && !Number.isInteger(n) ? copy.errors.whole : validate(n);
  };
  const wrong = own ? check(text) : null;
  const shownError = (errorRest.shows ? wrong : null) ?? externalError;
  // text typed before the script arrived sits in the pre-rendered input; take it in at the first commit instead of
  // letting the first render with the field's own text wipe it. A box that has the focus then is being typed in: its text is the
  // person's from here, as after a focus (its focus came before the script, so no focus event says so). A box typed in and left before
  // then is taken in as typed and left: a right text is committed, a wrong one stays with its error
  const inputRef = useRef<HTMLInputElement>(null);
  const adopted = useRef(false);
  useEffect(() => {
    if (adopted.current) return;
    adopted.current = true;
    const el = inputRef.current;
    if (!el) return;
    const typed = el.value;
    if (el === document.activeElement) {
      setFocused(true);
      if (typed !== written) change(typed);
      else setDraft({ text: typed });
    } else if (typed !== written) {
      const t = change(typed);
      if (check(t)) {
        setDraft({ text: t, base: value });
        errorRest.rest();
      } else setDraft(null);
    }
  }, []);
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
  /** Takes in a text as typed, committing it where it is right; returns the text as the box holds it. */
  function change(raw: string, at?: number | null): string {
    let t = raw;
    if (groupAsTyped && whole && /^[\d,\s]*$/.test(raw)) {
      const digits = raw.replace(/\D/g, "");
      t = digits === "" ? "" : formatTyped(Number(digits));
      if (at !== undefined && at !== null) caret.current = raw.slice(0, at).replace(/\D/g, "").length;
    }
    setDraft({ text: t });
    const err = check(t);
    errorRest.typed(!err);
    if (err) return t;
    if (t.trim() === "") onReset();
    else onCommit(parseNumber(t));
    return t;
  }
  const box = (
    <div className={cx("field-box", unitShown && SIGN.test(unitWord(unit)) && "field-box-sign", compact && "field-box-compact", compact && fit && "field-box-fit", shownError ? "field-box-error" : false, disabled && "opacity-60")}>
      <input
        ref={inputRef}
        id={ids}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        dir="ltr"
        value={text}
        placeholder={disabled ? copy.loading : placeholder}
        disabled={disabled}
        aria-invalid={shownError ? true : undefined}
        // wrong as typed, before its error shows: a form's Save reads it, so it never takes a field's last right value in silence
        data-wrong={wrong ? "" : undefined}
        aria-describedby={[hint ? `${ids}-hint` : null, shownError ? `${ids}-err` : null].filter(Boolean).join(" ") || undefined}
        onChange={(e) => change(e.target.value, e.target.selectionStart)}
        onFocus={() => {
          setFocused(true);
          // an error shown for a text a value from outside has since replaced is gone with it: the next wrong keystroke waits for a rest
          if (!own) errorRest.clear();
          // the text as it stands is the person's from here: a value from outside does not change it under their fingers
          setDraft({ text });
        }}
        onBlur={() => {
          setFocused(false);
          // a wrong text stays, with its error, until the value changes; a right one is written in the field's form
          if (wrong) {
            setDraft({ text, base: value });
            errorRest.rest();
          } else setDraft(null);
        }}
        autoFocus={autoFocus}
        className="field-input"
      />
      {unitShown && <span className="field-unit">{unitWord(unit)}</span>}
    </div>
  );
  return { ids, box, shownError };
}

/** A box for one typed number, with its unit, hint and error, and the reset on its label line. The default for any number the reader may change. */
export function NumberField(props: FieldProps) {
  const { label, hint, note, compact, onReset, start, unit } = props;
  const { ids, box, shownError } = useNumberEntry(props);
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

export type RangeFieldProps = FieldProps & {
  /** How the track maps to values: linear (`linearScale`: years, a return) or in steps that grow along it (`steppedScale`: money). */
  scale: SliderScale;
};

/** Whether the label already names the field's unit in words ("שנים" for years), so the box beside it need not say it again. */
function labelNamesUnit(label: ReactNode, unit: string): boolean {
  const word = unitWord(unit);
  return typeof label === "string" && word !== "" && !SIGN.test(word) && label.includes(word);
}

/**
 * A number and a slider for it, together: the label, its reset and the box on one row, the slider under them. For a quantity with a natural
 * range (years, a monthly deposit). The slider runs left to right, as a chart's time axis does, and shows its value once, in the box: no
 * values at its ends. The box leaves out a unit the label names. The reset sits at the far end of the label, beside the box, says "↺ איפוס"
 * with the value it returns to only in its spoken name, and keeps its place while hidden; where the row is too narrow for both it takes a
 * second line in the same row, so nothing moves when it comes. The box's error takes the reset's place while it lasts, so no line opens
 * under the box; it is shown, not spoken on every keystroke.
 */
export function RangeField(props: RangeFieldProps) {
  const { label, unit, value, onCommit, disabled, onReset, start, scale } = props;
  const id = useId();
  const { ids, box, shownError } = useNumberEntry({ ...props, compact: true }, { unitShown: !labelNamesUnit(label, unit) });
  return (
    <div className="field range-field">
      <div className="flex items-center justify-between gap-3 min-h-target">
        <span className="flex flex-wrap items-center gap-x-2 min-w-0 flex-1">
          <span className="field-label min-w-0" id={`${id}-l`}>
            {label}
          </span>
          {shownError ? (
            <span id={`${ids}-err`} className="ms-auto text-xs leading-5 text-destructive">
              {shownError}
            </span>
          ) : (
            resetKept(props) && <ResetToStart shown={resetShown(props)} start={start} unit={unit} onReset={onReset} describedBy={`${id}-l`} words="word" className="ms-auto" />
          )}
        </span>
        <div className="flex flex-col gap-1 items-end">
          <label htmlFor={ids} className="sr-only">
            {label}
          </label>
          {box}
        </div>
      </div>
      <ScaleSlider scale={scale} value={value} unit={unit} labelledBy={`${id}-l`} disabled={disabled} onCommit={onCommit} />
    </div>
  );
}

/** How far Page Up and Page Down carry a slider: a tenth of its track. */
const PAGE = 0.1;

/**
 * The slider: left to right, the native range holding the place on the track (0 to 1, any step) rather than the value, so a value off the
 * steps sits at its own place; a drag gives the nearest step, and the keys move one step of the scale (the browser's own step for "any" is
 * a hundredth of the track, less than a step, which the snap would undo). Its spoken value is the value as the box writes it.
 */
function ScaleSlider({ scale, value, unit, labelledBy, disabled, onCommit }: { scale: SliderScale; value: number | null; unit: string; labelledBy: string; disabled?: boolean; onCommit: (n: number) => void }) {
  const at = value ?? scale.min;
  const place = placeOf(scale, at);
  const move = (n: number) => {
    if (n !== value) onCommit(n);
  };
  const keyed: Record<string, () => number> = {
    ArrowRight: () => stepFrom(scale, at, 1),
    ArrowUp: () => stepFrom(scale, at, 1),
    ArrowLeft: () => stepFrom(scale, at, -1),
    ArrowDown: () => stepFrom(scale, at, -1),
    PageUp: () => valueAt(scale, place + PAGE),
    PageDown: () => valueAt(scale, place - PAGE),
    Home: () => scale.min,
    End: () => scale.max,
  };
  return (
    <input
      type="range"
      dir="ltr"
      className="slider"
      aria-labelledby={labelledBy}
      aria-valuetext={startText(at, unit)}
      min={0}
      max={1}
      step="any"
      value={place}
      disabled={disabled}
      style={{ "--fill": `${place * 100}%` } as CSSProperties}
      onChange={(e) => move(valueAt(scale, Number(e.target.value)))}
      onKeyDown={(e) => {
        const key = keyed[e.key];
        if (!key) return;
        e.preventDefault();
        move(key());
      }}
    />
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
    <div className={cx("field-box text-muted-foreground", big && "h-14 border-primary bg-card text-base lg:text-lg", big && !compact && "lg:h-16")}>
      <IconSearch size={big ? 20 : 18} aria-hidden="true" />
      <input ref={setRef} id={id} type="text" dir="rtl" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value, e.currentTarget)} className="field-input text-mixed text-foreground" {...input} />
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
 * facts (the fee page's bar: "העסקה [חשבון המסחר שלי]"). `icon`: a mark in the box after the words, in the muted ink, that says the
 * words can be typed over (the pencil of the fee page's deal name). `grow`, with `inline`: the box takes the free space of its line, from its
 * usual width on, and words too long for it end in an ellipsis while it is not being typed in; the words keep their own direction, so a
 * cut never shows half of a bracket pair. `labelHidden`: the label is spoken, not shown, where the box stands in the place of what it names
 * (the fee page's panel, whose heading is the name of a fee of the person's own, typed in place).
 */
export function TextField({ label, value, onChange, hint, error, placeholder, maxLength, dir = "rtl", inline, grow, icon, labelHidden, className }: { label: ReactNode; value: string; onChange: (v: string) => void; hint?: ReactNode; error?: ReactNode | null; placeholder?: string; maxLength?: number; /** `ltr` for an identifier. */ dir?: "rtl" | "ltr"; inline?: boolean; grow?: boolean; icon?: ReactNode; labelHidden?: boolean; className?: string }) {
  const id = useId();
  return (
    <div className={cx(inline ? cx("flex items-center gap-2", grow ? "min-w-0 flex-1" : "flex-wrap") : "field", className)}>
      <label htmlFor={id} className={labelHidden ? "sr-only" : inline ? "text-sm text-muted-foreground" : "field-label"}>
        {label}
      </label>
      <div className={cx("field-body", grow && "min-w-0 flex-1")}>
        <div className={cx("field-box", inline && "field-box-compact max-w-full", inline && (grow ? "w-full min-w-56" : "w-56"), error ? "field-box-error" : false)}>
          <input id={id} type="text" dir={dir} value={value} placeholder={placeholder} maxLength={maxLength} autoComplete="off" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} onChange={(e) => onChange(e.target.value)} className={cx("field-input text-mixed", inline && "font-semibold", grow && "text-ellipsis focus:text-clip")} />
          {icon && (
            <span aria-hidden="true" className="inline-flex shrink-0 text-muted-foreground">
              {icon}
            </span>
          )}
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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-primary" />
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
 * A choice that sits in a line of other controls (a tab line's filters): "מוצר: הכול", the label and the chosen name, no field box, the
 * kit's own list under it (`useListSelect`: a select-only combobox, by the keys as by the pointer). `all` is the first option, chosen when
 * `value` is null; without it one of the options is always chosen. `labelHidden` keeps the label for a screen reader only, where the words
 * around the choice already say what it chooses (a price's period beside its rate: "0.6% לשנה"). `chip`: a soft-filled chip with a muted
 * chevron, no outline and 8 px corners, its label for a screen reader only, a choice made in place beside a figure (a price's currency
 * "$ ▾", its period "לרבעון ▾"), 44 px tall; a chosen value in the entered blue, or plain where a template filled it (`plain`), while
 * nothing is chosen `all` in the muted ink, and `all` is then no option of the list. Either way the button is as wide as its longest name (`NameStack`), so it keeps
 * one width whichever is chosen.
 */
export function InlineSelect({ label, all, options, value, onChange, labelHidden, chip, plain }: { label: string; all?: string; options: { id: string; name: string }[]; value: string | null; onChange: (id: string | null) => void; labelHidden?: boolean; chip?: boolean; /** A chip whose value a template filled, drawn plain until the person changes it. */ plain?: boolean }) {
  // a chip's `all` only says nothing is chosen yet; a line's is an option, the one that chooses none
  const list: ListOption[] = chip || all === undefined ? options : [{ id: null, name: all }, ...options];
  const s = useListSelect({ options: list, value, onChange });
  const names = list.map((o) => o.name);
  const at = list.findIndex((o) => o.id === value);
  // a chip with nothing chosen shows `all`, which its list does not hold: it stands first in the stack
  const stack = at < 0 && all !== undefined && chip ? { names: [all, ...names], at: 0 } : { names, at: Math.max(at, 0) };
  const chevron = <IconChevronDown size={16} aria-hidden="true" className={cx("shrink-0 text-muted-foreground transition-transform duration-(--duration-fast)", s.open && "rotate-180")} />;
  if (chip) {
    return (
      <span className="inline-flex max-w-full">
        <label id={s.labelId} htmlFor={s.buttonId} className="sr-only">
          {label}
        </label>
        <button
          {...s.button}
          className={cx(
            "inline-flex min-h-target max-w-full items-center gap-2 rounded-md bg-secondary ps-3 pe-2.5 text-sm transition-colors duration-(--duration-fast) hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring",
            value === null && "text-muted-foreground",
          )}
        >
          <NameStack names={stack.names} at={stack.at} className={cx(value !== null && (plain ? "font-medium text-foreground" : "font-medium text-entered"))} />
          {chevron}
        </button>
        {s.list}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <label id={s.labelId} htmlFor={s.buttonId} className={labelHidden ? "sr-only" : "text-muted-foreground"}>
        {label}
        {labelHidden ? "" : ":"}
      </label>
      <button {...s.button} className="inline-flex min-h-target max-w-48 items-center gap-1 rounded-md ps-1 pe-0.5 font-medium text-foreground hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring">
        <NameStack names={stack.names} at={stack.at} />
        {chevron}
      </button>
      {s.list}
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
