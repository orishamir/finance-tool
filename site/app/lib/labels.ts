// The label system of "השקעה במדד" (spec §3, facts 10.1): each label has an id, an icon, a tone and two or three words, and
// is computed from records, never typed per row. The words and explanations are in copy.ts (`invest.labels`). A label states
// a sourced fact or an open rule; it never praises. A label shows on every row it is true of, even when every row has it
// ; its colour is its family's (the kit's LabelChip).
import type { FundRecord } from "@finance-tool/schema";
import { taxIndexStatementOf, type FundStatement } from "@finance-tool/engine";
import { invest as c } from "../copy";
import { sourceHref } from "./sources";
import type { IndexRef, OptionId, ProviderInfo } from "./invest";
import { isShekel } from "./fx";
import { assertNever } from "@finance-tool/schema";

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
  | "megaphone" | "building" | "coins" | "scale" | "userPlus";
type IconDef = LabelIconKey | "sign";

export type LabelId =
  | "held-il"
  | "held-tase-foreign"
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
  | "tax-currency"
  | "tax-currency-open"
  | "tax-currency-unknown"
  | "tax-fund-dividend"
  | "tax-distribution"
  | "tax-on-sale-open"
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

/**
 * What a label rests on: the rules whose cards its sheet opens, or a fund's own statement about its units (product D84), which is never a
 * rule: such a label names no rule, and links the statement's document at its page where it is made from it (`statementLabel`).
 */
type LabelDef = { icon: IconDef; tone: LabelTone } & ({ rules: string[] } | { statement: FundStatement["term"] });

/** Structure only: the words are in copy.ts. */
export const labelDefs: Record<LabelId, LabelDef> = {
  "held-il": { icon: "home", tone: "neutral", rules: ["ETF-31", "ETF-52"] },
  "held-tase-foreign": { icon: "landmark", tone: "neutral", rules: ["ETF-31", "ETF-24"] },
  "held-abroad": { icon: "globe", tone: "neutral", rules: ["ETF-24"] },
  "trade-etf": { icon: "pulse", tone: "neutral", rules: ["ETF-04"] },
  "trade-tracking": { icon: "calendarClock", tone: "neutral", rules: ["ETF-04", "MF-09"] },
  "follow-physical": { icon: "box", tone: "neutral", rules: ["ETF-52"] },
  "follow-swap": { icon: "swap", tone: "neutral", rules: ["ETF-51", "ETF-52", "ETF-53"] },
  "follow-futures": { icon: "fileClock", tone: "neutral", rules: ["ETF-52"] },
  "follow-mixed": { icon: "blend", tone: "neutral", rules: ["ETF-52", "ETF-53"] },
  currency: { icon: "sign", tone: "neutral", rules: ["ETF-12"] },
  hedged: { icon: "shield", tone: "neutral", rules: ["ETF-12", "ETF-10", "ETF-75"] },
  "hedged-many": { icon: "shield", tone: "neutral", rules: ["ETF-12", "ETF-10", "ETF-75"] },
  "currency-many": { icon: "sign", tone: "neutral", rules: ["ETF-12"] },
  "currency-foreign": { icon: "currency", tone: "neutral", rules: ["ETF-12"] },
  "tax-currency": { icon: "trendUpDown", tone: "neutral", rules: ["TXS-09", "TXS-14"] },
  "tax-currency-open": { icon: "scale", tone: "open", rules: ["TXS-14"] },
  "tax-currency-unknown": { icon: "scale", tone: "open", rules: ["TXS-14"] },
  "tax-fund-dividend": { icon: "badgePercent", tone: "neutral", rules: ["TXF-16"] },
  "tax-distribution": { icon: "percent", tone: "neutral", rules: ["TXF-08", "TXS-10"] },
  "tax-on-sale-open": { icon: "lock", tone: "open", rules: ["TXF-11"] },
  "tax-on-sale-ruling": { icon: "gavel", tone: "neutral", rules: ["TXF-11"] },
  "tax-index-currency": { icon: "fileCheck", tone: "neutral", statement: "tax-index" },
  "tax-index-cpi": { icon: "fileCheck", tone: "neutral", statement: "tax-index" },
  "pays-accumulating": { icon: "piggy", tone: "neutral", rules: ["MF-49"] },
  "pays-distributing": { icon: "handCoins", tone: "neutral", rules: ["MF-49"] },
  "ask-self-report": { icon: "filePen", tone: "caution", rules: ["TXF-22", "TXF-29"] },
  "ask-tax-service": { icon: "receipt", tone: "caution", rules: ["BRK-36", "TXF-22"] },
  "ask-estate": { icon: "scroll", tone: "caution", rules: ["TXF-27"] },
  "risk-unsupervised": { icon: "eyeOff", tone: "caution", rules: ["BRK-06", "ETF-24"] },
  "ask-w8": { icon: "fileSignature", tone: "caution", rules: ["TXF-13"] },
  unavailable: { icon: "ban", tone: "caution", rules: ["BRK-64", "BRK-65"] },
};

