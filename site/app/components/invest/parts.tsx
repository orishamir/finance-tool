// Shared pieces of the index page: the type tag and the sentence for a cell the engine
// could not price. The label chip, its row and its sheet are in the kit.
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { invest as c, r4workbench } from "../../copy";
import { optionLabels } from "../../lib/labels";
import type { OptionId } from "../../lib/invest";
import type { Reason } from "../../lib/invest";
import type { NotComparable } from "../../lib/providers";
import { LabelChip } from "../kit";
import { assertNever } from "@finance-tool/schema";

// ---------------------------------------------------------------- labels

/**
 * The type tag of a fund (the type is a byproduct of the cheapest way, not a choice): one short tag from the
 * option, opening what the option's two labels say (where it is held, how it trades) with their rules.
 */
export function OptionTag({ option }: { option: OptionId }) {
  const parts = optionLabels(option);
  const first = parts[0]!;
  const rules = [...new Set(parts.flatMap((l) => l.rests.rules))];
  return <LabelChip label={{ ...first, text: c.typeTags[option]!, explain: parts.map((l) => l.explain).join(" "), rests: { rules } }} />;
}

// ---------------------------------------------------------------- reasons

/** The tariff class each option is bought as, for the sentence that names a missing tariff line. */
export const optionClass = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "tase_foreign_fund_units", abroad: "foreign_securities" } as const;

/** The sentence for a price the engine or the site could not give, of one fund or, `many`, of the funds it is said once over. */
export function reasonText(r: Reason, cls: string, many = false): string {
  const w = many ? { ...c.reasons, ...c.reasonsMany } : c.reasons;
  switch (r.code) {
    case "fund-type":
      return w.fundType;
    case "need-yield":
      return w.needYield;
    case "need-rate":
      return c.reasons.needRate(r.currency);
    case "no-fund-rate":
      return w.noBroker;
    case "no-hedge-record":
      return w.noHedgeRecord;
    case "no-hedge-entered":
      return w.noHedgeEntered;
    case "payout-unknown":
      return w.payoutUnknown;
    case "fee-unknown":
      return w.feeUnknown;
    case "domicile-unknown":
      return w.domicileUnknown;
    case "sold-fund-by-fund":
      return c.reasons.soldFundByFund;
    case "no-agreement-found":
      return w.noAgreementFound;
    default:
      return reasonSentence(r, cls, r4workbench.providers.behaviour.channelOptions.direct);
  }
}

/** The sentence for a house the engine could not price (moved here with the house-ranking page's removal). */
export function reasonSentence(r: NotComparable, instrumentClass: string, channelWord: string): string {
  const n = r4workbench.notComparable;
  const cls = r4workbench.instrumentClasses[instrumentClass] ?? instrumentClass;
  switch (r.code) {
    case "data-missing":
      return n.dataMissing;
    case "no-applicable-line":
      return / through /.test(r.detail) ? n.noLineChannel(cls, channelWord) : n.noLine(cls);
    case "no-average":
      return n.noAverage(cls);
    case "line-without-value":
      return n.lineWithoutValue(r.lineName ?? r.detail);
    case "not-printed-for-currency":
      return n.notPrintedForCurrency(r.lineName ?? r.detail, r.printed.map((x) => c.currencies[x] ?? x), c.currencies[r.currency] ?? r.currency);
    case "ambiguous":
      return n.ambiguous(cls);
    case "needs-share-price":
      return n.needsSharePrice;
    case "needs-fx-rate":
      return n.needsFxRate;
    case "record-error":
      return n.recordError;
    case "other-venue":
      return n.otherVenue(r.venue);
    case "rule-open":
      return (r.question ? c.reasons.ruleOpen[r.question] : undefined) ?? c.reasons.ruleOpen[r.ruleId] ?? c.reasons.ruleOpenOther;
    case "deal-unpriced":
      // the deal's own reading says what it lacks, by its fee's name (lib/deal-account)
      return r.missing ? (c.dealAccount.missing[r.missing.why] ?? c.dealAccount.missing.price!)(feeNameOf(r.missing.kind, r.missing.name)) : c.dealAccount.missing.price!("");
    default:
      return assertNever(r);
  }
}
