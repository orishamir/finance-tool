// "השקעה במדד" (D28, spec research/specs/2026-10-25-invest-page/spec.md): for an index the person chooses, the options for
// owning it, the cheapest broker for each option and the cheapest complete way (broker + fund) for the plan. Pure: the
// numbers come from the engine's provider workbench (F-63) and from the fund runs of F-65, over the bundle the other
// workbench pages use. No fee, rate or rule figure is written here: tariffs are snapshots, fund fees are fund records,
// exchange rates are the ECB's (D26). Nothing is chosen for the person (D27): an index is always an argument.
import { providerWorkbench, relativeGap, type ComparedProvider, type FeeLine, type NotComparableProvider, type ProviderRow } from "@finance-tool/engine";
import type { ExposureRecord, FeesSnapshot, FundRecord } from "@finance-tool/schema";
import { invest as copy } from "../copy";
import { aliasRows } from "./search-aliases";
import { fxRunInput } from "./fx";
import { instrumentClassOf, fundRun, ruleContext, shortName, subjectOf, type FundAssumptions, type NotComparable, type WorkbenchBundle, type WorkbenchInputs } from "./providers";
import { computed, type SiteValue, type Strength } from "./value";

// ---------------------------------------------------------------- the options

export type OptionId = "il-tracking" | "il-etf" | "tase-foreign" | "abroad";
export const OPTION_IDS: readonly OptionId[] = ["il-tracking", "il-etf", "tase-foreign", "abroad"];

/** The tariff class each option is priced in (spec §2); a fund is priced in its own class (`instrumentClassOf`). */
export const OPTION_CLASS: Record<OptionId, string> = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "etf_units", abroad: "foreign_securities" };
/** The classes a snapshot's `availability` entry may name for the option. */
const AVAILABILITY_CLASSES: Record<OptionId, string[]> = { "il-tracking": ["mutual_fund_units"], "il-etf": ["etf_units"], "tase-foreign": ["etf_units", "tase_foreign_fund_units"], abroad: ["foreign_securities"] };

/** The options an index has: an Israeli index only the Israeli funds (ETF-51, ETF-31). */
export const optionsOf = (israeli: boolean): OptionId[] => (israeli ? ["il-tracking", "il-etf"] : [...OPTION_IDS]);

/** The option a fund record belongs to (spec §2). */
export function optionOfFund(rec: FundRecord, exposure: ExposureRecord | undefined): OptionId {
  if (rec.domicile === "IL") return instrumentClassOf(rec, exposure) === "etf_units" ? "il-etf" : "il-tracking";
  return rec.trading_currency_on_tase ? "tase-foreign" : "abroad";
}

export type Venue = "us" | "europe";
const US_RE = /ארה["״]ב|ארצות הברית/;
const EU_RE = /אירופה|לונדון|London|LSE/;
export const venueOfBand = (band: string | null | undefined): Venue | null => (!band ? null : US_RE.test(band) ? "us" : EU_RE.test(band) ? "europe" : null);

/** The exchange a fund bought abroad trades on, from its tickers and domicile; null when the record does not say. */
export function venueOfFund(rec: FundRecord): Venue | null {
  const keys = Object.keys(rec.identifiers.ticker ?? {});
  if (keys.some((k) => /^(LSE|Euronext|Xetra|London)/i.test(k))) return "europe";
  if (keys.some((k) => /^(NYSE|NASDAQ|Cboe|BATS|Arca)/i.test(k))) return "us";
  if (rec.domicile === "US") return "us";
  return rec.domicile === "IL" ? null : "europe";
}

// ---------------------------------------------------------------- the index

/** An index the person added (state.ts keeps it on the device). One question decides the options: are the companies Israeli? */
export interface CustomIndex {
  id: string;
  name: string;
  israeli: boolean;
  /** "לידיעתכם בלבד": shown in the header, never used (spec §1, 10.8). */
  currency?: string;
  region?: string;
  added: string;
}

export interface IndexRef {
  id: string;
  name: string;
  israeli: boolean;
  exposure: ExposureRecord | null;
  custom: CustomIndex | null;
  oneLine: string | null;
}

/** Every exposure record that is an equity index, in file order. */
export function knownIndices(bundle: Pick<WorkbenchBundle, "exposures">): IndexRef[] {
  return bundle.exposures.filter((e) => e.kind === "equity_index").map(refOfExposure);
}

export const refOfExposure = (e: ExposureRecord): IndexRef => ({ id: e.id, name: e.names.he[0] ?? e.names.en[0] ?? e.id, israeli: e.constituents_israeli === true, exposure: e, custom: null, oneLine: e.one_line_he ?? null });

export const refOfCustom = (c: CustomIndex): IndexRef => ({ id: c.id, name: c.name, israeli: c.israeli, exposure: null, custom: c, oneLine: null });

/** The index page's address (founder, 2026-10-26: /indices, with no redirect from /invest): `/indices/<x>` for the exposure `index-<x>`, a custom index at `/indices?custom=<id>`. */
export const INDICES_PATH = "/indices";
export const indexPath = (exposureId: string): string => `${INDICES_PATH}/${exposureId.replace(/^index-/, "")}`;
export const customIndexPath = (id: string): string => `${INDICES_PATH}?custom=${encodeURIComponent(id)}`;
export const exposureIdOfSlug = (slug: string): string => `index-${slug}`;

export function indexById(bundle: Pick<WorkbenchBundle, "exposures">, id: string, customs: readonly CustomIndex[] = []): IndexRef | null {
  const known = knownIndices(bundle).find((i) => i.id === id);
  if (known) return known;
  const c = customs.find((x) => x.id === id);
  return c ? refOfCustom(c) : null;
}

const norm = (s: string) => s.replace(/[״”“"'׳`]/g, "").replace(/[-‐־–]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

/** A typed name that stands for a known index (its names, or the search aliases that lead to them): that index selects. */
export function matchKnownIndex(bundle: Pick<WorkbenchBundle, "exposures">, typed: string): IndexRef | null {
  const t = norm(typed);
  if (!t) return null;
  const known = knownIndices(bundle);
  for (const k of known) if ([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])].some((n) => norm(n) === t)) return k;
  for (const row of aliasRows) {
    if (!row.from.some((f) => norm(f) === t)) continue;
    for (const to of row.to) for (const k of known) if ([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])].some((n) => norm(n) === norm(to))) return k;
  }
  return null;
}

