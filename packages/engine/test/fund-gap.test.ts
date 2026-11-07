// F-92 to F-94 (2026-10-29): a fund's gap to its index from its reports, the dollar against the shekel from month-end rates, and where
// two results meet. Expected figures are the reports' own numbers worked through each formula's definition.
import { describe, expect, it } from "vitest";
import { comparedYears, firstFullYear, gapListOf, gapToIndex, incomeUntaxed, kindRecord, stretchRange, trackingBeyondFees, trackingBeyondFeesRange, variableForward, yearlyChanges } from "../src/index.ts";

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
  // MTF TA-90 1150259, annual report 30.06.2026: returns p. 6, fees charged p. 8 ("הוצאות שנפרעו מנכסי הקרן"); listed fees today 0.705%
  const mtf90 = [
    { year: 2025, fund_pct: 45.67, tracking_pct: 46.56, fees_charged: { fixed: 0.6, variable: 0.07, trustee: 0.005 } },
    { year: 2024, fund_pct: 30.26, tracking_pct: 30.86, fees_charged: { fixed: 0.45, variable: 0.1, trustee: 0.005 } },
    { year: 2023, fund_pct: 3.91, tracking_pct: 4.27, fees_charged: { fixed: 0.45, variable: 0.1, trustee: 0.0054 } },
  ];
  it("sets each year against the fees charged that year, not today's (2026-11-07, the site's convention)", () => {
    // per year −gap − c_y, in points: 0.89 − 0.675, 0.60 − 0.555, 0.36 − 0.5554; their mean, as a fraction
    const each = [0.89 - 0.675, 0.6 - 0.555, 0.36 - 0.5554];
    expect(trackingBeyondFees(mtf90, 0.00705)).toBeCloseTo(each.reduce((a, x) => a + x, 0) / 3 / 100, 12);
    // today's fees against the mean gap would give 0: max(0, 0.6167% − 0.705%)
    expect(trackingBeyondFees(mtf90.map(({ fees_charged: _, ...y }) => y), 0.00705)).toBe(0);
    // the mean is taken before the floor: 2023 moved to a 0.27-point shortfall, 0.2854 points inside its fees, offsets 2025's 0.215
    expect(trackingBeyondFees([mtf90[0]!, { ...mtf90[2]!, fund_pct: 4.0 }], 0.00705)).toBe(0);
  });
  it("counts a variable fee paid back to the fund as a negative charge (Kesem 5139696, 2025: −0.215% variable, 0.03% trustee)", () => {
    const kesem = [{ year: 2025, fund_pct: 15.2, tracking_pct: 17.32, fees_charged: { fixed: 0, variable: -0.215, trustee: 0.03 } }];
    // 2.12 points behind, against fees of −0.185%: 2.305% beyond them
    expect(trackingBeyondFees(kesem, 0.0033)).toBeCloseTo(0.02305, 12);
  });
  it("bands A-07 by the year's own fees, and uses today's for a year without them", () => {
    const r = trackingBeyondFeesRange(mtf90, 0.00705)!;
    expect(r.low).toBe(0);
    expect(r.high).toBeCloseTo((0.89 - 0.675) / 100, 12);
    const mixed = [mtf90[0]!, { year: 2024, fund_pct: 30.26, tracking_pct: 30.86 }];
    expect(trackingBeyondFees(mixed, 0.00705)).toBeCloseTo((0.215 + (0.6 - 0.705)) / 2 / 100, 12);
  });
});

