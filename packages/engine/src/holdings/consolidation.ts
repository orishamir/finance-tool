// F-72 Consolidation: whether two holdings of the same wrapper type can be merged, and the child-savings
// default check (blocked, CS OQ10).
import { wrapperRecord, type WrapperId, type WrapperRecord } from "@finance-tool/schema";
import { RecordInputError, ruleBook } from "../resolver.ts";
import type { RunContext } from "../result.ts";

/**
 * The rules F-72 names itself (docs/method.md F-72), the only rule IDs the engine holds here. Every other
 * rule ID in a result comes from the wrapper record's `transfer_routes`.
 * PF-17: the permitted routes (annuity to annuity, hishtalmut to hishtalmut, gemel lehashkaa to gemel lehashkaa),
 * barred while a loan, an attachment or a started annuity applies.
 * PF-18: a study fund account moves whole, and accounts consolidate only when each is withdrawable tax-free.
 * CS-OQ10: the child-savings default check is blocked.
 */
const routeRule = "PF-17";
const hishtalmutRule = "PF-18";
// SW-39: the money keeps its payment dates on a transfer (reg. 3(ב)(1)); two study-fund accounts merge only when both are liquid (reg. 9(ב)). KH-17: no partial move.
const seniorityRule = "SW-39";
const noPartialRules = [hishtalmutRule, "KH-17"];
const childSavingsOpenQuestion = "CS-OQ10";
const childSavingsWrappers: readonly WrapperId[] = ["child-savings-provident", "child-savings-bank"];

/** What bars a transfer under PF-17 (the regulation's cases), when the person says it applies to a holding. */
export type TransferBarrier =
  | "loan"
  | "attachment"
  | "annuity-started"
  | "disability-annuity"
  | "member-died"
  | "receiving-fund-closed"
  | "applied-to-comprehensive-pension";

export interface Holding {
  id: string;
  wrapper: WrapperId;
  /** The managing company or provider, for display. */
  manager?: string;
  /** `YYYY-MM-DD` of the first deposit: the start of a study fund's 6-year clock (TXH-09). */
  firstDepositDate?: string;
  /** The person is at retirement age, so a study fund is free after 3 years instead of 6 (TXH-10). */
  atRetirementAge?: boolean;
  barriers?: readonly TransferBarrier[];
  /**
   * The bars of PF-17 (Transfer Regulations, reg. 4) the person can state, as flags; each is the same as naming
   * the barrier in `barriers`. Left out means not stated (the engine does not assume either way).
   * `loan`, `attachment` (the whole balance attached or pledged), `annuityStarted` (an old-age annuity), `disabilityAnnuityClaimed`
   * (claimed or approved), `memberDied` (before the determining date), `receivingFundClosed`, and
   * `appliedToComprehensivePension` (applied to a comprehensive pension fund while still active in this fund).
   */
  loan?: boolean;
  attachment?: boolean;
  annuityStarted?: boolean;
  disabilityAnnuityClaimed?: boolean;
  memberDied?: boolean;
  receivingFundClosed?: boolean;
  appliedToComprehensivePension?: boolean;
  /** The person means to move only part of a study fund's balance: not allowed (PF-18, KH-17). */
  partialMove?: boolean;
}

export interface ConsolidationRules {
  /** Wrapper records (data-schema 3.3), each checked here. */
  wrappers: readonly unknown[];
  /** The rule bundle and the run date, for the study fund's lock (TXH-09, TXH-10). */
  ctx: RunContext;
}

export type PairVerdict =
  | {
      kind: "allowed";
      ruleIds: string[];
      condition?: string;
      /** The three bars the page asks about (loan, attachment, started annuity). */
      stillBarredIf: TransferBarrier[];
      /** The other bars of PF-17 reg. 4 the person can state on a holding (additive, 2026-10-24). */
      alsoBarredIf: TransferBarrier[];
    }
  | { kind: "not-allowed"; ruleIds: string[]; reason: "barrier" | "partial-move"; detail: string }
  /**
   * Study funds not yet both withdrawable tax-free: transfer whole to the other manager as a separate account (the
   * money keeps its payment dates, SW-39); merging waits until both are liquid (PF-18, SW-39).
   */
  | { kind: "allowed-separate-account"; ruleIds: string[]; reason: string; notLiquid: { holding: string; monthsSinceFirstDeposit: number; monthsNeeded: number; lockRule: string }[] }
  | { kind: "transfer-rules-not-sourced"; openQuestions: string[] }
  | { kind: "missing-input"; field: string; holding: string };

export interface ConsolidationPair {
  a: string;
  b: string;
  wrapper: WrapperId;
  result: PairVerdict;
}

export interface Consolidation {
  formula: "F-72";
  pairs: ConsolidationPair[];
  /** Holdings of a child-savings wrapper: the default check is blocked (CS-OQ10). */
  childSavings: { holding: string; status: "blocked"; openQuestion: string }[];
}

const allBarriers: TransferBarrier[] = ["loan", "attachment", "annuity-started"];
const otherBarriers: TransferBarrier[] = ["disability-annuity", "member-died", "receiving-fund-closed", "applied-to-comprehensive-pension"];

