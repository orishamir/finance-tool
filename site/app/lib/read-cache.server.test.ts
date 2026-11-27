// What the site reads of a value's source: the machine address a collector read never reaches a page, and the English publisher stays
// out where the source names its publisher in Hebrew, while the page a reader opens and the Hebrew name stay.
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seriesRecord } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { root } from "./data.server";
import { readJsonCached, readParsedCached } from "./read-cache.server";

const value = (source: Record<string, unknown>) => ({ value: 1, unit: "nis", source, checked: "2026-11-27" });

describe("a value's source as the site reads it", () => {
  const dir = mkdtempSync(join(tmpdir(), "read-cache-"));
  const file = join(dir, "values.json");
  writeFileSync(
    file,
    JSON.stringify({
      named: value({ url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "t", publisher: "CMA", publisher_he: "רשות שוק ההון, ביטוח וחיסכון", strength: "primary", fetched_from: "https://data.gov.il/dataset/x/resource/y/download/file.csv" }),
      unnamed: value({ url: "https://www.boi.org.il/x", title: "t", publisher: "Bank of Israel", strength: "primary" }),
      notValue: { source: { url: "https://example.org", publisher: "Kept", publisher_he: "נשמר", fetched_from: "https://example.org/a.csv" } },
    }),
  );
  const read = readJsonCached<Record<string, { source: Record<string, unknown> }>>(file);

  it("leaves out fetched_from, and the English publisher where there is a Hebrew one, keeping the page and the Hebrew name", () => {
    expect(read.named?.source).toEqual({ url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "t", publisher: "", publisher_he: "רשות שוק ההון, ביטוח וחיסכון", strength: "primary" });
  });

  it("keeps the English publisher of a source with no Hebrew name, and touches nothing that is not a value", () => {
    expect(read.unnamed?.source.publisher).toBe("Bank of Israel");
    expect(read.notValue?.source).toEqual({ url: "https://example.org", publisher: "Kept", publisher_he: "נשמר", fetched_from: "https://example.org/a.csv" });
  });

  it("reaches the stored series: no observation the site reads keeps fetched_from", () => {
    const fx = readParsedCached(join(root, "data/series/ecb-fx-month-end.json"), seriesRecord);
    for (const o of fx.observations) expect([o.date, "fetched_from" in o.source, o.source.publisher_he]).toEqual([o.date, false, "הבנק המרכזי האירופי"]);
  });
});
