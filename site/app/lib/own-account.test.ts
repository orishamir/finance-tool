// An account built on a house (F-101): the starting points a house offers, the tariff built in layers (the house's list tariff, the group's
// values, the person's own), and a price for a time through the page's own run. The expected figures are printed by tests/golden/expected_own_account.py from the data files and the fee formulas alone.
import { providerWorkbench, type ComparedProvider, type SecuritiesInput } from "@finance-tool/engine";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validCustomBrokers, type CustomBroker } from "./custom-entries";
import { listReading } from "./invest";
import { applyOwn, baseOf, groupTrade, groupValues, layeredOf, layeredTariff, priceEndsOf, startingPointsOf, type GroupCopy } from "./own-account";
import { buildIndicesBundle } from "./providers.server";
import { ruleContext, type WorkbenchInputs } from "./providers";
import { entered } from "./value";

// How a house's standing-order line is layered (F-101) is read on Leumi's list with its line ranked, as the golden script reads it: the
// latest record sets the line aside (`not_ranked`, D41), and no house's record holds a ranked one, so the mark is taken off here to keep
// the layering checked. The indices page's own reading of the set-aside line is in invest.test.ts.
const read = buildIndicesBundle();
const withRankedStanding = (s: (typeof read.snapshots)[number]) => ({ ...s, lines: s.lines.map(({ not_ranked: _, ...l }) => l) });
const bundle = { ...read, snapshots: read.snapshots.map((s) => (s.id === "leumi" ? withRankedStanding(s) : s)) };
const t = bundle.today;
const house = (id: string) => bundle.snapshots.find((s) => s.id === id)!;
const mercantile = house("mercantile");
const leumi = house("leumi");
const points = startingPointsOf(mercantile);
const point = (name: string, of = points) => of.find((p) => p.nameHe === name)!;
const TOP = point("מרכנתיל טופ");
const STUDENT = point("סטודנטים");
// The worked example of a price for a time (F-101) is Leumi's opening offer as the 2026-11-04 record held it, which the golden script reads too.
// The 2026-11-07 record no longer prices it (D56: it stood only on the bank's advertising), so the example group is read from that record.
const leumiAsRead = JSON.parse(readFileSync(new URL("../../../data/fees/leumi@2026-11-04.json", import.meta.url), "utf8")) as typeof leumi;
const leumiPoints = startingPointsOf(leumiAsRead);
const OFFER = point("לאומי סטודנט, בפתיחת חשבון", leumiPoints);
const TOTAL = point("לאומי טוטאל דיגיטל", leumiPoints);

/** A group read as if every price's words named fund units: what the site would apply, and what a person who adopted the prices would have typed. */
const named = (g: GroupCopy, over: (p: GroupCopy["prices"][number]) => GroupCopy["prices"][number] = (p) => p): { group: GroupCopy } => ({ group: { ...g, prices: g.prices.map((p) => over({ ...p, names_fund: true })) } });
const trade = (g: GroupCopy) => g.prices.find((p) => p.fee === "trade_israel")!;

/** What an account built on a house may set over it: its own figures (null: as the house), and its stay in the group. */
type Over = Partial<Record<"tradePct" | "tradeMin" | "custodyPct" | "custodyMin" | "fxPct" | "monthlyFee", number | null>> & { untilYears?: number | null };
const fig = (v: number | null | undefined, unit: Parameters<typeof entered>[1]) => (v === null || v === undefined ? null : entered(v, unit, t));
const accountAt = (snap: typeof mercantile, start: { group: GroupCopy | null }, over: Over = {}, id = "custom-broker-top"): CustomBroker => ({
  id,
  name: "החשבון שלי",
  added: t,
  tradePct: fig(over.tradePct, "pct_of_trade"),
  tradeMin: fig(over.tradeMin, "nis_per_trade"),
  custodyPct: fig(over.custodyPct, "pct_per_year"),
  custodyMin: fig(over.custodyMin, "nis_per_month"),
  fxPct: fig(over.fxPct, "pct_of_trade"),
  monthlyFee: fig(over.monthlyFee, "nis_per_month"),
  sells: { israeli: true, abroad: true },
  base: baseOf(snap, start),
  ...(over.untilYears != null && over.untilYears > 0 && start.group ? { untilYears: over.untilYears } : {}),
});
const accountOn = (start: { group: GroupCopy | null }, over: Over = {}, id = "custom-broker-top") => accountAt(mercantile, start, over, id);
const accountAtLeumi = (start: { group: GroupCopy | null }, over: Over = {}, id = "custom-broker-leumi") => accountAt(leumi, start, over, id);

