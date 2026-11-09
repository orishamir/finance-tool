// The deposits page (D92): the controls, the count, the list, the notes and the grid. The term, the amount, the kind of rate and the order are
// in the address (`?term=y2&amount=100000&kind=variable&sort=min`; the defaults left out), read once the page is in the browser, as the
// track browser does: the page is pre-rendered without them. One term: one list, then the linked offers on their own. Every term: the
// offers under their banks. On a phone the controls fold into one line that says what is chosen.
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { depositBrowser as t, r4catalogue as rc } from "../../copy";
import { useAddressParams } from "../../lib/hooks";
import { pressSort, sortFromParams, sortParams } from "../../lib/list-sort";
import { HELP_TERMS, KIND_TERMS, TERMS, amountText, banksPhrase, defaultSort, isLinked, offersOf, offersPhrase, openCount, opens, orderLine, rowsOf, sortRows, sortable as sortableIn, standing, SORT_IDS, type DbData, type DbOffer, type RateKind, type SortId, type SortState, type TermId } from "../../lib/deposit-browser";
import { FilterChip, HelpMark, LongestCase, MixedName, PhoneFold, SelectField } from "../kit";
import { Term } from "../provenance";
import { DepositGrid } from "./grid";
import { BankLine, DepositList, GroupLine, type ListPart } from "./list";

/** The term the page opens on: a year, the plain deposit most guides speak of. */
const START_TERM: TermId = "y1";
/** The rows drawn at once when the list is new; the rest the moment after, in a transition, so a press is answered at once. */
const FIRST_ROWS = 14;
/** How long a row the grid scrolled to stays lit (the CSS animation's length). */
const LIT_MS = 1800;

