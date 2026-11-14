// The unit's price typed beside the curve of a price per unit, one for each deal, kept while the page is open with the currency it was
// asked in (`unitCurrency`): once the deal asks it in another (what is held, or the sum per unit's currency, changed) it is cleared, never
// read as a price in the new currency.
import { useEffect, useMemo, useState } from "react";
import { unitCurrency } from "../../lib/fee-deal/reading";
import type { DealRead } from "../../lib/fee-deal/deal-read";

/** The deal's unit price (null where none is typed in the currency it is asked in now), and what typing or clearing it does. */
export function useUnitPrice(read: DealRead, dealId: string): { unitPrice: number | null; onUnitPrice: (n: number | null) => void } {
  const [unitPrices, setUnitPrices] = useState<Readonly<Record<string, { n: number; currency: string }>>>({});
  const askedIn = useMemo(() => unitCurrency(read), [read]);
  const typed = unitPrices[dealId];
  const drop = (id: string) =>
    setUnitPrices((all) => {
      const { [id]: _was, ...rest } = all;
      return rest;
    });
  useEffect(() => {
    if (typed && typed.currency !== askedIn) drop(dealId);
  }, [typed, askedIn, dealId]);
  const onUnitPrice = (n: number | null) => {
    if (n === null || askedIn === null) drop(dealId);
    else setUnitPrices((all) => ({ ...all, [dealId]: { n, currency: askedIn } }));
  };
  return { unitPrice: typed && typed.currency === askedIn ? typed.n : null, onUnitPrice };
}
