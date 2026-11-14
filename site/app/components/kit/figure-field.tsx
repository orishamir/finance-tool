// A figure the person types where it stands (a fee's rate in a row, a bound in a panel), drawn in its number state, and a month in the
// same box, chosen from its picker or typed. Unlike a chart's field (NumberField), whose default and typed value look alike, a figure here is the person's record of a
// price: typed by them it is entered (blue ink on a blue highlight); filled from a price list or a track and left as it was, it is sourced
// (the solid grey line under the digits), and the focus in its box (a press or the keyboard) opens a note under it of where it is from,
// with its source a tap away (design.md, the number states).
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { kit as kitCopy, values as valuesCopy } from "../../copy";
import { formatTyped, parseNumber } from "../../lib/format";
import { useMedia } from "../../lib/hooks";
import type { SiteValue } from "../../lib/value";
import { IconCalendar } from "../icons";
import { useOpen, valueItem } from "../provenance";
import { Button } from "./button";
import { cx } from "./cx";
import { MonthPicker, pickCommit } from "./month-picker";

/**
 * The box of a typed figure or month: its edge and ink say whose the value is, on the card's fill (an entered figure has the entered
 * edge and ink, no fill of its own: a page of typed figures is not a page of blue boxes). A box whose text is not a value takes the error
 * look alone (the danger edge), never the entered ink: what it holds is not what the page reads. The whole box takes the
 * pointer as its field (`focusInBox`), and is a 44 px target both ways whatever its figure.
 */
function boxLook(state: "entered" | "sourced" | "empty", error: boolean, tight?: boolean): string {
  return cx(
    "inline-flex items-center justify-center min-h-target min-w-target rounded-md border tabular-nums cursor-text focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1",
    tight ? "gap-0.5 px-1.5 text-[15px]" : "gap-1 px-2.5",
    error && "bg-card text-foreground border-destructive",
    !error && state === "entered" && "bg-card text-entered border-entered/50",
    !error && state === "sourced" && "bg-card text-foreground border-input",
    !error && state === "empty" && "bg-card text-foreground border-input border-dashed",
  );
}

/**
 * A press anywhere in a box (its padding, its unit, the words in it) goes to its field, and a press that brings the focus into the field
 * selects what it holds, as Tab does, so typing replaces it; a press in a field that already has the focus places the caret. A choice in
 * the box (a bound's currency) keeps its own press. So the field's tap area is the box's 44 px, and the hit check (tools/hit-check.mjs)
 * measures it by the box.
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
const widthOf = (text: string, placeholder: string | undefined, tight?: boolean, least = 0) => `${Math.max(tight && text ? text.length : Math.max(text.length, placeholder?.length ?? 0), tight ? 1 : 2, least) + (tight ? 0.15 : 0.5)}ch`;
const FIT = "min-w-[1ch] supports-[field-sizing:content]:[field-sizing:content] supports-[field-sizing:content]:!w-auto";

/**
 * The box the note of a sourced figure stays inside, the row's cell the figure stands in: the nearest one marked `data-note-cell`, else the
 * nearest block around the figure.
 */
function cellOf(el: HTMLElement): HTMLElement | null {
  const marked = el.parentElement?.closest<HTMLElement>("[data-note-cell]");
  if (marked) return marked;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const d = getComputedStyle(p).display;
    if (d !== "contents" && !d.startsWith("inline")) return p;
  }
  return null;
}

/**
 * Places a figure's note under its box: no wider than the row's cell, its inline start on the box's; where it would pass the cell's far
 * edge from there, its inline start on the cell's, where the row's boxes start (a box late in its line, a flat price's "עד" sum). Measured
 * before the note is painted, so it never shows out of place.
 */
function placeNote(note: HTMLElement, field: HTMLElement) {
  const cell = cellOf(field);
  if (!cell) return;
  const c = cell.getBoundingClientRect();
  const f = field.getBoundingClientRect();
  note.style.maxWidth = `${c.width}px`;
  const w = note.getBoundingClientRect().width;
  const rtl = getComputedStyle(field).direction === "rtl";
  const fits = rtl ? f.right - w >= c.left : f.left + w <= c.right;
  const left = fits ? (rtl ? f.right - w : f.left) : rtl ? c.right - w : c.left;
  note.style.left = `${left - f.left}px`;
  note.style.right = "auto";
}

