// "השקעה במדד" on the collected data (spec §8): the founder's plan, the grid, the custom index and D27.
import { describe, expect, it } from "vitest";
import { BlockedError } from "@finance-tool/engine";
import { accountSum, blockedReason, buildInvest, dealOnFunds, listReading, pairCosts, pairRow, indexById, knownIndices, matchKnownIndex, optionOfFund, refOfCustom, venueOfBand, type CustomIndex, doubtOf, placesOf, firstCount, phoneOnlyOf, phoneOnlyValue } from "./invest";
import { buildIndicesBundle } from "./providers.server";
import { fundDraftOf, fundFromDraft, withCustomEntries } from "./custom-entries";
import type { WorkbenchInputs } from "./providers";
import { differenceOf, entered, sheetRules, type SiteValue } from "./value";
import { ACCOUNT_LINES, FUND_LINES, SURTAX_RULES } from "./run-rules";
import { feesData } from "./fees.server";
import { houseDeal } from "./deal-account/house-deal";
import { dealProviderId, withDeals } from "./deal-account/bundle";
import { invest as words, numbers } from "../copy";
import { inflationOf, leftOf } from "../components/invest/receipt";
import { receiptChain } from "./receipt";

// The page's data as built, but for the exchange rates: frozen at the ECB's rates of 16.11.2026 (units per euro) and dated today, so
// the figures pinned below move with a fund's or a house's data, never with the daily rate refresh (which turned the check red on
// 16.11.2026), and never read as stale. Re-pin with the data, never to fit.
const FROZEN_PER_EUR = { USD: 1.1014, ILS: 3.5509, GBP: 0.8345, CHF: 0.9244, JPY: 175.78, CAD: 1.5734, AUD: 1.6301 };
/** The value, or the test fails here where it is missing. */
function need<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}

const live = buildIndicesBundle();
const bundle: typeof live = live.fx ? { ...live, fx: { ...live.fx, date: live.today, perEur: { ...live.fx.perEur, ...FROZEN_PER_EUR } } } : live;
const t = bundle.today;
const plan = (over: Partial<WorkbenchInputs> = {}, ret = 7): WorkbenchInputs => ({
  amountNow: 6000,
  monthly: 400,
  years: 20,
  grossReturn: ret / 100,
  inflation: 0.02,
  age: null,
  income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  ...over,
});
const sp = indexById(bundle, "index-sp500")!;
/**
 * A plan where neither the CPI nor the dollar moves (A-02 = A-03 = 0): the two readings of TXS OQ26 give one result (method §13), so every
 * Israeli fund whose status is open is ranked as the others are, and the dollar is steady.
 */
const steady = (over: Partial<WorkbenchInputs> = {}): WorkbenchInputs => plan({ inflation: 0, values: { ...plan().values, inflation: entered(0, "pct_per_year", t) }, ...over });

