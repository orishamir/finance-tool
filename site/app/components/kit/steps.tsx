// A step of a page that builds something in order (the fee page's deal: its kind, what it holds, its fees): a number in a circle, or a
// check once the step is done, its heading, what was chosen, and the way to change it at the end of the line.
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
