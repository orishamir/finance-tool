// A bank's deposits and savings plans on its company page (components/company/template.tsx): one table each, built on the kit's ProductTable.
// The records the bank prints under one name and terms, differing only by the amount, are one row (lib/bank-table.ts). Deposits stand under
// their kind. What every row shares is said once over the table (kit SharedFacts); what only some rows have stays in them. Where every deposit
// has the same amount ranges, each range is a rate column, and "כמה מפקידים" keeps one lit and dims the others in place; where the ranges
// differ, each row lists its amounts as lines, as the deposits page does. A phone shows a row per deposit, its rates as small tiles.
import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { guidePath } from "../../lib/site-paths";
import { companyPage as w, r4catalogue as copy } from "../../copy";
import { kindGroups, lineAt, rangeKey, sharedBands, sharedFacts, tableRows, taxPerLinkage, type AmountBand, type Shared, type TableRow } from "../../lib/bank-table";
import { amountRangeText, breakText, depositLabels, exitsText, onlyAtExits, renewText, taxWord, termWords } from "../../lib/deposit-kind";
import { fmt } from "../../lib/format";
import { HELP_TERMS as DEPOSIT_TERMS } from "../../lib/deposit-browser";
import { numberOf, type SiteValue } from "../../lib/value";
import { IconAlert, IconFile } from "../icons";
import { Num, NumAfter, RulesLine } from "../provenance";
import { AmountRange, AnchorSpread, ChoiceChips, Disclosure, GoLink, HelpMark, SegmentedControl, DoubtNote, FigureLines, LabelRow, LabelSheetHost, MixedName, PrintedQuotes, PrintedText, ProductPhoneRow, ProductTable, RowFoldButton, SharedFacts, Tag, When, cx, gershayim, type FoldMark, type ProductColumn, type ProductRow } from "../kit";
import type { ProductRowData } from "../decoder/institutions/types";

const muted = "text-sm text-muted-foreground";
const ALL = "all";

/** An amount band's range in plain words, for a chip (a control holds no figure that opens its own sheet; the column's head holds the sourced one). */
const rangeText = (b: AmountBand, fromOnly?: boolean): string => amountRangeText(numberOf(b.min), numberOf(b.max), fromOnly);

/** A rate, its anchor and spread under it in the short form ("פריים פחות 4.73"); `inline`, after it on its line (a phone's list of amounts). */
function Rate({ p, inline }: { p: ProductRowData; inline?: boolean }) {
  return (
    <span className={inline ? "inline-flex flex-wrap items-baseline justify-end gap-x-1.5" : "flex flex-col gap-0.5 leading-snug"}>
      <Num value={p.rate} size="cell" />
      <AnchorSpread variable={p.rateType === "variable"} anchor={p.anchor} spread={p.spread} look={inline ? "after" : "under"} />
    </span>
  );
}

const exitsOf = (p: ProductRowData) => exitsText(p.exitPoints, p.conditions);

function RateType({ p }: { p: ProductRowData }) {
  return <Tag tone="outline">{p.rateType === "variable" ? w.deposits.variable : w.deposits.fixed}</Tag>;
}

/** The row's first cell: the bank's name for the deposit and its kinds' labels, then a quiet line, "דגם 401/0 · צמוד למדד" (the designer's mocks: the period is the kind's heading and the name's). */
function NameCell({ row, known }: { row: TableRow; known: ReadonlySet<string> }) {
  const p = row.lines[0]!;
  const tags = p.variant.length > 0;
  const linked = p.linkage !== "none" ? copy.linkage[p.linkage] : null;
  return (
    <span className="flex flex-col items-start gap-0.5 whitespace-normal leading-snug">
      {row.lines.map((x) => (
        <span key={x.id} id={`product-${x.id}`} aria-hidden="true" className="anchor-target" />
      ))}
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold">
          <MixedName>{p.name}</MixedName>
        </span>
        {tags && <LabelRow labels={depositLabels(p.variant, known, p.table)} />}
      </span>
      {(p.model || linked) && (
        <span className="text-xs text-muted-foreground">
          {[
            p.model && (
              <Fragment key="model">
                {w.deposits.modelWord} <bdi dir="ltr" className="num-id">{p.model}</bdi>
              </Fragment>
            ),
            linked && <Fragment key="link">{linked}</Fragment>,
          ]
            .filter(Boolean)
            .flatMap((x, i) => (i > 0 ? [" · ", x] : [x]))}
        </span>
      )}
    </span>
  );
}

