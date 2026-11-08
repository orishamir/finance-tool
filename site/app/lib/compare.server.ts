// The data the browser needs for every comparison (flows 12 to 16), built once at build time and served as
// /compare-bundle.json: the wrapper records, their instrument terms (the same ones the guide pages use), the
// parameters, the rule records any run may read, the tier-2 list and the checklist rows. Server-only.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { DepositTerms, FeesSnapshot, ParameterRecord, RuleRecord, ValueObject, ProductId, ProductRecord } from "@finance-tool/schema";
import { buildTariff as engineTariff, memberKindOf, REDEMPTION_BAND, STANDING_ORDER_BAND, Unusable, type InstrumentTerms, type WorkbenchInput } from "@finance-tool/engine";
import { loadChecklistRows, loadCma, loadCmaFees, loadFees, loadNotCovered, loadParameters, loadRules, loadProducts, pointedRecords, root, today } from "./data.server";
import { buildInstrumentTerms, redemptionValues, exposureHref, loadDepositTerms, loadExposures, loadFunds, regulatorAverageFees } from "./instruments.server";
import { evaluate, fundCostKeys, fundCostOf, representativeFeeValue, type BundleDataFile, type ProviderTariff, type CompareBundle, type ExposureEntry, type Family, type HoldingTerms, type IndexFundTerms, type RunGoal, type Tier2Row, type WrapperEntry } from "./compare";
import type { FitTableData } from "./fit";
import { computed, ownBy, ownEach, ruleFigure, type SiteValue } from "./value";
import { publisherHe } from "./publisher-he.server";
import { accountBanks, commonAccountRate, currentAccountRecords } from "./guide-signature-bundle.server";
import { computedInputs as ci, guideBlocks, r3fees } from "../copy";

const tariffKeys: string[] = ["tradeRate", "tradeMin", "tradeMax", "tradeFlat", "tradeFlatUpTo", "redeemRate", "redeemMin", "redeemMax", "redeemFlat", "redeemFlatUpTo", "standingRate", "standingMin", "standingMax", "custodyRate", "custodyMin", "custodyMax", "fxRate", "monthlyFee"];
import { BROKERAGE, instrumentClassOf, onlyWhatCanBeDone, providersOf, shortName } from "./providers";
import { latestSnapshots } from "./providers.server";
import { indexPath } from "./invest";
import { readJsonCached, readTextCached } from "./read-cache.server";
import { sourceHref } from "./sources";

const familyById: Partial<Record<ProductId, Family>> = {
  "kupat-gemel-lehashkaa": "provident",
  "keren-hishtalmut": "provident",
  "pension-comprehensive": "pension",
  "pension-general": "pension",
  "provident-for-annuity": "pension",
  "bank-deposit": "deposit",
  "savings-plan": "deposit",
  "current-account": "deposit",
  "money-market-fund-daily": "securities",
  "money-market-fund-renewable": "securities",
  "brokerage-account": "securities",
  "ira-hishtalmut": "securities",
  makam: "makam",
  "government-bond": "bond",
};

/** The nine tier-2 instruments (product D2) with the glossary row that names each; the open questions are method G-24's. */
export const tier2Table: { id: string; he: string; questions: string[]; display: string }[] = [
  { id: "savings-policies", he: "פוליסת חיסכון", questions: ["TXA OQ1"], display: "TXA OQ1" },
  { id: "executive-insurance", he: "ביטוח מנהלים", questions: ["TXA OQ6"], display: "TXA OQ6" },
  { id: "structured-deposits", he: "פיקדון מובנה", questions: ["TX2 OQ5"], display: "TX2 OQ5" },
  { id: "corporate-bonds", he: 'אג"ח קונצרניות', questions: ["TX2 OQ6"], display: "TX2 OQ6" },
  { id: "managed-portfolios", he: "ניהול תיקי השקעות", questions: ["MGD OQ2"], display: "MGD OQ2" },
  { id: "foreign-currency-deposits", he: "פיקדון במטבע חוץ", questions: ["TX2 OQ2"], display: "TX2 OQ2" },
  { id: "reits", he: "קרן להשקעות במקרקעין", questions: ["TX2 OQ8"], display: "TX2 OQ8" },
  { id: "gold-via-funds", he: "השקעה בזהב דרך קרנות סל", questions: ["TX2 OQ10"], display: "TX2 OQ10" },
  { id: "amendment-190-deposits", he: "תיקון 190", questions: ["TXA OQ14"], display: "TXA OQ14" },
];

function tier2List(): Tier2Row[] {
  const rows = new Map(loadNotCovered().map((r) => [r.he, r]));
  const g24 = readTextCached(join(root, "docs/method.md")).split("\n").find((l) => l.startsWith("| G-24 |")) ?? "";
  return tier2Table.map((t) => {
    if (!rows.has(t.he)) throw new Error(`compare bundle: docs/glossary.md section 3 has no row "${t.he}" for tier-2 instrument ${t.id}`);
    for (const q of t.questions) if (!g24.includes(q)) throw new Error(`compare bundle: method G-24 does not name ${q} (tier-2 instrument ${t.id})`);
    return { id: t.id, name: t.he, openQuestion: t.display };
  });
}

type FeeLine = FeesSnapshot["lines"][number];

/** A provident wrapper's collected list fees (F-105): the latest snapshot of each manager whose list prints both a balance and a deposit fee for it. */
export function providentLists(id: string, snapshots: FeesSnapshot[]): { snap: FeesSnapshot; balance: ValueObject; deposit: ValueObject; lines: { balance: FeeLine; deposit: FeeLine } }[] {
  const latest = new Map<string, FeesSnapshot>();
  for (const s of snapshots) {
    if (!s.lines.some((l) => l.applies_to.includes(id) && l.level === "list")) continue;
    const prev = latest.get(s.id);
    if (!prev || s.snapshot >= prev.snapshot) latest.set(s.id, s);
  }
  const out: { snap: FeesSnapshot; balance: ValueObject; deposit: ValueObject; lines: { balance: FeeLine; deposit: FeeLine } }[] = [];
  for (const snap of latest.values()) {
    const line = (base: string) => snap.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base && typeof l.rate.value === "number");
    const balance = line("balance");
    const deposit = line("deposit");
    if (balance && deposit) out.push({ snap, balance: balance.rate, deposit: deposit.rate, lines: { balance, deposit } });
  }
  return out.sort((a, b) => a.snap.id.localeCompare(b.snap.id));
}

