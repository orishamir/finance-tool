// The fund's three fees, each with its word: the index page's fund card and fund rows read them (components/invest/pair.tsx).
import { brands, invest as c } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import { feeAbsent } from "../../lib/providers";
import { FeeFigure, ProductFigures } from "../kit";
import { isCustomFund } from "../../lib/custom-entries";
import { ownBy, type SiteValue } from "../../lib/value";

const b = brands.funds;

const feeOf = (rec: FundRecord, key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
  const v = rec.fees[key];
  // D31: the fund manager's own fee, shown on that fund's row
  return v && v.value !== null ? ownBy(v as SiteValue, rec.manager) : null;
};

/**
 * The three fees, each with its word; one the fund does not have, or one not collected, says so (also the index page's fund slot).
 * `priced`: the variable fee the site prices where it is not the listed rate (F-92 (b)), named beside it with its years, so the card shows
 * the figure the costs rest on (pass 7: Kesem 5139696 showed 0.3%, priced at −0.215%).
 */
export function Fees({ rec, inline, priced }: { rec: FundRecord; inline?: boolean; priced?: { value: SiteValue; years: number[] } | null }) {
  // a foreign fund the person typed has one yearly charge, and nothing "not collected" beside it (D44)
  const yearlyOnly = isCustomFund(rec) && rec.domicile !== "IL";
  const items: { id: string; word: string; figure: React.ReactNode }[] = (yearlyOnly ? (["fixed_management"] as const) : (["fixed_management", "variable_management", "trustee"] as const)).map((key, i) => {
    const v = feeOf(rec, key);
    const word = yearlyOnly ? c.customEntries.yearlyWord : [b.feeWords.fixed, b.feeWords.variable, b.feeWords.trustee][i]!;
    const absent = feeAbsent(rec, key);
    // a fee of a fund the person typed and left empty is not known, and says so: it was never collected (#190)
    const figure = !v && !absent && isCustomFund(rec) ? <span className="text-sm text-muted-foreground">{c.customEntries.notTyped}</span> : <FeeFigure value={v} absent={absent} inline={inline} />;
    return { id: key, word: absent && key === "trustee" ? c.funds.noTrusteeWord : word, figure };
  });
  if (priced && !yearlyOnly) items.splice(2, 0, { id: "variable_priced", word: c.kinds.variableChargedWord(priced.years), figure: <FeeFigure value={priced.value} inline={inline} /> });
  return <ProductFigures items={items} inline={inline} />;
}
