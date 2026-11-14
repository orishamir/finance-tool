// Templates that fill a deal from the site's data (method §10.6: the site's price lists and tracks only fill a deal's fields, as a start
// the person edits): a house's whole price list for a securities account, each base's fee with its cases where the list prints several
// prices for it (F-114); and a regulated track's two fees for the provident family. For each value of what is bought, a line is chosen as
// F-63's line choice chooses it: the standard line (no band) wins over a banded one, and the banded lines are tracks only where no standard
// line prices the value. Where two standard lines price a value, the one that names fewer classes wins, where F-63 finds the snapshot
// ambiguous unless one names a sub-class. A filled figure keeps its record's source and date (sourced) until the person changes it
// (entered, `retyped`).
import { memberKindOf, REDEMPTION_BAND, STANDING_CONVERSION_BAND, STANDING_ORDER_BAND } from "@finance-tool/engine";
import type { FeesSnapshot, ValueObject } from "@finance-tool/schema";
import { HOUSE_CHANNELS } from "../providers";
import { depositFeeNoneByRule, type SiteValue } from "../value";
import type { FeesData, TrackLite } from "../fee-page-data";
import { trackFees } from "../fee-page-data";
import { isProductId, NAME_MAX, newDeal, newFeeId, pricedOf, pricePriced, untouched, type BoundCurrency, type Note, type By, type Case, type CasesFee, type Fee, type FeeDeal, type Months, type Num, type OwnPlace, type ProviderKind, type SlimFee, type When } from "./model";
import { CURRENCY_IDS, WHAT_IDS, type FeeKindId, type Place } from "./shapes";
import { sourcedOf } from "./values";
import { buildPrice, type PriceSpec } from "./offers/build";

/** A fee a template fills whose price changes by nothing: a fee without its id in the deal. */
export type SlimTemplateFee = Omit<SlimFee, "id">;
/** A fee a template fills: a fee without its id in the deal, with its cases where the list prints several prices for it. */
export type TemplateFee = SlimTemplateFee | Omit<CasesFee, "id">;

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
  /** A plan's own line (a standing order, a recurring plan, a redemption): a run reads it only for that plan (F-63). */
  | "plan"
  /** A line the price list prints that the house's documents do not show an ordinary customer can use (`not_ranked`, D41). */
  | "set-aside"
  /** Other lines of the same base price everything this one names (a narrower class; a way to convert that charges nothing, F-63). */
  | "another-line"
  /** A base a house's template does not fill. */
  | "other-base"
  /**
   * A conversion that charges nothing beside a spread the documents do not limit, recorded with no value and so not priced (F-13, D65:
   * Interactive Brokers' automatic conversion): filled at 0%, the conversion still costs that spread.
   */
  | "spread-unpriced"
  /**
   * A bank's line for trading on the Tel Aviv exchange that names mutual fund units: it is read for what it prices there, and a mutual fund
   * that is neither a tracking fund nor listed on the exchange is left out of it (BRK-16, part 4(א)(1) and footnote 4; MF-27), so such a
   * fund has no trade price in the deal.
   */
  | "bank-funds"
  /** A yearly share of what is held charged on a fund's units by its type (a bank's distribution fee, BRK-16 part 4(ב)(2), MF-71): the deal holds no such price for that fee. */
  | "distribution-yearly";

/** One house's price list as a template: the fees its whole list fills, and the lines it leaves, with why. */
export interface HouseTemplate {
  /** The provider id of the snapshot (`leumi`). */
  id: string;
  /** The snapshot's date, YYYY-MM-DD. */
  snapshot: string;
  name: string;
  provider: ProviderKind;
  fees: TemplateFee[];
  left: { lineId: string; why: LeftWhy }[];
}

const PERIOD_MONTHS: Record<string, Months> = { month: 1, quarter: 3, year: 12 };
const NIS_UNITS = new Set(["nis", "nis_per_trade", "nis_per_month", "nis_per_transfer"]);
const CURRENCY_OF_UNIT: Partial<Record<ValueObject["unit"], BoundCurrency>> = { nis: "ILS", nis_per_trade: "ILS", nis_per_month: "ILS", usd: "USD", usd_per_trade: "USD", usd_per_share: "USD", usd_per_event: "USD", eur: "EUR", gbp_per_trade: "GBP" };

type Line = FeesSnapshot["lines"][number];
type Mapped = { fees: SlimTemplateFee[]; left: LeftWhy[] };

const has = (v: ValueObject | null | undefined): v is ValueObject & { value: number } => !!v && typeof v.value === "number";

/**
 * A price on each action from a line: a share of the action (its rate in percent of the trade), or a sum per unit (F-12's price per share,
 * in `usd_per_share`); with its bounds, its cap as a share of the trade (`cap`, F-12) and its flat price for a small action (`flat_up_to`,
 * F-12, F-13), every sum in one currency (a line whose sums are in two is left, F-13). `cap` is read only where `withCap`: the trade fee's.
 */