/** The golden script names a custody line's period `every`; the engine's is `everyMonths`. */
const engine = ({ every, ...rest }: { every: number; rate: number; max?: number; min?: number }) => ({ ...rest, everyMonths: every });

/** Printed by tests/golden/expected_own_account.py. */
const EXPECTED = {
  "adopted_over_offer": {
    "custody": 2008.5334002659406,
    "left": 107123.00670943054,
    "trade": 868.4598903033225
  },
  "adopted_total_digital": {
    "custody": 2007.7396487164299,
    "left": 107063.08493537646,
    "trade": 929.1754159071282
  },
  "layers": {
    "adopted_custody_rate_a_quarter": 0.00125,
    "adopted_trade": 0.004,
    "leumi_buy": {
      "max": 6300,
      "min": 26,
      "rate": 0.004
    },
    "leumi_custody": {
      "every": 3,
      "max": 3700,
      "rate": 0.0015
    },
    "leumi_standing": {
      "max": 6300,
      "min": 5,
      "rate": 0.0022500000000000003
    },
    "merc_buy_only_buy": {
      "max": 7150,
      "min": 10,
      "rate": 0.0012
    },
    "merc_buy_only_sell": {
      "max": 7150,
      "min": 25,
      "rate": 0.004
    },
    "merc_student_custody_a_quarter": {
      "every": 3,
      "max": 7500.0,
      "rate": 0.001
    },
    "offer_custody_months": 12,
    "offer_trade": 7,
    "own_custody_over_exemption": {
      "every": 3,
      "max": 3700.0,
      "rate": 0.00125
    },
    "own_custody_over_list": {
      "every": 3,
      "max": 3700,
      "rate": 0.00125
    }
  },
  "leumi_list_alone": {
    "custody": 2404.3268330027176,
    "left": 106668.08409982729,
    "trade": 927.5890671699831
  },
  "merc_buy_only": {
    "custody": 3191.84087039923,
    "left": 105723.63811913111,
    "trade": 1084.5210104696616
  },
  "merc_list_alone": {
    "custody": 3167.7117159501777,
    "left": 104712.55275641163,
    "trade": 2119.735527638193
  },
  "merc_two_ends": {
    "custody": 2016.7055016474435,
    "left": 106356.23294640786,
    "trade": 1627.0615519446685
  },
  "offer_stay_3_years": {
    "custody": 2074.183408565493,
    "left": 107188.34132506879,
    "trade": 737.4752663657382
  },
  "offer_stay_5_years": {
    "custody": 2074.183408565493,
    "left": 107611.81659143453,
    "trade": 314.0
  },
  "offer_stay_6_months": {
    "custody": 2251.0723229680607,
    "left": 107012.15996632384,
    "trade": 736.7677107081279
  },
  "offer_whole_plan": {
    "custody": 2074.183408565493,
    "left": 107611.81659143453,
    "trade": 314.0
  },
  "total_not_applied": {
    "custody": 2404.3268330027176,
    "left": 106668.08409982729,
    "trade": 927.5890671699831
  }
};

const planRun = { amountNow: 50_000, monthly: 1_000, years: 5 };
const workbenchInput = (providers: Parameters<typeof providerWorkbench>[0]["providers"]) => ({
  goal: { amountNow: planRun.amountNow, monthly: planRun.monthly, months: 12 * planRun.years },
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "israeli-fund" as const, drag: {} },
  profile: {},
  instrumentClass: "etf_units",
  channel: "direct",
  theta: 0.005,
  providers,
});
const rowAt = (snap: typeof mercantile, b: CustomBroker | null) => {
  const p = b ? [{ snapshot: snap, level: "entered" as const, layered: layeredOf(b) }] : [{ snapshot: snap, level: "list" as const }];
  return providerWorkbench(workbenchInput(p), ruleContext(bundle)).rows[0] as ComparedProvider;
};
const figures = (r: ComparedProvider) => ({ trade: r.run.fees.trade, custody: r.run.fees.custody, left: r.run.nominal });
const expectFigures = (r: ComparedProvider, e: { trade: number; custody: number; left: number }) => {
  expect(r.run.fees.trade).toBeCloseTo(e.trade, 6);
  expect(r.run.fees.custody).toBeCloseTo(e.custody, 6);
  expect(r.run.nominal).toBeCloseTo(e.left, 6);
};

