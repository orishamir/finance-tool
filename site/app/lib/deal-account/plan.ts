// A securities-account deal read for the indices page's plan (method F-128): what the plan knows it sets itself (what is bought, from the
// fund; the channel, the internet, as the page always buys; the currency of a conversion and of a sum in the trade's currency, the one the
// fund trades in), and the deal keeps its own pick of what
// only the person knows (a track, a condition of their own). Each fee is then charged by the plan, never charged with its reason, or
// stops the deal from a price on the plan with what it lacks. Pure; no Hebrew (the words are in copy.ts, read by the page).
import { planChargeOf, type Deal, type DealAccount, type DealRun, type DealUnpriced, type NotOnPlan, type PlanWithin } from "@finance-tool/engine";
import { readDealFor, type DealRead } from "../fee-deal/deal-read";
import { chargedOnHolding, feeOf, stepPick, type ReadFee } from "../fee-deal/cases";
import { hasCases, isRange, monthOfDate, pickKey, placeOf, type Fee, type FeeDeal, type RangeBy, type ReadPick } from "../fee-deal/model";
import { engineFee } from "../fee-deal/to-engine";
import { monthOf as monthThing } from "../fee-deal/offers/conditions";
import { engineBase, type FeeKindId } from "../fee-deal/shapes";
import { ACCOUNT_KIND, type DealKind } from "../fee-deal/kinds";

/** Whether a saved deal is a securities account, which the indices page lists as an account. */
export const isAccountDeal = (d: Pick<FeeDeal, "kind">): boolean => d.kind === ACCOUNT_KIND;

/** The value of what is bought (F-114) for a fund the plan buys: its class, and where a fund bought abroad trades. */
export function whatOfRun(run: Pick<DealRun, "instrumentClass" | "listing">): string {
  switch (run.instrumentClass) {
    case "mutual_fund_units":
      return "mutualFunds";
    case "money_market_units":
      return "moneyMarket";
    case "makam":
      return "makam";
    case "foreign_securities":
      return run.listing === "us" ? "us" : run.listing === "europe" ? "europe" : "world";
    default:
      return "tase";
  }
}

/** The channel the page buys through: the internet and the app. */
export const PLAN_CHANNEL = "direct";

/** The things the plan sets itself (F-128), by their pick key: what is bought and the channel. */
export const PLAN_KEYS: readonly string[] = ["what", "channel"];

/**
 * F-63's line choice of the house a deal was filled from, in the deal's words (`houseLineValue`): the value of what is bought (`trade`) or
 * of what is held (`custody`) under which that house's template files the line its own row reads for the fund, given the value the fund's
 * class names.
 */
export type LineValue = (base: "trade" | "custody", run: Pick<DealRun, "instrumentClass">, value: string) => string;

/**
 * What the plan buys and holds (F-114, F-128), each a value of the deal's things: the value the fund's class names (`whatOfRun`), or, for a
 * deal filled from a house's whole list, the value of the line that house's own row reads for the fund, on a purchase and on what is held
 * (`LineValue`), so the deal reads the case that line filled.
 */
export function planWhat(run: Pick<DealRun, "instrumentClass" | "listing">, line?: LineValue): { what: string; held: string } {
  const value = whatOfRun(run);
  return line ? { what: line("trade", run, value), held: line("custody", run, value) } : { what: value, held: value };
}

/**
 * The deal as the plan reads it: its own picks of what only the person knows, and the plan's of what it buys (`what`) and how. What is
 * bought names its currency as the one the fund trades in (`DealRun.currency`, the shekel where null), whatever the value names (F-114's
 * currency of a conversion, F-12's sum in the trade's currency); a value the deal does not know keeps its own.
 */
export function planDeal(deal: FeeDeal, run: Pick<DealRun, "instrumentClass" | "listing" | "currency">, what: string = whatOfRun(run)): FeeDeal {
  const own = (deal.readFor ?? []).filter((p) => !PLAN_KEYS.includes(p.by));
  const place = placeOf(deal.fees, what)?.place;
  const bought: ReadPick = place ? { by: "what", is: what, place, currency: run.currency ?? "ILS" } : { by: "what", is: what };
  const picks: ReadPick[] = [...own, bought, { by: "channel", is: PLAN_CHANNEL }];
  return { ...deal, readFor: picks };
}

/** Whether a fee's price changes by what is held (custody by the kind of holding), which the plan reads for what it holds. */
const byHeld = (f: Fee): boolean => hasCases(f) && f.by.some((b) => b.kind === "held");

