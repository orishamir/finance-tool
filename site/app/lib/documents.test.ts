import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import * as dataServer from "./data.server";
import { groupDocuments, loadDocuments, stripUrl, valueEntriesOf } from "./documents.server";

const rule = (id: string, sources: unknown[]): RuleRecord => ({ id, title: id, title_he: `כלל ${id}`, strength: "primary", sources }) as unknown as RuleRecord;
const src = (url: string, title: string, extra: object = {}) => ({ url, title, publisher: "X", kind: "law", strength: "primary", checked: "2026-10-01", ...extra });

describe("groupDocuments", () => {
  const table = [{ id: "income-tax-ordinance", match: ["Income Tax Ordinance", "פקודת מס הכנסה"], title_he: "פקודת מס הכנסה", publisher_he: "רשות המסים", kind: "law", official_url: null }];
  const rules = {
    "A-1": rule("A-1", [src("https://www.gov.il/BlobFolder/x/ordinance.pdf#page=3", "Income Tax Ordinance (Tax Authority text)")]),
    "A-2": rule("A-2", [src("https://fs.knesset.gov.il/a.pdf", "פקודת מס הכנסה", { checked: "2026-10-05" })]),
    "A-3": rule("A-3", [src("https://example.org/doc.pdf?x=1#p", "A guide", { kind: "other" })]),
    "A-4": rule("A-4", [src("https://example.org/doc.pdf", "A guide", { kind: "other" })]),
  };
  const cards = groupDocuments(rules, table, {});
  it("keeps a Hebrew title that opens with a host or a Latin name", () => {
    const own = groupDocuments({ "B-1": rule("B-1", [src("https://data.gov.il/dataset/banks", "data.gov.il, בנק ישראל: רשימת תאגידים בנקאיים בישראל - כתובות וקישורים", { kind: "dataset" })]), "B-2": rule("B-2", [src("https://example.org/fee", "Trustee fee (שכר נאמן): p. 1 '0.02% מהשווי הנקי השנתי הממוצע של נכסי הקרן'", { kind: "article" })]) }, [], {});
    expect(own.find((x) => x.url.includes("data.gov.il"))!.title).toBe("data.gov.il, בנק ישראל: רשימת תאגידים בנקאיים בישראל - כתובות וקישורים");
  });
  it("groups table matches under one key, across hosts", () => {
    const c = cards.find((x) => x.key === "income-tax-ordinance")!;
    expect(c.rules.map((r) => r.id)).toEqual(["A-1", "A-2"]);
    expect(c.title).toBe("פקודת מס הכנסה");
    expect(c.checked).toBe("2026-10-05");
    expect(c.strength).toBe("primary");
    expect(c.section).toBe("laws");
  });
  it("keys an unknown document by a slug of its url without fragment and query", () => {
    expect(stripUrl("https://example.org/doc.pdf?x=1#p")).toBe("https://example.org/doc.pdf");
    // a script's query names the document: two Reshumot booklets stay two documents
    expect(stripUrl("https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F7646%2Fheb#p")).toBe("https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F7646%2Fheb");
    expect(stripUrl("https://api.justice.gov.il/reshumot/resolver?path=a")).not.toBe(stripUrl("https://api.justice.gov.il/reshumot/resolver?path=b"));
    const c = cards.find((x) => x.url.startsWith("https://example.org/doc.pdf"))!;
    expect(c.key).toMatch(/^doc-[0-9a-f]{8}$/);
    expect(c.rules).toHaveLength(2);
    expect(c.section).toBe("regulators");
    expect(/[א-ת]/.test(c.title)).toBe(true); // never an English working title: the kind's word stands in
  });
});

describe("the figures of the data records rest on documents too (Q21)", () => {
  const fig = (url: string, extra: object = {}) => ({ value: 1, unit: "pct", source: { url, title: "Tariff", publisher: "Bank X", strength: "institution", ...extra }, checked: "2026-11-01" });
  const values = valueEntriesOf([{ fees: { a: fig("https://bank.example/tariff.pdf"), b: fig("https://bank.example/tariff.pdf#page=2") } }, { rows: [fig("https://example.org/doc.pdf"), fig("docs/company-answers.md#x")] }]);
  const cards = groupDocuments({ "A-4": rule("A-4", [src("https://example.org/doc.pdf", "A guide", { kind: "other" })]) }, [], {}, undefined, values);
  it("counts every figure that cites a document, beside the rules", () => {
    expect(values).toHaveLength(3);
    const shared = cards.find((c) => c.url === "https://example.org/doc.pdf")!;
    expect(shared.rules.map((r) => r.id)).toEqual(["A-4"]);
    expect(shared.values).toBe(1);
  });
  it("gives a document only figures cite no card: the page's data part shows the records it holds", () => {
    expect(cards.map((c) => c.url)).toEqual(["https://example.org/doc.pdf"]);
  });
  it("names the publisher as a source line does: the record's Hebrew name first, never a shared portal's", () => {
    const named = groupDocuments({ "B-1": rule("B-1", [src("https://data.gov.il/dataset/x", "A dataset", { publisher: "Capital Market Authority", kind: "dataset" })]), "B-2": rule("B-2", [src("https://www.boi.org.il/y", "Page", { publisher_he: "המפקח על הבנקים", kind: "regulator_page" })]) }, [], { "data.gov.il": { publisher_he: "מאגר המידע הממשלתי (data.gov.il)" }, "boi.org.il": { publisher_he: "בנק ישראל" } });
    expect(named.map((c) => c.publisher).sort()).toEqual(["Capital Market Authority", "המפקח על הבנקים"]);
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

describe("documents filed for the law and terms browser", () => {
  it("name no card on this page", () => {
    const filed = (JSON.parse(readFileSync(join(dataServer.root, "data/sources/documents.json"), "utf8")) as { id: string; doc_kind?: string }[]).filter((d) => d.doc_kind).map((d) => d.id);
    expect(filed.length).toBeGreaterThan(100);
    const keys = new Set(loadDocuments().map((c) => c.key));
    expect(filed.filter((id) => keys.has(id))).toEqual([]);
  });
});
