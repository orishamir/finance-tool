// The deposits page's list (D92): one table on a computer, one row per offer on a phone, on the kit's ProductTable. Five columns: the bank
// and the deposit, the rate with a bar of its share of the list's highest, the interest on the reader's amount over the term (F-21), the
// amounts the bank takes, and how the money can come out before the end (exit points, a break, or neither). Offers a bank prints under one
// name stand as one row, the others of the name as short lines under it ("אותו פיקדון, עם תחנות יציאה"). An offer only some customers may
// open ranks among the rest with an amber tag; linked offers follow the rest under one line. The reader's bank is tinted. Every rate and
// amount goes through the provenance component, as the record's own figure; the interest as a computed one.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { depositBrowser as t, r4catalogue as rc } from "../../copy";
import { HELP_TERMS, accessOf, ascending, interestOn, interestText, isLinked, rowSplit, variantWords, type DbBank, type DbOffer, type DbRow, type RowSplit, type SortId, type SortState, type TermId } from "../../lib/deposit-browser";
import { exitTiming } from "../../lib/deposit-kind";
import { fmt } from "../../lib/format";
import type { Label } from "../../lib/labels";
import type { SiteValue } from "../../lib/value";
import { Num, Term } from "../provenance";
import { HelpMark, LabelChip, MeterBar, MixedName, ProductPhoneRow, ProductTable, SortHead, Tag, cx, type ProductColumn, type ProductGroup, type ProductRow } from "../kit";
import { IconChevronDown } from "../icons";

const muted = "text-sm text-muted-foreground";

/** "פריים פחות 1.5 נקודות אחוז": a variable rate's anchor and spread, in words, since a minus sign misreads in Hebrew (BANK-47). */
function AnchorLine({ o }: { o: DbOffer }) {
  if (o.kind !== "variable" || !o.spread) return null;
  const v = Number(o.spread.value);
  return (
    <span className={cx(muted, "block whitespace-normal")}>
      {o.anchor === "prime" ? rc.rateType.prime : <MixedName>{o.anchor ?? ""}</MixedName>} {v < 0 ? rc.rateType.less : rc.rateType.more} <Num value={o.spread} display={`${fmt.number(Math.abs(v))} ${rc.rateType.points}`} />
    </span>
  );
}

/** "מ־1,000 ₪", or "1,000 עד 50,000 ₪" where the bank sets a top. */
function Amounts({ o }: { o: DbOffer }) {
  const { min, max } = o.amount_range;
  if (!max)
    return (
      <span className="whitespace-nowrap">
        {t.amountRange.from}
        <Num value={min} />
      </span>
    );
  return (
    <span className="whitespace-nowrap">
      <span>
        <Num value={min} display={typeof min.value === "number" ? fmt.number(min.value) : undefined} />
        {t.amountRange.to}
      </span>{" "}
      <span className="whitespace-nowrap">
        <Num value={max} />
      </span>
    </span>
  );
}

/** How the money can come out before the end: a teal chip for exit points, a neutral one for a break, muted words for neither. */
function Access({ o, plain, only }: { o: DbOffer; /** The phone's words, without chips. */ plain?: boolean; /** On an offer's line under the first of its name: only what differs from it. */ only?: RowSplit }) {
  const all = accessOf(o).filter((a) => !only || (a.kind === "exits" ? only.exits : a.kind === "break" ? only.break : only.exits || only.break));
  if (plain) return <span>{all.map((a) => a.words).join(" · ")}</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {all.map((a) =>
        a.kind === "locked" ? (
          <span key={a.kind} className={muted}>
            {a.words}
          </span>
        ) : (
          <Tag key={a.kind} tone={a.kind === "exits" ? "primary" : "neutral"} className={cx("!text-sm !font-normal", a.kind === "break" && "!rounded-full !px-2.5 !py-0.5")}>
            {a.words}
          </Tag>
        ),
      )}
    </span>
  );
}

/** An offer only some customers may open: its kind as an amber tag with a lock (the condition), apart from the kinds that only say how it works. */
const conditionOf = (l: Label): Label => ({ ...l, tone: "caution", icon: "lock" });

/** What the row carries under its name: a condition, a linkage. */
function Tags({ row }: { row: DbRow }) {
  const first = row.offers[0]!;
  const conditions = first.limited ? row.labels.filter((l) => l.id === "deposit-new-customers" || l.id === "deposit-closed-system") : [];
  const linked = isLinked(first);
  if (conditions.length === 0 && !linked) return null;
  return (
    <span className="flex flex-wrap gap-1.5 pt-1">
      {conditions.map((l) => (
        <LabelChip key={l.id} label={conditionOf(l)} />
      ))}
      {linked && <Tag tone="outline">{t.linked[first.linkage as "cpi" | "fx"]}</Tag>}
    </span>
  );
}

