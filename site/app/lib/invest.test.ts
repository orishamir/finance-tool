// "השקעה במדד" on the collected data (spec §8): the founder's plan, the grid, the custom index and D27.
import { describe, expect, it } from "vitest";
import { BlockedError } from "@finance-tool/engine";
import { accountSum, blockedReason, buildInvest, listReading, optionOpenRule, pairCosts, indexById, knownIndices, matchKnownIndex, optionOfFund, refOfCustom, venueOfBand, type CustomIndex, doubtOf, placesOf, firstCount, phoneOnlyOf, phoneOnlyValue } from "./invest";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { entered, type SiteValue } from "./value";
import { invest as words } from "../copy";

const bundle = buildIndicesBundle();
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
  returnFromParameter: false,
  ...over,
});
const sp = indexById(bundle, "index-sp500")!;

describe("invest page computation", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });

  it("prices the Irish distributing funds from their records' yields, and keeps a reason on the US ones", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    const of = (id: string) => abroad.funds.find((f) => f.rec.id === id)!;
    for (const id of ["ie0031442068", "ie00b3xxrp09"]) {
      expect(of(id).best?.valueN).toBeGreaterThan(0);
      expect(of(id).best?.open).toBe(false);
      // paying out costs tax along the way: below the same house's accumulating fund at the same fee, which is not ranked
      expect(of(id).best!.valueN).toBeLessThan(of("ie00b5bmr087").best!.valueN);
    }
    for (const id of ["us-voo", "us-ivv"]) {
      expect(of(id).best).toBeUndefined();
      expect(of(id).reason).toEqual({ code: "us-fund-open" });
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
    const bare = buildInvest({ bundle: without, index: sp, plan: plan() });
    const israeli = (v: typeof view) => v.options.filter((o) => o.id === "il-tracking" || o.id === "il-etf").flatMap((o) => o.funds);
    let seen = 0;
    for (const id of banks) {
      const setAside = bundle.snapshots.find((s) => s.id === id)!.lines.filter((l) => l.not_ranked !== undefined).map((l) => l.id);
      expect(setAside.length, id).toBeGreaterThan(0);
      for (const f of israeli(view)) {
        const at = f.byHouse[id];
        const other = israeli(bare).find((g) => g.rec.id === f.rec.id)!.byHouse[id];
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


  it("Psagot is grey on funds abroad, with its tariff's own words on why (D42)", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    const accumulating = abroad.funds.filter((f) => f.rec.distribution_policy === "accumulating");
    expect(accumulating.length).toBeGreaterThan(0);
    for (const f of accumulating) expect("valueN" in f.byHouse.psagot!).toBe(false);
    expect(doubtOf(bundle.snapshots.find((s) => s.id === "psagot"), "abroad")).toContain("עשויה להשתנות");
    expect(view.headline!.providerId).toBe("psagot");
  });

  it("One Zero sells no Israeli ETF and leaves the foreign funds traded in Tel Aviv open, each with its own reason (2026-11-12)", () => {
    const oz = bundle.snapshots.find((s) => s.id === "one-zero");
    // the Israeli ETF is a plain no: no doubt on that option; the foreign fund in Tel Aviv reads its own entry, not the ETF's
    expect(doubtOf(oz, "il-etf")).toBeNull();
    expect(doubtOf(oz, "tase-foreign")).toContain("קרנות חוץ");
    const at = (option: string) => view.options.find((o) => o.id === option)!.funds.map((f) => f.byHouse["one-zero"] as { availability?: unknown; valueN?: number } | undefined);
    expect(at("il-etf").length).toBeGreaterThan(0);
    for (const h of at("il-etf")) expect(h?.availability).toBeDefined();
    expect(at("tase-foreign").length).toBeGreaterThan(0);
    for (const h of at("tase-foreign")) {
      expect(h?.availability).toBeUndefined();
      expect(h?.valueN).toBeUndefined();
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
    // One Zero's doubled plan lines, the column's one engine failure, left its lines (D43 amended (2)); a house whose price
    // list leaves the price abroad open (Psagot, IBI) is a grey cell with its reason. Altshuler answered in writing that it
    // trades only on the Israeli and US exchanges, so it is priced on its US line for a fund that trades in the US, as One Zero is.
    // IBI answered in writing that its line for other markets prices a fund bought in Europe, and sent the annex that prints it
    expect(abroad.cells.filter((c) => c.kind === "not-comparable")).toEqual([]);
    expect(abroad.cells.filter((c) => c.kind === "no-line").map((c) => c.providerId).sort()).toEqual(["psagot"]);
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

  it("the funds of an option are ranked by value at the option's cheapest broker", () => {
    const o = view.options.find((x) => x.id === "il-tracking")!;
    const vals = o.funds.flatMap((f) => (f.best ? [f.best.valueN] : []));
    expect(vals.length).toBeGreaterThan(3);
    expect([...vals].sort((a, b) => b - a)).toEqual(vals);
    expect(o.funds.every((f) => !f.best || f.best.providerId === o.bestCell!.providerId)).toBe(true);
  });

  it("a person's broker is priced for the headline fund", () => {
    const v = buildInvest({ bundle, index: sp, plan: plan(), yourBroker: "leumi" });
    expect(v.atYours?.providerId).toBe("leumi");
    expect(v.atYours?.price).not.toBeNull();
    expect(v.atYours!.less!.value as number).toBeGreaterThan(0);
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
    expect(tase.bestCell).toBeNull();
    for (const x of tase.cells.filter((x) => x.kind !== "unavailable")) expect(x.reason).toEqual({ code: "rule-open", ruleId: "TXF-04" });
    expect(v.headline).toBeNull();
    expect(v.genericHeadline).not.toBeNull();
  });

  it("lists a foreign fund in Tel Aviv with the open rule its tax rests on, with no price after tax at any house, never ranked (F-04, TXF-04, D84)", () => {
    expect(optionOpenRule(bundle, "tase-foreign")).toBe("TXF-04");
    for (const o of ["il-tracking", "il-etf", "abroad"] as const) expect(optionOpenRule(bundle, o)).toBeNull();
    for (const id of ["index-sp500", "index-msci-acwi", "index-msci-world", "index-nasdaq100"]) {
      const v = buildInvest({ bundle, index: indexById(bundle, id)!, plan: plan() });
      const tase = v.options.find((o) => o.id === "tase-foreign")!;
      expect(tase.funds.length, id).toBeGreaterThan(0);
      for (const f of tase.funds) {
        expect(f.reason, f.rec.id).toEqual({ code: "rule-open", ruleId: "TXF-04" });
        expect(f.best).toBeUndefined();
        expect(Object.keys(f.byHouse)).toHaveLength(0);
      }
      expect(tase.bestWay).toBeNull();
      expect(v.headline?.option).not.toBe("tase-foreign");
      expect(pairCosts({ bundle, index: v.index, plan: plan(), fundId: tase.funds[0]!.rec.id, providerId: "psagot" })).toBeNull();
    }
  });

  it("gives a foreign fund in Tel Aviv its figures before tax at each house that sells it, apart from every price the page ranks (F-118, D84)", () => {
    for (const id of ["index-sp500", "index-msci-acwi", "index-msci-world", "index-nasdaq100"]) {
      const v = buildInvest({ bundle, index: indexById(bundle, id)!, plan: plan() });
      const tase = v.options.find((o) => o.id === "tase-foreign")!;
      for (const f of tase.funds) {
        expect(f.beforeTax?.ruleId, f.rec.id).toBe("TXF-04");
        const houses = Object.values(f.beforeTax!.byHouse);
        expect(houses.length, f.rec.id).toBeGreaterThan(0);
        for (const at of houses) {
          expect(at.left.computed_from?.formula).toBe("F-118");
          expect(at.left.value).toBeCloseTo(at.leftN, 9);
          expect(at.leftN).toBeGreaterThan(0);
          expect(at.accountCost.computed_from?.formula).toBe("F-91");
          expect(at.accountCost.value as number).toBeGreaterThan(0);
          // a house abroad does not sell a fund in Tel Aviv
          expect(v.providers.find((p) => p.id === at.providerId)!.foreign).toBe(false);
        }
      }
      // never in a house's ranked entries, the stairs' ways or the headline: the houses read only `byHouse`
      for (const h of v.houses) expect(h.best?.fund.option).not.toBe("tase-foreign");
    }
  });

  it("pins one fund's figures before tax: the S&P 500's Tel Aviv line at Psagot on the plan (F-118, F-91)", () => {
    // 6,000 NIS now and 400 a month for 20 years at 7% and CPI 2%; 1159250's record of 2026-11-07 (0.07% a year, F-107's US tax) and
    // Psagot's price list as the bundle holds it. A change of either moves these figures: re-pin them with the data, never to fit.
    const v = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: plan() });
    const f = v.options.find((o) => o.id === "tase-foreign")!.funds.find((x) => x.rec.id === "1159250")!;
    const at = f.beforeTax!.byHouse.psagot!;
    expect(Math.round(at.leftN)).toBe(165_137);
    // the account's fees: its whole part (F-91, 6,859) less what the cash waiting for a whole unit did (F-109), as the receipt writes them
    expect(at.accountCost.value).toBe(2_750);
    // what it rests on: the fund's US tax (TXF-16) and that nothing is taxed before the sale (TXF-11, the fund's own ruling); never TXF-04
    const used = at.left.rulesUsed!.map((r) => r.id);
    expect(used).toEqual(expect.arrayContaining(["TXF-16", "TXF-11"]));
    expect(used).not.toContain("TXF-04");
  });

  it("an Israeli index has two options only", () => {
    const v = buildInvest({ bundle, index: indexById(bundle, "index-ta35")!, plan: plan() });
    expect(v.options.filter((o) => o.exists).map((o) => o.id)).toEqual(["il-tracking", "il-etf"]);
  });

  it("without an entered return it says whether the order holds between 0% and 10%", () => {
    const v = buildInvest({ bundle, index: sp, plan: plan({ returnFromParameter: true }, 5) });
    expect(v.returnIllustrative).toBe(true);
    expect(v.order).not.toBeNull();
    expect(typeof v.order!.holds).toBe("boolean");
    expect(buildInvest({ bundle, index: sp, plan: plan() }).order).toBeNull();
  });

  it("a typed name that matches a known index selects it", () => {
    expect(matchKnownIndex(bundle, "S&P 500")?.id).toBe("index-sp500");
    expect(matchKnownIndex(bundle, "ניקיי 225")).toBeNull();
  });

  it("the houses: ranked by what is left, the headline's own house first, each gap measured from the headline", () => {
    const il = view.houses.filter((h) => h.group === "il" && h.best);
    expect(il[0]!.provider.id).toBe(view.headline!.providerId);
    expect(il[0]!.gap).toBeNull();
    const left = il.map((h) => h.best!.price!.valueN);
    expect([...left].sort((a, b) => b - a)).toEqual(left);
    for (const h of il.slice(1)) expect(h.gap!.value as number).toBeCloseTo(view.headline!.valueN - h.best!.price!.valueN, 6);
  });

  it("the worth lines are slices through the headline's cell: same fund at other houses, same house with other funds", () => {
    const h = view.headline!;
    const w = view.worth!;
    const sameFund = Object.values(h.fund.byHouse).flatMap((x) => ("value" in x && !x.open && x.providerId !== h.providerId ? [x.valueN] : []));
    expect(w.houseCount).toBe(sameFund.length);
    expect(w.house!.value as number).toBeCloseTo(h.valueN - Math.min(...sameFund), 6);
    const sameHouse = view.options.filter((o) => o.id !== "abroad").flatMap((o) => o.funds).flatMap((f) => { const x = f.byHouse[h.providerId]; return f.rec.id !== h.fund.rec.id && x && "value" in x && !x.open ? [x.valueN] : []; });
    expect(w.fundCount).toBe(sameHouse.length);
    expect(w.fund!.value as number).toBeCloseTo(h.valueN - Math.min(...sameHouse), 6);
  });

  it("opens on an unhedged fund (founder, 2026-10-28); hedged funds stay in the list, priced and pickable", () => {
    const world = indexById(bundle, "index-msci-world")!;
    const v = buildInvest({ bundle, index: world, plan: plan() });
    const funds = v.options.flatMap((o) => o.funds);
    const hedged = funds.filter((f) => f.rec.hedged === true && f.best);
    expect(hedged.length).toBeGreaterThan(0);
    // F-92: a hedged fund's shortfall beyond its fees is counted, so none leaves more than the headline on a steady dollar;
    // the one with no full year in its report is listed with its reason, not priced
    expect(Math.max(...hedged.map((f) => f.best!.valueN))).toBeLessThan(v.headline!.valueN);
    expect(funds.find((f) => f.rec.id === "5140165")!.reason).toEqual({ code: "no-hedge-record" });
    expect(v.headline!.fund.rec.hedged).not.toBe(true);
    const unhedged = funds.filter((f) => f.rec.hedged !== true && f.best && !f.best.open);
    expect(v.headline!.valueN).toBe(Math.max(...unhedged.map((f) => f.best!.valueN)));
  });

  it("a hedged fund whose years F-92 (d) does not compare falls back to the hedged rule: listed with its reason, never priced at A-07 = 0 (finance review F3)", () => {
    const world = indexById(bundle, "index-msci-world")!;
    const id = "5139696";
    const reasonOf = (b: typeof bundle) => buildInvest({ bundle: b, index: world, plan: plan() }).options.flatMap((o) => o.funds).find((f) => f.rec.id === id)!;
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
    const at = (fx: number, id: string) => {
      const v = buildInvest({ bundle, index: sp500, plan: plan(), assumptions: { fxChange: fx } });
      return v.options.flatMap((o) => o.funds).find((f) => f.rec.id === id)!.best!.valueN;
    };
    expect(at(-3, "5127527")).toBeCloseTo(at(3, "5127527"), 6);
    expect(at(3, "5139282")).toBeGreaterThan(at(-3, "5139282"));
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

  it("each way keeps what the account charges, by its tariff lines", () => {
    const at = w.fund.byHouse[w.providerId] as { accountCost: number; lines: { cost: number }[]; interaction: number };
    expect(at.lines.length).toBeGreaterThan(0);
    expect(at.lines.reduce((a, l) => a + l.cost, 0) + at.interaction).toBeCloseTo(at.accountCost, 6);
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
  const counted = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: { own: null } }) });
  const ownLeumi = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: { own: "leumi" } }) });
  const best = (v: typeof before, id: string) => v.houses.find((h) => h.provider.id === id)!.best!.price!;
  const banks = bundle.snapshots.filter((s) => s.current_account && (s.current_account.monthly_minimum.value as number) > 0).map((s) => s.id);

  it("with no bank marked, every bank whose price list charges for a current account has it as a line of its own, and leaves less", () => {
    expect(banks.sort()).toEqual(["discount", "fibi", "hapoalim", "jerusalem", "leumi", "massad", "mercantile", "mizrahi-tefahot", "yahav"]);
    for (const id of banks) {
      const at = best(counted, id);
      expect(at.lines.map((l) => l.line)).toContain("account");
      // 240 monthly minimums of 4 to 9.50 shekels: more than a thousand shekels of today's money left behind, and less than three thousand
      expect(best(before, id).valueN - at.valueN).toBeGreaterThan(900);
      expect(best(before, id).valueN - at.valueN).toBeLessThan(3_000);
    }
  });

  it("lists the bank's monthly minimum among the figure's inputs, with its price list as the source, wherever the row counts it (lens review S5)", () => {
    const minimumOf = (v: typeof before, id: string) => (best(v, id).cost("x").computed_from!.inputs as Record<string, { value: unknown; source: { url: string }; state: string }>)["דמי ניהול חשבון עו״ש בחודש"];
    for (const id of banks) {
      const rec = bundle.snapshots.find((s) => s.id === id)!.current_account!.monthly_minimum;
      const m = minimumOf(counted, id)!;
      expect(m.value).toBe(rec.value);
      expect(m.source.url).toBe(rec.source.url);
      expect(m.state).toBe("sourced");
      expect((best(counted, id).value.computed_from!.inputs as Record<string, unknown>)["דמי ניהול חשבון עו״ש בחודש"]).toBeDefined();
    }
    // not where nothing is counted: before the page counts it, at the bank marked as the person's own, at an investment house
    expect(minimumOf(before, "leumi")).toBeUndefined();
    expect(minimumOf(ownLeumi, "leumi")).toBeUndefined();
    expect(minimumOf(counted, "psagot")).toBeUndefined();
    // the bank's own figure on its own row weakens nothing (D31)
    expect(best(counted, "leumi").value.weakest).toBe(best(before, "leumi").value.weakest);
    // the pair's breakdown: its cost lines list the minimum, what was paid in (the plan alone) does not
    const fundId = counted.houses.find((h) => h.provider.id === "leumi")!.best!.fund.rec.id;
    const pc = pairCosts({ bundle, index: sp, plan: plan({ currentAccounts: { own: null } }), fundId, providerId: "leumi" })!;
    expect((pc.account[0]!.cost.computed_from!.inputs as Record<string, unknown>)["דמי ניהול חשבון עו״ש בחודש"]).toBeDefined();
    expect((pc.paidIn.computed_from!.inputs as Record<string, unknown>)["דמי ניהול חשבון עו״ש בחודש"]).toBeUndefined();
  });

  it("an investment house, a foreign broker and a bank that charges nothing keep their figures", () => {
    for (const id of ["psagot", "ibi", "altshuler-trade", "meitav-trade", "excellence", "interactive-brokers", "interactive-israel", "one-zero", "pepper"]) {
      const h = before.houses.find((x) => x.provider.id === id);
      if (!h?.best?.price) continue;
      expect(best(counted, id).valueN).toBe(h.best.price.valueN);
    }
  });

  it("the bank the person marks leaves it out, and only that bank", () => {
    expect(best(ownLeumi, "leumi").valueN).toBe(best(before, "leumi").valueN);
    expect(best(ownLeumi, "leumi").lines.map((l) => l.line)).not.toContain("account");
    expect(best(ownLeumi, "hapoalim").valueN).toBe(best(counted, "hapoalim").valueN);
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
    const view = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: { own: null } }) });
    const ways = view.options.flatMap((o) => o.funds).map((f) => f.byHouse.leumi).filter((x): x is Extract<typeof x, { valueN: number }> => !!x && "valueN" in x);
    expect(ways.length).toBeGreaterThan(0);
    for (const w of ways) {
      expect(w.cost("עלות").flags).toContain("BANK-35");
      expect(w.value.flags ?? []).not.toContain("BANK-35");
    }
    // the bank the person marks as their own counts no current account, and its cost has no such note
    const own = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: { own: "leumi" } }) });
    const mine = own.options.flatMap((o) => o.funds).map((f) => f.byHouse.leumi).filter((x): x is Extract<typeof x, { valueN: number }> => !!x && "valueN" in x);
    for (const w of mine) expect(w.cost("עלות").flags ?? []).not.toContain("BANK-35");
  });
});

