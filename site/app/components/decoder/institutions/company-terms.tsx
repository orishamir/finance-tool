// A securities account's fees on a company page as the house's terms (brokerage-card.tsx): its latest price list as a deal, read-only,
// drawn by the deal editor (fee-deal/house-terms.tsx).
import { useMemo } from "react";
import { ProvenanceProvider, useProvenanceData } from "../../provenance";
import { HouseTerms, withFeesData } from "../../fee-deal/house-terms";
import { termsEditorData, type HouseTermsData } from "../../../lib/fee-page-data";

/**
 * The house's latest price list as its terms, read-only, as the indices page shows them, with nothing of a plan; its figures' sheets read
 * the rules the terms cite over the page's own.
 */
export function CompanyTerms({ terms }: { terms: HouseTermsData }) {
  const page = useProvenanceData();
  const data = useMemo(() => termsEditorData(terms.data), [terms.data]);
  if (!page) return null;
  return (
    <ProvenanceProvider data={withFeesData(page, terms.data)}>
      <HouseTerms data={data} today={page.today} first={terms.deal} house={terms.house} />
    </ProvenanceProvider>
  );
}
