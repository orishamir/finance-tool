// F-60 Idle-cash preset: the monthly cost of leaving money in the current account instead of a liquid option,
// after tax, with the coverage line over the full candidate set (F-83, G-28).
import { wrapperId, type ValueObject, type WrapperId } from "@finance-tool/schema";
import { RecordInputError } from "../inputs.ts";
import type { RunContext, RunResult } from "../result.ts";
import { assertInvariant, coverageLine } from "./coverage.ts";
import { enteredGoal, executeCandidate, parseWrapper } from "./candidates.ts";
import { notEligible } from "./eligibility.ts";
import type { CandidateInput, ComparisonGoal, CoverageLine, Reason, Tier2Instrument } from "./types.ts";

/** How the rate of an alternative is labelled (F-60): A-21 at the bank, the person's own offer (A-26), a source. */
export type RateLabel = "average-paid-last-month" | "entered-by-you" | "sourced";

/** F-83 outcomes in the preset: the current account is the baseline; the cash options are "compared against" it. */
export type IdleKind = "baseline" | "compared" | "not-eligible" | "not-evaluated";
const idleKinds: readonly IdleKind[] = ["baseline", "compared", "not-eligible", "not-evaluated"];

export interface IdleCashInput {
  /** B, the balance in the current account. */
  balance: number;
  /** The part that must stay available (D13), excluded from B. */
  mustStayAvailable: number;
  /** A-02, the inflation the daily fund's tax base uses (F-40). */
  inflationPct: number;
  parameters: readonly unknown[];
  /**
   * Wrapper records with terms. The preset runs `current-account` (baseline, with its rate A-25 as `cashRate`),
   * `money-market-fund-daily` (A-20) and `makam` (A-22) with their `cashRate`, and `bank-deposit` with the rates below.
   */
  wrappers: readonly CandidateInput[];
  tier2: readonly Tier2Instrument[];
  /** A-21: the average paid at this bank last month on a one-month deposit. */
  bankAverage?: ValueObject;
  /** A-26: the person's own offer on a one-month deposit, entered by them. */
  ownOffer?: ValueObject;
  profile?: ComparisonGoal["profile"];
  /** As F-83: a golden scenario may restrict the set. */
  restricted?: boolean;
}

export interface IdleCashRow {
  id: string;
  wrapper: WrapperId;
  label: RateLabel;
  rate: ValueObject;
  /** The alternative's net annual rate after tax, from its run over one year. */
  netRate: number;
  /** `B × [(1 + r_alt)^(1/12) − (1 + r_cc)^(1/12)]`: what leaving B in the current account costs a month. */
  monthlyCost: number;
  run: RunResult;
  /** `one-year-hold` for the daily fund (its exit tax is that of a one-year hold); `no-commission-given` for makam without lines. */
  notes: string[];
}

export interface IdleCandidate {
  id: string;
  name?: string;
  tier: 1 | 2;
  kind: IdleKind;
  reasons: Reason[];
}

export interface IdleCash {
  /** B less the part that must stay available. */
  amount: number;
  mustStayAvailable: number;
  baseline: { wrapper: "current-account"; rate: ValueObject; netRate: number; run: RunResult };
  rows: IdleCashRow[];
  candidates: IdleCandidate[];
  coverage: CoverageLine<IdleKind>;
}

const cashOptions: readonly WrapperId[] = ["bank-deposit", "makam", "money-market-fund-daily"];

/**
 * F-60 Idle-cash preset. `B` is the balance less the part that must stay available. Each option's net rate is
 * read from its own run over one year, after tax (F-21, F-23 with F-40, F-24); the baseline is the current
 * account's (F-26). The monthly cost is `B × [(1 + r_alt)^(1/12) − (1 + r_cc)^(1/12)]`. The deposit appears at
 * the bank average (A-21, "average-paid-last-month") and at the person's own offer (A-26, "entered-by-you").
 * Every other candidate is accounted for by F-83: child savings as not eligible, the rest of tier 1 as "not
 * evaluated (G-28)" with a pointer to the full goal comparison, tier 2 as "not evaluated (G-24)".
 */