/** The deal read for the plan (`planRead`): §10.6's reading, and the steps of what the plan sets each fee read across them is charged within. */
export type PlanRead = DealRead & { within: ReadonlyMap<ReadFee, readonly PlanWithin[]> };

/**
 * F-128 The deal read for the plan (§10.6's reading, `readDealFor`): every fee read for what the plan buys, and a fee whose price changes by
 * what is held read for what it holds, where a house's line choice files the two under different values (`planWhat`). A fee whose price
 * changes by what the plan's months set (`planThings`) is read across their steps, as F-115 reads a size: once for every step of each of
 * them, each read fee charged within its steps (`within`); it lacks a price, an order or a case where any of those readings does.
 */
export function planRead(deal: FeeDeal, run: Pick<DealRun, "instrumentClass" | "listing" | "currency">, ctx: Pick<PlanContext, "kinds" | "today" | "lineValue">): PlanRead {
  const w = planWhat(run, ctx.lineValue);
  const readAt = (what: string, steps: readonly ReadPick[] = []) => {
    const d = planDeal(deal, run, what);
    return readDealFor(steps.length ? { ...d, readFor: [...d.readFor!.filter((p) => !steps.some((x) => x.by === p.by)), ...steps] } : d, ctx.kinds, ctx.today);
  };
  const bought = readAt(w.what);
  const held = w.held === w.what || !deal.fees.some(byHeld) ? bought : readAt(w.held);
  const whatOf = (f: Fee) => (byHeld(f) ? w.held : w.what);
  const within = new Map<ReadFee, readonly PlanWithin[]>();
  /** Each fee's reading: its own one, or, for a fee read across what the plan sets, one per combination of steps. */
  const readsOf = (f: Fee): { read: DealRead; within: PlanWithin[] }[] => {
    const things = planThings(f);
    const base = byHeld(f) ? held : bought;
    return things.length ? stepCombos(things).map((c) => ({ read: readAt(whatOf(f), c.picks), within: c.within })) : [{ read: base, within: [] }];
  };
  const reads = new Map(deal.fees.map((f) => [f.id, readsOf(f)]));
  const some = (key: "unread" | "unpriced" | "unmatched" | "noCurrency" | "notPrinted") => deal.fees.flatMap((f) => (reads.get(f.id)!.some((r) => r.read[key].includes(f.id)) ? [f.id] : []));
  const fees = deal.fees.flatMap((f) =>
    reads.get(f.id)!.flatMap((r) =>
      r.read.fees.filter((x) => feeOf(x) === f.id).map((x) => {
        if (r.within.length) within.set(x, r.within);
        return x;
      }),
    ),
  );
  const first = (f: Fee) => reads.get(f.id)![0]!.read;
  return {
    ...bought,
    fees,
    unread: some("unread"),
    unpriced: some("unpriced").filter((id) => !some("unread").includes(id)),
    unmatched: some("unmatched"),
    noCurrency: some("noCurrency"),
    notPrinted: some("notPrinted"),
    banned: deal.fees.flatMap((f) => first(f).banned.filter((b) => b.fee === f.id)),
    unpricedAt: Object.fromEntries(deal.fees.flatMap((f) => reads.get(f.id)!.flatMap((r) => (r.read.unpricedAt[f.id] ? [[f.id, r.read.unpricedAt[f.id]!] as const] : [])).slice(0, 1))),
    within,
  };
}

/**
 * The things of a fee that the plan's months set, which the plan reads across their steps (F-128): a month's trading (`trading`), the number
 * of actions in a month (`count`), and, on a fee charged on an action, the size of the portfolio (`balance`); a size of the portfolio on a
 * fee charged on what is held is read across by F-115 itself.
 */
export function planThings(fee: Fee): { by: RangeBy; on: PlanWithin["on"] }[] {
  if (!hasCases(fee)) return [];
  return fee.by.flatMap((b): { by: RangeBy; on: PlanWithin["on"] }[] => {
    if (!isRange(b)) return [];
    const month = monthThing(b.kind);
    if (month === "trading") return [{ by: b, on: "trading" }];
    if (month === "actions") return [{ by: b, on: "count" }];
    return b.kind === "portfolioSize" && !chargedOnHolding(fee) ? [{ by: b, on: "balance" }] : [];
  });
}

