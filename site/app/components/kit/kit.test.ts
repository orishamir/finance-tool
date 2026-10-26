// The kit renders: every component of the gallery produces its name and states, a fold shows its own label whatever its neighbours do,
// and the sentence has no layout prop.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProvenanceProvider } from "../provenance";
import { Disclosure, Sentence, Stat, StatRow } from "./index";
import { KitGallery } from "./gallery";

const today = "2026-10-25";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el })));

describe("the gallery", () => {
  const out = html(createElement(KitGallery, { today }));
  it("names every component of the kit", () => {
    for (const name of ["Button, LinkButton", "Tag", "Callout", "Card, pad", "Section", "Disclosure", "FoldGroup", "CoverageFold", "SegmentedControl", "ChoiceChips", "ChipList", "PlanChips", "Sentence, Tpl", "Stat, StatRow", "KeyValue, KeyValueList", "HeadlineFigure", "RankBadge", "SourceLine, GapNote", "NumberField", "FieldState, ParameterLine", "RangeField", "PercentField", "SelectField", "StepButtons", "Marker, MarkerMark, LaneLabel", "GainBars", "ChartLegend, Swatch, ChartReadout, ChartTable"]) {
      expect(out, name).toContain(`>${name}</code>`);
    }
  });
  it("leaves no template place unfilled", () => {
    expect(out).not.toMatch(/\{(a|b|n)\}/);
  });
});

describe("Disclosure", () => {
  it("a closed fold inside an open fold shows its closed label", () => {
    const inner = createElement(Disclosure, { label: "OPEN-THE-INNER", openLabel: "HIDE-THE-INNER", children: "x" });
    const out = renderToString(createElement(Disclosure, { label: "OPEN-THE-OUTER", openLabel: "HIDE-THE-OUTER", defaultOpen: true, children: inner }));
    expect(out).toContain("HIDE-THE-OUTER");
    expect(out).toContain("OPEN-THE-INNER");
    expect(out).not.toContain("HIDE-THE-INNER");
    expect(out).not.toContain("OPEN-THE-OUTER");
  });
  it("carries no group-open variant in its markup", () => {
    expect(renderToString(createElement(Disclosure, { label: "a", defaultOpen: true, children: "b" }))).not.toContain("group-open");
  });
});

describe("Sentence and Stat", () => {
  it("a sentence is plain inline text", () => {
    const out = renderToString(createElement(Sentence, { size: "sm", tone: "muted", children: "a b c" }));
    expect(out).toBe('<p class="text-sm text-muted-foreground">a b c</p>');
    expect(renderToString(createElement(Sentence, { t: "x {n} y", vars: { n: "7" } })).replace(/<!-- -->/g, "")).toBe("<p>x 7 y</p>");
  });
  it("a stat row is a definition list", () => {
    const out = renderToString(createElement(StatRow, { cols: 3, children: createElement(Stat, { label: "L", note: "N", children: "V" }) }));
    expect(out).toContain("<dl");
    expect(out).toContain("<dt");
    expect(out).toContain("sm:grid-cols-3");
  });
});
