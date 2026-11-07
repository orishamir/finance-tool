// The options a checklist row's open question blocks, grouped by the question each option's own record names (2026-11-07: one
// option's question is never shown as another's). Promoted from components/guide/sections.tsx when the goal comparison and exposure
// mode both used it (third check, 2026-11-07); design-system 11, "BlockedGroups".
import type { ReactNode } from "react";
import { IdRef } from "../provenance";
import { cx } from "./cx";

/**
 * `lead` names what the block does ("מונע דירוג של:" only where it keeps the options from rank, else "חסום ל:"); `chips` false when
 * the row's head already shows the one question; `tone` "blocked" under a row that is otherwise covered.
 * A group with no question named (a bare `blocked`, which the data check refuses) shows its names alone.
 */
export function BlockedGroups({ lead, groups, names, chips = true, tone = "muted" }: { lead: ReactNode; groups: readonly { code: string; options: readonly string[] }[]; names: Record<string, string>; chips?: boolean; tone?: "muted" | "blocked" }) {
  return (
    <span className={cx("text-xs", tone === "blocked" ? "text-blocked-foreground" : "text-muted-foreground")}>
      {lead}{" "}
      {groups.map((g, i) => (
        <span key={g.code || i}>
          {i > 0 && "; "}
          {g.options.map((id) => names[id] ?? id).join(", ")}
          {/* the chip has its own border: no parentheses around it (fourth check, 2026-11-07) */}
          {chips && g.code && (
            <>
              {" "}
              <IdRef id={g.code} />
            </>
          )}
        </span>
      ))}
    </span>
  );
}
