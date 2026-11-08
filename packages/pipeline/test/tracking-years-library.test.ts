// F-92 (a), data-schema §3.5: a fund's tracking record holds every full calendar year its report prints (recheck 3 of the indices data,
// 2026-11-07: most Tel Aviv records held 2025 where the report printed 2023, 2024 and 2025). The validator holds each record's `years` to
// its `years_printed`; this test reads the report itself, where its text is in the research library (research/library/store, not in git,
// so the test runs on the founder's machine and skips elsewhere), and checks that `years_printed` is what the report prints and that
// every year's two figures stand on the cited page.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../../..");
const store = join(root, "research/library/store");
const hasLibrary = existsSync(store) && readdirSync(store).length > 0;

type Year = { year: number; fund_pct: number; tracking_pct: number; fees_charged?: { fixed: number; variable: number; trustee: number } };
type Track = { years: Year[]; years_printed?: number[]; source: { url: string }; page: number | null; fees_page?: number; changes_page?: number; variable_rate_since?: string | null; variable_positive_only?: true };
type Rec = { id: string; domicile: string; tracking_record?: Track };

const bidi = /[‎‏‪-‮]/g;

/** The full calendar years a returns table prints: bare years in its head, or a period that runs from 1 January to 31 December. */
function printedYears(page: string): number[] | null {
  const lines = page.replace(bidi, "").split("\n");
  // an Israeli annual report: "תשואות, סטיות תקן ונתוני השוואה - לפי תקופות", its head runs until the first row of figures
  let at = lines.findIndex((l) => /סטיות\s*תקן\s*ונתוני/.test(l));
  let head: string[] = [];
  if (at >= 0) {
    for (const l of lines.slice(at + 1, at + 8)) {
      if (/%/.test(l)) break;
      head.push(l);
    }
  } else {
    // a factsheet or key investor information: the first line made of years only; the fund's row under it prints the last of them
    // (a fund younger than the chart leaves the first years blank)
    at = lines.findIndex((l) => /^\s*((19|20)\d\d\s+){2,}(19|20)\d\d\s*$/.test(l));
    if (at < 0) return null;
    const all = lines[at]!.trim().split(/\s+/).map(Number);
    const row = lines.slice(at + 1).find((l) => (l.match(/-?\d+(?:\.\d+)?/g) ?? []).length >= 2);
    const n = row ? row.match(/-?\d+(?:\.\d+)?/g)!.length : all.length;
    return all.slice(Math.max(0, all.length - n));
  }
  const text = head.join(" ");
  const years = new Set<number>();
  for (const t of text.split(/\s+/)) if (/^(19|20)\d\d$/.test(t)) years.add(Number(t));
  for (const m of text.matchAll(/0?1[./]0?1[./]((?:19|20)\d\d)/g)) {
    const y = m[1]!;
    if (new RegExp(`31[./]12[./]${y}`).test(text)) years.add(Number(y));
  }
  return [...years].sort();
}

/** The fees page says its variable fees are only the positive ones: Mor's footnote, "נתון זה לא מקבל ביטוי בטבלה שלעיל" (pass 6). */
export const positiveOnly = (page: string): boolean => /לא\s*מקבל\s*ביטוי/.test(page);

/**
 * What a report's table of changes says of the variable fee: a non-zero count on its row ("0 0 1 0 ... דמי ניהול משתנים"), and the dates
 * printed about it (the line naming it, the one before, where Kesem sets the date, and the three after, where the dates and rates stand under their heads).
 */
export function variableChanges(page: string): { counted: boolean; dates: string[] } {
  const lines = page.split("\n");
  let counted = false;
  const dates = new Set<string>();
  lines.forEach((l, i) => {
    if (!/משתנ/.test(l)) return;
    if (/(?<![\d.%/])[1-9](?![\d.%/])/.test(l.replace(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/g, ""))) counted = true;
    for (const x of lines.slice(Math.max(0, i - 1), i + 4).join(" ").matchAll(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/g)) dates.add(x[0]);
  });
  // the report's own date ("31.12.2025", the day the details were drawn up) is not a change
  return { counted, dates: [...dates].filter((d) => !/^31[./]12[./]/.test(d)) };
}

