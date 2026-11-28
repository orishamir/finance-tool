// The label system of "השקעה במדד" (spec §3, facts 10.1): each label has an id, an icon, a tone and two or three words, and
// is computed from records, never typed per row. The words and explanations are in copy.ts (`invest.labels`). A label states
// a sourced fact or an open rule; it never praises. A label shows on every row it is true of, even when every row has it
// ; its colour is its family's (the kit's LabelChip).
import type { FundRecord } from "@finance-tool/schema";
import { coversIndex, dividendsOf, fundCountryOf, gapListOf, hasTwoEnds, insideTaxCaseOf, readsStatedIndex, saleOnlyRulingOf, taxIndexStatementOf, usDividendsOf, type InsideTax, type InsideTaxCase, type NotCounted, type TaxIndexStatement } from "@finance-tool/engine";
import { currencyWord, invest as c } from "../copy";
import { sourceHref } from "./sources";
import type { IndexRef, OptionId, ProviderInfo } from "./invest";
import { assertNever, isShekel } from "@finance-tool/schema";
import { dividendsOfTyped, typedDividendTax, type TypedDividendTax } from "./index-region";
import { isCustomFund, type FundKind } from "./custom-entries";

/** The engine's fund kind for an option's funds (F-04). */
const OPTION_KIND = { "il-tracking": "israeli-fund", "il-etf": "israeli-fund", "tase-foreign": "tase-foreign-fund", abroad: "foreign-fund" } as const satisfies Record<OptionId, string>;

export type LabelTone = "neutral" | "caution" | "open";
/** What each icon draws: each says what its label is about, and labels about different things never share one.
 *  "sign" is the currency's own sign, chosen by the label's currency (`signOf`). */
export type LabelIconKey =
  | "home" | "landmark" | "globe"
  | "pulse" | "calendarClock"
  | "box" | "swap" | "fileClock" | "fileCheck" | "blend"
  | "dollar" | "euro" | "pound" | "yen" | "franc" | "currency" | "shield"
  | "trendUpDown" | "badgePercent" | "percent" | "lock" | "gavel"
  | "piggy" | "handCoins"
  | "filePen" | "receipt" | "scroll" | "eyeOff" | "fileSignature" | "ban"
  | "megaphone" | "building" | "coins" | "scale" | "userPlus" | "unlink";
type IconDef = LabelIconKey | "sign";

type LabelId =
  | "held-il"
  | "held-tase-foreign"
  | "held-tase-unknown"
  | "held-abroad"
  | "trade-etf"
  | "trade-tracking"
  | "follow-physical"
  | "follow-swap"
  | "follow-futures"
  | "follow-mixed"
  | "currency"
  | "hedged"
  | "hedged-many"
  | "currency-many"
  | "currency-foreign"
  | "currency-bought"
  | "currency-mismatch"
  | "tax-currency"
  | "tax-currency-unknown"
  | "tax-fund-dividend"
  | "tax-fund-dividend-left-out"
  | "tax-fund-dividend-part"
  | "tax-fund-dividend-swap"
  | "tax-fund-dividend-us-keeps"
  | "tax-fund-dividend-need-yield"
  | "tax-fund-dividend-israel"
  | "tax-fund-dividend-place"
  | "tax-fund-dividend-years"
  | "tax-fund-dividend-gap"
  | "tax-fund-dividend-net"
  | "tax-fund-dividend-net-reading"
  | "tax-fund-dividend-range"
  | "tax-fund-dividend-tracking"
  | "tax-fund-dividend-us-fund"
  | "tax-fund-dividend-il-fund"
  | "tax-fund-dividend-domicile"
  | "tax-distribution"
  | "tax-on-sale-ruling"
  | "tax-index-currency"
  | "tax-index-cpi"
  | "pays-accumulating"
  | "pays-distributing"
  | "ask-self-report"
  | "ask-tax-service"
  | "ask-estate"
  | "risk-unsupervised"
  | "ask-w8"
  | "unavailable";

