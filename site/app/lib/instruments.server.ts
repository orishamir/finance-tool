// Instrument terms for the guide pages' illustrative run (method §2.4 "Instrument terms"): the loaders of the
// instrument collections and the step from the records P-05's `instruments` map names to the engine's
// `InstrumentTerms`. Server-only. Nothing here holds a rate or a term: every number comes from a record under
// `data/` and keeps its value object, so the values sheet can show its source.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { memberKindOf, STANDING_ORDER_BAND, type InstrumentTerms } from "@finance-tool/engine";
import { instrumentClassOf } from "./providers";
import {
  catalogEntry,
  depositTerms,
  exposureRecord,
  fundRecord,
  type CatalogEntry,
  type DepositTerms,
  type ExposureRecord,
  type FeeLine,
  type FeesSnapshot,
  type FundRecord,
  type ParameterRecord,
  type RuleRecord,
  type ValueObject,
} from "@finance-tool/schema";
import type { z } from "zod";
import { loadSecurities, root } from "./data.server";
import { exposureFoldedInto } from "./guide-nav";
import { cmaFeeValue, depositFeeNoneByRule, ruleFigure, type SiteValue } from "./value";
import { readParsedCached } from "./read-cache.server";

// The two helpers of data.server.ts are private there; copied, not imported (both read through the one cache).
function readJson<T extends z.ZodType>(path: string, schema: T): z.infer<T> {
  return readParsedCached(path, schema);
}

function readDir<T extends z.ZodType>(sub: string, schema: T): { file: string; record: z.infer<T> }[] {
  const dir = join(root, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, record: readJson(join(dir, f), schema) }));
}

/** Of several dated files of one record id (`<id>@<date>.json`), the one with the latest date in its name. */
function latestPerId<T extends { id: string }>(rows: { file: string; record: T }[]): T[] {
  const best = new Map<string, { date: string; record: T }>();
  for (const { file, record } of rows) {
    const date = /@(\d{4}-\d{2}(?:-\d{2})?)\.json$/.exec(file)?.[1] ?? "";
    const prev = best.get(record.id);
    if (!prev || date > prev.date) best.set(record.id, { date, record });
  }
  return [...best.values()].map((b) => b.record);
}

export function loadDepositTerms(): DepositTerms[] {
  return latestPerId(readDir("data/terms/deposits", depositTerms));
}

export function loadFunds(): FundRecord[] {
  return latestPerId(readDir("data/funds", fundRecord));
}

export function loadExposures(): ExposureRecord[] {
  return readDir("data/instruments/exposures", exposureRecord).map((r) => r.record);
}

/** The security whose page an exposure's page is (D6 as amended 2026-10-27), by exposure id; absent when it keeps its own page. */
export function exposureFolds(): Record<string, string> {
  const securities = loadSecurities();
  const out: Record<string, string> = {};
  for (const e of loadExposures()) {
    const into = exposureFoldedInto(e.wrapper_ids ?? [], securities);
    if (into) out[e.id] = into;
  }
  return out;
}

/** Where a link to an exposure goes: its own page, or the page of the security it is. */
export function exposureHref(id: string): string {
  const into = exposureFolds()[id];
  return into ? `/guide/${into}` : `/exposure/${id}`;
}

/** data/catalog/: the institution-facing names (data-schema 3.10). */
export function loadCatalog(): CatalogEntry[] {
  return readDir("data/catalog", catalogEntry).map((r) => r.record);
}

/** The company (legal id) each catalogue institution is: the one the tracks its entries name belong to. */
export function institutionCompanies(catalog: CatalogEntry[], tracks: { fundId: number; companyId: string }[]): Map<string, string> {
  const votes = new Map<string, Map<string, number>>();
  for (const c of catalog) {
    for (const id of c.maps_to.track_ids) {
      const t = tracks.find((x) => x.fundId === id);
      if (!t) continue;
      const m = votes.get(c.institution) ?? new Map<string, number>();
      m.set(t.companyId, (m.get(t.companyId) ?? 0) + 1);
      votes.set(c.institution, m);
    }
  }
  return new Map([...votes].map(([inst, m]) => [inst, [...m].sort((a, b) => b[1] - a[1])[0]![0]]));
}

/** A catalogue entry's source as a value object: the date it was seen, with where (institution strength; the entry's own URL when it has one). */
export function seenValue(c: CatalogEntry): SiteValue {
  const url = /https?:\/\/\S+/.exec(c.where_seen)?.[0]?.replace(/[;,)]+$/, "") ?? `data/catalog/${c.id}.json`;
  return {
    value: c.seen_on,
    unit: "text",
    source: { url, title: c.where_seen, publisher: c.institution, strength: "institution" },
    checked: c.seen_on,
    effective_from: c.seen_on,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
    notes: c.seen_by,
  };
}

