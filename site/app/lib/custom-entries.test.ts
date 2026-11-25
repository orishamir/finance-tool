// A fund the person types (D44): it runs through the engine's path, ranks with the collected funds, and goes through the saved state and the
// export file; and an account typed before a deal took its place leaves, once moved into a deal (the move, method §10.4), what it left. The expected figures
// are printed by tests/golden/expected_custom_entries.py, none written by hand.
import { PairReceipt } from "../components/invest/receipt";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { calendarMonthOf } from "@finance-tool/engine";
import { allFunds, pickOfHeadline } from "../components/invest/pair";
import { PairLists } from "../components/invest/lists";
import { EditorsContext, type Editors } from "../components/invest/editors";
import { invest, numbers } from "../copy";
import { LabelSheetHost } from "../components/kit";
import { ProvenanceProvider } from "../components/provenance";
import { fundDraftOf, fundErrors, fundFromDraft, validCustomBrokers, validCustomFunds, withCustomEntries, type CustomBroker, type CustomFund } from "./custom-entries";
import { feesData } from "./fees.server";
import { fxRunInput } from "./fx";
import { dealProviderId, withDeals } from "./deal-account/bundle";
import { dealOfTypedAccount, movedDealId, type MoveContext } from "./deal-account/move";
import { fundLabels } from "./labels";
import { baseOf, startingPointsOf } from "./own-account";
import { buildInvest, indexById, indexSeenBy, optionOfFund, refOfCustom, type WayPrice } from "./invest";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { applyImport, buildStateFile, dropTypedAccounts, replaceState, ensureLoaded, exportCounts, flush, getSnapshot, isEmptyState, readImport, removeCustomFund, removeCustomIndex, resetStore, saveCustomFund, saveCustomIndex, STATE_KEY, stateFileText, type StateV3 } from "./state";
import type { PlanBounds } from "./plan-bounds";
import { entered, type SiteValue } from "./value";

/** The plan numbers' bounds an import checks against, fixed here (P-05's as written on 2026-11-23: the horizon slider's 1 to 40 years, its
 *  `pct` and `age` ranges). */
const BOUNDS: PlanBounds = {
  amount_now: { min: 0, max: null, whole: false },
  monthly_deposit: { min: 0, max: null, whole: false },
  horizon_years: { min: 1, max: 40, whole: true },
  "A-01": { min: -50, max: 50, whole: false },
  "A-02": { min: -50, max: 50, whole: false },
  age: { min: 0, max: 120, whole: true },
};

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
};

// the terms of tests/golden/expected_custom_entries.py, as a typed account kept them: every line typed, a fee not charged as 0; a minimum
// of 0 is no minimum, as in the golden script
const typedAccount = (id: string, name: string, v: { tradePct?: number; tradeMin?: number; custodyPct?: number; custodyMin?: number; fxPct?: number; monthlyFee?: number }): CustomBroker => ({
  id, name, added: t,
  tradePct: v.tradePct === undefined ? null : entered(v.tradePct, "pct_of_trade", t),
  tradeMin: v.tradeMin === undefined ? null : entered(v.tradeMin, "nis_per_trade", t),
  custodyPct: v.custodyPct === undefined ? null : entered(v.custodyPct, "pct_per_year", t),
  custodyMin: v.custodyMin === undefined ? null : entered(v.custodyMin, "nis_per_month", t),
  fxPct: v.fxPct === undefined ? null : entered(v.fxPct, "pct_of_trade", t),
  monthlyFee: v.monthlyFee === undefined ? null : entered(v.monthlyFee, "nis_per_month", t),
  sells: { israeli: true, abroad: true },
});
const cheap = typedAccount("custom-broker-cheap", "הצעה זולה", { tradePct: 0.05, tradeMin: 1, custodyPct: 0.02, custodyMin: 0, fxPct: 0.2, monthlyFee: 0 });
const dear = typedAccount("custom-broker-dear", "הצעה יקרה", { tradePct: 0.5, tradeMin: 30, custodyPct: 0.4, custodyMin: 10, fxPct: 1, monthlyFee: 20 });
const zeros = typedAccount("custom-broker-zeros", "הצעה ריקה", { tradePct: 0, tradeMin: 0, custodyPct: 0, custodyMin: 0, fxPct: 0, monthlyFee: 0 });
/** Only the commission it was offered, the rest left empty. */
const partial = typedAccount("custom-broker-partial", "רק עמלה", { tradePct: 0.08 });
const data = feesData();
const moveCtx: MoveContext = { houses: data.houses, kinds: data.kinds, snapshots: bundle.snapshots, fx: bundle.fx ? fxRunInput(bundle.fx) : {}, today: t };
/** A fund draft that says it accumulates and is unhedged, as the golden script prices it (since a payout not said has no price). */
const said = (kind: Parameters<typeof fundDraftOf>[1]) => ({ ...fundDraftOf(null, kind), payout: "accumulating" as const, hedged: false });
const fund = fundFromDraft({ ...said("il-tracking"), name: "קרן שלי", fixed: 0.2, variable: 0.05, trustee: 0.02 }, "custom-fund-mine", "index-ta125", t);
const abroad = fundFromDraft({ ...said("abroad"), name: "קרן בחו״ל שלי", fixed: 0.1 }, "custom-fund-abroad", "index-sp500", t);