describe("invest page computation", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });

  it("prices the distributing funds abroad from their records' yields, and names a missing yield as missing (A-10, D85, D107)", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    const of = (id: string) => abroad.funds.find((f) => f.rec.id === id)!;
    for (const id of ["ie0031442068", "ie00b3xxrp09"]) {
      expect(of(id).best?.valueN).toBeGreaterThan(0);
      // paying out costs tax along the way: below the same house's accumulating fund at the same fee
      expect(of(id).best!.valueN).toBeLessThan(of("ie00b5bmr087").best!.valueN);
    }
    // a US fund organised as a trust is priced on the yield its record carries
    for (const id of ["us-voo", "us-ivv"]) expect(of(id).best?.valueN, id).toBeGreaterThan(0);
    // and a record that carries none says the yield is missing (D107)
    const noYield = { ...bundle, funds: bundle.funds.map((r) => { if (r.id !== "us-voo") return r; const { distribution: _d, ...rest } = r; return rest; }) };
    const voo = buildInvest({ bundle: noYield, index: sp, plan: plan() }).options.find((o) => o.id === "abroad")?.funds.find((f) => f.rec.id === "us-voo");
    expect(voo?.best).toBeUndefined();
    expect(voo?.reason).toEqual({ code: "need-yield" });
  });

  it("prices and ranks a US fund organised as a trust on its record's yield, on the site's reading that its distribution is a dividend (F-20, D85)", () => {
    for (const index of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index, plan: plan() });
      for (const f of v.options.flatMap((o) => o.funds).filter((x) => x.rec.domicile === "US")) {
        expect(f.reason, f.rec.id).toBeUndefined();
        expect(f.best?.valueN, f.rec.id).toBeGreaterThan(0);
        const priced = Object.values(f.byHouse).flatMap((w) => ("valueN" in w ? [w] : []));
        expect(priced.length, f.rec.id).toBeGreaterThan(0);
        for (const w of priced) {
          // the site's reading, said in the figure's sheet: no doubt on the figure, and TXF-08 among the rules it rests on
          expect(w.value.labels, f.rec.id).toContainEqual({ code: "reading", ruleId: "TXF-08" });
          expect(w.value.doubt, f.rec.id).toBeUndefined();
          expect(w.value.labels?.some((l) => l.code === "cautious"), f.rec.id).toBe(false);
        }
      }
    }
  });

  it("marks the houses whose monthly purchases run on a price for monthly buying, and only them", () => {
    // Interactive Israel's conversion inside its recurring plan (p.6 of its tariff); the three banks' standing-order lines are set aside (D41)
    const marked = view.houses.filter((h) => h.entries.some((e) => e.price?.standing)).map((h) => h.provider.id);
    expect(marked.sort()).toEqual(["interactive-israel"]);
  });

  it("never ranks a standing-order line the bank's documents do not show the reader can use, and shows it beside the row (D41, D56)", () => {
    const banks = ["leumi", "massad", "fibi"];
    // the same houses with no standing-order line at all: every Israeli fund's figure is the same to the shekel
    const without = { ...bundle, snapshots: bundle.snapshots.map((s) => (banks.includes(s.id) ? { ...s, lines: s.lines.filter((l) => l.not_ranked === undefined) } : s)) };
    // every index's Israeli funds, so the count does not rest on which of one index's funds are priced
    const israeli = (b: typeof bundle) => knownIndices(b).flatMap((i) => buildInvest({ bundle: b, index: i, plan: plan() }).options.filter((o) => o.id === "il-tracking" || o.id === "il-etf").flatMap((o) => o.funds.map((f) => ({ key: `${i.id} ${f.rec.id}`, f }))));
    const withLines = israeli(bundle);
    const bare = new Map(israeli(without).map((x) => [x.key, x.f]));
    let seen = 0;
    for (const id of banks) {
      const setAside = bundle.snapshots.find((s) => s.id === id)!.lines.filter((l) => l.not_ranked !== undefined).map((l) => l.id);
      expect(setAside.length, id).toBeGreaterThan(0);
      for (const { key, f } of withLines) {
        const match = bare.get(key);
        if (!match) throw new Error(`the bundle without the standing-order lines has ${key}`);
        const at = f.byHouse[id];
        const other = match.byHouse[id];
        if (!at || !("valueN" in at) || !other || !("valueN" in other)) continue;
        seen++;
        expect(at.valueN).toBe(other.valueN);
        expect(at.standing).toBe(false);
        // beside the row: the line the bank prints for this fund, with its reason
        expect(at.aside).toHaveLength(1);
        expect(setAside).toContain(at.aside[0]);
        expect(other.aside).toEqual([]);
      }
      expect(view.houses.find((h) => h.provider.id === id)!.aside.length, id).toBeGreaterThan(0);
    }
    expect(seen).toBeGreaterThan(20);
  });


  it("Psagot prices funds abroad with no doubt on the row, as its written answer of 10.11.2026 settles them (D42)", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    const accumulating = abroad.funds.filter((f) => f.rec.distribution_policy === "accumulating");
    expect(accumulating.length).toBeGreaterThan(0);
    for (const f of accumulating) expect("valueN" in f.byHouse.psagot!).toBe(true);
    expect(doubtOf(bundle.snapshots.find((s) => s.id === "psagot"), "abroad")).toBeNull();
    expect(view.headline!.providerId).toBe("psagot");
  });

  it("One Zero sells no Israeli ETF and leaves the foreign funds traded in Tel Aviv open, each with its own reason (2026-11-12)", () => {
    const oz = bundle.snapshots.find((s) => s.id === "one-zero");
    // the Israeli ETF is a plain no: no doubt on that option; the foreign fund in Tel Aviv reads its own entry, not the ETF's
    expect(doubtOf(oz, "il-etf")).toBeNull();
    expect(doubtOf(oz, "tase-foreign")).toContain("קרנות חוץ");
    const at = (option: string) => view.options.find((o) => o.id === option)!.funds.map((f) => f.byHouse["one-zero"] as { availability?: unknown; valueN?: number } | undefined);
    const etfs = view.options.find((o) => o.id === "il-etf")?.funds ?? [];
    expect(etfs.length).toBeGreaterThan(0);
    // a fund priced at the houses reads One Zero's "not sold"
    for (const f of etfs.filter((x) => !x.reason)) expect((f.byHouse["one-zero"] as { availability?: unknown } | undefined)?.availability, f.rec.id).toBeDefined();
    expect(at("tase-foreign").length).toBeGreaterThan(0);
    for (const h of at("tase-foreign")) {
      expect(h?.availability).toBeUndefined();
      expect(h?.valueN).toBeUndefined();
    }
  });

  it("a house that trades abroad only in the United States says so of a fund that trades in Europe, whatever its other readings stop on (2026-11-25)", () => {
    // Altshuler Trade prints three US plans: its plain reading stopped on "several lines apply", which the page showed in place of the reason
    const abroad = view.options.find((o) => o.id === "abroad")?.funds ?? [];
    const europe = abroad.filter((f) => f.rec.identifiers.isin?.startsWith("IE"));
    expect(europe.length).toBeGreaterThan(0);
    for (const id of ["altshuler-trade", "one-zero"]) {
      for (const f of europe) expect((f.byHouse[id] as { reason?: unknown } | undefined)?.reason, `${id} ${f.rec.id}`).toEqual({ code: "other-venue", venue: "us", fundVenue: "europe" });
      // and a fund that trades in the United States is priced there
      expect((abroad.find((f) => f.rec.id === "us-voo")?.byHouse[id] as { valueN?: number } | undefined)?.valueN, id).toBeGreaterThan(0);
    }
  });

  it("lists the equity indices of the records, none chosen for the person", () => {
    expect(knownIndices(bundle).map((i) => i.id)).toContain("index-sp500");
    expect(knownIndices(bundle).every((i) => i.exposure?.kind === "equity_index")).toBe(true);
  });

  it("the founder's plan: the cheapest way is Psagot Trade with a tracking fund, priced with the fund's own class", () => {
    expect(view.headline).not.toBeNull();
    expect(view.headline!.providerId).toBe("psagot");
    expect(view.headline!.option).toBe("il-tracking");
    expect(optionOfFund(view.headline!.fund.rec, sp.exposure!)).toBe("il-tracking");
  });

  it("Interactive Israel is not available where TASE units are sold", () => {
    const cellOf = (o: string) => view.options.find((x) => x.id === o)!.cells.find((c) => c.providerId === "interactive-israel")!;
    expect(cellOf("il-etf").kind).toBe("unavailable");
    expect(cellOf("il-etf").availability?.source.url).toMatch(/^http/);
    expect(cellOf("tase-foreign").kind).toBe("unavailable");
    expect(cellOf("il-tracking").kind).not.toBe("cost");
  });

  it("the abroad column has numbers or a per-broker reason, never a page error", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    expect(abroad.cells.length).toBe(view.providers.length);
    for (const c of abroad.cells) expect(c.kind === "cost" ? typeof c.costN === "number" : c.kind === "unavailable" || !!c.reason).toBe(true);
    expect(abroad.cells.some((c) => c.kind === "cost")).toBe(true);
    // One Zero's doubled plan lines, the column's one engine failure, left its lines (D43 amended (2)); every house prices a fund
    // abroad, Psagot on its written answer of 10.11.2026. Altshuler answered in writing that it
    // trades only on the Israeli and US exchanges, so it is priced on its US line for a fund that trades in the US, as One Zero is.
    // IBI answered in writing that its line for other markets prices a fund bought in Europe, and sent the annex that prints it
    expect(abroad.cells.filter((c) => c.kind === "not-comparable")).toEqual([]);
    expect(abroad.cells.filter((c) => c.kind === "no-line").map((c) => c.providerId).sort()).toEqual([]);
    expect(abroad.cells.find((c) => c.providerId === "ibi")?.kind).toBe("cost");
    expect(abroad.cells.find((c) => c.providerId === "altshuler-trade")).toMatchObject({ kind: "cost", venue: "us" });
  });

  it("the Europe line of Interactive Israel prices a London fund and names the exchange", () => {
    const c = view.options.find((o) => o.id === "abroad")!.cells.find((x) => x.providerId === "interactive-israel")!;
    expect(c.kind).toBe("cost");
    expect(c.venue).toBe("europe");
  });

  it("IBI prices a fund bought in Europe on its line for other markets, and says it is bought by phone only (2026-11-08)", () => {
    const f = view.options.find((o) => o.id === "abroad")!.funds.find((x) => x.rec.id === "ie00b5bmr087")!;
    expect(f.byHouse.ibi).toMatchObject({ venue: "europe" });
    expect((f.byHouse.ibi as { valueN?: number }).valueN).toBeGreaterThan(0);
    // the house's words, for a fund bought in Europe only: not on the US exchanges, not on a fund of Tel Aviv
    const ibi = bundle.snapshots.find((s) => s.id === "ibi");
    expect(phoneOnlyOf(ibi, "abroad", "europe")?.source.quote).toBe("טלפונית מול חדר מסחר");
    expect(phoneOnlyOf(ibi, "abroad", "us")).toBeNull();
    expect(phoneOnlyOf(ibi, "abroad", null)).toBeNull();
    expect(phoneOnlyOf(ibi, "il-etf", "europe")).toBeNull();
    const v = phoneOnlyValue(ibi, "abroad", "europe", "IBI")!;
    expect(v).toMatchObject({ value: "בטלפון בלבד", unit: "text", state: "sourced", own: ibi!.provider.name_he });
    expect(v.source.url).toBe("docs/company-answers.md#ibi-2026-11-08");
    expect(v.lead).toContain("טלפונית מול חדר מסחר");
  });

  it("the funds of an option are ranked by value", () => {
    let ranked = 0;
    for (const index of knownIndices(bundle)) {
      const o = buildInvest({ bundle, index, plan: plan() }).options.find((x) => x.id === "il-tracking");
      if (!o) throw new Error(`${index.id} has an Israeli tracking-fund option`);
      const vals = o.funds.flatMap((f) => (f.best ? [f.best.valueN] : []));
      ranked += vals.length;
      expect([...vals].sort((a, b) => b - a), index.id).toEqual(vals);
    }
    expect(ranked).toBeGreaterThan(3);
  });

  it("a custom non-Israeli index shows broker costs per option and no funds; a foreign fund in Tel Aviv has none, its tax being open (F-04)", () => {
    const c: CustomIndex = { id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t };
    const v = buildInvest({ bundle, index: refOfCustom(c), plan: plan() });
    expect(v.options.filter((o) => o.exists).map((o) => o.id)).toEqual(["il-tracking", "il-etf", "tase-foreign", "abroad"]);
    for (const o of v.options) {
      expect(o.funds).toHaveLength(0);
      if (o.id !== "tase-foreign") expect(o.cells.some((x) => x.kind === "cost")).toBe(true);
    }
    const tase = v.options.find((o) => o.id === "tase-foreign")!;
    expect(tase.cells.some((x) => x.kind === "cost")).toBe(false);
    for (const x of tase.cells.filter((x) => x.kind !== "unavailable")) expect(x.reason).toEqual({ code: "rule-open", ruleId: "TXF-04" });
    expect(v.headline).toBeNull();
    expect(v.houses.some((h) => h.generic)).toBe(true);
  });

  it("prices a foreign fund in Tel Aviv whose annex states no index on the site's reading of TXF-04, with no doubt on its figure; one whose annex states it is priced on its statement (F-04, TXF OQ10, D84, D119)", () => {
    let stated = 0, unstated = 0;
    for (const id of ["index-sp500", "index-msci-acwi", "index-msci-world", "index-nasdaq100"]) {
      const v = buildInvest({ bundle, index: indexById(bundle, id)!, plan: plan() });
      const tase = v.options.find((o) => o.id === "tase-foreign")!;
      expect(tase.funds.length, id).toBeGreaterThan(0);
      for (const f of tase.funds) {
        expect(f.reason, f.rec.id).toBeUndefined();
        expect(f.best, f.rec.id).toBeDefined();
        expect(pairCosts({ bundle, index: v.index, plan: plan(), fundId: f.rec.id, providerId: f.best?.providerId ?? "" }), f.rec.id).not.toBeNull();
        if (f.rec.tax_ruling?.index) {
          stated++;
          expect(f.best?.value.doubt, f.rec.id).toBeUndefined();
        } else {
          unstated++;
          // the site read its documents, so its figure rests on the site's reading, which its sheet tags and whose rule it opens; no doubt
          const v = f.best?.value;
          expect(v?.labels, f.rec.id).toContainEqual({ code: "reading", ruleId: "TXF-04" });
          expect(v?.labels?.some((l) => l.code === "cautious"), f.rec.id).toBe(false);
          expect(v?.doubt, f.rec.id).toBeUndefined();
          expect(v && sheetRules(v).map((r) => r.id), f.rec.id).toContain("TXF-04");
        }
      }
    }
    expect(stated).toBeGreaterThan(0);
    expect(unstated).toBeGreaterThan(0);
  });

  it("prices an Israeli fund whose documents name a principal currency on the site's reading of TXS-14, its figure naming the fund's document and its cost before tax neither (F-04, TXS OQ26, D119)", () => {
    let named = 0;
    for (const id of ["index-sp500", "index-msci-acwi", "index-msci-world", "index-nasdaq100"]) {
      const ix = indexById(bundle, id);
      if (!ix) throw new Error(`the bundle prices ${id}`);
      const v = buildInvest({ bundle, index: ix, plan: plan() });
      for (const f of v.options.filter((o) => o.id === "il-tracking" || o.id === "il-etf").flatMap((o) => o.funds)) {
        const status = f.rec.tax_status.foreign_investment_fund;
        if (typeof status?.value !== "string") continue;
        const at = f.best ? f.byHouse[f.best.providerId] : undefined;
        if (!at || !("value" in at)) continue;
        named++;
        // the site's reading, tagged in the sheet, no doubt; the document that names the fund one is the fund's statement, at its page
        expect(at.value.labels, f.rec.id).toContainEqual({ code: "reading", ruleId: "TXS-14" });
        expect(at.value.labels?.some((l) => l.code === "cautious"), f.rec.id).toBe(false);
        expect(at.value.doubt, f.rec.id).toBeUndefined();
        expect(at.value.statements, f.rec.id).toEqual([{ term: "foreign-investment-fund", currency: status.value, source: status.source, checked: status.checked }]);
        // the account's cost before tax reads no tax index: no statement, no label of TXS-14
        expect(at.cost.statements, f.rec.id).toBeUndefined();
        expect(at.cost.labels?.some((l) => l.ruleId === "TXS-14"), f.rec.id).toBe(false);
      }
    }
    expect(named).toBeGreaterThan(0);
  });

  it("prices an Israeli fund the person typed on the cautious reading of TXS-14 where the readings split, its cost before tax with no doubt and no label (F-04, method §13, D119)", () => {
    // a typed Israeli tracking fund on the S&P 500, on a plan whose prices rise while the dollar stands still: the two readings split
    const typed = fundFromDraft({ ...fundDraftOf(null, "il-tracking"), payout: "accumulating" as const, hedged: false, name: "typed", fixed: 0.1, variable: 0, trustee: 0 }, "custom-fund-typed", "index-sp500", t);
    const b = withCustomEntries(bundle, [typed]);
    const ix = indexById(b, "index-sp500");
    if (!ix) throw new Error("the bundle prices the S&P 500");
    const v = buildInvest({ bundle: b, index: ix, plan: plan() });
    const f = v.options.flatMap((o) => o.funds).find((x) => x.rec.id === "custom-fund-typed");
    const priced = f ? Object.values(f.byHouse).filter((x): x is Extract<typeof x, { value: SiteValue }> => "value" in x) : [];
    expect(priced.length).toBeGreaterThan(0);
    for (const at of priced) {
      // what is left rests on the exit tax: the site's cautious reading, for a fund whose documents it did not read, with its doubt
      expect(at.value.labels).toContainEqual({ code: "cautious", ruleId: "TXS-14", notKnown: "documents" });
      expect(at.value.doubt).toBe(numbers.readingDoubt["TXS-14"]?.documents);
      // the account's cost before tax reads no tax index: no doubt, no label of TXS-14, no statement
      expect(at.cost.doubt).toBeUndefined();
      expect(at.cost.labels?.some((l) => l.ruleId === "TXS-14") ?? false).toBe(false);
      expect(at.cost.statements).toBeUndefined();
    }
  });

  it("pins one fund's account cost: the S&P 500's Tel Aviv line at Psagot on the plan, run on the dollar its annex states (F-91, D84)", () => {
    // 6,000 NIS now and 400 a month for 20 years at 7% and CPI 2%; 1159250's record of 2026-11-07 (0.07% a year, F-107's US tax) and
    // Psagot's price list as the bundle holds it, its dollar sums at the frozen rates above. A change of either moves these figures:
    // re-pin them with the data, never to fit.
    const v = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: plan() });
    const f = v.options.find((o) => o.id === "tase-foreign")!.funds.find((x) => x.rec.id === "1159250")!;
    const at = f.byHouse.psagot!;
    if (!("value" in at)) throw new Error("Psagot prices 1159250");
    // the account's fees: its whole part (F-91) less what the cash waiting for a whole unit did (F-109), as the receipt writes them
    expect(Math.round(at.accountCost)).toBe(2_751);
    // what it rests on: that nothing is taxed before the sale (TXF-11, the fund's own ruling), and the fund's US tax (TXF-16), which the
    // input of that tax lists and opens, so the figure itself does not list it again; never TXF-04, whose place the annex's own statement
    // takes, named as the fund's, its page linked
    const used = at.value.rulesUsed!.map((r) => r.id);
    expect(used).toEqual(expect.arrayContaining(["TXF-11"]));
    expect(used).not.toContain("TXF-16");
    expect(Object.values(need(at.value.computed_from, "the figure's inputs").inputs as Record<string, SiteValue>).flatMap((x) => x.rulesUsed ?? []).map((r) => r.id)).toContain("TXF-16");
    expect(used).not.toContain("TXF-04");
    expect(at.value.statements).toEqual([expect.objectContaining({ term: "tax-index", index: "fx", currency: "USD", page: 17, source: expect.objectContaining({ url: f.rec.tax_ruling!.source.url }) })]);
    // the account's cost before tax reads no tax index, and so no statement
    expect(at.cost.statements).toBeUndefined();
    // with no index stated, its documents read, the same fund takes the site's reading of TXF OQ10, the CPI (D119), so its figure is the one
    // an annex stating the CPI gives
    const ruling = f.rec.tax_ruling;
    if (!ruling?.index) throw new Error("1159250's record reports its ruling and its index");
    const { index: _stated, ...unstated } = ruling;
    const withRuling = (tax_ruling: typeof ruling) => ({ ...bundle, funds: bundle.funds.map((r) => (r.id === "1159250" ? { ...r, tax_ruling } : r)) });
    const leftAt = (b: typeof bundle) => {
      const x = buildInvest({ bundle: b, index: v.index, plan: plan() }).options.find((o) => o.id === "tase-foreign")?.funds.find((y) => y.rec.id === "1159250")?.byHouse.psagot;
      if (!x || !("valueN" in x)) throw new Error("Psagot prices 1159250");
      return x.valueN;
    };
    const onCpi = leftAt(withRuling({ ...ruling, index: { basis: "cpi", page: ruling.index.page, quote: ruling.index.quote, checked: ruling.index.checked } }));
    expect(leftAt(withRuling(unstated as typeof ruling))).toBeCloseTo(onCpi, 6);
  });

  it("an Israeli index has two options only", () => {
    const v = buildInvest({ bundle, index: indexById(bundle, "index-ta35")!, plan: plan() });
    expect(v.options.filter((o) => o.exists).map((o) => o.id)).toEqual(["il-tracking", "il-etf"]);
  });

  it("a typed name that matches a known index selects it", () => {
    expect(matchKnownIndex(bundle, "S&P 500")?.id).toBe("index-sp500");
    expect(matchKnownIndex(bundle, "ניקיי 225")).toBeNull();
  });

  it("the houses: ranked by what is left, the headline's own house first", () => {
    const il = view.houses.filter((h) => h.group === "il" && h.best);
    expect(il[0]!.provider.id).toBe(view.headline!.providerId);
    const left = il.map((h) => h.best!.price!.valueN);
    expect([...left].sort((a, b) => b - a)).toEqual(left);
  });

  it("opens on an unhedged fund (founder, 2026-10-28); hedged funds stay in the list, priced and pickable", () => {
    const world = indexById(bundle, "index-msci-world")!;
    // on a plan where the two readings of TXS OQ26 agree, so a fund whose status is open is ranked too
    const v = buildInvest({ bundle, index: world, plan: steady() });
    const funds = v.options.flatMap((o) => o.funds);
    // every hedged fund stays in the list: priced, or listed with its reason
    const everyHedged = funds.filter((f) => f.rec.hedged === true);
    for (const f of everyHedged) expect(f.best !== undefined || f.reason !== undefined, f.rec.id).toBe(true);
    const hedged = everyHedged.filter((f) => f.best);
    expect(hedged.length).toBeGreaterThan(0);
    // F-92: a hedged fund's shortfall beyond its fees is counted, so none leaves more than the headline on a steady dollar;
    // the one with no full year in its report is listed with its reason, not priced
    expect(Math.max(...hedged.map((f) => f.best!.valueN))).toBeLessThan(v.headline!.valueN);
    expect(funds.find((f) => f.rec.id === "5140165")!.reason).toEqual({ code: "no-hedge-record" });
    expect(v.headline!.fund.rec.hedged).not.toBe(true);
    const unhedged = funds.filter((f) => f.rec.hedged !== true && f.best);
    expect(v.headline!.valueN).toBe(Math.max(...unhedged.map((f) => f.best!.valueN)));
  });

  it("a hedged fund whose years F-92 (d) does not compare falls back to the hedged rule: listed with its reason, never priced at A-07 = 0 (finance review F3)", () => {
    const world = indexById(bundle, "index-msci-world")!;
    const id = "5139696";
    // on a plan where the two readings of TXS OQ26 agree, so the fund's status as a foreign-investment fund does not list it
    const reasonOf = (b: typeof bundle) => buildInvest({ bundle: b, index: world, plan: steady() }).options.flatMap((o) => o.funds).find((f) => f.rec.id === id)!;
    expect(reasonOf(bundle).best).toBeDefined();
    for (const dividends of ["unstated", "gross"] as const) {
      const funds = bundle.funds.map((f) => (f.id === id ? { ...f, tracking_record: { ...f.tracking_record!, benchmark: { ...f.tracking_record!.benchmark, dividends } } } : f));
      const way = reasonOf({ ...bundle, funds });
      expect(way.best, dividends).toBeUndefined();
      expect(way.reason, dividends).toEqual({ code: "no-hedge-record" });
    }
  });

  it("a hedged fund is not moved by the dollar against the shekel; an unhedged one is (F-04, 2026-10-29)", () => {
    const sp500 = indexById(bundle, "index-sp500")!;
    // each Israeli fund's figure after tax at its best house
    const left = (fx: number) => {
      const v = buildInvest({ bundle, index: sp500, plan: plan(), assumptions: { fxChange: fx } });
      return new Map(v.options.flatMap((o) => o.funds).filter((f) => f.rec.domicile === "IL").map((f) => [f.rec.id, f.best?.valueN ?? Number.NaN]));
    };
    const [down, up] = [left(-3), left(3)];
    const kinds = { hedged: 0, unhedged: 0 };
    for (const f of bundle.funds.filter((x) => x.exposure_id === "index-sp500")) {
      const was = down.get(f.id);
      if (was === undefined || !Number.isFinite(was)) continue;
      if (f.hedged === true) expect(up.get(f.id), f.id).toBeCloseTo(was, 6);
      else expect(up.get(f.id), f.id).toBeGreaterThan(was);
      kinds[f.hedged === true ? "hedged" : "unhedged"]++;
    }
    expect(kinds.hedged).toBeGreaterThan(0);
    expect(kinds.unhedged).toBeGreaterThan(0);
  });

  it("reads the exchange a tariff band names", () => {
    expect(venueOfBand('מניות הנסחרות בארה"ב')).toBe("us");
    expect(venueOfBand("מניות ו-ETF הנסחרות בבורסות אירופה")).toBe("europe");
    expect(venueOfBand("מסלול ONE")).toBeNull();
  });
});

