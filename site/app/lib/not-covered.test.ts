// The "not covered yet" page lists only what the site truly lacks, in words (docs/copy.md section 7). Founder, 2026-11-07:
// "we dont know עמלת חליפין?" — the page listed the exchange fee as unknown while the securities account guide explains it,
// showed a bare rule code where a question should be, and closed with fragments. These guards fail when an entry listed
// there is covered elsewhere, when a card is not a kind of holding of product D2, or when a blocker or closure would show
// as a code.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tier2Table } from "./compare.server";
import { loadNotCovered, root } from "./data.server";
import { graduationStatuses, notCoveredCards } from "./graduation.server";
import { r5 } from "../copy";

type TermRow = { id: string; he: string; variants?: string[]; wrapper_ids?: string[]; exposure_ids?: string[] };
const terms: TermRow[] = readdirSync(join(root, "data/terms"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(root, "data/terms", f), "utf8")) as TermRow);
const covered = terms.filter((t) => (t.wrapper_ids?.length ?? 0) + (t.exposure_ids?.length ?? 0) > 0);
const coveredNames = new Map<string, string>();
for (const t of covered) for (const n of [t.he, ...(t.variants ?? [])]) coveredNames.set(n.trim(), t.id);
// a product or exposure with a page of its own is covered by its every name, even one no glossary row carries ("גמל IRA",
// "מזומן בשקלים"): independent check of glossary round 2, 2026-11-07
for (const dir of ["wrappers", "securities", "exposures"])
  for (const f of readdirSync(join(root, "data/instruments", dir)).filter((x) => x.endsWith(".json"))) {
    const rec = JSON.parse(readFileSync(join(root, "data/instruments", dir, f), "utf8")) as { id: string; names?: { he?: string[] } };
    for (const n of rec.names?.he ?? []) coveredNames.set(n.trim(), `page ${rec.id}`);
  }

const questions = new Map(
  (JSON.parse(readFileSync(join(root, "data/open-questions.json"), "utf8")) as { id: string; status: string; title_he?: string }[]).map((q) => [q.id, q]),
);
// a rule id (TX2-17, MF-28) or a question code (MGD OQ2) typed where words belong
const ID = /\b[A-Z]{2,4}\d?(?:-\d{2}|[ -]OQ\d+)\b/;

describe("the not-covered page lists only what the site lacks", () => {
  const cards = notCoveredCards();

  it("has one card per tier-2 kind of holding of product D2, and nothing else", () => {
    expect(cards.map((c) => c.status.id)).toEqual(tier2Table.map((t) => t.id));
  });

  it("lists no card whose name or other name is a term a covered page explains", () => {
    const clash = cards.flatMap((c) => [c.row.he, ...c.row.variants].filter((n) => coveredNames.has(n)).map((n) => `${c.status.id}: ${n} (${coveredNames.get(n)})`));
    expect(clash).toEqual([]);
  });

  it("keeps no glossary row of the tier-2 section under a name a covered row has (the exchange fee was both)", () => {
    const clash = loadNotCovered().flatMap((r) => [r.he, ...r.variants].filter((n) => coveredNames.has(n)).map((n) => `${r.he}: ${n} (${coveredNames.get(n)})`));
    expect(clash).toEqual([]);
  });

  it("names every blocker as an open question with its words, never a rule or a closed question", () => {
    const bad: string[] = [];
    for (const s of graduationStatuses())
      for (const o of s.open) {
        const q = questions.get(o.code);
        if (!q) bad.push(`${s.id}: ${o.code} is not a question in data/open-questions.json`);
        else if (q.status === "closed") bad.push(`${s.id}: ${o.code} is closed`);
        else if (!q.title_he) bad.push(`${s.id}: ${o.code} has no title_he, so the page would show its code`);
      }
    expect(bad).toEqual([]);
  });

  it("says every closure with a question in words", () => {
    const bare = graduationStatuses().flatMap((s) => s.closed.filter((c) => c.code && !questions.get(c.code)?.title_he).map((c) => `${s.id}: ${c.code}`));
    expect(bare).toEqual([]);
  });

  // a fresh reader, 2026-11-07: "שאלה נסגרה ב־24.10.2026, לפי" named no question. A closure the rule base records without a question
  // number is named by the card's entry in closureTopics, and an entry no such closure uses goes
  it("names every closure without a question number in words, and keeps no topic it does not use", () => {
    const topics = r5.graduation.closureTopics;
    const statuses = graduationStatuses();
    expect(statuses.filter((s) => s.closed.some((c) => !c.code) && !topics[s.id]).map((s) => s.id)).toEqual([]);
    expect(Object.keys(topics).filter((id) => !statuses.some((s) => s.id === id && s.closed.some((c) => !c.code)))).toEqual([]);
  });

  // the same reader: source titles ended in "…" ("ינואר…", "נוסח מש…"), cut by the glossary generator; the page shows them whole
  it("shows every card's source title whole", () => {
    expect(cards.filter((c) => c.row.source?.title.endsWith("…")).map((c) => `${c.status.id}: ${c.row.source!.title}`)).toEqual([]);
  });

  it("shows no bare code in a card's own words", () => {
    const coded = cards.flatMap((c) => [c.row.he, c.row.explanation, ...c.row.variants].filter((t) => ID.test(t)).map((t) => `${c.status.id}: ${t}`));
    expect(coded).toEqual([]);
  });
});
