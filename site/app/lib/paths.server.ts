// Every path the site pre-renders (react-router.config.ts): one page per guide, company and track.
import { loadCma, loadWrappers } from "./data.server";
import { loadExposures } from "./instruments.server";
import { workbenchWrapperIds } from "./workbench.server";
import { institutionIds } from "./institutions.server";
import { providerWrapperIds } from "./providers.server";
import { changelogYears } from "./changes.server";
import { playbookWrapperIds } from "./playbook.server";

export function prerenderPaths(): string[] {
  const paths = ["/", "/guide", "/companies", "/rules", "/parameters", "/not-covered", "/search-index.json", "/goal", "/goal/compare", "/idle-cash", "/compare-bundle.json"];
  for (const w of loadWrappers()) paths.push(`/guide/${w.id}`);
  for (const e of loadExposures()) paths.push(`/exposure/${e.id}`);
  const cma = loadCma();
  for (const c of cma.companies) paths.push(`/companies/${c.id}`);
  for (const t of cma.tracks) paths.push(`/companies/${t.companyId}/${t.fundId}`);
  for (const w of workbenchWrapperIds()) paths.push(`/workbench/tracks/${w}`);
  paths.push("/fees", "/fees-data.json");
  paths.push("/holdings", "/holdings-bundle.json", "/transfer");
  // banks and brokers (release 4): one page per snapshot provider and per bank with deposit records
  for (const id of institutionIds()) if (!cma.companies.some((c) => c.id === id)) paths.push(`/companies/${id}`);
  // the provider workbench and the fund-variant page (release 4): the subject is in the address, read in the browser
  for (const w of providerWrapperIds()) paths.push(`/workbench/providers/${w}`);
  for (const e of loadExposures()) paths.push(`/workbench/funds/${e.id}`);
  paths.push("/workbench-bundle.json");
  // the switching playbook (release 4): one page per wrapper that has a step list
  for (const w of playbookWrapperIds()) paths.push(`/switch/${w}`);
  // release 5: the change-log page and one data file per year of data/changelog.jsonl
  paths.push("/changes");
  for (const y of changelogYears()) paths.push(`/changes-data/${y}`);
  return paths;
}
