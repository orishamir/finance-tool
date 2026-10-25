// Exchange rates on the site (decision D26): the ECB's daily euro reference rates, from data/series/ecb-fx.json.
// The person never types a rate. NIS per one unit of any currency is a cross rate (method F-84):
//   ILS per EUR / code per EUR   (EUR itself: ILS per EUR).
// This file is pure (it runs in the browser); fx.server.ts reads the series file.
import { crossRate } from "@finance-tool/engine";
import { computed, type SiteValue } from "./value";

/** The ECB series as the pages carry it: the reference day, every currency per one euro, and the source. */
export interface FxSnapshot {
  /** The ECB reference day, YYYY-MM-DD. */
  date: string;
  /** The day the file was read. */
  checked: string;
  /** Units of each currency per one euro (EUR itself is 1 and need not be listed). */
  perEur: Record<string, number>;
  /** The ECB's attribution line (terms of use: cite the ECB, state modifications). */
  attribution: string;
  /** Days after which the rates count as stale. */
  staleAfterDays: number;
  sourceUrl: string;
}

const ILS = ["ILS", "NIS"];
const norm = (code: string) => (ILS.includes(code) ? "ILS" : code.toUpperCase());

/** Whole days between two YYYY-MM-DD dates. */
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/** `23.10.2026` from `2026-10-23`. */
const dmy = (iso: string) => iso.split("-").reverse().join(".");

/** The ECB prints no rate for this code (or no shekel rate): the site cannot price a fund in it. */
export function hasRate(fx: FxSnapshot, code: string): boolean {
  const c = norm(code);
  return c === "EUR" ? "ILS" in fx.perEur : c in fx.perEur && "ILS" in fx.perEur;
}

/** Plain number, NIS per one unit of `code`; null when the ECB has no rate for it. */
export function nisPerNumber(fx: FxSnapshot, code: string): number | null {
  return crossRate(fx.perEur, norm(code));
}

/** The label the page shows beside a rate, e.g. "מחושב משערי הייחוס של הבנק המרכזי האירופי, 23.10.2026". */
export function fxLabel(fx: FxSnapshot): string {
  return `מחושב משערי הייחוס של הבנק המרכזי האירופי, ${dmy(fx.date)}`;
}

/**
 * NIS per one unit of the currency `code` (ISO 4217), as the site's computed value (state "computed", method F-84),
 * or null when the ECB has no rate for it. `today` is the run date (it decides the stale clock, D3).
 * The value's `about` is the short Hebrew label; `notes` repeats the ECB attribution.
 */
export function nisPer(fx: FxSnapshot, code: string, today: string): SiteValue | null {
  const n = nisPerNumber(fx, code);
  if (n === null) return null;
  const c = norm(code);
  const source = (cur: string): SiteValue => ({
    value: fx.perEur[cur] ?? 1,
    unit: "fx_per_eur" as never,
    source: { url: fx.sourceUrl, title: "ECB euro foreign exchange reference rates (daily)", publisher: "הבנק המרכזי האירופי (ECB)", strength: "primary" },
    checked: fx.checked,
    effective_from: fx.date,
    effective_to: fx.date,
    update_rule: "market",
    state: "sourced",
  });
  const inputs: Record<string, SiteValue> = { [`ILS לאירו`]: source("ILS") };
  if (c !== "EUR") inputs[`${c} לאירו`] = source(c);
  const v = computed(n, "nis", "F-84", inputs, { today, about: fxLabel(fx), notes: fx.attribution });
  const stale = daysBetween(fx.date, today) > fx.staleAfterDays ? { since: fx.date, cadence: "daily" as const } : null;
  return { ...v, stale };
}

/**
 * The quotation unit the page prints: shekels per 100 for a currency that is worth a fraction of a shekel (JPY),
 * per 1 otherwise. `value` is NIS for `per` units.
 */
export function nisPerQuoted(fx: FxSnapshot, code: string): { per: 1 | 100; value: number } | null {
  const n = nisPerNumber(fx, code);
  if (n === null) return null;
  return n < 0.1 ? { per: 100, value: n * 100 } : { per: 1, value: n };
}
