// tools/quote-fragments.mjs reads the pages the site links to at quoted words; these tests hold it to the site's own reading of a link.
import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain node script without types
import { fold, hintFor, isPdfUrl as toolIsPdf, occurrences, pageOf, PIECE_GAP } from "../../../tools/quote-fragments.mjs";
import { isPdfUrl } from "./sources";

const urls = [
  "https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F7360%2Fheb",
  "https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F6218%2Fheb#page=3",
  "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/abc=#page=3",
  "https://www.gov.il/BlobFolder/policy/x/he/y.pdf",
  "https://content.tase.co.il/media/t3coscsb/274627.pdf",
  "https://www.example.co.il/file.pdf?v=2",
  "https://www.inter-il.com/israeli-stock-market/",
  "https://www.interactivebrokers.com/lib/cstools/faq/#/content/56713690",
  "https://www.boi.org.il/media/abc/page.html",
];

describe("tools/quote-fragments.mjs", () => {
  it("calls a link a PDF exactly where the site does", () => {
    for (const u of urls) expect([u, toolIsPdf(u)]).toEqual([u, isPdfUrl(u)]);
    expect(toolIsPdf(urls[0])).toBe(true);
  });
  it("reads a page that routes by its # at the full address, and any other page without its #", () => {
    expect(pageOf("https://www.interactivebrokers.com/lib/cstools/faq/#/content/56713690")).toBe("https://www.interactivebrokers.com/lib/cstools/faq/#/content/56713690");
    expect(pageOf("https://example.com/app#!/a/b")).toBe("https://example.com/app#!/a/b");
    expect(pageOf("https://www.irs.gov/publications/p515#en_US_2026_publink1000")).toBe("https://www.irs.gov/publications/p515");
    expect(pageOf("https://www.irs.gov/instructions/i1040nr#:~:text=you")).toBe("https://www.irs.gov/instructions/i1040nr");
  });
  it("finds a hint whatever quote marks its words are written with", () => {
    const hints = [{ url: "https://www.gov.il/he/pages/govermental-bonds", words: "מאפייני אג״ח סחיר", occurrence: 4 }];
    expect(hintFor(hints, { url: hints[0]!.url, words: 'מאפייני אג"ח סחיר' })?.occurrence).toBe(4);
    expect(hintFor(hints, { url: "https://www.gov.il/he/pages/other", words: 'מאפייני אג"ח סחיר' })).toBeUndefined();
  });
  it("joins the pieces of a quote across a bounded gap, to the nearest next piece", () => {
    const filler = (n: number) => "מילה ".repeat(Math.ceil(n / 5)).slice(0, n);
    const page = (gap: number) => fold(`פתיחה של הציטוט ${filler(gap)} סוף של הציטוט ${filler(3000)} סוף של הציטוט`).text;
    const near = occurrences(page(767), "פתיחה של הציטוט … סוף של הציטוט");
    expect(near).toHaveLength(1);
    expect(page(767).slice(near[0][0], near[0][1]).length).toBeLessThan(767 + 40);
    expect(occurrences(page(PIECE_GAP + 200), "פתיחה של הציטוט … סוף של הציטוט")).toHaveLength(0);
  });
});