describe("what each figure's sheet lists", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan({ currentAccounts: { own: null } }) });
  const inputs = (v: SiteValue) => v.computed_from!.inputs as Record<string, SiteValue>;
  const abroad = view.options.find((o) => o.id === "abroad")!;
  const irish = abroad.funds.find((f) => f.rec.id === "ie0031442068")!;
  const israeli = view.options.find((o) => o.id === "il-etf")!.funds.find((f) => f.best)!;
  const dollar = words.pair.rateInput("USD");

  it("a run priced in dollars lists the dollar rate (F-84), and a fund that pays out its payout yield (A-10)", () => {
    expect(inputs(irish.best!.value)[dollar]!.computed_from!.formula).toBe("F-84");
    expect(inputs(irish.best!.value)[words.pair.fundInputs.payout]!.value).toBe(irish.rec.distribution!.yield.value);
    expect(inputs(irish.best!.cost("x"))[dollar]).toBeDefined();
    // the abroad option's generic fund is bought in dollars too; an Israeli fund reads no rate and pays nothing out
    expect(inputs(abroad.bestCell!.cost!)[dollar]).toBeDefined();
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
    const swapView = buildInvest({ bundle: { ...bundle, funds: [...bundle.funds, asSwap] }, index: sp, plan: plan({ currentAccounts: { own: null } }) });
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

  it("an account's cost is F-91, and a gap between two ways is the one figure less the other", () => {
    expect(irish.best!.cost("x").computed_from!.formula).toBe("F-91");
    const broker = view.bars.find((b) => b.id === "broker")!;
    expect(broker.spread!.computed_from!.formula).toBe("F-91");
    expect(broker.spread!.value).toBeCloseTo(broker.high! - broker.low!, 9);
    const fund = view.bars.find((b) => b.id === "fund")!;
    expect(fund.spread!.computed_from!.formula).toBe("F-65");
    expect(Object.values(inputs(fund.spread!)).map((v) => v.computed_from!.formula)).toEqual(["F-65", "F-65"]);
    for (const h of view.houses.filter((x) => x.gap)) expect(Object.keys(inputs(h.gap!))).toHaveLength(2);
  });

  it("a pair's parts: the fund's part reads no account, X neither the fund nor the account, and the account's cost adds up its parts", () => {
    const fundId = view.houses.find((h) => h.provider.id === "leumi")!.best!.fund.rec.id;
    const pc = pairCosts({ bundle, index: sp, plan: plan({ currentAccounts: { own: null } }), fundId, providerId: "leumi" })!;
    expect(inputs(pc.fund)[words.pair.accountMinimum]).toBeUndefined();
    expect(inputs(pc.tax)[words.pair.accountMinimum]).toBeDefined();
    expect(inputs(pc.fund)[words.pair.fundInputs.fixed]).toBeDefined();
    expect(Object.keys(inputs(pc.baseValue)).sort()).toEqual(Object.values(words.planInputs).sort());
    expect(accountSum(pc, "x", t).value).toBeCloseTo(pc.accountCost, 6);
    expect(Object.keys(inputs(accountSum(pc, "x", t)))).toContain(words.pair.remainder);
  });
});

