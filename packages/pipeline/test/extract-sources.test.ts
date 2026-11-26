import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  cleanLocator,
  conditionsLineOf,
  extractFromLine,
  findLinks,
  findQuote,
  firstPage,
  pageInUrl,
  placeFigures,
  placeInTitle,
  seeAlsoFrom,
  sourceLineOf,
  splitPassages,
  standingOf,
  toHebrewLocator,
  writeKeys,
  writeOutTitle,
  type LineContext,
} from "../scripts/extract-sources.ts";
import { readRuleBaseIds, urlInBlock } from "../src/references.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const ctx = (over: Partial<LineContext> = {}): LineContext => ({
  ruleId: "XX-01",
  ruleStrength: "primary",
  ruleChecked: "2026-10-20",
  defs: {},
  knownIds: new Set(["FXD-07", "FXD-12", "XX-01"]),
  ...over,
});

describe("extract-sources: fixture Source lines", () => {
  it("inline link with a section, strength and date", () => {
    const line = "[Income Tax Ordinance (פקודת מס הכנסה), ss. 64A2, 64A3(a)(1)](https://www.gov.il/BlobFolder/legalinfo/x/he/ordinance.pdf) · checked 2026-10-22 · primary";
    const [s] = extractFromLine(line, ctx()).sources;
    expect(s).toMatchObject({
      url: "https://www.gov.il/BlobFolder/legalinfo/x/he/ordinance.pdf",
      kind: "law",
      strength: "primary",
      checked: "2026-10-22",
      locator: "ss. 64A2, 64A3(a)(1)",
    });
    expect(s!.locator_he).toBe("סעיפים 64א2, 64א3(א)(1)");
  });

  it("a documents row with hosts labels only links on those hosts; another host keeps its own label (2026-10-26)", () => {
    const documents = [{ id: "regs", match: ["ניכוי מריבית"], title_he: "תקנות (ניכוי מריבית)", publisher_he: "שר האוצר (באתר המוסד לביטוח לאומי)", kind: "regulation" as const, official_url: null, hosts: ["btl.gov.il"] }];
    const publishers = { "free-justice.openapi.gov.il": { publisher: "Reshumot", publisher_he: "רשומות (משרד המשפטים)", kind: "law" as const } };
    const at = (url: string, title: string) => extractFromLine(`[${title}](${url}) · checked 2026-10-26 · primary`, ctx({ documents, publishers })).sources[0]!;
    expect(at("https://www.btl.gov.il/Mediniyut/x.pdf", "תקנות מס הכנסה (ניכוי מריבית)").publisher_he).toBe("שר האוצר (באתר המוסד לביטוח לאומי)");
    const other = at("https://free-justice.openapi.gov.il/free/moj/x/Documents/y", "תקנות מס הכנסה (ניכוי מריבית), רשומות");
    expect(other.publisher_he).toBe("רשומות (משרד המשפטים)");
    // the gazette host's "law" default gives way to a title that names regulations
    expect(other.kind).toBe("regulation");
  });

  it("an amendment keeps its own title: a documents row names the document it amends, not the amendment's booklet (2026-11-12)", () => {
    const documents = [
      { id: "regs-2005", match: ["ניכוי מריבית, מדיבידנד ומרווחים מסוימים"], title_he: "תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס״ו-2005", publisher_he: "שר האוצר", kind: "regulation" as const, official_url: null },
      { id: "funds-law-31", match: ["חוק השקעות משותפות בנאמנות (תיקון מס' 31)"], title_he: "חוק השקעות משותפות בנאמנות (תיקון מס׳ 31), התשפ״ד-2024", publisher_he: "הכנסת", kind: "law" as const, official_url: null },
    ];
    const publishers = { "api.justice.gov.il": { publisher: "Reshumot", publisher_he: "רשומות", kind: "law" as const } };
    const at = (title: string) => extractFromLine(`[${title}](https://api.justice.gov.il/reshumot/resolver?path=x) · checked 2026-11-12 · primary`, ctx({ documents, publishers })).sources[0]!;
    // the regulations themselves take the row
    expect(at("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס\"ו-2005").title_he).toBe("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס״ו-2005");
    // their 2012 amendment came out under the 2005 regulations' title and "שר האוצר"; it is its own booklet
    const amendment = at("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים) (תיקון), התשע\"ב-2012, קובץ התקנות 7076 (11.1.2012)");
    expect(amendment.title_he).toBe("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים) (תיקון), התשע\"ב-2012, קובץ התקנות 7076 (11.1.2012)");
    expect(amendment.publisher_he).toBe("רשומות");
    expect(amendment.kind).toBe("regulation");
    expect(at("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים) (תיקון מס' 2), התשע\"ח-2017").publisher_he).toBe("רשומות");
    // a row whose own token names the amendment still labels it
    expect(at("חוק השקעות משותפות בנאמנות (תיקון מס' 31), התשפ\"ד-2024").title_he).toBe("חוק השקעות משותפות בנאמנות (תיקון מס׳ 31), התשפ״ד-2024");
    // a circular whose name ends "– תיקון" and a consolidated text are not amendments of the row's document
    expect(at("חוזר (ניכוי מריבית, מדיבידנד ומרווחים מסוימים) – תיקון").publisher_he).toBe("שר האוצר");
    // an amendment titled in English has no Hebrew title of its own to show, so it keeps the row's until its block names it in Hebrew
    expect(at("ניכוי מריבית, מדיבידנד ומרווחים מסוימים, the 2016 amendment (KT 7653)").title_he).toBe("תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס״ו-2005");
  });

  it("a first passage whose quote stands in parentheses names only its own place; the later passages are their own sources (2026-11-12)", () => {
    const res = extractFromLine('[חוזר מס הכנסה 1/2020](https://www.gov.il/x/hoz1-2020.pdf), p.5, s.3 ("הכנסה מריבית תחויב במס"); p.6, s.4.3.3 "ניכוי במקור" · checked 2026-11-12 · primary', ctx());
    expect(res.sources.map((x) => x.locator)).toEqual(["p.5, s.3", "p.6, s.4.3.3"]);
    expect(res.sources.map((x) => x.page)).toEqual([5, 6]);
    expect(res.sources.map((x) => x.quote)).toEqual(["הכנסה מריבית תחויב במס", "ניכוי במקור"]);
  });

  it("a quote in parentheses that holds a parenthesis of its own leaves no words in the locator (2026-11-12)", () => {
    expect(cleanLocator('p.155, s.92(א)(3) ("רווח הון כאמור בסעיף 91(ד) יקוזז תחילה כנגד רווח הון מחוץ לישראל")')).toBe("p.155, s.92(א)(3)");
  });

  it("a locator that names a definition, a footnote, a row, a table or an appendix has a Hebrew form (2026-11-12)", () => {
    expect(toHebrewLocator("file p.3 (gazette p.375), reg. 1(א), definition מוסד כספי")).toBe("עמוד הקובץ 3 (עמוד הרשומות 375), תקנה 1(א), הגדרת מוסד כספי");
    expect(toHebrewLocator("reg. 1(א), definitions הוצאות and ניירות ערך זהים")).toBe("תקנה 1(א), הגדרות הוצאות וניירות ערך זהים");
    expect(toHebrewLocator("p.2 (gazette p.900), regs. 1-2 and footnote 2")).toBe("עמוד 2 (עמוד הרשומות 900), תקנות 1-2 והערת שוליים 2");
    expect(toHebrewLocator("p.4 row 9, p.13 row 3")).toBe("עמוד 4 שורה 9, עמוד 13 שורה 3");
    expect(toHebrewLocator("p.12, table ד-14")).toBe("עמוד 12, טבלה ד-14");
    expect(toHebrewLocator("p.10, appendix")).toBe("עמוד 10, נספח");
    expect(toHebrewLocator("pp.28-29, annex 1; p.15, footnote 1")).toBe("עמודים 28 עד 29, נספח 1; עמוד 15, הערת שוליים 1");
    // words with no rule still leave the locator in English, whole
    expect(toHebrewLocator("file p.18, Schedule E")).toBeUndefined();
    expect(toHebrewLocator("p.5, s.3 and the table of contents")).toBeUndefined();
  });

  it("a numbered note, row, chapter, question or table stays in the locator, and reads in Hebrew (2026-11-12)", () => {
    // each of these words used to cut the locator where it stood, as prose does: "p.5, note 10" came out "p.5"
    expect(cleanLocator(", p.5, note 10")).toBe("p.5, note 10");
    expect(cleanLocator(", p.14, table 2, rows סחורות")).toBe("p.14, table 2, rows סחורות");
    expect(cleanLocator(", p.3, question 5; p.4, question 6")).toBe("p.3, question 5; p.4, question 6");
    expect(cleanLocator(", p.9, chapter ב s.2(6)")).toBe("p.9, chapter ב s.2(6)");
    expect(cleanLocator(", p.15, tables ד-14, ד-15")).toBe("p.15, tables ד-14, ד-15");
    // alone the word is prose, and cuts as before
    expect(cleanLocator(", p.5, note that the list is longer")).toBe("p.5");
    expect(cleanLocator(", p.5, rows of the table")).toBe("p.5");
    expect(toHebrewLocator("p.5, note 10")).toBe("עמוד 5, הערה 10");
    expect(toHebrewLocator("p.1, notes 3, 13")).toBe("עמוד 1, הערות 3, 13");
    expect(toHebrewLocator("p.20, note 38 to s.82")).toBe("עמוד 20, הערה 38 לסעיף 82");
    expect(toHebrewLocator("p.3, question 5; p.4, question 6")).toBe("עמוד 3, שאלה 5; עמוד 4, שאלה 6");
    expect(toHebrewLocator("p.9, chapter ב s.2(6)")).toBe("עמוד 9, פרק ב סעיף 2(6)");
    expect(toHebrewLocator("pp.44 to 45 (ch. ז ss.1, 4-5)")).toBe("עמודים 44 עד 45 (פרק ז סעיפים 1, 4-5)");
    expect(toHebrewLocator("p.15, tables ד-14, ד-15")).toBe("עמוד 15, טבלאות ד-14, ד-15");
    expect(toHebrewLocator("rows 1 and 29")).toBe("שורות 1 ו־29");
    expect(toHebrewLocator("p.2, notes 1, 2(ב) and 6")).toBe("עמוד 2, הערות 1, 2(ב) ו־6");
  });

  it("a remark in brackets that lists pages of its own is not cut into passages, and one that holds brackets goes whole (2026-11-12)", () => {
    // BRK-66: the second half of the remark became a source "p.2" of its own, ending on the remark's bracket
    expect(splitPassages('p.2, item 1.3.2 "השלמה למינימום דמי ניהול" (the exemption: p.1, note 9; p.2, note 3)')).toHaveLength(1);
    expect(splitPassages("p.4, s.1; p.8, s.2 (see p.9; p.10); file p.12 (gazette p.300), s.7")).toEqual(["p.4, s.1", "p.8, s.2 (see p.9; p.10)", "file p.12 (gazette p.300), s.7"]);
    expect(splitPassages("p.4, s.1; s.2")).toEqual(["p.4, s.1; s.2"]);
    expect(cleanLocator(", p.110, note 5 (iShares Core S&P 500 UCITS ETF USD (Dist)), ")).toBe("p.110, note 5");
  });

  it("a remark removed before a semicolon leaves no space there, and a closing bracket with none open is dropped (GOV-01, TXK-08, 2026-11-12)", () => {
    expect(cleanLocator(", p.1, s.1 (the definition); p.2, s.2")).toBe("p.1, s.1; p.2, s.2");
    expect(cleanLocator(", PDF p.2, s.7 (Ordinance Amendment 225))")).toBe("PDF p.2, s.7");
    // brackets that pair stay
    expect(cleanLocator(", p.5, s.3(א)(2)")).toBe("p.5, s.3(א)(2)");
    expect(cleanLocator(", file p.2 (gazette p.375)")).toBe("file p.2 (gazette p.375)");
  });

  it("a link titled by its page keeps that page before the place the text after it names (TXF-48, 2026-11-12)", () => {
    const line = '- Source: [Annual report 2025](https://example.org/r.pdf#page=104), p.104, note 5, "Dividend income"; [p.119](https://example.org/r.pdf#page=119), note 10, "Non-reclaimable overseas income withholding tax" · checked 2026-11-12 · institution';
    const { sources } = extractFromLine(line, ctx());
    expect(sources.map((x) => [x.locator, x.page])).toEqual([
      ["p.104, note 5", 104],
      ["p.119, note 10", 119],
    ]);
  });

  it("a passage after the first quoted one gets a source of its own, with its page and quote (TXF-28, 2026-10-26)", () => {
    const line =
      '[Irish Revenue, Tax and Duty Manual Part 27-01a-02](https://www.revenue.ie/x/27-01a-02.pdf), p.8, s.4.1 "on the making of a regular payment"; p.9, s.4.2.3 "units which are held in a recognised clearing system"; p.11, s.4.2.8 "an appropriate non-resident declaration" · checked 2026-10-26 · primary (foreign tax authority)';
    const r = extractFromLine(line, ctx()).sources;
    expect(r.map((s) => [s.locator, s.page])).toEqual([["p.8, s.4.1", 8], ["p.9, s.4.2.3", 9], ["p.11, s.4.2.8", 11]]);
    expect(r.every((s) => s.url === "https://www.revenue.ie/x/27-01a-02.pdf" && s.checked === "2026-10-26" && s.strength === "primary" && s.qualifier === "(foreign tax authority)")).toBe(true);
    const he = extractFromLine('[חוק](https://fs.knesset.gov.il/a.pdf), p.3, s.9 "הנכסים של העמית יוחזקו בנפרד"; p.10, s.13 "הממונה רשאי להורות על העברה" · checked 2026-10-26 · primary', ctx()).sources;
    expect(he.map((s) => s.quote)).toEqual(["הנכסים של העמית יוחזקו בנפרד", "הממונה רשאי להורות על העברה"]);
    // the passages before the first quoted one are one source of their own, opening at their first page; the quoted passage is another
    const before = extractFromLine('[כללים](https://www.boi.org.il/a.pdf), p.2, s.5(ב); p.3, Annex A "סוג ריבית קבועה או משתנה" · checked 2026-10-26 · primary', ctx()).sources;
    expect(before.map((s) => [s.locator, s.page, s.quote])).toEqual([["p.2, s.5(ב)", 2, undefined], ["p.3, Annex A", 3, "סוג ריבית קבועה או משתנה"]]);
  });

  it("a passage split off a link that carries #page= opens at its own page; the block holds its address but for that number (CORP-27, TXF-28)", () => {
    const gazette = "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=";
    const line = `[תקנות השקעות משותפות בנאמנות (קרנות מחקות), התשע"ח-2018](${gazette}#page=4), reg. 2, file pp.3-4; file p.4 "פדיון התעודות יהיה רק במועדי תחלופת הנכסים" · checked 2026-11-07 · primary`;
    const r = extractFromLine(line, ctx()).sources;
    expect(r.map((s) => [s.url, s.locator, s.page])).toEqual([
      [`${gazette}#page=3`, "reg. 2, file pp.3-4", 3],
      [`${gazette}#page=4`, "file p.4", 4],
    ]);
    const revenue = "https://www.revenue.ie/x/27-01a-02.pdf";
    const passages = extractFromLine(`[Manual](${revenue}#page=8), p.8, s.4.1 "on the making of a regular payment"; p.9, s.4.2.3 "units which are held in a recognised clearing system" · checked 2026-10-26 · primary`, ctx()).sources;
    expect(passages.map((s) => [s.url, s.page])).toEqual([[`${revenue}#page=8`, 8], [`${revenue}#page=9`, 9]]);
    // the data check holds the address to the block but for its #page= number, and only that
    const block = { file: "x.md", body: `- Source: ${line}`, defs: {} };
    for (const s of r) expect(urlInBlock(s.url, block)).toBe(true);
    expect(urlInBlock(`${gazette}#page=12`, block)).toBe(true);
    expect(urlInBlock(`${gazette}`, block)).toBe(true);
    expect(urlInBlock(`${gazette.replace("MOnw", "XXnw")}#page=4`, block)).toBe(false);
    expect(urlInBlock(`${revenue}#page=9`, block)).toBe(false);
    // a link that yields one source keeps its address as written, even where its locator names another page (the data check says so)
    const [one] = extractFromLine(`[Directive](https://www.isa.gov.il/a/fees.pdf#page=5), p.1 s.3, p.5 Appendix A · checked 2026-11-08 · primary`, ctx()).sources;
    expect(one).toMatchObject({ url: "https://www.isa.gov.il/a/fees.pdf#page=5", page: 1 });
  });

  it("reference-style links resolve through the file's definitions, with angle brackets and parentheses in URLs", () => {
    const defs = { tr: "https://www.gov.il/BlobFolder/x/תקנות_(קופות_גמל)_(העברת).pdf", c17: "https://www.analyst.co.il/media/x/c17.pdf" };
    const line =
      '[Transfer Regulations 2008, regs. 2(א)(1), (4)][tr] · checked 2026-10-22 · primary; [Circular 2017-9-17 "העברת כספים", s.3(א)][c17], pp.11 to 17 · primary (third-party host); [Ordinance](<https://example.org/a(b)c>) s.3 · institution';
    const r = extractFromLine(line, ctx({ defs }));
    expect(r.sources.map((s) => s.url).sort()).toEqual(["https://example.org/a(b)c", defs.tr].sort());
    const tr = r.sources.find((s) => s.url === defs.tr)!;
    expect(tr.title).toBe("Transfer Regulations 2008, regs. 2(א)(1), (4)");
    expect(tr.locator).toBe("regs. 2(א)(1), (4)");
    expect(tr.kind).toBe("regulation");
    // a circular read on a third-party host is a copy: a lead, never a source
    expect(r.skipped).toContain(`copy of an official text, a lead only: ${defs.c17}`);
  });

  it("several sources: per-segment strength, the line's trailing date, sorted by preference", () => {
    const line =
      "[Mor bylaws](https://www.moreinvest.co.il/media/a.pdf), s.45 · institution; [Guide 2025](https://www.gov.il/BlobFolder/g/he/guide.pdf), p.8 · primary; [Ordinance](https://fs.knesset.gov.il/a.pdf), s.88 · primary · checked 2026-10-23";
    const r = extractFromLine(line, ctx());
    expect(r.sources.map((s) => [new URL(s.url).host, s.strength])).toEqual([
      ["www.gov.il", "primary"],
      ["fs.knesset.gov.il", "primary"],
      ["www.moreinvest.co.il", "institution"],
    ]);
    // the date after the last strength word is the line's trailing date for the segments that have none of their own
    expect(r.sources.map((s) => s.checked)).toEqual(["2026-10-23", "2026-10-23", "2026-10-23"]);
    expect(r.sources[0]).toMatchObject({ kind: "official_pdf", page: 8 });
  });

  it("a copy of an official text is a lead, never a source: Wikisource, Nevo, a copy folder, a third-party host called a copy", () => {
    const at = (url: string, word = "primary") => extractFromLine(`[Law](${url}), s.3 · checked 2026-10-22 · ${word}`, ctx());
    for (const url of ["https://he.wikisource.org/wiki/x", "https://www.nevo.co.il/law_html/law01/255_001.htm", "https://www.btl.gov.il/Laws1/00_0103_000000.pdf"]) {
      const r = at(url);
      expect(r.sources, url).toEqual([]);
      expect(r.skipped).toEqual([`copy of an official text, a lead only: ${url}`]);
    }
    expect(at("https://www.example.org/law.pdf", "primary (mirror)").sources).toEqual([]);
    // a regulator's own host is never a copy, whatever the qualifier says
    expect(at("https://www.gov.il/BlobFolder/x/law.pdf", "primary (government copy)").sources).toHaveLength(1);
  });

  it("a pointers-only line has no sources, the raw text as reason material and the pointed rules", () => {
    const r = extractFromLine("as in FXD-07, FXD-12, FXD-99 · checked 2026-10-22 · institution", ctx());
    expect(r.sources).toEqual([]);
    expect(r.derived_from).toEqual(["FXD-07", "FXD-12"]);
    expect(r.raw).toContain("as in FXD-07");
  });

  it("a general rule's pointer to a company's term is an example, not a derivation (review, 2026-10-26)", () => {
    const scopeOf = new Map([["FXD-07", "general"], ["FXD-12", "institution"]]);
    const general = extractFromLine("as in FXD-07; the company's statement: FXD-12 · checked 2026-10-22 · primary", ctx({ ruleScope: "general", scopeOf }));
    expect(general.derived_from).toEqual(["FXD-07"]);
    expect(general.examples).toEqual(["FXD-12"]);
    // a company's own term may point to anything: it derives from what it names
    const own = extractFromLine("as in FXD-07; FXD-12 · checked 2026-10-22 · institution", ctx({ ruleScope: "institution", scopeOf }));
    expect(own.derived_from).toEqual(["FXD-07", "FXD-12"]);
    expect(own.examples).toEqual([]);
  });

  it("a quoted Hebrew phrase becomes the quote, an elided or English one does not", () => {
    const line =
      '[Harel ceilings](https://media.harel-group.co.il/a.pdf), p. 1 "תקרת הפקדה שנתית לגמל להשקעה" · checked 2026-10-22 · institution; [Other](https://example.org/b), "the annual ceiling for deposits" ; [Third](https://example.org/c), "החל מיום ... הפקדות חדשות בלבד" · institution';
    const r = extractFromLine(line, ctx());
    const by = (u: string) => r.sources.find((s) => s.url.includes(u))!;
    expect(by("harel").quote).toBe("תקרת הפקדה שנתית לגמל להשקעה");
    expect(by("harel").locator).toBe("p. 1");
    expect(by("example.org/b").quote).toBeUndefined();
    expect(by("example.org/c").quote).toBeUndefined();
  });
  it("a source with no date of its own takes the next date after it on the line, not the line's last (2026-11-12)", () => {
    // the trailer "· checked … · primary" closes the run of links before it; a source added at the end with a newer date re-dates nothing
    const line =
      "[A](https://www.gov.il/a.pdf), p.1; [B](https://www.gov.il/b.pdf), p.2 · checked 2026-10-22 · primary; [C](https://www.boi.org.il/c.pdf), p.3 · checked 2026-11-12 · primary";
    const dates = Object.fromEntries(extractFromLine(line, ctx()).sources.map((s) => [s.title, s.checked]));
    expect(dates).toEqual({ A: "2026-10-22", B: "2026-10-22", C: "2026-11-12" });
    // a link after the last date on the line still takes that last date
    const tail = Object.fromEntries(extractFromLine("[A](https://www.gov.il/a.pdf), p.1 · checked 2026-10-22 · primary; [B](https://www.gov.il/b.pdf), p.2", ctx()).sources.map((s) => [s.title, s.checked]));
    expect(tail).toEqual({ A: "2026-10-22", B: "2026-10-22" });
  });
});

