import { describe, expect, it } from "vitest";
import { citationFor, citationText, documentKey, isPdfUrl, mayHaveChanged, moreSourcesLabel, onSharedPortal, pickSources, publicUrl, publisherName, sourceChange, sourceHref, sourceLabel2, sourceView, withoutCodes, type RuleSource } from "./sources";
import { groupDocuments } from "./documents.server";
import { publisherHe } from "./publisher-he.server";

/** The value a test needs, or a failure naming it. */
const must = <T,>(x: T | null | undefined): T => {
  if (x === null || x === undefined) throw new Error("the value the test reads is missing");
  return x;
};
const src = (o: Partial<RuleSource> = {}): RuleSource => ({ url: "https://example.gov.il/a", title: "T", publisher: "Pub", strength: "primary", checked: "2026-10-01", ...o });
const fig = (url: string, strength: string) => ({
  value: 1, unit: "pct", source: { url, title: "t", publisher: "p", strength }, checked: "2026-09-01", effective_from: null, effective_to: null, update_rule: "fixed in law", state: "sourced",
});

describe("pickSources", () => {
  it("sorts strongest first and keeps the order inside a strength", () => {
    const list = pickSources({ sources: [src({ url: "https://a/1", strength: "secondary" }), src({ url: "https://a/2", strength: "institution" }), src({ url: "https://a/3" }), src({ url: "https://a/4" })] });
    expect(list.map((s) => s.url)).toEqual(["https://a/3", "https://a/4", "https://a/2", "https://a/1"]);
  });
  it("falls back to the figures' sources, one per url", () => {
    const figures = { x: fig("https://f/1", "primary"), y: { by_tax_year: { "2025": fig("https://f/1", "primary"), "2026": fig("https://f/2", "institution") } } } as never;
    expect(pickSources({ figures }).map((s) => s.url)).toEqual(["https://f/1", "https://f/2"]);
  });
  it("is empty with neither", () => expect(pickSources({})).toEqual([]));
});

describe("sourceHref", () => {
  it("adds the page to a PDF", () => expect(sourceHref(src({ url: "https://x/a.pdf", page: 27 }))).toBe("https://x/a.pdf#page=27"));
  it("adds the anchor to a page", () => expect(sourceHref(src({ url: "https://example.gov.il/law", anchor: "s3" }))).toBe("https://example.gov.il/law#s3"));
  it("leaves a plain link alone, and ignores a page on a web page", () => expect(sourceHref(src({ page: 3 }))).toBe("https://example.gov.il/a"));
  it("knows a PDF", () => {
    expect(isPdfUrl("https://x/BlobFolder/generalpage/a/he/b.pdf")).toBe(true);
    expect(isPdfUrl("https://x/page")).toBe(false);
    expect(isPdfUrl("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77Q=#page=6")).toBe(true);
  });
  // a web page opens at the quoted words, by text fragment
  const psagot = "https://www.psagot.co.il/tariff-2/";
  it("opens a web page at the quoted words, start and end", () =>
    expect(sourceHref({ url: psagot, fragment: { start: "דמי משמרת", end: "גבייה רבעונית 0.03%" } })).toBe(
      `${psagot}#:~:text=%D7%93%D7%9E%D7%99%20%D7%9E%D7%A9%D7%9E%D7%A8%D7%AA,%D7%92%D7%91%D7%99%D7%99%D7%94%20%D7%A8%D7%91%D7%A2%D7%95%D7%A0%D7%99%D7%AA%200.03%25`,
    ));
  it("escapes the directive's own signs inside a term, and writes prefix and suffix", () =>
    expect(sourceHref({ url: "https://x/a", fragment: { prefix: "a-b", start: "1,5 & 2", suffix: "c" } })).toBe("https://x/a#:~:text=a%2Db-,1%2C5%20%26%202,-c"));
  it("keeps the anchor before the words", () => expect(sourceHref({ url: "https://x/a", anchor: "s3", fragment: { start: "w" } })).toBe("https://x/a#s3:~:text=w"));
  it("adds the words to an address that has a # already", () => expect(sourceHref({ url: "https://x/a#b", fragment: { start: "w" } })).toBe("https://x/a#b:~:text=w"));
  // a company's written answer is a file of the repository, opened at its public page; a parameter's rationale is not
  it("opens a company's written answer at the repository's page, and leaves other files alone", () => {
    expect(sourceHref({ url: "docs/company-answers.md#ibi-2026-11-08", page: 73 })).toBe("https://github.com/orishamir/finance-tool/blob/main/docs/company-answers.md#ibi-2026-11-08");
    expect(publicUrl("docs/parameters-rationale.md#goal-presets")).toBe("docs/parameters-rationale.md#goal-presets");
  });
  it("adds the words as a second directive to an address that has one", () => expect(sourceHref({ url: "https://x/a#:~:text=v", fragment: { start: "w" } })).toBe("https://x/a#:~:text=v&text=w"));
  it("opens a PDF at its page, never at words", () => expect(sourceHref({ url: "https://x/a.pdf", page: 4, fragment: { start: "w" } })).toBe("https://x/a.pdf#page=4"));
});