/** A label made only from a fund's own statement about its units (product D84, `statementLabel`), never from an id. */
type StatementLabelId = "tax-index-currency" | "tax-index-cpi";
/** A label made from its id (`label`), resting on rules. */
export type RuleLabelId = Exclude<LabelId, StatementLabelId>;

type LabelDef = { icon: IconDef; tone: LabelTone; rules: string[] };

/** Structure only: the words are in copy.ts. */
export const labelDefs: Record<RuleLabelId, LabelDef> = {
  "held-il": { icon: "home", tone: "neutral", rules: ["ETF-31", "ETF-11"] },
  "held-tase-foreign": { icon: "landmark", tone: "neutral", rules: ["ETF-31", "ETF-24"] },
  "held-tase-unknown": { icon: "landmark", tone: "open", rules: ["ETF-31", "ETF-11", "ETF-24"] },
  "held-abroad": { icon: "globe", tone: "neutral", rules: ["ETF-24"] },
  "trade-etf": { icon: "pulse", tone: "neutral", rules: ["ETF-04"] },
  "trade-tracking": { icon: "calendarClock", tone: "neutral", rules: ["ETF-04", "MF-09"] },
  "follow-physical": { icon: "box", tone: "neutral", rules: ["ETF-11"] },
  "follow-swap": { icon: "swap", tone: "neutral", rules: ["ETF-51", "ETF-11", "ETF-53"] },
  "follow-futures": { icon: "fileClock", tone: "neutral", rules: ["ETF-11"] },
  "follow-mixed": { icon: "blend", tone: "neutral", rules: ["ETF-11", "ETF-53"] },
  currency: { icon: "sign", tone: "neutral", rules: ["ETF-12"] },
  hedged: { icon: "shield", tone: "neutral", rules: ["ETF-12", "ETF-10", "ETF-75"] },
  "hedged-many": { icon: "shield", tone: "neutral", rules: ["ETF-12", "ETF-10", "ETF-75"] },
  "currency-many": { icon: "sign", tone: "neutral", rules: ["ETF-12"] },
  "currency-foreign": { icon: "currency", tone: "neutral", rules: ["ETF-12"] },
  "currency-bought": { icon: "sign", tone: "neutral", rules: ["ETF-28", "TXF-03"] },
  "currency-mismatch": { icon: "unlink", tone: "caution", rules: ["ETF-28"] },
  "tax-currency": { icon: "trendUpDown", tone: "neutral", rules: ["TXS-09", "TXS-14"] },
  "tax-currency-unknown": { icon: "scale", tone: "open", rules: ["TXS-14"] },
  "tax-fund-dividend": { icon: "badgePercent", tone: "neutral", rules: ["TXF-16", "TXF-53"] },
  "tax-fund-dividend-left-out": { icon: "badgePercent", tone: "open", rules: ["TXF-16"] },
  "tax-fund-dividend-part": { icon: "badgePercent", tone: "open", rules: ["TXF-16", "TXF-54", "TXF-53"] },
  "tax-fund-dividend-years": { icon: "badgePercent", tone: "open", rules: ["TXF-59", "TXF-60", "TXF-16"] },
  "tax-fund-dividend-gap": { icon: "badgePercent", tone: "neutral", rules: ["ETF-44", "TXF-57"] },
  "tax-fund-dividend-net": { icon: "badgePercent", tone: "neutral", rules: ["TXF-59", "TXS-41"] },
  "tax-fund-dividend-net-reading": { icon: "badgePercent", tone: "caution", rules: ["TXF-59", "TXF-58", "TXS-41"] },
  "tax-fund-dividend-range": { icon: "badgePercent", tone: "caution", rules: ["TXF-53", "TXF-54", "TXF-57"] },
  "tax-fund-dividend-swap": { icon: "badgePercent", tone: "open", rules: ["TXS-41", "TXF-58"] },
  "tax-fund-dividend-us-keeps": { icon: "badgePercent", tone: "open", rules: ["TXF-50", "TXF-56"] },
  "tax-fund-dividend-need-yield": { icon: "badgePercent", tone: "open", rules: ["TXF-16"] },
  "tax-fund-dividend-israel": { icon: "badgePercent", tone: "open", rules: ["TXF-53", "TXF-57"] },
  "tax-fund-dividend-place": { icon: "badgePercent", tone: "open", rules: ["TXF-53"] },
  "tax-fund-dividend-tracking": { icon: "badgePercent", tone: "open", rules: ["TXF-54", "TXF-53", "TXF-16"] },
  "tax-fund-dividend-us-fund": { icon: "badgePercent", tone: "open", rules: ["TXF-56", "TXF-53", "TXF-16"] },
  "tax-fund-dividend-il-fund": { icon: "badgePercent", tone: "open", rules: ["TXF-57", "TXF-53", "TXF-16"] },
  "tax-fund-dividend-domicile": { icon: "badgePercent", tone: "open", rules: ["TXF-53", "TXF-16"] },
  "tax-distribution": { icon: "percent", tone: "neutral", rules: ["TXF-08", "TXS-10"] },
  "tax-on-sale-ruling": { icon: "gavel", tone: "neutral", rules: ["TXF-11"] },
  "pays-accumulating": { icon: "piggy", tone: "neutral", rules: ["MF-49"] },
  "pays-distributing": { icon: "handCoins", tone: "neutral", rules: ["MF-49"] },
  "ask-self-report": { icon: "filePen", tone: "caution", rules: ["TXF-22", "TXF-29"] },
  "ask-tax-service": { icon: "receipt", tone: "caution", rules: ["BRK-36", "TXF-22"] },
  "ask-estate": { icon: "scroll", tone: "caution", rules: ["TXF-27"] },
  "risk-unsupervised": { icon: "eyeOff", tone: "caution", rules: ["BRK-06", "ETF-24"] },
  "ask-w8": { icon: "fileSignature", tone: "neutral", rules: ["TXF-12", "TXF-13"] },
  unavailable: { icon: "ban", tone: "caution", rules: ["BRK-64", "BRK-65", "BRK-82"] },
};

