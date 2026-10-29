// The label system of "השקעה במדד" (spec §3, facts 10.1): each label has an id, an icon, a tone and two or three words, and
// is computed from records, never typed per row. The words and explanations are in copy.ts (`invest.labels`). A label states
// a sourced fact or an open rule; it never praises. A label shows on every row it is true of, even when every row has it
// (founder, 2026-10-27); its colour is its family's (the kit's LabelChip).
import type { FundRecord } from "@finance-tool/schema";
import { invest as c } from "../copy";
import type { IndexRef, OptionId, ProviderInfo } from "./invest";

export type LabelTone = "neutral" | "caution" | "open";
export type LabelIconKey = "home" | "globe" | "clock" | "layers" | "coins" | "shield" | "file" | "lock" | "alert" | "ban" | "percent" | "repeat" | "sun" | "piggy" | "handCoins";

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
  | "tax-currency"
  | "tax-fund-dividend"
  | "tax-distribution"
  | "tax-on-sale-open"
  | "pays-accumulating"
  | "pays-distributing"
  | "ask-self-report"
  | "ask-estate"
  | "risk-unsupervised"
  | "ask-w8"
  | "unavailable";

interface LabelDef {
  icon: LabelIconKey;
  tone: LabelTone;
  rules: string[];
}

/** Structure only: the words are in copy.ts. */
export const labelDefs: Record<LabelId, LabelDef> = {
  "held-il": { icon: "home", tone: "neutral", rules: ["ETF-31"] },
  "held-tase-foreign": { icon: "layers", tone: "neutral", rules: ["ETF-31", "ETF-24"] },
  "held-abroad": { icon: "globe", tone: "neutral", rules: ["ETF-24"] },
  "trade-etf": { icon: "clock", tone: "neutral", rules: ["ETF-04"] },
  "trade-tracking": { icon: "repeat", tone: "neutral", rules: ["ETF-04"] },
  "follow-physical": { icon: "layers", tone: "neutral", rules: ["ETF-52"] },
  "follow-swap": { icon: "repeat", tone: "neutral", rules: ["ETF-51", "ETF-52", "ETF-53"] },
  "follow-futures": { icon: "repeat", tone: "neutral", rules: ["ETF-52"] },
  "follow-mixed": { icon: "layers", tone: "neutral", rules: ["ETF-52", "ETF-53"] },
  currency: { icon: "coins", tone: "neutral", rules: ["ETF-12"] },
  hedged: { icon: "shield", tone: "neutral", rules: ["ETF-12"] },
  "hedged-many": { icon: "shield", tone: "neutral", rules: ["ETF-12"] },
  "currency-many": { icon: "coins", tone: "neutral", rules: ["ETF-12"] },
  "tax-currency": { icon: "percent", tone: "neutral", rules: ["TXS-09"] },
  "tax-fund-dividend": { icon: "percent", tone: "neutral", rules: ["TXF-16"] },
  "tax-distribution": { icon: "percent", tone: "neutral", rules: ["TXF-08"] },
  "tax-on-sale-open": { icon: "lock", tone: "open", rules: ["TXF-11"] },
  "pays-accumulating": { icon: "piggy", tone: "neutral", rules: ["MF-49"] },
  "pays-distributing": { icon: "handCoins", tone: "neutral", rules: ["MF-49"] },
  "ask-self-report": { icon: "file", tone: "caution", rules: ["TXF-22"] },
  "ask-estate": { icon: "alert", tone: "caution", rules: ["TXF-27"] },
  "risk-unsupervised": { icon: "ban", tone: "caution", rules: ["BRK-06", "ETF-24"] },
  "ask-w8": { icon: "file", tone: "caution", rules: ["TXF-13"] },
  unavailable: { icon: "ban", tone: "caution", rules: ["BRK-40"] },
};

