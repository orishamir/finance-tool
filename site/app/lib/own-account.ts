// An account on your own terms, started from a house (founder, 2026-11-04; F-101). The pure part: the starting points a house offers (its price
// list, each group or joining offer that states numbers), the group's prices copied into the person's entry, and the tariff the engine runs,
// built in layers: the house's own list tariff (which the provider workbench reads with its `buildTariff` at level list, so no second reading of a
// price list exists), then the group's values on the lines they name, then the person's own. A group's price ends at its own `for_months` and
// the person's stay in the group ends them all (F-101: a sequence of tariffs).
//
// No runtime import of the engine, invest.ts or the copy files: state.ts reads custom-entries.ts, which reads this, on every page.
import type { Commission, Custody, EnteredTariff, LayeredRun, LayeredUnusable, SecuritiesTariff } from "@finance-tool/engine";
import type { FeesSnapshot, GroupEntry, GroupPrice, GroupPriceValue, ValueObject } from "@finance-tool/schema";
import type { CustomBroker } from "./custom-entries";
import type { SiteValue } from "./value";

// ---------------------------------------------------------------- what the entry keeps of a group

/** A group or joining offer as it stood in the house's record when the account was started (docs/data-schema.md 3.6): kept whole, so a later change of the record moves nothing in the row. */
export interface GroupCopy {
  /** The entry's name, for display. */
  name: string;
  kind: GroupEntry["kind"];
  /** The date of the record it was copied from. */
  snapshot: string;
  /** Every price of the entry, with its words and source; the ones with a `value` are the ones the row prices. */
  prices: GroupPrice[];
  /**
   * The fees whose price the person chose to use although its words do not name fund units (the panel's "use this price"). An adopted price is
   * read like one that names funds: it keeps its own end (`for_months`) and the person's stay in the group. Absent: none.
   */
  adopted?: GroupFee[];
  /** F-102: the group's own current-account price where its annex prints one (the record's `current_account` of the entry): exempt for
   *  `exemptMonths` from joining, with where the annex prints it. Read only where the bank's row counts its current account. A copy saved
   *  before it existed has none; one saved before its source was kept (2026-11-06) has no `source`. */
  currentAccount?: { exemptMonths: number; source?: { url: string; title: string; page?: number } };
}

/** The house an account is built on, by its provider id (so a newer price list is followed), and the group it started from, if any. */
export interface BrokerBase {
  houseId: string;
  /** For display when the house is no longer on the site. */
  houseName: string;
  group: GroupCopy | null;
}

export type GroupFee = GroupPrice["fee"];

// ---------------------------------------------------------------- starting points

export interface StartingPoint {
  /** `list`, or `group:<n>` for the n-th entry of the record's groups. */
  key: string;
  kind: "list" | GroupEntry["kind"];
  nameHe: string;
  /** Null for the price list. */
  group: GroupCopy | null;
  /** How many of the entry's prices state numbers (the ones the row prices), and how many are words only. */
  priced: number;
  wordsOnly: number;
  /** The months the entry's prices hold from joining, each once, where the record prints them (Leumi's opening offer: 12). A price that prints none holds for as long as the person stays; the "until when" field starts empty. */
  endsMonths: number[];
}

/** The distinct `for_months` of a group's prices, in order: the ends the record prints. A price that states none has no end of its own. */
export function priceEndsOf(prices: readonly Pick<GroupPrice, "value">[]): number[] {
  return [...new Set(prices.flatMap((p) => (p.value?.for_months !== undefined ? [p.value.for_months] : [])))].sort((a, b) => a - b);
}

export const copyOfGroup = (s: Pick<FeesSnapshot, "snapshot">, e: GroupEntry): GroupCopy => ({ name: e.name_he, kind: e.kind, snapshot: s.snapshot, prices: e.prices.map((p) => structuredClone(p)), ...(e.current_account ? { currentAccount: { exemptMonths: e.current_account.for_months, source: { url: e.current_account.source.url, title: e.current_account.source.title, ...(e.current_account.source.page !== undefined ? { page: e.current_account.source.page } : {}) } } } : {}) });