/**
 * The rest of what is known about one deposit, folded under its row: the bank's conditions, its other names, whatever about a break, a
 * renewal or the tax the shared box does not say, the bank's own words, a doubt, a late or stale date. Null when there is nothing.
 */
function rowDetail(row: TableRow, shared: Shared, known: ReadonlySet<string>): { body: ReactNode; marks: FoldMark[]; label: string } | null {
  const p = row.lines[0]!;
  const doubts = [...new Set(row.lines.map((x) => x.doubt).filter((x): x is string => !!x))];
  const late = row.lines.some((x) => x.asOfAfterRead);
  const note = !!p.conditions && !p.currentAccount && !shared.conditions;
  const extras: { key: string; label: string; value: ReactNode; rules?: readonly string[] }[] = [
    ...(!shared.breakTerms ? [{ key: "break", label: copy.labels.breakTerms, value: breakText(p.breakTerms.penalty, p.exitPoints.exists), rules: p.breakTerms.rules }] : []),
    ...(!shared.autoRenew ? [{ key: "renew", label: copy.labels.autoRenew, value: renewText(p.autoRenew.value, p.autoRenew.maxRenewals) }] : []),
    ...(!shared.tax && !shared.taxByLinkage ? [{ key: "tax", label: copy.labels.tax, value: <Num value={p.taxBucket} display={taxWord(p.taxBucket.value)} />, rules: p.taxBucket.rule_ids ?? [] }] : []),
  ];
  const quotes = !shared.breakQuotes ? p.breakTerms.quotes : [];
  if (!note && p.alsoCalled.length === 0 && extras.length === 0 && quotes.length === 0 && doubts.length === 0 && !late && !p.stale) return null;
  const caution = [...(doubts.length ? [w.deposits.marks.doubt] : []), ...(late ? [copy.asOfAfterRead] : []), ...(p.stale ? [w.deposits.marks.stale] : [])];
  const marks: FoldMark[] = [
    ...(note ? [{ key: "note", icon: <IconFile size={16} />, label: w.deposits.marks.note }] : []),
    ...(caution.length ? [{ key: "caution", icon: <IconAlert size={16} className="text-caution" />, label: caution.join(", ") }] : []),
  ];
  const body = (
    <span className="flex flex-col items-start gap-1.5 text-sm max-w-measure">
      {note && (
        <span>
          <span className="text-muted-foreground">{copy.conditionsLead}</span> <PrintedText text={p.conditions!} />
        </span>
      )}
      {p.alsoCalled.length > 0 && (
        <span className={cx(muted, "flex flex-wrap items-center gap-1.5")}>
          <span>{copy.alsoCalled}</span>
          {p.alsoCalled.map((n) => (
            <Tag key={n} wrap>
              <MixedName>{n}</MixedName>
            </Tag>
          ))}
        </span>
      )}
      {extras.map((x) => (
        <span key={x.key} className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-muted-foreground">{x.label}:</span> {x.value}
          {x.rules && x.rules.filter((r) => known.has(r)).length > 0 && <RulesLine ids={x.rules.filter((r) => known.has(r))} />}
        </span>
      ))}
      {quotes.length > 0 && <BankWords quotes={quotes} />}
      {doubts.map((d) => (
        <DoubtNote key={d} text={d} />
      ))}
      {late && (
        <Tag tone="caution" icon={<IconAlert size={14} />}>
          {copy.asOfAfterRead}
        </Tag>
      )}
      {p.stale && (
        <span className="flex items-start gap-1.5 text-caution-foreground">
          <IconAlert size={16} className="text-caution shrink-0 mt-0.5" />
          <span>
            <When iso={p.snapshot} lead={copy.card.stale.before} />
            {copy.card.stale.after}
          </span>
        </span>
      )}
    </span>
  );
  return { body, marks, label: w.deposits.detail(gershayim(p.name)) };
}

/** "הבנק כותב: ״אין אפשרות שבירה״": the bank's own words about a break. */
function BankWords({ quotes }: { quotes: readonly string[] }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-muted-foreground">{copy.breakDisclosure}</span>
      <PrintedQuotes quotes={quotes} />
    </span>
  );
}

