import { describe, expect, it } from "vitest";
import { citationText, isPdfUrl, mayHaveChanged, moreSourcesLabel, pickSources, publicUrl, sourceHref, sourceLabel2, strongestStrength, type RuleSource } from "./sources";

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
    const t = citationText(rule, src({ publisher_he: "רשות המסים", title_he: "פקודת מס הכנסה", locator_he: "סעיף 3" }), "2026-10-24");
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

describe("strongestStrength and moreSourcesLabel", () => {
  it("picks the strongest", () => {
    expect(strongestStrength([{ strength: "secondary" }, { strength: "institution" }])).toBe("institution");
    expect(strongestStrength([])).toBeNull();
  });
  it("uses the one, two, many words", () => {
    expect(moreSourcesLabel(1)).toBe("עוד מקור אחד");
    expect(moreSourcesLabel(2)).toBe("עוד שני מקורות");
    expect(moreSourcesLabel(5)).toBe("עוד 5 מקורות");
  });
});
