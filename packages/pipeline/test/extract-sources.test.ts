import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractFromLine, findLinks, findQuote, sourceLineOf, toHebrewLocator, wikisourceAnchor, writeKeys, type LineContext } from "../scripts/extract-sources.ts";
import { readRuleBaseIds, rewriteRawWikisource, urlInBlock } from "../src/references.ts";

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
    const line = "[Income Tax Ordinance (פקודת מס הכנסה), ss. 64A2, 64A3(a)(1)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), Wikisource mirror · checked 2026-10-22 · primary (mirror)";
    const [s] = extractFromLine(line, ctx()).sources;
    expect(s).toMatchObject({
      url: "https://he.wikisource.org/wiki/פקודת_מס_הכנסה",
      publisher: "he.wikisource.org",
      kind: "law",
      strength: "primary-mirror",
      mirror_host: "wikisource",
      checked: "2026-10-22",
      locator: "ss. 64A2, 64A3(a)(1)",
      anchor: "סעיף_64א2",
    });
    expect(s!.locator_he).toBe("סעיפים 64א2, 64א3(א)(1)");
  });

  it("a documents row with hosts labels only links on those hosts; another copy keeps its own host's label (2026-10-26)", () => {
    const documents = [{ id: "regs", match: ["ניכוי מריבית"], title_he: "תקנות (ניכוי מריבית)", publisher_he: "שר האוצר (נוסח משולב באתר המוסד לביטוח לאומי)", kind: "regulation" as const, official_url: null, hosts: ["btl.gov.il"] }];
    const publishers = { "he.wikisource.org": { publisher: "Hebrew Wikisource", publisher_he: "ויקיטקסט", kind: "law" as const, mirror: "wikisource" as const }, "free-justice.openapi.gov.il": { publisher: "Reshumot", publisher_he: "רשומות (משרד המשפטים)", kind: "law" as const, mirror: null } };
    const at = (url: string, title: string) => extractFromLine(`[${title}](${url}) · checked 2026-10-26 · primary`, ctx({ documents, publishers })).sources[0]!;
    expect(at("https://www.btl.gov.il/Laws1/02_0103_100269.pdf", "תקנות מס הכנסה (ניכוי מריבית), נוסח משולב").publisher_he).toBe("שר האוצר (נוסח משולב באתר המוסד לביטוח לאומי)");
    const mirror = at("https://he.wikisource.org/wiki/x", "תקנות מס הכנסה (ניכוי מריבית), ויקיטקסט");
    expect(mirror.publisher_he).toBe("ויקיטקסט");
    expect(mirror.kind).toBe("regulation");
    // the gazette host's "law" default gives way to a title that names regulations
    expect(at("https://free-justice.openapi.gov.il/free/moj/x/Documents/y", "תקנות מס הכנסה (ניכוי מריבית) (תיקון)").kind).toBe("regulation");
  });

  it("a passage after the first quoted one gets a source of its own, with its page and quote (TXF-28, 2026-10-26)", () => {
    const line =
      '[Irish Revenue, Tax and Duty Manual Part 27-01a-02](https://www.revenue.ie/x/27-01a-02.pdf), p.8, s.4.1 "on the making of a regular payment"; p.9, s.4.2.3 "units which are held in a recognised clearing system"; p.11, s.4.2.8 "an appropriate non-resident declaration" · checked 2026-10-26 · primary (foreign tax authority)';
    const r = extractFromLine(line, ctx()).sources;
    expect(r.map((s) => [s.locator, s.page])).toEqual([["p.8, s.4.1", 8], ["p.9, s.4.2.3", 9], ["p.11, s.4.2.8", 11]]);
    expect(r.every((s) => s.url === "https://www.revenue.ie/x/27-01a-02.pdf" && s.checked === "2026-10-26" && s.strength === "primary" && s.qualifier === "(foreign tax authority)")).toBe(true);
    const he = extractFromLine('[חוק](https://fs.knesset.gov.il/a.pdf), p.3, s.9 "הנכסים של העמית יוחזקו בנפרד"; p.10, s.13 "הממונה רשאי להורות על העברה" · checked 2026-10-26 · primary', ctx()).sources;
    expect(he.map((s) => s.quote)).toEqual(["הנכסים של העמית יוחזקו בנפרד", "הממונה רשאי להורות על העברה"]);
    // passages before the first quote stay in the one locator they always had; nothing already extracted changes
    const before = extractFromLine('[כללים](https://www.boi.org.il/a.pdf), p.2, s.5(ב); p.3, Annex A "סוג ריבית קבועה או משתנה" · checked 2026-10-26 · primary', ctx()).sources;
    expect(before).toHaveLength(1);
    expect(before[0]).toMatchObject({ locator: "p.2, s.5(ב); p.3, Annex A", quote: "סוג ריבית קבועה או משתנה" });
  });

  it("reference-style links resolve through the file's definitions, with angle brackets and parentheses in URLs", () => {
    const defs = { tr: "https://he.wikisource.org/wiki/תקנות_(קופות_גמל)_(העברת)", c17: "https://www.analyst.co.il/media/x/c17.pdf" };
    const line =
      '[Transfer Regulations 2008, regs. 2(א)(1), (4), Hebrew Wikisource][tr] · checked 2026-10-22 · primary (mirror); [Circular 2017-9-17 "העברת כספים", s.3(א)][c17], pp.11 to 17 · primary (third-party host); [Ordinance](<https://example.org/a(b)c>) s.3 · institution';
    const r = extractFromLine(line, ctx({ defs }));
    expect(r.sources.map((s) => s.url).sort()).toEqual(["https://example.org/a(b)c", defs.c17, defs.tr].sort());
    const tr = r.sources.find((s) => s.url === defs.tr)!;
    expect(tr.title).toBe("Transfer Regulations 2008, regs. 2(א)(1), (4), Hebrew Wikisource");
    expect(tr.locator).toBe("regs. 2(א)(1), (4)");
    expect(tr.kind).toBe("regulation");
    const c17 = r.sources.find((s) => s.url === defs.c17)!;
    expect(c17).toMatchObject({ strength: "primary-mirror", mirror_host: "other", page: 11, kind: "circular" });
  });

  it("several sources: per-segment strength, the line's trailing date, sorted by preference", () => {
    const line =
      "[Mor bylaws](https://www.moreinvest.co.il/media/a.pdf), s.45 · institution; [Guide 2025](https://www.gov.il/BlobFolder/g/he/guide.pdf), p.8 · primary; [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.88 · primary (mirror) · checked 2026-10-23";
    const r = extractFromLine(line, ctx());
    expect(r.sources.map((s) => [new URL(s.url).host, s.strength])).toEqual([
      ["www.gov.il", "primary"],
      ["he.wikisource.org", "primary-mirror"],
      ["www.moreinvest.co.il", "institution"],
    ]);
    // the date after the last strength word is the line's trailing date for the segments that have none of their own
    expect(r.sources.map((s) => s.checked)).toEqual(["2026-10-23", "2026-10-23", "2026-10-23"]);
    expect(r.sources[0]).toMatchObject({ kind: "official_pdf", page: 8 });
  });

  it("a raw Wikisource URL becomes the readable page, with the section anchor", () => {
    const raw = "https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw";
    const line = `[National Insurance Law (Wikisource mirror)](${raw}), s.345(a) · checked 2026-10-22 · primary (mirror)`;
    const [s] = extractFromLine(line, ctx()).sources;
    expect(s!.url).toBe("https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99");
    expect(s!.anchor).toBe("סעיף_345");
    expect(rewriteRawWikisource(raw)).toBe(s!.url);
    expect(urlInBlock(s!.url, { file: "x.md", body: line, defs: {} })).toBe(true);
  });

  it("a pointers-only line has no sources, the raw text as reason material and the pointed rules", () => {
    const r = extractFromLine("as in FXD-07, FXD-12, FXD-99 · checked 2026-10-22 · institution", ctx());
    expect(r.sources).toEqual([]);
    expect(r.derived_from).toEqual(["FXD-07", "FXD-12"]);
    expect(r.raw).toContain("as in FXD-07");
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
});

