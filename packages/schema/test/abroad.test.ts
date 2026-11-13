// data/abroad/ (data-schema §3.16, D114): the four countries in one order, the note opening on a found one, and every found country
// carrying the guide's three tiles.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { abroadRecord, type AbroadRecord } from "../src/index.ts";

const read = (id: string): AbroadRecord => JSON.parse(readFileSync(new URL(`../../../data/abroad/${id}.json`, import.meta.url), "utf8"));
const issues = (r: unknown) => {
  const out = abroadRecord.safeParse(r);
  return out.success ? [] : out.error.issues.map((i) => i.message);
};

describe("abroadRecord", () => {
  for (const id of ["kupat-gemel-lehashkaa", "keren-hishtalmut"]) it(`${id} parses`, () => expect(issues(read(id))).toEqual([]));

  it("fails the countries out of their order", () => {
    const r = read("kupat-gemel-lehashkaa");
    expect(issues({ ...r, countries: [r.countries[1], r.countries[0], ...r.countries.slice(2)] }).join(" ")).toContain("in that order");
  });

  it("fails a country left out", () => {
    const r = read("keren-hishtalmut");
    expect(issues({ ...r, countries: r.countries.slice(0, 3) }).join(" ")).toContain("in that order");
  });

  it("fails a note that opens on a country with no similar product", () => {
    expect(issues({ ...read("keren-hishtalmut"), opens_on: "us" }).join(" ")).toContain("opens_on");
  });

  it("fails a found country without one of the three tiles", () => {
    const r = read("kupat-gemel-lehashkaa");
    const gb = r.countries[0]!;
    if (!gb.found) throw new Error("Britain is found");
    const { withdraw: _, ...facts } = gb.facts;
    expect(issues({ ...r, countries: [{ ...gb, facts }, ...r.countries.slice(1)] }).join(" ")).toContain('no fact "withdraw"');
  });

  it("fails a fact whose source is not a government's or regulator's own page (primary)", () => {
    const r = read("kupat-gemel-lehashkaa");
    const gb = r.countries[0]!;
    if (!gb.found) throw new Error("Britain is found");
    const limit = { ...gb.facts.deposit_limit!, source: { ...gb.facts.deposit_limit!.source, strength: "secondary" } };
    expect(issues({ ...r, countries: [{ ...gb, facts: { ...gb.facts, deposit_limit: limit } }, ...r.countries.slice(1)] })).not.toEqual([]);
  });
});
