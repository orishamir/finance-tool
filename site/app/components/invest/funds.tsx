// The fund's three fees, each with its word: the index page's fund card writes them in a line, the receipt as rows under the fund's line
// (components/invest/receipt.tsx).
import { brands, invest as c } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import { feeAbsent } from "../../lib/providers";
import { FeeFigure, ProductFigures } from "../kit";
import { isCustomFund } from "../../lib/custom-entries";
import { ownBy, type SiteValue } from "../../lib/value";
import { fundPromotions } from "../../lib/fund-promotions";
import { fmt } from "../../lib/format";

const b = brands.funds;

const feeOf = (rec: FundRecord, key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
  const v = rec.fees[key];
  // D31: the fund manager's own fee, shown on that fund's row
  return v && v.value !== null ? ownBy(v as SiteValue, rec.manager) : null;
};

export interface FundFeeItem {
  id: string;
  /** The word after the figure in a line of fees ("0.35% קבועים"). */
  word: string;
  /** The fee's whole name, for a row of its own ("דמי ניהול קבועים"). */
  name: string;
  figure: React.ReactNode;
  /** No number stands here: the fund has no such fee, or it was not collected or typed. */
  missing: boolean;
}

/**
 * The three fees, each with its word and its name; one the fund does not have, or one not collected, says so. `priced`: the variable fee the
 * site prices where it is not the listed rate (F-92 (b)), named beside it with its years, so the card shows the figure the costs rest on
 * (Kesem 5139696 showed 0.3%, priced at −0.215%).
 */
export function fundFeeItems(rec: FundRecord, { inline, priced, today }: { inline?: boolean; priced?: { value: SiteValue; years: number[] } | null; /** The page's day: a promotion in force on it is shown after its fee (F-121). */ today?: string } = {}): FundFeeItem[] {
  // a foreign fund the person typed has one yearly charge, and nothing "not collected" beside it (D44)
  const yearlyOnly = isCustomFund(rec) && rec.domicile !== "IL";
  const names = c.receipt.fundFees;
  const items: FundFeeItem[] = (yearlyOnly ? (["fixed_management"] as const) : (["fixed_management", "variable_management", "trustee"] as const)).map((key, i) => {
    const v = feeOf(rec, key);
    const word = yearlyOnly ? c.customEntries.yearlyWord : [b.feeWords.fixed, b.feeWords.variable, b.feeWords.trustee][i]!;
    const absent = feeAbsent(rec, key);
    // a fee of a fund the person typed and left empty is not known, and says so: it was never collected
    const figure = !v && !absent && isCustomFund(rec) ? <span className="text-sm text-muted-foreground">{c.customEntries.notTyped}</span> : <FeeFigure value={v} absent={absent} inline={inline} />;
    return { id: key, word: absent && key === "trustee" ? c.funds.noTrusteeWord : word, name: yearlyOnly ? names.yearly : [names.fixed, names.variable, names.trustee][i]!, figure, missing: !v };
  });
  // a fee lowered for a stated period, after the fee it lowers (F-121)
  for (const p of today && !yearlyOnly ? fundPromotions(rec, today) : []) {
    const at = items.findIndex((x) => x.id === p.fee);
    const until = fmt.date(p.until);
    const name = items[at]?.name ?? p.fee;
    items.splice(at + 1, 0, { id: `${p.fee}-promotion`, word: c.funds.promotionWord(until), name: c.funds.promotionName(name, until), figure: <FeeFigure value={p.value} inline={inline} />, missing: false });
  }
  if (priced && !yearlyOnly) {
    const word = c.kinds.variableChargedWord(priced.years);
    // after the variable fee and its promotion, wherever the promotions above put them
    const after = items.findLastIndex((x) => x.id === "variable_management" || x.id === "variable_management-promotion");
    items.splice(after + 1, 0, { id: "variable_priced", word, name: names.charged(word), figure: <FeeFigure value={priced.value} inline={inline} />, missing: false });
  }
  return items;
}

/** The fees in a line, or one under the other in a table cell (also the index page's fund slot). */
export function Fees({ rec, inline, priced, today }: { rec: FundRecord; inline?: boolean; priced?: { value: SiteValue; years: number[] } | null; today?: string }) {
  return <ProductFigures items={fundFeeItems(rec, { inline, priced, ...(today ? { today } : {}) })} inline={inline} />;
}
