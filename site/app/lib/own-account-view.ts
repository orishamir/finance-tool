// An account on your own terms, started from a house (founder, 2026-11-04; F-101): what the panel shows. The prices by fee type in their three
// layers (the house's price list, the group's, the person's), each figure with its provenance, and the account's result on the page's plan:
// what is left at the horizon, its place among the compared rows, the difference against the house's own price-list row, and the cost by
// fee type of both. Nothing here prices anything itself: the run is the page's own (`buildInvest`, `pairCosts`) on the bundle that holds the entry.
import type { FeeLine } from "@finance-tool/engine";
import type { FeesSnapshot, GroupPrice } from "@finance-tool/schema";
import { invest as copy } from "../copy";
import type { CustomBroker } from "./custom-entries";
import { buildInvest, inputMap, listReading, pairCosts, type InvestArgs, type InvestView, type OptionId, type PairCosts } from "./invest";
import { groupFigure, groupValues, type FigurePart, type GroupCopy } from "./own-account";
import type { WorkbenchBundle, WorkbenchInputs } from "./providers";
import { computed, ownBy, type SiteValue } from "./value";

// ---------------------------------------------------------------- the layers by fee type

/** The fee types the panel's table and bars show. */
export type FeeType = "trade" | "custody" | "fixed" | "conversion";
export const FEE_TYPES: readonly FeeType[] = ["trade", "custody", "fixed", "conversion"];
/** The engine's name for each, as `pairCosts` reports a cost. */
export const FEE_LINE: Record<FeeType, FeeLine> = { trade: "trade", custody: "custody", fixed: "fixed", conversion: "fx" };

export type FigureKind = FigurePart;

/** One number with its provenance: a sourced value (the house's price list line, or the group's document) or an entered one. */
export interface LayerFigure {
  kind: FigureKind;
  /** What the rate is of: each trade, or the balance for a month, a quarter or a year. */
  per?: "trade" | "month" | "quarter" | "year";
  value: SiteValue;
}

export interface FeeLayers {
  fee: FeeType;
  /** The house's price list for this kind of holding: the lines the comparison reads. Empty: the list has no line for it. */
  list: LayerFigure[];
  /** The group's price for this fee; null when the group says nothing on it. `figures` is empty when its words state no single price (the words alone stand). */
  group: {
    /** The group price's fee key (`custody_israel`), the one `withAdopted` takes. */
    key: GroupPrice["fee"];
    figures: LayerFigure[];
    words: string;
    /** The words the price is about ("מניות ואגרות חוב…") and whether they name fund units: when they do not, the panel says so beside the line (D42). */
    holdings: string;
    namesFund: boolean;
    source: GroupPrice["source"];
    /** How long the price holds from joining where the record says so. */
    forMonths: number | null;
    /** `buy` or `sell` where the words name only that side; the other side keeps the list's price. */
    side: "buy" | "sell" | null;
    /**
     * Whether the row's price is the group's for this holding: the words name fund units, or the person chose to use the price (`adopted`). False
     * otherwise (the site does not apply a price for shares and bonds to a fund, D42): the panel shows `words` and `holdings` beside the list price.
     */
    applied: boolean;
    /** The person chose to use this price although its words do not name fund units: it is their choice (entered, blue), with the group's source beside it, and it can be undone. */
    adopted: boolean;
    /** A price that does not name funds and states numbers: the panel offers "use this price" (`withAdopted`). */
    adoptable: boolean;
  } | null;
  /** What the person typed for this fee. */
  yours: LayerFigure[];
  /** The layer whose price the row runs on for this fee. */
  setBy: "list" | "group" | "yours";
}

const OWN_PARTS: Record<FeeType, [keyof CustomBroker, FigureKind, LayerFigure["per"]?][]> = {
  trade: [["tradePct", "rate", "trade"], ["tradeMin", "min"]],
  custody: [["custodyPct", "rate", "year"], ["custodyMin", "min", "month"]],
  fixed: [["monthlyFee", "rate", "month"]],
  conversion: [["fxPct", "rate", "trade"]],
};

const SIDE = (cls: string) => (cls === "foreign_securities" ? "abroad" : "israel");

