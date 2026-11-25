// The index page's answer: the chosen pair's receipt (F-91, F-106, F-129, F-130), one line each, top to bottom, to one total: what was
// paid in, what the index added before any cost, what the account and the fund took (and, beside the account's fees, what the cash waiting
// for a whole unit did, F-109, not a fee), all in the shekels of the horizon; then what the inflation takes from what they leave on the
// way to today's money, the tax in today's money (F-91's state), and what is left, in today's money. Nothing stands under the
// total: a "?" beside it says in what money it is and, where it rests on it, that the dollar holds still (a caution "?"), and its sheet
// holds the gain. The figures follow the plan as a slider moves (the pair is priced once per plan for this card and what else reads it,
// `pairCostsKept`), and they add up as a reader adds them (lib/receipt).
// From 1280 px it is a ticket across the page's column, above the two lists and the ruler: the account's part at the start side and the
// fund's at the end side, each with its facts as labels under its name and its own lines (each fee and its rate), and the lines that add
// up to the total in the middle. Below 1280 px it is paper above the lists with the middle's lines only, each part (the same facts and
// lines) behind a tap on its name; its stub at the screen's foot keeps what is left in sight and leads back to it.
import { Fragment, type ReactNode, type Ref, type RefObject } from "react";
import { brands, invest as c, site } from "../../copy";
import { fmt, wholeSum } from "../../lib/format";
import { gapListFor, pricedVariable, accountSum, pairCostsKept, type FundWay, type InvestView, type PairCosts } from "../../lib/invest";
import { priced } from "../../lib/stretch";
import { assertNever, type FundRecord } from "@finance-tool/schema";
import { startsDeal, type IndicesBundle, type WorkbenchInputs } from "../../lib/providers";
import { rateWords, type RatePart, type RateWords } from "../../lib/rate-words";
import { accountLinesOf, receiptAmounts, receiptChain, takenWords, type AccountLine, type ReceiptChain } from "../../lib/receipt";
import { computed, differenceOf, ownBy, sumOf, type SiteValue } from "../../lib/value";
import { Num, ShortRow, StateTag, shortRow } from "../provenance";
import { DocLink, FEE_WORDS_HELP, HelpMark, LabelChip, LeftOutLine, MixedName, PartFacts, ProductIdLink, ReceiptLine, ReceiptPaper, ReceiptRule, ReceiptStub, ReceiptTicket, SourcedTag, Tag, TicketPart, When } from "../kit";
import { isCustomFund } from "../../lib/custom-entries";
import { allFunds, GapCell, gapNoteOf, gapStateOf, labelsOf, mayaHrefOf, pairVerdict, phoneOf, totalNoteOf, whole, type Pick } from "./pair";
import { OptionTag } from "./parts";
import { brokerLabels } from "../../lib/labels";
import { partName } from "./cost-lines";
import { providerName } from "./sections";
import { fundFeeItems } from "./funds";
import { termsLeftOut, useDealAccounts } from "./deal-account";

/** The names `data-anchor` gives the two lists, by which the ruler between them finds their rows. */
export const ANCHOR = { accounts: "accounts", funds: "funds" } as const;

/** A cost line's amount: what was taken with a minus, a line under zero with a plus (lib/receipt). */
const minus = takenWords;

/** One part of a rate in words: the figure (it opens the house's price list) and what it is of. */
function RatePartWords({ part, house }: { part: RatePart; house: string }) {
  const r = c.rate;
  const fig = <Num value={ownBy({ ...part.value } as SiteValue, house)} />;
  const per = part.per ? <> {r.per[part.per]}</> : null;
  if (part.kind === "rate") return <>{fig}{per}</>;
  if (part.kind === "cap") return <>{r.cap.before} {fig} {r.cap.after}</>;
  // "3.30 $ להמרה של עד 99 $": the sum it holds up to is the list's own figure too
  if (part.kind === "flat" && part.upTo) return <>{fig} {r.flat[part.per ?? "eachTrade"]} <Num value={ownBy({ ...part.upTo } as SiteValue, house)} display={wholeSum(part.upTo.unit)} /></>;
  if (part.kind === "spread") return <>{r.spread} {fig}</>;
  return <>{part.kind === "min" ? r.min : r.max} {fig}{per}</>;
}

