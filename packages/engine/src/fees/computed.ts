// A computed value object (data-schema §1, D7): the formula and the inputs it came from, labelled with the
// weakest source among the rules the run read. Shared by the R3 outputs (F-61, F-68, F-64).
import type { ValueObject } from "@finance-tool/schema";

type Strength = ValueObject["source"]["strength"];

/** Strongest first. A computed figure is only as strong as the weakest rule or record under it. */
const strengthOrder: readonly Strength[] = ["primary", "primary-mirror", "institution", "secondary", "open", "entered"];

export function weakestStrength(strengths: readonly Strength[]): Strength {
  let weakest: Strength = "primary";
  for (const s of strengths) if (strengthOrder.indexOf(s) > strengthOrder.indexOf(weakest)) weakest = s;
  return weakest;
}

export interface ComputedOptions {
  /** The run date: the day the figure was computed (`checked`). */
  checked: string;
  strength?: Strength;
  ruleIds?: readonly string[];
  notes?: string;
}

/** A `state: "computed"` value object. `value` null needs `notes` (the schema says why it is null). */
export function computedValue(
  value: number | null,
  unit: ValueObject["unit"],
  formula: string,
  inputs: Record<string, unknown>,
  options: ComputedOptions,
): ValueObject {
  const v: ValueObject = {
    value,
    unit,
    source: { url: `docs/method.md#${formula}`, title: `Computed: method ${formula}`, publisher: "finance-tool method", strength: options.strength ?? "primary" },
    checked: options.checked,
    effective_from: null,
    effective_to: null,
    update_rule: "market",
    state: "computed",
    computed_from: { formula, inputs },
  };
  if (options.ruleIds && options.ruleIds.length > 0) v.rule_ids = [...options.ruleIds];
  if (options.notes !== undefined) v.notes = options.notes;
  return v;
}
