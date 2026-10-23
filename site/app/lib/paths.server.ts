// Every path the site pre-renders (react-router.config.ts): one page per guide, company and track.
import { loadCma, loadWrappers } from "./data.server";
import { loadExposures } from "./instruments.server";

export function prerenderPaths(): string[] {
  const paths = ["/", "/guide", "/companies", "/rules", "/parameters", "/not-covered", "/search-index.json", "/goal", "/goal/compare", "/idle-cash", "/compare-bundle.json"];
  for (const w of loadWrappers()) paths.push(`/guide/${w.id}`);
  for (const e of loadExposures()) paths.push(`/exposure/${e.id}`);
  const cma = loadCma();
  for (const c of cma.companies) paths.push(`/companies/${c.id}`);
  for (const t of cma.tracks) paths.push(`/companies/${t.companyId}/${t.fundId}`);
  return paths;
}
