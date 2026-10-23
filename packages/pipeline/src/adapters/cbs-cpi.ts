// CBS adapter: the general consumer price index (code 120010) from the CBS price-index API.
// Terms: CBS open licence v2.1, status confirmed (data/series/cbs-cpi.json carries the attribution line).
// Pure functions (normalise, mergeObservations, sanityCheck, diffSeries, changelogLines) do no I/O.
import { seriesRecord, type ChangelogLine, type SeriesObservation, type SeriesRecord } from "@finance-tool/schema";
import { USER_AGENT, type Downloaded } from "./cma.ts";
import { lastDate, refreshSeries, type SeriesDiff, type SeriesRefreshOptions, type SeriesSpec, type SourceReport } from "./series-common.ts";

export const CPI_ID = "cbs-cpi";
export const CPI_CODE = 120010;
/** The current base period as the API prints it. A different base on the latest month stops the run (chaining is a person's job). */
export const EXPECTED_BASE = "2024 ממוצע";
/** First month of the 2024-average base (the earlier months are printed in the 2022 base and are not stored). */
export const START_PERIOD = "01-2025";
export const API_URL = `https://api.cbs.gov.il/index/data/price?id=${CPI_CODE}&format=json&download=false&startPeriod=${START_PERIOD}`;
export const LICENCE_URL = "https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx";

// Pipeline configuration (not site parameters): the sanity thresholds.
export const SANITY = { minValue: 50, maxValue: 300, maxMonthlyDropPct: 5 } as const;

export interface CpiRow {
  date: string; // YYYY-MM-01
  value: number;
}

export interface NormaliseCtx {
  runDate: string;
  sha256: string;
}

const monthKey = (d: string): string => d.slice(0, 7);
const nextMonth = (ym: string): string => {
  const [y, m] = ym.split("-").map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
};
const lastDayOfMonth = (ym: string): string => {
  const [y, m] = ym.split("-").map(Number) as [number, number];
  return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};

/** Parse the API response into the months printed in the expected base, oldest first. */
export function parseResponse(jsonText: string): { rows: CpiRow[]; name: string | null; problems: string[] } {
  const problems: string[] = [];
  let doc: any;
  try {
    doc = JSON.parse(jsonText);
  } catch (e) {
    return { rows: [], name: null, problems: [`response is not JSON: ${(e as Error).message}`] };
  }
  const series = doc?.month?.[0];
  if (!series || !Array.isArray(series.date)) return { rows: [], name: null, problems: ["response has no month[0].date list"] };
  if (series.code !== CPI_CODE) problems.push(`series code is ${series.code}, expected ${CPI_CODE}`);
  if ((doc.paging?.last_page ?? 1) > 1) problems.push(`response has ${doc.paging.last_page} pages; only the first was read`);
  const all: (CpiRow & { base: string })[] = [];
  for (const r of series.date as any[]) {
    const value = r?.currBase?.value;
    if (!Number.isInteger(r?.year) || !Number.isInteger(r?.month) || r.month < 1 || r.month > 12 || typeof value !== "number" || !Number.isFinite(value)) {
      problems.push(`unreadable row ${JSON.stringify(r)}`);
      continue;
    }
    all.push({ date: `${r.year}-${String(r.month).padStart(2, "0")}-01`, value, base: String(r.currBase.baseDesc ?? "") });
  }
  all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const latest = all.at(-1);
  if (!latest) problems.push("response has no usable rows");
  else if (latest.base !== EXPECTED_BASE) {
    problems.push(`latest month ${monthKey(latest.date)} is printed in base "${latest.base}", expected "${EXPECTED_BASE}": the base changed, chain the series by hand`);
  }
  const seen = new Set<string>();
  for (const r of all) {
    if (seen.has(r.date)) problems.push(`month ${monthKey(r.date)} appears twice`);
    seen.add(r.date);
  }
  return { rows: all.filter((r) => r.base === EXPECTED_BASE).map(({ date, value }) => ({ date, value })), name: series.name ?? null, problems };
}