function actionPrice(l: Line, num: (v: ValueObject) => Num, withCap: boolean): { spec: PriceSpec } | { left: LeftWhy } {
  if (!has(l.rate)) return { left: "no-value" };
  const perUnit = l.rate.unit === "usd_per_share";
  const flat = l.flat_up_to && has(l.flat_up_to.amount) && has(l.flat_up_to.up_to) ? { amount: l.flat_up_to.amount, upTo: l.flat_up_to.up_to } : null;
  const sums = [l.min, l.max, flat?.amount, flat?.upTo, ...(perUnit ? [l.rate] : [])].filter(has);
  const currencies = new Set(sums.map((b) => CURRENCY_OF_UNIT[b.unit]));
  if (currencies.has(undefined) || currencies.size > 1) return { left: "bound-currency" };
  const currency = [...currencies][0];
  const figures = {
    ...(perUnit ? { amount: num(l.rate) } : { rate: num(l.rate) }),
    ...(has(l.min) ? { min: num(l.min) } : {}),
    ...(has(l.max) ? { max: num(l.max) } : {}),
    ...(withCap && has(l.cap) ? { cap: num(l.cap) } : {}),
    ...(flat ? { flat: num(flat.amount), upTo: num(flat.upTo) } : {}),
  };
  return { spec: { form: perUnit ? "perUnit" : "action", figures, ...(currency && currency !== "ILS" ? { currency } : {}) } };
}

/**
 * Whether a line's own words say it is charged on an order that was not carried out too: its name in the price list holds "כולל קניה או
 * מכירה שלא בוצעה" (§10.6's stated parts), as Excellence's trade lines print it.
 */
const UNFILLED_RE = /כולל קני?יה או מכירה שלא בוצעה/;
export const chargesUnfilled = (l: Line): boolean => l.names.tariff.some((n) => UNFILLED_RE.test(n));

/** The classes of part 4(א)(1) of the Bank of Israel's fee rules: securities on the Tel Aviv exchange, makam among them (BRK-16). */
const ITEM_ONE = new Set(["tase_shares_bonds", "etf_units", "tase_bonds", "tase_foreign_fund_units", "makam"]);

/**
 * What a trade line notes of an order not carried out (§10.6's stated parts). At a bank the fee rules decide it whatever the line's heading
 * says: an order through a clerk not carried out for a reason on the client's side pays the minimum, on the Tel Aviv exchange (BRK-16,
 * notes to part 4(א)(1)) and abroad (part 4(א)(4), note 1). So a line of the branch's channel carries that note, in the words of its item:
 * on the exchange the item's own exception of mutual funds (`bankTradeLeavesFunds`), abroad none; and a direct line none. At a house
 * that is no bank, the line's own words say it (`chargesUnfilled`). None where neither does.
 */
export function unfilledNote(l: Line, bank: boolean): Note | null {
  if (bank) return l.channel !== "branch" ? null : l.applies_to.some((a) => ITEM_ONE.has(a)) ? "unfilledClerk" : l.applies_to.includes("foreign_securities") ? "unfilledClerkAbroad" : null;
  return chargesUnfilled(l) ? "unfilled" : null;
}

/**
 * A trade line that is one sum on every trade (F-12: `max(min, min(0 × amount, max))` with `min = max`, held to the line's cap where it has
 * one): a share of nothing, its minimum and maximum the same sum in one currency, and no flat price; the sum and its currency, else null.
 */
function fixedSum(l: Line): { sum: ValueObject & { value: number }; currency: BoundCurrency } | null {
  if (!has(l.rate) || l.rate.unit !== "pct_of_trade" || l.rate.value !== 0 || !has(l.min) || !has(l.max) || l.flat_up_to) return null;
  const currency = CURRENCY_OF_UNIT[l.min.unit];
  if (!currency || CURRENCY_OF_UNIT[l.max.unit] !== currency || l.min.value !== l.max.value) return null;
  return { sum: l.min, currency };
}

/**
 * The custody lines whose maximum is on each security and not on the whole deposit, as their records' notes say ("₪ 7,500 לני״ע לרבעון";
 * Leumi's and FIBI's notes name a larger maximum per deposit beside it, which no field of the record holds). A template fills that maximum
 * as one on each security (`perSecurity`), which the page states and never reads as the holding's maximum (§10.6's stated parts). A line
 * whose maximum per deposit is the same figure keeps it as the holding's maximum, which it then is. The records give no field for this, so
 * the list is kept here, each id checked against its record's note by a test, until a data field does.
 */
export const MAX_PER_SECURITY: ReadonlySet<string> = new Set([
  "discount-custody-israel",
  "discount-custody-foreign",
  "mercantile-custody-israel",
  "mercantile-custody-foreign",
  "leumi-custody-israel",
  "leumi-custody-foreign",
  "pepper-custody-israel",
  "pepper-custody-foreign",
  "fibi-custody-israel",
  "fibi-custody-foreign",
]);

