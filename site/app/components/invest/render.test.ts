// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { buildInvest, indexById, refOfCustom } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { HousesSection } from "./houses";
import { FundsSection } from "./funds";
import { LabelSheetHost } from "../kit";
import { Headline, IndexHeader } from "./sections";
import { AccountColumn, allFunds, bestFor, FundColumn, PairResult, pickOfHeadline } from "./pair";
import { Foot } from "./foot";
import { PlanBlock } from "./chips";
import { ProvenanceProvider } from "../provenance";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
};
const data = { rules: {}, terms: {}, dimensions: {}, today: t };
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));

describe("the pair set beside the person's (2026-10-28)", () => {
  const world = buildInvest({ bundle, index: indexById(bundle, "index-msci-world")!, plan });
  const valueOf = (p: { house: string; fund: string }) => {
    const at = allFunds(world).find((f) => f.rec.id === p.fund)!.byHouse[p.house]!;
    return "valueN" in at ? at.valueN : NaN;
  };
  it("an unhedged pick is set beside the headline; a hedged pick beside the best hedged pair, never one that leaves less", () => {
    const head = pickOfHeadline(world)!;
    expect(bestFor(world, head)).toEqual(head);
    const hedged = allFunds(world).find((f) => f.rec.hedged === true && f.best)!;
    const pick = { house: head.house, fund: hedged.rec.id };
    const best = bestFor(world, pick)!;
    expect(allFunds(world).find((f) => f.rec.id === best.fund)!.rec.hedged).toBe(true);
    expect(valueOf(best)).toBeGreaterThanOrEqual(valueOf(pick));
  });
});

describe("the index page's sections render", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: { ...plan, returnFromParameter: true }, yourBroker: "leumi" });
  it("all sections of a known index: the result and the two linked lists", () => {
    const pick = pickOfHeadline(view)!;
    const leumi = { house: "leumi", fund: pick.fund };
    const out = html(createElement("div", null,
      createElement(IndexHeader, { view, onChangeAnswer: null }),
      createElement(PairResult, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick, onPick: () => undefined }),
      createElement(PairResult, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick: leumi, onPick: () => undefined }),
      createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined }),
      createElement(FundColumn, { view, bundle, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined }),
      createElement(Foot, { view }),
      createElement(PlanBlock, { knobs: null, onOpen: () => undefined, fx: bundle.fx, today: t, example: true, dollar: true })));
    expect(out).toContain("הפקדתם");
    // a dollar index with funds of both kinds shows each kind across the dollar (F-94, 2026-10-29)
    expect(out).toContain("בלי נטרול מט״ח");
    expect(out).toContain("עם נטרול מט״ח");
    expect(out).toContain("אם השער לא משתנה");
    expect(out).toContain("מול המדד");
    expect(out).toContain("כמה זה עולה לכם ב־20 שנים, בכל אחד מהזוגות");
    expect(out).toContain("כל החשבונות");
    expect(out).toContain("כל הקרנות על");
    expect(out).toContain("הבחירה");
    expect(out).toContain("פסגות");
    expect(out).toContain("שער הדולר");
    expect(out).toContain("אינפלציה");
    expect(out).toContain("לדוגמה של האתר");
  });
  it("an Israeli index keeps the pair beside the cheapest one (no kinds)", () => {
    const ta = buildInvest({ bundle, index: indexById(bundle, "index-ta125")!, plan: { ...plan, returnFromParameter: true } });
    const pick = pickOfHeadline(ta)!;
    const out = html(createElement(PairResult, { view: ta, bundle, plan: { ...plan, returnFromParameter: true }, pick: { ...pick, house: "leumi" }, onPick: () => undefined }));
    expect(out).toContain("★ הזוג הזול ביותר לתוכנית שלכם");
    expect(out).not.toContain("עם נטרול");
  });
  it("neither list leaves a row out: every account and every fund is listed, priced or with its reason", () => {
    const pick = pickOfHeadline(view)!;
    const out = html(createElement("div", null, createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined }), createElement(FundColumn, { view, bundle, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined })));
    for (const p of view.providers) expect(out).toContain(p.short);
    for (const f of view.options.filter((o) => o.exists).flatMap((o) => o.funds)) expect(out).toContain(f.number);
  });
  it("a custom index: empty funds state with the request button", () => {
    const v = buildInvest({ bundle, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement("div", null, createElement(Headline, { view: v }), createElement(FundsSection, { view: v, houseId: v.houses.find((h) => h.generic)?.provider.id ?? null, onHouse: () => undefined, mayaHref: "https://maya.tase.co.il" })));
    expect(out).toContain("עוד לא נאספו קרנות על המדד הזה");
    expect(out).toContain("בקשו שנאסוף");
    expect(out).toContain("חשבון ניירות הערך הזול ביותר לקרן ישראלית על המדד");
  });
});

describe("every house keeps a row in the account list (founder, 2026-10-31)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  const out = html(createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined }));
  it("lists Meitav Trade and both Interactives, told apart as no data and not possible there", () => {
    for (const p of view.providers) expect(out).toContain(p.short.replace(/"/g, "&quot;"));
    expect(out).toContain("אין נתון");
    // what a house's documents leave open is no data; only what they say is closed reads as not possible
    const etf = view.options.find((o) => o.id === "il-etf")!.funds[0]!;
    const closed = html(createElement(AccountColumn, { view, bundle, years: 20, pick: { ...pick, fund: etf.rec.id }, onPick: () => undefined }));
    expect(closed).toContain("לא אפשרי שם");
  });
  it("links a fund to its Maya page at the address that exists", () => {
    const fund = html(createElement(FundColumn, { view, bundle, plan, today: t, pick, onPick: () => undefined, filter: [], onFilter: () => undefined } as never));
    expect(fund).not.toContain("funds/etfs");
    expect(fund).toContain("maya.tase.co.il/he/funds/mutual-funds/");
  });
});

describe("no price on what no document says can be done (2026-10-31)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const at = (option: string, house: string) => view.options.find((o) => o.id === option)!.funds.map((f) => f.byHouse[house]!);
  it("PEPPER prices no fund and Interactive Brokers nothing on Tel Aviv: grey as no data, not as not possible", () => {
    for (const x of [...at("il-tracking", "pepper"), ...at("il-etf", "pepper"), ...at("il-etf", "interactive-brokers")]) {
      expect("valueN" in x).toBe(false);
      expect("availability" in x && x.availability).toBeFalsy();
    }
  });
  it("a house whose document names funds abroad is priced there, on the row that names them", () => {
    for (const house of ["hapoalim", "yahav"]) for (const x of at("abroad", house)) expect("valueN" in x).toBe(true);
  });
  it("One Zero prices tracking funds, not ETFs, and no fund traded outside the US", () => {
    for (const x of at("il-tracking", "one-zero")) expect("valueN" in x).toBe(true);
    for (const x of at("il-etf", "one-zero")) expect("valueN" in x).toBe(false);
    const uk = view.options.find((o) => o.id === "abroad")!.funds.find((f) => /UCITS/.test(f.rec.names.en[0] ?? ""));
    if (uk) expect("valueN" in uk.byHouse["one-zero"]!).toBe(false);
  });
  it("Fair still prices tracking funds and no ETF", () => {
    for (const x of at("il-tracking", "fair")) expect("valueN" in x).toBe(true);
    for (const x of at("il-etf", "fair")) expect("availability" in x && x.availability).toBeTruthy();
  });
});