describe("extract-sources: parts", () => {
  it("parses balanced parentheses, quotes in titles and angle brackets", () => {
    const links = findLinks('[A "q" title](https://x.org/a(1)(2)?f={"k":1}) and [B](<https://y.org/p(q)>)', {});
    expect(links.map((l) => l.url)).toEqual(['https://x.org/a(1)(2)?f={"k":1}', "https://y.org/p(q)"]);
  });
  it("maps Latin sub-letters a to e to Hebrew and keeps one level below the section", () => {
    expect(wikisourceAnchor("s.3(e4)(3)")).toBe("סעיף_3.ה4");
    expect(wikisourceAnchor("s.125C(b)")).toBe("סעיף_125ג");
    expect(wikisourceAnchor("s.91(b)(1)")).toBe("סעיף_91");
    expect(wikisourceAnchor("s.3(ה4)(3)")).toBe("סעיף_3.ה4");
    expect(wikisourceAnchor("reg. 2(א)")).toBe("סעיף_2.א"); // regulation pages carry the same סעיף ids (checked 2026-10-24)
    expect(wikisourceAnchor("bylaws clause 7")).toBeUndefined();
    expect(toHebrewLocator("pp.27–30")).toBe("עמודים 27 עד 30");
    expect(toHebrewLocator("reg. 2(א)(7)")).toBe("תקנה 2(א)(7)");
    expect(toHebrewLocator("bylaws p. 3")).toBeUndefined();
  });
  it("quotes need Hebrew, length and no elision", () => {
    expect(findQuote('"abc def ghi jkl"')).toBeUndefined();
    expect(findQuote('"קצר"')).toBeUndefined();
    expect(findQuote('התשנ"ה "הכנסה חייבת במס בשיעור מיוחד"')).toBe("הכנסה חייבת במס בשיעור מיוחד");
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

  it("every URL the extraction yields appears in the rule's markdown block (verbatim or as the raw-Wikisource rewrite)", () => {
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
