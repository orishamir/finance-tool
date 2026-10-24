// F-71 Loss filter (exposure mode, D11): the person's own two numbers, compared. No sourced mapping is claimed.
import type { ValueObject } from "@finance-tool/schema";
import { RecordInputError } from "../inputs.ts";
import type { Reason } from "./types.ts";

/** What the person entered (A-29): the worst fall they expect per exposure, and the largest fall they accept. */
export interface LossFilterEntered {
  /** Worst fall expected, per exposure ID, in `pct` (40 means a fall of 40%), state `entered`. */
  worstFall: Readonly<Record<string, ValueObject | undefined>>;
  /** The largest fall accepted for every exposure, in `pct`, state `entered`. */
  acceptedFall?: ValueObject;
  /** A largest fall accepted for one exposure type, which wins over `acceptedFall` (A-29 is per exposure type). */
  acceptedFallById?: Readonly<Record<string, ValueObject | undefined>>;
}

export type LossVerdictKind = "excluded" | "kept" | "not-evaluated";

export interface LossVerdict {
  id: string;
  verdict: LossVerdictKind;
  /** The person's numbers in percent, when they were entered. */
  worstFall?: number;
  accepted?: number;
  /** Why the filter did not run: "enter the worst fall" or "enter the largest fall accepted". */
  missing?: "worst-fall" | "largest-fall-accepted";
  /** For `excluded`: the F-83 reason, `loss-filter` under D11. */
  reason?: Reason;
}

function fall(v: ValueObject, what: string): number {
  if (v.state !== "entered") throw new RecordInputError(`${what} must be entered by the person (state "entered"), not "${v.state}": the loss filter claims no sourced mapping (D11)`);
  if (v.unit !== "pct" || typeof v.value !== "number" || !Number.isFinite(v.value) || v.value < 0) {
    throw new RecordInputError(`${what} must be a number of at least 0 in pct`);
  }
  return v.value;
}

/**
 * F-71 Loss filter. For each exposure, the person's entered worst fall (A-29) against their entered largest
 * fall accepted: "excluded" when the worst fall is larger, "kept" when it is not. A missing entered number
 * means the filter cannot be applied to that exposure: "not-evaluated" (enter the worst fall); the exposure
 * is then not excluded, and the caller shows the note. Both numbers must be state `entered`.
 */
export function lossFilter(exposures: readonly { id: string }[], entered: LossFilterEntered): LossVerdict[] {
  return exposures.map(({ id }) => {
    const w = entered.worstFall[id];
    const a = entered.acceptedFallById?.[id] ?? entered.acceptedFall;
    if (!w) return { id, verdict: "not-evaluated", missing: "worst-fall" };
    const worst = fall(w, `worst fall of ${id}`);
    if (!a) return { id, verdict: "not-evaluated", worstFall: worst, missing: "largest-fall-accepted" };
    const accepted = fall(a, `largest fall accepted for ${id}`);
    if (worst > accepted) {
      return {
        id,
        verdict: "excluded",
        worstFall: worst,
        accepted,
        reason: { code: "loss-filter", ruleIds: [], gapIds: [], decision: "D11", detail: `worst fall ${worst} > largest fall accepted ${accepted}` },
      };
    }
    return { id, verdict: "kept", worstFall: worst, accepted };
  });
}
