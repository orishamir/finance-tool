// F-109 (D94): a fund bought in whole units. Each order buys the most whole units its cash pays for with the order's fees; what is left
// waits in the account, earning nothing, and joins the next order; an order whose cash buys no unit is not placed and pays nothing. A house
// whose record says it sells the listing by amount buys as before. Expected figures worked by hand from the formula (comments), with no
// return, fund cost or inflation unless a test says otherwise.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { providerWorkbench, unitWaysAt, wholeUnitsAt, type WorkbenchInput } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const ten = { rate: 0, min: 10 };
const input = (over: Partial<SecuritiesInput> & { goal: SecuritiesInput["goal"] }): SecuritiesInput => ({
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "israeli-fund", drag: {} },
  tariff: { buy: ten },
  profile: {},
  ...over,
});

describe("whole units (F-109)", () => {
  it("carries what an order leaves to the next one: 1,000 ₪ now and 500 ₪ a month at 300 ₪ a unit and 10 ₪ an order", () => {
    // month 1: 1,000 buys 3 units (910), 90 waits; with the month's 500, 590 buys 1 (310), 280 waits; ... month 12 leaves 270.
    // 22 units (6,600), 13 orders (130), 270 waiting: 7,000 paid in.
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, wholeUnits: { price: 300 } }), ctx);
    expect(r.fees.trade).toBeCloseTo(130, 6);
    expect(r.nominal).toBeCloseTo(6_870, 6);
    expect(r.detail.cashLeft).toBeCloseTo(270, 6);
    expect(r.detail.monthlyOrders).toBe(12);
    expect(r.formulas).toContain("F-109");
  });
  it("a month whose cash buys no unit places no order and pays nothing: 500 ₪ a month at 1,200 ₪ a unit buys in months 3, 5, 8 and 10", () => {
    // 1,490 after the fee in month 3 buys one (1,210), 290 waits; 1,280 in month 5 (80 waits); 1,570 in month 8 (370); 1,360 in month 10
    // (160); months 11 and 12 leave 1,160 waiting at the end, part of what is left and no gain.
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 500, months: 12 }, wholeUnits: { price: 1_200 } }), ctx);
    expect(r.fees.trade).toBeCloseTo(40, 6);
    expect(r.detail.monthlyOrders).toBe(4);
    expect(r.detail.monthlySkipped).toBe(8);
    expect(r.detail.cashLeft).toBeCloseTo(1_160, 6);
    expect(r.nominal).toBeCloseTo(5_960, 6);
    expect(r.taxAtExit).toBe(0);
  });
  it("the waiting cash earns nothing: at 7% a year the run with whole units leaves less than the run by amount", () => {
    const base = { goal: { amountNow: 10_000, monthly: 500, months: 120 }, market: { grossReturn: 0.07, inflation: 0.02 } };
    const byAmount = runSecurities(input(base), ctx);
    const whole = runSecurities(input({ ...base, wholeUnits: { price: 2_600 } }), ctx);
    expect(whole.real).toBeLessThan(byAmount.real);
    // a unit of a few agorot buys almost all of every order: the two runs meet
    const tiny = runSecurities(input({ ...base, wholeUnits: { price: 0.001 } }), ctx);
    expect(Math.abs(tiny.real - byAmount.real)).toBeLessThan(1);
  });
  it("a house's recurring plan buys the monthly purchases by amount, and the amount now in whole units; what it leaves joins the first", () => {
    // 1,000 now buys no unit at 1,200 and waits; month 1 buys 1,490 by amount; every month by amount after: 12 orders, 6,880 bought
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, wholeUnits: { price: 1_200, monthlyByAmount: true } }), ctx);
    expect(r.fees.trade).toBeCloseTo(120, 6);
    expect(r.nominal).toBeCloseTo(6_880, 6);
    expect(r.detail.monthlySkipped).toBe(0);
  });
  it("by amount is unchanged when no unit price is given", () => {
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 } }), ctx);
    expect(r.fees.trade).toBeCloseTo(130, 6);
    expect(r.nominal).toBeCloseTo(6_870, 6);
    expect(r.detail.wholeUnits).toBeUndefined();
    expect(r.formulas).not.toContain("F-109");
  });
  it("converts only the shekels an order spends, and converts what waits only when it is spent", () => {
    // 1,000 ₪ now, 100 dollars a unit at 4 ₪ (400 ₪), 0.5% a conversion: by amount 995 would buy; 2 units cost 800 ₪ of dollars, the
    // shekels converted c = 800 / 0.995 = 804.02, so 195.98 ₪ waits unconverted. The sale converts 800 at 0.5%: 796 + 195.98 = 991.98.
    const foreign = (wholeUnits?: SecuritiesInput["wholeUnits"]) =>
      runSecurities(
        input({
          goal: { amountNow: 1_000, monthly: 0, months: 1 },
          fund: { kind: "foreign-fund", drag: {} },
          tariff: { buy: { rate: 0 }, fx: 0.005, currency: { code: "USD", startRate: 4 } },
          ...(wholeUnits ? { wholeUnits } : {}),
        }),
        ctx,
      );
    const whole = foreign({ price: 400 });
    expect(whole.fees.fx).toBeCloseTo(800 / 0.995 - 800 + 4, 6);
    expect(whole.nominal).toBeCloseTo(796 + 1_000 - 800 / 0.995, 6);
    // by amount: 5 ₪ to convert 1,000, then 4.975 at the sale
    expect(foreign().nominal).toBeCloseTo(990.025, 6);
  });
  it("a commission's minimum is paid on the trade made: two units where three would leave too little for the fee", () => {
    // 920 ₪ at 300 ₪ a unit and a 25 ₪ minimum: by amount 895 would buy, 2 units (625) are bought, 295 waits
    const r = runSecurities(input({ goal: { amountNow: 920, monthly: 0, months: 1 }, tariff: { buy: { rate: 0.001, min: 25 } }, wholeUnits: { price: 300 } }), ctx);
    expect(r.fees.trade).toBeCloseTo(25, 6);
    expect(r.detail.cashLeft).toBeCloseTo(295, 6);
  });
});

