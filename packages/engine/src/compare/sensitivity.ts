// F-81 Sensitivity panel. For each assumption with bounds in P-02, move the assumption from its current value
// towards each bound by bisection, re-running the ranking, until the top option changes or the bound is reached.
// Deterministic: a fixed number of halvings at most, no randomness, no clock.
import { parameterRecord, valueObject, type ValueObject } from "@finance-tool/schema";
import { RecordInputError } from "../inputs.ts";

export interface SensitivityAxis {
  /** "A-01", "A-02", "A-03", "A-06", "horizon", or "fee:<name>" for one fee at a time. */
  key: string;
  label: string;
  /** `fraction` for a rate (0.06), `multiplier` for a fee rate scaled by it (1 = as now), `years` for the horizon. */
  unit: "fraction" | "multiplier" | "years";
  current: number;
  lo: number;
  hi: number;
  /** Values the re-run accepts are multiples of this (the horizon moves in whole months: 1/12). */
  step?: number;
}

export interface SensitivitySide {
  bound: number;
  /** Whether the top option differs at the bound (the bisection ran only when it does). */
  flips: boolean;
  /** The value at which the top option first differs, found by bisection; the flip is "from current to this". */
  flipsAt?: number;
  /** The top option beyond the flip. */
  topAfter?: string;
}

export interface SensitivityRow {
  key: string;
  label: string;
  unit: SensitivityAxis["unit"];
  current: number;
  lo: SensitivitySide;
  hi: SensitivitySide;
}

export interface Sensitivity {
  baseTop: string | undefined;
  rows: SensitivityRow[];
  /** Every flip, as "flips if `key` moves from `from` to `to`". Empty: "no flip within bounds". */
  flips: { key: string; label: string; side: "lo" | "hi"; from: number; to: number; topAfter: string | undefined }[];
  noFlip: boolean;
  /** Number of re-runs, the cost of the panel. */
  evaluations: number;
}

export interface SensitivityOptions {
  /** Most halvings per side (default 40). */
  maxIterations?: number;
}

/**
 * F-81 Sensitivity panel. `topOf(key, value)` re-runs the ranking (F-80) with the assumption `key` set to
 * `value` and returns the id of the top option. For each axis and each bound: if the top is unchanged at the
 * bound there is no flip; otherwise bisection between the current value (same top) and the bound (different top)
 * narrows to the value where the top first changes. It assumes the top changes once between the two.
 */
export function sensitivity(
  axes: readonly SensitivityAxis[],
  topOf: (key: string, value: number) => string | undefined,
  options: SensitivityOptions = {},
): Sensitivity {
  const maxIterations = options.maxIterations ?? 40;
  let evaluations = 0;
  const top = (key: string, value: number) => {
    evaluations += 1;
    return topOf(key, value);
  };
  // Every axis starts at the current values, so one re-run gives the top the bisection compares with.
  const baseTop = axes[0] ? top(axes[0].key, axes[0].current) : undefined;

  const side = (axis: SensitivityAxis, bound: number): SensitivitySide => {
    const atBound = top(axis.key, bound);
    if (atBound === baseTop) return { bound, flips: false };
    let same = axis.current;
    let other = bound;
    const step = axis.step;
    for (let i = 0; i < maxIterations; i++) {
      if (step !== undefined && Math.abs(other - same) <= step * (1 + 1e-9)) break;
      let mid = (same + other) / 2;
      if (step !== undefined) mid = snap(mid, step);
      if (mid === same || mid === other) break;
      if (top(axis.key, mid) === baseTop) same = mid;
      else other = mid;
    }
    return { bound, flips: true, flipsAt: other, topAfter: atBound };
  };

  const rows: SensitivityRow[] = axes.map((a) => ({
    key: a.key,
    label: a.label,
    unit: a.unit,
    current: a.current,
    lo: side(a, a.lo),
    hi: side(a, a.hi),
  }));
  const flips: Sensitivity["flips"] = [];
  for (const r of rows) {
    for (const s of ["lo", "hi"] as const) {
      const x = r[s];
      if (x.flips) flips.push({ key: r.key, label: r.label, side: s, from: r.current, to: x.flipsAt!, topAfter: x.topAfter });
    }
  }
  return { baseTop, rows, flips, noFlip: flips.length === 0, evaluations };
}

/** Rounds to a multiple of `step`; for a step like 1/12 it divides by the whole number, so 12 × the result stays whole. */
function snap(value: number, step: number): number {
  const per = Math.round(1 / step);
  return Math.abs(1 / step - per) < 1e-9 ? Math.round(value * per) / per : Math.round(value / step) * step;
}

/** The assumptions a comparison actually uses, as P-02 axes: their current values and the fees to scale. */
export interface SensitivitySpec {
  /** Current values as fractions (0.06 is 6 percent a year); an assumption not listed is not an axis. */
  current: Partial<Record<"A-01" | "A-02" | "A-03" | "A-06", number>>;
  horizonYears?: number;
  /** One axis per fee, each scaled from half to double (P-02 `fee_rates`), one at a time. */
  fees?: readonly { key: string; label: string }[];
}

const rateLabels = { "A-01": "A-01", "A-02": "A-02", "A-03": "A-03", "A-06": "A-06" } as const;

/** Reads P-02 (`data/parameters/sensitivity-bounds.json`) into the axes of F-81. */
export function sensitivityAxes(parameters: readonly unknown[], spec: SensitivitySpec): SensitivityAxis[] {
  const found = parameters.filter((p) => (p as { method_id?: unknown })?.method_id === "P-02");
  if (found.length !== 1) throw new RecordInputError(`data/parameters/ holds ${found.length} records for P-02; the panel needs exactly one`);
  const record = parameterRecord.parse(found[0]) as { bounds?: Record<string, { lo?: unknown; hi?: unknown }> };
  const bounds = record.bounds;
  if (!bounds || typeof bounds !== "object") throw new RecordInputError("P-02 bounds is missing");

  const read = (key: string, unit: ValueObject["unit"]) => {
    const b = bounds[key];
    if (!b) throw new RecordInputError(`P-02 has no bounds for ${key}`);
    const one = (side: "lo" | "hi") => {
      const v = valueObject.parse(b[side]);
      if (v.unit !== unit || typeof v.value !== "number") throw new RecordInputError(`P-02 ${key}.${side}: expected a number in ${unit}`);
      return v.value;
    };
    return { lo: one("lo"), hi: one("hi") };
  };

  const axes: SensitivityAxis[] = [];
  for (const key of Object.keys(rateLabels) as (keyof typeof rateLabels)[]) {
    const current = spec.current[key];
    if (current === undefined) continue;
    const b = read(key, "pct_per_year");
    axes.push({ key, label: rateLabels[key], unit: "fraction", current, lo: b.lo / 100, hi: b.hi / 100 });
  }
  if (spec.horizonYears !== undefined) {
    const b = read("horizon", "years");
    axes.push({ key: "horizon", label: "horizon", unit: "years", current: spec.horizonYears, lo: spec.horizonYears + b.lo, hi: spec.horizonYears + b.hi, step: 1 / 12 });
  }
  if (spec.fees && spec.fees.length > 0) {
    const b = read("fee_rates", "count");
    for (const f of spec.fees) axes.push({ key: `fee:${f.key}`, label: f.label, unit: "multiplier", current: 1, lo: b.lo, hi: b.hi });
  }
  return axes;
}
