// Builds the data of a guide page's "what makes it different" visual at build time (D29): the engine bundles the visual runs,
// the sourced figures it shows by name, and what the data does not hold yet. One builder per wrapper id; builder G2 adds its own
// entries to `builders`. Server-only. Nothing here types a rate or a date: every figure is a record's value object, a rule's
// figure, or a P-05 parameter, and a missing one becomes a `gap` (shown as "עוד לא חושב" with its reason).
import type { DepositTerms } from "@finance-tool/schema";
import { loadParameters, loadRules, loadProducts, today } from "./data.server";
import { guideSignature } from "../copy";
import type { Bundle } from "./engine";
import { p05Value } from "./engine";
import { accountBanks, breakFact, breakInput, commonAccountRate, currentAccountRecords, depositRange, familyOf, guideInstrumentBundle, oneYearDepositRecords, publishedDeposit, type InstrumentFamily } from "./guide-signature-bundle.server";
// the break column moved beside the deposit example that counts by it; the guide loader still takes it from here
export { breakFact, breakInput };
import type { SignatureData } from "./guide-signature";
import { loadDepositTerms, loadFunds } from "./instruments.server";
import { emptyData, figureOf, withRules, type SignatureCtx } from "./guide-signature-ctx.server";
import { buildPension, buildStudyFund } from "./guide-signature-g2.server";
import { computed, ownBy, type SiteValue } from "./value";
import { shortName } from "./providers";

type Builder = (c: SignatureCtx) => SignatureData;

/** The wrapper ids that have a visual built here. A page with an id not in this map keeps its timeline open (guide.tsx). */
export const builders: Record<string, Builder> = {};

export function hasSignature(id: string): boolean {
  return id in builders;
}

/** The signature data of a page, or null when the wrapper has no visual. Throws never for missing data: a gap is recorded instead. */
export function buildSignatureData(id: string, own: Bundle | null): SignatureData | null {
  const build = builders[id];
  if (!build) return null;
  const p05 = loadParameters().find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  return build({ p05, allRules: loadRules(), wrappers: loadProducts(), deposits: loadDepositTerms(), funds: loadFunds(), t: today(), own, id });
}

// ---------------------------------------------------------------- helpers

function bundleOf(c: SignatureCtx, wrapperId: string): Bundle | null {
  if (wrapperId === c.id && c.own) return c.own;
  const record = c.wrappers.find((w) => w.id === wrapperId);
  const family = familyOf(wrapperId as never);
  if (!record || !family || family === "provident") return null;
  return guideInstrumentBundle(record, family as InstrumentFamily, c.p05, c.allRules, c.t).bundle;
}

function addBundle(d: SignatureData, c: SignatureCtx, wrapperId: string): Bundle | null {
  const b = bundleOf(c, wrapperId);
  if (b) d.bundles[wrapperId] = b;
  else d.gaps.push(`bundle:${wrapperId}`);
  return b;
}

function depositFacts(d: SignatureData, c: SignatureCtx, wrapperId: string, spec: { deposit_terms?: string } | undefined = c.p05.instruments?.[wrapperId]): { rate?: SiteValue; rec?: DepositTerms } {
  const pub = publishedDeposit(wrapperId, spec, c.deposits);
  if (!pub) {
    d.gaps.push(`deposit:${wrapperId}`);
    return {};
  }
  // D31: the bank's own deposit terms, shown where the visual names the bank (the copy says "הפיקדון של לאומי")
  const bank = shortName(pub.record.bank, pub.record.bank);
  const own = (v: SiteValue): SiteValue => ownBy(v, bank);
  const rate = own(pub.rate);
  d.facts.rate = rate;
  const term = pub.record.term_months;
  if (typeof term.value === "number") d.facts.term = own({ ...term } as SiteValue);
  d.facts.break = own(breakFact(pub.record));
  if (pub.record.amount_range) {
    d.facts.amountMin = own({ ...pub.record.amount_range.min } as SiteValue);
    if (pub.record.amount_range.max) d.facts.amountMax = own({ ...pub.record.amount_range.max } as SiteValue);
  }
  if (pub.ceiling) d.facts.ceiling = own(pub.ceiling);
  return { rate, rec: pub.record };
}

