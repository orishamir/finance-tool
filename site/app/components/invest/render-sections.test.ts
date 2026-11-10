// The index page's sections rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { feeAbsent } from "../../lib/providers";
import { paybackMayLower, pricedVariable, buildInvest, doubtOf, gapListFor, indexById, indexSeenBy, knownIndices, refOfCustom, kindOf } from "../../lib/invest";
import { brokerLabels, fundLabels, optionLabels } from "../../lib/labels";
import { type SiteValue } from "../../lib/value";
import { Fees } from "./funds";
import { NoFundAccountColumn, NoFundCall, NoFundColumn } from "./no-fund";
import { IndexHeader } from "./sections";
import { AccountColumn, allFunds, FundColumn, GapCell, gapKindOf, gapNoteOf, gapStateOf, gapValue, PairResult, pickOfHeadline } from "./pair";
import { PlanBlock } from "./chips";
import { StairsSection } from "./stairs";
import { ValueSheet } from "../provenance";
import { bundle, t, plan, data, shown, html } from "./render-fixtures";

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
      createElement(PlanBlock, { knobs: null, onOpen: () => undefined, fx: bundle.fx, today: t, example: true, dollar: true })));
    expect(out).toContain("הפקדתם");
    // a dollar index with funds of both kinds shows each kind across the dollar (F-94)
    expect(out).toContain("בלי נטרול מט״ח");
    expect(out).toContain("עם נטרול מט״ח");
    // the shekel column's "?" says the amounts hold the rate still; the line under the list says what orders each kind
    expect(out).toContain("והסדר לא תלוי בדולר");
    expect(out).toContain("מול המדד");
    expect(out).toContain("עלות ב־20 שנים");
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

describe("a bank's standing-order price the figure leaves out is said beside its row (D41, D56)", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const tracking = view.options.find((o) => o.id === "il-tracking")!.funds[0]!;
  const out = html(createElement(AccountColumn, { view, bundle, years: 20, pick: { house: "psagot", fund: tracking.rec.id }, onPick: () => undefined }));
  it("each of the three banks' rows carries the 'not counted' tag, the printed price and the record's reason", () => {
    for (const id of ["leumi", "massad", "fibi"]) {
      const line = bundle.snapshots.find((s) => s.id === id)!.lines.find((l) => l.not_ranked && l.applies_to.includes("mutual_fund_units"))!;
      expect(out, id).toContain(line.not_ranked!.reason_he.replace(/"/g, "&quot;"));
    }
    expect(out).toContain(invest.pair.asideLine.split(":")[0]!);
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
  it("a fund in Tel Aviv and abroad: each of its rows names the other, and the group's head counts nothing", () => {
    const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
    const funds = allFunds(sp).filter((f) => kindOf(f.rec) === "unhedged");
    const distinct = new Set(funds.map((f) => f.rec.identifiers?.isin ?? f.rec.id)).size;
    expect(distinct).toBeLessThan(funds.length);
    const out = html(createElement(FundColumn, { view: sp, bundle, plan, today: t, pick: pickOfHeadline(sp)!, onPick: () => undefined, filter: null, onFilter: () => undefined })).replace(/<!-- -->/g, "");
    // the head counts nothing: it names the group and what all its funds share
    expect(out).toContain(`${invest.kinds.name.unhedged} · ${invest.kinds.allOf}`);
    expect(out).not.toContain(`${invest.kinds.name.unhedged} · ${invest.kinds.groupCount(distinct)}`);
    expect(out).not.toContain("בשתי שורות");
    // each row of the fund listed twice names the other, so the rows and the count agree visibly
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
  it("Interactive Brokers prices nothing on Tel Aviv: grey as no data, not as not possible", () => {
    for (const x of at("il-etf", "interactive-brokers")) {
      expect("valueN" in x).toBe(false);
      expect("availability" in x && x.availability).toBeFalsy();
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
