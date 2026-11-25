// The person's securities-account deals on the index page (F-128): each saved deal is an account of the lists, and a popup edits it on the
// page's plan with the fee page's own editor (components/fee-deal/editor.tsx), so the two pages edit one deal one way. The popup opens on a
// saved deal (its row's pencil), on a new deal from a house's latest price list (a house's "להזין מחיר שקיבלתם" on an
// index with no fund, a house's page through the address), or on a new deal started from a house's list or empty (the button under the
// account list). The same popup shows a house's terms read-only (`TermsPopup`, from the file icon beside its name in the list and from the
// receipt's line of what its price leaves out): a deal filled from its latest price list, never saved, with nothing to edit. A deal's head
// names the deal and keeps its rename and delete; under it three tiles say what the deal leaves on the pair's fund, its place among the
// accounts, and, for a deal filled from a house's list, what it leaves against that house's own row; the plan line says what it is read on,
// and a pick bar what only the person knows (a track, a condition of their own). Each fee says under its block what the plan charges for it
// or why it charges nothing. Each fee's switch, in its card's corner beside that figure, leaves it out of every figure here, the tiles, the
// fees' plan figures and marks and the abroad lines, all priced on the deal as it is counted (lib/fee-deal/off.ts); an off fee's figure is
// held unseen in its place. The popup prices the deal alone as it changes; the page takes the deal, as it is counted, once the popup
// closes, since pricing every account and fund again on each change would make typing wait. A new deal is saved only once it changes (use-deal-document.ts).
// A deal deleted in another tab while it is open stays on screen, saved no more, with /deal's line and its keep; the editor's data that
// did not load is said with a retry. Under the account list, each account typed by hand before deals that could not become one says why
// it is not in the list.
import { createContext, useCallback, useContext, useDeferredValue, useEffect, useEffectEvent, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { IconFile, IconPencil } from "../icons";
import { feeDeal, invest as root } from "../../copy";
import { fmt } from "../../lib/format";
import { asideLines, dealOnFunds, dealRunOf, pairCosts, type DealOnPlan, type FundWay, type IndexRef, type InvestView } from "../../lib/invest";
import { accountLinesOf, receiptAmounts } from "../../lib/receipt";
import { shortName, type IndicesBundle, type WorkbenchInputs } from "../../lib/providers";
import type { FeesData } from "../../lib/fee-page-data";
import { averageOf as columnAverage, type AverageColumn } from "../../lib/house-averages";
import type { DealRun } from "@finance-tool/engine";
import { hasCases, newDeal, NAME_MAX, pickKey, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { feeOf } from "../../lib/fee-deal/cases";
import { slimParts } from "../../lib/fee-deal/case-words";
import type { PartWords } from "../../lib/fee-deal/part-words";
import type { DealRead } from "../../lib/fee-deal/deal-read";
import { amountWords, formatValue } from "../../lib/format";
import { computed, differenceOf, type SiteValue } from "../../lib/value";
import { Num, ProvenanceProvider, useProvenanceData, type ProvenanceData } from "../provenance";
import { recordsById } from "../../lib/scope";
import { dealStore, rememberOpen, without } from "../../lib/fee-deal/store";
import { DEAL_PATH } from "../../lib/site-paths";
import { dealFromTemplate, houseName, templateOf, templateOptions } from "../../lib/fee-deal/templates";
import { updateFee } from "../../lib/fee-deal/edits/deal";
import { addBlankCase } from "../../lib/fee-deal/edits/case";
import { pickLine } from "../../lib/fee-deal/reading";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { dealProviderId, planContextOf, withDeals } from "../../lib/deal-account/bundle";
import { countedDeal, feesOff, isFeeOff } from "../../lib/fee-deal/off";
import { dealHouseId, feesOnPlan, PLAN_KEYS, planRead, whatOfRun, type FeeOnPlan, type Missing } from "../../lib/deal-account/plan";
import { ACCOUNT_KIND } from "../../lib/fee-deal/kinds";
import { dealTiles, listFunds } from "../../lib/deal-account/tiles";
import { planCases } from "../../lib/deal-account/plan-cases";
import { Sheet } from "../Sheet";
import { allFunds, asideParts, repick, type Pick } from "./pair";
import { providerName } from "./sections";
import { leftOutOf, withAside, type LeftOutView } from "../../lib/left-out";
import { priced } from "../../lib/stretch";
import type { FeesSnapshot } from "@finance-tool/schema";
import { MQ, useMedia } from "../../lib/hooks";
import { pickItems, useDealEditor, type DealEditor } from "../fee-deal/editor";
import { whenText } from "../fee-deal/open-case";
import { TemplateList, type TemplateListWords } from "../fee-deal/picker";
import { NoticeRow } from "../fee-deal/deal-notices";
import type { MoveLeft } from "../../lib/deal-account/move-run";
import { Button, Card, DocLink, HouseAverageLine, LeftOutFold, MixedName, ReadForBand, ReadOnly, RemoveButton, Sentence, StatRow, StatTile, Tag, TextField, TextLink, When, cx, useStuckRoom, type FeeHeadSlot } from "../kit";
import { ToolBoundary } from "../tool-boundary";

const w = root.dealAccount;

/**
 * What the popup opens on: a saved deal (at one of its fees, where its row's "להשלים" or the abroad line's "להוסיף לעסקה" opened it), a
 * new deal from a house's list or from the start list (`house` null), or a house's terms, read-only (`terms`, its id; `leftOut`, with what
 * its price leaves out open, where the receipt's line opened it).
 */
export type DealTarget = { dealId: string; fee?: string } | { house: string | null } | { terms: string; leftOut: boolean };

/** A deal just deleted from the popup: its name, and its row's place in the account list (null: after the ranked rows). */
export interface DeletedDeal {
  name: string;
  at: number | null;
}

interface DealAccountsApi {
  open: (t: DealTarget) => void;
  /** The saved deals of the page, by their account id on the page. */
  dealOf: (providerId: string) => FeeDeal | undefined;
  /** The deal just deleted from the popup, said at its row's place in the list; null after any other step. */
  deleted: DeletedDeal | null;
  /** The id of the line that says it (`DeletedLine`), which takes the focus as the popup closes: the pencil that opened the popup went with the row. */
  deletedLineId: string;
  /**
   * The deal's fee that lacks a case for a fund bought abroad on this page (E), where that case is what keeps the deal account `providerId`
   * from a price there, as the page priced it; null otherwise (a fund the house it was filled from does not sell keeps the house's words).
   */
  abroadLacks: (providerId: string) => Missing | null;
  /** A deal fee as the ticket writes it under its line, read for the plan on fund `fundId` (A, F): its price as the deal has it, and its pick. */
  feeWords: (providerId: string, fundId: string, feeId: string) => ReactNode;
  /** The typed accounts the move left in the saved state, with why (lib/deal-account/move-run.ts): the account list says each. */
  left: readonly MoveLeft[];
}
const DealAccountsCtx = createContext<DealAccountsApi | null>(null);
export const useDealAccounts = () => useContext(DealAccountsCtx);

/**
 * What the popup prices on: the page's bundle without the person's deals, the index, the plan, the page's view, the pair, and whether the
 * account list ranks by the pair's kind of fund (hedged or not, `listFunds`).
 */
export interface DealWorld {
  bundle: IndicesBundle;
  index: IndexRef;
  plan: WorkbenchInputs;
  view: InvestView;
  pick: Pick | null;
  kinds: boolean;
}

export function DealAccountsHost({ data, onWant, failed, saved, writable, today, world, opening, onOpened, onOpenChange, onDeleted, left, children }: {
  /** The fee page's data, which the editor reads; null until loaded (`onWant` asks for it, and asks again after a failure). */
  data: FeesData | null;
  onWant: () => void;
  /** The fee page's data did not load: the popup says so, with its retry. */
  failed: boolean;
  /** The device's saved deals, all of them. */
  saved: readonly FeeDeal[];
  writable: boolean;
  today: string;
  world: DealWorld | null;
  /** A house a page sent through the address: the popup opens on a new deal from its list, once. */
  opening: string | null;
  onOpened: () => void;
  /** The popup opened or closed: the page holds its deals as they were while it is open. */
  onOpenChange: (open: boolean) => void;
  /** A deal was deleted from the popup: its account id on the page, which the page's address may still name. */
  onDeleted: (providerId: string) => void;
  left: readonly MoveLeft[];
  children: ReactNode;
}) {
  const [target, setTarget] = useState<DealTarget | null>(null);
  // the saved deal the popup opened on, held while it is open: one deleted in another tab stays on screen, and the popup says so
  const [opened, setOpened] = useState<FeeDeal | null>(null);
  const [deleted, setDeleted] = useState<DeletedDeal | null>(null);
  const [started, setStarted] = useState<FeeDeal | null>(null);
  const headId = useId();
  const deletedLineId = useId();
  const isOpen = target !== null;
  // the popup opens: the page holds its deals, and the fee page's data is asked for where it is not in yet
  const openOn = useCallback(
    (t: DealTarget) => {
      onOpenChange(true);
      if (!data) onWant();
      setTarget(t);
    },
    [data, onOpenChange, onWant],
  );
  const close = () => {
    setTarget(null);
    onOpenChange(false);
  };
  // the page arrived with a house in its address: the popup opens on it once the page can price, and the address is cleaned
  const openFromAddress = useEffectEvent((house: string) => {
    openOn({ house });
    onOpened();
  });
  const canPrice = world !== null;
  useEffect(() => {
    if (opening && canPrice) openFromAddress(opening);
  }, [opening, canPrice]);
  const api = useMemo<DealAccountsApi>(
    () => ({
      open: (t) => {
        const deal = "dealId" in t ? saved.find((d) => d.id === t.dealId) : undefined;
        if ("dealId" in t && !deal) return;
        setDeleted(null);
        setStarted(null);
        setOpened(deal ?? null);
        openOn(t);
      },
      dealOf: (id) => saved.find((d) => dealProviderId(d.id) === id),
      deleted,
      abroadLacks: (id) => {
        if (!world) return null;
        const gaps = abroadGaps(abroadOf(world.view), (f) => f.byHouse[id], (f) => dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId: f.rec.id }));
        return gaps[0]?.missing ?? null;
      },
      feeWords: (id, fundId, feeId) => {
        const deal = saved.find((d) => dealProviderId(d.id) === id);
        if (!deal || !data || !world) return null;
        const run = dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId });
        if (!run) return null;
        // the ticket asks only for the fees the page's run charges, the counted ones, whose words are the same read on the whole deal
        return <DealFeeWords read={planRead(deal, run, planContextOf(world.bundle, deal, data.kinds, world.plan.currentAccounts ?? false))} feeId={feeId} />;
      },
      left,
      deletedLineId,
    }),
    [saved, deleted, deletedLineId, data, world, left, openOn],
  );
  // the editor's rule and term sheets read the fee page's data (its rules, the records they point at, its terms) over the page's own
  const page = useProvenanceData();
  const provenance = useMemo<ProvenanceData | null>(
    () =>
      page && data
        ? {
            ...page,
            rules: { ...page.rules, ...Object.fromEntries(data.rules.map((r) => [r.id, r])) },
            ...(page.pointed || data.pointed ? { pointed: { ...page.pointed, ...recordsById(data.pointed) } } : {}),
            terms: { ...page.terms, ...data.terms },
          }
        : null,
    [page, data],
  );
  // a new deal from a house's list, made once per opening; a house's terms are a deal filled the same way, never saved
  const fromHouse = useMemo(() => (target && data && "house" in target && target.house ? houseDeal(`house:${target.house}`, data, today) : target && data && "terms" in target ? houseDeal(`house:${target.terms}`, data, today) : null), [target, data, today]);
  const first = !target || !data ? null : "dealId" in target ? opened : (fromHouse ?? started);
  const terms = target && "terms" in target ? target : null;
  return (
    <DealAccountsCtx.Provider value={api}>
      {children}
      {/* the start's list and each deal are a view of their own: a deal picked low in the list opens at its top (`view`) */}
      <Sheet open={isOpen} onClose={close} pc="center" height={100} labelledBy={headId} view={first?.id ?? "start"} focusAfter={() => (deleted ? document.getElementById(deletedLineId) : null)} className={target && data && world && !first ? "sheet-wide" : "sheet-deal"}>
        {target && data && world ? (
          first && terms ? (
            <ProvenanceProvider data={provenance ?? EMPTY_PROVENANCE}>
              <ToolBoundary resetKey={first.id}>
                <ReadOnly>
                  <TermsPopup key={first.id} data={data} today={today} saved={saved} writable={writable} first={first} world={world} house={terms.terms} leftOut={terms.leftOut} headId={headId} onOwn={() => api.open({ house: terms.terms })} />
                </ReadOnly>
              </ToolBoundary>
            </ProvenanceProvider>
          ) : first ? (
            <ProvenanceProvider data={provenance ?? EMPTY_PROVENANCE}>
            <ToolBoundary resetKey={first.id}>
            <DealPopup
              key={first.id}
              data={data}
              today={today}
              saved={saved}
              writable={writable}
              first={first}
              openFee={"dealId" in target ? target.fee : undefined}
              world={world}
              headId={headId}
              onDeleted={(name, at) => {
                setDeleted({ name, at });
                onDeleted(dealProviderId(first.id));
                close();
              }}
            />
            </ToolBoundary>
            </ProvenanceProvider>
          ) : (
            <DealStart data={data} today={today} headId={headId} onStart={(id) => setStarted(id ? houseDeal(id, data, today) : newDeal(ACCOUNT_KIND))} />
          )
        ) : target && failed ? (
          // the editor's data did not load: the line and its retry, as /deal's standing lines are said
          <div id={headId} className="text-sm">
            <NoticeRow line={{ key: "failed", text: w.feesFailed, action: { label: w.retry, onClick: onWant } }} />
          </div>
        ) : target ? (
          <p id={headId} className="text-muted-foreground">
            {terms ? w.terms.title(world ? (providerName(world.view, terms.terms)?.short ?? terms.terms) : terms.terms) : root.dealAccount.start.title}
          </p>
        ) : null}
      </Sheet>
    </DealAccountsCtx.Provider>
  );
}

