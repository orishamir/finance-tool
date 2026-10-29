// The provider workbench in the browser and at build (flows 28, 29, 33; design-spec 16.2 and 17): one fund, the
// person's goal and behaviour, every bank and broker snapshot at the chosen fee level, through the engine's F-63; the
// view the page draws from it. No fee, rate or rule figure is written here: tariffs come from the snapshots in the
// bundle, offers from the person, and every number leaves as a value object with its state. Pure: no storage, no fetch.
import {
  buildTariff,
  coverageLine,
  cumulativeProviderFees,
  fundOf,
  providerWorkbench,
  RecordInputError,
  type ComparedProvider,
  type EnteredTariff,
  type FeeLevel,
  type ProviderInput,
  type RunContext,
} from "@finance-tool/engine";
import type { ExposureRecord, FeesSnapshot, FundListFile, FundRecord, ParameterRecord, RuleRecord, ValueObject } from "@finance-tool/schema";
import { flags as flagCopy, formulaNames, guideBlocks, r4workbench } from "../copy";
import { fxRunInput, nisPerNumber, type FxHistory, type FxSnapshot } from "./fx";
import { toEnteredTariff, type EnteredOffer } from "./offers";
import { computed, entered as enteredValue, ownBy, type SiteValue, type Staleness } from "./value";

// Names the number sheet shows for the formulas and gaps of this release (copy.md 3.8 style: the code stays beside the words).
Object.assign(formulaNames, { "F-63": "השוואת ספקים לפי עלות", "F-65": "השוואת קרנות לאותה חשיפה", "F-83": "ספירת כל מה שנבדק" });
Object.assign(flagCopy, {
  "G-18": "קרן זרה שאינה מחלקת: רשות המסים לא אישרה שהיא ממוסה רק במכירה. האתר מחשב לפי מקור משני ולא מדרג.",
  "G-29": "לקרנות זרות הנסחרות בחו״ל אין רשימה מלאה: האתר משווה את אלה שאסף אחת־אחת, והשאר הן שורה אחת.",
  "F-18": "העמלה על חלוקת רווחים עוד לא מחושבת, ולכן התוצאה חלקית.",
});

// ---------------------------------------------------------------- the data (providers.server.ts)

export interface RefLink {
  href: string;
  title: string;
  ruleId: string;
}

export interface WorkbenchBundle {
  today: string;
  /** The latest snapshot of each provider in `data/fees/`. */
  snapshots: FeesSnapshot[];
  funds: FundRecord[];
  exposures: ExposureRecord[];
  /** The latest saved file of each fund list in `data/fund-lists/` (none until the lists are collected and cleared for use). */
  fundLists: FundListFile[];
  /** The rule records a run may read, the protection rules and the rules the pages quote. */
  rules: RuleRecord[];
  /** The records those rules' cards point at (derived_from, examples) that the bundle does not ship: only chips and cards read them (review, 2026-10-26). */
  pointed?: RuleRecord[];
  /** P-01 (tie threshold) and P-05 (the representative instruments). */
  p01: ParameterRecord;
  p05: ParameterRecord;
  links: { boi: RefLink | null; tase: RefLink | null; maya: RefLink | null; taseForeign: RefLink | null };
  /** A provider's snapshot id to the regulator's company id (the legal id the company page is addressed by); absent when the data names no such company. */
  providerCompany: Record<string, string>;
  /** Per provident wrapper: how many managing companies the regulator's data holds (the "one of N" line). */
  wrapperCompanies: Record<string, number>;
  /** The ECB's daily euro reference rates (D26): the start exchange rate of every foreign-currency run. The person never types one. */
  fx?: FxSnapshot;
  /** The ECB's month-end rates as shekels per dollar since 2000 (F-93, the index page's dollar section). */
  fxHistory?: FxHistory;
  /** P-02's bounds for the dollar's yearly change against the shekel (A-03), percent a year, with the record (F-94). */
  dollarRange?: { lo: number; hi: number; p02: ParameterRecord };
}

export const BROKERAGE = "brokerage-account";

let bundlePromise: Promise<WorkbenchBundle> | null = null;
/** The provider and fund data (`/workbench-bundle.json`), fetched once per visit and shared by the two workbench pages. */
export function loadWorkbenchBundle(): Promise<WorkbenchBundle> {
  if (!bundlePromise) bundlePromise = fetch(`${import.meta.env.BASE_URL}workbench-bundle.json`).then((r) => r.json() as Promise<WorkbenchBundle>);
  return bundlePromise;
}

/** Wrappers whose providers are a sourced listing of managers' list fees, not a ranking (flows 15.5). */
export const PROVIDENT_WRAPPERS = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"] as const;

// ---------------------------------------------------------------- the address

export type UiLevel = "list" | "average" | "entered";
export type Channel = "direct" | "branch";

export interface ProviderQuery {
  fund: string | null;
  orders: number | null;
  channel: Channel | null;
  level: UiLevel;
  vs: string | null;
}

export const ORDERS_MIN = 1;
export const ORDERS_MAX = 30;

export function parseProviderQuery(search: string): ProviderQuery {
  const q = new URLSearchParams(search);
  const orders = q.get("orders");
  const n = orders !== null && /^\d+$/.test(orders) ? Number(orders) : null;
  const channel = q.get("channel");
  const level = q.get("level");
  return {
    fund: q.get("fund") || null,
    orders: n !== null && n >= ORDERS_MIN && n <= ORDERS_MAX ? n : null,
    channel: channel === "direct" || channel === "branch" ? channel : null,
    level: level === "average" || level === "entered" ? level : "list",
    vs: q.get("vs") || null,
  };
}

