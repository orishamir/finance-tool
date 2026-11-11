// The index page's two linked lists, after a short heading block: the accounts, each priced with the chosen fund, and the funds, each
// priced at the chosen account; a pick in one re-prices and re-sorts the other, and neither leaves a row out (a row with no price stays, with
// why). Every row has one shape and one height: a radio, the name with one small line, a fee bar on one scale for both lists (what the
// account and the fund take together), and what is left with its difference from the chosen pair. The rows with no price come last,
// under one line that says why; the hedged funds stand under a heading of their own. A teal line joins the two chosen rows where the
// lists stand side by side. What a row said beyond this (the house's groups, its standing-order and phone-only prices, a fund's other
// labels, its gap from the index) is in the card of the receipt's pair, for its account and fund. A row the person typed keeps its terms
// with the way to change them, priced or not. Before any pick the pair is the page's own and is named by where it is shown, the receipt
// (`invest.shownPair`); with a group picked, its house's row shows the group's account, the receipt's figure, and the differences are from it.
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { fmt } from "../../lib/format";
import { shortFundName } from "../../lib/fund-name";
import { asideLines, dollarBound, hasKinds, kindOf, pairCostsKept, pairValueFigure, tieShareOf, type FundWay, type InvestView, type Kind, type WayPrice } from "../../lib/invest";
import { isGroupProvider } from "../../lib/group-pick";
import { sharedLabels, type Label } from "../../lib/labels";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { sourceHref } from "../../lib/sources";
import { differenceOf, type SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { LeadTail, Num, ShortRow, shortRow, Term } from "../provenance";
import { AlsoChanged, Card, CostStack, LinkLine, HelpMark, LongestCase, MixedName, PickList, Swatch, Tag, cx, figureFit, useHeldHeight, type CostPart, type FoldOrder, type PickRow } from "../kit";
import { AddEntryButton, BrokerTerms, FundTerms } from "./custom-entries";
import { optionClass, reasonText } from "./parts";
import { providerName } from "./sections";
import { pillName } from "./title";
import { verdictOf } from "./receipt";
import { AbroadNotes, OwnBankField, allFunds, barScale, inTieSet, labelsOf, nis, pairVerdict, pickHalf, plus, tieFundCount, tieFunds, bestFor, otherWay, whyNoPrice, noPriceLine, type Moved, type OnPick, type Pick } from "./pair";

const priced = (x: WayPrice | { reason: unknown } | undefined): x is WayPrice => !!x && "valueN" in x;

/** The scale's far end as a clean figure, two leading digits (11,520 ₪ is 12,000 ₪): the bars' axis reads in round numbers. */
export function cleanEnd(x: number): number {
  if (x <= 0) return 0;
  const step = 10 ** Math.max(0, Math.floor(Math.log10(x)) - 1);
  return Math.ceil(x / step) * step;
}

/** A fund's name in the lists: without the index's own name where the fund's name holds it (lib/fund-name); the chosen pair's card has it whole. */
export const listName = (view: InvestView, name: string) => shortFundName(name, [pillName(view.index.name), ...(view.index.exposure?.names.he ?? []), ...(view.index.exposure?.names.en ?? []), ...(view.index.custom ? [view.index.custom.name] : [])]);

/**
 * What the fund takes over the plan (F-91's fund part), one run per fund and plan: the fund's cost is the same at every account
 * (PairCosts.fund is measured with no account), so a pick of another account prices nothing again.
 */
function fundCostOf(view: InvestView, bundle: IndicesBundle, plan: WorkbenchInputs) {
  return (f: FundWay): number | null => {
    const house = f.best?.providerId ?? Object.entries(f.byHouse).find(([, at]) => priced(at))?.[0];
    if (!house) return null;
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: f.rec.id, providerId: house });
    return pc && typeof pc.fund.value === "number" ? pc.fund.value : null;
  };
}

/** A row's fee bar: the account's part and the fund's, the one that changes down the list at the far end; on the scale both lists share. */
function FeeBar({ account, fund, accountFirst, scale, label, accountSource }: { account: number; fund: number; /** The funds list: the account's part at the zero line. */ accountFirst: boolean; scale: number; label: string; accountSource: string }) {
  const a: CostPart = { id: "account", name: c.receipt.parts.account, value: account, className: "bg-chart-by-account", ink: "text-chart-by-account", source: accountSource };
  const f: CostPart = { id: "fund", name: c.receipt.parts.fund, value: fund, className: "bg-chart-by-fund", ink: "text-chart-by-fund", source: c.pair.sourceFund };
  return <CostStack track size="sm" parts={accountFirst ? [a, f] : [f, a]} scale={scale} label={label} />;
}