/** A currency's own sign for its label; a currency without one in the set, or none known, takes the general currency sign. */
const signOf = (code: string | undefined): LabelIconKey =>
  ({ USD: "dollar", EUR: "euro", GBP: "pound", JPY: "yen", CHF: "franc" } as Record<string, LabelIconKey>)[code ?? ""] ?? "currency";

/** A bank deposit's kind (`variant` in its record), labelled on the bank page (lib/deposit-kind.ts); not one of the index page's labels. */
export type DepositLabelId = "deposit-campaign" | "deposit-closed-system" | "deposit-new-customers" | "deposit-interest-during-term" | "deposit-best-of";

/** What a label rests on: rules, with a document beside them where one is, or a fund's own statement, which is never a rule. */
type LabelRests = RuleRests | { statement: TaxIndexStatement };

/** The rules whose cards a label's sheet opens. */
interface RuleRests {
  rules: string[];
  /** A document the label rests on, shown under its rules: the ruling a fund's annex reports (TXF-11), a bank's table of rates for a deposit's kind. */
  doc?: { href: string; title: string };
  /** The words before that document, where it is not the fund's ("מסמך הקרן"): a bank's own table of rates for a deposit's kind. */
  docLead?: string;
}

export interface Label {
  id: LabelId | DepositLabelId;
  text: string;
  explain: string;
  icon: LabelIconKey;
  tone: LabelTone;
  /** The label's family, which picks its chip's colour. */
  family: keyof typeof c.labelFamilies | "deposit";
  rests: LabelRests;
}

/** A label that rests on rules: every label but one made from a fund's statement. */
export type RuleLabel = Label & { rests: RuleRests };

