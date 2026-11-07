// The securities data in the browser and at build: the bundle of every bank and broker snapshot, fund and exposure record
// the index page and the funds page read, how one fund runs through the engine, and the provident wrappers' listing. The
// page that ranked the houses on one fund was removed (issue 172); the index page ranks them. No fee, rate or rule figure
// is written here: tariffs come from the snapshots in the bundle, and every number leaves as a value object with its
// state. Pure: no storage; the bundle is fetched once.
import { fundOf, lineClasses, recordDistribution, type RunContext } from "@finance-tool/engine";
import type { ExposureRecord, FeesSnapshot, FundListFile, FundRecord, ParameterRecord, RuleRecord, ValueObject } from "@finance-tool/schema";
import { flags as flagCopy, formulaNames, guideBlocks } from "../copy";
import { nisPerNumber, type FxHistory, type FxSnapshot } from "./fx";
import type { EnteredInBundle } from "./custom-entries";
import { computed, ownBy, type SiteValue, type Staleness } from "./value";

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

const PRICED_ON_PREMISE = ["mutual_fund_units", "etf_units", "tase_foreign_fund_units", "foreign_securities"];
/**
 * A bank's or broker's lines for ranking (founder, 2026-10-31): a kind of holding keeps its price only where the record's
 * `availability` quotes the document saying a person can do it. Pages that show a tariff as printed read the record itself.
 */
export function onlyWhatCanBeDone<S extends FeesSnapshot>(s: S): S {
  if (!["bank", "broker", "foreign_broker"].includes(s.provider.class) || s.missing) return s;
  const can = new Set<string>((s.availability ?? []).filter((a) => a.available === true).flatMap((a) => a.applies_to));
  const blocked = (c: string) => PRICED_ON_PREMISE.includes(c) && !can.has(c);
  const lines = s.lines.flatMap((l) => {
    if (!l.applies_to.some(blocked)) return [l];
    const applies_to = l.applies_to.filter((c) => !blocked(c));
    return applies_to.length ? [{ ...l, applies_to }] : [];
  });
  return { ...s, lines };
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
  /** The broker and fund the person typed (D44): only the index page's copy of the bundle has them (`withCustomEntries`). */
  entered?: EnteredInBundle;
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
  pepper: "פפר",
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

/** D31: a tariff figure of a provider, shown on that provider's row, is the provider's own. */
const withStale = (v: ValueObject, stale: Staleness | null, owner: string): SiteValue => ownBy({ ...v, stale } as SiteValue, owner);

// ---------------------------------------------------------------- the subject fund

interface SubjectFund {
  recordId: string;
  name: string;
  number: string;
  instrumentClass: string;
  currency: string;
  exposureId: string;
  fromP05: boolean;
  record: FundRecord;
}

/**
 * A fee this fund does not have, not one left uncollected (issue 156). The variable fee and the trustee fee are lines of Israeli fund law (ETF-14, MF-20),
 * which does not apply to a foreign fund (ETF-71), so its record holds null for them. A value object with no value is a fee not collected.
 */
export const feeAbsent = (rec: FundRecord, key: keyof FundRecord["fees"]): boolean => rec.domicile !== "IL" && (key === "variable_management" || key === "trustee") && !rec.fees[key];

/** The tariff class a fund falls under (`applies_to` of a snapshot line). A TASE-listed foreign fund is its own class, read on the exchange-traded lines (`lineClasses`). */
export function instrumentClassOf(rec: FundRecord, exposure: ExposureRecord | undefined): string {
  if (exposure?.cash_like) return "money_market_units";
  const israeli = rec.domicile === "IL";
  if (!israeli) return rec.trading_currency_on_tase ? "tase_foreign_fund_units" : "foreign_securities";
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

type RunSpecError = { kind: "fund-type" } | { kind: "need-rate"; currency: string } | { kind: "need-yield" } | { kind: "other-currency"; fund: string; exposure: string };

/** The run inputs a fund fixes: its kind and drag (the same builder as F-65), the currency and how the return is quoted (F-04). */
export function fundRun(
  s: SubjectFund,
  exposure: Pick<ExposureRecord, "cash_like" | "currency"> | undefined,
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
  // A-10: the record's yield, read from the fund's own documents; a yield is entered only for a fund whose record has none
  const entered = assumptions.distributions?.[rec.id];
  const dist = recordDistribution(rec) ?? (entered ? { yield: entered.yield / 100, perYear: entered.perYear } : undefined);
  if (rec.distribution_policy === "distributing" && !dist) return { kind: "need-yield" };
  if (rec.distribution_policy === "distributing" && !israeli && rec.domicile !== "US" && rec.domicile !== "IE") return { kind: "fund-type" };
  const built = fundOf(rec, kind, rec.distribution_policy === "distributing" ? dist : undefined, assumptions.w8ben);
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
  /**
   * The indices page alone (D64): a bank's row counts its current account's monthly minimum (F-102), except at `own`, the bank the
   * person marked as theirs (null: none marked, every bank counts it). Absent on every other page, where no row counts it.
   */
  currentAccounts?: { own: string | null };
}

// ---------------------------------------------------------------- the view

export interface RowTariff {
  title: string;
  href: string;
  published: SiteValue | null;
  snapshot: SiteValue;
  format: "pdf" | "html" | "xlsx";
  stale: boolean;
}

export type NotComparable =
  | { code: "data-missing"; recorded: string | null }
  | { code: "no-applicable-line"; detail: string }
  | { code: "no-average"; detail: string }
  | { code: "line-without-value"; detail: string; lineName: string | null }
  /** 2026-10-25 (engine E1, E2, E5): a per-share line and no share price; a line in a foreign currency and no rate; a record the engine cannot read. */
  | { code: "needs-share-price" | "needs-fx-rate" | "record-error"; detail: string }
  | { code: "ambiguous"; detail: string; lines: { id: string; name: string; band: string | null }[] }
  /** 2026-11-04: the house's trade lines abroad name one exchange (`venue`) and the fund trades on the other. */
  | { code: "other-venue"; venue: "us" | "europe" };

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

/** Providers of the wrapper: every bank, broker and foreign-broker snapshot (F-83; the foreign class joined 2026-10-25 so the brokers page, the funds page and "השקעה במדד" list the same providers). */
export function providersOf(bundle: Pick<WorkbenchBundle, "snapshots">, wrapperId: string): FeesSnapshot[] {
  if (wrapperId !== BROKERAGE) return [];
  // a house that is part of another (PEPPER of Leumi, founder 2026-11-04: PEPPER Invest moved into Leumi Trade) is not a house of its own
  return bundle.snapshots.filter((s) => (s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker") && !s.provider.part_of).sort((a, b) => a.provider.name_he.localeCompare(b.provider.name_he, "he"));
}

export function ruleContext(bundle: WorkbenchBundle): RunContext {
  return { rules: bundle.rules, runDate: bundle.today };
}

// ---------------------------------------------------------------- provident wrappers: a sourced listing

interface ListingLine {
  id: string;
  line: string;
  base: string;
  rate: SiteValue;
}

/** One company's card: its lines of the tariff (one fee base each), the company id its page is addressed by. */
interface ListingCard {
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
