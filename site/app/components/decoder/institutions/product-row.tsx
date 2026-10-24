// The bank product row (design-system 8.7): one deposit, savings plan or current-account record of a bank, as the
// 447 page names it, with its terms as a key-value list, every figure a sourced Num with its date.
import { Link } from "react-router";
import { r4catalogue as copy } from "../../../copy";
import { fmt } from "../../../lib/format";
import { IconAlert, IconDrillIn } from "../../icons";
import { Num, RuleRef, RulesLine } from "../../provenance";
import { Card, Disclosure, Tag } from "../../ui";
import type { ProductRowData } from "./types";

function Chips({ ids, known }: { ids: readonly string[]; known: ReadonlySet<string> }) {
  const shown = [...new Set(ids)].filter((id) => known.has(id));
  return shown.length ? <RulesLine ids={shown} /> : null;
}

function Item({ id, label, children, rules, known, after }: { id: string; label: string; children: React.ReactNode; rules?: readonly string[]; known: ReadonlySet<string>; after?: React.ReactNode }) {
  return (
    <div key={id} className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0 md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">{children}</span>
        {after}
        {rules && <Chips ids={rules} known={known} />}
      </dd>
    </div>
  );
}

export function BankProductRow({ p, known, wrapperName }: { p: ProductRowData; known: ReadonlySet<string>; wrapperName: string }) {
  const l = copy.labels;
  const taxWord = String(p.taxBucket.value).startsWith("unlinked") ? copy.tax.unlinked : String(p.taxBucket.value).startsWith("linked") ? copy.tax.linked : String(p.taxBucket.value);
  const months = typeof p.term.value === "number" ? p.term.value : null;
  return (
    <Card as="article" id={`product-${p.id}`} className="flex flex-col gap-3 scroll-mt-[112px] lg:scroll-mt-[88px] target:outline-2 target:outline-ring target:outline-offset-2">
      <header className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold max-w-measure">
          <bdi>{p.name}</bdi>
        </h3>
        {p.model && (
          <p className="text-sm text-muted-foreground">
            {copy.modelLine} <bdi dir="ltr" className="num-id">{p.model}</bdi>
          </p>
        )}
        {p.alsoCalled.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span>{copy.alsoCalled}</span>
            {p.alsoCalled.map((n) => (
              <Tag key={n}>
                <bdi>{n}</bdi>
              </Tag>
            ))}
          </p>
        )}
      </header>
      {p.stale && (
        <p className="flex items-start gap-1.5 text-sm text-caution-foreground">
          <IconAlert size={18} className="text-caution shrink-0 mt-0.5" />
          <span>
            {copy.card.stale.before}
            <bdi dir="ltr">{fmt.date(p.snapshot)}</bdi>
            {copy.card.stale.after}
          </span>
        </p>
      )}
      <dl className="flex flex-col">
          <Item id="type" label={l.type447} known={known} rules={["BANK-13"]}>
            <bdi>{p.type447}</bdi>
          </Item>
          <Item id="term" label={l.term} known={known} rules={p.term.rule_ids ?? []}>
            {p.currentAccount || months === null ? copy.term.none : <Num value={p.term} display={fmt.months(months)} />}
          </Item>
          <Item id="rateType" label={l.rateType} known={known}>
            {p.rateType === "variable" ? (
              <>
                {copy.rateType.variable} {p.anchor && <bdi>{p.anchor}</bdi>} {p.spread && <Num value={p.spread} />}
              </>
            ) : (
              copy.rateType.fixed
            )}
          </Item>
          <Item id="rate" label={l.rate} known={known} rules={p.rate.rule_ids ?? []}>
            <Num value={p.rate} size="cell" />
          </Item>
          <Item id="asOf" label={l.asOf} known={known}>
            <Num value={p.asOf} />
            {p.asOfAfterRead && <Tag tone="caution" icon={<IconAlert size={14} />}>{copy.asOfAfterRead}</Tag>}
          </Item>
          <Item id="linkage" label={l.linkage} known={known}>
            <Num value={p.linkageValue} display={copy.linkage[p.linkage]} />
          </Item>
          <Item id="tax" label={l.tax} known={known} rules={p.taxBucket.rule_ids ?? []}>
            <Num value={p.taxBucket} display={taxWord} />
          </Item>
          <Item id="amount" label={l.amount} known={known} rules={p.amountMin.rule_ids ?? []}>
            {typeof p.amountMin.value === "number" && p.amountMin.value > 0 ? (
              <>
                {copy.amount.from}
                <Num value={p.amountMin} />
                {p.amountMax && (
                  <>
                    {" "}
                    {copy.amount.to} <Num value={p.amountMax} />
                  </>
                )}
              </>
            ) : p.amountMax ? (
              <>
                {copy.amount.to} <Num value={p.amountMax} />
              </>
            ) : (
              copy.amount.noMin
            )}
          </Item>
          <Item
            id="break"
            label={l.breakTerms}
            known={known}
            rules={p.breakTerms.rules}
            after={
              p.breakTerms.text && (
                <Disclosure label={<span className="text-sm text-link">{copy.breakDisclosure}</span>} summaryClassName="min-h-11 justify-start gap-1">
                  <p className="text-sm bg-muted rounded-md p-3 max-w-measure" dir="auto">
                    {p.breakTerms.text}
                  </p>
                </Disclosure>
              )
            }
          >
            {copy.breakWord[p.breakTerms.penalty]}
          </Item>
          <Item id="exits" label={l.exits} known={known}>
            {p.exitPoints.exists && p.exitPoints.everyMonths !== null ? (
              <>
                {copy.exits.every} <bdi dir="ltr">{fmt.number(p.exitPoints.everyMonths)}</bdi> {copy.exits.months}
              </>
            ) : (
              copy.exits.none
            )}
          </Item>
          <Item id="renew" label={l.autoRenew} known={known}>
            {p.autoRenew.value ? (
              p.autoRenew.maxRenewals !== null ? (
                <>
                  {copy.autoRenewWord.upTo} <bdi dir="ltr">{fmt.number(p.autoRenew.maxRenewals)}</bdi> {copy.autoRenewWord.times}
                </>
              ) : (
                copy.autoRenewWord.yes
              )
            ) : (
              copy.autoRenewWord.no
            )}
          </Item>
      </dl>
      {p.currentAccount && p.rateNote && (
        <Disclosure label={<span className="text-sm text-link">{copy.currentConditions}</span>} summaryClassName="min-h-11 justify-start gap-1">
          <p className="text-sm bg-muted rounded-md p-3 max-w-measure whitespace-pre-wrap" dir="auto">
            {p.rateNote}
          </p>
        </Disclosure>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.notAnOffer} {known.has("BANK-13") && <RuleRef id="BANK-13" />}
      </p>
      <p className="flex flex-wrap gap-x-4">
        <Link to={`/guide/${p.wrapperId}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline">
          {copy.rowLinks.whatIs} {wrapperName}
          <IconDrillIn size={16} />
        </Link>
        <Link to={`/guide/${p.wrapperId}#check`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline">
          {copy.rowLinks.whatToCheck}
          <IconDrillIn size={16} />
        </Link>
      </p>
    </Card>
  );
}
