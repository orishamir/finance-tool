import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyAssets, groupFeeRange, kindStockMedian } from "../src/formulas/track-groups.ts";

// The worked examples are Harel's 15 kupat gemel lehashkaa tracks and the kinds of that product in the regulator's 2026-09 file.
const gemel = JSON.parse(readFileSync(new URL("../../../data/cma/gemelnet@2026-09.json", import.meta.url), "utf8")) as {
  funds: { fund_classification: string; sub_specialization: string; managing_corporation: { legal_id: string }; raw_fields: Record<string, string> }[];
};
const gemelLehashkaa = gemel.funds.filter((f) => f.fund_classification.trim() === "קופת גמל להשקעה");
const num = (s: string | undefined) => (s === undefined || s.trim() === "" ? null : Number(s));

describe("F-99 a company's assets in one product", () => {
  it("sums the tracks' assets at the period end (Harel, kupat gemel lehashkaa, 2026-09)", () => {
    const harel = gemelLehashkaa.filter((f) => f.managing_corporation.legal_id === "512267592");
    expect(harel).toHaveLength(15);
    expect(companyAssets(harel.map((f) => num(f.raw_fields.TOTAL_ASSETS)))).toBeCloseTo(18972.9, 2);
  });

  it("a track that did not report adds nothing; none reporting is null", () => {
    expect(companyAssets([100, null, 50.5])).toBe(150.5);
    expect(companyAssets([null, null])).toBeNull();
    expect(companyAssets([])).toBeNull();
  });

  it("a reported zero is a reported amount", () => {
    expect(companyAssets([0, null])).toBe(0);
  });
});

describe("F-100 a group's fee range", () => {
  it("is the lowest and the highest reported fee (Harel, 2026-09: 0.54% to 0.58%)", () => {
    const harel = gemelLehashkaa.filter((f) => f.managing_corporation.legal_id === "512267592");
    expect(groupFeeRange(harel.map((f) => num(f.raw_fields.AVG_ANNUAL_MANAGEMENT_FEE)))).toEqual({ low: 0.54, high: 0.58, count: 15 });
  });

  it("leaves out the tracks without a reported fee, and is null when none reported one", () => {
    expect(groupFeeRange([0.7, null, 0.5])).toEqual({ low: 0.5, high: 0.7, count: 2 });
    expect(groupFeeRange([null, null])).toBeNull();
    expect(groupFeeRange([])).toBeNull();
  });

  it("keeps a negative fee as reported, and a zero fee is a fee", () => {
    expect(groupFeeRange([0, -0.1, 0.4])).toEqual({ low: -0.1, high: 0.4, count: 3 });
  });
});

describe("F-100 the median stock share that orders the kinds", () => {
  const share = (f: (typeof gemelLehashkaa)[number]) => {
    const a = num(f.raw_fields.TOTAL_ASSETS);
    const e = num(f.raw_fields.STOCK_MARKET_EXPOSURE);
    return a !== null && e !== null && a > 0 ? (e / a) * 100 : null;
  };
  const median = (kind: string) => kindStockMedian(gemelLehashkaa.filter((f) => f.sub_specialization.trim() === kind).map(share));

  it("odd count: the middle share; even count: the mean of the two middle shares", () => {
    expect(kindStockMedian([10, 90, 50])).toBe(50);
    expect(kindStockMedian([10, 20, 30, 90])).toBe(25);
    expect(kindStockMedian([40])).toBe(40);
  });

  it("leaves out the shares that could not be computed; null when none could", () => {
    expect(kindStockMedian([null, 10, 30])).toBe(20);
    expect(kindStockMedian([null])).toBeNull();
    expect(kindStockMedian([])).toBeNull();
  });

  it("puts the S&P 500 trackers first and the shekel money-market kind last (2026-09)", () => {
    expect(median("עוקב מדד s&p 500")).toBeCloseTo(99.49, 2);
    expect(median("מניות")).toBeCloseTo(98.82, 2);
    expect(median("כללי")).toBeCloseTo(51.81, 2);
    expect(median("כספי (שקלי)")).toBe(0);
  });
});
