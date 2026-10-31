// F-92 to F-94 (2026-10-29): a fund's gap to its index from its reports, the dollar against the shekel from month-end rates, and where
// two results meet. Expected figures are the reports' own numbers worked through each formula's definition.
import { describe, expect, it } from "vitest";
import { gapToIndex, kindRecord, stretchRange, trackingBeyondFees, trackingBeyondFeesRange, yearlyChanges } from "../src/index.ts";

// Harel's hedged S&P 500 fund 5127527, annual report 31.12.2025: fund against the index in dollars
const hedged = [
  { year: 2025, fund_pct: 15.32, tracking_pct: 17.43 },
  { year: 2024, fund_pct: 21.86, tracking_pct: 24.16 },
  { year: 2023, fund_pct: 23.6, tracking_pct: 25.7 },
  { year: 2022, fund_pct: -21.78, tracking_pct: -18.52 },
];
// Harel's unhedged tracking fund 5129275: ahead of its index every year
const ahead = [
  { year: 2025, fund_pct: 3.04, tracking_pct: 2.61 },
  { year: 2024, fund_pct: 25.48, tracking_pct: 24.96 },
];

describe("F-92 the gap to the index", () => {
  it("is the mean of the fund's return less its index's", () => {
    expect(gapToIndex(hedged)).toBeCloseTo((-2.11 - 2.3 - 2.1 - 3.26) / 4, 10);
    expect(gapToIndex([])).toBeNull();
  });
  it("gives A-07 as the shortfall beyond the fees, and 0 for a fund ahead of its fees", () => {
    // 0.32% fees (0% fixed, 0.3% variable, 0.02% trustee)
    expect(trackingBeyondFees(hedged, 0.0032)).toBeCloseTo(0.024425 - 0.0032, 10);
    expect(trackingBeyondFees(ahead, 0.00125)).toBe(0);
    expect(trackingBeyondFees([], 0.01)).toBeNull();
  });
  it("bands A-07 by the cheapest and dearest year", () => {
    const r = trackingBeyondFeesRange(hedged, 0.0032)!;
    expect(r.low).toBeCloseTo(0.021 - 0.0032, 10);
    expect(r.high).toBeCloseTo(0.0326 - 0.0032, 10);
  });
});

describe("F-93 the dollar against the shekel", () => {
  const pts = [
    { date: "2020-12-31", rate: 3.2 },
    { date: "2021-06-30", rate: 3.3 },
    { date: "2021-12-31", rate: 3.36 },
    { date: "2022-06-30", rate: 3.4 },
    { date: "2022-12-31", rate: 3.024 },
  ];
  it("changes year on year from December to December", () => {
    const y = yearlyChanges(pts);
    expect(y.map((x) => x.year)).toEqual([2021, 2022]);
    expect(y[0]!.pct).toBeCloseTo(5, 10);
    expect(y[1]!.pct).toBeCloseTo(-10, 10);
  });
  it("ranges the average yearly change over every stretch from a month end", () => {
    // monthly points: 25 months, the rate up 1% a month
    const m = Array.from({ length: 25 }, (_, i) => ({ date: `20${String(10 + Math.floor(i / 12)).padStart(2, "0")}-${String((i % 12) + 1).padStart(2, "0")}-28`, rate: 3 * Math.pow(1.01, i) }));
    const r = stretchRange(m, 1)!;
    expect(r.count).toBe(13);
    expect(r.low).toBeCloseTo((Math.pow(1.01, 12) - 1) * 100, 8);
    expect(r.high).toBeCloseTo(r.low, 8);
    expect(stretchRange(m, 3)).toBeNull();
  });
});

describe("F-94 where two results meet", () => {
  it("sets the two kinds side by side, year by year", () => {
    const funds = [
      { hedged: true, years: [{ year: 2022, fund_pct: -21.78, tracking_pct: -18.52 }, { year: 2025, fund_pct: 15.32, tracking_pct: 17.43 }, { year: 2021, fund_pct: 25, tracking_pct: 26 }] },
      { hedged: false, years: [{ year: 2022, fund_pct: -8.15, tracking_pct: -7.55 }, { year: 2025, fund_pct: 1.85, tracking_pct: 2.61 }] },
      { hedged: false, years: [{ year: 2022, fund_pct: -7.35, tracking_pct: -7.55 }, { year: 2025, fund_pct: 3.04, tracking_pct: 2.61 }] },
      { hedged: false, years: [{ year: 2025, fund_pct: 2.5, tracking_pct: 2.61 }] },
    ];
    const r = kindRecord(funds, [{ year: 2021, pct: -3.4 }, { year: 2022, pct: 13.4 }, { year: 2025, pct: -12.5 }])!;
    // 2021 has no unhedged report, so it is left out everywhere
    expect(r.years.map((y) => y.year)).toEqual([2022, 2025]);
    expect(r.years[1]!.unhedged).toEqual({ low: 1.85, high: 3.04, count: 3 });
    expect(r.years[0]!.index).toBe(-18.52);
    expect(r.gaps.hedged.low).toBeCloseTo(-3.26, 6);
    expect(r.gaps.hedged.high).toBeCloseTo(-2.11, 6);
    expect(r.gaps.unhedged.count).toBe(5);
    expect(r.fell!.year).toBe(2022);
    expect(r.rose!.year).toBe(2025);
    // compounded over the two funds with both years, not the third
    expect(r.together!.unhedged.count).toBe(2);
    expect(r.together!.hedged.low).toBeCloseTo((0.7822 * 1.1532 - 1) * 100, 6);
    expect(r.together!.dollar).toBeCloseTo((1.134 * 0.875 - 1) * 100, 6);
  });

  it("has no record without a year of each kind, and no together with one year", () => {
    const h = { hedged: true, years: [{ year: 2025, fund_pct: 18.2, tracking_pct: 20.32 }] };
    const u = { hedged: false, years: [{ year: 2024, fund_pct: 20, tracking_pct: 20 }] };
    expect(kindRecord([h, u], [{ year: 2024, pct: 1 }, { year: 2025, pct: -12 }])).toBeNull();
    const one = kindRecord([h, { hedged: false, years: [{ year: 2025, fund_pct: 4.05, tracking_pct: 4.96 }] }], [{ year: 2025, pct: -12 }])!;
    expect(one.together).toBeNull();
    expect(one.fell).toBeNull();
    expect(one.rose!.year).toBe(2025);
  });
});