export function DepositBrowser({ data }: { data: DbData }) {
  const { params: sp, update } = useAddressParams();
  const termParam = sp.get("term");
  const all = termParam === "all";
  const term: TermId | null = all ? null : (TERMS as readonly string[]).includes(termParam ?? "") ? (termParam as TermId) : START_TERM;
  const amountParam = Number(sp.get("amount"));
  const amount = data.amounts.some((a) => a.value === amountParam) ? amountParam : data.start;
  const kind: RateKind = sp.get("kind") === "variable" ? "variable" : "fixed";
  const sortable = sortableIn(all);
  const asked = sortFromParams(sp, SORT_IDS);
  const sort: SortState = asked && sortable.has(asked.id) ? asked : defaultSort(all);
  const setTerm = (x: TermId | null) => update({ term: x === null ? "all" : x === START_TERM ? null : x });
  const setAmount = (n: number) => update({ amount: n === data.start ? null : String(n) });
  const setKind = (k: RateKind) => update({ kind: k === "fixed" ? null : k });
  const setSort = (s: SortState) => update(sortParams(s, defaultSort(all)));

  const bankName = (id: string) => data.banks.find((b) => b.id === id)?.name ?? id;
  const shown = useMemo(() => offersOf(data, term, kind), [data, term, kind]);
  const open = useMemo(() => shown.filter((o) => opens(o, amount)), [shown, amount]);
  const shut = useMemo(() => shown.filter((o) => !opens(o, amount)), [shown, amount]);
  const rows = (offers: DbOffer[], s: SortState = sort) => sortRows(rowsOf(offers), s, bankName);
  const [foldOpen, setFoldOpen] = useState(false);
  const amountWords = amountText(amount);
  // one term: the offers everyone can open ranked by rate, then those only for some customers (new joiners, a closed-system account), then
  // the linked ones, whose rate is on top of the index, each group ranked among itself. Every term: a bank's rows in that order (sortRows)
  const linked = open.filter(isLinked);
  const limited = open.filter((o) => standing(o) === 1);
  const parts: ListPart[] = all
    ? data.banks.map((b) => {
        const mine = open.filter((o) => o.bank === b.id);
        return { key: b.id, underBank: true, rows: rows(mine), heading: { title: <Link to={`/companies/${b.id}`} className="hover:underline inline-flex items-center min-h-target min-w-11 md:min-h-0 md:min-w-0 md:tap-area"><MixedName>{b.name}</MixedName></Link>, line: <BankLine bank={b} count={mine.length} /> } };
      })
    : [
        { key: "open", rows: rows(open.filter((o) => standing(o) === 0)) },
        { key: "limited", rows: rows(limited), heading: { title: t.limitedGroup.title, line: <GroupLine count={limited.length}>{t.limitedGroup.line}</GroupLine> } },
        { key: "linked", rows: rows(linked), linkedHead: true, heading: { title: <Term id={HELP_TERMS.linked}>{t.linkedGroup.title}</Term>, line: <GroupLine count={linked.length}>{t.linkedGroup.line}</GroupLine> } },
      ];
  parts.push({ key: "shut", rows: rows(shut, all ? { id: "term", dir: 1 } : sort), fold: { open: foldOpen, onToggle: () => setFoldOpen((x) => !x) }, heading: { title: `${offersPhrase(shut.length)} ${t.closed.before}${amountWords}` } });

  const listKey = `${term ?? "all"}|${kind}|${amount}`;
  const [grown, setGrown] = useState("");
  const limit = grown === listKey ? Infinity : FIRST_ROWS;
  useEffect(() => {
    if (grown !== listKey) startTransition(() => setGrown(listKey));
  }, [grown, listKey]);

  // a cell of the grid: its term is chosen, the list grows in full, and the bank's first row comes into view and lights for a moment
  const [lit, setLit] = useState<string | null>(null);
  const [goTo, setGoTo] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pickCell = (bank: string, x: TermId) => {
    if (term !== x) setTerm(x);
    // the bank's rows of the term in this kind that the amount does not open are in the folded group: it opens
    const inShut = data.offers.some((o) => o.bank === bank && o.term === x && o.kind === kind && !opens(o, amount));
    const inOpen = data.offers.some((o) => o.bank === bank && o.term === x && o.kind === kind && opens(o, amount));
    if (inShut && !inOpen) setFoldOpen(true);
    setGrown(`${x}|${kind}|${amount}`);
    setGoTo(bank);
  };
  useEffect(() => {
    if (!goTo) return;
    const row = [...document.querySelectorAll<HTMLElement>(`[data-row-of="${goTo}"]`)].find((el) => el.offsetParent !== null);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setLit(goTo);
    setGoTo(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLit(null), LIT_MS);
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  const banksOpen = new Set(open.map((o) => o.bank)).size;
  const count = (n: number, b: number) => `${n === 0 ? `${t.count.none} ${t.count.at}${amountWords}.` : `${t.count.at}${amountWords} ${t.count.canOpen} ${offersPhrase(n)} ${t.count.of} ${banksPhrase(b)}.`} ${t.count.notAnOffer}`;
  // the phone's folded controls: "שנה · מ־10,000 ₪ · ריבית קבועה · מיון לפי ריבית"
  const summary = (
    <>
      {term ? t.terms[term] : t.controls.termAll} · {rc.amount.from}
      <bdi dir="ltr">{amountWords}</bdi> · {t.fold.kinds[kind]} · {t.fold.sort}
      {t.sorts[sort.id].label}
    </>
  );
  const longestOrder = SORT_IDS.flatMap((id) => ([1, -1] as const).flatMap((dir) => [true, false].map((a) => orderLine({ id, dir }, a))));
  return (
    <div className="flex flex-col gap-4">
      <PhoneFold summary={summary} more={t.fold.more} less={t.fold.less}>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" id="db-term">
            {t.controls.term}
          </span>
          <div role="group" aria-labelledby="db-term" className="flex flex-wrap gap-2">
            <FilterChip on={all} count={openCount(data, null, kind, amount)} onClick={() => setTerm(null)}>
              {t.controls.termAll}
            </FilterChip>
            {TERMS.map((x) => (
              <FilterChip key={x} on={term === x} count={openCount(data, x, kind, amount)} onClick={() => setTerm(x)}>
                {t.terms[x]}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" id="db-amount">
            {t.controls.amount}
          </span>
          <div role="group" aria-labelledby="db-amount" className="flex flex-wrap gap-2">
            {data.amounts.map((a) => (
              <FilterChip key={String(a.value)} on={a.value === amount} onClick={() => setAmount(a.value as number)}>
                <bdi dir="ltr">{amountText(a.value as number)}</bdi>
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium inline-flex items-center gap-1" id="db-kind">
            {t.controls.kind}
            <HelpMark term={KIND_TERMS} about={t.controls.kind} />
          </span>
          <div role="group" aria-labelledby="db-kind" className="flex flex-wrap gap-2">
            {(["fixed", "variable"] as const).map((k) => (
              <FilterChip key={k} on={kind === k} count={openCount(data, term, k, amount)} onClick={() => setKind(k)}>
                {t.kinds[k]}
              </FilterChip>
            ))}
          </div>
        </div>
        <SelectField className="md:hidden" wide label={t.controls.sort} options={SORT_IDS.filter((id) => sortable.has(id)).map((id) => ({ id, name: t.sorts[id].label }))} value={sort.id} onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })} />
      </PhoneFold>

      <div className="flex flex-col gap-1 pt-1">
        {/* from md the number of offers stands beside the first column's head; a phone's rows have no heads, so it is said here */}
        <LongestCase className="md:hidden" cases={[<p key="a" className="text-sm">{count(shown.length, data.banks.length)}</p>, <p key="b" className="text-sm">{count(0, 0)}</p>]}>
          <p className="text-sm">{count(open.length, banksOpen)}</p>
        </LongestCase>
        <p className="hidden md:block text-sm">{t.count.notAnOffer}</p>
        <LongestCase cases={longestOrder.map((line, i) => <p key={i} className="text-sm">{line}</p>)}>
          <p className="text-sm text-muted-foreground">{orderLine(sort, all)}</p>
        </LongestCase>
      </div>
      {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
      <p className="md:hidden text-sm text-muted-foreground">
        {t.help.phoneLead} <Term id={HELP_TERMS.rate}>{t.help.rate}</Term> · <Term id={HELP_TERMS.exits}>{t.help.exits}</Term> · <Term id={HELP_TERMS.break}>{t.help.break}</Term>
      </p>
      <div className="scroll-mt-14 lg:scroll-mt-16">
        <DepositList parts={parts} all={all} sort={sort} sortable={sortable} onSort={(id) => setSort(pressSort(sort, id))} banks={data.banks} lit={lit} limit={limit} count={open.length} />
      </div>
      <DepositGrid data={data} kind={kind} amount={amount} amountText={amountWords} term={term} onTerm={(x) => setTerm(x)} onCell={pickCell} />
    </div>
  );
}
