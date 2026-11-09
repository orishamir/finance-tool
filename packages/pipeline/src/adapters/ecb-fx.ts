// ECB adapter: the daily euro reference rates (decision D26: the site gives exchange rates itself; the person never types
// one) and the month-end rates of the dollar and the shekel (F-93). Run: npm run refresh -- ecb-fx ecb-fx-month-end
// The daily file keeps the latest reference day only, one observation per currency (`key` = ISO code, value = units of
// that currency per one euro). Terms: https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html (read):
// free use if the information appears accurately, the ECB is cited, and any modification is stated.
import { seriesRecord, type SeriesObservation, type SeriesRecord } from "@finance-tool/schema";
import { USER_AGENT, type Downloaded } from "./cma.ts";
import { lastDate, refreshSeries, type SeriesDiff, type SeriesRefreshOptions, type SeriesSpec, type SourceReport } from "./series-common.ts";

export const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
export const TERMS_URL = "https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html";
export const FX_UNIT = "fx_per_eur";
export const CODES = ["ILS", "USD"] as const;
export const API_URL = `https://data-api.ecb.europa.eu/service/data/EXR/M.${CODES.join("+")}.EUR.SP00.E?format=csvdata&startPeriod=2000-01`;

// Pipeline configuration (not site parameters): the sanity threshold. The dollar and the shekel never moved this much between two reference days.
export const SANITY = { maxChangePct: 10 } as const;

export interface BuildCtx {
  runDate: string;
  sha256: string;
}

export interface EcbDay {
  date: string;
  /** Units of the currency per one euro, by ISO code. */
  rates: Record<string, number>;
}

/** Reads the ECB's eurofxref XML: one `<Cube time='YYYY-MM-DD'>` holding `<Cube currency='USD' rate='1.1193'/>` rows. */
export function parseEcbXml(xml: string): EcbDay {
  const day = /<Cube\s+time=['"](\d{4}-\d{2}-\d{2})['"]\s*>([\s\S]*?)<\/Cube>/.exec(xml);
  if (!day) throw new Error("ECB XML: no <Cube time='...'> element");
  const rates: Record<string, number> = {};
  for (const m of day[2]!.matchAll(/<Cube\s+currency=['"]([A-Z]{3})['"]\s+rate=['"]([0-9.]+)['"]\s*\/>/g)) {
    const n = Number(m[2]);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`ECB XML: bad rate for ${m[1]}: ${m[2]}`);
    rates[m[1]!] = n;
  }
  for (const code of ["USD", "ILS"]) if (!(code in rates)) throw new Error(`ECB XML: no ${code} rate (the site needs it)`);
  return { date: day[1]!, rates };
}

/** The series file for one ECB day, checked (read) on `ctx.runDate`. */
export function buildSeries(day: EcbDay, ctx: BuildCtx): SeriesRecord {
  const source = { url: ECB_URL, title: "ECB euro foreign exchange reference rates (daily)", publisher: "European Central Bank", strength: "primary" as const };
  return {
    id: "ecb-fx",
    names: { he: ["שערי הייחוס היומיים של האירו (הבנק המרכזי האירופי)"], en: ["ECB euro foreign exchange reference rates"] },
    publisher: "European Central Bank",
    flow: "ECB eurofxref daily XML (ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml)",
    series_code: "eurofxref-daily",
    unit: FX_UNIT as never,
    cadence: "daily",
    stale_after_days: 5,
    terms_of_use: {
      status: "confirmed",
      fallback: "none needed",
      terms_url: TERMS_URL,
      read_on: "2026-10-25",
      attribution: "הבנק המרכזי האירופי (ECB), שערי הייחוס היומיים של האירו. הנתונים מועתקים כפי שפורסמו; החישובים באתר (שער בשקלים ליחידת מטבע) הם חישוב של האתר ולא של הבנק המרכזי האירופי.",
    },
    rule_ids: [],
    raw: { archive_key: `ecb-fx/${ctx.runDate}.xml.gz`, sha256: ctx.sha256 },
    notes:
      "Units of each currency per one euro, as the ECB prints them (published around 16:00 CET on working days, the rate is for that day). One observation per currency, `key` is the ISO code; the file keeps the latest reference day only. ECB copyright conditions (read 2026-10-25): use is free if the information appears accurately, the ECB is cited, and any modification is stated. NIS per unit of another currency is a cross rate computed by the site (ILS per EUR divided by the currency per EUR). The ECB's rates are reference rates, not rates at which anyone trades; the Bank of Israel's representative rates stay a link (D20).",
    observations: Object.entries(day.rates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, rate]) => ({
        key: code,
        date: day.date,
        value: rate,
        unit: FX_UNIT as never,
        source,
        checked: ctx.runDate,
        effective_from: day.date,
        effective_to: day.date,
        update_rule: "market" as const,
        state: "sourced" as const,
      })),
  };
}

