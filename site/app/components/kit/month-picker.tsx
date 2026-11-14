// The picker a month's box opens (kit MonthField): the year, with a control a year back and a year on, and its twelve months as a grid
// of buttons named as the site writes a month ("מרץ", spoken "מרץ 2027"). The month the box holds is chosen (filled, bold, and
// `aria-selected` on its cell), today's month has a quiet edge (`aria-current="date"`), and a month outside the box's earliest and latest
// is drawn struck through and refuses a press (`aria-disabled`), where the page around the box would refuse it. Next to a box it floats in
// the browser's top layer, placed against the box and kept inside the visible window, so a card that scrolls or clips never cuts it and
// nothing around the box moves; on its own (the gallery) it stands in the page.
//
// Keys, in the grid: the arrows move between months (right to left, the right arrow goes to the month before), Page Up and Page Down a
// year back and on, Home and End to January and December, Enter or Space choose, Escape closes it and gives the focus back to the box.
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { IconBack, IconDrillIn } from "../icons";
import { cx } from "./cx";

/** The months a box takes from its picker, as `YYYY-MM` keys, both ends included; either may be open. */
export interface MonthBounds {
  earliest?: string;
  latest?: string;
}

/** The months a row of the grid holds. */
const COLS = 3;
const FIRST = 1 * 12;
const LAST = 9999 * 12 + 11;
const pad = (n: number) => String(n).padStart(2, "0");
const count = (key: string) => Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;

/** The month `by` months after `key` (before it where `by` is negative), within the years a month's box can hold (1 to 9999). */
export function shiftMonth(key: string, by: number): string {
  const t = Math.min(LAST, Math.max(FIRST, count(key) + by));
  return `${String(Math.floor(t / 12)).padStart(4, "0")}-${pad((t % 12) + 1)}`;
}

export const yearOf = (key: string) => Number(key.slice(0, 4));

/** Whether the picker offers `key`: on or after the earliest and on or before the latest, where the box has them. */
export const offered = (key: string, b: MonthBounds) => (b.earliest === undefined || key >= b.earliest) && (b.latest === undefined || key <= b.latest);

/** A year's twelve months, in order, each with whether the picker offers it. */
export function yearMonths(year: number, b: MonthBounds): { key: string; offered: boolean }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const key = `${String(year).padStart(4, "0")}-${pad(i + 1)}`;
    return { key, offered: offered(key, b) };
  });
}

/** Whether the year control can go to `year`: it offers at least one of its months. */
export const yearOffered = (year: number, b: MonthBounds) => year >= 1 && year <= 9999 && yearMonths(year, b).some((m) => m.offered);

/** The month the picker opens on: the one the box holds, else today's, brought inside the earliest and latest. */
export function startMonth(chosen: string | null, today: string, b: MonthBounds): string {
  if (chosen) return chosen;
  if (b.earliest !== undefined && today < b.earliest) return b.earliest;
  if (b.latest !== undefined && today > b.latest) return b.latest;
  return today;
}

/** Where a key moves the grid's focus from `key`, or null for a key it leaves alone. Right to left, the right arrow is the month before. */
export function moveMonth(key: string, pressed: string, rtl: boolean): string | null {
  switch (pressed) {
    case "ArrowRight":
      return shiftMonth(key, rtl ? -1 : 1);
    case "ArrowLeft":
      return shiftMonth(key, rtl ? 1 : -1);
    case "ArrowUp":
      return shiftMonth(key, -COLS);
    case "ArrowDown":
      return shiftMonth(key, COLS);
    case "PageUp":
      return shiftMonth(key, -12);
    case "PageDown":
      return shiftMonth(key, 12);
    case "Home":
      return `${key.slice(0, 4)}-01`;
    case "End":
      return `${key.slice(0, 4)}-12`;
    default:
      return null;
  }
}

/** What choosing `key` commits: the month, where the picker offers it and the box does not hold it already; else nothing. */
export const pickCommit = (key: string, value: string | null, b: MonthBounds): string | null => (offered(key, b) && key !== value ? key : null);

/** This month on the reader's clock. */
export function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/**
 * Where a floating picker stands: under its box, or over it where the room under it is too short and the room over it longer; its inline
 * start on the box's inline start, shifted to stay `margin` inside the window's width. `view` is the visible part of the window (a phone's
 * keyboard takes the rest), `ceiling` the bottom of the site's sticky header, which the picker never covers.
 */
export function floatAt(box: { top: number; bottom: number; left: number; right: number }, size: { w: number; h: number }, view: { top: number; bottom: number; width: number }, ceiling: number, rtl: boolean): { top: number; left: number } {
  const gap = 4, margin = 8;
  const roof = Math.max(view.top, ceiling) + margin;
  const floor = view.bottom - margin;
  const below = floor - box.bottom - gap, above = box.top - gap - roof;
  const down = size.h <= below || below >= above;
  const top = down ? Math.min(box.bottom + gap, Math.max(roof, floor - size.h)) : Math.max(roof, box.top - gap - size.h);
  const start = rtl ? box.right - size.w : box.left;
  const left = Math.max(margin, Math.min(start, view.width - size.w - margin));
  return { top, left };
}

