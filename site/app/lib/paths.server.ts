// Every path the site pre-renders (react-router.config.ts): one page per guide, company and track.
import { loadCma, loadProducts } from "./data.server";
import { exposureFolds, loadExposures } from "./instruments.server";
import { trackProductIds } from "./track-browser.server";
import { institutionIds } from "./institutions.server";
import { loadBrands } from "./brands.server";
import { INDICES_PATH, companyPath, exposurePath, guidePath, indexPath, trackBrowserPath, trackPath } from "./site-paths";

export function prerenderPaths(): string[] {
  const paths = ["/", "/guide", "/companies", "/company-figures.json", "/rules", "/rules/state", "/rules/costs", "/rules/access", "/rules/protection", "/rules/structure", "/rules-data/state.json", "/rules-data/companies.json", "/rules-data/costs.json", "/rules-data/access.json", "/rules-data/protection.json", "/rules-data/structure.json", "/documents", "/documents-data.json", "/parameters", "/not-covered", "/search-index.json", "/search-texts.json", "/compare-bundle.json"];
  paths.push("/guide/limited-bond-fund", "/guide/mutual-funds");
  for (const w of loadProducts()) paths.push(guidePath(w.id));
  const folds = exposureFolds();
  for (const e of loadExposures()) if (!folds[e.id]) paths.push(exposurePath(e.id));
  const cma = loadCma();
  for (const c of cma.companies) paths.push(companyPath(c.id));
  for (const t of cma.tracks) paths.push(trackPath(t.companyId, t.fundId));
  // the track browser (D54): /tracks shows the default product, /tracks/<id> each of the six
  paths.push("/tracks");
  for (const w of trackProductIds) paths.push(trackBrowserPath(w));
  // every bank's deposits side by side (D92)
  paths.push("/deposits");
  paths.push("/fees", "/fees-data.json");
  paths.push("/transfer");
  // the index page (D28; at /indices): one page per equity index, /indices/<x> for index-<x>; a custom index opens client-side at /indices?custom=<id>
  paths.push(INDICES_PATH);
  for (const e of loadExposures()) if (e.kind === "equity_index") paths.push(indexPath(e.id));
  // banks and brokers (release 4): one page per snapshot provider and per bank with deposit records
  for (const id of institutionIds()) if (!cma.companies.some((c) => c.id === id)) paths.push(companyPath(id));
  // the brands (D33): every address of a brand shows its one page (a fund manager or a foreign broker has no other page)
  for (const b of loadBrands()) for (const id of b.pageIds) if (!paths.includes(companyPath(id))) paths.push(companyPath(id));
  paths.push("/indices-bundle.json");
  // the component gallery: for builders, noindex, in no menu and no search
  paths.push("/kit");
  return paths;
}
