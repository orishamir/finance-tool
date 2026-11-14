// A fee's rate as the price list prints it, for the line of the index page's receipt that says what the account charged: the very
// record lines the calculation priced for this fund (`PairCosts.priced`: the venue, the standing order or the trade, read as the engine
// read them), never a figure from elsewhere. Only what the record says plainly is said, a flat price for an order or a conversion up to a sum
// among it (F-12, F-13: the list prints both prices, and the line says both); where a line cannot be stated without reading into it (two lines
// where the run priced one way or another, a bound in a unit the line does not explain, an offer's price for a first stretch, prices the person
// typed), the answer is null and the receipt shows the amount with no rate under it.
import { REDEMPTION_BAND, STANDING_CONVERSION_BAND, STANDING_ORDER_BAND, type FeeLine } from "@finance-tool/engine";
import type { FeesSnapshot } from "@finance-tool/schema";
import type { PairCosts } from "./invest";

type SnapLine = FeesSnapshot["lines"][number];
type Figure = NonNullable<SnapLine["rate"]>;

/** What a rate is of: each trade (a share of it, or an amount for it), each share, each conversion, or a period of the balance. */
export type RatePer = "trade" | "eachTrade" | "share" | "conversion" | "month" | "quarter" | "year";

/** One figure of a rate as the record prints it: the rate itself, a bound, a ceiling as a share of the trade, a flat price up to a sum, a conversion spread. */
export interface RatePart {
  kind: "rate" | "min" | "max" | "cap" | "flat" | "spread";
  value: Figure;
  /** A flat price's sum: an order or a conversion up to it pays `value` (the record's `flat_up_to`). */
  upTo?: Figure;
  /** What the figure is of; null where its unit already says it ("1.5 אגורות לדולר") or where a bound needs no word. */
  per: RatePer | null;
}

/** The rate of one record line: its parts in order, and whether it is the line for a purchase by standing order (said before it). */
export interface RateWords {
  standing: boolean;
  parts: RatePart[];
}

/** The record's base for each line of the account's cost; a line with none (the current account) is read apart. */
const BASE: Partial<Record<FeeLine, SnapLine["base"]>> = { trade: "trade", custody: "custody", fx: "fx", fixed: "fixed_period" };

const num = (v: Figure | null | undefined): v is Figure => !!v && typeof v.value === "number";
/** A bound printed: null and a value of null are no bound (the engine reads them so). */
const bound = (v: Figure | null | undefined): Figure | null => (num(v) ? v : null);

/** Bounds of a trade or a conversion that read as "for each one" beside a rate that says so: shekels, dollars, euros or pounds. */
const PER_ORDER = new Set(["nis", "nis_per_trade", "usd", "usd_per_trade", "eur", "gbp_per_trade", "trade_ccy_per_trade", "dearer_ccy_per_trade"]);

/** A flat price for an order or a conversion up to a sum, in the line's own currency (F-12, F-13); none where the line has none. */
function flatPart(l: SnapLine, per: RatePer): RatePart[] | null {
  const f = l.flat_up_to;
  if (!f) return [];
  if (!num(f.amount) || !num(f.up_to) || !PER_ORDER.has(f.amount.unit) || !PER_ORDER.has(f.up_to.unit)) return null;
  return [{ kind: "flat", value: f.amount, upTo: f.up_to, per }];
}

/** A trade line: a share of the trade, an amount for it or an amount a share, with its bounds, its ceiling and its flat price for a small order. */
function tradeParts(l: SnapLine): RatePart[] | null {
  if (!num(l.rate)) return null;
  const per: RatePer | null = l.rate.unit === "pct_of_trade" ? "trade" : l.rate.unit === "nis_per_trade" ? "eachTrade" : l.rate.unit === "usd_per_share" ? "share" : null;
  if (!per) return null;
  const parts: RatePart[] = [{ kind: "rate", value: l.rate, per }];
  for (const kind of ["min", "max"] as const) {
    const b = bound(l[kind]);
    if (!b) continue;
    if (kind === "max" && b.unit === "pct_of_trade") parts.push({ kind: "cap", value: b, per: null });
    else if (PER_ORDER.has(b.unit)) parts.push({ kind, value: b, per: null });
    else return null;
  }
  const cap = bound(l.cap);
  if (cap) {
    if (cap.unit !== "pct_of_trade") return null;
    parts.push({ kind: "cap", value: cap, per: null });
  }
  const flat = flatPart(l, "eachTrade");
  return flat ? [...parts, ...flat] : null;
}

