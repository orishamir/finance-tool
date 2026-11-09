// The deposits page's list (D92): one table on a computer, one row per offer on a phone, built on the kit's ProductTable as the track browser
// is. One term: one list, the bank first in each row, then the linked offers in a group of their own. Every term: the offers stand under
// their banks. The offers the reader's amount does not open are one folded group at the end. Offers a bank prints under one name stand as
// one row, a line for each (`DbRow`). Every rate and amount goes through the provenance component, as the record's own figure.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { depositBrowser as t, r4catalogue as rc } from "../../copy";
import { exitWords } from "../../lib/deposit-kind";
import { HELP_TERMS, ascending, offersPhrase, rowSplit, type DbBank, type DbOffer, type DbRow, type RowSplit, type SortId, type SortState } from "../../lib/deposit-browser";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { HelpMark, LabelRow, MixedName, ProductPhoneRow, ProductTable, SortHead, Tag, When, cx, type ProductColumn, type ProductGroup, type ProductRow } from "../kit";

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

/** "מ־1,000 ₪" and, under it, "עד 50,000 ₪". */
function Amounts({ o, inline }: { o: DbOffer; inline?: boolean }) {
  const { min, max } = o.amount_range;
  return (
    <span className={inline ? "inline" : "flex flex-col"}>
      <span className="whitespace-nowrap">
        {rc.amount.from}
        <Num value={min} />
      </span>
      {max && (
        <span className={cx("whitespace-nowrap", !inline && muted)}>
          {inline && " "}
          {rc.amount.to} <Num value={max} />
        </span>
      )}
    </span>
  );
}

const exitsText = (o: DbOffer) => exitWords(o.exits.exists, o.exits.everyMonths);
const exitsLine = (o: DbOffer) => `${t.columns.exits}: ${exitsText(o)}`;

/** What sets the row apart: its kinds (a closed-system deposit says who may take it), and an index linkage unless its group's heading says it. */
function Marks({ row, linkedHead }: { row: DbRow; linkedHead: boolean }) {
  const linked = row.linkage !== "none" && !linkedHead;
  if (row.labels.length === 0 && !linked) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      <LabelRow labels={row.labels} />
      {linked && <Tag>{t.linked[row.linkage as "cpi" | "fx"]}</Tag>}
    </span>
  );
}

function TableDate({ bank }: { bank: DbBank | undefined }) {
  return bank?.tableDate ? (
    <span className="text-xs text-muted-foreground">
      <When iso={bank.tableDate} lead={t.tableFrom} />
    </span>
  ) : null;
}

/** The bank's name, linking to its page: first in a row that stands under no bank's heading. */
function BankName({ bank }: { bank: DbBank | undefined }) {
  if (!bank) return null;
  return (
    <Link to={`/companies/${bank.id}`} className="font-semibold hover:underline">
      <MixedName>{bank.name}</MixedName>
    </Link>
  );
}

function NameCell({ row, bank, showBank, linkedHead }: { row: DbRow; bank: DbBank | undefined; showBank: boolean; linkedHead: boolean }) {
  return (
    <span className="flex flex-col items-start gap-1">
      {showBank && <BankName bank={bank} />}
      {showBank && <TableDate bank={bank} />}
      <span className="whitespace-normal">
        <MixedName>{row.name}</MixedName>
      </span>
      <Marks row={row} linkedHead={linkedHead} />
    </span>
  );
}

/** The rate, and a variable rate's anchor under it. */
function RateCell({ o }: { o: DbOffer }) {
  return (
    <span className="flex flex-col gap-0.5">
      <Num value={o.rate_offered} size="cell" />
      <AnchorLine o={o} />
    </span>
  );
}

/** The row's terms the phone shows in its grey line: those its offers share (all of them, for a row of one offer). */
function SharedLine({ o, split, all }: { o: DbOffer; split: RowSplit; all: boolean }) {
  return (
    <span className={cx(muted, "flex flex-wrap gap-x-3 gap-y-0.5")}>
      {all && <span>{t.terms[o.term]}</span>}
      {!split.amount && <Amounts o={o} inline />}
      {!split.exits && <span>{exitsLine(o)}</span>}
      {!split.break && <span>{rc.breakWord[o.breakTerm]}</span>}
    </span>
  );
}

