// Which rules a figure under data/ may name in its rule_ids (docs/data-schema.md §1): the rules that set, cap or define the value in its
// current state, or that are the tax or the fee it is; never background, never the record's topic. A figure's sheet opens each id it
// names as a chip, so an id that sets nothing about the figure sends the reader to a card that does not explain it.
//
// FIGURE_RULES is the table: for a collection and a path inside its records, each id a value there may name, the state it is allowed in
// (`when`; absent, always) and why. An id a row lists with a `when` that is false is one the row knows and disallows in that state (a
// row lists the ids it drops with `never`): packages/pipeline/scripts/apply-figure-rules.ts removes it. An id no row lists is unknown: it
// is kept and listed, and goes to a finance reviewer before a row admits it. Besides the rows, one standing allow holds for every id a
// row does not list: an id whose card under data/rules/ lists, among its sources, the document the value's own source is (its address
// without the part after "#", percent-encoding decoded; the machine address a collector read it from counts as the value's source too),
// since that card holds the source the figure's sheet names. A row that lists the id decides it: a tax
// bucket's source is the Income Tax Ordinance, which many tax cards cite, and its row still says which of them set the bucket. A row can
// close itself to the standing allow (`closed`): then an id it does not list is unknown even when its card cites the value's source.
// Every deposit row is closed: a deposit's values cite a bank's table or the Ordinance, which cards about other products cite too, so
// citing the same document says nothing about whether the card sets the value.
//
// Only the record the site reads (the latest snapshot of each record) is judged; the older dated snapshots stay as they were. The table
// judges the values (an object with a value and a source) and any other object a row names (a deposit's break); a wrapper's eligibility,
// protection and tax steps carry rule_ids too, but they open no figure's sheet, so no row and no check covers them. A row can also leave
// a value outside the table (`outside`), where another check owns its ids.
//
// In data/instruments an id a row removes from a value moves to the record's context_rule_ids (scripts/apply-figure-rules.ts): it still
// governs the product, and the dimension check counts it there, so every mark it carried stays.

import { isValueObject, objectsIn, ruleCards, type CheckData } from "./checks/lib/kit.ts";

/** The collections the table covers. */
export type FigureCollection = "terms/deposits" | "fees" | "funds" | "instruments" | "averages";

/** A record or a value as the table reads it: a JSON object. */
type Json = Readonly<Record<string, unknown>>;

/** Where a value stands, as a row's `when` reads it beside the record and the value: its pointer, and the rule cards. */
interface FigurePlace {
  pointer: string;
  cards: Cards;
}

/** One id a row admits: in the state `when` holds of the record and the value (always, when absent), for the reason `why`. */
interface FigureAllow {
  id: string;
  when?: (record: Json, value: Json, at: FigurePlace) => boolean;
  why: string;
}

/** One row of the table: the ids a value at `path` of a `collection` record may name. */
export interface FigureRow {
  collection: FigureCollection;
  /** The value's place in the record, its keys joined by "." and any array index written "[]" ("balance_conditions[].value"). A row covers the values under its path too ("amount_range" covers "amount_range.min"). */
  path: string;
  allow: readonly FigureAllow[];
  /** True when the standing allow does not hold here: an id the row does not list is unknown, whatever its card cites. */
  closed?: boolean;
  /** Set when the table does not judge the values at this path, with why: another check owns the ids they name. */
  outside?: string;
}

/** An id the row knows and never admits, with why it does not belong on that value. */
const never = (id: string, why: string): FigureAllow => ({ id, when: () => false, why });

const field = (record: Json, key: string): unknown => record[key];
/** A current account (BANK-09 is its rule), not a deposit or a savings plan. */
const currentAccount = (r: Json) => field(r, "wrapper_id") === "current-account";
const variableRate = (r: Json) => field(r, "rate_type") === "variable";
/** The record's tax bucket (`tax_bucket.value`): "unlinked_15", "linked_25" or null while open. */
const bucket = (r: Json): unknown => {
  const t = field(r, "tax_bucket");
  return t && typeof t === "object" ? (t as Json).value : undefined;
};
const bankIs = (...banks: string[]) => (r: Json) => banks.includes(String(field(r, "bank")));
const savingsPlan = (r: Json) => field(r, "wrapper_id") === "savings-plan";

/** Directive 447 Annex A's eight standard shekel deposit types, by period (BANK-14). */
const ANNEX_A_TYPES = new Set(["פיקדון יומי", "פיקדון שבועי", "פיקדון חודשי", "פיקדון ל-3 חודשים", "פיקדון ל-6 חודשים", "פיקדון לשנה", "פיקדון לשנתיים", "פיקדון ל-3 שנים"]);
/** A row of the type column printed as its period alone ("12 חודשים", as Mizrahi-Tefahot prints it), by the Annex A type of that period. */
const ANNEX_A_PERIODS: Readonly<Record<string, string>> = {
  "1 יום": "פיקדון יומי",
  "1 שבוע": "פיקדון שבועי",
  "1 חודש": "פיקדון חודשי",
  "3 חודשים": "פיקדון ל-3 חודשים",
  "6 חודשים": "פיקדון ל-6 חודשים",
  "12 חודשים": "פיקדון לשנה",
  שנתיים: "פיקדון לשנתיים",
  "3 שנים": "פיקדון ל-3 שנים",
};
/**
 * The record's type (`type_447`) as one of Annex A's eight, read through the ways the banks print the type column: "פקדון" for
 * "פיקדון", "ל 3" for "ל-3", "לחודש" for "חודשי", the days after it in brackets ("פיקדון לשנה (365 יום)"), or the period alone. Null for
 * any other type: a bank's product name ("פקצ״מ לשנה", "חסכון אודם לשנה"), a savings plan, a longer deposit.
 */
