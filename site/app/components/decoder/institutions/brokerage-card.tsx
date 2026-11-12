// A bank's or broker's securities account (design-system 8.7), as the company page shows its other products:
// the price list as the account's name and quiet line, then parts with a heading
// each: every fee of the price list as the table of products, grouped by kind (one row per line, one under the next on a phone), what can be bought there, the
// advertising against the documents, the group prices, and the minimum and the supervisor as the kit's fact cards; the product's document
// entries and the two links last (the designer's mock, 2026-11-10).
// Its missing form is one card: the reason, the price list's page, the comparison.
import { CircleDashed } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import type { AdvertisingEntry, FeesSnapshot } from "@finance-tool/schema";
import { groupPrices as groupWords, invest as investCopy, r4catalogue as copy, guideBlocks } from "../../../copy";

import { groupPath, housePath, ownAccountPath } from "../../../lib/site-paths";
import { IconAlert } from "../../icons";
import { Num, NumAfter, RuleRef, RulesChip, RulesLine, Term } from "../../provenance";
import { Card, ClaimList, DocLink, GoLink, GroupPriceRows, LeftOutLine, MixedName, RowList, TariffDate, KeyValueList, LinkButton, LongestCase, ProductPhoneRow, ProductTable, ProductFigures, Section, SegmentedControl, Sentence, Tag, TextLink, cx, gershayim, type KeyValueItem, type ProductColumn, When } from "../../kit";
import type { SiteValue } from "../../../lib/value";
import { distributionRuleIds, type AvailabilityRow, type InstitutionKind, type TariffCardData, type TariffLineRow } from "./types";
import { isPdfUrl, withoutCodes, type CitedPlace } from "../../../lib/sources";
import { wholeSum } from "../../../lib/format";
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
    <DocLink source={w} className="text-xs">
      {w.tariff ? copy.card.whereTariff(page) : copy.card.whereOther(gershayim(withoutCodes(w.title)), page)}
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
    <DocLink source={w} className="text-sm -my-2.5">
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