describe("one account and one fund, broken down (2026-10-27)", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });
  const w = view.headline!;
  const pc = pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: w.providerId })!;
  const num = (v: { value: unknown }) => v.value as number;

  it("the pair keeps what the account charges, by its tariff lines", () => {
    expect(pc.account.length).toBeGreaterThan(0);
    expect(pc.account.reduce((a, l) => a + num(l.cost), 0) + pc.interaction).toBeCloseTo(pc.accountFees, 6);
  });

  it("the pair: the same value left as the list, the account's lines, the fund's fee and the tax", () => {
    expect(num(pc.left)).toBeCloseTo(w.valueN, 6);
    expect(num(pc.paidIn)).toBeCloseTo(6000 + 400 * 240, 6);
    expect(pc.paidIn.computed_from!.formula).toBe("F-106");
    expect(pc.account.length).toBeGreaterThan(0);
    expect(num(pc.tax)).toBeGreaterThan(0);
    expect(num(pc.fund)).toBeGreaterThanOrEqual(0);
  });

  it("the parts add up: what is left plus every cost is the same for every way, so a gap in what is left is the gap in cost (F-91)", () => {
    const all = (v: typeof view) => v.options.flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [{ fund: f.rec.id, house, at }] : [])));
    for (const [ix, ret] of [[sp, 7], [indexById(bundle, "index-ta125")!, 5], [indexById(bundle, "index-msci-world")!, 7]] as const) {
      const v = buildInvest({ bundle, index: ix, plan: plan({}, ret) });
      const ways = all(v);
      expect(ways.length).toBeGreaterThan(10);
      const sums = ways.map(({ fund, house, at }) => {
        const p = pairCosts({ bundle, index: ix, plan: plan({}, ret), fundId: fund, providerId: house })!;
        const cost = p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction + p.waitingN + num(p.fund) + num(p.tax);
        // a way's cost is the receipt's fees for the same way: the lines and the remainder, without the waiting cash (F-109), which the
        // account's part holds beside them
        expect(p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction).toBeCloseTo(at.accountCost, 6);
        expect(p.accountFees).toBeCloseTo(at.accountCost, 6);
        expect(p.accountFees + p.waitingN).toBeCloseTo(p.accountCost, 6);
        expect(num(p.left) + cost).toBeCloseTo(p.base, 6);
        return p.base;
      });
      for (const b of sums) expect(b).toBeCloseTo(sums[0]!, 6);
    }
  });

  it("the parts still add up when a fund pays out (A-10): the tax paid along the way, with its lost growth, is the state's", () => {
    // the cheapest fund, read as if its record said it pays out, with the yield entered
    const b = { ...bundle, funds: bundle.funds.map((f) => (f.id === w.fund.rec.id ? { ...f, distribution_policy: "distributing" as const } : f)) };
    const assumptions = { distributions: { [w.fund.rec.id]: { yield: 1.3, perYear: 4 } } };
    const v = buildInvest({ bundle: b, index: sp, plan: plan(), assumptions });
    const ways = v.options.flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [{ fund: f.rec.id, house }] : [])));
    const paying = ways.filter((x) => x.fund === w.fund.rec.id);
    expect(paying.length).toBeGreaterThan(0);
    const bases = ways.map(({ fund, house }) => {
      const p = pairCosts({ bundle: b, index: sp, plan: plan(), assumptions, fundId: fund, providerId: house })!;
      const cost = p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction + p.waitingN + num(p.fund) + num(p.tax);
      expect(num(p.left) + cost).toBeCloseTo(p.base, 6);
      return p.base;
    });
    for (const b of bases) expect(b).toBeCloseTo(bases[0]!, 6);
    // the paying fund leaves less than the same fund held without payouts, and the difference is in the state's part
    const still = pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: w.providerId })!;
    const pays = pairCosts({ bundle: b, index: sp, plan: plan(), assumptions, fundId: w.fund.rec.id, providerId: w.providerId })!;
    expect(num(pays.left)).toBeLessThan(num(still.left));
    expect(num(pays.tax)).toBeGreaterThan(num(still.tax));
  });

  it("the fund's part is the same at every account", () => {
    const at = Object.entries(w.fund.byHouse).filter(([, x]) => "valueN" in x).map(([h]) => num(pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: h })!.fund));
    for (const f of at) expect(f).toBeCloseTo(at[0]!, 6);
  });

  it("an account that cannot price the fund gives no breakdown", () => {
    const none = Object.entries(w.fund.byHouse).find(([, v]) => "reason" in v)?.[0];
    if (none) expect(pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: none })).toBeNull();
  });
});