/** What the popup reads before both the page's data and the fee page's are in (never on a page: its shell gives the one, the popup waits for the other). */
const EMPTY_PROVENANCE: ProvenanceData = { rules: {}, terms: {}, dimensions: {}, today: "" };

/**
 * A new deal filled from a house's latest price list (`house:<id>`, or one of its ways to buy), named "<house>, בתנאים שלי" by the house's
 * short name, as the account list writes it (`shortName`); a fresh deal where none fills.
 */
function houseDeal(id: string, data: FeesData, today: string): FeeDeal {
  const d = dealFromTemplate(newDeal(ACCOUNT_KIND), id, data, today);
  const house = houseName(id, data);
  const providerId = id.replace(/^house:/, "").split("/", 1)[0]!;
  return d ? { ...d, name: house ? w.nameOf(shortName(providerId, house)).slice(0, NAME_MAX) : d.name } : newDeal(ACCOUNT_KIND);
}

/**
 * The new deal's start: every house's latest price list, with what it leaves out of the deal (the template picker's list, `TemplateList`),
 * and an empty deal. Not a kit piece: the picker's list and the kit's `Button` arranged for this one choice.
 */
function DealStart({ data, today, headId, onStart }: { data: FeesData; today: string; headId: string; onStart: (id: string | null) => void }) {
  const options = useMemo(() => templateOptions(ACCOUNT_KIND, data, today).filter((o) => o.source === "house"), [data, today]);
  const left = useMemo(() => new Map(options.map((o) => [o.id, templateOf(newDeal(ACCOUNT_KIND), o.id, data, today)?.left ?? []])), [options, data, today]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {w.start.title}
        </h2>
        <p className="text-sm text-muted-foreground">{w.start.lede}</p>
      </div>
      <TemplateList options={options} left={left} focus words={START_WORDS} onPick={onStart} />
      <Button variant="add" onClick={() => onStart(null)}>
        {w.start.empty}
      </Button>
    </div>
  );
}

