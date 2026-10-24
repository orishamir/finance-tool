import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { seriesRecord, type SeriesRecord } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { decodeWindows1255 } from "../src/adapters/cma.ts";
import {
  currentState,
  diffSeries,
  isoFromDmy,
  monthsBefore,
  normalise,
  parseRates,
  refreshMofChildSavings,
  sanityCheck,
  thin,
} from "../src/adapters/mof-child-savings.ts";
import { readSeries, serialiseSeries } from "../src/adapters/series-common.ts";

const fixture = readFileSync(fileURLToPath(new URL("./fixtures/mof-child-savings-sample.cp1255.csv", import.meta.url)));
const dl = (bytes: Uint8Array = fixture) => ({ bytes, lastModified: null });
const ctx = { runDate: "2026-10-23", sha256: "b".repeat(64) };
const LEUMI = "לאומי|הפקדה ללא תחנות יציאה|0 - 1|17 Y -18 Y|fixed_unlinked";

const good = (): SeriesRecord => {
  const r = normalise(dl(), null, ctx);
  expect(r.problems).toEqual([]);
  return r.file!;
};
const clone = (f: SeriesRecord): SeriesRecord => JSON.parse(JSON.stringify(f));

describe("decode and helpers", () => {
  it("the fixture is Windows-1255, not UTF-8, and decodes to Hebrew without replacement characters", () => {
    expect(() => new TextDecoder("utf-8", { fatal: true }).decode(fixture)).toThrow();
    const text = decodeWindows1255(fixture);
    expect(text).toContain("הפקדה ללא תחנות יציאה");
    expect(text).not.toContain("�");
  });
  it("converts dd/mm/yyyy and rejects impossible dates", () => {
    expect(isoFromDmy("22/10/2026")).toBe("2026-10-22");
    expect(isoFromDmy("31/02/2026")).toBeNull();
    expect(isoFromDmy("2026-10-22")).toBeNull();
  });
  it("counts 14 calendar months back, clamping the day", () => {
    expect(monthsBefore("2026-10-23", 14)).toBe("2025-08-23");
    expect(monthsBefore("2026-04-30", 14)).toBe("2025-02-28");
    expect(monthsBefore("2026-01-31", 2)).toBe("2025-11-30");
  });
  it("thin keeps the first point, every change and the last point", () => {
    const p = (value: number, i: number) => ({ date: `d${i}`, value });
    expect(thin([1, 1, 1, 2, 2, 3, 3, 3].map(p)).map((x) => x.date)).toEqual(["d0", "d3", "d5", "d7"]);
    expect(thin([p(1, 0)])).toHaveLength(1);
  });
});

describe("parseRates", () => {
  it("reads the sample into 12 keys (4 rows x 3 metrics), one point per date", () => {
    const p = parseRates(decodeWindows1255(fixture), "2026-10-23");
    expect(p.problems).toEqual([]);
    expect(p.series.size).toBe(12);
    expect(p.series.get(LEUMI)).toEqual([
      { date: "2025-09-02", value: 4.4 },
      { date: "2026-10-18", value: 3.15 },
      { date: "2026-10-20", value: 3.15 },
      { date: "2026-10-22", value: 3.15 },
    ]);
  });
  it("keeps only the latest 14 months", () => {
    const p = parseRates(decodeWindows1255(fixture), "2026-11-05"); // cutoff 2025-09-05: 02/09/2025 falls out
    expect(p.series.get(LEUMI)!.map((x) => x.date)).toEqual(["2026-10-18", "2026-10-20", "2026-10-22"]);
  });
  it("reports missing columns, bad dates, bad rates, future dates, duplicates and decode failures", () => {
    const text = decodeWindows1255(fixture);
    expect(parseRates(text.replace("BANK", "BANKX"), "2026-10-23").problems.join()).toMatch(/column\(s\) missing: BANK/);
    expect(parseRates(text.replace('"22/10/2026"', '"32/10/2026"'), "2026-10-23").problems.join()).toMatch(/unreadable INTERESTSDATE/);
    expect(parseRates(text.replace('"3.15"', '""'), "2026-10-23").problems.join()).toMatch(/empty or not a number/);
    expect(parseRates(text, "2026-10-21").problems.join()).toMatch(/dated after the run date/);
    const dupe = text.trimEnd() + "\n" + text.split("\n")[1];
    expect(parseRates(dupe, "2026-10-23").problems.join()).toMatch(/more than once/);
    expect(parseRates(text.replace("לאומי", "�"), "2026-10-23").problems.join()).toMatch(/replacement characters/);
  });
});

