// A bank's or broker's securities account (design-system 8.7), as the company page shows its other products:
// the price list as the account's name and quiet line, then parts with a heading
// each: every fee of the price list as the table of products, grouped by kind (one row per line, one under the next on a phone), what can be bought there, the
// advertising against the documents, the group prices, and the minimum and the supervisor as the kit's fact cards; the two links last.
// Its missing form is one card: the reason, the price list's page, the comparison.
import { CircleDashed } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";
import type { AdvertisingEntry, FeesSnapshot } from "@finance-tool/schema";
import { groupPrices as groupWords, invest as investCopy, r4catalogue as copy, guideBlocks } from "../../../copy";

import { groupPath, housePath, ownAccountPath } from "../../../lib/invest";
import { IconAlert, IconExternal } from "../../icons";
import { Num, NumAfter, RuleRef, RulesChip, RulesLine } from "../../provenance";
import { Card, ClaimList, Disclosure, DocLink, GroupPriceRows, TariffDate, KeyValueList, LinkButton, ProductPhoneRow, ProductTable, ProductFigures, Section, Sentence, Tag, cx, gershayim, type KeyValueItem, type ProductColumn, When } from "../../kit";
import type { SiteValue } from "../../../lib/value";
import { distributionRuleIds, type AvailabilityRow, type InstitutionKind, type TariffCardData, type TariffLineRow } from "./types";
import { isPdfUrl, sourceHref, type CitedPlace } from "../../../lib/sources";
import { accountSectionIds, feeKindName, feeKindOf, feeKinds } from "./sections";

/** What a kind of fee is charged on, in the guides' words ("מכל המרה של שקלים למטבע זר או חזרה"). */
const baseDesc = (b: string) => (guideBlocks.fees as Record<string, { base?: string }>)[b]?.base ?? null;
const classWord = (c: string) => (copy.instrumentClasses as Record<string, string>)[c] ?? null;
const classWords = (classes: string[]) => classes.map(classWord).filter((x): x is string => !!x).join(", ");

/** A bound's word after its amount: a trade's bounds are each trade's, a monthly one says so; an unknown bound ("לא ידוע") has none. */
const boundWord = (l: TariffLineRow, v: SiteValue) => (v.value === null ? null : l.base === "trade" || /per_trade$/.test(v.unit) ? copy.card.perTrade : /per_month$/.test(v.unit) ? copy.card.period.month : null);
/** The price's word: its period, or "להעברה" for a fee per transfer, "למניה" for a price per share. */
const priceWord = (l: TariffLineRow) => (l.period ? copy.card.period[l.period] : /per_transfer$/.test(l.rate.unit) ? copy.card.perTransfer : /per_share$/.test(l.rate.unit) ? copy.card.perShare : null);

/** The page of a PDF the line stands on; a web page has none. */
const pdfPage = (w: NonNullable<TariffLineRow["where"]>) => (isPdfUrl(w.url) && !w.url.includes("#") ? w.page : undefined);

/** Where a fact stands, in full: the price list and its page, or another document by its name (D57). */
function WhereLink({ w }: { w: NonNullable<TariffLineRow["where"]> }) {
  const page = pdfPage(w);
  return (
    <DocLink href={sourceHref(w)} className="text-xs">
      {w.tariff ? copy.card.whereTariff(page) : copy.card.whereOther(gershayim(w.title), page)}
    </DocLink>
  );
}

/**
 * The same in the table's own column, short: "עמוד 30 ↗" (the page is the link, as a fund's number is). A line from a document
 * other than the price list says so under the link, and the link opens that document; its long title stays out of the row.
 */
function WhereCell({ w }: { w: TariffLineRow["where"] }) {
  if (!w) return <span className="text-sm text-muted-foreground">—</span>;
  const page = pdfPage(w);
  const link = (
    <DocLink href={sourceHref(w)} className="text-sm -my-2.5">
      {page ? copy.card.page(page) : w.tariff ? copy.card.inTariff : copy.card.otherDoc}
    </DocLink>
  );
  if (w.tariff || !page) return link;
  return (
    <span className="flex flex-col items-start">
      {link}
      <span className="text-xs text-muted-foreground whitespace-nowrap">{copy.card.otherDoc}</span>
    </span>
  );
}

/** An amount and its quiet word after it ("0.15% לרבעון", "27.00 ₪ לפעולה"): the kit's figure-and-word, one of it. */
const figure = (id: string, value: SiteValue, word: string | null, inline?: boolean) => <ProductFigures inline={inline} items={[{ id, figure: <Num value={value} size="cell" />, word }]} />;