/** The deal's fees a price list line fills, and what of it is left (F-12 to F-17). */
export function lineFees(l: Line, own: string, bank = false): Mapped {
  const num = (v: ValueObject): Num => ({ v: v.value as number, src: sourcedOf(v, own) });
  // every price goes through the registries (`buildPrice`), so none is one the fee cannot hold
  const fee = (kind: FeeKindId, spec: PriceSpec): SlimTemplateFee => ({ kind, stages: [{ price: buildPrice(kind, spec) }] });
  switch (l.base) {
    case "trade": {
      // what the line, or at a bank the fee rules, say of an order not carried out (`unfilledNote`)
      const note = unfilledNote(l, bank);
      const notes = note ? { notes: [note] } : {};
      const perAction = (amount: Num, more: Partial<PriceSpec["figures"]> = {}, currency?: BoundCurrency): PriceSpec => ({ form: "perAction", figures: { amount, ...more }, ...(currency && currency !== "ILS" ? { currency } : {}), ...notes });
      // a sum on each trade with no bound (Excellence's 16 ₪ on a traditional mutual fund) is a sum per action
      if (NIS_UNITS.has(l.rate.unit) && !l.min && !l.max && !l.cap && !l.flat_up_to) return has(l.rate) ? { fees: [fee("trade", perAction(num(l.rate)))], left: [] } : { fees: [], left: ["no-value"] };
      // a share of nothing whose minimum and maximum are one sum, with no flat price, is that sum on each trade, in its currency (Altshuler's
      // "11$ לעסקה", IBI's "פיקס 12$"), under the line's percent maximum where it prints one (Excellence's "11$ פיקס לעסקה" under 2%)
      const fixed = fixedSum(l);
      if (fixed) return { fees: [fee("trade", perAction(num(fixed.sum), has(l.cap) ? { cap: num(l.cap) } : {}, fixed.currency))], left: [] };
      if (l.rate.unit !== "pct_of_trade" && l.rate.unit !== "usd_per_share") return { fees: [], left: ["bound-currency"] };
      const p = actionPrice(l, num, true);
      return "left" in p ? { fees: [], left: [p.left] } : { fees: [fee("trade", { ...p.spec, ...notes })], left: [] };
    }
    case "fx": {
      if (l.rate.unit === "nis_per_usd") return { fees: [], left: ["per-dollar"] };
      const p = actionPrice(l, num, false);
      if ("left" in p) return { fees: [], left: [p.left] };
      // F-13 (D65): a spread the price list limits is priced at its ceiling beside the conversion fee
      const spread = has(l.spread) && l.spread.value > 0 ? [fee("fx_spread", { form: "action", figures: { rate: num(l.spread) } })] : [];
      // a conversion filled at nothing whose spread is recorded but not limited says the spread is not counted, so 0% does not read as free
      const unpriced = l.spread && !has(l.spread) && convertsFree(l);
      return { fees: [fee("fx", p.spec), ...spread], left: unpriced ? ["spread-unpriced"] : [] };
    }
    case "custody": {
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      // a zero rate prints no period (One Zero's "0 אחוז"): it charges nothing whatever the period is; a rate above it needs one
      if (!l.period && l.rate.value > 0) return { fees: [], left: ["no-period"] };
      const every = l.period ? PERIOD_MONTHS[l.period]! : 1;
      const bounds = [l.min, l.max].filter(has);
      if (bounds.some((b) => !NIS_UNITS.has(b.unit))) return { fees: [], left: ["bound-currency"] };
      // a bound keeps the figure and the period the list prints it in ("מינימום 40 ₪ לחודש"), which F-14 turns into a charge's bound;
      // where one bound is printed per month and the other per charge, both are a charge's, the monthly one times the months of a charge
      const monthly = bounds.filter((b) => b.unit === "nis_per_month").length;
      const asPrinted = monthly > 0 && monthly === bounds.length && every !== 1;
      const bound = (b: ValueObject & { value: number }): Num => ({ v: asPrinted ? b.value : b.value * (b.unit === "nis_per_month" ? every : 1), src: sourcedOf(b, own) });
      // a maximum on each security is said as one (`MAX_PER_SECURITY`), never as the holding's
      const maxAs = MAX_PER_SECURITY.has(l.id) ? "perSecurity" : "max";
      return { fees: [fee("custody", { form: "held", figures: { rate: num(l.rate), ...(has(l.min) ? { min: bound(l.min) } : {}), ...(has(l.max) ? { [maxAs]: bound(l.max) } : {}) }, per: every, every, ...(asPrinted ? { boundsEvery: 1 as const } : {}) })], left: [] };
    }
    case "fixed_period":
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      return { fees: [fee("fixed_period", { form: "sum", figures: { amount: num(l.rate) }, every: l.period ? PERIOD_MONTHS[l.period]! : 1 })], left: [] };
    case "transfer_out":
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      if (!NIS_UNITS.has(l.rate.unit)) return { fees: [], left: ["bound-currency"] };
      return { fees: [fee("transfer_out", { form: "perAction", figures: { amount: num(l.rate) } })], left: [] };
    case "corporate_event": {
      // F-103: a sum per client for each corporate event, in the line's currency (One Zero's 50 dollars)
      if (!has(l.rate)) return { fees: [], left: ["no-value"] };
      const currency = CURRENCY_OF_UNIT[l.rate.unit];
      if (!currency || l.min || l.max) return { fees: [], left: ["bound-currency"] };
      return { fees: [fee("corporate_event", { form: "perAction", figures: { amount: num(l.rate) }, ...(currency !== "ILS" ? { currency } : {}) })], left: [] };
    }
    default:
      return { fees: [], left: ["other-base"] };
  }
}

/**
 * A conversion line that charges nothing on any conversion: a rate of nothing with no minimum and no flat price, and no spread priced
 * beside it (F-13: a spread with no ceiling is not priced, D65). No other way to convert costs less on any amount, so F-63's cheapest
 * reading of the house converts this way whatever the plan.
 */
const convertsFree = (l: Line): boolean =>
  has(l.rate) && l.rate.unit === "pct_of_trade" && l.rate.value === 0 && !has(l.min) && !(l.flat_up_to && has(l.flat_up_to.amount) && l.flat_up_to.amount.value > 0) && !(has(l.spread) && l.spread.value > 0);

/**
 * Where a foreign line is bought, from its band's words (the same words the indices page reads, invest.ts), as values of what is bought:
 * the United States; Europe (London among it); outside the United States ("מחוץ לארה״ב", "שווקים נוספים"), Europe and the rest of the
 * world, unless the words leave Canada out too (`elsewhere-but`: the rest of the world holds Canada, so the line prices Europe and a value
 * of its own); or not said (null: every venue abroad).
 */
