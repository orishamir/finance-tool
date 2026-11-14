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
