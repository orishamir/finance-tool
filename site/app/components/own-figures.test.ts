// D31 on screen: no caution icon on a company's figure about its own product; the icon stays on one out of context.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { computed, type SiteValue } from "../lib/value";
import { Num, NumberLegend, ProvenanceProvider, ValueSheet } from "./provenance";
import { FeeFigure } from "./kit";

const fee = (extra: Partial<SiteValue> = {}): SiteValue => ({
  value: 0.24,
  unit: "pct_per_year",
  source: { url: "https://example.org/harel.pdf", title: "הדוח של הראל על הקרן", publisher: "הראל", strength: "institution" },
  checked: "2026-09-30",
  effective_from: null,
  effective_to: null,
  update_rule: "provider-set",
  state: "sourced",
  ...extra,
});

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" };
const inProvider = (child: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: child })));
// the caution mark is the triangle icon with the caution colour
const caution = (html: string) => (html.match(/text-caution/g) ?? []).length;

describe("Num", () => {
  it("shows no caution icon for a company's own figure", () => {
    expect(caution(inProvider(createElement(Num, { value: fee({ own: "הראל" }) })))).toBe(0);
  });
  it("shows the caution icon for a company's figure out of context", () => {
    expect(caution(inProvider(createElement(Num, { value: fee() })))).toBeGreaterThan(0);
  });
  it("does not say 'לפי החברה' in the label of an own figure", () => {
    expect(inProvider(createElement(Num, { value: fee({ own: "הראל" }) }))).not.toContain("לפי החברה");
    expect(inProvider(createElement(Num, { value: fee() }))).toContain("לפי החברה");
  });
});

describe("the sheet", () => {
  const sheet = (v: SiteValue) => inProvider(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }));
  it("an own figure shows its source line and no amber block", () => {
    const html = sheet(fee({ own: "הראל" }));
    expect(html).toContain("הדוח של הראל על הקרן");
    expect(html).not.toContain("לפי החברה");
  });
  it("an out-of-context figure keeps the amber block", () => {
    expect(sheet(fee())).toContain("לפי החברה");
  });
  // founder, 2026-11-08: each input opens its own sheet with its source, so a computed figure's sheet prints none under its inputs
  it("names no input's source: each input is a figure that opens its own sheet", () => {
    const other = fee({ own: "הראל", source: { url: "https://example.org/other.pdf", title: "מסמך אחר", publisher: "הראל", strength: "institution" } });
    const html = sheet(computed(0.37, "pct_per_year", "F-92", { a: fee({ own: "הראל" }), b: other }, { today: "2026-11-07", lead: "מה המספר אומר", signed: true }));
    expect(html).not.toContain("הדוח של הראל על הקרן");
    expect(html).not.toContain("מסמך אחר");
  });
  it("heads a signed figure with its sign and says what it means before the formula", () => {
    const html = sheet(computed(0.37, "pct_per_year", "F-92", { a: fee({ own: "הראל" }) }, { today: "2026-11-07", lead: "מה המספר אומר", signed: true }));
    expect(html).toContain("+0.37%");
    expect(html.indexOf("מה המספר אומר")).toBeLessThan(html.indexOf("F-92"));
    expect(sheet(computed(-0.37, "pct_per_year", "F-92", {}, { today: "2026-11-07", signed: true }))).toContain("−0.37%");
  });
});

describe("a fund's fee in a list of funds", () => {
  it("has the figure and no caution icon", () => {
    const html = inProvider(createElement(FeeFigure, { value: fee({ own: "הראל" }) }));
    expect(html).toContain("0.24");
    expect(caution(html)).toBe(0);
  });
});

describe("the legend", () => {
  it("leaves the company item out unless the page has an out-of-context company figure", () => {
    // the words as read: the item's icon is held to its first word by a span of its own
    const words = (props: { institution?: boolean } | null) => renderToStaticMarkup(createElement(NumberLegend, props)).replace(/<[^>]+>/g, "");
    expect(words(null)).not.toContain("לפי החברה");
    expect(words({ institution: true })).toContain("לפי החברה");
  });
});
