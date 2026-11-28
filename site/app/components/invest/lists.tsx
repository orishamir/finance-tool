// The index page's two linked lists. Nobody chooses an account or a fund alone: the outcome belongs to the pair. So an account is a stretch
// of what can be left, from what is left with its dearest fund to what is left with its cheapest (lib/stretch), and a fund is a spot
// inside the chosen account's stretch. Every priced pair makes the stretch, and on an index with both kinds only funds of the chosen fund's
// kind (a hedged fund is another holding, D28). The account list: every account, by what is left with its cheapest fund ("עד X"), each with
// a small copy of the ruler with its own stretch on it; after them one that prices only the other kind, then those that price no fund on
// the index, with why. The fund list: the funds the chosen account prices, in each kind by what they leave there, each by how much less (or
// more) it leaves than the pair in the receipt; the funds it gives no price stay a tap away, in a fold under the list, with why. Each row is one line: a name and one figure. From 1280 px the two lists stand
// either side of a ruler (`StretchChart`), the chosen account's stretch a band on it, every fund a spot in the band joined to its row; below
// that they stand one under the other, and each fund row carries a small copy of the chosen account's stretch with its own spot. What a
// row said beyond this (its standing-order and phone-only prices, a fund's labels and gap from the index) is in the receipt's account
// and fund parts, as labels and short facts under each name: the price list with the day it was collected, a fund typed by hand marked
// as the person's, and a fund's kind, number, document, yield and manager. The page shows no star on the cheapest account, no
// house's full name as a link, no deal's basis, no note that a fund is the same as one bought another way, and no choice of a customer
// group: every house is priced at its general price (D43, D103). What
// holds for the chosen row alone (an open question, no unit price) is said under the lists. A ranked house with a price list carries a
// file icon beside its name that opens its terms (deal-account.tsx, `TermsPopup`): its price list read-only on the plan, with what its
// price leaves out, a standing order's price the figure leaves out first (D41, D56, D106). The person's own deal carries its pencil
// instead; one that still misses a figure says which, on a line under its row. Before any pick the pair is the page's own and is named by
// where it is shown, the receipt (`invest.shownPair`).
import { useMemo, type ReactNode, type RefObject } from "react";
import { invest as c } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { fmt } from "../../lib/format";
import { shortFundName } from "../../lib/fund-name";
import { dollarBound, hasKinds, kindOf, pairValueFigure, tieShareOf, type FundWay, type InvestView, type WayPrice } from "../../lib/invest";
import { startsDeal, type IndicesBundle, type WorkbenchInputs } from "../../lib/providers";
import { priced, scaleOf, stretchOf, type Scale, type Stretch } from "../../lib/stretch";
import { differenceOf, type SiteValue } from "../../lib/value";
import { CatchesSaid, ListCatchMark, Num, Term, useSharedCatches, type Catch } from "../provenance";
import { AlsoChanged, Button, Disclosure, HelpMark, MixedName, PickList, StretchBar, StretchChart, Tag, cx, figureFit, type FoldOrder, type PickRow, type StretchSpot, type StretchTone } from "../kit";
import { AddEntryButton, FundEditMark } from "./custom-entries";
import { AddDealButton, DealEditMark, DealMissing, DeletedLine, NotMovedLines, TermsMark, useDealAccounts } from "./deal-account";
import { dealIdOf, isDealProviderId } from "../../lib/deal-account/bundle";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { optionClass, reasonText } from "./parts";
import { providerName } from "./sections";
import { pillName } from "./title";
import { ANCHOR, verdictOf } from "./receipt";
import { allFunds, inTieSet, labelsOf, pairVerdict, pickHalf, tieFundCount, tieFunds, bestFor, whyNoFundAt, noPriceLine, NoFundWords, type Moved, type OnPick, type Pick } from "./pair";

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

/**
 * A list's figure column named at its end; the items' column has no name, since the side's title above already says what they are. A catch
 * every row's figure carries is said once, by a caution "?" after the name (`catches`, `ListCatchMark`).
 */
