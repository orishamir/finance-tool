// CMA adapter: gemelnet and pensia-net monthly datasets (data.gov.il).
// docs/architecture.md section 3.3: fetch -> archive -> normalise -> validate -> diff -> write.
// The pure functions (parseCsv, decodeWindows1255, normalise, sanityCheck, diffFiles)
// do no I/O; fetch, archive and write are at the bottom.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { cmaPeriodFile, isReligiousLaw, type CmaPeriodFile } from "@finance-tool/schema";

export type CmaDataset = CmaPeriodFile["dataset"];
export type CmaFund = CmaPeriodFile["funds"][number];

export interface DatasetConfig {
  dataset: CmaDataset;
  /** Hebrew title prefix used in source.title, as the hand-made snapshots wrote it. */
  heTitle: string;
  datasetUuid: string;
  resourceId: string;
}

export const DATASETS: DatasetConfig[] = [
  {
    dataset: "gemelnet",
    heTitle: "גמל נט",
    datasetUuid: "5265b154-c2e2-4f3d-a22e-fba593240d9a",
    resourceId: "a30dcbea-a1d2-482c-ae29-8f781f5025fb",
  },
  {
    dataset: "pensia-net",
    heTitle: "פנסיה נט",
    datasetUuid: "3a1ca8fa-738b-4890-b52f-e8f7ce1e6145",
    resourceId: "6d47d6b5-cb08-488b-b333-f1e717b1e1bd",
  },
];

/**
 * The dataset page. data.gov.il's new portal addresses a dataset as /he/datasets/<organization>/<name>; the old
 * /dataset/<name> now ends on a "page not found" (found). Both datasets belong to the CMA (the `organization.name`
 * of the portal's package_show answer).
 */
export const datasetPageUrl = (c: DatasetConfig): string => `https://data.gov.il/he/datasets/cma/${c.dataset}`;

export const downloadUrl = (c: DatasetConfig): string =>
  `https://data.gov.il/dataset/${c.datasetUuid}/resource/${c.resourceId}/download/file.csv`;

export const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Pipeline configuration (not site parameters): the sanity thresholds.
export const SANITY = { minRowRatio: 0.8, maxDisappearedFundRatio: 0.2 } as const;

/**
 * A kind of fund the investment-tracks circular's "קופת גמל" leaves out (CAT-19, circular 2022-9-30 p.3 s.2), so a general track of it is
 * not closed by the circular: a sick-pay fund, a self-directed fund, a guaranteed-yield fund ("קופת גמל מבטיחת תשואה", as the
 * management-fee regulations define it), or the Leumi employees' provident funds the definition names.
 */
export type FundOutsideCircular = "sick-pay" | "self-directed" | "guaranteed-yield" | "leumi-employees";

/**
 * What the circular makes of a general investment track: closed to members who were not in it on its start date (s.3(ד)); not closed
 * by it, its fund being of a kind s.2 leaves out; or unsettled, where the track may be in such a fund and that is not yet read. An
 * unsettled track is kept, since only a reading drops one.
 */
export type GeneralTrackReading =
  | { name: string; cat19: "closed" }
  | { name: string; cat19: "outside"; fund: FundOutsideCircular }
  | { name: string; cat19: "unsettled"; mayBe: FundOutsideCircular };

/** The columns of a regulator row that say whether it is a general track. */
export interface TrackRow {
  name: string;
  classification: string;
  specialization: string;
}

/** A dataset's general tracks: which rows are general tracks, and the CAT-19 reading of each, by fund id. */
export interface GeneralTracks {
  isGeneral: (row: TrackRow) => boolean;
  readings: ReadonlyMap<number, GeneralTrackReading>;
}

const closed = (name: string): GeneralTrackReading => ({ name, cat19: "closed" });
const outside = (name: string, fund: FundOutsideCircular): GeneralTrackReading => ({ name, cat19: "outside", fund });
const unsettled = (name: string, mayBe: FundOutsideCircular): GeneralTrackReading => ({ name, cat19: "unsettled", mayBe });

/** Gemel-Net's classification for a provident fund for annuity, which has none of its own (PEN). */
export const GEMEL_ANNUITY_CLASSIFICATION = "תגמולים ואישית לפיצויים";

/** A Pension-Net name whose last word is "כללי" ("פנסיה כללית", the general fund itself, is not). */
export const endsInGeneral = (name: string): boolean => /(?:^|[\s\-])כללי\s*$/.test(name);

/**
 * The general tracks of each dataset and their CAT-19 readings, each read in the regulator's 202609 file. Pension-Net has no
 * specialization column, so a name ending in "כללי" marks a candidate; that is not enough by itself, since an age or specialised track can
 * carry the word, and each listed one was checked to be a general track in the circular's sense. In Gemel-Net the circular's general tracks
 * are those of provident funds for annuity: classification "תגמולים ואישית לפיצויים", specialization "כללי"; the study funds and the
 * provident funds for investing it does not cover. A refresh reports a general track with no reading, so none is dropped or kept without
 * one. `closedTrack` leaves out the closed ones; an unsettled one stays until it is read.
 */
