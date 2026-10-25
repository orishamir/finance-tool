// A note that stands out from the text (design-system 3.9).
import type { ReactNode } from "react";
import { IconAlert, IconInfo, IconLock } from "../icons";
import { cx } from "./cx";

/** A boxed note under a result: `caution` for stale or weak, `blocked` for an open rule, `info` for a neutral remark. Short; one to three sentences. */
export function Callout({ tone, title, children, className }: { tone: "caution" | "blocked" | "info"; title?: ReactNode; children: ReactNode; className?: string }) {
  const styles = {
    caution: "bg-caution-subtle text-caution-foreground",
    blocked: "bg-blocked-subtle text-blocked-foreground",
    info: "bg-card text-foreground border border-border",
  }[tone];
  const icon = tone === "caution" ? <IconAlert size={18} className="text-caution shrink-0 mt-0.5" /> : tone === "blocked" ? <IconLock size={18} className="text-blocked shrink-0 mt-0.5" /> : <IconInfo size={18} className="text-primary shrink-0 mt-0.5" />;
  return (
    <div role="note" className={cx("flex gap-2.5 text-sm rounded-md px-3.5 py-3", styles, className)}>
      {icon}
      <div className="flex flex-col gap-1 min-w-0">
        {title && <span className="font-medium">{title}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
}
