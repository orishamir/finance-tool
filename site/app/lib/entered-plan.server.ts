// What the indices page's plan controls read besides the indices bundle: each slider's range and the change chart's shares, as P-05 writes
// them, and the bounds of every plan number the person enters. Server-only.
import type { ParameterRecord } from "@finance-tool/schema";
import { loadParameters, today } from "./data.server";
import { p05Bounds, p05Range } from "./engine";
import type { PlanBounds } from "./plan-bounds";

type KnobRange = Omit<NonNullable<ReturnType<typeof p05Range>>, "values">;
type KnobKey = "amount_now" | "monthly_deposit" | "horizon_years" | "A-01" | "A-02";

/** One slider of the indices page's knob strip, as P-05 writes it (`p05Range`): its ends and its step or segments, without the value objects. */
function knobRange(p05: ParameterRecord, key: string): KnobRange {
  const r = p05Range(p05, "sliders", key);
  if (!r) throw new Error(`P-05 has no slider ${key}`);
  const { values: _values, ...range } = r;
  return range;
}

/** The indices page's plan controls: the knob strip's ranges, the spider chart's shares (F-90), and the bounds of every entered plan
 *  number (`p05Bounds`). */
export function planFormData(): { today: string; form: { knobs: Record<KnobKey, KnobRange>; share: { min: number; max: number; step: number; start: number }; bounds: PlanBounds } } {
  const p05 = loadParameters().find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  const share = p05Range(p05, "sliders", "change_share");
  const start = share?.values.start?.value;
  if (share?.step === undefined || typeof start !== "number") throw new Error("P-05's change_share slider has no step or start");
  return {
    today: today(),
    form: {
      // each slider's range, in its step or, for money, its segments (`rangeScale`)
      knobs: Object.fromEntries((["amount_now", "monthly_deposit", "horizon_years", "A-01", "A-02"] as const).map((k) => [k, knobRange(p05, k)])) as Record<KnobKey, KnobRange>,
      // the spider chart's shares (F-90), in percent
      share: { min: share.min, max: share.max, step: share.step, start },
      bounds: p05Bounds(p05),
    },
  };
}
