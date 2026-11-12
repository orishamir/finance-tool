// A figure the person types where it stands (a fee's rate in a row, a bound in a panel), drawn in its number state, and a month typed the
// same way. Unlike a chart's field (NumberField), whose default and typed value look alike, a figure here is the person's record of a
// price: typed by them it is entered (blue ink on a blue highlight); filled from a price list or a track and left as it was, it is sourced
// (the solid grey line under the digits) and its source opens from the mark beside it (design.md, the number states).
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { kit as kitCopy, values as valuesCopy } from "../../copy";
import { formatTyped, parseNumber } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { IconFile } from "../icons";
import { useOpen, valueItem } from "../provenance";
import { cx } from "./cx";

/** The box of a typed figure or month: its edge, fill and ink say whose the value is. */
function boxLook(state: "entered" | "sourced" | "empty", error: boolean): string {
  return cx(
    "inline-flex items-center gap-1 min-h-target rounded-md border px-2.5 tabular-nums focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1",
    state === "entered" && "bg-entered-subtle text-entered border-entered/50",
    state === "sourced" && "bg-card text-foreground border-input",
    state === "empty" && "bg-card text-foreground border-input border-dashed",
    error && "border-destructive",
  );
}

/** An input as wide as what it holds, so a short figure takes a short box and a long one never cuts. */
const widthOf = (text: string, placeholder: string | undefined) => `${Math.max(text.length, placeholder?.length ?? 0, 2) + 0.5}ch`;

/**
 * A figure typed in place: the box holds the number and its unit ("%", "₪"), `words` follow it ("מכל פעולה"). `value` is the figure as the
 * page shows it, a value object whose state is the box's look: entered or sourced; null for an optional figure not given, a dashed box.
 * A sourced figure carries a document mark that opens its source; once the person types over it, the caller makes it entered. Each valid
 * number commits as it is typed; one that fails `validate` stays in the box with its message under it. With `onClear`, emptying the box
 * clears the figure. Decimals are allowed: a price list's fee keeps its agorot.
 */
export function FigureField({ value, label, unit, words, onCommit, onClear, validate, placeholder, className }: {
  value: SiteValue | null;
  /** The spoken name: what the figure is. */
  label: string;
  /** The unit drawn in the box, after the number. */
  unit?: string;
  /** Words after the box. */
  words?: ReactNode;
  onCommit: (n: number) => void;
  /** An optional figure: an empty box clears it. */
  onClear?: () => void;
  validate?: (n: number) => ReactNode | null;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const open = useOpen();
  const shown = typeof value?.value === "number" ? formatTyped(value.value) : "";
  const [text, setText] = useState(shown);
  const [error, setError] = useState<ReactNode | null>(null);
  const focused = useRef(false);
  // a value from outside (a template, a reset, another field) replaces the text, but never under the person's fingers
  useEffect(() => {
    if (!focused.current) {
      setText(shown);
      setError(null);
    }
  }, [shown]);
  const change = (t: string) => {
    setText(t);
    if (t.trim() === "") {
      setError(onClear ? null : valuesCopy.errors.nan);
      if (onClear) onClear();
      return;
    }
    const n = parseNumber(t);
    const err = Number.isNaN(n) ? valuesCopy.errors.nan : (validate?.(n) ?? null);
    setError(err);
    if (!err) onCommit(n);
  };
  const state = value === null ? "empty" : value.state === "sourced" ? "sourced" : "entered";
  return (
    <span className={cx("inline-flex flex-col gap-0.5 align-middle", className)}>
      <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className={boxLook(state, !!error)}>
          <input
            id={id}
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={text}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            onChange={(e) => change(e.target.value)}
            onFocus={() => (focused.current = true)}
            onBlur={() => {
              focused.current = false;
              if (!error && text.trim() !== "") setText(shown);
            }}
            style={{ width: widthOf(text, placeholder) }}
            className={cx("bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal", state === "sourced" && "underline decoration-sourced decoration-1 underline-offset-4")}
          />
          {unit && <span className="text-sm opacity-80">{unit}</span>}
        </span>
        {state === "sourced" && value && (
          <button type="button" aria-label={kitCopy.figure.source(label)} onClick={(e) => open(valueItem(value, undefined, true), e.currentTarget)} className="tap-area inline-flex items-center rounded-sm text-muted-foreground hover:text-foreground">
            <IconFile size={16} />
          </button>
        )}
        {words && <span className="text-sm text-muted-foreground">{words}</span>}
      </span>
      {error && (
        <span id={`${id}-err`} className="text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}

/** A month as the person types it: "3.2027", "03/2027" or "2027-03"; null where it is not one. */
export function parseMonth(text: string): string | null {
  const t = text.trim();
  let m = /^(\d{1,2})\s*[./-]\s*(\d{4})$/.exec(t);
  if (m) return Number(m[1]) >= 1 && Number(m[1]) <= 12 ? `${m[2]}-${m[1]!.padStart(2, "0")}` : null;
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
 * It commits when the person leaves it or presses Enter; with `onClear`, an empty box clears the month.
 */
export function MonthField({ value, label, onCommit, onClear, className }: { value: string | null; label: string; onCommit: (month: string) => void; onClear?: () => void; className?: string }) {
  const id = useId();
  const shown = value ? monthText(value) : "";
  const [text, setText] = useState(shown);
  const [error, setError] = useState(false);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) {
      setText(shown);
      setError(false);
    }
  }, [shown]);
  const commit = () => {
    if (text.trim() === "") {
      setError(!onClear);
      if (onClear && value !== null) onClear();
      return;
    }
    const m = parseMonth(text);
    setError(m === null);
    if (m !== null) {
      setText(monthText(m));
      if (m !== value) onCommit(m);
    }
  };
  const placeholder = kitCopy.figure.monthPlaceholder;
  return (
    <span className={cx("inline-flex flex-col gap-0.5 align-middle", className)}>
      <span className={boxLook(value === null ? "empty" : "entered", error)}>
        <input
          id={id}
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
            if (e.key === "Enter") commit();
          }}
          style={{ width: widthOf(text, placeholder) }}
          className="bg-transparent outline-none text-end font-medium placeholder:text-muted-foreground placeholder:font-normal"
        />
      </span>
      {error && (
        <span id={`${id}-err`} className="text-xs text-destructive">
          {kitCopy.figure.monthError}
        </span>
      )}
    </span>
  );
}