/** The column names over a list: the item, the fees with the scale's two ends under them, and what is left. */
function Head({ item, scale, feesHelp, leftHelp }: { item: string; scale: number; feesHelp: string; leftHelp: string }) {
  return (
    <>
      <span>{item}</span>
      <span className="flex flex-col max-md:row-start-2 max-md:col-start-2 max-md:col-end-[-1]">
        <span className="whitespace-nowrap">
          <LeadTail lead={`${c.lists.colFees} `}>
            <HelpMark about={c.lists.colFees} text={feesHelp} />
          </LeadTail>
        </span>
        <span className="flex justify-between tabular-nums">
          <span>0</span>
          <span>{fmt.number(scale)}</span>
        </span>
      </span>
      <span className="text-end max-md:row-start-1 max-md:col-start-3">
        <LeadTail lead={`${c.lists.colLeft} `}>
          <HelpMark about={c.lists.colLeft} text={leftHelp} />
        </LeadTail>
      </span>
    </>
  );
}

/** The cells after the name: the bar (on its own line on a phone) and the figure with the line under it. */
const barCell = (bar: ReactNode) => <span className="min-w-0 max-md:row-start-2 max-md:col-start-2 max-md:col-end-[-1] max-md:pt-1">{bar}</span>;
const nameCell = (name: ReactNode, line: ReactNode) => (
  <span className="flex min-w-0 flex-col leading-snug">
    {name}
    <span className="text-xs text-muted-foreground">{line}</span>
  </span>
);
const figureCell = (top: ReactNode, under: ReactNode) => (
  <span className="flex flex-col items-end leading-snug text-end max-md:row-start-1 max-md:col-start-3">
    {top}
    <span className="text-xs text-muted-foreground whitespace-nowrap">{under}</span>
  </span>
);
const dash = <span className="text-sm text-muted-foreground">—</span>;
/** The word on the receipt's pair's own row, in place of a difference (`invest.shownPair`). */
const rowWord = (chosen: boolean) => <span className="font-medium text-primary">{c.shownPair(chosen).row}</span>;
/** A typed row's terms with the way to change or remove them, on a line of their own under its cells: the row stays the place to fix an
 *  entry, whether or not it can be chosen (the row is then as tall as its own cells, `ownHeight`). */
const termsCell = (terms: ReactNode) => <span className="col-start-2 col-end-[-1] row-start-2 max-md:row-start-3 pt-1">{terms}</span>;

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
  /** The tap before changed the other half too: the heading block says so, with the way back. */
  moved: Moved | null;
  /** The house's group picked in the account card: `pick.house` is then the held account priced at it, and this its house. */
  group: { house: string; key: string; name: string } | null;
  /** The bank where the person already has a current account, and its setter (D64). */
  ownBank?: { value: string | null; onChange: (id: string | null) => void };
}

export function PairLists(props: ListsProps) {
  const { view, bundle, plan, pick, group } = props;
  const fundCost = fundCostOf(view, bundle, plan);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const house = providerName(view, group?.house ?? pick.house);
  if (!fund || !house) return null;
  // one scale for both lists, so an account's bar and a fund's can be set side by side; the cut rule is the lists' (`barScale`), its end a
  // clean figure
  const ownFund = fundCost(fund) ?? 0;
  const accountTotals = view.providers.filter((p) => !isGroupProvider(p)).flatMap((p) => { const at = fund.byHouse[p.id]; return priced(at) ? [at.accountCost + ownFund] : []; });
  const fundTotals = allFunds(view).flatMap((f) => { const at = f.byHouse[pick.house]; const fc = fundCost(f); return priced(at) && fc !== null ? [at.accountCost + fc] : []; });
  const scale = cleanEnd(barScale([...accountTotals, ...fundTotals]));
  // what moves the two chosen rows: the picks, the plan the lists are sorted on, the index and the lists' sizes
  const watch = [view.index.id, pick.house, pick.fund, plan.amountNow, plan.monthly, plan.years, plan.grossReturn, plan.inflation, plan.currentAccounts?.own ?? "", view.providers.length, allFunds(view).length].join("|");
  return (
    <div className="flex flex-col gap-4">
      <ListsHead {...props} />
      <div className="relative grid items-start gap-5 @min-[57rem]:grid-cols-2 @min-[57rem]:gap-7">
        <AccountList {...props} scale={scale} fundCost={fundCost} />
        <FundList {...props} scale={scale} fundCost={fundCost} />
        <LinkLine watch={watch} className="hidden text-primary @min-[57rem]:block" />
      </div>
    </div>
  );
}

