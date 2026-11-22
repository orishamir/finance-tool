// The person's securities-account deals in the indices bundle (decisions 1 and 2 of the deal-on-indices design, F-128): each saved deal is
// an account the page lists by itself, as a fee record with no lines (what every list, card and receipt already reads of an account) and
// the deal itself, which the run prices as a deal account (`DealProvider`), never a copy of it.
import { countsCurrentAccount, type DealProvider, type DealRun } from "@finance-tool/engine";
import type { FeesSnapshot } from "@finance-tool/schema";
import type { FeeDeal } from "../fee-deal/model";
import type { DealKind } from "../fee-deal/kinds";
import type { BundleSnapshot, IndicesBundle } from "../providers";
import { dealHouseId, isAccountDeal, planAccount, type LineValue, type PlanContext } from "./plan";
import { houseLineValue } from "../fee-deal/templates";

/** An account of the page that is a deal, by its id on the page: the deal's id after `deal:`. */
const PREFIX = "deal:";
export const dealProviderId = (dealId: string): string => `${PREFIX}${dealId}`;
export const isDealProviderId = (id: string): boolean => id.startsWith(PREFIX);
export const dealIdOf = (providerId: string): string | null => (isDealProviderId(providerId) ? providerId.slice(PREFIX.length) : null);

/** The deals in the bundle: by account id, the deal; the kinds its reading needs (bans, caps). */
export interface DealsInBundle {
  byId: Record<string, FeeDeal>;
  kinds: DealKind[];
}

/** The house a deal was filled from where it is still on the site: what kind of house the account is, and how it buys a fund (F-109). */
export const houseSnap = (bundle: Pick<IndicesBundle, "snapshots">, deal: Pick<FeeDeal, "template">): BundleSnapshot | undefined => {
  const id = dealHouseId(deal);
  return id ? bundle.snapshots.find((s) => s.id === id) : undefined;
};

/**
 * A deal as an account's record with no lines: the deal is its whole price. Filled from a house's whole price list, it is an account at that
 * house, as an account built on a house is (F-101): the house's kind, what the house does not sell and what it sells fund by fund are its own. Filled from none, it is
 * the kind of provider the deal names (a bank's account where it names a bank, F-14's member kind), else a broker's, and sells every kind of
 * fund, and what it has no price for its own cases say (F-128).
 */
export function snapshotOfDeal(deal: FeeDeal, house: BundleSnapshot | undefined, today: string): BundleSnapshot {
  const saved = deal.saved ?? today;
  return {
    id: dealProviderId(deal.id),
    provider: { name_he: deal.name, class: house?.provider.class ?? (deal.provider === "bank" ? "bank" : "broker"), regulator: house?.provider.regulator ?? "ISA", tase_member: false, protection_rule_ids: house?.provider.protection_rule_ids ?? [] },
    tariff: { url: "local", title: deal.name, published: null, format: "html" },
    snapshot: saved,
    missing: false,
    missing_reason: null,
    lines: [],
    averages: [],
    minimums: { account_opening: null },
    notice_rule_ids: [],
    availability: house?.availability ?? [],
    // what the house sells fund by fund, under its distribution agreements (BRK-38), the deal sells the same way
    ...(house?.fundByFund ? { fundByFund: house.fundByFund } : {}),
  } as BundleSnapshot;
}

/** The bundle with the person's securities-account deals in it. None: the same object, so the page prices nothing again. */
export function withDeals(bundle: IndicesBundle, deals: readonly FeeDeal[], kinds: readonly DealKind[]): IndicesBundle {
  const mine = deals.filter(isAccountDeal);
  if (mine.length === 0) return bundle;
  return {
    ...bundle,
    snapshots: [...bundle.snapshots, ...mine.map((d) => snapshotOfDeal(d, houseSnap(bundle, d), bundle.today))],
    deals: { byId: Object.fromEntries(mine.map((d) => [dealProviderId(d.id), d])), kinds: [...kinds] },
  };
}

/**
 * What a deal is read with on the page's plan (F-128, `PlanContext`): the kinds, the page's run month (the bundle's day), the page's current
 * accounts, and, for a deal filled from a house's whole list, that house's line choice and, at a bank whose record prices a current account
 * the page counts, that account's monthly minimum (F-102).
 */
export function planContextOf(bundle: Pick<IndicesBundle, "snapshots" | "today">, deal: FeeDeal, kinds: readonly DealKind[], currentAccounts: PlanContext["currentAccounts"]): PlanContext {
  const house = houseSnap(bundle, deal);
  const bank = house && currentAccounts && countsCurrentAccount(house, currentAccounts.own) ? house.current_account!.monthly_minimum.value : undefined;
  return { kinds, today: bundle.today, currentAccounts, ...(typeof bank === "number" ? { bankAccount: bank } : {}), ...(house ? { lineValue: lineValueOf(house) } : {}) };
}

/** F-63's line choice of a house, in its template's words (`houseLineValue`), on the record its own row reads, kept per class. */
export function lineValueOf(house: BundleSnapshot): LineValue {
  const memo = new Map<string, string>();
  return (base, run, value) => {
    const key = `${base}|${run.instrumentClass}|${value}`;
    let v = memo.get(key);
    if (v === undefined) {
      v = houseLineValue(house as FeesSnapshot, base, run, value);
      memo.set(key, v);
    }
    return v;
  };
}

/**
 * The deal of an account the run prices, as the workbench reads it (F-128): its reading for each run (`planAccount`), and how its house
 * buys a fund, whole units or by amount (F-109), from the house it was filled from; a deal filled from none buys in whole units (D56). A deal filled
 * from a bank pays the bank's current account where the page counts it (F-102, `PlanContext.bankAccount`).
 */
export function dealProviderOf(bundle: IndicesBundle, s: BundleSnapshot, ctx: Pick<PlanContext, "currentAccounts">): DealProvider | null {
  const deal = bundle.deals?.byId[s.id];
  if (!deal) return null;
  const house = houseSnap(bundle, deal);
  const plan = planContextOf(bundle, deal, bundle.deals!.kinds, ctx.currentAccounts);
  return {
    id: s.id,
    name: deal.name,
    providerClass: s.provider.class,
    saved: s.snapshot,
    account: (run: DealRun) => planAccount(deal, run, plan),
    ...(house?.by_amount ? { byAmount: house.by_amount } : {}),
  };
}
