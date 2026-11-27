// The checks on rule cards and on what opens them (src/checks/): each catches its flaw on a planted record and passes one without it.
// Over the repository's own data/ they run in validate.test.ts, ratchet lists and all.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as figureNames from "../src/checks/figure-names.ts";
import * as figureTitles from "../src/checks/figure-titles.ts";
import * as ruleRecords from "../src/checks/rule-records.ts";
import * as silences from "../src/checks/silences.ts";
import * as working from "../src/checks/working.ts";
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
const vo = (extra: Record<string, unknown> = {}) => ({ value: 25, unit: "pct", source: { url: "https://x.il", title: "חוק המס", publisher: "p", strength: "primary" }, ...extra });

describe("rule-records", () => {
  it("fails an id a value, a closed track or a record's context names with no card, on the latest snapshot only; a card of the real data/ counts in a test's folder", () => {
    expect(ruleRecords.name).toBe("rule-records");
    const messages = run(ruleRecords.check, {
      "rules/txs-98.json": { id: "TXS-98" },
      "fees/zz@2026-01-01.json": { a: vo({ rule_ids: ["TXS-97"] }) },
      "fees/zz@2026-02-01.json": { a: vo({ rule_ids: ["TXS-98", "TXS-96", "TXS-09"] }) },
      "cma/gemelnet@2026-10.json": { funds: [{ fund_id: 1, closed_to_joiners: { by: "company-terms", rule_ids: ["CAT-98"] } }] },
      "instruments/wrappers/zz.json": { context_rule_ids: ["KH-98"] },
    });
    expect(messages).toEqual([
      expect.stringMatching(/^CAT-98 \(missing-record\): named at cma\/gemelnet\/1# /),
      expect.stringMatching(/^TXS-96 \(missing-record\): named at fees\/zz#\/a /),
      expect.stringMatching(/^KH-98 \(missing-record\): named at instruments\/wrappers\/zz# /),
    ]);
  });
});

describe("figure-names", () => {
  it("fails a figure with no Hebrew name", () => {
    expect(figureNames.name).toBe("figure-names");
    expect(run(figureNames.check, { "rules/txs-98.json": { id: "TXS-98", figures: { rate: vo(), cap: vo() }, figure_names_he: { rate: "שיעור" } } })).toEqual([expect.stringMatching(/^TXS-98#cap \(figure-names\): /)]);
  });
});

describe("silences", () => {
  it("fails a card whose text leaves out the silence its rule records, and passes one that says it", () => {
    expect(silences.name).toBe("silences");
    expect(run(silences.check, { "rules/cat-37.json": { id: "CAT-37", text_he: "הממוצע הוא אחרי הנחות." } })).toEqual([expect.stringMatching(/^CAT-37 \(silence\): /)]);
    expect(run(silences.check, { "rules/cat-37.json": { id: "CAT-37", text_he: "שיטת השקלול לא פורסמה." } })).toEqual([]);
  });
});

describe("working", () => {
  it("fails a working written in a data file", () => {
    expect(working.name).toBe("working");
    const computed = { ...vo(), state: "computed", computed_from: { formula: "F-21", inputs: {}, working: { kind: "sum", parts: ["a"] } } };
    expect(run(working.check, { "fees/zz.json": { a: computed } })).toEqual(["fees/zz.json#/a/computed_from/working: a working is never written in data/; the site builds it from the formula it draws"]);
    expect(run(working.check, { "fees/zz.json": { a: { ...computed, computed_from: { formula: "F-21", inputs: {} } } } })).toEqual([]);
  });
});

describe("figure-titles", () => {
  it("fails a figure whose source title carries a page, a section or a table", () => {
    expect(figureTitles.name).toBe("figure-titles");
    const titled = (title: string) => ({ "rules/txs-98.json": { id: "TXS-98", figures: { rate: vo({ source: { url: "https://x.il", title, publisher: "p", strength: "primary" } }) } } });
    expect(run(figureTitles.check, titled("פקודת מס הכנסה, p.3, s.125ג"))).toEqual([expect.stringMatching(/^TXS-98#rate \(figure-title\): /)]);
    expect(run(figureTitles.check, titled("Fee table of the bank"))).toEqual([expect.stringMatching(/^TXS-98#rate \(figure-title\): /)]);
    expect(run(figureTitles.check, titled("פקודת מס הכנסה"))).toEqual([]);
  });
});
