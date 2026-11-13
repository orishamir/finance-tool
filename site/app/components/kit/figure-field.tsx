// A figure the person types where it stands (a fee's rate in a row, a bound in a panel), drawn in its number state, and a month typed the
// same way. Unlike a chart's field (NumberField), whose default and typed value look alike, a figure here is the person's record of a
// price: typed by them it is entered (blue ink on a blue highlight); filled from a price list or a track and left as it was, it is sourced
// (the solid grey line under the digits) and its source opens from the mark beside it (design.md, the number states).
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { kit as kitCopy, values as valuesCopy } from "../../copy";
import { formatTyped, parseNumber } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { IconFile } from "../icons";
import { useOpen, valueItem } from "../provenance";
import { cx } from "./cx";

/**
 * The box of a typed figure or month: its edge, fill and ink say whose the value is. A box whose text is not a value takes the error look
 * alone (the danger edge on the card's fill), never the entered blue: what it holds is not what the page reads. The whole box takes the
 * pointer as its field (`focusInBox`).
 */
function boxLook(state: "entered" | "sourced" | "empty", error: boolean, tight?: boolean): string {
  return cx(
    "inline-flex items-center min-h-target rounded-md border tabular-nums cursor-text focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1",
    tight ? "gap-0.5 px-1.5 text-[15px]" : "gap-1 px-2.5",
    error && "bg-card text-foreground border-destructive",
    !error && state === "entered" && "bg-entered-subtle text-entered border-entered/50",
    !error && state === "sourced" && "bg-card text-foreground border-input",
    !error && state === "empty" && "bg-card text-foreground border-input border-dashed",
  );
}

/**
 * A press anywhere in a box (its padding, its unit, the words in it) goes to its field, and a press that brings the focus into the field
 * selects what it holds, as Tab does, so typing replaces it; a press in a field that already has the focus places the caret. A choice in
 * the box (a bound's currency) keeps its own press.
 */
function focusInBox(e: MouseEvent<HTMLElement>) {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement;
  if (target.closest("select, button, a")) return;
  const input = e.currentTarget.querySelector<HTMLInputElement>("input[data-figure]");
  if (!input || document.activeElement === input) return;
  e.preventDefault();
  input.focus();
  input.select();
}

/**
 * Enter in a figure's or a month's field moves to the next field of its group (the nearest `[data-figures]` around it: a fee's card, a
 * price in the panel), and from the last to the group's `[data-figures-back]` (the card itself), else nowhere.
 */
function enterToNext(input: HTMLInputElement) {
  const group = input.closest<HTMLElement>("[data-figures]");
  if (!group) return;
  const all = [...group.querySelectorAll<HTMLInputElement>("input[data-figure]")];
  const next = all[all.indexOf(input) + 1];
  if (next) {
    next.focus();
    next.select();
  } else group.querySelector<HTMLElement>("[data-figures-back]")?.focus();
}

/** A step of the arrow keys from `n`: up or down by `step`, never below zero, rounded to the step's decimals or `n`'s own, the more. */
export function stepped(n: number, step: number, up: boolean): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)), (String(n).split(".")[1] ?? "").length);
  const next = Math.max(0, n + (up ? step : -step));
  return Number(next.toFixed(decimals));
}

/** The signs a figure may be typed with: a currency's or a percent. */
const SIGNS = /[₪$€£%]/g;

/**
 * A number as typed in a box whose unit's sign is `sign`: that sign may be typed with it, any other sign makes it no number; the rest is
 * `parseNumber`'s.
 */
export function parseInBox(text: string, sign: string | undefined): number {
  const signs = text.match(SIGNS) ?? [];
  if (signs.some((s) => s !== sign)) return Number.NaN;
  return parseNumber(text.replace(SIGNS, ""));
}

/**
 * What a figure's box does with its text: commits a number; waits, while the person is still in the box, where the box is empty or the
 * number ends in its separator ("0,", which commits the number before it); clears the figure where the box is left empty and the figure
 * may be cleared; else says what is wrong.
 */
