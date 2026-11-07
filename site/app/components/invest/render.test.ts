// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { feeAbsent } from "../../lib/providers";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { paybackMayLower, pricedVariable, buildInvest, doubtOf, gapListFor, indexById, indexSeenBy, knownIndices, refOfCustom } from "../../lib/invest";
import { brokerLabels, fundLabels, optionLabels } from "../../lib/labels";
import { entered, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import type { WorkbenchInputs } from "../../lib/providers";
import { Fees } from "./funds";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "./no-fund";
import { LabelSheetHost } from "../kit";
import { IndexHeader } from "./sections";
import { AccountColumn, allFunds, bestFor, crowned, FundColumn, GapCell, gapKindOf, gapNoteOf, gapStateOf, gapValue, PairResult, pickOfHeadline, tieCount, tieFunds } from "./pair";
import { tieShareOf } from "../../lib/invest";
import { Foot } from "./foot";
import { Terms } from "./custom-entries";
import { DollarSection } from "./dollar";
import { hasKinds, kindOf } from "../../lib/invest";
import { PlanBlock } from "./chips";
import { StairsSection } from "./stairs";
import { ProvenanceProvider, ValueSheet } from "../provenance";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 20, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: true, returnFromParameter: false,
};
const data = { rules: {}, terms: {}, dimensions: {}, today: t };
/** What the reader sees: the page's text without the unseen longest cases that only hold a block's height (LongestCase). */
const shown = (out: string) => out.replace(/<div aria-hidden="true" class="invisible">[\s\S]*?<\/div>/g, "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
/** A fund list row's own markup as the reader sees it, without the unseen cases laid out beside it. */
const fundRow = (out: string, key: string) => { const a = out.indexOf(`data-pick-key="${key}"`); if (a < 0) return ""; const rest = out.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return shown(b < 0 ? rest : rest.slice(0, b)); };
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

describe("every cost bar's written amounts add up to its written total, on every index (pass 6: the remainder's shekels were hidden)", () => {
  for (const index of knownIndices(bundle)) {
    it(index.id, () => {
      const view = buildInvest({ bundle, index, plan });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const out = html(createElement("div", null,
        createElement(PairResult, { view, bundle, plan, pick, chosen: false, onPick: () => undefined }),
        createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined })));
      const bars = [...out.matchAll(/data-total="(-?\d+)" data-amounts="([\d,-]*)"/g)];
      expect(bars.length, "bars rendered").toBeGreaterThan(2);
      for (const [, total, amounts] of bars) {
        const sum = amounts!.split(",").filter(Boolean).reduce((a, x) => a + Number(x), 0);
        expect(sum, `${index.id}: ${amounts} beside ${total}`).toBe(Number(total));
      }
      // the pair bars' remainder holds shekels on every index, and its amount is written under the bar, in its colour
      expect(out).toMatch(/inline-block size-2 rounded-\[2px\] bg-chart-cost-other/);
    });
  }
  // the account, fund and tax differences under the two pair bars are the bars' own figures subtracted (pass 6 readers: "החשבון: 1 ₪
  // יותר" beside account parts of 699 + 2 and 698 + 3, "הקרן: 58 ₪ פחות" beside 116 and 173). Read from what the reader sees (pass 7): the
  // amounts written under each bar, each by its colour (rendered with no width, every amount is written under its bar), and the three
  // figures written under the bars, by their labels; no part's place in the bar is assumed
  const short: WorkbenchInputs = { ...plan, amountNow: 10000, monthly: 500, years: 10, values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) } };
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the differences under the pair bars are the bars' own written figures: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const out = html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: false, onPick: () => undefined }));
      const at = out.indexOf("data-gap=");
      if (at < 0) return;
      const bars = writtenBars(out).slice(0, 2);
      expect(bars.length, index.id).toBe(2);
      const written = writtenGap(out.slice(at));
      expect(written, `${index.id}: ${JSON.stringify(written)}`).toEqual({ account: bars[0]!.account - bars[1]!.account, fund: bars[0]!.fund - bars[1]!.fund, tax: bars[0]!.tax - bars[1]!.tax });
    });
  }
  // the account list's figure and the pair bar's account parts are one quantity and say one figure (pass 7: 1,043 against
  // 689 + 352 + 3 = 1,044 on the MSCI ACWI), on every index and two plans
  for (const p of [plan, short]) for (const index of knownIndices(bundle)) {
    it(`the account list's figure is the sum of the pair bar's written account parts: ${index.id}, ${p.years} years`, () => {
      const view = buildInvest({ bundle, index, plan: p });
      const pick = pickOfHeadline(view);
      if (!pick) return;
      const bar = writtenBars(html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: false, onPick: () => undefined })))[0]!;
      const list = html(createElement(AccountColumn, { view, bundle, years: p.years, pick, onPick: () => undefined }));
      const row = list.slice(list.indexOf(`data-pick-key="${pick.house}"`));
      const cost = /whitespace-nowrap" style="width:[^"]*">([\s\S]*?)<\/span><\/span>/.exec(row)?.[1] ?? "";
      expect(nisIn(cost), `${index.id}: the list's "${shown(cost)}" against ${bar.account} in the bar`).toBe(bar.account);
      // the remainder, the account's fees on each other, is the first amount written under the bar, away from the fund's (pass 7)
      expect(bar.order[0], index.id).toBe("bg-chart-cost-other");
    });
  }
});

describe("every pair bar renders at the sliders' ends and between, with any fund picked (pass 7: the page fell over on MSCI ACWI)", () => {
  // the movement script leaves each slider a quarter of the way along (125,000 ₪, 2,500 ₪ a month, 11 years, 3%), and a hedged fund picked
  // there made the bar's total 1.46 ₪ off its one written part: the rounding guard threw and the page showed its error screen
  const at = (a: number, m: number, y: number, r: number): WorkbenchInputs => ({ ...plan, amountNow: a, monthly: m, years: y, grossReturn: r, values: { ...plan.values, amount: entered(a, "nis", t), monthly: entered(m, "nis_per_month", t), years: entered(y, "years", t), returnV: entered(r * 100, "pct_per_year", t) } });
  const plans = [at(125000, 2500, 11, 0.03), at(500000, 10000, 40, 0.12), at(0, 100, 1, 0), at(1000, 0, 1, 0.07), at(250000, 5000, 21, 0.06)];
  for (const index of knownIndices(bundle)) {
    it(`${index.id}: every fund, five plans`, () => {
      for (const p of plans) {
        const view = buildInvest({ bundle, index, plan: p });
        const head = pickOfHeadline(view);
        if (!head) continue;
        for (const f of allFunds(view)) {
          const pick = { house: head.house, fund: f.rec.id };
          expect(() => html(createElement(PairResult, { view, bundle, plan: p, pick, chosen: true, onPick: () => undefined })), `${index.id} ${f.rec.id} ${p.amountNow}/${p.monthly}/${p.years}/${p.grossReturn}`).not.toThrow();
        }
      }
    });
  }
});