export const GENERAL_TRACKS: Readonly<Record<CmaDataset, GeneralTracks>> = {
  "pensia-net": {
    isGeneral: (r) => endsInGeneral(r.name),
    readings: new Map([
      [2002, closed("כלל פנסיה כללי")],
      [2009, closed("מנורה מבטחים פנסיה - כללי")],
      [2102, closed("מגדל מקפת אישית כללי")],
      [2145, closed("מגדל מקפת משלימה כללי")],
      [2164, closed("הראל פנסיה כללית - כללי")],
      [2172, closed("הראל פנסיה - גילעד כללי")],
      [2176, closed("כלל פנסיה משלימה - כללי")],
      [2177, closed("הראל פנסיה - מנוף כללי")],
    ]),
  },
  gemelnet: {
    isGeneral: (r) => r.classification.trim() === GEMEL_ANNUITY_CLASSIFICATION && r.specialization.trim() === "כללי",
    readings: new Map([
      // each sits in a family of guaranteed-yield tracks (119 beside 530 to 532; 260 beside 533 and 536; 263 beside 539; 923 beside 120
      // and 529), and whether its fund is a guaranteed-yield fund is not yet read
      [119, unsettled("מנורה מבטחים יותר מסלול ד'", "guaranteed-yield")],
      [260, unsettled("מנורה מבטחים אמיר כללי", "guaranteed-yield")],
      [263, unsettled("בר קרן גמולים קופת גמל לתגמולים ופיצויים בניהול כלל גמל בע\"מ", "guaranteed-yield")],
      [923, unsettled("מיטב בטחון", "guaranteed-yield")],
      // named by the circular's definition; its company is also one EXCLUDED_COMPANIES leaves out (520005497)
      [229, outside("קופת התגמולים של עובדי בנק לאומי", "leumi-employees")],
      [857, outside("הראל - דקל קופת גמל לדמי מחלה", "sick-pay")],
      [872, outside("אלטשולר שחם מרפא קופה מרכזית לדמי מחלה", "sick-pay")],
      [1008, outside("הפניקס קופה לתשלום דמי מחלה", "sick-pay")],
      [1161, outside("מקפת דמי מחלה", "sick-pay")],
      [1486, outside("מיטב גמל בניהול אישי", "self-directed")],
      [1514, outside("סלייס גמל בניהול אישי", "self-directed")],
      [1541, outside("גלובל נט גמל IRA", "self-directed")],
      [2023, outside("הפניקס גמל בניהול אישי", "self-directed")],
      [2098, outside("גלובל נט גמל בניהול אישי", "self-directed")],
      [8888, outside("מגדל לתגמולים בניהול אישי IRA", "self-directed")],
      [14938, outside("אקטיון גמל  IRA", "self-directed")],
      [15367, outside("מנורה מבטחים גמל בניהול אישי IRA", "self-directed")],
    ]),
  },
};

/**
 * A track closed to joiners, left out with those companies: the regulator marks it as for workers of
 * one sector or body, or its name says it is for those already entitled to an annuity on a past date (the regulator's list
 * of investment tracks), or it is a general track CAT-19 closes (`GENERAL_TRACKS`).
 */
export const closedTrack = (population: string, name: string, dataset?: CmaDataset, fundId?: number): boolean =>
  population.trim().startsWith("עובדי ") ||
  /קצבה קיימים|זכאים קיימים/.test(name) ||
  (dataset !== undefined && fundId !== undefined && GENERAL_TRACKS[dataset].readings.get(fundId)?.cat19 === "closed");


/**
 * Managing companies left out of the data, by legal id (43 companies): their funds serve one
 * profession, employer or municipality, or are otherwise not relevant to the site's readers. A refresh skips their rows, and they
 * are not to be collected or researched. docs/product.md D51.
 */
export const EXCLUDED_COMPANIES: ReadonlyMap<string, string> = new Map([
  ["510930654", "יחד רופאים"],
  ["570002618", "תגמולים של עובדים בעירית ת\"א-יפו"],
  ["570005959", "קופת\"ג של עובדי עירית חיפה"],
  ["570014928", "קופת תגמולים של עובדי התעשיה האוירית"],
  ["520030198", "ק.ה.ר, קרן השתלמות לרוקחים"],
  ["512362914", "מחוג, מינהל גמל לעובדי חברת חשמל"],
  ["510960586", "חברת הגמל לעובדי האוניברסיטה העברית"],
  ["520027954", "קרן השתלמות לאקדמאים במדעי החברה והרוח"],
  ["520031824", "רום, קרן ההשתלמות לעובדי הרשויות המקומיות"],
  ["520028861", "קרן השתלמות למשפטנים"],
  ["520005497", "קופות התגמולים והפיצויים של עובדי בנק לאומי"],
  ["520030743", "קרן השתלמות לשופטים"],
  ["513452003", "קופות גמל של העובדים בעיריית תל אביב יפו"],
  ["510930670", "יהב פ.ר.ח."],
  ["520042615", "מחר"],
  ["520030941", "ק.ל.ע., קרן השתלמות לעובדים סוציאליים"],
  ["570009852", "קרן מקפת מרכז לפנסיה ותגמולים"],
  ["511033060", "קרן החסכון לצבא הקבע"],
  ["520042581", "עמ\"י, קופות גמל ענפיות"],
  ["520027251", "קרנות השתלמות למורים ולגננות"],
  ["520024985", "עגור"],
  ["520028390", "קרנות השתלמות למורים תיכוניים, מורי סמינרים ומפקחים"],
  ["512711409", "גל, קופות גמל לעובדי הוראה"],
  ["520032269", "קרן ההשתלמות לעובדי המדינה"],
  ["510806870", "רעות"],
  ["520027715", "מנורה מבטחים והסתדרות המהנדסים"],
  ["510927536", "יהב אחים ואחיות"],
  ["520028556", "קרן ההשתלמות להנדסאים וטכנאים"],
  ["512008335", "קו הבריאות"],
  ["520030990", "קרן ההשתלמות לפקידים, עובדי המנהל והשירותים"],
  ["520030693", "שיבולת"],
  ["510773922", "ארם גמולים"],
  ["570011767", "קופת תגמולים של עובדי אל על"],
  ["520042607", "הנדסאים וטכנאים, קופות גמל"],
  ["510142789", "חברת ב'ת למ'ד דל'ת"],
  ["520034968", "קרן השתלמות של עובדי חברת החשמל"],
  ["570009449", "עוצ\"מ, אגודה שיתופית"],
  ["520029620", "קרן השתלמות לביוכימאים ומקרוביולוגים"],
  ["520042573", "עו\"ס"],
  ["570007476", "קרן ביטוח ופנסיה לפועלים חקלאים"],
  ["520031659", "עוצ\"מ, קופות גמל והשתלמות"],
  ["510694821", "לאומי קמ\"פ"],
  ["570005850", "קרן הביטוח והפנסיה של פועלי בנין"],
]);

