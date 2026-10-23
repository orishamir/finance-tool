// Shared shapes of the release 2 comparison: the candidate set and its outcomes (F-83), the coverage line,
// and the inputs every comparison takes. The engine returns codes, never Hebrew text; the site maps them.
import type { ValueObject, WrapperId } from "@finance-tool/schema";
import type { InstrumentTerms, RunPlan } from "../inputs.ts";
import type { Profile } from "../ledgers/common.ts";
import type { RunResult } from "../result.ts";

/** F-83: the five outcomes, in the priority order the method gives them. */
export type OutcomeKind = "not-eligible" | "excluded" | "not-evaluated" | "listed-not-ranked" | "ranked";

export const outcomeOrder: readonly OutcomeKind[] = ["not-eligible", "excluded", "not-evaluated", "listed-not-ranked", "ranked"];

/**
 * Why a candidate got its outcome, as a code with the rule and gap IDs behind it.
 * Not eligible: `not-own-money` (section 8).
 * Excluded: `not-withdrawable-any-time` (D13).
 * Not evaluated: `missing-input`, `missing-record`, `tier-2` (G-24), `no-run`, `gap` (G-28, G-30, ...), `rule-missing`,
 * `rule-open`, `figure-not-updated`, `idle-cash-not-run` (G-28).
 * Listed, not ranked: `employee-study-fund` (D15), `ceiling-partial` (F-05), `locked-until` and `locked-to-age` (B3),
 * `exit-blocked` (B3 with a gap or an open rule), `held-as-underlying` (IRA-25), `gap` (a gap that touches the
 * wrapper's own number, B3: G-10 for a government bond, with the run's value shown).
 */
export type ReasonCode =
  | "not-own-money"
  | "not-withdrawable-any-time"
  | "missing-input"
  | "missing-record"
  | "tier-2"
  | "no-run"
  | "gap"
  | "rule-missing"
  | "rule-open"
  | "figure-not-updated"
  | "idle-cash-not-run"
  | "employee-study-fund"
  | "ceiling-partial"
  | "locked-until"
  | "locked-to-age"
  | "exit-blocked"
  | "held-as-underlying";

export interface Reason {
  code: ReasonCode;
  /** Rule IDs (il-finance) the reason rests on, from the wrapper record or the run. */
  ruleIds: string[];
  /** G-IDs (method section 12) behind the reason. */
  gapIds: string[];
  /** A product decision the reason rests on, for example "D15". */
  decision?: string;
  /** Month of the lawful exit, for a lock-up (B3). */
  untilMonth?: number;
  /** The field or open question, for a missing input or a tier-2 instrument. */
  detail?: string;
}

export interface Candidate {
  /** Wrapper ID, or the tier-2 instrument's ID. */
  id: string;
  /** Tier-2 instruments carry their name; wrappers are named by the site from their record. */
  name?: string;
  tier: 1 | 2;
  kind: OutcomeKind;
  /** Empty for a ranked candidate. */
  reasons: Reason[];
  /** The run, when there is one: ranked candidates, and listed ones whose value exists (B3). */
  plan?: RunPlan;
  run?: RunResult;
  /** F-05: the part of the money a ceiling sent elsewhere. */
  routed?: number;
}

/** A constraint shown as blocked (method section 8): its code, the gap and the open question behind it. */
export interface BlockedConstraint {
  constraint: "no-annual-return";
  gapIds: string[];
  ruleIds: string[];
}

/** One line per candidate that is not ranked, in the order the set was built. */
export interface CoverageEntry<K extends string> {
  id: string;
  name?: string;
  kind: K;
  reasons: Reason[];
}

/** F-83 output: `considered`, the count per outcome, every candidate not ranked with its reasons, the invariant. */
export interface CoverageLine<K extends string> {
  considered: number;
  counts: Record<K, number>;
  notRanked: CoverageEntry<K>[];
  /** A constraint the person set that the method cannot apply yet (G-22): shown as blocked, no candidate is filtered. */
  blocked?: BlockedConstraint[];
  invariant: { ok: boolean; sum: number; duplicates: string[] };
}

/** A tier-2 instrument on the "not covered yet" list (product D2): passed as data, never named in the engine. */
export interface Tier2Instrument {
  id: string;
  name: string;
  openQuestion: string;
}

/** One wrapper as a comparison takes it: its record, its instrument terms, and the rate of a cash-like product. */
export interface CandidateInput {
  /** A wrapper record (data-schema 3.3); checked by `runInputs`. */
  record: unknown;
  /** Provider fees and instrument terms (method 2.4). Absent: the run is "not evaluated: missing input". */
  terms?: InstrumentTerms;
  /**
   * The rate of a cash-like product (A-20 to A-25), a value object that is sourced or entered, in
   * `pct_per_year`. It replaces P-05's `cash_rate` for this candidate only.
   */
  cashRate?: ValueObject;
}

/** The person's goal (D13). Values the person leaves out come from P-05, as `runInputs` does. */
export interface ComparisonGoal {
  amountNow: number;
  monthly: number;
  horizonYears: number;
  /** A-01 in percent a year; entered by the person. */
  grossReturnPct?: number;
  /** A-02 in percent a year; entered by the person. */
  inflationPct?: number;
  /** "Must stay available at once" (D13): this much stays in the current account or a daily money-market fund. */
  keepAvailable?: { amount: number; in?: Extract<WrapperId, "current-account" | "money-market-fund-daily"> };
  /** "Must be withdrawable at any time" (section 8). */
  mustBeWithdrawableAnytime?: boolean;
  /**
   * "Must not need an annual tax return" (G-22, TXG OQ4): the rule base cannot say which options need one, so
   * the constraint filters no candidate; the coverage line carries a `blocked` note instead (method section 8).
   */
  mustNotNeedAnnualReturn?: boolean;
  profile?: Profile;
}

