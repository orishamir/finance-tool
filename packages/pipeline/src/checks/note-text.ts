// The notes a value's sheet shows (@finance-tool/schema, note-text.ts): every value note written in Hebrew and every deposit's doubt_he, on
// the record the site reads (the latest snapshot), checked by noteFlaws. A note still allowed a flaw is listed under it, keyed
// "<collection>/<record id>#<pointer to the text>" so the next dated snapshot keeps the key: a rule card's notes in its group's file,
// leftovers/rules/<group>.json, under "notes/<flaw>", and every other collection's in leftovers/notes/<collection>.json. Each list only
// shrinks.
import { mostlyHebrew, NOTE_FLAWS, noteFlaws, type NoteFlaw } from "@finance-tool/schema";
import { z } from "zod";
import { readPhrases } from "../rule-text.ts";
import { isValueObject, latestRecords, objectsIn, readLeftovers, readRuleList, ruleCards, ruleListFile, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "note-text";

/** The collections whose records carry shown notes, besides data/rules. */
const NOTE_COLLECTIONS = ["fees", "funds", "instruments", "averages", "terms/deposits", "cma", "series"] as const;

/** The file that keeps a collection's note leftovers, under leftovers/. */
const notesFile = (collection: string) => `notes/${collection.replace(/\//g, "-")}.json`;
/** A collection's note leftovers: by flaw, the keys still allowed it. */
const listsFile = z.partialRecord(z.enum(NOTE_FLAWS), z.array(z.string()));

/** One shown note: its key, the file it is in and its text, with the titles of the rules its value names. */
interface ShownNote {
  key: string;
  file: string;
  text: string;
  chipTitles: string[];
}

/** The shown notes of one record: each value note written in Hebrew, and its doubt_he. */
function shownNotes(key: string, file: string, record: unknown, titleOf: (id: string) => string | undefined): ShownNote[] {
  return objectsIn(record).flatMap(({ pointer, node }) => {
    const out: ShownNote[] = [];
    if (isValueObject(node) && typeof node.notes === "string" && mostlyHebrew(node.notes)) {
      const ids = Array.isArray(node.rule_ids) ? node.rule_ids.filter((id): id is string => typeof id === "string") : [];
      out.push({ key: `${key}#${pointer}/notes`, file, text: node.notes, chipTitles: ids.flatMap((id) => titleOf(id) ?? []) });
    }
    if (typeof node.doubt_he === "string") out.push({ key: `${key}#${pointer}/doubt_he`, file, text: node.doubt_he, chipTitles: [] });
    return out;
  });
}

export function check(data: CheckData): CheckProblem[] {
  const talk = readPhrases().research_talk;
  const cards = ruleCards(data);
  const titleOf = (id: string) => cards.get(id)?.title_he;
  const out: CheckProblem[] = [];
  /** Each place's notes and leftovers: data/rules first, then each collection. */
  const places = [
    {
      notes: [...cards.values()].flatMap((card) => shownNotes(card.id, card.file, card, titleOf)),
      records: new Set(cards.keys()),
      lists: Object.fromEntries(NOTE_FLAWS.map((flaw) => [flaw, readRuleList(`notes/${flaw}`)])) as Partial<Record<NoteFlaw, string[]>>,
      list: (flaw: NoteFlaw) => `notes/${flaw}`,
      where: (entry: string, flaw: NoteFlaw) => ({ file: ruleListFile(entry), list: `notes/${flaw}` }),
    },
    ...NOTE_COLLECTIONS.map((collection) => {
      const records = latestRecords(data, collection);
      return {
        notes: records.flatMap((r) => shownNotes(r.key, r.file, r.record, titleOf)),
        records: new Set(records.map((r) => r.key)),
        lists: listsFile.parse(readLeftovers(notesFile(collection)) ?? {}),
        list: (flaw: NoteFlaw) => flaw,
        where: (_entry: string, flaw: NoteFlaw) => ({ file: `leftovers/${notesFile(collection)}`, list: flaw }),
      };
    }),
  ];
  for (const place of places) {
    const found = new Map<NoteFlaw, Set<string>>(NOTE_FLAWS.map((flaw) => [flaw, new Set<string>()]));
    for (const note of place.notes)
      for (const [flaw, what] of Object.entries(noteFlaws(note.text, { talk, chipTitles: note.chipTitles })) as [NoteFlaw, string][]) {
        found.get(flaw)?.add(note.key);
        if (!place.lists[flaw]?.includes(note.key)) out.push({ file: note.file, message: `${note.key} (${place.list(flaw)}): ${what}; a shown note says what the figure needs in a few plain words` });
      }
    for (const flaw of NOTE_FLAWS)
      for (const message of staleEntries(
        place.lists[flaw] ?? [],
        data,
        (entry) => place.records.has(entry.split("#")[0] ?? ""),
        (entry) => found.get(flaw)?.has(entry) ?? false,
        (entry) => place.where(entry, flaw),
      ))
        out.push({ file: data.dataDir, message });
  }
  return out;
}
