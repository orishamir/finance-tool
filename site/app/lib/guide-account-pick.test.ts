// D6: makam and a government bond are securities held in the securities account, so the guides price them, and the account itself, on
// each collected house's own lines for their class (F-63), with the member's kind deciding custody on makam (F-14); the guide names the
// house whose run leaves the example plan the most, out of the houses priced (F-80, "On the guide pages").
import { describe, expect, it } from "vitest";
import { isTie, tieThreshold } from "@finance-tool/engine";
import { loadFees, loadParameters, loadProducts, loadRules, today } from "./data.server";
import { accountRuns, type InstrumentFamily } from "./guide-signature-bundle.server";
import { runWith } from "./guide-signature-g2";
import { buildGuidePage } from "./guide.server";
import { buildInstrumentTerms, loadDepositTerms, loadFunds } from "./instruments.server";
import { p05Number } from "./engine";

const p05 = loadParameters().find((p) => p.method_id === "P-05")!;
const rowsOf = (id: string, family: InstrumentFamily) => accountRuns(loadProducts().find((w) => w.id === id)!, family, p05, loadRules(), today());
const makamRows = rowsOf("makam", "makam");
const bondRows = rowsOf("government-bond", "bond");
const brokerageRows = rowsOf("brokerage-account", "securities");
const row = (rows: typeof makamRows, id: string) => rows.find((r) => r.id === id)!;
/** The houses best first by the run's real value at the horizon, which F-80 ranks and ties on. */
const byReal = (rows: typeof makamRows) => [...rows].sort((a, b) => b.real - a.real);

describe("makam is priced like the account that holds it", () => {
  it("is priced at every Israeli bank and broker with a makam trade line, and at no foreign broker", () => {
    const ids = makamRows.map((r) => r.id);
    for (const id of ["leumi", "hapoalim", "discount", "psagot", "ibi", "altshuler-trade"]) expect(ids).toContain(id);
    expect(ids).not.toContain("interactive-brokers");
    for (const r of makamRows) {
      expect(r.bundle.terms.tariff?.buy).toBeDefined();
      expect(["bank", "non-bank"]).toContain(r.bundle.terms.memberKind);
    }
  });
  it("a bank's run charges no custody (BRK-17); a broker's charges its custody and monthly lines", () => {
    const plan = { amount_now: p05Number(p05, "amount_now"), monthly_deposit: p05Number(p05, "monthly_deposit") };
    const run = (id: string) => runWith(row(makamRows, id).bundle, plan, 12 * p05Number(p05, "horizon_years"))!;
    const leumi = run("leumi");
    const altshuler = run("altshuler-trade");
    expect(leumi.fees.custody).toBe(0);
    expect(altshuler.fees.custody).toBeGreaterThan(0);
    expect(altshuler.fees.fixed).toBeGreaterThan(0); // its 80 NIS a month account fee is the account's, on whatever it holds
    expect(altshuler.real).toBeLessThan(leumi.real);
  });
  it("a redemption is priced by the house's line that names it (F-24)", () => {
    for (const r of makamRows) expect(r.bundle.terms.tariff?.redeem).toBeDefined();
    // PEPPER is part of Leumi (its own tariff's redemption line, flat 4 NIS up to 30,000, is no longer a house here)
    expect(makamRows.some((r) => r.id === "pepper")).toBe(false);
    expect(row(makamRows, "psagot").bundle.terms.tariff!.redeem).toMatchObject({ rate: 0.0005, min: 2 });
    // the reduced price of an order placed online is not the redemption's
    expect(row(makamRows, "leumi").bundle.terms.tariff!.redeem).toMatchObject({ rate: 0.001, min: 20 });
    expect(row(makamRows, "leumi").bundle.terms.tariff!.buy).toMatchObject({ rate: 0.00095, min: 18 });
  });
  it("the guide path counts a monthly minimum per charging period (F-14)", () => {
    const custody = (id: string) => row(makamRows, id).bundle.terms.tariff!.custody;
    expect(custody("altshuler-trade")).toMatchObject({ everyMonths: 12, min: 900 });
    expect(custody("excellence")).toMatchObject({ everyMonths: 3, min: 120 });
  });
});

describe("the government bond is priced like the account that holds it", () => {
  it("is priced at more than five houses, each with a buy line for bonds", () => {
    expect(bondRows.length).toBeGreaterThan(5);
    for (const r of bondRows) expect(r.bundle.terms.tariff?.buy).toBeDefined();
  });
});