/** The kinds whose bounds matter: a percentage of a trade, a holding or a conversion with no printed bound charges none, and says so; the other kinds have none to print. */
const bounded = (l: TariffLineRow) => /^pct_/.test(l.rate.unit) && (l.base === "trade" || l.base === "custody" || l.base === "fx");

function Bound({ l, side }: { l: TariffLineRow; side: "min" | "max" }) {
  const v = l[side];
  if (v) return figure(side, v, boundWord(l, v));
  return <span className="text-sm text-muted-foreground">{bounded(l) ? copy.card.noBound[side] : "—"}</span>;
}

/** A bound on a phone, where no head names it: "מינימום 27.00 ₪ לפעולה"; nothing where the kind has none. */
function PhoneBound({ l, side }: { l: TariffLineRow; side: "min" | "max" }) {
  const v = l[side];
  if (!v) return bounded(l) ? <span className="text-muted-foreground">{copy.card.noBound[side]}</span> : null;
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground">{copy.card.bounds[side]}</span>
      {figure(side, v, boundWord(l, v), true)}
    </span>
  );
}

/** A fee on the account itself (a monthly fee, a transfer out) is charged on no kind of security: these words say on what. */
const onAccount = copy.card.onAccount as Record<string, string>;

/** What the line is charged on: the kinds of securities, a conversion between two foreign currencies, or the account itself. */
function coversText(l: TariffLineRow): string {
  if (l.fxToFx) return copy.card.fxToFx;
  if (onAccount[l.base]) return onAccount[l.base]!;
  return classWords(l.classes) || (baseDesc(l.base) ?? "");
}

