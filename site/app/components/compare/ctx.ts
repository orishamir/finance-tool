// What the result's components read from the page: the bundle, the view of the result, the goal's numbers, the
// value factory (every figure as a value object) and the two ways to reach a field.
import type { CompareBundle, CompareView, RunGoal, makeValues } from "../../lib/compare";
import type { ValueObject } from "@finance-tool/schema";
import type { FieldKey } from "../../lib/goal";
import type { IndexCardProps } from "./index-card";

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
  /** The fee level the person enters for a wrapper's representative instrument (D4, 2026-10-24): sets it (% a year) or clears it. */
  /** A known-date goal's purchase cost, entered (scenario fix 2026-10-24); the result compares the leader's value with it. */
  targetCost?: ValueObject | null;
  /** The currency (other than the shekel) of the exposure this view is about, when it was opened from an exposure row. */
  subjectCurrency?: string | null;
  setOwnFee?: (wrapperId: string, pct: number | undefined) => void;
  /** The provider whose tariff a wrapper's run uses (2026-10-24, brokerage): sets its id or clears it. */
  setOwnProvider?: (wrapperId: string, id: string | undefined) => void;
  /** The securities account over the indices (2026-10-25, D27): what its card shows beside the wrapper it belongs to. Absent when the invest data did not load. */
  index?: { wrapperId: string; card: IndexCardProps };
}
