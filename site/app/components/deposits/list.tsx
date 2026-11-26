// The deposits page's list (D92): one table on a computer, one row per offer on a phone, on the kit's ProductTable. Five columns: the bank
// and the deposit, the rate, the interest on the reader's amount over the term (F-21), the
// amounts the bank takes, and how the money can come out before the end (exit points, a break, or neither). Offers a bank prints under one
// name stand as one row, the others of the name as short lines under it ("אותו פיקדון, עם תחנות יציאה"); the conditions the bank prints
// fold under the row, as on its own page. An offer only some customers may open ranks among the rest with its tag; linked offers follow
// the rest under one line. The reader's bank is tinted. Every rate and
// amount goes through the provenance component, as the record's own figure; the interest as a computed one.
import { Fragment, useId, useState, type ReactNode } from "react";
import { companyPath } from "../../lib/site-paths";
import { Link } from "react-router";
import { companyPage, depositBrowser as t, r4catalogue } from "../../copy";
import { HELP_TERMS, accessOf, ascending, interestOn, interestText, interestUnknown, isLinked, rowSplit, variantWords, type DbBank, type DbOffer, type DbRow, type RowSplit, type SortId, type SortState, type TermId } from "../../lib/deposit-browser";
import { exitTiming } from "../../lib/deposit-kind";
import { fmt } from "../../lib/format";
import type { Label } from "../../lib/labels";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, Term } from "../provenance";
import { AmountRange, AnchorSpread, HelpMark, LabelChip, MixedName, PrintedText, ProductPhoneRow, ProductTable, RowFoldButton, SortHead, Tag, cx, gershayim, type FoldMark, type ProductColumn, type ProductGroup, type ProductRow } from "../kit";
import { IconChevronDown, IconFile } from "../icons";

const muted = "text-sm text-muted-foreground";

/** The record's doubt about a field that is no figure here (`DbOffer.doubt`), as a caution mark beside that field that opens the doubt. */
function DoubtMark({ o, on, about }: { o: DbOffer | undefined; on: readonly NonNullable<DbOffer["doubt"]>["on"][]; about: string }) {
  return o?.doubt && on.includes(o.doubt.on) ? <HelpMark tone="caution" note about={about} text={o.doubt.text} /> : null;
}

/** How the money can come out before the end: a teal chip for exit points, a neutral one for a break, muted words for neither; a doubt about them beside. */
function Access({ o, plain, only }: { o: DbOffer; /** The phone's words, without chips. */ plain?: boolean; /** On an offer's line under the first of its name: only what differs from it. */ only?: RowSplit }) {
  const all = accessOf(o).filter((a) => !only || (a.kind === "exits" ? only.exits : a.kind === "break" ? only.break : only.exits || only.break));
  const doubt = <DoubtMark o={o} on={["exits", "break"]} about={t.columns.access} />;
  if (plain)
    return (
      <span className="inline-flex items-start gap-1">
        <span>{all.map((a) => a.words).join(" · ")}</span>
        {doubt}
      </span>
    );
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {all.map((a) =>
        a.kind === "locked" ? (
          <span key={a.kind} className={muted}>
            {a.words}
          </span>
        ) : (
          <Tag key={a.kind} tone={a.kind === "exits" ? "primary" : "neutral"} shape="roomy" size="sm">
            {a.words}
          </Tag>
        ),
      )}
      {doubt}
    </span>
  );
}

/**
 * An offer only some customers may open: its kind as a tag apart from the kinds that only say how it works. Only joining the bank is a
 * restriction its card states, amber with a lock; a closed-system deposit's card states how the money moves, and keeps its own look.
 */
const conditionOf = (l: Label): Label => (l.id === "deposit-new-customers" ? { ...l, tone: "caution", icon: "lock" } : l);

