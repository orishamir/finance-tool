// Value objects on the site: the schema's object plus what a page needs to show it (D7, D3, D10).
import type { Flag, FundStatement, Label, P05Input } from "@finance-tool/engine";
import type { ParameterRecord, RuleRecord, ValueObject, Working } from "@finance-tool/schema";
import { amountShown, formatValue, numberShown, SHORT_IN_ROW } from "./format";
import { invest, numbers } from "../copy";

export type Strength = ValueObject["source"]["strength"];

/** A parameter's value object with the parameter marker the provenance sheet reads ("פרמטר של האתר"). */
export function asParameter(p: ParameterRecord, v: ValueObject): SiteValue {
  return { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null } };
}

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
  /**
   * D31: the name of the company whose own product this figure describes, set only where the figure is built for the row,
   * card or page that names that product. A company's figure about its own product is official in that context:
   * shown as sourced, with no "לפי החברה" caution.
   */
  own?: string;
  /**
   * A doubt about this very figure, in Hebrew: the record's own (a bank's `doubt_he`), or the site's cautious readings the figure rests on
   * (`readingDoubtOf`). The figure shows on an amber tint with the caution icon, and its sheet says the doubt. It is the
   * value's own, so every place that shows the figure warns.
   */
  doubt?: string;
  /** The rules the doubt rests on, whose cards its sheet opens beside it: the rule of each case a cautious reading reads (TXF-04, ETF-95). */
  doubtRules?: string[];
  /**
   * The inputs, by their key in `computed_from.inputs`, whose doubt a figure worked out from them carries (`differenceOf`): its sheet names
   * them, as it names the weak inputs, and each opens its own sheet with the doubt in words. A difference of two funds that said one fund's
   * doubt ("the fund's documents say…") left the reader to guess which fund it was about.
   */
  doubtFrom?: string[];
  /** For a site parameter: its rationale (copy 3.8). */
  parameter?: { rationale: string; rationaleHe?: string | null };
  /** Rules a computed value read, with the strength the run recorded. */
  rulesUsed?: { id: string; strength: Strength }[];
  /**
   * A fund's own statements a computed value rests on (`FundStatement`: the tax index its annex states, D84; the document naming it a
   * foreign-investment fund, D119): its sheet names each as the fund's.
   */
  statements?: readonly FundStatement[];
  /**
   * Engine labels on the run ("secondary-source", "reading": a rule applied as an inference, e.g. TXK-07 when the CPI fell; "cautious": the
   * site's cautious reading of an open case, which makes the figure's doubt), and the site's own cautious reading of where a fund whose
   * exchange is not known is bought (`ExchangeLabel`), which makes the figure's doubt as well.
   */
  labels?: SiteLabel[];
  /** Engine flags (G-IDs, open questions) that qualify the value. */
  flags?: string[];
  /** The run month each flag first applies from, by its code, where the engine found one (`Flag.month`): a flag with none applies throughout. */
  flagMonths?: Record<string, number>;
  /**
   * A plain difference or sum of figures on the page (`differenceOf`, `sumOf`): it adds no rule of its own, so its sheet names none; each of
   * its inputs opens its own rules, statements and warnings from its row.
   */
  plain?: boolean;
  /**
   * A line its sheet must always show beside the source, which the source's terms of use require (the ECB's attribution of its exchange
   * rates): never left out as a note can be.
   */
  obligation?: string;
  /** What the value is, in one line, for the sheet header. */
  about?: string;
  /** What the figure means, said first in its sheet, under the header (a definition at the sheet's end sat below the popover's edge). */
  lead?: string;
  /** The figure was shown with its sign ("+0.37%"): the sheet's head shows it the same way. */
  signed?: boolean;
  /** The words after the figure in its sheet's head, where the row says them otherwise than the unit's word (a fund's gap over one year: "ב־2025", not "בשנה"). */
  unitText?: string;
  /**
   * The figure as its line writes it, where that is not the unit's own form: an amount abroad written before its currency's word
   * ("20,000", then "ליש״ט"), an age with a half ("59½"). Its sheet heads with it, so the head says what the line says.
   */
  written?: string;
  /** A fact of another country's product (the guides' note on other countries, D114): no Israeli rule stands behind it, so its sheet
   *  links to its own page only, never to the site's rules. */
  foreign?: boolean;
  /** The page's own words the figure rests on, verbatim (a fact read on a government's page abroad): its sheet shows them under the source. */
  quote?: string;
  /** For an entered value:the P-05 value it replaced, and the input key the reset button clears. */
  replaces?: SiteValue;
  resetKey?: string;
  /**
   * A field's value: the default a chart's field starts at, or what the reader typed in it (charts.md). It shows as
   * a plain number wherever it appears (the sentence that repeats it, a calculation sheet's input row): no site-parameter tag, no "you
   * entered" mark, nothing that opens. The field beside it is where it changes. Its record still traces to data/parameters.
   */
  field?: boolean;
}