describe("extract-sources: parts", () => {
  it("parses balanced parentheses, quotes in titles and angle brackets", () => {
    const links = findLinks('[A "q" title](https://x.org/a(1)(2)?f={"k":1}) and [B](<https://y.org/p(q)>)', {});
    expect(links.map((l) => l.url)).toEqual(['https://x.org/a(1)(2)?f={"k":1}', "https://y.org/p(q)"]);
  });
  it("writes Hebrew locators", () => {
    expect(toHebrewLocator("pp.27–30")).toBe("עמודים 27 עד 30");
    expect(toHebrewLocator("reg. 2(א)(7)")).toBe("תקנה 2(א)(7)");
    expect(toHebrewLocator("bylaws p. 3")).toBeUndefined();
  });
  it("quotes need Hebrew or an English sentence, length and no elision", () => {
    expect(findQuote('"abc def ghi jkl"')).toBeUndefined();
    expect(findQuote('"קצר"')).toBeUndefined();
    expect(findQuote('התשנ"ה "הכנסה חייבת במס בשיעור מיוחד"')).toBe("הכנסה חייבת במס בשיעור מיוחד");
  });
  it("an English page's cited sentence is its quote; a quoted title, term or question is not (BRK-64, 2026-11-12)", () => {
    const sentence = "At this moment we do not offer trading on Tel Aviv Exchange (TASE) to retail clients who are a resident of Israel.";
    expect(findQuote(`FAQ 56713690, "Trading on TASE" "${sentence}"`)).toBe(sentence);
    expect(findQuote('the section "Order Execution Policy for Retail Clients"')).toBeUndefined();
    expect(findQuote('"Can I trade Israeli stocks in my account?"')).toBeUndefined();
    // Hebrew words come first when both are quoted
    expect(findQuote(`"${sentence}" and "קרנות נאמנות הנסחרות בבורסה"`)).toBe("קרנות נאמנות הנסחרות בבורסה");
  });
  it("an abbreviation's gershayim is no quote mark; quoted words inside a quote stay in it (BANK-07, TXF-10, 2026-11-12)", () => {
    expect(findQuote("ק״ת 7469, התשע״ה, p.3")).toBeUndefined();
    expect(findQuote('reg. 2(ד) ("בפסקה (1), במקום "20%" יבוא "25%""; and in para. (2)')).toBe('בפסקה (1), במקום "20%" יבוא "25%"');
    expect(findQuote('p.10 "הסכומים בטבלה אינם כוללים מע"מ"')).toBe("הסכומים בטבלה אינם כוללים מע״מ");
    expect(findQuote('s.2(3) "ההגדרות ״מסלול״, ״מסלול בסיסי״ ו״אדם עם מוגבלות״ – בטלות"; s.12')).toBe("ההגדרות ״מסלול״, ״מסלול בסיסי״ ו״אדם עם מוגבלות״ – בטלות");
  });
  it("a gazette booklet's link opens at the file's page, never at the page the gazette prints", () => {
    const booklet = "https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F7360%2Fheb";
    expect(firstPage("file p.7 (gazette p.1001), ss.2-4", booklet)).toBe(7);
    expect(firstPage("gazette p.1001, ss.2-4", booklet)).toBeUndefined();
    expect(firstPage("p.1001", booklet)).toBeUndefined();
    expect(firstPage("p.3 (gazette p.1071), s.3(9)", "https://fs.knesset.gov.il/25/law/25_lsr_14375739.pdf")).toBe(3);
    expect(pageInUrl(`${booklet}#page=4`)).toBe(4);
    expect(pageInUrl("https://www.inter-il.com/a/#page=4")).toBeUndefined();
    expect(toHebrewLocator("file p.7 (gazette p.1001), ss.2-4")).toBe("עמוד הקובץ 7 (עמוד הרשומות 1001), סעיפים 2-4");
    expect(toHebrewLocator("file p.28 (gazette p.244), s.74ב(א)(1) as enacted", "https://fs.knesset.gov.il/20/law/20_lsr_316719.pdf")).toBe(
      "עמוד הקובץ 28 (עמוד ספר החוקים 244), סעיף 74ב(א)(1) בנוסחו המקורי",
    );
    expect(toHebrewLocator("reg. 9(ב) as enacted")).toBe("תקנה 9(ב) בנוסחה המקורי");
    expect(toHebrewLocator("regs. 1-3 as enacted")).toBe("תקנות 1-3 בנוסחן המקורי");
    expect(toHebrewLocator("p.10, annex ג")).toBe("עמוד 10, נספח ג");
  });
  it("the first passage that names a page wins, with a plain p. or a file p.; a gazette p. never counts", () => {
    const pdf = "https://fs.knesset.gov.il/20/law/20_lsr_316719.pdf";
    expect(firstPage("p.5, s.2; file p.9 (gazette p.300), s.7", pdf)).toBe(5);
    expect(firstPage("gazette p.244, s.28; file p.31 (gazette p.247), s.74ה(4)", pdf)).toBe(31);
    expect(firstPage("file p.28 (gazette p.244), s.28(3); p.40, s.3", pdf)).toBe(28);
    // within one passage the file's page named beside a page says that page is the printed one (INS-21, TXK-12)
    expect(firstPage("p.909 (file p.21), s.56(א)", pdf)).toBe(21);
    expect(firstPage("s.22, gazette ס״ח תשס״ה p.898, file p.10", pdf)).toBe(10);
    // in a gazette booklet a plain p. is the printed number: the first file page wins over it
    const booklet = "https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F7076%2Fheb";
    expect(firstPage("p.600, s.2; file p.2 (gazette p.600), s.6", booklet)).toBe(2);
  });
  it("a remark in English after \"; \" leaves the locator; a second passage, a section list or a named place stays (CS-01, ETF-75)", () => {
    const gazette = "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/8OfazOM9J2n";
    const [s] = extractFromLine(
      `[gazette ק״ת 7727 (14.11.2016), p.135](${gazette}), file p.7 (gazette p.135); the Knesset's record of the regulations (2067442) lists no amendment, so the gazette text is the current one · checked 2026-11-08 · primary`,
      ctx(),
    ).sources;
    expect(s).toMatchObject({ locator: "file p.7 (gazette p.135)", locator_he: "עמוד הקובץ 7 (עמוד הרשומות 135)", page: 7 });
    expect(cleanLocator(", p.1 s.3, p.2 (the definition of `Mt`), p.5 Appendix A; the ISA directives list shows no later version")).toBe("p.1 s.3, p.2, p.5 Appendix A");
    for (const loc of ["p.4, ss.3 to 4; s.3(ד)", "p.3, s.4(א)-(ד); appendix A and B on pp.5-7", "pp.6 to 7; Schedule E", "p.8 footnote 1; and footnote 2", "file p.3, s.3.2.1; p.4, ss.3.2.2.1-3.2.2.2"])
      expect(cleanLocator(loc), loc).toBe(loc);
  });
  it("the source of a quote opens at the page of its passage, and its locator names that page (BRK-01, BANK-07)", () => {
    const [, s] = extractFromLine('[תקנון](https://content.tase.co.il/media/a/274690.pdf), p.4, s.1 definitions; p.8, s.2 "חבר בורסה הוא חברה שהתאגדה" · checked 2026-11-12 · primary', ctx()).sources;
    expect(s).toMatchObject({ locator: "p.8, s.2", locator_he: "עמוד 8, סעיף 2", page: 8, quote: "חבר בורסה הוא חברה שהתאגדה" });
    const line =
      '[same rules, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/rvzi1ngd/151.pdf), file p.1, amendment list (the last is ק"ת 7469, התשע"ה, p.554); file pp.5 to 7, section tags of ss.7-12 (the latest is of התשס"ג, on s.7); file p.18, Schedule E, row "הודעה מוקדמת על פרעון פקדון לשנה ומעלה" 1,000, under the tag [תיקון התשנ"ג (מס\' 2)] · checked 2026-11-07 · primary';
    const r = extractFromLine(line, ctx()).sources;
    expect(r.map((x) => [x.locator, x.locator_he, x.page, x.quote])).toEqual([
      ["file p.1", "עמוד הקובץ 1", 1, undefined],
      ["file p.18, Schedule E", undefined, 18, "הודעה מוקדמת על פרעון פקדון לשנה ומעלה"],
    ]);
    // every source's page is the first its own locator names
    for (const x of r) expect(firstPage(x.locator!, x.url)).toBe(x.page);
    // quote marks around a heading hold no quote: the passage stays with the ones before it (BRK-06)
    const heading = extractFromLine('[Conditions](https://www.isa.gov.il/a/Conditions_of_a_general.pdf), p.8, s.(1)(a)-(d); p.11, "Disclosure regarding the nature of the permit" · checked 2026-10-25 · primary', ctx()).sources;
    expect(heading.map((x) => [x.locator, x.page])).toEqual([["p.8, s.(1)(a)-(d); p.11", 8]]);
  });
  it("writeKeys appends the new keys last and replaces its own on a re-run", () => {
    const text = '{\n  "id": "A-1",\n  "n": 83.0\n}\n';
    const once = writeKeys(text, { sources: [{ url: "https://a.org" }], derived_from: ["B-2"] });
    expect(JSON.parse(once)).toMatchObject({ id: "A-1", derived_from: ["B-2"] });
    expect(once.startsWith('{\n  "id": "A-1",\n  "n": 83.0,\n  "sources": [')).toBe(true);
    const twice = writeKeys(once, { sources_missing_reason: "none" });
    expect(JSON.parse(twice)).toEqual({ id: "A-1", n: 83, sources_missing_reason: "none" });
    expect(twice.endsWith("\n}\n")).toBe(true);
    const pointed = writeKeys(twice, { sources_missing_reason: "none", see_also: [{ kind: "method", id: "F-04" }] });
    expect(JSON.parse(writeKeys(pointed, { sources_missing_reason: "none" }))).toEqual({ id: "A-1", n: 83, sources_missing_reason: "none" });
  });
});