/** Suggestions for the custom-index field: the names of the known indices (and what they are called in the search table). */
export function indexSuggestions(bundle: Pick<WorkbenchBundle, "exposures">): { name: string; id: string }[] {
  const out: { name: string; id: string }[] = [];
  for (const k of knownIndices(bundle)) {
    const names = new Set([...(k.exposure?.names.he ?? []), ...(k.exposure?.names.en ?? [])]);
    for (const row of aliasRows) if (row.to.some((to) => [...names].some((n) => norm(n) === norm(to)))) row.from.forEach((f) => names.add(f));
    names.forEach((n) => out.push({ name: n, id: k.id }));
  }
  return out;
}

/** A stable id for a custom index from its name (kept on the device). */
export const customIdOf = (name: string): string => `custom-${norm(name).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "index"}`;

// ---------------------------------------------------------------- reasons and cells

export type Reason = NotComparable | { code: "fund-type" } | { code: "need-yield" } | { code: "need-rate"; currency: string } | { code: "no-fund-rate" };

export interface Availability {
  source: { url: string; title: string; checked: string };
  note: string | null;
}

export interface BrokerCell {
  providerId: string;
  /** `cost`: priced. `unavailable`: a sourced fact says the broker does not sell it. `no-line`: the tariff has no line for the class. `not-comparable`: the engine could not price it (reason). */
  kind: "cost" | "unavailable" | "no-line" | "not-comparable";
  /** F-63: the broker's cost over the horizon in today's shekels (generic fund: no fund fees). */
  cost?: SiteValue;
  costN?: number;
  /** Abroad: the exchange the price rests on; null when the tariff has one line for all. */
  venue?: Venue | null;
  reason?: Reason;
  availability?: Availability;
}

export interface WayPrice {
  providerId: string;
  /** Real value left at the horizon, today's shekels (the figure the ranking sorts on). */
  value: SiteValue;
  valueN: number;
  venue: Venue | null;
  /** The run rests on an open rule (an accumulating foreign fund, G-18): shown, not ranked. */
  open: boolean;
  /** What the account itself charges over the horizon (F-63), real shekels. */
  accountCost: number;
  /** The same, by the tariff's own lines (F-61 inside F-63: trade, custody, FX, fixed), largest first, and the remainder no single line explains. */
  lines: { line: FeeLine; cost: number }[];
  interaction: number;
}

export interface FundWay {
  rec: FundRecord;
  name: string;
  number: string;
  option: OptionId;
  /** The broker the figure is at: the option's cheapest for this fund. */
  best?: WayPrice;
  /** At the person's broker, when known. */
  atYours?: WayPrice | { reason: Reason; providerId: string };
  /** The fund's run at every house of the option (a price, or why it has none); `best` is the highest of the ranked ones. */
  byHouse: Record<string, WayPrice | { reason: Reason; providerId: string }>;
  reason?: Reason;
  currencyMismatch: boolean;
}

export interface OptionView {
  id: OptionId;
  /** The option exists for this index (an Israeli index has two). */
  exists: boolean;
  /** Why it cannot run at all ("עוד לא חושב"). */
  notRunnable: "no-rate" | null;
  cells: BrokerCell[];
  /** The cheapest priced cell. */
  bestCell: BrokerCell | null;
  funds: FundWay[];
  /** The best complete way inside the option (the fund with the highest value at its broker). */
  bestWay: Way | null;
  /** The option's funds rest on an open rule. */
  open: boolean;
}

export interface Way {
  option: OptionId;
  fund: FundWay;
  providerId: string;
  value: SiteValue;
  valueN: number;
  open: boolean;
}

export interface ProviderInfo {
  id: string;
  name: string;
  short: string;
  providerClass: FeesSnapshot["provider"]["class"];
  foreign: boolean;
  /** Whether a company page exists (banks and brokers only). */
  hasPage: boolean;
}

/** The options a house sells on this page: Israeli houses the three Israeli types, foreign brokers the funds abroad. */
export const GROUP_OPTIONS = { il: ["il-etf", "il-tracking", "tase-foreign"], foreign: ["abroad"] } as const satisfies Record<string, readonly OptionId[]>;
export type HouseGroup = keyof typeof GROUP_OPTIONS;

export interface HouseEntry {
  fund: FundWay;
  /** The run at this house; null when it has none (see `reason`). */
  price: WayPrice | null;
  reason: Reason | null;
}

export interface HouseRow {
  provider: ProviderInfo;
  group: HouseGroup;
  /** Every fund of the group on the index at this house: ranked ones by value left, then ones on an open rule, then the ones with no price. */
  entries: HouseEntry[];
  /** The house's cheapest way: the best ranked entry. */
  best: HouseEntry | null;
  /** The headline's value less this house's: a computed gap, null for the headline's own house and for houses with no ranked way. */
  gap: SiteValue | null;
  /** Why the house has no way: not sold there (sourced), or the reason it cannot be priced. */
  unavailable: Availability | null;
  reason: Reason | null;
  /** An index with no fund record: the house's cheapest broker cost over the group's options. */
  generic: BrokerCell | null;
}

export interface WorthLines {
  /** Same fund, other houses: the headline's value less the lowest value among the other houses of its group; null when the fund prices at no other house. */
  house: SiteValue | null;
  houseCount: number;
  /** Same house, other funds. */
  fund: SiteValue | null;
  fundCount: number;
}