describe("places in a ranked list (F-80, P-01, 2026-11-05)", () => {
  it("a value within the threshold of the first shares the first place", () => {
    // 86,449 is 0.05% under 86,492: a tie at 0.5%
    expect(placesOf([86_492, 86_449, 84_148], 0.005)).toEqual([1, 1, 3]);
    expect(firstCount(placesOf([86_492, 86_449, 84_148], 0.005))).toBe(2);
  });
  it("equal figures share a place, and the next keeps its own", () => {
    expect(placesOf([86_492, 84_148, 81_471, 81_471, 80_000], 0.005)).toEqual([1, 2, 3, 3, 5]);
  });
  it("with nothing put in, every row is zero and every row ties", () => {
    expect(placesOf([0, 0, 0], 0.005)).toEqual([1, 1, 1]);
  });
  it("with no threshold only equal figures share", () => {
    expect(placesOf([100, 98, 50], 0)).toEqual([1, 2, 3]);
    expect(placesOf([100, 99.9, 50], 0)).toEqual([1, 1, 3]);
  });
});

describe("a bank's current account on the indices page (D64, F-102)", () => {
  const before = buildInvest({ bundle, index: sp, plan: plan() });
  const counted = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: true }) });
  const best = (v: typeof before, id: string) => v.houses.find((h) => h.provider.id === id)!.best!.price!;
  /** The account's tariff lines of the house's best way, as the pair's breakdown writes them. */
  const linesAt = (v: typeof before, p: ReturnType<typeof plan>, id: string) => {
    const fundId = v.houses.find((h) => h.provider.id === id)?.best?.fund.rec.id;
    return fundId ? (pairCosts({ bundle, index: sp, plan: p, fundId, providerId: id })?.account.map((l) => l.line) ?? null) : null;
  };
  const banks = bundle.snapshots.filter((s) => s.current_account && (s.current_account.monthly_minimum.value as number) > 0).map((s) => s.id);

  it("every bank whose price list charges for a current account has it as a line of its own, and leaves less", () => {
    expect(banks.sort()).toEqual(["discount", "fibi", "hapoalim", "jerusalem", "leumi", "massad", "mercantile", "mizrahi-tefahot", "yahav"]);
    for (const id of banks) {
      const at = best(counted, id);
      expect(linesAt(counted, plan({ currentAccounts: true }), id)).toContain("account");
      // 240 monthly minimums of 4 to 9.50 shekels: more than a thousand shekels of today's money left behind, and less than three thousand
      expect(best(before, id).valueN - at.valueN).toBeGreaterThan(900);
      expect(best(before, id).valueN - at.valueN).toBeLessThan(3_000);
    }
  });

  it("lists the bank's monthly minimum among the figure's inputs, with its price list as the source, wherever the row counts it (lens review S5)", () => {
    const minimumOf = (v: typeof before, id: string) => (best(v, id).cost.computed_from!.inputs as Record<string, { value: unknown; source: { url: string }; state: string }>)[words.pair.accountMinimum];
    for (const id of banks) {
      const rec = bundle.snapshots.find((s) => s.id === id)!.current_account!.monthly_minimum;
      const m = minimumOf(counted, id)!;
      expect(m.value).toBe(rec.value);
      expect(m.source.url).toBe(rec.source.url);
      expect(m.state).toBe("sourced");
      expect((best(counted, id).value.computed_from!.inputs as Record<string, unknown>)[words.pair.accountMinimum]).toBeDefined();
    }
    // not where nothing is counted: before the page counts it, at an investment house
    expect(minimumOf(before, "leumi")).toBeUndefined();
    expect(minimumOf(counted, "psagot")).toBeUndefined();
    // the bank's own figure on its own row weakens nothing (D31)
    expect(best(counted, "leumi").value.weakest).toBe(best(before, "leumi").value.weakest);
    // the pair's breakdown: its cost lines list the minimum, what was paid in (the plan alone) does not
    const fundId = counted.houses.find((h) => h.provider.id === "leumi")!.best!.fund.rec.id;
    const pc = pairCosts({ bundle, index: sp, plan: plan({ currentAccounts: true }), fundId, providerId: "leumi" })!;
    expect((pc.account[0]!.cost.computed_from!.inputs as Record<string, unknown>)[words.pair.accountMinimum]).toBeDefined();
    expect((pc.paidIn.computed_from!.inputs as Record<string, unknown>)[words.pair.accountMinimum]).toBeUndefined();
  });

  it("an investment house, a foreign broker and a bank that charges nothing keep their figures", () => {
    for (const id of ["psagot", "ibi", "altshuler-trade", "meitav-trade", "excellence", "interactive-brokers", "interactive-israel", "one-zero", "pepper"]) {
      const h = before.houses.find((x) => x.provider.id === id);
      if (!h?.best?.price) continue;
      expect(best(counted, id).valueN).toBe(h.best.price.valueN);
    }
  });

  it("re-sorts the list where the gap is smaller than the account (evidence: 8dd1f013:research/audit/2026-11-06-indices-pricing)", () => {
    const order = (v: typeof before) => v.houses.filter((h) => h.best?.price).sort((a, b) => b.best!.price!.valueN - a.best!.price!.valueN).map((h) => h.provider.id);
    // Yahav's current account (4 shekels) is the cheapest of the banks': it passes Hapoalim, and IBI passes Discount and Mercantile
    expect(order(before).indexOf("hapoalim")).toBeLessThan(order(before).indexOf("yahav"));
    expect(order(counted).indexOf("yahav")).toBeLessThan(order(counted).indexOf("hapoalim"));
    expect(order(counted).indexOf("ibi")).toBeLessThan(order(counted).indexOf("discount"));
    expect(counted.headline!.providerId).toBe(before.headline!.providerId);
  });
});

