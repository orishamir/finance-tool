// A tariff's title is the document's name, shown as the source on every figure of the record; the notes on how it was read go in
// `tariff.notes` (2026-11-03: Bank of Jerusalem's title was a 1,321-character note with links, shown as the document's name).
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkTariffTitle } from "../src/validate.ts";

const dir = fileURLToPath(new URL("../../../data/fees", import.meta.url));

describe("tariff titles", () => {
  it("passes a document's name and fails a note", () => {
    expect(checkTariffTitle("התעריפון המלא ליחיד / עסק קטן - בנק ירושלים")).toEqual([]);
    expect(checkTariffTitle("תעריפון - בנק (עמוד התעריפון https://example.co.il)").join(" ")).toMatch(/link or a note/);
    expect(checkTariffTitle("תעריפון (המסמך אינו מודפס עם תאריך)").join(" ")).toMatch(/link or a note/);
    expect(checkTariffTitle("א".repeat(101)).join(" ")).toMatch(/101 characters/);
  });

  it("every record's title is the document's name", () => {
    const bad = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .flatMap((f) => checkTariffTitle(JSON.parse(readFileSync(`${dir}/${f}`, "utf8")).tariff.title).map((m) => `${f}: ${m}`));
    expect(bad).toEqual([]);
  });
});