/**
 * What every row of the table shares, said once (kit SharedFacts), in plain sentences (the designer's mocks): the facts no row tells apart
 * and the tax, and that the rate is no offer (a caution, in sight at every width); the rules behind them as one quiet line of chips at the
 * end. What the rate figure is (nominal, yearly, before tax) is the "?" of the rate's head from md, and stays here on a phone.
 */
function SharedBox({ products, shared, known, title, deposits }: { products: readonly ProductRowData[]; shared: Shared; known: ReadonlySet<string>; title: string; deposits: boolean }) {
  const p = products[0];
  if (!p) return null;
  const say = w.deposits.say;
  const renew = p.autoRenew.value ? (p.autoRenew.maxRenewals !== null ? say.renew.upTo(fmt.number(p.autoRenew.maxRenewals)) : say.renew.yes) : say.renew.no;
  const brk = breakText(p.breakTerms.penalty, products.every((x) => onlyAtExits(x.breakTerms.penalty, x.exitPoints.exists)));
  // what the rate figure is stands in the "?" of the rate's head from md (RateHead); a phone, with no heads, keeps it here
  const first = [shared.rateType ? say.rateType[p.rateType === "variable" ? "variable" : "fixed"] : null, shared.linkage && p.linkage === "none" ? say.unlinked[deposits ? "deposits" : "plans"] : null, shared.breakTerms && shared.autoRenew ? say.and(brk, renew) : shared.breakTerms ? `${brk}.` : shared.autoRenew ? `${renew}.` : null, shared.exits ? say.exits(exitsOf(p)) : null].filter(Boolean).join(" ");
  const rules = [...(shared.tax ? (p.taxBucket.rule_ids ?? []) : []), ...(shared.taxByLinkage ? (taxPerLinkage(products) ?? []).flatMap((x) => x.taxBucket.rule_ids ?? []) : []), ...(shared.breakTerms ? p.breakTerms.rules : []), "BANK-13"];
  const shown = [...new Set(rules)].filter((r) => known.has(r));
  const items: { key: string; text: ReactNode; className?: string }[] = [
    { key: "rate", text: say.rate, className: "md:hidden" },
    ...(first ? [{ key: "first", text: first }] : []),
    ...(shared.tax && taxWord(p.taxBucket.value) ? [{ key: "tax", text: <>{copy.labels.tax}: <Num value={p.taxBucket} display={taxWord(p.taxBucket.value)} /></> }] : []),
    ...(shared.taxByLinkage ? [{ key: "tax", text: <TaxByLinkage products={products} /> }] : []),
    ...(shared.conditions && p.conditions ? [{ key: "conditions", text: <><span>{copy.conditionsLead}</span> <PrintedText text={p.conditions} /></> }] : []),
    { key: "offer", text: copy.notAnOffer },
  ];
  const quotes = shared.breakTerms && shared.breakQuotes ? p.breakTerms.quotes : [];
  return (
    <SharedFacts
      plain
      title={title}
      items={items}
      foot={
        (shown.length > 0 || quotes.length > 0) && (
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            {shown.length > 0 && <RulesLine ids={shown} />}
            {quotes.length > 0 && (
              <Disclosure look="link" label={copy.breakDisclosure} summaryClassName="text-sm">
                <PrintedQuotes quotes={quotes} />
              </Disclosure>
            )}
          </span>
        )
      }
    />
  );
}

/** A rate column's head, or the caption over the rate columns, with a "?" that opens what the figure is over the card of the published
 *  rate (the card of the deposits page's "?" beside its rate). */
function RateHead({ label }: { label: string }) {
  const say = w.deposits.say;
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <HelpMark term={[DEPOSIT_TERMS.rate]} about={w.deposits.cols.rate} lead={say.rate} />
    </span>
  );
}

/** "מס על הריבית: בפיקדון לא צמוד, המס של ריבית לא צמודה; בפיקדון צמוד למדד, המס של ריבית צמודה. השיעורים בעמוד המדריך." */
function TaxByLinkage({ products }: { products: readonly ProductRowData[] }) {
  const each = taxPerLinkage(products) ?? [];
  return (
    <>
      {copy.labels.tax}:{" "}
      {each.map((p, i) => (
        <span key={p.linkage}>
          {i > 0 && "; "}
          {w.deposits.taxIn[p.linkage]}, <Num value={p.taxBucket} display={p.taxBucket.value === "linked_25" ? w.deposits.taxOf.linked : w.deposits.taxOf.unlinked} />
        </span>
      ))}
      . {w.deposits.taxRates}
    </>
  );
}

