// D30 on the site (research/specs/2026-10-25-rules-scope/spec.md §4): a guide or exposure page cites general rules only. The
// validator checks the records under data/ (wrappers, exposures, P-09); this checks the prose modules, where a rule id is written by
// hand. A company's term may appear only inside `<VariesByCompany ids={[…]}>` (the "תלוי בחברה" links), and an index page may cite
// the records of its index provider that `ownContextExposures` names (D31). A record the rule base keeps that is not a rule, and is not
// general, is quoted only in the site files its `notRules` entry names, every file under site/app (reviews, 2026-10-26; the validator
// does the same for data/). Then the company sections: only records from the company's own documents, never a not-rule (the same review).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { isOwnDocument, notRuleAllowedIn, notRules, ownContextExposures, type RuleRecord } from "@finance-tool/schema";
import { chipName, companyTermsHref, generalOnly, isOwnSourceOf, joinNames, listedCompanies, ownDocCompanies, shownCompanies } from "./scope";
import { companyLinks, companyTermGroups, loadInstitutionRegistry, noPageCompanyTerms, ownDocuments, registryIdsOfPage } from "./institutions.server";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const rules = new Map<string, { id: string; scope: string; scope_institutions?: { id: string; name_he: string }[]; sources?: { url: string; title: string; title_he?: string }[] }>();
for (const f of readdirSync(join(root, "data/rules")).filter((x) => x.endsWith(".json"))) {
  const r = JSON.parse(readFileSync(join(root, "data/rules", f), "utf8"));
  rules.set(r.id, r);
}