describe("sourceLabel2", () => {
  it("prefers the Hebrew fields", () => {
    const n = sourceLabel2(src({ publisher_he: "רשות", title_he: "מסמך", locator: "s. 3", locator_he: "סעיף 3" }));
    expect(n).toEqual({ publisher: "רשות", title: "מסמך", locator: "סעיף 3", pdf: false });
  });
});

describe("citationText", () => {
  const rule = { title: "x", title_he: "מעבר מסלול אינו אירוע מס" };
  it("writes the one line", () => {
    const t = citationText(rule, src({ publisher_he: "רשות המסים", title_he: "פקודת מס הכנסה", locator_he: "סעיף 3" }), "2026-10-24", { rules: {}, today: "2026-10-24" });
    expect(t).toBe("מעבר מסלול אינו אירוע מס — רשות המסים, פקודת מס הכנסה, סעיף 3. https://example.gov.il/a (נבדק 24.10.2026)");
  });
});

describe("mayHaveChanged", () => {
  const today = "2026-10-24";
  it("is false for a rule likely to change whose recheck date is still ahead (the card shows that date instead)", () => expect(mayHaveChanged({ likely_to_change: "yes", recheck_date: "2027-01-01" }, { checked: today }, today)).toBe(false));
  it("is true when the recheck date has passed", () => expect(mayHaveChanged({ likely_to_change: "no", recheck_date: "2026-10-01" }, { checked: today }, today)).toBe(true));
  it("is true past six months", () => {
    expect(mayHaveChanged({ likely_to_change: "no" }, { checked: "2026-04-23" }, today)).toBe(true);
    expect(mayHaveChanged({ likely_to_change: "no" }, { checked: "2026-04-24" }, today)).toBe(false);
  });
});

describe("moreSourcesLabel", () => {
  it("uses the one, two, many words", () => {
    expect(moreSourcesLabel(1)).toBe("עוד מקור אחד");
    expect(moreSourcesLabel(2)).toBe("עוד שני מקורות");
    expect(moreSourcesLabel(5)).toBe("עוד 5 מקורות");
  });
});

describe("a title as shown carries no rule code (D101)", () => {
  it("drops a code in brackets, and keeps an index's name", () => {
    expect(withoutCodes("אינטראקטיב ישראל: בורסה ישראלית (BRK-41)")).toBe("אינטראקטיב ישראל: בורסה ישראלית");
    expect(withoutCodes("עמוד (BRK-41, BRK-44) של החברה")).toBe("עמוד של החברה");
    expect(withoutCodes("מדד ת״א (TA-35)")).toBe("מדד ת״א (TA-35)");
  });
});

describe("sourceView: one shape for every source drawing", () => {
  const pdf = "https://www.gov.il/BlobFolder/x/ordinance.pdf";
  it("groups places by document, with a head link at no place and the places in order", () => {
    const [doc, other] = sourceView([
      src({ url: `${pdf}#page=3`, title_he: "פקודת מס הכנסה", locator_he: "סעיף 9", page: 3 }),
      src({ url: "https://example.org/b" }),
      src({ url: `${pdf}#page=7`, title_he: "פקודת מס הכנסה", locator_he: "סעיף 91", page: 7 }),
    ]);
    expect(must(doc).href).toBe(pdf);
    expect(must(doc).places.map((p) => [p.locator, p.href])).toEqual([["סעיף 9", `${pdf}#page=3`], ["סעיף 91", `${pdf}#page=7`]]);
    expect(must(other).href).toBe("https://example.org/b");
  });
  it("keeps a page's own #/ route apart: it names another page", () => {
    expect(documentKey("https://x.example/faq#/content/1")).toBe("https://x.example/faq#/content/1");
    expect(documentKey("https://x.example/faq#/content/1:~:text=w")).toBe("https://x.example/faq#/content/1");
    expect(documentKey("https://x.example/faq#s3")).toBe("https://x.example/faq");
  });
  it("names the document once for the group, by its Hebrew title, and gives a place its own Hebrew title only where it differs", () => {
    const [doc] = sourceView([src({ url: "https://x.example/a#p1", title: "Guide", kind: "official_pdf" }), src({ url: "https://x.example/a#p2", title_he: "מדריך המס", publisher_he: "רשות המסים" }), src({ url: "https://x.example/a#p3", title_he: "שאלות ותשובות" })]);
    expect(must(must(doc).title).text).toBe("מדריך המס");
    expect(must(doc).publisher).toBe("רשות המסים");
    expect(must(doc).places.map((p) => p.title)).toEqual([null, null, "שאלות ותשובות"]);
  });
  it("drops the publisher wherever the title holds it, and keeps the title whole", () => {
    const [doc] = sourceView([src({ publisher_he: "רשות המסים", title_he: "פקודת מס הכנסה [נוסח חדש], נוסח משולב (רשות המסים)" })]);
    expect(must(doc).publisher).toBeNull();
    expect(must(must(doc).title).text).toBe("פקודת מס הכנסה [נוסח חדש], נוסח משולב (רשות המסים)");
  });
  it("takes the record's Hebrew publisher before the host table, and never names a shared portal as the publisher", () => {
    const table = { "boi.org.il": "בנק ישראל", "data.gov.il": "מאגר המידע הממשלתי (data.gov.il)", "gov.il": "אתר הממשלה (gov.il)" };
    expect(publisherName(src({ url: "https://www.boi.org.il/x", publisher: "Bank of Israel" }), table)).toBe("בנק ישראל");
    expect(publisherName(src({ url: "https://www.boi.org.il/x", publisher_he: "המפקח על הבנקים" }), table)).toBe("המפקח על הבנקים");
    expect(publisherName(src({ url: "https://data.gov.il/dataset/x", publisher: "Capital Market Authority" }), table)).toBe("Capital Market Authority");
    expect(publisherName(src({ url: "https://www.gov.il/he/x", publisher: "Israel Tax Authority" }), table)).toBe("Israel Tax Authority");
    expect(["api.tase.co.il", "data-api.ecb.europa.eu"].every((h) => onSharedPortal(`https://${h}/x`))).toBe(true);
  });
  it("sets the direction from the title as shown: a kind's word is Hebrew, a host is not", () => {
    const [law] = sourceView([src({ title: "s.2", kind: "law" })]);
    expect(must(must(law).title).text).toBe("חוק");
    expect(must(law).hebrew).toBe(true);
    const [host] = sourceView([src({ title: "Some page", url: "https://example.org/p" })]);
    expect(must(host).title).toEqual({ text: "example.org", host: true });
    expect(must(host).hebrew).toBe(false);
  });
});

