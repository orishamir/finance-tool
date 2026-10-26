// D30 on the site (research/specs/2026-10-25-rules-scope/spec.md §4): a guide or exposure page cites general rules only. The
// validator checks the records under data/ (wrappers, exposures, P-09); this checks the prose modules, where a rule id is written by
// hand. A company's term may appear only inside `<VariesByCompany ids={[…]}>` (the "תלוי בחברה" links), and an index page may cite
// its index provider's own rulebook (D31). The records the rule base keeps that are not rules are skipped by name (`notRules`).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { notRules, ownContextExposures } from "@finance-tool/schema";
import { chipName, companyTermsHref, generalOnly, joinNames } from "./scope";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const rules = new Map<string, { scope: string; scope_institutions?: { id: string; name_he: string }[] }>();
for (const f of readdirSync(join(root, "data/rules")).filter((x) => x.endsWith(".json"))) {
  const r = JSON.parse(readFileSync(join(root, "data/rules", f), "utf8"));
  rules.set(r.id, r);
}

function citedOutsideVaries(src: string): string[] {
  const without = src.replace(/<VariesByCompany\b[^>]*\/>/g, "");
  return [...new Set([...without.matchAll(/["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g)].map((m) => m[1]!))].filter((id) => rules.has(id));
}

describe("guide and exposure prose cites general rules only", () => {
  for (const kind of ["guide", "exposure"] as const) {
    const dir = join(root, "site/app/content", kind);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx") && x !== "index.tsx" && x !== "types.tsx")) {
      it(`${kind}/${f}`, () => {
        const own = new Set(kind === "exposure" ? (ownContextExposures[f.replace(/\.tsx$/, "")] ?? []) : []);
        const bad = citedOutsideVaries(readFileSync(join(dir, f), "utf8")).filter((id) => {
          const r = rules.get(id)!;
          if (r.scope === "general" || Object.hasOwn(notRules, id)) return false;
          const names = r.scope_institutions ?? [];
          return !(names.length > 0 && names.every((n) => own.has(n.id)));
        });
        expect(bad.map((id) => `${id} (${rules.get(id)!.scope}: ${(rules.get(id)!.scope_institutions ?? []).map((n) => n.id).join(", ")})`)).toEqual([]);
      });
    }
  }
  it("a company's term inside VariesByCompany is not counted", () => {
    expect(citedOutsideVaries(`<VariesByCompany ids={["CS-30"]} lead="x" /> <RulesLine ids={["CS-18"]} />`)).toEqual(["CS-18"]);
  });
});

describe("scope helpers", () => {
  const harel = { id: "harel", name_he: "הראל" };
  const as = { id: "altshuler-shaham", name_he: "אלטשולר שחם" };
  const more = (n: number) => `ועוד ${n}`;
  it("names the chip by the page's company, else the first and the count of the others", () => {
    expect(chipName({ scope_institutions: [harel, as] }, "altshuler-shaham", more)).toBe("אלטשולר שחם ועוד 1");
    expect(chipName({ scope_institutions: [harel, as] }, undefined, more)).toBe("הראל ועוד 1");
    expect(chipName({ scope_institutions: [harel] }, undefined, more)).toBe("הראל");
    expect(chipName({}, undefined, more)).toBeNull();
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
  it("sends a company's term to its card on the first company page, else the company's group, else the group of none", () => {
    const companies = { harel: { name: "הראל", href: "/companies/512267592", hasPage: true }, msci: { name: "MSCI", href: "/companies#terms-msci", hasPage: false } };
    expect(companyTermsHref({ id: "CS-30", scope_institutions: [harel] }, companies)).toBe("/companies/512267592#CS-30");
    expect(companyTermsHref({ id: "ETF-48", scope_institutions: [{ id: "msci", name_he: "MSCI" }] }, companies)).toBe("/companies#terms-msci");
    expect(companyTermsHref({ id: "SW-34" }, companies)).toBe("/companies#terms-none");
  });
});