const familyOf: Record<RuleLabelId, Label["family"]> = {
  "held-il": "held",
  "held-tase-foreign": "held",
  "held-tase-unknown": "held",
  "held-abroad": "held",
  "trade-etf": "trade",
  "trade-tracking": "trade",
  "follow-physical": "follow",
  "follow-swap": "follow",
  "follow-futures": "follow",
  "follow-mixed": "follow",
  currency: "currency",
  hedged: "currency",
  "hedged-many": "currency",
  "currency-many": "currency",
  "currency-foreign": "currency",
  "currency-bought": "currency",
  "currency-mismatch": "currency",
  "tax-currency": "tax",
  "tax-currency-unknown": "tax",
  "tax-fund-dividend": "tax",
  "tax-fund-dividend-left-out": "tax",
  "tax-fund-dividend-part": "tax",
  "tax-fund-dividend-swap": "tax",
  "tax-fund-dividend-us-keeps": "tax",
  "tax-fund-dividend-need-yield": "tax",
  "tax-fund-dividend-israel": "tax",
  "tax-fund-dividend-place": "tax",
  "tax-fund-dividend-years": "tax",
  "tax-fund-dividend-gap": "tax",
  "tax-fund-dividend-net": "tax",
  "tax-fund-dividend-net-reading": "tax",
  "tax-fund-dividend-range": "tax",
  "tax-fund-dividend-tracking": "tax",
  "tax-fund-dividend-us-fund": "tax",
  "tax-fund-dividend-il-fund": "tax",
  "tax-fund-dividend-domicile": "tax",
  "tax-distribution": "tax",
  "tax-on-sale-ruling": "tax",
  "pays-accumulating": "payout",
  "pays-distributing": "payout",
  "ask-self-report": "asks",
  "ask-tax-service": "asks",
  "ask-estate": "asks",
  "risk-unsupervised": "asks",
  "ask-w8": "tax",
  unavailable: "availability",
};

/** A label resting on rules, from its id; `arg` is the currency a currency label names ("חשיפה לדולר"). */
export function label(id: RuleLabelId, arg?: string): RuleLabel {
  const def = labelDefs[id];
  const words = c.labels[id] as { text: string | ((ccy: string) => string); explain: string | ((ccy: string) => string) };
  const say = (w: string | ((ccy: string) => string)) => (typeof w === "function" ? w(currencyWord(arg ?? "USD")) : w);
  return { id, text: say(words.text), explain: say(words.explain), icon: def.icon === "sign" ? signOf(arg ?? "USD") : def.icon, tone: def.tone, family: familyOf[id], rests: { rules: def.rules } };
}

/**
 * The only way to a label resting on a fund's own statement (D84): its words from the statement, and the statement itself. Only a stated
 * tax index makes one: a document naming the fund a foreign-investment fund is said in its figures' sheets, and no chip says it (D119).
 */
function statementLabel(st: TaxIndexStatement): Label {
  return { id: st.index === "fx" ? "tax-index-currency" : "tax-index-cpi", ...c.statementLabels["tax-index"](st), icon: "fileCheck", tone: "neutral", family: "tax", rests: { statement: st } };
}



/**
 * What holds for every fund of a kind (shown once on an option's card): where it is held and how it trades. A fund the person typed in Tel
 * Aviv without its country is of no option's kind: it is held in Tel Aviv, and whether it is Israeli is not known.
 */
export function optionLabels(option: FundKind): RuleLabel[] {
  switch (option) {
    case "il-tracking":
      return [label("held-il"), label("trade-tracking")];
    case "il-etf":
      return [label("held-il"), label("trade-etf")];
    case "tase-foreign":
      return [label("held-tase-foreign"), label("trade-etf")];
    case "tase-unknown":
      return [label("held-tase-unknown"), label("trade-etf")];
    case "abroad":
      return [label("held-abroad")];
    default:
      return assertNever(option);
  }
}

