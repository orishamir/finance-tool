// The index page's sections rendered on the collected data (part of render.test.ts, which says why it is split).
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { taxIndexStatementOf } from "@finance-tool/engine";
import { invest, leftOut, numbers, provenance } from "../../copy";
import { fmt } from "../../lib/format";
import { feeAbsent } from "../../lib/providers";
import { paybackMayLower, pricedVariable, buildInvest, doubtOf, gapListFor, indexById, knownIndices, refOfCustom, kindOf } from "../../lib/invest";
import { brokerLabels, fundLabels, optionLabels } from "../../lib/labels";
import type { SiteValue } from "../../lib/value";
import { Fees } from "./funds";
import { reasonText } from "./parts";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "./no-fund";
import { TitleRow } from "./title";
import { allFunds, GapCell, gapKindOf, gapNoteOf, gapStateOf, gapValue, pickOfHeadline, whyNoFundAt, whyNoKindAt } from "./pair";
import { PlanCard } from "./plan-card";
import { ValueSheet } from "../provenance-sheets";
import { ProvenanceProvider } from "../provenance";
import { loadRules } from "../../lib/data.server";
import { PairLists, listName, markView } from "./lists";
import { PairReceipt } from "./receipt";
import { BeforeDeciding, hedgeCard, mapTab } from "./before";
import { useDollarCase } from "./dollar";
import { bundle, t, plan, data, shown, html, lists, fundRow, StairsFor } from "./render-fixtures";

describe("the index page's sections render", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: plan, yourBroker: "leumi" });
  it("all sections of a known index: the title, the plan, the receipt with its account and fund parts and the two linked lists", () => {
    const pick = pickOfHeadline(view)!;
    const leumi = { house: "leumi", fund: pick.fund };
    const out = html(createElement("div", null,
      createElement(TitleRow, { known: knownIndices(bundle), customs: [], index: view.index, others: knownIndices(bundle), bundle, onRemove: () => undefined, onRename: () => undefined, onSave: () => undefined, onGo: () => undefined }),
      createElement(PairReceipt, { view, bundle, plan: plan, pick, chosen: false }),
      createElement(PairReceipt, { view, bundle, plan: plan, pick: leumi, chosen: true }),
      createElement(PairLists, { view, bundle, plan, livePlan: plan, today: t, pick, chosen: false, onPick: () => undefined, moved: null }),
      createElement(PairReceipt, { view, bundle, plan: plan, pick: leumi, chosen: true, layout: "ticket" }),
      createElement(PlanCard, { knobs: null })));
    expect(out).toContain("הפקדתם");
    // a dollar index with funds of both kinds: the hedged ones stand under their own heading, each with its range across the dollar (F-94)
    expect(out).toContain(invest.kinds.name.hedged);
    expect(shown(out)).toMatch(new RegExp(`${invest.kinds.between} [^<]*${invest.kinds.and}`));
    expect(out).toContain("מול המדד");
    expect(out).toContain(invest.lists.kicker);
    expect(out).toContain(invest.lists.colLeft);
    expect(out).toContain(invest.shownPair(false).row);
    expect(out).toContain("פסגות");
    expect(out).toContain(invest.plan.heading);
    // the receipt's inflation line, in what the reader sees: its label, then what it takes
    expect(shown(out).replace(/[\u2066-\u2069]/g, "")).toMatch(new RegExp(`${invest.receipt.inflation}−[\\d,]+ ₪`));
  });
  it("before the first map comes, the map's card stands in its place with its question and no answer, and its panel keeps the room", () => {
    const pick = pickOfHeadline(view);
    if (!pick) throw new Error("missing: the page's pair");
    const tab = mapTab("waiting", view, pick, bundle);
    expect(tab?.key).toBe("map");
    expect(tab?.question).toBe(invest.before.map.question);
    // a blank that keeps the card's line
    expect(tab?.answer).toBe("\u00a0");
    const out = html(createElement("div", null, tab?.panel()));
    expect(out).toContain(invest.before.map.question);
    // nothing asked, no card
    expect(mapTab(null, view, pick, bundle)).toBeNull();
  });

  it("before any pick, the page's own pair is never called the person's, and each tile names its account and fund (2026-11-05)", () => {
    const pick = pickOfHeadline(view)!;
    const out = shown(html(createElement(PairReceipt, { view, bundle, plan: plan, pick, chosen: false })));
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
    // on a custom index abroad (every kind exists there) One Zero prices nothing: its Israeli funds are unknown (BRK-38) and it trades
    // only US securities. A planted one, Interactive Israel with its foreign securities not sold either, stands for a house its documents
    // shut out, its entries and rule as the record writes them
    const ii = bundle.snapshots.find((s) => s.id === "interactive-israel")!;
    const no = ii.availability!.find((a) => a.available === false)!;
    const planted = { ...bundle, snapshots: bundle.snapshots.map((s) => (s === ii ? { ...s, availability: [...s.availability!, { ...no, applies_to: ["foreign_securities"] }] } : s)) } as typeof bundle;
    const v = buildInvest({ bundle: planted, index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t }), plan });
    const out = html(createElement(NoFundAccountColumn, { view: v, bundle: planted, years: 20, chosen: null, onPick: () => undefined }));
    const missing = v.houses.filter((h) => !h.generic);
    expect(missing.map((h) => h.provider.id)).toEqual(["one-zero", "interactive-israel"]);
    const from = out.indexOf('data-pick-key="interactive-israel"');
    const next = out.indexOf("data-pick-key=", from + 1);
    const row = out.slice(from, next < 0 ? undefined : next);
    expect(row).toMatch(new RegExp(`class="(?:term|ruled)"[^>]*>${invest.pair.noFund.notSold}<`));
    expect(row).not.toContain("<a ");
    expect(shown(row)).not.toContain("אין נתון");
    expect(shown(row)).not.toContain(invest.pair.notPossibleSource);
    // its words open the company's rule
    const told = whyNoKindAt(planted, "interactive-israel", v.options.filter((o) => o.exists && o.id === "abroad").map((o) => ({ option: o.id, at: o.cells.find((x) => x.providerId === "interactive-israel") })));
    expect(told.state).toBe("notSold");
    expect(told.rules).toEqual(["BRK-65"]);
  });
});

