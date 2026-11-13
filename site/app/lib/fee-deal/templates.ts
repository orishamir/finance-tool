// Templates that fill a deal from the site's data (method §10.6: the site's price lists and tracks only fill a deal's fields, as a start
// the person edits): a house's price list for a securities account, the lines that apply to what the account holds, read by the engine's
// own line choice (`tariffLine`, F-63); and a regulated track's two fees for the provident family. A filled figure keeps its record's
// source and date (sourced) until the person changes it (entered, `retyped`).
import { lineClasses, memberKindOf, REDEMPTION_BAND, STANDING_ORDER_BAND, tariffLine, type LineChoice } from "@finance-tool/engine";
import type { FeesSnapshot, ValueObject } from "@finance-tool/schema";
import { HOUSE_CHANNELS } from "../providers";
import { depositFeeNoneByRule, type SiteValue } from "../value";
import type { FeesData, TrackLite } from "../fee-page-data";
import { trackFees } from "../fee-page-data";
import { isProductId, NAME_MAX, newDeal, newFeeId, pricePriced, untouched, type BoundCurrency, type Fee, type FeeDeal, type Flat, type Months, type Num, type Price, type ProviderKind } from "./model";
import { priceView, type PriceView } from "./parts";
import type { FeeKindId, Held } from "./shapes";
import { sourcedOf } from "./values";

/** A fee a template fills: a fee without its id in the deal. */
export type TemplateFee = Omit<Fee, "id">;

/** Why a line of a price list does not fill a deal's field: the deal has no field for it, or the line cannot be read here. */
export type LeftWhy =
  /** A conversion priced in shekels a dollar (F-13). */
  | "per-dollar"
  /** A line's sums in two currencies (its bounds, its flat price, its price per unit), or a bound of a held share not in shekels. */
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

/**
 * One way to buy at a house where its price list prints several for a holding (a plan, the line's `band`: Interactive Brokers' IBKR Pro
 * Fixed and Tiered on each exchange, an investment house's US tracks, its US and European lines): the trade line it reads (`line`, its id),
 * its name in the price list's words (`name`: the band, or the line's own name where it has none), and the trade fee it fills with what of
 * the line is left.
 */
export interface HousePlan {
  line: string;
  name: string;
  fees: TemplateFee[];
  left: LeftWhy[];
}

/**
 * The fees a house's price list fills for one holding, read in one channel, and the lines it leaves with why. Where the list prints more
 * than one way to buy the holding (`plans`, two or more), the trade fee is each plan's: `fees` has the list's standard trade line where it
 * prints one, and otherwise no trade fee and the trade left as `ambiguous`.
 */
export interface HoldingTemplate {
  channel: string | null;
  fees: TemplateFee[];
  left: { lineId: string; why: LeftWhy }[];
  plans?: HousePlan[];
}

/** One house's price list as a template: the fees it fills for each holding, and the lines it leaves, with why. */
export interface HouseTemplate {
  /** The provider id of the snapshot (`leumi`). */
  id: string;
  /** The snapshot's date, YYYY-MM-DD. */
  snapshot: string;
  name: string;
  provider: ProviderKind;
  holdings: Partial<Record<HoldingKey, HoldingTemplate>>;
}

/** The security class a holding's lines are read for: an Israeli exchange-traded fund on the Tel Aviv exchange, a foreign security abroad. */
const classOf = (place: Held["place"]): string => (place === "israel" ? "etf_units" : "foreign_securities");

const PERIOD_MONTHS: Record<string, Months> = { month: 1, quarter: 3, year: 12 };
const NIS_UNITS = new Set(["nis", "nis_per_trade", "nis_per_month", "nis_per_transfer"]);
const CURRENCY_OF_UNIT: Partial<Record<ValueObject["unit"], BoundCurrency>> = { nis: "ILS", nis_per_trade: "ILS", nis_per_month: "ILS", usd: "USD", usd_per_trade: "USD", usd_per_share: "USD", usd_per_event: "USD", eur: "EUR", gbp_per_trade: "GBP" };

type Line = FeesSnapshot["lines"][number];
type Mapped = { fees: TemplateFee[]; left: LeftWhy[] };

const has = (v: ValueObject | null | undefined): v is ValueObject & { value: number } => !!v && typeof v.value === "number";

