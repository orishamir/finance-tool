import { describe, expect, it } from "vitest";
import { firstSentence, ownFigures, rowPills, rowSource } from "./rule-row";
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
  it("never shows a word, a yes or no, or a count as a pill", () => {
    for (const r of Object.values(all)) for (const p of rowPills(r, 2026)) expect(p.text).toMatch(/\d/);
  });
});

describe("rowSource", () => {
  it("names the first source's publisher in Hebrew and counts the sources", () => {
    const s = rowSource(all["TXH-09"]! as never, {});
    expect(s.authority).toBe("רשות המסים");
    expect(s.count).toBeGreaterThan(0);
  });
});
