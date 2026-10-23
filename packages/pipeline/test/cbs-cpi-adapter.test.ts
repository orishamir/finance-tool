import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { seriesRecord, type SeriesRecord } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import {
  API_URL,
  EXPECTED_BASE,
  changelogLines,
  diffSeries,
  mergeObservations,
  normalise,
  parseResponse,
  refreshCbsCpi,
  sanityCheck,
} from "../src/adapters/cbs-cpi.ts";
import { readSeries, serialiseSeries } from "../src/adapters/series-common.ts";

const fixtureText = readFileSync(fileURLToPath(new URL("./fixtures/cbs-cpi-sample.json", import.meta.url)), "utf8");
const dl = (text: string) => ({ bytes: new TextEncoder().encode(text), lastModified: null });
const ctx = { runDate: "2026-10-23", sha256: "a".repeat(64) };

/** The fixture with one more month appended (as the API prints it: newest first). */
function responseWith(rows: { year: number; month: number; value: number; base?: string }[]): string {
  const doc = JSON.parse(fixtureText);
  const row = (r: { year: number; month: number; value: number; base?: string }) => ({
    year: r.year, percent: 0, percentYear: 0, currBase: { baseDesc: r.base ?? EXPECTED_BASE, value: r.value }, prevBase: null, month: r.month, monthDesc: "",
  });
  doc.month[0].date = [...rows.map(row).reverse()];
  return JSON.stringify(doc);
}
const good = (): SeriesRecord => {
  const r = normalise(dl(fixtureText), null, ctx);
  expect(r.problems).toEqual([]);
  return r.file!;
};
const clone = (f: SeriesRecord): SeriesRecord => JSON.parse(JSON.stringify(f));

describe("parseResponse", () => {
  it("reads the three months of the recorded sample, oldest first, as printed", () => {
    const p = parseResponse(fixtureText);
    expect(p.problems).toEqual([]);
    expect(p.name).toBe("מדד המחירים לצרכן - כללי");
    expect(p.rows).toEqual([
      { date: "2026-07-01", value: 105.1 },
      { date: "2026-08-01", value: 105.8 },
      { date: "2026-09-01", value: 105.3 },
    ]);
  });
  it("drops months printed in an older base but stops when the latest month is in another base", () => {
    const mixed = responseWith([{ year: 2024, month: 12, value: 108.4, base: "2022 ממוצע" }, { year: 2025, month: 1, value: 101.5 }]);
    expect(parseResponse(mixed).rows).toEqual([{ date: "2025-01-01", value: 101.5 }]);
    const rebased = responseWith([{ year: 2026, month: 12, value: 104 }, { year: 2027, month: 1, value: 100.2, base: "2026 ממוצע" }]);
    expect(parseResponse(rebased).problems.join()).toMatch(/base changed/);
  });
  it("reports a response that is not the CPI series or is not JSON", () => {
    expect(parseResponse("<html>").problems[0]).toMatch(/not JSON/);
    expect(parseResponse("{}").problems[0]).toMatch(/no month/);
    expect(parseResponse(fixtureText.replace('"code":120010', '"code":120020')).problems.join()).toMatch(/series code/);
  });
});

describe("normalise", () => {
  it("builds one valid cbs-cpi record with the CBS name, licence and attribution", () => {
    const f = good();
    expect(seriesRecord.safeParse(f).success).toBe(true);
    expect(f).toMatchObject({
      id: "cbs-cpi",
      names: { he: ["מדד המחירים לצרכן - כללי"] },
      publisher: "Central Bureau of Statistics",
      series_code: "120010",
      unit: "index_points",
      cadence: "monthly",
      stale_after_days: 45,
      terms_of_use: { status: "confirmed", terms_url: "https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx" },
    });
    expect(f.terms_of_use.attribution).toContain('הלשכה המרכזית לסטטיסטיקה (הלמ"ס)');
    expect(f.terms_of_use.attribution).toContain("(2026-10-23)");
    expect(f.terms_of_use.attribution).toContain("as is");
  });
  it("records each month as a sourced value object", () => {
    const o = good().observations[2]!;
    expect(o).toMatchObject({
      date: "2026-09-01", value: 105.3, unit: "index_points", checked: "2026-10-23",
      effective_from: "2026-09-01", effective_to: "2026-09-30", update_rule: "market", state: "sourced",
      source: { url: API_URL, publisher: "Central Bureau of Statistics", strength: "primary" },
    });
  });
  it("appends new months and keeps the stored ones, with their own checked date", () => {
    const first = good();
    const next = normalise(dl(responseWith([{ year: 2026, month: 7, value: 105.1 }, { year: 2026, month: 8, value: 105.8 }, { year: 2026, month: 9, value: 105.3 }, { year: 2026, month: 10, value: 105.9 }])), first, { ...ctx, runDate: "2026-11-16" });
    expect(next.problems).toEqual([]);
    const obs = next.file!.observations;
    expect(obs.map((o) => o.date)).toEqual(["2026-07-01", "2026-08-01", "2026-09-01", "2026-10-01"]);
    expect(obs[0]!.checked).toBe("2026-10-23");
    expect(obs[3]!.checked).toBe("2026-11-16");
  });
  it("returns no file when the response is unusable", () => {
    const r = normalise(dl("{}"), null, ctx);
    expect(r.file).toBeNull();
    expect(r.problems.length).toBeGreaterThan(0);
  });
});

