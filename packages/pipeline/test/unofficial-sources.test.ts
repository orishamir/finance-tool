import { describe, expect, it } from "vitest";
import { unofficialSources } from "../src/validate";

describe("unofficialSources", () => {
  const articles = new Set(["hasolidit.com"]);
  it("lists secondary, mirror and article-host sources, nested", () => {
    const rec = {
      a: { source: { url: "https://www.calcalist.co.il/x", strength: "secondary" } },
      b: [{ url: "https://he.wikisource.org/wiki/x", strength: "primary-mirror" }],
      c: { url: "https://hasolidit.com/y", strength: "institution" },
    };
    expect(unofficialSources(rec, articles).sort()).toEqual(["https://hasolidit.com/y", "https://he.wikisource.org/wiki/x", "https://www.calcalist.co.il/x"]);
  });
  it("leaves official and company sources", () => {
    const rec = { a: { url: "https://www.gov.il/x.pdf", strength: "primary" }, b: { url: "https://www.fibi.co.il/t.pdf", strength: "institution" } };
    expect(unofficialSources(rec, articles)).toEqual([]);
  });
});
