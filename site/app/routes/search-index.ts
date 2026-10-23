// The search index (architecture 3.5): built at build time over wrapper names, the regulator's fund names
// and the glossary terms, and served as a static file the search sheet fetches once.
import type { SearchEntry } from "../lib/search";

export async function loader() {
  const { loadCma, loadTerms, loadWrappers } = await import("../lib/data.server");
  const { normalize } = await import("../lib/search");
  const { search } = await import("../copy");
  const entries: SearchEntry[] = [];
  const wrappers = loadWrappers();
  for (const w of wrappers) {
    for (const name of [...w.names.he, ...w.names.app, ...w.names.statement]) entries.push({ kind: "guide", name, line: search.groups.guide, href: `/guide/${w.id}`, norm: normalize(name) });
  }
  const cma = loadCma();
  for (const t of cma.tracks) entries.push({ kind: "track", name: t.name, line: `${t.companyName} · ${t.classification}`, href: `/companies/${t.companyId}/${t.fundId}`, norm: normalize(t.name) });
  for (const term of loadTerms()) {
    const guide = term.where.map((w) => w.match(/^guide:([a-z0-9-]+)$/)?.[1]).find((id) => id && wrappers.some((w) => w.id === id));
    if (!guide) continue;
    const page = wrappers.find((w) => w.id === guide)!.names.he[0]!;
    for (const name of [term.he, ...term.variants]) entries.push({ kind: "term", name, line: `${search.termLine} ${page}`, href: `/guide/${guide}#terms`, norm: normalize(name) });
  }
  return Response.json(entries);
}
