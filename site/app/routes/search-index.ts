// The search index (architecture 3.5): built at build time over wrapper names, the regulator's fund names
// and the glossary terms, and served as a static file the search sheet fetches once.
import type { SearchEntry } from "../lib/search";

export async function loader() {
  const { loadCma, loadTerms, loadWrappers } = await import("../lib/data.server");
  const { loadCatalog, loadExposures } = await import("../lib/instruments.server");
  const { normalize } = await import("../lib/search");
  const { search } = await import("../copy");
  const entries: SearchEntry[] = [];
  const wrappers = loadWrappers();
  for (const w of wrappers) {
    for (const name of [...w.names.he, ...w.names.app, ...w.names.statement]) entries.push({ kind: "guide", name, line: search.groups.guide, href: `/guide/${w.id}`, norm: normalize(name) });
  }
  const cma = loadCma();
  for (const t of cma.tracks) entries.push({ kind: "track", name: t.name, line: `${t.companyName} · ${t.classification}`, href: `/companies/${t.companyId}/${t.fundId}`, norm: normalize(t.name) });
  const exposures = loadExposures();
  for (const e of exposures) for (const name of [...e.names.he, ...e.names.en]) entries.push({ kind: "guide", name, line: search.groups.guide, href: `/exposure/${e.id}`, norm: normalize(name) });
  // every name the catalogue records: the track when it names one, else the company page, else the product's guide page
  for (const c of loadCatalog()) {
    const first = cma.tracks.find((t) => c.maps_to.track_ids.includes(t.fundId));
    const wrapper = wrappers.find((w) => w.id === c.maps_to.wrapper_id);
    const href = first ? (c.maps_to.track_ids.length === 1 ? `/companies/${first.companyId}/${first.fundId}` : `/companies/${first.companyId}`) : wrapper ? `/guide/${wrapper.id}` : "/guide";
    const line = [first?.companyName, wrapper?.names.he[0]].filter(Boolean).join(" · ");
    for (const name of c.names.he) entries.push({ kind: "product", name, line, href, norm: normalize(name) });
  }
  for (const term of loadTerms()) {
    const guide = term.wrapperIds.find((id) => wrappers.some((w) => w.id === id));
    const exposure = guide ? undefined : term.exposureIds.find((id) => exposures.some((e) => e.id === id));
    if (!guide && !exposure) continue;
    const page = guide ? wrappers.find((w) => w.id === guide)!.names.he[0]! : exposures.find((e) => e.id === exposure)!.names.he[0]!;
    const href = guide ? `/guide/${guide}#terms` : `/exposure/${exposure}#terms`;
    for (const name of [term.he, ...term.variants]) entries.push({ kind: "term", name, line: `${search.termLine} ${page}`, href, norm: normalize(name) });
  }
  // release 4: bank and broker names and every name a deposit record carries (447, app, ad, abbreviation)
  const { institutionSearchEntries } = await import("../lib/institutions.server");
  const { r4catalogue } = await import("../copy");
  for (const e of institutionSearchEntries({ bank: r4catalogue.classWord.bank, broker: r4catalogue.classWord.broker })) {
    entries.push({ kind: "bank", name: e.name, line: e.line, href: e.href, norm: normalize(e.extra ? `${e.name} ${e.extra}` : e.name) });
  }
  return Response.json(entries);
}
