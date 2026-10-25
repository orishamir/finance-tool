// The goal's fields as value objects (design-spec 6.2): entered by the person, or the site parameter a preset
// filled in, so the strip, the chips and the sheets can show each number through the provenance component.
import type { ValueObject } from "@finance-tool/schema";
import { entered as enteredValue, type SiteValue } from "./value";
import type { Goal, PresetRecord, Presets, ResolvedGoal } from "./goal";

export interface PresetMeta {
  rationale: string;
  rationaleHe?: string | null;
  signedOffOn: string | null;
}

/** A P-07 value object with the site-parameter marker the provenance sheet reads. */
export const asPresetParam = (v: ValueObject, meta: PresetMeta): SiteValue => ({ ...v, parameter: { rationale: meta.rationale, rationaleHe: meta.rationaleHe ?? null, signedOffOn: meta.signedOffOn, provisional: false } });

export interface FieldValues {
  years: SiteValue | null;
  amount: SiteValue | null;
}

/** The years and the amount of a goal, as the strip shows them. */
export function stripValues(goal: Goal, r: ResolvedGoal, presets: Presets, meta: PresetMeta, today: string): FieldValues {
  const record: PresetRecord | undefined = goal.preset === "none" ? undefined : presets[goal.preset];
  const years =
    r.horizonYears === null ? null : r.source.horizonYears === "entered" || !record?.horizon_years ? enteredValue(r.horizonYears, "years", today) : asPresetParam(record.horizon_years, meta);
  const amount = r.amountNow === null ? null : enteredValue(r.amountNow, "nis", today);
  return { years, amount };
}