describe("which house buys in whole units (F-109, D94)", () => {
  const fund = { kind: "foreign-fund" as const, drag: {}, sharePrice: 814.9, sharePriceCurrency: "USD" };
  const currency = { code: "USD", startRate: 3.7 };
  const at = (by_amount: unknown, tariff: SecuritiesInput["tariff"] = {}, over: object = {}) =>
    wholeUnitsAt({ listing: "europe", instrumentClass: "foreign_securities", fund, currency, fx: { USD: 3.7 }, ...over }, { by_amount } as never, tariff);
  it("silence is whole units, at the unit's price in shekels", () => {
    expect(at(undefined)?.price).toBeCloseTo(814.9 * 3.7, 9);
    expect(at(undefined)?.monthlyByAmount).toBeUndefined();
  });
  it("an entry for every order on the fund's listing buys by amount; one for another listing changes nothing", () => {
    expect(at([{ venue: "europe", orders: "all", list_only: false }])).toBeUndefined();
    expect(at([{ venue: "us", orders: "all", list_only: false }])?.price).toBeGreaterThan(0);
  });
  it("a list the house does not publish names none of the site's funds: whole units", () => {
    expect(at([{ venue: "europe", orders: "all", list_only: true }])?.price).toBeGreaterThan(0);
  });
  it("a recurring plan buys the monthly purchases by amount where the plan prices them", () => {
    expect(at([{ venue: "europe", orders: "recurring_plan", list_only: false }], { fxStanding: 0 })?.monthlyByAmount).toBe(true);
    expect(at([{ venue: "europe", orders: "recurring_plan", list_only: false }], {})?.monthlyByAmount).toBeUndefined();
  });
  it("a tracking fund, a fund with no unit price and a run with no listing are bought by amount", () => {
    expect(at(undefined, {}, { instrumentClass: "mutual_fund_units", listing: "tase" })).toBeUndefined();
    expect(at(undefined, {}, { fund: { kind: "foreign-fund", drag: {} } })).toBeUndefined();
    expect(at(undefined, {}, { listing: undefined })).toBeUndefined();
  });
  it("a Tel Aviv line priced at its issuer's dollar NAV takes the run's rate of the dollar", () => {
    expect(at(undefined, {}, { listing: "tase", instrumentClass: "tase_foreign_fund_units", currency: undefined, fx: { USD: 3.2 } })?.price).toBeCloseTo(814.9 * 3.2, 9);
  });
});