describe("extract-sources: a source's standing", () => {
  const line = (q: string) => `[a text](https://www.gov.il/BlobFolder/x/he/a.pdf), p.3 · checked 2026-11-20 · primary ${q}`;
  it("comes from the parenthetical after the strength word, by the table's first matching row", () => {
    const at = (q: string) => extractFromLine(line(q), ctx()).sources[0]!;
    expect(at("(draft)")).toMatchObject({ qualifier: "(draft)", standing: "draft" });
    expect(at("(a bill, not binding)").standing).toBe("bill");
    expect(at("(explanatory notes)").standing).toBe("bill");
    expect(at("(superseded)").standing).toBe("superseded");
    expect(at("(state body's consolidated copy, not the binding gazette wording)").standing).toBe("consolidated-not-binding");
    expect(at("(official translation; the Hebrew text binds)").standing).toBe("translation");
    expect(at("(foreign regulator, general mechanism)").standing).toBe("foreign-view");
    expect(at("(the law's definition; whether it reaches tax inside a fund is not stated)").standing).toBe("does-not-answer");
    // a gazette is the binding text, whatever it says of a consolidated copy beside it
    expect(at("(gazette: the consolidated version as published in 1995; a state body's consolidated copy prints the same words)").standing).toBeUndefined();
  });

  it("writes none for a working note or a source that is what its kind says, and keeps the qualifier as written", () => {
    expect(standingOf("(library copy; read on the page image)")).toBe("working-note");
    expect(standingOf("(read in Chrome)")).toBe("working-note");
    expect(standingOf("(exchange rules, ISA-approved)")).toBe("none");
    const s = extractFromLine(line("(library 0527d8b9da405f0d)"), ctx()).sources[0]!;
    expect(s.qualifier).toBe("(library 0527d8b9da405f0d)");
    expect(s.standing).toBeUndefined();
  });

  it("comes from a title naming a state body's consolidated version where the qualifier gives no word, never from a Knesset consolidation", () => {
    const titled = (title: string, q = "") => extractFromLine(`[${title}](https://www.gov.il/BlobFolder/x/he/a.pdf), s.3 · checked 2026-11-20 · primary${q ? ` ${q}` : ""}`, ctx()).sources[0]!;
    expect(titled("פקודת מס הכנסה [נוסח חדש], נוסח משולב (רשות המסים)").standing).toBe("consolidated-not-binding");
    expect(titled("כללי הבנקאות (שירות ללקוח) (עמלות), התשס\"ח-2008, נוסח משולב (בנק ישראל)").standing).toBe("consolidated-not-binding");
    expect(titled("Banking Rules (Customer Service) (Fees) 2008, consolidated to 9.4.2025, BoI copy").standing).toBe("consolidated-not-binding");
    expect(titled("Securities Law, Securities Authority's consolidated copy, file of 26.8.2026").standing).toBe("consolidated-not-binding");
    expect(titled("חוק השקעות משותפות בנאמנות, התשנ\"ד-1994 (נוסח רשות ניירות ערך)").standing).toBe("consolidated-not-binding");
    expect(titled("פקודת הבנקאות, 1941 (קובץ חקיקה בנקאית של בנק ישראל, פריט 103)").standing).toBe("consolidated-not-binding");
    expect(titled("Disclosure rules 1992 (BoI copy)").standing).toBe("consolidated-not-binding");
    expect(titled("פקודת מס הכנסה [נוסח חדש], נוסח משולב (רשות המסים)", "(derived)").standing).toBe("consolidated-not-binding");
    expect(titled("פקודת מס הכנסה [נוסח חדש], נוסח משולב (רשות המסים)", "(draft)").standing).toBe("draft");
    expect(titled("חוק הביטוח הלאומי [נוסח משולב], התשנ\"ה-1995, ספר החוקים 1522").standing).toBeUndefined();
    expect(titled("צו הרחבה (נוסח משולב) לפנסיה חובה, ילקוט הפרסומים 6302").standing).toBeUndefined();
  });

  it("is shared by every passage of one file in a record, but for a citation's own does-not-answer", () => {
    const line =
      "[פקודת הבנקאות, Bank of Israel's copy](https://boi.org.il/media/a/103.pdf#page=10), p.10, s.8 · primary (state body's consolidated copy); [פקודת הבנקאות, 1941](https://boi.org.il/media/a/103.pdf), p.6, s.8ד · primary · checked 2026-11-20";
    expect(extractFromLine(line, ctx()).sources.map((s) => s.standing)).toEqual(["consolidated-not-binding", "consolidated-not-binding"]);
    const unsettled =
      "[a definition](https://www.gov.il/BlobFolder/x/he/b.pdf), p.2 · primary (the law's definition; whether it reaches tax inside a fund is not stated); [the same law](https://www.gov.il/BlobFolder/x/he/b.pdf#page=5), p.5 · primary · checked 2026-11-20";
    expect(extractFromLine(unsettled, ctx()).sources.map((s) => s.standing)).toEqual(["does-not-answer", undefined]);
  });

  it("lists a parenthetical no row names, so the run fails on it", () => {
    expect(standingOf("(a remark no one has read)")).toBeUndefined();
    expect(extractFromLine(line("(a remark no one has read)"), ctx()).unmapped).toEqual(["(a remark no one has read)"]);
    expect(extractFromLine(line("(draft)"), ctx()).unmapped).toEqual([]);
  });
});

