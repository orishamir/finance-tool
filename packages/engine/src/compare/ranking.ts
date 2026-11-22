// F-80 Ranking and ties. Candidates are ranked on one number, the real liquidation value at the horizon (B1).
// Two options are a tie when their relative difference is below the tie threshold P-01. The formula that
// decides between the top two is found by re-running both with one component removed (an F-61-style
// decomposition) and naming the largest difference.
import { parameterRecord } from "@finance-tool/schema";
import { RecordInputError, runPlanned, type RunPlan } from "../inputs.ts";
import type { RunContext, RunResult } from "../result.ts";
import type { Candidate } from "./types.ts";

/** P-01 as a fraction: `data/parameters/tie-threshold.json` holds 0.5 percent as 0.005 here. */
export function tieThreshold(parameters: readonly unknown[]): number {
  const found = parameters.filter((p) => (p as { method_id?: unknown })?.method_id === "P-01");
  if (found.length !== 1) throw new RecordInputError(`data/parameters/ holds ${found.length} records for P-01; the ranking needs exactly one`);
  const p = parameterRecord.parse(found[0]);
  const v = p.value;
  if (!v || typeof v.value !== "number" || v.unit !== "pct") throw new RecordInputError("P-01 value must be a number in pct");
  return v.value / 100;
}

/** Relative difference `|a - b| / max(a, b)` that F-80 compares with θ; zero when both are zero. */
export function relativeGap(a: number, b: number): number {
  const m = Math.max(Math.abs(a), Math.abs(b));
  return m === 0 ? 0 : Math.abs(a - b) / m;
}

/** F-80: a tie when the relative difference is below θ. */
export const isTie = (a: number, b: number, theta: number) => relativeGap(a, b) < theta;

/**
 * The same plan with every fee removed: provider fees and tariff lines, the fund's own fees and spread, an IRA
 * manager's fee. Drag that is not a fee (tracking difference, foreign withholding, the pension insurance rate A-17, F-61) and tax stay (F-61's `V(∅)`).
 */
export function withoutFees(plan: RunPlan): RunPlan {
  switch (plan.run) {
    case "runProvident":
      return { run: "runProvident", input: { ...plan.input, fees: { deposit: 0, balance: 0, direct: 0 } } };
    case "runPension":
      return { run: "runPension", input: { ...plan.input, fees: { deposit: 0, balance: 0, direct: 0 } } };
    case "runDeposit":
      return plan;
    case "runSecurities": {
      const { input } = plan;
      const drag = { ...input.fund.drag };
      delete drag.management;
      delete drag.variable;
      delete drag.trustee;
      const fund = { ...input.fund, drag };
      delete fund.halfSpread;
      const tariff = input.tariff.currency ? { currency: input.tariff.currency } : {};
      const next = { ...input, fund, tariff };
      if (next.wrapper) next.wrapper = { ...next.wrapper, managerFee: 0 };
      return { run: "runSecurities", input: next };
    }
    case "runMakam":
      return { run: "runMakam", input: { ...plan.input, tariff: {} } };
    case "runBond":
      return { run: "runBond", input: { ...plan.input, tariff: {} } };
  }
}

export type DecidingFormula = "deposit-side-relief" | "fee-drag" | "tax-at-exit" | "lock-up";
const formulaOrder: readonly DecidingFormula[] = ["deposit-side-relief", "fee-drag", "tax-at-exit", "lock-up"];

/** What each formula costs one option, in real NIS at the horizon (positive hurts). */
export interface Decomposition {
  /** `-` the deposit-side tax relief (F-30 to F-32, F-33): relief helps, so it is a negative cost. Read from the run's `detail.reliefTotal` (pension, provident-for-annuity and self-employed study-fund runs); zero for a run with no relief. */
  depositSideRelief: number;
  /** F-61 total drag: `V_real(no fees) - V_real`. */
  feeDrag: number;
  /** Tax during the holding period and at exit (F-40, F-44, F-46), nominal NIS divided by the horizon's index. */
  taxAtExit: number;
  /** Value lost to a lock-up past the horizon; zero for an option that can exit at the horizon (it is ranked). */
  lockUp: number;
}