/** Where a name was seen, without the URL (the URL is behind the number). */
export function seenWhere(c: CatalogEntry): string {
  return c.where_seen.replace(/,?\s*https?:\/\/\S+/g, "").replace(/;\s*$/, "").trim();
}

/** How a near-duplicate's resolution reads (data-schema 3.10: free text; the first words say which). */
export function resolutionOf(text: string): "distinct" | "twice" | "unresolved" | null {
  if (/^unresolved/i.test(text)) return "unresolved";
  if (/^a different/i.test(text)) return "distinct";
  if (/twice|duplicate/i.test(text.slice(0, 60))) return "twice";
  return null;
}

// ---------------------------------------------------------------- the step to InstrumentTerms

type InstrumentSpec = NonNullable<ParameterRecord["instruments"]>[string];
type Family = "deposit" | "securities" | "makam" | "bond";

export interface InstrumentSources {
  fees: FeesSnapshot[];
  funds: FundRecord[];
  deposits: DepositTerms[];
  rules: Record<string, RuleRecord>;
  today: string;
}

export type InstrumentResult = { terms: InstrumentTerms; feeValues: Record<string, SiteValue> } | { missing: string[] };

const pct = (v: ValueObject) => (v.value as number) / 100;
const isNum = (v: ValueObject | null | undefined): v is ValueObject => !!v && typeof v.value === "number" && Number.isFinite(v.value);
const monthsOf = { month: 1, quarter: 3, year: 12 } as const;