describe("extract-sources: a title that points back to the link before it", () => {
  it("a ditto is written out from that link's document, its own parts kept unless the name holds them", () => {
    const line =
      '[כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/x/159a.pdf) pp.17-19 · checked 2026-10-25 · primary; [the same rules, first schedule, general note 3](https://www.boi.org.il/media/x/159a.pdf#page=24) p.24 · checked 2026-10-31 · primary';
    const second = extractFromLine(line, ctx()).sources.find((s) => s.page === 24)!;
    expect(second.title).toBe('כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל), first schedule, general note 3');
    expect(second.locator).toBe("p.24");
    expect(writeOutTitle("same rules, נוסח משולב (בנק ישראל)", "https://b.org/r.pdf", { title: "כללי X, התשנ\"ב-1992, נוסח משולב (בנק ישראל)", url: "https://b.org/r.pdf" })).toBe('כללי X, התשנ"ב-1992, נוסח משולב (בנק ישראל)');
    expect(writeOutTitle("s.62, same gazette", "https://k.org/l.pdf#page=14", { title: "s.60, gazette ס״ח תשמ״א, 208", url: "https://k.org/l.pdf#page=14" })).toBe("s.62, gazette ס״ח תשמ״א, 208");
    expect(writeOutTitle("אותן תקנות, תיקון", "https://k.org/b.pdf", { title: "תקנות מס הכנסה (ניכוי מריבית), p.4", url: "https://k.org/a.pdf" })).toBe("תקנות מס הכנסה (ניכוי מריבית), תיקון");
  });

  it("a title that is only a place takes the document's name when the link before it opens the same document", () => {
    const line = "[s.1, gazette ס״ח תשע״ד, 418](https://fs.knesset.gov.il/19/law/19_lsr_301590.pdf#page=2), [s.2](https://fs.knesset.gov.il/19/law/19_lsr_301590.pdf#page=3), [s.4](https://fs.knesset.gov.il/19/law/19_lsr_301590.pdf#page=3) · checked 2026-11-08 · primary";
    const titles = extractFromLine(line, ctx()).sources.map((s) => [s.locator, s.title]);
    expect(titles).toContainEqual(["s.2", "gazette ס״ח תשע״ד, 418"]);
    expect(titles).toContainEqual(["s.4", "gazette ס״ח תשע״ד, 418"]);
    // another document's address: the place stays the title, and with no link before it nothing is written out
    expect(writeOutTitle("p.119", "https://b.org/other.pdf#page=119", { title: "iShares VII plc, annual report", url: "https://b.org/report.pdf#page=104" })).toBe("p.119");
    expect(writeOutTitle("same rules", "https://b.org/r.pdf", undefined)).toBe("same rules");
  });
});