/**
 * A price on each action from a line: a share of the action (its rate in percent of the trade), or a sum per unit (F-12's price per share,
 * in `usd_per_share`); with its bounds, its cap as a share of the trade (`cap`, F-12) and its flat price for a small action (`flat_up_to`,
 * F-12, F-13), every sum in one currency (a line whose sums are in two is left, F-13). `cap` is read only where `withCap`: the trade fee's.
 */
function actionPrice(l: Line, num: (v: ValueObject) => Num, withCap: boolean): { price: Price } | { left: LeftWhy } {
  if (!has(l.rate)) return { left: "no-value" };
  const perUnit = l.rate.unit === "usd_per_share";
  const flat = l.flat_up_to && has(l.flat_up_to.amount) && has(l.flat_up_to.up_to) ? { amount: l.flat_up_to.amount, upTo: l.flat_up_to.up_to } : null;
  const sums = [l.min, l.max, flat?.amount, flat?.upTo, ...(perUnit ? [l.rate] : [])].filter(has);
  const currencies = new Set(sums.map((b) => CURRENCY_OF_UNIT[b.unit]));
  if (currencies.has(undefined) || currencies.size > 1) return { left: "bound-currency" };
  const currency = [...currencies][0];
  const cap = withCap && has(l.cap) ? { cap: num(l.cap) } : {};
  const parts = {
    ...(has(l.min) ? { min: num(l.min) } : {}),
    ...(has(l.max) ? { max: num(l.max) } : {}),
    ...cap,
    ...(flat ? { flat: { amount: num(flat.amount), upTo: num(flat.upTo) } satisfies Flat } : {}),
    ...(currency && currency !== "ILS" ? { currency } : {}),
  };
  return { price: perUnit ? { form: "perUnit", amount: num(l.rate), ...parts } : { form: "action", rate: num(l.rate), ...parts } };
}

