import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import * as dataServer from "./data.server";
import { groupDocuments, loadDocuments, stripUrl } from "./documents.server";

const rule = (id: string, sources: unknown[]): RuleRecord => ({ id, title: id, title_he: `כלל ${id}`, strength: "primary", sources }) as unknown as RuleRecord;
const src = (url: string, title: string, extra: object = {}) => ({ url, title, publisher: "X", kind: "law", strength: "primary", checked: "2026-10-01", ...extra });

describe("groupDocuments", () => {
  const table = [{ id: "income-tax-ordinance", match: ["Income Tax Ordinance", "פקודת מס הכנסה"], title_he: "פקודת מס הכנסה", publisher_he: "רשות המסים", kind: "law", official_url: null }];
  const rules = {
    "A-1": rule("A-1", [src("https://he.wikisource.org/wiki/x#a", "Income Tax Ordinance (Wikisource mirror)", { strength: "primary-mirror", mirror_host: "wikisource" })]),
    "A-2": rule("A-2", [src("https://www.nevo.co.il/law/1", "פקודת מס הכנסה", { strength: "primary-mirror", checked: "2026-10-05" })]),
    "A-3": rule("A-3", [src("https://example.org/doc.pdf?x=1#p", "A guide", { kind: "article", strength: "secondary" })]),
    "A-4": rule("A-4", [src("https://example.org/doc.pdf", "A guide", { kind: "article", strength: "secondary" })]),
  };
  const cards = groupDocuments(rules, table, {});
  it("groups table matches under one key, across hosts", () => {
    const c = cards.find((x) => x.key === "income-tax-ordinance")!;
    expect(c.rules.map((r) => r.id)).toEqual(["A-1", "A-2"]);
    expect(c.title).toBe("פקודת מס הכנסה");
    expect(c.checked).toBe("2026-10-05");
    expect(c.strength).toBe("primary-mirror");
    expect(c.section).toBe("laws");
  });
  it("keys an unknown document by a slug of its url without fragment and query", () => {
    expect(stripUrl("https://example.org/doc.pdf?x=1#p")).toBe("https://example.org/doc.pdf");
    const c = cards.find((x) => x.url.startsWith("https://example.org/doc.pdf"))!;
    expect(c.key).toMatch(/^doc-[0-9a-f]{8}$/);
    expect(c.rules).toHaveLength(2);
    expect(c.section).toBe("secondary");
    expect(/[א-ת]/.test(c.title)).toBe(true); // never an English working title: the kind's word stands in (QA 2026-10-24, F4)
  });
});

describe("loadDocuments on the real data", () => {
  const docs = loadDocuments();
  it("lists a law document with at least five rules, once the rule records carry sources", () => {
    if (docs.length === 0) return; // W1's `sources` has not landed in data/rules yet
    const law = docs.filter((d) => d.section === "laws");
    expect(law.some((d) => d.rules.length >= 5)).toBe(true);
    expect(docs.filter((d) => d.key === "income-tax-ordinance").length).toBeLessThanOrEqual(1);
  });
  it("never lists a rule twice on one card", () => {
    for (const d of docs) expect(new Set(d.rules.map((r) => r.id)).size).toBe(d.rules.length);
  });
});

describe("documents filed for the law and terms browser (issue 123)", () => {
  it("name no card on this page", () => {
    const filed = (JSON.parse(readFileSync(join(dataServer.root, "data/sources/documents.json"), "utf8")) as { id: string; doc_kind?: string }[]).filter((d) => d.doc_kind).map((d) => d.id);
    expect(filed.length).toBeGreaterThan(100);
    const keys = new Set(loadDocuments().map((c) => c.key));
    expect(filed.filter((id) => keys.has(id))).toEqual([]);
  });
});
