// A typed account moved into a deal (the move, method §10.4): each securities account the person typed on the indices page (D44, kept in the saved state
// as a `CustomBroker`) becomes one securities-account deal with an id derived from the account's, so the move adds nothing a second time.
// An account typed from scratch becomes a deal of its own fees, a field left empty a fee with no price yet (D56). An account built on a
// house (F-101) becomes a deal filled from that house's price list, the group's prices over it as prices over time and the typed figures on
// the case each fund's line is read in. What the account could buy becomes which cases the trade fee prices. Pure; no Hebrew.
import type { DealRun } from "@finance-tool/engine";
import type { GroupPrice, GroupPriceValue } from "@finance-tool/schema";
import type { CustomBroker } from "../custom-entries";
import { groupValues, untilMonthsOf, type GroupCopy, type GroupFee } from "../own-account";
import { OPTION_CLASS, OPTION_IDS } from "../invest";
import type { BundleSnapshot } from "../providers";
import { addBy } from "../fee-deal/edits/case";
import { feeOf } from "../fee-deal/cases";
import type { DealKind } from "../fee-deal/kinds";
import { blankFigure, hasCases, isList, monthKey, monthOf, namesPlaces, newDeal, newFeeId, thingValues, typed, type BoundCurrency, type Case, type CasesFee, type Fee, type FeeDeal, type MonthKey, type Num, type Price, type Priced, type Sourced, type Stage } from "../fee-deal/model";
import { fillDeal, type HouseTemplate } from "../fee-deal/templates";
import { sourcedOf } from "../fee-deal/values";
import { WHAT_VALUES, type FeeKindId, type Place } from "../fee-deal/shapes";
import { conditionsFor, isPlaceKind, LIST_IDS, type PlaceKind } from "../fee-deal/offers/conditions";
import { lineValueOf } from "./bundle";
import { ACCOUNT_KIND, planRead } from "./plan";

/** What the move reads beside the account: the houses' price lists as templates, the kinds, the houses' records (each one's line choice and a bank's current account), and the day. */
export interface MoveContext {
  houses: readonly HouseTemplate[];
  kinds: readonly DealKind[];
  snapshots: readonly Pick<BundleSnapshot, "id" | "lines" | "provider" | "current_account">[];
  /** Shekels per unit of each currency at the ECB's reference rates the indices page runs at (F-84, `fxRunInput`). */
  fx: Readonly<Record<string, number>>;
  today: string;
}

/** Why an account could not be moved: a group's price whose shape the deal cannot hold over the list's price there. */
export class MoveGap extends Error {}

// ---------------------------------------------------------------- the deal's id

const ACCOUNT_PREFIX = "custom-broker-";
const DEAL_ID = /^[a-z0-9-]{1,40}$/;

