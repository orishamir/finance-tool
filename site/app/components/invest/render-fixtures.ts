// What the index page's render tests share (render.test.ts, the files split from it and render-pair-bars.pages.deep.test.ts): the collected
// data, one plan, and readers of the rendered markup.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { buildIndicesBundle } from "../../lib/providers.server";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { LabelSheetHost } from "../kit";
import { ProvenanceProvider } from "../provenance";
import { PairLists, type ListsProps } from "./lists";
import { allFunds, pickOfHeadline, type Pick } from "./pair";
import { DollarSection, useDollarCase } from "./dollar";
import { StairsSection, useStairs } from "./stairs";
import { PairReceipt } from "./receipt";
import { DealAccountsHost } from "./deal-account";
import type { IndicesBundle } from "../../lib/providers";
import { buildInvest, type IndexRef, type InvestView } from "../../lib/invest";
import type { ColumnAverage, HouseAverages } from "../../lib/house-averages";
import type { SiteValue } from "../../lib/value";

export const bundle = buildIndicesBundle();
export const t = bundle.today;
export const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
};
export const data = { rules: {}, terms: {}, dimensions: {}, today: t };
/** A figure of a house's averages, fixed, as the exchange's calculator prints one (F-122). */
const averageFigure = (value: number, unit: string): SiteValue => ({ value, unit, source: { url: "https://market.tase.co.il/he/market_data/trading_fees", title: "מחשבון עמלות מסחר", publisher: "Tel Aviv Stock Exchange", strength: "primary" }, checked: "2026-11-14", state: "sourced" }) as SiteValue;
const column = (fee: "trade" | "custody", securities: string, lo: number, hi: number): ColumnAverage => ({ column: { fee, securities }, lo: averageFigure(lo, fee === "trade" ? "pct_of_trade" : "pct_of_balance_per_year"), hi: averageFigure(hi, fee === "trade" ? "pct_of_trade" : "pct_of_balance_per_year") }) as ColumnAverage;
/** A house's every column, fixed: three of a trade and one of custody, so a fee's kind holds several columns or one. */
export const FIXED_AVERAGES: HouseAverages = {
  from: "2026-01-01",
  to: "2026-06-30",
  page: { url: "https://market.tase.co.il/he/market_data/trading_fees" },
  columns: [column("trade", "il_shares_bonds", 0.07, 0.08), column("trade", "il_makam", 0.05, 0.05), column("trade", "foreign", 0.12, 0.28), column("custody", "il", 0.02, 0.02)],
};
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

/**
 * `el` inside the page's deal popup host, its popup closed, as the page holds the lists and the receipt: a deal's pencil, a house's file
 * icon and the receipt's line that opens a house's terms are drawn only there.
 */
export const inHost = (el: React.ReactElement) =>
  createElement(DealAccountsHost, { data: null, onWant: () => undefined, failed: false, saved: [], writable: false, today: t, world: null, opening: null, onOpened: () => undefined, onOpenChange: () => undefined, onDeleted: () => undefined, left: [] }, el);

/** The two linked lists as the page shows them, with the heading block above them: the page's own pair unless `chosen`. */
export function lists(view: InvestView, b: IndicesBundle, p: WorkbenchInputs, pick: Pick, more: Partial<ListsProps> = {}) {
  return html(createElement(PairLists, { view, bundle: b, plan: p, livePlan: p, today: t, pick, chosen: false, onPick: () => undefined, moved: null, ...more }));
}

const planAt = (a: number, m: number, y: number, r: number): WorkbenchInputs => ({ ...plan, amountNow: a, monthly: m, years: y, grossReturn: r, values: { ...plan.values, amount: entered(a, "nis", t), monthly: entered(m, "nis_per_month", t), years: entered(y, "years", t), returnV: entered(r * 100, "pct_per_year", t) } });
/**
 * The sliders' ends and between. The movement script leaves each slider a quarter of the way along: on P-05's scales, 15,000 ₪ and 750 ₪ a
 * month (three quarters through the money sliders' first thirds), 11 years and 3%. A hedged fund picked at 125,000 ₪, 2,500 ₪ a month, 11
 * years and 3% puts the bar's total 1.46 ₪ off its one written part, which the rounding guard must take rather than throw on.
 */
const SLIDER_PLANS = [planAt(15000, 750, 11, 0.03), planAt(125000, 2500, 11, 0.03), planAt(500000, 10000, 40, 0.12), planAt(0, 100, 1, 0), planAt(1000, 0, 1, 0.07), planAt(250000, 5000, 21, 0.06)];

/**
 * Each fund of `index` picked beside the headline's house, at each plan of `SLIDER_PLANS`, whose receipt fails to render: the
 * fund, the plan (amount now, monthly, years, return) and the error.
 */
export function unrenderedAtSliders(index: IndexRef): string[] {
  const out: string[] = [];
  for (const p of SLIDER_PLANS) {
    const view = buildInvest({ bundle, index, plan: p });
    const head = pickOfHeadline(view);
    if (!head) continue;
    for (const f of allFunds(view)) {
      const pick = { house: head.house, fund: f.rec.id };
      try {
        html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: true }));
      } catch (e) {
        out.push(`${index.id} ${f.rec.id} ${p.amountNow}/${p.monthly}/${p.years}/${p.grossReturn}: ${(e as Error).message}`);
      }
    }
  }
  return out;
}
