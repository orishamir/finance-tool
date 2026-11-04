// A house's group price picked on the index page (founder, 2026-11-04): the radios in a house's fold of group prices. A pick is a choice
// the person makes, never a question the page asks (D43 amended (4)); its figures stand beside the ranking and never in it (D43): the house's
// row keeps its price-list figure and place, and the picked group is priced as an account built on the house (F-101), held only for the
// page, never saved. A group is offered only where it changes a figure and its end is known: a price whose own words name fund units
// (no price from analogy, D42) on the side the fund trades, and every such price ends after a printed number of months from joining. A
// price that ends at an age, or whose end is not printed, would need the person's age or stay, which the page never asks.
import type { FeesSnapshot } from "@finance-tool/schema";
import { brokerFromDraft, withCustomEntries, type CustomBroker } from "./custom-entries";
import { buildInvest, type FundWay, type InvestArgs, type InvestView, type OptionId, type ProviderInfo, type WayPrice } from "./invest";
import { startingPointsOf, type StartingPoint } from "./own-account";
import { startDraft } from "./own-account-panel";
import { groupPrices as copy } from "../copy";

/** The group's key in the address and the record: `group:<n>`, its place in the house's record. */
export type GroupKey = `group:${number}`;

/** The side of the record's prices a fund trades on: funds abroad pay the abroad prices, every fund listed in Tel Aviv the Israeli ones. */
const sideOf = (option: OptionId) => (option === "abroad" ? "abroad" : "israel");

/** The group's prices the run reads for a fund on that side: in numbers, and naming fund units (`partsOf` reads only those). */
function fundPrices(point: StartingPoint, side: "israel" | "abroad") {
  return (point.group?.prices ?? []).filter((p) => p.value && p.names_fund && p.fee.endsWith(side === "abroad" ? "_abroad" : "_israel"));
}

/** Whether the person can pick this group for a fund of this option at this house: it changes a figure, and each such price ends after a printed number of months. */
export function canPick(point: StartingPoint, option: OptionId): boolean {
  const ps = fundPrices(point, sideOf(option));
  return ps.length > 0 && ps.every((p) => p.value!.for_months !== undefined);
}

/** The groups of a house the person can pick for a fund of this option, by key. */
export function pickableGroups(snapshot: FeesSnapshot | undefined, option: OptionId | undefined): Set<string> {
  if (!snapshot || !option) return new Set();
  return new Set(startingPointsOf(snapshot).filter((p) => p.kind !== "list" && canPick(p, option)).map((p) => p.key));
}

/** The id of the held account for a house's group: a custom broker's prefix, so the pricing treats it as an account built on the house. */
export const groupBrokerId = (house: string, key: string) => `custom-broker-group-${house}-${key.replace(":", "-")}`;

/** The account the run prices for a house's group: the house's price list with that group's prices, for as long as each holds (F-101). */
export function groupBroker(snapshot: FeesSnapshot, key: string, short: string, today: string): CustomBroker | null {
  const point = startingPointsOf(snapshot).find((p) => p.key === key);
  if (!point?.group) return null;
  return brokerFromDraft(startDraft(snapshot, point, copy.pickedName(short, point.nameHe)), groupBrokerId(snapshot.id, key), today);
}

/** A held group account's figure at a house: marked so no ranking reads it (D43). */
export type GroupWayPrice = WayPrice & { group: true };
export const isGroupPrice = (x: unknown): boolean => !!x && typeof x === "object" && (x as { group?: boolean }).group === true;

/**
 * The view with the picked group's account added beside its house: its figure for every fund is priced at the group's prices and marked as
 * a group's (`group: true`), and it joins the providers marked too, so the lists, the ranking, the stairs and the cheapest pair leave it out.
 * Only the picked house and the group's account are priced (a few milliseconds), not every house again.
 */
export function withGroupPick(args: InvestArgs, view: InvestView, house: string, key: string, short: string): { view: InvestView; bundle: InvestArgs["bundle"]; id: string; name: string } | null {
  const snapshot = args.bundle.snapshots.find((s) => s.id === house);
  if (!snapshot) return null;
  const broker = groupBroker(snapshot, key, short, args.bundle.today);
  if (!broker) return null;
  const withGroup = withCustomEntries(args.bundle, [broker], []);
  const own = withGroup.snapshots.find((s) => s.id === broker.id)!;
  const small = buildInvest({ ...args, bundle: { ...withGroup, snapshots: [snapshot, own] } });
  const priceOf = (f: FundWay): GroupWayPrice | null => {
    const at = small.options.find((o) => o.id === f.option)?.funds.find((x) => x.rec.id === f.rec.id)?.byHouse[broker.id];
    return at && "valueN" in at ? { ...at, group: true } : null;
  };
  const info = small.providers.find((p) => p.id === broker.id);
  if (!info) return null;
  const provider: ProviderInfo & { group: { house: string; key: string } } = { ...info, custom: false, group: { house, key } };
  return {
    id: broker.id,
    bundle: withGroup,
    name: groupNameOf(snapshot, key),
    view: {
      ...view,
      providers: [...view.providers, provider],
      options: view.options.map((o) => ({
        ...o,
        funds: o.funds.map((f) => {
          const at = priceOf(f);
          return at ? { ...f, byHouse: { ...f.byHouse, [broker.id]: at } } : f;
        }),
      })),
    },
  };
}

/** The name of a house's group by its key, as its record prints it. */
export const groupNameOf = (snapshot: FeesSnapshot | undefined, key: string): string => (snapshot?.groups?.state === "prices" ? snapshot.groups.entries[Number(key.replace("group:", ""))]?.name_he : undefined) ?? "";

/** A provider row that is a held group account, not a house of the list. */
export const isGroupProvider = (p: ProviderInfo): boolean => "group" in p && !!(p as { group?: unknown }).group;