export interface Deciding {
  /** The formula with the largest absolute gap between the two; null when every gap is zero. */
  formula: DecidingFormula | null;
  /** Second minus top, per formula: positive means the formula costs the runner-up more. */
  gaps: Record<DecidingFormula, number>;
  top: Decomposition;
  second: Decomposition;
}

export interface RankedEntry {
  id: string;
  rank: number;
  real: number;
  nominal: number;
  /** Relative difference to the next entry, F-80's tie measure; absent for the last. */
  gapToNext?: number;
}

export interface Ranking {
  theta: number;
  entries: RankedEntry[];
  top?: string;
  /** The top option and every option within θ of it (by the F-80 relative difference); one id when the top stands alone. */
  tieSet: string[];
  topTwo?: { top: string; second: string; gap: number; tie: boolean; deciding: Deciding };
}

/** F-61-style decomposition of one run. `ctx` re-runs it without fees. */
export function decompose(plan: RunPlan, run: RunResult, ctx: RunContext): Decomposition {
  const indexAtExit = run.real === 0 ? 1 : run.nominal / run.real;
  const noFees = runPlanned(withoutFees(plan), ctx);
  return {
    depositSideRelief: -((run.detail.reliefTotal ?? 0) / indexAtExit),
    feeDrag: noFees.real - run.real,
    taxAtExit: (run.taxDuring + run.taxAtExit) / indexAtExit,
    lockUp: 0,
  };
}

/**
 * F-80 Ranking and ties. Ranks the candidates whose outcome is "ranked" by `V_T^real`, highest first (ties in
 * the input keep the input order). Reports the relative gap to the next entry, the set tied with the top at
 * θ (P-01), and for the top two the formula that produces the largest difference, found by re-running each
 * with its fees removed: deposit-side relief, fee drag, tax, or lock-up.
 */
export function rankCandidates(candidates: readonly Candidate[], options: { theta: number; ctx: RunContext }): Ranking {
  const { theta, ctx } = options;
  const ranked = candidates.filter((c) => c.kind === "ranked" && c.run && c.plan);
  const sorted = ranked
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.run!.real - a.c.run!.real || a.i - b.i)
    .map((x) => x.c);
  const entries: RankedEntry[] = sorted.map((c, k) => {
    const e: RankedEntry = { id: c.id, rank: k + 1, real: c.run!.real, nominal: c.run!.nominal };
    const next = sorted[k + 1];
    if (next) e.gapToNext = relativeGap(c.run!.real, next.run!.real);
    return e;
  });
  const ranking: Ranking = { theta, entries, tieSet: [] };
  const first = sorted[0];
  if (!first) return ranking;
  ranking.top = first.id;
  ranking.tieSet = sorted.filter((c) => c === first || isTie(first.run!.real, c.run!.real, theta)).map((c) => c.id);

  const second = sorted[1];
  if (second) {
    const top = decompose(first.plan!, first.run!, ctx);
    const next = decompose(second.plan!, second.run!, ctx);
    const gaps = {
      "deposit-side-relief": next.depositSideRelief - top.depositSideRelief,
      "fee-drag": next.feeDrag - top.feeDrag,
      "tax-at-exit": next.taxAtExit - top.taxAtExit,
      "lock-up": next.lockUp - top.lockUp,
    } satisfies Record<DecidingFormula, number>;
    let formula: DecidingFormula | null = null;
    let best = 0;
    for (const f of formulaOrder) {
      if (Math.abs(gaps[f]) > best) {
        best = Math.abs(gaps[f]);
        formula = f;
      }
    }
    const gap = relativeGap(first.run!.real, second.run!.real);
    ranking.topTwo = { top: first.id, second: second.id, gap, tie: gap < theta, deciding: { formula, gaps, top, second: next } };
  }
  return ranking;
}
