// F-64 Track workbench: every track of a wrapper from the latest CMA period, with its two average fees, the
// regulator reference of its class and the fit mark. F-83: the coverage line accounts for every track.
import type { CmaPeriodFile, ValueObject, WrapperId } from "@finance-tool/schema";
import { referenceForWrapper, type ClassificationKey, type NoReference, type RegulatorReference } from "../fees/reference.ts";
import { latestTracks, type CmaTrack } from "./cma.ts";
import { classificationFit, type ClassificationFit, type FitTable } from "./fit.ts";

/** What the caller holds that the workbench reads besides the CMA files. */
export interface WorkbenchReferences {
  /**
   * The regulator's product type (`FUND_CLASSIFICATION`) to the site's wrapper (data-schema §2): the site's
   * reading of the datasets (REG-17), passed as data, not imported. A null target is a type the site does not
   * map to a wrapper. The wrappers that are targets are the ones the CMA reports (F-68).
   */
  classificationToWrapper: Readonly<Record<string, WrapperId | null>>;
}

/** The person's goal, as far as the fit mark reads it. Absent: no fit mark (`fit` is null). */
export interface WorkbenchGoal {
  horizonYears: number;
}

/**
 * F-83 read for F-64 (method, 2026-10-24): the workbench ranks nothing, so each track has exactly one of four outcomes.
 * Not eligible comes first (a track open only to a sector or an employer, CAT-10), then not evaluated (no goal given,
 * or the track has no classification in the data), then shown without a rule (the fit table has no row), else shown
 * with the mark.
 */
export type TrackOutcome =
  | { code: "not-eligible"; ruleIds: ["CAT-10"]; population: string }
  | { code: "not-evaluated"; reason: "no-goal" | "no-classification" }
  | { code: "shown-without-rule" }
  | { code: "shown-with-mark"; mark: "fits" | "does-not-fit" };

/** The CMA's own words for a track open to the whole public (CAT-10); the other values name a sector or an employer. */
export const generalPopulation = "כלל האוכלוסיה";

export interface TrackRow {
  fundId: number;
  dataset: CmaPeriodFile["dataset"];
  name: string;
  companyId: string;
  companyName: string;
  classification: string;
  specialization: string;
  subSpecialization: string;
  targetPopulation: string;
  reportPeriod: string;
  /** `AVG_ANNUAL_MANAGEMENT_FEE` and `AVG_DEPOSIT_FEE` as the record holds them: a null value stays null, with its notes. */
  fees: { management: ValueObject; deposit: ValueObject };
  /** The F-68 reference of the track's class, or "none available". */
  reference: RegulatorReference | NoReference;
  /** The F-70 mark against the goal; null when no goal horizon was given. */
  fit: ClassificationFit | null;
  /** The near-duplicate group this track belongs to (same name within a company), if any. */
  groupId: string | null;
  /** The F-83 outcome of the track (additive, 2026-10-24). */
  outcome: TrackOutcome;
}

/** Tracks of one company with an identical name: distinct funds or one fund listed twice, which the CMA data does not say. */
export interface TrackGroup {
  id: string;
  companyId: string;
  name: string;
  fundIds: number[];
}

export interface TrackCoverage {
  /** Every track of the wrapper in the latest period (F-83). */
  considered: number;
  /** Tracks in the table: all of them; a duplicate is flagged, never dropped. */
  shown: number;
  /** Tracks that belong to a near-duplicate group. */
  grouped: number;
  /** Tracks without a reported average annual management fee. */
  feeNotReported: number;
  /** Tracks without a reported average deposit fee. */
  depositFeeNotReported: number;
  invariant: { ok: boolean };
  /** Tracks by F-83 outcome: the four counts add up to `considered`. */
  outcomes: { "not-eligible": number; "not-evaluated": number; "shown-without-rule": number; "shown-with-mark": number };
  /** The finer split the coverage sentence draws, adding up to `considered`. */
  split: { fits: number; "does-not-fit": number; "no-rule": number; "not-eligible": number; "no-goal": number; "no-classification": number };
}

export interface TrackWorkbench {
  formula: "F-64";
  wrapper: WrapperId;
  /** The report period of each dataset the tracks come from. */
  periods: { dataset: CmaPeriodFile["dataset"]; period: string }[];
  rows: TrackRow[];
  groups: TrackGroup[];
  coverage: TrackCoverage;
}

const nameOf = (t: CmaTrack) => t.names.cma[0]!.trim();
const companyOf = (t: CmaTrack) => t.managing_corporation.legal_id;

/**
 * F-64 Track workbench. Every track for the wrapper at every company (F-83) from the latest CMA period of each
 * dataset: its name, company and classification, its two average fees (null stays null with its notes), the
 * F-68 class reference, and the F-70 fit mark against the goal's horizon. Tracks of one company with an identical
 * name are flagged as a near-duplicate group, not merged. The coverage line says: considered N; shown N;
 * grouped K; fee not reported M.
 */
