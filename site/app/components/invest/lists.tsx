// The index page's two linked lists. Nobody chooses an account or a fund alone: the outcome belongs to the pair. So an account is a stretch
// of what can be left, from what is left with its dearest fund to what is left with its cheapest (lib/stretch), and a fund is a spot
// inside the chosen account's stretch. Only ranked pairs make a stretch (a pair on an open rule is shown, not ranked, G-18), and on an index
// with both kinds only funds of the chosen fund's kind (a hedged fund is another holding, D28). The account list: every account, by what is
// left with its cheapest ranked fund ("עד X"), each with a small copy of the ruler with its own stretch on it; after them an account that
// ranks none ("לא מדורג", G-18), then one that prices only the other kind, then those that price no fund on the index, with why. The fund
// list: the funds the chosen account prices, in each kind the ranked ones by what they leave there and then the ones on an open rule under
// their heading, each by how much less (or more) it leaves than the pair in the receipt; the funds it gives no price stay a tap away, in a
// fold under the list, with why. Each row is one line: a name and one figure. From 1280 px the two lists stand
// either side of a ruler (`StretchChart`), the chosen account's stretch a band on it, every fund a spot in the band joined to its row; below
// that they stand one under the other, and each fund row carries a small copy of the chosen account's stretch with its own spot. What a
// row said beyond this (the house's groups, its standing-order and phone-only prices, a fund's labels and gap from the index) is in the
// card of the receipt's pair; what holds for the chosen row alone (an open question, no unit price, a price for some customers) is said
// under the lists. A row the person typed keeps its terms with the way to change them, on a line under it. Before any pick the pair is the
// page's own and is named by where it is shown, the receipt (`invest.shownPair`); with a group picked, its house's row keeps its price-list
// stretch and place (D43), and the fund list is priced at the group's prices, as the receipt is.
import { useMemo, useState, type ReactNode, type RefObject } from "react";
import { flags, invest as c, leftOut as leftOutCopy } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { fmt } from "../../lib/format";
import { shortFundName } from "../../lib/fund-name";
import { asideLines, dollarBound, hasKinds, kindOf, pairValueFigure, tieShareOf, type FundWay, type InvestView, type WayPrice } from "../../lib/invest";
import { isGroupProvider } from "../../lib/group-pick";
import { leftOutOf } from "../../lib/left-out";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { scaleOf, stretchOf, type Scale, type Stretch } from "../../lib/stretch";
import { differenceOf, type SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { Num, Term } from "../provenance";
import { AlsoChanged, Disclosure, HelpMark, LeftOutMark, LongestCase, MixedName, PickList, StretchBar, StretchChart, Tag, Tpl, cx, figureFit, type FoldOrder, type PickRow, type StretchSpot } from "../kit";
import { AddEntryButton, BrokerTerms, FundTerms } from "./custom-entries";
import { optionClass, reasonText } from "./parts";
import { providerName } from "./sections";
import { pillName } from "./title";
import { ANCHOR, verdictOf } from "./receipt";
import { AbroadNotes, OwnBankField, allFunds, inTieSet, labelsOf, nis, pairVerdict, pickHalf, priced, tieFundCount, tieFunds, bestFor, whyNoFundAt, noPriceLine, type Moved, type OnPick, type Pick } from "./pair";

/** A fund's name in the lists: without the index's own name where the fund's name holds it (lib/fund-name); the chosen pair's card has it whole. */
export const listName = (view: InvestView, name: string) => shortFundName(name, [pillName(view.index.name), ...(view.index.exposure?.names.he ?? []), ...(view.index.exposure?.names.en ?? []), ...(view.index.custom ? [view.index.custom.name] : [])]);

export interface ListsProps {
  view: InvestView;
  bundle: IndicesBundle;
  /** The plan the lists are priced on (it settles after a slider rests). */
  plan: WorkbenchInputs;
  /** The plan as the sliders stand: the headline follows it at once, as the receipt does. */
  livePlan: WorkbenchInputs;
  today: string;
  pick: Pick;
  /** The person picked this pair (it is in the address); else it is the page's own. */
  chosen: boolean;
  onPick: OnPick;
  /** The tap before changed the other half too: the chosen row of the list tapped says so, with the way back. */
  moved: Moved | null;
  /** The house's group picked in the account card: `pick.house` is then the held account priced at it, and this its house. */
  group: { house: string; key: string; name: string } | null;
  /** The bank where the person already has a current account, and its setter (D64). */
  ownBank?: { value: string | null; onChange: (id: string | null) => void };
  /** From 1280 px: the lists stand either side of the ruler, under the receipt's ticket (`above`), whose total the ruler's point joins. */
  ruler?: boolean;
  above?: RefObject<HTMLElement | null>;
}

/** A list's column names: the item at the start, the figure at the end with its computed mark (every figure in the column is computed, so
 *  the mark stands in the head and the cells stay plain, design.md), and its "?". */
function Head({ item, figure, help, itemHelp }: { item: string; figure: string; help: string; /** A "?" beside the name column's head (the codes in the funds' names). */ itemHelp?: ReactNode }) {
  return (
    <span className="col-span-full flex items-end justify-between gap-3">
      <span>
        {item}
        {itemHelp}
      </span>
      <span className="text-end whitespace-nowrap">
        <span className="num num-computed num-sample">{figure}</span> <HelpMark about={figure} text={help} />
      </span>
    </span>
  );
}

/** One figure column's name in a list head of several, on the list's grid: the computed mark, and its "?" bound to the name's last word, so a
 *  long name wraps on a phone and the mark never stands alone on a line. */
function HeadFigure({ figure, help }: { figure: string; help: string }) {
  const cut = figure.lastIndexOf(" ") + 1;
  return (
    <span className="text-end">
      {cut > 0 && <span className="num num-computed num-sample">{figure.slice(0, cut)}</span>}
      <span className="whitespace-nowrap">
        <span className="num num-computed num-sample">{figure.slice(cut)}</span> <HelpMark about={figure} text={help} />
      </span>
    </span>
  );
}

/** A side's heading: its title with its colour and count, what the side sets with a "?" beside it where the rows carry a small bar, and one quiet line. */
function SideHead({ swatch, title, count, lead, what, help, line }: { swatch: string; title: string; count: number; lead: string; what: string; help?: ReactNode; line: ReactNode }) {
  return (
    <header className="flex flex-col gap-0.5">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <span aria-hidden="true" className={cx("inline-block size-[0.6875rem] shrink-0 rounded-[3px]", swatch)} />
        {title}
        <Tag className="tabular-nums">{count}</Tag>
      </h3>
      {/* 8 px under the line with a "?", so the quiet line under it leaves the mark its whole 44 px */}
      <p className={cx("text-base", !!help && "mb-2")}>
        {lead} <span className="font-semibold">{what}</span>
        {help && <> {help}</>}
      </p>
      {line}
    </header>
  );
}

/** The word on the chosen row, in place of its figure: the receipt's pair's (`invest.shownPair`), in the side's colour. */
const chosenWord = (chosen: boolean, tone: string) => <span className={cx("text-sm font-semibold whitespace-nowrap", tone)}>{c.shownPair(chosen).row}</span>;
/** A row's figure: a word and the amount, the amount's cell as wide on every row, so the amounts stand in one column; a size down as a
 * typed plan's digits grow (`figureFit`). */
const figureCell = (word: ReactNode, amount: ReactNode, v: number) => (
  <span className="flex items-baseline justify-end gap-1.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
    {word && <span>{word}</span>}
    <span className={cx("min-w-[4.75rem] text-start text-sm text-foreground", figureFit(v))}>{amount}</span>
  </span>
);
/** A line under a row (a typed row's terms, a tap's way back), across the row. */
const underRow = (node: ReactNode) => <span className="col-span-full pt-0.5 pb-1">{node}</span>;

export function PairLists(props: ListsProps) {
  const { view, bundle, plan, livePlan, today, pick, chosen, onPick, moved, group, ownBank, ruler = false, above } = props;
  const sp = c.shownPair(chosen);
  const funds = allFunds(view);
  const [abroadOpen, setAbroadOpen] = useState(false);
  const [unpricedOpen, setUnpricedOpen] = useState(false);
  const kinds = hasKinds(view) && !!bundle.dollarRange;
  const range = bundle.dollarRange;
  const fund = funds.find((f) => f.rec.id === pick.fund);
  const pickName = fund?.name ?? pick.fund;
  const pickKey = c.pair.input(`${sp.name}, ${pickName}`, c.pair.colLeft);
  const mine = fund ? kindOf(fund.rec) : "unhedged";
  // a row of the other kind: its difference from the pick runs over the dollar's range (F-94), from the dollar's fall to its rise; each
  // difference is the row's pair less the pick's at the same end of P-02's range, the two figures its sheet opens
  const cross = useMemo(() => {
    const out = new Map<string, { atLo: number; atHi: number; lo: SiteValue; hi: SiteValue }>();
    if (!kinds || !range || !fund) return out;
    const bound = { lo: dollarBound(bundle, "lo"), hi: dollarBound(bundle, "hi") };
    const at = (f: { id: string; name: string }, end: "lo" | "hi") => pairValueFigure({ bundle, index: view.index, plan, fundId: f.id, providerId: pick.house, fxChange: range[end], about: f.name, dollarChange: bound[end] });
    const pLo = at({ id: pick.fund, name: pickName }, "lo"), pHi = at({ id: pick.fund, name: pickName }, "hi");
    if (!pLo || !pHi) return out;
    const gap = (v: SiteValue, name: string, p: SiteValue) => differenceOf([c.pair.input(name, c.pair.colLeft), v], [pickKey, p], "F-94", { today, about: sp.diffAbout, round: Math.round });
    for (const f of funds) {
      if (kindOf(f.rec) === mine || !priced(f.byHouse[pick.house])) continue;
      const lo = at({ id: f.rec.id, name: f.name }, "lo"), hi = at({ id: f.rec.id, name: f.name }, "hi");
      if (lo && hi) out.set(f.rec.id, { atLo: (lo.value as number) - (pLo.value as number), atHi: (hi.value as number) - (pHi.value as number), lo: gap(lo, f.name, pLo), hi: gap(hi, f.name, pHi) });
    }
    return out;
  }, [kinds, range, bundle, view, plan, pick.fund, pick.house, mine, pickName, pickKey, today, sp.diffAbout]); // eslint-disable-line react-hooks/exhaustive-deps -- `funds` and `fund` are the view's
  const baseHouse = group?.house ?? pick.house;
  const house = providerName(view, baseHouse);
  const selAt = fund?.byHouse[pick.house];
  if (!fund || !house || !priced(selAt)) return null;

  // ---------------------------------------------------------------- the stretches and the scale
  // on an index with both kinds, only the chosen fund's kind sets a stretch: a hedged fund is another holding (D28, `opensOn`); a pair on
  // an open rule is shown, not ranked (G-18), and sets none either (`stretchOf`)
  const kindFunds = kinds ? funds.filter((f) => kindOf(f.rec) === mine) : funds;
  const providers = view.providers.filter((p) => !isGroupProvider(p));
  const stretches = new Map<string, Stretch | null>(providers.map((p) => [p.id, stretchOf(kindFunds, p.id)]));
  // the funds' stretch: the account the receipt prices (a picked group's account, at the group's prices)
  const pickStretch = stretchOf(kindFunds, pick.house);
  const point = selAt.valueN;
  // the scale over every stretch; with none (no account ranks a fund of the kind), the values shown
  const scale: Scale = scaleOf([...stretches.values(), pickStretch].filter((s): s is Stretch => !!s)) ?? {
    lo: Math.min(point, ...kindFunds.flatMap((f) => providers.map((p) => f.byHouse[p.id]).filter(priced).map((a) => a.valueN))),
    hi: Math.max(point, ...kindFunds.flatMap((f) => providers.map((p) => f.byHouse[p.id]).filter(priced).map((a) => a.valueN))),
  };
  const short = house.short;
  const shortOf = (id: string) => providerName(view, id)?.short ?? id;

  // ---------------------------------------------------------------- the accounts
  const snapOf = (id: string) => bundle.snapshots.find((s) => s.id === id);
  const pricedHouses = providers.filter((p) => stretches.get(p.id)).sort((a, b) => stretches.get(b.id)!.best - stretches.get(a.id)!.best || a.short.localeCompare(b.short, "he"));
  const noWay = (p: (typeof providers)[number]) => {
    const at = fund.byHouse[p.id];
    return at && "availability" in at && at.availability ? at.availability : null;
  };
  const pricesAny = (id: string) => funds.some((f) => priced(f.byHouse[id]));
  const pricesKind = (id: string) => kindFunds.some((f) => priced(f.byHouse[id]));
  // after the ranked accounts: one whose every priced fund of the kind is on an open rule (shown, not ranked, G-18), then one that prices
  // only the other kind, then one that prices no fund on the index ("no data" first and "not possible there" last), each with why
  const unrankedHouses = providers.filter((p) => !stretches.get(p.id) && pricesKind(p.id)).sort((a, b) => a.short.localeCompare(b.short, "he"));
  const unpricedHouses = providers
    .filter((p) => !stretches.get(p.id) && !pricesKind(p.id))
    .sort((a, b) => Number(!pricesAny(a.id)) - Number(!pricesAny(b.id)) || Number(!!noWay(a)) - Number(!!noWay(b)) || a.short.localeCompare(b.short, "he"));
  // what the figures count and when the price lists were collected, after what the column is (its "?")
  const local = providers.filter((p) => !p.foreign && !p.custom);
  const saved = bundle.snapshots.filter((s) => providers.some((p) => p.id === s.id && !p.custom)).map((s) => s.snapshot).sort();
  const standingCount = local.filter((p) => funds.some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.standing; })).length;
  const asideCount = local.filter((p) => funds.some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.aside.length > 0; })).length;
  const leftHelp = [
    c.pair.colLeftHelp,
    plan.monthly === 0 ? c.pair.noMonthly : standingCount > 0 ? c.pair.standingNote(standingCount, local.length) : "",
    plan.monthly > 0 && asideCount > 0 ? c.pair.asideNote(asideCount, local.length) : "",
    c.lists.whichPrice,
    saved.length > 0 ? c.pair.collectedSpan(`⁦${fmt.date(saved[0]!)}⁩`, `⁦${fmt.date(saved.at(-1)!)}⁩`) : "",
  ]
    .filter(Boolean)
    .join(" ");
  const nameOf = (p: (typeof providers)[number], selected: boolean) => (
    <span className={cx("min-w-0 text-sm", selected ? "font-semibold" : "font-medium", (p.id === view.yourBroker || p.custom) && "text-entered")}>{p.short}</span>
  );
  // what an account's documents hold and its price leaves out, where it can change what some reader pays: a quiet mark beside the name
  // that opens it, so it is seen before the account is chosen (D106); the receipt says it under the chosen account's lines
  const leftOutAt = new Map(providers.map((p) => [p.id, leftOutOf(snapOf(p.id))]));
  const marked = providers.some((p) => (leftOutAt.get(p.id)?.warn ?? 0) > 0);
  const nameWithMark = (p: (typeof providers)[number], selected: boolean) => (
    <span className="flex min-w-0 items-center gap-1">
      {nameOf(p, selected)}
      <LeftOutMark view={leftOutAt.get(p.id) ?? null} house={p.short} />
    </span>
  );
  const movedHere = (half: "fund" | "house") =>
    moved?.back && moved.half === half
      ? underRow(
          <span className="block text-xs">
            <AlsoChanged stack what={half === "fund" ? c.pair.movedFund : c.pair.movedHouse(shortOf(moved.at.house))} back={c.pair.moveBackTo(shortOf(moved.prev.house))} onBack={moved.back} />
          </span>,
        )
      : null;
  const accountRows: PickRow[] = [
    ...pricedHouses.map((p): PickRow => {
      const s = stretches.get(p.id)!;
      const selected = p.id === baseHouse;
      const best = funds.find((f) => f.rec.id === s.bestFund)!.byHouse[p.id];
      return {
        key: p.id,
        selected,
        onSelect: () => pickHalf(view, pick, { house: p.id }, onPick),
        cells: (
          <>
            {nameWithMark(p, selected)}
            {selected ? chosenWord(chosen, "text-chart-by-account") : figureCell(c.lists.accounts.upTo, priced(best) && <Num animate value={best.value} />, s.best)}
            <StretchBar scale={scale} best={s.best} worst={s.worst} className="h-6 max-xl:h-8" />
            {p.custom && underRow(<BrokerTerms id={p.id} />)}
            {selected && movedHere("fund")}
          </>
        ),
      };
    }),
    ...unrankedHouses.map((p): PickRow => {
      const selected = p.id === baseHouse;
      return {
        key: p.id,
        selected,
        muted: true,
        onSelect: () => pickHalf(view, pick, { house: p.id }, onPick),
        cells: (
          <>
            <span className="flex min-w-0 items-center gap-1">
              {nameOf(p, selected)}
              {/* why its funds are shown and not ranked, in the rule's own words */}
              <HelpMark about={c.lists.accounts.unranked} text={flags["G-18"] ?? ""} />
              <LeftOutMark view={leftOutAt.get(p.id) ?? null} house={p.short} />
            </span>
            {selected ? chosenWord(chosen, "text-chart-by-account") : <span className="inline-flex items-center gap-1 text-xs text-blocked-foreground whitespace-nowrap"><IconLock size={14} />{c.lists.accounts.unranked}</span>}
            <StretchBar scale={scale} best={null} worst={null} className="h-6 max-xl:h-8" />
            {p.custom && underRow(<BrokerTerms id={p.id} />)}
            {selected && movedHere("fund")}
          </>
        ),
      };
    }),
    ...unpricedHouses.map((p): PickRow => {
      const na = noWay(p);
      // a house with no price for any fund on the index has nothing to show as a pair: its row stays, with the reason, and is never chosen;
      // one that prices only the other kind is picked with a fund it prices
      const none = !pricesAny(p.id);
      // its row says why over every kind of fund on the index, not only the chosen fund's kind
      const whole = none && !p.custom ? whyNoFundAt(bundle, p.id, funds) : null;
      // what the person typed says it ("the account sells no such fund"): their own words, no document. An account typed over a house carries
      // the house's record too, and a "no" that is the house's (Interactive Brokers on Tel Aviv) keeps the house's reason and rule
      const typedNo = p.custom && na?.source.url === "local";
      // the words that say it are what opens why: the rule the record names for it, or the record's own reasons, each with its document
      // ("instead of the ? just have the label be clickable for information and source", 2026-11-12)
      const told = whole ?? (typedNo ? { state: "notSold" as const, parts: [{ text: c.customEntries.notSold }], rules: [] } : whyNoFundAt(bundle, p.id, [fund]));
      return {
        key: p.id,
        selected: false,
        muted: true,
        ...(none ? { disabled: true } : {}),
        onSelect: none ? () => undefined : () => pickHalf(view, pick, { house: p.id }, onPick),
        cells: (
          <>
            {nameOf(p, false)}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <Term id={[]} name={c.pair.noPriceAt.other(p.short)} parts={told.parts} rules={told.rules}>
                {/* the words follow the reason's own order (a doubt in the record first), so they never differ from the card they open */}
                {c.pair.noFund[told.state]}
              </Term>
            </span>
            <span aria-hidden="true" className="w-[9px]" />
            {p.custom && underRow(<BrokerTerms id={p.id} />)}
          </>
        ),
      };
    }),
  ];

  // ---------------------------------------------------------------- the funds
  // before any pick, the page's own fund inside a tie of the cheapest pairs (F-80, P-01) is one of the tied, and every tied fund says so
  const tieBest = bestFor(view, pick);
  const theta = tieShareOf(bundle);
  const tiedFunds = chosen ? [] : tieFunds(view, tieBest, theta);
  const tieN = chosen ? 0 : tieFundCount(view, tieBest, theta);
  const markedTie = tieN > 1 && inTieSet(view, tieBest, pick, theta) ? tieN : 0;
  const tiedHere = (id: string) => markedTie > 0 && tiedFunds.includes(id);
  // two funds that would show one name: each also says the labels that tell them apart (where it trades, its kind), else its number
  const byName = new Map<string, FundWay[]>();
  for (const f of funds) byName.set(listName(view, f.name), [...(byName.get(listName(view, f.name)) ?? []), f]);
  const apart = (f: FundWay): string | null => {
    const same = byName.get(listName(view, f.name))!;
    if (same.length < 2) return null;
    const texts = (x: FundWay) => labelsOf(view, x, bundle).map((l) => l.text);
    const mineL = texts(f);
    const differs = mineL.filter((t) => !same.every((x) => texts(x).includes(t)));
    return differs.length > 0 ? differs.join(" · ") : `${c.pair.colNumber} ${f.number}`;
  };
  const kindRank = (f: FundWay) => (kinds && kindOf(f.rec) === "hedged" ? 1 : 0);
  const openAt = (f: FundWay, house: string) => ((f.byHouse[house] as WayPrice).open ? 1 : 0);
  // each kind: the ranked funds by what is left, then the ones on an open rule, shown and not ranked (`HouseRow.entries`'s order)
  const pricedAt = (house: string) => funds.filter((f) => priced(f.byHouse[house])).sort((a, b) => kindRank(a) - kindRank(b) || openAt(a, house) - openAt(b, house) || (b.byHouse[house] as WayPrice).valueN - (a.byHouse[house] as WayPrice).valueN);
  const pricedFunds = pricedAt(pick.house);
  // every order the fund list can take, one per account: a phone's fold holds the tallest rows of any of them, so a pick of an account
  // moves nothing below the list
  // the rows that open a group: the hedged kind's first, and the first on an open rule within each kind
  const groupStarts = (fs: FundWay[], house: string) => {
    const out = new Map<string, { hedged: boolean; open: boolean }>();
    fs.forEach((f, i) => {
      const prev = fs[i - 1];
      const hedged = kinds && kindOf(f.rec) === "hedged" && (!prev || kindOf(prev.rec) !== "hedged");
      const open = openAt(f, house) === 1 && (!prev || openAt(prev, house) === 0 || kindRank(prev) !== kindRank(f));
      if (hedged || open) out.set(f.rec.id, { hedged, open });
    });
    return out;
  };
  const orders: FoldOrder[] = [...new Set([...pricedHouses.map((p) => p.id), ...unrankedHouses.map((p) => p.id), pick.house])].map((h) => {
    const fs = pricedAt(h);
    return { keys: fs.map((f) => f.rec.id), headings: new Set(groupStarts(fs, h).keys()), choosable: new Set(fs.map((f) => f.rec.id)), keep: new Set(fs.filter((f) => isCustomFund(f.rec)).map((f) => f.rec.id)) };
  });
  // F-118 (D84): a fund whose tax rests on an open rule, priced before tax at the chosen account, stands in its own list under the funds
  const beforeTaxAt = (f: FundWay) => (priced(f.byHouse[pick.house]) ? undefined : f.beforeTax?.byHouse[pick.house]);
  const beforeTaxFunds = funds.filter((f) => beforeTaxAt(f));
  const unpricedFunds = funds.filter((f) => !priced(f.byHouse[pick.house]) && !beforeTaxAt(f)).sort((a, b) => kindRank(a) - kindRank(b));
  const cur = view.index.exposure?.currency ?? "USD";
  const names = view.index.exposure?.other_currencies === true ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  const hedgedHeading = (
    <span className="flex items-center gap-1.5 font-medium text-foreground">
      <span aria-hidden="true" className="inline-block size-2 rounded-full bg-chart-kind-hedged" />
      {names.hedged}
    </span>
  );
  // the funds on an open rule: one quiet heading over them, in the blocked colours, with the lock; their rows carry no tag
  const openHeading = (
    <span className="flex items-center gap-1.5 font-medium text-blocked-foreground">
      <IconLock size={14} />
      {c.lists.funds.unranked}
    </span>
  );
  const starts = groupStarts(pricedFunds, pick.house);
  const headingOf = (id: string) => {
    const g = starts.get(id);
    if (!g) return null;
    return g.hedged && g.open ? (
      <span className="flex flex-col gap-1.5">
        {hedgedHeading}
        {openHeading}
      </span>
    ) : g.hedged ? (
      hedgedHeading
    ) : (
      openHeading
    );
  };
  const fundName = (f: FundWay, selected: boolean) => {
    const sub = [apart(f), tiedHere(f.rec.id) ? c.pair.markedTie(markedTie) : null].filter(Boolean).join(" · ");
    return (
      <span className={cx("min-w-0 text-sm [overflow-wrap:anywhere]", selected ? "font-semibold" : "font-medium", isCustomFund(f.rec) && "text-entered")}>
        <MixedName>{listName(view, f.name)}</MixedName>
        {sub && <span className="text-xs font-normal text-muted-foreground"> · {sub}</span>}
      </span>
    );
  };
  const diff = (n: number, f: FundWay, at: WayPrice) => nis(n, "F-65", sp.diffAbout, today, { [c.pair.input(f.name, c.pair.colLeft)]: at.value, [pickKey]: selAt.value });
  // each ranked fund's spot in the chosen account's stretch: its pair's value, or, for a fund of the other kind, where its difference from the
  // pair in the receipt runs over the dollar's range (a segment, held inside the scale's ends); a fund on an open rule has none
  const spots: Record<string, StretchSpot> = {};
  for (const f of pricedFunds) {
    if ((f.byHouse[pick.house] as WayPrice).open) continue;
    const x = cross.get(f.rec.id);
    spots[f.rec.id] = x ? [point + x.atLo, point + x.atHi] : (f.byHouse[pick.house] as WayPrice).valueN;
  }
  const fundRows: PickRow[] = pricedFunds.map((f, i) => {
    const at = f.byHouse[pick.house] as WayPrice;
    const selected = f.rec.id === pick.fund;
    const x = cross.get(f.rec.id);
    const n = Math.round(at.valueN - selAt.valueN);
    const figure = selected ? (
      chosenWord(chosen, "text-chart-by-fund")
    ) : x && range ? (
      // the difference over the dollar's range, in place of one amount; what the range is, in its "?"
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {c.kinds.between} <Num animate value={x.lo} display={fmt.signedNisWhole} /> {c.kinds.and}
        <Num animate value={x.hi} display={fmt.signedNisWhole} /> <HelpMark about={sp.diffAbout} text={`${c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}.`} />
      </span>
    ) : (
      figureCell(n < 0 ? c.lists.funds.less : n > 0 ? c.lists.funds.more : null, <Num animate value={diff(n, f, at)} display={(v) => (Math.round(v) === 0 ? c.lists.funds.same : fmt.nisWhole(Math.abs(v)))} />, n)
    );
    const typed = isCustomFund(f.rec);
    return {
      key: f.rec.id,
      // the fold counts funds: the same fund in Tel Aviv and abroad is a row each and one fund
      countAs: f.rec.identifiers?.isin ?? f.rec.id,
      ...(typed ? { keep: true } : {}),
      ...(headingOf(f.rec.id) ? { heading: headingOf(f.rec.id) } : {}),
      selected,
      onSelect: () => pickHalf(view, pick, { fund: f.rec.id }, onPick),
      cells: (
        <>
          {ruler && (spots[f.rec.id] !== undefined ? <span data-spot-dot="" aria-hidden="true" className={cx("size-[7px] rounded-full ring-[1.5px] ring-inset ring-chart-by-fund", selected && "bg-chart-by-fund")} /> : <span aria-hidden="true" className="size-[7px]" />)}
          {fundName(f, selected)}
          {figure}
          {!ruler && <StretchBar scale={scale} best={pickStretch?.best ?? null} worst={pickStretch?.worst ?? null} {...(spots[f.rec.id] !== undefined ? { spot: spots[f.rec.id] } : {})} className="h-8" />}
          {typed && underRow(<FundTerms id={f.rec.id} />)}
          {selected && movedHere("house")}
        </>
      ),
    };
  });
  // the funds the chosen account gives no price: why, said once over the rows it holds for (the fund's own reason where no account prices
  // it, else the account's, with where a pick moves the account)
  const greyKey = (f: FundWay) => {
    const at = f.byHouse[pick.house];
    return !at && f.reason ? reasonText(f.reason, optionClass[f.option]) : `${noPriceLine(bundle, pick.house, f, short)}|${f.best && f.best.providerId !== pick.house ? f.best.providerId : ""}`;
  };
  // the account's words open why for the funds under them, as an account's row does: the rule the record names, or each kind's reason with
  // its document (D105; "המחיר בפסגות לא ברור בתעריפון" said nothing of what was unclear)
  const greyWords = (k: string) => {
    if (!k.includes("|")) return k;
    const [line, to] = k.split("|") as [string, string];
    const under = unpricedFunds.filter((f) => greyKey(f) === k);
    // an account the person typed that sells no such fund says it in their words, with no document
    const typedNo = under.every((f) => { const at = f.byHouse[pick.house]; return !!at && "availability" in at && at.availability?.source.url === "local"; });
    const told = typedNo ? { parts: [{ text: c.customEntries.notSold }], rules: [] } : whyNoFundAt(bundle, pick.house, under);
    const said = (
      <Term id={[]} name={line} parts={told.parts} rules={told.rules}>
        {line}
      </Term>
    );
    return to ? (
      <>
        {said}. {under.length > 1 ? c.lists.pickMovesMany(shortOf(to)) : c.pair.pickMoves(shortOf(to))}.
      </>
    ) : (
      <>{said}.</>
    );
  };
  const greyRows: PickRow[] = unpricedFunds.map((f, i) => {
    const k = greyKey(f);
    const head = i === 0 || greyKey(unpricedFunds[i - 1]!) !== k;
    const typed = isCustomFund(f.rec);
    return {
      key: f.rec.id,
      ...(head ? { heading: <span className="text-caution-foreground">{greyWords(k)}</span> } : {}),
      ...(typed ? { keep: true } : {}),
      selected: false,
      muted: true,
      // a fund no account prices (its reason stands over the row) is shown and never chosen
      disabled: !f.byHouse[pick.house] && !!f.reason,
      onSelect: () => pickHalf(view, pick, { fund: f.rec.id }, onPick),
      cells: (
        <>
          {fundName(f, false)}
          <span className="text-sm text-muted-foreground">—</span>
          {typed && underRow(<FundTerms id={f.rec.id} />)}
        </>
      ),
    };
  });

  // the funds on an open rule with their figures before tax at the chosen account (F-118, D84): never chosen, never set against the pair,
  // in the order of the fund list's records (no order by value: they are not ranked)
  const beforeTaxRows: PickRow[] = beforeTaxFunds.map((f) => {
    const at = beforeTaxAt(f)!;
    const typed = isCustomFund(f.rec);
    return {
      key: f.rec.id,
      ...(typed ? { keep: true } : {}),
      selected: false,
      disabled: true,
      onSelect: () => {},
      cells: (
        <>
          {fundName(f, false)}
          <span className="text-end text-sm tabular-nums whitespace-nowrap">
            <Num value={at.accountCost} />
          </span>
          <span className="text-end text-sm font-semibold tabular-nums whitespace-nowrap">
            <Num value={at.left} />
          </span>
          {typed && underRow(<FundTerms id={f.rec.id} />)}
        </>
      ),
    };
  });
  const beforeTaxRules = [...new Set(beforeTaxFunds.map((f) => f.beforeTax!.ruleId))];
  const beforeTaxList =
    beforeTaxRows.length > 0 ? (
      <section className="flex flex-col gap-1.5">
        <h4 className="flex items-center gap-1.5 text-sm font-medium text-blocked-foreground">
          <IconLock size={14} />
          {c.beforeTax.heading}
        </h4>
        <p className="max-w-measure text-xs text-muted-foreground">
          {beforeTaxRules.map((id) => (
            <Tpl
              key={id}
              t={c.beforeTax.note[id] ?? c.beforeTax.noteOther}
              vars={{
                term: (
                  <Term id={[]} name={c.beforeTax.heading} rules={[id]}>
                    {c.beforeTax.noteTerm}
                  </Term>
                ),
              }}
            />
          ))}{" "}
          {c.beforeTax.noteTail}
        </p>
        <div className="nums-plain">
          <PickList
            look="line"
            tone="fund"
            label={c.beforeTax.label(short)}
            columns="minmax(0,1fr) auto auto"
            head={
              <>
                <span>{c.pair.colFund}</span>
                <HeadFigure figure={c.beforeTax.colCharges} help={c.beforeTax.colChargesHelp} />
                <HeadFigure figure={c.beforeTax.colLeft} help={c.beforeTax.colLeftHelp} />
              </>
            }
            rows={beforeTaxRows}
          />
        </div>
      </section>
    ) : null;

  // ---------------------------------------------------------------- what the page says of the chosen rows, under both lists
  const at = selAt;
  const snap = snapOf(baseHouse);
  const otherPrice = snap?.groups?.state === "prices" || asideLines(snapOf(pick.house), at.aside).length > 0;
  const chosenNotes = [
    at.open ? (
      <span key="open" className="inline-flex items-center gap-1 text-blocked-foreground">
        <IconLock size={14} />
        {c.lists.openRow}
      </span>
    ) : null,
    fund.noUnitPrice ? <span key="unit">{c.pair.unitPriceMissing}</span> : null,
    otherPrice ? <span key="other">{c.lists.otherPrice(short, sp.cardTitle)}</span> : null,
  ].filter(Boolean);
  // what the ruler measures is its title, over it (`rulerHead`); under the lists, what holds for the chosen pair and how a tap moves them
  const note = (
    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      {chosenNotes.map((n, i) => (
        <p key={i}>{n}</p>
      ))}
      <p>{c.lists.note(ruler)}</p>
    </div>
  );

  // ---------------------------------------------------------------- the two sides
  const columnsAcc = "minmax(0,1fr) auto auto";
  const columnsFund = ruler ? "auto minmax(0,1fr) auto" : "minmax(0,1fr) auto auto";
  const accountsHead = (
    <SideHead
      swatch="bg-chart-by-account"
      title={c.lists.accounts.title}
      count={providers.length}
      lead={c.lists.accounts.sets.lead}
      what={c.lists.accounts.sets.what}
      // the small bar beside each account is its stretch: said in the "?" of the stretch it draws
      help={<HelpMark about={c.lists.accounts.sets.what} text={ruler ? c.lists.accounts.barRuler : c.lists.accounts.barAlone} />}
      line={<p className="text-xs text-muted-foreground">{c.lists.accounts.each}</p>}
    />
  );
  const spanOf = (id: string) => {
    const s = id === pick.house ? pickStretch : stretches.get(id);
    if (!s) return null;
    const worst = s.spots.at(-1)!.fund;
    const v = (fid: string) => (funds.find((f) => f.rec.id === fid)!.byHouse[id] as WayPrice).value;
    const nameF = (fid: string) => funds.find((f) => f.rec.id === fid)!.name;
    return nis(s.best - s.worst, "F-65", c.lists.funds.spanAbout(shortOf(id === pick.house ? baseHouse : id)), today, { [c.pair.input(nameF(s.bestFund), c.pair.colLeft)]: v(s.bestFund), [c.pair.input(nameF(worst), c.pair.colLeft)]: v(worst) });
  };
  const spanLine = (id: string, name: string, key?: string) => {
    const v = spanOf(id);
    return v ? (
      <p key={key} className="text-xs text-muted-foreground">
        <Tpl t={c.lists.funds.span} vars={{ house: <span className="font-semibold text-chart-by-account"><MixedName>{c.lists.funds.inHouse(name)}</MixedName></span>, span: <Num value={v} /> }} />
      </p>
    ) : null;
  };
  const fundsHead = (
    <SideHead
      swatch="bg-chart-by-fund"
      title={c.lists.funds.title}
      count={funds.length}
      lead={c.lists.funds.sets.lead}
      what={c.lists.funds.sets.what}
      // below 1280 px each fund carries a small bar of the chosen account's stretch with its own spot; the ruler says it above
      help={ruler ? undefined : <HelpMark about={c.lists.funds.sets.what} text={c.lists.funds.barAlone(short)} />}
      line={
        // held at its longest case, every account's, so a pick moves nothing under it
        <LongestCase cases={pricedHouses.map((p) => spanLine(p.id, p.short, p.id))}>{spanLine(pick.house, short)}</LongestCase>
      }
    />
  );
  const accountsList = (
    <div className="nums-plain">
      <PickList
        look="line"
        tone="account"
        label={c.pair.listLabelAccounts}
        anchor={ANCHOR.accounts}
        columns={columnsAcc}
        head={<Head item={c.pair.colAccount} figure={c.lists.colLeft} help={leftHelp} />}
        rows={accountRows}
      />
    </div>
  );
  const accountsFoot = (
    <div className="flex flex-col gap-3">
      {marked && <p className="text-xs text-muted-foreground">{leftOutCopy.markKey}</p>}
      <AddEntryButton kind="broker" />
      {ownBank && <OwnBankField view={view} bundle={bundle} value={ownBank.value} onChange={ownBank.onChange} />}
      <AbroadNotes view={view} bundle={bundle} open={abroadOpen} onOpenChange={setAbroadOpen} />
    </div>
  );
  const fundsList = (
    <div className="nums-plain">
      <PickList
        look="line"
        tone="fund"
        label={c.pair.listLabelFunds}
        anchor={ANCHOR.funds}
        columns={columnsFund}
        phoneLimit={ruler ? undefined : 6}
        orders={orders}
        more={c.pair.moreFunds}
        head={<Head item={c.pair.colFund} itemHelp={profileHelp(funds.map((f) => listName(view, f.name)))} figure={sp.vs} help={`${c.funds.diffHelp(kinds, false)} ${c.lists.whichPrice}`} />}
        rows={fundRows}
      />
    </div>
  );
  const fundsFoot = (
    <div className="flex flex-col gap-3">
      {beforeTaxList}
      {greyRows.length > 0 && (
        <Disclosure label={c.lists.funds.unpriced(new Set(unpricedFunds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size)} open={unpricedOpen} onOpenChange={setUnpricedOpen} look="link" summaryClassName="text-sm">
          <div className="nums-plain pt-1">
            <PickList look="line" tone="fund" label={c.lists.funds.unpricedLabel(short)} columns="minmax(0,1fr) auto" rows={greyRows} />
          </div>
        </Disclosure>
      )}
      {/* the order of the funds is the list's own: one weak line at it */}
      {kinds && <p className="text-xs text-muted-foreground">{c.funds.kindsNote}</p>}
      <AddEntryButton kind="fund" />
    </div>
  );
  // what moves the rows: the picks, the plan the lists are sorted on, the index, the lists' sizes and the fold under the funds
  const watch = [view.index.id, pick.house, pick.fund, plan.amountNow, plan.monthly, plan.years, plan.grossReturn, plan.inflation, plan.currentAccounts?.own ?? "", providers.length, funds.length, moved?.back ? 1 : 0, unpricedOpen].join("|");

  if (ruler)
    return (
      <StretchChart
        startHead={accountsHead}
        startList={accountsList}
        startFoot={accountsFoot}
        endHead={fundsHead}
        endList={fundsList}
        endFoot={fundsFoot}
        note={note}
        rulerHead={c.lists.rulerTitle}
        startAnchor={ANCHOR.accounts}
        endAnchor={ANCHOR.funds}
        scale={scale}
        band={pickStretch ? { best: pickStretch.best, worst: pickStretch.worst } : null}
        point={point}
        pointOpen={selAt.open}
        spots={spots}
        chosenStart={baseHouse}
        chosenEnd={pick.fund}
        {...(above ? { above } : {})}
        tick={fmt.compactNisAxis}
        watch={watch}
      />
    );
  return (
    <div className="flex flex-col gap-8">
      <ListsHead view={view} bundle={bundle} livePlan={livePlan} pick={pick} chosen={chosen} />
      <section className="flex flex-col gap-3">
        {accountsHead}
        {accountsList}
        {accountsFoot}
      </section>
      <section className="flex flex-col gap-3">
        {fundsHead}
        {fundsList}
        {fundsFoot}
      </section>
      {note}
    </div>
  );
}

