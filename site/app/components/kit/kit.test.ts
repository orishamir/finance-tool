// The kit renders: every component of the gallery produces its name and states, a fold shows its own label whatever its neighbours do,
// and the sentence has no layout prop.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProvenanceProvider, TermCard } from "../provenance";
import { Disclosure, Sentence, Stat, StatRow } from "./index";
import { isoNumbers } from "./stairs-chart";
import { figureFit, PickList, type PickRow } from "./pick-list";
import { KitGallery } from "./gallery";
import { SHORT_IN_ROW, shortBillions } from "../../lib/format";
import { gershayim, keepTitleWhole } from "./name";

const today = "2026-10-25";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el })));

describe("the gallery", () => {
  const out = html(createElement(KitGallery, { today }));
  it("names every component of the kit", () => {
    for (const name of ["Button, LinkButton", "Tag", "Callout", "Card, pad", "Section", "Disclosure", "FoldGroup", "CoverageFold", "SegmentedControl", "ChoiceChips", "ChipList", "PlanChips", "CostStack", "PeriodStrip", "Sentence, Tpl", "Stat, StatRow", "StairsChart, StairsTable, StairsSteps", "DiffRow, DiffHead, DiffFigure, GreyLine", "KeyValue, KeyValueList", "HeadlineFigure", "RankBadge", "SourceLine, GapNote", "NumberField", "FieldState", "RangeField", "PercentField", "SelectField", "StepButtons", "Marker, MarkerMark, LaneLabel", "GainBars", "ChartLegend, Swatch, ChartReadout, ChartTable", "ShareRings", "SourcedTag"]) {
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
  it("steps a list's figure down a size past nine digits and again past twelve, so its fixed column never cuts it", () => {
    expect(figureFit(86_492)).toBe("");
    expect(figureFit(99_999_999)).toBe("");
    expect(figureFit(999_999_999)).toBe("max-md:text-sm");
    expect(figureFit(1_860_753_604)).toBe("text-sm");
    expect(figureFit(-1_000_000_000)).toBe("text-sm");
    expect(figureFit(2_000_000_000_000)).toBe("text-xs");
  });
  it("writes a billion shekels or more in a short form for a phone, always with two decimals, the sign and the words around it kept (lens review S2; fresh readers, round 3)", () => {
    expect(shortBillions("999,999,999 ₪")).toBeNull();
    expect(shortBillions("2,296,540,223 ₪")).toBe("2.30 מיליארד ₪");
    expect(shortBillions("1,600,000,000 ₪")).toBe("1.60 מיליארד ₪");
    expect(shortBillions("\u2066+2,205,553,903 ₪\u2069")).toBe("\u2066+2.21 מיליארד ₪\u2069");
    expect(shortBillions("\u200e\u221212,345,678,901 ₪")).toBe("\u200e\u221212.35 מיליארד ₪");
    expect(shortBillions("1,250,000,000,000 ₪")).toBe("1,250.00 מיליארד ₪");
    expect(shortBillions("2,296,540,223.40 ₪")).toBe("2.30 מיליארד ₪");
  });
  it("writes a row's other large figures in the same short form, from a hundred million (fresh readers, round 3: 758,833,521 ₪ beside 1.57 מיליארד ₪)", () => {
    expect(shortBillions("758,833,521 ₪", SHORT_IN_ROW)).toBe("0.76 מיליארד ₪");
    expect(shortBillions("99,999,999 ₪", SHORT_IN_ROW)).toBeNull();
    expect(shortBillions("1,000,000,000,000 ₪", 1e12)).toBe("1,000.00 מיליארד ₪");
    expect(shortBillions("999,999,999,999 ₪", 1e12)).toBeNull();
  });
  it("steps a phone tile's figure down past seven digits, nine and eleven", () => {
    expect(figureFit(9_999_999, "tile")).toBe("");
    expect(figureFit(45_073_491, "tile")).toBe("max-md:text-xl");
    expect(figureFit(1_860_753_604, "tile")).toBe("max-md:text-lg");
    expect(figureFit(100_000_000_000, "tile")).toBe("max-md:text-base");
  });
});

describe("PickList holds its height", () => {
  const row = (key: string, extra: Partial<PickRow> = {}): PickRow => ({ key, selected: false, onSelect: () => {}, cells: createElement("span", null, key), ...extra });
  const folded = (out: string) => (out.match(/data-folded=""/g) ?? []).length;
  it("the phone's fold shows the same number of rows whichever is chosen: a chosen row further down takes the last place", () => {
    const keys = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const outs = keys.map((sel) => renderToString(createElement(PickList, { label: "x", columns: "1fr", phoneLimit: 3, more: () => "more", rows: keys.map((k) => row(k, { selected: k === sel })) })));
    expect(new Set(outs.map(folded))).toEqual(new Set([5]));
  });
  it("a row's other states are laid out unseen, out of the flow, never as a row to choose", () => {
    const out = renderToString(createElement(PickList, { label: "x", columns: "1fr", states: [{ a: "one" }, { a: "two" }], rows: [row("a", { caseKey: "one", cases: [{ key: "two", cells: createElement("span", null, "LONG-STATE") }] })] }));
    expect(out).toContain('data-case-of="a"');
    expect(out).toMatch(/aria-hidden="true" data-case-of="a" data-case="two" class="[^"]*absolute[^"]*invisible/);
    expect((out.match(/role="radio"/g) ?? []).length).toBe(1);
  });
  it("the fold's button counts things, not rows: two rows that are one thing count once, and none already above the fold (independent check of pass 7: no test held countAs)", () => {
    const more = (n: number) => `more ${n}`;
    // a and b above the fold; c is b's twin (one thing), d and e are one thing too: two things behind the button, not three rows
    const rows = [row("a"), row("b", { countAs: "x" }), row("c", { countAs: "x" }), row("d", { countAs: "y" }), row("e", { countAs: "y" })];
    expect(renderToString(createElement(PickList, { label: "x", columns: "1fr", phoneLimit: 2, more, rows }))).toContain(">more 1<");
    // without twins it counts each row
    expect(renderToString(createElement(PickList, { label: "x", columns: "1fr", phoneLimit: 2, more, rows: ["a", "b", "c", "d"].map((k) => row(k)) }))).toContain(">more 2<");
  });
});

describe("keepTitleWhole (fresh readers, round 3, 2026-11-07)", () => {
  it("keeps a Latin run of a Hebrew title on one line, writes a gershayim as one, and isolates a quoted Hebrew name", () => {
    expect(keepTitleWhole('קסם, דוח שנתי "קסם MSCI AC World (4A) ETF מנוטרלת דולר" (1147362)')).toBe('קסם, דוח שנתי ⁧"קסם MSCI AC World (4A) ETF מנוטרלת דולר"⁩ (1147362)');
    expect(keepTitleWhole('קסם, דוח שנתי "קסם (4A) KTF ת"א 35" (5124490), 30.6.2026')).toBe('קסם, דוח שנתי ⁧"קסם (4A) KTF ת״א 35"⁩ (5124490), 30.6.2026');
    expect(keepTitleWhole("iShares Core S&P 500 UCITS ETF annual report")).toBe("iShares Core S&P 500 UCITS ETF annual report");
  });
});

// 2026-11-07 (independent check of the glossary sweep): a card's "נקרא גם" names showed the data's straight quote (ני"ע, אג"ח).
describe("a glossary card writes every abbreviation with its gershayim (copy 10.4)", () => {
  it("gershayim turns a quote between two Hebrew letters into ״ and leaves other quotes alone", () => {
    expect(gershayim('ני"ע')).toBe("ני״ע");
    expect(gershayim('אג"ח, מט"ח')).toBe("אג״ח, מט״ח");
    expect(gershayim('"קרן" S&P "500"')).toBe('"קרן" S&P "500"');
  });
  it("the card's name and its other names", () => {
    const term = { he: 'מק"מ', explanation: "x", variants: ['ני"ע', 'קופ"ג'], ruleIds: [], source: null, where: [], wrapperIds: [], exposureIds: [] };
    const out = renderToString(
      createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { ...data, terms: { [term.he]: term } }, children: createElement(TermCard, { id: term.he, data: { ...data, terms: { [term.he]: term } } }) })),
    );
    expect(out).toContain("מק״מ");
    expect(out).toContain("ני״ע · קופ״ג");
    expect(out).not.toMatch(/[א-ת](?:"|&quot;)[א-ת]/);
  });
});
