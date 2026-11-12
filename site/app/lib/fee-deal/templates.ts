// Templates that fill a deal from the site's data (method §10.6: the site's price lists and tracks only fill a deal's fields, as a start
// the person edits): a house's price list for a securities account, the lines that apply to what the account holds, read by the engine's
// own line choice (`tariffLine`, F-63); and a regulated track's two fees for the provident family. A filled figure keeps its record's
// source and date (sourced) until the person changes it (entered, `retyped`).
import { lineClasses, memberKindOf, tariffLine, type LineChoice } from "@finance-tool/engine";
import type { FeesSnapshot, ValueObject } from "@finance-tool/schema";
import { HOUSE_CHANNELS } from "../providers";
import { depositFeeNoneByRule, type SiteValue } from "../value";
import type { FeesData, TrackLite } from "../fee-page-data";
import { trackFees } from "../fee-page-data";
import { isProductId, newDeal, newFeeId, type BoundCurrency, type Fee, type FeeDeal, type Months, type Num, type Price, type ProviderKind } from "./model";
import type { FeeKindId, Held } from "./shapes";
import { sourcedOf } from "./values";

/** A fee a template fills: a fee without its id in the deal. */
export type TemplateFee = Omit<Fee, "id">;

/** Why a line of a price list does not fill a deal's field: the deal has no field for it, or the line cannot be read here. */
export type LeftWhy =
  /** A price per share (F-12): a deal prices an action by its amount. */
  | "per-share"
  /** A conversion priced in shekels a dollar (F-13). */
  | "per-dollar"
  /** A charge in dollars for each corporate event (F-103): a deal's sum on an action is in shekels. */
  | "per-event-in-dollars"
  /** A flat price for a small order or conversion (F-12, F-13): the rate and bounds are filled, the flat price is not. */
  | "flat-price"
  /** A cap as a share of the trade (F-12): the rate and bounds are filled, the cap is not. */
  | "share-cap"
  /** A minimum and a maximum in two currencies, or a bound of a held share not in shekels. */
  | "bound-currency"
  /** Two lines apply and the price list does not say which (the snapshot is ambiguous). */
  | "ambiguous"
  /** A line with no value. */
  | "no-value"
  /** A share of what is held with a rate above nothing and no charging period: the deal cannot say how often it is charged (F-14). */
  | "no-period"
  /** A plan's own line (its `band`: a standing order, a recurring plan, a band of securities): a run reads it only for that plan (F-63). */
  | "plan"
  /** A line the price list prints that the house's documents do not show an ordinary customer can use (`not_ranked`, D41). */
  | "set-aside"
  /** Another line of the same base is the one a run reads for the holding (F-13's own currency, the narrower class; F-63). */
  | "another-line"
  /** A base a house's template does not fill. */
  | "other-base";

/**
 * Where a fund is bought, as a template keys its fees: `israel` on the Tel Aviv exchange, where no conversion is priced; `abroad` in a
 * currency the price list prints no conversion line of its own for; `abroad:USD` in a currency it does.
 */
export type HoldingKey = "israel" | "abroad" | `abroad:${string}`;

/** One house's price list as a template: the fees it fills for each holding, and the lines it leaves, with why. */
export interface HouseTemplate {
  /** The provider id of the snapshot (`leumi`). */
  id: string;
  /** The snapshot's date, YYYY-MM-DD. */
  snapshot: string;
  name: string;
  provider: ProviderKind;
  holdings: Partial<Record<HoldingKey, { channel: string | null; fees: TemplateFee[]; left: { lineId: string; why: LeftWhy }[] }>>;
}

/** The security class a holding's lines are read for: an Israeli exchange-traded fund on the Tel Aviv exchange, a foreign security abroad. */
const classOf = (place: Held["place"]): string => (place === "israel" ? "etf_units" : "foreign_securities");

const PERIOD_MONTHS: Record<string, Months> = { month: 1, quarter: 3, year: 12 };
const NIS_UNITS = new Set(["nis", "nis_per_trade", "nis_per_month", "nis_per_transfer"]);
const CURRENCY_OF_UNIT: Partial<Record<ValueObject["unit"], BoundCurrency>> = { nis: "ILS", nis_per_trade: "ILS", nis_per_month: "ILS", usd: "USD", usd_per_trade: "USD", eur: "EUR", gbp_per_trade: "GBP" };

type Line = FeesSnapshot["lines"][number];
type Mapped = { fees: TemplateFee[]; left: LeftWhy[] };

const has = (v: ValueObject | null | undefined): v is ValueObject & { value: number } => !!v && typeof v.value === "number";

