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
// row said beyond this (its standing-order and phone-only prices, a fund's labels and gap from the index) is in the receipt's account
// and fund parts, as labels and short facts under each name: the price list with the day it was collected, a fund typed by hand marked
// as the person's, and a fund's kind, number, document, yield and manager. The page shows no star on the cheapest account, no
// house's full name as a link, no deal's basis, no note that a fund is the same as one bought another way, and no choice of a customer
// group: every house is priced at its general price (D43, D103). What
// holds for the chosen row alone (an open question, no unit price, a standing order's price the figure leaves out, whose words open the
// price, the record's reason and their documents) is said under the lists. A deal the person added that still misses a figure says which, on a
// line under its row. Before any pick the pair is the page's own and is named by where it is shown, the receipt (`invest.shownPair`).
import { useMemo, useState, type ReactNode, type RefObject } from "react";
import { flags, invest as c } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { fmt } from "../../lib/format";
import { shortFundName } from "../../lib/fund-name";
import { asideLines, dollarBound, hasKinds, kindOf, pairValueFigure, tieShareOf, type FundWay, type InvestView, type WayPrice } from "../../lib/invest";
import { leftOutOf, withAside, type LeftOutView } from "../../lib/left-out";
import type { FeesSnapshot } from "@finance-tool/schema";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { scaleOf, stretchOf, type Scale, type Stretch } from "../../lib/stretch";
import { differenceOf, type SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { AlsoChanged, Button, Disclosure, HelpMark, LeftOutMark, MixedName, PickList, StretchBar, StretchChart, Tag, cx, figureFit, type FoldOrder, type PickRow, type StretchSpot } from "../kit";
import { AddEntryButton, FundEditMark } from "./custom-entries";
import { AddDealButton, DealEditMark, DealMissing, DeletedLine, NotMovedLines, useDealAccounts } from "./deal-account";
import { dealIdOf, isDealProviderId } from "../../lib/deal-account/bundle";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { optionClass, reasonText } from "./parts";
import { providerName } from "./sections";
import { pillName } from "./title";
import { ANCHOR, verdictOf } from "./receipt";
import { allFunds, asideParts, inTieSet, labelsOf, pairVerdict, pickHalf, priced, tieFundCount, tieFunds, bestFor, whyNoFundAt, noPriceLine, NoFundWords, type Moved, type OnPick, type Pick } from "./pair";

/** A fund's name in the lists: without the index's own name where the fund's name holds it (lib/fund-name); the receipt has it whole. */
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
  /** From 1280 px: the lists stand either side of the ruler, under the receipt's ticket (`above`), whose total the ruler's point joins. */
  ruler?: boolean;
  above?: RefObject<HTMLElement | null>;
}

/** A list's figure column named at its end with its computed mark (every figure in the column is computed, so the mark stands in the head
 *  and the cells stay plain, design.md); the items' column has no name, since the side's title above already says what they are. */
function Head({ figure, lead }: { figure: string; lead?: ReactNode }) {
  // `lead`: a heading on the head's own row, at its start, level with the figure's name
  return (
    <span className={cx("col-span-full flex gap-3", lead ? "items-center justify-between" : "items-end justify-end")}>
      {lead}
      <span className="num num-computed num-sample text-end whitespace-nowrap">{figure}</span>
    </span>
  );
}

/** A side's heading: its title with its colour and count. */
function SideHead({ swatch, title, count }: { swatch: string; title: string; count: number }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-semibold">
      <span aria-hidden="true" className={cx("inline-block size-[0.6875rem] shrink-0 rounded-[3px]", swatch)} />
      {title}
      <Tag className="tabular-nums">{count}</Tag>
    </h3>
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
/** A line under a row (what a deal still misses, a tap's way back), across the row. */
const underRow = (node: ReactNode) => <span className="col-span-full pt-0.5 pb-1">{node}</span>;

/**
 * "חזרה ל…" under a row: the pick goes back, and the line with its button goes with it; the focus goes to the list's chosen row, the pick
 * put back, once the page has drawn it (two frames: the address changes, then the list), unless something else has taken it meanwhile.
 */
function backAndFocus(button: HTMLElement, back: () => void) {
  const list = button.closest<HTMLElement>("[role=radiogroup]");
  back();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body && document.activeElement.isConnected) return;
      list?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true });
    }),
  );
}

