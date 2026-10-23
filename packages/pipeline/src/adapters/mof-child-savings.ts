// Ministry of Finance adapter: bank rates for the child-savings programme, data.gov.il package
// savingsplaninterest, resource a737b311-.... The datastore API of that resource is stale; the CSV file is current
// (il-finance CS-23, corrected 2026-10-23), so this reads the file (Windows-1255).
// Terms: data.gov.il licence, status confirmed (the source must be named; data/series/mof-child-savings-rates.json carries it).
// Pure functions (normalise, thin, sanityCheck, diffSeries, changelogLines) do no I/O.
import { seriesRecord, type ChangelogLine, type SeriesObservation, type SeriesRecord } from "@finance-tool/schema";
import { USER_AGENT, decodeWindows1255, parseCsv, type Downloaded } from "./cma.ts";
import { lastDate, refreshSeries, type SeriesDiff, type SeriesRefreshOptions, type SeriesSpec, type SourceReport } from "./series-common.ts";

export const MOF_ID = "mof-child-savings-rates";
export const DATASET_UUID = "dcd96625-def1-45dc-a2cf-f4ad7fc2360a";
export const RESOURCE_ID = "a737b311-c6d8-4084-9ac9-c40d0fd01125";
export const DOWNLOAD_URL = `https://data.gov.il/dataset/${DATASET_UUID}/resource/${RESOURCE_ID}/download/file.csv`;
export const TERMS_URL = "https://data.gov.il/he/terms-of-use";
/** The file is a rolling window; the series keeps this many months back from the run date. */
export const WINDOW_MONTHS = 14;

// Pipeline configuration (not site parameters): the sanity thresholds.
export const SANITY = { minKeyRatio: 0.8, minRate: -10, maxRate: 20 } as const;

export const REQUIRED_COLUMNS = [
  "INTERESTSDATE",
  "AGE",
  "BANK",
  "SAVINGSPLAN",
  "SAVINGSPERIOD",
  "FIXEDWITHOUTLINKAGEVAL",
  "FIXEDLINKEDCONSUMERPRICEINDVAL",
  "VARIABLESPREAD",
] as const;
const TEXT_COLUMNS = ["AGE", "BANK", "SAVINGSPLAN", "SAVINGSPERIOD"] as const;

/** CSV column -> metric name in the key. Spread is in percentage points from prime, the others are rates a year. */
export const METRICS = [
  ["FIXEDWITHOUTLINKAGEVAL", "fixed_unlinked"],
  ["FIXEDLINKEDCONSUMERPRICEINDVAL", "fixed_cpi_linked"],
  ["VARIABLESPREAD", "variable_spread"],
] as const;

export interface NormaliseCtx {
  runDate: string;
  sha256: string;
}

const byDateThenKey = (a: { date: string; key?: string | undefined }, b: { date: string; key?: string | undefined }): number =>
  a.date !== b.date ? (a.date < b.date ? -1 : 1) : (a.key ?? "") < (b.key ?? "") ? -1 : (a.key ?? "") > (b.key ?? "") ? 1 : 0;

/** "22/10/2026" -> "2026-10-22"; null when it is not a real date. */
export function isoFromDmy(raw: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : iso;
}

