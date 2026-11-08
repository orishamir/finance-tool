// The securities lib's own facts on the collected data: a stale tariff's clock and the provident wrappers' listing. The house
// ranking these tests covered went with its page; the index page's tests cover the ranking it does.
import { describe, expect, it } from "vitest";
import { staleTariff } from "./providers";
import { buildWorkbenchBundle } from "./providers.server";

const bundle = buildWorkbenchBundle();

describe("tariff age", () => {
  it("flags a tariff snapshot older than 90 days", () => {
    expect(staleTariff("2026-07-01", "2026-10-24")).toBe(true);
    expect(staleTariff("2026-10-23", "2026-10-24")).toBe(false);
    expect(staleTariff("2026-07-26", "2026-10-24")).toBe(false);
  });
});

describe("provident listing: one card per company, linked by the regulator's company id (A35)", () => {
  it("carries the company id the company page is addressed by, never the snapshot slug", async () => {
    const { buildProvidentListing, companyHref } = await import("./providers");
    const { loadCma } = await import("./data.server");
    const ids = new Set(loadCma().companies.map((c) => c.id));
    const listing = buildProvidentListing(bundle, "kupat-gemel-lehashkaa");
    expect(listing.cards.length).toBeGreaterThan(0);
    expect(new Set(listing.cards.map((c) => c.provider)).size).toBe(listing.cards.length);
    for (const c of listing.cards) {
      expect(c.lines.length).toBeGreaterThan(0);
      if (c.companyId) {
        expect(ids.has(c.companyId)).toBe(true);
        expect(companyHref(c)).toBe(`/companies/${c.companyId}`);
      }
    }
    const meitav = listing.cards.find((c) => c.provider === "meitav");
    expect(meitav?.companyId).toBe("512065202");
    // 2026-11-07: with Ayalon collected (31654e7c), every company the regulator lists for the product has a card: 12 of 12
    expect(listing.cards.length).toBe(listing.companies);
  });
});
