import { describe, expect, it } from "vitest";
import { loadRuleUses, ruleProducts, ruleScores, ruleUseOf, scoreOf } from "./rule-uses.server";
import { feeDeal } from "../copy";
import { loadProducts } from "./data.server";
import { RULES } from "./fee-deal/offers/rules";
import { ACCOUNT_CAP_RULES, IDLE_AT_BANK } from "./fee-deal/charts";
import { STATED_RULES } from "./fee-deal/reading";
import { loadCma } from "./data.server";
import { loader as companyLoader } from "../routes/company";
import { loader as trackLoader } from "../routes/track";
import { loader as bondGuideLoader } from "../routes/guide-limited-bond-fund";

describe("rule uses", () => {
  it("TXI-03 is read by the engine and shown on at least one page", () => {
    const u = ruleUseOf("TXI-03");
    expect(u.engine).toBe(true);
    expect(u.pages.length).toBeGreaterThan(0);
    expect(u.pages.every((p) => p.href.startsWith("/") && p.label.length > 0)).toBe(true);
  });
  it("the fee page is a use of the rules its products' caps cite, its rule table cites, its reading states and its cap flags: a cap of one product opens a new deal of it, any other the page as it is", () => {
    const fees = Object.entries(loadRuleUses()).flatMap(([id, u]) => u.pages.filter((p) => p.label === feeDeal.title).map((p) => ({ id, href: p.href })));
    const capRules = new Set(loadProducts().flatMap((w) => (w.fee_bases_allowed.length > 0 ? Object.values(w.fee_caps ?? {}).flatMap((c) => c?.rule_ids ?? []) : [])));
    expect(fees.length).toBeGreaterThan(0);
    const tableRules = new Set([...RULES.flatMap((r) => r.cite), ...IDLE_AT_BANK, ...ACCOUNT_CAP_RULES, ...Object.values(STATED_RULES).flat()]);
    expect(fees.filter((f) => !capRules.has(f.id) && !tableRules.has(f.id))).toEqual([]);
    expect(fees.some((f) => /^\/deal\?wrapper=[a-z-]+$/.test(f.href))).toBe(true);
    for (const f of fees) if (f.href !== "/deal") expect(ruleProducts()[f.id]).toContain(f.href.split("=")[1]);
  });
  it("an unknown id has no uses", () => {
    expect(ruleUseOf("ZZZ-99")).toMatchObject({ pages: [], engine: false, collections: {}, score: 0 });
    expect(loadRuleUses(["ZZZ-99"])).toEqual({});
  });
  it("every rule has a score", () => {
    const s = ruleScores();
    expect(Object.keys(s).length).toBeGreaterThan(400);
    expect(s["TXG-02"]!).toBeGreaterThan(0);
  });
  it("scores as the spec says", () => {
    expect(scoreOf({ figures: { a: { value: 1 } as never }, il_finance_file: "tax-general.md", strength: "primary", likely_to_change: "yes" }, 2, 3, 4)).toBe(6 + 3 + 4 + 2 + 1 + 1 + 1);
    expect(scoreOf({ il_finance_file: "corporate-bonds.md", strength: "secondary", likely_to_change: "no" }, 0, 0, 0)).toBe(0);
  });
  it("a page's uses name every rule it can open a card of, its own and the records its cards point at, and no other (a product guide, a company page, a track page)", async () => {
    const keys = (d: { rules: Record<string, unknown>; pointed: Record<string, unknown>; ruleUses: Record<string, unknown> }) => ({ uses: Object.keys(d.ruleUses).sort(), drawn: [...new Set([...Object.keys(d.rules), ...Object.keys(d.pointed)])].sort() });
    const guide = keys(await bondGuideLoader());
    expect(guide.drawn.length).toBeGreaterThan(0);
    expect(guide.uses).toEqual(guide.drawn);
    const cma = loadCma();
    const company = (await companyLoader({ params: { id: (cma.companies[0] ?? { id: "" }).id } } as never)) as { kind: string; companyTerms?: Parameters<typeof keys>[0] };
    if (company.kind !== "company" || !company.companyTerms) throw new Error("the first CMA company has no company page");
    const c = keys(company.companyTerms);
    expect(c.drawn.length).toBeGreaterThan(0);
    expect(c.uses).toEqual(c.drawn);
    const t = cma.tracks[0];
    if (!t) throw new Error("the CMA data has no track");
    const track = keys(await trackLoader({ params: { id: t.companyId, fund: String(t.fundId) } } as never));
    expect(track.drawn.length).toBeGreaterThan(0);
    expect(track.uses).toEqual(track.drawn);
  }, 120000);
});
