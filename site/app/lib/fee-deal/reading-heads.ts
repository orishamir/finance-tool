// What the reading's cards say in their headlines, and how its curves are grouped, worked out from the library's reading (reading.ts) so
// the components only word and draw it: the main change of the periods, the finding of a curve, what the law rows hold, the periods a
// statement holds in, and which curve each period shows.
import type { ChangeKind, DealAction, DealSide } from "@finance-tool/engine";
import type { Curve, LawRow, PeriodCard, Reading, Undrawn } from "./reading";
import type { MonthKey } from "./model";
import { refOf, type FeeRef, type MarkView } from "./parts";
import type { SiteValue } from "../value";

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

// ---------------------------------------------------------------- the curves

/** The curves of one action on one side, or of holding, with the periods (by their first month) each shows. */
export interface CurveGroup {
  key: string;
  on: "action" | "held";
  action?: DealAction;
  side: DealSide;
  curves: Curve[];
  undrawn: Undrawn[];
}

const ORDER: readonly string[] = ["trade", "conversion", "deposit", "distribution", "transfer_out"];
const SIDES: readonly DealSide[] = ["all", "buy", "sell"];

const groupKeyOf = (on: "action" | "held", action: DealAction | undefined, side: DealSide) => `${on}:${action ?? ""}:${side}`;

/** The reading's curves and the ones it cannot draw, grouped by what they price: the actions in the page's order, a purchase before a sale, then holding. */
export function curveGroups(reading: Pick<Reading, "curves" | "undrawn">): CurveGroup[] {
  const groups = new Map<string, CurveGroup>();
  const take = (on: "action" | "held", action: DealAction | undefined, side: DealSide) => {
    const key = groupKeyOf(on, action, side);
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { key, on, ...(action ? { action } : {}), side, curves: [], undrawn: [] }));
    return g;
  };
  for (const c of reading.curves) take(c.on, c.action, c.side).curves.push(c);
  for (const u of reading.undrawn) take("action", u.action, u.side).undrawn.push(u);
  const rank = (g: CurveGroup) => (g.on === "held" ? 100 : ORDER.indexOf(g.action ?? "") * 3) + SIDES.indexOf(g.side);
  return [...groups.values()].sort((a, b) => rank(a) - rank(b));
}

/**
 * The periods a group of curves can show, in the reading's order, each with the curve it shows there: one choice per period where its
 * curves differ by period, none where one curve holds in every period it is drawn in.
 */
export function curveChoices(group: CurveGroup, periods: readonly Pick<PeriodCard, "from">[]): { from: MonthKey; curve: Curve }[] {
  return periods.flatMap((p) => {
    const curve = group.curves.find((c) => c.periods.includes(p.from));
    return curve ? [{ from: p.from, curve }] : [];
  });
}

/** The period a group's chart opens on: today's where the group has a curve in it, else the first it has. */
export function firstChoice(choices: readonly { from: MonthKey }[], current: MonthKey | null): MonthKey | null {
  return choices.find((c) => c.from === current)?.from ?? choices[0]?.from ?? null;
}

/**
 * What a curve's headline says: where one minimum, or one maximum, or one of each binds, at its sum (a minimum with the rate above it,
 * where the curve has one, `Curve.rate`); where the sums per period stop being larger than custody (and whether they are the largest cost of holding below it, the mark's `largest`); otherwise how many sums the cost
 * bends at.
 */
export type CurveHead =
  | { kind: "min"; mark: MarkView; rate?: SiteValue }
  | { kind: "max"; mark: MarkView }
  | { kind: "min-max"; min: MarkView; max: MarkView }
  | { kind: "meet"; mark: Extract<MarkView, { kind: "meet" }> }
  | { kind: "marks"; n: number };

export function curveHead(curve: Pick<Curve, "marks" | "at" | "rate">): CurveHead {
  const meet = curve.marks.find((m): m is Extract<MarkView, { kind: "meet" }> => m.kind === "meet");
  if (meet) return { kind: "meet", mark: meet };
  const mins = curve.marks.filter((m) => m.kind === "min");
  const maxes = curve.marks.filter((m) => m.kind === "max");
  if (mins.length === 1 && maxes.length === 0) return { kind: "min", mark: mins[0]!, ...(curve.rate ? { rate: curve.rate } : {}) };
  if (maxes.length === 1 && mins.length === 0) return { kind: "max", mark: maxes[0]! };
  if (mins.length === 1 && maxes.length === 1) {
    const at = (m: MarkView) => curve.at[curve.marks.indexOf(m)] ?? 0;
    if (at(mins[0]!) < at(maxes[0]!)) return { kind: "min-max", min: mins[0]!, max: maxes[0]! };
  }
  return { kind: "marks", n: new Set(curve.at).size };
}

/** Whether a purchase or sale on a curve includes a conversion: a conversion fee has a part in the curve of a trade (F-111). */
export const withConversion = (curve: Pick<Curve, "action" | "series">): boolean => curve.action === "trade" && curve.series.some((s) => s.fee.kind === "fx" || s.fee.kind === "fx_spread");

// ---------------------------------------------------------------- the statements

/** A stretch of the reading's periods: from the start of one (null where it is the reading's first) to the start of another (null: on). */
export interface Span {
  from: MonthKey | null;
  to: MonthKey | null;
}

/** The stretches of periods a statement holds in; none where it holds in all of them. */
export function spansOf(held: readonly MonthKey[], periods: readonly Pick<PeriodCard, "from" | "to">[]): Span[] {
  if (periods.every((p) => held.includes(p.from))) return [];
  const spans: Span[] = [];
  let open: Span | null = null;
  periods.forEach((p, k) => {
    if (held.includes(p.from)) {
      if (!open) open = { from: k === 0 ? null : p.from, to: p.to };
      else open.to = p.to;
    } else if (open) {
      spans.push(open);
      open = null;
    }
  });
  if (open) spans.push(open);
  return spans;
}

// ---------------------------------------------------------------- the law

/** What the law card's headline says, by what its rows hold: a price above the cap first, then one at it, then all below, then none judged. */
export type LawHead =
  | { kind: "above" | "at"; n: number }
  | { kind: "below" }
  | { kind: "no-cap"; n: number }
  | { kind: "not-judged" };

export function lawHead(rows: readonly LawRow[]): LawHead | null {
  if (rows.length === 0) return null;
  const count = (s: "above" | "at") => rows.filter((r) => r.prices.some((p) => p.standing.standing.judged && p.standing.standing.standing === s)).length;
  const above = count("above");
  if (above) return { kind: "above", n: above };
  const at = count("at");
  if (at) return { kind: "at", n: at };
  if (rows.some((r) => r.prices.some((p) => p.standing.standing.judged))) return { kind: "below" };
  if (rows.every((r) => r.cap.state === "none" && !r.cap.caveat)) return { kind: "no-cap", n: rows.length };
  return { kind: "not-judged" };
}