/** The heading block: what the page says of the chosen pair and what it leaves, how the two lists work, and the key to the bars. */
function ListsHead({ view, bundle, livePlan, pick, chosen, moved }: ListsProps) {
  const v = pairVerdict(view, bundle, livePlan, pick, chosen);
  if (!v.pc) return null;
  const { words } = verdictOf(v, chosen);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const short = (id: string) => providerName(view, id)?.short ?? id;
  const lead = (
    <p className="text-sm text-muted-foreground">
      <span className="@min-[57rem]:hidden">{c.lists.leadStacked}</span>
      <span className="hidden @min-[57rem]:inline">{c.lists.lead}</span>
    </p>
  );
  const longestHouse = view.providers.map((p) => p.short).sort((a, b) => b.length - a.length)[0] ?? "";
  // a tap that changed the other half too says so here, with the way back, in the sentence's place until the next pick: held at the
  // taller of the two, so it moves nothing
  const note = (what: string, back: string, onBack: () => void) => (
    <p className="text-sm">
      <AlsoChanged what={what} back={back} onBack={onBack} />
    </p>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-primary">{c.lists.kicker}</p>
      <h2 className="text-xl font-semibold leading-snug">
        {words}: <MixedName>{v.nameOf(pick)}</MixedName>, <MixedName>{fund ? listName(view, fund.name) : pick.fund}</MixedName> · <Num value={v.pc.left} />
      </h2>
      <LongestCase cases={[<Fragment key="l">{lead}</Fragment>, <Fragment key="n">{note(c.pair.movedHouse(longestHouse), c.pair.moveBackTo(longestHouse), () => undefined)}</Fragment>]}>
        {moved?.back ? note(moved.half === "fund" ? c.pair.movedFund : c.pair.movedHouse(short(moved.at.house)), c.pair.moveBackTo(short(moved.prev.house)), moved.back) : lead}
      </LongestCase>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{c.lists.keyLead}</span>
        <span className="inline-flex items-center gap-1.5">
          <Swatch shape="box" className="bg-chart-by-account" />
          {c.receipt.parts.account}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Swatch shape="box" className="bg-chart-by-fund" />
          {c.receipt.parts.fund}
        </span>
        <span>{c.shownPair(chosen).keyDiff}</span>
      </p>
    </div>
  );
}

/** A list card's title with its count, and the line naming the half the other list holds, held at its longest so a pick moves nothing. */
function CardHead({ title, count, line, cases }: { title: string; count: number; line: ReactNode; cases: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-4 pb-2">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        {title}
        <Tag className="tabular-nums">{count}</Tag>
      </h3>
      <LongestCase cases={cases}>{line}</LongestCase>
    </div>
  );
}

type Cost = (f: FundWay) => number | null;

