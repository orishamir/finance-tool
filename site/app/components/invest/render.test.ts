// A render smoke test of the index page's sections on the collected data: every section produces its words and numbers, no section throws.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { feeAbsent } from "../../lib/providers";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { buildInvest, indexById, knownIndices, refOfCustom } from "../../lib/invest";
import { brokerLabels, fundLabels, optionLabels } from "../../lib/labels";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { Fees } from "./funds";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "./no-fund";
import { LabelSheetHost } from "../kit";
import { IndexHeader } from "./sections";
import { AccountColumn, allFunds, bestFor, crowned, FundColumn, GapCell, PairResult, pickOfHeadline, tieCount } from "./pair";
import { tieShareOf } from "../../lib/invest";
import { Foot } from "./foot";
import { Terms } from "./custom-entries";
import { DollarSection } from "./dollar";
import { hasKinds, kindOf } from "../../lib/invest";
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
/** What the reader sees: the page's text without the unseen longest cases that only hold a block's height (LongestCase). */
const shown = (out: string) => out.replace(/<div aria-hidden="true" class="invisible">[\s\S]*?<\/div>/g, "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
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
    const cell = html(createElement(GapCell, { rec: iusa, today }));
    expect(cell).toContain(invest.kinds.gapNotCollected);
    expect(cell).not.toContain(invest.kinds.gapNone);
    const young = html(createElement(GapCell, { rec: { ...iusa, domicile: "IL" }, today }));
    expect(young).toContain(invest.kinds.gapNone);
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
  it("draws on the seven funds of 2022 and the eleven of 2025", () => {
    expect(out).toContain("7 קרנות");
    expect(out).toContain("11 קרנות");
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
    expect(out).toContain(invest.pair.abroadOthers);
  });

  it("says neither on an index whose funds are all bought in Tel Aviv, if it has none bought abroad", () => {
    const view = buildInvest({ bundle, index: ta, plan });
    const out = card(ta, null);
    const abroad = view.options.some((o) => o.id === "abroad" && o.exists);
    expect(out.includes(invest.pair.abroadOthers)).toBe(abroad);
  });

  it("offers every bank with a current account, and says which row leaves it out", () => {
    expect(card(sp, null)).toContain(invest.pair.ownBank.counted);
    expect(card(sp, "leumi")).toContain(invest.pair.ownBank.left("לאומי"));
    const raw = html(createElement(AccountColumn, { view: buildInvest({ bundle, index: sp, plan }), bundle, years: 20, pick: pickOfHeadline(buildInvest({ bundle, index: sp, plan }))!, onPick: () => undefined, ownBank: { value: null, onChange: () => undefined } }));
    for (const id of ["discount", "fibi", "hapoalim", "jerusalem", "leumi", "massad", "mercantile", "mizrahi-tefahot", "one-zero", "yahav"]) expect(raw).toContain(`value="${id}"`);
    expect(raw).not.toContain(`value="psagot"`);
    expect(raw).not.toContain(`value="pepper"`);
  });
});
