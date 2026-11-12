// The fee page's views of a deal (method §10.6) on the site's own data: the kinds and their caps, the templates, and the two picture deals
// read on 11.2026: a securities account and a provident fund, at a glance, in the builder, in one fee's panel and in the reading.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import type { SiteValue } from "../value";
import { builder, panel } from "./builder";
import { glance } from "./glance";
import { capLine, standingOf } from "./kinds";
import { decodeDeal, encodeDeal } from "./link";
import { newDeal, readDeal, typed, type FeeDeal } from "./model";
import { readingOf } from "./reading";
import { dealFromTrack, fillDeal, templateOptions } from "./templates";

const data = feesData();
const kinds = data.kinds;
const TODAY = "2026-11-12";

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  held: { place: "abroad", currency: "USD", payout: "accumulating" },
  fees: [
    { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
    { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] },
    { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
    { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.07), per: 12, every: 12 } }] },
  ],
});

const provident = (): FeeDeal => ({
  id: "deal-p",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [
    { id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.6), per: 12, every: 12 }, until: "2028-03" }, { price: { form: "held", rate: typed(1.05), per: 12, every: 12 } }] },
    { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
  ],
});

const v = (x: SiteValue | null | undefined) => x?.value as number;

describe("the kinds a deal can be", () => {
  it("lists every product record with fee bases, its caps with whom they bind", () => {
    const ids = kinds.map((k) => k.id);
    expect(ids).toEqual(expect.arrayContaining(["brokerage-account", "kupat-gemel-lehashkaa", "makam", "money-market-fund-daily"]));
    expect(ids).not.toContain("bank-deposit-x");
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    expect(capLine(mm, "custody")).toMatchObject({ state: "value", binds: "banks_and_fund_distributors" });
    expect(capLine(mm, "fund_management")).toEqual({ state: "absent" });
  });
  it("judges the ban on custody of money-market units only where the deal names a bank (F-113)", () => {
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    const p = { form: "held", rate: typed(0.1), per: 12, every: 12 } as const;
    expect(standingOf(mm, "custody", p, undefined)).toEqual({ judged: false, why: "binds" });
    expect(standingOf(mm, "custody", p, "non-bank")).toEqual({ judged: false, why: "binds" });
    expect(standingOf(mm, "custody", p, "bank")).toMatchObject({ judged: true, standing: "above" });
  });
});

describe("templates", () => {
  it("reads every house's latest price list into fees for a fund bought in Israel, each figure sourced", () => {
    expect(data.houses.length).toBeGreaterThan(3);
    for (const h of data.houses) {
      const israel = h.holdings.israel;
      if (!israel) continue;
      const trade = israel.fees.find((f) => f.kind === "trade");
      if (!trade) continue;
      const p = trade.stages[0]!.price;
      if (p.form === "action") expect(p.rate.src, h.id).toBeDefined();
      expect(israel.fees.some((f) => f.kind === "fx"), h.id).toBe(false);
    }
  });
  it("fills deals that check out, from every house for every holding and from every track (a link and the device keep them)", () => {
    const helds = [
      { place: "israel", currency: "ILS", payout: "accumulating" },
      { place: "abroad", currency: "USD", payout: "distributing" },
      { place: "abroad", currency: "CHF", payout: "accumulating" },
    ] as const;
    for (const h of data.houses)
      for (const held of helds) {
        const d = fillDeal({ ...newDeal("brokerage-account"), held }, `house:${h.id}`, data, TODAY)!;
        expect(readDeal(JSON.parse(JSON.stringify(d))), `${h.id} ${held.currency}`).toEqual(d);
        expect(decodeDeal(encodeDeal(d))?.fees.length, `${h.id} ${held.currency}`).toBe(d.fees.length);
      }
    for (const t of data.tracks) {
      const d = dealFromTrack(t.id, data, TODAY);
      if (d) expect(readDeal(JSON.parse(JSON.stringify(d))), `track ${t.id}`).toEqual(d);
    }
  });
  it("fills a securities account from a house, keeping each fee's place and naming the house", () => {
    const h = data.houses.find((x) => x.holdings.abroad?.fees.some((f) => f.kind === "fx"))!;
    const filled = fillDeal(account(), `house:${h.id}`, data, TODAY)!;
    expect(filled.template).toEqual({ id: `house:${h.id}`, name: h.name });
    expect(filled.provider).toBe(h.provider);
    expect(filled.fees[0]!.id).toBe("fee-trade");
    expect(filled.fees.find((f) => f.kind === "fund_management")!.stages[0]!.price).toMatchObject({ rate: { v: 0.07 } });
  });
  it("offers the houses for a securities account and the kind's tracks for the provident family", () => {
    expect(templateOptions("brokerage-account", data).every((o) => o.source === "house")).toBe(true);
    const tracks = templateOptions("kupat-gemel-lehashkaa", data);
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.every((o) => o.source === "track")).toBe(true);
    expect(templateOptions("bank-deposit", data)).toEqual([]);
  });
  it("opens a new deal from a track, its yearly fee charged each month, both figures sourced", () => {
    const t = data.tracks.find((x) => x.wrapperId === "kupat-gemel-lehashkaa")!;
    const d = dealFromTrack(t.id, data, TODAY)!;
    expect(d.kind).toBe("kupat-gemel-lehashkaa");
    const balance = d.fees.find((f) => f.kind === "balance")!.stages[0]!.price;
    expect(balance).toMatchObject({ form: "held", per: 12, every: 1 });
    if (balance.form === "held") expect(balance.rate.src).toBeDefined();
    expect(d.template?.id).toBe(`track:${t.id}`);
  });
});

