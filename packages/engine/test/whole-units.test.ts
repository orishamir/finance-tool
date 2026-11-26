// F-109 (D94): a fund bought in whole units. Each order buys the most whole units its cash pays for with the order's fees; what is left
// waits in the account, earning nothing, and joins the next order; an order whose cash buys no unit is not placed and pays nothing. A house
// whose record says it sells the listing by amount buys as before. Expected figures worked by hand from the formula (comments), with no
// return, fund cost or inflation unless a test says otherwise.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buyWithCash } from "../src/formulas/fees.ts";
import { runSecurities, type SecuritiesInput, type WholeUnits } from "../src/ledgers/securities.ts";
import { beforeTax, listingChangesRun, providerWorkbench, unitWaysAt, waitingReal, wholeUnitsAt, type WorkbenchInput } from "../src/providers/workbench.ts";
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
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, way: { units: { price: 300 } } }), ctx);
    expect(r.fees.trade).toBeCloseTo(130, 6);
    expect(r.nominal).toBeCloseTo(6_870, 6);
    expect(r.detail.cashLeft).toBeCloseTo(270, 6);
    expect(r.detail.monthlyOrders).toBe(12);
    expect(r.formulas).toContain("F-109");
  });
  it("a month whose cash buys no unit places no order and pays nothing: 500 ₪ a month at 1,200 ₪ a unit buys in months 3, 5, 8 and 10", () => {
    // 1,490 after the fee in month 3 buys one (1,210), 290 waits; 1,280 in month 5 (80 waits); 1,570 in month 8 (370); 1,360 in month 10
    // (160); months 11 and 12 leave 1,160 waiting at the end, part of what is left and no gain.
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 500, months: 12 }, way: { units: { price: 1_200 } } }), ctx);
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
    const whole = runSecurities(input({ ...base, way: { units: { price: 2_600 } } }), ctx);
    expect(whole.real).toBeLessThan(byAmount.real);
    // a unit of a few agorot buys almost all of every order: the two runs meet
    const tiny = runSecurities(input({ ...base, way: { units: { price: 0.001 } } }), ctx);
    expect(Math.abs(tiny.real - byAmount.real)).toBeLessThan(1);
  });
  it("a house's recurring plan buys the monthly purchases by amount, and the amount now in whole units; what it leaves joins the first", () => {
    // 1,000 now buys no unit at 1,200 and waits; month 1 buys 1,490 by amount; every month by amount after: 12 orders, 6,880 bought
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, way: { units: { price: 1_200, monthlyByAmount: true } } }), ctx);
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
    const foreign = (units?: WholeUnits) =>
      runSecurities(
        input({
          goal: { amountNow: 1_000, monthly: 0, months: 1 },
          fund: { kind: "foreign-fund", drag: {} },
          tariff: { buy: { rate: 0 }, fx: 0.005, currency: { code: "USD", startRate: 4 } },
          ...(units ? { way: { units } } : {}),
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
    const r = runSecurities(input({ goal: { amountNow: 920, monthly: 0, months: 1 }, tariff: { buy: { rate: 0.001, min: 25 } }, way: { units: { price: 300 } } }), ctx);
    expect(r.fees.trade).toBeCloseTo(25, 6);
    expect(r.detail.cashLeft).toBeCloseTo(295, 6);
  });
});

