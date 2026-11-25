// F-63, B3: a compared row is ranked, so the workbench never compares a run listed, not ranked, for a reason that is not an open rule (a
// wrapper locked at the horizon). No workbench input reaches such a run today; the ledger is wrapped here to make one.
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { providerWorkbench, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const lock = vi.hoisted(() => ({ on: false }));
vi.mock("../src/ledgers/securities.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/ledgers/securities.ts")>();
  return {
    ...actual,
    runSecurities: (...args: Parameters<typeof actual.runSecurities>) => {
      const r = actual.runSecurities(...args);
      return lock.on ? { ...r, outcome: { code: "listed-not-ranked", reason: "B3", untilMonth: args[0].goal.months + 12 } } : r;
    },
  };
});

const hapoalim = JSON.parse(readFileSync(new URL("../../../data/fees/hapoalim@2026-10-23.json", import.meta.url), "utf8")) as unknown;
const input: WorkbenchInput = {
  goal: { amountNow: 10_000, monthly: 500, months: 36 },
  market: { grossReturn: 0.05, inflation: 0.02 },
  fund: { kind: "israeli-fund" },
  profile: {},
  instrumentClass: "etf_units",
  channel: "branch",
  theta: 0.005,
  providers: [{ snapshot: hapoalim, level: "list" }],
};

describe("F-63 a run locked at the horizon (B3)", () => {
  it("is never compared: the workbench stops on the broken invariant rather than rank it", () => {
    const ctx = context(loadRules());
    lock.on = false;
    expect(providerWorkbench(input, ctx).rows[0]?.kind).toBe("compared");
    lock.on = true;
    expect(() => providerWorkbench(input, ctx)).toThrow(/listed, not ranked, on B3/);
  });
});
