// A step of a page that builds something in order (the fee page's deal: its kind, what it holds, its fees): a number in a circle, or a
// check once the step is done, its heading, what was chosen, and the way to change it at the end of the line. The steps once made, where
// they are seldom changed again, stand on one line over what they built (`StepStrip`).
import type { ReactNode } from "react";
import { kit as copy } from "../../copy";
import { IconCheck } from "../icons";
import { cx } from "./cx";

/**
 * One step. `n` is its number; `done` swaps the number for a check in the action colour, with the word for a screen reader, so a step's
 * state is never its colour alone. `value` is what the step holds, muted after the heading ("חשבון ניירות ערך"); `action` the way to change
 * it, at the line's end (a quiet `Button`). The body under the line is the step's own controls. Steps stand one under the other, a
 * hairline between them.
 */
export function Step({ n, done, title, value, action, children, className }: { n: number; done?: boolean; title: ReactNode; value?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cx("flex flex-col gap-3 pt-4 border-t border-border first:pt-0 first:border-t-0", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-h-target">
        <span className={cx("inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums", done ? "bg-primary-subtle text-primary" : "border border-input text-foreground")}>
          {done ? <IconCheck size={14} /> : <bdi dir="ltr">{n}</bdi>}
          {done && <span className="sr-only">{copy.stepDone}</span>}
        </span>
        <h3 className="font-semibold">{title}</h3>
        {value && <span className="text-sm text-muted-foreground min-w-0">{value}</span>}
        {action && <span className="ms-auto">{action}</span>}
      </div>
      {children}
    </section>
  );
}

/** One done step on a `StepStrip`: its name, what was chosen, and the way to change it. */
export interface StripStep {
  id: string;
  title: ReactNode;
  value?: ReactNode;
  /** The way to change it, after the value and a dot (a quiet `Button`, `size="sm"`). */
  action?: ReactNode;
}

/**
 * The steps of such a page once they are made, on one line over what they built, where they are seldom changed again: each step's name and
 * what was chosen ("סוג המוצר: חשבון ניירות ערך"), a dot, and the way to change it; the line's own action at its end (`end`); and under the
 * line what a step opens to be changed (its chips) or says about what was chosen (`children`). The line wraps where the width runs out,
 * each step and the end 44 px tall, so the tap areas of actions on wrapped lines never meet. `heading` names the strip for a screen reader,
 * as the steps' section would: the line shows each step's own name.
 */
export function StepStrip({ heading, steps, end, children }: { heading: string; steps: readonly StripStep[]; end?: ReactNode; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="sr-only">{heading}</h2>
      <div className="flex flex-wrap items-center gap-x-6 text-sm">
        {steps.map((s) => (
          <span key={s.id} className="inline-flex min-h-target min-w-0 flex-wrap items-center gap-x-2">
            <span className="text-muted-foreground">{s.title}:</span>
            {s.value && <span className="font-medium">{s.value}</span>}
            {s.action && (
              <>
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
                {s.action}
              </>
            )}
          </span>
        ))}
        {end && <span className="ms-auto inline-flex min-h-target items-center">{end}</span>}
      </div>
      {children}
    </section>
  );
}