/** A value as a field's own (`SiteValue.field`): the default a chart's field starts at, or what the reader typed in it. */
export function asField<T extends SiteValue>(v: T): T {
  return { ...v, field: true };
}

/** The unit of each P-05 input a reader can enter. */
export const p05Units: Record<P05Input, ValueObject["unit"]> = {
  amount_now: "nis",
  monthly_deposit: "nis_per_month",
  horizon_years: "years",
  "A-01": "pct_per_year",
  "A-02": "pct_per_year",
  cash_rate: "pct_per_year",
  annual_income: "nis",
};

/** A value's number, or null when it holds none (empty, text, a flag). */
export const numberOf = (v: { value: unknown } | null | undefined): number | null => (v && typeof v.value === "number" ? v.value : null);

const order: Record<Strength, number> = { primary: 0, entered: 1, institution: 2, secondary: 3, open: 4 };

export function weaker(a: Strength | undefined, b: Strength | undefined): Strength | undefined {
  if (!a) return b;
  if (!b) return a;
  return order[a] >= order[b] ? a : b;
}

/**
 * The strength a number is labelled with: its own source, or the weakest thing a computation rests on. A computed value with no `weakest`
 * takes its own source's strength, never a strength it was not given.
 */
export function strengthOf(v: SiteValue): Strength {
  return v.state === "computed" ? (v.weakest ?? v.source.strength) : v.source.strength;
}

/** An empty value whose rule is open (D7 blocked, D10): no rule covers it, so the site shows the open question, never a figure or "unknown". */
export function isOpenValue(v: SiteValue): boolean {
  return v.value === null && v.state === "sourced" && v.source.strength === "open";
}

/** Whether a figure carries the caution flag (D7, D31): a secondary source, or a company's figure out of its own context. */
export function isWeak(v: SiteValue): boolean {
  const s = strengthOf(v);
  return s === "secondary" || (s === "institution" && !v.own);
}

/**
 * D31: marks a company's figure as its own, for the code that builds a value for the row, card or page that names that
 * product or company. Only an institution-strength figure is touched; a figure with any other source is returned as it is.
 */
export function ownBy<T extends SiteValue | ValueObject>(v: T, company: string): T & { own?: string } {
  return v.source.strength === "institution" ? { ...v, own: company } : v;
}

/** `ownBy` over a map of figures, for the keys `pick` accepts (all of them without it). */
export function ownEach(values: Record<string, SiteValue>, company: string, pick: (key: string) => boolean = () => true): Record<string, SiteValue> {
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, pick(k) ? ownBy(v, company) : v]));
}

/**
 * A site parameter's value (data/parameters), whose sheet tags it and shows the parameter's rationale: one the loader marked as a
 * parameter's (`asParameter`, `p05Value`), whatever its update rule, so a parameter that quotes a published figure (P-05's cash rate, the
 * Bank of Israel's) shows the assumption too; or one updated by the founder, which only a parameter is.
 */
export function isParameter(v: SiteValue): boolean {
  return v.state === "sourced" && (!!v.parameter || v.update_rule === "founder");
}


/** An entered value, in the shape saved state uses (data-schema §1). */
export function entered(value: number, unit: ValueObject["unit"], today: string, about?: string): SiteValue {
  return {
    value,
    unit,
    source: { url: "local", title: "הזנתם", publisher: "אתם", strength: "entered" },
    checked: today,
    effective_from: today,
    effective_to: null,
    update_rule: "founder",
    state: "entered",
    about,
  };
}

