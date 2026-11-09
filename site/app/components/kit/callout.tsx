// A note that stands out from the text (design-system 3.9).
import { createContext, useContext, type ReactNode } from "react";
import { IconAlert, IconCalendar, IconInfo, IconLock } from "../icons";
import { cx } from "./cx";

/** Inside an `upcoming` callout: the box already says what it holds starts later, so a figure leaves out its "starts on" mark (the sheet still says it). */
const AheadSaidCtx = createContext(false);

/** Whether the figure sits in a callout that already says its rules start later (`Callout tone="upcoming"`). */
export function useAheadSaid(): boolean {
  return useContext(AheadSaidCtx);
}

/**
 * A boxed note under a result: `caution` for stale or weak, `blocked` for an open rule, `info` for a neutral remark, `upcoming` for rules
 * that are about to change (the info colours with a calendar; `tag` is the date beside the title). Short; one to
 * three sentences.
 */
export function Callout({ tone, title, tag, children, className }: { tone: "caution" | "blocked" | "info" | "upcoming"; title?: ReactNode; tag?: ReactNode; children: ReactNode; className?: string }) {
  const styles = {
    // one shape for the tones: a thin frame, a 4 px edge at the start, the fill tells a warning from a note
    caution: "bg-caution-subtle text-caution-foreground border border-caution-border border-s-4 border-s-caution",
    blocked: "bg-blocked-subtle text-blocked-foreground border border-blocked-border border-s-4 border-s-blocked",
    info: "bg-card text-foreground border border-info-border border-s-4 border-s-info",
    upcoming: "bg-card text-foreground border border-info-border border-s-4 border-s-info",
  }[tone];
  const icon =
    tone === "caution" ? <IconAlert size={20} className="text-caution shrink-0 mt-0.5" /> : tone === "blocked" ? <IconLock size={20} className="text-blocked shrink-0 mt-0.5" /> : tone === "upcoming" ? <IconCalendar size={20} className="text-info-foreground shrink-0 mt-0.5" /> : <IconInfo size={20} className="text-info-foreground shrink-0 mt-0.5" />;
  const box = (
    <div role="note" className={cx("flex gap-2.5 text-sm rounded-md px-3.5 py-3", styles, className)}>
      {icon}
      <div className="flex flex-col gap-1 min-w-0">
        {(title || tag) && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {title && <span className="font-medium">{title}</span>}
            {tag && <span className="inline-flex items-center rounded-full border border-info-border px-2 text-xs text-info-foreground tabular-nums">{tag}</span>}
          </span>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
  return tone === "upcoming" ? <AheadSaidCtx.Provider value>{box}</AheadSaidCtx.Provider> : box;
}
