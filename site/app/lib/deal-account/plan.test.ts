// F-128 on the indices page: a securities-account deal read for the page's plan, and priced beside the houses. A deal filled from a house's
// whole price list leaves what the house's own row leaves on the same fund, so the popup's difference starts at nothing, except where
// F-128 states it does not, each exception proven by its cause: with the cause taken out of the house's record, the two leave the same
// (exceptions-fixtures.ts). Here on a few indices and two of the plans; plan.deals.deep.test.ts runs every index at every plan.
import { describe, expect, it } from "vitest";
import { accountSum, buildInvest, dealOnFunds, dealRunOf, indexById, pairCosts, type InvestView } from "../invest";
import { receiptAmounts } from "../receipt";
import { invest as words } from "../../copy";
import { entered, type SiteValue } from "../value";
import { hasCases, newDeal, pickKey, typed, type Fee, type FeeDeal } from "../fee-deal/model";
import { withLaterFillsAll } from "../fee-deal/templates";
import { feeOf, stepPick } from "../fee-deal/cases";
import { addBy } from "../fee-deal/edits/case";
import { dealProviderId, lineValueOf, snapshotOfDeal, withDeals } from "./bundle";
import { dealTiles, listPlace } from "./tiles";
import { stretchOf } from "../stretch";
import { feesOnPlan, missingKey, missingOf, planAccount, planDeal, planFees, planRead, planWhat, whatOfRun } from "./plan";
import { planCases, yearSpans } from "./plan-cases";
import { pickLine } from "../fee-deal/reading";
import { bundle, data, flagsOf, fromHouse, housesBeside, onHouse, onPlan, plan, PLANS, t } from "./plan-fixtures";

/**
 * The indices the fast run compares on: the Tel Aviv 125 (a fund on the Tel Aviv exchange and an open mutual fund, bought in shekels) and
 * the MSCI World (funds bought abroad, in the United States and in Europe, and the dollar's rate).
 */
const FEW = ["index-ta125", "index-msci-world"];
/** The plans of `PLANS` the fast run compares at: every custody maximum binding from the start, and as monthly deposits build it, at both of A-03's bounds. */
const FEW_PLANS = ["1,000,000 now, 20 years at 5%, the dollar up 3% a year", "40,000 a month, 10 years at 7%, the dollar down 3% a year"];
const run = { instrumentClass: "etf_units", listing: "tase" as const, currency: null, distributes: false, fx: {} };
const ctx = { kinds: data.kinds, today: t, currentAccounts: true };

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
    // the bank's current account its whole list fills is charged as the deal's own fee (F-102)
    expect(on.filter((x) => x.on === "charged").map((x) => kindOf(x.fee)).sort()).toEqual(["current_account", "custody", "trade"]);
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

