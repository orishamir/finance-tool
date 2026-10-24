// What the result's components read from the page: the bundle, the view of the result, the goal's numbers, the
// value factory (every figure as a value object) and the two ways to reach a field.
import type { CompareBundle, CompareView, RunGoal, makeValues } from "../../lib/compare";
import type { FieldKey } from "../../lib/goal";

export type Mode = "real" | "nominal";

export interface ResultCtx {
  bundle: CompareBundle;
  view: CompareView;
  g: RunGoal;
  mk: ReturnType<typeof makeValues>;
  mode: Mode;
  /** Opens the assumptions (a sheet on a phone, the panel on PC) at a field, with a suggestion to adopt when there is one. */
  openField: (field: FieldKey, suggested?: number) => void;
  /** The largest fall the person accepts, % of value (A-29), for the shekel echo and the chart's band (A12); null when not entered. */
  fall?: number | null;
  /** The person's own rate for a deposit-family wrapper (A8): sets it (% a year) or clears it. */
  setOwnRate?: (wrapperId: string, pct: number | undefined) => void;
}