/** What differs between the funds of an option, from the record. */
export function fundLabels(rec: FundRecord, index: IndexRef, option: OptionId): Label[] {
  const out: Label[] = [];
  const method = rec.replication?.method;
  if (method) out.push(label(method === "physical" ? "follow-physical" : method === "swap" ? "follow-swap" : method === "futures" ? "follow-futures" : "follow-mixed"));
  // what it does with dividends and interest: the label says it; the tax that follows is a label of its own
  if (rec.distribution_policy === "accumulating") out.push(label("pays-accumulating"));
  else if (rec.distribution_policy === "distributing") out.push(label("pays-distributing"));
  const indexCurrency = index.exposure?.currency;
  // an index priced in several currencies (ETF-48): a hedge removes only its own currency, and the unhedged fund carries them all
  const many = index.exposure?.other_currencies === true;
  if (rec.hedged === true) out.push(label(many ? "hedged-many" : "hedged", indexCurrency && !isShekel(indexCurrency) ? indexCurrency : index.custom ? c.indexCurrency : undefined));
  else if (indexCurrency && !isShekel(indexCurrency)) out.push(label(many ? "currency-many" : "currency", indexCurrency));
  // an index the person added: the site does not know its currency. The run moves the fund with the foreign currency the person said it
  // is bought in (invest.ts `exposureOf`), on the site's reading, and the label says that is the currency it is bought in, not the index's;
  // where they said none, the label names none
  else if (index.custom && !index.israeli) out.push(index.boughtIn ? label("currency-bought", index.boughtIn) : label("currency-foreign"));
  else if (!index.exposure && !index.israeli) out.push(label("currency", rec.currency));
  // tax: an Israeli fund on a foreign index that is not a foreign-investment fund is taxed on the currency move too (TXS-09, TXS-14); one
  // whose documents name a principal currency is run on it, the site's reading of TXS OQ26, which its figures' sheets say and no chip does
  // (D119); one whose status is not known (a fund the person typed among them, whose documents the site did not read) is run on both
  // readings, and its chip says the status is not known (F-04). The tax inside the fund on its index's dividends: `dividendTaxLabel`.
  const status = rec.tax_status.foreign_investment_fund;
  if (rec.domicile === "IL" && !index.israeli && typeof status?.value !== "string") {
    if (status?.value === null) out.push(label("tax-currency-unknown"));
    else if (rec.hedged !== true) out.push(label("tax-currency"));
  }
  const dividendTax = dividendTaxLabel(rec, index);
  if (dividendTax) out.push(label(dividendTax));
  if (rec.distribution_policy === "distributing") out.push(label("tax-distribution"));
  // a Tel Aviv line taxed only at sale on the ruling its own annex reports (TXF-11), by the engine's own test (`saleOnlyRulingOf`); any
  // other accumulating foreign fund, the same units bought abroad among them, is run on the site's reading of the rule, which its figures'
  // sheets say and no chip does (D120)
  const ruling = saleOnlyRulingOf(rec, OPTION_KIND[option]);
  if (ruling) out.push(withDoc(label("tax-on-sale-ruling"), { href: sourceHref({ url: ruling.source.url, page: ruling.pages.ruling }), title: ruling.source.title }));
  // a fund whose own annex states its tax index under its ruling, where its runs are made on it: the fund's statement, its page linked (F-04,
  // D84), by the engine's own test (`readsStatedIndex`). A fund whose policy is not known is not run at all (`fundRun`), so says none.
  const stated = rec.distribution_policy !== null && readsStatedIndex(OPTION_KIND[option]) ? taxIndexStatementOf(rec) : undefined;
  if (stated) out.push(statementLabel(stated));
  if (rec.domicile === "US") out.push(label("ask-estate"));
  // the form bears only on what a US fund pays out (F-20, A-31): a fund that pays nothing out has no figure that assumes it
  if (rec.domicile === "US" && rec.distribution_policy === "distributing") out.push(label("ask-w8"));
  return out;
}

/** The labels of the tax inside a fund on its shares' dividends: counted, or each reason it is not. */
export type DividendTaxLabelId = Extract<RuleLabelId, `tax-fund-dividend${string}`>;

