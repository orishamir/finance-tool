// "השקעה במדד" (D28, spec 8dd1f013:research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses (or adds), the options
// for owning it, the cheapest broker for each, and the cheapest complete way for the plan. `/indices` chooses nothing (D27);
// `/indices/<x>` opens the known index `index-<x>` (pre-rendered); a custom index lives on the device and opens at `/indices?custom=<id>`.
import { gershayim } from "../lib/format";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/invest";
import { brands, invest as c } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { OtherAssumptions, PlanKnobs } from "../components/invest/knobs";
import { TitleRow } from "../components/invest/title";
import { PlanCard } from "../components/invest/plan-card";
import { PairReceipt, PairStub } from "../components/invest/receipt";
import { ChosenPair } from "../components/invest/chosen";
import { pickOfHeadline, pickOfOpen, allFunds, type Moved, type Pick } from "../components/invest/pair";
import { PairLists, listName } from "../components/invest/lists";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "../components/invest/no-fund";
import { LabelSheetHost } from "../components/kit";
import { returnHelpOf } from "../components/invest/foot";
import { BeforeDeciding } from "../components/invest/before";
import { CustomEntriesHost } from "../components/invest/custom-entries";
import { Callout, useSwapGlide } from "../components/kit";
import { Sheet } from "../components/Sheet";
import { PageShell } from "../components/shell";
import { RulesLine } from "../components/provenance";
import { loadBundle, bundleLinks } from "../lib/bundle";
import { type CompareBundle } from "../lib/compare";
import { feeInputs } from "../lib/fees";
import { useSettled } from "../lib/settled";
import { useInputs } from "../lib/inputs";
import { withCustomEntries } from "../lib/custom-entries";
import { buildInvest, chargesCurrentAccount, hasKinds, indexById, knownIndices, refOfCustom, type CustomIndex, type IndexRef } from "../lib/invest";
import { exposureIdOfSlug, INDICES_PATH } from "../lib/site-paths";
import { loadIndicesBundle, type IndicesBundle, type WorkbenchInputs } from "../lib/providers";
import { useInvestState } from "../lib/state";
import { recordsById } from "../lib/scope";
import { groupNameOf, pickableGroups, withGroupPick } from "../lib/group-pick";
import { useHydrated, useMedia } from "../lib/hooks";

/** The data files this page fetches after it starts, requested with the HTML. */
export const links = () => bundleLinks("indices-bundle.json", "compare-bundle.json");

/** Every index is one route (`indices/:slug?`) whose data is the same for each: moving between indices, or to a custom one,
 * keeps the loaded data and fetches nothing, so a click on a phone does not wait for the network. The index comes from the address. */
export function shouldRevalidate() {
  // asked only when this route stays on screen; its data is fixed at build
  return false;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { loadExposures } = await import("../lib/instruments.server");
  const { goalFormData } = await import("../lib/compare.server");
  const indices = loadExposures()
    .filter((e) => e.kind === "equity_index")
    .map((e) => ({ id: e.id, name: gershayim(e.names.he[0] ?? e.id), israeli: e.constituents_israeli === true }));
  const id = params.slug ? exposureIdOfSlug(params.slug) : null;
  if (id && !indices.some((i) => i.id === id)) throw new Response("Not found", { status: 404 });
  // the glossary cards behind the fund list's fees "?", with the rules they cite
  const { loadRules, loadTerms } = await import("../lib/data.server");
  const names = new Set<string>(brands.funds.feeTerms);
  const feeTerms = Object.fromEntries(loadTerms().filter((t) => names.has(t.he)).map((t) => [t.he, t]));
  const all = loadRules();
  const feeRules = [...new Set(Object.values(feeTerms).flatMap((t) => t.ruleIds))].flatMap((id) => (all[id] ? [all[id]] : []));
  return { ...goalFormData(), indices, feeTerms, feeRules };
}

/** The known index the address names (`/indices/<x>` is `index-<x>`), or null. */
const exposureIdOf = (slug: string | undefined, indices: readonly { id: string }[]): string | null => {
  const id = slug ? exposureIdOfSlug(slug) : null;
  return id && indices.some((i) => i.id === id) ? id : null;
};

