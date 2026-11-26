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
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { ValueSheet } from "./provenance-sheets";

const today = "2026-11-26";
const tex = loadFormulaTex();
const data: ProvenanceData = { rules: {}, terms: {}, dimensions: {}, today, formulas: Object.fromEntries(Object.entries(tex).map(([id, t]) => [id, { name: formulaNames[id] ?? "", parameters: [], tex: t }])) };
/** The sheet's words in order, its markup's text alone. */
const sheet = (value: SiteValue) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ValueSheet, { value, exact: false, data, headId: "h", descId: "d" }) })))
    .split("<dialog")[0]!
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
const sourced = (value: number, unit: SiteValue["unit"]): SiteValue => ({ value, unit, source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "primary" }, checked: today, effective_from: null, effective_to: null, update_rule: "market", state: "sourced" });

describe("a difference's or a sum's sheet", () => {
  it("shows its lines with a minus at the start of the line taken away, then = and the result, and no formula chip", () => {
    const out = sheet(differenceOf(["נשאר לכם", entered(102_345, "nis", today)], ["הפקדתם", entered(70_000, "nis", today)], "F-91", { today }));
    expect(out).toContain(provenance.computed.working);
    expect(out).toMatch(/נשאר לכם .*− הפקדתם .*= 32,345 ₪/);
    expect(out).not.toContain(formulaNames["F-91"]!);
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
    for (const [, words] of formulaKeys["F-87"]!.symbols) expect(out).toContain(words);
    expect(out).toContain("1,325.38");
    expect(out).not.toContain(provenance.computed.inputs);
    expect(out).toContain(provenance.computed.toFormula);
    expect(out.indexOf(formulaKeys["F-87"]!.symbols[1]![1])).toBeLessThan(out.indexOf(provenance.computed.toFormula));
  });
  it("where the page holds no math for the entry, shows the formula's chip and the inputs, as any other figure", () => {
    const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { ...data, formulas: {} }, children: createElement(ValueSheet, { value: share, exact: false, data: { ...data, formulas: {} }, headId: "h", descId: "d" }) }))).replace(/<[^>]+>/g, " ");
    expect(out).toContain(provenance.computed.inputs);
    expect(out).toContain(formulaNames["F-87"]!);
  });
});