/** A line's rates, the standing order's first: "בהוראת קבע: 0% · בפעולה אחרת: 0.07% מכל פעולה, מינימום 2 ₪". */
function RateLine({ words, house }: { words: RateWords[]; house: string }) {
  const two = words.length > 1;
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " · "}
          {w.standing ? `${c.rate.standing} ` : two ? `${c.rate.regular} ` : null}
          {w.parts.map((p, k) => (
            <Fragment key={k}>
              {k > 0 && ", "}
              <RatePartWords part={p} house={house} />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  );
}

/** The verdict on the chosen pair in today's words, as the headline above the lists says it; `top`: the pair is among the cheapest. */
export function verdictOf(v: ReturnType<typeof pairVerdict>, chosen: boolean): { top: boolean; words: ReactNode } {
  const { onBest, tie, tied, n, nFunds, moreIfOther } = v;
  const top = onBest || (chosen && tied);
  const words: ReactNode = chosen ? (
    top ? (
      <>{c.pair.yours} · {tie || tied ? c.pair.tiedWith : c.pair.cheapestTag}</>
    ) : (
      <>
        {c.pair.yours} · {moreIfOther && <Num value={moreIfOther} display={fmt.signedNisWhole} />} {c.pair.moreIfCheapest}
      </>
    )
  ) : onBest ? (
    tie ? c.pair.tieTop(n, nFunds) : c.pair.cheapestStar
  ) : (
    c.shownPair(false).name
  );
  return { top, words };
}

/**
 * The fund's fees as rows under its line, as the account's are: a name, the leader, the rate. A foreign fund's "אין" and "לא נאסף" in
 * place of a rate are said in a "?" beside the first of them (wording.md: a note beside what it qualifies).
 */
function feeRows(rec: FundRecord, bundle: IndicesBundle, today: string) {
  const items = fundFeeItems(rec, { inline: true, priced: pricedVariable(rec, gapListFor(bundle, rec), today), today });
  const noted = rec.domicile !== "IL" && !isCustomFund(rec) ? items.find((it) => it.missing)?.id : undefined;
  return items.map((it) => (
    <ReceiptLine
      key={it.id}
      size="sm"
      label={
        it.id === noted ? (
          // the "?" stays on the line of the name's last word
          <>
            {it.name.slice(0, it.name.lastIndexOf(" ") + 1)}
            <span className="whitespace-nowrap">
              {it.name.slice(it.name.lastIndexOf(" ") + 1)}
              <HelpMark about={c.pair.colFees} text={FEE_WORDS_HELP.text} rules={FEE_WORDS_HELP.rules} className="ms-1" />
            </span>
          </>
        ) : (
          it.name
        )
      }
      value={it.figure}
    />
  ));
}

type Costs = NonNullable<ReturnType<typeof pairCostsKept>>;

/**
 * A figure of the receipt's chain in the shekels of the horizon: an F-91 figure, a value at the horizon divided by `I_T`, times `I_T` (F-06
 * read back), its sheet listing the figure in today's money and the index (`pc.index`, F-03, which the plan's inflation sets).
 */
export function nominalOf(pc: Costs, v: SiteValue, label: string, today: string): SiteValue {
  const n = typeof v.value === "number" && typeof pc.index.value === "number" ? v.value * pc.index.value : null;
  return computed(n, "nis", "F-129", { [c.receipt.nominal.today]: v, [c.pair.indexInput]: pc.index }, { today, about: c.receipt.nominal.about(label) });
}

/** What the index added before any cost, in the shekels of the horizon: F-91's X there less the deposits as they are paid (F-05). */
export function addedOf(pc: Costs, today: string): SiteValue {
  return differenceOf([c.pair.baseInput, whole(nominalOf(pc, pc.baseValue, c.pair.baseInput, today))], [c.pair.paidIn, whole(pc.paidInNominal)], "F-129", { today, about: c.receipt.added, lead: c.receipt.addedLead });
}

/** The gain, in today's money: what is left less what was paid in at today's prices (F-106), which the deposits' line is not. */
function gainOf(pc: Costs, today: string): SiteValue {
  return differenceOf([c.receipt.left, whole(pc.left)], [c.receipt.paidInToday, whole(pc.paidIn)], "F-91", { today, about: c.receipt.gain });
}

/**
 * What is left, in today's money, as its sheet opens it: what was paid in at today's prices (F-106) and the gain, which add up to it, the
 * gain opening the run's own figure. It carries the run's rules, labels and notes, which the figure rests on.
 */
export function leftOf(pc: Costs, today: string): SiteValue {
  const run = pc.left;
  return sumOf({ [c.receipt.paidInToday]: whole(pc.paidIn), [c.receipt.gain]: gainOf(pc, today) }, "F-91", { today, about: c.receipt.leftAbout, rules: run.rulesUsed, statements: run.statements, flags: run.flags, labels: run.labels });
}

/** The tax line, in today's money (F-91's state); its sheet says so, and that it holds the surtax where the income with the gain passes its threshold (F-43). */
export function taxOf(pc: Costs): SiteValue {
  return { ...pc.tax, about: pc.distributes ? c.receipt.taxSheet.payouts : c.receipt.taxSheet.sale };
}

/**
 * What the lines above the inflation leave, in the shekels of the horizon (F-129's `B^nom`): the sum of those lines as the receipt writes
 * them, whole shekels each, so its sheet lists each line, the costs as the amounts they take.
 */
function beforeTaxOf(pc: Costs, ch: ReceiptChain, today: string): SiteValue {
  const at = (v: SiteValue, n: number): SiteValue => ({ ...v, value: n });
  const r = ch.nominal;
  const nom = (v: SiteValue, label: string, n: number) => at(nominalOf(pc, v, label, today), n);
  const lines: Record<string, SiteValue> = {
    [c.pair.paidIn]: at(pc.paidInNominal, r.paidIn),
    [c.receipt.added]: addedOf(pc, today),
    [c.receipt.parts.account]: nom(accountSum(pc, c.pair.who.account, today), c.receipt.parts.account, r.account),
    ...(pc.waiting && r.waiting !== 0 ? { [c.pair.waiting]: nom(pc.waiting, c.pair.waiting, r.waiting) } : {}),
    [c.receipt.parts.fund]: nom(pc.fund, c.receipt.parts.fund, r.fund),
  };
  return computed(ch.beforeTax, "nis", "F-129", lines, { today, about: c.receipt.beforeTax.nominal, lead: c.receipt.beforeTax.lead });
}

/**
 * What bringing what the lines above leave to today's money takes (F-130): that value in the shekels of the horizon (`beforeTaxOf`) less the
 * same value in today's money, what is left and the state. Each input holds the whole shekels the receipt writes.
 */
export function inflationOf(pc: Costs, ch: ReceiptChain, taxName: string, today: string): SiteValue {
  const at = (v: SiteValue, n: number): SiteValue => ({ ...v, value: n });
  const b = c.receipt.beforeTax;
  const real = sumOf({ [c.receipt.left]: at(pc.left, ch.left), [taxName]: at(taxOf(pc), ch.tax) }, "F-130", { today, about: b.today });
  return differenceOf([b.nominal, beforeTaxOf(pc, ch, today)], [b.today, real], "F-130", { today, about: c.receipt.inflation, lead: c.receipt.inflationLead });
}

/** The label families a fund's part shows after its kind, in this order; a family the fund has no label in shows nothing. */
const FUND_FAMILIES = ["follow", "payout", "currency", "tax"] as const;

/**
 * The account's facts: a standing order's price where the monthly deposit is bought on one, the house's labels, a phone-only purchase
 * (its source behind the tag); then, in a sheet, the price list, with the day it was collected, opening it (on the ticket, beside the caption). The person's own deal is named in the
 * entered ink in the part's head, not here. Not a kit piece: what it lists is the index page's reading of an account (its labels, its
 * price list, a deal), and only the receipt's account part shows it.
 */
function AccountFacts({ view, bundle, plan, pick, refs }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; /** Its price list among the details (a sheet), or left to the part's caption (the ticket). */ refs: boolean }) {
  const house = providerName(view, pick.house);
  if (!house) return null;
  const at = allFunds(view).find((f) => f.rec.id === pick.fund)?.byHouse[pick.house];
  const phone = phoneOf(view, bundle, pick);
  const labels = [
    priced(at) && at.standing && plan.monthly > 0 ? <Tag key="standing">{c.pair.standingTag}</Tag> : null,
    ...brokerLabels(house, false).map((l) => <LabelChip key={l.id} label={l} />),
    phone ? <SourcedTag key="phone" value={phone}>{c.pair.phoneTag}</SourcedTag> : null,
  ];
  return <PartFacts labels={labels} details={[refs ? <AccountRefs key="refs" view={view} bundle={bundle} pick={pick} /> : null]} />;
}

