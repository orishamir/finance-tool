// The provider workbench view on the collected data (flows 28, 29, 33): every snapshot once, the not-comparable rows
// with their reasons, A-28's re-ranking, the entered level and the cumulative series.
import { describe, expect, it } from "vitest";
import { buildProviderWorkbench, parseProviderQuery, providerQueryString, staleTariff, type FundAssumptions, type ProviderQuery, type WorkbenchInputs } from "./providers";
import { buildWorkbenchBundle } from "./providers.server";
import { offerFromDraft, emptyDraft, validateDraft, toEnteredTariff, draftOf } from "./offers";
import { entered, computed } from "./value";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const v = (n: number, unit: "nis" | "pct_per_year" | "years" | "nis_per_month") => entered(n, unit, t);
const inputs: WorkbenchInputs = {
  amountNow: 10_000,
  monthly: 500,
  years: 10,
  grossReturn: 0.05,
  inflation: 0.02,
  age: null,
  income: null,
  values: { amount: v(10_000, "nis"), monthly: v(500, "nis_per_month"), years: v(10, "years"), returnV: v(5, "pct_per_year"), inflation: v(2, "pct_per_year") },
  fromGoal: false,
  returnFromParameter: true,
};
const q = (over: Partial<ProviderQuery> = {}): ProviderQuery => ({ fund: null, orders: null, channel: null, level: "list", vs: null, ...over });
const run = (query: ProviderQuery, offers = {}, assumptions: FundAssumptions = {}) => buildProviderWorkbench({ bundle, wrapperId: "brokerage-account", query, inputs, offers, assumptions });

