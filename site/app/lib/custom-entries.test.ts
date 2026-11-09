// A broker and a fund the person types (D44): they run through the engine's path, rank with the collected houses, and go through the saved
// state and the export file. The expected figures are printed by tests/golden/expected_custom_entries.py, none written by hand.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { AccountColumn, allFunds, FundColumn, pickOfHeadline, PairResult, whyNoPrice } from "../components/invest/pair";
import { invest } from "../copy";
import { LabelSheetHost } from "../components/kit";
import { ProvenanceProvider } from "../components/provenance";
import { baseOf } from "./own-account";
import { brokerDraftOf, brokerErrors, brokerFromDraft, fundDraftOf, fundErrors, fundFromDraft, tariffOfBroker, unknownLines, validCustomBrokers, validCustomFunds, withCustomEntries, type CustomBroker, type CustomFund } from "./custom-entries";
import { fundLabels } from "./labels";
import { buildInvest, indexById, indexSeenBy, optionOfFund, pairCosts, refOfCustom, type WayPrice } from "./invest";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { applyImport, buildStateFile, ensureLoaded, exportCounts, flush, getSnapshot, isEmptyState, readImport, removeCustomBroker, removeCustomFund, removeCustomIndex, resetStore, saveCustomBroker, saveCustomFund, saveCustomIndex, STATE_KEY, stateFileText, type StateV3 } from "./state";
import { gridOf } from "./stairs";
import { entered, type SiteValue } from "./value";

const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 6000,
  monthly: 400,
  years: 20,
  grossReturn: 0.07,
  inflation: 0.02,
  age: null,
  income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: false,
  returnFromParameter: false,
};

// the terms of tests/golden/expected_custom_entries.py
// every line typed, a fee not charged as 0 (a line left empty is a price not known, and the account is not ranked); the golden
// script's figures are for the same zeros
// a minimum not charged is typed as 0 too (a blank minimum was charged as none); a minimum of 0 is no minimum, as in the golden script
const cheap = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה זולה", tradePct: 0.05, tradeMin: 1, custodyPct: 0.02, custodyMin: 0, fxPct: 0.2, monthlyFee: 0 }, "custom-broker-cheap", t);
const dear = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה יקרה", tradePct: 0.5, tradeMin: 30, custodyPct: 0.4, custodyMin: 10, fxPct: 1, monthlyFee: 20 }, "custom-broker-dear", t);
const zeros = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה ריקה", tradePct: 0, tradeMin: 0, custodyPct: 0, custodyMin: 0, fxPct: 0, monthlyFee: 0 }, "custom-broker-zeros", t);
/** Only the commission it was offered, the rest left empty (it took the star with every blank as zero). */
const partial = brokerFromDraft({ ...brokerDraftOf(null), name: "רק עמלה", tradePct: 0.08 }, "custom-broker-partial", t);
/** A fund draft that says it accumulates and is unhedged, as the golden script prices it (since a payout not said has no price). */
const said = (kind: Parameters<typeof fundDraftOf>[1]) => ({ ...fundDraftOf(null, kind), payout: "accumulating" as const, hedged: false });
const fund = fundFromDraft({ ...said("il-tracking"), name: "קרן שלי", fixed: 0.2, variable: 0.05, trustee: 0.02 }, "custom-fund-mine", "index-ta125", t);
const abroad = fundFromDraft({ ...said("abroad"), name: "קרן בחו״ל שלי", fixed: 0.1 }, "custom-fund-abroad", "index-sp500", t);

/** Printed by the script. */
const EXPECTED = { cheapIl: 153279.0, dearIl: 132143.22, cheapAbroad: 150677.85, oneZeroIl: 144506.01, zerosIl: 154017.67 };

const ta125 = indexById(bundle, "index-ta125")!;
const sp = indexById(bundle, "index-sp500")!;
const priced = (x: unknown): x is WayPrice => !!x && typeof x === "object" && "valueN" in x;

