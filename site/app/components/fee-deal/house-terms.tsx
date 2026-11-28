// A house's terms, read-only (D106): its latest price list as a deal (lib/deal-account/house-deal.ts), drawn in the deal editor's own
// columns inside the kit's `ReadOnly`, with nothing tied to a plan. What its price leaves out, folded to a line, stands over the fees; under
// each fee's name, what the house's customers paid on average for that kind of fee (F-122), every column of it unless the host gives its own; after the fees, the
// distribution fee its list prints, which the deal holds no price for, with who pays it. A company page shows it as it is; the indices
// page's popup stands its tiles and plan around it and adds what the plan charges to each fee's head (`feeHead`). Not a kit piece: it is
// the deal editor, which the kit does not hold, laid out for a house's terms.
import { useMemo, type ReactNode } from "react";
import { r4catalogue, feeDeal } from "../../copy";
import type { FeesData, TermsFeesData, TermsHouse } from "../../lib/fee-page-data";
import type { Fee, FeeDeal } from "../../lib/fee-deal/model";
import type { DistributionPrice } from "../../lib/fee-deal/templates";
import { figure, heldRateUnit } from "../../lib/fee-deal/values";
import { shortName } from "../../lib/providers";
import { recordsById } from "../../lib/scope";
import type { LeftOutView } from "../../lib/left-out";
import { distributionRuleIds } from "../decoder/institutions/types";
import { Num, type ProvenanceData } from "../provenance";
import { FeeBlock, HelpMark, HouseAverageLine, LeftOutFold, PartChip, ReadOnly, gershayim } from "../kit";
import { useDealEditor } from "./editor";
import type { FeeSlot } from "./fee-block";

/** The page's provenance with the fee page's data over it (its rules, the records and heads they point at, its terms), which the editor's sheets read. */
export function withFeesData(page: ProvenanceData, data: Pick<TermsFeesData, "rules" | "pointed" | "heads" | "terms">): ProvenanceData {
  return {
    ...page,
    rules: { ...page.rules, ...Object.fromEntries(data.rules.map((r) => [r.id, r])) },
    ...(page.pointed || data.pointed ? { pointed: { ...page.pointed, ...recordsById(data.pointed) } } : {}),
    ...(page.heads || data.heads ? { heads: { ...page.heads, ...data.heads } } : {}),
    terms: { ...page.terms, ...data.terms },
  };
}

/**
 * The terms of house `house` on `first`, the deal filled from its latest list, drawn by the editor on `data`. `leftOut` stands in the fold
 * in place of the list's own (the popup's, with the price it leaves out on the plan's fund); `feeHead` is what the host adds to each fee's head;
 * `average`, the host's own average under a fee's name in place of every column of its kind (the popup's, for what the plan buys).
 */
export function HouseTerms({ data, today, first, house: template, leftOut, feeHead, average }: { data: FeesData; today: string; first: FeeDeal; house: TermsHouse | undefined; leftOut?: LeftOutView | null; feeHead?: (fee: Fee) => FeeSlot | undefined; average?: (fee: Fee) => ReactNode }) {
  const fold = leftOut === undefined ? (template?.leftOut ?? null) : leftOut;
  return (
    <ReadOnly>
      <div className="flex flex-col gap-4">
        {fold && <LeftOutFold view={fold} />}
        <TermsColumns data={data} today={today} first={first} template={template} feeHead={feeHead} average={average} />
        {template?.distribution && <DistributionFee prices={template.distribution} bank={template.provider === "bank"} today={today} />}
      </div>
    </ReadOnly>
  );
}

/** The editor's columns on the deal, each fee's head the host's with an average under it: the host's, else the house's every column of its kind. */
function TermsColumns({ data, today, first, template, feeHead, average }: { data: FeesData; today: string; first: FeeDeal; template: TermsHouse | undefined; feeHead: ((fee: Fee) => FeeSlot | undefined) | undefined; average: ((fee: Fee) => ReactNode) | undefined }) {
  const name = template ? gershayim(shortName(template.id, template.name)) : "";
  const everyColumn = (fee: Fee): ReactNode => {
    const of = template?.everyColumn?.columns.filter((c) => c.column.fee === fee.kind) ?? [];
    return of.length ? <HouseAverageLine customers averages={of} house={name} /> : null;
  };
  const head = (fee: Fee): FeeSlot | undefined => {
    const host = feeHead?.(fee);
    const under = (average ?? everyColumn)(fee);
    if (!under) return host;
    return { ...host, under: host?.under ? <>{host.under}{under}</> : under };
  };
  const ed = useDealEditor({ data, today, saved: NONE, writable: false, first, withReading: false, untitled: true, remember: false, feeHead: head });
  return ed.columns(null);
}

const NONE: readonly FeeDeal[] = [];

/**
 * The list's distribution fee (MF-24), a card as a fee's: its name with a "?" saying who pays it, from the regulations, with the chip of
 * the rules; at a bank, that it may charge the reader without an agreement (MF-26) under the name, in sight; then each type of fund's price.
 */
function DistributionFee({ prices, bank, today }: { prices: readonly DistributionPrice[]; bank: boolean; today: string }) {
  const d = r4catalogue.card.distribution;
  const shown = useMemo(() => prices.map((p) => ({ ...p, value: figure(p.rate, heldRateUnit(p.per), today) })), [prices, today]);
  return (
    <FeeBlock
      dot="bg-fee-other"
      name={
        <span className="inline-flex items-center gap-1">
          {d.name}
          <HelpMark about={d.name} text={d.who(bank ? d.toBank : d.toBroker)} rules={distributionRuleIds(bank ? "bank" : "broker")} />
        </span>
      }
      head={bank ? { under: d.chargeable } : undefined}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {shown.map((p) => (
          <PartChip key={p.name} kind="charge" lead={gershayim(p.name)} figure={<Num value={p.value} />} words={feeDeal.price.per[p.per]} />
        ))}
      </div>
    </FeeBlock>
  );
}