export const REQUIRED_COLUMNS = [
  "FUND_ID",
  "FUND_NAME",
  "FUND_CLASSIFICATION",
  "CONTROLLING_CORPORATION",
  "MANAGING_CORPORATION",
  "REPORT_PERIOD",
  "INCEPTION_DATE",
  "AVG_ANNUAL_MANAGEMENT_FEE",
  "AVG_DEPOSIT_FEE",
  "MANAGING_CORPORATION_LEGAL_ID",
] as const;

/** Columns only gemelnet carries; pensia-net has none of them and the snapshot stores "" (hand collection). */
export const GEMEL_ONLY_COLUMNS = ["TARGET_POPULATION", "SPECIALIZATION", "SUB_SPECIALIZATION"] as const;

/**
 * Amount columns kept when the file has them (D34, the company page's exposure rings, F-87 and F-88). Not required: a file
 * without them still writes, and its funds carry no `holdings`. NIS millions at the period end (CAT-03, research note).
 */
export const HOLDINGS_COLUMNS = ["TOTAL_ASSETS", "STOCK_MARKET_EXPOSURE", "FOREIGN_CURRENCY_EXPOSURE"] as const;

/**
 * Further columns kept as received in `raw_fields`, for later use: no page reads them and none has a value
 * object yet; a page that shows one first gives it a value object as `buildHoldings` does. Past returns among them are history,
 * never a ranking key (product.md section 2). Pension-net names its monthly deposits MONTHLY_DEPOSITS.
 */
export const KEPT_COLUMNS = [
  "FOREIGN_EXPOSURE",
  "LIQUID_ASSETS_PERCENT",
  "DEPOSITS",
  "MONTHLY_DEPOSITS",
  "WITHDRAWLS",
  "INTERNAL_TRANSFERS",
  "NET_MONTHLY_DEPOSITS",
  "MONTHLY_YIELD",
  "YEAR_TO_DATE_YIELD",
  "YIELD_TRAILING_3_YRS",
  "YIELD_TRAILING_5_YRS",
  "AVG_ANNUAL_YIELD_TRAILING_3YRS",
  "AVG_ANNUAL_YIELD_TRAILING_5YRS",
  "STANDARD_DEVIATION",
  "ALPHA",
  "SHARPE_RATIO",
] as const;

/** Text columns checked for replacement characters (decode failure). */
const TEXT_COLUMNS = [
  "FUND_NAME",
  "FUND_CLASSIFICATION",
  "CONTROLLING_CORPORATION",
  "MANAGING_CORPORATION",
  "TARGET_POPULATION",
  "SPECIALIZATION",
  "SUB_SPECIALIZATION",
] as const;

// ---------- pure: decode and parse ----------

export function decodeWindows1255(bytes: Uint8Array): string {
  return new TextDecoder("windows-1255").decode(bytes);
}

/** RFC 4180 CSV: quoted fields, "" escapes, CRLF or LF. Returns rows of cells. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1;
  for (; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export const sha256Hex = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
/** gzip with the header mtime left at 0, so the same bytes always give the same archive. */
export const gzipRaw = (bytes: Uint8Array): Buffer => gzipSync(bytes, { level: 9 });

// ---------- pure: normalise ----------

export interface NormaliseContext {
  config: DatasetConfig;
  runDate: string; // YYYY-MM-DD
  sha256: string;
  /** Value of the HTTP Last-Modified header as ISO 8601, when the server sent one. */
  lastModified?: string | null;
}

export interface NormaliseResult {
  /** The latest REPORT_PERIOD in the CSV as YYYYMM, or null when it could not be read. */
  period: string | null;
  /** Number of CSV rows of that period. */
  rowCount: number;
  file: CmaPeriodFile | null;
  /** Failures that make the run a "sanity failed". */
  problems: string[];
}

const FEE_FIELDS = [
  {
    key: "avg_annual_management_fee",
    raw: "AVG_ANNUAL_MANAGEMENT_FEE",
    heName: "שיעור דמי ניהול ממוצעת שנתי – נכסים",
    unit: "pct_per_year",
  },
  { key: "avg_deposit_fee", raw: "AVG_DEPOSIT_FEE", heName: "שיעור דמי ניהול ממוצעת- הפקדות", unit: "pct_of_deposit" },
] as const;

/** The calendar year a fee average of a report period belongs to: the year before (CAT-36). */
export const feeYear = (reportPeriod: string): number => Number(reportPeriod.slice(0, 4)) - 1;

/** The product types whose fee regulation (reg. 4) has no deposit-fee item (PF-06), as the data's FUND_CLASSIFICATION names them. */
const BALANCE_ONLY_CLASSIFICATIONS = new Set(["קרנות השתלמות", "מרכזית לפיצויים", "מטרה אחרת"]);
/** An IRA fund is reported as a fund of its own whose name says so (IRA-03, IRA-04): 15 funds in 202609, all matched by this. */
const IRA_NAME = /בניהול אישי|\bIRA\b/i;

/**
 * Whether the fund is of a type that may charge a fee from the balance only, so an empty deposit-fee average is the rule, not a
 * gap (PF-06: study funds, IRA funds, central funds and other-purpose funds). Sick-pay funds the data files under tagmulim are
 * left out: only their names say what they are, and PF-06's record does not name them.
 */
export function balanceFeeOnly(fund: Partial<Pick<CmaFund, "fund_classification" | "names">>): boolean {
  if (fund.fund_classification && BALANCE_ONLY_CLASSIFICATIONS.has(fund.fund_classification)) return true;
  return (fund.names?.cma ?? []).some((n) => IRA_NAME.test(n));
}