/** The price list first, then each group or offer of the house's latest record that states at least one price in numbers, in the record's order. */
export function startingPointsOf(s: FeesSnapshot): StartingPoint[] {
  const out: StartingPoint[] = [{ key: "list", kind: "list", nameHe: "", group: null, priced: 0, wordsOnly: 0, endsMonths: [] }];
  const groups = s.groups;
  if (groups?.state !== "prices") return out;
  groups.entries.forEach((e, i) => {
    const priced = e.prices.filter((p) => p.value).length;
    if (priced === 0) return;
    out.push({ key: `group:${i}`, kind: e.kind, nameHe: e.name_he, group: copyOfGroup(s, e), priced, wordsOnly: e.prices.length - priced, endsMonths: priceEndsOf(e.prices) });
  });
  return out;
}

export const baseOf = (s: Pick<FeesSnapshot, "id" | "snapshot"> & { provider: Pick<FeesSnapshot["provider"], "name_he"> }, point: Pick<StartingPoint, "group">): BrokerBase => ({ houseId: s.id, houseName: s.provider.name_he, group: point.group });

// ---------------------------------------------------------------- a group's figures, as sourced values

/** The lines of a group's prices that state numbers, by fee. */
export function groupValues(g: GroupCopy | null | undefined): Partial<Record<GroupFee, { price: GroupPrice; value: GroupPriceValue }>> {
  const out: Partial<Record<GroupFee, { price: GroupPrice; value: GroupPriceValue }>> = {};
  for (const price of g?.prices ?? []) if (price.value) out[price.fee] = { price, value: price.value };
  return out;
}

export type FigurePart = "rate" | "discount" | "floor" | "flat" | "flat_up_to" | "per_share" | "min" | "max" | "exempt" | "for_months";

/** One number of a group price as a sourced value: the group's own document is its source, a company's figure (institution strength)
 * shown only beside that house, so its own (D31: plain sourced, no caution). */
export function groupFigure(g: GroupCopy, houseName: string, price: GroupPrice, part: FigurePart): SiteValue | null {
  const v = price.value;
  if (!v) return null;
  const trade = price.fee.startsWith("trade");
  const usd = v.currency === "USD";
  let value: number | undefined;
  let unit: ValueObject["unit"] = "pct";
  switch (part) {
    case "rate": value = v.rate_pct; unit = trade ? "pct_of_trade" : "pct_of_balance_per_period"; break;
    case "discount": value = v.discount_pct; unit = "pct"; break;
    case "floor": value = v.not_below_pct; unit = "pct_of_trade"; break;
    case "flat": value = v.flat; unit = usd ? "usd_per_trade" : "nis_per_trade"; break;
    case "flat_up_to": value = v.flat_up_to; unit = usd ? "usd" : "nis"; break;
    case "per_share": value = v.per_share_cents === undefined ? undefined : v.per_share_cents / 100; unit = "usd_per_share"; break;
    case "min": value = v.min; unit = trade ? (usd ? "usd_per_trade" : "nis_per_trade") : "nis"; break;
    case "max": value = v.max; unit = trade ? (usd ? "usd_per_trade" : "nis_per_trade") : "nis"; break;
    case "exempt": value = v.exempt ? 0 : undefined; unit = trade ? "pct_of_trade" : "pct_of_balance_per_period"; break;
    case "for_months": value = v.for_months; unit = "months"; break;
  }
  if (value === undefined) return null;
  return {
    value,
    unit,
    source: { url: price.source.url, title: price.source.title, publisher: houseName, strength: "institution" },
    own: houseName,
    checked: g.snapshot,
    effective_from: null,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
    about: `${g.name}: ${price.price_he}`,
  };
}