function PhoneRow({ row, bank, showBank, all, lit, linkedHead }: { row: DbRow; bank: DbBank | undefined; showBank: boolean; all: boolean; lit: boolean; linkedHead: boolean }) {
  const first = row.offers[0]!;
  const many = row.offers.length > 1;
  const split = many ? rowSplit(row) : { amount: false, exits: false, break: false };
  const names = (
    <span className="flex flex-col items-start gap-0.5 min-w-0">
      {showBank && <BankName bank={bank} />}
      {showBank && <TableDate bank={bank} />}
      <span className="whitespace-normal">
        <MixedName>{row.name}</MixedName>
      </span>
    </span>
  );
  return (
    <ProductPhoneRow stacked rowOf={row.bank} lit={lit} className="!gap-1.5">
      {many ? (
        <>
          {names}
          {/* each offer's rate, with what sets it apart from the others of the name: the price of an exit point, a break, an amount */}
          <span className="flex flex-col gap-1">
            {row.offers.map((o) => (
              <span key={o.id} className="flex flex-col">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <Num value={o.rate_offered} className="text-lg font-semibold" />
                  <span className={cx(muted, "flex flex-wrap gap-x-3")}>
                    {split.amount && <Amounts o={o} inline />}
                    {split.exits && <span>{exitsLine(o)}</span>}
                    {split.break && <span>{rc.breakWord[o.breakTerm]}</span>}
                  </span>
                </span>
                <AnchorLine o={o} />
              </span>
            ))}
          </span>
        </>
      ) : (
        <>
          <span className="flex items-start justify-between gap-3">
            {names}
            <span className="flex flex-col items-end shrink-0">
              <Num value={first.rate_offered} className="text-lg font-semibold" />
            </span>
          </span>
          <AnchorLine o={first} />
        </>
      )}
      <SharedLine o={first} split={split} all={all} />
      <Marks row={row} linkedHead={linkedHead} />
    </ProductPhoneRow>
  );
}

export interface ListPart {
  key: string;
  /** A bank's heading (every term), the linked offers' group, or the folded group of the offers the amount does not open. */
  heading?: { title: ReactNode; line?: ReactNode };
  fold?: { open: boolean; onToggle: () => void };
  rows: DbRow[];
  /** The rows stand under a bank's heading, so they do not name it. */
  underBank?: boolean;
  /** The heading says the rows are linked to the index, so they carry no tag of it. */
  linkedHead?: boolean;
}

const LINE_COLUMNS = { amount: "amount", exits: "exits", break: "break" } as const;

/** A table row: one offer, or the offers of one name with a line for each (rate, and what they do not share). */
function tableRow(row: DbRow, bank: DbBank | undefined, part: ListPart, all: boolean, lit: boolean): ProductRow {
  const first = row.offers[0]!;
  const showBank = !part.underBank;
  const linkedHead = !!part.linkedHead;
  const many = row.offers.length > 1;
  const split = many ? rowSplit(row) : null;
  const apart = split ? (Object.keys(LINE_COLUMNS) as (keyof RowSplit)[]).filter((k) => split[k]) : [];
  const cellsOf = (o: DbOffer): Record<string, ReactNode> => ({
    rate: <RateCell o={o} />,
    amount: <Amounts o={o} />,
    exits: <span className="whitespace-normal">{exitsText(o)}</span>,
    break: <span className="whitespace-normal">{rc.breakWord[o.breakTerm]}</span>,
  });
  const own = cellsOf(first);
  return {
    key: row.key,
    rowOf: row.bank,
    lit,
    phone: <PhoneRow row={row} bank={bank} showBank={showBank} all={all} lit={lit} linkedHead={linkedHead} />,
    cells: [<NameCell row={row} bank={bank} showBank={showBank} linkedHead={linkedHead} />, ...(all ? [<span>{t.terms[row.term]}</span>] : []), own.rate, own.amount, own.exits, own.break],
    lines: many
      ? {
          columns: ["rate", ...apart.map((k) => LINE_COLUMNS[k])],
          rows: row.offers.map((o) => {
            const c = cellsOf(o);
            return { key: o.id, cells: [c.rate, ...apart.map((k) => c[LINE_COLUMNS[k]])] };
          }),
        }
      : undefined,
  };
}

