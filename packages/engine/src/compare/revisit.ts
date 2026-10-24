// F-82 Revisit (product 3.9): a saved comparison keeps the versions it rested on; on revisit the engine re-runs
// with the current ones, lists what differs, and says whether F-80's top option and tie set are unchanged.
// No I/O: callers pass the data.
import { parameterRecord, type ValueObject, type WrapperId } from "@finance-tool/schema";
import type { RunContext } from "../result.ts";
import { buildCandidateSet, type CandidateSet, type CandidateSetInput } from "./candidates.ts";
import { rankCandidates, tieThreshold, type Ranking } from "./ranking.ts";
import type { CandidateInput, Tier2Instrument } from "./types.ts";

/** One rule figure a comparison read: rule ID, figure name, value as stored (a bracket schedule as `{ upTo, rate }[]`), its `checked` date. */
export interface RuleFigureVersion {
  ruleId: string;
  figure: string;
  value: unknown;
  checked: string | null;
}

/** A parameter P-nn as it stood: its value (a value object's `value`, else the record without its prose). */
export interface ParameterVersion {
  methodId: string;
  id: string;
  value: unknown;
}

/** A data file the comparison used (a fee snapshot, a series, a deposit-terms record), by path and `checked` date. */
export interface DataFileVersion {
  path: string;
  checked: string | null;
}

/** An assumption A-nn: its value and D7 state (entered by the person, or sourced). */
export interface AssumptionVersion {
  id: string;
  value: unknown;
  state: ValueObject["state"];
}

/** The versions a comparison rests on; the part of a saved comparison that `diffVersions` compares. */
export interface Versions {
  rules: RuleFigureVersion[];
  parameters: ParameterVersion[];
  data: DataFileVersion[];
  assumptions: AssumptionVersion[];
}

/** What a comparison concluded: F-80's top option, the tie set, and each ranked option's value. */
export interface ComparisonResult {
  top?: string;
  tieSet: string[];
  entries: { id: string; real: number; nominal: number; gapToNext?: number }[];
}

/**
 * F-82 the saved comparison record: the inputs as the person gave them (wrapper records, terms, tier-2 list,
 * parameters, goal), every A-nn, P-nn, rule figure and data file the run used, and the result. Plain JSON data.
 */
export interface SavedComparison extends Versions {
  /** `YYYY-MM-DD`, the run date of the saved comparison. */
  savedOn: string;
  inputs: CandidateSetInput;
  result: ComparisonResult;
}

export type DiffKind = "rule" | "parameter" | "data" | "assumption";

/** One entry whose value differs. `old` or `new` is null when the entry is not there on that side. */
export interface VersionDiff {
  kind: DiffKind;
  /** `TXS-09/rate`, `P-01`, the file path, or `A-01`. */
  key: string;
  old: unknown;
  new: unknown;
  /** Rules and data: the `checked` date on each side. */
  oldChecked?: string | null;
  newChecked?: string | null;
}

/** The current bundle a revisit re-runs with: wrapper records and terms, parameters and data as they are now. The goal is the saved one. */
export interface CurrentBundle {
  wrappers: readonly CandidateInput[];
  tier2: readonly Tier2Instrument[];
  parameters: readonly unknown[];
  dataFiles: readonly DataFileVersion[];
  /** Assumptions beyond A-01, A-02 and the candidates' cash rates, by ID, as the caller holds them now. */
  extraAssumptions?: readonly AssumptionVersion[];
}

export interface Revisit {
  diff: VersionDiff[];
  before: ComparisonResult;
  after: ComparisonResult;
  topUnchanged: boolean;
  tieSetUnchanged: boolean;
  /** F-82: the top option and the tie set are both unchanged. */
  unchanged: boolean;
  /** Each option whose value (real or nominal) differs, with both values; null where the option was not ranked on that side. */
  valueChanges: { id: string; before: { real: number; nominal: number } | null; after: { real: number; nominal: number } | null }[];
  set: CandidateSet;
  ranking: Ranking;
}

// ---------------------------------------------------------------- snapshots

/** The wrapper's cash rate is the assumption A-20 (daily fund), A-22 (makam), A-23 (bond), A-24 (renewable fund) or A-25 (deposit family). */
const cashRateAssumption: Partial<Record<WrapperId, string>> = {
  "money-market-fund-daily": "A-20",
  makam: "A-22",
  "government-bond": "A-23",
  "money-market-fund-renewable": "A-24",
  "bank-deposit": "A-25",
  "savings-plan": "A-25",
  "current-account": "A-25",
};

