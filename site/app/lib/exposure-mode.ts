// Exposure mode in the browser (release 5, flows 34 and 38, design-spec 21 and 22): every exposure record goes
// through the wrapper that holds it (P-08, or the person's choice) at the return the person typed, filtered by the
// fall they expect against the fall they accept (F-71), and ranked (F-80). The engine returns codes; this file shapes
// them into what the page shows. No return, fall or rate is written here: each is entered by the person, or is a
// published bank rate from the bundle, or is the run's computed value.
import {
  compareExposures,
  rankCandidates,
  type ExposureCandidate,
  type ExposureComparison,
  type ExposureHolding,
  type LossFilterEntered,
  type OutcomeKind,
  type Reason,
  type RunContext,
  type RunResult,
} from "@finance-tool/engine";
import type { ParameterRecord, ValueObject, WrapperId } from "@finance-tool/schema";
import { comparisonGoal, parameterOf, termsFor, yearSeries, type CompareBundle, type ExposureEntry, type RunGoal, type WrapperEntry } from "./compare";
import type { ExposureInputs, FieldKey, Goal } from "./goal";
import { entered as enteredValue, type SiteValue } from "./value";

const FUND_WRAPPERS = new Set<string>(["brokerage-account", "money-market-fund-daily", "money-market-fund-renewable"]);

// ---------------------------------------------------------------- P-08

export interface HoldingRule {
  wrapperId: WrapperId;
  /** "evaluated", "not-evaluated" (an open question stops it) or "needs-fund" (a fund record is needed). */
  status: string;
  blockedBy?: string;
  /** The parameter's own value object (for the chip's provenance sheet), with the parameter marker. */
  value: SiteValue;
}

/** P-08's row for an exposure, or null when the parameter has none. */
export function holdingRule(bundle: CompareBundle, exposureId: string): HoldingRule | null {
  const p = parameterOf(bundle, "P-08") as ParameterRecord & { holding?: Record<string, { wrapper_id: ValueObject; status?: string; blocked_by?: string }> };
  const row = p.holding?.[exposureId];
  if (!row) return null;
  const value: SiteValue = { ...row.wrapper_id, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null, signedOffOn: p.signed_off_on ?? null, provisional: false } };
  return { wrapperId: row.wrapper_id.value as WrapperId, status: row.status ?? "evaluated", ...(row.blocked_by ? { blockedBy: row.blocked_by } : {}), value };
}

// ---------------------------------------------------------------- the input and the view

export interface ExposureModeInput {
  bundle: CompareBundle;
  g: RunGoal;
  goal: Goal;
}

/** A reason as the page words it: an engine code, or one of the site's own for a row that cannot run yet. */
export type RowReason = { code: "engine"; reason: Reason } | { code: "p08-gov"; blockedBy: string } | { code: "no-fund" } | { code: "no-terms" } | { code: "no-wrapper" };

export interface ExposureRowView {
  id: string;
  entry: ExposureEntry;
  candidate: ExposureCandidate;
  kind: OutcomeKind;
  rank?: number;
  tiedWith: string[];
  run?: RunResult;
  real?: number;
  nominal?: number;
  /** The return the run used: the person's (entered) or a published rate (sourced). */
  grossReturn?: ValueObject;
  /** The person's own return (or overriding cash rate), as typed. */
  enteredReturn?: ValueObject;
  published?: { rate: SiteValue; effectiveFrom: string | null; stale: boolean; wrapperName: string };
  noSeries: boolean;
  worstFall?: ValueObject;
  acceptedFall: { value?: ValueObject; perExposure: boolean };
  holding: { wrapperId: WrapperId | null; name?: string; fromParameter: boolean; parameter: SiteValue | null; options: { id: WrapperId; name: string }[] };
  lossNote?: "worst-fall" | "largest-fall-accepted";
  exclusion?: { worst: number; accepted: number };
  /** Kept by the filter, with both numbers (the row detail says so). */
  passed?: { worst: number; accepted: number };
  reasons: RowReason[];
  deciding?: { formula: "deposit-side-relief" | "fee-drag" | "tax-at-exit" | "lock-up"; mine: number; above: number };
  wrapperEntry?: WrapperEntry;
}

