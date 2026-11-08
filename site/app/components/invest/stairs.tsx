// The stairs (founder, 2026-11-01; drawing A of 8dd1f013:research/specs/2026-11-01-indices-general/stairs.html): from one account and one fund, which
// single change leaves more at the end and by how much, taken one step at a time. Appended after the page's other sections and reading
// the same view: the start is the person's pick; every figure is the engine's (`buildInvest` for the rows, `pairCosts` for the stairs shown
// only), every difference a computation of F-91. The selection logic is `lib/stairs.ts`; the chart and the rows are the kit's.
import { memo, useMemo, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import { fundLabels } from "../../lib/labels";
import { pairCosts, type FundWay, type InvestView, type ProviderInfo, type WayPrice } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { LANES, byGain, chainOf, gridOf, middleStart, openTopOf, rowsAt, unitOf, yScale, type Lane, type Pos, type Row, type Stair, type Taken } from "../../lib/stairs";
import { computed, differenceOf, type SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { LeadTail, Num } from "../provenance";
import { wholeParts, MixedName, Card, LongestCase, useHeldHeight, DiffFigure, DiffHead, DiffRow, GreyLine, LabelRow, STAIRS_SLOTS, STAIR_SWATCH, StairsChart, StairsSteps, StairsTable, cx, type StairColumn, type StairHue, type StairStep } from "../kit";
import { allFunds, LONGEST_AMOUNT, LONGEST_LEFT } from "./pair";
import { ProviderLink, providerName } from "./sections";

/** A signed whole-shekel figure isolated for a Hebrew line: "+4,875 ₪", "−1,524 ₪", "0 ₪". */
const signedNis = (n: number) => (Math.round(n) === 0 ? fmt.nisWhole(0) : `⁦${n > 0 ? "+" : "−"}${fmt.nisWhole(Math.abs(n))}⁩`);
/** The lock after a name, held to its last word by `LeadTail` so it never stands alone on a line (2026-11-03). */
const lockIcon = (label: string) => <IconLock size={14} aria-label={label} className="inline-block align-[-1px] mx-0.5 text-blocked" />;
const NONE: Taken[] = [];
const hueOf = (lane: Lane | null): StairHue => lane ?? "start";

/** One stair with the three costs it takes, as the stairs show them. */
interface Level {
  stair: Stair;
  fundName: string;
  house: ProviderInfo;
  left: SiteValue;
  account: SiteValue;
  /** The fund's and the state's parts (F-91); null where the way's cost could not be split by who takes it (`pairCosts` gave none): the cell says so, never a 0. */
  fund: SiteValue | null;
  tax: SiteValue | null;
  /** The three costs less the stair before's, in whole shekels that add up to minus the difference in what is left (F-91); null for the start, and where this stair or the one before has no split. */
  dParts: [number, number, number] | null;
}

/** The status line's jump to the top pair: one element for the line and its unseen cases, which must wrap as it does. */
function JumpLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="text-link underline underline-offset-[3px] hover:no-underline" onClick={onClick} tabIndex={onClick ? undefined : -1}>
      {children}
    </button>
  );
}

