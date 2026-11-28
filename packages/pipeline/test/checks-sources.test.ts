// The checks on rule cards' sources and on glossary terms' other names (src/checks/sources.ts, src/checks/terms.ts): each catches its
// flaw on a planted record and passes one without it. Over the repository's own data/ they run in validate.test.ts, ratchet lists and all.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as sources from "../src/checks/sources.ts";
import * as terms from "../src/checks/terms.ts";
import { testData, type DataCheck } from "../src/checks/lib/kit.ts";

function dataDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), JSON.stringify(content));
  }
  return dir;
}
const run = (check: DataCheck["check"], files: Record<string, unknown>) => check(testData(dataDir(files))).map((p) => p.message);
const src = (extra: Record<string, unknown> = {}) => ({ url: "https://www.gov.il/x.pdf", title: "חוק המס", publisher: "p", strength: "primary", kind: "law", checked: "2026-10-01", ...extra });
const vo = (source: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ value: 25, unit: "pct", source, update_rule: "market", ...extra });

describe("sources: a shown source title names the document", () => {
  it("fails a file name, a web address, and an English title with no kind on a figure whose document the record does not cite", () => {
    expect(sources.name).toBe("sources");
    const messages = run(sources.check, {
      "rules/txs-91.json": { id: "TXS-91", sources: [src({ title: "rates_2026.pdf" })] },
      "rules/txs-92.json": { id: "TXS-92", sources: [src({ title: "www.example.co.il" })] },
      "rules/txs-93.json": { id: "TXS-93", sources: [src()], figures: { rate: vo({ url: "https://other.example/doc", title: "Rates page", publisher: "p", strength: "primary" }) } },
    });
    expect(messages).toEqual([expect.stringMatching(/^TXS-91 \(source-title\): .*file's name/), expect.stringMatching(/^TXS-92 \(source-title\): .*web address/), expect.stringMatching(/^TXS-93#rate \(source-title\): .*host/)]);
  });
  it("passes a Hebrew title, a kind's word, and a figure named from the record's own source of its document", () => {
    expect(run(sources.check, { "rules/txs-94.json": { id: "TXS-94", sources: [src(), src({ title: "s.68", url: "https://www.gov.il/y" })], figures: { rate: vo({ url: "https://www.gov.il/x.pdf#page=3", title: "Tax Ordinance", publisher: "p", strength: "primary" }) } } })).toEqual([]);
  });
});

describe("sources: fixed in law beside a bill", () => {
  it("fails a figure fixed in law on a record that cites a bill or a draft, and passes one fixed by a document", () => {
    const fixed = vo({ url: "https://www.gov.il/x.pdf", title: "חוק", publisher: "p", strength: "primary" }, { update_rule: "fixed in law" });
    expect(run(sources.check, { "rules/reg-91.json": { id: "REG-91", sources: [src({ standing: "bill" })], figures: { cap: fixed } } })).toEqual([expect.stringMatching(/^REG-91 \(fixed-in-law-bill\): /)]);
    expect(run(sources.check, { "rules/reg-92.json": { id: "REG-92", sources: [src({ standing: "draft" })], figures: { cap: { ...fixed, update_rule: "fixed in document" } } } })).toEqual([]);
  });
});

describe("sources: a shared portal named as the publisher", () => {
  const table = { "sources/publishers.json": { "gov.il": { publisher: "gov.il", publisher_he: "אתר הממשלה (gov.il)" } } };
  it("fails a portal source whose publisher is the portal's table name or its host", () => {
    const messages = run(sources.check, {
      ...table,
      "rules/sw-91.json": { id: "SW-91", sources: [src({ publisher: "Capital Market Authority", publisher_he: "אתר הממשלה (gov.il)" })] },
      "rules/sw-92.json": { id: "SW-92", sources: [src({ url: "https://data.gov.il/dataset/x", publisher: "data.gov.il", publisher_he: "משרד האוצר" })] },
    });
    expect(messages).toEqual([expect.stringMatching(/^SW-91 \(portal-publisher\): .*gov\.il/), expect.stringMatching(/^SW-92 \(portal-publisher\): .*data\.gov\.il/)]);
  });
  it("passes an authority on a portal, and a host's name off the portals", () => {
    expect(run(sources.check, { ...table, "rules/sw-93.json": { id: "SW-93", sources: [src({ publisher: "Israel Tax Authority", publisher_he: "רשות המסים" }), src({ url: "https://www.boi.org.il/x", publisher: "boi.org.il" })] } })).toEqual([]);
  });
});

describe("terms: also_called holds only other names", () => {
  const term = (id: string, he: string, also_called: string[]) => ({ id, he, also_called });
  it("fails the head spelled another way, a label with a colon or a number the head lacks, and another card's name", () => {
    expect(terms.name).toBe("terms");
    const messages = run(terms.check, {
      "terms/a.json": term("a", "עמית-שכיר", ["עמית שכיר"]),
      "terms/b.json": term("b", "דוח שנתי", ["טופס 1301"]),
      "terms/c.json": term("c", "מסלול ברירת מחדל", ["דמי ניהול"]),
      "terms/d.json": term("d", "דמי ניהול", ["לידיעתך: דמי ניהול"]),
    });
    expect(messages.map((m) => m.split(":")[0])).toEqual(["a (not-a-name)", "b (not-a-name)", "c (not-a-name)", "d (not-a-name)"]);
  });
  it("passes another name, a number the head has too, and reads no deposit record", () => {
    expect(run(terms.check, { "terms/e.json": term("e", "NASDAQ-100", ['נאסד"ק 100']), "terms/f.json": term("f", "חשבון ניירות ערך", ["תיק ניירות ערך"]), "terms/deposits/x.json": term("x", "y", ["y y"]) })).toEqual([]);
  });
});