/** A short stable hash of a text, in base 36: the deal's id where the account's own would be too long for one. */
function hash36(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** The deal a typed account moves into, by id: `moved-` and the account's own part, so one account always makes the same deal. */
export function movedDealId(accountId: string): string {
  const own = accountId.startsWith(ACCOUNT_PREFIX) ? accountId.slice(ACCOUNT_PREFIX.length) : accountId;
  const id = `moved-${own}`;
  return DEAL_ID.test(id) ? id : `moved-${hash36(accountId)}`;
}

// ---------------------------------------------------------------- months

const addMonths = (key: MonthKey, n: number): MonthKey => {
  const c = monthOf(key);
  const k = c.y * 12 + (c.m - 1) + n;
  return monthKey({ y: Math.floor(k / 12), m: (k % 12) + 1 });
};

// ---------------------------------------------------------------- what the plan reads in a deal

/** The runs the indices page prices, one for each kind of fund it buys, on the side of the list each is priced on (F-63). */
const RUNS: { side: Place; run: DealRun }[] = OPTION_IDS.flatMap((o) => {
  const cls = OPTION_CLASS[o];
  const foreign = cls === "foreign_securities";
  const listings: DealRun["listing"][] = foreign ? ["us", "europe", undefined] : ["tase"];
  return listings.map((listing) => ({ side: (foreign ? "abroad" : "israel") as Place, run: { instrumentClass: cls, listing, currency: null, distributes: false, fx: {} } }));
});

/** The case of each fee the plan reads for some fund on a side (`null`: a fee whose price changes by nothing), by fee id. */
type ReadCases = Map<string, Set<string | null>>;

interface ReadContext {
  kinds: readonly DealKind[];
  today: string;
  lineValue?: ReturnType<typeof lineValueOf>;
}

/** The cases the plan reads in each run, one map per run of `RUNS` on the side (all runs where no side is named). */
function readRuns(deal: FeeDeal, ctx: ReadContext, side?: Place): ReadCases[] {
  return RUNS.filter((r) => !side || r.side === side).map((r) => {
    const out: ReadCases = new Map();
    for (const f of planRead(deal, r.run, ctx).fees) {
      const id = feeOf(f);
      if (!out.has(id)) out.set(id, new Set());
      out.get(id)!.add(f.read?.case ?? null);
    }
    return out;
  });
}

function readOn(deal: FeeDeal, ctx: ReadContext, side: Place): ReadCases {
  const out: ReadCases = new Map();
  for (const run of readRuns(deal, ctx, side)) for (const [id, cases] of run) out.set(id, new Set([...(out.get(id) ?? []), ...cases]));
  return out;
}

/** A fee with `fn` over the prices the plan reads (`cases`): the fee's own where its price changes by nothing, else each case read. */
function onRead(fee: Fee, cases: ReadonlySet<string | null> | undefined, fn: (x: Priced, c: Case | null) => Priced): Fee {
  if (!cases?.size) return fee;
  if (!hasCases(fee)) return cases.has(null) ? { ...fee, ...priced(fn(fee, null)) } : fee;
  return { ...fee, cases: fee.cases.map((c) => (cases.has(c.id) ? withPriced(c, fn(c, c)) : c)) };
}

const priced = (x: Priced): Priced => ({ stages: x.stages, ...(x.sale ? { sale: x.sale } : { sale: undefined }) });
function withPriced<T extends Priced>(c: T, x: Priced): T {
  const { stages: _s, sale: _sale, ...head } = c;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) } as T;
}

/** Every price of a fee's prices over time and its sale's, through `fn`. */
const eachPrice = (x: Priced, fn: (p: Price) => Price): Priced => ({ stages: x.stages.map((s) => ({ ...s, price: fn(s.price) })), ...(x.sale ? { sale: x.sale.map((s) => ({ ...s, price: fn(s.price) })) } : {}) });

/** The thing of a fee that says where what is bought or held is bought (what is bought for a trade, what is held for custody). */
const placeKindOf = (kind: FeeKindId): PlaceKind | null => (conditionsFor(kind).find((k) => isPlaceKind(k)) as PlaceKind | undefined) ?? null;

/** Where a value of a fee's place thing is bought: the site's own values', or a value of the house's own words with its place. */
function placeOf(fee: CasesFee, t: number, value: string): Place | null {
  const b = fee.by[t]!;
  return WHAT_VALUES[value]?.place ?? (namesPlaces(b) ? (b.own?.find((o) => o.name === value)?.place ?? null) : null);
}

/**
 * A fee whose price the plan reads apart for each side: where one price is read for funds on both sides, it is split by where what is
 * bought or held is bought, each value of its own case (a fee whose price changes by nothing first changes by that thing).
 */
function splitBySide(fee: Fee, shared: ReadonlySet<string | null>): Fee {
  const kind = placeKindOf(fee.kind);
  if (!kind) return fee;
  const t0 = hasCases(fee) ? fee.by.findIndex((b) => b.kind === kind) : -1;
  if (t0 < 0) return addBy(fee, { kind, values: [...LIST_IDS[kind]] });
  const f = fee as CasesFee;
  const cases = f.cases.flatMap((c): Case[] => {
    if (!shared.has(c.id)) return [c];
    const w = c.when[t0]!;
    const values = w === "any" ? thingValues(f, t0) : (w as string[]);
    return values.map((v, j) => ({ ...structuredClone(c), ...(j === 0 ? {} : { id: `${c.id}-${j}` }), when: c.when.map((x, k) => (k === t0 ? [v] : x)) }));
  });
  return { ...f, cases };
}

// ---------------------------------------------------------------- a group's price over the list's

const PER_MONTHS = { month: 1, quarter: 3, year: 12 } as const;