export const StairsSection = memo(function StairsSection({ view, bundle, plan, startHouse, startFund, example }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; startHouse: string | null; startFund: string | null; /** Nothing is picked: the start is the page's example, never called "now" (2026-11-05). */ example: boolean }) {
  const today = bundle.today;
  const t = c.stairs;
  // the two cards hold the tallest height they have had on this index: another start drew fewer stairs, or shorter lists under them,
  // and everything below moved; the hold starts over on another index or screen width
  const heldChart = useHeldHeight<HTMLElement>(`${view.index.id}:chart`);
  const heldRows = useHeldHeight<HTMLElement>(`${view.index.id}:rows`);
  const g = useMemo(() => gridOf(view, bundle.snapshots), [view, bundle.snapshots]);
  const ways = useMemo(() => new Map<string, FundWay>(allFunds(view).map((f) => [f.rec.id, f])), [view]);
  const base: Pos | null = useMemo(() => (startHouse && startFund && g.cell(startHouse, startFund) ? { a: startHouse, f: startFund } : middleStart(g)), [g, startHouse, startFund]);
  const baseKey = base ? `${view.index.id}|${base.a}|${base.f}` : "";
  // what the person did on these stairs: it ends when the start (their pick) or the index changes
  const [done, setDone] = useState<{ key: string; start: Pos | null; taken: Taken[] }>({ key: "", start: null, taken: [] });
  const current = done.key === baseKey ? done : { key: baseKey, start: null, taken: NONE };
  const start = current.start ?? base;
  // where the person stands is the page's example until they take a step or jump: it is not called "now" (2026-11-05)
  const atExample = example && current.start === null && current.taken.length === 0;
  const chain = useMemo(() => (start ? (chainOf(g, { start, taken: current.taken }) ?? (base && base !== start ? chainOf(g, { start: base, taken: [] }) : null)) : null), [g, start, current.taken, base]);

  const priceAt = (p: Pos): WayPrice | null => {
    const at = ways.get(p.f)?.byHouse[p.a];
    return at && "valueN" in at ? at : null;
  };
  const nameOfFund = (id: string) => ways.get(id)?.name ?? id;
  const house = (id: string) => providerName(view, id)!;

  // the stairs on screen are the only pairs priced for their costs
  const chainKey = chain ? chain.chain.map((s) => `${s.pos.a}|${s.pos.f}`).join(",") : "";
  const levels: Level[] = useMemo(() => {
    if (!chain) return [];
    const out: Level[] = [];
    chain.chain.forEach((stair, i) => {
      const p = ways.get(stair.pos.f)?.byHouse[stair.pos.a];
      if (!p || !("valueN" in p)) return;
      const pc = pairCosts({ bundle, index: view.index, plan, fundId: stair.pos.f, providerId: stair.pos.a });
      const fundName = nameOfFund(stair.pos.f);
      const level: Level = {
        stair,
        fundName,
        house: house(stair.pos.a),
        left: p.value,
        account: p.cost(`${t.table.accountCost}: ${fundName}, ${house(stair.pos.a).short}`, false),
        fund: pc?.fund ?? null,
        tax: pc?.tax ?? null,
        dParts: null,
      };
      const prev = out[i - 1];
      if (prev && level.fund && level.tax && prev.fund && prev.tax) {
        const raw = [level.account, level.fund, level.tax].map((v, k) => (v.value as number) - ([prev.account, prev.fund!, prev.tax!][k]!.value as number)) as [number, number, number];
        // whole shekels that add up to the difference in what is left, so the three figures under a stair never disagree with the stair
        level.dParts = wholeParts(raw, -(stair.d ?? 0)) as [number, number, number];
      }
      out.push(level);
    });
    return out;
  }, [chainKey, bundle, view.index, plan, ways, today]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!chain || levels.length !== chain.chain.length) return null;
  const { ceiling } = chain;
  const rows = rowsAt(g, chain.at);
  const unit = unitOf(rows);
  const end = levels[levels.length - 1]!;
  const here = levels[chain.here]!;
  const fold = Math.max(0, levels.length - STAIRS_SLOTS);
  const visible = levels.slice(fold);
  const scale = yScale(g, chain.chain, ceiling);
  const ceilingPrice = priceAt(ceiling.pos)!;
  const nameOfPos = (p: Pos) => `${nameOfFund(p.f)}, ${house(p.a).short}`;

  const set = (next: Partial<{ start: Pos | null; taken: Taken[] }>) => setDone({ key: baseKey, start: current.start, taken: current.taken, ...next });
  const take = (r: { lane: Lane; to: Pos }) => set({ taken: [...current.taken, { lane: r.lane, to: r.to }] });
  const goTo = (i: number) => set({ taken: chain.chain.slice(1, i + 1).map((s) => ({ lane: s.lane!, to: s.pos })) });
  const reset = () => set({ taken: [] });
  const jump = (p: Pos) => set({ start: p, taken: [] });

  const delta = (n: number, a: SiteValue, an: string, b: SiteValue, bn: string, about: string) => computed(n, "nis", "F-91", { [an]: a, [bn]: b }, { today, about });
  const diffOf = (l: Level, prev: Level) => delta(l.stair.d ?? 0, l.left, `${t.about.left}: ${l.fundName}, ${l.house.short}`, prev.left, `${t.about.left}: ${prev.fundName}, ${prev.house.short}`, t.about.versus);
  const partOf = (l: Level, prev: Level, k: 0 | 1 | 2) => {
    const key = (["account", "fund", "tax"] as const)[k];
    const name = [t.table.accountCost, t.table.fundCost, t.table.tax][k]!;
    // read only where both stairs have their split (`dParts`), so every part is a figure
    return delta(l.dParts![k], l[key]!, `${name}: ${l.fundName}, ${l.house.short}`, prev[key]!, `${name}: ${prev.fundName}, ${prev.house.short}`, `${t.about.cost}: ${name}`);
  };

  // ---------------------------------------------------------------- the chart and what sits under it
  const columns: StairColumn[] = visible.map((l, i) => {
    const s = l.stair;
    const prevLevel = levels[fold + i - 1];
    const first = i === 0;
    return {
      id: `${fold + i}|${s.pos.a}|${s.pos.f}`,
      level: s.v,
      from: first || !prevLevel ? s.v : prevLevel.stair.v,
      top: first ? fmt.nisWhole(s.v) : signedNis(s.d ?? 0),
      hue: hueOf(s.lane),
      loses: (s.d ?? 0) < 0,
      taken: s.taken,
      open: s.open,
      current: fold + i === chain.here,
      label: `${s.lane ? t.lanes[s.lane].word : t.startPoint}: ${l.fundName}, ${l.house.short}`,
    };
  });
  const endsBelow = Math.round(end.stair.v) !== Math.round(ceiling.v);
  // what the steps on the chart add up to, from the start to the last: the chart's title (charts.md: a finding, not the topic)
  const first = levels[0]!;
  const climb = differenceOf([`${t.about.left}: ${end.fundName}, ${end.house.short}`, end.left], [`${t.about.left}: ${first.fundName}, ${first.house.short}`, first.left], "F-91", { today, about: t.panelTitle.about, round: Math.round });
  const climbN = typeof climb.value === "number" ? climb.value : 0;
  const climbTitle =
    levels.length < 2 ? (
      t.panelTitle.none
    ) : climbN >= 0 ? (
      <>
        {t.panelTitle.lead(levels.length - 1)} {t.panelTitle.more} <Num value={climb} /> {t.panelTitle.tail}
      </>
    ) : (
      <>
        {t.panelTitle.lead(levels.length - 1)} <Num value={climb} display={(v) => fmt.nisWhole(Math.abs(v))} /> {t.panelTitle.less} {t.panelTitle.tail}
      </>
    );

  const laneWord = (s: Stair) => (s.lane ? t.lanes[s.lane].word : t.startPoint);
  const tone = (l: Level, k: 0 | 1 | 2) => {
    const parts = l.dParts;
    if (!parts) return "";
    const big = Math.max(...parts.map((x) => Math.abs(x)));
    return Math.abs(parts[k]) === big && Math.abs(parts[k]) >= 1 ? "font-bold" : parts[k] === 0 ? "text-muted-foreground" : "";
  };
  const costCell = (l: Level, i: number, k: 0 | 1 | 2) => {
    const key = (["account", "fund", "tax"] as const)[k];
    const prev = levels[fold + i - 1];
    // the start shows its own costs; a stair whose split is missing (here or on the stair before) says so, never a difference against a 0
    const own = l[key];
    if (!prev) return own ? <Num value={own} /> : <span className="text-muted-foreground">{t.table.notSplit}</span>;
    if (!l.dParts) return <span className="text-muted-foreground">{t.table.notSplit}</span>;
    return (
      <span className={tone(l, k)}>
        <Num value={partOf(l, prev, k)} display={signedNis} />
      </span>
    );
  };
  const rowsTable = [
    {
      id: "what",
      head: <span className="text-foreground">{t.table.step}</span>,
      cells: visible.map((l) => (
        <span key={l.stair.pos.f + l.stair.pos.a} className="inline-flex min-h-7 items-center justify-center gap-1.5 font-semibold">
          {l.stair.lane && <i className={cx("inline-block size-3 flex-none rounded-[2px]", STAIR_SWATCH[l.stair.lane])} />}
          {laneWord(l.stair)}
        </span>
      )),
    },
    {
      id: "fund",
      head: t.table.fund,
      cells: visible.map((l) => (
        <span key={l.stair.pos.f + l.stair.pos.a} className={cx("block min-h-[3lh]", l.stair.lane === "kind" || l.stair.lane === "fund" ? "font-semibold" : "text-muted-foreground")}>
          <MixedName show={l.stair.open ? <LeadTail lead={l.fundName}>{lockIcon(t.lockLabel)}</LeadTail> : undefined}>{l.fundName}</MixedName>
        </span>
      )),
    },
    {
      id: "account",
      head: t.table.account,
      cells: visible.map((l) => (
        <span key={l.stair.pos.f + l.stair.pos.a} className={cx("block min-h-[3lh]", l.stair.lane === "account" ? "font-semibold" : "text-muted-foreground")}>
          <ProviderLink short p={l.house} className={l.stair.lane === "account" ? undefined : "text-muted-foreground"} />
        </span>
      )),
    },
    { id: "ac", head: t.table.accountCost, cells: visible.map((l, i) => <span key={i}>{costCell(l, i, 0)}</span>), className: "border-t border-border" },
    { id: "fc", head: t.table.fundCost, cells: visible.map((l, i) => <span key={i}>{costCell(l, i, 1)}</span>) },
    { id: "tx", head: t.table.tax, cells: visible.map((l, i) => <span key={i}>{costCell(l, i, 2)}</span>) },
    { id: "left", head: t.table.left, cells: visible.map((l, i) => <span key={i} className="block border-t border-border pt-1.5 text-base font-semibold"><Num value={l.left} /></span>) },
  ];

  const steps: StairStep[] = levels.map((l, i) => {
    const s = l.stair;
    const prev = levels[i - 1];
    const parts = prev && l.dParts ? ([0, 1, 2] as const).filter((k) => l.dParts![k] !== 0).map((k, n) => <span key={k}>{n > 0 && " · "}{[t.table.accountCost, t.table.fundCost, t.table.tax][k]} <Num value={partOf(l, prev, k)} display={signedNis} /></span>) : null;
    const what = !s.lane ? `${t.stepStart} ${l.fundName}, ${l.house.short}` : `${t.lanes[s.lane].word}: ${s.lane === "account" ? l.house.short : l.fundName}`;
    return {
      id: `${s.pos.a}|${s.pos.f}|${i}`,
      hue: hueOf(s.lane),
      loses: (s.d ?? 0) < 0,
      head: (
        <>
          {s.open ? <LeadTail lead={what}>{lockIcon(t.lockLabel)}</LeadTail> : what}
        </>
      ),
      delta: s.lane && prev ? <Num value={diffOf(l, prev)} display={signedNis} /> : <Num value={l.left} />,
      parts: parts && parts.length ? <>{parts}</> : null,
      next: !s.taken,
      label: what,
    };
  });

  // ---------------------------------------------------------------- the rows under it
  const hedgedChip = (f: string) => {
    const fw = ways.get(f);
    return fw ? fundLabels(fw.rec, view.index, fw.option).filter((l) => l.id === "hedged" || l.id === "hedged-many") : [];
  };
  // the account lane's grey lines name the fund; laid out unseen with the longest name, so the held height covers any start
  const longestName = [...new Set(allFunds(view).map((f) => f.name))].sort((a, b) => b.length - a.length)[0] ?? "";
  const whyWords = (lane: Lane, why: "u" | "n" | "d", unseen: boolean) => (lane === "account" ? t.whyFund[why](unseen ? longestName : here.fundName) : t.why[why]);
  const titleOf = (r: Row) => (r.lane === "account" ? house(r.to.a).short : r.lane === "kind" ? t.kinds[r.kind!] ?? r.kind! : nameOfFund(r.to.f));
  // `list`: the rows of a case laid out unseen (laneCases), with a turn on its second row, so the hold counts the turn's thicker line
  const laneBlock = (lane: Lane, list: readonly Row[] = rows, unseen = false) => {
    const mine = list.filter((r) => r.lane === lane);
    const priced = mine.filter((r) => r.d != null).sort(byGain);
    const grey = mine.filter((r) => r.d == null);
    return (
      <div key={lane} className="flex flex-col">
        <h4 className="mb-1 flex items-center gap-2 text-[15px] font-semibold">
          <i className={cx("inline-block size-3 flex-none rounded-[2px]", STAIR_SWATCH[lane])} />
          {t.lanes[lane].title}
        </h4>
        <DiffHead name={t.lanes[lane].head} left={t.rowHead.left} versus={atExample ? t.rowHead.versusExample : t.rowHead.versus} less={t.rowHead.less} more={t.rowHead.more} money={t.rowHead.money} />
        {priced.map((r, i) => {
          const price = priceAt(r.to)!;
          const sub = r.lane === "kind" ? <small className="text-xs font-normal text-muted-foreground"><MixedName>{nameOfFund(r.to.f)}</MixedName></small> : null;
          const chips = r.hedged ? hedgedChip(r.to.f) : [];
          const d = r.d!;
          const diffValue = delta(Math.abs(d), price.value, `${t.about.left}: ${nameOfFund(r.to.f)}, ${house(r.to.a).short}`, here.left, `${t.about.left}: ${here.fundName}, ${here.house.name}`, t.about.versus);
          return (
            <DiffRow
              key={r.key}
              name={
                <>
                  {r.open ? <LeadTail lead={titleOf(r)}>{lockIcon(t.lockLabel)}</LeadTail> : titleOf(r)}
                </>
              }
              sub={
                <>
                  {sub}
                  {chips.length > 0 && <LabelRow labels={chips} className="mt-0.5" />}
                </>
              }
              left={<Num value={price.value} />}
              d={d}
              unit={unit}
              open={r.open}
              turn={unseen ? i === 1 : i > 0 && priced[i - 1]!.d! >= 0 && d < 0}
              label={`${t.lanes[r.lane].word}: ${titleOf(r)}`}
              onTake={() => take(r)}
              diff={<DiffFigure d={d} words={{ more: t.more, fewer: t.fewer, same: t.same }} figure={<Num value={diffValue} />} />}
            />
          );
        })}
        {mine.length === 0 && <p className="border-t border-border px-1.5 py-1.5 text-xs text-muted-foreground">{t.noOtherFund}</p>}
        {(["u", "n", "d"] as const).map((why) => {
          const names = grey.filter((r) => r.why === why).map(titleOf);
          return names.length ? (
            <GreyLine key={why} why={whyWords(lane, why, unseen)}>
              {names.join(", ")}
            </GreyLine>
          ) : null;
        })}
      </div>
    );
  };
  // each list takes its own height: held at the tallest list any step could bring, the card kept up to 340 px blank under the lists
  // (founder, 2026-11-08: "remove unused space ... resize the container"); the card still holds the tallest it has been (useHeldHeight)
  const heldLane = (lane: Lane) => laneBlock(lane);

  // ---------------------------------------------------------------- what is true where the climb stopped
  const openTop = openTopOf(g);
  const openNote =
    openTop && openTop.v > ceiling.v ? (
      <>
        {" "}
        {t.openNote} <Num value={priceAt(openTop.pos)!.value} />: {nameOfPos(openTop.pos)}.
      </>
    ) : null;
  const gap = Math.round(ceiling.v) - Math.round(end.stair.v);
  const status =
    gap <= 0 ? (
      <>
        {t.statusTop}
        {openNote}
      </>
    ) : (
      <>
        {t.statusNone} <Num value={delta(gap, ceilingPrice.value, `${t.about.left}: ${nameOfPos(ceiling.pos)}`, end.left, `${t.about.left}: ${end.fundName}, ${end.house.name}`, t.about.ceilingGap)} />
        {t.statusTogether}{" "}
        <JumpLink onClick={() => jump(ceiling.pos)}>
          {t.jump} {nameOfPos(ceiling.pos)}
        </JumpLink>
        {openNote}
      </>
    );

  // the lines whose names and figures change with a pick or a plan, laid out unseen at their longest: every fund's name with the longest
  // account's, and the longest amount (fourth pass: 40 years at 12% put a long fund abroad in the status line, and the phone's
  // step card grew 38 px; a pick changed the heading's words and moved the card's inside 29 px)
  const longestHouse = view.providers.map((p) => p.short).sort((a, b) => b.length - a.length)[0] ?? "";
  const fundNames = [...new Set(allFunds(view).map((f) => f.name))];
  const sample = <Num value={computed(LONGEST_AMOUNT, "nis", "F-91", {}, { today, about: t.about.ceilingGap })} />;
  const sampleLeft = <Num value={computed(LONGEST_LEFT, "nis", "F-91", {}, { today, about: t.about.left })} />;
  const statusCases = [
    ...fundNames.map((n) => (
      <span key={`n${n}`}>
        {t.statusNone} {sample}
        {t.statusTogether}{" "}
        {/* the same button as the line's own: a button wraps as one box, and a span in its place held a line too few */}
        <JumpLink>
          {t.jump} {n}, {longestHouse}
        </JumpLink>
        {openTop && <> {t.openNote} {sampleLeft}: {longestName}, {longestHouse}.</>}
      </span>
    )),
    <span key="top">
      {t.statusTop}
      {openTop && <> {t.openNote} {sampleLeft}: {longestName}, {longestHouse}.</>}
    </span>,
  ];
  const ceilingCases = fundNames.map((n) => (
    <span key={n}>
      {t.ceilingLine} {sampleLeft}, {n}, {longestHouse}.
    </span>
  ));
  const hereCases = [t.hereExample, t.here].flatMap((lead) =>
    fundNames.map((n) => (
      <span key={lead + n} className="block text-lg font-semibold">
        {lead} <MixedName>{n}</MixedName>, {longestHouse}. {t.hereLeft} {sampleLeft}.
      </span>
    )),
  );

  return (
    <section aria-labelledby="invest-stairs-h" className="flex flex-col gap-4">
      <h2 id="invest-stairs-h" className="text-xl font-semibold">
        {t.title}
      </h2>
      <Card ref={heldChart} pad="roomy" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* the title is what the steps add up to, held at its longest so a step taken moves nothing under it */}
          <LongestCase className="min-w-0 flex-1" cases={[<h3 key="l" className="text-lg font-semibold">{t.panelTitle.lead(STAIRS_SLOTS)} {t.panelTitle.more} {sample} {t.panelTitle.tail}</h3>]}>
            <h3 className="text-lg font-semibold">{climbTitle}</h3>
          </LongestCase>
          <button type="button" onClick={reset} disabled={current.taken.length === 0} className="inline-flex min-h-11 items-center rounded-lg border border-border px-3.5 text-sm text-primary disabled:cursor-default disabled:text-muted-foreground disabled:opacity-50">
            {t.reset}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t.axisNote}</p>
        {/* one legend for the chart, above it, in the order of the steps (charts.md) */}
        <div className="flex flex-wrap gap-x-[18px] gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <i className={cx("inline-block size-3 rounded-[2px]", STAIR_SWATCH.start)} />
            {t.startPoint}
          </span>
          {LANES.map((l) => (
            <span key={l} className="inline-flex items-center gap-1.5">
              <i className={cx("inline-block size-3 rounded-[2px]", STAIR_SWATCH[l])} />
              {t.lanes[l].word}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block size-3 rounded-[2px] border-[1.5px] border-muted-foreground" />
            {t.legendNext}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {lockIcon(t.lockLabel)} {t.legendOpen}
          </span>
        </div>
        <StairsChart
          columns={columns}
          fold={fold}
          axis={{ lo: scale.LO, hi: scale.HI }}
          ceiling={{ level: ceiling.v, lines: [t.ceiling, fmt.nisWhole(ceiling.v), nameOfFund(ceiling.pos.f), house(ceiling.pos.a).short] }}
          endsAt={endsBelow ? { level: end.stair.v, text: `${t.endsAt} ${fmt.nisWhole(end.stair.v)}` } : null}
          now={atExample ? t.nowExample : t.now}
          label={t.chartLabel}
          onGo={goTo}
        />
        <div className="max-lg:hidden">
          <StairsTable rows={rowsTable} />
        </div>
        <div className="lg:hidden">
          <StairsSteps steps={steps} onGo={goTo} />
          <LongestCase className="mt-2 text-sm" cases={ceilingCases}>
            <p>
              {t.ceilingLine} <Num value={ceilingPrice.value} />, {nameOfPos(ceiling.pos)}.
            </p>
          </LongestCase>
        </div>
        <LongestCase className="mt-1 text-sm" cases={statusCases}>
          <p>{status}</p>
        </LongestCase>
      </Card>
      <Card ref={heldRows} pad="roomy" className="flex flex-col gap-2">
        <LongestCase cases={hereCases}>
          <h3 className="text-lg font-semibold">
            {atExample ? t.hereExample : t.here} <MixedName>{here.fundName}</MixedName>, <ProviderLink short p={here.house} />. {t.hereLeft} <Num value={here.left} />.
          </h3>
        </LongestCase>
        {/* the longer of the two sentences, so a pick moves nothing below it */}
        <LongestCase className="text-sm text-muted-foreground" cases={[<p key="e">{t.startExample}</p>, <p key="p">{t.startPicked}</p>]}>
          <p>{example ? t.startExample : t.startPicked}</p>
        </LongestCase>
        <p className="text-sm text-muted-foreground">{t.rowsHint}</p>
        <div className="grid items-start gap-x-9 gap-y-3 lg:grid-cols-2">
          {/* each lane held at its longest list on this index: on a phone they stand one under another, and a lane that grew moved the
              lanes and everything below it */}
          <div>{heldLane("account")}</div>
          <div className="flex flex-col gap-[22px]">
            {heldLane("kind")}
            {heldLane("fund")}
          </div>
        </div>
      </Card>
    </section>
  );
});
