// What the exposure result's components read from the page.
import type { CompareBundle, RunGoal, makeValues } from "../../lib/compare";
import type { ExposureInputs } from "../../lib/goal";
import type { ExposureResultView } from "../../lib/exposure-mode";

export type Mode = "real" | "nominal";

export interface ExpCtx {
  bundle: CompareBundle;
  view: ExposureResultView;
  g: RunGoal;
  mk: ReturnType<typeof makeValues>;
  mode: Mode;
  names: Record<string, string>;
  setInput: (id: string, patch: Partial<ExposureInputs>) => void;
  /** The exposure the person chose (saved), if any. */
  chosen?: { id: string; on: string };
}