export type BarId = "broker" | "fund" | "etf-tracking" | "abroad";
export interface Bar {
  id: BarId;
  /** Not computed: the reason code ("pending" = in progress for this plan, "no-records"). */
  pending: "no-records" | "not-priced" | null;
  low: number | null;
  high: number | null;
  /** high − low: what the choice is worth. */
  spread: SiteValue | null;
  /** The choice lies in an option that rests on an open rule. */
  open: boolean;
  /** Which two things are compared (option ids, or the option of the broker/fund bar). */
  option?: OptionId;
  between?: [OptionId, OptionId];
}

export type Flip = { kind: "options" } | { kind: "brokers"; option: OptionId } | { kind: "funds"; option: OptionId };
export interface OrderCheck {
  /** The order of options, of brokers in each option and of funds in each option is the same at 0% and at 10%. */
  holds: boolean;
  flips: { at: 0 | 10; what: Flip }[];
}

export interface InvestView {
  index: IndexRef;
  options: OptionView[];
  providers: ProviderInfo[];
  headline: Way | null;
  /** No fund records: the cheapest broker for an Israeli fund on this index (custom index). */
  genericHeadline: { option: OptionId; cell: BrokerCell } | null;
  yourBroker: string | null;
  /** The person's broker priced for the headline's fund. */
  atYours: { providerId: string; price: WayPrice | null; reason: Reason | null; less: SiteValue | null } | null;
  bars: Bar[];
  /** Every house with the funds of its group priced at it, the cheapest way first (the index page's section 1). */
  houses: HouseRow[];
  /** The two slices through the headline's cell (F-63, "The worth lines"). */
  worth: WorthLines | null;
  /** Only when the return is the site's illustration. */
  order: OrderCheck | null;
  returnPct: number;
  returnIllustrative: boolean;
  fundCount: number;
}

// ---------------------------------------------------------------- the providers and their lines

/** A conversion between two foreign currencies is not the conversion a shekel investor pays: the shekel-to-currency line is read (2026-10-25). */
const FX_TO_FX = /מט["״]ח ל?מט["״]ח|בין שני מטבעות זרים/;
/** A provider-specific band the engine needs and the tariff cannot say alone: Interactive Brokers' spot line has no rate recorded, its automatic conversion has. */
const FX_BAND: Record<string, string> = { "interactive-brokers": "המרה אוטומטית" };

const scopedCache = new WeakMap<FeesSnapshot, FeesSnapshot>();
/**
 * The lines this page ranks. Interactive Brokers' Tiered prices leave out exchange and clearing fees the data does not hold, so they would
 * understate the cost: only its Fixed lines are read. A foreign-currency to foreign-currency conversion line is left out.
 */
export function scoped(s: FeesSnapshot): FeesSnapshot {
  let out = scopedCache.get(s);
  if (!out) {
    out = { ...s, lines: s.lines.filter((l) => !(l.base === "fx" && FX_TO_FX.test(l.names.tariff.join(" "))) && !(s.id === "interactive-brokers" && /Tiered/.test(l.band ?? ""))) };
    scopedCache.set(s, out);
  }
  return out;
}

export function providersOfInvest(bundle: Pick<WorkbenchBundle, "snapshots">): FeesSnapshot[] {
  return bundle.snapshots.filter((s) => s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker").sort((a, b) => a.provider.name_he.localeCompare(b.provider.name_he, "he"));
}

export const providerInfo = (s: FeesSnapshot): ProviderInfo => ({ id: s.id, name: s.provider.name_he, short: shortName(s.id, s.provider.name_he), providerClass: s.provider.class, foreign: s.provider.class === "foreign_broker", hasPage: s.provider.class === "bank" || s.provider.class === "broker" });

interface Cand {
  venue: Venue | null;
  band?: string[];
}

/** The ways to read a snapshot for an option: for a fund bought abroad, one per exchange its tariff names, then the plain reading. */
function candidates(s: FeesSnapshot, option: OptionId): Cand[] {
  const fxBand = FX_BAND[s.id];
  const plain: Cand = { venue: null, ...(fxBand ? { band: [fxBand] } : {}) };
  if (option !== "abroad") return [plain];
  const trade = s.lines.filter((l) => l.base === "trade" && l.level === "list" && l.applies_to.includes("foreign_securities") && l.band);
  const out: Cand[] = [];
  for (const v of ["us", "europe"] as Venue[]) {
    const bands = [...new Set(trade.filter((l) => venueOfBand(l.band) === v).map((l) => l.band!))];
    if (bands.length) out.push({ venue: v, band: [...bands, ...(fxBand ? [fxBand] : [])] });
  }
  return [...out, plain];
}

// ---------------------------------------------------------------- the run

interface Spec {
  fund: Parameters<typeof providerWorkbench>[0]["fund"];
  market: { grossReturn: number; returnIn?: "instrument" | "nis"; fxChange?: number };
  currency?: { code: string; startRate: number };
  cls: string;
}

interface Ctx {
  bundle: WorkbenchBundle;
  plan: WorkbenchInputs;
  fx: Record<string, number>;
  theta: number;
  snaps: FeesSnapshot[];
  assumptions: FundAssumptions;
}

function makeCtx(bundle: WorkbenchBundle, plan: WorkbenchInputs, assumptions: FundAssumptions = {}): Ctx {
  const theta = ((bundle.p01 as unknown as { value: { value: number } }).value.value as number) / 100;
  return { bundle, plan, fx: bundle.fx ? fxRunInput(bundle.fx) : {}, theta, snaps: providersOfInvest(bundle), assumptions };
}

function genericSpec(ctx: Ctx, option: OptionId): Spec | null {
  const market = { grossReturn: ctx.plan.grossReturn };
  if (option === "il-tracking" || option === "il-etf") return { fund: { kind: "israeli-fund", drag: {} }, market, cls: OPTION_CLASS[option] };
  if (option === "tase-foreign") return { fund: { kind: "tase-foreign-fund", drag: {} }, market, cls: OPTION_CLASS[option] };
  const usd = ctx.fx.USD;
  if (!usd) return null;
  return { fund: { kind: "foreign-fund", drag: {} }, market: { ...market, returnIn: "instrument", fxChange: 0 }, currency: { code: "USD", startRate: usd }, cls: OPTION_CLASS.abroad };
}

function runSlot(ctx: Ctx, spec: Spec, items: { s: FeesSnapshot; cand: Cand }[]): ProviderRow[] {
  const profile: { ageAtStart?: number; annualIncome?: number } = {};
  if (ctx.plan.age !== null) profile.ageAtStart = ctx.plan.age;
  if (ctx.plan.income !== null && ctx.plan.income > 0) profile.annualIncome = ctx.plan.income;
  const input = (list: typeof items) => ({
    goal: { amountNow: ctx.plan.amountNow, monthly: ctx.plan.monthly, months: 12 * ctx.plan.years },
    market: { ...spec.market, inflation: ctx.plan.inflation },
    fund: spec.fund,
    profile,
    behaviour: { ordersPerMonth: 1 },
    instrumentClass: spec.cls,
    channel: "direct",
    ...(spec.currency ? { currency: spec.currency } : {}),
    fx: ctx.fx,
    theta: ctx.theta,
    providers: list.map((x) => ({ snapshot: scoped(x.s), level: "list" as const, ...(x.cand.band ? { band: x.cand.band } : {}) })),
  });
  try {
    return providerWorkbench(input(items), ruleContext(ctx.bundle)).rows;
  } catch {
    // one provider the engine cannot run must not fail the page (spec 4.5): run them one by one, the failing one becomes a record-error row
    return items.map((x) => {
      try {
        return providerWorkbench(input([x]), ruleContext(ctx.bundle)).rows[0]!;
      } catch (e) {
        const base = { id: x.s.id, name: x.s.provider.name_he, providerClass: x.s.provider.class, level: "list" as const, snapshot: x.s.snapshot, tariffSource: x.s.tariff, protectionRuleIds: x.s.provider.protection_rule_ids, minimums: x.s.minimums };
        return { ...base, kind: "not-comparable" as const, reason: { code: "record-error" as const, detail: e instanceof Error ? e.message : String(e) } };
      }
    });
  }
}

function ambiguity(message: string, s: FeesSnapshot): NotComparable | null {
  const m = /lines? apply \(([^)]*)\); the snapshot is ambiguous/.exec(message);
  if (!m) return null;
  return { code: "ambiguous", detail: message, lines: m[1]!.split(",").map((x) => x.trim()).map((id) => { const l = s.lines.find((y) => y.id === id); return { id, name: l?.names.tariff[0] ?? id, band: l?.band ?? null }; }) };
}