/** The banks' one-year fixed-rate deposits and their range (F-86), on `d`: the deposit row of the ladder and of the makam page. */
function addDepositBanks(d: SignatureData, c: SignatureCtx): ReturnType<typeof depositRange> {
  const records = oneYearDepositRecords(c.deposits);
  // each bank's own break terms, on the line that names the bank (D31)
  const banks = accountBanks(records).map((b) => ({ ...b, exit: ownBy(breakFact(records.find((r) => r.id === b.id)!), b.name) }));
  d.depositBanks = banks;
  const range = depositRange(banks, c.t);
  if (!range) d.gaps.push("depositBanks");
  else {
    d.facts.depositLo = range.lo;
    d.facts.depositHi = range.hi;
    d.facts.depositCount = range.count;
    // F-86: of the same deposits, how many forbid taking the money out before the end of the term (each record's 447 column); a count
    // over the collected banks, naming none (D30)
    // over the same records as the bank count: those whose rate is a number (accountBanks)
    const counted = records.filter((r) => banks.some((b) => b.id === r.id));
    const inputs = Object.fromEntries(counted.map((r) => [shortName(r.bank, r.bank), breakInput(r, shortName(r.bank, r.bank))]));
    d.facts.depositNoExitCount = computed(counted.filter((r) => !r.break.allowed).length, "count", "F-86", inputs, { today: c.t, about: guideSignature.deposit.about.noExitCount });
  }
  return range;
}

// ---------------------------------------------------------------- current account

/** The banks' current-account records and the rate most of them pay (F-85), on `d`: the data both the account page and the ladder read. */
function addAccountBanks(d: SignatureData, c: SignatureCtx): { common: ReturnType<typeof commonAccountRate> } {
  const banks = accountBanks(currentAccountRecords(c.deposits));
  d.banks = banks;
  const common = commonAccountRate(banks, c.allRules, c.t);
  if (!common) d.gaps.push("accountBanks");
  return { common };
}

builders["current-account"] = (c) => {
  const d = emptyData(c.id);
  addBundle(d, c, "current-account");
  addBundle(d, c, "money-market-fund-daily");
  const { common } = addAccountBanks(d, c);
  if (common) {
    d.facts.commonRate = common.rate;
    d.facts.commonCount = common.count;
    d.facts.bankCount = common.of;
    d.facts.payingCount = common.paying;
  }
  d.facts.cashRate = p05Value(c.p05, "cash_rate");
  // the tax the bank withholds on the interest, for the table's "the most it pays in a year, after tax" (TXI-08 withholds TXI-03's rate)
  const tax = figureOf(c, "TXI-03", "rate");
  if (tax) d.facts.taxRate = tax;
  else d.gaps.push("rule:TXI-03");
  return withRules(d, "BANK-09", "BANK-13", "TXI-03", "TXI-08");
};

// ---------------------------------------------------------------- savings plan

builders["savings-plan"] = (c) => {
  const d = emptyData(c.id);
  addBundle(d, c, "savings-plan");
  depositFacts(d, c, "savings-plan");
  // the nearest alternative: one lump sum in the bank deposit
  const lump = publishedDeposit("bank-deposit", c.p05.instruments?.["bank-deposit"], c.deposits);
  if (lump) {
    const lumpBank = shortName(lump.record.bank, lump.record.bank);
    d.facts.lumpRate = ownBy(lump.rate, lumpBank);
    if (typeof lump.record.term_months.value === "number") d.facts.lumpTerm = ownBy({ ...lump.record.term_months } as SiteValue, lumpBank);
  } else d.gaps.push("deposit:bank-deposit");
  // BANK-28 / BANK OQ12: no general rule says whether each monthly instalment has its own lock-up; each bank's plan agreement does (one bank's: BPN-10), so the ladder is the F-22 reading
  d.gaps.push("planLockPerDeposit");
  const brk = d.facts.break;
  if (brk && brk.value !== "not_allowed" && brk.value !== "none") d.gaps.push("depositBreak");
  return withRules(d, "BANK-28", "BANK-06", "BANK-27", "TXI-03", "TXI-07");
};