/** CMA fee fields to value objects (data-schema 3.13; CAT-35 to CAT-39, CAT-06). Pure. */
export function buildFees(
  file: Pick<CmaPeriodFile, "dataset" | "report_period" | "checked" | "source">,
  fund: Pick<CmaFund, "raw_fields" | "inception_date"> & Partial<Pick<CmaFund, "fund_classification" | "names">>,
): CmaFund["fees"] {
  const config = DATASETS.find((d) => d.dataset === file.dataset)!;
  const year = feeYear(file.report_period);
  const pension = file.dataset === "pensia-net";
  const ruleIds = ["CAT-35", "CAT-36", "CAT-37", "CAT-06", ...(pension ? ["CAT-39"] : [])];
  const make = (f: (typeof FEE_FIELDS)[number]) => {
    const rawText = (fund.raw_fields[f.raw] ?? "").trim();
    const n = rawText === "" ? null : Number(rawText);
    const value = n !== null && Number.isFinite(n) ? n : null;
    let notes: string;
    let ruleIdsHere = ruleIds;
    if (value === null && f.key === "avg_deposit_fee" && file.dataset === "gemelnet" && balanceFeeOnly(fund)) {
      // the rule is in rule_ids, which the sheet shows as a chip; an id inside the Hebrew sentence broke across lines
      notes = "אין דמי ניהול מהפקדה בסוג הקופה הזה: התקנות מתירות דמי ניהול מהיתרה בלבד, ולכן השדה ריק גם בנתוני רשות שוק ההון.";
      ruleIdsHere = [...ruleIds, "PF-06"];
    } else if (value === null) {
      const incYear = fund.inception_date ? Number(fund.inception_date.slice(0, 4)) : null;
      const young = incYear !== null && incYear >= year;
      const why = young
        ? `למסלול אין עדיין שנה קלנדרית מלאה (נפתח ${fund.inception_date})`
        : f.key === "avg_annual_management_fee"
          ? "הסיבה לא ידועה (CAT OQ22)"
          : "הסיבה לא ידועה";
      notes = `לא דווח: ${why}.`;
    } else {
      const what = f.key === "avg_annual_management_fee" ? "מהנכסים" : "מההפקדות";
      notes = `ממוצע דמי הניהול ${what} שנגבו בפועל מכלל העמיתים בשנת ${year} (השנה הקלנדרית האחרונה שהסתיימה); לא מחיר מחירון ולא מה שעמית מסוים משלם. שיטת השקלול לא פורסמה (CAT OQ2).`;
      if (pension) notes += " הערך לקרן כולה, לא למסלול (CAT-39).";
      if (value < 0) notes += " ערך שלילי כפי שדווח; ייתכן שמשקף החזר, ואינו מחיר.";
    }
    return {
      value,
      unit: f.unit,
      source: {
        url: file.source.url,
        title: `${config.heTitle}, resource 2024-today, field ${f.raw} ("${f.heName}"), REPORT_PERIOD ${file.report_period.replace("-", "")}`,
        publisher: file.source.publisher,
        strength: "primary" as const,
      },
      checked: file.checked,
      effective_from: `${year}-01-01`,
      effective_to: `${year}-12-31`,
      tax_year: null,
      update_rule: "market" as const,
      rule_ids: ruleIdsHere,
      state: "sourced" as const,
      notes,
    };
  };
  return { avg_annual_management_fee: make(FEE_FIELDS[0]), avg_deposit_fee: make(FEE_FIELDS[1]) };
}

const HOLDINGS_FIELDS = [
  { key: "total_assets", raw: "TOTAL_ASSETS", heName: "סך נכסים" },
  { key: "stock_market_exposure", raw: "STOCK_MARKET_EXPOSURE", heName: "חשיפה לשוק המניות" },
  { key: "foreign_currency_exposure", raw: "FOREIGN_CURRENCY_EXPOSURE", heName: "חשיפה למט\"ח" },
] as const;

/** The last day of a report period, "2026-09" -> "2026-09-30". */
const periodEnd = (period: string): string => {
  const [y, m] = period.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};

/**
 * CMA amount fields to value objects, in NIS millions at the period end (CAT-03 for the unit of TOTAL_ASSETS; the units of
 * STOCK_MARKET_EXPOSURE and FOREIGN_CURRENCY_EXPOSURE are read the same way, inferred: the dictionary does not state them, CAT OQ4).
 * Undefined when the file has none of the columns. Pure.
 */
export function buildHoldings(
  file: Pick<CmaPeriodFile, "dataset" | "report_period" | "checked" | "source">,
  fund: Pick<CmaFund, "raw_fields">,
): CmaFund["holdings"] | undefined {
  if (!HOLDINGS_FIELDS.some((f) => f.raw in fund.raw_fields)) return undefined;
  const config = DATASETS.find((d) => d.dataset === file.dataset)!;
  const make = (f: (typeof HOLDINGS_FIELDS)[number]) => {
    const rawText = (fund.raw_fields[f.raw] ?? "").trim();
    const n = rawText === "" ? null : Number(rawText);
    const value = n !== null && Number.isFinite(n) ? n : null;
    const notes =
      value === null
        ? "לא דווח."
        : f.key === "total_assets"
          ? `סך נכסי המסלול בסוף ${file.report_period}, במיליוני ש״ח כפי שהרשות מדווחת.`
          : `${f.key === "stock_market_exposure" ? "החשיפה של המסלול לשוק המניות" : "החשיפה של המסלול למטבע חוץ"} בסוף ${file.report_period}, במיליוני ש״ח (היחידה לא כתובה במילון השדות; היא נקראת כמו סך הנכסים, CAT OQ4). לא פורסם אם החשיפה נמדדת כולל נגזרים או דרך קרנות שהמסלול מחזיק.`;
    return {
      value,
      unit: "nis_millions" as const,
      source: {
        url: file.source.url,
        title: `${config.heTitle}, resource 2024-today, field ${f.raw} ("${f.heName}"), REPORT_PERIOD ${file.report_period.replace("-", "")}`,
        publisher: file.source.publisher,
        strength: "primary" as const,
      },
      checked: file.checked,
      effective_from: `${file.report_period}-01`,
      effective_to: periodEnd(file.report_period),
      tax_year: null,
      update_rule: "market" as const,
      rule_ids: ["CAT-24"],
      state: "sourced" as const,
      notes,
    };
  };
  return {
    total_assets: make(HOLDINGS_FIELDS[0]),
    stock_market_exposure: make(HOLDINGS_FIELDS[1]),
    ...(HOLDINGS_FIELDS[2].raw in fund.raw_fields ? { foreign_currency_exposure: make(HOLDINGS_FIELDS[2]) } : {}),
  };
}

