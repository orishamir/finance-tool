// Fetches the ECB's daily euro reference rates and writes data/series/ecb-fx.json (decision D26: the site gives
// exchange rates itself; the person never types one). Run: npm run fetch:ecb -w @finance-tool/pipeline
//   or: npx tsx packages/pipeline/scripts/fetch-ecb-rates.ts [--from-file path.xml]
// The file keeps the latest reference day only, one observation per currency (`key` = ISO code, value = units of
// that currency per one euro). Terms: https://www.ecb.europa.eu/services/disclaimer/html/index.en.html (read 2026-10-25):
// free use if the information appears accurately, the ECB is cited, and any modification is stated.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seriesRecord, type SeriesRecord } from "@finance-tool/schema";

export const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
export const TERMS_URL = "https://www.ecb.europa.eu/services/disclaimer/html/index.en.html";
export const FX_UNIT = "fx_per_eur";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const OUT_FILE = resolve(root, "data/series/ecb-fx.json");

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

/** The series file for one ECB day, checked (read) on `runDate`. */
export function buildSeries(day: EcbDay, runDate: string): SeriesRecord {
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
        checked: runDate,
        effective_from: day.date,
        effective_to: day.date,
        update_rule: "market" as const,
        state: "sourced" as const,
      })),
  };
}

async function main() {
  const fromFile = process.argv.indexOf("--from-file");
  const xml = fromFile > 0 ? readFileSync(process.argv[fromFile + 1]!, "utf8") : await (async () => {
    const res = await fetch(ECB_URL);
    if (!res.ok) throw new Error(`ECB: HTTP ${res.status}`);
    return res.text();
  })();
  const runDate = new Date().toISOString().slice(0, 10);
  const series = buildSeries(parseEcbXml(xml), runDate);
  const parsed = seriesRecord.safeParse(series);
  if (!parsed.success) {
    // Until the schema lists the unit `fx_per_eur` (requests.md, A3 to A1) a unit complaint is a warning; any other issue stops the run.
    const other = parsed.error.issues.filter((i) => i.path[i.path.length - 1] !== "unit");
    if (other.length) throw new Error(other.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    console.warn(`warning: the schema does not list the unit ${FX_UNIT} yet`);
  }
  const before = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : "";
  const head = JSON.stringify({ ...series, observations: undefined }, null, 2).replace(/\n}$/, ',\n  "observations": [\n');
  const body = series.observations.map((o) => "    " + JSON.stringify(o)).join(",\n");
  const text = head + body + "\n  ]\n}\n";
  if (text === before) console.log(`ecb-fx: unchanged (${series.observations[0]?.date})`);
  else {
    writeFileSync(OUT_FILE, text);
    console.log(`ecb-fx: wrote ${series.observations.length} rates for ${series.observations[0]?.date}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