/** What the row carries under its name: a condition, a linkage, and a doubt about the linkage or the term beside them. */
function Tags({ row }: { row: DbRow }) {
  const first = row.offers[0]!;
  const conditions = first.limited ? row.labels.filter((l) => l.id === "deposit-new-customers" || l.id === "deposit-closed-system") : [];
  const linked = isLinked(first);
  const doubted = (on: NonNullable<DbOffer["doubt"]>["on"]) => row.offers.find((o) => o.doubt?.on === on);
  const termDoubt = doubted("term_months");
  if (conditions.length === 0 && !linked && !termDoubt) return null;
  return (
    <span className="flex flex-wrap items-center gap-1.5 pt-1">
      {conditions.map((l) => (
        <LabelChip key={l.id} label={conditionOf(l)} />
      ))}
      {linked && (
        <span className="inline-flex items-center gap-1">
          <Tag tone="outline">{t.linked[first.linkage as "cpi" | "fx"]}</Tag>
          <DoubtMark o={doubted("linkage")} on={["linkage"]} about={t.linked[first.linkage as "cpi" | "fx"]} />
        </span>
      )}
      <DoubtMark o={termDoubt} on={["term_months"]} about={t.terms[row.term]} />
    </span>
  );
}

/**
 * The bank's printed conditions of a row's offers, each once, folded under the row with the bank page's words and mark ("בתנאי הבנק:",
 * "יש הערה של הבנק"), so the two pages draw one record alike. Null when the bank prints none.
 */
function rowConditions(row: DbRow): { body: ReactNode; marks: FoldMark[]; label: string } | null {
  const all = [...new Set(row.offers.map((o) => o.conditions).filter((c): c is string => !!c))];
  if (all.length === 0) return null;
  return {
    body: (
      <span className="flex flex-col items-start gap-1.5 text-sm max-w-measure">
        {all.map((c) => (
          <span key={c}>
            <span className="text-muted-foreground">{r4catalogue.conditionsLead}</span> <PrintedText text={c} />
          </span>
        ))}
      </span>
    ),
    marks: [{ key: "note", icon: <IconFile size={16} />, label: companyPage.deposits.marks.note }],
    label: companyPage.deposits.detail(gershayim(row.name)),
  };
}