/** A group's figure as the deal holds a figure a template filled: the group's own document is its source (a company's figure about its own product, D31). */
function groupNum(g: GroupCopy, house: string, p: GroupPrice): (v: number) => Num {
  const src: Sourced = { url: p.source.url, title: p.source.title, publisher: house, strength: "institution", checked: g.snapshot, ...(p.source.page ? { page: p.source.page } : {}), own: house };
  return (v) => ({ v, src });
}

const currencyOf = (p: Price): BoundCurrency => ("currency" in p && p.currency ? p.currency : "ILS");
const curField = (c: BoundCurrency): { currency?: BoundCurrency } => (c === "ILS" ? {} : { currency: c });

type ActionLike = Extract<Price, { form: "action" | "perUnit" | "perAction" }>;
const isAction = (p: Price): p is ActionLike => p.form === "action" || p.form === "perUnit" || p.form === "perAction";

/** An action's price with its rate shape (its rate, a sum per unit, a sum per action, a flat price) replaced by a rate, its other parts kept (F-101 (1)). */
function asRate(p: ActionLike, rate: Num): Extract<Price, { form: "action" }> {
  const { form: _f, flat: _fl, discount: _d, ...rest } = p as ActionLike & { flat?: unknown; discount?: unknown };
  const { rate: _r, amount: _a, ...parts } = rest as typeof rest & { rate?: Num; amount?: Num };
  return { ...parts, form: "action", rate } as Extract<Price, { form: "action" }>;
}

/** F-101's group trade price over the list's (`groupTrade`), as a deal's price. */
function groupTrade(p: Price, v: GroupPriceValue, n: (v: number) => Num): Price {
  if (v.exempt) return { form: "free", src: n(0).src! };
  if (!isAction(p)) {
    if (p.form === "free" && v.rate_pct !== undefined) return { form: "action", rate: n(v.rate_pct), ...(v.min !== undefined ? { min: n(v.min) } : {}), ...(v.max !== undefined ? { max: n(v.max) } : {}), ...curField(v.currency ?? "ILS") };
    throw new MoveGap(`a group's trade price over a ${p.form} price`);
  }
  const listCur = currencyOf(p);
  if (v.rate_pct !== undefined || v.per_share_cents !== undefined) {
    const cur = v.currency ?? listCur;
    const keptMin = v.min === undefined && "min" in p ? p.min : undefined;
    const keptMax = v.max === undefined && "max" in p ? p.max : undefined;
    if ((keptMin || keptMax) && (v.min !== undefined || v.max !== undefined) && cur !== listCur) throw new MoveGap("a group's bound in another currency than the list's other bound");
    const bounds = { ...(v.min !== undefined ? { min: n(v.min) } : keptMin ? { min: keptMin } : {}), ...(v.max !== undefined ? { max: n(v.max) } : keptMax ? { max: keptMax } : {}) };
    const curOut = v.min !== undefined || v.max !== undefined ? (v.currency ?? listCur) : listCur;
    const { currency: _c, inTrade: _i, ...base } = asRate(p, n(v.rate_pct ?? 0));
    if (v.per_share_cents !== undefined) {
      const { rate: _r, ...rest } = base;
      return { ...rest, form: "perUnit", amount: n(v.per_share_cents / 100), ...bounds, ...curField(v.currency ?? "USD") } as Price;
    }
    return { ...base, ...bounds, ...curField(curOut), ...(curOut === listCur && "inTrade" in p && p.inTrade ? { inTrade: p.inTrade } : {}) };
  }
  if (v.discount_pct !== undefined) {
    if ("discount" in p && p.discount) throw new MoveGap("a group's discount over a price with a discount of its own");
    if (v.not_below_pct !== undefined) {
      if (p.form !== "action" || p.flat) throw new MoveGap("a group's floored discount over a price that is not a plain rate");
      return { ...p, rate: n(Math.max(p.rate.v * (1 - v.discount_pct / 100), v.not_below_pct)) };
    }
    return { ...p, discount: { pct: n(v.discount_pct) } };
  }
  if (v.flat !== undefined) {
    if (p.form !== "action" && p.form !== "perUnit") throw new MoveGap("a group's flat price over a sum per action");
    if ((v.currency ?? "ILS") !== listCur) throw new MoveGap("a group's flat price in another currency than the list's price");
    if (v.flat_up_to === undefined) throw new MoveGap("a group's flat price with no size it is limited to");
    return { ...p, min: p.min ?? n(v.flat), flat: { amount: n(v.flat), upTo: n(v.flat_up_to) } };
  }
  throw new MoveGap("a group's trade price of no shape the move knows");
}