describe("BANK-35 sits on the account's cost, not on what is left (independent check 2, must-fix 1)", () => {
  it("a bank's row whose counted current account is above the cap from July 2027 carries the note on its cost figure only", () => {
    const view = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: true }) });
    const ways = view.options.flatMap((o) => o.funds).map((f) => f.byHouse.leumi).filter((x): x is Extract<typeof x, { valueN: number }> => !!x && "valueN" in x);
    expect(ways.length).toBeGreaterThan(0);
    for (const w of ways) {
      expect(w.cost.flags).toContain("BANK-35");
      expect(w.value.flags ?? []).not.toContain("BANK-35");
      // a flag only: it sets none of the cost, so no figure lists it as a rule (method F-102)
      expect(w.cost.rulesUsed?.map((r) => r.id) ?? []).not.toContain("BANK-35");
    }
  });
  it("the pair's current-account line and the account's sum carry it, with the month the run found it from; what is left does not", () => {
    const fundId = need(need(view0().houses.find((h) => h.provider.id === "leumi"), "Leumi's house").best, "Leumi's best fund").fund.rec.id;
    const pc = need(pairCosts({ bundle, index: sp, plan: plan({ currentAccounts: true }), fundId, providerId: "leumi" }), "Leumi's pair");
    const line = pc.account.find((l) => l.line === "account");
    expect(line, "Leumi's pair counts its current account").toBeDefined();
    if (!line) throw new Error("Leumi's pair has no current-account line");
    expect(line.cost.flags).toContain("BANK-35");
    expect(line.cost.flagMonths?.["BANK-35"]).toBeGreaterThan(0);
    for (const l of pc.account.filter((x) => x.line !== "account")) expect(l.cost.flags ?? []).not.toContain("BANK-35");
    const sum = accountSum(pc, "x", t);
    expect(sum.flags).toContain("BANK-35");
    expect(sum.rulesUsed ?? []).toEqual([]);
    expect(pc.left.flags ?? []).not.toContain("BANK-35");
    // the receipt's value before tax (F-129) and the inflation on it (F-130) are what is left, not a cost: the flag stays on the account's row
    const inflation = inflationOf(pc, receiptChain(pc), "x", t);
    const before = need((need(inflation.computed_from, "the inflation's inputs").inputs as Record<string, SiteValue>)[words.receipt.beforeTax.nominal], "the value before tax");
    expect(need((need(before.computed_from, "the inputs of the value before tax").inputs as Record<string, SiteValue>)[words.receipt.parts.account], "the account's part").flags).toContain("BANK-35");
    for (const v of [before, inflation]) {
      expect(v.flags ?? []).not.toContain("BANK-35");
      expect(v.flagMonths?.["BANK-35"]).toBeUndefined();
    }
  });
  const view0 = () => buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: true }) });
});

describe("an engine flag keeps the month it applies from", () => {
  it("the receipt's what-is-left keeps the month of a flag the pair's left records (TXF-27, from the month the holding passes the threshold)", () => {
    const big = plan({ amountNow: 1_000_000, values: { ...plan().values, amount: entered(1_000_000, "nis", t) } });
    const pc = pairCosts({ bundle, index: sp, plan: big, fundId: "us-voo", providerId: "interactive-brokers" });
    const month = pc?.left.flagMonths?.["TXF-27"];
    expect(month, "a US fund held above the estate threshold").toBeDefined();
    const left = leftOf(need(pc, "the VOO pair"), t);
    expect(left.flags).toContain("TXF-27");
    expect(left.flagMonths?.["TXF-27"]).toBe(month);
  });
});

