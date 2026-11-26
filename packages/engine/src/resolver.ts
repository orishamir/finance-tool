// Figure resolver (docs/architecture.md 3.4, method §13). The engine never holds a rule figure: it asks for
// (rule ID, figure name) in the run's tax year. An open rule never computes; a figure past its
// effective_to, or for another tax year, stops the run; every rule served is recorded, with the part of the result it went into and
// whether it changed the number (`RuleUse`). A case the rule base holds open between named readings (open-readings.ts) is read under the
// reading the run's context chooses.
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import { amountInYear, movesBy, movingYears, yearlyMoveOf } from "./formulas/indexation.ts";
import { OpenReadingError, openReadingOf, type OpenReading, type TaxIndexOpenReading, type TaxIndexReadingId } from "./open-readings.ts";
import { labelWeight, type FeeType, type Label, type NotKnown, type RuleLabel, type RuleUse, type RunContext, type RunPart } from "./result.ts";

type Strength = RuleRecord["strength"] | ValueObject["source"]["strength"];

export interface UsedRule {
  id: string;
  strength: RuleRecord["strength"];
  dimensions: string[];
  /** Figure names read, with the strength of each figure's own source. */
  figures: { name: string; strength: Strength }[];
  /** How the run used the rule: one use per part and fee line, `changed` if any read through it changed the number (`RuleUse`). */
  uses: RuleUse[];
}

export interface Bracket {
  /** Upper bound of the band in NIS a year; null for the top band. */
  upTo: number | null;
  /** Rate as a fraction. */
  rate: number;
}

/** A record, a parameter or an input does not make a run; the message names the field (" is missing" marks a missing input, F-83). */
export class RecordInputError extends Error {}

/**
 * A rule the engine needs is open: the dimension is blocked and the wrapper is listed, not ranked (B3). `question` names the open question
 * when the rule is settled but the case at hand is not, and the readings it allows give the run different results (an s.120ב amount after
 * its freeze while the CPI falls: TXG-09, "TXG OQ17"; `acrossReadings`). `gap` names the method gap when the rule is settled but neither
 * the rule base nor the method has a reading of the case (a figure linked to the CPI every 1 January, of a rule no open reading covers, at
 * a falling CPI: G-38).
 */
export class BlockedError extends Error {
  readonly ruleId: string;
  readonly question?: string;
  readonly gap?: string;
  constructor(ruleId: string, question?: string, gap?: string) {
    super(gap ? `${ruleId} has no reading for this case (method ${gap}); it does not compute (D10)` : `${ruleId}${question ? ` (${question})` : ""} is open in il-finance; it does not compute (D10)`);
    this.ruleId = ruleId;
    this.question = question;
    this.gap = gap;
  }
}

/** method §13: a figure past its effective_to, or for another tax year, is "figure not updated". */
export class FigureNotUpdatedError extends Error {
  readonly ruleId: string;
  readonly figure: string;
  constructor(ruleId: string, figure: string) {
    super(`${ruleId} ${figure}: figure not updated for this run date`);
    this.ruleId = ruleId;
    this.figure = figure;
  }
}

/** The bundle has no such rule or figure: the rule is missing, and the engine stops rather than guess. */
export class MissingRuleError extends Error {
  readonly ruleId: string;
  readonly figure?: string;
  constructor(ruleId: string, figure?: string) {
    super(`${ruleId}${figure ? ` ${figure}` : ""} is not in the rule bundle`);
    this.ruleId = ruleId;
    this.figure = figure;
  }
}

const percentUnits = new Set(["pct", "pct_per_year", "pct_of_deposit", "pct_of_trade", "pct_of_balance_per_period"]);

const labelFor: Partial<Record<Strength, RuleLabel["code"]>> = {
  secondary: "secondary-source",
  institution: "institution-source",
};

