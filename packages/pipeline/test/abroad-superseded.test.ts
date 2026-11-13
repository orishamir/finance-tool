// data-schema §3.16: a note's source whose text stops being in force on a known day (Italy's PIR law, repealed from 1.1.2027 by
// D.Lgs. 117/2026, Testo unico art. 376 c.1 lett. eeeee), from the day its art. 377 sets) is named by the data check from that day, with
// the text that carries the rule then.
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
    expect(out).toContain("kupat-gemel-lehashkaa:it.deposit_limit -> D.Lgs. 19 giugno 2026, n. 117, Testo unico imposte sui redditi, art. 209, comma 2");
    expect(out).toContain("kupat-gemel-lehashkaa:it.who -> D.Lgs. 19 giugno 2026, n. 117, Testo unico imposte sui redditi, art. 209, comma 1");
    expect(out.every((x) => x.startsWith("kupat-gemel-lehashkaa:it."))).toBe(true);
    expect(out).toHaveLength(7);
  });
  it("rests every coming replacement on the repealing provision and the day it takes effect, each quoted", () => {
    const italy = kupat.countries[3]!;
    if (!italy.found) throw new Error("Italy is found");
    for (const f of Object.values(italy.facts)) {
      if (!f.source.superseded) continue;
      expect(f.source.superseded.from).toBe("2027-01-01");
      expect(f.source.superseded.basis.map((b) => b.locator)).toEqual(["art. 376, comma 1, lettera eeeee)", "art. 377, comma 1"]);
    }
  });
});
