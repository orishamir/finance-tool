// A bank's or broker's securities account (design-system 8.7), as the company page shows its other products (founder, 2026-11-04:
// "there should be some standard way to present it"): the price list as the account's name and quiet line, then parts with a heading
// each: the fees as the table of products (one row per fee line, one under the next on a phone), what can be bought there, the
// advertising against the documents, the group prices, and the minimum and the supervisor as the kit's fact cards; the two links last.
// Its missing form is one card: the reason, the price list's page, the comparison.
import { CircleDashed } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";
import type { AdvertisingEntry, FeesSnapshot } from "@finance-tool/schema";
import { groupPrices as groupWords, invest as investCopy, r4catalogue as copy, guideBlocks } from "../../../copy";
import { fmt } from "../../../lib/format";
import { groupPath, housePath, ownAccountPath } from "../../../lib/invest";
import { IconAlert, IconExternal } from "../../icons";
import { LeadTail, Num, NumAfter, RuleRef, RulesLine } from "../../provenance";
import { Card, ClaimList, Disclosure, DocLink, GroupPriceRows, KeyValueList, LinkButton, ProductPhoneRow, ProductTable, ProductFigures, Section, Sentence, Tag, atPdfPage, cx, type KeyValueItem, type ProductColumn } from "../../kit";
import type { SiteValue } from "../../../lib/value";
import type { AvailabilityRow, InstitutionKind, TariffCardData, TariffLineRow } from "./types";

const baseName = (b: string) => (guideBlocks.fees as Record<string, { name: string }>)[b]?.name ?? b;
const classWord = (c: string) => (copy.instrumentClasses as Record<string, string>)[c] ?? null;

/** A bound's word after its amount: charged on each trade, or each month; a bound of the fee's own period has none, and an unknown one ("לא ידוע") none either. */
const boundWord = (v: SiteValue) => (v.value === null ? null : /per_trade$/.test(v.unit) ? copy.card.perTrade : /per_month$/.test(v.unit) ? copy.card.period.month : null);

/** Where a line's rate stands: the price list and its page, or another document by its name (D57 amended 2026-11-04). */
function WhereLink({ w }: { w: NonNullable<TariffLineRow["where"]> }) {
  const page = /\.pdf/i.test(w.url) && !w.url.includes("#") ? w.page : undefined;
  return (
    <DocLink href={atPdfPage(w.url, page)} className="text-xs">
      {w.tariff ? copy.card.whereTariff(page) : copy.card.whereOther(w.title, page)}
    </DocLink>
  );
}

/** An amount and its quiet word after it ("0.15% לרבעון", "27.00 ₪ לפעולה"): the kit's figure-and-word, one of it. */
const figure = (id: string, value: SiteValue, word: string | null, inline?: boolean) => <ProductFigures inline={inline} items={[{ id, figure: <Num value={value} size="cell" />, word }]} />;

/** A percentage fee charges no bound its documents leave out (method: min and max apply only where printed); a flat fee has none to print. */
const isPercent = (l: TariffLineRow) => /^pct_/.test(l.rate.unit);

function Bound({ l, side }: { l: TariffLineRow; side: "min" | "max" }) {
  const v = l[side];
  if (v) return figure(side, v, boundWord(v));
  return <span className="text-sm text-muted-foreground">{isPercent(l) ? copy.card.noBound[side] : "—"}</span>;
}

/** The fee's name with its channel as a label beside it (a kind is a label, design-system 11), then what it is charged on, the plan the line belongs to, the conversion spread, and where it stands. */
function FeeName({ l, phone }: { l: TariffLineRow; /** On a phone the spread and the source come after the price, under it. */ phone?: boolean }) {
  const classes = classWords(l.classes);
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium">
          <bdi>{baseName(l.base)}</bdi>
        </span>
        {l.channel && <Tag>{copy.card.channel[l.channel]}</Tag>}
      </span>
      {classes && (
        <span className="text-sm text-muted-foreground">
          <bdi>{classes}</bdi>
        </span>
      )}
      {/* the plan's own name tells two lines of one fee apart (a fixed and a tiered price) */}
      {l.band && (
        <span className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          {/* a Hebrew line even where the plan's name opens in English ("IBKR Pro - Fixed: בורסת תל אביב") */}
          <bdi dir="rtl">{l.band}</bdi>
        </span>
      )}
      {!phone && <Spread l={l} />}
      {!phone && l.where && <WhereLink w={l.where} />}
    </span>
  );
}