/**
 * The account's price list, with the day it was collected, opening it: on the ticket beside the part's caption, in a sheet among its
 * details. Under it, where something its price leaves out can change what some reader pays (D106), the line that says how many, whose
 * words open the house's terms with them open, or, where no deal starts from its price list (`startsDeal`), the line's own sheet.
 */
function AccountRefs({ view, bundle, pick }: { view: InvestView; bundle: IndicesBundle; pick: Pick }) {
  const house = providerName(view, pick.house);
  const snap = bundle.snapshots.find((s) => s.id === pick.house);
  const dealApi = useDealAccounts();
  if (!house || !snap || house.custom) return null;
  const left = termsLeftOut(snap, allFunds(view).find((f) => f.rec.id === pick.fund)?.byHouse[pick.house]);
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <DocLink look="inline" source={snap.tariff}>
        <When iso={snap.snapshot} lead={c.chosen.collected} />
      </DocLink>
      {left && left.changes.length > 0 && dealApi && <LeftOutLine view={left} house={house.short} {...(startsDeal(snap) ? { opens: () => dealApi.open({ terms: pick.house, leftOut: true }) } : {})} />}
    </span>
  );
}

/**
 * The fund's facts: its kind and its labels (how it tracks, what it does with dividends, the currency hedge, how it is taxed, each opening
 * what it means and its rules), and a fund the person typed marked as theirs; then its number (opening its page at the exchange), its
 * document, its yield where it pays out, its gap from the index with its years (a figure that opens its source, a "?" that says what it is
 * measured against). Not a kit piece: what it lists is the index page's reading of a fund record (its labels, its gap
 * list, its document), and only the receipt's fund part shows it.
 */