/** The date `months` calendar months before `iso`, the day clamped to the month's length. */
export function monthsBefore(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const idx = y * 12 + (m - 1) - months;
  const [ny, nm] = [Math.floor(idx / 12), idx % 12];
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${String(nm + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

/**
 * Keep, for one key, the first point, every point whose value differs from the one before, and the last point.
 * A value holds until the next kept point of its key; the last point shows the key was still quoted that day.
 */
export function thin<T extends { value: number }>(points: T[]): T[] {
  return points.filter((p, i) => i === 0 || i === points.length - 1 || p.value !== points[i - 1]!.value);
}

export interface Parsed {
  /** key -> [date, value] points, oldest first, inside the window. */
  series: Map<string, { date: string; value: number }[]>;
  rowsRead: number;
  problems: string[];
}

export function parseRates(csvText: string, runDate: string): Parsed {
  const problems: string[] = [];
  const empty: Parsed = { series: new Map(), rowsRead: 0, problems };
  const table = parseCsv(csvText);
  const header = table[0] ?? [];
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    problems.push(`required column(s) missing: ${missing.join(", ")}`);
    return empty;
  }
  const col = Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>;
  const get = (r: string[], name: string): string => (r[col[name]!] ?? "").trim();
  const body = table.slice(1).filter((r) => r.length === header.length);
  if (table.length - 1 - body.length > 0) problems.push(`${table.length - 1 - body.length} row(s) with the wrong number of columns`);

  const cutoff = monthsBefore(runDate, WINDOW_MONTHS);
  const decodeBad = new Set<string>();
  const raw = new Map<string, Map<string, number>>(); // key -> date -> value
  let unreadableDate = 0;
  let unreadableValue = 0;
  let future = 0;
  const dupes = new Set<string>();
  let rowsRead = 0;
  for (const r of body) {
    for (const c of TEXT_COLUMNS) if (get(r, c).includes("�")) decodeBad.add(c);
    const date = isoFromDmy(get(r, "INTERESTSDATE"));
    if (!date) {
      unreadableDate++;
      continue;
    }
    if (date > runDate) {
      future++;
      continue;
    }
    if (date < cutoff) continue;
    rowsRead++;
    const base = [get(r, "BANK"), get(r, "SAVINGSPLAN"), get(r, "AGE"), get(r, "SAVINGSPERIOD")].join("|");
    for (const [column, metric] of METRICS) {
      const text = get(r, column);
      const value = Number(text);
      if (text === "" || !Number.isFinite(value)) {
        unreadableValue++;
        continue;
      }
      const key = `${base}|${metric}`;
      let byDate = raw.get(key);
      if (!byDate) raw.set(key, (byDate = new Map()));
      if (byDate.has(date)) dupes.add(`${date} ${key}`);
      byDate.set(date, value);
    }
  }
  if (decodeBad.size > 0) problems.push(`text failed to decode (replacement characters) in: ${[...decodeBad].join(", ")}`);
  if (unreadableDate > 0) problems.push(`${unreadableDate} row(s) with an unreadable INTERESTSDATE`);
  if (future > 0) problems.push(`${future} row(s) dated after the run date ${runDate}`);
  if (unreadableValue > 0) problems.push(`${unreadableValue} rate cell(s) empty or not a number`);
  if (dupes.size > 0) problems.push(`${dupes.size} (date, key) pair(s) appear more than once, e.g. ${[...dupes][0]}`);
  const series = new Map<string, { date: string; value: number }[]>();
  for (const [key, byDate] of raw) {
    series.set(key, [...byDate].map(([date, value]) => ({ date, value })).sort((a, b) => (a.date < b.date ? -1 : 1)));
  }
  if (series.size === 0) problems.push("no usable rows inside the window");
  return { series, rowsRead, problems };
}

export const archiveKey = (runDate: string): string => `mof-child-savings/${runDate}.csv.gz`;

const observation = (date: string, key: string, value: number, runDate: string): SeriesObservation => ({
  date,
  key,
  value,
  unit: "pct_per_year",
  source: {
    url: DOWNLOAD_URL,
    title: "ריביות של פיקדונות חיסכון לכל ילד – עדכון יומי (data.gov.il savingsplaninterest, file.csv, Windows-1255)",
    publisher: "Ministry of Finance (Accountant General) via data.gov.il",
    strength: "primary",
  },
  checked: runDate,
  effective_from: date,
  effective_to: null,
  update_rule: "provider-set",
  state: "sourced",
});

export function normalise(
  dl: Downloaded,
  previous: SeriesRecord | null,
  ctx: NormaliseCtx,
): { file: SeriesRecord | null; problems: string[] } {
  const parsed = parseRates(decodeWindows1255(dl.bytes), ctx.runDate);
  if (parsed.series.size === 0) return { file: null, problems: parsed.problems };
  // An observation unchanged from the stored file keeps its stored `checked`, so a refresh does not rewrite every line.
  const stored = new Map((previous?.observations ?? []).map((o) => [`${o.date}\u0000${o.key ?? ""}`, o]));
  const observations: SeriesObservation[] = [];
  for (const [key, points] of parsed.series) {
    for (const p of thin(points)) {
      const old = stored.get(`${p.date}\u0000${key}`);
      observations.push(old && old.value === p.value ? old : observation(p.date, key, p.value, ctx.runDate));
    }
  }
  observations.sort(byDateThenKey);
  const candidate = {
    id: MOF_ID,
    names: { he: ["ריביות של פיקדונות חיסכון לכל ילד – עדכון יומי"] },
    publisher: "Ministry of Finance (Accountant General) via data.gov.il",
    flow: `data.gov.il package savingsplaninterest (id ${DATASET_UUID})`,
    series_code: `resource ${RESOURCE_ID}, file.csv`,
    unit: "pct_per_year",
    cadence: "daily",
    stale_after_days: 7,
    terms_of_use: {
      status: "confirmed",
      terms_url: TERMS_URL,
      read_on: "2026-10-23",
      attribution: "מקור המידע: משרד האוצר, החשב הכללי, מאגר \"ריביות של פיקדונות חיסכון לכל ילד – עדכון יומי\", data.gov.il (https://data.gov.il/dataset/savingsplaninterest), לפי תנאי השימוש במאגרי המידע הממשלתיים",
      fallback: "none needed",
    },
    rule_ids: ["CS-10", "CS-22", "CS-23"],
    notes:
      `The bank's quoted rates for the child-savings programme (nine banks). Source rows are one per date, bank, plan, age and saving period with three rates; ` +
      `each observation's key is "<bank>|<plan>|<age>|<saving period>|<metric>" as the file prints the first four, and the metric is one of ` +
      `fixed_unlinked (fixed rate, unlinked, % a year), fixed_cpi_linked (fixed CPI-linked rate, % a year) or variable_spread (variable rate, percentage points from prime, negative = below prime). ` +
      `The file keeps the latest ${WINDOW_MONTHS} months (the source file is a rolling window). For each key it keeps the first value in the window, every value that differs from the one before and the latest day; ` +
      `a value holds until the next observation of the same key. Value dates in the source are about every second day.`,
    raw: { archive_key: archiveKey(ctx.runDate), sha256: ctx.sha256 },
    observations,
  };
  const result = seriesRecord.safeParse(candidate);
  if (!result.success) {
    const first = result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    return { file: null, problems: [...parsed.problems, `schema validation failed (${result.error.issues.length} issue(s)): ${first.join("; ")}`] };
  }
  return { file: result.data, problems: parsed.problems };
}

/** The latest observation of each key: key -> { date, value }. */
export function currentState(file: SeriesRecord): Map<string, { date: string; value: number }> {
  const out = new Map<string, { date: string; value: number }>();
  for (const o of file.observations) {
    if (o.key === undefined || typeof o.value !== "number") continue;
    const cur = out.get(o.key);
    if (!cur || o.date >= cur.date) out.set(o.key, { date: o.date, value: o.value });
  }
  return out;
}

/** Reasons the new file must not be written ("sanity failed"); empty when it is fine. */
export function sanityCheck(next: SeriesRecord, previous: SeriesRecord | null): string[] {
  const reasons: string[] = [];
  for (const o of next.observations) {
    if (typeof o.value !== "number" || o.value < SANITY.minRate || o.value > SANITY.maxRate) {
      reasons.push(`${o.date} ${o.key}: rate ${String(o.value)} is outside ${SANITY.minRate} to ${SANITY.maxRate}`);
      if (reasons.length >= 5) break;
    }
  }
  const state = currentState(next);
  const latest = lastDate(next);
  const onLatest = [...state.values()].filter((s) => s.date === latest).length;
  if (state.size > 0 && onLatest < SANITY.minKeyRatio * state.size) {
    reasons.push(`only ${onLatest} of ${state.size} keys have a value on the latest date ${latest}; the minimum is ${SANITY.minKeyRatio * 100}%`);
  }
  if (previous) {
    const prevState = currentState(previous);
    const prevLatest = lastDate(previous);
    if (prevLatest && latest && latest < prevLatest) reasons.push(`latest date ${latest} is older than the stored ${prevLatest}`);
    if (state.size < SANITY.minKeyRatio * prevState.size) {
      reasons.push(`key count ${state.size} is below ${SANITY.minKeyRatio * 100}% of the stored ${prevState.size}`);
    }
  }
  return reasons;
}

export interface RatesDiff {
  added: string[];
  removed: string[];
  changed: { key: string; old: number; new: number }[];
  latestDateChanged: boolean;
}

export function diffRates(previous: SeriesRecord | null, next: SeriesRecord): RatesDiff {
  const p = previous ? currentState(previous) : new Map<string, { date: string; value: number }>();
  const n = currentState(next);
  const added = [...n.keys()].filter((k) => !p.has(k));
  const removed = [...p.keys()].filter((k) => !n.has(k));
  const changed = [...n].filter(([k, v]) => p.has(k) && p.get(k)!.value !== v.value).map(([key, v]) => ({ key, old: p.get(key)!.value, new: v.value }));
  return { added, removed, changed, latestDateChanged: !previous || lastDate(previous) !== lastDate(next) };
}

export function diffSeries(previous: SeriesRecord | null, next: SeriesRecord): SeriesDiff {
  const d = diffRates(previous, next);
  return {
    isEmpty: !d.latestDateChanged && d.added.length === 0 && d.removed.length === 0 && d.changed.length === 0,
    newPeriod: d.latestDateChanged,
    summary:
      `${d.latestDateChanged ? `NEW latest date ${lastDate(next)}` : `values changed on ${lastDate(next)}`}: ` +
      `${d.added.length} key(s) added, ${d.removed.length} removed, ${d.changed.length} current value(s) changed`,
  };
}

/**
 * Change-log lines (data-schema 3.12). A first snapshot is one summary line (the file holds about a thousand keys);
 * after that, one line per key whose current value changed, appeared or disappeared. A new latest date with
 * the same values logs nothing.
 */
export function changelogLines(previous: SeriesRecord | null, next: SeriesRecord, runDate: string): ChangelogLine[] {
  const line = (field: string, old: unknown, nw: unknown, reason: string): ChangelogLine => ({
    date: runDate,
    collection: "series",
    id: MOF_ID,
    field,
    old,
    new: nw,
    reason,
    affects_rankings: true,
  });
  const state = currentState(next);
  if (!previous) {
    const dates = next.observations.map((o) => o.date);
    return [
      line(
        "observations",
        null,
        { keys: state.size, observations: next.observations.length, first_date: dates[0] ?? null, last_date: lastDate(next) },
        `first snapshot, MoF child-savings rates (data.gov.il savingsplaninterest, latest ${WINDOW_MONTHS} months)`,
      ),
    ];
  }
  const d = diffRates(previous, next);
  const prevState = currentState(previous);
  const date = lastDate(next);
  return [
    ...d.changed.map((c) => line(`current.${c.key}`, c.old, c.new, `quoted rate changed, value date ${date}`)),
    ...d.added.map((k) => line(`current.${k}`, null, state.get(k)!.value, `key new in the source file, value date ${date}`)),
    ...d.removed.map((k) => line(`current.${k}`, prevState.get(k)!.value, null, `key no longer in the source file, value date ${date}`)),
  ];
}

export async function fetchRaw(): Promise<Downloaded> {
  const res = await fetch(DOWNLOAD_URL, { headers: { "User-Agent": USER_AGENT, Accept: "text/csv,*/*" }, redirect: "follow" });
  if (!res.ok) throw new Error(`mof-child-savings: download failed, HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length < 1000) throw new Error(`mof-child-savings: download is only ${bytes.length} bytes`);
  const lm = res.headers.get("last-modified");
  const d = lm ? new Date(lm) : null;
  return { bytes, lastModified: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d+Z$/, "Z") : null };
}

export const mofSpec: SeriesSpec = {
  source: "mof-child-savings",
  id: MOF_ID,
  fetchRaw,
  build: (dl, previous, ctx) => normalise(dl, previous, ctx),
  sanity: sanityCheck,
  diff: diffSeries,
  changelog: changelogLines,
  archive: {
    tag: (runDate) => `raw-mof-child-savings-${runDate.slice(0, 7)}`,
    title: "Raw MoF child-savings rate downloads",
    notes: "Raw gzipped CSV downloads from data.gov.il (docs/architecture.md section 3.3). Evidence for data/series/mof-child-savings-rates.json.",
  },
};

export const refreshMofChildSavings = (opts: SeriesRefreshOptions): Promise<SourceReport> => refreshSeries(mofSpec, opts);