/**
 * A figure typed in place: the box holds the number and its unit ("%", "₪"), `words` follow it ("מכל פעולה"), or stand in the box after the
 * unit where `inside` says so (a row of a list, "[0.25% מכל פעולה]"). The unit may be a choice of its own (a bound's currency, "₪ ▾": an
 * `InlineSelect` with its label hidden). `value` is the figure as the
 * page shows it, a value object whose state is the box's look: entered or sourced; null for an optional figure not given, a dashed box.
 The focus in a sourced figure's box, from a press (the caret placed, as on any box) or from the keyboard, opens a small note under the
 * box, no wider than its row's cell, floating over what is below so nothing moves: `from` says where the figure is from ("מהתעריפון של
 * …"), and "למקור" after it, underlined as a link, opens the same source sheet the figure opens elsewhere on the page, so a figure no other
 * part of the page shows (a later price, a sale's, a flat price's "עד" sum) has its source within reach of the keyboard. Typing, Escape or
 * the focus leaving the box and its note closes it. Once the person types over the figure, the caller makes it entered. Each valid
 * number commits as it is typed (`readTyped`); one that fails `validate` (or is not a number) stays in the box with its message under it,
 * takes the error look and changes nothing, until it is fixed. A number ending in its separator ("0,") is no error while the person is in
 * the box. `sign` is the unit's sign the box accepts typed with the number; any other sign is no number. With `onClear`, a box left empty
 * clears the figure; emptied, it changes nothing until it is left. Escape puts back what the box held when it took the focus (through
 * `onRevert` where the caller keeps more of it than the number, such as its source) and keeps the focus; in a box as it was then, Escape
 * goes on to what is around it (a panel closes). Decimals are allowed: a price list's fee keeps its agorot. The up and down arrows step
 * the figure by `step`, never below zero, keeping the decimals typed, and do nothing in an empty box; Enter moves to the next field of
 * its group (`enterToNext`). The figure is written in the site's form once the person leaves the box.
 */