const PARTS: FigurePart[] = ["rate", "discount", "floor", "flat", "flat_up_to", "per_share", "min", "max", "exempt", "for_months"];
/** Every number of the group's priced lines the run reads (those whose words name fund units) as a sourced value, for a computed figure's list of inputs (D7). */
export function groupInputs(b: Pick<CustomBroker, "base">): Record<string, SiteValue> {
  const g = b.base?.group;
  if (!b.base || !g) return {};
  const out: Record<string, SiteValue> = {};
  for (const { price } of Object.values(groupValues(g))) for (const part of price.names_fund || g.adopted?.includes(price.fee) ? PARTS : []) {
    const fig = groupFigure(g, b.base.houseName, price, part);
    if (fig) out[`${g.name}: ${price.fee} ${part}`] = fig;
  }
  return out;
}

// ---------------------------------------------------------------- the layers

const MONTHS = { month: 1, quarter: 3, year: 12 } as const;
const without = <T extends object, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> => {
  const copy = { ...o };
  for (const k of keys) delete copy[k];
  return copy;
};

/** Thrown inside a layer that needs what the run lacks; `layeredTariff` hands it to the workbench as the provider's reason. */
class Unusable {
  constructor(readonly out: LayeredUnusable) {}
}

/** An amount of a group price in shekels: shekels as they are, dollars at the run's rate (a run without one cannot price it). */
function inShekels(amount: number, currency: GroupPriceValue["currency"], run: LayeredRun): number {
  if (currency !== "USD") return amount;
  const rate = run.fx?.USD;
  if (typeof rate !== "number" || !(rate > 0)) throw new Unusable({ unusable: "needs-fx-rate", detail: "a group price in dollars: no dollar exchange rate in the run" });
  return amount * rate;
}

/** What a commission's own rate shape is made of: a stated rate (a percent, a price per share) replaces all of it and keeps the bounds. */
const RATE_SHAPE = ["flatUpTo", "perShare", "perShareAbove", "perCurrencyUnit"] as const;

/**
 * A group's price over a trade commission: replaces what the price states, keeps what it does not (silence is not zero). A stated rate replaces
 * the commission's whole rate shape (a flat price, a price per share), keeping its minimum and maximum unless the price states its own
 * (finance review 2026-11-04).
 */
export function groupTrade(c: Commission | undefined, v: GroupPriceValue, run: LayeredRun): Commission {
  if (v.exempt) return { rate: 0 };
  const bounds = (): Pick<Commission, "min" | "max"> => ({ ...(v.min !== undefined ? { min: inShekels(v.min, v.currency, run) } : {}), ...(v.max !== undefined ? { max: inShekels(v.max, v.currency, run) } : {}) });
  if (v.flat !== undefined) {
    const amount = inShekels(v.flat, v.currency, run);
    const upTo = v.flat_up_to === undefined ? Infinity : inShekels(v.flat_up_to, v.currency, run);
    return { ...(c ?? { rate: 0 }), min: c?.min ?? amount, flatUpTo: { amount, upTo } };
  }
  if (v.per_share_cents !== undefined) {
    if (!run.sharePrice) throw new Unusable({ unusable: "needs-share-price", detail: "a group price per share: the fund record has no share_price" });
    return { ...without(c ?? { rate: 0 }, ...RATE_SHAPE), rate: 0, perShare: inShekels(v.per_share_cents / 100, v.currency, run), ...bounds() };
  }
  const base = without(c ?? { rate: 0 }, ...RATE_SHAPE);
  if (v.discount_pct !== undefined) {
    const keep = 1 - v.discount_pct / 100;
    const rate = (c?.rate ?? 0) * keep;
    // a discount is off the whole price of the house for the fee, whatever shape it has
    return {
      ...base,
      rate: v.not_below_pct !== undefined ? Math.max(rate, v.not_below_pct / 100) : rate,
      ...(c?.flatUpTo ? { flatUpTo: { amount: c.flatUpTo.amount * keep, upTo: c.flatUpTo.upTo } } : {}),
      ...(c?.perShare ? { perShare: c.perShare * keep } : {}),
      ...(c?.perShareAbove ? { perShareAbove: { shares: c.perShareAbove.shares, perShare: c.perShareAbove.perShare * keep } } : {}),
      ...(c?.perCurrencyUnit ? { perCurrencyUnit: c.perCurrencyUnit * keep } : {}),
    };
  }
  return { ...base, rate: (v.rate_pct ?? 0) / 100, ...bounds() };
}

