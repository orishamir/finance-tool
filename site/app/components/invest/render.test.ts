// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { buildInvest, indexById, refOfCustom } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { BrokerGrid } from "./grid";
import { FundsSection } from "./funds";
import { LabelSheetHost } from "./parts";
import { Headline, IndexHeader, Options, Worth } from "./sections";
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
  it("all sections of a known index", () => {
    const out = html(createElement("div", null,
      createElement(IndexHeader, { view, onChangeAnswer: null }),
      createElement(Headline, { view }), createElement(Worth, { view }),
      createElement(Options, { view, selected: "il-etf", onSelect: () => undefined }),
      createElement(BrokerGrid, { view }),
      createElement(FundsSection, { view, optionId: "il-tracking", mayaHref: null }),
      createElement(FundsSection, { view, optionId: "abroad", mayaHref: null }),
      createElement(Steps, { view, monthly: plan.values.monthly }), createElement(Foot, { view }),
      createElement(PlanBlock, { items: [], onOpen: () => undefined, fx: bundle.fx, today: t, brokers: [], yourBroker: null, onBroker: () => undefined, hasGoal: true })));
    expect(out).toContain("הדרך הזולה ביותר לתוכנית שלכם");
    expect(out).toContain("פסגות");
    expect(out).toContain("לא זמין");
    expect(out).toContain("קרן מחקה ישראלית");
    expect(out).toContain("שער הדולר");
  });
  it("a custom index: empty funds state with the request button", () => {
    const v = buildInvest({ bundle, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement("div", null, createElement(Headline, { view: v }), createElement(FundsSection, { view: v, optionId: "il-etf", mayaHref: "https://maya.tase.co.il" }), createElement(Steps, { view: v, monthly: plan.values.monthly })));
    expect(out).toContain("עוד לא נאספו קרנות על המדד הזה");
    expect(out).toContain("בקשו שנאסוף");
    expect(out).toContain("בית ההשקעות הזול ביותר לקרן ישראלית על המדד");
  });
});