describe("an account whose run an open question stopped", () => {
  it("says why in the rule's words, and its sentence carries the question, whose card it opens (TXG OQ17)", () => {
    const told = whyNoKindAt(bundle, "psagot", [{ option: "il-etf", at: { reason: { code: "rule-open", ruleId: "TXG-09", question: "TXG OQ17" } } }]);
    expect(told.why).toBe(invest.reasons.ruleOpen["TXG-09"]);
    expect(told.parts).toEqual([{ text: invest.reasons.ruleOpen["TXG-09"], question: "TXG OQ17" }]);
  });
  it("says a Tel Aviv foreign fund that pays out stops on its distribution's open tax, and the kind with no fund record on its unknown currency (TXF-04)", () => {
    expect(reasonText({ code: "rule-open", ruleId: "TXF-04", question: "TXF OQ19" }, "tase_foreign_fund_units")).toBe(invest.reasons.ruleOpen["TXF OQ19"]);
    expect(reasonText({ code: "rule-open", ruleId: "TXF-04" }, "tase_foreign_fund_units")).toBe(invest.reasons.ruleOpen["TXF-04"]);
    expect(invest.reasons.ruleOpen["TXF OQ19"]).not.toBe(invest.reasons.ruleOpen["TXF-04"]);
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
    expect(row).toMatch(new RegExp(`class="(?:term|ruled)"[^>]*>${invest.pair.noFund.notSold}<`));
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
        for (const w of said) expect(o, `${idx.id} ${house}`).toMatch(new RegExp(`class="(?:term|ruled)"[^>]*>${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`));
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
      const none = v.providers.filter((p) => !allFunds(v).some((f) => "valueN" in (f.byHouse[p.id] ?? {})));
      const some = v.providers.filter((p) => !none.includes(p));
      for (const p of none) {
        expect(fundRow(o, p.id), `${idx.id} ${p.id}`).toMatch(/לא ברור אם אפשר שם|התעריפון עוד לא נאסף|לא אפשרי שם|אין מחיר/);
        expect(fundRow(o, p.id), `${idx.id} ${p.id}`).not.toContain("אין נתון");
        for (const q of some) expect(o.indexOf(`data-pick-key="${p.id}"`), `${idx.id} ${p.id} after ${q.id}`).toBeGreaterThan(o.indexOf(`data-pick-key="${q.id}"`));
        last++;
      }
    }
    expect(last).toBeGreaterThan(0);
  });
  it("the receipt's fund part links the fund to its Maya page at the address that exists", () => {
    const fund = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false, layout: "ticket" }));
    expect(fund).not.toContain("funds/etfs");
    expect(fund).toContain("maya.tase.co.il/he/funds/mutual-funds/");
  });
});