export function meta({ loaderData: data, params, location }: Route.MetaArgs) {
  const id = data ? exposureIdOf(params.slug, data.indices) : null;
  const name = id ? data?.indices.find((i) => i.id === id)?.name : null;
  return pageMeta({ title: `${c.metaTitle}${name ? ` · ${name}` : ""}`, description: c.sub, location });
}

type Data = Awaited<ReturnType<typeof loader>>;

export default function Invest() {
  const data = useLoaderData<typeof loader>();
  const [wb, setWb] = useState<IndicesBundle | null>(null);
  const [compare, setCompare] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([loadBundle(), loadIndicesBundle()])
      .then(([b, w]) => {
        setCompare(b);
        setWb(w);
      })
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...data.feeRules, ...(compare?.rules ?? []), ...(wb?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, pointed: recordsById(compare?.pointed, wb?.pointed), terms: data.feeTerms, dimensions: Object.fromEntries((compare?.checklist ?? []).map((x) => [x.id, x.name])), today: data.today };
  }, [compare, wb, data.today, data.feeRules, data.feeTerms]);
  return (
    <PageShell current="other" data={provenance}>
      <Page wb={wb} compare={compare} failed={failed} data={data} />
    </PageShell>
  );
}

/** The known indices by name, as the loader gives them: the title's picker works before the data arrives. */
const knownOf = (data: Data): IndexRef[] => data.indices.map((i) => ({ id: i.id, name: i.name, israeli: i.israeli, exposure: null, custom: null, oneLine: null }));

/** The page's frame: the title row (a `PageHead`, which carries the page's top padding), then what is below it, a little tighter than a
 *  page's sections (the sliders and what they move stay in one view). */
const Frame = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex flex-col gap-5 lg:gap-6">
    {title}
    {children}
  </div>
);

function Page({ wb, compare, failed, data }: { wb: IndicesBundle | null; compare: CompareBundle | null; failed: boolean; data: Data }) {
  const { ready } = useInputs();
  const { search } = useLocation();
  const navigate = useNavigate();
  const slug = useParams().slug;
  // The pre-rendered page has no address to read and no saved state: the first client render matches it, then they are read.
  const mounted = useHydrated();
  // while the data loads, the title already names the index the address names, and its picker leads to the others
  const known = knownOf(data);
  const id = exposureIdOf(slug, data.indices);
  const frame = (body: React.ReactNode) => (
    <Frame title={<TitleRow known={known} customs={[]} index={known.find((i) => i.id === id) ?? null} others={[]} bundle={null} onRemove={() => undefined} onRename={() => undefined} onSave={() => undefined} onGo={(p) => navigate(p)} />}>{body}</Frame>
  );
  if (!mounted || (!failed && (!wb || !compare || !ready))) return frame(<p className="text-muted-foreground">{c.loading}</p>);
  if (failed || !wb || !compare) return frame(<Callout tone="caution">{c.failed}</Callout>);
  return <Body wb={wb} compare={compare} data={data} search={search} />;
}

/** The bank the person marked as theirs (D64), while a bank whose current account costs something has that id; else none. */
const ownBankOf = (wb: IndicesBundle, id: string | null): string | null => (id && wb.snapshots.some((s) => s.id === id && chargesCurrentAccount(s)) ? id : null);

