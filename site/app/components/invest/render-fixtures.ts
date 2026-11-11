// What the index page's render tests share (render.test.ts and the three files split from it): the collected data, one plan, and
// readers of the rendered markup.
import { createElement, Fragment } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { invest } from "../../copy";
import { buildIndicesBundle } from "../../lib/providers.server";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { LabelSheetHost } from "../kit";
import { ProvenanceProvider } from "../provenance";
import { PairLists, type ListsProps } from "./lists";
import { type OnPick, type Pick } from "./pair";
import { FeesPanel } from "./before";
import { DollarSection, useDollarCase } from "./dollar";
import { StairsSection, useStairs } from "./stairs";
import { PairReceipt } from "./receipt";
import type { IndicesBundle } from "../../lib/providers";
import type { InvestView } from "../../lib/invest";

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
/** The fees panel's items as the reader sees them: each amount written past its bar, and whose it is by the line under its name. */
export function writtenFees(out: string) {
  const list = out.slice(out.indexOf('data-chart="option-bars"'));
  const items = [...list.split("</ul>")[0]!.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => {
    const cells = m[1]!;
    const sub = shown(cells.split('<span class="relative')[0]!.split('<span class="text-xs text-muted-foreground">')[1] ?? "");
    const amount = nisIn(cells.slice(cells.lastIndexOf('<span class="ms-2')));
    return { who: sub.startsWith(invest.receipt.parts.fund) ? ("fund" as const) : ("account" as const), amount };
  });
  return items;
}

/** The receipt in the side rail, then the fees panel under the lists (where the fees go, and the
 * pair set beside it). */
export function ReceiptAndFees({ view, bundle: b, plan: p, pick, chosen, onPick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; chosen: boolean; onPick: OnPick }) {
  return createElement(Fragment, null, createElement(PairReceipt, { view, bundle: b, plan: p, pick, chosen }), createElement(FeesPanel, { view, bundle: b, plan: p, pick, chosen, onPick }));
}

/** The hedged-or-not panel as its tab opens it, with what it rests on read as the page reads it. */
export function DollarFor({ view, bundle: b, plan: p, pick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick }) {
  const d = useDollarCase(view, b, p, pick);
  return d ? createElement(DollarSection, { view, bundle: b, plan: p, d }) : null;
}

/** The stairs panel as its tab opens it. */
export function StairsFor({ view, bundle: b, plan: p, startHouse, startFund, example }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; startHouse: string | null; startFund: string | null; example: boolean }) {
  const s = useStairs({ view, bundle: b, plan: p, startHouse, startFund, example });
  return s ? createElement(StairsSection, { view, bundle: b, s }) : null;
}

/** The two linked lists as the page shows them, with the heading block above them: the page's own pair unless `chosen`. */
export function lists(view: InvestView, b: IndicesBundle, p: WorkbenchInputs, pick: Pick, more: Partial<ListsProps> = {}) {
  return html(createElement(PairLists, { view, bundle: b, plan: p, livePlan: p, today: t, pick, chosen: false, onPick: () => undefined, moved: null, group: null, ...more }));
}
