// The flaws of a shown note (@finance-tool/schema, note-text.ts), each caught on a planted note and left alone on one without it, and the
// data check that runs them over the notes in data/ (src/checks/note-text.ts).
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { noteFlaws } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import * as noteText from "../src/checks/note-text.ts";
import { testData } from "../src/checks/lib/kit.ts";
import { readPhrases } from "../src/rule-text.ts";

const talk = readPhrases().research_talk;

describe("noteFlaws", () => {
  it("passes a short plain note", () => {
    expect(noteFlaws("הממוצע הוא של שנת 2025, לקרן כולה.", { talk })).toEqual({});
  });
  it("finds a rule's code typed as text, and not an open question or a formula", () => {
    expect(noteFlaws("לפי CAT-44 החשיפה כוללת.")).toEqual({ "bare-id": "CAT-44" });
    expect(noteFlaws("היחידה נלמדת מהשוואה (CAT OQ4), לפי F-87.")).toEqual({});
    expect(noteFlaws("ההנחה נמשכת {PF-13:months} חודשים.")).toEqual({});
  });
  it("finds words about the site's own search, and lets a document say what it does not set", () => {
    expect(noteFlaws("חיפשנו את השיעור בתעריפון.", { talk })).toEqual({ "research-talk": '"חיפשנו"' });
    expect(noteFlaws("השיעור לא נקרא.", { talk })).toEqual({ "research-talk": '"לא נקרא"' });
    expect(noteFlaws("הסריקה נרשמה ביום אחר.", { talk })).toEqual({ "research-talk": '"נרשמה"' });
    expect(noteFlaws("החוזר לא קובע אם ההשקעה דרך קרן נספרת.", { talk })).toEqual({});
    expect(noteFlaws("התקנון לא מציין מועד, והתעריפון לא אומר כמה.", { talk })).toEqual({});
  });
  it("finds the title of a rule the sheet already shows as a chip, whatever its quotation marks", () => {
    expect(noteFlaws("כך לפי ״דמי ניהול מרביים״ בקרן.", { chipTitles: ['דמי ניהול מרביים'] })).toEqual({ "chip-title": '"דמי ניהול מרביים"' });
    expect(noteFlaws("שיעור אחר בקרן.", { chipTitles: ["דמי ניהול מרביים"] })).toEqual({});
  });
  it("finds a date written year first, and not the site's own dates or a circular's number", () => {
    expect(noteFlaws("המחיר מ־2026-10 בתעריפון.")).toEqual({ "machine-date": "2026-10" });
    expect(noteFlaws("המחיר מ־31.10.2026, לפי חוזר 2015-9-9 ומכתב 2016-19364.")).toEqual({});
  });
  it("finds three Latin words in a row, and not a name of two", () => {
    expect(noteFlaws("השיעור לפי the annual report בקרן.")).toEqual({ latin: '"the annual report"' });
    expect(noteFlaws("השיעור לפי S&P 500 בקרן.")).toEqual({});
  });
  it("finds a note that opens with a quotation mark", () => {
    expect(Object.keys(noteFlaws("״0.02% מהשווי״ לפי הדוח."))).toEqual(["quote-mark"]);
    expect(noteFlaws("לפי הדוח, ״0.02% מהשווי״.")).toEqual({});
  });
  it("finds a note of more than three sentences", () => {
    expect(noteFlaws("אחד. שניים. שלושה.")).toEqual({});
    expect(noteFlaws("אחד. שניים. שלושה. ארבעה.")).toEqual({ "too-long": "4 sentences" });
  });
});

describe("the notes in data/", () => {
  const vo = (notes: string, rule_ids: string[] = []) => ({ value: 1, unit: "pct", source: { url: "https://x.il", title: "t", publisher: "p", strength: "primary" }, notes, rule_ids });
  function dataDir(files: Record<string, unknown>): string {
    const dir = mkdtempSync(join(tmpdir(), "data-"));
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(join(dir, path, ".."), { recursive: true });
      writeFileSync(join(dir, path), JSON.stringify(content));
    }
    return dir;
  }
  it("checks each shown note and doubt on the latest snapshot, keyed by record and pointer, and passes an English working note", () => {
    const dir = dataDir({
      "fees/zz-house@2026-01-01.json": { a: vo("חיפשנו ולא מצאנו.") },
      "fees/zz-house@2026-02-01.json": { a: vo("החשיפה כוללת לפי CAT-44."), b: vo("Read on p. 3 of the tariff, CAT-44.") },
      "terms/deposits/zz-dep.json": { doubt_he: "2026-10 הוא התאריך." },
      "rules/txs-98.json": { id: "TXS-98", title_he: "כותרת הכלל", figures: { rate: vo("״ציטוט״ מהחוק.") } },
    });
    const messages = noteText.check(testData(dir)).map((p) => p.message);
    expect(noteText.name).toBe("note-text");
    expect(messages).toEqual([
      expect.stringMatching(/^TXS-98#\/figures\/rate\/notes \(notes\/quote-mark\): /),
      expect.stringMatching(/^fees\/zz-house#\/a\/notes \(bare-id\): CAT-44; /),
      expect.stringMatching(/^terms\/deposits\/zz-dep#\/doubt_he \(machine-date\): 2026-10; /),
    ]);
  });
  it("finds a note that repeats the title of a rule its value names", () => {
    const dir = dataDir({ "rules/txs-98.json": { id: "TXS-98", title_he: "כותרת הכלל" }, "fees/zz-house.json": { a: vo("כותרת הכלל, בקצרה.", ["TXS-98"]) } });
    expect(noteText.check(testData(dir)).map((p) => p.message)).toEqual([expect.stringMatching(/^fees\/zz-house#\/a\/notes \(chip-title\): "כותרת הכלל"/)]);
  });
});
