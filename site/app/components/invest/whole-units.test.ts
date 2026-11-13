// F-109 (D94) on the indices page: a fund bought in whole units where its record holds a unit price, by amount where the house's record
// says it sells the listing so, and one line on the row where a monthly deposit waits for a unit. The data's own unit prices and by-amount
// entries are set here, so the test holds whatever the records carry.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { buildInvest, indexById, pairCosts, type WayPrice } from "../../lib/invest";
import { fundDraftOf, fundFromDraft, withCustomEntries } from "../../lib/custom-entries";
import { ChosenPair } from "./chosen";
import { unitsLine } from "./pair";
import { bundle, plan, html, lists, shown } from "./render-fixtures";

type Funds = typeof bundle.funds;
type Snaps = typeof bundle.snapshots;
const price = (value: number, unit: "usd" | "nis" = "usd") => ({ value, unit, source: { url: "https://www.ishares.com/uk/individual/en/products/253743/", title: "NAV", publisher: "BlackRock", strength: "institution" }, checked: "2026-11-10", effective_from: "2026-11-09", effective_to: null, tax_year: null, update_rule: "provider-set", rule_ids: [], state: "sourced" }) as never;
const source = { url: "https://www.inter-il.com/recurring-transfer/", title: "השקעה קבועה", checked: "2026-11-10", quote: "גם אם מדובר בחלק ממניה או תעודת סל, לפי הסכום" };
/** The bundle with these funds' unit prices (or none) and these houses' by-amount entries (or none). */
function withUnits(prices: Record<string, number | null>, byAmount: Record<string, unknown[] | null>, inShekels: readonly string[] = []) {
  const funds = bundle.funds.map((f) => {
    if (!(f.id in prices)) return f;
    const { share_price: _, ...rest } = f;
    return prices[f.id] === null ? rest : { ...rest, share_price: price(prices[f.id]!, inShekels.includes(f.id) ? "nis" : "usd") };
  }) as Funds;
  const snapshots = bundle.snapshots.map((s) => {
    if (!(s.id in byAmount)) return s;
    const { by_amount: _, ...rest } = s;
    return byAmount[s.id] === null ? rest : { ...rest, by_amount: byAmount[s.id] };
  }) as Snaps;
  return { ...bundle, funds, snapshots };
}
const sp = indexById(bundle, "index-sp500")!;
const fundsOf = (b: typeof bundle) => buildInvest({ bundle: b, index: sp, plan }).options.flatMap((o) => o.funds);
const at = (b: typeof bundle, fund: string, house: string) => fundsOf(b).find((f) => f.rec.id === fund)!.byHouse[house] as WayPrice;
const allIds = (b: typeof bundle) => b.funds.filter((f) => f.share_price).map((f) => f.id);
const noPrices = (b: typeof bundle) => Object.fromEntries(allIds(b).map((id) => [id, null]));
const noEntries = Object.fromEntries(bundle.snapshots.filter((s) => s.by_amount).map((s) => [s.id, null]));

