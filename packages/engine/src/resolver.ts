// Figure resolver (docs/architecture.md 3.4, method §13). The engine never holds a rule figure: it asks for
// (rule ID, figure name) in the run's tax year. An open rule never computes; a figure past its
// effective_to, or for another tax year, stops the run; every rule served is recorded.
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import { freezeEnd, indexedAmount } from "./formulas/indexation.ts";
import type { Label, RunContext } from "./result.ts";

type Strength = RuleRecord["strength"] | ValueObject["source"]["strength"];

export interface UsedRule {
  id: string;
  strength: RuleRecord["strength"];
  dimensions: string[];
  /** Figure names read, with the strength of each figure's own source. */
  figures: { name: string; strength: Strength }[];
}

export interface Bracket {
  /** Upper bound of the band in NIS a year; null for the top band. */
  upTo: number | null;
  /** Rate as a fraction. */
  rate: number;
}

/** A record, a parameter or an input does not make a run; the message names the field (" is missing" marks a missing input, F-83). */
export class RecordInputError extends Error {}

/** A rule the engine needs is open: the dimension is blocked and the wrapper is listed, not ranked (B3). */
export class BlockedError extends Error {
  constructor(readonly ruleId: string) {
    super(`${ruleId} is open in il-finance; it does not compute (D10)`);
  }
}

/** method §13: a figure past its effective_to, or for another tax year, is "figure not updated". */
export class FigureNotUpdatedError extends Error {
  constructor(readonly ruleId: string, readonly figure: string) {
    super(`${ruleId} ${figure}: figure not updated for this run date`);
  }
}

/** The bundle has no such rule or figure: the rule is missing, and the engine stops rather than guess. */
export class MissingRuleError extends Error {
  constructor(readonly ruleId: string, readonly figure?: string) {
    super(`${ruleId}${figure ? ` ${figure}` : ""} is not in the rule bundle`);
  }
}

const percentUnits = new Set(["pct", "pct_per_year", "pct_of_deposit", "pct_of_trade", "pct_of_balance_per_period"]);

const labelFor: Partial<Record<Strength, Label["code"]>> = {
  secondary: "secondary-source",
  institution: "institution-source",
};
const labelWeight: Record<Label["code"], number> = {
  "secondary-source": 3,
  "institution-source": 2,
  reading: 4,
  derived: 4,
  proxy: 4,
};

export interface RuleBook {
  /** The calendar tax year the book reads in: the run's, or a later one (`inYear`). */
  readonly taxYear: number;
  /** A percentage figure, returned as a fraction (25 → 0.25). */
  rate(ruleId: string, figure: string): number;
  /** A money, count or period figure. A money figure in another currency must name it. */
  amount(ruleId: string, figure: string, currency?: string): number;
  /** A figure that is a fact rather than a number (a boolean or a text), as stored. */
  fact(ruleId: string, figure: string): number | string | boolean | null;
  /** An income-tax schedule, rates as fractions. */
  brackets(ruleId: string, figure: string): Bracket[];
  /** Records that a rule with no figure governs this run (a treatment, not a number). */
  cite(ruleId: string): void;
  /** Adds a label the rule's strength does not imply (a reading, a derivation, a proxy). */
  label(code: Label["code"], ruleId: string): void;
  used(): UsedRule[];
  labels(): Label[];
  /**
   * F-119: the same rules read in the run's tax year `year` on its grid (1 = the run's own, `taxYearOf`): a money figure or a band's bound
   * that s.120ב freezes (`update_rule` "frozen YYYY-YYYY") is indexed past its freeze by the run's inflation (`RunYears`); every other
   * figure is as read. What the view reads is recorded with the book's.
   */
  inYear(year: number): RuleBook;
  /** F-119: the calendar years after a freeze in which an indexed figure was read (method G-36), in order. */
  indexedYears(): number[];
}

/** F-119: what a ledger tells its book so a figure can be read in a later tax year: the run's CPI assumption (A-02, F-03). */
export interface RunYears {
  /** A-02, a fraction a year. */
  inflation: number;
  /** Whole tax years between the run date's and the grid's first (a later leg of a switch, `gridOffset`); default 0. */
  startsAfter?: number;
}

/** A run looks up a few rules among hundreds, and a page makes thousands of runs on one list: the list is indexed once. */
const indexed = new WeakMap<RunContext["rules"], Map<string, RuleRecord>>();
function rulesById(rules: RunContext["rules"]): Map<string, RuleRecord> {
  let byId = indexed.get(rules);
  if (!byId) {
    byId = new Map(rules.map((r) => [r.id, r]));
    indexed.set(rules, byId);
  }
  return byId;
}