/** A-01 and A-02 from the goal (entered), and each candidate's cash rate under its A-nn. */
export function assumptionVersions(
  goal: CandidateSetInput["goal"],
  wrappers: readonly CandidateInput[],
  extra: readonly AssumptionVersion[] = [],
): AssumptionVersion[] {
  const out: AssumptionVersion[] = [];
  if (goal.grossReturnPct !== undefined) out.push({ id: "A-01", value: goal.grossReturnPct, state: "entered" });
  if (goal.inflationPct !== undefined) out.push({ id: "A-02", value: goal.inflationPct, state: "entered" });
  for (const w of wrappers) {
    const id = (w.record as { id?: WrapperId } | undefined)?.id;
    const a = id ? cashRateAssumption[id] : undefined;
    if (a && w.cashRate) out.push({ id: id === "bank-deposit" || id === "savings-plan" || id === "current-account" ? `${a}:${id}` : a, value: w.cashRate.value, state: w.cashRate.state });
  }
  return [...out, ...extra].sort((x, y) => x.id.localeCompare(y.id));
}

const descriptive = new Set(["id", "method_id", "rationale", "rationale_he", "signed_off_by", "signed_off_on", "shown_as"]);

/** Every P-nn record passed, by its method ID. */
export function parameterVersions(parameters: readonly unknown[]): ParameterVersion[] {
  return parameters
    .map((p) => {
      const r = parameterRecord.parse(p) as Record<string, unknown> & { id: string; method_id: string; value?: ValueObject };
      const value = r.value ? r.value.value : Object.fromEntries(Object.entries(r).filter(([k]) => !descriptive.has(k)));
      return { methodId: r.method_id, id: r.id, value };
    })
    .sort((a, b) => a.methodId.localeCompare(b.methodId));
}

/** A rule figure as the run reads it in `ctx`'s tax year; undefined when the rule or figure is not in the bundle. */
export function ruleFigureVersion(ctx: RunContext, ruleId: string, figure: string): RuleFigureVersion {
  const taxYear = String(Number(ctx.runDate.slice(0, 4)));
  const f = ctx.rules.find((r) => r.id === ruleId)?.figures?.[figure];
  const out = (value: unknown, checked: string | null): RuleFigureVersion => ({ ruleId, figure, value, checked });
  if (f === undefined) return out(null, null);
  if (Array.isArray(f)) {
    const checks = f.flatMap((b) => [b.up_to.checked, b.rate.checked]).sort();
    return out(f.map((b) => ({ upTo: b.up_to.value, rate: b.rate.value })), checks[checks.length - 1] ?? null);
  }
  const v = "by_tax_year" in f ? f.by_tax_year[taxYear] : (f as ValueObject);
  return v ? out(v.value, v.checked) : out(null, null);
}

