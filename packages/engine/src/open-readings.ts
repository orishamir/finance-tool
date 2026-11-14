// Open readings (method §13, F-119, F-120): a case the rule base leaves open between a few readings it names. The resolver does not pick
// one. A run that meets the case is run once under each reading (`acrossReadings`); where every reading gives the same result, that result
// stands and carries the question as a flag; where they differ, the run stops on the question as on any open rule (D10).
import type { FieldRole, Flag, Outcome, ResultFields, RunContext } from "./result.ts";
import type { YearlyMove } from "./formulas/indexation.ts";

/** One way the rule base allows an amount to stand after a year in which the CPI fell. */
export type ReadingId = "lower" | "hold" | "carry";

export interface Reading {
  id: ReadingId;
  /** The amount `value` after one yearly move per entry of `rises` (each a year's CPI rise, a fraction, below zero for a fall), in order. */
  amount(value: number, rises: readonly number[]): number;
}

/**
 * The three readings of a law that moves an amount "by the rise in the CPI" and does not say what a fall does to it (TXG OQ17, KGL OQ15):
 * - `lower`: a fall lowers the amount as a rise raises it, `value × Π(1 + r)`;
 * - `hold`: a fall leaves the amount as it was, and a later rise raises it from there, `value × Π max(1, 1 + r)`;
 * - `carry`: a fall leaves the amount as it was and is carried against the next rises, so the amount moves only once the index passes its
 *   highest level since the amount was read, `value × max(1, the highest of the running products Π(1 + r))`.
 */
export const fallReadings: readonly Reading[] = [
  { id: "lower", amount: (value, rises) => rises.reduce((a, r) => a * (1 + r), value) },
  { id: "hold", amount: (value, rises) => rises.reduce((a, r) => a * Math.max(1, 1 + r), value) },
  {
    id: "carry",
    amount: (value, rises) => {
      let level = 1;
      let peak = 1;
      for (const r of rises) peak = Math.max(peak, (level *= 1 + r));
      return value * peak;
    },
  },
];

/**
 * A case the rule base holds open between named readings: the rule a run stops on when they disagree, the question that holds it open,
 * which figures it covers, and the readings.
 */
export interface OpenReading {
  ruleId: string;
  question: string;
  /** The figures it covers: those that move by `move` in a later tax year, and, where named, only those of these rules. */
  covers: { move: YearlyMove["kind"]; rules?: readonly string[] };
  readings: readonly Reading[];
}

/**
 * The open readings the resolver knows, each met when a figure it covers is read for a later tax year at a falling CPI (A-02 below zero):
 * - TXG OQ17: every amount s.120ב moves after its freeze (F-119), since s.120ב(א) adjusts them "לפי שיעור עליית המדד בשנת המס הקודמת"
 *   (TXG-09) and says nothing of a fall.
 * - KGL OQ15: KGL-03's yearly ceiling (F-120), which the Provident Funds Law s.22(א) updates every 1 January "by the rise in the CPI"
 *   (KGL-02) and says nothing of a fall.
 * A figure linked to the CPI every 1 January of a rule not named here has no reading at a fall: the resolver stops on its rule, naming G-38.
 */
export const openReadings: readonly OpenReading[] = [
  { ruleId: "TXG-09", question: "TXG OQ17", covers: { move: "frozen" }, readings: fallReadings },
  { ruleId: "KGL-03", question: "KGL OQ15", covers: { move: "cpi-linked", rules: ["KGL-03"] }, readings: fallReadings },
];

/** The open reading that covers a figure of rule `ruleId` moving by `move`, or null. */
export function openReadingOf(move: YearlyMove, ruleId: string): OpenReading | null {
  return openReadings.find((o) => o.covers.move === move.kind && (!o.covers.rules || o.covers.rules.includes(ruleId))) ?? null;
}

/** The reading a run is under for each question it met (`RunContext.readings`); null stops the run on the question. */
export type ReadingChoice = Readonly<Record<string, ReadingId | null>>;

/** The resolver met an open reading the run has not chosen: `acrossReadings` runs it again under each. */
export class OpenReadingError extends Error {
  constructor(readonly open: OpenReading) {
    super(`${open.question} (${open.ruleId}) holds this case open between readings; the run is evaluated under each (acrossReadings)`);
  }
}

/** The flag a result carries for a question every reading of which gave it: the question's code with a hyphen ("TXG OQ17" → "TXG-OQ17"). */
export const readingFlag = (question: string) => question.replace(" OQ", "-OQ");

/** Whether two values agree number for number (to a billionth of the larger), every field and item of them. */
function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return a === b || Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => sameValue(x, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((k) => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

/**
 * Whether two results of the same run under two readings give the same outputs: every field the result type declares an output
 * (`ResultFields`), whole, number for number; its trail (flags, labels, rules read, formulas applied) and its working are left out. A field
 * the declaration does not name is compared, so a field a result gains counts as an output until it is declared otherwise.
 */
export function sameResult<R extends object>(a: R, b: R, fields: ResultFields<R>): boolean {
  const role = fields as Readonly<Record<string, FieldRole | undefined>>;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (role[k] ?? "output") !== "output" || sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/**
 * A run evaluated under every reading of each open question it meets. The run is first made with the readings `ctx` already holds; when
 * the resolver meets a question it holds no reading for, the run is made again under each of that question's readings (and so on for a
 * question met inside those). If every reading gives the same outputs (`sameResult` by `fields`, the result type's declaration), that result stands, flagged with the question; if not, the run is made
 * with the question stopping it (`BlockedError` with the rule and the question), and its ledger lists or stops it as for any open rule.
 */
export function acrossReadings<R extends { flags: Flag[] }>(ctx: RunContext, run: (ctx: RunContext) => R, fields: ResultFields<R>): R {
  const explore = (chosen: ReadingChoice): R => {
    try {
      return run({ ...ctx, readings: chosen });
    } catch (e) {
      if (!(e instanceof OpenReadingError) || e.open.question in chosen) throw e;
      const q = e.open.question;
      const results = e.open.readings.map((r) => explore({ ...chosen, [q]: r.id }));
      if (!results.every((r) => sameResult(r, results[0]!, fields))) return explore({ ...chosen, [q]: null });
      const first = results[0]!;
      const code = readingFlag(q);
      return first.flags.some((f) => f.code === code) ? first : { ...first, flags: [...first.flags, { code }] };
    }
  };
  return explore(ctx.readings ?? {});
}

/**
 * The rule and method gap a run stopped on where no reading of its case exists (a figure linked every 1 January at a falling CPI, G-38),
 * caught by its ledger as for any open rule, or null.
 */
export function stoppedOnGap(r: { outcome: Outcome }): { ruleId: string; gap: string } | null {
  const o = r.outcome;
  return o.code === "listed-not-ranked" && o.gap ? { ruleId: o.reason, gap: o.gap } : null;
}

/** The rule and open question a run stopped on because the question's readings gave it different results, or null. */
export function stoppedOnQuestion(r: { outcome: Outcome }): { ruleId: string; question: string } | null {
  const o = r.outcome;
  return o.code === "listed-not-ranked" && o.question ? { ruleId: o.reason, question: o.question } : null;
}
