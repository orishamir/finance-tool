// A fund's fees lowered for a stated period (data-schema §3.5, F-121), as the pages that show the fund's fees show them: each promotion in force
// on the page's day, its rate the manager's or the trustee's own figure, with the day it ends, after the fee it lowers. Pure.
import type { FundRecord } from "@finance-tool/schema";
import { ownBy, type SiteValue } from "./value";

/** One promotion as a page shows it: the fee it lowers, its rate, and its last day (`YYYY-MM-DD`). */
export interface FundPromotionView {
  fee: "fixed_management" | "variable_management" | "trustee";
  value: SiteValue;
  until: string;
}

/** Whether a promotion is in force on `today`: from its first day to its last, both included. */
const inForce = (p: NonNullable<FundRecord["promotions"]>[number], today: string): boolean => !!p.rate.effective_from && !!p.rate.effective_to && p.rate.effective_from <= today && today <= p.rate.effective_to;

/**
 * The record's promotions in force on `today` (not before the first day, not after the last), each with its rate as the fund's own figure
 * (D31). Every page that shows a fund's fees shows these and no other.
 */
export function fundPromotions(rec: Pick<FundRecord, "promotions" | "manager">, today: string): FundPromotionView[] {
  return (rec.promotions ?? []).flatMap((p) => (inForce(p, today) && typeof p.rate.value === "number" ? [{ fee: p.fee, value: ownBy(p.rate as SiteValue, rec.manager), until: p.rate.effective_to! }] : []));
}
