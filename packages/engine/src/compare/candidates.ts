// F-83 Candidate set and coverage line (product D17): every comparison starts from the full candidate set and
// accounts for each candidate exactly once, with the first outcome that applies in the method's order.
import { wrapperId, wrapperRecord, type ValueObject, type WrapperId, type WrapperRecord } from "@finance-tool/schema";
import { RecordInputError, runInputs, runPlanned, type P05Input, type RunPlan } from "../inputs.ts";
import type { Profile } from "../ledgers/common.ts";
import { NotEvaluatedError } from "../ledgers/securities.ts";
import type { ProvidentResult } from "../ledgers/provident.ts";
import { BlockedError, FigureNotUpdatedError, MissingRuleError } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";
import { assertInvariant, coverageLine } from "./coverage.ts";
import {
  blockedExit,
  ceilingPartial,
  employeeStudyFund,
  excludedByConstraint,
  heldAsUnderlying,
  lockedToAge,
  notEligible,
  reasonFromRunOutcome,
} from "./eligibility.ts";
import { outcomeOrder, type Candidate, type CandidateInput, type ComparisonGoal, type CoverageLine, type OutcomeKind, type Reason, type Tier2Instrument } from "./types.ts";

export interface CandidateSetInput {
  /** One entry per tier-1 wrapper record the comparison holds. */
  wrappers: readonly CandidateInput[];
  /** The "not covered yet" list (product D2), as data. */
  tier2: readonly Tier2Instrument[];
  /** `data/parameters/` records; P-05 is needed (method 2.4). */
  parameters: readonly unknown[];
  goal: ComparisonGoal;
  /**
   * Golden scenarios may restrict the candidate set to exercise a formula (S39 compares four wrappers); the site
   * never does. Without this flag, a wrapper ID with no input is a candidate "not evaluated: missing record".
   */
  restricted?: boolean;
}

/** The part of the amount that must stay available (D13), held in the current account or a daily fund. */
export interface KeptAvailable {
  wrapper: WrapperId;
  amount: number;
  plan?: RunPlan;
  run?: RunResult;
  /** Set when the kept part could not be run. */
  reason?: Reason;
}

export interface CandidateSet {
  candidates: Candidate[];
  coverage: CoverageLine<OutcomeKind>;
  keptAvailable?: KeptAvailable;
  /** The money every candidate receives: the amount now less what must stay available, and the monthly deposit (B1). */
  compared: { amountNow: number; monthly: number; months: number };
}

/** A value the person entered, in the shape `runInputs` takes for P-05's inputs (D7: "entered by you"). */
export function enteredValue(value: number, unit: ValueObject["unit"], runDate: string): ValueObject {
  return {
    value,
    unit,
    source: { url: "entered by you", title: "entered by you", publisher: "the person", strength: "entered" },
    checked: runDate,
    effective_from: null,
    effective_to: null,
    update_rule: "founder",
    state: "entered",
  };
}

/** The goal's values as P-05 counterparts the person entered. */
export function enteredGoal(goal: ComparisonGoal, amountNow: number, monthly: number, runDate: string): Partial<Record<P05Input, ValueObject>> {
  const e: Partial<Record<P05Input, ValueObject>> = {
    amount_now: enteredValue(amountNow, "nis", runDate),
    monthly_deposit: enteredValue(monthly, "nis_per_month", runDate),
    horizon_years: enteredValue(goal.horizonYears, "years", runDate),
  };
  if (goal.grossReturnPct !== undefined) e["A-01"] = enteredValue(goal.grossReturnPct, "pct_per_year", runDate);
  if (goal.inflationPct !== undefined) e["A-02"] = enteredValue(goal.inflationPct, "pct_per_year", runDate);
  return e;
}

/** P-05 with this candidate's own cash rate in place of `cash_rate` (A-20 to A-26). Other parameters pass through. */
export function withCashRate(parameters: readonly unknown[], cashRate: ValueObject): unknown[] {
  return parameters.map((p) => {
    const rec = p as { method_id?: unknown; inputs?: Record<string, unknown> };
    return rec?.method_id === "P-05" ? { ...rec, inputs: { ...rec.inputs, cash_rate: cashRate } } : p;
  });
}