export type Typed = { kind: "commit"; n: number } | { kind: "wait" } | { kind: "clear" } | { kind: "error"; message: ReactNode };

export function readTyped(text: string, { sign, validate, clearable, left }: { sign?: string; validate?: (n: number) => ReactNode | null; clearable: boolean; left: boolean }): Typed {
  const t = text.trim();
  if (t === "") return !left ? { kind: "wait" } : clearable ? { kind: "clear" } : { kind: "error", message: valuesCopy.errors.nan };
  const n = parseInBox(/\d[.,]$/.test(t) ? t.slice(0, -1) : t, sign);
  if (Number.isNaN(n)) return { kind: "error", message: valuesCopy.errors.nan };
  const err = validate?.(n) ?? null;
  return err ? { kind: "error", message: err } : { kind: "commit", n };
}

/**
 * An input as wide as what it holds, so a short figure takes a short box and a long one never cuts. A tight box is as wide as its own
 * characters where the browser sizes a field to its content (`field-sizing`), the width in `ch` being only the fallback: a digit is
 * narrower than a `ch` and a point much narrower.
 */
const widthOf = (text: string, placeholder: string | undefined, tight?: boolean) => `${Math.max(tight && text ? text.length : Math.max(text.length, placeholder?.length ?? 0), tight ? 1 : 2) + (tight ? 0.15 : 0.5)}ch`;
const FIT = "min-w-[1ch] supports-[field-sizing:content]:[field-sizing:content] supports-[field-sizing:content]:!w-auto";

/**
 * A figure typed in place: the box holds the number and its unit ("%", "₪"), `words` follow it ("מכל פעולה"), or stand in the box after the
 * unit where `inside` says so (a row of a list, "[0.25% מכל פעולה]"). The unit may be a choice of its own (a bound's currency, "₪ ▾": an
 * `InlineSelect` with its label hidden). `value` is the figure as the
 * page shows it, a value object whose state is the box's look: entered or sourced; null for an optional figure not given, a dashed box.
 * A sourced figure carries a document mark that opens its source; once the person types over it, the caller makes it entered. Each valid
 * number commits as it is typed (`readTyped`); one that fails `validate` (or is not a number) stays in the box with its message under it,
 * takes the error look and changes nothing, until it is fixed. A number ending in its separator ("0,") is no error while the person is in
 * the box. `sign` is the unit's sign the box accepts typed with the number; any other sign is no number. With `onClear`, a box left empty
 * clears the figure; emptied, it changes nothing until it is left. Escape puts back what the box held when it took the focus (through
 * `onRevert` where the caller keeps more of it than the number, such as its source) and keeps the focus; in a box as it was then, Escape
 * goes on to what is around it (a panel closes). Decimals are allowed: a price list's fee keeps its agorot. The up and down arrows step
 * the figure by `step`, never below zero, keeping the decimals typed, and do nothing in an empty box; Enter moves to the next field of
 * its group (`enterToNext`). The figure is written in the site's form once the person leaves the box.
 */