/** The kinds that say how the deposit works ("מבצע", "ריבית במהלך התקופה"), as words after its name; each opens its meaning. */
function OfferName({ row }: { row: DbRow }) {
  const notes = row.labels.filter((l) => l.id !== "deposit-new-customers" && l.id !== "deposit-closed-system");
  return (
    <span className={cx(muted, "!text-base whitespace-normal")}>
      <MixedName>{row.name}</MixedName>
      {notes.map((l) => (
        <Fragment key={l.id}>
          {", "}
          <LabelChip label={l} words />
        </Fragment>
      ))}
    </span>
  );
}

function BankName({ bank, mine }: { bank: DbBank | undefined; mine: boolean }) {
  if (!bank) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Link to={`/companies/${bank.id}`} className="font-semibold hover:underline">
        <MixedName>{bank.name}</MixedName>
      </Link>
      {mine && <Tag tone="primary">{t.mine}</Tag>}
    </span>
  );
}

export interface ListRow {
  row: DbRow;
  /** The list's top offer: its rate and bar in the accent. */
  top: boolean;
  mine: boolean;
}

export interface ListContext {
  term: TermId;
  /** The reader's amount, and the same as a value the interest's sheet names; null in the folded group of offers it does not open. */
  amount: { n: number; value: SiteValue } | null;
  today: string;
  banks: DbBank[];
  /** The highest rate in the list: each bar's share. */
  topRate: number;
  lit: string | null;
}

const rateOf = (o: DbOffer) => (typeof o.rate_offered.value === "number" ? o.rate_offered.value : 0);

function Interest({ o, ctx, small }: { o: DbOffer; ctx: ListContext; small?: boolean }) {
  if (!ctx.amount) return null;
  const v = interestOn(o, ctx.amount.n, ctx.amount.value, ctx.today);
  if (!v) return null;
  return <Num value={v} display={(n: number) => interestText(n)} className={small ? "" : "font-semibold"} />;
}

function tableRow({ row, top, mine }: ListRow, ctx: ListContext): ProductRow {
  const bank = ctx.banks.find((b) => b.id === row.bank);
  const first = row.offers[0]!;
  const hollow = first.limited || isLinked(first);
  const main: ReactNode[] = [
    <span className="flex flex-col items-start gap-0.5">
      <BankName bank={bank} mine={mine} />
      <OfferName row={row} />
      <Tags row={row} />
    </span>,
    <span className="flex flex-col items-stretch gap-1.5 min-w-0">
      <Num value={first.rate_offered} className={cx("text-2xl font-semibold self-start", top && "text-primary")} />
      <AnchorLine o={first} />
      <MeterBar share={rateOf(first) / ctx.topRate} tone={top ? "accent" : isLinked(first) ? "muted" : "value"} hollow={hollow} />
    </span>,
    ...(ctx.amount ? [<Interest o={first} ctx={ctx} />] : []),
    <Amounts o={first} />,
    <Access o={first} />,
  ];
  const sub = (o: DbOffer): ReactNode[] => [
    <span className={cx(muted, "block border-s-2 border-border ps-3 ms-0.5 whitespace-normal")}>{variantWords(row, o)}</span>,
    <span className="flex flex-col items-start">
      <Num value={o.rate_offered} className="font-semibold" />
      <AnchorLine o={o} />
    </span>,
    ...(ctx.amount ? [<span className="text-sm"><Interest o={o} ctx={ctx} small /></span>] : []),
    <span />,
    <Access o={o} only={rowSplit(row)} />,
  ];
  const ids = ctx.amount ? ["name", "rate", "interest", "amount", "access"] : ["name", "rate", "amount", "access"];
  return {
    key: row.key,
    rowOf: row.bank,
    lit: ctx.lit === row.bank,
    mine,
    phone: <PhoneRow row={row} top={top} mine={mine} ctx={ctx} />,
    cells: main,
    lines: row.offers.length > 1 ? { columns: ids, rows: row.offers.map((o, i) => ({ key: o.id, cells: i === 0 ? main : sub(o) })) } : undefined,
  };
}

