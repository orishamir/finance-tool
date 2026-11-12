// The index page's answer: the chosen pair's receipt (F-91, F-106, F-65). What was paid in, what the index added
// before any cost, what the tax, the account (line by line, each with its rate as the price list prints it) and the fund (its fees as rows
// of the same shape, each with its rate) took, and what is left; then the gain, what went on the way, and a bar of who took it. The figures follow the plan as a slider moves (the pair is priced
// once per plan for this card and the fees panel under the lists, `pairCostsKept`), and they add up as a reader adds them (lib/receipt).
// From 1280 px it is a ticket across the main column, above the two lists and the ruler, whose point joins its total; below 1280 px it is
// paper above the lists, and its stub at the screen's foot keeps what is left in sight and leads back to it.
import { Fragment, type ReactNode, type Ref, type RefObject } from "react";
import { invest as c, site } from "../../copy";
import { fmt, wholeSum } from "../../lib/format";
import { gapListFor, pricedVariable, accountSum, pairCostsKept, type InvestView } from "../../lib/invest";
import type { FundRecord } from "@finance-tool/schema";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rateWords, type RatePart, type RateWords } from "../../lib/rate-words";
import { receiptAmounts, sharesOf, takenWords } from "../../lib/receipt";
import { differenceOf, ownBy, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { HelpMark, LeftOutLine, LongestCase, MixedName, ReceiptLine, ReceiptPaper, ReceiptRule, ReceiptStub, ReceiptTicket, ShareBar, TicketPart, cx } from "../kit";
import { isGroupProvider } from "../../lib/group-pick";
import { leftOutOf } from "../../lib/left-out";
import { isCustomFund } from "../../lib/custom-entries";
import { allFunds, barTotalValue, pairVerdict, steadyOf, whole, LONGEST_YEARS, type Pick } from "./pair";
import { partName } from "./cost-lines";
import { providerName } from "./sections";
import { fundFeeItems } from "./funds";

/** The names `data-anchor` gives the two lists, by which the ruler between them finds their rows. */
export const ANCHOR = { accounts: "accounts", funds: "funds" } as const;

/** A cost line's amount: what was taken with a minus, a line under zero with a plus (lib/receipt). */
const minus = takenWords;
/** A part that took money but whose whole share is zero says so, not "0%". */
const under = (amount: number, share: number) => (amount > 0 && share === 0 ? { words: c.receipt.underOne } : {});

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
export function RateLine({ words, house }: { words: RateWords[]; house: string }) {
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
    c.pair.openTop
  );
  return { top, words };
}

/**
 * The fund's fees as rows under its line, as the account's are: a name, the leader, the rate. A foreign fund's "אין" and "לא נאסף" in
 * place of a rate are said in a "?" beside the first of them (wording.md: a note beside what it qualifies).
 */