describe("whole units on the indices page (F-109, D94)", () => {
  const bare = withUnits(noPrices(bundle), noEntries);
  // an Israeli ETF on the index at a unit of 2,500 ₪ (a foreign fund's Tel Aviv line has no price while its tax is open, F-04)
  const etfId = fundsOf(bare).find((f) => f.option === "il-etf" && f.best)!.rec.id;
  const priced = withUnits({ ...noPrices(bundle), [etfId]: 2500, ie00b5bmr087: 814.9 }, noEntries, [etfId]);
  it("a fund with no unit price is priced by amount at every house, as before", () => {
    const w = fundsOf(bare).flatMap((f) => Object.values(f.byHouse)).filter((x) => "valueN" in x) as WayPrice[];
    expect(w.length).toBeGreaterThan(100);
    expect(w.every((x) => x.units === null)).toBe(true);
  });
  it("an ETF in Tel Aviv buys whole units at a bank: 400 ₪ a month waits most months for a unit of more than 2,000 ₪", () => {
    const w = at(priced, etfId, "leumi");
    expect(w.units).not.toBeNull();
    expect(w.units!.skipped * 2).toBeGreaterThan(w.units!.monthly);
    expect(unitsLine(w.units)).toBe(invest.pair.unitsEvery);
    // the figure moves: the waiting cash earns nothing, and an order placed every few months pays the bank's minimum commission once
    // where 400 ₪ orders paid it every month, so here more is left than by amount
    expect(w.valueN).toBeGreaterThan(at(bare, etfId, "leumi").valueN);
  });
  it("a house whose record says it sells the listing by amount buys as before; a list it does not publish changes nothing", () => {
    const byAll = withUnits({ ...noPrices(bundle), ie00b5bmr087: 814.9 }, { ...noEntries, "interactive-brokers": [{ venue: "europe", orders: "all", list_only: false, source }], excellence: [{ venue: "europe", orders: "all", list_only: true, source }] });
    expect(at(byAll, "ie00b5bmr087", "interactive-brokers").units).toBeNull();
    expect(at(byAll, "ie00b5bmr087", "interactive-brokers").valueN).toBeCloseTo(at(bare, "ie00b5bmr087", "interactive-brokers").valueN, 6);
    const ex = at(byAll, "ie00b5bmr087", "excellence");
    if ("valueN" in ex) expect(ex.units).not.toBeNull();
  });
  it("a recurring plan buys the monthly purchases by amount and the amount now in whole units", () => {
    const plan = withUnits({ ...noPrices(bundle), ie00b5bmr087: 814.9 }, { ...noEntries, "interactive-israel": [{ venue: "europe", orders: "recurring_plan", list_only: false, source }] });
    const w = at(plan, "ie00b5bmr087", "interactive-israel");
    expect(w.units?.monthly).toBe(240);
    expect(w.units?.skipped).toBe(0);
    expect(unitsLine(w.units)).toBeNull();
  });
  it("the chosen pair's account tile says so in one line, and a fund with no unit price is marked on its row", () => {
    const view = buildInvest({ bundle: priced, index: sp, plan });
    const accounts = shown(html(createElement(ChosenPair, { view, bundle: priced, plan, pick: { house: "leumi", fund: etfId }, chosen: true })));
    expect(accounts).toContain(invest.pair.unitsEvery);
    const etf = view.options.find((o) => o.id === "il-etf")!.funds.find((f) => !f.reason && f.rec.id !== etfId)!;
    expect(etf.noUnitPrice).toBe(true);
    const funds = shown(lists(view, priced, plan, { house: "leumi", fund: etf.rec.id }, { today: priced.today }));
    expect(funds).toContain(invest.pair.unitPriceMissing);
    // the cost bar's part that holds the waiting cash says so, at a house that buys in whole units
    const pc = pairCosts({ bundle: priced, index: sp, plan, fundId: etfId, providerId: "leumi" })!;
    expect(pc.units).not.toBeNull();
    expect(pc.remainder.about).toContain(invest.pair.remainderUnits);
    expect(pairCosts({ bundle: bare, index: sp, plan, fundId: etfId, providerId: "leumi" })!.units).toBeNull();
  });
  it("a fund the person typed has no unit price: an ETF or a fund abroad says so on its row; a tracking fund is bought by amount anyway", () => {
    const typed = (kind: Parameters<typeof fundDraftOf>[1]) =>
      fundFromDraft({ ...fundDraftOf(null, kind), payout: "accumulating" as const, hedged: false, name: kind, fixed: 0.1, variable: 0, trustee: 0 }, `custom-fund-${kind}`, "index-sp500", bundle.today);
    const b = withCustomEntries(bundle, [], [typed("abroad"), typed("il-etf"), typed("il-tracking")]);
    const all = buildInvest({ bundle: b, index: indexById(b, "index-sp500")!, plan }).options.flatMap((o) => o.funds);
    const of = (kind: string) => all.find((f) => f.rec.id === `custom-fund-${kind}`)!;
    expect(of("abroad").noUnitPrice).toBe(true);
    expect(of("il-etf").noUnitPrice).toBe(true);
    expect(of("il-tracking").noUnitPrice).toBe(false);
  });
});
