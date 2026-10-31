// Pure helpers of the guide pages: how /guide groups its product pages (audit A44) and which section of /rules a guide's
// "all the rules of X" link lands on (audit A27). No I/O, so both are unit-tested.

/**
 * The guide list by purpose, everyday to advanced inside each group (audit A44). The ids are the wrapper ids; the group
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
 * D6 (amended 2026-10-27): a security is what the money is invested in, not where it is held, so the guide lists it under
 * "במה הכסף מושקע". An exposure that one security held directly *is* (makam, a government bond) has no page of its own:
 * the security's page is its page. Returns that security's id, or null when the exposure keeps its own page.
 */
export function exposureFoldedInto(holderIds: readonly string[], products: readonly { id: string; held_as?: string }[]): string | null {
  for (const id of holderIds) if (products.find((p) => p.id === id)?.held_as === "direct") return id;
  return null;
}

/** The sections a product guide leaves out (founder, issue 33: one template does not fit every guide). Unlisted guides keep them all. */
const omittedSections: Record<string, readonly string[]> = {
  "current-account": ["who", "inout", "cost", "tax", "check"],
};
export const omitsSection = (guideId: string, section: string): boolean => omittedSections[guideId]?.includes(section) ?? false;

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

/** The il-finance files that hold rules shared by many products or by tax in general, not one product's own rules. */
const sharedFiles = new Set(["regulators-and-protection.md", "provident-family-common.md", "switching-and-transfers.md", "tax-general.md", "tracks-catalogue-and-decoder.md"]);
const isTaxFile = (file: string) => file.startsWith("tax-");

/**
 * The /rules anchor (without "#") for "all the rules of this product" (audit A27): the topic file most of the page's own
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

/**
 * A company is closed to the public under a product when every track it runs there says its target population is the
 * workers of one sector or one plant (CMA field `target_population`, CAT-10); a track with no population stated, or for the
 * whole public, keeps it open (audit A86).
 */
export function isClosedAudience(populations: readonly string[]): boolean {
  const stated = populations.map((p) => p.trim()).filter((p) => p !== "");
  return stated.length > 0 && stated.length === populations.length && stated.every((p) => p.startsWith("עובדי"));
}

/**
 * The terms table of a guide or exposure page (audit A83): nothing under `min` rows (an empty or one-row table teaches
 * nothing); otherwise the terms the page's own text opens (`highlighted`) when there are enough of them, with the rest
 * behind a toggle; when too few are highlighted, all of them sit behind the toggle.
 */
export function splitTerms<T extends { he: string }>(terms: readonly T[], highlighted: readonly string[], min = 3): { main: T[]; rest: T[]; hide: boolean } {
  if (terms.length < min) return { main: [], rest: [], hide: true };
  const on = new Set(highlighted);
  const main = terms.filter((t) => on.has(t.he));
  if (main.length >= min) return { main, rest: terms.filter((t) => !on.has(t.he)), hide: false };
  return { main: [], rest: [...terms], hide: false };
}
