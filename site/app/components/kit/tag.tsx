// A small state or label chip (design-system 3.9).
import type { ReactNode } from "react";
import { cx } from "./cx";

type TagTone = "neutral" | "computed" | "entered" | "caution" | "blocked" | "positive" | "parameter" | "outline" | "primary" | "info";

/**
 * A short label with a tone: a state, a kind, a flag. One to three words; the tone never carries the meaning alone, so give it an icon or a word.
 * `wrap` lets a label that holds a name (a company's) break onto a second line instead of running past the edge of a phone.
 * `shape`: `tag`, a small rounded box, or `pill`, fully round with more room at the sides (the default for `primary`, `outline` and `info`).
 * `size`: `xs`, 12 px words of medium weight, or `sm`, 14 px words of normal weight, for labels that stand among a row's own words (what a
 * deposit lets you do before its end).
 */
export function Tag({ tone = "neutral", shape, size = "xs", icon, children, className, wrap }: { tone?: TagTone; shape?: "tag" | "pill"; size?: "xs" | "sm"; icon?: ReactNode; children: ReactNode; className?: string; wrap?: boolean }) {
  const styles = {
    neutral: "bg-muted text-foreground",
    parameter: "bg-secondary text-foreground",
    computed: "bg-computed-subtle text-computed",
    entered: "bg-entered-subtle text-entered",
    caution: "bg-caution-subtle text-caution-foreground",
    blocked: "bg-blocked-subtle text-blocked-foreground",
    positive: "bg-positive-subtle text-positive-foreground",
    /** A teal wash: what a row offers, such as a deposit's exit points, or the reader's own bank (the deposits page). */
    primary: "bg-primary-subtle text-primary",
    /** A thin frame and no fill: a kind beside figures that should not draw the eye (a rate's type in a table, the designer's mocks). */
    outline: "border border-input text-foreground",
    /** A thin frame and words in the info colour, no fill: what kind of note a box in the info frame is ("במדינות אחרות"). */
    info: "border border-info-border text-info-foreground",
  }[tone];
  const pill = (shape ?? (tone === "primary" || tone === "outline" || tone === "info" ? "pill" : "tag")) === "pill";
  // a framed tag's words (outline, info) are of normal weight at every size: its frame already sets it apart
  const words = size === "sm" ? "text-sm font-normal" : tone === "outline" || tone === "info" ? "text-xs font-normal" : "text-xs font-medium";
  return (
    <span className={cx("inline-flex w-fit items-center gap-1 align-middle", words, pill ? "rounded-full px-2.5 py-0.5" : "rounded-sm px-1.5 py-px", wrap ? "max-w-full" : "whitespace-nowrap", styles, className)}>
      {icon}
      {children}
    </span>
  );
}

/**
 * A tag on an ordered scale: how soon the money is back, from step 1 (at any moment) to step 4 (at the end of the term). A
 * grey tag with the word; only the icon takes the step's colour, teal to red, so the tag stays calm beside the
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
