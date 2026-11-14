// Test bundles. The records print Interactive Israel's European minimum for euros, pounds and Swiss francs only (`trade_currencies`), so the
// indices page does not price a fund traded in dollars on a European exchange there (F-12). A test of a feature that rests on such a price (a
// recurring plan's purchases, a standing conversion, whole units, the stairs' numbers) reads that line as printed for any currency instead.
import type { BundleSnapshot } from "./providers";

/** The bundle with `houseId`'s lines read as printed for any currency: its `trade_currencies` left out. */
export function anyTradeCurrency<B extends { snapshots: BundleSnapshot[] }>(b: B, houseId = "interactive-israel"): B {
  const snapshots = b.snapshots.map((s) =>
    s.id !== houseId
      ? s
      : {
          ...s,
          lines: s.lines.map((l) => {
            const { trade_currencies: _t, ...rest } = l;
            return rest;
          }),
        },
  );
  return { ...b, snapshots };
}