describe("a broker the person types ranks with the others (D44)", () => {
  const b = withCustomEntries(bundle, [cheap, dear, zeros], [fund, abroad]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const mine = allFunds(view).find((f) => f.rec.id === fund.id)!;
  const valueAt = (id: string) => {
    const at = mine.byHouse[id];
    return priced(at) ? at.valueN : NaN;
  };

  it("leaves what the script says, through the engine's entered path", () => {
    expect(valueAt(cheap.id)).toBeCloseTo(EXPECTED.cheapIl, 1);
    expect(valueAt(dear.id)).toBeCloseTo(EXPECTED.dearIl, 1);
    expect(valueAt(zeros.id)).toBeCloseTo(EXPECTED.zerosIl, 1);
  });

  it("ranks where the script's figure puts it among the collected houses, and a dearer one lower", () => {
    const collected = view.providers.filter((p) => !p.custom).map((p) => valueAt(p.id)).filter((v) => !Number.isNaN(v));
    expect(collected.length).toBeGreaterThan(5);
    const place = (v: number) => 1 + collected.filter((x) => x > v).length;
    const order = view.providers.filter((p) => !Number.isNaN(valueAt(p.id))).sort((x, y) => valueAt(y.id) - valueAt(x.id)).map((p) => p.id);
    // the others typed stand in the same list: the broker of zeros above the cheap one, the dear one below both
    expect(order.indexOf(zeros.id)).toBe(place(EXPECTED.zerosIl) - 1);
    expect(order.indexOf(cheap.id)).toBe(place(EXPECTED.cheapIl) - 1 + 1);
    expect(order.indexOf(dear.id)).toBe(place(EXPECTED.dearIl) - 1 + 2);
    expect(valueAt(dear.id)).toBeLessThan(valueAt(cheap.id));
  });

  it("may be the cheapest: the headline names it, as a computed figure", () => {
    expect(view.headline!.providerId).toBe(zeros.id);
    expect(view.headline!.value.state).toBe("computed");
  });

  it("a figure computed on typed terms lists them among its inputs (D7)", () => {
    const value = (mine.byHouse[cheap.id] as WayPrice).value;
    expect(value.state).toBe("computed");
    const typed = Object.values(value.computed_from!.inputs as Record<string, SiteValue>).filter((v) => v.state === "entered").map((v) => `${v.unit}:${v.value}`);
    expect(typed).toEqual(expect.arrayContaining(["pct_of_trade:0.05", "nis_per_trade:1", "pct_per_year:0.02", "pct_per_year:0.2", "pct_per_year:0.05"]));
  });

  it("an account with a line left empty has no price, is never ranked, and its row says why (silence is not zero)", () => {
    expect(unknownLines(partial)).toHaveLength(5);
    const b2 = withCustomEntries(bundle, [partial], [fund]);
    const v2 = buildInvest({ bundle: b2, index: ta125, plan });
    const at = v2.options.flatMap((o) => o.funds).find((f) => f.rec.id === v2.headline!.fund.rec.id)!.byHouse[partial.id];
    expect(at && "valueN" in at).toBe(false);
    expect(v2.headline!.providerId).not.toBe(partial.id);
    expect(b2.snapshots.find((s) => s.id === partial.id)!.missing_reason_he).toBeTruthy();
  });

  it("a minimum left empty is a price not known too: the account is not ranked, and the dialog's own words hold", () => {
    // commission, custody and conversion typed, both minimums left empty; it was ranked first
    const noMins = brokerFromDraft({ ...brokerDraftOf(null), name: "הבנק שלי", tradePct: 0.08, custodyPct: 0.1, fxPct: 0.2, monthlyFee: 0 }, "custom-broker-nomins", t);
    expect(unknownLines(noMins)).toHaveLength(2);
    const b2 = withCustomEntries(bundle, [noMins], []);
    expect(b2.entered!.tariffs[noMins.id]).toBeUndefined();
    const v2 = buildInvest({ bundle: b2, index: sp, plan });
    for (const f of allFunds(v2)) expect(priced(f.byHouse[noMins.id])).toBe(false);
    expect(v2.headline!.providerId).not.toBe(noMins.id);
    // a minimum typed and its percent left empty
    const minOnly = brokerFromDraft({ ...brokerDraftOf(null), name: "רק מינימום", tradeMin: 5, custodyPct: 0.1, custodyMin: 0, fxPct: 0.2, monthlyFee: 0 }, "custom-broker-minonly", t);
    expect(withCustomEntries(bundle, [minOnly], []).entered!.tariffs[minOnly.id]).toBeUndefined();
  });

  it("a conversion left empty leaves only the funds bought abroad without a price there; an Israeli index ranks the account", () => {
    const noFx = brokerFromDraft({ ...brokerDraftOf(null), name: "בלי המרה", tradePct: 0.05, tradeMin: 1, custodyPct: 0.02, custodyMin: 0, monthlyFee: 0 }, "custom-broker-nofx", t);
    expect(unknownLines(noFx)).toEqual([invest.customEntries.fields.fx]);
    const b2 = withCustomEntries(bundle, [noFx], [fund]);
    const onTa = buildInvest({ bundle: b2, index: ta125, plan });
    const mineTa = allFunds(onTa).find((f) => f.rec.id === fund.id)!.byHouse[noFx.id];
    expect(priced(mineTa) && mineTa.valueN).toBeCloseTo(EXPECTED.cheapIl, 1);
    const onSp = buildInvest({ bundle: b2, index: sp, plan });
    const israeliOnSp = allFunds(onSp).filter((f) => f.option === "il-etf" || f.option === "il-tracking");
    const abroadOnSp = allFunds(onSp).filter((f) => f.option === "abroad");
    expect(israeliOnSp.some((f) => priced(f.byHouse[noFx.id]))).toBe(true);
    expect(abroadOnSp.length).toBeGreaterThan(0);
    for (const f of abroadOnSp) expect(priced(f.byHouse[noFx.id])).toBe(false);
    expect(whyNoPrice(b2, noFx.id, abroadOnSp[0]!)).toBe(invest.customEntries.fxUnknown);
    // the stairs say the same: a price not typed, never a doubt whether the account sells it (fourth pass)
    expect(gridOf(onSp, b2.snapshots).why(noFx.id, abroadOnSp[0]!.rec.id)).toBe("n");
  });

  it("a fund typed with a fee left empty has no price, with the reason; a fee typed as 0 is priced", () => {
    const blank = fundFromDraft({ ...said("il-tracking"), name: "בלי שכר נאמן", fixed: 0.2, variable: 0.05 }, "custom-fund-blank", "index-ta125", t);
    const v2 = buildInvest({ bundle: withCustomEntries(bundle, [], [blank]), index: ta125, plan });
    const f = allFunds(v2).find((x) => x.rec.id === blank.id)!;
    expect(f.reason).toEqual({ code: "fee-unknown" });
    expect(Object.values(f.byHouse).some(priced)).toBe(false);
    const typed = fundFromDraft({ ...said("il-tracking"), name: "שכר נאמן 0", fixed: 0.2, variable: 0.05, trustee: 0 }, "custom-fund-zero", "index-ta125", t);
    const v3 = buildInvest({ bundle: withCustomEntries(bundle, [], [typed]), index: ta125, plan });
    expect(allFunds(v3).find((x) => x.rec.id === typed.id)!.best?.valueN).toBeGreaterThan(0);
  });

  it("charges a fee typed as zero nothing, and keeps the row's figures in the entered state", () => {
    expect(cheap.monthlyFee!.value).toBe(0);
    expect(cheap.tradePct!.state).toBe("entered");
    const tariff = tariffOfBroker(cheap);
    expect(tariff.monthlyFee).toBe(0);
    expect(tariff.custody).toEqual({ rate: 0.02 / 100 / 12, everyMonths: 1 });
    const w = tariffOfBroker(dear);
    expect(w.custody).toEqual({ rate: 0.4 / 100 / 12, everyMonths: 1, min: 10 });
    expect(w.buy).toEqual({ rate: 0.005, min: 30 });
  });

  it("a house's own figures do not change because of it; the page without it is the page it was", () => {
    const before = buildInvest({ bundle, index: ta125, plan });
    for (const p of before.providers) {
      for (const f of allFunds(before)) {
        const was = f.byHouse[p.id];
        const now = allFunds(view).find((x) => x.rec.id === f.rec.id)!.byHouse[p.id];
        expect(priced(now) ? now.valueN : null).toBe(priced(was) ? was.valueN : null);
      }
    }
    // nothing typed: the same bundle, so nothing is priced again
    expect(withCustomEntries(bundle, [], [])).toBe(bundle);
    const after = buildInvest({ bundle: withCustomEntries(bundle, [], []), index: ta125, plan });
    expect(after.headline!.providerId).toBe(before.headline!.providerId);
    expect(after.providers.length).toBe(before.providers.length);
  });

  it("what it does not sell is a row saying so, not a price", () => {
    const onlyAbroad = brokerFromDraft({ ...brokerDraftOf(null), name: "רק בחו״ל", tradePct: 0.1, sellsIsraeli: false }, "custom-broker-abroad", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [onlyAbroad], [fund]), index: ta125, plan });
    const at = allFunds(v).find((f) => f.rec.id === fund.id)!.byHouse[onlyAbroad.id]!;
    expect(priced(at)).toBe(false);
    expect("availability" in at && at.availability).toBeTruthy();
  });

  it("has its cost split by who takes it, as any pair (F-91)", () => {
    const pc = pairCosts({ bundle: b, index: ta125, plan, fundId: fund.id, providerId: cheap.id })!;
    expect(pc.left.value as number).toBeCloseTo(EXPECTED.cheapIl, 1);
    const sum = pc.account.reduce((a, l) => a + (l.cost.value as number), 0) + pc.interaction + (pc.fund.value as number) + (pc.tax.value as number);
    expect(sum).toBeCloseTo(pc.base - (pc.left.value as number), 6);
  });
});

