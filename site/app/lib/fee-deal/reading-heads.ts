// What the timeline and the law card say in their headlines, worked out from the library's reading (reading.ts) so the components only
// word and draw it: the main change of the periods, and what the law rows hold.
import type { ChangeKind, DealSide } from "@finance-tool/engine";
import type { LawRow, PeriodCard } from "./reading";
import type { MonthKey } from "./model";
import { refOf, type FeeRef } from "./deal-read";

// ---------------------------------------------------------------- the periods

/** A change of one price at a period's start. */
export interface PeriodChange {
  at: MonthKey;
  fee: FeeRef;
  side: DealSide;
  change: ChangeKind;
  /** The new price's standing where it is judged at or above the cap. */
  cap?: "at" | "above";
}

/** Every change of the deal, period after period, in order. */
export function periodChanges(periods: readonly PeriodCard[]): PeriodChange[] {
  return periods.slice(1).flatMap((p) =>
    p.rows.flatMap((r) => {
      const out: PeriodChange[] = [];
      const capOf = (s: typeof r.standing): PeriodChange["cap"] => (s.standing.judged && (s.standing.standing === "at" || s.standing.standing === "above") ? s.standing.standing : undefined);
      const ref = refOf(r);
      const push = (side: DealSide, change: ChangeKind | undefined, cap: PeriodChange["cap"]) => change && out.push({ at: p.from, fee: ref, side, change, ...(cap ? { cap } : {}) });
      push(r.sale ? "buy" : "all", r.change, capOf(r.standing));
      if (r.sale) push("sell", r.sale.change, capOf(r.sale.standing));
      return out;
    }),
  );
}

/**
 * The headline of the periods: one change said with its fee, its kind and its month; several that all start after a free time, by their
 * count; several at one month, by their count and the month; otherwise the months the deal changes at (`months`, the first few and the
 * count).
 */
export type PeriodsHead =
  | { kind: "one"; change: PeriodChange }
  | { kind: "starts"; n: number }
  | { kind: "one-month"; at: MonthKey; n: number }
  | { kind: "months"; months: MonthKey[]; n: number };

export function periodsHead(periods: readonly PeriodCard[]): PeriodsHead | null {
  const changes = periodChanges(periods);
  if (changes.length === 0) return null;
  if (changes.length === 1) return { kind: "one", change: changes[0]! };
  const fees = new Set(changes.map((c) => c.fee.fee));
  if (changes.every((c) => c.change === "starts") && fees.size === changes.length) return { kind: "starts", n: changes.length };
  const months = [...new Set(changes.map((c) => c.at))];
  if (months.length === 1) return { kind: "one-month", at: months[0]!, n: changes.length };
  return { kind: "months", months, n: months.length };
}

/**
 * What the law card's headline says, by what its rows hold: a price above the cap first, then one at it, then a fee the law bans here, then
 * all below, then none judged.
 */
export type LawHead =
  | { kind: "above" | "at"; n: number }
  | { kind: "below" }
  | { kind: "banned"; n: number }
  | { kind: "no-cap"; n: number }
  | { kind: "not-judged" };

export function lawHead(rows: readonly LawRow[]): LawHead | null {
  if (rows.length === 0) return null;
  const count = (s: "above" | "at") => rows.filter((r) => r.prices.some((p) => p.standing.standing.judged && p.standing.standing.standing === s)).length;
  const above = count("above");
  if (above) return { kind: "above", n: above };
  const at = count("at");
  if (at) return { kind: "at", n: at };
  const banned = rows.filter((r) => r.cap.state === "banned").length;
  if (banned) return { kind: "banned", n: banned };
  if (rows.some((r) => r.prices.some((p) => p.standing.standing.judged))) return { kind: "below" };
  if (rows.every((r) => r.cap.state === "none" && !r.cap.caveat)) return { kind: "no-cap", n: rows.length };
  return { kind: "not-judged" };
}
