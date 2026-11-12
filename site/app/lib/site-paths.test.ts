import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  INDICES_PATH,
  brokeragePagePath,
  companyPath,
  customIndexPath,
  documentsPath,
  exposureIdOfSlug,
  exposurePath,
  feesPath,
  groupPath,
  guidePath,
  housePath,
  indexPath,
  ownAccountPath,
  rulesPath,
  siteAddress,
  trackBrowserPath,
  trackPath,
} from "./site-paths";

describe("guidePath", () => {
  it("writes a guide page, and one at an element", () => {
    expect(guidePath("keren-hishtalmut")).toBe("/guide/keren-hishtalmut");
    expect(guidePath("bank-deposit", { hash: "tax" })).toBe("/guide/bank-deposit#tax");
    expect(guidePath("bank-deposit", { hash: "term=%D7%A8" })).toBe("/guide/bank-deposit#term=%D7%A8");
    expect(guidePath("bank-deposit", { hash: "" })).toBe("/guide/bank-deposit");
  });
});

describe("exposurePath", () => {
  it("writes an exposure's own page", () => {
    expect(exposurePath("gold")).toBe("/exposure/gold");
  });
});

describe("companyPath", () => {
  it("writes a company page, at a product, at an element, and both", () => {
    expect(companyPath("leumi")).toBe("/companies/leumi");
    expect(companyPath("512065202")).toBe("/companies/512065202");
    expect(companyPath("leumi", { hash: "product-leumi-fixed" })).toBe("/companies/leumi#product-leumi-fixed");
    expect(companyPath("leumi", { product: "bank-deposit" })).toBe("/companies/leumi?product=bank-deposit");
    expect(companyPath("meitav", { product: "funds-etf", hash: "company-terms" })).toBe("/companies/meitav?product=funds-etf#company-terms");
  });
  it("writes no query for no product, and encodes a product id", () => {
    expect(companyPath("leumi", { product: "" })).toBe("/companies/leumi");
    expect(companyPath("harel", { product: "מטרה אחרת" })).toBe(`/companies/harel?product=${encodeURIComponent("מטרה אחרת")}`);
  });
});

describe("trackPath", () => {
  it("writes a track's page under its company", () => {
    expect(trackPath("512065202", 13245)).toBe("/companies/512065202/13245");
    expect(trackPath("512065202", "13245")).toBe("/companies/512065202/13245");
  });
});

describe("trackBrowserPath", () => {
  it("writes the track browser on a product, with the query it keeps", () => {
    expect(trackBrowserPath("keren-hishtalmut")).toBe("/tracks/keren-hishtalmut");
    expect(trackBrowserPath("keren-hishtalmut", { search: "?kind=stock" })).toBe("/tracks/keren-hishtalmut?kind=stock");
    expect(trackBrowserPath("keren-hishtalmut", { search: "" })).toBe("/tracks/keren-hishtalmut");
  });
});

describe("rulesPath", () => {
  it("writes the rules page, at a record, filtered to a product, and with its own query", () => {
    expect(rulesPath()).toBe("/rules");
    expect(rulesPath({ hash: "tax-interest" })).toBe("/rules#tax-interest");
    expect(rulesPath({ product: "keren-hishtalmut" })).toBe("/rules?product=keren-hishtalmut");
    expect(rulesPath({ search: "?q=%D7%9E%D7%A1" })).toBe("/rules?q=%D7%9E%D7%A1");
    expect(rulesPath({ search: "" })).toBe("/rules");
    expect(rulesPath({ search: "?shelf=costs&product=a,b", hash: "x" })).toBe("/rules?shelf=costs&product=a,b#x");
  });
});

describe("documentsPath", () => {
  it("writes the documents page, and at a card", () => {
    expect(documentsPath()).toBe("/documents");
    expect(documentsPath({ hash: "no-company" })).toBe("/documents#no-company");
  });
});

