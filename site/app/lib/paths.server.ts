// Every path the site pre-renders (react-router.config.ts): one page per guide, company and track.
import { loadCma, loadWrappers } from "./data.server";

export function prerenderPaths(): string[] {
  const paths = ["/", "/guide", "/companies", "/rules", "/parameters", "/not-covered", "/search-index.json"];
  for (const w of loadWrappers()) paths.push(`/guide/${w.id}`);
  const cma = loadCma();
  for (const c of cma.companies) paths.push(`/companies/${c.id}`);
  for (const t of cma.tracks) paths.push(`/companies/${t.companyId}/${t.fundId}`);
  return paths;
}