describe("the securities account is priced at the houses that sell P-05's fund", () => {
  it("are the banks and brokers whose tariff has a line for the class of the fund the account holds", () => {
    const ids = brokerageRows.map((r) => r.id);
    for (const id of ["psagot", "ibi"]) expect(ids).toContain(id);
    expect(ids).toContain("meitav-trade"); // priced at its price list (D56): custody 0.15% a quarter, at least 270 NIS, and a handling fee up to 90 NIS a month
    // the representative fund (5139282) is a tracking fund, `mutual_fund_units`: a tariff with no buy/sell line for that class gives no price, never a free trade (F-63 "No line, no price", MF-26)
    expect(ids).not.toContain("interactive-brokers");
    expect(ids).toContain("leumi"); // its TASE line covers tracking funds by footnote (MF-27; snapshot)
    // One Zero sells a tracking fund only where its manager reports a distribution agreement with it (BRK-38): its record's reports in force
    // do not name P-05's 5139282 (data/fees/one-zero@2026-11-12.json), so it does not sell the account's fund
    expect(ids).not.toContain("one-zero");
    expect(row(brokerageRows, "psagot").bundle.terms.tariff!.buy!.rate).toBeCloseTo(0.0007, 8);
  });
});

describe("the guides name the house that leaves the example plan the most", () => {
  for (const [id, rows] of [["makam", makamRows], ["government-bond", bondRows]] as const) {
    it(`${id}: the pick counts the houses priced and its trade line is the house's own`, () => {
      const own = buildGuidePage(id)!.bundle!;
      expect(own.pick!.count.value).toBe(rows.length);
      expect(own.feeValues.tradeRate?.own).toBeTruthy();
    });
  }
  it("government bond: a house's own line for bonds (F-63, Psagot's tariff, 4(א)1)", () => {
    const own = buildGuidePage("government-bond")!.bundle!;
    expect(own.pick!.id).toBe("psagot");
    expect(own.terms.tariff!.buy).toEqual({ rate: 0.0006, min: 2 });
    expect(row(bondRows, "psagot").bundle.terms.tariff!.buy).toEqual(own.terms.tariff!.buy);
    expect(own.feeValues.tradeRate?.value).toBe(0.06);
    expect(own.pick!.tied).toBeUndefined();
  });
  it("makam: the guide's redemption line is its house's, and names that house", () => {
    const own = buildGuidePage("makam")!.bundle!;
    // Psagot's redemption line (its tariff), the house the guide names
    expect(own.pick!.id).toBe("psagot");
    expect(own.terms.tariff!.redeem).toMatchObject({ rate: 0.0005, min: 2 });
    expect(own.feeValues.redeemRate?.own).toBe(own.feeValues.tradeRate?.own);
  });
  it("makam: Psagot alone on top once PEPPER is part of Leumi, and the page names no tie (F-80, P-01)", () => {
    const own = buildGuidePage("makam")!.bundle!;
    const rows = byReal(makamRows);
    const tied = rows.filter((r) => isTie(rows[0]!.real, r.real, tieThreshold(loadParameters())));
    expect(tied.map((r) => r.id)).toEqual(["psagot"]);
    expect(own.pick!.id).toBe("psagot");
    expect(own.pick!.tied).toBeUndefined();
  });
  it("names no bank on a money-market fund: the fees are the law's zero (MF-26, MF-71, BRK-17)", () => {
    const own = buildGuidePage("money-market-fund-daily")!.bundle!;
    expect(own.pick).toBeUndefined();
    expect(loadProducts().find((w) => w.id === "money-market-fund-daily")).toHaveProperty("held_in");
    expect(own.feeValues.tradeRate?.value).toBe(0);
    expect(own.feeValues.tradeRate?.own).toBeUndefined();
    expect(own.feeValues.custodyRate?.own).toBeUndefined();
  });
  it("the securities account's page is the study-fund page's pick", () => {
    const own = buildGuidePage("brokerage-account")!.bundle!;
    const other = buildGuidePage("keren-hishtalmut")!.signature!;
    expect(own.pick!.id).toBe("psagot");
    expect(own.pick!.count.value).toBe(other.facts.brokerCount!.value);
    expect(own.feeValues.tradeRate?.own).toBeTruthy();
  });
});

describe("the P-05 path carries the member's kind (F-14)", () => {
  it("makam on P-05's bank tariff runs as at a bank", () => {
    const sources = { fees: loadFees(), funds: loadFunds(), deposits: loadDepositTerms(), rules: loadRules(), today: today() };
    const built = buildInstrumentTerms("makam", "makam", p05.instruments?.makam, sources);
    if (!("terms" in built)) throw new Error(built.missing.join("; "));
    expect(built.terms.memberKind).toBe("bank");
  });
});
