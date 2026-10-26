// Exposure mode (product 3.2, F-83 candidate set, F-71, F-80): which exposure type suits the horizon and the
// person's loss filter, at returns the person entered or a sourced series gives. The caller names the wrapper
// that holds each exposure; the engine never picks one.
import { exposureRecord, type ExposureRecord, type ValueObject, type ProductId } from "@finance-tool/schema";
import { RecordInputError, type InstrumentTerms } from "../inputs.ts";
import type { RunContext } from "../result.ts";
import { assertInvariant, coverageLine } from "./coverage.ts";
import { enteredGoal, evaluate, parseWrapper } from "./candidates.ts";
import { lossFilter, type LossFilterEntered, type LossVerdict } from "./loss-filter.ts";
import { rankCandidates, tieThreshold, type Ranking } from "./ranking.ts";
import { outcomeOrder, type Candidate, type CandidateInput, type ComparisonGoal, type CoverageLine, type OutcomeKind } from "./types.ts";

/** One exposure record with how the caller holds it. */
export interface ExposureHolding {
  /** An exposure record (data-schema 3.4); checked here. */
  exposure: unknown;
  /** The record of the wrapper that holds it; it must be one the exposure's `wrapper_ids` list. Absent: "not evaluated". */
  wrapper?: unknown;
  terms?: InstrumentTerms;
  /**
   * The exposure's gross annual return A-01 (or the cash rate A-20 to A-25 of a cash-like one), `pct_per_year`.
   * An exposure whose `return_source.mode` is "entered" needs one in state `entered` (D9); one whose mode is
   * "series" takes the caller's sourced rate (or the person's own, state `entered`).
   */
  grossReturn?: ValueObject;
}

export interface ExposureCompareInput {
  /** Every exposure record (F-83), each with its holding. */
  exposures: readonly ExposureHolding[];
  /** `data/parameters/`; P-01 and P-05 are needed. */
  parameters: readonly unknown[];
  /** The goal; its `grossReturnPct` is ignored, each exposure has its own return. A kept-available part is taken off the amount and not run here. */
  goal: ComparisonGoal;
  /** The loss filter's two entered numbers (A-29). */
  lossFilter: LossFilterEntered;
}

/** D7 label of the return an exposure ran at: "entered by you" for every entered one. */
export interface ReturnLabel {
  label: "entered-by-you" | "sourced";
  state: ValueObject["state"];
  rate: ValueObject;
}

export interface ExposureCandidate extends Candidate {
  wrapper?: ProductId;
  lossFilter: LossVerdict;
  returnLabel?: ReturnLabel;
}

export interface ExposureComparison {
  candidates: ExposureCandidate[];
  coverage: CoverageLine<OutcomeKind>;
  ranking: Ranking;
  compared: { amountNow: number; monthly: number; months: number };
}

function checkedReturn(id: string, v: ValueObject): void {
  if (v.unit !== "pct_per_year" || typeof v.value !== "number" || !Number.isFinite(v.value)) {
    throw new RecordInputError(`grossReturn of exposure ${id} must be a number in pct_per_year`);
  }
}

/**
 * Exposure mode. The candidate set is every exposure record (F-83); each gets one outcome, the first that applies:
 * excluded by the loss filter (F-71, D11); not evaluated (no wrapper named, a wrapper its record does not allow,
 * no sourced series for a cash-like exposure (D20), no entered return, or a run that cannot be done); listed, not
 * ranked (B3, as in wrapper mode); ranked. Ranked exposures run through their named wrapper at their own return,
 * with the same money, and are ranked by F-80 with its tie rule. Every return carries its D7 label.
 */
export function compareExposures(input: ExposureCompareInput, ctx: RunContext): ExposureComparison {
  const { goal, parameters } = input;
  const profile = goal.profile ?? {};
  const keep = goal.keepAvailable?.amount ?? 0;
  const amountNow = goal.amountNow - keep;
  if (amountNow < 0) throw new RecordInputError(`goal.keepAvailable ${keep} is more than the amount now ${goal.amountNow}`);
  const months = 12 * goal.horizonYears;

  const records = input.exposures.map((h) => {
    const r = exposureRecord.safeParse(h.exposure);
    if (!r.success) {
      const issues = r.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`);
      throw new RecordInputError(`exposure record: ${issues.join("; ")}`);
    }
    return { h, e: r.data as ExposureRecord };
  });
  const verdicts = new Map(lossFilter(records.map((r) => r.e), input.lossFilter).map((v) => [v.id, v]));

  const candidates: ExposureCandidate[] = records.map(({ h, e }) => {
    const verdict = verdicts.get(e.id)!;
    const gr = h.grossReturn;
    if (gr) checkedReturn(e.id, gr);
    const base = {
      id: e.id,
      ...(e.names.he[0] ? { name: e.names.he[0] } : {}),
      tier: 1 as const,
      lossFilter: verdict,
      ...(gr ? { returnLabel: { label: gr.state === "entered" ? ("entered-by-you" as const) : ("sourced" as const), state: gr.state, rate: gr } } : {}),
    };
    const notEvaluated = (code: "missing-input" | "no-sourced-series" | "wrapper-cannot-hold", detail: string, decision?: string): ExposureCandidate => ({
      ...base,
      kind: "not-evaluated",
      reasons: [{ code, ruleIds: [], gapIds: [], detail, ...(decision ? { decision } : {}) }],
    });

    // 2. excluded by the person's loss filter.
    if (verdict.verdict === "excluded") return { ...base, kind: "excluded", reasons: [verdict.reason!] };

    // 3. not evaluated.
    if (!h.wrapper) return notEvaluated("missing-input", "wrapper");
    const w = parseWrapper(h.wrapper);
    if (!e.wrapper_ids) return notEvaluated("missing-input", "exposure.wrapper_ids");
    if (!e.wrapper_ids.includes(w.id)) return notEvaluated("wrapper-cannot-hold", w.id);
    if (!gr) {
      return e.return_source.mode === "series"
        ? notEvaluated("no-sourced-series", e.return_source.series ?? e.id, "D20")
        : notEvaluated("missing-input", "grossReturn (A-01, entered by you)");
    }
    if (e.return_source.mode === "entered" && gr.state !== "entered") {
      throw new RecordInputError(`exposure ${e.id} takes an entered return (D9), got state "${gr.state}"`);
    }

    // 4 and 5: the wrapper's run at this exposure's return, as wrapper mode evaluates it.
    const own: ComparisonGoal = { ...goal, grossReturnPct: gr.value as number };
    // The exposure's return goes in as the run's cash rate as well as A-01: a cash-like exposure, a government bond
    // (the bond run's coupon) and a money-market fund read the cash rate, not A-01, so without it an entered bond
    // return would be labelled but never used (release 5, 2026-10-24). A run that reads A-01 ignores the cash rate.
    const c: CandidateInput = { record: h.wrapper, ...(h.terms ? { terms: h.terms } : {}), cashRate: gr };
    const entered = enteredGoal(own, amountNow, goal.monthly, ctx.runDate);
    const ev = evaluate(c, w, parameters, entered, own, profile, months, ctx);
    return { ...ev, ...base, wrapper: w.id };
  });

  const coverage = coverageLine(candidates, outcomeOrder, ["ranked"]);
  assertInvariant(coverage);
  const ranking = rankCandidates(candidates, { theta: tieThreshold(parameters), ctx });
  return { candidates, coverage, ranking, compared: { amountNow, monthly: goal.monthly, months } };
}
