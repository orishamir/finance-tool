// The fit mark (design-spec 10, flow 18): a card on the track page, a small mark on each track row of the company
// page. The saved goal lives on the device, so both read it after hydration; the pages themselves are pre-rendered
// with the fit table. "Does not fit" and "no rule" are answers, not warnings: muted, never red.
import { createContext, useContext, type ReactNode } from "react";
import { Link } from "react-router";
import { fit as copy, r5 } from "../../copy";
import { Tpl } from "../exposure-mode/tpl";
import { fmt } from "../../lib/format";
import { fitOf, type FitResult, type FitTableData } from "../../lib/fit";
import { useGoals } from "../../lib/goal";
import type { Staleness } from "../../lib/value";
import { IconClock } from "../icons";
import { Num } from "../provenance";
import { Card, cx, LinkButton } from "../kit";
import { goalTitle } from "./goal-form";
import { IconDash, IconHelp, IconOk } from "./icons";

interface FitCtx {
  table: FitTableData;
  stale: Staleness | null;
}

const FitContext = createContext<FitCtx | null>(null);

/** Gives the company page's rows the fit table. */
export function FitProvider({ table, stale, children }: { table: FitTableData; stale: Staleness | null; children: ReactNode }) {
  return <FitContext.Provider value={{ table, stale }}>{children}</FitContext.Provider>;
}

type TrackClass = { specialization: string; subSpecialization: string; classification: string };

/** The saved goal's horizon in years, or null when there is no saved goal (or it has no horizon yet). */
export function useGoalHorizon(): { years: number; name: string; acceptedFall: number | null } | null {
  const { status, current, resolved } = useGoals();
  if (status === "loading" || status === "old-version" || !current || !resolved) return null;
  const years = resolved.horizonYears;
  if (years === null || years < 1) return null;
  return { years, name: goalTitle(current), acceptedFall: current.assumptions.acceptedFall ?? null };
}

function Mark({ result, size = 24, word = true, className }: { result: FitResult; size?: 14 | 16 | 24; word?: boolean; className?: string }) {
  const Icon = result.kind === "fits" ? IconOk : result.kind === "no-fit" ? IconDash : IconHelp;
  return (
    <span className={cx("inline-flex items-center gap-2", result.kind === "fits" ? "text-positive" : "text-muted-foreground", className)}>
      <Icon size={size} />
      {word && <span className={size === 24 ? "text-lg font-medium" : "text-xs"}>{copy.marks[result.kind]}</span>}
    </span>
  );
}

/** The card under the track page's h1 (the slot reserved in release 1): "מתאים למטרה שלכם?". */
export function FitMarkCard({ table, track, stale, period }: { table: FitTableData; track: TrackClass; stale: Staleness | null; period: string }) {
  const { status } = useGoals();
  const goal = useGoalHorizon();
  if (status === "loading") return <div className="h-28 rounded-lg bg-card border border-border animate-pulse" aria-hidden="true" />;
  if (!goal) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{copy.heading}</h2>
        <p className="text-muted-foreground">{copy.noGoal}</p>
        <Link to="/goal" className="text-link min-h-target inline-flex items-center self-start hover:underline">
          {copy.noGoalLink}
        </Link>
      </Card>
    );
  }
  const result = fitOf(table, track, goal.years, goal.acceptedFall);
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{copy.heading}</h2>
      <p className="flex items-center gap-2 flex-wrap">
        <Mark result={result} />
        {stale && <IconClock size={16} className="text-caution" />}
      </p>
      <p className="text-sm max-w-measure">
        {copy.goalLine}
        <bdi>{goal.name}</bdi>
        {copy.goalLineMid}
        {fmt.years(goal.years)}.{" "}
        {goal.acceptedFall !== null && result.kind !== "no-rule" && result.fall ? <Tpl t={r5.additions.fitLossLine} vars={{ accepted: <span className="text-entered"><bdi dir="ltr">{fmt.pct(goal.acceptedFall)}</bdi></span> }} /> : copy.horizonOnly}
      </p>
      {result.kind !== "no-rule" && result.fall && (
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 max-w-measure">
          <Tpl t={result.fall.met ? r5.additions.fitTrackSide : r5.additions.fitNotMet} vars={{ max: <Num value={result.fall.max} display={fmt.pct(result.fall.max.value as number)} />, accepted: <bdi dir="ltr">{fmt.pct(result.fall.accepted)}</bdi> }} />
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.ruleBefore}
        <bdi>{result.classification}</bdi>
        {copy.ruleAfter}
        {result.kind !== "no-rule" && ":"}
        {result.kind !== "no-rule" && (
          <>
            {" "}
            {copy.ruleRange}<Num value={result.minYears} display={fmt.years(result.minYears.value as number)} />
          </>
        )}
      </p>
      {stale && (
        <p className="text-sm text-caution-foreground">
          {copy.stale} <bdi dir="ltr">{fmt.period(period)}</bdi>.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
        <LinkButton to="/goal/compare" variant="primary">
          {copy.toCompare}
        </LinkButton>
        <Link to="/goal" className="text-link min-h-target inline-flex items-center hover:underline">
          {copy.changeGoal}
        </Link>
      </div>
    </Card>
  );
}

/** A company page row's mark: the icon and the word, on every track (a classification with no rule reads "אין כלל לסיווג הזה", muted). Nothing without a saved goal. */
export function RowFit({ track }: { track: TrackClass }) {
  const ctx = useContext(FitContext);
  const goal = useGoalHorizon();
  if (!ctx || !goal) return null;
  const result = fitOf(ctx.table, track, goal.years, goal.acceptedFall);
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${copy.rowAria} ${copy.marks[result.kind]}`}>
      <Mark result={result} size={16} word={false} />
      <span className={cx("text-xs", result.kind === "fits" ? "text-positive" : "text-muted-foreground")} aria-hidden="true">
        {copy.marks[result.kind]}
      </span>
      {ctx.stale && <IconClock size={14} className="text-caution" />}
    </span>
  );
}