describe("a bank's standing-order price the figure leaves out is said in the sheet of the mark beside its name (D41, D56, D104, D106)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const tracking = view.options.find((o) => o.id === "il-tracking")!.funds[0]!;
  it("no row carries a star or a line under the lists; the bank's mark opens a sheet that leads with the other price and its reason", () => {
    for (const id of ["leumi", "massad", "fibi"]) {
      const out = lists(view, bundle, plan, { house: id, fund: tracking.rec.id });
      expect(shown(out), id).not.toContain("*");
      expect(shown(out), id).not.toContain(invest.lists.otherPriceWords);
      const snap = bundle.snapshots.find((s) => s.id === id);
      const sheet = markView(snap, tracking.byHouse[id]);
      expect(sheet?.parts[0]?.head, id).toBe(invest.lists.otherPriceWords);
      const reason = snap?.lines.find((l) => l.not_ranked)?.not_ranked?.reason_he;
      expect(reason, id).toBeTruthy();
      expect(sheet?.parts.some((p) => p.text === reason), id).toBe(true);
      // the other price counts among what can change what some reader pays, so the mark is drawn beside the name
      expect(sheet?.warn, id).toBeGreaterThan(0);
      expect(out, id).toContain(leftOut.mark);
    }
    // an account with no other price says nothing of one
    expect(markView(bundle.snapshots.find((s) => s.id === "psagot"), tracking.byHouse.psagot)?.parts.some((p) => p.head === invest.lists.otherPriceWords) ?? false).toBe(false);
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
  it("a foreign fund in Tel Aviv whose annex states no index, and an Israeli fund whose documents name it a foreign-investment fund, wear no caution: their sheet tags the site's reading and names its rule, the Israeli fund's its document too; no note says it elsewhere (D84, D119, F-04)", () => {
    const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
    const pick = pickOfHeadline(sp)!;
    const raw = lists(sp, bundle, plan, pick);
    // the row's own markup, from its key to the next row's
    const rowOf = (id: string) => { const a = raw.indexOf(`data-pick-key="${id}"`); const rest = raw.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return a < 0 ? "" : b < 0 ? rest : rest.slice(0, b); };
    const caution = new RegExp(`<button[^>]*aria-label="[^"]*${numbers.doubt}[^"]*"`);
    // a sheet as a page shows it, with the rule records its chips name
    const rules = loadRules();
    const withRules = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { ...data, rules } } as never, el)));
    const named = allFunds(sp).filter((f) => f.rec.domicile === "IL" && typeof f.rec.tax_status.foreign_investment_fund?.value === "string" && f.byHouse[pick.house] && "valueN" in f.byHouse[pick.house]!);
    const cases = [{ id: "1183441", rule: "TXF-04" }, ...named.map((f) => ({ id: f.rec.id, rule: "TXS-14" }))];
    expect(named.length).toBeGreaterThan(0);
    for (const { id, rule } of cases) {
      const f = allFunds(sp).find((x) => x.rec.id === id)!;
      const at = f.byHouse[pick.house];
      if (!at || !("valueN" in at)) throw new Error(`${id} is priced at the chosen account`);
      // the figure in its own row carries no caution mark
      expect(rowOf(id), id).not.toBe("");
      expect(rowOf(id), id).not.toMatch(caution);
      // tapping it opens a sheet that tags the site's reading and names the rule it rests on, whose card says why; no doubt
      const record = rules[rule];
      if (!record?.title_he) throw new Error(`${rule} is in data/rules with its Hebrew title`);
      const markup = withRules(createElement(ValueSheet, { value: at.value, exact: false, data, headId: "h", descId: "d" }));
      const sheet = shown(markup);
      expect(sheet, id).toContain(numbers.reading);
      expect(sheet, id).not.toContain(numbers.doubt);
      expect(at.value.doubt, id).toBeUndefined();
      expect(at.value.labels, id).toContainEqual({ code: "reading", ruleId: rule });
      // its rules name the rule by its chip, whose title opens its card
      expect(sheet, id).toContain(provenance.computed.rules);
      expect(sheet.slice(sheet.indexOf(provenance.computed.rules)), id).toContain(record.title_he);
      // an Israeli fund's sheet names the fund's own document that names it a foreign-investment fund, opened at its page (D119)
      const status = f.rec.tax_status.foreign_investment_fund;
      if (rule === "TXS-14") {
        if (typeof status?.value !== "string") throw new Error(`${id}'s record names its principal currency`);
        expect(sheet, id).toContain(provenance.computed.statements);
        expect(sheet, id).toContain(provenance.computed.statement["foreign-investment-fund"]({ term: "foreign-investment-fund", currency: status.value, source: status.source, checked: status.checked }));
        expect(sheet, id).toContain(fmt.date(status.checked));
        expect(status.source.url, id).toMatch(/#page=\d+$/);
        expect(markup, id).toContain(`href="${status.source.url}"`);
      } else expect(sheet, id).not.toContain(provenance.computed.statements);
    }
    // a fund whose annex states its index wears none
    const stated = rowOf("1159250");
    expect(stated).not.toBe("");
    expect(stated).not.toMatch(caution);
    // no note of the open index anywhere on the lists
    const text = shown(raw);
    expect(text).not.toContain(invest.reasons.ruleOpen["TXF-04"]);
    for (const words of Object.values(numbers.readingDoubt).flatMap((w) => Object.values(w))) expect(text).not.toContain(words);
  });
  it("an accumulating foreign fund whose annex reports no ruling is ranked like any fund: in the ranked list with its spot and no mark, its sheet tagging the site's reading of TXF-11; nothing on the page says a fund is not ranked (D120, G-18)", () => {
    const index = indexById(bundle, "index-sp500");
    if (!index) throw new Error("the S&P 500 is an index of the collected data");
    const sp = buildInvest({ bundle, index, plan });
    const pick = pickOfHeadline(sp);
    const f = allFunds(sp).find((x) => x.rec.id === "1183441");
    if (!pick || !f) throw new Error("the S&P 500 has its own pair and holds Invesco 1183441");
    expect(f.rec.distribution_policy).toBe("accumulating");
    expect(f.rec.tax_ruling).toBeUndefined();
    const at = f.byHouse[pick.house];
    if (!at || !("valueN" in at)) throw new Error("1183441 is priced at the page's own account");
    const raw = lists(sp, bundle, plan, pick, { ruler: true });
    const rowOf = (id: string) => { const a = raw.indexOf(`data-pick-key="${id}"`); const rest = raw.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return a < 0 ? "" : b < 0 ? rest : rest.slice(0, b); };
    const row = rowOf("1183441");
    expect(row).not.toBe("");
    // a spot on the ruler, as every ranked fund has, and no caution mark or lock in its row
    expect(row).toContain("data-spot-dot");
    expect(row).not.toMatch(new RegExp(`<button[^>]*aria-label="[^"]*${numbers.doubt}[^"]*"`));
    expect(at.value.doubt).toBeUndefined();
    // its labels carry no chip on its tax (the one a fund whose annex reports a ruling has, citing it)
    expect(fundLabels(f.rec, sp.index, f.option).map((l) => l.id).filter((id) => id.startsWith("tax-on-sale"))).toEqual([]);
    const ruled = allFunds(sp).find((x) => x.rec.id === "ie00b5bmr087");
    expect(ruled && fundLabels(ruled.rec, sp.index, ruled.option).map((l) => l.id)).toContain("tax-on-sale-ruling");
    // ranked among the funds of its kind: above it only funds that leave more at the account
    const order = [...raw.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1] ?? "");
    for (const id of order.slice(0, order.indexOf("1183441"))) {
      const other = allFunds(sp).find((x) => x.rec.id === id);
      const w = other?.byHouse[pick.house];
      if (other && w && "valueN" in w && kindOf(other.rec) === kindOf(f.rec)) expect(w.valueN, id).toBeGreaterThanOrEqual(at.valueN);
    }
    // its sheet tags the site's reading and names TXF-11 by its title
    const rules = loadRules();
    const record = rules["TXF-11"];
    if (!record?.title_he) throw new Error("TXF-11 is in data/rules with its Hebrew title");
    expect(at.value.labels).toContainEqual({ code: "reading", ruleId: "TXF-11" });
    const sheet = shown(renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { ...data, rules } } as never, createElement(ValueSheet, { value: at.value, exact: false, data, headId: "h", descId: "d" })))));
    expect(sheet).toContain(numbers.reading);
    expect(sheet).not.toContain(numbers.doubt);
    expect(sheet.slice(sheet.indexOf(provenance.computed.rules))).toContain(record.title_he);
    // no heading, row or note on the lists says a fund or an account is not ranked, with any account chosen
    for (const house of sp.providers.map((p) => p.id)) {
      const text = shown(lists(sp, bundle, plan, { house, fund: pick.fund }, { ruler: true }));
      for (const words of ["לא מדורג", "לא מדרג", "בלי דירוג"]) expect(text, `${house}: ${words}`).not.toContain(words);
    }
  });
  it("a fund in Tel Aviv and abroad is counted once", () => {
    const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
    const funds = allFunds(sp).filter((f) => kindOf(f.rec) === "unhedged");
    const distinct = new Set(funds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size;
    expect(distinct).toBeLessThan(funds.length);
    // a Tel Aviv line whose annex states no index is priced on the site's reading (F-04, TXF OQ10, D119); one whose annex states its index
    // is priced on it (D84)
    expect(allFunds(sp).find((f) => f.rec.id === "1183441")?.reason).toBeUndefined();
    const stated = allFunds(sp).find((f) => f.rec.id === "1159250");
    expect(stated).toBeDefined();
    expect(stated?.reason).toBeUndefined();
    // the list counts funds, so the head names no count of rows that would differ from it
    expect(shown(lists(sp, bundle, plan, pickOfHeadline(sp)!))).not.toContain("בשתי שורות");
  });
  it("what a Tel Aviv line whose annex states its index leaves names the statement as the fund's, its annex opened at the page (F-04, D84)", () => {
    const sheetOf = (v: SiteValue) => html(createElement(ValueSheet, { value: v, exact: false, data, headId: "h", descId: "d" }));
    // the fund's figure where it is priced: a test whose fund is missing or unpriced fails on its own line
    const priced = (index: string, id: string) => {
      const ref = indexById(bundle, index);
      const f = ref ? allFunds(buildInvest({ bundle, index: ref, plan })).find((x) => x.rec.id === id) : undefined;
      if (!f?.best) throw new Error(`${id} is priced on ${index}`);
      return { rec: f.rec, value: f.best.value };
    };
    for (const [index, id, page, basis] of [
      ["index-sp500", "1159250", 17, "מס רווחי הון מחושב לפי שער הדולר"],
      ["index-msci-acwi", "1159235", 16, "מס רווחי הון מחושב לפי מדד המחירים לצרכן"],
    ] as const) {
      const f = priced(index, id);
      const sheet = sheetOf(f.value);
      const stated = taxIndexStatementOf(f.rec);
      if (!stated) throw new Error(`${id}'s record states its tax index`);
      expect(shown(sheet), id).toContain(provenance.computed.statements);
      expect(shown(sheet), id).toContain(provenance.computed.statement["tax-index"](stated));
      expect(shown(sheet), id).toContain(basis);
      // the date the annex's words were read, as every source on a sheet shows its own
      expect(shown(sheet), id).toContain(fmt.date(stated.checked));
      expect(sheet, id).toContain(`href="${f.rec.tax_ruling?.source.url ?? "(no ruling)"}#page=${page}"`);
    }
    // a fund bought abroad, the same units, is taxed on TXF-03: its sheet names no statement
    expect(shown(sheetOf(priced("index-sp500", "ie00b5bmr087").value))).not.toContain(provenance.computed.statements);
  });
});

