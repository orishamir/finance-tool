// Section 8 and product D13/D15 as checks on a wrapper record: who may use the wrapper, which constraint
// rules it out, when its money is locked, and what keeps it from taking the same money. Each check returns
// a reason with the rule IDs from the record itself; the engine holds no rule figure and no rule ID.
import type { ValueObject, ProductId, ProductRecord } from "@finance-tool/schema";
import type { InstrumentTerms } from "../inputs.ts";
import type { Profile } from "../ledgers/common.ts";
import type { ComparisonGoal, Reason } from "./types.ts";

/**
 * Wrappers that take only the National Insurance Institute's amounts and the parent's matching deposit,
 * never the person's own money (method section 8, child savings; the record's eligibility rules name why).
 */
const takesNoOwnMoney: ReadonlySet<ProductId> = new Set(["child-savings-provident", "child-savings-bank"]);

/** An IRA holds one of the other wrappers; its money is treated as that wrapper's (IRA-25, section 8). */
export const heldIn: Partial<Record<ProductId, ProductId>> = {
  "ira-hishtalmut": "keren-hishtalmut",
  "ira-provident": "provident-for-annuity",
};

/** Lawful-exit kinds that count as "any time" for the "must be withdrawable at any time" constraint. */
const anyTime: ReadonlySet<string> = new Set(["any_time", "trading_day"]);

const isGap = (code: string) => /^G-\d+$/.test(code);

/** Splits a list of codes into rule IDs and G-IDs. */
export function splitCodes(codes: readonly string[]): { ruleIds: string[]; gapIds: string[] } {
  return { ruleIds: codes.filter((c) => !isGap(c)), gapIds: codes.filter(isGap) };
}

const idsOf = (v?: ValueObject): string[] => v?.rule_ids ?? [];

/** Rules that fix the lawful exit: the age, the years, the term or the payout, as the record cites them. */
export function lawfulExitRuleIds(w: ProductRecord): string[] {
  const e = w.lawful_exit;
  const own = [...idsOf(e.age), ...idsOf(e.years), ...idsOf(e.term_months)];
  return own.length > 0 ? own : idsOf(e.payout_business_days);
}

/** F-83 outcome 1: a rule bars this money (section 8). */
export function notEligible(w: ProductRecord): Reason | undefined {
  if (takesNoOwnMoney.has(w.id)) return { code: "not-own-money", ruleIds: [...w.eligibility.rule_ids], gapIds: [] };
  return undefined;
}

/** F-83 outcome 2: the person's constraint rules the wrapper out (section 8, D13). */
export function excludedByConstraint(w: ProductRecord, goal: Pick<ComparisonGoal, "mustBeWithdrawableAnytime">): Reason | undefined {
  if (goal.mustBeWithdrawableAnytime && !anyTime.has(w.lawful_exit.kind)) {
    return { code: "not-withdrawable-any-time", ruleIds: lawfulExitRuleIds(w), gapIds: [], detail: w.lawful_exit.kind };
  }
  return undefined;
}

/** F-83 outcome 4: an IRA is listed as the wrapper it holds (IRA-25). */
export function heldAsUnderlying(w: ProductRecord): Reason | undefined {
  const under = heldIn[w.id];
  return under ? { code: "held-as-underlying", ruleIds: [...w.eligibility.rule_ids], gapIds: [], detail: under } : undefined;
}

/** Product D15: an employee's study fund is funded through the employer, so it is listed, not ranked. */
export function employeeStudyFund(w: ProductRecord, terms: InstrumentTerms | undefined): Reason | undefined {
  if (w.id !== "keren-hishtalmut" || terms?.hishtalmut?.employment !== "employee") return undefined;
  return { code: "employee-study-fund", ruleIds: [], gapIds: [], decision: "D15" };
}

/** F-05: a ceiling that takes only part of the money keeps the wrapper from taking the same money. */
export function ceilingPartial(w: ProductRecord): Reason {
  return { code: "ceiling-partial", ruleIds: [...(w.ceiling?.amount.rule_ids ?? [])], gapIds: [] };
}

/** Why the exit tax or another rule inside the run is blocked: B3 lists the wrapper with the gap or rule. */
export function blockedExit(w: ProductRecord): Reason[] {
  const { ruleIds, gapIds } = splitCodes(w.tax_at_exit.blocked_by);
  return ruleIds.length + gapIds.length > 0 ? [{ code: "exit-blocked", ruleIds, gapIds }] : [];
}

/** B3 from a run: its outcome says "B3" (locked until a month) or names the rule or gap that blocks the exit. */
export function reasonFromRunOutcome(w: ProductRecord, outcome: { reason: string; untilMonth?: number }): Reason {
  if (outcome.reason === "B3") {
    return { code: "locked-until", ruleIds: lawfulExitRuleIds(w), gapIds: [], ...(outcome.untilMonth !== undefined ? { untilMonth: outcome.untilMonth } : {}) };
  }
  return { code: "exit-blocked", ...splitCodes([outcome.reason]) };
}

/**
 * B3 for a wrapper whose lawful exit is an age (pension, provident fund for annuity): locked when the person
 * does not reach that age within the horizon. Needs the person's age; without it the answer is a missing input.
 */
export function lockedToAge(w: ProductRecord, profile: Profile, horizonMonths: number): Reason | "missing-age" | undefined {
  const age = w.lawful_exit.kind === "at_age" ? w.lawful_exit.age?.value : undefined;
  if (typeof age !== "number") return undefined;
  if (profile.ageAtStart === undefined) return "missing-age";
  if (profile.ageAtStart + Math.floor(horizonMonths / 12) >= age) return undefined;
  return { code: "locked-to-age", ruleIds: lawfulExitRuleIds(w), gapIds: [], untilMonth: 12 * (age - profile.ageAtStart) };
}