export function annexAType(type447: unknown): string | null {
  if (typeof type447 !== "string") return null;
  const t = type447
    .trim()
    .replace(/^פקדון/, "פיקדון")
    .replace(/\s*\(\d+ יום\)$/, "")
    .replace(/ ל (?=\d)/, " ל-")
    .replace(/^פיקדון לחודש$/, "פיקדון חודשי");
  const named = ANNEX_A_PERIODS[t] ?? t;
  return ANNEX_A_TYPES.has(named) ? named : null;
}
const annexA = (r: Json) => annexAType(field(r, "type_447")) !== null;
const ANNEX_A_TERM = "Annex A fixes the period of its eight standard deposit types, and this record is one of them; any other product's term is the bank's own";
/** The ten banks whose terms BANK-34 read for what each calls the prime. */
const PRIME_BANKS = ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem", "one-zero"];


// ---------------------------------------------------------------- fees, funds, instruments, averages

/** The fee line a value of a data/fees record sits in ("/lines/3/rate" is in lines[3]); undefined for a value outside the lines. */
const lineOf = (record: Json, at: FigurePlace): Json | undefined => {
  const m = /^\/lines\/(\d+)(?:\/|$)/.exec(at.pointer);
  const lines = field(record, "lines");
  const line = m && Array.isArray(lines) ? (lines[Number(m[1])] as unknown) : undefined;
  return line && typeof line === "object" ? (line as Json) : undefined;
};
const lineBase = (record: Json, at: FigurePlace): unknown => lineOf(record, at)?.base;
const lineClasses = (record: Json, at: FigurePlace): string[] => {
  const a = lineOf(record, at)?.applies_to;
  return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
};
/** The house is a bank (its provider's class), which the Bank of Israel's fee rules bind. */
const atBank = (record: Json): boolean => ((field(record, "provider") as Json | undefined)?.class ?? null) === "bank";
/** The holdings traded on the Tel Aviv exchange that a bank's buy and sell line in Israel covers (makam has a line of its own). */
const TASE_CLASSES = new Set(["tase_shares_bonds", "etf_units", "mutual_fund_units"]);
/** The holdings that are a fund's units. */
const FUND_UNIT_CLASSES = new Set(["etf_units", "mutual_fund_units", "money_market_units"]);
const baseIs =
  (...bases: string[]) =>
  (record: Json, _value: Json, at: FigurePlace): boolean =>
    bases.includes(String(lineBase(record, at)));
const houseIs = (...ids: string[]) => (record: Json) => ids.includes(String(field(record, "id")));

/** A figure of a rule card under data/rules/, its value when it is a number; undefined when the card has no such figure. */
const cardFigure = (cards: Cards, id: string, name: string): number | undefined => {
  const f = cards.figures.get(id)?.[name];
  const v = f && typeof f === "object" ? (f as Json).value : undefined;
  return typeof v === "number" ? v : undefined;
};
/** The card's figure for a fee line's base: "balance_cap" on a balance line, "deposit_cap" on a deposit line. */
const capFigure: Readonly<Record<string, string>> = { balance: "balance_cap", deposit: "deposit_cap" };
/** The fee equals the cap that card `capCard` gives for the line's base: the cap is then the price, and its card says why. */
const atCap =
  (capCard: string) =>
  (record: Json, value: Json, at: FigurePlace): boolean => {
    const name = capFigure[String(lineBase(record, at))];
    return name !== undefined && typeof value.value === "number" && value.value === cardFigure(at.cards, capCard, name);
  };
/** The fee equals the selected pension funds' fee PEN-23 gives for the line's base: the fee the selection process set. */
const selectedFee: Readonly<Record<string, string>> = { balance: "selected_balance_fee", deposit: "selected_deposit_fee" };
const atSelectedFee = (record: Json, value: Json, at: FigurePlace): boolean => {
  const name = selectedFee[String(lineBase(record, at))];
  return name !== undefined && typeof value.value === "number" && value.value === cardFigure(at.cards, "PEN-23", name);
};
/** The house is one an institution card's scope names: the card holds that house's own term. */
const inCardScope =
  (id: string) =>
  (record: Json, _value: Json, at: FigurePlace): boolean =>
    (at.cards.institutions.get(id) ?? []).includes(String(field(record, "id")));
/** The line is a discount off the list price, with the list price it returns to (`reverts_to`). */
const discounted = (record: Json, _value: Json, at: FigurePlace): boolean => lineOf(record, at)?.reverts_to !== undefined;

