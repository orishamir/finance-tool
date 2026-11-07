// A collected price list with no date for the whole says what it prints instead (2026-11-07): the page then says it, never a bare
// "no publication date".
import { describe, expect, it } from "vitest";
import { checkCutSourceTitles, checkTariffDate } from "../src/validate.ts";

describe("tariff.printed", () => {
  it("is asked of a collected record with no published date, and only of one", () => {
    expect(checkTariffDate({ missing: false, tariff: { published: null } }).join(" ")).toMatch(/says what it prints instead/);
    expect(checkTariffDate({ missing: true, tariff: { published: null } })).toEqual([]);
    expect(checkTariffDate({ missing: false, tariff: { published: "2026-10-01" } })).toEqual([]);
    expect(checkTariffDate({ missing: false, tariff: { published: "2026-10-01", printed: { kind: "none" } } }).join(" ")).toMatch(/only where/);
    expect(checkTariffDate({ missing: false, tariff: { published: null, printed: { kind: "none" } } })).toEqual([]);
  });
  it("takes a part's date from its print, and a misprint as no date", () => {
    expect(checkTariffDate({ missing: false, tariff: { published: null, printed: { kind: "part", date: "2024-04-02", as_printed: "02/04/2024" } } })).toEqual([]);
    expect(checkTariffDate({ missing: false, tariff: { published: null, printed: { kind: "part", date: null, as_printed: "06/02/20217" } } })).toEqual([]);
    expect(checkTariffDate({ missing: false, tariff: { published: null, printed: { kind: "part", date: "2017-02-06", as_printed: "06/02/20217" } } }).join(" ")).toMatch(/never a guess/);
    expect(checkTariffDate({ missing: false, tariff: { published: null, printed: { kind: "part", date: "2024-02-04", as_printed: "02/05/2024" } } }).join(" ")).toMatch(/not the date printed/);
  });
});

describe("a source title shown on the page", () => {
  it("is never cut off inside a bracket", () => {
    const cut = { availability: [{ source: { title: "התעריפון המלא - בנק (20 עמ'): חלק 4 ('בתוקף מתאריך' כפי שמודפס, כנראה" } }] };
    expect(checkCutSourceTitles(cut).join(" ")).toMatch(/availability\.0\.source\.title: a bracket is left open/);
    expect(checkCutSourceTitles({ availability: [{ source: { title: "התעריפון המלא - בנק, חלק 4 (עמ' 6)" } }] })).toEqual([]);
  });
});