describe("the copied citation names the place the card shows (Q42)", () => {
  const rule = { title: "x", title_he: "מעבר מסלול אינו אירוע מס" };
  const slots = { rules: {}, today: "2026-10-24" };
  it("writes the chosen place's locator, link and date under the document's shared names", () => {
    const [doc] = sourceView([src({ url: "https://x/a.pdf", page: 2, publisher_he: "רשות המסים", title_he: "חוזר", locator_he: "סעיף 1" }), src({ url: "https://x/a.pdf", page: 5, title_he: "חוזר", locator_he: "סעיף 4", checked: "2026-10-20" })]);
    expect(citationFor(rule, must(doc), slots, must(doc).places[1])).toBe("מעבר מסלול אינו אירוע מס — רשות המסים, חוזר, סעיף 4. https://x/a.pdf#page=5 (נבדק 20.10.2026)");
    expect(citationFor(rule, must(doc), slots)).toContain("סעיף 1. https://x/a.pdf#page=2");
  });
});

describe("sourceChange (Q58, Q68)", () => {
  const today = "2026-12-10";
  it("says unknown when no rule is loaded and the read is recent, and may-have-changed past six months whatever is loaded", () => {
    expect(sourceChange([], { checked: "2026-11-01" }, today)).toBe("unknown");
    expect(sourceChange([], { checked: "2026-06-09" }, today)).toBe("may-have-changed");
    expect(sourceChange([{ recheck_date: "2027-06-01" }], { checked: "2026-11-01" }, "")).toBe("unknown");
  });
  it("reads the soonest recheck date of all the loaded rules, not the first", () => {
    expect(sourceChange([{ recheck_date: "2027-06-01" }, { recheck_date: "2026-12-01" }], { checked: "2026-11-01" }, today)).toBe("may-have-changed");
    expect(sourceChange([{ recheck_date: "2027-06-01" }, { recheck_date: null }], { checked: "2026-11-01" }, today)).toBe("current");
  });
  it("takes the source's own date: read again on or after the recheck date, it is current", () => {
    expect(sourceChange([{ recheck_date: "2026-12-01" }], { checked: "2026-12-05" }, today)).toBe("current");
  });
});

// The drawings that name a source each read its names from one place (Q20): the source block, the copied citation, the documents
// page and the company a figure belongs to agree on who published one source and what it is called.
describe("one source, named alike by every drawing (Q20)", () => {
  const source = src({ url: "https://www.boi.org.il/x", publisher: "Bank of Israel", title_he: "הוראת ניהול בנקאי תקין 425", locator_he: "סעיף 3", kind: "regulation" });
  const publishers = { "boi.org.il": { publisher_he: "בנק ישראל" } };
  const [view] = sourceView([source], { "boi.org.il": "בנק ישראל" });
  it("the source block, the citation and the documents page give the same publisher and title", () => {
    const card = must(groupDocuments({ "A-1": { id: "A-1", title: "A-1", title_he: "כלל", strength: "primary", sources: [source] } as never }, [], publishers)[0]);
    expect([must(view).publisher, must(must(view).title).text]).toEqual(["בנק ישראל", "הוראת ניהול בנקאי תקין 425"]);
    expect([card.publisher, card.title]).toEqual([must(view).publisher, must(must(view).title).text]);
    expect(citationFor({ title: "x", title_he: "כלל" }, must(view), { rules: {}, today: "2026-10-24" })).toContain(`— ${must(view).publisher}, ${must(must(view).title).text}, סעיף 3.`);
    expect(publisherHe({ source } as never)).toBe(must(view).publisher);
  });
});