const observation = (row: CpiRow, runDate: string): SeriesObservation => ({
  date: row.date,
  value: row.value,
  unit: "index_points",
  source: {
    url: API_URL,
    title: `מדד המחירים לצרכן - כללי (code ${CPI_CODE}), CBS price-index API, base ${EXPECTED_BASE} = 100, index of ${monthKey(row.date)}`,
    publisher: "Central Bureau of Statistics",
    strength: "primary",
  },
  checked: runDate,
  effective_from: row.date,
  effective_to: lastDayOfMonth(monthKey(row.date)),
  update_rule: "market",
  state: "sourced",
});

/** Months already stored keep their stored object (and its `checked`) while the value is unchanged; a changed value takes the fresh one so the sanity check sees the revision. */
export function mergeObservations(previous: SeriesObservation[], fresh: SeriesObservation[]): SeriesObservation[] {
  const byDate = new Map(previous.map((o) => [o.date, o]));
  for (const f of fresh) {
    const p = byDate.get(f.date);
    if (!p || p.value !== f.value) byDate.set(f.date, f);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function normalise(
  dl: Downloaded,
  previous: SeriesRecord | null,
  ctx: NormaliseCtx,
): { file: SeriesRecord | null; problems: string[] } {
  const parsed = parseResponse(new TextDecoder("utf-8").decode(dl.bytes));
  if (parsed.problems.length > 0 || parsed.rows.length === 0) return { file: null, problems: parsed.problems };
  const observations = mergeObservations(previous?.observations ?? [], parsed.rows.map((r) => observation(r, ctx.runDate)));
  const candidate = {
    id: CPI_ID,
    names: { he: [parsed.name ?? "מדד המחירים לצרכן - כללי"] },
    publisher: "Central Bureau of Statistics",
    flow: "CBS price-index API (api.cbs.gov.il/index/data/price)",
    series_code: String(CPI_CODE),
    unit: "index_points",
    cadence: "monthly",
    stale_after_days: 45,
    terms_of_use: {
      status: "confirmed",
      terms_url: LICENCE_URL,
      read_on: "2026-10-23",
      attribution: `הלשכה המרכזית לסטטיסטיקה (הלמ"ס), מדד המחירים לצרכן - כללי (קוד ${CPI_CODE}), (${ctx.runDate}), ניתן לצפייה באתר: ${API_URL} מועתק ומופץ כמות שהוא – as is – על פי רישיון שימוש של הלמ"ס בכתובת אתר האינטרנט ${LICENCE_URL}`,
      fallback: "none needed",
    },
    rule_ids: [],
    notes: `General CPI as the CBS prints it, base ${EXPECTED_BASE} = 100, from ${START_PERIOD.slice(3)}-01. The CBS publishes a month's index on the 15th of the next month. Months before 2025-01 are printed in the 2022 base and are not stored; chaining coefficients are at https://api.cbs.gov.il/index/data/price_selected?id=${CPI_CODE}. date is the index month (first day); effective_to is its last day. This series is the history deflator, not an inflation expectation.`,
    raw: { archive_key: archiveKey(ctx.runDate), sha256: ctx.sha256 },
    observations,
  };
  const result = seriesRecord.safeParse(candidate);
  if (!result.success) {
    const first = result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    return { file: null, problems: [`schema validation failed (${result.error.issues.length} issue(s)): ${first.join("; ")}`] };
  }
  return { file: result.data, problems: [] };
}

export const archiveKey = (runDate: string): string => `cbs-cpi/${runDate}.json.gz`;

/** Reasons the new file must not be written ("sanity failed"); empty when it is fine. */
export function sanityCheck(next: SeriesRecord, previous: SeriesRecord | null): string[] {
  const reasons: string[] = [];
  const obs = next.observations;
  for (const o of obs) {
    const v = o.value;
    if (typeof v !== "number" || v < SANITY.minValue || v > SANITY.maxValue) {
      reasons.push(`${monthKey(o.date)}: value ${String(v)} is outside ${SANITY.minValue}-${SANITY.maxValue} index points`);
    }
  }
  for (let i = 1; i < obs.length; i++) {
    const [a, b] = [obs[i - 1]!, obs[i]!];
    const expected = nextMonth(monthKey(a.date));
    if (monthKey(b.date) !== expected) {
      reasons.push(`month missing in the sequence: ${expected} (between ${monthKey(a.date)} and ${monthKey(b.date)})`);
      continue;
    }
    if (typeof a.value === "number" && typeof b.value === "number" && a.value > 0) {
      const change = ((b.value - a.value) / a.value) * 100;
      if (change < -SANITY.maxMonthlyDropPct) {
        reasons.push(`${monthKey(b.date)}: index fell ${Math.abs(change).toFixed(1)}% from ${a.value} to ${b.value}; the limit is ${SANITY.maxMonthlyDropPct}%`);
      }
    }
  }
  if (previous) {
    const prevLast = lastDate(previous);
    const nextLast = lastDate(next);
    if (prevLast && nextLast && nextLast < prevLast) reasons.push(`latest month ${monthKey(nextLast)} is older than the stored ${monthKey(prevLast)}`);
    const nextByDate = new Map(obs.map((o) => [o.date, o.value]));
    for (const p of previous.observations) {
      const n = nextByDate.get(p.date);
      if (n === undefined) reasons.push(`stored month ${monthKey(p.date)} is missing from the new file`);
      else if (n !== p.value) reasons.push(`${monthKey(p.date)}: stored value ${String(p.value)} was revised to ${String(n)} upstream`);
    }
  }
  return reasons;
}

export interface CpiDiff {
  added: string[];
  changed: { date: string; old: unknown; new: unknown }[];
}

export function diffObservations(previous: SeriesRecord | null, next: SeriesRecord): CpiDiff {
  const prev = new Map((previous?.observations ?? []).map((o) => [o.date, o.value]));
  const added: string[] = [];
  const changed: CpiDiff["changed"] = [];
  for (const o of next.observations) {
    if (!prev.has(o.date)) added.push(o.date);
    else if (prev.get(o.date) !== o.value) changed.push({ date: o.date, old: prev.get(o.date), new: o.value });
  }
  return { added, changed };
}

export function diffSeries(previous: SeriesRecord | null, next: SeriesRecord): SeriesDiff {
  const d = diffObservations(previous, next);
  return {
    isEmpty: d.added.length === 0 && d.changed.length === 0,
    newPeriod: d.added.length > 0,
    summary:
      `${d.added.length > 0 ? `NEW month(s) ${d.added.map(monthKey).join(", ")}` : "no new month"}; ` +
      `${d.changed.length} value(s) changed upstream`,
  };
}

/** Change-log lines (data-schema 3.12): one per new month and one per changed month. */
export function changelogLines(previous: SeriesRecord | null, next: SeriesRecord, runDate: string): ChangelogLine[] {
  const d = diffObservations(previous, next);
  const values = new Map(next.observations.map((o) => [o.date, o.value]));
  const line = (date: string, old: unknown, nw: unknown, reason: string): ChangelogLine => ({
    date: runDate,
    collection: "series",
    id: CPI_ID,
    field: `observations.${monthKey(date)}`,
    old,
    new: nw,
    reason,
    affects_rankings: true,
  });
  return [
    ...d.added.map((date) =>
      line(date, null, values.get(date), previous ? `new monthly index, CBS price-index API code ${CPI_CODE}` : `first snapshot, CBS price-index API code ${CPI_CODE}, base ${EXPECTED_BASE}`),
    ),
    ...d.changed.map((c) => line(c.date, c.old, c.new, `value changed upstream, CBS price-index API code ${CPI_CODE}`)),
  ];
}

export async function fetchRaw(): Promise<Downloaded> {
  const res = await fetch(API_URL, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" }, redirect: "follow" });
  if (!res.ok) throw new Error(`cbs-cpi: download failed, HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length < 200) throw new Error(`cbs-cpi: download is only ${bytes.length} bytes`);
  return { bytes, lastModified: null };
}

export const cpiSpec: SeriesSpec = {
  source: "cbs-cpi",
  id: CPI_ID,
  fetchRaw,
  build: (dl, previous, ctx) => normalise(dl, previous, ctx),
  sanity: sanityCheck,
  diff: diffSeries,
  changelog: changelogLines,
  archive: {
    tag: (runDate) => `raw-cbs-cpi-${runDate.slice(0, 7)}`,
    title: "Raw CBS CPI downloads",
    notes: "Raw gzipped JSON from the CBS price-index API (docs/architecture.md section 3.3). Evidence for data/series/cbs-cpi.json.",
  },
};

export const refreshCbsCpi = (opts: SeriesRefreshOptions): Promise<SourceReport> => refreshSeries(cpiSpec, opts);