/** PF-13's minimum discount period in months, from the rule record (A-19). */
export function minDiscountMonths(allRules: Record<string, RuleRecord>): number {
  const f = allRules["PF-13"]?.figures?.min_discount_years;
  const years = f && "value" in f ? f.value : undefined;
  if (typeof years !== "number") throw new Error("PF-13 has no min_discount_years figure");
  return 12 * years;
}

/**
 * One list line as the run prices it (A-19, read with D56 and PF-13), rates in percent: the printed `rate` for `months` months, then `after`.
 * A rate below `reverts_to` is a discount that lasts the printed period, no shorter than PF-13's minimum; an offer (`offer_he`, a rate
 * conditional on a document that is not published) is priced at `reverts_to` from the start; a line with no `reverts_to` is one rate.
 */
export function pricedLine(l: FeeLine, minMonths: number): { rate: number; after: number; months: number; discounted: boolean; offer: boolean } {
  const printed = l.rate.value as number;
  const to = typeof l.reverts_to?.value === "number" ? l.reverts_to.value : null;
  const offer = l.offer_he !== undefined && to !== null;
  if (offer) return { rate: to, after: to, months: 0, discounted: false, offer };
  if (to === null || to <= printed) return { rate: printed, after: printed, months: 0, discounted: false, offer };
  const printedMonths = typeof l.discount_months?.value === "number" ? l.discount_months.value : 0;
  return { rate: printed, after: to, months: Math.max(printedMonths, minMonths), discounted: true, offer };
}

/**
 * D86: how a balance fee the person enters is held. Below what the run would otherwise charge it holds for PF-13's period and then returns
 * to that rate: the rate the record's discount reverts to (`reverts_to`, else the regulations' cap), or the record's own rate where it has
 * no discount (a list printed at the cap, or a regulator's average the run holds for every year). So an entered fee changes one thing.
 */
export function ownFeeHoldOf(id: string, terms: InstrumentTerms, feeValues: Record<string, SiteValue>, allRules: Record<string, RuleRecord>, today: string): WrapperEntry["ownFeeHold"] | null {
  const years = allRules["PF-13"] ? ruleFigure(allRules["PF-13"], "min_discount_years", today) : null;
  if (!years || !terms.fees) return null;
  const months = minDiscountMonths(allRules);
  const own = terms.fees.discount;
  if (own && feeValues.afterBalance) return { months, years, revertsTo: own.listRate, rate: feeValues.afterBalance };
  const rate = feeValues.balance;
  return rate && typeof rate.value === "number" ? { months, years, revertsTo: terms.fees.balance, rate } : null;
}

/**
 * The manager a provident wrapper's example runs on when more than one list is collected (F-80, 2026-11-07): the one P-05 names, else the
 * one whose fees, as `pricedLine` prices them, are the lowest on both bases in every month, which leaves any plan the most (direct expenses
 * are left out: no collected list prints a rate for them). Managers whose
 * prices are the same in every month tie: the example runs on the first by id and `tied` names them all. When no list is the lowest on
 * both, none is chosen: which leaves more then depends on the plan, and the page says it has no run rather than pick one manager as the
 * general case.
 */
export function providentPick(
  id: string,
  snapshots: FeesSnapshot[],
  spec: { tariff?: string } | undefined,
  allRules: Record<string, RuleRecord>,
): { id: string; count: number; tied?: string[] } | null {
  const lists = providentLists(id, snapshots);
  if (lists.length === 0) return null;
  const named = spec?.tariff ? lists.find((l) => l.snap.id === spec.tariff) : undefined;
  if (named) return { id: named.snap.id, count: lists.length };
  const min = minDiscountMonths(allRules);
  const priced = lists.map((l) => ({ id: l.snap.id, b: pricedLine(l.lines.balance, min), d: pricedLine(l.lines.deposit, min) }));
  const at = (p: ReturnType<typeof pricedLine>, m: number) => (m <= p.months ? p.rate : p.after);
  // the prices are steps: comparing at month 1 and the month after each discount ends compares them in every month
  const months = [...new Set([1, ...priced.flatMap((p) => [p.b.months + 1, p.d.months + 1])])];
  const noHigher = (a: (typeof priced)[number], b: (typeof priced)[number]) => months.every((m) => at(a.b, m) <= at(b.b, m) && at(a.d, m) <= at(b.d, m));
  const best = priced.filter((a) => priced.every((b) => noHigher(a, b)));
  if (best.length === 0) return null;
  return { id: best[0]!.id, count: lists.length, ...(best.length > 1 ? { tied: best.map((b) => b.id) } : {}) };
}

/**
 * The provident-family fees the guide page builds (guide.server.ts): the provider's list fee lines when they cover the wrapper (when several
 * managers' lists do, the one `providentPick` chooses, named in `pick`); for a fee the list does not give (a study fund, a general pension
 * fund, a provident fund for annuity: no company publishes a list price) the regulator's average actually charged on the `track` P-05's entry
 * names (method 2.4), labelled as an average. The pension and study-fund terms that come from the person (employment, salary, insurance) are
 * added when a run is built (compare.ts). A list rate below the most the bylaws allow runs as a discount that reverts to that most after
 * PF-13's period (A-19, F-16); the terms block shows both rates and the period.
 */
