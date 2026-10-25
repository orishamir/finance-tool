// The brokerage group card (design-system 8.7): a bank's or broker's tariff snapshot in one card, or its
// missing form. TASE buy and sell by channel, custody and FX as provenance numbers; the tariff's two dates;
// the stale line; minimums, protection, the notice rules, and the link to the provider workbench.
import { CircleDashed } from "lucide-react";
import { useId } from "react";
import { r4catalogue as copy, guideBlocks } from "../../../copy";
import { fmt } from "../../../lib/format";
import { IconAlert, IconExternal } from "../../icons";
import { LeadTail, Num, NumAfter, RuleRef, RulesLine } from "../../provenance";
import { Card, Disclosure, LinkButton, Sentence, Tag } from "../../kit";
import type { InstitutionKind, TariffCardData, TariffLineRow } from "./types";

const baseName = (b: string) => (guideBlocks.fees as Record<string, { name: string }>)[b]?.name ?? b;
const classWord = (c: string) => (copy.instrumentClasses as Record<string, string>)[c] ?? null;

function lineLabel(l: TariffLineRow): string {
  const classes = l.classes.map(classWord).filter((x): x is string => !!x);
  return [baseName(l.base), classes.length ? classes.join(", ") : null].filter(Boolean).join(" · ");
}

function LineItem({ l }: { l: TariffLineRow }) {
  return (
    <li className="flex flex-col gap-0.5 py-2.5 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">
        <bdi>{lineLabel(l)}</bdi>
        {l.channel && <> · {copy.card.channel[l.channel]}</>}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2">
        <Num value={l.rate} size="cell" />
        {l.period && <span className="text-sm text-muted-foreground">{copy.card.period[l.period]}</span>}
      </span>
      {(l.min || l.max) && (
        <span className="text-sm text-muted-foreground flex flex-wrap gap-x-3">
          {l.min && (
            <span>
              {copy.card.tradeBounds.min} <Num value={l.min} />
            </span>
          )}
          {l.max && (
            <span>
              {copy.card.tradeBounds.max} <Num value={l.max} />
            </span>
          )}
        </span>
      )}
    </li>
  );
}

export function BrokerageGroupCard({ id, tariff, kind, className }: { id: string; tariff: TariffCardData | null; kind: InstitutionKind; className?: string }) {
  const h = useId();
  const compareHref = `/workbench/providers/brokerage-account?vs=${id}`;
  if (!tariff || tariff.missing) {
    return (
      <Card as="section" aria-labelledby={h} className={className}>
        <div className="flex flex-col gap-3">
          <h3 id={h} className="text-lg font-semibold flex items-center gap-2">
            <CircleDashed size={20} strokeWidth={1.75} aria-hidden="true" className="text-caution shrink-0" />
            {copy.missingTariff}
          </h3>
          {tariff?.reason && (
            <Disclosure label={<span className="text-sm text-link">{copy.recordedReason}</span>} summaryClassName="min-h-11 justify-start gap-1">
              <p className="text-xs bg-muted rounded-md p-3 font-mono whitespace-pre-wrap break-words" dir="ltr">
                {tariff.reason}
              </p>
            </Disclosure>
          )}
          {tariff && (
            <a href={tariff.url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-target text-sm">
              <span>
                {copy.missingLinks.tariffPageBefore}
                <bdi>{tariff.providerName}</bdi>
              </span>
              <IconExternal size={16} />
            </a>
          )}
          <LinkButton to={compareHref} variant="secondary" className="h-auto min-h-field py-2 text-center">
            {kind === "bank" ? copy.missingLinks.compare : copy.missingLinks.compareBroker}
          </LinkButton>
        </div>
      </Card>
    );
  }
  const regulator = tariff.regulator === "foreign" ? (tariff.foreignRegulator ?? "") : copy.regulators[tariff.regulator];
  const bases = tariff.bases.map(baseName);
  return (
    <Card as="section" aria-labelledby={h} className={className}>
      <div className="flex flex-col gap-3.5">
        <h3 id={h} className="text-lg font-semibold">
          {copy.card.title}
        </h3>
        <p className="text-sm max-w-measure">
          <bdi>{tariff.title}</bdi>
        </p>
        <Sentence size="sm">
          {tariff.published ? (
            <>
              <NumAfter lead={copy.card.tariffFrom} value={tariff.published} />
            </>
          ) : (
            <span className="text-caution-foreground">{copy.card.noPublishedDate}</span>
          )}
          <NumAfter lead={copy.card.collectedAt} value={tariff.snapshot} />
        </Sentence>
        {tariff.stale && (
          <p className="flex items-start gap-1.5 text-sm text-caution-foreground">
            <IconAlert size={18} className="text-caution shrink-0 mt-0.5" />
            <span>
              <LeadTail lead={copy.card.stale.before}>
                <bdi dir="ltr">{fmt.date(String(tariff.snapshot.value))}</bdi>
              </LeadTail>
              {copy.card.stale.after}
            </span>
          </p>
        )}
        <p className="text-sm">
          <a href={tariff.url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-target">
            <span>
              {copy.card.link} <bdi dir="ltr" className="uppercase">({tariff.format})</bdi>
            </span>
            <IconExternal size={16} />
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          <bdi dir="ltr">{fmt.number(tariff.lineCount)}</bdi> {copy.card.linesMid} {bases.join(", ")}
        </p>
        {tariff.lines.length > 0 && <ul className="flex flex-col">{tariff.lines.map((l) => <LineItem key={l.id} l={l} />)}</ul>}
        <Sentence size="sm">
          {tariff.minimum ? (
            <>
              {copy.card.minimum} <Num value={tariff.minimum} />
            </>
          ) : (
            <span className="text-muted-foreground">
              {copy.card.minimum.replace(/:$/, "")}: {copy.card.minimumNone}
            </span>
          )}
        </Sentence>
        <div className="flex flex-col gap-1.5 text-sm">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {copy.card.protection} <bdi>{regulator}</bdi>
            </span>
            {tariff.tase && <Tag>{copy.card.tase}</Tag>}
          </p>
          {tariff.protection.length > 0 && (
            <Disclosure label={<span className="text-link">{copy.card.protectionDisclosure}</span>} summaryClassName="min-h-11 justify-start gap-1">
              <ul className="flex flex-col gap-2 pt-1">
                {tariff.protection.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <bdi className="max-w-measure">{r.title}</bdi>
                    <RuleRef id={r.id} />
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}
        </div>
        {tariff.notice.length > 0 && <RulesLine ids={tariff.notice} lead={<span>{copy.card.notice}</span>} />}
        <LinkButton to={compareHref} variant="primary" className="self-start">
          {copy.card.compare}
        </LinkButton>
      </div>
    </Card>
  );
}