type Expected = { cheapIl: number; dearIl: number; cheapAbroad: number; ibiIl: number; zerosIl: number };
/** Printed by the script, by the calendar month of month 1: the run starts in its run date's month (F-01). */
const EXPECTED_BY_MONTH: Record<number, Expected> = {
  1: { cheapIl: 153279.00, dearIl: 132143.22, cheapAbroad: 150677.85, ibiIl: 148189.56, zerosIl: 154017.67 },
  2: { cheapIl: 153271.54, dearIl: 131977.52, cheapAbroad: 150670.25, ibiIl: 148161.80, zerosIl: 154017.67 },
  3: { cheapIl: 153272.24, dearIl: 131993.03, cheapAbroad: 150670.96, ibiIl: 148164.33, zerosIl: 154017.67 },
  4: { cheapIl: 153272.94, dearIl: 132008.46, cheapAbroad: 150671.68, ibiIl: 148166.85, zerosIl: 154017.67 },
  5: { cheapIl: 153273.64, dearIl: 132023.79, cheapAbroad: 150672.38, ibiIl: 148169.37, zerosIl: 154017.67 },
  6: { cheapIl: 153274.33, dearIl: 132039.03, cheapAbroad: 150673.09, ibiIl: 148171.90, zerosIl: 154017.67 },
  7: { cheapIl: 153275.01, dearIl: 132054.18, cheapAbroad: 150673.78, ibiIl: 148174.42, zerosIl: 154017.67 },
  8: { cheapIl: 153275.69, dearIl: 132069.25, cheapAbroad: 150674.47, ibiIl: 148176.94, zerosIl: 154017.67 },
  9: { cheapIl: 153276.36, dearIl: 132084.22, cheapAbroad: 150675.16, ibiIl: 148179.47, zerosIl: 154017.67 },
  10: { cheapIl: 153277.03, dearIl: 132099.10, cheapAbroad: 150675.84, ibiIl: 148181.99, zerosIl: 154017.67 },
  11: { cheapIl: 153277.69, dearIl: 132113.89, cheapAbroad: 150676.51, ibiIl: 148184.52, zerosIl: 154017.67 },
  12: { cheapIl: 153278.35, dearIl: 132128.60, cheapAbroad: 150677.18, ibiIl: 148187.04, zerosIl: 154017.67 },
};
const EXPECTED = EXPECTED_BY_MONTH[calendarMonthOf(t)]!;

const ta125 = indexById(bundle, "index-ta125")!;
const sp = indexById(bundle, "index-sp500")!;
const priced = (x: unknown): x is WayPrice => !!x && typeof x === "object" && "valueN" in x;

