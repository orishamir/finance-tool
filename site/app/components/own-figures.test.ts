// D31 on screen: no caution icon on a company's figure about its own product; the icon stays on one out of context.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { FundVariantRowView } from "../lib/variants";
import type { SiteValue } from "../lib/value";
import { Num, NumberLegend, ProvenanceProvider, ValueSheet } from "./provenance";
import { FundFeesBlock } from "./workbench/funds/parts";

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
});

describe("a fund row", () => {
  const row = {
    fees: { fixed_management: fee({ own: "הראל" }), trustee: fee({ value: 0.005, own: "הראל" }), variable_management: fee({ value: 0.1, own: "הראל" }), tracking_difference_12m: null, median_spread: null },
    takenAsZero: [],
  } as unknown as FundVariantRowView;
  it("has fee figures and no caution icon", () => {
    const html = inProvider(createElement(FundFeesBlock, { row }));
    expect(html).toContain("0.24");
    expect(caution(html)).toBe(0);
  });
});

describe("the legend", () => {
  it("leaves the company item out unless the page has an out-of-context company figure", () => {
    expect(renderToStaticMarkup(createElement(NumberLegend, null))).not.toContain("לפי החברה");
    expect(renderToStaticMarkup(createElement(NumberLegend, { institution: true }))).toContain("לפי החברה");
  });
});
