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