/** A currency's own sign for its label; a currency without one in the set, or none known, takes the general currency sign. */
const signOf = (code: string | undefined): LabelIconKey =>
  ({ USD: "dollar", EUR: "euro", GBP: "pound", JPY: "yen", CHF: "franc" } as Record<string, LabelIconKey>)[code ?? ""] ?? "currency";

/** A bank deposit's kind (`variant` in its record), labelled on the bank page (lib/deposit-kind.ts); not one of the index page's labels. */
export type DepositLabelId = "deposit-campaign" | "deposit-closed-system" | "deposit-new-customers" | "deposit-interest-during-term" | "deposit-best-of";

export interface Label {
  id: LabelId | DepositLabelId;
  text: string;
  explain: string;
  icon: LabelIconKey;
  tone: LabelTone;
  rules: string[];
  /** The label's family, for the "what do the labels mean" list. */
  family: keyof typeof c.labelFamilies | "deposit";
  /** A document of the fund's own that the label rests on, shown under its rules (the ruling its annex reports, TXF-11). */
  doc?: { href: string; title: string };
  /** The words before that document, where it is not the fund's ("מסמך הקרן"): a bank's own table of rates for a deposit's kind. */
  docLead?: string;
}

const familyOf: Record<LabelId, Label["family"]> = {
  "held-il": "held",
  "held-tase-foreign": "held",
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
  "tax-currency": "tax",
  "tax-currency-open": "tax",
  "tax-currency-unknown": "tax",
  "tax-fund-dividend": "tax",
  "tax-distribution": "tax",
  "tax-on-sale-open": "tax",
  "tax-on-sale-ruling": "tax",
  "tax-index-currency": "tax",
  "tax-index-cpi": "tax",
  "pays-accumulating": "payout",
  "pays-distributing": "payout",
  "ask-self-report": "asks",
  "ask-tax-service": "asks",
  "ask-estate": "asks",
  "risk-unsupervised": "asks",
  "ask-w8": "asks",
  unavailable: "availability",
};


/** The currency's Hebrew name for the label ("חשיפה לדולר"), else its ISO code. */
const currencyName = (code: string) => (c.currencies as Record<string, string>)[code] ?? code;

export function label(id: LabelId, arg?: string): Label {
  const def = labelDefs[id];
  const words = c.labels[id] as { text: string | ((ccy: string) => string); explain: string | ((ccy: string) => string) };
  const say = (w: string | ((ccy: string) => string)) => (typeof w === "function" ? w(currencyName(arg ?? "USD")) : w);
  return { id, text: say(words.text), explain: say(words.explain), icon: def.icon === "sign" ? signOf(arg ?? "USD") : def.icon, tone: def.tone, rules: "rules" in def ? def.rules : [], family: familyOf[id] };
}