/** The fund's number, opening its page, and its own document: on the ticket beside the part's caption, in a sheet among its details. */
function FundRefs({ fund }: { fund: FundWay }) {
  const doc = isCustomFund(fund.rec) ? null : (fund.rec.fees.fixed_management?.source ?? null);
  if (!fund.number && !doc) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {fund.number && (
        <span className="inline-flex items-center gap-1">
          {c.chosen.number} <ProductIdLink id={fund.number} href={mayaHrefOf(fund)} label={brands.funds.mayaLink(fund.number)} />
        </span>
      )}
      {doc && (
        <DocLink look="inline" source={doc}>
          {c.chosen.isReport(doc.title) ? c.chosen.fundDoc : c.chosen.fundDocOther}
        </DocLink>
      )}
    </span>
  );
}

function FundFacts({ view, bundle, fund, refs }: { view: InvestView; bundle: IndicesBundle; fund: FundWay; /** Its number and document among the details (a sheet), or left to the part's caption (the ticket). */ refs: boolean }) {
  const today = bundle.today;
  const own = labelsOf(view, fund, bundle);
  const list = gapListFor(bundle, fund.rec);
  const state = gapStateOf(fund.rec, list);
  const labels = [
    <OptionTag key="kind" option={fund.option} />,
    ...FUND_FAMILIES.flatMap((g) => own.filter((l) => l.family === g)).map((l) => <LabelChip key={l.id} label={l} />),
    // a fund the person typed: its name in the entered ink, and in words
    isCustomFund(fund.rec) ? <StateTag key="entered" state="entered" /> : null,
  ];
  const details = [
    refs ? <FundRefs key="refs" fund={fund} /> : null,
    // a fund that pays out: its yield as its manager reports it
    fund.rec.distribution ? (
      <span key="yield">
        {c.pair.colYield} <Num value={ownBy(fund.rec.distribution.yield as SiteValue, fund.rec.manager)} />
      </span>
    ) : null,
    <span key="gap" className="inline-flex items-baseline gap-1.5">
      {state === "net" || state === "gross" ? c.kinds.gapHead[state] : c.kinds.colGap}
      <GapCell rec={fund.rec} today={today} list={list} />
      <HelpMark about={c.kinds.colGap} text={gapNoteOf([fund.rec], [state])} className="self-center" />
    </span>,
  ];
  return <PartFacts labels={labels} details={details} />;
}