export interface MonthRate {
  code: string;
  /** YYYY-MM */
  month: string;
  /** Units of the currency per one euro on the month's last reference day. */
  rate: number;
}

/** Reads the Data Portal's CSV: a header row naming CURRENCY, TIME_PERIOD and OBS_VALUE, one row per month and currency. */
export function parseMonthCsv(csv: string): MonthRate[] {
  const [head, ...rows] = csv.trim().split(/\r?\n/);
  const cols = head!.split(",");
  const iC = cols.indexOf("CURRENCY"), iT = cols.indexOf("TIME_PERIOD"), iV = cols.indexOf("OBS_VALUE");
  if (iC < 0 || iT < 0 || iV < 0) throw new Error("ECB CSV: no CURRENCY, TIME_PERIOD or OBS_VALUE column");
  const out: MonthRate[] = [];
  for (const r of rows) {
    // the title columns hold quoted commas; the first columns, which these are, never do
    const c = r.split(",");
    const rate = Number(c[iV]);
    if (!/^\d{4}-\d{2}$/.test(c[iT] ?? "") || !Number.isFinite(rate) || rate <= 0) throw new Error(`ECB CSV: bad row ${r.slice(0, 60)}`);
    out.push({ code: c[iC]!, month: c[iT]!, rate });
  }
  for (const code of CODES) if (!out.some((x) => x.code === code)) throw new Error(`ECB CSV: no ${code} rows`);
  return out;
}

const lastDay = (month: string) => {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};

/** The series file, checked (read) on `ctx.runDate`: months both currencies have, oldest first. */
export function buildMonthSeries(rates: MonthRate[], ctx: BuildCtx): SeriesRecord {
  const source = { url: API_URL, title: "ECB Data Portal, EXR: ECB reference exchange rates, monthly, end of period (EXR.M.ILS.EUR.SP00.E, EXR.M.USD.EUR.SP00.E)", publisher: "European Central Bank", strength: "primary" as const };
  const months = [...new Set(rates.map((r) => r.month))].filter((m) => CODES.every((c) => rates.some((r) => r.code === c && r.month === m))).sort();
  return {
    id: "ecb-fx-month-end",
    names: { he: ["שערי הייחוס של האירו בסוף כל חודש (הבנק המרכזי האירופי)"], en: ["ECB euro reference rates, end of month"] },
    publisher: "European Central Bank",
    flow: "ECB Data Portal API, EXR dataflow, CSV (data-api.ecb.europa.eu/service/data/EXR/M.ILS+USD.EUR.SP00.E)",
    series_code: "EXR.M.ILS+USD.EUR.SP00.E",
    unit: FX_UNIT as never,
    cadence: "monthly",
    stale_after_days: 45,
    terms_of_use: {
      status: "confirmed",
      fallback: "none needed",
      terms_url: TERMS_URL,
      read_on: "2026-10-25",
      attribution: "הבנק המרכזי האירופי (ECB), שערי הייחוס של האירו בסוף כל חודש. הנתונים מועתקים כפי שפורסמו; השינוי של הדולר מול השקל הוא חישוב של האתר ולא של הבנק המרכזי האירופי.",
    },
    rule_ids: [],
    raw: { archive_key: `ecb-fx-month-end/${ctx.runDate}.csv.gz`, sha256: ctx.sha256 },
    notes:
      "Units of the dollar and of the shekel per one euro on each month's last reference day, as the ECB publishes them (series EXR.M.<code>.EUR.SP00.E, observation status A). The shekel series starts in January 2000. The dollar against the shekel is a cross rate computed by the site (ILS per EUR divided by USD per EUR), F-93. Reference rates, not rates at which anyone trades; the Bank of Israel's representative rates stay a link (D20).",
    observations: months.flatMap((m) =>
      CODES.map((code) => {
        const date = lastDay(m);
        return { key: code, date, value: rates.find((r) => r.code === code && r.month === m)!.rate, unit: FX_UNIT as never, source, checked: ctx.runDate, effective_from: date, effective_to: date, update_rule: "market" as const, state: "sourced" as const };
      }),
    ),
  };
}

