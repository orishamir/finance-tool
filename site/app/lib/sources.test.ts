import { describe, expect, it } from "vitest";
import { citationText, isPdfUrl, mayHaveChanged, moreSourcesLabel, pickSources, sourceHref, sourceLabel2, strongestStrength, type RuleSource } from "./sources";

const src = (o: Partial<RuleSource> = {}): RuleSource => ({ url: "https://example.gov.il/a", title: "T", publisher: "Pub", strength: "primary", checked: "2026-10-01", ...o });
const fig = (url: string, strength: string) => ({
  value: 1, unit: "pct", source: { url, title: "t", publisher: "p", strength }, checked: "2026-09-01", effective_from: null, effective_to: null, update_rule: "fixed in law", state: "sourced",
});

describe("pickSources", () => {
  it("sorts strongest first and keeps the order inside a strength", () => {
    const list = pickSources({ sources: [src({ url: "https://a/1", strength: "secondary" }), src({ url: "https://a/2", strength: "institution" }), src({ url: "https://a/3" }), src({ url: "https://a/4" })] });
    expect(list.map((s) => s.url)).toEqual(["https://a/3", "https://a/4", "https://a/2", "https://a/1"]);
  });
  it("leaves out a copy when an official source is there, and keeps it when it is the only text", () => {
    expect(pickSources({ sources: [src({ url: "https://he.wikisource.org/wiki/X", strength: "primary-mirror" }), src({ url: "https://a/1" })] }).map((s) => s.url)).toEqual(["https://a/1"]);
    expect(pickSources({ sources: [src({ url: "https://a/2", strength: "institution" }), src({ url: "https://he.wikisource.org/wiki/X", strength: "primary-mirror" })] }).map((s) => s.url)).toEqual(["https://he.wikisource.org/wiki/X", "https://a/2"]);
  });
  it("falls back to the figures' sources, one per url", () => {
    const figures = { x: fig("https://f/1", "primary"), y: { by_tax_year: { "2025": fig("https://f/1", "primary"), "2026": fig("https://f/2", "institution") } } } as never;
    expect(pickSources({ figures }).map((s) => s.url)).toEqual(["https://f/1", "https://f/2"]);
  });
  it("is empty with neither", () => expect(pickSources({})).toEqual([]));
});

describe("sourceHref", () => {
  it("adds the page to a PDF", () => expect(sourceHref(src({ url: "https://x/a.pdf", page: 27 }))).toBe("https://x/a.pdf#page=27"));
  it("adds the anchor to a page", () => expect(sourceHref(src({ url: "https://he.wikisource.org/wiki/X", anchor: "סעיף_3.ה4" }))).toBe("https://he.wikisource.org/wiki/X#סעיף_3.ה4"));
  it("leaves a plain link alone, and ignores a page on a web page", () => expect(sourceHref(src({ page: 3 }))).toBe("https://example.gov.il/a"));
  it("knows a PDF", () => {
    expect(isPdfUrl("https://x/BlobFolder/generalpage/a/he/b.pdf")).toBe(true);
    expect(isPdfUrl("https://x/page")).toBe(false);
  });
});

describe("sourceLabel2", () => {
  it("prefers the Hebrew fields", () => {
    const n = sourceLabel2(src({ publisher_he: "רשות", title_he: "מסמך", locator: "s. 3", locator_he: "סעיף 3" }));
    expect(n).toEqual({ publisher: "רשות", title: "מסמך", locator: "סעיף 3", mirror: null, mirrorKind: "עותק", pdf: false });
  });
  it("names the mirror host", () => {
    expect(sourceLabel2(src({ strength: "primary-mirror", mirror_host: "wikisource" })).mirror).toBe("ויקיטקסט");
    expect(sourceLabel2(src({ strength: "primary-mirror", mirror_host: "nevo" })).mirror).toBe("אתר נבו");
  });
});

describe("citationText", () => {
  const rule = { title: "x", title_he: "מעבר מסלול אינו אירוע מס" };
  it("writes the one line", () => {
    const t = citationText(rule, src({ publisher_he: "רשות המסים", title_he: "פקודת מס הכנסה", locator_he: "סעיף 3" }), "2026-10-24");
    expect(t).toBe("מעבר מסלול אינו אירוע מס — רשות המסים, פקודת מס הכנסה, סעיף 3. https://example.gov.il/a (נבדק 24.10.2026)");
  });
  it("labels a copy", () => {
    const t = citationText(rule, src({ url: "https://he.wikisource.org/wiki/X", strength: "primary-mirror", mirror_host: "wikisource", title_he: "פקודה" }), "2026-10-24");
    expect(t).toContain("פקודה · נוסח החוק (עותק), ויקיטקסט.");
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
    expect(strongestStrength([{ strength: "secondary" }, { strength: "primary-mirror" }])).toBe("primary-mirror");
    expect(strongestStrength([])).toBeNull();
  });
  it("uses the one, two, many words", () => {
    expect(moreSourcesLabel(1)).toBe("עוד מקור אחד");
    expect(moreSourcesLabel(2)).toBe("עוד שני מקורות");
    expect(moreSourcesLabel(5)).toBe("עוד 5 מקורות");
  });
});
