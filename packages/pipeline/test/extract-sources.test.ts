import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cleanLocator, extractFromLine, findLinks, findQuote, firstPage, pageInUrl, sourceLineOf, toHebrewLocator, writeKeys, type LineContext } from "../scripts/extract-sources.ts";
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
  });
});

describe("extract-sources: the real records", () => {
  const base = readRuleBaseIds(`${root}.claude/skills/il-finance/references`);
  const rulesDir = `${root}data/rules`;
  const records = readdirSync(rulesDir).map((f) => JSON.parse(readFileSync(`${rulesDir}/${f}`, "utf8")) as { id: string; strength: string; checked: string });
  const known = new Set(records.map((r) => r.id));

  it("every URL the extraction yields appears in the rule's markdown block, verbatim", () => {
    for (const r of records) {
      const block = base.blocks!.get(r.id)!;
      const line = sourceLineOf(block.body) ?? "";
      const res = extractFromLine(line, { ruleId: r.id, ruleStrength: r.strength, ruleChecked: r.checked, defs: block.defs, knownIds: known });
      for (const s of res.sources) expect(urlInBlock(s.url, block), `${r.id} ${s.url}`).toBe(true);
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