const US_RE = /ארה["״]ב|ארצות הברית|United States/;
const EU_RE = /אירופה|לונדון|London|LSE/;
const ELSEWHERE_RE = /מחוץ לארה|שווקים נוספים|שאינם/;
const CANADA_RE = /קנדה|Canada/;
const venueOf = (words: string | null): string[] | "elsewhere-but" | null =>
  !words ? null : ELSEWHERE_RE.test(words) ? (CANADA_RE.test(words) ? "elsewhere-but" : ["europe", "world"]) : US_RE.test(words) ? ["us"] : EU_RE.test(words) ? ["europe"] : null;
/** Whether words name where a line is bought: a venue abroad, or the Tel Aviv exchange. */
const namesPlace = (words: string): boolean => venueOf(words) !== null || /תל אביב|Tel Aviv/.test(words);

/**
 * A banded line's track, in the band's words without where it is bought: the side of a band cut at ":" (or at its first ", ") that does not
 * name a venue ("IBKR Pro - Fixed", "3 סנט למניה, מינימום 8$"); the whole band where neither side does, or both do. A line with no band is
 * the list's regular price.
 */
function trackOf(l: Line): string {
  const band = l.band;
  if (!band) return l.names.tariff[0] ?? l.id;
  for (const sep of [":", ", "]) {
    const at = band.indexOf(sep);
    if (at < 0) continue;
    const [a, b] = [band.slice(0, at).trim(), band.slice(at + sep.length).trim()];
    if (namesPlace(a) && !namesPlace(b)) return b;
    if (namesPlace(b) && !namesPlace(a)) return a;
  }
  return band;
}

/** The classes of the Tel Aviv exchange a line may name for what is bought there (a sub-class, `tase_bonds`, is named apart where a list prints it). */
const TASE_CLASSES = new Set(["tase_shares_bonds", "etf_units", "tase_bonds", "tase_foreign_fund_units"]);
const CLASS_VALUE: Record<string, string> = { mutual_fund_units: "mutualFunds", money_market_units: "moneyMarket", makam: "makam" };
const SUB_CLASSES = new Set(["tase_bonds", "tase_foreign_fund_units"]);

/**
 * The values of its own a line may price (`OwnPlace`, named by its band): a sub-class of the exchange where another line prices the class
 * above it (`sub`), a kind of mutual fund a banded line prices apart where a standard line prices every mutual fund (`funds`), and a place
 * abroad its band names that no value of the site's is (`abroad`). Null where the line prices the site's value instead.
 */
interface OwnValues {
  sub: (l: Line) => OwnPlace | null;
  funds: (l: Line) => OwnPlace | null;
  abroad: (l: Line) => OwnPlace;
}

/**
 * What a line prices, as the values of what is bought (F-114): the account or every class, every value; a class of the Tel Aviv exchange,
 * `tase`; a mutual fund, a money-market fund, makam, each its own; a foreign security, where its band says it is bought (every venue abroad
 * where it does not). A line that names only a sub-class of the exchange (Psagot's bonds) is a value of its own, named by its band, where
 * another line prices the class above it; so is a banded line for mutual funds alone where a standard line prices them (Excellence's
 * "קרנות נאמנות מסורתיות", F-63 reading the standard line for a mutual fund), and a line abroad whose band leaves Canada out (IBI's "מחוץ
 * לארה״ב, לקנדה ולישראל" prices Europe and that value, not the rest of the world).
 */
function valuesOf(l: Line, own: OwnValues, bank: boolean): string[] {
  const out = new Set<string>();
  for (const a of l.applies_to) {
    if (a === "mutual_fund_units" && bankTradeLeavesFunds(l, bank)) continue;
    if (a === "all" || a === "brokerage-account") WHAT_IDS.forEach((v) => out.add(v));
    else if (TASE_CLASSES.has(a)) {
      const o = SUB_CLASSES.has(a) && l.applies_to.every((x) => SUB_CLASSES.has(x)) ? own.sub(l) : null;
      out.add(o ? o.name : "tase");
    } else if (a === "mutual_fund_units") {
      const o = l.band !== null && l.applies_to.every((x) => x === a) ? own.funds(l) : null;
      out.add(o ? o.name : CLASS_VALUE[a]!);
    } else if (CLASS_VALUE[a]) out.add(CLASS_VALUE[a]!);
    else if (a === "foreign_securities") {
      const venue = venueOf(l.band);
      (venue === "elsewhere-but" ? ["europe", own.abroad(l).name] : (venue ?? ["us", "europe", "world"])).forEach((x) => out.add(x));
    }
  }
  for (const x of l.excludes ?? []) if (CLASS_VALUE[x]) out.delete(CLASS_VALUE[x]!);
  return [...out];
}

/**
 * Whether a line is a bank's trade line that leaves mutual funds out (BRK-16, part 4(א)(1): its line for the Tel Aviv exchange excludes
 * mutual funds but a tracking fund and a fund listed on the exchange, footnote 4; MF-27): a bank's trade line that names the exchange's
 * classes beside mutual fund units prices the tracking and listed funds as the exchange's value (`tase`, ETFs among it), and no other fund.
 */
const bankTradeLeavesFunds = (l: Line, bank: boolean): boolean => bank && l.base === "trade" && l.applies_to.includes("mutual_fund_units") && l.applies_to.some((a) => TASE_CLASSES.has(a));

/** How many classes a line names: a line that names fewer prices what it names more narrowly, and wins over a wider one (F-63). */
const breadth = (l: Line): number => (l.applies_to.some((a) => a === "all" || a === "brokerage-account") ? Infinity : l.applies_to.length);

/** The lines a house's template reads for a base: its list lines that no plan of a standing order, a recurring plan or a redemption holds, and none set aside. */
const regular = (l: Line): boolean => l.level === "list" && l.not_ranked === undefined && l.band !== STANDING_ORDER_BAND && l.band !== STANDING_CONVERSION_BAND && l.band !== REDEMPTION_BAND;

/** One price of a base for one set of conditions, before the cases are merged: the line, what it prices, its channel, its track. */
interface Raw {
  line: Line;
  value: string;
  channel: string | null;
  track: string | null;
}

/**
 * A fee of one kind from the raw prices of its base (F-114): one case per line and track, naming every value and channel the line prices
 * (any value where it prices every one); the fee changes by what is bought (what is held, for custody; the currency, for a conversion) where
 * the list prints different prices by it or leaves a value unpriced, and by the track and by the channel only where the list prints
 * different prices by them. A base read from one line is a fee whose price changes by nothing only where that line prices every value of
 * the thing and every value of its own the house names (`own`); otherwise the fee keeps the thing, its one case naming the values the line
 * prices (One Zero's 50 dollars for each corporate event abroad), so the others have no case. A value a line prices that fills nothing
 * (a conversion priced per dollar) has no case either. The fee of `kind` that `lineFees` fills from each line is the case's price.
 */
function feeOfRaws(kind: FeeKindId, first: "what" | "held" | "currency", raws: readonly Raw[], priceOf: (l: Line) => SlimTemplateFee | undefined, own: readonly OwnPlace[]): TemplateFee | null {
  const priced = raws.filter((x) => priceOf(x.line));
  if (priced.length === 0) return null;
  const lines = [...new Set(priced.map((x) => x.line))];
  // a value a line prices that fills nothing here (a conversion priced per dollar) keeps the fee changing by it, so it is read nowhere
  const unpricedValue = raws.some((x) => !priceOf(x.line) && !priced.some((y) => y.value === x.value));
  const allValues = first === "currency" ? CURRENCY_IDS : WHAT_IDS;
  const pricedValues = new Set(priced.map((x) => x.value));
  const covers = allValues.every((v) => pricedValues.has(v)) && own.every((o) => pricedValues.has(o.name));
  const byTrack = priced.some((x) => x.track !== null);
  if (lines.length === 1 && !byTrack && !unpricedValue && covers) return { kind, stages: priceOf(lines[0]!)!.stages };
  const channels = [...new Set(priced.map((x) => x.channel))].filter((c): c is string => c !== null);
  const differ = (key: (x: Raw) => string) => {
    const groups = new Map<string, Set<Line>>();
    for (const x of priced) groups.set(key(x), (groups.get(key(x)) ?? new Set()).add(x.line));
    return [...groups.values()].some((g) => g.size > 1);
  };
  const byValue = unpricedValue || !covers || differ((x) => `${x.channel}|${x.track}`);
  const byChannel = channels.length > 1 && differ((x) => `${x.value}|${x.track}`);
  // one case per line and track, naming the values and channels it prices
  type Cell = { line: Line; track: string | null; channels: Set<string>; values: Set<string> };
  const cells: Cell[] = [];
  for (const x of priced) {
    let cell = cells.find((c) => c.line === x.line && c.track === x.track);
    if (!cell) cells.push((cell = { line: x.line, track: x.track, channels: new Set(), values: new Set() }));
    (x.channel === null ? channels : [x.channel]).forEach((c) => cell!.channels.add(c));
    cell.values.add(x.value);
  }
  const by: By[] = [
    ...(byValue ? [first === "currency" ? { kind: "currency" as const } : { kind: first, ...(own.length ? { own: [...own] } : {}) }] : []),
    ...(byTrack ? [{ kind: "track" as const }] : []),
    ...(byChannel ? [{ kind: "channel" as const }] : []),
  ];
  if (by.length === 0) return { kind, stages: priceOf(lines[0]!)!.stages };
  const cases: Case[] = cells.map((c, k) => {
    const when: When[] = [
      ...(byValue ? [allValues.every((v) => c.values.has(v)) && !own.some((o) => !c.values.has(o.name)) ? ("any" as const) : [...c.values]] : []),
      ...(byTrack ? [c.track === null ? ("any" as const) : [c.track]] : []),
      ...(byChannel ? [channels.every((ch) => c.channels.has(ch)) ? ("any" as const) : [...c.channels]] : []),
    ];
    return { id: `c${k + 1}`, when, stages: structuredClone(priceOf(c.line)!.stages) };
  });
  return { kind, by, cases };
}

/**
 * One base's raw prices (F-63, F-114): for each value of what is bought and each channel, the lines that price it, chosen as F-63 chooses:
 * the standard line (no band) wins over every banded one, and of several standard lines the narrowest (where two are left the list does not
 * say which prices it, `ambiguous`). Where no standard line prices the value, the narrowest banded lines are its tracks (a line with a band
 * is a plan of the list, F-63), or its one price where only one is left.
 */
function rawsOf(lines: readonly Line[], valueOf: (l: Line) => string[]): { raws: Raw[]; ambiguous: Line[]; unread: Line[] } {
  // the channels in the order a house template reads them, the direct one first, so a deal starts on it (F-114: the first case's value)
  const rank = (c: string) => (HOUSE_CHANNELS as readonly string[]).indexOf(c) + 1 || HOUSE_CHANNELS.length + 1;
  const channels = [...new Set(lines.map((l) => l.channel).filter((c): c is string => c !== null))].sort((a, b) => rank(a) - rank(b));
  const raws: Raw[] = [];
  const ambiguous = new Set<Line>();
  const values = [...new Set(lines.flatMap(valueOf))];
  for (const value of values) {
    for (const channel of channels.length ? channels : [null]) {
      const here = lines.filter((l) => valueOf(l).includes(value) && (l.channel === null || l.channel === channel));
      if (here.length === 0) continue;
      const standard = here.filter((l) => l.band === null);
      const pool = standard.length ? standard : here;
      const narrow = Math.min(...pool.map(breadth));
      const ways = pool.filter((l) => breadth(l) === narrow);
      if (standard.length && ways.length > 1) {
        ways.forEach((l) => ambiguous.add(l));
        continue;
      }
      const tracks = ways.length > 1;
      for (const l of ways) raws.push({ line: l, value, channel: l.channel, track: tracks ? trackOf(l) : null });
    }
  }
  const used = new Set(raws.map((x) => x.line));
  return { raws, ambiguous: [...ambiguous], unread: lines.filter((l) => !used.has(l) && !ambiguous.has(l)) };
}

/** The bases a house's price list fills a securities account's deal with, in the order the deal lists them. */
const HOUSE_BASES = ["trade", "custody", "fixed_period", "fx", "transfer_out", "corporate_event"] as const;

/**
 * A house's whole price list as a template for a securities account (built at build time from the house's latest snapshot, its lines
 * limited to what the house's documents show a person can hold, `onlyWhatCanBeDone`): each base's fee, with its cases where the list prints
 * several prices for it (F-114): the trade fee by what is bought, by the track where the list prints several ways to buy one thing, and by
 * the channel where it prints several; custody by what is held; the conversion by the currency where the list prints one per currency, and
 * the way F-63 converts by (a way that charges nothing on any conversion wins over the standard line, `convertsFree`). Each figure keeps its
 * line's source and date. Every line that fills nothing is listed with why.
 */
export function houseTemplate(snap: FeesSnapshot): HouseTemplate {
  const ownName = snap.provider.name_he;
  const bank = memberKindOf(snap.provider.class) === "bank";
  const left: { lineId: string; why: LeftWhy }[] = [];
  const fees: TemplateFee[] = [];
  const read = new Set<string>();
  const ownPlaces: OwnPlace[] = [];
  const ownPlace = (l: Line, place: Place, currency: string | null): OwnPlace => {
    const name = (l.band ?? l.names.tariff[0] ?? l.id).slice(0, NAME_MAX);
    const o: OwnPlace = { name, place, currency };
    if (!ownPlaces.some((x) => x.name === name)) ownPlaces.push(o);
    return o;
  };
  const another = (l: Line, test: (x: Line) => boolean) => snap.lines.some((x) => x !== l && x.base === l.base && regular(x) && test(x));
  const ownOf: OwnValues = {
    // only where another line prices the exchange above the sub-class: else the sub-class is just what the exchange's value prices
    sub: (l) => (another(l, (x) => x.applies_to.some((a) => a === "tase_shares_bonds" || a === "etf_units")) ? ownPlace(l, "israel", "ILS") : null),
    // only where a standard line prices every mutual fund, which F-63 reads for a mutual fund: else the banded line is the funds' own price
    funds: (l) => (another(l, (x) => x.band === null && x.applies_to.includes("mutual_fund_units") && (x.channel === null || l.channel === null || x.channel === l.channel)) ? ownPlace(l, "israel", "ILS") : null),
    abroad: (l) => ownPlace(l, "abroad", null),
  };
  for (const base of HOUSE_BASES) {
    let lines = snap.lines.filter((l) => l.base === base && regular(l) && (base !== "fixed_period" || l.band === null));
    if (lines.length === 0) continue;
    // F-63: a way to convert that charges nothing on any conversion is the cheapest whatever the plan, and the house converts that way
    if (base === "fx") {
      const free = lines.find((l) => l.band !== null && !l.conversion_currency && convertsFree(l));
      if (free) {
        for (const l of lines) if (l !== free && !l.conversion_currency && (l.channel === null || l.channel === free.channel)) left.push({ lineId: l.id, why: "another-line" });
        lines = lines.filter((l) => l === free || !!l.conversion_currency);
      }
    }
    const valueOf = base === "fx" ? (l: Line) => (l.conversion_currency ? [CURRENCY_IDS.includes(l.conversion_currency) ? l.conversion_currency : "other"] : CURRENCY_IDS.filter((c) => !lines.some((x) => x.conversion_currency === c))) : (l: Line) => valuesOf(l, ownOf, bank);
    const { raws, ambiguous, unread } = rawsOf(lines, valueOf);
    for (const l of ambiguous) left.push({ lineId: l.id, why: "ambiguous" });
    for (const l of unread) left.push({ lineId: l.id, why: "another-line" });
    const mapped = new Map(lines.map((l) => [l, lineFees(l, ownName, bank)]));
    for (const [l, m] of mapped) {
      if (!raws.some((x) => x.line === l)) continue;
      read.add(l.id);
      left.push(...m.left.map((why) => ({ lineId: l.id, why })));
      if (bankTradeLeavesFunds(l, bank)) left.push({ lineId: l.id, why: "bank-funds" });
    }
    const first = base === "fx" ? "currency" : base === "custody" || base === "fixed_period" ? "held" : "what";
    const own = first === "currency" ? [] : ownPlaces.filter((o) => raws.some((x) => x.value === o.name));
    for (const kind of [...new Set([...mapped.values()].flatMap((m) => m.fees.map((f) => f.kind)))]) {
      const fee = feeOfRaws(kind, first, raws, (l) => mapped.get(l)?.fees.find((f) => f.kind === kind), own);
      if (fee) fees.push(fee);
    }
  }
  // every other line is listed with why it fills nothing, so no line is left out unsaid
  for (const l of snap.lines) {
    if (read.has(l.id) || left.some((x) => x.lineId === l.id)) continue;
    left.push({ lineId: l.id, why: l.base === "distribution_handling" && l.rate.unit === "pct_of_balance_per_period" ? "distribution-yearly" : l.level !== "list" ? "other-base" : l.not_ranked !== undefined ? "set-aside" : (HOUSE_BASES as readonly string[]).includes(l.base) && l.band !== null ? "plan" : (HOUSE_BASES as readonly string[]).includes(l.base) ? "another-line" : "other-base" });
  }
  return { id: snap.id, snapshot: snap.snapshot, name: snap.provider.name_he, provider: memberKindOf(snap.provider.class), fees, left };
}

/**
 * What a template leaves out of a deal, with why: a line of a house's price list (`line`, its id), or one of a track's two fees (`fee`):
 * one the product may not charge (PF-06, `none-by-rule`), or one the regulator's data gives no figure for (`no-value`).
 */
export type LeftOut = { line: string; why: LeftWhy } | { fee: "balance" | "deposit"; why: "none-by-rule" | "no-value" };

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
  else if (v.balance.value > 0) fees.push({ kind: "balance", stages: [{ price: buildPrice("balance", { form: "held", figures: { rate: num(v.balance) }, per: 12, every: 1 }) }] });
  if (depositFeeNoneByRule(v.deposit)) left.push({ fee: "deposit", why: "none-by-rule" });
  else if (!known(v.deposit)) left.push({ fee: "deposit", why: "no-value" });
  else if (v.deposit.value > 0) fees.push({ kind: "deposit", stages: [{ price: buildPrice("deposit", { form: "action", figures: { rate: num(v.deposit) } }) }] });
  return { fees, left };
}