/** The whole shekels in a piece of markup's text: "1,043 ₪" is 1043, a minus sign negative. */
function nisIn(markup: string): number {
  const m = /(−|-)?\s*([\d,]+)/.exec(shown(markup).replace(/[\u2066-\u2069\u200e\u200f]/g, ""));
  return m ? (m[1] ? -1 : 1) * Number(m[2]!.replace(/,/g, "")) : NaN;
}
/** Each md cost bar's written amounts by whose they are, as a reader adds them up: the fund's colour, the tax's, and the rest the account's. */
function writtenBars(out: string) {
  return out.split(/data-total="/).slice(1).map((bar) => {
    const items = [...bar.split(/data-total="/)[0]!.matchAll(/inline-block size-2 rounded-\[2px\] (bg-[\w-]+)"><\/span><bdi dir="ltr">([\d,]+)<\/bdi>/g)].map((m) => ({ cls: m[1]!, n: Number(m[2]!.replace(/,/g, "")) }));
    const sum = (f: (c: string) => boolean) => items.filter((x) => f(x.cls)).reduce((a, x) => a + x.n, 0);
    return { account: sum((c) => c !== "bg-chart-cost-fund" && c !== "bg-chart-tax"), fund: sum((c) => c === "bg-chart-cost-fund"), tax: sum((c) => c === "bg-chart-tax"), order: items.map((x) => x.cls) };
  }).filter((b) => b.order.length > 0);
}
/** The three differences written under the pair bars, by their labels: "16 ₪ יותר" is 16, "פחות" negative, "בלי הפרש" 0. */
function writtenGap(markup: string) {
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

describe("the index page's sections render", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: { ...plan, returnFromParameter: true }, yourBroker: "leumi" });
  it("all sections of a known index: the result and the two linked lists", () => {
    const pick = pickOfHeadline(view)!;
    const leumi = { house: "leumi", fund: pick.fund };
    const out = html(createElement("div", null,
      createElement(IndexHeader, { view }),
      createElement(PairResult, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick, chosen: false, onPick: () => undefined }),
      createElement(PairResult, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick: leumi, chosen: true, onPick: () => undefined }),
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
    const out = html(createElement(PairResult, { view: ta, bundle, plan: { ...plan, returnFromParameter: true }, pick: { ...pick, house: "leumi" }, chosen: true, onPick: () => undefined }));
    expect(out).toContain("★ הזוג הזול ביותר לתוכנית שלכם");
    expect(out).not.toContain("עם נטרול");
  });
  it("before any pick, the page's own pair is never called the person's, and each tile names its account and fund (2026-11-05)", () => {
    const pick = pickOfHeadline(view)!;
    const out = shown(html(createElement(PairResult, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick, chosen: false, onPick: () => undefined })));
    expect(out).not.toContain("הבחירה שלכם");
    const fund = view.options.flatMap((o) => o.funds).find((f) => f.rec.id === pick.fund)!;
    // an index's name keeps its number on the line ("S&P\u00a0500")
    expect(out.replace(/\u00a0/g, " ")).toContain(fund.name);
  });
  it("neither list leaves a row out: every account and every fund is listed, priced or with its reason", () => {
    const pick = pickOfHeadline(view)!;
    const out = html(createElement("div", null, createElement(AccountColumn, { view, bundle, years: 20, pick, onPick: () => undefined }), createElement(FundColumn, { view, bundle, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined })));
    for (const p of view.providers) expect(out).toContain(p.short);
    for (const f of view.options.filter((o) => o.exists).flatMap((o) => o.funds)) expect(out).toContain(f.number);
  });
  it("a custom index: the same two lists, the accounts by what they charge, and the request to add a fund (founder, 2026-11-04)", () => {
    const v = buildInvest({ bundle, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement("div", null, createElement(NoFundCall, { view: v }), createElement(NoFundAccountColumn, { view: v, bundle, years: 20, chosen: null, onPick: () => undefined }), createElement(NoFundColumn, { view: v, mayaHref: "https://maya.tase.co.il" })));
    expect(out).toContain(invest.noFund.callTitle);
    expect(out).toContain(invest.noFund.fundTitle);
    expect(out).toContain(invest.funds.request);
    // every house keeps a row, and the priced ones stand in the order of what they charge
    for (const h of v.houses) expect(out).toContain(h.provider.short);
    const costs = v.houses.filter((h) => h.generic).map((h) => h.generic!.costN!).sort((a, b) => a - b);
    const shown = [...out.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1]!).filter((id) => v.houses.find((h) => h.provider.id === id)?.generic);
    expect(shown.map((id) => v.houses.find((h) => h.provider.id === id)!.generic!.costN!)).toEqual(costs);
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

describe("who reports the tax is the route's, not the fund's (issue 126, TXF-29)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const ids = (id: string) => brokerLabels(view.providers.find((p) => p.id === id)!, false).map((l) => l.id);
  it("a fund bought abroad carries no reporting label; a bank none, Interactive Brokers reports, Interactive Israel offers its service", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    expect(optionLabels(abroad.id).map((l) => l.id)).not.toContain("ask-self-report");
    for (const f of abroad.funds) expect(fundLabels(f.rec, view.index, f.option).map((l) => l.id)).not.toContain("ask-self-report");
    expect(ids("leumi")).toEqual([]);
    expect(ids("interactive-brokers")).toContain("ask-self-report");
    expect(ids("interactive-israel")).toContain("ask-tax-service");
    expect(ids("interactive-israel")).not.toContain("ask-self-report");
  });
  it("a foreign fund says it has no variable or trustee fee, and an Israeli fund's missing fee stays not collected (issue 156)", () => {
    const foreign = allFunds(view).find((f) => f.rec.id === "1159250")!.rec;
    for (const key of ["variable_management", "trustee"] as const) expect(feeAbsent(foreign, key)).toBe(true);
    expect(feeAbsent(foreign, "fixed_management")).toBe(false);
    expect(feeAbsent(foreign, "tracking_difference_12m")).toBe(false);
    expect(feeAbsent({ ...foreign, domicile: "IL" }, "trustee")).toBe(false);
    const unknown = { ...foreign.fees.fixed_management!, value: null };
    expect(feeAbsent({ ...foreign, fees: { ...foreign.fees, trustee: unknown } }, "trustee")).toBe(false);
    const cell = html(createElement(Fees, { rec: foreign }));
    expect(cell).toContain(invest.funds.noSuchFee);
    expect(cell).toContain(invest.funds.noTrusteeWord);
    expect(cell).not.toContain(invest.funds.notCollected);
    const israeli = html(createElement(Fees, { rec: { ...foreign, domicile: "IL" } }));
    expect(israeli).toContain(invest.funds.notCollected);
    expect(israeli).not.toContain(invest.funds.noSuchFee);
  });
  it("a foreign fund with no yearly figures says they were not collected, never that it has no full year", () => {
    const today = "2026-11-01";
    const iusa = allFunds(view).find((f) => f.rec.id === "ie0031442068")!.rec;
    const none = { ...iusa, tracking_record: undefined, fees: { ...iusa.fees, tracking_difference_12m: null } };
    const cell = html(createElement(GapCell, { rec: none, today, list: gapListFor(bundle, none) }));
    expect(cell).toContain(invest.kinds.gapNotCollected);
    expect(cell).not.toContain(invest.kinds.gapNone);
    const young = html(createElement(GapCell, { rec: { ...none, domicile: "IL" }, today, list: gapListFor(bundle, none) }));
    expect(young).toContain(invest.kinds.gapNone);
  });
  it("a foreign fund's gap is measured against the benchmark its own documents name, and none stands where the kind of index is unstated (F-92 (d), issue 163)", () => {
    const today = "2026-11-07";
    const rec = (id: string) => bundle.funds.find((f) => f.id === id)!;
    const cell = (id: string) => html(createElement(GapCell, { rec: rec(id), today, list: gapListFor(bundle, rec(id)) }));
    const sheet = (id: string) => gapValue(rec(id), gapListFor(bundle, rec(id)), today);
    // the sheet's "סוג המדד" input: the word and the document that says it, at its page
    const kindIn = (id: string) => (sheet(id)!.computed_from!.inputs as Record<string, SiteValue>)[invest.kinds.gapInputKind]!;
    // IUSA's factsheet and prospectus, IVV's and VOO's pages name the index and not whether it counts dividends after the tax withheld at source
    for (const id of ["ie0031442068", "us-ivv", "us-voo"]) {
      expect(rec(id).tracking_record?.benchmark?.dividends, id).toBe("unstated");
      expect(cell(id), id).toContain(invest.kinds.gapUnstated);
      expect(cell(id), id).not.toContain("%");
      expect(sheet(id), id).toBeNull();
    }
    // iShares VII plc's prospectus and CSPX's Israeli annex ("net total return performance", "תשואתו הכוללת הנקייה"), Invesco's Israeli annexes
    // ("התשואה הכוללת נטו"): the issuer's binding document states the benchmark is the net index, so the gap stands with its source and page
    for (const [id, years] of [["ie00b5bmr087", 10], ["1159250", 10], ["ie00b53szb19", 10], ["1159243", 10], ["1183441", 10], ["1185164", 10], ["1186063", 4]] as const) {
      const b = rec(id).tracking_record!.benchmark!;
      expect(b.dividends, id).toBe("net");
      expect(b.source?.url, id).toMatch(/^https:\/\/mayafiles\.tase\.co\.il\//);
      expect(b.page, id).toBeGreaterThan(0);
      expect(cell(id), id).toContain(invest.kinds.gapYears(years));
      expect(cell(id), id).not.toContain(invest.kinds.gapUnstated);
      expect(kindIn(id).value, id).toBe(invest.kinds.gapKindWord.net);
      // a foreign fund's years are in its own currency, from its issuer's documents
      expect(sheet(id)!.lead, id).toContain(invest.kinds.currencyIn.USD);
    }
    // the kind is said once, in the column's head and the note: never under every figure (re-check F1, F5)
    expect(cell("1159250")).not.toContain(invest.kinds.gapHead.net);
    // the issuer's own factsheet names the net index as the benchmark: its statement about its own product, accepted for which index the fund
    // measures against (F-92 (d), D31), since no prospectus of these six is in the library
    for (const id of ["1159235", "ie00b4l5y983", "ie00b6r52259", "us-acwi", "ie00bfmxxd54", "ie00b3xxrp09"]) {
      const t = rec(id).tracking_record!;
      expect(t.benchmark.dividends, id).toBe("net");
      expect((t.benchmark.source ?? t.source).title, id).toMatch(/fact ?sheet/i);
    }
    // MSCI's (Net) indices and Vanguard's S&P 500 Net Total Return: the gap stands, and its inputs name the index
    expect(cell("ie00b4l5y983")).toContain(invest.kinds.gapYears(10));
    expect(cell("ie00bfmxxd54")).toContain(invest.kinds.gapYears(6));
    expect(rec("ie00bfmxxd54").tracking_record?.benchmark?.name).toBe("S&P 500 Net Total Return");
    // an Israeli fund's annual report states how its index is computed ("מדד השקעה נטו ממס (NTR)"): its gap stands against the net index, in shekels
    expect(rec("1144385").tracking_record!.benchmark).toMatchObject({ name: "S&P 500 - NTR", dividends: "net", page: 2 });
    expect(cell("1144385")).toContain(invest.kinds.gapYears(rec("1144385").tracking_record!.years.length));
    expect(sheet("1144385")!.lead).toContain(invest.kinds.currencyIn.ILS);
    // the sheet heads with the definition and the figure's sign (re-check F4)
    expect(sheet("1144385")!.signed).toBe(true);
    expect(sheet("1144385")!.about).toBe(invest.kinds.gapHead.net);
    // the sheet says the fund's return is after its costs and a lead is not a gain (pass 3 readers)
    expect(sheet("1144385")!.lead).toContain("אחרי כל העלויות");
    expect(sheet("1144385")!.lead).toContain("לא נספרת כרווח");
    // Tel Aviv's indices are gross total return by TASE's own guidelines (ETF-42, ETF-44, ETF-45), at the index page the report links to
    expect(rec("1143783").tracking_record!.benchmark).toMatchObject({ name: 'ת"א 90', dividends: "gross", rule_ids: ["ETF-45"], source: { url: "https://market.tase.co.il/he/market_data/index/143/about" } });
    expect(rec("1209444").tracking_record!.benchmark).toMatchObject({ dividends: "gross", page: 2, rule_ids: ["ETF-45"] });
    const telAviv = bundle.funds.filter((f) => /^index-ta(35|90|125)$/.test(f.exposure_id) && f.tracking_record);
    expect(telAviv).toHaveLength(17);
    for (const f of telAviv) expect(f.tracking_record!.benchmark.dividends, f.id).toBe("gross");
    // an exempt Israeli fund's Israeli income is exempt (TXS-08), and every fund on its list measures against the same gross index:
    // its gap stands against the gross index (F-92 (d))
    // one year is named, not called a yearly mean (pass 3 readers); three years are a yearly mean over the three the report prints (pass 4)
    for (const [id, n] of [["1209444", 1], ["1143783", 3]] as const) {
      expect(rec(id).tracking_record!.years, id).toHaveLength(n);
      expect(cell(id), id).toContain(invest.kinds.gapYears(n, rec(id).tracking_record!.years[0]!.year));
      expect(cell(id), id).not.toContain("שנה אחת");
      expect(cell(id), id).not.toContain(invest.kinds.gapUnstated);
      expect(kindIn(id).value, id).toBe(invest.kinds.gapKindWord.gross);
    }
    expect(kindIn("1143783").source!.url).toBe("https://market.tase.co.il/he/market_data/index/143/about");
    // the same gross record on a list where another fund measures against a net index is not compared
    const ta90 = rec("1143783");
    const mixed = { untaxed: true, peers: [{ ...ta90.tracking_record!, benchmark: { ...ta90.tracking_record!.benchmark, dividends: "net" as const } }] };
    expect(html(createElement(GapCell, { rec: ta90, today, list: mixed }))).toContain(invest.kinds.gapUnstated);
    expect(gapStateOf(ta90, mixed)).toBe("gross-apart");
    // the document that says the index is net opens from the sheet, at its page (every number traces to its source)
    expect(kindIn("1159250").source).toMatchObject({ url: "https://mayafiles.tase.co.il/rpdf/1244001-1245000/P1244042-01.pdf", page: 9 });
    // the same report as the years': one citation for the three inputs
    expect(kindIn("1144385").source.url).toBe(rec("1144385").tracking_record!.source.url);
    // on a phone the cell under the fund's name says what it is
    expect(cell("1143783")).toContain(invest.kinds.gapPhoneHead.trim());
    // every record with years says what its benchmark is (F-92 (d) applies to all alike)
    for (const f of bundle.funds) if (f.tracking_record) expect(f.tracking_record.benchmark?.dividends, f.id).toMatch(/^(net|gross|unstated)$/);
  });
  it("the gap column names its kind of index once, and the note says only what the list shows (re-check F1, F5)", () => {
    const rec = (id: string) => bundle.funds.find((f) => f.id === id)!;
    const recsOn = (id: string) => allFunds(buildInvest({ bundle, index: indexById(bundle, id)!, plan })).map((f) => f.rec);
    const statesOn = (id: string) => recsOn(id).map((r) => gapStateOf(r, gapListFor(bundle, r)));
    const sp = statesOn("index-sp500"), ta = statesOn("index-ta125");
    expect(gapKindOf(sp)).toBe("net");
    expect(gapKindOf(ta)).toBe("gross");
    expect(gapKindOf(["unstated", "none"])).toBeNull();
    expect(gapKindOf(["net", "gross", "none"])).toBe("mixed");
    const il = rec("1143783");
    const noteOf = (states: typeof sp) => gapNoteOf(states.map(() => il), states);
    // the page's own note, from the page's own funds
    expect(gapNoteOf(recsOn("index-sp500"), sp)).toContain("״לא מושווה״");
    // S&P 500: net gaps and three funds whose index is of no stated kind
    expect(noteOf(sp)).toContain("מדד נטו");
    expect(noteOf(sp)).toContain("״לא מושווה״");
    expect(noteOf(sp)).toContain("לא נספרת כרווח");
    // TA-125: every gap against the gross index, nothing "not compared", so no sentence for it
    expect(noteOf(ta)).toContain("מדד ברוטו");
    expect(noteOf(ta)).not.toContain("״לא מושווה״");
    expect(noteOf(ta)).not.toContain("מדד נטו");
    // none compared: the column is left out and the note says so once
    expect(noteOf(["unstated", "none"])).toContain("אין עמודה כזאת");
    expect(noteOf(["unstated", "none"])).not.toContain("לא נספרת כרווח");
    // "אין שנה מלאה" is explained where an Israeli fund shows it, "עוד לא נאסף" where a foreign one does, and neither otherwise (pass 3 readers)
    expect(noteOf(["gross", "none"])).toContain("״אין שנה מלאה״");
    expect(noteOf(["gross", "gross"])).not.toContain("״אין שנה מלאה״");
    expect(gapNoteOf([rec("ie00b5bmr087"), rec("ie00bfmxxd54")], ["net", "none"])).toContain("״עוד לא נאסף״");
    expect(gapNoteOf([rec("ie00b5bmr087"), rec("ie00bfmxxd54")], ["net", "none"])).not.toContain("״אין שנה מלאה״");
  });
  it("an accumulating iShares fund's name says so, as the distributing one's does", () => {
    const funds = allFunds(view);
    expect(funds.find((f) => f.rec.id === "ie00b5bmr087")!.name).toContain("Accumulating");
    expect(funds.find((f) => f.rec.id === "1159250")!.name).toContain("Accumulating");
    expect(funds.find((f) => f.rec.id === "ie0031442068")!.name).toContain("Dist");
  });
  it("the same fund on Tel Aviv and abroad is a row each, told apart by where it is listed", () => {
    const funds = allFunds(view);
    expect(funds.find((f) => f.rec.id === "1159250")!.option).toBe("tase-foreign");
    expect(funds.find((f) => f.rec.id === "ie00b5bmr087")!.option).toBe("abroad");
    expect(funds.find((f) => f.rec.id === "1159250")!.number).toBe("1159250");
    expect(funds.find((f) => f.rec.id === "ie00b5bmr087")!.number).toBe("IE00B5BMR087");
  });
  it("the group's head counts that fund once (pass 5 readers: \"20 קרנות\" counted iShares twice)", () => {
    const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
    const funds = allFunds(sp).filter((f) => kindOf(f.rec) === "unhedged");
    const distinct = new Set(funds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size;
    expect(distinct).toBeLessThan(funds.length);
    const out = html(createElement(FundColumn, { view: sp, bundle, plan, today: t, pick: pickOfHeadline(sp)!, onPick: () => undefined, filter: null, onFilter: () => undefined })).replace(/<!-- -->/g, "");
    // and says how many of them take two rows, so the head and the rows agree where a reader looks first (pass 6 readers)
    expect(out).toContain(`${invest.kinds.name.unhedged} · ${invest.kinds.groupCount(distinct, funds.length)}`);
    expect(invest.kinds.groupCount(distinct, funds.length)).toMatch(/^\d+ קרנות, אחת מהן בשתי שורות$/);
    expect(out).not.toContain(`${invest.kinds.name.unhedged} · ${invest.kinds.groupCount(funds.length)}`);
    // each row of the fund listed twice names the other, so the rows and the count agree visibly (independent check of pass 5)
    expect(out).toContain(invest.pair.sameFundAs("IE00B5BMR087", true));
    expect(out).toContain(invest.pair.sameFundAs("1159250", false));
    expect(out.split("ולכן שתיהן נספרות כקרן אחת").length - 1).toBe(2 * (funds.length - distinct));
  });
});

describe("the fund card names the variable fee the site prices beside the listed rate (independent check of pass 7: no test held it)", () => {
  it("1147362 on the MSCI ACWI: 0.3% listed, the mean charged over 2024 and 2025 priced; a fund charged its listed rate every year shows one figure", () => {
    const view = buildInvest({ bundle, index: indexById(bundle, "index-msci-acwi")!, plan });
    const head = pickOfHeadline(view)!;
    const rec = bundle.funds.find((f) => f.id === "1147362")!;
    const priced = pricedVariable(rec, gapListFor(bundle, rec), t)!;
    // recomputed from the record: 0.249 (2025) and 0.201 (2024), the years from 1.1.2024, when the rate changed
    expect(priced.years).toEqual([2025, 2024]);
    expect(priced.value.value).toBeCloseTo((0.249 + 0.201) / 2, 9);
    const card = (fund: string) => {
      const out = shown(html(createElement(FundColumn, { view, bundle, plan, today: t, pick: { house: head.house, fund }, onPick: () => undefined, filter: null, onFilter: () => undefined })).replace(/<!-- -->/g, ""));
      return out.slice(out.indexOf(invest.pair.colFees), out.indexOf(invest.pair.colFees) + 220);
    };
    expect(card("1147362")).toContain(invest.kinds.variableChargedWord([2025, 2024]));
    expect(card("1147362")).toContain("0.225%");
    // 1144237 charged 0.3% in each of its years at a 0.3% rate: nothing to name beside it
    const same = bundle.funds.find((f) => f.id === "1144237")!;
    expect(pricedVariable(same, gapListFor(bundle, same), t)).toBeNull();
    expect(card("1144237")).not.toContain("שנגבו בפועל");
  });
});

describe("the filter chips count funds, not rows (independent check of pass 7: no test held the chips' counts)", () => {
  for (const id of ["index-sp500", "index-msci-acwi"]) {
    it(id, () => {
      const view = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
      const funds = allFunds(view);
      const isin = (f: (typeof funds)[number]) => f.rec.identifiers?.isin ?? f.rec.id;
      // the list holds a fund in Tel Aviv and abroad, so rows and funds differ
      expect(new Set(funds.map(isin)).size, id).toBeLessThan(funds.length);
      // a row's labels as the page's list takes them (pair.tsx labelsOf)
      const labelsOf = (f: (typeof funds)[number]) => [f.option === "tase-foreign" ? optionLabels(f.option)[0]! : (optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!), ...fundLabels(f.rec, indexSeenBy(view.index, f.rec, bundle), f.option)];
      const out = html(createElement(FundColumn, { view, bundle, plan, today: t, pick: pickOfHeadline(view)!, onPick: () => undefined, filter: null, onFilter: () => undefined })).replace(/<!-- -->/g, "");
      const chips = [...out.matchAll(/<button[^>]*aria-pressed="(?:true|false)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => /^(.*?)(\d+)$/.exec(shown(m[1]!).trim())).filter((m): m is RegExpExecArray => !!m);
      expect(chips.length, id).toBeGreaterThan(2);
      let twinChip = false;
      for (const [, text, n] of chips) {
        const carriers = funds.filter((f) => labelsOf(f).some((l) => l.text === text));
        expect(Number(n), `${id}: "${text}"`).toBe(new Set(carriers.map(isin)).size);
        if (new Set(carriers.map(isin)).size < carriers.length) twinChip = true;
      }
      // at least one chip is carried by both rows of the fund listed twice, so a count of rows would fail here
      expect(twinChip, id).toBe(true);
    });
  }
});

describe("a label true of every row shows once (D60, recheck 3)", () => {
  const listOf = (id: string) => {
    const view = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
    const pick = pickOfHeadline(view)!;
    return html(createElement(FundColumn, { view, bundle, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined })).replace(/<!-- -->/g, "");
  };
  const accumulating = invest.labels?.["pays-accumulating"]?.text ?? "צוברת";
  it("on the Tel Aviv lists, which have no groups, \"צוברת\" stands once over the list and on no row", () => {
    for (const id of ["index-ta125", "index-ta35", "index-ta90"]) {
      const out = listOf(id);
      const count = out.split(`>${accumulating}<`).length - 1;
      expect(count, id).toBe(1);
      expect(out, id).toContain(invest.pair.fundsShared);
      // the line over the list comes before the first row
      expect(out.indexOf(invest.pair.fundsShared), id).toBeLessThan(out.indexOf('role="radio"'));
    }
  });
  it("a list with groups says a label shared by a group in that group's head, not on its rows", () => {
    const out = listOf("index-nasdaq100");
    expect(out).not.toContain(invest.pair.fundsShared);
    // each shared label appears at most once per group head
    for (const k of ["unhedged", "hedged"] as const) expect(out).toContain(invest.kinds.name[k]);
  });
  it("a label carried by exactly the funds of one group leaves the filter, a group of one fund too (pass 5 S3: S&P 500's one hedged fund)", () => {
    for (const id of ["index-sp500", "index-nasdaq100", "index-msci-world", "index-msci-acwi"]) {
      const view = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
      const funds = allFunds(view);
      const hedged = funds.filter((f) => kindOf(f.rec) === "hedged");
      if (hedged.length === 0) continue;
      const out = listOf(id);
      const filter = /role="group"[\s\S]*?<\/div>/.exec(out)?.[0] ?? "";
      // the hedge's label is the hedged group exactly, which its head names
      expect(filter, `${id} (${hedged.length} hedged)`).not.toContain(invest.labels.hedged.text);
    }
  });
});

describe("a gap's sheet says its unit as its row does, in full (recheck 3 M2, copy 10.4, pass 5)", () => {
  // the head read "−0.04% בשנה" while the row said "ב־2025": a one-year gap is that year's difference, not a yearly mean
  const headOf = (v: SiteValue) => {
    const out = html(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" })).replace(/<!-- -->/g, "");
    return /<header[\s\S]*?<\/bdi><\/span>(?:<span class="text-sm text-muted-foreground">([^<]*)<\/span>)?/.exec(out)?.[1] ?? "";
  };
  const rowOf = (cell: string) => /<span class="text-xs text-muted-foreground whitespace-nowrap">([^<]*)<\/span>/.exec(cell.replace(/<!-- -->/g, ""))?.[1] ?? "";
  it("a report that prints only the positive variable fees says so on its sheet where A-07 is floored at 0 or its years and the mean's differ (pass 6: Mor's footnote; pass 7: false above the floor)", () => {
    const words = "מופיעים רק דמי הניהול המשתנים שהיא שילמה למנהל";
    const said: Record<string, boolean> = {};
    for (const f of bundle.funds.filter((x) => x.tracking_record)) {
      const list = gapListFor(bundle, f);
      const v = gapValue(f, list, t);
      if (!v) continue;
      said[f.id] = v.lead?.includes(words) ?? false;
      expect(said[f.id], f.id).toBe(!!f.tracking_record!.variable_positive_only && paybackMayLower(f, list));
    }
    expect(bundle.funds.filter((f) => f.tracking_record?.variable_positive_only).map((f) => f.id).sort()).toEqual(["1165810", "1165844"]);
    // both cases, by name: 1165810 is floored (its shortfall is within its fees) and says it; 1165844 falls 2.62 points short beyond its
    // fees, where the variable fee charged cancels out of the forward cost, and does not
    expect(said["1165810"]).toBe(true);
    expect(said["1165844"]).toBe(false);
  });
  it("on every compared record: the head's words open the row's, and one year is named in both", () => {
    let one = 0, many = 0;
    for (const f of bundle.funds.filter((x) => x.tracking_record)) {
      const list = gapListFor(bundle, f);
      const v = gapValue(f, list, t);
      if (!v) continue;
      const head = headOf(v), row = rowOf(html(createElement(GapCell, { rec: f, today: t, list })));
      expect(head, f.id).not.toBe("");
      // the head carries the row's full words (pass 5 readers): "בשנה · 3 שנים", not "בשנה"
      expect(head, `${f.id}: head "${head}", row "${row}"`).toBe(row);
      const sheet = html(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }));
      if (f.tracking_record!.years.length === 1) {
        one++;
        expect(head, f.id).toBe(`ב־${f.tracking_record!.years[0]!.year}`);
        expect(head, f.id).not.toContain("בשנה");
        // a one-year figure is no mean, and its sheet does not speak of one (independent check of pass 5)
        expect(sheet, f.id).not.toContain("הממוצע");
      } else {
        many++;
        const n = f.tracking_record!.years.length;
        expect(head, f.id).toBe(`בשנה · ${n === 2 ? "שנתיים" : `${n} שנים`}`);
        expect(sheet, f.id).toContain("הממוצע כולל גם שנים שבהן הקרן הקדימה את המדד");
      }
    }
    expect(one).toBeGreaterThan(0);
    expect(many).toBeGreaterThan(0);
  });
});

describe("the page's finish line (2026-10-31)", () => {
  it("on every index, every house has a price on a fund or a named reason on each", () => {
    for (const i of knownIndices(bundle)) {
      const view = buildInvest({ bundle, index: indexById(bundle, i.id)!, plan });
      for (const f of allFunds(view)) {
        // a fund priced nowhere names why on its own row, the same at every house
        if (Object.keys(f.byHouse).length === 0) {
          expect(f.reason, f.rec.id).toBeTruthy();
          continue;
        }
        for (const p of view.providers) {
          const at = f.byHouse[p.id];
          expect(at, `${f.rec.id} at ${p.id}`).toBeTruthy();
          if (!("valueN" in at!)) expect(at!.reason, `${f.rec.id} at ${p.id}`).toBeTruthy();
        }
      }
    }
  });
});

describe("no price on what no document says can be done (2026-10-31)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const at = (option: string, house: string) => view.options.find((o) => o.id === option)!.funds.map((f) => f.byHouse[house]!);
  it("PEPPER is no house of its own (its prices stand under Leumi, D43 amended 2026-11-04)", () => {
    expect(view.providers.map((p) => p.id)).not.toContain("pepper");
    expect(view.providers.map((p) => p.id)).toContain("leumi");
  });
  it("Interactive Brokers prices nothing on Tel Aviv: grey as no data, not as not possible", () => {
    for (const x of at("il-etf", "interactive-brokers")) {
      expect("valueN" in x).toBe(false);
      expect("availability" in x && x.availability).toBeFalsy();
    }
  });
  it("a house whose document names funds abroad is priced there, on the row that names them", () => {
    // a distributing fund is priced nowhere until its yield is known, so it has no row at any house (issue 30)
    const funds = view.options.find((o) => o.id === "abroad")!.funds.filter((f) => f.rec.distribution_policy === "accumulating");
    expect(funds.length).toBeGreaterThan(0);
    for (const house of ["hapoalim", "yahav"]) for (const f of funds) expect("valueN" in f.byHouse[house]!).toBe(true);
  });
  it("on every index, a house and fund whose documents leave the sale in doubt are a grey row, never priced or ranked (D42, pass 5)", () => {
    let doubts = 0;
    for (const i of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index: indexById(bundle, i.id)!, plan });
      for (const o of v.options)
        for (const f of o.funds)
          for (const p of v.providers) {
            const snap = bundle.snapshots.find((s) => s.id === p.id);
            if (!doubtOf(snap, o.id)) continue;
            doubts++;
            expect("valueN" in (f.byHouse[p.id] ?? {}), `${i.id}: ${f.rec.id} at ${p.id}`).toBe(false);
          }
    }
    expect(doubts).toBeGreaterThan(0);
  });
  it("the stairs' account lane names the fund its grey lines are about (pass 5 readers; rendered, independent check of pass 5)", () => {
    let grey = 0;
    for (const index of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index, plan });
      const out = html(createElement(StairsSection, { view: v, bundle, plan, startHouse: null, startFund: null, example: true })).replace(/<!-- -->/g, "");
      // the account lane as shown: from its title to the next lane's, the copies laid out unseen to hold its height left out
      const seen = out.replace(/<div aria-hidden="true" class="invisible">[\s\S]*?<\/div>/g, "");
      const lane = seen.split(invest.stairs.lanes.account.title)[1]?.split(/<h4/)[0] ?? "";
      const lines = [...lane.matchAll(/<b class="font-medium">([^<]*):<\/b>/g)].map((m) => m[1]!.replace(/[\u2066-\u2069]/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, "\""));
      const names = [...new Set(allFunds(v).map((f) => f.name))];
      for (const line of lines) {
        grey++;
        expect(names.some((n) => line.includes(n)), `${index.id}: "${line}" names no fund`).toBe(true);
        expect(Object.values(invest.stairs.why), `${index.id}: "${line}" is the other lanes' bare words`).not.toContain(line);
      }
    }
    expect(grey, "no grey line rendered in any account lane").toBeGreaterThan(0);
  });
  it("One Zero prices tracking funds, not ETFs, and no fund traded outside the US", () => {
    for (const x of at("il-tracking", "one-zero")) expect("valueN" in x).toBe(true);
    for (const x of at("il-etf", "one-zero")) expect("valueN" in x).toBe(false);
    const uk = view.options.find((o) => o.id === "abroad")!.funds.find((f) => /UCITS/.test(f.rec.names.en[0] ?? ""));
    if (uk) expect("valueN" in uk.byHouse["one-zero"]!).toBe(false);
  });
});

