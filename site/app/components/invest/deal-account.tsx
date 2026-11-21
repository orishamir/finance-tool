// The person's securities-account deals on the index page (F-128): each saved deal is an account of the lists, and a popup edits it on the
// page's plan with the fee page's own editor (components/fee-deal/editor.tsx), so the two pages edit one deal one way. The popup opens on a
// saved deal (its row's pencil, its pair card), on a new deal from a house's latest price list (the pair card's "להזין מחיר שקיבלתם", a
// house's page through the address), or on a new deal started from a house's list or empty (the button under the account list). Its head
// names the deal and keeps its rename and delete; under it three tiles say what the deal leaves on the pair's fund, its place among the
// accounts, and, for a deal filled from a house's list, what it leaves against that house's own row; the plan line says what it is read on,
// and a pick bar what only the person knows (a track, a condition of their own). Each fee says under its block what the plan charges for it
// or why it charges nothing. The popup prices the deal alone as it changes; the page takes the deal once the popup closes, since pricing
// every account and fund again on each change would make typing wait. A new deal is saved only once it changes (use-deal-document.ts).
import { createContext, useContext, useDeferredValue, useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { IconPencil } from "../icons";
import { feeDeal, invest as root } from "../../copy";
import { fmt } from "../../lib/format";
import { dealOnFunds, dealRunOf, type DealOnPlan, type IndexRef, type InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import type { FeesData } from "../../lib/fee-page-data";
import type { ColumnAverage, HouseAverages } from "../../lib/house-averages";
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
import { dealFromTemplate, houseName, matching, rowTitle, templateOf, templateOptions } from "../../lib/fee-deal/templates";
import { updateFee } from "../../lib/fee-deal/edits/deal";
import { addBlankCase } from "../../lib/fee-deal/edits/case";
import { pickLine } from "../../lib/fee-deal/reading";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { dealProviderId, houseSnap, planContextOf, withDeals } from "../../lib/deal-account/bundle";
import { ACCOUNT_KIND, BANK_ACCOUNT, dealHouseId, feesOnPlan, PLAN_KEYS, planRead, whatOfRun, type FeeOnPlan, type Missing, type PlanContext } from "../../lib/deal-account/plan";
import { dealTiles, listFunds } from "../../lib/deal-account/tiles";
import { planCases } from "../../lib/deal-account/plan-cases";
import { dealBasis, type DealBasis } from "../../lib/deal-account/basis";
import { Sheet } from "../Sheet";
import { allFunds, repick, type Pick } from "./pair";
import { MQ, useMedia } from "../../lib/hooks";
import { useDealEditor, type DealEditor } from "../fee-deal/editor";
import { whenText } from "../fee-deal/open-case";
import { leavesText } from "../fee-deal/picker";
import { ActionMenu, Button, Card, GroupHead, HouseAverageLine, KeyValueList, ListRow, ReadForBand, RowList, SearchField, Sentence, StatRow, StatTile, Tag, TextField, TextLink, cx, When, type FeeHeadSlot, type GripAction, type KeyValueItem } from "../kit";

const w = root.dealAccount;

/**
 * What the popup opens on: a saved deal (at one of its fees, where its row's "להשלים" or the abroad line's "להוסיף לעסקה" opened it), or a
 * new deal from a house's list or from the start list (`house` null).
 */
export type DealTarget = { dealId: string; fee?: string } | { house: string | null };

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
  /** The deal's fee that has no case for buying abroad on this page (E), where the deal account `providerId` lacks one; null otherwise. */
  abroadLacks: (providerId: string) => Missing | null;
  /** Where a saved deal came from and what was changed from it (`dealBasis`), for the pair card; null for a deal filled from none. */
  basisOf: (providerId: string) => DealBasis | null;
  /** A deal fee as the ticket writes it under its line, read for the plan on fund `fundId` (A, F): its price as the deal has it, and its pick. */
  feeWords: (providerId: string, fundId: string, feeId: string) => ReactNode;
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

export function DealAccountsHost({ data, onWant, saved, writable, today, world, opening, onOpened, onOpenChange, children }: {
  /** The fee page's data, which the editor reads; null until loaded (`onWant` asks for it). */
  data: FeesData | null;
  onWant: () => void;
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
  children: ReactNode;
}) {
  const [target, setTarget] = useState<DealTarget | null>(null);
  const [deleted, setDeleted] = useState<DeletedDeal | null>(null);
  const [started, setStarted] = useState<FeeDeal | null>(null);
  const headId = useId();
  useEffect(() => {
    if (target && !data) onWant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, data]);
  const isOpen = target !== null;
  useEffect(() => onOpenChange(isOpen), [isOpen, onOpenChange]);
  useEffect(() => {
    if (!opening || !world) return;
    setTarget({ house: opening });
    onOpened();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening, !!world]);
  const api = useMemo<DealAccountsApi>(
    () => ({
      open: (t) => {
        setDeleted(null);
        setStarted(null);
        setTarget(t);
      },
      dealOf: (id) => saved.find((d) => dealProviderId(d.id) === id),
      deleted,
      abroadLacks: (id) => {
        const deal = saved.find((d) => dealProviderId(d.id) === id);
        if (!deal || !data || !world) return null;
        const gap = abroadGap(deal, world, planContextOf(world.bundle, deal, data.kinds, world.plan.currentAccounts ?? null));
        return gap ? { why: "case", fee: gap.fee, kind: "trade" } : null;
      },
      basisOf: (id) => {
        const deal = saved.find((d) => dealProviderId(d.id) === id);
        return deal && data ? dealBasis(deal, data.houses) : null;
      },
      feeWords: (id, fundId, feeId) => {
        const deal = saved.find((d) => dealProviderId(d.id) === id);
        if (!deal || !data || !world) return null;
        const run = dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId });
        if (!run) return null;
        return <DealFeeWords read={planRead(deal, run, planContextOf(world.bundle, deal, data.kinds, world.plan.currentAccounts ?? null))} feeId={feeId} />;
      },
    }),
    [saved, deleted, data, world],
  );
  const close = () => setTarget(null);
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
  // a new deal from a house's list, made once per opening
  const fromHouse = useMemo(() => (target && "house" in target && target.house && data ? houseDeal(`house:${target.house}`, data, today) : null), [target, data, today]);
  const first = !target || !data ? null : "dealId" in target ? (saved.find((d) => d.id === target.dealId) ?? null) : (fromHouse ?? started);
  return (
    <DealAccountsCtx.Provider value={api}>
      {children}
      <Sheet open={isOpen} onClose={close} pc="center" height={100} labelledBy={headId} className="sheet-deal">
        {target && data && world ? (
          first ? (
            <ProvenanceProvider data={provenance ?? EMPTY_PROVENANCE}>
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
                close();
              }}
            />
            </ProvenanceProvider>
          ) : (
            <DealStart data={data} today={today} headId={headId} onStart={(id) => setStarted(id ? houseDeal(id, data, today) : newDeal(ACCOUNT_KIND))} />
          )
        ) : target ? (
          <p id={headId} className="text-muted-foreground">
            {root.dealAccount.start.title}
          </p>
        ) : null}
      </Sheet>
    </DealAccountsCtx.Provider>
  );
}

