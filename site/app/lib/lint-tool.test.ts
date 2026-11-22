// tools/lint.mjs holds every Oxlint rule and every kind of knip finding to its recorded count (guidelines/code.md, "The checks decide").
// These tests hold its reading of the two tools' reports, the ratchet's verdicts, and its reading of the comments that silence a rule.
import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain node script without types
import { accept, compare, directiveProblems, fails, knipCounts, oxlintCounts, sorted } from "../../../tools/lint.mjs";

// a silencing comment is spelled in pieces here, so the scan of this file does not read the examples as this file's own
const c = (words: string) => `${"/"}/ ${words}`;
const oxDiag = (code: string | undefined, filename: string, message = "m", labels: unknown[] = [{ span: { line: 1 } }]) => ({ ...(code ? { code } : {}), filename, message, labels });

describe("tools/lint.mjs", () => {
  it("counts Oxlint's findings by rule and file", () => {
    const counts = oxlintCounts([oxDiag("typescript(no-non-null-assertion)", "a.ts"), oxDiag("typescript(no-non-null-assertion)", "a.ts"), oxDiag("typescript(no-non-null-assertion)", "b.ts")]);
    expect(counts).toEqual({ "typescript(no-non-null-assertion)": { "a.ts": 2, "b.ts": 1 } });
  });

  it("labels a finding with no rule by what it is: a comment that silences nothing, a file that does not parse, a failure of the tool", () => {
    const counts = oxlintCounts([
      oxDiag(undefined, "a.ts", "Unused oxlint-disable directive (no problems were reported)."),
      oxDiag(undefined, "b.ts", "Unexpected token"),
      oxDiag(undefined, "c.ts", "tsgolint exited", []),
    ]);
    expect(counts).toEqual({ "unused-disable-directive": { "a.ts": 1 }, "parse-error": { "b.ts": 1 }, "tool-failure": { "c.ts": 1 } });
  });

  it("counts knip's findings by kind and file, and only its kinds", () => {
    const issues = [
      { file: "a.ts", owners: [{ name: "someone" }], exports: [{ name: "x" }, { name: "y" }], types: [], duplicates: [] },
      { file: "package.json", dependencies: [{ name: "d3-array" }], exports: [] },
    ];
    expect(knipCounts(issues)).toEqual({ exports: { "a.ts": 2 }, dependencies: { "package.json": 1 } });
  });

  it("fails a rule whose total goes up, naming the files where it grew, and does not lower the record over it", () => {
    const baseline = { oxlint: { r: { "a.ts": 2, "b.ts": 1 } } };
    const result = compare(baseline, { oxlint: { r: { "a.ts": 2, "b.ts": 2 } } });
    expect(result.up).toEqual([{ tool: "oxlint", rule: "r", was: 3, now: 4, files: [{ file: "b.ts", was: 1, now: 2 }] }]);
    expect(result.down).toEqual([]);
    expect(fails(result, "check")).toBe(true);
    expect(fails(result, "lower")).toBe(true);
  });

  it("allows no finding of a rule with no record", () => {
    const { up } = compare({ oxlint: {} }, { oxlint: { "typescript(no-floating-promises)": { "c.ts": 1 } }, knip: { files: { "d.ts": 1 } } });
    expect(up.map((u: { rule: string }) => u.rule)).toEqual(["typescript(no-floating-promises)", "files"]);
  });

  it("fails a file whose count grows though its rule's total did not, and lowers the record over the move", () => {
    const baseline = { oxlint: { r: { "a.ts": 2, "b.ts": 1 } } };
    const result = compare(baseline, { oxlint: { r: { "a.ts": 1, "b.ts": 2 } } });
    expect(result.up).toEqual([]);
    expect(result.grew).toEqual([{ tool: "oxlint", rule: "r", files: [{ file: "b.ts", was: 1, now: 2 }] }]);
    expect(fails(result, "check")).toBe(true);
    expect(fails(result, "lower")).toBe(false);
  });

  it("fails a total below its record until the record is lowered", () => {
    const baseline = { oxlint: { r: { "a.ts": 2 }, s: { "a.ts": 3 } } };
    const result = compare(baseline, { oxlint: { r: { "a.ts": 2 }, s: { "a.ts": 1 } } });
    expect(result.down).toEqual([{ tool: "oxlint", rule: "s", was: 3, now: 1 }]);
    expect(fails(result, "check")).toBe(true);
    expect(fails(result, "lower")).toBe(false);
  });

  it("passes counts equal to the record", () => {
    const counts = { oxlint: { r: { "a.ts": 2 } }, knip: { exports: { "b.ts": 1 } } };
    expect(fails(compare(counts, counts), "check")).toBe(false);
  });

  it("accepts one named rule's counts as they are and changes nothing else", () => {
    const baseline = { oxlint: { r: { "a.ts": 1 }, s: { "a.ts": 5 }, t: { "a.ts": 1 } } };
    const current = { oxlint: { r: { "a.ts": 2, "b.ts": 1 }, s: { "a.ts": 7 } }, knip: { files: { "x.ts": 1 } } };
    expect(accept(baseline, current, "r")).toEqual({ oxlint: { r: { "a.ts": 2, "b.ts": 1 }, s: { "a.ts": 5 }, t: { "a.ts": 1 } } });
    expect(accept(baseline, current, "t")).toEqual({ oxlint: { r: { "a.ts": 1 }, s: { "a.ts": 5 } } });
    expect(accept(baseline, current, "files")).toEqual({ ...baseline, knip: { files: { "x.ts": 1 } } });
    expect(() => accept(baseline, current, "no-such-rule")).toThrow(/no-such-rule/);
  });

  it("writes the record with its keys in order", () => {
    expect(JSON.stringify(sorted({ oxlint: { b: { "z.ts": 1, "a.ts": 2 }, a: {} } }))).toBe('{"oxlint":{"a":{},"b":{"a.ts":2,"z.ts":1}}}');
  });

  it("allows a rule silenced on its own line, the line before, with its reason, and nothing else", () => {
    expect(directiveProblems(`${c("oxlint-disable-next-line typescript/no-non-null-assertion -- the line above checks the index")}\nconst a = b[0]!;`)).toEqual([]);
    expect(directiveProblems(`  ${c("oxlint-disable-next-line typescript/no-non-null-assertion, react/refs -- checked above")}`)).toEqual([]);
    expect(directiveProblems(`{/${"*"} oxlint-disable-next-line react/no-danger -- the markup is ours */}`)).toEqual([]);
    expect(directiveProblems(`const a = b[0]!; ${c("oxlint-disable-line typescript/no-non-null-assertion -- checked above")}`)).toHaveLength(1);
    expect(directiveProblems(`const a = 1; ${c("oxlint-disable-next-line typescript/no-non-null-assertion -- after code")}`)).toHaveLength(1);
    expect(directiveProblems(c("oxlint-disable-next-line typescript/no-non-null-assertion"))).toHaveLength(1);
    expect(directiveProblems(c("oxlint-disable-next-line -- no rule named"))).toHaveLength(1);
    expect(directiveProblems(c("oxlint-disable typescript/no-explicit-any -- a whole file"))).toHaveLength(1);
    expect(directiveProblems(`/${"*"} oxlint-enable */`)).toHaveLength(1);
    expect(directiveProblems(c("eslint-disable-next-line react-hooks/exhaustive-deps -- a reason"))).toHaveLength(1);
    expect(directiveProblems('const s = "oxlint-disable is a word in a sentence";')).toEqual([]);
  });

  it("allows no comment that silences the rules of hooks or a dependency list", () => {
    expect(directiveProblems(c("oxlint-disable-next-line react/exhaustive-deps -- runs once on purpose"))).toHaveLength(1);
    expect(directiveProblems(c("oxlint-disable-next-line react-hooks/exhaustive-deps -- runs once on purpose"))).toHaveLength(1);
    expect(directiveProblems(c("oxlint-disable-next-line typescript/no-non-null-assertion, react/rules-of-hooks -- a hook in a branch"))).toHaveLength(1);
  });
});
