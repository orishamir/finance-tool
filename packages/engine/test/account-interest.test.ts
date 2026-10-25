// F-85 (the rate most banks pay on a current account) and the F-26 yearly reading used by the current-account page.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { currentAccountYearlyInterest, formulas, mostCommonRate } from "../src/index.ts";

describe("F-85 the rate most banks pay", () => {
  it("is registered", () => {
    expect(formulas["F-85"]).toBe(mostCommonRate);
  });

  it("takes the most common rate and counts the banks that pay anything", () => {
    expect(mostCommonRate([0, 0, 0, 0, 3, 2, 1, 0.75])).toEqual({ rate: 0, count: 4, of: 8, paying: 4 });
    expect(mostCommonRate([1, 1, 2])).toEqual({ rate: 1, count: 2, of: 3, paying: 3 });
  });

  it("gives a tie to the lower rate", () => {
    expect(mostCommonRate([2, 2, 1, 1])).toEqual({ rate: 1, count: 2, of: 4, paying: 4 });
    expect(mostCommonRate([3, 0, 2, 1])).toEqual({ rate: 0, count: 1, of: 4, paying: 3 });
  });

  it("treats rates that differ only by float noise as one", () => {
    expect(mostCommonRate([0.1 + 0.2, 0.3, 0.3, 5])).toEqual({ rate: 0.3, count: 3, of: 4, paying: 4 });
  });

  it("is null with no bank", () => {
    expect(mostCommonRate([])).toBeNull();
  });

  it("gives 0 with 4 of 8 on the published data", () => {
    const dir = new URL("../../../data/terms/deposits/", import.meta.url);
    const records = readdirSync(dir)
      .filter((f) => f.endsWith("-current-account.json"))
      .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as { bank: string; wrapper_id: string; rate_offered: { value: number } });
    expect(records.every((r) => r.wrapper_id === "current-account")).toBe(true);
    expect(new Set(records.map((r) => r.bank)).size).toBe(8);
    expect(mostCommonRate(records.map((r) => r.rate_offered.value))).toEqual({ rate: 0, count: 4, of: 8, paying: 4 });
  });
});

describe("F-26 the most a current account pays in a year", () => {
  it("is the rate on the first ceiling of the balance, less the tax withheld", () => {
    // Discount: 3% on at most 10,000 NIS, 15% withheld
    expect(currentAccountYearlyInterest(10_000, 3, 10_000, 15)).toBeCloseTo(255, 9);
    expect(currentAccountYearlyInterest(50_000, 3, 10_000, 15)).toBeCloseTo(255, 9);
    expect(currentAccountYearlyInterest(4_000, 2, 10_000, 15)).toBeCloseTo(68, 9);
  });

  it("pays nothing at a rate of 0 or on a balance of 0, and takes the whole balance when the record prints no ceiling", () => {
    expect(currentAccountYearlyInterest(10_000, 0, 10_000, 15)).toBe(0);
    expect(currentAccountYearlyInterest(0, 3, 10_000, 15)).toBe(0);
    expect(currentAccountYearlyInterest(20_000, 1, null, 15)).toBeCloseTo(170, 9);
  });
});