/** A bound of a share of what is held, per month (F-14): as printed where it is printed per month, else a charge's over its months. */
const perMonth = (p: Extract<Price, { form: "held" }>, b: Num): number => (p.boundsEvery === 1 ? b.v : b.v / p.every);

/** F-101's group custody price over the list's (`groupCustody`), as a deal's price. */
function groupCustody(p: Price, v: GroupPriceValue, n: (v: number) => Num): Price {
  if (v.exempt) return { form: "free", src: n(0).src! };
  if (v.discount_pct !== undefined) {
    if (p.form === "free") return p;
    if (p.form !== "held") throw new MoveGap(`a group's custody discount over a ${p.form} price`);
    return { ...p, rate: n(p.rate.v * (1 - v.discount_pct / 100)) };
  }
  if (v.rate_pct === undefined) throw new MoveGap("a group's custody price of no shape the move knows");
  if (p.form !== "held" && p.form !== "free") throw new MoveGap(`a group's custody rate over a ${p.form} price`);
  const held = p.form === "held" ? p : null;
  const every = v.per && v.per !== "trade" ? PER_MONTHS[v.per] : (held?.every ?? 3);
  // the list's bound is printed for the list's period; per month it is the same in every period (F-14)
  const kept = (b: Num | undefined): Num | undefined => (b === undefined || !held ? undefined : held.boundsEvery === 1 || held.every === every ? b : { ...b, v: perMonth(held, b) * every });
  const sameBasis = !held || held.boundsEvery !== 1;
  const min = v.min !== undefined ? n(sameBasis ? v.min : v.min / every) : kept(held?.min);
  const max = v.max !== undefined ? n(sameBasis ? v.max : v.max / every) : kept(held?.max);
  return { form: "held", rate: n(v.rate_pct), per: every, every, ...(min ? { min } : {}), ...(max ? { max } : {}), ...(held?.boundsEvery === 1 ? { boundsEvery: 1 as const } : {}) };
}

/**
 * The group's prices over the list's (F-101; the move, method §10.4): each price the run reads (its words name fund units, or the person adopted it) on the
 * cases the plan reads on its side, as prices over time: the group's price until its end, counted from the day the account was typed, then
 * the list's; a price that names a purchase or a sale alone leaves the other side the list's.
 */