/** The reads a book makes: through `peek` they record a use that changed nothing. */
export type RuleReads = Pick<RuleBook, "rate" | "amount" | "fact" | "brackets" | "cite">;

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
  /**
   * A view on the same store whose every read is a changed use on `part` (a `fees` use always on its fee line). The view's `inYear` keeps
   * the part and the line; the root book records part null.
   */
  on(part: Exclude<RunPart, "fees">): RuleBook;
  on(part: "fees", line: FeeType): RuleBook;
  /**
   * The same reads with the same checks (an open, stale or missing rule stops the run as a read does), recorded on this book's part and line
   * as a use that changed nothing and so gives no label: a rule looked at before the run knows whether it applies. `took` marks it changed.
   */
  readonly peek: RuleReads;
  /**
   * Marks the use of `ruleId` on this book's part and line as changed, adding it if absent, with the figures of the rule's unchanged uses,
   * which are the reads it now says went into this part. It works on the store, so a peek through `inYear(year)` is taken on the book
   * it came from. Throws if the run holds no read of the rule: a rule is taken only after it was read.
   */
  took(ruleId: string): void;
  /** Adds a label the rule's strength does not imply (a reading, a derivation, a proxy). */
  label(code: RuleLabel["code"], ruleId: string): void;
  /**
   * D119, F-04: the reading of a tax-index case a fund's run is made under. A fund whose own documents the site read (`notKnown` absent) is
   * run under the site's own reading (`siteReading`), with a `reading` label on the case's rule, which may be open and so is not read; the
   * run never meets the case. A fund the site does not know (`notKnown`) meets it: the run is made under the reading its context chooses
   * (`RunContext.readings`, method §13); one that has chosen none for the question stops so that `acrossReadings` can make it under each
   * (`OpenReadingError`, carrying `notKnown` for the label of a cautious reading, `CautiousLabel`), and one made with the question stopping it
   * stops on the rule with the question (`BlockedError`).
   */
  taxIndex(open: TaxIndexOpenReading, notKnown: NotKnown | undefined): TaxIndexReadingId;
  used(): UsedRule[];
  /** The labels of the rules with a changed use (`RuleUse`), and those added (`label`, `taxIndex`). */
  labels(): Label[];
  /**
   * F-119, F-120: the same rules read in the run's tax year `year` on its grid (1 = the run's own, `taxYearOf`): a money figure or a band's
   * bound that s.120ב freezes (`update_rule` "frozen YYYY-YYYY") is indexed past its freeze, and one linked to the CPI every 1 January
   * ("cpi-linked 1 jan") past the year read, by the run's inflation (`RunYears`); every other figure is as read. What the view reads is
   * recorded with the book's.
   */
  inYear(year: number): RuleBook;
  /** F-119: the calendar years after a freeze in which an indexed figure was read (method G-36), in order. */
  indexedYears(): number[];
  /** Records that the person's age or income changed what the run computed (A-12): a rule it brings in applied. */
  profile(input: ProfileInput): void;
  /** The profile inputs `profile` recorded, in a fixed order. */
  profileUsed(): ProfileInput[];
}

/** A taxpayer input a run can rest on (A-12): the age at the start, the yearly income. */
export type ProfileInput = "age" | "income";