export function FigureField({ value, label, from, unit, sign, words, inside, tight, wide, onCommit, onClear, onFocus, onRevert, validate, placeholder, step, id: givenId, className }: {
  value: SiteValue | null;
  /** The spoken name: what the figure is. */
  label: string;
  /** Where a sourced figure is from, one sentence, in the note a press on its box opens; without it the note holds the source's link alone. */
  from?: ReactNode;
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
  /** Room for six characters at least, for a box that stands alone in a menu with its unit beside it (a range's top). */
  wide?: boolean;
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
  // the note of where a sourced figure is from, open from the focus in its box until typing or the focus leaves
  const [noting, setNoting] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLSpanElement>(null);
  const sourced = value?.state === "sourced" ? value : null;
  const noteOpen = noting && !!sourced;
  useLayoutEffect(() => {
    if (noteOpen && note.current && root.current) placeNote(note.current, root.current);
  }, [noteOpen]);
  // a value from outside (a template, a reset, another field) replaces the text, but never under the person's fingers
  useEffect(() => {
    if (!focused.current) {
      setText(shown);
      setError(null);
    }
  }, [shown]);
  const read = (t: string, left: boolean) => readTyped(t, { sign, validate, clearable: !!onClear, left });
  const change = (t: string) => {
    setNoting(false);
    setText(t);
    const r = read(t, false);
    setError(r.kind === "error" ? r.message : null);
    if (r.kind === "commit") onCommit(r.n);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && noteOpen && !error && text.trim() === atFocus.current) {
      // the note closes first; a second Escape goes on to what is around the box
      e.preventDefault();
      e.stopPropagation();
      setNoting(false);
    } else if (e.key === "Escape" && (error || text.trim() !== atFocus.current)) {
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
    <span
      ref={root}
      className={cx("relative inline-flex flex-col gap-0.5 align-middle", className)}
      // the focus leaving the box and its note closes the note; a press in the note keeps the focus in the box (`onMouseDown` there)
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setNoting(false);
      }}
    >
      <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span
          className={boxLook(state, !!error, tight)}
          data-lift=""
          onMouseDown={(e) => {
            focusInBox(e);
            if (e.button === 0 && sourced && !(e.target as HTMLElement).closest("select, button, a")) setNoting(true);
          }}
        >
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
              if (sourced) setNoting(true);
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
            style={{ width: widthOf(text, placeholder, tight, wide ? 6 : 0) }}
            className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", tight && FIT, state === "sourced" && "underline decoration-sourced decoration-1 underline-offset-4")}
          />
          {unit && <span className="text-sm opacity-80">{unit}</span>}
          {inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
        </span>
        {!inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
      </span>
      {noteOpen && (
        <span
          ref={note}
          className="absolute top-full z-20 mt-1 w-max text-pretty rounded-md border border-border bg-popover px-3 py-2 text-sm leading-relaxed text-foreground shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {from && <>{from} </>}
          <Button variant="inline" className="whitespace-nowrap" onClick={(e) => open(valueItem(sourced, undefined, true), e.currentTarget)}>
            {kitCopy.figure.toSource}
          </Button>
        </span>
      )}
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
 * A month in the box `FigureField` draws, chosen from a picker or typed: a calendar mark stands in the box, and a press anywhere in it
 * opens the picker (`MonthPicker`: the year and its twelve months) by the box, with the focus left in the box for typing; ArrowDown or
 * Alt+ArrowDown opens it with the focus on its month. Choosing a month commits it, closes the picker and gives the focus back to the box;
 * Escape, a press outside or Tab out of the box closes it and chooses nothing. The person may also write "03.2027" (or "3/2027"), and the
 * picker follows what is typed; the box keeps the month in that form. Typed or chosen by the person, so entered; empty and dashed until
 * given. A native month input is not used: two of the browsers the site meets draw it as plain text with no form, and the site writes a
 * month as `03.2027` everywhere it is a field's value (design-system 2.7).
 * A typed month commits when the person leaves the box or presses Enter, and Enter then moves on as in `FigureField`; with `onClear`, an
 * empty box clears the month, and without it an empty box asks for nothing (`waits`) or says what to write. A box that holds no month
 * takes the error look, and Escape puts back the last month. `earliest`, `latest`: the months the page around the box would refuse fall
 * outside them, and the picker offers none of those; what is typed goes to the page as it is. `lead`: words in the box before the month,
 * so a price that holds until a month is one box ("[חינם עד 03.2028]"). `hang`: the message hangs under the box over what is below,
 * taking no room, for a box in a bar whose line must not grow. `autoFocus`: the box takes the focus as it appears, with its picker open,
 * so the month just asked for is one press away and typing still goes to the box.
 */
export function MonthField({ value, label, lead, tight, earliest, latest, onCommit, onClear, waits, hang, autoFocus, className }: {
  value: string | null;
  label: string;
  lead?: ReactNode;
  /** As `FigureField`'s. */
  tight?: boolean;
  /** The first month the picker offers, `YYYY-MM`. */
  earliest?: string;
  /** The last month the picker offers, `YYYY-MM`. */
  latest?: string;
  onCommit: (month: string) => void;
  onClear?: () => void;
  /** An empty box is no error: the month is still to come (a later price waits for it). */
  waits?: boolean;
  hang?: boolean;
  /** The field takes the focus when it appears (a choice just asked for the month), and its picker opens. */
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const shown = value ? monthText(value) : "";
  const [text, setText] = useState(shown);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  // on a touch screen the month is chosen in the picker, which every press on the box opens: the on-screen keyboard stays down, so it
  // never covers the picker (a keyboard that is plugged in still types)
  const touch = useMedia("(pointer: coarse)");
  const root = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const focused = useRef(false);
  const committed = useRef<string | null>(null);
  // the picker just opened from the keyboard puts the focus on its month
  const intoGrid = useRef(false);
  useEffect(() => {
    committed.current = null;
    if (!focused.current) {
      setText(shown);
      setError(false);
    }
  }, [shown]);
  useEffect(() => {
    if (autoFocus) setOpen(true);
  }, [autoFocus]);
  useLayoutEffect(() => {
    if (!open || !intoGrid.current) return;
    intoGrid.current = false;
    document.getElementById(`${id}-grid`)?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [open, id]);
  // a press outside the box and its picker closes the picker, and leaves the focus where the press put it
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const toBox = () => {
    setOpen(false);
    input.current?.focus();
  };
  const pick = (m: string) => {
    setText(monthText(m));
    setError(false);
    toBox();
    // the box's own commit on leaving it, or Enter, sees the month already committed
    const c = pickCommit(m, value, {});
    if (c !== null && c !== committed.current) onCommit(c);
    committed.current = m;
  };
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
  const grid = `${id}-grid`;
  return (
    <span
      ref={root}
      className={cx("inline-flex flex-col gap-0.5 align-middle", hang && "relative", className)}
      // the focus leaving the box and its picker for another control (Enter's move to the next box, a Tab out of the picker) closes it;
      // read after the frame, where the focus has landed
      onBlur={() =>
        requestAnimationFrame(() => {
          const a = document.activeElement;
          if (a && a !== document.body && !root.current?.contains(a)) setOpen(false);
        })
      }
    >
      <span
        ref={box}
        className={boxLook(value === null ? "empty" : "entered", error, tight)}
        data-lift=""
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          // the calendar mark opens and closes the picker, and keeps the focus in the box; a press anywhere else in the box opens it
          const mark = !!(e.target as HTMLElement).closest("[data-month-mark]");
          if (mark && document.activeElement === input.current) e.preventDefault();
          focusInBox(e);
          setOpen((o) => !(o && mark));
        }}
      >
        {lead && <span className="text-sm">{lead}</span>}
        <input
          ref={input}
          id={id}
          data-figure=""
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          type="text"
          inputMode={touch ? "none" : "numeric"}
          dir="ltr"
          role="combobox"
          aria-haspopup="grid"
          aria-expanded={open}
          aria-controls={open ? grid : undefined}
          aria-autocomplete="none"
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
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (open) document.getElementById(grid)?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
              else {
                intoGrid.current = true;
                setOpen(true);
              }
            } else if (e.key === "Tab" && open) {
              // the picker is reached by ArrowDown, not by Tab: Tab goes on from the box as it would with the picker closed
              flushSync(() => setOpen(false));
            } else if (e.key === "Escape" && open) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            } else if (e.key === "Enter") {
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
        <span data-month-mark="" className="inline-flex cursor-pointer text-muted-foreground">
          <IconCalendar size={16} />
        </span>
      </span>
      {open && <MonthPicker id={grid} label={label} chosen={parseMonth(text) ?? value} bounds={{ earliest, latest }} anchor={box} onPick={pick} onClose={toBox} />}
      {error && (
        <span id={`${id}-err`} className={cx("text-xs text-destructive", hang && "absolute start-0 top-full z-10 mt-0.5 whitespace-nowrap")}>
          {kitCopy.figure.monthError}
        </span>
      )}
    </span>
  );
}
