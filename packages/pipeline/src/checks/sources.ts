// What a rule card's sources say about themselves, on the records under data/rules/.
// - "source-title": the title a source line shows names the document. A line shows a source's title when it is written in Hebrew, else
//   its kind's word, else the link's host; a title that is a file name or a web address, or a host shown because the source has neither
//   a Hebrew title nor a kind (a figure's own source has no kind), names nothing. A figure's source is named from the record's own
//   source of the same document when it has one, so only a figure whose document the record does not cite is read. Keyed "<rule id>"
//   for the record's sources and "<rule id>#<figure key>" for a figure's.
// - "fixed-in-law-bill": a figure marked "fixed in law" on a record that cites a bill or a draft (a source's standing): the figure is
//   fixed by no law yet. Keyed "<rule id>".
// The entries still allowed each flaw are listed in leftovers/sources.json, and each list only shrinks.
import { isHebrewTitle } from "@finance-tool/schema";
import { z } from "zod";
import { isValueObject, objectsIn, readLeftovers, ruleCards, staleEntries, type CheckData, type CheckProblem, type Offence, type RuleCard } from "./lib/kit.ts";

export const name = "sources";

const FLAWS = ["source-title", "fixed-in-law-bill"] as const;
type Flaw = (typeof FLAWS)[number];
const leftovers = z.partialRecord(z.enum(FLAWS), z.array(z.string()));
const FILE = "sources.json";

/** A title that is a file's name ("deposit_rates.pdf") or a web address ("www.example.co.il"): it names no document. */
const FILE_NAME = /^\S+\.(?:pdf|xlsx?|csv|docx?|html?|aspx?|json|xml)$/i;
const WEB_ADDRESS = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:il|com|org|net|gov|eu|io)(?:\/\S*)?$/i;

interface SourceLike {
  url?: unknown;
  title?: unknown;
  title_he?: unknown;
  kind?: unknown;
  standing?: unknown;
}

/** What is wrong with the title a source line shows, or null: a file name, a web address, or a host shown in place of a title. */
function shownTitleFlaw(source: SourceLike): string | null {
  const title = typeof source.title_he === "string" ? source.title_he : typeof source.title === "string" ? source.title : "";
  if (FILE_NAME.test(title.trim())) return `its title "${title}" is a file's name`;
  if (WEB_ADDRESS.test(title.trim())) return `its title "${title}" is a web address`;
  if (!isHebrewTitle(title) && typeof source.kind !== "string") return `its title "${title}" is not Hebrew and it has no kind, so the line shows the link's host`;
  return null;
}

const sourcesOf = (card: RuleCard): SourceLike[] => {
  const list = (card as { sources?: unknown }).sources;
  return Array.isArray(list) ? (list as SourceLike[]) : [];
};

/** The value objects of a figure, each with its source. */
const figureValues = (figure: unknown) => objectsIn(figure).flatMap(({ node }) => (isValueObject(node) ? [node as { source: SourceLike; update_rule?: unknown }] : []));

/** The document a source's link opens: its address without the place in it. */
const documentOf = (source: SourceLike) => (typeof source.url === "string" ? (source.url.split("#")[0] ?? "") : "");

function titleOffences(cards: ReadonlyMap<string, RuleCard>): Map<string, Offence> {
  const found = new Map<string, Offence>();
  for (const card of cards.values()) {
    const cited = new Set(sourcesOf(card).map(documentOf));
    const own = sourcesOf(card).map(shownTitleFlaw).find((x) => x);
    if (own) found.set(card.id, { file: card.file, what: `a source's line names no document: ${own}`, fix: "write the document's Hebrew title in title_he, or give the source its kind" });
    for (const [key, figure] of Object.entries(card.figures ?? {})) {
      const flaw = figureValues(figure)
        .filter((v) => !cited.has(documentOf(v.source ?? {})))
        .map((v) => shownTitleFlaw(v.source ?? {}))
        .find((x) => x);
      if (flaw) found.set(`${card.id}#${key}`, { file: card.file, what: `the figure's source line names no document: ${flaw}`, fix: "write the document's Hebrew title in the figure's source title" });
    }
  }
  return found;
}

function billOffences(cards: ReadonlyMap<string, RuleCard>): Map<string, Offence> {
  const found = new Map<string, Offence>();
  for (const card of cards.values()) {
    const unpassed = sourcesOf(card).some((s) => s.standing === "bill" || s.standing === "draft");
    const fixed = Object.values(card.figures ?? {}).some((f) => figureValues(f).some((v) => v.update_rule === "fixed in law"));
    if (unpassed && fixed) found.set(card.id, { file: card.file, what: "a figure is marked fixed in law, and the record cites a bill or a draft", fix: "the rule base says what fixes the figure; a bill or a draft fixes nothing" });
  }
  return found;
}

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const lists = leftovers.parse(readLeftovers(FILE) ?? {});
  const found: Record<Flaw, Map<string, Offence>> = { "source-title": titleOffences(cards), "fixed-in-law-bill": billOffences(cards) };
  const out: CheckProblem[] = [];
  for (const flaw of FLAWS) {
    const listed = lists[flaw] ?? [];
    for (const [entry, o] of found[flaw]) if (!listed.includes(entry)) out.push({ file: o.file, message: `${entry} (${flaw}): ${o.what}; ${o.fix}` });
    const record = (entry: string) => {
      const [id = "", key] = entry.split("#");
      const card = cards.get(id);
      return !!card && (key === undefined || key in (card.figures ?? {}));
    };
    for (const message of staleEntries(listed, data, record, (entry) => found[flaw].has(entry), () => ({ file: `leftovers/${FILE}`, list: flaw }))) out.push({ file: data.dataDir, message });
  }
  return out;
}