function reasonOf(row: NotComparableProvider, s: FeesSnapshot): NotComparable {
  const r = row.reason;
  if (r.code === "data-missing") return { code: "data-missing", recorded: r.detail };
  if (r.code === "line-without-value") return { code: "line-without-value", detail: r.detail, lineName: s.lines.find((l) => l.id === r.detail.split(" ")[0])?.names.tariff[0] ?? null };
  if (r.code === "record-error") return ambiguity(r.detail, s) ?? { code: "record-error", detail: r.detail };
  return { code: r.code, detail: r.detail };
}

type Priced = { kind: "ok"; row: ComparedProvider; venue: Venue | null } | { kind: "fail"; reason: NotComparable };

/** The venue the tariff line a row used names (a trade line's band), else the reading's venue. */
function rowVenue(row: ComparedProvider, s: FeesSnapshot, cand: Cand): Venue | null {
  for (const id of row.linesUsed) {
    const l = s.lines.find((x) => x.id === id);
    if (l && l.base === "trade") return venueOfBand(l.band) ?? cand.venue;
  }
  return cand.venue;
}

/**
 * Prices each snapshot for a fund spec: every reading of its tariff (an exchange each, for a fund bought abroad), and the
 * cheapest one that computes wins. `fundVenue` limits the readings to the exchange the fund trades on.
 */
function priceMany(ctx: Ctx, spec: Spec, option: OptionId, snaps: FeesSnapshot[], fundVenue: Venue | null): Map<string, Priced> {
  const per = snaps.map((s) => ({ s, cands: candidates(scoped(s), option).filter((c) => fundVenue === null || c.venue === null || c.venue === fundVenue) }));
  const results = new Map<string, { row: ProviderRow; cand: Cand }[]>();
  const slots = Math.max(0, ...per.map((p) => p.cands.length));
  for (let k = 0; k < slots; k++) {
    const items = per.filter((p) => p.cands[k]).map((p) => ({ s: p.s, cand: p.cands[k]! }));
    const rows = runSlot(ctx, spec, items);
    items.forEach((x, i) => results.set(x.s.id, [...(results.get(x.s.id) ?? []), { row: rows[i]!, cand: x.cand }]));
  }
  const out = new Map<string, Priced>();
  for (const { s } of per) {
    const got = results.get(s.id) ?? [];
    let best: { row: ComparedProvider; venue: Venue | null } | null = null;
    for (const g of got) {
      if (g.row.kind !== "compared") continue;
      // no trade line for the class: the run would charge nothing, which the tariff does not say; derived availability (spec 6, S3)
      if (g.row.noLine.includes("trade")) continue;
      const venue = rowVenue(g.row, scoped(s), g.cand);
      if (fundVenue !== null && venue !== null && venue !== fundVenue) continue;
      if (!best || g.row.real > best.row.real || (g.row.real === best.row.real && venue !== null && best.venue === null)) best = { row: g.row, venue };
    }
    if (best) {
      out.set(s.id, { kind: "ok", ...best });
      continue;
    }
    const fails = got.flatMap((g) => (g.row.kind === "not-comparable" ? [reasonOf(g.row, scoped(s))] : g.row.noLine.includes("trade") ? [{ code: "no-applicable-line" as const, detail: `no trade line of the ${s.snapshot} snapshot applies to ${spec.cls}` }] : []));
    // the most telling reason: any but "no line" and "ambiguous", then ambiguous, then no line
    const pick = fails.find((f) => f.code !== "no-applicable-line" && f.code !== "ambiguous") ?? fails.find((f) => f.code === "ambiguous") ?? fails[0] ?? { code: "data-missing" as const, recorded: null };
    out.set(s.id, { kind: "fail", reason: pick });
  }
  return out;
}