/** The wrapper record, checked against the schema; a bad record stops the comparison with the field named. */
export function parseWrapper(record: unknown): WrapperRecord {
  const r = wrapperRecord.safeParse(record);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`);
  throw new RecordInputError(`wrapper record: ${issues.join("; ")}`);
}

export type Executed =
  | { ok: true; plan: RunPlan; run: RunResult }
  | { ok: false; kind: "not-evaluated"; reason: Reason };

/**
 * Builds a candidate's inputs with `runInputs` and runs them. A run that cannot be done becomes the F-83
 * reason: a missing input, a method gap, a formula or rule that is not there. An invalid record or parameter
 * is a data error, not an outcome, and stops the comparison.
 */
export function executeCandidate(
  c: CandidateInput,
  parameters: readonly unknown[],
  entered: Partial<Record<P05Input, ValueObject>>,
  profile: Profile,
  ctx: RunContext,
): Executed {
  const params = c.cashRate ? withCashRate(parameters, c.cashRate) : parameters;
  try {
    const plan = runInputs(c.record, params, c.terms ?? {}, { entered, profile });
    return { ok: true, plan, run: runPlanned(plan, ctx) };
  } catch (e) {
    const reason = reasonFromError(e);
    if (!reason) throw e;
    return { ok: false, kind: "not-evaluated", reason };
  }
}

function reasonFromError(e: unknown): Reason | undefined {
  if (e instanceof NotEvaluatedError) return { code: "gap", ruleIds: [], gapIds: [e.gap] };
  if (e instanceof MissingRuleError) return { code: "rule-missing", ruleIds: [e.ruleId], gapIds: [], ...(e.figure ? { detail: e.figure } : {}) };
  if (e instanceof FigureNotUpdatedError) return { code: "figure-not-updated", ruleIds: [e.ruleId], gapIds: [], detail: e.figure };
  if (e instanceof BlockedError) return { code: "rule-open", ruleIds: [e.ruleId], gapIds: [] };
  if (e instanceof RecordInputError) {
    // runInputs stops with the field named: a missing term is a missing input; a run the engine does not have yet is "no run".
    if (/ is missing/.test(e.message)) return { code: "missing-input", ruleIds: [], gapIds: [], detail: e.message };
    if (/has no run yet|is not computed yet/.test(e.message)) return { code: "no-run", ruleIds: [], gapIds: [], detail: e.message };
  }
  return undefined;
}

/**
 * F-83 Candidate set and coverage line. Builds one candidate per wrapper record and per tier-2 instrument, runs
 * each with the same money (B1) and gives each exactly one outcome, the first that applies:
 * 1. not eligible (section 8, `not-own-money`); 2. excluded by the person's constraint; 3. not evaluated (a missing
 * input, tier 2 and G-24, no run, a gap such as G-30); 4. listed, not ranked (B3 lock-up or blocked exit, D15, a
 * ceiling that takes only part of the money (F-05), an IRA held as its wrapper); 5. ranked. The coverage line
 * counts each outcome and lists every candidate not ranked with its reasons; the invariant is checked.
 */
export function buildCandidateSet(input: CandidateSetInput, ctx: RunContext): CandidateSet {
  const { goal, parameters } = input;
  const profile = goal.profile ?? {};
  const keep = goal.keepAvailable?.amount ?? 0;
  const amountNow = goal.amountNow - keep;
  if (amountNow < 0) throw new RecordInputError(`goal.keepAvailable ${keep} is more than the amount now ${goal.amountNow}`);
  const months = 12 * goal.horizonYears;
  const entered = enteredGoal(goal, amountNow, goal.monthly, ctx.runDate);

  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  const byId = new Map<string, CandidateInput>();
  for (const c of input.wrappers) {
    const w = parseWrapper(c.record);
    if (seen.has(w.id)) throw new RecordInputError(`two inputs for wrapper ${w.id}`);
    seen.add(w.id);
    byId.set(w.id, c);
    candidates.push(evaluate(c, w, parameters, entered, goal, profile, months, ctx));
  }
  if (!input.restricted) {
    for (const id of wrapperId.options) {
      if (!seen.has(id)) candidates.push({ id, tier: 1, kind: "not-evaluated", reasons: [{ code: "missing-record", ruleIds: [], gapIds: [], detail: id }] });
    }
  }
  for (const t of input.tier2) {
    candidates.push({
      id: t.id,
      name: t.name,
      tier: 2,
      kind: "not-evaluated",
      reasons: [{ code: "tier-2", ruleIds: [], gapIds: ["G-24"], detail: t.openQuestion }],
    });
  }

  const coverage = coverageLine(candidates, outcomeOrder, ["ranked"]);
  assertInvariant(coverage);
  // G-22: "must not need an annual tax return" cannot be applied (TXG OQ4): note it, filter nothing.
  if (goal.mustNotNeedAnnualReturn) coverage.blocked = [{ constraint: "no-annual-return", gapIds: ["G-22"], ruleIds: ["TXG-OQ4"] }];

  const set: CandidateSet = { candidates, coverage, compared: { amountNow, monthly: goal.monthly, months } };
  if (goal.keepAvailable && keep > 0) {
    const where = goal.keepAvailable.in ?? "current-account";
    const c = byId.get(where);
    const kept: KeptAvailable = { wrapper: where, amount: keep };
    if (!c) kept.reason = { code: "missing-record", ruleIds: [], gapIds: [], detail: where };
    else {
      const ex = executeCandidate(c, parameters, enteredGoal(goal, keep, 0, ctx.runDate), profile, ctx);
      if (ex.ok) Object.assign(kept, { plan: ex.plan, run: ex.run });
      else kept.reason = ex.reason;
    }
    set.keptAvailable = kept;
  }
  return set;
}

function evaluate(
  c: CandidateInput,
  w: WrapperRecord,
  parameters: readonly unknown[],
  entered: Partial<Record<P05Input, ValueObject>>,
  goal: ComparisonGoal,
  profile: Profile,
  months: number,
  ctx: RunContext,
): Candidate {
  const base = { id: w.id, tier: 1 as const };
  const listed = (reasons: Reason[], run?: { plan: RunPlan; run: RunResult }): Candidate => ({
    ...base,
    kind: "listed-not-ranked",
    reasons,
    ...(run ?? {}),
  });

  // 1. not eligible; 2. excluded by the person's constraint.
  const ne = notEligible(w);
  if (ne) return { ...base, kind: "not-eligible", reasons: [ne] };
  const ex = excludedByConstraint(w, goal);
  if (ex) return { ...base, kind: "excluded", reasons: [ex] };

  // An IRA is its underlying wrapper (IRA-25): it is listed, and its money ranks as that wrapper's row.
  const held = heldAsUnderlying(w);
  if (held) return listed([held]);

  // 3. not evaluated: the age that decides a lock-up is missing.
  const age = lockedToAge(w, profile, months);
  if (age === "missing-age") {
    return { ...base, kind: "not-evaluated", reasons: [{ code: "missing-input", ruleIds: [], gapIds: [], detail: "profile.ageAtStart" }] };
  }

  const exec = executeCandidate(c, parameters, entered, profile, ctx);

  // 3 comes before 4 (F-83): a run that lacks an input or that the method has no run for is "not evaluated",
  // even for a wrapper locked by age. A rule that is open inside the run is B3, below.
  if (!exec.ok && ["missing-input", "no-run", "gap"].includes(exec.reason.code)) return { ...base, kind: exec.kind, reasons: [exec.reason] };

  // 4. A lock-up by age is known from the record alone (B3), so the wrapper is listed even when a rule in its
  // run is open; the run's value at the first exit is attached when it exists.
  if (age) return listed([age, ...blockedExit(w)], exec.ok ? { plan: exec.plan, run: exec.run } : undefined);

  if (!exec.ok) return { ...base, kind: exec.kind, reasons: [exec.reason] };

  const reasons: Reason[] = [];
  const d15 = employeeStudyFund(w, c.terms);
  if (d15) reasons.push(d15);
  if (exec.run.outcome.code === "listed-not-ranked") reasons.push(reasonFromRunOutcome(w, exec.run.outcome));
  // G-10 touches the bond's own number (accrued interest on a bond bought between coupon dates, TXI OQ5):
  // B3, listed with the run's value (method section 12, F-25).
  if (w.id === "government-bond" && exec.run.flags.some((f) => f.code === "G-10")) reasons.push({ code: "gap", ruleIds: [], gapIds: ["G-10"] });
  const routed = ((exec.run as Partial<ProvidentResult>).routed ?? []).reduce((s, r) => s + r.amount, 0);
  if (routed > 0) reasons.push(ceilingPartial(w));

  const result: Candidate = { ...base, kind: reasons.length > 0 ? "listed-not-ranked" : "ranked", reasons, plan: exec.plan, run: exec.run };
  if (routed > 0) result.routed = routed;
  return result;
}
