// Exchange rates on the site (decision D26): the ECB's daily euro reference rates, from data/series/ecb-fx.json.
// The person never types a rate. NIS per one unit of any currency is a cross rate (method F-84):
//   ILS per EUR / code per EUR   (EUR itself: ILS per EUR).
// This file is pure (it runs in the browser); fx.server.ts reads the series file.
import { crossRate, type Stretch } from "@finance-tool/engine";
import { isoCurrency } from "@finance-tool/schema";
import { asField, computed, entered, type SiteValue } from "./value";
import type { FormulaWorking } from "./working";
import { invest as investCopy, signatureFacts } from "../copy";
import { daysBetween } from "./dates";
import { fmt } from "./format";

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

const norm = (code: string) => isoCurrency(code).toUpperCase();

/** Plain number, NIS per one unit of `code`; null when the ECB has no rate for it. */
export function nisPerNumber(fx: FxSnapshot, code: string): number | null {
  return crossRate(fx.perEur, norm(code));
}

/** The engine's `fx` run input (F-63): shekels per one unit of every currency the ECB quotes, for tariff lines set in dollars or pounds. */
export function fxRunInput(fx: FxSnapshot): Record<string, number> {
  const out: Record<string, number> = {};
  for (const code of ["EUR", ...Object.keys(fx.perEur)]) {
    const n = nisPerNumber(fx, code);
    if (n !== null && code !== "ILS") out[code] = n;
  }
  return out;
}

/** The label the page shows beside a rate, e.g. "מחושב משערי הייחוס של הבנק המרכזי האירופי, 23.10.2026". */
export function fxLabel(fx: FxSnapshot): string {
  return signatureFacts.fxLabel(fmt.date(fx.date));
}

/**
 * NIS per one unit of the currency `code` (ISO 4217), as the site's computed value (state "computed", method F-84),
 * or null when the ECB has no rate for it. `today` is the run date (it decides the stale clock, D3).
 * The value's `about` is the short Hebrew label; `obligation` holds the ECB attribution its terms require, which the figure's sheet always
 * shows beside the ECB's file (provenance `Num`), and `notes` repeats.
 */
export function nisPer(fx: FxSnapshot, code: string, today: string): SiteValue | null {
  const n = nisPerNumber(fx, code);
  if (n === null) return null;
  const c = norm(code);
  // each ECB rate is stale once the series is older than its limit (D3); the rate computed from them carries it (`computed`)
  const stale = daysBetween(fx.date, today) > fx.staleAfterDays ? { since: fx.date, cadence: "daily" as const } : null;
  const source = (cur: string): SiteValue => ({
    value: fx.perEur[cur] ?? 1,
    unit: "fx_per_eur" as never,
    source: { url: fx.sourceUrl, title: "ECB euro foreign exchange reference rates (daily)", publisher: "הבנק המרכזי האירופי (ECB)", strength: "primary" },
    checked: fx.checked,
    effective_from: fx.date,
    effective_to: fx.date,
    update_rule: "market",
    state: "sourced",
    ...(stale ? { stale } : {}),
  });
  const inputs: Record<string, SiteValue> = { [signatureFacts.perEur("ILS")]: source("ILS") };
  if (c !== "EUR") inputs[signatureFacts.perEur(c)] = source(c);
  // the euro's and the shekel's own rates are no division (`S_EUR = E_ILS`, `S_ILS = 1`); any other currency's is the line F-84 draws
  const working = c === "EUR" || c === "ILS" ? undefined : crossRateWorking(c);
  return { ...computed(n, "nis", "F-84", inputs, { today, about: fxLabel(fx), notes: fx.attribution, ...(working ? { working } : {}) }), obligation: fx.attribution };
}

/** The ECB's month-end rates as shekels per dollar, oldest first (F-93; data/series/ecb-fx-month-end.json). */
export interface FxHistory {
  /** Each month end: shekels per dollar (`rate`, F-84's cross rate) and the two ECB rates it is computed from, units per one euro. */
  points: { date: string; rate: number; ils: number; usd: number }[];
  checked: string;
  attribution: string;
  sourceUrl: string;
  /** The series' source, as each of its observations carries it. */
  source: SiteValue["source"];
}

