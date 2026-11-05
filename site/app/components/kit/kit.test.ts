// The kit renders: every component of the gallery produces its name and states, a fold shows its own label whatever its neighbours do,
// and the sentence has no layout prop.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProvenanceProvider } from "../provenance";
import { Disclosure, Sentence, Stat, StatRow } from "./index";
import { isoNumbers } from "./stairs-chart";
import { figureFit } from "./pick-list";
import { KitGallery } from "./gallery";

const today = "2026-10-25";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el })));

describe("the gallery", () => {
  const out = html(createElement(KitGallery, { today }));
  it("names every component of the kit", () => {
    for (const name of ["Button, LinkButton", "Tag", "Callout", "Card, pad", "Section", "Disclosure", "FoldGroup", "CoverageFold", "SegmentedControl", "ChoiceChips", "ChipList", "PlanChips", "CostStack", "PeriodStrip", "Sentence, Tpl", "Stat, StatRow", "StairsChart, StairsTable, StairsSteps", "DiffRow, DiffHead, DiffFigure, GreyLine", "KeyValue, KeyValueList", "HeadlineFigure", "RankBadge", "SourceLine, GapNote", "NumberField", "FieldState, ParameterLine", "RangeField", "PercentField", "SelectField", "StepButtons", "Marker, MarkerMark, LaneLabel", "GainBars", "ChartLegend, Swatch, ChartReadout, ChartTable", "ShareRings"]) {
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

describe("the stairs chart's text", () => {
  it("isolates a number among Hebrew words, and leaves a number inside a Latin name to the name", () => {
    expect(isoNumbers("נשארים 79,176 ₪")).toBe("נשארים ⁦79,176 ₪⁩");
    expect(isoNumbers("+2,345 ₪ יותר")).toBe("⁦+2,345 ₪⁩ יותר");
    // isolated alone, the 4 and the 500 stepped out of the name: "S&P 500 (4D)" read "(D4) 500 S&P" (2026-11-05)
    expect(isoNumbers("ילין לפידות מחקה (4D) S&P 500")).toBe("ילין לפידות מחקה (4D) S&P 500");
    expect(isoNumbers("הראל מחקה (4D) NASDAQ 100")).toBe("הראל מחקה (4D) NASDAQ 100");
  });
});

describe("figureFit", () => {
  it("steps a list's figure down a size past nine digits and again past twelve, so its fixed column never cuts it (#190)", () => {
    expect(figureFit(86_492)).toBe("");
    expect(figureFit(99_999_999)).toBe("");
    expect(figureFit(999_999_999)).toBe("max-md:text-sm");
    expect(figureFit(1_860_753_604)).toBe("text-sm max-md:text-xs");
    expect(figureFit(-1_000_000_000)).toBe("text-sm max-md:text-xs");
    expect(figureFit(2_000_000_000_000)).toBe("text-xs");
  });
  it("steps a phone tile's figure down past seven digits, nine and eleven", () => {
    expect(figureFit(9_999_999, "tile")).toBe("");
    expect(figureFit(45_073_491, "tile")).toBe("max-md:text-xl");
    expect(figureFit(1_860_753_604, "tile")).toBe("max-md:text-lg");
    expect(figureFit(100_000_000_000, "tile")).toBe("max-md:text-base");
  });
});