/**
 * How much of the tax inside the fund each label says the run counts (method F-107, F-133): all the method reaches (`counted`), at the
 * cautious end of two (`range`), only part of it (`part`), or none (`not-counted`). The panel's checklist reads it.
 */
export const DIVIDEND_TAX_COUNTS = {
  "tax-fund-dividend": "counted",
  "tax-fund-dividend-years": "counted",
  "tax-fund-dividend-gap": "counted",
  "tax-fund-dividend-net": "counted",
  "tax-fund-dividend-net-reading": "counted",
  "tax-fund-dividend-range": "range",
  "tax-fund-dividend-part": "part",
  "tax-fund-dividend-left-out": "not-counted",
  "tax-fund-dividend-swap": "not-counted",
  "tax-fund-dividend-us-keeps": "not-counted",
  "tax-fund-dividend-need-yield": "not-counted",
  "tax-fund-dividend-israel": "not-counted",
  "tax-fund-dividend-place": "not-counted",
  "tax-fund-dividend-tracking": "not-counted",
  "tax-fund-dividend-us-fund": "not-counted",
  "tax-fund-dividend-il-fund": "not-counted",
  "tax-fund-dividend-domicile": "not-counted",
} as const satisfies Record<DividendTaxLabelId, "counted" | "range" | "part" | "not-counted">;

/** On an index the person added whose dividends give no part, by what they said of it (`typedDividendTax`). */
const TYPED_NO_PART = { counted: "tax-fund-dividend-need-yield", "need-yield": "tax-fund-dividend-need-yield", israel: "tax-fund-dividend-israel", "other-place": "tax-fund-dividend-place" } as const satisfies Record<TypedDividendTax, DividendTaxLabelId>;

/**
 * The case of the tax inside a fund on its index (method A-11, F-107, F-133), as the run reads it (`insideTaxCaseOf`): the index's
 * dividends from its record or from what the person said of it. F-92 (d)'s gross comparison is made against no peer: every fund on TA-35,
 * TA-90 and TA-125, the indices it admits, measures against a gross series.
 */
function dividendTaxCaseOf(rec: FundRecord, index: IndexRef): InsideTaxCase {
  const dividends = index.custom ? dividendsOfTyped(index.custom) : index.exposure ? dividendsOf(index.exposure) : undefined;
  return insideTaxCaseOf(rec, {
    dividends,
    list: gapListOf(rec, index.exposure ?? undefined, []),
    typed: isCustomFund(rec),
    withholding: typeof rec.fees.fund_level_withholding_drag?.value === "number",
    published: typeof rec.fees.tracking_difference_12m?.value === "number",
  });
}

/**
 * The label of the tax inside a fund on its index's dividends (method F-107, F-133, A-11): counted, how, or what is not counted, never zero
 * (D56); null where nothing is left out. One rule for every fund, collected or typed, the run's own case (`dividendTaxCaseOf`). The panel's
 * checklist says the same from the same label.
 */
export function dividendTaxLabel(rec: FundRecord, index: IndexRef): DividendTaxLabelId | null {
  const c = dividendTaxCaseOf(rec, index);
  switch (c.kind) {
    // only an Irish fund's figure of its own speaks of a tax the run counts; any other fund counted so has nothing left out to say
    case "own-figure":
      return rec.domicile === "IE" ? "tax-fund-dividend" : null;
    case "gap-gross":
      return "tax-fund-dividend-gap";
    case "counted":
      return countedLabel(c.tax);
    case "not-counted":
      return notCountedLabel(c.why, rec, index);
    default:
      return assertNever(c);
  }
}

/**
 * A counted case's label, the first that applies: through its years against a net index, whose deduction outside the parts F-107 holds
 * is not counted against them (F-133 (b)); a held fund whose parts leave some of its index out, which says what is not counted while the
 * figure's "?" says its two ends; at two ends; a swap fund at its net index's deduction, its own statement or the site's reading
 * (F-133 (a)); a held fund on its whole index. A US fund on an index of US companies alone leaves nothing out (TXF-56).
 */