describe("Interactive Brokers abroad: its pricing plans and ways to convert", () => {
  // CSPX on the LSE, 2,000 a month for 10 years: Tiered (minimum USD 1.70) beats Fixed (USD 4), and a cash account's automatic conversion
  // (no commission, a markup the documents do not limit, D65) beats a spot order (at least USD 2), as Interactive Israel's plan conversion does
  const monthly = plan({ amountNow: 0, monthly: 2000, years: 10, values: { ...plan().values, amount: entered(0, "nis", t), monthly: entered(2000, "nis_per_month", t), years: entered(10, "years", t) } });
  const ibkr = bundle.snapshots.find((s) => s.id === "interactive-brokers")!;
  it("an account built on it starts from the reading the comparison prices it on", () => {
    expect(listReading(bundle, ibkr, "abroad", monthly)!.built.linesUsed).toEqual(expect.arrayContaining(["interactive-brokers-buy-sell-lse-usd-tiered", "interactive-brokers-fx-auto-conversion"]));
  });
  it("charges no conversion at Interactive Brokers, and costs less there than at Interactive Israel on a unit 2,000 a month buys", () => {
    const at = (fundId: string, providerId: string) => pairCosts({ bundle, index: sp, plan: monthly, fundId, providerId })!;
    expect(at("ie00b5bmr087", "interactive-brokers").account.map((l) => l.line)).not.toContain("fx");
    // F-109 (D94): VUAA's unit (USD 146) is bought every month in whole units at Interactive Brokers, and costs less there
    expect(at("ie00bfmxxd54", "interactive-brokers").accountCost).toBeLessThan(at("ie00bfmxxd54", "interactive-israel").accountCost);
    // CSPX's unit (USD 815) is more than 2,000 a month: at Interactive Brokers the money waits for a unit, earning nothing, while
    // Interactive Israel's recurring plan buys each month by amount, so there it costs less
    expect(at("ie00b5bmr087", "interactive-brokers").units).not.toBeNull();
    expect(at("ie00b5bmr087", "interactive-israel").accountCost).toBeLessThan(at("ie00b5bmr087", "interactive-brokers").accountCost);
  });
});

describe("a provider row whose run stopped on its rule", () => {
  it("carries the open question where there is one and the method gap where no reading exists, never the rule's id as a question", () => {
    expect(blockedReason(new BlockedError("TXG-09", "TXG OQ17"))).toEqual({ code: "rule-open", ruleId: "TXG-09", question: "TXG OQ17" });
    expect(blockedReason(new BlockedError("CS-03", undefined, "G-38"))).toEqual({ code: "rule-open", ruleId: "CS-03", gap: "G-38" });
    expect(blockedReason(new BlockedError("TXF-04"))).toEqual({ code: "rule-open", ruleId: "TXF-04" });
  });
});
