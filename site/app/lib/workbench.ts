// The track workbench's data as the page receives it (design-spec 11.2 `Workbench`, flows 25), and the pure
// functions both the browser and the build use: the outcome of a row against the saved goal, the sort, the
// coverage counts. The page ships the rows compactly (one short record per track, the two fee value objects once);
// `workbench.server.ts` builds them from the engine's F-64 and the browser expands them here.
import { fitOf, type FitTableData } from "./fit";
import { computed, type CompactFee, type SiteValue } from "./value";

export type Resolution = "distinct" | "twice" | "unresolved";

/** The empty `SPECIALIZATION` (the pension funds carry none): a group of its own, never dropped (F-83). */
export const NO_CLASS = "";

/** One track, as shipped. Short keys: a hishtalmut page holds a few hundred of these. */
export interface WbRow {
  f: number; // fund id
  c: number; // index into `companies`
  n: string; // the name as the source writes it
  sp: string; // SPECIALIZATION
  sub: string; // SUB_SPECIALIZATION
  pop: string; // the target population when it is not the whole public (CAT-10), else ""
  b: CompactFee; // average fee on balance
  d: CompactFee; // average fee on deposits
  def?: 1; // the catalogue marks it a default at joining
  dup?: number; // index into `dups`: a near-duplicate group inside the company
}

/** F-68 numbers of one class; the page rebuilds the computed value objects from them. */
export interface WbReference {
  tracks: number;
  management: { count: number; mean: number | null; median: number | null };
  deposit: { count: number; mean: number | null; median: number | null };
}

export interface WbData {
  wrapperId: string;
  wrapperName: string;
  classification: string; // the regulator's product type, as written
  dataset: "gemelnet" | "pensia-net";
  today: string;
  /** The month the data is as of, as a sourced value object. */
  period: SiteValue;
  /** The fee year as a sourced text value (the calendar year the averages belong to). */
  feeYear: SiteValue | null;
  /** The two fee value objects once; each row carries its number and, when it differs, its note. */
  feeTemplate: { balance: SiteValue; deposit: SiteValue };
  referenceMeta: { period: string | null; checked: string; ruleIds: string[] };
  companies: { id: string; name: string }[];
  rows: WbRow[];
  dups: { resolution: Resolution }[];
  /** One entry per SPECIALIZATION (the exposure chips and groups), in the data's order of size. */
  groups: { key: string; count: number }[];
  references: Record<string, WbReference>;
  fit: FitTableData;
  stale: SiteValue["stale"] | null;
  /** Engine's coverage line for the wrapper (F-64): considered, grouped near duplicates, fee not reported. */
  engine: { considered: number; grouped: number; feeNotReported: number; depositNotReported: number; ok: boolean };
}

export type Fit = "fits" | "no-fit" | "no-rule" | "no-goal";
/** F-83 read for F-64 (method note, flow 25): the workbench ranks nothing. */
export type WorkbenchOutcome = "shown" | "no-rule" | "ineligible" | "not-evaluated";
/** The finer split the coverage sentence draws. */
export type CoverageKey = "fits" | "no-fit" | "no-rule" | "ineligible" | "no-goal" | "no-class";
export const coverageOrder: CoverageKey[] = ["fits", "no-fit", "no-rule", "ineligible", "no-goal", "no-class"];

export interface WorkbenchRow {
  row: WbRow;
  company: { name: string; href: string };
  track: { fundId: number; name: string; href: string };
  fit: Fit;
  outcome: WorkbenchOutcome;
  key: CoverageKey;
  /** The word the row shows for its outcome ("פתוח רק ל…", "לא נבדק: …"). */
  reason?: { text: string; code: string };
  feesHref: string;
}

/** The outcome of one track against the saved goal's horizon (null: no saved goal). A sector or employer track
 *  (CAT-10) is not eligible whatever the goal; then a missing goal; then a classification the data does not carry. */
export function outcomeOf(r: WbRow, years: number | null, table: FitTableData, classification: string, words: { onlyFor: string; noGoal: string; noClass: string }): Pick<WorkbenchRow, "fit" | "outcome" | "key" | "reason"> {
  if (r.pop) return { fit: "no-goal", outcome: "ineligible", key: "ineligible", reason: { text: `${words.onlyFor}${r.pop}`, code: "CAT-10" } };
  if (years === null) return { fit: "no-goal", outcome: "not-evaluated", key: "no-goal", reason: { text: words.noGoal, code: "no-goal" } };
  if (r.sp === NO_CLASS && r.sub === "") return { fit: "no-goal", outcome: "not-evaluated", key: "no-class", reason: { text: words.noClass, code: "no-class" } };
  const res = fitOf(table, { specialization: r.sp, subSpecialization: r.sub, classification }, years);
  if (res.kind === "no-rule") return { fit: "no-rule", outcome: "no-rule", key: "no-rule" };
  return { fit: res.kind, outcome: "shown", key: res.kind };
}

export type SortKey = "company" | "fee-balance" | "fee-deposit" | "name";
export type SortDir = "asc" | "desc";

const collator = new Intl.Collator("he");

/**
 * Order the rows of one group. A near-duplicate group stays together (its place is its first member's), and a fee
 * that was not reported sorts last in its own block. Ascending: a sort is the person's action on a sourced column.
 */
