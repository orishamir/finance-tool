// Three checks on the deposit records the site reads (the latest snapshot of each, data/terms/deposits/), each a ratchet whose entries are
// listed in leftovers/deposits.json under its name, keyed "terms/deposits/<record id>#<pointer>", and only shrink:
// - "doubt-field": a doubt that names no rate (no "ריבית", "שיעור" or percent figure) and has no doubt_on is about another field, and a
//   page would draw it beside the rate (data-schema §3.7: absent doubt_on means the rate);
// - "site-remark": conditions_he holds the bank's printed conditions only; a remark of the site's ("האתר", "לא ברור", "לא כתוב אם")
//   is a doubt, and goes in doubt_he, where the page marks the figure;
// - "current-account": a current account carries none of a deposit's fields: no term, no days, no exit points, no renewal and no
//   break penalty, since its page leaves those lines out (BANK-09 is its rule).
import { z } from "zod";
import { latestRecords, readLeftovers, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "deposits";

const LISTS = ["doubt-field", "site-remark", "current-account"] as const;
type List = (typeof LISTS)[number];
const LEFTOVERS = "deposits.json";
const leftoversFile = z.partialRecord(z.enum(LISTS), z.array(z.string()));

/** Words that name a rate: a doubt about the rate says one of them. */
const NAMES_RATE = /ריבית|שיעור|\d%/;
/** A remark of the site's own, not a condition the bank prints. */
const SITE_REMARK = /האתר|לא ברור|לא כתוב אם/;

/** The record as these checks read it. */
interface Deposit {
  wrapper_id?: string;
  doubt_he?: string;
  doubt_on?: string;
  conditions_he?: string;
  term_months?: { value?: unknown };
  term_days?: unknown;
  exit_points?: { exists?: boolean };
  auto_renew?: { value?: boolean };
  break?: { penalty?: string };
}

/** The deposit fields a current account holds, each with what is wrong. */
function depositFields(d: Deposit): string[] {
  return [
    ...(d.term_months?.value !== null && d.term_months?.value !== undefined ? ["a term"] : []),
    ...(d.term_days !== undefined ? ["a term in days"] : []),
    ...(d.exit_points?.exists ? ["exit points"] : []),
    ...(d.auto_renew?.value ? ["a renewal"] : []),
    ...(d.break?.penalty !== undefined && d.break.penalty !== "none" ? [`a break "${d.break.penalty}"`] : []),
  ];
}

export function check(data: CheckData): CheckProblem[] {
  const listed = leftoversFile.parse(readLeftovers(LEFTOVERS) ?? {});
  const out: CheckProblem[] = [];
  const found = new Map<List, Set<string>>(LISTS.map((l) => [l, new Set<string>()]));
  const records = new Set<string>();
  const offend = (list: List, at: string, file: string, message: string) => {
    found.get(list)?.add(at);
    if (!listed[list]?.includes(at)) out.push({ file, message: `${at} (${list}): ${message}` });
  };
  for (const { key, file, record } of latestRecords(data, "terms/deposits")) {
    records.add(key);
    const d = (record ?? {}) as Deposit;
    if (d.doubt_he && !d.doubt_on && !NAMES_RATE.test(d.doubt_he)) offend("doubt-field", `${key}#/doubt_he`, file, "the doubt names no rate, so it is about another field: say which in doubt_on, or word it about the rate it doubts");
    if (d.conditions_he && SITE_REMARK.test(d.conditions_he)) offend("site-remark", `${key}#/conditions_he`, file, "the conditions hold a remark of the site's own: move it to doubt_he, leaving the bank's printed conditions");
    if (d.wrapper_id === "current-account") {
      const fields = depositFields(d);
      if (fields.length) offend("current-account", `${key}#`, file, `a current account holds ${fields.join(", ")}: a deposit's field, which its page leaves out`);
    }
  }
  for (const list of LISTS)
    for (const message of staleEntries(
      listed[list] ?? [],
      data,
      (entry) => records.has(entry.split("#")[0] ?? ""),
      (entry) => found.get(list)?.has(entry) ?? false,
      () => ({ file: `leftovers/${LEFTOVERS}`, list }),
    ))
      out.push({ file: data.dataDir, message });
  return out;
}
