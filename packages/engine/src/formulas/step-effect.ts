/**
 * F-89 A plan number changed by a share: `k × (1 + share)`, whole and at least 1 when `whole` (years), never below 0.
 */
export function changedByShare(value: number, share: number, whole = false): number {
  const v = Math.max(0, value * (1 + share));
  return whole ? Math.max(1, Math.round(v)) : v;
}

/**
 * F-89 its effect: `L(plan with key = to) − L(plan)`, where `to` is in the slider's unit and `scale` reads the plan in it (100 for a
 * return held as a fraction and shown in percent). Null when either run gives no value.
 */
export function changeEffect<K extends string, P extends Record<K, number>>(left: (plan: P) => number | null, plan: P, key: K, to: number, scale = 1): number | null {
  const before = left(plan);
  if (before === null) return null;
  const after = left({ ...plan, [key]: to / scale });
  return after === null ? null : after - before;
}

/**
 * F-90 The result at each of several values of one plan number: `L(plan with key = x)` for each `x` in `xs` (in the slider's unit;
 * `scale` as in F-89). Null where a run gives no value.
 */
export function sweep<K extends string, P extends Record<K, number>>(left: (plan: P) => number | null, plan: P, key: K, xs: readonly number[], scale = 1): (number | null)[] {
  return xs.map((x) => left({ ...plan, [key]: x / scale }));
}