const START_WORDS: TemplateListWords = { search: w.start.search, clear: w.start.clear, none: w.start.none, houses: w.start.group };

/**
 * A deal read on the page's plan, for a popup to lay out: the editor on it (its fees' heads saying what the plan charges for each, and
 * marking the cases the plan reads), its runs on the list's funds as it changes, and the tiles' figures (F-128): what it leaves, its
 * place in the account list, what it leaves against the house it was filled from, and the plan line. `row`: the account list's row the
 * deal stands for, whose fund the plan line names and whose place the tile gives (the deal's own, or the house whose terms it shows).
 */
function useDealOnPlan({ data, today, saved, writable, first, world, row }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; first: FeeDeal; world: DealWorld; row: string }) {
  // what each fee's head says is read with the deal as it is now, which the editor holds: the editor draws it after this render
  const headRef = useRef<(fee: Fee) => FeeHeadSlot | undefined>(() => undefined);
  // /deal reopens the deal last on screen there: only the popup's own links to it name this one (`rememberOpen`)
  const ed = useDealEditor({ data, today, saved, writable, first, withReading: false, untitled: true, remember: false, feeHead: (fee) => headRef.current(fee) });
  const deal = ed.deal;
  // the deal as it is counted, without the fees switched off in their corners: what every figure of the popup prices
  const off = feesOff.use();
  const counted = useMemo(() => countedDeal(deal, off), [deal, off]);
  const providerId = dealProviderId(deal.id);
  const { view, pick } = world;
  // the fund the plan line names: the pair's where the deal is the pair's account, else the one the page would pair with it
  const fundId = pick ? (pick.house === row ? pick.fund : repick(view, pick, { house: row }).fund) : null;
  const funds = useMemo(() => (pick ? listFunds(allFunds(view), pick.fund, world.kinds) : []), [view, pick, world.kinds]);
  const abroadFunds = useMemo(() => abroadOf(view), [view]);
  // the deal alone in the bundle, priced on the list's funds and the funds bought abroad as it changes; the runs wait for the hand to rest
  // (`useDeferredValue`)
  const bundle = useMemo(() => withDeals(world.bundle, [counted], data.kinds), [world.bundle, counted, data.kinds]);
  const settled = useDeferredValue(bundle);
  const got = useMemo(() => (fundId ? dealOnFunds({ bundle: settled, index: world.index, plan: world.plan, fundIds: [...new Set([fundId, ...funds.map((f) => f.rec.id), ...abroadFunds.map((f) => f.rec.id)])], providerId }) : new Map<string, DealOnPlan>()), [settled, world.index, world.plan, fundId, funds, abroadFunds, providerId]);
  const at = fundId ? (got.get(fundId) ?? null) : null;
  // each fee's whole shekels as the receipt writes them on the same pair (`accountLinesOf`), so a fee reads the same in both places
  const wholeByFee = useMemo(() => {
    const pc = fundId && at?.kind === "ok" ? pairCosts({ bundle: settled, index: world.index, plan: world.plan, fundId, providerId }) : null;
    return pc ? new Map(accountLinesOf(pc, receiptAmounts(pc)).flatMap((l) => (l.kind === "deal" ? [[l.fee, l.amount] as const] : []))) : null;
  }, [settled, world.index, world.plan, fundId, providerId, at?.kind]);
  const run = useMemo(() => (fundId ? dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId }) : null), [world.bundle, world.index, world.plan, fundId]);
  const houseId = dealHouseId(deal);
  const tiles = fundId ? dealTiles(view, got, row, deal.name, houseId, fundId, funds) : null;
  const house = houseId ? view.houses.find((h) => h.provider.id === houseId)?.provider : undefined;
  // the deal is read on the page's plan as its run reads it: the page's run month, the page's current accounts and the house's line choice (F-128)
  const ctx = useMemo(() => planContextOf(world.bundle, deal, data.kinds, world.plan.currentAccounts ?? false), [world.bundle, deal, data.kinds, world.plan.currentAccounts]);
  // what each fee is on the plan, every fee of the deal, its head saying so; and the same of the fees counted, which the run's reach is of
  const onPlan = useMemo(() => (run ? new Map(feesOnPlan(deal, run, ctx).map((x) => [x.fee, x])) : null), [deal, run, ctx]);
  const countedOn = useMemo(() => (run ? (counted === deal ? [...(onPlan?.values() ?? [])] : feesOnPlan(counted, run, ctx)) : null), [counted, deal, run, ctx, onPlan]);
  // a fund bought abroad whose price waits on a case the deal lacks (E): each such fee, with the values the funds are bought as
  const abroad = useMemo(() => abroadGaps(abroadFunds, (f) => got.get(f.rec.id), (f) => dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId: f.rec.id })), [abroadFunds, got, world.bundle, world.index, world.plan]);
  const averages = houseId ? data.houses.find((h) => h.id === houseId)?.everyColumn : undefined;
  // the deal read for the plan: the picks it cannot set, what only the person knows, saved with the deal, of every fee; and the cases the
  // plan reads, of the fees counted
  const read = useMemo(() => (run ? planRead(deal, run, ctx) : null), [deal, run, ctx]);
  const countedRead = useMemo(() => (run ? (counted === deal ? read : planRead(counted, run, ctx)) : null), [counted, deal, run, ctx, read]);
  const picks = useMemo(() => (read ? pickLine(read) : null), [read]);
  headRef.current = (fee) => {
    const x = onPlan?.get(fee.id);
    const avg = averages && house && run ? columnAverage(averages, planColumn(fee.kind, run)) : null;
    const average = avg && averages && house ? <HouseAverageLine customers averages={[avg]} house={house.short} /> : null;
    const gap = abroad.find((g) => g.missing.fee === fee.id);
    const foot = gap ? <AbroadCaseLine words={gap.words} onAdd={() => addAbroadCase(ed, fee, gap)} /> : null;
    const switchedOff = isFeeOff(off, deal.id, fee.id);
    const whole = wholeByFee?.get(fee.id);
    const cost: FeeCost = switchedOff ? "off" : at?.kind === "ok" ? at.figure(whole !== undefined ? -whole || 0 : shownCost(at.byFee[fee.id] ?? 0), w.feeCostAbout(feeNameOf(fee.kind, fee.name))) : null;
    const slot = x ? feeHeadOf(x, cost) : {};
    // the cases the plan reads, a step of the account's size with the years the plan spends in it (B, F), any other step the plan reaches
    // plainly, where the plan charges the fee and it is counted
    const marks = countedRead && countedOn && !switchedOff && x?.on === "charged" && hasCases(fee) ? planCases(countedRead, fee.id, countedOn, at?.kind === "ok" ? at.reach : null) : null;
    const caseMark = marks && marks.size ? (id: string) => (marks.has(id) ? w.planCase(marks.get(id)!.years) : undefined) : undefined;
    return { ...slot, ...(average || slot.under ? { under: <>{slot.under}{average}</> } : {}), ...(foot ? { foot } : {}), ...(caseMark ? { caseMark } : {}) };
  };
  const own = picks?.things.filter((t) => !PLAN_KEYS.includes(t.by)) ?? [];
  const where = run ? (run.instrumentClass === "mutual_fund_units" ? w.where.manager! : w.where[whatOfRun(run) === "tase" ? "tase" : (run.listing ?? "world")]!) : "";
  const fund = fundId ? allFunds(view).find((f) => f.rec.id === fundId) : undefined;
  const p = world.plan;
  // the tiles' figures, each computed from the run with its formula (F-128): what is left, the place, the difference from the house's row
  const okAt = at?.kind === "ok" ? at : null;
  const leftFig = tiles?.left !== null && tiles?.left !== undefined && okAt ? okAt.left(tiles.left, w.tiles.leftAbout) : null;
  const placeFig = tiles?.place ? computed(tiles.place.k, "count", "F-128", leftFig ? { [w.tiles.leftAbout]: leftFig } : {}, { today: world.bundle.today, about: w.tiles.placeAbout(tiles.place.of) }) : null;
  const diffFig = leftFig && tiles?.house && house ? differenceOf([w.tiles.leftAbout, leftFig], [w.tiles.houseAbout(house.short), tiles.house.value], "F-128", { today: world.bundle.today, about: w.tiles.diffAbout, round: Math.round, signed: true }) : null;
  const leftNum = leftFig && <Num value={leftFig} display={(n) => fmt.nisWhole(n)} />;
  const placeNum = placeFig && tiles?.place && <Num value={placeFig} display={() => w.tiles.placeValue(tiles.place!.k, tiles.place!.of)} />;
  const diffNum = diffFig && <Num value={diffFig} display={(n) => fmt.signedNisWhole(n)} />;
  const planLine = fund ? w.plan(fmt.nisWhole(p.amountNow), fmt.nisWhole(p.monthly), p.years, fmt.pct(p.grossReturn * 100), fund.name, where) : null;
  return { ed, deal, at, run, tiles, house, fund, own, where, leftNum, placeNum, diffNum, planLine };
}

