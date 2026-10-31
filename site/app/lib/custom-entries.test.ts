// A broker and a fund the person types (D44): they run through the engine's path, rank with the collected houses, and go through the saved
// state and the export file. The expected figures are printed by tests/golden/expected_custom_entries.py, none written by hand.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { AccountColumn, allFunds, FundColumn, pickOfHeadline, PairResult } from "../components/invest/pair";
import { LabelSheetHost } from "../components/kit";
import { ProvenanceProvider } from "../components/provenance";
import { brokerDraftOf, brokerErrors, brokerFromDraft, fundDraftOf, fundErrors, fundFromDraft, tariffOfBroker, validCustomBrokers, validCustomFunds, withCustomEntries, type CustomBroker, type CustomFund } from "./custom-entries";
import { buildInvest, cheapestWay, indexById, optionOfFund, pairCosts, refOfCustom, type WayPrice } from "./invest";
import { buildWorkbenchBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { applyImport, buildStateFile, ensureLoaded, exportCounts, flush, getSnapshot, isEmptyState, readImport, removeCustomBroker, removeCustomFund, removeCustomIndex, resetStore, saveCustomBroker, saveCustomFund, saveCustomIndex, STATE_KEY, stateFileText, type StateV3 } from "./state";
import { entered, type SiteValue } from "./value";

const bundle = buildWorkbenchBundle();
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
const cheap = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה זולה", tradePct: 0.05, tradeMin: 1, custodyPct: 0.02, fxPct: 0.2 }, "custom-broker-cheap", t);
const dear = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה יקרה", tradePct: 0.5, tradeMin: 30, custodyPct: 0.4, custodyMin: 10, fxPct: 1, monthlyFee: 20 }, "custom-broker-dear", t);
const zeros = brokerFromDraft({ ...brokerDraftOf(null), name: "הצעה ריקה" }, "custom-broker-zeros", t);
const fund = fundFromDraft({ ...fundDraftOf(null, "il-tracking"), name: "קרן שלי", fixed: 0.2, variable: 0.05, trustee: 0.02 }, "custom-fund-mine", "index-ta125", t);
const abroad = fundFromDraft({ ...fundDraftOf(null, "abroad"), name: "קרן בחו״ל שלי", fixed: 0.1 }, "custom-fund-abroad", "index-sp500", t);

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

  it("charges a line that was left empty nothing, and keeps the row's figures in the entered state", () => {
    expect(cheap.monthlyFee).toBeNull();
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
    expect(cheapestWay(bundle, ta125, plan)!.providerId).not.toBe(zeros.id);
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
      const f = fundFromDraft({ ...fundDraftOf(null, kind), name: kind, fixed: 0.1 }, `custom-fund-${kind}`, "index-sp500", t);
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
    const hedged = fundFromDraft({ ...fundDraftOf(null, "il-tracking"), name: "מנוטרלת", fixed: 0.1, hedged: true }, "custom-fund-hedged", "index-sp500", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [hedged]), index: sp, plan });
    const f = allFunds(v).find((x) => x.rec.id === hedged.id)!;
    expect(f.reason).toEqual({ code: "no-hedge-entered" });
    expect(Object.keys(f.byHouse)).toEqual([]);
  });

  it("belongs to the index it was added on, a custom index too", () => {
    expect(allFunds(view).some((f) => f.rec.id === abroad.id)).toBe(false);
    const custom = { id: "custom-nikkei", name: "ניקיי", israeli: false, added: t };
    const onCustom = fundFromDraft({ ...fundDraftOf(null, "il-tracking"), name: "על ניקיי", fixed: 0.3 }, "custom-fund-nikkei", custom.id, t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [onCustom], [custom]), index: refOfCustom(custom), plan });
    const f = allFunds(v).find((x) => x.rec.id === onCustom.id)!;
    expect(f.best?.valueN).toBeGreaterThan(0);
    expect(v.headline?.fund.rec.id).toBe(onCustom.id);
    expect(v.fundCount).toBe(1);
  });

  it("its number is the one typed, never the site's id, and links nowhere", () => {
    expect(mine.number).toBe("");
    const numbered = fundFromDraft({ ...fundDraftOf(null, "il-etf"), name: "עם מספר", number: "1234567", fixed: 0.1 }, "custom-fund-numbered", "index-ta125", t);
    const v = buildInvest({ bundle: withCustomEntries(bundle, [], [numbered]), index: ta125, plan });
    expect(allFunds(v).find((f) => f.rec.id === numbered.id)!.number).toBe("1234567");
  });
});

describe("the rows mark what was typed (D7)", () => {
  const b = withCustomEntries(bundle, [cheap, zeros], [fund]);
  const view = buildInvest({ bundle: b, index: ta125, plan });
  const pick = pickOfHeadline(view)!;
  const data = { rules: {}, terms: {}, dimensions: {}, today: t };
  const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));
  it("the account list and the result name it in the entered colour, and link to no tariff or company page", () => {
    const out = html(createElement("div", null, createElement(AccountColumn, { view, bundle: b, years: 20, pick, onPick: () => undefined }), createElement(FundColumn, { view, bundle: b, plan, today: t, pick, onPick: () => undefined, filter: null, onFilter: () => undefined }), createElement(PairResult, { view, bundle: b, plan, pick, onPick: () => undefined })));
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
    const f = fundFromDraft({ ...fundDraftOf(null, "abroad"), name: "ח", fixed: 0.1, variable: 5, trustee: 5 }, "custom-fund-x", "index-sp500", t);
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
