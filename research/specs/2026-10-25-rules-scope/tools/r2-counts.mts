// Review 2 counts: where the records that are not general are listed now (company pages, /companies folds, the not-rules' fold).
import { loadRules } from "../../../../site/app/lib/data.server.ts";
import { companyLinks, noPageCompanyTerms, ownDocuments } from "../../../../site/app/lib/institutions.server.ts";
import { listedCompanies } from "../../../../site/app/lib/scope.ts";
const rules = loadRules();
const own = ownDocuments(rules);
const links = companyLinks();
const nonGeneral = Object.values(rules).filter((r) => r.scope !== "general");
let onPage = 0, onlyNoPage = 0;
for (const r of nonGeneral) {
  const at = listedCompanies(r, own);
  if (at.some((c) => links[c.id]?.hasPage)) onPage++;
  else if (at.length > 0) onlyNoPage++;
}
const np = noPageCompanyTerms(rules, own);
console.log(`not general: ${nonGeneral.length}; on at least one company page: ${onPage}; only in a /companies fold: ${onlyNoPage}; in the not-rules' fold: ${np.none.length} (${np.none.join(", ")})`);
const partial = nonGeneral.filter((r) => { const at = listedCompanies(r, own); return at.length > 0 && at.length < (r.scope_institutions ?? []).length; });
console.log(`listed at only some of the companies they name: ${partial.map((r) => `${r.id} (not at ${(r.scope_institutions ?? []).filter((c) => !listedCompanies(r, own).some((x) => x.id === c.id)).map((c) => c.id).join(", ")})`).join("; ")}`);