export function providentTerms(
  id: string,
  snapshots: FeesSnapshot[],
  spec: NonNullable<ParameterRecord["instruments"]>[string] | undefined,
  allRules: Record<string, RuleRecord>,
  today: string,
): { terms?: InstrumentTerms; feeValues: Record<string, SiteValue>; missing: string[]; pick?: { id: string; count: number; tied?: string[] } } {
  const covering = [...new Set(snapshots.filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list")).map((f) => f.id))];
  const pick = covering.length > 1 ? providentPick(id, snapshots, spec as { tariff?: string } | undefined, allRules) : null;
  if (covering.length > 1 && !pick) return { feeValues: {}, missing: [`${id}: ${covering.length} managers' list fees cover it and none is the lowest on both bases; F-80 picks none`] };
  const snap = snapshots.filter((f) => f.id === (pick?.id ?? covering[0]) && f.lines.some((l) => l.applies_to.includes(id) && l.level === "list")).sort((a, b) => a.snapshot.localeCompare(b.snapshot)).at(-1);
  const line = (base: string) => snap?.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base);
  const balance = line("balance");
  const deposit = line("deposit");
  const direct = line("direct_expenses");
  const pct = (v: ValueObject) => (v.value as number) / 100;
  // D31: a list fee is that company's own; the guide's terms block and the comparison name the company whose list the example reads
  const own = (v: ValueObject): SiteValue => (snap ? ownBy({ ...v } as SiteValue, shortName(snap.id, snap.provider.name_he)) : ({ ...v } as SiteValue));
  if (balance && deposit) {
    const min = minDiscountMonths(allRules);
    const pb = pricedLine(balance, min);
    const pd = pricedLine(deposit, min);
    // an offer runs at the rate its binding documents allow (D56); a discount at its printed rate, then the most the bylaws allow
    const shown = (l: FeeLine) => own(l.offer_he !== undefined && l.reverts_to ? l.reverts_to : l.rate);
    const feeValues: Record<string, SiteValue> = { balance: shown(balance), deposit: shown(deposit) };
    feeValues[pb.discounted ? "discountBalance" : "listBalance"] = feeValues.balance!;
    feeValues[pd.discounted ? "discountDeposit" : "listDeposit"] = feeValues.deposit!;
    if (pb.discounted) feeValues.afterBalance = own(balance.reverts_to!);
    if (pd.discounted) feeValues.afterDeposit = own(deposit.reverts_to!);
    // the period the terms block shows: a printed one longer than PF-13's minimum is the company's own; otherwise the minimum, from the rule
    // one period for both lines: the data check fails a balance and a deposit discount of one wrapper that print different periods (validate.ts, checkDiscountLines)
    const longer = ([[pb, balance], [pd, deposit]] as const).find(([p, l]) => p.discounted && p.months > min && l.discount_months);
    if (longer) feeValues.discountMonths = own(longer[1].discount_months!);
    else if (pb.discounted || pd.discounted) {
      const years = ruleFigure(allRules["PF-13"]!, "min_discount_years", today);
      if (years) feeValues.discountYears = years;
    }
    if (direct) feeValues.direct = own(direct.rate);
    // an unprinted period is PF-13's minimum (A-19), not a shorter one extended, so the run gets the period itself
    const discountOf = (p: ReturnType<typeof pricedLine>, l: FeeLine) => (p.discounted ? { months: typeof l.discount_months?.value === "number" ? l.discount_months.value : p.months, listRate: p.after / 100 } : undefined);
    const discount = discountOf(pb, balance);
    const depositDiscount = discountOf(pd, deposit);
    return {
      terms: { fees: { deposit: pd.rate / 100, balance: pb.rate / 100, direct: direct ? pct(direct.rate) : 0, ...(discount ? { discount } : {}), ...(depositDiscount ? { depositDiscount } : {}) } },
      feeValues,
      missing: [],
      ...(pick ? { pick } : {}),
    };
  }
  const reg = regulatorAverageFees(id, spec, loadCmaFees(), allRules, today, { balance: !!balance, deposit: !!deposit });
  if (!reg) return { feeValues: {}, missing: [snap ? `${id}: ${snap.id} has no list ${balance ? "deposit" : "balance"} line for it and P-05 names no track` : `${id}: no list-fee snapshot in data/fees/ covers it and P-05 names no track`] };
  if ("missing" in reg) return { feeValues: {}, missing: reg.missing };
  const feeValues: Record<string, SiteValue> = { ...reg.feeValues };
  if (balance) feeValues.balance = own(balance.rate);
  if (deposit) feeValues.deposit = own(deposit.rate);
  if (direct) feeValues.direct = own(direct.rate);
  return {
    terms: { fees: { balance: balance ? pct(balance.rate) : reg.fees.balance, deposit: deposit ? pct(deposit.rate) : reg.fees.deposit, direct: direct ? pct(direct.rate) : 0 } },
    feeValues,
    missing: [],
  };
}

function collectRuleIds(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectRuleIds(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "rule_ids" && Array.isArray(v)) v.forEach((id) => typeof id === "string" && out.add(id));
      else collectRuleIds(v, out);
    }
  }
  return out;
}

/** BANK-22's Bank of Israel page, read from the il-finance reference the rule record was written from (the record holds no link). */
function cashLink(): CompareBundle["cashLink"] {
  const file = join(root, ".claude/skills/il-finance/references/bank-current-account-deposits.md");
  if (!existsSync(file)) return null;
  const text = readTextCached(file);
  const start = text.indexOf("### BANK-22");
  if (start < 0) return null;
  const end = text.indexOf("\n### ", start + 5);
  const section = text.slice(start, end < 0 ? undefined : end);
  const m = /\[(EDGE dataflow INTEREST_DASH)\]\((https?:\/\/[^)\s]+)\)/.exec(section);
  return m ? { href: sourceHref({ url: m[2]! }), title: "בנק ישראל, ריביות בפועל בפיקדונות (INTEREST_DASH)", ruleId: "BANK-22" } : null;
}