/**
 * What a house's documents hold and its price leaves out (D106), as its terms say it: first a standing order's price its price list prints
 * and the figure for fund `at` leaves out (D41, D56), with the record's reason and their documents; then the record's own things.
 */
export function termsLeftOut(snap: FeesSnapshot | undefined, at: FundWay["byHouse"][string] | undefined): LeftOutView | null {
  return withAside(leftOutOf(snap), root.lists.otherPriceWords, priced(at) ? asideParts(asideLines(snap, at.aside)) : []);
}

/**
 * A house's terms, read-only (D106): the popup a deal opens in, on a deal filled from the house's latest price list, which is never saved.
 * Its head names the price list and opens it, with the day it was collected; the tiles say what it leaves on the plan's fund and its place
 * in the account list, over the plan line; then what its price leaves out, folded to a line; its fees as the editor shows them, each with
 * what the plan charges, nothing to edit (the kit's `ReadOnly`); last, the way to enter terms of one's own from this house. On a phone, one
 * column: the tiles on one line, the fold, the fees, the button. Not a kit piece: the page's own popup, built of kit pieces and the editor.
 */
function TermsPopup({ data, today, saved, writable, first, world, house, leftOut, headId, onOwn }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; first: FeeDeal; world: DealWorld; house: string; /** What the price leaves out opens open. */ leftOut: boolean; headId: string; onOwn: () => void }) {
  const { ed, tiles, fund, leftNum, placeNum, planLine } = useDealOnPlan({ data, today, saved, writable, first, world, row: house });
  const wide = useMedia(MQ.md);
  const p = world.plan;
  const short = providerName(world.view, house)?.short ?? house;
  const snap = world.bundle.snapshots.find((s) => s.id === house);
  const left = termsLeftOut(snap, fund?.byHouse[house]);
  const fold = left && <LeftOutFold view={left} defaultOpen={leftOut} />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 pe-12">
        <h2 id={headId} className="text-lg font-semibold">
          {w.terms.title(short)}
        </h2>
        {snap && (
          <DocLink look="inline" source={snap.tariff} className="self-start text-sm">
            <When iso={snap.snapshot} lead={w.terms.collected} />
          </DocLink>
        )}
      </div>
      {tiles &&
        (wide ? (
          <StatRow cols={2}>
            <StatTile label={w.tiles.left(p.years)} note={tiles.missing ? w.tiles.waits(feeNameOf(tiles.missing.kind, tiles.missing.name)) : w.tiles.leftNote}>
              {leftNum ?? <span className="text-base">{w.tiles.noSum}</span>}
            </StatTile>
            <StatTile label={w.tiles.place} note={tiles.place ? w.tiles.placeNote : w.tiles.unrankedNote}>
              {placeNum ?? <span className="text-base">{w.tiles.unranked}</span>}
            </StatTile>
          </StatRow>
        ) : (
          // a phone: what is left and the place on one line, as the deal's popup has them
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span>
              {w.tiles.left(p.years)} <strong className="text-lg">{leftNum ?? w.tiles.noSum}</strong>
            </span>
            <strong>{placeNum ?? w.tiles.unranked}</strong>
          </p>
        ))}
      {wide && planLine && <p className="text-sm text-muted-foreground">{planLine}</p>}
      {fold}
      {ed.columns(null)}
      <Button variant="framed" className="self-start" onClick={onOwn}>
        {w.fromHouse(short)}
      </Button>
    </div>
  );
}

