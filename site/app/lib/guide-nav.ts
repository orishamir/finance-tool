// Pure helpers of the guide pages: how /guide groups its product pages and which section of /rules a guide's
// "all the rules of X" link lands on. No I/O, so both are unit-tested.

import { guide as guideCopy } from "../copy";
import type { GuideTopic } from "./search-aliases";

/** A section's title on a guide: its own where the usual one does not fit (copy `sectionTitles`). */
export const sectionTitle = (wrapperId: string, sectionId: string): string =>
  guideCopy.sectionTitles[wrapperId]?.[sectionId] ?? guideCopy.sections.find((x) => x.id === sectionId)!.title;

/**
 * The guide list by purpose, everyday to advanced inside each group. The ids are the wrapper ids; the group
 * titles are in copy (`guideIndex.purposeGroups`). A wrapper this table does not name still shows, in a last group, so a new
 * product never disappears from the list.
 */
export const guideLayout: { id: string; ids: readonly string[] }[] = [
  { id: "short", ids: ["current-account", "bank-deposit", "savings-plan"] },
  { id: "tax-benefit", ids: ["keren-hishtalmut", "kupat-gemel-lehashkaa"] },
  { id: "retirement", ids: ["pension-comprehensive", "pension-general", "provident-for-annuity"] },
  { id: "children", ids: ["child-savings-provident", "child-savings-bank"] },
  { id: "self-directed", ids: ["brokerage-account", "ira-hishtalmut", "ira-provident"] },
];

/**
 * D6: a security is what the money is invested in, not where it is held, so the guide lists it under
 * "במה הכסף מושקע". An exposure that one security held directly *is* (makam, a government bond) has no page of its own:
 * the security's page is its page. Returns that security's id, or null when the exposure keeps its own page.
 */
export function exposureFoldedInto(holderIds: readonly string[], products: readonly { id: string; held_as?: string }[]): string | null {
  for (const id of holderIds) if (products.find((p) => p.id === id)?.held_as === "direct") return id;
  return null;
}

/** The sections a product guide leaves out (one template does not fit every guide). Unlisted guides keep them all. */
const omittedSections: Record<string, readonly string[]> = {
  "current-account": ["who", "inout", "cost", "tax"],
  // a section of one row that says nothing the page does not: "by the provider's tariff", "withdraw on any trading day"
  "bank-deposit": ["inout", "cost"],
  "savings-plan": ["inout", "cost"],
  "child-savings-bank": ["inout", "cost"],
  makam: ["inout", "cost"],
  "government-bond": ["inout", "cost"],
  "money-market-fund-daily": ["inout"],
  "money-market-fund-renewable": ["inout"],
  "brokerage-account": ["inout"],
  // the page's links move up to "what it is"
  "keren-hishtalmut": ["use"],
};
export const omitsSection = (guideId: string, section: string): boolean => omittedSections[guideId]?.includes(section) ?? false;

/**
 * The section of a guide that answers a question about one topic (the search leads to it): on a product guide the section of the same
 * name, unless the guide leaves it out; the two guides of prose sections name theirs. Null when the guide has none.
 */
const proseTopicSections: Record<string, Partial<Record<GuideTopic, string>>> = {
  "mutual-funds": { tax: "tax", cost: "cost", inout: "trade", risk: "safety" },
  // "מי מציע, ובכמה" holds the cost; "מה קורה בסוף" is how the money comes out
  "limited-bond-fund": { tax: "tax", cost: "who", who: "who", inout: "end", risk: "risks" },
};
export function topicSection(guideId: string, topic: GuideTopic): string | null {
  const prose = proseTopicSections[guideId];
  if (prose) return prose[topic] ?? null;
  return omitsSection(guideId, topic) ? null : topic;
}

/**
 * The withdrawal rules a guide's money-in-and-out section shows. PF-46 holds for every provident product. PF-45 and TXP-18
 * speak of money drawn against the rules under s.23 of the Provident Funds Law, which TXP-18 taxes alike from a provident fund
 * for annuity and from one for benefits: the pensions, the provident fund for annuity and the IRA provident fund (approved as
 * either, TXK-16) carry them. A study fund's early withdrawal has its own tax (F-47), and its guide does not.
 */
const providentFamily = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident", "ira-provident", "ira-hishtalmut"];
const annuityFamily = ["pension-comprehensive", "pension-general", "provident-for-annuity", "ira-provident"];
export const withdrawalRules = (guideId: string): string[] => [...(providentFamily.includes(guideId) ? ["PF-46"] : []), ...(annuityFamily.includes(guideId) ? ["PF-45", "TXP-18"] : [])];

export interface GuideGroup {
  id: string;
  ids: string[];
}

/** Puts the wrapper ids into the layout's groups and order; ids the layout does not know go last in group "other"; empty groups are dropped. */
export function groupGuides(wrapperIds: readonly string[], layout: { id: string; ids: readonly string[] }[] = guideLayout): GuideGroup[] {
  const present = new Set(wrapperIds);
  const known = new Set(layout.flatMap((g) => g.ids));
  const groups: GuideGroup[] = layout.map((g) => ({ id: g.id, ids: g.ids.filter((id) => present.has(id)) }));
  groups.push({ id: "other", ids: wrapperIds.filter((id) => !known.has(id)) });
  return groups.filter((g) => g.ids.length > 0);
}

/**
 * The first of some product ids in the guide's own order (`guideLayout`); ids the layout does not know keep their order after them. The
 * search opens a term that belongs to several products on this one's page, so the page behind the card is the guide's first of them and
 * not the first by the letters of an internal id.
 */
export function firstInGuideOrder(ids: readonly string[], layout: { id: string; ids: readonly string[] }[] = guideLayout): string | undefined {
  const order = layout.flatMap((g) => g.ids);
  const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
  return [...ids].sort((a, b) => rank(a) - rank(b))[0];
}

/** The il-finance files that hold rules shared by many products or by tax in general, not one product's own rules. */
const sharedFiles = new Set(["regulators-and-protection.md", "provident-family-common.md", "switching-and-transfers.md", "tax-general.md", "tracks-catalogue-and-decoder.md"]);
const isTaxFile = (file: string) => file.startsWith("tax-");

/**
 * The /rules anchor (without "#") for "all the rules of this product": the topic file most of the page's own
 * rules come from, preferring a product file to a tax file and a tax file to a shared one; ties go to the file met first.
 * With no rules at all, or none with a file, the anchor is empty.
 */
export function rulesAnchor(rules: readonly { id: string; il_finance_file: string }[]): string {
  const count = new Map<string, number>();
  for (const r of rules) count.set(r.il_finance_file, (count.get(r.il_finance_file) ?? 0) + 1);
  const rank = (file: string) => (sharedFiles.has(file) ? 2 : isTaxFile(file) ? 1 : 0);
  let best: string | null = null;
  for (const [file, n] of count) {
    if (best === null) best = file;
    else if (rank(file) < rank(best) || (rank(file) === rank(best) && n > count.get(best)!)) best = file;
  }
  return best ? best.replace(/\.md$/, "") : rules[0]?.id ?? "";
}