/** The row's first cell: what it is charged on with its channel as a label (a kind is a label, design-system 11), the plan it belongs to, and the conversion spread. */
function Covers({ l, phone }: { l: TariffLineRow; /** On a phone the spread comes after the price. */ phone?: boolean }) {
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <bdi>{coversText(l)}</bdi>
        {l.channel && <Tag>{copy.card.channel[l.channel]}</Tag>}
      </span>
      {/* the plan's own name tells two lines of one fee apart (a fixed and a tiered price, a standing order, a redemption) */}
      {l.band && (
        <span className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          {/* a Hebrew line even where the plan's name opens in English ("IBKR Pro - Fixed: בורסת תל אביב") */}
          <bdi dir="rtl">{l.band}</bdi>
        </span>
      )}
      {!phone && <Spread l={l} />}
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

/**
 * Every line of the price list as the site's table of products,
 * grouped by kind under a strip with the fee's name, so a row says only what sets it apart: what it is charged on, the channel, the plan.
 * Where each line stands is its own short column ("עמוד 30 ↗"). On a phone the strips stay, each line is one row, and the link ends the price's line.
 */
function FeeTable({ lines, kind }: { lines: TariffLineRow[]; kind: InstitutionKind }) {
  const columns: ProductColumn[] = [
    { id: "covers", head: copy.card.cols.covers },
    { id: "price", head: copy.card.cols.price, width: 8.5 },
    { id: "min", head: copy.card.bounds.min, width: 9.5 },
    { id: "max", head: copy.card.bounds.max, width: 10.5 },
    { id: "where", head: copy.card.cols.where, width: 7 },
  ];
  const kinds = feeKinds(lines);
  return (
    <ProductTable
      columns={columns}
      groups={kinds.map((k) => ({
        key: k,
        heading:
          k === "distribution"
            ? {
                title: copy.card.distribution.name,
                // who pays it, from the regulations (MF-24; MF-26 says what a bank may charge without an agreement): not a charge the account's price list adds
                line: (
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                    {copy.card.distribution.who(kind === "bank" ? copy.card.distribution.toBank : copy.card.distribution.toBroker)}
                    <RulesChip ids={distributionRuleIds(kind)} name={copy.card.distribution.name} />
                  </span>
                ),
              }
            : { title: feeKindName(k) },
        rows: lines
          .filter((l) => feeKindOf(l) === k)
          .map((l) => ({
            key: l.id,
            cells: [<Covers l={l} />, figure("price", l.rate, priceWord(l)), <Bound l={l} side="min" />, <Bound l={l} side="max" />, <WhereCell w={l.where} />],
            phone: (
              <ProductPhoneRow stacked>
                <Covers l={l} phone />
                {/* the price with where it stands at the line's end, as the table's column ("עמוד 30 ↗"); the two bounds on the next line: each keeps its words whole, and no bound drops alone */}
                <span className="flex items-center justify-between gap-3">
                  {figure("price", l.rate, priceWord(l), true)}
                  {l.where && <WhereCell w={l.where} />}
                </span>
                {(l.min || l.max || bounded(l)) && (
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <PhoneBound l={l} side="min" />
                    <PhoneBound l={l} side="max" />
                  </span>
                )}
                <Spread l={l} />
              </ProductPhoneRow>
            ),
          })),
      }))}
    />
  );
}

/** What can be bought at the house, as its own documents say, with the reason where they leave it open: one row per kind, in a card. */
function CanBuy({ rows }: { rows: AvailabilityRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Section level="card" id={accountSectionIds.canBuy} title={copy.card.canBuy.title}>
      <Card as="ul" pad="none" className="flex flex-col divide-y divide-border">
        {rows.map((a) => (
          <li key={a.classes.join()} className="flex flex-col items-start gap-1 px-4 pt-3 pb-1 md:px-5">
            <span className="flex flex-wrap items-center gap-2">
              <Tag tone={a.state === "yes" ? "positive" : a.state === "no" ? "blocked" : "caution"}>{copy.card.canBuy.state[a.state]}</Tag>
              <bdi className="font-medium">{classWords(a.classes)}</bdi>
            </span>
            {a.reason && <span className="text-sm text-muted-foreground max-w-measure">{a.reason}</span>}
            <WhereLink w={{ url: a.source.url, title: a.source.title, ...(a.source.page ? { page: a.source.page } : {}), ...((a.source as CitedPlace).fragment ? { fragment: (a.source as CitedPlace).fragment } : {}), tariff: false }} />
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
    <Section level="card" id={accountSectionIds.claims} title={copy.card.claims.title} lead={copy.card.claims.lead}>
      <Card pad="snug">
        <ClaimList entries={entries} />
      </Card>
    </Section>
  );
}

/** Group prices and offers, beside the comparison and never in it (D43): the sub-rows with where each stands, or why there are none. */
function Groups({ groups, houseId, linked }: { groups: FeesSnapshot["groups"] | null; houseId: string; linked: readonly string[] }) {
  if (!groups) return null;
  if (groups.state !== "prices") return <Section level="card" id={accountSectionIds.groups} title={copy.card.groupsTitle} lead={groupWords.states[groups.state]}>{null}</Section>;
  return (
    <Section level="card" id={accountSectionIds.groups} title={copy.card.groupsTitle} lead={copy.card.groupsLead}>
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
                    <bdi className="max-w-measure">{gershayim(r.title)}</bdi>
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
    <Section level="card" id={accountSectionIds.facts} title={copy.card.factsTitle}>
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
            <a href={sourceHref(tariff)} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-target text-sm">
              <span>
                {copy.missingLinks.tariffPageBefore}
                <bdi>{gershayim(tariff.providerName)}</bdi>
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
  return (
    <div className={cx("flex flex-col gap-8", className)}>
      {/* the account's price list first, as a product's name and its quiet line: the document (its title is the link), its dates, who pays these prices */}
      <div className="flex flex-col gap-1.5">
        {/* a document's title may hold an address with no space in it: it breaks anywhere rather than widen the page */}
        <DocLink href={sourceHref(tariff)} className="self-start font-medium max-w-measure">
          {gershayim(tariff.title)} <span dir="ltr" className="uppercase text-muted-foreground font-normal">({tariff.format})</span>
        </DocLink>
        <Sentence size="sm" tone="muted">
          <TariffDate dated={tariff.dated} checked={false} date={(lead) => <NumAfter lead={lead} value={tariff.published!} />} />
          <NumAfter lead={copy.card.collectedAt} value={tariff.snapshot} />
        </Sentence>
        {tariff.stale && (
          <p className="flex items-start gap-1.5 text-sm text-caution-foreground">
            <IconAlert size={18} className="text-caution shrink-0 mt-0.5" />
            <span>
              <When iso={String(tariff.snapshot.value)} lead={copy.card.stale.before} />
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
        <Section level="card" id={accountSectionIds.fees} title={copy.card.linesTitle}>
          <FeeTable lines={tariff.lines} kind={kind} />
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
        {/* the index page opens with the panel on this house's price list */}
        <LinkButton to={ownAccountPath(id)} variant="secondary" className="self-start">
          {investCopy.ownAccount.open(gershayim(tariff.providerName))}
        </LinkButton>
      </div>
    </div>
  );
}