export function ruleBook(ctx: RunContext, years?: RunYears): RuleBook {
  const byId = rulesById(ctx.rules);
  const runYear = Number(ctx.runDate.slice(0, 4));
  const used = new Map<string, UsedRule>();
  const extraLabels: Label[] = [];
  const indexed = new Set<number>();

  function rule(id: string): RuleRecord {
    const r = byId.get(id);
    if (!r) throw new MissingRuleError(id);
    if (r.strength === "open") throw new BlockedError(id);
    if (!used.has(id)) used.set(id, { id, strength: r.strength, dimensions: r.dimensions, figures: [] });
    return r;
  }

  function figure(id: string, name: string): unknown {
    const f = rule(id).figures?.[name];
    if (f === undefined) throw new MissingRuleError(id, name);
    return f;
  }

  function current(id: string, name: string, f: unknown): ValueObject {
    const byYear = (f as { by_tax_year?: Record<string, ValueObject> }).by_tax_year;
    const v = byYear ? byYear[String(runYear)] : (f as ValueObject);
    if (!v) throw new FigureNotUpdatedError(id, name);
    if (v.source.strength === "open") throw new BlockedError(id);
    if (v.effective_to !== null && v.effective_to < ctx.runDate) throw new FigureNotUpdatedError(id, name);
    if (v.tax_year != null && v.tax_year !== runYear) throw new FigureNotUpdatedError(id, name);
    used.get(id)!.figures.push({ name, strength: v.source.strength });
    return v;
  }

  function numeric(id: string, name: string, v: ValueObject): number {
    if (typeof v.value !== "number") throw new MissingRuleError(id, name);
    return percentUnits.has(v.unit) ? v.value / 100 : v.value;
  }

  /** F-119: a money figure as it stands in calendar year `year`; the run's own year reads it as it is. */
  function inYearOf(id: string, name: string, v: ValueObject, amount: number, year: number): number {
    const frozenTo = freezeEnd(v.update_rule);
    if (year === runYear || frozenTo === null || year <= Math.max(runYear, frozenTo)) return amount;
    if (!years) throw new Error(`F-119: ${id} ${name} is read for ${year}, after its freeze, and the run gave its book no inflation (RunYears)`);
    indexed.add(year);
    return indexedAmount(amount, runYear, frozenTo, year, years.inflation);
  }

  function bookFor(taxYear: number): RuleBook {
    const self: RuleBook = {
    taxYear,
    rate(id, name) {
      const v = current(id, name, figure(id, name));
      if (!percentUnits.has(v.unit)) throw new MissingRuleError(id, `${name} as a percentage`);
      return numeric(id, name, v);
    },
    amount(id, name, currency) {
      const v = current(id, name, figure(id, name));
      const actual = (v as { currency?: string }).currency;
      if ((actual ?? "NIS") !== (currency ?? "NIS")) throw new MissingRuleError(id, `${name} in ${currency ?? "NIS"}`);
      const n = numeric(id, name, v);
      return percentUnits.has(v.unit) ? n : inYearOf(id, name, v, n, taxYear);
    },
    fact(id, name) {
      return current(id, name, figure(id, name)).value;
    },
    brackets(id, name) {
      const f = figure(id, name);
      if (!Array.isArray(f)) throw new MissingRuleError(id, `${name} as brackets`);
      return (f as { up_to: ValueObject; rate: ValueObject }[]).map((b) => {
        const bound = current(id, name, b.up_to);
        const upTo = typeof bound.value === "number" ? inYearOf(id, name, bound, bound.value, taxYear) : null;
        return { upTo, rate: numeric(id, name, current(id, name, b.rate)) };
      });
    },
    cite(id) {
      rule(id);
    },
    label(code, ruleId) {
      rule(ruleId);
      extraLabels.push({ code, ruleId });
    },
    used: () => [...used.values()],
    labels() {
      const best = new Map<string, Label>();
      const consider = (l: Label) => {
        const prev = best.get(l.ruleId);
        if (!prev || labelWeight[l.code] > labelWeight[prev.code]) best.set(l.ruleId, l);
      };
      for (const u of used.values()) {
        const strengths = [u.strength, ...u.figures.map((f) => f.strength)];
        for (const s of strengths) {
          const code = labelFor[s];
          if (code) consider({ code, ruleId: u.id });
        }
      }
      extraLabels.forEach(consider);
      return [...best.values()];
    },
    inYear: (year) => bookFor(runYear + (years?.startsAfter ?? 0) + year - 1),
    indexedYears: () => [...indexed].sort((a, b) => a - b),
    };
    return self;
  }

  return bookFor(runYear);
}
