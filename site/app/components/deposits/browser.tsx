// The deposits page (D92): the controls, the period chart, the list's heading, the list, then the offers the amount does not open and the
// grid, both folded. The term, the amount, the kind of rate, the two "show also" chips, the reader's bank and the order are in the address
// (`?term=y2&amount=100000&kind=variable&conditional=0&linked=1&bank=leumi&sort=min`; the defaults left out), read once the page is in the
// browser: the page is pre-rendered without them. On a phone the controls fold into one line that says what is chosen.
import { useMemo, useRef, useState } from "react";
import { depositBrowser as t } from "../../copy";
import { MQ, useAddressParams, useMedia } from "../../lib/hooks";
import { useAddressSort } from "../../lib/list-sort";
import { DEFAULT_SORT, KIND_TERMS, SORT_IDS, START_KIND, START_TERM, TERMS, interestOn, interestText, isLinked, offersOf, offersPhrase, opens, periodBest, rowsOf, sortRows, type DbData, type DbOffer, type DbRow, type RateKind, type SortId, type TermId } from "../../lib/deposit-browser";
import { fmt } from "../../lib/format";
import { entered } from "../../lib/value";
import { Card, ChoiceChips, Disclosure, FilterChip, HelpMark, LabelSheetHost, NumberField, PeriodBars, PhoneFold, Section, SegmentedControl, SelectField, When, type PeriodBar } from "../kit";
import { NumberLegend, Num, Term } from "../provenance";
import { HELP_TERMS } from "../../lib/deposit-browser";
import { DepositGrid } from "./grid";
import { DepositList, FoldFoot, type ListContext, type ListRow } from "./list";

/** The rows shown before "עוד N הצעות": eight on a computer, six on a phone. */
const SHOWN = { table: 8, phone: 6 } as const;

