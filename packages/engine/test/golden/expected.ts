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

// S50 (a tie, F-80), copied from its "Independent check" line in scenarios.md and its table in workings.md. s50-tie.test.ts checks
// each against its scenario text.
export const r2Expected = {
  s50: { bankA2: 132_426.4, bankA: 132_353.91, gapPct: 0.05 },
};

// Release 4 scenarios: S44, S45 (provider workbench, F-63), copied from the
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