describe("a fund the person types is priced at the collected houses under its kind's rules (D44)", () => {
  const b = withCustomEntries(bundle, [cheap], [fund, abroad]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const mine = allFunds(view).find((f) => f.rec.id === fund.id)!;
  const spView = buildInvest({ bundle: b, index: sp, plan });
  const mineAbroad = allFunds(spView).find((f) => f.rec.id === abroad.id)!;

  it("an Israeli tracking fund leaves what the script says at One Zero, and has a row at every house", () => {
    expect((mine.byHouse["one-zero"] as WayPrice).valueN).toBeCloseTo(EXPECTED.oneZeroIl, 1);
    const collected = view.options.find((o) => o.id === "il-tracking")!.funds.find((f) => f.rec.id !== fund.id)!;
    for (const p of view.providers.filter((x) => !x.custom)) {
      expect(mine.byHouse[p.id], p.id).toBeTruthy();
      expect(priced(mine.byHouse[p.id]), p.id).toBe(priced(collected.byHouse[p.id]));
    }
  });

  it("each kind falls in its own option and tariff class", () => {
    const kinds = ["il-tracking", "il-etf", "tase-foreign", "abroad"] as const;
    for (const kind of kinds) {
      const f = fundFromDraft({ ...said(kind), name: kind, fixed: 0.1, variable: 0, trustee: 0 }, `custom-fund-${kind}`, "index-sp500", t);
      const rec = withCustomEntries(bundle, [], [f]).funds.at(-1)!;
      expect(optionOfFund(rec, undefined)).toBe(kind);
      expect(rec.distribution_policy).toBe("accumulating");
    }
  });

  it("a foreign fund carries the open rule's tag, shown and not ranked, as a collected one does", () => {
    const at = mineAbroad.byHouse[cheap.id] as WayPrice;
    expect(at.open).toBe(true);
    expect(at.valueN).toBeCloseTo(EXPECTED.cheapAbroad, 1);
    expect(spView.headline!.fund.rec.id).not.toBe(abroad.id);
  });

  it("a hedged fund has no price, with the reason, as a collected fund with no report", () => {
    const hedged = fundFromDraft({ ...said("il-tracking"), name: "מנוטרלת", fixed: 0.1, variable: 0, trustee: 0, hedged: true }, "custom-fund-hedged", "index-sp500", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [hedged]), index: sp, plan });
    const f = allFunds(v).find((x) => x.rec.id === hedged.id)!;
    expect(f.reason).toEqual({ code: "no-hedge-entered" });
    expect(Object.keys(f.byHouse)).toEqual([]);
  });

  it("belongs to the index it was added on, a custom index too", () => {
    expect(allFunds(view).some((f) => f.rec.id === abroad.id)).toBe(false);
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    const onCustom = fundFromDraft({ ...said("il-tracking"), name: "על ניקיי", fixed: 0.3, variable: 0, trustee: 0 }, "custom-fund-nikkei", custom.id, t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [onCustom], [custom]), index: refOfCustom(custom), plan });
    const f = allFunds(v).find((x) => x.rec.id === onCustom.id)!;
    expect(f.best?.valueN).toBeGreaterThan(0);
    expect(v.headline?.fund.rec.id).toBe(onCustom.id);
    expect(v.fundCount).toBe(1);
  });

  it("on an index the person added, the currency is named by no one: חשיפה למט״ח, never the dollar (founder, 2026-11-05)", () => {
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    const onCustom = fundFromDraft({ ...said("il-tracking"), name: "על ניקיי", fixed: 0.3 }, "custom-fund-nikkei", custom.id, t);
    const rec = withCustomEntries(bundle, [], [onCustom], [custom]).funds.at(-1)!;
    const labels = fundLabels(rec, refOfCustom(custom), onCustom.kind);
    expect(labels.map((l) => l.id)).toContain("currency-foreign");
    expect(labels.map((l) => l.id)).not.toContain("currency");
    expect(labels.map((l) => l.text).join(" ")).not.toContain("דולר");
    const hedgedRec = withCustomEntries(bundle, [], [{ ...onCustom, hedged: true }], [custom]).funds.at(-1)!;
    expect(fundLabels(hedgedRec, refOfCustom(custom), onCustom.kind).map((l) => l.explain).join(" ")).not.toContain("דולר");
  });

  it("on an index the person added, \"המדד בשקלים\" is the fund's own answer: no currency label, and it is priced, at home or abroad (2026-11-05)", () => {
    const custom = { id: "custom-ta-tech", name: "טכנולוגיה ישראלית", added: t };
    const index = refOfCustom(custom);
    expect(index.israeli).toBe(false);
    for (const kind of ["il-tracking", "abroad"] as const) {
      const f = fundFromDraft({ ...said(kind), name: kind, fixed: 0.2, variable: 0, trustee: 0, shekelIndex: true }, `custom-fund-${kind}`, custom.id, t);
      expect(f.shekelIndex).toBe(true);
      const b = withCustomEntries(bundle, [], [f], [custom]);
      expect(b.entered!.shekelFunds).toEqual([f.id]);
      const rec = b.funds.at(-1)!;
      const ids = fundLabels(rec, indexSeenBy(index, rec, b), kind).map((l) => l.id);
      expect(ids).not.toContain("currency-foreign");
      expect(ids).not.toContain("tax-currency");
      const way = allFunds(buildInvest({ bundle: b, index, plan })).find((x) => x.rec.id === f.id)!;
      expect(way.best?.valueN).toBeGreaterThan(0);
    }
    // the same fund, said to move with a foreign currency, keeps the foreign-currency label
    const foreignFund = fundFromDraft({ ...said("il-tracking"), name: "זר", fixed: 0.2 }, "custom-fund-zar", custom.id, t);
    const b2 = withCustomEntries(bundle, [], [foreignFund], [custom]);
    expect(fundLabels(b2.funds.at(-1)!, indexSeenBy(index, b2.funds.at(-1)!, b2), "il-tracking").map((l) => l.id)).toContain("currency-foreign");
  });

  it("a hedge and \"המדד בשקלים\" never stand together", () => {
    const f = fundFromDraft({ ...said("il-tracking"), name: "שניהם", fixed: 0.2, hedged: true, shekelIndex: true }, "custom-fund-both", "custom-x", t);
    expect(f.shekelIndex).toBeUndefined();
    expect(validCustomFunds([JSON.parse(JSON.stringify({ ...f, shekelIndex: true }))])[0]!.shekelIndex).toBeUndefined();
  });

  it("its number is the one typed, never the site's id, and links nowhere", () => {
    expect(mine.number).toBe("");
    const numbered = fundFromDraft({ ...said("il-etf"), name: "עם מספר", number: "1234567", fixed: 0.1 }, "custom-fund-numbered", "index-ta125", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [numbered]), index: ta125, plan });
    expect(allFunds(v).find((f) => f.rec.id === numbered.id)!.number).toBe("1234567");
  });
});