/** What the popup reads before both the page's data and the fee page's are in (never on a page: its shell gives the one, the popup waits for the other). */
const EMPTY_PROVENANCE: ProvenanceData = { rules: {}, terms: {}, dimensions: {}, today: "" };

/** A new deal filled from a house's latest price list (`house:<id>`, or one of its ways to buy), named "<house>, בתנאים שלי"; a fresh deal where none fills. */
function houseDeal(id: string, data: FeesData, today: string): FeeDeal {
  const d = dealFromTemplate(newDeal(ACCOUNT_KIND), id, data, today);
  const house = houseName(id, data);
  return d ? { ...d, name: house ? w.nameOf(house).slice(0, NAME_MAX) : d.name } : newDeal(ACCOUNT_KIND);
}

/** The new deal's start: every house's latest price list, with what it leaves out of the deal, and an empty deal. */
function DealStart({ data, today, headId, onStart }: { data: FeesData; today: string; headId: string; onStart: (id: string | null) => void }) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => templateOptions(ACCOUNT_KIND, data, today).filter((o) => o.source === "house"), [data, today]);
  const left = useMemo(() => new Map(options.map((o) => [o.id, templateOf(newDeal(ACCOUNT_KIND), o.id, data, today)?.left ?? []])), [options, data, today]);
  const shown = matching(options, query);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {w.start.title}
        </h2>
        <p className="text-sm text-muted-foreground">{w.start.lede}</p>
      </div>
      <SearchField label={w.start.search} labelHidden value={query} onChange={setQuery} clearLabel={w.start.clear} />
      <div className="flex flex-col gap-2">
        <GroupHead>{w.start.group}</GroupHead>
        {shown.length === 0 ? (
          <p className="text-muted-foreground">{w.start.none}</p>
        ) : (
          <RowList label={w.start.group}>
            {shown.map((o) => (
              <ListRow key={o.id} title={rowTitle(o)} meta={leavesText(left.get(o.id))} onSelect={() => onStart(o.id)} />
            ))}
          </RowList>
        )}
      </div>
      <Button variant="quiet" className="self-start -ms-2" onClick={() => onStart(null)}>
        + {w.start.empty}
      </Button>
    </div>
  );
}