function withGroup(deal: FeeDeal, b: CustomBroker, ctx: ReadContext, house: string, snap: MoveContext["snapshots"][number] | undefined): FeeDeal {
  const g = b.base!.group!;
  const values = groupValues(g);
  const stay = untilMonthsOf(b);
  const start = b.added.slice(0, 7);
  const ends = (v: GroupPriceValue) => Math.min(v.for_months ?? Infinity, stay ?? Infinity);
  const reads = (fee: GroupFee) => {
    const at = values[fee];
    return at && (at.price.names_fund || g.adopted?.includes(fee)) ? at : null;
  };
  let out = deal;
  for (const base of ["trade", "custody"] as const) {
    const israel = reads(`${base}_israel`);
    const abroad = reads(`${base}_abroad`);
    if (!israel && !abroad) continue;
    // a price read for funds on both sides where the group prices them apart is split by side first
    const il = readOn(out, ctx, "israel");
    const ab = readOn(out, ctx, "abroad");
    out = {
      ...out,
      fees: out.fees.map((f) => {
        if (f.kind !== base) return f;
        const shared = new Set([...(il.get(f.id) ?? [])].filter((x) => ab.get(f.id)?.has(x)));
        return shared.size && JSON.stringify(israel?.value) !== JSON.stringify(abroad?.value) ? splitBySide(f, shared) : f;
      }),
    };
    for (const [side, at] of [["israel", israel], ["abroad", abroad]] as const) {
      if (!at) continue;
      const end = ends(at.value);
      if (end <= 0) continue;
      const n = groupNum(g, house, at.price);
      const read = readOn(out, ctx, side);
      const op = (p: Price) => (base === "trade" ? groupTrade(p, at.value, n) : groupCustody(p, at.value, n));
      const over = (stages: readonly Stage[]): Stage[] => {
        if (!Number.isFinite(end)) return stages.map((s) => ({ ...s, price: op(s.price) }));
        if (stages.length !== 1) throw new MoveGap("a group's price for a time over a list price that already changes over time");
        return [{ price: op(stages[0]!.price), until: addMonths(start, end) }, stages[0]!];
      };
      out = {
        ...out,
        fees: out.fees.map((f) =>
          f.kind !== base
            ? f
            : onRead(f, read.get(f.id), (x) => {
                const side2 = at.value.side;
                if (!side2) return { stages: over(x.stages), ...(x.sale ? { sale: over(x.sale) } : {}) };
                if (side2 === "buy") return { stages: over(x.stages), sale: x.sale ?? x.stages };
                return { stages: x.stages, sale: over(x.sale ?? x.stages) };
              }),
        ),
      };
    }
  }
  // F-102: the group's own current account, exempt for its months from the day typed, where the bank's record prices one
  const ca = g.currentAccount;
  const bank = snap?.current_account?.monthly_minimum;
  if (ca && bank && typeof bank.value === "number" && !out.fees.some((f) => f.kind === "current_account")) {
    const end = Math.min(ca.exemptMonths, stay ?? Infinity);
    const listed: Stage = { price: { form: "sum", amount: { v: bank.value, src: sourcedOf(bank, house) }, every: 1 } };
    const free: Price = ca.source ? { form: "free", src: { url: ca.source.url, title: ca.source.title, publisher: house, strength: "institution", checked: g.snapshot, ...(ca.source.page ? { page: ca.source.page } : {}), own: house } } : { form: "free" };
    out = { ...out, fees: [...out.fees, { id: newFeeId(), kind: "current_account", stages: end > 0 ? [{ price: free, until: addMonths(start, end) }, listed] : [listed] }] };
  }
  return out;
}

// ---------------------------------------------------------------- the person's own figures over the list's

/**
 * A price's sums in shekels, at the run's rates (E2, F-12: the run converts a bound in another currency at its rate): so a minimum typed
 * in shekels can stand beside the list's other bounds in one price.
 */
function inShekels(p: Price, fx: Readonly<Record<string, number>>): Price {
  if ("inTrade" in p && p.inTrade) {
    // sums in the trade's currency, which only a run knows: the typed minimum replaces the minimum, so it stands in shekels where that was
    // the price's only sum, and the price's sums are no longer in the trade's currency
    const { inTrade: _t, currency: _c, min: _m, ...rest } = p as Extract<Price, { form: "action" | "perUnit" | "perAction" }> & { min?: Num };
    if (["max", "amount", "flat"].some((k) => (rest as Record<string, unknown>)[k])) throw new MoveGap("a typed minimum beside bounds printed in the trade's currency");
    return rest as Price;
  }
  const cur = currencyOf(p);
  if (cur === "ILS") return p;
  const rate = fx[cur];
  if (!(typeof rate === "number" && rate > 0)) throw new MoveGap(`no rate for ${cur}`);
  const at = (n: Num | undefined): Num | undefined => (n ? { ...n, v: n.v * rate } : undefined);
  const { currency: _c, ...rest } = p as Extract<Price, { form: "action" | "perUnit" | "perAction" }>;
  const out: Record<string, unknown> = { ...rest };
  for (const k of ["min", "max", "amount"] as const) if (k in rest && (rest as Record<string, unknown>)[k]) out[k] = at((rest as unknown as Record<string, Num>)[k]);
  if ("flat" in rest && rest.flat) out.flat = { amount: at(rest.flat.amount)!, upTo: at(rest.flat.upTo)! };
  return out as Price;
}

