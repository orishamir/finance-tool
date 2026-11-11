// The "not covered yet" page lists only what the site truly lacks, in words (docs/copy.md section 7): never a term a
// guide explains (the exchange fee), a bare rule code where a question should be, or fragments. These guards fail when an entry listed
// there is covered elsewhere, when a card is not a kind of holding of product D2, or when a blocker or closure would show
// as a code.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tier2Table } from "./compare.server";
import { loadNotCovered, root } from "./data.server";
import { graduationStatuses, notCoveredCards } from "./graduation.server";
import { notCovered } from "../copy";
import { loader } from "../routes/not-covered";

type TermRow = { id: string; he: string; variants?: string[]; wrapper_ids?: string[]; exposure_ids?: string[] };
const terms: TermRow[] = readdirSync(join(root, "data/terms"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(root, "data/terms", f), "utf8")) as TermRow);
const covered = terms.filter((t) => (t.wrapper_ids?.length ?? 0) + (t.exposure_ids?.length ?? 0) > 0);
const coveredNames = new Map<string, string>();
for (const t of covered) for (const n of [t.he, ...(t.variants ?? [])]) coveredNames.set(n.trim(), t.id);
// a product or exposure with a page of its own is covered by its every name, even one no glossary row carries ("גמל IRA",
// "מזומן בשקלים")
for (const dir of ["wrappers", "securities", "exposures"])
  for (const f of readdirSync(join(root, "data/instruments", dir)).filter((x) => x.endsWith(".json"))) {
    const rec = JSON.parse(readFileSync(join(root, "data/instruments", dir, f), "utf8")) as { id: string; names?: { he?: string[] } };
    for (const n of rec.names?.he ?? []) coveredNames.set(n.trim(), `page ${rec.id}`);
  }

const questions = new Map(
  (JSON.parse(readFileSync(join(root, "data/open-questions.json"), "utf8")) as { id: string; title_he?: string }[]).map((q) => [q.id, q]),
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

  it("names every blocker as an open question with its words, never a rule or a question the rule base no longer has", () => {
    const bad: string[] = [];
    for (const s of graduationStatuses())
      for (const o of s.open) {
        const q = questions.get(o.code);
        if (!q) bad.push(`${s.id}: ${o.code} is not a question in data/open-questions.json`);
        else if (!q.title_he) bad.push(`${s.id}: ${o.code} has no title_he, so the page would show its code`);
      }
    expect(bad).toEqual([]);
  });

  // "שאלה נסגרה ב־24.10.2026, לפי" named no question. Every answered question is named by its entry in
  // answeredTopics (by the row and the closure's rules: an answered question is deleted from the rule base), and an
  // entry no closure uses goes
  it("names every answered question in words, and keeps no topic it does not use", () => {
    const topics = notCovered.answeredTopics;
    const statuses = graduationStatuses();
    const keys = statuses.flatMap((s) => s.closed.map((c) => `${s.id}: ${c.ruleIds.join(" ")}`));
    expect(keys.filter((k) => { const [id, rules] = k.split(": ") as [string, string]; return !topics[id]?.[rules]; })).toEqual([]);
    expect(Object.entries(topics).flatMap(([id, byRules]) => Object.keys(byRules).map((r) => `${id}: ${r}`)).filter((k) => !keys.includes(k))).toEqual([]);
  });

  // the same reader: source titles ended in "…" ("ינואר…", "נוסח מש…"), cut by the glossary generator; the page shows them whole
  it("shows every card's source title whole", () => {
    expect(cards.filter((c) => c.row.source?.title.endsWith("…")).map((c) => `${c.status.id}: ${c.row.source!.title}`)).toEqual([]);
  });

  it("shows no bare code in a card's own words", () => {
    const coded = cards.flatMap((c) => [c.row.he, c.row.explanation, ...c.row.variants].filter((t) => ID.test(t)).map((t) => `${c.status.id}: ${t}`));
    expect(coded).toEqual([]);
  });

  // the row's line says why there is no guide yet in the question's own words; the page never shows a code for it
  it("gives every open question of every row its words on the page", async () => {
    const data = (await loader()) as { cards: { status: { id: string; open: { code: string }[] } }[]; titles: Record<string, string> };
    const missing = data.cards.flatMap((c) => c.status.open.filter((o) => !data.titles[o.code] || ID.test(data.titles[o.code]!)).map((o) => `${c.status.id}: ${o.code}`));
    expect(missing).toEqual([]);
  });
});
