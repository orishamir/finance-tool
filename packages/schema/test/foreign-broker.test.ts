// S1 to S5 (2026-10-25, invest page): the foreign-broker fields and the fund and exposure additions.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { exposureRecord, feesSnapshot, fundRecord } from "../src/index.ts";

const read = (path: string) => JSON.parse(readFileSync(new URL(`../../../data/${path}`, import.meta.url), "utf8"));

describe("foreign broker snapshot", () => {
  const snap = read("fees/interactive-israel@2026-10-25.json");
  it("parses with regulator_foreign, a cap and availability", () => {
    expect(feesSnapshot.safeParse(snap).success).toBe(true);
  });
  it("requires regulator_foreign when the regulator is foreign", () => {
    const bad = structuredClone(snap);
    delete bad.provider.regulator_foreign;
    expect(feesSnapshot.safeParse(bad).success).toBe(false);
  });
  it("refuses regulator_foreign on a domestic regulator", () => {
    const bad = structuredClone(snap);
    bad.provider.regulator = "ISA";
    expect(feesSnapshot.safeParse(bad).success).toBe(false);
  });
  it("refuses an unknown instrument class in availability", () => {
    const bad = structuredClone(snap);
    bad.availability[0].applies_to = ["tase_shares"];
    expect(feesSnapshot.safeParse(bad).success).toBe(false);
  });
});

describe("fund and exposure additions", () => {
  it("accepts replication and hedged on a fund record", () => {
    const f = read("funds/1143734@2026-10-25.json");
    expect(f.hedged).toBe(true);
    expect(fundRecord.safeParse(f).success).toBe(true);
  });
  it("refuses an unknown replication method", () => {
    const f = read("funds/1143734@2026-10-25.json");
    f.replication.method = "magic";
    expect(fundRecord.safeParse(f).success).toBe(false);
  });
  it("accepts constituents_israeli", () => {
    expect(exposureRecord.safeParse(read("instruments/exposures/index-ta35.json")).success).toBe(true);
    expect(read("instruments/exposures/index-ta35.json").constituents_israeli).toBe(true);
    expect(read("instruments/exposures/index-sp500.json").constituents_israeli).toBe(false);
  });
});
