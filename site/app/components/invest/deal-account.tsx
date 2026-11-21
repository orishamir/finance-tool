// The person's securities-account deals on the index page (F-128): each saved deal is an account of the lists, and a popup edits it on the
// page's plan with the fee page's own editor (components/fee-deal/editor.tsx), so the two pages edit one deal one way. The popup opens on a
// saved deal (its row's pencil, its pair card), on a new deal from a house's latest price list (the pair card's "להזין מחיר שקיבלתם", a
// house's page through the address), or on a new deal started from a house's list or empty (the button under the account list). Its head
// names the deal and keeps its rename and delete; under it three tiles say what the deal leaves on the pair's fund, its place among the
// accounts, and, for a deal filled from a house's list, what it leaves against that house's own row; the plan line says what it is read on,
// and a pick bar what only the person knows (a track, a condition of their own). Each fee says under its block what the plan charges for it
// or why it charges nothing. The popup prices the deal alone as it changes; the page takes the deal once the popup closes, since pricing
// every account and fund again on each change would make typing wait. A new deal is saved only once it changes (use-deal-document.ts).
import { createContext, useContext, useDeferredValue, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { feeDeal, invest as root } from "../../copy";
import { fmt } from "../../lib/format";
import { dealOnFunds, dealRunOf, type DealOnPlan, type IndexRef, type InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import type { FeesData } from "../../lib/fee-page-data";
import type { ColumnAverage, HouseAverages } from "../../lib/house-averages";
import { hasCases, newDeal, NAME_MAX, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { dealStore, without } from "../../lib/fee-deal/store";
import { dealFromTemplate, houseName, matching, rowTitle, templateOf, templateOptions } from "../../lib/fee-deal/templates";
import { updateFee } from "../../lib/fee-deal/edits/deal";
import { addBlankCase } from "../../lib/fee-deal/edits/case";
import { pickLine } from "../../lib/fee-deal/reading";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { dealProviderId, planContextOf, withDeals } from "../../lib/deal-account/bundle";
import { ACCOUNT_KIND, BANK_ACCOUNT, dealHouseId, feesOnPlan, PLAN_KEYS, planRead, whatOfRun, type FeeOnPlan, type Missing, type PlanContext } from "../../lib/deal-account/plan";
import { dealTiles, listFunds } from "../../lib/deal-account/tiles";
import { Sheet } from "../Sheet";
import { allFunds, repick, type Pick } from "./pair";
import { MQ, useMedia } from "../../lib/hooks";
import { useDealEditor, type DealEditor } from "../fee-deal/editor";
import { whenText } from "../fee-deal/open-case";
import { leavesText } from "../fee-deal/picker";
import { Button, Card, GroupHead, HouseAverageLine, ListRow, ReadForBand, RowList, SearchField, StatRow, StatTile, Tag, TextField, TextLink, cx, type FeeHeadSlot } from "../kit";

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
    }),
    [saved, deleted, data, world],
  );
  const close = () => setTarget(null);
  // a new deal from a house's list, made once per opening
  const fromHouse = useMemo(() => (target && "house" in target && target.house && data ? houseDeal(`house:${target.house}`, data, today) : null), [target, data, today]);
  const first = !target || !data ? null : "dealId" in target ? (saved.find((d) => d.id === target.dealId) ?? null) : (fromHouse ?? started);
  return (
    <DealAccountsCtx.Provider value={api}>
      {children}
      <Sheet open={isOpen} onClose={close} pc="center" height={100} labelledBy={headId} className="sheet-deal">
        {target && data && world ? (
          first ? (
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
  headRef.current = (fee) => {
    const x = onPlan?.get(fee.id);
    const avg = averages && house ? averageOf(averages, fee.kind, abroadFund) : null;
    const average = avg && averages && house ? <HouseAverageLine averages={[avg]} house={house.short} from={averages.from} to={averages.to} page={averages.page} /> : null;
    const foot = abroad && abroad.fee === fee.id ? <AbroadCaseLine words={abroad.words} onAdd={() => addAbroadCase(ed, fee, abroad.values)} /> : null;
    const slot = x ? feeHeadOf(x, at?.kind === "ok" ? (at.byFee[fee.id] ?? 0) : null, house?.short ?? null) : {};
    return { ...slot, ...(average || slot.under ? { under: <>{slot.under}{average}</> } : {}), ...(foot ? { foot } : {}) };
  };
  // the picks the plan cannot set: what only the person knows, saved with the deal
  const picks = useMemo(() => (run ? pickLine(planRead(deal, run, ctx)) : null), [deal, run, ctx]);
  const own = picks?.things.filter((t) => !PLAN_KEYS.includes(t.by)) ?? [];
  const where = run ? (run.instrumentClass === "mutual_fund_units" ? w.where.manager! : w.where[whatOfRun(run) === "tase" ? "tase" : (run.listing ?? "world")]!) : "";
  const fund = fundId ? allFunds(view).find((f) => f.rec.id === fundId) : undefined;
  const isSaved = saved.some((d) => d.id === deal.id);
  const p = world.plan;
  // the bank's current account the plan counts from the house's record, where the deal names none (F-102): one quiet line after the fees
  const bankLine = ctx.bankAccount !== undefined && house && !deal.fees.some((f) => f.kind === "current_account") ? { monthly: ctx.bankAccount, cost: at?.kind === "ok" ? (at.byFee[BANK_ACCOUNT] ?? 0) : null } : null;
  // a deal opens on the fee its opener names (the abroad line's "להוסיף לעסקה"), else, where the plan cannot price it, on the fee that lacks
  // something, as its row's "להשלים" says
  useEffect(() => {
    const lacks = openFee ?? (at?.kind === "fail" && "missing" in at.reason ? at.reason.missing?.fee : undefined);
    if (!lacks) return;
    ed.doc.setChosen(lacks);
    ed.doc.setFocus({ fee: lacks, on: "card" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wide = useMedia(MQ.md);
  const [planShown, setPlanShown] = useState(false);
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
              {w.tiles.left(p.years)} <strong className={tiles.left !== null ? "text-entered" : undefined}>{tiles.left !== null ? fmt.nisWhole(tiles.left) : w.tiles.noSum}</strong>
            </span>
            <strong>{tiles.place ? w.tiles.placeValue(tiles.place.k, tiles.place.of) : w.tiles.unranked}</strong>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            {house && tiles.diff !== null && <span>{`${fmt.signedNisWhole(Math.round(tiles.diff))} ${w.tiles.diff(house.short)}`}</span>}
            {house && tiles.diff !== null && fund && <span aria-hidden="true">·</span>}
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
              {tiles.left !== null ? <span className="text-entered">{fmt.nisWhole(tiles.left)}</span> : <span className="text-base">{w.tiles.noSum}</span>}
            </StatTile>
            <StatTile label={w.tiles.place} note={tiles.place ? w.tiles.placeNote : w.tiles.unrankedNote}>
              {tiles.place ? w.tiles.placeValue(tiles.place.k, tiles.place.of) : <span className="text-base">{w.tiles.unranked}</span>}
            </StatTile>
            {house && (
              <StatTile label={w.tiles.diff(house.short)} note={w.tiles.diffNote}>
                {tiles.diff !== null ? fmt.signedNisWhole(Math.round(tiles.diff)) : <span aria-hidden="true">—</span>}
              </StatTile>
            )}
          </StatRow>
          {planLine && <p className="text-sm text-muted-foreground">{planLine}</p>}
        </div>
      )}
      {run && wide && own.length > 0 && <ReadForBand lead={w.readFor} note={w.planKnows(where)} picks={pickItems(own, ed)} />}
      {ed.picker}
      {ed.columns(null)}
      {bankLine && house && <p className="text-sm text-muted-foreground">{w.bankAccount(house.short, fmt.nis(bankLine.monthly), bankLine.cost !== null ? fmt.nisWhole(-Math.round(bankLine.cost)) : null)}</p>}
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
function feeHeadOf(x: FeeOnPlan, cost: number | null, bank: string | null): FeeHeadSlot {
  if (x.on === "missing") return { under: <p>{w.missing[x.missing.why]!(feeNameOf(x.missing.kind, x.missing.name))}</p> };
  if (x.on === "off") return { end: <Tag>{w.offPlan}</Tag>, under: <p>{x.why === "own-bank" && bank ? w.ownBank(bank) : w.off[x.why]}</p> };
  return {
    end: (
      <span className="inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
        {w.onPlan}
        {cost !== null && <strong className="text-base font-bold text-foreground tabular-nums">{fmt.nisWhole(-Math.round(cost))}</strong>}
      </span>
    ),
  };
}

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

/** The popup's head: the deal's name with its rename, where it is kept and the fee page's link, and its menu with the delete and its question. */
function DealHead({ deal, headId, isSaved, writable, onName, onDelete }: { deal: FeeDeal; headId: string; isSaved: boolean; writable: boolean; onName: (name: string) => void; onDelete: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [menu, setMenu] = useState(false);
  const [asking, setAsking] = useState(false);
  const wide = useMedia(MQ.md);
  const askId = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {renaming ? (
          <TextField label={w.head.nameField} labelHidden value={deal.name} onChange={onName} maxLength={NAME_MAX} />
        ) : (
          <h2 id={headId} className="text-lg font-semibold text-entered [overflow-wrap:anywhere]">
            {deal.name || w.start.title}
          </h2>
        )}
        <Button variant="icon" size="sm" aria-label={w.head.rename} aria-pressed={renaming} onClick={() => setRenaming((x) => !x)}>
          <Pencil size={16} aria-hidden />
        </Button>
        {isSaved && writable && (
          <Button variant="icon" size="sm" aria-label={w.head.more} aria-expanded={menu} onClick={() => setMenu((x) => !x)}>
            <MoreHorizontal size={18} aria-hidden />
          </Button>
        )}
      </div>
      <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
        <span>{isSaved ? w.head.saved : w.head.unsaved}</span>
        {isSaved && (
          <TextLink to="/deal" look="line">
            {w.head.openDeal} ↗
          </TextLink>
        )}
      </p>
      {menu && !asking && (
        <Card pad="tight" className="flex flex-col items-start self-start">
          <Button variant="quiet" onClick={() => { setRenaming(true); setMenu(false); }}>
            {w.head.rename}
          </Button>
          <Button variant="quiet" className="text-destructive" onClick={() => setAsking(true)}>
            {w.head.remove}
          </Button>
        </Card>
      )}
      {asking && wide && (
        <Card pad="tight" role="alertdialog" aria-label={w.head.confirm} className="flex flex-col gap-2 self-start">
          <p className="font-medium">{w.head.confirm}</p>
          <p className="text-sm text-muted-foreground">{w.head.confirmBody}</p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={onDelete}>
              {w.head.confirmYes}
            </Button>
            <Button onClick={() => { setAsking(false); setMenu(false); }}>{w.head.confirmNo}</Button>
          </div>
        </Card>
      )}
      {/* a phone: the question comes as a sheet from the foot, its buttons the screen's width (J) */}
      <Sheet open={asking && !wide} onClose={() => { setAsking(false); setMenu(false); }} labelledBy={askId}>
        <div className="flex flex-col gap-3">
          <h3 id={askId} className="text-lg font-semibold">
            {w.head.confirm}
          </h3>
          <p className="text-muted-foreground">{w.head.confirmBody}</p>
          <Button variant="destructive" className="w-full" onClick={onDelete}>
            {w.head.confirmYes}
          </Button>
          <Button className="w-full" onClick={() => { setAsking(false); setMenu(false); }}>
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