function PhoneRow({ row, shared, known, bands, amount, fromOnly }: { row: TableRow; shared: Shared; known: ReadonlySet<string>; bands: AmountBand[] | null; amount: string; fromOnly: boolean }) {
  const p = row.lines[0]!;
  const [open, setOpen] = useState(false);
  const detail = rowDetail(row, shared, known);
  const id = useId();
  const facts = [!shared.rateType && (p.rateType === "variable" ? w.deposits.variable : w.deposits.fixed), !shared.exits && `${copy.labels.exits}: ${exitsOf(p)}`].filter(Boolean);
  const tiles = bands
    ? bands.flatMap((b) => {
        const x = lineAt(row, b.key);
        return x ? [{ id: b.key, label: <AmountRange min={b.min} max={b.max} fromOnly={fromOnly} />, figure: <Rate p={x} inline />, dim: amount !== ALL && amount !== b.key }] : [];
      })
    : row.lines.map((x) => ({ id: x.id, label: <AmountRange min={x.amountMin} max={x.amountMax} />, figure: <Rate p={x} inline /> }));
  return (
    <ProductPhoneRow stacked roomy>
      <span className="flex items-start justify-between gap-2">
        <NameCell row={row} known={known} />
        {detail && <RowFoldButton open={open} onToggle={() => setOpen(!open)} marks={detail.marks} label={detail.label} controls={id} className="shrink-0 -me-2" />}
      </span>
      {facts.length > 0 && <span className={muted}>{facts.join(" · ")}</span>}
      <FigureLines items={tiles} />
      {detail && open && (
        <div id={id} className="pt-1">
          {detail.body}
        </div>
      )}
    </ProductPhoneRow>
  );
}