/**
 * The three layers of an account's prices for a kind of holding, by fee type. `house`: the house's latest record. The list's figures are the
 * very values of the record's line the comparison reads; the group's are sourced to the group's document; the person's are entered.
 * Null when the house's tariff has no reading for the kind of holding.
 */
export function layersOf(bundle: WorkbenchBundle, plan: WorkbenchInputs, b: CustomBroker, house: FeesSnapshot, option: OptionId): FeeLayers[] | null {
  const reading = listReading(bundle, house, option, plan);
  if (!reading) return null;
  const { built, run, line } = reading;
  const used = built.linesUsed.map((id) => line(id)).filter((l): l is FeesSnapshot["lines"][number] => !!l);
  const listLine = (fee: FeeType) => used.find((l) => l.base === { trade: "trade", custody: "custody", fixed: "fixed_period", conversion: "fx" }[fee] && l.band !== "הוראת קבע" && l.band !== "השקעה קבועה אוטומטית" && l.band !== "פדיון");
  const group: GroupCopy | null = b.base?.group ?? null;
  const values = groupValues(group);
  const side = SIDE(run.instrumentClass);
  const groupFee = (fee: FeeType) => (fee === "trade" || fee === "custody" ? (`${fee}_${side}` as GroupPrice["fee"]) : null);

  return FEE_TYPES.map((fee): FeeLayers => {
    const l = listLine(fee);
    const listFigures: LayerFigure[] = [];
    if (l) {
      // the house's own price list, shown in the panel named after that house: its own figure (D31), not a caution
      const own = (v: unknown) => ownBy(v as SiteValue, b.base?.houseName ?? house.provider.name_he);
      const per = l.period ?? (fee === "trade" || fee === "conversion" ? "trade" : "month");
      listFigures.push({ kind: "rate", per, value: own(l.rate) });
      if (l.min && l.min.value !== null) listFigures.push({ kind: "min", value: own(l.min) });
      if (l.max && l.max.value !== null) listFigures.push({ kind: "max", value: own(l.max) });
    }
    const gf = groupFee(fee);
    const price = gf ? (group?.prices ?? []).find((p) => p.fee === gf) : undefined;
    let groupLayer: FeeLayers["group"] = null;
    if (group && b.base && price) {
      const figures: LayerFigure[] = [];
      const v = price.value;
      if (v) {
        const per = v.per;
        const add = (kind: FigurePart, p?: LayerFigure["per"]) => {
          const value = groupFigure(group, b.base!.houseName, price, kind);
          if (value) figures.push({ kind, ...(p ? { per: p } : {}), value });
        };
        add("exempt");
        add("rate", per);
        add("discount");
        add("floor");
        add("flat", "trade");
        add("flat_up_to");
        add("per_share", "trade");
        add("min");
        add("max");
      }
      const adopted = !!group.adopted?.includes(price.fee);
      groupLayer = {
        key: price.fee,
        figures,
        words: price.price_he,
        holdings: price.holdings_he,
        namesFund: price.names_fund,
        source: price.source,
        forMonths: v?.for_months ?? null,
        side: v?.side ?? null,
        applied: !!v && (price.names_fund || adopted),
        adopted: !!v && !price.names_fund && adopted,
        adoptable: !!v && !price.names_fund,
      };
    }
    const yours: LayerFigure[] = [];
    for (const [key, kind, per] of OWN_PARTS[fee]) {
      const value = b[key] as SiteValue | null;
      if (value) yours.push({ kind, ...(per ? { per } : {}), value });
    }
    const groupPriced = !!gf && !!values[gf] && (values[gf]!.price.names_fund || !!group?.adopted?.includes(values[gf]!.price.fee));
    return { fee, list: listFigures, group: groupLayer, yours, setBy: yours.length ? "yours" : groupPriced ? "group" : "list" };
  });
}

/** The group with one line sent back to the house's price list: its figures are dropped, its words stay (the panel's way back on a line the group's document does not name funds for). */
export function withoutGroupLine(group: GroupCopy, fee: GroupPrice["fee"]): GroupCopy {
  return { ...group, prices: group.prices.map((p) => (p.fee === fee ? (({ value: _v, ...rest }) => rest)(p) : p)) };
}

