// The brokerage group card (design-system 8.7): a bank's or broker's tariff snapshot in one card, or its
// missing form. TASE buy and sell by channel, custody and FX as provenance numbers; the tariff's two dates;
// the stale line; minimums, protection, the notice rules, and the link to the provider workbench.
import { CircleDashed } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";
import type { AdvertisingEntry, FeesSnapshot } from "@finance-tool/schema";
import { groupPrices as groupWords, invest as investCopy, r4catalogue as copy, guideBlocks } from "../../../copy";
import { fmt } from "../../../lib/format";
import { groupPath, housePath, ownAccountPath } from "../../../lib/invest";
import { IconAlert, IconExternal } from "../../icons";
import { LeadTail, Num, NumAfter, RuleRef, RulesLine } from "../../provenance";
import { Card, ClaimList, Disclosure, DocLink, GroupPriceRows, LinkButton, Sentence, Tag, atPdfPage } from "../../kit";
import type { AvailabilityRow, InstitutionKind, TariffCardData, TariffLineRow } from "./types";

const baseName = (b: string) => (guideBlocks.fees as Record<string, { name: string }>)[b]?.name ?? b;
const classWord = (c: string) => (copy.instrumentClasses as Record<string, string>)[c] ?? null;

function lineLabel(l: TariffLineRow): string {
  const classes = l.classes.map(classWord).filter((x): x is string => !!x);
  return [baseName(l.base), classes.length ? classes.join(", ") : null].filter(Boolean).join(" · ");
}

/** Where a line's rate stands: the price list and its page, or another document by its name (D57 amended 2026-11-04). */
function WhereLink({ w }: { w: NonNullable<TariffLineRow["where"]> }) {
  const page = /\.pdf/i.test(w.url) && !w.url.includes("#") ? w.page : undefined;
  return (
    <DocLink href={atPdfPage(w.url, page)} className="text-xs">
      {w.tariff ? copy.card.whereTariff(page) : copy.card.whereOther(w.title, page)}
    </DocLink>
  );
}

/** A minimum of a custody or account fee is not "per trade"; one charged each month says so. */
const perMonth = (v: { unit: string }) => /per_month$/.test(v.unit);

function LineItem({ l }: { l: TariffLineRow }) {
  const bounds = l.base === "trade" ? copy.card.tradeBounds : copy.card.bounds;
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
              {bounds.min} <Num value={l.min} />
              {perMonth(l.min) && <> {copy.card.period.month}</>}
            </span>
          )}
          {l.max && (
            <span>
              {bounds.max} <Num value={l.max} />
              {perMonth(l.max) && <> {copy.card.period.month}</>}
            </span>
          )}
        </span>
      )}
      {l.spread && (
        <span className="text-sm text-muted-foreground">
          {l.spread === "not_limited" ? (
            copy.card.spreadNotLimited
          ) : (
            <>
              {copy.card.spreadUpTo} <Num value={l.spread} />
            </>
          )}
        </span>
      )}
      {l.where && <WhereLink w={l.where} />}
    </li>
  );
}

const classWords = (classes: string[]) => classes.map(classWord).filter((x): x is string => !!x).join(", ");

/** What can be bought at the house, as its own documents say, with the reason where they leave it open. */
function CanBuy({ rows }: { rows: AvailabilityRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="font-semibold">{copy.card.canBuy.title}</h4>
      <ul className="flex flex-col">
        {rows.map((a) => (
          <li key={a.classes.join()} className="flex flex-col gap-0.5 py-2 border-b border-border last:border-b-0 text-sm">
            <span className="flex flex-wrap items-center gap-2">
              <Tag tone={a.state === "yes" ? "positive" : a.state === "no" ? "blocked" : "caution"}>{copy.card.canBuy.state[a.state]}</Tag>
              <bdi>{classWords(a.classes)}</bdi>
            </span>
            {a.reason && <span className="text-muted-foreground max-w-measure">{a.reason}</span>}
            <WhereLink w={{ url: a.source.url, title: a.source.title, ...(a.source.page ? { page: a.source.page } : {}), tariff: false }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What the house's advertising says against its binding documents (D57): both sides with their sources. */
function Claims({ entries }: { entries: readonly AdvertisingEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="font-semibold">{copy.card.claims.title}</h4>
      <p className="text-sm text-muted-foreground max-w-measure">{copy.card.claims.lead}</p>
      <ClaimList entries={entries} />
    </section>
  );
}

/** Group prices and offers, beside the comparison and never in it (D43): the sub-rows with where each stands, or why there are none. */
function Groups({ groups, houseId, linked }: { groups: FeesSnapshot["groups"] | null; houseId: string; linked: readonly string[] }) {
  if (!groups) return null;
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="font-semibold">{copy.card.groupsTitle}</h4>
      {groups.state === "prices" ? (
        <>
          <p className="text-sm text-muted-foreground max-w-measure">{copy.card.groupsLead}</p>
          <GroupPriceRows entries={groups.entries} sources own={{ can: (key) => linked.includes(key), link: (key) => <Link to={groupPath(houseId, key)} className="text-link hover:underline inline-flex items-center min-h-target text-sm">{groupWords.ownAccount}</Link> }} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground max-w-measure">{groupWords.states[groups.state]}</p>
      )}
    </section>
  );
}

export function BrokerageGroupCard({ id, tariff, kind, className, advertising = [], groups = null, linked = [] }: { id: string; tariff: TariffCardData | null; kind: InstitutionKind; className?: string; /** What its advertising says against its documents (D57). */ advertising?: readonly AdvertisingEntry[]; /** Its group prices and offers (D43). */ groups?: FeesSnapshot["groups"] | null; /** The groups the index page offers as radios (`group:<n>`): each links there with it picked, the others have no link (D43 amended (5)). */ linked?: readonly string[] }) {
  const h = useId();
  const compareHref = housePath(id);
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
        {/* a document's title may hold an address with no space in it: it breaks anywhere rather than widen the page */}
        <p className="text-sm max-w-measure [overflow-wrap:anywhere]">
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
        {tariff.priceFor && (
          <p className="text-sm">
            {copy.card.priceFor}: <bdi className="font-medium">{tariff.priceFor}</bdi>
          </p>
        )}
        <section className="flex flex-col gap-1.5">
          <h4 className="font-semibold">{copy.card.linesTitle}</h4>
          <p className="text-sm text-muted-foreground">
            <bdi dir="ltr">{fmt.number(tariff.lineCount)}</bdi> {copy.card.linesMid} {bases.join(", ")}
          </p>
          {tariff.lines.length > 0 && <ul className="flex flex-col">{tariff.lines.map((l) => <LineItem key={l.id} l={l} />)}</ul>}
        </section>
        <CanBuy rows={tariff.availability} />
        <Claims entries={advertising} />
        <Groups groups={groups} houseId={id} linked={linked} />
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <LinkButton to={compareHref} variant="primary" className="self-start">
            {copy.card.compare}
          </LinkButton>
          {/* the index page opens with the panel on this house's price list (2026-11-04) */}
          <LinkButton to={ownAccountPath(id)} variant="secondary" className="self-start">
            {investCopy.ownAccount.open(tariff.providerName)}
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}