/** Puts a floating picker by its box, in the browser's top layer, again when the page, a box around it or the visible window scrolls or changes size. */
function useFloat(surface: RefObject<HTMLDivElement | null>, anchor: RefObject<HTMLElement | null> | undefined) {
  useLayoutEffect(() => {
    const el = surface.current;
    if (!anchor || !el) return;
    if (typeof el.showPopover === "function" && !el.matches(":popover-open")) el.showPopover();
    const place = () => {
      const box = anchor.current?.getBoundingClientRect();
      if (!box) return;
      const vv = window.visualViewport;
      const view = { top: vv?.offsetTop ?? 0, bottom: vv ? vv.offsetTop + vv.height : window.innerHeight, width: document.documentElement.clientWidth };
      const ceiling = Math.max(0, document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom ?? 0);
      const at = floatAt(box, { w: el.offsetWidth, h: el.offsetHeight }, view, ceiling, getComputedStyle(anchor.current!).direction === "rtl");
      el.style.top = `${at.top}px`;
      el.style.left = `${at.left}px`;
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [surface, anchor]);
}

/**
 * The picker. `chosen` is the month the box holds or the month typed in it so far, which the picker follows (its year, its chosen month);
 * `label` names the grid for a screen reader (the box's label). `onPick` gets a month the picker offers; `onClose` is Escape in it.
 * `anchor`: the box it floats by; without it, it stands in the page. `id`: the grid's id, which the box's `aria-controls` names.
 */
export function MonthPicker({ id: givenId, label, chosen, bounds = {}, anchor, onPick, onClose, className }: {
  id?: string;
  label: string;
  chosen: string | null;
  bounds?: MonthBounds;
  anchor?: RefObject<HTMLElement | null>;
  onPick: (month: string) => void;
  onClose?: () => void;
  className?: string;
}) {
  const ownId = useId();
  const id = givenId ?? ownId;
  const surface = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  // today on the reader's clock: a floating picker is only ever drawn in the browser, and one standing in a pre-rendered page (the
  // gallery) reads it once it runs there, so the page as built and as run agree
  const [today, setToday] = useState<string | null>(() => (anchor ? thisMonth() : null));
  // the month the grid's focus is on, or would be: its year is the year shown
  const [cursor, setCursor] = useState(() => startMonth(chosen, today ?? bounds.earliest ?? bounds.latest ?? "2026-01", bounds));
  useEffect(() => {
    if (today !== null) return;
    const now = thisMonth();
    setToday(now);
    if (!chosen) setCursor(startMonth(null, now, bounds));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const takeFocus = useRef(false);
  useEffect(() => {
    if (chosen) setCursor(chosen);
  }, [chosen]);
  useLayoutEffect(() => {
    if (!takeFocus.current) return;
    takeFocus.current = false;
    grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [cursor]);
  useFloat(surface, anchor);

  const year = yearOf(cursor);
  const months = yearMonths(year, bounds);
  const rows = Array.from({ length: 12 / COLS }, (_, r) => months.slice(r * COLS, r * COLS + COLS));
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const next = moveMonth(cursor, e.key, getComputedStyle(e.currentTarget).direction === "rtl");
    if (next === null) return;
    e.preventDefault();
    takeFocus.current = true;
    setCursor(next);
  };
  const toYear = (by: number) => setCursor((c) => shiftMonth(c, by * 12));
  const yearButton = "inline-flex size-target items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:opacity-50 aria-disabled:hover:bg-transparent";
  const back = yearOffered(year - 1, bounds), on = yearOffered(year + 1, bounds);
  return (
    <div
      ref={surface}
      {...(anchor ? { popover: "manual" as const } : {})}
      data-month-picker=""
      // a press in the picker keeps the focus where it is (the box, or a month), so a pointer's choice never commits the box's text first
      onMouseDown={(e) => anchor && e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }}
      className={cx("m-0 flex w-max flex-col gap-1 rounded-lg border border-border bg-popover p-2 text-base font-normal leading-normal text-foreground", anchor ? "fixed inset-auto shadow-lg" : "shadow-md", className)}
    >
      <div className="flex items-center justify-between gap-1">
        <button type="button" aria-label={kitCopy.figure.yearBack} title={kitCopy.figure.yearBack} aria-disabled={!back || undefined} onClick={() => back && toYear(-1)} className={yearButton}>
          <IconBack size={20} />
        </button>
        <bdi aria-live="polite" className="font-semibold tabular-nums">
          {year}
        </bdi>
        <button type="button" aria-label={kitCopy.figure.yearOn} title={kitCopy.figure.yearOn} aria-disabled={!on || undefined} onClick={() => on && toYear(1)} className={yearButton}>
          <IconDrillIn size={20} />
        </button>
      </div>
      <div ref={grid} id={id} role="grid" aria-label={label} onKeyDown={onGridKey} className="flex flex-col gap-1">
        {rows.map((row, r) => (
          <div key={r} role="row" className="grid grid-cols-3 gap-1">
            {row.map((m) => {
              const isChosen = m.key === chosen;
              return (
                <div key={m.key} role="gridcell" aria-selected={isChosen}>
                  <button
                    type="button"
                    tabIndex={m.key === cursor ? 0 : -1}
                    aria-label={fmt.period(m.key)}
                    aria-disabled={!m.offered || undefined}
                    aria-current={m.key === today ? "date" : undefined}
                    data-month={m.key}
                    onClick={() => m.offered && onPick(m.key)}
                    onFocus={() => m.key !== cursor && setCursor(m.key)}
                    className={cx(
                      "flex min-h-target w-[4.75rem] items-center justify-center rounded-md border px-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                      isChosen ? "border-primary bg-primary font-semibold text-primary-foreground" : m.key === today ? "border-input" : "border-transparent",
                      !m.offered ? "cursor-not-allowed text-muted-foreground line-through opacity-60" : !isChosen && "hover:bg-accent",
                    )}
                  >
                    {fmt.monthName(m.key)}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