type AvailabilityEntry = NonNullable<FeesSnapshot["availability"]>[number];
const AVAILABLE_NOTE = (a: AvailabilityEntry): Availability => ({ source: a.source, note: a.note ?? null });

function unavailable(s: FeesSnapshot, option: OptionId): Availability | null {
  for (const a of s.availability ?? []) if (!a.available && a.applies_to.some((c) => AVAILABILITY_CLASSES[option].includes(c))) return AVAILABLE_NOTE(a);
  return null;
}

// ---------------------------------------------------------------- values

const inputMap = (plan: WorkbenchInputs): Record<string, SiteValue> => ({ סכום: plan.values.amount, "הפקדה חודשית": plan.values.monthly, שנים: plan.values.years, תשואה: plan.values.returnV, אינפלציה: plan.values.inflation });
const rulesOf = (row: ComparedProvider) => row.run.rules.map((u) => ({ id: u.id, strength: u.strength as Strength }));

function costValue(ctx: Ctx, row: ComparedProvider, about: string): SiteValue {
  return computed(row.horizonCost.value as number, "nis", "F-63", inputMap(ctx.plan), { today: ctx.bundle.today, rules: rulesOf(row), flags: row.flags, about });
}

function wayPrice(ctx: Ctx, p: Extract<Priced, { kind: "ok" }>, providerId: string, about: string): WayPrice {
  const row = p.row;
  const open = row.run.outcome.code === "listed-not-ranked";
  const value = computed(row.real, "nis", "F-65", inputMap(ctx.plan), { today: ctx.bundle.today, rules: rulesOf(row), flags: row.run.flags.map((f) => f.code), about });
  return { providerId, value, valueN: row.real, venue: p.venue, open, accountCost: row.horizonCost.value as number, lines: row.byType.map((x) => ({ line: x.line, cost: x.cost })), interaction: row.interaction };
}

// ---------------------------------------------------------------- funds

function fundSpec(ctx: Ctx, rec: FundRecord): { spec: Spec; mismatch: boolean } | { reason: Reason } {
  const exposure = ctx.bundle.exposures.find((e) => e.id === rec.exposure_id);
  const subject = subjectOf(ctx.bundle, rec.id);
  if (!subject) return { reason: { code: "fund-type" } };
  const run = fundRun(subject, exposure, ctx.plan.grossReturn, ctx.assumptions, ctx.bundle.fx);
  if ("kind" in run) return { reason: run.kind === "need-rate" ? { code: "need-rate", currency: run.currency } : run.kind === "need-yield" ? { code: "need-yield" } : { code: "fund-type" } };
  // as the engine flags it (E4): a fund in a foreign currency other than its index's; a shekel fund on a dollar index is the usual case, not a mismatch
  const mismatch = !!exposure && !["NIS", "ILS"].includes(rec.currency) && rec.currency !== exposure.currency;
  return { spec: { fund: run.fund, market: run.market, ...(run.currency ? { currency: run.currency } : {}), cls: subject.instrumentClass }, mismatch };
}

const nameOf = (rec: FundRecord) => rec.names.he[0] ?? rec.names.en[0] ?? rec.id;
const numberOf = (rec: FundRecord) => rec.identifiers.tase_number ?? rec.identifiers.isin ?? rec.id;

// ---------------------------------------------------------------- the option

function computeOption(ctx: Ctx, index: IndexRef, option: OptionId, yourBroker: string | null): OptionView {
  const exists = optionsOf(index.israeli).includes(option);
  const empty: OptionView = { id: option, exists, notRunnable: null, cells: [], bestCell: null, funds: [], bestWay: null, open: false };
  if (!exists) return empty;
  const spec = genericSpec(ctx, option);
  if (!spec) return { ...empty, notRunnable: "no-rate" };

  // (b) the broker cost of the option: a generic fund with no fees of its own
  const priceable = ctx.snaps.filter((s) => !unavailable(s, option));
  const priced = priceMany(ctx, spec, option, priceable, null);
  const cells: BrokerCell[] = ctx.snaps.map((s) => {
    const na = unavailable(s, option);
    if (na) return { providerId: s.id, kind: "unavailable", availability: na };
    const p = priced.get(s.id)!;
    if (p.kind === "ok") return { providerId: s.id, kind: "cost", cost: costValue(ctx, p.row, `עלות ${s.provider.name_he}`), costN: p.row.horizonCost.value as number, venue: p.venue };
    return { providerId: s.id, kind: p.reason.code === "no-applicable-line" ? "no-line" : "not-comparable", reason: p.reason };
  });
  const costs = cells.filter((c) => c.kind === "cost").sort((a, b) => a.costN! - b.costN!);
  const bestCell = costs[0] ?? null;

  // (a) the funds of the option, each at its cheapest broker
  const recs = ctx.bundle.funds.filter((f) => f.exposure_id === index.exposure?.id && optionOfFund(f, index.exposure ?? undefined) === option);
  const yours = yourBroker ? ctx.snaps.find((s) => s.id === yourBroker) : undefined;
  const funds: FundWay[] = recs.map((rec) => {
    const base = { rec, name: nameOf(rec), number: numberOf(rec), option, currencyMismatch: false, byHouse: {} as FundWay["byHouse"] };
    const fs = fundSpec(ctx, rec);
    if ("reason" in fs) return { ...base, reason: fs.reason };
    const venue = option === "abroad" ? venueOfFund(rec) : null;
    // the fund at every house that sells the option, the exchange it trades on for a fund abroad
    const got = priceable.length ? priceMany(ctx, fs.spec, option, priceable, venue) : new Map<string, Priced>();
    let best: WayPrice | undefined;
    let failure: Reason | undefined;
    for (const s of ctx.snaps) {
      if (unavailable(s, option)) {
        base.byHouse[s.id] = { providerId: s.id, reason: { code: "no-applicable-line", detail: "unavailable" } };
        continue;
      }
      const p = got.get(s.id)!;
      if (p.kind === "ok") {
        const w = wayPrice(ctx, p, s.id, nameOf(rec));
        base.byHouse[s.id] = w;
        if (!best || w.valueN > best.valueN) best = w;
      } else {
        base.byHouse[s.id] = { providerId: s.id, reason: p.reason };
        failure ??= p.reason;
      }
    }
    const atYours = yours ? base.byHouse[yours.id] : undefined;
    return { ...base, currencyMismatch: fs.mismatch, ...(best ? { best } : failure ? { reason: failure } : { reason: { code: "no-applicable-line", detail: "no broker" } }), ...(atYours ? { atYours } : {}) };
  });
  funds.sort((a, b) => (b.best?.valueN ?? -Infinity) - (a.best?.valueN ?? -Infinity));
  const top = funds.find((f) => f.best);
  const bestWay: Way | null = top?.best ? { option, fund: top, providerId: top.best.providerId, value: top.best.value, valueN: top.best.valueN, open: top.best.open } : null;
  return { ...empty, cells, bestCell, funds, bestWay, open: funds.some((f) => f.best?.open) };
}

