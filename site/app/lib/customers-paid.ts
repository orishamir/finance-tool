// What a house's customers paid on average, as the exchange publishes it by size of portfolio (the account panel's third
// column). The figures are not collected, so the site shows that the figure exists and links to it, never the number. THE ONE PLACE the
// numbers would go: return the figure for a house and a fee type as a sourced value (the exchange's page its source), and the panel's third
// column shows it in place of the link. No data job collects it.
import type { SiteValue } from "./value";
import type { FeeType } from "./own-account-view";

export function customersPaid(_houseId: string, _fee: FeeType): SiteValue | null {
  return null;
}