describe("sanityCheck", () => {
  it("passes the sample", () => expect(sanityCheck(good(), null)).toEqual([]));
  it("fails a month missing in the sequence", () => {
    const f = clone(good());
    f.observations.splice(1, 1);
    expect(sanityCheck(f, null).join()).toMatch(/month missing in the sequence: 2026-08/);
  });
  it("fails a value outside 50-300 index points", () => {
    for (const v of [49.9, 300.1]) {
      const f = clone(good());
      f.observations[1]!.value = v;
      expect(sanityCheck(f, null).join()).toMatch(/outside 50-300/);
    }
    const f = clone(good());
    f.observations[2]!.value = 50;
    expect(sanityCheck(f, null).filter((r) => /outside/.test(r))).toEqual([]);
  });
  it("fails a fall of more than 5% from one month to the next, not 5%", () => {
    const f = clone(good());
    f.observations[2]!.value = 99.9; // 105.8 -> 99.9 = -5.6%
    expect(sanityCheck(f, null).join()).toMatch(/fell 5\.6%/);
    f.observations[2]!.value = 100.51; // -5.0%
    expect(sanityCheck(f, null).filter((r) => /fell/.test(r))).toEqual([]);
  });
  it("fails an older latest month, a lost stored month and a revised stored value", () => {
    const prev = good();
    const older = clone(prev);
    older.observations.pop();
    expect(sanityCheck(older, prev).join()).toMatch(/older than the stored 2026-09|missing from the new file/);
    const revised = clone(prev);
    revised.observations[0]!.value = 105.2;
    expect(sanityCheck(revised, prev).join()).toMatch(/revised to 105\.2/);
  });
});

describe("diff and change log", () => {
  it("a first snapshot is all new, one change-log line per month", () => {
    const f = good();
    expect(diffSeries(null, f)).toMatchObject({ isEmpty: false, newPeriod: true });
    const lines = changelogLines(null, f, "2026-10-23");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toEqual({
      date: "2026-10-23", collection: "series", id: "cbs-cpi", field: "observations.2026-09", old: null, new: 105.3,
      reason: expect.stringContaining("first snapshot"), affects_rankings: true,
    });
  });
  it("the same data is an empty diff, a new month is one line, a changed value is a line with old and new", () => {
    const prev = good();
    expect(diffSeries(prev, clone(prev)).isEmpty).toBe(true);
    expect(changelogLines(prev, clone(prev), "2026-11-16")).toEqual([]);
    const next = clone(prev);
    next.observations.push({ ...next.observations[2]!, date: "2026-10-01", value: 105.9 });
    expect(diffSeries(prev, next)).toMatchObject({ isEmpty: false, newPeriod: true });
    expect(changelogLines(prev, next, "2026-11-16")).toMatchObject([{ field: "observations.2026-10", old: null, new: 105.9, reason: expect.stringContaining("new monthly index") }]);
    const revised = clone(prev);
    revised.observations[0]!.value = 105.2;
    expect(changelogLines(prev, revised, "2026-11-16")).toMatchObject([{ field: "observations.2026-07", old: 105.1, new: 105.2 }]);
  });
  it("mergeObservations keeps the stored object while the value is unchanged", () => {
    const prev = good().observations;
    const fresh = prev.map((o) => ({ ...o, checked: "2030-01-01" }));
    expect(mergeObservations(prev, fresh)).toEqual(prev);
  });
});

describe("refreshCbsCpi", () => {
  const run = async (dir: string, text: string, extra: object = {}) => {
    const lines: string[] = [];
    const report = await refreshCbsCpi({ dataDir: dir, runDate: "2026-10-23", dryRun: false, archive: false, force: false, fetchRaw: async () => dl(text), log: (l) => lines.push(l), ...extra });
    return { report, lines };
  };
  it("writes the file and the change log, then a second run changes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cpi-"));
    const first = await run(dir, fixtureText);
    expect(first.report).toMatchObject({ status: "new-period", written: true, changelogLines: 3, period: "2026-09-01" });
    expect(readSeries(dir, "cbs-cpi")?.observations).toHaveLength(3);
    expect(readFileSync(join(dir, "changelog.jsonl"), "utf8").trim().split("\n")).toHaveLength(3);
    const second = await run(dir, fixtureText);
    expect(second.report).toMatchObject({ status: "unchanged", written: false });
  });
  it("--dry-run writes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cpi-"));
    const r = await run(dir, fixtureText, { dryRun: true });
    expect(r.report.status).toBe("new-period");
    expect(existsSync(join(dir, "series"))).toBe(false);
  });
  it("a failed sanity check writes nothing, unless forced", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cpi-"));
    const bad = responseWith([{ year: 2026, month: 7, value: 105.1 }, { year: 2026, month: 9, value: 105.3 }]);
    const r = await run(dir, bad);
    expect(r.report.status).toBe("sanity-failed");
    expect(r.report.reasons.join()).toMatch(/month missing/);
    expect(existsSync(join(dir, "series"))).toBe(false);
    expect((await run(dir, bad, { force: true })).report.written).toBe(true);
  });
  it("calls the archive with the gzip of the raw bytes unless --no-archive", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cpi-"));
    const calls: { tag: string; assetName: string }[] = [];
    await run(dir, fixtureText, { archive: true, archiveRaw: (a: { tag: string; assetName: string }) => (calls.push(a), "ok") });
    expect(calls).toMatchObject([{ tag: "raw-cbs-cpi-2026-10", assetName: "cbs-cpi--2026-10-23.json.gz" }]);
  });
  it("serialises one observation per line and parses back", () => {
    const f = good();
    const text = serialiseSeries(f);
    expect(text.split("\n").filter((l) => l.startsWith('    {"'))).toHaveLength(3);
    expect(seriesRecord.parse(JSON.parse(text))).toEqual(f);
  });
});