/** A custody line: a share of the balance for its period, with bounds for that period or a month; null for a bound in any other unit. */
function custodyParts(l: SnapLine): RatePart[] | null {
  if (!num(l.rate) || l.rate.unit !== "pct_of_balance_per_period") return null;
  // a zero rate prints no period (the engine reads it so): it charges nothing whatever the period is
  const period = l.period ?? null;
  if (!period && l.rate.value !== 0) return null;
  const parts: RatePart[] = [{ kind: "rate", value: l.rate, per: period }];
  for (const kind of ["min", "max"] as const) {
    const b = bound(l[kind]);
    if (!b) continue;
    if (b.unit === "nis_per_month") parts.push({ kind, value: b, per: "month" });
    else if (b.unit === "nis" && period) parts.push({ kind, value: b, per: period });
    else return null;
  }
  return parts;
}

/** A conversion line: a share of the amount converted or agorot a dollar, its bounds, its flat price for a small conversion, and the spread the list limits. */
function fxParts(l: SnapLine): RatePart[] | null {
  if (!num(l.rate)) return null;
  const per: RatePer | null | undefined = l.rate.unit === "pct_of_trade" ? "conversion" : l.rate.unit === "nis_per_usd" ? null : undefined;
  if (per === undefined) return null;
  const parts: RatePart[] = [{ kind: "rate", value: l.rate, per }];
  for (const kind of ["min", "max"] as const) {
    const b = bound(l[kind]);
    if (!b) continue;
    if (!PER_ORDER.has(b.unit)) return null;
    parts.push({ kind, value: b, per: null });
  }
  const flat = flatPart(l, "conversion");
  if (!flat) return null;
  parts.push(...flat);
  const spread = bound(l.spread);
  if (spread) {
    if (spread.unit !== "pct_of_trade") return null;
    parts.push({ kind: "spread", value: spread, per: null });
  }
  return parts;
}

/** A fixed fee: shekels for its period (a month where the list prints none). */
function fixedParts(l: SnapLine): RatePart[] | null {
  if (!num(l.rate)) return null;
  if (l.rate.unit === "nis_per_month") return [{ kind: "rate", value: l.rate, per: l.period ?? "month" }];
  if (l.rate.unit === "nis" && l.period) return [{ kind: "rate", value: l.rate, per: l.period }];
  return null;
}

const PARTS: Record<string, (l: SnapLine) => RatePart[] | null> = { trade: tradeParts, custody: custodyParts, fx: fxParts, fixed_period: fixedParts };

/**
 * The rate of one line of the account's cost, as the price list prints it, from the lines the run priced; null where it cannot be said
 * plainly. `monthly`: the plan's monthly deposit; at 0 no purchase runs on a standing order, so that line is not said.
 */
export function rateWords(line: FeeLine, priced: PairCosts["priced"], monthly: number): RateWords[] | null {
  if (priced.entered) return null;
  if (line === "account") {
    // the bank's current account (F-102): its monthly minimum, the figure the run counts
    const m = priced.currentAccount?.monthly_minimum;
    return num(m) && m.unit === "nis_per_month" ? [{ standing: false, parts: [{ kind: "min", value: m, per: "month" }] }] : null;
  }
  const base = BASE[line];
  if (!base) return null;
  const lines = priced.lines.filter((l) => l.base === base);
  // a redemption line prices another kind of sale (makam): which of the two a sale ran on is not said by the lines alone
  if (lines.some((l) => l.band === REDEMPTION_BAND)) return null;
  const isStanding = (l: SnapLine) => l.band === STANDING_ORDER_BAND || l.band === STANDING_CONVERSION_BAND;
  const regular = lines.filter((l) => !isStanding(l));
  const standing = monthly > 0 ? lines.filter(isStanding) : [];
  if (regular.length !== 1 || standing.length > 1) return null;
  const out: RateWords[] = [];
  for (const l of [...standing, ...regular]) {
    // a price for a first stretch that reverts to another (an offer): one rate in words would leave out the other and when it changes
    if (l.discount_months || l.reverts_to || l.offer_he) return null;
    const parts = PARTS[base]!(l);
    if (!parts) return null;
    out.push({ standing: isStanding(l), parts });
  }
  return out;
}
