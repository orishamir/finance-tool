// The rule table (method §10.6): where a rule or a product's records narrow what its fee is offered, one row per reason, every row citing
// the rule ids (data/rules) or the line ids (data/fees) it stands on, or the records of the products it is about where nothing in them
// provides what it takes away (`records`). A row never invents a rule: a narrowing with nothing to cite is not a row. Where a rule leaves
// a question open, no row narrows it and the fee keeps what its kind can hold. The offer (offer.ts) reads the rows; capacity (capacity.ts)
// never does, so a deal that holds more still opens. Pure; no Hebrew.
import type { ProductId } from "@finance-tool/schema";
import type { DealKind } from "../kinds";
import type { ProviderKind } from "../model";
import { holdsFunds, type FeeKindId, type FormId } from "../shapes";
import type { ByKind } from "./conditions";
import type { RulePart } from "./parts";

/** The facts of a product the rows read: its record's id, the fee bases it allows, and its regulator (data-schema §3.3). */
export type ProductFacts = Pick<DealKind, "id" | "bases" | "regulator">;

/** Which products' fees a row is about: the products whose facts it holds of, and the fees among theirs; either left out is every one. */
export interface Selector {
  products?: (f: ProductFacts) => boolean;
  fees?: readonly FeeKindId[];
}

/**
 * What a row does to the offer: `only` keeps the forms, parts and things to change by it names (of each list it names) and drops the
 * rest; `deny` drops those it names; `ban` takes nothing from the offer, and says the fee is banned by law where the deal's provider is
 * of the kind it names and, where it names values, the deal is read for one of them as what is bought or held (F-114's pick): the fee is
 * then read as nothing charged, and the reading says why: as the site's reading where the rules ban it only read together (`reading`), and
 * with the distribution fee a bank may still charge on the units where the rules allow one (`distribution`, MF-71).
 */
export type Verdict =
  | { kind: "only"; forms?: readonly FormId[]; parts?: readonly RulePart[]; conditions?: readonly ByKind[] }
  | { kind: "deny"; forms?: readonly FormId[]; parts?: readonly RulePart[]; conditions?: readonly ByKind[] }
  | { kind: "ban"; provider: ProviderKind; values?: readonly string[]; reading?: true; distribution?: true };

export interface RuleRow {
  id: string;
  when: Selector;
  verdict: Verdict;
  /** The rule ids or line ids the row stands on. */
  cite: readonly string[];
  /**
   * The row also stands on the records of the products it is about: their fee bases (`fee_bases_allowed`) and the lines collected for
   * them provide nothing it takes away. The offer's reasons name each product's record.
   */
  records?: true;
}

/** Whether a product is of the provident family: its record names the Capital Market Authority as its regulator (PF-01). */
export const providentFamily = (f: ProductFacts): boolean => f.regulator === "CMA";
/** Whether a provident-family product is a self-directed fund (IRA), which holds securities the member chooses. */
export const selfDirected = (f: ProductFacts): boolean => providentFamily(f) && holdsFunds(f.id);
/** Whether a product is one of these records. */
const is =
  (...ids: ProductId[]) =>
  (f: ProductFacts): boolean =>
    ids.includes(f.id);

const BANK_SAVINGS = is("bank-deposit", "savings-plan", "child-savings-bank");
const MONEY_MARKET = is("money-market-fund-daily", "money-market-fund-renewable");
/** A fee the page does not offer: no form, part or thing is kept, so it is not offered as a fee to add (offer.ts, `feeOffered`). */
const NONE: Verdict = { kind: "only", forms: [], parts: [], conditions: [] };
const CURRENT_ACCOUNT: Verdict = { kind: "only", forms: ["sum"], parts: ["until", "refund"], conditions: ["track", "channel", "count", "own"] };