const YIELD_FIELDS = [
  { key: "avg_annual_yield_3y", raw: "AVG_ANNUAL_YIELD_TRAILING_3YRS", heName: "תשואה שנתית ממוצעת 3 שנים אחרונות", years: 3 },
  { key: "avg_annual_yield_5y", raw: "AVG_ANNUAL_YIELD_TRAILING_5YRS", heName: "תשואה שנתית ממוצעת 5 שנים אחרונות", years: 5 },
] as const;

/** Whether a track opened less than `years` full years before the end of the report period (it cannot have a figure for the window). */
export const youngerThan = (inception: string | null | undefined, period: string, years: number): boolean => {
  if (!inception) return false;
  const [y, m] = period.split("-").map(Number) as [number, number];
  return inception > periodEnd(`${y - years}-${String(m).padStart(2, "0")}`);
};

/**
 * CMA average annual yields (3 and 5 years) to value objects, in percent per year (CAT-04, CAT-05). The regulator states they are
 * nominal and gross: before management fees, and not net of tax. That the window ends at the report month and that the figure is a
 * geometric annualisation are read from the data, not stated by the regulator (CAT-05). Undefined when the file has neither column. Pure.
 */
export function buildYields(
  file: Pick<CmaPeriodFile, "dataset" | "report_period" | "checked" | "source">,
  fund: Pick<CmaFund, "raw_fields" | "inception_date">,
): CmaFund["yields"] | undefined {
  if (!YIELD_FIELDS.some((f) => f.raw in fund.raw_fields)) return undefined;
  const config = DATASETS.find((d) => d.dataset === file.dataset)!;
  const make = (f: (typeof YIELD_FIELDS)[number]) => {
    const rawText = (fund.raw_fields[f.raw] ?? "").trim();
    const n = rawText === "" ? null : Number(rawText);
    const value = n !== null && Number.isFinite(n) ? n : null;
    const notes =
      value === null
        ? youngerThan(fund.inception_date, file.report_period, f.years)
          ? `לא דווח: למסלול עוד אין ${f.years} שנים מלאות (נפתח ${fund.inception_date}).`
          : "לא דווח."
        : `התשואה השנתית הממוצעת של המסלול ב־${f.years} השנים עד סוף ${file.report_period}: נומינלית וברוטו, כלומר לפני דמי ניהול ולפני מס. זו תשואת עבר, לא הבטחה לעתיד. שנות החישוב נקראות כמסתיימות בחודש הדיווח, והרשות לא כותבת זאת במפורש (CAT-05).`;
    return {
      value,
      unit: "pct_per_year" as const,
      source: {
        url: file.source.url,
        title: `${config.heTitle}, resource 2024-today, field ${f.raw} ("${f.heName}"), REPORT_PERIOD ${file.report_period.replace("-", "")}`,
        publisher: file.source.publisher,
        strength: "primary" as const,
      },
      checked: file.checked,
      effective_from: `${file.report_period}-01`,
      effective_to: periodEnd(file.report_period),
      tax_year: null,
      update_rule: "market" as const,
      rule_ids: ["CAT-04", "CAT-05"],
      state: "sourced" as const,
      notes,
    };
  };
  return { avg_annual_yield_3y: make(YIELD_FIELDS[0]), avg_annual_yield_5y: make(YIELD_FIELDS[1]) };
}

/** Attach a fund's derived value objects (fees, and holdings and yields when its raw fields have them). */
const derive = (file: Pick<CmaPeriodFile, "dataset" | "report_period" | "checked" | "source">, f: CmaFund): CmaFund => {
  const next: CmaFund = { ...f, fees: buildFees(file, f) };
  const holdings = buildHoldings(file, f);
  if (holdings) next.holdings = holdings;
  else delete next.holdings;
  const yields = buildYields(file, f);
  if (yields) next.yields = yields;
  else delete next.yields;
  return next;
};

/** Rebuild `fees`, `holdings` and `yields` of every fund from the stored raw_fields; nothing else changes. */
export function renormaliseFees(file: CmaPeriodFile): CmaPeriodFile {
  return { ...file, funds: file.funds.map((f) => derive(file, f)) };
}