describe("the starting points a house offers", () => {
  it("are its price list first, then each group or offer that states a price in numbers", () => {
    expect(points[0]).toMatchObject({ key: "list", kind: "list", group: null });
    const names = points.slice(1).map((p) => p.nameHe);
    expect(names).toEqual(expect.arrayContaining(["צעירים", "חיילים משוחררים", "סטודנטים", "מרכנתיל טופ", "מרכנתיל דלקס"]));
    // a group whose prices are all words is not one: Yahav's doctors have none to copy
    expect(startingPointsOf(house("yahav")).map((p) => p.key)).toEqual(["list"]);
  });
  it("offer no group priced only by a house's advertising (D56): Leumi's three entries from its account pages and Discount's young-investor page are words", () => {
    const names = (id: string) => startingPointsOf(house(id)).map((p) => p.nameHe);
    for (const n of ["לאומי חיילים ו־18+, בדף החשבונות", "לאומי חייל משוחרר, בדף החשבונות", "לאומי סטודנט, בפתיחת חשבון"]) expect(names("leumi")).not.toContain(n);
    expect(names("leumi")).toEqual(expect.arrayContaining(["לאומי 18+", "לאומי סטודנט", "לאומי טוטאל דיגיטל"]));
    expect(names("discount")).not.toContain("המשקיע הצעיר");
    expect(names("discount")).toContain("חיילים משוחררים");
  });
  it("carry the group whole, with each price's words and source", () => {
    const g = TOP.group!;
    expect(g.name).toBe("מרכנתיל טופ");
    expect(g.snapshot).toBe(mercantile.snapshot);
    expect(g.prices.map((p) => p.fee)).toEqual(["trade_israel", "trade_abroad", "custody_israel", "custody_abroad"]);
    expect(g.prices.every((p) => p.source.url && p.source.quote && p.price_he)).toBe(true);
    expect(Object.keys(groupValues(g))).toHaveLength(4);
  });
  it("say which months the record prints for the group's prices: Top and Deluxe three years, Leumi's opening offer one, a student price none", () => {
    expect(TOP.endsMonths).toEqual([36]);
    expect(point("מרכנתיל דלקס").endsMonths).toEqual([36]);
    expect(OFFER.endsMonths).toEqual([12]);
    expect(point("לאומי סטודנט", leumiPoints).endsMonths).toEqual([]);
    expect(priceEndsOf([{ value: { exempt: true, for_months: 24 } }, { value: { exempt: true, for_months: 12 } }, { value: { exempt: true, for_months: 12 } }, {}])).toEqual([12, 24]);
  });
});

