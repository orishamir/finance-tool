// What the person says of an index they added (D44): where its companies are, and its dividend yield. One answer per index, shown to every
// fund on it. They feed the tax inside a fund on it (method F-107): a region the method bounds over its countries' rates (the United
// States, Europe, the whole world) with the yield typed gives the index one part over those countries; Israel and "another place, or not
// sure" have no rule that reaches them (G-44), so they give none.
//
// No runtime import of invest.ts or the engine: state.ts reads this file on every page.
import type { AddedDividends, DividendRegion } from "@finance-tool/engine";
import type { ValueObject } from "@finance-tool/schema";

/** Where the companies of an index are; "other" is "another place, or not sure". */
export type IndexRegion = "us" | "europe" | "world" | "israel" | "other";
export const INDEX_REGIONS: readonly IndexRegion[] = ["us", "europe", "world", "israel", "other"];
export const isIndexRegion = (x: unknown): x is IndexRegion => typeof x === "string" && (INDEX_REGIONS as readonly string[]).includes(x);

/** F-107: the region the method bounds an index's dividend tax over, by where its companies are; null where no rule reaches it (G-44). */
const DIVIDEND_REGION = { us: "us", europe: "europe", world: "world", israel: null, other: null } as const satisfies Record<IndexRegion, DividendRegion | null>;

/** Whether an index in this region has a rule its dividend yield feeds (F-107), so the panel asks for the yield. */
export const asksYield = (region: IndexRegion | undefined): boolean => region !== undefined && DIVIDEND_REGION[region] !== null;

/** The person's answers about an index they added, as the index keeps them; both absent until asked. */
export interface IndexFacts {
  region?: IndexRegion;
  /** The index's dividend yield, percent a year, entered: F-107's `y` where its region has a rule (`asksYield`). */
  dividendYield?: ValueObject;
}

/**
 * How F-107 stands on an index the person added: its yield can be counted (a region with a rule and a yield typed), or why not: the yield
 * is missing, the index is of Israeli companies (Israel's rate on a dividend to a foreign fund is not in the rule base, G-44), or its
 * place is not said or is another.
 */
export type TypedDividendTax = "counted" | "need-yield" | "israel" | "other-place";

export function typedDividendTax(facts: IndexFacts): TypedDividendTax {
  if (facts.region === "israel") return "israel";
  if (!asksYield(facts.region)) return "other-place";
  return facts.dividendYield ? "counted" : "need-yield";
}

/** What the engine reads of an index the person added (F-107): its region and yield, a fraction; only where they can be counted. */
export function dividendsOfTyped(facts: IndexFacts): AddedDividends | undefined {
  const region = facts.region ? DIVIDEND_REGION[facts.region] : null;
  const y = facts.dividendYield?.value;
  return region && typeof y === "number" ? { source: "added", region, yield: y / 100 } : undefined;
}