/** A group's price over a custody line. A bound printed for a charging period of the list is carried per month into the group's period (F-14). */
export function groupCustody(c: Custody | undefined, v: GroupPriceValue, run: LayeredRun): Custody | undefined {
  if (v.exempt) return { rate: 0, everyMonths: c?.everyMonths ?? 3 };
  if (v.discount_pct !== undefined) return c ? { ...c, rate: c.rate * (1 - v.discount_pct / 100) } : undefined;
  const every = v.per ? (v.per === "trade" ? (c?.everyMonths ?? 3) : MONTHS[v.per]) : (c?.everyMonths ?? 3);
  const perMonth = (b: number | undefined) => (b === undefined || !c ? undefined : (b / c.everyMonths) * every);
  const min = v.min !== undefined ? inShekels(v.min, v.currency, run) : perMonth(c?.min);
  const max = v.max !== undefined ? inShekels(v.max, v.currency, run) : perMonth(c?.max);
  return { rate: (v.rate_pct ?? 0) / 100, everyMonths: every, ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}) };
}

// ---------------------------------------------------------------- which of a group's prices the run reads

/** One price of the group the run applies: the fee it is for, its numbers, which side it covers and the month it ends (Infinity: it does not). */
interface Part {
  /** `account`: the group's own current-account price (F-102), exempt. */
  fee: "trade" | "custody" | "account";
  value: GroupPriceValue;
  /** `buy` or `sell` where the words name only that side. */
  side: GroupPriceValue["side"];
  end: number;
}

/**
 * The group's prices the run reads on this kind of holding. A price is read only if its own words name fund units (`names_fund`, D42 and "no price
 * from analogy": a price for shares and bonds is not a price for a fund) or the person adopted it (`GroupCopy.adopted`); the panel shows the others'
 * words beside the list price, with a way to use one. A house whose price list has no line for the kind of holding has none for a group's price
 * to replace. Each price ends at its own `for_months`, and the person's stay in the group (`stayMonths`) ends them all no later.
 */
export function partsOf(g: GroupCopy | null | undefined, list: SecuritiesTariff, run: LayeredRun, stayMonths: number | null): Part[] {
  const values = groupValues(g);
  const side = run.instrumentClass === "foreign_securities" ? "abroad" : "israel";
  const out: Part[] = [];
  const adopted = g?.adopted ?? [];
  const add = (fee: Part["fee"], at: (typeof values)[GroupFee]) => {
    if (!at || !(at.price.names_fund || adopted.includes(at.price.fee))) return;
    out.push({ fee, value: at.value, side: at.value.side, end: Math.min(at.value.for_months ?? Infinity, stayMonths ?? Infinity) });
  };
  if (list.buy || list.sell) add("trade", values[`trade_${side}`]);
  if (list.custody) add("custody", values[`custody_${side}`]);
  // F-102: only where the row counts the bank's current account (the list carries its minimum), for its own end and the stay
  if (list.currentAccount !== undefined && g?.currentAccount) {
    const months = g.currentAccount.exemptMonths;
    out.push({ fee: "account", value: { exempt: true, for_months: months }, side: undefined, end: Math.min(months, stayMonths ?? Infinity) });
  }
  return out;
}