describe("the tariff built in layers (F-101)", () => {
  const plan = { amountNow: 1, monthly: 0, years: 1, grossReturn: 0, inflation: 0, age: null, income: null } as unknown as WorkbenchInputs;
  const reading = listReading(bundle, mercantile, "il-etf", plan)!;
  const list = reading.built.tariff as SecuritiesInput["tariff"];
  const run = reading.run;
  const leumiReading = listReading(bundle, leumi, "il-etf", plan)!;
  const leumiList = leumiReading.built.tariff as SecuritiesInput["tariff"];
  const unwrap = (x: ReturnType<typeof layeredTariff>) => {
    if ("unusable" in x) throw new Error("unusable");
    return x;
  };
  it("reads the house's own list tariff, the lines the script picks from the record", () => {
    expect(list.buy).toMatchObject(EXPECTED.layers.merc_buy_only_sell);
    expect(list.custody).toMatchObject({ rate: 0.002, everyMonths: 3, max: 7500 });
    expect(leumiList.buy).toMatchObject(EXPECTED.layers.leumi_buy);
    expect(leumiList.buyStanding).toMatchObject(EXPECTED.layers.leumi_standing);
    expect(leumiList.custody).toMatchObject({ rate: EXPECTED.layers.leumi_custody.rate, everyMonths: 3, max: 3700 });
  });
  it("applies only the group's prices whose own words name fund units, and the rest is the price list (D42)", () => {
    // Top's words say "ניירות ערך (בלי פירוט)": a price for securities is not a price for a fund
    const top = unwrap(layeredTariff(accountOn(TOP, { untilYears: 3 }), list, run));
    expect(top.buy).toEqual(list.buy);
    expect(top.custody).toEqual(list.custody);
    expect(top.until).toBeUndefined();
    // the student's custody line names units of mutual funds; its trade line is for shares and bonds
    const student = unwrap(layeredTariff(accountOn(STUDENT), list, run));
    expect(student.buy).toEqual(list.buy);
    expect(student.custody).toEqual(engine(EXPECTED.layers.merc_student_custody_a_quarter));
    expect(student.until!.months).toBe(48);
    expect(student.until!.then.custody).toEqual(list.custody);
  });
  it("a group whose annex exempts its current account pays nothing for it until the group's end, then the bank's minimum (F-102)", () => {
    // Discount's first-degree students (annex, "עמלת מינימום פעולות פטור"), for 4 years from joining
    const discount = house("discount");
    const dStudent = point("סטודנטים לתואר ראשון", startingPointsOf(discount));
    const dReading = listReading(bundle, discount, "il-etf", plan)!;
    const dList = dReading.built.tariff as SecuritiesInput["tariff"];
    const dAccount = (over: Over = {}) => accountAt(discount, dStudent, over, "custom-broker-discount");
    expect(dStudent.group!.currentAccount?.exemptMonths).toBe(48);
    const counted = { ...dList, currentAccount: 5.9 };
    const got = unwrap(layeredTariff(dAccount(), counted, dReading.run));
    expect(got.currentAccount).toBe(0);
    expect(got.until!.months).toBe(48);
    expect(got.until!.then.currentAccount).toBe(5.9);
    // a stay in the group shorter than its end ends the exemption with it
    const short = unwrap(layeredTariff(dAccount({ untilYears: 2 }), counted, dReading.run));
    expect(short.until!.months).toBe(24);
    expect(short.until!.then.currentAccount).toBe(5.9);
    // where the row does not count the current account (the person's own bank), the group adds nothing
    expect(unwrap(layeredTariff(dAccount(), dList, dReading.run)).currentAccount).toBeUndefined();
  });
  it("a group whose annex leaves the minimum unclear pays the ordinary minimum throughout (D56, D64; lens review M2)", () => {
    // Mercantile's students (p.31): the teller action and the direct action "פטור", and no row for the minimum, which is "not above
    // the price of one teller action": the most the documents allow is the price list's 6.40 shekels
    const counted = { ...list, currentAccount: 6.4 };
    expect(STUDENT.group!.currentAccount).toBeUndefined();
    const got = unwrap(layeredTariff(accountOn(STUDENT), counted, run));
    expect(got.currentAccount).toBe(6.4);
    expect(got.until?.then.currentAccount ?? 6.4).toBe(6.4);
    expect(unwrap(layeredTariff(accountOn(TOP), counted, run)).currentAccount).toBe(6.4);
  });
  it("a rate without a minimum keeps the list's minimum and maximum: silence is not zero", () => {
    const got = unwrap(layeredTariff(accountOn(named(STUDENT.group!)), list, run));
    // Mercantile's student price states 0.25% a trade "subject to a minimum" and no number
    expect(got.buy).toEqual({ rate: 0.0025, min: 25, max: 7150 });
  });
  it("a rate replaces the commission's whole rate shape, a flat price and a price per share included, and keeps its bounds", () => {
    const shaped = { buy: { rate: 0.001, perShare: 0.4, min: 3, max: 90 }, sell: { rate: 0.001, flatUpTo: { amount: 9, upTo: 1000 }, min: 3, max: 90 } };
    const got = unwrap(layeredTariff(accountOn(named(STUDENT.group!)), shaped, run));
    expect(got.buy).toEqual({ rate: 0.0025, min: 3, max: 90 });
    expect(got.sell).toEqual({ rate: 0.0025, min: 3, max: 90 });
  });
  it("a conversion rate of one's own keeps the line's flat price for a small conversion and its bounds (F-13)", () => {
    // Hapoalim's direct channel: 0.17%, 5.7 $ to 2,300 $, up to 99 $ a flat 3.3 $; the person types 0.1%
    const fx = { rate: 0.0017, min: 5.7, max: 2_300, in: "instrument" as const, flatUpTo: { amount: 3.3, upTo: 99 } };
    const got = applyOwn({ fx }, { fxPct: { value: 0.1 } } as never);
    expect(got.fx).toEqual({ ...fx, rate: 0.001 });
  });
  it("a minimum typed in shekels over a dollar line stays in shekels, and the line's dollar sums stay in dollars (F-12, F-101)", () => {
    const line = { rate: 0.003, min: 24, max: 100, in: "instrument" as const };
    const got = applyOwn({ buy: line, sell: line }, { tradeMin: { value: 30 } } as never);
    expect(got.buy).toEqual({ ...line, min: 30, sumIn: { min: "nis" } });
    expect(got.sell).toEqual({ ...line, min: 30, sumIn: { min: "nis" } });
  });
  it("a group's sum keeps its own currency beside the line's: dollars on a dollar fund, shekels as they are (F-12, F-101)", () => {
    const line = { rate: 0.003, min: 24, in: "instrument" as const };
    const usdRun = { fx: { USD: 3.7 }, instrumentClass: "foreign_securities", currency: { code: "USD", startRate: 3.7 }, sharePrice: undefined };
    expect(groupTrade(line, { flat: 7, currency: "USD" } as never, usdRun)).toEqual({ ...line, flatUpTo: { amount: 7, upTo: Infinity } });
    expect(groupTrade(line, { flat: 20 } as never, usdRun)).toEqual({ ...line, flatUpTo: { amount: 20, upTo: Infinity }, sumIn: { flatUpTo: "nis" } });
    expect(groupTrade(line, { rate_pct: 0.1, max: 50 } as never, usdRun)).toEqual({ ...line, rate: 0.001, max: 50, sumIn: { max: "nis" } });
  });
  it("lays the person's values over the group's, a yearly custody percent as a quarter of it a quarter, and holds them for the whole plan", () => {
    const b = accountOn(STUDENT, { tradeMin: 12, custodyPct: 0.4 });
    const got = unwrap(layeredTariff(b, list, run));
    expect(got.buy).toEqual({ ...list.buy, min: 12 });
    // 0.4% a year is 0.1% a quarter, on the list's maximum
    expect(got.custody).toEqual({ rate: 0.001, everyMonths: 3, max: 7500 });
    expect(got.until!.then.buy).toEqual({ ...list.buy, min: 12 });
    expect(got.until!.then.custody).toEqual({ rate: 0.001, everyMonths: 3, max: 7500 });
  });
  it("a custody rate typed over a group's exemption keeps the list's maximum, as it does over the list: not a different maximum in each period", () => {
    const offer = named(OFFER.group!);
    const got = unwrap(layeredTariff(accountAtLeumi(offer, { custodyPct: 0.5 }), leumiList, leumiReading.run));
    expect(got.custody).toEqual(engine(EXPECTED.layers.own_custody_over_exemption));
    expect(got.until!.then.custody).toEqual(engine(EXPECTED.layers.own_custody_over_list));
  });
  it("each price ends at its own end: an exemption for a year does not end a trade price that prints none, and the person's stay ends both", () => {
    const offer = named(OFFER.group!);
    const whole = unwrap(layeredTariff(accountAtLeumi(offer), leumiList, leumiReading.run));
    expect(whole.custody).toEqual({ rate: 0, everyMonths: 3 });
    expect(whole.buy).toMatchObject({ flatUpTo: { amount: EXPECTED.layers.offer_trade, upTo: Infinity } });
    expect(whole.until!.months).toBe(EXPECTED.layers.offer_custody_months);
    expect(whole.until!.then.custody).toEqual(leumiList.custody);
    expect(whole.until!.then.buy).toMatchObject({ flatUpTo: { amount: 7 } });
    expect(whole.until!.then.sell).toMatchObject({ flatUpTo: { amount: 7 } });
    expect(whole.until!.then.until).toBeUndefined();
    // a stay of 3 years: the exemption ends at 12 months, the trade price at 36, then the price list
    const stay = unwrap(layeredTariff(accountAtLeumi(offer, { untilYears: 3 }), leumiList, leumiReading.run));
    expect(stay.until!.months).toBe(12);
    expect(stay.until!.then.buy).toMatchObject({ flatUpTo: { amount: 7 } });
    expect(stay.until!.then.until!.months).toBe(36);
    expect(stay.until!.then.until!.then.buy).toEqual(leumiList.buy);
    expect(stay.until!.then.until!.then.custody).toEqual(leumiList.custody);
    // a stay shorter than the exemption ends both at the stay
    const six = unwrap(layeredTariff(accountAtLeumi(offer, { untilYears: 0.5 }), leumiList, leumiReading.run));
    expect(six.until!.months).toBe(6);
    expect(six.until!.then.until).toBeUndefined();
    expect(six.until!.then.buy).toEqual(leumiList.buy);
  });
  it("a group or typed regular price leaves the list's standing-order line in place; a monthly purchase pays the lower of the two", () => {
    const got = unwrap(layeredTariff(accountAtLeumi(named(OFFER.group!)), leumiList, leumiReading.run));
    expect(got.buyStanding).toEqual(EXPECTED.layers.leumi_standing);
    expect(got.cheaperOfStandingTrade).toBe(true);
    const typed = unwrap(layeredTariff(accountAtLeumi({ group: null }, { tradePct: 0.4 }), leumiList, leumiReading.run));
    expect(typed.buyStanding).toEqual(EXPECTED.layers.leumi_standing);
    expect(typed.cheaperOfStandingTrade).toBe(true);
    expect(typed.buy).toMatchObject(EXPECTED.layers.leumi_buy);
    // a custody price alone leaves the trade lines as the list's, with no flag: the standing-order price replaces the regular one as it does for the house
    const custodyOnly = unwrap(layeredTariff(accountAtLeumi({ group: null }, { custodyPct: 0.5 }), leumiList, leumiReading.run));
    expect(custodyOnly.cheaperOfStandingTrade).toBeUndefined();
    expect(custodyOnly.cheaperOfStandingFx).toBeUndefined();
    // the account on the price list alone is the list tariff, line for line
    const alone = unwrap(layeredTariff(accountAtLeumi(points[0]!), leumiList, leumiReading.run));
    expect(alone).toEqual({ buy: leumiList.buy, buyStanding: leumiList.buyStanding, sell: leumiList.sell, custody: leumiList.custody, ...(leumiList.fx !== undefined ? { fx: leumiList.fx } : {}), ...(leumiList.fxStanding !== undefined ? { fxStanding: leumiList.fxStanding } : {}), ...(leumiList.monthlyFee !== undefined ? { monthlyFee: leumiList.monthlyFee } : {}) });
  });
  it("a price whose words name a purchase alone leaves the sale the list's price", () => {
    const buyOnly = named(TOP.group!, (p) => (p.fee === "trade_israel" ? { ...p, value: { ...p.value!, side: "buy" as const, for_months: undefined } } : p));
    const got = unwrap(layeredTariff(accountOn(buyOnly), list, run));
    expect(got.buy).toEqual(EXPECTED.layers.merc_buy_only_buy);
    expect(got.sell).toEqual(EXPECTED.layers.merc_buy_only_sell);
    const sellOnly = named(TOP.group!, (p) => (p.fee === "trade_israel" ? { ...p, value: { ...p.value!, side: "sell" as const, for_months: undefined } } : p));
    const sold = unwrap(layeredTariff(accountOn(sellOnly), list, run));
    expect(sold.buy).toEqual(list.buy);
    expect(sold.sell).toEqual(EXPECTED.layers.merc_buy_only_buy);
    // Mercantile's records say so where the words do: Top's and Deluxe's trade price abroad is a purchase's
    for (const name of ["מרכנתיל טופ", "מרכנתיל דלקס"]) expect(point(name).group!.prices.find((p) => p.fee === "trade_abroad")!.value!.side).toBe("buy");
    expect(trade(TOP.group!).value!.side).toBeUndefined();
  });
  it("adopting a price whose words do not name funds is the person's choice, kept on the account: it reads like a price that names funds, with its own end and the person's stay", () => {
    const all = (g: GroupCopy): GroupCopy => ({ ...g, adopted: Object.keys(groupValues(g)) as GroupCopy["prices"][number]["fee"][] });
    // Leumi's opening offer adopted, five years in the group: custody exempt to month 12 and 7 shekels a trade to month 60 (F-101's example)
    const offer = all(OFFER.group!);
    expect([...offer.adopted!].sort()).toEqual(["custody_abroad", "custody_israel", "trade_abroad", "trade_israel"]);
    const five = rowAt(leumi, accountAtLeumi({ group: offer }, { untilYears: 5 }));
    expectFigures(five, EXPECTED.offer_stay_5_years);
    expect(five.run.fees.trade).toBeCloseTo(314, 9);
    expect(five.run.fees.custody).toBeCloseTo(2074.18, 2);
    expect(five.real).not.toBeCloseTo(rowAt(leumi, accountAtLeumi({ group: { ...offer, adopted: undefined } }, { untilYears: 5 })).real, 0);
    // the exemption's year is the price's own: adopted for the whole plan it does not become 60 months of exemption
    expectFigures(rowAt(leumi, accountAtLeumi({ group: offer })), EXPECTED.offer_whole_plan);
    expectFigures(rowAt(leumi, accountAtLeumi({ group: offer }, { untilYears: 3 })), EXPECTED.offer_stay_3_years);
    // Total Digital's two prices, adopted: the price list's trade price at 0.4%, and custody at 0.5% a year, as typed
    expectFigures(rowAt(leumi, accountAtLeumi({ group: all(TOTAL.group!) })), EXPECTED.adopted_total_digital);
    // one price adopted, the other not: only that line is the group's
    const custodyOnly: GroupCopy = { ...TOTAL.group!, adopted: ["custody_israel"] };
    expect(unwrap(layeredTariff(accountAtLeumi({ group: custodyOnly }), leumiList, leumiReading.run)).buy).toEqual(leumiList.buy);
    expect(unwrap(layeredTariff(accountAtLeumi({ group: custodyOnly }), leumiList, leumiReading.run)).custody).toEqual({ rate: EXPECTED.layers.adopted_custody_rate_a_quarter, everyMonths: 3, max: 3700 });
    // undone: the group as it was
    // saved with the entry, carried through export and import; an entry without it loads as before
    const saved = accountAtLeumi({ group: offer });
    const back = validCustomBrokers(JSON.parse(JSON.stringify([saved])))[0]!;
    expect([...back.base!.group!.adopted!].sort()).toEqual([...offer.adopted!].sort());
    expect(validCustomBrokers(JSON.parse(JSON.stringify([accountAtLeumi(OFFER)])))[0]!.base!.group!.adopted).toBeUndefined();
    // an adopted fee the group has no price for is dropped
    const odd = JSON.parse(JSON.stringify([saved]));
    odd[0].base.group.adopted = ["custody_israel", "nonsense", 7];
    expect(validCustomBrokers(odd)[0]!.base!.group!.adopted).toEqual(["custody_israel"]);
  });
  it("a group's price in dollars needs the dollar rate and says so when the run has none", () => {
    const abroad = { ...run, instrumentClass: "foreign_securities", fx: {} };
    const flat = named(OFFER.group!);
    const leumiB = accountAtLeumi(flat, {}, "custom-broker-flat");
    const got = layeredTariff(leumiB, { buy: { rate: 0.005 }, sell: { rate: 0.005 } }, abroad);
    expect(got).toMatchObject({ unusable: "needs-fx-rate" });
    const ok = unwrap(layeredTariff(leumiB, { buy: { rate: 0.005 }, sell: { rate: 0.005 } }, { ...abroad, fx: { USD: 3.2 } }));
    expect(ok.buy).toMatchObject({ flatUpTo: { amount: 7 * 3.2, upTo: Infinity } });
    // without the words naming funds nothing in dollars is read, and nothing is needed
    expect("unusable" in layeredTariff(accountAtLeumi(OFFER, {}, "custom-broker-flat"), { buy: { rate: 0.005 }, sell: { rate: 0.005 } }, abroad)).toBe(false);
  });
  it("leaves a house with no line for the kind of holding as it is: a group's price is not read as one", () => {
    const got = unwrap(layeredTariff(accountOn(named(STUDENT.group!)), {}, run));
    expect(got.buy).toBeUndefined();
    expect(got.custody).toBeUndefined();
  });
});

