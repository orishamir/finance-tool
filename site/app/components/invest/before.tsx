// "לפני שמחליטים", under the two lists of the index page: questions about the receipt's pair, a card each with its answer as a live figure,
// and one panel open under them. When another account is cheaper (F-131, a map over today's amount and the monthly deposit), what moves
// the result most (F-89, F-90), hedged or not (F-95, wherever the index has funds of both kinds and the section has its figures) and the
// stairs. Each answer reads the same computation as its panel, lifted here so a closed panel's card still answers; each waits until the
// plan has rested. An answer is plain words (a card is a tab, and a tab holds no control): the same figure in the open panel opens its
// sheet. The open card stays open while the plan or the pair changes.
import { useId, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import type { InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { Card, MixedName, TabCards, type TabCard } from "../kit";
import { AccountMapPanel, mapCard, NoMapPanel, useAccountMap } from "./account-map";
import { changesAt, PlanChanges, shareWord, usePlanChanges } from "./knobs";
import { DollarSection, dollarSwing, useDollarCase, type DollarCase } from "./dollar";
import { StairsSection, useStairs } from "./stairs";
import { pairVerdict, type Pick } from "./pair";

type Share = { min: number; max: number; step: number; start: number };

/** A whole-shekel amount in a card's plain words, isolated so it keeps its order inside Hebrew. */
const amount = (n: number) => `\u2066${fmt.nisWhole(n)}\u2069`;
type Key = "map" | "sens" | "hedge" | "stairs";

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
  const [open, setOpen] = useState<Key>("map");
  const [at, setAt] = useState(share.start);
  const today = bundle.today;
  const changes = usePlanChanges({ plan, share, bundle, view, pick });
  const mapRun = useAccountMap({ view, bundle, plan, pick });
  const dollar = useDollarCase(hedge ? view : null, bundle, plan, pick);
  const st = useStairs({ view: stairs.view, bundle: stairs.bundle, plan, startHouse: stairs.startHouse, startFund: stairs.startFund, example: stairs.startHouse === null });
  const verdict = pick ? pairVerdict(view, bundle, livePlan, pick, chosen) : null;
  const pc = verdict?.pc ?? null;
  // the section stands once the page's worker has sent its first sweep and its first map, so neither card's answer comes in a moment after
  // the rest and moves what is under it; the section is far below the screen's first view, and the two take about a second
  if (!pick || !pc || !verdict || changes === "waiting" || mapRun === "waiting") return null;

  const tabs: (TabCard & { key: Key; panel: () => ReactNode })[] = [];
  // the map of the fund and plan it was worked out for, while the next one is worked out; where no account is ranked with the fund, why
  if (mapRun) {
    const { answer, on, held } = mapRun;
    tabs.push({ ...mapCard(answer, view, bundle, pick.house, held), key: "map", panel: () => (answer.kind === "map" ? <AccountMapPanel view={view} bundle={on.bundle} house={pick.house} map={answer.map} on={on} /> : <NoMapPanel why={answer.why} />) });
  }
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
  const shown = tabs.find((t) => t.key === open) ?? tabs[0];
  if (!shown) return null;
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