export const archiveKey = (dataset: CmaDataset, runDate: string): string => `cma/${dataset}/${runDate}.csv.gz`;
export const periodDashed = (yyyymm: string): string => `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;

/** CSV INCEPTION_DATE "1994-11-14T00:00:00" -> "1994-11-14"; empty -> null. */
export function inceptionDate(raw: string): string | null | undefined {
  const t = raw.trim();
  if (t === "") return null;
  const m = /^(\d{4}-\d{2}-\d{2})(?:T00:00:00)?$/.exec(t);
  return m ? m[1]! : undefined;
}

export function normalise(csvText: string, ctx: NormaliseContext): NormaliseResult {
  const problems: string[] = [];
  const table = parseCsv(csvText);
  const header = table[0] ?? [];
  const required: readonly string[] =
    ctx.config.dataset === "gemelnet" ? [...REQUIRED_COLUMNS, ...GEMEL_ONLY_COLUMNS] : REQUIRED_COLUMNS;
  const missing = required.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    problems.push(`required column(s) missing: ${missing.join(", ")}`);
    return { period: null, rowCount: 0, file: null, problems };
  }
  const col = Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>;
  const get = (r: string[], name: string): string => (name in col ? (r[col[name]!] ?? "") : "");

  const body = table.slice(1).filter((r) => r.length === header.length);
  const ragged = table.length - 1 - body.length;
  if (ragged > 0) problems.push(`${ragged} row(s) with the wrong number of columns`);
  const periods = body.map((r) => get(r, "REPORT_PERIOD").trim()).filter((p) => /^\d{6}$/.test(p));
  if (periods.length === 0) {
    problems.push("no row has a readable REPORT_PERIOD");
    return { period: null, rowCount: 0, file: null, problems };
  }
  const period = periods.reduce((a, b) => (a > b ? a : b));
  const rows = body.filter((r) => get(r, "REPORT_PERIOD").trim() === period);

  const bad = new Set<string>();
  for (const r of rows) {
    for (const c of TEXT_COLUMNS) {
      if (get(r, c).includes("�")) bad.add(c);
    }
  }
  if (bad.size > 0) problems.push(`text failed to decode (replacement characters) in: ${[...bad].join(", ")}`);

  const seen = new Set<number>();
  const funds: CmaFund[] = [];
  for (const r of rows) {
    if (EXCLUDED_COMPANIES.has(get(r, "MANAGING_CORPORATION_LEGAL_ID").trim()) || closedTrack(get(r, "TARGET_POPULATION"), get(r, "FUND_NAME"), ctx.config.dataset, Number(get(r, "FUND_ID").trim()))) continue;
    // a Halacha or Sharia track: the regulator classes it "הלכתי" in gemelnet; pensia-net has no classification, so its name says it
    if (isReligiousLaw(get(r, "FUND_NAME"), get(r, "SPECIALIZATION"), get(r, "SUB_SPECIALIZATION"))) continue;
    const population = get(r, "TARGET_POPULATION").trim();
    if (population !== "" && population !== "כלל האוכלוסיה") problems.push(`fund ${get(r, "FUND_ID")}: unknown TARGET_POPULATION "${population}"; say whether it is closed to joiners`);
    const general = GENERAL_TRACKS[ctx.config.dataset];
    const row = { name: get(r, "FUND_NAME"), classification: get(r, "FUND_CLASSIFICATION"), specialization: get(r, "SPECIALIZATION") };
    if (general.isGeneral(row) && !general.readings.has(Number(get(r, "FUND_ID").trim())))
      problems.push(`fund ${get(r, "FUND_ID")}: "${row.name}" is a general track with no reading in GENERAL_TRACKS; say whether CAT-19 closes it to joiners`);
    const id = Number(get(r, "FUND_ID").trim());
    if (!Number.isInteger(id) || id <= 0) {
      problems.push(`unreadable FUND_ID "${get(r, "FUND_ID")}"`);
      continue;
    }
    if (seen.has(id)) {
      problems.push(`fund id ${id} appears twice in period ${period}`);
      continue;
    }
    seen.add(id);
    const inc = inceptionDate(get(r, "INCEPTION_DATE"));
    if (inc === undefined) {
      problems.push(`fund ${id}: unreadable INCEPTION_DATE "${get(r, "INCEPTION_DATE")}"`);
      continue;
    }
    funds.push({
      fund_id: id,
      names: { cma: [get(r, "FUND_NAME")] },
      managing_corporation: {
        name: get(r, "MANAGING_CORPORATION"),
        legal_id: get(r, "MANAGING_CORPORATION_LEGAL_ID"),
      },
      controlling_corporation: get(r, "CONTROLLING_CORPORATION"),
      fund_classification: get(r, "FUND_CLASSIFICATION"),
      target_population: get(r, "TARGET_POPULATION"),
      specialization: get(r, "SPECIALIZATION"),
      sub_specialization: get(r, "SUB_SPECIALIZATION"),
      inception_date: inc,
      // Text and fee fields are kept exactly as received, untrimmed, as the hand-made snapshots do (strings); `fees` is derived from them.
      raw_fields: {
        AVG_ANNUAL_MANAGEMENT_FEE: get(r, "AVG_ANNUAL_MANAGEMENT_FEE"),
        AVG_DEPOSIT_FEE: get(r, "AVG_DEPOSIT_FEE"),
        ...Object.fromEntries([...HOLDINGS_COLUMNS, ...KEPT_COLUMNS].filter((c) => c in col).map((c) => [c, get(r, c)])),
      },
      fees: null as unknown as CmaFund["fees"], // filled below, once the file-level fields exist
    });
  }
  funds.sort((a, b) => a.fund_id - b.fund_id);

  const { config } = ctx;
  const url = downloadUrl(config);
  const lm = ctx.lastModified ? `; resource last_modified ${ctx.lastModified}` : "";
  const candidate = {
    dataset: config.dataset,
    report_period: periodDashed(period),
    source: {
      url: datasetPageUrl(config),
      title: `${config.heTitle}, resource 2024-today (id ${config.resourceId}), CSV downloaded from ${url} (Windows-1255)${lm}; rows with REPORT_PERIOD ${period}`,
      publisher: "Capital Market, Insurance and Savings Authority (data.gov.il)",
      strength: "primary",
    },
    checked: ctx.runDate,
    raw: { archive_key: archiveKey(config.dataset, ctx.runDate), sha256: ctx.sha256 },
    funds,
  };
  candidate.funds = candidate.funds.map((f) => derive(candidate as CmaPeriodFile, f));
  const parsed = cmaPeriodFile.safeParse(candidate);
  if (!parsed.success) {
    const first = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    problems.push(`schema validation failed (${parsed.error.issues.length} issue(s)): ${first.join("; ")}`);
    return { period, rowCount: rows.length, file: null, problems };
  }
  return { period, rowCount: rows.length, file: parsed.data, problems };
}

// ---------- pure: sanity ----------

/** Reasons the new file must not be written ("sanity failed"); empty when it is fine. */
export function sanityCheck(next: CmaPeriodFile, previous: CmaPeriodFile | null): string[] {
  const reasons: string[] = [];
  if (!previous) return reasons;
  if (next.report_period < previous.report_period) {
    reasons.push(`latest period ${next.report_period} is older than the stored ${previous.report_period}`);
    return reasons;
  }
  if (next.funds.length < SANITY.minRowRatio * previous.funds.length) {
    reasons.push(
      `row count ${next.funds.length} is below ${SANITY.minRowRatio * 100}% of the previous period's ${previous.funds.length} (${previous.report_period})`,
    );
  }
  const nextIds = new Set(next.funds.map((f) => f.fund_id));
  const gone = previous.funds.filter((f) => !nextIds.has(f.fund_id)).length;
  if (previous.funds.length > 0 && gone / previous.funds.length > SANITY.maxDisappearedFundRatio) {
    reasons.push(
      `${gone} of ${previous.funds.length} fund ids (${Math.round((gone / previous.funds.length) * 100)}%) disappeared; the limit is ${SANITY.maxDisappearedFundRatio * 100}%`,
    );
  }
  return reasons;
}

