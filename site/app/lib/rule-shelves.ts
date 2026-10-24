// The five shelves of the rules pages (research/knowledge/2026-10-24-synthesis.md §3.4, from the information-architecture
// report of the same night): a shelf is the reader's question ("who takes what, what can I do, who protects"), derived
// from each rule's first dimension with a default per rule-base file and a short list of explicit moves. No field on any
// rule; `shelfOf` is the one source of truth for where a rule lives, used by the rules pages and the search index.
import type { RuleRecord } from "@finance-tool/schema";

export type ShelfId = "state" | "costs" | "access" | "protection" | "structure";

export const shelfIds: readonly ShelfId[] = ["state", "costs", "access", "protection", "structure"] as const;

/** Dimension id → shelf. The eight dimension ids rules use without a record are mapped here too (IA report §5 item 2). */
const byDimension: Record<string, ShelfId> = {
  "tax-at-deposit": "state",
  "tax-during": "state",
  "tax-at-exit": "state",
  "switching-tax-event": "state",
  "loss-offset": "state",
  "real-vs-nominal": "state",
  "reporting-obligation": "state",
  "foreign-withholding-domicile": "state",
  "age-or-use-exemption": "state",
  surtax: "state",
  "estate-situs": "state",
  "fund-tax-track": "state",
  "fee-management-balance": "costs",
  "fee-deposit": "costs",
  "fee-custody": "costs",
  "fee-trade": "costs",
  "fee-fx": "costs",
  "fee-exit": "costs",
  "fee-change-over-time": "costs",
  "fee-account": "costs",
  "fee-direct-expenses": "costs",
  minimum: "costs",
  "liquidity-lockup": "access",
  "transfer-switch-process": "access",
  eligibility: "access",
  "deposit-ceiling": "access",
  "default-allocation": "access",
  protection: "protection",
  regulator: "protection",
  "insurance-cover": "protection",
  "product-marking": "protection",
  currency: "structure",
  "distribution-policy": "structure",
  "statement-disclosure": "structure",
};

/** Default shelf per rule-base file, used when a rule's first dimension is absent or the file is uniform. */
const byFile: Record<string, ShelfId> = {
  "tax-general.md": "state",
  "tax-interest-deposits-bonds.md": "state",
  "tax-securities-israeli.md": "state",
  "tax-securities-foreign.md": "state",
  "tax-pension-gemel-lekitzba.md": "state",
  "tax-hishtalmut.md": "state",
  "tax-gemel-lehashkaa-ira-child.md": "state",
  "tax-insurance-and-amendment-190.md": "state",
  "tax-tier2-other.md": "state",
  "regulators-and-protection.md": "protection",
  "switching-and-transfers.md": "access",
  "provident-family-common.md": "access",
  "brokerage-account.md": "access",
  "mutual-funds-and-money-market-funds.md": "access",
  "etfs-and-index-funds.md": "structure",
  "bank-current-account-deposits.md": "access",
  "government-bonds-and-makam.md": "structure",
  "pension-and-gemel-lekitzba.md": "access",
  "keren-hishtalmut.md": "access",
  "kupat-gemel-lehashkaa.md": "access",
  "ira-self-directed.md": "access",
  "child-savings.md": "access",
  "tracks-catalogue-and-decoder.md": "structure",
  "bank-product-names.md": "structure",
  "corporate-bonds.md": "structure",
  "fx-and-structured-deposits.md": "structure",
  "managed-and-robo-portfolios.md": "structure",
  "reits-and-gold-funds.md": "structure",
  "savings-policies-and-executive-insurance.md": "structure",
};

/** Files whose rules follow the file's default shelf whatever their first dimension says (the tax files and the regulators file are uniform). */
const uniformFiles = new Set(["tax-general.md", "tax-interest-deposits-bonds.md", "tax-securities-israeli.md", "tax-securities-foreign.md", "tax-pension-gemel-lekitzba.md", "tax-hishtalmut.md", "tax-gemel-lehashkaa-ira-child.md", "tax-insurance-and-amendment-190.md", "tax-tier2-other.md", "regulators-and-protection.md"]);