/** The tariff with the group's prices on the lines they name; a fee the group says nothing about stays the list's. */
export function applyParts(list: SecuritiesTariff, parts: readonly Part[], run: LayeredRun): SecuritiesTariff {
  const out: SecuritiesTariff = { ...list };
  for (const part of parts) {
    if (part.fee === "account") out.currentAccount = 0;
    else if (part.fee === "trade") {
      // a price that names a purchase alone or a sale alone leaves the other side the list's price
      if (part.side !== "sell") out.buy = groupTrade(list.buy, part.value, run);
      if (part.side !== "buy") out.sell = groupTrade(list.sell, part.value, run);
      // the list's standing-order line stays; a monthly purchase pays the lower of it and the group's regular price
      if (part.side !== "sell" && list.buyStanding) out.cheaperOfStandingTrade = true;
    } else {
      const c = groupCustody(list.custody, part.value, run);
      if (c) out.custody = c;
    }
  }
  return out;
}

/** The tariff with every price of the group on the lines it names, with no end (the whole plan). */
export const applyGroup = (list: SecuritiesTariff, g: GroupCopy | null | undefined, run: LayeredRun): SecuritiesTariff => applyParts(list, partsOf(g, list, run, null), run);

// ---------------------------------------------------------------- the person's own values

/** The numbers the person typed in an account built on a house: the draft's own fields, null meaning "as the base". */
type Own = Pick<CustomBroker, "tradePct" | "tradeMin" | "custodyPct" | "custodyMin" | "fxPct" | "monthlyFee">;
const num = (v: ValueObject | null): number | null => (v && typeof v.value === "number" ? v.value : null);

/**
 * The person's own values over a tariff: each fee type they typed replaces that part of the line; one they left empty is the base's. `list` is the
 * house's own tariff: a custody rate the person typed keeps the list's minimum and maximum, in the period of the tariff it is laid over, unless they
 * typed a minimum of their own. The list's standing-order line (and its conversion line) stays under a regular price they typed; a monthly purchase
 * pays the lower of the two.
 */
export function applyOwn(base: SecuritiesTariff, own: Own, list: SecuritiesTariff = base): SecuritiesTariff {
  const out: SecuritiesTariff = { ...base };
  const pct = num(own.tradePct);
  const min = num(own.tradeMin);
  if (pct !== null || min !== null) {
    const line = (c: Commission | undefined): Commission => {
      let next: Commission = { ...(c ?? { rate: 0 }) };
      if (pct !== null) {
        // a rate of one's own replaces a flat price, and the minimum that came with it
        const flat = !!next.flatUpTo;
        next = { ...without(next, ...RATE_SHAPE), rate: pct / 100 };
        if (flat && min === null) delete next.min;
      }
      if (min !== null) next.min = min;
      return next;
    };
    out.buy = line(base.buy);
    out.sell = line(base.sell);
    if (base.buyStanding) out.cheaperOfStandingTrade = true;
  }
  const cPct = num(own.custodyPct);
  const cMin = num(own.custodyMin);
  if (cPct !== null || cMin !== null) {
    const every = base.custody?.everyMonths ?? list.custody?.everyMonths ?? 1;
    // the list's bound is printed for the list's period; per month it is the same in every period (F-14)
    const fromList = (b: number | undefined) => (b === undefined || !list.custody ? undefined : (b / list.custody.everyMonths) * every);
    const keptMin = base.custody?.min ?? fromList(list.custody?.min);
    const keptMax = base.custody?.max ?? fromList(list.custody?.max);
    const next: Custody = { rate: base.custody?.rate ?? 0, everyMonths: every, ...(keptMin !== undefined ? { min: keptMin } : {}), ...(keptMax !== undefined ? { max: keptMax } : {}) };
    // typed as a percent a year and shekels a month: a period of `every` months is `every / 12` of the year and `every` months (F-14)
    if (cPct !== null) next.rate = ((cPct / 100) * every) / 12;
    if (cMin !== null) next.min = cMin * every;
    out.custody = next;
  }
  const fx = num(own.fxPct);
  if (fx !== null) {
    out.fx = typeof base.fx === "object" ? { ...without(base.fx, "perCurrencyUnit"), rate: fx / 100 } : fx / 100;
    if (base.fxStanding !== undefined) out.cheaperOfStandingFx = true;
  }
  const monthly = num(own.monthlyFee);
  if (monthly !== null) out.monthlyFee = monthly;
  return out;
}