/** A flat price for a small conversion or order (F-12, F-13), its amount first as every price's: "3.30 $ להמרה של עד 99 $"; nothing where the line has none. */
function FlatFigure({ l, inline }: { l: TariffLineRow; inline?: boolean }) {
  if (!l.flat) return null;
  const word = (
    <>
      {copy.card.flatUpTo[l.base === "fx" ? "fx" : "trade"]} <Num value={l.flat.upTo} display={wholeSum(l.flat.upTo.unit)} />
    </>
  );
  return <ProductFigures inline={inline} items={[{ id: "flat", figure: <Num value={l.flat.amount} size="cell" />, word }]} />;
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
function Covers({ l, phone, noChannel }: { l: TariffLineRow; /** On a phone the spread comes after the price. */ phone?: boolean; /** The line's price is the same in every channel: no channel's name. */ noChannel?: boolean }) {
  return (
    <span className="flex flex-col items-start gap-0.5">
      <bdi>{gershayim(coversText(l))}</bdi>
      {/* one quiet line under the name (the designer's mock): the channel, the plan's own name (it tells two lines of one fee apart: a fixed and
          a tiered price, a standing order, a redemption), and the conversion spread */}
      {((l.channel && !noChannel) || l.band || (!phone && l.spread)) && (
        <span className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
          {[
            l.channel && !noChannel ? <span key="ch">{copy.card.channel[l.channel]}</span> : null,
            // a Hebrew line even where the plan's name opens in English ("IBKR Pro - Fixed: בורסת תל אביב")
            l.band ? <bdi key="band" dir="rtl">{gershayim(l.band)}</bdi> : null,
            !phone && l.spread ? <Spread key="spread" l={l} /> : null,
          ]
            .filter(Boolean)
            .flatMap((x, i) => (i > 0 ? [" · ", x] : [x]))}
        </span>
      )}
    </span>
  );
}

/** A conversion's spread: up to its printed ceiling, or not limited by the documents (D56: never zero). */
function Spread({ l }: { l: TariffLineRow }) {
  if (!l.spread) return null;
  return (
    <span>
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

type Channel = "direct" | "branch";

/** Two lines of one fee that differ only by where the order is given. */
const channelKey = (l: TariffLineRow) => JSON.stringify([l.base, l.classes, l.band, l.fxToFx, l.distribution, l.period]);
const sameValue = (a: SiteValue | null, b: SiteValue | null) => (a?.value ?? null) === (b?.value ?? null) && (a?.unit ?? null) === (b?.unit ?? null);
const samePrice = (a: TariffLineRow, b: TariffLineRow) => sameValue(a.rate, b.rate) && sameValue(a.min, b.min) && sameValue(a.max, b.max) && sameValue(a.flat?.amount ?? null, b.flat?.amount ?? null) && sameValue(a.flat?.upTo ?? null, b.flat?.upTo ?? null);

/**
 * The lines as the table's rows: a fee the price list prices once for the direct channels and once at a branch is one row, holding both,
 * where the line of the channel chosen shows (its numbers change in place; the other rows stay); one priced alike in both is one row with
 * no channel's name. Every other line is a row of its own, in the price list's order.
 */
function channelRows(lines: readonly TariffLineRow[]): { key: string; line: TariffLineRow; pair: Record<Channel, TariffLineRow> | null; same: boolean }[] {
  const by = new Map<string, TariffLineRow[]>();
  for (const l of lines) if (l.channel) by.set(channelKey(l), [...(by.get(channelKey(l)) ?? []), l]);
  const out: { key: string; line: TariffLineRow; pair: Record<Channel, TariffLineRow> | null; same: boolean }[] = [];
  const done = new Set<string>();
  for (const l of lines) {
    const group = l.channel ? by.get(channelKey(l))! : null;
    const direct = group?.filter((x) => x.channel === "direct") ?? [];
    const branch = group?.filter((x) => x.channel === "branch") ?? [];
    if (group && group.length === 2 && direct.length === 1 && branch.length === 1) {
      if (done.has(channelKey(l))) continue;
      done.add(channelKey(l));
      const pair = { direct: direct[0]!, branch: branch[0]! };
      out.push({ key: `${pair.direct.id}|${pair.branch.id}`, line: pair.direct, pair, same: samePrice(pair.direct, pair.branch) });
    } else out.push({ key: l.id, line: l, pair: null, same: false });
  }
  return out;
}

/** Whether the price list prices some fee differently by channel: then the switch is shown. */
export const pricedByChannel = (lines: readonly TariffLineRow[]): boolean => channelRows(lines).some((r) => r.pair && !r.same);

/**
 * Every line of the price list as the site's table of products,
 * grouped by kind under a strip with the fee's name, so a row says only what sets it apart: what it is charged on, the channel, the plan.
 * Where each line stands is its own short column ("עמוד 30 ↗"). On a phone the strips stay, each line is one row, and the link ends the price's line.
 */
function FeeTable({ lines, channel }: { lines: TariffLineRow[]; /** Where the order is given: a fee the price list prices by channel shows that channel's line. */ channel: Channel }) {
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
          k === "distribution" ? { title: copy.card.distribution.name } : { title: feeKindName(k) },
        rows: channelRows(lines.filter((l) => feeKindOf(l) === k)).map((r) => {
          // a fee priced by channel shows the chosen channel's line, laid over the other's room: switching changes its numbers, never a height
          const held = (f: (l: TariffLineRow) => ReactNode) => (r.pair && !r.same ? <LongestCase cases={[f(r.pair.direct), f(r.pair.branch)]}>{f(r.pair[channel])}</LongestCase> : f(r.pair ? r.pair[channel] : r.line));
          const cells = [held((l) => <Covers l={l} noChannel={r.same} />), held((l) => figure("price", l.rate, priceWord(l))), held((l) => <Bound l={l} side="min" />), held((l) => <Bound l={l} side="max" />), held((l) => <WhereCell w={l.where} />)];
          // a flat price for a small order or conversion is the row's second line: its price across the price and bound columns, its own place in the documents
          const flat = r.pair ? !!(r.pair.direct.flat || r.pair.branch.flat) : !!r.line.flat;
          const lines = flat
            ? {
                columns: ["price", "min", "max", "where"],
                rows: [
                  { key: "rate", cells: cells.slice(1) },
                  { key: "flat", cells: [held((l) => <FlatFigure l={l} />), null, null, held((l) => (l.flat ? <WhereCell w={l.flat.where} /> : null))], spans: [3, 1, 1, 1] },
                ],
              }
            : undefined;
          return {
            key: r.key,
            cells,
            ...(lines ? { lines } : {}),
            phone: <ProductPhoneRow stacked>{held((l) => <PhoneFee l={l} same={r.same} />)}</ProductPhoneRow>,
          };
        }),
      }))}
    />
  );
}

