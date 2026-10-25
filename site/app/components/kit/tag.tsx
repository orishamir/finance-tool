// A small state or label chip (design-system 3.9).
import type { ReactNode } from "react";
import { cx } from "./cx";

/** A short label with a tone: a state, a kind, a flag. One to three words; the tone never carries the meaning alone, so give it an icon or a word. */
export function Tag({ tone = "neutral", icon, children, className }: { tone?: "neutral" | "computed" | "entered" | "caution" | "blocked" | "positive" | "parameter"; icon?: ReactNode; children: ReactNode; className?: string }) {
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
    <span className={cx("inline-flex w-fit items-center gap-1 text-xs font-medium rounded-sm px-1.5 py-px whitespace-nowrap align-middle", styles, className)}>
      {icon}
      {children}
    </span>
  );
}
