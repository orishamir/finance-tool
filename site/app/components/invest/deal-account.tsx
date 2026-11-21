// The person's securities-account deals on the index page (F-128): each saved deal is an account of the lists, and a popup edits it on the
// page's plan with the fee page's own editor (components/fee-deal/editor.tsx), so the two pages edit one deal one way. The popup opens on a
// saved deal (its row's pencil, its pair card), on a new deal from a house's latest price list (the pair card's "להזין מחיר שקיבלתם", a
// house's page through the address), or on a new deal started from a house's list or empty (the button under the account list). Its head
// names the deal and keeps its rename and delete; under it three tiles say what the deal leaves on the pair's fund, its place among the
// accounts, and, for a deal filled from a house's list, what it leaves against that house's own row; the plan line says what it is read on,
// and a pick bar what only the person knows (a track, a condition of their own). Each fee says under its block what the plan charges for it
// or why it charges nothing. The popup prices the deal alone as it changes; the page takes the deal once the popup closes, since pricing
// every account and fund again on each change would make typing wait. A new deal is saved only once it changes (use-deal-document.ts).
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { invest as root } from "../../copy";
import { fmt } from "../../lib/format";
import { dealOnPlan, dealRunOf, type IndexRef, type InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import type { FeesData } from "../../lib/fee-page-data";
import { newDeal, NAME_MAX, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { dealStore, without } from "../../lib/fee-deal/store";
import { dealFromTemplate, houseName, matching, rowTitle, templateOf, templateOptions } from "../../lib/fee-deal/templates";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { pickLine } from "../../lib/fee-deal/reading";
import { feeNameOf } from "../../lib/fee-deal/part-words";
import { dealProviderId } from "../../lib/deal-account/bundle";
import { ACCOUNT_KIND, dealHouseId, feesOnPlan, PLAN_KEYS, planDeal, whatOfRun, type FeeOnPlan } from "../../lib/deal-account/plan";
import { dealTiles } from "../../lib/deal-account/tiles";
import { withDeals } from "../../lib/deal-account/bundle";
import { Sheet } from "../Sheet";
import { allFunds } from "./pair";
import { MQ, useMedia } from "../../lib/hooks";
import { useDealEditor } from "../fee-deal/editor";
import { whenText } from "../fee-deal/open-case";
import { leavesText } from "../fee-deal/picker";
import { Button, Card, GroupHead, ListRow, ReadForBand, RowList, SearchField, StatRow, StatTile, Tag, TextField, TextLink, cx } from "../kit";

const w = root.dealAccount;

/** What the popup opens on: a saved deal (at one of its fees, where its row's "להשלים" opened it), or a new deal from a house's list or from the start list (`house` null). */
export type DealTarget = { dealId: string; fee?: string } | { house: string | null };

interface DealAccountsApi {
  open: (t: DealTarget) => void;
  /** The saved deals of the page, by their account id on the page. */
  dealOf: (providerId: string) => FeeDeal | undefined;
  /** The name of the deal just deleted from the popup, said where the list's button stands; null after any other step. */
  deleted: string | null;
}
const DealAccountsCtx = createContext<DealAccountsApi | null>(null);
export const useDealAccounts = () => useContext(DealAccountsCtx);

/** What the popup prices on: the page's bundle without the person's deals, the index, the plan, the page's view, and the pair's fund. */
export interface DealWorld {
  bundle: IndicesBundle;
  index: IndexRef;
  plan: WorkbenchInputs;
  view: InvestView;
  fundId: string | null;
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
  const [deleted, setDeleted] = useState<string | null>(null);
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
    }),
    [saved, deleted],
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
              world={world}
              headId={headId}
              onDeleted={(name) => {
                setDeleted(name);
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
function DealPopup({ data, today, saved, writable, first, world, headId, onDeleted }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; first: FeeDeal; world: DealWorld; headId: string; onDeleted: (name: string) => void }) {
  // what each fee's block says under it is read with the deal as it is now, which the editor holds: the editor draws it after this render
  const noteRef = useRef<(fee: Fee) => ReactNode>(() => null);
  const ed = useDealEditor({ data, today, saved, writable, first, withReading: false, feeNote: (fee) => noteRef.current(fee) });
  const deal = ed.deal;
  const providerId = dealProviderId(deal.id);
  const { fundId } = world;
  // the deal alone in the bundle, priced on the pair's fund as it changes
  const bundle = useMemo(() => withDeals(world.bundle, [deal], data.kinds), [world.bundle, deal, data.kinds]);
  const got = useMemo(() => (fundId ? dealOnPlan({ bundle, index: world.index, plan: world.plan, fundId, providerId }) : null), [bundle, world.index, world.plan, fundId, providerId]);
  const run = useMemo(() => (fundId ? dealRunOf({ bundle: world.bundle, index: world.index, plan: world.plan, fundId }) : null), [world.bundle, world.index, world.plan, fundId]);
  const houseId = dealHouseId(deal);
  const tiles = fundId ? dealTiles(world.view, got, providerId, houseId, fundId) : null;
  const house = houseId ? world.view.houses.find((h) => h.provider.id === houseId)?.provider : undefined;
  const ctx = { kinds: data.kinds, today, currentAccounts: world.plan.currentAccounts ?? null };
  const onPlan = useMemo(() => (run ? new Map(feesOnPlan(deal, run, ctx).map((x) => [x.fee, x])) : null), [deal, run, data.kinds, today, world.plan.currentAccounts]); // eslint-disable-line react-hooks/exhaustive-deps
  noteRef.current = (fee) => {
    const at = onPlan?.get(fee.id);
    return at ? <FeeOnPlanLine at={at} cost={got?.kind === "ok" ? (got.byFee[fee.id] ?? 0) : null} bank={house?.short ?? null} /> : null;
  };
  // the picks the plan cannot set: what only the person knows, saved with the deal
  const picks = useMemo(() => (run ? pickLine(readDealFor(planDeal(deal, run), data.kinds, today)) : null), [deal, run, data.kinds, today]);
  const own = picks?.things.filter((t) => !PLAN_KEYS.includes(t.by)) ?? [];
  const where = run ? (run.instrumentClass === "mutual_fund_units" ? w.where.manager! : w.where[whatOfRun(run) === "tase" ? "tase" : (run.listing ?? "world")]!) : "";
  const fund = fundId ? allFunds(world.view).find((f) => f.rec.id === fundId) : undefined;
  const isSaved = saved.some((d) => d.id === deal.id);
  const p = world.plan;
  // a deal the plan cannot price opens on the fee that lacks something, as its row's "להשלים" says
  useEffect(() => {
    const at = got?.kind === "fail" && "missing" in got.reason ? got.reason.missing?.fee : undefined;
    if (!at) return;
    ed.doc.setChosen(at);
    ed.doc.setFocus({ fee: at, on: "card" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wide = useMedia(MQ.md);
  const [planShown, setPlanShown] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <DealHead deal={deal} headId={headId} isSaved={isSaved} writable={writable} onName={(name) => ed.doc.change({ ...deal, name: name.slice(0, NAME_MAX) })} onDelete={() => {
        dealStore.update((ds) => without(ds, deal.id));
        onDeleted(deal.name);
      }} />
      {tiles && !wide && (
        // a phone: one strip stays at the top, what is left and the place on its first line, the difference and the plan's tap under them
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
          {planShown && fund && <p className="text-muted-foreground">{w.plan(fmt.nisWhole(p.amountNow), fmt.nisWhole(p.monthly), p.years, fmt.pct(p.grossReturn * 100), fund.name, where)}</p>}
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
          {fund && <p className="text-sm text-muted-foreground">{w.plan(fmt.nisWhole(p.amountNow), fmt.nisWhole(p.monthly), p.years, fmt.pct(p.grossReturn * 100), fund.name, where)}</p>}
        </div>
      )}
      {run && (
        <ReadForBand
          lead={w.readFor}
          note={w.planKnows(where)}
          picks={own.map((t) => ({ name: t.words, items: t.options.map((o) => ({ id: o.is, label: whenText(o.words) })), value: t.chosen, onSelect: (is: string) => ed.onPick(t.by, is) }))}
        />
      )}
      {ed.picker}
      {ed.columns(null)}
      {ed.menus}
      {ed.footSheet}
    </div>
  );
}

/** The popup's head: the deal's name with its rename, where it is kept and the fee page's link, and its menu with the delete and its question. */
function DealHead({ deal, headId, isSaved, writable, onName, onDelete }: { deal: FeeDeal; headId: string; isSaved: boolean; writable: boolean; onName: (name: string) => void; onDelete: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [menu, setMenu] = useState(false);
  const [asking, setAsking] = useState(false);
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
      {asking && (
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
    </div>
  );
}

/** Under a fee's block: what the plan charges for it over the plan, or why it charges nothing, or what it lacks for a price. */
function FeeOnPlanLine({ at, cost, bank }: { at: FeeOnPlan; cost: number | null; bank: string | null }) {
  if (at.on === "missing") return <p className="mt-2 text-sm text-muted-foreground">{w.missing[at.missing.why]!(feeNameOf(at.missing.kind, at.missing.name))}</p>;
  if (at.on === "off")
    return (
      <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm text-muted-foreground">
        <Tag>{w.offPlan}</Tag>
        {at.why === "own-bank" && bank ? w.ownBank(bank) : w.off[at.why]}
      </p>
    );
  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
      <Tag tone="parameter">{w.onPlan}</Tag>
      {cost !== null && <span className="font-medium tabular-nums">{fmt.nisWhole(-Math.round(cost))}</span>}
    </p>
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

/** Under the account list: a new deal, started from a house's list or empty; and the line a deal just deleted leaves. */
export function AddDealButton() {
  const api = useDealAccounts();
  if (!api) return null;
  return (
    <>
      {api.deleted && <p className="text-sm text-muted-foreground">{w.deleted + api.deleted}</p>}
      <Button variant="quiet" className="self-start -ms-2" onClick={() => api.open({ house: null })}>
        + {w.add}
      </Button>
    </>
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
