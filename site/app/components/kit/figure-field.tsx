// A figure the person types where it stands (a fee's rate in a row, a bound in a panel), drawn in its number state, and a month in the
// same box, chosen from its picker or typed. Unlike a chart's field (NumberField), whose default and typed value look alike, a figure here is the person's record of a
// price: typed by them it is entered (blue ink on a blue highlight); filled from a price list or a track and left as it was, it is sourced
// (the solid grey line under the digits), and the focus in its box (a press or the keyboard) opens a note under it of where it is from,
// with its source a tap away (design.md, the number states).
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { kit as kitCopy, values as valuesCopy } from "../../copy";
import { formatTyped, parseNumber, type NumberKind } from "../../lib/format";
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
 * look alone (the danger edge), never the entered ink: what it holds is not what the page reads. With the focus in it the box has one
 * frame, 2 px in the focus ring's colour (its own edge turned that colour, with a 1 px outline flush on it), never an edge inside a ring
 * with a gap; a box in error keeps the danger colour in that frame. The whole box takes the pointer as its field (`focusInBox`), and is a
 * 44 px target both ways whatever its figure.
 */
function boxLook(state: "entered" | "sourced" | "empty", error: boolean, tight?: boolean): string {
  return cx(
    "inline-flex items-center justify-center min-h-target min-w-target rounded-md border tabular-nums cursor-text focus-within:outline-1 focus-within:outline-offset-0",
    error ? "focus-within:outline-destructive" : "focus-within:border-ring focus-within:border-solid focus-within:outline-ring",
    tight ? "gap-0.5 px-1.5 text-[15px]" : "gap-1 px-2.5",
    error && "bg-card text-foreground border-destructive",
    !error && state === "entered" && "bg-card text-entered border-entered/50",
    !error && state === "sourced" && "bg-card text-foreground border-input",
    !error && state === "empty" && "bg-card text-foreground border-input border-dashed",
  );
}

/**
 * A figure not given yet, at rest where its price is read (a fee's cell): the empty box `FigureField` draws for a figure not given, dashed,
 * holding only its unit's sign at the end where the number's would stand (`sign`: "%", "₪"), so the price reads as missing that figure,
 * never as whole without it. A tap on it is the figure's edit where the page puts it in one (`EditInPlace`).
 */
