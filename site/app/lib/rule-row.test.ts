import { describe, expect, it } from "vitest";
import { firstSentence, openPart, ownFigures, rowPills, rowSource, spanWords } from "./rule-row";
import { loadRules } from "./data.server";

const all = loadRules();

describe("firstSentence", () => {
  it("stops at the first sentence end, keeping a decimal point and a section's dot", () => {
    expect(firstSentence("המס הוא 2.5% בשנה. ועוד משפט.")).toBe("המס הוא 2.5% בשנה.");
    expect(firstSentence("לפי סעיף 9(16א). המשך")).toBe("לפי סעיף 9(16א).");
  });
  it("drops a closing semicolon or colon, and cuts a long sentence at a word with an ellipsis", () => {
    expect(firstSentence("שלושה מקרים: א, ב")).toBe("שלושה מקרים");
    const long = firstSentence(`${"מילה ".repeat(60)}סוף.`);
    expect(long.endsWith("…")).toBe(true);
    expect(long.length).toBeLessThanOrEqual(161);
  });
  it("is empty for no text", () => {
    expect(firstSentence(undefined)).toBe("");
  });
});

describe("rowPills", () => {
  it("leaves out a figure the record keeps for another rule (TXH-09 stores TXH-10's three years)", () => {
    const r = all["TXH-09"]!;
    expect(ownFigures(r, 2026).map((f) => f.key)).toEqual(["lock_years"]);
    expect(rowPills(r, 2026)).toEqual([{ text: "6", word: "שנים" }]);
  });
  it("never shows a word, a yes or no, or a count as a pill; one or two years or months are said in words", () => {
    for (const r of Object.values(all)) for (const p of rowPills(r, 2026)) expect(p.text).toMatch(/\d|^(שנה|שנתיים|חודש|חודשיים)$/);
  });
  it("says a year as a year, never \"1 שנים\" (ETF-38's wait after removal)", () => {
    expect(rowPills(all["ETF-38"]!, 2026)).toContainEqual({ text: "שנה", word: null });
    expect(spanWords(1, "years")).toBe("שנה");
    expect(spanWords(2, "months")).toBe("חודשיים");
    expect(spanWords(3, "years")).toBeNull();
    expect(spanWords(1, "days")).toBeNull();
  });
});

describe("openPart", () => {
  it("marks a rule whose text goes on, past the sentence the row shows, to an open question (TX2-14), and not an open rule or a settled one", () => {
    expect(openPart(all["TX2-14"]!)).toBe(true);
    expect(openPart(all["TXF-04"]!)).toBe(false);
    expect(openPart({ strength: "primary", text_he: "זו שאלה פתוחה. ועוד משפט." })).toBe(false);
    expect(openPart({ strength: "primary", text_he: "הכלל קבוע. אם הוא חל גם על קרן סל, זו שאלה פתוחה." })).toBe(true);
  });
});

describe("rowSource", () => {
  it("names the first source's publisher in Hebrew and counts the sources", () => {
    const s = rowSource(all["TXH-09"]! as never, {});
    expect(s.authority).toBe("רשות המסים");
    expect(s.count).toBeGreaterThan(0);
  });
});
