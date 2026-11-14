// What a house charged on average, beside its list price (method F-122): the column each line is of, the range over the bands, and only
// what a page shows leaving the server; no price reads it.
import { describe, expect, it } from "vitest";
import { averageOf, columnOf, houseAverages } from "./house-averages";
import { loadHouseAverages } from "./house-averages.server";
import { latestSnapshots } from "./providers.server";
import { brokeragePart } from "./institutions.server";
import { feesData } from "./fees.server";

const line = (base: string, applies_to: string[], band: string | null = null) => ({ base, applies_to, band, level: "list" }) as Parameters<typeof columnOf>[0];

describe("a house's average charged (F-122)", () => {
  it("a line is of one column of the sheet, or none", () => {
    expect(columnOf(line("trade", ["tase_shares_bonds", "etf_units"]))).toEqual({ fee: "trade", securities: "il_shares_bonds" });
    expect(columnOf(line("trade", ["makam"]))).toEqual({ fee: "trade", securities: "il_makam" });
    expect(columnOf(line("trade", ["foreign_securities"]))).toEqual({ fee: "trade", securities: "foreign" });
    expect(columnOf(line("custody", ["tase_shares_bonds", "mutual_fund_units"]))).toEqual({ fee: "custody", securities: "il" });
    // two columns, a plan's line, another base: none
    expect(columnOf(line("trade", ["tase_shares_bonds", "makam"]))).toBeNull();
    expect(columnOf(line("trade", ["foreign_securities"], "IBKR Pro - Fixed"))).toBeNull();
    expect(columnOf(line("fx", ["all"]))).toBeNull();
  });
  it("a column is the lowest and the highest cell over the bands, opening the calculator's page", () => {
    const rec = loadHouseAverages().get("meitav-trade")!;
    const h = houseAverages(rec);
    const trade = averageOf(h, { fee: "trade", securities: "il_shares_bonds" })!;
    const cells = rec.averages.rows.filter((r) => r.fee === "trade" && r.securities === "il_shares_bonds").map((r) => r.rate.value as number);
    expect(trade.lo.value).toBe(Math.min(...cells));
    expect(trade.hi.value).toBe(Math.max(...cells));
    expect(trade.lo.source.url).toBe("https://market.tase.co.il/he/market_data/trading_fees");
    expect([h.from, h.to]).toEqual(["2026-01-01", "2026-06-30"]);
  });
  it("a column whose every cell is empty is left out (One Zero prints no makam average)", () => {
    expect(averageOf(houseAverages(loadHouseAverages().get("one-zero")!), { fee: "trade", securities: "il_makam" })).toBeNull();
  });
  it("the company page carries a line's average, and only the columns its lines show", () => {
    const part = brokeragePart("meitav-trade")!;
    const withAverage = part.tariff.lines.filter((l) => l.average);
    expect(withAverage.length).toBeGreaterThan(0);
    for (const l of withAverage) expect(l.average!.column).toEqual(columnOf(latestSnapshots().find((s) => s.id === "meitav-trade")!.lines.find((x) => x.id === l.id)!));
    expect(part.tariff.averages?.page.url).toBe("https://market.tase.co.il/he/market_data/trading_fees");
  });
  it("a deal's template carries its house's averages beside its fees, and its fees are the list's whatever they are", () => {
    const data = feesData();
    const meitav = data.houses.find((h) => h.id === "meitav-trade")!;
    expect(meitav.averages?.columns.length).toBeGreaterThan(0);
    // nothing of the averages is in a fee the template fills
    const figures = JSON.stringify(meitav.fees);
    for (const c of meitav.averages!.columns) expect(figures).not.toContain(c.lo.source.title);
    // PEPPER, part of Leumi, has no sheet of its own and shows none
    expect(data.houses.find((h) => h.id === "pepper")?.averages).toBeUndefined();
  });
});

describe("an average that is not nothing never reads 0% (F-122, rendered)", async () => {
  const { renderToString } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { HouseAverageLine } = await import("../components/kit/house-average");
  const { fmt } = await import("./format");
  it("IBI's custody, 0.0012% to 0.0673% a year, shows both figures with their digits", () => {
    const h = houseAverages(loadHouseAverages().get("ibi")!, [{ fee: "custody", securities: "il" }]);
    const out = renderToString(createElement(HouseAverageLine, { averages: h.columns, house: "IBI", from: h.from, to: h.to, page: h.page })).replace(/<[^>]+>/g, "").replace(/[⁦-⁩]/g, "");
    expect(out).toContain("0.0012%");
    expect(out).toContain(fmt.pct(0.0673));
    expect(out).not.toMatch(/(^|[^\d.])0%/);
  });
  it("the figure keeps two decimals where it has them, and the first two significant digits below them", () => {
    expect(fmt.pctNonZero(0.0955)).toBe(fmt.pct(0.0955));
    expect(fmt.pctNonZero(0.0005)).toBe("0.0005%");
    expect(fmt.pctNonZero(0)).toBe("0%");
  });
});

describe("what the browser gets of the price-list facts (data-schema §3.6, §3.6a)", async () => {
  const { buildIndicesBundle } = await import("./providers.server");
  const bundle = buildIndicesBundle();
  it("the indices bundle ships no line field the page does not read, and of the agreements only the site's named fund numbers", () => {
    const shipped = JSON.stringify(bundle.snapshots);
    for (const key of ["size_tiers", "max_per", "max_per_source", "max_deposit", "offset", "collection", "distribution_agreements"]) expect(shipped, key).not.toContain(`"${key}"`);
    const ff = bundle.snapshots.find((s) => s.id === "one-zero")!.fundByFund!;
    const site = new Set(bundle.funds.map((f) => f.identifiers.tase_number ?? f.id));
    expect(ff.named.length).toBeGreaterThan(0);
    for (const n of ff.named) expect(site.has(n), n).toBe(true);
    // the record keeps them all
    expect(latestSnapshots().find((s) => s.id === "one-zero")!.distribution_agreements!.reports.reduce((n, r) => n + r.funds.length, 0)).toBe(1767);
  });
  it("the deal's house templates ship no list of the lines they read, and the averages only the calculator's link", () => {
    for (const h of feesData().houses) {
      expect(h, h.id).not.toHaveProperty("read");
      if (h.averages) expect(Object.keys(h.averages.page)).toEqual(["url"]);
    }
  });
});

describe("the words around an average and the custody row's rules", async () => {
  const { houseAverage } = await import("../copy");
  const { RULES } = await import("./fee-deal/offers/rules");
  it("the figure's sheet says what BRK-33 says the average is over: individuals and small businesses, orders carried out, no derivatives", () => {
    expect(houseAverage.sheetLead).toContain("יחידים ועסקים קטנים");
    expect(houseAverage.sheetLead).toContain("שבוצעו");
    expect(houseAverage.sheetLead).toContain("נגזרים");
    expect(houseAverage.sheetLead).not.toContain("בכל הערוצים");
  });
  it("the general custody row cites the general rules, not one bank's", () => {
    expect(RULES.find((r) => r.id === "securities-custody")!.cite).toEqual(["BRK-16", "BRK-24"]);
  });
});

describe("a bound the list leaves open between currencies, on the company page", () => {
  it("Interactive Israel's European minimum names both readings and the dearer rule (BRK OQ25, D56)", () => {
    const line = brokeragePart("interactive-israel")!.tariff.lines.find((l) => l.id === "interactive-israel-buy-sell-europe")!;
    expect(line.min).toMatchObject({ unit: "text", value: "2.5 $ או £, לפי היקר" });
  });
});