describe("extract-sources: see_also", () => {
  const formulas = new Set(["F-04", "F-104"]);
  const questions = new Set(["TXS OQ26", "GOV OQ2", "GOV OQ8"]);
  it("lists the method entries and prefixed open questions a block points to, once each, in the order named", () => {
    const skipped: string[] = [];
    const lines = ["the count over the one-year deposits is `docs/method.md` F-104 (GOV OQ2, OQ8); see [F-12 table](https://example.org/F-12)", "How the site runs a fund on it: docs/method.md F-04; TXS OQ26 and F-104 again; F-999; TXS OQ99; open question 4"];
    expect(seeAlsoFrom(lines, formulas, questions, skipped)).toEqual([
      { kind: "method", id: "F-104" },
      { kind: "question", id: "GOV OQ2" },
      { kind: "question", id: "GOV OQ8" },
      { kind: "method", id: "F-04" },
      { kind: "question", id: "TXS OQ26" },
    ]);
    expect(skipped).toEqual(["see_also: F-999 is no method entry of docs/method.md", "see_also: TXS OQ99 is no question of the rule base"]);
  });

  it("reads the Conditions line with its continuation lines", () => {
    expect(conditionsLineOf("- Rule: x\n- Conditions / exceptions: first part\n  second part (F-04)\n- Source: y")).toBe("first part second part (F-04)");
  });
});