// ---------------------------------------------------------------- the picker, and filling a deal

/**
 * A template a picker offers for a kind: a house's price list (its plans are tracks inside its trade fee, F-114), or a track (with its
 * company, to group by, its short name under the company where it is shorter, D54, and the yearly fee on the savings its pick fills,
 * `saving`, where it fills one).
 */
export type TemplateOption = { id: string; name: string; source: "house" } | { id: string; name: string; source: "track"; company: string; short?: string; saving?: SiteValue };

const HOUSE = "house:";
const TRACK = "track:";
const houseId = (h: HouseTemplate) => `${HOUSE}${h.id}`;

/** A house by its template id (`house:<id>`); null where no house has it. */
const houseOf = (id: string, data: Pick<FeesData, "houses">): HouseTemplate | null => (id.startsWith(HOUSE) ? (data.houses.find((x) => houseId(x) === id) ?? null) : null);
const trackId = (t: TrackLite) => `${TRACK}${t.id}`;

/** Where a template comes from, by its id: a house's price list or a track. */
export const templateSource = (id: string): "house" | "track" => (id.startsWith(TRACK) ? "track" : "house");

/**
 * The templates for a kind, for a picker: every house's price list for a securities account; every track the regulator's data maps to the
 * kind, for the provident family. Other kinds have none.
 */
