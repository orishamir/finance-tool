// Golden expected values, copied from tests/golden/scenarios.md ("Independent check" lines, approved by
// the founder) and, for year-end series, from tests/golden/workings.md. Never edit a value here to make a
// test pass: golden.test.ts checks that every value below appears verbatim in its scenario's section.
import { readFileSync } from "node:fs";

const root = new URL("../../../../", import.meta.url);
const scenarios = readFileSync(new URL("tests/golden/scenarios.md", root), "utf8");
const workings = readFileSync(new URL("tests/golden/workings.md", root), "utf8");
const toleranceFile = JSON.parse(
  readFileSync(new URL("data/parameters/golden-tolerance.json", root), "utf8"),
);

/** P-06: 1 NIS or 0.01%, whichever is larger (docs/parameters-rationale.md). */
export const tolerance = {
  absNis: toleranceFile.abs_nis.value as number,
  relPct: toleranceFile.rel_pct.value as number,
};

export function withinTolerance(actual: number, expected: number): boolean {
  const allowed = Math.max(tolerance.absNis, (Math.abs(expected) * tolerance.relPct) / 100);
  return Math.abs(actual - expected) <= allowed;
}

/** The text of one scenario in scenarios.md and in workings.md, e.g. "S14". */
export function sectionText(id: string): string {
  const pick = (doc: string) => {
    const start = doc.search(new RegExp(`^### ${id} `, "m"));
    if (start < 0) return "";
    const rest = doc.slice(start + 4);
    const end = rest.search(/^#{2,3} /m);
    return end < 0 ? rest : rest.slice(0, end);
  };
  return `${pick(scenarios)}\n${pick(workings)}`;
}

/** 86024.8 → "86,024.80", the way the scenario text prints it. */
export function printed(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Whether the scenario text prints this value: "83,641.00" may be printed "83,641", and zero as "0". */
export function isPrinted(text: string, value: number): boolean {
  const forms = [printed(value)];
  if (Number.isInteger(value)) forms.push(value.toLocaleString("en-US"));
  return forms.some((f) => new RegExp(`(^|[^\\d.,])${f.replace(/[.,]/g, "\\$&")}(?![\\d]|[.,]\\d)`).test(text));
}

// Release 2 comparison scenarios (S39, S40, S41, S50), copied from the "Independent check" lines in
// scenarios.md and the tables in workings.md. r2-compare.test.ts checks each against its scenario text.
export const r2Expected = {
  s39: {
    brokerageReal: 572_640.51,
    brokerageNominal: 938_338.16,
    kglReal: 630_640.9,
    kglAltReal: 629_850.66,
    /** Fee drag (real, V without fees minus V): brokerage and kupat gemel lehashkaa; tax at exit likewise. */
    feeDragBrokerage: 113_833.04,
    feeDragKgl: 55_832.65,
    taxBrokerage: 31_048.97,
    taxKgl: 40_213.63,
    /** Brokerage minus kupat gemel lehashkaa (the runner-up minus the top). */
    feeDragGap: 58_000.39,
    taxGap: -9_164.67,
    /** Relative gap between the top two, in percent, printed "9.20%". */
    gapPct: 9.2,
  },
  s40: {
    /** Real value at 4 years, best first, with the nominal value (workings table). */
    ranked: [
      { id: "makam", real: 296_362.17, nominal: 327_128.38 },
      { id: "bank-deposit", real: 296_034.36, nominal: 326_766.55 },
      { id: "money-market-fund-daily", real: 295_594.33, nominal: 326_280.83 },
      { id: "brokerage-account", real: 293_119.64, nominal: 323_549.24 },
      { id: "government-bond", real: 291_761.83, nominal: 322_050.47 },
      { id: "current-account", real: 276_722.74, nominal: 305_450.13 },
    ],
    paid: 302_009.7,
    gapPct: 0.11,
    keptNominal: 50_855.14,
    keptReal: 46_072.25,
    routed: 65_006.55,
    kglValueOnWhatItTakes: 258_650.91,
    coverage: { considered: 26, ranked: 6, listed: 7, notEligible: 2, excluded: 0, notEvaluated: 11 },
  },
  s41: {
    amount: 60_000,
    costs: { average: 113.12, ownOffer: 129.69, makam: 142.07, fund: 129.13 },
    coverage: { considered: 26, baseline: 1, compared: 3, notEligible: 2, notEvaluated: 20 },
  },
  s50: { bankA2: 132_426.4, bankA: 132_353.91, gapPct: 0.05 },
};

// Release 3 scenarios (S42, S43, S46), copied from the "Independent check" lines in scenarios.md.
// r3.test.ts checks each against its scenario text.
export const r3Expected = {
  s42: {
    realWithFees: 300_266.26,
    totalDrag: 20_664.79,
    balanceFee: 17_901.59,
    directExpenses: 2_587.05,
    interaction: 176.15,
    /** Cutting the balance fee from 0.74% to 0.34%. */
    reduction: 9_530.01,
  },
  s43: {
    custody: 5_032.56,
    trade: 3_068.41,
    fx: 1_213.4,
    fund: 207.68,
    spread: 75.28,
    interaction: 106.09,
    totalDrag: 9_703.42,
    realWithFees: 236_360.08,
  },
  s46: {
    /** Fee cost over 15 years, real: 0.9% on 80,000; 0.6% on 40,000; moving the 80,000 into the 0.6% fund. */
    cost80: 16_723.25,
    cost40: 5_698.23,
    moveValue: 5_326.8,
  },
};

// Release 4 scenarios: S38 (switching cost, F-66) and S44, S45 (provider workbench, F-63), copied from the
// "Independent check" lines in scenarios.md and the tables in workings.md. r4.test.ts checks each against its scenario text.
/** One provider row of S44: horizon cost (real), year-1 cost (nominal, liquidation value at 12), year-1 fees paid, and the cost by type (real, horizon). */
interface S44Row {
  cost: number;
  year1: number;
  fees1: number;
  trade: number;
  custody: number;
  fixed: number;
}
export const r4Expected = {
  s38: {
    realNoSwitch: 106_368.36,
    realWithSwitch: 105_721.95,
    cost: 646.4,
    taxAtSwitch: 1_649.27,
    /** (b): a track switch costs nothing (TXK-04). */
    providentCost: 0,
  },
  s44: {
    oneOrder: {
      cAverage: { cost: 1_023.22, year1: 187.19, fees1: 228.65, trade: 191.6, custody: 0, fixed: 830.99 },
      cList: { cost: 1_422.01, year1: 272.38, fees1: 312.09, trade: 590.39, custody: 0, fixed: 830.9 },
      bAverage: { cost: 2_199.41, year1: 227.65, fees1: 255.77, trade: 514.4, custody: 1_678.27, fixed: 0 },
      aAverage: { cost: 2_667.9, year1: 264.44, fees1: 299.66, trade: 566.55, custody: 2_092.02, fixed: 0 },
      /** S45: bank A with an entered 0.1% min 10. */
      aEntered: { cost: 2_828.84, year1: 284.65, fees1: 318.78, trade: 727.49, custody: 2_090.08, fixed: 0 },
      bList: { cost: 3_803.34, year1: 579.41, fees1: 600.06, trade: 2_118.34, custody: 1_659.04, fixed: 0 },
      aList: { cost: 3_990.32, year1: 558.28, fees1: 587.49, trade: 1_888.97, custody: 2_071.91, fixed: 0 },
    } satisfies Record<string, S44Row>,
    tenOrders: {
      cAverage: { cost: 1_023.22, year1: 187.19, fees1: 228.65, trade: 191.6, custody: 0, fixed: 830.99 },
      bAverage: { cost: 2_199.41, year1: 227.65, fees1: 255.77, trade: 514.4, custody: 1_678.27, fixed: 0 },
      aAverage: { cost: 2_667.9, year1: 264.44, fees1: 299.66, trade: 566.55, custody: 2_092.02, fixed: 0 },
      cList: { cost: 5_666.73, year1: 1_154.33, fees1: 1_175.38, trade: 4_835.12, custody: 0, fixed: 830.9 },
      aEntered: { cost: 8_056.19, year1: 1_383.75, fees1: 1_393.56, trade: 5_954.84, custody: 2_012.6, fixed: 0 },
      aList: { cost: 17_032.17, year1: 3_300.51, fees1: 3_268.92, trade: 14_930.82, custody: 1_878.62, fixed: 0 },
      bList: { cost: 19_508.61, year1: 3_874.36, fees1: 3_822.86, trade: 17_823.61, custody: 1_474.06, fixed: 0 },
    } satisfies Record<string, S44Row>,
    /** The two cheapest at each level, the gap between their costs, the deciding fee type's gap by type (second minus top), and the tie measure in percent. */
    deciding: {
      oneOrderList: { costGap: 2_381.34, trade: 1_527.95, custody: 1_659.04, fixed: -830.9, tiePct: 1.76 },
      oneOrderAverage: { costGap: 1_176.19, trade: 322.8, custody: 1_678.27, fixed: -830.99, tiePct: 0.87 },
      tenOrdersList: { costGap: 11_365.43, trade: 10_095.7, custody: 1_878.62, fixed: -830.9, tiePct: 8.7 },
      tenOrdersAverage: { costGap: 1_176.19, trade: 322.8, custody: 1_678.27, fixed: -830.99, tiePct: 0.87 },
    },
  },
};

// Release 5 scenarios (S48, S49), copied from the "Independent check" lines in scenarios.md.
// r5.test.ts checks each against its scenario text.
export const r5Expected = {
  s48: {
    /** TXS-09 rate, percent: saved and test copy. */
    rateBefore: 25,
    rateAfter: 30,
    brokerageRealBefore: 572_640.51,
    brokerageRealAfter: 566_430.72,
    brokerageNominalBefore: 938_338.16,
    brokerageNominalAfter: 928_162.69,
    /** Kupat gemel lehashkaa, unchanged: its exit tax comes from TXK-07. */
    kglReal: 630_640.9,
    /** Gap between the top two after the change, in percent, printed "10.18%". */
    gapPct: 10.18,
  },
  s49: {
    cashReal: 534_012.31,
    bondsReal: 495_867.6,
    /** Relative gap between cash and bonds, in percent, printed "7.14%". */
    gapPct: 7.14,
    /** Worst falls and the largest fall accepted, percent. */
    worstFall: { bonds: 10, equity: 40 },
    accepted: 30,
  },
};