describe("extract-sources: a figure source's place", () => {
  const pdf = "https://www.gov.il/BlobFolder/policy/x/he/booklet.pdf";
  it("moves the place at the end of the title into its own fields, its quoted words into the quote", () => {
    expect(placeInTitle('Tax Authority deductions booklet 2026 (April update), p.10, "שיעורי המס החלים על הכנסה שאינה מיגיעה אישית"', pdf)).toEqual({
      title: "Tax Authority deductions booklet 2026 (April update)",
      locator: "p.10",
      locator_he: "עמוד 10",
      page: 10,
      quote: "שיעורי המס החלים על הכנסה שאינה מיגיעה אישית",
    });
    expect(placeInTitle("תשקיף עיקרי של קסם, 9.8.2026, עמודים 15 עד 19", "https://example.org/p")).toEqual({ title: "תשקיף עיקרי של קסם, 9.8.2026", locator: "עמודים 15 עד 19", locator_he: "עמודים 15 עד 19" });
    // a comma inside brackets or quotes is no place's start; an English remark after the place stays with the title
    expect(placeInTitle('Tax Authority deductions booklet "לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026", p.10 (2026 tables)', pdf)).toMatchObject({
      title: 'Tax Authority deductions booklet "לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026" (2026 tables)',
      locator: "p.10",
    });
  });

  it("keeps in the title a place it cannot move whole, and leaves a title with no place alone", () => {
    expect(placeInTitle("פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים, p.85, s.47(ב1)(2); guide 2025 pp.62-64", pdf)).toBe("kept");
    expect(placeInTitle("תקנות (תיקון), p.3, reg. 2(ג): 5,306 (Tax Authority deductions booklet 2026, p.12) × 180", pdf)).toBe("kept");
    expect(placeInTitle('IRS Tax Treaty Table 1 (rev. May 2023), p.2, row "Israel"', pdf)).toBe("kept");
    expect(placeInTitle("National Insurance Institute, child savings: withdrawal page", pdf)).toBeUndefined();
  });

  it("rewrites every figure value's source, and the link's own #page= wins over the locator's page", () => {
    const value = (title: string, url = pdf) => ({ value: 1, unit: "pct", source: { url, title, publisher: "Tax Authority", strength: "primary" } });
    const placed = placeFigures({ a: value("Booklet, p.10"), b: { by_tax_year: { "2026": value("Booklet, p.12") } }, c: [{ up_to: value("Booklet"), rate: value("Booklet, p.3", `${pdf}#page=4`) }] });
    const f = placed.figures as { a: { source: object }; b: { by_tax_year: Record<string, { source: object }> }; c: { up_to: { source: object }; rate: { source: object } }[] };
    expect(placed.moved).toBe(3);
    expect(Object.keys(f.a.source)).toEqual(["url", "title", "publisher", "strength", "locator", "locator_he", "page"]);
    expect(f.a.source).toMatchObject({ title: "Booklet", locator: "p.10", page: 10 });
    expect(f.b.by_tax_year["2026"]!.source).toMatchObject({ title: "Booklet", page: 12 });
    expect(f.c[0]!.up_to.source).toEqual(value("Booklet").source);
    expect(f.c[0]!.rate.source).toMatchObject({ title: "Booklet", locator: "p.3" });
    expect(f.c[0]!.rate.source).not.toHaveProperty("page");
  });
});