/**
 * Beside a house's name in the account list, where it has a price list: the file icon that opens its terms (`TermsPopup`). Not a kit piece:
 * the kit's `Button`, wired to this page's popup.
 */
export function TermsMark({ id, house }: { id: string; house: string }) {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <Button variant="icon" size="mark" aria-label={w.terms.title(house)} onClick={() => api.open({ terms: id, leftOut: false })}>
      <IconFile size={14} />
    </Button>
  );
}

/**
 * The popup on one deal: its head, the tiles and the plan line (sticky as the fees scroll; on a phone the head, the strip and the pick bar
 * stay together), the pick bar, and the editor. Not a kit piece: the page's own popup, built of kit pieces and /deal's editor.
 */
function DealPopup({ data, today, saved, writable, first, openFee, world, headId, onDeleted }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; first: FeeDeal; /** The fee it opens on, where its opener names one. */ openFee?: string | undefined; world: DealWorld; headId: string; onDeleted: (name: string, at: number | null) => void }) {
  const { ed, deal, at, run, tiles, house, fund, own, where, leftNum, placeNum, diffNum, planLine } = useDealOnPlan({ data, today, saved, writable, first, world, row: dealProviderId(first.id) });
  const isSaved = saved.some((d) => d.id === deal.id);
  const p = world.plan;
  const root = useRef<HTMLDivElement>(null);
  // a deal opens on the fee its opener names (the abroad line's "להוסיף לעסקה"), else, where the plan cannot price it, on the fee that lacks
  // something, as its row's "להשלים" says; that fee's block is brought up under the sticky tiles
  useEffect(() => {
    const lacks = openFee ?? (at?.kind === "fail" && "missing" in at.reason ? at.reason.missing?.fee : undefined);
    // else it opens with no fee open, its toolbox's column the fees it can still take and "מתעריפון אחר" (B)
    if (!lacks) return ed.doc.setChosen(null);
    ed.doc.setChosen(lacks);
    ed.doc.setFocus({ fee: lacks, on: "card" });
    let frame = requestAnimationFrame(() => (frame = requestAnimationFrame(() => bringUnderTop(root.current, lacks))));
    return () => cancelAnimationFrame(frame);
  }, []);
  const wide = useMedia(MQ.md);
  const [planShown, setPlanShown] = useState(false);
  // the toolbox's column sticks under what stays at the top, not behind it (`TOOLBOX_STICKY`, `useStickyColumn`)
  const stuck = useRef<HTMLDivElement>(null);
  const toolTop = useStuckRoom(stuck, wide ? !!tiles : true, wide);
  const head = (
    <DealHead deal={deal} headId={headId} isSaved={isSaved} writable={writable} onName={(name) => ed.doc.change({ ...deal, name: name.slice(0, NAME_MAX) })} onDelete={() => {
      dealStore.update((ds) => without(ds, deal.id));
      onDeleted(deal.name, tiles?.place ? tiles.place.k - 1 : null);
    }} />
  );

  return (
    <div ref={root} className="flex flex-col gap-4" style={toolTop !== null ? ({ "--toolbox-top": `${toolTop}px` } as CSSProperties) : undefined}>
      {wide && head}
      {!wide && (
        // a phone: the head, then one strip, what is left and the place on its first line, the difference and the plan's tap under them, and
        // the choice of what only the person knows under it, one line, all staying at the top as the fees scroll (C, J); not a kit piece: the
        // three tiles' figures as a phone has room for them
        <div ref={stuck} data-deal-top="" className={cx(STICKY_TOP, "flex flex-col gap-1 border-b border-border text-sm")}>
          {head}
          {tiles && (
            <>
              <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span>
                  {w.tiles.left(p.years)} <strong className="text-lg">{leftNum ?? w.tiles.noSum}</strong>
                </span>
                <strong>{placeNum ?? w.tiles.unranked}</strong>
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                {house && diffNum && (
                  <span>
                    {diffNum} {w.tiles.diff(house.short)}
                  </span>
                )}
                {house && diffNum && fund && <span aria-hidden="true">·</span>}
                {fund && (
                  <Button variant="inline" aria-expanded={planShown} onClick={() => setPlanShown((x) => !x)}>
                    {w.tiles.planTap}
                  </Button>
                )}
              </p>
              {planShown && planLine && <p className="text-muted-foreground">{planLine}</p>}
            </>
          )}
          {run && own.length > 0 && <ReadForBand lead={w.readForShort} picks={pickItems(own, ed.onPick)} />}
        </div>
      )}
      {/* the deal deleted in another tab: said as /deal says it, with its keep */}
      {ed.doc.deletedElsewhere && (
        <div className="text-sm">
          <NoticeRow line={{ key: "deleted", text: feeDeal.end.deletedElsewhere, action: { label: feeDeal.end.keepAnyway, onClick: ed.doc.keepAnyway } }} />
        </div>
      )}
      {tiles && wide && (
        <div ref={stuck} data-deal-top="" className={cx(STICKY_TOP, "flex flex-col gap-2")}>
          <StatRow cols={3}>
            <StatTile label={w.tiles.left(p.years)} note={tiles.missing ? w.tiles.waits(feeNameOf(tiles.missing.kind, tiles.missing.name)) : w.tiles.leftNote}>
              {leftNum ?? <span className="text-base">{w.tiles.noSum}</span>}
            </StatTile>
            <StatTile label={w.tiles.place} note={tiles.place ? w.tiles.placeNote : w.tiles.unrankedNote}>
              {placeNum ?? <span className="text-base">{w.tiles.unranked}</span>}
            </StatTile>
            {house && (
              <StatTile label={w.tiles.diff(house.short)} note={w.tiles.diffNote}>
                {diffNum ?? <span aria-hidden="true">—</span>}
              </StatTile>
            )}
          </StatRow>
          {planLine && <p className="text-sm text-muted-foreground">{planLine}</p>}
        </div>
      )}
      {run && wide && own.length > 0 && <ReadForBand lead={w.readFor} note={w.planKnows(where)} picks={pickItems(own, ed.onPick)} />}
      {ed.picker}
      {ed.columns(null)}
      {ed.menus}
      {ed.footSheet}
    </div>
  );
}