/**
 * F-65, ETF-95: the site's cautious reading of where a fund whose exchange is not known is bought: every account is priced on the exchange
 * that leaves the least, since no rule fixes where such a fund lists (`ruleId`, ETF-95). The site takes it over the engine's runs on the two
 * exchanges, not inside a run, so it is a label of its own beside the engine's (`Label`); it makes the figure's doubt as the engine's
 * `cautious` label does (`readingDoubtOf`), and travels with the run's labels to every figure worked out from the run.
 */
export interface ExchangeLabel {
  code: "unknown-exchange";
  ruleId: string;
}

/** A label a figure on the site carries: the engine's (`Label`) or the site's own cautious reading of a fund's exchange (`ExchangeLabel`). */
export type SiteLabel = Label | ExchangeLabel;

/**
 * The doubt a figure carries for the labels it rests on, each cautious reading's words in order, with each case's rule beside them: the
 * engine's `cautious` label (method §13, `SplitPolicy` "cautious"), the site's cautious reading of an open case for a fund it does not know,
 * in the words for what it does not know of the fund (`notKnown`); and the site's cautious reading of a fund's exchange (`ExchangeLabel`).
 * None for any other label, the site's own `reading` of an open tax index among them (D119), which its sheet tags. A cautious case with no
 * words is a broken invariant (a test holds the words to the cases).
 */
function readingDoubtOf(labels: readonly SiteLabel[] | undefined): Pick<SiteValue, "doubt" | "doubtRules"> {
  const doubts: { words: string; ruleId: string }[] = [];
  for (const l of labels ?? []) {
    if (l.code === "unknown-exchange") doubts.push({ words: invest.customEntries.exchangeUnknownDoubt, ruleId: l.ruleId });
    if (l.code !== "cautious") continue;
    const words = numbers.readingDoubt[l.ruleId]?.[l.notKnown];
    if (!words) throw new Error(`the cautious reading of ${l.ruleId} has no doubt in words for ${l.notKnown} (copy.ts numbers.readingDoubt)`);
    doubts.push({ words, ruleId: l.ruleId });
  }
  if (doubts.length === 0) return {};
  return { doubt: [...new Set(doubts.map((d) => d.words))].join(" "), doubtRules: [...new Set(doubts.map((d) => d.ruleId))] };
}

/**
 * Whether a figure's sheet carries the tag of the site's own reading (`numbers.reading`): it does where the figure rests on a reading, except
 * on a plain difference or sum (`SiteValue.plain`) whose readings are all an input's: the tag stands in that input's own sheet, which its
 * row of the receipt opens, with the rule that is read. A reading of its own, which no input carries, keeps the tag.
 */