describe("an account typed from scratch, moved into a deal, leaves what the script says (the move, method §10.4)", () => {
  const deals = [cheap, dear, zeros, partial].map((a) => dealOfTypedAccount(a, moveCtx));
  const b = withDeals(withCustomEntries(bundle, [fund, abroad]), deals, data.kinds);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const mine = allFunds(view).find((f) => f.rec.id === fund.id)!;
  const valueAt = (a: CustomBroker, f = mine) => {
    const at = f.byHouse[dealProviderId(movedDealId(a.id))];
    return priced(at) ? at.valueN : NaN;
  };

  it("on an Israeli fund and on a fund bought abroad, the figures the script printed for the typed account", () => {
    expect(valueAt(cheap)).toBeCloseTo(EXPECTED.cheapIl, 1);
    expect(valueAt(dear)).toBeCloseTo(EXPECTED.dearIl, 1);
    expect(valueAt(zeros)).toBeCloseTo(EXPECTED.zerosIl, 1);
    const onSp = buildInvest({ bundle: b, index: sp, plan });
    expect(valueAt(cheap, allFunds(onSp).find((f) => f.rec.id === abroad.id)!)).toBeCloseTo(EXPECTED.cheapAbroad, 1);
  });

  it("an account with a field left empty has no price anywhere, and is never ranked (silence is not zero)", () => {
    for (const f of allFunds(view)) expect(priced(f.byHouse[dealProviderId(movedDealId(partial.id))])).toBe(false);
    expect(view.headline!.providerId).not.toBe(dealProviderId(movedDealId(partial.id)));
  });
});

