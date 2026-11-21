// A securities-account deal read for the indices page's plan (method F-128): what the plan knows it sets itself (what is bought, from the
// fund; the channel, the internet, as the page always buys; a conversion's currency, the fund's), and the deal keeps its own pick of what
// only the person knows (a track, a condition of their own). Each fee is then charged by the plan, never charged with its reason, or
// stops the deal from a price on the plan with what it lacks. Pure; no Hebrew (the words are in copy.ts, read by the page).
import { planChargeOf, type Deal, type DealAccount, type DealFee, type DealRun, type DealUnpriced, type NotOnPlan } from "@finance-tool/engine";
import { readDealFor } from "../fee-deal/deal-read";
import { chargedOnHolding, feeOf } from "../fee-deal/cases";
import { hasCases, isRange, monthOfDate, type Fee, type FeeDeal, type ReadPick } from "../fee-deal/model";
import { engineFee } from "../fee-deal/to-engine";
import { monthOf as monthThing } from "../fee-deal/offers/conditions";
import { engineBase, type FeeKindId } from "../fee-deal/shapes";
import type { DealKind } from "../fee-deal/kinds";

/** The deal's kind the indices page reads: a securities account (decision of the deal-on-indices design). */
export const ACCOUNT_KIND = "brokerage-account";

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

/** The deal as the plan reads it: its own picks of what only the person knows, and the plan's of what it buys and how. */
export function planDeal(deal: FeeDeal, run: Pick<DealRun, "instrumentClass" | "listing">): FeeDeal {
  const own = (deal.readFor ?? []).filter((p) => !PLAN_KEYS.includes(p.by));
  const picks: ReadPick[] = [...own, { by: "what", is: whatOfRun(run) }, { by: "channel", is: PLAN_CHANNEL }];
  return { ...deal, readFor: picks };
}

/**
 * Why the plan has no price for a deal (F-128): a fee it charges has a price not given yet (`price`), prices out of order (`order`), no case
 * for what the plan buys (`case`), or changes by something the plan does not read yet (`not-read`: a month's trading or number of actions,
 * or the portfolio's size on an action).
 */
export type MissingWhy = "price" | "order" | "case" | "not-read";

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
  /**
   * The current account of the bank a deal was filled from, a month (F-102), where the page counts it: a deal filled from a bank is an
   * account at that bank, as an account built on a bank is (F-101), and pays the bank's current account where it names none of its own.
   */
  bankAccount?: number;
}

/** The house whose whole price list filled the deal (`house:<id>`), by its id, or null. */
export function dealHouseId(deal: Pick<FeeDeal, "template">): string | null {
  const t = deal.template;
  return t && !t.feesKept && t.id.startsWith("house:") ? t.id.slice("house:".length).split("/", 1)[0]! : null;
}

/** A thing of a fee the plan does not read yet (F-128): a month's trading or number of actions, or the portfolio's size on an action. */
function notRead(fee: Fee): boolean {
  if (!hasCases(fee)) return false;
  return fee.by.some((b) => (isRange(b) && monthThing(b.kind) !== undefined) || (b.kind === "portfolioSize" && !chargedOnHolding(fee)));
}

/**
 * F-128 Each fee of the deal on one run of the plan. A current account is charged unless the deal was filled from the bank the person marks
 * (D64); the fund's own fee comes from the fund's record; a fee in the person's own words is never charged; every other fee as
 * `planChargeOf` says. A fee the plan charges must be priced (§10.6), in order (F-110), have a case for what the plan buys (F-114), and
 * change by nothing the plan does not read yet.
 */
export function feesOnPlan(deal: FeeDeal, run: DealRun, ctx: PlanContext): FeeOnPlan[] {
  const d = planDeal(deal, run);
  const read = readDealFor(d, ctx.kinds, ctx.today);
  const facts = { converts: run.currency !== null, distributes: run.distributes };
  return d.fees.map((f): FeeOnPlan => {
    const off = offOf(d, f, facts, ctx);
    if (off) return { fee: f.id, on: "off", why: off };
    if (read.banned.some((b) => b.fee === f.id)) return { fee: f.id, on: "off", why: "banned" };
    const miss = (why: MissingWhy): FeeOnPlan => ({ fee: f.id, on: "missing", missing: { why, fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}) } });
    if (notRead(f)) return miss("not-read");
    if (read.unread.includes(f.id)) return miss("order");
    if (read.unpriced.includes(f.id)) return miss("price");
    if (read.unmatched.includes(f.id)) return miss("case");
    return { fee: f.id, on: "charged" };
  });
}

function offOf(deal: FeeDeal, f: Fee, facts: { converts: boolean; distributes: boolean }, ctx: PlanContext): OffPlan | null {
  if (f.kind === "current_account") return !ctx.currentAccounts ? "no-current-account" : dealHouseId(deal) !== null && dealHouseId(deal) === ctx.currentAccounts.own ? "own-bank" : null;
  if (f.kind === "fund_management") return "fund-record";
  if (f.kind === "own") return "own-words";
  const c = planChargeOf(engineBase(f.kind), facts);
  return "charge" in c ? null : c.not === "named" ? "own-words" : c.not;
}

/**
 * F-128 The deal account for one run, or why it has no price there (the first fee the plan charges that lacks something, as
 * `missingKey` writes it): the deal read for the plan, its fees the plan charges, `foreign` false (the run converts on its own), its first
 * month the device's, and its current account where the plan charges one: its own, else its bank's (`bankAccount`), after its fees.
 */
export function planAccount(deal: FeeDeal, run: DealRun, ctx: PlanContext): DealAccount | DealUnpriced {
  const on = feesOnPlan(deal, run, ctx);
  const missing = on.find((x): x is Extract<FeeOnPlan, { on: "missing" }> => x.on === "missing");
  if (missing) return { unpriced: missingKey(missing.missing) };
  const charged = new Set(on.filter((x) => x.on === "charged").map((x) => x.fee));
  const d = planDeal(deal, run);
  const read = readDealFor(d, ctx.kinds, ctx.today);
  const fees = read.fees.filter((f) => charged.has(feeOf(f)));
  const own = fees.map(engineFee);
  const bank: DealFee[] = ctx.bankAccount !== undefined && !deal.fees.some((f) => f.kind === "current_account") ? [{ base: { name: "current_account" }, stages: [{ price: { kind: "sum", amount: ctx.bankAccount, everyMonths: 1 } }] }] : [];
  const currentAccount = [...fees.flatMap((f, i) => (f.kind === "current_account" ? [i] : [])), ...bank.map((_, i) => own.length + i)];
  const engine: Deal = { fees: [...own, ...bank], foreign: false, ...(deal.provider ? { provider: deal.provider } : {}) };
  feeIds.set(engine, [...fees.map(feeOf), ...bank.map(() => BANK_ACCOUNT)]);
  return {
    deal: engine,
    start: monthOfDate(ctx.today),
    rates: {},
    ...(currentAccount.length ? { currentAccount } : {}),
  };
}

/** The bank's current account a deal filled from a bank pays (`PlanContext.bankAccount`), among a run's fees: it is none of the deal's own. */
export const BANK_ACCOUNT = "bank-account";

const feeIds = new WeakMap<Deal, string[]>();
/**
 * The deal's fee each of a run's fees is, in the run's order (the engine's `byFee` counts them so), by the deal the run read
 * (`DealAccount.deal`): a fee read as one fee per step of sizes is each of them; the bank's current account is `BANK_ACCOUNT`.
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