const fees = "fees" as const;
const BRK19 = "a direct channel's price below a clerk's is a rule on how two of a bank's prices compare, and the line's own tariff sets the price";
const BRK24 = "how a TASE member reports its fees to the exchange: it sets none of them";
const BRK15 = "the exchange's duty to publish members' fees: it sets none of them";
const FEE_ROWS: FigureRow[] = [
  {
    collection: fees,
    path: "lines[]",
    allow: [
      never("BRK-19", BRK19),
      never("BRK-24", BRK24),
      never("BRK-15", BRK15),
      never("KGL-14", "retired: PF-03 states that a provident fund for investment is under the general cap"),
      never("BRK-18", "retired: SW-33 states the supervised price of moving securities out of a bank"),
      {
        id: "BRK-16",
        when: (r, v, at) => atBank(r) && lineBase(r, at) === "trade" && lineOf(r, at)?.channel === "direct" && lineClasses(r, at).some((c) => TASE_CLASSES.has(c)) && /\/rate$/.test(at.pointer),
        why: "an order given online on a bank's Tel Aviv buy and sell line pays the lower rate the full tariff sets for it: BRK-16 says this line, not the clerk's, is the one an online order pays",
      },
      { id: "BRK-17", when: baseIs("custody"), why: "a bank may charge no custody fee on makam or a money-market fund, which this custody line leaves out" },
      { id: "MF-27", when: (r, v, at) => lineClasses(r, at).some((c) => FUND_UNIT_CLASSES.has(c)), why: "which of a bank's lines a fund's units pay: the Tel Aviv line on a tracking or listed fund, custody on every fund but a money-market one" },
      { id: "BRK-25", when: (r, v, at) => houseIs("ibi")(r) && lineBase(r, at) === "fx", why: "what a non-bank member pays on money held in the account is its own tariff's, which this line of IBI's sets beside its conversion" },
      { id: "SW-33", when: baseIs("transfer_out"), why: "the supervised price a bank charges for moving securities to the same client's account elsewhere" },
      { id: "MF-24", when: baseIs("distribution_handling"), why: "the yearly cap on a distribution fee by the fund's type, which the line's fund type names" },
      { id: "MF-25", when: baseIs("distribution_handling"), why: "the units no distribution fee may be charged on" },
      { id: "MF-26", when: baseIs("distribution_handling"), why: "what a distributor that is not an investment marketer may charge the holder, with a distribution agreement and without one" },
      { id: "PF-02", when: atCap("PF-02"), why: "the fee is the general cap on a provident fund's fee, which a list price at the cap is" },
      { id: "PF-03", when: atCap("PF-02"), why: "a provident fund for investment is under the general cap, which a list price at the cap is" },
      { id: "PF-04", when: atCap("PF-04"), why: "the fee is the cap on a comprehensive pension fund's fee" },
      { id: "PEN-23", when: atSelectedFee, why: "the fee is the one the selection process set for a selected pension fund" },
      { id: "KH-22", when: (r, v, at) => lineClasses(r, at).includes("keren-hishtalmut"), why: "a study fund charges from the balance only, up to its cap, and nothing from deposits" },
      never("PF-06", "on a study fund's line KH-22 states the same cap and the same ban on a deposit fee, with the study fund's own terms"),
      { id: "PF-13", when: discounted, why: "a fee below the cap holds for at least the minimum period PF-13 sets" },
      { id: "KGL-16", when: discounted, why: "a discount below the cap holds for a minimum period and ends early only in the cases it names" },
      { id: "KGL-30", when: (r, v, at) => discounted(r, v, at) && inCardScope("KGL-30")(r, v, at), why: "the house's own bylaws on how long its discount holds and when it may raise the fee" },
    ],
  },
  {
    collection: fees,
    path: "minimums.account_opening",
    allow: [
      { id: "BRK-40", when: houseIs("interactive-israel"), why: "Interactive Israel's own tariff card, whose commission page states no minimum deposit" },
      never("BRK-41", "which American or Irish account Interactive Israel opens and its cover: no minimum to open one"),
      { id: "BRK-42", when: houseIs("interactive-brokers"), why: "Interactive Brokers' direct terms, which state no minimum to open an account" },
    ],
  },
];

