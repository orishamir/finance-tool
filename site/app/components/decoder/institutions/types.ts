// The shapes the bank and broker pages and the companies list share (flows 15.4, design-spec 20). Plain JSON: the
// loader builds them in lib/institutions.server.ts, the components in this folder show them.
import type { TariffDated } from "../../../lib/tariff-date";
import type { LeftOutView } from "../../../lib/left-out";
import type { RuleRecord } from "@finance-tool/schema";
import type { TextFragment } from "../../../lib/sources";
import type { SiteValue } from "../../../lib/value";
import type { DepositVariant } from "../../../lib/deposit-kind";

export type InstitutionKind = "bank" | "broker";

/**
 * The records behind a price list's distribution fee: the caps and who pays it (MF-24), and, at a bank, what a distributor
 * that is not an investment marketer may charge the holder (MF-26; most stock-exchange members that are not banks are marketers).
 */
export const distributionRuleIds = (kind: InstitutionKind): string[] => (kind === "bank" ? ["MF-24", "MF-26"] : ["MF-24"]);

/** One row of the companies list's "בנקים ובתי השקעות" heading. */
export interface InstitutionRow {
  id: string;
  name: string;
  kind: InstitutionKind;
  /** What the price list prints as its date (kit TariffDate); null when no snapshot was obtained. */
  dated: TariffDated | null;
  missing: boolean;
  /** No snapshot at all (a bank known only from its deposit records). */
  noSnapshot: boolean;
}

/** The number or word of one record label, ready to show. `rules` are the chips that go under it. */
export interface ProductRowData {
  id: string;
  /** The name as the 447 page prints it. */
  name: string;
  model: string | null;
  alsoCalled: string[];
  type447: string;
  wrapperId: string;
  currentAccount: boolean;
  term: SiteValue;
  rateType: "fixed" | "variable";
  anchor: string | null;
  spread: SiteValue | null;
  rate: SiteValue;
  asOf: SiteValue;
  /** The page's "נכון ליום" is after the day the record was read. */
  asOfAfterRead: boolean;
  linkage: "none" | "cpi" | "fx";
  linkageValue: SiteValue;
  taxBucket: SiteValue;
  amountMin: SiteValue;
  amountMax: SiteValue | null;
  /** The bank's own printed words about a break (its quoted passages), never the record's English note. */
  breakTerms: { penalty: "none" | "with_penalty" | "not_allowed"; quotes: string[]; rules: string[] };
  exitPoints: { exists: boolean; everyMonths: number | null };
  autoRenew: { value: boolean; maxRenewals: number | null };
  /** The deposit's kinds (`variant`): each a label on its card. */
  variant: DepositVariant[];
  /** The conditions the bank prints, in plain Hebrew (`conditions_he`), or null. */
  conditions: string | null;
  /** An open doubt about the record (`doubt_he`), or null. */
  doubt: string | null;
  /** The bank's table the record was read from: a kind's sheet links to it. */
  table: { url: string; title: string };
  stale: boolean;
  snapshot: string;
}

export interface ProductGroup {
  wrapperId: string;
  wrapperName: string;
  products: ProductRowData[];
}

export type LineBase = "trade" | "custody" | "fx" | "fixed_period";

export interface TariffLineRow {
  id: string;
  base: LineBase;
  /** Instrument class words (copy 8.0) the line applies to, in the tariff's order. */
  classes: string[];
  channel: "direct" | "branch" | null;
  /** The price list's own name for a plan or sub-class (IBKR Pro Fixed or Tiered): what tells two lines of one fee apart; null on the standard line. */
  band: string | null;
  /** A conversion between two foreign currencies, by the price list's words (the ranking reads the shekel line, lib/invest `isFxToFx`). */
  fxToFx: boolean;
  /** A distribution fee ("עמלת הפצה"), by the price list's words: the fund manager pays it (MF-24); grouped and named apart. */
  distribution: boolean;
  rate: SiteValue;
  period: "month" | "quarter" | "year" | null;
  min: SiteValue | null;
  max: SiteValue | null;
  /** Where the rate stands (D57): its document, the page of a PDF, the quoted words of a web page; `tariff` when it is the record's own price list. */
  where: { url: string; title: string; page?: number; fragment?: TextFragment; tariff: boolean } | null;
  /** A flat price for an order or a conversion up to a sum (the record's `flat_up_to`, F-12, F-13), with where it stands; a larger one pays the rate and its bounds. */
  flat: { amount: SiteValue; upTo: SiteValue; where: TariffLineRow["where"] } | null;
  /** A conversion's spread: printed ("עד 0.7%"), or not limited by the documents (D56: never zero); null when the line has none. */
  spread: SiteValue | "not_limited" | null;
}

/** Whether a kind of holding can be bought at the house, from its own documents (S3), with the reason when the documents leave it open. */
export interface AvailabilityRow {
  classes: string[];
  state: "yes" | "no" | "unknown";
  reason: string | null;
  source: { url: string; title: string; page?: number };
  /** The rules the record names for this state (its `rule_ids`): the state's word opens them (D105). */
  rules?: readonly string[];
}

export interface TariffCardData {
  missing: boolean;
  /** Why the price list is missing, in the record's Hebrew (`missing_reason_he`); the English `missing_reason` is the working note and stays in the record. */
  reasonHe: string | null;
  title: string;
  url: string;
  format: string;
  /** What the price list prints as its date (kit TariffDate), and that date as a figure where it prints one (the whole's or the part's). */
  dated: TariffDated;
  published: SiteValue | null;
  snapshot: SiteValue;
  stale: boolean;
  /** Every line of the price list, in its order. */
  lines: TariffLineRow[];
  minimum: SiteValue | null;
  regulator: "BoI" | "ISA" | "CMA" | "foreign";
  /** S1: a foreign broker's regulator in Hebrew. */
  foreignRegulator?: string;
  tase: boolean;
  protection: { id: string; title: string }[];
  notice: string[];
  providerName: string;
  /** Who pays the card's prices (a bank's or broker's record says so). */
  priceFor: string | null;
  availability: AvailabilityRow[];
  /** What the house's documents hold and its prices leave out (D106), or null where the record lists nothing. */
  leftOut?: LeftOutView | null;
}

export interface InstitutionPageData {
  id: string;
  name: string;
  kind: InstitutionKind;
  today: string;
  /** null: no snapshot was obtained. */
  tariff: TariffCardData | null;
  groups: ProductGroup[];
  hasDeposits: boolean;
  /** The latest "נכון ליום" across the deposit records, for the lede. */
  depositsAsOf: SiteValue | null;
  /** The bank's own 447 page, from the rule base. */
  rateTable: { href: string } | null;
  /** Names the catalogue records for this institution (data/catalog/), with where and when seen. */
  catalogue: { id: string; names: string[]; where: string; seen: SiteValue }[];
  rules: Record<string, RuleRecord>;
  /** The records those rules' cards point at that the page does not cite (`pointedRecords`): only chips and cards read them. */
  pointed: Record<string, RuleRecord>;
  /** What the site found in the company's own documents (D30): the records that name it, by topic; `company` is its registry id. */
  terms: { groups: { key: string; title: string; ids: string[] }[]; company: string | null; pageCompanies: string[]; name: string; dimensions: Record<string, string> };
}