export function trackWorkbench(
  wrapperId: WrapperId,
  cmaRecords: readonly CmaPeriodFile[],
  goal: WorkbenchGoal | undefined,
  fitTable: FitTable,
  references: WorkbenchReferences,
): TrackWorkbench {
  const all = latestTracks(cmaRecords);
  const cmaWrappers = new Set<WrapperId>();
  for (const w of Object.values(references.classificationToWrapper)) if (w) cmaWrappers.add(w);
  const forWrapper = all.filter((t) => references.classificationToWrapper[t.fund_classification.trim()] === wrapperId);

  const keyOf = (t: CmaTrack): ClassificationKey => ({ fund_classification: t.fund_classification, specialization: t.specialization });
  const referenceCache = new Map<string, RegulatorReference | NoReference>();
  const referenceOf = (t: CmaTrack) => {
    const key = `${t.fund_classification.trim()}\u0000${t.specialization.trim()}`;
    let r = referenceCache.get(key);
    if (!r) {
      r = referenceForWrapper(wrapperId, cmaWrappers, all, keyOf(t));
      referenceCache.set(key, r);
    }
    return r;
  };

  const byName = new Map<string, CmaTrack[]>();
  for (const t of forWrapper) {
    const k = `${companyOf(t)}\u0000${nameOf(t)}`;
    byName.set(k, [...(byName.get(k) ?? []), t]);
  }
  const groups: TrackGroup[] = [];
  const groupOf = new Map<number, string>();
  for (const members of byName.values()) {
    if (members.length < 2) continue;
    const id = `${companyOf(members[0]!)}:${nameOf(members[0]!)}`;
    groups.push({ id, companyId: companyOf(members[0]!), name: nameOf(members[0]!), fundIds: members.map((m) => m.fund_id) });
    for (const m of members) groupOf.set(m.fund_id, id);
  }

  const outcomeOf = (t: CmaTrack, fit: ClassificationFit | null): TrackOutcome => {
    const population = t.target_population.trim();
    if (population !== "" && population !== generalPopulation) return { code: "not-eligible", ruleIds: ["CAT-10"], population };
    if (!goal) return { code: "not-evaluated", reason: "no-goal" };
    if (t.specialization.trim() === "" && t.sub_specialization.trim() === "") return { code: "not-evaluated", reason: "no-classification" };
    if (!fit || fit.mark === "no-rule") return { code: "shown-without-rule" };
    return { code: "shown-with-mark", mark: fit.mark };
  };

  const rows: TrackRow[] = forWrapper.map((t) => {
    const fit = goal ? classificationFit({ specialization: t.specialization, sub_specialization: t.sub_specialization }, goal.horizonYears, fitTable) : null;
    return {
    fundId: t.fund_id,
    dataset: t.dataset,
    name: nameOf(t),
    companyId: companyOf(t),
    companyName: t.managing_corporation.name.trim(),
    classification: t.fund_classification.trim(),
    specialization: t.specialization.trim(),
    subSpecialization: t.sub_specialization.trim(),
    targetPopulation: t.target_population.trim(),
    reportPeriod: t.report_period,
    fees: { management: t.fees.avg_annual_management_fee, deposit: t.fees.avg_deposit_fee },
    reference: referenceOf(t),
    fit,
    groupId: groupOf.get(t.fund_id) ?? null,
    outcome: outcomeOf(t, fit),
  };
  });

  const periods = [...new Map(forWrapper.map((t) => [t.dataset, t.report_period])).entries()].map(([dataset, period]) => ({ dataset, period }));
  const count = (f: (o: TrackOutcome) => boolean) => rows.filter((r) => f(r.outcome)).length;
  const outcomes = {
    "not-eligible": count((o) => o.code === "not-eligible"),
    "not-evaluated": count((o) => o.code === "not-evaluated"),
    "shown-without-rule": count((o) => o.code === "shown-without-rule"),
    "shown-with-mark": count((o) => o.code === "shown-with-mark"),
  };
  const coverage: TrackCoverage = {
    considered: forWrapper.length,
    shown: rows.length,
    grouped: groupOf.size,
    feeNotReported: rows.filter((r) => r.fees.management.value === null).length,
    depositFeeNotReported: rows.filter((r) => r.fees.deposit.value === null).length,
    invariant: {
      ok:
        rows.length === forWrapper.length &&
        new Set(rows.map((r) => r.fundId)).size === rows.length &&
        outcomes["not-eligible"] + outcomes["not-evaluated"] + outcomes["shown-without-rule"] + outcomes["shown-with-mark"] === rows.length,
    },
    outcomes,
    split: {
      fits: count((o) => o.code === "shown-with-mark" && o.mark === "fits"),
      "does-not-fit": count((o) => o.code === "shown-with-mark" && o.mark === "does-not-fit"),
      "no-rule": outcomes["shown-without-rule"],
      "not-eligible": outcomes["not-eligible"],
      "no-goal": count((o) => o.code === "not-evaluated" && o.reason === "no-goal"),
      "no-classification": count((o) => o.code === "not-evaluated" && o.reason === "no-classification"),
    },
  };
  return { formula: "F-64", wrapper: wrapperId, periods, rows, groups, coverage };
}