export function sheetReading(v: Pick<SiteValue, "labels" | "plain" | "computed_from">): boolean {
  const readings = (v.labels ?? []).filter((l) => l.code === "reading" || l.code === "cautious");
  if (!v.plain) return readings.length > 0;
  const key = (l: SiteLabel) => `${l.code} ${l.ruleId}`;
  const carried = new Set(Object.values((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>).flatMap((x) => (x.labels ?? []).map(key)));
  return readings.some((l) => !carried.has(key(l)));
}

/**
 * The flags a figure's sheet says: every flag it carries, except on a plain difference or sum (`SiteValue.plain`), whose sheet leaves out a
 * flag one of its inputs already carries: each row of its receipt is that input's own figure and opens its sheet, where the flag stands in
 * full. A flag of its own, which no input carries, stays.
 */
export function sheetFlags(v: Pick<SiteValue, "flags" | "plain" | "computed_from">): string[] {
  const flags = v.flags ?? [];
  if (!v.plain) return flags;
  const carried = new Set(Object.values((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>).flatMap((x) => x.flags ?? []));
  return flags.filter((code) => !carried.has(code));
}

/**
 * The rules a computed figure's sheet names: those its runs read, with the strength they recorded, then each rule it carries the site's own
 * `reading` of and did not read (no strength): an open rule whose open tax index the site reads for the fund (TXF-04, D119), which gives
 * the run nothing to read, so its card is where the sheet says why. A plain difference or sum names none (`SiteValue.plain`).
 */
export function sheetRules(v: Pick<SiteValue, "rulesUsed" | "labels" | "plain">): { id: string; strength: Strength | null }[] {
  // a plain difference or sum names none: each of its rows opens its input's own rules
  if (v.plain) return [];
  const read = v.rulesUsed ?? [];
  const readIds = new Set(read.map((r) => r.id));
  const unread = [...new Set((v.labels ?? []).filter((l) => l.code === "reading" && !readIds.has(l.ruleId)).map((l) => l.ruleId))];
  return [...read, ...unread.map((id) => ({ id, strength: null }))];
}

/**
 * What a computed figure carries of the inputs it rests on beside its own options:
 * - each input's `reading` labels, the site's own reading of a rule (an open tax index's among them, D119), with that rule as the input
 *   recorded it, and each input's fund statements, so a figure worked out from a figure on a reading tags the reading and names the fund's
 *   document as that figure does; a cautious label, the engine's or the site's (`SiteLabel`), is not carried, the doubt it makes is;
 * - the stalest input's staleness (the earliest `since`);
 * - every input's flags, each with the earliest month any input gives it.
 * A cost before the exit tax carries none of an open tax index's, since its inputs wear none (invest.ts `beforeExitTax`). Carried rules and
 * statements leave the strength alone: each input's own strength already counts them.
 */
function carriedFromInputs(inputs: Record<string, SiteValue>) {
  const labels: SiteLabel[] = [];
  const rules: { id: string; strength: Strength }[] = [];
  const statements: FundStatement[] = [];
  let stale: Staleness | null = null;
  const flags: Flag[] = [];
  for (const input of Object.values(inputs)) {
    for (const l of input.labels ?? []) {
      if (l.code !== "reading") continue;
      labels.push(l);
      const rule = input.rulesUsed?.find((r) => r.id === l.ruleId);
      if (rule) rules.push(rule);
    }
    statements.push(...(input.statements ?? []));
    if (input.stale && (!stale || input.stale.since < stale.since)) stale = input.stale;
    for (const code of input.flags ?? []) flags.push({ code, ...(input.flagMonths?.[code] !== undefined ? { month: input.flagMonths[code] } : {}) });
  }
  return { labels, rules, statements, stale, flags };
}

/** `own` with each of `more` whose key it does not hold yet, in order; undefined where both are empty. */
function withMore<T>(own: readonly T[] | undefined, more: readonly T[], key: (x: T) => string): T[] | undefined {
  if (more.length === 0) return own ? [...own] : undefined;
  const byKey = new Map((own ?? []).map((x) => [key(x), x] as const));
  for (const x of more) if (!byKey.has(key(x))) byKey.set(key(x), x);
  return [...byKey.values()];
}

/** A flag as a figure takes it: an engine flag with the month it first applies from, or a code that applies throughout. */
export type FlagIn = string | Flag;

/** Flags by code, each once, in order, with the earliest month given for it: the value's `flags` and `flagMonths`. */
function flagsOf(list: readonly FlagIn[]): Pick<SiteValue, "flags" | "flagMonths"> {
  const months = new Map<string, number | undefined>();
  for (const f of list) {
    const { code, month } = typeof f === "string" ? { code: f, month: undefined } : f;
    const seen = months.get(code);
    // a flag given once with no month applies throughout, so no month is kept
    months.set(code, !months.has(code) ? month : seen === undefined || month === undefined ? undefined : Math.min(seen, month));
  }
  const flagMonths = Object.fromEntries([...months].filter((e): e is [string, number] => e[1] !== undefined));
  return { flags: [...months.keys()], ...(Object.keys(flagMonths).length ? { flagMonths } : {}) };
}

/** The options a computed value takes (`computed`). */
export interface ComputedOptions {
  today: string;
  /** The rules the figure's own calculation read, beside what its inputs already list: a rule an input lists is dropped here (`computed`). */
  rules?: { id: string; strength: Strength }[];
  statements?: readonly FundStatement[];
  flags?: readonly FlagIn[];
  labels?: SiteLabel[];
  /** For a figure with no value because a rule is open (`BlockedError`): that rule, the only one its sheet names. */
  blockedBy?: string;
  about?: string;
  notes?: string;
  lead?: string;
  signed?: boolean;
  unitText?: string;
  working?: Working;
}

/**
 * A computed value with the formula and the inputs it came from (architecture 3.4), carrying what the inputs it rests on carry
 * (`carriedFromInputs`). The rules it lists are its own options' less each rule a computed input already lists, whose row opens it there
 * (the reading rules it carries stay, with their labels). A value that is null lists no rule but the one that left it empty (`blockedBy`). A
 * label of a cautious reading among its own, the engine's or the site's (`SiteLabel`), makes its doubt (`readingDoubtOf`); an input's doubt
 * stays on that input, where its row opens it (a tally over the banks' rates is not tinted for one bank's doubt), except on a plain
 * difference or sum, which is its inputs and nothing else (`plain`). `working` says how its sheet shows the calculation (`Working`), where
 * the value is exactly that.
 */
export function computed(value: number | null, unit: ValueObject["unit"], formula: string, inputs: Record<string, SiteValue>, options: ComputedOptions): SiteValue {
  const held = new Set(Object.values(inputs).flatMap((input) => (input.state === "computed" ? (input.rulesUsed ?? []).map((r) => r.id) : [])));
  const ownRules = options.rules?.filter((r) => !held.has(r.id));
  let weakest: Strength | undefined;
  for (const input of Object.values(inputs)) {
    // D31: a company's figure about its own product does not weaken what is computed from it
    const st = strengthOf(input);
    const own = st === "institution" && !!input.own;
    weakest = weaker(weakest, input.state === "entered" || own ? "primary" : st);
  }
  for (const r of ownRules ?? []) weakest = weaker(weakest, r.strength);
  for (const st of options.statements ?? []) weakest = weaker(weakest, st.source.strength);
  const carried = carriedFromInputs(inputs);
  const merged = {
    rules: value === null ? (options.blockedBy ? [{ id: options.blockedBy, strength: "open" as const }] : []) : withMore(ownRules, carried.rules, (r) => r.id),
    statements: withMore(options.statements, carried.statements, statementKey),
    labels: withMore(options.labels, carried.labels, (l) => `${l.code}|${l.ruleId}`),
  };
  const doubt = readingDoubtOf(options.labels);
  const flags = flagsOf([...(options.flags ?? []), ...carried.flags]);
  return {
    value,
    unit,
    source: { url: `docs/method.md#${formula}`, title: formula, publisher: "מקור", strength: weakest ?? "primary" },
    checked: options.today,
    effective_from: null,
    effective_to: null,
    update_rule: "market",
    state: "computed",
    computed_from: { formula, inputs, ...(options.working ? { working: options.working } : {}) },
    weakest: weakest ?? "primary",
    rulesUsed: merged.rules,
    ...(merged.statements?.length ? { statements: merged.statements } : {}),
    ...(flags.flags?.length ? flags : {}),
    labels: merged.labels,
    ...doubt,
    ...(carried.stale ? { stale: carried.stale } : {}),
    about: options.about,
    notes: options.notes,
    ...(options.lead ? { lead: options.lead } : {}),
    ...(options.signed ? { signed: true } : {}),
    ...(options.unitText ? { unitText: options.unitText } : {}),
  };
}

/** The options of a plain difference or sum (`differenceOf`, `sumOf`): no rules and no statements of its own, which it never has. */
export type PlainOptions = Omit<ComputedOptions, "rules" | "statements"> & { unit?: ValueObject["unit"]; round?: (n: number) => number };

/**
 * A plain difference or sum as its sheet shows it: no rule and no statement of its own, even one an input carries on a reading, since each
 * row of its receipt is that input's own figure and opens it. Its labels, staleness and flags stay, and where its own options give it no
 * doubt, every input's doubt is its doubt (each one's words once, the rules of each, and which inputs carry it, `doubtFrom`), since it rests
 * on them alone: so it keeps its tint and tags.
 */
function plain(v: SiteValue, inputs: Record<string, SiteValue>): SiteValue {
  const { rulesUsed: _rules, statements: _statements, ...rest } = v;
  const doubted = Object.entries(inputs).filter(([, x]) => x.doubt);
  if (v.doubt || doubted.length === 0) return { ...rest, plain: true };
  const rules = [...new Set(doubted.flatMap(([, x]) => x.doubtRules ?? []))];
  return { ...rest, plain: true, doubt: [...new Set(doubted.flatMap(([, x]) => (x.doubt ? [x.doubt] : [])))].join(" "), ...(rules.length ? { doubtRules: rules } : {}), doubtFrom: doubted.map(([name]) => name) };
}

/**
 * Whether the lines of a difference or a sum, each with its sign, come to the figure as the page writes each of them: only then does its
 * sheet show them as a receipt (`Working`), whose lines a reader adds up. Its sheet lists its inputs instead where:
 * - a sum of figures with agorot, written in whole shekels each, misses its total by a shekel;
 * - a line or the total is a shekel figure a phone's row may write short ("0.76 מיליארד ₪", `SHORT_IN_ROW`), which no longer adds up as read;
 * - a line or the total is written in a form that does not read back as a number (`readsBack`: agorot per dollar, an amount in billions).
 */
function addsUp(lines: readonly (readonly [sign: 1 | -1, v: SiteValue])[], result: number, unit: ValueObject["unit"]): boolean {
  const all = [...lines.map(([, v]) => [v.value as number, v.unit, v.state, isParameter(v)] as const), [result, unit, "computed", false] as const];
  if (all.some(([n, u, st, param]) => Math.abs(n) >= SHORT_IN_ROW || !readsBack(n, u, st, param))) return false;
  const sum = lines.reduce((t, [sign, v]) => t + sign * numberShown(v.value as number, v.unit, v.state, isParameter(v)), 0);
  return Math.abs(sum - numberShown(result, unit, "computed")) < 1e-9;
}

/** Whether a figure's text, as the page writes it, reads back as a number written the same way (`numberShown` falls back to the raw value). */
function readsBack(v: number, unit: string, state: SiteValue["state"], parameter: boolean): boolean {
  const text = formatValue(v, unit, state, parameter);
  const digits = Number(text.replace(/[^\d.]/g, ""));
  return formatValue(text.includes("−") ? -digits : digits, unit, state, parameter) === text;
}

/**
 * A figure worked out from two others on the page, `a − b` (a gap between two ways, what a change adds): the value is computed here from
 * the two as the page writes them (`amountShown`: 10,768 ₪ less 8,203 ₪ is 2,565 ₪, whatever agorot each holds), and its inputs are the
 * two, each opening its own sheet, so the sheet cannot list what the value does not rest on. Null when either is not a number. `round`
 * shapes the result (its size alone). It is plain (`plain`): it carries the two's labels, doubt, staleness and flags as every computed
 * figure does (`computed`), and lists no rule. Its sheet shows it as the difference it is (`Working` "difference"), where the two as written
 * come to it as written (`addsUp`), unless the options name a line of math it is (`working`). Two figures under one name (a list's row against
 * itself) are both kept, the second told apart by its order, and it shows no working, which would name one key for two lines.
 */
export function differenceOf(a: readonly [name: string, value: SiteValue], b: readonly [name: string, value: SiteValue], formula: string, options: PlainOptions): SiteValue {
  const [an, av] = a;
  const [bn, bv] = b;
  const same = an === bn;
  const bk = same ? `${bn} (2)` : bn;
  const n = typeof av.value === "number" && typeof bv.value === "number" ? amountShown(av.value, av.unit, av.state, isParameter(av)) - amountShown(bv.value, bv.unit, bv.state, isParameter(bv)) : null;
  const value = n === null ? null : (options.round ?? ((x: number) => x))(n);
  const unit = options.unit ?? av.unit;
  const shown = same ? undefined : (options.working ?? (value !== null && addsUp([[1, av], [-1, bv]], value, unit) ? ({ kind: "difference", from: an, less: bn } as const) : undefined));
  return plain(computed(value, unit, formula, { [an]: av, [bk]: bv }, { ...options, working: undefined, ...(shown ? { working: shown } : {}) }), { [an]: av, [bk]: bv });
}

/**
 * A figure with another number in its place (a line's whole shekels as a receipt writes them, which may differ from the figure's own rounding
 * by a shekel): its working, which comes to the figure's own number, is left off, so its sheet shows its formula and its inputs.
 */
export function restated(v: SiteValue, value: number): SiteValue {
  return v.computed_from ? { ...v, value, computed_from: { formula: v.computed_from.formula, inputs: v.computed_from.inputs } } : { ...v, value };
}

/**
 * A fund statement's identity on a page: the term it states, its document and the page there (a stated index's own page; the address of a
 * document naming the fund a foreign-investment fund carries its page), so one statement is carried and listed once.
 */
export function statementKey(st: FundStatement): string {
  return `${st.term}|${st.source.url}|${st.term === "tax-index" ? st.page : ""}`;
}

/**
 * A figure that adds up others on the page (a cost of several lines, a total of parts): the same as `differenceOf`, for a sum, which its
 * sheet shows as one (`Working` "sum") where its parts as written come to it as written (`addsUp`). Null when any part is not a number.
 */
export function sumOf(parts: Record<string, SiteValue>, formula: string, options: PlainOptions): SiteValue {
  const list = Object.values(parts);
  const n = list.length > 0 && list.every((p) => typeof p.value === "number") ? list.reduce((t, p) => t + (p.value as number), 0) : null;
  const value = n === null ? null : (options.round ?? ((x: number) => x))(n);
  const unit = options.unit ?? list[0]?.unit ?? "nis";
  const shown = options.working ?? (value !== null && addsUp(list.map((p) => [1, p] as const), value, unit) ? ({ kind: "sum", parts: Object.keys(parts) } as const) : undefined);
  return plain(computed(value, unit, formula, parts, { ...options, ...(shown ? { working: shown } : {}) }), parts);
}

/**
 * The one calendar year an amount is for, so a yearly amount never reads as always true: the year it covers (1 January to 31 December of
 * the same year), else its tax year, else the year an amount indexed each 1 January took effect (`cpi-linked 1 jan` from 1.1.2026 is
 * 2026's); none for an amount not tied to a year.
 */
export function figureYear(v: Pick<ValueObject, "effective_from" | "effective_to" | "tax_year" | "update_rule">): string | null {
  const f = v.effective_from;
  const t = v.effective_to;
  if (f && t && f.slice(0, 4) === t.slice(0, 4) && f.slice(5) === "01-01" && t.slice(5) === "12-31") return f.slice(0, 4);
  if (v.tax_year) return String(v.tax_year);
  if (v.update_rule === "cpi-linked 1 jan" && f && f.slice(5) === "01-01" && !t) return f.slice(0, 4);
  return null;
}

/**
 * A figure out of a rule record, carrying the rule's strength and re-check date, and what it is in the rule's own words
 * (`figure_names_he`), with its year for a figure set by tax year. "name@2027" is a figure set by tax year, for that year (null when the
 * record sets none for it): prose that says a rise the law already sets reads each later year's figure.
 */
export function ruleFigure(rule: RuleRecord, name: string, today: string): SiteValue | null {
  const [base, year] = name.split("@") as [string, string | undefined];
  const f = rule.figures?.[base];
  if (!f || Array.isArray(f)) return null;
  if (year !== undefined && !("by_tax_year" in f)) return null;
  let taxYear: string | null = null;
  if ("by_tax_year" in f) {
    const years = Object.keys(f.by_tax_year);
    taxYear = year ?? (today.slice(0, 4) in f.by_tax_year ? today.slice(0, 4) : (years.at(-1) ?? null));
  }
  const v = "by_tax_year" in f ? (taxYear === null ? undefined : f.by_tax_year[taxYear]) : f;
  if (!v) return null;
  const stale = recheckStale(rule, today) ? { since: rule.checked, cadence: "yearly" as const } : null;
  const he = rule.figure_names_he?.[base];
  return { ...v, stale, rule_ids: v.rule_ids ?? [rule.id], ...(he ? { about: taxYear ? `${he} ${taxYear}` : he } : {}) };
}

/** Whether a rule's re-check date has passed by `today` (YYYY-MM-DD); a rule with none never has. */
export function recheckStale(rule: { recheck_date?: string | null }, today: string): boolean {
  return !!rule.recheck_date && rule.recheck_date < today;
}

export function staleCma(reportPeriod: string, today: string): Staleness | null {
  // Flow 9 and product §6: the flag is for a refresh that failed, not for the regulator's publication lag. A month's figures
  // appear about three weeks after it ends (September's were on data.gov.il by 23 October), so the next period is due in the
  // month after next; the stored one counts as stale only once that month has passed without it (counting from
  // the first day of the month after next would flag current data for most of every month).
  const [y, m] = reportPeriod.split("-").map(Number) as [number, number];
  const limit = new Date(Date.UTC(y, m - 1 + 3, 1)).toISOString().slice(0, 10);
  return today >= limit ? { since: reportPeriod, cadence: "monthly" } : null;
}

/**
 * A CMA fee average belongs to a calendar year (CAT-36). The next year's average arrives with the January rows of the
 * year after it, which carry the same publication lag as any month (`staleCma`), so the average is stale once those
 * rows are overdue: from 1 March two years after its own year (not 1 January, before they can exist).
 * `effectiveTo` is the fee's `effective_to` (YYYY-12-31), `today` is YYYY-MM-DD.
 */
export function staleCmaFee(effectiveTo: string | null, today: string): Staleness | null {
  if (!effectiveTo) return null;
  const feeYear = Number(effectiveTo.slice(0, 4));
  return staleCma(`${feeYear + 1}-12`, today) ? { since: effectiveTo, cadence: "yearly" } : null;
}

/** A CMA fee average (data-schema 3.13) as a site value: the file's value object plus the yearly stale rule. */
export function cmaFeeValue(v: ValueObject, today: string): SiteValue {
  return { ...v, stale: staleCmaFee(v.effective_to, today) };
}

/**
 * The day a sourced figure takes effect (its `effective_from`) as a value of its own, with the figure's source, so prose shows
 * the date through `Num` instead of typing it (BANK-35's two dates). `about` says what the date is. Null without a date.
 */
export function effectiveFromValue(v: SiteValue | null, about: string): SiteValue | null {
  if (!v?.effective_from) return null;
  return { ...v, value: v.effective_from, unit: "text", effective_to: null, about };
}

/** The calendar year a CMA fee average belongs to (its `effective_from`), or null. */
export function feeYear(v: Pick<ValueObject, "effective_from">): string | null {
  return v.effective_from ? v.effective_from.slice(0, 4) : null;
}

/**
 * A track list ships one fee pair per track; the source, dates and rule ids are the same for most of them, so
 * the list carries the value object once (`template`) and, per track, the number and its own note only.
 */
export interface CompactFee {
  value: number | null;
  /** Sent only when it differs from the template's note (a missing value, a negative one): "" for a row with no note under a template with one. */
  notes?: string;
  /** Sent only when they differ from the template's (an empty deposit fee that PF-06 explains). */
  rule_ids?: string[];
}

/** A row as the list ships it against its template: its number, and its note and rule ids where they are not the template's. */
export function compactFee(v: ValueObject, template: ValueObject): CompactFee {
  const out: CompactFee = { value: v.value as number | null };
  if ((v.notes ?? "") !== (template.notes ?? "")) out.notes = v.notes ?? "";
  if ((v.rule_ids ?? []).join() !== (template.rule_ids ?? []).join()) out.rule_ids = v.rule_ids ?? [];
  return out;
}

/** A shipped row back as its value: the template with the row's number, its own note ("" is none) and its own rule ids. */
export function expandFee(c: CompactFee, template: SiteValue): SiteValue {
  const { notes: _tplNotes, ...rest } = template;
  const notes = c.notes === undefined ? template.notes : c.notes;
  return { ...rest, value: c.value, ...(notes ? { notes } : {}), rule_ids: c.rule_ids ?? template.rule_ids };
}

/**
 * The row a list's template is taken from: the first with a number and no note where one exists (so few rows ship a note of their own),
 * else the first with a number, else the first.
 */
export function templateRow<T>(rows: readonly T[], value: (row: T) => Pick<ValueObject, "value" | "notes"> | null | undefined): T | undefined {
  const has = (r: T) => typeof value(r)?.value === "number";
  return rows.find((r) => has(r) && !value(r)?.notes) ?? rows.find(has) ?? rows[0];
}

/**
 * An empty deposit-fee average of a product type that may charge a fee from the balance only (PF-06): no fee, by rule, not a
 * gap. The pipeline names the rule on such a value (data-schema 3.13); calculations take 0 for it, and the page says "אין".
 */
export function depositFeeNoneByRule(v: Pick<ValueObject, "value" | "rule_ids">): boolean {
  return v.value === null && (v.rule_ids ?? []).includes("PF-06");
}

/** Fills "{year}" in a label with a fee's year; without a year the clause is left out. */
export function feeLabel(template: string, year: string | null): string {
  return year ? template.replace("{year}", year) : template.replace(/ בשנת \{year\}/, "").replace(/, \{year\}/, "").replace(" {year}", "");
}
