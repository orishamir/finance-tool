// F-62 Fee verdict from the site's thresholds (P-03, data/parameters/fee-verdict-thresholds.json).
import { parameterRecord, type ValueObject } from "@finance-tool/schema";
import { RecordInputError } from "../resolver.ts";

/**
 * P-03 as numbers: NIS thresholds over the horizon, real (negotiate on the worth of bringing the fee to its reference, avoid on the fee's
 * cost, D90 revised), and the share of the total drag as a fraction.
 */
export interface FeeThresholds {
  negotiateNis: number;
  avoidNis: number;
  /** `negotiate_share` in percent, as a fraction (10 → 0.1). */
  negotiateShare: number;
  /** The P-03 value objects, for the page that shows the thresholds as site parameters. */
  values: { negotiate_nis: ValueObject; avoid_nis: ValueObject; negotiate_share: ValueObject };
}

function figure(record: Record<string, unknown>, name: "negotiate_nis" | "avoid_nis" | "negotiate_share", unit: "nis" | "pct"): ValueObject {
  const v = record[name] as ValueObject | undefined;
  if (!v || typeof v !== "object") throw new RecordInputError(`P-03 ${name} is missing`);
  if (v.unit !== unit) throw new RecordInputError(`P-03 ${name}: unit is ${v.unit}, expected ${unit}`);
  if (typeof v.value !== "number" || !Number.isFinite(v.value)) throw new RecordInputError(`P-03 ${name}: value ${JSON.stringify(v.value)} is not a number`);
  return v;
}

/** Reads the P-03 record (checked as a parameter record); a missing or mistyped threshold stops with its name. */
export function feeThresholds(record: unknown): FeeThresholds {
  const r = parameterRecord.safeParse(record);
  if (!r.success) throw new RecordInputError(`P-03 record: ${r.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
  if (r.data.method_id !== "P-03") throw new RecordInputError(`record is ${r.data.method_id}, expected P-03`);
  const loose = r.data as Record<string, unknown>;
  const negotiate = figure(loose, "negotiate_nis", "nis");
  const avoid = figure(loose, "avoid_nis", "nis");
  const share = figure(loose, "negotiate_share", "pct");
  return {
    negotiateNis: negotiate.value as number,
    avoidNis: avoid.value as number,
    negotiateShare: (share.value as number) / 100,
    values: { negotiate_nis: negotiate, avoid_nis: avoid, negotiate_share: share },
  };
}

export type FeeVerdictCode = "worth-negotiating" | "worth-avoiding" | "not-worth-the-effort";

/** The fee being judged. `nis` is the F-61 cost over the horizon, real. */
export interface FeeCost {
  nis: number;
  /**
   * F-61's value of a stated reduction to the reference rate (`valueOfReduction` at `reference.rate`), real NIS over the same horizon: what
   * asking for the reference is worth. The negotiate test reads it, not the cost (D90 revised: "worth
   * negotiating" beside a cost of 3,911 NIS reads as advice to call, while the cut is worth 187 NIS). Absent, or zero, when there is nothing to
   * bring down now (the reference is not below the rate charged now, or the line is at 0% during a discount).
   */
  worthNis?: number;
  /**
   * The fee's current rate; with `reference.rate`, in the same unit. For a discounted provident line whose discount ends within the horizon,
   * the rate after the discount (`rateAfterDiscount`, D88): the caller passes the rate the fee is judged by.
   */
  currentRate?: number;
  /** F-61's total drag over the same plan, for the share test. */
  totalDrag?: number;
  /**
   * Whether an option in the same comparison that charges no such fee, or a lower rate of it, ranks above the subject (the caller knows the
   * comparison and the places; D90 revised the same day, "avoid" only when there is something better to pick).
   */
  removedByAlternative?: boolean;
}

/** A regulator reference rate for the fee (F-68 mean or median, or another sourced reference); null means none exists. */
export interface FeeReference {
  rate: number;
}

export interface FeeVerdict {
  formula: "F-62";
  verdict: FeeVerdictCode;
  /** The negotiate test: the worth of bringing the fee to the reference at the threshold or more, and a reference below the current rate. */
  negotiate: boolean;
  /** The avoid test: cost at the threshold or more and an option above the subject charges no such fee, or less of it. */
  avoid: boolean;
  /** Set when both tests pass: the verdict follows the method's order (negotiate first), and this says the avoid test passed too. */
  alsoAvoid: boolean;
  /** Share of the total drag; the test against `negotiate_share` is reported beside the verdict and does not change it. */
  share?: { fraction: number; atLeastThreshold: boolean };
  /** Why a test did not pass, as codes. */
  reasons: ("worth-below-negotiate-threshold" | "no-reference" | "reference-not-below-current" | "cost-below-avoid-threshold" | "no-alternative-removes-it")[];
}

/**
 * F-62 Fee verdict. "Worth negotiating" when the worth of bringing the fee to the reference (`worthNis`, F-61's value of
 * that reduction) is at least `negotiate_nis` and a reference exists below the current rate; "worth avoiding" when the
 * cost is at least `avoid_nis` and an option that charges no such fee, or a lower rate of it, ranks above the subject in
 * the same comparison (picking it is worth the fee's cost); else "not worth the effort". The method's order decides when both hold. The share of the total drag
 * (`negotiate_share`) is reported as a second test beside the verdict.
 */
export function feeVerdict(cost: FeeCost, reference: FeeReference | null, thresholds: unknown): FeeVerdict {
  const t = isParsed(thresholds) ? thresholds : feeThresholds(thresholds);
  const reasons: FeeVerdict["reasons"] = [];
  // D90 revised: what a call is worth is what the reduction it asks for is worth, not what the fee costs
  // nothing to bring down is never worth negotiating, whatever the threshold
  const worthHigh = (cost.worthNis ?? 0) > 0 && (cost.worthNis ?? 0) >= t.negotiateNis;
  if (!worthHigh) reasons.push("worth-below-negotiate-threshold");
  let refBelow = false;
  if (!reference) reasons.push("no-reference");
  else if (cost.currentRate === undefined || !(reference.rate < cost.currentRate)) reasons.push("reference-not-below-current");
  else refBelow = true;
  const negotiate = worthHigh && refBelow;

  const avoidHigh = cost.nis >= t.avoidNis;
  if (!avoidHigh) reasons.push("cost-below-avoid-threshold");
  const alt = cost.removedByAlternative === true;
  if (!alt) reasons.push("no-alternative-removes-it");
  const avoid = avoidHigh && alt;

  const out: FeeVerdict = {
    formula: "F-62",
    verdict: negotiate ? "worth-negotiating" : avoid ? "worth-avoiding" : "not-worth-the-effort",
    negotiate,
    avoid,
    alsoAvoid: negotiate && avoid,
    reasons,
  };
  if (cost.totalDrag !== undefined && cost.totalDrag > 0) {
    const fraction = cost.nis / cost.totalDrag;
    out.share = { fraction, atLeastThreshold: fraction >= t.negotiateShare };
  }
  return out;
}

function isParsed(x: unknown): x is FeeThresholds {
  return typeof x === "object" && x !== null && typeof (x as FeeThresholds).negotiateNis === "number" && "values" in x;
}
