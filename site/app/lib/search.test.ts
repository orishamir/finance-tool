// The search ranking and number matching (audit 2026-10-24, A4, A92): numbers find tracks, pages come before catalogue
// rows, one row per page, exact beats partial.
import { describe, expect, it } from "vitest";
import { groupHits, normalize, scoreEntry, searchEntries, type SearchEntry } from "./search";

const e = (kind: SearchEntry["kind"], name: string, href: string, ids?: string[]): SearchEntry => ({ kind, name, line: "", href, norm: normalize(name), ...(ids ? { ids } : {}) });

const index: SearchEntry[] = [
  e("track", "איילון קרן השתלמות כללית", "/companies/1/880", ["880"]),
  e("track", "מנורה קרן השתלמות מניות", "/companies/2/7978", ["7978"]),
  e("track", "אי.בי.אי. סל (4D) S&P 500", "/workbench/funds/index-sp500", ["1148162", "il0011481622"]),
  e("guide", "קרן השתלמות", "/guide/keren-hishtalmut"),
  e("guide", "קרן השתלמות לעצמאים", "/guide/keren-hishtalmut"),
  e("guide", "קרן השתלמות", "/guide/keren-hishtalmut"),
  e("term", "תעודת סל", "/guide/x#terms"),
  e("term", "תעודת סל", "/guide/x#terms"),
  e("term", "קרן נאמנות", "/guide/x#terms"),
  e("company", "איילון", "/companies/512065202", ["512065202"]),
  e("notcovered", "ביטוח מנהלים", "/not-covered#executive-insurance"),
  e("product", "קרן השתלמות איילון", "/companies/1/880", ["880"]),
];

const search = (text: string) => searchEntries(index, normalize(text));

describe("scoreEntry", () => {
  it("ranks exact, prefix, word prefix, contained, all words", () => {
    const entry = e("guide", "קרן השתלמות לעצמאים", "/x");
    expect(scoreEntry(entry, normalize("קרן השתלמות לעצמאים"))).toBe(0);
    expect(scoreEntry(entry, normalize("קרן השת"))).toBe(1);
    expect(scoreEntry(entry, normalize("השתלמות"))).toBe(2);
    expect(scoreEntry(entry, normalize("תלמות"))).toBe(3);
    expect(scoreEntry(entry, normalize("עצמאים קרן"))).toBe(4);
    expect(scoreEntry(entry, normalize("אגח"))).toBeNull();
  });
  it("matches final letters and quotes the way the index does", () => {
    expect(scoreEntry(e("guide", "תעודת סל", "/x"), normalize("תעודת סל"))).toBe(0);
    expect(scoreEntry(e("term", "אג״ח", "/x"), normalize('אג"ח'))).toBe(0);
  });
});

describe("number matching", () => {
  it("finds a track by its number, from two digits", () => {
    expect(search("880")[0]!.entry.href).toBe("/companies/1/880");
    expect(search("7978")[0]!.entry.href).toBe("/companies/2/7978");
    expect(search("1148162")[0]!.entry.href).toBe("/workbench/funds/index-sp500");
    expect(search("11481")[0]!.entry.href).toBe("/workbench/funds/index-sp500");
    expect(search("88")[0]!.entry.href).toBe("/companies/1/880");
  });
  it("finds a company by its legal number and an ISIN by its text", () => {
    expect(search("512065202")[0]!.entry.href).toBe("/companies/512065202");
    expect(search("IL0011481622")[0]!.entry.href).toBe("/workbench/funds/index-sp500");
  });
  it("does not match a number in the middle of an id", () => {
    expect(search("481")).toHaveLength(0);
  });
});