/** The person's typed trade figures over a price (F-101's `applyOwn`): a rate replaces the rate shape, a flat price's minimum goes with it unless one is typed; a minimum is in shekels. */
function ownTrade(p: Price, pct: number | null, min: number | null, flat: boolean, fx: Readonly<Record<string, number>>): Price {
  let next: Price = p;
  if (pct !== null) {
    next = isAction(p) ? asRate(p, typed(pct)) : { form: "action", rate: typed(pct) };
    if (flat && min === null && next.form === "action") {
      const { min: _m, ...rest } = next;
      next = rest;
    }
  }
  if (min !== null) {
    if (!isAction(next)) next = { form: "action", rate: typed(0) };
    if (next.form === "perAction") next = asRate(next, typed(0));
    next = { ...inShekels(next, fx), min: typed(min) } as Price;
  }
  return next;
}

/**
 * The person's typed custody over a price (F-101's `applyOwn`): a percent a year charged in the price's period (`per: 12`, so each charge
 * is the rate × months / 12), a minimum a month as each charge's (× months); a bound not typed is the list's (`list`, per month in every period).
 */
function ownCustody(p: Price, list: Price, pct: number | null, min: number | null): Price {
  if (pct === null && min === null) return p;
  const held = p.form === "held" ? p : null;
  const listHeld = list.form === "held" ? list : null;
  const every = held?.every ?? (p.form === "sum" ? p.every : (listHeld?.every ?? 1));
  const monthly = held?.boundsEvery === 1 || (!held && listHeld?.boundsEvery === 1);
  const keep = (b: Num | undefined, from: typeof held): Num | undefined => (b === undefined || !from ? undefined : monthly ? { ...b, v: perMonth(from, b) } : from.every === every ? b : { ...b, v: perMonth(from, b) * every });
  const keptMin = held?.min ? keep(held.min, held) : keep(listHeld?.min, listHeld);
  const keptMax = held?.max ? keep(held.max, held) : keep(listHeld?.max, listHeld);
  const rate: Num = pct !== null ? typed(pct) : held ? { ...held.rate, v: (held.rate.v * 12) / held.per } : typed(0);
  const minOut = min !== null ? typed(monthly ? min : min * every) : keptMin;
  return { form: "held", rate, per: 12, every, ...(minOut && minOut.v > 0 ? { min: minOut } : {}), ...(keptMax ? { max: keptMax } : {}), ...(monthly ? { boundsEvery: 1 as const } : {}) };
}

/**
 * The person's typed conversion over a price (F-101's `applyOwn`, F-13): the rate replaces the line's rate and a sum per unit, and keeps its
 * bounds and its steps by size: a step's own price (`step`: a free step, a sum on each conversion) and a small conversion's flat price stay,
 * so the typed rate prices what the steps leave to the line and never makes a small conversion dearer than the list.
 */
function ownFx(p: Price, fx: number, step: boolean): Price {
  if (p.form === "action") return { ...p, rate: typed(fx) };
  if (p.form === "perUnit") return asRate(p, typed(fx));
  if (p.form === "perAction" || (p.form === "free" && step)) return p;
  return { form: "action", rate: typed(fx) };
}

/** Whether a case of a fee is a step of the action's size below the open top, the line's (a template folds a conversion's steps so, fold-flat.ts). */
function isSizeStep(fee: CasesFee, c: Case): boolean {
  const t = fee.by.findIndex((b) => b.kind === "actionSize");
  const range = fee.by[t];
  const w = c.when[t];
  return !!range && "tops" in range && typeof w === "number" && w < range.tops.length;
}

const num = (v: CustomBroker["tradePct"]): number | null => (v && typeof v.value === "number" ? v.value : null);

