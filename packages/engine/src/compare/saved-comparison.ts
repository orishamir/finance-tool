// The shapes a comparison saved on the device carries (site `state.ts`, `SavedComparisonRecord`): the versions it rested on
// and what it concluded. F-82, which re-runs a saved comparison against the current versions, is not built.
import type { ValueObject } from "@finance-tool/schema";

/** One rule figure a comparison read: rule ID, figure name, value as stored (a bracket schedule as `{ upTo, rate }[]`), its `checked` date. */
interface RuleFigureVersion {
  ruleId: string;
  figure: string;
  value: unknown;
  checked: string | null;
}

/** A parameter P-nn as it stood: its value (a value object's `value`, else the record without its prose). */
interface ParameterVersion {
  methodId: string;
  id: string;
  value: unknown;
}

/** A data file the comparison used (a fee snapshot, a series, a deposit-terms record), by path and `checked` date. */
interface DataFileVersion {
  path: string;
  checked: string | null;
}

/** An assumption A-nn: its value and D7 state (entered by the person, or sourced). */
interface AssumptionVersion {
  id: string;
  value: unknown;
  state: ValueObject["state"];
}

/** The versions a comparison rests on. */
export interface Versions {
  rules: RuleFigureVersion[];
  parameters: ParameterVersion[];
  data: DataFileVersion[];
  assumptions: AssumptionVersion[];
}

/** What a comparison concluded: F-80's top option, the tie set, and each ranked option's value. */
export interface ComparisonResult {
  top?: string;
  tieSet: string[];
  entries: { id: string; real: number; nominal: number; gapToNext?: number }[];
}
