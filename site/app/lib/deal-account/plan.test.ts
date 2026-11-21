// F-128 on the indices page: a securities-account deal read for the page's plan, and priced beside the houses. A deal filled from a house's
// whole price list leaves what the house's own row leaves on the same fund, so the popup's difference starts at nothing.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { accountSum, buildInvest, dealOnFunds, dealRunOf, indexById, pairCosts } from "../invest";
import { receiptAmounts } from "../receipt";
import { invest as words } from "../../copy";
import type { WorkbenchInputs } from "../providers";
import { fillDeal, templateOptions } from "../fee-deal/templates";
import { hasCases, newDeal, type FeeDeal } from "../fee-deal/model";
import { feeOf } from "../fee-deal/cases";
import { addBy } from "../fee-deal/edits/case";
import { dealProviderId, lineValueOf, snapshotOfDeal, withDeals } from "./bundle";
import { dealTiles } from "./tiles";
import { stretchOf } from "../stretch";
import { feesOnPlan, missingKey, missingOf, planDeal, planFees, planRead, planWhat, whatOfRun } from "./plan";
import { planCases, yearSpans } from "./plan-cases";

const data = feesData();
const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 10_000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  returnFromParameter: false, currentAccounts: { own: null },
};
const fromHouse = (id: string): FeeDeal => fillDeal({ ...newDeal("brokerage-account", id), id: `deal-${id}` }, `house:${id}`, data, t)!;
const run = { instrumentClass: "etf_units", listing: "tase" as const, currency: null, distributes: false, fx: {} };
const ctx = { kinds: data.kinds, today: t, currentAccounts: { own: null } };

describe("F-128 the plan sets what is bought and the channel", () => {
  it("reads what is bought from the fund, and the internet as the channel, over the deal's own picks", () => {
    const d = planDeal({ ...fromHouse("psagot"), readFor: [{ by: "what", is: "us" }, { by: "channel", is: "branch" }] }, run);
    expect(d.readFor).toEqual([{ by: "what", is: "tase", place: "israel", currency: "ILS" }, { by: "channel", is: "direct" }]);
    expect(whatOfRun({ instrumentClass: "mutual_fund_units", listing: undefined })).toBe("mutualFunds");
    expect(whatOfRun({ instrumentClass: "foreign_securities", listing: "europe" })).toBe("europe");
  });

  it("reads a fund bought in Europe in the currency it trades in: its conversion and a minimum in the trade's currency in dollars", () => {
    const deal = fromHouse("interactive-israel");
    const europe = { instrumentClass: "foreign_securities", listing: "europe" as const, currency: "USD", distributes: false, fx: {} };
    const read = planRead(deal, europe, ctx);
    expect(read.picks.find((p) => p.by === "currency")?.is ?? "USD").toBe("USD");
    const sums = read.fees.filter((f) => f.kind === "trade").flatMap((f) => f.stages.map((st) => ("currency" in st.price ? st.price.currency : undefined)));
    expect(sums).toContain("USD");
    expect(sums).not.toContain("EUR");
    expect(feesOnPlan(deal, europe, ctx).find((x) => deal.fees.find((f) => f.id === x.fee)?.kind === "trade")?.on).toBe("charged");
  });

  it("charges a fee in the person's own words on what is held or on the account, and names why one on an action is not", () => {
    const base = fromHouse("psagot");
    const own = (form: "sum" | "action") => ({ id: `own-${form}`, kind: "own" as const, name: "שלי", stages: [{ price: form === "sum" ? { form: "sum" as const, amount: { v: 10 }, every: 1 as const } : { form: "action" as const, rate: { v: 0.1 } } }] });
    const d = { ...base, fees: [...base.fees, own("sum"), own("action")] } as FeeDeal;
    const on = feesOnPlan(d, run, ctx);
    expect(on.find((x) => x.fee === "own-sum")?.on).toBe("charged");
    expect(on.find((x) => x.fee === "own-action")).toMatchObject({ on: "off", why: "own-words" });
  });

  it("names why each fee it never charges is not charged", () => {
    const deal = fromHouse("leumi");
    const on = feesOnPlan(deal, run, ctx);
    const kindOf = (id: string) => deal.fees.find((f) => f.id === id)!.kind;
    const off = Object.fromEntries(on.flatMap((x) => (x.on === "off" ? [[kindOf(x.fee), x.why]] : [])));
    expect(off).toMatchObject({ fx: "shekel-fund", transfer_out: "transfer-out" });
    expect(on.filter((x) => x.on === "charged").map((x) => kindOf(x.fee)).sort()).toEqual(["custody", "trade"]);
  });

  it("says what a fee lacks where the deal has no case for what the plan buys, by the line the house it was filled from reads", () => {
    const deal = fromHouse("leumi");
    const mutual = { ...run, instrumentClass: "mutual_fund_units", listing: undefined as never };
    const line = { ...ctx, lineValue: lineValueOf(bundle.snapshots.find((s) => s.id === "leumi")!) };
    // the bank files an open mutual fund under its line for securities in Tel Aviv (BRK-16): the deal reads that line's case
    const trade = deal.fees.find((f) => f.kind === "trade")!;
    expect(feesOnPlan(deal, mutual, line).find((x) => x.fee === trade.id)?.on).toBe("charged");
    // the same deal with no case for that line lacks one
    const value = line.lineValue("trade", mutual, whatOfRun(mutual));
    if (!hasCases(trade)) throw new Error("the bank's trade fee has cases");
    const t = trade.by.findIndex((b) => b.kind === "what");
    const without = { ...deal, fees: deal.fees.map((f) => (f === trade ? { ...trade, cases: trade.cases.filter((c) => { const v = c.when[t]; return !(v === "any" || (Array.isArray(v) && v.includes(value))); }) } : f)) };
    const miss = feesOnPlan(without, mutual, line).find((x) => x.on === "missing");
    expect(miss && miss.on === "missing" && miss.missing).toMatchObject({ why: "case", kind: "trade", fee: trade.id });
    expect(missingOf(missingKey({ why: "case", fee: deal.fees[0]!.id, kind: "trade" }))).toEqual({ why: "case", fee: deal.fees[0]!.id, kind: "trade" });
  });
});

