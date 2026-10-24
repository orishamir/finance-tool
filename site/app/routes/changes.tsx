// Screen 19: what changed since (design-spec 24, flow 36): the change log for readers. One data file per year is
// fetched when the picked date reaches into it; `changesSince` of the engine splits the lines by `affects_rankings`
// and groups them by collection; a snapshot folds into one row. The person's previous visit and saved comparison live
// on the device, so the default window is chosen after hydration.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { changesSince } from "@finance-tool/engine";
import { r5, site } from "../copy";
import { AffectsGroup, CollectionChips, CollectionDisclosure, SincePicker, fold, type Line, type Resolvers, type RowItem } from "../components/changes/parts";
import { Tpl } from "../components/exposure-mode/tpl";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout } from "../components/ui";
import { fmt } from "../lib/format";
import { isReadableSaved, useSavedComparisons, useStateStore } from "../lib/state";
import { todayLocal } from "../lib/today";

export async function loader() {
  const { changesMeta } = await import("../lib/changes.server");
  const { today } = await import("../lib/data.server");
  return { ...changesMeta(), today: today() };
}

export function meta() {
  return [{ title: `${r5.changes.title} · ${site.name}` }];
}

interface YearFile {
  year: number;
  groups: { date: string; collection: string; id: string; reason: string; affects: boolean; lines: [string, unknown, unknown][] }[];
}

const files = new Map<number, Promise<YearFile>>();
function loadYear(y: number): Promise<YearFile> {
  let p = files.get(y);
  if (!p) files.set(y, (p = fetch(`${import.meta.env.BASE_URL}changes-data/${y}`).then((r) => r.json() as Promise<YearFile>)));
  return p;
}

const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);

export default function Changes() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="changes" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <Page />
    </PageShell>
  );
}

