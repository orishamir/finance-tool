import { describe, expect, it } from "vitest";
import { fmt, formatValue, nisShown, parseNumber, readerRound, withMinus } from "./format";
import { hasHebrew, isHebrewTitle, sourceLabel } from "./source-label";

describe("parseNumber (audit A6)", () => {
  const ok: [string, number][] = [
    ["2,5", 2.5],
    ["4,5", 4.5],
    ["4,25", 4.25],
    ["0,5", 0.5],
    ["2.5", 2.5],
    [".5", 0.5],
    ["12,000", 12000],
    ["1,234,567", 1234567],
    ["1,234.5", 1234.5],
    ["1.234,5", 1234.5],
    ["1.234.567", 1234567],
    ["10000", 10000],
    ["  7 ", 7],
    ["1 500", 1500],
    ["1 500", 1500],
    ["10,000 ₪", 10000],
    ["₪ 2,5", 2.5],
    ["3.5%", 3.5],
    ["2,5%", 2.5],
    ["‏12,5‏", 12.5],
    ["-2,5", -2.5],
    ["−3", -3],
    ["0", 0],
  ];
  for (const [text, want] of ok) it(`"${text}" is ${want}`, () => expect(parseNumber(text)).toBe(want));
  const bad = ["", " ", "abc", "1e5", "2,5,5", "1,2345", "--3", "5-", "1.2.3", ",", "₪", "12a", "1,234,5"];
  for (const text of bad) it(`"${text}" is not a number`, () => expect(parseNumber(text)).toBeNaN());
});

describe("display rounding (audit A13)", () => {
  it("rounds a computed amount of 1,000 ₪ or more to whole shekels", () => {
    expect(nisShown(1180599.02, "computed")).toBe("1,180,599 ₪");
    expect(nisShown(1000, "computed")).toBe("1,000 ₪");
  });
  it("shows what the site calculates in whole shekels, except a cost under 10 ₪; a law's or a price list's figure keeps its agorot (founder, 2026-11-08)", () => {
    expect(nisShown(32.5, "computed")).toBe("33 ₪");
    expect(nisShown(951.75, "computed")).toBe("952 ₪");
    expect(nisShown(3.2, "computed")).toBe("3.20 ₪");
    expect(nisShown(5645.29, "sourced")).toBe("5,645.29 ₪");
    expect(nisShown(0, "entered")).toBe("0 ₪");
    expect(nisShown(10000, "entered")).toBe("10,000 ₪");
    expect(nisShown(500, "entered", true)).toBe("500 ₪");
  });
  it("shows a whole amount without agorot, a sourced fee under 1,000 ₪ too, and keeps agorot that are there (founder, 2026-11-08)", () => {
    expect(nisShown(32, "sourced")).toBe("32 ₪");
    expect(nisShown(999, "sourced")).toBe("999 ₪");
    expect(nisShown(9.9, "sourced")).toBe("9.90 ₪");
    expect(fmt.nis(10)).toBe("10 ₪");
    expect(fmt.nis(33.95)).toBe("33.95 ₪");
  });
  it("shows a whole sourced amount of 1,000 ₪ or more without .00, and keeps the agorot a source prints (2026-11-08)", () => {
    expect(nisShown(83641, "sourced")).toBe("83,641 ₪");
    expect(nisShown(2500, "sourced")).toBe("2,500 ₪");
    expect(nisShown(5645.29, "sourced")).toBe("5,645.29 ₪");
    expect(formatValue(83641, "nis", "sourced")).toBe("83,641 ₪");
  });
  it("applies by state in formatValue, and only to plain shekel amounts", () => {
    expect(formatValue(93511.08, "nis", "computed")).toBe("93,511 ₪");
    expect(formatValue(93511.08, "nis")).toBe("93,511.08 ₪");
    expect(formatValue(1234.5, "nis_per_month", "computed")).toBe("1,235 ₪");
    expect(formatValue(500, "nis_per_month", "entered", true)).toBe("500 ₪");
    expect(formatValue(29.9, "nis_per_month", "sourced")).toBe("29.90 ₪");
    expect(formatValue(1.8, "pct", "computed")).toBe("1.8%");
  });
});

describe("plain copy of a shekel amount (audit A37)", () => {
  it("has no right-to-left mark and no no-break space", () => {
    for (const text of [fmt.nis(1234.5), fmt.nisWhole(1234), formatValue(10000, "nis", "entered")]) {
      expect(text).not.toMatch(/[‏  ]/);
      expect(text).toMatch(/^[\d,. ₪]+$/);
    }
  });
});