/** One bank's deposits or savings plans as one table. */
export function BankTable({ kind, products, known, asOf }: { kind: "deposits" | "savings"; products: readonly ProductRowData[]; known: ReadonlySet<string>; /** The latest "נכון ליום" of the bank's records, for the line under the heading. */ asOf: SiteValue | null }) {
  const rows = useMemo(() => tableRows(products), [products]);
  const shared = useMemo(() => sharedFacts(products), [products]);
  const bands = useMemo(() => sharedBands(rows), [rows]);
  const deposits = kind === "deposits";
  const [amount, setAmount] = useState(ALL);
  // one amount for every row: no amount column, and no choice of amount
  const oneAmount = !bands || bands.length === 1;
  const amountColumn = !bands && new Set(products.map(rangeKey)).size > 1;
  const groups = deposits ? kindGroups(rows) : [{ kind: "", rows: [...rows].sort((a, b) => (numberOf(a.lines[0]!.term) ?? 0) - (numberOf(b.lines[0]!.term) ?? 0)) }];
  // ranges that follow one another with no gap and run on with no top are said by where each starts
  const fromOnly = !!bands && bands.every((b, i) => (i === bands.length - 1 ? numberOf(b.max) === null : numberOf(b.max) !== null && numberOf(bands[i + 1]!.min) === numberOf(b.max)! + 1));
  const columns: ProductColumn[] = [
    { id: "name", head: deposits ? w.deposits.cols.deposit : w.deposits.cols.plan },
    ...(!deposits && !shared.term ? [{ id: "term", head: copy.labels.term, width: 7 }] : []),
    ...(!shared.rateType ? [{ id: "rateType", head: copy.labels.rateType, width: 6.5 }] : []),
    ...(amountColumn ? [{ id: "amount", head: w.deposits.cols.amount, width: 10 }] : []),
    ...(bands
      ? bands.map((b) => ({ id: `r:${b.key}`, head: <AmountRange min={b.min} max={b.max} fromOnly={fromOnly} />, band: w.deposits.cols.rateBand, bandHead: <RateHead label={w.deposits.cols.rateBand} />, width: 9, dim: amount !== ALL && amount !== b.key }))
      : [{ id: "rate", head: <RateHead label={w.deposits.cols.rate} />, width: 9 }]),
    ...(!shared.exits ? [{ id: "exits", head: copy.labels.exits, width: 9, wrap: true }] : []),
  ];
  const cellsOf = (row: TableRow, p: ProductRowData): ReactNode[] => [
    <NameCell row={row} known={known} />,
    ...(!deposits && !shared.term ? [termWords(p.term) ? <Num value={p.term} display={termWords(p.term)!} /> : copy.term.none] : []),
    ...(!shared.rateType ? [<RateType p={p} />] : []),
    ...(amountColumn ? [<AmountRange min={p.amountMin} max={p.amountMax} />] : []),
    ...(bands ? bands.map((b) => { const x = lineAt(row, b.key); return x ? <Rate p={x} /> : <span className={muted}>—</span>; }) : [<Rate p={p} />]),
    ...(!shared.exits ? [exitsOf(p)] : []),
  ];
  const tableRow = (row: TableRow): ProductRow => {
    const p = row.lines[0]!;
    const many = !bands && row.lines.length > 1;
    const detail = rowDetail(row, shared, known);
    return {
      key: row.key,
      cells: cellsOf(row, p),
      ...(detail ? { detail } : {}),
      phone: <PhoneRow row={row} shared={shared} known={known} bands={bands} amount={amount} fromOnly={fromOnly} />,
      ...(many ? { lines: { columns: [...(amountColumn ? ["amount"] : []), "rate"], rows: row.lines.map((x) => ({ key: x.id, cells: [...(amountColumn ? [<AmountRange min={x.amountMin} max={x.amountMax} />] : []), <Rate p={x} />] })) } } : {}),
    };
  };
  const countWords = (n: number) => (deposits ? w.units.deposits : w.units.plans)(n);
  return (
    <LabelSheetHost>
      <div className="flex flex-col gap-4">
        <p className={muted}>
          {countWords(rows.length)}
          {asOf && (
            <>
              {" · "}
              <NumAfter lead={w.deposits.asOf} value={asOf} />
            </>
          )}
        </p>
        <SharedBox products={products} shared={shared} known={known} deposits={deposits} title={deposits ? w.deposits.sharedDeposits : w.deposits.sharedPlans} />
        {bands && !oneAmount && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium" id="amount-pick">
              {w.deposits.amount}
            </span>
            {/* joined from 640 px (the designer's mock); on a phone the chips wrap, the joined row being wider than the screen */}
            {bands.length <= 3 && (
              <div className="hidden sm:block">
                <SegmentedControl labelledBy="amount-pick" fit check={false} className="whitespace-nowrap" options={[{ value: ALL, label: w.deposits.allAmounts }, ...bands.map((b) => ({ value: b.key, label: rangeText(b, fromOnly) }))]} value={amount} onChange={setAmount} />
              </div>
            )}
            <div className={bands.length <= 3 ? "sm:hidden" : undefined}>
              <ChoiceChips ids={[ALL, ...bands.map((b) => b.key)]} labels={{ [ALL]: w.deposits.allAmounts, ...Object.fromEntries(bands.map((b) => [b.key, <bdi key={b.key}>{rangeText(b, fromOnly)}</bdi>])) }} value={amount} onChange={setAmount} ariaLabel={w.deposits.amount} />
            </div>
          </div>
        )}
        <ProductTable columns={columns} groups={groups.map((g) => ({ key: g.kind || "all", ...(g.kind ? { heading: { title: <MixedName>{g.kind}</MixedName>, line: countWords(g.rows.length) } } : {}), rows: g.rows.map(tableRow) }))} />
      </div>
    </LabelSheetHost>
  );
}

/** Under a bank product's table: the same product at every bank, and what it is and how its interest is taxed (its guide page). */
export function BankLinks({ wrapperId, wrapperName, compare }: { wrapperId: string; wrapperName: string; /** The page that sets this product side by side at every bank, when the site has one. */ compare?: { to: string; label: string } }) {
  return (
    <p className="flex flex-wrap gap-x-6">
      {compare && <GoLink to={compare.to}>{compare.label}</GoLink>}
      <GoLink to={guidePath(wrapperId)}>{w.deposits.whatIsTax(wrapperName)}</GoLink>
    </p>
  );
}