/** An account line's name: a deal's fee by its own name, a price list's line by its part's, the remainder as itself. */
function accountLineName(l: AccountLine): string {
  switch (l.kind) {
    case "deal":
      return l.name;
    case "list":
      return partName(l.line) ?? "";
    case "remainder":
      return c.pair.remainder;
    default:
      return assertNever(l);
  }
}

/** The words under an account line: a deal's fee as the deal prices it, a price list's line at its rate; none under the remainder. */
function accountLineSub(l: AccountLine, at: { pc: PairCosts; plan: WorkbenchInputs; pick: Pick; dealApi: ReturnType<typeof useDealAccounts> }): ReactNode {
  switch (l.kind) {
    case "deal": {
      const words = at.dealApi?.feeWords(at.pick.house, at.pick.fund, l.fee) ?? null;
      return words ? <span className="text-xs text-muted-foreground">{words}</span> : null;
    }
    case "list": {
      const words = rateWords(l.line, at.pc.priced, at.plan.monthly);
      return words ? <RateLine words={words} house={at.pc.priced.house} /> : null;
    }
    case "remainder":
      return null;
    default:
      return assertNever(l);
  }
}

/**
 * The pair's receipt: `paper` (one column, above the lists below 1280 px: the lines that add up to the total, the account's and the fund's
 * parts behind a tap on each one's name) or `ticket` (across the page's column from 1280 px, above the lists: the account's part at the
 * start side, the lines that add up to the total in the middle, the fund's part at the end side). Same figures and sources
 * either way. `ref`: the ticket, whose foot the ruler's point is joined to.
 */
