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
}
