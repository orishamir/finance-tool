// The parts of a securities account's card on a company's page (brokerage-card.tsx), each with a fixed id so a link lands on it (the
// companies page's "עוד בעמוד המלא"), and the names of its price list's groups of fees. One place for both, so the card and the links agree.
import { guideBlocks, r4catalogue as copy } from "../../../copy";
import type { TariffLineRow } from "./types";

export const accountSectionIds = { fees: "account-fees", canBuy: "account-can-buy", claims: "account-claims", groups: "account-groups", facts: "account-facts" } as const;

/** The parts the card shows, in its order, with their titles: its fee table and what can be bought there when the price list has them, what
 *  its advertising says when there is any, its group prices when its record says anything of them, and opening an account always. */
export function accountSections(has: { fees: boolean; canBuy: boolean; claims: boolean; groups: boolean }): { id: string; title: string }[] {
  return [
    ...(has.fees ? [{ id: accountSectionIds.fees, title: copy.card.linesTitle }] : []),
    ...(has.canBuy ? [{ id: accountSectionIds.canBuy, title: copy.card.canBuy.title }] : []),
    ...(has.claims ? [{ id: accountSectionIds.claims, title: copy.card.claims.title }] : []),
    ...(has.groups ? [{ id: accountSectionIds.groups, title: copy.card.groupsTitle }] : []),
    { id: accountSectionIds.facts, title: copy.card.factsTitle },
  ];
}

/** The kinds of fee in the order a reader looks for them; a kind not named here comes after, in the price list's order. */
const kindOrder = ["trade", "custody", "fx", "fixed_period", "transfer_out", "distribution"];
export const feeKindOf = (l: TariffLineRow): string => (l.distribution ? "distribution" : l.base);

/** The kinds of fee a price list has, in the table's order. */
export function feeKinds(lines: readonly TariffLineRow[]): string[] {
  return [...new Set(lines.map(feeKindOf))].sort((a, b) => (kindOrder.indexOf(a) + 1 || 99) - (kindOrder.indexOf(b) + 1 || 99));
}

/** A kind of fee's name, as the table's strip writes it. */
export function feeKindName(kind: string): string {
  if (kind === "distribution") return copy.card.distribution.name;
  return (guideBlocks.fees as Record<string, { name: string }>)[kind]?.name ?? kind;
}