// ---------------------------------------------------------------- the account's result on the plan

export interface OwnAccountResult {
  brokerId: string;
  /** The fund the three numbers are about: the account's cheapest way on the page's index, the same fund at the house for the comparison. */
  fundId: string;
  fundName: string;
  /** Real value left at the horizon (F-65), with its inputs, the typed and the group's among them. */
  left: SiteValue;
  /** The place among the compared rows of the account's group of houses (the collected ones and this one), by value left: 1 is the most left. A computed count (F-63). */
  place: SiteValue;
  rank: number;
  of: number;
  /** Value left less the house's own price-list row for the same fund, today's shekels (F-65): positive when the account leaves more. Null when the house has no price for the fund. */
  difference: SiteValue | null;
  /** The cost by fee type, the fund's and the state's part: this account, and the house's own price list. Both through `pairCosts`, so they share one scale. */
  yours: PairCosts;
  list: PairCosts | null;
  /** The fee type whose cost differs most between the two, with the gap (the list's less this account's): computed (F-91). Null without a list row or when no fee differs. */
  deciding: { line: FeeLine; gap: SiteValue } | null;
}

/**
 * The account's result on the page's plan and index. `a.bundle` is the bundle with the entry in it (`withCustomEntries`); `view` is the page's
 * own `buildInvest` of it when the caller has one. Null when the account has no priced way on this index.
 */
export function ownAccountResult(a: InvestArgs & { broker: CustomBroker; view?: InvestView }): OwnAccountResult | null {
  const view = a.view ?? buildInvest(a);
  const id = a.broker.id;
  const row = view.houses.find((h) => h.provider.id === id);
  const best = row?.best;
  if (!row || !best?.price) return null;
  const mine = best.price;
  const fundId = best.fund.rec.id;
  const inputs = { ...inputMap(a.plan), ...(a.bundle.entered?.inputs[id] ?? {}) };
  const today = a.bundle.today;

  // the place among the compared rows: the collected houses of the account's group, each at its own best way, and this one
  const rivals = view.houses.filter((h) => h.group === row.group && !h.provider.custom && h.best?.price);
  const rank = 1 + rivals.filter((h) => h.best!.price!.valueN > mine.valueN).length;
  const of = rivals.length + 1;
  const place = computed(rank, "count", "F-63", inputs, { today, about: copy.ownAccount.placeAbout(of) });

  // against the house's own price-list row for the same fund (change one thing at a time)
  const houseId = a.broker.base?.houseId ?? null;
  const houseAt = houseId ? best.fund.byHouse[houseId] : undefined;
  const house = houseAt && "value" in houseAt ? houseAt : null;
  const difference = house ? computed(mine.valueN - house.valueN, "nis", "F-65", inputs, { today, about: copy.ownAccount.differenceAbout }) : null;

  const base = { bundle: a.bundle, index: a.index, plan: a.plan, ...(a.yourBroker !== undefined ? { yourBroker: a.yourBroker } : {}), ...(a.assumptions ? { assumptions: a.assumptions } : {}) };
  const yours = pairCosts({ ...base, fundId, providerId: id });
  if (!yours) return null;
  const list = houseId && house ? pairCosts({ ...base, fundId, providerId: houseId }) : null;

  let deciding: OwnAccountResult["deciding"] = null;
  if (list) {
    const cost = (pc: PairCosts, line: FeeLine) => (pc.account.find((x) => x.line === line)?.cost.value as number | undefined) ?? 0;
    let top = 0;
    for (const fee of FEE_TYPES) {
      const line = FEE_LINE[fee];
      const gap = cost(list, line) - cost(yours, line);
      if (Math.abs(gap) > Math.abs(top) && Math.abs(gap) >= 0.005) {
        top = gap;
        deciding = { line, gap: computed(gap, "nis", "F-91", inputs, { today, about: copy.ownAccount.decidingAbout(copy.pair.lines[line] ?? line) }) };
      }
    }
  }
  return { brokerId: id, fundId, fundName: best.fund.name, left: mine.value, place, rank, of, difference, yours, list, deciding };
}