/** Explicit moves from the IA report §3.2 (a rule whose first dimension would mislead the reader). */
const overrides: Record<string, ShelfId> = {
  "SW-15": "costs", "SW-33": "costs", "SW-34": "costs", "SW-36": "state",
  "PF-29": "protection", "PF-26": "structure", "PF-33": "structure", "PF-34": "structure", "PF-36": "structure", "PF-37": "structure", "PF-38": "structure",
  "BRK-27": "state",
  "BANK-23": "protection", "BANK-09": "structure", "BANK-13": "structure", "BANK-14": "structure", "BANK-15": "structure", "BANK-22": "structure",
  "GOV-02": "protection", "GOV-23": "access",
  "CS-05": "protection", "CS-18": "costs", "CS-20": "structure", "CS-26": "structure", "CS-27": "structure",
  "CAT-15": "protection", "CAT-16": "protection",
  "MKT-01": "structure",
  "SW-X01": "access", "SW-X02": "access", "SW-X03": "access", "SW-X04": "access",
};

export function shelfOf(rule: Pick<RuleRecord, "id" | "dimensions" | "il_finance_file">): ShelfId {
  const o = overrides[rule.id];
  if (o) return o;
  const file = byFile[rule.il_finance_file];
  if (file && uniformFiles.has(rule.il_finance_file)) return file;
  const first = rule.dimensions?.[0];
  if (first && byDimension[first]) return byDimension[first]!;
  return file ?? "structure";
}

/** True for the four forum accounts the rule base stores as rules (SW-X01 to SW-X04): shown last, labelled as one person's experience. */
export const isExperience = (id: string) => /^SW-X\d+$/.test(id);

/** The sub-group (the rule-base file) order inside a shelf: products a person meets first, then the cross-cutting files, then the plumbing. */
export const fileOrder: readonly string[] = [
  "bank-current-account-deposits.md",
  "mutual-funds-and-money-market-funds.md",
  "kupat-gemel-lehashkaa.md",
  "keren-hishtalmut.md",
  "pension-and-gemel-lekitzba.md",
  "brokerage-account.md",
  "etfs-and-index-funds.md",
  "government-bonds-and-makam.md",
  "child-savings.md",
  "ira-self-directed.md",
  "tax-securities-israeli.md",
  "tax-interest-deposits-bonds.md",
  "tax-securities-foreign.md",
  "tax-hishtalmut.md",
  "tax-gemel-lehashkaa-ira-child.md",
  "tax-pension-gemel-lekitzba.md",
  "tax-general.md",
  "switching-and-transfers.md",
  "provident-family-common.md",
  "regulators-and-protection.md",
  "tracks-catalogue-and-decoder.md",
  "bank-product-names.md",
  "tax-insurance-and-amendment-190.md",
  "tax-tier2-other.md",
  "savings-policies-and-executive-insurance.md",
  "corporate-bonds.md",
  "fx-and-structured-deposits.md",
  "managed-and-robo-portfolios.md",
  "reits-and-gold-funds.md",
] as const;

export const fileRank = (file: string): number => {
  const i = fileOrder.indexOf(file);
  return i < 0 ? fileOrder.length : i;
};

/** Files that are one product's page of rules: the wrappers whose product chip they belong under (the rules page's product filter). */
export const fileProducts: Record<string, string[]> = {
  "bank-current-account-deposits.md": ["current-account", "bank-deposit", "savings-plan"],
  "mutual-funds-and-money-market-funds.md": ["money-market-fund-daily", "money-market-fund-renewable"],
  "kupat-gemel-lehashkaa.md": ["kupat-gemel-lehashkaa"],
  "keren-hishtalmut.md": ["keren-hishtalmut"],
  "pension-and-gemel-lekitzba.md": ["pension-comprehensive", "pension-general", "provident-for-annuity"],
  "brokerage-account.md": ["brokerage-account"],
  "government-bonds-and-makam.md": ["government-bond", "makam"],
  "child-savings.md": ["child-savings-provident", "child-savings-bank"],
  "ira-self-directed.md": ["ira-hishtalmut", "ira-provident"],
};

/** The file whose rules apply to every provident product ("common" product chip). */
export const commonRulesFile = "provident-family-common.md";

/** Files of the products the site does not cover yet ("tier2" product chip). */
export const tier2RuleFiles: ReadonlySet<string> = new Set(["tax-insurance-and-amendment-190.md", "tax-tier2-other.md", "savings-policies-and-executive-insurance.md", "corporate-bonds.md", "fx-and-structured-deposits.md", "managed-and-robo-portfolios.md", "reits-and-gold-funds.md"]);