describe("an order its cash cannot pay is not placed, and its cash waits for the next order (F-12, F-109)", () => {
  const line = { rate: 0.001, min: 10 };
  const nis = { fxRate: 1 };
  it("F-12's order by amount: at 0.1% with a 10 ₪ minimum, 5, 9.99 and 10 ₪ place no order; 10.50 ₪ buys 0.50 and pays 10", () => {
    for (const cash of [5, 9.99, 10]) expect(buyWithCash(cash, line, nis)).toEqual({ trade: 0, commission: 0 });
    const over = buyWithCash(10.5, line, nis);
    expect(over.trade).toBeCloseTo(0.5, 9);
    expect(over.commission).toBeCloseTo(10, 9);
  });
  it("a flat price the cash cannot pay places no order either: 3 ₪ against a flat 5 ₪ waits, 7 ₪ buys 2", () => {
    const flat = { ...line, flatUpTo: { amount: 5, upTo: 100 } };
    expect(buyWithCash(3, flat, nis)).toEqual({ trade: 0, commission: 0 });
    expect(buyWithCash(5, flat, nis)).toEqual({ trade: 0, commission: 0 });
    expect(buyWithCash(7, flat, nis)).toEqual({ trade: 2, commission: 5 });
  });
  it("a run by amount carries the cash to the next order: 5 ₪ a month at a 10 ₪ minimum buys once in four months", () => {
    // month 1: 5 waits; month 2: 10, at the minimum, waits; month 3: 15 buys 5 for 10; month 4: 5 waits. 5 held and 5 waiting of 20 paid in.
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 5, months: 4 }, tariff: { buy: line } }), ctx);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(10, 9);
    expect(r.series.at(-1)!.balance).toBeCloseTo(10, 9);
    // a run by amount keeps the difference, with no W (F-91)
    expect(r.waitingCarried).toBeUndefined();
  });
  it("a conversion's minimum the shekels cannot pay: the order waits for the next one", () => {
    // 8 ₪ a month and a 10 ₪ minimum on converting a monthly purchase: month 1's 8 waits unconverted; month 2's 16 converts for 10 and buys
    // 6; month 3's 8 waits. 6 held and 8 waiting of 24 paid in.
    const r = runSecurities(
      input({
        goal: { amountNow: 0, monthly: 8, months: 3 },
        fund: { kind: "foreign-fund", drag: {} },
        tariff: { buy: { rate: 0 }, fx: 0, fxStanding: { rate: 0, min: 10 }, currency: { code: "USD", startRate: 4 } },
      }),
      ctx,
    );
    expect(r.fees.fx).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(14, 9);
  });
  it("by amount, shekels whose conversion leaves nothing wait unconverted while a dividend held in dollars buys alone", () => {
    // 1,000 ₪ now and 5 ₪ a month, a 10 ₪ minimum on every conversion, no commission. Month 1: 1,000 converts for 10 and buys 990; the 5
    // waits. Month 2: 10 ₪ wait, since converting them for 10 leaves nothing; the dividend of 1% (9.90) pays its tax, and its net, in
    // dollars, buys alone at 0.99, the 10 ₪ still waiting. At the horizon 990 × 0.99 and the net are converted for 10, and the 10 ₪ join them.
    const r = runSecurities(
      input({
        goal: { amountNow: 1_000, monthly: 5, months: 2 },
        fund: { kind: "foreign-fund", drag: {}, domicile: "ireland", distribution: { yield: 0.06, perYear: 6 } },
        tariff: { buy: { rate: 0 }, fx: { rate: 0, min: 10 }, currency: { code: "USD", startRate: 4 } },
      }),
      ctx,
    );
    const net = 9.9 - r.taxDuring;
    expect(net).toBeGreaterThan(0);
    // two conversions, the amount now's and the sale's: the 10 ₪ of month 2 were not converted at a loss
    expect(r.fees.fx).toBeCloseTo(20, 9);
    expect(r.nominal).toBeCloseTo(990 * 0.99 + net - 10 + 10, 9);
  });
  it("in whole units the count leaves out a conversion the order need not make: a dividend held in dollars buys the unit it covers with its commission", () => {
    // The case of ie0031442068 at Interactive Israel, 50,000 ₪ now for 20 years at 5%: in month 63 a few shekels wait unconverted and the
    // dividend held in dollars covers a unit with its 2.5 USD minimum; the 10 ₪ minimum on converting the shekels is no charge of that order.
    // Here, on the same lines at 3.34 ₪ a dollar: 2,720 ₪ now at 300 ₪ a unit buys 9 (2,700, 8.35 commission, 10 ₪ conversion) and 1.65 ₪
    // waits; month 12 pays 13.4%, and its net, about 271 ₪ in dollars, buys one unit at 259.80 with 8.35.
    const tariff = { buy: { rate: 0.0015, min: 2.5, in: "instrument" as const }, fx: { rate: 0.00002, min: 10 }, currency: { code: "USD", startRate: 3.34 } };
    const fund = { kind: "foreign-fund" as const, drag: {}, domicile: "ireland" as const, distribution: { yield: 0.134, perYear: 1 } };
    const r = runSecurities(input({ goal: { amountNow: 2_720, monthly: 0, months: 12 }, fund, tariff, way: { units: { price: 300 } } }), ctx);
    const net = 2_700 * 0.134 - r.taxDuring;
    const ask = 300 * (1 - 0.134);
    const commission = 2.5 * 3.34;
    // the dividend covers the unit with its commission, and would not if the shekels' conversion were charged on it
    expect(net).toBeGreaterThanOrEqual(ask + commission);
    expect(net + 1.65 - 10).toBeLessThan(ask + commission);
    expect(r.fees.trade).toBeCloseTo(2 * commission, 6);
    expect(r.fees.fx).toBeGreaterThan(0);
    expect(r.detail.cashLeft).toBeCloseTo(1.65 + net - ask - commission, 6);
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

describe("whether where the fund is bought changes an account's run (F-109, F-128)", () => {
  const priced = { kind: "foreign-fund" as const, drag: {}, sharePrice: 814.9, sharePriceCurrency: "USD" };
  const bare = { kind: "foreign-fund" as const, drag: {} };
  it("a deal's account always reads it, for its cases for what the plan buys", () => {
    expect(listingChangesRun({ instrumentClass: "foreign_securities", fund: bare }, "deal")).toBe(true);
  });
  it("a house's price list reads it only for whole units: a fund with a unit price that is not a tracking fund", () => {
    expect(listingChangesRun({ instrumentClass: "foreign_securities", fund: priced }, "price-list")).toBe(true);
    expect(listingChangesRun({ instrumentClass: "foreign_securities", fund: bare }, "price-list")).toBe(false);
    expect(listingChangesRun({ instrumentClass: "mutual_fund_units", fund: priced }, "price-list")).toBe(false);
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
    // the two ways at monthly orders; placed every few months, by amount can leave more (F-133, order-interval.test.ts)
    behaviour: { orderEvery: 1 },
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
    expect(unitWaysAt(ivv(756.04), snap, {})).toEqual([{}, { units: { price: 756.04 * 3.7 } }]);
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

describe("a fee a month for the account while the cash waits for a unit (F-17, F-102, F-109)", () => {
  const free = { rate: 0 };
  it("the waiting cash pays the fixed fee when no unit is held: 200 ₪ a month at 2,500 ₪ a unit buys nothing in a year and pays 10 ₪ a month", () => {
    // month k holds 190k after its fee; a unit needs 2,500, which 12 months never reach: 120 ₪ of fees, 2,280 ₪ waiting at the end
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 200, months: 12 }, tariff: { buy: free, monthlyFee: 10 }, way: { units: { price: 2_500 } } }), ctx);
    expect(r.detail.monthlyOrders).toBe(0);
    expect(r.fees.fixed).toBeCloseTo(120, 9);
    expect(r.detail.cashLeft).toBeCloseTo(2_280, 9);
    expect(r.nominal).toBeCloseTo(2_280, 9);
    // by amount the same plan holds units from month 1, and pays the same fee out of them
    const byAmount = runSecurities(input({ goal: { amountNow: 0, monthly: 200, months: 12 }, tariff: { buy: free, monthlyFee: 10 } }), ctx);
    expect(byAmount.fees.fixed).toBeCloseTo(120, 9);
  });
  it("a bank's current account is paid the same way, after the fixed fee", () => {
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 200, months: 12 }, tariff: { buy: free, monthlyFee: 10, currentAccount: 5.5 }, way: { units: { price: 2_500 } } }), ctx);
    expect(r.fees.account).toBeCloseTo(66, 9);
    expect(r.detail.cashLeft).toBeCloseTo(2_400 - 120 - 66, 9);
  });
  it("the units pay first: where a unit is held, the waiting cash is left as it was", () => {
    // the first plan above (22 units, 270 ₪ waiting at the end) with a fee of 5 ₪ a month, taken from the units every month
    const r = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, tariff: { buy: ten, monthlyFee: 5 }, way: { units: { price: 300 } } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(60, 9);
    expect(r.detail.cashLeft).toBeCloseTo(270, 6);
    expect(r.nominal).toBeCloseTo(6_870 - 60, 6);
  });
  it("what neither the units nor the cash can pay is not charged: a fee of 300 ₪ on 200 ₪ a month takes the 200 each month and no more", () => {
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 200, months: 12 }, tariff: { buy: free, monthlyFee: 300 }, way: { units: { price: 2_500 } } }), ctx);
    expect(r.fees.fixed).toBeCloseTo(2_400, 9);
    expect(r.nominal).toBeCloseTo(0, 9);
  });
});

