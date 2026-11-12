// The index page's sections rendered on the collected data (part of render.test.ts, which says why it is split).
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { feeAbsent } from "../../lib/providers";
import { paybackMayLower, pricedVariable, buildInvest, doubtOf, gapListFor, indexById, knownIndices, refOfCustom, kindOf } from "../../lib/invest";
import { brokerLabels, fundLabels, optionLabels } from "../../lib/labels";
import { type SiteValue } from "../../lib/value";
import { Fees } from "./funds";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "./no-fund";
import { TitleRow } from "./title";
import { allFunds, GapCell, gapKindOf, gapNoteOf, gapStateOf, gapValue, pickOfHeadline, whyNoFundAt, whyNoKindAt } from "./pair";
import { PlanCard } from "./plan-card";
import { ChosenPair } from "./chosen";
import { ValueSheet } from "../provenance-sheets";
import { PairLists, listName } from "./lists";
import { PairReceipt } from "./receipt";
import { BeforeDeciding, hedgeCard } from "./before";
import { useDollarCase } from "./dollar";
import { bundle, t, plan, data, shown, html, lists, fundRow, ReceiptAndFees, StairsFor } from "./render-fixtures";

describe("the index page's sections render", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: { ...plan, returnFromParameter: true }, yourBroker: "leumi" });
  it("all sections of a known index: the title, the plan, the receipt, the chosen pair, the two linked lists and the fees panel", () => {
    const pick = pickOfHeadline(view)!;
    const leumi = { house: "leumi", fund: pick.fund };
    const out = html(createElement("div", null,
      createElement(TitleRow, { known: knownIndices(bundle), customs: [], index: view.index, others: knownIndices(bundle), bundle, onRemove: () => undefined, onRename: () => undefined, onSave: () => undefined, onGo: () => undefined }),
      createElement(ReceiptAndFees, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick, chosen: false, onPick: () => undefined }),
      createElement(ReceiptAndFees, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick: leumi, chosen: true, onPick: () => undefined }),
      createElement(PairLists, { view, bundle, plan, livePlan: plan, today: t, pick, chosen: false, onPick: () => undefined, moved: null, group: null }),
      createElement(ChosenPair, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick: leumi, chosen: true }),
      createElement(PlanCard, { knobs: null, onOpen: () => undefined, fx: bundle.fx, today: t, example: true, dollar: true, inflation: plan.values.inflation })));
    expect(out).toContain("הפקדתם");
    // a dollar index with funds of both kinds: the hedged ones stand under their own heading, each with its range across the dollar (F-94)
    expect(out).toContain(invest.kinds.name.hedged);
    expect(shown(out)).toMatch(new RegExp(`${invest.kinds.between} [^<]*${invest.kinds.and}`));
    // the shekel column's "?" says the amounts hold the rate still; the line under the list says what orders each kind
    expect(out).toContain("והסדר לא תלוי בדולר");
    expect(out).toContain("מול המדד");
    expect(out).toContain(invest.lists.kicker);
    expect(out).toContain(invest.lists.colLeft);
    expect(out).toContain(invest.shownPair(false).row);
    expect(out).toContain(invest.before.fees.total);
    expect(out).toContain("פסגות");
    expect(out).toContain("שער הדולר");
    expect(out).toContain("אינפלציה");
    expect(out).toContain("לדוגמה של האתר");
  });
  it("an Israeli index keeps the pair beside the cheapest one (no kinds)", () => {
    const ta = buildInvest({ bundle, index: indexById(bundle, "index-ta125")!, plan: { ...plan, returnFromParameter: true } });
    const pick = pickOfHeadline(ta)!;
    const out = html(createElement(ReceiptAndFees, { view: ta, bundle, plan: { ...plan, returnFromParameter: true }, pick: { ...pick, house: "leumi" }, chosen: true, onPick: () => undefined }));
    expect(out).toContain("★ הזוג הזול ביותר לתוכנית שלכם");
    expect(out).not.toContain("עם נטרול");
  });
  it("before any pick, the page's own pair is never called the person's, and each tile names its account and fund (2026-11-05)", () => {
    const pick = pickOfHeadline(view)!;
    const out = shown(html(createElement(ReceiptAndFees, { view, bundle, plan: { ...plan, returnFromParameter: true }, pick, chosen: false, onPick: () => undefined })));
    expect(out).not.toContain("הבחירה שלכם");
    const fund = view.options.flatMap((o) => o.funds).find((f) => f.rec.id === pick.fund)!;
    // an index's name keeps its number on the line ("S&P\u00a0500")
    expect(out.replace(/\u00a0/g, " ")).toContain(fund.name);
  });
  it("neither list leaves a row out: every account and every fund is listed, priced or with its reason", () => {
    const pick = pickOfHeadline(view)!;
    const out = lists(view, bundle, plan, pick);
    for (const p of view.providers) expect(out).toContain(`data-pick-key="${p.id}"`);
    for (const f of view.options.filter((o) => o.exists).flatMap((o) => o.funds)) expect(out).toContain(`data-pick-key="${f.rec.id}"`);
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
  it("a custom index's account that prices no kind of fund says why in the pair page's words, which open the reason: no tag, no \"no data\", no separate source link (D105)", () => {
    // no house prices nothing on a custom index today (every kind exists there): a planted one, Interactive Israel with its foreign
    // securities not sold either, stands for it, its entries and rule as the record writes them
    const ii = bundle.snapshots.find((s) => s.id === "interactive-israel")!;
    const no = ii.availability!.find((a) => a.available === false)!;
    const planted = { ...bundle, snapshots: bundle.snapshots.map((s) => (s === ii ? { ...s, availability: [...s.availability!, { ...no, applies_to: ["foreign_securities"] }] } : s)) } as typeof bundle;
    const v = buildInvest({ bundle: planted, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement(NoFundAccountColumn, { view: v, bundle: planted, years: 20, chosen: null, onPick: () => undefined }));
    const missing = v.houses.filter((h) => !h.generic && !h.provider.id.startsWith("custom-broker-group"));
    expect(missing.map((h) => h.provider.id)).toEqual(["interactive-israel"]);
    const from = out.indexOf('data-pick-key="interactive-israel"');
    const next = out.indexOf("data-pick-key=", from + 1);
    const row = out.slice(from, next < 0 ? undefined : next);
    expect(row).toMatch(new RegExp(`class="term"[^>]*>${invest.pair.noFund.notSold}<`));
    expect(row).not.toContain("<a ");
    expect(shown(row)).not.toContain("אין נתון");
    expect(shown(row)).not.toContain(invest.pair.notPossibleSource);
    // its words open the company's rule
    const told = whyNoKindAt(planted, "interactive-israel", v.options.filter((o) => o.exists && o.id === "abroad").map((o) => ({ option: o.id, at: o.cells.find((x) => x.providerId === "interactive-israel") })));
    expect(told.state).toBe("notSold");
    expect(told.rules).toEqual(["BRK-65"]);
  });
});

describe("an account that prices no fund on an index says why, over every kind of fund the index has", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-ta125")!, plan });
  const pick = pickOfHeadline(view)!;
  const out = lists(view, bundle, plan, pick);
  it("Interactive Israel on TA-125: not possible there, the ETF in its own words about institutional clients and the mutual fund by its terms and Interactive Brokers' fund list (second pass, 2026-11-12)", () => {
    const w = whyNoFundAt(bundle, "interactive-israel", allFunds(view));
    expect(w.state).toBe("notSold");
    expect(w.why).toContain("מוסדיים");
    expect(w.why).toContain("תנאי השימוש");
    expect(w.why).toContain(invest.stairs.kinds["il-etf"]!);
    expect(fundRow(out, "interactive-israel")).toContain(invest.pair.noFund.notSold);
    expect(fundRow(out, "interactive-israel")).not.toContain(invest.pair.noFund.doubt);
    // its words open the company's rule, and no document's title in the reasons carries a rule's code
    expect(w.rules).toEqual(["BRK-65"]);
    expect(w.parts.map((p) => p.doc?.title ?? "").join(" ")).not.toMatch(/BRK-\d/);
  });
  it("Interactive Brokers on TA-125: not possible there, in its FAQ's words on Tel Aviv and its fund list for a resident of Israel (read 2026-11-12)", () => {
    const w = whyNoFundAt(bundle, "interactive-brokers", allFunds(view));
    expect(w.state).toBe("notSold");
    expect(w.why).toContain("לקוחות פרטיים שגרים בישראל");
    expect(w.why).toContain("קרנות הנאמנות");
    // the row's words open the rule that says it, in place of the reasons; the reasons, kept for a row with no rule behind it, each carry
    // their own document, the FAQ among them (the row's one "source" link led to the fund list only)
    expect(w.rules).toEqual(["BRK-64"]);
    expect(w.parts.map((p) => p.head)).toEqual(expect.arrayContaining([invest.stairs.kinds["il-tracking"]!, invest.stairs.kinds["il-etf"]!]));
    expect(w.parts.map((p) => p.doc?.href ?? "").join(" ")).toContain("faq/#/content/56713690");
    expect(w.parts.map((p) => p.doc?.href ?? "").join(" ")).toContain("products-mutual-funds.php");
    // the label is the button: no "?" beside the name and no link beside the label
    const from = out.indexOf('data-pick-key="interactive-brokers"');
    // the row's cells are spans, so it ends at the first closing div (it is the list's last row: the next pick key is in the funds list)
    const row = out.slice(from, out.indexOf("</div>", from));
    expect(row).not.toContain("help-mark");
    expect(row).not.toContain("<a ");
    expect(row).toMatch(new RegExp(`class="term"[^>]*>${invest.pair.noFund.notSold}<`));
    expect(fundRow(out, "interactive-brokers")).toContain(invest.pair.noFund.notSold);
    expect(fundRow(out, "interactive-brokers")).not.toContain(invest.pair.noFund.doubt);
    expect(fundRow(out, "interactive-brokers")).not.toContain("אין נתון");
  });
  it("the line over the funds an account gives no price opens why, as the account's row does (D105)", () => {
    let seen = 0;
    for (const house of ["one-zero", "pepper", "psagot", "interactive-israel"]) {
      for (const idx of knownIndices(bundle)) {
        const v = buildInvest({ bundle, index: idx, plan });
        const priced = allFunds(v).find((f) => "valueN" in (f.byHouse[house] ?? {}));
        const unpriced = allFunds(v).filter((f) => f.byHouse[house] && !("valueN" in f.byHouse[house]!));
        if (!priced || unpriced.length === 0) continue;
        const o = lists(v, bundle, plan, { house, fund: priced.rec.id });
        const short = v.providers.find((p) => p.id === house)!.short;
        const words = [invest.pair.noPriceAt.doubt(short), invest.pair.noPriceAt.notSold(short), invest.pair.noPriceAt.missing(short), invest.pair.noPriceAt.other(short)].map((w) => w.replace(/"/g, "&quot;"));
        const said = words.filter((w) => o.includes(`>${w}</span>`));
        expect(said.length, `${idx.id} ${house}`).toBeGreaterThan(0);
        for (const w of said) expect(o, `${idx.id} ${house}`).toMatch(new RegExp(`class="term"[^>]*>${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`));
        seen++;
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe("every house keeps a row in the account list (founder, 2026-10-31)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  const out = lists(view, bundle, plan, pick);
  it("lists every house; one that prices no fund on an index stands last, with no data or not possible there", () => {
    for (const p of view.providers) expect(out).toContain(p.short.replace(/"/g, "&quot;"));
    let last = 0;
    for (const idx of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index: idx, plan });
      const pk = pickOfHeadline(v);
      if (!pk) continue;
      const o = lists(v, bundle, plan, pk);
      const none = v.providers.filter((p) => !p.id.startsWith("custom-broker-group") && !allFunds(v).some((f) => "valueN" in (f.byHouse[p.id] ?? {})));
      const some = v.providers.filter((p) => !p.id.startsWith("custom-broker-group") && !none.includes(p));
      for (const p of none) {
        expect(fundRow(o, p.id), `${idx.id} ${p.id}`).toMatch(/לא ברור אם אפשר שם|התעריפון עוד לא נאסף|לא אפשרי שם|אין מחיר/);
        expect(fundRow(o, p.id), `${idx.id} ${p.id}`).not.toContain("אין נתון");
        for (const q of some) expect(o.indexOf(`data-pick-key="${p.id}"`), `${idx.id} ${p.id} after ${q.id}`).toBeGreaterThan(o.indexOf(`data-pick-key="${q.id}"`));
        last++;
      }
    }
    expect(last).toBeGreaterThan(0);
  });
  it("the chosen fund's tile links it to its Maya page at the address that exists", () => {
    const fund = html(createElement(ChosenPair, { view, bundle, plan, pick, chosen: false }));
    expect(fund).not.toContain("funds/etfs");
    expect(fund).toContain("maya.tase.co.il/he/funds/mutual-funds/");
  });
});

describe("a bank's standing-order price the figure leaves out is said under the lists for the chosen account, and in its tile (D41, D56, D104)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const tracking = view.options.find((o) => o.id === "il-tracking")!.funds[0]!;
  it("no row carries a star; the chosen bank's note points to its card, and its tile says the printed price and the record's reason", () => {
    for (const id of ["leumi", "massad", "fibi"]) {
      const out = lists(view, bundle, plan, { house: id, fund: tracking.rec.id });
      expect(shown(out), id).not.toContain("*");
      const short = view.providers.find((p) => p.id === id)!.short;
      expect(shown(out).replace(/\u00a0/g, " "), id).toContain(invest.lists.otherPrice(short, invest.shownPair(false).cardTitle).replace(/\u00a0/g, " "));
      const line = bundle.snapshots.find((s) => s.id === id)!.lines.find((l) => l.not_ranked && l.applies_to.includes("mutual_fund_units"))!;
      const tile = html(createElement(ChosenPair, { view, bundle, plan, pick: { house: id, fund: tracking.rec.id }, chosen: true }));
      expect(tile, id).toContain(line.not_ranked!.reason_he.replace(/"/g, "&quot;"));
    }
    // an account with no other price says nothing of one
    expect(shown(lists(view, bundle, plan, { house: "psagot", fund: tracking.rec.id }))).not.toContain(invest.lists.otherPrice("פסגות", invest.shownPair(false).cardTitle).slice(10, 30));
  });
  it("a custom index's account list says the same, and under its head that monthly purchases are priced on the regular line", () => {
    const v = buildInvest({ bundle, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const list = html(createElement(NoFundAccountColumn, { view: v, bundle, years: 20, chosen: null, onPick: () => undefined }));
    expect(list).toContain(invest.pair.asideNote(3, v.providers.filter((p) => !p.foreign && !p.custom).length));
    for (const id of ["leumi", "massad", "fibi"]) expect(list, id).toContain(bundle.snapshots.find((s) => s.id === id)!.lines.find((l) => l.not_ranked)!.not_ranked!.reason_he.replace(/"/g, "&quot;"));
  });
});

describe("who reports the tax is the route's, not the fund's (TXF-29)", () => {
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
  it("a foreign fund says it has no variable or trustee fee, and an Israeli fund's missing fee stays not collected", () => {
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
    // a fund the person typed: the site reads no report of it, so nothing waits to be collected, and the note says so (D105)
    for (const domicile of ["IE", "IL"]) {
      const typed = { ...none, id: "custom-fund-x", domicile };
      const cellT = html(createElement(GapCell, { rec: typed, today, list: gapListFor(bundle, typed) }));
      expect(cellT, domicile).toContain(invest.kinds.gapTyped);
      expect(cellT, domicile).not.toContain(invest.kinds.gapNotCollected);
      expect(cellT, domicile).not.toContain(invest.kinds.gapNone);
      const noteT = gapNoteOf([typed], ["none"]);
      expect(noteT, domicile).toContain(`״${invest.kinds.gapTyped}״`);
      expect(noteT, domicile).not.toContain(`״${invest.kinds.gapNotCollected}״`);
    }
  });
  it("a foreign fund's gap is measured against the benchmark its own documents name, and none stands where the kind of index is unstated (F-92 (d))", () => {
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
    // the kind is said once, in the column's head and the note: never under every figure
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
    // the sheet heads with the definition and the figure's sign
    expect(sheet("1144385")!.signed).toBe(true);
    expect(sheet("1144385")!.about).toBe(invest.kinds.gapHead.net);
    // the sheet says the fund's return is after its costs and a lead is not a gain
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
    // one year is named, not called a yearly mean; three years are a yearly mean over the three the report prints
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
    // why the shekels are not the gap is the shekel column's "?", said only where the list has a gap column
    expect(invest.funds.diffHelp(true, true)).toContain("לא נספרת כרווח");
    expect(invest.funds.diffHelp(true, false)).not.toContain("לא נספרת כרווח");
    // TA-125: every gap against the gross index, nothing "not compared", so no sentence for it
    expect(noteOf(ta)).toContain("מדד ברוטו");
    expect(noteOf(ta)).not.toContain("״לא מושווה״");
    expect(noteOf(ta)).not.toContain("מדד נטו");
    // none compared: the column is left out and the note says so once
    expect(noteOf(["unstated", "none"])).toContain("אין עמודה כזאת");
    // "אין שנה מלאה" is explained where an Israeli fund shows it, "עוד לא נאסף" where a foreign one does, and neither otherwise
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
  it("a fund in Tel Aviv and abroad: the chosen fund's tile names its other listing", () => {
    const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
    const funds = allFunds(sp).filter((f) => kindOf(f.rec) === "unhedged");
    const distinct = new Set(funds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size;
    expect(distinct).toBeLessThan(funds.length);
    const tile = (fund: string) => shown(html(createElement(ChosenPair, { view: sp, bundle, plan, pick: { house: allFunds(sp).find((f) => f.rec.id === fund)!.best!.providerId, fund }, chosen: true })));
    expect(tile("1159250")).toContain(invest.pair.sameFundAs("IE00B5BMR087", true));
    expect(tile("ie00b5bmr087")).toContain(invest.pair.sameFundAs("1159250", false));
    // the list counts funds, so the head names no count of rows that would differ from it
    expect(shown(lists(sp, bundle, plan, pickOfHeadline(sp)!))).not.toContain("בשתי שורות");
  });
});

describe("the receipt's fund line names the variable fee the site prices beside the listed rate (independent check of pass 7: no test held it)", () => {
  it("1147362 on the MSCI ACWI: 0.3% listed, the mean charged over 2024 and 2025 priced; a fund charged its listed rate every year shows one figure", () => {
    const view = buildInvest({ bundle, index: indexById(bundle, "index-msci-acwi")!, plan });
    const head = pickOfHeadline(view)!;
    const rec = bundle.funds.find((f) => f.id === "1147362")!;
    const priced = pricedVariable(rec, gapListFor(bundle, rec), t)!;
    // recomputed from the record: 0.249 (2025) and 0.201 (2024), the years from 1.1.2024, when the rate changed
    expect(priced.years).toEqual([2025, 2024]);
    expect(priced.value.value).toBeCloseTo((0.249 + 0.201) / 2, 9);
    const card = (fund: string) => {
      const out = shown(html(createElement(PairReceipt, { view, bundle, plan, pick: { house: head.house, fund }, chosen: true })).replace(/<!-- -->/g, ""));
      return out.slice(out.indexOf(invest.pair.who.fund), out.indexOf(invest.pair.who.fund) + 300);
    };
    expect(card("1147362")).toContain(invest.kinds.variableChargedWord([2025, 2024]));
    expect(card("1147362")).toContain("0.225%");
    // 1144237 charged 0.3% in each of its years at a 0.3% rate: nothing to name beside it
    const same = bundle.funds.find((f) => f.id === "1144237")!;
    expect(pricedVariable(same, gapListFor(bundle, same), t)).toBeNull();
    expect(card("1144237")).not.toContain("שנגבו בפועל");
  });
});

describe("a fund row is its name: a label only where it tells two rows apart (D104)", () => {
  const accumulating = invest.labels?.["pays-accumulating"]?.text ?? "צוברת";
  it("no fund row on the index pages says a label every fund shares; two funds of one name (none in the data today) say what tells them apart", () => {
    for (const id of ["index-ta125", "index-ta35", "index-ta90", "index-sp500", "index-nasdaq100", "index-msci-world"]) {
      const view = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
      const pick = pickOfHeadline(view)!;
      const out = lists(view, bundle, plan, pick).replace(/<!-- -->/g, "");
      const priced = allFunds(view).filter((f) => "valueN" in (f.byHouse[pick.house] ?? {}));
      const names = new Map<string, number>();
      for (const f of priced) names.set(listName(view, f.name), (names.get(listName(view, f.name)) ?? 0) + 1);
      for (const f of priced) {
        const row = fundRow(out, f.rec.id);
        if ((names.get(listName(view, f.name)) ?? 0) > 1) {
          // the shared name, then a muted word after it
          expect(row, `${id} ${f.rec.id}`).toMatch(/ · /);
        } else expect(row, `${id} ${f.rec.id}`).not.toContain(accumulating);
      }
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
      // the head carries the row's full words: "בשנה · 3 שנים", not "בשנה"
      expect(head, `${f.id}: head "${head}", row "${row}"`).toBe(row);
      const sheet = html(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }));
      if (f.tracking_record!.years.length === 1) {
        one++;
        expect(head, f.id).toBe(`ב־${f.tracking_record!.years[0]!.year}`);
        expect(head, f.id).not.toContain("בשנה");
        // a one-year figure is no mean, and its sheet does not speak of one
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
  it("Interactive Brokers prices nothing on Tel Aviv: not possible there, by its own FAQ entry (it was no data until the entry was read, 2026-11-12)", () => {
    for (const x of at("il-etf", "interactive-brokers")) {
      expect("valueN" in x).toBe(false);
      expect("availability" in x && x.availability ? x.availability.source.url : "").toContain("faq/#/content/56713690");
    }
  });
  it("a house whose document names funds abroad is priced there, on the row that names them", () => {
    // a distributing fund is priced nowhere until its yield is known, so it has no row at any house
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
      const out = html(createElement(StairsFor, { view: v, bundle, plan, startHouse: null, startFund: null, example: true })).replace(/<!-- -->/g, "");
      // the account lane as shown: from its title to the next lane's, the copies laid out unseen to hold its height left out
      const seen = out.replace(/<div aria-hidden="true" class="invisible">[\s\S]*?<\/div>/g, "");
      const lane = seen.split(invest.stairs.lanes.account.title)[1]?.split(/<h5/)[0] ?? "";
      // the line's words are a button that opens why (D105): the tags inside the bold are left out
      const lines = [...lane.matchAll(/<b class="font-medium[^"]*">([\s\S]*?):<\/b>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, "").replace(/[\u2066-\u2069]/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, "\""));
      for (const m of lane.matchAll(/<b class="font-medium[^"]*">([\s\S]*?):<\/b>/g)) expect(m[1], `${index.id}: a grey line's words open why`).toContain('class="term"');
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

describe("before deciding: the tab cards", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view = buildInvest({ bundle, index, plan });
  const pick = pickOfHeadline(view)!;
  const share = { min: -50, max: 50, step: 10, start: 20 };
  const stairs = { view, bundle, startHouse: null, startFund: null };
  const before = (chosen: boolean) => html(createElement(BeforeDeciding, { view, bundle, plan, livePlan: plan, share, pick, chosen, hedge: true, stairs, onPick: () => undefined }));
  it("the tab list holds only its tabs: each card is one tab, its answer plain words with no control of its own", () => {
    const out = before(false);
    const list = out.slice(out.indexOf('role="tablist"'), out.indexOf('role="tabpanel"'));
    const buttons = list.match(/<button/g) ?? [];
    expect(buttons.length).toBeGreaterThan(1);
    expect(buttons.length).toBe((list.match(/role="tab"/g) ?? []).length);
    expect(list).not.toMatch(/<a |role="button"|data-num/);
    // the open card says so in a word too, not by colour alone
    expect(list).toContain(invest.before.openWord);
    // the hedged-or-not card stands wherever its section has its figures
    expect(shown(list)).toContain(invest.before.hedge.question);
  });
  it("before any pick, the pair is the receipt's, never the chosen one", () => {
    const out = shown(before(false));
    expect(out).toContain(`${invest.shownPair(false).name}:`);
    expect(out).not.toContain(invest.shownPair(true).name);
    expect(shown(before(true))).toContain(`${invest.shownPair(true).name}:`);
  });
  it("with no plan figure to say, the hedged-or-not card answers with how far the dollar moved, never blank", () => {
    let card: ReturnType<typeof hedgeCard> | null = null;
    const Probe = () => {
      const d = useDollarCase(view, bundle, plan, pick);
      card = d ? hedgeCard({ ...d, money: null, more: null }) : null;
      return null;
    };
    html(createElement(Probe));
    expect(card).not.toBeNull();
    const c = card!;
    expect(String(c.answer)).toMatch(new RegExp(`%.* ${invest.dollar.to} .*%`));
    expect(String(c.note)).toMatch(/\d{4}/);
  });
});

describe("a record that names the rules behind what an account does not sell names rules the site holds (2026-11-12)", () => {
  // the data check passes an id that is a heading in the rule base with no record in data/rules, and its card would open saying the page
  // does not hold the rule; the row's words open that card
  it("every rule an availability entry names has a record", async () => {
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const named = bundle.snapshots.flatMap((s) => (s.availability ?? []).flatMap((a) => a.rule_ids ?? []));
    expect(named).toEqual(expect.arrayContaining(["BRK-64", "BRK-65"]));
    for (const id of new Set(named)) expect(existsSync(join(fileURLToPath(new URL("../../../../data/rules", import.meta.url)), `${id.toLowerCase()}.json`)), id).toBe(true);
  });
});
