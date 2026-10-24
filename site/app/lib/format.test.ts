import { describe, expect, it } from "vitest";
import { fmt, formatValue, nisShown, parseNumber } from "./format";
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
  it("keeps agorot under 1,000 ₪, and drops them from a whole amount", () => {
    expect(nisShown(32.5, "computed")).toBe("32.50 ₪");
    expect(nisShown(0, "entered")).toBe("0 ₪");
    expect(nisShown(10000, "entered")).toBe("10,000 ₪");
    expect(nisShown(500, "entered", true)).toBe("500 ₪");
  });
  it("keeps two decimals on a sourced tariff or fee, whatever its size", () => {
    expect(nisShown(32, "sourced")).toBe("32.00 ₪");
    expect(nisShown(2500, "sourced")).toBe("2,500.00 ₪");
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
