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
import { AccountColumn, FundColumn, PairResult, pickOfHeadline } from "./pair";
import { Foot, Steps } from "./steps";
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
      createElement(FundColumn, { view, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined }),
      createElement(Steps, { view, monthly: plan.values.monthly, pick }), createElement(Foot, { view }),
      createElement(PlanBlock, { items: [], onOpen: () => undefined, fx: bundle.fx, today: t, hasGoal: true })));
    expect(out).toContain("הפקדתם");
    expect(out).toContain("★ הזוג הזול ביותר לתוכנית שלכם");
    expect(out).toContain("כמה זה עולה לכם ב־20 שנים, בכל אחד מהזוגות");
    expect(out).toContain("כל החשבונות");
    expect(out).toContain("כל הקרנות על");
    expect(out).toContain("הבחירה");
    expect(out).toContain("פסגות");
    expect(out).toContain("שער הדולר");
  });
  it("neither list leaves a row out: every account and every fund is listed, priced or with its reason", () => {
    const pick = pickOfHeadline(view)!;
    const out = html(createElement("div", null, createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined }), createElement(FundColumn, { view, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined })));
    for (const p of view.providers) expect(out).toContain(p.short);
    for (const f of view.options.filter((o) => o.exists).flatMap((o) => o.funds)) expect(out).toContain(f.number);
  });
  it("a custom index: empty funds state with the request button", () => {
    const v = buildInvest({ bundle, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement("div", null, createElement(Headline, { view: v }), createElement(FundsSection, { view: v, houseId: v.houses.find((h) => h.generic)?.provider.id ?? null, onHouse: () => undefined, mayaHref: "https://maya.tase.co.il" }), createElement(Steps, { view: v, monthly: plan.values.monthly })));
    expect(out).toContain("עוד לא נאספו קרנות על המדד הזה");
    expect(out).toContain("בקשו שנאסוף");
    expect(out).toContain("חשבון ניירות הערך הזול ביותר לקרן ישראלית על המדד");
  });
});
