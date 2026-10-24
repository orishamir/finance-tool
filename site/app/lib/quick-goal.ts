// The home page's question card (docs/design-spec.md section 1a): three plain questions turned into a saved goal.
// The purpose chips are words for the P-07 presets (D13, D21); this file only maps words to presets and checks the two
// required answers. Pure: no React, no storage. The card applies the plan (components/compare/quick-goal.tsx).
import type { Goal, GoalPatch, NumField, PresetId } from "./goal";

export type PurposeId = "apartment" | "wedding" | "studies" | "child" | "retirement" | "cushion" | "none";
export const purposeIds: PurposeId[] = ["apartment", "wedding", "studies", "child", "retirement", "cushion", "none"];

export interface QuickInput {
  /** Parsed with `parseNumber`; null when the field is empty; NaN when the text is not a number. */
  amountNow: number | null;
  monthly: number | null;
  /** Ignored when `unknownYears`. */
  years: number | null;
  unknownYears: boolean;
  /** Null behaves as "none". */
  purpose: PurposeId | null;
}

export type QuickPreset = Exclude<PresetId, "none">;

/** The message texts the card passes in (kept in copy.ts, so this file has no strings of its own). */
export interface QuickMessages {
  needAmount: string;
  nan: string;
  years: string;
  yearsWhole: string;
  yearsRange: string;
  /** The chip words, set as the goal's name ("" for "none"). */
  names: Record<PurposeId, string>;
}

export type QuickPlan =
  | { kind: "compare"; preset: QuickPreset; name: string; patch: GoalPatch; to: "/goal/compare" }
  | { kind: "idle"; to: string }
  | { kind: "invalid"; field: "amount" | "years"; message: string };

/** The purpose to preset table (docs/design-spec.md 1a). "none" depends on whether a monthly deposit was typed. */
export function presetFor(purpose: PurposeId | null, input: Pick<QuickInput, "monthly">): QuickPreset {
  switch (purpose) {
    case "apartment":
    case "wedding":
    case "studies":
      return "known-date";
    case "child":
      return "child";
    case "retirement":
      return "long-term";
    case "cushion":
      return "liquid-reserve";
    default:
      return (input.monthly ?? 0) > 0 ? "long-term" : "lump-sum";
  }
}

const positive = (n: number | null): n is number => n !== null && !Number.isNaN(n) && n > 0;
const field = (n: number | null): NumField => (n !== null && !Number.isNaN(n) ? { value: n, entered: true } : { value: null, entered: false });

/**
 * Rules in order: a cushion with a sum goes to the idle-cash screen; no positive sum is invalid; typed years that are not
 * a whole number inside the horizon range are invalid; otherwise a goal patch. The patch never touches a profile or an
 * assumption (a returning person's age and return survive), nor `available` and `anytime` (they follow the preset).
 */
export function quickGoalPlan(input: QuickInput, bounds: { horizon: { min: number; max: number } }, msgs: QuickMessages): QuickPlan {
  const purpose = input.purpose ?? "none";
  if (purpose === "cushion" && positive(input.amountNow)) return { kind: "idle", to: `/idle-cash?balance=${Math.round(input.amountNow)}` };
  if (Number.isNaN(input.amountNow) || Number.isNaN(input.monthly)) return { kind: "invalid", field: "amount", message: msgs.nan };
  if (!positive(input.amountNow) && !positive(input.monthly)) return { kind: "invalid", field: "amount", message: msgs.needAmount };
  if (!input.unknownYears && input.years !== null) {
    const y = input.years;
    if (Number.isNaN(y)) return { kind: "invalid", field: "years", message: msgs.nan };
    if (y < 1) return { kind: "invalid", field: "years", message: msgs.years };
    if (!Number.isInteger(y)) return { kind: "invalid", field: "years", message: msgs.yearsWhole };
    if (y > bounds.horizon.max) return { kind: "invalid", field: "years", message: msgs.yearsRange };
  }
  const preset = presetFor(purpose, input);
  const name = msgs.names[purpose] && purpose !== "none" ? msgs.names[purpose] : "";
  const horizon: NumField = input.unknownYears || input.years === null ? { value: null, entered: false } : { value: input.years, entered: true };
  const patch: GoalPatch = (g: Goal) => ({
    ...g,
    preset,
    name,
    amountNow: field(input.amountNow),
    monthly: field(input.monthly),
    horizonYears: horizon,
  });
  return { kind: "compare", preset, name, patch, to: "/goal/compare" };
}

/** The honest line under the product-mode headline (spec 5.5): shown while the horizon is below P-04's equity minimum. */
export const showsHorizonHonestLine = (years: number, equityMinYears: number | null): boolean => equityMinYears !== null && years < equityMinYears;
