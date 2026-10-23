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
