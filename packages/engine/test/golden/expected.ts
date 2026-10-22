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
