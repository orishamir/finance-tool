// The index page's answer, second in the side rail: the chosen pair's receipt (F-91, F-106, F-65). What was paid in, what the index added
// before any cost, what the tax, the account (line by line, each with its rate as the price list prints it) and the fund took, and what is
// left; then the gain, what went on the way, and a bar of who took it. The figures follow the plan as a slider moves (the pair is priced
// once per plan for this card and the fees panel under the lists, `pairCostsKept`), and they add up as a reader adds them (lib/receipt).
import { Fragment, type ReactNode } from "react";
import { invest as c, site } from "../../copy";
import { fmt } from "../../lib/format";
import { gapListFor, pricedVariable, accountSum, type InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rateWords, type RatePart, type RateWords } from "../../lib/rate-words";
import { receiptAmounts, sharesOf, takenWords } from "../../lib/receipt";
import { differenceOf, ownBy, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { HelpMark, LongestCase, MixedName, ReceiptLine, ReceiptPaper, ReceiptRule, ShareBar, cx } from "../kit";
import { isCustomFund } from "../../lib/custom-entries";
import { allFunds, barTotalValue, pairVerdict, partName, plus, steadyOf, VERDICT_CASES, LONGEST_YEARS, type Pick } from "./pair";
import { providerName } from "./sections";
import { Fees } from "./funds";

/** A cost line's amount: what was taken with a minus, a line under zero with a plus (lib/receipt). */
const minus = takenWords;
/** A whole-shekel amount isolated, with its sign where it has one. */
const signed = (n: number) => (n > 0 ? plus(n)! : n < 0 ? `⁦−${fmt.nisWhole(-n)}⁩` : fmt.nisWhole(0));
const whole = (v: SiteValue): SiteValue => ({ ...v, value: Math.round(v.value as number) });

/** One part of a rate in words: the figure (it opens the house's price list) and what it is of. */
function RatePartWords({ part, house }: { part: RatePart; house: string }) {
  const r = c.rate;
  const fig = <Num value={ownBy({ ...part.value } as SiteValue, house)} />;
  const per = part.per ? <> {r.per[part.per]}</> : null;
  if (part.kind === "rate") return <>{fig}{per}</>;
  if (part.kind === "cap") return <>{r.cap.before} {fig} {r.cap.after}</>;
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

/** The verdict on the chosen pair in today's words, as the receipt's badge and the headline above the lists say it; `top`: the pair is
 *  among the cheapest. */
export function verdictOf(v: ReturnType<typeof pairVerdict>, chosen: boolean): { top: boolean; words: ReactNode } {
  const { onBest, tie, tied, n, nFunds, moreIfOther } = v;
  const top = onBest || (chosen && tied);
  const words: ReactNode = chosen ? (
    top ? (
      <>{c.pair.yours} · {tie || tied ? c.pair.tiedWith : c.pair.cheapestTag}</>
    ) : (
      <>
        {c.pair.yours} · {moreIfOther && <Num value={moreIfOther} display={plus} />} {c.pair.moreIfCheapest}
      </>
    )
  ) : onBest ? (
    tie ? c.pair.tieTop(n, nFunds) : c.pair.cheapestStar
  ) : (
    c.pair.openTop
  );
  return { top, words };
}

/** The verdict as the receipt's badge: filled where the pair is among the cheapest, an outline with how much less it leaves where not. */
function Verdict({ v, chosen }: { v: ReturnType<typeof pairVerdict>; chosen: boolean }) {
  const { top, words } = verdictOf(v, chosen);
  return (
    <LongestCase className="text-sm font-medium" cases={VERDICT_CASES.map((x) => <span key={x} className="block rounded-md border px-3 py-1.5">{x}</span>)}>
      <span className={cx("block rounded-md border px-3 py-1.5", top ? "border-primary bg-primary text-primary-foreground" : "border-primary text-primary")}>{words}</span>
    </LongestCase>
  );
}

export function PairReceipt({ view, bundle, plan, pick, chosen }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; /** The person picked this pair; else it is the page's own, and is never called theirs. */ chosen: boolean }) {
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  const pc = v.pc;
  if (!pc) return null;
  const today = bundle.today;
  const r = receiptAmounts(pc);
  const house = providerName(view, pick.house);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const short = house?.short ?? pick.house;
  // the figures each line shows are whole shekels that add up; each opens the figure it stands for, with that figure's sources
  const added = differenceOf([c.pair.baseInput, whole(pc.baseValue)], [c.pair.paidIn, whole(pc.paidIn)], "F-91", { today, about: c.receipt.added });
  const gain = differenceOf([c.receipt.left, whole(pc.left)], [c.pair.paidIn, whole(pc.paidIn)], "F-91", { today, about: c.receipt.gain });
  const account = accountSum(pc, c.pair.who.account, today, Math.round);
  const company = pc.priced.house;
  const shares = sharesOf([r.tax, r.account, r.fund]);
  const steady = steadyOf(view, bundle, pick.fund);
  const years = plan.years;
  return (
    <ReceiptPaper label={c.receipt.title}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {site.name} · {c.receipt.title}
        </span>
        <span className="text-end">
          <MixedName>{view.index.name}</MixedName> · {fmt.years(years)}
        </span>
      </div>
      <Verdict v={v} chosen={chosen} />
      <div className="flex flex-col gap-2.5 text-sm">
        <ReceiptLine size="sm" label={c.pair.paidIn} value={<Num value={pc.paidIn} display={fmt.nisWhole(r.paidIn)} />} />
        <ReceiptLine size="sm" label={c.receipt.added} value={<Num value={added} display={signed(r.added)} />} />
        <ReceiptLine size="sm" swatch="bg-chart-tax" label={v.taxName} value={<Num value={pc.tax} display={minus(r.tax)} />} />
        <ReceiptLine
          size="sm"
          swatch="bg-chart-by-account"
          edge="border-chart-by-account"
          label={
            <>
              {c.pair.who.account} <MixedName>{short}</MixedName>
            </>
          }
          value={<Num value={account} display={minus(r.account)} />}
          parts={
            <>
              {pc.account.map((l, i) => {
                const words = rateWords(l.line, pc.priced, plan.monthly);
                return <ReceiptLine key={l.line} size="sm" label={partName(l.line)} value={<Num value={l.cost} display={minus(r.accountLines[i]!)} />} sub={words ? <RateLine words={words} house={company} /> : undefined} />;
              })}
              {r.remainder !== 0 && <ReceiptLine size="sm" label={pc.units ? c.pair.remainderUnits : c.pair.remainder} value={<Num value={pc.remainder} display={minus(r.remainder)} />} />}
            </>
          }
        />
        <ReceiptLine
          size="sm"
          swatch="bg-chart-by-fund"
          label={
            <>
              {c.pair.who.fund} <MixedName>{fund?.name ?? pick.fund}</MixedName>
            </>
          }
          value={<Num value={pc.fund} display={minus(r.fund)} />}
          sub={
            fund && (
              // each fee on its own where the line is narrow, and a long word of the priced variable fee wraps rather than leave the paper
              <span className="flex flex-wrap gap-x-3 gap-y-0.5 [&_.whitespace-nowrap]:whitespace-normal">
                <Fees rec={fund.rec} inline priced={pricedVariable(fund.rec, gapListFor(bundle, fund.rec), today)} />
                {/* a foreign fund's "אין" and "לא נאסף" in place of a fee: said in a "?" beside them (wording.md: a note beside what it qualifies) */}
                {fund.rec.domicile !== "IL" && !isCustomFund(fund.rec) && <HelpMark about={c.pair.colFees} text={c.funds.feeWordsNote} />}
              </span>
            )
          }
        />
      </div>
      <ReceiptRule kind="double" />
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-semibold">{c.receipt.left}</span>
          <span className="text-figure font-semibold text-primary tabular-nums whitespace-nowrap">
            <Num value={pc.left} display={fmt.nisWhole(r.left)} />
          </span>
        </div>
        {/* held at its longest case: the dollar's clause comes and goes with the fund and the index, and moves nothing below */}
        <LongestCase className="text-xs text-muted-foreground" cases={[1, 2, LONGEST_YEARS].flatMap((y) => [c.pair.steadyDollar, c.pair.steadyIndexCurrency].map((s) => <span key={`${y}${s}`}>{c.receipt.caption(y, s)}</span>))}>
          <span>{c.receipt.caption(years, steady)}</span>
        </LongestCase>
      </div>
      <ReceiptRule kind="dashed" />
      <div className="flex flex-col gap-2.5">
        <ReceiptLine strong label={c.receipt.gain} value={<Num value={gain} display={signed(r.gain)} />} sub={c.receipt.gainNote} />
        <ReceiptLine strong label={c.receipt.lost} value={<Num value={barTotalValue(pc, short, today)} display={fmt.nisWhole(r.lost)} />} />
        <ShareBar
          label={`${c.receipt.lostBar}: ${v.taxName} ${shares[0]}%, ${c.receipt.parts.account} ${shares[1]}%, ${c.receipt.parts.fund} ${shares[2]}%`}
          parts={[
            { id: "tax", name: v.taxName, share: shares[0]!, className: "bg-chart-tax", lightInk: true },
            { id: "account", name: c.receipt.parts.account, share: shares[1]!, className: "bg-chart-by-account" },
            { id: "fund", name: c.receipt.parts.fund, share: shares[2]!, className: "bg-chart-by-fund" },
          ]}
        />
      </div>
    </ReceiptPaper>
  );
}