describe("the split of a whole-units run by fee line (F-63, F-91, F-109)", () => {
  it("a run carries each fee to the exit at the fund's total return: with no return, what was paid", () => {
    // the first plan of this file: 13 orders of 10 ₪ and nothing to grow on, so the carried trade line is the 130 ₪ paid
    const flat = runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 }, way: { units: { price: 300 } } }), ctx);
    expect(flat.feesCarried!.trade).toBeCloseTo(130, 9);
    // at 12% a year the 10 ₪ of month 1 has grown by the 12 months' return of the fund, the 10 ₪ of month 12 by none
    const grown = runSecurities(input({ goal: { amountNow: 1_000, monthly: 0, months: 12 }, market: { grossReturn: 0.12, inflation: 0 }, tariff: { buy: ten, monthlyFee: 5 }, way: { units: { price: 300 } } }), ctx);
    const g = Math.pow(1.12, 1 / 12);
    // the order at the start of month 1 pays 10 ₪ before any growth; the fee of month k is paid after month k's growth
    expect(grown.feesCarried!.trade).toBeCloseTo(10 * 1.12, 6);
    let fixed = 0;
    for (let k = 1; k <= 12; k++) fixed += 5 * Math.pow(g, 12 - k);
    expect(grown.feesCarried!.fixed).toBeCloseTo(fixed, 6);
  });

  it("a fee is carried net of the custody a shekel it took would have paid at the margin, and of none where the minimum binds", () => {
    // 3 units held from month 1, no return; custody 0.1% a month: the 10 ₪ order of month 1 would have paid 0.1% in each of the 12 months
    const at = (custody: { rate: number; min?: number; everyMonths: number }) =>
      runSecurities(input({ goal: { amountNow: 1_000, monthly: 0, months: 12 }, tariff: { buy: ten, custody }, way: { units: { price: 300 } } }), ctx);
    expect(at({ rate: 0.001, everyMonths: 1 }).feesCarried!.trade).toBeCloseTo(10 * Math.pow(0.999, 12), 9);
    // a minimum of 5 ₪ a month binds on 900 ₪ (0.90 ₪ at the rate): another shekel would pay nothing more, so the 10 ₪ is carried as paid
    expect(at({ rate: 0.001, min: 5, everyMonths: 1 }).feesCarried!.trade).toBeCloseTo(10, 9);
  });

  it("every line is at or above zero, has no after-tax figure, and the lines with the remainder add up to the account's cost before tax", () => {
    // by hand: 1,000 ₪ once at 300 ₪ a unit and 10 ₪ an order, 12% over the year, no fund cost and no inflation. With no fees the 1,000 ₪
    // is invested whole and is 1,120 before tax; in whole units 3 units (900 ₪) grow to 1,008 and 90 ₪ waits, 1,098 in all. The account
    // costs 22 ₪ before tax, the trade line is the 10 ₪ carried to 11.20, and the remainder is +10.80: the 12% the 90 ₪ waiting did not earn.
    const once = { goal: { amountNow: 1_000, monthly: 0, months: 12 }, market: { grossReturn: 0.12, inflation: 0 } } as const;
    const none = runSecurities(input({ ...once, tariff: {} }), ctx);
    const units = runSecurities(input({ ...once, way: { units: { price: 300 } } }), ctx);
    expect(beforeTax(none)).toBeCloseTo(1_120, 6);
    expect(beforeTax(units)).toBeCloseTo(1_098, 6);
    const remainder = beforeTax(none) - beforeTax(units) - units.feesCarried!.trade;
    expect(remainder).toBeGreaterThan(0);
    expect(remainder).toBeCloseTo(90 * 0.12, 6);

    const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
    const fibi = read("fees/fibi@2026-11-12.json");
    const wb = (monthly: number, months: number): WorkbenchInput => ({
      goal: { amountNow: 0, monthly, months },
      market: { grossReturn: 0.07, inflation: 0.02, returnIn: "instrument" },
      fund: { kind: "foreign-fund", drag: { management: 0.0007 }, sharePrice: 115, sharePriceCurrency: "USD" },
      profile: {},
      instrumentClass: "foreign_securities",
      currency: { code: "USD", startRate: 3.17 },
      fx: { USD: 3.17 },
      listing: "europe",
      channel: "direct",
      theta: 0.005,
      providers: [{ snapshot: fibi, level: "list" }],
      // the remainder below is small where the cash waits only for a unit; placed every few months it waits longer (F-133, order-interval.test.ts)
      behaviour: { orderEvery: 1 },
    });
    for (const [monthly, months] of [[200, 12], [200, 60], [1_000, 120]] as const) {
      const r = providerWorkbench(wb(monthly, months), ctx).rows[0]!;
      if (r.kind !== "compared") throw new Error(`not compared: ${JSON.stringify(r)}`);
      expect(r.run.detail.wholeUnits).toBe(1);
      for (const t of r.byType) {
        expect(t.costBeforeTax).toBeGreaterThanOrEqual(0);
        // the line is what was paid on it, carried to the horizon, in today's shekels
        expect(t.costBeforeTax).toBeCloseTo(r.run.feesCarried![t.line] / r.run.series.at(-1)!.index, 9);
      }
      expect(r.byType.every((t) => t.cost === null)).toBe(true);
      expect(r.interaction).toBeNull();
      // the before-tax remainder is what the waiting cash did (F-91's W, at 7% a cost), the sale's costs on the carried money and what the
      // carry misses: small
      const rest = r.horizonCostBeforeTax - r.byType.reduce((s, t) => s + t.costBeforeTax, 0);
      expect(Math.abs(rest)).toBeLessThan(0.05 * r.horizonCostBeforeTax);
      expect(waitingReal(r.run)!).toBeGreaterThan(0);
    }
  });
});