describe("what the person says the fund does (2026-11-05): nothing is filled in for them", () => {
  const priceOf = (f: CustomFund) => allFunds(buildInvest({ bundle: withCustomEntries(bundle, [], [f]), index: sp, plan })).find((x) => x.rec.id === f.id)!;
  const ids = (f: CustomFund) => fundLabels(withCustomEntries(bundle, [], [f]).funds.at(-1)!, sp, f.kind).map((l) => l.id);
  const abroadDraft = { ...said("abroad"), name: "חו״ל", fixed: 0.07 };

  it("a payout not said is no price, with its reason, and no payout label", () => {
    const f = fundFromDraft({ ...abroadDraft, payout: null }, "custom-fund-silent", "index-sp500", t);
    expect(priceOf(f).reason).toEqual({ code: "payout-unknown" });
    expect(ids(f)).not.toContain("pays-accumulating");
    expect(ids(f)).not.toContain("tax-on-sale-open");
  });

  it("a fund saved before the question was asked reads as not said, not as accumulating", () => {
    const { payout: _p, yield: _y, perYear: _n, domicile: _d, tracking: _t, ...old } = abroad;
    const [back] = validCustomFunds([JSON.parse(JSON.stringify(old))]);
    expect(back!.payout).toBeNull();
    expect(back!.tracking).toBeNull();
  });

  it("a distributing foreign fund needs its country, then its yield, and is priced with both", () => {
    const noCountry = fundFromDraft({ ...abroadDraft, payout: "distributing", yield: 1.2, perYear: 4 }, "custom-fund-dist", "index-sp500", t);
    expect(priceOf(noCountry).reason).toEqual({ code: "domicile-unknown" });
    const noYield = fundFromDraft({ ...abroadDraft, payout: "distributing", domicile: "IE" }, "custom-fund-dist", "index-sp500", t);
    expect(priceOf(noYield).reason).toEqual({ code: "need-yield" });
    const full = fundFromDraft({ ...abroadDraft, payout: "distributing", domicile: "IE", yield: 1.2, perYear: 4 }, "custom-fund-dist", "index-sp500", t);
    expect(priceOf(full).reason).toBeUndefined();
    expect(priceOf(full).best?.valueN).toBeGreaterThan(0);
    expect(ids(full)).toEqual(expect.arrayContaining(["pays-distributing", "tax-distribution", "tax-fund-dividend"]));
  });

  it("the country and the way it follows its index are its labels", () => {
    const f = fundFromDraft({ ...abroadDraft, domicile: "US", tracking: "swap" }, "custom-fund-us", "index-sp500", t);
    expect(ids(f)).toEqual(expect.arrayContaining(["follow-swap", "pays-accumulating", "ask-estate", "ask-w8"]));
    expect(ids(fundFromDraft({ ...abroadDraft, domicile: "IE" }, "custom-fund-ie", "index-sp500", t))).toContain("tax-fund-dividend");
  });

  it("an Irish fund said to hold the shares runs with the US tax on their dividends (F-107), and its figure's sheet lists it", () => {
    const words = invest.pair.fundInputs;
    const held = priceOf(fundFromDraft({ ...abroadDraft, payout: "accumulating", domicile: "IE", tracking: "physical" }, "custom-fund-held", "index-sp500", t));
    const swapped = priceOf(fundFromDraft({ ...abroadDraft, payout: "accumulating", domicile: "IE", tracking: "swap" }, "custom-fund-swapped", "index-sp500", t));
    const tax = (held.best!.value.computed_from!.inputs as Record<string, SiteValue>)[words.usWithholding];
    expect(tax?.computed_from?.formula).toBe("F-107");
    expect((swapped.best!.value.computed_from!.inputs as Record<string, SiteValue>)[words.usWithholding]).toBeUndefined();
    // the same fees typed: the fund that holds the shares keeps less
    expect(held.best!.valueN).toBeLessThan(swapped.best!.valueN);
  });

  it("all of it is kept through a save and a reload", () => {
    const f = fundFromDraft({ ...abroadDraft, payout: "distributing", domicile: "IE", yield: 1.2, perYear: 4, tracking: "physical" }, "custom-fund-kept", "index-sp500", t);
    const [back] = validCustomFunds([JSON.parse(JSON.stringify(f))]);
    expect(back).toEqual(f);
  });

  it("on a foreign index the hedge must be chosen; on an Israeli one it is never asked", () => {
    expect(fundErrors({ ...fundDraftOf(null, "abroad"), name: "א" }, [], null)).toEqual(["hedged-none"]);
    expect(fundErrors({ ...fundDraftOf(null, "il-tracking", true), name: "א" }, [], null)).toEqual([]);
  });
});