describe("hedged or not: what happened (F-95, founder 2026-10-31)", () => {
  const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(sp)!;
  const out = html(createElement(DollarSection, { view: sp, bundle, plan, pick })).replace(/<!-- -->/g, "");
  it("says the 2022 and 2025 reports as they are, in the order of the card", () => {
    expect(out).toContain("המדד ירד");
    expect(out).toContain("18.5%");
    expect(out).toContain("21.8%");
    expect(out).toContain("קרה ההפך");
    expect(out).toContain("15.3%");
    expect(out).toContain("השורה התחתונה");
  });
  // 1146471's report prints 2022 to 2025 and its record holds them since pass 4: eight funds without hedging report 2022
  it("draws on the eight funds of 2022 and the eleven of 2025", () => {
    expect(out).toContain("8 קרנות");
    expect(out).toContain("11 קרנות");
  });
  // recheck 3 S5: a hedged report F-92 (d) does not compare gives no gap, and the sentence beside the range does not count it
  it("leaves a report it does not compare out of the gap range and out of the count beside it", () => {
    // the costs tile's figure: "⁦1.8⁩ עד ⁦2.7⁩ נקודות בשנה"
    const tile = (o: string) => o.match(new RegExp(`⁦[-−0-9.]+⁩ <span[^>]*>[^<]*</span> ⁦[-−0-9.]+⁩ ${invest.dollar.pointsAYear}`))?.[0] ?? "";
    const render = (b: typeof bundle) => {
      const v = buildInvest({ bundle: b, index: indexById(b, "index-nasdaq100")!, plan });
      return html(createElement(DollarSection, { view: v, bundle: b, plan, pick: pickOfHeadline(v)! })).replace(/<!-- -->/g, "");
    };
    const hedged = bundle.funds.filter((f) => f.exposure_id === "index-nasdaq100" && f.hedged === true && f.domicile === "IL" && f.tracking_record);
    expect(hedged).toHaveLength(2);
    const [off, kept] = hedged as [(typeof hedged)[0], (typeof hedged)[0]];
    // the same record made "unstated", and twenty points behind its index every year: compared, its gap would widen the range
    const tr = off.tracking_record!;
    const changed = { ...bundle, funds: bundle.funds.map((f) => (f.id === off.id ? { ...f, tracking_record: { ...tr, benchmark: { ...tr.benchmark, dividends: "unstated" as const }, years: tr.years.map((y) => ({ ...y, fund_pct: y.tracking_pct - 20 })) } } : f)) };
    const base = render(bundle), out2 = render(changed);
    expect(tile(base)).not.toBe("");
    // the range rests on the compared report alone: its own gaps, not twenty points
    expect(tile(out2)).not.toBe("");
    expect(tile(out2)).not.toMatch(/⁦(19|20|21|22)\./);
    // the sentence beside it: two reports before, then the one compared report by its name
    expect(shown(base)).toContain("השיגו שתי הקרנות עם הנטרול");
    expect(shown(out2)).not.toContain("השיגו שתי הקרנות");
    expect(shown(out2)).toContain("השיגה פחות מהמדד שלה");
    expect(kept.id).not.toBe(off.id);
  });
  // the words say a hedged fund earned less than its index in every reported year: a report that says otherwise means changing them
  it("every hedged fund's report falls short of its index", () => {
    for (const f of bundle.funds.filter((x) => x.hedged === true)) for (const y of f.tracking_record?.years ?? []) expect(y.fund_pct, `${f.id} ${y.year}`).toBeLessThan(y.tracking_pct);
  });
  it("renders on every index with both kinds", () => {
    for (const id of ["index-nasdaq100", "index-msci-world", "index-msci-acwi"]) {
      const v = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
      expect(hasKinds(v), id).toBe(true);
      expect(html(createElement(DollarSection, { view: v, bundle, plan, pick: pickOfHeadline(v)! }))).toContain("השורה התחתונה");
    }
    expect(allFunds(sp).some((f) => kindOf(f.rec) === "hedged")).toBe(true);
  });
});