function Head({ figure, lead, catches = [] }: { figure: string; lead?: ReactNode; catches?: readonly Catch[] }) {
  // `lead`: a heading on the head's own row, at its start, level with the figure's name
  return (
    <span className={cx("col-span-full flex gap-3", lead ? "items-center justify-between" : "items-end justify-end")}>
      {lead}
      <span className="text-end whitespace-nowrap">
        {figure}
        {catches.length > 0 && (
          <>
            {" "}
            <ListCatchMark catches={catches} name={figure} scope="column" />
          </>
        )}
      </span>
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

export function PairLists(props: ListsProps) {
  const { view, bundle, plan, livePlan, today, pick, chosen, onPick, moved, ruler = false, above } = props;
  const dealApi = useDealAccounts();
  const shared = useSharedCatches();
  const sp = c.shownPair(chosen);
  const funds = allFunds(view);
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
  // on an index with both kinds, only the chosen fund's kind sets a stretch: a hedged fund is another holding (D28, `opensOn`)
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
  // a house's terms are a deal filled from its latest price list: only where one fills (`startsDeal`)
  const hasTerms = (id: string) => bundle.snapshots.some((s) => s.id === id && startsDeal(s));
  const pricedHouses = providers.filter((p) => stretches.get(p.id)).sort((a, b) => stretches.get(b.id)!.best - stretches.get(a.id)!.best || a.short.localeCompare(b.short, "he"));
  const noWay = (p: (typeof providers)[number]) => {
    const at = fund.byHouse[p.id];
    return at && "availability" in at && at.availability ? at.availability : null;
  };
  const pricesAny = (id: string) => funds.some((f) => priced(f.byHouse[id]));
  // after the ranked accounts: one that prices only the other kind, then one that prices no fund on the index ("no data" first and "not
  // possible there" last), each with why
  const unpricedHouses = providers
    .filter((p) => !stretches.get(p.id))
    .sort((a, b) => Number(!pricesAny(a.id)) - Number(!pricesAny(b.id)) || Number(!!noWay(a)) - Number(!!noWay(b)) || a.short.localeCompare(b.short, "he"));
  const nameOf = (p: (typeof providers)[number], selected: boolean) => (
    <span className={cx("min-w-0 text-sm", selected ? "font-semibold" : "font-medium", (p.id === view.yourBroker || p.custom) && "text-entered")}>{p.short}</span>
  );
  // beside a ranked house's name, where it has a price list, the file icon that opens its terms, what its price leaves out among them
  // (D106); beside the person's own deal, the pencil that edits it
  const nameWithMark = (p: (typeof providers)[number], selected: boolean) => (
    <span className="flex min-w-0 items-center gap-1">
      {nameOf(p, selected)}
      {p.custom ? <DealEditMark id={p.id} /> : hasTerms(p.id) && <TermsMark id={p.id} house={p.short} />}
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
  // the figure each ranked account's row shows (the chosen one shows a word): a catch all of them carry is said once, in the list's head
  const accountCatches = shared(
    pricedHouses.map((p) => {
      const s = stretches.get(p.id);
      const best = s && p.id !== pick.house ? funds.find((f) => f.rec.id === s.bestFund)?.byHouse[p.id] : undefined;
      return priced(best) ? best.value : null;
    }),
  );
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
  // two funds that would show one name: each also says the labels that tell them apart (where it trades, its kind), else its number;
  // never its tax labels (founder, 2026-11-25)
  const byName = new Map<string, FundWay[]>();
  for (const f of funds) byName.set(listName(view, f.name), [...(byName.get(listName(view, f.name)) ?? []), f]);
  const apart = (f: FundWay): string | null => {
    const same = byName.get(listName(view, f.name))!;
    if (same.length < 2) return null;
    const texts = (x: FundWay) => labelsOf(view, x, bundle).filter((l) => l.family !== "tax").map((l) => l.text);
    const mineL = texts(f);
    const differs = mineL.filter((t) => !same.every((x) => texts(x).includes(t)));
    return differs.length > 0 ? differs.join(" · ") : `${c.pair.colNumber} ${f.number}`;
  };
  const kindRank = (f: FundWay) => (kinds && kindOf(f.rec) === "hedged" ? 1 : 0);
  // each kind: the funds by what is left (`HouseRow.entries`'s order)
  const pricedAt = (house: string) => funds.filter((f) => priced(f.byHouse[house])).sort((a, b) => kindRank(a) - kindRank(b) || (b.byHouse[house] as WayPrice).valueN - (a.byHouse[house] as WayPrice).valueN);
  const pricedFunds = pricedAt(pick.house);
  // every order the fund list can take, one per account: a phone's fold holds the tallest rows of any of them, so a pick of an account
  // moves nothing below the list
  // the row that opens a group: the hedged kind's first
  const groupStarts = (fs: FundWay[]) => new Set(fs.filter((f, i) => { const prev = fs[i - 1]; return kinds && kindOf(f.rec) === "hedged" && (!prev || kindOf(prev.rec) !== "hedged"); }).map((f) => f.rec.id));
  // the chosen account is the person's deal with no price for buying abroad (E): its funds bought abroad, priced at every other account, fold into one line that says so and opens the deal on its buy-and-sell block
  const abroadLacks = isDealProviderId(pick.house) ? (dealApi?.abroadLacks(pick.house) ?? null) : null;
  const abroadFolded = abroadLacks ? funds.filter((f) => f.option === "abroad" && !priced(f.byHouse[pick.house])) : [];
  // the funds an account gives no price stand in the list like the rest, grey, each kind's after its priced funds, with why in the
  // figure's place (founder, 2026-11-28: no fold of their own)
  const unpricedAt = (house: string) => funds.filter((f) => !priced(f.byHouse[house]) && !(house === pick.house && abroadFolded.includes(f)));
  const listAt = (house: string) => {
    const p = pricedAt(house);
    const u = unpricedAt(house);
    return [0, 1].flatMap((k) => [...p.filter((f) => kindRank(f) === k), ...u.filter((f) => kindRank(f) === k)]);
  };
  const orders: FoldOrder[] = [...new Set([...pricedHouses.map((p) => p.id), pick.house])].map((h) => {
    const fs = listAt(h);
    return { keys: fs.map((f) => f.rec.id), headings: groupStarts(fs), choosable: new Set(pricedAt(h).map((f) => f.rec.id)), keep: new Set(fs.filter((f) => isCustomFund(f.rec)).map((f) => f.rec.id)) };
  });
  const cur = view.index.exposure?.currency ?? "USD";
  const names = view.index.exposure?.other_currencies === true ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  const hedgedHeading = (
    <span className="flex items-center gap-1.5 font-medium text-foreground">
      <span aria-hidden="true" className="inline-block size-2 rounded-full bg-chart-kind-hedged" />
      {names.hedged}
    </span>
  );
  const listed = listAt(pick.house);
  const starts = groupStarts(listed);
  const headingOf = (id: string) => (starts.has(id) ? hedgedHeading : null);
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
  // what a fund leaves against the pick, the two as the list writes them (method §13): its word and its order come from it, and a doubt on
  // either (the site's cautious reading of an open tax index) is the difference's (`differenceOf`)
  const diff = (f: FundWay, at: WayPrice) => differenceOf([c.pair.input(f.name, c.pair.colLeft), at.value], [pickKey, selAt.value], "F-65", { today, about: sp.diffAbout });
  // each ranked fund's spot in the chosen account's stretch: its pair's value, or, for a fund of the other kind, where its difference from the
  // pair in the receipt runs over the dollar's range (a segment, held inside the scale's ends)
  const spots: Record<string, StretchSpot> = {};
  // a hedged fund's spot, line and dot in the hedged kind's colour (the dollar charts' and the group head's), on an index with both kinds
  const tones: Record<string, StretchTone> = {};
  for (const f of pricedFunds) {
    const x = cross.get(f.rec.id);
    spots[f.rec.id] = x ? [point + x.atLo, point + x.atHi] : (f.byHouse[pick.house] as WayPrice).valueN;
    if (kinds && kindOf(f.rec) === "hedged") tones[f.rec.id] = "hedged";
  }
  const dotTone = { fund: { ring: "ring-chart-by-fund", fill: "bg-chart-by-fund" }, hedged: { ring: "ring-chart-kind-hedged", fill: "bg-chart-kind-hedged" } } satisfies Record<StretchTone, { ring: string; fill: string }>;
  // the range's "?" says the same on every row of the other kind: it stands on the first of them only
  const firstCross = range ? pricedFunds.find((f) => f.rec.id !== pick.fund && cross.has(f.rec.id))?.rec.id : undefined;
  const pricedRow = (f: FundWay): PickRow => {
    const at = f.byHouse[pick.house] as WayPrice;
    const selected = f.rec.id === pick.fund;
    const x = cross.get(f.rec.id);
    const gap = diff(f, at);
    const n = typeof gap.value === "number" ? gap.value : 0;
    const figure = selected ? (
      chosenWord(chosen, "text-chart-by-fund")
    ) : x && range ? (
      // the difference over the dollar's range, in place of one amount; what the range is, in the "?" of the first such row
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {c.kinds.between} <Num animate value={x.lo} display={fmt.signedNisWhole} /> {c.kinds.and}
        <Num animate value={x.hi} display={fmt.signedNisWhole} />
        {f.rec.id === firstCross && (
          <>
            {" "}
            <HelpMark about={sp.diffAbout} text={`${c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}.`} />
          </>
        )}
      </span>
    ) : (
      // its difference signed, + or −, not in words (founder, 2026-11-25)
      figureCell(null, <Num animate value={gap} display={(v) => (Math.round(v) === 0 ? c.lists.funds.same : fmt.signedNisWhole(v))} />, n)
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
          {ruler && (spots[f.rec.id] !== undefined ? <span data-spot-dot="" aria-hidden="true" className={cx("size-[7px] rounded-full ring-[1.5px] ring-inset", dotTone[tones[f.rec.id] ?? "fund"].ring, selected && dotTone[tones[f.rec.id] ?? "fund"].fill)} /> : <span aria-hidden="true" className="size-[7px]" />)}
          {fundName(f, selected)}
          {figure}
          {!ruler && <StretchBar scale={scale} best={pickStretch?.best ?? null} worst={pickStretch?.worst ?? null} {...(spots[f.rec.id] !== undefined ? { spot: spots[f.rec.id] } : {})} spotTone={tones[f.rec.id] ?? "fund"} className="h-8" />}
          {selected && movedHere("house")}
        </>
      ),
    };
  };
  // a fund the chosen account gives no price: grey, why in a few words in the figure's place, which open the full reason and its source (the
  // fund's own reason where no account prices it, else the account's, as an account's row says it)
  const greyWord = (f: FundWay) => {
    const at = f.byHouse[pick.house];
    if (!at && f.reason) {
      const word = c.lists.funds.whyCode[f.reason.code] ?? c.lists.funds.why.other;
      return (
        <Term id={[]} name={word} parts={[{ text: reasonText(f.reason, optionClass[f.option]) }]}>
          {word}
        </Term>
      );
    }
    const told = whyNoFundAt(bundle, pick.house, [f]);
    const code = at && "reason" in at ? at.reason.code : undefined;
    const word = told.state === "other" && code ? (c.lists.funds.whyCode[code] ?? c.lists.funds.why.other) : c.lists.funds.why[told.state];
    return (
      <NoFundWords told={told} name={noPriceLine(bundle, pick.house, f, short)}>
        {word}
      </NoFundWords>
    );
  };
  const greyRow = (f: FundWay): PickRow => ({
    key: f.rec.id,
    countAs: f.rec.identifiers?.isin ?? f.rec.id,
    ...(isCustomFund(f.rec) ? { keep: true } : {}),
    ...(headingOf(f.rec.id) ? { heading: headingOf(f.rec.id) } : {}),
    selected: false,
    muted: true,
    // a fund no account prices is shown and never chosen; one another account prices is chosen with that account
    disabled: !f.byHouse[pick.house] && !!f.reason,
    onSelect: () => pickHalf(view, pick, { fund: f.rec.id }, onPick),
    cells: (
      <>
        {ruler && <span aria-hidden="true" className="size-[7px]" />}
        {fundName(f, false)}
        <span className="text-xs text-muted-foreground whitespace-nowrap">{greyWord(f)}</span>
        {!ruler && <span aria-hidden="true" />}
      </>
    ),
  });
  const fundRows: PickRow[] = listed.map((f) => (priced(f.byHouse[pick.house]) ? pricedRow(f) : greyRow(f)));

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
  // ---------------------------------------------------------------- what the page says of the chosen rows, under both lists
  const chosenNotes = [
    // a fund the person typed has no price collected: they left it empty
    fund.noUnitPrice ? <span key="unit">{isCustomFund(fund.rec) ? c.pair.unitPriceNotTyped : c.pair.unitPriceMissing}</span> : null,
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
    <div>
      <CatchesSaid catches={accountCatches}>
        <PickList
          look="line"
          tone="account"
          label={c.pair.listLabelAccounts}
          anchor={ANCHOR.accounts}
          columns={columnsAcc}
          head={<Head figure={c.lists.colLeft} catches={accountCatches} />}
          rows={accountRows}
        />
      </CatchesSaid>
    </div>
  );
  const accountsFoot = (
    <div className="flex flex-col gap-3">
      <NotMovedLines />
      <AddDealButton />
    </div>
  );
  const fundsList = (
    <div>
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
      <AddEntryButton />
    </div>
  );
  // what moves the rows: the picks, the plan the lists are sorted on, the index, the lists' sizes and the fold under the funds
  const watch = [view.index.id, pick.house, pick.fund, plan.amountNow, plan.monthly, plan.years, plan.grossReturn, plan.inflation, providers.length, funds.length, moved?.back ? 1 : 0].join("|");

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
        spots={spots}
        tones={tones}
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
