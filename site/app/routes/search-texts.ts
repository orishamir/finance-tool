// The second search file (8dd1f013:research/knowledge/2026-10-24-search.md §2.2): the raw Hebrew of every rule text, term meaning
// and parameter rationale, keyed like the entries of search-index.json (`TXG-02`, `term:<record id>`, `P-03`). The client fetches
// it after the index and uses it only to re-rank and to answer a question-form query.
export async function loader() {
  const { loadRules, loadParameters, loadProducts, readDirFiles, today } = await import("../lib/data.server");
  const { termRecord } = await import("@finance-tool/schema");
  const { termKey } = await import("../lib/search");
  const { slotsAsText } = await import("../lib/figure-slots");
  const { loadExposures } = await import("../lib/instruments.server");
  const { gershayim } = await import("../lib/format");
  const texts: Record<string, string> = {};
  // a rule text's figure slots as the figures its card shows
  const rules = loadRules();
  const slots = { rules, today: today() };
  for (const rule of Object.values(rules)) if (rule.text_he) texts[rule.id] = slotsAsText(rule.text_he, slots);
  for (const p of loadParameters()) if (p.rationale_he) texts[p.method_id] = p.rationale_he;
  // only the terms the index holds (those with a guide or exposure page), once per record: several records share a name
  const wrappers = loadProducts();
  const exposures = loadExposures();
  for (const { record: term } of readDirFiles("data/terms", termRecord)) {
    const page = term.wrapper_ids.some((id) => wrappers.some((w) => w.id === id)) || (term.exposure_ids ?? []).some((id) => exposures.some((e) => e.id === id));
    if (page && term.meaning) texts[termKey(term.id)] = term.meaning;
  }
  // an abbreviation's straight quote as the gershayim, as the pages write the data's text (an answer quotes these words)
  return Response.json(Object.fromEntries(Object.entries(texts).map(([k, v]) => [k, gershayim(v)])));
}