export function templateOptions(kind: FeeDeal["kind"], data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): TemplateOption[] {
  if (kind === "brokerage-account") return data.houses.map((h) => ({ id: houseId(h), name: h.name, source: "house" as const }));
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

/** A template as it fills a deal: its name, its fees, what it leaves out with why, and a house's provider kind. */
export interface Template {
  name: string;
  fees: TemplateFee[];
  left: LeftOut[];
  provider?: ProviderKind;
}

/** The template `id` for a deal of `deal`'s kind: a house's whole price list, a track's two fees. Null where the id names no template of the deal's kind. */
export function templateOf(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): Template | null {
  if (id.startsWith(HOUSE) && deal.kind === "brokerage-account") {
    const h = houseOf(id, data);
    if (!h) return null;
    return { name: h.name, fees: h.fees, left: h.left.map(({ lineId, why }) => ({ line: lineId, why })), provider: h.provider };
  }
  if (id.startsWith(TRACK)) {
    const t = data.tracks.find((x) => trackId(x) === id);
    if (!t || t.wrapperId !== deal.kind) return null;
    return { name: `${t.name} (${t.company})`, ...trackTemplate(t, data, today) };
  }
  return null;
}

/** A template's fee as a fee of the deal, with its id; a fee with cases is a fresh copy, so two deals filled from one template share nothing. */
const asFee = (f: TemplateFee, id: string): Fee => ({ ...structuredClone(f), id }) as Fee;

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
    if (at >= 0) fees[at] = asFee(f, fees[at]!.id);
    else fees = [...fees, asFee(f, newFeeId())];
  }
  return { ...deal, fees, template: { id, name: t.name }, ...(t.provider ? { provider: t.provider } : {}) };
}