/** A price of a share of an action from a line: its rate, and its bounds in their own currency (F-12, F-13). */
function actionPrice(l: Line, num: (v: ValueObject) => Num): { price: Price } | { left: LeftWhy } {
  if (!has(l.rate)) return { left: "no-value" };
  const bounds = [l.min, l.max].filter(has);
  const currencies = new Set(bounds.map((b) => CURRENCY_OF_UNIT[b.unit]));
  if (currencies.has(undefined) || currencies.size > 1) return { left: "bound-currency" };
  const currency = [...currencies][0];
  return {
    price: {
      form: "action",
      rate: num(l.rate),
      ...(has(l.min) ? { min: num(l.min) } : {}),
      ...(has(l.max) ? { max: num(l.max) } : {}),
      ...(currency && currency !== "ILS" ? { currency } : {}),
    },
  };
}

/** The deal's fees a price list line fills, and what of it is left (F-12 to F-17). */
export function lineFees(l: Line, own: string): Mapped {
  const num = (v: ValueObject): Num => ({ v: v.value as number, src: sourcedOf(v, own) });
  const fee = (kind: FeeKindId, price: Price): TemplateFee => ({ kind, stages: [{ price }] });
  switch (l.base) {
    case "trade": {
      if (l.rate.unit === "usd_per_share") return { fees: [], left: ["per-share"] };
      const p = actionPrice(l, num);
      if ("left" in p) return { fees: [], left: [p.left] };
      return { fees: [fee("trade", p.price)], left: [...(l.flat_up_to ? (["flat-price"] as const) : []), ...(l.cap ? (["share-cap"] as const) : [])] };
    }
    case "fx": {
      if (l.rate.unit === "nis_per_usd") return { fees: [], left: ["per-dollar"] };
      const p = actionPrice(l, num);
      if ("left" in p) return { fees: [], left: [p.left] };
      // F-13 (D65): a spread the price list limits is priced at its ceiling beside the conversion fee
      const spread = has(l.spread) && l.spread.value > 0 ? [fee("fx_spread", { form: "action", rate: num(l.spread) })] : [];
      return { fees: [fee("fx", p.price), ...spread], left: l.flat_up_to ? ["flat-price"] : [] };
    }
    case "custody": {
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      // a zero rate prints no period (One Zero's "0 אחוז"): it charges nothing whatever the period is; a rate above it needs one
      if (!l.period && l.rate.value > 0) return { fees: [], left: ["no-period"] };
      const every = l.period ? PERIOD_MONTHS[l.period]! : 1;
      const bounds = [l.min, l.max].filter(has);
      if (bounds.some((b) => !NIS_UNITS.has(b.unit))) return { fees: [], left: ["bound-currency"] };
      // F-14: a bound printed per month is per charging period here
      const perCharge = (b: ValueObject & { value: number }): Num => ({ v: b.value * (b.unit === "nis_per_month" ? every : 1), src: sourcedOf(b, own) });
      return { fees: [fee("custody", { form: "held", rate: num(l.rate), per: every, every, ...(has(l.min) ? { min: perCharge(l.min) } : {}), ...(has(l.max) ? { max: perCharge(l.max) } : {}) })], left: [] };
    }
    case "fixed_period":
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      return { fees: [fee("fixed_period", { form: "sum", amount: num(l.rate), every: l.period ? PERIOD_MONTHS[l.period]! : 1 })], left: [] };
    case "transfer_out":
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      if (!NIS_UNITS.has(l.rate.unit)) return { fees: [], left: ["bound-currency"] };
      return { fees: [fee("transfer_out", { form: "perAction", amount: num(l.rate) })], left: [] };
    case "corporate_event":
      return { fees: [], left: ["per-event-in-dollars"] };
    default:
      return { fees: [], left: ["other-base"] };
  }
}

/**
 * A line of the distribution fee a fund's manager pays the bank that distributes it, a yearly share of the fund's assets (MF-24): the
 * fund pays it, not the account, so it is no fee of the deal and is neither filled nor listed as left out.
 */
const managersDistributionFee = (l: Line): boolean => l.base === "distribution_handling" && l.rate.unit === "pct_of_balance_per_period";

/**
 * Whether a price list line applies to a holding as the run's line choice reads it (`tariffLine`, F-63): a list line in the holding's
 * channel (or none) that names its class, the account or `all` and does not exclude the class; a conversion line only for a holding bought
 * abroad in another currency, and one printed for a currency only for a holding in that currency (F-13).
 */
function appliesTo(l: Line, place: Held["place"], currency: string | null, channel: string): boolean {
  const classes = lineClasses(classOf(place));
  if (l.level !== "list" || (l.channel !== null && l.channel !== channel)) return false;
  if (!l.applies_to.some((a) => a === "all" || a === "brokerage-account" || classes.includes(a)) || (l.excludes ?? []).some((x) => classes.includes(x))) return false;
  if (l.base === "fx") return place === "abroad" && currency !== null && (!l.conversion_currency || l.conversion_currency === currency);
  return true;
}

