// What a provident track holds in shares and in foreign currency, from the regulator's own monthly figures (D34, 2026-10-26: the
// company page's exposure rings). Pure functions over two published amounts each; the page supplies the CMA fields.

/**
 * F-87 The share of a track's assets exposed to the stock market. `exposure` is the CMA's STOCK_MARKET_EXPOSURE and `assets` its
 * TOTAL_ASSETS, both in the same unit (NIS millions at the period end). Returns a percent, not rounded and not clamped: a track with
 * derivatives can report more than its assets. Null when the assets are not above 0.
 */
export function stockExposureShare(exposure: number, assets: number): number | null {
  return shareOfAssets(exposure, assets);
}

/**
 * F-88 The share of a track's assets exposed to foreign currency. `exposure` is the CMA's FOREIGN_CURRENCY_EXPOSURE and `assets` its
 * TOTAL_ASSETS, in the same unit. Returns a percent, not rounded and not clamped. Null when the assets are not above 0.
 */
export function currencyExposureShare(exposure: number, assets: number): number | null {
  return shareOfAssets(exposure, assets);
}

function shareOfAssets(exposure: number, assets: number): number | null {
  if (!(assets > 0)) return null;
  return (exposure / assets) * 100;
}