/**
 * What stays at the top of the popup as the fees scroll: drawn from the very top of the sheet's scrolling body, over its padding (4 px on a
 * phone, 12 px from `lg`, app.css `.sheet-body`), so nothing that scrolls under it shows above it. It stands in the sticky layer, as the
 * site's header does over a page (`--z-sticky`): what the editor raises inside the fees (a grip, a figure's tap area) stays under it, so
 * nothing under it takes a click or is drawn over it, and the menus, in the layer above it, open over it.
 */
const STICKY_TOP = "sticky z-(--z-sticky) -mx-1 bg-popover px-1 pb-2 -top-1 -mt-1 pt-1 lg:-top-3 lg:-mt-3 lg:pt-3";

/** Brings fee `feeId`'s block of the popup in `root` to just under what stays at its top (`data-deal-top`). */
function bringUnderTop(root: HTMLElement | null, feeId: string) {
  const block = root?.querySelector<HTMLElement>(`li[data-fee="${CSS.escape(feeId)}"]`);
  const body = block?.closest<HTMLElement>(".sheet-body");
  if (!block || !body) return;
  const top = root!.querySelector("[data-deal-top]")?.getBoundingClientRect().bottom ?? body.getBoundingClientRect().top;
  body.scrollTop += block.getBoundingClientRect().top - top - 8;
}

/** What a fee the plan charges took on it: its figure, none yet (the run waits), or `off`, switched off, so it takes nothing. */
type FeeCost = SiteValue | null | "off";

/**
 * What a fee's head says on the plan (B): at its end what the plan charges for it ("בתוכנית −60 ₪", on a phone the sum alone, C), held
 * unseen in its place while the fee is switched off, which charges nothing (its switch says so); or the chip saying the plan never charges
 * it with why under the head, or, under the head, what it lacks for a price.
 */
function feeHeadOf(x: FeeOnPlan, cost: FeeCost): FeeHeadSlot {
  if (x.on === "missing") return { under: <p>{w.missing[x.missing.why]!(feeNameOf(x.missing.kind, x.missing.name))}</p> };
  if (x.on === "off") return { end: <Tag>{w.offPlan}</Tag>, under: <p>{w.off[x.why]}</p> };
  if (cost === "off")
    return {
      end: (
        <span aria-hidden="true" className="invisible text-sm">
          {w.onPlan}
        </span>
      ),
    };
  return {
    end: (
      <span className="inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
        <span className={cost !== null ? "max-md:sr-only" : undefined}>{w.onPlan}</span>
        {cost !== null && (
          <strong className="text-base font-bold text-foreground tabular-nums">
            <Num value={cost} display={costText} />
          </strong>
        )}
      </span>
    ),
  };
}

/** What a fee took on the plan, as the popup shows it, less than nothing: whole shekels, agorot under 10 ₪ (wording.md). */
const shownCost = (c: number): number => (Math.abs(c) < 10 ? -Math.round(c * 100) / 100 : -Math.round(c)) || 0;
const costText = (n: number): string => (Math.abs(n) < 10 ? fmt.nis(n) : fmt.nisWhole(n));

