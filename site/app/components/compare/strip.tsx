// The saved-goal strip (design-spec 6.3, 10; flows 17): the goal on this device, with its actions, wherever it
// matters. The full form is mounted on the comparison; the compact form is for company and track pages.
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";
import { r2, r3workbench } from "../../copy";
import { deleteDoc, isBlank, resolveGoal, useGoals, type Goal, type Presets } from "../../lib/goal";
import { stripValues, type PresetMeta } from "../../lib/goal-values";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { Button, cx } from "../ui";
import { RevisitLine, CompactRevisit, UnreadableSavedForm, WhatChangedSheet } from "../revisit/revisit";
import { useRevisit } from "../revisit/use-revisit";
import { deleteSavedComparison, isoToday, type CompareMode } from "../../lib/state";
import { computed } from "../../lib/value";
import { goalTitle } from "./goal-form";
import { IconMore, IconTarget } from "./icons";

export interface StripProps {
  variant?: "full" | "compact";
  presets: Presets;
  meta: PresetMeta;
  today: string;
  /** The "לתוצאה" link; hidden on the result itself. */
  showResultLink?: boolean;
  editHref?: string;
  resultHref?: string;
  /** The line under the title (the comparison says it is recomputed with today's data). */
  note?: string;
  /** The compact form's lead-in, when a page says what the goal is for ("ההתאמה לפי המטרה השמורה:"). */
  label?: string;
  /** With no saved goal: the quiet line with the link to the form (the first page), instead of nothing. */
  emptyLine?: boolean;
  /** The mode of the page the strip is on (the comparison result): its saved comparison is the one the revisit line speaks of; elsewhere the most recently saved one. */
  revisitMode?: CompareMode;
  /** On the comparison: saves it from the menu, without the scroll to the bottom button (audit 2026-10-24, A71). `again` when one is saved already. */
  saveAction?: { run: () => void; again: boolean } | null;
  /** Every goal as a row of its own, in their order (the first page, 2026-10-25); otherwise the current goal's row and the others as chips. */
  all?: boolean;
}