/** Profiles that change which rules a run reads: age (the 60 rules), employment, income, horizon, return, constraints. */
function probeGoals(): RunGoal[] {
  const out: RunGoal[] = [];
  const base: RunGoal = { horizonYears: 10, amountNow: 50_000, monthly: 2_000, available: 0, anytime: false, returnPct: 6, inflationPct: null, age: 22, employment: "employee", salary: 12_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
  for (const age of [22, 45, 65]) for (const employment of ["employee", "self-employed"] as const) for (const horizonYears of [1, 3, 7, 20, 40]) for (const salary of [12_000, 60_000]) out.push({ ...base, age, employment, horizonYears, salary });
  for (const returnPct of [null, 0, 12]) out.push({ ...base, returnPct });
  for (const anytime of [true, false]) for (const available of [0, 20_000]) out.push({ ...base, anytime, available, horizonYears: 4 });
  out.push({ ...base, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null }, { ...base, pensionEmployee: null, pensionEmployer: null, insurancePct: null }, { ...base, amountNow: 0 }, { ...base, monthly: 0, amountNow: 400_000 }, { ...base, monthly: 9_000, amountNow: 900_000, salary: 40_000, age: 62, horizonYears: 12 });
  return out;
}

/**
 * A deposit-family wrapper's own published rate (A-21, A-25; D20): the `rate_offered` of the deposit-terms record P-05
 * names, as the record holds it (a value object, state sourced, strength institution), so the run rests on the bank's
 * Directive 447 table and the row can say when it was published (`effective_from`).
 */
function depositRate(wrapperId: string, family: string, spec: { deposit_terms?: string } | undefined, deposits: DepositTerms[]): SiteValue | null {
  if (family !== "deposit" || !spec?.deposit_terms) return null;
  const rec = deposits.find((d) => d.id === spec.deposit_terms && d.wrapper_id === wrapperId);
  const rate = rec?.rate_offered;
  if (!rate || typeof rate.value !== "number" || rate.unit !== "pct_per_year") return null;
  // D31: the idle-cash row and the comparison name the bank whose published rate this is
  return ownBy({ ...rate }, publisherHe(rate as SiteValue));
}

/** A deposit wrapper's `amount_range` as its record holds it (audit 2026-10-24 (sweep)): the amounts the published rate applies to. */
function depositRange(wrapperId: string, family: string, spec: { deposit_terms?: string } | undefined, deposits: DepositTerms[]): WrapperEntry["cashRange"] | null {
  if (family !== "deposit" || !spec?.deposit_terms) return null;
  const rec = deposits.find((d) => d.id === spec.deposit_terms && d.wrapper_id === wrapperId);
  if (!rec?.amount_range) return null;
  return { min: { ...rec.amount_range.min }, max: rec.amount_range.max ? { ...rec.amount_range.max } : null };
}

/** The instrument a wrapper's run stands for, named from the data: the fund or track P-05 names and the provider whose tariff it names (audit 2026-10-24 (sweep)). */
function representativeOf(
  spec: { fund?: string | number; track?: string | number; tariff?: string } | undefined,
  funds: { id: string; names: { he: string[] } }[],
  tracks: { fundId: number; name: string }[],
  fees: FeesSnapshot[],
): WrapperEntry["representative"] | null {
  if (!spec) return null;
  let name: string | undefined;
  if (spec.fund !== undefined) name = funds.find((f) => f.id === String(spec.fund))?.names.he[0];
  else if (spec.track !== undefined) name = tracks.find((t) => t.fundId === Number(spec.track))?.name;
  if (!name) return null;
  const provider = spec.tariff ? fees.find((f) => f.id === spec.tariff)?.provider.name_he : undefined;
  return { name, ...(provider ? { provider } : {}) };
}


/**
 * The brokerage wrapper's choice of provider (2026-10-24): the tariff of every bank and broker snapshot the providers workbench
 * ranks (the same latest snapshots, the same `providersOf`), read by the engine's own tariff step (F-63's `buildTariff`) for the
 * fund class the representative is, so a chosen provider's run reads the same lines the workbench ranks. The channel is the
 * workbench's default, direct, and the branch one only where the snapshot has no direct trade line. FX is left out as it is in the
 * run (a fund in shekels). A provider whose snapshot is missing, ambiguous or has no trade line is left out. Only the lines the
 * run reads are kept, each as its record's value object.
 *
 * A security run in the securities account (D6, amended 2026-10-26: makam and a government bond held directly) takes the same choice:
 * `productId` is the security, the lines are the account's for its class, and only the lines its run reads are
 * kept (commissions, custody, the account's monthly fee). The member's kind travels with the tariff (F-14: a bank may not charge
 * custody on makam, BRK-17; a non-bank member's line applies).
 */
function providerTariffs(productId: string, instrumentClass: string): Record<string, ProviderTariff> {
  const out: Record<string, ProviderTariff> = {};
  const direct = productId !== BROKERAGE;
  for (const snap of providersOf({ snapshots: latestSnapshots().map(onlyWhatCanBeDone) }, BROKERAGE)) {
    if (snap.missing) continue;
    // a security held directly is bought on TASE through an Israeli member; a foreign broker does not sell makam or Israeli government bonds
    if (direct && snap.provider.class === "foreign_broker") continue;
    for (const channel of ["direct", "branch"]) {
      let built: ReturnType<typeof engineTariff>;
      try {
        built = engineTariff({ instrumentClass, wrapper: BROKERAGE, channel } as WorkbenchInput, { snapshot: snap, level: "list" }, snap);
      } catch (e) {
        // a tariff the run cannot price leaves the list; any other fault is a fault, never a shorter list
        if (e instanceof Unusable) break;
        throw e;
      }
      if (built.noLine.includes("trade") || !built.tariff.buy) continue;
      const tariff = direct ? pickLines(built.tariff, ["buy", "sell", "redeem", "custody", "monthlyFee"]) : built.tariff;
      const feeValues: Record<string, SiteValue> = {};
      for (const id of built.linesUsed) {
        const l = snap.lines.find((x) => x.id === id);
        if (!l) continue;
        const bound = (v: ValueObject | null | undefined) => (v && typeof v.value === "number" ? { ...v } : undefined);
        if (l.base === "trade" && l.band === STANDING_ORDER_BAND) {
          feeValues.standingRate = { ...l.rate };
          const lo = bound(l.min), hi = bound(l.max);
          if (lo) feeValues.standingMin = lo;
          if (hi) feeValues.standingMax = hi;
        } else if (l.base === "trade" && l.band === REDEMPTION_BAND) {
          Object.assign(feeValues, redemptionValues(l));
        } else if (l.base === "trade") {
          feeValues.tradeRate = { ...l.rate };
          const lo = bound(l.min), hi = bound(l.max);
          if (lo) feeValues.tradeMin = lo;
          if (hi) feeValues.tradeMax = hi;
        } else if (l.base === "custody" && tariff.custody) {
          feeValues.custodyRate = { ...l.rate };
          const lo = bound(l.min), hi = bound(l.max);
          if (lo) feeValues.custodyMin = lo;
          if (hi) feeValues.custodyMax = hi;
        } else if (l.base === "fixed_period" && tariff.monthlyFee !== undefined) {
          // F-17 (method 2.4): an account fee printed per period is the printed line divided by the months in its period
          const printed = ownBy({ ...l.rate } as SiteValue, snap.provider.name_he);
          const period: Record<string, SiteValue> = l.period ? { [ci.names.period!]: { ...printed, value: r3fees.periods[l.period], unit: "text", about: ci.names.period! } } : {};
          feeValues.monthlyFee = l.rate.unit === "nis_per_month" ? { ...l.rate } : computed(tariff.monthlyFee, "nis_per_month", "F-17", { [ci.names.fee_line!]: printed, ...period }, { today: today(), about: guideBlocks.terms.labels.monthlyFee! });
        }
      }
      // D31: the card names the provider whose tariff the run reads, so its lines are that provider's own figures
      out[snap.id] = { name: snap.provider.name_he, channel, tariff: tariff as ProviderTariff["tariff"], feeValues: ownEach(feeValues, snap.provider.name_he), memberKind: memberKindOf(snap.provider.class) };
      break;
    }
  }
  return out;
}

/** The tariff with only the lines a run reads (a makam or bond run refuses any other, `runInputs`). */
function pickLines<T extends Record<string, unknown>>(tariff: T, keys: readonly string[]): T {
  return Object.fromEntries(Object.entries(tariff).filter(([k]) => keys.includes(k))) as T;
}

/** The security class each security held directly in the securities account is priced at (data-schema §2, `fee.applies_to`). */
const securityClass: Partial<Record<ProductId, string>> = { makam: "makam", "government-bond": "tase_bonds" };

/**
 * The lowest in-fund cost (fixed and variable management and trustee, the same measure as the run's fee) among the fund records
 * collected for the exposure the wrapper's fund stands for (2026-10-24); undefined when the wrapper holds no fund or no record states a cost.
 */
function classMinFee(spec: { fund?: string | number } | undefined, funds: ReturnType<typeof loadFunds>, today: string): SiteValue | undefined {
  if (spec?.fund === undefined) return undefined;
  const rep = funds.find((f) => f.id === String(spec.fund));
  const exposure = (rep as { exposure_id?: string } | undefined)?.exposure_id;
  if (!rep || !exposure) return undefined;
  // F-10: each fund's own cost lines (the record's fixed and variable management and trustee, the run's `fundManagement`, `fundVariable`,
  // `fundTrustee`) added up as the run would take them; the lowest fund's sum is the figure, with that fund's lines as its inputs
  const lineKey = { fixed_management: "fundManagement", variable_management: "fundVariable", trustee: "fundTrustee" } as const;
  let best: { total: number; lines: Record<string, SiteValue>; id: string } | null = null;
  for (const f of funds.filter((x) => (x as { exposure_id?: string }).exposure_id === exposure)) {
    const lines: Record<string, SiteValue> = {};
    for (const k of ["fixed_management", "variable_management", "trustee"] as const) {
      const v = f.fees[k];
      if (v && typeof v.value === "number") lines[lineKey[k]] = { ...v };
    }
    if (Object.keys(lines).length === 0) continue;
    const total = Object.values(lines).reduce((sum, v) => sum + (v.value as number), 0);
    if (!best || total < best.total) best = { total, lines, id: f.id };
  }
  return best ? fundCostOf(best.lines, fundCostKeys, `הנמוכה ביותר שנאספה באותה חשיפה (${best.id})`, today) : undefined;
}

/** Wrappers whose fund (and so whose terms) depend on the exposure they hold: the fund collected for the exposure (`exposure_id`) gives the terms. */
const fundHoldingWrappers: ProductId[] = ["brokerage-account", "money-market-fund-daily", "money-market-fund-renewable"];

/**
 * Release 5, exposure mode: every exposure record, and for each exposure the terms of a securities wrapper that holds
 * it through the fund collected for it (P-05's tariff for that wrapper, the fund's own costs). An exposure with no
 * fund record has no entry: the row reads "not evaluated: details not collected", never another instrument's terms.
 */
function exposureData(wrappers: WrapperEntry[], p05: ParameterRecord, sources: Parameters<typeof buildInstrumentTerms>[3]): { exposures: ExposureEntry[]; exposureTerms: Record<string, Record<string, HoldingTerms>> } {
  const records = loadExposures();
  const funds = loadFunds();
  const exposureTerms: Record<string, Record<string, HoldingTerms>> = {};
  const exposures = records.map((record): ExposureEntry => {
    const forExposure = funds.filter((f) => (f as { exposure_id?: string }).exposure_id === record.id);
    for (const wid of fundHoldingWrappers) {
      if (!record.wrapper_ids?.includes(wid)) continue;
      const own = p05.instruments?.[wid];
      const fund = forExposure.find((f) => f.id === own?.fund) ?? forExposure[0];
      if (!fund) continue;
      const built = buildInstrumentTerms(wid, "securities", { ...(own ?? {}), fund: fund.id }, sources);
      if ("missing" in built) {
        console.log(`[compare] ${record.id} in ${wid} via fund ${fund.id}: no terms: ${built.missing.join("; ")}`);
        continue;
      }
      (exposureTerms[record.id] ??= {})[wid] = { fundId: fund.id, terms: built.terms, feeValues: built.feeValues };
    }
    return { record, name: record.names.he[0] ?? record.id, oneLine: record.one_line_he ?? null, guideHref: exposureHref(record.id), fundsHref: forExposure.length > 0 && record.kind === "equity_index" ? indexPath(record.id) : null };
  });
  void wrappers;
  return { exposures, exposureTerms };
}

/**
 * The funds the brokerage account can hold for an equity index (2026-10-25, D27/D28): each fund record collected for an `equity_index`
 * exposure that the engine can run, as the fund kind with its cost lines (the same builder as the guide pages and exposure mode). A fund the
 * builder refuses (another currency, a distributing fund with no yield, a tax track not modelled) has no entry, so a way over it is not run
 * by the comparison. Which fund and broker a goal uses comes from `site/app/lib/invest.ts` on the client (`compare-index.ts`).
 */
function indexFundTerms(p05: ParameterRecord, sources: Parameters<typeof buildInstrumentTerms>[3]): Record<string, IndexFundTerms> {
  const indices = new Set(loadExposures().filter((e) => e.kind === "equity_index").map((e) => e.id));
  const out: Record<string, IndexFundTerms> = {};
  const own = p05.instruments?.[BROKERAGE];
  for (const f of loadFunds()) {
    const rec = f as unknown as { id: string; exposure_id?: string; names: { he: string[]; en: string[] } };
    if (!rec.exposure_id || !indices.has(rec.exposure_id)) continue;
    const built = buildInstrumentTerms(BROKERAGE, "securities", { ...(own ?? {}), fund: rec.id }, sources);
    if ("missing" in built || !built.terms.fund) continue;
    // D31: the way names the fund, so its costs are its manager's own figures
    const feeValues = ownEach(Object.fromEntries(Object.entries(built.feeValues).filter(([k]) => k.startsWith("fund") || k === "ninetyPercentTest")), (f as { manager: string }).manager);
    out[rec.id] = { name: rec.names.he[0] ?? rec.names.en[0] ?? rec.id, fund: built.terms.fund, feeValues };
  }
  return out;
}

/** The latest `checked` date anywhere in a record: what a refresh of the file changes (F-82 compares it). */
function latestChecked(node: unknown, best: string | null = null): string | null {
  if (Array.isArray(node)) return node.reduce<string | null>((b, n) => latestChecked(n, b), best);
  if (node && typeof node === "object") {
    let b = best;
    for (const [k, v] of Object.entries(node)) {
      if (k === "checked" && typeof v === "string" && (!b || v > b)) b = v;
      else b = latestChecked(v, b);
    }
    return b;
  }
  return best;
}

/** The records a comparison reads, with the date each was last checked, for the saved comparison's versions. */
function dataFileVersions(): BundleDataFile[] {
  const out: BundleDataFile[] = [];
  const dirs: { dir: string; feeds: (rec: Record<string, unknown>) => string[] }[] = [
    { dir: "data/instruments/wrappers", feeds: (r) => [String(r.id)] },
    { dir: "data/instruments/securities", feeds: (r) => [String(r.id)] },
    { dir: "data/instruments/exposures", feeds: (r) => [String(r.id)] },
    { dir: "data/terms/deposits", feeds: (r) => (typeof r.wrapper_id === "string" ? [r.wrapper_id] : []) },
    { dir: "data/funds", feeds: (r) => [String(r.exposure_id ?? ""), ...fundHoldingWrappers].filter(Boolean) },
    { dir: "data/fees", feeds: () => [] },
  ];
  for (const { dir, feeds } of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs).filter((n) => n.endsWith(".json")).sort()) {
      const rec = readJsonCached(join(abs, f)) as Record<string, unknown>;
      out.push({ path: `${dir}/${f}`, checked: latestChecked(rec) ?? (typeof rec.snapshot === "string" ? rec.snapshot : null), for: feeds(rec) });
    }
  }
  return out;
}

