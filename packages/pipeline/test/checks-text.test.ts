// The text ratchets over the rule cards' titles and texts (src/checks/): each catches its flaw on planted cards and passes cards without
// it. Over the repository's own data/ they run in validate.test.ts, ratchet lists and all.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as dataFigures from "../src/checks/data-figures.ts";
import * as pointerWords from "../src/checks/pointer-words.ts";
import * as ruleTitles from "../src/checks/rule-titles.ts";
import { testData, type DataCheck } from "../src/checks/lib/kit.ts";
import { readTextLeftovers, textFlaws } from "../src/rule-text.ts";

function dataDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), JSON.stringify(content));
  }
  return dir;
}
const run = (check: DataCheck["check"], cards: Record<string, unknown>[]) => check(testData(dataDir(Object.fromEntries(cards.map((c) => [`rules/${String(c.id).toLowerCase()}.json`, c]))))).map((p) => p.message);
const vo = (value: number, unit: string) => ({ value, unit, source: { url: "https://x.il", title: "t", publisher: "p", strength: "primary" } });

describe("data-figures", () => {
  const rate = { id: "TXS-98", figures: { rate: vo(25, "pct"), ceiling: vo(83641, "nis"), days: vo(3, "days"), year: vo(2026, "year") } };
  it("fails a number another card holds as a figure, typed outside a slot", () => {
    expect(dataFigures.name).toBe("data-figures");
    expect(run(dataFigures.check, [rate, { id: "TXS-97", text_he: "המס הוא 25% מהרווח." }])).toEqual([expect.stringMatching(/^TXS-97 \(typed-data-figure\): "25%" equals a figure of 1 rule: TXS-98:rate; if the number is one of those figures/)]);
    expect(run(dataFigures.check, [rate, { id: "TXS-97", text_he: "התקרה היא 83,641 ₪." }])).toEqual([expect.stringMatching(/^TXS-97 \(typed-data-figure\): "83,641"/)]);
  });
  it("names the owners nearest the card first, and how many rules hold the number", () => {
    const etf = { id: "ETF-98", figures: { cap: vo(25, "pct") } };
    const fund = { id: "MF-98", figures: { cap: vo(25, "pct") } };
    const tax = { id: "TXK-98", figures: { rate: vo(25, "pct") } };
    const own = { id: "TXS-96", figures: { rate: vo(25, "pct") } };
    expect(run(dataFigures.check, [etf, fund, tax, own, { id: "TXS-97", text_he: "המס הוא 25% מהרווח." }])).toEqual([expect.stringContaining('"25%" equals a figure of 4 rules: TXS-96:rate, TXK-98:rate, ETF-98:cap, …;')]);
  });
  it("passes a slot, the card's own figure, a small count, a year and a longer number", () => {
    expect(run(dataFigures.check, [rate, { id: "TXS-97", text_he: "המס הוא {TXS-98:rate} מהרווח, תוך 3 ימים, מ־2026, ולא 125%." }])).toEqual([]);
    expect(run(dataFigures.check, [{ ...rate, text_he: "המס הוא 25% מהרווח." }])).toEqual([]);
  });
});

describe("pointer-words", () => {
  it("fails a card that points at a place around it, and passes a word that only holds one", () => {
    expect(pointerWords.name).toBe("pointer-words");
    expect(run(pointerWords.check, [{ id: "TXS-97", text_he: "השיעור שבטבלה חל כאן." }])).toEqual([expect.stringMatching(/^TXS-97 \(pointer-word\): "השיעור שבטבלה", "כאן"/)]);
    expect(run(pointerWords.check, [{ id: "TXS-97", title_he: "כמו במדריך" }])).toEqual([expect.stringMatching(/^TXS-97 \(pointer-word\): "במדריך"/)]);
    expect(run(pointerWords.check, [{ id: "TXS-97", text_he: "מכאן שהמס חל, והטבלאות של הרשות מפרטות." }])).toEqual([]);
  });
});

describe("rule-titles", () => {
  it("fails two cards with one title, whatever their quotation marks", () => {
    expect(ruleTitles.name).toBe("rule-titles");
    expect(run(ruleTitles.check, [{ id: "TXS-97", title_he: "מס על ״רווח״" }, { id: "TXS-98", title_he: 'מס  על "רווח"' }])).toEqual([
      expect.stringMatching(/^TXS-97 \(title-twin\): .* is also TXS-98's/),
      expect.stringMatching(/^TXS-98 \(title-twin\): .* is also TXS-97's/),
    ]);
  });
  it("fails a title that points back with a ditto, and passes a word that only holds one", () => {
    expect(run(ruleTitles.check, [{ id: "TXS-97", title_he: "באותו מסלול: המס" }])).toEqual([expect.stringMatching(/^TXS-97 \(title-ditto\): "באותו"/)]);
    expect(run(ruleTitles.check, [{ id: "TXS-97", title_he: "מס על אותות מסחר" }])).toEqual([]);
  });
});

describe("research talk", () => {
  it("catches the phrases that report how the site went over its sources", () => {
    const talk = readTextLeftovers();
    for (const phrase of ["סריקת רשומות", "נבדקו התשקיפים", "האתר לוקח", "האתר מחשב", "אף כלל שנקרא"])
      expect(textFlaws({ id: "TXS-97", text_he: `כך לפי ${phrase} של המקורות.` }, talk)).toHaveProperty("research-talk");
  });
});
