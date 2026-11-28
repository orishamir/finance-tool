// What a calculation needs, as a form fills it: each item with its state and, where it is not done, what that leaves (`NeedList`); and on a
// narrow box the form's foot, which says where the calculation stands in one line, opens the list over it, and holds the save (`NeedBar`).
import { useState, type ReactNode } from "react";
import { kit as copy } from "../../copy";
import { IconAlert, IconCheck, IconChevronUp, IconInfo, IconMinus } from "../icons";
import { Button } from "./button";
import { cx } from "./cx";

/** Done; missing, so there is no result; left out, so the result stands without it; or not known, so something stands in for it. */
export type NeedState = "done" | "missing" | "left-out" | "stand-in";

export interface NeedItem {
  id: string;
  text: ReactNode;
  state: NeedState;
  /** What the state leaves, after its word: why it is missing, what is not counted, or what stands in. */
  note?: ReactNode;
}

const MARK: Record<NeedState, { icon: ReactNode; tone: string }> = {
  done: { icon: <IconCheck size={14} />, tone: "text-primary" },
  missing: { icon: <IconAlert size={14} />, tone: "text-destructive" },
  "left-out": { icon: <IconMinus size={14} />, tone: "text-caution-foreground" },
  "stand-in": { icon: <IconInfo size={14} />, tone: "text-caution-foreground" },
};

/**
 * The items, one under the other: a mark of its state in its colour, the item, and under one that is not done the word of its state with
 * what it leaves, so the state is said in words too.
 */
export function NeedList({ items }: { items: readonly NeedItem[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((x) => (
        <li key={x.id} className="flex items-start gap-2.5 min-w-0">
          <span aria-hidden="true" className={cx("mt-1 inline-flex shrink-0", MARK[x.state].tone)}>
            {MARK[x.state].icon}
          </span>
          <span className="flex flex-col gap-0.5 min-w-0 text-sm">
            <span>{x.text}</span>
            {x.state !== "done" && (
              <span className="text-xs text-muted-foreground">
                <span className={MARK[x.state].tone}>{copy.needStates[x.state]}</span>
                {x.note ? <>: {x.note}</> : null}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The foot of a form on a narrow box, kept in sight at the bottom of what scrolls: where the calculation stands (`status`, a few words), the
 * button that opens what it needs (`list`, its label `listLabel`) over the line, and the form's one action under it (`action`).
 */
export function NeedBar({ status, listLabel, list, action }: { status: ReactNode; listLabel: string; list: ReactNode; action: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky bottom-0 z-(--z-sticky) flex flex-col gap-2 border-t border-border bg-popover pt-2 pb-3">
      {open && <div className="max-h-[50dvh] overflow-y-auto py-2">{list}</div>}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-sm min-w-0">{status}</span>
        <Button variant="quiet" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 text-sm">
          {listLabel}
          <IconChevronUp size={16} className={cx("transition-transform duration-(--duration-fold)", open && "rotate-180")} />
        </Button>
      </div>
      {action}
    </div>
  );
}
