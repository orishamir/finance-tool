// data-schema §3.16: a note's source whose text stops being in force on a known day (Italy's PIR law, repealed from 1.1.2027 by
// D.Lgs. 117/2026) is named by the data check from that day, with the text that carries the rule now.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { abroadRecord } from "@finance-tool/schema";
import { supersededAbroad } from "../src/validate.ts";

const kupat = abroadRecord.parse(JSON.parse(readFileSync(new URL("../../../data/abroad/kupat-gemel-lehashkaa.json", import.meta.url), "utf8")));

describe("supersededAbroad", () => {
  it("says nothing while the cited law is in force", () => {
    expect(supersededAbroad(kupat, "2026-12-31")).toEqual([]);
  });
  it("names every Italian fact cited to the repealed law from 1.1.2027, and the article that carries it", () => {
    const out = supersededAbroad(kupat, "2027-01-01");
    expect(out).toContain("kupat-gemel-lehashkaa:it.deposit_limit -> D.Lgs. 19 giugno 2026, n. 117, art. 209 (commi 1, 2 e 7)");
    expect(out.every((x) => x.startsWith("kupat-gemel-lehashkaa:it."))).toBe(true);
    expect(out).toHaveLength(6);
  });
});
