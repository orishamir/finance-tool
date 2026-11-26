// A computed figure's sheet shows its working (docs/design-system.md 3.2): a difference or a sum as the lines of a receipt with their signs
// and the result, no formula chip; a line of math as its key, each input beside its symbol and listed nowhere else, with the way to the
// formula's own sheet; any other figure, its formula's chip and its inputs.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { formulaKeys, formulaNames, provenance } from "../copy";
import { loadFormulaTex } from "../lib/data.server";
import { computed, differenceOf, entered, sumOf, type SiteValue } from "../lib/value";
import { paidInWorking, symbolsIn } from "../lib/working";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { ValueSheet } from "./provenance-sheets";

const today = "2026-11-26";
const tex = loadFormulaTex();
const data: ProvenanceData = { rules: {}, terms: {}, dimensions: {}, today, formulas: Object.fromEntries(Object.entries(tex).map(([id, t]) => [id, { name: formulaNames[id] ?? "", parameters: [], tex: t }])) };
/** The sheet's words in order, its markup's text alone. */
const markup = (value: SiteValue, d: ProvenanceData) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: d } as never, createElement(ValueSheet, { value, exact: false, data: d, headId: "h", descId: "d" }))));
const sheet = (value: SiteValue) =>
  (markup(value, data).split("<dialog")[0] ?? "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
const sourced = (value: number, unit: SiteValue["unit"]): SiteValue => ({ value, unit, source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "primary" }, checked: today, effective_from: null, effective_to: null, update_rule: "market", state: "sourced" });

describe("a difference's or a sum's sheet", () => {
  it("shows its lines with a minus at the start of the line taken away, then = and the result, and no formula chip", () => {
    const out = sheet(differenceOf(["נשאר לכם", entered(102_345, "nis", today)], ["הפקדתם", entered(70_000, "nis", today)], "F-91", { today }));
    expect(out).toContain(provenance.computed.working);
    expect(out).toMatch(/נשאר לכם .*− הפקדתם .*= 32,345 ₪/);
    expect(out).not.toContain(formulaNames["F-91"] ?? "F-91");
    expect(out).not.toContain(provenance.computed.inputs);
  });
  it("a sum, with a plus before each line after the first", () => {
    const out = sheet(sumOf({ "קנייה": entered(120, "nis", today), "משמרת": entered(30, "nis", today), "המרה": entered(5, "nis", today) }, "F-91", { today }));
    expect(out).toMatch(/קנייה .*\+ משמרת .*\+ המרה .*= 155 ₪/);
  });
});

describe("the sheet of a figure that is a line of math", () => {
  const inputs = { "החשיפה לשוק המניות": sourced(1325.38, "nis_millions"), "סך נכסי המסלול": sourced(1332.41, "nis_millions") };
  const share = computed((1325.38 / 1332.41) * 100, "pct", "F-87", inputs, { today, working: { kind: "formula", entry: "F-87", line: 0, symbols: { "החשיפה לשוק המניות": "E", "סך נכסי המסלול": "A" } } });
  it("keys each symbol to its words with the figure's input beside it, lists no input twice, and ends with the way to the formula's sheet", () => {
    const out = sheet(share);
    const key = formulaKeys["F-87"]?.symbols ?? [];
    expect(key.length).toBe(3);
    // the symbol the line works out is the figure the sheet heads with: its row points there
    for (const [, words] of key.slice(1)) expect(out).toContain(words);
    expect(out).toContain(provenance.formulaSheet.resultRow);
    expect(out).toContain("1,325.38");
    expect(out).not.toContain(provenance.computed.inputs);
    expect(out).toContain(provenance.computed.toFormula);
    expect(out.indexOf(key[1]?.[1] ?? "E")).toBeLessThan(out.indexOf(provenance.computed.toFormula));
  });
  it("where the page holds no math for the entry, shows the formula's chip and the inputs, as any other figure", () => {
    const out = markup(share, { ...data, formulas: {} }).replace(/<[^>]+>/g, " ");
    expect(out).toContain(provenance.computed.inputs);
    expect(out).toContain(formulaNames["F-87"] ?? "F-87");
  });
});

describe("what a computed figure is, said once", () => {
  const exposure = { "החשיפה לשוק המניות": sourced(681.81, "nis_millions"), "סך נכסי המסלול": sourced(699.8, "nis_millions") };
  const fx = { "החשיפה למטבע חוץ": sourced(10, "nis_millions"), "סך נכסי המסלול": sourced(699.8, "nis_millions") };
  const plan = { "הסכום היום": entered(10_000, "nis", today), "ההפקדה החודשית": entered(500, "nis", today), "מספר השנים": entered(10, "years", today) };
  const sheets = [
    { entry: "F-87", value: computed((681.81 / 699.8) * 100, "pct", "F-87", exposure, { today, about: "החלק מנכסי המסלול שחשוף לשוק המניות בסוף אוקטובר 2026", working: { kind: "formula", entry: "F-87", line: 0, symbols: { "החשיפה לשוק המניות": "E", "סך נכסי המסלול": "A" } } }) },
    { entry: "F-88", value: computed((10 / 699.8) * 100, "pct", "F-88", fx, { today, about: "החלק מנכסי המסלול שחשוף למטבע חוץ בסוף אוקטובר 2026", working: { kind: "formula", entry: "F-88", line: 0, symbols: { "החשיפה למטבע חוץ": "X", "סך נכסי המסלול": "A" } } }) },
    { entry: "F-106", value: computed(70_000, "nis", "F-106", plan, { today, about: "סך ההפקדות", working: paidInWorking("הסכום היום", "ההפקדה החודשית", "מספר השנים") }) },
  ] as const;

  it("in the head's line only: no name over the line of math, and the symbol it works out keyed to the head", () => {
    for (const { entry, value } of sheets) {
      const out = sheet(value);
      const key = formulaKeys[entry]?.symbols ?? [];
      expect(out.split(value.about!).length - 1, entry).toBe(1);
      // the rest of the sheet, the head's line taken out, names it in no other words
      const rest = out.replace(value.about!, "");
      expect(rest, entry).not.toContain(formulaNames[entry]);
      expect(rest, entry).not.toContain(key[0]![1]);
      expect(rest, entry).toContain(provenance.formulaSheet.resultRow);
    }
  });

  it("every symbol of the drawn line has its row in the key", () => {
    for (const { entry, value } of sheets) {
      const out = sheet(value);
      const line = data.formulas![entry]!.tex![0]!;
      const inLine = (formulaKeys[entry]?.symbols ?? []).filter(([s]) => symbolsIn(line, [s]).length > 0);
      expect(inLine.length, entry).toBeGreaterThan(1);
      for (const [, words] of inLine.slice(1)) expect(out, entry).toContain(words);
      expect(out.split(provenance.formulaSheet.resultRow).length - 1, entry).toBe(1);
    }
  });

  it("without a head's line, the line of math keeps its name", () => {
    const { value } = sheets[0];
    expect(sheet({ ...value, about: undefined })).toContain(formulaNames["F-87"]);
  });
});

