// A figure edited where it is read (design-system 11, "Cases and parts"): on a closed card or in a table's cell, a tap or a click on the
// figure (or Enter on it) turns it into its field in place; Enter keeps what was typed where it is a number (else the field stays open with
// its message), Esc puts it back, and either brings the focus back to the cell or card the figure stands in; leaving the field keeps what it
// holds. The field is the page's own (`field`), so it keeps the figure's unit, its rules and its source as the open case's box does.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";

/**
 * Where the focus goes back to once a figure edited in place is at rest again: its table's cell; else the card it stands on, by the card's
 * own button (a `PickCard`'s `[data-pick-card]`, which lies over the card beside the figure, not around it); else the nearest stop around it.
 */
export function restStop(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  const cell = el.closest<HTMLElement>("[role=gridcell]");
  if (cell) return cell;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const card = p.querySelector<HTMLElement>(":scope > [data-pick-card]");
    if (card) return card;
  }
  return el.closest<HTMLElement>("[data-figures-back], [tabindex]:not([tabindex='-1']), button, a[href]");
}

/**
 * A figure at rest (`children`) that becomes its field (`field`, given `done` to call once the field is left) on a tap. `label` names
 * what a tap does ("לשנות את המינימום"). Nothing inside it keeps a tap of its own while it rests: the figure's own tap is the edit. The
 * open field is done on Enter once its text is kept (`FigureField` sends `edit-done`, `enterToNext`), on Esc, or when the focus leaves it.
 */
export function EditInPlace({ label, field, onOpen, children, className }: { label: string; field: (done: () => void) => ReactNode; /** Told as the field opens (what it holds then is what Esc puts back). */ onOpen?: () => void; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  // Enter or Esc closed the field: the focus goes back to where the figure rests
  const back = useRef(false);
  // the field takes the focus as it opens, what it holds selected
  useEffect(() => {
    if (!on) return;
    const input = box.current?.querySelector<HTMLInputElement>("input");
    input?.focus();
    input?.select();
  }, [on]);
  // at rest, the figure's own controls leave the Tab order: its cell or its card is the stop, and Enter there edits
  const rest = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!on) for (const el of rest.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []) el.tabIndex = -1;
    if (!on && back.current) {
      back.current = false;
      restStop(rest.current)?.focus({ preventScroll: true });
    }
  });
  // the field says it is done (Enter on a number it keeps)
  useEffect(() => {
    const el = box.current;
    if (!on || !el) return;
    const done = () => {
      back.current = true;
      setOn(false);
    };
    el.addEventListener("edit-done", done);
    return () => el.removeEventListener("edit-done", done);
  }, [on]);
  if (on)
    return (
      <span
        ref={box}
        data-lift=""
        data-edit-in-place="open"
        className="inline-flex"
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOn(false)}
        // Esc: the field puts its figure back first, then the figure is back at rest
        onKeyDownCapture={(e) => {
          if (e.key !== "Escape") return;
          back.current = true;
          requestAnimationFrame(() => setOn(false));
        }}
      >
        {field(() => setOn(false))}
      </span>
    );
  const open = () => {
    onOpen?.();
    setOn(true);
  };
  return (
    <span
      ref={rest}
      data-lift=""
      data-edit-in-place=""
      title={label}
      className={cx("inline cursor-text rounded-sm resting:hover:bg-accent", className)}
      // the figure's own tap (its source) gives way to the edit
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open();
      }}
      onKeyDownCapture={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation();
        open();
      }}
    >
      {children}
    </span>
  );
}
