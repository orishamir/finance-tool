// F-68 Regulator reference: the provider-class reference F-61 uses for the fees of provident, study-fund,
// pension and child-savings tracks, computed from the Capital Market Authority's per-track averages.
import type { ValueObject, WrapperId } from "@finance-tool/schema";
import type { CmaTrack } from "../holdings/cma.ts";
import { computedValue, weakestStrength } from "./computed.ts";

/** A provider class: the regulator's `FUND_CLASSIFICATION` with its `SPECIALIZATION` (F-68). */
export interface ClassificationKey {
  fund_classification: string;
  specialization: string;
}

/** The label the page shows beside a class reference (F-68). */
export const regulatorReferenceLabel =
  "computed from the regulator's per-track data; the regulator publishes no class average and the weighting of its averages is open (CAT OQ2)";

export interface ReferenceStat {
  /** Tracks of the class with a reported value for this fee (nulls excluded). */
  count: number;
  mean: ValueObject;
  median: ValueObject;
}

export interface RegulatorReference {
  formula: "F-68";
  class: ClassificationKey;
  /** The report period of the tracks used (the latest, per dataset, as the caller passed them); `null` when there are none. */
  period: string | null;
  /** Tracks of the class, with or without a reported fee. */
  tracksInClass: number;
  /** `AVG_ANNUAL_MANAGEMENT_FEE`, a percent a year of assets. */
  management: ReferenceStat;
  /** `AVG_DEPOSIT_FEE`, a percent of each deposit. */
  deposit: ReferenceStat;
  label: typeof regulatorReferenceLabel;
}

/** A provider class with no collected reference (funds and banks: product D20, ISA averages unconfirmed). */
export interface NoReference {
  reference: null;
  reason: "none-available";
  decision: "D20";
  notes: string;
}

/** What the mean is (method F-68): says it on every value, so a page cannot read it as an asset-weighted average. */
const meanNote = "a simple mean of the per-track averages, one track one vote, not asset-weighted (CAT OQ2)";

const sameClass = (a: ClassificationKey, b: ClassificationKey) =>
  a.fund_classification.trim() === b.fund_classification.trim() && a.specialization.trim() === b.specialization.trim();

function median(sorted: readonly number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function stat(values: readonly number[], fee: "avg_annual_management_fee" | "avg_deposit_fee", unit: ValueObject["unit"], context: { key: ClassificationKey; period: string | null; checked: string; strength: ValueObject["source"]["strength"]; ruleIds: string[] }): ReferenceStat {
  const inputs = { fee, fund_classification: context.key.fund_classification, specialization: context.key.specialization, period: context.period, count: values.length };
  const opts = { checked: context.checked, strength: context.strength, ruleIds: context.ruleIds };
  if (values.length === 0) {
    const notes = `no track of this class reports ${fee}; ${regulatorReferenceLabel}; ${meanNote}`;
    return { count: 0, mean: computedValue(null, unit, "F-68", { ...inputs, statistic: "mean" }, { ...opts, notes }), median: computedValue(null, unit, "F-68", { ...inputs, statistic: "median" }, { ...opts, notes }) };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const notes = `${regulatorReferenceLabel}; ${values.length} tracks; ${meanNote}`;
  return {
    count: values.length,
    mean: computedValue(mean, unit, "F-68", { ...inputs, statistic: "mean" }, { ...opts, notes }),
    median: computedValue(median(sorted), unit, "F-68", { ...inputs, statistic: "median" }, { ...opts, notes }),
  };
}

/**
 * F-68 Regulator reference. From the latest CMA period's track records, the mean and the median of
 * `avg_annual_management_fee` and of `avg_deposit_fee` across the tracks with the same classification and
 * specialization (the class), leaving out tracks that do not report the fee, with the count. Each is a computed
 * value object (inputs: the class, the period, the count) labelled as computed from the regulator's per-track
 * data: the regulator publishes no class average and the weighting of its averages is open (CAT OQ2). `tracks`
 * should be the latest period only (`latestTracks`); a mixture of periods is reported as the newest one, not averaged away.
 * `checked` of the value objects is the newest `checked` of the tracks used (of all tracks passed when the class is empty), else `options.checked`.
 */
export function regulatorReference(tracks: readonly CmaTrack[], classificationKey: ClassificationKey, options: { checked?: string } = {}): RegulatorReference {
  const inClass = tracks.filter((t) => sameClass(t, classificationKey));
  const periods = [...new Set(inClass.map((t) => t.report_period))].sort();
  const period = periods.length === 0 ? null : periods[periods.length - 1]!;
  const used = inClass.filter((t) => t.report_period === period);
  const numbers = (pick: (t: CmaTrack) => ValueObject) => used.map(pick).map((v) => v.value).filter((v): v is number => typeof v === "number");
  const strengths = used.flatMap((t) => [t.fees.avg_annual_management_fee.source.strength, t.fees.avg_deposit_fee.source.strength]);
  const strength = weakestStrength(strengths);
  const ruleIds = [...new Set(used.flatMap((t) => [...(t.fees.avg_annual_management_fee.rule_ids ?? []), ...(t.fees.avg_deposit_fee.rule_ids ?? [])]))];
  const checked = (used.length > 0 ? used : tracks).map((t) => t.checked).sort().at(-1) ?? options.checked;
  if (checked === undefined) throw new RangeError("regulatorReference: no tracks and no options.checked date");
  const context = { key: { fund_classification: classificationKey.fund_classification, specialization: classificationKey.specialization }, period, checked, strength, ruleIds };
  return {
    formula: "F-68",
    class: context.key,
    period,
    tracksInClass: used.length,
    management: stat(numbers((t) => t.fees.avg_annual_management_fee), "avg_annual_management_fee", "pct_per_year", context),
    deposit: stat(numbers((t) => t.fees.avg_deposit_fee), "avg_deposit_fee", "pct_of_deposit", context),
    label: regulatorReferenceLabel,
  };
}

/**
 * The reference for a wrapper's fees. A wrapper whose tracks the CMA reports (`cmaWrappers`, the targets of the
 * caller's classification-to-wrapper map) gets the F-68 class reference; funds, banks and brokers get "none
 * available" with the reason (product D20; ISA averages unconfirmed), as null, never a guess.
 */
export function referenceForWrapper(
  wrapper: WrapperId,
  cmaWrappers: ReadonlySet<WrapperId>,
  tracks: readonly CmaTrack[],
  classificationKey: ClassificationKey,
): RegulatorReference | NoReference {
  if (cmaWrappers.has(wrapper)) return regulatorReference(tracks, classificationKey);
  return { reference: null, reason: "none-available", decision: "D20", notes: "no collected regulator reference for this class of provider (product D20: ISA averages unconfirmed)" };
}
