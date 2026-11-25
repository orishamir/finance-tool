// Open readings (method §13, F-04, F-119, F-120): a case the rule base leaves open between a few readings it names. The resolver does not
// pick one. A run that meets the case is run once under each reading (`acrossReadings`); where every reading gives the same result, that
// result stands and carries the question as a flag; where they differ, the run stops on the question as on any open rule (D10).
import type { UsedRule } from "./resolver.ts";
import { labelWeight, type FieldRole, type Flag, type Label, type Outcome, type ResultFields, type RunContext } from "./result.ts";
import type { YearlyMove } from "./formulas/indexation.ts";
import { assertNever } from "@finance-tool/schema";

/** One way the rule base allows an amount to stand after a year in which the CPI fell. */
export type FallReadingId = "lower" | "hold" | "carry";
/** The index a foreign-investment fund's real gain is measured by (F-04): its principal currency's exchange rate, or the CPI. */
export type TaxIndexReadingId = "principal" | "cpi";
export type ReadingId = FallReadingId | TaxIndexReadingId;

export interface FallReading {
  id: FallReadingId;
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
export const fallReadings: readonly FallReading[] = [
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
 * What a run does where the readings of an open case give it different results (method §13):
 * - `stop`: it stops on the rule with the question, as on any open rule (D10);
 * - `cautious`: the reading whose result leaves the holder less stands, whole (guidelines/research.md step 6), the less read on the value
 *   the result type declares (`FieldRole` "value"). The figure is the site's reading of the rule, and every reading's run says so with a
 *   `reading` label on the rule (`RuleBook.reading`).
 */
export type SplitPolicy = "stop" | "cautious";

/**
 * A case the rule base holds open between named readings: the rule it rests on, the question that holds it open, what a split between
 * the readings does (`onSplit`), and the readings. Each kind of case says where a run meets it.
 */
interface OpenReadingBase {
  ruleId: string;
  question: string;
  onSplit: SplitPolicy;
}

/** An amount moved by the CPI in a later tax year, at a falling CPI: the figures it covers and the ways the amount may stand. */
export interface FallOpenReading extends OpenReadingBase {
  kind: "fall";
  /** The figures it covers: those that move by `move` in a later tax year, and, where named, only those of these rules. */
  covers: { move: YearlyMove["kind"]; rules?: readonly string[] };
  readings: readonly FallReading[];
}

/** The index a fund's real gain is measured by at the exit (F-04): met by the tax index of a fund the case covers (`taxIndexOf`). */
export interface TaxIndexOpenReading extends OpenReadingBase {
  kind: "tax-index";
  readings: readonly { id: TaxIndexReadingId }[];
}

export type OpenReading = FallOpenReading | TaxIndexOpenReading;

/**
 * TXS OQ26: whether the 2003 regulations that measure a foreign-investment fund's inflationary amount by its principal currency still operate
 * (TXS-14). Until it is settled, the principal-currency index is a reading of their texts; if they no longer operate, the fund's shekel units
 * are measured by the CPI, TXS-14's first bullet. A fund whose record does not say whether it is one, on an index in a foreign currency, meets
 * the same two readings (method F-04).
 */
export const foreignInvestmentFundIndex: TaxIndexOpenReading = { kind: "tax-index", ruleId: "TXS-14", question: "TXS OQ26", onSplit: "stop", readings: [{ id: "principal" }, { id: "cpi" }] };

/**
 * The open readings the resolver knows:
 * - TXG OQ17: every amount s.120ב moves after its freeze (F-119), since s.120ב(א) adjusts them "לפי שיעור עליית המדד בשנת המס הקודמת"
 *   (TXG-09) and says nothing of a fall; met when such an amount is read for a later tax year at a falling CPI (A-02 below zero).
 * - KGL OQ15: KGL-03's yearly ceiling (F-120), which the Provident Funds Law s.22(א) updates every 1 January "by the rise in the CPI"
 *   (KGL-02) and says nothing of a fall; met the same way.
 * - TXS OQ26: the tax index of a foreign-investment fund (`foreignInvestmentFundIndex`, F-04).
 * A figure linked to the CPI every 1 January of a rule not named here has no reading at a fall: the resolver stops on its rule, naming G-38.
 */
export const openReadings: readonly OpenReading[] = [
  { kind: "fall", ruleId: "TXG-09", question: "TXG OQ17", onSplit: "stop", covers: { move: "frozen" }, readings: fallReadings },
  { kind: "fall", ruleId: "KGL-03", question: "KGL OQ15", onSplit: "stop", covers: { move: "cpi-linked", rules: ["KGL-03"] }, readings: fallReadings },
  foreignInvestmentFundIndex,
];

/** The open reading that covers a figure of rule `ruleId` moving by `move` at a falling CPI, or null. */
export function openReadingOf(move: YearlyMove, ruleId: string): FallOpenReading | null {
  return openReadings.find((o): o is FallOpenReading => o.kind === "fall" && o.covers.move === move.kind && (!o.covers.rules || o.covers.rules.includes(ruleId))) ?? null;
}

/** The reading a run is under for each question it met (`RunContext.readings`); null stops the run on the question. */
export type ReadingChoice = Readonly<Record<string, ReadingId | null>>;

/** The resolver met an open reading the run has not chosen: `acrossReadings` runs it again under each. */
export class OpenReadingError extends Error {
  readonly open: OpenReading;
  constructor(open: OpenReading) {
    super(`${open.question} (${open.ruleId}) holds this case open between readings; the run is evaluated under each (acrossReadings)`);
    this.open = open;
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
  return [...keys].every((k) => !compared(role[k]) || sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/** Whether a field of this role is compared across readings: an output, the declared value among them, or a field not declared. */
const compared = (role: FieldRole | undefined): boolean => role === undefined || role === "output" || role === "value";

/**
 * The reading whose result leaves the holder less (`SplitPolicy` "cautious"): the lowest value of the one field `fields` declares the
 * value, the first such reading where two give it alike. A result type that declares no value, or more than one, is a broken invariant.
 */
function cautiousOf<R extends object>(results: readonly R[], fields: ResultFields<R>): R {
  const values = Object.entries(fields as Readonly<Record<string, FieldRole>>).filter(([, role]) => role === "value");
  if (values.length !== 1) throw new Error(`a cautious reading reads the one value its result type declares; this one declares ${values.length}`);
  const key = values[0]![0];
  const valueOf = (r: R): number => {
    const v = (r as Record<string, unknown>)[key];
    if (typeof v !== "number") throw new Error(`a cautious reading reads ${key}, which a result gave as ${typeof v}`);
    return v;
  };
  return results.reduce((low, r) => (valueOf(r) < valueOf(low) ? r : low));
}

/**
 * The flags of every reading's result, one per code in the order they first appear, each from the earliest month any reading raises it, a
 * flag with no month (the whole run) counting as the earliest, as `Tally.flag` keeps a code's first occurrence: a caveat raised under one
 * reading only still stands beside a figure all readings give.
 */
export function mergedFlags(results: readonly { flags: readonly Flag[] }[]): Flag[] {
  const byCode = new Map<string, Flag>();
  for (const r of results) {
    for (const f of r.flags) {
      const seen = byCode.get(f.code);
      if (!seen) byCode.set(f.code, f);
      else if (seen.month !== undefined && (f.month === undefined || f.month < seen.month)) byCode.set(f.code, f.month === undefined ? { code: f.code } : { ...seen, month: f.month });
    }
  }
  return [...byCode.values()];
}

/** The labels of every reading's result, one per rule in the order they first appear, each the strongest any reading gives it. */
export function mergedLabels(results: readonly { labels?: readonly Label[] }[]): Label[] {
  const byRule = new Map<string, Label>();
  for (const r of results) {
    for (const l of r.labels ?? []) {
      const seen = byRule.get(l.ruleId);
      if (!seen || labelWeight[l.code] > labelWeight[seen.code]) byRule.set(l.ruleId, l);
    }
  }
  return [...byRule.values()];
}

/**
 * The rules every reading's result read, one per id in the order they first appear, each with the figures any reading read of it: a label
 * taken from another reading never names a rule missing from `rules`, which the dimension checklist reads.
 */
export function mergedRules(results: readonly { rules?: readonly UsedRule[] }[]): UsedRule[] {
  const byId = new Map<string, UsedRule>();
  for (const r of results) {
    for (const u of r.rules ?? []) {
      const seen = byId.get(u.id);
      if (!seen) byId.set(u.id, { ...u, figures: [...u.figures] });
      else for (const f of u.figures) if (!seen.figures.some((g) => g.name === f.name)) seen.figures.push(f);
    }
  }
  return [...byId.values()];
}

/**
 * A run evaluated under every reading of each open question it meets. The run is first made with the readings `ctx` already holds; when
 * the resolver meets a question it holds no reading for, the run is made again under each of that question's readings (and so on for a
 * question met inside those). If every reading gives the same outputs (`sameResult` by `fields`, the result type's declaration), that
 * result stands with the flags, labels and rules of every reading merged (`mergedFlags`, `mergedLabels`, `mergedRules`), flagged with the
 * question. If not, the question's `onSplit` decides: `stop` makes the run with the question stopping it (`BlockedError` with the rule and
 * the question), and its ledger lists or stops it as for any open rule; `cautious` lets the result that leaves the holder less stand,
 * whole (`cautiousOf`).
 */
export function acrossReadings<R extends { flags: Flag[]; labels?: Label[]; rules?: UsedRule[] }>(ctx: RunContext, run: (ctx: RunContext) => R, fields: ResultFields<R>): R {
  const explore = (chosen: ReadingChoice): R => {
    try {
      return run({ ...ctx, readings: chosen });
    } catch (e) {
      if (!(e instanceof OpenReadingError) || e.open.question in chosen) throw e;
      const q = e.open.question;
      const results = e.open.readings.map((r) => explore({ ...chosen, [q]: r.id }));
      if (!results.every((r) => sameResult(r, results[0]!, fields))) {
        switch (e.open.onSplit) {
          case "stop":
            return explore({ ...chosen, [q]: null });
          case "cautious":
            return cautiousOf(results, fields);
          default:
            return assertNever(e.open.onSplit);
        }
      }
      // the outputs agree; the caveats of every reading stand beside them, with the question's own flag
      const first = results[0]!;
      const code = readingFlag(q);
      const flags = mergedFlags([...results, { flags: [{ code }] }]);
      return { ...first, flags, ...(first.labels ? { labels: mergedLabels(results) } : {}), ...(first.rules ? { rules: mergedRules(results) } : {}) };
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