/** A conversion's spread: up to its printed ceiling, or not limited by the documents (D56: never zero). */
function Spread({ l }: { l: TariffLineRow }) {
  if (!l.spread) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {l.spread === "not_limited" ? (
        copy.card.spreadNotLimited
      ) : (
        <>
          {copy.card.spreadUpTo} <Num value={l.spread} />
        </>
      )}
    </span>
  );
}

/** The price list's fee lines as the site's table of products (design-system 11): one row per line on a computer, one under the next on a phone. */
function FeeTable({ lines }: { lines: TariffLineRow[] }) {
  const columns: ProductColumn[] = [
    { id: "fee", head: copy.card.cols.fee },
    { id: "price", head: copy.card.cols.price, width: 9 },
    { id: "min", head: copy.card.bounds.min, width: 10 },
    { id: "max", head: copy.card.bounds.max, width: 11 },
  ];
  return (
    <ProductTable
      columns={columns}
      groups={[
        {
          key: "lines",
          rows: lines.map((l) => ({
            key: l.id,
            cells: [<FeeName l={l} />, figure("price", l.rate, l.period ? copy.card.period[l.period] : null), <Bound l={l} side="min" />, <Bound l={l} side="max" />],
            phone: (
              <ProductPhoneRow stacked>
                <FeeName l={l} phone />
                {/* the price on its line, the two bounds on the next: each keeps its words whole, and no bound drops alone */}
                {figure("price", l.rate, l.period ? copy.card.period[l.period] : null, true)}
                {(l.min || l.max || isPercent(l)) && (
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <PhoneBound l={l} side="min" />
                    <PhoneBound l={l} side="max" />
                  </span>
                )}
                <Spread l={l} />
                {l.where && <WhereLink w={l.where} />}
              </ProductPhoneRow>
            ),
          })),
        },
      ]}
    />
  );
}

/** A bound on a phone, where no head names it: "מינימום 27.00 ₪ לפעולה"; none on a flat fee. */
function PhoneBound({ l, side }: { l: TariffLineRow; side: "min" | "max" }) {
  const v = l[side];
  if (!v) return isPercent(l) ? <span className="text-muted-foreground">{copy.card.noBound[side]}</span> : null;
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground">{copy.card.bounds[side]}</span>
      {figure(side, v, boundWord(v), true)}
    </span>
  );
}

const classWords = (classes: string[]) => classes.map(classWord).filter((x): x is string => !!x).join(", ");

/** What can be bought at the house, as its own documents say, with the reason where they leave it open: one row per kind, in a card. */
function CanBuy({ rows }: { rows: AvailabilityRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Section level="card" title={copy.card.canBuy.title}>
      <Card as="ul" pad="none" className="flex flex-col divide-y divide-border">
        {rows.map((a) => (
          <li key={a.classes.join()} className="flex flex-col items-start gap-1 px-4 pt-3 pb-1 md:px-5">
            <span className="flex flex-wrap items-center gap-2">
              <Tag tone={a.state === "yes" ? "positive" : a.state === "no" ? "blocked" : "caution"}>{copy.card.canBuy.state[a.state]}</Tag>
              <bdi className="font-medium">{classWords(a.classes)}</bdi>
            </span>
            {a.reason && <span className="text-sm text-muted-foreground max-w-measure">{a.reason}</span>}
            <WhereLink w={{ url: a.source.url, title: a.source.title, ...(a.source.page ? { page: a.source.page } : {}), tariff: false }} />
          </li>
        ))}
      </Card>
    </Section>
  );
}