export const RULES: readonly RuleRow[] = [
  // ---- fees no form the page has can price, or the law does not allow
  // breaking a deposit or a savings plan costs interest forfeited or a value discounted at the bank's rate, never a share or a sum
  { id: "bank-savings-break", when: { products: BANK_SAVINGS, fees: ["exit"] }, verdict: NONE, cite: ["BANK-06", "BANK-16", "BANK-28", "BANK-48", "CS-10", "CS-28"] },
  // a bank charges only what its tariff lists, and the tariff has no part for deposits or savings plans
  { id: "bank-savings-tariff", when: { products: BANK_SAVINGS, fees: ["own"] }, verdict: NONE, cite: ["BANK-06", "BANK-16"] },
  // only management fees, direct expenses and insurance premiums come out of a provident account: no fee of another kind
  { id: "provident-closed-list", when: { products: (f) => providentFamily(f) && !holdsFunds(f.id), fees: ["own"] }, verdict: NONE, cite: ["PF-01", "PF-19", "PF-23"] },
  // National Insurance makes every deposit and bears the account's costs until 21
  { id: "child-savings-deposit", when: { products: is("child-savings-provident"), fees: ["deposit"] }, verdict: NONE, cite: ["CS-02", "CS-18"] },
  // the closed list of charges to an IRA has no bank account fee
  { id: "ira-account-fee", when: { products: selfDirected, fees: ["current_account"] }, verdict: NONE, cite: ["IRA-16"] },

  // ---- the provident family's management fees, from deposits and from the balance
  // a rate, discounted only for a period, with nothing on top, no refund and no order; on money deposited before 2008 a fund may charge a
  // monthly sum of up to NIS 6, indexed, where higher (PEN-22), a floor the page does not offer, since a balance fee's price holds no minimum
  {
    id: "provident-management-rate",
    when: { products: providentFamily, fees: ["deposit", "balance"] },
    verdict: { kind: "only", forms: ["action", "held"], parts: ["until"] },
    cite: ["PF-01", "PF-02", "PF-03", "PF-04", "PF-05", "PF-06", "KGL-14", "PEN-21", "PEN-22", "CS-18", "KH-22", "IRA-17", "PF-08", "PF-13", "PF-21"],
    records: true,
  },
  // set per track and graded by the balance; the size of a deposit and an arrangement of the person's own are open (PF open question 19)
  {
    id: "provident-management-by",
    when: { products: providentFamily, fees: ["deposit", "balance"] },
    verdict: { kind: "only", conditions: ["track", "portfolioSize", "actionSize", "own"] },
    cite: ["PF-07", "PF-14", "KGL-30", "PF-01", "PF-10"],
    records: true,
  },
  // direct expenses come out of the fund's assets, disclosed as a yearly rate per track
  { id: "provident-direct-expenses", when: { products: providentFamily, fees: ["direct_expenses"] }, verdict: { kind: "only", forms: ["held"], parts: [], conditions: ["track"] }, cite: ["PF-10", "PF-11", "PF-12", "KH-22", "IRA-16"], records: true },
  // an IRA is a fund of its own, not a track, with each member's own agreed fee
  { id: "ira-no-track", when: { products: selfDirected, fees: ["balance", "direct_expenses"] }, verdict: { kind: "deny", conditions: ["track"] }, cite: ["IRA-17"], records: true },
  // the premium follows the fund's tables, drawn from deposits; how its share of deposits is counted is open
  { id: "pension-insurance", when: { products: providentFamily, fees: ["insurance_premium"] }, verdict: { kind: "only", forms: ["action"], parts: ["until"], conditions: ["track", "own"] }, cite: ["PEN-15", "PF-01"], records: true },

  // ---- inside an IRA: the annexes' brokerage prices, and charges the closed list does not name (open)
  { id: "ira-trade", when: { products: selfDirected, fees: ["trade"] }, verdict: { kind: "only", forms: ["action", "perUnit", "perAction"], parts: ["third", "min", "unfilled", "partial"], conditions: ["what", "track", "portfolioSize"] }, cite: ["IRA-21"], records: true },
  { id: "ira-custody", when: { products: selfDirected, fees: ["custody"] }, verdict: { kind: "only", forms: ["held"], parts: ["min", "max"], conditions: ["held"] }, cite: ["IRA-21"], records: true },
  { id: "ira-conversion", when: { products: selfDirected, fees: ["fx"] }, verdict: { kind: "only", forms: ["action"], parts: ["flat", "min", "max"], conditions: ["currency"] }, cite: ["IRA-16", "IRA-21"], records: true },
  { id: "ira-spread", when: { products: selfDirected, fees: ["fx_spread"] }, verdict: { kind: "only", forms: ["action"], parts: [], conditions: [] }, cite: ["IRA-16"], records: true },
  { id: "ira-corporate-event", when: { products: selfDirected, fees: ["corporate_event"] }, verdict: { kind: "only", forms: ["perAction"], parts: [], conditions: [] }, cite: ["IRA-16", "IRA-22"], records: true },
  { id: "ira-own", when: { products: selfDirected, fees: ["own"] }, verdict: { kind: "only", parts: [], conditions: [] }, cite: ["IRA-16", "IRA-22"], records: true },

  // ---- a fund's own fees: a yearly share of its assets inside the unit price, the same for every holder
  { id: "fund-management", when: { fees: ["fund_management"] }, verdict: { kind: "only", forms: ["held"], parts: ["until"], conditions: [] }, cite: ["MF-16"], records: true },
  { id: "money-market-management", when: { products: MONEY_MARKET, fees: ["balance"] }, verdict: { kind: "only", forms: ["held"], parts: ["until"], conditions: [] }, cite: ["MF-16", "MF-17"], records: true },
  { id: "money-market-trustee", when: { products: MONEY_MARKET, fees: ["trustee"] }, verdict: { kind: "only", forms: ["held"], parts: [], conditions: [] }, cite: ["MF-20"], records: true },
  // a load on purchase, a deduction on redemption: shares of the unit price, units created and redeemed at one price a day
  { id: "money-market-load", when: { products: MONEY_MARKET, fees: ["load"] }, verdict: { kind: "only", forms: ["action"], parts: ["discount", "until"], conditions: ["actionSize", "own"] }, cite: ["MF-21", "MF-10"], records: true },
  { id: "money-market-redemption", when: { products: MONEY_MARKET, fees: ["redemption_deduction"] }, verdict: { kind: "only", forms: ["action"], parts: [], conditions: ["own"] }, cite: ["MF-22", "MF-10"], records: true },
  // a fund order is executed at its day's price; no collected line names money-market units, so at a non-bank a sum per order and a minimum
  // are open (a bank charges none, the bans below)
  { id: "money-market-trade", when: { products: MONEY_MARKET, fees: ["trade"] }, verdict: { kind: "only", forms: ["action", "perAction"], parts: ["min"], conditions: ["own"] }, cite: ["MF-10", "MF-26", "BRK-64", "BRK-65"], records: true },
  { id: "money-market-own", when: { products: MONEY_MARKET, fees: ["own"] }, verdict: { kind: "only", forms: ["held"], parts: [], conditions: ["own"] }, records: true, cite: [] },

  // ---- the securities account and what is bought in it, as the collected price lists print them
  // an offset sits on the account fee that trades reduce, not on the trade
  { id: "trade-offset", when: { fees: ["trade"] }, verdict: { kind: "deny", parts: ["offset"] }, cite: [], records: true },
  // a deal of one security holds one kind of it, and its maximum on each security is its maximum
  { id: "one-security", when: { products: is("government-bond", "makam", "money-market-fund-daily", "money-market-fund-renewable"), fees: ["trade", "custody"] }, verdict: { kind: "deny", parts: ["maxPerSecurity"], conditions: ["what", "held"] }, cite: [], records: true },
  { id: "securities-custody", when: { products: is("brokerage-account", "government-bond"), fees: ["custody"] }, verdict: { kind: "only", forms: ["held"], parts: ["until", "min", "max", "maxPerSecurity"], conditions: ["held", "track", "channel", "portfolioSize", "own"] }, cite: [], records: true },
  // custody on units: a share of what is held with a minimum where a non-bank charges it, which prints no maximum; a bank charges none (the
  // bans below)
  { id: "units-custody", when: { products: is("makam", "money-market-fund-daily", "money-market-fund-renewable"), fees: ["custody"] }, verdict: { kind: "only", forms: ["held"], parts: ["min"], conditions: ["own"] }, cite: ["BRK-17"], records: true },
  { id: "account-fee", when: { products: is("brokerage-account", "makam", "government-bond"), fees: ["fixed_period"] }, verdict: { kind: "only", forms: ["sum"], parts: ["until", "offset"], conditions: ["track", "own"] }, cite: [], records: true },
  { id: "current-account", when: { fees: ["current_account"] }, verdict: CURRENT_ACCOUNT, cite: [], records: true },
  { id: "current-account-fee", when: { products: is("current-account"), fees: ["fixed_period"] }, verdict: CURRENT_ACCOUNT, cite: [], records: true },
  { id: "conversion", when: { products: is("brokerage-account"), fees: ["fx"] }, verdict: { kind: "only", forms: ["action"], parts: ["discount", "flat", "min", "max", "refund"], conditions: ["currency", "track", "channel", "actionSize", "portfolioSize", "own"] }, cite: [], records: true },
  { id: "conversion-spread", when: { products: is("brokerage-account"), fees: ["fx_spread"] }, verdict: { kind: "only", forms: ["action"], parts: [], conditions: ["track", "actionSize"] }, cite: [], records: true },
  { id: "distribution", when: { products: is("brokerage-account"), fees: ["distribution_handling"] }, verdict: { kind: "only", forms: ["action"], parts: [], conditions: ["what", "own"] }, cite: [], records: true },
  { id: "transfer-out", when: { products: is("brokerage-account"), fees: ["transfer_out"] }, verdict: { kind: "only", forms: ["action", "perAction"], parts: ["third", "min", "max"], conditions: ["what", "own"] }, cite: [], records: true },
  { id: "corporate-event", when: { products: is("brokerage-account"), fees: ["corporate_event"] }, verdict: { kind: "only", forms: ["perAction"], parts: [], conditions: ["own"] }, cite: [], records: true },
  { id: "securities-own", when: { products: is("brokerage-account", "makam", "government-bond"), fees: ["own"] }, verdict: { kind: "only", parts: ["third", "min", "max"], conditions: ["what", "count", "own"] }, cite: [], records: true },
  { id: "current-account-own", when: { products: is("current-account"), fees: ["own"] }, verdict: { kind: "only", forms: ["perAction", "sum"], parts: [], conditions: [] }, cite: [], records: true },
  // a Tel Aviv bond or makam trades as a share of the trade on its own line, and Interactive Brokers sells neither to a resident
  { id: "bond-trade", when: { products: is("government-bond"), fees: ["trade"] }, verdict: { kind: "only", forms: ["action"], parts: ["third", "flat", "until", "min", "max", "cap", "unfilled", "partial"], conditions: ["channel", "actionSize", "portfolioSize", "count", "own"] }, cite: ["BRK-64"], records: true },
  { id: "makam-trade", when: { products: is("makam"), fees: ["trade"] }, verdict: { kind: "only", forms: ["action"], parts: ["flat", "min", "max", "cap", "unfilled", "partial", "sale"], conditions: ["channel", "actionSize"] }, cite: ["BANK-18", "BRK-64"], records: true },

  // ---- fees the law bans at a bank; a new bank, for five years from its licence, is outside these rules (BANK-51), which each ban says
  // a bank may not charge custody on makam or on money-market units
  { id: "bank-custody-units", when: { products: is("brokerage-account"), fees: ["custody"] }, verdict: { kind: "ban", provider: "bank", values: ["makam", "moneyMarket"] }, cite: ["BRK-17", "BANK-18", "MF-71", "BANK-51"] },
  { id: "bank-custody-makam", when: { products: is("makam"), fees: ["custody"] }, verdict: { kind: "ban", provider: "bank" }, cite: ["BRK-17", "BANK-18", "BANK-51"] },
  { id: "bank-custody-money-market-deal", when: { products: MONEY_MARKET, fees: ["custody"] }, verdict: { kind: "ban", provider: "bank" }, cite: ["BRK-17", "MF-71", "BANK-51"] },
  // nor buy, sell or redeem money-market units on a line of its tariff, in the site's reading of the fee rules with the distribution fee
  // regulations (MF-71): their only charge there is the distribution fee, up to 0.1% a year where the fund's manager has no agreement with it
  { id: "bank-trade-money-market", when: { products: is("brokerage-account"), fees: ["trade"] }, verdict: { kind: "ban", provider: "bank", values: ["moneyMarket"], reading: true, distribution: true }, cite: ["MF-71", "BRK-16", "BANK-51"] },
  { id: "bank-trade-money-market-deal", when: { products: MONEY_MARKET, fees: ["trade"] }, verdict: { kind: "ban", provider: "bank", reading: true, distribution: true }, cite: ["MF-71", "BRK-16", "BANK-51"] },
];