export function buildCompareBundle(): CompareBundle {
  const t = today();
  const allRules = loadRules();
  const parameters = loadParameters().filter((p) => ["P-01", "P-02", "P-05", "P-07", "P-08"].includes((p as { method_id?: string }).method_id ?? "")) as ParameterRecord[];
  const p05 = parameters.find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  for (const m of ["P-01", "P-02", "P-07", "P-08"]) if (!parameters.some((p) => p.method_id === m)) throw new Error(`data/parameters/ holds no ${m} record`);

  const fees = loadFees();
  const sources = { fees, funds: loadFunds(), deposits: loadDepositTerms(), rules: allRules, today: t };
  const cmaTracks = loadCma().tracks;
  const repOf = (id: string) => representativeOf(p05.instruments?.[id] as never, sources.funds as never, cmaTracks, fees);
  const wrappers: WrapperEntry[] = loadProducts().map((record: ProductRecord): WrapperEntry => {
    const family = familyById[record.id] ?? null;
    const base = { id: record.id, name: record.names.he[0]!, family, record, feeValues: {} as Record<string, SiteValue>, missing: [] as string[] };
    if (family === "provident" || family === "pension") {
      const r = providentTerms(record.id, fees, p05.instruments?.[record.id], allRules, t);
      // a run on a manager's list is not the track P-05 names: that track only names the class the fee page compares with (D88)
      const onList = "listBalance" in r.feeValues || "discountBalance" in r.feeValues;
      const rep = onList ? null : repOf(record.id);
      const hold = r.terms ? ownFeeHoldOf(record.id, r.terms, r.feeValues, allRules, t) : null;
      return { ...base, ...(r.terms ? { terms: r.terms } : {}), ...(rep ? { representative: rep } : {}), ...(hold ? { ownFeeHold: hold } : {}), feeValues: r.feeValues, missing: r.missing };
    }
    if (family === null) return { ...base, missing: [`${record.id}: no instrument terms are built for it`] };
    const built = buildInstrumentTerms(record.id, family, p05.instruments?.[record.id], sources);
    // F-85 (founder, 2026-10-26: "almost nobody gets that 1%"): the current account runs on the rate most collected banks print, as on its
    // guide page, not on the one bank P-05 names; idle cash's baseline and the comparison's current-account row read it
    const common = record.id === "current-account" ? commonAccountRate(accountBanks(currentAccountRecords(sources.deposits)), allRules, t) : null;
    const rate = common ? common.rate : depositRate(record.id, family, p05.instruments?.[record.id], sources.deposits);
    if ("missing" in built) return { ...base, missing: built.missing };
    const range = depositRange(record.id, family, p05.instruments?.[record.id], sources.deposits);
    const rep = repOf(record.id);
    // F-26 (2026-10-25): the current account's rate is paid on the balance up to the record's `amount_range.max` (BANK-09)
    const ceilingValue: SiteValue | undefined =
      record.id !== "current-account" ? undefined
      : common ? (common.ceiling && typeof common.ceiling.value === "number" ? common.ceiling : undefined)
      : rate && range?.max && range.max.unit === "nis" && typeof range.max.value === "number" ? range.max : undefined;
    const ceiling = ceilingValue?.value as number | undefined;
    const terms = ceiling !== undefined && built.terms.deposit ? { ...built.terms, deposit: { ...built.terms.deposit, balanceCeiling: ceiling } } : built.terms;
    return { ...base, terms, feeValues: built.feeValues, ...(rate ? { cashRate: rate } : {}), ...(range ? { cashRange: range } : {}), ...(ceilingValue && ceiling !== undefined && built.terms.deposit ? { cashCeiling: ceilingValue } : {}), ...(rep ? { representative: rep } : {}) };
  });
  // review fix 2026-10-24: what P-04 judges each wrapper's run by (see `WrapperEntry.fitBasis`)
  for (const w of wrappers) {
    const spec = p05.instruments?.[w.id] as { track?: string | number; fund?: string | number } | undefined;
    if (spec?.track !== undefined) {
      const t = cmaTracks.find((x) => x.fundId === Number(spec.track));
      if (t) w.fitBasis = { track: { specialization: t.specialization, subSpecialization: t.subSpecialization, classification: t.classification } };
    } else if (spec?.fund !== undefined) {
      const f = sources.funds.find((x) => x.id === String(spec.fund)) as { exposure_id?: string } | undefined;
      const e = loadExposures().find((x) => x.id === f?.exposure_id);
      if (e?.kind === "equity_index") w.fitBasis = { equity: true };
    }
  }
  for (const w of wrappers) {
    if (!w.representative) continue;
    const fee = representativeFeeValue(w, t);
    const min = classMinFee(p05.instruments?.[w.id] as never, sources.funds, t);
    const named = p05.instruments?.[w.id]?.tariff;
    // the channel of the trade line the site's own tariff read: the list trade line whose rate and minimum are the ones the run takes
    const rate = w.feeValues.tradeRate?.value;
    const snap = named ? latestSnapshots().find((x) => x.id === named) : undefined;
    const channel = snap?.lines.find((l) => l.level === "list" && l.base === "trade" && l.band !== STANDING_ORDER_BAND && l.band !== REDEMPTION_BAND && l.rate.value === rate && (w.feeValues.tradeMin === undefined || l.min?.value === w.feeValues.tradeMin.value))?.channel;
    // D31: the card names the fund and the provider whose tariff it reads; their figures are those companies' own
    const fundRecord = sources.funds.find((x) => x.id === String(p05.instruments?.[w.id]?.fund));
    if (fundRecord) w.feeValues = ownEach(w.feeValues, fundRecord.manager, (k) => k.startsWith("fund"));
    if (snap) w.feeValues = ownEach(w.feeValues, snap.provider.name_he, (k) => tariffKeys.includes(k));
    const named2 = fundRecord ? representativeFeeValue(w, t) : fee;
    w.representative = { ...w.representative, ...(named2 ? { fee: named2 } : {}), ...(min ? { classMinFee: min } : {}), ...(named ? { providerId: named } : {}), ...(channel ? { channel } : {}) };
  }
  for (const w of wrappers) {
    if (w.id !== BROKERAGE || !w.terms) continue;
    // the tariff lines are read for the class of the fund the account holds, not a fixed one: a tariff with no line for that class gives no price (F-63, "No line, no price", 2026-10-25)
    const fundRec = sources.funds.find((x) => x.id === String(p05.instruments?.[w.id]?.fund));
    const fundClass = fundRec ? instrumentClassOf(fundRec, loadExposures().find((e) => e.id === fundRec.exposure_id)) : "etf_units";
    const providers = providerTariffs(w.id, fundClass);
    if (Object.keys(providers).length > 0) w.providers = providers;
  }
  // D6 (amended 2026-10-26): makam and a government bond are held in the securities account, so the account's choice of provider
  // (F-80) prices them too, at the lines for their own class. The money-market funds keep the bank case P-05 names: at a bank with a
  // distribution agreement the holder pays nothing to buy, hold or redeem them (MF-26, BANK-18), which no tariff can undercut.
  for (const w of wrappers) {
    const cls = securityClass[w.id];
    if (!cls || !w.terms) continue;
    const providers = providerTariffs(w.id, cls);
    if (Object.keys(providers).length > 0) w.providers = providers;
  }
  for (const w of wrappers) for (const m of w.missing) console.log(`[compare] ${w.id}: no terms: ${m}`);

  const indexFunds = indexFundTerms(p05, sources);
  const tier2 = tier2List();
  const checklist = loadChecklistRows();
  const { exposures, exposureTerms } = exposureData(wrappers, p05, sources);
  const dataFiles = dataFileVersions();

  // ---- the rules a run may read: found by running the comparison over the profiles above with every rule at hand,
  // plus every rule the wrapper records cite (reasons and chips link to them) and the two the screens quote.
  const draft: CompareBundle = { runDate: t, wrappers, parameters, tier2, rules: Object.values(allRules), checklist, cashLink: cashLink(), exposures, exposureTerms, indexFunds, dataFiles, site: { version: `r5-${t}`, data: `bundle-${t}` }, fit: fitTable() };
  const needed = new Set<string>(["PEN-36", "BANK-22"]);
  for (const w of wrappers) collectRuleIds(w.record).forEach((id) => needed.add(id));
  for (const w of wrappers) for (const f of Object.values(w.feeValues)) (f.rule_ids ?? []).forEach((id) => needed.add(id));
  for (const e of exposures) (e.record.rule_ids ?? []).forEach((id) => needed.add(id));
  for (const h of Object.values(indexFunds)) for (const f of Object.values(h.feeValues)) (f.rule_ids ?? []).forEach((id) => needed.add(id));
  for (const byWrapper of Object.values(exposureTerms)) for (const h of Object.values(byWrapper)) for (const f of Object.values(h.feeValues)) (f.rule_ids ?? []).forEach((id) => needed.add(id));
  let runs = 0;
  for (const g of probeGoals()) {
    try {
      const ev = evaluate(draft, g);
      runs += 1;
      for (const c of ev.candidates) {
        c.run?.rules.forEach((r) => needed.add(r.id));
        c.reasons.forEach((r) => r.ruleIds.forEach((id) => needed.add(id)));
      }
      ev.set.keptAvailable?.run?.rules.forEach((r) => needed.add(r.id));
    } catch (e) {
      console.log(`[compare] probe stopped: ${e instanceof Error ? e.message : e}`);
    }
  }
  const rules: RuleRecord[] = Object.values(allRules).filter((r) => needed.has(r.id));
  const missingRules = [...needed].filter((id) => !allRules[id] && !/OQ/.test(id));
  if (missingRules.length > 0) console.log(`[compare] cited but not in data/rules/: ${missingRules.join(", ")}`);
  const bundle: CompareBundle = { ...draft, rules, pointed: Object.values(pointedRecords(rules, allRules)) };
  console.log(`[compare] bundle: ${wrappers.length} wrappers, ${wrappers.filter((w) => w.terms).length} with terms, ${rules.length} of ${Object.keys(allRules).length} rules, ${runs} probe runs, ${(JSON.stringify(bundle).length / 1024).toFixed(0)} KB`);
  return bundle;
}

