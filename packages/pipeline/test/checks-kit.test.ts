// What the check modules share (src/checks/lib/kit.ts) and how the data check runs them: every module of src/checks/, each problem
// named by its check, and the ratchet lists judged against the repository's own data/ only.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readFormulaIds, readRuleBaseIds, validateData } from "../src/index.ts";
import { latestRecords, objectsIn, ruleGroup, staleEntries, testData } from "../src/checks/lib/kit.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

function dataDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), JSON.stringify(content));
  }
  return dir;
}

describe("rule groups", () => {
  it("puts each id in the group of its prefix, every TX prefix in tax", () => {
    expect(ruleGroup("BANK-28")).toBe("bank");
    expect(ruleGroup("SHR-01")).toBe("brokerage");
    expect(ruleGroup("BND-10")).toBe("funds");
    expect(ruleGroup("CAT-44")).toBe("state");
    expect(ruleGroup("SW-43")).toBe("pension");
    expect(ruleGroup("MGD-02")).toBe("savings");
    expect(ruleGroup("TX2-18")).toBe("tax");
    expect(ruleGroup("TXK-10#rate")).toBe("tax");
    expect(ruleGroup("ZZ-01")).toBeNull();
  });
});

describe("the latest record", () => {
  it("reads the latest snapshot of a dated record, every other file as it is, and each track of a data/cma period as a record", () => {
    const dir = dataDir({
      "fees/house@2026-01-01.json": { n: 1 },
      "fees/house@2026-02-01.json": { n: 2 },
      "fees/other.json": { n: 3 },
      "instruments/wrappers/w.json": { n: 4 },
      "cma/gemelnet@2026-09.json": { funds: [{ fund_id: 7, n: 5 }] },
      "cma/gemelnet@2026-10.json": { funds: [{ fund_id: 7, n: 6 }, { fund_id: 8, n: 7 }] },
    });
    const data = testData(dir);
    expect(latestRecords(data, "fees").map((r) => [r.key, r.record])).toEqual([["fees/house", { n: 2 }], ["fees/other", { n: 3 }]]);
    expect(latestRecords(data, "instruments").map((r) => r.key)).toEqual(["instruments/wrappers/w"]);
    expect(latestRecords(data, "cma").map((r) => [r.key, r.record])).toEqual([["cma/gemelnet/7", { fund_id: 7, n: 6 }], ["cma/gemelnet/8", { fund_id: 8, n: 7 }]]);
  });
  it("gives each object inside a record with its pointer", () => {
    expect(objectsIn({ a: { b: [{ c: 1 }] } }).map((o) => o.pointer)).toEqual(["", "/a", "/a/b/0"]);
  });
});

describe("a ratchet list", () => {
  const listed = ["A-01", "A-02", "A-03"];
  const record = (e: string) => e !== "A-03";
  const offends = (e: string) => e === "A-01";
  it("over the whole of data/, says strike it for an entry that no longer offends or whose record is gone", () => {
    expect(staleEntries(listed, { whole: true }, record, offends, () => "x.json")).toEqual([
      "x.json lists A-02, which no longer offends: strike it (the list only shrinks)",
      "x.json lists A-03, and its record is gone: strike it (the list only shrinks)",
    ]);
  });
  it("judges nothing over a test's folder, whose records stand in for the real ones", () => {
    expect(staleEntries(listed, { whole: false }, record, offends, () => "x.json")).toEqual([]);
  });
});

describe("the data check", () => {
  it("runs the modules of src/checks/, each problem named by its check", () => {
    const rule = { id: "TXS-98", title: "t", strength: "primary", dimensions: [], likely_to_change: "no", il_finance_file: "tax-securities-israeli.md", checked: "2026-10-22", scope: "general", text_he: "משפט ראשון. משפט שני. משפט שלישי. משפט רביעי. משפט חמישי." };
    const problems = validateData({ dataDir: dataDir({ "rules/txs-98.json": rule }), ruleBase: readRuleBaseIds(`${root}.claude/skills/il-finance/references`), formulas: readFormulaIds(`${root}docs/method.md`) });
    expect(problems).toContainEqual({ file: "rules/txs-98.json", message: expect.stringMatching(/^rule-text: text_he \(long\): 5 sentences/) });
  });
});