describe("a fund the person types is priced at the collected houses under its kind's rules (D44)", () => {
  const b = withDeals(withCustomEntries(bundle, [fund, abroad]), [dealOfTypedAccount(cheap, moveCtx)], data.kinds);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const mine = allFunds(view).find((f) => f.rec.id === fund.id)!;
  const spView = buildInvest({ bundle: b, index: sp, plan });
  const mineAbroad = allFunds(spView).find((f) => f.rec.id === abroad.id)!;

  it("an Israeli tracking fund leaves what the script says at IBI, and has a row at every house, priced where a collected fund is", () => {
    expect((mine.byHouse["ibi"] as WayPrice).valueN).toBeCloseTo(EXPECTED.ibiIl, 1);
    const collected = view.options.find((o) => o.id === "il-tracking")!.funds.find((f) => f.rec.id !== fund.id)!;
    for (const p of view.providers.filter((x) => !x.custom)) {
      expect(mine.byHouse[p.id], p.id).toBeTruthy();
      // a house that sells the kind fund by fund (One Zero, BRK-38) cannot say whether it sells a fund the person typed: no price there
      const at = mine.byHouse[p.id]!;
      if (bundle.snapshots.find((s) => s.id === p.id)?.fundByFund) {
        expect(priced(at), p.id).toBe(false);
        expect("reason" in at && at.reason, p.id).toEqual({ code: "sold-fund-by-fund" });
      }
      else expect(priced(mine.byHouse[p.id]), p.id).toBe(priced(collected.byHouse[p.id]));
    }
  });

  it("each kind falls in its own option and tariff class", () => {
    const kinds = ["il-tracking", "il-etf", "tase-foreign", "abroad"] as const;
    for (const kind of kinds) {
      const f = fundFromDraft({ ...said(kind), name: kind, fixed: 0.1, variable: 0, trustee: 0 }, `custom-fund-${kind}`, "index-sp500", t);
      const rec = withCustomEntries(bundle, [f]).funds.at(-1)!;
      expect(optionOfFund(rec, undefined)).toBe(kind);
      expect(rec.distribution_policy).toBe("accumulating");
    }
  });

  it("a foreign fund carries the open rule's tag, shown and not ranked, as a collected one does", () => {
    const at = mineAbroad.byHouse[dealProviderId(movedDealId(cheap.id))] as WayPrice;
    expect(at.open).toBe(true);
    expect(at.valueN).toBeCloseTo(EXPECTED.cheapAbroad, 1);
    expect(spView.headline!.fund.rec.id).not.toBe(abroad.id);
  });

  it("an Israeli fund typed on an index in a foreign currency has a status not known: its chip says so, never that the currency is taxed (F-04)", () => {
    for (const kind of ["il-tracking", "il-etf"] as const) {
      const f = fundFromDraft({ ...said(kind), name: kind, fixed: 0.1, variable: 0, trustee: 0 }, `custom-fund-${kind}`, "index-sp500", t);
      const rec = withCustomEntries(bundle, [f]).funds.at(-1);
      if (!rec) throw new Error("the typed fund is in the bundle");
      expect(rec.tax_status.foreign_investment_fund?.value).toBeNull();
      const ids = fundLabels(rec, sp, kind).map((l) => l.id);
      expect(ids).toContain("tax-currency-unknown");
      expect(ids).not.toContain("tax-currency");
    }
    // a fund typed abroad has no such status
    expect(withCustomEntries(bundle, [abroad]).funds.at(-1)?.tax_status).not.toHaveProperty("foreign_investment_fund");
  });

  it("a Tel Aviv foreign fund typed on a dollar index is priced on the reading that leaves less, its doubt saying the site read none of its documents (F-04)", () => {
    const f = fundFromDraft({ ...said("tase-foreign"), name: "חוץ", fixed: 0.1, variable: 0, trustee: 0 }, "custom-fund-tase", "index-sp500", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [f]), index: sp, plan });
    const typed = allFunds(v).find((x) => x.rec.id === f.id);
    const figures = Object.values(typed?.byHouse ?? {}).filter((x): x is WayPrice => "valueN" in x);
    expect(figures.length).toBeGreaterThan(0);
    for (const at of figures) {
      expect(at.value.doubt).toBe(numbers.readingDoubt["TXF-04"]?.documents);
      expect(at.value.doubtRules).toEqual(["TXF-04"]);
    }
  });

  it("a hedged fund has no price, with the reason, as a collected fund with no report", () => {
    const hedged = fundFromDraft({ ...said("il-tracking"), name: "מנוטרלת", fixed: 0.1, variable: 0, trustee: 0, hedged: true }, "custom-fund-hedged", "index-sp500", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [hedged]), index: sp, plan });
    const f = allFunds(v).find((x) => x.rec.id === hedged.id)!;
    expect(f.reason).toEqual({ code: "no-hedge-entered" });
    expect(Object.keys(f.byHouse)).toEqual([]);
  });

  it("belongs to the index it was added on, a custom index too", () => {
    expect(allFunds(view).some((f) => f.rec.id === abroad.id)).toBe(false);
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    const onCustom = fundFromDraft({ ...said("il-tracking"), name: "על ניקיי", fixed: 0.3, variable: 0, trustee: 0 }, "custom-fund-nikkei", custom.id, t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [onCustom], [custom]), index: refOfCustom(custom), plan });
    const f = allFunds(v).find((x) => x.rec.id === onCustom.id)!;
    expect(v.fundCount).toBe(1);
    // an Israeli fund the person typed on an index not in shekels: whether it is a foreign-investment fund is not known, so it is run under
    // both readings of TXS OQ26 (F-04); at the plan's 2% inflation and a steady currency they differ, and it is priced on the one that leaves
    // less, its figure marked as the site's reading of TXS-14
    expect(f.reason).toBeUndefined();
    expect(f.best?.valueN).toBeGreaterThan(0);
    expect(f.best?.value.doubtRules).toEqual(["TXS-14"]);
    // the site read none of its documents, and its doubt says so
    expect(f.best?.value.doubt).toBe(numbers.readingDoubt["TXS-14"]?.documents);
    // where the currency moves as prices do, the readings agree: it is ranked, and is the page's headline
    const agree = buildInvest({ bundle: withCustomEntries(bundle, [onCustom], [custom]), index: refOfCustom(custom), plan, assumptions: { fxChange: 2 } });
    expect(allFunds(agree).find((x) => x.rec.id === onCustom.id)?.best?.valueN).toBeGreaterThan(0);
    expect(agree.headline?.fund.rec.id).toBe(onCustom.id);
  });

  it("on an index the person added, the currency is named by no one: חשיפה למט״ח, never the dollar (founder, 2026-11-05)", () => {
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    const onCustom = fundFromDraft({ ...said("il-tracking"), name: "על ניקיי", fixed: 0.3 }, "custom-fund-nikkei", custom.id, t);
    const rec = withCustomEntries(bundle, [onCustom], [custom]).funds.at(-1)!;
    const labels = fundLabels(rec, refOfCustom(custom), onCustom.kind);
    expect(labels.map((l) => l.id)).toContain("currency-foreign");
    expect(labels.map((l) => l.id)).not.toContain("currency");
    expect(labels.map((l) => l.text).join(" ")).not.toContain("דולר");
    const hedgedRec = withCustomEntries(bundle, [{ ...onCustom, hedged: true }], [custom]).funds.at(-1)!;
    expect(fundLabels(hedgedRec, refOfCustom(custom), onCustom.kind).map((l) => l.explain).join(" ")).not.toContain("דולר");
  });

  it("on an index the person added, \"המדד בשקלים\" is the fund's own answer: no currency label, and it is priced, at home or abroad (2026-11-05)", () => {
    const custom = { id: "custom-ta-tech", name: "טכנולוגיה ישראלית", added: t };
    const index = refOfCustom(custom);
    expect(index.israeli).toBe(false);
    for (const kind of ["il-tracking", "abroad"] as const) {
      const f = fundFromDraft({ ...said(kind), name: kind, fixed: 0.2, variable: 0, trustee: 0, shekelIndex: true }, `custom-fund-${kind}`, custom.id, t);
      expect(f.shekelIndex).toBe(true);
      const b = withCustomEntries(bundle, [f], [custom]);
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
    const b2 = withCustomEntries(bundle, [foreignFund], [custom]);
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
    const v = buildInvest({ bundle: withCustomEntries(bundle, [numbered]), index: ta125, plan });
    expect(allFunds(v).find((f) => f.rec.id === numbered.id)!.number).toBe("1234567");
  });
});