describe("a house that sells by amount can also buy whole units (F-109, D94)", () => {
  const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
  // Altshuler's US track: 0.15% of the trade, at least USD 9 an order. Its record is set here to sell US listings by amount for every order.
  const source = { url: "https://www.as-invest.co.il/trade/faq/", title: "FAQ", checked: "2026-11-10", quote: "ניתן להזין הוראה לפי כמות שברית של מניות או לפי סכום כספי" };
  const snap = { ...read("fees/altshuler-trade@2026-11-05.json"), by_amount: [{ venue: "us", orders: "all", list_only: false, source }] };
  const ivv = (sharePrice?: number): WorkbenchInput => ({
    goal: { amountNow: 0, monthly: 500, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.02, returnIn: "instrument" },
    fund: { kind: "foreign-fund", drag: { management: 0.0003 }, domicile: "us", w8ben: true, ...(sharePrice ? { sharePrice, sharePriceCurrency: "USD" } : {}) },
    profile: {},
    instrumentClass: "foreign_securities",
    currency: { code: "USD", startRate: 3.7 },
    fx: { USD: 3.7 },
    listing: "us",
    theta: 0.005,
    providers: [{ snapshot: snap, level: "list" }],
  });
  const compared = (wb: ReturnType<typeof providerWorkbench>) => {
    const r = wb.rows.find((x) => x.id === "altshuler-trade")!;
    if (r.kind !== "compared") throw new Error(`not compared: ${JSON.stringify(r)}`);
    return r;
  };
  it("500 ₪ a month on a unit of USD 756: the USD 9 minimum on every monthly order costs more than waiting for a unit, so whole units are its price", () => {
    const byAmount = compared(providerWorkbench(ivv(), ctx));
    const both = compared(providerWorkbench(ivv(756.04), ctx));
    expect(byAmount.run.detail.wholeUnits).toBeUndefined();
    expect(both.run.detail.wholeUnits).toBe(1);
    expect(both.real).toBeGreaterThan(byAmount.real);
    // the house's own way is still run: priced on whole units only because they leave more
    expect(unitWaysAt(ivv(756.04), snap, {})).toEqual([undefined, { price: 756.04 * 3.7 }]);
  });
  it("where the order's minimum is small beside the deposit, by amount leaves more and is its price", () => {
    const big = { ...ivv(756.04), goal: { amountNow: 0, monthly: 20_000, months: 120 } };
    expect(compared(providerWorkbench(big, ctx)).run.detail.wholeUnits).toBeUndefined();
  });
});

describe("a per-share fee on a Tel Aviv line priced at its issuer's dollar NAV (F-12, F-109)", () => {
  // 1 ₪ a share; a unit of USD 814.90 at 3.7 ₪ a dollar is 3,015.13 ₪: 30,152.43 ₪ buys trade + trade / 3,015.13 in commission
  const run = (fund: SecuritiesInput["fund"]) =>
    runSecurities(input({ goal: { amountNow: 30_152.43, monthly: 0, months: 1 }, fund, tariff: { buy: { rate: 0, perShare: 1 } } }), ctx);
  it("counts the shares at the price in shekels, taken from dollars at the run's rate", () => {
    const r = run({ kind: "foreign-fund", drag: {}, sharePrice: 814.9, sharePriceCurrency: "USD", sharePriceRate: 3.7 });
    const p = 814.9 * 3.7;
    expect(r.fees.trade).toBeCloseTo((30_152.43 / (p + 1)) * 1, 6);
  });
  it("a dollar price with no rate to shekels is no share price: a per-share fee cannot be priced", () => {
    expect(() => run({ kind: "foreign-fund", drag: {}, sharePrice: 814.9, sharePriceCurrency: "USD" })).toThrow(/share price/);
  });
});