export function SavedGoalStrip({ variant = "full", presets, meta, today, showResultLink = true, editHref = "/goal", resultHref = "/goal/compare", note, label, emptyLine, revisitMode, saveAction, all }: StripProps) {
  const { status, goals, current, resolved, select, restart } = useGoals();
  const { saved, view: revisit } = useRevisit(revisitMode);

  if (status === "loading") return variant === "compact" ? null : emptyLine ? <div className="h-14" aria-hidden="true" /> : <div className="h-14 rounded-lg bg-card border border-border animate-pulse" aria-hidden="true" />;
  if (status === "old-version") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card px-4 py-2 min-h-14">
        <span className="text-sm">{r2.form.oldVersion}</span>
        <span className="flex items-center gap-2">
          <Button variant="quiet" onClick={restart}>
            {r2.form.oldVersionActions.restart}
          </Button>
          <Button variant="destructive" onClick={() => deleteDoc()}>
            {r2.form.oldVersionActions.delete}
          </Button>
        </span>
      </div>
    );
  }
  if (status === "unavailable") return null;
  // No goal saved yet (an empty form leaves no trace): absent everywhere but the first page, which says so quietly.
  if (!current || !resolved || (all ? goals.every(isBlank) : isBlank(current))) {
    if (!emptyLine || variant === "compact") return null;
    return (
      <p className="text-sm text-muted-foreground">
        {r2.strip.none}{" "}
        <Link to={editHref} className="text-link inline-flex items-center min-h-target hover:underline align-middle">
          {r2.strip.noneLink}
        </Link>
      </p>
    );
  }
  const v = stripValues(current, resolved, presets, meta, today);

  if (variant === "compact") {
    return (
      <p className="text-sm flex flex-wrap items-center gap-x-1.5">
        <span className="text-muted-foreground">{label ?? r2.strip.compact}</span>
        <bdi className="font-medium">{goalTitle(current)}</bdi>
        {saved && <CompactRevisit view={revisit} />}
        {v.years && (
          <>
            <span aria-hidden="true">·</span>
            <Num value={v.years} display={fmt.years(v.years.value as number)} />
          </>
        )}
        <Link to={editHref} className="text-link min-h-target inline-flex items-center hover:underline">
          {r2.strip.change}
        </Link>
      </p>
    );
  }

  const row = { presets, meta, today, showResultLink, editHref, resultHref, revisitMode, saveAction };
  if (all) {
    return (
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-2">
          {goals.map((g) => (
            <li key={g.id}>
              <GoalRow goal={g} {...row} />
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">{goals.length > 1 ? r2.strip.savedAll : r2.strip.saved}</p>
      </div>
    );
  }
  const others = goals.filter((g) => g.id !== current.id);
  return (
    <div className="flex flex-col gap-2">
      <GoalRow goal={current} {...row} note={note ? `${r2.strip.saved} · ${note}` : r2.strip.saved} />
      {others.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {others.map((g) => (
            <li key={g.id}>
              <button type="button" className="sec-chip border border-border bg-card hover:bg-accent" onClick={() => select(g.id)}>
                <bdi>{goalTitle(g)}</bdi>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One goal's row: its name, years and sum, its saved comparison's line, "לתוצאה", "עריכה" and the menu. A row of a goal
 * other than the current one makes it current before its link opens the page (the next page reads the device as it mounts).
 */
function GoalRow({ goal, presets, meta, today, showResultLink, editHref, resultHref, note, revisitMode, saveAction }: { goal: Goal; presets: Presets; meta: PresetMeta; today: string; showResultLink: boolean; editHref: string; resultHref: string; note?: string; revisitMode?: CompareMode; saveAction?: { run: () => void; again: boolean } | null }) {
  const { current, select, add, remove } = useGoals();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { saved, view: revisit } = useRevisit(revisitMode, goal);
  const [sheet, setSheet] = useState<HTMLElement | null | false>(false);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setMenu(false);
        setConfirm(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);
  const blank = isBlank(goal);
  const v = blank ? null : stripValues(goal, resolveGoal(goal, presets), presets, meta, today);
  const choose = () => {
    if (current?.id !== goal.id) flushSync(() => select(goal.id));
  };
  const linkCls = "text-link text-sm min-h-target px-2 inline-flex items-center hover:underline";
  return (
    <>
      <div ref={ref} className="relative flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 min-h-14">
        <IconTarget className="text-muted-foreground shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0">
            <bdi className="font-medium">{goalTitle(goal)}</bdi>
            {v ? (
              <span className="text-sm flex items-center gap-1.5">
                {v.years && <Num value={v.years} display={fmt.years(v.years.value as number)} />}
                {v.years && v.amount && <span aria-hidden="true">·</span>}
                {v.amount && <Num value={v.amount} display={Number.isInteger(v.amount.value) ? fmt.nisWhole(v.amount.value as number) : undefined} />}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{r2.strip.blank}</span>
            )}
          </span>
          {note && <span className="text-xs text-muted-foreground">{note}</span>}
          {saved && revisit?.status !== "unreadable" && (
            <RevisitLine view={revisit} savedOn={saved.savedOn} choice={saved.choice} computing={revisit === null} onOpen={() => setSheet(document.activeElement as HTMLElement | null)} />
          )}
        </div>
        <div className="flex items-center shrink-0 -me-2">
          {showResultLink && !blank && (
            <Link to={resultHref} onClick={choose} className={linkCls}>
              {r2.strip.toResult}
            </Link>
          )}
          <Link to={editHref} onClick={choose} className={linkCls}>
            {blank ? r2.strip.fill : r2.strip.edit}
          </Link>
          <Button variant="icon" aria-label={r2.strip.menu} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <IconMore />
          </Button>
        </div>
        {menu && (
          <div role="menu" className="absolute top-full end-0 mt-1 z-[var(--z-popover)] min-w-56 rounded-lg border border-border bg-popover p-1 shadow-md" onKeyDown={(e) => e.key === "Escape" && setMenu(false)}>
            {confirm ? (
              <div className="p-3 flex flex-col gap-2">
                <span className="text-sm">{r2.strip.confirm}</span>
                <span className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      remove(goal.id);
                      setMenu(false);
                      setConfirm(false);
                    }}
                  >
                    {r2.strip.confirmYes}
                  </Button>
                  <Button variant="quiet" onClick={() => setConfirm(false)}>
                    {r2.strip.confirmNo}
                  </Button>
                </span>
              </div>
            ) : (
              <>
                {saveAction && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-start min-h-target px-3 rounded-md hover:bg-accent"
                    onClick={() => {
                      saveAction.run();
                      setMenu(false);
                    }}
                  >
                    {saveAction.again ? r2.result.saveMenuAgain : r2.result.saveMenu}
                  </button>
                )}
                <MenuLink to={editHref} onClick={() => add()} label={r2.strip.add} />
                <button type="button" role="menuitem" className="w-full text-start min-h-target px-3 rounded-md hover:bg-accent" onClick={() => setConfirm(true)}>
                  {r2.strip.delete}
                </button>
                <MenuLink to={r3workbench.entry.transfer.href} onClick={() => setMenu(false)} label={r3workbench.entry.transfer.label} />
              </>
            )}
          </div>
        )}
      </div>
      {saved && revisit?.status === "unreadable" && (
        <UnreadableSavedForm
          view={revisit}
          onRedo={() => {
            choose();
            navigate(`/goal/compare${saved.mode === "exposure" ? "?mode=exposure" : ""}`);
          }}
          onDelete={() => deleteSavedComparison(saved.goalId, saved.mode)}
        />
      )}
      {saved && revisit && revisit.status !== "unreadable" && (
        <WhatChangedSheet
          view={revisit}
          open={sheet !== false}
          onClose={() => setSheet(false)}
          anchor={sheet || null}
          today={today}
          nis={(val, about) => <Num value={computed(val, "nis", "F-06", {}, { today: isoToday(), about })} />}
        />
      )}
    </>
  );
}

function MenuLink({ to, onClick, label }: { to: string; onClick: () => void; label: string }) {
  return (
    <Link to={to} role="menuitem" onClick={onClick} className={cx("flex items-center min-h-target px-3 rounded-md hover:bg-accent")}>
      {label}
    </Link>
  );
}

export { resolveGoal };
export type { Goal };
