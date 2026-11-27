// Which rules a figure under data/ may name in its rule_ids (docs/data-schema.md §1): the rules that set, cap or define the value in its
// current state, or that are the tax or the fee it is; never background, never the record's topic. A figure's sheet opens each id it
// names as a chip, so an id that sets nothing about the figure sends the reader to a card that does not explain it.
//
// FIGURE_RULES is the table: for a collection and a path inside its records, each id a value there may name, the state it is allowed in
// (`when`; absent, always) and why. An id a row lists with a `when` that is false is one the row knows and disallows in that state (a
// row lists the ids it drops with `never`): packages/pipeline/scripts/apply-figure-rules.ts removes it. An id no row lists is unknown: it
// is kept and listed, and goes to a finance reviewer before a row admits it. Besides the rows, one standing allow holds for every id a
// row does not list: an id whose card under data/rules/ lists, among its sources, the document the value's own source is (its address
// without the part after "#"), since that card holds the source the figure's sheet names. A row that lists the id decides it: a tax
// bucket's source is the Income Tax Ordinance, which many tax cards cite, and its row still says which of them set the bucket. A row can
// close itself to the standing allow (`closed`): then an id it does not list is unknown even when its card cites the value's source.
// Every deposit row is closed: a deposit's values cite a bank's table or the Ordinance, which cards about other products cite too, so
// citing the same document says nothing about whether the card sets the value.
//
// Only the record the site reads (the latest snapshot of each record) is judged; the older dated snapshots stay as they were.

import { objectsIn, ruleCards, type CheckData } from "./checks/lib/kit.ts";

/** The collections the table covers. */
export type FigureCollection = "terms/deposits" | "fees" | "funds" | "instruments" | "averages";

/** A record or a value as the table reads it: a JSON object. */
type Json = Readonly<Record<string, unknown>>;

/** One id a row admits: in the state `when` holds of the record and the value (always, when absent), for the reason `why`. */
interface FigureAllow {
  id: string;
  when?: (record: Json, value: Json) => boolean;
  why: string;
}

/** One row of the table: the ids a value at `path` of a `collection` record may name. */
export interface FigureRow {
  collection: FigureCollection;
  /** The value's place in the record, its keys joined by "." and any array index written "[]" ("balance_conditions[].value"). A row covers the values under its path too ("amount_range" covers "amount_range.min"). */
  path: string;
  allow: readonly FigureAllow[];
  /** True when the standing allow does not hold here: an id the row does not list is unknown, whatever its card cites. */
  closed?: boolean;
}

/** An id the row knows and never admits, with why it does not belong on that value. */
const never = (id: string, why: string): FigureAllow => ({ id, when: () => false, why });

const field = (record: Json, key: string): unknown => record[key];
/** A current account (BANK-09 is its rule), not a deposit or a savings plan. */
const currentAccount = (r: Json) => field(r, "wrapper_id") === "current-account";
const variableRate = (r: Json) => field(r, "rate_type") === "variable";
/** The record's tax bucket (`tax_bucket.value`): "unlinked_15", "linked_25" or null while open. */
const bucket = (r: Json): unknown => {
  const t = field(r, "tax_bucket");
  return t && typeof t === "object" ? (t as Json).value : undefined;
};
const bankIs = (...banks: string[]) => (r: Json) => banks.includes(String(field(r, "bank")));
const savingsPlan = (r: Json) => field(r, "wrapper_id") === "savings-plan";

