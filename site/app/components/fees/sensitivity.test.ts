// "8.17 שנים" in "what would change the conclusion" read as oddly precise. Checked on the rendered panel of the
// fee page over several plans: every point where the conclusion changes is said as a reader means it (readerRound), and its sheet keeps the
// exact point.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { r3fees } from "../../copy";
import { compareBundle } from "../../lib/compare.server";
import { buildFeesData } from "../../lib/fees.server";
import { buildFees, feeInputs, feeSensitivity, type FeesResult } from "../../lib/fees";
import { FeeSensitivityPanel } from "./sensitivity";
import { verdictWord } from "./parts";

const bundle = compareBundle();
const data = buildFeesData();
const plans: Record<string, number>[] = [{}, { amount_now: 60_000, monthly_deposit: 0, horizon_years: 10 }, { amount_now: 300_000, monthly_deposit: 3_000, horizon_years: 25 }];

function sentences() {
  const out: { page: string; text: string }[] = [];
  for (const entered of plans) {
    const inputs = feeInputs(bundle, null, { entered, age: null, employment: null });
    for (const id of ["kupat-gemel-lehashkaa", "keren-hishtalmut", "brokerage-account"]) {
      const r: FeesResult = buildFees(bundle, data, { kind: "wrapper", wrapperId: id }, inputs);
      if (r.kind !== "ok") continue;
      const view = feeSensitivity(r.args, r.analysis, r.args.runBundle);
      const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(FeeSensitivityPanel, { view, an: r.analysis, bundle, onOpen: () => {}, wordOf: verdictWord })));
      const items = html.split(/<li[ >]/).slice(1).map((li) => li.replace(/<[^>]+>/g, "").replace(/\s+/g, " "));
      for (const t of items) out.push({ page: `${id} ${JSON.stringify(entered)}`, text: t });
    }
  }
  return out;
}

// the fee rows are the only percent rows that flip on these plans; a fee is said in tenths of a percent
const isReader = (n: number) => (n >= 0.1 ? Math.abs(n * 10 - Math.round(n * 10)) < 1e-9 : true);

describe("the fee page's sensitivity says a point where the conclusion changes as a reader means it", () => {
  const all = sentences();
  const flips = all.filter((s) => s.text.includes(r3fees.sens.flipVerdict[1]!));

  it("the check is not empty", () => {
    expect(flips.length).toBeGreaterThan(0);
  });

  it("the value it lands on, the first figure after 'ב־', is whole years (halves under 3) or a rounded percent", () => {
    for (const f of flips) {
      const at = f.text.split(r3fees.sens.flipVerdict[1]!)[0]!;
      const years = at.match(/([\d.]+) שנים/);
      const pct = at.match(/([\d.]+)%/);
      const n = Number((years ?? pct)?.[1]);
      expect(Number.isFinite(n), `${f.page}: ${f.text}`).toBe(true);
      if (years) expect(n >= 3 ? Number.isInteger(n) : Number.isInteger(n * 2), `${f.page}: ${f.text}`).toBe(true);
      else expect(isReader(n), `${f.page}: ${f.text}`).toBe(true);
    }
  });
});