describe("the securities account of the picture, on 11.2026", () => {
  it("at a glance: the trade with its conversion at 0.45% and the minimum's mark at 6,000; the fund's 0.07%", () => {
    const g = glance(account(), kinds, TODAY);
    expect(g.from).toBe("2026-11");
    const [trade, held] = g.throughout;
    expect(trade!.on).toEqual({ on: "action", action: "trade" });
    expect(trade!.fees.map((f) => f.kind)).toEqual(["trade", "fx"]);
    expect(trade!.rates).toHaveLength(1);
    expect(v(trade!.rates[0]!.rate)).toBeCloseTo(0.45, 10);
    expect(trade!.rates[0]!.rate).toMatchObject({ state: "computed", computed_from: { formula: "F-111" } });
    expect(trade!.marks).toHaveLength(1);
    expect(trade!.marks[0]).toMatchObject({ kind: "min", on: "action", currency: "ILS" });
    expect(v(trade!.marks[0]!.amount)).toBeCloseTo(6000, 6);
    expect(held!.on).toEqual({ on: "held" });
    expect(v(held!.rates[0]!.rate)).toBe(0.07);
    expect(held!.rates[0]!.rate.state).toBe("entered");
    expect(g.changing.map((x) => x.on.on)).toEqual(["held", "account"]);
  });
  it("at a glance: the monthly sum starts in 03.2027, four months on; custody starts in 03.2028 and what is held costs 0.47% a year", () => {
    const g = glance(account(), kinds, TODAY);
    expect(g.dates.map((d) => d.at)).toEqual(["2027-03", "2028-03"]);
    const [first, second] = g.dates;
    expect(v(first!.months)).toBe(4);
    expect(first!.months).toMatchObject({ state: "computed", computed_from: { formula: "F-110" } });
    expect(first!.changes).toMatchObject([{ kind: "fixed_period", change: "starts" }]);
    expect(second!.months).toBeNull();
    expect(second!.changes).toMatchObject([{ kind: "custody", change: "starts" }]);
    expect(second!.groups).toHaveLength(1);
    expect(v(second!.groups[0]!.rate)).toBeCloseTo(0.47, 10);
  });
  it("in the builder: a row per fee, the minimum said, custody's start, the fund's fee inside the fund, the suggestions", () => {
    const b = builder(account(), kinds, TODAY);
    expect(b.rows.map((r) => r.kind)).toEqual(["trade", "custody", "fixed_period", "fx", "fund_management"]);
    expect(b.rows[0]).toMatchObject({ bounds: { min: true, max: false }, saleSame: true });
    expect(b.rows[1]!.next).toEqual({ at: "2028-03", side: "all", change: "starts" });
    expect(b.rows[1]!.stages).toHaveLength(2);
    expect(b.rows[4]!.insideFund).toBe(true);
    expect(b.rows[3]!.saleSame).toBeNull();
    expect(b.suggestions.usual).toEqual(["transfer_out"]);
    expect(b.suggestions.rarer).toEqual(["distribution_handling", "fx_spread", "corporate_event", "current_account", "own"]);
    expect(b.held).toEqual({ place: "abroad", currency: "USD", payout: "accumulating" });
  });
  it("in the reading: three periods, the sums against custody meeting at 30,000 from 03.2028, and the two curves", () => {
    const r = readingOf(account(), kinds, TODAY, data.fx);
    expect(r.periods.map((p) => [p.from, p.to])).toEqual([["2026-11", "2027-03"], ["2027-03", "2028-03"], ["2028-03", null]]);
    expect(r.periods[0]).toMatchObject({ current: true, started: true });
    expect(v(r.periods[0]!.left)).toBe(4);
    expect(v(r.periods[1]!.length)).toBe(12);
    expect(r.periods[1]!.rows.find((x) => x.kind === "fixed_period")!.change).toBe("starts");
    const marks = r.statements.filter((s) => s.kind === "mark");
    const min = marks.find((s) => s.kind === "mark" && s.mark.kind === "min")!;
    expect(min.periods).toEqual(["2026-11", "2027-03", "2028-03"]);
    const meet = marks.find((s) => s.kind === "mark" && s.mark.kind === "meet")!;
    expect(meet.periods).toEqual(["2028-03"]);
    if (meet.kind === "mark" && meet.mark.kind === "meet") expect(v(meet.mark.amount)).toBeCloseTo(30000, 6);
    expect(r.statements.some((s) => s.kind === "no-max" && s.fee.kind === "trade")).toBe(true);

    const action = r.curves.find((c) => c.on === "action")!;
    expect(action).toMatchObject({ action: "trade", side: "all", periods: ["2026-11", "2027-03", "2028-03"] });
    expect(v(action.end)).toBe(20000);
    expect(action.end).toMatchObject({ computed_from: { formula: "F-112" } });
    expect(action.amounts).toEqual([0, expect.closeTo(6000, 6), 20000]);
    expect(action.total[2]).toBeCloseTo(20000 * 0.0045, 6);
    expect(action.series.map((s) => s.fee.kind)).toEqual(["trade", "fx"]);

    const held = r.curves.filter((c) => c.on === "held");
    expect(held).toHaveLength(1);
    expect(held[0]!.periods).toEqual(["2028-03"]);
    expect(v(held[0]!.end)).toBe(100000);
    expect(held[0]!.total[1]).toBeCloseTo(120 + 120 + 30000 * 0.0007, 6);

    expect(r.law.map((l) => l.kind)).toEqual(["trade", "custody", "fixed_period", "fx"]);
    expect(r.law.every((l) => l.cap.state === "none")).toBe(true);
  });
});