/** Directive 447 Annex A's eight standard shekel deposit types, by period (BANK-14). */
const ANNEX_A_TYPES = new Set(["פיקדון יומי", "פיקדון שבועי", "פיקדון חודשי", "פיקדון ל-3 חודשים", "פיקדון ל-6 חודשים", "פיקדון לשנה", "פיקדון לשנתיים", "פיקדון ל-3 שנים"]);
/** A row of the type column printed as its period alone ("12 חודשים", as Mizrahi-Tefahot prints it), by the Annex A type of that period. */
const ANNEX_A_PERIODS: Readonly<Record<string, string>> = {
  "1 יום": "פיקדון יומי",
  "1 שבוע": "פיקדון שבועי",
  "1 חודש": "פיקדון חודשי",
  "3 חודשים": "פיקדון ל-3 חודשים",
  "6 חודשים": "פיקדון ל-6 חודשים",
  "12 חודשים": "פיקדון לשנה",
  שנתיים: "פיקדון לשנתיים",
  "3 שנים": "פיקדון ל-3 שנים",
};
/**
 * The record's type (`type_447`) as one of Annex A's eight, read through the ways the banks print the type column: "פקדון" for
 * "פיקדון", "ל 3" for "ל-3", "לחודש" for "חודשי", the days after it in brackets ("פיקדון לשנה (365 יום)"), or the period alone. Null for
 * any other type: a bank's product name ("פקצ״מ לשנה", "חסכון אודם לשנה"), a savings plan, a longer deposit.
 */
export function annexAType(type447: unknown): string | null {
  if (typeof type447 !== "string") return null;
  const t = type447
    .trim()
    .replace(/^פקדון/, "פיקדון")
    .replace(/\s*\(\d+ יום\)$/, "")
    .replace(/ ל (?=\d)/, " ל-")
    .replace(/^פיקדון לחודש$/, "פיקדון חודשי");
  const named = ANNEX_A_PERIODS[t] ?? t;
  return ANNEX_A_TYPES.has(named) ? named : null;
}
const annexA = (r: Json) => annexAType(field(r, "type_447")) !== null;
const ANNEX_A_TERM = "Annex A fixes the period of its eight standard deposit types, and this record is one of them; any other product's term is the bank's own";
/** The ten banks whose terms BANK-34 read for what each calls the prime. */
const PRIME_BANKS = ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem", "one-zero"];

const deposits = "terms/deposits" as const;