describe("the waiting cash's part (F-91, F-109: W)", () => {
  // 600 ₪ a month, a unit of 1,000 ₪, no fee, no inflation, the fund moving 1% a month (up, then down). Month 1: 600 waits through the month's
  // move and is carried one more month; month 2: 1,200 buys one unit at 1,000 × 1.01 = 1,010, and 190 waits through the last month.
  // W = 600 × 0.01 × 1.01 + 190 × 0.01 = 7.96. By amount: 600 × 1.01² + 600 × 1.01 = 1,218.06; in whole units 1,010 × 1.01 + 190 = 1,210.10.
  // Falling 1% a month: the unit is 990, 210 waits, W = 600 × (−0.01) × 0.99 + 210 × (−0.01) = −8.04, a gain: 1,182.06 against 1,190.10.
  const two = (monthly: number) => input({ goal: { amountNow: 0, monthly: 600, months: 2 }, market: { grossReturn: (1 + monthly) ** 12 - 1, inflation: 0 }, tariff: {}, way: { units: { price: 1_000 } } });
  it("is each month's waiting cash times the month's move, carried to the exit: 7.96 ₪ when the fund rose, −8.04 ₪ when it fell", () => {
    const up = runSecurities(two(0.01), ctx);
    const down = runSecurities(two(-0.01), ctx);
    expect(up.waitingCarried).toBeCloseTo(7.96, 9);
    expect(down.waitingCarried).toBeCloseTo(-8.04, 9);
    expect(waitingReal(up)).toBeCloseTo(7.96, 9);
    // the gap between buying by amount and in whole units, before tax, with no account fee: W itself
    const { way: _, ...byAmount } = two(0.01);
    expect(beforeTax(runSecurities(byAmount, ctx)) - beforeTax(up)).toBeCloseTo(7.96, 9);
    const { way: __, ...byAmountDown } = two(-0.01);
    expect(beforeTax(runSecurities(byAmountDown, ctx)) - beforeTax(down)).toBeCloseTo(-8.04, 9);
  });
  it("with no account fee it is the whole gap to the run by amount, at a rise and at a fall, over ten years with inflation", () => {
    for (const grossReturn of [0.07, -0.05]) {
      const base = { goal: { amountNow: 10_000, monthly: 500, months: 120 }, market: { grossReturn, inflation: 0.02 }, tariff: {} };
      const whole = runSecurities(input({ ...base, way: { units: { price: 2_600 } } }), ctx);
      const gap = beforeTax(runSecurities(input(base), ctx)) - beforeTax(whole);
      expect(waitingReal(whole)!).toBeCloseTo(gap, 6);
      expect(Math.sign(waitingReal(whole)!)).toBe(Math.sign(grossReturn));
    }
  });
  it("a run by amount has none", () => {
    expect(runSecurities(input({ goal: { amountNow: 1_000, monthly: 500, months: 12 } }), ctx).waitingCarried).toBeUndefined();
  });
});
