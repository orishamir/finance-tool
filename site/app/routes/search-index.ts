// The search index (architecture 3.5): built at build time over wrapper names, the regulator's fund names
// and the glossary terms, and served as a static file the search sheet fetches once.
import type { SearchEntry } from "../lib/search";

export async function loader() {
  const { loadCma, loadTerms, loadWrappers, loadRules, loadParameters } = await import("../lib/data.server");
  const { loadCatalog, loadExposures } = await import("../lib/instruments.server");
  const { normalize, pageAliases, ruleFigs } = await import("../lib/search");
  const { search, searchMore, sourceBlock, parametersPage, topicName } = await import("../copy");
  const entries: SearchEntry[] = [];
  const wrappers = loadWrappers();
  for (const w of wrappers) {
    for (const name of [...w.names.he, ...w.names.app, ...w.names.statement]) entries.push({ kind: "guide", name, line: search.groups.guide, href: `/guide/${w.id}`, norm: normalize(name) });
  }
  // audit 2026-10-24 (A4): the fund and track numbers are searchable, and the row says which number it is
  const idLine = (n: number | string) => `${search.fundWord} ${n}`;
  const cma = loadCma();
  for (const t of cma.tracks) entries.push({ kind: "track", name: t.name, line: `${t.companyName} · ${t.classification} · ${idLine(t.fundId)}`, href: `/companies/${t.companyId}/${t.fundId}`, norm: normalize(t.name), ids: [String(t.fundId)] });
  // audit 2026-10-24 (A92): the managing companies are results, by name and by company number
  for (const c of cma.companies) entries.push({ kind: "company", name: c.name, line: search.groups.company, href: `/companies/${c.id}`, norm: normalize(c.name), ids: [c.id] });
  for (const a of pageAliases) for (const name of a.names) entries.push({ kind: "guide", name, line: a.line, href: a.href, norm: normalize(name) });
  const exposures = loadExposures();
  for (const e of exposures) for (const name of [...e.names.he, ...e.names.en]) entries.push({ kind: "guide", name, line: search.groups.guide, href: `/exposure/${e.id}`, norm: normalize(name) });
  // every name the catalogue records: the track when it names one, else the company page, else the product's guide page
  for (const c of loadCatalog()) {
    const first = cma.tracks.find((t) => c.maps_to.track_ids.includes(t.fundId));
    const wrapper = wrappers.find((w) => w.id === c.maps_to.wrapper_id);
    const href = first ? (c.maps_to.track_ids.length === 1 ? `/companies/${first.companyId}/${first.fundId}` : `/companies/${first.companyId}`) : wrapper ? `/guide/${wrapper.id}` : "/guide";
    const line = [first?.companyName, wrapper?.names.he[0]].filter(Boolean).join(" · ");
    // the number is the entry's own only when the entry is one track; a company page is not found by its tracks' numbers
    const ids = c.maps_to.track_ids.length === 1 ? c.maps_to.track_ids.map(String) : [];
    for (const name of c.names.he) entries.push({ kind: "product", name, line, href, norm: normalize(name), ...(ids.length > 0 ? { ids } : {}) });
  }
  // audit 2026-10-24 (A4): the funds the site holds a record of, by name and by TASE number, on their variants page
  const { loadFunds } = await import("../lib/instruments.server");
  for (const f of loadFunds()) {
    const exposure = exposures.find((e) => e.id === f.exposure_id);
    const num = f.identifiers.tase_number;
    const ids = [num, f.identifiers.isin].filter((x): x is string => Boolean(x)).map((x) => x.toLowerCase());
    const line = [exposure?.names.he[0], num ? `${search.securityWord} ${num}` : ""].filter(Boolean).join(" · ");
    for (const name of [...f.names.he, ...f.names.en]) entries.push({ kind: "track", name, line, href: exposure ? `/workbench/funds/${exposure.id}` : `/exposure/${f.exposure_id}`, norm: normalize(name), ids });
  }
  // audit 2026-10-24 (A92): what the site does not cover yet is a result too, pointing at the page that says so
  const { graduationStatuses } = await import("../lib/graduation.server");
  const { loadNotCovered } = await import("../lib/data.server");
  const notCovered = loadNotCovered();
  for (const s of graduationStatuses()) {
    const row = notCovered.find((r) => r.he === s.name);
    for (const name of [s.name, ...(row?.variants ?? [])]) entries.push({ kind: "notcovered", name, line: search.notCoveredLine, href: `/not-covered#${s.id}`, norm: normalize(name) });
  }
  for (const term of loadTerms()) {
    const guide = term.wrapperIds.find((id) => wrappers.some((w) => w.id === id));
    const exposure = guide ? undefined : term.exposureIds.find((id) => exposures.some((e) => e.id === id));
    if (!guide && !exposure) continue;
    const page = guide ? wrappers.find((w) => w.id === guide)!.names.he[0]! : exposures.find((e) => e.id === exposure)!.names.he[0]!;
    const href = guide ? `/guide/${guide}#terms` : `/exposure/${exposure}#terms`;
    for (const name of [term.he, ...term.variants]) entries.push({ kind: "term", name, line: `${search.termLine} ${page}`, href, norm: normalize(name), key: `term:${term.he}` });
  }
  // knowledge layer (synthesis 3.6): rules by title, id and figures; parameters by name and id; documents by title
  const { shelfOf } = await import("../lib/rule-shelves");
  const { ruleTitle } = await import("../lib/rule-title");
  const strengthRank: Record<string, number> = { primary: 0, "primary-mirror": 1, entered: 1, institution: 2, secondary: 3, open: 4 };
  for (const rule of Object.values(loadRules())) {
    const title = ruleTitle(rule).text;
    const topic = topicName(rule.il_finance_file);
    const weak = sourceBlock.weak[rule.strength];
    // W1 adds sources[]; the first source's Hebrew title is one more word the rule can be found by
    const firstSource = (rule as { sources?: { title_he?: string }[] }).sources?.[0]?.title_he;
    const alt = normalize([...Object.values(rule.figure_names_he ?? {}), topic, firstSource ?? ""].join(" "));
    const figs = ruleFigs(rule.figures, rule.figure_names_he);
    entries.push({
      kind: "rule",
      name: title,
      line: [topic, weak, rule.id].filter(Boolean).join(" · "),
      href: `/rules/${shelfOf(rule)}#${rule.id}`,
      norm: normalize(title),
      key: rule.id,
      st: strengthRank[rule.strength] ?? 3,
      ...(alt ? { alt } : {}),
      ...(figs.length > 0 ? { figs } : {}),
    });
  }
  for (const p of loadParameters()) {
    const name = parametersPage.names[p.method_id];
    if (!name) continue;
    const labels = Object.entries(parametersPage.fields as Record<string, string>)
      .filter(([k]) => k.startsWith(`${p.method_id}.`))
      .map(([, v]) => v.replace(/\{[^}]*\}:?\s*/g, ""));
    entries.push({ kind: "parameter", name, line: `${searchMore.parameterLine} · ${p.method_id}`, href: `/parameters#${p.method_id}`, norm: normalize(name), key: p.method_id, ...(labels.length > 0 ? { alt: normalize(labels.join(" ")) } : {}) });
  }
  const { loadDocuments } = await import("../lib/documents.server");
  for (const d of loadDocuments().filter((x) => x.featured)) entries.push({ kind: "document", name: d.title, line: [searchMore.documentLine, d.publisher].filter(Boolean).join(" · "), href: `/documents#${d.key}`, norm: normalize(d.title) });
  // release 4: bank and broker names and every name a deposit record carries (447, app, ad, abbreviation)
  const { institutionSearchEntries } = await import("../lib/institutions.server");
  const { r4catalogue } = await import("../copy");
  for (const e of institutionSearchEntries({ bank: r4catalogue.classWord.bank, broker: r4catalogue.classWord.broker })) {
    entries.push({ kind: "bank", name: e.name, line: e.line, href: e.href, norm: normalize(e.extra ? `${e.name} ${e.extra}` : e.name), ...(e.extra && /^\d+$/.test(e.extra) ? { ids: [e.extra] } : {}) });
  }
  return Response.json(entries);
}