// ---------- pure: diff ----------

/** Fields compared for a fund that exists in both files: [path, getter]. */
const FIELDS: [string, (f: CmaFund) => unknown][] = [
  ["names.cma", (f) => f.names.cma],
  ["managing_corporation.name", (f) => f.managing_corporation.name],
  ["managing_corporation.legal_id", (f) => f.managing_corporation.legal_id],
  ["controlling_corporation", (f) => f.controlling_corporation],
  ["fund_classification", (f) => f.fund_classification],
  ["target_population", (f) => f.target_population],
  ["specialization", (f) => f.specialization],
  ["sub_specialization", (f) => f.sub_specialization],
  ["inception_date", (f) => f.inception_date],
  ...["AVG_ANNUAL_MANAGEMENT_FEE", "AVG_DEPOSIT_FEE", ...HOLDINGS_COLUMNS, ...KEPT_COLUMNS].map(
    (k): [string, (f: CmaFund) => unknown] => [`raw_fields.${k}`, (f) => f.raw_fields[k] ?? null],
  ),
  ...["avg_annual_management_fee", "avg_deposit_fee"].map(
    (k): [string, (f: CmaFund) => unknown] => [
      `fees.${k}`,
      (f) => f.fees[k as "avg_deposit_fee"].value,
    ],
  ),
];

