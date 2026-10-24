// The data the switching playbook page is built from at build time (flows 31, 33): the wrapper's step list rendered from
// the rule records, the rules the page quotes (for the cards and the engine's rule book), and the companies the pair fields
// offer. One page per wrapper that has a step list. Server-only.
import { loadCma, loadFees, loadRules, loadWrappers, today } from "./data.server";
import { buildSteps, isProvident, playbookRuleIds, playbookWrappers, STEP_LISTS } from "./playbook";
import { providerWrapperIds } from "./providers.server";

export function playbookWrapperIds(): string[] {
  return playbookWrappers;
}

export interface PlaybookCompany {
  id: string;
  name: string;
}

const norm = (s: string) => s.replace(/["״'׳]/g, "").replace(/\s+/g, " ").trim();

/**
 * The institutions a pair field offers, of the page's own family (B14): the managing companies of the regulator's data for a
 * provident or pension wrapper, the banks and brokers with a fee snapshot for a bank or brokerage page; each name once.
 */
function companies(wrapperId: string): PlaybookCompany[] {
  const byName = new Map<string, PlaybookCompany>();
  const add = (id: string, name: string) => {
    const key = norm(name);
    if (!byName.has(key)) byName.set(key, { id, name });
  };
  const managers = isProvident(wrapperId) || wrapperId === "child-savings-provident" || wrapperId.startsWith("ira-");
  const banks = !isProvident(wrapperId) && wrapperId !== "child-savings-provident";
  if (managers) for (const c of loadCma().companies) add(c.id, c.name);
  // an individually managed account (IRA) is run by a managing company or by a bank or broker: both
  if (banks) for (const s of loadFees()) if (s.provider.class === "bank" || s.provider.class === "broker") add(s.id, s.provider.name_he);
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export function playbookPage(wrapperId: string) {
  if (!STEP_LISTS[wrapperId]) return null;
  const all = loadRules();
  const wrapper = loadWrappers().find((w) => w.id === wrapperId);
  const date = today();
  const ids = playbookRuleIds(wrapperId).filter((id) => all[id]);
  const rules = Object.fromEntries(ids.map((id) => [id, all[id]!]));
  return {
    wrapperId,
    wrapperName: wrapper?.names.he[0] ?? wrapperId,
    today: date,
    rules,
    steps: buildSteps(all, wrapperId, date),
    companies: companies(wrapperId),
    hasProviders: providerWrapperIds().includes(wrapperId),
  };
}