describe("source label (audit A21)", () => {
  it("shows a Hebrew title as it is", () => {
    expect(sourceLabel({ title: "בנק ישראל, תנאים כלליים", url: "https://www.boi.org.il/a.pdf" }, "קובץ")).toEqual({ text: "בנק ישראל, תנאים כלליים", host: false, english: null });
  });
  it("shows the host for an English title, and keeps the title for the collapsed line", () => {
    expect(sourceLabel({ title: "Harel study-fund bylaws, s.3.2: \"והמעסיק\"", url: "https://www.harel-group.co.il/x" }, "קובץ")).toEqual({ text: "harel-group.co.il", host: true, english: "Harel study-fund bylaws, s.3.2: \"והמעסיק\"" });
  });
  it("names a file of the site, not a path", () => {
    expect(sourceLabel({ title: "Founder's choice", url: "docs/parameters-rationale.md#x" }, "קובץ נתונים")).toMatchObject({ text: "קובץ נתונים", host: false });
  });
  it("tells Hebrew from English text", () => {
    expect(hasHebrew("a ב")).toBe(true);
    expect(hasHebrew("only english")).toBe(false);
    expect(isHebrewTitle("שלום עולם ABC")).toBe(true);
    expect(isHebrewTitle("Hello עולם world")).toBe(false);
  });
});

describe("nearThreshold (F-62, 2026-10-24)", () => {
  it("is true within 0.50 ₪ of a P-03 threshold, so two decimals are kept there", async () => {
    const { nearThreshold, nisShown } = await import("./format");
    expect(nisShown(2499.6, "computed")).toBe(nisShown(2500, "computed"));
    expect(nearThreshold(2499.6, [1000, 2500])).toBe(true);
    expect(nearThreshold(2499.5, [2500])).toBe(true);
    expect(nearThreshold(2499.49, [2500])).toBe(false);
    expect(nearThreshold(1800, [1000, 2500])).toBe(false);
  });
});

describe("negative figures (polish 2026-10-24)", () => {
  it("uses the true minus sign, after a left-to-right mark, never an ASCII hyphen", () => {
    expect(fmt.pct(-2)).toBe("\u200e\u22122%");
    expect(fmt.pct(-1.115)).toBe("\u200e\u22121.115%");
    expect(fmt.nisWhole(-1234)).toBe("\u200e\u22121,234 ₪");
    expect(fmt.nis(-5.5)).toBe("\u200e\u22125.50 ₪");
    expect(fmt.number(-2.5)).toBe("\u200e\u22122.5");
    expect(formatValue(-29, "pct")).toBe("\u200e\u221229%");
    for (const t of [fmt.pct(-2), fmt.nis(-5), fmt.number(-3), fmt.compactNis(-2500)]) expect(t).not.toContain("-");
  });
  it("leaves positive figures and an existing minus alone", () => {
    expect(fmt.pct(29)).toBe("29%");
    expect(withMinus("\u200e\u22122%")).toBe("\u200e\u22122%");
  });
  it("parses the printed negative back", () => {
    expect(parseNumber(fmt.pct(-2))).toBe(-2);
  });
});

describe("a date a document prints as a month (2026-11-07)", () => {
  it("is said as the month, never with an invented first day", () => {
    expect(fmt.date("2025-11")).toBe(fmt.period("2025-11"));
    expect(fmt.date("2025-11")).not.toMatch(/01\.11/);
    expect(fmt.date("2025-11-01")).toBe("01.11.2025");
  });
});

// "8.17 שנים" read as oddly precise; a point where the conclusion changes is shown as a reader means it
describe("readerRound: a flip point as a reader means it, rounded away from the value now", () => {
  it("years whole, or halves under 3, toward the side the conclusion has changed on", () => {
    expect(readerRound(8.17, "lo", "years")).toBe(8);
    expect(readerRound(8.17, "hi", "years")).toBe(9);
    expect(readerRound(2.3, "lo", "years")).toBe(2);
    expect(readerRound(2.3, "hi", "years")).toBe(2.5);
    expect(readerRound(0.2, "lo", "years")).toBe(0.2); // finer, never up across the point
    expect(readerRound(12, "hi", "years")).toBe(12);
  });
  it("a return in percent whole from 3, halves from 1, tenths from 0.1; a fee in tenths", () => {
    expect(readerRound(0.44, "lo", "pct")).toBe(0.4);
    expect(readerRound(0.44, "hi", "pct")).toBe(0.5);
    expect(readerRound(1.37, "hi", "pct")).toBe(1.5);
    expect(readerRound(1.17, "hi", "fee")).toBe(1.2);
    expect(readerRound(0.44, "lo", "fee")).toBe(0.4);
    expect(readerRound(0.044, "lo", "fee")).toBe(0.04);
    expect(readerRound(4.37, "lo", "pct")).toBe(4);
    expect(readerRound(0.04, "lo", "pct")).toBe(0.04);
  });
});