/**
 * The column of a house's averages (F-122) under a fee's head: what the plan buys, in the sheet's columns, read as `columnOf` reads a list
 * line of that kind (lib/house-averages.ts). A trade in Tel Aviv on shares, bonds or a fund traded like them, on makam, or abroad; custody in
 * Israel or abroad. A fund bought from its manager has no trade column of its own on the sheet, and none is shown.
 */
function planColumn(kind: string, run: { instrumentClass: DealRun["instrumentClass"] }): AverageColumn | null {
  const c = run.instrumentClass;
  if (kind === "trade") {
    if (c === "foreign_securities") return { fee: "trade", securities: "foreign" };
    if (c === "makam") return { fee: "trade", securities: "il_makam" };
    return ["tase_shares_bonds", "tase_bonds", "etf_units"].includes(c) ? { fee: "trade", securities: "il_shares_bonds" } : null;
  }
  if (kind === "custody") return { fee: "custody", securities: c === "foreign_securities" ? "foreign" : "il" };
  return null;
}

/** The page's funds bought abroad (E). */
const abroadOf = (view: InvestView): FundWay[] => allFunds(view).filter((f) => f.option === "abroad");

/** A fee of the deal lacking a case for funds bought abroad (E): what is missing, the thing its case is added on, the values, and their words. */
interface AbroadGap {
  missing: Missing;
  by: "what" | "currency";
  values: string[];
  words: string;
}

/**
 * The deal's fees that lack a case for the page's funds bought abroad (E), each once, in the order the funds name them: only where that case
 * is what keeps the deal from a price on the fund (`at`, the deal's row there: its reason says so), so a fund the house it was filled from
 * does not sell, which the deal takes from the house (F-128), offers no case that could never price it. The case is what the fund is bought
 * as (a trade's) or the currency it is bought in (a conversion's), from the fund's run.
 */
function abroadGaps(funds: readonly FundWay[], at: (f: FundWay) => FundWay["byHouse"][string] | DealOnPlan | undefined, runOf: (f: FundWay) => DealRun | null): AbroadGap[] {
  const out: AbroadGap[] = [];
  for (const f of funds) {
    const got = at(f);
    const reason = got && "reason" in got ? got.reason : undefined;
    const missing = reason && reason.code === "deal-unpriced" ? reason.missing : null;
    if (!missing || missing.why !== "case" || (missing.kind !== "trade" && missing.kind !== "fx")) continue;
    const run = runOf(f);
    const value = run ? (missing.kind === "trade" ? whatOfRun(run) : run.currency) : null;
    if (!value) continue;
    const by = missing.kind === "trade" ? "what" : "currency";
    const gap = out.find((g) => g.missing.fee === missing.fee);
    if (gap) {
      if (!gap.values.includes(value)) gap.values.push(value);
    } else out.push({ missing, by, values: [value], words: "" });
  }
  for (const g of out) g.words = g.values.map((v) => feeDeal.cases.values[g.by]?.[v] ?? v).join(", ");
  return out;
}

/** The deal's fee with a case for the values a fund abroad is bought as or in (`gap`), its price not given yet, through the editor's own case adding; it opens. */
function addAbroadCase(ed: DealEditor, fee: Fee, gap: AbroadGap) {
  if (!hasCases(fee)) return;
  const t = fee.by.findIndex((b) => b.kind === gap.by);
  if (t < 0) return;
  const next = addBlankCase(fee, fee.by.map((_, j) => (j === t ? [...gap.values] : "any")));
  if (next === fee || !hasCases(next)) return;
  ed.doc.change(updateFee(ed.deal, fee.id, () => next));
  ed.doc.setChosen(fee.id);
  ed.oc.onOpenCase(fee.id, next.cases.at(-1)!.id, "pointer");
}

/** Under a fee's cases, where the deal has no case for a fund bought abroad: what is missing and its add (E). Not a kit piece: one sentence and the kit's inline button, said only here. */
function AbroadCaseLine({ words, onAdd }: { words: string; onAdd: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      {w.abroad.lacks(words)}
      <Button variant="inline" bold onClick={onAdd}>
        + {w.abroad.add}
      </Button>
    </p>
  );
}

/**
 * The popup's head (B, G): the deal's name typed in place, its pencil in its box (the fee page's bar's field), where it is kept, the fee
 * page's link, and a bin that deletes a saved deal at once, without asking (D117); the sheet's own close stands at its end. On a phone (C,
 * J) the name and the bin share the top bar and the link stands under them. Not a kit piece: the kit's `TextField` and `RemoveButton`
 * arranged for this popup alone.
 */
function DealHead({ deal, headId, isSaved, writable, onName, onDelete }: { deal: FeeDeal; headId: string; isSaved: boolean; writable: boolean; onName: (name: string) => void; onDelete: () => void }) {
  const wide = useMedia(MQ.md);
  const nameField = (
    <span className="flex min-w-0 flex-[1_1_22rem] items-center">
      <TextField inline grow labelHidden label={w.head.nameField} value={deal.name} maxLength={NAME_MAX} dir="auto" icon={<IconPencil size={16} />} onChange={onName} />
    </span>
  );
  const link = isSaved && (
    <TextLink to={DEAL_PATH} look="line" onClick={() => rememberOpen(deal.id)}>
      {w.head.openDeal} ↗
    </TextLink>
  );
  const bin = isSaved && writable && <RemoveButton label={w.head.remove} onRemove={onDelete} className="ms-auto" />;
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="sr-only">
        {deal.name || w.start.title}
      </h2>
      {wide ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pe-2">
          {nameField}
          <span className="text-sm text-muted-foreground">{isSaved ? w.head.saved : w.head.unsaved}</span>
          {link}
          {bin}
        </div>
      ) : (
        <div className="flex flex-col gap-1 pe-2">
          <div className="flex min-h-target items-center gap-2">
            {nameField}
            {bin}
          </div>
          {link}
        </div>
      )}
    </div>
  );
}

