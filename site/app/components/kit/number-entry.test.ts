// A number field's text as the person types it: the thousands separators a whole amount's box sets as it is typed follow the one parser's
// rules (lib/format.ts `parseNumber`), a percent's box reads a comma as a rate's, a whole amount's box says a point and three digits is
// unclear, a field of years or an age says a fraction must be whole, and an amount of money has a largest (guidelines/design.md, "Fields").
import { describe, expect, it } from "vitest";
import { fmt, groupTyped } from "../../lib/format";
import { values as copy } from "../../copy";
import { ageCheck, amountCheck, fieldRules, nonNegativeCheck, percentCheck, readFieldText, yearsCheck } from "./fields";

/** The box's text after each step of `steps`, typed one after another from an empty box. */
const typing = (steps: string[]): string => steps.reduce((before, raw) => groupTyped(raw, before), "");

describe("a whole amount's separators as it is typed", () => {
  it("groups digits typed one by one, and again as one is deleted", () => {
    expect(typing(["1", "12", "123", "1234"])).toBe("1,234");
    expect(typing(["1", "12", "123", "1234", "1,2345"])).toBe("12,345");
    // the last digit deleted from "1,234": the comma was the box's, not the person's
    expect(groupTyped("1,23", "1,234")).toBe("123");
    expect(groupTyped("1,00,000", "1,000,000")).toBe("100,000");
  });
  it("leaves a comma typed where the parser reads no whole amount as typed, so its error shows", () => {
    // "2,5" is 2.5 (a decimal), not 25
    expect(typing(["2", "2,", "2,5"])).toBe("2,5");
    // fewer than three digits after a comma is no number, not 1,000,000 or 12,345
    expect(groupTyped("10,00,000", "")).toBe("10,00,000");
    expect(typing(["1", "12", "123", "1234", "1,234,", "1,234,5"])).toBe("1,234,5");
    // a first group led by a zero is no number, not 1,000
    expect(groupTyped("01,000", "")).toBe("01,000");
  });
  it("groups a comma typed where the parser reads a whole amount", () => {
    // thousands separators in the wrong places, three digits or more after each: the parser drops them
    expect(groupTyped("1000,000", "")).toBe("1,000,000");
    expect(typing(["1", "10", "100", "1,000", "1,000,", "1,000,0", "1,000,00", "1,000,000"])).toBe("1,000,000");
  });
  it("leaves text with other signs as typed", () => {
    expect(groupTyped("12a", "12")).toBe("12a");
    expect(groupTyped("1.5", "1")).toBe("1.5");
  });
});

const shekels = fieldRules({ unit: "nis", validate: nonNegativeCheck });
const percent = fieldRules({ unit: "pct_per_year", validate: percentCheck({ min: -50, max: 50 }) });
const read = (text: string, rules = shekels) => readFieldText(text, rules);

describe("a percent field's comma", () => {
  it("is a decimal point, as an Israeli reader types one", () => {
    expect(read("1,500", percent)).toEqual({ kind: "number", n: 1.5 });
    expect(read("0,1250", percent)).toEqual({ kind: "number", n: 0.125 });
  });
  it("in an amount's field is a thousands separator", () => {
    expect(read("1,500")).toEqual({ kind: "number", n: 1500 });
  });
});

describe("a whole amount with a point and three digits", () => {
  it("is unclear, not 1 ₪", () => {
    expect(read("1.000")).toEqual({ kind: "wrong", message: copy.errors.dotThousands });
    expect(read("12.500 ₪")).toEqual({ kind: "wrong", message: copy.errors.dotThousands });
  });
  it("in a percent field is a decimal", () => {
    expect(read("1.000", percent)).toEqual({ kind: "number", n: 1 });
  });
  it("with points between every group is still thousands", () => {
    expect(read("1.000.000")).toEqual({ kind: "number", n: 1_000_000 });
  });
  it("with one or two digits after the point is a fraction, not whole", () => {
    expect(read("2.5")).toEqual({ kind: "wrong", message: copy.errors.whole });
  });
});

describe("years and an age with a fraction", () => {
  it("say the number must be whole, not that it is out of the range", () => {
    expect(yearsCheck({ min: 1, max: 40 })(2.5)).toBe(copy.errors.yearsWhole);
    expect(ageCheck({ min: 0, max: 120 })(30.5)).toBe(copy.errors.ageWhole);
  });
  it("still say the range for a whole number out of it", () => {
    expect(yearsCheck({ min: 1, max: 40 })(41)).toBe("הזינו מספר שנים בין 1 ל־40.");
    expect(ageCheck({ min: 0, max: 120 })(121)).toBe("הזינו גיל בין 0 ל־120.");
  });
});

describe("an amount's largest", () => {
  const check = amountCheck(1_000_000_000);
  it("takes the largest and refuses one past it, in words that name it", () => {
    expect(check(1_000_000_000)).toBeNull();
    expect(check(1_000_000_001)).toBe(`${copy.errors.tooLarge} ${fmt.nisWhole(1_000_000_000)}.`);
    expect(readFieldText("99,999,999,999,999", fieldRules({ unit: "nis", validate: check })).kind).toBe("wrong");
  });
  it("keeps its floor: below zero, or zero where it must be above it", () => {
    expect(check(-1)).toBe(copy.errors.negative);
    expect(check(0)).toBeNull();
    expect(amountCheck(1_000_000_000, { aboveZero: true })(0)).toBe(copy.errors.positive);
  });
});

describe("a chart's scale mark from a billion", () => {
  it("is in billions, the word a figure's short form uses, not thousands of millions", () => {
    expect(fmt.compactNis(93_500_000_000)).toBe("93.5 מיליארד ₪");
    expect(fmt.compactNis(200_000_000)).toBe("200 מיליון ₪");
  });
});