export type HeadlineKind = "winner" | "single" | "tie" | "all-tied" | "none" | "all-excluded" | "no-return";

export interface ExposureResultView {
  rows: ExposureRowView[];
  ranked: ExposureRowView[];
  listed: ExposureRowView[];
  excluded: ExposureRowView[];
  notEvaluated: ExposureRowView[];
  notEligible: ExposureRowView[];
  headline: { kind: HeadlineKind; winner?: ExposureRowView; sourcedWinner: boolean; topTie: string[] };
  comparison: ExposureComparison;
  ctx: RunContext;
  theta: number;
  /** A ranked cash-like exposure drawn as the chart's reference line. */
  referenceId: string | null;
  lossFilter: LossFilterEntered;
  returns: Record<string, ValueObject>;
  holding: Record<string, string>;
  /** Whether a person-entered return exists anywhere. */
  anyEntered: boolean;
}

const pct = (v: number, today: string) => enteredValue(v, "pct", today);

/** The person's loss filter as the engine takes it: every number an `entered` value object in `pct`. */
export function lossFilterOf(goal: Goal, today: string): LossFilterEntered {
  const worstFall: Record<string, ValueObject> = {};
  const acceptedFallById: Record<string, ValueObject> = {};
  for (const [id, x] of Object.entries(goal.exposures ?? {})) {
    if (x.worstFall) worstFall[id] = x.worstFall;
    if (x.acceptedFall) acceptedFallById[id] = x.acceptedFall;
  }
  const a = goal.assumptions.acceptedFall;
  return { worstFall, ...(a !== null && a !== undefined ? { acceptedFall: pct(a, today) } : {}), ...(Object.keys(acceptedFallById).length > 0 ? { acceptedFallById } : {}) };
}

function wrapperName(bundle: CompareBundle, id: string): string {
  return bundle.wrappers.find((w) => w.id === id)?.name ?? id;
}

type Plan = { entry: ExposureEntry; wrapperId: WrapperId | null; fromParameter: boolean; blocked: RowReason | null; wrapper?: WrapperEntry; terms?: ExposureHolding["terms"]; gross?: ValueObject; published?: ExposureRowView["published"] };

