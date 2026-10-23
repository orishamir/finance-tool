// Value objects on the site: the schema's object plus what a page needs to show it (D7, D3, D10).
import type { RuleRecord, ValueObject } from "@finance-tool/schema";

export type Strength = ValueObject["source"]["strength"];
export type NumberState = ValueObject["state"];

/** Why a value is stale, when it is: the date it was last known good, and its usual cadence. */
export interface Staleness {
  since: string;
  cadence: "daily" | "monthly" | "quarterly" | "yearly";
}

export interface SiteValue extends ValueObject {
  /** Set by the loader when the value is older than its cadence (D3): shows the clock. */
  stale?: Staleness | null;
  /** The weakest strength among everything a computed value rests on (D10 labels travel). */
  weakest?: Strength;
  /** For a site parameter: its rationale and sign-off (copy 3.8). */
  parameter?: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null; provisional: boolean };
  /** Rules a computed value read, with the strength the run recorded. */
  rulesUsed?: { id: string; strength: Strength }[];
  /** Engine flags (G-IDs, open questions) that qualify the value. */
  flags?: string[];
  /** What the value is, in one line, for the sheet header. */
  about?: string;
  /** For an entered value: the P-05 value it replaced, and the input key the reset button clears. */
  replaces?: SiteValue;
  resetKey?: string;
}

const order: Record<Strength, number> = { primary: 0, "primary-mirror": 1, entered: 1, institution: 2, secondary: 3, open: 4 };

export function weaker(a: Strength | undefined, b: Strength | undefined): Strength | undefined {
  if (!a) return b;
  if (!b) return a;
  return order[a] >= order[b] ? a : b;
}

/** The strength a number is labelled with: its own source, or the weakest thing a computation rests on. */
export function strengthOf(v: SiteValue): Strength {
  return v.state === "computed" ? (v.weakest ?? "primary") : v.source.strength;
}

export function isParameter(v: SiteValue): boolean {
  return v.update_rule === "founder" && v.state === "sourced";
}

export function isProvisional(v: SiteValue): boolean {
  return v.parameter?.provisional ?? (v.notes ?? "").startsWith("provisional");
}

/** An entered value, in the shape saved state uses (data-schema §1). */
export function entered(value: number, unit: ValueObject["unit"], today: string, about?: string): SiteValue {
  return {
    value,
    unit,
    source: { url: "local", title: "הוזן על ידך", publisher: "אתם", strength: "entered" },
    checked: today,
    effective_from: today,
    effective_to: null,
    update_rule: "founder",
    state: "entered",
    about,
  };
}

/** A computed value with the formula and the inputs it came from (architecture 3.4). */
export function computed(
  value: number | null,
  unit: ValueObject["unit"],
  formula: string,
  inputs: Record<string, SiteValue>,
  options: { today: string; rules?: { id: string; strength: Strength }[]; flags?: string[]; about?: string; notes?: string } ,
): SiteValue {
  let weakest: Strength | undefined;
  for (const input of Object.values(inputs)) weakest = weaker(weakest, input.state === "entered" ? "primary" : strengthOf(input));
  for (const r of options.rules ?? []) weakest = weaker(weakest, r.strength);
  return {
    value,
    unit,
    source: { url: `docs/method.md#${formula}`, title: formula, publisher: "מקור", strength: weakest ?? "primary" },
    checked: options.today,
    effective_from: null,
    effective_to: null,
    update_rule: "market",
    state: "computed",
    computed_from: { formula, inputs },
    weakest: weakest ?? "primary",
    rulesUsed: options.rules,
    flags: options.flags,
    about: options.about,
    notes: options.notes,
  };
}

/** A figure out of a rule record, carrying the rule's strength and re-check date. */
export function ruleFigure(rule: RuleRecord, name: string, today: string): SiteValue | null {
  const f = rule.figures?.[name];
  if (!f || Array.isArray(f)) return null;
  const v = "by_tax_year" in f ? f.by_tax_year[today.slice(0, 4)] ?? Object.values(f.by_tax_year).at(-1) : f;
  if (!v) return null;
  const stale = rule.recheck_date && rule.recheck_date < today ? { since: rule.checked, cadence: "yearly" as const } : null;
  return { ...v, stale, rule_ids: v.rule_ids ?? [rule.id] };
}

export function staleCma(reportPeriod: string, today: string): Staleness | null {
  // Flow 9: the regulator's monthly data counts as stale once the month after its period has passed.
  const [y, m] = reportPeriod.split("-").map(Number) as [number, number];
  const limit = new Date(Date.UTC(y, m - 1 + 2, 1)).toISOString().slice(0, 10);
  return today >= limit ? { since: reportPeriod, cadence: "monthly" } : null;
}

/**
 * A CMA fee average belongs to a calendar year (CAT-36). It is stale once the previous calendar year is
 * older than that year, i.e. a newer year's average should have appeared in the January rows.
 * `effectiveTo` is the fee's `effective_to` (YYYY-12-31), `today` is YYYY-MM-DD.
 */
export function staleCmaFee(effectiveTo: string | null, today: string): Staleness | null {
  if (!effectiveTo) return null;
  const feeYear = Number(effectiveTo.slice(0, 4));
  return Number(today.slice(0, 4)) - 1 > feeYear ? { since: effectiveTo, cadence: "yearly" } : null;
}

/** A CMA fee average (data-schema 3.13) as a site value: the file's value object plus the yearly stale rule. */
export function cmaFeeValue(v: ValueObject, today: string): SiteValue {
  return { ...v, stale: staleCmaFee(v.effective_to, today) };
}

/** The calendar year a CMA fee average belongs to (its `effective_from`), or null. */
export function feeYear(v: Pick<ValueObject, "effective_from">): string | null {
  return v.effective_from ? v.effective_from.slice(0, 4) : null;
}

/**
 * A track list ships one fee pair per track; the source, dates and rule ids are the same for all of them, so
 * the list carries the value object once (`template`) and, per track, the number and its own note only.
 */
export interface CompactFee {
  value: number | null;
  /** Sent only when it differs from the template's note (a missing value, a negative one). */
  notes?: string;
}

export function compactFee(v: ValueObject, template: ValueObject): CompactFee {
  return v.notes && v.notes !== template.notes ? { value: v.value as number | null, notes: v.notes } : { value: v.value as number | null };
}

export function expandFee(c: CompactFee, template: SiteValue): SiteValue {
  return { ...template, value: c.value, notes: c.notes ?? template.notes };
}

/** Fills "{year}" in a label with a fee's year; without a year the clause is left out. */
export function feeLabel(template: string, year: string | null): string {
  return year ? template.replace("{year}", year) : template.replace(/ בשנת \{year\}/, "").replace(/, \{year\}/, "").replace(" {year}", "");
}