describe("the receipt's fund line names the variable fee the site prices beside the listed rate (independent check of pass 7: no test held it)", () => {
  it("1147362 on the MSCI ACWI: 0.3% listed, the mean charged over 2024 and 2025 priced; a fund charged its listed rate every year shows one figure", () => {
    const rec = bundle.funds.find((f) => f.id === "1147362")!;
    const priced = pricedVariable(rec, gapListFor(bundle, rec), t)!;
    // recomputed from the record: 0.249 (2025) and 0.201 (2024), the years from 1.1.2024, when the rate changed
    expect(priced.years).toEqual([2025, 2024]);
    expect(priced.value.value).toBeCloseTo((0.249 + 0.201) / 2, 9);
    // 1144237 charged 0.3% in each of its years at a 0.3% rate: nothing to name beside it
    const same = bundle.funds.find((f) => f.id === "1144237")!;
    expect(pricedVariable(same, gapListFor(bundle, same), t)).toBeNull();
    // the receipt draws a priced pair: of every index's priced Israeli funds, each one's ticket
    // shows one variable line, its figure the mean charged where the site prices one (the run's), not the listed rate beside it
    let named = 0;
    let plain = 0;
    for (const index of knownIndices(bundle)) {
      const view = buildInvest({ bundle, index, plan });
      const head = pickOfHeadline(view);
      if (!head) continue;
      const card = (fund: string) => {
        // the fund's own lines: the ticket's fund part (on paper, behind a tap on the fund's name)
        const out = shown(html(createElement(PairReceipt, { view, bundle, plan, pick: { house: head.house, fund }, chosen: true, layout: "ticket" })).replace(/<!-- -->/g, ""));
        return out.slice(out.indexOf(invest.receipt.fundCharges), out.indexOf(invest.receipt.fundCharges) + 300);
      };
      for (const f of allFunds(view).filter((x) => x.rec.domicile === "IL" && x.rec.tracking_record && "valueN" in (x.byHouse[head.house] ?? {}))) {
        const p = pricedVariable(f.rec, gapListFor(bundle, f.rec), t);
        if (p && p.value.value !== f.rec.fees.variable_management?.value) {
          named++;
          expect(card(f.rec.id), f.rec.id).toContain(fmt.pct(p.value.value as number));
          expect(card(f.rec.id).split(invest.receipt.fundFees.variable).length - 1, f.rec.id).toBe(1);
        } else if (!p) {
          plain++;
          expect(card(f.rec.id), f.rec.id).not.toContain("שנגבו בפועל");
        }
      }
    }
    expect(named).toBeGreaterThan(0);
    expect(plain).toBeGreaterThan(0);
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
  // a fund's entry at a house, for the funds the page prices house by house
  const at = (option: string, house: string) => view.options.find((o) => o.id === option)!.funds.filter((f) => !f.reason).map((f) => f.byHouse[house]!);
  it("PEPPER is no house of its own (its prices stand under Leumi, D43 amended 2026-11-04)", () => {
    expect(view.providers.map((p) => p.id)).not.toContain("pepper");
    expect(view.providers.map((p) => p.id)).toContain("leumi");
  });
  it("Interactive Brokers prices nothing on Tel Aviv: not possible there, by its own FAQ entry (it was no data until the entry was read, 2026-11-12)", () => {
    expect(at("il-etf", "interactive-brokers").length).toBeGreaterThan(0);
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
            // a house that sells the kind fund by fund answers for each fund a report names (BRK-38): the doubt stands for a fund none names
            if (!doubtOf(snap, o.id) || snap?.fundByFund?.named.includes(f.rec.identifiers.tase_number ?? f.rec.id)) continue;
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
      for (const m of lane.matchAll(/<b class="font-medium[^"]*">([\s\S]*?):<\/b>/g)) expect(m[1], `${index.id}: a grey line's words open why`).toMatch(/class="(?:term|ruled)"/);
      const names = [...new Set(allFunds(v).map((f) => f.name))];
      for (const line of lines) {
        grey++;
        expect(names.some((n) => line.includes(n)), `${index.id}: "${line}" names no fund`).toBe(true);
        expect(Object.values(invest.stairs.why), `${index.id}: "${line}" is the other lanes' bare words`).not.toContain(line);
      }
    }
    expect(grey, "no grey line rendered in any account lane").toBeGreaterThan(0);
  });
  it("One Zero prices an Israeli fund where a distribution agreement its manager reports names it; any other is open, never \"not sold\" (BRK-38, BRK OQ24); no ETF; and no fund traded outside the US", () => {
    const snap = bundle.snapshots.find((s) => s.id === "one-zero")!;
    const ff = snap.fundByFund!;
    // every index's tracking funds the page prices house by house
    const funds = knownIndices(bundle).flatMap((i) => buildInvest({ bundle, index: i, plan }).options.find((o) => o.id === "il-tracking")?.funds.filter((f) => !f.reason) ?? []);
    expect(funds.length).toBeGreaterThan(0);
    let priced = 0;
    let open = 0;
    for (const f of funds) {
      const at = f.byHouse["one-zero"]!;
      if (ff.named.includes(f.rec.id)) priced += "valueN" in at ? 1 : 0;
      else {
        open++;
        // open, with the record's words for a fund no report names and the search as its source; no "not sold" entry
        expect("valueN" in at, f.rec.id).toBe(false);
        expect("availability" in at && at.availability, f.rec.id).toBeFalsy();
        expect("doubt" in at && at.doubt?.reason_he, f.rec.id).toBe(ff.unnamed.reason_he);
        expect("doubt" in at && at.doubt?.source.url, f.rec.id).toBe(ff.search.url);
        expect("reason" in at && at.reason, f.rec.id).toEqual({ code: "no-agreement-found" });
      }
    }
    expect(priced).toBeGreaterThan(0);
    expect(open).toBeGreaterThan(0);
    for (const x of at("il-etf", "one-zero")) expect("valueN" in x).toBe(false);
    const uk = view.options.find((o) => o.id === "abroad")!.funds.find((f) => /UCITS/.test(f.rec.names.en[0] ?? ""));
    if (uk) expect("valueN" in uk.byHouse["one-zero"]!).toBe(false);
  });
  it("each new kind of no price says its own words, never a missing line or a line without value (sold fund by fund, a fund no agreement names, a bound not printed for the currency)", () => {
    const words = [reasonText({ code: "sold-fund-by-fund" }, "mutual_fund_units"), reasonText({ code: "no-agreement-found" }, "mutual_fund_units"), reasonText({ code: "not-printed-for-currency", detail: "", lineName: "מניות ותעודות סל הנסחרות באירופה", currency: "USD", printed: ["EUR", "GBP", "CHF"] }, "foreign_securities")];
    expect(words).toEqual([invest.reasons.soldFundByFund, invest.reasons.noAgreementFound, expect.stringContaining("אירו, פאונד ופרנק שוויצרי")]);
    expect(words[2]).toContain("דולר");
  });
  it("on an index page, One Zero's line for a fund no report names reads open with the search and the open question, and a named fund shows its price (rendered)", () => {
    const ff = bundle.snapshots.find((s) => s.id === "one-zero")!.fundByFund!;
    // the first index whose tracking funds priced house by house hold one no report names and one One Zero prices
    const found = knownIndices(bundle).map((index) => {
      const funds = buildInvest({ bundle, index, plan }).options.find((o) => o.id === "il-tracking")?.funds.filter((f) => !f.reason) ?? [];
      return { index, unnamed: funds.find((f) => !ff.named.includes(f.rec.id)), named: funds.find((f) => ff.named.includes(f.rec.id) && "valueN" in f.byHouse["one-zero"]!) };
    }).find((c) => c.unnamed && c.named);
    if (!found) throw new Error("no index has a tracking fund no One Zero report names and one it prices");
    // and, built for the test, a second fund a One Zero report names (the named one's twin under its own number), the pick the named
    // fund's row is set against,
    // and a manager's fee of 0.5% a year, so the two rows differ
    const base = found.named!.rec;
    const twin = { ...base, id: "9999901", names: { ...base.names, he: ["קרן תאומה לבדיקה"] }, identifiers: { ...base.identifiers, tase_number: "9999901" }, fees: { ...base.fees, fixed_management: { ...base.fees.fixed_management!, value: 0.5 } } };
    const b = { ...bundle, funds: [...bundle.funds, twin], snapshots: bundle.snapshots.map((s) => (s.id === "one-zero" ? { ...s, fundByFund: { ...ff, named: [...ff.named, twin.id] } } : s)) };
    const sp = buildInvest({ bundle: b, index: found.index, plan });
    const unnamed = found.unnamed!;
    const named = found.named!;
    const house = sp.providers.find((p) => p.id === "one-zero")!.short;
    // what the row says and what its words open: the fund's own reason, the search as its document, BRK-38 and BRK OQ24
    const why = whyNoFundAt(bundle, "one-zero", [unnamed]);
    expect(why.state).toBe("doubt");
    expect(why.why).toBe(ff.unnamed.reason_he);
    expect(why.parts[0]?.doc?.href).toContain("maya.tase.co.il");
    expect(why.rules).toEqual(["BRK-38", "BRK-OQ24"]);
    // the list with One Zero picked: the unnamed fund under the grey line of a doubt, the named one priced
    const out = lists(sp, b, plan, { house: "one-zero", fund: twin.id });
    // the grey line the unnamed fund's row stands under is the doubt's, not "not sold" (One Zero's ETFs stand under that one)
    const before = shown(out.slice(0, out.indexOf(`data-pick-key="${unnamed.rec.id}"`)));
    expect(before.lastIndexOf(invest.pair.noPriceAt.doubt(house))).toBeGreaterThan(before.lastIndexOf(invest.pair.noPriceAt.notSold(house)));
    expect(fundRow(out, unnamed.rec.id)).toBeTruthy();
    // the named fund, beside the pick, shows its figure against it
    expect(fundRow(out, named.rec.id)).toMatch(/₪/);
  });

});

describe("before deciding: the tab cards", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view = buildInvest({ bundle, index, plan });
  const pick = pickOfHeadline(view)!;
  const share = { min: -50, max: 50, step: 10, start: 20 };
  const stairs = { view, bundle, startHouse: null, startFund: null };
  // each render works out the account map, a second or two: one render of each kind serves every test below
  const rendered = new Map<boolean, string>();
  const before = (chosen: boolean) => {
    const out = rendered.get(chosen) ?? html(createElement(BeforeDeciding, { view, bundle, plan, livePlan: plan, share, pick, chosen, hedge: true, stairs }));
    rendered.set(chosen, out);
    return out;
  };
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
  it("the first card asks when another account is cheaper, and its map is the panel open under the cards", () => {
    const out = shown(before(false));
    const tabs = out.slice(0, out.indexOf(invest.before.map.kicker));
    expect(tabs.indexOf(invest.before.map.question)).toBeGreaterThanOrEqual(0);
    expect(tabs.indexOf(invest.before.map.question)).toBeLessThan(tabs.indexOf(invest.before.sens.question));
    // the panel: its axes by name and the plan's point; with no point kept, no reading under the map (a box at the pointer or a kept point
    // says what a point holds)
    for (const words of [invest.before.map.xTitle, invest.before.map.yTitle, invest.before.map.plan]) expect(out).toContain(words);
    expect(out).not.toContain(invest.before.map.planHead);
  });
  it("before any pick, the pair is the receipt's, never the chosen one", () => {
    // the section names the pair only in its cards' spoken name, now that no line leads it
    const out = before(false);
    expect(out).toContain(`aria-label="${invest.shownPair(false).tabs}"`);
    expect(out).not.toContain(invest.shownPair(true).name);
    expect(before(true)).toContain(`aria-label="${invest.shownPair(true).tabs}"`);
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

describe("the fold of funds with no price says its reason in the plural over two funds or more", () => {
  it("a fund's own reason shared by several funds reads in the plural, and in the singular over one", () => {
    // every index whose fund list holds funds no account prices for one reason of their own, at the page's pair
    let seen = 0;
    for (const index of knownIndices(bundle)) {
      const view = buildInvest({ bundle, index, plan });
      const pick = pickOfHeadline(view);
      if (!pick) continue;
      const own = allFunds(view).flatMap((f) => (f.reason && !f.byHouse[pick.house] ? [{ f, reason: f.reason }] : []));
      const byReason = new Map<string, number>();
      for (const { reason } of own) byReason.set(reason.code, (byReason.get(reason.code) ?? 0) + 1);
      const out = shown(lists(view, bundle, plan, pick));
      for (const { f, reason } of own) {
        const cls = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "tase_foreign_fund_units", abroad: "foreign_securities" }[f.option];
        const one = reasonText(reason, cls);
        const many = reasonText(reason, cls, true);
        if (one === many) continue;
        seen++;
        if ((byReason.get(reason.code) ?? 0) > 1) {
          expect(out, `${index.id}: ${reason.code}`).toContain(many);
          expect(out, `${index.id}: ${reason.code}`).not.toContain(one);
        } else expect(out, `${index.id}: ${reason.code}`).toContain(one);
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});