/** The deal's fees a price list line fills, and what of it is left (F-12 to F-17). */
export function lineFees(l: Line, own: string): Mapped {
  const num = (v: ValueObject): Num => ({ v: v.value as number, src: sourcedOf(v, own) });
  const fee = (kind: FeeKindId, price: Price): TemplateFee => ({ kind, stages: [{ price }] });
  switch (l.base) {
    case "trade": {
      // a sum on each trade with no bound (Excellence's 16 ₪ on a traditional mutual fund) is a sum per action
      if (NIS_UNITS.has(l.rate.unit) && !l.min && !l.max && !l.cap && !l.flat_up_to) return has(l.rate) ? { fees: [fee("trade", { form: "perAction", amount: num(l.rate) })], left: [] } : { fees: [], left: ["no-value"] };
      if (l.rate.unit !== "pct_of_trade" && l.rate.unit !== "usd_per_share") return { fees: [], left: ["bound-currency"] };
      const p = actionPrice(l, num, true);
      return "left" in p ? { fees: [], left: [p.left] } : { fees: [fee("trade", p.price)], left: [] };
    }
    case "fx": {
      if (l.rate.unit === "nis_per_usd") return { fees: [], left: ["per-dollar"] };
      const p = actionPrice(l, num, false);
      if ("left" in p) return { fees: [], left: [p.left] };
      // F-13 (D65): a spread the price list limits is priced at its ceiling beside the conversion fee
      const spread = has(l.spread) && l.spread.value > 0 ? [fee("fx_spread", { form: "action", rate: num(l.spread) })] : [];
      return { fees: [fee("fx", p.price), ...spread], left: [] };
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
    case "corporate_event": {
      // F-103: a sum per client for each corporate event, in the line's currency (One Zero's 50 dollars)
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      const currency = CURRENCY_OF_UNIT[l.rate.unit];
      if (!currency || l.min || l.max) return { fees: [], left: ["bound-currency"] };
      return { fees: [fee("corporate_event", { form: "perAction", amount: num(l.rate), ...(currency !== "ILS" ? { currency } : {}) })], left: [] };
    }
    default:
      return { fees: [], left: ["other-base"] };
  }
}

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
 * The ways to buy a holding a price list prints in a channel (F-63's plans): its trade lines for the holding with a band, other than a
 * standing order's, a redemption's and a line set aside (`not_ranked`), which no ordinary purchase reads.
 */
function planLines(snap: FeesSnapshot, place: Held["place"], currency: string | null, channel: string): Line[] {
  return snap.lines.filter((l) => l.base === "trade" && l.band !== null && l.band !== STANDING_ORDER_BAND && l.band !== REDEMPTION_BAND && l.not_ranked === undefined && appliesTo(l, place, currency, channel));
}

/**
 * One holding's fees from a house's price list: the channel is the first of `HOUSE_CHANNELS` with a trade line for the holding's class, or
 * with several ways to buy it (`planLines`); every base's list line is the one a run reads (`tariffLine`); a conversion only where the
 * holding is bought abroad in another currency. Where the list prints two or more ways to buy the holding (its standard trade line where it
 * has one, and its plans), each is a plan with its own trade fee.
 */
function holdingFees(snap: FeesSnapshot, place: Held["place"], currency: string | null): HoldingTemplate | undefined {
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
    return (t !== undefined && t !== "ambiguous") || planLines(snap, place, currency, c).length >= 2;
  });
  if (!channel) return undefined;
  const fees: TemplateFee[] = [];
  const left: { lineId: string; why: LeftWhy }[] = [];
  const read = new Set<string>();
  const ambiguous = new Set<string>();
  const standard = tryLine(channel, "trade");
  const ways = [...(standard && standard !== "ambiguous" && standard.band === null ? [standard] : []), ...planLines(snap, place, currency, channel)];
  const plans = ways.length >= 2 ? ways : [];
  for (const l of plans) read.add(l.id);
  for (const base of HOUSE_BASES) {
    if (base === "fx" && (place === "israel" || currency === null)) continue;
    const l = tryLine(channel, base);
    if (l === undefined) continue;
    // with plans, a trade line the run reads by itself is the standard one, and the plans hold the rest
    if (base === "trade" && plans.length > 0 && (l === "ambiguous" || l.band !== null)) {
      ambiguous.add(base);
      left.push({ lineId: base, why: "ambiguous" });
      continue;
    }
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
    if (read.has(l.id) || ambiguous.has(l.base) || !appliesTo(l, place, currency, channel)) continue;
    left.push({ lineId: l.id, why: (HOUSE_BASES as readonly string[]).includes(l.base) ? whyNotRead(l) : "other-base" });
  }
  const usesChannel = snap.lines.some((l) => l.channel !== null);
  const own = snap.provider.name_he;
  const planOf = (l: Line): HousePlan => {
    const m = lineFees(l, own);
    return { line: l.id, name: l.band ?? l.names.tariff[0] ?? l.id, fees: m.fees, left: m.left };
  };
  return { channel: usesChannel ? channel : null, fees, left, ...(plans.length ? { plans: plans.map(planOf) } : {}) };
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
export function holdingOf(template: HouseTemplate, held: Held): HoldingTemplate | undefined {
  if (held.place === "israel") return template.holdings.israel;
  const own = template.holdings[`abroad:${held.currency}`];
  const h = own ?? template.holdings.abroad;
  if (!h || held.currency !== "ILS") return h;
  return { ...h, fees: h.fees.filter((f) => f.kind !== "fx" && f.kind !== "fx_spread") };
}

/**
 * A holding read with one of its plans: the plan's trade fee in place of the standard one, and what is left without the trade's ambiguity
 * and the standard line's own leftovers, with the plan's line's own.
 */
function withPlan(h: HoldingTemplate, plan: HousePlan): HoldingTemplate {
  // the standard line, where the list prints one, is the first plan and the one `fees` holds
  const standard = h.fees.some((f) => f.kind === "trade") ? h.plans?.[0]?.line : undefined;
  const left = h.left.filter((x) => !(x.lineId === "trade" && x.why === "ambiguous") && x.lineId !== standard);
  return { ...h, fees: [...h.fees.filter((f) => f.kind !== "trade"), ...plan.fees], left: [...left, ...plan.left.map((why) => ({ lineId: plan.line, why }))] };
}

/** The holding a template reads where the deal does not say what it holds: a fund bought in Israel, in shekels, that accumulates. */
export const HELD_UNSAID: Held = { place: "israel", currency: "ILS", payout: "accumulating" };

/**
 * What a template leaves out of a deal, with why: a line of a house's price list (`line`, its id, or the fee base where two lines apply and
 * the list does not say which), the whole price list where it prints no line for what the deal holds (`no-holding`), or one of a track's
 * two fees (`fee`): one the product may not charge (PF-06, `none-by-rule`), or one the regulator's data gives no figure for (`no-value`).
 */
export type LeftOut = { line: string; why: LeftWhy } | { why: "no-holding" } | { fee: "balance" | "deposit"; why: "none-by-rule" | "no-value" };

/**
 * A regulated track as a template (CMA averages, F-68's source): its yearly fee on the savings, charged each month (F-15), and its fee on
 * each deposit. A fee the data gives as exactly zero fills nothing and is not left out: a price of zero charges nothing (F-110), so the
 * deal without it is the same deal. A deposit fee the product may not charge (PF-06) and a fee the regulator's data has no figure for
 * fill nothing and are left out, with why.
 */
function trackTemplate(track: TrackLite, data: Pick<FeesData, "templates">, today: string): { fees: TemplateFee[]; left: LeftOut[] } {
  const v = trackFees(track, data, today);
  if (!v) return { fees: [], left: [{ fee: "balance", why: "no-value" }, { fee: "deposit", why: "no-value" }] };
  const num = (x: SiteValue): Num => ({ v: x.value as number, src: sourcedOf(x) });
  const known = (x: SiteValue): x is SiteValue & { value: number } => typeof x.value === "number" && x.value >= 0;
  const fees: TemplateFee[] = [];
  const left: LeftOut[] = [];
  if (!known(v.balance)) left.push({ fee: "balance", why: "no-value" });
  else if (v.balance.value > 0) fees.push({ kind: "balance", stages: [{ price: { form: "held", rate: num(v.balance), per: 12, every: 1 } }] });
  if (depositFeeNoneByRule(v.deposit)) left.push({ fee: "deposit", why: "none-by-rule" });
  else if (!known(v.deposit)) left.push({ fee: "deposit", why: "no-value" });
  else if (v.deposit.value > 0) fees.push({ kind: "deposit", stages: [{ price: { form: "action", rate: num(v.deposit) } }] });
  return { fees, left };
}

// ---------------------------------------------------------------- the picker, and filling a deal

/**
 * A plan a picker lists under its house: the template id that fills the deal with it, its name in the price list's words, and its trade
 * price as the page shows a price (`price`, with its figures sourced).
 */
export interface PlanOption {
  id: string;
  name: string;
  price: PriceView;
}

/**
 * A template a picker offers for a kind: a house's price list, with its plans for what the deal holds where the list prints several ways
 * to buy it (`plans`, each a row of its own under the house), or a track (with its company, to group by, its short name under the company
 * where it is shorter, D54, and the yearly fee on the savings its pick fills, `saving`, where it fills one).
 */
export type TemplateOption = { id: string; name: string; source: "house"; plans?: PlanOption[] } | { id: string; name: string; source: "track"; company: string; short?: string; saving?: SiteValue };

const HOUSE = "house:";
const TRACK = "track:";
/** Between a house's id and a plan's line in a plan's template id (`house:interactive-brokers/interactive-brokers-buy-sell-us-fixed`). */
const PLAN = "/";
const houseId = (h: HouseTemplate) => `${HOUSE}${h.id}`;
const planId = (h: HouseTemplate, plan: HousePlan) => `${houseId(h)}${PLAN}${plan.line}`;

/** A house template id's house and plan line: `house:<id>` or `house:<id>/<line>`. */
function houseOf(id: string, data: Pick<FeesData, "houses">): { house: HouseTemplate; line: string | null } | null {
  if (!id.startsWith(HOUSE)) return null;
  const [hid, line] = id.split(PLAN, 2) as [string, string | undefined];
  const house = data.houses.find((x) => houseId(x) === hid);
  return house ? { house, line: line ?? null } : null;
}

/** A plan's trade price as the page shows it (`priceView`), for its row in the picker. */
function planPrice(plan: HousePlan, today: string): PriceView | null {
  const trade = plan.fees.find((f) => f.kind === "trade");
  if (!trade) return null;
  const fee: Fee = { id: "plan", ...trade };
  return priceView([fee], 0, trade.stages[0]!.price, today);
}
const trackId = (t: TrackLite) => `${TRACK}${t.id}`;

/** Where a template comes from, by its id: a house's price list or a track. */
export const templateSource = (id: string): "house" | "track" => (id.startsWith(TRACK) ? "track" : "house");

/**
 * The templates for a kind, for a picker: every house's price list for a securities account, each with its plans for what the deal holds
 * (`held`; where it does not say, a fund bought in Israel in shekels); every track the regulator's data maps to the kind, for the provident
 * family. Other kinds have none.
 */
export function templateOptions(kind: FeeDeal["kind"], data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string, held?: Held): TemplateOption[] {
  if (kind === "brokerage-account")
    return data.houses.map((h) => {
      const plans = (holdingOf(h, held ?? HELD_UNSAID)?.plans ?? []).flatMap((plan) => {
        const price = planPrice(plan, today);
        return price ? [{ id: planId(h, plan), name: plan.name, price }] : [];
      });
      return { id: houseId(h), name: h.name, source: "house" as const, ...(plans.length ? { plans } : {}) };
    });
  if (kind === null) return [];
  return data.tracks
    .filter((t) => t.wrapperId === kind)
    .map((t) => {
      const balance = trackFees(t, data, today)?.balance;
      // the fee a pick fills: a known yearly rate above nothing (`trackTemplate`)
      const saving = balance && typeof balance.value === "number" && balance.value > 0 ? balance : undefined;
      return { id: trackId(t), name: t.name, source: "track", company: t.company, ...(t.short ? { short: t.short } : {}), ...(saving ? { saving } : {}) };
    });
}

/**
 * The fees a kind's product may not charge by rule, which the builder does not offer: a fee from deposits where the regulator's data says
 * of every track of the kind that there is none, by rule (PF-06, `depositFeeNoneByRule`). None for a kind with no tracks.
 */
export function barredFees(kind: FeeDeal["kind"], data: Pick<FeesData, "tracks" | "templates">, today: string): FeeKindId[] {
  const tracks = data.tracks.filter((t) => t.wrapperId === kind);
  if (tracks.length === 0) return [];
  return tracks.every((t) => {
    const v = trackFees(t, data, today);
    return !!v && depositFeeNoneByRule(v.deposit);
  })
    ? ["deposit"]
    : [];
}

/** A template as it fills a deal: its name, its fees for what the deal holds, what it leaves out with why, and a house's provider kind. */
export interface Template {
  name: string;
  fees: TemplateFee[];
  left: LeftOut[];
  provider?: ProviderKind;
}

/**
 * The template `id` for a deal of `deal`'s kind and holding: a house's for what the deal holds (with one of its plans, where the id names
 * one: its trade price, and the house's name with the plan's), a track's two fees. Null where the id names no template of the deal's kind,
 * or a plan the house does not print for what the deal holds.
 */
export function templateOf(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): Template | null {
  if (id.startsWith(HOUSE) && deal.kind === "brokerage-account") {
    const found = houseOf(id, data);
    if (!found) return null;
    const { house: h, line } = found;
    let holding = holdingOf(h, deal.held ?? HELD_UNSAID);
    let name = h.name;
    if (line !== null) {
      const plan = holding?.plans?.find((x) => x.line === line);
      if (!holding || !plan) return null;
      holding = withPlan(holding, plan);
      name = `${h.name}, ${plan.name}`;
    }
    return { name, fees: holding?.fees ?? [], left: holding ? holding.left.map(({ lineId, why }) => ({ line: lineId, why })) : [{ why: "no-holding" }], provider: h.provider };
  }
  if (id.startsWith(TRACK)) {
    const t = data.tracks.find((x) => trackId(x) === id);
    if (!t || t.wrapperId !== deal.kind) return null;
    return { name: `${t.name} (${t.company})`, ...trackTemplate(t, data, today) };
  }
  return null;
}

/**
 * A deal filled from a template: each fee the template has replaces the deal's fee of that kind (keeping its place and id) or is added
 * after the others; the deal's other fees stay. The template's provider kind is the deal's, and the deal names the template.
 * Null where the id names no template of the deal's kind.
 */
export function fillDeal(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = templateOf(deal, id, data, today);
  if (!t) return null;
  let fees = [...deal.fees];
  for (const f of t.fees) {
    const at = fees.findIndex((x) => x.kind === f.kind);
    if (at >= 0) fees[at] = { ...f, id: fees[at]!.id };
    else fees = [...fees, { ...f, id: newFeeId() }];
  }
  return { ...deal, fees, template: { id, name: t.name }, ...(t.provider ? { provider: t.provider } : {}) };
}

/**
 * A new deal filled from a template, beside `from` (the deal on screen, which it never changes): of `from`'s kind and holding, named by the
 * template. Null where the id names no template of the kind.
 */
export function dealFromTemplate(from: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const d = fillDeal({ ...newDeal(from.kind), ...(from.held ? { held: from.held } : {}) }, id, data, today);
  return d && { ...d, name: (d.template?.name ?? "").slice(0, NAME_MAX) };
}

/**
 * The deal on screen with a track picked for it in the builder: the same deal (its id, start month and place in the saved list), naming
 * the track. The track's fees replace the deal's where it has none or every fee in it holds nothing the person gave (`untouched`: as a
 * template filled it, or just added and still asking for its price, which stays where the track has no fee of its kind); a deal
 * with any fee the person typed or changed keeps every fee as it is, and its template says the track filled none (`feesKept`). The
 * track's name becomes the deal's where the deal has none or still has the name the previous template gave it; a name the person typed
 * stays. Null where the id names no template of the deal's kind.
 */
export function pickTrack(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = templateOf(deal, id, data, today);
  if (!t) return null;
  const name = t.name.slice(0, NAME_MAX);
  const named = deal.name.trim() === "" || (deal.template !== undefined && deal.name === deal.template.name.slice(0, NAME_MAX));
  const base = { ...deal, ...(named ? { name } : {}) };
  if (!deal.fees.every(untouched)) return { ...base, template: { id, name: t.name, feesKept: true } };
  // a fee of a kind the deal already has keeps its id, so the fee chosen on screen stays chosen; a fee just added, still asking for its
  // price, stays where the track has none of its kind
  const fees = [...t.fees.map((f) => ({ ...f, id: deal.fees.find((x) => x.kind === f.kind)?.id ?? newFeeId() })), ...deal.fees.filter((f) => !t.fees.some((x) => x.kind === f.kind) && !pricePriced(f.stages[0]!.price))];
  return { ...base, fees, template: { id, name: t.name }, ...(t.provider ? { provider: t.provider } : {}) };
}

/**
 * The houses whose price list fills a fee of `kind` for what a securities account's deal holds (or, where it does not say, for a fund bought
 * in Israel in shekels): the price lists a single fee can be filled from. None for another kind of deal.
 */
export function feePriceLists(deal: FeeDeal, kind: FeeKindId, data: Pick<FeesData, "houses">): { id: string; name: string }[] {
  if (deal.kind !== "brokerage-account") return [];
  return data.houses.filter((h) => holdingOf(h, deal.held ?? HELD_UNSAID)?.fees.some((f) => f.kind === kind)).map((h) => ({ id: houseId(h), name: h.name }));
}

/** A house's name by its template id (`house:<id>`, or a plan's `house:<id>/<line>`); null where no house has it. */
export const houseName = (id: string, data: Pick<FeesData, "houses">): string | null => houseOf(id, data)?.house.name ?? null;

/**
 * The deal with one fee's price filled from a house's price list (`feePriceLists`): the fee keeps its id and place, takes the list's one
 * price with its sources, and so prices a sale as a purchase. No other fee changes, nor the deal's name or template. A house of another
 * provider kind than the deal names takes the deal's provider away: the deal's fees are then priced by more than one kind of provider, and
 * a cap that binds only some providers is stated without a judgement (F-113). Null where the list has no line for the fee.
 */
export function fillFee(deal: FeeDeal, feeId: string, houseIdOf: string, data: Pick<FeesData, "houses">): FeeDeal | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  const h = data.houses.find((x) => houseId(x) === houseIdOf);
  if (!fee || !h || deal.kind !== "brokerage-account") return null;
  const t = holdingOf(h, deal.held ?? HELD_UNSAID)?.fees.find((f) => f.kind === fee.kind);
  if (!t) return null;
  const filled: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === feeId ? { id: f.id, kind: f.kind, stages: structuredClone(t.stages) } : f)) };
  if (!deal.provider || deal.provider === h.provider) return filled;
  const { provider: _p, ...rest } = filled;
  return rest;
}

/** A row's title in the track picker: a track's short name where it has one (D54), else the template's name. */
export const rowTitle = (o: TemplateOption): string => (o.source === "track" ? (o.short ?? o.name) : o.name);

/** The templates whose name, a plan's name, a track's short name or its company holds the words typed. */
export function matching(options: readonly TemplateOption[], query: string): readonly TemplateOption[] {
  const q = query.trim();
  if (!q) return options;
  return options.filter((o) => o.name.includes(q) || (o.source === "house" ? !!o.plans?.some((p) => p.name.includes(q)) : o.short?.includes(q) || o.company.includes(q)));
}

/**
 * A new deal of a track's kind, filled from the track (`/deal?track=`) and named by it as a deal that picks the track in the builder is
 * (`pickTrack`); null where the track maps to no product id.
 */
export function dealFromTrack(fundId: number, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = data.tracks.find((x) => x.id === fundId);
  if (!t?.wrapperId || !isProductId(t.wrapperId)) return null;
  return pickTrack(newDeal(t.wrapperId), trackId(t), data, today);
}
