import { describe, expect, it } from "vitest";
import { countPhrase, fmt, formatValue, nisShown, parseNumber, withMinus } from "./format";
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

describe("a figure with its sign", () => {
  const LRI = "\u2066";
  const PDI = "\u2069";
  it("writes a plus before a positive and the true minus sign before a negative, never a hyphen", () => {
    expect(fmt.signedNisWhole(4875)).toBe(`${LRI}+4,875 ₪${PDI}`);
    expect(fmt.signedNisWhole(-1524)).toBe(`${LRI}\u22121,524 ₪${PDI}`);
    expect(fmt.signedPct(-2.38, 2)).toBe(`${LRI}\u22122.38%${PDI}`);
    expect(fmt.signedNumber(-2)).toBe(`${LRI}\u22122${PDI}`);
    for (const t of [fmt.signedNisWhole(-5), fmt.signedPct(-1), fmt.signedNumber(-3, 1)]) expect(t).not.toMatch(/[-\u200e\u200f]/);
  });
  it("keeps the figure left to right inside Hebrew by default, and bare where the caller isolates it", () => {
    for (const t of [fmt.signedNisWhole(12), fmt.signedPct(3), fmt.signedNumber(7), fmt.signedNisWhole(0)]) {
      expect(t.startsWith(LRI)).toBe(true);
      expect(t.endsWith(PDI)).toBe(true);
    }
    expect(fmt.signedPct(3, 0, { isolate: false })).toBe("+3%");
    expect(fmt.signedNumber(-18.5, 1, { isolate: false })).toBe("\u221218.5");
  });
  it("keeps the thousands separator, the percent's included", () => {
    expect(fmt.signedNisWhole(-1234567.4, { isolate: false })).toBe("\u22121,234,567 ₪");
    expect(fmt.signedPct(1234.5, 1, { isolate: false })).toBe("+1,234.5%");
    expect(fmt.signedNumber(12000, undefined, { isolate: false })).toBe("+12,000");
  });
  it("writes exactly the decimals asked for, else the decimals pct and number show", () => {
    expect(fmt.signedPct(3, 1, { isolate: false })).toBe("+3.0%");
    expect(fmt.signedPct(-0.015, undefined, { isolate: false })).toBe("\u22120.015%");
    expect(fmt.signedPct(1.05, undefined, { isolate: false })).toBe("+1.05%");
    expect(fmt.signedNumber(2.5, undefined, { isolate: false })).toBe("+2.5");
  });
  it("gives no sign to a figure that shows as zero", () => {
    expect(fmt.signedNisWhole(0, { isolate: false })).toBe("0 ₪");
    expect(fmt.signedNisWhole(-0.3, { isolate: false })).toBe("0 ₪");
    expect(fmt.signedPct(0.004, 2, { isolate: false })).toBe("0.00%");
    expect(fmt.signedNumber(-0, undefined, { isolate: false })).toBe("0");
  });
  it("parses back to the figure", () => {
    expect(parseNumber(fmt.signedNisWhole(-1524))).toBe(-1524);
    expect(parseNumber(fmt.signedPct(2.38, 2))).toBe(2.38);
  });
});

describe("a count in words", () => {
  const companies = { one: "חברה אחת", two: "שתי חברות", many: "חברות" };
  it("says one and two in words and any other count as the number and the plural", () => {
    expect(countPhrase(1, companies)).toBe("חברה אחת");
    expect(countPhrase(2, companies)).toBe("שתי חברות");
    expect(countPhrase(3, companies)).toBe("3 חברות");
    expect(countPhrase(15, companies)).toBe("15 חברות");
    expect(countPhrase(1500, companies)).toBe("1,500 חברות");
  });
  it("says zero in its own words where given, else as a number", () => {
    expect(countPhrase(0, { ...companies, zero: "אין חברות" })).toBe("אין חברות");
    expect(countPhrase(0, companies)).toBe("0 חברות");
  });
  it("puts the number where the words hold {n}", () => {
    const more = { one: "עוד מקור אחד", two: "עוד שני מקורות", many: "עוד {n} מקורות" };
    expect(countPhrase(1, more)).toBe("עוד מקור אחד");
    expect(countPhrase(7, more)).toBe("עוד 7 מקורות");
  });
  it("takes the plural for a fraction, years and months included", () => {
    expect(countPhrase(0.5, companies)).toBe("0.5 חברות");
    expect([fmt.years(1), fmt.years(2), fmt.years(2.5), fmt.years(10)]).toEqual(["שנה", "שנתיים", "2.5 שנים", "10 שנים"]);
    expect([fmt.months(1), fmt.months(2), fmt.months(18)]).toEqual(["חודש", "חודשיים", "18 חודשים"]);
  });
});

describe("billions", () => {
  it("always with two decimals", () => {
    expect(fmt.nisBillions(19_137_400_000)).toBe("19.14 מיליארד ₪");
    expect(fmt.nisBillions(19_000_000_000)).toBe("19.00 מיליארד ₪");
    expect(fmt.nisBillions(-2_300_000_000)).toBe("\u200e\u22122.30 מיליארד ₪");
  });
});