/**
 * A template's name as a deal's name: whole where it fits in `NAME_MAX`; otherwise cut after its last whole word that leaves room for "…",
 * with the commas, colons and dashes at the cut taken off, never inside a word ("Interactive Brokers, IBKR Pro - Fixed: מניות ותעודות
 * סל…"), and before a bracket the cut would leave open (a track's company: "… (עד 25% במניות)…"). The template keeps its whole name, which
 * the page says where the deal was filled from.
 */
export function dealName(name: string): string {
  const n = name.trim();
  if (n.length <= NAME_MAX) return n;
  const room = n.slice(0, NAME_MAX); // the "…" takes the place of the space before the cut word
  const cut = room.lastIndexOf(" ");
  let head = cut > 0 ? room.slice(0, cut) : room.slice(0, NAME_MAX - 1);
  const open = head.lastIndexOf("(");
  if (open > 0 && head.indexOf(")", open) < 0) head = head.slice(0, open);
  return `${head.replace(/[\s,:;\-–]+$/u, "")}…`;
}

/**
 * A new deal filled from a template, beside `from` (the deal on screen, which it never changes): of `from`'s kind and read for its picks,
 * named by the template. Null where the id names no template of the kind.
 */
export function dealFromTemplate(from: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const d = fillDeal({ ...newDeal(from.kind), ...(from.readFor ? { readFor: from.readFor } : {}) }, id, data, today);
  return d && { ...d, name: dealName(d.template?.name ?? "") };
}

