// The track workbench (flows 25, design-spec 14): the controls and groups over one wrapper's tracks, the
// coverage line. The saved goal lives on the device, so marks, default groups and coverage counts fill after
// hydration; the pre-rendered page already holds every row and fee.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { r3workbench as copy, r4workbench } from "../../copy";
import { useGoals } from "../../lib/goal";
import { defaultWbQuery, eligibleOnly, matches, outcomeOf, parseWbQuery, pressSort, wbQueryString, type WbData, type WbQuery, type WorkbenchRow } from "../../lib/workbench";
import { useGoalHorizon } from "../compare/fit";
import { WorkbenchCoverage } from "./coverage";
import { ExposureChips, WorkbenchControls } from "./controls";
import { WorkbenchGroup } from "./group";

const words = { onlyFor: copy.sectorOnly, noGoal: copy.outcomeWords["no-goal"]!, noClass: copy.outcomeWords["no-class"]! };

export function Workbench({ data }: { data: WbData }) {
  const { status } = useGoals();
  const goal = useGoalHorizon();
  const navigate = useNavigate();
  const { search } = useLocation();
  const ready = status !== "loading";
  const years = goal ? goal.years : null;
  // The pre-rendered page has no address: the first client render matches it, then the address is read (A36).
  const [query, setQueryState] = useState<WbQuery>(defaultWbQuery);
  const [chosen, setChosen] = useState<Set<string> | null>(null);
  useEffect(() => setQueryState(parseWbQuery(search)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const setQuery = (patch: Partial<WbQuery>) => {
    const next = { ...query, ...patch };
    setQueryState(next);
    navigate({ search: wbQueryString(next) }, { replace: true, preventScrollReset: true });
  };
  const { q: filter, sort, dir, chip, openToAll } = query;
  const searching = filter.trim() !== "";

  const views = useMemo<WorkbenchRow[]>(
    () =>
      data.rows.map((row) => {
        const company = data.companies[row.c]!;
        return {
          row,
          company: { name: company.name, href: `/companies/${company.id}` },
          track: { fundId: row.f, name: row.n, href: `/companies/${company.id}/${row.f}` },
          feesHref: `/fees?track=${row.f}`,
          ...outcomeOf(row, years, data.fit, data.classification, words),
        } as WorkbenchRow;
      }),
    [data, years],
  );

  // the rows the person can open (the toggle), per group; the search narrows them further
  const byGroup = useMemo(() => {
    const m = new Map<string, WorkbenchRow[]>();
    for (const v of eligibleOnly(views, openToAll)) m.set(v.row.sp, [...(m.get(v.row.sp) ?? []), v]);
    return m;
  }, [views, openToAll]);
  const hiddenCount = useMemo(() => (openToAll ? views.length - eligibleOnly(views, true).length : 0), [views, openToAll]);
  const visibleGroups = data.groups.filter((g) => (byGroup.get(g.key)?.length ?? 0) > 0);

  // Default: with a saved goal, the groups with a track that fits it; without one, the biggest group (the person chooses).
  const defaults = useMemo(() => {
    if (years !== null) {
      const fitting = visibleGroups.filter((g) => byGroup.get(g.key)!.some((v) => v.fit === "fits")).map((g) => g.key);
      if (fitting.length) return new Set(fitting);
    }
    return new Set(visibleGroups.slice(0, 1).map((g) => g.key));
  }, [visibleGroups, byGroup, years]);
  const matching = (key: string) => (byGroup.get(key) ?? []).filter((v) => matches(v, filter));
  const fromChip = chip === "all" ? new Set(visibleGroups.map((g) => g.key)) : chip !== null ? new Set([chip]) : defaults;
  // a search opens the groups it finds something in and closes the rest
  const open = chosen ?? (searching ? new Set(visibleGroups.filter((g) => matching(g.key).length > 0).map((g) => g.key)) : fromChip);
  const toggle = (key: string) => {
    const next = new Set(open);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChosen(next);
  };
  const press = (key: string) => {
    setChosen(null);
    setQuery({ chip: chip === key ? null : key });
  };
  const label = (key: string) => key || copy.chips.noClass;
  const showFit = years !== null;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <ExposureChips groups={visibleGroups.map((g) => ({ ...g, count: byGroup.get(g.key)!.length, label: label(g.key) }))} open={open} onPress={press} onAll={() => { setChosen(null); setQuery({ chip: "all" }); }} />
      <WorkbenchControls
        filter={filter}
        sort={sort}
        dir={dir}
        openToAll={openToAll}
        hiddenCount={hiddenCount}
        onFilter={(v) => { setChosen(null); setQuery({ q: v }); }}
        onSort={(k) => setQuery(pressSort(query, k))}
        onOpenToAll={(v) => { setChosen(null); setQuery({ openToAll: v }); }}
      />
      <div className="flex flex-col gap-3">
        {visibleGroups.map((g) => {
          const all = byGroup.get(g.key)!;
          const rows = searching ? all.filter((v) => matches(v, filter)) : all;
          return (
            <WorkbenchGroup
              key={g.key || "none"}
              data={data}
              group={{ key: g.key, count: all.length }}
              label={label(g.key)}
              open={open.has(g.key)}
              onToggle={() => toggle(g.key)}
              rows={rows}
              matching={searching ? rows.length : null}
              sort={sort}
              dir={dir}
              showFit={showFit}
            />
          );
        })}
      </div>
      <WorkbenchCoverage data={data} views={views} ready={ready} />
    </div>
  );
}

// ---------------------------------------------------------------- the tabs (flows 15.1, 15.2, 15.5)

export type WorkbenchTab = "provider" | "track" | "fund";

/**
 * "לפי ספק" · "לפי מסלול" · "לפי קרן", on the three workbench pages. The tab you are on is a label; the others are links
 * to the same subject. A brokerage account has no tracks in the regulator's data, so its track tab is disabled with the line
 * that says why; a provident wrapper has no fund tab (no exposure to list funds for). A wrapper with a track page and no providers
 * page (`hasProviders` false, from `providerWrapperIds()`) has no provider tab, and a strip left with the tab you are on is not drawn
 * (2026-10-25: the tab led to `/workbench/providers/child-savings-provident`, which does not exist).
 */
export function WorkbenchTabs({ current, wrapperId, providerHref, trackHref, fundHref, hasProviders = true }: { current: WorkbenchTab; wrapperId: string; providerHref?: string; trackHref?: string | null; fundHref?: string | null; hasProviders?: boolean }) {
  const t = r4workbench.tabs;
  const brokerage = wrapperId === "brokerage-account";
  const tabs: { key: WorkbenchTab; label: string; href: string | null; disabled?: boolean }[] = [
    ...(hasProviders || current === "provider" ? [{ key: "provider" as const, label: t.byProvider, href: providerHref ?? `/workbench/providers/${wrapperId}` }] : []),
    { key: "track", label: t.byTrack, href: brokerage ? null : (trackHref ?? `/workbench/tracks/${wrapperId}`), disabled: brokerage },
    ...(fundHref ? [{ key: "fund" as const, label: t.byFund, href: fundHref }] : []),
  ];
  if (tabs.length < 2) return null;
  const base = "min-h-target lg:min-h-10 px-4 inline-flex items-center rounded-[5px] text-sm";
  return (
    <div className="flex flex-col gap-1.5">
      <div role="tablist" aria-label={t.aria} className="inline-flex self-start rounded-md bg-muted p-[3px] gap-[3px]">
        {tabs.map((x) =>
          x.key === current ? (
            <span key={x.key} role="tab" aria-selected="true" tabIndex={0} className={`${base} bg-secondary font-medium shadow-sm`}>
              {x.label}
            </span>
          ) : x.href && !x.disabled ? (
            <Link key={x.key} role="tab" aria-selected="false" to={x.href} className={`${base} hover:bg-accent/60`}>
              {x.label}
            </Link>
          ) : (
            <span key={x.key} role="tab" aria-selected="false" aria-disabled="true" className={`${base} text-muted-foreground cursor-not-allowed`}>
              {x.label}
            </span>
          ),
        )}
      </div>
      {brokerage && current !== "track" && <p className="text-xs text-muted-foreground">{t.noTracks}</p>}
    </div>
  );
}