/** Every (rule, figure) a set of runs read, in the order of first use, each once. */
function figuresRead(set: CandidateSet): { ruleId: string; figure: string }[] {
  const seen = new Set<string>();
  const out: { ruleId: string; figure: string }[] = [];
  const runs = [...set.candidates.map((c) => c.run), set.keptAvailable?.run];
  for (const run of runs) {
    for (const u of run?.rules ?? []) {
      for (const f of u.figures) {
        const key = `${u.id}/${f.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ ruleId: u.id, figure: f.name });
        }
      }
    }
  }
  return out.sort((a, b) => `${a.ruleId}/${a.figure}`.localeCompare(`${b.ruleId}/${b.figure}`));
}

export function resultOf(ranking: Ranking): ComparisonResult {
  return {
    ...(ranking.top !== undefined ? { top: ranking.top } : {}),
    tieSet: [...ranking.tieSet],
    entries: ranking.entries.map((e) => ({ id: e.id, real: e.real, nominal: e.nominal, ...(e.gapToNext !== undefined ? { gapToNext: e.gapToNext } : {}) })),
  };
}

/**
 * Builds the record of a comparison that was just run (F-82): the rule figures its runs read are looked up in
 * `ctx` with their `checked` dates; `dataFiles` is what the caller read from `data/` for it, by path and date.
 */
export function saveComparison(args: {
  inputs: CandidateSetInput;
  set: CandidateSet;
  ranking: Ranking;
  ctx: RunContext;
  dataFiles: readonly DataFileVersion[];
  extraAssumptions?: readonly AssumptionVersion[];
}): SavedComparison {
  const { inputs, set, ranking, ctx } = args;
  return {
    savedOn: ctx.runDate,
    inputs: structuredClone(inputs),
    result: resultOf(ranking),
    rules: figuresRead(set).map((f) => ruleFigureVersion(ctx, f.ruleId, f.figure)),
    parameters: parameterVersions(inputs.parameters),
    data: [...args.dataFiles].sort((a, b) => a.path.localeCompare(b.path)).map((d) => ({ ...d })),
    assumptions: assumptionVersions(inputs.goal, inputs.wrappers, args.extraAssumptions),
  };
}

// ---------------------------------------------------------------- diff

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function byKey<T>(items: readonly T[], key: (t: T) => string): Map<string, T> {
  return new Map(items.map((i) => [key(i), i]));
}

/**
 * F-82 The entries whose values differ between the saved comparison and the current versions, each with its old
 * and new value: rule figures (by value), parameters (by value), data files (by `checked` date, or gone) and
 * assumptions (by value and state). An entry that exists on one side only is listed with null on the other.
 * A rule figure whose value is the same but which was re-checked is not a difference.
 */
export function diffVersions(saved: Versions, current: Versions): VersionDiff[] {
  const out: VersionDiff[] = [];
  const keys = <T>(a: readonly T[], b: readonly T[], key: (t: T) => string) => [...new Set([...a.map(key), ...b.map(key)])];

  const rk = (r: RuleFigureVersion) => `${r.ruleId}/${r.figure}`;
  const [r0, r1] = [byKey(saved.rules, rk), byKey(current.rules, rk)];
  for (const k of keys(saved.rules, current.rules, rk)) {
    const [o, n] = [r0.get(k), r1.get(k)];
    if (!same(o?.value ?? null, n?.value ?? null)) out.push({ kind: "rule", key: k, old: o?.value ?? null, new: n?.value ?? null, oldChecked: o?.checked ?? null, newChecked: n?.checked ?? null });
  }
  const [p0, p1] = [byKey(saved.parameters, (p) => p.methodId), byKey(current.parameters, (p) => p.methodId)];
  for (const k of keys(saved.parameters, current.parameters, (p) => p.methodId)) {
    const [o, n] = [p0.get(k), p1.get(k)];
    if (!same(o?.value ?? null, n?.value ?? null)) out.push({ kind: "parameter", key: k, old: o?.value ?? null, new: n?.value ?? null });
  }
  const [d0, d1] = [byKey(saved.data, (d) => d.path), byKey(current.data, (d) => d.path)];
  for (const k of keys(saved.data, current.data, (d) => d.path)) {
    const [o, n] = [d0.get(k), d1.get(k)];
    if ((o?.checked ?? null) !== (n?.checked ?? null) || !o !== !n) out.push({ kind: "data", key: k, old: o?.checked ?? null, new: n?.checked ?? null, oldChecked: o?.checked ?? null, newChecked: n?.checked ?? null });
  }
  const [a0, a1] = [byKey(saved.assumptions, (a) => a.id), byKey(current.assumptions, (a) => a.id)];
  for (const k of keys(saved.assumptions, current.assumptions, (a) => a.id)) {
    const [o, n] = [a0.get(k), a1.get(k)];
    if (!same(o ? { value: o.value, state: o.state } : null, n ? { value: n.value, state: n.state } : null)) {
      out.push({ kind: "assumption", key: k, old: o ? { value: o.value, state: o.state } : null, new: n ? { value: n.value, state: n.state } : null });
    }
  }
  return out;
}

// ---------------------------------------------------------------- revisit

/**
 * F-82 Revisit. Re-runs the saved goal with the current bundle and the current rules (`ctx`), through F-83 and
 * F-80, lists the entries whose values differ (`diffVersions`), and reports whether the top option and the tie
 * set are unchanged. A saved comparison without a ranked option has `top` undefined on both sides.
 */
export function revisit(saved: SavedComparison, current: CurrentBundle, ctx: RunContext): Revisit {
  const input: CandidateSetInput = {
    wrappers: current.wrappers,
    tier2: current.tier2,
    parameters: current.parameters,
    goal: saved.inputs.goal,
    ...(saved.inputs.restricted !== undefined ? { restricted: saved.inputs.restricted } : {}),
  };
  const set = buildCandidateSet(input, ctx);
  const ranking = rankCandidates(set.candidates, { theta: tieThreshold(current.parameters), ctx });
  const after = resultOf(ranking);
  const before = saved.result;

  const now: Versions = {
    rules: saved.rules.map((r) => ruleFigureVersion(ctx, r.ruleId, r.figure)),
    parameters: parameterVersions(current.parameters),
    data: current.dataFiles.map((d) => ({ ...d })),
    assumptions: assumptionVersions(saved.inputs.goal, current.wrappers, current.extraAssumptions),
  };
  const topUnchanged = before.top === after.top;
  const tieSetUnchanged = same([...before.tieSet].sort(), [...after.tieSet].sort());

  const b = byKey(before.entries, (e) => e.id);
  const a = byKey(after.entries, (e) => e.id);
  const valueChanges: Revisit["valueChanges"] = [];
  for (const id of new Set([...b.keys(), ...a.keys()])) {
    const [o, n] = [b.get(id), a.get(id)];
    if (!o || !n || Math.abs(o.real - n.real) > 1e-9 || Math.abs(o.nominal - n.nominal) > 1e-9) {
      valueChanges.push({ id, before: o ? { real: o.real, nominal: o.nominal } : null, after: n ? { real: n.real, nominal: n.nominal } : null });
    }
  }
  return { diff: diffVersions(saved, now), before, after, topUnchanged, tieSetUnchanged, unchanged: topUnchanged && tieSetUnchanged, valueChanges, set, ranking };
}
