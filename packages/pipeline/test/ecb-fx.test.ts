import { describe, expect, it } from "vitest";
import { buildSeries, parseEcbXml } from "../scripts/fetch-ecb-rates.ts";

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
    const s = buildSeries(parseEcbXml(xml), "2026-10-25");
    expect(s.terms_of_use.status).toBe("confirmed");
    expect(s.terms_of_use.attribution).toContain("הבנק המרכזי האירופי (ECB)");
    expect(s.observations.map((o) => o.key)).toEqual(["ILS", "JPY", "USD"]);
    expect(s.observations[2]).toMatchObject({ value: 1.1193, date: "2026-10-23", checked: "2026-10-25", state: "sourced" });
  });
});