function citedOutsideVaries(src: string): string[] {
  const without = src.replace(/<VariesByCompany\b[^>]*\/>/g, "");
  return [...new Set([...without.matchAll(/["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g)].map((m) => m[1]!))].filter((id) => rules.has(id));
}

describe("guide and exposure prose cites general rules only", () => {
  const cites = new Map<string, string[]>();
  for (const kind of ["guide", "exposure"] as const) {
    const dir = join(root, "site/app/content", kind);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx") && x !== "index.tsx" && x !== "types.tsx")) {
      const file = `site/app/content/${kind}/${f}`;
      cites.set(file, citedOutsideVaries(readFileSync(join(dir, f), "utf8")));
      it(`${kind}/${f}`, () => {
        const own = new Set(kind === "exposure" ? (ownContextExposures[f.replace(/\.tsx$/, "")] ?? []) : []);
        const bad = cites.get(file)!.filter((id) => rules.get(id)!.scope !== "general" && !own.has(id) && !notRuleAllowedIn(id, file));
        expect(bad.map((id) => `${id} (${rules.get(id)!.scope}: ${(rules.get(id)!.scope_institutions ?? []).map((n) => n.id).join(", ")})`)).toEqual([]);
      });
    }
  }
  // every site source file, not only the prose: the comparison (MKT-01) and the playbook (SW-X01 and the like) quote not-rules too
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const tracked = (id: string) => Object.hasOwn(notRules, id) && !!rules.get(id) && rules.get(id)!.scope !== "general";
  const quotes = new Map<string, Set<string>>();
  for (const f of walk(join(root, "site/app")).filter((x) => /\.tsx?$/.test(x) && !/\.test\.tsx?$/.test(x))) {
    const ids = [...code(readFileSync(f, "utf8")).matchAll(/["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g)].map((m) => m[1]!).filter(tracked);
    if (ids.length > 0) quotes.set(f.slice(root.length).split("\\").join("/"), new Set(ids));
  }
  it("a not-rule is quoted only in the site files its entry names", () => {
    const bad = [...quotes].flatMap(([file, ids]) => [...ids].filter((id) => !notRuleAllowedIn(id, file)).map((id) => `${id} in ${file}`));
    expect(bad).toEqual([]);
  });
  it("every site file a not-rule's entry names exists and still quotes it (the lists only shrink)", () => {
    const stale = Object.entries(notRules).flatMap(([id, e]) => (tracked(id) ? e.files.filter((f) => f.startsWith("site/") && (!existsSync(join(root, f)) || !quotes.get(f)?.has(id))).map((f) => `${id} in ${f}`) : []));
    expect(stale).toEqual([]);
  });
  it("a not-rule is allowed in its own files only", () => {
    expect(notRuleAllowedIn("IRA-28", "site/app/content/guide/ira-provident.tsx")).toBe(true);
    expect(notRuleAllowedIn("IRA-28", "site/app/content/guide/brokerage-account.tsx")).toBe(false);
    expect(notRuleAllowedIn("MKT-01", "site/app/content/guide/brokerage-account.tsx")).toBe(false);
  });
  it("a company's term inside VariesByCompany is not counted", () => {
    expect(citedOutsideVaries(`<VariesByCompany ids={["CS-30"]} lead="x" /> <RulesLine ids={["CS-18"]} />`)).toEqual(["CS-18"]);
    expect(citedOutsideVaries(`<VariesByCompany ids={[{ rule: "CS-30", companies: ["harel"] }]} lead="x" />`)).toEqual([]);
  });
  // the validator's rule for a wrapper's company_terms, in the prose (review, 2026-10-26): a record that names several companies rarely
  // states the property for all of them, so its entry names those it does ({ rule, companies })
  it("a VariesByCompany record that names several companies says which", () => {
    const bare: string[] = [];
    for (const [file] of cites) {
      const src = readFileSync(join(root, file), "utf8");
      for (const m of src.matchAll(/<VariesByCompany\b[^>]*\/>/g)) {
        for (const id of [...m[0].matchAll(/(?<!rule:\s*)["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g)].map((x) => x[1]!)) if ((rules.get(id)?.scope_institutions ?? []).length > 1) bare.push(`${id} in ${file}`);
      }
    }
    expect(bare).toEqual([]);
  });
});

describe("scope helpers", () => {
  const harel = { id: "harel", name_he: "הראל" };
  const as = { id: "altshuler-shaham", name_he: "אלטשולר שחם" };
  const more = (n: number) => `ועוד ${n}`;
  it("names the chip by the page's company, else the first and the count of the others", () => {
    const own = { "X-1": ["harel", "altshuler-shaham"], "X-2": ["harel"] };
    expect(chipName({ id: "X-1", scope_institutions: [harel, as] }, own, "altshuler-shaham", more)).toBe("אלטשולר שחם");
    expect(chipName({ id: "X-1", scope_institutions: [harel, as] }, own, undefined, more)).toBe("הראל ועוד 1");
    expect(chipName({ id: "X-2", scope_institutions: [harel] }, own, undefined, more)).toBe("הראל");
    expect(chipName({ id: "X-3" }, own, undefined, more)).toBeNull();
  });
  it("the chip counts the companies the card names: those whose documents it cites, else all it is about (review, 2026-10-26)", () => {
    // PEN-37 names Meitav among five, but cites no document of Meitav: the chip says "ועוד 3", not "ועוד 4", as its card names four
    const pen37 = rules.get("PEN-37")! as unknown as RuleRecord;
    const own = ownDocuments(Object.fromEntries([...rules].map(([id, r]) => [id, r as unknown as RuleRecord])));
    const shown = shownCompanies(pen37, own).map((c) => c.id);
    expect(shown).not.toContain("meitav");
    expect(chipName(pen37, own, undefined, more)).toBe(`${pen37.scope_institutions![0]!.name_he} ועוד ${shown.length - 1}`);
    // a press report about two companies cites neither's document: it is about both
    expect(shownCompanies(rules.get("IRA-28")! as unknown as RuleRecord, own).map((c) => c.id)).toEqual(["slice", "globalnet"]);
  });
  it("drops 'לפי החברה' only on a source on the named company's own sites (D31; review, 2026-10-26)", () => {
    const all = Object.fromEntries([...rules].map(([id, r]) => [id, r as unknown as RuleRecord]));
    const own = ownDocuments(all);
    const links = companyLinks();
    const brk43 = all["BRK-43"]!;
    // Interactive Brokers' term cites IB Ireland's page: Ireland's, not Interactive Brokers' own
    const ie = brk43.sources!.find((x) => x.url.includes("interactivebrokers.ie"))!;
    const com = brk43.sources!.find((x) => x.url.includes("interactivebrokers.com"))!;
    expect(isOwnSourceOf(brk43, ie, own, links)).toBe(false);
    expect(isOwnSourceOf(brk43, com, own, links)).toBe(true);
    // BlackRock's term cites ishares.com, BlackRock's own fund brand site
    const etf27 = all["ETF-27"]!;
    for (const x of etf27.sources!) expect(isOwnSourceOf(etf27, x, own, links), x.url).toBe(true);
  });
  it("joins Hebrew names with ו before the last, and a maqaf before a Latin one", () => {
    expect(joinNames(["הראל"])).toBe("הראל");
    expect(joinNames(["הראל", "אלטשולר שחם"])).toBe("הראל ואלטשולר שחם");
    expect(joinNames(["לאומי", "יהב", "מסד"])).toBe("לאומי, יהב ומסד");
    expect(joinNames(["אי.בי.אי", "iShares"])).toBe("אי.בי.אי ו־iShares");
  });
  it("keeps general ids and ids with no record, drops a company's term", () => {
    expect(generalOnly(["A-1", "B-2", "C-3"], { "A-1": { scope: "general" }, "B-2": { scope: "institution" } })).toEqual(["A-1", "C-3"]);
  });
  it("sends a company's term to its card on the first listing company's page, else its group, else the not-rules' group", () => {
    const companies = { harel: { name: "הראל", href: "/companies/512267592", hasPage: true }, msci: { name: "MSCI", href: "/companies#terms-msci", hasPage: false } };
    const own = { "CS-30": ["harel"], "ETF-48": ["msci"], "IRA-28": [] };
    expect(companyTermsHref({ id: "CS-30", scope: "institution", scope_institutions: [harel] }, companies, own)).toBe("/companies/512267592#CS-30");
    expect(companyTermsHref({ id: "ETF-48", scope: "institution", scope_institutions: [{ id: "msci", name_he: "MSCI" }] }, companies, own)).toBe("/companies#terms-msci");
    expect(companyTermsHref({ id: "SW-34", scope: "unsettled" }, companies, own)).toBe("/companies#terms-none");
    // a press report about a company is not its own document, and a not-rule is never listed: both go to the not-rules' group
    expect(companyTermsHref({ id: "IRA-28", scope: "institution", scope_institutions: [harel] }, companies, own)).toBe("/companies#terms-none");
    expect(companyTermsHref({ id: "MKT-01", scope: "institution", scope_institutions: [harel] }, companies, { "MKT-01": ["harel"] })).toBe("/companies#terms-none");
  });
  it("names only the companies whose own documents a record cites", () => {
    const own = { "PEN-37": ["harel"] };
    expect(ownDocCompanies({ id: "PEN-37", scope_institutions: [harel, as] }, own)).toEqual([harel]);
    expect(listedCompanies({ id: "PEN-37", scope: "unsettled", scope_institutions: [harel, as] }, own)).toEqual([harel]);
    expect(listedCompanies({ id: "TXS-09", scope: "general" }, own)).toEqual([]);
  });
});

// review, 2026-10-26: IRA-28 (a regulator's announcement and press articles) sat on Slice's and Globalnet's pages, SW-X01 (one forum
// post) on Migdal's and Clal's, each under "מה כתוב במסמכים של …" with "נמצא במסמכים של …"
describe("a company's section holds only records from its own documents", () => {
  const all = Object.fromEntries([...rules].map(([id, r]) => [id, r as unknown as RuleRecord]));
  const registry = new Map(loadInstitutionRegistry().map((r) => [r.id, r]));
  const own = ownDocuments(all);
  const topic = (f: string) => f;
  const sectionIds = (registryIds: string[]) => companyTermGroups(registryIds, all, topic, own).flatMap((g) => g.ids);
  it("a source is a company's own document by its site or its filing, never a newspaper, a forum or a regulator's page about it", () => {
    const harelRow = registry.get("harel")!;
    expect(isOwnDocument({ url: "https://www.harel-group.co.il/x.pdf", title: "x" }, harelRow)).toBe(true);
    expect(isOwnDocument({ url: "https://media.harel-group.co.il/x.pdf", title: "x" }, harelRow)).toBe(true);
    expect(isOwnDocument({ url: "https://www.bizportal.co.il/a", title: "הראל" }, harelRow)).toBe(false);
    const funds = registry.get("harel-funds")!;
    expect(isOwnDocument({ url: "https://mayafiles.tase.co.il/rpdf/1/P1-00.pdf", title: "הראל, דוח שנתי" }, funds)).toBe(true);
    expect(isOwnDocument({ url: "https://mayafiles.tase.co.il/rpdf/1/P1-00.pdf", title: "קסם, דוח שנתי" }, funds)).toBe(false);
    // a filing on Maya is its filer's, not the exchange's
    expect(isOwnDocument({ url: "https://mayafiles.tase.co.il/rpdf/1/P1-00.pdf", title: "הראל, דוח שנתי" }, registry.get("tase")!)).toBe(false);
  });
  it("IRA-28 is not on Slice's or Globalnet's page, nor SW-X01 on Migdal's or Clal's", () => {
    for (const company of ["slice", "globalnet"]) expect(sectionIds(registryIdsOfPage(registry.get(company)!.cma_legal_id!))).not.toContain("IRA-28");
    for (const company of ["migdal", "clal"]) expect(sectionIds(registryIdsOfPage(registry.get(company)!.cma_legal_id!))).not.toContain("SW-X01");
  });
  it("no section lists a not-rule, and every record a section lists cites that company's own document", () => {
    const bad: string[] = [];
    for (const row of registry.values()) {
      for (const id of sectionIds([row.id])) {
        const r = rules.get(id)! as unknown as RuleRecord;
        if (Object.hasOwn(notRules, id)) bad.push(`${row.id}: ${id} is a not-rule`);
        if (!(r.sources ?? []).some((s) => isOwnDocument(s, row))) bad.push(`${row.id}: ${id} cites no document of ${row.id}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it("a record that is not general but is listed nowhere sits in the not-rules' group on /companies, and only a not-rule does", () => {
    const { companies, none } = noPageCompanyTerms(all, own);
    expect(none).toContain("IRA-28");
    expect(none).toContain("SW-X01");
    expect(none.filter((id) => !Object.hasOwn(notRules, id))).toEqual([]);
    expect(companies.flatMap((c) => c.ids).filter((id) => Object.hasOwn(notRules, id))).toEqual([]);
  });
});