const funds = "funds" as const;
/** The promotion a value of a fund record sits in ("/promotions/0/rate" is in promotions[0]). */
const promotionOf = (record: Json, at: FigurePlace): Json | undefined => {
  const m = /^\/promotions\/(\d+)\//.exec(at.pointer);
  const list = field(record, "promotions");
  const p = m && Array.isArray(list) ? (list[Number(m[1])] as unknown) : undefined;
  return p && typeof p === "object" ? (p as Json) : undefined;
};
const ETF13 = "the cost layers an Israeli tracking fund's annual report lists: the report's layout, not this fee";
const FOREIGN_ER = "a foreign fund's expense ratio is its own prospectus's figure, and this rule sets none of it";
const FUND_ROWS: FigureRow[] = [
  {
    collection: funds,
    path: "fees.fixed_management",
    allow: [
      never("ETF-13", ETF13),
      never("MF-17", "a voluntary undertaking on when a fee may rise: it says when the fee changes, not what it is"),
      { id: "MF-16", why: "a fund's management fee is a yearly percent of its assets, inside the price, as its prospectus sets it" },
      ...["TXF-12", "TXF-16", "TXF-27", "TXF-29", "TXF-30", "TXF-31", "ETF-28"].map((id) => never(id, FOREIGN_ER)),
      {
        id: "ETF-27",
        when: (r) => /iShares/.test(String(field(r, "manager"))),
        why: "BlackRock's statements on its own iShares funds listed in Tel Aviv: no variable fee, so the fixed fee is the whole cost it names",
      },
    ],
  },
  {
    collection: funds,
    path: "fees.variable_management",
    allow: [never("ETF-13", ETF13), { id: "ETF-14", why: "the variable fee is derived from the tracking gap, both ways, within a cap" }, { id: "MF-16", why: "the manager's fee as the prospectus sets it" }],
  },
  {
    collection: funds,
    path: "fees.trustee",
    allow: [never("ETF-13", ETF13), { id: "MF-20", why: "the trustee's fee is a term of the fund's agreement, charged like the management fee, with no cap" }],
  },
  {
    collection: funds,
    path: "fees.load",
    allow: [{ id: "MF-21", why: "the load is the manager's add-on to the unit price at purchase, its rate set in the prospectus" }],
  },
  {
    collection: funds,
    path: "promotions[].rate",
    allow: [{ id: "MF-20", when: (r, _v, at) => promotionOf(r, at)?.fee === "trustee", why: "a trustee fee lowered for a period is still the trustee's fee of the fund's agreement" }],
  },
  {
    collection: funds,
    path: "distribution.yield",
    closed: true,
    allow: ["ETF-28", "ETF-30", "TXF-08", "TXF-12", "TXF-28"].map((id) => never(id, "a distribution yield is the fund's own figure for the last year: no rule sets it, and the distribution's tax opens on its own line")),
  },
  {
    collection: funds,
    path: "tax_status.foreign_investment_fund",
    allow: [{ id: "TXS-14", why: "what a foreign investment fund is, by the share of its investments linked to its main currency" }],
  },
  { collection: funds, path: "tracking_record.benchmark", allow: [], outside: "validate.ts checkTrackingRecord holds which card a benchmark names (GROSS_INDEX_RULE)" },
];