function PhoneRow({ row, top, mine, ctx }: { row: DbRow; top: boolean; mine: boolean; ctx: ListContext }) {
  const bank = ctx.banks.find((b) => b.id === row.bank);
  const first = row.offers[0]!;
  return (
    <ProductPhoneRow stacked rowOf={row.bank} lit={ctx.lit === row.bank} mine={mine} className="!gap-2 !py-4">
      <span className="flex items-start justify-between gap-3">
        <span className="flex flex-col items-start gap-0.5 min-w-0">
          <BankName bank={bank} mine={mine} />
          <OfferName row={row} />
        </span>
        <span className="flex flex-col items-end shrink-0 gap-0.5">
          <Num value={first.rate_offered} className={cx("text-2xl font-semibold", top && "text-primary")} />
          {ctx.amount && (
            <span className={muted}>
              <Interest o={first} ctx={ctx} small /> {t.termIn[ctx.term]}
            </span>
          )}
        </span>
      </span>
      <AnchorLine o={first} />
      <MeterBar share={rateOf(first) / ctx.topRate} tone={top ? "accent" : isLinked(first) ? "muted" : "value"} hollow={first.limited || isLinked(first)} className="my-1" />
      <Tags row={row} />
      <span className="grid grid-cols-2 gap-3">
        <span className="flex flex-col">
          <span className={muted}>{t.columns.amount}</span>
          <Amounts o={first} />
        </span>
        <span className="flex flex-col">
          <span className={muted}>{t.columns.access}</span>
          <Access o={first} plain />
        </span>
      </span>
      {row.offers.slice(1).map((o) => (
        <span key={o.id} className="flex items-baseline justify-between gap-3 border-s-2 border-border ps-3">
          <span className={cx(muted, "whitespace-normal")}>{o.exits.exists && exitTiming(o.exits) !== null && rowSplit(row).exits ? `${t.variant.withWords}${accessOf(o)[0]!.words}` : variantWords(row, o)}</span>
          <Num value={o.rate_offered} className="font-semibold shrink-0" />
        </span>
      ))}
    </ProductPhoneRow>
  );
}

export function DepositList({ ranked, linked, ctx, sort, onSort, foot }: { ranked: ListRow[]; linked: ListRow[]; ctx: ListContext; sort: SortState | null; onSort?: (id: SortId) => void; foot?: (place: "phone" | "table") => ReactNode }) {
  const state = (id: SortId) => (sort?.id === id ? (ascending(sort) ? ("ascending" as const) : ("descending" as const)) : ("none" as const));
  const head = (id: SortId, label: string) => (onSort ? <SortHead label={label} state={state(id)} onPress={() => onSort(id)} /> : <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>);
  const plain = (label: ReactNode) => <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>;
  const columns: ProductColumn[] = [
    { id: "name", head: plain(t.columns.bank) },
    {
      id: "rate",
      head: (
        <span className="inline-flex items-start gap-1">
          {head("rate", t.columns.rate)}
          <HelpMark term={HELP_TERMS.rate} about={t.help.rate} />
        </span>
      ),
      width: 11,
      sort: onSort ? state("rate") : undefined,
    },
    ...(ctx.amount
      ? [
          {
            id: "interest",
            head: plain(
              <span className="whitespace-normal">
                <span className="block">
                  {t.columns.interestOn}
                  <bdi dir="ltr">{`${fmt.number(ctx.amount.n)} ₪`}</bdi> {t.termIn[ctx.term]}
                </span>
                <span className="block font-normal">{t.columns.beforeTax}</span>
              </span>,
            ),
            width: 13.5,
          },
        ]
      : []),
    { id: "amount", head: head("min", t.columns.amount), width: 12.5, sort: onSort ? state("min") : undefined },
    {
      id: "access",
      head: (
        <span className="inline-flex items-start gap-1">
          {plain(t.columns.access)}
          <HelpMark term={[HELP_TERMS.exits, HELP_TERMS.break]} about={t.columns.access} />
        </span>
      ),
      width: 13,
    },
  ];
  const groups: ProductGroup[] = [{ key: "ranked", rows: ranked.map((r) => tableRow(r, ctx)) }];
  if (linked.length) groups.push({ key: "linked", heading: { title: <span className="font-normal text-sm text-muted-foreground"><Term id={HELP_TERMS.linked}>{t.linkedLead}</Term>{t.linkedLine}</span> }, rows: linked.map((r) => tableRow(r, ctx)) });
  return <ProductTable stickyHead columns={columns} groups={groups} foot={foot} />;
}

/** The list's last row: "עוד 15 הצעות", and "להציג פחות" once open. */
export function FoldFoot({ open, more, onToggle }: { open: boolean; more: string; onToggle: () => void }) {
  return (
    <button type="button" aria-expanded={open} onClick={onToggle} className="w-full flex items-center justify-between gap-3 min-h-14 px-4 md:px-6 border-t border-border text-link font-semibold hover:bg-accent cursor-pointer">
      <span>{open ? t.fold.less : more}</span>
      <IconChevronDown size={18} className={cx("transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
    </button>
  );
}