// ---------------------------------------------------------------- daily money-market fund (the ladder)

builders["money-market-fund-daily"] = (c) => {
  const d = emptyData(c.id);
  addBundle(d, c, "money-market-fund-daily");
  // the current-account row is the rate most of the collected banks publish (F-85), with the best a bank pays beside it
  const { common } = addAccountBanks(d, c);
  // the one-year deposit row is the range across the collected banks (F-86), never one bank's rate
  addDepositBanks(d, c);
  // names the ladder reads
  if (common) {
    d.facts.currentRate = common.rate;
    d.facts.currentCount = common.count;
    d.facts.currentBankCount = common.of;
  }
  d.facts.cashRate = p05Value(c.p05, "cash_rate");
  // MF-08: the longest a renewable fund's money can wait for its next date, by the law's default
  const max = figureOf(c, "MF-08", "max_interval_months");
  if (max) d.facts.maxInterval = max;
  else d.gaps.push("maxInterval");
  // MF-10, MF-11 (prices regulations reg. 15): an order before the fund's set hour is redeemed that day and the distributor pays the same day
  // (MF-11); MF-35: the renewable fund's dates are chosen when buying
  return withRules(d, "MF-08", "MF-10", "MF-11", "MF-34", "MF-35", "BANK-06", "BANK-09", "BANK-13");
};

// ---------------------------------------------------------------- makam

builders["makam"] = (c) => {
  const d = emptyData(c.id);
  addBundle(d, c, "makam");
  d.facts.cashRate = p05Value(c.p05, "cash_rate");
  const discount = figureOf(c, "TXI-11", "rate");
  const gain = figureOf(c, "TXI-12", "rate");
  if (discount) d.facts.discountRate = discount;
  else d.gaps.push("rule:TXI-11");
  if (gain) d.facts.gainRate = gain;
  else d.gaps.push("rule:TXI-12");
  // the one-year deposit it is set against: the range across the collected banks and how many of them lock the money (F-86)
  addDepositBanks(d, c);
  return withRules(d, "GOV-03", "GOV-06", "GOV-17", "GOV-22", "GOV-23", "TXI-11", "TXI-12", "TXI-03");
};

// ---------------------------------------------------------------- government bond

builders["government-bond"] = (c) => {
  const d = emptyData(c.id);
  const own = addBundle(d, c, "government-bond");
  addBundle(d, c, "makam");
  d.facts.cashRate = p05Value(c.p05, "cash_rate");
  if (own?.feeValues.couponEvery) d.facts.couponEvery = own.feeValues.couponEvery;
  else d.gaps.push("rule:GOV-11");
  if (own?.feeValues.linkage) d.facts.linkage = own.feeValues.linkage;
  const series = c.p05.instruments?.[c.id]?.series_rule;
  if (series) {
    const face = figureOf(c, series, "face_value");
    const min = figureOf(c, series, "term_min_months");
    if (face) d.facts.faceValue = face;
    if (min) d.facts.termMin = min;
  }
  return withRules(d, c.p05.instruments?.[c.id]?.series_rule ?? "GOV-11", "GOV-12", "GOV-16", "GOV-17", "TXI-14", "TXI-25");
};

// ---------------------------------------------------------------- builder G2: study fund, pensions
// (the builders live in guide-signature-g2.server.ts)

builders["keren-hishtalmut"] = buildStudyFund;
builders["pension-comprehensive"] = buildPension;
builders["pension-general"] = buildPension;
builders["provident-for-annuity"] = buildPension;