/** The bars a holding states, by list or by flag (PF-17, reg. 4). */
function stated(h: Holding): TransferBarrier[] {
  const flags: [boolean | undefined, TransferBarrier][] = [
    [h.loan, "loan"],
    [h.attachment, "attachment"],
    [h.annuityStarted, "annuity-started"],
    [h.disabilityAnnuityClaimed, "disability-annuity"],
    [h.memberDied, "member-died"],
    [h.receivingFundClosed, "receiving-fund-closed"],
    [h.appliedToComprehensivePension, "applied-to-comprehensive-pension"],
  ];
  return [...(h.barriers ?? []), ...flags.filter(([on]) => on === true).map(([, code]) => code)];
}

/** Whole months from `from` to `to` (both `YYYY-MM-DD`), counting a month when its day has been reached. */
function monthsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number) as [number, number, number];
  const [ty, tm, td] = to.split("-").map(Number) as [number, number, number];
  return (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0);
}

/**
 * F-72 Consolidation. Every pair of holdings of the same wrapper type is answered once: "allowed" with the rule
 * IDs of the route the wrapper record names (PF-17: annuity to annuity, hishtalmut to hishtalmut, gemel
 * lehashkaa to gemel lehashkaa) when no loan, attachment or started annuity bars it; "not allowed" citing the
 * rule; or "transfer rules not sourced" with the wrapper's open questions when its record names no route to
 * itself. For a study fund both accounts must also be withdrawable tax-free (PF-18): six years from the first
 * deposit (TXH-09), three at retirement age (TXH-10). When one or both are not yet liquid the answer is "allowed
 * as a separate account" (SW-39, PF-17: whole transfer, money keeps its payment dates, merge later); a partial
 * move is "not allowed" (PF-18, KH-17); a missing first-deposit date is "missing input", not a guess. Child-savings holdings come back with the default check blocked (CS-OQ10).
 */
export function consolidation(holdings: readonly Holding[], rules: ConsolidationRules): Consolidation {
  const records = new Map<WrapperId, WrapperRecord>();
  for (const raw of rules.wrappers) {
    const r = wrapperRecord.safeParse(raw);
    if (!r.success) throw new RecordInputError(`wrapper record: ${r.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
    records.set(r.data.id, r.data);
  }
  const book = ruleBook(rules.ctx);
  const pairs: ConsolidationPair[] = [];
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const a = holdings[i]!;
      const b = holdings[j]!;
      if (a.wrapper !== b.wrapper || childSavingsWrappers.includes(a.wrapper)) continue;
      const record = records.get(a.wrapper);
      if (!record) throw new RecordInputError(`no wrapper record for ${a.wrapper}`);
      pairs.push({ a: a.id, b: b.id, wrapper: a.wrapper, result: pairVerdict(a, b, record, book, rules.ctx) });
    }
  }
  return {
    formula: "F-72",
    pairs,
    childSavings: holdings.filter((h) => childSavingsWrappers.includes(h.wrapper)).map((h) => ({ holding: h.id, status: "blocked" as const, openQuestion: childSavingsOpenQuestion })),
  };
}

function pairVerdict(a: Holding, b: Holding, record: WrapperRecord, book: ReturnType<typeof ruleBook>, ctx: RunContext): PairVerdict {
  const route = record.transfer_routes.find((r) => r.to === record.id);
  if (!route) return { kind: "transfer-rules-not-sourced", openQuestions: [...record.open_questions] };

  const barred = [...stated(a), ...stated(b)];
  if (barred.length > 0) {
    return { kind: "not-allowed", ruleIds: [routeRule], reason: "barrier", detail: `${[...new Set(barred)].join(", ")} (${routeRule})` };
  }

  // PF-18: a study fund's accounts consolidate only when both are withdrawable tax-free. Decided on the wrapper, not
  // on which rules the route happens to list (review 2026-10-24).
  if (a.wrapper === "keren-hishtalmut") {
    if (a.partialMove || b.partialMove) {
      return { kind: "not-allowed", ruleIds: [...noPartialRules], reason: "partial-move", detail: "a study fund account moves whole, never in part" };
    }
    for (const h of [a, b]) {
      if (!h.firstDepositDate) return { kind: "missing-input", field: "firstDepositDate", holding: h.id };
    }
    const lockYears = (h: Holding) => book.amount(h.atRetirementAge ? "TXH-10" : "TXH-09", "lock_years");
    const notLiquid = [a, b]
      .map((h) => ({ holding: h.id, monthsSinceFirstDeposit: monthsBetween(h.firstDepositDate!, ctx.runDate), monthsNeeded: 12 * lockYears(h), lockRule: h.atRetirementAge ? "TXH-10" : "TXH-09" }))
      .filter((x) => x.monthsSinceFirstDeposit < x.monthsNeeded);
    if (notLiquid.length > 0) {
      return {
        kind: "allowed-separate-account",
        ruleIds: [seniorityRule, routeRule, hishtalmutRule],
        reason: "transfer whole to the other manager as a separate account; merging waits until both are liquid (PF-18, SW-39)",
        notLiquid,
      };
    }
  }
  const out: PairVerdict = { kind: "allowed", ruleIds: [...route.rule_ids], stillBarredIf: allBarriers, alsoBarredIf: otherBarriers };
  if (route.condition) out.condition = route.condition;
  return out;
}