/** The kinds that say how the deposit works ("מבצע", "ריבית במהלך התקופה"), as words after its name; each opens its meaning. */
function OfferName({ row }: { row: DbRow }) {
  const notes = row.labels.filter((l) => l.id !== "deposit-new-customers" && l.id !== "deposit-closed-system");
  return (
    <span className="text-base text-muted-foreground whitespace-normal">
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

function BankName({ bank }: { bank: DbBank | undefined }) {
  if (!bank) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Link to={companyPath(bank.id)} className="tap-area font-semibold hover:underline">
        <MixedName>{bank.name}</MixedName>
      </Link>
    </span>
  );
}

export interface ListRow {
  row: DbRow;
  /** The list's top offer: its rate in the accent. */
  top: boolean;
}

export interface ListContext {
  term: TermId;
  /** The reader's amount, and the same as a value the interest's sheet names; null in the folded group of offers it does not open. */
  amount: { n: number; value: SiteValue } | null;
  today: string;
  banks: DbBank[];
  lit: string | null;
}

function Interest({ o, ctx, small }: { o: DbOffer; ctx: ListContext; small?: boolean }) {
  if (!ctx.amount) return null;
  const v = interestOn(o, ctx.amount.n, ctx.amount.value, ctx.today);
  if (!v)
    return interestUnknown(o) ? (
      <span className="text-sm text-muted-foreground font-normal">
        {t.interest.unknown} <IdRef id="BANK OQ21" />
      </span>
    ) : null;
  return <Num value={v} display={(n: number) => interestText(n)} className={small ? "" : "font-semibold"} />;
}

function tableRow({ row, top }: ListRow, ctx: ListContext): ProductRow {
  const bank = ctx.banks.find((b) => b.id === row.bank);
  const first = row.offers[0]!;
  const main: ReactNode[] = [
    <span className="flex flex-col items-start gap-0.5">
      <BankName bank={bank} />
      <OfferName row={row} />
      <Tags row={row} />
    </span>,
    <span className="flex flex-col items-start gap-1.5 min-w-0">
      <Num value={first.rate_offered} className={cx("text-2xl font-semibold", top && "text-primary")} />
      <AnchorSpread variable={first.kind === "variable"} anchor={first.anchor} spread={first.spread} />
    </span>,
    ...(ctx.amount ? [<Interest o={first} ctx={ctx} />] : []),
    <AmountRange min={first.amount_range.min} max={first.amount_range.max} edges={first.amount_range} />,
    <Access o={first} />,
  ];
  const sub = (o: DbOffer): ReactNode[] => [
    <span className={cx(muted, "block border-s-2 border-border ps-3 ms-0.5 whitespace-normal")}>{variantWords(row, o)}</span>,
    <span className="flex flex-col items-start">
      <Num value={o.rate_offered} className="font-semibold" />
      <AnchorSpread variable={o.kind === "variable"} anchor={o.anchor} spread={o.spread} />
    </span>,
    ...(ctx.amount ? [<span className="text-sm"><Interest o={o} ctx={ctx} small /></span>] : []),
    <span />,
    <Access o={o} only={rowSplit(row)} />,
  ];
  const ids = ctx.amount ? ["name", "rate", "interest", "amount", "access"] : ["name", "rate", "amount", "access"];
  const detail = rowConditions(row);
  return {
    key: row.key,
    ...(detail ? { detail } : {}),
    rowOf: row.bank,
    lit: ctx.lit === row.bank,
    phone: <PhoneRow row={row} top={top} ctx={ctx} />,
    cells: main,
    lines: row.offers.length > 1 ? { columns: ids, rows: row.offers.map((o, i) => ({ key: o.id, cells: i === 0 ? main : sub(o) })) } : undefined,
  };
}

function PhoneRow({ row, top, ctx }: { row: DbRow; top: boolean; ctx: ListContext }) {
  const bank = ctx.banks.find((b) => b.id === row.bank);
  const first = row.offers[0]!;
  const detail = rowConditions(row);
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <ProductPhoneRow stacked rowOf={row.bank} lit={ctx.lit === row.bank} roomy>
      <span className="flex items-start justify-between gap-3">
        <span className="flex flex-col items-start gap-0.5 min-w-0">
          <BankName bank={bank} />
          <OfferName row={row} />
          {detail && <RowFoldButton open={open} onToggle={() => setOpen(!open)} marks={detail.marks} label={detail.label} controls={id} className="-ms-2" />}
        </span>
        {/* the rate over the interest, 12 px apart: each figure's 44 px area stays clear of the other's own box */}
        <span className="flex flex-col items-end shrink-0 gap-3">
          <Num value={first.rate_offered} className={cx("text-2xl font-semibold", top && "text-primary")} />
          {ctx.amount && (
            <span className={muted}>
              <Interest o={first} ctx={ctx} small /> {t.termIn[ctx.term]}
            </span>
          )}
        </span>
      </span>
      <AnchorSpread variable={first.kind === "variable"} anchor={first.anchor} spread={first.spread} />
      <Tags row={row} />
      <span className="grid grid-cols-2 gap-3">
        <span className="flex flex-col">
          <span className={muted}>{t.columns.amount}</span>
          <AmountRange min={first.amount_range.min} max={first.amount_range.max} edges={first.amount_range} />
        </span>
        <span className="flex flex-col">
          <span className={muted}>{t.columns.access}</span>
          <Access o={first} plain />
        </span>
      </span>
      {row.offers.slice(1).map((o) => (
        // a line of its own 44 px tall, so its rate's area reaches its 44 px between the lines' figures
        <span key={o.id} className="flex min-h-target items-center justify-between gap-3 border-s-2 border-border ps-3">
          <span className={cx(muted, "whitespace-normal")}>{o.exits.exists && exitTiming(o.exits) !== null && rowSplit(row).exits ? `${t.variant.withWords}${accessOf(o)[0]!.words}` : variantWords(row, o)}</span>
          <Num value={o.rate_offered} className="font-semibold shrink-0" />
        </span>
      ))}
      {detail && open && (
        <div id={id} className="pt-1">
          {detail.body}
        </div>
      )}
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
      // the figure ("1.52%") with a variable rate's anchor and spread under it, and the head on one line while it sorts (bold, with its
      // arrow and "?": 105 px, and the cell's 24)
      width: 8.25,
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
                  <bdi dir="ltr">{fmt.nisWhole(ctx.amount.n)}</bdi> {t.termIn[ctx.term]}
                </span>
                <span className="block font-normal">{t.columns.beforeTax}</span>
              </span>,
            ),
            width: 13.5,
          },
        ]
      : []),
    // a range breaks between its two ends, and before "(לא כולל)", rather than run into the next cell
    { id: "amount", head: head("min", t.columns.amount), width: 12.5, wrap: true, sort: onSort ? state("min") : undefined },
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
      <IconChevronDown size={18} className={cx("transition-transform duration-(--duration-fold) ease-standard", open && "rotate-180")} />
    </button>
  );
}
