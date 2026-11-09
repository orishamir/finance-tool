// What the index page's render tests share (render.test.ts and the three files split from it): the collected data, one plan, and
// readers of the rendered markup.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { invest } from "../../copy";
import { buildIndicesBundle } from "../../lib/providers.server";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { LabelSheetHost } from "../kit";
import { ProvenanceProvider } from "../provenance";

export const bundle = buildIndicesBundle();
export const t = bundle.today;
export const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
};
export const data = { rules: {}, terms: {}, dimensions: {}, today: t };
/** What the reader sees: the page's text without the unseen longest cases that only hold a block's height (LongestCase). */
export const shown = (out: string) => out.replace(/<div aria-hidden="true" class="invisible">[\s\S]*?<\/div>/g, "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
/** A fund list row's own markup as the reader sees it, without the unseen cases laid out beside it. */
export const fundRow = (out: string, key: string) => { const a = out.indexOf(`data-pick-key="${key}"`); if (a < 0) return ""; const rest = out.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return shown(b < 0 ? rest : rest.slice(0, b)); };
export const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));
/** The whole shekels in a piece of markup's text: "1,043 ₪" is 1043, a minus sign negative. */
export function nisIn(markup: string): number {
  const m = /(−|-)?\s*([\d,]+)/.exec(shown(markup).replace(/[\u2066-\u2069\u200e\u200f]/g, ""));
  return m ? (m[1] ? -1 : 1) * Number(m[2]!.replace(/,/g, "")) : NaN;
}
/** Each md cost bar's written amounts by whose they are, as a reader adds them up: the fund's colour, the tax's, and the rest the account's. */
export function writtenBars(out: string) {
  return out.split(/data-total="/).slice(1).map((bar) => {
    const items = [...bar.split(/data-total="/)[0]!.matchAll(/inline-block size-2 rounded-\[2px\] (bg-[\w-]+)"><\/span><bdi dir="ltr">([\d,]+)<\/bdi>/g)].map((m) => ({ cls: m[1]!, n: Number(m[2]!.replace(/,/g, "")) }));
    const sum = (f: (c: string) => boolean) => items.filter((x) => f(x.cls)).reduce((a, x) => a + x.n, 0);
    return { account: sum((c) => c !== "bg-chart-cost-fund" && c !== "bg-chart-tax"), fund: sum((c) => c === "bg-chart-cost-fund"), tax: sum((c) => c === "bg-chart-tax"), order: items.map((x) => x.cls) };
  }).filter((b) => b.order.length > 0);
}
/** The three differences written under the pair bars, by their labels: "16 ₪ יותר" is 16, "פחות" negative, "בלי הפרש" 0. */
export function writtenGap(markup: string) {
  const w = invest.pair;
  const cells = [...markup.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => ({ label: shown(m[1]!).trim(), dd: m[2]! }));
  const of = (label: string | string[]) => {
    const dd = cells.find((x) => [label].flat().includes(x.label))?.dd ?? "";
    const text = shown(dd);
    if (text.includes(w.gapNone)) return 0;
    return nisIn(dd) * (text.includes(w.gapLess) ? -1 : 1);
  };
  return { account: of(w.gapPart.account), fund: of(w.gapPart.fund), tax: of([w.taxLine, w.taxLinePayouts]) };
}