export const FIGURE_RULES: readonly FigureRow[] = [
  {
    collection: deposits,
    path: "term_months",
    closed: true,
    allow: [
      never("BANK-09", "a current account has no term, and BANK-09 sets none"),
      { id: "BANK-14", when: annexA, why: ANNEX_A_TERM },
      never("BANK-27", "BANK-27 is about exit points and amount ranges, not the term"),
      never("BANK-28", "BANK-28 is what a savings plan's agreement says about breaking it: the break line opens it"),
    ],
  },
  {
    collection: deposits,
    path: "term_days",
    closed: true,
    allow: [
      { id: "BANK-14", when: annexA, why: ANNEX_A_TERM },
      { id: "BANK-50", when: (_r, v) => typeof v.value === "number", why: "F-21 counts a term under a year by these days, by the formula BANK-50 holds" },
    ],
  },
  {
    collection: deposits,
    path: "amount_range",
    closed: true,
    allow: [
      { id: "BANK-27", why: "each bank sets the amounts a product takes, and the table prints each range on a row of its own" },
      { id: "BANK-09", when: currentAccount, why: "the minimum and maximum balance a current account's interest is paid on, which BANK-09 says the bank must show" },
      {
        id: "BANK-28",
        when: savingsPlan,
        why: "the limits on how much each deposit of a savings plan may be, which the plan's agreement must state (disclosure rules s.7(ב)(4))",
      },
    ],
  },
  {
    collection: deposits,
    path: "rate_offered",
    closed: true,
    allow: [
      { id: "BANK-13", why: "the offered rate is the minimum the bank commits to in its consolidated publication, a yearly nominal rate before tax" },
      { id: "BANK-25", when: variableRate, why: "a variable rate is its anchor with a spread known in advance, as the table must print it" },
      { id: "BANK-09", when: currentAccount, why: "the interest on a current account's credit balance, which BANK-09 says the bank must show" },
      never("BANK-34", "what the prime is: the spread rests on it, and the spread names it"),
      never("BANK-28", "BANK-28 is what a savings plan's agreement says about breaking it: the break line opens it"),
    ],
  },
  {
    collection: deposits,
    path: "rate_effective",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the printed rate is nominal, and BANK-50 holds how it becomes the rate over the deposit's period" },
      { id: "BANK-04", why: "the disclosure rules make the bank state the adjusted yearly rate of an unlinked shekel deposit, compounded" },
    ],
  },
  {
    collection: deposits,
    path: "interest_calc.effective_annual",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the printed rate is nominal, and BANK-50 holds how it becomes the rate over the deposit's period" },
      { id: "BANK-04", why: "the disclosure rules make the bank state the adjusted yearly rate of an unlinked shekel deposit, compounded" },
    ],
  },
  {
    collection: deposits,
    path: "interest_calc.effective_decimals",
    closed: true,
    allow: [{ id: "BANK-50", why: "the precision F-21 reads the times a year from, in the formula BANK-50 holds" }],
  },
  {
    collection: deposits,
    path: "interest_calc.periods_per_year",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the times a year interest is calculated, which BANK-50's formula leaves to each product" },
      { id: "BANK-09", when: currentAccount, why: "the dates a current account's interest is credited, which BANK-09 says the bank must show" },
    ],
  },
  {
    collection: deposits,
    path: "balance_conditions[].value",
    closed: true,
    allow: [{ id: "BANK-09", why: "the balance a current account's interest is paid on, which BANK-09 says the bank must show" }],
  },
  {
    collection: deposits,
    path: "spread",
    closed: true,
    allow: [
      { id: "BANK-25", why: "a variable rate's spread over its anchor, known in advance, as the table must print it" },
      {
        id: "BANK-34",
        when: (r) => field(r, "anchor") === "prime" && bankIs(...PRIME_BANKS)(r),
        why: "the spread is over the prime, and BANK-34 says what each of the ten banks it read calls the prime",
      },
    ],
  },
  {
    collection: deposits,
    path: "tax_bucket",
    closed: true,
    allow: [
      { id: "TXI-03", when: (r) => bucket(r) === "unlinked_15", why: "the fixed rate on the whole nominal interest of an asset not fully linked to the index" },
      {
        id: "TXI-04",
        when: (r) => bucket(r) === "unlinked_15" && (variableRate(r) || field(r, "linkage") !== "none"),
        why: "what counts as linked: a prime-linked or partly linked deposit counts as unlinked",
      },
      { id: "TXI-04", when: (r) => bucket(r) === "linked_25", why: "what counts as fully linked, which the linked bucket needs" },
      { id: "TXI-02", when: (r) => bucket(r) === "linked_25", why: "the ceiling on the tax on interest, which a fully linked deposit's real interest bears" },
      { id: "TXI-05", when: (r) => bucket(r) === "linked_25", why: "the linkage of a fully linked asset is exempt, and the interest above it is taxed" },
      { id: "TXI-08", when: currentAccount, why: "the bank withholds the tax on interest it pays an individual, a current account's credit interest included" },
      never("BPN-09", "BPN-09 says what a best-of deposit's alternatives are, not how it is taxed: the record's topic, while its tax is an open question"),
      never("TXI-19", "a lower bracket from the qualifying age: no figure of the deposit, and the tax's own rules name it"),
      never("BANK-09", "BANK-09 is what a bank must show about a current account's interest, not its tax"),
    ],
  },
  {
    collection: deposits,
    path: "break",
    closed: true,
    allow: [
      { id: "BANK-06", why: "breaking a deposit: the bank's consent, the form and what it costs" },
      { id: "BANK-14", why: "the annex makes the table show whether each accepted type can be broken" },
      { id: "BANK-28", why: "what a savings plan's agreement and disclosure must say about breaking it, and that no rule sets the price" },
      { id: "BANK-09", when: currentAccount, why: "a current account is not broken: its money is there at any time" },
      {
        id: "BANK-33",
        when: (r) => bankIs("discount")(r) || (bankIs("mercantile")(r) && savingsPlan(r)),
        why: "Discount's own break penalty on its deposits and standing-order plans, and Mercantile's on its standing-order plans",
      },
      { id: "BANK-49", when: bankIs("one-zero"), why: "One Zero's own break terms" },
      { id: "BANK-55", when: bankIs("yahav"), why: "Yahav's own break terms" },
      { id: "BANK-56", when: (r) => bankIs("jerusalem")(r) && savingsPlan(r), why: "Bank of Jerusalem's savings plans' own break terms" },
      { id: "BPN-10", when: (r) => bankIs("hapoalim")(r) && savingsPlan(r), why: "Hapoalim's savings plans' own withdrawal and break terms" },
    ],
  },
];