describe("F-128 a deal filled from a house prices as the house does, on a few indices", () => {
  const s = housesBeside(FEW);
  const { houses, b, terms, views } = s;
  const view = views.get("index-ta125")!;

  it("fills a deal from every house's template", () => expect(houses.length).toBeGreaterThanOrEqual(17));

  it("takes a stated exception's cause out of the records of Interactive Israel (its recurring plan) and Interactive Brokers (the track the deal does not keep)", () => {
    expect([...terms.changed]).toEqual(expect.arrayContaining(["interactive-brokers", "interactive-israel"]));
  });

  it.each(houses)("%s: the same value left on every fund of these indices, to the shekel, on the deal's terms; as it is, less only where a stated exception's cause is", (id) => {
    const r = onHouse(s, id);
    expect(r.notCustom).toEqual([]);
    expect(r.compared).toBeGreaterThan(0);
    expect(r.unexplained).toEqual([]);
    expect(r.onTerms).toEqual([]);
  });

  const fewPlans = FEW_PLANS.map((name) => {
    const p = PLANS.find(([n]) => n === name);
    if (!p) throw new Error(`no plan named ${name}`);
    return p;
  });
  it.each(fewPlans)("an untouched deal leaves what its house's row leaves on every fund of these indices at %s on the deal's terms, as it is less only where a stated exception's cause is, and has a price exactly where its house's row has one", (_, p, fxChange) => {
    const r = onPlan(s, p, fxChange);
    expect(r.pricedApart).toEqual([]);
    expect(r.compared).toBeGreaterThan(0);
    expect(r.unexplained).toEqual([]);
    expect(r.onTerms).toEqual([]);
  });

  it("carries the open questions of the prices it reads on its value figure, as its house's row does (F-12: Interactive Israel's minimum in Europe, BRK OQ25)", () => {
    const funds = s.indices.flatMap((ix) => views.get(ix)!.options.flatMap((o) => o.funds));
    expect(funds.filter((f) => flagsOf(f, "interactive-israel")?.includes("BRK-OQ25")).length).toBeGreaterThan(0);
    for (const f of funds) expect([f.rec.id, flagsOf(f, dealProviderId("deal-interactive-israel"))]).toEqual([f.rec.id, flagsOf(f, "interactive-israel")]);
    // a fund bought in the United States reads no price of the European line
    const read = (listing: "us" | "europe") => planAccount(fromHouse("interactive-israel"), { instrumentClass: "foreign_securities", listing, currency: "USD", distributes: false, fx: {} }, ctx);
    expect(read("europe")).toMatchObject({ flags: ["BRK-OQ25"] });
    expect(read("us")).not.toHaveProperty("flags");
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

  it("the popup's place is the deal row's place in the account list: after every account that leaves more, ranked runs alone", () => {
    const funds = view.options.filter((o) => o.exists).flatMap((o) => o.funds);
    const tops = view.providers.flatMap((p) => { const st = stretchOf(funds, p.id); return st ? [st.best] : []; }).sort((a, z) => z - a);
    const fundId = funds[0]!.rec.id;
    const at = (valueN: number, open = false) => new Map([[fundId, { kind: "ok" as const, valueN, open, byFee: {}, accountCost: 0, reach: [], figure: () => { throw new Error("unused"); }, left: () => { throw new Error("unused"); } }]]);
    const pid = "deal:none";
    // just under the first: second, as the list puts its row, however close to the first
    expect(dealTiles(view, at(tops[0]! * 0.999), pid, "x", null, fundId, funds).place).toEqual({ k: 1 + tops.filter((v) => v > tops[0]! * 0.999).length, of: tops.length + 1 });
    expect(dealTiles(view, at(tops[0]! + 1), pid, "x", null, fundId, funds).place?.k).toBe(1);
    // a run on an open rule ranks nowhere, as the list's stretches leave it out
    expect(dealTiles(view, at(tops[0]! + 1, true), pid, "x", null, fundId, funds).place).toBeNull();
    // equal figures stand by name, as the list sorts them
    expect(listPlace([{ best: 10, name: "ב" }, { best: 12, name: "ג" }], { best: 10, name: "א" })).toBe(2);
    expect(listPlace([{ best: 10, name: "א" }, { best: 12, name: "ג" }], { best: 10, name: "ב" })).toBe(3);
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

  it("a current account whose price changes by a month's actions waits for the deal's pick of its step, then is read at it, never at the plan's orders (F-102)", () => {
    const leumi = fromHouse("leumi");
    const card = leumi.fees.find((f) => f.kind === "current_account");
    if (!card) throw new Error("Leumi's list fills a current account");
    // the list fills a flat sum each month, which needs no pick
    expect(feesOnPlan(leumi, run, ctx).find((x) => x.fee === card.id)?.on).toBe("charged");
    // up to two actions a month at the list's minimum, above two at 20 ₪: the plan places one order a month, which would read the first step
    const cased = addBy(card, { kind: "count", unit: "actions", top: 2 });
    if (!hasCases(cased)) throw new Error("the card takes a step of a month's actions");
    const [low, high] = cased.cases;
    if (!low || !high) throw new Error("two steps");
    const dear: Fee = { ...cased, cases: [low, { ...high, stages: [{ price: { form: "sum" as const, amount: typed(20), every: 1 as const } }] }] };
    const blank: Fee = { ...cased, cases: [low, { ...high, stages: [{ price: { form: "sum" as const, amount: { v: 0, blank: true as const }, every: 1 as const } }] }] };
    const [by] = cased.by;
    if (!by) throw new Error("the step's thing");
    const priced = (id: string, f: Fee, pick?: string): FeeDeal => ({ ...leumi, id, fees: leumi.fees.map((x) => (x === card ? f : x)) as FeeDeal["fees"], readFor: [...(leumi.readFor ?? []), ...(pick ? [{ by: pickKey(by), is: pick }] : [])] });
    const flat20 = priced("deal-flat-20", { ...card, stages: [{ price: { form: "sum", amount: { v: 20 }, every: 1 } }] } as Fee);
    const unpicked = priced("deal-unpicked", dear);
    const low2 = priced("deal-low", dear, stepPick(2));
    const high2 = priced("deal-high", dear, stepPick(2, true));
    const blankHigh = priced("deal-blank-high", blank, stepPick(2, true));
    // no pick: the deal waits for the step, as a deal missing a price does, and the bar shows no step chosen
    const miss = feesOnPlan(unpicked, run, ctx).find((x) => x.fee === card.id);
    expect(miss?.on === "missing" && miss.missing.why).toBe("step");
    const chosen = (d: FeeDeal) => pickLine(planRead(d, run, ctx))?.things.find((x) => x.by === pickKey(by))?.chosen;
    expect(chosen(unpicked)).toBe("");
    expect(chosen(low2)).toBe(stepPick(2));
    expect(chosen(high2)).toBe(stepPick(2, true));
    // a picked step with no price says the price is missing
    const gap = feesOnPlan(blankHigh, run, ctx).find((x) => x.fee === card.id);
    expect(gap?.on === "missing" && gap.missing.why).toBe("price");
    const bs = withDeals(bundle, [leumi, flat20, unpicked, low2, high2, blankHigh], data.kinds);
    const ix = indexById(bs, "index-ta125");
    if (!ix) throw new Error("the Tel Aviv 125 is priced");
    const v = buildInvest({ bundle: bs, index: ix, plan });
    const entry = (id: string) => v.houses.find((r) => r.provider.id === dealProviderId(id))?.entries.find((e) => e.fund.option === "il-etf");
    const at = (id: string) => Math.round(entry(id)?.price?.valueN ?? NaN);
    // a pick: priced at that step, the list's minimum at up to two, 20 ₪ a month above
    expect(at("deal-low")).toBe(at(leumi.id));
    expect(at("deal-high")).toBe(at("deal-flat-20"));
    // no pick: not ranked, and its reason names the step it lacks
    for (const [id, why] of [["deal-unpicked", "step"], ["deal-blank-high", "price"]] as const) {
      const e = entry(id);
      expect(e?.price).toBeNull();
      expect(e?.reason?.code === "deal-unpriced" && e.reason.missing?.why).toBe(why);
    }
  });

  it("the deal's own current account is the one the plan counts: at its own price, not at all once taken away, never the bank's beside it", () => {
    const leumi = fromHouse("leumi");
    const card = leumi.fees.find((f) => f.kind === "current_account");
    if (!card || !leumi.template) throw new Error("Leumi's list fills a current account");
    const mine: FeeDeal = { ...leumi, id: "deal-mine", fees: leumi.fees.map((f) => (f === card ? { ...card, stages: [{ price: { form: "sum", amount: { v: 20 }, every: 1 } }] } : f)) as FeeDeal["fees"] };
    const none: FeeDeal = { ...leumi, id: "deal-none", fees: leumi.fees.filter((f) => f !== card) };
    // a deal saved before templates filled a current account, as the page opens its saved deals (`withLaterFillsAll`), and as stored
    const { laterFills: _l, ...template } = leumi.template;
    const stored: FeeDeal = { ...none, id: "deal-stored", template };
    const [opened] = withLaterFillsAll([stored], data);
    if (!opened) throw new Error("the page shows the saved deal");
    const bs = withDeals(bundle, [leumi, mine, none, stored, { ...opened, id: "deal-opened" }], data.kinds);
    const ix = indexById(bs, "index-ta125");
    if (!ix) throw new Error("the Tel Aviv 125 is priced");
    const etfOn = (v: InvestView, id: string) => {
      const e = v.houses.find((r) => r.provider.id === id)?.entries.find((x) => x.fund.option === "il-etf");
      if (!e?.price) throw new Error(`${id} prices an Israeli ETF`);
      return e;
    };
    const v = buildInvest({ bundle: bs, index: ix, plan: { ...plan, currentAccounts: true } });
    const at = (id: string) => Math.round(etfOn(v, id).price?.valueN ?? NaN);
    expect(at(dealProviderId("deal-leumi"))).toBe(at("leumi"));
    expect(at(dealProviderId("deal-mine"))).toBeLessThan(at(dealProviderId("deal-leumi")));
    // taken away, the plan counts none: the deal leaves what the bank's row leaves where the page counts no current account
    expect(at(dealProviderId("deal-none"))).toBeGreaterThan(at(dealProviderId("deal-leumi")));
    const { currentAccounts: _c, ...uncounted } = plan;
    expect(at(dealProviderId("deal-none"))).toBe(Math.round(etfOn(buildInvest({ bundle: bs, index: ix, plan: uncounted }), "leumi").price?.valueN ?? NaN));
    // the page opens a deal saved before with the card, so its account is counted, once
    expect(at(dealProviderId("deal-opened"))).toBe(at(dealProviderId("deal-leumi")));
    expect(at(dealProviderId("deal-stored"))).toBe(at(dealProviderId("deal-none")));
    // the receipt writes the card as one of the deal's own lines, and no other current account
    const fund = etfOn(buildInvest({ bundle: bs, index: ix, plan }), dealProviderId("deal-leumi")).fund.rec.id;
    const lines = pairCosts({ bundle: bs, index: ix, plan, fundId: fund, providerId: dealProviderId("deal-leumi") })?.dealLines ?? [];
    expect(lines.map((l) => l.fee)).toContain(card.id);
    expect(lines.every((l) => leumi.fees.some((f) => f.id === l.fee))).toBe(true);
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
    // a year with charges in both steps (year 5: months 51 and 54 in the first, 57 and 60 in the second) is said once, in the step its
    // first charge fell in, so the two never overlap
    n = 0;
    const crossing = planCases(read, custody.id, on, reachOf(read, on, custody.id, () => (n++ === 0 ? quarters(3, 54) : quarters(57, 120))));
    expect(steps.cases.map((c) => crossing.get(c.id)?.years)).toEqual([[{ from: 1, to: 5 }], [{ from: 6, to: 10 }]]);
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
    // what is left after the tax lists the income the tax reads (F-43); a fee before the tax it saves does not
    const withIncome = { ...plan, income: 300_000, values: { ...plan.values, income: entered(300_000, "nis", t) } };
    const ta125 = indexById(bs, "index-ta125");
    const taxed = fundId && ta125 ? dealOnFunds({ bundle: bs, index: ta125, plan: withIncome, fundIds: [fundId], providerId: dealProviderId(sized.id) }).get(fundId) : undefined;
    if (taxed?.kind !== "ok") throw new Error("the deal prices the fund");
    const inputsOf = (v: SiteValue) => (v.computed_from?.inputs ?? {}) as Record<string, SiteValue>;
    expect(inputsOf(taxed.left(1, "x"))[words.pair.incomeInput]?.value).toBe(300_000);
    expect(inputsOf(taxed.figure(1, "x"))[words.pair.incomeInput]).toBeUndefined();
    const cases = planCases(read, custody.id, on, got.reach);
    // the account grows past 50,000 within the plan: both steps are reached, the first in the early years and the second in the late ones
    const steps = sized.fees.find((f) => f.id === custody.id)!;
    if (!hasCases(steps)) throw new Error("custody has its steps");
    const [low, high] = steps.cases.map((c) => cases.get(c.id)?.years);
    expect(low?.[0]?.from).toBe(1);
    expect(high?.at(-1)?.to).toBe(plan.years);
  });
});
