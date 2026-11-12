// "לפני שמחליטים", under the two lists of the index page: questions about the receipt's pair, a card each with its answer as a live figure,
// and one panel open under them. Where the fees go (the receipt's fee lines as bars, and the pair set beside this one), what moves the
// result most (F-89, F-90), hedged or not (F-95, wherever the index has funds of both kinds and the section has its figures) and the
// stairs. Each answer reads the same computation as its panel, lifted here so a closed panel's card still answers: the fees follow a slider
// as the receipt does, the others wait until the plan has rested, as they did as sections. An answer is plain words (a card is a tab, and
// a tab holds no control): the same figure in the open panel opens its sheet. The open card stays open while the plan or the pair changes.
import { useId, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import { accountSum, gapListFor, pricedVariable, tieThresholdValue, type InvestView, type PairCosts } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rateWords } from "../../lib/rate-words";
import { receiptAmounts } from "../../lib/receipt";
import { sumOf, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { Card, MixedName, OptionBars, PanelHead, SourcedTag, TabCards, Tpl, type OptionBar, type TabCard } from "../kit";
import { Fees } from "./funds";
import { changesAt, PlanChanges, shareWord, usePlanChanges } from "./knobs";
import { DollarSection, dollarSwing, useDollarCase, type DollarCase } from "./dollar";
import { StairsSection, useStairs } from "./stairs";
import { allFunds, pairVerdict, phoneOf, tieSet, type OnPick, type Pick, type PairVerdict } from "./pair";
import { partName } from "./cost-lines";
import { RateLine } from "./receipt";

type Share = { min: number; max: number; step: number; start: number };

/** A whole-shekel amount in a card's plain words, isolated so it keeps its order inside Hebrew. */
const amount = (n: number) => `\u2066${fmt.nisWhole(n)}\u2069`;
type Key = "fees" | "sens" | "hedge" | "stairs";

/** The account's and the fund's fees together, without the tax, as the chosen pair's card writes them. */
const togetherOf = (pc: PairCosts, today: string): SiteValue => sumOf({ [c.receipt.parts.account]: accountSum(pc, c.receipt.parts.account, today, Math.round), [c.receipt.parts.fund]: pc.fund }, "F-91", { today, about: c.chosen.togetherAbout, round: Math.round });

/** The chosen pair's fees item by item, as the receipt writes them (whole shekels that add up), the largest first. */
function feeItems(view: InvestView, bundle: IndicesBundle, plan: WorkbenchInputs, pick: Pick, pc: PairCosts) {
  const r = receiptAmounts(pc);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const items: { id: string; name: string; amount: number; value: SiteValue; who: "account" | "fund"; sub: ReactNode }[] = [
    ...pc.account.map((l, i) => {
      const words = rateWords(l.line, pc.priced, plan.monthly);
      return { id: l.line, name: partName(l.line) ?? "", amount: r.accountLines[i]!, value: l.cost, who: "account" as const, sub: words ? <RateLine words={words} house={pc.priced.house} /> : null };
    }),
    ...(r.remainder !== 0 ? [{ id: "remainder", name: pc.units ? c.pair.remainderUnits : c.pair.remainder, amount: r.remainder, value: pc.remainder, who: "account" as const, sub: null }] : []),
    {
      id: "fund",
      name: c.pair.fundLine,
      amount: r.fund,
      value: pc.fund,
      who: "fund" as const,
      // the fund's cost is one figure: the calculation has no split by fee, so its line says the fees it rests on
      sub: fund ? (
        <span className="inline-flex flex-wrap gap-x-3 [&_.whitespace-nowrap]:whitespace-normal">
          <Fees rec={fund.rec} inline priced={pricedVariable(fund.rec, gapListFor(bundle, fund.rec), bundle.today)} />
        </span>
      ) : null,
    },
  ];
  return { r, items: items.sort((a, b) => b.amount - a.amount) };
}

/** The hedged-or-not card: what the plan's pair of one kind leaves more than the other's; where the plan has no such figure (no pair of
 *  each kind to price), the section's lead figure, how far the dollar moved in one year, so the card never stands blank. */
export function hedgeCard(d: DollarCase): TabCard {
  if (d.more) return { key: "hedge", question: c.before.hedge.question, answer: `${amount(d.more.value as number)} ${d.uMore >= 0 ? c.before.hedge.moreUnhedged : c.before.hedge.moreHedged}`, note: c.dollar.planSteady };
  const swing = dollarSwing(d);
  return { key: "hedge", question: c.before.hedge.question, answer: `${swing.lo} ${c.dollar.to} ${swing.hi}`, note: c.dollar.cancelsNote(swing.from, swing.to) };
}

export function BeforeDeciding({ view, bundle, plan, livePlan, share, pick, chosen, hedge, stairs, onPick }: {
  view: InvestView;
  bundle: IndicesBundle;
  /** The plan as it last rested (the lists'), and as the sliders move (the receipt's). */
  plan: WorkbenchInputs;
  livePlan: WorkbenchInputs;
  share: Share;
  /** The chosen pair (the group's account in place of its house where one is picked); null where the page prices no pair. */
  pick: Pick | null;
  /** The person picked this pair; else it is the page's own, and is never called theirs. */
  chosen: boolean;
  /** Whether the index has funds of both kinds and the exchange rates the hedged panel needs. */
  hedge: boolean;
  /** The stairs read the page's view and the person's own pick (or none: the page's example). */
  stairs: { view: InvestView; bundle: IndicesBundle; startHouse: string | null; startFund: string | null };
  onPick: OnPick;
}) {
  const idBase = useId();
  const [open, setOpen] = useState<Key>("fees");
  const [at, setAt] = useState(share.start);
  const today = bundle.today;
  const changes = usePlanChanges({ plan, share, bundle, view, pick });
  const dollar = useDollarCase(hedge ? view : null, bundle, plan, pick);
  const st = useStairs({ view: stairs.view, bundle: stairs.bundle, plan, startHouse: stairs.startHouse, startFund: stairs.startFund, example: stairs.startHouse === null });
  const verdict = pick ? pairVerdict(view, bundle, livePlan, pick, chosen) : null;
  const pc = verdict?.pc ?? null;
  if (!pick || !pc || !verdict) return null;

  const fees = feeItems(view, bundle, livePlan, pick, pc);
  const top = fees.items[0]!;
  const tabs: (TabCard & { key: Key; panel: () => ReactNode })[] = [
    {
      key: "fees",
      question: c.before.fees.question,
      answer: `${top.name}: ${amount(top.amount)}`,
      note: `${c.before.fees.of} ${amount(fees.r.account + fees.r.fund)} ${c.before.fees.ofTail}`,
      panel: () => <FeesPanel view={view} bundle={bundle} plan={livePlan} pick={pick} chosen={chosen} onPick={onPick} />,
    },
  ];
  if (changes) {
    const rows = changesAt(changes, at, share, today);
    const first = rows[0]!;
    const d = first.diff;
    tabs.push({
      key: "sens",
      question: c.before.sens.question,
      answer: at === 0 || !d ? c.before.sens.none : c.plan.knobs.changes.nouns[first.l.id],
      note: at === 0 || !d ? `${c.plan.knobs.changes.planHead} ${amount(changes.base.value as number)}` : `${shareWord(at)} ${(d.value as number) >= 0 ? c.before.sens.adds : c.before.sens.takes} ${amount(Math.abs(d.value as number))} ${c.before.sens.atEnd}`,
      panel: () => <PlanChanges run={changes} at={at} onAt={setAt} share={share} today={today} />,
    });
  }
  // wherever the section has its figures (main's rule: an index with funds of both kinds, the dollar's range and a compared year of each)
  if (dollar) tabs.push({ ...hedgeCard(dollar), key: "hedge", panel: () => <DollarSection view={view} bundle={bundle} plan={plan} d={dollar} /> });
  if (st) {
    const steps = st.levels.length - 1;
    const climb = st.climb.value as number;
    const start = st.levels[0]!;
    tabs.push({
      key: "stairs",
      question: c.before.stairs.question,
      answer: steps < 1 ? c.before.stairs.none : climb >= 0 ? `${c.before.stairs.more} ${amount(climb)} ${c.before.stairs.inSteps(steps)}` : `${amount(Math.abs(climb))} ${c.before.stairs.less} ${c.before.stairs.inSteps(steps)}`,
      note: (
        <>
          {st.atExample ? c.before.stairs.fromExample : c.before.stairs.from} <MixedName>{start.fundName}</MixedName>, {start.house.short}
        </>
      ),
      panel: () => <StairsSection view={stairs.view} bundle={stairs.bundle} s={st} />,
    });
  }
  // a tab that has gone (another index with funds of one kind) leaves the first open
  const shown = tabs.find((t) => t.key === open) ?? tabs[0]!;
  const pairWords = (
    <>
      <MixedName>{verdict.nameOf(pick)}</MixedName>, <MixedName>{verdict.fundOf(pick)}</MixedName>
    </>
  );
  return (
    <section aria-labelledby={`${idBase}-h`} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={`${idBase}-h`} className="text-2xl font-semibold">
          {c.before.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {c.shownPair(chosen).questions(tabs.length)} {pairWords}. {c.before.leadTail(tabs.length)}
        </p>
      </div>
      <TabCards tabs={tabs} current={shown.key} onChange={(k) => setOpen(k as Key)} ariaLabel={c.shownPair(chosen).tabs} openWord={c.before.openWord} idBase={idBase}>
        <Card pad="roomy">{shown.panel()}</Card>
      </TabCards>
    </section>
  );
}

/** Where the fees go: the chosen pair's fee items as bars, the largest first, then their total, why the tax is not among them, and the
 * pair set beside the chosen one in a sentence (a tap on its names chooses it), with why no pair is first where they tie (F-80, P-01). */
export function FeesPanel({ view, bundle, plan, pick, chosen, onPick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; chosen: boolean; onPick: OnPick }) {
  const f = c.before.fees;
  // the pair is priced once per plan for the receipt, the card and this panel (`pairCostsKept`)
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  if (!v.pc) return null;
  const fees = feeItems(view, bundle, plan, pick, v.pc);
  const together = <Num value={togetherOf(v.pc, bundle.today)} display={fmt.nisWhole(fees.r.account + fees.r.fund)} />;
  const top = fees.items[0]!;
  const bars: OptionBar[] = fees.items.map((x) => ({
    id: x.id,
    name: x.name,
    // who charges it, then its rate: on the same line for an account's fee, on its own line for the fund's fees
    sub: (
      <>
        {c.receipt.parts[x.who]}
        {x.sub && (x.who === "account" ? <> · {x.sub}</> : <span className="block">{x.sub}</span>)}
      </>
    ),
    value: x.amount,
    amount: <Num value={x.value} display={fmt.nisWhole(x.amount)} />,
    className: x.who === "account" ? "bg-chart-by-account" : "bg-chart-by-fund",
  }));
  return (
    <div className="flex flex-col gap-4">
      <PanelHead
        kicker={
          <>
            {f.kicker} <MixedName>{v.nameOf(pick)}</MixedName>, <MixedName>{v.fundOf(pick)}</MixedName>
          </>
        }
      >
        {f.largest} {top.name}, <Num value={top.value} display={fmt.nisWhole(top.amount)} /> {f.of} {together} {f.fees}
      </PanelHead>
      <OptionBars bars={bars} label={c.shownPair(chosen).feeBars} />
      <div className="flex flex-col gap-2 text-sm">
        <p>
          <strong className="font-semibold">
            {f.total} {together}.
          </strong>{" "}
          {f.noTax(v.taxName, v.taxName === c.pair.taxLinePayouts)}
        </p>
        <OtherPair view={view} bundle={bundle} plan={plan} pick={pick} v={v} onPick={onPick} />
      </div>
    </div>
  );
}

/** The pair set beside the chosen one (the cheapest, or on the cheapest the next one), what it charges and leaves and how it stands
 * against the chosen pair; under a tie, why neither is first, with the threshold as a figure and the tie's other pairs. */
function OtherPair({ view, bundle, pick, v, onPick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; v: PairVerdict; onPick: OnPick }) {
  const { best, onBest, other, pc, pcOther, theta, n, nFunds, crown, tied, tie, mineKey, otherKey, gap, moreIfOther, nameOf, fundOf } = v;
  if (!other || !pcOther || !pc) return null;
  const today = bundle.today;
  // the receipt's pair by what it is: the person's, else under a tie the one the panel is about (never the person's choice), else the cheapest
  const vsMine = v.mineRole === c.pair.yours ? c.pair.vsYours : tie ? c.shownPair(false).vs : c.pair.vsCheapest;
  const role = onBest ? (tie ? c.pair.tieOther : c.pair.next) : crown ? c.pair.cheapestStar : c.pair.tieTop(n, nFunds);
  const r = receiptAmounts(pcOther);
  const phone = phoneOf(view, bundle, other);
  // a fund named as another of the index is (iShares on the exchange here and abroad) is told apart by its number
  const twin = (id: string) => {
    const fw = allFunds(view).find((x) => x.rec.id === id);
    return fw && allFunds(view).some((x) => x !== fw && x.name === fw.name) ? fw.number : null;
  };
  const pairName = (p: { house: string; fund: string }) => (
    <>
      <MixedName>{nameOf(p)}</MixedName> {c.pair.tieWith} <MixedName>{fundOf(p)}</MixedName>
      {twin(p.fund) && <> {`⁦${twin(p.fund)}⁩`}</>}
    </>
  );
  const gapWords = onBest ? (
    <>
      <Num value={gap(pcOther.left, c.pair.input(otherKey, c.pair.colLeft), pc.left, c.pair.input(mineKey, c.pair.colLeft), vsMine)} /> {vsMine}
    </>
  ) : (
    // the pick in the tie set: the other pair is not "the cheap one", only the other one
    <>
      <Num value={moreIfOther!} display={fmt.signedNisWhole} /> {tied ? vsMine : c.pair.moreIfCheapest}
    </>
  );
  // why there is no order, counted as the badge counts; the pairs of the tie not named here follow, one and a count
  const rest = tie || tied ? tieSet(view, best, theta).filter((x) => !(x.house === pick.house && x.fund === pick.fund) && !(x.house === other.house && x.fund === other.fund)) : [];
  const restLine =
    rest.length === 0 ? null : (
      <>
        {" "}
        {rest.length === 1 ? c.pair.tieThird : c.pair.tieRest} {pairName(rest[0]!)}
        {rest.length > 1 && <> {c.pair.tieMore(rest.length - 1)}</>}.
      </>
    );
  return (
    <p>
      <Tpl
        t={c.before.fees.other}
        vars={{
          role,
          pair: (
            <>
              <button type="button" aria-label={`${c.pair.pickCheapest}: ${nameOf(other)}, ${fundOf(other)}`} onClick={() => onPick(other)} className="text-link underline underline-offset-[3px] hover:no-underline">
                {pairName(other)}
              </button>
              {phone && (
                <>
                  {" "}
                  <SourcedTag value={phone}>{c.pair.phoneTag}</SourcedTag>
                </>
              )}
            </>
          ),
          fees: <Num value={togetherOf(pcOther, today)} display={fmt.nisWhole(r.account + r.fund)} />,
          left: <Num value={pcOther.left} />,
          gap: gapWords,
        }}
      />
      {(tie || tied) && (
        <>
          {" "}
          {c.pair.tieWhy(Math.max(n, 2))}
          {c.pair.tieRule.before}
          <Num value={tieThresholdValue(bundle)} />
          {c.pair.tieRule.after}
          {restLine}
        </>
      )}
    </p>
  );
}
