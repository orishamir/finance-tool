import { describe, expect, it } from "vitest";
import { isCopySource, isIssuerFiling, isUnlistedPrimary, unofficialSources } from "../src/validate";

describe("unofficialSources", () => {
  const articles = new Set(["hasolidit.com"]);
  it("lists secondary, copy and article-host sources, nested", () => {
    const rec = {
      a: { source: { url: "https://www.calcalist.co.il/x", strength: "secondary" } },
      b: [{ url: "https://he.wikisource.org/wiki/x", strength: "primary" }],
      c: { url: "https://hasolidit.com/y", strength: "institution" },
    };
    expect(unofficialSources(rec, articles).sort()).toEqual(["https://hasolidit.com/y", "https://he.wikisource.org/wiki/x", "https://www.calcalist.co.il/x"]);
  });
  it("lists National Insurance's consolidated copies (btl.gov.il/Laws1) whatever their strength, and leaves its own pages", () => {
    const rec = {
      a: { url: "https://www.btl.gov.il/Laws1/00_0103_000000.pdf#page=120", strength: "primary" },
      b: { url: "https://btl.gov.il/laws1/02_0103_100269.pdf", strength: "institution" },
      c: { url: "https://www.btl.gov.il/Mediniyut/Situation/statistics/Pages/default.aspx", strength: "primary" },
    };
    expect(unofficialSources(rec, articles).sort()).toEqual(["https://btl.gov.il/laws1/02_0103_100269.pdf", "https://www.btl.gov.il/Laws1/00_0103_000000.pdf#page=120"]);
  });
  it("lists a copy host's source even when it was marked primary (Wikisource, Nevo, Olaw, Capitax, Funder)", () => {
    const rec = {
      a: { url: "https://he.wikisource.org/wiki/x", strength: "primary" },
      b: { url: "https://www.nevo.co.il/law_html/law01/999_564.htm", strength: "institution" },
      c: { url: "https://www.olaw.org.il/x.pdf", strength: "primary" },
      d: { url: "https://cdn.funder.co.il/y.pdf", strength: "primary" },
      e: { url: "https://www.capitax.co.il/z", strength: "primary" },
    };
    expect(unofficialSources(rec, articles)).toHaveLength(5);
    expect(isCopySource("https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf")).toBe(false);
  });
  // independent check of the glossary sweep, 2026-11-07: a source marked primary must sit on an official publisher's host
  it("lists a primary source on a host no official publisher uses, and leaves official hosts, own standards and company papers", () => {
    expect(unofficialSources({ a: { url: "https://www.takdin.co.il/law/x", strength: "primary" } }, articles)).toEqual(["https://www.takdin.co.il/law/x"]);
    expect(unofficialSources({ a: { url: "https://www.chamber.org.il/media/159262/fees.pdf#page=5", strength: "primary" } }, articles)).toHaveLength(1);
    for (const url of [
      "https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf#page=8",
      "https://api.justice.gov.il/x",
      "https://www.new.isa.gov.il/images/x.pdf",
      "https://boi.org.il/media/1l3izmkj/124.pdf#page=4",
      "https://content.tase.co.il/media/q2mhob4u/274690.pdf#page=4",
      "https://maya.tase.co.il/he/funds/mutual-funds",
      "https://www.btl.gov.il/Mediniyut/x",
      "https://www.sec.gov/Archives/edgar/data/52749/x.htm",
      "https://www.esma.europa.eu/x",
      "https://www.spglobal.com/spdji/en/documents/methodologies/x.pdf",
    ])
      expect(isUnlistedPrimary(url, "primary"), url).toBe(false);
    expect(isUnlistedPrimary("https://www.takdin.co.il/law/x", "institution")).toBe(false);
    expect(isUnlistedPrimary("docs/product.md#33", "primary")).toBe(false);
    // a copy is reported by the copy rule, once
    expect(isUnlistedPrimary("https://he.wikisource.org/wiki/x", "primary")).toBe(false);
  });
  // glossary round 2, 2026-11-07: TASE's host was accepted whole, so an issuer's filing on Maya passed as primary
  it("lists an issuer's filing on Maya marked primary, and leaves it marked institution", () => {
    for (const url of [
      "https://mayafiles.tase.co.il/reports/1149001-1150000/E1149190.pdf",
      "https://mayafiles.tase.co.il/rpdf/1723001-1724000/P1723793-00.pdf",
      "https://maya.tase.co.il/reports/details/1723793",
      "https://maya.tase.co.il/he/reports/1723793",
    ]) {
      expect(isIssuerFiling(url), url).toBe(true);
      expect(isUnlistedPrimary(url, "primary"), url).toBe(true);
      expect(isUnlistedPrimary(url, "institution"), url).toBe(false);
    }
    for (const url of ["https://maya.tase.co.il/he/funds/mutual-funds", "https://content.tase.co.il/media/g2ekpw4d/274691.pdf", "https://market.tase.co.il/he/market_data/etfs"])
      expect(isIssuerFiling(url), url).toBe(false);
    expect(unofficialSources({ a: { url: "https://mayafiles.tase.co.il/reports/1/E1.pdf", strength: "primary" }, b: { url: "https://mayafiles.tase.co.il/reports/1/E2.pdf", strength: "institution" } }, articles)).toEqual([
      "https://mayafiles.tase.co.il/reports/1/E1.pdf",
    ]);
  });
  it("leaves official and company sources", () => {
    const rec = { a: { url: "https://www.gov.il/x.pdf", strength: "primary" }, b: { url: "https://www.fibi.co.il/t.pdf", strength: "institution" } };
    expect(unofficialSources(rec, articles)).toEqual([]);
  });
});

describe("unofficial-leftovers.json", () => {
  it("names only files that still exist, so a deleted record's lines are struck too", async () => {
    const { existsSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const list = JSON.parse(readFileSync(join(__dirname, "../src/unofficial-leftovers.json"), "utf8")) as string[];
    const missing = list.filter((k) => !existsSync(join(__dirname, "../../../data", k.slice(0, k.indexOf(" ")))));
    expect(missing).toEqual([]);
  });
});

// docs/glossary.md and data/terms are generated from research/glossary/terms/*.json; a copy there (a row's source or the
// source of its name, term_source) would come back on the next run, so the research rows are held to the same rule. A
// row still on a copy is allowed only while its data/terms record is a leftover above (glossary sweep, 2026-11-07).
describe("research/glossary/terms", () => {
  it("cites no copy (Wikisource, Nevo, Olaw, Capitax, Funder, National Insurance's Laws1) unless the record is a leftover", async () => {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const dir = join(__dirname, "../../../research/glossary/terms");
    const list = new Set(JSON.parse(readFileSync(join(__dirname, "../src/unofficial-leftovers.json"), "utf8")) as string[]);
    const bad: string[] = [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const rows = JSON.parse(readFileSync(join(dir, f), "utf8")) as { id?: string; source?: { url?: string } | null; term_source?: { url?: string } | string | null }[];
      for (const r of rows) {
        for (const [field, v] of [["source", r.source], ["term_source", r.term_source]] as const) {
          const url = typeof v === "string" ? v : v?.url;
          if (typeof url === "string" && isCopySource(url) && !list.has(`terms/${r.id}.json ${url}`) && !(field === "term_source" && list.has(`terms/${r.id}.json ${typeof r.source === "object" ? r.source?.url : ""}`)))
            bad.push(`${f} ${r.id} ${field} ${url}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