/** Runs exposure mode (F-71, F-83, F-80) for the saved goal at the bundle's data. Throws the engine's data errors. */
export function computeExposureMode({ bundle, g, goal }: ExposureModeInput): ExposureResultView {
  const today = bundle.runDate;
  const ctx: RunContext = { rules: bundle.rules, runDate: bundle.runDate };
  const entries = bundle.exposures ?? [];
  const byWrapper = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const needs: Partial<Record<string, FieldKey>> = {};
  const inputsOf = (id: string): ExposureInputs => goal.exposures?.[id] ?? {};

  const plans: Plan[] = entries.map((entry): Plan => {
    const rule = holdingRule(bundle, entry.record.id);
    const mine = inputsOf(entry.record.id);
    const wrapperId = (mine.wrapperId ?? rule?.wrapperId ?? null) as WrapperId | null;
    const fromParameter = !mine.wrapperId;
    const base = { entry, wrapperId, fromParameter };
    if (!wrapperId) return { ...base, blocked: { code: "no-wrapper" } };
    const wrapper = byWrapper.get(wrapperId);
    if (!wrapper) return { ...base, blocked: { code: "no-wrapper" } };
    if (fromParameter && rule?.status === "not-evaluated") return { ...base, wrapper, blocked: { code: "p08-gov", blockedBy: rule.blockedBy ?? "" } };
    let terms: ExposureHolding["terms"];
    if (FUND_WRAPPERS.has(wrapperId)) {
      // the terms follow the fund collected for this exposure (data/funds `exposure_id`); none collected: not evaluated
      const held = bundle.exposureTerms?.[entry.record.id]?.[wrapperId];
      if (!held) return { ...base, wrapper, blocked: { code: "no-fund" } };
      terms = held.terms;
    } else {
      terms = termsFor(wrapper, g, {}, needs);
      if (!terms) return { ...base, wrapper, blocked: { code: "no-terms" } };
    }
    // the return: the person's, else a bank's published rate for a deposit-family holding wrapper (D20)
    let gross: ValueObject | undefined = mine.return;
    let published: Plan["published"];
    if (wrapper.cashRate) {
      published = { rate: wrapper.cashRate, effectiveFrom: wrapper.cashRate.effective_from ?? null, stale: !!wrapper.cashRate.stale, wrapperName: wrapper.name };
      gross ??= wrapper.cashRate;
    }
    return { ...base, blocked: null, wrapper, terms, ...(gross ? { gross } : {}), ...(published ? { published } : {}) };
  });

  const holdings: ExposureHolding[] = plans.map((p) => ({
    exposure: p.entry.record,
    ...(p.blocked ? {} : { wrapper: p.wrapper!.record, ...(p.terms ? { terms: p.terms } : {}), ...(p.gross ? { grossReturn: p.gross } : {}) }),
  }));
  const lf = lossFilterOf(goal, today);
  const comparison = compareExposures({ exposures: holdings, parameters: bundle.parameters, goal: comparisonGoal(g), lossFilter: lf }, ctx);
  const theta = ((parameterOf(bundle, "P-01") as unknown as { value: ValueObject }).value.value as number) / 100;

  const cand = new Map(comparison.candidates.map((c) => [c.id, c]));
  const ranking = comparison.ranking.entries;
  const groups: number[] = [];
  ranking.forEach((_, i) => {
    if (i > 0 && (ranking[i - 1]!.gapToNext ?? 1) < theta) groups[i] = groups[i - 1]!;
    else groups[i] = i;
  });

  const rowOf = (p: Plan): ExposureRowView => {
    const id = p.entry.record.id;
    const c = cand.get(id)!;
    const mine = inputsOf(id);
    const i = ranking.findIndex((e) => e.id === id);
    const verdict = c.lossFilter;
    const reasons: RowReason[] = [];
    if (p.blocked) reasons.push(p.blocked);
    else for (const r of c.reasons) reasons.push({ code: "engine", reason: r });
    const noSeries = c.reasons.some((r) => r.code === "no-sourced-series");
    const acceptedValue = mine.acceptedFall ?? (lf.acceptedFall as ValueObject | undefined);
    let deciding: ExposureRowView["deciding"];
    if (i > 0) {
      const above = cand.get(ranking[i - 1]!.id)!;
      const pair = rankCandidates([above, c], { theta, ctx }).topTwo?.deciding;
      if (pair?.formula) deciding = { formula: pair.formula, mine: pick(pair.formula, pair.second), above: pick(pair.formula, pair.top) };
    }
    const group = i >= 0 ? ranking.map((_, j) => j).filter((j) => groups[j] === groups[i]) : [];
    return {
      id,
      entry: p.entry,
      candidate: c,
      kind: c.kind,
      ...(i >= 0 ? { rank: groups[i]! + 1 } : {}),
      tiedWith: group.map((j) => ranking[j]!.id).filter((x) => x !== id),
      ...(c.run ? { run: c.run, real: c.run.real, nominal: c.run.nominal } : {}),
      ...(c.returnLabel ? { grossReturn: c.returnLabel.rate } : p.gross ? { grossReturn: p.gross } : {}),
      ...(mine.return ? { enteredReturn: mine.return } : {}),
      ...(p.published ? { published: p.published } : {}),
      noSeries,
      ...(mine.worstFall ? { worstFall: mine.worstFall } : {}),
      acceptedFall: { ...(acceptedValue ? { value: acceptedValue } : {}), perExposure: !!mine.acceptedFall },
      holding: {
        wrapperId: p.wrapperId,
        ...(p.wrapperId ? { name: wrapperName(bundle, p.wrapperId) } : {}),
        fromParameter: p.fromParameter,
        parameter: p.fromParameter ? (holdingRule(bundle, id)?.value ?? null) : null,
        options: (p.entry.record.wrapper_ids ?? []).map((w) => ({ id: w, name: wrapperName(bundle, w) })),
      },
      ...(verdict.verdict === "not-evaluated" && c.kind !== "excluded" && verdict.missing ? { lossNote: verdict.missing } : {}),
      ...(verdict.verdict === "excluded" ? { exclusion: { worst: verdict.worstFall!, accepted: verdict.accepted! } } : {}),
      ...(verdict.verdict === "kept" ? { passed: { worst: verdict.worstFall!, accepted: verdict.accepted! } } : {}),
      reasons,
      ...(deciding ? { deciding } : {}),
      ...(p.wrapper ? { wrapperEntry: p.wrapper } : {}),
    };
  };
  const all = plans.map(rowOf);
  const ranked = ranking.map((e) => all.find((r) => r.id === e.id)!).filter(Boolean);
  const byKind = (k: OutcomeKind) => all.filter((r) => r.kind === k);

  const anyEntered = all.some((r) => r.enteredReturn);
  const enteredRows = all.filter((r) => r.grossReturn?.state === "entered");
  let kind: HeadlineKind = "winner";
  if (enteredRows.length > 0 && enteredRows.every((r) => r.kind === "excluded")) kind = "all-excluded";
  else if (ranked.length === 0) kind = enteredRows.length === 0 ? "no-return" : "none";
  else if (ranked.length === 1) kind = "single";
  else if (comparison.ranking.tieSet.length === ranked.length) kind = "all-tied";
  else if (comparison.ranking.tieSet.length > 1) kind = "tie";
  const winner = ranked[0];

  const reference = ranked.find((r) => r.id === "shekel-cash") ?? ranked.find((r) => r.entry.record.cash_like);
  const returns: Record<string, ValueObject> = {};
  const holding: Record<string, string> = {};
  for (const r of all) {
    if (r.grossReturn) returns[r.id] = r.grossReturn;
    if (r.holding.wrapperId) holding[r.id] = r.holding.wrapperId;
  }
  return {
    rows: all,
    ranked,
    listed: byKind("listed-not-ranked"),
    excluded: byKind("excluded"),
    notEvaluated: byKind("not-evaluated"),
    notEligible: byKind("not-eligible"),
    headline: { kind, ...(winner ? { winner } : {}), sourcedWinner: winner?.grossReturn?.state === "sourced", topTie: comparison.ranking.tieSet.length > 1 ? [...comparison.ranking.tieSet] : [] },
    comparison,
    ctx,
    theta,
    referenceId: reference?.id ?? null,
    lossFilter: lf,
    returns,
    holding,
    anyEntered,
  };
}