/** A text value (a linkage, a fund kind) carried with the record's own source, so the sheet can show it. */
function textValue(value: string, unit: ValueObject["unit"], from: Pick<ValueObject, "source" | "checked">, notes: string): SiteValue {
  return { value, unit, source: from.source, checked: from.checked, effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced", notes };
}

/**
 * Builds the terms of one wrapper's run from the records `spec` names. Returns the missing inputs, one line each,
 * when a record is absent or does not hold what the run needs; it never guesses and never throws for missing data.
 */
export function buildInstrumentTerms(wrapperId: string, family: Family, spec: InstrumentSpec | undefined, src: InstrumentSources): InstrumentResult {
  if (!spec) return { missing: [`P-05 instruments has no entry for ${wrapperId}`] };
  const missing: string[] = [];
  const feeValues: Record<string, SiteValue> = {};
  const terms: InstrumentTerms = {};

  if (family === "deposit") {
    const rec = spec.deposit_terms ? src.deposits.find((d) => d.id === spec.deposit_terms) : undefined;
    if (!spec.deposit_terms) missing.push(`${wrapperId}: P-05 instruments names no deposit_terms`);
    else if (!rec) missing.push(`${wrapperId}: data/terms/deposits/ has no record "${spec.deposit_terms}"`);
    else {
      if (rec.wrapper_id !== wrapperId) missing.push(`${wrapperId}: deposit terms "${rec.id}" are for ${rec.wrapper_id}`);
      // A current account has no term (its record's term_months is null); the ledger runs it as a month-to-month balance (F-26, termMonths 1).
      const noTerm = wrapperId === "current-account";
      if (!noTerm && (!isNum(rec.term_months) || rec.term_months.unit !== "months")) missing.push(`${wrapperId}: "${rec.id}" term_months is not a number of months`);
      // The ledger knows unlinked, cpi and prime (taxed as unlinked, TXI-04); a foreign-currency deposit has no ledger.
      let linkage: "unlinked" | "cpi" | "prime" | null = null;
      if (rec.linkage === "cpi") linkage = "cpi";
      else if (rec.linkage === "none") linkage = rec.anchor === "prime" ? "prime" : "unlinked";
      else missing.push(`${wrapperId}: "${rec.id}" is linked to ${rec.linkage}; the deposit run has no such linkage`);
      if (missing.length === 0 && linkage) {
        terms.deposit = { termMonths: noTerm ? 1 : (rec.term_months.value as number), linkage };
        if (!noTerm) feeValues.term = { ...rec.term_months };
        feeValues.linkage = textValue(linkage, "text", { source: rec.source, checked: rec.snapshot }, `from the record's linkage "${rec.linkage}"${rec.anchor ? ` and anchor "${rec.anchor}"` : ""}`);
      }
    }
  } else if (family === "securities") {
    const fund = buildFund(wrapperId, spec, src, missing, feeValues);
    if (fund) terms.fund = fund;
    const isMmf = wrapperId === "money-market-fund-daily" || wrapperId === "money-market-fund-renewable";
    const tariff = isMmf ? buildMoneyMarketTariff(wrapperId, src, missing, feeValues) : buildTariff(wrapperId, "securities", spec, src, missing, feeValues);
    if (tariff) terms.tariff = tariff;
    // F-14: the member's kind decides custody on money-market units; the money-market funds are modelled at a bank (MF-26, BANK-18)
    const member = isMmf ? undefined : memberOf(src, spec.tariff);
    if (tariff && member) terms.memberKind = member;
    if (wrapperId === "ira-hishtalmut") {
      const managerFee = buildIraFee(wrapperId, spec, src, missing, feeValues);
      if (managerFee !== null) terms.ira = { managerFee, clockStartMonth: 0 };
    }
  } else if (family === "makam") {
    const tariff = buildTariff(wrapperId, "makam", spec, src, missing, feeValues);
    if (tariff) terms.tariff = tariff;
    // F-14: a bank may not charge custody on makam (BRK-17); P-05's tariff names its provider, whose class says which it is
    const member = memberOf(src, spec.tariff);
    if (tariff && member) terms.memberKind = member;
    // The series term is optional (GOV-22, GOV-23): read from the rule P-05 names, else the ledger's default.
    if (spec.series_rule) {
      const term = figure(src, spec.series_rule, "term_months");
      if (isNum(term) && term.unit === "months") {
        terms.makam = { termMonths: term.value as number };
        feeValues.term = term;
      } else console.log(`[guide] ${wrapperId}: rule ${spec.series_rule} has no figure "term_months" in months (the ledger's default term is used)`);
    }
  } else {
    const tariff = buildTariff(wrapperId, "bond", spec, src, missing, feeValues);
    if (tariff) terms.tariff = tariff;
    if (!spec.series_rule) missing.push(`${wrapperId}: P-05 instruments names no series_rule (GOV rule for linkage and coupon dates)`);
    else if (!src.rules[spec.series_rule]) missing.push(`${wrapperId}: data/rules/ has no record "${spec.series_rule}"`);
    else {
      const linkage = figure(src, spec.series_rule, "linkage");
      const every = figure(src, spec.series_rule, "coupon_every_months");
      if (!linkage || (linkage.value !== "cpi" && linkage.value !== "unlinked")) missing.push(`${wrapperId}: rule ${spec.series_rule} has no figure "linkage" ("cpi" or "unlinked")`);
      if (!isNum(every) || every.unit !== "months") missing.push(`${wrapperId}: rule ${spec.series_rule} has no figure "coupon_every_months" in months`);
      if (linkage && isNum(every) && (linkage.value === "cpi" || linkage.value === "unlinked")) {
        // A-27: sold at par, so the price change at exit is 0 (a convention of the method, not a source figure).
        terms.bond = { linkage: linkage.value, couponEveryMonths: every.value as number, exitPriceChange: 0 };
        feeValues.linkage = linkage;
        feeValues.couponEvery = every;
      }
    }
  }

  return missing.length > 0 ? { missing } : { terms, feeValues };
}

/**
 * A study fund's terms for the provident run (A-12): employment, salary and the 6-year clock from month 0.
 * The illustrative run uses what P-05's `instruments` entry says; an employee's salary would be the person's entered
 * profile, so an `employee` entry has no salary here and is reported missing rather than guessed.
 */
export function buildHishtalmutTerms(wrapperId: string, spec: InstrumentSpec | undefined, p05: ParameterRecord): { hishtalmut: NonNullable<InstrumentTerms["hishtalmut"]>; feeValues: Record<string, SiteValue> } | { missing: string[] } {
  if (!spec?.employment) return { missing: [`${wrapperId}: P-05 instruments names no employment for the study-fund run`] };
  if (spec.employment === "employee") return { missing: [`${wrapperId}: an employee's run needs a salary, which comes from the person's entered profile, not from P-05`] };
  const note = (p05 as unknown as { inputs?: Record<string, ValueObject> }).inputs?.amount_now;
  const from = note ?? { source: { url: "docs/parameters-rationale.md#illustrative-scenario", title: "illustrative scenario", publisher: "founder", strength: "primary" as const }, checked: p05.signed_off_on };
  return {
    hishtalmut: { employment: spec.employment, clockStartMonth: 0 },
    feeValues: {
      employment: {
        value: spec.employment,
        unit: "text",
        source: from.source,
        checked: from.checked,
        effective_from: null,
        effective_to: null,
        update_rule: "founder",
        state: "sourced",
        notes: "the employment type the illustrative study-fund run uses (P-05 instruments)",
      },
    },
  };
}

/** F-14: the member kind of the provider whose latest snapshot P-05's tariff entry names (`memberKindOf` its class). */
function memberOf(src: InstrumentSources, provider: string | undefined): InstrumentTerms["memberKind"] | undefined {
  const snap = provider ? src.fees.filter((f) => f.id === provider).sort((a, b) => a.snapshot.localeCompare(b.snapshot)).at(-1) : undefined;
  return snap ? memberKindOf(snap.provider.class) : undefined;
}

function figure(src: InstrumentSources, ruleId: string, name: string): SiteValue | null {
  const r = src.rules[ruleId];
  return r ? ruleFigure(r, name, src.today) : null;
}

function snapshotOf(src: InstrumentSources, provider: string | undefined, what: string, wrapperId: string, missing: string[]): FeesSnapshot | null {
  if (!provider) {
    missing.push(`${wrapperId}: P-05 instruments names no ${what}`);
    return null;
  }
  // data/fees/ files are <provider>@<date>.json and each carries its provider id; the latest snapshot wins.
  const all = src.fees.filter((f) => f.id === provider).sort((a, b) => a.snapshot.localeCompare(b.snapshot));
  const snap = all.at(-1);
  if (!snap) missing.push(`${wrapperId}: data/fees/ has no snapshot of "${provider}"`);
  else if (snap.missing) missing.push(`${wrapperId}: the ${provider} snapshot is marked missing (${snap.missing_reason ?? "no reason given"})`);
  return snap && !snap.missing ? snap : null;
}

/** The security types (data-schema 2, `fee.applies_to`) a tariff line may name for the instruments a wrapper holds. */
const securityTypesOf: Record<string, string[]> = {
  makam: ["makam"],
  "government-bond": ["tase_bonds", "tase_shares_bonds"],
  "brokerage-account": ["tase_shares_bonds", "etf_units", "mutual_fund_units", "tase_foreign_fund_units", "foreign_securities"],
  "ira-hishtalmut": ["tase_shares_bonds", "etf_units", "mutual_fund_units", "tase_foreign_fund_units", "foreign_securities"],
  "money-market-fund-daily": ["money_market_units", "mutual_fund_units"],
  "money-market-fund-renewable": ["money_market_units", "mutual_fund_units"],
};

/**
 * The list lines of a base that apply to a wrapper. Review fix 2026-10-24: lines of the direct (online) channel, and lines with no channel, come before
 * branch lines, so the site's default tariff (the first line) is the direct one, as the providers workbench and the provider picker rank it (`channelId` defaults to "direct").
 */
function listLines(snap: FeesSnapshot, wrapperId: string, base: FeeLine["base"]): FeeLine[] {
  const types = securityTypesOf[wrapperId] ?? [];
  const rank = (l: FeeLine) => (l.channel === null || l.channel === "direct" ? 0 : 1);
  // a line that excludes the product's own security type (a bank's custody line leaves out makam, BRK-17) does not apply to it
  const excluded = (l: FeeLine) => (l.excludes ?? []).some((x) => types.includes(x));
  return snap.lines.filter((l) => l.level === "list" && l.base === base && l.band !== STANDING_ORDER_BAND && (l.applies_to.includes(wrapperId) || l.applies_to.includes("all") || l.applies_to.some((a) => types.includes(a))) && !excluded(l)).sort((a, b) => rank(a) - rank(b));
}

function buildFund(wrapperId: string, spec: InstrumentSpec, src: InstrumentSources, missing: string[], feeValues: Record<string, SiteValue>) {
  if (!spec.fund) {
    missing.push(`${wrapperId}: P-05 instruments names no fund`);
    return null;
  }
  const rec = src.funds.find((f) => f.id === spec.fund);
  if (!rec) {
    missing.push(`${wrapperId}: data/funds/ has no record "${spec.fund}"`);
    return null;
  }
  const before = missing.length;
  type Fund = NonNullable<InstrumentTerms["fund"]>;
  const track = rec.tax_status.il_fund_tax_track;
  let kind: Fund["kind"] | null = null;
  const israeli = /^(il|israel)$/i.test(rec.domicile);
  if (wrapperId === "money-market-fund-renewable") kind = "money-market-renewable";
  else if (wrapperId === "money-market-fund-daily") kind = track === "taxable" ? "money-market-taxable" : "money-market-daily";
  else if (israeli) {
    if (track === "exempt") kind = "israeli-fund";
    else missing.push(`${wrapperId}: fund "${rec.id}" is an Israeli fund with tax track ${track}; only exempt funds are modelled outside money-market funds`);
  } else if (rec.trading_currency_on_tase) {
    kind = "tase-foreign-fund";
  } else kind = "foreign-fund";
  if (!kind) return null;

  const fund: Fund = { kind };
  const isMmf = kind.startsWith("money-market");
  if (rec.distribution_policy === "distributing") missing.push(`${wrapperId}: fund "${rec.id}" distributes, and its distribution yield (A-10) is not on the record`);
  if (rec.currency !== "ILS" && rec.currency !== "NIS") missing.push(`${wrapperId}: fund "${rec.id}" is in ${rec.currency}; the exchange-rate change (A-03) and the start rate are not in P-05`);
  if (kind === "tase-foreign-fund") {
    const t = rec.tax_status.tase_foreign_fund_90pct_test;
    if (t && typeof t.value === "boolean") {
      fund.ninetyPercentTest = t.value;
      feeValues.ninetyPercentTest = { ...t };
    } else missing.push(`${wrapperId}: fund "${rec.id}" has no 90% test value (TXF-04)`);
  }
  if (kind === "foreign-fund") {
    const d = rec.domicile.toUpperCase();
    if (d === "US" || d === "IE") fund.domicile = d === "US" ? "us" : "ireland";
    else missing.push(`${wrapperId}: fund "${rec.id}" is domiciled in ${rec.domicile}; the ledger knows US and Ireland`);
  }

  // F-10 drag, percent to fraction. A renewable money-market fund's expected yield is already net of its fees (MF-37), so no drag.
  if (kind !== "money-market-renewable") {
    const drag: NonNullable<Fund["drag"]> = {};
    const notCollected: string[] = [];
    const take = (field: keyof FundRecord["fees"], key: keyof typeof drag, label: string) => {
      const v = rec.fees[field];
      if (!v || v.value === null) return void notCollected.push(field);
      if (!isNum(v) || (v.unit !== "pct_per_year" && v.unit !== "pct")) return void missing.push(`${wrapperId}: fund "${rec.id}" fees.${field} is not a percent a year`);
      drag[key] = pct(v);
      feeValues[label] = { ...v };
    };
    take("fixed_management", "management", "fundManagement");
    take("variable_management", "variable", "fundVariable");
    take("trustee", "trustee", "fundTrustee");
    take("tracking_difference_12m", "tracking", "fundTracking");
    take("fund_level_withholding_drag", "foreignWithholding", "fundWithholding");
    if (Object.keys(drag).length > 0) fund.drag = drag;
    if (notCollected.length > 0) console.log(`[guide] ${wrapperId}: fund "${rec.id}" fees not collected (run uses 0): ${notCollected.join(", ")}`);
  }

  // A-08: the ledger takes the half-spread; the record holds the median spread (a whole bid-ask spread), so half of it.
  const spread = rec.fees.median_spread;
  if (!isMmf && spread && isNum(spread)) {
    if (spread.unit !== "pct_of_trade") missing.push(`${wrapperId}: fund "${rec.id}" fees.median_spread is not a percent of trade`);
    else {
      fund.halfSpread = pct(spread) / 2;
      feeValues.fundHalfSpread = {
        ...spread,
        value: (spread.value as number) / 2,
        state: "computed",
        computed_from: { formula: "A-08", inputs: { median_spread: spread.value, divisor: 2 } },
        notes: "half of the fund's published median spread (A-08)",
      };
    }
  }
  return missing.length === before ? fund : null;
}

/**
 * A money-market fund bought through a bank (method 2.4): a distributor with a distribution agreement may not charge
 * the holder for buying, holding or redeeming units (MF-26), and a bank may not charge securities custody on one
 * (BANK-18). So the trade and custody lines are 0, each a sourced value object carrying its rule. The assumption that
 * the bank has a distribution agreement for the fund (the common case) is written on the value. The tariff's own
 * `mutual_fund_units` lines are not read: they price tracking funds.
 */
function buildMoneyMarketTariff(wrapperId: string, src: InstrumentSources, missing: string[], feeValues: Record<string, SiteValue>): NonNullable<InstrumentTerms["tariff"]> | null {
  const mf26 = src.rules["MF-26"];
  const bank18 = src.rules["BANK-18"];
  if (!mf26) missing.push(`${wrapperId}: data/rules/ has no record "MF-26" (tariff trade lines)`);
  if (!bank18) missing.push(`${wrapperId}: data/rules/ has no record "BANK-18" (tariff custody lines)`);
  if (!mf26 || !bank18) return null;
  const zero = (rule: RuleRecord, unit: ValueObject["unit"], url: string, title: string, notes: string): SiteValue => ({
    value: 0,
    unit,
    source: { url, title, publisher: "ספר החוקים", strength: rule.strength },
    checked: rule.checked,
    effective_from: null,
    effective_to: null,
    update_rule: "fixed in regulation",
    state: "sourced",
    rule_ids: [rule.id],
    notes,
  });
  feeValues.tradeRate = zero(
    mf26,
    "pct_of_trade",
    "https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(עמלת_הפצה)",
    "תקנות השקעות משותפות בנאמנות (עמלת הפצה), תקנה 2(ד)",
    "בקרן כספית שיש עליה הסכם הפצה המפיץ לא רשאי לגבות מבעל היחידה עמלה על קנייה, החזקה או פדיון (MF-26). ההדגמה מניחה שלבנק יש הסכם הפצה עם הקרן, כמקובל.",
  );
  feeValues.custodyRate = zero(
    bank18,
    "pct_of_balance_per_period",
    "https://boi.org.il/media/jbwnaivp/159a.pdf",
    "כללי הבנקאות (שירות ללקוח) (עמלות), התוספת הראשונה, חלק 4",
    "בבנק אי אפשר לגבות דמי ניהול פיקדון ניירות ערך על קרן כספית (BANK-18). ההדגמה מניחה שהקרן נקנית דרך הבנק.",
  );
  return { buy: { rate: 0 }, sell: { rate: 0 }, custody: { rate: 0, everyMonths: 12 } };
}

function buildTariff(
  wrapperId: string,
  family: "securities" | "makam" | "bond",
  spec: InstrumentSpec,
  src: InstrumentSources,
  missing: string[],
  feeValues: Record<string, SiteValue>,
): NonNullable<InstrumentTerms["tariff"]> | null {
  const snap = snapshotOf(src, spec.tariff, "tariff provider", wrapperId, missing);
  if (!snap) return null;
  type Tariff = NonNullable<InstrumentTerms["tariff"]>;
  const tariff: Tariff = {};
  // makam and a government bond are securities held in the securities account (D6, 2026-10-26): the account's custody line for their class
  // and its monthly fee apply to them too (F-14, F-17); a bank's custody on makam is barred in the run itself (BRK-17)
  const wants = family === "makam" || family === "bond" ? ["trade", "custody", "fixed_period"] : ["trade", "custody", "fx", "fixed_period"];
  const nis = (v: ValueObject | null) => (isNum(v) && (v.unit === "nis_per_trade" || v.unit === "nis") ? (v.value as number) : undefined);

  const trade = wants.includes("trade") ? listLines(snap, wrapperId, "trade") : [];
  if (trade.length > 0) {
    const line = trade[0]!;
    if (trade.length > 1) console.log(`[guide] ${wrapperId}: ${snap.id} has ${trade.length} list trade lines; the first (${line.id}) is used`);
    if (isNum(line.rate) && line.rate.unit === "pct_of_trade") {
      const commission = (l: FeeLine) => {
        const c: NonNullable<Tariff["buy"]> = { rate: pct(l.rate) };
        const min = nis(l.min);
        const max = nis(l.max);
        if (min !== undefined) c.min = min;
        if (max !== undefined) c.max = max;
        if (l.cap && isNum(l.cap)) c.cap = pct(l.cap);
        return c;
      };
      const c = commission(line);
      // A tariff line has no buy/sell split (data-schema §3.6): one commission line applies to both orders.
      tariff.buy = c;
      tariff.sell = { ...c };
      // F-12 (2026-10-31): monthly purchases of the account's own fund, where the tariff prints a standing-order price for its class
      const fundRec = src.funds.find((f) => f.id === spec.fund);
      const exposure = fundRec ? loadExposures().find((e) => e.id === fundRec.exposure_id) : undefined;
      const cls = fundRec ? instrumentClassOf(fundRec, exposure) : null;
      const standing = cls ? snap.lines.find((l) => l.level === "list" && l.base === "trade" && l.band === STANDING_ORDER_BAND && l.applies_to.includes(cls) && (l.channel === null || l.channel === line.channel)) : undefined;
      if (standing && isNum(standing.rate) && standing.rate.unit === "pct_of_trade") {
        tariff.buyStanding = commission(standing);
        feeValues.standingRate = { ...standing.rate };
        if (standing.min && isNum(standing.min)) feeValues.standingMin = { ...standing.min };
        if (standing.max && isNum(standing.max)) feeValues.standingMax = { ...standing.max };
      }
      feeValues.tradeRate = { ...line.rate };
      if (line.min && isNum(line.min)) feeValues.tradeMin = { ...line.min };
      if (line.max && isNum(line.max)) feeValues.tradeMax = { ...line.max };
    } else missing.push(`${wrapperId}: ${snap.id} line ${line.id} is not a percent of trade`);
  }

  const custody = wants.includes("custody") ? listLines(snap, wrapperId, "custody") : [];
  if (custody.length > 0) {
    const line = custody[0]!;
    // The ledger takes a rate per charging period and the months in a period: a quarterly line stays quarterly, no annual conversion.
    // a zero rate prints no period (One Zero's "0 אחוז"): it charges nothing whatever the period is, as the engine's own path reads it
    const every = line.period ? monthsOf[line.period] : line.rate.unit === "pct_per_year" ? 12 : line.rate.value === 0 ? 12 : undefined;
    const unitOk = line.rate.unit === "pct_of_balance_per_period" || line.rate.unit === "pct_per_year";
    if (isNum(line.rate) && unitOk && every) {
      const c: NonNullable<Tariff["custody"]> = { rate: pct(line.rate), everyMonths: every };
      // F-14: a bound printed per month is per charging period here, so a yearly line with a monthly minimum charges twelve of them.
      const perPeriod = (b: typeof line.min) => (b?.unit === "nis_per_month" ? every : 1);
      const min = nis(line.min);
      const max = nis(line.max);
      if (min !== undefined) c.min = min * perPeriod(line.min);
      if (max !== undefined) c.max = max * perPeriod(line.max);
      tariff.custody = c;
      feeValues.custodyRate = { ...line.rate };
      if (line.min && isNum(line.min)) feeValues.custodyMin = { ...line.min };
      if (line.max && isNum(line.max)) feeValues.custodyMax = { ...line.max };
    } else missing.push(`${wrapperId}: ${snap.id} line ${line.id} has no usable custody rate and period`);
  }

  const fx = wants.includes("fx") ? listLines(snap, wrapperId, "fx") : [];
  if (fx.length > 0) {
    const line = fx[0]!;
    if (isNum(line.rate) && line.rate.unit === "pct_of_trade") {
      tariff.fx = pct(line.rate);
      feeValues.fxRate = { ...line.rate };
    }
    // F-13: only a fund in a foreign currency is converted, and this path takes shekel funds only (see the fund's check), so a
    // conversion printed another way (Psagot's agorot a dollar) charges nothing here and is no reason to drop the house
  }

  const fixed = wants.includes("fixed_period") ? listLines(snap, wrapperId, "fixed_period") : [];
  if (fixed.length > 0) {
    const line = fixed[0]!;
    const every = line.period ? monthsOf[line.period] : undefined;
    if (isNum(line.rate) && line.rate.unit === "nis_per_month") {
      tariff.monthlyFee = line.rate.value as number;
      feeValues.monthlyFee = { ...line.rate };
    } else if (isNum(line.rate) && line.rate.unit === "nis" && every) {
      tariff.monthlyFee = (line.rate.value as number) / every;
      feeValues.monthlyFee = {
        ...line.rate,
        value: tariff.monthlyFee,
        unit: "nis_per_month",
        state: "computed",
        computed_from: { formula: "F-17", inputs: { fee_per_period: line.rate.value, months_per_period: every } },
        notes: `fee per ${line.period} divided by ${every} months (F-17 is a monthly fee)`,
      };
    } else missing.push(`${wrapperId}: ${snap.id} line ${line.id} is not a fee in NIS per month or per period`);
  }

  if (Object.keys(tariff).length === 0 && !missing.some((m) => m.startsWith(`${wrapperId}: ${snap.id}`))) {
    missing.push(`${wrapperId}: ${snap.id} has no list trade, custody, fx or account-fee line for it`);
    return null;
  }
  return missing.some((m) => m.startsWith(`${wrapperId}: ${snap.id}`)) ? null : tariff;
}

/** F-51: the IRA manager's balance fee, a yearly fraction. A per-period line is annualised (computed, F-51). */
function buildIraFee(wrapperId: string, spec: InstrumentSpec, src: InstrumentSources, missing: string[], feeValues: Record<string, SiteValue>): number | null {
  const snap = snapshotOf(src, spec.ira_fees, "ira_fees provider", wrapperId, missing);
  if (!snap) return null;
  const lines = listLines(snap, wrapperId, "balance");
  const line = lines[0];
  if (!line) {
    missing.push(`${wrapperId}: ${snap.id} has no list balance line for the IRA manager`);
    return null;
  }
  if (isNum(line.rate) && line.rate.unit === "pct_per_year") {
    feeValues.iraManagerFee = { ...line.rate };
    return pct(line.rate);
  }
  if (isNum(line.rate) && line.rate.unit === "pct_of_balance_per_period" && line.period) {
    const k = 12 / monthsOf[line.period];
    feeValues.iraManagerFee = {
      ...line.rate,
      value: (line.rate.value as number) * k,
      unit: "pct_per_year",
      state: "computed",
      computed_from: { formula: "F-51", inputs: { rate_per_period: line.rate.value, periods_per_year: k } },
      notes: `${line.period}ly rate times ${k} periods a year (simple, no compounding)`,
    };
    return pct(line.rate) * k;
  }
  missing.push(`${wrapperId}: ${snap.id} line ${line.id} has no usable balance rate and period`);
  return null;
}

// ---------------------------------------------------------------- the regulator's average fees (method 2.4)

export type RegulatorFees = { fees: { balance: number; deposit: number; direct: number }; feeValues: Record<string, SiteValue> } | { missing: string[] };

/**
 * A provident-family wrapper's fees when no managing company publishes a list fee for it (or only one of the two): the regulator's average
 * actually charged on the track P-05's entry names (`track`, a CMA fund_id), not a list price. Balance and deposit
 * come from the track's `avg_annual_management_fee` and `avg_deposit_fee`; direct expenses are 0 (the engine raises
 * G-14 for it). An empty deposit average that the data marks with PF-06 (study, IRA, central and other-purpose funds have
 * no deposit-fee item) takes 0 from the rule. A kupat gemel lehashkaa has one, so an empty value there is missing.
 */
export function regulatorAverageFees(
  wrapperId: string,
  spec: InstrumentSpec | undefined,
  cmaFees: Map<number, { balance: ValueObject; deposit: ValueObject }>,
  rules: Record<string, RuleRecord>,
  today: string,
  /** Fees a list line already gives: the track then supplies only the other one. */
  have: { balance?: boolean; deposit?: boolean } = {},
): RegulatorFees | null {
  if (spec?.track === undefined) return null;
  const rec = cmaFees.get(spec.track);
  if (!rec) return { missing: [`${wrapperId}: P-05 instruments names track ${spec.track}, which is not in the latest data/cma/ period`] };
  const missing: string[] = [];
  const balance = cmaFeeValue(rec.balance, today);
  const deposit = cmaFeeValue(rec.deposit, today);
  if (!have.balance && (!isNum(balance) || (balance.value as number) < 0)) missing.push(`${wrapperId}: track ${spec.track} reports no usable average management fee (tariff fees)`);
  const feeValues: Record<string, SiteValue> = have.balance ? {} : { balance, regBalance: balance };
  let depositFraction = 0;
  if (have.deposit) {
    // a list line gives the deposit fee
  } else if (isNum(deposit) && (deposit.value as number) >= 0) {
    depositFraction = pct(deposit);
    feeValues.deposit = deposit;
    feeValues.regDeposit = deposit;
  } else if (depositFeeNoneByRule(deposit)) {
    const pf06 = rules["PF-06"];
    const reg = pf06?.sources?.find((x) => x.kind === "regulation");
    if (!pf06 || !reg) missing.push(`${wrapperId}: data/rules/ has no record "PF-06" with its regulation source (tariff fees)`);
    else
      feeValues.deposit = {
        value: 0,
        unit: "pct_of_deposit",
        source: { url: reg.url, title: `${reg.title}, ${reg.locator}`, publisher: reg.publisher_he ?? reg.publisher, strength: reg.strength },
        checked: reg.checked ?? pf06.checked,
        effective_from: null,
        effective_to: null,
        update_rule: "fixed in regulation",
        state: "sourced",
        rule_ids: ["PF-06"],
        notes: `השדה של ממוצע דמי הניהול מהפקדות ריק בנתוני רשות שוק ההון למסלול ${spec.track}. בסוג הקופה הזה התקנות מתירות דמי ניהול מהיתרה בלבד (PF-06), ולכן החישוב לוקח 0.`,
      };
  } else missing.push(`${wrapperId}: track ${spec.track} reports no average deposit fee (tariff fees)`);
  if (missing.length > 0) return { missing };
  return { fees: { balance: have.balance ? 0 : pct(balance), deposit: depositFraction, direct: 0 }, feeValues };
}
