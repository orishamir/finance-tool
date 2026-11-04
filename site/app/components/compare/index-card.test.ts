// The securities account's card over the indices renders (D27): before a choice a range and no index named in the line, after a choice the cheapest way and the link.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { compareBundle } from "../../lib/compare.server";
import { applyIndex, planOfGoal } from "../../lib/compare-index";
import { knownIndices } from "../../lib/invest";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import type { RunGoal } from "../../lib/compare";
import { ProvenanceProvider } from "../provenance";
import { IndexCard } from "./index-card";

const bundle = compareBundle();
const wb = buildWorkbenchBundle();
const BRK = "brokerage-account";
const founder: RunGoal = { horizonYears: 20, amountNow: 6_000, monthly: 400, available: 0, anytime: false, returnPct: 7, inflationPct: 2, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const known = knownIndices(wb).map((i) => ({ id: i.id, name: i.name }));
const data = { rules: {}, terms: {}, dimensions: {}, today: wb.today };
const html = (g: RunGoal) => {
  const o = applyIndex(bundle, wb, planOfGoal(bundle, g, { entered: {}, age: null, employment: null }), g);
  const chosenId = o.reading?.kind === "chosen" ? o.reading.index.id : undefined;
  return renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(IndexCard, { reading: o.reading, ranked: o.ranked, known, chosenId, onChoose: () => undefined }) })));
};

describe("the account's index card", () => {
  it("before a choice: the range sentence, the ranking line and the chips; no 'cheapest way' line, no link to an index", () => {
    const out = html(founder);
    expect(out).toContain("לפי המדד שתבחרו");
    expect(out).toContain("האתר לא ממליץ על מדד");
    expect(out).not.toContain("הדרך הזולה:");
    expect(out).not.toContain("/indices/");
    for (const i of known) expect(out).toContain(i.name.replace(/&/g, "&amp;").replace(/"/g, "&quot;"));
  });
  it("after a choice: the cheapest way and the link to all ways with the index", () => {
    const out = html({ ...founder, ownIndices: { [BRK]: "index-sp500" } });
    expect(out).toContain("הדרך הזולה:");
    expect(out).toContain("פסגות");
    expect(out).toContain("כל הדרכים להשקיע במדד");
    expect(out).toContain('href="/indices/sp500"');
    expect(out).toContain("לבטל את בחירת המדד");
  });
});
