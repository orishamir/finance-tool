// What a value's sheet needs from the value itself, on the records the site reads (the latest snapshot) of the collections that hold
// values: the collectors' (data/cma, data/series) and the hand-collected ones (fees, funds, products, averages, deposit terms). Six checks,
// each its own list:
// - `empty-because`: a sourced value that is empty says why (`empty_because`, data-schema §1), so a page words each state apart.
// - `publisher`: a value read from a portal that serves many publishers (data.gov.il, gov.il, TASE's API) names its
//   publisher itself (`source.publisher_he`), since the link's host names none.
// - `machine-url`: `source.url` is a page a reader can open and read; the machine address a collector read (an API's JSON, a CSV, an XML
//   feed, a spreadsheet file) goes in `source.fetched_from`, and `url` takes the page the data-update skill finds.
// - `notes-he`: a value whose note is English working text carries `notes_he`, the line its sheet shows, since the sheet never shows an
//   English note. A script cannot tell a limit a reader needs from other working text, so every English note without one is listed; a
//   person writes `notes_he` where the note carries a limit.
// - `copies-card`: the note a value's sheet shows does not largely repeat the text of a rule the same sheet shows as a chip, since the
//   chip opens that text; the note says only what is true of this value beyond it.
// - `quote-differs`: a value carries one quote. A `quote` beside `source.quote` that says something else leaves the sheet to pick one,
//   and the other is lost; the source's words are `source.quote`.
// A value still allowed a flaw is listed in leftovers/values/<check>/<collection>.json, keyed "<collection>/<record id>#<pointer to the
// value>" so the next dated snapshot keeps the key, and each list only shrinks.
import { mostlyHebrew } from "@finance-tool/schema";
import { z } from "zod";
import { hostOf, isValueObject, latestRecords, objectsIn, readLeftovers, ruleCards, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "values";

/** The collections whose values these checks hold. */
export const VALUE_COLLECTIONS = ["cma", "series", "fees", "funds", "instruments", "averages", "terms/deposits"] as const;

/** Hosts that serve many publishers' data, so a source there names its publisher itself (as `hostOf` writes a host). */
const SHARED_PORTAL_HOSTS: ReadonlySet<string> = new Set(["data.gov.il", "gov.il", "api.tase.co.il"]);

/**
 * True when `url` is an address a program reads rather than a page a person reads: a JSON, CSV, XML or spreadsheet file, an API host or
 * path, a file download, or a query that asks for one of those formats.
 */
export function isMachineUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (/\.(?:json|csv|xml|xlsx?)$/i.test(u.pathname)) return true;
  if (/^(?:api|data-api)\./i.test(u.hostname)) return true;
  if (/\/(?:api|odata|download)\/|\/service\/data\//i.test(u.pathname)) return true;
  return /^(?:json|csv|csvdata|xml)$/i.test(u.searchParams.get("format") ?? "");
}

interface Source {
  url?: unknown;
  publisher_he?: unknown;
  fetched_from?: unknown;
  quote?: unknown;
}

/** The note a value's sheet shows: its Hebrew note, or its note when that is written in Hebrew; null for none. */
function shownNote(v: Record<string, unknown>): string | null {
  if (typeof v.notes_he === "string" && v.notes_he.trim() !== "") return v.notes_he;
  return typeof v.notes === "string" && mostlyHebrew(v.notes) ? v.notes : null;
}

/** A text's words, without punctuation, quotation marks or gershayim, so a word reads the same in a note and in a card. */
const wordsOf = (text: string): string[] => text.replace(/[״׳"'“”„()[\],.;:!?{}]/g, " ").split(/\s+/).filter((w) => w !== "");
/** The runs of three words in a row a text holds, each as one string. */
const triples = (words: readonly string[]): string[] => words.slice(2).map((_, i) => words.slice(i, i + 3).join(" "));
/** A note shorter than this many words says too little to be a copy of a card. */
const COPY_MIN_WORDS = 6;
/** The share of a note's runs of three words found in a card's text at which the note repeats the card. */
const COPY_SHARE = 0.5;

/**
 * True when `note` largely repeats `text`: at least half of its runs of three words stand in the text as they are. A note shorter than
 * six words is never a copy.
 */
export function copiesText(note: string, text: string): boolean {
  const words = wordsOf(note);
  if (words.length < COPY_MIN_WORDS) return false;
  const inText = new Set(triples(wordsOf(text)));
  const runs = triples(words);
  return runs.filter((r) => inText.has(r)).length / runs.length >= COPY_SHARE;
}

/** What the value checks read beside the value: each rule card's id and Hebrew text. */
interface ValueContext {
  cardText: ReadonlyMap<string, string>;
}

/** One value check: its name, what it finds wrong in one value (null when nothing), and how to fix it. */
interface ValueCheck {
  check: string;
  flaw: (v: Record<string, unknown>, ctx: ValueContext) => string | null;
  fix: string;
}

/** The value checks. */
const CHECKS: readonly ValueCheck[] = [
  {
    check: "empty-because",
    flaw: (v: Record<string, unknown>) => (v.value === null && v.state === "sourced" && v.empty_because === undefined ? "a sourced value is empty and does not say why" : null),
    fix: "write empty_because (data-schema §1) where the collector writes the value",
  },
  {
    check: "publisher",
    flaw: (v: Record<string, unknown>) => {
      const s = v.source as Source;
      const shared = [hostOf(s.url), hostOf(s.fetched_from)].find((h) => SHARED_PORTAL_HOSTS.has(h));
      return shared && typeof s.publisher_he !== "string" ? `the source is on ${shared}, which serves many publishers, and names none` : null;
    },
    fix: "write source.publisher_he, the body that publishes the data, never the portal",
  },
  {
    check: "machine-url",
    flaw: (v: Record<string, unknown>) => {
      const url = (v.source as Source).url;
      return typeof url === "string" && isMachineUrl(url) ? `source.url ${url} is a machine address, not a page a reader opens` : null;
    },
    fix: "keep that address in source.fetched_from and put in url the page the data-update skill finds; where none is found, leave it listed",
  },
  {
    check: "notes-he",
    flaw: (v: Record<string, unknown>) =>
      typeof v.notes === "string" && v.notes.trim() !== "" && !mostlyHebrew(v.notes) && typeof v.notes_he !== "string" ? "the note is English working text and the value has no notes_he" : null,
    fix: "where the note carries a limit a reader needs, write it in notes_he",
  },
  {
    check: "copies-card",
    flaw: (v: Record<string, unknown>, ctx: ValueContext) => {
      const note = shownNote(v);
      const ids = Array.isArray(v.rule_ids) ? v.rule_ids.filter((x): x is string => typeof x === "string") : [];
      const copied = note === null ? undefined : ids.find((id) => copiesText(note, ctx.cardText.get(id) ?? ""));
      return copied ? `the note the sheet shows largely repeats the card of ${copied}, which the sheet shows as a chip` : null;
    },
    fix: "keep in the note only what is true of this value beyond the card, or drop it",
  },
  {
    check: "quote-differs",
    flaw: (v: Record<string, unknown>) => {
      const own = v.quote;
      const source = (v.source as Source).quote;
      return typeof own === "string" && typeof source === "string" && own.trim() !== source.trim() ? "the value's quote and its source's quote say different things" : null;
    },
    fix: "keep the source's words in source.quote alone",
  },
];

/** The file that keeps a check's leftovers for a collection, under leftovers/ ("terms/deposits" one folder down). */
export const valuesFile = (check: string, collection: string): string => `values/${check}/${collection}.json`;
const listFile = z.array(z.string());

export function check(data: CheckData): CheckProblem[] {
  const out: CheckProblem[] = [];
  const ctx: ValueContext = { cardText: new Map([...ruleCards(data).values()].flatMap((c) => (typeof c.text_he === "string" ? [[c.id, c.text_he] as const] : []))) };
  for (const collection of VALUE_COLLECTIONS) {
    const records = latestRecords(data, collection);
    const values = records.flatMap((r) => objectsIn(r.record).flatMap(({ pointer, node }) => (isValueObject(node) ? [{ key: `${r.key}#${pointer}`, file: r.file, node }] : [])));
    const keys = new Set(records.map((r) => r.key));
    for (const c of CHECKS) {
      const file = valuesFile(c.check, collection);
      const listed = listFile.parse(readLeftovers(file) ?? []);
      const found = new Set<string>();
      for (const v of values) {
        const what = c.flaw(v.node, ctx);
        if (what === null) continue;
        found.add(v.key);
        if (!listed.includes(v.key)) out.push({ file: v.file, message: `${v.key} (${c.check}): ${what}; ${c.fix}` });
      }
      for (const message of staleEntries(
        listed,
        data,
        (entry) => keys.has(entry.split("#")[0] ?? ""),
        (entry) => found.has(entry),
        () => ({ file: `leftovers/${file}`, list: c.check }),
      ))
        out.push({ file: data.dataDir, message });
    }
  }
  return out;
}