describe("the tie set of F-80 in the tiles (#190)", () => {
  // the review's plan: 10,000 now, 500 a month, 10 years, 7%; on the S&P 500 three pairs are within the threshold of the top
  const base: WorkbenchInputs = {
    ...plan, amountNow: 10000, monthly: 500, years: 10,
    values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) },
  };
  const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: base });
  const theta = tieShareOf(bundle);
  const head = pickOfHeadline(sp)!;
  it("counts every pair within the threshold of the top, and crowns none", () => {
    expect(tieCount(sp, head, theta)).toBe(3);
    expect(crowned(sp, head, theta)).toBe(false);
  });
  it("the tied pair in neither tile is named under them, with its number where another fund has its name (#190, fourth pass)", () => {
    const out = shown(html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }))).replace(/\u00a0/g, " ");
    const line = out.slice(out.indexOf(invest.pair.tieWhy(3)));
    expect(line).toContain(`${invest.pair.tieThird} פסגות ${invest.pair.tieWith} iShares Core S&P 500 UCITS ETF USD (Accumulating)`);
    expect(line).toContain("1159250");
    // what makes a tie is said where the tie is named, with P-01 read from data/parameters (pass 7 readers)
    const rule = line.slice(line.indexOf(invest.pair.tieRule.before.trim()));
    expect(rule.replace(/[\u2066-\u2069\u200e\u200f]/g, "")).toContain(`${invest.pair.tieRule.before.trim()}${fmt.pct((bundle.p01.value as { value: number }).value)}${invest.pair.tieRule.after}`);
  });
  it("before any pick, the fund list calls the page's own fund one of the tied, not the site's pick (pass 5 readers)", () => {
    const out = shown(html(createElement(FundColumn, { view: sp, bundle, plan: base, today: t, pick: head, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined })));
    expect(out).toContain(invest.pair.markedTie(3));
    // the column head names where the page's fund stands ("לעומת הקרן שבראש הכרטיס"), the row's tag must not
    expect(out.replaceAll(invest.pair.colDiffMarked, "")).not.toContain(invest.pair.marked);
  });
  it("every tied fund's row in the fund list says it is one of the tied, in the same words, and no other row does (independent check of pass 5)", () => {
    const out = html(createElement(FundColumn, { view: sp, bundle, plan: base, today: t, pick: head, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    const tied = tieFunds(sp, head, theta);
    for (const f of allFunds(sp)) expect(fundRow(out, f.rec.id).includes(invest.pair.markedTie(3)), f.rec.id).toBe(tied.includes(f.rec.id));
  });
  it("the fund list counts tied funds, not pairs: one fund tied at two houses is one (independent check of pass 5)", () => {
    // MSCI World, 10,000 now, nothing a month, one year: five pairs within the threshold, three funds (scanned over 4 x 3 x 4 plans on every index)
    const one: WorkbenchInputs = { ...base, amountNow: 10000, monthly: 0, years: 1, values: { ...base.values, amount: entered(10000, "nis", t), monthly: entered(0, "nis_per_month", t), years: entered(1, "years", t) } };
    const w = buildInvest({ bundle, index: indexById(bundle, "index-msci-world")!, plan: one });
    const h = pickOfHeadline(w)!;
    expect(tieCount(w, h, theta)).toBe(5);
    const tied = tieFunds(w, h, theta);
    expect(tied).toHaveLength(3);
    const out = html(createElement(FundColumn, { view: w, bundle, plan: one, today: t, pick: h, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    expect(shown(out)).toContain(invest.pair.markedTie(3));
    expect(shown(out)).not.toContain(invest.pair.markedTie(5));
    for (const id of tied) expect(fundRow(out, id), id).toContain(invest.pair.markedTie(3));
  });
  it("before any pick, the tile says how many pairs share the top, and no pair is called first or next", () => {
    const out = shown(html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieTop(3));
    expect(out).toContain(invest.pair.tieOther);
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.next);
    expect(out).not.toContain("★");
  });
  it("with the person's own pick far from the best pair, the best pair's tile is not crowned either (the account list's test)", () => {
    const out = shown(html(createElement(PairResult, { view: sp, bundle, plan: base, pick: { house: "leumi", fund: head.fund }, chosen: true, onPick: () => undefined })));
    expect(out).not.toContain(invest.pair.cheapestStar);
    expect(out).toContain(invest.pair.tieTop(3));
  });
  it("a pick inside the tie set: the other pair is not called the cheap one, and the tie is counted as the title counts", () => {
    const tiedPick = { house: "psagot", fund: "5139100" };
    expect(tieCount(sp, head, theta)).toBe(3);
    const out = shown(html(createElement(PairResult, { view: sp, bundle, plan: base, pick: tiedPick, chosen: true, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieTop(3));
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.tieWhy(2));
    expect(out).not.toContain(invest.pair.moreIfCheapest);
    expect(out).toContain(invest.pair.vsYours);
  });
  it("the account list stars the one house all the tied pairs are at: its own funds tie with one another, no other house does", () => {
    // the shown row's own markup: a row's other states, laid out unseen beside it, carry every tag they can
    const rowOf = (out: string, key: string) => { const a = out.indexOf(`data-pick-key="${key}"`); const rest = out.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return shown(b < 0 ? rest : rest.slice(0, b)); };
    const out = rowOf(html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined })), "psagot");
    expect(head.house).toBe("psagot");
    expect(out).toContain(invest.pair.cheapestTag);
    // and not with a fund outside the set, nor when another house is in it (the tiles' R1 case keeps no star there)
    const far = allFunds(sp).find((f) => f.rec.id !== head.fund && "valueN" in (f.byHouse.psagot ?? {}) && !["5139100", "1159250"].includes(f.rec.id))!;
    const farOut = rowOf(html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: { house: "psagot", fund: far.rec.id }, onPick: () => undefined })), "psagot");
    expect(farOut).not.toContain(invest.pair.cheapestTag);
  });
  it("a cost bar's fund name is never cut: on a phone it has the bar's whole width, and it wraps, held at the index's longest name", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    expect(out).toContain("[overflow-wrap:anywhere] max-md:row-start-3 max-md:col-span-2");
    expect(out).not.toContain("truncate text-xs");
    const longest = allFunds(sp).map((f) => f.name).sort((a, b) => b.length - a.length)[0]!;
    expect(out.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\u00a0/g, " ").split(longest).length - 1).toBeGreaterThanOrEqual(2);
  });
  it("a pick of another fund moves nothing below the lists: each account row carries the grey states it takes with the other funds; the fold holds the rows of every account's order (pick-list-hold)", () => {
    const out = html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined }));
    const abroad = allFunds(sp).find((f) => f.option === "abroad" && f.best && !("valueN" in (f.byHouse.psagot ?? {})))!;
    expect(abroad).toBeDefined();
    expect(out).toMatch(/data-case-of="psagot" data-case="grey\|/);
    const funds = html(createElement(FundColumn, { view: sp, bundle, plan: base, today: t, pick: head, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    // no row is marked as one the fold never shows: the fold reads every account's order instead (#190, fourth pass: a row so marked stood
    // in the fold the page opened with, and the first pick after a link moved what lies below by 233 px)
    expect(funds).toContain('data-pick-key="us-voo"');
    expect(funds).not.toContain("data-cannot");
  });
  it("why no pair is first is a line under both tiles, not inside one: held there, it left a hole in the tile when there was no tie", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    const tilesEnd = out.indexOf(invest.pair.pickCheapest);
    const why = out.indexOf(invest.pair.tieWhy(10));
    expect(why).toBeGreaterThan(tilesEnd);
  });
  it("the account list's head holds every fund's name laid out as the shown one, a wrapping tag on each, so a long name moves nothing", () => {
    const out = html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined }));
    const headPart = out.slice(out.indexOf(invest.pair.accounts), out.indexOf(invest.pair.accountsHint));
    const tags = headPart.match(/<span class="inline-flex w-fit items-center[^"]*"/g) ?? [];
    expect(tags.length).toBe(allFunds(sp).length + 1);
    expect(tags.filter((x) => x.includes("whitespace-nowrap"))).toEqual([]);
  });
  it("each cost bar's figure has a column of one width on a phone, so a plan's long figure never rewraps the lines beside it", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    expect(out).not.toContain("grid-cols-[minmax(0,1fr)_auto]");
    expect(out).toContain("grid-cols-[minmax(0,1fr)_7rem]");
  });
});

