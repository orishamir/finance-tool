// A securities account's deal filled from a house's latest price list (method §10.6): the one way the site makes it, for the indices page's
// popup (a new deal from a house, a house's terms) and for a company page's fees, which show those terms.
import { invest } from "../../copy";
import { shortName } from "../providers";
import { NAME_MAX, newDeal, type FeeDeal } from "../fee-deal/model";
import { ACCOUNT_KIND } from "../fee-deal/kinds";
import { dealFromTemplate, houseName } from "../fee-deal/templates";
import type { FeesData } from "../fee-page-data";

/**
 * A new deal filled from a house's latest price list (`house:<id>`, or one of its ways to buy), named "<house>, בתנאים שלי" by the house's
 * short name, as the account list writes it (`shortName`); null where no list of the fee page's houses fills it (`startsDeal`).
 */
export function houseDeal(id: string, data: Pick<FeesData, "houses" | "tracks" | "templates">, today: string): FeeDeal | null {
  const d = dealFromTemplate(newDeal(ACCOUNT_KIND), id, data, today);
  if (!d) return null;
  const house = houseName(id, data);
  const providerId = id.replace(/^house:/, "").split("/", 1)[0] ?? id;
  return house ? { ...d, name: invest.dealAccount.nameOf(shortName(providerId, house)).slice(0, NAME_MAX) } : d;
}
