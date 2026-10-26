// A small state or label chip (design-system 3.9).
import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * A short label with a tone: a state, a kind, a flag. One to three words; the tone never carries the meaning alone, so give it an icon or a word.
 * `wrap` lets a label that holds a name (a company's) break onto a second line instead of running past the edge of a phone (2026-10-26).
 */
export function Tag({ tone = "neutral", icon, children, className, wrap }: { tone?: "neutral" | "computed" | "entered" | "caution" | "blocked" | "positive" | "parameter"; icon?: ReactNode; children: ReactNode; className?: string; wrap?: boolean }) {
  const styles = {
    neutral: "bg-muted text-foreground",
    parameter: "bg-secondary text-foreground",
    computed: "bg-computed-subtle text-computed",
    entered: "bg-entered-subtle text-entered",
    caution: "bg-caution-subtle text-caution-foreground",
    blocked: "bg-blocked-subtle text-blocked-foreground",
    positive: "bg-positive-subtle text-positive-foreground",
  }[tone];
  return (
    <span className={cx("inline-flex w-fit items-center gap-1 text-xs font-medium rounded-sm px-1.5 py-px align-middle", wrap ? "max-w-full" : "whitespace-nowrap", styles, className)}>
      {icon}
      {children}
    </span>
  );
}

/**
 * A tag on an ordered scale (2026-10-26): how soon the money is back, from step 1 (at any moment, teal) to step 4 (at the end of the
 * term, red). Larger than `Tag`, with an icon and a word always, so the colour never works alone; it is never set beside a number, so its
 * green, amber and red are not the flags of a number.
 */
export function StepTag({ step, icon, children }: { step: 1 | 2 | 3 | 4; icon: ReactNode; children: ReactNode }) {
  const styles = { 1: "bg-access-1-subtle text-access-1", 2: "bg-access-2-subtle text-access-2", 3: "bg-access-3-subtle text-access-3", 4: "bg-access-4-subtle text-access-4" }[step];
  return <span className={cx("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0", styles)}>{icon}{children}</span>;
}