/** The person's own figures over a deal filled from a house (F-101; the move, method §10.4): on the cases the plan reads, for the whole plan. */
function withOwn(deal: FeeDeal, b: CustomBroker, ctx: ReadContext, list: FeeDeal, rates: Readonly<Record<string, number>>): FeeDeal {
  const tradePct = num(b.tradePct), tradeMin = num(b.tradeMin), custodyPct = num(b.custodyPct), custodyMin = num(b.custodyMin), fx = num(b.fxPct), monthly = num(b.monthlyFee);
  const runs = readRuns(deal, ctx);
  const both = (id: string) => new Set(runs.flatMap((r) => [...(r.get(id) ?? [])]));
  const listOf = (f: Fee, c: Case | null): Price | undefined => {
    const lf = list.fees.find((x) => x.kind === f.kind);
    if (!lf) return undefined;
    const x = hasCases(lf) ? lf.cases.find((y) => y.id === c?.id || (c && y.id === c.id.replace(/-\d+$/, ""))) : lf;
    return x?.stages.at(-1)?.price;
  };
  let fees = deal.fees.map((f): Fee => {
    if (f.kind === "trade" && (tradePct !== null || tradeMin !== null)) {
      // a flat price in a run's commission at a time (a flat price, or a step of the action's size a flat price was folded into): a rate
      // of one's own replaces it, and its minimum, in that run's prices at that time alone (F-101 (1))
      const pricedOf = (id: string | null): Priced | undefined => (!hasCases(f) ? f : f.cases.find((c) => c.id === id));
      const isFlat = (p: Price | undefined) => !!p && (p.form === "perAction" || ("flat" in p && !!p.flat));
      const flatAt = (id: string | null, k: number, sale: boolean): boolean =>
        runs.some((run) => {
          const read = run.get(f.id);
          if (!read?.has(id)) return false;
          return [...read].some((x) => isFlat(((sale ? pricedOf(x)?.sale : undefined) ?? pricedOf(x)?.stages)?.[k]?.price));
        });
      return onRead(f, both(f.id), (x, c) => {
        const id = c?.id ?? null;
        const over = (stages: readonly Stage[], sale: boolean) => stages.map((s, k) => ({ ...s, price: ownTrade(s.price, tradePct, tradeMin, flatAt(id, k, sale), rates) }));
        return { stages: over(x.stages, false), ...(x.sale ? { sale: over(x.sale, true) } : {}) };
      });
    }
    if (f.kind === "custody" && (custodyPct !== null || custodyMin !== null)) return onRead(f, both(f.id), (x, c) => eachPrice(x, (p) => ownCustody(p, listOf(f, c) ?? p, custodyPct, custodyMin)));
    if (f.kind === "fx" && fx !== null) return hasCases(f) ? { ...f, cases: f.cases.map((c) => withPriced(c, eachPrice(c, (p) => ownFx(p, fx, isSizeStep(f, c))))) } : { ...f, ...priced(eachPrice(f, (p) => ownFx(p, fx, false))) };
    if (f.kind === "fixed_period" && monthly !== null) return { id: f.id, kind: f.kind, ...(f.house ? { house: f.house } : {}), stages: [{ price: { form: "sum", amount: typed(monthly), every: 1 } }] };
    return f;
  });
  const add = (kind: FeeKindId, price: Price) => {
    if (!fees.some((f) => f.kind === kind)) fees = [...fees, { id: newFeeId(), kind, stages: [{ price }] }];
  };
  if (tradePct !== null || tradeMin !== null) add("trade", { form: "action", rate: typed(tradePct ?? 0), ...(tradeMin ? { min: typed(tradeMin) } : {}) });
  if (custodyPct !== null || custodyMin !== null) add("custody", { form: "held", rate: typed(custodyPct ?? 0), per: 12, every: 1, ...(custodyMin ? { min: typed(custodyMin) } : {}) });
  if (fx !== null) add("fx", { form: "action", rate: typed(fx) });
  if (monthly !== null) add("fixed_period", { form: "sum", amount: typed(monthly), every: 1 });
  return { ...deal, fees };
}

// ---------------------------------------------------------------- what the account could buy

/** The places an account sells in. */
const placesSold = (b: CustomBroker): Place[] => [...(b.sells.israeli ? (["israel"] as const) : []), ...(b.sells.abroad ? (["abroad"] as const) : [])];

/**
 * The trade fee priced only for what the account sells (decision 2 of the move): where it sells every kind, as it is; else each case of
 * what is bought keeps only the values sold, and a fee whose price changes by nothing gets a case for each value sold, at its price. What
 * it does not sell has no case, and F-128 reads it as having no price.
 */