export function idleCash(input: IdleCashInput, ctx: RunContext): IdleCash {
  const amount = input.balance - input.mustStayAvailable;
  if (!(amount > 0)) throw new RecordInputError(`idle cash: balance ${input.balance} less ${input.mustStayAvailable} that must stay available leaves nothing to compare`);
  const profile = input.profile ?? {};
  // One year of holding, no monthly deposit: the same money in every option.
  const goal: ComparisonGoal = { amountNow: amount, monthly: 0, horizonYears: 1, inflationPct: input.inflationPct, profile };
  const entered = enteredGoal(goal, amount, 0, ctx.runDate);

  const annual = (c: CandidateInput, rate: ValueObject) => {
    const ex = executeCandidate({ ...c, cashRate: rate }, input.parameters, entered, profile, ctx);
    return ex.ok ? { run: ex.run, netRate: ex.run.nominal / amount - 1 } : ex;
  };

  const byId = new Map<WrapperId, CandidateInput>();
  const candidates: IdleCandidate[] = [];
  const seen = new Set<string>();
  const parsed = input.wrappers.map((c) => ({ c, w: parseWrapper(c.record) }));
  for (const { c, w } of parsed) {
    if (seen.has(w.id)) throw new RecordInputError(`two inputs for wrapper ${w.id}`);
    seen.add(w.id);
    byId.set(w.id, c);
  }

  const base = byId.get("current-account");
  if (!base?.cashRate) throw new RecordInputError("idle cash: the current account needs its record and its rate (A-25) as the baseline");
  const baseRun = annual(base, base.cashRate);
  if (!("run" in baseRun)) throw new RecordInputError(`idle cash: the baseline cannot be run: ${baseRun.reason.code}`);

  const rows: IdleCashRow[] = [];
  const failed = new Map<WrapperId, Reason>();
  const alternatives: { wrapper: WrapperId; id: string; label: RateLabel; rate: ValueObject | undefined }[] = [
    { wrapper: "bank-deposit", id: "bank-deposit:average", label: "average-paid-last-month", rate: input.bankAverage },
    { wrapper: "bank-deposit", id: "bank-deposit:own-offer", label: "entered-by-you", rate: input.ownOffer },
    { wrapper: "makam", id: "makam", label: byId.get("makam")?.cashRate?.state === "entered" ? "entered-by-you" : "sourced", rate: byId.get("makam")?.cashRate },
    {
      wrapper: "money-market-fund-daily",
      id: "money-market-fund-daily",
      label: byId.get("money-market-fund-daily")?.cashRate?.state === "entered" ? "entered-by-you" : "sourced",
      rate: byId.get("money-market-fund-daily")?.cashRate,
    },
  ];
  const ran = new Set<WrapperId>();
  for (const a of alternatives) {
    const c = byId.get(a.wrapper);
    if (!c) continue;
    if (!a.rate) {
      if (!failed.has(a.wrapper) && !ran.has(a.wrapper)) failed.set(a.wrapper, { code: "missing-input", ruleIds: [], gapIds: [], detail: a.id === "bank-deposit:average" ? "bankAverage" : "cashRate" });
      continue;
    }
    const r = annual(c, a.rate);
    if (!("run" in r)) {
      failed.set(a.wrapper, r.reason);
      continue;
    }
    ran.add(a.wrapper);
    failed.delete(a.wrapper);
    const notes: string[] = [];
    if (a.wrapper === "money-market-fund-daily") notes.push("one-year-hold");
    if (a.wrapper === "makam" && !c.terms?.tariff?.buy && !c.terms?.tariff?.sell) notes.push("no-commission-given");
    rows.push({
      id: a.id,
      wrapper: a.wrapper,
      label: a.label,
      rate: a.rate,
      netRate: r.netRate,
      monthlyCost: amount * ((1 + r.netRate) ** (1 / 12) - (1 + baseRun.netRate) ** (1 / 12)),
      run: r.run,
      notes,
    });
  }

  const reasonNotRun: Reason = { code: "idle-cash-not-run", ruleIds: [], gapIds: ["G-28"] };
  for (const { w } of parsed) {
    const ne = notEligible(w);
    let cand: IdleCandidate;
    if (ne) cand = { id: w.id, tier: 1, kind: "not-eligible", reasons: [ne] };
    else if (w.id === "current-account") cand = { id: w.id, tier: 1, kind: "baseline", reasons: [] };
    else if (cashOptions.includes(w.id)) {
      const why = failed.get(w.id) ?? (ran.has(w.id) ? undefined : ({ code: "missing-input", ruleIds: [], gapIds: [], detail: "cashRate" } as Reason));
      cand = why ? { id: w.id, tier: 1, kind: "not-evaluated", reasons: [why] } : { id: w.id, tier: 1, kind: "compared", reasons: [] };
    } else cand = { id: w.id, tier: 1, kind: "not-evaluated", reasons: [reasonNotRun] };
    candidates.push(cand);
  }
  if (!input.restricted) {
    for (const id of wrapperId.options) {
      if (!seen.has(id)) candidates.push({ id, tier: 1, kind: "not-evaluated", reasons: [{ code: "missing-record", ruleIds: [], gapIds: [], detail: id }] });
    }
  }
  for (const t of input.tier2) {
    candidates.push({ id: t.id, name: t.name, tier: 2, kind: "not-evaluated", reasons: [{ code: "tier-2", ruleIds: [], gapIds: ["G-24"], detail: t.openQuestion }] });
  }

  const coverage = coverageLine(candidates, idleKinds, ["baseline", "compared"]);
  assertInvariant(coverage);
  return {
    amount,
    mustStayAvailable: input.mustStayAvailable,
    baseline: { wrapper: "current-account", rate: base.cashRate, netRate: baseRun.netRate, run: baseRun.run },
    rows,
    candidates,
    coverage,
  };
}