/**
 * Shekels per dollar at one month end of the history (F-84's cross rate), as the site's computed value: the ECB's two end-of-month rates,
 * dated as the series dates them, are its inputs, each with the series' source, so a change computed from it (F-93) traces to the ECB's
 * figures. `about` names the month.
 */
export function monthEndRate(history: FxHistory, point: FxHistory["points"][number], today: string, about: string): SiteValue {
  const ecb = (value: number): SiteValue => ({
    value,
    unit: "fx_per_eur" as never,
    source: history.source,
    checked: history.checked,
    effective_from: point.date,
    effective_to: point.date,
    update_rule: "market",
    state: "sourced",
  });
  // the ECB's terms of use require its attribution beside its rates (`obligation`), which the figure's sheet always shows
  const v = computed(point.rate, "nis", "F-84", { [signatureFacts.perEur("ILS")]: ecb(point.ils), [signatureFacts.perEur("USD")]: ecb(point.usd) }, { today, about, notes: history.attribution, working: crossRateWorking("USD") });
  return { ...v, obligation: history.attribution };
}

/** F-84's line, `S_c = E_ILS / E_c`, for a currency other than the shekel and the euro: each ECB rate by the input that holds it. */
function crossRateWorking(code: string): FormulaWorking {
  return { kind: "formula", entry: "F-84", line: 0, symbols: { [signatureFacts.perEur("ILS")]: String.raw`E_{\text{ILS}}`, [signatureFacts.perEur(code)]: "E_c" } };
}

type MonthEnd = FxHistory["points"][number];

/** A month end's shekels per dollar (F-84) as an input of a change of the dollar (F-93), under its month's name. */
function rateInput(history: FxHistory, p: MonthEnd, today: string): [string, SiteValue] {
  const label = investCopy.dollar.inputRate(fmt.period(p.date.slice(0, 7)));
  return [label, monthEndRate(history, p, today, label)];
}

/** A change of the dollar in percent (F-93) as the page shows it: to the hundredth. */
const dollarPct = (pct: number) => Math.round(pct * 100) / 100;

/**
 * F-93 (a) as the site's computed value: the dollar's change against the shekel in `year` (`pct`, the engine's, in percent), from the
 * previous December's rate and that year's, each an input, its sheet working out the line `r_Dec(y) / r_Dec(y−1) − 1`. A year the series
 * lacks either December for has no inputs.
 */
export function dollarYearChange(history: FxHistory, year: number, pct: number, today: string, about: string): SiteValue {
  const december = (y: number) => history.points.find((p) => p.date.startsWith(`${y}-12`));
  const a = december(year - 1), b = december(year);
  if (!a || !b) return computed(dollarPct(pct), "pct", "F-93", {}, { today, about });
  const [an, av] = rateInput(history, a, today);
  const [bn, bv] = rateInput(history, b, today);
  const working: FormulaWorking = { kind: "formula", entry: "F-93", line: 1, symbols: { [an]: String.raw`r_{\text{Dec}(y-1)}`, [bn]: String.raw`r_{\text{Dec}(y)}` } };
  return computed(dollarPct(pct), "pct", "F-93", { [an]: av, [bn]: bv }, { today, about, working });
}

/**
 * F-93 (b) as the site's computed value: the dollar's average yearly change over one stretch of the plan's years (`pct`, the engine's, in
 * percent), from the rates at its two month ends and the years (`years`: the plan's input's name, and the whole years the engine ran the
 * stretch on, which the line's H is), its sheet working out the line `(r_{t+12H} / r_t)^{1/H} − 1`.
 */
export function dollarStretchChange(history: FxHistory, stretch: Stretch<MonthEnd>, pct: number, years: readonly [name: string, h: number], today: string, about: string): SiteValue {
  const [sn, sv] = rateInput(history, stretch.start, today);
  const [en, ev] = rateInput(history, stretch.end, today);
  const working: FormulaWorking = { kind: "formula", entry: "F-93", line: 2, symbols: { [sn]: "r_t", [en]: "r_{t+12H}", [years[0]]: "H" } };
  return computed(dollarPct(pct), "pct", "F-93", { [sn]: sv, [en]: ev, [years[0]]: asField(entered(years[1], "years", today)) }, { today, about, working });
}