/** Why a line that applies to the holding is not the one a run reads for its base: set aside, a plan's own, or another line's base. */
const whyNotRead = (l: Line): LeftWhy => (l.not_ranked !== undefined ? "set-aside" : l.band !== null ? "plan" : "another-line");

/** The bases a house's price list fills a securities account's deal with, in the order the deal lists them. */
const HOUSE_BASES = ["trade", "custody", "fixed_period", "fx", "transfer_out", "corporate_event"] as const;

/**
 * One holding's fees from a house's price list: the channel is the first of `HOUSE_CHANNELS` with a trade line for the holding's class;
 * every base's list line is the one a run reads (`tariffLine`); a conversion only where the holding is bought abroad in another currency.
 */
function holdingFees(snap: FeesSnapshot, place: Held["place"], currency: string | null): HouseTemplate["holdings"][HoldingKey] {
  const choice = (channel: string): LineChoice => ({ instrumentClass: classOf(place), wrapper: "brokerage-account", channel, ...(currency ? { currency: { code: currency } } : {}) });
  const tryLine = (channel: string, base: Line["base"]): Line | undefined | "ambiguous" => {
    try {
      return tariffLine(snap, choice(channel), base, "list");
    } catch {
      return "ambiguous";
    }
  };
  const channel = HOUSE_CHANNELS.find((c) => {
    const t = tryLine(c, "trade");
    return t !== undefined && t !== "ambiguous";
  });
  if (!channel) return undefined;
  const fees: TemplateFee[] = [];
  const left: { lineId: string; why: LeftWhy }[] = [];
  const read = new Set<string>();
  const ambiguous = new Set<string>();
  for (const base of HOUSE_BASES) {
    if (base === "fx" && (place === "israel" || currency === null)) continue;
    const l = tryLine(channel, base);
    if (l === undefined) continue;
    if (l === "ambiguous") {
      ambiguous.add(base);
      left.push({ lineId: base, why: "ambiguous" });
      continue;
    }
    read.add(l.id);
    const m = lineFees(l, snap.provider.name_he);
    fees.push(...m.fees);
    left.push(...m.left.map((why) => ({ lineId: l.id, why })));
  }
  // every other line that applies to the holding is listed with why it fills nothing, so no line is left out unsaid
  for (const l of snap.lines) {
    if (read.has(l.id) || ambiguous.has(l.base) || managersDistributionFee(l) || !appliesTo(l, place, currency, channel)) continue;
    left.push({ lineId: l.id, why: (HOUSE_BASES as readonly string[]).includes(l.base) ? whyNotRead(l) : "other-base" });
  }
  const usesChannel = snap.lines.some((l) => l.channel !== null);
  return { channel: usesChannel ? channel : null, fees, left };
}

/**
 * A house's price list as a template for a securities account (built at build time from the house's latest snapshot, its lines limited to
 * what the house's documents show a person can hold, `onlyWhatCanBeDone`): the fees for a fund bought in Israel, abroad in a currency
 * the list has a conversion line of its own for, and abroad in any other.
 */
export function houseTemplate(snap: FeesSnapshot): HouseTemplate {
  const holdings: HouseTemplate["holdings"] = {};
  const israel = holdingFees(snap, "israel", null);
  if (israel) holdings.israel = israel;
  // a currency no line names: the conversion line with no currency prices it (F-13)
  const other = holdingFees(snap, "abroad", "XXX");
  if (other) holdings.abroad = other;
  for (const code of new Set(snap.lines.flatMap((l) => (l.conversion_currency ? [l.conversion_currency] : [])))) {
    const own = holdingFees(snap, "abroad", code);
    if (own) holdings[`abroad:${code}`] = own;
  }
  return { id: snap.id, snapshot: snap.snapshot, name: snap.provider.name_he, provider: memberKindOf(snap.provider.class), holdings };
}

/** The holding a deal's template reads: Israel, abroad in a currency with its own line, or abroad in any other; with no conversion in shekels. */
export function holdingOf(template: HouseTemplate, held: Held): HouseTemplate["holdings"][HoldingKey] {
  if (held.place === "israel") return template.holdings.israel;
  const own = template.holdings[`abroad:${held.currency}`];
  const h = own ?? template.holdings.abroad;
  if (!h || held.currency !== "ILS") return h;
  return { ...h, fees: h.fees.filter((f) => f.kind !== "fx" && f.kind !== "fx_spread") };
}