/** The keys a JSON pointer ("/balance_conditions/0/value") walks, unescaped ("~1" is "/", "~0" is "~"). */
export const pointerKeys = (pointer: string): string[] =>
  pointer
    .split("/")
    .slice(1)
    .map((k) => k.replace(/~1/g, "/").replace(/~0/g, "~"));

/** A JSON pointer ("/balance_conditions/0/value") as the table's path ("balance_conditions[].value"). */
export function pathOf(pointer: string): string {
  return pointerKeys(pointer).reduce((path, k) => (/^\d+$/.test(k) ? `${path}[]` : path ? `${path}.${k}` : k), "");
}

/** The row for a value at `pointer` of a `collection` record: the one with the longest path that is the value's path or holds it; null for none. */
export function rowFor(collection: FigureCollection, pointer: string): FigureRow | null {
  const path = pathOf(pointer);
  let best: FigureRow | null = null;
  for (const row of FIGURE_RULES)
    if (row.collection === collection && (path === row.path || path.startsWith(`${row.path}.`) || path.startsWith(`${row.path}[]`)) && (!best || row.path.length > best.path.length)) best = row;
  return best;
}

/** A document's address without the part after "#": two links to one document at two places are one source. */
const documentOf = (url: string): string => url.replace(/#.*$/, "");

/** By rule id, the addresses of the sources its card under data/rules/ lists. */
export type CardSources = ReadonlyMap<string, readonly string[]>;

/** The addresses of the sources each rule card under the data folder lists, by rule id. */
export function cardSources(data: CheckData): CardSources {
  return new Map(
    [...ruleCards(data).values()].map((c) => {
      const sources = (c as { sources?: unknown }).sources;
      return [c.id, Array.isArray(sources) ? sources.flatMap((s) => (s && typeof (s as { url?: unknown }).url === "string" ? [(s as { url: string }).url] : [])) : []];
    }),
  );
}

/** What the table says of one id on one value: admitted, known and disallowed in this state, or unknown to the row. */
export type IdVerdict = "allowed" | "disallowed" | "unknown";

/** The verdict on `id` named by `value` at `pointer` of `record`. */
export function judgeId(collection: FigureCollection, record: Json, pointer: string, value: Json, id: string, cards: CardSources): IdVerdict {
  const row = rowFor(collection, pointer);
  const allow = row?.allow.filter((a) => a.id === id) ?? [];
  if (allow.length > 0) return allow.some((a) => !a.when || a.when(record, value)) ? "allowed" : "disallowed";
  if (row?.closed) return "unknown";
  const url = (value.source as Json | undefined)?.url;
  return typeof url === "string" && (cards.get(id) ?? []).some((u) => documentOf(u) === documentOf(url)) ? "allowed" : "unknown";
}

/** Each object inside `node` that names rule ids (a value object, a deposit's break), with its JSON pointer from `node`, in document order. */
export function ruleHolders(node: unknown): { pointer: string; value: Json; ids: string[] }[] {
  return objectsIn(node).flatMap(({ pointer, node: o }) => (Array.isArray(o.rule_ids) ? [{ pointer, value: o, ids: o.rule_ids.filter((x): x is string => typeof x === "string") }] : []));
}

/** One id a value names that the table does not admit: disallowed in the value's state, or unknown to its row. */
export interface FigureRuleProblem {
  pointer: string;
  id: string;
  verdict: Exclude<IdVerdict, "allowed">;
}

/** Every id the record's values name that the table does not admit, in document order. Run it on the snapshot the site reads. */
export function figureRuleProblems(collection: FigureCollection, record: unknown, cards: CardSources): FigureRuleProblem[] {
  if (!record || typeof record !== "object") return [];
  return ruleHolders(record).flatMap(({ pointer, value, ids }) =>
    ids.flatMap((id) => {
      const verdict = judgeId(collection, record as Json, pointer, value, id, cards);
      return verdict === "allowed" ? [] : [{ pointer, id, verdict }];
    }),
  );
}