export function EmptyFigure({ sign }: { sign: string }) {
  return (
    <span dir="ltr" data-figure-blank="" className="inline-flex h-[1.875rem] min-w-[4.5rem] items-center justify-end rounded-md border-[1.5px] border-dashed border-input px-2.5 align-middle text-sm text-muted-foreground">
      {sign}
    </span>
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
 * Enter in a figure's or a month's field, once what it holds is kept: in a figure edited in place (`EditInPlace`, open), the edit is done
 * and the figure is back at rest (the `edit-done` event, the edit's own); else the focus moves to the next field of its group (the nearest
 * `[data-figures]` around it: a fee's card, a price in the panel, a question), and from the last one presses the group's
 * `[data-figures-enter]` (a question's "להוסיף", once the page has drawn what was typed, and only where it may be pressed), else goes to
 * the group's `[data-figures-back]` (the card itself), else nowhere.
 */
export function enterToNext(input: HTMLInputElement) {
  const inPlace = input.closest<HTMLElement>('[data-edit-in-place="open"]');
  if (inPlace) {
    inPlace.dispatchEvent(new CustomEvent("edit-done"));
    return;
  }
  const group = input.closest<HTMLElement>("[data-figures]");
  if (!group) return;
  const all = [...group.querySelectorAll<HTMLInputElement>("input[data-figure]")];
  const next = all[all.indexOf(input) + 1];
  if (next) {
    next.focus();
    next.select();
    return;
  }
  const enter = group.querySelector<HTMLButtonElement>("[data-figures-enter]");
  if (enter)
    requestAnimationFrame(() => {
      if (enter.isConnected && !enter.disabled) enter.click();
    });
  else group.querySelector<HTMLElement>("[data-figures-back]")?.focus();
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
 * `parseNumber`'s, a comma read by the figure's kind (`kind`: a percent's box reads a rate's).
 */
export function parseInBox(text: string, sign: string | undefined, kind: NumberKind = sign === "%" ? "rate" : "amount"): number {
  const signs = text.match(SIGNS) ?? [];
  if (signs.some((s) => s !== sign)) return Number.NaN;
  return parseNumber(text.replace(SIGNS, ""), kind);
}

/**
 * What a figure's box makes of its text: a number to commit; nothing yet, while the person is still in the box and it is empty; the figure
 * cleared, where the box is left empty and the figure may be cleared; the figure as it was (`back`), where the box is left empty and the
 * figure may not be; else what is wrong. A number ending in its separator ("0,") is the number before it.
 */
export type Typed = { kind: "commit"; n: number } | { kind: "wait" } | { kind: "clear" } | { kind: "back" } | { kind: "error"; message: ReactNode };

export function readTyped(text: string, { sign, kind, validate, clearable, left }: { sign?: string; kind?: NumberKind; validate?: (n: number) => ReactNode | null; clearable: boolean; left: boolean }): Typed {
  const t = text.trim();
  if (t === "") return !left ? { kind: "wait" } : clearable ? { kind: "clear" } : { kind: "back" };
  const n = parseInBox(/\d[.,]$/.test(t) ? t.slice(0, -1) : t, sign, kind);
  if (Number.isNaN(n)) return { kind: "error", message: valuesCopy.errors.nan };
  const err = validate?.(n) ?? null;
  return err ? { kind: "error", message: err } : { kind: "commit", n };
}

/**
 * What a keystroke does to the figure the page holds, by what the box makes of its whole text (`readTyped`): a number commits; while the
 * text is no number (empty, unfinished, wrong), a figure the page keeps (a deal's) is back as it was when the box took the focus, where the
 * box changed it since (`changed`), so the deal never keeps a prefix of what is being typed ("15" of "150"); and a figure a question waits
 * for (`asks`: the boundary of a "+ מדרגה") is none, so its "להוסיף" cannot add it. A box that `settles` gives its figure only when it is
 * left or Enter is pressed, so a keystroke does nothing to the page.
 */
export function onTyping(r: Typed, { asks, changed, settles = false }: { asks: boolean; changed: boolean; settles?: boolean }): "commit" | "clear" | "revert" | "none" {
  if (settles) return "none";
  if (r.kind === "commit") return "commit";
  if (asks) return "clear";
  return changed ? "revert" : "none";
}

/** How a box that `settles` gave its figure: by Enter, or by the focus leaving it. */
export type Settled = "enter" | "left";

/**
 * An input as wide as what it holds, so a short figure takes a short box and a long one never cuts. A tight box is as wide as its own
 * characters where the browser sizes a field to its content (`field-sizing`), the width in `ch` being only the fallback: a digit is
 * narrower than a `ch` and a point much narrower.
 */
const widthOf = (text: string, placeholder: string | undefined, tight?: boolean, least = 0) => `${Math.max(tight && text ? text.length : Math.max(text.length, placeholder?.length ?? 0), tight ? 1 : 2, least) + (tight ? 0.15 : 0.5)}ch`;
const FIT = "min-w-[1ch] supports-[field-sizing:content]:[field-sizing:content] supports-[field-sizing:content]:!w-auto";

/**
 * The box a sourced figure's note is measured against, the row's cell the figure stands in: the nearest one marked `data-note-cell`, else
 * its table's cell, else the nearest block around the figure.
 */
function cellOf(el: HTMLElement): HTMLElement | null {
  const marked = el.parentElement?.closest<HTMLElement>("[data-note-cell], [role=gridcell]");
  if (marked) return marked;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const d = getComputedStyle(p).display;
    if (d !== "contents" && !d.startsWith("inline")) return p;
  }
  return null;
}

/** The narrowest a figure's note is let to be, so its sentence never stands a word a line: 18rem, or the window less its margins. */
const NOTE_LEAST = 288;

/**
 * Places a figure's note under its box, in the top layer (a `popover`), so no cell or chip after it paints over it: as wide as its row's
 * cell, and never narrower than `NOTE_LEAST` nor wider than the window less 8 px each side; its inline start on the box's, moved in where it
 * would pass the window's edge. Measured before it is painted and again as the page scrolls, so it never shows out of place.
 */
function placeNote(note: HTMLElement, field: HTMLElement) {
  const box = (field.querySelector<HTMLElement>("[data-lift]") ?? field).getBoundingClientRect();
  const view = document.documentElement.clientWidth;
  const cell = cellOf(field)?.getBoundingClientRect().width ?? 0;
  note.style.maxWidth = `${Math.min(view - 16, Math.max(cell, NOTE_LEAST))}px`;
  const w = note.getBoundingClientRect().width;
  const rtl = getComputedStyle(field).direction === "rtl";
  const left = Math.max(8, Math.min(rtl ? box.right - w : box.left, view - 8 - w));
  note.style.left = `${left}px`;
  note.style.top = `${box.bottom + 4}px`;
}

/**
 * A figure typed in place: the box holds the number and its unit after it, as the page writes a figure ("0.3%", "39 ₪": the number and
 * its unit one left-to-right group, the unit on the number's right, never wrapped off it); `words` follow the box ("מכל פעולה"), or stand
 * in it after the unit where `inside` says so (a row of a list, "[0.25% מכל פעולה]"). The unit may be a choice of its own (a bound's
 * currency, "₪ ▾": an `InlineSelect` with its label hidden). `value` is the figure as the page shows it, a value object whose state is the
 * box's look: entered or sourced; null for an optional figure not given, a dashed box.
 * The focus in a sourced figure's box, from a press (the caret placed, as on any box) or from the keyboard, opens a small note under the
 * box, as wide as its row's cell at least as far as there is room, on the page's top surface over what is below so nothing moves: `from`
 * says where the figure is from ("מהתעריפון של …"), and "למקור" after it, underlined as a link, opens the same source sheet the figure opens
 * elsewhere on the page, so a figure no other part of the page shows (a later price, a sale's, a flat price's "עד" sum) has its source
 * within reach of the keyboard. Typing, Escape or the focus leaving the box and its note closes it. Once the person types over the figure,
 * the caller makes it entered.
 * Only a whole text that is a valid number commits, as it is typed (`readTyped`, `onTyping`): one that fails `validate` or is not a number
 * stays in the box with its message under it and the error look, and the figure is back as it was when the box took the focus, so
 * nothing keeps a prefix of it; Enter there keeps the focus in the box. `asks`: the figure waits for a question's button, so while the
 * text is no number it is none and the button cannot add it. A number ending in its separator ("0,") is the number before it. `sign` is
 * the unit's sign the box accepts typed with the number; any other sign is no number; `kind` says how a comma reads (a percent's box, a
 * rate's: always a decimal point). With `onClear`, a box left empty clears the figure; without it, a box left empty puts the figure back.
 * Escape puts back what the box held when it took the focus (through `onRevert` where the caller keeps more of it than the number, such
 * as its source) and keeps the focus; in a box as it was then, Escape goes on to what is around it (a panel closes). Decimals are allowed:
 * a price list's fee keeps its agorot. The up and down arrows step the figure by `step`, never below zero, keeping the decimals typed,
 * and do nothing in an empty box; Enter moves on (`enterToNext`). The figure is written in the site's form once the person leaves the box.
 * `settles`: the figure is given whole, once, when the box is left or Enter is pressed (`onCommit`'s `by` says which), never as it is
 * typed: for a box the figure takes away once given (a part that asks its amount, whose box gives way to the part), so no keystroke takes
 * the box from under the typing. Nothing given while typing, Escape only puts back the text; a box left empty or holding no number gives
 * nothing; Enter that gives the figure does not move on, as the page draws what it gave in the box's place and places the focus.
 */
export function FigureField({ value, label, from, unit, sign, kind, words, inside, tight, wide, asks, settles, onCommit, onClear, onFocus, onRevert, validate, placeholder, step, id: givenId, className }: {
  value: SiteValue | null;
  /** The spoken name: what the figure is. */
  label: string;
  /** Where a sourced figure is from, one sentence, in the note a press on its box opens; without it the note holds the source's link alone. */
  from?: ReactNode;
  /** The unit drawn in the box, after the number: its sign, or a choice of it. */
  unit?: ReactNode;
  /** The unit's sign, which may be typed with the number ("%", "$"). */
  sign?: string;
  /** How a comma typed in the box reads (`parseNumber`): a percent's box reads a rate's, any other an amount's, unless said here (a price per unit, a rate). */
  kind?: NumberKind;
  /** Words after the box. */
  words?: ReactNode;
  /** The words in the box, after the unit, in the muted ink. */
  inside?: boolean;
  /** Less room inside the box, for boxes that stand side by side in a narrow card (a fee's row); the box keeps its 44 px height. */
  tight?: boolean;
  /** Room for six characters at least, for a box that stands alone in a menu with its unit beside it (a range's top). */
  wide?: boolean;
  /** The figure waits for a question's button ("להוסיף"): while the text is no number, it is none (`onClear`). */
  asks?: boolean;
  /** The figure is given only when the box is left or Enter is pressed, with how (`by`), never as it is typed. */
  settles?: boolean;
  onCommit: (n: number, by?: Settled) => void;
  /** An optional figure: a box left empty clears it. */
  onClear?: () => void;
  /** The box takes the focus: what it holds now is what Escape puts back. */
  onFocus?: () => void;
  /** Escape, or a text that is no number, puts back what the box held when it took the focus; without it, the box commits that number again, or clears an empty one. */
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
  // what the box held when it took the focus, which Escape and a text that is no number put back, and whether it has committed since
  const atFocus = useRef(shown);
  const atFocusN = useRef<number | null>(typeof value?.value === "number" ? value.value : null);
  const changed = useRef(false);
  // the figure a box that settles gave since the focus came into it or its text last changed: Enter gives it, and the focus leaving after
  // Enter does not give it again
  const given = useRef<number | null>(null);
  // the note of where a sourced figure is from, open from the focus in its box until typing or the focus leaves
  const [noting, setNoting] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLSpanElement>(null);
  const sourced = value?.state === "sourced" ? value : null;
  const noteOpen = noting && !!sourced;
  useLayoutEffect(() => {
    const el = note.current;
    const field = root.current;
    if (!noteOpen || !el || !field) return;
    if (typeof el.showPopover === "function" && !el.matches(":popover-open")) el.showPopover();
    const place = () => placeNote(el, field);
    place();
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [noteOpen]);
  // a value from outside (a template, a reset, another field) replaces the text, but never under the person's fingers
  useEffect(() => {
    if (!focused.current) {
      setText(shown);
      setError(null);
    }
  }, [shown]);
  const read = (t: string, left: boolean) => readTyped(t, { sign, ...(kind ? { kind } : {}), validate, clearable: !!onClear, left });
  const commit = (n: number) => {
    changed.current = true;
    onCommit(n);
  };
  // the figure as it was when the box took the focus
  const revert = () => {
    changed.current = false;
    if (settles) return;
    if (onRevert) onRevert();
    else if (atFocusN.current === null) onClear?.();
    else onCommit(atFocusN.current);
  };
  const change = (t: string) => {
    setNoting(false);
    setText(t);
    given.current = null;
    const r = read(t, false);
    setError(r.kind === "error" ? r.message : null);
    const does = onTyping(r, { asks: !!asks, changed: changed.current, settles: !!settles });
    if (does === "commit" && r.kind === "commit") commit(r.n);
    else if (does === "clear") onClear?.();
    else if (does === "revert") revert();
  };
  // the box left, or Enter (`by`): what its whole text makes of the figure; false where it holds no number, and stays as typed with its
  // message. A box that settles gives its figure here, once.
  const settle = (by: Settled): boolean => {
    const r = read(text, true);
    if (r.kind === "error") {
      setError(r.message);
      return false;
    }
    if (settles) {
      if (r.kind === "commit" && given.current !== r.n) {
        given.current = r.n;
        setText(formatTyped(r.n));
        onCommit(r.n, by);
      } else if (r.kind !== "commit") setText(atFocus.current);
      return true;
    }
    if (r.kind === "clear") {
      if (value !== null) onClear?.();
    } else if (r.kind === "back") {
      if (changed.current) revert();
      setText(atFocus.current);
    } else setText(shown);
    return true;
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
      setText(atFocus.current);
      setError(null);
      revert();
    } else if (e.key === "Enter") {
      e.preventDefault();
      // a text that is no number keeps the focus, with its message; a figure edited in place stays open
      const before = given.current;
      // a box that settles and has just given its figure stays where it is: the page draws what it gave in its place
      if (settle("enter") && !(settles && given.current !== before)) enterToNext(e.currentTarget);
    } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && step) {
      if (text.trim() === "") return;
      e.preventDefault();
      const now = parseInBox(text, sign, kind);
      if (Number.isNaN(now)) return;
      change(formatTyped(stepped(now, step, e.key === "ArrowUp")));
    }
  };
  const state = value === null ? "empty" : value.state === "sourced" ? "sourced" : "entered";
  const signUnit = typeof unit !== "string" || !/[\u0590-\u05ff]/.test(unit);
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
          {/* the number and its unit as the page writes a figure, never wrapped apart: a sign (or a choice of one) on the number's right in one
              left-to-right group ("39 ₪", "0.3%"); a unit in words after the number in reading order ("200 יחידות") */}
          <span dir={signUnit ? "ltr" : undefined} className={cx("inline-flex items-center whitespace-nowrap", tight ? "gap-0.5" : "gap-1")}>
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
                atFocus.current = error ? shown : text.trim();
                atFocusN.current = typeof value?.value === "number" ? value.value : null;
                changed.current = false;
                given.current = null;
                if (sourced) setNoting(true);
                onFocus?.();
              }}
              onBlur={() => {
                focused.current = false;
                settle("left");
              }}
              style={{ width: widthOf(text, placeholder, tight, wide ? 6 : 0) }}
              // an empty box beside its unit keeps room to be typed in, so it never reads as the unit alone
              className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", tight && FIT, tight && !text && !!unit && "min-w-[2.5ch]", state === "sourced" && "underline decoration-sourced decoration-1 underline-offset-4")}
            />
            {unit && (
              <span dir="auto" className="text-sm opacity-80">
                {unit}
              </span>
            )}
          </span>
          {inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
        </span>
        {!inside && words && <span className="text-sm text-muted-foreground">{words}</span>}
      </span>
      {noteOpen && (
        <span
          ref={note}
          data-figure-note=""
          popover="manual"
          // the top layer's own place and look are set aside: the note stands by its box (`placeNote`), on the popover surface
          className="come-in fixed inset-auto m-0 w-max text-pretty rounded-md border border-border bg-popover px-3 py-2 text-sm leading-relaxed text-foreground shadow-lg"
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

/** Why a month falls outside the months a box takes (`earliest`, `latest`, inclusive), in words; null where it falls inside them. */
export function monthFault(month: string, { earliest, latest }: { earliest?: string | undefined; latest?: string | undefined }): string | null {
  if ((earliest === undefined || month >= earliest) && (latest === undefined || month <= latest)) return null;
  const r = kitCopy.figure.monthRange;
  if (earliest !== undefined && latest !== undefined) return r.between(monthText(earliest), monthText(latest));
  return earliest !== undefined ? r.from(monthText(earliest)) : r.until(monthText(latest!));
}

/**
 * A month in the box `FigureField` draws, chosen from a picker or typed: a calendar mark stands in the box, and a press anywhere in it
 * opens the picker (`MonthPicker`: the year and its twelve months) by the box, with the focus left in the box for typing; ArrowDown or
 * Alt+ArrowDown opens it with the focus on its month. Choosing a month commits it, closes the picker and gives the focus back to the box;
 * Escape, a press outside or Tab out of the box closes it and chooses nothing. The person may also write "03.2027" (or "3/2027"), and the
 * picker follows what is typed; the box keeps the month in that form. Typed or chosen by the person, so entered; empty and dashed until
 * given. A native month input is not used: two of the browsers the site meets draw it as plain text with no form, and the site writes a
 * month as `03.2027` everywhere it is a field's value (design-system 2.7).
 * A typed month commits when the person leaves the box or presses Enter, and Enter then moves on as in `FigureField` (in a question, it
 * presses "להוסיף"); with `onClear`, an empty box clears the month, and without it an empty box asks for nothing (`waits`) or says what to
 * write. A box that holds no month takes the error look, and Escape puts back the last month. `earliest`, `latest`: the months the page
 * around the box would refuse fall outside them, and the picker offers none of those; a month typed outside them is refused, said under
 * the box (`monthFault`), and the box shows its month again, as it does where the page refuses a month for a reason of its own (the month
 * it holds after the commit is not the one typed). `taken`: months inside them the page refuses, struck through in the picker and refused
 * when typed, with the page's reason said under the box. `lead`: words in the box before the month,
 * so a price that holds until a month is one box ("[חינם עד 03.2028]"). `hang`: the message hangs under the box over what is below,
 * taking no room, for a box in a bar whose line must not grow. `autoFocus`: the box takes the focus as it appears, with its picker open,
 * so the month just asked for is one press away and typing still goes to the box.
 */
export function MonthField({ value, label, lead, tight, earliest, latest, taken, onCommit, onClear, waits, hang, autoFocus, className }: {
  value: string | null;
  label: string;
  lead?: ReactNode;
  /** As `FigureField`'s. */
  tight?: boolean;
  /** The first month the picker offers, `YYYY-MM`. */
  earliest?: string;
  /** The last month the picker offers, `YYYY-MM`. */
  latest?: string;
  /** Months between the first and the last that the page refuses, and why, in words, for the month typed (a month the prices change in already). */
  taken?: { months: readonly string[]; why: (month: string) => string };
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
  // a month typed outside the months the page takes, refused: why, said under the box, which shows its month again
  const [refused, setRefused] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // a commit made: once the page has drawn it, a box whose month did not become the one typed (the page refused it) shows its month again
  const [commits, setCommits] = useState(0);
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
    if (commits === 0 || focused.current) return;
    if (parseMonth(text) !== value) setText(shown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commits]);
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
    setRefused(null);
    toBox();
    // the box's own commit on leaving it, or Enter, sees the month already committed
    const c = pickCommit(m, value, { ...(taken ? { taken: taken.months } : {}) });
    if (c !== null && c !== committed.current) onCommit(c);
    committed.current = m;
  };
  /** The box's text to the page: whether it holds a month the page may take (or an empty box that may be empty). */
  const commit = (): boolean => {
    if (text.trim() === "") {
      setError(!onClear && !waits);
      if (onClear && value !== null) onClear();
      return !!onClear || !!waits;
    }
    const m = parseMonth(text);
    setError(m === null);
    if (m === null) return false;
    const fault = monthFault(m, { earliest, latest }) ?? (taken?.months.includes(m) ? taken.why(monthText(m)) : null);
    if (fault) {
      setRefused(fault);
      setText(shown);
      return false;
    }
    setText(monthText(m));
    // Enter commits and moves the focus, whose blur commits again before the page has drawn the month: one commit per month typed
    if (m !== value && m !== committed.current) {
      onCommit(m);
      setCommits((n) => n + 1);
    }
    committed.current = m;
    return true;
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
          aria-describedby={error || refused ? `${id}-err` : undefined}
          onChange={(e) => {
            setText(e.target.value);
            setRefused(null);
          }}
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
              if (open) setOpen(false);
              if (commit()) enterToNext(e.currentTarget);
            } else if (e.key === "Escape" && (error || refused || text !== shown)) {
              e.preventDefault();
              e.stopPropagation();
              setText(shown);
              setError(false);
              setRefused(null);
            }
          }}
          style={{ width: widthOf(text, placeholder, tight) }}
          className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", tight && FIT)}
        />
        <span data-month-mark="" className="inline-flex cursor-pointer text-muted-foreground">
          <IconCalendar size={16} />
        </span>
      </span>
      {open && <MonthPicker id={grid} label={label} chosen={parseMonth(text) ?? value} bounds={{ earliest, latest, ...(taken ? { taken: taken.months } : {}) }} anchor={box} onPick={pick} onClose={toBox} />}
      {(error || refused) && (
        <span id={`${id}-err`} role={refused ? "status" : undefined} className={cx("text-xs text-destructive", hang && "absolute start-0 top-full z-10 mt-0.5 whitespace-nowrap rounded-sm bg-card")}>
          {refused ?? kitCopy.figure.monthError}
        </span>
      )}
    </span>
  );
}