describe("normalise", () => {
  it("builds one valid record: licence, attribution, rule ids, per-key value objects", () => {
    const f = good();
    expect(seriesRecord.safeParse(f).success).toBe(true);
    expect(f).toMatchObject({
      id: "mof-child-savings-rates",
      unit: "pct_per_year",
      cadence: "daily",
      stale_after_days: 7,
      rule_ids: ["CS-10", "CS-22", "CS-23"],
      terms_of_use: { status: "confirmed", terms_url: "https://data.gov.il/he/terms-of-use" },
    });
    expect(f.terms_of_use.attribution).toContain("משרד האוצר");
    const o = f.observations.find((x) => x.key === LEUMI && x.date === "2026-10-22")!;
    expect(o).toMatchObject({ value: 3.15, unit: "pct_per_year", checked: "2026-10-23", effective_from: "2026-10-22", update_rule: "provider-set", state: "sourced", source: { strength: "primary" } });
  });
  it("thins each key: first, changes, last; sorted by date then key", () => {
    const f = good();
    // 02/09/2025 (4.4) -> 18/10/2026 (3.15 change) -> 20/10 dropped -> 22/10 last
    expect(f.observations.filter((o) => o.key === LEUMI).map((o) => o.date)).toEqual(["2025-09-02", "2026-10-18", "2026-10-22"]);
    // an unchanged key keeps its first and last only
    expect(f.observations.filter((o) => o.key?.startsWith("הפועלים|צבירת") && o.key.endsWith("fixed_unlinked")).map((o) => o.date)).toEqual(["2025-09-02", "2026-10-22"]);
    const dates = f.observations.map((o) => o.date);
    expect(dates).toEqual([...dates].sort());
  });
  it("an unchanged observation keeps its stored checked date", () => {
    const first = good();
    const next = normalise(dl(), first, { ...ctx, runDate: "2026-10-24" });
    expect(next.file!.observations.every((o) => o.checked === "2026-10-23")).toBe(true);
  });
  it("returns no file when there are no usable rows", () => {
    const r = normalise(dl(new TextEncoder().encode("a,b\n1,2\n")), null, ctx);
    expect(r.file).toBeNull();
    expect(r.problems[0]).toMatch(/column\(s\) missing/);
  });
});

describe("sanityCheck", () => {
  it("passes the sample and a first run", () => expect(sanityCheck(good(), null)).toEqual([]));
  it("fails a rate outside -10 to 20", () => {
    const f = clone(good());
    f.observations[0]!.value = 25;
    expect(sanityCheck(f, null).join()).toMatch(/outside -10 to 20/);
  });
  it("fails when fewer than 80% of the keys have a value on the latest date", () => {
    const f = clone(good());
    const latest = "2026-10-22";
    let dropped = 0;
    f.observations = f.observations.filter((o) => !(o.date === latest && dropped++ < 3));
    expect(sanityCheck(f, null).join()).toMatch(/keys have a value on the latest date/);
  });
  it("fails an older latest date and a collapsed key count against the stored file", () => {
    const prev = good();
    const older = clone(prev);
    older.observations = older.observations.filter((o) => o.date !== "2026-10-22");
    expect(sanityCheck(older, prev).join()).toMatch(/older than the stored 2026-10-22/);
    const fewer = clone(prev);
    const keep = new Set([...currentState(prev).keys()].slice(0, 6));
    fewer.observations = fewer.observations.filter((o) => keep.has(o.key!));
    expect(sanityCheck(fewer, prev).join()).toMatch(/key count 6 is below 80%/);
  });
});

describe("diff", () => {
  it("a first snapshot is all new", () => {
    expect(diffSeries(null, good())).toMatchObject({ isEmpty: false, newPeriod: true });
  });
  it("the same data is empty; a new day is a new period", () => {
    const prev = good();
    expect(diffSeries(prev, clone(prev)).isEmpty).toBe(true);
    const newDay = clone(prev);
    for (const o of newDay.observations) if (o.date === "2026-10-22") o.date = "2026-10-24";
    expect(diffSeries(prev, newDay)).toMatchObject({ isEmpty: false, newPeriod: true });
  });
});

describe("refreshMofChildSavings", () => {
  const run = async (dir: string, extra: object = {}) =>
    refreshMofChildSavings({ dataDir: dir, runDate: "2026-10-23", dryRun: false, archive: false, force: false, fetchRaw: async () => dl(), log: () => {}, ...extra });
  it("writes the file; a second run changes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mof-"));
    expect(await run(dir)).toMatchObject({ status: "new-period", written: true, period: "2026-10-22" });
    expect(readSeries(dir, "mof-child-savings-rates")?.observations.length).toBeGreaterThan(12);
    expect(await run(dir)).toMatchObject({ status: "unchanged", written: false });
  });
  it("--dry-run writes nothing; a sanity failure writes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mof-"));
    expect((await run(dir, { dryRun: true })).written).toBe(false);
    expect(existsSync(join(dir, "series"))).toBe(false);
    const bad = new TextEncoder().encode(decodeWindows1255(fixture).replace("VARIABLESPREAD", "X"));
    const r = await run(dir, { fetchRaw: async () => dl(bad) });
    expect(r.status).toBe("sanity-failed");
    expect(existsSync(join(dir, "series"))).toBe(false);
  });
  it("archives under the run month unless --no-archive", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mof-"));
    const calls: { tag: string; assetName: string }[] = [];
    await run(dir, { archive: true, archiveRaw: (a: { tag: string; assetName: string }) => (calls.push(a), "ok") });
    expect(calls).toMatchObject([{ tag: "raw-mof-child-savings-2026-10", assetName: "mof-child-savings--2026-10-23.csv.gz" }]);
  });
  it("serialises one observation per line and parses back", () => {
    const f = good();
    const text = serialiseSeries(f);
    expect(text.split("\n").filter((l) => l.startsWith('    {"'))).toHaveLength(f.observations.length);
    expect(seriesRecord.parse(JSON.parse(text))).toEqual(f);
  });
});