/** The holding a template reads where the deal does not say what it holds: a fund bought in Israel, in shekels, that accumulates. */
export const HELD_UNSAID: Held = { place: "israel", currency: "ILS", payout: "accumulating" };

/**
 * A regulated track's fees as a template (CMA averages, F-68's source): its yearly fee on the savings, charged each month (F-15), and its
 * fee on each deposit. An empty deposit fee of a product that may charge none (PF-06) and a fee the regulator's data lacks fill nothing.
 */
export function trackTemplateFees(track: TrackLite, data: Pick<FeesData, "templates">, today: string): TemplateFee[] {
  const fees = trackFees(track, data, today);
  if (!fees) return [];
  const num = (v: SiteValue): Num => ({ v: v.value as number, src: sourcedOf(v) });
  const out: TemplateFee[] = [];
  if (typeof fees.balance.value === "number" && fees.balance.value >= 0) out.push({ kind: "balance", stages: [{ price: { form: "held", rate: num(fees.balance), per: 12, every: 1 } }] });
  if (typeof fees.deposit.value === "number" && fees.deposit.value >= 0 && !depositFeeNoneByRule(fees.deposit)) out.push({ kind: "deposit", stages: [{ price: { form: "action", rate: num(fees.deposit) } }] });
  return out;
}

// ---------------------------------------------------------------- the picker, and filling a deal

/** A template a picker offers for a kind: a house's price list, or a track (with its company, to group by). */
export type TemplateOption = { id: string; name: string; source: "house" } | { id: string; name: string; source: "track"; company: string };

const houseId = (h: HouseTemplate) => `house:${h.id}`;
const trackId = (t: TrackLite) => `track:${t.id}`;

/**
 * The templates for a kind, for a picker: every house's price list for a securities account; every track the regulator's data maps to the
 * kind, for the provident family. Other kinds have none.
 */
export function templateOptions(kind: FeeDeal["kind"], data: Pick<FeesData, "houses" | "tracks">): TemplateOption[] {
  if (kind === "brokerage-account") return data.houses.map((h) => ({ id: houseId(h), name: h.name, source: "house" }));
  if (kind === null) return [];
  return data.tracks.filter((t) => t.wrapperId === kind).map((t) => ({ id: trackId(t), name: t.name, source: "track", company: t.company }));
}

/** A template's fees for a deal: a house's for what the deal holds, a track's two. Null where the id names no template of the deal's kind. */
export function templateFees(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): { name: string; fees: TemplateFee[]; provider?: ProviderKind } | null {
  if (id.startsWith("house:") && deal.kind === "brokerage-account") {
    const h = data.houses.find((x) => houseId(x) === id);
    if (!h) return null;
    return { name: h.name, fees: holdingOf(h, deal.held ?? HELD_UNSAID)?.fees ?? [], provider: h.provider };
  }
  if (id.startsWith("track:")) {
    const t = data.tracks.find((x) => trackId(x) === id);
    if (!t || t.wrapperId !== deal.kind) return null;
    return { name: `${t.name} (${t.company})`, fees: trackTemplateFees(t, data, today) };
  }
  return null;
}

/**
 * A deal filled from a template: each fee the template has replaces the deal's fee of that kind (keeping its place and id) or is added
 * after the others; the deal's other fees stay. The template's provider kind is the deal's, and the deal names the template.
 * Null where the id names no template of the deal's kind.
 */
export function fillDeal(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = templateFees(deal, id, data, today);
  if (!t) return null;
  let fees = [...deal.fees];
  for (const f of t.fees) {
    const at = fees.findIndex((x) => x.kind === f.kind);
    if (at >= 0) fees[at] = { ...f, id: fees[at]!.id };
    else fees = [...fees, { ...f, id: newFeeId() }];
  }
  return { ...deal, fees, template: { id, name: t.name }, ...(t.provider ? { provider: t.provider } : {}) };
}

/** One fee of a deal filled from a template's fee of the same kind; the deal unchanged where the template has none. */
export function fillFee(deal: FeeDeal, feeId: string, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal {
  const fee = deal.fees.find((f) => f.id === feeId);
  const t = templateFees(deal, id, data, today);
  const from = fee && t?.fees.find((f) => f.kind === fee.kind);
  if (!fee || !from) return deal;
  return { ...deal, fees: deal.fees.map((f) => (f.id === feeId ? { ...from, id: feeId } : f)) };
}

/** A new deal of a track's kind, filled from the track (`/fees?track=`); null where the track maps to no product id. */
export function dealFromTrack(fundId: number, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = data.tracks.find((x) => x.id === fundId);
  if (!t?.wrapperId || !isProductId(t.wrapperId)) return null;
  return fillDeal(newDeal(t.wrapperId), trackId(t), data, today);
}