describe("each figure of a run lists the rules of the parts its number is made of", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });
  const ids = (v: SiteValue) => (v.rulesUsed ?? []).map((r) => r.id);
  const pairs = view.houses.flatMap((h) => (h.best ? [pairCosts({ bundle, index: sp, plan: plan(), fundId: h.best.fund.rec.id, providerId: h.provider.id })] : [])).filter((x): x is NonNullable<typeof x> => !!x);
  it("an account's line is one of the account's fee lines, and the account's and the fund's lines are apart", () => {
    expect(pairs.length).toBeGreaterThan(3);
    expect(ACCOUNT_LINES.filter((l) => FUND_LINES.includes(l))).toEqual([]);
    for (const pc of pairs) for (const l of pc.account) expect(ACCOUNT_LINES, `${pc.providerId} ${l.line}`).toContain(l.line);
  });
  it("each fee line's figure lists exactly the rules that changed that line, and every line the run books outside the fund's is the account's", () => {
    // the cheapest pair at each house on the S&P 500 and on the MSCI ACWI (whose fund carries the US tax inside its price, TXF-16, on its
    // own line), and the Irish fund that pays out at every house that prices it, on an income above the surtax's threshold
    const acwi = need(indexById(bundle, "index-msci-acwi"), "the MSCI ACWI");
    const rich = plan({ income: 900_000, values: { ...plan().values, income: entered(900_000, "nis", t) } });
    const irishId = "ie0031442068";
    const cases = [
      ...[sp, acwi].flatMap((index) => buildInvest({ bundle, index, plan: plan() }).houses.flatMap((h) => (h.best ? [{ index, p: plan(), fundId: h.best.fund.rec.id, providerId: h.provider.id }] : []))),
      ...bundle.snapshots.map((s) => ({ index: sp, p: rich, fundId: irishId, providerId: s.id })),
    ];
    const booked = new Set<string>();
    let lines = 0;
    let paying = 0;
    for (const c of cases) {
      const pc = pairCosts({ bundle, index: c.index, plan: c.p, fundId: c.fundId, providerId: c.providerId });
      if (!pc) continue;
      const row = pairRow({ bundle, index: c.index, plan: c.p, fundId: c.fundId, providerId: c.providerId, fxChange: 0 });
      if (!row) throw new Error(`${c.providerId}: the pair has no run`);
      const at = `${c.index.id} ${c.fundId} ${c.providerId}`;
      const changed = row.run.rules.flatMap((r) => r.uses.filter((u) => u.changed).map((u) => ({ id: r.id, u })));
      for (const { u } of changed) if (u.part === "fees" && u.line && !FUND_LINES.includes(u.line)) booked.add(u.line);
      // on a fund that pays out, a difference of B adds the whole tax during the run, a money carried to the horizon the payout's tax alone
      const during = new Set(pc.distributes ? changed.filter((x) => x.u.part === "taxDuring").map((x) => x.id) : []);
      const payoutTax = new Set([...during].filter((id) => !SURTAX_RULES.includes(id)));
      if (pc.distributes) paying++;
      const onLines = (ls: readonly string[]) => new Set(changed.filter((x) => x.u.part === "fees" && x.u.line !== undefined && ls.includes(x.u.line)).map((x) => x.id));
      // a rule an input of the figure already lists is left to that input, which opens it (`computed`)
      const exactly = (v: SiteValue, want: Set<string>, what: string) => {
        const held = new Set(Object.values((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>).flatMap((x) => ids(x)));
        expect(ids(v).sort(), `${at} ${what}`).toEqual([...want].filter((id) => !held.has(id)).sort());
      };
      for (const l of pc.account) {
        exactly(l.cost, new Set([...onLines([l.line]), ...(pc.units ? payoutTax : during)]), l.line);
        lines++;
      }
      exactly(pc.remainder, new Set([...onLines(ACCOUNT_LINES), ...during]), "remainder");
      exactly(pc.fund, new Set([...onLines(FUND_LINES), ...during]), "fund");
      if (pc.waiting) exactly(pc.waiting, payoutTax, "waiting");
    }
    expect(lines).toBeGreaterThan(5);
    expect(paying, "a pair on the fund that pays out").toBeGreaterThan(0);
    for (const line of booked) expect(ACCOUNT_LINES, line).toContain(line);
  });
  it("on a fund that pays nothing out, a figure before tax lists no tax rule, the fund's part only the US tax inside its price (TXF-16)", () => {
    const ways = view.options.flatMap((o) => o.funds).flatMap((f) => Object.values(f.byHouse).flatMap((x) => ("valueN" in x ? [{ f, x }] : [])));
    expect(ways.length).toBeGreaterThan(10);
    for (const { f, x } of ways) if (!f.rec.distribution) expect(ids(x.cost).filter((id) => id.startsWith("TX")), `${f.rec.id} cost`).toEqual([]);
    for (const pc of pairs) {
      const rec = need(bundle.funds.find((r) => r.id === pc.fundId), `the fund ${pc.fundId}`);
      if (pc.distributes) continue;
      // the US tax on the dividends inside the fund's price is one of the fund's own costs, booked on its line (F-107)
      expect(ids(pc.fund).filter((id) => id.startsWith("TX") && id !== "TXF-16"), `${pc.fundId} fund`).toEqual([]);
      for (const l of pc.account) expect(ids(l.cost).filter((id) => id.startsWith("TX")), `${pc.providerId} ${l.line}`).toEqual([]);
      expect(ids(pc.remainder).filter((id) => id.startsWith("TX")), `${pc.providerId} remainder`).toEqual([]);
      expect(rec.distribution).toBeFalsy();
    }
  });
  it("the state's part lists only tax rules, and what is left lists every rule its own step adds", () => {
    for (const pc of pairs) {
      for (const id of ids(pc.tax)) expect(id.startsWith("TX"), `${pc.providerId} tax ${id}`).toBe(true);
      expect(ids(pc.left).length, pc.providerId).toBeGreaterThan(0);
    }
  });
  it("a difference from the pair on the receipt lists no rule; each of its two figures lists its own, which the page ships", () => {
    const shipped = new Set(bundle.rules.map((r) => r.id));
    const ways = view.options.flatMap((o) => o.funds).filter((f) => f.best);
    const [a, b] = [need(ways[0]?.best, "the first fund's best"), need(ways[1]?.best, "the second fund's best")];
    const gap = differenceOf(["א", a.value], ["ב", b.value], "F-65", { today: t });
    expect(gap.rulesUsed ?? []).toEqual([]);
    expect(sheetRules(gap)).toEqual([]);
    const reached = Object.values(need(gap.computed_from, "the difference's inputs").inputs as Record<string, SiteValue>).flatMap((v) => sheetRules(v).map((r) => r.id));
    expect(reached.length).toBeGreaterThan(0);
    for (const id of reached) expect(shipped.has(id), id).toBe(true);
  });
});