function AccountList({ view, bundle, plan, today, pick, chosen, onPick, group, ownBank, scale, fundCost }: ListsProps & { scale: number; fundCost: Cost }) {
  const providers = view.providers.filter((p) => !isGroupProvider(p));
  const [abroadOpen, setAbroadOpen] = useState(false);
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44); the note on prices abroad opens at a tap
  const held = useHeldHeight<HTMLDivElement>(`${view.index.id}:${providers.length}:${abroadOpen}`);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const baseHouse = group?.house ?? pick.house;
  if (!fund) return null;
  // the chosen house's price-list figure: with a group picked, the house's row keeps it and its place (D43; the receipt prices the group),
  // and every difference is from it, the figure the chosen row shows
  const selAt = fund.byHouse[baseHouse];
  const fundPart = fundCost(fund) ?? 0;
  const sp = c.shownPair(chosen);
  const rows = providers.map((p) => ({ p, at: fund.byHouse[p.id] }));
  const ok = rows.filter((r): r is { p: (typeof r)["p"]; at: WayPrice } => priced(r.at)).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN);
  const noWay = (r: (typeof rows)[number]) => (r.at && "availability" in r.at && r.at.availability ? r.at.availability : null);
  // every house keeps a row: what cannot be priced comes last, "no data" first and "not possible there" last
  const missing = rows.filter((r) => !priced(r.at)).sort((a, b) => Number(!!noWay(a)) - Number(!!noWay(b)) || a.p.short.localeCompare(b.p.short, "he"));
  const snapOf = (id: string) => bundle.snapshots.find((s) => s.id === id);
  // a price for some customers that the figure leaves out: a group's (D43), or a standing order's (D41, D56)
  const otherPrice = (id: string, at: WayPrice | undefined) => snapOf(id)?.groups?.state === "prices" || (!!at && asideLines(snapOf(id), at.aside).length > 0);
  const houseName = providerName(view, baseHouse)?.short ?? baseHouse;
  const diff = (wp: WayPrice, name: string) =>
    priced(selAt) ? nis(wp.valueN - selAt.valueN, "F-65", sp.diffAbout, today, { [c.pair.input(name, c.pair.colLeft)]: wp.value, [c.pair.input(`${sp.name}, ${houseName}`, c.pair.colLeft)]: selAt.value }) : null;
  // what the cost column counts, and when the price lists were collected (its "?")
  const local = providers.filter((p) => !p.foreign && !p.custom);
  const saved = bundle.snapshots.filter((s) => providers.some((p) => p.id === s.id && !p.custom)).map((s) => s.snapshot).sort();
  const standingCount = local.filter((p) => allFunds(view).some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.standing; })).length;
  const asideCount = local.filter((p) => allFunds(view).some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.aside.length > 0; })).length;
  const feesHelp = [
    plan.monthly === 0 ? c.pair.noMonthly : standingCount > 0 ? c.pair.standingNote(standingCount, local.length) : "",
    plan.monthly > 0 && asideCount > 0 ? c.pair.asideNote(asideCount, local.length) : "",
    c.lists.whichPrice,
    saved.length > 0 ? c.pair.collectedSpan(`⁦${fmt.date(saved[0]!)}⁩`, `⁦${fmt.date(saved.at(-1)!)}⁩`) : "",
  ]
    .filter(Boolean)
    .join(" ");
  const nameOf = (p: (typeof providers)[number], at: WayPrice | undefined, selected: boolean) => (
    <span className={cx("text-sm", selected ? "font-semibold" : "font-medium", (p.id === view.yourBroker || p.custom) && "text-entered")}>
      {p.short}
      {otherPrice(p.id, at) && <span className="text-muted-foreground"> *</span>}
    </span>
  );
  type House = (typeof providers)[number];
  const terms = (p: House) => p.custom && termsCell(<BrokerTerms id={p.id} />);
  // `groupName`: the house's row while its group is picked, priced at the group's prices as the receipt is; its line names the group
  const pricedCells = (p: House, at: WayPrice, selected: boolean) => {
    const d = diff(at, p.short);
    return (
      <ShortRow when={shortRow(at.valueN, at.accountCost)}>
        {nameCell(nameOf(p, at, selected), <>{c.lists.charges} <Num animate value={at.cost(`${p.short}: ${c.pair.colChargesShort}`)} /></>)}
        {barCell(<FeeBar account={at.accountCost} fund={fundPart} accountFirst={false} scale={scale} label={`${p.short}: ${fmt.nisWhole(at.accountCost + fundPart)}`} accountSource={p.custom ? c.pair.sourceEntered : c.pair.sourceList(p.short)} />)}
        {figureCell(
          <span className={cx("text-sm font-semibold", figureFit(at.valueN))}>
            <Num animate value={at.value} />
          </span>,
          selected ? rowWord(chosen) : d && <Num animate value={d} display={plus} />,
        )}
        {terms(p)}
      </ShortRow>
    );
  };
  const greyCells = (p: House, at: FundWay["byHouse"][string] | undefined, f: FundWay) => {
    const na = noWay({ p, at });
    const other = otherWay(view, p.id)?.fund ?? null;
    const why = [na && p.custom ? c.customEntries.notSold : whyNoPrice(bundle, p.id, f), other ? `${c.pair.elsewhere} ${other.name}.` : ""].filter(Boolean).join(" ");
    return (
      <>
        {nameCell(
          <span className="flex items-center gap-1 text-sm font-medium">
            {nameOf(p, undefined, false)}
            {/* why this house gives the fund no price, in its record's words, and the fund a pick here moves to */}
            <HelpMark about={c.pair.noPriceAt.other(p.short)} text={why} />
          </span>,
          <>
            {na ? c.pair.notPossible : c.pair.noData}
            {na && !p.custom && (
              <>
                {" · "}
                <a href={sourceHref(na.source)} target="_blank" rel="noopener noreferrer" title={na.note ?? na.source.title} className="text-link hover:underline">
                  {c.pair.notPossibleSource} ↗
                </a>
              </>
            )}
          </>,
        )}
        {barCell(null)}
        {figureCell(dash, null)}
        {terms(p)}
      </>
    );
  };
  // the row as it stands with another fund: priced (at its largest charge), with no data, or not possible there. Laid out unseen, so the
  // rows hold the tallest of them (PickList `even`) and a pick that turns rows grey moves nothing below the list
  const caseOf = (p: House, at: FundWay["byHouse"][string] | undefined) => (priced(at) ? "priced" : noWay({ p, at }) ? "grey|na" : "grey|");
  const casesOf = (p: House, now: string) => {
    const by = new Map<string, { at: FundWay["byHouse"][string] | undefined; f: FundWay }>();
    for (const f of allFunds(view)) {
      const at = f.byHouse[p.id];
      const k = caseOf(p, at);
      const was = by.get(k)?.at;
      if (!was || (priced(at) && priced(was) && at.accountCost > was.accountCost)) by.set(k, { at, f });
    }
    return [...by].filter(([k]) => k !== now).map(([k, { at, f }]) => ({ key: k, cells: priced(at) ? pricedCells(p, at, false) : greyCells(p, at, f) }));
  };
  const pickRows: PickRow[] = ok.map(({ p, at }) => ({
    key: p.id,
    selected: p.id === baseHouse,
    ...(p.custom ? { ownHeight: true } : {}),
    onSelect: () => pickHalf(view, pick, { house: p.id }, onPick),
    cells: pricedCells(p, at, p.id === baseHouse),
    cases: casesOf(p, "priced"),
  }));
  // the rows with no price, under one line that says what a pick there does: a house that prices another fund of the index moves the fund too
  const greyRows: PickRow[] = missing.map(({ p, at }, i) => {
    const other = otherWay(view, p.id)?.fund ?? null;
    const lineOf = (k: number) => (otherWay(view, missing[k]!.p.id) ? c.lists.greyAccounts : c.lists.greyAccountsNone);
    const heading = i === 0 || lineOf(i - 1) !== lineOf(i) ? <span className="text-caution-foreground">{lineOf(i)}</span> : undefined;
    return {
      key: p.id,
      selected: p.id === baseHouse,
      muted: true,
      ...(heading ? { heading } : {}),
      ...(p.custom ? { ownHeight: true } : {}),
      // a house with no way on this index has nothing to show as a pair: its row stays, with the reason, and is never chosen
      disabled: !other,
      onSelect: () => pickHalf(view, pick, { house: p.id }, onPick),
      cells: greyCells(p, at, fund),
      cases: casesOf(p, caseOf(p, at)),
    };
  });
  const cut = ok.some((r) => r.at.accountCost + fundPart > scale);
  const anyOther = rows.some((r) => otherPrice(r.p.id, priced(r.at) ? r.at : undefined));
  const fundNames = [...new Set(allFunds(view).map((f) => listName(view, f.name)))];
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <CardHead
        title={c.receipt.parts.account}
        count={providers.length}
        line={
          <p className="text-sm text-muted-foreground">
            {c.lists.accountsWith} <MixedName>{listName(view, fund.name)}</MixedName>
          </p>
        }
        cases={fundNames.map((n) => (
          <p key={n} className="text-sm">
            {c.lists.accountsWith} <MixedName>{n}</MixedName>
          </p>
        ))}
      />
      <div className="px-1">
        <PickList
          look="outlined"
          even
          label={c.pair.listLabelAccounts}
          holdKey={view.index.id}
          columns="minmax(0,1fr) 6rem 6.5rem"
          phoneColumns="minmax(0,1fr) 7rem"
          head={<Head item={c.pair.colAccount} scale={scale} feesHelp={feesHelp} leftHelp={c.pair.colLeftHelp} />}
          rows={[...pickRows, ...greyRows]}
        />
      </div>
      <div className="flex flex-col gap-3 px-4 py-3">
        {anyOther || cut ? (
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {anyOther && <p>{c.lists.otherPrice}</p>}
            {cut && (
              <p className="flex items-center gap-1.5">
                <Swatch shape="cut" className="text-chart-by-account" />
                {c.lists.cut}
              </p>
            )}
          </div>
        ) : null}
        <AddEntryButton kind="broker" />
        {ownBank && <OwnBankField view={view} bundle={bundle} value={ownBank.value} onChange={ownBank.onChange} />}
        <AbroadNotes view={view} bundle={bundle} open={abroadOpen} onOpenChange={setAbroadOpen} />
      </div>
    </Card>
  );
}