function pick(f: "deposit-side-relief" | "fee-drag" | "tax-at-exit" | "lock-up", d: { depositSideRelief: number; feeDrag: number; taxAtExit: number; lockUp: number }): number {
  return f === "deposit-side-relief" ? -d.depositSideRelief : f === "fee-drag" ? d.feeDrag : f === "tax-at-exit" ? d.taxAtExit : d.lockUp;
}

// ---------------------------------------------------------------- the chart

export type SeriesRole = "option-1" | "option-2" | "option-3" | "baseline";

export interface ExposureSeriesLine {
  id: string;
  name: string;
  role: SeriesRole;
  entered: boolean;
  tiedWith: string[];
  points: { year: number; real: number; nominal: number }[];
}

/** The default selection: ranks 1 to 3 beyond the reference, and the reference (a ranked cash-like exposure). */
export function defaultSelection(view: ExposureResultView): string[] {
  const options = view.ranked.filter((r) => r.id !== view.referenceId).slice(0, 3).map((r) => r.id);
  return view.referenceId ? [...options, view.referenceId] : options;
}

/** Lines for the selected ids (at most three beyond the reference). A role is positional: the order of the selection by rank, not the exposure. */
export function seriesFor(view: ExposureResultView, g: RunGoal, selected: readonly string[]): ExposureSeriesLine[] {
  const ids = new Set(selected);
  const options = view.ranked.filter((r) => ids.has(r.id) && r.id !== view.referenceId).slice(0, 3);
  const roles: SeriesRole[] = ["option-1", "option-2", "option-3"];
  const line = (r: ExposureRowView, role: SeriesRole): ExposureSeriesLine => ({
    id: r.id,
    name: r.entry.name,
    role,
    entered: r.grossReturn?.state === "entered",
    tiedWith: r.tiedWith,
    points: yearSeries(r.candidate, view.ctx, g.horizonYears, g.amountNow - g.available),
  });
  const out = options.map((r, i) => line(r, roles[i]!));
  const ref = view.ranked.find((r) => r.id === view.referenceId);
  if (ref && ids.has(ref.id)) out.push(line(ref, "baseline"));
  return out;
}