describe("what each figure's sheet lists", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: true }) });
  const inputs = (v: SiteValue) => v.computed_from!.inputs as Record<string, SiteValue>;
  const abroad = view.options.find((o) => o.id === "abroad")!;
  const irish = abroad.funds.find((f) => f.rec.id === "ie0031442068")!;
  const israeli = view.options.find((o) => o.id === "il-etf")!.funds.find((f) => f.best)!;
  const dollar = words.pair.rateInput("USD");

  it("a run priced in dollars lists the dollar rate (F-84), and a fund that pays out its payout yield (A-10)", () => {
    expect(inputs(irish.best!.value)[dollar]!.computed_from!.formula).toBe("F-84");
    expect(inputs(irish.best!.value)[words.pair.fundInputs.payout]!.value).toBe(irish.rec.distribution!.yield.value);
    expect(inputs(irish.best!.cost)[dollar]).toBeDefined();
    // the abroad option's generic fund is bought in dollars too; an Israeli fund reads no rate and pays nothing out
    const cell = abroad.cells.find((x) => x.kind === "cost");
    if (!cell?.cost) throw new Error("the abroad option has a priced generic cell");
    expect(inputs(cell.cost)[dollar]).toBeDefined();
    expect(inputs(israeli.best!.value)[dollar]).toBeUndefined();
    expect(inputs(israeli.best!.value)[words.pair.fundInputs.payout]).toBeUndefined();
  });

  it("an Irish fund that holds the US shares lists the US tax on their dividends (F-107, A-11); a swap fund and an Israeli fund list none", () => {
    const tax = inputs(irish.best!.value)[words.pair.fundInputs.usWithholding]!;
    expect(tax.computed_from!.formula).toBe("F-107");
    // whether the fund obtains the treaty rate is open (TXF OQ7): the figure and the value it costs both say so
    expect(tax.flags).toContain("TXF-OQ7");
    expect(irish.best!.value.flags).toContain("TXF-OQ7");
    const of = inputs(tax);
    expect(of[words.pair.fundInputs.usRate]!.value).toBe(15);
    expect(of[words.pair.fundInputs.usYield]!.value).toBe(bundle.exposures.find((e) => e.id === "index-sp500")!.us_dividends!.yield.value);
    // the S&P 500 is made of US companies: no weight to list
    expect(of[words.pair.fundInputs.usWeight]).toBeUndefined();
    expect(tax.value).toBeCloseTo(0.15 * (of[words.pair.fundInputs.usYield]!.value as number), 3);
    // the swap funds collected trade in Tel Aviv, whose tax is open (F-04): the same Irish fund abroad, held as a swap, is the case
    const asSwap = { ...irish.rec, id: "ie-swap-case", replication: { ...irish.rec.replication!, method: "swap" as const } };
    const swapView = buildInvest({ bundle: { ...bundle, funds: [...bundle.funds, asSwap] }, index: sp, plan: plan({ currentAccounts: true }) });
    const swap = swapView.options.flatMap((o) => o.funds).find((f) => f.rec.id === "ie-swap-case");
    expect(swap?.best).toBeDefined();
    expect(inputs(swap!.best!.value)[words.pair.fundInputs.usWithholding]).toBeUndefined();
    expect(inputs(israeli.best!.value)[words.pair.fundInputs.usWithholding]).toBeUndefined();
  });

  it("A-07 from a report that prints no fees charged lists the fees listed today, which F-92 (b) measures those years against", () => {
    const funds = view.options.flatMap((o) => o.funds).filter((f) => f.best && f.rec.tracking_record?.years.some((y) => !y.fees_charged));
    const beyond = funds.flatMap((f) => Object.entries(inputs(f.best!.value)).filter(([k]) => k.startsWith(words.pair.fundInputs.beyond([2000, 2001]).slice(0, 10))).map(([, v]) => v));
    expect(beyond.length).toBeGreaterThan(0);
    for (const b of beyond) expect(inputs(b)[words.pair.fundInputs.listedFixed]).toBeDefined();
  });

  it("an account's cost is F-91", () => {
    expect(irish.best!.cost.computed_from!.formula).toBe("F-91");
  });

  it("a pair's parts: the fund's part reads no account, X neither the fund nor the account, and the account's cost adds up its parts", () => {
    const fundId = view.houses.find((h) => h.provider.id === "leumi")!.best!.fund.rec.id;
    const pc = pairCosts({ bundle, index: sp, plan: plan({ currentAccounts: true }), fundId, providerId: "leumi" })!;
    expect(inputs(pc.fund)[words.pair.accountMinimum]).toBeUndefined();
    expect(inputs(pc.tax)[words.pair.accountMinimum]).toBeDefined();
    expect(inputs(pc.fund)[words.pair.fundInputs.fixed]).toBeDefined();
    expect(Object.keys(inputs(pc.baseValue)).sort()).toEqual(Object.values(words.planInputs).sort());
    expect(accountSum(pc, "x", t).value).toBeCloseTo(pc.accountCost, 6);
    expect(Object.keys(inputs(accountSum(pc, "x", t)))).toContain(words.pair.remainder);
  });

  // Leumi's cheapest fund on the plan, priced as a pair; a test that finds none fails on its own line
  const leumiPair = (p: WorkbenchInputs) => {
    const fundId = view.houses.find((h) => h.provider.id === "leumi")?.best?.fund.rec.id ?? "";
    const pc = pairCosts({ bundle, index: sp, plan: p, fundId, providerId: "leumi" });
    if (!pc) throw new Error("Leumi prices no fund on the S&P 500");
    return pc;
  };

  it("the tax lists the income where it moves the tax, through the surtax (F-43) or the brackets from 60 (F-42); a figure before any tax lists none", () => {
    const at = (income: number | null) => leumiPair(plan({ income, values: { ...plan().values, ...(income === null ? {} : { income: entered(income, "nis", t) }) }, currentAccounts: true }));
    const low = at(1), high = at(5_000_000);
    // an income whose surtax test the gain never passes changes nothing, so it is not listed
    expect(inputs(low.tax)[words.pair.incomeInput]).toBeUndefined();
    expect(inputs(low.left)[words.pair.incomeInput]).toBeUndefined();
    expect(inputs(high.tax)[words.pair.incomeInput]?.value).toBe(5_000_000);
    expect(inputs(high.left)[words.pair.incomeInput]).toBeDefined();
    // the run reads it: an income above the surtax's threshold adds the surtax to the tax on the gain (TXG-09)
    expect(high.tax.value as number).toBeGreaterThan(low.tax.value as number);
    expect(inputs(at(null).tax)[words.pair.incomeInput]).toBeUndefined();
    // the costs before the tax they save read no income
    for (const before of [high.baseValue, high.fund, high.remainder, ...high.account.map((l) => l.cost)]) expect(inputs(before)[words.pair.incomeInput]).toBeUndefined();
    const withIncome = plan({ income: 5_000_000, values: { ...plan().values, income: entered(5_000_000, "nis", t) }, currentAccounts: true });
    const v = buildInvest({ bundle, index: sp, plan: withIncome });
    // what a list shows as left after the tax reads it
    const leumiFund = v.houses.find((h) => h.provider.id === "leumi")?.best;
    // an age on the device is listed beside it, since from 60 the brackets the gain falls into read both (F-42); never before the tax
    const aged = leumiPair(plan({ age: 64, income: 100_000, values: { ...plan().values, income: entered(100_000, "nis", t), age: entered(64, "years", t) }, currentAccounts: true }));
    expect(inputs(aged.tax)[words.pair.ageInput]?.value).toBe(64);
    expect(inputs(aged.tax)[words.pair.incomeInput]?.value).toBe(100_000);
    expect(inputs(aged.fund)[words.pair.ageInput]).toBeUndefined();
    // an age that does not reach 60 by the sale changes nothing, so neither it nor an income below the surtax is listed
    const young = leumiPair(plan({ age: 25, income: 144_000, values: { ...plan().values, income: entered(144_000, "nis", t), age: entered(25, "years", t) }, currentAccounts: true }));
    expect(inputs(young.left)[words.pair.ageInput]).toBeUndefined();
    expect(inputs(young.left)[words.pair.incomeInput]).toBeUndefined();
    expect(inputs(high.tax)[words.pair.ageInput]).toBeUndefined();
    expect(leumiFund?.price && inputs(leumiFund.price.value)[words.pair.incomeInput]?.value).toBe(5_000_000);
  });

  it("on a fund that pays out, a difference of B lists the income (the payouts' surtax counts in its tax), a line carried in whole units does not", () => {
    const p = plan({ income: 900_000, values: { ...plan().values, income: entered(900_000, "nis", t) }, currentAccounts: true });
    const houses = Object.keys(irish.byHouse);
    const priced = houses.flatMap((h) => {
      const pc = pairCosts({ bundle, index: sp, plan: p, fundId: irish.rec.id, providerId: h });
      return pc ? [pc] : [];
    });
    const carried = priced.find((pc) => pc.units && pc.account.length > 0);
    if (!carried) throw new Error("no house buys the paying-out fund in whole units");
    expect(carried.distributes).toBe(true);
    expect(inputs(carried.fund)[words.pair.incomeInput]?.value).toBe(900_000);
    expect(inputs(carried.remainder)[words.pair.incomeInput]?.value).toBe(900_000);
    for (const l of carried.account) expect(inputs(l.cost)[words.pair.incomeInput]).toBeUndefined();
    if (carried.waiting) expect(inputs(carried.waiting)[words.pair.incomeInput]).toBeUndefined();
    // and so of the rules: every figure rests on the payout's tax; a difference of B takes the surtax with it, a carried money does not
    const tx = (v: SiteValue) => (v.rulesUsed ?? []).map((r) => r.id).filter((id) => id.startsWith("TX"));
    expect(tx(carried.tax).some((id) => SURTAX_RULES.includes(id))).toBe(true);
    for (const v of [carried.fund, carried.remainder]) expect(tx(v).some((id) => SURTAX_RULES.includes(id))).toBe(true);
    for (const v of [...carried.account.map((l) => l.cost), ...(carried.waiting ? [carried.waiting] : [])]) {
      expect(tx(v).length).toBeGreaterThan(0);
      expect(tx(v).filter((id) => SURTAX_RULES.includes(id))).toEqual([]);
    }
  });

  it("a deal's fee on a fund that pays out lists the same rules on the pair's receipt as in the deal's popup: the payout's tax, no surtax", () => {
    const p = plan({ income: 900_000, values: { ...plan().values, income: entered(900_000, "nis", t) }, currentAccounts: true });
    const data = feesData();
    let compared = 0;
    for (const house of data.houses) {
      const deal = houseDeal(`house:${house.id}`, data, t);
      if (!deal) continue;
      const b = withDeals(bundle, [deal], data.kinds);
      const providerId = dealProviderId(deal.id);
      const pc = pairCosts({ bundle: b, index: sp, plan: p, fundId: irish.rec.id, providerId });
      const at = dealOnFunds({ bundle: b, index: sp, plan: p, fundIds: [irish.rec.id], providerId }).get(irish.rec.id);
      if (!pc?.dealLines?.length || at?.kind !== "ok") continue;
      expect(pc.distributes).toBe(true);
      // the income is above the surtax's threshold, so the run's tax took the surtax
      expect((pc.tax.rulesUsed ?? []).some((r) => SURTAX_RULES.includes(r.id)), house.id).toBe(true);
      for (const l of pc.dealLines) {
        const onReceipt = (l.cost.rulesUsed ?? []).map((r) => r.id).sort();
        expect((at.figure(l.cost.value as number, "x", l.fee).rulesUsed ?? []).map((r) => r.id).sort(), `${house.id} ${l.fee}`).toEqual(onReceipt);
        // the money a fee took is carried at the fund's return less the payout's tax (F-91's t), which leaves the surtax out
        expect(onReceipt.filter((id) => id.startsWith("TX")).length, `${house.id} ${l.fee}`).toBeGreaterThan(0);
        expect(onReceipt.filter((id) => SURTAX_RULES.includes(id)), `${house.id} ${l.fee}`).toEqual([]);
      }
      compared++;
    }
    expect(compared, "a house whose deal prices the fund that pays out").toBeGreaterThan(0);
  });

  it("the deposits' sheet says the monthly deposit rises with prices (A-04, F-05)", () => {
    expect(leumiPair(plan()).paidIn.lead).toBe(words.pair.paidInLead);
  });
});