function countedLabel(t: InsideTax): DividendTaxLabelId | null {
  if (t.years) return "tax-fund-dividend-years";
  const b = t.basis;
  if (b.kind === "held" && !coversIndex(t)) return b.fund === "us" ? "tax-fund-dividend-us-fund" : "tax-fund-dividend-part";
  if (hasTwoEnds(t)) return "tax-fund-dividend-range";
  switch (b.kind) {
    case "net":
      return b.statement === "fund" ? "tax-fund-dividend-net" : "tax-fund-dividend-net-reading";
    case "held":
      return b.fund === "us" ? null : "tax-fund-dividend";
    case "none":
    case "futures-net":
    case "synthetic-domestic":
    case "way-not-known":
      throw new Error(`an inside tax of kind ${b.kind} is counted through its years or at two ends`);
    default:
      return assertNever(b);
  }
}

/** Why a case is not counted, in the label for the fund's country and its index (method F-107). */
function notCountedLabel(why: NotCounted, rec: FundRecord, index: IndexRef): DividendTaxLabelId | null {
  const country = fundCountryOf(rec.domicile);
  switch (why) {
    case "us-keeps":
      return "tax-fund-dividend-us-keeps";
    case "synthetic":
      return "tax-fund-dividend-swap";
    case "domicile":
      return "tax-fund-dividend-domicile";
    case "some-shares":
    case "no-parts":
      if (country === "israel") return "tax-fund-dividend-il-fund";
      if (country === "us") return onlyUsCompanies(index) ? null : "tax-fund-dividend-us-fund";
      if (why === "some-shares") return "tax-fund-dividend-tracking";
      return index.custom ? TYPED_NO_PART[typedDividendTax(index.custom)] : "tax-fund-dividend-left-out";
    default:
      return assertNever(why);
  }
}

/**
 * Whether the site knows an index's companies are all in the United States: on an index the person added, where they said so; on a
 * collected one, where its US part is the whole index. Any other index may hold companies elsewhere, or the site does not know where they
 * are (the NASDAQ-100, whose record holds no part).
 */
function onlyUsCompanies(index: IndexRef): boolean {
  if (index.custom) return index.custom.region === "us";
  return (index.exposure ? usDividendsOf(index.exposure)?.weight : undefined) === 1;
}

/**
 * What a broker adds for an option: not available there, a foreign broker outside the Securities Authority's supervision, and who
 * deals with the tax. Reporting is the route's, never the fund's: a bank or a member of the exchange withholds on any fund (TXF-29).
 */
export function brokerLabels(p: ProviderInfo, unavailable: boolean): RuleLabel[] {
  const out: RuleLabel[] = [];
  if (unavailable) out.push(label("unavailable"));
  if (p.foreign) out.push(label("risk-unsupervised"), label(p.taxService ? "ask-tax-service" : "ask-self-report"));
  return out;
}

/** A label resting on rules with a document of the fund's own under them. */
const withDoc = (l: RuleLabel, doc: { href: string; title: string }): RuleLabel => ({ ...l, rests: { ...l.rests, doc } });

/**
 * Every label the page can show, for the kit's gallery: each one made from its id, then one for each
 * statement given, which a fund's own document makes (`statementExamples`).
 */
export function allLabels(statements: readonly TaxIndexStatement[]): Label[] {
  return [...(Object.keys(labelDefs) as RuleLabelId[]).map((id) => label(id)), ...statements.map(statementLabel)];
}

/** One statement for each label the records' statements make, the first record's: real ones, with their documents, to show the labels by. */
export function statementExamples(recs: readonly Pick<FundRecord, "tax_ruling">[]): TaxIndexStatement[] {
  const by = new Map<Label["id"], TaxIndexStatement>();
  for (const st of recs.flatMap((r) => taxIndexStatementOf(r) ?? [])) {
    const id = statementLabel(st).id;
    if (!by.has(id)) by.set(id, st);
  }
  return [...by.values()];
}