/** Over the lists below 1280 px, where the receipt stands above them: what the page says of the chosen pair and what it leaves. */
function ListsHead({ view, bundle, livePlan, pick, chosen }: { view: InvestView; bundle: IndicesBundle; livePlan: WorkbenchInputs; pick: Pick; chosen: boolean }) {
  const v = pairVerdict(view, bundle, livePlan, pick, chosen);
  if (!v.pc) return null;
  const { words } = verdictOf(v, chosen);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  return (
    <div className="-mb-4 flex flex-col gap-1.5">
      <p className="text-xs font-medium text-primary">{c.lists.kicker}</p>
      <h2 className="text-xl font-semibold leading-snug">
        {words}: <MixedName>{v.nameOf(pick)}</MixedName>, <MixedName>{fund ? listName(view, fund.name) : pick.fund}</MixedName> · <Num value={v.pc.left} />
      </h2>
    </div>
  );
}

/**
 * The exposure profiles in the list's fund names, (4D) and the like (ETF-12): a "?" beside the fund column's head, whose sheet says each
 * code on the list in plain words over the term's glossary card. Nothing where no name carries one.
 */
function profileHelp(names: string[]): ReactNode {
  const w = c.pair.profile;
  const codes = [...new Set(names.flatMap((n) => [...n.matchAll(/\((\d[0A-F])\)/g)].map((m) => m[1]!)))].filter((x) => w.equity[x[0]!] && w.currency[x[1]!]).sort();
  if (codes.length === 0) return null;
  return <HelpMark term={["פרופיל חשיפה"]} about={w.about} lead={`${w.lead} ${w.term}. ${codes.map((x) => w.code(x, `${w.equity[x[0]!]} ${w.currency[x[1]!]}`)).join(". ")}.`} className="ms-1" />;
}