export function PairReceipt({ view, bundle, plan, pick, chosen, layout = "paper", ref }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; /** The person picked this pair; else it is the page's own, and is never called theirs. */ chosen: boolean; layout?: "paper" | "ticket"; ref?: Ref<HTMLElement> }) {
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  const pc = v.pc;
  const dealApi = useDealAccounts();
  if (!pc) return null;
  const today = bundle.today;
  // the chain in the shekels of the horizon down to what the account and the fund leave, then the inflation, then the tax and what is left
  // in today's money
  const ch = receiptChain(pc);
  const r = ch.nominal;
  const nom = (x: SiteValue, label: string) => nominalOf(pc, x, label, today);
  const house = providerName(view, pick.house);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  // the person's own account and fund in the entered ink, as in the lists
  const mine = !!house?.custom;
  const fundName = <MixedName className={fund && isCustomFund(fund.rec) ? "text-entered" : undefined}>{fund?.name ?? pick.fund}</MixedName>;
  const short = house?.short ?? pick.house;
  // the figures each line shows are whole shekels that add up; each opens the figure it stands for, with that figure's sources
  const steady = totalNoteOf(view, bundle, pick.fund);
  const years = plan.years;
  const ticket = layout === "ticket";
  const top = (
    <>
      <span>
        {site.name} · {c.receipt.title}
      </span>
      <span className="text-end">
        <MixedName>{view.index.name}</MixedName> · {fmt.years(years)}
      </span>
    </>
  );
  // F-128: an account priced by a deal writes the deal's own fees, each under its name, in whole shekels that add up with the remainder
  const accountParts = (
    <>
      {accountLinesOf(pc, r).map((l) => {
        const name = accountLineName(l);
        const sub = accountLineSub(l, { pc, plan, pick, dealApi });
        return <ReceiptLine key={l.key} size="sm" label={name} value={<Num value={nom(l.cost, name)} display={minus(l.amount)} />} sub={sub ?? undefined} />;
      })}
    </>
  );
  const accountValue = <Num value={nom(accountSum(pc, c.pair.who.account, today), c.receipt.parts.account)} display={minus(r.account)} />;
  // F-109: what the cash waiting for a whole unit did, beside the account's fees and never among them: a minus where the fund rose while it
  // waited, a plus where it fell; on the account's own lines with why, and among the lines that add up to the total without it
  const waits = !!pc.waiting && r.waiting !== 0;
  const waitingValue = pc.waiting && <Num value={nom(pc.waiting, c.pair.waiting)} display={minus(r.waiting)} />;
  const fundValue = <Num value={nom(pc.fund, c.receipt.parts.fund)} display={minus(r.fund)} />;
  // the account's and the fund's own facts and lines, written once: the ticket's side parts, and on paper the sheet each one's name opens
  const accountOwn = (
    <>
      <AccountFacts view={view} bundle={bundle} plan={plan} pick={pick} refs={!ticket} />
      <ReceiptLine size="sm" edge="border-chart-by-account" label={c.receipt.accountCharges} value={accountValue} parts={accountParts} />
      {waits && <ReceiptLine size="sm" label={c.pair.waiting} value={waitingValue} sub={r.waiting > 0 ? c.pair.waitingWhy.rose : c.pair.waitingWhy.fell} />}
    </>
  );
  const fundOwn = (
    <>
      {fund && <FundFacts view={view} bundle={bundle} fund={fund} refs={!ticket} />}
      <ReceiptLine size="sm" edge="border-chart-by-fund" label={c.receipt.fundCharges} value={fundValue} parts={fund && feeRows(fund.rec, bundle, today)} />
    </>
  );
  const accountName = (
    <>
      {ticket ? null : <>{c.pair.who.account} </>}
      <MixedName className={mine ? "text-entered" : undefined}>{short}</MixedName>
    </>
  );
  const fundLabel = ticket ? fundName : <>{c.pair.who.fund} {fundName}</>;
  // the lines that add up to the total, one each; on the ticket the account's and the fund's carry their part's colour
  const lines = (
    <div className="flex flex-col gap-2.5 text-sm">
      <ReceiptLine size="sm" label={c.pair.paidIn} value={<Num value={pc.paidInNominal} display={fmt.nisWhole(r.paidIn)} />} />
      <ReceiptLine size="sm" label={c.receipt.added} value={<Num value={addedOf(pc, today)} display={fmt.signedNisWhole(r.added)} />} />
      <ReceiptLine size="sm" swatch={ticket ? "bg-chart-by-account" : undefined} label={accountName} value={accountValue} opens={ticket ? undefined : { title: accountName, body: accountOwn }} />
      {waits && <ReceiptLine size="sm" label={c.pair.waiting} value={waitingValue} />}
      <ReceiptLine size="sm" swatch={ticket ? "bg-chart-by-fund" : undefined} label={fundLabel} value={fundValue} opens={ticket ? undefined : { title: <>{c.pair.who.fund} {fundName}</>, body: fundOwn }} />
      <ReceiptLine size="sm" label={c.receipt.inflation} value={<Num value={inflationOf(pc, ch, v.taxName, today)} display={minus(ch.inflation)} />} />
      <ReceiptLine size="sm" label={v.taxName} value={<Num value={taxOf(pc)} display={minus(ch.tax)} />} />
    </div>
  );
  // the total's name, with a "!" only where the figure rests on the dollar holding still (D118)
  const leftName = (
    <span className="text-base font-semibold whitespace-nowrap">
      <span>{c.receipt.left}</span>
      {steady && <HelpMark about={c.receipt.left} text={steady} note className="ms-1" />}
    </span>
  );
  const total = <Num value={leftOf(pc, today)} display={fmt.nisWhole(ch.left)} />;
  // one form for the receipt's large figures: where one is a billion or more, its others of a hundred million or more are short too
  const shortFigures = shortRow(r.paidIn, r.added, r.account, r.waiting, r.fund, ...r.accountLines, r.remainder, ch.inflation, ch.tax, ch.left);
  if (ticket)
    return (
      <ShortRow when={shortFigures}>
      <ReceiptTicket
        ref={ref}
        label={c.receipt.title}
        top={top}
        start={
          <TicketPart label={c.receipt.parts.account} swatch="bg-chart-by-account" name={<MixedName className={mine ? "text-entered" : undefined}>{short}</MixedName>} aside={<AccountRefs view={view} bundle={bundle} pick={pick} />}>
            {accountOwn}
          </TicketPart>
        }
        middle={
          <>
            {lines}
            <ReceiptRule kind="double" />
            <div className="flex flex-col items-center gap-1 text-center">
              {leftName}
              <span className="text-total font-semibold text-primary tabular-nums whitespace-nowrap">{total}</span>
            </div>
          </>
        }
        end={
          <TicketPart label={c.receipt.parts.fund} swatch="bg-chart-by-fund" name={fundName} aside={fund && <FundRefs fund={fund} />}>
            {fundOwn}
          </TicketPart>
        }
      />
      </ShortRow>
    );
  return (
    <ShortRow when={shortFigures}>
    <ReceiptPaper label={c.receipt.title}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">{top}</div>
      {lines}
      <ReceiptRule kind="double" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 pb-1">
        {leftName}
        <span className="text-figure font-semibold text-primary tabular-nums whitespace-nowrap">{total}</span>
      </div>
    </ReceiptPaper>
    </ShortRow>
  );
}

/**
 * The receipt's stub at the screen's foot (below 1280 px, where the receipt stands above the lists): the pair's account and fund by their
 * names in the lists (`fundName`, the fund list's), and what is left as the receipt shows it, on the same plan and pick; a tap leads back to the
 * receipt (`target`).
 */
export function PairStub({ view, bundle, plan, pick, fundName, target, area }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; fundName: string; target: RefObject<HTMLElement | null>; area: RefObject<HTMLElement | null> }) {
  const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house });
  if (!pc) return null;
  const short = providerName(view, pick.house)?.short ?? pick.house;
  return (
    <ReceiptStub
      names={
        <>
          <MixedName>{short}</MixedName> + <MixedName>{fundName}</MixedName>
        </>
      }
      label={c.receipt.left}
      figure={fmt.nisWhole(receiptAmounts(pc).left)}
      go={c.receipt.toReceipt}
      target={target}
      area={area}
    />
  );
}