describe("feesPath", () => {
  it("writes a product's and a track's fee page", () => {
    expect(feesPath({ wrapper: "keren-hishtalmut" })).toBe("/fees?wrapper=keren-hishtalmut");
    expect(feesPath({ track: 13245 })).toBe("/fees?track=13245");
    expect(feesPath({ track: "13245" })).toBe("/fees?track=13245");
  });
  it("writes a whole deal's fee page", () => {
    expect(feesPath({ deal: "WzEseyJu_-" })).toBe("/fees?d=WzEseyJu_-");
  });
});

describe("siteAddress", () => {
  it("writes a path whole under the site's origin and basename, with or without the basename's last slash", () => {
    expect(siteAddress("https://example.org", "/finance-tool/", "/fees?d=x")).toBe("https://example.org/finance-tool/fees?d=x");
    expect(siteAddress("https://example.org", "/finance-tool", "/fees?d=x")).toBe("https://example.org/finance-tool/fees?d=x");
    expect(siteAddress("http://localhost:5173", "/", "/fees?d=x")).toBe("http://localhost:5173/fees?d=x");
  });
});

describe("the index page's addresses", () => {
  it("writes an index, a custom index and the slug's exposure", () => {
    expect(INDICES_PATH).toBe("/indices");
    expect(indexPath("index-sp500")).toBe("/indices/sp500");
    expect(customIndexPath("custom-1 a")).toBe("/indices?custom=custom-1%20a");
    expect(exposureIdOfSlug("sp500")).toBe("index-sp500");
  });
  it("writes a house, its group and its own account on the index page", () => {
    expect(housePath("psagot")).toBe("/indices/sp500?house=psagot");
    expect(housePath("psagot", "index-nasdaq-100")).toBe("/indices/nasdaq-100?house=psagot");
    expect(groupPath("psagot", "group:2")).toBe("/indices/sp500?house=psagot&group=2");
    expect(ownAccountPath("psagot")).toBe("/indices/sp500?house=psagot&own=psagot&from=list");
    expect(ownAccountPath("psagot", "group:2")).toBe("/indices/sp500?house=psagot&own=psagot&from=group%3A2");
  });
  it("writes a house's page at its securities account", () => {
    expect(brokeragePagePath("psagot")).toBe("/companies/psagot?product=brokerage");
  });
});

// Every address of these kinds is built by the functions above. A line that writes one from a template string that starts with the
// page's path, or joins a string onto it, or adds a `?product=` to a path held in a variable, builds it by hand. A fixed address
// written whole ("/guide", "/indices/sp500") is not built.
const app = fileURLToPath(new URL("../", import.meta.url));
// files another piece of work owns; their hand-built addresses are listed where that work is handed over
const notHere = ["components/kit/", "components/transfer/", "components/fees/", "routes/fees.tsx", "lib/fees.ts", "lib/fees.server.ts", "copy.ts", "lib/site-paths.ts"];
const kinds = "guide|companies|tracks|rules|exposure|documents|fees|indices";
const handBuilt = [
  new RegExp(`\`/(?:${kinds})(?:[/?#][^\`]*)?\\$\\{`),
  new RegExp(`["']/(?:${kinds})(?:[/?#][^"']*)?["']\\s*\\+`),
  /\$\{[^}]*\}\?product=|\?product=\$\{/,
];
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

describe("the site's addresses are built in one place", () => {
  it("no file outside lib/site-paths.ts builds one by hand", () => {
    const hits: string[] = [];
    for (const file of walk(app)) {
      const rel = relative(app, file).split(sep).join("/");
      if (!/\.tsx?$/.test(rel) || /\.test\.tsx?$/.test(rel) || notHere.some((n) => rel === n || (n.endsWith("/") && rel.startsWith(n)))) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (handBuilt.some((r) => r.test(line))) hits.push(`site/app/${rel}:${i + 1}: ${line.trim().slice(0, 160)}`);
        });
    }
    expect(hits, "build these with lib/site-paths.ts").toEqual([]);
  });
});