describe("extract-sources: the real records", () => {
  const base = readRuleBaseIds(`${root}.claude/skills/il-finance/references`);
  const rulesDir = `${root}data/rules`;
  const records = readdirSync(rulesDir).map((f) => JSON.parse(readFileSync(`${rulesDir}/${f}`, "utf8")) as { id: string; strength: string; checked: string });
  const known = new Set(records.map((r) => r.id));

  it("every URL the extraction yields appears in the rule's markdown block, verbatim but for its #page= number", () => {
    for (const r of records) {
      const block = base.blocks!.get(r.id)!;
      const line = sourceLineOf(block.body) ?? "";
      const res = extractFromLine(line, { ruleId: r.id, ruleStrength: r.strength, ruleChecked: r.checked, defs: block.defs, knownIds: known });
      for (const s of res.sources) expect(urlInBlock(s.url, block), `${r.id} ${s.url}`).toBe(true);
    }
  }, 30000);

  it("every parenthetical after a strength word has its row in the standing table", () => {
    for (const r of records) {
      const block = base.blocks!.get(r.id)!;
      const res = extractFromLine(sourceLineOf(block.body) ?? "", { ruleId: r.id, ruleStrength: r.strength, ruleChecked: r.checked, defs: block.defs, knownIds: known });
      expect(res.unmapped, r.id).toEqual([]);
    }
  }, 30000);

  it("every rule that has a record yields at least one source", () => {
    for (const r of records) {
      const block = base.blocks!.get(r.id)!;
      const res = extractFromLine(sourceLineOf(block.body) ?? "", { ruleId: r.id, ruleStrength: r.strength, ruleChecked: r.checked, defs: block.defs, knownIds: known });
      expect(res.sources.length, r.id).toBeGreaterThan(0);
    }
  }, 30000);
});