const instruments = "instruments" as const;
/** The general cap on a provident fund's fee (PF-02) binds these products: a provident fund for investment, one for annuity, and a child's savings in a provident fund. */
const PF02_PRODUCTS = ["kupat-gemel-lehashkaa", "provident-for-annuity", "child-savings-provident"];
const PENSION = ["pension-comprehensive", "pension-general"];
const IRA = ["ira-hishtalmut", "ira-provident"];
const BANK18 = "BANK-18 is about makam's own trade lines at a bank; BRK-17 states the ban on custody of makam and money-market units, and binds banks only";
const capRows = (base: string, allow: FigureAllow[]): FigureRow => ({ collection: instruments, path: `fee_caps.${base}`, closed: true, allow });
const INSTRUMENT_ROWS: FigureRow[] = [
  capRows("balance", [
    { id: "PF-02", when: houseIs(...PF02_PRODUCTS), why: "the general cap on a provident fund's fee from the balance, whose list of exclusions leaves this product in" },
    { id: "PF-03", when: houseIs("kupat-gemel-lehashkaa"), why: "a provident fund for investment is under the general cap" },
    { id: "PEN-22", when: houseIs("provident-for-annuity"), why: "a provident fund for annuity is under the general cap, which PEN-22 states for it" },
    { id: "PF-04", when: houseIs("pension-comprehensive"), why: "the cap on a comprehensive pension fund's fee from the balance" },
    { id: "PF-05", when: houseIs("pension-general"), why: "the cap on a general pension fund's fee from the balance" },
    {
      id: "PEN-21",
      when: houseIs(...PENSION),
      why: "the lower caps from an annuitant, a disabled member and a member the fund lost touch with, which PF-04's and PF-05's cards do not all state",
    },
    { id: "PEN-10", when: houseIs("pension-general"), why: "the fee on money moved from a comprehensive fund above its ceiling is at most the member's fee there" },
    { id: "CS-18", when: houseIs("child-savings-provident"), why: "who pays the fee until the age it names, and that the general cap holds after it" },
    { id: "PF-06", when: houseIs(...IRA, "keren-hishtalmut"), why: "the cap on a study fund's and a personally managed fund's fee from the balance" },
    { id: "KH-22", when: houseIs("keren-hishtalmut"), why: "a study fund's own cap: on each track apart, by days for money in or out mid-month" },
    {
      id: "IRA-16",
      when: houseIs(...IRA),
      why: "the closed list of what a personally managed fund may charge, under which the portfolio manager is paid out of the management fee",
    },
    never("IRA-17", "the rate each member's agreement sets and the averages members pay, not the cap"),
    { id: "MF-16", when: (_r, v) => v.value === null, why: "no general cap on a fund's management fee, which is the fund's own" },
    never("MF-17", "when a fund's fee may rise, not a cap on it"),
    never("MF-18", "the regulator's averages by fund type, not a cap"),
    never("MF-20", "the trustee's fee has its own entry"),
    never("MF-24", "the cap on the distribution fee a manager pays a distributor, not on the management fee"),
  ]),
  capRows("deposit", [
    { id: "PF-02", when: houseIs(...PF02_PRODUCTS), why: "the general cap on a provident fund's fee from each deposit" },
    { id: "PF-03", when: houseIs("kupat-gemel-lehashkaa"), why: "a provident fund for investment is under the general cap" },
    { id: "PEN-22", when: houseIs("provident-for-annuity"), why: "a provident fund for annuity is under the general cap, which PEN-22 states for it" },
    { id: "PF-04", when: houseIs("pension-comprehensive"), why: "the cap on a comprehensive pension fund's fee from each deposit" },
    { id: "PF-05", when: houseIs("pension-general"), why: "the cap on a general pension fund's fee from each deposit" },
    { id: "PEN-10", when: houseIs("pension-general"), why: "the fee on money moved from a comprehensive fund above its ceiling is at most the member's fee there" },
    { id: "CS-18", when: houseIs("child-savings-provident"), why: "who pays the fee until the age it names, and that the general cap holds after it" },
    { id: "KH-22", when: houseIs("keren-hishtalmut"), why: "a study fund may charge nothing from deposits" },
    { id: "PF-06", when: houseIs(...IRA), why: "a personally managed fund may charge from the balance only, so nothing from deposits" },
  ]),
  capRows("custody", [
    { id: "BRK-17", why: "a bank may charge no custody fee on makam or a money-market fund; the ban binds banks only" },
    never("BANK-18", BANK18),
    { id: "BRK-16", when: (_r, v) => v.value === null, why: "a bank's full tariff sets the fee types and each bank its prices: no cap" },
    { id: "BRK-24", when: (_r, v) => v.value === null, why: "no rule makes a non-bank member's published fee a cap" },
    { id: "MF-26", when: houseIs("money-market-fund-daily", "money-market-fund-renewable", "brokerage-account"), why: "a distributor that is not an investment marketer may charge nothing for holding money-market units under a distribution agreement" },
    never("MF-27", "the same ban as BRK-17, summed up for fund units"),
    { id: "BRK-52", why: "no rule limits a non-bank member's custody fee on makam, or an investment marketer's on money-market units: whom the ban BRK-17 states does not bind" },
    { id: "IRA-16", when: houseIs(...IRA), why: "a personally managed fund pays the custodian's fees at most as the same company's other funds do" },
  ]),
  capRows("trade", [
    { id: "BRK-16", when: (_r, v) => v.value === null, why: "a bank's full tariff sets the fee types and each bank its prices: no cap" },
    { id: "BRK-24", when: (_r, v) => v.value === null, why: "no rule makes a non-bank member's published fee a cap" },
    never("BRK-15", BRK15),
    never("BRK-19", BRK19),
    never("BRK-21", "how early a bank tells of a change in its fees, not a cap"),
    never("BRK-33", "the exchange's averages of what members charged, not a cap"),
    { id: "MF-26", when: houseIs("money-market-fund-daily", "money-market-fund-renewable"), why: "under a distribution agreement a distributor that is not an investment marketer may charge the holder nothing to buy or redeem money-market units" },
    { id: "MF-71", when: houseIs("money-market-fund-daily", "money-market-fund-renewable"), why: "a bank may charge no buy, sell or redemption fee on money-market units" },
    { id: "BRK-72", when: houseIs("money-market-fund-daily", "money-market-fund-renewable"), why: "a bank's Tel Aviv buy and sell line leaves out a fund that is not a tracking or listed fund" },
    { id: "BRK-52", when: houseIs("money-market-fund-daily", "money-market-fund-renewable"), why: "no rule limits what a non-bank member that is an investment marketer charges to buy, sell or redeem money-market units: whom MF-71's zero does not bind" },
    never("MF-27", "BRK-72 and MF-71 state which of a bank's lines a money-market fund's units pay"),
    never("BANK-18", "BANK-18 is about makam's trade lines; the money-market units' zero is MF-26's and MF-71's"),
    never("IRA-16", "the closed list names trade commissions among the charges allowed, and IRA-18 states that there is no cap"),
    { id: "IRA-18", when: houseIs(...IRA), why: "brokers chosen in a competitive process, with no cap in percent since the amendment" },
  ]),
  capRows("fx", [
    { id: "BRK-16", when: (_r, v) => v.value === null, why: "a bank's full tariff sets the fee types and each bank its prices: no cap" },
    { id: "BRK-24", when: (_r, v) => v.value === null, why: "no rule makes a non-bank member's published fee a cap" },
  ]),
  capRows("fixed_period", [
    { id: "BRK-16", when: (_r, v) => v.value === null, why: "a bank's full tariff sets the fee types and each bank its prices: no cap" },
    { id: "BRK-24", when: (_r, v) => v.value === null, why: "no rule makes a non-bank member's published fee a cap" },
  ]),
  capRows("distribution_handling", [{ id: "BRK-24", when: (_r, v) => v.value === null, why: "no rule makes a non-bank member's published fee a cap" }]),
  capRows("transfer_out", [
    { id: "SW-33", why: "the most a bank charges for moving securities out when the account closes" },
    { id: "SW-34", why: "no rule found limits what a non-bank member charges for it: whom the cap does not bind" },
  ]),
  capRows("trustee", [{ id: "MF-20", when: (_r, v) => v.value === null, why: "the trustee's fee is a term of the fund's agreement, with no cap found" }]),
  capRows("load", [{ id: "MF-21", when: (_r, v) => v.value === null, why: "the load's cap is the fund agreement's own" }]),
  capRows("redemption_deduction", [{ id: "MF-22", when: (_r, v) => v.value === null, why: "the deduction's cap is the fund agreement's own" }]),
  {
    collection: instruments,
    path: "ceiling.amount",
    closed: true,
    allow: [
      { id: "KGL-03", why: "the yearly ceiling in force, the law's amount linked to the index" },
      { id: "KGL-02", why: "the law's base amount, how it is linked to the index and that the ceiling counts across all of a person's accounts, which the ceiling in force rests on" },
      { id: "IRA-08", why: "the ceiling on the money in a personally managed fund, which its card states" },
      { id: "IRA-07", why: "which money enters, and over which accounts the ceiling counts" },
      never("IRA-27", "a draft that binds no one: the ceiling in force is IRA-08's"),
      { id: "PEN-08", why: "the monthly ceiling on deposits to a comprehensive pension fund" },
      never("PEN-04", "the wage the duty to deposit is on: the ceiling is PEN-08's"),
      never("PEN-10", "PEN-08 states the ceiling and that deposits above it move to the general fund"),
    ],
  },
  {
    collection: instruments,
    path: "lawful_exit.payout_business_days",
    closed: true,
    allow: [
      { id: "KH-16", why: "the business days a provident fund has to pay a withdrawal" },
      { id: "PF-47", why: "the business days any provident fund, a pension fund among them, has to pay a withdrawal" },
      never("KGL-08", "that a provident fund for investment pays out at any time, not in how many days"),
    ],
  },
  {
    collection: instruments,
    path: "lawful_exit.years",
    closed: true,
    allow: [
      { id: "TXH-09", why: "the years after which a study fund's money comes out tax free" },
      { id: "KH-10", why: "the grounds of a withdrawal: after the years it names, earlier with tax" },
      { id: "KH-11", why: "the first payment date the years count from" },
      never("IRA-25", "a personally managed fund follows its product's rules, which TXH-09 and KH-10 state"),
    ],
  },
  {
    collection: instruments,
    path: "lawful_exit.age",
    closed: true,
    allow: [
      { id: "CS-14", why: "the child's age from which the savings may be withdrawn" },
      { id: "CS-15", why: "the one withdrawal before that age, for the child's medical needs" },
      never("CS-13", "the grants by the child's age, not when the money comes out"),
      never("CS-16", "what happens to money not withdrawn, after the age"),
      { id: "PEN-26", why: "the early retirement age, the youngest an old-age pension starts" },
      { id: "PEN-27", why: "when an old-age pension starts, and that a member on a disability pension cannot start one" },
      { id: "PEN-30", why: "the cases a lump sum comes out before that age" },
      { id: "PEN-34", why: "money in a provident fund for annuity comes out other than as an annuity only from the age it names" },
      never("IRA-25", "a personally managed fund follows its product's rules, which PEN-26 and PEN-34 state"),
    ],
  },
  {
    collection: instruments,
    path: "switch_is_tax_event",
    allow: [never("KH-18", "its card states how a study fund's money moves between tracks, not whether moving it is taxed")],
  },
];

