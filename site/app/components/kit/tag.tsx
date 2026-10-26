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
 * A tag on an ordered scale (2026-10-26): how soon the money is back, from step 1 (at any moment) to step 4 (at the end of the term). A
 * grey tag with the word; only the icon takes the step's colour, teal to red (founder, 2026-10-26), so the tag stays calm beside the
 * figures and is not read as a flag. Never without the icon and the word.
 */
export function StepTag({ step, icon, children }: { step: 1 | 2 | 3 | 4; icon: ReactNode; children: ReactNode }) {
  const tone = { 1: "text-access-1", 2: "text-access-2", 3: "text-access-3", 4: "text-access-4" }[step];
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted text-foreground px-2.5 py-1 text-sm font-semibold whitespace-nowrap">
      <span className={cx("inline-flex [&_svg]:size-4 [&_svg]:shrink-0", tone)}>{icon}</span>
      {children}
    </span>
  );
}
