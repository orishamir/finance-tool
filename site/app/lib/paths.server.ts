// Every path the site pre-renders (react-router.config.ts): one page per guide, company and track.
import { loadCma, loadWrappers } from "./data.server";
import { loadExposures } from "./instruments.server";
import { workbenchWrapperIds } from "./workbench.server";
import { institutionIds } from "./institutions.server";
import { providerWrapperIds } from "./providers.server";
import { playbookWrapperIds } from "./playbook.server";

export function prerenderPaths(): string[] {
  const paths = ["/", "/guide", "/questions", "/companies", "/rules", "/rules/state", "/rules/costs", "/rules/access", "/rules/protection", "/rules/structure", "/rules-data/state.json", "/rules-data/costs.json", "/rules-data/access.json", "/rules-data/protection.json", "/rules-data/structure.json", "/documents", "/parameters", "/not-covered", "/search-index.json", "/search-texts.json", "/goal", "/goal/compare", "/idle-cash", "/compare-bundle.json"];
  for (const w of loadWrappers()) paths.push(`/guide/${w.id}`);
  for (const e of loadExposures()) paths.push(`/exposure/${e.id}`);
  const cma = loadCma();
  for (const c of cma.companies) paths.push(`/companies/${c.id}`);
  for (const t of cma.tracks) paths.push(`/companies/${t.companyId}/${t.fundId}`);
  for (const w of workbenchWrapperIds()) paths.push(`/workbench/tracks/${w}`);
  paths.push("/fees", "/fees-data.json");
  paths.push("/holdings", "/holdings-bundle.json", "/transfer");
  // the index page (D28): one page per equity index; a custom index opens client-side at /invest?custom=<id>
  paths.push("/invest");
  for (const e of loadExposures()) if (e.kind === "equity_index") paths.push(`/invest/${e.id}`);
  // banks and brokers (release 4): one page per snapshot provider and per bank with deposit records
  for (const id of institutionIds()) if (!cma.companies.some((c) => c.id === id)) paths.push(`/companies/${id}`);
  // the provider workbench and the fund-variant page (release 4): the subject is in the address, read in the browser
  for (const w of providerWrapperIds()) paths.push(`/workbench/providers/${w}`);
  for (const e of loadExposures()) paths.push(`/workbench/funds/${e.id}`);
  paths.push("/workbench-bundle.json");
  // the switching playbook (release 4): one page per wrapper that has a step list
  for (const w of playbookWrapperIds()) paths.push(`/switch/${w}`);
  return paths;
}