export function DepositBrowser({ data }: { data: DbData }) {
  const { params: sp, update } = useAddressParams();
  const termParam = sp.get("term");
  const term: TermId = (TERMS as readonly string[]).includes(termParam ?? "") ? (termParam as TermId) : START_TERM;
  const amountParam = sp.get("amount");
  // any whole amount the reader types; "none" while the field is empty
  const amount: number | null = amountParam === "none" ? null : amountParam && /^\d+$/.test(amountParam) && Number(amountParam) > 0 ? Number(amountParam) : data.start;
  const kindParam = sp.get("kind");
  const kind: RateKind = kindParam === "variable" || kindParam === "fixed" ? kindParam : START_KIND;
  const withConditional = sp.get("conditional") !== "0";
  const withLinked = sp.get("linked") === "1";
  const bankParam = sp.get("bank");
  const myBank = data.banks.some((b) => b.id === bankParam) ? bankParam : null;
  const { chosen: sort, set: setSort, press } = useAddressSort(SORT_IDS, DEFAULT_SORT);
  const setTerm = (x: TermId) => update({ term: x === START_TERM ? null : x });
  const setAmount = (n: number | null) => update({ amount: n === null ? "none" : n === data.start ? null : String(n) });
  const setKind = (k: RateKind) => update({ kind: k === START_KIND ? null : k });
  const [expanded, setExpanded] = useState(false);
  const [lit, setLit] = useState<string | null>(null);
  // the table from md, the phone's rows under it; the pre-rendered page and its first render count as the table
  const wide = useMedia(MQ.md, true);
  const list = useRef<HTMLDivElement>(null);

  const ofTerm = useMemo(() => offersOf(data, term, kind), [data, term, kind]);
  const open = useMemo(() => (amount === null ? [] : ofTerm.filter((o) => opens(o, amount))), [ofTerm, amount]);
  const shut = useMemo(() => (amount === null ? [] : ofTerm.filter((o) => !opens(o, amount))), [ofTerm, amount]);
  const shows = (o: DbOffer) => withConditional || !o.limited;
  const conditionalCount = rowsOf(open.filter((o) => o.limited && !isLinked(o))).length;
  const linkedCount = rowsOf(open.filter((o) => isLinked(o) && shows(o))).length;
  const ranked = sortRows(rowsOf(open.filter((o) => !isLinked(o) && shows(o))), sort);
  const linked = withLinked ? sortRows(rowsOf(open.filter((o) => isLinked(o) && shows(o))), sort) : [];

  // the chart: each term's highest rate open to everyone at the amount and kind
  const bars: PeriodBar[] = TERMS.map((x) => {
    const { pick, gap } = periodBest(data, x, kind, amount);
    const bank = pick ? (data.banks.find((b) => b.id === pick.bank)?.name ?? pick.bank) : null;
    const rate = pick ? Number(pick.rate_offered.value) : null;
    const figure = rate !== null ? fmt.number(rate) : undefined;
    const note = bank ?? (gap ? (gap === "otherKind" ? t.chart.gap.otherKind[kind] : amount === null ? "" : t.chart.gap[gap]) : "");
    return { id: x, label: t.terms[x], short: t.termsShort[x], tiny: t.termsTiny[x], value: rate, figure, unit: "%", note, spoken: `${t.terms[x]}: ${rate !== null ? `${figure}%${t.chart.atBank}${bank}` : t.chart.none}` };
  });

  const best = periodBest(data, term, kind, amount).pick;
  const amountValue = amount !== null ? entered(amount, "nis", data.today, t.interest.inputs.amount) : null;
  const topRate = Math.max(0.0001, ...[...ranked, ...linked].map((r) => Number(r.offers[0]!.rate_offered.value) || 0));
  const ctx: ListContext = { term, amount: amount !== null && amountValue ? { n: amount, value: amountValue } : null, today: data.today, banks: data.banks, topRate, lit };

  // the fold: the first rows, then the reader's bank's rows wherever they stand, then "עוד N הצעות"
  const all: { row: DbRow; linked: boolean }[] = [...ranked.map((row) => ({ row, linked: false })), ...linked.map((row) => ({ row, linked: true }))];
  const first = wide ? SHOWN.table : SHOWN.phone;
  const shown = expanded ? all : all.filter((x, i) => i < first || x.row.bank === myBank);
  const hidden = all.length - shown.length;
  const topKey = ranked.find((r) => !r.offers[0]!.limited)?.key ?? ranked[0]?.key;
  const asRow = (row: DbRow): ListRow => ({ row, top: row.key === topKey && sort.id === "rate", mine: row.bank === myBank });

  const termFor = t.termFor[term];
  const kindWords = t.kindWords[kind];
  const otherKindExists = data.offers.some((o) => o.term === term && o.kind !== kind);
  const empty: { title: string; line: string } | null =
    amount === null
      ? { title: t.empty.noAmountTitle, line: t.empty.noAmount }
      : ofTerm.length === 0
        ? { title: `${t.empty.none}${termFor} ${kindWords}`, line: `${t.empty.none}${termFor} ${kindWords}.${otherKindExists ? ` ${t.empty.otherKindOnly[kind]}` : ""}` }
        : all.length === 0
          ? { title: `${t.empty.none}${termFor} ${kindWords}${t.empty.atAmount}${fmt.nisWhole(amount)}`, line: `${t.empty.none}${termFor} ${kindWords}${t.empty.atAmount}${fmt.nisWhole(amount)}.` }
          : null;

  const summary = amount === null ? t.empty.noAmountTitle : (
    <>
      <bdi dir="ltr">{fmt.nisWhole(amount)}</bdi> {termFor}, {kindWords}
    </>
  );
  const pick = amount !== null && data.amounts.some((a) => a.value === amount) ? String(amount) : null;

  return (
    <LabelSheetHost>
      <div className="flex flex-col gap-6">
        <PhoneFold summary={summary} more={t.fold.change} less={t.fold.close}>
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
            <div className="md:w-56 shrink-0">
              <NumberField label={t.controls.amount} unit="nis" value={amount} isEntered={amount !== data.start} start={null} optional groupAsTyped validate={() => null} onCommit={(n) => setAmount(n > 0 ? Math.round(n) : null)} onReset={() => setAmount(null)} />
            </div>
            <ChoiceChips wrap ariaLabel={t.controls.picks} ids={data.amounts.map((a) => String(a.value))} labels={Object.fromEntries(data.amounts.map((a) => [String(a.value), <bdi dir="ltr">{fmt.nisWhole(a.value as number)}</bdi>]))} value={pick} onChange={(v) => setAmount(Number(v))} />
          </div>
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-end gap-4 md:gap-x-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <span id="deposit-kind-label">{t.controls.kind}</span>
                <HelpMark term={KIND_TERMS} about={t.controls.kind} />
              </span>
              <SegmentedControl labelledBy="deposit-kind-label" check={false} fit options={(["fixed", "variable"] as const).map((k) => ({ value: k, label: t.kinds[k] }))} value={kind} onChange={setKind} />
            </div>
            {/* the phone has no column heads to press: its order is a choice here */}
            <div className="md:hidden flex flex-col gap-1.5">
              <span id="deposit-sort-label" className="text-sm text-muted-foreground">
                {t.controls.sort}
              </span>
              <SegmentedControl labelledBy="deposit-sort-label" check={false} options={SORT_IDS.map((id) => ({ value: id, label: t.sortPhone[id] }))} value={sort.id} onChange={(id) => setSort({ id, dir: 1 })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span id="deposit-show-label" className="text-sm text-muted-foreground">
                {t.controls.show}
              </span>
              <div role="group" aria-labelledby="deposit-show-label" className="flex flex-wrap gap-2">
                <FilterChip on={withConditional} count={conditionalCount} onClick={() => update({ conditional: withConditional ? "0" : null })}>
                  {t.controls.conditional}
                </FilterChip>
                <FilterChip on={withLinked} count={linkedCount} onClick={() => update({ linked: withLinked ? null : "1" })}>
                  {t.controls.linked}
                </FilterChip>
              </div>
            </div>
            <div className="md:w-48">
              <SelectField wide label={<span className="text-sm text-muted-foreground">{t.controls.myBank}</span>} none={t.controls.noBank} options={data.banks.map((b) => ({ id: b.id, name: b.name }))} value={myBank} onChange={(id) => update({ bank: id })} />
            </div>
          </div>
        </PhoneFold>

        <section aria-labelledby="deposit-chart-title" className="flex flex-col gap-2">
          <p id="deposit-chart-title" className="text-sm text-muted-foreground">
            {amount === null ? (
              t.chart.titleNoAmount[kind]
            ) : (
              <>
                {t.chart.title[kind]}
                <bdi dir="ltr">{fmt.nisWhole(amount)}</bdi>
              </>
            )}
          </p>
          <PeriodBars className="max-md:-mx-2" bars={bars} value={term} onChange={(x) => setTerm(x as TermId)} empty={t.chart.none} label={t.chart.axis} chosenWord={t.chart.chosen} />
          <p aria-hidden="true" className="text-sm text-muted-foreground text-center">
            {t.chart.axis}
          </p>
        </section>

        <Section
          title={empty ? empty.title : <Heading count={ranked.length} best={best} ctx={ctx} />}
          action={
            <p className="hidden md:block text-sm text-muted-foreground">
              <When iso={data.read} lead={t.read} />
            </p>
          }
        >
          {/* a head pressed while the list is scrolled under the header brings the list back to its first row */}
          <div ref={list} className="scroll-mt-14 lg:scroll-mt-16">
            {empty ? (
              <Card className="py-8">
                <p>{empty.line}</p>
              </Card>
            ) : (
              <DepositList
                ranked={shown.filter((x) => !x.linked).map((x) => asRow(x.row))}
                linked={shown.filter((x) => x.linked).map((x) => asRow(x.row))}
                ctx={ctx}
                sort={sort}
                onSort={(id: SortId) => press(id, sort, list.current)}
                foot={() => (hidden > 0 || expanded ? <FoldFoot open={expanded} more={`${t.fold.more}${offersPhrase(hidden)}`} onToggle={() => setExpanded((x) => !x)} /> : null)}
              />
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <NumberLegend />
            <p className="md:hidden">
              <When iso={data.read} lead={t.read} />.
            </p>
            {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
            <p className="md:hidden">
              {t.help.phoneLead} <Term id={HELP_TERMS.rate}>{t.help.rate}</Term> · <Term id={HELP_TERMS.exits}>{t.help.exits}</Term> · <Term id={HELP_TERMS.break}>{t.help.break}</Term>
            </p>
          </div>
        </Section>

        {shut.length > 0 && (
          <Disclosure label={`${offersPhrase(rowsOf(shut).length)} ${t.closed.before}${amount !== null ? fmt.nisWhole(amount) : ""}`} labelClassName="font-semibold" className="flex flex-col gap-3">
            <div className="pt-2">
              <DepositList ranked={sortRows(rowsOf(shut), sort).map((row) => ({ row, top: false, mine: row.bank === myBank }))} linked={[]} ctx={{ ...ctx, amount: null, topRate: Math.max(0.0001, ...shut.map((o) => Number(o.rate_offered.value) || 0)) }} sort={null} />
            </div>
          </Disclosure>
        )}

        <DepositGrid
          data={data}
          kind={kind}
          amount={amount}
          onCell={(bank, x) => {
            setTerm(x);
            setExpanded(true);
            setLit(bank);
            requestAnimationFrame(() => requestAnimationFrame(() => {
              const row = [...document.querySelectorAll<HTMLElement>(`[data-row-of="${bank}"]`)].find((el) => el.offsetParent !== null);
              row?.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
            }));
            setTimeout(() => setLit(null), 1800);
          }}
        />
      </div>
    </LabelSheetHost>
  );
}

/** "23 הצעות לשנה. הגבוהה: 3.25% בבנק ירושלים, כ־325 ₪ על 10,000 ₪". */
function Heading({ count, best, ctx }: { count: number; best: DbOffer | null; ctx: ListContext }) {
  const bank = best ? ctx.banks.find((b) => b.id === best.bank)?.name : null;
  const interest = best && ctx.amount ? interestOn(best, ctx.amount.n, ctx.amount.value, ctx.today) : null;
  return (
    <>
      {offersPhrase(count)} {t.termFor[ctx.term]}.
      {best && (
        <>
          {" "}
          {t.heading.best}
          <Num value={best.rate_offered} />
          {t.heading.atBank}
          {bank}
          {interest && ctx.amount && (
            <>
              , <Num value={interest} display={interestText} />
              {t.heading.on}
              <bdi dir="ltr">{fmt.nisWhole(ctx.amount.n)}</bdi>
            </>
          )}
        </>
      )}
    </>
  );
}