describe("provider workbench view", () => {
  it("accounts for every bank and broker snapshot exactly once", () => {
    const r = run(q());
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    const providers = bundle.snapshots.filter((s) => s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker");
    expect(r.view.rows.map((x) => x.id).sort()).toEqual(providers.map((s) => s.id).sort());
    expect(r.view.coverage.considered).toBe(providers.length);
    expect(r.view.coverage.ranked.length + r.view.coverage.notComparable.length).toBe(providers.length);
    expect(r.view.coverage.invariantOk).toBe(true);
    expect(r.view.subject.recordId).toBe(bundle.p05.instruments!["brokerage-account"]!.fund);
    expect(r.view.subject.fromP05).toBe(true);
  });

  it("lists a missing tariff as not comparable with the recorded reason, never dropping the provider", () => {
    const r = run(q());
    if (r.kind !== "ok") throw new Error("not ok");
    const missing = r.view.rows.filter((x) => x.reason?.code === "data-missing");
    const files = bundle.snapshots.filter((s) => (s.provider.class === "bank" || s.provider.class === "broker" || s.provider.class === "foreign_broker") && s.missing);
    expect(missing.map((x) => x.id).sort()).toEqual(files.map((s) => s.id).sort());
    for (const m of missing) expect(m.reason).toMatchObject({ code: "data-missing" });
  });

  it("ranks cheapest first, shares rank 1 inside theta, and names the deciding fee type pairwise", () => {
    const r = run(q());
    if (r.kind !== "ok") throw new Error("not ok");
    const ranked = r.view.rows.filter((x) => x.kind === "ranked");
    const costs = ranked.map((x) => x.horizonCost!.value as number);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
    expect(ranked[0]!.rank).toBe(1);
    expect(ranked[0]!.deciding).toBeUndefined();
    const below = ranked.find((x, i) => i > 0 && x.rank !== 1);
    expect(below?.deciding?.against).toBeDefined();
    for (const x of ranked) expect(x.horizonCost!.state).toBe("computed");
  });

  it("re-ranks when the trades a month go from one to ten (A-28)", () => {
    // an Israeli ETF (2026-10-25): since a tariff with no line for tracking funds gives no price, the P-05 tracking fund ranks too few providers to re-rank
    const one = run(q({ fund: "1148162" }));
    const ten = run(q({ fund: "1148162", orders: 10 }));
    if (one.kind !== "ok" || ten.kind !== "ok") throw new Error("not ok");
    const order = (x: typeof one) => x.view.rows.filter((r) => r.kind === "ranked").map((r) => r.id);
    expect(order(one)).not.toEqual(order(ten));
    expect(ten.view.behaviour.orders.state).toBe("entered");
    expect(one.view.behaviour.orders.state).toBe("sourced");
  });

  it("gives no price, not a free trade, to a tariff with no buy/sell line for the fund's class (F-63, MF-26)", () => {
    const r = run(q());
    if (r.kind !== "ok") throw new Error("not ok");
    const oneZero = r.view.rows.find((x) => x.id === "one-zero")!;
    expect(oneZero.kind).toBe("not-comparable");
    expect(oneZero.reason).toMatchObject({ code: "no-applicable-line" });
    for (const row of r.view.rows.filter((x) => x.kind === "ranked")) expect(row.noLine ?? []).not.toContain("trade");
  });

  it("shows the lines the engine cannot choose between as not comparable, naming them", () => {
    const r = run(q());
    if (r.kind !== "ok") throw new Error("not ok");
    for (const row of r.view.rows.filter((x) => x.reason?.code === "ambiguous")) {
      expect(row.reason).toMatchObject({ code: "ambiguous" });
      if (row.reason?.code === "ambiguous") expect(row.reason.lines.length).toBeGreaterThan(1);
    }
  });

  it("returns the cumulative provider fees per month, ending at the run's four fee totals", () => {
    const r = run(q());
    if (r.kind !== "ok") throw new Error("not ok");
    expect(r.view.chart.filter((c) => c.role !== null).length).toBeGreaterThanOrEqual(3);
    expect(r.view.chart.length).toBe(r.view.rows.filter((x) => x.kind === "ranked").length);
    for (const line of r.view.chart) {
      expect(line.real.length).toBe(121);
      expect(line.real[0]).toBe(0);
      for (let i = 1; i < line.real.length; i++) expect(line.nominal[i]!).toBeGreaterThanOrEqual(line.nominal[i - 1]! - 1e-9);
    }
  });

  it("runs a provider on the person's offer at the entered level and labels it entered; the others stay at the list", () => {
    const base = run(q());
    if (base.kind !== "ok") throw new Error("not ok");
    const target = base.view.rows.find((x) => x.kind === "ranked" && x.rank !== 1)!;
    const draft = { ...emptyDraft(), tradeRate: 0.01, tradeMin: 1, offeredBy: "בנק" };
    expect(validateDraft(draft, t)).toEqual({});
    const offer = offerFromDraft(target.id, draft, t);
    expect(offer.lines.trade!.rate.state).toBe("entered");
    expect(toEnteredTariff(offer).buy).toEqual({ rate: 0.0001, min: 1 });
    expect(draftOf(offer, 12).tradeRate).toBe(0.01);
    const r = run(q({ level: "entered" }), { [target.id]: offer });
    if (r.kind !== "ok") throw new Error("not ok");
    const row = r.view.rows.find((x) => x.id === target.id)!;
    expect(row.offer?.lines[0]?.base).toBe("trade");
    expect(row.horizonCost!.value as number).toBeLessThan(target.horizonCost!.value as number);
    expect(r.view.offerCount).toBe(1);
    // at the list level an offer is not used
    const list = run(q({ level: "list" }), { [target.id]: offer });
    if (list.kind !== "ok") throw new Error("not ok");
    expect(list.view.rows.find((x) => x.id === target.id)!.offer).toBeUndefined();
  });

  it("falls back to the list when the average level is asked for and no average is collected", () => {
    const r = run(q({ level: "average" }));
    if (r.kind !== "ok") throw new Error("not ok");
    expect(r.view.averagesAvailable).toBe(false);
    expect(r.view.level).toBe("list");
  });

  it("flags a tariff snapshot older than 90 days", () => {
    expect(staleTariff("2026-07-01", "2026-10-24")).toBe(true);
    expect(staleTariff("2026-10-23", "2026-10-24")).toBe(false);
    expect(staleTariff("2026-07-26", "2026-10-24")).toBe(false);
  });

  it("round-trips the address", () => {
    const query = q({ fund: "1148162", orders: 10, channel: "branch", level: "entered", vs: "leumi" });
    expect(parseProviderQuery(providerQueryString(query))).toEqual(query);
    expect(parseProviderQuery("?orders=99&channel=x&level=zzz")).toEqual(q());
  });

  it("asks for a fund when none exists", () => {
    const r = run(q({ fund: "no-such-fund" }));
    expect(r).toMatchObject({ kind: "error", code: "no-fund" });
  });
});
void computed;

describe("provident listing: one card per company, linked by the regulator's company id (A35)", () => {
  it("carries the company id the company page is addressed by, never the snapshot slug", async () => {
    const { buildProvidentListing, companyHref } = await import("./providers");
    const { loadCma } = await import("./data.server");
    const ids = new Set(loadCma().companies.map((c) => c.id));
    const listing = buildProvidentListing(bundle, "kupat-gemel-lehashkaa");
    expect(listing.cards.length).toBeGreaterThan(0);
    expect(new Set(listing.cards.map((c) => c.provider)).size).toBe(listing.cards.length);
    for (const c of listing.cards) {
      expect(c.lines.length).toBeGreaterThan(0);
      if (c.companyId) {
        expect(ids.has(c.companyId)).toBe(true);
        expect(companyHref(c)).toBe(`/companies/${c.companyId}`);
      }
    }
    const meitav = listing.cards.find((c) => c.provider === "meitav");
    expect(meitav?.companyId).toBe("512065202");
    expect(listing.companies).toBeGreaterThan(listing.cards.length);
  });
});
