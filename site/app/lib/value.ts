// Value objects on the site: the schema's object plus what a page needs to show it (D7, D3, D10).
import type { FundStatement, Label, P05Input } from "@finance-tool/engine";
import type { ParameterRecord, RuleRecord, ValueObject, Working } from "@finance-tool/schema";
import { amountShown } from "./format";
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

/** The strength a number is labelled with: its own source, or the weakest thing a computation rests on. */
export function strengthOf(v: SiteValue): Strength {
  return v.state === "computed" ? (v.weakest ?? "primary") : v.source.strength;
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

export function isParameter(v: SiteValue): boolean {
  return v.update_rule === "founder" && v.state === "sourced";
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
 * The rules a computed figure's sheet names: those its runs read, with the strength they recorded, then each rule it carries the site's own
 * `reading` of and did not read (no strength): an open rule whose open tax index the site reads for the fund (TXF-04, D119), which gives
 * the run nothing to read, so its card is where the sheet says why.
 */
export function sheetRules(v: Pick<SiteValue, "rulesUsed" | "labels">): { id: string; strength: Strength | null }[] {
  const read = v.rulesUsed ?? [];
  const readIds = new Set(read.map((r) => r.id));
  const unread = [...new Set((v.labels ?? []).filter((l) => l.code === "reading" && !readIds.has(l.ruleId)).map((l) => l.ruleId))];
  return [...read, ...unread.map((id) => ({ id, strength: null }))];
}

/**
 * What a computed figure carries of the inputs it rests on beside its own options: each input's `reading` labels, the site's own reading of
 * a rule (an open tax index's among them, D119), with that rule as the input recorded it, and each input's fund statements, so a figure
 * worked out from a figure on a reading tags the reading and names the fund's document as that figure does. A cautious label, the engine's
 * or the site's (`SiteLabel`), is not carried: the doubt it makes travels by `differenceOf`. A cost before the exit tax carries none of an open tax index's, since its inputs wear none
 * (invest.ts `beforeExitTax`). Carried rules and statements leave the strength alone: each input's own strength already counts them.
 */
function carriedFromInputs(inputs: Record<string, SiteValue>): { labels: SiteLabel[]; rules: { id: string; strength: Strength }[]; statements: FundStatement[] } {
  const labels: SiteLabel[] = [];
  const rules: { id: string; strength: Strength }[] = [];
  const statements: FundStatement[] = [];
  for (const input of Object.values(inputs)) {
    for (const l of input.labels ?? []) {
      if (l.code !== "reading") continue;
      labels.push(l);
      const rule = input.rulesUsed?.find((r) => r.id === l.ruleId);
      if (rule) rules.push(rule);
    }
    statements.push(...(input.statements ?? []));
  }
  return { labels, rules, statements };
}

/** `own` with each of `more` whose key it does not hold yet, in order; undefined where both are empty. */
function withMore<T>(own: readonly T[] | undefined, more: readonly T[], key: (x: T) => string): T[] | undefined {
  if (more.length === 0) return own ? [...own] : undefined;
  const byKey = new Map((own ?? []).map((x) => [key(x), x] as const));
  for (const x of more) if (!byKey.has(key(x))) byKey.set(key(x), x);
  return [...byKey.values()];
}

/**
 * A computed value with the formula and the inputs it came from (architecture 3.4), carrying the reading labels and fund statements of the
 * inputs it rests on (`carriedFromInputs`). A label of a cautious reading among its own, the engine's or the site's (`SiteLabel`), makes its
 * doubt (`readingDoubtOf`). `working` says how its sheet shows the calculation (`Working`), where the value is exactly that.
 */
export function computed(
  value: number | null,
  unit: ValueObject["unit"],
  formula: string,
  inputs: Record<string, SiteValue>,
  options: { today: string; rules?: { id: string; strength: Strength }[]; statements?: readonly FundStatement[]; flags?: string[]; labels?: SiteLabel[]; about?: string; notes?: string; lead?: string; signed?: boolean; unitText?: string; working?: Working },
): SiteValue {
  let weakest: Strength | undefined;
  for (const input of Object.values(inputs)) {
    // D31: a company's figure about its own product does not weaken what is computed from it
    const st = strengthOf(input);
    const own = st === "institution" && !!input.own;
    weakest = weaker(weakest, input.state === "entered" || own ? "primary" : st);
  }
  for (const r of options.rules ?? []) weakest = weaker(weakest, r.strength);
  for (const st of options.statements ?? []) weakest = weaker(weakest, st.source.strength);
  const carried = carriedFromInputs(inputs);
  const merged = {
    rules: withMore(options.rules, carried.rules, (r) => r.id),
    statements: withMore(options.statements, carried.statements, statementKey),
    labels: withMore(options.labels, carried.labels, (l) => `${l.code}|${l.ruleId}`),
  };
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
    flags: options.flags,
    labels: merged.labels,
    ...readingDoubtOf(options.labels),
    about: options.about,
    notes: options.notes,
    ...(options.lead ? { lead: options.lead } : {}),
    ...(options.signed ? { signed: true } : {}),
    ...(options.unitText ? { unitText: options.unitText } : {}),
  };
}

/** The options of a computed value, as `computed` takes them. */
export type ComputedOptions = Parameters<typeof computed>[4];

/**
 * A figure worked out from two others on the page, `a − b` (a gap between two ways, what a change adds): the value is computed here from
 * the two as the page writes them (`amountShown`: 10,768 ₪ less 8,203 ₪ is 2,565 ₪, whatever agorot each holds), and its inputs are the
 * two, each opening its own sheet, so the sheet cannot list what the value does not rest on. Null when either is not a number. `round`
 * shapes the result (its size alone). A doubt on either figure is the difference's too, since it rests on both, where its own options give
 * it none: the first one's words, the rules of each, and which of the two carry it (`doubtFrom`). Their reading labels and fund statements
 * it carries as every computed figure does (`computed`). Its sheet shows it as the difference it is (`Working` "difference"), unless the
 * options name a line of math it is (`working`).
 */
export function differenceOf(a: readonly [name: string, value: SiteValue], b: readonly [name: string, value: SiteValue], formula: string, options: ComputedOptions & { unit?: ValueObject["unit"]; round?: (n: number) => number }): SiteValue {
  const [an, av] = a;
  const [bn, bv] = b;
  const n = typeof av.value === "number" && typeof bv.value === "number" ? amountShown(av.value, av.unit, av.state, isParameter(av)) - amountShown(bv.value, bv.unit, bv.state, isParameter(bv)) : null;
  const v = computed(n === null ? null : (options.round ?? ((x: number) => x))(n), options.unit ?? av.unit, formula, { [an]: av, [bn]: bv }, { ...options, working: options.working ?? { kind: "difference", from: an, less: bn } });
  const doubted = ([a, b] as const).filter(([, x]) => x.doubt);
  const [first] = doubted;
  if (v.doubt || !first) return v;
  const rules = [...new Set(doubted.flatMap(([, x]) => x.doubtRules ?? []))];
  return { ...v, doubt: first[1].doubt, ...(rules.length ? { doubtRules: rules } : {}), doubtFrom: doubted.map(([name]) => name) };
}

/**
 * A fund statement's identity on a page: the term it states, its document and the page there (a stated index's own page; the address of a
 * document naming the fund a foreign-investment fund carries its page), so one statement is carried and listed once.
 */
export function statementKey(st: FundStatement): string {
  return `${st.term}|${st.source.url}|${st.term === "tax-index" ? st.page : ""}`;
}

/**
 * The rules, flags and labels of the runs a figure rests on, each once, for a figure computed from them that is not their sum or difference
 * alone (a point where two runs cross): every run that reads a rule or a line carries what it carries (F-12, F-128).
 */
export function carriedBy(values: readonly SiteValue[]): Pick<ComputedOptions, "rules" | "statements" | "flags" | "labels"> {
  const rules = new Map<string, { id: string; strength: Strength }>();
  const statements = new Map<string, FundStatement>();
  const flags = new Set<string>();
  const labels = new Map<string, SiteLabel>();
  for (const v of values) {
    for (const r of v.rulesUsed ?? []) rules.set(r.id, r);
    for (const st of v.statements ?? []) statements.set(statementKey(st), st);
    for (const f of v.flags ?? []) flags.add(f);
    for (const l of v.labels ?? []) labels.set(`${l.code}|${l.ruleId}`, l);
  }
  return { rules: [...rules.values()], statements: [...statements.values()], flags: [...flags], labels: [...labels.values()] };
}

/**
 * A figure that adds up others on the page (a cost of several lines, a total of parts): the same as `differenceOf`, for a sum, which its
 * sheet shows as one (`Working` "sum"). Null when any part is not a number.
 */
export function sumOf(parts: Record<string, SiteValue>, formula: string, options: ComputedOptions & { unit?: ValueObject["unit"]; round?: (n: number) => number }): SiteValue {
  const list = Object.values(parts);
  const n = list.length > 0 && list.every((p) => typeof p.value === "number") ? list.reduce((t, p) => t + (p.value as number), 0) : null;
  return computed(n === null ? null : (options.round ?? ((x: number) => x))(n), options.unit ?? list[0]?.unit ?? "nis", formula, parts, { ...options, working: options.working ?? { kind: "sum", parts: Object.keys(parts) } });
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
 * A figure out of a rule record, carrying the rule's strength and re-check date. "name@2027" is a figure set by tax year, for that year
 * (null when the record sets none for it): prose that says a rise the law already sets reads each later year's figure.
 */
export function ruleFigure(rule: RuleRecord, name: string, today: string): SiteValue | null {
  const [base, year] = name.split("@") as [string, string | undefined];
  const f = rule.figures?.[base];
  if (!f || Array.isArray(f)) return null;
  if (year !== undefined && !("by_tax_year" in f)) return null;
  const v = "by_tax_year" in f ? (year !== undefined ? f.by_tax_year[year] : f.by_tax_year[today.slice(0, 4)] ?? Object.values(f.by_tax_year).at(-1)) : f;
  if (!v) return null;
  const stale = recheckStale(rule, today) ? { since: rule.checked, cadence: "yearly" as const } : null;
  return { ...v, stale, rule_ids: v.rule_ids ?? [rule.id] };
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
  /** Sent only when it differs from the template's note (a missing value, a negative one). */
  notes?: string;
  /** Sent only when they differ from the template's (an empty deposit fee that PF-06 explains). */
  rule_ids?: string[];
}

export function compactFee(v: ValueObject, template: ValueObject): CompactFee {
  const out: CompactFee = { value: v.value as number | null };
  if (v.notes && v.notes !== template.notes) out.notes = v.notes;
  if ((v.rule_ids ?? []).join() !== (template.rule_ids ?? []).join()) out.rule_ids = v.rule_ids ?? [];
  return out;
}

export function expandFee(c: CompactFee, template: SiteValue): SiteValue {
  return { ...template, value: c.value, notes: c.notes ?? template.notes, rule_ids: c.rule_ids ?? template.rule_ids };
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