describe("the rows mark what was typed (D7)", () => {
  const b = withCustomEntries(bundle, [cheap, zeros], [fund]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const pick = pickOfHeadline(view)!;
  const data = { rules: {}, terms: {}, dimensions: {}, today: t };
  const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));
  it("the account list and the result name it in the entered colour, and link to no tariff or company page", () => {
    const out = html(createElement("div", null, createElement(AccountColumn, { view, bundle: b, years: 20, pick, onPick: () => undefined }), createElement(FundColumn, { view, bundle: b, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined }), createElement(PairResult, { view, bundle: b, plan, pick, chosen: true, onPick: () => undefined })));
    expect(out).toContain(zeros.name);
    expect(out).toContain(fund.name);
    expect(out).toContain("text-entered");
    expect(out).not.toContain(`/companies/${zeros.id}`);
    expect(out).not.toContain('href="local"');
    // the site's own id is a key of the row, never a word on it
    expect(out.replace(/<[^>]*>/g, " ")).not.toContain("custom-fund-");
    expect(out).not.toMatch(/href="[^"]*custom-(fund|broker)-/);
  });
});

describe("what the panel checks", () => {
  it("a name is required and not taken; a broker sells something", () => {
    expect(brokerErrors({ ...brokerDraftOf(null), name: " " }, [], null)).toEqual(["name-empty"]);
    expect(brokerErrors({ ...brokerDraftOf(null), name: "הצעה  זולה" }, [cheap], null)).toEqual(["name-taken"]);
    expect(brokerErrors({ ...brokerDraftOf(cheap) }, [cheap], cheap.id)).toEqual([]);
    expect(brokerErrors({ ...brokerDraftOf(cheap), sellsIsraeli: false, sellsAbroad: false }, [cheap], cheap.id)).toEqual(["sells-none"]);
    expect(fundErrors({ ...fundDraftOf(fund, "il-etf") }, [fund], null)).toEqual(["name-taken"]);
  });
  it("a draft opens as it was saved; a foreign fund keeps one charge", () => {
    expect(brokerDraftOf(dear)).toMatchObject({ tradePct: 0.5, tradeMin: 30, custodyPct: 0.4, custodyMin: 10, fxPct: 1, monthlyFee: 20, sellsIsraeli: true, sellsAbroad: true });
    const f = fundFromDraft({ ...said("abroad"), name: "ח", fixed: 0.1, variable: 5, trustee: 5 }, "custom-fund-x", "index-sp500", t);
    expect(f.variable).toBeNull();
    expect(f.trustee).toBeNull();
  });
});

