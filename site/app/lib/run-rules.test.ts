// A figure from a run lists the rules that changed its part of the run, with the strength of what those uses read.
import { describe, expect, it } from "vitest";
import type { UsedRule } from "@finance-tool/engine";
import { ACCOUNT_LINES, FUND_LINES, rulesOfRun, rulesOfRuns } from "./run-rules";

const rule = (id: string, uses: UsedRule["uses"], figures: UsedRule["figures"] = [], strength: UsedRule["strength"] = "primary"): UsedRule => ({ id, strength, dimensions: [], figures, uses });

const custody = rule("BRK-17", [{ part: "fees", line: "custody", changed: true, figures: ["custody_pct"] }], [{ name: "custody_pct", strength: "institution" }]);
const drag = rule("TXF-16", [{ part: "fees", line: "fund", changed: true, figures: [] }]);
const exitTax = rule("TXS-02", [{ part: "taxAtExit", changed: true, figures: ["rate"] }], [{ name: "rate", strength: "primary" }]);
const looked = rule("TXI-03", [{ part: "taxDuring", changed: false, figures: ["rate"] }], [{ name: "rate", strength: "primary" }]);
const root = rule("MF-26", [{ part: null, changed: true, figures: [] }]);
const run = [custody, drag, exitTax, looked, root];

describe("rulesOfRun", () => {
  it("keeps a rule only where a changed use is on a selected part and line", () => {
    expect(rulesOfRun(run, [{ part: "fees", lines: ["custody"] }]).map((r) => r.id)).toEqual(["BRK-17"]);
    expect(rulesOfRun(run, [{ part: "fees", lines: ACCOUNT_LINES }]).map((r) => r.id)).toEqual(["BRK-17"]);
    expect(rulesOfRun(run, [{ part: "fees", lines: FUND_LINES }]).map((r) => r.id)).toEqual(["TXF-16"]);
    expect(rulesOfRun(run, ["fees"]).map((r) => r.id)).toEqual(["BRK-17", "TXF-16"]);
    expect(rulesOfRun(run, ["taxDuring", "taxAtExit"]).map((r) => r.id)).toEqual(["TXS-02"]);
    expect(rulesOfRun(run, [])).toEqual([]);
  });
  it("lists no rule only looked at, on any selection", () => {
    expect(rulesOfRun(run, ["taxDuring"])).toEqual([]);
    expect(rulesOfRun(run, "all").map((r) => r.id)).not.toContain("TXI-03");
  });
  it("'all' takes every changed use, the root book's among them", () => {
    expect(rulesOfRun(run, "all").map((r) => r.id)).toEqual(["BRK-17", "TXF-16", "TXS-02", "MF-26"]);
    expect(rulesOfRun(run, ["fees", "taxDuring", "taxAtExit"]).map((r) => r.id)).not.toContain("MF-26");
  });
  it("takes the weakest of the rule and the figures its changed uses read, and no figure of a use that changed nothing", () => {
    expect(rulesOfRun(run, ["fees"]).find((r) => r.id === "BRK-17")?.strength).toBe("institution");
    const mixed = rule(
      "BANK-09",
      [
        { part: "taxDuring", changed: true, figures: ["rate"] },
        { part: "fees", line: "account", changed: false, figures: ["ceiling"] },
      ],
      [
        { name: "rate", strength: "primary" },
        { name: "ceiling", strength: "secondary" },
      ],
    );
    expect(rulesOfRun([mixed], "all")).toEqual([{ id: "BANK-09", strength: "primary" }]);
  });
});

describe("rulesOfRuns", () => {
  it("merges the runs first: a use changed in any run is changed", () => {
    const year1 = [rule("TXH-09", [{ part: "taxAtExit", changed: false, figures: [] }])];
    const year6 = [rule("TXH-09", [{ part: "taxAtExit", changed: true, figures: [] }])];
    expect(rulesOfRuns([{ rules: year1 }], ["taxAtExit"])).toEqual([]);
    expect(rulesOfRuns([{ rules: year1 }, { rules: year6 }], ["taxAtExit"]).map((r) => r.id)).toEqual(["TXH-09"]);
  });
});
