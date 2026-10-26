// What a track holds in shares and in foreign currency (F-87, F-88, D34): the company page's exposure rings and two rows of the track
// page. The loader sends each track's CMA amounts compacted against one template per group (as the fees are); this rebuilds them and
// computes the shares. Pure: no React, no storage.
import { currencyExposureShare, stockExposureShare } from "@finance-tool/engine";
import { company as copy } from "../copy";
import { fmt } from "./format";
import { compactFee, computed, expandFee, staleCma, type CompactFee, type SiteValue } from "./value";
import type { ValueObject } from "@finance-tool/schema";

/** A track's amounts of data-schema 3.13 `holdings`, NIS millions at the period end. */
export interface Holdings {
  total_assets: ValueObject;
  stock_market_exposure: ValueObject;
  foreign_currency_exposure?: ValueObject;
}

export interface HoldingsTemplate {
  assets: SiteValue;
  exposure: SiteValue;
  currency: SiteValue | null;
}

export interface CompactHoldings {
  assets: CompactFee;
  exposure: CompactFee;
  currency?: CompactFee;
}

/** The two shares of one track; either is null when its file has no such amount. */
export interface ExposureShares {
  stock: SiteValue | null;
  currency: SiteValue | null;
}

/** One group's template: the first track's amounts, with the monthly stale rule of the CMA data. Null when no track has them. */
export function holdingsTemplate(list: (Holdings | undefined)[], period: string, today: string): HoldingsTemplate | null {
  const first = list.find((h): h is Holdings => !!h);
  if (!first) return null;
  const stale = staleCma(period, today);
  const fx = list.find((h) => h?.foreign_currency_exposure)?.foreign_currency_exposure;
  return { assets: { ...first.total_assets, stale }, exposure: { ...first.stock_market_exposure, stale }, currency: fx ? { ...fx, stale } : null };
}

export function compactHoldings(h: Holdings | undefined, template: HoldingsTemplate | null): CompactHoldings | null {
  if (!h || !template) return null;
  const out: CompactHoldings = { assets: compactFee(h.total_assets, template.assets), exposure: compactFee(h.stock_market_exposure, template.exposure) };
  if (h.foreign_currency_exposure && template.currency) out.currency = compactFee(h.foreign_currency_exposure, template.currency);
  return out;
}

/**
 * One share as a computed site value over two sourced amounts. A share that cannot be computed is a value of null whose note says why:
 * an amount not reported, or assets of 0.
 */
function share(formula: "F-87" | "F-88", amount: SiteValue, assets: SiteValue, period: string, today: string): SiteValue {
  const reported = typeof assets.value === "number" && typeof amount.value === "number";
  const fn = formula === "F-87" ? stockExposureShare : currencyExposureShare;
  const value = reported ? fn(amount.value as number, assets.value as number) : null;
  const notes = value !== null ? copy.stock.note : reported ? copy.stock.noteNoAssets : copy.stock.noteMissing;
  const about = `${formula === "F-87" ? copy.stock.about : copy.stock.aboutCurrency} ${fmt.period(period)}`;
  const inputs: Record<string, SiteValue> = { [formula === "F-87" ? "stock_market_exposure" : "foreign_currency_exposure"]: amount, total_assets: assets };
  const v = computed(value, "pct", formula, inputs, { today, rules: [{ id: "CAT-24", strength: "primary" }], about, notes });
  return { ...v, stale: assets.stale ?? null };
}

/** F-87 and F-88 for one track; null only when the track's data file has no amounts at all. */
export function exposureShares(c: CompactHoldings | null, template: HoldingsTemplate | null, period: string, today: string): ExposureShares | null {
  if (!c || !template) return null;
  const assets = expandFee(c.assets, template.assets);
  const stock = share("F-87", expandFee(c.exposure, template.exposure), assets, period, today);
  const currency = c.currency && template.currency ? share("F-88", expandFee(c.currency, template.currency), assets, period, today) : null;
  return { stock, currency };
}

/**
 * A share as the page shows it: a whole percent, one decimal under 1% so a small exposure does not read as none (the sheet keeps the
 * exact figure). A share that could not be computed reads "לא דווח", or "אין נכסים" for a track that reported assets of 0.
 */
export function shareText(v: SiteValue): string {
  if (typeof v.value !== "number") return v.notes === copy.stock.noteNoAssets ? copy.stock.noAssets : copy.stock.missing;
  const pct = v.value;
  return fmt.pct(pct > 0 && pct < 1 ? Math.round(pct * 10) / 10 : Math.round(pct));
}

/** The share a ring draws, 0 to 100 (a figure above 100% fills the ring; its number says how much). Null draws an empty ring. */
export const ringFraction = (v: SiteValue | null): number => (v && typeof v.value === "number" ? Math.max(0, Math.min(100, v.value)) / 100 : 0);