function Page() {
  const meta = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  void navigate;
  const device = useSavedComparisons();
  const store = useStateStore();
  // the pre-rendered page has no address and no device: the first client render matches it, then both are read (a full load with ?since= must not differ)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const today = device.ready ? todayLocal() : meta.today;

  // the default window: the previous visit, else the current goal's saved comparison, else thirty days (flow 36 step 1)
  const savedDate = useMemo(() => {
    const mine = device.list.filter((c) => isReadableSaved(c) && c.goalId === store.state.currentId).map((c) => c.savedOn).sort();
    return mine[mine.length - 1] ?? null;
  }, [device.list, store.state.currentId]);
  const explicit = mounted ? params.get("since") : null;
  const valid = explicit && /^\d{4}-\d{2}-\d{2}$/.test(explicit) && explicit <= today ? explicit : null;
  const defaultFrom = device.visits.previous ? "previous" : savedDate ? "saved" : "thirty";
  const defaultSince = device.visits.previous ?? savedDate ?? addDays(today, -30);
  const since = valid ?? defaultSince;
  const untilParam = mounted ? params.get("until") : null;
  const until = untilParam && /^\d{4}-\d{2}-\d{2}$/.test(untilParam) ? untilParam : null;
  const selected = (mounted ? (params.get("collections") ?? "") : "").split(",").filter(Boolean);
  const [text, setText] = useState("");

  // the years the window reaches into
  const years = meta.years.filter((y) => y >= Number(since.slice(0, 4)));
  const [loaded, setLoaded] = useState<Record<number, YearFile>>({});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    for (const y of years) {
      if (loaded[y]) continue;
      loadYear(y)
        .then((f) => !cancelled && setLoaded((l) => ({ ...l, [y]: f })))
        .catch(() => !cancelled && setFailed(true));
    }
    return () => {
      cancelled = true;
    };
  }, [years.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const ready = device.ready && years.every((y) => loaded[y]);

  const lines = useMemo<Line[]>(() => {
    const out: Line[] = [];
    for (const y of years) for (const g of loaded[y]?.groups ?? []) for (const [field, o, n] of g.lines) out.push({ date: g.date, collection: g.collection, id: g.id, field, old: o, new: n, reason: g.reason, affects_rankings: g.affects });
    return out;
  }, [loaded, years.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const result = useMemo(() => (ready ? changesSince(lines, since, { ...(until ? { until } : {}) }) : null), [ready, lines, since, until]);
  const names = r5.changes.collectionNames;
  const chips = useMemo(() => {
    if (!result) return [];
    const count = new Map<string, number>();
    for (const g of [...result.affectsRankings, ...result.other]) count.set(g.collection, (count.get(g.collection) ?? 0) + g.lines.length);
    return [...count.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, n]) => ({ key, name: names[key] ?? key, count: n }));
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = text.trim().toLowerCase();
  const shaped = useMemo(() => {
    if (!result) return null;
    const pick = (groups: typeof result.affectsRankings) =>
      groups
        .filter((g) => selected.length === 0 || selected.includes(g.collection))
        .map((g) => {
          const ls = (q ? g.lines.filter((l) => l.id.toLowerCase().includes(q) || l.field.toLowerCase().includes(q)) : g.lines) as Line[];
          const rows: RowItem[] = fold(ls);
          return { key: g.collection, name: names[g.collection] ?? g.collection, count: ls.length, rows };
        })
        .filter((g) => g.count > 0);
    return { affects: pick(result.affectsRankings), other: pick(result.other) };
  }, [result, q, selected.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const resolvers: Resolvers = { parameters: meta.parameters, deposits: meta.deposits, exposures: meta.exposures, wrappers: meta.wrappers };

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) (v === null || v === "" ? next.delete(k) : next.set(k, v));
    setParams(next, { replace: true });
  };
  const defaultLine = valid ? r5.changes.explicit.replace("{date}", fmt.date(valid)) : defaultFrom === "previous" ? r5.changes.defaults.previous.replace("{date}", fmt.date(defaultSince)) : defaultFrom === "saved" ? r5.changes.defaults.saved.replace("{date}", fmt.date(defaultSince)) : r5.changes.defaults.thirty;
  const quick = [
    ...(device.visits.previous ? [{ key: "previous", label: r5.changes.chips.previous, date: device.visits.previous }] : []),
    { key: "week", label: r5.changes.chips.week, date: addDays(today, -7) },
    { key: "month", label: r5.changes.chips.month, date: addDays(today, -30) },
    ...(savedDate ? [{ key: "saved", label: r5.changes.chips.saved, date: savedDate }] : []),
  ];
  const stale = meta.latest && addDays(meta.latest, 30) < today ? meta.latest : null;
  const dateText = (d: string) => <bdi dir="ltr">{fmt.date(d)}</bdi>;
  const n = result ? result.counts.affectsRankings + result.counts.other : 0;
  const wholeLog = meta.first !== null && since < meta.first;

  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={{ href: "/", label: site.name }} current={r5.changes.title} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{r5.changes.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{r5.changes.lede}</p>
      </header>
      <SincePicker since={since} until={until} today={today} defaultLine={defaultLine} chips={quick} onSince={(d) => set({ since: d })} onUntil={(d) => set({ until: d })} />
      {stale && <Callout tone="caution"><Tpl t={r5.changes.stale} vars={{ date: dateText(stale) }} /></Callout>}
      {failed ? (
        <Callout tone="caution">{r5.changes.loading}</Callout>
      ) : !ready || !shaped || !result ? (
        <p className="text-muted-foreground">{device.ready ? r5.changes.loadingOlder : r5.changes.loading}</p>
      ) : (
        <>
          <p className="flex flex-col gap-1">
            <span>
              {wholeLog && !until ? (
                <Tpl t={r5.changes.countsWhole} vars={{ date: dateText(meta.first!) }} />
              ) : until ? (
                <Tpl t={r5.changes.countsUntil} vars={{ n: <bdi dir="ltr" className="num-id">{fmt.number(n)}</bdi>, date: dateText(since), until: dateText(until), m: <bdi dir="ltr" className="num-id">{fmt.number(result.counts.affectsRankings)}</bdi> }} />
              ) : (
                <Tpl t={r5.changes.counts} vars={{ n: <bdi dir="ltr" className="num-id">{fmt.number(n)}</bdi>, date: dateText(since), m: <bdi dir="ltr" className="num-id">{fmt.number(result.counts.affectsRankings)}</bdi> }} />
              )}
              {wholeLog && !until && (
                <>
                  {" "}
                  <Tpl t={r5.changes.counts} vars={{ n: <bdi dir="ltr" className="num-id">{fmt.number(n)}</bdi>, date: dateText(since), m: <bdi dir="ltr" className="num-id">{fmt.number(result.counts.affectsRankings)}</bdi> }} />
                </>
              )}
            </span>
            <span className="text-sm text-muted-foreground">{r5.changes.precise}</span>
          </p>
          {n === 0 ? (
            <p>
              <Tpl t={r5.changes.empty} vars={{ date: dateText(since) }} />
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                <div className="min-w-0 flex-1">
                  <CollectionChips collections={chips} selected={selected} onToggle={(k) => set({ collections: (selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]).join(",") })} />
                </div>
                <div className="field lg:w-72">
                  <label htmlFor="changes-filter" className="sr-only">
                    {r5.changes.filters.search}
                  </label>
                  <div className="field-box">
                    <input id="changes-filter" type="search" dir="auto" value={text} placeholder={r5.changes.filters.search} onChange={(e) => setText(e.target.value)} className="field-input !text-start" />
                  </div>
                </div>
              </div>
              {shaped.affects.length === 0 && shaped.other.length === 0 && <p>{r5.changes.noHits}</p>}
              {shaped.affects.length > 0 && (
                <AffectsGroup affects count={shaped.affects.reduce((s, g) => s + g.count, 0)} defaultOpen>
                  {shaped.affects.map((g, i) => (
                    <CollectionDisclosure key={g.key} name={g.name} count={g.count} rows={g.rows} open={i === 0} r={resolvers} />
                  ))}
                </AffectsGroup>
              )}
              {shaped.other.length > 0 && (
                <AffectsGroup affects={false} count={shaped.other.reduce((s, g) => s + g.count, 0)} defaultOpen={false}>
                  {shaped.other.map((g) => (
                    <CollectionDisclosure key={g.key} name={g.name} count={g.count} rows={g.rows} open={false} r={resolvers} />
                  ))}
                </AffectsGroup>
              )}
            </>
          )}
        </>
      )}
      <p className="text-sm">
        <Link to="/goal/compare" className="text-link hover:underline min-h-target inline-flex items-center">
          {site.menuItems[4]!.label}
        </Link>
      </p>
    </div>
  );
}