/** A fee's lines on a phone: what it is charged on, the price with where it stands at the line's end, as the table's column ("עמוד 30 ↗"); the
 *  two bounds on the next line (each keeps its words whole, and no bound drops alone); a flat price for a small order or conversion with
 *  where it stands; a conversion's spread. */
function PhoneFee({ l, same }: { l: TariffLineRow; same: boolean }) {
  return (
    <span className="flex flex-col gap-1">
      <Covers l={l} phone noChannel={same} />
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
      {/* a flat price for a small order or conversion, with where it stands at the line's end, as the price's line */}
      {l.flat && (
        <span className="flex flex-wrap items-center justify-between gap-x-3">
          <FlatFigure l={l} inline />
          {l.flat.where && <WhereCell w={l.flat.where} />}
        </span>
      )}
      <Spread l={l} />
    </span>
  );
}

/** Whether a price list's title names its house already: its first two words ("בנק לאומי" in "… - בנק לאומי"). */
const namesHouse = (title: string, house: string) => title.includes(house.split(/\s+/).slice(0, 2).join(" "));

/** Where a can-buy row stands, as a `WhereLink`'s place. */
const placeOf = (a: AvailabilityRow) => ({ url: a.source.url, title: a.source.title, ...(a.source.page ? { page: a.source.page } : {}), ...((a.source as CitedPlace).fragment ? { fragment: (a.source as CitedPlace).fragment } : {}), tariff: false });

/**
 * What can be bought at the house, as its own documents say, with the reason where they leave it open: one row per kind between hairlines,
 * its state as a chip first. Where one document says it all, it is named once under the list (the designer's mock); else under each row.
 */
function CanBuy({ rows }: { rows: AvailabilityRow[] }) {
  if (rows.length === 0) return null;
  // one document and page for every row, whatever words its link would light (a text fragment)
  const one = new Set(rows.map((a) => `${a.source.url}|${a.source.title}|${a.source.page ?? ""}`)).size === 1;
  return (
    <Section level="card" heading="h3" id={accountSectionIds.canBuy} title={copy.card.canBuy.title}>
      <div className="flex flex-col gap-1">
        <RowList plain>
          {rows.map((a) => (
            <li key={a.classes.join()} className="flex flex-col items-start gap-1 px-1 py-2.5">
              <span className="flex flex-wrap items-center gap-2.5">
                {/* where the record names the rule that settles it, the state's word opens the rule's card (D105) */}
                <Tag tone={a.state === "yes" ? "positive" : a.state === "no" ? "blocked" : "caution"}>
                  {a.rules?.length ? (
                    <Term id={[]} rules={a.rules} name={classWords(a.classes)}>
                      {copy.card.canBuy.state[a.state]}
                    </Term>
                  ) : (
                    copy.card.canBuy.state[a.state]
                  )}
                </Tag>
                <bdi>{classWords(a.classes)}</bdi>
              </span>
              {a.reason && <span className="text-sm text-muted-foreground max-w-measure">{a.reason}</span>}
              {!one && <WhereLink w={placeOf(a)} />}
            </li>
          ))}
        </RowList>
        {one && (
          <span className="inline-flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            {copy.card.canBuyFrom} <WhereLink w={placeOf(rows[0]!)} />
          </span>
        )}
      </div>
    </Section>
  );
}

