// A chart field's value is a plain number (guidelines/charts.md): its default and what the reader types look alike,
// with no site-parameter tag, no "you entered" mark and nothing that opens; a calculation sheet lists it plainly; the site's real
// parameters keep their tag; each field carries "↺ חזרה ל־{start}" on its label line, kept in place while hidden.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { numbers, strength } from "../copy";
import { asField, computed, entered, type SiteValue } from "../lib/value";
import { Num, ProvenanceProvider } from "./provenance";
import { ValueSheet } from "./provenance-sheets";
import { InputSlot, NumberField, RangeField } from "./kit";

const today = "2026-11-08";
/** A site parameter as the data holds it (update rule "founder", sourced): P-05's amount, or P-01's tie threshold. */
const parameter = (value: number, unit: SiteValue["unit"]): SiteValue => ({
  value,
  unit,
  source: { url: "data/parameters/illustrative-scenario.json", title: "P-05", publisher: "האתר", strength: "primary" },
  checked: today,
  effective_from: null,
  effective_to: null,
  update_rule: "founder",
  state: "sourced",
});

const data = { rules: {}, terms: {}, dimensions: {}, today };
/** The markup of `child` alone, without the sheet the provider keeps closed after it. */
const html = (child: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: child }))).split("<dialog")[0]!;

describe("a field's value in a sentence", () => {
  it("is plain text: no button, no parameter word, no state class", () => {
    for (const v of [asField(parameter(12000, "nis")), asField(entered(15000, "nis", today))]) {
      const out = html(createElement(InputSlot, { children: createElement(Num, { value: v }) }));
      expect(out).not.toContain("<button");
      expect(out).not.toContain(numbers.parameter);
      expect(out).not.toMatch(/num-(sourced|entered)/);
    }
  });
  it("a real parameter, not a field's, still opens and says it is the site's", () => {
    const out = html(createElement(Num, { value: parameter(0.5, "pct") }));
    expect(out).toContain("<button");
    expect(out).toContain(numbers.parameter);
  });
});

describe("a calculation sheet", () => {
  it("lists a field's value plainly and keeps a real parameter's tag", () => {
    const result = computed(9844, "nis", "F-67", { "סכום היום": asField(parameter(12000, "nis")), "סף התיקו": parameter(0.5, "pct") }, { today });
    const out = html(createElement(ValueSheet, { value: result, exact: false, data, headId: "h", descId: "d" }));
    const row = (name: string) => out.split("readout-row").find((r) => r.includes(name)) ?? "";
    expect(row("סכום היום")).toContain("12,000");
    expect(row("סכום היום")).not.toContain(numbers.parameter);
    expect(row("סכום היום")).not.toContain("<button");
    expect(row("סף התיקו")).toContain(numbers.parameter);
    expect(out).not.toContain(strength.entered.label);
  });
});

describe("a field's reset on its label line", () => {
  const field = (value: number) =>
    renderToStaticMarkup(createElement(NumberField, { label: "סכום היום", unit: "nis", value, start: 12000, isEntered: value !== 12000, validate: () => null, onCommit: () => undefined, onReset: () => undefined }));
  it("holds its place, hidden, while the value is the default, and says the default once it differs", () => {
    const start = field(12000);
    const changed = field(15000);
    expect(start).toContain("12,000");
    expect(start).toMatch(/class="[^"]*\binvisible\b[^"]*"[^>]*>(?:(?!<\/button>).)*12,000/);
    expect(changed).not.toMatch(/\binvisible\b/);
    for (const out of [start, changed]) {
      expect(out).not.toContain(strength.entered.label);
      expect(out).not.toContain("field-box-entered");
      expect(out).not.toContain("text-entered");
    }
  });
  it("a slider's reset says the default as the box shows it", () => {
    const out = renderToStaticMarkup(createElement(RangeField, { label: "כמה שנים", unit: "years", value: 25, start: 10, isEntered: true, min: 1, max: 40, step: 1, validate: () => null, onCommit: () => undefined, onReset: () => undefined }));
    expect(out).toMatch(/חזרה ל־<bdi dir="ltr">10<\/bdi>/);
    expect(out).not.toContain(strength.entered.label);
  });
});