describe("Interactive Brokers abroad: its pricing plans and ways to convert", () => {
  // CSPX on the LSE, 2,000 a month for 10 years: Tiered (minimum USD 1.70) beats Fixed (USD 4), and a cash account's automatic conversion
  // (no commission, a markup the documents do not limit, D65) beats a spot order (at least USD 2) on every purchase, as Interactive Israel's
  // plan conversion does; the sale converts by a spot order whichever way the purchases convert (form 3203 s.30C covers a purchase only, F-13)
  const monthly = plan({ amountNow: 0, monthly: 2000, years: 10, values: { ...plan().values, amount: entered(0, "nis", t), monthly: entered(2000, "nis_per_month", t), years: entered(10, "years", t) } });
  const ibkr = bundle.snapshots.find((s) => s.id === "interactive-brokers")!;
  it("an account built on it starts from the reading the comparison prices it on", () => {
    expect(listReading(bundle, ibkr, "abroad", monthly)!.built.linesUsed).toEqual(expect.arrayContaining(["interactive-brokers-buy-sell-lse-usd-tiered", "interactive-brokers-fx-auto-conversion"]));
  });
  it("charges at Interactive Brokers only the sale's conversion, a spot order's minimum, and costs less there than at Interactive Israel on a unit 2,000 a month buys", () => {
    const at = (fundId: string, providerId: string) => pairCosts({ bundle, index: sp, plan: monthly, fundId, providerId })!;
    expect(listReading(bundle, ibkr, "abroad", monthly)?.built.linesUsed).toEqual(expect.arrayContaining(["interactive-brokers-fx-spot"]));
    // the proceeds, under USD 100,000, pay the spot order's minimum of USD 2 once, at the exit, carried to today's money: a few shekels
    const fx = at("ie00b5bmr087", "interactive-brokers").account.find((l) => l.line === "fx")?.cost.value as number;
    const usd = (bundle.fx?.perEur.ILS ?? Number.NaN) / (bundle.fx?.perEur.USD ?? Number.NaN);
    expect(fx).toBeGreaterThan(0);
    expect(fx).toBeLessThan(2 * usd * 1.5);
    // F-109 (D94): VUAA's unit (USD 146) is bought every month in whole units at Interactive Brokers, and costs less there
    expect(at("ie00bfmxxd54", "interactive-brokers").accountCost).toBeLessThan(at("ie00bfmxxd54", "interactive-israel").accountCost);
    // CSPX's unit (USD 815) is more than 2,000 a month: at Interactive Brokers the money waits for a unit, earning nothing, while
    // Interactive Israel's recurring plan buys each month by amount, so there it costs less
    expect(at("ie00b5bmr087", "interactive-brokers").units).not.toBeNull();
    expect(at("ie00b5bmr087", "interactive-israel").accountCost).toBeLessThan(at("ie00b5bmr087", "interactive-brokers").accountCost);
  });
  // the ranking scan's R5 (tools/rank-flags.mjs): a record with a non-zero conversion line whose row's conversion part is nothing, with no
  // spread part to explain it. Each fund bought abroad on these indices, on small and large plans, pays the sale's spot order
  it("its conversion part is never nothing abroad, where its record has a non-zero conversion line (the ranking scan's R5)", () => {
    const acwi = indexById(bundle, "index-msci-acwi");
    if (!acwi) throw new Error("index-msci-acwi is an index of the records");
    const plans = [plan({ amountNow: 0, monthly: 200, years: 1 }), plan({ amountNow: 50_000, monthly: 1_000, years: 20 }), plan({ amountNow: 6_000, monthly: 0, years: 5 })];
    let seen = 0;
    for (const index of [sp, acwi])
      for (const p of plans)
        for (const f of buildInvest({ bundle, index, plan: p }).options.find((o) => o.id === "abroad")?.funds ?? []) {
          const c = pairCosts({ bundle, index, plan: p, fundId: f.rec.id, providerId: "interactive-brokers" });
          // F-109: a plan whose money never buys a whole unit converts nothing, buys or sale
          if (!c || (p.amountNow === 0 && c.units && c.units.skipped === c.units.monthly)) continue;
          seen++;
          const part = (line: string) => (c.account.find((l) => l.line === line)?.cost.value as number | undefined) ?? 0;
          expect(part("fx") > 0.005 || part("spread") > 0, `${index.id} ${f.rec.id} ${p.amountNow}+${p.monthly}x${p.years}`).toBe(true);
        }
    expect(seen).toBeGreaterThan(6);
  });
});

describe("the generic Israeli fund of a kind (method F-04, G-40)", () => {
  it("shows only the account's cost before tax, which no tax index enters: on an index not in shekels it carries no G-40 flag, as on a shekel index", () => {
    const at = (id: string) => {
      const index = indexById(bundle, id);
      if (!index) throw new Error(`${id} is an index of the records`);
      return index;
    };
    const cells = (id: string) => buildInvest({ bundle, index: at(id), plan: plan() }).options.filter((o) => o.id === "il-tracking" || o.id === "il-etf").flatMap((o) => o.cells).filter((c) => c.kind === "cost");
    for (const id of ["index-sp500", "index-ta125"]) {
      const priced = cells(id);
      expect(priced.length, id).toBeGreaterThan(0);
      for (const c of priced) {
        expect(c.cost?.computed_from?.formula, `${id} ${c.providerId}`).toBe("F-91");
      }
    }
  });
});

describe("a provider row whose run stopped on its rule", () => {
  it("carries the open question where there is one and the method gap where no reading exists, never the rule's id as a question", () => {
    expect(blockedReason(new BlockedError("TXG-09", "TXG OQ17"))).toEqual({ code: "rule-open", ruleId: "TXG-09", question: "TXG OQ17" });
    expect(blockedReason(new BlockedError("CS-03", undefined, "G-38"))).toEqual({ code: "rule-open", ruleId: "CS-03", gap: "G-38" });
    expect(blockedReason(new BlockedError("TXF-04"))).toEqual({ code: "rule-open", ruleId: "TXF-04" });
  });
});

describe("an Israeli fund that may be measured by a principal currency (F-04, TXS OQ26, method §13)", () => {
  // the input: the collected data with two twins of a ranked S&P 500 fund whose documents say it is not a foreign-investment fund, the same
  // record under their own numbers, one whose documents name the dollar as its principal currency and one whose status is not known, as
  // the test sets them
  const base = buildInvest({ bundle, index: sp, plan: plan() });
  const known = base.options.flatMap((o) => o.funds).find((f) => f.rec.domicile === "IL" && f.rec.tax_status.foreign_investment_fund?.value === false && f.best);
  if (!known) throw new Error("a ranked Israeli S&P 500 fund whose documents say it is not a foreign-investment fund");
  const status = known.rec.tax_status.foreign_investment_fund!;
  const twinOf = (id: string, value: string | null) => ({ ...known.rec, id, identifiers: { ...known.rec.identifiers, isin: null, tase_number: id }, tax_status: { ...known.rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } });
  const named = "9999911";
  const unknown = "9999912";
  const twins = { ...bundle, funds: [...bundle.funds, twinOf(named, "USD"), twinOf(unknown, null)] };
  const at = (v: ReturnType<typeof buildInvest>, id: string) => {
    const f = v.options.flatMap((o) => o.funds).find((x) => x.rec.id === id);
    if (!f) throw new Error(`${id} is on the S&P 500 page`);
    return f;
  };
  const priced = (f: { best?: unknown; byHouse: Record<string, object> }) => f.best !== undefined && Object.values(f.byHouse).some((x) => "valueN" in x);
  it("where A-03 and A-02 differ, a fund whose documents name it one is priced on the site's reading with no doubt; one whose status is not known on the reading that leaves less, its figure marked", () => {
    const view = buildInvest({ bundle: twins, index: sp, plan: plan() });
    const cpiOnly = at(view, known.rec.id);
    for (const id of [named, unknown]) {
      const f = at(view, id);
      expect(f.reason, id).toBeUndefined();
      expect(priced(f), id).toBe(true);
    }
    // the documents name it one: the site's reading of TXS-14, tagged in its sheet, no doubt on the figure (D119)
    const n = at(view, named).best?.value;
    expect(n?.labels).toContainEqual({ code: "reading", ruleId: "TXS-14" });
    expect(n?.labels?.some((l) => l.code === "cautious")).toBe(false);
    expect(n?.doubt).toBeUndefined();
    // the documents do not settle whether it is one: the doubt says so, with the rule beside it
    const u = at(view, unknown);
    expect(u.best?.value.doubt).toBe(numbers.readingDoubt["TXS-14"]?.status);
    expect(u.best?.value.doubtRules).toEqual(["TXS-14"]);
    // the CPI is one of its two readings, and the fund it copies is measured by the CPI alone: at every house, never more than that fund
    for (const [house, x] of Object.entries(u.byHouse)) {
      const y = cpiOnly.byHouse[house];
      if ("valueN" in x && y && "valueN" in y) expect(x.valueN, `${unknown} ${house}`).toBeLessThanOrEqual(y.valueN + 1e-6);
    }
    expect(cpiOnly.best?.value.doubt).toBeUndefined();
    // every collected fund whose documents name it one is priced on this plan with no doubt (a Harel or Tachlit S&P 500 tracker among
    // them), and every one whose status is not known with the doubt
    const funds = base.options.flatMap((o) => o.funds).filter((x) => x.rec.domicile === "IL" && x.best);
    const namedOne = funds.filter((x) => typeof x.rec.tax_status.foreign_investment_fund?.value === "string");
    expect(namedOne.length).toBeGreaterThan(0);
    for (const f of namedOne) expect(f.best?.value.doubt, f.rec.id).toBeUndefined();
    for (const f of funds.filter((x) => x.rec.tax_status.foreign_investment_fund?.value === null)) expect(f.best?.value.doubtRules, f.rec.id).toEqual(["TXS-14"]);
  });
  it("where the dollar moves as prices do (A-03 = A-02), both readings agree: the twins are ranked, each at the value of the fund they copy", () => {
    const view = buildInvest({ bundle: twins, index: sp, plan: plan(), assumptions: { fxChange: 2 } });
    const was = at(view, known.rec.id).best?.valueN;
    for (const id of [named, unknown]) {
      const f = at(view, id);
      expect(f.reason, id).toBeUndefined();
      expect(priced(f), id).toBe(true);
      expect(f.best?.valueN, id).toBeCloseTo(was ?? Number.NaN, 6);
    }
  });
});