describe("ranking and dedupe", () => {
  it("puts the guide page first for a product name and keeps catalogue rows after it", () => {
    const hits = search("קרן השתלמות");
    expect(hits[0]!.entry.kind).toBe("guide");
    expect(hits[0]!.entry.href).toBe("/guide/keren-hishtalmut");
    const kinds = hits.map((h) => h.entry.kind);
    expect(kinds.indexOf("guide")).toBeLessThan(kinds.indexOf("track"));
  });
  it("shows one row per page, the other names as also called", () => {
    const hits = search("קרן השתלמות");
    expect(hits.filter((h) => h.entry.href === "/guide/keren-hishtalmut")).toHaveLength(1);
    expect(hits[0]!.also).toEqual(["קרן השתלמות לעצמאים"]);
  });
  it("does not repeat identical glossary rows and keeps different terms on one page apart", () => {
    expect(search("תעודת סל").filter((h) => h.entry.kind === "term")).toHaveLength(1);
    expect(search("קרן").filter((h) => h.entry.kind === "term")).toHaveLength(1);
    expect(searchEntries(index, "סל").filter((h) => h.entry.kind === "term")).toHaveLength(1);
  });
  it("lets an exact name beat a kind that usually ranks higher", () => {
    expect(search("איילון")[0]!.entry.kind).toBe("company");
  });
  it("finds what is not covered yet and points at its entry", () => {
    expect(search("ביטוח מנהלים")[0]!.entry.href).toBe("/not-covered#executive-insurance");
  });
  it("returns nothing for a loan or a partner, which are not products", () => {
    expect(search("הלוואה")).toHaveLength(0);
    expect(search("בן זוג")).toHaveLength(0);
  });
  it("groups by kind in the order of the best hit, so the first row of the first group is the first hit", () => {
    const hits = search("קרן השתלמות");
    const groups = groupHits(hits);
    expect(groups[0]!.items[0]).toBe(hits[0]);
    expect(new Set(groups.map((g) => g.kind)).size).toBe(groups.length);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// The knowledge layer (research/knowledge/2026-10-24-search.md §6, synthesis 3.6): rules, parameters, aliases, numbers.
// The fixture is the real index and the real texts file, built through the two route loaders.
// ---------------------------------------------------------------------------------------------------------------
import { beforeAll } from "vitest";
import { analyze, highlightRanges, nearHits, relaxedHits, ruleFigs, snippetOf, stem, strips, type SearchHit, type SearchTexts } from "./search";
import { aliasRows } from "./search-aliases";

let real: SearchEntry[] = [];
let texts: SearchTexts = {};
beforeAll(async () => {
  const { loader: indexLoader } = await import("../routes/search-index");
  const { loader: textsLoader } = await import("../routes/search-texts");
  real = (await (await indexLoader()).json()) as SearchEntry[];
  texts = (await (await textsLoader()).json()) as SearchTexts;
}, 60_000);

const top = (text: string, withTexts = true): SearchHit[] => searchEntries(real, normalize(text), withTexts ? texts : null);
const hrefs = (text: string, withTexts = true) => top(text, withTexts).map((h) => h.entry.href);

describe("normalisation", () => {
  it("deletes a quote inside a word, keeps one at the edge, maps maqaf to a hyphen", () => {
    expect(normalize("פק״מ")).toBe("פקמ");
    expect(normalize('פק"מ')).toBe("פקמ");
    expect(normalize("מס׳")).toBe("מס");
    expect(normalize("ת״א־125")).toBe("תא-125");
    expect(normalize("TXG-02")).toBe("txg-02");
  });
  it("highlights through deleted characters", () => {
    const name = 'קרן פק"מ כללית';
    const [r] = highlightRanges(name, "פקמ");
    expect(name.slice(r![0], r![1])).toBe('פק"מ');
    expect(highlightRanges("קרן השתלמות", "השתלמות")).toEqual([[4, 11]]);
    expect(highlightRanges("קרן", "xyz")).toEqual([]);
  });
  it("stems lightly and strips prefixes on the query side only", () => {
    expect(stem(normalize("קרנות"))).toBe(normalize("קרן").slice(0, 3));
    expect(stem(normalize("מסלולים"))).toBe(normalize("מסלול"));
    expect(strips(normalize("מפיקדון"))).toContain(normalize("פיקדון"));
    expect(strips("הון")).toEqual([]);
  });
  it("keeps the 52 alias rows and marks the colloquial ones", () => {
    expect(aliasRows).toHaveLength(52);
    expect(aliasRows.filter((r) => r.confirm).length).toBeGreaterThanOrEqual(2);
  });
});

describe("figures of a rule", () => {
  it("takes values with units from tables and tax-year maps, never text or dates", () => {
    const figs = ruleFigs(
      {
        brackets: [{ up_to: { value: 84120, unit: "nis" }, rate: { value: 10, unit: "pct" } }],
        share: { by_tax_year: { "2026": { value: 57.5, unit: "pct" } } },
        from: { value: "2025-04-01", unit: "text" },
        again: { value: 10, unit: "pct_per_year" },
      },
      { brackets: "מדרגות" },
    );
    expect(figs.map((f) => [f.n, f.u])).toEqual([[84120, "nis"], [10, "pct"], [57.5, "pct"]]);
    expect(figs[0]!.f).toBe("מדרגות");
  });
});

describe("the nineteen queries (top href)", () => {
  const cases: [string, string][] = [
    ["TXG-02", "/rules/state#TXG-02"],
    ["txg 2", "/rules/state#TXG-02"],
    ["P-03", "/parameters#P-03"],
    ["סף תיקו", "/parameters#P-01"],
    ["מעבר מסלול", "/rules/state#TXH-17"],
    ["האם אפשר להחליף מסלול בלי מס", "/rules/state#TXH-17"],
    ["כמה מס על פיקדון", "/rules/state#TXI-03"],
    ["תקרת הפקדה קופת גמל להשקעה", "/rules/access#KGL-02"],
    ["מס רווחי הון", "/guide/brokerage-account#terms"],
    ["קרן כספית", "/guide/money-market-fund-daily"],
    ["פק״מ", "/guide/bank-deposit"],
    ["פקמ", "/guide/bank-deposit"],
    ["גמל להשקעה", "/guide/kupat-gemel-lehashkaa"],
    ["25%", "/rules/state#TXF-02"],
    ["83,641", "/rules/access#KGL-03"],
    ["83641", "/rules/access#KGL-03"],
    ["15%", "/rules/state#TXI-03"],
    ["תשואה היסטורית", "/rules/structure#MKT-01"],
  ];
  it.each(cases.map((c, i) => [i + 1, ...c] as const))("%i: %s", (_i, query, href) => {
    expect(top(query)[0]?.entry.href).toBe(href);
  });
});

describe("rules in groups and the negatives", () => {
  it("18: ניוד finds the glossary term of the guides that carry it, and the SW rules in the rules group", () => {
    // two guides (pension-comprehensive, child-savings-bank) hold "ניוד" as an exact term, so the design's single top href is a tie
    const hits = top("ניוד");
    expect(hits.slice(0, 2).map((h) => h.entry.href).sort()).toEqual(["/guide/child-savings-bank#terms", "/guide/pension-comprehensive#terms"]);
    expect(hits.some((h) => h.entry.key?.startsWith("SW-"))).toBe(true);
  });
  it("lists the other rules a name query finds in the rules group", () => {
    const h = hrefs("מעבר מסלול");
    expect(h.indexOf("/rules/state#TXH-17")).toBeLessThan(h.indexOf("/rules/state#TXK-04") === -1 ? 999 : h.indexOf("/rules/state#TXK-04"));
    expect(h.some((x) => x.includes("#PF-23"))).toBe(true);
  });
  it("puts the guide first and the rule after it for a product name", () => {
    const hits = top("קרן כספית");
    expect(hits[0]!.entry.kind).toBe("guide");
    expect(hits.find((h) => h.entry.kind === "rule")).toBeDefined();
  });
  it("does not read a year or a date as a figure", () => {
    expect(top("2026").filter((h) => h.entry.kind === "rule")).toHaveLength(0);
  });
  it("still returns nothing for a loan or a partner", () => {
    expect(search("הלוואה")).toHaveLength(0);
    expect(search("בן זוג")).toHaveLength(0);
    // the real rule base has rules about a spouse: only rules answer
    expect(top("בן זוג").every((h) => h.entry.kind === "rule")).toBe(true);
    // the real rule base does have rules about loans against a fund, so "הלוואה" now finds those and nothing in the catalogue
    expect(top("הלוואה", false).every((h) => h.entry.kind === "rule" || h.entry.kind === "term")).toBe(true);
  });
  it("shows track numbers first for a bare 25, then the 25% rules before the tracks that merely contain it", () => {
    const withTrack: SearchEntry[] = [...real, e("track", "מסלול לדוגמה", "/companies/1/2500", ["2500"])];
    const hits = searchEntries(withTrack, "25", texts);
    const kinds = hits.map((h) => h.entry.kind);
    expect(kinds[0]).toBe("track");
    const firstRule = kinds.indexOf("rule");
    expect(firstRule).toBeGreaterThan(0);
    const rules = hits.filter((h) => h.entry.kind === "rule");
    expect(rules.every((h) => h.fig?.n === 25 && h.fig.u.startsWith("pct"))).toBe(true);
    expect(rules.length).toBeGreaterThan(10);
  });
  it("lists the rules of one id prefix in id order", () => {
    const ids = top("txg").filter((h) => h.entry.kind === "rule").map((h) => h.entry.key!);
    expect(ids.length).toBeGreaterThan(3);
    expect(ids.every((id) => id.startsWith("TXG-"))).toBe(true);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b, "en", { numeric: true })));
  });
  it("shows the figure that matched on the row of a number query", () => {
    const h = top("25%")[0]!;
    expect(h.fig).toMatchObject({ n: 25 });
    expect(h.fig!.u.startsWith("pct")).toBe(true);
    expect(top("83641 ₪")[0]!.entry.href).toBe("/rules/access#KGL-03");
  });
  it("never reads a question as a name that is not on the site yet", () => {
    for (const q of ["האם אפשר להחליף מסלול בלי מס", "כמה זה עולה לנייד קופה?", "מה קורה עם הכסף שלי"]) {
      expect(analyze(q).type).toBe("question");
    }
    expect(analyze("קרן השתלמות מנורה מניות").type).toBe("name");
    expect(analyze("25%").type).toBe("number");
  });
});

describe("empty states", () => {
  it("offers up to three rules for a question nothing answers whole", () => {
    const a = analyze("האם צריך לדווח על מסלול זהב");
    const maybe = relaxedHits(real, texts, a);
    expect(maybe.length).toBeGreaterThan(0);
    expect(maybe.length).toBeLessThanOrEqual(3);
    expect(maybe.every((h) => h.entry.kind === "rule")).toBe(true);
  });
  it("offers figures within two percent for a number nothing has", () => {
    const near = nearHits(real, analyze("83,000 ₪"));
    expect(near.map((h) => h.entry.key)).toContain("KGL-03");
    expect(top("83000 ₪").filter((h) => h.entry.kind === "rule")).toHaveLength(0);
  });
  it("cuts a snippet of the record's own text around the match", () => {
    const hit = top("אינו אירוע מס").find((h) => h.entry.key === "TXH-17")!;
    expect(hit).toBeDefined();
    const s = snippetOf(texts["TXH-17"]!, analyze("אינו אירוע מס"));
    expect(s).toBeTruthy();
    expect(s!.length).toBeLessThanOrEqual(110);
  });
});
