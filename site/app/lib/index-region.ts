// What the person says of an index they added (D44): where its companies are, and its dividend yield. One answer per index, shown to every
// fund on it. They feed the one rule the rule base has that turns on them, F-107 (the US tax inside an Irish fund that holds the index's
// shares): no other country's withholding is in the rule base, so no other region carries a rate.
//
// No runtime import of invest.ts: state.ts reads this file on every page.
import type { ExposureRecord, ValueObject } from "@finance-tool/schema";

/** Where the companies of an index are; "other" is "another place, or not sure". */
export type IndexRegion = "us" | "europe" | "world" | "israel" | "other";
export const INDEX_REGIONS: readonly IndexRegion[] = ["us", "europe", "world", "israel", "other"];
export const isIndexRegion = (x: unknown): x is IndexRegion => typeof x === "string" && (INDEX_REGIONS as readonly string[]).includes(x);

/**
 * F-107's `s_US`, the share of the index's US companies, by its region: 1 for the United States, 0 for Europe and Israel, null where it is
 * not known (the whole world, or another place or not sure).
 */
const US_SHARE = { us: 1, europe: 0, world: null, israel: 0, other: null } as const satisfies Record<IndexRegion, 0 | 1 | null>;

/** The person's answers about an index they added, as the index keeps them; both absent until asked. */
export interface IndexFacts {
  region?: IndexRegion;
  /** The index's dividend yield, percent a year, entered: F-107's `y_US` where the index is of US companies. */
  dividendYield?: ValueObject;
}

/**
 * How F-107 stands for an Irish fund that holds the shares of an index the person added: counted (US companies and a yield typed), or why
 * not: the yield is missing, the index has no US companies (the tax its countries withhold is not in the rule base), or their share is not
 * known.
 */
export type TypedDividendTax = "counted" | "need-yield" | "not-us" | "us-share-unknown";

export function typedDividendTax(facts: IndexFacts): TypedDividendTax {
  const share = facts.region ? US_SHARE[facts.region] : null;
  if (share === null) return "us-share-unknown";
  if (share === 0) return "not-us";
  return facts.dividendYield ? "counted" : "need-yield";
}

/** F-107's inputs of an index the person added, as an exposure record holds them (`us_dividends`): only where the tax is counted. */
export function usDividendsOfTyped(facts: IndexFacts): ExposureRecord["us_dividends"] | undefined {
  return typedDividendTax(facts) === "counted" && facts.dividendYield ? { yield: facts.dividendYield } : undefined;
}
