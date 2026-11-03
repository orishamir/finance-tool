import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSeries, ecbFxSpec, parseEcbXml, refreshEcbFx, sanityCheck } from "../src/adapters/ecb-fx.ts";

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
  it("builds a confirmed-terms series, one sorted observation per currency keyed by ISO code", () => {
    const s = buildSeries(parseEcbXml(xml), ctx);
    expect(s.terms_of_use.status).toBe("confirmed");
    expect(s.terms_of_use.attribution).toContain("הבנק המרכזי האירופי (ECB)");
    expect(s.observations.map((o) => o.key)).toEqual(["ILS", "JPY", "USD"]);
    expect(s.observations[2]).toMatchObject({ value: 1.1193, date: "2026-10-23", checked: "2026-10-25", state: "sourced" });
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