/** What the house's advertising says against its binding documents (D57): both sides with their sources. */
function Claims({ entries }: { entries: readonly AdvertisingEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <Section level="card" heading="h3" id={accountSectionIds.claims} title={copy.card.claims.title} lead={copy.card.claims.lead}>
      <Card pad="snug">
        <ClaimList entries={entries} />
      </Card>
    </Section>
  );
}

/** Group prices and offers, beside the comparison and never in it (D43): the sub-rows with where each stands, or why there are none. */
function Groups({ groups, houseId, linked }: { groups: FeesSnapshot["groups"] | null; houseId: string; linked: readonly string[] }) {
  if (!groups) return null;
  if (groups.state !== "prices") return <Section level="card" heading="h3" id={accountSectionIds.groups} title={copy.card.groupsTitle} lead={groupWords.states[groups.state]}>{null}</Section>;
  return (
    <Section level="card" heading="h3" id={accountSectionIds.groups} title={copy.card.groupsTitle} lead={copy.card.groupsLead}>
      <Card pad="snug">
        <GroupPriceRows entries={groups.entries} sources own={{ can: (key) => linked.includes(key), link: (key) => <TextLink look="line" to={groupPath(houseId, key)} className="text-sm">{groupWords.ownAccount}</TextLink> }} />
      </Card>
    </Section>
  );
}

/** The minimum to open an account and who supervises the house, as two cards side by side; then what protects the money, as a list. */
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
      footer: tariff.notice.length > 0 ? <RulesLine ids={tariff.notice} lead={<span>{copy.card.notice}</span>} className="text-sm" /> : undefined,
    },
  ];
  return (
    <Section level="card" heading="h3" id={accountSectionIds.facts} title={copy.card.factsTitle}>
      <KeyValueList items={items} />
      {tariff.protection.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">{copy.card.protectionDisclosure}</h4>
          {/* a rule's id first, then its title, between hairlines (the designer's mock) */}
          <RowList plain>
            {tariff.protection.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-1 py-1.5 min-h-12">
                <RuleRef id={r.id} />
                <bdi className="max-w-measure leading-snug">{gershayim(r.title)}</bdi>
              </li>
            ))}
          </RowList>
        </div>
      )}
    </Section>
  );
}

/**
 * Under the fee table, quiet lines: that a row priced by channel says its channel and changes in place, and, where the price list lists a
 * distribution fee, who pays it, from the regulations (MF-24; MF-26 says what a bank may charge without an agreement): not a charge the
 * account's price list adds. Its strip in the table holds only its name (the designer's mock).
 */
function FeeNotes({ lines, kind, byChannel }: { lines: readonly TariffLineRow[]; kind: InstitutionKind; byChannel: boolean }) {
  const distribution = feeKinds(lines).includes("distribution");
  if (!byChannel && !distribution) return null;
  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {byChannel && <p>{copy.card.channelNote}</p>}
      {distribution && (
        <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {copy.card.distribution.name}: {copy.card.distribution.who(kind === "bank" ? copy.card.distribution.toBank : copy.card.distribution.toBroker)}
          </span>
          <RulesChip ids={distributionRuleIds(kind)} name={copy.card.distribution.name} />
        </p>
      )}
    </div>
  );
}

/** One bar over the fee table: who these prices are for, and, where the price list prices a fee by channel, where the order is given. */
function FeeBar({ priceFor, byChannel, channel, onChannel }: { priceFor: string | null; byChannel: boolean; channel: Channel; onChannel: (c: Channel) => void }) {
  if (!priceFor && !byChannel) return null;
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg bg-muted px-4 py-3">
      {priceFor && (
        <p className="text-sm">
          <span className="text-muted-foreground">{copy.card.priceFor}:</span> <bdi className="font-medium">{priceFor}</bdi>
        </p>
      )}
      {byChannel && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:shrink-0">
          <span id="channel-pick" className="text-sm font-medium">
            {copy.card.channelPick}
          </span>
          <SegmentedControl<Channel> labelledBy="channel-pick" check={false} className="sm:w-auto sm:min-w-64 whitespace-nowrap" options={[{ value: "direct", label: copy.card.channel.direct }, { value: "branch", label: copy.card.channel.branch }]} value={channel} onChange={onChannel} />
        </div>
      )}
    </div>
  );
}