/** "1.1.24", "01.01.2024", "01/01/2024" against "2024-01-01". */
export function sameDay(printed: string, iso: string): boolean {
  const [d, m, y] = printed.split(/[./]/).map(Number) as [number, number, number];
  const year = y < 100 ? 2000 + y : y;
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` === iso;
}

function libraryText(url: string): string | null {
  const bare = url.split("#")[0];
  const index = readFileSync(join(root, "research/library/index.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as { id: string; url?: string; text?: string });
  const hit = index.find((e) => e.url && e.url.split("#")[0] === bare && e.text === "ok");
  if (!hit) return null;
  const file = join(store, `${hit.id}.txt`);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

const num = /(?:[-−]\s?)?\d+(?:\.\d+)?/g;
const toNum = (t: string) => Number(t.replace(/[-−]\s?/, "-"));

/**
 * S2 (pass 5): the fund's row and its index's row of the returns table, each in column order, so a figure is tied to its year and not
 * only found somewhere on the page. An Israeli annual report prints, per period, the standard deviation then the return, in the rows
 * "מחירי הקרן" and the tracking asset's under "נכס המעקב"; a factsheet or key information document prints a row of years and under it
 * the fund's row and the index's (a market-price row left out), a young fund's row filling only the last years. Null when not found.
 */
export function returnRows(page: string): { fund: number[][]; index: number[][]; israeli: boolean } | null {
  const lines = page.replace(bidi, "").split("\n");
  const at = lines.findIndex((l) => /סטיות\s*תקן\s*ונתוני/.test(l));
  if (at >= 0) {
    const rows = lines.slice(at + 1, at + 25);
    const fundAt = rows.findIndex((l) => (l.match(num) ?? []).length >= 2 && /%/.test(l));
    if (fundAt < 0) return null;
    const fundNums = rows[fundAt]!.match(num)!.map(toNum);
    const width = fundNums.length;
    const trackAt = rows.findIndex((l, i) => i > fundAt && /נכס\S*\s*(?:ה)?מעקב|המעקב/.test(l));
    const idxLine = rows.find((l, i) => i >= (trackAt < 0 ? fundAt + 1 : trackAt) && i > fundAt && (l.match(num) ?? []).length >= width);
    if (!idxLine) return null;
    const idxNums = idxLine.match(num)!.slice(0, width).map(toNum);
    // the returns are one of each pair (deviation, return); a table of returns alone is the whole row
    const decode = (xs: number[]) => [xs.filter((_, i) => i % 2 === 1), xs.filter((_, i) => i % 2 === 0), xs];
    return { fund: decode(fundNums), index: decode(idxNums), israeli: true };
  }
  const head = lines.findIndex((l) => /^\s*((19|20)\d\d\s+){2,}(19|20)\d\d\s*$/.test(l));
  if (head < 0) return null;
  const years = lines[head]!.trim().split(/\s+/).length;
  const rows = lines
    .slice(head + 1, head + 8)
    .filter((l) => !/Market\s*Price/i.test(l))
    .map((l) => (l.replace(/^\s*[A-Za-z][A-Za-z ]*?(?=\s+[-−\d])/, "").match(num) ?? []).slice(0, years).map(toNum))
    .filter((r) => r.length >= 2);
  if (rows.length < 2) return null;
  const pad = (r: number[]) => [...Array<number>(years - r.length).fill(NaN), ...r];
  return { fund: [pad(rows[0]!)], index: [pad(rows[1]!)], israeli: false };
}

/** The column of each year: the years, oldest first, in consecutive columns, every year's two figures in its own column. */
export function yearsInColumns(t: { years: Year[] }, rows: { fund: number[][]; index: number[][]; israeli: boolean }, printed: number[]): boolean {
  const ys = [...t.years].sort((a, b) => a.year - b.year);
  for (let d = 0; d < rows.fund.length; d++) {
    const fund = rows.fund[d]!, index = rows.index[d]!;
    // an Israeli report sets the full years together, a part year before them, after them or both (1209444); a factsheet's years are its head's own
    const offsets = rows.israeli ? [...Array(Math.max(0, fund.length - ys.length + 1)).keys()] : [fund.length - printed.length + printed.indexOf(ys[0]!.year)];
    for (const o of offsets) if (o >= 0 && ys.every((y, k) => fund[o + k] === y.fund_pct && index[o + k] === y.tracking_pct)) return true;
  }
  return false;
}

type Fee = "fixed" | "variable" | "trustee";

/**
 * The table "הוצאות שנפרעו מנכסי הקרן": each fee's figure under each full year of the head, by where it stands on the line (the text
 * layer keeps the columns), so a fee is tied to its year and its row, not only found somewhere on the page (independent check of pass 5:
 * fees of two years swapped, or a printed 0.07% recorded as 0, passed the page-only check). "-" and "*" read as 0. A row whose figures
 * the text layer set on the line above its label (often one wrapped label) is read from that line. A cell not read is left out.
 */
export function feeColumns(page: string): Record<Fee, Map<number, number>> {
  const lines = page.replace(bidi, "").split("\n");
  const start = lines.findIndex((l) => /הוצ\s*אות\s*שנפרעו|הוצאות\s*שנפרעו/.test(l));
  const cols: { pos: number; year: number | null }[] = [];
  for (let i = Math.max(0, start); i < start + 7 && i < lines.length; i++) {
    const l = lines[i]!;
    if (/%/.test(l)) break;
    const dates = /\d{1,2}[./]\d{1,2}[./]20\d\d/g;
    for (const m of l.matchAll(dates)) cols.push({ pos: m.index + m[0].length / 2, year: null });
    // a year the text layer split ("202 4") is joined; a date's year is a part year's column, not a full year
    for (const m of l.replace(dates, (s) => " ".repeat(s.length)).replace(/(?<![\d.])(20\d) (\d)(?![\d.])/g, "$1$2 ").matchAll(/(?<![\d.])(20\d\d)(?![\d.])/g))
      cols.push({ pos: m.index + 2, year: Number(m[1]) });
  }
  const out: Record<Fee, Map<number, number>> = { fixed: new Map(), variable: new Map(), trustee: new Map() };
  if (start < 0 || !cols.some((c) => c.year)) return out;
  // a line of figures only: no Hebrew word (a stray glyph of the PDF's may trail it)
  const figures = (l: string) => /\d\s?%/.test(l) && !/[\u0590-\u05FF]/.test(l);
  const labels: [Fee, RegExp][] = [["fixed", /קבועים|שכר מנהל הקרן\s*$/], ["variable", /משתנים/], ["trustee", /נאמן/]];
  for (const [fee, re] of labels) {
    const at = lines.findIndex((l, k) => k > start && re.test(l));
    if (at < 0) continue;
    let line = lines[at]!;
    if (!/\d\s?%|\s-\s|\*/.test(line)) {
      let k = at - 1;
      while (k > start && !lines[k]!.trim()) k--;
      if (!figures(lines[k]!)) continue;
      line = lines[k]!;
    }
    for (const m of line.matchAll(/(\^?\s?-?\d+(?:\.\d+)?%)|((?<=\s)-(?=\s|$))|(\*(?=\s|$))/g)) {
      const p = m.index + m[0].length / 2;
      const c = cols.reduce((a, x) => (Math.abs(x.pos - p) < Math.abs(a.pos - p) ? x : a));
      if (c.year === null || Math.abs(c.pos - p) > 14 || out[fee].has(c.year)) continue;
      out[fee].set(c.year, m[1] ? Number(m[1].replace(/[\^\s%]/g, "")) : 0);
    }
  }
  return out;
}

const records: Rec[] = readdirSync(join(root, "data/funds"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(root, "data/funds", f), "utf8")) as Rec)
  .filter((r) => r.tracking_record);

/**
 * S1 (pass 5): the records whose source is not in the library as text, each by name with its reason. The list only shrinks; any other
 * record without its text fails, so no record skips silently.
 */
const EXCUSED: Record<string, string> = {
  "us-voo": "Vanguard's fund page, a web page whose figures load by script; read by the lead (8dd1f013:research/audit/2026-11-07-indices-data/voo-read-by-lead.md)",
};

describe.skipIf(!hasLibrary)("tracking records against their reports in the library", () => {
  it("reads the years a report prints", () => {
    expect(printedYears("תשואות, סטיות תקן ונתוני השוואה - לפי תקופות\n 2023 2024 2025 מ 01.01.2026-עד\n 30.06.2026\n 3.81% 4.07%")).toEqual([2023, 2024, 2025]);
    expect(printedYears("סטיות תקן ונתוני השוואה\n מ 06.12.2024 -עד מ 01.01.2025 -עד\n 31.12.2024 31.12.2025\n -2.63% 18.20%")).toEqual([2025]);
    expect(printedYears("סטיות תקן ונתוני השוואה\n מ 130.01.2024-עד 2025\n 31.12.2024\n 19.86% 2.64%")).toEqual([2025]);
    expect(printedYears("CALENDAR YEAR\n   2021   2022   2023   2024   2025\n Management Fee 0.03%\n NAV 28.66 -18.13 26.27 24.98 17.85")).toEqual([2021, 2022, 2023, 2024, 2025]);
    expect(printedYears("   2016   2017   2018   2019   2020   2021\nFund\n   18.0%   28.4%")).toEqual([2020, 2021]);
  });

  // MTF TA-90 1150259's returns table (annual report 30.06.2026, p. 6), as the library holds it
  const mtf = "סטיות תקן ונתוני השוואה – לפי תקופות\n 2023 2024 2025 1.1.26-30.6.26\n סטיית תשואה סטיית תקן& תשואה\n 22.49% 3.91% 17.28% 30.26% 21.62% 45.67% 23.77% -0.02% מחירי הפדיון של הקרן *\n נכס המעקב של הקרן :)2 )1\n 22.49% 4.27% 17.29% 30.86% 21.62% 46.56% 23.77% 0.28% מדד ת\"א90 -";
  const mtfYears = [
    { year: 2025, fund_pct: 45.67, tracking_pct: 46.56 },
    { year: 2024, fund_pct: 30.26, tracking_pct: 30.86 },
    { year: 2023, fund_pct: 3.91, tracking_pct: 4.27 },
  ];
  it("ties each year's two figures to that year's column (S2)", () => {
    const rows = returnRows(mtf)!;
    expect(yearsInColumns({ years: mtfYears }, rows, [2023, 2024, 2025])).toBe(true);
    // the same figures under swapped year labels fail, though every figure is on the page
    const swapped = mtfYears.map((y, i) => ({ ...y, year: [2023, 2024, 2025][i]! }));
    expect(yearsInColumns({ years: swapped }, rows, [2023, 2024, 2025])).toBe(false);
    // a factsheet: the fund's row fills only the last years
    const sheet = "   2016   2017   2018   2019   2020   2021\nFund\n   18.0%   28.4%\nIndex\n   17.8%   28.2%";
    expect(yearsInColumns({ years: [{ year: 2021, fund_pct: 28.4, tracking_pct: 28.2 }, { year: 2020, fund_pct: 18, tracking_pct: 17.8 }] }, returnRows(sheet)!, [2020, 2021])).toBe(true);
    expect(yearsInColumns({ years: [{ year: 2020, fund_pct: 28.4, tracking_pct: 28.2 }, { year: 2021, fund_pct: 18, tracking_pct: 17.8 }] }, returnRows(sheet)!, [2020, 2021])).toBe(false);
  });
  it("ties each fee charged to its year's column and its row (independent check of pass 5)", () => {
    // MTF TA-90 1150259's table of fees charged (p. 8), as the library holds it: the variable fee's figures sit on the line above its label
    const fees =
      "           פרק ה' :הוצאות שנפרעו מנכסי הקרן )1כשיעור מהשווי הנקי הממוצע של נכסי הקרן)2\n\n\n\n" +
      "                 2023              2024               2025         @@1.1.26-30.6.26                                                      סוג ההוצאה\n" +
      "               0.45%              0.45%             0.60%               0.30%                                      שכר מנהל הקרן  -דמי ניהול קבועים\n" +
      "               0.10%              0.10%             0.07%               0.01%                                  \uf0bb\n" +
      "                                                                                                                שכר מנהל הקרן  -דמי ניהול משתנים\n" +
      "              0.0054%            0.005%            0.005%              0.002%                                                          שכר הנאמן";
    const c = feeColumns(fees);
    expect([...c.fixed]).toEqual([[2023, 0.45], [2024, 0.45], [2025, 0.6]]);
    expect([...c.variable]).toEqual([[2023, 0.1], [2024, 0.1], [2025, 0.07]]);
    expect([...c.trustee]).toEqual([[2023, 0.0054], [2024, 0.005], [2025, 0.005]]);
    // a split year in the head, "-" and "*" as 0, a negative variable fee
    const split = "הוצאות שנפרעו מנכסי הקרן\n      2022        202 4       2025      סוג ההוצאה\n     0.00%       0.31%      ^-0.11%      דמי ניהול משתנים\n       -           *         0.02%      שכר הנאמן";
    const s = feeColumns(split);
    expect([...s.variable]).toEqual([[2022, 0], [2024, 0.31], [2025, -0.11]]);
    expect([...s.trustee]).toEqual([[2022, 0], [2024, 0], [2025, 0.02]]);
  });
  it("catches a year dropped from both `years` and `years_printed`, which the validator alone passes (S4)", () => {
    const printed = printedYears(mtf)!;
    const dropped = { years: mtfYears.filter((y) => y.year !== 2023), years_printed: [2024, 2025] };
    expect(dropped.years_printed).not.toEqual(printed);
    expect(printed).toEqual([2023, 2024, 2025]);
  });

  it("has the text of every record's source, or names the record's excuse (S1)", () => {
    const missing = records.filter((r) => !libraryText(r.tracking_record!.source.url) && !EXCUSED[r.id]).map((r) => r.id);
    expect(missing, "records whose source is not in the library: file it with library.mjs add").toEqual([]);
    const stale = Object.keys(EXCUSED).filter((id) => !records.some((r) => r.id === id) || libraryText(records.find((r) => r.id === id)!.tracking_record!.source.url));
    expect(stale, "excused records that are now in the library or gone: remove them from EXCUSED").toEqual([]);
  });

  for (const r of records.filter((x) => !EXCUSED[x.id])) {
    const t = r.tracking_record!;
    it(`${r.id}: every full year the report prints, each year's figures in its own column, and the fees charged on their page`, () => {
      const text = libraryText(t.source.url);
      expect(text, `${r.id}: the source is not in the library`).not.toBeNull();
      const pages = text!.split("\f");
      const page = t.page ? pages[t.page - 1]! : text!;
      // a minus the PDF's text layer set apart from its figure ("*- 21.78%") still counts
      const numbers = new Set([...page.replace(bidi, "").matchAll(num)].map((m) => toNum(m[0])));
      for (const y of t.years) {
        expect(numbers.has(y.fund_pct), `${r.id} ${y.year}: the fund's ${y.fund_pct} is not on page ${t.page}`).toBe(true);
        expect(numbers.has(y.tracking_pct), `${r.id} ${y.year}: the index's ${y.tracking_pct} is not on page ${t.page}`).toBe(true);
      }
      const printed = printedYears(page);
      expect(printed, `${r.id}: no returns table read on page ${t.page}`).not.toBeNull();
      expect(t.years_printed, `${r.id}: the report on page ${t.page} prints ${printed!.join(", ")}`).toEqual(printed);
      const rows = returnRows(page);
      expect(rows, `${r.id}: the fund's and the index's rows not read on page ${t.page}`).not.toBeNull();
      expect(yearsInColumns(t, rows!, printed!), `${r.id}: a year's figures are not in that year's column on page ${t.page}`).toBe(true);
      // F-92 (b): each fee charged, as printed, on the page of "הוצאות שנפרעו מנכסי הקרן"
      if (t.fees_page) {
        const fp = pages[t.fees_page - 1]!.replace(bidi, "");
        expect(fp, `${r.id}: page ${t.fees_page} is not the table of fees charged`).toMatch(/הוצ\s*אות\s*שנפרעו|הוצאות\s*שנפרעו/);
        const pct = new Set([...fp.matchAll(/((?:[-−]\s?)?\d+(?:\.\d+)?)\s?%/g)].map((m) => toNum(m[1]!)));
        const cells = feeColumns(fp);
        for (const y of t.years)
          for (const [k, v] of Object.entries(y.fees_charged ?? {}) as [Fee, number][]) {
            const read = cells[k].get(y.year);
            // tied to its year's column and its row where the text layer allows; else at least on the page
            if (read !== undefined) expect(v, `${r.id} ${y.year}: the ${k} fee is ${read}% under ${y.year} on page ${t.fees_page}`).toBe(read);
            else if (v !== 0) expect(pct.has(v), `${r.id} ${y.year}: the ${k} fee ${v}% is not on page ${t.fees_page}`).toBe(true);
          }
        // pass 6: a footnote saying the table leaves the negative variable fees out ("לא מקבל ביטוי") is the record's variable_positive_only
        expect(!!t.variable_positive_only, `${r.id}: page ${t.fees_page} ${positiveOnly(fp) ? "says" : "does not say"} its variable fees are the positive ones only`).toBe(positiveOnly(fp));
      }
      // F-92 (b), pass 6: the table "שינויים במאפייני הקרן" dates a change of the variable rate exactly where the record does
      if (t.changes_page) {
        const cp = pages[t.changes_page - 1]!.replace(bidi, "");
        expect(cp, `${r.id}: page ${t.changes_page} is not the table of changes`).toMatch(/מהות\s*השינוי/);
        const seen = variableChanges(cp);
        if (t.variable_rate_since === null) expect(seen, `${r.id}: page ${t.changes_page} shows a change of the variable fee; variable_rate_since is null`).toEqual({ counted: false, dates: [] });
        else if (t.variable_rate_since) expect(seen.dates.some((d) => sameDay(d, t.variable_rate_since!)), `${r.id}: ${t.variable_rate_since} is not a date of the variable fee's change on page ${t.changes_page} (${seen.dates.join(", ")})`).toBe(true);
      }
    });
  }
});
