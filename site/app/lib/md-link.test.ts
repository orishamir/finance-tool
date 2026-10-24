import { describe, expect, it } from "vitest";
import { parseMdLink } from "./md-link";
import { notCoveredSources } from "./graduation.server";

describe("parseMdLink", () => {
  it("reads a plain link", () => {
    expect(parseMdLink("x [a b](https://e.com/p) · 2026-10-22")).toMatchObject({ text: "a b", url: "https://e.com/p" });
  });
  it("keeps balanced parentheses in the url (a Wikisource title)", () => {
    const url = "https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)";
    expect(parseMdLink(`[תקנות (Wikisource)](${url}) · 2026-10-22 · מקור ראשי (עותק)`)?.url).toBe(url);
  });
  it("returns null when the parentheses never close", () => {
    expect(parseMdLink("[a](https://e.com/p_(x")).toBeNull();
  });
});

describe("the not-covered sources", () => {
  it("every url is whole: no unbalanced parenthesis", () => {
    const all = notCoveredSources();
    expect(all.size).toBeGreaterThan(5);
    for (const { url } of all.values()) expect((url.match(/\(/g) ?? []).length).toBe((url.match(/\)/g) ?? []).length);
  });
});