let cached: CompareBundle | null = null;
export function compareBundle(): CompareBundle {
  return (cached ??= buildCompareBundle());
}

/** What the goal form and the comparison read besides the bundle: the presets (P-07), the ranges, P-05's inflation, PEN-36's text. */
export function goalFormData() {
  const t = today();
  const parameters = loadParameters();
  const p07 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-07") as unknown as {
    presets: Record<string, unknown>;
    ranges: Record<string, { min: ValueObject; max: ValueObject; step?: ValueObject }>;
    rationale: string;
    rationale_he?: string;
  };
  const p05 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-05") as unknown as {
    inputs: Record<string, ValueObject>;
    ranges: Record<string, { min: ValueObject; max: ValueObject }>;
    sliders: Record<string, { min: ValueObject; max: ValueObject; step?: ValueObject; start?: ValueObject }>;
  };
  if (!p07 || !p05) throw new Error("data/parameters/ holds no P-07 or P-05 record");
  const range = (r: { min: ValueObject; max: ValueObject; step?: ValueObject }) => ({ min: r.min.value as number, max: r.max.value as number, step: (r.step?.value as number | undefined) ?? 1 });
  const rules = loadRules();
  const pen36 = rules["PEN-36"] ?? null;
  return {
    today: t,
    presets: p07.presets,
    meta: { rationale: p07.rationale, rationaleHe: p07.rationale_he ?? null },
    form: {
      horizon: range(p07.ranges.horizon_years!),
      monthly: range(p05.sliders.monthly_deposit!),
      // the indices page's knob strip (F-89): each slider's range and the step whose effect it shows
      knobs: Object.fromEntries((["amount_now", "monthly_deposit", "horizon_years", "A-01"] as const).map((k) => [k, range(p05.sliders[k]!)])) as Record<"amount_now" | "monthly_deposit" | "horizon_years" | "A-01", { min: number; max: number; step: number }>,
      // the spider chart's shares (F-90), in percent
      share: { ...range(p05.sliders.change_share!), start: p05.sliders.change_share!.start!.value as number },
      age: { min: p05.ranges.age!.min.value as number, max: p05.ranges.age!.max.value as number },
      pct: { min: p05.ranges.pct!.min.value as number, max: p05.ranges.pct!.max.value as number },
      inflationStart: p05.inputs["A-02"]!.value as number,
      minMonth: t.slice(0, 7),
      payslipText: (pen36 as { text_he?: string } | null)?.text_he ?? null,
    },
    rules: pen36 ? { "PEN-36": pen36 } : {},
    pointed: pen36 ? pointedRecords({ "PEN-36": pen36 }, rules) : {},
  };
}