describe("F-128 a deal filled from a house prices as the house does", () => {
  const houses = templateOptions("brokerage-account", data, t).filter((o) => o.source === "house").map((o) => o.id.slice("house:".length));
  const b = withDeals(bundle, houses.map(fromHouse), data.kinds);
  const indices = bundle.exposures.flatMap((e) => (indexById(b, e.id) ? [e.id] : []));
  const views = new Map(indices.map((ix) => [ix, buildInvest({ bundle: b, index: indexById(b, ix)!, plan })]));
  const view = views.get("index-ta125")!;
  /**
   * The known exception: a house whose row buys each month's purchase of a fund bought abroad on its recurring plan (F-12, F-13's standing
   * lines), which a deal cannot say a purchase is placed by, so the deal prices that purchase at the regular price.
   */
  const RECURRING_ABROAD = new Set(["interactive-israel", "interactive-brokers"]);

  it("fills a deal from every house's template", () => expect(houses.length).toBeGreaterThanOrEqual(17));

  it.each(houses)("%s: the same value left on every fund the house's row prices, to the shekel, on every index", (id) => {
    let compared = 0;
    for (const ix of indices) {
      const v = views.get(ix)!;
      const house = v.houses.find((r) => r.provider.id === id);
      const deal = v.houses.find((r) => r.provider.id === dealProviderId(`deal-${id}`))!;
      if (!house) continue;
      expect(deal.provider.custom).toBe(true);
      for (const e of house.entries) {
        const d = deal.entries.find((x) => x.fund.rec.id === e.fund.rec.id);
        compared++;
        if (RECURRING_ABROAD.has(id) && e.fund.option === "abroad" && (e.price || d?.price)) {
          // the known exception: both price the fund, and the deal's regular price leaves no more than the row's recurring plan
          expect(e.price && d?.price && d.price.valueN <= e.price.valueN + 0.5).toBeTruthy();
          continue;
        }
        expect([ix, e.fund.rec.id, d?.price ? Math.round(d.price.valueN) : null]).toEqual([ix, e.fund.rec.id, e.price ? Math.round(e.price.valueN) : null]);
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  /**
   * The second known exception: a house whose list prints more than one track for an exchange, whose row takes the one that leaves the most
   * on each plan (F-63: Interactive Brokers' Fixed and Tiered), where the deal keeps the person's pick of the track.
   */
  const TRACKS = new Set(["interactive-brokers"]);
  const planAt = (amount: number, monthly: number, years: number, ret: number): WorkbenchInputs => ({
    ...plan, amountNow: amount, monthly, years, grossReturn: ret / 100,
    values: { amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: plan.values.inflation },
  });
  /** Plans beside the page's own, and A-03 at both of P-02's bounds (±3% a year), so the order of the first sum and the track can't hide. */
  const plans: [string, WorkbenchInputs, number][] = [
    ["50,000 now, 20 years at 5%", planAt(50_000, 0, 20, 5), 0],
    ["2,000 a month, 5 years at 3%", planAt(0, 2_000, 5, 3), 0],
    ["100,000 now and 1,000 a month, 30 years at −2%", planAt(100_000, 1_000, 30, -2), 0],
    ["the page's plan, the dollar up 3% a year", plan, 3],
    ["1,000 now and 300 a month, 10 years at 7%, the dollar up 3% a year", planAt(1_000, 300, 10, 7), 3],
    ["the page's plan, the dollar down 3% a year", plan, -3],
  ];

  it.each(plans)("an untouched deal leaves what its house's row leaves at %s, the two exceptions marked, and has a price on every fund exactly where its house's row has one", (_, p, fxChange) => {
    let compared = 0;
    for (const ix of indices) {
      const v = buildInvest({ bundle: b, index: indexById(b, ix)!, plan: p, assumptions: { fxChange } });
      const funds = v.options.flatMap((o) => o.funds);
      for (const id of houses) {
        // the deal is an account at its house: on every fund of the index, after tax or before it (F-118), it has a price where the row has one
        const dealId = dealProviderId(`deal-${id}`);
        const priced = (f: (typeof funds)[number], at: string) => [!!f.byHouse[at] && "valueN" in f.byHouse[at]!, !!f.beforeTax?.byHouse[at]];
        for (const f of funds) expect([id, ix, f.rec.id, priced(f, dealId)]).toEqual([id, ix, f.rec.id, priced(f, id)]);
        const house = v.houses.find((r) => r.provider.id === id);
        const deal = v.houses.find((r) => r.provider.id === dealId)!;
        if (!house) continue;
        for (const e of house.entries) {
          const d = deal.entries.find((x) => x.fund.rec.id === e.fund.rec.id);
          compared++;
          const excepted = (RECURRING_ABROAD.has(id) && e.fund.option === "abroad") || (TRACKS.has(id) && e.fund.option !== "abroad");
          if (excepted && (e.price || d?.price)) {
            // both price the fund, and the deal leaves no more than the row; or a few shekels more, where the row's count of whole units starts
            // below what its cash buys (a conversion's minimum counted on waiting shekels the order needs not convert) and the deal buys the unit
            const fits = !!(e.price && d?.price && (d.price.valueN <= e.price.valueN + 0.5 || Math.abs(d.price.valueN - e.price.valueN) < 0.001 * e.price.valueN));
            expect([id, ix, e.fund.rec.id, fits]).toEqual([id, ix, e.fund.rec.id, true]);
            continue;
          }
          // to the agora, so a difference of a fraction of a shekel (the rate the amount now is converted at) shows
          expect([id, ix, e.fund.rec.id, d?.price ? Math.round(d.price.valueN * 100) : null]).toEqual([id, ix, e.fund.rec.id, e.price ? Math.round(e.price.valueN * 100) : null]);
        }
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  it("a deal row's receipt lines are its own fees, and its remainder what they leave of its fees", () => {
    const pid = dealProviderId("deal-psagot");
    const fund = view.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.price)!.fund.rec.id;
    const pc = pairCosts({ bundle: b, index: indexById(b, "index-ta125")!, plan, fundId: fund, providerId: pid })!;
    expect(pc.account).toEqual([]);
    const lines = pc.dealLines!.reduce((a, l) => a + (l.cost.value as number), 0);
    expect(lines).toBeGreaterThan(0);
    expect(lines + pc.interaction).toBeCloseTo(pc.accountFees, 6);
    // carried as a whole-units line is, the remainder is small beside the lines (F-91)
    expect(Math.abs(pc.interaction)).toBeLessThan(0.15 * lines);
    const sheet = accountSum(pc, "x", t);
    expect(sheet.value).toBeCloseTo(pc.accountFees, 6);
    expect(Object.keys((sheet.computed_from?.inputs ?? {}) as Record<string, unknown>)).toEqual(expect.arrayContaining([...pc.dealLines!.map((l) => l.name), words.pair.remainder]));
    const r = receiptAmounts(pc);
    expect(r.accountLines).toHaveLength(pc.dealLines!.length);
    expect(r.accountLines.reduce((a, n) => a + n, 0) + r.remainder).toBe(r.account);
  });

  it("a deal that names a bank and was filled from no house is a bank's account (F-14's member kind)", () => {
    expect(snapshotOfDeal({ ...newDeal("brokerage-account", "own"), provider: "bank" }, undefined, t).provider.class).toBe("bank");
    expect(snapshotOfDeal(newDeal("brokerage-account", "own"), undefined, t).provider.class).toBe("broker");
  });

  it("the popup's place shares the first place with every account within the tie threshold of the first (F-80)", () => {
    const funds = view.options.filter((o) => o.exists).flatMap((o) => o.funds);
    const tops = view.providers.flatMap((p) => { const st = stretchOf(funds, p.id); return st ? [st.best] : []; }).sort((a, z) => z - a);
    const fundId = funds[0]!.rec.id;
    const at = (valueN: number) => new Map([[fundId, { kind: "ok" as const, valueN, byFee: {}, accountCost: 0, reach: [], figure: () => { throw new Error("unused"); } }]]);
    const pid = "deal:none";
    // just under the first, inside a threshold of 1%: first, as the list counts it
    expect(dealTiles(view, at(tops[0]! * 0.999), pid, null, fundId, funds.filter((f) => f.rec.id === fundId).concat(funds), 0.01).place?.k).toBe(1);
    // the same value with no threshold: after every account above it
    expect(dealTiles(view, at(tops[0]! * 0.999), pid, null, fundId, funds, 0).place?.k).toBe(1 + tops.filter((v) => Math.round(v) > Math.round(tops[0]! * 0.999)).length);
  });

  it("a bank's open mutual fund is bought on its line for securities on the Tel Aviv exchange, as its row buys it (BRK-16)", () => {
    const deal = view.houses.find((r) => r.provider.id === dealProviderId("deal-leumi"))!;
    const mutual = deal.entries.find((e) => e.fund.option === "il-tracking");
    expect(mutual?.price).not.toBeNull();
    expect(planWhat({ instrumentClass: "mutual_fund_units", listing: undefined }, lineValueOf(bundle.snapshots.find((s) => s.id === "leumi")!)).what).toBe("tase");
  });

  it("prices a fee that changes by what the plan's months set, read across their steps (a month's orders, its trading, the balance)", () => {
    const deal = fromHouse("psagot");
    const trade = deal.fees.find((f) => f.kind === "trade")!;
    for (const n of [{ kind: "count", unit: "actions", top: 1 }, { kind: "volume", unit: "ILS", top: 1_000 }, { kind: "portfolioSize", unit: "ILS", top: 50_000 }] as const) {
      const d = { ...deal, id: `deal-steps-${n.kind}`, fees: deal.fees.map((f) => (f === trade ? addBy(f, n) : f)) };
      expect(feesOnPlan(d, run, ctx).find((x) => x.fee === trade.id)?.on).toBe("charged");
      const bs = withDeals(bundle, [d], data.kinds);
      const v = buildInvest({ bundle: bs, index: indexById(bs, "index-ta125")!, plan });
      const at = (pid: string) => v.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.fund.option === "il-etf")!.price!.valueN;
      // each step copies the same prices, so the deal leaves what the house's row leaves
      expect(Math.round(at(dealProviderId(d.id)))).toBe(Math.round(at("psagot")));
    }
  });

  it("the bank's current account is not counted on the bank the person marks as theirs", () => {
    const own = buildInvest({ bundle: b, index: indexById(b, "index-ta125")!, plan: { ...plan, currentAccounts: { own: "leumi" } } });
    const at = (v: typeof view, pid: string) => v.houses.find((r) => r.provider.id === pid)!.entries.find((e) => e.fund.option === "il-etf")!.price!.valueN;
    expect(at(own, dealProviderId("deal-leumi"))).toBeGreaterThan(at(view, dealProviderId("deal-leumi")));
    expect(Math.round(at(own, dealProviderId("deal-leumi")))).toBe(Math.round(at(own, "leumi")));
  });
});

describe("F-128 the cases the plan reads, marked in the popup", () => {
  const deal = fromHouse("psagot");
  const custody = deal.fees.find((f) => f.kind === "custody")!;
  const trade = deal.fees.find((f) => f.kind === "trade")!;
  const sized = { ...deal, id: "deal-sized", fees: deal.fees.map((f) => (f === custody ? addBy(f, { kind: "portfolioSize", unit: "ILS", top: 50_000 }) : f)) };
  const read = planRead(sized, run, ctx);
  const on = feesOnPlan(sized, run, ctx);
  /** The run's fee index of each read fee of `feeId`, in `planFees`' order, with the months the run reached it. */
  const reachOf = (r: typeof read, o: typeof on, feeId: string, months: (k: number) => number[]) => planFees(r, o).map((x, i) => (feeOf(x) === feeId ? months(i) : []));

  it("marks the case a fee is read in, plainly, where no step splits it", () => {
    const cases = planCases(read, trade.id, on, null);
    const readCase = read.fees.find((x) => feeOf(x) === trade.id)!.read?.case;
    expect(readCase && cases.get(readCase)).toEqual({ years: null });
    expect(cases.size).toBe(1);
  });

  it("gives each step of the account's size the years a charge of the run fell in it", () => {
    const steps = sized.fees.find((f) => f.id === custody.id)!;
    if (!hasCases(steps)) throw new Error("custody has its steps");
    // the first step's charges in months 3 to 60 (years 1 to 5), the second's from 63 to 120 (years 6 to 10)
    const quarters = (from: number, to: number) => Array.from({ length: (to - from) / 3 + 1 }, (_, k) => from + 3 * k);
    let n = 0;
    const reach = reachOf(read, on, custody.id, () => (n++ === 0 ? quarters(3, 60) : quarters(63, 120)));
    const cases = planCases(read, custody.id, on, reach);
    expect(steps.cases.map((c) => cases.get(c.id)?.years)).toEqual([[{ from: 1, to: 5 }], [{ from: 6, to: 10 }]]);
    // a step no charge reached is not read on the plan
    n = 0;
    expect(planCases(read, custody.id, on, reachOf(read, on, custody.id, () => (n++ === 0 ? quarters(3, 120) : []))).get(steps.cases[1]!.id)).toBeUndefined();
    expect(yearSpans([1, 2, 3, 7, 8])).toEqual([{ from: 1, to: 3 }, { from: 7, to: 8 }]);
  });

  it("marks plainly a step of a month's orders, of its trading, or of an order's own size that the run reaches, and not one it does not", () => {
    for (const n of [{ kind: "count", unit: "actions", top: 1 }, { kind: "volume", unit: "ILS", top: 1_000 }, { kind: "actionSize", unit: "ILS", top: 1_000 }] as const) {
      const d = { ...deal, id: `deal-${n.kind}`, fees: deal.fees.map((f) => (f === trade ? addBy(f, n) : f)) };
      const r = planRead(d, run, ctx);
      const o = feesOnPlan(d, run, ctx);
      const stepFees = planFees(r, o).filter((x) => feeOf(x) === trade.id);
      expect([n.kind, stepFees.length]).toEqual([n.kind, 2]);
      let k = 0;
      const cases = planCases(r, trade.id, o, reachOf(r, o, trade.id, () => (k++ === 0 ? [1, 2, 3] : [])));
      expect([n.kind, [...cases.values()]]).toEqual([n.kind, [{ years: null }]]);
    }
  });

  it("carries out of the deal's own run the months each step is reached, as the run measures them", () => {
    const bs = withDeals(bundle, [sized], data.kinds);
    const fundId = bundle.funds.find((f) => dealRunOf({ bundle: bs, index: indexById(bs, "index-ta125")!, plan, fundId: f.id })?.instrumentClass === "etf_units")?.id;
    const got = fundId ? dealOnFunds({ bundle: bs, index: indexById(bs, "index-ta125")!, plan, fundIds: [fundId], providerId: dealProviderId(sized.id) }).get(fundId) : undefined;
    expect(got?.kind).toBe("ok");
    if (got?.kind !== "ok") return;
    const cases = planCases(read, custody.id, on, got.reach);
    // the account grows past 50,000 within the plan: both steps are reached, the first in the early years and the second in the late ones
    const steps = sized.fees.find((f) => f.id === custody.id)!;
    if (!hasCases(steps)) throw new Error("custody has its steps");
    const [low, high] = steps.cases.map((c) => cases.get(c.id)?.years);
    expect(low?.[0]?.from).toBe(1);
    expect(high?.at(-1)?.to).toBe(plan.years);
  });
});