function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k), clear: () => data.clear(), key: () => null, get length() { return data.size; } } as unknown as Storage & { data: Map<string, string> };
}

describe("kept on the device and carried in the export file (D44)", () => {
  let storage: Storage & { data: Map<string, string> };
  const site = { version: "t", data: t };
  const json = (x: unknown) => JSON.parse(JSON.stringify(x));
  beforeEach(() => {
    storage = memoryStorage();
    resetStore(storage);
  });

  it("round trip: saved, read back, exported, imported, equal; removing restores the document", () => {
    ensureLoaded();
    const empty = json(getSnapshot().state);
    saveCustomBroker(cheap);
    saveCustomFund(fund);
    flush(true);
    const raw = JSON.parse(storage.data.get(STATE_KEY)!);
    expect(raw.customBrokers).toEqual(json([cheap]));
    expect(raw.customFunds).toEqual(json([fund]));
    resetStore(storage);
    ensureLoaded();
    expect(json(getSnapshot().state.customBrokers)).toEqual(json([cheap]));
    expect(json(getSnapshot().state.customFunds)).toEqual(json([fund]));
    const state = getSnapshot().state;
    expect(exportCounts(state).entries).toBe(2);
    expect(isEmptyState(state)).toBe(false);
    const read = readImport(stateFileText(buildStateFile(state, site, new Date("2026-10-31T10:00:00Z"))));
    if (!read.ok) throw new Error("refused");
    expect(json(read.preview.state.customBrokers)).toEqual(json([cheap]));
    expect(json(read.preview.state.customFunds)).toEqual(json([fund]));
    // an edit replaces by id, and keeps its place
    saveCustomBroker({ ...cheap, name: "שם אחר" });
    expect(getSnapshot().state.customBrokers!.map((x) => x.name)).toEqual(["שם אחר"]);
    removeCustomBroker(cheap.id);
    removeCustomFund(fund.id);
    expect(json(getSnapshot().state)).toEqual(empty);
    expect(getSnapshot().state.customBrokers).toBeUndefined();
    expect(getSnapshot().state.customFunds).toBeUndefined();
  });

  it("removing a custom index takes its funds with it", () => {
    ensureLoaded();
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    saveCustomIndex(custom);
    saveCustomFund({ ...fund, indexId: custom.id });
    saveCustomFund(abroad);
    removeCustomIndex(custom.id);
    expect(getSnapshot().state.customFunds!.map((f) => f.id)).toEqual([abroad.id]);
  });

  it("what fails its check is left out, not a reason to refuse the file", () => {
    const old = { version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] };
    storage.data.set(STATE_KEY, JSON.stringify(old));
    expect(ensureLoaded().status).toBe("ok");
    expect(getSnapshot().state.customBrokers).toBeUndefined();
    resetStore(storage);
    const bad: unknown[] = [
      5,
      { id: "x" },
      { ...json(cheap), id: "leumi" }, // not an id of an entry: it would stand for a collected house
      { ...json(cheap), id: "custom-broker-a", name: " " },
      { ...json(cheap), id: "custom-broker-b", tradePct: { ...json(cheap.tradePct), value: 500 } },
      { ...json(cheap), id: "custom-broker-c", tradePct: { ...json(cheap.tradePct), value: -1 } },
      { ...json(cheap), id: "custom-broker-d", tradePct: { ...json(cheap.tradePct), state: "sourced" } }, // never a sourced look
      { ...json(cheap), id: "custom-broker-e", tradeMin: { ...json(cheap.tradeMin), unit: "usd" } },
      { ...json(cheap), id: "custom-broker-f", sells: { israeli: false, abroad: false } },
    ];
    storage.data.set(STATE_KEY, JSON.stringify({ ...old, customBrokers: [json(cheap), ...bad, json(cheap)], customFunds: [json(fund), { ...json(fund), id: "custom-fund-a", kind: "other" }, { ...json(fund), id: "custom-fund-b", indexId: "" }] }));
    ensureLoaded();
    expect(getSnapshot().state.customBrokers!.map((x) => x.id)).toEqual([cheap.id]);
    expect(getSnapshot().state.customFunds!.map((x) => x.id)).toEqual([fund.id]);
    expect(validCustomBrokers([json(dear)]).length).toBe(1);
    expect(validCustomFunds([json(abroad)]).length).toBe(1);
  });

  it("import add keeps the device's and adds the file's others; replace takes the file's", () => {
    const base: StateV3 = { version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] };
    const brokers = (x: CustomBroker[]) => ({ ...base, customBrokers: x });
    const merged = applyImport(brokers([cheap]), brokers([{ ...cheap, name: "מהקובץ" }, dear]), "add", t);
    expect(merged.state.customBrokers!.map((x) => x.name)).toEqual([cheap.name, dear.name]);
    const funds = (x: CustomFund[]) => ({ ...base, customFunds: x });
    expect(applyImport(funds([fund]), funds([abroad]), "add", t).state.customFunds!.map((x) => x.id)).toEqual([fund.id, abroad.id]);
    expect(applyImport(brokers([cheap]), brokers([dear]), "replace", t).state.customBrokers!.map((x) => x.id)).toEqual([dear.id]);
  });
});