/** What the mark beside an account's name opens (D106): what its documents hold and its price leaves out, led by a standing order's price
 *  its price list prints and the figure for this fund leaves out (D41, D56), with the record's reason and their documents. */
export function markView(snap: FeesSnapshot | undefined, at: FundWay["byHouse"][string] | undefined): LeftOutView | null {
  return withAside(leftOutOf(snap), c.lists.otherPriceWords, priced(at) ? asideParts(asideLines(snap, at.aside)) : []);
}

export function PairLists(props: ListsProps) {
  const { view, bundle, plan, livePlan, today, pick, chosen, onPick, moved, ruler = false, above } = props;
  const dealApi = useDealAccounts();
  const sp = c.shownPair(chosen);
  const funds = allFunds(view);
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
  }, [kinds, range, bundle, view, plan, pick.fund, pick.house, mine, pickName, pickKey, today, sp.diffAbout]); // `funds` and `fund` are left out: they are the view's
  const house = providerName(view, pick.house);
  const selAt = fund?.byHouse[pick.house];
  if (!fund || !house || !priced(selAt)) return null;

  // ---------------------------------------------------------------- the stretches and the scale
  // on an index with both kinds, only the chosen fund's kind sets a stretch: a hedged fund is another holding (D28, `opensOn`); a pair on
  // an open rule is shown, not ranked (G-18), and sets none either (`stretchOf`)
  const kindFunds = kinds ? funds.filter((f) => kindOf(f.rec) === mine) : funds;
  const providers = view.providers;
  const stretches = new Map<string, Stretch | null>(providers.map((p) => [p.id, stretchOf(kindFunds, p.id)]));
  // the funds' stretch: the account the receipt prices
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
  const nameOf = (p: (typeof providers)[number], selected: boolean) => (
    <span className={cx("min-w-0 text-sm", selected ? "font-semibold" : "font-medium", (p.id === view.yourBroker || p.custom) && "text-entered")}>{p.short}</span>
  );
  // what an account's documents hold and its price leaves out, where it can change what some reader pays: a quiet mark beside the name
  // that opens it, so it is seen before the account is chosen (D106); the receipt says it under the chosen account's lines. A standing
  // order's price the account's price list prints and the figure for this fund leaves out (D41, D56) is the first thing its sheet says. A
  // deal's record lists nothing left out (lib/deal-account/bundle, `snapshotOfDeal`): its place beside the name holds the pencil that edits it
  const leftOutAt = new Map(providers.map((p) => [p.id, markView(snapOf(p.id), fund.byHouse[p.id])]));
  const nameWithMark = (p: (typeof providers)[number], selected: boolean) => (
    <span className="flex min-w-0 items-center gap-1">
      {nameOf(p, selected)}
      <LeftOutMark view={leftOutAt.get(p.id) ?? null} house={p.short} />
      {p.custom && <DealEditMark id={p.id} />}
    </span>
  );
  const movedHere = (half: "fund" | "house") =>
    moved?.back && moved.half === half
      ? underRow(
          <span className="block text-xs">
            <AlsoChanged stack what={half === "fund" ? c.pair.movedFund : c.pair.movedHouse(shortOf(moved.at.house))} back={c.pair.moveBackTo(shortOf(moved.prev.house))} onBack={(e) => moved.back && backAndFocus(e.currentTarget, moved.back)} />
          </span>,
        )
      : null;
  const accountRows: PickRow[] = [
    ...pricedHouses.map((p): PickRow => {
      const s = stretches.get(p.id)!;
      const selected = p.id === pick.house;
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
            {selected && movedHere("fund")}
          </>
        ),
      };
    }),
    ...unrankedHouses.map((p): PickRow => {
      const selected = p.id === pick.house;
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
              {p.custom && <DealEditMark id={p.id} />}
            </span>
            {selected ? chosenWord(chosen, "text-chart-by-account") : <span className="inline-flex items-center gap-1 text-xs text-blocked-foreground whitespace-nowrap"><IconLock size={14} />{c.lists.accounts.unranked}</span>}
            <StretchBar scale={scale} best={null} worst={null} className="h-6 max-xl:h-8" />
            {selected && movedHere("fund")}
          </>
        ),
      };
    }),
    ...unpricedHouses.map((p): PickRow => {
      // a house with no price for any fund on the index has nothing to show as a pair: its row stays, with the reason, and is never chosen;
      // one that prices only the other kind is picked with a fund it prices
      const none = !pricesAny(p.id);
      // its row says why over every kind of fund on the index, not only the chosen fund's kind
      const whole = none && !p.custom ? whyNoFundAt(bundle, p.id, funds) : null;
      // the words that say it are what opens why: the rule the record names for it, or the record's own reasons, each with its document
      // ("instead of the ? just have the label be clickable for information and source", 2026-11-12)
      const told = whole ?? whyNoFundAt(bundle, p.id, [fund]);
      // the person's deal waiting for a price (D1): its row names the fee it waits for, in a dashed card, in place of a reason to tap, and a
      // tap on it, as on its "להשלים", opens the deal on that fee
      const at = fund.byHouse[p.id];
      const reason = at && "reason" in at ? at.reason : undefined;
      const waits = isDealProviderId(p.id) && reason?.code === "deal-unpriced" ? reason.missing : null;
      const waitingId = waits ? dealIdOf(p.id) : null;
      return {
        key: p.id,
        selected: false,
        muted: true,
        ...(waits ? { dashed: true } : {}),
        ...(none && !waitingId ? { disabled: true } : {}),
        onSelect: waitingId && waits ? () => dealApi?.open({ dealId: waitingId, fee: waits.fee }) : none ? () => undefined : () => pickHalf(view, pick, { house: p.id }, onPick),
        cells: (
          <>
            <span className="flex min-w-0 items-center gap-1">
              {nameOf(p, false)}
              {p.custom && <DealEditMark id={p.id} complete missing={waits} />}
            </span>
            {waits ? (
              <span aria-hidden="true" />
            ) : (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                <NoFundWords told={told} name={c.pair.noPriceAt.other(p.short)}>
                  {/* the words follow the reason's own order (a doubt in the record first), so they never differ from the card they open */}
                  {c.pair.noFund[told.state]}
                </NoFundWords>
              </span>
            )}
            <span aria-hidden="true" className="w-[9px]" />
            {waitingId && waits && underRow(<DealMissing id={p.id} missing={waits} />)}
          </>
        ),
      };
    }),
  ];
  // a deal just deleted from the popup is said where its row stood (G): over the row now at its place, or after the ranked rows
  const deleted = dealApi?.deleted;
  if (deleted) {
    const at = Math.min(deleted.at ?? pricedHouses.length, accountRows.length);
    const line = <DeletedLine name={deleted.name} />;
    if (at < accountRows.length) accountRows[at] = { ...accountRows[at]!, heading: line };
    else accountRows.push({ key: "deleted-deal", selected: false, disabled: true, onSelect: () => undefined, cells: <span className="col-span-full">{line}</span> });
  }

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
  // the chosen account is the person's deal with no price for buying abroad (E): its funds bought abroad, read before tax at every other
  // account, fold into one line that says so and opens the deal on its buy-and-sell block
  const abroadLacks = isDealProviderId(pick.house) ? (dealApi?.abroadLacks(pick.house) ?? null) : null;
  const abroadFolded = abroadLacks ? funds.filter((f) => f.option === "abroad" && !beforeTaxAt(f) && !priced(f.byHouse[pick.house])) : [];
  const unpricedFunds = funds.filter((f) => !priced(f.byHouse[pick.house]) && !beforeTaxAt(f) && !abroadFolded.includes(f)).sort((a, b) => kindRank(a) - kindRank(b));
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
  // a fund the person typed: its name in the entered ink and, beside it, the pencil that opens its panel, as a deal's row in the account list
  const fundName = (f: FundWay, selected: boolean) => {
    const sub = [apart(f), tiedHere(f.rec.id) ? c.pair.tiedWord : null].filter(Boolean).join(" · ");
    const typed = isCustomFund(f.rec);
    const name = (
      <span className={cx("min-w-0 text-sm [overflow-wrap:anywhere]", selected ? "font-semibold" : "font-medium", typed && "text-entered")}>
        <MixedName>{listName(view, f.name)}</MixedName>
        {sub && <span className="text-xs font-normal text-muted-foreground"> · {sub}</span>}
      </span>
    );
    return typed ? (
      <span className="flex min-w-0 items-center gap-1">
        {name}
        <FundEditMark id={f.rec.id} />
      </span>
    ) : (
      name
    );
  };
  // what a fund leaves against the pick, the two as the list writes them (method §13): its word and its order come from it. It carries the
  // fund's own labels, so a figure that rests on the site's cautious reading wears its doubt in the fund's row (`readingDoubtOf`)
  const diff = (f: FundWay, at: WayPrice) => differenceOf([c.pair.input(f.name, c.pair.colLeft), at.value], [pickKey, selAt.value], "F-65", { today, about: sp.diffAbout, labels: at.value.labels });
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
    const gap = diff(f, at);
    const n = typeof gap.value === "number" ? gap.value : 0;
    const figure = selected ? (
      chosenWord(chosen, "text-chart-by-fund")
    ) : x && range ? (
      // the difference over the dollar's range, in place of one amount; what the range is, in its "?"
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {c.kinds.between} <Num animate value={x.lo} display={fmt.signedNisWhole} /> {c.kinds.and}
        <Num animate value={x.hi} display={fmt.signedNisWhole} /> <HelpMark about={sp.diffAbout} text={`${c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}.`} />
      </span>
    ) : (
      figureCell(n < 0 ? c.lists.funds.less : n > 0 ? c.lists.funds.more : null, <Num animate value={gap} display={(v) => (Math.round(v) === 0 ? c.lists.funds.same : fmt.nisWhole(Math.abs(v)))} />, n)
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
    const under = unpricedFunds.filter((f) => greyKey(f) === k);
    // a fund's own reason, said once over every fund it holds for: in the plural over two or more
    const [one] = under;
    if (!k.includes("|")) return under.length > 1 && one?.reason ? reasonText(one.reason, optionClass[one.option], true) : k;
    const [line, to] = k.split("|") as [string, string];
    const told = whyNoFundAt(bundle, pick.house, under);
    const said = (
      <NoFundWords told={told} name={line}>
        {line}
      </NoFundWords>
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
          <span className="text-end text-sm font-semibold tabular-nums whitespace-nowrap">
            <Num value={at.left} />
          </span>
        </>
      ),
    };
  });
  const beforeTaxRules = [...new Set(beforeTaxFunds.map((f) => f.beforeTax!.ruleId))];
  const dealId = isDealProviderId(pick.house) ? dealIdOf(pick.house) : null;
  const abroadLine =
    abroadLacks && abroadFolded.length > 0 && dealId ? (
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
          {abroadLacks.kind === "trade" ? c.dealAccount.abroad.fold : c.dealAccount.abroad.foldCase(feeNameOf(abroadLacks.kind, abroadLacks.name))}
          <Button variant="inline" bold onClick={() => dealApi!.open({ dealId, fee: abroadLacks.fee })}>
            {c.dealAccount.abroad.foldAdd}
          </Button>
        </p>
        <Disclosure label={c.dealAccount.abroad.foldCount(abroadFolded.length)} look="link" summaryClassName="text-sm">
          <ul className="flex flex-col gap-1 text-sm">
            {abroadFolded.map((f) => (
              <li key={f.rec.id}>{fundName(f, false)}</li>
            ))}
          </ul>
        </Disclosure>
      </div>
    ) : null;
  const beforeTaxList =
    beforeTaxRows.length > 0 ? (
      <section className="flex flex-col">
        <div className="nums-plain">
          <PickList
            look="line"
            tone="fund"
            label={c.beforeTax.label(short)}
            columns="minmax(0,1fr) auto"
            head={
              <Head
                figure={c.beforeTax.colLeft}
                lead={
                  // why these funds have no figure after tax, and so no rank, behind a caution "?" beside the heading, with the rules it rests on
                  <h4 className="flex items-center gap-1.5 text-sm font-medium text-blocked-foreground">
                    <IconLock size={14} />
                    {c.beforeTax.heading}
                    <HelpMark
                      tone="caution"
                      about={c.beforeTax.heading}
                      text={[...beforeTaxRules.map((id) => c.beforeTax.note[id] ?? c.beforeTax.noteOther), c.beforeTax.noteTail].join(" ")}
                      rules={beforeTaxRules}
                    />
                  </h4>
                }
              />
            }
            rows={beforeTaxRows}
          />
        </div>
      </section>
    ) : null;

  // ---------------------------------------------------------------- what the page says of the chosen rows, under both lists
  const at = selAt;
  const chosenNotes = [
    at.open ? (
      <span key="open" className="inline-flex items-center gap-1 text-blocked-foreground">
        <IconLock size={14} />
        {c.lists.openRow}
      </span>
    ) : null,
    fund.noUnitPrice ? <span key="unit">{c.pair.unitPriceMissing}</span> : null,
  ].filter(Boolean);
  // under the lists, what holds for the chosen pair
  const note =
    chosenNotes.length > 0 ? (
      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        {chosenNotes.map((n, i) => (
          <p key={i}>{n}</p>
        ))}
      </div>
    ) : null;

  // ---------------------------------------------------------------- the two sides
  const columnsAcc = "minmax(0,1fr) auto auto";
  const columnsFund = ruler ? "auto minmax(0,1fr) auto" : "minmax(0,1fr) auto auto";
  const accountsHead = (
    <SideHead
      swatch="bg-chart-by-account"
      title={c.lists.accounts.title}
      count={providers.length}
    />
  );
  const fundsHead = (
    <SideHead
      swatch="bg-chart-by-fund"
      title={c.lists.funds.title}
      count={funds.length}
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
        head={<Head figure={c.lists.colLeft} />}
        rows={accountRows}
      />
    </div>
  );
  const accountsFoot = (
    <div className="flex flex-col gap-3">
      <NotMovedLines />
      <AddDealButton />
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
        rows={fundRows}
      />
    </div>
  );
  const fundsFoot = (
    <div className="flex flex-col gap-3">
      {abroadLine}
      {beforeTaxList}
      {greyRows.length > 0 && (
        <Disclosure label={c.lists.funds.unpriced(new Set(unpricedFunds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size)} open={unpricedOpen} onOpenChange={setUnpricedOpen} look="link" summaryClassName="text-sm">
          <div className="nums-plain pt-1">
            <PickList look="line" tone="fund" label={c.lists.funds.unpricedLabel(short)} columns="minmax(0,1fr) auto" rows={greyRows} />
          </div>
        </Disclosure>
      )}
      <AddEntryButton />
    </div>
  );
  // what moves the rows: the picks, the plan the lists are sorted on, the index, the lists' sizes and the fold under the funds
  const watch = [view.index.id, pick.house, pick.fund, plan.amountNow, plan.monthly, plan.years, plan.grossReturn, plan.inflation, providers.length, funds.length, moved?.back ? 1 : 0, unpricedOpen].join("|");

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
        startAnchor={ANCHOR.accounts}
        endAnchor={ANCHOR.funds}
        scale={scale}
        band={pickStretch ? { best: pickStretch.best, worst: pickStretch.worst } : null}
        point={point}
        pointOpen={selAt.open}
        spots={spots}
        chosenStart={pick.house}
        chosenEnd={pick.fund}
        {...(above ? { above } : {})}
        tick={fmt.compactNisAxis}
        watch={watch}
      />
    );
  // the shell's "back to the top" steps aside while the lists pass under it (`data-keep-clear`): it covered their rows and figures, and the
  // receipt's stub is the way back up from here
  return (
    <div className="flex flex-col gap-8" data-keep-clear>
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