// ---------------------------------------------------------------- adopting a price the group's words do not give for a fund

/** The group with the price of one fee used (or not) although its words do not name fund units: the person's choice, kept on the account. */
export function withAdopted(g: GroupCopy, fee: GroupFee, on: boolean): GroupCopy {
  const rest = (g.adopted ?? []).filter((f) => f !== fee);
  const adopted = on ? [...rest, fee] : rest;
  const { adopted: _drop, ...bare } = g;
  void _drop;
  return adopted.length ? { ...bare, adopted } : bare;
}

// ---------------------------------------------------------------- the sequence of tariffs

/** The lines the entered tariff names: everything the layers built (the provider's own `currency` stays the run's). */
function enteredOf(t: SecuritiesTariff): Omit<EnteredTariff, "until"> {
  const out: Omit<EnteredTariff, "until"> = {};
  if (t.buy) out.buy = t.buy;
  if (t.buyStanding) out.buyStanding = t.buyStanding;
  if (t.sell) out.sell = t.sell;
  if (t.redeem) out.redeem = t.redeem;
  if (t.custody) out.custody = t.custody;
  if (t.fx !== undefined) out.fx = t.fx;
  if (t.fxStanding !== undefined) out.fxStanding = t.fxStanding;
  if (t.fxSpread !== undefined) out.fxSpread = t.fxSpread;
  if (t.monthlyFee !== undefined) out.monthlyFee = t.monthlyFee;
  if (t.currentAccount !== undefined) out.currentAccount = t.currentAccount;
  if (t.cheaperOfStandingTrade) out.cheaperOfStandingTrade = true;
  if (t.cheaperOfStandingFx) out.cheaperOfStandingFx = true;
  return out;
}

export const untilMonthsOf = (b: Pick<CustomBroker, "untilYears">): number | null => (b.untilYears === null || b.untilYears === undefined ? null : Math.max(0, Math.round(b.untilYears * 12)));

/**
 * The tariff of an account built on a house (F-101), from the house's own list tariff for the fund and channel: the list, the group's prices
 * that name the holding, the person's. Each group price holds to its own end (`for_months`) and to the person's stay in the group (`untilYears`),
 * whichever is first; every month after the last of those ends is the list with the person's values. The person's own values hold for the whole plan.
 * The result is a sequence of tariffs, one for each stretch between two ends.
 */
export function layeredTariff(b: Pick<CustomBroker, "base" | "untilYears" | "tradePct" | "tradeMin" | "custodyPct" | "custodyMin" | "fxPct" | "monthlyFee">, list: SecuritiesTariff, run: LayeredRun): EnteredTariff | LayeredUnusable {
  try {
    const parts = partsOf(b.base?.group ?? null, list, run, untilMonthsOf(b));
    const ends = [...new Set(parts.map((p) => p.end).filter(Number.isFinite))].sort((a, c) => a - c);
    // the stretch that ends at `ends[k]` holds the prices that have not ended by then; the last stretch, the ones that never end
    const at = (k: number): EnteredTariff => {
      const held = parts.filter((p) => p.end >= (ends[k] ?? Infinity));
      const out = enteredOf(applyOwn(applyParts(list, held, run), b, list));
      // F-102: the group's own current-account price keeps where its annex prints it, for the row's sources
      const source = held.some((p) => p.fee === "account") ? b.base?.group?.currentAccount?.source : undefined;
      return source ? { ...out, currentAccountSource: source } : out;
    };
    let sequence: EnteredTariff = at(ends.length);
    for (let k = ends.length - 1; k >= 0; k--) sequence = { ...at(k), until: { months: ends[k]!, then: sequence } };
    return sequence;
  } catch (e) {
    if (e instanceof Unusable) return e.out;
    throw e;
  }
}

/** The builder `ProviderInput.layered` takes, for one account. */
export const layeredOf = (b: CustomBroker) => (list: SecuritiesTariff, run: LayeredRun): EnteredTariff | LayeredUnusable => layeredTariff(b, list, run);