const sameRate = (a: SeriesObservation, b: SeriesObservation) => a.key === b.key && a.date === b.date && a.value === b.value;

/** Rows already stored keep their stored object (and its `checked`) while the value is unchanged. */
export function keepStored(next: SeriesRecord, previous: SeriesRecord | null): SeriesRecord {
  const stored = previous?.observations ?? [];
  return { ...next, observations: next.observations.map((o) => stored.find((p) => sameRate(p, o)) ?? o) };
}

/** Reasons the new file must not be written; empty when it is fine. `previous` may hold an earlier reference day. */
export function sanityCheck(next: SeriesRecord, previous: SeriesRecord | null): string[] {
  const reasons: string[] = [];
  const prevLast = previous && lastDate(previous);
  const nextLast = lastDate(next);
  if (!previous || !prevLast || !nextLast) return reasons;
  if (nextLast < prevLast) reasons.push(`latest day ${nextLast} is older than the stored ${prevLast}`);
  for (const code of CODES) {
    const was = previous.observations.find((o) => o.key === code && o.date === prevLast)?.value;
    const now = next.observations.find((o) => o.key === code && o.date === nextLast)?.value;
    if (typeof was !== "number" || typeof now !== "number") continue;
    const change = (Math.abs(now - was) / was) * 100;
    if (change > SANITY.maxChangePct) reasons.push(`${code} moved ${change.toFixed(1)}% from ${was} (${prevLast}) to ${now} (${nextLast}); the limit is ${SANITY.maxChangePct}%`);
  }
  return reasons;
}

export function diffSeries(previous: SeriesRecord | null, next: SeriesRecord): SeriesDiff {
  const stored = previous?.observations ?? [];
  const changed = next.observations.filter((o) => !stored.some((p) => sameRate(p, o))).length;
  const last = lastDate(next);
  return {
    isEmpty: changed === 0 && stored.length === next.observations.length,
    newPeriod: !previous || last !== lastDate(previous),
    summary: `latest ${last}; ${changed} rate(s) new or changed`,
  };
}

const fetchEcb = (name: string, url: string) => async (): Promise<Downloaded> => {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, redirect: "follow" });
  if (!res.ok) throw new Error(`${name}: download failed, HTTP ${res.status}`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), lastModified: null };
};

const decode = (dl: Downloaded) => new TextDecoder("utf-8").decode(dl.bytes);
const validated = (file: SeriesRecord, previous: SeriesRecord | null) => ({ file: keepStored(seriesRecord.parse(file), previous), problems: [] });

const archive = (id: string) => ({
  tag: (runDate: string) => `raw-${id}-${runDate.slice(0, 7)}`,
  title: `Raw ECB downloads (${id})`,
  notes: `Raw gzipped response from the European Central Bank (docs/architecture.md section 3.3). Evidence for data/series/${id}.json.`,
});

export const ecbFxSpec: SeriesSpec = {
  source: "ecb-fx",
  id: "ecb-fx",
  fetchRaw: fetchEcb("ecb-fx", ECB_URL),
  build: (dl, previous, ctx) => validated(buildSeries(parseEcbXml(decode(dl)), ctx), previous),
  sanity: sanityCheck,
  diff: diffSeries,
  archive: archive("ecb-fx"),
};

export const ecbMonthEndSpec: SeriesSpec = {
  source: "ecb-fx-month-end",
  id: "ecb-fx-month-end",
  fetchRaw: fetchEcb("ecb-fx-month-end", API_URL),
  build: (dl, previous, ctx) => validated(buildMonthSeries(parseMonthCsv(decode(dl)), ctx), previous),
  sanity: sanityCheck,
  diff: diffSeries,
  archive: archive("ecb-fx-month-end"),
};

export const refreshEcbFx = (opts: SeriesRefreshOptions): Promise<SourceReport> => refreshSeries(ecbFxSpec, opts);
export const refreshEcbMonthEnd = (opts: SeriesRefreshOptions): Promise<SourceReport> => refreshSeries(ecbMonthEndSpec, opts);