describe("what the person says the fund does (2026-11-05): nothing is filled in for them", () => {
  const priceOf = (f: CustomFund) => allFunds(buildInvest({ bundle: withCustomEntries(bundle, [f]), index: sp, plan })).find((x) => x.rec.id === f.id)!;
  const ids = (f: CustomFund) => fundLabels(withCustomEntries(bundle, [f]).funds.at(-1)!, sp, f.kind).map((l) => l.id);
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
  const b = withCustomEntries(bundle, [fund]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const pick = pickOfHeadline(view)!;
  const data = { rules: {}, terms: {}, dimensions: {}, today: t };
  const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));
  it("the lists and the result name it in the entered colour, and link to no tariff or company page", () => {
    const out = html(createElement("div", null, createElement(PairLists, { view, bundle: b, plan, livePlan: plan, today: t, pick, chosen: true, onPick: () => undefined, moved: null }), createElement(PairReceipt, { view, bundle: b, plan, pick, chosen: true })));
    expect(out).toContain(fund.name);
    expect(out).toContain("text-entered");
    expect(out).not.toContain('href="local"');
    // the site's own id is a key of the row, never a word on it
    expect(out.replace(/<[^>]*>/g, " ")).not.toContain("custom-fund-");
    expect(out).not.toMatch(/href="[^"]*custom-(fund|broker)-/);
  });
});

describe("a typed row that cannot be priced is still where its terms are changed (D44)", () => {
  const blank = fundFromDraft({ ...said("il-tracking"), name: "בלי שכר נאמן", fixed: 0.2, variable: 0.05 }, "custom-fund-blank", "index-ta125", t);
  const b = withCustomEntries(bundle, [fund, blank]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const pick = pickOfHeadline(view)!;
  const data = { rules: {}, terms: {}, dimensions: {}, today: t };
  const noop = () => undefined;
  const editors: Editors = { addFund: noop, edit: noop, funds: [fund, blank], world: null };
  const out = renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, createElement(EditorsContext.Provider, { value: editors }, createElement(PairLists, { view, bundle: b, plan, livePlan: plan, today: t, pick, chosen: false, onPick: noop, moved: null }))) })));
  /** A row as drawn, up to the next row. */
  const row = (id: string) => {
    const at = out.indexOf(`data-pick-key="${id}"`);
    expect(at).toBeGreaterThan(-1);
    const next = out.slice(at + 1).search(/data-pick-key="/);
    return out.slice(out.lastIndexOf("<div", at), next < 0 ? undefined : at + 1 + next);
  };
  it("a fund with a fee left empty: no pick, and the pencil that opens its panel beside its name", () => {
    const r = row(blank.id);
    expect(r).toContain('aria-disabled="true"');
    expect(r).toContain(`aria-label="${invest.customEntries.editFund}"`);
  });
  it("a typed fund that is priced has the pencil on its row too, with no line of its terms, and the collected rows carry none", () => {
    expect(row(fund.id)).toContain(`aria-label="${invest.customEntries.editFund}"`);
    expect(row(fund.id)).not.toContain(invest.customEntries.edit + "<");
    const collected = view.providers.find((p) => !p.custom)!;
    expect(row(collected.id)).not.toContain(invest.customEntries.editFund);
  });
});

