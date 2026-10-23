// Figure resolver (docs/architecture.md 3.4, method §13). The engine never holds a rule figure: it asks for
// (rule ID, figure name) in the run's tax year. An open rule never computes; a figure past its
// effective_to, or for another tax year, stops the run; every rule served is recorded.
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
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
  "primary-mirror": "mirror-source",
};
const labelWeight: Record<Label["code"], number> = {
  "secondary-source": 3,
  "institution-source": 2,
  "mirror-source": 1,
  reading: 4,
  derived: 4,
  proxy: 4,
};

export interface RuleBook {
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
}

export function ruleBook(ctx: RunContext): RuleBook {
  const byId = new Map(ctx.rules.map((r) => [r.id, r]));
  const taxYear = Number(ctx.runDate.slice(0, 4));
  const used = new Map<string, UsedRule>();
  const extraLabels: Label[] = [];

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
    const v = byYear ? byYear[String(taxYear)] : (f as ValueObject);
    if (!v) throw new FigureNotUpdatedError(id, name);
    if (v.source.strength === "open") throw new BlockedError(id);
    if (v.effective_to !== null && v.effective_to < ctx.runDate) throw new FigureNotUpdatedError(id, name);
    if (v.tax_year != null && v.tax_year !== taxYear) throw new FigureNotUpdatedError(id, name);
    used.get(id)!.figures.push({ name, strength: v.source.strength });
    return v;
  }

  function numeric(id: string, name: string, v: ValueObject): number {
    if (typeof v.value !== "number") throw new MissingRuleError(id, name);
    return percentUnits.has(v.unit) ? v.value / 100 : v.value;
  }

  return {
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
      return numeric(id, name, v);
    },
    fact(id, name) {
      return current(id, name, figure(id, name)).value;
    },
    brackets(id, name) {
      const f = figure(id, name);
      if (!Array.isArray(f)) throw new MissingRuleError(id, `${name} as brackets`);
      return (f as { up_to: ValueObject; rate: ValueObject }[]).map((b) => {
        const upTo = current(id, name, b.up_to).value;
        return { upTo: typeof upTo === "number" ? upTo : null, rate: numeric(id, name, current(id, name, b.rate)) };
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
  };
}
