// The home page's question card (docs/design-spec.md section 1a): three plain questions turned into a saved goal.
// The purpose chips are words for the P-07 presets (D13, D21); this file maps words to presets, says which fields each
// purpose asks, and checks the answers. Pure: no React, no storage. The card applies the plan (components/compare/quick-goal.tsx).
import { childAgeFrom, type Goal, type GoalPatch, type NumField, type PresetId } from "./goal";
import { entered } from "./value";

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
  /** The child's age or birth year, typed with "ילד"; null when empty. Ignored for the other purposes. */
  childAge?: number | null;
  /** What the purchase costs, typed with "דירה", "חתונה" or "לימודים"; null when empty. Ignored for the other purposes. */
  targetCost?: number | null;
}

/** The fields the card asks after the purpose (2026-10-25, the founder: the chips changed nothing on the card). */
export interface QuickFields {
  monthly: boolean;
  years: boolean;
  /** "ילד": the child's age takes the years' place; the preset counts to 18 from it. */
  childAge: boolean;
  /** A purchase on a known date: what it costs, so the result can say whether the sum is enough. */
  targetCost: boolean;
}

/** The cushion asks the sum only; a child asks the child's age instead of the years; a purchase adds its cost. */
export function quickFields(purpose: PurposeId | null): QuickFields {
  const preset = purpose === null ? "lump-sum" : presetFor(purpose, { monthly: null });
  return {
    monthly: purpose !== "cushion",
    years: purpose !== "cushion" && purpose !== "child",
    childAge: purpose === "child",
    targetCost: preset === "known-date",
  };
}

export type QuickPreset = Exclude<PresetId, "none">;

/** The message texts the card passes in (kept in copy.ts, so this file has no strings of its own). */
export interface QuickMessages {
  needAmount: string;
  nan: string;
  years: string;
  yearsWhole: string;
  yearsRange: string;
  childAge: string;
  negative: string;
  /** The chip words, set as the goal's name ("" for "none"). */
  names: Record<PurposeId, string>;
}

export type QuickField = "amount" | "years" | "childAge" | "cost";

export type QuickPlan =
  | { kind: "compare"; preset: QuickPreset; name: string; patch: GoalPatch; to: "/goal/compare" }
  | { kind: "idle"; to: string }
  | { kind: "invalid"; field: QuickField; message: string };

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
 * a whole number inside the horizon range are invalid, and so are a child's age outside 0 to 17 (or its birth year) and a
 * negative cost; otherwise a goal patch. Only the fields the purpose asks count (`quickFields`): a child's goal runs on the
 * preset's years less the age, never on years typed before the chip. The patch never touches a profile or an assumption
 * (a returning person's age and return survive), nor `available` and `anytime` (they follow the preset).
 */
export function quickGoalPlan(input: QuickInput, ctx: { horizon: { min: number; max: number }; today: string }, msgs: QuickMessages): QuickPlan {
  const purpose = input.purpose ?? "none";
  const ask = quickFields(purpose);
  if (purpose === "cushion" && positive(input.amountNow)) return { kind: "idle", to: `/idle-cash?balance=${Math.round(input.amountNow)}` };
  if (Number.isNaN(input.amountNow) || Number.isNaN(input.monthly)) return { kind: "invalid", field: "amount", message: msgs.nan };
  if (!positive(input.amountNow) && !positive(input.monthly)) return { kind: "invalid", field: "amount", message: msgs.needAmount };
  const years = ask.years && !input.unknownYears ? input.years : null;
  if (years !== null) {
    if (Number.isNaN(years)) return { kind: "invalid", field: "years", message: msgs.nan };
    if (years < 1) return { kind: "invalid", field: "years", message: msgs.years };
    if (!Number.isInteger(years)) return { kind: "invalid", field: "years", message: msgs.yearsWhole };
    if (years > ctx.horizon.max) return { kind: "invalid", field: "years", message: msgs.yearsRange };
  }
  const typedAge = ask.childAge ? (input.childAge ?? null) : null;
  const childAge = typedAge === null || Number.isNaN(typedAge) ? null : childAgeFrom(typedAge, Number(ctx.today.slice(0, 4)));
  if (typedAge !== null && Number.isNaN(typedAge)) return { kind: "invalid", field: "childAge", message: msgs.nan };
  if (typedAge !== null && childAge === null) return { kind: "invalid", field: "childAge", message: msgs.childAge };
  const cost = ask.targetCost ? (input.targetCost ?? null) : null;
  if (cost !== null && Number.isNaN(cost)) return { kind: "invalid", field: "cost", message: msgs.nan };
  if (cost !== null && cost < 0) return { kind: "invalid", field: "cost", message: msgs.negative };
  const preset = presetFor(purpose, input);
  const name = msgs.names[purpose] && purpose !== "none" ? msgs.names[purpose] : "";
  const horizon: NumField = years === null ? { value: null, entered: false } : { value: years, entered: true };
  const patch: GoalPatch = (g: Goal) => ({
    ...g,
    preset,
    name,
    amountNow: field(input.amountNow),
    monthly: field(input.monthly),
    horizonYears: horizon,
    ...(ask.childAge ? { childAge } : {}),
    ...(ask.targetCost ? { targetCost: cost === null ? null : entered(Math.round(cost), "nis", ctx.today) } : {}),
  });
  return { kind: "compare", preset, name, patch, to: "/goal/compare" };
}

/** The honest line under the product-mode headline (spec 5.5): shown while the horizon is below P-04's equity minimum. */
export const showsHorizonHonestLine = (years: number, equityMinYears: number | null): boolean => equityMinYears !== null && years < equityMinYears;