describe("what the panel checks", () => {
  it("a name is required and not taken", () => {
    expect(fundErrors({ ...fundDraftOf(null, "il-etf"), name: " " }, [], null)).toContain("name-empty");
    expect(fundErrors({ ...fundDraftOf(fund, "il-etf") }, [fund], null)).toEqual(["name-taken"]);
  });
  it("a draft opens as it was saved; a foreign fund keeps one charge", () => {
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

  it("round trip: a fund saved and a typed account waiting to move into a deal, read back, exported, imported, equal; removing restores the document", () => {
    ensureLoaded();
    const empty = json(getSnapshot().state);
    replaceState({ ...getSnapshot().state, customBrokers: [cheap] });
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
    expect(exportCounts(state).funds).toBe(1);
    expect(exportCounts(state).accounts).toBe(1);
    expect(isEmptyState(state)).toBe(false);
    const read = readImport(stateFileText(buildStateFile(state, site, new Date("2026-10-31T10:00:00Z"))), BOUNDS);
    if (!read.ok) throw new Error("refused");
    expect(json(read.preview.state.customBrokers)).toEqual(json([cheap]));
    expect(json(read.preview.state.customFunds)).toEqual(json([fund]));
    dropTypedAccounts([cheap.id]);
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

  it("a bad base or years leave the entry out, not the file", () => {
    // an account built on a group of Mercantile's, kept three years, with its own minimum (F-101), as the indices page saved one
    const mercantile = bundle.snapshots.find((s) => s.id === "mercantile")!;
    const point = startingPointsOf(mercantile).find((p) => p.group)!;
    const top: CustomBroker = { ...typedAccount("custom-broker-top", "החשבון שלי", { tradeMin: 12 }), base: baseOf(mercantile, point), untilYears: 3 };
    expect(validCustomBrokers([json(top)])).toEqual([json(top)]);
    const bad = [
      { ...json(top), id: "custom-broker-a", base: { ...json(top.base), houseId: "Bad Id" } },
      { ...json(top), id: "custom-broker-b", base: { ...json(top.base), group: { ...json(top.base!.group), prices: [] } } },
      { ...json(top), id: "custom-broker-c", untilYears: -1 },
      { ...json(top), id: "custom-broker-d", untilYears: "3" },
      { ...json(top), id: "custom-broker-e", base: { ...json(top.base), group: { ...json(top.base!.group), prices: [{ fee: "trade_israel", price_he: "x", holdings_he: "y", names_fund: false, source: { url: "u", title: "t", quote: "q" }, value: { rate_pct: 1 } }] } } },
    ];
    expect(validCustomBrokers([json(top), ...bad]).map((x) => x.id)).toEqual([top.id]);
  });

  it("an entry saved before accounts were built on a house loads unchanged, with no base; moved, a line left empty is a fee with no price yet (D56)", () => {
    // the six fees as the saved state of 2026-10-31 held them, each figure with the words of its field
    const old = {
      id: "custom-broker-cheap",
      name: "הצעה זולה",
      added: t,
      tradePct: entered(0.05, "pct_of_trade", t, "עמלת קנייה ומכירה, באחוזים"),
      tradeMin: entered(1, "nis_per_trade", t, "עמלה מזערית"),
      custodyPct: entered(0.02, "pct_per_year", t, "דמי משמרת, באחוזים בשנה"),
      custodyMin: null,
      fxPct: entered(0.2, "pct_of_trade", t, "המרת מטבע"),
      monthlyFee: null,
      sells: { israeli: true, abroad: true },
    };
    const loaded = validCustomBrokers([json(old)]);
    expect(loaded).toEqual([old]);
    expect("base" in loaded[0]!).toBe(false);
    const deal = dealOfTypedAccount(loaded[0]!, moveCtx);
    const blank = (kind: string) => deal.fees.filter((f) => f.kind === kind).flatMap((f) => (f.stages ?? []).map((st) => Object.values(st.price).some((x) => typeof x === "object" && x !== null && "blank" in x)));
    expect(blank("custody")).toEqual([true]);
    expect(blank("fixed_period")).toEqual([true]);
    expect(blank("trade")).toEqual([false]);
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

