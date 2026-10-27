// The shapes the bank and broker pages and the companies list share (flows 15.4, design-spec 20). Plain JSON: the
// loader builds them in lib/institutions.server.ts, the components in this folder show them.
import type { RuleRecord } from "@finance-tool/schema";
import type { SiteValue } from "../../../lib/value";

export type InstitutionKind = "bank" | "broker";

/** One row of the companies list's "בנקים ובתי השקעות" heading. */
export interface InstitutionRow {
  id: string;
  name: string;
  kind: InstitutionKind;
  /** The tariff's published date (null: it carries none), or undefined when no snapshot was obtained. */
  published: string | null;
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
  breakTerms: { penalty: "none" | "with_penalty" | "not_allowed"; text: string; rules: string[] };
  exitPoints: { exists: boolean; everyMonths: number | null };
  autoRenew: { value: boolean; maxRenewals: number | null };
  /** The record's own note on the rate: tiers, conditions (a current account's credit-interest conditions). */
  rateNote: string;
  stale: boolean;
  snapshot: string;
}

export interface ProductGroup {
  wrapperId: string;
  wrapperName: string;
  products: ProductRowData[];
}

export type LineBase = "trade" | "custody" | "fx";

export interface TariffLineRow {
  id: string;
  base: LineBase;
  /** Instrument class words (copy 8.0) the line applies to, in the tariff's order. */
  classes: string[];
  channel: "direct" | "branch" | null;
  rate: SiteValue;
  period: "month" | "quarter" | "year" | null;
  min: SiteValue | null;
  max: SiteValue | null;
}

export interface TariffCardData {
  missing: boolean;
  reason: string | null;
  title: string;
  url: string;
  format: string;
  published: SiteValue | null;
  snapshot: SiteValue;
  stale: boolean;
  lineCount: number;
  bases: string[];
  lines: TariffLineRow[];
  minimum: SiteValue | null;
  regulator: "BoI" | "ISA" | "CMA" | "foreign";
  /** S1 (2026-10-25): a foreign broker's regulator in Hebrew. */
  foreignRegulator?: string;
  tase: boolean;
  protection: { id: string; title: string }[];
  notice: string[];
  providerName: string;
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