describe("F-92 (b) the variable fee counted forward (pass 6, the lead's decision of 2026-11-07)", () => {
  // Kesem 5139696, annual report 2025: paid back 0.215% in its one year, at today's 0.3% rate (no change in its table of changes)
  const kesem = [{ year: 2025, fund_pct: 18.2, tracking_pct: 20.32, fees_charged: { fixed: 0, variable: -0.215, trustee: 0.03 } }];
  it("is the mean charged over the years, not the listed rate: the fund's past cost forward, not that cost plus the rate again", () => {
    expect(variableForward(kesem, null)).toBeCloseTo(-0.00215, 12);
    // forward fees + A-07 = the past shortfall: 0 fixed + 0.03 trustee − 0.215 variable + 2.305 beyond = 2.12 points (was 2.635 with 0.3 listed)
    expect(0 + 0.0003 + variableForward(kesem, null)! + trackingBeyondFees(kesem, 0.0033)!).toBeCloseTo(0.0212, 12);
  });
  // MTF MSCI World 5122569: variable 0% -> 0.3% on 1.1.24 (its table of changes, p. 8); charged 0, 0, 0.3, 0.23 in 2022 to 2025
  const mtf = [
    { year: 2025, fund_pct: 4.68, tracking_pct: 4.96, fees_charged: { fixed: 0.25, variable: 0.23, trustee: 0.02 } },
    { year: 2024, fund_pct: 21.18, tracking_pct: 21.37, fees_charged: { fixed: 0.25, variable: 0.3, trustee: 0.02 } },
    { year: 2023, fund_pct: 28.01, tracking_pct: 27.46, fees_charged: { fixed: 0.37, variable: 0, trustee: 0.02 } },
    { year: 2022, fund_pct: -7.81, tracking_pct: -7.82, fees_charged: { fixed: 0.37, variable: 0, trustee: 0.02 } },
  ];
  it("counts only the years charged at today's rate: a year at a 0% rate says nothing of 0.3%", () => {
    expect(variableForward(mtf, "2024-01-01")).toBeCloseTo((0.3 + 0.23) / 2 / 100, 12);
    expect(variableForward(mtf, null)).toBeCloseTo((0.23 + 0.3) / 4 / 100, 12);
  });
  it("gives no figure where no whole year is at today's rate, or the record does not say since when (the listed rate stands)", () => {
    expect(variableForward(mtf, "2026-01-01")).toBeNull();
    expect(variableForward(mtf, undefined)).toBeNull();
    expect(variableForward(mtf.map(({ fees_charged: _, ...y }) => y), null)).toBeNull();
    expect(variableForward([], null)).toBeNull();
  });
  it("starts at the first whole calendar year at the rate", () => {
    expect(firstFullYear("2024-01-01")).toBe(2024);
    expect(firstFullYear("2023-02-27")).toBe(2024);
    expect(variableForward(mtf, "2023-02-27")).toBeCloseTo((0.3 + 0.23) / 2 / 100, 12);
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
    expect(r.gaps.hedged!.low).toBeCloseTo(-3.26, 6);
    expect(r.gaps.hedged!.high).toBeCloseTo(-2.11, 6);
    expect(r.gaps.unhedged!.count).toBe(5);
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

describe("F-95 with F-92 (d): the gaps only over compared years", () => {
  const dollar = [{ year: 2025, pct: -12 }, { year: 2024, pct: 1 }];
  const un = { hedged: false, years: ahead };
  const he = { hedged: true, years: hedged.filter((y) => y.year >= 2024) };
  it("leaves a fund whose years are not compared out of its kind's gaps, never out of its returns", () => {
    const off = { hedged: false, years: [{ year: 2025, fund_pct: 9, tracking_pct: 2.61 }, { year: 2024, fund_pct: 30, tracking_pct: 24.96 }], compared: false };
    const all = kindRecord([un, he, off], dollar)!;
    // the returns count it: 9% is the unhedged high in 2025
    expect(all.years.find((y) => y.year === 2025)!.unhedged.high).toBe(9);
    // the gaps do not: they are the compared fund's alone
    expect(all.gaps.unhedged).toEqual(kindRecord([un, he], dollar)!.gaps.unhedged);
  });
  it("gives no gap for a kind with no compared year", () => {
    const r = kindRecord([un, { ...he, compared: false }], dollar)!;
    expect(r.gaps.hedged).toBeNull();
    expect(r.gaps.unhedged).not.toBeNull();
  });
});

describe("F-92 (d) the years a gap rests on", () => {
  const years = [{ year: 2025, fund_pct: 17.58, tracking_pct: 17.43 }];
  it("takes a record's years against a net index, foreign or Israeli alike", () => {
    expect(comparedYears({ years, benchmark: { name: "MSCI World Index (Net)", dividends: "net" } })).toBe(years);
    expect(comparedYears({ years, benchmark: { name: "S&P 500 - NTR", dividends: "net" } })).toBe(years);
  });
  it("takes none where no official document says how the index counts dividends, Israeli reports included ('ת\"א-35')", () => {
    expect(comparedYears({ years, benchmark: { name: "S&P 500 Index", dividends: "unstated" } })).toBeNull();
    expect(comparedYears({ years, benchmark: { name: 'ת"א-35', dividends: "unstated" } })).toBeNull();
    expect(comparedYears(undefined)).toBeNull();
  });
  const gross = { years, benchmark: { name: 'ת"א 90', dividends: "gross" as const } };
  const net = { years, benchmark: { name: "S&P 500 - NTR", dividends: "net" as const } };
  it("takes a gross index's years for an exempt fund on TA-35, TA-90 or TA-125 when every fund on its list uses a gross series (TA-90's GTR, ETF-45)", () => {
    expect(comparedYears(gross, { untaxed: true, peers: [gross, undefined, gross] })).toBe(years);
    // a fund with no years compares against nothing, so it does not stop the others
    expect(comparedYears(gross, { untaxed: true, peers: [] })).toBe(years);
  });
  it("takes none against a gross index without the list, when the fund pays tax on the dividends, or beside a fund measured against a net or unstated index", () => {
    expect(comparedYears(gross)).toBeNull();
    expect(comparedYears(gross, { untaxed: false, peers: [gross] })).toBeNull();
    expect(comparedYears(gross, { untaxed: true, peers: [gross, net] })).toBeNull();
    expect(comparedYears(gross, { untaxed: true, peers: [{ ...gross, benchmark: { ...gross.benchmark, dividends: "unstated" } }] })).toBeNull();
    // a net record stands whatever its list
    expect(comparedYears(net, { untaxed: false, peers: [gross] })).toBe(years);
  });
  it("an exempt Israeli fund on TA-35, TA-90 or TA-125, by name, has its Israeli income exempt (TXS-08); no other index, and no taxable or foreign fund (S2)", () => {
    const exempt = { domicile: "IL", tax_status: { il_fund_tax_track: "exempt" } };
    for (const id of ["index-ta35", "index-ta90", "index-ta125"]) expect(incomeUntaxed(exempt, { id }), id).toBe(true);
    // a shekel equity index the method does not name is not admitted, nor a foreign or bond index
    for (const id of ["index-ta-sector-banks", "index-tel-bond-60", "index-sp500", "index-msci-world"]) expect(incomeUntaxed(exempt, { id }), id).toBe(false);
    expect(incomeUntaxed({ ...exempt, tax_status: { il_fund_tax_track: "taxable" } }, { id: "index-ta125" })).toBe(false);
    expect(incomeUntaxed({ ...exempt, domicile: "IE" }, { id: "index-ta125" })).toBe(false);
    expect(incomeUntaxed(exempt, undefined)).toBe(false);
  });
  it("a record with no year is not compared: null, never an empty list (S4)", () => {
    const empty = { years: [], benchmark: { name: "x", dividends: "net" as const } };
    expect(comparedYears(empty)).toBeNull();
    expect(comparedYears({ ...empty, benchmark: { name: "x", dividends: "gross" as const } }, { untaxed: true, peers: [] })).toBeNull();
    // the guard that reads "compared" (comparedYears !== null) does not pass on nothing
    expect(comparedYears(empty) !== null).toBe(false);
  });
  it("the list is every other fund on the index", () => {
    const a = { id: "a", domicile: "IL", tax_status: { il_fund_tax_track: "exempt" }, tracking_record: gross };
    const b = { id: "b", domicile: "IL", tax_status: { il_fund_tax_track: "exempt" } };
    const list = gapListOf(a, { id: "index-ta125" }, [a, b]);
    expect(list).toEqual({ untaxed: true, peers: [undefined] });
    expect(comparedYears(a.tracking_record, list)).toBe(years);
  });
});