function FundList({ view, bundle, plan, today, pick, chosen, onPick, scale, fundCost }: ListsProps & { scale: number; fundCost: Cost }) {
  const sp = c.shownPair(chosen);
  const funds = allFunds(view);
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44)
  const held = useHeldHeight<HTMLDivElement>(`${view.index.id}:${funds.length}`);
  const kinds = hasKinds(view) && !!bundle.dollarRange;
  const range = bundle.dollarRange;
  const pickRec = funds.find((f) => f.rec.id === pick.fund)?.rec;
  const mine: Kind = pickRec ? kindOf(pickRec) : "unhedged";
  const pickName = funds.find((f) => f.rec.id === pick.fund)?.name ?? pick.fund;
  const pickKey = c.pair.input(`${sp.name}, ${pickName}`, c.pair.colLeft);
  // a row of the other kind: its difference from the pick runs over the dollar's range (F-94), from the dollar's fall to its rise; each
  // difference is the row's pair less the pick's at the same end of P-02's range, the two figures its sheet opens
  const cross = useMemo(() => {
    const out = new Map<string, { atLo: number; atHi: number; lo: SiteValue; hi: SiteValue }>();
    if (!kinds || !range || !pickRec) return out;
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
  }, [kinds, range, bundle, view, plan, pick.fund, pick.house, mine, pickName, pickKey, today, sp.diffAbout]); // eslint-disable-line react-hooks/exhaustive-deps -- `funds` is the view's
  const fund = funds.find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  if (!fund || !house) return null;
  const selAt = fund.byHouse[pick.house];
  const shortOf = (id: string) => providerName(view, id)?.short ?? id;
  // before any pick, the page's own fund inside a tie of the cheapest pairs (F-80, P-01) is one of the tied, and every tied fund says so
  const tieBest = bestFor(view, pick);
  const theta = tieShareOf(bundle);
  const tiedFunds = chosen ? [] : tieFunds(view, tieBest, theta);
  const tieN = chosen ? 0 : tieFundCount(view, tieBest, theta);
  const markedTie = tieN > 1 && inTieSet(view, tieBest, pick, theta) ? tieN : 0;
  const tiedHere = (id: string) => markedTie > 0 && tiedFunds.includes(id);
  // the list at an account: by kind, then priced first, then what each leaves
  const rowsAt = (houseId: string) => funds.map((f) => ({ f, at: f.byHouse[houseId] }));
  const order = (r: { at: FundWay["byHouse"][string] | undefined }) => (priced(r.at) ? (r.at.open ? 1 : 0) : 2);
  const kindRank = (r: { f: FundWay }) => (kinds && kindOf(r.f.rec) === "hedged" ? 1 : 0);
  const sortedAt = (list: ReturnType<typeof rowsAt>) => [...list].sort((a, b) => kindRank(a) - kindRank(b) || order(a) - order(b) || (priced(b.at) ? b.at.valueN : 0) - (priced(a.at) ? a.at.valueN : 0));
  // why a row has no price at this account, said once over the rows it holds for: the fund's own reason where no account prices it, else
  // the account's, with where a pick moves the account
  const greyKey = (r: { f: FundWay; at: FundWay["byHouse"][string] | undefined }, houseId: string) =>
    priced(r.at) ? null : !r.at && r.f.reason ? reasonText(r.f.reason, optionClass[r.f.option]) : `${noPriceLine(bundle, houseId, r.f, shortOf(houseId))}|${r.f.best && r.f.best.providerId !== houseId ? r.f.best.providerId : ""}`;
  const headsOf = (list: ReturnType<typeof rowsAt>, houseId: string) =>
    list.map((r, i) => {
      const prev = list[i - 1];
      const hedged = kinds && kindOf(r.f.rec) === "hedged" && (!prev || kindOf(prev.f.rec) !== "hedged");
      const k = greyKey(r, houseId);
      const grey = k !== null && (hedged || !prev || greyKey(prev, houseId) !== k);
      return { hedged, grey: grey ? k : null };
    });
  const shown = sortedAt(rowsAt(pick.house));
  const heads = headsOf(shown, pick.house);
  // every order the list takes, one per account a pick can bring, so a phone's fold holds the tallest rows of any
  const orders: FoldOrder[] = view.providers.map((p) => {
    const list = sortedAt(rowsAt(p.id));
    const h = headsOf(list, p.id);
    return {
      keys: list.map((r) => r.f.rec.id),
      headings: new Set(list.filter((_, i) => h[i]!.hedged || h[i]!.grey).map((r) => r.f.rec.id)),
      choosable: new Set(list.filter((r) => priced(r.at)).map((r) => r.f.rec.id)),
      keep: new Set(list.filter((r) => isCustomFund(r.f.rec)).map((r) => r.f.rec.id)),
    };
  });
  const cur = view.index.exposure?.currency ?? "USD";
  const names = view.index.exposure?.other_currencies === true ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  const greyWords = (k: string) => {
    if (!k.includes("|")) return k;
    const [line, to] = k.split("|") as [string, string];
    const n = shown.filter((r) => greyKey(r, pick.house) === k).length;
    return to ? `${line}. ${n > 1 ? c.lists.pickMovesMany(shortOf(to)) : c.pair.pickMoves(shortOf(to))}.` : `${line}.`;
  };
  // the small line's labels: the fund's kind and what it does with dividends. One every fund of a group shares leaves the rows and is said
  // once (D60): the whole list's in one line over it, the hedged group's in its heading; the first group has no heading, so its rows keep theirs
  const smallOf = (f: FundWay) => {
    const labels = labelsOf(view, f, bundle);
    return [labels[0], labels.find((l, i) => i > 0 && l.family === "payout")].filter((l): l is Label => !!l);
  };
  const listShared = sharedLabels(funds.map(smallOf));
  const hedgedShared = kinds ? sharedLabels(funds.filter((f) => kindOf(f.rec) === "hedged").map(smallOf)).filter((l) => !listShared.some((x) => x.id === l.id)) : [];
  const words = (labels: readonly Label[]) => labels.map((l) => l.text).join(" · ");
  const kindLine = (f: FundWay) => {
    const leave = kindOf(f.rec) === "hedged" ? [...listShared, ...hedgedShared] : listShared;
    return words(smallOf(f).filter((l) => !leave.some((x) => x.id === l.id)));
  };
  const diff = (n: number, name: string, value: SiteValue, sel: SiteValue) => nis(n, "F-65", sp.diffAbout, today, { [c.pair.input(name, c.pair.colLeft)]: value, [pickKey]: sel });
  const openLine = (
    <span className="inline-flex items-center gap-1 text-blocked-foreground">
      <IconLock size={14} />
      {c.lists.openRow}
    </span>
  );
  const openSomewhere = (f: FundWay) => view.providers.some((p) => { const a = f.byHouse[p.id]; return priced(a) && a.open; });
  const unseenCells = (name: ReactNode, line: ReactNode, terms: ReactNode) => (
    <>
      {nameCell(name, line)}
      {barCell(null)}
      {figureCell(dash, rowWord(chosen))}
      {terms}
    </>
  );
  const pickRows: PickRow[] = shown.map((r, i) => {
    const at = r.at;
    const isSel = r.f.rec.id === pick.fund;
    const h = heads[i]!;
    const heading =
      h.hedged || h.grey ? (
        <span className="flex flex-col gap-1.5">
          {h.hedged && (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span aria-hidden="true" className="inline-block size-2 rounded-full bg-chart-kind-hedged" />
              {names.hedged}
              {hedgedShared.length > 0 && ` · ${c.kinds.allOf} ${words(hedgedShared)}`}
            </span>
          )}
          {h.grey && <span className="text-caution-foreground">{greyWords(h.grey)}</span>}
        </span>
      ) : undefined;
    const x = cross.get(r.f.rec.id);
    const typed = isCustomFund(r.f.rec);
    const terms = typed && termsCell(<FundTerms id={r.f.rec.id} />);
    const nameEl = (
      <span className={cx("text-sm [overflow-wrap:anywhere]", isSel ? "font-semibold" : "font-medium", typed && "text-entered")}>
        <MixedName>{listName(view, r.f.name)}</MixedName>
        {r.f.noUnitPrice && <span className="text-muted-foreground"> *</span>}
      </span>
    );
    const fc = fundCost(r.f);
    const isOpen = priced(at) && at.open;
    const line = isOpen ? (
      openLine
    ) : tiedHere(r.f.rec.id) ? (
      c.pair.markedTie(markedTie)
    ) : (
      kindLine(r.f)
    );
    const right = !priced(at)
      ? figureCell(dash, null)
      : x && range
        ? (
            // the difference over the dollar's range, in place of one amount; what the range is, in its "?"
            <ShortRow when={shortRow(x.atLo, x.atHi)}>
              {figureCell(
                <span className={cx("text-sm font-semibold whitespace-nowrap", figureFit(Math.max(Math.abs(x.atLo), Math.abs(x.atHi))))}>
                  {c.kinds.between} <Num animate value={x.lo} display={plus} />
                </span>,
                <>
                  {c.kinds.and}
                  <Num animate value={x.hi} display={plus} /> <HelpMark about={sp.diffAbout} text={`${c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}.`} />
                </>,
              )}
            </ShortRow>
          )
        : figureCell(
            <span className={cx("text-sm font-semibold", figureFit(at.valueN))}>
              <Num animate value={at.value} />
            </span>,
            isSel ? rowWord(chosen) : priced(selAt) && <Num animate value={diff(at.valueN - selAt.valueN, r.f.name, at.value, selAt.value)} display={plus} />,
          );
    return {
      key: r.f.rec.id,
      // the fold counts funds: the same fund in Tel Aviv and abroad is a row each and one fund
      countAs: r.f.rec.identifiers?.isin ?? r.f.rec.id,
      ...(typed ? { keep: true, ownHeight: true } : {}),
      ...(heading ? { heading } : {}),
      selected: isSel,
      muted: !priced(at),
      // a fund no account prices (its reason stands on the row) is shown and never chosen
      disabled: !at && !!r.f.reason,
      onSelect: () => pickHalf(view, pick, { fund: r.f.rec.id }, onPick),
      // the line the row takes at another account (shown but not ranked there, or its kind), laid out unseen, so the rows hold the
      // tallest of them (PickList `even`) and a pick of another account moves nothing below the list
      cases: [
        ...(!isOpen && openSomewhere(r.f) ? [{ key: "open", cells: unseenCells(nameEl, openLine, terms) }] : []),
        ...(isOpen ? [{ key: "kind", cells: unseenCells(nameEl, kindLine(r.f), terms) }] : []),
      ],
      cells: (
        <>
          {nameCell(nameEl, line)}
          {barCell(priced(at) && fc !== null ? <FeeBar account={at.accountCost} fund={fc} accountFirst scale={scale} label={`${listName(view, r.f.name)}: ${fmt.nisWhole(at.accountCost + fc)}`} accountSource={house.custom ? c.pair.sourceEntered : c.pair.sourceList(house.short)} /> : null)}
          {right}
          {terms}
        </>
      ),
    };
  });
  const cut = shown.some((r) => { const fc = fundCost(r.f); return priced(r.at) && fc !== null && r.at.accountCost + fc > scale; });
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <CardHead
        title={c.receipt.parts.fund}
        count={funds.length}
        line={
          <p className="text-sm text-muted-foreground">
            {c.lists.fundsAt} <MixedName>{house.short}</MixedName>
          </p>
        }
        cases={view.providers.map((p) => (
          <p key={p.id} className="text-sm">
            {c.lists.fundsAt} <MixedName>{p.short}</MixedName>
          </p>
        ))}
      />
      {listShared.length > 0 && (
        <p className="px-4 pb-2 text-xs text-muted-foreground">
          {c.pair.fundsShared} {words(listShared)}
        </p>
      )}
      <div className="px-1">
        <PickList
          look="outlined"
          even
          label={c.pair.listLabelFunds}
          columns="minmax(0,1fr) 6rem 6.5rem"
          phoneColumns="minmax(0,1fr) 7rem"
          phoneLimit={6}
          more={c.pair.moreFunds}
          head={<Head item={c.pair.colFund} scale={scale} feesHelp={c.lists.whichPrice} leftHelp={c.funds.diffHelp(kinds, false)} />}
          rows={pickRows}
          orders={orders}
          holdKey={view.index.id}
        />
      </div>
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground empty:hidden">
          {funds.some((f) => f.noUnitPrice) && <p>* {c.pair.unitPriceMissing}</p>}
          {cut && (
            <p className="flex items-center gap-1.5">
              <Swatch shape="cut" className="text-chart-by-fund" />
              {c.lists.cut}
            </p>
          )}
          {kinds && <p>{c.funds.kindsNote}</p>}
          <ProfileNote names={funds.map((f) => listName(view, f.name))} />
        </div>
        <AddEntryButton kind="fund" />
      </div>
    </Card>
  );
}

/** The exposure profiles in the list's fund names, (4D) and the like, each in plain words, with the term that opens its glossary line (ETF-12). */
function ProfileNote({ names }: { names: string[] }) {
  const w = c.pair.profile;
  const codes = [...new Set(names.flatMap((n) => [...n.matchAll(/\((\d[0A-F])\)/g)].map((m) => m[1]!)))].filter((x) => w.equity[x[0]!] && w.currency[x[1]!]).sort();
  if (codes.length === 0) return null;
  return (
    <p>
      {w.lead} <Term id="פרופיל חשיפה">{w.term}</Term>. {codes.map((x) => w.code(x, `${w.equity[x[0]!]} ${w.currency[x[1]!]}`)).join(". ")}.
    </p>
  );
}
