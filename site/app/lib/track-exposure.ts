// The share of a track's assets exposed to shares (F-87, D34): the company page's last column and a row of the track page. The
// loader sends each track's two CMA amounts compacted against one template per group (as the fees are); this rebuilds them and
// computes the share. Pure: no React, no storage.
import { stockExposureShare } from "@finance-tool/engine";
import { company as copy } from "../copy";
import { fmt } from "./format";
import { compactFee, computed, expandFee, staleCma, type CompactFee, type SiteValue } from "./value";
import type { ValueObject } from "@finance-tool/schema";

/** A track's two amounts of data-schema 3.13 `holdings`, NIS millions at the period end. */
export interface Holdings {
  total_assets: ValueObject;
  stock_market_exposure: ValueObject;
}

export interface HoldingsTemplate {
  assets: SiteValue;
  exposure: SiteValue;
}

export interface CompactHoldings {
  assets: CompactFee;
  exposure: CompactFee;
}

/** One group's template: the first track's amounts, with the monthly stale rule of the CMA data. Null when no track has them. */
export function holdingsTemplate(list: (Holdings | undefined)[], period: string, today: string): HoldingsTemplate | null {
  const first = list.find((h): h is Holdings => !!h);
  if (!first) return null;
  const stale = staleCma(period, today);
  return { assets: { ...first.total_assets, stale }, exposure: { ...first.stock_market_exposure, stale } };
}

export function compactHoldings(h: Holdings | undefined, template: HoldingsTemplate | null): CompactHoldings | null {
  if (!h || !template) return null;
  return { assets: compactFee(h.total_assets, template.assets), exposure: compactFee(h.stock_market_exposure, template.exposure) };
}

/**
 * F-87 as a computed site value over the two sourced amounts, null only when the track's data file has no amounts at all. A share
 * that cannot be computed is a value of null whose note says why: an amount not reported, or assets of 0.
 */
export function stockShare(c: CompactHoldings | null, template: HoldingsTemplate | null, period: string, today: string): SiteValue | null {
  if (!c || !template) return null;
  const assets = expandFee(c.assets, template.assets);
  const exposure = expandFee(c.exposure, template.exposure);
  const reported = typeof assets.value === "number" && typeof exposure.value === "number";
  const share = reported ? stockExposureShare(exposure.value as number, assets.value as number) : null;
  const notes = share !== null ? copy.stock.note : reported ? copy.stock.noteNoAssets : copy.stock.noteMissing;
  const v = computed(share, "pct", "F-87", { stock_market_exposure: exposure, total_assets: assets }, { today, rules: [{ id: "CAT-24", strength: "primary" }], about: `${copy.stock.about} ${fmt.period(period)}`, notes });
  return { ...v, stale: assets.stale ?? null };
}

/**
 * The share as the column shows it: a whole percent, one decimal under 1% so a small exposure does not read as none (the sheet keeps
 * the exact figure). A share that could not be computed reads "לא דווח", or "אין נכסים" for a track that reported assets of 0.
 */
export function stockShareText(v: SiteValue): string {
  if (typeof v.value !== "number") return v.notes === copy.stock.noteNoAssets ? copy.stock.noAssets : copy.stock.missing;
  const pct = v.value;
  return fmt.pct(pct > 0 && pct < 1 ? Math.round(pct * 10) / 10 : Math.round(pct));
}