function feeRows(rec: FundRecord, bundle: IndicesBundle, today: string) {
  const items = fundFeeItems(rec, { inline: true, priced: pricedVariable(rec, gapListFor(bundle, rec), today) });
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
              <HelpMark about={c.pair.colFees} text={c.funds.feeWordsNote} className="ms-1" />
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

/**
 * The pair's receipt: `paper` (one column: the side rail's width, or above the lists below 1280 px) or `ticket` (across the main column from
 * 1280 px, above the lists: the account's part at the start side, what was paid in, added and taxed with what is left in the middle, the
 * fund's part at the end side, and the gain, what went on the way and its bar in a row under them). Same lines, figures and sources either
 * way. `ref`: the ticket, whose foot the ruler's point is joined to.
 */
export function PairReceipt({ view, bundle, plan, pick, chosen, layout = "paper", ref }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; /** The person picked this pair; else it is the page's own, and is never called theirs. */ chosen: boolean; layout?: "paper" | "ticket"; ref?: Ref<HTMLElement> }) {
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  const pc = v.pc;
  if (!pc) return null;
  const today = bundle.today;
  const r = receiptAmounts(pc);
  const house = providerName(view, pick.house);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const short = house?.short ?? pick.house;
  const held = view.providers.find((p) => p.id === pick.house);
  const baseHouse = held && isGroupProvider(held) ? (held as typeof held & { group: { house: string } }).group.house : pick.house;
  const baseShort = providerName(view, baseHouse)?.short ?? short;
  // the figures each line shows are whole shekels that add up; each opens the figure it stands for, with that figure's sources
  const added = differenceOf([c.pair.baseInput, whole(pc.baseValue)], [c.pair.paidIn, whole(pc.paidIn)], "F-91", { today, about: c.receipt.added });
  const gain = differenceOf([c.receipt.left, whole(pc.left)], [c.pair.paidIn, whole(pc.paidIn)], "F-91", { today, about: c.receipt.gain });
  const account = accountSum(pc, c.pair.who.account, today, Math.round);
  const company = pc.priced.house;
  const shares = sharesOf([r.tax, r.account, r.fund]);
  const steady = steadyOf(view, bundle, pick.fund);
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
  const paidIn = <ReceiptLine size="sm" label={c.pair.paidIn} value={<Num value={pc.paidIn} display={fmt.nisWhole(r.paidIn)} />} />;
  const addedLine = <ReceiptLine size="sm" label={c.receipt.added} value={<Num value={added} display={fmt.signedNisWhole(r.added)} />} />;
  const taxLine = <ReceiptLine size="sm" swatch="bg-chart-tax" label={v.taxName} value={<Num value={pc.tax} display={minus(r.tax)} />} />;
  const accountParts = (
    <>
      {pc.account.map((l, i) => {
        const words = rateWords(l.line, pc.priced, plan.monthly);
        return <ReceiptLine key={l.line} size="sm" label={partName(l.line)} value={<Num value={l.cost} display={minus(r.accountLines[i]!)} />} sub={words ? <RateLine words={words} house={company} /> : undefined} />;
      })}
      {r.remainder !== 0 && <ReceiptLine size="sm" label={pc.units ? c.pair.remainderUnits : c.pair.remainder} value={<Num value={pc.remainder} display={minus(r.remainder)} />} />}
      {/* what the house's documents hold and its price leaves out, under its lines (D106); a group's account is its house's */}
      <LeftOutLine view={leftOutOf(bundle.snapshots.find((s) => s.id === baseHouse))} house={baseShort} />
    </>
  );
  const accountValue = <Num value={account} display={minus(r.account)} />;
  const fundValue = <Num value={pc.fund} display={minus(r.fund)} />;
  const fundParts = fund && feeRows(fund.rec, bundle, today);
  // held at its longest case: the dollar's clause comes and goes with the fund and the index, and moves nothing below
  const caption = (
    <LongestCase className={cx("text-xs text-muted-foreground", ticket && "text-center")} cases={[1, 2, LONGEST_YEARS].flatMap((y) => [c.pair.steadyDollar, c.pair.steadyIndexCurrency].map((s) => <span key={`${y}${s}`}>{c.receipt.caption(y, s)}</span>))}>
      <span>{c.receipt.caption(years, steady)}</span>
    </LongestCase>
  );
  const total = <Num value={pc.left} display={fmt.nisWhole(r.left)} />;
  const gainLine = <ReceiptLine strong label={c.receipt.gain} value={<Num value={gain} display={fmt.signedNisWhole(r.gain)} />} sub={c.receipt.gainNote} />;
  const lostLine = <ReceiptLine strong label={c.receipt.lost} value={<Num value={barTotalValue(pc, short, today)} display={fmt.nisWhole(r.lost)} />} />;
  const bar = (
    <ShareBar
      label={`${c.receipt.lostBar}: ${v.taxName} ${shares[0]}%, ${c.receipt.parts.account} ${shares[1]}%, ${c.receipt.parts.fund} ${shares[2]}%`}
      parts={[
        { id: "tax", name: v.taxName, share: shares[0]!, className: "bg-chart-tax", ...under(r.tax, shares[0]!) },
        { id: "account", name: c.receipt.parts.account, share: shares[1]!, className: "bg-chart-by-account", ...under(r.account, shares[1]!) },
        { id: "fund", name: c.receipt.parts.fund, share: shares[2]!, className: "bg-chart-by-fund", ...under(r.fund, shares[2]!) },
      ]}
    />
  );
  if (ticket)
    return (
      <ReceiptTicket
        ref={ref}
        label={c.receipt.title}
        top={top}
        start={
          <TicketPart label={c.receipt.parts.account} swatch="bg-chart-by-account" name={<MixedName>{short}</MixedName>}>
            <ReceiptLine size="sm" edge="border-chart-by-account" label={c.receipt.accountCharges} value={accountValue} parts={accountParts} />
          </TicketPart>
        }
        middle={
          <>
            <div className="flex flex-col gap-2.5 text-sm">
              {paidIn}
              {addedLine}
              {taxLine}
            </div>
            <ReceiptRule kind="double" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-base font-semibold">{c.receipt.left}</span>
              <span className="text-total font-semibold text-primary tabular-nums whitespace-nowrap">{total}</span>
              {caption}
            </div>
          </>
        }
        end={
          <TicketPart label={c.receipt.parts.fund} swatch="bg-chart-by-fund" name={<MixedName>{fund?.name ?? pick.fund}</MixedName>}>
            <ReceiptLine size="sm" edge="border-chart-by-fund" label={c.receipt.fundCharges} value={fundValue} parts={fundParts} />
          </TicketPart>
        }
        foot={[gainLine, lostLine, bar]}
      />
    );
  return (
    <ReceiptPaper label={c.receipt.title}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">{top}</div>
      <div className="flex flex-col gap-2.5 text-sm">
        {paidIn}
        {addedLine}
        {taxLine}
        <ReceiptLine
          size="sm"
          swatch="bg-chart-by-account"
          edge="border-chart-by-account"
          label={
            <>
              {c.pair.who.account} <MixedName>{short}</MixedName>
            </>
          }
          value={accountValue}
          parts={accountParts}
        />
        <ReceiptLine
          size="sm"
          swatch="bg-chart-by-fund"
          edge="border-chart-by-fund"
          label={
            <>
              {c.pair.who.fund} <MixedName>{fund?.name ?? pick.fund}</MixedName>
            </>
          }
          value={fundValue}
          parts={fundParts}
        />
      </div>
      <ReceiptRule kind="double" />
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-semibold">{c.receipt.left}</span>
          <span className="text-figure font-semibold text-primary tabular-nums whitespace-nowrap">{total}</span>
        </div>
        {caption}
      </div>
      <ReceiptRule kind="dashed" />
      <div className="flex flex-col gap-2.5">
        {gainLine}
        {lostLine}
        {bar}
      </div>
    </ReceiptPaper>
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
