// "לפני שמחליטים", under the two lists of the index page: questions about the receipt's pair, a card each with its answer as a live figure,
// and one panel open under them. Where the fees go (the receipt's fee lines as bars), what moves the
// result most (F-89, F-90), hedged or not (F-95, wherever the index has funds of both kinds and the section has its figures) and the
// stairs. Each answer reads the same computation as its panel, lifted here so a closed panel's card still answers: the fees follow a slider
// as the receipt does, the others wait until the plan has rested, as they did as sections. An answer is plain words (a card is a tab, and
// a tab holds no control): the same figure in the open panel opens its sheet. The open card stays open while the plan or the pair changes.
import { useId, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import { accountSum, gapListFor, pricedVariable, type InvestView, type PairCosts } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { accountLinesOf, receiptAmounts } from "../../lib/receipt";
import { sumOf, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { Card, MixedName, OptionBars, PanelHead, TabCards, type OptionBar, type TabCard } from "../kit";
import { Fees } from "./funds";
import { changesAt, PlanChanges, shareWord, usePlanChanges } from "./knobs";
import { DollarSection, dollarSwing, useDollarCase, type DollarCase } from "./dollar";
import { StairsSection, useStairs } from "./stairs";
import { allFunds, pairVerdict, type Pick } from "./pair";
import { accountLineName, accountLineSub } from "./receipt";
import { useDealAccounts } from "./deal-account";

type Share = { min: number; max: number; step: number; start: number };

/** A whole-shekel amount in a card's plain words, isolated so it keeps its order inside Hebrew. */
const amount = (n: number) => `\u2066${fmt.nisWhole(n)}\u2069`;
type Key = "fees" | "sens" | "hedge" | "stairs";

/** The account's and the fund's fees together, without the tax, in today's money. */
const togetherOf = (pc: PairCosts, today: string): SiteValue => sumOf({ [c.receipt.parts.account]: accountSum(pc, c.receipt.parts.account, today, Math.round), [c.receipt.parts.fund]: pc.fund }, "F-91", { today, about: c.chosen.togetherAbout, round: Math.round });

/** The chosen pair's fees item by item, as the receipt writes them (whole shekels that add up): the account's lines as the receipt draws them
 *  (`accountLinesOf`: a deal's own fees, else the price list's lines, and the remainder), then the fund's; the largest first. */
function feeItems(view: InvestView, bundle: IndicesBundle, plan: WorkbenchInputs, pick: Pick, pc: PairCosts, dealApi: ReturnType<typeof useDealAccounts>) {
  const r = receiptAmounts(pc);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const items: { id: string; name: string; amount: number; value: SiteValue; who: "account" | "fund"; sub: ReactNode }[] = [
    ...accountLinesOf(pc, r).map((l) => ({ id: l.key, name: accountLineName(l), amount: l.amount, value: l.cost, who: "account" as const, sub: accountLineSub(l, { pc, plan, pick, dealApi }) })),
    {
      id: "fund",
      name: c.pair.fundLine,
      amount: r.fund,
      value: pc.fund,
      who: "fund" as const,
      // the fund's cost is one figure: the calculation has no split by fee, so its line says the fees it rests on
      sub: fund ? (
        <span className="inline-flex flex-wrap gap-x-3 [&_.whitespace-nowrap]:whitespace-normal">
          <Fees rec={fund.rec} inline priced={pricedVariable(fund.rec, gapListFor(bundle, fund.rec), bundle.today)} today={bundle.today} />
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

export function BeforeDeciding({ view, bundle, plan, livePlan, share, pick, chosen, hedge, stairs }: {
  view: InvestView;
  /** The data the pair is priced on, as the page's worker holds it (the sweep asks the worker on it). */
  bundle: IndicesBundle;
  /** The plan as it last rested (the lists'), and as the sliders move (the receipt's). */
  plan: WorkbenchInputs;
  livePlan: WorkbenchInputs;
  share: Share;
  /** The chosen pair; null where the page prices no pair. */
  pick: Pick | null;
  /** The person picked this pair; else it is the page's own, and is never called theirs. */
  chosen: boolean;
  /** Whether the index has funds of both kinds and the exchange rates the hedged panel needs. */
  hedge: boolean;
  /** The stairs read the page's view and the person's own pick (or none: the page's example). */
  stairs: { view: InvestView; bundle: IndicesBundle; startHouse: string | null; startFund: string | null };
}) {
  const idBase = useId();
  const dealApi = useDealAccounts();
  const [open, setOpen] = useState<Key>("fees");
  const [at, setAt] = useState(share.start);
  const today = bundle.today;
  const changes = usePlanChanges({ plan, share, bundle, view, pick });
  const dollar = useDollarCase(hedge ? view : null, bundle, plan, pick);
  const st = useStairs({ view: stairs.view, bundle: stairs.bundle, plan, startHouse: stairs.startHouse, startFund: stairs.startFund, example: stairs.startHouse === null });
  const verdict = pick ? pairVerdict(view, bundle, livePlan, pick, chosen) : null;
  const pc = verdict?.pc ?? null;
  // the section stands once the page's worker has sent its first sweep, so its "what moves the result most" card never comes in a moment
  // after the rest and moves what is under it; the section is far below the screen's first view, and that answer takes well under a second
  if (!pick || !pc || !verdict || changes === "waiting") return null;

  const fees = feeItems(view, bundle, livePlan, pick, pc, dealApi);
  const top = fees.items[0]!;
  const tabs: (TabCard & { key: Key; panel: () => ReactNode })[] = [
    {
      key: "fees",
      question: c.before.fees.question,
      answer: `${top.name}: ${amount(top.amount)}`,
      note: `${c.before.fees.of} ${amount(fees.r.account + fees.r.fund)} ${c.before.fees.ofTail}`,
      panel: () => <FeesPanel view={view} bundle={bundle} plan={livePlan} pick={pick} chosen={chosen} />,
    },
  ];
  if (changes) {
    const { run, held } = changes;
    const rows = changesAt(run, at, share, today);
    const first = rows[0]!;
    const d = first.diff;
    tabs.push({
      key: "sens",
      question: c.before.sens.question,
      answer: at === 0 || !d ? c.before.sens.none : c.plan.knobs.changes.nouns[first.l.id],
      note: at === 0 || !d ? `${c.plan.knobs.changes.planHead} ${amount(run.base.value as number)}` : `${shareWord(at)} ${(d.value as number) >= 0 ? c.before.sens.adds : c.before.sens.takes} ${amount(Math.abs(d.value as number))} ${c.before.sens.atEnd}`,
      held,
      panel: () => <PlanChanges run={run} at={at} onAt={setAt} share={share} today={today} />,
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
  return (
    // the shell's "back to the top" steps aside while the panels pass under it, as over the lists (`data-keep-clear`)
    <section aria-labelledby={`${idBase}-h`} className="flex flex-col gap-4" data-keep-clear>
      <h2 id={`${idBase}-h`} className="text-2xl font-semibold">
        {c.before.title}
      </h2>
      <TabCards tabs={tabs} current={shown.key} onChange={(k) => setOpen(k as Key)} ariaLabel={c.shownPair(chosen).tabs} openWord={c.before.openWord} idBase={idBase}>
        <Card pad="roomy">{shown.panel()}</Card>
      </TabCards>
    </section>
  );
}

/** Where the fees go: the chosen pair's fee items as bars, the largest first, then their total and why the tax is not among them. */
export function FeesPanel({ view, bundle, plan, pick, chosen }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; chosen: boolean }) {
  const f = c.before.fees;
  const dealApi = useDealAccounts();
  // the pair is priced once per plan for the receipt, the card and this panel (`pairCostsKept`)
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  if (!v.pc) return null;
  const fees = feeItems(view, bundle, plan, pick, v.pc, dealApi);
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
      </div>
    </div>
  );
}
