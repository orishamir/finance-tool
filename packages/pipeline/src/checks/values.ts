// What a value's sheet needs from the value itself, on the records the site reads (the latest snapshot) of the collections the collectors
// write. Four checks, each its own list:
// - `empty-because`: a sourced value that is empty says why (`empty_because`, data-schema §1), so a page words each state apart.
// - `publisher`: a value read from a portal that serves many publishers (data.gov.il, gov.il, TASE's API) names its
//   publisher itself (`source.publisher_he`), since the link's host names none.
// - `machine-url`: `source.url` is a page a reader can open and read; the machine address a collector read (an API's JSON, a CSV, an XML
//   feed, a spreadsheet file) goes in `source.fetched_from`, and `url` takes the page the data-update skill finds.
// - `notes-he`: a value whose note is English working text carries `notes_he`, the line its sheet shows, since the sheet never shows an
//   English note. A script cannot tell a limit a reader needs from other working text, so every English note without one is listed; a
//   person writes `notes_he` where the note carries a limit.
// A value still allowed a flaw is listed in leftovers/values/<check>/<collection>.json, keyed "<collection>/<record id>#<pointer to the
// value>" so the next dated snapshot keeps the key, and each list only shrinks.
import { mostlyHebrew } from "@finance-tool/schema";
import { z } from "zod";
import { hostOf, isValueObject, latestRecords, objectsIn, readLeftovers, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "values";

/** The collections whose values these checks hold. */
export const VALUE_COLLECTIONS = ["cma", "series"] as const;

/** Hosts that serve many publishers' data, so a source there names its publisher itself (as `hostOf` writes a host). */
export const SHARED_PORTAL_HOSTS: ReadonlySet<string> = new Set(["data.gov.il", "gov.il", "api.tase.co.il"]);

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
}

/** The value checks: each one's name, what it finds wrong in one value (null when nothing), and how to fix it. */
const CHECKS = [
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
] as const;

/** The file that keeps a check's leftovers for a collection, under leftovers/. */
export const valuesFile = (check: string, collection: string): string => `values/${check}/${collection.replace(/\//g, "-")}.json`;
const listFile = z.array(z.string());

export function check(data: CheckData): CheckProblem[] {
  const out: CheckProblem[] = [];
  for (const collection of VALUE_COLLECTIONS) {
    const records = latestRecords(data, collection);
    const values = records.flatMap((r) => objectsIn(r.record).flatMap(({ pointer, node }) => (isValueObject(node) ? [{ key: `${r.key}#${pointer}`, file: r.file, node }] : [])));
    const keys = new Set(records.map((r) => r.key));
    for (const c of CHECKS) {
      const file = valuesFile(c.check, collection);
      const listed = listFile.parse(readLeftovers(file) ?? []);
      const found = new Set<string>();
      for (const v of values) {
        const what = c.flaw(v.node);
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