/** The popup on one deal: its head, the tiles and the plan line (sticky as the fees scroll), the pick bar, and the editor. */
function DealPopup({ data, today, saved, writable, first, openFee, world, headId, onDeleted }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; first: FeeDeal; /** The fee it opens on, where its opener names one. */ openFee?: string | undefined; world: DealWorld; headId: string; onDeleted: (name: string, at: number | null) => void }) {
  // what each fee's head says is read with the deal as it is now, which the editor holds: the editor draws it after this render
  const headRef = useRef<(fee: Fee) => FeeHeadSlot | undefined>(() => undefined);
  const ed = useDealEditor({ data, today, saved, writable, first, withReading: false, feeHead: (fee) => headRef.current(fee) });
  const deal = ed.deal;
  const providerId = dealProviderId(deal.id);
  const { view, pick } = world;
  // the fund the plan line names: the pair's where the deal is the pair's account, else the one the page would pair with it
  const fundId = pick ? (pick.house === providerId ? pick.fund : repick(view, pick, { house: providerId }).fund) : null;
  const funds = useMemo(() => (pick ? listFunds(allFunds(view), pick.fund, world.kinds) : []), [view, pick, world.kinds]);
  // the deal alone in the bundle, priced on the list's funds as it changes; the runs wait for the hand to rest (`useDeferredValue`)
  const bundle = useMemo(() => withDeals(world.bundle, [deal], data.kinds), [world.bundle, deal, data.kinds]);
  const settled = useDeferredValue(bundle);
  const got = useMemo(() => (fundId ? dealOnFunds({ bundle: settled, index: world.index, plan: world.plan, fundIds: [...new Set([fundId, ...funds.map((f) => f.rec.id)])], providerId }) : new Map<string, DealOnPlan>()), [settled, world.index, world.plan, fundId, funds, providerId]);
  const at = fundId ? (got.get(fundId) ?? null) : null;
  const run = useMemo(() => (fundId ? dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId }) : null), [world.bundle, world.index, world.plan, fundId]);
  const houseId = dealHouseId(deal);
  const tiles = fundId ? dealTiles(view, got, providerId, houseId, fundId, funds) : null;
  const house = houseId ? view.houses.find((h) => h.provider.id === houseId)?.provider : undefined;
  // the deal is read on the page's plan as its run reads it: the page's run month, the house's line choice and its current account (F-128)
  const ctx = useMemo(() => planContextOf(world.bundle, deal, data.kinds, world.plan.currentAccounts ?? null), [world.bundle, deal, data.kinds, world.plan.currentAccounts]);
  const onPlan = useMemo(() => (run ? new Map(feesOnPlan(deal, run, ctx).map((x) => [x.fee, x])) : null), [deal, run, ctx]);
  // a fund bought abroad the deal has no case for (E): the values the page's funds abroad are bought as, where the deal's trade fee lacks them
  const abroad = useMemo(() => abroadGap(deal, world, ctx), [deal, world, ctx]);
  const averages = houseId ? data.houses.find((h) => h.id === houseId)?.averages : undefined;
  const abroadFund = run?.instrumentClass === "foreign_securities";
  // the deal read for the plan: the cases it reads, and the picks it cannot set, what only the person knows, saved with the deal
  const read = useMemo(() => (run ? planRead(deal, run, ctx) : null), [deal, run, ctx]);
  const picks = useMemo(() => (read ? pickLine(read) : null), [read]);
  headRef.current = (fee) => {
    const x = onPlan?.get(fee.id);
    const avg = averages && house ? averageOf(averages, fee.kind, abroadFund) : null;
    const average = avg && averages && house ? <HouseAverageLine averages={[avg]} house={house.short} from={averages.from} to={averages.to} page={averages.page} /> : null;
    const foot = abroad && abroad.fee === fee.id ? <AbroadCaseLine words={abroad.words} onAdd={() => addAbroadCase(ed, fee, abroad.values)} /> : null;
    const slot = x ? feeHeadOf(x, at?.kind === "ok" ? at.figure(shownCost(at.byFee[fee.id] ?? 0), w.feeCostAbout(feeNameOf(fee.kind, fee.name))) : null, house?.short ?? null) : {};
    // the cases the plan reads, a step of the size with the years the plan spends in it (B, F), where the plan charges the fee
    const marks = read && x?.on === "charged" && hasCases(fee) ? planCases(read, fee.id, at?.kind === "ok" ? at.balances : null) : null;
    const caseMark = marks && marks.size ? (id: string) => (marks.has(id) ? w.planCase(marks.get(id)!.years) : undefined) : undefined;
    return { ...slot, ...(average || slot.under ? { under: <>{slot.under}{average}</> } : {}), ...(foot ? { foot } : {}), ...(caseMark ? { caseMark } : {}) };
  };
  const own = picks?.things.filter((t) => !PLAN_KEYS.includes(t.by)) ?? [];
  const where = run ? (run.instrumentClass === "mutual_fund_units" ? w.where.manager! : w.where[whatOfRun(run) === "tase" ? "tase" : (run.listing ?? "world")]!) : "";
  const fund = fundId ? allFunds(view).find((f) => f.rec.id === fundId) : undefined;
  const isSaved = saved.some((d) => d.id === deal.id);
  const p = world.plan;
  // the bank's current account the plan counts from the house's record, where the deal names none (F-102): one quiet line after the fees
  const bankMonthly = houseSnap(world.bundle, deal)?.current_account?.monthly_minimum;
  const bankLine =
    ctx.bankAccount !== undefined && house && bankMonthly && !deal.fees.some((f) => f.kind === "current_account")
      ? { monthly: bankMonthly as SiteValue, cost: at?.kind === "ok" ? at.figure(shownCost(at.byFee[BANK_ACCOUNT] ?? 0), w.bankCostAbout(house.short)) : null }
      : null;
  // a deal opens on the fee its opener names (the abroad line's "להוסיף לעסקה"), else, where the plan cannot price it, on the fee that lacks
  // something, as its row's "להשלים" says
  useEffect(() => {
    const lacks = openFee ?? (at?.kind === "fail" && "missing" in at.reason ? at.reason.missing?.fee : undefined);
    // else it opens with no fee open, its toolbox's column the fees it can still take and "מתעריפון אחר" (B)
    if (!lacks) return ed.doc.setChosen(null);
    ed.doc.setChosen(lacks);
    ed.doc.setFocus({ fee: lacks, on: "card" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wide = useMedia(MQ.md);
  const [planShown, setPlanShown] = useState(false);
  // the tiles' figures, each computed from the run with its formula (F-128): what is left, the place, the difference from the house's row
  const okAt = at?.kind === "ok" ? at : null;
  const leftFig = tiles?.left !== null && tiles?.left !== undefined && okAt ? okAt.figure(tiles.left, w.tiles.leftAbout) : null;
  const placeFig = tiles?.place ? computed(tiles.place.k, "count", "F-128", leftFig ? { [w.tiles.leftAbout]: leftFig } : {}, { today: world.bundle.today, about: w.tiles.placeAbout(tiles.place.of) }) : null;
  const diffFig = leftFig && tiles?.house && house ? differenceOf([w.tiles.leftAbout, leftFig], [w.tiles.houseAbout(house.short), tiles.house.value], "F-128", { today: world.bundle.today, about: w.tiles.diffAbout, round: Math.round, signed: true }) : null;
  const leftNum = leftFig && <Num value={leftFig} display={(n) => fmt.nisWhole(n)} />;
  const placeNum = placeFig && tiles?.place && <Num value={placeFig} display={() => w.tiles.placeValue(tiles.place!.k, tiles.place!.of)} />;
  const diffNum = diffFig && <Num value={diffFig} display={(n) => fmt.signedNisWhole(n)} />;
  const planLine = fund ? w.plan(fmt.nisWhole(p.amountNow), fmt.nisWhole(p.monthly), p.years, fmt.pct(p.grossReturn * 100), fund.name, where) : null;

  return (
    <div className="flex flex-col gap-4">
      <DealHead deal={deal} headId={headId} isSaved={isSaved} writable={writable} onName={(name) => ed.doc.change({ ...deal, name: name.slice(0, NAME_MAX) })} onDelete={() => {
        dealStore.update((ds) => without(ds, deal.id));
        onDeleted(deal.name, tiles?.place ? tiles.place.k - 1 : null);
      }} />
      {tiles && !wide && (
        // a phone: one strip stays at the top, what is left and the place on its first line, the difference and the plan's tap under them,
        // and the choice of what only the person knows under it, one line
        <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-1 border-b border-border bg-popover px-1 py-2 text-sm">
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
          {run && own.length > 0 && <ReadForBand lead={w.readForShort} picks={pickItems(own, ed)} />}
        </div>
      )}
      {tiles && wide && (
        <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-2 bg-popover px-1 pb-2">
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
      {run && wide && own.length > 0 && <ReadForBand lead={w.readFor} note={w.planKnows(where)} picks={pickItems(own, ed)} />}
      {ed.picker}
      {ed.columns(null)}
      {bankLine && house && <Sentence size="sm" tone="muted" t={w.bankAccount(house.short, bankLine.cost !== null)} vars={{ monthly: <Num value={bankLine.monthly} />, cost: bankLine.cost && <Num value={bankLine.cost} display={costText} /> }} />}
      {ed.menus}
      {ed.footSheet}
    </div>
  );
}

/** The pick bar's choices: each thing only the person knows, its values, and the deal's pick of it (`onPick`). */
const pickItems = (own: NonNullable<ReturnType<typeof pickLine>>["things"], ed: DealEditor) =>
  own.map((t) => ({ name: t.words, items: t.options.map((o) => ({ id: o.is, label: whenText(o.words) })), value: t.chosen, onSelect: (is: string) => ed.onPick(t.by, is) }));

/**
 * What a fee's head says on the plan (B): at its end what the plan charges for it ("בתוכנית −60 ₪"), or the chip saying the plan never
 * charges it with why under the head, or, under the head, what it lacks for a price.
 */
function feeHeadOf(x: FeeOnPlan, cost: SiteValue | null, bank: string | null): FeeHeadSlot {
  if (x.on === "missing") return { under: <p>{w.missing[x.missing.why]!(feeNameOf(x.missing.kind, x.missing.name))}</p> };
  if (x.on === "off") return { end: <Tag>{w.offPlan}</Tag>, under: <p>{x.why === "own-bank" && bank ? w.ownBank(bank) : w.off[x.why]}</p> };
  return {
    end: (
      <span className="inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
        {w.onPlan}
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

/** The column of a house's averages (F-122) a fee's head shows: the trade or custody column for the fund's place, else none. */
function averageOf(a: HouseAverages, kind: string, abroad: boolean): ColumnAverage | null {
  const want = kind === "trade" ? (abroad ? "foreign" : "il_shares_bonds") : kind === "custody" ? (abroad ? "foreign" : "il") : null;
  return want ? (a.columns.find((c) => c.column.fee === kind && c.column.securities === want) ?? null) : null;
}

/**
 * The deal's trade fee lacking a case for what the page's funds bought abroad are bought as (E): the fee, the values (where each such fund
 * is bought) and their words; null where the index has no such fund or the deal prices it.
 */
function abroadGap(deal: FeeDeal, world: DealWorld, ctx: PlanContext): { fee: string; values: string[]; words: string } | null {
  const runs = allFunds(world.view).filter((f) => f.option === "abroad").flatMap((f) => {
    const r = dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId: f.rec.id });
    return r ? [r] : [];
  });
  if (runs.length === 0) return null;
  const lacks = runs.flatMap((r) => feesOnPlan(deal, r, ctx).filter((x) => x.on === "missing" && x.missing.why === "case" && x.missing.kind === "trade").map((x) => ({ fee: x.fee, value: whatOfRun(r) })));
  if (lacks.length === 0) return null;
  const values = [...new Set(lacks.map((l) => l.value))];
  return { fee: lacks[0]!.fee, values, words: values.map((v) => feeDeal.cases.values.what[v] ?? v).join(", ") };
}

/** The deal's trade fee with a case for the values bought abroad, its price not given yet, through the editor's own case adding; it opens. */
function addAbroadCase(ed: DealEditor, fee: Fee, values: readonly string[]) {
  if (!hasCases(fee)) return;
  const t = fee.by.findIndex((b) => b.kind === "what");
  if (t < 0) return;
  const next = addBlankCase(fee, fee.by.map((_, j) => (j === t ? [...values] : "any")));
  if (next === fee || !hasCases(next)) return;
  ed.doc.change(updateFee(ed.deal, fee.id, () => next));
  ed.doc.setChosen(fee.id);
  ed.oc.onOpenCase(fee.id, next.cases.at(-1)!.id, "pointer");
}

/** Under the buy-and-sell block's cases, where the deal has no case for a fund bought abroad: what is missing and its add (E). */
function AbroadCaseLine({ words, onAdd }: { words: string; onAdd: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      {w.abroad.lacks(words)}
      <Button variant="inline" onClick={onAdd}>
        + {w.abroad.add}
      </Button>
    </p>
  );
}

/**
 * The popup's head (B, G): on a computer the deal's name typed in place, its pencil in its box (the fee page's bar's field), where it is
 * kept, the fee page's link, and its menu (rename, delete); the sheet's own close stands at its end. On a phone (C, J) one top bar: the
 * name, and the menu, which also holds the fee page's link. Delete asks first, under the head on a computer, as a sheet from the
 * foot on a phone.
 */
function DealHead({ deal, headId, isSaved, writable, onName, onDelete }: { deal: FeeDeal; headId: string; isSaved: boolean; writable: boolean; onName: (name: string) => void; onDelete: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [menu, setMenu] = useState(false);
  const [asking, setAsking] = useState(false);
  const wide = useMedia(MQ.md);
  const askId = useId();
  // the menu's control, which it stands under and gives the focus back to
  const more = useRef<HTMLElement | null>(null);
  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    more.current = e.currentTarget;
    setMenu((x) => !x);
  };
  const field = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const toDeal = () => {
    // /deal opens on the deal last on screen: this one
    rememberOpen(deal.id);
    navigate(DEAL_PATH);
  };
  const rename = () => {
    setRenaming(true);
    requestAnimationFrame(() => field.current?.querySelector("input")?.focus());
  };
  const actions: GripAction[] = [
    { label: w.head.rename, onPick: rename },
    ...(isSaved && writable ? [{ label: w.head.remove, danger: true, onPick: () => setAsking(true) }] : []),
    ...(!wide && isSaved ? [{ label: `${w.head.openDeal} ↗`, onPick: toDeal }] : []),
  ];
  const nameField = (
    <span ref={field} className="flex min-w-0 flex-[1_1_22rem] items-center" onBlur={() => !wide && setRenaming(false)}>
      <TextField inline grow labelHidden label={w.head.nameField} value={deal.name} maxLength={NAME_MAX} placeholder={w.start.title} icon={<IconPencil size={16} />} onChange={onName} />
    </span>
  );
  const close = () => {
    setAsking(false);
    setMenu(false);
  };
  return (
    <div className="flex flex-col gap-3">
      {wide ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pe-2">
          <h2 id={headId} className="sr-only">
            {deal.name || w.start.title}
          </h2>
          {nameField}
          <span className="text-sm text-muted-foreground">{isSaved ? w.head.saved : w.head.unsaved}</span>
          {isSaved && (
            <TextLink to={DEAL_PATH} look="line" onClick={() => rememberOpen(deal.id)}>
              {w.head.openDeal} ↗
            </TextLink>
          )}
          <Button variant="icon" aria-label={w.head.more} aria-expanded={menu} onClick={openMenu} className="ms-auto">
            <MoreHorizontal size={18} aria-hidden />
          </Button>
        </div>
      ) : (
        // a phone's top bar: the name, the menu, and the sheet's close at the end
        <div className="flex min-h-target items-center gap-2 pe-2">
          {renaming ? (
            nameField
          ) : (
            <h2 id={headId} className="min-w-0 flex-1 text-lg font-semibold [overflow-wrap:anywhere]">
              {deal.name || w.start.title}
            </h2>
          )}
          <Button variant="icon" aria-label={w.head.more} aria-expanded={menu} onClick={openMenu}>
            <MoreHorizontal size={18} aria-hidden />
          </Button>
        </div>
      )}
      {menu && <ActionMenu actions={actions} onClose={() => setMenu(false)} back={more} />}
      {asking && wide && (
        <Card pad="tight" role="alertdialog" aria-label={w.head.confirm} className="flex flex-col gap-2 self-end">
          <p className="font-medium">{w.head.confirm}</p>
          <p className="text-sm text-muted-foreground">{w.head.confirmBody}</p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={onDelete}>
              {w.head.confirmYes}
            </Button>
            <Button onClick={close}>{w.head.confirmNo}</Button>
          </div>
        </Card>
      )}
      {/* a phone: the question comes as a sheet from the foot, its buttons the screen's width (J) */}
      <Sheet open={asking && !wide} onClose={close} labelledBy={askId}>
        <div className="flex flex-col gap-3">
          <h3 id={askId} className="text-lg font-semibold">
            {w.head.confirm}
          </h3>
          <p className="text-muted-foreground">{w.head.confirmBody}</p>
          <Button variant="destructive" className="w-full" onClick={onDelete}>
            {w.head.confirmYes}
          </Button>
          <Button className="w-full" onClick={close}>
            {w.head.confirmNo}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/** Under a deal's row in the lists: that it is the person's, and its edit, which on a row the plan cannot price (`complete`) completes it. */
export function DealTerms({ id, complete = false }: { id: string; complete?: boolean }) {
  const api = useDealAccounts();
  const deal = api?.dealOf(id);
  if (!api || !deal) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-snug text-muted-foreground">
      <Tag>{w.tag}</Tag>
      <Button variant="quiet" className="min-h-target text-sm" onClick={() => api.open({ dealId: deal.id })}>
        <Pencil size={14} aria-hidden />
        {complete ? w.complete : w.edit}
      </Button>
    </span>
  );
}

/** Under the account list: a new deal, started from a house's list or empty. */
export function AddDealButton() {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <>
      <Button variant="quiet" className="self-start -ms-2" onClick={() => api.open({ house: null })}>
        + {w.add}
      </Button>
    </>
  );
}

/**
 * The pair card's account half where the account is the person's deal (H): the price list it was filled from and that list's date, the fees
 * changed from it, the day it was saved, and its two ways on: edit it here (the popup) and open it on /deal.
 */
export function DealCard({ id, house }: { id: string; house: (houseId: string) => string | null }) {
  const api = useDealAccounts();
  const deal = api?.dealOf(id);
  if (!api || !deal) return null;
  const basis = api.basisOf(id);
  const items: KeyValueItem[] = [
    ...(basis ? [{ id: "basis", label: w.card.basis, value: <>{w.card.basisValue(house(basis.house) ?? basis.name, basis.date !== null)}{basis.date && <When iso={basis.date} />}</> }] : []),
    ...(basis && basis.changed.length ? [{ id: "changed", label: w.card.changed, value: basis.changed.map((x) => feeNameOf(x.kind, x.name)).join(", ") }] : []),
    ...(deal.saved ? [{ id: "saved", label: w.card.saved, value: <When iso={deal.saved} /> }] : []),
  ];
  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && <KeyValueList items={items} />}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button variant="outline" onClick={() => api.open({ dealId: deal.id })}>
          <Pencil size={16} aria-hidden />
          {w.edit}
        </Button>
        {/* /deal opens on the deal last on screen: this one */}
        <TextLink to={DEAL_PATH} look="line" onClick={() => rememberOpen(deal.id)}>
          {w.head.openDeal} ↗
        </TextLink>
      </div>
    </div>
  );
}

/** A part's words, its figures in their number states (a figure typed in the entered ink, a figure from a price list sourced). */
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

/** Where a deal just deleted from the popup stood in the account list (G): its name, in /deal's words. */
export function DeletedLine({ name }: { name: string }) {
  return (
    <p className="rounded-md bg-card px-3 py-2 text-sm text-muted-foreground">
      {w.deleted}
      <strong className="font-semibold text-foreground">{name}</strong>
    </p>
  );
}

/** On a house's pair card: a new deal from the house's latest list, on the person's terms. */
export function DealFromHouseButton({ houseId, children, className = "self-start -ms-2" }: { houseId: string; children: ReactNode; className?: string }) {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <Button variant="quiet" className={cx("text-sm", className)} onClick={() => api.open({ house: houseId })}>
      {children}
    </Button>
  );
}