export interface Label {
  id: LabelId;
  text: string;
  explain: string;
  icon: LabelIconKey;
  tone: LabelTone;
  rules: string[];
  /** The label's family, for the "what do the labels mean" list. */
  family: keyof typeof c.labelFamilies;
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
  "tax-currency": "tax",
  "tax-fund-dividend": "tax",
  "tax-distribution": "tax",
  "tax-on-sale-open": "tax",
  "pays-accumulating": "payout",
  "pays-distributing": "payout",
  "ask-self-report": "asks",
  "ask-estate": "asks",
  "risk-unsupervised": "asks",
  "ask-w8": "asks",
  unavailable: "availability",
};

const isIls = (code: string) => code === "NIS" || code === "ILS";

/** The currency's Hebrew name for the label ("חשיפה לדולר"), else its ISO code. */
const currencyName = (code: string) => (c.currencies as Record<string, string>)[code] ?? code;

export function label(id: LabelId, arg?: string): Label {
  const def = labelDefs[id];
  const words = c.labels[id] as { text: string | ((ccy: string) => string); explain: string | ((ccy: string) => string) };
  const say = (w: string | ((ccy: string) => string)) => (typeof w === "function" ? w(currencyName(arg ?? "USD")) : w);
  return { id, text: say(words.text), explain: say(words.explain), icon: def.icon, tone: def.tone, rules: def.rules, family: familyOf[id] };
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
      return [label("held-abroad"), label("ask-self-report")];
  }
}

/** What differs between the funds of an option, from the record. */
export function fundLabels(rec: FundRecord, index: IndexRef, option: OptionId): Label[] {
  const out: Label[] = [];
  const method = rec.replication?.method;
  if (method) out.push(label(method === "physical" ? "follow-physical" : method === "swap" ? "follow-swap" : method === "futures" ? "follow-futures" : "follow-mixed"));
  // what it does with dividends and interest (founder, 2026-10-27): the label says it; the tax that follows is a label of its own
  if (rec.distribution_policy === "accumulating") out.push(label("pays-accumulating"));
  else if (rec.distribution_policy === "distributing") out.push(label("pays-distributing"));
  const indexCurrency = index.exposure?.currency;
  // an index priced in several currencies (ETF-48): a hedge removes only its own currency, and the unhedged fund carries them all (2026-10-29)
  const many = index.exposure?.other_currencies === true;
  if (rec.hedged === true) out.push(label(many ? "hedged-many" : "hedged", indexCurrency && !isIls(indexCurrency) ? indexCurrency : undefined));
  else if (indexCurrency && !isIls(indexCurrency)) out.push(label(many ? "currency-many" : "currency", indexCurrency));
  else if (!index.exposure && !index.israeli) out.push(label("currency", rec.currency));
  // tax: an Israeli fund on a foreign index is taxed on the currency move too (TXS-09); an Irish fund pays tax inside on dividends (TXF-16)
  if (rec.domicile === "IL" && !index.israeli && rec.hedged !== true) out.push(label("tax-currency"));
  if (rec.domicile === "IE") out.push(label("tax-fund-dividend"));
  if (rec.distribution_policy === "distributing") out.push(label("tax-distribution"));
  else if (rec.distribution_policy === "accumulating" && rec.domicile !== "IL") out.push(label("tax-on-sale-open"));
  if (rec.domicile === "US") out.push(label("ask-estate"), label("ask-w8"));
  void option;
  return out;
}

/** What a broker adds for an option: not available there, or a foreign broker outside the Securities Authority's supervision. */
export function brokerLabels(p: ProviderInfo, unavailable: boolean): Label[] {
  const out: Label[] = [];
  if (unavailable) out.push(label("unavailable"));
  if (p.foreign) out.push(label("risk-unsupervised"));
  return out;
}

/** Every label the page can show, by family, for "מה אומרות התוויות?" (the ids that appear in `used` first). */
export function allLabels(): Label[] {
  return (Object.keys(labelDefs) as LabelId[]).map((id) => label(id));
}
