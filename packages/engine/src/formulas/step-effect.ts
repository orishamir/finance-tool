/**
 * F-89 What one more step of a plan number does: `Δ_k = L(plan with k + s_k) − L(plan)`, where `L` is the value left for one priced
 * pair and `s_k` the knob's step, cut at the slider's top (so `Δ_k` can be 0). `scale` reads `k` in the slider's unit (100 for a return
 * held as a fraction and shown in percent). Null when either run gives no value.
 */
export function stepEffect<K extends string, P extends Record<K, number>>(left: (plan: P) => number | null, plan: P, key: K, step: number, top: number, scale = 1): number | null {
  const before = left(plan);
  if (before === null) return null;
  const next = Math.min(top, plan[key] * scale + step) / scale;
  const after = left({ ...plan, [key]: next });
  return after === null ? null : after - before;
}

/**
 * F-90 The result across a knob's range: `L(plan with k = x)` for each `x` in `xs` (the slider's values, in its unit; `scale` as in
 * F-89). Null where a run gives no value.
 */
export function sweep<K extends string, P extends Record<K, number>>(left: (plan: P) => number | null, plan: P, key: K, xs: readonly number[], scale = 1): (number | null)[] {
  return xs.map((x) => left({ ...plan, [key]: x / scale }));
}