let contextCache: { today: string; presets: Record<string, unknown>; meta: { rationale: string; rationaleHe?: string | null } } | null = null;

/** What a page needs to mount the saved-goal strip: the presets (P-07, to read a goal's preset-filled numbers) and their rationale. */
export function goalContext() {
  if (!contextCache) {
    const d = goalFormData();
    contextCache = { today: d.today, presets: d.presets, meta: d.meta };
  }
  return contextCache;
}

/**
 * P-04, the classification-to-horizon fit table (`data/parameters/classification-fit.json`): the horizon half only.
 * The loss-filter column (`max_fall_pct`) ships from release 5 (D11) and is applied on the site (lib/fit.ts). Each bound is the record's
 * value object with the site-parameter marker, so the mark's rule line can show it through the provenance component.
 */
export function fitTable(): FitTableData {
  const rec = loadParameters().find((p) => (p as { method_id?: string }).method_id === "P-04") as unknown as
    | { table: { classification: string; horizon_min_years: ValueObject; horizon_max_years: ValueObject; max_fall_pct?: ValueObject }[]; rationale: string; rationale_he?: string }
    | undefined;
  if (!rec) throw new Error("data/parameters/ holds no P-04 record");
  const param = (v: ValueObject): SiteValue => ({ ...v, parameter: { rationale: rec.rationale, rationaleHe: rec.rationale_he ?? null } });
  return {
    rows: rec.table.map((r) => ({
      classification: r.classification,
      minYears: param(r.horizon_min_years),
      maxYears: typeof r.horizon_max_years.value === "number" ? param(r.horizon_max_years) : null,
      maxFallPct: r.max_fall_pct && typeof r.max_fall_pct.value === "number" ? param(r.max_fall_pct) : null,
    })),
  };
}