describe("a price for a time through the page's own run (F-101)", () => {
  it("keeps both sources of a group's current account in the shape the site builds: the annex's exemption, then the price list (lens review S4)", () => {
    const discount = house("discount");
    const b = accountAt(discount, point("סטודנטים לתואר ראשון", startingPointsOf(discount)), {}, "custom-broker-discount");
    const row = providerWorkbench(workbenchInput([{ snapshot: discount, level: "entered", layered: layeredOf(b), currentAccount: true }]), ruleContext(bundle)).rows[0] as ComparedProvider;
    const sources = row.lineSources.filter((x) => x.lineId === "current-account").map((x) => [x.level, x.url]);
    expect(sources).toEqual([
      ["entered", b.base!.group!.currentAccount!.source!.url],
      ["list", discount.current_account!.monthly_minimum.source.url],
    ]);
    // the plan runs past the exemption's 48 months: the ordinary minimum is paid for the rest
    expect(row.run.fees.account).toBeCloseTo(5.9 * (12 * planRun.years - 48), 6);
  });
  it("an account on the price list alone is the house's row, to the shekel, at a house with a standing-order price and at one without", () => {
    for (const [snap, expected] of [[mercantile, EXPECTED.merc_list_alone], [leumi, EXPECTED.leumi_list_alone]] as const) {
      const b = accountAt(snap, startingPointsOf(snap)[0]!);
      const mine = rowAt(snap, b);
      const theirs = rowAt(snap, null);
      expect(mine.real).toBeCloseTo(theirs.real, 9);
      expectFigures(mine, expected);
      expect(figures(theirs).left).toBeCloseTo(expected.left, 6);
      expect(mine.tariff.until).toBeUndefined();
      expect(mine.tariff).toEqual(theirs.tariff);
    }
  });
  it("a group whose words do not name funds is the price list: Total Digital's and Top's prices are not applied", () => {
    const total = rowAt(leumi, accountAtLeumi(TOTAL));
    expectFigures(total, EXPECTED.total_not_applied);
    expect(total.real).toBeCloseTo(rowAt(leumi, null).real, 9);
    expect(rowAt(mercantile, accountOn(TOP, { untilYears: 3 })).real).toBeCloseTo(rowAt(mercantile, null).real, 9);
  });
  it("the opening offer for the whole plan: the exemption ends at a year, the 7 shekels a trade go on, and a monthly purchase pays the standing-order price when it is lower", () => {
    const row = rowAt(leumi, accountAtLeumi(named(OFFER.group!)));
    expectFigures(row, EXPECTED.offer_whole_plan);
    // 7 for the amount now and the sale, 5 for each of the 60 monthly purchases
    expect(row.run.fees.trade).toBeCloseTo(314, 9);
  });
  it("the person in the group for the plan's five years: the sale at the last month still pays 7; for three years it pays the list's price", () => {
    expectFigures(rowAt(leumi, accountAtLeumi(named(OFFER.group!), { untilYears: 5 })), EXPECTED.offer_stay_5_years);
    expectFigures(rowAt(leumi, accountAtLeumi(named(OFFER.group!), { untilYears: 3 })), EXPECTED.offer_stay_3_years);
    expectFigures(rowAt(leumi, accountAtLeumi(named(OFFER.group!), { untilYears: 0.5 })), EXPECTED.offer_stay_6_months);
  });
  it("the person's typed values keep the list's standing-order price: adopting Total Digital's two prices is the list's trade cost, not a dearer one", () => {
    const row = rowAt(leumi, accountAtLeumi(TOTAL, { tradePct: 0.4, custodyPct: 0.5 }));
    expectFigures(row, EXPECTED.adopted_total_digital);
    expect(row.tariff.buyStanding).toEqual(rowAt(leumi, null).tariff.buyStanding);
    expect(row.tariff.cheaperOfStandingTrade).toBe(true);
    // the trade cost differs from the list's only by the sale on a larger balance: the monthly purchases pay 5 each
    const list = rowAt(leumi, null);
    expect(Math.abs(row.run.fees.trade - list.run.fees.trade)).toBeLessThan(5);
  });
  it("the person's custody rate over the offer's exemption: the list's maximum in the exempt year, and the exemption is the person's rate then too", () => {
    expectFigures(rowAt(leumi, accountAtLeumi(named(OFFER.group!), { tradePct: 0.4, custodyPct: 0.5 })), EXPECTED.adopted_over_offer);
  });
  it("a purchase-only price: the purchases pay the group's, the sale the list's", () => {
    const tradeOnly = { ...TOP.group!, prices: [trade(TOP.group!)] };
    const buyOnly = named(tradeOnly, (p) => ({ ...p, value: { rate_pct: p.value!.rate_pct, per: p.value!.per, min: p.value!.min, currency: p.value!.currency, side: "buy" as const } }));
    const row = rowAt(mercantile, accountOn(buyOnly, { untilYears: null }));
    expectFigures(row, EXPECTED.merc_buy_only);
    expect(row.tariff.sell).toEqual(rowAt(mercantile, null).tariff.sell);
  });
  it("two prices of one group with different ends are two periods of their own", () => {
    const trade24 = { ...trade(TOP.group!), names_fund: true, value: { ...trade(TOP.group!).value!, for_months: 24 } };
    const custody = { ...STUDENT.group!.prices.find((p) => p.fee === "custody_israel")! };
    const group = { ...TOP.group!, prices: [trade24, custody] };
    const row = rowAt(mercantile, accountOn({ group }));
    expectFigures(row, EXPECTED.merc_two_ends);
    expect(row.tariff.until!.months).toBe(24);
    expect(row.tariff.until!.then.until!.months).toBe(48);
    expect(row.run.formulas).toContain("F-101");
  });
  it("a stay that ends between two custody charges is the row's reason, not a prorated price (docs/method.md section 12)", () => {
    const row = rowAt(leumi, accountAtLeumi(named(OFFER.group!), { untilYears: 5 / 12 }));
    expect(row.kind).toBe("not-comparable");
    expect((row as unknown as { reason: { code: string; detail: string } }).reason).toMatchObject({ code: "record-error" });
    expect((row as unknown as { reason: { detail: string } }).reason.detail).toMatch(/between two custody charges/);
  });
  it("splits the cost by fee type over every period and says the F-101 formula ran", () => {
    const row = rowAt(leumi, accountAtLeumi(named(OFFER.group!), { untilYears: 3 }));
    expect(row.run.formulas).toContain("F-101");
    expect(row.byType.map((x) => x.line).sort()).toEqual(["custody", "trade"]);
    expect(row.byType.reduce((a, x) => a + x.cost!, 0) + row.interaction!).toBeCloseTo(row.horizonCost.value as number, 6);
  });
});
