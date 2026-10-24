// The track workbench (flows 25, design-spec 14): the controls and groups over one wrapper's tracks, the
// coverage line. The saved goal lives on the device, so marks, default groups and coverage counts fill after
// hydration; the pre-rendered page already holds every row and fee.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { r3workbench as copy, r4workbench } from "../../copy";
import { useGoals } from "../../lib/goal";
import { matches, outcomeOf, type SortKey, type WbData, type WorkbenchRow } from "../../lib/workbench";
import { useGoalHorizon } from "../compare/fit";
import { WorkbenchCoverage } from "./coverage";
import { ExposureChips, WorkbenchControls } from "./controls";
import { WorkbenchGroup } from "./group";

const words = { onlyFor: copy.sectorOnly, noGoal: copy.outcomeWords["no-goal"]!, noClass: copy.outcomeWords["no-class"]! };

export function Workbench({ data }: { data: WbData }) {
  const { status } = useGoals();
  const goal = useGoalHorizon();
  const ready = status !== "loading";
  const years = goal ? goal.years : null;
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("company");
  const [chosen, setChosen] = useState<Set<string> | null>(null);

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

  const byGroup = useMemo(() => {
    const m = new Map<string, WorkbenchRow[]>();
    for (const v of views) m.set(v.row.sp, [...(m.get(v.row.sp) ?? []), v]);
    return m;
  }, [views]);

  // Default: with a saved goal, the groups with a track that fits it; without one, the biggest group (the person chooses).
  const defaults = useMemo(() => {
    if (years !== null) return new Set(data.groups.filter((g) => byGroup.get(g.key)!.some((v) => v.fit === "fits")).map((g) => g.key));
    return new Set(data.groups.slice(0, 1).map((g) => g.key));
  }, [data, byGroup, years]);
  const open = chosen ?? defaults;
  const toggle = (key: string) => {
    const next = new Set(open);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChosen(next);
  };
  const label = (key: string) => key || copy.chips.noClass;
  const showFit = years !== null;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <ExposureChips
        groups={data.groups.map((g) => ({ ...g, label: label(g.key) }))}
        open={open}
        onToggle={toggle}
        onAll={() => setChosen(new Set(data.groups.map((g) => g.key)))}
      />
      <WorkbenchControls filter={filter} sort={sort} onFilter={setFilter} onSort={setSort} />
      <div className="flex flex-col gap-3">
        {data.groups.map((g) => {
          const all = byGroup.get(g.key)!;
          const rows = filter.trim() ? all.filter((v) => matches(v, filter)) : all;
          return (
            <WorkbenchGroup
              key={g.key || "none"}
              data={data}
              group={g}
              label={label(g.key)}
              open={open.has(g.key)}
              onToggle={() => toggle(g.key)}
              rows={rows}
              matching={filter.trim() ? rows.length : null}
              sort={sort}
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
 * that says why; a provident wrapper has no fund tab (no exposure to list funds for).
 */
export function WorkbenchTabs({ current, wrapperId, providerHref, trackHref, fundHref }: { current: WorkbenchTab; wrapperId: string; providerHref?: string; trackHref?: string | null; fundHref?: string | null }) {
  const t = r4workbench.tabs;
  const brokerage = wrapperId === "brokerage-account";
  const tabs: { key: WorkbenchTab; label: string; href: string | null; disabled?: boolean }[] = [
    { key: "provider", label: t.byProvider, href: providerHref ?? `/workbench/providers/${wrapperId}` },
    { key: "track", label: t.byTrack, href: brokerage ? null : (trackHref ?? `/workbench/tracks/${wrapperId}`), disabled: brokerage },
    ...(fundHref ? [{ key: "fund" as const, label: t.byFund, href: fundHref }] : []),
  ];
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