function Body({ wb, compare, data, search }: { wb: IndicesBundle; compare: CompareBundle; data: Data; search: string }) {
  const navigate = useNavigate();
  const exposureId = exposureIdOf(useParams().slug, data.indices);
  const released = useInputs();
  const invest = useInvestState();
  // The numbers the person entered on this device, each one not entered taking the site's example (P-05); never the saved goal
  // (only the goal page speaks of a goal).
  const fi = useMemo(() => feeInputs(compare, null, released.state), [compare, released.state]);
  const ownBank = ownBankOf(wb, invest.bank);
  const currentAccounts = useMemo(() => ({ own: ownBank }), [ownBank]);
  const livePlan: WorkbenchInputs = useMemo(
    () => ({
      // the whole amount today: what stays available is the comparison's question, not this page's
      amountNow: fi.g.amountNow,
      monthly: fi.g.monthly,
      years: fi.g.horizonYears,
      grossReturn: (fi.g.returnPct ?? 0) / 100,
      inflation: (fi.values.inflation.value as number) / 100,
      age: fi.g.age,
      income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
      values: fi.values,
      fromGoal: fi.fromGoal,
      returnFromParameter: fi.returnFromParameter,
      // a bank's row counts its current account, except at the bank the person marked as theirs (D64)
      currentAccounts,
    }),
    [fi, currentAccounts],
  );
  // The result and the knobs' step figures price one or two pairs (a few ms) and follow a slider live; the two lists price every
  // account and fund (about 200 ms) and wait until the slider rests. A bank
  // marked as the person's own is one pick, not a slide: the lists take it at once, with the plan as it last settled, so their rows
  // re-sort right after the pick rather than a moment later, when the hand may be on the list (0.6 to 1 s).
  const settledPlan = useSettled(livePlan, 250);
  const merged = useRef<WorkbenchInputs | null>(null);
  const plan = useMemo(() => {
    const next = settledPlan.currentAccounts === currentAccounts ? settledPlan : { ...settledPlan, currentAccounts };
    // the plan that settles after the pick is the one the lists already took: kept, so they are not priced twice
    const prev = merged.current;
    const same = prev && (Object.keys(next) as (keyof WorkbenchInputs)[]).every((k) => prev[k] === next[k]) && Object.keys(prev).length === Object.keys(next).length;
    merged.current = same ? prev : next;
    return merged.current!;
  }, [settledPlan, currentAccounts]);
  const ownBankControl = useMemo(() => ({ value: ownBankOf(wb, invest.bank), onChange: invest.setBank }), [wb, invest.bank, invest.setBank]);

  const customs: CustomIndex[] = invest.customIndices;
  // the broker and fund the person typed join the data here and nowhere else: this page alone compares them (D44)
  const bundle = useMemo(() => withCustomEntries(wb, invest.customBrokers, invest.customFunds, customs), [wb, invest.customBrokers, invest.customFunds, customs]);
  const customId = new URLSearchParams(search).get("custom");
  const index: IndexRef | null = useMemo(() => (exposureId ? indexById(wb, exposureId) : customId ? (customs.find((x) => x.id === customId) ? refOfCustom(customs.find((x) => x.id === customId)!) : null) : null), [wb, exposureId, customId, customs]);
  const known = knownOf(data);

  // the person compares their own account by picking it in the account list (the separate "החשבון שלכם" field was redundant)
  const yourBroker: string | null = null;
  const view = useMemo(() => (index ? buildInvest({ bundle, index, plan, yourBroker }) : null), [bundle, index, plan, yourBroker]);

  const [panelOpen, setPanelOpen] = useState(false);
  // a house's page opens the account panel through the address (`own` and `from`): once, and the address is cleaned
  const ownParam = new URLSearchParams(search).get("own");
  const fromParam = new URLSearchParams(search).get("from");
  const opening = useMemo(() => (ownParam ? { houseId: ownParam, from: fromParam ?? "list" } : null), [ownParam, fromParam]);
  const { pathname } = useLocation();
  const onOpened = useCallback(() => {
    const q = new URLSearchParams(search);
    q.delete("own");
    q.delete("from");
    const rest = q.toString();
    navigate(`${pathname}${rest ? `?${rest}` : ""}`, { replace: true });
  }, [search, pathname, navigate]);
  const headId = useId();
  // From 1280 px the plan and the pair's card stand in a rail, and beside it the receipt's ticket stands over the two lists and their
  // ruler; below 1280 px everything stands in one column, the receipt above the lists with its stub at the screen's foot. The body renders
  // only in the browser, so its first render already knows the width.
  const railed = useMedia("(min-width: 80rem)");
  const receiptRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLElement>(null);
  const pairArea = useRef<HTMLDivElement>(null);

  // the account and the fund the two lists are priced on: the person's picks on this index, else the cheapest way
  const world = useMemo(() => (index && view ? { wb, bundle, index, plan, view, customs } : null), [wb, bundle, index, plan, view, customs]);
  // a fund priced nowhere (a distributing fund whose yield is not known, or a US fund, TXF-37) keeps its row with the reason, and is not a pair to show; nor is
  // a pair the account no longer prices (a broker the person typed and changed, D44)
  const validPick = (p: Pick) => !!view && allFunds(view).some((f) => f.rec.id === p.fund && Object.values(f.byHouse).some((x) => "valueN" in x) && "valueN" in (f.byHouse[p.house] ?? {})) && view.providers.some((x) => x.id === p.house);
  // the pick lives in the address (`?house=` and `?fund=`), so a link opens the same pair: a house's page sends `house`
  // alone, which opens on its cheapest way on the index; a fund alone opens at the house where it leaves the most
  const houseParam = new URLSearchParams(search).get("house");
  const fundParam = new URLSearchParams(search).get("fund");
  // a house's group picked in its fold: kept only where the page offers that group for the fund
  const groupNumber = new URLSearchParams(search).get("group");
  const groupParam = groupNumber && /^\d+$/.test(groupNumber) ? `group:${groupNumber}` : null;
  const fromAddress = ((): Pick | null => {
    if (!view || (!houseParam && !fundParam)) return null;
    if (houseParam && fundParam) return validPick({ house: houseParam, fund: fundParam }) ? { house: houseParam, fund: fundParam } : null;
    if (houseParam) {
      // a group sent from the house's page opens on the house's cheapest fund for which that group is offered (the side it trades on)
      const row = view.houses.find((h) => h.provider.id === houseParam);
      const snap = groupParam ? wb.snapshots.find((x) => x.id === houseParam) : undefined;
      const forGroup = snap && row?.entries.find((e) => e.price && pickableGroups(snap, e.fund.option).has(groupParam!) && validPick({ house: houseParam, fund: e.fund.rec.id }));
      if (forGroup) return { house: houseParam, fund: forGroup.fund.rec.id };
      const best = row?.best;
      return best && validPick({ house: houseParam, fund: best.fund.rec.id }) ? { house: houseParam, fund: best.fund.rec.id } : null;
    }
    const best = allFunds(view).find((f) => f.rec.id === fundParam)?.best;
    return best && validPick({ house: best.providerId, fund: fundParam! }) ? { house: best.providerId, fund: fundParam! } : null;
  })();
  const groupOk = (p: Pick) => !!groupParam && !!view && pickableGroups(wb.snapshots.find((x) => x.id === p.house), allFunds(view).find((f) => f.rec.id === p.fund)?.option).has(groupParam);
  const own: Pick | null = fromAddress && groupOk(fromAddress) ? { ...fromAddress, group: groupParam! } : fromAddress;
  const pick: Pick | null = own ?? (view ? (pickOfHeadline(view) ?? pickOfOpen(view)) : null);
  // the stairs start from the person's own pick; with none they open on the middle account and the middle exchange-traded fund
  const picks = own !== null;
  // a pick replaces the address in place: the back button leaves the page rather than stepping through every pick, and the page keeps its scroll
  // the picked group's account, priced at its prices beside its house (lib/group-pick): only that house and the account are priced again
  // the radio answers at once and the group's figures follow after the paint (pricing the group in the tap's own render took
  // it past 100 ms; a navigation is a transition, so a deferred value did not defer it)
  const groupHouse = own?.group ? own.house : null;
  const groupKey = own?.group ?? null;
  const [priced, setPriced] = useState<(ReturnType<typeof withGroupPick> & { house: string; key: string }) | null>(null);
  useEffect(() => {
    if (!view || !index || !groupHouse || !groupKey) return setPriced(null);
    const g = withGroupPick({ bundle, index, plan }, view, groupHouse, groupKey, view.providers.find((p) => p.id === groupHouse)?.short ?? groupHouse);
    setPriced(g ? { ...g, house: groupHouse, key: groupKey } : null);
  }, [view, index, bundle, plan, groupHouse, groupKey]);
  // the group's account stands in for its house only while it is the group picked; any other pick shows its own figures at once
  const picked = priced && priced.house === groupHouse && priced.key === groupKey ? priced : null;
  // what the pair and the sections under it show: the group's account in place of its house when one is picked
  const shownView = picked?.view ?? view;
  const shownBundle = picked?.bundle ?? bundle;
  const shown: Pick | null = pick && picked ? { house: picked.id, fund: pick.fund } : pick;
  // a tap that changed the other half too: the row tapped says so, with the way back, until the next pick
  const [moved, setMoved] = useState<Moved | null>(null);
  const onPick = (p: Pick, m?: Moved) => {
    // the way back puts back the address as it was before the tap: no pick (the page's own pair, never made the person's), or the pick
    // with its group (it wrote the pair back as a pick, and a group's held account in place of its house)
    const before = search;
    setMoved(
      m
        ? {
            ...m,
            back: () => {
              setMoved(null);
              navigate(`${pathname}${before}`, { replace: true, preventScrollReset: true });
            },
          }
        : null,
    );
    // a pick on the group's account (another fund, from the fund list) stays on that group of that house
    const next: Pick = picked && own?.group && p.house === picked.id ? { house: own.house, fund: p.fund, group: own.group } : p;
    const q = new URLSearchParams(search);
    q.set("house", next.house);
    q.set("fund", next.fund);
    if (next.group) q.set("group", next.group.replace("group:", ""));
    else q.delete("group");
    navigate(`${pathname}?${q.toString()}`, { replace: true, preventScrollReset: true });
  };
  // the house's group picked in the account card, by its name
  const ownGroup = own?.group ? { house: own.house, key: own.group, name: groupNameOf(wb.snapshots.find((x) => x.id === own.house), own.group) } : null;
  const movedNow = moved && shown && moved.at.house === (own?.house ?? shown.house) && moved.at.fund === shown.fund ? moved : null;
  // an index with no fund to price (a custom one): the account the person picked in the list, else the one that charges least
  const [genericHouse, setGenericHouse] = useState<string | null>(null);

  // on a foreign index, the rules behind the "?" beside a foreign fund's fees ("אין" by a line of the Israeli law for funds), cited here
  // since that "?" opens a text of its own
  const rules = ["ETF-31", "ETF-24", "ETF-51", "ETF-75", "TXS-09", "TXF-22", ...(index && !index.israeli ? ["ETF-71", "ETF-14", "MF-20"] : [])].filter((id) => wb.rules.some((r) => r.id === id));

  // another index replaces what lies below the title, and on a phone it may move it (D62): it dims on the tap and fades in where it lands
  const swap = useSwapGlide<HTMLDivElement>(index?.id ?? customId ?? "");
  const go = (p: string) => swap.begin(() => navigate(p));
  const title = (
    <TitleRow
      known={known}
      customs={customs}
      index={index}
      others={knownIndices(wb)}
      bundle={wb}
      onRemove={(id) => {
        invest.remove(id);
        if (index?.id === id) go(INDICES_PATH);
      }}
      onRename={invest.rename}
      onSave={(x) => invest.add(x)}
      onGo={go}
    />
  );

  // the knobs write the same current goal the fees page and the assumptions write: a value set here is the value there
  const planCard = (
    <PlanCard
      knobs={<PlanKnobs fi={fi} ranges={data.form.knobs} pct={data.form.pct} stacked />}
      onOpen={() => setPanelOpen(true)}
      fx={wb.fx}
      today={data.today}
      example={Object.keys(released.state.entered).length === 0}
      dollar={!index?.israeli}
      inflation={fi.values.inflation}
      returnHelp={view ? returnHelpOf(view) : undefined}
    />
  );
  // the receipt: below 1280 px paper above the lists, the stub's way back leading to it (focusable for that, never tabbed to); from 1280 px
  // a ticket over the lists, whose total the ruler's point joins
  const receipt = pick && shown && shownView && (
    railed ? (
      <PairReceipt view={shownView} bundle={shownBundle} plan={livePlan} pick={shown} chosen={picks} layout="ticket" ref={ticketRef} />
    ) : (
      <div ref={receiptRef} tabIndex={-1} className="anchor-target outline-none">
        <PairReceipt view={shownView} bundle={shownBundle} plan={livePlan} pick={shown} chosen={picks} />
      </div>
    )
  );
  const fund = shown && shownView ? allFunds(shownView).find((f) => f.rec.id === shown.fund) : undefined;
  // the two lists side by side where the main column has the room (a container query: the rail beside it takes its share from 1280 px)
  const lists = "grid gap-5 items-start @min-[57rem]:grid-cols-[minmax(0,5fr)_2.5rem_minmax(0,7fr)]";
  const join = (
    <span aria-hidden="true" className="hidden @min-[57rem]:grid place-items-center size-9 mt-10 rounded-full border border-input bg-popover text-xl text-muted-foreground justify-self-center">
      +
    </span>
  );

  return (
    <LabelSheetHost>
      <CustomEntriesHost index={index} brokers={invest.customBrokers} funds={invest.customFunds} writable={invest.status !== "unavailable"} onSaveBroker={invest.saveBroker} onRemoveBroker={invest.removeBroker} onSaveFund={invest.saveFund} onRemoveFund={invest.removeFund} world={world} opening={opening} onOpened={onOpened}>
      <Frame title={title}>
        <div ref={swap.ref} className="flex flex-col gap-5 lg:gap-6">
          {customId && !exposureId && !index && <Callout tone="caution">{c.custom.missing}</Callout>}
          {!index || !view ? (
            <p className="text-muted-foreground">{c.chips.none}</p>
          ) : (
            <>
              {/* the plan and the pair's card in a rail at the start side from 1280 px, the receipt's ticket and the choice of account and
                  fund beside it; one column under it, the receipt above the lists */}
              <div ref={pairArea} className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6">
                <div className="flex flex-col gap-5 xl:w-80 xl:shrink-0">
                  {planCard}
                  {pick && shown && shownView && (
                    <>
                      {!railed && receipt}
                      <ChosenPair view={shownView} bundle={shownBundle} plan={livePlan} pick={shown} chosen={picks} onPick={onPick} group={ownGroup} />
                    </>
                  )}
                </div>
                <div className="@container flex min-w-0 flex-1 flex-col gap-5 lg:gap-6">
                  {pick && shown && shownView ? (
                    <>
                      {railed && receipt}
                      <PairLists view={shownView} bundle={shownBundle} plan={plan} livePlan={livePlan} today={data.today} pick={shown} chosen={picks} onPick={onPick} moved={movedNow} ownBank={ownBankControl} group={ownGroup} ruler={railed} above={ticketRef} />
                    </>
                  ) : (
                    // the same two lists as every index, the receipt set aside until a fund is added
                    <>
                      <NoFundCall view={view} />
                      <div className={lists}>
                        <NoFundAccountColumn view={view} bundle={bundle} years={plan.years} monthly={plan.monthly} chosen={genericHouse} onPick={setGenericHouse} ownBank={ownBankControl} />
                        {join}
                        <NoFundColumn view={view} mayaHref={wb.links.maya?.href ?? null} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* before deciding: where the fees go, what moves the result most, hedged or not (only on a foreign index with funds of both
                  kinds, F-94) and the stairs, a tab each */}
              {pick && shown && shownView && (
                <BeforeDeciding
                  view={shownView}
                  bundle={shownBundle}
                  plan={plan}
                  livePlan={livePlan}
                  share={data.form.share}
                  pick={shown}
                  chosen={picks}
                  hedge={hasKinds(view) && !!wb.dollarRange}
                  stairs={{ view, bundle, startHouse: picks ? pick.house : null, startFund: picks ? pick.fund : null }}
                  onPick={onPick}
                />
              )}
              <RulesLine ids={rules} />
            </>
          )}
        </div>
      </Frame>
      {/* outside the block that glides on an index's change: a moving ancestor would carry a pinned element with it */}
      {!railed && pick && shown && shownView && fund && (
        <PairStub view={shownView} bundle={shownBundle} plan={livePlan} pick={shown} fundName={listName(shownView, fund.name)} target={receiptRef} area={pairArea} />
      )}
      <Sheet open={panelOpen} onClose={() => setPanelOpen(false)} pc="center" height={78} labelledBy={`${headId}-as`}>
        <h2 id={`${headId}-as`} className="text-lg font-semibold mb-3">
          {c.plan.panelTitle}
        </h2>
        {/* what the results are and what they rest on, said here once (the plan card's line keeps to the return, the inflation and the dollar) */}
        <p className="text-sm text-muted-foreground mb-3">{c.plan.knobs.assumptions}</p>
        {panelOpen && <OtherAssumptions inflation={fi.values.inflation} inflationStart={fi.starts?.inflation} pct={data.form.pct} />}
      </Sheet>
      </CustomEntriesHost>
    </LabelSheetHost>
  );
}