/** F-119, F-120: what a ledger tells its book so a figure can be read in a later tax year: the run's CPI assumption (A-02, F-03). */
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
  const profileUsed = new Set<ProfileInput>();

  /** Where a book's reads go: the part of the result and the fee line, part null on the root book. */
  interface At {
    part: RunPart | null;
    line?: FeeType;
  }

  /** The rule's use at `at`, added if absent with `figures`; `changed` is ORed into it. */
  function ruleUse(u: UsedRule, at: At, changed: boolean, figures: () => string[] = () => []): RuleUse {
    let use = u.uses.find((x) => x.part === at.part && x.line === at.line);
    if (!use) {
      use = { part: at.part, ...(at.line === undefined ? {} : { line: at.line }), changed, figures: figures() };
      u.uses.push(use);
    } else use.changed ||= changed;
    return use;
  }

  function rule(id: string, at: At, changed: boolean): { record: RuleRecord; use: RuleUse } {
    const r = byId.get(id);
    if (!r) throw new MissingRuleError(id);
    if (r.strength === "open") throw new BlockedError(id);
    let u = used.get(id);
    if (!u) {
      u = { id, strength: r.strength, dimensions: r.dimensions, figures: [], uses: [] };
      used.set(id, u);
    }
    return { record: r, use: ruleUse(u, at, changed) };
  }

  function figure(id: string, name: string, at: At, changed: boolean): { f: unknown; use: RuleUse } {
    const { record, use } = rule(id, at, changed);
    const f = record.figures?.[name];
    if (f === undefined) throw new MissingRuleError(id, name);
    return { f, use };
  }

  function current(id: string, name: string, f: unknown, use: RuleUse): ValueObject {
    const byYear = (f as { by_tax_year?: Record<string, ValueObject> }).by_tax_year;
    const v = byYear ? byYear[String(runYear)] : (f as ValueObject);
    if (!v) throw new FigureNotUpdatedError(id, name);
    if (v.source.strength === "open") throw new BlockedError(id);
    if (v.effective_to !== null && v.effective_to < ctx.runDate) throw new FigureNotUpdatedError(id, name);
    if (v.tax_year != null && v.tax_year !== runYear) throw new FigureNotUpdatedError(id, name);
    used.get(id)!.figures.push({ name, strength: v.source.strength });
    if (!use.figures.includes(name)) use.figures.push(name);
    return v;
  }

  function numeric(id: string, name: string, v: ValueObject): number {
    if (typeof v.value !== "number") throw new MissingRuleError(id, name);
    return percentUnits.has(v.unit) ? v.value / 100 : v.value;
  }

  /**
   * A money figure as it stands in calendar year `year`, by the update its record names: F-119 for an amount s.120ב freezes, F-120 for one
   * linked to the CPI every 1 January; any other kind, and the run's own year, read it as it is. At a falling CPI the amount is an open
   * reading (TXG OQ17, KGL OQ15): it is read under the reading the context chooses (`RunContext.readings`), and a run that has chosen none
   * for the question stops so that `acrossReadings` can make it under each. A figure linked to the CPI every 1 January that no open reading
   * covers stops on its rule at a fall, naming G-38: its rule's text speaks of a rise, no open question names the case, and the method has
   * no reading of its own (F-120).
   */
  function inYearOf(id: string, name: string, v: ValueObject, amount: number, year: number): number {
    const move = yearlyMoveOf(v.update_rule);
    if (move === null || !movesBy(move, runYear, year)) return amount;
    if (!years) throw new Error(`F-119/F-120: ${id} ${name} is read for ${year}, after the year it was read for, and the run gave its book no inflation (RunYears)`);
    if (move.kind === "frozen") indexed.add(year);
    if (years.inflation >= 0) return amountInYear(move, amount, runYear, year, years.inflation);
    const open = openReadingOf(move, id);
    if (!open) throw new BlockedError(id, undefined, "G-38");
    return readingOf(open).amount(amount, Array.from({ length: movingYears(move, runYear, year) }, () => years.inflation));
  }

  function readingOf<O extends OpenReading>(open: O, notKnown?: NotKnown): O["readings"][number] {
    const choice = ctx.readings?.[open.question];
    if (choice === undefined) throw new OpenReadingError(open, notKnown);
    if (choice === null) throw new BlockedError(open.ruleId, open.question);
    const readings: readonly O["readings"][number][] = open.readings;
    const reading = readings.find((r) => r.id === choice);
    if (!reading) throw new Error(`${open.question} has no reading "${choice}"`);
    return reading;
  }

  /** The reads of a book reading in `taxYear` at `at`, each a use that changed the number or, for `peek`, one that did not. */
  function readsFor(taxYear: number, at: At, changed: boolean): RuleReads {
    return {
      rate(id, name) {
        const { f, use } = figure(id, name, at, changed);
        const v = current(id, name, f, use);
        if (!percentUnits.has(v.unit)) throw new MissingRuleError(id, `${name} as a percentage`);
        return numeric(id, name, v);
      },
      amount(id, name, currency) {
        const { f, use } = figure(id, name, at, changed);
        const v = current(id, name, f, use);
        if ((v.currency ?? "NIS") !== (currency ?? "NIS")) throw new MissingRuleError(id, `${name} in ${currency ?? "NIS"}`);
        const n = numeric(id, name, v);
        return percentUnits.has(v.unit) ? n : inYearOf(id, name, v, n, taxYear);
      },
      fact(id, name) {
        const { f, use } = figure(id, name, at, changed);
        return current(id, name, f, use).value;
      },
      brackets(id, name) {
        const { f, use } = figure(id, name, at, changed);
        if (!Array.isArray(f)) throw new MissingRuleError(id, `${name} as brackets`);
        return (f as { up_to: ValueObject; rate: ValueObject }[]).map((b) => {
          const bound = current(id, name, b.up_to, use);
          const upTo = typeof bound.value === "number" ? inYearOf(id, name, bound, bound.value, taxYear) : null;
          return { upTo, rate: numeric(id, name, current(id, name, b.rate, use)) };
        });
      },
      cite(id) {
        rule(id, at, changed);
      },
    };
  }

  function bookFor(taxYear: number, at: At): RuleBook {
    const self: RuleBook = {
    taxYear,
    ...readsFor(taxYear, at, true),
    peek: readsFor(taxYear, at, false),
    on: (part: RunPart, line?: FeeType) => bookFor(taxYear, line === undefined ? { part } : { part, line }),
    took(id) {
      const u = used.get(id);
      if (!u) throw new Error(`took(${id}): the run holds no read of ${id}, so it cannot have changed the number`);
      ruleUse(u, at, true, () => [...new Set(u.uses.filter((x) => !x.changed).flatMap((x) => x.figures))]);
    },
    taxIndex(open, notKnown) {
      if (notKnown) return readingOf(open, notKnown).id;
      extraLabels.push({ code: "reading", ruleId: open.ruleId });
      return open.siteReading;
    },
    label(code, ruleId) {
      rule(ruleId, at, true);
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
        if (!u.uses.some((x) => x.changed)) continue;
        const strengths = [u.strength, ...u.figures.map((f) => f.strength)];
        for (const s of strengths) {
          const code = labelFor[s];
          if (code) consider({ code, ruleId: u.id });
        }
      }
      extraLabels.forEach(consider);
      return [...best.values()];
    },
    inYear: (year) => bookFor(runYear + (years?.startsAfter ?? 0) + year - 1, at),
    indexedYears: () => [...indexed].sort((a, b) => a - b),
    profile(input) {
      profileUsed.add(input);
    },
    profileUsed: () => (["age", "income"] as const).filter((x) => profileUsed.has(x)),
    };
    return self;
  }

  return bookFor(runYear, { part: null });
}