describe("an account built on a house is priced where the house is, and only there (F-101)", () => {
  const sp = (b: CustomBroker) => {
    const withIt = withCustomEntries(bundle, [b], []);
    return buildInvest({ bundle: withIt, index: indexById(withIt, "index-sp500")!, plan });
  };
  const built = (houseId: string) => {
    const snap = bundle.snapshots.find((s) => s.id === houseId)!;
    return brokerFromDraft({ ...brokerDraftOf(null), name: "שלי", base: baseOf(snap, { group: null }) }, "custom-broker-built", t);
  };
  const abroad = (view: ReturnType<typeof sp>) => allFunds(view).filter((f) => f.option === "abroad" && !f.reason);
  const left = (f: { byHouse: Record<string, unknown> }, id: string) => { const a = f.byHouse[id] as { valueN?: number; reason?: { code: string } } | undefined; return a?.valueN !== undefined ? Math.round(a.valueN) : a?.reason?.code ?? "none"; };
  it("on One Zero, a fund abroad that One Zero's price list leaves out has no price in the account built on it either", () => {
    const view = sp(built("one-zero"));
    const funds = abroad(view).filter((f) => !("valueN" in (f.byHouse["one-zero"] ?? {})));
    expect(funds.length).toBeGreaterThan(0);
    for (const f of funds) expect(left(f, "custom-broker-built")).toBe(left(f, "one-zero"));
  });
  it("on Interactive Brokers, with nothing changed, the account built on it leaves what the house leaves (it read the Tiered lines and failed)", () => {
    const view = sp(built("interactive-brokers"));
    const funds = abroad(view).filter((f) => "valueN" in (f.byHouse["interactive-brokers"] ?? {}));
    expect(funds.length).toBeGreaterThan(0);
    for (const f of funds) expect(left(f, "custom-broker-built")).toBe(left(f, "interactive-brokers"));
  });
});
