// The dimension marks of a wrapper or a security (validate.ts checkDimensionMarks, data-schema §3.3 and §4 item 9): a mark comes from
// the rules the record cites, in a value's rule_ids or in the record's context_rule_ids. A rule moved from a figure's rule_ids to the
// record's context keeps every mark it carried, so trimming the figures' rules leaves every covered mark as it was.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { latestRecords, listFiles, OWN_DATA } from "../src/checks/lib/kit.ts";
import { checkDimensionMarks } from "../src/validate.ts";

const noQuestions = { openQuestions: new Set<string>() };
const dims = new Map<string, string[]>([
  ["PF-06", ["fee-management-balance"]],
  ["KH-22", ["fee-management-balance", "fee-deposit"]],
  ["IRA-11", ["custody"]],
]);
const vo = (rule_ids: string[]) => ({ value: 0.5, unit: "pct_per_year", source: { url: "https://example.org/r" }, rule_ids });

describe("checkDimensionMarks", () => {
  it("counts a rule the record cites only in context_rule_ids for a covered mark", () => {
    const marks = { "fee-management-balance": "covered", "fee-deposit": "covered" };
    const record = { fee_caps: { balance: vo(["PF-06"]) }, context_rule_ids: ["KH-22"], dimensions: marks };
    expect(checkDimensionMarks(record, dims, noQuestions)).toEqual([]);
    const { context_rule_ids: _, ...without } = record;
    expect(checkDimensionMarks(without, dims, noQuestions)).toEqual(["dimensions.fee-deposit: marked covered, but no cited rule carries it (§4 item 9)"]);
  });

  it("asks for the mark of a dimension a context rule carries", () => {
    const record = { fee_caps: { balance: vo(["PF-06"]) }, context_rule_ids: ["KH-22"], dimensions: { "fee-management-balance": "covered" } };
    expect(checkDimensionMarks(record, dims, noQuestions)).toEqual(["dimensions.fee-deposit: a cited rule carries it, but it is not marked (§4 item 9)"]);
  });

  it("reports a context rule with no record under data/rules/", () => {
    const record = { fee_caps: { balance: vo(["PF-06"]) }, context_rule_ids: ["NOPE-1"], dimensions: { "fee-management-balance": "covered" } };
    expect(checkDimensionMarks(record, dims, noQuestions)).toEqual(["rule NOPE-1 is cited but has no record under data/rules/"]);
  });

  it("lets a security's held_in rules cover a mark without asking for one", () => {
    const record = { held_in: { wrapper_ids: ["brokerage-account"], rule_ids: ["IRA-11"] }, fee_caps: { balance: vo(["PF-06"]) }, dimensions: { "fee-management-balance": "covered", custody: "covered" } };
    expect(checkDimensionMarks(record, dims, noQuestions)).toEqual([]);
    expect(checkDimensionMarks({ ...record, dimensions: { "fee-management-balance": "covered" } }, dims, noQuestions)).toEqual([]);
  });
});

describe("the wrappers and securities under data/instruments", () => {
  const data = { dataDir: OWN_DATA, files: listFiles(OWN_DATA), whole: true };
  const ruleDimensions = new Map<string, string[]>();
  for (const file of listFiles(join(OWN_DATA, "rules")).filter((f) => f.endsWith(".json"))) {
    const card = JSON.parse(readFileSync(file, "utf8")) as { id?: unknown; dimensions?: unknown };
    if (typeof card.id === "string" && Array.isArray(card.dimensions)) ruleDimensions.set(card.id, card.dimensions.filter((d): d is string => typeof d === "string"));
  }
  const products = latestRecords(data, "instruments").filter((r) => /^instruments\/(wrappers|securities)\//.test(r.key));

  it("finds the records", () => {
    expect(products.length).toBeGreaterThan(10);
  });

  it("keeps every covered mark carried by a rule the record cites, and every cited rule's dimensions marked", () => {
    const problems = products.flatMap((r) =>
      checkDimensionMarks(r.record as Record<string, unknown>, ruleDimensions, noQuestions)
        .filter((m) => !/ is not an open question in il-finance$/.test(m))
        .map((m) => `${r.key}: ${m}`),
    );
    expect(problems).toEqual([]);
  });
});
