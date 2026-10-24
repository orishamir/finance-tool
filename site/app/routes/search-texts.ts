// The second search file (research/knowledge/2026-10-24-search.md §2.2): the raw Hebrew of every rule text, term meaning
// and parameter rationale, keyed like the entries of search-index.json (`TXG-02`, `term:<name>`, `P-03`). The client fetches
// it after the index and uses it only to re-rank and to answer a question-form query.
export async function loader() {
  const { loadRules, loadParameters, loadTerms, loadWrappers } = await import("../lib/data.server");
  const { loadExposures } = await import("../lib/instruments.server");
  const texts: Record<string, string> = {};
  for (const rule of Object.values(loadRules())) if (rule.text_he) texts[rule.id] = rule.text_he;
  for (const p of loadParameters()) if (p.rationale_he) texts[p.method_id] = p.rationale_he;
  // only the terms the index holds (those with a guide or exposure page), once per term
  const wrappers = loadWrappers();
  const exposures = loadExposures();
  for (const term of loadTerms()) {
    const page = term.wrapperIds.some((id) => wrappers.some((w) => w.id === id)) || term.exposureIds.some((id) => exposures.some((e) => e.id === id));
    if (page && term.explanation) texts[`term:${term.he}`] = term.explanation;
  }
  return Response.json(texts);
}