/** Every combination of a step of each thing (`planThings`): the picks that read the fee in it, and the steps it is charged within. */
function stepCombos(things: readonly { by: RangeBy; on: PlanWithin["on"] }[]): { picks: ReadPick[]; within: PlanWithin[] }[] {
  let out: { picks: ReadPick[]; within: PlanWithin[] }[] = [{ picks: [], within: [] }];
  for (const { by, on } of things) {
    const tops = by.tops.map((n) => n.v);
    const steps = tops.map((top, k) => ({ is: stepPick(top), from: k === 0 ? 0 : tops[k - 1]!, to: top as number | null })).concat([{ is: stepPick(tops.at(-1)!, true), from: tops.at(-1)!, to: null }]);
    out = out.flatMap((c) => steps.map((st) => ({ picks: [...c.picks, { by: pickKey(by), is: st.is }], within: [...c.within, { on, from: st.from, to: st.to, unit: by.unit }] })));
  }
  return out;
}

/**
 * Why the plan has no price for a deal (F-128): a fee it charges has a price not given yet (`price`), prices out of order (`order`), or no
 * case for what the plan buys (`case`).
 */
export type MissingWhy = "price" | "order" | "case";

export interface Missing {
  why: MissingWhy;
  /** The deal's fee, by id. */
  fee: string;
  kind: FeeKindId;
  name?: string;
}

/**
 * Why the plan never charges a fee (F-128, `planChargeOf`), as the page says it: the engine's reasons, a bank's current account the person
 * pays anyway (`own-bank`, D64), a current account on a page that counts none (`no-current-account`, F-102), a fee in the person's own words
 * (`own-words`), and a fee the law bans here, read as nothing charged (`banned`).
 */
export type OffPlan = Exclude<NotOnPlan, "named"> | "own-bank" | "no-current-account" | "own-words" | "banned";

/** A fee of the deal on the plan: charged, never charged with why, or lacking what the plan needs. */
export type FeeOnPlan = { fee: string; on: "charged" } | { fee: string; on: "off"; why: OffPlan } | { fee: string; on: "missing"; missing: Missing };

/**
 * What the reading of the run needs beside the deal: the kinds (bans, caps), the device's day, and the page's current accounts (F-102,
 * D64): the bank the person marked as theirs, or null where the page counts no current account (only the indices page counts one).
 */
export interface PlanContext {
  kinds: readonly DealKind[];
  today: string;
  currentAccounts: { own: string | null } | null;
  /** The line choice of the house the deal was filled from, where it was filled from a house's whole list (`LineValue`). */
  lineValue?: LineValue;
}

/** The house whose whole price list filled the deal (`house:<id>`), by its id, or null. */
export function dealHouseId(deal: Pick<FeeDeal, "template">): string | null {
  const t = deal.template;
  return t && !t.feesKept && t.id.startsWith("house:") ? t.id.slice("house:".length).split("/", 1)[0]! : null;
}

/**
 * F-128 Each fee of the deal on one run of the plan. A current account is charged unless the deal was filled from the bank the person marks
 * (D64); the fund's own fee comes from the fund's record; a fee in the person's own words is charged where F-111 places it on what is held
 * or on the account (every price it charges a share of what is held or a sum per period, `chargedOnHolding`), and never on an action; every
 * other fee as `planChargeOf` says. A fee the plan charges must be priced (§10.6), in order (F-110), and have a case for what the plan buys (F-114),
 * at every step of what the plan's months set (`planRead`).
 */
export function feesOnPlan(deal: FeeDeal, run: DealRun, ctx: PlanContext): FeeOnPlan[] {
  const read = planRead(deal, run, ctx);
  const facts = { converts: run.currency !== null, distributes: run.distributes };
  return deal.fees.map((f): FeeOnPlan => {
    const off = offOf(deal, f, facts, ctx);
    if (off) return { fee: f.id, on: "off", why: off };
    if (read.banned.some((b) => b.fee === f.id)) return { fee: f.id, on: "off", why: "banned" };
    const miss = (why: MissingWhy): FeeOnPlan => ({ fee: f.id, on: "missing", missing: { why, fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}) } });
    if (read.unread.includes(f.id)) return miss("order");
    if (read.unpriced.includes(f.id)) return miss("price");
    if (read.unmatched.includes(f.id)) return miss("case");
    return { fee: f.id, on: "charged" };
  });
}

