import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { API_URL, ECB_URL, buildMonthSeries, buildSeries, ecbFxSpec, ecbMonthEndSpec, keepStored, parseEcbXml, refreshEcbFx, sanityCheck } from "../src/adapters/ecb-fx.ts";
import { renormaliseSeries } from "../src/adapters/series-common.ts";

const ctx = { runDate: "2026-10-25", sha256: "a".repeat(64) };

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
	<gesmes:subject>Reference rates</gesmes:subject>
	<Cube>
		<Cube time='2026-10-23'>
			<Cube currency='USD' rate='1.1193'/>
			<Cube currency='JPY' rate='175.51'/>
			<Cube currency='ILS' rate='3.4939'/>
		</Cube>
	</Cube>
</gesmes:Envelope>`;

describe("ECB reference rates", () => {
  it("parses the day and every currency per euro", () => {
    expect(parseEcbXml(xml)).toEqual({ date: "2026-10-23", rates: { USD: 1.1193, JPY: 175.51, ILS: 3.4939 } });
  });
  it("refuses a file with no day, a bad rate or no ILS/USD", () => {
    expect(() => parseEcbXml("<Cube></Cube>")).toThrow(/no <Cube time/);
    expect(() => parseEcbXml(xml.replace("1.1193", "0"))).toThrow(/bad rate/);
    expect(() => parseEcbXml(xml.replace(/<Cube currency='ILS'[^>]*>/, ""))).toThrow(/no ILS/);
  });
  it("builds a series with the ECB's licence page and attribution, one sorted observation per currency keyed by ISO code", () => {
    const s = buildSeries(parseEcbXml(xml), ctx);
    expect(s.terms_of_use.read_on).toBe("2026-10-25");
    expect(s.terms_of_use.attribution).toContain("הבנק המרכזי האירופי (ECB)");
    expect(s.observations.map((o) => o.key)).toEqual(["ILS", "JPY", "USD"]);
    expect(s.observations[2]).toMatchObject({ value: 1.1193, date: "2026-10-23", checked: "2026-10-25", state: "sourced" });
  });
  it("opens the page that prints the day's rates, keeps the XML it read as fetched_from, and names the ECB in Hebrew", () => {
    for (const o of buildSeries(parseEcbXml(xml), ctx).observations)
      expect(o.source).toEqual({
        url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
        title: "ECB euro foreign exchange reference rates (daily)",
        publisher: "European Central Bank",
        publisher_he: "הבנק המרכזי האירופי",
        strength: "primary",
        fetched_from: ECB_URL,
      });
  });
  it("gives every month-end rate one source naming both series, the shekel's and the dollar's, with the CSV it read as fetched_from", () => {
    const s = buildMonthSeries([{ code: "ILS", month: "2026-09", rate: 3.9 }, { code: "USD", month: "2026-09", rate: 1.17 }], ctx);
    expect(s.observations.map((o) => [o.key, o.source.url, o.source.fetched_from, o.source.publisher_he])).toEqual([
      ["ILS", "https://data.ecb.europa.eu/data/datasets/EXR", API_URL, "הבנק המרכזי האירופי"],
      ["USD", "https://data.ecb.europa.eu/data/datasets/EXR", API_URL, "הבנק המרכזי האירופי"],
    ]);
    for (const o of s.observations) for (const code of ["EXR.M.ILS.EUR.SP00.E", "EXR.M.USD.EUR.SP00.E"]) expect(o.source.title).toContain(code);
  });
  it("never gives a month-end rate the shekel series' own page, since the site takes one month's source for the dollar input too", () => {
    const built = buildMonthSeries([{ code: "ILS", month: "2026-09", rate: 3.9 }, { code: "USD", month: "2026-09", rate: 1.17 }], ctx);
    const stored = JSON.parse(readFileSync(new URL("../../../data/series/ecb-fx-month-end.json", import.meta.url), "utf8")) as typeof built;
    for (const o of [...built.observations, ...renormaliseSeries(ecbMonthEndSpec, built).observations, ...stored.observations])
      expect([o.key, o.date, o.source.url.includes("EXR.M.ILS"), o.source.title.includes("EXR.M.USD.EUR.SP00.E")]).toEqual([o.key, o.date, false, true]);
  });
  it("a rate read again keeps its stored checked date, and takes the source the adapter writes now", () => {
    const stored = buildSeries(parseEcbXml(xml), ctx);
    for (const o of stored.observations) o.source = { url: ECB_URL, title: "old", publisher: "European Central Bank", strength: "primary" };
    const next = keepStored(buildSeries(parseEcbXml(xml), { ...ctx, runDate: "2026-10-26" }), stored);
    expect(next.observations.every((o) => o.checked === "2026-10-25" && o.source.fetched_from === ECB_URL)).toBe(true);
  });
  it("renormaliseSeries gives stored observations today's source and changes nothing else", () => {
    const fresh = buildMonthSeries([{ code: "ILS", month: "2026-09", rate: 3.9 }, { code: "USD", month: "2026-09", rate: 1.17 }], ctx);
    const stored = JSON.parse(JSON.stringify(fresh)) as typeof fresh;
    for (const o of stored.observations) o.source = { url: API_URL, title: "both series", publisher: "European Central Bank", strength: "primary" };
    expect(renormaliseSeries(ecbMonthEndSpec, stored)).toEqual(fresh);
    expect(renormaliseSeries(ecbFxSpec, buildSeries(parseEcbXml(xml), ctx))).toEqual(buildSeries(parseEcbXml(xml), ctx));
  });
  it("refuses a rate that moved more than the limit, or a day older than the stored one", () => {
    const stored = buildSeries(parseEcbXml(xml), ctx);
    expect(sanityCheck(buildSeries(parseEcbXml(xml.replace("3.4939", "3.5")), ctx), stored)).toEqual([]);
    expect(sanityCheck(buildSeries(parseEcbXml(xml.replace("3.4939", "3.9")), ctx), stored)[0]).toMatch(/ILS moved 11\.6%/);
    expect(sanityCheck(buildSeries(parseEcbXml(xml.replace("2026-10-23", "2026-10-22")), ctx), stored)[0]).toMatch(/older than the stored/);
  });
  it("writes a new day and keeps the file as it is when the same day comes again", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "ecb-fx-"));
    const run = (text: string, runDate: string) =>
      refreshEcbFx({ dataDir, runDate, dryRun: false, archive: false, force: false, log: () => {}, fetchRaw: async () => ({ bytes: new TextEncoder().encode(text), lastModified: null }) });
    expect(await run(xml, "2026-10-25")).toMatchObject({ status: "new-period", period: "2026-10-23", written: true });
    const file = join(dataDir, "series", `${ecbFxSpec.id}.json`);
    const first = readFileSync(file, "utf8");
    expect(await run(xml, "2026-10-26")).toMatchObject({ status: "unchanged", written: false });
    expect(readFileSync(file, "utf8")).toBe(first);
    expect(await run(xml.replace("2026-10-23", "2026-10-26").replace("1.1193", "1.12"), "2026-10-26")).toMatchObject({ status: "new-period", period: "2026-10-26" });
    expect(JSON.parse(readFileSync(file, "utf8")).observations.every((o: { date: string }) => o.date === "2026-10-26")).toBe(true);
  });
});
