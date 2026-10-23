// F-83 output: the coverage line and its invariant (every candidate appears exactly once and the counts sum
// to N). Generic over the outcome vocabulary, because the idle-cash preset reads "baseline" and "compared"
// where a goal comparison reads "ranked" (F-83 outcome 5).
import type { CoverageEntry, CoverageLine, Reason } from "./types.ts";

export interface Accounted<K extends string> {
  id: string;
  name?: string;
  kind: K;
  reasons: Reason[];
}

/**
 * Counts each outcome, lists every candidate whose outcome is not one of `positive` (those that take part in
 * the comparison), and checks the invariant. `kinds` names every outcome so each has a count, zero included.
 */
export function coverageLine<K extends string>(entries: readonly Accounted<K>[], kinds: readonly K[], positive: readonly K[]): CoverageLine<K> {
  const counts = Object.fromEntries(kinds.map((k) => [k, 0])) as Record<K, number>;
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const notRanked: CoverageEntry<K>[] = [];
  for (const e of entries) {
    if (seen.has(e.id)) duplicates.push(e.id);
    seen.add(e.id);
    counts[e.kind] += 1;
    if (!positive.includes(e.kind)) notRanked.push({ id: e.id, ...(e.name ? { name: e.name } : {}), kind: e.kind, reasons: e.reasons });
  }
  const sum = kinds.reduce((s, k) => s + counts[k], 0);
  return {
    considered: entries.length,
    counts,
    notRanked,
    invariant: { ok: duplicates.length === 0 && sum === entries.length, sum, duplicates },
  };
}

/** Throws if the invariant fails: a comparison must never drop or double a candidate (method §13). */
export function assertInvariant(line: CoverageLine<string>): void {
  if (!line.invariant.ok) {
    throw new Error(
      `coverage invariant broken: ${line.considered} candidates, counts sum to ${line.invariant.sum}, duplicated ${line.invariant.duplicates.join(", ") || "none"}`,
    );
  }
}
