// The bank product row (design-system 8.7): one deposit, savings plan or current-account record of a bank, as the
// 447 page names it, with its terms as a key-value list, every figure a sourced Num with its date.
import type { ReactNode } from "react";
import { guidePath } from "../../../lib/site-paths";
import { r4catalogue as copy } from "../../../copy";
import { IconAlert } from "../../icons";
import { Num, RuleRef, RulesLine } from "../../provenance";
import { AmountRange, AnchorSpread, Card, Disclosure, DoubtNote, GoLink, KeyValueList, LabelRow, MixedName, PrintedQuotes, PrintedText, Tag, When, type KeyValueItem } from "../../kit";
import { breakText, depositLabels, exitsText, renewText, taxWord, termWords } from "../../../lib/deposit-kind";
import type { ProductRowData } from "./types";

function Chips({ ids, known }: { ids: readonly string[]; known: ReadonlySet<string> }) {
  const shown = [...new Set(ids)].filter((id) => known.has(id));
  return shown.length ? <RulesLine ids={shown} /> : null;
}

/** One term of the card: its label and value, then what stands under the value (a doubt, the bank's words) and the rules behind it. */
const item = (id: string, label: string, value: ReactNode, known: ReadonlySet<string>, more: { rules?: readonly string[]; tag?: ReactNode; after?: ReactNode } = {}): KeyValueItem => ({
  id,
  label,
  value,
  ...(more.tag ? { tag: more.tag } : {}),
  footer: (more.after || more.rules) && (
    <>
      {more.after}
      {more.rules && <Chips ids={more.rules} known={known} />}
    </>
  ),
});

export function BankProductRow({ p, known, wrapperName }: { p: ProductRowData; known: ReadonlySet<string>; wrapperName: string }) {
  const l = copy.labels;
  const term = termWords(p.term);
  const items: KeyValueItem[] = [
    item("type", l.type447, <MixedName>{p.type447}</MixedName>, known, { rules: ["BANK-13"] }),
    item("term", l.term, p.currentAccount || term === null ? copy.term.none : <Num value={p.term} display={term} />, known, { rules: p.term.rule_ids ?? [] }),
    item(
      "rateType",
      l.rateType,
      p.rateType === "variable" ? (
        <>
          {copy.rateType.variable} <AnchorSpread variable anchor={p.anchor} spread={p.spread} look="words" />
        </>
      ) : (
        copy.rateType.fixed
      ),
      known,
    ),
    item("rate", l.rate, <Num value={p.rate} size="cell" />, known, { rules: p.rate.rule_ids ?? [], after: p.doubt ? <DoubtNote text={p.doubt} className="text-sm" /> : undefined }),
    item("asOf", l.asOf, <Num value={p.asOf} />, known, { tag: p.asOfAfterRead && <Tag tone="caution" icon={<IconAlert size={14} />}>{copy.asOfAfterRead}</Tag> }),
    item("linkage", l.linkage, <Num value={p.linkageValue} display={copy.linkage[p.linkage]} />, known),
    // an empty bucket gets no word here: Num says what it is (an open rule, or unknown), never the record's "null" (WIN WIN)
    item("tax", l.tax, <Num value={p.taxBucket} display={taxWord(p.taxBucket.value)} />, known, { rules: p.taxBucket.rule_ids ?? [] }),
    item("amount", l.amount, <AmountRange min={p.amountMin} max={p.amountMax} />, known, { rules: p.amountMin.rule_ids ?? [] }),
    item("break", l.breakTerms, breakText(p.breakTerms.penalty, p.exitPoints.exists), known, {
      rules: p.breakTerms.rules,
      after: p.breakTerms.quotes.length > 0 && (
        <Disclosure look="link" label={copy.breakDisclosure} summaryClassName="text-sm">
          <PrintedQuotes quotes={p.breakTerms.quotes} />
        </Disclosure>
      ),
    }),
    // exits with no fixed interval: the dates are in the bank's conditions above ("יש" alone said nothing)
    item("exits", l.exits, exitsText(p.exitPoints, p.conditions), known),
    item("renew", l.autoRenew, renewText(p.autoRenew.value, p.autoRenew.maxRenewals), known),
  ];
  return (
    <Card as="article" id={`product-${p.id}`} className="flex flex-col gap-3 anchor-target target:outline-2 target:outline-ring target:outline-offset-2">
      <header className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold max-w-measure">
          <MixedName>{p.name}</MixedName>
        </h3>
        {p.model && (
          <p className="text-sm text-muted-foreground">
            {copy.modelLine} <bdi dir="ltr" className="num-id">{p.model}</bdi>
          </p>
        )}
        {/* what sets the deposit apart: its kind as labels, then the conditions the bank prints; a current account's
            conditions are long and stay folded below */}
        <LabelRow labels={depositLabels(p.variant, known, p.table)} />
        {!p.currentAccount && p.conditions && (
          <p className="text-sm max-w-measure">
            <span className="text-muted-foreground">{copy.conditionsLead}</span> <PrintedText text={p.conditions} />
          </p>
        )}
        {p.alsoCalled.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span>{copy.alsoCalled}</span>
            {p.alsoCalled.map((n) => (
              <Tag key={n} wrap>
                <MixedName>{n}</MixedName>
              </Tag>
            ))}
          </p>
        )}
      </header>
      {p.stale && (
        <p className="flex items-start gap-1.5 text-sm text-caution-foreground">
          <IconAlert size={18} className="text-caution shrink-0 mt-0.5" />
          <span>
            <When iso={p.snapshot} lead={copy.card.stale.before} />
            {copy.card.stale.after}
          </span>
        </p>
      )}
      <KeyValueList plain items={items} />
      {p.currentAccount && p.conditions && (
        <Disclosure look="link" label={copy.currentConditions} summaryClassName="text-sm">
          <p className="text-sm bg-muted rounded-md p-3 max-w-measure">
            <PrintedText text={p.conditions} />
          </p>
        </Disclosure>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.notAnOffer} {known.has("BANK-13") && <RuleRef id="BANK-13" />}
      </p>
      <GoLink to={guidePath(p.wrapperId)} className="self-start">
        {copy.rowLinks.whatIs} {wrapperName}
      </GoLink>
    </Card>
  );
}