describe("a typed entry's line (#190)", () => {
  it("with nothing typed, the line says what is not known, with no entered tag before its own negation", () => {
    const out = shown(html(createElement(Terms, { terms: { shown: [], empty: [invest.customEntries.fields.fx] }, editing: { kind: "fund", id: "x" } })));
    expect(out).toContain(invest.customEntries.unknownLine(invest.customEntries.fields.fx));
    expect(out.replace(invest.customEntries.unknownLine(invest.customEntries.fields.fx), "")).not.toContain("הזנתם");
  });
});

describe("the account card's notes on prices abroad and its own-bank list (D64, D65, D66)", () => {
  const sp = indexById(bundle, "index-sp500")!;
  const ta = indexById(bundle, "index-ta125")!;
  const card = (index: typeof sp, own: string | null) => {
    const view = buildInvest({ bundle, index, plan: { ...plan, currentAccounts: { own } } });
    return shown(html(createElement(AccountColumn, { view, bundle, years: 20, pick: pickOfHeadline(view)!, onPick: () => undefined, ownBank: { value: own, onChange: () => undefined } })));
  };

  it("names the houses whose price lists limit the spread, from their records, on an index with funds bought abroad", () => {
    const out = card(sp, null);
    expect(out).toContain(invest.pair.abroadSpread(["אי.בי.אי", "אלטשולר טרייד", "מיטב טרייד"]));
    // F-103 (D67): One Zero prints a charge per dividend abroad, which its figures count; the note says so (independent check 2, should-fix 5)
    expect(out).toContain(invest.pair.abroadOthers);
    // why One Zero's charge is counted while other written ceilings are not, and on which funds (fresh readers, round 3, 2026-11-07)
    const [before, between, after] = invest.pair.abroadPerDividend.replace("{name}", "וואן זירו").split("{amount}");
    expect(out).toContain(before);
    expect(out).toContain(between);
    expect(out).toContain(after);
    expect(out).toContain(fmt.usd(50));
  });

  it("names the current account in the legend only where a bar shown counts one", () => {
    // the list of the S&P 500 has banks, whose rows count it; the pair result of two investment houses has none (pair.tsx `CostLegend`)
    expect(card(sp, null)).toContain(invest.pair.legendAccount);
    const view = buildInvest({ bundle, index: sp, plan: { ...plan, currentAccounts: { own: null } } });
    const result = (pick: { house: string; fund: string }) => shown(html(createElement(PairResult, { view, bundle, plan: { ...plan, currentAccounts: { own: null } }, pick, chosen: true, onPick: () => undefined })));
    const fund = pickOfHeadline(view)!.fund;
    const houses = view.providers.filter((p) => !p.custom && !bundle.snapshots.find((s) => s.id === p.id)?.current_account).map((p) => p.id);
    const atHouse = houses.find((h) => view.options.some((o) => o.funds.some((f) => f.rec.id === fund && "valueN" in (f.byHouse[h] ?? {}))));
    expect(atHouse).toBeDefined();
    // the page's pair sits beside the cheapest, which may be a bank; the legend names the current account only when one of the two bars has it
    const out = result({ house: atHouse!, fund });
    const bankShown = [atHouse!, view.headline?.providerId].some((h) => !!bundle.snapshots.find((s) => s.id === h)?.current_account);
    // on the default plan the page opens on a house's pair beside a house's (2026-11-06: the legend promised a current account there)
    expect(bankShown).toBe(false);
    expect(out.includes(invest.pair.legendAccount)).toBe(bankShown);
    expect(out).toContain(invest.pair.legendSecurities);
  });

  it("says neither on an index whose funds are all bought in Tel Aviv, if it has none bought abroad", () => {
    const view = buildInvest({ bundle, index: ta, plan });
    const out = card(ta, null);
    const abroad = view.options.some((o) => o.id === "abroad" && o.exists);
    expect(out.includes(invest.pair.abroadTitle)).toBe(abroad);
  });

  it("offers every bank whose current account costs something, and says which row leaves it out", () => {
    // the bank whose current account is free is named, so its row reads as a bank's (fresh readers, round 3)
    expect(card(sp, null)).toContain(invest.pair.ownBank.counted(["וואן זירו"]));
    expect(card(sp, "leumi")).toContain(invest.pair.ownBank.left("לאומי"));
    const raw = html(createElement(AccountColumn, { view: buildInvest({ bundle, index: sp, plan }), bundle, years: 20, pick: pickOfHeadline(buildInvest({ bundle, index: sp, plan }))!, onPick: () => undefined, ownBank: { value: null, onChange: () => undefined } }));
    for (const id of ["discount", "fibi", "hapoalim", "jerusalem", "leumi", "massad", "mercantile", "mizrahi-tefahot", "yahav"]) expect(raw).toContain(`value="${id}"`);
    // One Zero's price list prints its current account free: marking it would change no figure (ground rule 4)
    expect(raw).not.toContain(`value="one-zero"`);
    expect(raw).not.toContain(`value="psagot"`);
    expect(raw).not.toContain(`value="pepper"`);
  });
});
