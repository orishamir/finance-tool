// A fund's fees lowered for a stated period (data-schema §3.5, F-121), as the pages that show the fund's fees show them: each promotion's rate,
// the manager's or the trustee's own figure, with the day it ends, after the fee it lowers. Pure.
import type { FundRecord } from "@finance-tool/schema";
import { ownBy, type SiteValue } from "./value";

/** One promotion as a page shows it: the fee it lowers, its rate, and its last day (`YYYY-MM-DD`). */
export interface FundPromotionView {
  fee: "fixed_management" | "variable_management" | "trustee";
  value: SiteValue;
  until: string;
}

/** The record's promotions that have not ended by `today`, each with its rate as the fund's own figure (D31). */
export function fundPromotions(rec: Pick<FundRecord, "promotions" | "manager">, today: string): FundPromotionView[] {
  return (rec.promotions ?? []).flatMap((p) => (p.rate.effective_to && p.rate.effective_to >= today && typeof p.rate.value === "number" ? [{ fee: p.fee, value: ownBy(p.rate as SiteValue, rec.manager), until: p.rate.effective_to }] : []));
}