/** What the house's advertising says against its binding documents (D57): both sides with their sources. */
function Claims({ entries }: { entries: readonly AdvertisingEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <Section level="card" title={copy.card.claims.title} lead={copy.card.claims.lead}>
      <Card pad="snug">
        <ClaimList entries={entries} />
      </Card>
    </Section>
  );
}

/** Group prices and offers, beside the comparison and never in it (D43): the sub-rows with where each stands, or why there are none. */
function Groups({ groups, houseId, linked }: { groups: FeesSnapshot["groups"] | null; houseId: string; linked: readonly string[] }) {
  if (!groups) return null;
  if (groups.state !== "prices") return <Section level="card" title={copy.card.groupsTitle} lead={groupWords.states[groups.state]}>{null}</Section>;
  return (
    <Section level="card" title={copy.card.groupsTitle} lead={copy.card.groupsLead}>
      <Card pad="snug">
        <GroupPriceRows entries={groups.entries} sources own={{ can: (key) => linked.includes(key), link: (key) => <Link to={groupPath(houseId, key)} className="text-link hover:underline inline-flex items-center min-h-target text-sm">{groupWords.ownAccount}</Link> }} />
      </Card>
    </Section>
  );
}

/** The minimum to open an account, and who supervises the house: what protects the money and the notice of a change of fees under it. */
function Facts({ tariff }: { tariff: TariffCardData }) {
  const regulator = tariff.regulator === "foreign" ? (tariff.foreignRegulator ?? "") : copy.regulators[tariff.regulator];
  const items: KeyValueItem[] = [
    {
      id: "minimum",
      label: copy.card.minimum,
      value: tariff.minimum ? <Num value={tariff.minimum} /> : <span className="text-muted-foreground">{copy.card.minimumNone}</span>,
    },
    {
      id: "regulator",
      label: copy.card.regulator,
      value: <bdi>{regulator}</bdi>,
      tag: tariff.tase ? <Tag>{copy.card.tase}</Tag> : undefined,
      footer: (
        <div className="flex flex-col gap-1 text-sm">
          {tariff.notice.length > 0 && <RulesLine ids={tariff.notice} lead={<span>{copy.card.notice}</span>} />}
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
      ),
    },
  ];
  return (
    <Section level="card" title={copy.card.factsTitle}>
      <KeyValueList items={items} />
    </Section>
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
          <LinkButton to={compareHref} variant="secondary">
            {kind === "bank" ? copy.missingLinks.compare : copy.missingLinks.compareBroker}
          </LinkButton>
        </div>
      </Card>
    );
  }
  const bases = tariff.bases.map(baseName);
  return (
    <div className={cx("flex flex-col gap-8", className)}>
      {/* the account's price list first, as a product's name and its quiet line: the document (its title is the link), its dates, who pays these prices */}
      <div className="flex flex-col gap-1.5">
        {/* a document's title may hold an address with no space in it: it breaks anywhere rather than widen the page */}
        <DocLink href={tariff.url} className="self-start font-medium max-w-measure">
          {tariff.title} <span dir="ltr" className="uppercase text-muted-foreground font-normal">({tariff.format})</span>
        </DocLink>
        <Sentence size="sm" tone="muted">
          {tariff.published ? <NumAfter lead={copy.card.tariffFrom} value={tariff.published} /> : <span className="text-caution-foreground">{copy.card.noPublishedDate}</span>}
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
        {tariff.priceFor && (
          <p className="text-sm">
            <span className="text-muted-foreground">{copy.card.priceFor}:</span> <bdi className="font-medium">{tariff.priceFor}</bdi>
          </p>
        )}
      </div>
      {tariff.lines.length > 0 && (
        <Section level="card"
          title={copy.card.linesTitle}
          lead={
            <>
              <bdi dir="ltr">{fmt.number(tariff.lineCount)}</bdi> {copy.card.linesMid} {bases.join(", ")}
            </>
          }
        >
          <FeeTable lines={tariff.lines} />
        </Section>
      )}
      <CanBuy rows={tariff.availability} />
      <Claims entries={advertising} />
      <Groups groups={groups} houseId={id} linked={linked} />
      <Facts tariff={tariff} />
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
  );
}
