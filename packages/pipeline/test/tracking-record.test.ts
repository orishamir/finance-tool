// data-schema §4 item 17 (recheck 3 of the indices data, 2026-11-07): a tracking record holds every full year its report prints, and a
// gross benchmark stands only on a Tel Aviv index the method names, with its document and its own rule.
import { describe, expect, it } from "vitest";
import { checkTrackingRecord } from "../src/index.ts";

const year = (y: number) => ({ year: y, fund_pct: 1, tracking_pct: 1.2 });
const source = { url: "https://market.tase.co.il/he/market_data/index/137/about", title: "ת\"א-125 אודות המדד", publisher: "Tel Aviv Stock Exchange", strength: "primary" };
const rec = (exposure_id: string, years: number[], printed: number[], benchmark: Record<string, unknown>) =>
  checkTrackingRecord({ exposure_id, tracking_record: { years: years.map(year), years_printed: printed, source, page: 5, checked: "2026-11-07", benchmark: { name: "x", ...benchmark } } } as never);
const gross125 = { dividends: "gross", source, rule_ids: ["ETF-42"] };

describe("checkTrackingRecord", () => {
  it("passes a record that holds every year its report prints", () => {
    expect(rec("index-ta125", [2025, 2024, 2023], [2023, 2024, 2025], gross125)).toEqual([]);
    expect(rec("index-sp500", [2025], [2025], { dividends: "net" })).toEqual([]);
  });
  it("fails a record that leaves out a year the report prints (2025 only where it prints 2023 to 2025)", () => {
    expect(rec("index-ta125", [2025], [2023, 2024, 2025], gross125)[0]).toMatch(/prints 2023, 2024/);
  });
  it("fails a year the report does not print, and a year twice", () => {
    expect(rec("index-sp500", [2025, 2024], [2025], { dividends: "net" })[0]).toMatch(/2024 is not in years_printed/);
    expect(rec("index-sp500", [2025, 2025], [2025], { dividends: "net" })[0]).toMatch(/twice/);
  });
  it("fails a gross benchmark without its document, or with another index's rule", () => {
    expect(rec("index-ta125", [2025], [2025], { dividends: "gross", rule_ids: ["ETF-42"] })[0]).toMatch(/names the document/);
    expect(rec("index-ta125", [2025], [2025], { dividends: "gross", page: 2, rule_ids: ["ETF-42"] })).toEqual([]);
    expect(rec("index-ta125", [2025], [2025], { ...gross125, rule_ids: ["ETF-44"] }).join(" ")).toMatch(/recorded by ETF-42, not ETF-44/);
    expect(rec("index-ta90", [2025], [2025], { ...gross125, rule_ids: [] })[0]).toMatch(/recorded by ETF-45/);
    expect(rec("index-ta35", [2025], [2025], { ...gross125, rule_ids: ["ETF-44", "ETF-45"] }).join(" ")).toMatch(/ETF-45 records another index/);
  });
  it("fails a gross benchmark on an index the method does not compare gross", () => {
    expect(rec("index-sp500", [2025], [2025], gross125)[0]).toMatch(/not a Tel Aviv index/);
  });
});

describe("checkTrackingRecord: the fees charged each year (F-92 (b), 2026-11-07)", () => {
  const fees = { fixed: 0.25, variable: 0.1, trustee: 0.02 };
  const tr = (years: object[], extra: object = {}) => ({ years, years_printed: [2024, 2025], source, page: 5, checked: "2026-11-07", benchmark: { name: "x", dividends: "net" }, ...extra });
  const check = (domicile: string, t: object) => checkTrackingRecord({ exposure_id: "index-sp500", domicile, tracking_record: t } as never);
  const dated = { fees_page: 7, changes_page: 6, variable_rate_since: null };
  it("passes an Israeli record with the fees of every year and their page, and a foreign record without them", () => {
    expect(check("IL", tr([{ ...year(2025), fees_charged: fees }, { ...year(2024), fees_charged: fees }], dated))).toEqual([]);
    expect(check("IE", tr([year(2025), year(2024)]))).toEqual([]);
  });
  it("fails an Israeli year without its fees, and fees without their page", () => {
    expect(check("IL", tr([{ ...year(2025), fees_charged: fees }, year(2024)], { fees_page: 7 }))[0]).toMatch(/2024 has no fees_charged/);
    expect(check("IE", tr([{ ...year(2025), fees_charged: fees }, year(2024)]))[0]).toMatch(/fees_page/);
  });
  it("fails an Israeli record that does not say since when its variable rate is in force, or where its table of changes is (pass 6)", () => {
    const both = [{ ...year(2025), fees_charged: fees }, { ...year(2024), fees_charged: fees }];
    expect(check("IL", tr(both, { fees_page: 7 }))[0]).toMatch(/changes_page and variable_rate_since/);
    expect(check("IL", tr(both, { fees_page: 7, variable_rate_since: null }))[0]).toMatch(/changes_page/);
    expect(check("IE", tr([year(2025), year(2024)], { variable_rate_since: null }))[0]).toMatch(/does not hold/);
  });
  it("fails a year at today's rate charged beyond it either way (ETF-14), and passes one at an older rate", () => {
    const at = (variable: number, since: string | null) =>
      checkTrackingRecord({ exposure_id: "index-sp500", domicile: "IL", fees: { variable_management: { value: 0.1 } }, tracking_record: tr([{ ...year(2025), fees_charged: { ...fees, variable } }, { ...year(2024), fees_charged: { ...fees, variable: 0.3 } }], { ...dated, variable_rate_since: since }) } as never);
    expect(at(0.1, "2025-01-01")).toEqual([]);
    expect(at(-0.1, "2025-01-01")).toEqual([]);
    expect(at(0.1, null)[0]).toMatch(/2024 charged a variable fee beyond today's rate/);
    expect(at(-0.15, "2025-01-01")[0]).toMatch(/2025 charged/);
  });
});

describe("the gross indices", () => {
  it("are the same three in the validator and the engine", async () => {
    const { GROSS_INDEX_RULE } = await import("../src/index.ts");
    const { GROSS_COMPARED_INDICES } = await import("../../engine/src/index.ts");
    expect(Object.keys(GROSS_INDEX_RULE).sort()).toEqual([...GROSS_COMPARED_INDICES].sort());
  });
  it("fails a year printed twice", () => {
    expect(rec("index-sp500", [2025], [2025, 2025], { dividends: "net" })[0]).toMatch(/years_printed: a year appears twice/);
  });
});
