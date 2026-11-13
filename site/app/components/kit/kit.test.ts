// The kit renders: every component of the gallery produces its name and states, a fold shows its own label whatever its neighbours do,
// and the sentence has no layout prop.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProvenanceProvider } from "../provenance";
import { TermCard } from "../provenance-sheets";
import { Button, chipAfterAdd, Disclosure, DocLink, KeyValueList, MeterBar, PageHead, PickCard, PrintedQuotes, ProductPhoneRow, ProductTable, SearchField, Section, Sentence, Stat, StatRow, Tag, TextLink, aboveZeroCheck, ageCheck, nonNegativeCheck, yearsCheck } from "./index";
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
    for (const name of ["Button, LinkButton", "Tag", "Callout", "Card, pad", "Section", "Disclosure", "FoldGroup", "SegmentedControl", "ChoiceChips", "ChipList", "CostStack", "PeriodStrip", "Sentence, Tpl", "Stat, StatRow", "StairsChart, StairsTable, StairsSteps", "DiffRow, DiffHead, DiffFigure, GreyLine", "LeftOutLine, LeftOutMark", "KeyValue, KeyValueList", "SourceLine, GapNote", "NumberField", "FieldState", "RangeField", "PercentField", "SelectField", "Marker, MarkerMark, LaneLabel", "GainBars", "ChartLegend, Swatch, ChartReadout, ChartTable, AxisLabels, yearTicksIn", "PrintedText, PrintedQuotes, DoubtNote", "MeterBar", "DocLink", "ShareRings", "SourcedTag", "PageHead", "TextLink", "SearchField", "PickCard", "AnchorSpread, AmountRange"]) {
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
    // isolated alone, the 4 and the 500 stepped out of the name: "S&P 500 (4D)" read "(D4) 500 S&P"
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

// a card's "נקרא גם" names showed the data's straight quote (ני"ע, אג"ח).
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

describe("the shared pieces' choices are props, never an overriding class", () => {
  it("a flush quiet button has no side padding, and no piece carries a ! override", () => {
    const flush = html(createElement(Button, { variant: "quiet", flush: true, children: "x" }));
    expect(flush).toContain("px-0");
    expect(flush).not.toContain("px-2");
    // the piece alone, before the provenance sheet the test frame draws after it
    const own = (h: string) => h.split("<dialog")[0]!;
    for (const el of [flush, html(createElement(Tag, { tone: "primary", children: "x" })), html(createElement(Tag, { tone: "outline", children: "x" })), html(createElement(Tag, { shape: "pill", size: "sm", children: "x" }))]) expect(own(el)).not.toMatch(/class="[^"]*(?<=["\s])!/);
  });
  it("a pill is round, and a tag of the primary tone is a pill by default", () => {
    expect(html(createElement(Tag, { shape: "pill", children: "x" }))).toContain("rounded-full");
    expect(html(createElement(Tag, { tone: "primary", children: "x" }))).toContain("rounded-full");
    expect(html(createElement(Tag, { children: "x" }))).toContain("rounded-sm");
  });
  it("a fold with the link look draws its label in the link colour", () => {
    expect(html(createElement(Disclosure, { look: "link", label: "more", children: "body" }))).toMatch(/<span class="text-link">more<\/span>/);
  });
  it("a small text action takes the line's height and a tap area; a small icon button is round and muted", () => {
    const text = html(createElement(Button, { variant: "quiet", size: "sm", flush: true, children: "x" }));
    expect(text).toContain("text-xs tap-area");
    expect(text).not.toContain("min-h-target");
    const icon = html(createElement(Button, { variant: "icon", size: "sm", "aria-label": "x", children: "x" }));
    expect(icon).toContain("size-9 tap-area");
    expect(icon).toContain("rounded-full text-muted-foreground");
    expect(html(createElement(Button, { variant: "icon", "aria-label": "x", children: "x" }))).toContain("size-target");
  });
  it("a link out inside a line of text has no height of its own", () => {
    expect(html(createElement(DocLink, { href: "https://example.com", children: "doc" }))).toContain("min-h-target");
    expect(html(createElement(DocLink, { href: "https://example.com", look: "inline", children: "doc" }))).not.toContain("min-h-target");
  });
  it("plain label-and-value rows are a dl with the rows' label column, and no card", () => {
    const items = [{ id: "a", label: "L", value: "V" }];
    const plain = html(createElement(KeyValueList, { plain: true, items }));
    expect(plain).toMatch(/^<dl/);
    expect(plain).toContain("<dt");
    expect(plain).not.toContain("bg-card");
    const rows = html(createElement(KeyValueList, { rows: true, items }));
    const column = "md:grid-cols-[10rem_minmax(0,1fr)]";
    expect(plain).toContain(column);
    expect(rows).toContain(column);
  });
  it("printed quotes stand each in Hebrew quotation marks, in one muted box", () => {
    const out = html(createElement(PrintedQuotes, { quotes: ["אחת", "שתיים"] }));
    expect(out).toContain("bg-muted");
    expect(out.match(/״/g)).toHaveLength(4);
  });
  it("a meter in the computed tone takes the computed ink", () => {
    expect(html(createElement(MeterBar, { share: 0.5, tone: "computed" }))).toContain("bg-computed");
    expect(html(createElement(MeterBar, { share: 0.5, tone: "computed", hollow: true }))).toContain("border-computed");
  });
  it("a product table's column wraps with wrap, has tight sides with tight, and a phone row spaces its lines with roomy", () => {
    const out = html(
      createElement(ProductTable, {
        columns: [{ id: "a", head: "A", width: 8, wrap: true }, { id: "b", head: "B", width: 3, tight: true }, { id: "c", head: "C", width: 4 }],
        groups: [{ key: "g", rows: [{ key: "r", cells: ["one", "two", "three"], phone: null }] }],
      }),
    );
    const cells = [...out.matchAll(/<td class="([^"]*)">/g)].map((m) => m[1]!);
    expect(cells[0]).not.toContain("whitespace-nowrap");
    expect(cells[1]).toContain("px-1");
    expect(cells[2]).toContain("whitespace-nowrap");
    expect(out).toMatch(/<th scope="col" class="px-1 /);
    expect(html(createElement(ProductPhoneRow, { stacked: true, roomy: true, children: "x" }))).toContain("!gap-2");
    expect(html(createElement(ProductPhoneRow, { stacked: true, children: "x" }))).toContain("!gap-1");
  });
  it("a link out builds the address of its cited place", () => {
    expect(html(createElement(DocLink, { source: { url: "https://example.com/a.pdf", page: 2 }, children: "doc" }))).toContain('href="https://example.com/a.pdf#page=2"');
  });
  it("a link within the site has one look inline and a 44 px target on its own line", () => {
    expect(html(createElement(TextLink, { to: "/a", children: "a" }))).toContain('class="text-link hover:underline"');
    expect(html(createElement(TextLink, { to: "/a", look: "line", children: "a" }))).toContain("min-h-target");
  });
  it("a page's head has one h1, its lede and its aside", () => {
    const out = html(createElement(PageHead, { title: "T", lede: "L", aside: createElement("span", null, "A") }));
    expect(out.match(/<h1/g)).toHaveLength(1);
    expect(out).toContain('<p class="text-muted-foreground max-w-measure text-pretty">L</p>');
    expect(out).toContain("min-w-[16rem]");
    expect(html(createElement(PageHead, { title: "T", aside: false }))).not.toContain("min-w-[16rem]");
  });
  it("a search field has its label, and × only while it holds words", () => {
    const empty = html(createElement(SearchField, { label: "L", value: "", onChange: () => undefined, clearLabel: "clear" }));
    expect(empty).toContain(">L</label>");
    expect(empty).not.toContain('aria-label="clear"');
    expect(html(createElement(SearchField, { label: "L", value: "x", onChange: () => undefined, clearLabel: "clear" }))).toContain('aria-label="clear"');
  });
});

describe("the field checks say one message each", () => {
  it("nonNegativeCheck refuses a number below zero only", () => {
    expect(nonNegativeCheck(0)).toBeNull();
    expect(nonNegativeCheck(-1)).toBe("הסכום לא יכול להיות שלילי.");
  });
  it("yearsCheck refuses a number outside its range, and a part of a year, with the range in its words", () => {
    const check = yearsCheck({ min: 1, max: 40 });
    expect(check(1)).toBeNull();
    expect(check(40)).toBeNull();
    for (const n of [0, 41, 2.5]) expect(check(n)).toBe("הזינו מספר שנים בין 1 ל־40.");
  });
  it("ageCheck is the same test in the age's words, and aboveZeroCheck refuses zero and below", () => {
    const check = ageCheck({ min: 18, max: 67 });
    expect(check(30)).toBeNull();
    for (const n of [17, 68, 30.5]) expect(check(n)).toBe("הזינו גיל בין 18 ל־67.");
    expect(aboveZeroCheck(1)).toBeNull();
    for (const n of [0, -1]) expect(aboveZeroCheck(n)).toBe("הזינו סכום גדול מאפס.");
  });
});

describe("the third kit job's options", () => {
  // the piece alone, before the provenance sheet the test frame draws after it
  const own = (el: React.ReactElement) => html(el).split("<dialog")[0]!;
  it("an inline button wraps with its sentence: no flex box, underlined, a tap layer", () => {
    const out = own(createElement(Button, { variant: "inline", children: "x" }));
    expect(out).not.toContain("inline-flex");
    expect(out).toContain("underline");
    expect(out).toContain("before:-inset-y-3");
  });
  it("a compact text action is 44 px on a phone and low with a tap area from lg; gap sm is one gap", () => {
    const out = html(createElement(Button, { variant: "quiet", size: "compact", children: "x" }));
    expect(out).toContain("min-h-target lg:min-h-7 lg:tap-area");
    const gap = own(createElement(Button, { variant: "quiet", gap: "sm", children: "x" }));
    expect(gap).toContain("gap-1.5");
    expect(gap).not.toContain("gap-2");
  });
  it("a link's tone sets its ink, one colour class each", () => {
    expect(html(createElement(TextLink, { to: "/a", tone: "muted", children: "a" }))).toContain('class="text-muted-foreground hover:underline"');
    const plain = html(createElement(TextLink, { to: "/a", tone: "plain", children: "a" }));
    expect(plain).not.toContain("text-link");
    expect(plain).toContain("hover:underline");
  });
  it("a compact link out is low from lg, with its tap area", () => {
    expect(html(createElement(DocLink, { href: "https://example.com", look: "compact", children: "doc" }))).toContain("min-h-target lg:min-h-7 lg:tap-area");
  });
  it("wide rows have the wide label column", () => {
    expect(html(createElement(KeyValueList, { plain: true, wide: true, items: [{ id: "a", label: "L", value: "V" }] }))).toContain("md:grid-cols-[14rem_minmax(0,1fr)]");
  });
  it("a section takes its heading's id, a line under the heading and one gap", () => {
    const out = html(createElement(Section, { title: "T", headingId: "own-id", under: "U", gap: "tight", children: "B" }));
    expect(out).toContain('id="own-id"');
    expect(out).toContain('aria-labelledby="own-id"');
    expect(out).toContain("gap-2");
    expect(out).not.toContain("gap-4");
    expect(out.indexOf("U")).toBeLessThan(out.indexOf("B"));
  });
  it("a pick card takes Card's padding", () => {
    expect(html(createElement(PickCard, { label: "x", onPick: () => undefined, pad: "snug", children: "c" }))).toContain("p-4 md:p-5");
  });
});

describe("AddLine", () => {
  it("hands the focus, once a chip added its thing and left, to the chip now in its place, else the last, and never takes it from where the page put it", () => {
    expect(chipAfterAdd(1, 3, false)).toBe(1);
    expect(chipAfterAdd(3, 3, false)).toBe(2);
    expect(chipAfterAdd(0, 0, false)).toBeNull();
    expect(chipAfterAdd(null, 3, false)).toBeNull();
    expect(chipAfterAdd(1, 3, true)).toBeNull();
  });
});
