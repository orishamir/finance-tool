// The coverage line of the providers workbench (F-63) and the reasons it gives a row that is not compared. The engine returns codes,
// never Hebrew text; the site maps them.

/**
 * Why a row was not compared, as a code with the rule and gap IDs behind it: `rule-open` (a rule in its run is open), `missing-record`
 * (a record the run needs is absent or does not parse) or `missing-input` (an input the run needs is not given).
 */
export type ReasonCode = "missing-input" | "missing-record" | "rule-open";

export interface Reason {
  code: ReasonCode;
  /** Rule IDs (il-finance) the reason rests on, from the record or the run. */
  ruleIds: string[];
  /** G-IDs (method section 12) behind the reason. */
  gapIds: string[];
  /** The field or open question. */
  detail?: string;
}

/** One line per row that is not compared, in the order the rows were built. */
export interface CoverageEntry<K extends string> {
  id: string;
  name?: string;
  kind: K;
  reasons: Reason[];
}

/** `considered`, the count per outcome, every row not compared with its reasons, the invariant. */
export interface CoverageLine<K extends string> {
  considered: number;
  counts: Record<K, number>;
  notRanked: CoverageEntry<K>[];
  invariant: { ok: boolean; sum: number; duplicates: string[] };
}