export interface CmaDiff {
  added: number[];
  removed: number[];
  changed: { fund_id: number; fields: string[] }[];
  periodChanged: boolean;
  /** Anything differs in the data part (funds, period); metadata (checked, raw, source) is ignored. */
  isEmpty: boolean;
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function diffFiles(previous: CmaPeriodFile | null, next: CmaPeriodFile): CmaDiff {
  const prevById = new Map((previous?.funds ?? []).map((f) => [f.fund_id, f]));
  const nextById = new Map(next.funds.map((f) => [f.fund_id, f]));
  const added = next.funds.filter((f) => !prevById.has(f.fund_id)).map((f) => f.fund_id);
  const removed = (previous?.funds ?? []).filter((f) => !nextById.has(f.fund_id)).map((f) => f.fund_id);
  const changed: CmaDiff["changed"] = [];
  for (const f of next.funds) {
    const p = prevById.get(f.fund_id);
    if (!p) continue;
    const fields = FIELDS.filter(([, get]) => !same(get(p), get(f))).map(([path]) => path);
    if (fields.length > 0) changed.push({ fund_id: f.fund_id, fields });
  }
  const periodChanged = !previous || previous.report_period !== next.report_period;
  return {
    added,
    removed,
    changed,
    periodChanged,
    isEmpty: !periodChanged && added.length === 0 && removed.length === 0 && changed.length === 0,
  };
}

// ---------- store: read the current files ----------

const FILE_RE = /^(gemelnet|pensia-net)@(\d{4}-\d{2})\.json$/;

export function listPeriods(cmaDir: string, dataset: CmaDataset): string[] {
  if (!existsSync(cmaDir)) return [];
  return readdirSync(cmaDir)
    .map((n) => FILE_RE.exec(n))
    .filter((m): m is RegExpExecArray => m !== null && m[1] === dataset)
    .map((m) => m[2]!)
    .sort();
}

export function readCmaFile(cmaDir: string, dataset: CmaDataset, period: string): CmaPeriodFile {
  return cmaPeriodFile.parse(JSON.parse(readFileSync(join(cmaDir, `${dataset}@${period}.json`), "utf8")));
}

/** The file to compare with: the same period if it exists, else the latest older one, else null. */
export function currentBaseline(cmaDir: string, dataset: CmaDataset, period: string): CmaPeriodFile | null {
  const periods = listPeriods(cmaDir, dataset);
  const pick = periods.includes(period) ? period : [...periods].reverse().find((p) => p < period);
  const latest = periods.at(-1);
  const chosen = pick ?? latest;
  return chosen ? readCmaFile(cmaDir, dataset, chosen) : null;
}

export const serialise = (file: CmaPeriodFile): string => JSON.stringify(file, null, 2) + "\n";

// ---------- I/O: fetch, archive, write ----------

export interface Downloaded {
  bytes: Uint8Array;
  lastModified: string | null;
}

export async function fetchRaw(config: DatasetConfig): Promise<Downloaded> {
  const res = await fetch(downloadUrl(config), {
    headers: { "User-Agent": USER_AGENT, Accept: "text/csv,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${config.dataset}: download failed, HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length < 1000) throw new Error(`${config.dataset}: download is only ${bytes.length} bytes`);
  const lm = res.headers.get("last-modified");
  const d = lm ? new Date(lm) : null;
  return { bytes, lastModified: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d+Z$/, "Z") : null };
}

export const assetName = (key: string): string => key.replaceAll("/", "--");
export const releaseTag = (periodDashedValue: string): string => `raw-cma-${periodDashedValue}`;

export type Archive = (args: { tag: string; assetName: string; gz: Buffer }) => string;

/** Uploads through the gh CLI (GITHUB_TOKEN in CI, the user's login locally). Returns a note. */
export const ghArchive: Archive = ({ tag, assetName: name, gz }) => {
  try {
    execFileSync("gh", ["--version"], { stdio: "ignore" });
  } catch {
    return "gh is not available: raw file not archived (archive key and sha256 are still recorded)";
  }
  const dir = mkdtempSync(join(tmpdir(), "cma-raw-"));
  try {
    const file = join(dir, name);
    writeFileSync(file, gz);
    let exists = true;
    try {
      execFileSync("gh", ["release", "view", tag], { stdio: "ignore" });
    } catch {
      exists = false;
    }
    if (!exists) {
      execFileSync(
        "gh",
        [
          "release",
          "create",
          tag,
          "--title",
          `Raw CMA downloads ${tag.replace("raw-cma-", "")}`,
          "--notes",
          "Raw gzipped CSV downloads from data.gov.il (docs/architecture.md section 3.3). Evidence for data/cma/.",
          "--latest=false",
        ],
        { stdio: "inherit" },
      );
    }
    execFileSync("gh", ["release", "upload", tag, file, "--clobber"], { stdio: "inherit" });
    return `archived as asset ${name} of release ${tag}`;
  } catch (e) {
    return `archive upload failed: ${(e as Error).message}`;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export interface RefreshOptions {
  dataDir: string;
  runDate: string;
  dryRun: boolean;
  /** Skip the upload; the archive key and sha256 are still recorded. */
  archive: boolean;
  /** Write even when the sanity check failed (used to prepare the pull request for review). Schema must still pass. */
  force: boolean;
  datasets?: DatasetConfig[];
  fetchRaw?: (c: DatasetConfig) => Promise<Downloaded>;
  archiveRaw?: Archive;
  log?: (line: string) => void;
}

export type DatasetStatus = "new-period" | "updated" | "unchanged" | "sanity-failed" | "error";

export interface DatasetReport {
  dataset: CmaDataset;
  status: DatasetStatus;
  period: string | null;
  reasons: string[];
  diff: CmaDiff | null;
  written: boolean;
  note?: string;
}

export async function refreshCma(opts: RefreshOptions): Promise<DatasetReport[]> {
  const log = opts.log ?? ((l: string) => console.log(l));
  const cmaDir = join(opts.dataDir, "cma");
  const reports: DatasetReport[] = [];
  for (const config of opts.datasets ?? DATASETS) {
    const report: DatasetReport = {
      dataset: config.dataset,
      status: "error",
      period: null,
      reasons: [],
      diff: null,
      written: false,
    };
    reports.push(report);
    try {
      const dl = await (opts.fetchRaw ?? fetchRaw)(config);
      const sha = sha256Hex(dl.bytes);
      const text = decodeWindows1255(dl.bytes);
      const res = normalise(text, { config, runDate: opts.runDate, sha256: sha, lastModified: dl.lastModified });
      report.period = res.period ? periodDashed(res.period) : null;
      const reasons = [...res.problems];
      let previous: CmaPeriodFile | null = null;
      if (res.file) {
        previous = currentBaseline(cmaDir, config.dataset, res.file.report_period);
        reasons.push(...sanityCheck(res.file, previous));
      }
      report.reasons = reasons;
      if (!res.file || (reasons.length > 0 && !opts.force)) {
        report.status = "sanity-failed";
        log(`${config.dataset}: sanity failed, nothing written`);
        for (const r of reasons) log(`  - ${r}`);
        continue;
      }
      if (reasons.length > 0) log(`${config.dataset}: sanity failed, written anyway because of --force`);
      const diff = diffFiles(previous, res.file);
      report.diff = diff;
      if (diff.isEmpty) {
        report.status = "unchanged";
        log(`${config.dataset}: period ${res.file.report_period}, ${res.file.funds.length} funds, nothing changed`);
        continue;
      }
      report.status = diff.periodChanged ? "new-period" : "updated";
      log(
        `${config.dataset}: ${diff.periodChanged ? "NEW period " + res.file.report_period : "values changed within period " + res.file.report_period}: ` +
          `${diff.added.length} fund(s) added, ${diff.removed.length} removed, ${diff.changed.length} changed`,
      );
      for (const c of diff.changed.slice(0, 10)) log(`  fund ${c.fund_id}: ${c.fields.join(", ")}`);
      if (diff.changed.length > 10) log(`  ... and ${diff.changed.length - 10} more changed fund(s)`);
      if (opts.dryRun) {
        log(`  dry run: nothing written, nothing archived`);
        continue;
      }
      if (opts.archive) {
        report.note = (opts.archiveRaw ?? ghArchive)({
          tag: releaseTag(res.file.report_period),
          assetName: assetName(res.file.raw.archive_key),
          gz: gzipRaw(dl.bytes),
        });
      } else report.note = "archive skipped (--no-archive); archive key and sha256 recorded";
      log(`  ${report.note}`);
      mkdirSync(cmaDir, { recursive: true });
      writeFileSync(join(cmaDir, `${config.dataset}@${res.file.report_period}.json`), serialise(res.file));
      report.written = true;
      log(`  wrote data/cma/${config.dataset}@${res.file.report_period}.json`);
    } catch (e) {
      report.status = "error";
      report.reasons.push((e as Error).message);
      log(`${config.dataset}: error: ${(e as Error).message}`);
    }
  }
  return reports;
}
