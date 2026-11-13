// The search index (architecture 3.5): built at build time over wrapper names, the regulator's fund names
// and the glossary terms, and served as a static file the search sheet fetches once.
import type { SearchEntry } from "../lib/search";
import { companyPath, documentsPath, guidePath, rulesPath, trackBrowserPath, trackPath } from "../lib/site-paths";

export async function loader() {
  const { loadCma, loadTerms, loadProducts, loadRules, loadParameters } = await import("../lib/data.server");
  const { exposureHref, loadCatalog, loadExposures } = await import("../lib/instruments.server");
  const { normalize, ruleFigs } = await import("../lib/search");
  const { gershayim } = await import("../lib/format");
  const { limitedBondFund, mutualFunds, search, searchMore, sourceBlock, parametersPage, topicName } = await import("../copy");
  const entries: SearchEntry[] = [];
  const wrappers = loadProducts();
  const exposures = loadExposures();
  // a guide's row says which page it opens: "עמוד המדריך" under the page's own name, "עמוד המדריך על <name>" under another
  const titles = new Map<string, string>([...wrappers.map((w) => [guidePath(w.id), w.names.he[0]!] as const), ["/guide/limited-bond-fund", limitedBondFund.title], ["/guide/mutual-funds", mutualFunds.title]]);
  for (const e of exposures) if (!titles.has(exposureHref(e.id))) titles.set(exposureHref(e.id), e.names.he[0]!);
  const guideRow = (name: string, href: string): SearchEntry => {
    const title = titles.get(href) ?? name;
    return { kind: "guide", name, line: name === title ? search.guideLine : `${search.guideAbout} ${gershayim(title)}`, href, norm: normalize(name) };
  };
  for (const w of wrappers) for (const name of [...w.names.he, ...w.names.app, ...w.names.statement]) entries.push(guideRow(name, guidePath(w.id)));
  for (const name of limitedBondFund.searchNames) entries.push(guideRow(name, "/guide/limited-bond-fund"));
  for (const name of mutualFunds.searchNames) entries.push(guideRow(name, "/guide/mutual-funds"));
  // the parts of each guide a question can lead to (tax, cost, money in and out, who offers it, risks), found only through a product's
  // name in the question (lib/search.ts `leadRows`), and the page that compares the product across providers
  const { firstInGuideOrder, sectionTitle, topicSection } = await import("../lib/guide-nav");
  const { sectionTopicWords } = await import("../lib/search-aliases");
  const proseSections: Record<string, readonly { id: string; title: string }[]> = { "limited-bond-fund": limitedBondFund.sections, "mutual-funds": mutualFunds.sections };
  for (const [href, title] of titles) {
    if (!href.startsWith("/guide/")) continue;
    const id = href.slice("/guide/".length);
    // one row for one section, with every topic that leads to it ("מי מציע, ובכמה" answers both who offers it and what it costs)
    const topics = new Map<string, string[]>();
    for (const { topic } of sectionTopicWords) {
      const section = topicSection(id, topic);
      if (section) topics.set(section, [...(topics.get(section) ?? []), topic]);
    }
    for (const [section, keys] of topics) {
      const heading = proseSections[id] ? proseSections[id]!.find((x) => x.id === section)!.title : sectionTitle(id, section);
      const name = gershayim(`${title} · ${heading}`);
      entries.push({ kind: "section", name, line: search.sectionLine, href: `${href}#${section}`, norm: normalize(name), key: keys.join(" "), of: href });
    }
  }
  const { trackProductIds } = await import("../lib/track-browser");
  const { depositBrowser, trackBrowser } = await import("../copy");
  for (const id of trackProductIds) {
    const name = gershayim(`${trackBrowser.guideLink.before}${titles.get(guidePath(id))}${trackBrowser.guideLink.after}`);
    entries.push({ kind: "compare", name, line: search.tracksLine, href: trackBrowserPath(id), norm: normalize(name), of: guidePath(id) });
  }
  entries.push({ kind: "compare", name: depositBrowser.search.names[0], line: depositBrowser.search.line, href: "/deposits", norm: normalize(depositBrowser.search.names[0]), of: "/guide/bank-deposit" });
  // the fund and track numbers are searchable, and the row says which number it is
  const idLine = (n: number | string) => `${search.fundWord} ${n}`;
  const cma = loadCma();
  for (const t of cma.tracks) entries.push({ kind: "track", name: t.name, line: `${t.companyName} · ${t.classification} · ${idLine(t.fundId)}`, href: trackPath(t.companyId, t.fundId), norm: normalize(t.name), ids: [String(t.fundId)] });
  // the managing companies are results, by name and by company number
  for (const c of cma.companies) entries.push({ kind: "company", name: c.name, line: search.groups.company, href: companyPath(c.id), norm: normalize(c.name), ids: [c.id] });
  // D33: a brand is a result by the name the site shows and by its fund managers' names; each leads to the brand's one page
  const { loadBrands } = await import("../lib/brands.server");
  const { brands: brandWords } = await import("../copy");
  for (const b of loadBrands()) for (const name of [b.name, ...b.fundManagers]) entries.push({ kind: "company", name, line: brandWords.searchLine, href: companyPath(b.page), norm: normalize(name) });
  for (const e of exposures) for (const name of [...e.names.he, ...e.names.en]) entries.push(guideRow(name, exposureHref(e.id)));
  // every name the catalogue records: the track when it names one, else the company page, else the product's guide page
  for (const c of loadCatalog()) {
    const first = cma.tracks.find((t) => c.maps_to.track_ids.includes(t.fundId));
    const wrapper = wrappers.find((w) => w.id === c.maps_to.wrapper_id);
    const href = first ? (c.maps_to.track_ids.length === 1 ? trackPath(first.companyId, first.fundId) : companyPath(first.companyId)) : wrapper ? guidePath(wrapper.id) : "/guide";
    const line = [first?.companyName, wrapper?.names.he[0]].filter(Boolean).join(" · ");
    // the number is the entry's own only when the entry is one track; a company page is not found by its tracks' numbers
    const ids = c.maps_to.track_ids.length === 1 ? c.maps_to.track_ids.map(String) : [];
    for (const name of c.names.he) entries.push({ kind: "product", name, line, href, norm: normalize(name), ...(ids.length > 0 ? { ids } : {}) });
  }
  // the funds the site holds a record of, by name and by TASE number: an index fund on its index's page,
  // any other on its holding's page (the funds page is gone)
  const { loadFunds } = await import("../lib/instruments.server");
  const { indexPath } = await import("../lib/site-paths");
  for (const f of loadFunds()) {
    const exposure = exposures.find((e) => e.id === f.exposure_id);
    const num = f.identifiers.tase_number;
    const ids = [num, f.identifiers.isin].filter((x): x is string => Boolean(x)).map((x) => x.toLowerCase());
    const line = [exposure?.names.he[0], num ? `${search.securityWord} ${num}` : ""].filter(Boolean).join(" · ");
    for (const name of [...f.names.he, ...f.names.en]) entries.push({ kind: "track", name, line, href: exposure?.kind === "equity_index" ? indexPath(exposure.id) : exposureHref(f.exposure_id), norm: normalize(name), ids });
  }
  // what the site does not cover yet is a result too, pointing at the page that says so
  const { graduationStatuses } = await import("../lib/graduation.server");
  const { loadNotCovered } = await import("../lib/data.server");
  const notCovered = loadNotCovered();
  for (const s of graduationStatuses()) {
    const row = notCovered.find((r) => r.he === s.name);
    for (const name of [s.name, ...(row?.variants ?? [])]) entries.push({ kind: "notcovered", name, line: search.notCoveredLine, href: `/not-covered#${s.id}`, norm: normalize(name) });
  }
  for (const term of loadTerms()) {
    // a term of several products opens on the first of them in the guide's own order
    const guide = firstInGuideOrder(term.wrapperIds.filter((id) => wrappers.some((w) => w.id === id)));
    const exposure = guide ? undefined : term.exposureIds.find((id) => exposures.some((e) => e.id === id));
    if (!guide && !exposure) continue;
    const page = guide ? wrappers.find((w) => w.id === guide)!.names.he[0]! : exposures.find((e) => e.id === exposure)!.names.he[0]!;
    // the term's card opens on its page (TermFromAddress): the pages' terms list is gone
    const hash = `term=${encodeURIComponent(term.he)}`;
    const href = guide ? guidePath(guide, { hash }) : `${exposureHref(exposure!)}#${hash}`;
    for (const name of [term.he, ...term.variants]) entries.push({ kind: "term", name, line: `${search.termLine} ${page}`, href, norm: normalize(name), key: `term:${term.he}` });
  }
  // knowledge layer (synthesis 3.6): rules by title, id and figures; parameters by name and id; documents by title. The id is the row's key,
  // which a typed code finds (lib/search.ts `idForms`); the row's line never prints it: the words carry the rule (D48)
  const { ruleTitle } = await import("../lib/rule-title");
  const strengthRank: Record<string, number> = { primary: 0, entered: 1, institution: 2, secondary: 3, open: 4 };
  // D30 (spec 2026-10-25-rules-scope §4): two groups; a company's term (or an unsettled one) names its company and leads to where it is listed
  const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
  const { companyTermsHref, joinNames, listedCompanies, ownDocCompanies } = await import("../lib/scope");
  const { scopeWords } = await import("../copy");
  const links = companyLinks();
  const ownDocs = ownDocuments();
  for (const rule of Object.values(loadRules())) {
    const title = ruleTitle(rule).text;
    const topic = topicName(rule.il_finance_file);
    if (rule.scope !== "general") {
      // the row names the companies whose sections list it; a not-rule, which none lists, says "לא נכלל ככלל",
      // after the companies whose documents it was read from, if any, and leads to that section of /companies; every company it
      // names still finds it
      const listed = listedCompanies(rule, ownDocs);
      const own = ownDocCompanies(rule, ownDocs);
      const who = listed.length > 0 ? joinNames(listed.map((c) => c.name_he)) : [joinNames(own.map((c) => c.name_he)), scopeWords.notRule.tag].filter(Boolean).join(" · ");
      const named = joinNames((rule.scope_institutions ?? []).map((c) => c.name_he));
      const firstSourceHe = (rule as { sources?: { title_he?: string }[] }).sources?.[0]?.title_he;
      const altC = normalize([...Object.values(rule.figure_names_he ?? {}), topic, named, firstSourceHe ?? ""].join(" "));
      const figsC = ruleFigs(rule.figures, rule.figure_names_he);
      entries.push({
        kind: "companyRule",
        name: title,
        line: [who, topic].filter(Boolean).join(" · "),
        href: companyTermsHref(rule, links, ownDocs),
        norm: normalize(title),
        key: rule.id,
        st: strengthRank[rule.strength] ?? 3,
        ...(altC ? { alt: altC } : {}),
        ...(figsC.length > 0 ? { figs: figsC } : {}),
      });
      continue;
    }
    const weak = sourceBlock.weak[rule.strength];
    // W1 adds sources[]; the first source's Hebrew title is one more word the rule can be found by
    const firstSource = (rule as { sources?: { title_he?: string }[] }).sources?.[0]?.title_he;
    const alt = normalize([...Object.values(rule.figure_names_he ?? {}), topic, firstSource ?? ""].join(" "));
    const figs = ruleFigs(rule.figures, rule.figure_names_he);
    entries.push({
      kind: "rule",
      name: title,
      line: [topic, weak].filter(Boolean).join(" · "),
      href: rulesPath({ hash: rule.id }),
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
    entries.push({ kind: "parameter", name, line: searchMore.parameterLine, href: `/parameters#${p.method_id}`, norm: normalize(name), key: p.method_id, ...(labels.length > 0 ? { alt: normalize(labels.join(" ")) } : {}) });
  }
  const { loadDocuments } = await import("../lib/documents.server");
  for (const d of loadDocuments().filter((x) => x.featured)) entries.push({ kind: "document", name: d.title, line: [searchMore.documentLine, d.publisher].filter(Boolean).join(" · "), href: documentsPath({ hash: d.key }), norm: normalize(d.title) });
  // release 4: bank and broker names and every name a deposit record carries (447, app, ad, abbreviation)
  const { institutionSearchEntries } = await import("../lib/institutions.server");
  const { r4catalogue } = await import("../copy");
  for (const e of institutionSearchEntries({ bank: r4catalogue.classWord.bank, broker: r4catalogue.classWord.broker })) {
    entries.push({ kind: "bank", name: e.name, line: e.line, href: e.href, norm: normalize(e.extra ? `${e.name} ${e.extra}` : e.name), ...(e.extra && /^\d+$/.test(e.extra) ? { ids: [e.extra] } : {}) });
  }
  // the deposits page (D92): found by what it is, among the bank results
  for (const name of depositBrowser.search.names) entries.push({ kind: "bank", name, line: depositBrowser.search.line, href: "/deposits", norm: normalize(name) });
  return Response.json(entries);
}