export function sortRows(rows: WorkbenchRow[], sort: SortKey, dir: SortDir = "asc"): WorkbenchRow[] {
  const fee = (w: WorkbenchRow) => (sort === "fee-deposit" ? w.row.d.value : w.row.b.value);
  const sign = dir === "desc" ? -1 : 1;
  const cmp = (a: WorkbenchRow, b: WorkbenchRow): number => {
    if (sort === "fee-balance" || sort === "fee-deposit") {
      const x = fee(a);
      const y = fee(b);
      if (x === null && y === null) return collator.compare(a.company.name, b.company.name) || collator.compare(a.row.n, b.row.n);
      if (x === null) return 1;
      if (y === null) return -1;
      return sign * (x - y || collator.compare(a.company.name, b.company.name) || collator.compare(a.row.n, b.row.n));
    }
    if (sort === "name") return sign * (collator.compare(a.row.n, b.row.n) || collator.compare(a.company.name, b.company.name));
    return sign * (collator.compare(a.company.name, b.company.name) || collator.compare(a.row.n, b.row.n) || a.row.f - b.row.f);
  };
  // units: a duplicate group is one unit
  const units: WorkbenchRow[][] = [];
  const seen = new Map<string, WorkbenchRow[]>();
  for (const w of rows) {
    if (w.row.dup === undefined) {
      units.push([w]);
      continue;
    }
    const k = `${w.row.c}:${w.row.dup}`;
    let u = seen.get(k);
    if (!u) {
      u = [];
      seen.set(k, u);
      units.push(u);
    }
    u.push(w);
  }
  for (const u of units) u.sort(cmp);
  units.sort((a, b) => cmp(a[0]!, b[0]!));
  return units.flat();
}

/** Rows the person can open: a sector or employer track (CAT-10) is not, whatever the goal. With `openToAll` off, every row stays. */
export function eligibleOnly(rows: WorkbenchRow[], openToAll: boolean): WorkbenchRow[] {
  return openToAll ? rows.filter((w) => w.outcome !== "ineligible") : rows;
}

/** Everything the controls hold, and what the address carries so a reload or the back button keeps it. */
export interface WbQuery {
  q: string;
  sort: SortKey;
  dir: SortDir;
  /** One exposure group (its `SPECIALIZATION`, `""` for the no-class group), `"all"` for every group, or null for the default groups. */
  chip: string | null;
  /** Only tracks open to everyone (the default); false shows the sector and employer tracks too. */
  openToAll: boolean;
}

export const defaultWbQuery: WbQuery = { q: "", sort: "company", dir: "asc", chip: null, openToAll: true };
const SORTS: SortKey[] = ["company", "fee-balance", "fee-deposit", "name"];

export function parseWbQuery(search: string): WbQuery {
  const p = new URLSearchParams(search);
  const sort = p.get("sort");
  const chip = p.get("chip");
  return {
    q: p.get("q") ?? "",
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : "company",
    dir: p.get("dir") === "desc" ? "desc" : "asc",
    chip: chip === null ? null : chip === "none" ? NO_CLASS : chip,
    openToAll: p.get("all") !== "1",
  };
}

export function wbQueryString(q: WbQuery): string {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.sort !== "company") p.set("sort", q.sort);
  if (q.dir === "desc") p.set("dir", "desc");
  if (q.chip !== null) p.set("chip", q.chip === NO_CLASS ? "none" : q.chip);
  if (!q.openToAll) p.set("all", "1");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** A press on a sort: another key starts ascending; the same key again reverses it. */
export function pressSort(q: Pick<WbQuery, "sort" | "dir">, key: SortKey): Pick<WbQuery, "sort" | "dir"> {
  return q.sort === key ? { sort: key, dir: q.dir === "asc" ? "desc" : "asc" } : { sort: key, dir: "asc" };
}

export function matches(w: WorkbenchRow, q: string): boolean {
  if (!q) return true;
  const t = q.trim().toLowerCase();
  return w.company.name.toLowerCase().includes(t) || w.row.n.toLowerCase().includes(t) || String(w.row.f) === t;
}

/** The F-68 value objects of one class, rebuilt from the shipped numbers. */
export function referenceValues(data: WbData, key: string): { management: { mean: SiteValue; median: SiteValue; count: SiteValue }; deposit: { mean: SiteValue; median: SiteValue; count: SiteValue } } | null {
  const ref = data.references[key];
  if (!ref) return null;
  const text = (value: string): SiteValue => ({ ...data.feeTemplate.balance, value, unit: "text", notes: "" });
  const count = (n: number): SiteValue => computed(n, "count", "F-68", {}, { today: data.today, about: "מספר המסלולים בסיווג שדיווחו את הדמי ניהול" });
  const make = (stat: WbReference["management"], unit: SiteValue["unit"], fee: string) => {
    const c = count(stat.count);
    const inputs = { סיווג: text(key || "בלי סיווג בנתונים"), "סוג דמי הניהול": text(fee), תקופה: text(data.referenceMeta.period ?? ""), "מספר מסלולים": c };
    const note = "מחושב ממסלול למסלול, מהנתונים של הרשות: הרשות לא מפרסמת ממוצע לסיווג, ושיטת השקלול של הממוצעים שלה לא פורסמה (CAT OQ2).";
    return {
      mean: computed(stat.mean, unit, "F-68", inputs, { today: data.today, notes: note }),
      median: computed(stat.median, unit, "F-68", inputs, { today: data.today, notes: note }),
      count: c,
    };
  };
  return { management: make(ref.management, "pct_per_year", "דמי ניהול מחיסכון"), deposit: make(ref.deposit, "pct_of_deposit", "דמי ניהול מהפקדה") };
}
