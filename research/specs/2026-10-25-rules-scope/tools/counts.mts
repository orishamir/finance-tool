// Counts for report.md: where each record that is not general is listed (its companies' pages, or /companies), per company.
import { companyLinks, noPageCompanyTerms, loadInstitutionRegistry } from "../../../../site/app/lib/institutions.server.ts";
import { loadRules } from "../../../../site/app/lib/data.server.ts";
const rules = loadRules();
const links = companyLinks();
const non = Object.values(rules).filter((r) => r.scope !== "general");
const onPage = non.filter((r) => (r.scope_institutions ?? []).some((i) => links[i.id]?.hasPage));
const noPage = noPageCompanyTerms(rules);
console.log(`records not general: ${non.length}; on at least one company page: ${onPage.length}; only on /companies: ${non.length - onPage.length} (of them naming no company: ${noPage.none.length}: ${noPage.none.join(", ")})`);
const reg = loadInstitutionRegistry();
console.log(`registry rows: ${reg.length}; with a page: ${Object.values(links).filter((l) => l.hasPage).length}`);
const per = reg.map((r) => [r.name_he, links[r.id]!.hasPage ? "page" : "no page", non.filter((x) => (x.scope_institutions ?? []).some((i) => i.id === r.id)).length] as const).filter((x) => x[2] > 0);
for (const [n, p, c] of per) console.log(`  ${n} (${p}): ${c}`);
