// A page's head (lib/page-meta.ts) and the built-pages guard over it (site/scripts/link-preview-check.mjs): what the helper writes
// passes the guard, and a page that lacks the card, says too little or carries a straight quote in Hebrew fails it.
import { describe, expect, it } from "vitest";
import type { MetaDescriptor } from "react-router";
// @ts-expect-error a plain ES module script, without types
import { addressOf, previewProblems } from "../../scripts/link-preview-check.mjs";
import { pageMeta, pageUrl, PREVIEW_PICTURE, SITE_URL } from "./page-meta";
import { pagePreview, site } from "../copy";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
/** The head React Router writes for these tags, with the root's noindex. */
function head(tags: MetaDescriptor[]): string {
  const parts = ['<meta name="robots" content="noindex"/>'];
  for (const t of tags as Record<string, string>[]) {
    if (t.title !== undefined) parts.push(`<title>${esc(t.title)}</title>`);
    else if (t.property) parts.push(`<meta property="${t.property}" content="${esc(t.content!)}"/>`);
    else if (t.name) parts.push(`<meta name="${t.name}" content="${esc(t.content!)}"/>`);
  }
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head>${parts.join("")}</head><body></body></html>`;
}
const check = (html: string, page: string, hasFile: (p: string) => boolean = (p) => p === PREVIEW_PICTURE.file): string[] => previewProblems(html, { page, siteUrl: SITE_URL, hasFile });

describe("a page's address", () => {
  it("is the site's address and the path under the basename, with a last slash", () => {
    expect(pageUrl("/")).toBe(SITE_URL);
    expect(pageUrl("/guide/keren-hishtalmut")).toBe(`${SITE_URL}guide/keren-hishtalmut/`);
    expect(pageUrl("/finance-tool/guide/keren-hishtalmut/")).toBe(`${SITE_URL}guide/keren-hishtalmut/`);
    expect(pageUrl("/finance-tool/")).toBe(SITE_URL);
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+\/finance-tool\/$/);
  });
  it("is where Pages serves the built file", () => {
    expect(addressOf(SITE_URL, "guide/keren-hishtalmut/index.html")).toBe(pageUrl("/guide/keren-hishtalmut"));
    expect(addressOf(SITE_URL, "index.html")).toBe(SITE_URL);
  });
});

describe("the card a link shows", () => {
  const guide = pageMeta({ title: "קרן השתלמות", description: "חיסכון דרך מקום העבודה, או בעצמכם כעצמאים, שאחרי תקופה שקבע החוק אפשר למשוך בלי מס", location: { pathname: "/guide/keren-hishtalmut" } });
  it("passes the built-pages guard: title, description, Open Graph and Twitter tags, the page's address, the picture", () => {
    expect(check(head(guide), "guide/keren-hishtalmut/index.html")).toEqual([]);
    expect(check(head(pageMeta({ title: null, description: site.tagline, location: { pathname: "/" } })), "index.html")).toEqual([]);
  });
  it("names the page alone in og:title and with the site in the title", () => {
    const of = (k: string) => (guide as Record<string, string>[]).find((t) => t.property === k || t.name === k)?.content;
    expect((guide as { title?: string }[]).find((t) => t.title)?.title).toBe(`קרן השתלמות · ${site.name}`);
    expect(of("og:title")).toBe("קרן השתלמות");
    expect(of("og:image")).toBe(SITE_URL + PREVIEW_PICTURE.file);
  });
  it("writes an abbreviation's straight quote from the data as the gershayim, and the text on one line", () => {
    const tags = pageMeta({ title: 'מדד ת"א-125', description: 'מדד של החברות הגדולות בבורסה בתל אביב,\n  במשקל לפי שווי השוק; לפי ת"א.', location: { pathname: "/exposure/index-ta125" } });
    const html = head(tags);
    expect(html).toContain("ת״א-125");
    expect(html).not.toContain("\n");
    expect(check(html, "exposure/index-ta125/index.html")).toEqual([]);
  });
  it("fails a page without the card, a short description, a missing picture, another page's address and a straight quote", () => {
    const bare = '<html><head><meta name="robots" content="noindex"/><title>x</title><meta name="description" content="קצר"/></head></html>';
    const found = check(bare, "a/index.html").join("\n");
    expect(found).toContain("a description of 3 characters");
    expect(found).toContain("no og:image");
    expect(found).toContain("no twitter:card");
    expect(check(head(guide), "guide/other/index.html").join("\n")).toContain("og:url");
    expect(check(head(guide), "guide/keren-hishtalmut/index.html", () => false).join("\n")).toContain("no such file in the build");
    expect(check(head(guide).replace(/name="robots" content="noindex"/, 'name="robots" content="all"'), "guide/keren-hishtalmut/index.html")).toContain("no robots noindex");
    expect(check(head(guide).replace("<title>קרן השתלמות", '<title>אג"ח'), "guide/keren-hishtalmut/index.html").join("\n")).toContain("ASCII quote");
  });
  it("words a track's and a company's line from their names, with ב־ before a Latin name", () => {
    expect(pagePreview.track("מיטב", "קרן השתלמות")).toMatch(/^מסלול בקרן השתלמות של מיטב: /);
    expect(pagePreview.track("IBI", null)).toMatch(/^מסלול של IBI: /);
    expect(pagePreview.track("מיטב", "IRA")).toMatch(/^מסלול ב־IRA של מיטב: /);
  });
});