export function providerQueryString(q: ProviderQuery): string {
  const p = new URLSearchParams();
  if (q.fund) p.set("fund", q.fund);
  if (q.orders !== null) p.set("orders", String(q.orders));
  if (q.channel) p.set("channel", q.channel);
  if (q.level !== "list") p.set("level", q.level);
  if (q.vs) p.set("vs", q.vs);
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------- small facts

/** D3 and product §6: a tariff snapshot older than three months is flagged (flow 33; the schema's `staleTariff`, 90 days). */
export function staleTariff(snapshot: string, today: string): boolean {
  const days = (Date.parse(today + "T00:00:00Z") - Date.parse(snapshot + "T00:00:00Z")) / 86_400_000;
  return days > 90;
}

const SHORT_NAMES: Record<string, string> = {
  ibi: "אי.בי.אי",
  psagot: "פסגות",
  "mizrahi-tefahot": "מזרחי טפחות",
  fibi: "הבינלאומי",
  leumi: "לאומי",
  hapoalim: "הפועלים",
  discount: "דיסקונט",
  mercantile: "מרכנתיל",
  massad: "מסד",
  yahav: "יהב",
  jerusalem: "ירושלים",
  "one-zero": "וואן זירו",
  "altshuler-trade": "אלטשולר טרייד",
  excellence: "אקסלנס",
  "meitav-trade": "מיטב טרייד",
};

/** A label for a chart's right strip (display only): the provider's name without the company suffix. */
export function shortName(id: string, name: string): string {
  return SHORT_NAMES[id] ?? name.replace(/\s*\(.*\)\s*/g, " ").replace(/\s*בע["״]מ\s*/g, "").trim();
}

/** A site parameter as a value object (P-01, A-28): the file's value with the marker the provenance sheet reads. */
export function parameterValue(p: ParameterRecord, vo: ValueObject): SiteValue {
  return { ...vo, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null, signedOffOn: p.signed_off_on ?? null, provisional: false } };
}

/** A-28's start values (docs/method.md): one trade per contribution and twelve deposits a year. A method default, shown as a site parameter. */
export function a28Value(value: number, about: string, today: string): SiteValue {
  return {
    value,
    unit: "count",
    source: { url: "docs/method.md#A-28", title: "A-28: התנהגות בסדנת הספקים", publisher: "האתר", strength: "primary" },
    checked: today,
    effective_from: null,
    effective_to: null,
    update_rule: "founder",
    state: "sourced",
    about,
    notes: "",
    parameter: { rationale: "ברירת המחדל של השיטה: פעולה אחת לכל הפקדה חודשית, 12 הפקדות בשנה.", signedOffOn: null, provisional: false },
  };
}

/** The engine's computed value, its raw inputs turned into values the provenance sheet can open, with the clock of a stale tariff. */
function lift(v: ValueObject, stale: Staleness | null, today: string, owner: string): SiteValue {
  const inputs: Record<string, SiteValue> = {};
  if (v.computed_from) {
    for (const [label, raw] of Object.entries(v.computed_from.inputs)) {
      const isNum = typeof raw === "number";
      inputs[label] = { ...computed(isNum ? raw : null, isNum ? "count" : "text", v.computed_from.formula, {}, { today, about: label }), ...(isNum ? {} : { value: String(raw) }) };
    }
  }
  // D31: a cost built from the provider's own tariff on the provider's own row is not weakened by it
  return ownBy({ ...v, computed_from: v.computed_from ? { formula: v.computed_from.formula, inputs } : undefined, weakest: v.source.strength, stale, rulesUsed: (v.rule_ids ?? []).map((id) => ({ id, strength: v.source.strength })) } as SiteValue, owner);
}

/** D31: a tariff figure of a provider, shown on that provider's row, is the provider's own. */
const withStale = (v: ValueObject, stale: Staleness | null, owner: string): SiteValue => ownBy({ ...v, stale } as SiteValue, owner);

// ---------------------------------------------------------------- the subject fund

export interface SubjectFund {
  recordId: string;
  name: string;
  number: string;
  instrumentClass: string;
  currency: string;
  exposureId: string;
  fromP05: boolean;
  record: FundRecord;
}

/** The tariff class a fund falls under (`applies_to` of a snapshot line). A TASE-listed foreign fund is traded like an ETF on the exchange. */
export function instrumentClassOf(rec: FundRecord, exposure: ExposureRecord | undefined): string {
  if (exposure?.cash_like) return "money_market_units";
  const israeli = rec.domicile === "IL";
  if (!israeli) return rec.trading_currency_on_tase ? "etf_units" : "foreign_securities";
  // an open tracking fund's legal form says "not traded on the exchange, ETF-04": the rule id must not read as an ETF (2026-10-25)
  const lf = rec.legal_form;
  return /קרן סל/.test(lf) || (!/קרן מחקה/.test(lf) && /\bETF\b/i.test(lf)) ? "etf_units" : "mutual_fund_units";
}

export function subjectOf(bundle: WorkbenchBundle, recordId: string | null): SubjectFund | null {
  const p05 = (bundle.p05.instruments ?? {})[BROKERAGE];
  const id = recordId ?? p05?.fund ?? null;
  if (!id) return null;
  const rec = bundle.funds.find((f) => f.id === id);
  if (!rec) return null;
  const exposure = bundle.exposures.find((e) => e.id === rec.exposure_id);
  return {
    recordId: rec.id,
    name: rec.names.he[0] ?? rec.names.en[0] ?? rec.id,
    number: rec.identifiers.tase_number ?? rec.identifiers.isin ?? rec.id,
    instrumentClass: instrumentClassOf(rec, exposure),
    currency: rec.currency === "NIS" ? "ILS" : rec.currency,
    exposureId: rec.exposure_id,
    fromP05: recordId === null,
    record: rec,
  };
}

/** What the person can enter for a fund on the fund page (the same store feeds the workbench). */
export interface FundAssumptions {
  /** A-03, % a year. Missing means flat (A-03's default 0). */
  fxChange?: number;
  w8ben?: boolean;
  /** A-10 per fund record id: yield in % a year and payments a year. */
  distributions?: Record<string, { yield: number; perYear: number }>;
}

const isIls = (c: string) => c === "NIS" || c === "ILS";

export type RunSpecError = { kind: "fund-type" } | { kind: "need-rate"; currency: string } | { kind: "need-yield" } | { kind: "other-currency"; fund: string; exposure: string };

/** The run inputs a fund fixes: its kind and drag (the same builder as F-65), the currency and how the return is quoted (F-04). */
export function fundRun(
  s: SubjectFund,
  exposure: ExposureRecord | undefined,
  grossReturn: number,
  assumptions: FundAssumptions,
  fx?: FxSnapshot,
): { fund: NonNullable<ReturnType<typeof fundOf>>["fund"]; market: { grossReturn: number; returnIn?: "instrument"; fxChange?: number }; currency?: { code: string; startRate: number } } | RunSpecError {
  const rec = s.record;
  if (!exposure || exposure.cash_like) return { kind: "fund-type" };
  const israeli = rec.domicile === "IL";
  if (israeli && rec.tax_status.il_fund_tax_track !== "exempt") return { kind: "fund-type" };
  if (rec.distribution_policy === null) return { kind: "fund-type" };
  const kind = !israeli && rec.trading_currency_on_tase !== null ? "tase-foreign-fund" : israeli ? "israeli-fund" : "foreign-fund";
  const dist = assumptions.distributions?.[rec.id];
  if (rec.distribution_policy === "distributing" && !dist) return { kind: "need-yield" };
  if (rec.distribution_policy === "distributing" && !israeli && rec.domicile !== "US" && rec.domicile !== "IE") return { kind: "fund-type" };
  const built = fundOf(rec, kind, rec.distribution_policy === "distributing" && dist ? { yield: dist.yield / 100, perYear: dist.perYear } : undefined, assumptions.w8ben);
  if (!built.hasManagement) return { kind: "fund-type" };
  const f = (assumptions.fxChange ?? 0) / 100;
  const market: { grossReturn: number; returnIn?: "instrument"; fxChange?: number } = { grossReturn };
  const fundCurrency = isIls(rec.currency) ? "ILS" : rec.currency;
  if (fundCurrency === "ILS") {
    // a fund that neutralises the exposure's currency is not moved by A-03 (F-04, 2026-10-29)
    if (!isIls(exposure.currency) && rec.hedged !== true) market.grossReturn = (1 + grossReturn) * (1 + f) - 1;
    return { fund: built.fund, market };
  }
  // E4 (2026-10-25): a fund in another currency than its index runs; A-01 stays in the index's currency, A-03 moves the fund's currency
  // against the shekel, and the FX line and the tax index are the fund's trading currency's (the fund-against-index move is not modelled).
  market.returnIn = "instrument";
  market.fxChange = f;
  const quote = rec.trading_currency_on_tase;
  if (quote === null || !isIls(quote)) {
    const rate = fx ? nisPerNumber(fx, fundCurrency) : null;
    if (rate === null) return { kind: "need-rate", currency: fundCurrency };
    return { fund: built.fund, market, currency: { code: fundCurrency, startRate: rate } };
  }
  return { fund: built.fund, market };
}

// ---------------------------------------------------------------- the inputs the page runs on

export interface WorkbenchInputs {
  amountNow: number;
  monthly: number;
  years: number;
  /** A-01 and A-02 as fractions. */
  grossReturn: number;
  inflation: number;
  age: number | null;
  /** Gross yearly income, when known. */
  income: number | null;
  /** The value objects the chips and the sheet show (the goal's, or the scenario's as site parameters). */
  values: { amount: SiteValue; monthly: SiteValue; years: SiteValue; returnV: SiteValue; inflation: SiteValue };
  fromGoal: boolean;
  returnFromParameter: boolean;
}

// ---------------------------------------------------------------- the view

export type FeeType = "trade" | "custody" | "fx" | "fixed";
const feeTypes: FeeType[] = ["trade", "custody", "fx", "fixed"];

export interface LineDetail {
  id: string;
  /** The snapshot's base: trade, custody, fx, fixed_period. */
  base: string;
  /** The line as the tariff prints it. */
  name: string;
  rate: SiteValue;
  min: SiteValue | null;
  max: SiteValue | null;
  period: "month" | "quarter" | "year" | null;
  channel: string | null;
  /** `list`, or the average level whose row replaced the rate. */
  level: string;
}

export interface EnteredLine {
  base: FeeType;
  rate: SiteValue;
  min: SiteValue | null;
  max: SiteValue | null;
  everyMonths?: number;
  /** The person's rate is above the list line's (flow 29: accepted, with a quiet note). */
  aboveList: boolean;
}

/** The list line a base resolves to for the fund's class and the channel: the values the entered-offer card shows as placeholders (null: none, or more than one so none can be named). */
export interface ListLine {
  rate: SiteValue;
  min: SiteValue | null;
  max: SiteValue | null;
  period: "month" | "quarter" | "year" | null;
}

export interface RowTariff {
  title: string;
  href: string;
  published: SiteValue | null;
  snapshot: SiteValue;
  format: "pdf" | "html" | "xlsx";
  stale: boolean;
}

export interface RowProtection {
  regulator: "BoI" | "ISA" | "CMA" | "foreign";
  /** S1 (2026-10-25): a foreign broker's regulator in Hebrew, from the snapshot's `regulator_foreign`. */
  foreignRegulator?: string;
  taseMember: boolean;
  ruleIds: string[];
  notIsaSupervised: boolean;
}

export type NotComparable =
  | { code: "data-missing"; recorded: string | null }
  | { code: "no-applicable-line"; detail: string }
  | { code: "no-average"; detail: string }
  | { code: "line-without-value"; detail: string; lineName: string | null }
  /** 2026-10-25 (engine E1, E2, E5): a per-share line and no share price; a line in a foreign currency and no rate; a record the engine cannot read. */
  | { code: "needs-share-price" | "needs-fx-rate" | "record-error"; detail: string }
  | { code: "ambiguous"; detail: string; lines: { id: string; name: string; band: string | null }[] };

export interface ProviderRowView {
  id: string;
  name: string;
  short: string;
  providerClass: FeesSnapshot["provider"]["class"];
  broker: boolean;
  kind: "ranked" | "not-comparable";
  rank?: number;
  /** Ids tied with this row (the cheapest and everyone within θ of it share rank 1). */
  tiedWith: string[];
  horizonCost?: SiteValue;
  yearOneCost?: SiteValue;
  /** Real value left at the horizon with this provider's fees: the figure the ranking sorts on. */
  real?: number;
  byType?: { type: FeeType; cost: SiteValue; share: number }[];
  interaction?: SiteValue;
  /** Bar width against the dearest compared row (0 to 1). */
  barScale?: number;
  deciding?: { against: string; againstName: string; line: FeeType | null; gaps: Partial<Record<FeeType, SiteValue>> };
  tariff: RowTariff;
  minimums: { accountOpening: SiteValue | null; perTrade: { name: string; min: SiteValue | null; max: SiteValue | null }[] };
  protection: RowProtection;
  notModelled: { lineId: string; name: string; reason: "F-18" | "no-formula" }[];
  noLine: ("trade" | "custody" | "fx")[];
  fixedSpread: string[];
  lines: LineDetail[];
  list: Partial<Record<FeeType, ListLine>>;
  /** The offer the row runs on (level entered), with the lines it gives. */
  offer?: { offer: EnteredOffer; lines: EnteredLine[] };
  /** The person has an offer from this provider, used or not at the chosen level. */
  hasOffer: boolean;
  reason?: NotComparable;
  ruleIds: string[];
  pending: string[];
  vs: boolean;
}

export interface ChartLine {
  id: string;
  name: string;
  short: string;
  /** The lines drawn are ranks 1 to 3 and the `vs` provider; the rest are only in the table view (null). */
  role: "rank-1" | "rank-2" | "rank-3" | "vs" | null;
  entered: boolean;
  /** Real cumulative provider fees by month, 0 to the exit month. */
  real: number[];
  nominal: number[];
  horizonCost: SiteValue;
}

export interface CoverageView {
  considered: number;
  ranked: { id: string; name: string }[];
  notComparable: { id: string; name: string; code: string; reason: NotComparable }[];
  invariantOk: boolean;
}

export interface ProviderWorkbenchView {
  wrapperId: string;
  subject: SubjectFund;
  behaviour: { orders: SiteValue; ordersN: number; channel: SiteValue; channelId: Channel; fxCurrency: string | null; deposits: SiteValue; anyBank: boolean; anyBroker: boolean };
  level: UiLevel;
  /** What the engine ran at: the level asked for, or the list when no averages exist. */
  effectiveLevel: UiLevel;
  averagesAvailable: boolean;
  averageSource: "BoI" | "TASE" | null;
  offerCount: number;
  rows: ProviderRowView[];
  theta: SiteValue;
  chart: ChartLine[];
  coverage: CoverageView;
  ruleIds: string[];
  pending: string[];
  years: number;
  exitMonth: number;
  /** Rows of the quiet block's providers whose recorded reason a disclosure shows, by id. */
  enteredWithoutOffer: boolean;
}

export type ProviderResult =
  | { kind: "ok"; view: ProviderWorkbenchView }
  | { kind: "error"; code: "no-fund" | "fund-type" | "need-rate" | "need-yield" | "other-currency" | "no-exposure" | "engine"; detail?: string; subject?: SubjectFund; currency?: string };

const FORMATS = ["pdf", "html", "xlsx"] as const;

function snapshotValues(s: FeesSnapshot, today: string): { tariff: RowTariff; stale: Staleness | null } {
  const stale = staleTariff(s.snapshot, today);
  const staleness: Staleness | null = stale ? { since: s.snapshot, cadence: "quarterly" } : null;
  const source = { url: s.tariff.url, title: s.tariff.title, publisher: s.provider.name_he, strength: "institution" as const };
  const date = (value: string, about: string, from: string | null): SiteValue => ownBy({
    value,
    unit: "text",
    source,
    checked: s.snapshot,
    effective_from: from,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
    about,
    stale: staleness,
    notes: "",
  } as SiteValue, s.provider.name_he);
  return {
    stale: staleness,
    tariff: {
      title: s.tariff.title,
      href: s.tariff.url,
      published: s.tariff.published ? date(s.tariff.published, "תאריך הפרסום של התעריפון", s.tariff.published) : null,
      snapshot: date(s.snapshot, "התאריך שבו האתר שמר עותק של התעריפון", null),
      format: (FORMATS as readonly string[]).includes(s.tariff.format) ? s.tariff.format : "pdf",
      stale,
    },
  };
}

const levelOf = (s: FeesSnapshot, ui: UiLevel, entered: boolean): FeeLevel => (entered ? "entered" : ui === "average" ? (s.provider.class === "bank" ? "regulator_average" : "tase_average") : "list");

/** Providers of the wrapper: every bank, broker and foreign-broker snapshot (F-83; the foreign class joined 2026-10-25 so the brokers page, the funds page and "השקעה במדד" list the same providers). */
export function providersOf(bundle: Pick<WorkbenchBundle, "snapshots">, wrapperId: string): FeesSnapshot[] {
  if (wrapperId !== BROKERAGE) return [];
  return bundle.snapshots.filter((s) => s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker").sort((a, b) => a.provider.name_he.localeCompare(b.provider.name_he, "he"));
}

export function averagesIn(snapshots: readonly FeesSnapshot[]): boolean {
  return snapshots.some((s) => s.averages.length > 0 || s.lines.some((l) => l.level !== "list"));
}

interface BuildArgs {
  bundle: WorkbenchBundle;
  wrapperId: string;
  query: ProviderQuery;
  inputs: WorkbenchInputs;
  offers: Record<string, EnteredOffer>;
  assumptions: FundAssumptions;
}

export function ruleContext(bundle: WorkbenchBundle): RunContext {
  return { rules: bundle.rules, runDate: bundle.today };
}

function ambiguity(message: string, s: FeesSnapshot): { detail: string; lines: { id: string; name: string; band: string | null }[] } | null {
  const m = /lines? apply \(([^)]*)\); the snapshot is ambiguous/.exec(message);
  if (!m) return null;
  const ids = m[1]!.split(",").map((x) => x.trim());
  return { detail: message, lines: ids.map((id) => { const l = s.lines.find((x) => x.id === id); return { id, name: l?.names.tariff[0] ?? id, band: l?.band ?? null }; }) };
}

export function buildProviderWorkbench(a: BuildArgs): ProviderResult {
  const { bundle, wrapperId, query, inputs, offers, assumptions } = a;
  const today = bundle.today;
  const subject = subjectOf(bundle, query.fund);
  if (!subject) return { kind: "error", code: "no-fund" };
  const exposure = bundle.exposures.find((e) => e.id === subject.exposureId);
  const run = fundRun(subject, exposure, inputs.grossReturn, assumptions, bundle.fx);
  if ("kind" in run) {
    const code = run.kind === "need-rate" ? "need-rate" : run.kind === "need-yield" ? "need-yield" : run.kind === "other-currency" ? "other-currency" : "fund-type";
    return { kind: "error", code, subject, ...(run.kind === "need-rate" ? { currency: run.currency } : {}), ...(run.kind === "other-currency" ? { detail: `${run.fund}|${run.exposure}` } : {}) };
  }

  const snapshots = providersOf(bundle, wrapperId);
  const averagesAvailable = averagesIn(snapshots);
  const level: UiLevel = query.level === "average" && !averagesAvailable ? "list" : query.level;
  const ordersN = query.orders ?? 1;
  const channelId: Channel = query.channel ?? "direct";

  const amount = inputs.amountNow;
  const profile: { ageAtStart?: number; annualIncome?: number } = {};
  if (inputs.age !== null) profile.ageAtStart = inputs.age;
  if (inputs.income !== null && inputs.income > 0) profile.annualIncome = inputs.income;
  const theta = ((bundle.p01 as unknown as { value: ValueObject }).value.value as number) / 100;
  const base = {
    goal: { amountNow: amount, monthly: inputs.monthly, months: 12 * inputs.years },
    market: { ...run.market, inflation: inputs.inflation },
    fund: run.fund,
    profile,
    behaviour: { ordersPerMonth: ordersN },
    instrumentClass: subject.instrumentClass,
    channel: channelId,
    ...(run.currency ? { currency: run.currency } : {}),
    ...(bundle.fx ? { fx: fxRunInput(bundle.fx) } : {}),
    theta,
  };

  // Which providers run at which level; an offer takes a provider to `entered` at the entered level only.
  const inputsFor: { s: FeesSnapshot; p: ProviderInput; offer: EnteredOffer | undefined }[] = snapshots.map((s) => {
    const offer = level === "entered" ? offers[s.id] : undefined;
    const lvl = levelOf(s, level, offer !== undefined);
    const p: ProviderInput = { snapshot: s, level: lvl, ...(offer ? { entered: toEnteredTariff(offer) as EnteredTariff } : {}) };
    return { s, p, offer };
  });

  // The engine refuses a tariff whose lines it cannot choose between (a plan, a sub-class). Such a provider is shown as not
  // comparable with the lines named, never given a guessed price; the engine runs on the rest.
  const ambiguous = new Map<string, NotComparable>();
  const runnable: typeof inputsFor = [];
  for (const x of inputsFor) {
    try {
      const built = !x.s.missing || x.p.level === "entered" ? buildTariff({ ...base, providers: [] }, x.p, x.s.missing ? { ...x.s, lines: [], averages: [] } : x.s) : null;
      // F-63 (2026-10-25): a tariff with no buy/sell line for the fund's class gives no price, not a free trade (a distributor
      // may charge for buying and selling tracking funds, MF-26); a money-market fund at a bank is the exception, bought free
      // under a distribution agreement (MF-26) and held free (BANK-18), so a missing line there stays a zero. 2026-10-26 (BRK OQ11
      // closed): at a non-bank member, which is mostly an investment marketer that MF-26 does not bind, it is no exception.
      const freeMoneyMarket = subject.instrumentClass === "money_market_units" && x.s.provider.class === "bank";
      if (built && built.noLine.includes("trade") && !freeMoneyMarket) {
        ambiguous.set(x.s.id, { code: "no-applicable-line", detail: `no trade line of the ${x.s.id} snapshot applies to ${subject.instrumentClass}` });
        continue;
      }
      runnable.push(x);
    } catch (e) {
      // Any other refusal is that provider's row: the engine names it (E5, 2026-10-25), never an error for the whole page.
      const amb = e instanceof RecordInputError ? ambiguity(e.message, x.s) : null;
      if (amb) ambiguous.set(x.s.id, { code: "ambiguous", ...amb });
      else runnable.push(x);
    }
  }

  let wb: ReturnType<typeof providerWorkbench>;
  try {
    wb = providerWorkbench({ ...base, providers: runnable.map((x) => x.p) }, ruleContext(bundle));
  } catch (e) {
    return { kind: "error", code: "engine", detail: e instanceof Error ? e.message : String(e), subject };
  }

  const snapOf = new Map(snapshots.map((s) => [s.id, s]));
  const offerOf = new Map(inputsFor.map((x) => [x.s.id, x.offer]));
  const compared = wb.ranking.order.map((id) => wb.rows.find((r): r is ComparedProvider => r.id === id && r.kind === "compared")!);
  const tieSet = new Set(wb.ranking.tieSet.length > 1 ? wb.ranking.tieSet : []);
  const costOf = (r: ComparedProvider) => r.horizonCost.value as number;
  const dearest = Math.max(1, ...compared.map(costOf));
  const years = inputs.years;

  const lineDetails = (r: ComparedProvider, s: FeesSnapshot, stale: Staleness | null): LineDetail[] =>
    r.linesUsed.flatMap((id) => {
      const l = s.lines.find((x) => x.id === id);
      if (!l) return [];
      const src = r.lineSources.find((x) => x.lineId === id);
      const lvl = src?.level ?? "list";
      const avg = lvl !== "list" && lvl !== l.level ? s.averages.find((x) => x.line_id === id && x.level === lvl) : undefined;
      const isAvg = lvl !== "list";
      // F-14 (2026-10-26): a non-bank member's custody line on a money-market fund is charged as published; its note says that
      // no rule limiting it was found, that a member with a distribution agreement for the fund may charge nothing on it (MF-26),
      // and what the regulators' report says of practice: a blanket waiver of custody proper only, a handling fee usually fixed
      // and often refunded (BRK-52). Practice, not a term of the tariff.
      const rate = withStale(avg ? avg.rate : l.rate, stale, s.provider.name_he);
      const mmfNonBank = l.base === "custody" && subject.instrumentClass === "money_market_units" && s.provider.class !== "bank";
      return [{
        id,
        base: l.base,
        name: l.names.tariff[0] ?? id,
        rate: mmfNonBank ? { ...rate, notes: r4workbench.providers.mmfCustodyNonBank } : rate,
        min: !isAvg && l.min && l.min.value !== null ? withStale(l.min, stale, s.provider.name_he) : null,
        max: !isAvg && l.max && l.max.value !== null ? withStale(l.max, stale, s.provider.name_he) : null,
        period: l.period,
        channel: l.channel,
        level: lvl,
      }];
    });

  const enteredLines = (offer: EnteredOffer, s: FeesSnapshot): EnteredLine[] => {
    const listRate = (base: string) => s.lines.find((l) => l.base === base && l.level === "list" && typeof l.rate.value === "number" && l.applies_to.some((x) => x === subject.instrumentClass || x === "all" || x === wrapperId) && (l.channel === null || l.channel === channelId))?.rate.value as number | undefined;
    const out: EnteredLine[] = [];
    const o = offer.lines;
    if (o.trade) out.push({ base: "trade", rate: o.trade.rate, min: o.trade.min ?? null, max: o.trade.max ?? null, aboveList: above(o.trade.rate, listRate("trade")) });
    if (o.custody) out.push({ base: "custody", rate: o.custody.rate, min: o.custody.min ?? null, max: o.custody.max ?? null, everyMonths: o.custody.everyMonths, aboveList: above(o.custody.rate, listRate("custody")) });
    if (o.fx) out.push({ base: "fx", rate: o.fx.rate, min: null, max: null, aboveList: above(o.fx.rate, listRate("fx")) });
    if (o.monthlyFee) out.push({ base: "fixed", rate: o.monthlyFee, min: null, max: null, aboveList: above(o.monthlyFee, listRate("fixed_period")) });
    return out;
  };

  const listOf = (s: FeesSnapshot, stale: Staleness | null): Partial<Record<FeeType, ListLine>> => {
    const out: Partial<Record<FeeType, ListLine>> = {};
    const bases: [FeeType, string][] = [["trade", "trade"], ["custody", "custody"], ["fx", "fx"], ["fixed", "fixed_period"]];
    for (const [type, base] of bases) {
      const found = s.lines.filter((l) => l.base === base && l.level === "list" && l.applies_to.some((x) => x === subject.instrumentClass || x === "all" || x === wrapperId) && !(l.excludes ?? []).includes(subject.instrumentClass) && (l.channel === null || l.channel === channelId));
      if (found.length !== 1) continue;
      const l = found[0]!;
      out[type] = { rate: withStale(l.rate, stale, s.provider.name_he), min: l.min && l.min.value !== null ? withStale(l.min, stale, s.provider.name_he) : null, max: l.max && l.max.value !== null ? withStale(l.max, stale, s.provider.name_he) : null, period: l.period };
    }
    return out;
  };

  const common = (s: FeesSnapshot) => {
    const { tariff, stale } = snapshotValues(s, today);
    return {
      id: s.id,
      name: s.provider.name_he,
      short: shortName(s.id, s.provider.name_he),
      providerClass: s.provider.class,
      broker: s.provider.class !== "bank",
      tariff,
      stale,
      minimums: { accountOpening: s.minimums.account_opening ? withStale(s.minimums.account_opening, stale, s.provider.name_he) : null },
      protection: { regulator: s.provider.regulator, ...(s.provider.regulator_foreign ? { foreignRegulator: s.provider.regulator_foreign.name_he } : {}), taseMember: s.provider.tase_member, ruleIds: [...s.provider.protection_rule_ids], notIsaSupervised: s.provider.protection_rule_ids.includes("BRK-06") } satisfies RowProtection,
      hasOffer: offers[s.id] !== undefined,
      vs: query.vs === s.id,
      list: listOf(s, stale),
    };
  };

  const rows: ProviderRowView[] = [];
  compared.forEach((r, i) => {
    const s = snapOf.get(r.id)!;
    const { stale: staleness, ...c } = common(s);
    const offer = offerOf.get(r.id);
    const sumPos = r.byType.reduce((acc, t) => acc + Math.max(0, t.cost), 0) || 1;
    const lift2 = (n: number, about: string): SiteValue => ({ ...computed(n, "nis", "F-63", {}, { today, about }), stale: staleness });
    const above2 = i > 0 ? compared[i - 1]! : null;
    let deciding: ProviderRowView["deciding"];
    if (above2 && !(tieSet.has(r.id) && tieSet.has(above2.id))) {
      // F-63's test applied pairwise down the table (flow 28 method note): the type with the largest absolute gap to the row above.
      const gaps: Partial<Record<FeeType, SiteValue>> = {};
      let line: FeeType | null = null;
      let best = 0;
      for (const t of feeTypes) {
        const mine = r.byType.find((x) => x.line === t);
        const theirs = above2.byType.find((x) => x.line === t);
        if (!mine && !theirs) continue;
        const gap = (mine?.cost ?? 0) - (theirs?.cost ?? 0);
        gaps[t] = lift2(gap, `${t}`);
        if (Math.abs(gap) > best) {
          best = Math.abs(gap);
          line = t;
        }
      }
      deciding = { against: above2.id, againstName: shortName(above2.id, above2.name), line, gaps };
    }
    const usedFx = r.tariff.fx !== undefined;
    const noLine: ("trade" | "custody" | "fx")[] = [...r.noLine];
    if (run.currency && !usedFx) noLine.push("fx");
    const perTrade = r.linesUsed.flatMap((id) => {
      const l = s.lines.find((x) => x.id === id);
      if (!l || l.base !== "trade") return [];
      const min = l.min && l.min.value !== null ? withStale(l.min, staleness, s.provider.name_he) : null;
      const max = l.max && l.max.value !== null ? withStale(l.max, staleness, s.provider.name_he) : null;
      return min || max ? [{ name: l.names.tariff[0] ?? id, min, max }] : [];
    });
    rows.push({
      ...c,
      kind: "ranked",
      rank: tieSet.has(r.id) ? 1 : i + 1,
      tiedWith: tieSet.has(r.id) ? [...tieSet].filter((x) => x !== r.id) : [],
      horizonCost: lift(r.horizonCost, staleness, today, s.provider.name_he),
      yearOneCost: lift(r.yearOneCost, staleness, today, s.provider.name_he),
      real: r.real,
      byType: r.byType.map((t) => ({ type: t.line as FeeType, cost: lift2(t.cost, t.line), share: Math.max(0, t.cost) / sumPos })),
      interaction: lift2(r.interaction, "interaction"),
      barScale: Math.max(0, costOf(r)) / dearest,
      ...(deciding ? { deciding } : {}),
      minimums: { ...c.minimums, perTrade },
      notModelled: r.notModelled.map((n) => ({ lineId: n.lineId, name: s.lines.find((l) => l.id === n.lineId)?.names.tariff[0] ?? n.lineId, reason: n.reason.startsWith("F-18") ? ("F-18" as const) : ("no-formula" as const) })),
      noLine,
      fixedSpread: r.flags.filter((f) => f.startsWith("fixed-fee-spread:")).map((f) => s.lines.find((l) => l.id === f.slice("fixed-fee-spread:".length))?.names.tariff[0] ?? f),
      lines: lineDetails(r, s, staleness),
      ...(offer ? { offer: { offer, lines: enteredLines(offer, s) } } : {}),
      ruleIds: r.run.rules.map((x) => x.id),
      pending: r.flags.includes("F-18") ? ["F-18"] : [],
    });
  });

  const nonRanked: ProviderRowView[] = snapshots
    .filter((s) => !compared.some((r) => r.id === s.id))
    .map((s) => {
      const { stale: _stale, ...c } = common(s);
      void _stale;
      const row = wb.rows.find((r) => r.id === s.id);
      const reason: NotComparable =
        ambiguous.get(s.id) ??
        (row && row.kind === "not-comparable"
          ? row.reason.code === "data-missing"
            ? { code: "data-missing", recorded: row.reason.detail }
            : row.reason.code === "line-without-value"
              ? { code: "line-without-value", detail: row.reason.detail, lineName: s.lines.find((l) => l.id === (row.reason.detail ?? "").split(" ")[0])?.names.tariff[0] ?? null }
              : { code: row.reason.code, detail: row.reason.detail }
          : { code: "data-missing", recorded: null });
      return { ...c, kind: "not-comparable" as const, tiedWith: [], minimums: { ...c.minimums, perTrade: [] }, notModelled: [], noLine: [], fixedSpread: [], lines: [], reason, ruleIds: [], pending: [] };
    });

  // F-83 over every provider once, the ones the engine did not see included (flow 28 step 8).
  const cov = coverageLine(
    [
      ...rows.map((r) => ({ id: r.id, name: r.name, kind: "ranked" as const, reasons: [] })),
      ...nonRanked.map((r) => ({ id: r.id, name: r.name, kind: "not-evaluated" as const, reasons: [] })),
    ],
    ["ranked", "not-evaluated"] as const,
    ["ranked"],
  );

  // the chart: ranks 1 to 3 and the `vs` provider are drawn; every compared provider's series is kept for the table view (flow 28 step 7)
  const roles = ["rank-1", "rank-2", "rank-3"] as const;
  const chart: ChartLine[] = compared.map((r, i) => {
    const series = cumulativeProviderFees(r);
    const row = rows.find((x) => x.id === r.id)!;
    const role: ChartLine["role"] = i < 3 ? roles[i]! : r.id === query.vs ? "vs" : null;
    return { id: r.id, name: r.name, short: shortName(r.id, r.name), role, entered: r.feeState === "entered", real: series.map((p) => p.real), nominal: series.map((p) => p.nominal), horizonCost: row.horizonCost! };
  });

  const ruleIds = new Set<string>();
  rows.forEach((r) => {
    r.ruleIds.forEach((id) => ruleIds.add(id));
    r.protection.ruleIds.forEach((id) => ruleIds.add(id));
  });
  nonRanked.forEach((r) => r.protection.ruleIds.forEach((id) => ruleIds.add(id)));
  const pending = [...new Set(rows.flatMap((r) => r.pending))];

  const view: ProviderWorkbenchView = {
    wrapperId,
    subject,
    behaviour: {
      orders: query.orders !== null ? enteredValue(query.orders, "count", today, "פעולות בחודש") : a28Value(1, "פעולות בחודש", today),
      ordersN,
      channel: query.channel !== null ? { ...enteredValue(0, "text", today, "ערוץ"), value: query.channel } : { ...a28Value(0, "ערוץ", today), unit: "text", value: "direct" },
      channelId,
      fxCurrency: run.currency ? run.currency.code : null,
      deposits: a28Value(12, "הפקדות בשנה", today),
      anyBank: snapshots.some((s) => s.provider.class === "bank"),
      anyBroker: snapshots.some((s) => s.provider.class !== "bank"),
    },
    level,
    effectiveLevel: level,
    averagesAvailable,
    averageSource: averagesAvailable ? (snapshots.some((s) => s.provider.class === "bank" && (s.averages.length > 0 || s.lines.some((l) => l.level === "regulator_average"))) ? "BoI" : "TASE") : null,
    offerCount: Object.keys(offers).filter((id) => snapOf.has(id)).length,
    rows: [...rows, ...nonRanked],
    theta: parameterValue(bundle.p01, (bundle.p01 as unknown as { value: ValueObject }).value),
    chart,
    coverage: { considered: cov.considered, ranked: rows.map((r) => ({ id: r.id, name: r.name })), notComparable: nonRanked.map((r) => ({ id: r.id, name: r.name, code: r.reason!.code, reason: r.reason! })), invariantOk: cov.invariant.ok },
    ruleIds: [...ruleIds],
    pending,
    years,
    exitMonth: chart[0]?.real.length ? chart[0].real.length - 1 : 12 * years,
    enteredWithoutOffer: level === "entered" && Object.keys(offers).filter((id) => snapOf.has(id)).length === 0,
  };
  return { kind: "ok", view };
}

function above(rate: SiteValue, listRate: number | undefined): boolean {
  return listRate !== undefined && typeof rate.value === "number" && rate.value > listRate;
}

// ---------------------------------------------------------------- provident wrappers: a sourced listing

export interface ListingLine {
  id: string;
  line: string;
  base: string;
  rate: SiteValue;
}

/** One company's card: its lines of the tariff (one fee base each), the company id its page is addressed by. */
export interface ListingCard {
  provider: string;
  providerName: string;
  /** The regulator's company id, or null when the data holds no company of that name (then the name is not a link). */
  companyId: string | null;
  lines: ListingLine[];
  tariff: RowTariff;
}

export interface Listing {
  cards: ListingCard[];
  /** Managing companies the regulator's data holds for this wrapper (0 when the bundle does not say). */
  companies: number;
  ruleIds: string[];
}

/** The page address of a provider's company: the regulator's id, never the snapshot slug (that route does not exist). */
export function companyHref(card: Pick<ListingCard, "companyId">): string | null {
  return card.companyId ? `/companies/${card.companyId}` : null;
}

/** For a provident wrapper the providers are managers whose list fees the snapshots hold; nothing is ranked (flows 15.5). One card per company. */
export function buildProvidentListing(bundle: WorkbenchBundle, wrapperId: string): Listing {
  const cards: ListingCard[] = [];
  for (const s of bundle.snapshots) {
    if (s.missing || s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker") continue;
    const { tariff, stale } = snapshotValues(s, bundle.today);
    const lines: ListingLine[] = [];
    for (const l of s.lines) {
      if (l.level !== "list" || !l.applies_to.includes(wrapperId) || (l.base !== "balance" && l.base !== "deposit" && l.base !== "direct_expenses")) continue;
      lines.push({ id: l.id, base: l.base, rate: withStale(l.rate, stale, s.provider.name_he), line: l.names.tariff[0] ?? (guideBlocks.fees as Record<string, { name: string }>)[l.base]?.name ?? l.base });
    }
    if (lines.length) cards.push({ provider: s.id, providerName: s.provider.name_he, companyId: bundle.providerCompany?.[s.id] ?? null, lines, tariff });
  }
  return { cards, companies: bundle.wrapperCompanies?.[wrapperId] ?? 0, ruleIds: [] };
}