// ---------------------------------------------------------------- the view

function core(ctx: Ctx, index: IndexRef, yourBroker: string | null): OptionView[] {
  return OPTION_IDS.map((o) => computeOption(ctx, index, o, yourBroker));
}

/** The headline: the best ranked way over the options (an open way is shown, not ranked, G-18). */
function headlineOf(options: OptionView[]): Way | null {
  const ways = options.flatMap((o) => (o.bestWay && !o.bestWay.open ? [o.bestWay] : []));
  return ways.sort((a, b) => b.valueN - a.valueN)[0] ?? null;
}

/** Items in value order with the ones within θ of the group's first merged into one place: the order that matters (F-80). */
function signature(items: { id: string; v: number }[], higherBetter: boolean, theta: number): string {
  const sorted = [...items].sort((a, b) => (higherBetter ? b.v - a.v : a.v - b.v));
  const groups: { id: string; v: number }[][] = [];
  for (const x of sorted) {
    const g = groups[groups.length - 1];
    if (g && relativeGap(g[0]!.v, x.v) < theta) g.push(x);
    else groups.push([x]);
  }
  return groups.map((g) => g.map((x) => x.id).sort().join("+")).join(">");
}

function signatures(options: OptionView[], theta: number): Record<string, string> {
  const out: Record<string, string> = {};
  out.options = signature(options.flatMap((o) => (o.bestWay ? [{ id: o.id, v: o.bestWay.valueN }] : [])), true, theta);
  for (const o of options) {
    out[`brokers:${o.id}`] = signature(o.cells.flatMap((c) => (c.kind === "cost" ? [{ id: c.providerId, v: c.costN! }] : [])), false, theta);
    out[`funds:${o.id}`] = signature(o.funds.flatMap((f) => (f.best ? [{ id: f.rec.id, v: f.best.valueN }] : [])), true, theta);
  }
  return out;
}

function orderCheck(ctx: Ctx, index: IndexRef, yourBroker: string | null, atPlan: OptionView[]): OrderCheck {
  const base = signatures(atPlan, ctx.theta);
  const flips: OrderCheck["flips"] = [];
  for (const at of [0, 10] as const) {
    const other = makeCtx(ctx.bundle, { ...ctx.plan, grossReturn: at / 100 }, ctx.assumptions);
    const sig = signatures(core(other, index, yourBroker), ctx.theta);
    for (const k of Object.keys(base)) {
      if (sig[k] === base[k]) continue;
      const [kind, option] = k.split(":") as [string, OptionId | undefined];
      flips.push({ at, what: kind === "options" ? { kind: "options" } : { kind: kind as "brokers" | "funds", option: option! } });
    }
  }
  return { holds: flips.length === 0, flips };
}

function spreadValue(ctx: Ctx, n: number, about: string): SiteValue {
  return computed(n, "nis", "F-65", inputMap(ctx.plan), { today: ctx.bundle.today, about });
}

function barsOf(ctx: Ctx, options: OptionView[], headline: Way | null): Bar[] {
  const bar = (id: BarId, low: number | null, high: number | null, pending: Bar["pending"], open: boolean, extra: Partial<Bar> = {}): Bar => ({ id, pending: low === null || high === null ? (pending ?? "not-priced") : null, low, high, spread: low !== null && high !== null ? spreadValue(ctx, high - low, id) : null, open, ...extra });
  const at = headline ? options.find((o) => o.id === headline.option)! : options.find((o) => o.bestCell) ?? null;
  const out: Bar[] = [];
  // the broker: the cost range of the option's brokers
  const costs = at ? at.cells.filter((c) => c.kind === "cost").map((c) => c.costN!) : [];
  out.push(bar("broker", costs.length ? Math.min(...costs) : null, costs.length ? Math.max(...costs) : null, null, !!at?.open, at ? { option: at.id } : {}));
  // the fund: values among the option's funds at its broker
  const vals = at ? at.funds.flatMap((f) => (f.best ? [f.best.valueN] : [])) : [];
  out.push(bar("fund", vals.length ? Math.min(...vals) : null, vals.length ? Math.max(...vals) : null, vals.length === 0 ? "no-records" : null, !!at?.open, at ? { option: at.id } : {}));
  // ETF against tracking fund
  const t = options.find((o) => o.id === "il-tracking")?.bestWay;
  const e = options.find((o) => o.id === "il-etf")?.bestWay;
  out.push(bar("etf-tracking", t && e ? Math.min(t.valueN, e.valueN) : null, t && e ? Math.max(t.valueN, e.valueN) : null, "no-records", false, { between: ["il-tracking", "il-etf"] }));
  // in Israel or abroad: the best of the Israeli-rail options against the best abroad option
  const il = options.filter((o) => o.id !== "abroad" && o.bestWay).map((o) => o.bestWay!.valueN);
  const ab = options.find((o) => o.id === "abroad")?.bestWay;
  out.push(bar("abroad", il.length && ab ? Math.min(Math.max(...il), ab.valueN) : null, il.length && ab ? Math.max(Math.max(...il), ab.valueN) : null, "no-records", !!ab?.open, { between: ["il-etf", "abroad"] }));
  return out;
}

