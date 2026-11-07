// D31 on screen: no caution icon on a company's figure about its own product; the icon stays on one out of context.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { computed, type SiteValue } from "../lib/value";
import { inputRuns, Num, NumberLegend, ProvenanceProvider, ValueSheet } from "./provenance";
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
  // fresh readers, 2026-11-07: a gap's sheet printed the same report under each year's two figures, put its definition last, and dropped the sign
  it("names a document once under the inputs read from it in a row, and again only where the next input comes from elsewhere", () => {
    const other = fee({ own: "הראל", source: { url: "https://example.org/other.pdf", title: "מסמך אחר", publisher: "הראל", strength: "institution" } });
    const inputs = { a: fee({ own: "הראל" }), b: fee({ own: "הראל", value: 1 }), c: other, d: fee({ own: "הראל", value: 2 }) };
    expect(inputRuns(inputs).map((x) => x.closes)).toEqual([0, 2, 1, 1]);
    // the same document at another page is another place
    const paged = fee({ own: "הראל", source: { ...fee().source, page: 2 } as SiteValue["source"] });
    expect(inputRuns({ a: fee({ own: "הראל" }), b: paged }).map((x) => x.closes)).toEqual([1, 1]);
    const html = sheet(computed(0.37, "pct_per_year", "F-92", inputs, { today: "2026-11-07", lead: "מה המספר אומר", signed: true }));
    expect(html.split("הדוח של הראל על הקרן").length - 1).toBe(2);
    expect(html.split("מסמך אחר").length - 1).toBe(1);
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