/** A label made from a fund's own statement (D84): its words, and its document opened at the page the statement is on, in place of rules. */
export function statementLabel(st: FundStatement): Label {
  const doc = { href: sourceHref({ url: st.source.url, page: st.page }), title: st.source.title };
  switch (st.term) {
    case "tax-index":
      return { ...(st.index === "fx" ? label("tax-index-currency", st.currency) : label("tax-index-cpi")), doc };
    default:
      return assertNever(st.term);
  }
}

/** What holds for every fund in the option (shown once on its card): where it is held and how it trades. */
export function optionLabels(option: OptionId): Label[] {
  switch (option) {
    case "il-tracking":
      return [label("held-il"), label("trade-tracking")];
    case "il-etf":
      return [label("held-il"), label("trade-etf")];
    case "tase-foreign":
      return [label("held-tase-foreign"), label("trade-etf")];
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
  // an index the person added: the site does not know its currency, so the label names none
  else if (!index.exposure && !index.israeli) out.push(label(index.custom ? "currency-foreign" : "currency", rec.currency));
  // tax: an Israeli fund on a foreign index that is not a foreign-investment fund is taxed on the currency move too (TXS-09, TXS-14); one
  // whose documents name a principal currency is run on both readings of TXS OQ26, which its chip says; one whose status is not known (a
  // fund the person typed among them, whose documents the site did not read) is run the same way, and its chip says the status is not
  // known too (F-04). An Irish fund pays tax inside on dividends (TXF-16).
  const status = rec.tax_status.foreign_investment_fund;
  if (rec.domicile === "IL" && !index.israeli) {
    if (typeof status?.value === "string") out.push(label("tax-currency-open"));
    else if (status?.value === null) out.push(label("tax-currency-unknown"));
    else if (rec.hedged !== true) out.push(label("tax-currency"));
  }
  if (rec.domicile === "IE") out.push(label("tax-fund-dividend"));
  if (rec.distribution_policy === "distributing") out.push(label("tax-distribution"));
  // an accumulating foreign fund: taxed only at sale on the ruling its own annex reports, else an open question (TXF-11);
  // the same test the engine ranks it by (instruments.server.ts, saleOnlyRuling)
  else if (rec.distribution_policy === "accumulating" && rec.domicile !== "IL")
    out.push(rec.tax_ruling ? { ...label("tax-on-sale-ruling"), doc: { href: sourceHref({ url: rec.tax_ruling.source.url, page: rec.tax_ruling.pages.ruling }), title: rec.tax_ruling.source.title } } : label("tax-on-sale-open"));
  // a foreign fund in Tel Aviv whose own annex states its tax index under its ruling: the fund's statement, its page linked (F-04, D84);
  // the same units bought abroad keep TXF-03 whatever the record carries, so only the Tel Aviv line says it, and a distributing one stops
  // on its distribution's open part whatever its annex states (G-35), so only an accumulating one does
  const stated = option === "tase-foreign" && rec.distribution_policy === "accumulating" ? taxIndexStatementOf(rec) : undefined;
  if (stated) out.push(statementLabel(stated));
  if (rec.domicile === "US") out.push(label("ask-estate"), label("ask-w8"));
  return out;
}

/**
 * What a broker adds for an option: not available there, a foreign broker outside the Securities Authority's supervision, and who
 * deals with the tax. Reporting is the route's, never the fund's: a bank or a member of the exchange withholds on any fund (TXF-29).
 */
export function brokerLabels(p: ProviderInfo, unavailable: boolean): Label[] {
  const out: Label[] = [];
  if (unavailable) out.push(label("unavailable"));
  if (p.foreign) out.push(label("risk-unsupervised"), label(p.taxService ? "ask-tax-service" : "ask-self-report"));
  return out;
}

/** Every label the page can show, by family, for "מה אומרות התוויות?" (the ids that appear in `used` first). */
export function allLabels(): Label[] {
  return (Object.keys(labelDefs) as LabelId[]).map((id) => label(id));
}