/** Fund first by value left: ranked ones, then ones on an open rule, then the ones with no price. */
const entryOrder = (a: HouseEntry, b: HouseEntry) => {
  const rank = (e: HouseEntry) => (e.price && !e.price.open ? 0 : e.price ? 1 : 2);
  return rank(a) - rank(b) || (b.price?.valueN ?? 0) - (a.price?.valueN ?? 0);
};

function housesOf(ctx: Ctx, options: OptionView[], headline: Way | null, providers: ProviderInfo[]): HouseRow[] {
  const rows = providers.map((provider): HouseRow => {
    const group: HouseGroup = provider.foreign ? "foreign" : "il";
    const opts = options.filter((o) => o.exists && (GROUP_OPTIONS[group] as readonly OptionId[]).includes(o.id));
    const entries = opts.flatMap((o) => o.funds).map((fund): HouseEntry => {
      const at = fund.byHouse[provider.id];
      return at && "value" in at ? { fund, price: at, reason: null } : { fund, price: null, reason: at?.reason ?? fund.reason ?? { code: "data-missing", recorded: null } };
    }).sort(entryOrder);
    const best = entries.find((e) => e.price && !e.price.open) ?? null;
    // no fund record at all: the broker cost of the group's options, the cheapest
    const cells = opts.flatMap((o) => o.cells.filter((c) => c.providerId === provider.id));
    const generic = cells.filter((c) => c.kind === "cost").sort((a, b) => a.costN! - b.costN!)[0] ?? null;
    const na = cells.find((c) => c.kind === "unavailable");
    const gap = best && headline && headline.providerId !== provider.id && headline.valueN - best.price!.valueN > 0 ? spreadValue(ctx, headline.valueN - best.price!.valueN, copy.houses.gapAbout(provider.name)) : null;
    const reason = best || generic ? null : (entries.find((e) => e.reason)?.reason ?? cells.find((c) => c.reason)?.reason ?? null);
    return { provider, group, entries, best, gap, unavailable: !best && !generic ? (na?.availability ?? null) : null, reason, generic };
  });
  const priced = (r: HouseRow) => r.best ?? r.generic;
  const cost = (r: HouseRow) => (r.best ? -r.best.price!.valueN : r.generic ? r.generic.costN! : Infinity);
  return rows.sort((a, b) => Number(!priced(a)) - Number(!priced(b)) || a.group.localeCompare(b.group) * -1 || cost(a) - cost(b) || a.provider.name.localeCompare(b.provider.name, "he"));
}

function worthOf(ctx: Ctx, options: OptionView[], headline: Way | null, providers: ProviderInfo[]): WorthLines | null {
  if (!headline) return null;
  const foreign = providers.find((p) => p.id === headline.providerId)?.foreign ?? false;
  const group = foreign ? GROUP_OPTIONS.foreign : GROUP_OPTIONS.il;
  const fStar = headline.fund;
  const others: number[] = [];
  for (const p of providers) {
    if (p.foreign !== foreign || p.id === headline.providerId) continue;
    const at = fStar.byHouse[p.id];
    if (at && "value" in at && !at.open) others.push(at.valueN);
  }
  const sameHouse: number[] = [];
  for (const o of options) {
    if (!o.exists || !(group as readonly OptionId[]).includes(o.id)) continue;
    for (const f of o.funds) {
      if (f.rec.id === fStar.rec.id) continue;
      const at = f.byHouse[headline.providerId];
      if (at && "value" in at && !at.open) sameHouse.push(at.valueN);
    }
  }
  const gap = (xs: number[], about: string) => (xs.length ? spreadValue(ctx, headline.valueN - Math.min(...xs), about) : null);
  return { house: gap(others, copy.worth.lines.house), houseCount: others.length, fund: gap(sameHouse, copy.worth.lines.fund), fundCount: sameHouse.length };
}

export interface InvestArgs {
  bundle: WorkbenchBundle;
  index: IndexRef;
  plan: WorkbenchInputs;
  yourBroker?: string | null;
  assumptions?: FundAssumptions;
}

export function buildInvest(a: InvestArgs): InvestView {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const yourBroker = a.yourBroker && ctx.snaps.some((s) => s.id === a.yourBroker) ? a.yourBroker : null;
  const options = core(ctx, a.index, yourBroker);
  const headline = headlineOf(options);
  const costed = options.filter((o) => o.bestCell).sort((a2, b2) => a2.bestCell!.costN! - b2.bestCell!.costN!);
  const genericHeadline = !headline && costed[0] && a.index.exposure === null ? { option: costed[0].id, cell: costed[0].bestCell! } : null;
  let atYours: InvestView["atYours"] = null;
  if (yourBroker && headline) {
    const y = headline.fund.atYours;
    const price = y && "value" in y ? y : null;
    atYours = { providerId: yourBroker, price, reason: y && "reason" in y ? y.reason : null, less: price ? spreadValue(ctx, headline.valueN - price.valueN, "less") : null };
  }
  const illustrative = a.plan.returnFromParameter;
  const providers = ctx.snaps.map(providerInfo);
  return {
    index: a.index,
    options,
    providers,
    headline,
    genericHeadline,
    yourBroker,
    atYours,
    bars: barsOf(ctx, options, headline),
    houses: housesOf(ctx, options, headline, providers),
    worth: worthOf(ctx, options, headline, providers),
    order: illustrative && a.plan.grossReturn !== 0 && a.plan.grossReturn !== 0.1 ? orderCheck(ctx, a.index, yourBroker, options) : null,
    returnPct: a.plan.grossReturn * 100,
    returnIllustrative: illustrative,
    fundCount: a.bundle.funds.filter((f) => f.exposure_id === a.index.exposure?.id).length,
  };
}