export function FigureField({ value, label, unit, sign, words, inside, tight, onCommit, onClear, onFocus, onRevert, validate, placeholder, step, id: givenId, className }: {
  value: SiteValue | null;
  /** The spoken name: what the figure is. */
  label: string;
  /** The unit drawn in the box, after the number: its sign, or a choice of it. */
  unit?: ReactNode;
  /** The unit's sign, which may be typed with the number ("%", "$"). */
  sign?: string;
  /** Words after the box. */
  words?: ReactNode;
  /** The words in the box, after the unit, in the muted ink. */
  inside?: boolean;
  /** Less room inside the box, for boxes that stand side by side in a narrow card (a fee's row); the box keeps its 44 px height. */
  tight?: boolean;
  onCommit: (n: number) => void;
  /** An optional figure: a box left empty clears it. */
  onClear?: () => void;
  /** The box takes the focus: what it holds now is what Escape puts back. */
  onFocus?: () => void;
  /** Escape puts back what the box held when it took the focus; without it, the box commits that number again, or clears an empty one. */
  onRevert?: () => void;
  validate?: (n: number) => ReactNode | null;
  placeholder?: string;
  /** What the up and down arrows add or take away (0.01 for a percent, 1 for a sum); without it they do nothing. */
  step?: number;
  /** The field's own id, for a page that gives it the focus. */
  id?: string;
  className?: string;
}) {
  const ownId = useId();
  const id = givenId ?? ownId;
  const open = useOpen();
  const shown = typeof value?.value === "number" ? formatTyped(value.value) : "";
  const [text, setText] = useState(shown);
  const [error, setError] = useState<ReactNode | null>(null);
  const focused = useRef(false);
  // what the box held when it took the focus, which Escape puts back
  const atFocus = useRef(shown);
  // a value from outside (a template, a reset, another field) replaces the text, but never under the person's fingers
  useEffect(() => {
    if (!focused.current) {
      setText(shown);
      setError(null);
    }
  }, [shown]);
  const read = (t: string, left: boolean) => readTyped(t, { sign, validate, clearable: !!onClear, left });
  const change = (t: string) => {
    setText(t);
    const r = read(t, false);
    setError(r.kind === "error" ? r.message : null);
    if (r.kind === "commit") onCommit(r.n);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && (error || text.trim() !== atFocus.current)) {
      // what the box held when it took the focus comes back; the Escape stops here, so a panel around the box stays open
      e.preventDefault();
      e.stopPropagation();
      const back = atFocus.current;
      setText(back);
      setError(null);
      if (onRevert) onRevert();
      else if (back === "") onClear?.();
      else onCommit(parseNumber(back));
    } else if (e.key === "Enter") {
      e.preventDefault();
      enterToNext(e.currentTarget);
    } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && step) {
      if (text.trim() === "") return;
      e.preventDefault();
      const now = parseInBox(text, sign);
      if (Number.isNaN(now)) return;
      change(formatTyped(stepped(now, step, e.key === "ArrowUp")));
    }
  };
  const state = value === null ? "empty" : value.state === "sourced" ? "sourced" : "entered";
  return (
    <span className={cx("inline-flex flex-col gap-0.5 align-middle", className)}>
      <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className={boxLook(state, !!error, tight)} data-lift="" onMouseDown={focusInBox}>
          <input
            id={id}
            data-figure=""
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={text}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            onChange={(e) => change(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => {
              focused.current = true;
              atFocus.current = text.trim();
              onFocus?.();
            }}
            onBlur={() => {
              focused.current = false;
              const r = read(text, true);
              if (r.kind === "clear") {
                if (value !== null) onClear?.();
              } else if (r.kind === "error") setError(r.message);
              else setText(shown);
            }}
            style={{ width: widthOf(text, placeholder, tight) }}
            className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", tight && FIT, state === "sourced" && "underline decoration-sourced decoration-1 underline-offset-4")}
          />
          {unit && <span className="text-sm opacity-80">{unit}</span>}
          {inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
        </span>
        {state === "sourced" && value && (
          <button type="button" aria-label={kitCopy.figure.source(label)} onClick={(e) => open(valueItem(value, undefined, true), e.currentTarget)} className="tap-area inline-flex items-center rounded-sm text-muted-foreground hover:text-foreground">
            <IconFile size={16} />
          </button>
        )}
        {!inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
      </span>
      {error && (
        <span id={`${id}-err`} className="text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}

/** A month as the person types it: "3.2027", "03/2027", "3.27" (a year of two digits is in this century) or "2027-03"; null where it is not one. */
export function parseMonth(text: string): string | null {
  const t = text.trim();
  let m = /^(\d{1,2})\s*[./-]\s*(\d{4}|\d{2})$/.exec(t);
  if (m) return Number(m[1]) >= 1 && Number(m[1]) <= 12 ? `${m[2]!.length === 2 ? `20${m[2]}` : m[2]}-${m[1]!.padStart(2, "0")}` : null;
  m = /^(\d{4})-(\d{1,2})$/.exec(t);
  if (m) return Number(m[2]) >= 1 && Number(m[2]) <= 12 ? `${m[1]}-${m[2]!.padStart(2, "0")}` : null;
  return null;
}

/** A month key as the box writes it: `03.2027`. */
export const monthText = (key: string) => `${key.slice(5, 7)}.${key.slice(0, 4)}`;

/**
 * A month typed in place, in the box `FigureField` draws: the person writes "03.2027" (or "3/2027"), and the box keeps it in that form.
 * Typed by the person, so entered; empty and dashed until given. A native month input is not used: two of the browsers the site meets
 * draw it as plain text with no form, and the site writes a month as `03.2027` everywhere it is a field's value (design-system 2.7).
 * It commits when the person leaves it or presses Enter, and Enter then moves on as in `FigureField`; with `onClear`, an empty box clears
 * the month, and without it an empty box asks for nothing (`waits`) or says what to write. A box that holds no month takes the error look,
 * and Escape puts back the last month. `lead`: words in the box before the month, so a price that holds until a month is one box ("[חינם
 * עד 03.2028]"). `hang`: the message hangs under the box over what is below, taking no room, for a box in a bar whose line must not grow.
 */
export function MonthField({ value, label, lead, tight, onCommit, onClear, waits, hang, autoFocus, className }: {
  value: string | null;
  label: string;
  lead?: ReactNode;
  /** As `FigureField`'s. */
  tight?: boolean;
  onCommit: (month: string) => void;
  onClear?: () => void;
  /** An empty box is no error: the month is still to come (a later price waits for it). */
  waits?: boolean;
  hang?: boolean;
  /** The field takes the focus when it appears (a choice just asked for the month). */
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const shown = value ? monthText(value) : "";
  const [text, setText] = useState(shown);
  const [error, setError] = useState(false);
  const focused = useRef(false);
  const committed = useRef<string | null>(null);
  useEffect(() => {
    committed.current = null;
    if (!focused.current) {
      setText(shown);
      setError(false);
    }
  }, [shown]);
  const commit = () => {
    if (text.trim() === "") {
      setError(!onClear && !waits);
      if (onClear && value !== null) onClear();
      return;
    }
    const m = parseMonth(text);
    setError(m === null);
    if (m !== null) {
      setText(monthText(m));
      // Enter commits and moves the focus, whose blur commits again before the page has drawn the month: one commit per month typed
      if (m !== value && m !== committed.current) onCommit(m);
      committed.current = m;
    }
  };
  const placeholder = kitCopy.figure.monthPlaceholder;
  return (
    <span className={cx("inline-flex flex-col gap-0.5 align-middle", hang && "relative", className)}>
      <span className={boxLook(value === null ? "empty" : "entered", error, tight)} data-lift="" onMouseDown={focusInBox}>
        {lead && <span className="text-sm">{lead}</span>}
        <input
          id={id}
          data-figure=""
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={text}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false;
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              if (parseMonth(text) !== null || (text.trim() === "" && (onClear || waits))) enterToNext(e.currentTarget);
            } else if (e.key === "Escape" && (error || text !== shown)) {
              e.preventDefault();
              e.stopPropagation();
              setText(shown);
              setError(false);
            }
          }}
          style={{ width: widthOf(text, placeholder, tight) }}
          className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", tight && FIT)}
        />
      </span>
      {error && (
        <span id={`${id}-err`} className={cx("text-xs text-destructive", hang && "absolute start-0 top-full z-10 mt-0.5 whitespace-nowrap")}>
          {kitCopy.figure.monthError}
        </span>
      )}
    </span>
  );
}
