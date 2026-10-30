// Fetches the ECB's month-end euro reference rates of the dollar and the shekel and writes data/series/ecb-fx-month-end.json
// (2026-10-29, the index page's dollar section, method F-93). Run: npm run fetch:ecb-month -w @finance-tool/pipeline
//   or: npx tsx packages/pipeline/scripts/fetch-ecb-month-end.ts [--from-file path.csv]
// Source: the ECB Data Portal, series EXR.M.<ccy>.EUR.SP00.E (monthly, end of period), as CSV. Terms as data/series/ecb-fx.json
// (read 2026-10-25): free use if the information appears accurately, the ECB is cited, and any modification is stated.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seriesRecord, type SeriesRecord } from "@finance-tool/schema";
import { FX_UNIT, TERMS_URL } from "./fetch-ecb-rates.ts";

export const CODES = ["ILS", "USD"] as const;
export const API_URL = `https://data-api.ecb.europa.eu/service/data/EXR/M.${CODES.join("+")}.EUR.SP00.E?format=csvdata&startPeriod=2000-01`;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const OUT_FILE = resolve(root, "data/series/ecb-fx-month-end.json");

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

/** The series file, checked (read) on `runDate`: months both currencies have, oldest first. */
export function buildMonthSeries(rates: MonthRate[], runDate: string): SeriesRecord {
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
    notes:
      "Units of the dollar and of the shekel per one euro on each month's last reference day, as the ECB publishes them (series EXR.M.<code>.EUR.SP00.E, observation status A). The shekel series starts in January 2000. The dollar against the shekel is a cross rate computed by the site (ILS per EUR divided by USD per EUR), F-93. Reference rates, not rates at which anyone trades; the Bank of Israel's representative rates stay a link (D20).",
    observations: months.flatMap((m) =>
      CODES.map((code) => {
        const date = lastDay(m);
        return { key: code, date, value: rates.find((r) => r.code === code && r.month === m)!.rate, unit: FX_UNIT as never, source, checked: runDate, effective_from: date, effective_to: date, update_rule: "market" as const, state: "sourced" as const };
      }),
    ),
  };
}

async function main() {
  const fromFile = process.argv.indexOf("--from-file");
  const csv = fromFile > 0 ? readFileSync(process.argv[fromFile + 1]!, "utf8") : await (async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`ECB Data Portal: HTTP ${res.status}`);
    return res.text();
  })();
  const runDate = new Date().toISOString().slice(0, 10);
  const series = seriesRecord.parse(buildMonthSeries(parseMonthCsv(csv), runDate));
  const before = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : "";
  const text = JSON.stringify(series, null, 2) + "\n";
  if (text !== before) writeFileSync(OUT_FILE, text);
  console.log(`ecb-fx-month-end: ${series.observations.length / CODES.length} months to ${series.observations.at(-1)!.date}${text === before ? " (unchanged)" : ""}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