const AVERAGE_ROWS: FigureRow[] = ["averages", "list"].map((path) => ({
  collection: "averages",
  path,
  closed: true,
  allow: [
    { id: "BRK-33", why: "the exchange's calculator, which publishes each member's averages and tariff fees as the members report them" },
    never("BRK-15", BRK15),
  ],
}));

const deposits = "terms/deposits" as const;

export const FIGURE_RULES: readonly FigureRow[] = [
  {
    collection: deposits,
    path: "term_months",
    closed: true,
    allow: [
      never("BANK-09", "a current account has no term, and BANK-09 sets none"),
      { id: "BANK-14", when: annexA, why: ANNEX_A_TERM },
      never("BANK-27", "BANK-27 is about exit points and amount ranges, not the term"),
      never("BANK-28", "BANK-28 is what a savings plan's agreement says about breaking it: the break line opens it"),
    ],
  },
  {
    collection: deposits,
    path: "term_days",
    closed: true,
    allow: [
      { id: "BANK-14", when: annexA, why: ANNEX_A_TERM },
      { id: "BANK-50", when: (_r, v) => typeof v.value === "number", why: "F-21 counts a term under a year by these days, by the formula BANK-50 holds" },
    ],
  },
  {
    collection: deposits,
    path: "amount_range",
    closed: true,
    allow: [
      { id: "BANK-27", why: "each bank sets the amounts a product takes, and the table prints each range on a row of its own" },
      { id: "BANK-09", when: currentAccount, why: "the minimum and maximum balance a current account's interest is paid on, which BANK-09 says the bank must show" },
      {
        id: "BANK-28",
        when: savingsPlan,
        why: "the limits on how much each deposit of a savings plan may be, which the plan's agreement must state (disclosure rules s.7(ב)(4))",
      },
    ],
  },
  {
    collection: deposits,
    path: "rate_offered",
    closed: true,
    allow: [
      { id: "BANK-13", why: "the offered rate is the minimum the bank commits to in its consolidated publication, a yearly nominal rate before tax" },
      { id: "BANK-25", when: variableRate, why: "a variable rate is its anchor with a spread known in advance, as the table must print it" },
      { id: "BANK-09", when: currentAccount, why: "the interest on a current account's credit balance, which BANK-09 says the bank must show" },
      never("BANK-34", "what the prime is: the spread rests on it, and the spread names it"),
      never("BANK-28", "BANK-28 is what a savings plan's agreement says about breaking it: the break line opens it"),
    ],
  },
  {
    collection: deposits,
    path: "rate_effective",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the printed rate is nominal, and BANK-50 holds how it becomes the rate over the deposit's period" },
      { id: "BANK-04", why: "the disclosure rules make the bank state the adjusted yearly rate of an unlinked shekel deposit, compounded" },
    ],
  },
  {
    collection: deposits,
    path: "interest_calc.effective_annual",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the printed rate is nominal, and BANK-50 holds how it becomes the rate over the deposit's period" },
      { id: "BANK-04", why: "the disclosure rules make the bank state the adjusted yearly rate of an unlinked shekel deposit, compounded" },
    ],
  },
  {
    collection: deposits,
    path: "interest_calc.effective_decimals",
    closed: true,
    allow: [{ id: "BANK-50", why: "the precision F-21 reads the times a year from, in the formula BANK-50 holds" }],
  },
  {
    collection: deposits,
    path: "interest_calc.periods_per_year",
    closed: true,
    allow: [
      { id: "BANK-50", why: "the times a year interest is calculated, which BANK-50's formula leaves to each product" },
      { id: "BANK-09", when: currentAccount, why: "the dates a current account's interest is credited, which BANK-09 says the bank must show" },
    ],
  },
  {
    collection: deposits,
    path: "balance_conditions[].value",
    closed: true,
    allow: [{ id: "BANK-09", why: "the balance a current account's interest is paid on, which BANK-09 says the bank must show" }],
  },
  {
    collection: deposits,
    path: "spread",
    closed: true,
    allow: [
      { id: "BANK-25", why: "a variable rate's spread over its anchor, known in advance, as the table must print it" },
      {
        id: "BANK-34",
        when: (r) => field(r, "anchor") === "prime" && bankIs(...PRIME_BANKS)(r),
        why: "the spread is over the prime, and BANK-34 says what each of the ten banks it read calls the prime",
      },
    ],
  },
  {
    collection: deposits,
    path: "tax_bucket",
    closed: true,
    allow: [
      { id: "TXI-03", when: (r) => bucket(r) === "unlinked_15", why: "the fixed rate on the whole nominal interest of an asset not fully linked to the index" },
      {
        id: "TXI-04",
        when: (r) => bucket(r) === "unlinked_15" && (variableRate(r) || field(r, "linkage") !== "none"),
        why: "what counts as linked: a prime-linked or partly linked deposit counts as unlinked",
      },
      { id: "TXI-04", when: (r) => bucket(r) === "linked_25", why: "what counts as fully linked, which the linked bucket needs" },
      { id: "TXI-02", when: (r) => bucket(r) === "linked_25", why: "the ceiling on the tax on interest, which a fully linked deposit's real interest bears" },
      { id: "TXI-05", when: (r) => bucket(r) === "linked_25", why: "the linkage of a fully linked asset is exempt, and the interest above it is taxed" },
      { id: "TXI-08", when: currentAccount, why: "the bank withholds the tax on interest it pays an individual, a current account's credit interest included" },
      never("BPN-09", "BPN-09 says what a best-of deposit's alternatives are, not how it is taxed: the record's topic, while its tax is an open question"),
      never("TXI-19", "a lower bracket from the qualifying age: no figure of the deposit, and the tax's own rules name it"),
      never("BANK-09", "BANK-09 is what a bank must show about a current account's interest, not its tax"),
    ],
  },
  {
    collection: deposits,
    path: "break",
    closed: true,
    allow: [
      { id: "BANK-06", why: "breaking a deposit: the bank's consent, the form and what it costs" },
      { id: "BANK-14", why: "the annex makes the table show whether each accepted type can be broken" },
      { id: "BANK-28", why: "what a savings plan's agreement and disclosure must say about breaking it, and that no rule sets the price" },
      { id: "BANK-09", when: currentAccount, why: "a current account is not broken: its money is there at any time" },
      {
        id: "BANK-33",
        when: (r) => bankIs("discount")(r) || (bankIs("mercantile")(r) && !currentAccount(r)),
        why: "Discount's and Mercantile's own break penalty on their deposits and standing-order plans",
      },
      { id: "BANK-49", when: bankIs("one-zero"), why: "One Zero's own break terms" },
      { id: "BANK-55", when: bankIs("yahav"), why: "Yahav's own break terms" },
      { id: "BANK-56", when: (r) => bankIs("jerusalem")(r) && !currentAccount(r), why: "Bank of Jerusalem's own break terms on its deposits and savings plans" },
      { id: "BPN-10", when: (r) => bankIs("hapoalim")(r) && savingsPlan(r), why: "Hapoalim's savings plans' own withdrawal and break terms" },
    ],
  },
  ...FEE_ROWS,
  ...FUND_ROWS,
  ...INSTRUMENT_ROWS,
  ...AVERAGE_ROWS,
];