export function BrokerageGroupCard({ id, tariff, kind, className, advertising = [], groups = null, linked = [], docs }: { id: string; tariff: TariffCardData | null; kind: InstitutionKind; className?: string; /** The product's document entries, before the links that end it. */ docs?: ReactNode; /** What its advertising says against its documents (D57). */ advertising?: readonly AdvertisingEntry[]; /** Its group prices and offers (D43). */ groups?: FeesSnapshot["groups"] | null; /** The groups the index page offers as radios (`group:<n>`): each links there with it picked, the others have no link (D43 amended (5)). */ linked?: readonly string[] }) {
  const h = useId();
  const compareHref = housePath(id);
  const [channel, setChannel] = useState<Channel>("direct");
  const byChannel = useMemo(() => (tariff && !tariff.missing ? pricedByChannel(tariff.lines) : false), [tariff]);
  if (!tariff || tariff.missing) {
    return (
      <>
        <Card as="section" aria-labelledby={h} className={className}>
        <div className="flex flex-col gap-3">
          <h3 id={h} className="text-lg font-semibold flex items-center gap-2">
            <CircleDashed size={20} strokeWidth={1.75} aria-hidden="true" className="text-caution shrink-0" />
            {copy.missingTariff}
          </h3>
          {tariff?.reasonHe && <p className="text-sm text-muted-foreground max-w-measure">{tariff.reasonHe}</p>}
          {tariff && (
            <DocLink source={tariff} className="text-sm">
              {copy.missingLinks.tariffPageBefore}
              <bdi>{gershayim(tariff.providerName)}</bdi>
            </DocLink>
          )}
          <LinkButton to={compareHref} variant="secondary">
            {kind === "bank" ? copy.missingLinks.compare : copy.missingLinks.compareBroker}
          </LinkButton>
        </div>
        </Card>
        {docs}
      </>
    );
  }
  return (
    <div className={cx("flex flex-col gap-8", className)}>
      {/* the account's price list first, as a product's name and its quiet line: the document (its title is the link), its dates, who pays these prices */}
      {/* 8 px under the part's heading, whose section leaves 16 */}
      <div className="flex flex-col gap-1.5 -mt-2">
        {/* one muted line under the product's heading (the designer's mock): the price list, its title the link to it (a title may hold an
            address with no space in it: it breaks anywhere rather than widen the page), its house, its date and when it was collected */}
        <Sentence size="sm" tone="muted">
          <DocLink source={tariff} look="inline" className="max-w-measure">
            {gershayim(tariff.title)}
          </DocLink>
          {/* the house, unless the title names it already ("… - בנק לאומי") */}
          {!namesHouse(tariff.title, tariff.providerName) && (
            <>
              {", "}
              <MixedName>{tariff.providerName}</MixedName>
            </>
          )}
          {" · "}
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
      </div>
      {tariff.lines.length > 0 && (
        <Section level="card" heading="h3" id={accountSectionIds.fees} title={copy.card.linesTitle}>
          <FeeBar priceFor={tariff.priceFor} byChannel={byChannel} channel={channel} onChannel={setChannel} />
          <FeeTable lines={tariff.lines} channel={channel} />
          {/* what the house's documents hold and these prices leave out (D106) */}
          <LeftOutLine view={tariff.leftOut ?? null} house={gershayim(tariff.providerName)} className="text-sm" />
          <FeeNotes lines={tariff.lines} kind={kind} byChannel={byChannel} />
        </Section>
      )}
      <CanBuy rows={tariff.availability} />
      <Claims entries={advertising} />
      <Groups groups={groups} houseId={id} linked={linked} />
      <Facts tariff={tariff} />
      {docs}
      <div className="flex flex-wrap items-center gap-x-6">
        <GoLink to={compareHref}>{copy.card.compare}</GoLink>
        {/* the index page opens with the panel on this house's price list */}
        <GoLink to={ownAccountPath(id)}>{investCopy.ownAccount.open(gershayim(tariff.providerName))}</GoLink>
      </div>
    </div>
  );
}