function onlySold(fee: Fee, places: readonly Place[]): Fee {
  if (places.length === 2 || fee.kind !== "trade") return fee;
  const sold = (v: string, f: CasesFee, t: number) => places.includes(placeOf(f, t, v) ?? "abroad");
  const t = hasCases(fee) ? fee.by.findIndex((b) => b.kind === "what") : -1;
  if (t < 0) return addBy(fee, { kind: "what", values: LIST_IDS.what.filter((v) => places.includes(WHAT_VALUES[v]!.place)) });
  const f = fee as CasesFee;
  const values = thingValues(f, t).filter((v) => sold(v, f, t));
  const cases = f.cases.flatMap((c): Case[] => {
    const w = c.when[t]!;
    const keep = (w === "any" ? thingValues(f, t) : (w as string[])).filter((v) => sold(v, f, t));
    return keep.length ? [{ ...c, when: c.when.map((x, k) => (k === t ? keep : x)) }] : [];
  });
  const by = f.by.map((b, k) => (k === t && isList(b) ? { ...b, values: b.values.filter((v) => values.includes(v)) } : b)) as CasesFee["by"];
  return { ...f, by, cases };
}

// ---------------------------------------------------------------- an account typed from scratch

/** A price with its figure typed, or, where the person left any of its fields empty, a price not given yet (D56). */
const known = (...xs: (number | null)[]): boolean => xs.every((x) => x !== null);

/**
 * An account typed from scratch as a deal's fees (the move, method §10.4): the trade a share of each action with its minimum, custody a percent a year
 * charged each month with its minimum a month, the conversion a share of each conversion (where the account sells abroad or it was
 * typed), the monthly fee a sum each month. A fee with a field left empty has no price yet.
 */
function scratchFees(b: CustomBroker): Fee[] {
  const tradePct = num(b.tradePct), tradeMin = num(b.tradeMin), custodyPct = num(b.custodyPct), custodyMin = num(b.custodyMin), fx = num(b.fxPct), monthly = num(b.monthlyFee);
  const fee = (kind: FeeKindId, price: Price): Fee => ({ id: newFeeId(), kind, stages: [{ price }] });
  return [
    fee("trade", known(tradePct, tradeMin) ? { form: "action", rate: typed(tradePct!), ...(tradeMin! > 0 ? { min: typed(tradeMin!) } : {}) } : { form: "action", rate: blankFigure() }),
    fee("custody", known(custodyPct, custodyMin) ? { form: "held", rate: typed(custodyPct!), per: 12, every: 1, ...(custodyMin! > 0 ? { min: typed(custodyMin!) } : {}) } : { form: "held", rate: blankFigure(), per: 12, every: 1 }),
    ...(b.sells.abroad || fx !== null ? [fee("fx", { form: "action", rate: fx !== null ? typed(fx) : blankFigure() })] : []),
    fee("fixed_period", { form: "sum", amount: monthly !== null ? typed(monthly) : blankFigure(), every: 1 }),
  ];
}

// ---------------------------------------------------------------- the move

/** The deal a typed account moves into (the move, method §10.4). */
export function dealOfTypedAccount(b: CustomBroker, ctx: MoveContext): FeeDeal {
  const id = movedDealId(b.id);
  const places = placesSold(b);
  const base = b.base;
  const tpl = base ? ctx.houses.find((h) => h.id === base.houseId) : undefined;
  const snap = base ? ctx.snapshots.find((s) => s.id === base.houseId) : undefined;
  if (!base || !tpl || !snap) {
    // from scratch, or built on a house no longer on the site: only what was typed, an empty field not known
    return { id, name: b.name, kind: ACCOUNT_KIND, fees: scratchFees(b).map((f) => onlySold(f, places)), saved: ctx.today };
  }
  const filled = fillDeal({ ...newDeal(ACCOUNT_KIND, b.name), id }, `house:${tpl.id}`, { houses: ctx.houses as HouseTemplate[], tracks: [], templates: {} }, ctx.today)!;
  const read: ReadContext = { kinds: ctx.kinds, today: ctx.today, lineValue: lineValueOf(snap as BundleSnapshot) };
  const grouped = base.group ? withGroup(filled, b, read, base.houseName, snap) : filled;
  const owned = withOwn(grouped, b, read, filled, ctx.fx);
  return { ...owned, name: b.name, fees: owned.fees.map((f) => onlySold(f, places)), saved: ctx.today };
}

/** The deals with each account's deal added after them where the deals do not hold its id yet: a second move adds nothing. */
export function withMoved(deals: readonly FeeDeal[], made: readonly FeeDeal[]): FeeDeal[] {
  const fresh = made.filter((d) => !deals.some((x) => x.id === d.id));
  return fresh.length ? [...deals, ...fresh] : [...deals];
}