/** The keys a JSON pointer ("/balance_conditions/0/value") walks, unescaped ("~1" is "/", "~0" is "~"). */
export const pointerKeys = (pointer: string): string[] =>
  pointer
    .split("/")
    .slice(1)
    .map((k) => k.replace(/~1/g, "/").replace(/~0/g, "~"));

/** A JSON pointer ("/balance_conditions/0/value") as the table's path ("balance_conditions[].value"). */
export function pathOf(pointer: string): string {
  return pointerKeys(pointer).reduce((path, k) => (/^\d+$/.test(k) ? `${path}[]` : path ? `${path}.${k}` : k), "");
}

/** The row for a value at `pointer` of a `collection` record: the one with the longest path that is the value's path or holds it; null for none. */
export function rowFor(collection: FigureCollection, pointer: string): FigureRow | null {
  const path = pathOf(pointer);
  let best: FigureRow | null = null;
  for (const row of FIGURE_RULES)
    if (row.collection === collection && (path === row.path || path.startsWith(`${row.path}.`) || path.startsWith(`${row.path}[]`)) && (!best || row.path.length > best.path.length)) best = row;
  return best;
}

/** A document's address as text: without the part after "#" (two links to one document at two places are one source) and with its percent-encoding decoded (one address written in Hebrew letters and as "%D7..." is one source). An address that is not valid encoding stays as written. */
const documentOf = (url: string): string => {
  const whole = url.replace(/#.*$/, "");
  try {
    return decodeURIComponent(whole);
  } catch {
    return whole;
  }
};

/** By rule id, the addresses of the sources its card under data/rules/ lists. */
export type CardSources = ReadonlyMap<string, readonly string[]>;

/** What the table reads of the rule cards under data/rules/, by rule id: the sources each lists, its figures and the institutions its scope names. */
export interface Cards {
  sources: CardSources;
  figures: ReadonlyMap<string, Readonly<Record<string, unknown>>>;
  institutions: ReadonlyMap<string, readonly string[]>;
}

/** Cards with only their sources known, as a test of the standing allow writes them. */
export const cardsWithSources = (sources: CardSources): Cards => ({ sources, figures: new Map(), institutions: new Map() });

/** What the table reads of each rule card under the data folder. */
export function readCards(data: CheckData): Cards {
  const sources = new Map<string, string[]>();
  const figures = new Map<string, Record<string, unknown>>();
  const institutions = new Map<string, string[]>();
  for (const c of ruleCards(data).values()) {
    const card = c as { sources?: unknown; scope_institutions?: unknown };
    sources.set(c.id, Array.isArray(card.sources) ? card.sources.flatMap((s) => (s && typeof (s as { url?: unknown }).url === "string" ? [(s as { url: string }).url] : [])) : []);
    if (c.figures) figures.set(c.id, c.figures);
    if (Array.isArray(card.scope_institutions)) institutions.set(c.id, card.scope_institutions.flatMap((i) => (i && typeof (i as { id?: unknown }).id === "string" ? [(i as { id: string }).id] : [])));
  }
  return { sources, figures, institutions };
}

/** What the table says of one id on one value: admitted, known and disallowed in this state, or unknown to the row. */
export type IdVerdict = "allowed" | "disallowed" | "unknown";

/** The verdict on `id` named by `value` at `pointer` of `record`. */
export function judgeId(collection: FigureCollection, record: Json, pointer: string, value: Json, id: string, cards: Cards): IdVerdict {
  const row = rowFor(collection, pointer);
  const allow = row?.allow.filter((a) => a.id === id) ?? [];
  if (allow.length > 0) return allow.some((a) => !a.when || a.when(record, value, { pointer, cards })) ? "allowed" : "disallowed";
  if (row?.closed) return "unknown";
  // the document the value's source is: the page a reader opens (`url`) or the machine address a collector read (`fetched_from`)
  const source = value.source as Json | undefined;
  const documents = [source?.url, source?.fetched_from].flatMap((u) => (typeof u === "string" ? [documentOf(u)] : []));
  return (cards.sources.get(id) ?? []).some((u) => documents.includes(documentOf(u))) ? "allowed" : "unknown";
}

/**
 * Each object inside `record` whose rule_ids the table judges, with its JSON pointer from `record`, in document order: a value object,
 * or another object a row covers (a deposit's break). A value at a path a row leaves `outside` is not judged.
 */
export function ruleHolders(collection: FigureCollection, record: unknown): { pointer: string; value: Json; ids: string[] }[] {
  return objectsIn(record).flatMap(({ pointer, node: o }) => {
    if (!Array.isArray(o.rule_ids)) return [];
    const row = rowFor(collection, pointer);
    if (row?.outside || (!row && !isValueObject(o))) return [];
    return [{ pointer, value: o, ids: o.rule_ids.filter((x): x is string => typeof x === "string") }];
  });
}

/** One id a value names that the table does not admit: disallowed in the value's state, or unknown to its row. */
export interface FigureRuleProblem {
  pointer: string;
  id: string;
  verdict: Exclude<IdVerdict, "allowed">;
}

/** Every id the record's values name that the table does not admit, in document order. Run it on the snapshot the site reads. */
export function figureRuleProblems(collection: FigureCollection, record: unknown, cards: Cards): FigureRuleProblem[] {
  if (!record || typeof record !== "object") return [];
  return ruleHolders(collection, record).flatMap(({ pointer, value, ids }) =>
    ids.flatMap((id) => {
      const verdict = judgeId(collection, record as Json, pointer, value, id, cards);
      return verdict === "allowed" ? [] : [{ pointer, id, verdict }];
    }),
  );
}

/** One value's ids split by the table: those kept, in the order the value names them, and those the table disallows in its state. */
export function trimIds(collection: FigureCollection, record: Json, pointer: string, value: Json, ids: readonly string[], cards: Cards): { kept: string[]; dropped: string[] } {
  const dropped = ids.filter((id) => judgeId(collection, record, pointer, value, id, cards) === "disallowed");
  return { kept: ids.filter((id) => !dropped.includes(id)), dropped };
}
