// The head line of each regulator figure the track browser ships (copy.cmaAbout): set on every product's templates and kept by each
// track's figure when it is expanded from them, over the real October 2026 tracks (data/cma/).
import { describe, expect, it } from "vitest";
import { cmaAbout } from "../copy";
import { buildTrackBrowser } from "./track-browser.server";
import { expandFee } from "./value";

const data = buildTrackBrowser();
const found = data.products.find((p) => p.id === "kupat-gemel-lehashkaa");
if (!found) throw new Error("the track browser has no kupat gemel lehashkaa");
const gemel = found;
const month = "אוקטובר 2026";

describe("the regulator figures' head lines", () => {
  it("each template says what its figure is: a fee with its year, an amount or a yield with its month", () => {
    const { balance, deposit, holdings, y3, y5 } = gemel.templates;
    expect(gemel.period).toBe("2026-10");
    expect(balance.about).toBe(cmaAbout.avg_annual_management_fee("2025"));
    expect(deposit.about).toBe(cmaAbout.avg_deposit_fee("2025"));
    expect(holdings?.assets.about).toBe(cmaAbout.total_assets(month));
    expect(holdings?.exposure.about).toBe(cmaAbout.stock_market_exposure(month));
    expect(holdings?.currency?.about).toBe(cmaAbout.foreign_currency_exposure(month));
    expect(y3?.about).toBe(cmaAbout.avg_annual_yield_3y(month));
    expect(y5?.about).toBe(cmaAbout.avg_annual_yield_5y(month));
  });

  it("every product's templates carry them", () => {
    for (const p of data.products) {
      expect(p.templates.balance.about, p.id).toBeTruthy();
      expect(p.templates.deposit.about, p.id).toBeTruthy();
    }
  });

  it("a track's own figure keeps its template's line, its missing figures included", () => {
    for (const row of gemel.rows) {
      expect(expandFee(row.b, gemel.templates.balance).about).toBe(gemel.templates.balance.about);
      const y3 = gemel.templates.y3;
      if (row.y3 && y3) expect(expandFee(row.y3, y3).about).toBe(cmaAbout.avg_annual_yield_3y(month));
    }
  });

  it("the fee year's own value does not take the fee's line", () => {
    expect(data.feeYear?.about).toBeUndefined();
  });
});