/** F-111 on a fee in the person's own words: whether it charges something, and every price it charges is on what is held or on the account. */
const ownOnHolding = (f: Fee): boolean => (hasCases(f) ? f.cases : [f]).some((x) => [...x.stages, ...(x.sale ?? [])].some((st) => st.price.form !== "free")) && chargedOnHolding(f);

function offOf(deal: FeeDeal, f: Fee, facts: { converts: boolean; distributes: boolean }, ctx: PlanContext): OffPlan | null {
  if (f.kind === "current_account") return !ctx.currentAccounts ? "no-current-account" : dealHouseId(deal) !== null && dealHouseId(deal) === ctx.currentAccounts.own ? "own-bank" : null;
  if (f.kind === "fund_management") return "fund-record";
  if (f.kind === "own") return ownOnHolding(f) ? null : "own-words";
  const c = planChargeOf(engineBase(f.kind), facts);
  return "charge" in c ? null : c.not === "named" ? "own-words" : c.not;
}

/**
 * F-128 The deal account for one run, or why it has no price there (the first fee the plan charges that lacks something, as
 * `missingKey` writes it): the deal read for the plan, its fees the plan charges, `foreign` false (the run converts on its own), its first
 * month the page's run month (`PlanContext.today`, the bundle's day), and its current account where the plan charges one (F-102: the deal's
 * own fee of that kind, which a bank's whole list fills).
 */
export function planAccount(deal: FeeDeal, run: DealRun, ctx: PlanContext): DealAccount | DealUnpriced {
  const on = feesOnPlan(deal, run, ctx);
  const missing = on.find((x): x is Extract<FeeOnPlan, { on: "missing" }> => x.on === "missing");
  if (missing) return { unpriced: missingKey(missing.missing) };
  const read = planRead(deal, run, ctx);
  const fees = planFees(read, on);
  const currentAccount = fees.flatMap((f, i) => (f.kind === "current_account" ? [i] : []));
  const engine: Deal = { fees: fees.map(engineFee), foreign: false, ...(deal.provider ? { provider: deal.provider } : {}) };
  feeIds.set(engine, fees.map(feeOf));
  const planWithin = fees.map((f) => read.within.get(f));
  const flags = questionsOf(fees);
  return {
    deal: engine,
    start: monthOfDate(ctx.today),
    rates: {},
    ...(currentAccount.length ? { currentAccount } : {}),
    ...(planWithin.some((x) => x) ? { planWithin } : {}),
    ...(flags.length ? { flags } : {}),
  };
}

/**
 * The open questions of the rule base the prices of the read fees rest on (`questions`, a line's `open_questions` carried by the template
 * that filled the price, data-schema §3.6), each once: F-12 flags them on every run that reads the price, as on a house's row.
 */
function questionsOf(fees: readonly ReadFee[]): string[] {
  const out = new Set<string>();
  for (const f of fees) for (const st of [...f.stages, ...(f.sale ?? [])]) if ("questions" in st.price) for (const q of st.price.questions ?? []) out.add(q);
  return [...out];
}

/**
 * The read fees the run charges, in the run's order (`DealAccount.deal`'s fees): the read fees of the deal's fees the plan charges
 * (`feesOnPlan`). A run's figures by fee index (`dealReach`) are indices into this.
 */
export function planFees(read: PlanRead, on: readonly FeeOnPlan[]): ReadFee[] {
  const charged = new Set(on.filter((x) => x.on === "charged").map((x) => x.fee));
  return read.fees.filter((f) => charged.has(feeOf(f)));
}

const feeIds = new WeakMap<Deal, string[]>();
/**
 * The deal's fee each of a run's fees is, in the run's order (the engine's `byFee` counts them so), by the deal the run read
 * (`DealAccount.deal`): a fee read as one fee per step of sizes is each of them.
 */
export const feeIdsOf = (d: Deal): readonly string[] | undefined => feeIds.get(d);

/** What a deal lacks, as the engine carries it (`DealUnpriced.unpriced`): its why, and the fee's id, kind and name. */
export const missingKey = (m: Missing): string => JSON.stringify([m.why, m.fee, m.kind, m.name ?? null]);

/** What a deal lacks, read back from `missingKey`; null where the text is not one. */
export function missingOf(key: string): Missing | null {
  try {
    const [why, fee, kind, name] = JSON.parse(key) as [MissingWhy, string, FeeKindId, string | null];
    return typeof fee === "string" && typeof kind === "string" ? { why, fee, kind, ...(name ? { name } : {}) } : null;
  } catch {
    return null;
  }
}