/**
 * Beside a deal's name in the lists, where a house's row has its file icon: the pencil that opens the deal in the popup, on the fee the row
 * waits for where it waits for one (`missing`, D1). With the name's entered ink it says the row is the person's own. `complete`: on a row
 * the plan cannot price, the button's words say it completes the deal. Not a kit piece: the kit's `Button`, wired to this page's popup.
 */
export function DealEditMark({ id, complete = false, missing = null }: { id: string; complete?: boolean; missing?: Missing | null }) {
  const api = useDealAccounts();
  const deal = api?.dealOf(id);
  if (!api || !deal) return null;
  return (
    <Button variant="icon" size="mark" aria-label={complete ? w.complete : w.edit} onClick={() => api.open({ dealId: deal.id, ...(missing ? { fee: missing.fee } : {}) })}>
      <Pencil size={14} aria-hidden />
    </Button>
  );
}

/**
 * Under the row of a deal the plan cannot price yet (D1): the fee it waits for, said without a tap, and the way to complete it. Not a kit
 * piece: the kit's `Button`, wired to this page's popup.
 */
export function DealMissing({ id, missing }: { id: string; missing: Missing }) {
  const api = useDealAccounts();
  const deal = api?.dealOf(id);
  if (!api || !deal) return null;
  return (
    <span className="block pb-1 text-sm leading-snug text-muted-foreground">
      {w.missing[missing.why]!(feeNameOf(missing.kind, missing.name))}{" "}
      <Button variant="inline" bold onClick={() => api.open({ dealId: deal.id, fee: missing.fee })}>
        <Pencil size={14} aria-hidden className="me-1 inline align-[-2px]" />
        {w.complete}
      </Button>
    </span>
  );
}

/** Under the account list: a new deal, started from a house's list or empty. Not a kit piece: the kit's `add` button, wired to this page's popup. */
export function AddDealButton() {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <Button variant="add" onClick={() => api.open({ house: null })}>
      {w.add}
    </Button>
  );
}

/**
 * Under the account list: each account typed by hand before deals took its place that the move could not make a deal of, so it is not in
 * the list, and why (lib/deal-account/move.ts, `MoveGapWhy`). Not a kit piece: the kit's `Sentence`, one line for each such account.
 */
export function NotMovedLines() {
  const api = useDealAccounts();
  if (!api || api.left.length === 0) return null;
  return (
    <>
      {api.left.map((a) => (
        <Sentence key={a.id} size="xs" tone="muted" t={w.notMoved} vars={{ name: <MixedName>{a.name}</MixedName>, why: w.notMovedWhy[a.why] }} />
      ))}
    </>
  );
}

/** A part's words, its figures in their number states (a figure typed in the entered ink, a figure from a price list sourced). Not a kit piece: it reads the deal's part words (`PartWords`), which only a deal has. */
function PartSaid({ words: p }: { words: PartWords }) {
  const fig = (v: SiteValue) => <Num value={v} display={amountWords(formatValue(v.value as number, v.unit))} />;
  return (
    <>
      {p.lead}
      {p.figure && fig(p.figure)}
      {p.mid}
      {p.second && fig(p.second)}
      {p.tail}
    </>
  );
}

/**
 * A deal fee as the ticket writes it (A, F): each price it holds in the case the plan reads, its parts joined, a later price after the month
 * it starts ("0% עד 11.2027, אחר כך 0.03% לרבעון"), and the pick of what only the person knows that chose its case ("· לפי: עם משכורת בבנק").
 * Not a kit piece: words built from the deal's reading, which the ticket's kit line (`ReceiptLine`) holds.
 */
function DealFeeWords({ read, feeId }: { read: DealRead; feeId: string }) {
  const fee = read.fees.find((f) => feeOf(f) === feeId);
  if (!fee) return null;
  const stages = fee.stages.map((stage) => slimParts(fee, { stages: [{ price: stage.price }] }, read).filter((x) => x.id !== "until" && x.words));
  const deal = read.deal.fees.find((f) => f.id === feeId);
  const own = deal && hasCases(deal) ? pickLine(read)?.things.filter((t) => !PLAN_KEYS.includes(t.by) && deal.by.some((b) => pickKey(b) === t.by)) : [];
  const picked = (own ?? []).flatMap((t) => {
    const o = t.options.find((x) => x.is === t.chosen);
    return o ? [whenText(o.words)] : [];
  });
  return (
    <>
      {stages.map((parts, k) => (
        <span key={k}>
          {k > 0 && w.ticket.after}
          {parts.map((x, j) => (
            <span key={`${x.id}-${j}`}>
              {j > 0 && ", "}
              <PartSaid words={x.words} />
            </span>
          ))}
          {fee.stages[k]!.until && k < stages.length - 1 && ` ${w.ticket.until(monthDots(fee.stages[k]!.until!))}`}
        </span>
      ))}
      {picked.length > 0 && ` · ${w.ticket.by}${picked.join(", ")}`}
    </>
  );
}

/** The last month of a price that ends at the start of month `until` (`YYYY-MM`), as the ticket writes it, `MM.YYYY`, isolated so it never flips. */
const monthDots = (until: string): string => {
  const [y, m] = until.split("-").map(Number) as [number, number];
  const last = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
  return `\u2066${String(last.m).padStart(2, "0")}.${last.y}\u2069`;
};

/** Where a deal just deleted from the popup stood in the account list (G): its name, in /deal's words, on the kit's card. Not a kit piece: one line said only here. */
export function DeletedLine({ name }: { name: string }) {
  const api = useDealAccounts();
  const ref = useRef<HTMLDivElement>(null);
  // it takes the focus as the popup closes (`focusAfter`), never by Tab; drawn again at another row's place (the address let go of the
  // deal, so the pick moved), it takes it back where nothing else has it
  useEffect(() => {
    if (document.activeElement === document.body) ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <Card ref={ref} pad="strip" id={api?.deletedLineId} tabIndex={-1} className="text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {w.deleted}
      <strong className="font-semibold text-foreground">{name}</strong>
    </Card>
  );
}

/**
 * A new deal from a house's latest list, on the person's terms: a text action in a line, standing where its line puts it (`className`).
 * Not a kit piece: the kit's `Button`, wired to this page's popup.
 */
export function DealFromHouseButton({ houseId, children, className }: { houseId: string; children: ReactNode; className?: string }) {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <Button variant="quiet" className={cx("text-sm", className)} onClick={() => api.open({ house: houseId })}>
      {children}
    </Button>
  );
}