export function DepositList({ parts, all, sort, sortable, onSort, banks, lit, limit, count }: { parts: ListPart[]; all: boolean; /** The offers the amount opens, beside the first column's head ("הבנק והפיקדון (24)"). */ count: number; sort: SortState; sortable: ReadonlySet<SortId>; onSort: (id: SortId) => void; banks: DbBank[]; /** The bank whose rows light for a moment. */ lit: string | null; /** The rows drawn (a row of several offers counts once). */ limit: number }) {
  const state = (id: SortId) => (sort.id === id ? (ascending(sort) ? ("ascending" as const) : ("descending" as const)) : ("none" as const));
  const head = (id: SortId, label: string) => (sortable.has(id) ? <SortHead label={label} state={state(id)} onPress={() => onSort(id)} /> : <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>);
  const plain = (label: string) => <span className="inline-flex min-h-11 -my-1 pt-1">{label}</span>;
  const columns: ProductColumn[] = [
    { id: "name", head: head("bank", `${all ? t.columns.deposit : t.columns.bank} (${fmt.number(count)})`), sort: sortable.has("bank") ? state("bank") : undefined },
    ...(all ? [{ id: "term", head: head("term", t.columns.term), width: 7, sort: state("term") }] : []),
    {
      id: "rate",
      head: (
        <span className="inline-flex items-start gap-1">
          {head("rate", t.columns.rate)}
          <HelpMark term={HELP_TERMS.rate} about={t.help.rate} />
        </span>
      ),
      width: 10,
      sort: state("rate"),
    },
    { id: "amount", head: head("min", t.columns.amount), width: 10, sort: state("min") },
    {
      id: "exits",
      head: (
        <span className="inline-flex items-start gap-1">
          {plain(t.columns.exits)}
          <HelpMark term={HELP_TERMS.exits} about={t.help.exits} />
        </span>
      ),
      width: 8.5,
    },
    {
      id: "break",
      head: (
        <span className="inline-flex items-start gap-1">
          {plain(t.columns.break)}
          <HelpMark term={HELP_TERMS.break} about={t.help.break} />
        </span>
      ),
      width: 10,
    },
  ];
  const bankOf = (id: string) => banks.find((b) => b.id === id);
  let left = limit;
  const groups: ProductGroup[] = [];
  for (const p of parts) {
    const open = p.fold ? p.fold.open : true;
    const drawn = open ? p.rows.slice(0, Math.max(0, left)) : [];
    left -= drawn.length;
    if (p.rows.length === 0) continue;
    groups.push({ key: p.key, heading: p.heading, fold: p.fold, rows: drawn.map((r) => tableRow(r, bankOf(r.bank), p, all, lit === r.bank)) });
  }
  return <ProductTable stickyHead foldable columns={columns} groups={groups} />;
}

/** A group heading's line: its count, then what it says ("11 הצעות · …"). */
export function GroupLine({ count, children }: { count: number; children?: ReactNode }) {
  return (
    <>
      <span className="whitespace-nowrap">{offersPhrase(count)}</span>
      {children && (
        <>
          {" · "}
          {children}
        </>
      )}
    </>
  );
}

/** A bank's heading line under every term: its count, and the date its table prints when it is before the reading. */
export function BankLine({ bank, count }: { bank: DbBank; count: number }) {
  return (
    <GroupLine count={count}>
      {bank.tableDate && (
        <span className="whitespace-nowrap">
          <When iso={bank.tableDate} lead={t.tableFrom} />
        </span>
      )}
    </GroupLine>
  );
}
