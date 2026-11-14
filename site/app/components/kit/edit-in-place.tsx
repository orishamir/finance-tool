// A figure edited where it is read (design-system 11, "Cases and parts"): on a closed card or in a table's cell, a tap or a click on the
// figure (or Enter on it) turns it into its field in place; Enter or leaving the field keeps what was typed, Esc puts it back. The field is
// the page's own (`field`), so it keeps the figure's unit, its rules and its source as the open case's box does.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";

/**
 * A figure at rest (`children`) that becomes its field (`field`, given `done` to call once the field is left) on a tap. `label` names
 * what a tap does ("לשנות את המינימום"). Nothing inside it keeps a tap of its own while it rests: the figure's own tap is the edit.
 */
export function EditInPlace({ label, field, onOpen, children, className }: { label: string; field: (done: () => void) => ReactNode; /** Told as the field opens (what it holds then is what Esc puts back). */ onOpen?: () => void; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
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
  });
  if (on)
    return (
      <span
        ref={box}
        data-lift=""
        data-edit-in-place="open"
        className="inline-flex"
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOn(false)}
        // the field reverts on Esc and keeps what was typed on Enter first; then the figure is back at rest
        onKeyDownCapture={(e) => {
          if (e.key === "Escape" || e.key === "Enter") requestAnimationFrame(() => setOn(false));
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
      className={cx("inline cursor-text rounded-sm hover:bg-accent", className)}
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