// ---------------------------------------------------------------- one account and one fund, broken down (the index page's result, 2026-10-27)

export interface PairCosts {
  providerId: string;
  fundId: string;
  /** What the person puts in: the amount now and every monthly deposit (F-05), in today's shekels (F-06). */
  paidIn: SiteValue;
  /** Real value left at the horizon (F-65). */
  left: SiteValue;
  /** The account's own lines over the horizon (F-63 broken down by F-61), real shekels; `interaction` is what no single line explains. */
  account: { line: FeeLine; cost: SiteValue }[];
  interaction: number;
  /** The fund's own fees (management, variable, trustee) at this account: F-61's fund line, `V_real(without them) − V_real`. */
  fund: SiteValue;
  /** Tax paid during and at exit, in today's shekels at the horizon (F-06). */
  tax: SiteValue;
}

/**
 * The cost of one complete way, split by who takes it: the account (its tariff lines), the fund (its own fees) and the state (tax).
 * Null when the account cannot price the fund. Two runs: the way as it is, and the same way with the fund's fee line removed.
 */
export function pairCosts(a: InvestArgs & { fundId: string; providerId: string }): PairCosts | null {
  const ctx = makeCtx(a.bundle, a.plan, a.assumptions);
  const rec = a.bundle.funds.find((f) => f.id === a.fundId);
  const s = ctx.snaps.find((x) => x.id === a.providerId);
  if (!rec || !s) return null;
  const option = optionOfFund(rec, a.index.exposure ?? undefined);
  if (unavailable(s, option)) return null;
  const fs = fundSpec(ctx, rec);
  if ("reason" in fs) return null;
  const venue = option === "abroad" ? venueOfFund(rec) : null;
  const p = priceMany(ctx, fs.spec, option, [s], venue).get(s.id);
  if (!p || p.kind !== "ok") return null;
  const drag = (fs.spec.fund as { drag?: Record<string, number> }).drag ?? {};
  const bare = { ...fs.spec, fund: { ...fs.spec.fund, drag: { ...drag, management: 0, variable: 0, trustee: 0 } } } as Spec;
  const p0 = priceMany(ctx, bare, option, [s], venue).get(s.id);
  const row = p.row;
  const run = row.run;
  const inputs = inputMap(ctx.plan);
  const at = (n: number, formula: string, about: string) => computed(n, "nis", formula, inputs, { today: ctx.bundle.today, rules: rulesOf(row), about });
  const fundCost = p0 && p0.kind === "ok" ? p0.row.real - row.real : 0;
  const deflator = run.nominal > 0 ? run.real / run.nominal : 0;
  // each deposit in today's shekels (F-05, F-06): the goal's contributions keep their real value (A-04, the engine's default here),
  // so this is the amount now plus the monthly sum times the months
  const paidInReal = ctx.plan.amountNow + ctx.plan.monthly * 12 * ctx.plan.years;
  return {
    providerId: s.id,
    fundId: rec.id,
    paidIn: computed(paidInReal, "nis", "F-05", inputs, { today: ctx.bundle.today, about: copy.pair.paidInAbout }),
    left: wayPrice(ctx, p, s.id, nameOf(rec)).value,
    account: row.byType.map((x) => ({ line: x.line, cost: at(x.cost, "F-63", copy.pair.lineAbout(x.line)) })),
    interaction: row.interaction,
    fund: at(fundCost, "F-61", copy.pair.fundAbout),
    tax: at((run.taxAtExit + run.taxDuring) * deflator, "F-06", copy.pair.taxAbout),
  };
}

// ---------------------------------------------------------------- the API the goal comparison calls (B1 API, requests.md)

export interface CheapestWay {
  indexId: string;
  option: OptionId;
  providerId: string;
  providerName: string;
  fundRecordId: string;
  fundName: string;
  value: SiteValue;
  valueN: number;
}

const wayOut = (bundle: WorkbenchBundle, index: IndexRef, w: Way): CheapestWay => ({ indexId: index.id, option: w.option, providerId: w.providerId, providerName: bundle.snapshots.find((s) => s.id === w.providerId)?.provider.name_he ?? w.providerId, fundRecordId: w.fund.rec.id, fundName: w.fund.name, value: w.value, valueN: w.valueN });

/** The cheapest complete way for a known index and the plan (broker, fund, value left in today's shekels), or null when no way is priced. */
export function cheapestWay(bundle: WorkbenchBundle, index: IndexRef, plan: WorkbenchInputs, assumptions?: FundAssumptions): CheapestWay | null {
  const ctx = makeCtx(bundle, plan, assumptions);
  const w = headlineOf(core(ctx, index, null));
  return w ? wayOut(bundle, index, w) : null;
}

/** The broker costs for each option (the grid's columns) for an index and the plan; a custom index works too (no funds needed). */
export function brokerCostsByOption(bundle: WorkbenchBundle, index: IndexRef, plan: WorkbenchInputs): Record<OptionId, BrokerCell[]> {
  const ctx = makeCtx(bundle, plan);
  const out = {} as Record<OptionId, BrokerCell[]>;
  for (const o of core(ctx, index, null)) out[o.id] = o.cells;
  return out;
}

export interface IndexRange {
  low: CheapestWay;
  high: CheapestWay;
  /** Every known index with a priced way, lowest value first. */
  perIndex: CheapestWay[];
}

/** The plan over the known indices, each through its own cheapest way: the lowest and the highest value left (D27: no index is picked). */
export function rangeOverKnownIndices(bundle: WorkbenchBundle, plan: WorkbenchInputs, assumptions?: FundAssumptions): IndexRange | null {
  const all = knownIndices(bundle).flatMap((i) => {
    const w = cheapestWay(bundle, i, plan, assumptions);
    return w ? [w] : [];
  });
  if (all.length === 0) return null;
  all.sort((a, b) => a.valueN - b.valueN);
  return { low: all[0]!, high: all[all.length - 1]!, perIndex: all };
}