/**
 * The deal on screen with a track picked for it in the builder: the same deal (its id and place in the saved list), naming
 * the track. The track's fees replace the deal's where it has none or every fee in it holds nothing the person gave (`untouched`: as a
 * template filled it, or just added and still asking for its price, which stays where the track has no fee of its kind); a deal
 * with any fee the person typed or changed keeps every fee as it is, and its template says the track filled none (`feesKept`). The
 * track's name becomes the deal's where the deal has none or still has the name the previous template gave it; a name the person typed
 * stays. Null where the id names no template of the deal's kind.
 */
export function pickTrack(deal: FeeDeal, id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const t = templateOf(deal, id, data, today);
  if (!t) return null;
  const name = dealName(t.name);
  const named = deal.name.trim() === "" || (deal.template !== undefined && deal.name === dealName(deal.template.name));
  const base = { ...deal, ...(named ? { name } : {}) };
  if (!deal.fees.every(untouched)) return { ...base, template: { id, name: t.name, feesKept: true } };
  // a fee of a kind the deal already has keeps its id, so the fee chosen on screen stays chosen; a fee just added, still asking for its
  // price, stays where the track has none of its kind
  const fees = [...t.fees.map((f) => asFee(f, deal.fees.find((x) => x.kind === f.kind)?.id ?? newFeeId())), ...deal.fees.filter((f) => !t.fees.some((x) => x.kind === f.kind) && !pricePriced(pricedOf(f).stages[0]!.price))];
  return { ...base, fees, template: { id, name: t.name }, ...(t.provider ? { provider: t.provider } : {}) };
}

/** The houses whose price list fills a fee of `kind` for a securities account's deal: the price lists a single fee can be filled from. None for another kind of deal. */
export function feePriceLists(deal: FeeDeal, kind: FeeKindId, data: Pick<FeesData, "houses">): { id: string; name: string }[] {
  if (deal.kind !== "brokerage-account") return [];
  return data.houses.filter((h) => h.fees.some((f) => f.kind === kind)).map((h) => ({ id: houseId(h), name: h.name }));
}

/**
 * A house's name by its template id (`house:<id>`, or `house:<id>/<line>`, the id of one way to buy at the house that a deal saved before
 * cases may name); null where no house has it.
 */
export const houseName = (id: string, data: Pick<FeesData, "houses">): string | null => houseOf(id.split("/", 1)[0]!, data)?.name ?? null;

/**
 * The deal with one fee filled from a house's price list (`feePriceLists`): the fee keeps its id and place, and takes the list's fee whole,
 * its cases with it where the list prints several prices, with their sources, a sale priced as a purchase. No other fee changes, nor the
 * deal's name or template. A house of another provider kind than the deal names takes the deal's provider away: the deal's fees are then
 * priced by more than one kind of provider, and a cap that binds only some providers is stated without a judgement (F-113). Null where the
 * list has no line for the fee.
 */
export function fillFee(deal: FeeDeal, feeId: string, houseIdOf: string, data: Pick<FeesData, "houses">): FeeDeal | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  const h = data.houses.find((x) => houseId(x) === houseIdOf);
  if (!fee || !h || deal.kind !== "brokerage-account") return null;
  const t = h.fees.find((f) => f.kind === fee.kind);
  if (!t) return null;
  const filled: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === feeId ? asFee({ ...t, ...(fee.name !== undefined ? { name: fee.name } : {}) }, f.id) : f)) };
  if (!deal.provider || deal.provider === h.provider) return filled;
  const { provider: _p, ...rest } = filled;
  return rest;
}

/** A row's title in the track picker: a track's short name where it has one (D54), else the template's name. */
export const rowTitle = (o: TemplateOption): string => (o.source === "track" ? (o.short ?? o.name) : o.name);

/** The templates whose name, a track's short name or its company holds the words typed. */
export function matching(options: readonly TemplateOption[], query: string): readonly TemplateOption[] {
  const q = query.trim();
  if (!q) return options;
  return options.filter((o) => o.name.includes(q) || (o.source === "track" && (o.short?.includes(q) || o.company.includes(q))));
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