describe("the provident fund of the picture, on 11.2026", () => {
  it("at a glance: the deposit fee at a quarter of its cap; the fee on the savings at 57% of it, at it from 03.2028, sixteen months on", () => {
    const g = glance(provident(), kinds, TODAY);
    const deposit = g.throughout[0]!;
    expect(deposit.on).toEqual({ on: "action", action: "deposit" });
    expect(deposit.fees[0]!.standing.standing).toMatchObject({ judged: true, standing: "below" });
    expect(v(deposit.fees[0]!.standing.share)).toBeCloseTo(25, 10);
    const balance = g.changing[0]!.fees[0]!;
    expect(v(balance.standing.share)).toBeCloseTo((0.6 / 1.05) * 100, 10);
    expect(balance.standing.share).toMatchObject({ computed_from: { formula: "F-113" } });
    const [date] = g.dates;
    expect(date!.at).toBe("2028-03");
    expect(v(date!.months)).toBe(16);
    expect(date!.changes[0]).toMatchObject({ kind: "balance", change: "rises", standing: { standing: { judged: true, standing: "at" } } });
  });
  it("in the builder: the fee on the savings below the cap now and at it from 03.2028", () => {
    const row = builder(provident(), kinds, TODAY).rows[0]!;
    expect(row.standingNow.standing).toMatchObject({ standing: "below" });
    expect(row.standingLater).toMatchObject({ at: "2028-03", standing: { standing: { standing: "at" } } });
    expect(row.insideFund).toBe(false);
  });
  it("in its panel: two prices, the cap's line, the fields of a share of what is held", () => {
    const p = panel(provident(), "fee-balance", kinds, TODAY)!;
    expect(p.limited).toBe(true);
    expect(p.on).toEqual({ on: "held" });
    expect(p.cap).toMatchObject({ state: "value" });
    if (p.cap.state === "value") expect(p.cap.value.value).toBe(1.05);
    expect(p.stages[0]!.fields).toEqual(["rate", "per", "every"]);
    expect(p.sale.allowed).toBe(false);
    expect(panel(provident(), "nothing", kinds, TODAY)).toBeNull();
  });
  it("in the reading: the law rows read each price against its cap", () => {
    const r = readingOf(provident(), kinds, TODAY, data.fx);
    const balance = r.law.find((l) => l.kind === "balance")!;
    expect(balance.prices.map((x) => [x.from, x.to, x.standing.standing])).toEqual([
      ["2026-11", "2028-03", expect.objectContaining({ standing: "below" })],
      ["2028-03", null, expect.objectContaining({ standing: "at" })],
    ]);
    expect(r.law.find((l) => l.kind === "deposit")!.prices).toHaveLength(1);
    expect(r.curves).toEqual([]);
  });
});

describe("a deal the views cannot read whole", () => {
  it("leaves a fee whose prices are out of order out, and names it", () => {
    const d = account();
    d.fees[1]!.stages = [{ price: { form: "free" } }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }];
    expect(glance(d, kinds, TODAY).unread).toEqual(["fee-custody"]);
    expect(builder(d, kinds, TODAY).rows.map((r) => r.fee)).not.toContain("fee-custody");
    expect(panel(d, "fee-custody", kinds, TODAY)).toMatchObject({ inOrder: false });
  });
  it("draws no curve whose bound is in a currency it has no rate for, and says so", () => {
    const d = account();
    d.fees[0]!.stages[0]!.price = { form: "action", rate: typed(0.1), min: typed(7), currency: "USD" };
    const none = readingOf(d, kinds, TODAY, null);
    expect(none.curves.some((c) => c.on === "action")).toBe(false);
    expect(none.undrawn).toMatchObject([{ action: "trade", currency: "USD" }]);
    if (data.fx) {
      const r = readingOf(d, kinds, TODAY, data.fx);
      const c = r.curves.find((x) => x.on === "action")!;
      expect(c.rates).toHaveLength(1);
      expect(c.at[0]).toBeGreaterThan(7000);
    }
  });
});
